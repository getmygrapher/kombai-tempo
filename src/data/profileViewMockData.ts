// Profile view related enums
export enum ProfileViewMode {
  PUBLIC = 'public',
  DETAILED = 'detailed', 
  MOBILE = 'mobile',
  PREVIEW = 'preview'
}

export enum ProfileTab {
  OVERVIEW = 'overview',
  PORTFOLIO = 'portfolio',
  EQUIPMENT = 'equipment', 
  REVIEWS = 'reviews',
  AVAILABILITY = 'availability'
}

export enum ContactMethod {
  MESSAGE = 'message',
  PHONE = 'phone',
  EMAIL = 'email',
  BOOKING = 'booking'
}

export enum ProfileAction {
  SAVE = 'save',
  SHARE = 'share',
  REPORT = 'report',
  CONTACT = 'contact',
  BOOK = 'book'
}

export enum ViewerPermissionLevel {
  PUBLIC = 'public',
  REGISTERED = 'registered',
  VERIFIED = 'verified',
  PROFESSIONAL = 'professional'
}

export enum PortfolioItemType {
  IMAGE = 'image',
  VIDEO = 'video',
  INSTAGRAM_POST = 'instagram_post',
  EXTERNAL_LINK = 'external_link'
}

export enum EquipmentAvailabilityStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  UNAVAILABLE = 'unavailable'
}

// Profile view specific formatters
export const formatProfileViewCount = (count: number): string => {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  return `${Math.floor(count / 1000)}K`;
};

export const formatResponseTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr`;
  return `${Math.floor(minutes / 1440)} day`;
};

export const formatCompletedJobs = (count: number): string => {
  if (count === 0) return 'No jobs completed';
  if (count === 1) return '1 job completed';
  return `${count} jobs completed`;
};

export const formatYearsExperience = (years: number): string => {
  if (years < 1) return 'Less than 1 year';
  if (years === 1) return '1 year experience';
  return `${years} years experience`;
};

export const formatPortfolioCount = (count: number): string => {
  if (count === 0) return 'No portfolio items';
  if (count === 1) return '1 portfolio item';
  return `${count} portfolio items`;
};

export const formatEquipmentAvailability = (status: string): string => {
  switch (status) {
    case 'available': return 'Available';
    case 'in_use': return 'Currently in use';
    case 'maintenance': return 'Under maintenance';
    case 'unavailable': return 'Not available';
    default: return 'Status unknown';
  }
};

export const formatLastActive = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 5) return 'Online now';
  if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;
  if (diffInHours < 24) return `Active ${diffInHours}h ago`;
  if (diffInDays === 1) return 'Active yesterday';
  if (diffInDays < 7) return `Active ${diffInDays}d ago`;
  return 'Active over a week ago';
};

export const formatPricingRange = (min: number, max: number, type: string): string => {
  if (min === max) return `₹${min.toLocaleString('en-IN')} ${type}`;
  return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')} ${type}`;
};

export const formatAvailabilityStatus = (status: string): string => {
  switch (status) {
    case 'available': return 'Available';
    case 'partially_available': return 'Partially Available';
    case 'unavailable': return 'Unavailable';
    case 'booked': return 'Booked';
    default: return 'Status Unknown';
  }
};

// Profile view data type definitions
export interface ProfileViewData {
  professional: Professional;
  portfolio: PortfolioItem[];
  reviews: Review[];
  availability: AvailabilityInfo;
  equipment: EquipmentInfo;
  analytics: ProfileAnalytics;
  viewerPermissions: ViewerPermissions;
}

export interface Professional {
  id: string;
  name: string;
  profilePhoto: string;
  coverPhoto?: string;
  professionalType: string;
  category: string;
  specializations: string[];
  experience: string;
  location: LocationInfo;
  about: string;
  isVerified: boolean;
  tier: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  responseTime: string;
  lastActive: Date;
  joinedDate: Date;
  instagramHandle?: string;
  portfolioLinks: string[];
}

export interface PortfolioItem {
  id: string;
  type: 'image' | 'video' | 'instagram_post' | 'external_link';
  url: string;
  title: string;
  description: string;
  category: string;
  date: Date;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: Date;
  projectType: string;
  isVerified: boolean;
}

export interface AvailabilityInfo {
  nextAvailable: Date;
  calendar: CalendarEntry[];
}

