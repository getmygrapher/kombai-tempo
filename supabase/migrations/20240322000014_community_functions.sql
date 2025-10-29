-- Drop existing functions first
DROP FUNCTION IF EXISTS public.get_community_poses(text,integer,integer,text[],text[],text[],integer[]);
DROP FUNCTION IF EXISTS public.get_pose_details(uuid);
DROP FUNCTION IF EXISTS public.search_community_poses(text,integer);
DROP FUNCTION IF EXISTS public.toggle_pose_interaction(uuid,text);
DROP FUNCTION IF EXISTS public.track_pose_view(uuid);
DROP FUNCTION IF EXISTS public.get_pose_comments(uuid,integer,integer);
DROP FUNCTION IF EXISTS public.add_pose_comment(uuid,text);
DROP FUNCTION IF EXISTS public.submit_community_pose(text,text,text,integer,text,text,text,text,text,text,text,text,jsonb,jsonb);
DROP FUNCTION IF EXISTS public.get_user_contributions(integer,uuid);
DROP FUNCTION IF EXISTS public.get_user_saved_poses(integer,integer);
DROP FUNCTION IF EXISTS public.get_moderation_queue(text,integer);
DROP FUNCTION IF EXISTS public.moderate_pose(uuid,text,text);

-- Community Posing Library RPC Functions

