import { 
  ProfessionalCategory, 
  ExperienceLevel, 
  Gender, 
  PricingType, 
  TierType,
  VerificationStatus,
  EquipmentCategory,
  ProfileEditSection,
  EquipmentCondition,
  PricingStructure,
  VisibilityLevel,
  ProfileAnalyticsMetric,
  InstagramConnectionStatus
} from '../types/enums';
import { User } from '../types';

export const mockProfileEditData = {
  basicInfo: {
    name: 'Arjun Menon',
    email: 'arjun.menon@example.com',
    phone: '+919876543210',
    alternatePhone: '+919876543211',
    gender: Gender.MALE,
    profilePhoto: 'https://i.pravatar.cc/150?img=1'
  },
  location: {
    city: 'Kochi',
    state: 'Kerala',
    pinCode: '682001',
    address: 'Marine Drive, Ernakulam',
    preferredWorkLocations: ['Kochi', 'Thiruvananthapuram', 'Kozhikode']
  },
  professional: {
    category: ProfessionalCategory.PHOTOGRAPHY,
    type: 'Wedding Photographer',
    specializations: ['Wedding Photography', 'Portrait Photography', 'Event Photography'],
    experience: ExperienceLevel.SENIOR,
    about: 'Passionate wedding photographer with 8+ years of experience capturing beautiful moments.',
    instagramHandle: '@arjunphotography'
  }
};

export const mockEquipmentData = [
  {
    id: 'eq-1',
    category: EquipmentCategory.CAMERAS,
    name: 'Canon EOS R5',
    description: 'Professional mirrorless camera',
    condition: EquipmentCondition.EXCELLENT,
    isIndoorCapable: true,
    isOutdoorCapable: true
  },
  {
    id: 'eq-2',
    category: EquipmentCategory.LENSES,
    name: 'Canon RF 24-70mm f/2.8L',
    description: 'Professional zoom lens',
    condition: EquipmentCondition.EXCELLENT,
    isIndoorCapable: true,
    isOutdoorCapable: true
  },
  {
    id: 'eq-3',
    category: EquipmentCategory.LIGHTING,
    name: 'Godox AD600Pro',
    description: 'Portable flash strobe',
    condition: EquipmentCondition.GOOD,
    isIndoorCapable: true,
    isOutdoorCapable: false
  }
];
export const formatPricingRate = (rate: number, type: PricingStructure): string => {
  const currency = '₹';
  switch (type) {
    case PricingStructure.PER_HOUR:
      return `${currency}${rate.toLocaleString()}/hour`;
    case PricingStructure.PER_DAY:
      return `${currency}${rate.toLocaleString()}/day`;
    case PricingStructure.PER_EVENT:
      return `${currency}${rate.toLocaleString()}/event`;
    default:
      return `${currency}${rate.toLocaleString()}`;
  }
};

export const formatAnalyticsMetric = (value: number, metric: ProfileAnalyticsMetric): string => {
  switch (metric) {
    case ProfileAnalyticsMetric.VIEWS:
      return `${value.toLocaleString()} views`;
    case ProfileAnalyticsMetric.SAVES:
      return `${value.toLocaleString()} saves`;
    case ProfileAnalyticsMetric.CONTACT_REQUESTS:
      return `${value.toLocaleString()} requests`;
    case ProfileAnalyticsMetric.COMPLETION_RATE:
      return `${Math.round(value)}%`;
    default:
      return value.toString();
  }
};

export const formatProfileCompletion = (value: number): string => {
  if (value == null || Number.isNaN(value)) return '0%';
  const clamped = Math.max(0, Math.min(100, value));
  return `${Math.round(clamped)}%`;
};

// Formats equipment count for category cards (e.g., "0 items", "1 item", "3 items")
export const formatEquipmentCount = (count: number): string => {
  if (count == null || Number.isNaN(count)) return '0 items';
  const n = Math.max(0, Math.floor(count));
  return n === 1 ? '1 item' : `${n} items`;
};

// Placeholder formatter for tier benefits (pass-through for now)
export const formatTierBenefit = (benefit: string): string => benefit;

export const mockPricingData = {
  structure: PricingStructure.PER_EVENT,
  rate: 25000,
  isNegotiable: true,
  minimumHours: 4,
  overtimeRate: 2500,
  inclusions: ['High-resolution photos', 'Online gallery', 'Basic editing']
};

