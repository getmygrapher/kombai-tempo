// Profile Management Service - Complete Backend Integration
// Replaces mock data with real Supabase operations

import { supabase } from './supabaseClient';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Rating {
  id: string;
  professionalId: string;
  clientId: string;
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
  responseText?: string;
  responseAt?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isVerified: boolean;
  createdAt: string;
  // Populated fields
  clientName?: string;
  clientAvatar?: string;
}

export interface SubmitRatingData {
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
}

export interface ProfileAnalytics {
  totalViews: number;
  uniqueViewers: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  averageSessionDuration: number;
  profileSavesCount: number;
  contactRequestsCount: number;
  conversionRate: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  profileCompletionPercent: number;
  trendingScore: number;
  averageResponseTime?: number;
  responseRate?: number;
}

export interface SavedProfile {
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  professionalType?: string;
  professionalCategory?: string;
  city?: string;
  state?: string;
  averageRating?: number;
  totalReviews?: number;
  note?: string;
  collectionName?: string;
  savedAt: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  cameraModel?: string;
  lensModel?: string;
  exifData?: Record<string, any>;
  displayOrder: number;
  isFeatured: boolean;
  isVisible: boolean;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactRequest {
  id: string;
  professionalId: string;
  requesterId: string;
  jobId?: string;
  requestMessage?: string;
  contactMethod: 'phone' | 'email' | 'whatsapp' | 'message';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  contactShared: boolean;
  responseMessage?: string;
  respondedAt?: string;
  createdAt: string;
  expiresAt: string;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

function mapError(error: any): Error {
  if (!error) return new Error('Unknown error');
  const message = error.message || error.error_description || 'Unexpected error';
  return new Error(message);
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw mapError(error);
  const uid = data.user?.id;
  if (!uid) throw new Error('No authenticated user');
  return uid;
}

// ============================================================================
// RATINGS & REVIEWS SERVICE
// ============================================================================

export const ratingsService = {
  /**
   * Submit a rating and review for a professional
   */
  async submitRating(data: SubmitRatingData): Promise<{ success: boolean; ratingId: string }> {
    try {
      const { data: result, error } = await supabase.rpc('submit_rating', {
        professional_id_param: data.professionalId,
        job_id_param: data.jobId || null,
        rating_param: data.rating,
        review_title_param: data.reviewTitle || null,
        review_text_param: data.reviewText || null,
        professionalism_rating_param: data.professionalismRating || null,
        quality_rating_param: data.qualityRating || null,
        punctuality_rating_param: data.punctualityRating || null,
        communication_rating_param: data.communicationRating || null,
        value_rating_param: data.valueRating || null,
        media_urls_param: data.mediaUrls || []
      });

      if (error) throw mapError(error);

      return {
        success: result.success,
        ratingId: result.rating_id
      };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Get ratings for a professional with pagination
   */
  async getProfessionalRatings(
    professionalId: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'recent' | 'highest' | 'lowest' | 'helpful';
    } = {}
  ): Promise<Rating[]> {
    try {
      const { data, error } = await supabase.rpc('get_professional_ratings', {
        professional_id_param: professionalId,
        limit_param: options.limit || 10,
        offset_param: options.offset || 0,
        sort_by: options.sortBy || 'recent'
      });

      if (error) throw mapError(error);

      return (data || []).map((r: any) => ({
        id: r.id,
        professionalId,
        clientId: '', // Not exposed for privacy
        rating: r.rating,
        reviewTitle: r.review_title,
        reviewText: r.review_text,
        professionalismRating: r.professionalism_rating,
        qualityRating: r.quality_rating,
        punctualityRating: r.punctuality_rating,
        communicationRating: r.communication_rating,
        valueRating: r.value_rating,
        mediaUrls: r.media_urls,
        responseText: r.response_text,
        responseAt: r.response_at,
        helpfulCount: r.helpful_count,
        notHelpfulCount: r.not_helpful_count,
        isVerified: r.is_verified,
        createdAt: r.created_at,
        clientName: r.client_name,
        clientAvatar: r.client_avatar
      }));
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Respond to a rating (professional only)
   */
  async respondToRating(ratingId: string, responseText: string): Promise<{ success: boolean }> {
    try {
      const { data, error } = await supabase.rpc('respond_to_rating', {
        rating_id_param: ratingId,
        response_text_param: responseText
      });

      if (error) throw mapError(error);

      return { success: data.success };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Mark a review as helpful or not helpful
   */
  async markReviewHelpful(reviewId: string, isHelpful: boolean): Promise<{ success: boolean }> {
    try {
      const { data, error } = await supabase.rpc('mark_review_helpful', {
        review_id_param: reviewId,
        is_helpful_param: isHelpful
      });

      if (error) throw mapError(error);

      return { success: data.success };
    } catch (error) {
      throw mapError(error);
    }
  }
};

// ============================================================================
// PROFILE ANALYTICS SERVICE
// ============================================================================

export const profileAnalyticsService = {
  /**
   * Track a profile view event
   */
  async trackProfileView(
    professionalId: string,
    options: {
      source?: string;
      referrerUrl?: string;
      deviceType?: string;
      sessionId?: string;
    } = {}
  ): Promise<{ success: boolean; viewId: string }> {
    try {
      const { data, error } = await supabase.rpc('track_profile_view_event', {
        professional_id_param: professionalId,
        source_param: options.source || null,
        referrer_url_param: options.referrerUrl || null,
        device_type_param: options.deviceType || null,
        session_id_param: options.sessionId || null
      });

      if (error) throw mapError(error);

      return {
        success: data.success,
        viewId: data.view_id
      };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Get analytics data for the authenticated professional
   */
  async getProfileAnalytics(dateRangeDays: number = 30): Promise<ProfileAnalytics> {
    try {
      const { data, error } = await supabase.rpc('get_profile_analytics_data', {
        date_range_days: dateRangeDays
      });

      if (error) throw mapError(error);

      const summary = data.summary;
      return {
        totalViews: summary.total_views || 0,
        uniqueViewers: summary.unique_viewers || 0,
        viewsThisWeek: summary.views_this_week || 0,
        viewsThisMonth: summary.views_this_month || 0,
        averageSessionDuration: summary.average_session_duration || 0,
        profileSavesCount: summary.profile_saves_count || 0,
        contactRequestsCount: summary.contact_requests_count || 0,
        conversionRate: summary.conversion_rate || 0,
        averageRating: summary.average_rating || 0,
        totalReviews: summary.total_reviews || 0,
        ratingDistribution: summary.rating_distribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        profileCompletionPercent: summary.profile_completion_percent || 0,
        trendingScore: summary.trending_score || 0,
        averageResponseTime: summary.average_response_time,
        responseRate: summary.response_rate
      };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Calculate profile completion percentage
   */
  async calculateProfileCompletion(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_profile_completion');

      if (error) throw mapError(error);

      return data || 0;
    } catch (error) {
      throw mapError(error);
    }
  }
};

// ============================================================================
// SAVED PROFILES SERVICE
// ============================================================================

export const savedProfilesService = {
  /**
   * Save or unsave a professional profile
   */
  async toggleSaveProfile(
    professionalId: string,
    options: {
      note?: string;
      collectionName?: string;
    } = {}
  ): Promise<{ success: boolean; isSaved: boolean }> {
    try {
      const { data, error } = await supabase.rpc('toggle_save_profile', {
        professional_id_param: professionalId,
        note_param: options.note || null,
        collection_name_param: options.collectionName || null
      });

      if (error) throw mapError(error);

      return {
        success: data.success,
        isSaved: data.is_saved
      };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Get user's saved profiles
   */
  async getSavedProfiles(
    options: {
      collectionName?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SavedProfile[]> {
    try {
      const { data, error } = await supabase.rpc('get_saved_profiles', {
        collection_name_param: options.collectionName || null,
        limit_param: options.limit || 20,
        offset_param: options.offset || 0
      });

      if (error) throw mapError(error);

      return (data || []).map((p: any) => ({
        professionalId: p.professional_id,
        professionalName: p.professional_name,
        professionalAvatar: p.professional_avatar,
        professionalType: p.professional_type,
        professionalCategory: p.professional_category,
        city: p.city,
        state: p.state,
        averageRating: p.average_rating,
        totalReviews: p.total_reviews,
        note: p.note,
        collectionName: p.collection_name,
        savedAt: p.saved_at
      }));
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Check if a profile is saved
   */
  async isProfileSaved(professionalId: string): Promise<boolean> {
    try {
      const uid = await getCurrentUserId();
      const { data, error } = await supabase
        .from('saved_profiles')
        .select('id')
        .eq('user_id', uid)
        .eq('professional_id', professionalId)
        .single();

      if (error && error.code !== 'PGRST116') throw mapError(error);

      return !!data;
    } catch (error) {
      return false;
    }
  }
};

// ============================================================================
// CONTACT REQUESTS SERVICE
// ============================================================================

export const contactRequestsService = {
  /**
   * Create a contact request
   */
  async createContactRequest(
    professionalId: string,
    options: {
      jobId?: string;
      requestMessage?: string;
      contactMethod?: 'phone' | 'email' | 'whatsapp' | 'message';
    } = {}
  ): Promise<{ success: boolean; requestId: string }> {
    try {
      const { data, error } = await supabase.rpc('create_contact_request', {
        professional_id_param: professionalId,
        job_id_param: options.jobId || null,
        request_message_param: options.requestMessage || null,
        contact_method_param: options.contactMethod || 'message'
      });

      if (error) throw mapError(error);

      return {
        success: data.success,
        requestId: data.request_id
      };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Respond to a contact request (professional only)
   */
  async respondToContactRequest(
    requestId: string,
    status: 'accepted' | 'declined',
    responseMessage?: string
  ): Promise<{ success: boolean }> {
    try {
      const { data, error } = await supabase.rpc('respond_to_contact_request', {
        request_id_param: requestId,
        status_param: status,
        response_message_param: responseMessage || null
      });

      if (error) throw mapError(error);

      return { success: data.success };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Get contact requests for authenticated user
   */
  async getContactRequests(
    type: 'received' | 'sent' = 'received'
  ): Promise<ContactRequest[]> {
    try {
      const uid = await getCurrentUserId();
      
      const query = supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (type === 'received') {
        query.eq('professional_id', uid);
      } else {
        query.eq('requester_id', uid);
      }

      const { data, error } = await query;

      if (error) throw mapError(error);

      return (data || []).map((r: any) => ({
        id: r.id,
        professionalId: r.professional_id,
        requesterId: r.requester_id,
        jobId: r.job_id,
        requestMessage: r.request_message,
        contactMethod: r.contact_method,
        status: r.status,
        contactShared: r.contact_shared,
        responseMessage: r.response_message,
        respondedAt: r.responded_at,
        createdAt: r.created_at,
        expiresAt: r.expires_at
      }));
    } catch (error) {
      throw mapError(error);
    }
  }
};

// ============================================================================
// PORTFOLIO SERVICE
// ============================================================================

export const portfolioService = {
  /**
   * Add a portfolio item
   */
  async addPortfolioItem(data: {
    title: string;
    description?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    category?: string;
    tags?: string[];
    exifData?: Record<string, any>;
  }): Promise<{ success: boolean; itemId: string }> {
    try {
      const { data: result, error } = await supabase.rpc('add_portfolio_item', {
        title_param: data.title,
        description_param: data.description || null,
        image_url_param: data.imageUrl,
        thumbnail_url_param: data.thumbnailUrl || null,
        category_param: data.category || null,
        tags_param: data.tags || [],
        exif_data_param: data.exifData || null
      });

      if (error) throw mapError(error);

      return {
        success: result.success,
        itemId: result.item_id
      };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Get portfolio items for a user
   */
  async getPortfolioItems(userId?: string): Promise<PortfolioItem[]> {
    try {
      const targetUserId = userId || await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) throw mapError(error);

      return (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
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
        isVisible: item.is_visible,
        viewsCount: item.views_count,
        likesCount: item.likes_count,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Reorder portfolio items
   */
  async reorderPortfolioItems(itemIds: string[]): Promise<{ success: boolean }> {
    try {
      const { data, error } = await supabase.rpc('reorder_portfolio_items', {
        item_ids_ordered: itemIds
      });

      if (error) throw mapError(error);

      return { success: data.success };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Delete a portfolio item
   */
  async deletePortfolioItem(itemId: string): Promise<{ success: boolean }> {
    try {
      const uid = await getCurrentUserId();
      
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', uid);

      if (error) throw mapError(error);

      return { success: true };
    } catch (error) {
      throw mapError(error);
    }
  },

  /**
   * Update a portfolio item
   */
  async updatePortfolioItem(
    itemId: string,
    updates: Partial<PortfolioItem>
  ): Promise<{ success: boolean }> {
    try {
      const uid = await getCurrentUserId();
      
      const { error } = await supabase
        .from('portfolio_items')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          tags: updates.tags,
          is_featured: updates.isFeatured,
          is_visible: updates.isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', uid);

      if (error) throw mapError(error);

      return { success: true };
    } catch (error) {
      throw mapError(error);
    }
  }
};

// ============================================================================
// COMBINED EXPORT
// ============================================================================

export const profileManagementService = {
  ratings: ratingsService,
  analytics: profileAnalyticsService,
  savedProfiles: savedProfilesService,
  contactRequests: contactRequestsService,
  portfolio: portfolioService
};

export default profileManagementService;