-- Function to get community poses with filters and sorting
CREATE OR REPLACE FUNCTION public.get_community_poses(
  p_sort_by text DEFAULT 'recent',
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_categories text[] DEFAULT NULL,
  p_difficulty_levels text[] DEFAULT NULL,
  p_location_types text[] DEFAULT NULL,
  p_people_count integer[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  photographer_id uuid,
  portfolio_image_id uuid,
  title text,
  posing_tips text,
  difficulty_level text,
  people_count integer,
  category text,
  mood_emotion text,
  image_url text,
  camera_model text,
  lens_model text,
  focal_length numeric,
  aperture numeric,
  shutter_speed text,
  iso_setting integer,
  flash_used boolean,
  lighting_setup text,
  location_type text,
  story_behind text,
  is_approved boolean,
  likes_count integer,
  views_count integer,
  saves_count integer,
  comments_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  photographer_name text,
  photographer_photo text,
  photographer_location text,
  photographer_verified boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.photographer_id,
    cp.portfolio_image_id,
    cp.title,
    cp.posing_tips,
    cp.difficulty_level,
    cp.people_count,
    cp.category,
    cp.mood_emotion,
    cp.image_url,
    pcd.camera_model,
    pcd.lens_model,
    pcd.focal_length,
    pcd.aperture,
    pcd.shutter_speed,
    pcd.iso_setting,
    pcd.flash_used,
    cp.lighting_setup,
    cp.location_type,
    cp.story_behind,
    cp.is_approved,
    cp.likes_count,
    cp.views_count,
    cp.saves_count,
    cp.comments_count,
    cp.created_at,
    cp.updated_at,
    up.full_name as photographer_name,
    up.profile_photo_url as photographer_photo,
    up.location as photographer_location,
    up.is_verified as photographer_verified
  FROM public.community_poses cp
  LEFT JOIN public.pose_camera_data pcd ON cp.id = pcd.pose_id
  LEFT JOIN public.user_profiles up ON cp.photographer_id = up.user_id
  WHERE cp.is_approved = true 
    AND cp.moderation_status = 'approved'
    AND (p_categories IS NULL OR cp.category = ANY(p_categories))
    AND (p_difficulty_levels IS NULL OR cp.difficulty_level = ANY(p_difficulty_levels))
    AND (p_location_types IS NULL OR cp.location_type = ANY(p_location_types))
    AND (p_people_count IS NULL OR cp.people_count = ANY(p_people_count))
  ORDER BY
    CASE 
      WHEN p_sort_by = 'recent' THEN cp.created_at
      ELSE NULL
    END DESC,
    CASE 
      WHEN p_sort_by = 'popular' THEN cp.likes_count
      WHEN p_sort_by = 'trending' THEN cp.views_count
      ELSE NULL
    END DESC,
    CASE 
      WHEN p_sort_by = 'most_saved' THEN cp.saves_count
      ELSE NULL
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pose details by ID
CREATE OR REPLACE FUNCTION public.get_pose_details(p_pose_id uuid)
RETURNS TABLE (
  id uuid,
  photographer_id uuid,
  portfolio_image_id uuid,
  title text,
  posing_tips text,
  difficulty_level text,
  people_count integer,
  category text,
  mood_emotion text,
  image_url text,
  camera_model text,
  lens_model text,
  focal_length numeric,
  aperture numeric,
  shutter_speed text,
  iso_setting integer,
  flash_used boolean,
  lighting_setup text,
  location_type text,
  story_behind text,
  is_approved boolean,
  likes_count integer,
  views_count integer,
  saves_count integer,
  comments_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  photographer_name text,
  photographer_photo text,
  photographer_location text,
  photographer_verified boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.photographer_id,
    cp.portfolio_image_id,
    cp.title,
    cp.posing_tips,
    cp.difficulty_level,
    cp.people_count,
    cp.category,
    cp.mood_emotion,
    cp.image_url,
    pcd.camera_model,
    pcd.lens_model,
    pcd.focal_length,
    pcd.aperture,
    pcd.shutter_speed,
    pcd.iso_setting,
    pcd.flash_used,
    cp.lighting_setup,
    cp.location_type,
    cp.story_behind,
    cp.is_approved,
    cp.likes_count,
    cp.views_count,
    cp.saves_count,
    cp.comments_count,
    cp.created_at,
    cp.updated_at,
    up.full_name as photographer_name,
    up.profile_photo_url as photographer_photo,
    up.location as photographer_location,
    up.is_verified as photographer_verified
  FROM public.community_poses cp
  LEFT JOIN public.pose_camera_data pcd ON cp.id = pcd.pose_id
  LEFT JOIN public.user_profiles up ON cp.photographer_id = up.user_id
  WHERE cp.id = p_pose_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search community poses
CREATE OR REPLACE FUNCTION public.search_community_poses(
  p_search_query text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  photographer_id uuid,
  title text,
  posing_tips text,
  difficulty_level text,
  category text,
  image_url text,
  likes_count integer,
  views_count integer,
  created_at timestamptz,
  photographer_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.photographer_id,
    cp.title,
    cp.posing_tips,
    cp.difficulty_level,
    cp.category,
    cp.image_url,
    cp.likes_count,
    cp.views_count,
    cp.created_at,
    up.full_name as photographer_name
  FROM public.community_poses cp
  LEFT JOIN public.user_profiles up ON cp.photographer_id = up.user_id
  WHERE cp.is_approved = true 
    AND cp.moderation_status = 'approved'
    AND (
      cp.title ILIKE '%' || p_search_query || '%' OR
      cp.posing_tips ILIKE '%' || p_search_query || '%' OR
      cp.category ILIKE '%' || p_search_query || '%'
    )
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to toggle pose interactions (like, save)
CREATE OR REPLACE FUNCTION public.toggle_pose_interaction(
  p_pose_id uuid,
  p_interaction_type text
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_exists boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.pose_interactions 
    WHERE pose_id = p_pose_id 
      AND user_id = v_user_id 
      AND interaction_type = p_interaction_type
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.pose_interactions
    WHERE pose_id = p_pose_id 
      AND user_id = v_user_id 
      AND interaction_type = p_interaction_type;
  ELSE
    INSERT INTO public.pose_interactions (pose_id, user_id, interaction_type)
    VALUES (p_pose_id, v_user_id, p_interaction_type);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track pose views
CREATE OR REPLACE FUNCTION public.track_pose_view(p_pose_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.pose_interactions (pose_id, user_id, interaction_type)
  VALUES (p_pose_id, auth.uid(), 'view')
  ON CONFLICT (pose_id, user_id, interaction_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pose comments
CREATE OR REPLACE FUNCTION public.get_pose_comments(
  p_pose_id uuid,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  pose_id uuid,
  user_id uuid,
  comment_text text,
  created_at timestamptz,
  user_name text,
  user_photo text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.pose_id,
    pc.user_id,
    pc.comment_text,
    pc.created_at,
    up.full_name as user_name,
    up.profile_photo_url as user_photo
  FROM public.pose_comments pc
  LEFT JOIN public.user_profiles up ON pc.user_id = up.user_id
  WHERE pc.pose_id = p_pose_id
    AND pc.is_flagged = false
  ORDER BY pc.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a comment
CREATE OR REPLACE FUNCTION public.add_pose_comment(
  p_pose_id uuid,
  p_comment_text text
)
RETURNS uuid AS $$
DECLARE
  v_comment_id uuid;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  INSERT INTO public.pose_comments (pose_id, user_id, comment_text)
  VALUES (p_pose_id, v_user_id, p_comment_text)
  RETURNING id INTO v_comment_id;

  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit a community pose
CREATE OR REPLACE FUNCTION public.submit_community_pose(
  p_title text,
  p_posing_tips text,
  p_difficulty_level text,
  p_people_count integer,
  p_category text,
  p_image_url text,
  p_mood_emotion text DEFAULT NULL,
  p_thumbnail_url text DEFAULT NULL,
  p_medium_url text DEFAULT NULL,
  p_location_type text DEFAULT NULL,
  p_lighting_setup text DEFAULT NULL,
  p_story_behind text DEFAULT NULL,
  p_camera_data jsonb DEFAULT NULL,
  p_equipment jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_pose_id uuid;
  v_user_id uuid;
  v_equipment_item jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  INSERT INTO public.community_poses (
    photographer_id,
    title,
    posing_tips,
    difficulty_level,
    people_count,
    category,
    image_url,
    thumbnail_url,
    medium_url,
    mood_emotion,
    location_type,
    lighting_setup,
    story_behind,
    moderation_status
  ) VALUES (
    v_user_id,
    p_title,
    p_posing_tips,
    p_difficulty_level,
    p_people_count,
    p_category,
    p_image_url,
    p_thumbnail_url,
    p_medium_url,
    p_mood_emotion,
    p_location_type,
    p_lighting_setup,
    p_story_behind,
    'pending'
  ) RETURNING id INTO v_pose_id;

  IF p_camera_data IS NOT NULL THEN
    INSERT INTO public.pose_camera_data (
      pose_id,
      camera_model,
      lens_model,
      focal_length,
      aperture,
      shutter_speed,
      iso_setting,
      flash_used,
      exif_extraction_success,
      manual_override
    ) VALUES (
      v_pose_id,
      p_camera_data->>'camera_model',
      p_camera_data->>'lens_model',
      (p_camera_data->>'focal_length')::numeric,
      (p_camera_data->>'aperture')::numeric,
      p_camera_data->>'shutter_speed',
      (p_camera_data->>'iso_setting')::integer,
      (p_camera_data->>'flash_used')::boolean,
      (p_camera_data->>'exif_extraction_success')::boolean,
      (p_camera_data->>'manual_override')::boolean
    );
  END IF;

  IF p_equipment IS NOT NULL THEN
    FOR v_equipment_item IN SELECT * FROM jsonb_array_elements(p_equipment)
    LOOP
      INSERT INTO public.pose_equipment (pose_id, equipment_name, equipment_type)
      VALUES (
        v_pose_id,
        v_equipment_item->>'name',
        v_equipment_item->>'type'
      );
    END LOOP;
  END IF;

  RETURN v_pose_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user contributions
CREATE OR REPLACE FUNCTION public.get_user_contributions(
  p_limit integer DEFAULT 100,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  category text,
  image_url text,
  is_approved boolean,
  likes_count integer,
  comments_count integer,
  created_at timestamptz
) AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  RETURN QUERY
  SELECT 
    cp.id,
    cp.title,
    cp.category,
    cp.image_url,
    cp.is_approved,
    cp.likes_count,
    cp.comments_count,
    cp.created_at
  FROM public.community_poses cp
  WHERE cp.photographer_id = v_user_id
  ORDER BY cp.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user saved poses
CREATE OR REPLACE FUNCTION public.get_user_saved_poses(
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  title text,
  difficulty_level text,
  category text,
  image_url text,
  likes_count integer,
  saved_at timestamptz
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
    cp.id,
    cp.title,
    cp.difficulty_level,
    cp.category,
    cp.image_url,
    cp.likes_count,
    pi.created_at as saved_at
  FROM public.pose_interactions pi
  JOIN public.community_poses cp ON pi.pose_id = cp.id
  WHERE pi.user_id = v_user_id
    AND pi.interaction_type = 'save'
    AND cp.is_approved = true
  ORDER BY pi.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get moderation queue
CREATE OR REPLACE FUNCTION public.get_moderation_queue(
  p_status text DEFAULT 'pending',
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  photographer_id uuid,
  title text,
  image_url text,
  moderation_status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id,
    cp.photographer_id,
    cp.title,
    cp.image_url,
    cp.moderation_status,
    cp.created_at
  FROM public.community_poses cp
  WHERE cp.moderation_status = p_status
  ORDER BY cp.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to moderate a pose
CREATE OR REPLACE FUNCTION public.moderate_pose(
  p_pose_id uuid,
  p_action text,
  p_feedback text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_new_status text;
  v_is_approved boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  IF p_action = 'approve' THEN
    v_new_status := 'approved';
    v_is_approved := true;
  ELSIF p_action = 'reject' THEN
    v_new_status := 'rejected';
    v_is_approved := false;
  ELSIF p_action = 'flag' THEN
    v_new_status := 'flagged';
    v_is_approved := false;
  ELSE
    RAISE EXCEPTION 'Invalid moderation action';
  END IF;

  UPDATE public.community_poses
  SET 
    moderation_status = v_new_status,
    is_approved = v_is_approved,
    moderation_feedback = p_feedback,
    moderated_at = now(),
    moderated_by = v_user_id
  WHERE id = p_pose_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;