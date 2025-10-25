-- Job Posting & Discovery System - RPC Functions
-- Run in Supabase SQL editor to create functions for jobs & applications

-- Helper: Haversine distance in KM
CREATE OR REPLACE FUNCTION public.haversine_km(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision AS $$
DECLARE
  dlat double precision := radians(lat2 - lat1);
  dlon double precision := radians(lon2 - lon1);
  a double precision := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  c double precision := 2 * atan2(sqrt(a), sqrt(1-a));
BEGIN
  RETURN 6371.0 * c; -- Earth's radius in KM
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 1) create_job(job_data jsonb) → job_id
CREATE OR REPLACE FUNCTION public.create_job(job_data jsonb)
RETURNS uuid AS $$
DECLARE
  uid uuid := auth.uid();
  new_job_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.jobs (
    user_id,
    title,
    description,
    category,
    professional_types,
    date,
    end_date,
    time_slots,
    urgency,
    status,
    approved,
    location_city,
    location_state,
    location_pin_code,
    location_address,
    location_lat,
    location_lng,
    budget_min,
    budget_max,
    budget_currency,
    budget_type,
    budget_is_negotiable,
    expires_at
  ) VALUES (
    uid,
    job_data->>'title',
    job_data->>'description',
    job_data->>'category',
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(job_data->'professional_types')), ARRAY[]::text[]),
    (job_data->>'date')::date,
    NULLIF(job_data->>'end_date','')::date,
    COALESCE(job_data->'time_slots','[]'::jsonb),
    COALESCE(job_data->>'urgency','Normal'),
    COALESCE(job_data->>'status','active'),
    COALESCE((job_data->>'approved')::boolean, true),
    job_data->>'location_city',
    job_data->>'location_state',
    job_data->>'location_pin_code',
    job_data->>'location_address',
    NULLIF(job_data->>'location_lat','')::double precision,
    NULLIF(job_data->>'location_lng','')::double precision,
    NULLIF(job_data->>'budget_min','')::numeric,
    NULLIF(job_data->>'budget_max','')::numeric,
    COALESCE(job_data->>'budget_currency','INR'),
    COALESCE(job_data->>'budget_type','fixed'),
    COALESCE((job_data->>'budget_is_negotiable')::boolean, false),
    NULLIF(job_data->>'expires_at','')::timestamptz
  ) RETURNING id INTO new_job_id;

  RETURN new_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2) update_job(job_id, job_data jsonb) → success
CREATE OR REPLACE FUNCTION public.update_job(job_id uuid, job_data jsonb)
RETURNS boolean AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Ensure ownership
  IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE id = job_id AND user_id = uid) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.jobs SET
    title = COALESCE(job_data->>'title', title),
    description = COALESCE(job_data->>'description', description),
    category = COALESCE(job_data->>'category', category),
    professional_types = COALESCE(ARRAY(SELECT jsonb_array_elements_text(job_data->'professional_types')), professional_types),
    date = COALESCE(NULLIF(job_data->>'date','')::date, date),
    end_date = COALESCE(NULLIF(job_data->>'end_date','')::date, end_date),
    time_slots = COALESCE(job_data->'time_slots', time_slots),
    urgency = COALESCE(job_data->>'urgency', urgency),
    status = COALESCE(job_data->>'status', status),
    approved = COALESCE((job_data->>'approved')::boolean, approved),
    location_city = COALESCE(job_data->>'location_city', location_city),
    location_state = COALESCE(job_data->>'location_state', location_state),
    location_pin_code = COALESCE(job_data->>'location_pin_code', location_pin_code),
    location_address = COALESCE(job_data->>'location_address', location_address),
    location_lat = COALESCE(NULLIF(job_data->>'location_lat','')::double precision, location_lat),
    location_lng = COALESCE(NULLIF(job_data->>'location_lng','')::double precision, location_lng),
    budget_min = COALESCE(NULLIF(job_data->>'budget_min','')::numeric, budget_min),
    budget_max = COALESCE(NULLIF(job_data->>'budget_max','')::numeric, budget_max),
    budget_currency = COALESCE(job_data->>'budget_currency', budget_currency),
    budget_type = COALESCE(job_data->>'budget_type', budget_type),
    budget_is_negotiable = COALESCE((job_data->>'budget_is_negotiable')::boolean, budget_is_negotiable),
    expires_at = COALESCE(NULLIF(job_data->>'expires_at','')::timestamptz, expires_at),
    updated_at = now()
  WHERE id = job_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3) get_nearby_jobs(lat, lng, radius_km, filters jsonb) → jobs[] with distance
