// Mock data for authentication and onboarding flow

import { 
  OnboardingStep, 
  RegistrationStatus, 
  LocationPermission,
  CalendarVisibility,
  AvailabilityDay
} from '../types/onboarding';

import {
  ProfessionalCategory, 
  ExperienceLevel, 
  PricingType,
  Gender,
  DistanceRadius
} from '../types/enums';

// Mock store data for onboarding state
export const mockOnboardingStore = {
  currentStep: OnboardingStep.WELCOME,
  registrationStatus: RegistrationStatus.NOT_STARTED,
  completedSteps: [] as OnboardingStep[],
  registrationData: {
    // Authentication data
    authMethod: 'google' as 'google' | 'email',
    email: '',
    isEmailVerified: false,
    
    // Category and type
    selectedCategory: null as ProfessionalCategory | null,
    selectedType: '',
    
    // Location data
    location: {
      coordinates: null as { lat: number; lng: number } | null,
      city: '',
      state: '',
      pinCode: '',
      address: '',
      workRadius: DistanceRadius.TWENTY_FIVE_KM,
      additionalLocations: [] as string[]
    },
    
    // Basic profile
    basicProfile: {
      fullName: '',
      profilePhoto: null as File | null,
      profilePhotoUrl: '',
      primaryMobile: '',
      alternateMobile: '',
      gender: null as Gender | null,
      about: ''
    },
    
    // Professional details
    professionalDetails: {
      experienceLevel: null as ExperienceLevel | null,
      specializations: [] as string[],
      pricing: {
        type: null as PricingType | null,
        rate: 0,
        isNegotiable: false
      },
      equipment: {
        cameras: [] as string[],
        lenses: [] as string[],
        lighting: [] as string[],
        other: [] as string[]
      },
      instagramHandle: '',
      portfolioLinks: [] as string[]
    },
    
    // Availability setup
    availability: {
      defaultSchedule: {
        [AvailabilityDay.MONDAY]: { available: true, startTime: '09:00', endTime: '17:00' },
        [AvailabilityDay.TUESDAY]: { available: true, startTime: '09:00', endTime: '17:00' },
        [AvailabilityDay.WEDNESDAY]: { available: true, startTime: '09:00', endTime: '17:00' },
        [AvailabilityDay.THURSDAY]: { available: true, startTime: '09:00', endTime: '17:00' },
        [AvailabilityDay.FRIDAY]: { available: true, startTime: '09:00', endTime: '17:00' },
        [AvailabilityDay.SATURDAY]: { available: false, startTime: '09:00', endTime: '17:00' },
        [AvailabilityDay.SUNDAY]: { available: false, startTime: '09:00', endTime: '17:00' }
      },
      leadTime: '24', // hours
      advanceBookingLimit: '90', // days
      calendarVisibility: CalendarVisibility.PUBLIC
    }
  },
  
  // Validation errors
  validationErrors: {} as Record<string, string>,
  
  // UI state
  isLoading: false,
  locationPermission: LocationPermission.PROMPT,
  uploadProgress: 0
};

// Mock query data for location and validation
export const mockOnboardingQuery = {
  // Indian cities and states
  locations: {
    states: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
    ],
    cities: {
      'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod'],
      'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi'],
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli'],
      'Delhi': ['New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi']
    }
  },
  
  // Professional type mappings
  professionalTypes: {
    [ProfessionalCategory.PHOTOGRAPHY]: [
      'Portrait Photographer', 'Wedding Photographer', 'Event Photographer',
      'Commercial Photographer', 'Real Estate Photographer', 'Travel Photographer',
      'Sports Photographer', 'Documentary Photographer', 'Fine Art Photographer',
      'Architectural Photographer'
    ],
    [ProfessionalCategory.VIDEOGRAPHY]: [
      'Wedding Videographer', 'Commercial Videographer', 'Music Videographer',
      'Digital Content Creator', 'Broadcast Videographer'
    ],
    [ProfessionalCategory.AUDIO]: [
      'Mixing Engineer', 'Mastering Engineer', 'Live Sound Engineer'
    ],
    [ProfessionalCategory.DESIGN]: [
      'Graphic Designer', 'Social Media Designer', 'Illustrator', 'Creative Director'
    ],
    [ProfessionalCategory.MULTI_DISCIPLINARY]: [
      'Content Creator', 'Visual Storyteller', 'Brand Specialist',
      'Social Media Manager', 'Event Planner'
    ]
  },
  
  // Equipment options
  equipment: {
    cameras: [
      'Canon EOS R5', 'Canon EOS R6', 'Sony A7IV', 'Sony A7R V', 'Sony FX6',
      'Nikon D850', 'Nikon Z9', 'Fujifilm X-T5', 'Panasonic GH6', 'RED Komodo'
    ],
    lenses: [
      '24-70mm f/2.8', '70-200mm f/2.8', '85mm f/1.4', '50mm f/1.4',
      '35mm f/1.4', '16-35mm f/2.8', '100mm f/2.8 Macro', '24mm f/1.4',
      '135mm f/1.8', '14mm f/2.8'
    ],
    lighting: [
      'Studio Strobes', 'LED Panels', 'Softboxes', 'Ring Light',
      'Continuous Lighting', 'Flash Triggers', 'Light Stands', 'Reflectors',
      'Diffusers', 'Color Gels'
    ]
  }
};

// Mock root props for onboarding
export const mockOnboardingRootProps = {
  startFromStep: OnboardingStep.WELCOME,
  resumeRegistration: false,
  userLocation: {
    lat: 9.9312,
    lng: 76.2673
  }
};