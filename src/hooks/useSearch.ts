import { useEffect, useCallback, useState } from 'react';
import { useSearchStore } from '../store/searchStore';
import { useDebounce } from 'use-debounce';

/**
 * Hook for professional search
 */
export const useSearchProfessionals = (initialLimit = 20) => {
    const {
        professionalResults,
        totalProfessionals,
        loading,
        error,
        filters,
        searchProfessionals,
        setFilters
    } = useSearchStore();

    // Debounce query changes
    const [debouncedQuery] = useDebounce(filters.query, 500);

    // Trigger search when filters change
    useEffect(() => {
        searchProfessionals(0);
    }, [
        debouncedQuery,
        filters.category,
        filters.minPrice,
        filters.maxPrice,
        filters.rating,
        filters.verified,
        filters.radius,
        filters.lat,
        filters.lng
    ]);

    const loadMore = useCallback(() => {
        if (professionalResults.length < totalProfessionals && !loading) {
            searchProfessionals(professionalResults.length);
        }
    }, [professionalResults.length, totalProfessionals, loading]);

    return {
        results: professionalResults,
        total: totalProfessionals,
        loading,
        error,
        hasMore: professionalResults.length < totalProfessionals,
        loadMore,
        filters,
        setFilters
    };
};

/**
 * Hook for pose search
 */
export const useSearchPoses = (initialLimit = 20) => {
    const {
        poseResults,
        totalPoses,
        loading,
        error,
        filters,
        searchPoses,
        setFilters
    } = useSearchStore();

    const [debouncedQuery] = useDebounce(filters.query, 500);

    useEffect(() => {
        searchPoses(0);
    }, [
        debouncedQuery,
        filters.difficulty,
        filters.tags
    ]);

    const loadMore = useCallback(() => {
        if (poseResults.length < totalPoses && !loading) {
            searchPoses(poseResults.length);
        }
    }, [poseResults.length, totalPoses, loading]);

    return {
        results: poseResults,
        total: totalPoses,
        loading,
        error,
        hasMore: poseResults.length < totalPoses,
        loadMore,
        filters,
        setFilters
    };
};

/**
 * Hook for search suggestions
 */
export const useSearchSuggestions = () => {
    const { suggestions, suggestionsLoading, getSuggestions } = useSearchStore();
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 300);

    useEffect(() => {
        if (debouncedQuery) {
            getSuggestions(debouncedQuery);
        }
    }, [debouncedQuery]);

    return {
        query,
        setQuery,
        suggestions,
        loading: suggestionsLoading
    };
};

/**
 * Hook for managing location
 */
export const useSearchLocation = () => {
    const { userLocation, setUserLocation } = useSearchStore();
    const [locating, setLocating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLocating(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation(position.coords.latitude, position.coords.longitude);
                setLocating(false);
            },
            (err) => {
                setError(err.message);
                setLocating(false);
            }
        );
    }, []);

    return {
        location: userLocation,
        detectLocation,
        locating,
        error
    };
};
