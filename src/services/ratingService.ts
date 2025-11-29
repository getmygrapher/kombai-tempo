import { supabase } from './supabaseClient';

// Types
export interface Rating {
    ratingId: string;
    raterUserId: string;
    raterName: string;
    jobId: string;
    jobTitle: string;
    rating: number;
    reviewText?: string;
    isVerified: boolean;
    createdAt: string;
}

export interface RatingStats {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
        '1': number;
        '2': number;
        '3': number;
        '4': number;
        '5': number;
    };
}

export interface CanRateResult {
    canRate: boolean;
    reason: string;
}

export const ratingService = {
    /**
     * Submit a rating for a user (uses existing submit_rating RPC from profile_view_rpc_functions.sql)
     */
    async submitRating(
        professionalId: string,
        jobId: string,
        rating: number,
        reviewText?: string,
        reviewTitle?: string
    ): Promise<string> {
        try {
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Use the existing submit_rating function from profile_view_rpc_functions.sql
            const { data, error } = await supabase.rpc('submit_rating', {
                professional_id_param: professionalId,
                job_id_param: jobId,
                rating_param: rating,
                review_title_param: reviewTitle || null,
                review_text_param: reviewText || null
            });

            if (error) throw error;

            // The function returns a jsonb object with rating_id
            return data.rating_id as string;
        } catch (error) {
            console.error('Error submitting rating:', error);
            throw error;
        }
    },

    /**
     * Get ratings for a user
     */
    async getUserRatings(
        userId: string,
        limit: number = 10,
        offset: number = 0,
        verifiedOnly: boolean = false
    ): Promise<{ ratings: Rating[]; total: number }> {
        try {
            const { data, error } = await supabase.rpc('get_user_ratings', {
                p_user_id: userId,
                p_limit: limit,
                p_offset: offset,
                p_verified_only: verifiedOnly
            });

            if (error) throw error;

            const ratings: Rating[] = (data || []).map((row: any) => ({
                ratingId: row.rating_id,
                raterUserId: row.rater_user_id,
                raterName: row.rater_name,
                jobId: row.job_id,
                jobTitle: row.job_title,
                rating: row.rating,
                reviewText: row.review_text,
                isVerified: row.is_verified,
                createdAt: row.created_at
            }));

            return { ratings, total: ratings.length };
        } catch (error) {
            console.error('Error getting user ratings:', error);
            throw error;
        }
    },

    /**
     * Get rating statistics for a user
     */
    async getRatingStats(userId: string): Promise<RatingStats> {
        try {
            const { data, error } = await supabase.rpc('get_rating_stats', {
                p_user_id: userId
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                return {
                    averageRating: 0,
                    totalRatings: 0,
                    ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 }
                };
            }

            const row = data[0];
            return {
                averageRating: Number(row.average_rating),
                totalRatings: row.total_ratings,
                ratingDistribution: row.rating_distribution
            };
        } catch (error) {
            console.error('Error getting rating stats:', error);
            throw error;
        }
    },

    /**
     * Check if current user can rate another user for a specific job
     */
    async canRateUser(ratedUserId: string, jobId: string): Promise<CanRateResult> {
        try {
            const { data, error } = await supabase.rpc('can_rate_user', {
                p_rated_user_id: ratedUserId,
                p_job_id: jobId
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                return { canRate: false, reason: 'Unable to verify rating eligibility' };
            }

            const row = data[0];
            return {
                canRate: row.can_rate,
                reason: row.reason
            };
        } catch (error) {
            console.error('Error checking if can rate user:', error);
            return { canRate: false, reason: 'Error checking rating eligibility' };
        }
    },

    /**
     * Get ratings given by a user
     */
    async getRatingsByUser(
        raterUserId?: string,
        limit: number = 10,
        offset: number = 0
    ): Promise<{ ratings: Rating[]; total: number }> {
        try {
            const { data, error } = await supabase.rpc('get_ratings_by_user', {
                p_rater_user_id: raterUserId || null,
                p_limit: limit,
                p_offset: offset
            });

            if (error) throw error;

            const ratings: Rating[] = (data || []).map((row: any) => ({
                ratingId: row.rating_id,
                raterUserId: row.rated_user_id, // Note: this is the rated user in this context
                raterName: row.rated_user_name,
                jobId: row.job_id,
                jobTitle: row.job_title,
                rating: row.rating,
                reviewText: row.review_text,
                isVerified: row.is_verified,
                createdAt: row.created_at
            }));

            return { ratings, total: ratings.length };
        } catch (error) {
            console.error('Error getting ratings by user:', error);
            throw error;
        }
    },

    /**
     * Delete a rating
     */
    async deleteRating(ratingId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('delete_rating', {
                p_rating_id: ratingId
            });

            if (error) throw error;

            return data as boolean;
        } catch (error) {
            console.error('Error deleting rating:', error);
            throw error;
        }
    },

    /**
     * Get average rating for a user (quick access)
     */
    async getAverageRating(userId: string): Promise<number> {
        try {
            const stats = await this.getRatingStats(userId);
            return stats.averageRating;
        } catch (error) {
            console.error('Error getting average rating:', error);
            return 0;
        }
    },

    /**
     * Format rating for display (e.g., "4.5" or "No ratings yet")
     */
    formatRating(rating: number, totalRatings: number): string {
        if (totalRatings === 0) {
            return 'No ratings yet';
        }
        return rating.toFixed(1);
    },

    /**
     * Get star display array for UI (e.g., [1, 1, 1, 0.5, 0] for 3.5 stars)
     */
    getStarDisplay(rating: number): number[] {
        const stars: number[] = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(1); // Full star
            } else if (i === fullStars && hasHalfStar) {
                stars.push(0.5); // Half star
            } else {
                stars.push(0); // Empty star
            }
        }

        return stars;
    },

    /**
     * Get rating color class based on value
     */
    getRatingColorClass(rating: number): string {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 3.5) return 'text-yellow-600';
        if (rating >= 2.5) return 'text-orange-600';
        return 'text-red-600';
    },

    /**
     * Validate rating input
     */
    validateRating(rating: number): { valid: boolean; error?: string } {
        if (!Number.isInteger(rating)) {
            return { valid: false, error: 'Rating must be a whole number' };
        }
        if (rating < 1 || rating > 5) {
            return { valid: false, error: 'Rating must be between 1 and 5' };
        }
        return { valid: true };
    },

    /**
     * Validate review text
     */
    validateReviewText(text: string): { valid: boolean; error?: string } {
        if (text && text.length > 1000) {
            return { valid: false, error: 'Review text must be less than 1000 characters' };
        }
        return { valid: true };
    }
};
