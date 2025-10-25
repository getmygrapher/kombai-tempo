-- Profile Management RPC Functions
-- Advanced functions for ratings, reviews, analytics, and profile operations

-- ============================================================================
-- RATINGS & REVIEWS FUNCTIONS
-- ============================================================================

-- 1) Submit a rating and review
CREATE OR REPLACE FUNCTION public.submit_rating(
  professional_id_param uuid,
  job_id_param uuid,
  rating_param integer,
  review_title_param text,
  review_text_param text,
  professionalism_rating_param integer DEFAULT NULL,
  quality_rating_param integer DEFAULT NULL,
  punctuality_rating_param integer DEFAULT NULL,
  communication_rating_param integer DEFAULT NULL,
  value_rating_param integer DEFAULT NULL,
  media_urls_param text[] DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  rating_id uuid;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if user already rated this professional for this job
  IF EXISTS (
    SELECT 1 FROM public.ratings
    WHERE professional_id = professional_id_param
      AND client_id = uid
      AND (job_id_param IS NULL OR job_id = job_id_param)
  ) THEN
    RAISE EXCEPTION 'You have already rated this professional for this job';
  END IF;

  -- Insert rating
  INSERT INTO public.ratings (
    professional_id,
    client_id,
    job_id,
    rating,
    review_title,
    review_text,
    professionalism_rating,
    quality_rating,
    punctuality_rating,
    communication_rating,
    value_rating,
    media_urls,
    is_verified,
    verified_job_completion
  )
  VALUES (
    professional_id_param,
    uid,
    job_id_param,
    rating_param,
    review_title_param,
    review_text_param,
    professionalism_rating_param,
    quality_rating_param,
    punctuality_rating_param,
    communication_rating_param,
    value_rating_param,
    media_urls_param,
    job_id_param IS NOT NULL,
    job_id_param IS NOT NULL
  )
  RETURNING id INTO rating_id;

  -- Return success with rating ID
  result := jsonb_build_object(
    'success', true,
    'rating_id', rating_id,
    'message', 'Rating submitted successfully'
  );

  RETURN result;
END;
$$;

-- 2) Get ratings for a professional with pagination
CREATE OR REPLACE FUNCTION public.get_professional_ratings(
  professional_id_param uuid,
  limit_param integer DEFAULT 10,
  offset_param integer DEFAULT 0,
  sort_by text DEFAULT 'recent' -- 'recent', 'highest', 'lowest', 'helpful'
)
RETURNS TABLE (
  id uuid,
  client_name text,
  client_avatar text,
  rating integer,
  review_title text,
  review_text text,
  professionalism_rating integer,
  quality_rating integer,
  punctuality_rating integer,
  communication_rating integer,
  value_rating integer,
  media_urls text[],
  response_text text,
  response_at timestamptz,
  helpful_count integer,
  not_helpful_count integer,
  is_verified boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    COALESCE(p.full_name, 'Anonymous') as client_name,
    p.avatar_url as client_avatar,
    r.rating,
    r.review_title,
    r.review_text,
    r.professionalism_rating,
    r.quality_rating,
    r.punctuality_rating,
    r.communication_rating,
    r.value_rating,
    r.media_urls,
    r.response_text,
    r.response_at,
    r.helpful_count,
    r.not_helpful_count,
    r.is_verified,
    r.created_at
  FROM public.ratings r
  LEFT JOIN public.profiles p ON p.id = r.client_id
  WHERE r.professional_id = professional_id_param
    AND r.is_visible = true
    AND r.is_flagged = false
  ORDER BY
    CASE 
      WHEN sort_by = 'recent' THEN r.created_at
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'highest' THEN r.rating
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'lowest' THEN r.rating
      ELSE NULL
    END ASC,
    CASE 
      WHEN sort_by = 'helpful' THEN r.helpful_count
      ELSE NULL
    END DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- 3) Respond to a rating (professional only)
