import { supabase } from './supabaseClient';
import { Coordinates } from '../types';

// Types
export interface SearchFilters {
    // Professional filters
    professionalType?: string;
    isVerified?: boolean;
    minExperience?: number;
    maxExperience?: number;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    radius?: number;

    // Pose filters
    category?: string;
    difficulty?: string;
    tags?: string[];

    // Common
    query?: string;
    limit?: number;
    offset?: number;
    lat?: number;
    lng?: number;
}

export interface ProfessionalSearchResult {
    id: string;
    userId: string;
    fullName: string;
    professionalType: string;
    specializations: string[];
    about: string;
    experienceYears: number;
    city: string;
    state: string;
    cityLat: number;
    cityLng: number;
    portfolioImages: string[];
    instagramHandle?: string;
    websiteUrl?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    distanceKm?: number;
    relevanceScore: number;
}

export interface PoseSearchResult {
    id: string;
    userId: string;
    title: string;
    story?: string;
    tips?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    tags: string[];
    category: string;
    difficulty: string;
    cameraSettings?: any;
    likesCount: number;
    savesCount: number;
    viewsCount: number;
    createdAt: string;
    updatedAt: string;
    relevanceScore: number;
}

export interface SearchSuggestion {
    suggestion: string;
    type: 'professional_type' | 'specialization' | 'tag' | 'category';
    count: number;
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Search cache
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedResult<T>(key: string): T | null {
    const cached = searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
    }
    searchCache.delete(key);
    return null;
}

function setCachedResult(key: string, data: any): void {
    searchCache.set(key, { data, timestamp: Date.now() });
}

export const searchService = {
    /**
     * Search for professionals with full-text search and proximity filtering
     */
    async searchProfessionals(
        query: string,
        location?: Coordinates,
        radiusKm: number = 25,
        filters?: SearchFilters,
        limit: number = 50,
        offset: number = 0
    ): Promise<{ results: ProfessionalSearchResult[]; total: number }> {
        try {
            const cacheKey = `prof_${query}_${location?.lat}_${location?.lng}_${radiusKm}_${JSON.stringify(filters)}`;
            const cached = getCachedResult<{ results: ProfessionalSearchResult[]; total: number }>(cacheKey);
            if (cached) return cached;

            const filterPayload: Record<string, any> = {};
            if (filters?.professionalType) filterPayload.professional_type = filters.professionalType;
            if (filters?.isVerified !== undefined) filterPayload.is_verified = filters.isVerified;
            if (filters?.minExperience) filterPayload.min_experience = filters.minExperience;

            const { data, error } = await supabase.rpc('search_professionals', {
                query_text: query || '',
                user_lat: location?.lat || null,
                user_lng: location?.lng || null,
                radius_km: radiusKm,
                filters: filterPayload,
                limit_count: limit,
                offset_count: offset
            });

            if (error) throw error;

            const results: ProfessionalSearchResult[] = (data || []).map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                fullName: row.full_name,
                professionalType: row.professional_type,
                specializations: row.specializations || [],
                about: row.about || '',
                experienceYears: row.experience_years || 0,
                city: row.city || '',
                state: row.state || '',
                cityLat: row.city_lat,
                cityLng: row.city_lng,
                portfolioImages: row.portfolio_images || [],
                instagramHandle: row.instagram_handle,
                websiteUrl: row.website_url,
                isVerified: row.is_verified || false,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                distanceKm: row.distance_km,
                relevanceScore: row.relevance_score || 0
            }));

            const result = { results, total: results.length };
            setCachedResult(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error searching professionals:', error);
            throw error;
        }
    },

    /**
     * Search for community poses
     */
    async searchPoses(
        query: string,
        filters?: { category?: string; tags?: string[] },
        limit: number = 50,
        offset: number = 0
    ): Promise<{ results: PoseSearchResult[]; total: number }> {
        try {
            const cacheKey = `pose_${query}_${JSON.stringify(filters)}`;
            const cached = getCachedResult<{ results: PoseSearchResult[]; total: number }>(cacheKey);
            if (cached) return cached;

            const filterPayload: Record<string, any> = {};
            if (filters?.category) filterPayload.category = filters.category;
            if (filters?.tags && filters.tags.length > 0) {
                filterPayload.tags = filters.tags.join(',');
            }

            const { data, error } = await supabase.rpc('search_poses', {
                query_text: query || '',
                filters: filterPayload,
                limit_count: limit,
                offset_count: offset
            });

            if (error) throw error;

            const results: PoseSearchResult[] = (data || []).map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                title: row.title,
                story: row.story,
                tips: row.tips,
                imageUrl: row.image_url,
                thumbnailUrl: row.thumbnail_url,
                tags: row.tags || [],
                category: row.category,
                difficulty: row.difficulty_level,
                cameraSettings: row.camera_settings,
                likesCount: row.likes_count || 0,
                savesCount: row.saves_count || 0,
                viewsCount: row.views_count || 0,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                relevanceScore: row.relevance_score || 0
            }));

            const result = { results, total: results.length };
            setCachedResult(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Error searching poses:', error);
            throw error;
        }
    },

    /**
     * Get autocomplete suggestions
     */
    async getSearchSuggestions(
        partialQuery: string,
        type: 'all' | 'professionals' | 'poses' = 'all'
    ): Promise<SearchSuggestion[]> {
        try {
            if (!partialQuery || partialQuery.length < 2) return [];

            const cacheKey = `suggest_${partialQuery}_${type}`;
            const cached = getCachedResult<SearchSuggestion[]>(cacheKey);
            if (cached) return cached;

            const { data, error } = await supabase.rpc('get_search_suggestions', {
                partial_query: partialQuery,
                suggestion_type: type
            });

            if (error) throw error;

            const suggestions: SearchSuggestion[] = (data || []).map((row: any) => ({
                suggestion: row.suggestion,
                type: row.type,
                count: Number(row.count)
            }));

            setCachedResult(cacheKey, suggestions);
            return suggestions;
        } catch (error) {
            console.error('Error getting search suggestions:', error);
            return [];
        }
    },

    /**
     * Debounced search for use in input fields
     */
    debouncedSearchProfessionals: debounce(
        async (
            query: string,
            location: Coordinates | undefined,
            radiusKm: number,
            filters: SearchFilters | undefined,
            callback: (results: ProfessionalSearchResult[]) => void
        ) => {
            const { results } = await searchService.searchProfessionals(
                query,
                location,
                radiusKm,
                filters
            );
            callback(results);
        },
        300
    ),

    /**
     * Debounced suggestions for autocomplete
     */
    debouncedGetSuggestions: debounce(
        async (
            partialQuery: string,
            type: 'all' | 'professionals' | 'poses',
            callback: (suggestions: SearchSuggestion[]) => void
        ) => {
            const suggestions = await searchService.getSearchSuggestions(partialQuery, type);
            callback(suggestions);
        },
        300
    ),

    /**
     * Clear search cache
     */
    clearCache(): void {
        searchCache.clear();
    }
};
