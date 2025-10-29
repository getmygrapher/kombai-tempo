import { 
  CommunityPose, 
  PoseComment, 
  LibraryFilters, 
  SortBy, 
  ContributionSubmission,
  ModerationSubmission,
  ModerationAction,
  ModerationStatus,
  CommunityPosesResponse,
  PoseCommentsResponse,
  DifficultyLevel,
  PoseCategory,
  LocationType
} from '../types/community';
import { supabase } from './supabaseClient';

// Helper to map database row to CommunityPose
function mapPoseToCommunityPose(row: any): CommunityPose {
  return {
    id: row.id,
    photographer_id: row.photographer_id,
    portfolio_image_id: row.portfolio_image_id || '',
    title: row.title,
    posing_tips: row.posing_tips,
    difficulty_level: row.difficulty_level as DifficultyLevel,
    people_count: row.people_count,
    category: row.category as PoseCategory,
    mood_emotion: row.mood_emotion,
    image_url: row.image_url,
    camera_model: row.camera_model,
    lens_model: row.lens_model,
    focal_length: row.focal_length,
    aperture: row.aperture,
    shutter_speed: row.shutter_speed,
    iso_setting: row.iso_setting,
    flash_used: row.flash_used,
    exif_extraction_success: row.flash_used !== null,
    manual_override: false,
    additional_equipment: [],
    lighting_setup: row.lighting_setup,
    location_type: row.location_type as LocationType,
    story_behind: row.story_behind,
    is_approved: row.is_approved || false,
    likes_count: row.likes_count || 0,
    views_count: row.views_count || 0,
    saves_count: row.saves_count || 0,
    comments_count: row.comments_count || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    photographer: {
      id: row.photographer_id,
      name: row.photographer_name || 'Anonymous',
      profile_photo: row.photographer_photo || '',
      location: row.photographer_location || '',
      is_verified: row.photographer_verified || false,
      rating: 0,
      total_reviews: 0
    }
  };
}

