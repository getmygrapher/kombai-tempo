-- Sample data for Profile View & Rating System testing

-- Initialize profile analytics for existing users
INSERT INTO public.profile_analytics (professional_id)
SELECT id FROM auth.users
ON CONFLICT (professional_id) DO NOTHING;

-- Initialize verification status for existing users
INSERT INTO public.verification_status (user_id, email_verified)
SELECT id, (email_confirmed_at IS NOT NULL)
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Add sample ratings (only if there are at least 2 users)
DO $$
DECLARE
  v_professional_id uuid;
  v_client_id uuid;
  v_job_id uuid;
BEGIN
  -- Get first user as professional
  SELECT id INTO v_professional_id FROM auth.users LIMIT 1;
  
  -- Get second user as client (if exists)
  SELECT id INTO v_client_id FROM auth.users WHERE id != v_professional_id LIMIT 1;
  
  -- Only insert if we have both users
  IF v_professional_id IS NOT NULL AND v_client_id IS NOT NULL THEN
    -- Generate a sample job ID
    v_job_id := gen_random_uuid();
    
    -- Insert sample ratings
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
      is_verified,
      verified_job_completion,
      is_visible,
      created_at
    ) VALUES
    (
      v_professional_id,
      v_client_id,
      v_job_id,
      5,
      'Excellent Work!',
      'The photographer was professional, punctual, and delivered amazing photos. Highly recommend for any event photography needs.',
      5,
      5,
      5,
      5,
      5,
      true,
      true,
      true,
      now() - interval '5 days'
    ),
    (
      v_professional_id,
      v_client_id,
      gen_random_uuid(),
      4,
      'Great Experience',
      'Very talented photographer with great attention to detail. The photos turned out beautiful. Would definitely hire again.',
      4,
      5,
      4,
      5,
      4,
      true,
      true,
      true,
      now() - interval '10 days'
    ),
    (
      v_professional_id,
      v_client_id,
      gen_random_uuid(),
      5,
      'Outstanding Quality',
      'Exceeded all expectations! The photos are stunning and captured every special moment perfectly.',
      5,
      5,
      5,
      5,
      5,
      true,
      true,
      true,
      now() - interval '15 days'
    )
    ON CONFLICT (professional_id, client_id, job_id) DO NOTHING;
    
    -- Add sample profile views
    INSERT INTO public.profile_views (
      professional_id,
      viewer_id,
      source,
      device_type,
      viewed_at
    ) VALUES
    (v_professional_id, v_client_id, 'search', 'desktop', now() - interval '1 day'),
    (v_professional_id, v_client_id, 'direct', 'mobile', now() - interval '2 days'),
    (v_professional_id, NULL, 'search', 'desktop', now() - interval '3 days'),
    (v_professional_id, NULL, 'featured', 'mobile', now() - interval '4 days'),
    (v_professional_id, v_client_id, 'job_post', 'desktop', now() - interval '5 days');
    
  END IF;
END $$;
