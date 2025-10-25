import { 
  ProfessionalCategory, 
  UrgencyLevel, 
  JobStatus, 
  ApplicationStatus,
  ExperienceLevel,
  TierType,
  JobSortOption,
  BudgetType
} from '../types/enums';
import { Job, Application, Professional, JobLocation, BudgetRange } from '../types';

// Mock data for job posting system
export const mockStore = {
  currentJobDraft: null,
  jobCreationStep: 1,
  isSubmittingJob: false,
  jobFilters: {
    categories: [],
    urgency: [],
    budgetRange: { min: 0, max: 100000 },
    distance: '25km' as const,
    dateRange: { start: '', end: '' }
  },
  sortBy: JobSortOption.DISTANCE as const
};

export const mockQuery = {
  jobCreationCategories: [
    {
      id: ProfessionalCategory.PHOTOGRAPHY,
      name: 'Photography',
      professionalTypes: [
        'Wedding Photographer',
        'Portrait Photographer', 
        'Event Photographer',
        'Commercial Photographer',
        'Real Estate Photographer'
      ]
    },
    {
      id: ProfessionalCategory.VIDEOGRAPHY,
      name: 'Videography & Film',
      professionalTypes: [
        'Wedding Videographer',
        'Commercial Videographer',
        'Music Videographer',
        'Content Creator'
      ]
    },
    {
      id: ProfessionalCategory.AUDIO,
      name: 'Audio Production',
      professionalTypes: [
        'Mixing Engineer',
        'Mastering Engineer',
        'Live Sound Engineer'
      ]
    },
    {
      id: ProfessionalCategory.DESIGN,
      name: 'Design & Creative',
      professionalTypes: [
        'Graphic Designer',
        'Social Media Designer',
        'Illustrator',
        'Creative Director'
      ]
    }
  ],
  nearbyJobs: [
    {
      id: 'job_001',
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
        coordinates: { lat: 9.9312, lng: 76.2673 },
        venueDetails: 'Grand ballroom with outdoor garden area',
        parkingAvailable: true
      } as JobLocation,
      budgetRange: { 
        min: 25000, 
        max: 40000, 
        currency: 'INR' as const, 
        type: BudgetType.FIXED, 
        isNegotiable: true 
      } as BudgetRange,
      description: 'Looking for an experienced wedding photographer for a traditional Kerala wedding ceremony. Need someone familiar with Kerala wedding customs and rituals. The event will be held at Bolgatty Palace with beautiful backdrops.',
      urgency: UrgencyLevel.NORMAL,
      postedBy: {
        id: 'client_001',
        name: 'Priya Nair',
        rating: 4.5,
        totalJobs: 8
      },
      status: JobStatus.ACTIVE,
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-14T15:30:00Z',
      expiresAt: '2024-02-15T22:00:00Z',
      isExpired: false,
      distance: 2.1,
      applicants: [
        {
          id: 'app_001',
          jobId: 'job_001',
          applicantId: 'prof_001',
          applicant: {
            id: 'prof_001',
            name: 'Arjun Menon',
            profilePhoto: 'https://i.pravatar.cc/150?img=12',
            professionalType: 'Wedding Photographer',
            specializations: ['Traditional Weddings', 'Kerala Customs'],
            experience: ExperienceLevel.SENIOR,
            location: {
              city: 'Kochi',
              state: 'Kerala',
              coordinates: { lat: 9.9312, lng: 76.2673 }
            },
            pricing: {
              type: 'Per Event' as any,
              rate: 35000,
              isNegotiable: true
            },
            rating: 4.8,
            totalReviews: 127,
            isVerified: true,
            tier: TierType.PRO
          } as Professional,
          message: 'I have 8+ years of experience in Kerala wedding photography and would love to capture your special day.',
          proposedRate: 35000,
          status: ApplicationStatus.PENDING,
          appliedAt: '2024-01-14T16:45:00Z',
          updatedAt: '2024-01-14T16:45:00Z'
        }
      ] as Application[],
      viewCount: 45
    },
    {
      id: 'job_002', 
      title: 'Product Photography for E-commerce Store',
      type: ProfessionalCategory.PHOTOGRAPHY,
      professionalTypesNeeded: ['Commercial Photographer'],
      date: '2024-01-25T10:00:00Z',
      endDate: '2024-01-25T18:00:00Z',
      location: {
        address: 'Infopark, Kakkanad',
        city: 'Kochi',
        state: 'Kerala', 
        pinCode: '682030',
        coordinates: { lat: 10.0261, lng: 76.3470 },
        venueDetails: 'Professional studio setup available'
      } as JobLocation,
      budgetRange: { 
        min: 8000, 
        max: 15000, 
        currency: 'INR' as const, 
        type: BudgetType.PROJECT, 
        isNegotiable: true 
      } as BudgetRange,
      description: 'Need a commercial photographer for product shoots of jewelry and accessories for our e-commerce website. Studio setup available.',
      urgency: UrgencyLevel.URGENT,
      postedBy: {
        id: 'client_002',
        name: 'Rohit Sharma', 
        rating: 4.2,
        totalJobs: 15
      },
      status: JobStatus.ACTIVE,
      createdAt: '2024-01-13T11:20:00Z',
      updatedAt: '2024-01-13T11:20:00Z',
      expiresAt: '2024-01-25T18:00:00Z',
      isExpired: false,
      distance: 8.5,
      applicants: [] as Application[],
      viewCount: 23
    },
    {
      id: 'job_003',
      title: 'Music Video Production',
      type: ProfessionalCategory.VIDEOGRAPHY,
      professionalTypesNeeded: ['Music Videographer'],
      date: '2024-02-01T14:00:00Z',
      endDate: '2024-02-01T20:00:00Z',
      location: {
        address: 'Marine Drive, Kochi',
        city: 'Kochi',
        state: 'Kerala',
        pinCode: '682001',
        coordinates: { lat: 9.9312, lng: 76.2673 }
      } as JobLocation,
      budgetRange: { 
        min: 50000, 
        max: 75000, 
        currency: 'INR' as const, 
        type: BudgetType.PROJECT, 
        isNegotiable: false 
      } as BudgetRange,
      description: 'Looking for a creative videographer for an indie music video. Need cinematic shots along Marine Drive.',
      urgency: UrgencyLevel.EMERGENCY,
      postedBy: {
        id: 'client_003',
        name: 'Ananya Krishnan',
        rating: 4.7,
        totalJobs: 12
      },
      status: JobStatus.ACTIVE,
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
      expiresAt: '2024-02-01T20:00:00Z',
      isExpired: false,
      distance: 1.8,
      applicants: [] as Application[],
      viewCount: 67
    }
  ] as Job[],
  myPostedJobs: [
    {
      id: 'job_004',
      title: 'Corporate Event Photography',
      type: ProfessionalCategory.PHOTOGRAPHY,
      professionalTypesNeeded: ['Event Photographer'],
      date: '2024-02-10T14:00:00Z',
      endDate: '2024-02-10T20:00:00Z',
      location: {
        address: 'Grand Hyatt, Kochi',
        city: 'Kochi',
        state: 'Kerala',
        pinCode: '682001',
        coordinates: { lat: 9.9312, lng: 76.2673 }
      } as JobLocation,
      budgetRange: { 
        min: 12000, 
        max: 18000, 
        currency: 'INR' as const, 
        type: BudgetType.FIXED, 
        isNegotiable: false 
      } as BudgetRange,
      description: 'Annual company event photography needed. Professional corporate setting.',
      urgency: UrgencyLevel.NORMAL,
      postedBy: {
        id: 'user_123',
        name: 'Current User',
        rating: 4.3,
        totalJobs: 5
      },
      status: JobStatus.ACTIVE,
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-12T10:00:00Z', 
      expiresAt: '2024-02-10T20:00:00Z',
      isExpired: false,
      applicants: [
        {
          id: 'app_002',
          jobId: 'job_004',
          applicantId: 'prof_002',
          applicant: {
            id: 'prof_002',
            name: 'Kavya Krishnan',
            profilePhoto: 'https://i.pravatar.cc/150?img=5',
            professionalType: 'Event Photographer',
            specializations: ['Corporate Events', 'Business Photography'],
            experience: ExperienceLevel.MID,
            location: {
              city: 'Kochi',
              state: 'Kerala',
              coordinates: { lat: 9.9312, lng: 76.2673 }
            },
            pricing: {
              type: 'Per Event' as any,
              rate: 15000,
              isNegotiable: true
            },
            rating: 4.7,
            totalReviews: 89,
            isVerified: true,
            tier: TierType.PRO
          } as Professional,
          message: 'I specialize in corporate event photography and have worked with many companies in Kochi.',
          status: ApplicationStatus.SHORTLISTED,
          appliedAt: '2024-01-12T14:30:00Z',
          updatedAt: '2024-01-13T09:15:00Z'
        }
      ] as Application[],
      viewCount: 18
    }
  ] as Job[]
};

export const mockRootProps = {
  initialJobCreationStep: 1,
  showJobCreationWizard: false,
  selectedJobId: null
};

// Direct exports for easier importing
export const mockJobs = mockQuery.nearbyJobs;
export const mockMyJobs = mockQuery.myPostedJobs;