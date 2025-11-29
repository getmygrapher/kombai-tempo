-- Profile View & Rating System RPC Functions
-- Complete production-ready implementation

-- Drop existing functions if they exist (with CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS public.get_profile_details CASCADE;
DROP FUNCTION IF EXISTS public.get_profile_portfolio CASCADE;
DROP FUNCTION IF EXISTS public.submit_rating CASCADE;
DROP FUNCTION IF EXISTS public.get_professional_ratings CASCADE;
DROP FUNCTION IF EXISTS public.respond_to_rating CASCADE;
DROP FUNCTION IF EXISTS public.mark_review_helpful CASCADE;
DROP FUNCTION IF EXISTS public.track_profile_view_event CASCADE;
DROP FUNCTION IF EXISTS public.toggle_save_profile CASCADE;
DROP FUNCTION IF EXISTS public.get_saved_profiles CASCADE;
DROP FUNCTION IF EXISTS public.create_contact_request CASCADE;
DROP FUNCTION IF EXISTS public.respond_to_contact_request CASCADE;
DROP FUNCTION IF EXISTS public.get_profile_analytics_data CASCADE;
DROP FUNCTION IF EXISTS public.calculate_profile_completion CASCADE;

-- ============================================
-- PROFILE VIEW FUNCTIONS
-- ============================================

-- Function to get complete profile details with ratings and analytics
CREATE OR REPLACE FUNCTION public.get_profile_details(p_profile_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  phone text,
  professional_type text,
  professional_category text,
  city text,
  state text,
  pin_code text,
  work_radius_km numeric,
  experience_level text,
  specializations text[],
  instagram_handle text,
  portfolio_links text[],
  pricing jsonb,
  equipment jsonb,
  additional_locations jsonb,
  average_rating numeric,
  total_reviews integer,
  rating_distribution jsonb,
  total_views integer,
  profile_completion_percent integer,
  is_verified boolean,
  is_top_rated boolean,
  is_featured boolean,
  email_verified boolean,
  phone_verified boolean,
  identity_verified boolean,
  professional_verified boolean,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name,
    p.avatar_url,
    p.phone,
    pp.selected_type as professional_type,
    pp.selected_category as professional_category,
    pp.city,
    pp.state,
    pp.pin_code,
    pp.work_radius_km,
    pp.experience_level,
    pp.specializations,
    pp.instagram_handle,
    pp.portfolio_links,
    pp.pricing,
    pp.equipment,
    pp.additional_locations,
    pa.average_rating,
    pa.total_reviews,
    pa.rating_distribution,
    pa.total_views,
    pa.profile_completion_percent,
    COALESCE(vs.professional_verified, false) as is_verified,
    COALESCE(vs.is_top_rated, false) as is_top_rated,
    COALESCE(vs.is_featured, false) as is_featured,
    COALESCE(vs.email_verified, false) as email_verified,
    COALESCE(vs.phone_verified, false) as phone_verified,
    COALESCE(vs.identity_verified, false) as identity_verified,
    COALESCE(vs.professional_verified, false) as professional_verified,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  LEFT JOIN public.professional_profiles pp ON p.id = pp.user_id
  LEFT JOIN public.profile_analytics pa ON p.id = pa.professional_id
  LEFT JOIN public.verification_status vs ON p.id = vs.user_id
  WHERE p.id = p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get profile portfolio items
CREATE OR REPLACE FUNCTION public.get_profile_portfolio(
  p_profile_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  image_url text,
  thumbnail_url text,
  category text,
  tags text[],
  camera_model text,
  lens_model text,
  exif_data jsonb,
  display_order integer,
  is_featured boolean,
  views_count integer,
  likes_count integer,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pi.id,
    pi.title,
    pi.description,
    pi.image_url,
    pi.thumbnail_url,
    pi.category,
    pi.tags,
    pi.camera_model,
    pi.lens_model,
    pi.exif_data,
    pi.display_order,
    pi.is_featured,
    pi.views_count,
    pi.likes_count,
    pi.created_at
  FROM public.portfolio_items pi
  WHERE pi.user_id = p_profile_id
    AND pi.is_visible = true
  ORDER BY 
    pi.is_featured DESC,
    pi.display_order ASC,
    pi.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RATING & REVIEW FUNCTIONS
-- ============================================

-- Function to submit a rating/review
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
  media_urls_param text[] DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_rating_id uuid;
  v_client_id uuid;
BEGIN
  v_client_id := auth.uid();
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Check if user already reviewed this professional for this job
  IF EXISTS (
    SELECT 1 FROM public.ratings 
    WHERE professional_id = professional_id_param 
      AND client_id = v_client_id 
      AND job_id = job_id_param
  ) THEN
    RAISE EXCEPTION 'You have already reviewed this professional for this job';
  END IF;

  -- Insert the rating
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
  ) VALUES (
    professional_id_param,
    v_client_id,
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
    true,
    true
  ) RETURNING id INTO v_rating_id;

  RETURN jsonb_build_object(
    'success', true,
    'rating_id', v_rating_id,
    'message', 'Review submitted successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get professional ratings with client details
CREATE OR REPLACE FUNCTION public.get_professional_ratings(
  professional_id_param uuid,
  limit_param integer DEFAULT 20,
  offset_param integer DEFAULT 0,
  sort_by text DEFAULT 'recent'
)
RETURNS TABLE (
  id uuid,
  rating integer,
  review_title text,
  review_text text,
  professionalism_rating integer,
  quality_rating integer,
  punctuality_rating integer,
  communication_rating integer,
  value_rating integer,
  media_urls text[],
  is_verified boolean,
  helpful_count integer,
  not_helpful_count integer,
  response_text text,
  response_at timestamptz,
  created_at timestamptz,
  client_name text,
  client_avatar text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.rating,
    r.review_title,
    r.review_text,
    r.professionalism_rating,
    r.quality_rating,
    r.punctuality_rating,
    r.communication_rating,
    r.value_rating,
    r.media_urls,
    r.is_verified,
    r.helpful_count,
    r.not_helpful_count,
    r.response_text,
    r.response_at,
    r.created_at,
    p.full_name as client_name,
    p.avatar_url as client_avatar
  FROM public.ratings r
  LEFT JOIN public.profiles p ON r.client_id = p.id
  WHERE r.professional_id = professional_id_param
    AND r.is_visible = true
    AND r.is_flagged = false
  ORDER BY
    CASE 
      WHEN sort_by = 'recent' THEN r.created_at
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'helpful' THEN r.helpful_count
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'rating_high' THEN r.rating
      ELSE NULL
    END DESC,
    CASE 
      WHEN sort_by = 'rating_low' THEN r.rating
      ELSE NULL
    END ASC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to respond to a rating (for professionals)
CREATE OR REPLACE FUNCTION public.respond_to_rating(
  rating_id_param uuid,
  response_text_param text
)
RETURNS jsonb AS $$
DECLARE
  v_professional_id uuid;
BEGIN
  v_professional_id := auth.uid();
  
  IF v_professional_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.ratings 
    WHERE id = rating_id_param 
      AND professional_id = v_professional_id
  ) THEN
    RAISE EXCEPTION 'Rating not found or unauthorized';
  END IF;

  UPDATE public.ratings
  SET 
    response_text = response_text_param,
    response_at = now(),
    updated_at = now()
  WHERE id = rating_id_param;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Response added successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark review as helpful/not helpful
CREATE OR REPLACE FUNCTION public.mark_review_helpful(
  review_id_param uuid,
  is_helpful_param boolean
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_existing_vote boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  SELECT is_helpful INTO v_existing_vote
  FROM public.review_helpfulness
  WHERE review_id = review_id_param AND user_id = v_user_id;

  IF v_existing_vote IS NOT NULL THEN
    IF v_existing_vote != is_helpful_param THEN
      UPDATE public.review_helpfulness
      SET is_helpful = is_helpful_param
      WHERE review_id = review_id_param AND user_id = v_user_id;
      
      IF is_helpful_param THEN
        UPDATE public.ratings
        SET helpful_count = helpful_count + 1,
            not_helpful_count = not_helpful_count - 1
        WHERE id = review_id_param;
      ELSE
        UPDATE public.ratings
        SET helpful_count = helpful_count - 1,
            not_helpful_count = not_helpful_count + 1
        WHERE id = review_id_param;
      END IF;
    END IF;
  ELSE
    INSERT INTO public.review_helpfulness (review_id, user_id, is_helpful)
    VALUES (review_id_param, v_user_id, is_helpful_param);
    
    IF is_helpful_param THEN
      UPDATE public.ratings
      SET helpful_count = helpful_count + 1
      WHERE id = review_id_param;
    ELSE
      UPDATE public.ratings
      SET not_helpful_count = not_helpful_count + 1
      WHERE id = review_id_param;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Vote recorded successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILE INTERACTION FUNCTIONS
-- ============================================

-- Function to track profile view
CREATE OR REPLACE FUNCTION public.track_profile_view_event(
  professional_id_param uuid,
  source_param text DEFAULT 'direct',
  referrer_url_param text DEFAULT NULL,
  device_type_param text DEFAULT 'desktop',
  session_id_param text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_viewer_id uuid;
  v_view_id uuid;
BEGIN
  v_viewer_id := auth.uid();

  INSERT INTO public.profile_views (
    professional_id,
    viewer_id,
    session_id,
    source,
    referrer_url,
    device_type
  ) VALUES (
    professional_id_param,
    v_viewer_id,
    session_id_param,
    source_param,
    referrer_url_param,
    device_type_param
  ) RETURNING id INTO v_view_id;

  RETURN jsonb_build_object(
    'success', true,
    'view_id', v_view_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save/unsave a profile
CREATE OR REPLACE FUNCTION public.toggle_save_profile(
  professional_id_param uuid,
  note_param text DEFAULT NULL,
  collection_name_param text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_is_saved boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.saved_profiles
    WHERE user_id = v_user_id AND professional_id = professional_id_param
  ) INTO v_is_saved;

  IF v_is_saved THEN
    DELETE FROM public.saved_profiles
    WHERE user_id = v_user_id AND professional_id = professional_id_param;
    
    UPDATE public.profile_analytics
    SET profile_saves_count = profile_saves_count - 1
    WHERE professional_id = professional_id_param;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'unsaved',
      'message', 'Profile removed from saved'
    );
  ELSE
    INSERT INTO public.saved_profiles (
      user_id,
      professional_id,
      note,
      collection_name
    ) VALUES (
      v_user_id,
      professional_id_param,
      note_param,
      collection_name_param
    );
    
    UPDATE public.profile_analytics
    SET profile_saves_count = profile_saves_count + 1
    WHERE professional_id = professional_id_param;
    
    RETURN jsonb_build_object(
      'success', true,
      'action', 'saved',
      'message', 'Profile saved successfully'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get saved profiles
CREATE OR REPLACE FUNCTION public.get_saved_profiles(
  limit_param integer DEFAULT 50,
  offset_param integer DEFAULT 0,
  collection_name_param text DEFAULT NULL
)
RETURNS TABLE (
  professional_id uuid,
  professional_name text,
  professional_avatar text,
  professional_type text,
  professional_category text,
  city text,
  state text,
  average_rating numeric,
  total_reviews integer,
  saved_at timestamptz,
  note text,
  collection_name text
) AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
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
    sp.saved_at,
    sp.note,
    sp.collection_name
  FROM public.saved_profiles sp
  LEFT JOIN public.profiles p ON sp.professional_id = p.id
  LEFT JOIN public.professional_profiles pp ON sp.professional_id = pp.user_id
  LEFT JOIN public.profile_analytics pa ON sp.professional_id = pa.professional_id
  WHERE sp.user_id = v_user_id
    AND (collection_name_param IS NULL OR sp.collection_name = collection_name_param)
  ORDER BY sp.saved_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CONTACT REQUEST FUNCTIONS
-- ============================================

-- Function to create a contact request
CREATE OR REPLACE FUNCTION public.create_contact_request(
  professional_id_param uuid,
  request_message_param text DEFAULT NULL,
  contact_method_param text DEFAULT 'message',
  job_id_param uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_requester_id uuid;
  v_request_id uuid;
BEGIN
  v_requester_id := auth.uid();
  
  IF v_requester_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.contact_requests
    WHERE professional_id = professional_id_param
      AND requester_id = v_requester_id
      AND (job_id_param IS NULL OR job_id = job_id_param)
      AND status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Contact request already pending';
  END IF;

  INSERT INTO public.contact_requests (
    professional_id,
    requester_id,
    job_id,
    request_message,
    contact_method
  ) VALUES (
    professional_id_param,
    v_requester_id,
    job_id_param,
    request_message_param,
    contact_method_param
  ) RETURNING id INTO v_request_id;

  UPDATE public.profile_analytics
  SET contact_requests_count = contact_requests_count + 1
  WHERE professional_id = professional_id_param;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', v_request_id,
    'message', 'Contact request sent successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to respond to contact request
CREATE OR REPLACE FUNCTION public.respond_to_contact_request(
  request_id_param uuid,
  status_param text,
  response_message_param text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_professional_id uuid;
BEGIN
  v_professional_id := auth.uid();
  
  IF v_professional_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.contact_requests
    WHERE id = request_id_param AND professional_id = v_professional_id
  ) THEN
    RAISE EXCEPTION 'Contact request not found or unauthorized';
  END IF;

  UPDATE public.contact_requests
  SET 
    status = status_param,
    response_message = response_message_param,
    responded_at = now(),
    contact_shared = (status_param = 'accepted')
  WHERE id = request_id_param;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Response sent successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ANALYTICS FUNCTIONS
-- ============================================

-- Function to get profile analytics data
CREATE OR REPLACE FUNCTION public.get_profile_analytics_data(
  date_range_days integer DEFAULT 30
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_analytics jsonb;
  v_views_trend jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  SELECT jsonb_build_object(
    'total_views', total_views,
    'unique_viewers', unique_viewers,
    'views_this_week', views_this_week,
    'views_this_month', views_this_month,
    'average_session_duration', average_session_duration,
    'profile_saves_count', profile_saves_count,
    'contact_requests_count', contact_requests_count,
    'job_inquiries_count', job_inquiries_count,
    'conversion_rate', conversion_rate,
    'average_rating', average_rating,
    'total_reviews', total_reviews,
    'rating_distribution', rating_distribution,
    'profile_completion_percent', profile_completion_percent,
    'trending_score', trending_score,
    'average_response_time', average_response_time,
    'response_rate', response_rate
  ) INTO v_analytics
  FROM public.profile_analytics
  WHERE professional_id = v_user_id;

  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date_trunc('day', viewed_at),
      'count', count(*)
    ) ORDER BY date_trunc('day', viewed_at)
  ) INTO v_views_trend
  FROM public.profile_views
  WHERE professional_id = v_user_id
    AND viewed_at >= now() - (date_range_days || ' days')::interval
  GROUP BY date_trunc('day', viewed_at);

  RETURN jsonb_build_object(
    'analytics', v_analytics,
    'views_trend', COALESCE(v_views_trend, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS integer AS $$
DECLARE
  v_user_id uuid;
  v_completion integer := 0;
  v_has_profile boolean;
  v_has_professional boolean;
  v_has_portfolio boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.profiles
    WHERE id = v_user_id
      AND full_name IS NOT NULL
      AND avatar_url IS NOT NULL
      AND phone IS NOT NULL
  ) INTO v_has_profile;
  
  IF v_has_profile THEN
    v_completion := v_completion + 20;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.professional_profiles
    WHERE user_id = v_user_id
      AND selected_type IS NOT NULL
      AND selected_category IS NOT NULL
      AND city IS NOT NULL
      AND state IS NOT NULL
      AND experience_level IS NOT NULL
      AND pricing IS NOT NULL
  ) INTO v_has_professional;
  
  IF v_has_professional THEN
    v_completion := v_completion + 40;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.portfolio_items
    WHERE user_id = v_user_id
      AND is_visible = true
    LIMIT 3
  ) INTO v_has_portfolio;
  
  IF v_has_portfolio THEN
    v_completion := v_completion + 20;
  END IF;

  IF EXISTS(
    SELECT 1 FROM public.verification_status
    WHERE user_id = v_user_id
      AND (email_verified = true OR phone_verified = true)
  ) THEN
    v_completion := v_completion + 20;
  END IF;

  UPDATE public.profile_analytics
  SET profile_completion_percent = v_completion
  WHERE professional_id = v_user_id;

  RETURN v_completion;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_profile_details TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_portfolio TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_rating TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_professional_ratings TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.respond_to_rating TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_review_helpful TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_profile_view_event TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.toggle_save_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_saved_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_contact_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_contact_request TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_analytics_data TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_profile_completion TO authenticated;