export const mockPortfolioData = [
  {
    id: 'port-1',
    url: 'https://picsum.photos/800/600?random=1',
    caption: 'Beautiful wedding ceremony',
    order: 1,
    uploadedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'port-2',
    url: 'https://picsum.photos/800/600?random=2',
    caption: 'Couple portrait session',
    order: 2,
    uploadedAt: '2024-01-02T14:30:00Z'
  },
  {
    id: 'port-3',
    url: 'https://picsum.photos/800/600?random=3',
    caption: 'Reception celebration',
    order: 3,
    uploadedAt: '2024-01-03T16:45:00Z'
  }
];

export const mockPrivacySettings = {
  visibility: VisibilityLevel.PUBLIC,
  showEquipment: true,
  showPricing: true,
  showAvailability: true,
  allowContactSharing: true,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false
};

export const mockAnalyticsData = {
  profileViews: 1250,
  profileSaves: 89,
  contactRequests: 45,
  completionRate: 85,
  viewsThisMonth: [
    { date: '2024-01-01', views: 45 },
    { date: '2024-01-02', views: 52 },
    { date: '2024-01-03', views: 38 },
    { date: '2024-01-04', views: 61 },
    { date: '2024-01-05', views: 55 },
    { date: '2024-01-06', views: 48 },
    { date: '2024-01-07', views: 42 }
  ],
  recommendations: [
    'Add more portfolio images to increase engagement',
    'Complete your equipment list to attract more clients',
    'Update your availability calendar regularly',
    'Consider upgrading to Pro for better visibility'
  ]
};

export const mockInstagramData = {
  status: InstagramConnectionStatus.CONNECTED,
  handle: '@arjunphotography',
  followers: 2500,
  posts: 150,
  lastSync: '2024-01-07T10:30:00Z'
};

export const mockVerificationData = {
  profilePhoto: VerificationStatus.VERIFIED,
  documents: VerificationStatus.PENDING,
  email: VerificationStatus.VERIFIED,
  mobile: VerificationStatus.VERIFIED
};

export const mockAvailabilityPreview = {
  nextAvailable: '2024-01-15',
  availableDays: 18,
  bookedDays: 5,
  partiallyAvailableDays: 3
};
// Mock data for profile management system
export const mockProfileStats = {
  profileViews: 156,
  jobApplications: 23,
  successRate: 87,
  responseRate: 94,
  profileCompletion: 85
};

export const mockEquipmentOptions = {
  cameras: [
    'Canon EOS R5',
    'Sony A7IV', 
    'Nikon D850',
    'Canon EOS R6 Mark II',
    'Sony A7R V',
    'Fujifilm X-T5',
    'Canon EOS 5D Mark IV',
    'Nikon Z9'
  ],
  lenses: [
    '24-70mm f/2.8',
    '70-200mm f/2.8',
    '50mm f/1.4',
    '85mm f/1.8',
    '16-35mm f/2.8',
    '24-105mm f/4',
    '100mm f/2.8 Macro',
    '35mm f/1.4'
  ],
  supportGear: [
    'Carbon Fiber Tripod',
    'Gimbal Stabilizer',
    'Camera Slider',
    'Drone (DJI Mini 3)',
    'Monopod',
    'Camera Rig'
  ],
  lighting: [
    'LED Panel Lights',
    'Softbox Kit',
    'Ring Light',
    'Strobe Lights',
    'Reflectors',
    'Light Stands'
  ]
};

export const mockTierBenefits = {
  free: [
    'Basic profile creation',
    '1 job post per month',
    '1 job acceptance per month',
    'View jobs within 25km radius',
    'Basic messaging (10 conversations/month)',
    'Standard search filters',
    'Basic availability calendar (visible to all)'
  ],
  pro: [
    'Ad-free experience',
    'Unlimited job posts and acceptances', 
    'Extended radius search (up to 500km)',
    'Unlimited messaging',
    'Advanced filters and search',
    'Priority placement in search results',
    'Instagram handle integration with feed display',
    'Calendar visibility control (show/hide from other users)',
    'Time-based availability slots',
    'Analytics dashboard',
    'Verified badge eligibility',
    'Early access to new features',
    'Customer support priority'
  ]
};

export const mockNotificationSettings = {
  jobAlerts: true,
  messageNotifications: true,
  bookingUpdates: true,
  ratingReminders: true,
  marketingCommunications: false,
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false
};

