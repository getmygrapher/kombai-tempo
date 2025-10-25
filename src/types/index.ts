import { 
  ProfessionalCategory, 
  ExperienceLevel, 
  Gender, 
  PricingType, 
  UrgencyLevel, 
  AvailabilityStatus, 
  DistanceRadius, 
  TierType, 
  MessageType, 
  BookingStatus, 
  NotificationType,
  JobStatus,
  ApplicationStatus,
  JobSortOption,
  BudgetType,
  ProfileSection,
  EquipmentCategory,
  VerificationStatus,
  ProfileCompletionStep,
  NotificationPreference
} from './enums';

// Re-export enums for easier importing
export {
  ProfessionalCategory,
  ExperienceLevel,
  Gender,
  PricingType,
  UrgencyLevel,
  AvailabilityStatus,
  DistanceRadius,
  TierType,
  MessageType,
  BookingStatus,
  NotificationType,
  JobStatus,
  ApplicationStatus,
  JobSortOption,
  BudgetType,
  ProfileSection,
  EquipmentCategory,
  VerificationStatus,
  ProfileCompletionStep,
  NotificationPreference
};

// Props types (data passed to components)
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto: string;
  professionalCategory: ProfessionalCategory;
  professionalType: string;
  location: Location;
  tier: TierType;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  joinedDate: string;
  about?: string;
  experience?: ExperienceLevel;
  gender?: Gender;
  alternatePhone?: string;
  preferredWorkLocations?: string[];
  specializations?: string[];
  instagramHandle?: string;
  equipment?: Equipment;
  pricing?: PricingInfo;
}

export interface Location {
  city: string;
  state: string;
  pinCode?: string;
  address?: string;
  coordinates: Coordinates;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Equipment {
  cameras?: string[];
  lenses?: string[];
  lighting?: string[];
  other?: string[];
}

export interface PricingInfo {
  type: PricingType;
  rate: number;
  isNegotiable: boolean;
}

export interface Job {
  id: string;
  title: string;
  type: ProfessionalCategory;
  professionalTypesNeeded: string[];
  date: string;
  endDate?: string;
  timeSlots?: TimeSlot[];
  location: JobLocation;
  budgetRange: BudgetRange;
  description: string;
  urgency: UrgencyLevel;
  postedBy: JobPoster;
  applicants: Application[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isExpired: boolean;
  isSaved?: boolean;
  viewCount: number;
  distance?: number;
}

export interface JobLocation extends Location {
  venueDetails?: string;
  accessInstructions?: string;
  parkingAvailable?: boolean;
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: 'INR';
  type: BudgetType;
  isNegotiable: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicant: Professional;
  message: string;
  proposedRate?: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface JobPoster {
  id: string;
  name: string;
  rating: number;
  totalJobs: number;
}

export interface Professional {
  id: string;
  name: string;
  profilePhoto: string;
  professionalType: string;
  specializations: string[];
  experience: ExperienceLevel;
  location: Location;
  pricing: PricingInfo;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  tier: TierType;
  distance?: number;
  equipment?: Equipment;
  availability?: AvailabilityInfo;
  instagramHandle?: string;
  about?: string;
}

export interface AvailabilityInfo {
  nextAvailable: string;
  isAvailableToday: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: MessageType;
  jobId?: string;
}

export interface CalendarEntry {
  date: string;
  status: AvailabilityStatus;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  status: AvailabilityStatus;
  jobTitle?: string;
  jobId?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  jobId?: string;
  userId?: string;
}

// Store types (global state data)
export interface AppStore {
  user: User | null;
  currentLocation: Coordinates | null;
  selectedRadius: DistanceRadius;
  notifications: Notification[];
  isAuthenticated: boolean;
  currentTab: string;
  searchFilters: SearchFilters;
  jobFilters: JobFilters;
}

export interface SearchFilters {
  professionalTypes: string[];
  experienceLevel: ExperienceLevel[];
  priceRange: { min: number; max: number };
  rating: number;
  distance: DistanceRadius;
  availability: boolean;
  verifiedOnly: boolean;
  equipment: string[];
}

export interface JobFilters {
  categories: ProfessionalCategory[];
  urgency: UrgencyLevel[];
  budgetRange: { min: number; max: number };
  distance: DistanceRadius;
  dateRange: { start: string; end: string };
}

// Profile management type definitions
export interface ProfileStats {
  profileViews: number;
  jobApplications: number;
  successRate: number;
  responseRate: number;
  profileCompletion: number;
}

export interface EquipmentItem {
  id: string;
  category: EquipmentCategory;
  name: string;
  description?: string;
  isIndoorCapable?: boolean;
  isOutdoorCapable?: boolean;
}

export interface NotificationSettings {
  jobAlerts: boolean;
  messageNotifications: boolean;
  bookingUpdates: boolean;
  ratingReminders: boolean;
  marketingCommunications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface ProfileFormData {
  basicInfo: {
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    gender?: Gender;
    profilePhoto?: string;
  };
  location: {
    city: string;
    state: string;
    pinCode?: string;
    address?: string;
    preferredWorkLocations: string[];
  };
  professional: {
    category: ProfessionalCategory;
    type: string;
    specializations: string[];
    experience?: ExperienceLevel;
    about?: string;
    instagramHandle?: string;
  };
  equipment: EquipmentItem[];
  pricing?: PricingInfo;
}

export interface TierBenefits {
  free: string[];
  pro: string[];
}

export interface ProfileManagementProps {
  user: User;
  onProfileUpdate: (data: ProfileFormData) => void;
  onTierUpgrade: () => void;
  onInstagramLink: (handle: string) => void;
  onNotificationUpdate: (settings: NotificationSettings) => void;
}