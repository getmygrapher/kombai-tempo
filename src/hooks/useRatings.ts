import { useEffect, useCallback } from 'react';
import { useRatingStore } from '../store/ratingStore';
import { Rating, RatingStats } from '../services/ratingService';

/**
 * Hook to get ratings for a specific user
 */
export const useUserRatings = (userId: string, limit = 10, verifiedOnly = false) => {
    const {
        userRatings,
        userRatingsTotal,
        userRatingsLoading,
        userRatingsError,
        fetchUserRatings
    } = useRatingStore();

    const ratings = userRatings[userId] || [];
    const total = userRatingsTotal[userId] || 0;

    useEffect(() => {
        if (userId) {
            fetchUserRatings(userId, limit, 0, verifiedOnly);
        }
    }, [userId, limit, verifiedOnly]);

    const loadMore = useCallback(() => {
        if (ratings.length < total && !userRatingsLoading) {
            fetchUserRatings(userId, limit, ratings.length, verifiedOnly);
        }
    }, [userId, limit, ratings.length, total, userRatingsLoading, verifiedOnly]);

    return {
        ratings,
        total,
        loading: userRatingsLoading,
        error: userRatingsError,
        hasMore: ratings.length < total,
        loadMore,
        refetch: () => fetchUserRatings(userId, limit, 0, verifiedOnly)
    };
};

/**
 * Hook to get rating statistics for a user
 */
export const useRatingStats = (userId: string) => {
    const { ratingStats, ratingStatsLoading, fetchRatingStats } = useRatingStore();

    const stats = ratingStats[userId] || {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
    };

    useEffect(() => {
        if (userId && !ratingStats[userId]) {
            fetchRatingStats(userId);
        }
    }, [userId]);

    return {
        stats,
        loading: ratingStatsLoading,
        refetch: () => fetchRatingStats(userId)
    };
};

/**
 * Hook to submit a rating
 */
export const useSubmitRating = () => {
    const { submitRating, submitting, submitError } = useRatingStore();

    const submit = async (
        professionalId: string,
        jobId: string,
        rating: number,
        reviewText?: string,
        reviewTitle?: string
    ) => {
        try {
            return await submitRating(professionalId, jobId, rating, reviewText, reviewTitle);
        } catch (error) {
            console.error('Submit rating failed:', error);
            throw error;
        }
    };

    return {
        submit,
        submitting,
        error: submitError
    };
};

/**
 * Hook to check if current user can rate another user
 */
export const useCanRate = (ratedUserId: string, jobId: string) => {
    const { checkCanRate, canRateCache } = useRatingStore();
    const cacheKey = `${ratedUserId}_${jobId}`;
    const result = canRateCache[cacheKey];

    useEffect(() => {
        if (ratedUserId && jobId && !result) {
            checkCanRate(ratedUserId, jobId);
        }
    }, [ratedUserId, jobId]);

    return {
        canRate: result?.canRate ?? false,
        reason: result?.reason,
        loading: !result,
        check: () => checkCanRate(ratedUserId, jobId)
    };
};

/**
 * Hook to delete a rating
 */
export const useDeleteRating = () => {
    const { deleteRating, submitting, submitError } = useRatingStore();

    const remove = async (ratingId: string, professionalId: string) => {
        try {
            await deleteRating(ratingId, professionalId);
        } catch (error) {
            console.error('Delete rating failed:', error);
            throw error;
        }
    };

    return {
        remove,
        deleting: submitting,
        error: submitError
    };
};
