// Mock data for community posing library
import { 
  CommunityPose, 
  PoseComment, 
  PhotographerInfo, 
  PoseCategory, 
  DifficultyLevel, 
  LocationType,
  ModerationStatus,
  ContributionStep
} from '../types/community';

// Mock store data
export const mockStore = {
  currentTab: 'community' as const,
  isAuthenticated: true,
  currentUser: {
    id: 'user-current',
    name: 'Current User',
    profile_photo: 'https://i.pravatar.cc/150?img=10'
  }
};

// Mock query data
export const mockQuery = {
  communityPoses: [
    {
      id: 'pose-001',
      photographer_id: 'photographer-001',
      portfolio_image_id: 'portfolio-001',
      title: 'Elegant Portrait Pose',
      posing_tips: 'Keep shoulders relaxed and slightly angled. Chin down just a touch to define the jawline. Hands should be soft and natural.',
      difficulty_level: DifficultyLevel.BEGINNER,
      people_count: 1,
      category: PoseCategory.PORTRAIT,
      mood_emotion: 'Elegant, Professional',
      image_url: 'https://images.unsplash.com/photo-1494790108755-2616c4e7e2b3?w=400',
      camera_model: 'Canon EOS R5',
      lens_model: '85mm f/1.4',
      focal_length: 85,
      aperture: 2.8,
      shutter_speed: '1/200s',
      iso_setting: 400,
      flash_used: false,
      exif_extraction_success: true,
      manual_override: false,
      additional_equipment: ['Reflector', 'Softbox'],
      lighting_setup: 'Natural window light with reflector fill',
      location_type: LocationType.STUDIO,
      story_behind: 'This pose was created for a corporate headshot session. The goal was to convey professionalism while maintaining approachability.',
      is_approved: true,
      likes_count: 127,
      views_count: 1250,
      saves_count: 45,
      comments_count: 8,
      created_at: '2024-01-15T10:30:00Z',
      photographer: {
        id: 'photographer-001',
        name: 'Priya Sharma',
        profile_photo: 'https://i.pravatar.cc/150?img=1',
        location: 'Mumbai, India',
        is_verified: true,
        rating: 4.8,
        total_reviews: 156
      }
    } as CommunityPose,
    {
      id: 'pose-002', 
      photographer_id: 'photographer-002',
      portfolio_image_id: 'portfolio-002',
      title: 'Romantic Couple Pose',
      posing_tips: 'Have the couple stand close with the man slightly behind. Woman leans back into his chest. Both look towards camera with gentle smiles.',
      difficulty_level: DifficultyLevel.INTERMEDIATE,
      people_count: 2,
      category: PoseCategory.COUPLE,
      mood_emotion: 'Romantic, Intimate',
      image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
      camera_model: 'Sony A7 III',
      lens_model: '50mm f/1.8',
      focal_length: 50,
      aperture: 1.8,
      shutter_speed: '1/160s',
      iso_setting: 800,
      flash_used: false,
      exif_extraction_success: true,
      manual_override: false,
      additional_equipment: ['85mm lens', 'Tripod'],
      lighting_setup: 'Golden hour natural light',
      location_type: LocationType.OUTDOOR,
      story_behind: 'Captured during an engagement session at sunset. The warm light created a beautiful romantic atmosphere.',
      is_approved: true,
      likes_count: 89,
      views_count: 890,
      saves_count: 32,
      comments_count: 12,
      created_at: '2024-01-14T16:45:00Z',
      photographer: {
        id: 'photographer-002',
        name: 'Rahul Gupta',
        profile_photo: 'https://i.pravatar.cc/150?img=2',
        location: 'Delhi, India',
        is_verified: true,
        rating: 4.9,
        total_reviews: 203
      }
    } as CommunityPose
  ],
  
  poseComments: [
    {
      id: 'comment-001',
      pose_id: 'pose-001',
      user_id: 'user-001',
      comment_text: 'This is such a beautiful pose! The lighting is perfect. Thanks for sharing the camera settings.',
      created_at: '2024-01-15T11:30:00Z',
      user: {
        name: 'Anjali Patel',
        profile_photo: 'https://i.pravatar.cc/150?img=3'
      }
    } as PoseComment,
    {
      id: 'comment-002', 
      pose_id: 'pose-001',
      user_id: 'user-002',
      comment_text: 'Great tip about the chin positioning. I tried this with my client and it worked wonderfully!',
      created_at: '2024-01-15T12:15:00Z',
      user: {
        name: 'Vikram Singh',
        profile_photo: 'https://i.pravatar.cc/150?img=4'
      }
    } as PoseComment
  ],
  
  moderationQueue: [
    {
      id: 'submission-001',
      pose_id: 'pose-pending-001',
      photographer_id: 'photographer-003',
      title: 'Creative Fashion Pose',
      status: ModerationStatus.PENDING,
      submitted_at: '2024-01-16T09:00:00Z',
      image_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400'
    }
  ]
};

// Data passed as props to the root component
export const mockRootProps = {
  currentUser: {
    id: 'current-user',
    name: 'Current User',
    profile_photo: 'https://i.pravatar.cc/150?img=10',
    is_verified: false
  },
  initialTab: 'browse' as const,
  userId: 'current-user',
  isAuthenticated: true,
  isModerator: true // Enable moderation features for demo
};