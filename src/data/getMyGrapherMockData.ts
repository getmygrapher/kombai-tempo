// Mock data for GetMyGrapher platform

import { 
  User, 
  Job, 
  Professional, 
  Message, 
  CalendarEntry, 
  Notification,
  Coordinates,
  DistanceRadius,
  TierType,
  NotificationType,
  ProfessionalCategory,
  UrgencyLevel,
  ExperienceLevel,
  PricingType,
  AvailabilityStatus,
  MessageType
} from '../types';

// Mock store data for global state
export const mockStore = {
  user: {
    id: 'user_123',
    name: 'Arjun Menon',
    email: 'arjun.menon@gmail.com',
    phone: '+919876543210',
    profilePhoto: 'https://i.pravatar.cc/150?img=12',
    professionalCategory: ProfessionalCategory.PHOTOGRAPHY,
    professionalType: 'Wedding Photographer',
    location: {
      city: 'Kochi',
      state: 'Kerala',
      pinCode: '682001',
      coordinates: { lat: 9.9312, lng: 76.2673 }
    },
    tier: TierType.PRO,
    rating: 4.8,
    totalReviews: 127,
    isVerified: true,
    joinedDate: '2023-01-15T00:00:00Z'
  } as User,
  currentLocation: {
    lat: 9.9312,
    lng: 76.2673
  } as Coordinates,
  selectedRadius: DistanceRadius.TWENTY_FIVE_KM,
  notifications: [
    {
      id: 'notif_1',
      type: NotificationType.NEW_JOB,
      title: 'New Wedding Photography Job',
      message: 'A new wedding photography job posted 2km away',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: false
    }
  ] as Notification[]
};

// Mock query data for API responses
export const mockQuery = {
  nearbyJobs: [
    {
      id: 'job_1',
      title: 'Wedding Photography - Traditional Kerala Wedding',
      type: ProfessionalCategory.PHOTOGRAPHY,
      professionalTypesNeeded: ['Wedding Photographer'],
      date: '2024-02-15T09:00:00Z',
      endDate: '2024-02-15T22:00:00Z',
      location: {
        address: 'Bolgatty Palace, Kochi',
        city: 'Kochi',
        state: 'Kerala',
        pinCode: '682001',
        coordinates: { lat: 9.9312, lng: 76.2673 }
      },
      budgetRange: { min: 25000, max: 40000 },
      description: 'Looking for an experienced wedding photographer for a traditional Kerala wedding ceremony. Need someone familiar with Kerala wedding customs and rituals.',
      urgency: UrgencyLevel.NORMAL,
      postedBy: {
        id: 'client_1',
        name: 'Priya Nair',
        rating: 4.5,
        totalJobs: 8
      },
      distance: 2.1,
      postedAt: '2024-01-14T15:30:00Z',
      applicants: 12
    },
    {
      id: 'job_2',
      title: 'Product Photography for E-commerce',
      type: ProfessionalCategory.PHOTOGRAPHY,
      professionalTypesNeeded: ['Commercial Photographer'],
      date: '2024-01-20T10:00:00Z',
      endDate: '2024-01-20T18:00:00Z',
      location: {
        address: 'Infopark, Kakkanad',
        city: 'Kochi',
        state: 'Kerala',
        pinCode: '682030',
        coordinates: { lat: 10.0261, lng: 76.3470 }
      },
      budgetRange: { min: 8000, max: 15000 },
      description: 'Need a commercial photographer for product shoots of jewelry and accessories for our e-commerce website.',
      urgency: UrgencyLevel.URGENT,
      postedBy: {
        id: 'client_2',
        name: 'Rohit Sharma',
        rating: 4.2,
        totalJobs: 15
      },
      distance: 8.5,
      postedAt: '2024-01-13T11:20:00Z',
      applicants: 7
    }
  ] as Job[],
  nearbyProfessionals: [
    {
      id: 'prof_1',
      name: 'Kavya Krishnan',
      profilePhoto: 'https://i.pravatar.cc/150?img=5',
      professionalType: 'Portrait Photographer',
      specializations: ['Portrait Photography', 'Fashion Photography'],
      experience: ExperienceLevel.MID,
      location: {
        city: 'Kochi',
        state: 'Kerala',
        coordinates: { lat: 9.9312, lng: 76.2673 }
      },
      pricing: {
        type: PricingType.PER_HOUR,
        rate: 2500,
        isNegotiable: true
      },
      rating: 4.7,
      totalReviews: 89,
      isVerified: true,
      tier: TierType.PRO,
      distance: 1.2,
      equipment: {
        cameras: ['Canon EOS R5', 'Sony A7IV'],
        lenses: ['24-70mm', '85mm prime', '50mm prime'],
        lighting: ['Studio Strobes', 'LED Panels']
      },
      availability: {
        nextAvailable: '2024-01-18T00:00:00Z',
        isAvailableToday: false
      },
      instagramHandle: '@kavya_portraits'
    },
    {
      id: 'prof_2',
      name: 'Aditya Menon',
      profilePhoto: 'https://i.pravatar.cc/150?img=8',
      professionalType: 'Wedding Videographer',
      specializations: ['Cinematic Wedding Films', 'Traditional Ceremonies'],
      experience: ExperienceLevel.SENIOR,
      location: {
        city: 'Kochi',
        state: 'Kerala',
        coordinates: { lat: 9.9312, lng: 76.2673 }
      },
      pricing: {
        type: PricingType.PER_EVENT,
        rate: 45000,
        isNegotiable: true
      },
      rating: 4.9,
      totalReviews: 156,
      isVerified: true,
      tier: TierType.PRO,
      distance: 3.7,
      equipment: {
        cameras: ['Sony FX6', 'Canon C70'],
        lenses: ['24-70mm', '70-200mm'],
        other: ['Gimbal Stabilizer', 'Drone (DJI Mini 3)']
      },
      availability: {
        nextAvailable: '2024-01-25T00:00:00Z',
        isAvailableToday: true
      },
      instagramHandle: '@aditya_weddings'
    }
  ] as Professional[],
  messages: [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'prof_1',
      receiverId: 'user_123',
      content: 'Hi! I saw your job post for the wedding photography. I have extensive experience with Kerala weddings and would love to discuss this opportunity.',
      timestamp: '2024-01-14T16:45:00Z',
      isRead: false,
      type: MessageType.JOB_INQUIRY,
      jobId: 'job_1'
    }
  ] as Message[],
  userCalendar: [
    {
      date: '2024-01-18T00:00:00Z',
      status: AvailabilityStatus.AVAILABLE,
      timeSlots: [
        { start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE }
      ]
    },
    {
      date: '2024-01-19T00:00:00Z',
      status: AvailabilityStatus.BOOKED,
      timeSlots: [
        { start: '10:00', end: '18:00', status: AvailabilityStatus.BOOKED, jobTitle: 'Corporate Event Photography' }
      ]
    }
  ] as CalendarEntry[]
};

// Mock root props data
export const mockRootProps = {
  initialTab: 'home' as const,
  showOnboarding: false,
  userLocation: {
    lat: 9.9312,
    lng: 76.2673
  } as Coordinates
};