export const mockUserProfile: User = {
  id: 'user123',
  name: 'Arjun Menon',
  email: 'arjun.menon@example.com',
  phone: '+919876543210',
  alternatePhone: '+919876543211',
  profilePhoto: 'https://i.pravatar.cc/150?img=1',
  gender: Gender.MALE,
  location: {
    city: 'Kochi',
    state: 'Kerala',
    pinCode: '682001',
    address: 'Marine Drive, Ernakulam',
    coordinates: { lat: 9.9312, lng: 76.2673 }
  },
  preferredWorkLocations: ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
  professionalCategory: ProfessionalCategory.PHOTOGRAPHY,
  professionalType: 'Wedding Photographer',
  specializations: ['Wedding Photography', 'Portrait Photography', 'Event Photography'],
  experience: ExperienceLevel.MID,
  about: 'Passionate wedding photographer with 4 years of experience capturing beautiful moments across Kerala. Specialized in candid photography and traditional ceremonies.',
  instagramHandle: '@arjun_captures',
  tier: TierType.PRO,
  rating: 4.8,
  totalReviews: 47,
  isVerified: true,
  joinedDate: '2023-01-15',
  equipment: {
    cameras: ['Canon EOS R5', 'Sony A7IV'],
    lenses: ['24-70mm f/2.8', '85mm f/1.8', '50mm f/1.4'],
    lighting: ['LED Panel Lights', 'Softbox Kit'],
    other: ['Carbon Fiber Tripod', 'Gimbal Stabilizer']
  },
  pricing: {
    type: PricingType.PER_EVENT,
    rate: 25000,
    isNegotiable: true
  }
};


export const mockProfessionalTypes = {
  [ProfessionalCategory.PHOTOGRAPHY]: [
    'Portrait Photographer',
    'Wedding Photographer', 
    'Event Photographer',
    'Commercial Photographer',
    'Real Estate Photographer',
    'Travel Photographer',
    'Sports Photographer',
    'Documentary Photographer',
    'Fine Art Photographer',
    'Architectural Photographer'
  ],
  [ProfessionalCategory.VIDEOGRAPHY]: [
    'Wedding Videographer',
    'Commercial Videographer',
    'Music Videographer',
    'Digital Content Creator',
    'Broadcast Videographer'
  ],
  [ProfessionalCategory.AUDIO]: [
    'Mixing Engineer',
    'Mastering Engineer',
    'Live Sound Engineer'
  ],
  [ProfessionalCategory.DESIGN]: [
    'Graphic Designer',
    'Social Media Designer',
    'Illustrator',
    'Creative Director'
  ],
  [ProfessionalCategory.MULTI_DISCIPLINARY]: [
    'Content Creator',
    'Visual Storyteller',
    'Brand Specialist',
    'Social Media Manager',
    'Event Planner'
  ]
};

export const mockSpecializations = {
  [ProfessionalCategory.PHOTOGRAPHY]: [
    'Portrait Photography',
    'Wedding Photography',
    'Event Photography',
    'Commercial Photography',
    'Product Photography',
    'Fashion Photography',
    'Real Estate Photography',
    'Travel Photography',
    'Sports Photography',
    'Documentary Photography',
    'Fine Art Photography',
    'Street Photography',
    'Nature Photography',
    'Architectural Photography'
  ],
  [ProfessionalCategory.VIDEOGRAPHY]: [
    'Wedding Videographer',
    'Commercial Videographer', 
    'Music Videographer',
    'Digital Content Creator',
    'Broadcast Videographer'
  ],
  [ProfessionalCategory.AUDIO]: [
    'Mixing Engineer',
    'Mastering Engineer', 
    'Live Sound Engineer'
  ],
  [ProfessionalCategory.DESIGN]: [
    'Graphic Designer',
    'Social Media Designer',
    'Illustrator', 
    'Creative Director'
  ],
  [ProfessionalCategory.MULTI_DISCIPLINARY]: [
    'Content Creator',
    'Visual Storyteller',
    'Brand Specialist',
    'Social Media Manager',
    'Event Planner'
  ]
};

export const mockCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kochi', 'Hyderabad', 
  'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Thiruvananthapuram',
  'Kozhikode', 'Thrissur', 'Kannur', 'Alappuzha'
];

export const mockStates = [
  'Kerala', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi',
  'Gujarat', 'West Bengal', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh'
];