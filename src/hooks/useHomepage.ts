// Homepage-specific hooks for data fetching and state management

import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { SearchMode, ContentDisplayMode, ViewMode, SortOption, HomepageState, HomepageFilters, SavedSearch } from '../types/homepage';
import { mockQuery } from '../data/homepageMockData';

// Homepage state store
export const useHomepageStore = create<HomepageState & {
  setSearchQuery: (query: string) => void;
  setSearchMode: (mode: SearchMode) => void;
  setDisplayMode: (mode: ContentDisplayMode) => void;
  setSortBy: (sort: SortOption) => void;
  setFilters: (filters: Partial<HomepageFilters>) => void;
  setSelectedCategory: (category: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  saveSearch: (search: SavedSearch) => void;
  removeSavedSearch: (id: string) => void;
  resetState: () => void;
}>((set, get) => ({
  // Initial state
  searchQuery: '',
  searchMode: SearchMode.BOTH,
  selectedCategory: null,
  displayMode: ContentDisplayMode.JOBS,
  viewMode: ViewMode.CARD,
  sortBy: SortOption.DISTANCE,
  filters: {
    location: { radius: 25 },
    category: [],
    budget: { min: 0, max: 100000 },
    rating: 0,
    experience: [],
    availability: false,
    verified: false,
    distance: 25
  },
  recentSearches: [],
  savedSearches: [],
  isLoading: false,
  error: null,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchMode: (mode) => set({ searchMode: mode }),
  setDisplayMode: (mode) => set({ displayMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  addRecentSearch: (query) => set((state) => ({
    recentSearches: [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 5)
  })),
  
  clearRecentSearches: () => set({ recentSearches: [] }),
  
  saveSearch: (search) => set((state) => ({
    savedSearches: [search, ...state.savedSearches]
  })),
  
  removeSavedSearch: (id) => set((state) => ({
    savedSearches: state.savedSearches.filter(s => s.id !== id)
  })),
  
  resetState: () => set({
    searchQuery: '',
    searchMode: SearchMode.BOTH,
    selectedCategory: null,
    displayMode: ContentDisplayMode.JOBS,
    viewMode: ViewMode.CARD,
    sortBy: SortOption.DISTANCE,
    filters: {
      location: { radius: 25 },
      category: [],
      budget: { min: 0, max: 100000 },
      rating: 0,
      experience: [],
      availability: false,
      verified: false,
      distance: 25
    },
    isLoading: false,
    error: null
  })
}));

// Query hooks
export const useFeaturedProfessionals = (type: string) => {
  return useQuery({
    queryKey: ['featuredProfessionals', type],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const data = mockQuery.featuredProfessionals;
      switch (type) {
        case 'top-rated':
          return data.topRated;
        case 'trending':
          return data.trending;
        case 'recently-active':
          return data.recentlyActive;
        default:
          return data.topRated;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTopCities = () => {
  return useQuery({
    queryKey: ['topCities'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return mockQuery.topCities;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCategoryStats = () => {
  return useQuery({
    queryKey: ['categoryStats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockQuery.categoryStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockQuery.searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
    },
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUniversalSearch = (params: {
  query: string;
  mode: SearchMode;
  filters: any;
  sortBy: SortOption;
}) => {
  return useQuery({
    queryKey: ['universalSearch', params],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock search results based on mode
      const results = {
        jobs: params.mode === SearchMode.PROFESSIONALS ? [] : mockQuery.featuredProfessionals.topRated.slice(0, 3),
        professionals: params.mode === SearchMode.JOBS ? [] : mockQuery.featuredProfessionals.topRated,
        total: params.mode === SearchMode.BOTH ? 8 : 5,
        hasMore: true,
        suggestions: mockQuery.searchSuggestions
      };
      
      return results;
    },
    enabled: params.query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};