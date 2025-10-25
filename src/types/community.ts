// Community Posing Library enums
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate', 
  ADVANCED = 'advanced'
}

export enum PoseCategory {
  PORTRAIT = 'portrait',
  COUPLE = 'couple',
  FAMILY = 'family',
  WEDDING = 'wedding',
  MATERNITY = 'maternity',
  COMMERCIAL = 'commercial',
  GROUP = 'group',
  CREATIVE = 'creative',
  LIFESTYLE = 'lifestyle',
  FASHION = 'fashion'
}

export enum LocationType {
  STUDIO = 'studio',
  OUTDOOR = 'outdoor',
  INDOOR = 'indoor',
  BEACH = 'beach',
  URBAN = 'urban',
  NATURE = 'nature',
  HOME = 'home',
  EVENT_VENUE = 'event_venue'
}

export enum InteractionType {
  LIKE = 'like',
  SAVE = 'save',
  VIEW = 'view',
  SHARE = 'share'
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged'
}

export enum SortBy {
  RECENT = 'recent',
  POPULAR = 'popular',
  TRENDING = 'trending'
}

export enum SharePlatform {
  INSTAGRAM = 'instagram',
  WHATSAPP = 'whatsapp',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  COPY_LINK = 'copy_link'
}

export enum ContributionStep {
  UPLOAD = 'upload',
  EXIF_REVIEW = 'exif_review', 
  POSE_DETAILS = 'pose_details',
  REVIEW_SUBMIT = 'review_submit'
}

export enum ModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG = 'flag'
}

export enum ReportReason {
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  SPAM = 'spam',
  MISLEADING_INFO = 'misleading_info',
  OTHER = 'other'
}

export enum ValidationErrorType {
  REQUIRED_FIELD = 'required_field',
  INVALID_FORMAT = 'invalid_format',
  FILE_TOO_LARGE = 'file_too_large',
  INVALID_FILE_TYPE = 'invalid_file_type'
}

// Props types (data passed to components)
export interface CommunityPose {
  id: string;
  photographer_id: string;
  portfolio_image_id: string;
  title: string;
  posing_tips: string;
  difficulty_level: DifficultyLevel;
  people_count: number;
  category: PoseCategory;
  mood_emotion?: string;
  image_url: string;
  
  // EXIF and Camera Data
  exif_data?: Record<string, any>;
  camera_model?: string;
  lens_model?: string;
  focal_length?: number;
  aperture?: number;
  shutter_speed?: string;
  iso_setting?: number;
  flash_used?: boolean;
  exif_extraction_success: boolean;
  manual_override: boolean;
  
  // Additional Equipment and Context
  additional_equipment: string[];
  lighting_setup?: string;
  location_type: LocationType;
  story_behind?: string;
  
  // Community Metrics
  is_approved: boolean;
  likes_count: number;
  views_count: number;
  saves_count: number;
  comments_count: number;
  created_at: string;
  updated_at?: string;
  
  // Photographer info
  photographer: PhotographerInfo;
}

export interface PhotographerInfo {
  id: string;
  name: string;
  profile_photo: string;
  location: string;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
}

export interface PoseComment {
  id: string;
  pose_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at?: string;
  user: {
    name: string;
    profile_photo: string;
  };
}

export interface PoseInteraction {
  id: string;
  pose_id: string;
  user_id: string;
  interaction_type: InteractionType;
  created_at: string;
}

export interface CameraSettings {
  camera_model?: string;
  lens_model?: string;
  focal_length?: number;
  aperture?: number;
  shutter_speed?: string;
  iso_setting?: number;
  flash_used?: boolean;
  exif_extraction_success: boolean;
}

export interface LibraryFilters {
  categories: PoseCategory[];
  difficultyLevels: DifficultyLevel[];
  locationTypes: LocationType[];
  equipmentTypes: string[];
  peopleCount: number[];
}

export interface CommunityContributionForm {
  posing_tips: string;
  difficulty_level: DifficultyLevel;
  people_count: number;
  category: PoseCategory;
  mood_emotion?: string;
  additional_equipment: string[];
  lighting_setup?: string;
  story_behind?: string;
  manual_camera_settings?: CameraSettings;
}

// Store types (global state data)
export interface CommunityLibraryStore {
  currentSort: SortBy;
  activeFilters: LibraryFilters;
  searchQuery: string;
  showFilters: boolean;
  selectedPose: string | null;
}

// Query types (API response data)
export interface CommunityPosesResponse {
  poses: CommunityPose[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface PoseCommentsResponse {
  comments: PoseComment[];
  total: number;
}

export interface UserInteractionsResponse {
  interactions: PoseInteraction[];
}

// Additional types for new features
export interface ContributionDraft {
  step: ContributionStep;
  image: File | null;
  exifData: EXIFData | null;
  formData: ContributionFormData;
  validationErrors: Record<string, ValidationErrorType>;
  timestamp: string;
}

export interface ContributionFormData {
  title: string;
  posing_tips: string;
  difficulty_level: DifficultyLevel;
  people_count: number;
  category: PoseCategory;
  mood_emotion: string;
  additional_equipment: string[];
  lighting_setup: string;
  story_behind: string;
}

export interface ModerationSubmission {
  id: string;
  pose_id: string;
  photographer_id: string;
  title: string;
  status: ModerationStatus;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  feedback?: string;
  image_url: string;
}

export interface ContributionSubmission {
  pose: Omit<CommunityPose, 'id' | 'created_at' | 'is_approved' | 'likes_count' | 'views_count' | 'saves_count' | 'comments_count'>;
  status: ModerationStatus;
}

export interface EXIFData {
  camera_model?: string;
  lens_model?: string;
  focal_length?: number;
  aperture?: number;
  shutter_speed?: string;
  iso_setting?: number;
  flash_used?: boolean;
  extraction_success: boolean;
}