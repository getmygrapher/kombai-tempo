-- Insert sample community poses for testing

-- First, let's create a sample photographer user if it doesn't exist
-- Note: In production, this would be a real user from auth.users

-- Insert sample poses (using a placeholder user ID - you'll need to replace with a real user)
-- For now, we'll insert poses that will be visible once approved

INSERT INTO public.community_poses (
  id,
  photographer_id,
  title,
  posing_tips,
  difficulty_level,
  people_count,
  category,
  mood_emotion,
  image_url,
  thumbnail_url,
  location_type,
  lighting_setup,
  story_behind,
  is_approved,
  moderation_status,
  likes_count,
  views_count,
  created_at
) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'Classic Portrait Pose',
    'Have the subject turn their body 45 degrees away from the camera while keeping their face towards the lens. This creates a slimming effect and adds dimension.',
    'beginner',
    1,
    'portrait',
    'Confident, Professional',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    'studio',
    'Single softbox at 45 degrees, reflector on opposite side',
    'This is one of the most versatile poses for professional headshots and portraits.',
    true,
    'approved',
    42,
    156,
    now() - interval '2 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'Candid Laugh',
    'Ask your subject to think of something funny or tell them a joke. Capture the genuine moment of laughter with continuous shooting mode.',
    'intermediate',
    1,
    'lifestyle',
    'Happy, Joyful, Natural',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80',
    'outdoor',
    'Natural light, golden hour',
    'Authentic emotions create the most memorable portraits. This technique works great for lifestyle photography.',
    true,
    'approved',
    87,
    234,
    now() - interval '5 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'Couple Embrace',
    'Position the couple close together with the taller person slightly behind. Have them look at each other or towards the camera. Focus on their connection.',
    'intermediate',
    2,
    'couple',
    'Romantic, Intimate, Loving',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&q=80',
    'outdoor',
    'Backlit with natural light, slight fill flash',
    'Perfect for engagement sessions and romantic couple portraits.',
    true,
    'approved',
    125,
    412,
    now() - interval '1 day'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'Fashion Forward',
    'Have the model strike a strong, angular pose with one hand on hip. Emphasize lines and create dynamic shapes with the body.',
    'advanced',
    1,
    'fashion',
    'Bold, Confident, Edgy',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80',
    'studio',
    'Three-point lighting with colored gels',
    'High-fashion poses require confidence and strong body awareness from the model.',
    true,
    'approved',
    93,
    287,
    now() - interval '3 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'Family Connection',
    'Arrange family members in a triangle formation with parents slightly behind children. Encourage natural interactions and genuine smiles.',
    'beginner',
    4,
    'family',
    'Warm, Connected, Joyful',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&q=80',
    'outdoor',
    'Natural light, late afternoon',
    'Family portraits work best when everyone feels relaxed and connected.',
    true,
    'approved',
    156,
    523,
    now() - interval '4 days'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM auth.users LIMIT 1),
    'Maternity Glow',
    'Position the expectant mother at a 45-degree angle, hands gently cradling the belly. Soft, flattering light is key.',
    'intermediate',
    1,
    'maternity',
    'Serene, Glowing, Anticipation',
    'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=800&q=80',
    'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=400&q=80',
    'studio',
    'Large softbox for soft, wrapping light',
    'Maternity photography celebrates the beauty of pregnancy with gentle, flattering poses.',
    true,
    'approved',
    78,
    198,
    now() - interval '6 days'
  );

-- Add camera data for some poses
INSERT INTO public.pose_camera_data (
  pose_id,
  camera_model,
  lens_model,
  focal_length,
  aperture,
  shutter_speed,
  iso_setting,
  flash_used,
  exif_extraction_success
)
SELECT 
  id,
  'Canon EOS R5',
  'RF 85mm f/1.2L',
  85,
  1.8,
  '1/200',
  400,
  false,
  true
FROM public.community_poses
WHERE title = 'Classic Portrait Pose';

INSERT INTO public.pose_camera_data (
  pose_id,
  camera_model,
  lens_model,
  focal_length,
  aperture,
  shutter_speed,
  iso_setting,
  flash_used,
  exif_extraction_success
)
SELECT 
  id,
  'Sony A7 IV',
  'FE 50mm f/1.4',
  50,
  2.0,
  '1/500',
  200,
  false,
  true
FROM public.community_poses
WHERE title = 'Candid Laugh';
