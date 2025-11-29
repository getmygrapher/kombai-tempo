-- Enable PostGIS Extension for Geographic Data Types and Proximity Search
-- This migration adds geographic columns to jobs and professional_profiles tables
-- for efficient distance-based queries

-- 1) Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2) Add geography column to jobs table
ALTER TABLE public.jobs 
  ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- 3) Add geography column to professional_profiles table
ALTER TABLE public.professional_profiles 
  ADD COLUMN IF NOT EXISTS location geography(POINT, 4326);

-- 4) Create spatial indexes for efficient proximity queries
CREATE INDEX IF NOT EXISTS idx_jobs_location_geo 
  ON public.jobs USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_profiles_location_geo 
  ON public.professional_profiles USING GIST (location);

-- 5) Create trigger function to update job location from lat/lng
CREATE OR REPLACE FUNCTION update_job_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(
      ST_MakePoint(NEW.location_lng, NEW.location_lat), 
      4326
    )::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6) Create trigger to auto-update job location
DROP TRIGGER IF EXISTS trigger_update_job_location ON public.jobs;
CREATE TRIGGER trigger_update_job_location
  BEFORE INSERT OR UPDATE OF location_lat, location_lng ON public.jobs
  FOR EACH ROW 
  EXECUTE FUNCTION update_job_location();

-- 7) Add lat/lng columns to professional_profiles if they don't exist
ALTER TABLE public.professional_profiles 
  ADD COLUMN IF NOT EXISTS city_lat double precision;

ALTER TABLE public.professional_profiles 
  ADD COLUMN IF NOT EXISTS city_lng double precision;

-- 8) Create trigger function to update profile location from lat/lng
CREATE OR REPLACE FUNCTION update_profile_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Update location from city_lat/city_lng if available
  IF NEW.city_lat IS NOT NULL AND NEW.city_lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(
      ST_MakePoint(NEW.city_lng, NEW.city_lat), 
      4326
    )::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9) Create trigger to auto-update profile location
DROP TRIGGER IF EXISTS trigger_update_profile_location ON public.professional_profiles;
CREATE TRIGGER trigger_update_profile_location
  BEFORE INSERT OR UPDATE OF city_lat, city_lng ON public.professional_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_profile_location();

-- 10) Backfill existing jobs with geography data
UPDATE public.jobs
SET location = ST_SetSRID(
  ST_MakePoint(location_lng, location_lat), 
  4326
)::geography
WHERE location_lat IS NOT NULL 
  AND location_lng IS NOT NULL 
  AND location IS NULL;

-- 11) Backfill existing profiles with geography data (if lat/lng exist)
UPDATE public.professional_profiles
SET location = ST_SetSRID(
  ST_MakePoint(city_lng, city_lat), 
  4326
)::geography
WHERE city_lat IS NOT NULL 
  AND city_lng IS NOT NULL 
  AND location IS NULL;

-- 11) Update get_nearby_jobs function to use PostGIS
CREATE OR REPLACE FUNCTION public.get_nearby_jobs(
  lat double precision,
  lng double precision,
  radius_km integer DEFAULT 25,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  category text,
  professional_types text[],
  date date,
  end_date date,
  time_slots jsonb,
  urgency text,
  status text,
  location_city text,
  location_state text,
  location_pin_code text,
  location_address text,
  location_lat double precision,
  location_lng double precision,
  budget_min numeric,
  budget_max numeric,
  budget_currency text,
  budget_type text,
  budget_is_negotiable boolean,
  view_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  distance_km numeric
) AS $$
DECLARE
  user_location geography;
BEGIN
  -- Create geography point from user coordinates
  user_location := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    j.id,
    j.user_id,
    j.title,
    j.description,
    j.category,
    j.professional_types,
    j.date,
    j.end_date,
    j.time_slots,
    j.urgency,
    j.status,
    j.location_city,
    j.location_state,
    j.location_pin_code,
    j.location_address,
    j.location_lat,
    j.location_lng,
    j.budget_min,
    j.budget_max,
    j.budget_currency,
    j.budget_type,
    j.budget_is_negotiable,
    j.view_count,
    j.created_at,
    j.updated_at,
    j.expires_at,
    ROUND((ST_Distance(j.location, user_location) / 1000)::numeric, 2) as distance_km
  FROM public.jobs j
  WHERE 
    j.status = 'active' 
    AND j.approved = true
    AND j.location IS NOT NULL
    AND ST_DWithin(j.location, user_location, radius_km * 1000)
    -- Apply optional filters
    AND (
      (filters->>'urgency' IS NULL) OR 
      (j.urgency = filters->>'urgency')
    )
    AND (
      (filters->>'date_start' IS NULL) OR 
      (j.date >= (filters->>'date_start')::date)
    )
    AND (
      (filters->>'date_end' IS NULL) OR 
      (j.date <= (filters->>'date_end')::date)
    )
    AND (
      (filters->>'budget_min' IS NULL) OR 
      (j.budget_max >= (filters->>'budget_min')::numeric)
    )
    AND (
      (filters->>'budget_max' IS NULL) OR 
      (j.budget_min <= (filters->>'budget_max')::numeric)
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 12) Create function to search nearby professionals
CREATE OR REPLACE FUNCTION public.get_nearby_professionals(
  lat double precision,
  lng double precision,
  radius_km integer DEFAULT 25,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  selected_type text,
  selected_category text,
  specializations text[],
  city text,
  state text,
  pin_code text,
  city_lat double precision,
  city_lng double precision,
  instagram_handle text,
  portfolio_links text[],
  is_verified boolean,
  created_at timestamptz,
  updated_at timestamptz,
  distance_km numeric
) AS $$
DECLARE
  user_location geography;
BEGIN
  -- Create geography point from user coordinates
  user_location := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.selected_type,
    p.selected_category,
    p.specializations,
    p.city,
    p.state,
    p.pin_code,
    p.city_lat,
    p.city_lng,
    p.instagram_handle,
    p.portfolio_links,
    COALESCE(p.is_verified, false) as is_verified,
    p.created_at,
    p.updated_at,
    ROUND((ST_Distance(p.location, user_location) / 1000)::numeric, 2) as distance_km
  FROM public.professional_profiles p
  WHERE 
    p.location IS NOT NULL
    AND ST_DWithin(p.location, user_location, radius_km * 1000)
    -- Apply optional filters
    AND (
      (filters->>'selected_type' IS NULL) OR 
      (p.selected_type = filters->>'selected_type')
    )
    AND (
      (filters->>'is_verified' IS NULL) OR 
      (COALESCE(p.is_verified, false) = (filters->>'is_verified')::boolean)
    )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql STABLE;
