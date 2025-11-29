-- 1) Search professionals with full-text search and proximity
CREATE OR REPLACE FUNCTION public.search_professionals(
  query_text text DEFAULT '',
  user_lat double precision DEFAULT NULL,
  user_lng double precision DEFAULT NULL,
  radius_km integer DEFAULT 25,
  filters jsonb DEFAULT '{}'::jsonb,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
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
  distance_km numeric,
  relevance_score real
) AS $$
DECLARE
  user_location geography;
  search_query tsquery;
BEGIN
  -- Create search query
  IF query_text IS NOT NULL AND query_text != '' THEN
    search_query := plainto_tsquery('english', query_text);
  END IF;
  
  -- Create geography point from user coordinates if provided
  IF user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
    user_location := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
  END IF;
  
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
    CASE 
      WHEN user_location IS NOT NULL AND p.location IS NOT NULL THEN
        ROUND((ST_Distance(p.location, user_location) / 1000)::numeric, 2)
      ELSE NULL
    END as distance_km,
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(p.search_vector, search_query)
      ELSE 0
    END as relevance_score
  FROM public.professional_profiles p
  WHERE 
    -- Text search filter
    (
      search_query IS NULL OR 
      p.search_vector @@ search_query
    )
    -- Proximity filter
    AND (
      user_location IS NULL OR 
      p.location IS NULL OR
      ST_DWithin(p.location, user_location, radius_km * 1000)
    )
    -- Professional type filter
    AND (
      (filters->>'selected_type' IS NULL) OR 
      (p.selected_type = filters->>'selected_type')
    )
    -- Verified filter
    AND (
      (filters->>'is_verified' IS NULL) OR 
      (COALESCE(p.is_verified, false) = (filters->>'is_verified')::boolean)
    )
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN ts_rank(p.search_vector, search_query) ELSE 0 END DESC,
    CASE WHEN user_location IS NOT NULL AND p.location IS NOT NULL THEN ST_Distance(p.location, user_location) ELSE 999999999 END ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2) Search poses with full-text search
CREATE OR REPLACE FUNCTION public.search_poses(
  query_text text DEFAULT '',
  filters jsonb DEFAULT '{}'::jsonb,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  photographer_id uuid,
  title text,
  posing_tips text,
  story_behind text,
  difficulty_level text,
  people_count integer,
  category text,
  mood_emotion text,
  image_url text,
  thumbnail_url text,
  medium_url text,
  location_type text,
  lighting_setup text,
  likes_count integer,
  saves_count integer,
  views_count integer,
  comments_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  relevance_score real
) AS $$
DECLARE
  search_query tsquery;
BEGIN
  -- Create search query
  IF query_text IS NOT NULL AND query_text != '' THEN
    search_query := plainto_tsquery('english', query_text);
  END IF;
  
  RETURN QUERY
  SELECT 
    cp.id,
    cp.photographer_id,
    cp.title,
    cp.posing_tips,
    cp.story_behind,
    cp.difficulty_level,
    cp.people_count,
    cp.category,
    cp.mood_emotion,
    cp.image_url,
    cp.thumbnail_url,
    cp.medium_url,
    cp.location_type,
    cp.lighting_setup,
    cp.likes_count,
    cp.saves_count,
    cp.views_count,
    cp.comments_count,
    cp.created_at,
    cp.updated_at,
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(cp.search_vector, search_query)
      ELSE 0
    END as relevance_score
  FROM public.community_poses cp
  WHERE 
    cp.is_approved = true
    AND cp.moderation_status = 'approved'
    -- Text search filter
    AND (
      search_query IS NULL OR 
      cp.search_vector @@ search_query
    )
    -- Category filter
    AND (
      (filters->>'category' IS NULL) OR 
      (cp.category = filters->>'category')
    )
    -- Difficulty filter
    AND (
      (filters->>'difficulty_level' IS NULL) OR 
      (cp.difficulty_level = filters->>'difficulty_level')
    )
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN ts_rank(cp.search_vector, search_query) ELSE 0 END DESC,
    cp.likes_count DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3) Get search suggestions (autocomplete)
