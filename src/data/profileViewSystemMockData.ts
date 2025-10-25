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
export const mockStore = {
  currentUser: {
    id: 'user_456',
    name: 'Current User',
    tier: 'free' as const
  },
  profileViewHistory: [
    'prof_123',
    'prof_124', 
    'prof_125'
  ],
  savedProfiles: [
    'prof_123'
  ]
};

// Multiple professional profiles data
export const mockProfessionalsData: Record<string, ProfileViewData> = {
  'prof_1': {
    professional: {
      id: 'prof_1',
      name: 'Kavya Krishnan',
      profilePhoto: 'https://i.pravatar.cc/150?img=5',
      coverPhoto: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBob3RvZ3JhcGh5JTIwY29ycG9yYXRlJTIwY29uZmVyZW5jZXxlbnwwfDB8fHwxNzU4MTg5NjU4fDA&ixlib=rb-4.1.0&q=85',
      professionalType: 'Portrait Photographer',
      category: 'Photography',
      specializations: ['Portrait Photography', 'Fashion Photography'],
      experience: '3-5 years',
      location: {
        city: 'Kochi',
        state: 'Kerala',
        pinCode: '682001',
        address: 'Marine Drive, Ernakulam',
        coordinates: { lat: 9.9312, lng: 76.2673 }
      },
      about: 'Passionate portrait photographer with expertise in fashion and lifestyle photography. I specialize in capturing authentic emotions and creating stunning visual narratives that tell your unique story.',
      isVerified: true,
      tier: 'Pro',
      rating: 4.7,
      totalReviews: 89,
      completedJobs: 134,
      responseTime: 'within 3 hours',
      lastActive: new Date(Date.now() - 45 * 60 * 1000),
      joinedDate: new Date('2023-03-10'),
      instagramHandle: '@kavya_portraits',
      portfolioLinks: ['https://kavyakrishnan.photography', 'https://behance.net/kavyakrishnan']
    },
    portfolio: [
      {
        id: 'port_k1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
        title: 'Fashion Portrait Session',
        description: 'Professional fashion shoot with natural lighting',
        category: 'Fashion Photography',
        date: new Date('2024-01-18')
      },
      {
        id: 'port_k2',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
        title: 'Corporate Headshots',
        description: 'Professional headshots for business executives',
        category: 'Portrait Photography',
        date: new Date('2024-01-12')
      },
      {
        id: 'port_k3',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
        title: 'Lifestyle Portrait',
        description: 'Candid lifestyle photography session',
        category: 'Portrait Photography',
        date: new Date('2024-01-08')
      },
      {
        id: 'port_k4',
        type: 'instagram_post' as const,
        url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHx2aWRlb2dyYXBoeSUyMGNpbmVtYXRpYyUyMHdlZGRpbmd8ZW58MHwwfHx8MTc1ODE4OTY1OHww&ixlib=rb-4.1.0&q=85',
        title: 'Recent Instagram Post',
        description: 'Behind the scenes from latest fashion shoot',
        category: 'Fashion Photography',
        date: new Date('2024-01-22')
      }
    ],
    reviews: [
      {
        id: 'rev_k1',
        clientName: 'Ananya Menon',
        rating: 5,
        comment: 'Kavya is incredibly talented! She made me feel so comfortable during the shoot and the photos turned out absolutely stunning. Highly recommend!',
        date: new Date('2024-01-20'),
        projectType: 'Portrait Photography',
        isVerified: true
      },
      {
        id: 'rev_k2',
        clientName: 'Fashion House Mumbai',
        rating: 5,
        comment: 'Professional, creative, and delivered exceptional results. Kavya understood our vision perfectly and exceeded our expectations.',
        date: new Date('2024-01-14'),
        projectType: 'Fashion Photography',
        isVerified: true
      },
      {
        id: 'rev_k3',
        clientName: 'Ravi Sharma',
        rating: 4,
        comment: 'Great experience working with Kavya. She has a great eye for detail and captured exactly what we were looking for.',
        date: new Date('2024-01-10'),
        projectType: 'Corporate Photography',
        isVerified: true
      }
    ],
    equipment: {
      cameras: [
        {
          id: 'cam_k1',
          name: 'Canon EOS R5',
          category: 'Primary Camera',
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'cam_k2',
          name: 'Sony A7IV',
          category: 'Secondary Camera',
          status: 'available' as const,
          condition: 'Very Good'
        }
      ],
      lenses: [
        {
          id: 'lens_k1',
          name: '24-70mm f/2.8',
          category: 'Standard Zoom',
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'lens_k2',
          name: '85mm f/1.8',
          category: 'Portrait Lens',
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'lens_k3',
          name: '50mm f/1.4',
          category: 'Prime Lens',
          status: 'available' as const,
          condition: 'Very Good'
        }
      ],
      lighting: [
        {
          id: 'light_k1',
          name: 'Studio Strobes',
          category: 'Studio Lighting',
          status: 'available' as const,
          condition: 'Excellent',
          isIndoorCapable: true,
          isOutdoorCapable: false
        },
        {
          id: 'light_k2',
          name: 'LED Panels',
          category: 'Continuous Lighting',
          status: 'available' as const,
          condition: 'Very Good',
          isIndoorCapable: true,
          isOutdoorCapable: true
        }
      ],
      other: [
        {
          id: 'other_k1',
          name: 'Professional Tripod',
          category: 'Support Gear',
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'other_k2',
          name: 'Reflector Kit',
          category: 'Lighting Modifier',
          status: 'available' as const,
          condition: 'Very Good'
        }
      ]
    },
    availability: {
      nextAvailable: new Date('2024-01-25'),
      calendar: [
        {
          date: '2024-01-25',
          status: 'available' as const,
          timeSlots: [
            { start: '10:00', end: '18:00', status: 'available' as const }
          ]
        },
        {
          date: '2024-01-26',
          status: 'partially_available' as const,
          timeSlots: [
            { start: '09:00', end: '13:00', status: 'available' as const },
            { start: '15:00', end: '19:00', status: 'booked' as const, jobTitle: 'Fashion Shoot' }
          ]
        },
        {
          date: '2024-01-27',
          status: 'booked' as const,
          timeSlots: [
            { start: '09:00', end: '17:00', status: 'booked' as const, jobTitle: 'Corporate Headshots' }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 892,
      contactRequests: 67,
      bookingConversions: 28,
      averageResponseTime: 75,
      profileCompletionScore: 92
    },
    viewerPermissions: {
      canViewContact: true,
      canViewInstagram: true,
      canViewAvailability: true,
      canViewEquipment: true,
      canSendMessage: true,
      canViewPricing: true
    }
  },
  'prof_123': {
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
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      joinedDate: new Date('2023-01-15'),
      instagramHandle: '@arjun_captures',
      portfolioLinks: ['https://arjuncaptures.com', 'https://behance.net/arjuncaptures']
    },
    portfolio: [
      {
        id: 'port_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
        title: 'Traditional Kerala Wedding',
        description: 'Beautiful traditional ceremony at Guruvayur Temple',
        category: 'Wedding Photography',
        date: new Date('2024-01-15')
      },
      {
        id: 'port_2', 
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
        title: 'Couple Portrait Session',
        description: 'Romantic pre-wedding shoot at Fort Kochi',
        category: 'Portrait Photography',
        date: new Date('2024-01-10')
      },
      {
        id: 'port_3',
        type: 'image' as const, 
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
        title: 'Corporate Event Coverage',
        description: 'Annual conference documentation',
        category: 'Event Photography',
        date: new Date('2024-01-05')
      },
      {
        id: 'port_4',
        type: 'instagram_post' as const,
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
    equipment: {
      cameras: [
        {
          id: 'cam_1',
          name: 'Canon EOS R5',
          category: 'Primary Camera',
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'cam_2', 
          name: 'Sony A7IV',
          category: 'Secondary Camera',
          status: 'available' as const,
          condition: 'Very Good'
        }
      ],
      lenses: [
        {
          id: 'lens_1',
          name: '24-70mm f/2.8',
          category: 'Standard Zoom',
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'lens_2',
          name: '85mm f/1.8',
          category: 'Portrait Lens', 
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'lens_3',
          name: '50mm f/1.4',
          category: 'Prime Lens',
          status: 'available' as const,
          condition: 'Very Good'
        }
      ],
      lighting: [
        {
          id: 'light_1',
          name: 'LED Panel Lights',
          category: 'Continuous Lighting',
          status: 'available' as const,
          condition: 'Excellent',
          isIndoorCapable: true,
          isOutdoorCapable: false
        },
        {
          id: 'light_2',
          name: 'Softbox Kit',
          category: 'Studio Lighting',
          status: 'available' as const,
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
          status: 'available' as const,
          condition: 'Excellent'
        },
        {
          id: 'other_2',
          name: 'Gimbal Stabilizer', 
          category: 'Stabilization',
          status: 'available' as const,
          condition: 'Very Good'
        }
      ]
    },
    availability: {
      nextAvailable: new Date('2024-02-01'),
      calendar: [
        {
          date: '2024-02-01',
          status: 'available' as const,
          timeSlots: [
            { start: '09:00', end: '17:00', status: 'available' as const }
          ]
        },
        {
          date: '2024-02-02', 
          status: 'partially_available' as const,
          timeSlots: [
            { start: '09:00', end: '12:00', status: 'available' as const },
            { start: '14:00', end: '18:00', status: 'booked' as const, jobTitle: 'Corporate Event' }
          ]
        },
        {
          date: '2024-02-03',
          status: 'booked' as const,
          timeSlots: [
            { start: '08:00', end: '20:00', status: 'booked' as const, jobTitle: 'Wedding Photography' }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 1247,
      contactRequests: 89,
      bookingConversions: 23,
      averageResponseTime: 45,
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
  },
  'prof_124': {
    professional: {
      id: 'prof_124',
      name: 'Priya Sharma',
      profilePhoto: 'https://i.pravatar.cc/150?img=2',
      coverPhoto: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBob3RvZ3JhcGh5JTIwY29ycG9yYXRlJTIwY29uZmVyZW5jZXxlbnwwfDB8fHwxNzU4MTg5NjU4fDA&ixlib=rb-4.1.0&q=85',
      professionalType: 'Event Photographer',
      category: 'Photography',
      specializations: ['Event Photography', 'Corporate Photography', 'Conference Photography'],
      experience: '5-10 years',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        address: 'Bandra West, Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      about: 'Professional event photographer with 7 years of experience in corporate events, conferences, and brand activations. Specialized in capturing dynamic moments and creating compelling visual narratives for businesses.',
      isVerified: true,
      tier: 'Pro',
      rating: 4.9,
      totalReviews: 63,
      completedJobs: 234,
      responseTime: 'within 1 hour',
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      joinedDate: new Date('2022-08-20'),
      instagramHandle: '@priya_events',
      portfolioLinks: ['https://priyasharma.photography', 'https://behance.net/priyasharma']
    },
    portfolio: [
      {
        id: 'port_p1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
        title: 'Corporate Conference 2024',
        description: 'Annual tech conference with 500+ attendees',
        category: 'Corporate Photography',
        date: new Date('2024-01-20')
      },
      {
        id: 'port_p2',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop',
        title: 'Product Launch Event',
        description: 'High-profile product launch in Mumbai',
        category: 'Event Photography',
        date: new Date('2024-01-15')
      }
    ],
    reviews: [
      {
        id: 'rev_p1',
        clientName: 'TechCorp India',
        rating: 5,
        comment: 'Priya delivered exceptional photos for our annual conference. Her attention to detail and professionalism was outstanding.',
        date: new Date('2024-01-22'),
        projectType: 'Corporate Photography',
        isVerified: true
      }
    ],
    equipment: {
      cameras: [
        {
          id: 'cam_p1',
          name: 'Canon EOS R6 Mark II',
          category: 'Primary Camera',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ],
      lenses: [
        {
          id: 'lens_p1',
          name: '24-105mm f/4',
          category: 'Standard Zoom',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ],
      lighting: [
        {
          id: 'light_p1',
          name: 'Profoto B10',
          category: 'Studio Flash',
          status: 'available' as const,
          condition: 'Excellent',
          isIndoorCapable: true,
          isOutdoorCapable: true
        }
      ],
      other: []
    },
    availability: {
      nextAvailable: new Date('2024-02-05'),
      calendar: [
        {
          date: '2024-02-05',
          status: 'available' as const,
          timeSlots: [
            { start: '10:00', end: '18:00', status: 'available' as const }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 892,
      contactRequests: 67,
      bookingConversions: 34,
      averageResponseTime: 30,
      profileCompletionScore: 98
    },
    viewerPermissions: {
      canViewContact: true,
      canViewInstagram: true,
      canViewAvailability: true,
      canViewEquipment: true,
      canSendMessage: true,
      canViewPricing: true
    }
  },
  'prof_125': {
    professional: {
      id: 'prof_125',
      name: 'Raj Kumar',
      profilePhoto: 'https://i.pravatar.cc/150?img=3',
      coverPhoto: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHx2aWRlb2dyYXBoeSUyMGNpbmVtYXRpYyUyMHdlZGRpbmd8ZW58MHwwfHx8MTc1ODE4OTY1OHww&ixlib=rb-4.1.0&q=85',
      professionalType: 'Videographer',
      category: 'Videography',
      specializations: ['Wedding Videographer', 'Commercial Videos', 'Documentary'],
      experience: '1-3 years',
      location: {
        city: 'Bangalore',
        state: 'Karnataka',
        pinCode: '560001',
        address: 'Koramangala, Bangalore',
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
      about: 'Creative videographer passionate about storytelling through cinematic visuals. Specializing in wedding films and commercial content with a focus on authentic moments and emotional narratives.',
      isVerified: false,
      tier: 'Free',
      rating: 4.7,
      totalReviews: 35,
      completedJobs: 78,
      responseTime: 'within 4 hours',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      joinedDate: new Date('2023-06-10'),
      instagramHandle: '@raj_films',
      portfolioLinks: ['https://rajkumar.video']
    },
    portfolio: [
      {
        id: 'port_r1',
        type: 'video' as const,
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
        title: 'Wedding Highlight Reel',
        description: 'Cinematic wedding film in Bangalore',
        category: 'Wedding Videography',
        date: new Date('2024-01-12')
      }
    ],
    reviews: [
      {
        id: 'rev_r1',
        clientName: 'Anita & Suresh',
        rating: 5,
        comment: 'Raj created a beautiful wedding film that perfectly captured our special day. His creativity and professionalism exceeded our expectations.',
        date: new Date('2024-01-15'),
        projectType: 'Wedding Videography',
        isVerified: true
      }
    ],
    equipment: {
      cameras: [
        {
          id: 'cam_r1',
          name: 'Sony A7S III',
          category: 'Video Camera',
          status: 'available' as const,
          condition: 'Very Good'
        }
      ],
      lenses: [
        {
          id: 'lens_r1',
          name: '24-70mm f/2.8',
          category: 'Standard Zoom',
          status: 'available' as const,
          condition: 'Good'
        }
      ],
      lighting: [],
      other: [
        {
          id: 'other_r1',
          name: 'DJI Ronin SC',
          category: 'Gimbal',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ]
    },
    availability: {
      nextAvailable: new Date('2024-02-10'),
      calendar: [
        {
          date: '2024-02-10',
          status: 'available' as const,
          timeSlots: [
            { start: '09:00', end: '17:00', status: 'available' as const }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 456,
      contactRequests: 23,
      bookingConversions: 12,
      averageResponseTime: 120,
      profileCompletionScore: 85
    },
    viewerPermissions: {
      canViewContact: true,
      canViewInstagram: false,
      canViewAvailability: true,
      canViewEquipment: true,
      canSendMessage: true,
      canViewPricing: true
    }
  },
  'prof_featured_1': {
    professional: {
      id: 'prof_featured_1',
      name: 'Kavya Krishnan',
      profilePhoto: 'https://i.pravatar.cc/150?img=5',
      coverPhoto: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBob3RvZ3JhcGh5JTIwY29ycG9yYXRlJTIwY29uZmVyZW5jZXxlbnwwfDB8fHwxNzU4MTg5NjU4fDA&ixlib=rb-4.1.0&q=85',
      professionalType: 'Portrait Photographer',
      category: 'Photography',
      specializations: ['Portrait', 'Fashion', 'Lifestyle'],
      experience: '3-5 years',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        address: 'Bandra West, Mumbai',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      },
      about: 'Passionate portrait photographer with expertise in fashion and lifestyle photography. I capture authentic moments and create stunning visual stories.',
      isVerified: true,
      tier: 'Pro',
      rating: 4.9,
      totalReviews: 156,
      completedJobs: 234,
      responseTime: 'within 1 hour',
      lastActive: new Date(Date.now() - 15 * 60 * 1000),
      joinedDate: new Date('2023-03-15'),
      instagramHandle: '@kavya_portraits',
      portfolioLinks: ['https://kavyakrishnan.photography', 'https://behance.net/kavyakrishnan']
    },
    portfolio: [
      {
        id: 'port_f1_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
        title: 'Fashion Portrait Series',
        description: 'High-end fashion portraits for emerging designers',
        category: 'Fashion Photography',
        date: new Date('2024-01-10')
      }
    ],
    reviews: [
      {
        id: 'rev_f1_1',
        clientName: 'Fashion House Mumbai',
        rating: 5,
        comment: 'Kavya has an incredible eye for detail and makes everyone feel comfortable during shoots.',
        date: new Date('2024-01-12'),
        projectType: 'Fashion Photography',
        isVerified: true
      }
    ],
    equipment: {
      cameras: [
        {
          id: 'cam_f1_1',
          name: 'Canon EOS R5',
          category: 'Primary Camera',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ],
      lenses: [
        {
          id: 'lens_f1_1',
          name: '85mm f/1.8',
          category: 'Portrait Lens',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ],
      lighting: [
        {
          id: 'light_f1_1',
          name: 'Studio Strobes',
          category: 'Studio Lighting',
          status: 'available' as const,
          condition: 'Excellent',
          isIndoorCapable: true,
          isOutdoorCapable: false
        }
      ],
      other: []
    },
    availability: {
      nextAvailable: new Date('2024-01-18'),
      calendar: [
        {
          date: '2024-01-18',
          status: 'available' as const,
          timeSlots: [
            { start: '10:00', end: '18:00', status: 'available' as const }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 1245,
      contactRequests: 89,
      bookingConversions: 78,
      averageResponseTime: 30,
      profileCompletionScore: 98
    },
    viewerPermissions: {
      canViewContact: true,
      canViewInstagram: true,
      canViewAvailability: true,
      canViewEquipment: true,
      canSendMessage: true,
      canViewPricing: true
    }
  },
  'prof_featured_2': {
    professional: {
      id: 'prof_featured_2',
      name: 'Aditya Menon',
      profilePhoto: 'https://i.pravatar.cc/150?img=8',
      coverPhoto: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHx2aWRlb2dyYXBoeSUyMGNpbmVtYXRpYyUyMHdlZGRpbmd8ZW58MHwwfHx8MTc1ODE4OTY1OHww&ixlib=rb-4.1.0&q=85',
      professionalType: 'Wedding Videographer',
      category: 'Videography',
      specializations: ['Cinematic', 'Traditional', 'Destination Weddings'],
      experience: '5-10 years',
      location: {
        city: 'Delhi',
        state: 'Delhi',
        pinCode: '110001',
        address: 'Connaught Place, New Delhi',
        coordinates: { lat: 28.6139, lng: 77.2090 }
      },
      about: 'Cinematic wedding videographer creating timeless memories. I specialize in capturing the emotion and beauty of your special day.',
      isVerified: true,
      tier: 'Pro',
      rating: 4.8,
      totalReviews: 89,
      completedJobs: 156,
      responseTime: 'within 2 hours',
      lastActive: new Date(Date.now() - 20 * 60 * 1000),
      joinedDate: new Date('2022-11-20'),
      instagramHandle: '@aditya_films',
      portfolioLinks: ['https://adityamenon.video']
    },
    portfolio: [
      {
        id: 'port_f2_1',
        type: 'video' as const,
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
        title: 'Destination Wedding Film',
        description: 'Cinematic wedding film shot in Rajasthan',
        category: 'Wedding Videography',
        date: new Date('2024-01-08')
      }
    ],
    reviews: [
      {
        id: 'rev_f2_1',
        clientName: 'Sharma Wedding',
        rating: 5,
        comment: 'Aditya captured our wedding beautifully. The cinematic quality is outstanding.',
        date: new Date('2024-01-10'),
        projectType: 'Wedding Videography',
        isVerified: true
      }
    ],
    equipment: {
      cameras: [
        {
          id: 'cam_f2_1',
          name: 'Sony FX6 Cinema Camera',
          category: 'Cinema Camera',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ],
      lenses: [],
      lighting: [],
      other: [
        {
          id: 'other_f2_1',
          name: 'DJI Drone',
          category: 'Drone',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ]
    },
    availability: {
      nextAvailable: new Date('2024-01-20'),
      calendar: [
        {
          date: '2024-01-20',
          status: 'available' as const,
          timeSlots: [
            { start: '09:00', end: '19:00', status: 'available' as const }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 987,
      contactRequests: 67,
      bookingConversions: 85,
      averageResponseTime: 45,
      profileCompletionScore: 96
    },
    viewerPermissions: {
      canViewContact: true,
      canViewInstagram: true,
      canViewAvailability: true,
      canViewEquipment: true,
      canSendMessage: true,
      canViewPricing: true
    }
  },
  'prof_trending_1': {
    professional: {
      id: 'prof_trending_1',
      name: 'Priya Sharma',
      profilePhoto: 'https://i.pravatar.cc/150?img=3',
      coverPhoto: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwxfHxldmVudCUyMHBob3RvZ3JhcGh5JTIwY29ycG9yYXRlJTIwY29uZmVyZW5jZXxlbnwwfDB8fHwxNzU4MTg5NjU4fDA&ixlib=rb-4.1.0&q=85',
      professionalType: 'Social Media Designer',
      category: 'Design',
      specializations: ['Social Media', 'Branding', 'Digital Marketing'],
      experience: '1-3 years',
      location: {
        city: 'Bangalore',
        state: 'Karnataka',
        pinCode: '560001',
        address: 'Koramangala, Bangalore',
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
      about: 'Creative social media designer helping brands tell their story through engaging visual content. Specializing in modern, trendy designs.',
      isVerified: false,
      tier: 'Free',
      rating: 4.7,
      totalReviews: 67,
      completedJobs: 89,
      responseTime: 'within 4 hours',
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      joinedDate: new Date('2023-09-10'),
      instagramHandle: '@priya_designs',
      portfolioLinks: ['https://priyasharma.design']
    },
    portfolio: [
      {
        id: 'port_t1_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
        title: 'Brand Social Media Campaign',
        description: 'Complete social media design package for startup',
        category: 'Social Media Design',
        date: new Date('2024-01-12')
      }
    ],
    reviews: [
      {
        id: 'rev_t1_1',
        clientName: 'TechStart Solutions',
        rating: 5,
        comment: 'Priya created amazing designs that boosted our social media engagement significantly.',
        date: new Date('2024-01-14'),
        projectType: 'Social Media Design',
        isVerified: true
      }
    ],
    equipment: {
      cameras: [],
      lenses: [],
      lighting: [],
      other: [
        {
          id: 'other_t1_1',
          name: 'MacBook Pro',
          category: 'Computer',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ]
    },
    availability: {
      nextAvailable: new Date('2024-01-17'),
      calendar: [
        {
          date: '2024-01-17',
          status: 'available' as const,
          timeSlots: [
            { start: '10:00', end: '18:00', status: 'available' as const }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 456,
      contactRequests: 34,
      bookingConversions: 72,
      averageResponseTime: 90,
      profileCompletionScore: 88
    },
    viewerPermissions: {
      canViewContact: true,
      canViewInstagram: false,
      canViewAvailability: true,
      canViewEquipment: true,
      canSendMessage: true,
      canViewPricing: true
    }
  },
  'prof_recent_1': {
    professional: {
      id: 'prof_recent_1',
      name: 'Rohit Kumar',
      profilePhoto: 'https://i.pravatar.cc/150?img=12',
      coverPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
      professionalType: 'Commercial Photographer',
      category: 'Photography',
      specializations: ['Product', 'Corporate', 'E-commerce'],
      experience: '3-5 years',
      location: {
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600001',
        address: 'T. Nagar, Chennai',
        coordinates: { lat: 13.0827, lng: 80.2707 }
      },
      about: 'Commercial photographer specializing in product and corporate photography. I help businesses showcase their products and services professionally.',
      isVerified: true,
      tier: 'Free',
      rating: 4.6,
      totalReviews: 34,
      completedJobs: 45,
      responseTime: 'within 3 hours',
      lastActive: new Date(Date.now() - 45 * 60 * 1000),
      joinedDate: new Date('2023-12-01'),
      instagramHandle: '@rohit_commercial',
      portfolioLinks: ['https://rohitkumar.photography']
    },
    portfolio: [
      {
        id: 'port_r1_1',
        type: 'image' as const,
        url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop',
        title: 'E-commerce Product Shoot',
        description: 'Professional product photography for online store',
        category: 'Product Photography',
        date: new Date('2024-01-13')
      }
    ],
    reviews: [
      {
        id: 'rev_r1_1',
        clientName: 'Chennai Electronics',
        rating: 5,
        comment: 'Rohit delivered high-quality product photos that really made our products shine.',
        date: new Date('2024-01-15'),
        projectType: 'Product Photography',
        isVerified: true
      }
    ],
    equipment: {
      cameras: [
        {
          id: 'cam_r1_1',
          name: 'Canon EOS 5D Mark IV',
          category: 'Primary Camera',
          status: 'available' as const,
          condition: 'Excellent'
        }
      ],
      lenses: [],
      lighting: [
        {
          id: 'light_r1_1',
          name: 'Studio Lighting Kit',
          category: 'Studio Lighting',
          status: 'available' as const,
          condition: 'Very Good',
          isIndoorCapable: true,
          isOutdoorCapable: false
        }
      ],
      other: []
    },
    availability: {
      nextAvailable: new Date('2024-01-16'),
      calendar: [
        {
          date: '2024-01-16',
          status: 'available' as const,
          timeSlots: [
            { start: '09:00', end: '17:00', status: 'available' as const }
          ]
        }
      ]
    },
    analytics: {
      profileViews: 234,
      contactRequests: 23,
      bookingConversions: 74,
      averageResponseTime: 60,
      profileCompletionScore: 91
    },
    viewerPermissions: {
      canViewContact: true,
      canViewInstagram: true,
      canViewAvailability: true,
      canViewEquipment: true,
      canSendMessage: true,
      canViewPricing: true
    }
  }
};

export const mockQuery = {
  profileData: mockProfessionalsData['prof_123']
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