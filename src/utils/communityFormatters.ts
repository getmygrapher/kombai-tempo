import { 
  DifficultyLevel, 
  PoseCategory, 
  LocationType, 
  SortBy,
  ContributionStep,
  ModerationStatus,
  ModerationAction,
  ValidationErrorType
} from '../types/community';

export const formatDifficultyLevel = (level: DifficultyLevel): string => {
  const levelMap = {
    [DifficultyLevel.BEGINNER]: 'Beginner',
    [DifficultyLevel.INTERMEDIATE]: 'Intermediate',
    [DifficultyLevel.ADVANCED]: 'Advanced'
  };
  return levelMap[level];
};

export const formatPoseCategory = (category: PoseCategory): string => {
  const categoryMap = {
    [PoseCategory.PORTRAIT]: 'Portrait',
    [PoseCategory.COUPLE]: 'Couple',
    [PoseCategory.FAMILY]: 'Family',
    [PoseCategory.WEDDING]: 'Wedding',
    [PoseCategory.MATERNITY]: 'Maternity',
    [PoseCategory.COMMERCIAL]: 'Commercial',
    [PoseCategory.GROUP]: 'Group',
    [PoseCategory.CREATIVE]: 'Creative',
    [PoseCategory.LIFESTYLE]: 'Lifestyle',
    [PoseCategory.FASHION]: 'Fashion'
  };
  return categoryMap[category];
};

export const formatLocationType = (location: LocationType): string => {
  const locationMap = {
    [LocationType.STUDIO]: 'Studio',
    [LocationType.OUTDOOR]: 'Outdoor',
    [LocationType.INDOOR]: 'Indoor',
    [LocationType.BEACH]: 'Beach',
    [LocationType.URBAN]: 'Urban',
    [LocationType.NATURE]: 'Nature',
    [LocationType.HOME]: 'Home',
    [LocationType.EVENT_VENUE]: 'Event Venue'
  };
  return locationMap[location];
};

export const formatSortBy = (sortBy: SortBy): string => {
  const sortMap = {
    [SortBy.RECENT]: 'Recent',
    [SortBy.POPULAR]: 'Popular',
    [SortBy.TRENDING]: 'Trending'
  };
  return sortMap[sortBy];
};

export const formatCameraSettings = (settings: any): string => {
  const parts = [];
  if (settings.aperture) parts.push(`f/${settings.aperture}`);
  if (settings.shutter_speed) parts.push(settings.shutter_speed);
  if (settings.iso_setting) parts.push(`ISO ${settings.iso_setting}`);
  return parts.join(', ');
};

export const formatEquipmentList = (equipment: string[]): string => {
  if (equipment.length === 0) return 'No additional equipment';
  if (equipment.length === 1) return equipment[0];
  if (equipment.length === 2) return equipment.join(' and ');
  return `${equipment.slice(0, -1).join(', ')}, and ${equipment[equipment.length - 1]}`;
};

export const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return postDate.toLocaleDateString();
};

export const formatLikesCount = (count: number): string => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
};

export const formatContributionStep = (step: ContributionStep): string => {
  const stepMap = {
    [ContributionStep.UPLOAD]: 'Upload Image',
    [ContributionStep.EXIF_REVIEW]: 'EXIF Review', 
    [ContributionStep.POSE_DETAILS]: 'Pose Details',
    [ContributionStep.REVIEW_SUBMIT]: 'Review & Submit'
  };
  return stepMap[step];
};

export const formatModerationStatus = (status: ModerationStatus): string => {
  const statusMap = {
    [ModerationStatus.PENDING]: 'Pending Review',
    [ModerationStatus.APPROVED]: 'Approved',
    [ModerationStatus.REJECTED]: 'Rejected', 
    [ModerationStatus.FLAGGED]: 'Flagged'
  };
  return statusMap[status];
};

export const formatModerationAction = (action: ModerationAction): string => {
  const actionMap = {
    [ModerationAction.APPROVE]: 'Approve',
    [ModerationAction.REJECT]: 'Reject',
    [ModerationAction.FLAG]: 'Flag'
  };
  return actionMap[action];
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatValidationError = (error: ValidationErrorType, field?: string): string => {
  const errorMap = {
    [ValidationErrorType.REQUIRED_FIELD]: `${field || 'Field'} is required`,
    [ValidationErrorType.INVALID_FORMAT]: `${field || 'Field'} has invalid format`,
    [ValidationErrorType.FILE_TOO_LARGE]: 'File size exceeds 5MB limit',
    [ValidationErrorType.INVALID_FILE_TYPE]: 'Only JPG and PNG files are allowed'
  };
  return errorMap[error];
};