CREATE OR REPLACE FUNCTION public.respond_to_rating(
  rating_id_param uuid,
  response_text_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  prof_id uuid;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get professional_id from rating
  SELECT professional_id INTO prof_id
  FROM public.ratings
  WHERE id = rating_id_param;

  -- Check if current user is the professional
  IF prof_id != uid THEN
    RAISE EXCEPTION 'You can only respond to ratings for your own profile';
  END IF;

  -- Update with response
  UPDATE public.ratings
  SET 
    response_text = response_text_param,
    response_at = now(),
    updated_at = now()
  WHERE id = rating_id_param;

  result := jsonb_build_object(
    'success', true,
    'message', 'Response added successfully'
  );

  RETURN result;
END;
$$;

-- 4) Mark review as helpful/not helpful
CREATE OR REPLACE FUNCTION public.mark_review_helpful(
  review_id_param uuid,
  is_helpful_param boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert or update helpfulness
  INSERT INTO public.review_helpfulness (review_id, user_id, is_helpful)
  VALUES (review_id_param, uid, is_helpful_param)
  ON CONFLICT (review_id, user_id)
  DO UPDATE SET 
    is_helpful = is_helpful_param,
    created_at = now();

  -- Update counts in ratings table
  UPDATE public.ratings
  SET 
    helpful_count = (
      SELECT COUNT(*) 
      FROM public.review_helpfulness 
      WHERE review_id = review_id_param AND is_helpful = true
    ),
    not_helpful_count = (
      SELECT COUNT(*) 
      FROM public.review_helpfulness 
      WHERE review_id = review_id_param AND is_helpful = false
    ),
    updated_at = now()
  WHERE id = review_id_param;

  result := jsonb_build_object(
    'success', true,
    'message', 'Feedback recorded'
  );

  RETURN result;
END;
$$;

-- ============================================================================
-- PROFILE ANALYTICS FUNCTIONS
-- ============================================================================

-- 5) Track profile view
CREATE OR REPLACE FUNCTION public.track_profile_view_event(
  professional_id_param uuid,
  source_param text DEFAULT NULL,
  referrer_url_param text DEFAULT NULL,
  device_type_param text DEFAULT NULL,
  session_id_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  view_id uuid;
  result jsonb;
BEGIN
  -- Insert view record (anonymous allowed)
  INSERT INTO public.profile_views (
    professional_id,
    viewer_id,
    session_id,
    source,
    referrer_url,
    device_type
  )
  VALUES (
    professional_id_param,
    uid,
    session_id_param,
    source_param,
    referrer_url_param,
    device_type_param
  )
  RETURNING id INTO view_id;

  result := jsonb_build_object(
    'success', true,
    'view_id', view_id
  );

  RETURN result;
END;
$$;

-- 6) Get profile analytics for professional
CREATE OR REPLACE FUNCTION public.get_profile_analytics_data(
  date_range_days integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  result jsonb;
  analytics_data record;
  view_trend jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get analytics summary
  SELECT INTO analytics_data
    pa.total_views,
    pa.unique_viewers,
    pa.views_this_week,
    pa.views_this_month,
    pa.average_session_duration,
    pa.profile_saves_count,
    pa.contact_requests_count,
    pa.conversion_rate,
    pa.average_rating,
    pa.total_reviews,
    pa.rating_distribution,
    pa.profile_completion_percent,
    pa.trending_score,
    pa.average_response_time,
    pa.response_rate
  FROM public.profile_analytics pa
  WHERE pa.professional_id = uid;

  -- Get view trend (daily breakdown)
  SELECT INTO view_trend
    jsonb_agg(
      jsonb_build_object(
        'date', date_trunc('day', viewed_at)::date,
        'views', COUNT(*)
      )
      ORDER BY date_trunc('day', viewed_at)::date
    )
  FROM public.profile_views
  WHERE professional_id = uid
    AND viewed_at >= now() - (date_range_days || ' days')::interval
  GROUP BY date_trunc('day', viewed_at)::date;

  -- Build result
  result := jsonb_build_object(
    'summary', row_to_json(analytics_data),
    'view_trend', COALESCE(view_trend, '[]'::jsonb),
    'period_days', date_range_days
  );

  RETURN result;
END;
$$;

-- 7) Calculate and update profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  completion_score integer := 0;
  profile_data record;
  prof_profile_data record;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get profile data
  SELECT * INTO profile_data FROM public.profiles WHERE id = uid;
  SELECT * INTO prof_profile_data FROM public.professional_profiles WHERE user_id = uid;

  -- Calculate score (each field = points)
  -- Basic profile (40 points max)
  IF profile_data.full_name IS NOT NULL AND length(profile_data.full_name) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  IF profile_data.avatar_url IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  IF profile_data.phone IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;

  -- Professional profile (60 points max)
  IF prof_profile_data.selected_category IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  IF prof_profile_data.selected_type IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  IF prof_profile_data.experience_level IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  IF prof_profile_data.specializations IS NOT NULL AND array_length(prof_profile_data.specializations, 1) > 0 THEN
    completion_score := completion_score + 5;
  END IF;
  IF prof_profile_data.pricing IS NOT NULL THEN
    completion_score := completion_score + 10;
  END IF;
  IF prof_profile_data.equipment IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;
  IF prof_profile_data.city IS NOT NULL AND prof_profile_data.state IS NOT NULL THEN
    completion_score := completion_score + 5;
  END IF;

  -- Portfolio (bonus 10 points)
  IF EXISTS (SELECT 1 FROM public.portfolio_items WHERE user_id = uid AND is_visible = true) THEN
    completion_score := completion_score + 10;
  END IF;

  -- Reviews (bonus 10 points)
  IF EXISTS (SELECT 1 FROM public.ratings WHERE professional_id = uid LIMIT 1) THEN
    completion_score := completion_score + 5;
  END IF;

  -- Cap at 100
  completion_score := LEAST(completion_score, 100);

  -- Update analytics table
  UPDATE public.profile_analytics
  SET 
    profile_completion_percent = completion_score,
    updated_at = now()
  WHERE professional_id = uid;

  RETURN completion_score;