export interface CalendarEntry {
  date: string;
  status: 'available' | 'partially_available' | 'unavailable' | 'booked';
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
  status: 'available' | 'booked';
  jobTitle?: string;
}

export interface EquipmentInfo {
  cameras: EquipmentItem[];
  lenses: EquipmentItem[];
  lighting: EquipmentItem[];
  other: EquipmentItem[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in_use' | 'maintenance' | 'unavailable';
  condition: string;
  isIndoorCapable?: boolean;
  isOutdoorCapable?: boolean;
}

export interface ProfileAnalytics {
  profileViews: number;
  contactRequests: number;
  bookingConversions: number;
  averageResponseTime: number;
  profileCompletionScore: number;
}

export interface ViewerPermissions {
  canViewContact: boolean;
  canViewInstagram: boolean;
  canViewAvailability: boolean;
  canViewEquipment: boolean;
  canSendMessage: boolean;
  canViewPricing: boolean;
}

export interface LocationInfo {
  city: string;
  state: string;
  pinCode?: string;
  address?: string;
  coordinates: { lat: number; lng: number };
}

// API request types
export interface ContactRequest {
  professionalId: string;
  method: 'message' | 'phone' | 'email';
  message?: string;
}

export interface BookingRequest {
  professionalId: string;
  projectType: string;
  date: Date;
  duration: number;
  message: string;
}

// Props type definitions
export interface ProfileViewProps {
  professionalId: string;
  viewMode: 'public' | 'detailed' | 'mobile' | 'preview';
  currentUserId?: string;
  onContactProfessional: (professionalId: string, method: string) => void;
  onBookProfessional: (professionalId: string) => void;
  onSaveProfile: (professionalId: string) => void;
  onShareProfile: (professionalId: string) => void;
  onReportProfile: (professionalId: string) => void;
}

// Mock data for profile view system
export const mockProfileViewData: ProfileViewData = {
  professional: {
    id: 'prof_123',
    name: 'Arjun Menon',
    profilePhoto: 'https://i.pravatar.cc/150?img=1',
    coverPhoto: 'https://images.unsplash.com/photo-1579529535833-84aa134a2a3e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw5fHxjYW1lcmElMjBwaG90b2dyYXBoeSUyMHN0dWRpbyUyMGVxdWlwbWVudCUyMHdvcmtzcGFjZXxlbnwwfDB8fHwxNzU4MTg5NjU4fDA&ixlib=rb-4.1.0&q=85',
    professionalType: 'Wedding Photographer',
    category: 'Photography',
    specializations: ['Wedding Photography', 'Portrait Photography', 'Event Photography'],
    experience: '3-5 years',
    location: {
      city: 'Kochi',
      state: 'Kerala',
      pinCode: '682001',
      address: 'Marine Drive, Ernakulam',
      coordinates: { lat: 9.9312, lng: 76.2673 }
    },
    about: 'Passionate wedding photographer with 4 years of experience capturing beautiful moments across Kerala. Specialized in candid photography and traditional ceremonies with a modern artistic approach.',
    isVerified: true,
    tier: 'Pro',
    rating: 4.8,
    totalReviews: 47,
    completedJobs: 156,
    responseTime: 'within 2 hours',
    lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    joinedDate: new Date('2023-01-15'),
    instagramHandle: '@arjun_captures',
    portfolioLinks: ['https://arjuncaptures.com', 'https://behance.net/arjuncaptures']
  },
  portfolio: [
    {
      id: 'port_1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
      title: 'Traditional Kerala Wedding',
      description: 'Beautiful traditional ceremony at Guruvayur Temple',
      category: 'Wedding Photography',
      date: new Date('2024-01-15')
    },
    {
      id: 'port_2', 
      type: 'image',
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
      title: 'Couple Portrait Session',
      description: 'Romantic pre-wedding shoot at Fort Kochi',
      category: 'Portrait Photography',
      date: new Date('2024-01-10')
    },
    {
      id: 'port_3',
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
      title: 'Corporate Event Coverage',
      description: 'Annual conference documentation',
      category: 'Event Photography',
      date: new Date('2024-01-05')
    },
    {
      id: 'port_4',
      type: 'instagram_post',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
      title: 'Recent Instagram Post',
      description: 'Behind the scenes from latest wedding shoot',
      category: 'Wedding Photography',
      date: new Date('2024-01-20')
    }
  ],
  reviews: [
    {
      id: 'rev_1',
      clientName: 'Priya & Karthik',
      rating: 5,
      comment: 'Arjun captured our wedding beautifully! His candid shots are amazing and he made us feel so comfortable throughout the day.',
      date: new Date('2024-01-18'),
      projectType: 'Wedding Photography',
      isVerified: true
    },
    {
      id: 'rev_2',
      clientName: 'Meera Nair',
      rating: 5,
      comment: 'Excellent portrait session! Very professional and creative. Highly recommend for anyone looking for quality photography.',
      date: new Date('2024-01-12'),
      projectType: 'Portrait Photography', 
      isVerified: true
    },
    {
      id: 'rev_3',
      clientName: 'Tech Solutions Pvt Ltd',
      rating: 4,
      comment: 'Great work on our corporate event. Delivered all photos on time and quality was excellent.',
      date: new Date('2024-01-08'),
      projectType: 'Event Photography',
      isVerified: true
    }
  ],
  availability: {
    nextAvailable: new Date('2024-02-01'),
    calendar: [
      {
        date: '2024-02-01',
        status: 'available',
        timeSlots: [
          { start: '09:00', end: '17:00', status: 'available' }
        ]
      },
      {
        date: '2024-02-02', 
        status: 'partially_available',
        timeSlots: [
          { start: '09:00', end: '12:00', status: 'available' },
          { start: '14:00', end: '18:00', status: 'booked', jobTitle: 'Corporate Event' }
        ]
      },
      {
        date: '2024-02-03',
        status: 'booked',
        timeSlots: [
          { start: '08:00', end: '20:00', status: 'booked', jobTitle: 'Wedding Photography' }
        ]
      }
    ]
  },
  equipment: {
    cameras: [
      {
        id: 'cam_1',
        name: 'Canon EOS R5',
        category: 'Primary Camera',
        status: 'available',
        condition: 'Excellent'
      },
      {
        id: 'cam_2', 
        name: 'Sony A7IV',
        category: 'Secondary Camera',
        status: 'available',
        condition: 'Very Good'
      }
    ],
    lenses: [
      {
        id: 'lens_1',
        name: '24-70mm f/2.8',
        category: 'Standard Zoom',
        status: 'available',
        condition: 'Excellent'
      },
      {
        id: 'lens_2',
        name: '85mm f/1.8',
        category: 'Portrait Lens', 
        status: 'available',
        condition: 'Excellent'
      },
      {
        id: 'lens_3',
        name: '50mm f/1.4',
        category: 'Prime Lens',
        status: 'available',
        condition: 'Very Good'
      }
    ],
    lighting: [
      {
        id: 'light_1',
        name: 'LED Panel Lights',
        category: 'Continuous Lighting',
        status: 'available',
        condition: 'Excellent',
        isIndoorCapable: true,
        isOutdoorCapable: false
      },
      {
        id: 'light_2',
        name: 'Softbox Kit',
        category: 'Studio Lighting',
        status: 'available',
        condition: 'Very Good',
        isIndoorCapable: true,
        isOutdoorCapable: true
      }
    ],
    other: [
      {
        id: 'other_1',
        name: 'Carbon Fiber Tripod',
        category: 'Support Gear',
        status: 'available',
        condition: 'Excellent'
      },
      {
        id: 'other_2',
        name: 'Gimbal Stabilizer', 
        category: 'Stabilization',
        status: 'available',
        condition: 'Very Good'
      }
    ]
  },
  analytics: {
    profileViews: 1247,
    contactRequests: 89,
    bookingConversions: 23,
    averageResponseTime: 45, // minutes
    profileCompletionScore: 95
  },
  viewerPermissions: {
    canViewContact: true,
    canViewInstagram: true,
    canViewAvailability: true,
    canViewEquipment: true,
    canSendMessage: true,
    canViewPricing: true
  }
};

export const mockRootProps = {
  professionalId: 'prof_123',
  viewMode: 'detailed' as const,
  currentUserId: 'user_456',
  onContactProfessional: (professionalId: string, method: string) => {
    console.log('Contact professional:', professionalId, method);
  },
  onBookProfessional: (professionalId: string) => {
    console.log('Book professional:', professionalId);
  },
  onSaveProfile: (professionalId: string) => {
    console.log('Save profile:', professionalId);
  },
  onShareProfile: (professionalId: string) => {
    console.log('Share profile:', professionalId);
  },
  onReportProfile: (professionalId: string) => {
    console.log('Report profile:', professionalId);
  }
};