CREATE OR REPLACE FUNCTION public.get_nearby_jobs(
  lat double precision,
  lng double precision,
  radius_km numeric,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  professional_types text[],
  date date,
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
  distance_km double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.description,
    j.category,
    j.professional_types,
    j.date,
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
    public.haversine_km(lat, lng, j.location_lat, j.location_lng) AS distance_km
  FROM public.jobs j
  WHERE j.approved = true
    AND j.status = 'active'
    AND j.location_lat IS NOT NULL
    AND j.location_lng IS NOT NULL
    AND public.haversine_km(lat, lng, j.location_lat, j.location_lng) <= COALESCE(radius_km, 25)
    -- Filter: professional_types overlap
    AND (
      NOT filters ? 'professional_types' OR 
      j.professional_types && ARRAY(SELECT jsonb_array_elements_text(filters->'professional_types'))
    )
    -- Filter: urgency
    AND (
      NOT filters ? 'urgency' OR j.urgency = filters->>'urgency'
    )
    -- Filter: date range
    AND (
      NOT filters ? 'date_start' OR j.date >= (filters->>'date_start')::date
    )
    AND (
      NOT filters ? 'date_end' OR j.date <= (filters->>'date_end')::date
    )
    -- Filter: budget range
    AND (
      NOT filters ? 'budget_min' OR j.budget_min >= (filters->>'budget_min')::numeric
    )
    AND (
      NOT filters ? 'budget_max' OR j.budget_max <= (filters->>'budget_max')::numeric
    )
  ORDER BY distance_km ASC, j.date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4) search_jobs(query, filters) → jobs[]
CREATE OR REPLACE FUNCTION public.search_jobs(
  query text,
  filters jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  professional_types text[],
  date date,
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
  expires_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.description,
    j.category,
    j.professional_types,
    j.date,
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
    j.expires_at
  FROM public.jobs j
  WHERE j.approved = true
    AND j.status = 'active'
    AND (
      query IS NULL OR query = '' OR 
      to_tsvector('english', coalesce(j.title,'') || ' ' || coalesce(j.description,'')) @@ plainto_tsquery('english', query)
    )
    -- Filter by category
    AND (
      NOT filters ? 'category' OR j.category = filters->>'category'
    )
    -- Filter by professional types
    AND (
      NOT filters ? 'professional_types' OR 
      j.professional_types && ARRAY(SELECT jsonb_array_elements_text(filters->'professional_types'))
    )
    -- Filter: date range
    AND (
      NOT filters ? 'date_start' OR j.date >= (filters->>'date_start')::date
    )
    AND (
      NOT filters ? 'date_end' OR j.date <= (filters->>'date_end')::date
    )
  ORDER BY j.date ASC, j.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5) apply_to_job(job_id, application_data jsonb) → application_id
CREATE OR REPLACE FUNCTION public.apply_to_job(job_id uuid, application_data jsonb)
RETURNS uuid AS $$
DECLARE
  uid uuid := auth.uid();
  new_app_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.job_applications (
    job_id,
    applicant_id,
    message,
    proposed_rate,
    currency
  ) VALUES (
    job_id,
    uid,
    application_data->>'message',
    NULLIF(application_data->>'proposed_rate','')::numeric,
    COALESCE(application_data->>'currency','INR')
  ) RETURNING id INTO new_app_id;

  RETURN new_app_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6) get_job_applications(job_id) → applications[]
CREATE OR REPLACE FUNCTION public.get_job_applications(job_id uuid)
RETURNS SETOF public.job_applications AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.user_id = uid
  ) AND NOT EXISTS (
    SELECT 1 FROM public.job_applications a WHERE a.job_id = job_id AND a.applicant_id = uid
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT * FROM public.job_applications
  WHERE job_applications.job_id = job_id
  ORDER BY applied_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7) update_application_status(application_id, status) → success
CREATE OR REPLACE FUNCTION public.update_application_status(application_id uuid, new_status text)
RETURNS boolean AS $$
DECLARE
  uid uuid := auth.uid();
  job_owner uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT j.user_id INTO job_owner
  FROM public.jobs j
  JOIN public.job_applications a ON a.job_id = j.id
  WHERE a.id = application_id;

  IF job_owner IS NULL OR job_owner <> uid THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.job_applications SET status = new_status, updated_at = now()
  WHERE id = application_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8) get_my_jobs(status_filter) → jobs[] for current user
CREATE OR REPLACE FUNCTION public.get_my_jobs(status_filter text DEFAULT NULL)
RETURNS SETOF public.jobs AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT * FROM public.jobs
  WHERE user_id = uid
    AND (status_filter IS NULL OR status = status_filter)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;