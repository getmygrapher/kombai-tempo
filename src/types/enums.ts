// Professional categories and types
export enum ProfessionalCategory {
  PHOTOGRAPHY = 'Photography',
  VIDEOGRAPHY = 'Videography & Film',
  AUDIO = 'Audio Production',
  DESIGN = 'Design & Creative',
  MULTI_DISCIPLINARY = 'Multi-Disciplinary'
}

export enum PhotographyType {
  PORTRAIT = 'Portrait Photographer',
  WEDDING = 'Wedding Photographer',
  EVENT = 'Event Photographer',
  COMMERCIAL = 'Commercial Photographer',
  REAL_ESTATE = 'Real Estate Photographer',
  TRAVEL = 'Travel Photographer',
  SPORTS = 'Sports Photographer',
  DOCUMENTARY = 'Documentary Photographer',
  FINE_ART = 'Fine Art Photographer',
  ARCHITECTURAL = 'Architectural Photographer'
}

export enum VideographyType {
  WEDDING = 'Wedding Videographer',
  COMMERCIAL = 'Commercial Videographer',
  MUSIC = 'Music Videographer',
  CONTENT_CREATOR = 'Digital Content Creator',
  BROADCAST = 'Broadcast Videographer'
}

export enum AudioType {
  MIXING = 'Mixing Engineer',
  MASTERING = 'Mastering Engineer',
  LIVE_SOUND = 'Live Sound Engineer'
}

export enum DesignType {
  GRAPHIC = 'Graphic Designer',
  SOCIAL_MEDIA = 'Social Media Designer',
  ILLUSTRATOR = 'Illustrator',
  CREATIVE_DIRECTOR = 'Creative Director'
}

export enum MultiDisciplinaryType {
  CONTENT_CREATOR = 'Content Creator',
  VISUAL_STORYTELLER = 'Visual Storyteller',
  BRAND_SPECIALIST = 'Brand Specialist',
  SOCIAL_MEDIA_MANAGER = 'Social Media Manager',
  EVENT_PLANNER = 'Event Planner'
}

export enum ExperienceLevel {
  ENTRY = '0-1 years',
  JUNIOR = '1-3 years',
  MID = '3-5 years',
  SENIOR = '5-10 years',
  EXPERT = '10+ years'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
  PREFER_NOT_TO_SAY = 'Prefer not to say'
}

export enum PricingType {
  PER_HOUR = 'Per Hour',
  PER_DAY = 'Per Day',
  PER_EVENT = 'Per Event'
}

export enum UrgencyLevel {
  NORMAL = 'Normal',
  URGENT = 'Urgent',
  EMERGENCY = 'Emergency'
}

export enum AvailabilityStatus {
  AVAILABLE = 'Available',
  PARTIALLY_AVAILABLE = 'Partially Available',
  UNAVAILABLE = 'Unavailable',
  BOOKED = 'Booked'
}

export enum DistanceRadius {
  FIVE_KM = '5km',
  TEN_KM = '10km',
  TWENTY_FIVE_KM = '25km',
  FIFTY_KM = '50km',
  HUNDRED_PLUS_KM = '100km+'
}

export enum TierType {
  FREE = 'Free',
  PRO = 'Pro'
}

export enum MessageType {
  TEXT = 'text',
  JOB_INQUIRY = 'job_inquiry',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  CONTACT_SHARE = 'contact_share'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum NotificationType {
  NEW_JOB = 'new_job',
  MESSAGE = 'message',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  RATING_REMINDER = 'rating_reminder',
  PROFILE_VIEW = 'profile_view'
}

// Job posting related enums
export enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active', 
  CLOSED = 'closed',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  HIRED = 'hired',
  WITHDRAWN = 'withdrawn'
}

export enum JobSortOption {
  DISTANCE = 'distance',
  DATE_POSTED = 'date_posted',
  BUDGET_HIGH_TO_LOW = 'budget_high_to_low',
  BUDGET_LOW_TO_HIGH = 'budget_low_to_high',
  URGENCY = 'urgency'
}

export enum BudgetType {
  FIXED = 'fixed',
  HOURLY = 'hourly', 
  PROJECT = 'project'
}

// Profile management related enums
export enum ProfileSection {
  BASIC_INFO = 'basic_info',
  PROFESSIONAL_DETAILS = 'professional_details',
  EQUIPMENT = 'equipment',
  PRICING = 'pricing',
  INSTAGRAM = 'instagram',
  PRIVACY = 'privacy',
  TIER = 'tier'
}

export enum EquipmentCategory {
  CAMERAS = 'cameras',
  LENSES = 'lenses', 
  LIGHTING = 'lighting',
  SUPPORT_GEAR = 'support_gear',
  AUDIO = 'audio',
  OTHER = 'other'
}

export enum VerificationStatus {
  NOT_VERIFIED = 'not_verified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum ProfileCompletionStep {
  BASIC_INFO = 'basic_info',
  PROFESSIONAL_DETAILS = 'professional_details', 
  EQUIPMENT = 'equipment',
  PRICING = 'pricing',
  PORTFOLIO = 'portfolio',
  VERIFICATION = 'verification'
}

export enum NotificationPreference {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  NONE = 'none'
}

// Profile management related enums
export enum ProfileEditSection {
  BASIC_INFO = 'basic_info',
  PROFESSIONAL = 'professional',
  PRICING = 'pricing'
}

export enum EquipmentCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair'
}

export enum PricingStructure {
  PER_HOUR = 'per_hour',
  PER_DAY = 'per_day',
  PER_EVENT = 'per_event'
}

export enum VisibilityLevel {
  PUBLIC = 'public',
  NETWORK = 'network',
  PRIVATE = 'private'
}

export enum ProfileAnalyticsMetric {
  VIEWS = 'views',
  SAVES = 'saves',
  CONTACT_REQUESTS = 'contact_requests',
  COMPLETION_RATE = 'completion_rate'
}

export enum InstagramConnectionStatus {
  NOT_CONNECTED = 'not_connected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}