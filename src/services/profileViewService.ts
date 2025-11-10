// Profile View Service - Complete Frontend Integration
// Connects Profile View UI to backend RPC functions

import { supabase } from './supabaseClient';
import { 
  ratingsService, 
  profileAnalyticsService, 
  savedProfilesService,
  contactRequestsService,
  portfolioService
} from './profileManagementService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProfileDetails {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  professionalType?: string;
  professionalCategory?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  workRadiusKm?: number;
  experienceLevel?: string;
  specializations?: string[];
  instagramHandle?: string;
  portfolioLinks?: string[];
  pricing?: any;
  equipment?: any;
  additionalLocations?: any;
  averageRating?: number;
  totalReviews?: number;
  ratingDistribution?: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  totalViews?: number;
  profileCompletionPercent?: number;
  isVerified?: boolean;
  isTopRated?: boolean;
  isFeatured?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  identityVerified?: boolean;
  professionalVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ViewerPermissions {
  canViewContact: boolean;
  canViewPricing: boolean;
  canViewInstagram: boolean;
  canViewAvailability: boolean;
  canSendMessage: boolean;
  canSubmitReview: boolean;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function mapError(error: any): Error {
  if (!error) return new Error('Unknown error');
  const message = error.message || error.error_description || 'Unexpected error';
  return new Error(message);
}

async function getCurrentUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id || null;
}

// ============================================================================
// PROFILE VIEW SERVICE
// ============================================================================

