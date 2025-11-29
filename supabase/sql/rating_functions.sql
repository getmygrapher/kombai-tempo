-- Rating & Review System - RPC Functions
-- Functions for submitting and retrieving ratings
-- Works with existing ratings table that uses professional_id and client_id

-- Note: The submit_rating function already exists in profile_view_rpc_functions.sql
-- This file provides additional helper functions

-- 1) Get ratings for a user (as a professional)
CREATE OR REPLACE FUNCTION public.get_user_ratings(
  p_user_id uuid,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0,
  p_verified_only boolean DEFAULT false
)
RETURNS TABLE (
  rating_id uuid,
  rater_user_id uuid,
  rater_name text,
  job_id uuid,
  job_title text,
  rating integer,
  review_text text,
  is_verified boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as rating_id,
    r.client_id as rater_user_id,
    COALESCE(p.full_name, 'Anonymous') as rater_name,
    r.job_id,
    j.title as job_title,
    r.rating,
    r.review_text,
    r.is_verified,
    r.created_at
  FROM public.ratings r
  LEFT JOIN public.profiles p ON r.client_id = p.id
  LEFT JOIN public.jobs j ON r.job_id = j.id
  WHERE r.professional_id = p_user_id
    AND r.is_visible = true
    AND r.is_flagged = false
    AND (NOT p_verified_only OR r.is_verified = true)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- 2) Get rating statistics for a user
CREATE OR REPLACE FUNCTION public.get_rating_stats(
  p_user_id uuid
)
RETURNS TABLE (
  average_rating numeric,
  total_ratings integer,
  rating_distribution jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rs.average_rating,
    rs.total_ratings,
    rs.rating_distribution
  FROM public.rating_stats rs
  WHERE rs.user_id = p_user_id;
  
  -- If no stats found, return zeros
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      0::numeric as average_rating,
      0 as total_ratings,
      '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb as rating_distribution;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3) Check if user can rate another user for a specific job
CREATE OR REPLACE FUNCTION public.can_rate_user(
  p_rated_user_id uuid,
  p_job_id uuid
)
RETURNS TABLE (
  can_rate boolean,
  reason text
) AS $$
DECLARE
  v_job_status text;
  v_is_participant boolean;
  v_already_rated boolean;
BEGIN
  -- Check if rater is the same as rated user
  IF auth.uid() = p_rated_user_id THEN
    RETURN QUERY SELECT false, 'You cannot rate yourself';
    RETURN;
  END IF;
  
  -- Check if job exists and get status
  SELECT status INTO v_job_status
  FROM public.jobs
  WHERE id = p_job_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Job not found';
    RETURN;
  END IF;
  
  -- Check if user was involved in the job
  SELECT EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = p_job_id
      AND (
        j.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.job_applications ja
          WHERE ja.job_id = p_job_id
            AND ja.applicant_id = auth.uid()
            AND ja.status = 'hired'
        )
      )
  ) INTO v_is_participant;
  
  IF NOT v_is_participant THEN
    RETURN QUERY SELECT false, 'You can only rate users you have worked with';
    RETURN;
  END IF;
  
  -- Check if already rated
  SELECT EXISTS (
    SELECT 1 FROM public.ratings
    WHERE job_id = p_job_id
      AND client_id = auth.uid()
      AND professional_id = p_rated_user_id
  ) INTO v_already_rated;
  
  IF v_already_rated THEN
    RETURN QUERY SELECT true, 'You have already rated this user for this job (you can update your rating)';
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY SELECT true, 'You can rate this user';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4) Get ratings given by a user (as a client)
CREATE OR REPLACE FUNCTION public.get_ratings_by_user(
  p_rater_user_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  rating_id uuid,
  rated_user_id uuid,
  rated_user_name text,
  job_id uuid,
  job_title text,
  rating integer,
  review_text text,
  is_verified boolean,
  created_at timestamptz
) AS $$
DECLARE
  v_rater_id uuid;
BEGIN
  -- Use provided user_id or current user
  v_rater_id := COALESCE(p_rater_user_id, auth.uid());
  
  RETURN QUERY
  SELECT 
    r.id as rating_id,
    r.professional_id as rated_user_id,
    COALESCE(p.full_name, 'Anonymous') as rated_user_name,
    r.job_id,
    j.title as job_title,
    r.rating,
    r.review_text,
    r.is_verified,
    r.created_at
  FROM public.ratings r
  LEFT JOIN public.profiles p ON r.professional_id = p.id
  LEFT JOIN public.jobs j ON r.job_id = j.id
  WHERE r.client_id = v_rater_id
    AND r.is_visible = true
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5) Delete a rating (only if user is the one who created it)
CREATE OR REPLACE FUNCTION public.delete_rating(
  p_rating_id uuid
)
RETURNS boolean AS $$
BEGIN
  DELETE FROM public.ratings
  WHERE id = p_rating_id
    AND client_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rating not found or you do not have permission to delete it';
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Update a rating (only if user is the one who created it and within 7 days)
CREATE OR REPLACE FUNCTION public.update_user_rating(
  p_rating_id uuid,
  p_rating integer,
  p_review_text text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_created_at timestamptz;
BEGIN
  -- Validate rating value
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  
  -- Get created_at to check if within 7 days
  SELECT created_at INTO v_created_at
  FROM public.ratings
  WHERE id = p_rating_id
    AND client_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rating not found or you do not have permission to update it';
  END IF;
  
  -- Check if within 7 days
  IF v_created_at < now() - interval '7 days' THEN
    RAISE EXCEPTION 'You can only update ratings within 7 days of creation';
  END IF;
  
  -- Update the rating
  UPDATE public.ratings
  SET 
    rating = p_rating,
    review_text = p_review_text,
    updated_at = now()
  WHERE id = p_rating_id
    AND client_id = auth.uid();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
