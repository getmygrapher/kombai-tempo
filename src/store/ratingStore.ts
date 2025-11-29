import { create } from 'zustand';
import { ratingService, Rating, RatingStats, CanRateResult } from '../services/ratingService';

interface RatingState {
    // Ratings by user
    userRatings: Record<string, Rating[]>;
    userRatingsTotal: Record<string, number>;
    userRatingsLoading: boolean;
    userRatingsError: string | null;

    // Rating stats by user
    ratingStats: Record<string, RatingStats>;
    ratingStatsLoading: boolean;

    // Submission state
    submitting: boolean;
    submitError: string | null;

    // Eligibility check cache
    canRateCache: Record<string, CanRateResult>;

    // Actions
    fetchUserRatings: (userId: string, limit?: number, offset?: number, verifiedOnly?: boolean) => Promise<void>;
    fetchRatingStats: (userId: string) => Promise<void>;
    submitRating: (professionalId: string, jobId: string, rating: number, reviewText?: string, reviewTitle?: string) => Promise<string>;
    checkCanRate: (ratedUserId: string, jobId: string) => Promise<CanRateResult>;
    deleteRating: (ratingId: string, professionalId: string) => Promise<void>;
    clearError: () => void;
}

export const useRatingStore = create<RatingState>((set, get) => ({
    userRatings: {},
    userRatingsTotal: {},
    userRatingsLoading: false,
    userRatingsError: null,
    ratingStats: {},
    ratingStatsLoading: false,
    submitting: false,
    submitError: null,
    canRateCache: {},

    fetchUserRatings: async (userId, limit = 10, offset = 0, verifiedOnly = false) => {
        set({ userRatingsLoading: true, userRatingsError: null });
        try {
            const { ratings, total } = await ratingService.getUserRatings(userId, limit, offset, verifiedOnly);

            set((state) => ({
                userRatings: {
                    ...state.userRatings,
                    [userId]: offset === 0 ? ratings : [...(state.userRatings[userId] || []), ...ratings]
                },
                userRatingsTotal: {
                    ...state.userRatingsTotal,
                    [userId]: total
                },
                userRatingsLoading: false
            }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ratings';
            set({ userRatingsError: errorMessage, userRatingsLoading: false });
            console.error('Error fetching ratings:', error);
        }
    },

    fetchRatingStats: async (userId) => {
        // Don't set loading true if we already have stats, to avoid flicker
        if (!get().ratingStats[userId]) {
            set({ ratingStatsLoading: true });
        }

        try {
            const stats = await ratingService.getRatingStats(userId);
            set((state) => ({
                ratingStats: {
                    ...state.ratingStats,
                    [userId]: stats
                },
                ratingStatsLoading: false
            }));
        } catch (error) {
            console.error('Error fetching rating stats:', error);
            set({ ratingStatsLoading: false });
        }
    },

    submitRating: async (professionalId, jobId, rating, reviewText, reviewTitle) => {
        set({ submitting: true, submitError: null });
        try {
            const ratingId = await ratingService.submitRating(professionalId, jobId, rating, reviewText, reviewTitle);

            // Refresh ratings and stats for the professional
            await Promise.all([
                get().fetchUserRatings(professionalId, 10, 0),
                get().fetchRatingStats(professionalId)
            ]);

            set({ submitting: false });
            return ratingId;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit rating';
            set({ submitError: errorMessage, submitting: false });
            throw error;
        }
    },

    checkCanRate: async (ratedUserId, jobId) => {
        const cacheKey = `${ratedUserId}_${jobId}`;
        const cached = get().canRateCache[cacheKey];

        if (cached) return cached;

        try {
            const result = await ratingService.canRateUser(ratedUserId, jobId);
            set((state) => ({
                canRateCache: {
                    ...state.canRateCache,
                    [cacheKey]: result
                }
            }));
            return result;
        } catch (error) {
            console.error('Error checking eligibility:', error);
            return { canRate: false, reason: 'Error checking eligibility' };
        }
    },

    deleteRating: async (ratingId, professionalId) => {
        set({ submitting: true, submitError: null });
        try {
            await ratingService.deleteRating(ratingId);

            // Refresh ratings and stats
            await Promise.all([
                get().fetchUserRatings(professionalId, 10, 0),
                get().fetchRatingStats(professionalId)
            ]);

            set({ submitting: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete rating';
            set({ submitError: errorMessage, submitting: false });
            throw error;
        }
    },

    clearError: () => {
        set({ userRatingsError: null, submitError: null });
    }
}));