export class CommunityService {
  // Pose operations
  async listPoses(filters: LibraryFilters, sortBy: SortBy, page: number = 1): Promise<CommunityPosesResponse> {
    try {
      const pageSize = 20;
      const offset = (page - 1) * pageSize;

      const { data, error } = await supabase.rpc('get_community_poses', {
        p_sort_by: sortBy,
        p_limit: pageSize,
        p_offset: offset,
        p_categories: filters.categories.length > 0 ? filters.categories : null,
        p_difficulty_levels: filters.difficultyLevels.length > 0 ? filters.difficultyLevels : null,
        p_location_types: filters.locationTypes.length > 0 ? filters.locationTypes : null,
        p_people_count: filters.peopleCount.length > 0 ? filters.peopleCount : null
      });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Failed to load poses: ${error.message}`);
      }

      const poses = (data || []).map(mapPoseToCommunityPose);

      return {
        poses,
        total: poses.length,
        page,
        hasMore: poses.length === pageSize
      };
    } catch (error: any) {
      console.error('Error listing poses:', {
        error,
        message: error?.message,
        stack: error?.stack
      });
      throw new Error(error?.message || 'Failed to load poses. Please try again.');
    }
  }

  async getPoseById(poseId: string): Promise<CommunityPose | null> {
    try {
      const { data, error } = await supabase.rpc('get_pose_details', {
        p_pose_id: poseId
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return mapPoseToCommunityPose(data[0]);
    } catch (error) {
      console.error('Error getting pose by ID:', error);
      throw error;
    }
  }

  async searchPoses(query: string): Promise<CommunityPose[]> {
    try {
      if (!query.trim()) {
        const response = await this.listPoses(
          { categories: [], difficultyLevels: [], locationTypes: [], equipmentTypes: [], peopleCount: [] },
          SortBy.RECENT,
          1
        );
        return response.poses;
      }

      const { data, error } = await supabase.rpc('search_community_poses', {
        p_search_query: query,
        p_limit: 50
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        photographer_id: row.photographer_id,
        portfolio_image_id: '',
        title: row.title,
        posing_tips: row.posing_tips,
        difficulty_level: row.difficulty_level as DifficultyLevel,
        people_count: 1,
        category: row.category as PoseCategory,
        image_url: row.image_url,
        exif_extraction_success: false,
        manual_override: false,
        additional_equipment: [],
        location_type: LocationType.STUDIO,
        is_approved: true,
        likes_count: row.likes_count || 0,
        views_count: row.views_count || 0,
        saves_count: 0,
        comments_count: 0,
        created_at: row.created_at,
        photographer: {
          id: row.photographer_id,
          name: row.photographer_name || 'Anonymous',
          profile_photo: '',
          location: '',
          is_verified: false,
          rating: 0,
          total_reviews: 0
        }
      }));
    } catch (error) {
      console.error('Error searching poses:', error);
      throw error;
    }
  }

  // Interaction operations
  async likePose(poseId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('toggle_pose_interaction', {
        p_pose_id: poseId,
        p_interaction_type: 'like'
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error liking pose:', error);
      throw error;
    }
  }

  async savePose(poseId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('toggle_pose_interaction', {
        p_pose_id: poseId,
        p_interaction_type: 'save'
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving pose:', error);
      throw error;
    }
  }

  async sharePose(poseId: string, platform: string): Promise<void> {
    try {
      // Track share interaction
      await supabase.from('pose_interactions').insert({
        pose_id: poseId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        interaction_type: 'share'
      });
    } catch (error) {
      console.error('Error sharing pose:', error);
      throw error;
    }
  }

  async trackView(poseId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('track_pose_view', {
        p_pose_id: poseId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking view:', error);
      // Don't throw - view tracking is non-critical
    }
  }

  // Comment operations
  async listComments(poseId: string): Promise<PoseCommentsResponse> {
    try {
      const { data, error } = await supabase.rpc('get_pose_comments', {
        p_pose_id: poseId,
        p_limit: 100,
        p_offset: 0
      });

      if (error) throw error;

      const comments: PoseComment[] = (data || []).map((row: any) => ({
        id: row.id,
        pose_id: row.pose_id,
        user_id: row.user_id,
        comment_text: row.comment_text,
        created_at: row.created_at,
        user: {
          name: row.user_name || 'Anonymous',
          profile_photo: row.user_photo || ''
        }
      }));

      return {
        comments,
        total: comments.length
      };
    } catch (error) {
      console.error('Error listing comments:', error);
      throw error;
    }
  }

  async addComment(poseId: string, userId: string, text: string): Promise<PoseComment> {
    try {
      const { data, error } = await supabase.rpc('add_pose_comment', {
        p_pose_id: poseId,
        p_comment_text: text
      });

      if (error) throw error;

      // Fetch the newly created comment
      const { data: commentData, error: fetchError } = await supabase
        .from('pose_comments')
        .select(`
          *,
          user:user_profiles!user_id(full_name, profile_photo_url)
        `)
        .eq('id', data)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: commentData.id,
        pose_id: commentData.pose_id,
        user_id: commentData.user_id,
        comment_text: commentData.comment_text,
        created_at: commentData.created_at,
        user: {
          name: commentData.user?.full_name || 'Anonymous',
          profile_photo: commentData.user?.profile_photo_url || ''
        }
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Contribution operations
  async submitContribution(contribution: ContributionSubmission): Promise<ModerationSubmission> {
    try {
      const cameraData = contribution.pose.camera_model ? {
        camera_model: contribution.pose.camera_model,
        lens_model: contribution.pose.lens_model,
        focal_length: contribution.pose.focal_length,
        aperture: contribution.pose.aperture,
        shutter_speed: contribution.pose.shutter_speed,
        iso_setting: contribution.pose.iso_setting,
        flash_used: contribution.pose.flash_used,
        exif_extraction_success: contribution.pose.exif_extraction_success,
        manual_override: contribution.pose.manual_override
      } : null;

      const equipment = contribution.pose.additional_equipment.length > 0
        ? contribution.pose.additional_equipment.map(name => ({ name, type: 'other' }))
        : null;

      const { data: poseId, error } = await supabase.rpc('submit_community_pose', {
        p_title: contribution.pose.title,
        p_posing_tips: contribution.pose.posing_tips,
        p_difficulty_level: contribution.pose.difficulty_level,
        p_people_count: contribution.pose.people_count,
        p_category: contribution.pose.category,
        p_image_url: contribution.pose.image_url,
        p_mood_emotion: contribution.pose.mood_emotion || null,
        p_thumbnail_url: null,
        p_medium_url: null,
        p_location_type: contribution.pose.location_type || null,
        p_lighting_setup: contribution.pose.lighting_setup || null,
        p_story_behind: contribution.pose.story_behind || null,
        p_camera_data: cameraData,
        p_equipment: equipment
      });

      if (error) throw error;

      return {
        id: poseId,
        pose_id: poseId,
        photographer_id: contribution.pose.photographer_id,
        title: contribution.pose.title,
        status: ModerationStatus.PENDING,
        submitted_at: new Date().toISOString(),
        image_url: contribution.pose.image_url
      };
    } catch (error) {
      console.error('Error submitting contribution:', error);
      throw error;
    }
  }

  async getMyContributions(userId: string): Promise<CommunityPose[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_contributions', {
        p_limit: 100,
        p_user_id: userId
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        photographer_id: userId,
        portfolio_image_id: '',
        title: row.title,
        posing_tips: '',
        difficulty_level: DifficultyLevel.BEGINNER,
        people_count: 1,
        category: row.category as PoseCategory,
        image_url: row.image_url,
        exif_extraction_success: false,
        manual_override: false,
        additional_equipment: [],
        location_type: LocationType.STUDIO,
        is_approved: row.is_approved,
        likes_count: row.likes_count || 0,
        views_count: row.views_count || 0,
        saves_count: 0,
        comments_count: row.comments_count || 0,
        created_at: row.created_at,
        photographer: {
          id: userId,
          name: 'You',
          profile_photo: '',
          location: '',
          is_verified: false,
          rating: 0,
          total_reviews: 0
        }
      }));
    } catch (error) {
      console.error('Error getting contributions:', error);
      throw error;
    }
  }

  async getMySavedPoses(): Promise<CommunityPose[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_saved_poses', {
        p_limit: 100,
        p_offset: 0
      });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        photographer_id: '',
        portfolio_image_id: '',
        title: row.title,
        posing_tips: '',
        difficulty_level: row.difficulty_level as DifficultyLevel,
        people_count: 1,
        category: row.category as PoseCategory,
        image_url: row.image_url,
        exif_extraction_success: false,
        manual_override: false,
        additional_equipment: [],
        location_type: LocationType.STUDIO,
        is_approved: true,
        likes_count: row.likes_count || 0,
        views_count: 0,
        saves_count: 0,
        comments_count: 0,
        created_at: row.saved_at,
        photographer: {
          id: '',
          name: 'Unknown',
          profile_photo: '',
          location: '',
          is_verified: false,
          rating: 0,
          total_reviews: 0
        }
      }));
    } catch (error) {
      console.error('Error getting saved poses:', error);
      throw error;
    }
  }

  // Moderation operations
  async getModerationQueue(filters?: any): Promise<{ submissions: ModerationSubmission[]; total: number; pendingCount: number }> {
    try {
      const status = filters?.status || 'pending';
      
      const { data, error } = await supabase.rpc('get_moderation_queue', {
        p_status: status,
        p_limit: 100
      });

      if (error) throw error;

      const submissions: ModerationSubmission[] = (data || []).map((row: any) => ({
        id: row.id,
        pose_id: row.id,
        photographer_id: row.photographer_id,
        title: row.title,
        status: row.moderation_status as ModerationStatus,
        submitted_at: row.created_at,
        image_url: row.image_url
      }));

      return {
        submissions,
        total: submissions.length,
        pendingCount: submissions.filter(s => s.status === ModerationStatus.PENDING).length
      };
    } catch (error) {
      console.error('Error getting moderation queue:', error);
      throw error;
    }
  }

  async reviewPose(poseId: string, action: ModerationAction, feedback?: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('moderate_pose', {
        p_pose_id: poseId,
        p_action: action,
        p_feedback: feedback || null
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error reviewing pose:', error);
      throw error;
    }
  }

  // Real-time operations
  subscribeToComments(poseId: string, callback: (comment: PoseComment) => void): () => void {
    const channel = supabase
      .channel(`pose-comments-${poseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pose_comments',
          filter: `pose_id=eq.${poseId}`
        },
        async (payload) => {
          // Fetch user details for the new comment
          const { data: userData } = await supabase
            .from('user_profiles')
            .select('full_name, profile_photo_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const comment: PoseComment = {
            id: payload.new.id,
            pose_id: payload.new.pose_id,
            user_id: payload.new.user_id,
            comment_text: payload.new.comment_text,
            created_at: payload.new.created_at,
            user: {
              name: userData?.full_name || 'Anonymous',
              profile_photo: userData?.profile_photo_url || ''
            }
          };
          callback(comment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  subscribeToModeration(callback: (submission: ModerationSubmission) => void): () => void {
    const channel = supabase
      .channel('moderation-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_poses',
          filter: 'moderation_status=eq.pending'
        },
        (payload) => {
          const submission: ModerationSubmission = {
            id: payload.new.id,
            pose_id: payload.new.id,
            photographer_id: payload.new.photographer_id,
            title: payload.new.title,
            status: ModerationStatus.PENDING,
            submitted_at: payload.new.created_at,
            image_url: payload.new.image_url
          };
          callback(submission);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const communityService = new CommunityService();