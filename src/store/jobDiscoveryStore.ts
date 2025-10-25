import { create } from 'zustand';
import { Job, JobFilters, JobSortOption, DistanceRadius } from '../types';

import { jobsService } from '../services/jobsService';
import { getCurrentLocation, getDefaultLocation } from '../utils/locationUtils';

interface JobDiscoveryStore {
  jobs: Job[];
  filters: JobFilters;
  searchQuery: string;
  sortBy: JobSortOption;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  userLocation: { lat: number; lng: number } | null;
  
  // Actions
  setFilters: (filters: Partial<JobFilters>) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: JobSortOption) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  loadJobs: () => Promise<void>;
  loadMoreJobs: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  clearFilters: () => void;
}

const defaultFilters: JobFilters = {
  categories: [],
  urgency: [],
  budgetRange: { min: 0, max: 100000 },
  distance: 'TWENTY_FIVE_KM' as any,
  dateRange: { start: '', end: '' }
};

// Helper function to convert distance filter to kilometers
// const getRadiusFromFilter = (distance: string): number => {
//   const radiusMap: Record<string, number> = {
//     'FIVE_KM': 5,
//     'TEN_KM': 10,
//     'TWENTY_FIVE_KM': 25,
//     'FIFTY_KM': 50,
//     'HUNDRED_KM': 100,
//     'FIVE_HUNDRED_KM': 500
//   };
//   return radiusMap[distance] || 25;
// };

const toDistanceEnum = (distance: string): DistanceRadius => {
  const map: Record<string, DistanceRadius> = {
    'FIVE_KM': DistanceRadius.FIVE_KM,
    'TEN_KM': DistanceRadius.TEN_KM,
    'TWENTY_FIVE_KM': DistanceRadius.TWENTY_FIVE_KM,
    'FIFTY_KM': DistanceRadius.FIFTY_KM,
    'HUNDRED_KM': DistanceRadius.HUNDRED_PLUS_KM
  };
  return map[distance] || DistanceRadius.TWENTY_FIVE_KM;
};

export const useJobDiscoveryStore = create<JobDiscoveryStore>((set, get) => ({
  jobs: [],
  filters: defaultFilters,
  searchQuery: '',
  sortBy: 'DISTANCE' as any,
  isLoading: false,
  hasMore: true,
  currentPage: 1,
  userLocation: null,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().loadJobs();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().loadJobs();
  },

  setSortBy: (sort) => {
    set({ sortBy: sort });
    get().loadJobs();
  },

  setUserLocation: (location) => {
    set({ userLocation: location });
  },

  loadJobs: async () => {
    set({ isLoading: true });
    try {
      // Get user location if not already set
      const { userLocation } = get();
      if (!userLocation) {
        const location = await getCurrentLocation();
        if (location) {
          set({ userLocation: location });
        } else {
          set({ userLocation: getDefaultLocation() });
        }
      }

      // Fetch jobs from backend using filters/search
      const { filters, searchQuery, sortBy, userLocation: currentLocation } = get();

      let fetchedJobs: Job[] = [];
      if (searchQuery && searchQuery.trim().length > 0) {
        const { jobs } = await jobsService.searchJobs(searchQuery, { categories: filters.categories, dateRange: filters.dateRange });
        fetchedJobs = jobs;
      } else if (currentLocation) {
        const radiusEnum = toDistanceEnum((filters.distance as unknown as string));
        const { jobs } = await jobsService.getNearbyJobs(currentLocation, radiusEnum, filters);
        fetchedJobs = jobs;
      }

      // Optional sorting
      const sortKey = sortBy as unknown as string;
      switch (sortKey) {
        case 'DATE': {
          fetchedJobs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        }
        case 'BUDGET': {
          fetchedJobs.sort((a, b) => (b.budgetRange?.max || 0) - (a.budgetRange?.max || 0));
          break;
        }
        case 'URGENCY': {
          const urgencyOrder: Record<string, number> = { 'Emergency': 3, 'Urgent': 2, 'Normal': 1 };
          fetchedJobs.sort((a, b) => (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0));
          break;
        }
        case 'DISTANCE': {
          fetchedJobs.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
          break;
        }
        case 'date_posted': {
          fetchedJobs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
        }
        case 'budget_high_to_low': {
          fetchedJobs.sort((a, b) => (b.budgetRange?.max || 0) - (a.budgetRange?.max || 0));
          break;
        }
        case 'budget_low_to_high': {
          fetchedJobs.sort((a, b) => (a.budgetRange?.max || 0) - (b.budgetRange?.max || 0));
          break;
        }
        case 'urgency': {
          const urgencyOrder: Record<string, number> = { 'Emergency': 3, 'Urgent': 2, 'Normal': 1 };
          fetchedJobs.sort((a, b) => (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0));
          break;
        }
        case 'distance': {
          fetchedJobs.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
          break;
        }
      }

      set({ 
        jobs: fetchedJobs, 
        isLoading: false, 
        currentPage: 1,
        hasMore: fetchedJobs.length > 0 
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to load jobs:', error);
    }
  },

  loadMoreJobs: async () => {
    const { currentPage, hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    
    set({ isLoading: true });
    try {
      // TODO: Implement pagination with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just simulate loading more jobs
      set({ 
        currentPage: currentPage + 1,
        isLoading: false,
        hasMore: false // No more jobs to load
      });
    } catch (error) {
      set({ isLoading: false });
      console.error('Failed to load more jobs:', error);
    }
  },

  refreshJobs: async () => {
    set({ currentPage: 1, hasMore: true });
    await get().loadJobs();
  },

  clearFilters: () => {
    set({ filters: defaultFilters, searchQuery: '' });
    get().loadJobs();
  }
}));