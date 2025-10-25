// Mock data for enhanced homepage system

import { 
  ProfessionalCategory,
  ExperienceLevel,
  TierType,
  UrgencyLevel,
  PricingType
} from '../types/enums';

import {
  SearchMode,
  ContentDisplayMode,
  ViewMode,
  FeaturedSectionType,
  SortOption
} from '../types/homepage';

// Mock store data for homepage state
export const mockStore = {
  searchQuery: '',
  searchMode: SearchMode.BOTH as const,
  selectedCategory: null as string | null,
  displayMode: ContentDisplayMode.JOBS as const,
  viewMode: ViewMode.CARD as const,
  sortBy: SortOption.DISTANCE as const,
  recentSearches: [
    'wedding photographer',
    'commercial videographer', 
    'graphic designer kochi'
  ],
  savedSearches: [
    {
      id: 'saved_1',
      query: 'wedding photographer',
      filters: { category: [ProfessionalCategory.PHOTOGRAPHY] },
      name: 'Wedding Photographers',
      createdAt: '2024-01-10T00:00:00Z'
    }
  ]
};

// Mock API response data
export const mockQuery = {
  featuredProfessionals: {
    topRated: [
      {
        id: 'prof_featured_1',
        name: 'Kavya Krishnan',
        profilePhoto: 'https://i.pravatar.cc/150?img=5',
        professionalType: 'Portrait Photographer',
        rating: 4.9,
        totalReviews: 156,
        tier: TierType.PRO as const,
        isVerified: true,
        specializations: ['Portrait', 'Fashion'],
        pricing: { rate: 3500, type: PricingType.PER_HOUR as const, isNegotiable: true },
        location: { city: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.0760, lng: 72.8777 } },
        distance: 2.1,
        availability: { isAvailableToday: true, nextAvailable: '2024-01-18T00:00:00Z' },
        experience: ExperienceLevel.MID
      },
      {
        id: 'prof_featured_2', 
        name: 'Aditya Menon',
        profilePhoto: 'https://i.pravatar.cc/150?img=8',
        professionalType: 'Wedding Videographer',
        rating: 4.8,
        totalReviews: 89,
        tier: TierType.PRO as const,
        isVerified: true,
        specializations: ['Cinematic', 'Traditional'],
        pricing: { rate: 45000, type: PricingType.PER_EVENT as const, isNegotiable: true },
        location: { city: 'Delhi', state: 'Delhi', coordinates: { lat: 28.6139, lng: 77.2090 } },
        distance: 5.3,
        availability: { isAvailableToday: false, nextAvailable: '2024-01-20T00:00:00Z' },
        experience: ExperienceLevel.SENIOR
      }
    ],
    trending: [
      {
        id: 'prof_trending_1',
        name: 'Priya Sharma',
        profilePhoto: 'https://i.pravatar.cc/150?img=3',
        professionalType: 'Social Media Designer',
        rating: 4.7,
        totalReviews: 67,
        tier: TierType.FREE as const,
        isVerified: false,
        specializations: ['Social Media', 'Branding'],
        pricing: { rate: 2000, type: PricingType.PER_DAY as const, isNegotiable: true },
        location: { city: 'Bangalore', state: 'Karnataka', coordinates: { lat: 12.9716, lng: 77.5946 } },
        distance: 8.7,
        availability: { isAvailableToday: true, nextAvailable: '2024-01-17T00:00:00Z' },
        experience: ExperienceLevel.JUNIOR
      }
    ],
    recentlyActive: [
      {
        id: 'prof_recent_1',
        name: 'Rohit Kumar',
        profilePhoto: 'https://i.pravatar.cc/150?img=12',
        professionalType: 'Commercial Photographer',
        rating: 4.6,
        totalReviews: 34,
        tier: TierType.FREE as const,
        isVerified: true,
        specializations: ['Product', 'Corporate'],
        pricing: { rate: 2800, type: PricingType.PER_DAY as const, isNegotiable: true },
        location: { city: 'Chennai', state: 'Tamil Nadu', coordinates: { lat: 13.0827, lng: 80.2707 } },
        distance: 12.4,
        availability: { isAvailableToday: true, nextAvailable: '2024-01-16T00:00:00Z' },
        experience: ExperienceLevel.MID
      }
    ]
  },
  topCities: [
    {
      id: 'city_mumbai',
      name: 'Mumbai',
      state: 'Maharashtra',
      professionalCount: 2847,
      averageRating: 4.3,
      popularCategories: [ProfessionalCategory.PHOTOGRAPHY, ProfessionalCategory.VIDEOGRAPHY],
      isTopCity: true
    },
    {
      id: 'city_delhi', 
      name: 'Delhi',
      state: 'Delhi',
      professionalCount: 2156,
      averageRating: 4.2,
      popularCategories: [ProfessionalCategory.PHOTOGRAPHY, ProfessionalCategory.DESIGN],
      isTopCity: true
    },
    {
      id: 'city_bangalore',
      name: 'Bangalore', 
      state: 'Karnataka',
      professionalCount: 1923,
      averageRating: 4.4,
      popularCategories: [ProfessionalCategory.DESIGN, ProfessionalCategory.VIDEOGRAPHY],
      isTopCity: true
    },
    {
      id: 'city_chennai',
      name: 'Chennai',
      state: 'Tamil Nadu', 
      professionalCount: 1456,
      averageRating: 4.1,
      popularCategories: [ProfessionalCategory.PHOTOGRAPHY, ProfessionalCategory.AUDIO],
      isTopCity: true
    },
    {
      id: 'city_hyderabad',
      name: 'Hyderabad',
      state: 'Telangana',
      professionalCount: 1234,
      averageRating: 4.2,
      popularCategories: [ProfessionalCategory.VIDEOGRAPHY, ProfessionalCategory.DESIGN],
      isTopCity: true
    },
    {
      id: 'city_pune',
      name: 'Pune',
      state: 'Maharashtra',
      professionalCount: 987,
      averageRating: 4.3,
      popularCategories: [ProfessionalCategory.PHOTOGRAPHY, ProfessionalCategory.MULTI_DISCIPLINARY],
      isTopCity: true
    }
  ],
  categoryStats: [
    {
      category: ProfessionalCategory.PHOTOGRAPHY,
      jobCount: 156,
      professionalCount: 1247,
      trending: true,
      averageRating: 4.4
    },
    {
      category: ProfessionalCategory.VIDEOGRAPHY,
      jobCount: 89,
      professionalCount: 856,
      trending: false,
      averageRating: 4.3
    },
    {
      category: ProfessionalCategory.DESIGN,
      jobCount: 134,
      professionalCount: 967,
      trending: true,
      averageRating: 4.2
    },
    {
      category: ProfessionalCategory.AUDIO,
      jobCount: 45,
      professionalCount: 234,
      trending: false,
      averageRating: 4.5
    },
    {
      category: ProfessionalCategory.MULTI_DISCIPLINARY,
      jobCount: 67,
      professionalCount: 456,
      trending: true,
      averageRating: 4.1
    }
  ],
  searchSuggestions: [
    'wedding photographer mumbai',
    'commercial videographer',
    'graphic designer freelance',
    'portrait photographer',
    'event photographer'
  ]
};

// Mock root component props
export const mockRootProps = {
  initialSearchMode: SearchMode.BOTH as const,
  initialDisplayMode: ContentDisplayMode.JOBS as const,
  showFeaturedSections: true,
  enableVoiceSearch: false,
  maxSearchSuggestions: 5
};