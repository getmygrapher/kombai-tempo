import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    searchService,
    SearchFilters,
    ProfessionalSearchResult,
    PoseSearchResult,
    SearchSuggestion
} from '../services/searchService';

interface SearchState {
    // Search Query
    query: string;

    // Results
    professionalResults: ProfessionalSearchResult[];
    poseResults: PoseSearchResult[];
    totalProfessionals: number;
    totalPoses: number;

    // Loading & Error States
    loading: boolean;
    error: string | null;

    // Filters
    filters: SearchFilters;

    // Suggestions
    suggestions: SearchSuggestion[];
    suggestionsLoading: boolean;

    // Location
    userLocation: { lat: number; lng: number } | null;

    // Actions
    setQuery: (query: string) => void;
    setFilters: (filters: Partial<SearchFilters>) => void;
    clearFilters: () => void;
    searchProfessionals: (offset?: number) => Promise<void>;
    searchPoses: (offset?: number) => Promise<void>;
    getSuggestions: (query: string) => Promise<void>;
    setUserLocation: (lat: number, lng: number) => void;
    reset: () => void;
}

const initialFilters: SearchFilters = {
    query: '',
    limit: 20,
    offset: 0
};

export const useSearchStore = create<SearchState>()(
    persist(
        (set, get) => ({
            query: '',
            professionalResults: [],
            poseResults: [],
            totalProfessionals: 0,
            totalPoses: 0,
            loading: false,
            error: null,
            filters: initialFilters,
            suggestions: [],
            suggestionsLoading: false,
            userLocation: null,

            setQuery: (query) => {
                set({ query });
                // Update filters query as well
                set((state) => ({
                    filters: { ...state.filters, query }
                }));
            },

            setFilters: (newFilters) => {
                set((state) => ({
                    filters: { ...state.filters, ...newFilters }
                }));
            },

            clearFilters: () => {
                set({ filters: { ...initialFilters, query: get().query } });
            },

            setUserLocation: (lat, lng) => {
                set({ userLocation: { lat, lng } });
            },

            searchProfessionals: async (offset = 0) => {
                set({ loading: true, error: null });
                const { query, filters, userLocation } = get();

                try {
                    const limit = filters.limit ?? 20;

                    // Map UI filters to service filters
                    const serviceFilters: SearchFilters = {
                        professionalType: (filters as any).category,
                        isVerified: (filters as any).verified,
                        minExperience: (filters as any).minExperience,
                        maxExperience: (filters as any).maxExperience,
                        minPrice: (filters as any).minPrice,
                        maxPrice: (filters as any).maxPrice,
                        rating: (filters as any).rating,
                        radius: (filters as any).radius,
                        limit,
                        offset,
                        lat: undefined,
                        lng: undefined,
                        query
                    };

                    // If we have user location and radius is set, include it
                    if (userLocation && serviceFilters.radius) {
                        serviceFilters.lat = userLocation.lat;
                        serviceFilters.lng = userLocation.lng;
                    }

                    const { results, total } = await searchService.searchProfessionals(
                        query,
                        userLocation || undefined,
                        serviceFilters.radius ?? 25,
                        serviceFilters,
                        limit,
                        offset
                    );

                    set((state) => ({
                        professionalResults: offset === 0 ? results : [...state.professionalResults, ...results],
                        totalProfessionals: total,
                        loading: false
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to search professionals';
                    set({ error: errorMessage, loading: false });
                    console.error('Search professionals error:', error);
                }
            },

            searchPoses: async (offset = 0) => {
                set({ loading: true, error: null });
                const { query, filters } = get();

                try {
                    const limit = filters.limit ?? 20;
                    const poseFilters: { category?: string; tags?: string[]; difficulty?: string } = {
                        category: (filters as any).category,
                        // tags can be added later from UI
                        difficulty: (filters as any).difficulty
                    };

                    const { results, total } = await searchService.searchPoses(
                        query,
                        { category: poseFilters.category, tags: undefined },
                        limit,
                        offset
                    );

                    set((state) => ({
                        poseResults: offset === 0 ? results : [...state.poseResults, ...results],
                        totalPoses: total,
                        loading: false
                    }));
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to search poses';
                    set({ error: errorMessage, loading: false });
                    console.error('Search poses error:', error);
                }
            },

            getSuggestions: async (query) => {
                if (!query || query.length < 2) {
                    set({ suggestions: [] });
                    return;
                }

                set({ suggestionsLoading: true });
                try {
                    const suggestions = await searchService.getSearchSuggestions(query);
                    set({ suggestions, suggestionsLoading: false });
                } catch (error) {
                    console.error('Get suggestions error:', error);
                    set({ suggestions: [], suggestionsLoading: false });
                }
            },

            reset: () => {
                set({
                    query: '',
                    professionalResults: [],
                    poseResults: [],
                    totalProfessionals: 0,
                    totalPoses: 0,
                    loading: false,
                    error: null,
                    filters: initialFilters,
                    suggestions: []
                });
            }
        }),
        {
            name: 'search-storage',
            partialize: (state) => ({
                // Only persist location and recent filters, not results
                userLocation: state.userLocation,
                filters: state.filters
            })
        }
    )
);
