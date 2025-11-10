import { createClient } from '@supabase/supabase-js';

// Read Supabase config from Vite env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR-PROJECT') || supabaseAnonKey.includes('YOUR-ANON-KEY')) {
  console.error('Supabase environment variables are not properly configured');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'X-Client-Info': 'getmygrapher-web',
      },
    },
  }
);

// Community Poses related types and functions
export interface CommunityPose {
  id: string;
  photographer_id: string;
  portfolio_image_id: string;
  title: string;
  posing_tips: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  people_count: number;
  category: string;
  mood_emotion?: string;
  
  // EXIF and Camera Data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exif_data?: Record<string, any>;
  camera_model?: string;
  lens_model?: string;
  focal_length?: number;
  aperture?: number;
  shutter_speed?: string;
  iso_setting?: number;
  flash_used?: boolean;
  exif_extraction_success?: boolean;
  manual_override?: boolean;
  
  // Additional Equipment and Context
  additional_equipment?: string[];
  lighting_setup?: string;
  location_type?: string;
  story_behind?: string;
  
  // Community Metrics
  is_approved: boolean;
  likes_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface PoseInteraction {
  id: string;
  pose_id: string;
  user_id: string;
  interaction_type: 'like' | 'save' | 'view' | 'share';
  created_at: string;
}

export interface PoseComment {
  id: string;
  pose_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

// Basic service functions for community poses
export const communityPoseService = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async getCommunityPoses(filters?: any) {
    const { data, error } = await supabase
      .from('community_poses')
      .select('*')
      .eq('is_approved', true);
    
    if (error) throw error;
    return data;
  },

  async createCommunityPose(pose: Partial<CommunityPose>) {
    const { data, error } = await supabase
      .from('community_poses')
      .insert(pose)
      .select();
    
    if (error) throw error;
    return data;
  },

  async likePose(poseId: string, userId: string) {
    const { data, error } = await supabase
      .from('pose_interactions')
      .insert({
        pose_id: poseId,
        user_id: userId,
        interaction_type: 'like'
      });
    
    if (error) throw error;
    return data;
  },

  async addComment(poseId: string, userId: string, commentText: string) {
    const { data, error } = await supabase
      .from('pose_comments')
      .insert({
        pose_id: poseId,
        user_id: userId,
        comment_text: commentText
      });
    
    if (error) throw error;
    return data;
  }
};