END;
$$;

-- ============================================================================
-- SAVED PROFILES FUNCTIONS
-- ============================================================================

-- 8) Save/unsave a profile
CREATE OR REPLACE FUNCTION public.toggle_save_profile(
  professional_id_param uuid,
  note_param text DEFAULT NULL,
  collection_name_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  is_saved boolean;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check if already saved
  SELECT EXISTS (
    SELECT 1 FROM public.saved_profiles
    WHERE user_id = uid AND professional_id = professional_id_param
  ) INTO is_saved;

  IF is_saved THEN
    -- Unsave
    DELETE FROM public.saved_profiles
    WHERE user_id = uid AND professional_id = professional_id_param;
    
    -- Update count in analytics
    UPDATE public.profile_analytics
    SET 
      profile_saves_count = GREATEST(profile_saves_count - 1, 0),
      updated_at = now()
    WHERE professional_id = professional_id_param;

    result := jsonb_build_object(
      'success', true,
      'is_saved', false,
      'message', 'Profile removed from saved'
    );
  ELSE
    -- Save
    INSERT INTO public.saved_profiles (user_id, professional_id, note, collection_name)
    VALUES (uid, professional_id_param, note_param, collection_name_param);
    
    -- Update count in analytics
    UPDATE public.profile_analytics
    SET 
      profile_saves_count = profile_saves_count + 1,
      updated_at = now()
    WHERE professional_id = professional_id_param;

    result := jsonb_build_object(
      'success', true,
      'is_saved', true,
      'message', 'Profile saved successfully'
    );
  END IF;

  RETURN result;
END;
$$;

-- 9) Get user's saved profiles
CREATE OR REPLACE FUNCTION public.get_saved_profiles(
  collection_name_param text DEFAULT NULL,
  limit_param integer DEFAULT 20,
  offset_param integer DEFAULT 0
)
RETURNS TABLE (
  professional_id uuid,
  professional_name text,
  professional_avatar text,
  professional_type text,
  professional_category text,
  city text,
  state text,
  average_rating decimal,
  total_reviews integer,
  note text,
  collection_name text,
  saved_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    sp.professional_id,
    p.full_name as professional_name,
    p.avatar_url as professional_avatar,
    pp.selected_type as professional_type,
    pp.selected_category as professional_category,
    pp.city,
    pp.state,
    pa.average_rating,
    pa.total_reviews,
    sp.note,
    sp.collection_name,
    sp.saved_at
  FROM public.saved_profiles sp
  JOIN public.profiles p ON p.id = sp.professional_id
  LEFT JOIN public.professional_profiles pp ON pp.user_id = sp.professional_id
  LEFT JOIN public.profile_analytics pa ON pa.professional_id = sp.professional_id
  WHERE sp.user_id = uid
    AND (collection_name_param IS NULL OR sp.collection_name = collection_name_param)
  ORDER BY sp.saved_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- ============================================================================
-- CONTACT REQUESTS FUNCTIONS
-- ============================================================================

-- 10) Create contact request
CREATE OR REPLACE FUNCTION public.create_contact_request(
  professional_id_param uuid,
  job_id_param uuid DEFAULT NULL,
  request_message_param text DEFAULT NULL,
  contact_method_param text DEFAULT 'message'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  request_id uuid;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Insert contact request
  INSERT INTO public.contact_requests (
    professional_id,
    requester_id,
    job_id,
    request_message,
    contact_method
  )
  VALUES (
    professional_id_param,
    uid,
    job_id_param,
    request_message_param,
    contact_method_param
  )
  ON CONFLICT (professional_id, requester_id, job_id)
  DO UPDATE SET
    request_message = request_message_param,
    contact_method = contact_method_param,
    status = 'pending',
    created_at = now()
  RETURNING id INTO request_id;

  -- Update analytics
  UPDATE public.profile_analytics
  SET 
    contact_requests_count = contact_requests_count + 1,
    updated_at = now()
  WHERE professional_id = professional_id_param;

  result := jsonb_build_object(
    'success', true,
    'request_id', request_id,
    'message', 'Contact request sent'
  );

  RETURN result;
END;
$$;

-- 11) Respond to contact request
CREATE OR REPLACE FUNCTION public.respond_to_contact_request(
  request_id_param uuid,
  status_param text,
  response_message_param text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  prof_id uuid;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Verify ownership
  SELECT professional_id INTO prof_id
  FROM public.contact_requests
  WHERE id = request_id_param;

  IF prof_id != uid THEN
    RAISE EXCEPTION 'Unauthorized to respond to this request';
  END IF;

  -- Update request
  UPDATE public.contact_requests
  SET 
    status = status_param,
    response_message = response_message_param,
    responded_at = now(),
    contact_shared = (status_param = 'accepted')
  WHERE id = request_id_param;

  result := jsonb_build_object(
    'success', true,
    'status', status_param,
    'message', 'Response sent'
  );

  RETURN result;
END;
$$;

-- ============================================================================
-- PORTFOLIO FUNCTIONS
-- ============================================================================

-- 12) Add portfolio item
CREATE OR REPLACE FUNCTION public.add_portfolio_item(
  title_param text,
  description_param text,
  image_url_param text,
  thumbnail_url_param text DEFAULT NULL,
  category_param text DEFAULT NULL,
  tags_param text[] DEFAULT '{}',
  exif_data_param jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  item_id uuid;
  max_order integer;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get max display order
  SELECT COALESCE(MAX(display_order), -1) + 1 INTO max_order
  FROM public.portfolio_items
  WHERE user_id = uid;

  -- Insert portfolio item
  INSERT INTO public.portfolio_items (
    user_id,
    title,
    description,
    image_url,
    thumbnail_url,
    category,
    tags,
    exif_data,
    display_order
  )
  VALUES (
    uid,
    title_param,
    description_param,
    image_url_param,
    thumbnail_url_param,
    category_param,
    tags_param,
    exif_data_param,
    max_order
  )
  RETURNING id INTO item_id;

  result := jsonb_build_object(
    'success', true,
    'item_id', item_id,
    'message', 'Portfolio item added'
  );

  RETURN result;
END;
$$;

-- 13) Reorder portfolio items
CREATE OR REPLACE FUNCTION public.reorder_portfolio_items(
  item_ids_ordered uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  item_id uuid;
  idx integer;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Update display order for each item
  FOR idx IN 1 .. array_length(item_ids_ordered, 1)
  LOOP
    item_id := item_ids_ordered[idx];
    UPDATE public.portfolio_items
    SET display_order = idx - 1
    WHERE id = item_id AND user_id = uid;
  END LOOP;

  result := jsonb_build_object(
    'success', true,
    'message', 'Portfolio reordered'
  );

  RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.submit_rating TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_professional_ratings TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_rating TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_review_helpful TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_profile_view_event TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_analytics_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_profile_completion TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_save_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_saved_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_contact_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_contact_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_portfolio_item TO authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_portfolio_items TO authenticated;