export const profileViewService = {
  /**
   * Get complete profile details with ratings and analytics
   */
  async getProfileDetails(profileId: string): Promise<ProfileDetails | null> {
    try {
      const { data, error } = await supabase.rpc('get_profile_details', {
        p_profile_id: profileId
      });

      if (error) throw mapError(error);
      if (!data || data.length === 0) return null;

      const profile = data[0];
      return {
        userId: profile.user_id,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        phone: profile.phone,
        professionalType: profile.professional_type,
        professionalCategory: profile.professional_category,
        city: profile.city,
        state: profile.state,
        pinCode: profile.pin_code,
        workRadiusKm: profile.work_radius_km,
        experienceLevel: profile.experience_level,
        specializations: profile.specializations,
        instagramHandle: profile.instagram_handle,
        portfolioLinks: profile.portfolio_links,
        pricing: profile.pricing,
        equipment: profile.equipment,
        additionalLocations: profile.additional_locations,
        averageRating: profile.average_rating,
        totalReviews: profile.total_reviews,
        ratingDistribution: profile.rating_distribution,
        totalViews: profile.total_views,
        profileCompletionPercent: profile.profile_completion_percent,
        isVerified: profile.is_verified,
        isTopRated: profile.is_top_rated,
        isFeatured: profile.is_featured,
        emailVerified: profile.email_verified,
        phoneVerified: profile.phone_verified,
        identityVerified: profile.identity_verified,
        professionalVerified: profile.professional_verified,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      };
    } catch (error) {
      console.error('Error fetching profile details:', error);
      throw mapError(error);
    }
  },

  /**
   * Get portfolio items for a profile
   */
  async getPortfolio(profileId: string, page: number = 0, limit: number = 20) {
    try {
      const { data, error } = await supabase.rpc('get_profile_portfolio', {
        p_profile_id: profileId,
        p_limit: limit,
        p_offset: page * limit
      });

      if (error) throw mapError(error);

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        thumbnailUrl: item.thumbnail_url,
        category: item.category,
        tags: item.tags,
        cameraModel: item.camera_model,
        lensModel: item.lens_model,
        exifData: item.exif_data,
        displayOrder: item.display_order,
        isFeatured: item.is_featured,
        viewsCount: item.views_count,
        likesCount: item.likes_count,
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw mapError(error);
    }
  },

  /**
   * Get ratings for a profile
   */
  async getRatings(
    profileId: string, 
    sortBy: 'recent' | 'helpful' | 'rating_high' | 'rating_low' = 'recent',
    page: number = 0,
    limit: number = 10
  ) {
    return ratingsService.getProfessionalRatings(profileId, {
      sortBy,
      limit,
      offset: page * limit
    });
  },

  /**
   * Submit a rating for a profile
   */
  async submitRating(data: {
    professionalId: string;
    jobId?: string;
    rating: number;
    reviewTitle?: string;
    reviewText?: string;
    professionalismRating?: number;
    qualityRating?: number;
    punctualityRating?: number;
    communicationRating?: number;
    valueRating?: number;
    mediaUrls?: string[];
  }) {
    return ratingsService.submitRating(data);
  },

  /**
   * Track profile view
   */
  async trackView(
    profileId: string,
    source: string = 'direct',
    referrerUrl?: string
  ) {
    try {
      const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) 
        ? 'mobile' 
        : /Tablet|iPad/i.test(navigator.userAgent)
        ? 'tablet'
        : 'desktop';

      return await profileAnalyticsService.trackProfileView(profileId, {
        source,
        referrerUrl,
        deviceType,
        sessionId: sessionStorage.getItem('session_id') || undefined
      });
    } catch (error) {
      console.warn('Failed to track profile view:', error);
      return { success: false, viewId: '' };
    }
  },

  /**
   * Save or unsave a profile
   */
  async toggleSave(profileId: string, note?: string, collectionName?: string) {
    return savedProfilesService.toggleSaveProfile(profileId, { note, collectionName });
  },

  /**
   * Check if profile is saved
   */
  async isSaved(profileId: string): Promise<boolean> {
    return savedProfilesService.isProfileSaved(profileId);
  },

  /**
   * Get saved profiles
   */
  async getSavedProfiles(page: number = 0, limit: number = 20, collectionName?: string) {
    return savedProfilesService.getSavedProfiles({
      collectionName,
      limit,
      offset: page * limit
    });
  },

  /**
   * Create contact request
   */
  async createContactRequest(
    profileId: string,
    options: {
      jobId?: string;
      message?: string;
      contactMethod?: 'phone' | 'email' | 'whatsapp' | 'message';
    } = {}
  ) {
    return contactRequestsService.createContactRequest(profileId, {
      jobId: options.jobId,
      requestMessage: options.message,
      contactMethod: options.contactMethod
    });
  },

  /**
   * Calculate viewer permissions based on current user and profile
   */
  async calculateViewerPermissions(profileId: string): Promise<ViewerPermissions> {
    try {
      const currentUserId = await getCurrentUserId();
      
      // If not logged in, limited permissions
      if (!currentUserId) {
        return {
          canViewContact: false,
          canViewPricing: true, // Public pricing
          canViewInstagram: false,
          canViewAvailability: false,
          canSendMessage: false,
          canSubmitReview: false
        };
      }

      // If viewing own profile, full permissions
      if (currentUserId === profileId) {
        return {
          canViewContact: true,
          canViewPricing: true,
          canViewInstagram: true,
          canViewAvailability: true,
          canSendMessage: false, // Can't message self
          canSubmitReview: false // Can't review self
        };
      }

      // For other authenticated users
      // TODO: Check if user has worked with this professional (completed job)
      const hasWorkedTogether = false; // Placeholder

      return {
        canViewContact: false, // Requires contact request
        canViewPricing: true,
        canViewInstagram: false, // Pro feature
        canViewAvailability: true,
        canSendMessage: true,
        canSubmitReview: hasWorkedTogether
      };
    } catch (error) {
      console.error('Error calculating permissions:', error);
      // Default to minimal permissions on error
      return {
        canViewContact: false,
        canViewPricing: true,
        canViewInstagram: false,
        canViewAvailability: false,
        canSendMessage: false,
        canSubmitReview: false
      };
    }
  },

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string, isHelpful: boolean) {
    return ratingsService.markReviewHelpful(reviewId, isHelpful);
  },

  /**
   * Respond to a rating (professional only)
   */
  async respondToRating(ratingId: string, responseText: string) {
    return ratingsService.respondToRating(ratingId, responseText);
  },

  /**
   * Get profile analytics (for own profile)
   */
  async getAnalytics(dateRangeDays: number = 30) {
    return profileAnalyticsService.getProfileAnalytics(dateRangeDays);
  },

  /**
   * Calculate profile completion
   */
  async calculateCompletion() {
    return profileAnalyticsService.calculateProfileCompletion();
  }
};

export default profileViewService;
