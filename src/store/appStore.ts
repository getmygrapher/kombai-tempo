import { create } from 'zustand';
import { User, Coordinates, DistanceRadius, Notification, SearchFilters, JobFilters, Job } from '../types';
import { ProfessionalCategory, ExperienceLevel, UrgencyLevel, TierType, JobStatus, JobSortOption } from '../types/enums';

interface AppStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Location state
  currentLocation: Coordinates | null;
  selectedRadius: DistanceRadius;
  
  // Navigation state
  currentTab: string;
  
  // Notifications
  notifications: Notification[];
  
  // Filters
  searchFilters: SearchFilters;
  jobFilters: JobFilters;
  
  // Job posting state
  currentJobDraft: Partial<Job> | null;
  jobCreationStep: number;
  isSubmittingJob: boolean;
  jobCreationErrors: Record<string, string>;
  
  // Job discovery state
  searchQuery: string;
  sortBy: JobSortOption;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setCurrentLocation: (location: Coordinates) => void;
  setSelectedRadius: (radius: DistanceRadius) => void;
  setCurrentTab: (tab: string) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (notificationId: string) => void;
  updateSearchFilters: (filters: Partial<SearchFilters>) => void;
  updateJobFilters: (filters: Partial<JobFilters>) => void;
  clearUser: () => void;
  
  // Job posting actions
  setJobDraft: (job: Partial<Job>) => void;
  setJobCreationStep: (step: number) => void;
  setIsSubmittingJob: (isSubmitting: boolean) => void;
  setJobCreationErrors: (errors: Record<string, string>) => void;
  clearJobDraft: () => void;
  
  // Job discovery actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: JobSortOption) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  currentLocation: null,
  selectedRadius: DistanceRadius.TWENTY_FIVE_KM,
  currentTab: 'home',
  notifications: [],
  searchFilters: {
    professionalTypes: [],
    experienceLevel: [],
    priceRange: { min: 0, max: 100000 },
    rating: 0,
    distance: DistanceRadius.TWENTY_FIVE_KM,
    availability: false,
    verifiedOnly: false,
    equipment: []
  },
  jobFilters: {
    categories: [],
    urgency: [],
    budgetRange: { min: 0, max: 100000 },
    distance: DistanceRadius.TWENTY_FIVE_KM,
    dateRange: { start: '', end: '' }
  },
  
  // Job posting state
  currentJobDraft: null,
  jobCreationStep: 1,
  isSubmittingJob: false,
  jobCreationErrors: {},
  
  // Job discovery state
  searchQuery: '',
  sortBy: JobSortOption.DISTANCE,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setSelectedRadius: (radius) => set({ selectedRadius: radius }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(notif =>
      notif.id === notificationId ? { ...notif, isRead: true } : notif
    )
  })),
  
  updateSearchFilters: (filters) => set((state) => ({
    searchFilters: { ...state.searchFilters, ...filters }
  })),
  
  updateJobFilters: (filters) => set((state) => ({
    jobFilters: { ...state.jobFilters, ...filters }
  })),
  
  clearUser: () => set({
    user: null,
    isAuthenticated: false,
    notifications: []
  }),
  
  // Job posting actions
  setJobDraft: (job) => set({ currentJobDraft: job }),
  setJobCreationStep: (step) => set({ jobCreationStep: step }),
  setIsSubmittingJob: (isSubmitting) => set({ isSubmittingJob: isSubmitting }),
  setJobCreationErrors: (errors) => set({ jobCreationErrors: errors }),
  clearJobDraft: () => set({ 
    currentJobDraft: null, 
    jobCreationStep: 1, 
    jobCreationErrors: {} 
  }),
  
  // Job discovery actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy })
}));