CREATE OR REPLACE FUNCTION public.get_search_suggestions(
  partial_query text,
  suggestion_type text DEFAULT 'all' -- 'all', 'professionals', 'poses'
)
RETURNS TABLE (
  suggestion text,
  type text,
  count bigint
) AS $$
BEGIN
  -- Return suggestions based on type
  IF suggestion_type = 'professionals' OR suggestion_type = 'all' THEN
    RETURN QUERY
    SELECT DISTINCT
      p.selected_type as suggestion,
      'professional_type'::text as type,
      COUNT(*) OVER (PARTITION BY p.selected_type) as count
    FROM public.professional_profiles p
    WHERE p.selected_type ILIKE partial_query || '%'
    LIMIT 5;
    
    RETURN QUERY
    SELECT DISTINCT
      unnest(p.specializations) as suggestion,
      'specialization'::text as type,
      COUNT(*) OVER (PARTITION BY unnest(p.specializations)) as count
    FROM public.professional_profiles p
    WHERE EXISTS (
      SELECT 1 FROM unnest(p.specializations) s 
      WHERE s ILIKE partial_query || '%'
    )
    LIMIT 5;
  END IF;
  
  IF suggestion_type = 'poses' OR suggestion_type = 'all' THEN
    RETURN QUERY
    SELECT DISTINCT
      cp.category as suggestion,
      'category'::text as type,
      COUNT(*) OVER (PARTITION BY cp.category) as count
    FROM public.community_poses cp
    WHERE cp.category ILIKE partial_query || '%'
      AND cp.is_approved = true
      AND cp.moderation_status = 'approved'
    LIMIT 5;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- 4) Enhanced search_jobs function with full-text search
CREATE OR REPLACE FUNCTION public.search_jobs(
  query text DEFAULT '',
  filters jsonb DEFAULT '{}'::jsonb,
  user_lat double precision DEFAULT NULL,
  user_lng double precision DEFAULT NULL,
  radius_km integer DEFAULT 100,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
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
  -- Create geography point from user coordinates if provided
  IF user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
    user_location := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;
  END IF;
  
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
    CASE 
      WHEN user_location IS NOT NULL AND j.location IS NOT NULL THEN
        ROUND((ST_Distance(j.location, user_location) / 1000)::numeric, 2)
      ELSE NULL
    END as distance_km
  FROM public.jobs j
  WHERE 
    j.status = 'active' 
    AND j.approved = true
    -- Text search
    AND (
      query = '' OR
      j.title ILIKE '%' || query || '%' OR
      j.description ILIKE '%' || query || '%'
    )
    -- Proximity filter
    AND (
      user_location IS NULL OR 
      j.location IS NULL OR
      ST_DWithin(j.location, user_location, radius_km * 1000)
    )
    -- Category filter
    AND (
      (filters->>'category' IS NULL) OR 
      (j.category = filters->>'category')
    )
    -- Professional types filter
    AND (
      (filters->>'professional_types' IS NULL) OR 
      (j.professional_types && string_to_array(filters->>'professional_types', ','))
    )
    -- Date range filter
    AND (
      (filters->>'date_start' IS NULL) OR 
      (j.date >= (filters->>'date_start')::date)
    )
    AND (
      (filters->>'date_end' IS NULL) OR 
      (j.date <= (filters->>'date_end')::date)
    )
    -- Budget filter
    AND (
      (filters->>'budget_min' IS NULL) OR 
      (j.budget_max >= (filters->>'budget_min')::numeric)
    )
    AND (
      (filters->>'budget_max' IS NULL) OR 
      (j.budget_min <= (filters->>'budget_max')::numeric)
    )
    -- Urgency filter
    AND (
      (filters->>'urgency' IS NULL) OR 
      (j.urgency = filters->>'urgency')
    )
  ORDER BY 
    CASE WHEN user_location IS NOT NULL AND j.location IS NOT NULL THEN ST_Distance(j.location, user_location) ELSE 999999999 END ASC,
    j.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;
