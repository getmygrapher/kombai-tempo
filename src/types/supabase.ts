export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      availability_analytics: {
        Row: {
          average_booking_duration: number | null
          booking_count: number | null
          created_at: string | null
          date: string
          id: string
          peak_hours: Json | null
          revenue_generated: number | null
          total_available_hours: number | null
          total_booked_hours: number | null
          user_id: string | null
          utilization_rate: number | null
        }
        Insert: {
          average_booking_duration?: number | null
          booking_count?: number | null
          created_at?: string | null
          date: string
          id?: string
          peak_hours?: Json | null
          revenue_generated?: number | null
          total_available_hours?: number | null
          total_booked_hours?: number | null
          user_id?: string | null
          utilization_rate?: number | null
        }
        Update: {
          average_booking_duration?: number | null
          booking_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          peak_hours?: Json | null
          revenue_generated?: number | null
          total_available_hours?: number | null
          total_booked_hours?: number | null
          user_id?: string | null
          utilization_rate?: number | null
        }
        Relationships: []
      }
      availability_settings: {
        Row: {
          advance_booking_limit: string | null
          calendar_visibility: string | null
          created_at: string | null
          default_schedule: Json | null
          lead_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advance_booking_limit?: string | null
          calendar_visibility?: string | null
          created_at?: string | null
          default_schedule?: Json | null
          lead_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advance_booking_limit?: string | null
          calendar_visibility?: string | null
          created_at?: string | null
          default_schedule?: Json | null
          lead_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      booking_conflicts: {
        Row: {
          affected_date: string
          affected_time_end: string
          affected_time_start: string
          conflict_type: string
          conflicting_booking_id: string | null
          created_at: string | null
          id: string
          primary_booking_id: string | null
          resolution_action: string | null
          resolution_status: string | null
          resolved_at: string | null
          user_id: string | null
        }
        Insert: {
          affected_date: string
          affected_time_end: string
          affected_time_start: string
          conflict_type: string
          conflicting_booking_id?: string | null
          created_at?: string | null
          id?: string
          primary_booking_id?: string | null
          resolution_action?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Update: {
          affected_date?: string
          affected_time_end?: string
          affected_time_start?: string
          conflict_type?: string
          conflicting_booking_id?: string | null
          created_at?: string | null
          id?: string
          primary_booking_id?: string | null
          resolution_action?: string | null
          resolution_status?: string | null
          resolved_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_references: {
        Row: {
          booking_date: string
          client_id: string | null
          client_name: string
          confirmed_at: string | null
          created_at: string | null
          end_time: string
          id: string
          job_id: string
          job_title: string
          start_time: string
          status: string
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_date: string
          client_id?: string | null
          client_name: string
          confirmed_at?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          job_id: string
          job_title: string
          start_time: string
          status: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          client_id?: string | null
          client_name?: string
          confirmed_at?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          job_id?: string
          job_title?: string
          start_time?: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_entries: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          recurring_pattern_id: string | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurring_pattern_id?: string | null
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurring_pattern_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_recurring_pattern"
            columns: ["recurring_pattern_id"]
            isOneToOne: false
            referencedRelation: "recurring_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_operations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_url: string | null
          format: string | null
          id: string
          metadata: Json | null
          operation_type: string
          records_count: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          operation_type: string
          records_count?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_url?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          records_count?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      calendar_privacy_settings: {
        Row: {
          advance_booking_days: number | null
          allow_booking_requests: boolean | null
          allowed_users: string[] | null
          auto_decline_conflicts: boolean | null
          created_at: string | null
          hidden_dates: string[] | null
          is_visible: boolean | null
          lead_time_hours: number | null
          notification_preferences: Json | null
          show_partial_availability: boolean | null
          updated_at: string | null
          user_id: string
          visibility_level: string | null
        }
        Insert: {
          advance_booking_days?: number | null
          allow_booking_requests?: boolean | null
          allowed_users?: string[] | null
          auto_decline_conflicts?: boolean | null
          created_at?: string | null
          hidden_dates?: string[] | null
          is_visible?: boolean | null
          lead_time_hours?: number | null
          notification_preferences?: Json | null
          show_partial_availability?: boolean | null
          updated_at?: string | null
          user_id: string
          visibility_level?: string | null
        }
        Update: {
          advance_booking_days?: number | null
          allow_booking_requests?: boolean | null
          allowed_users?: string[] | null
          auto_decline_conflicts?: boolean | null
          created_at?: string | null
          hidden_dates?: string[] | null
          is_visible?: boolean | null
          lead_time_hours?: number | null
          notification_preferences?: Json | null
          show_partial_availability?: boolean | null
          updated_at?: string | null
          user_id?: string
          visibility_level?: string | null
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          added_at: string | null
          collection_id: string
          pose_id: string
        }
        Insert: {
          added_at?: string | null
          collection_id: string
          pose_id: string
        }
        Update: {
          added_at?: string | null
          collection_id?: string
          pose_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "pose_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "community_poses"
            referencedColumns: ["id"]
          },
        ]
      }
      community_poses: {
        Row: {
          category: string
          comments_count: number | null
          created_at: string | null
          difficulty_level: string
          id: string
          image_url: string
          is_approved: boolean | null
          lighting_setup: string | null
          likes_count: number | null
          location_type: string | null
          medium_url: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_feedback: string | null
          moderation_status: string | null
          mood_emotion: string | null
          people_count: number | null
          photographer_id: string
          portfolio_image_id: string | null
          posing_tips: string
          saves_count: number | null
          shares_count: number | null
          story_behind: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          category: string
          comments_count?: number | null
          created_at?: string | null
          difficulty_level: string
          id?: string
          image_url: string
          is_approved?: boolean | null
          lighting_setup?: string | null
          likes_count?: number | null
          location_type?: string | null
          medium_url?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_feedback?: string | null
          moderation_status?: string | null
          mood_emotion?: string | null
          people_count?: number | null
          photographer_id: string
          portfolio_image_id?: string | null
          posing_tips: string
          saves_count?: number | null
          shares_count?: number | null
          story_behind?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          category?: string
          comments_count?: number | null
          created_at?: string | null
          difficulty_level?: string
          id?: string
          image_url?: string
          is_approved?: boolean | null
          lighting_setup?: string | null
          likes_count?: number | null
          location_type?: string | null
          medium_url?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_feedback?: string | null
          moderation_status?: string | null
          mood_emotion?: string | null
          people_count?: number | null
          photographer_id?: string
          portfolio_image_id?: string | null
          posing_tips?: string
          saves_count?: number | null
          shares_count?: number | null
          story_behind?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          contact_method: string | null
          contact_shared: boolean | null
          contact_shared_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          job_id: string | null
          professional_id: string | null
          request_message: string | null
          requester_id: string | null
          responded_at: string | null
          response_message: string | null
          status: string | null
        }
        Insert: {
          contact_method?: string | null
          contact_shared?: boolean | null
          contact_shared_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          professional_id?: string | null
          request_message?: string | null
          requester_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
        }
        Update: {
          contact_method?: string | null
          contact_shared?: boolean | null
          contact_shared_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          job_id?: string | null
          professional_id?: string | null
          request_message?: string | null
          requester_id?: string | null
          responded_at?: string | null
          response_message?: string | null
          status?: string | null
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_id: string
          applied_at: string | null
          currency: string | null
          id: string
          job_id: string
          message: string | null
          proposed_rate: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          applied_at?: string | null
          currency?: string | null
          id?: string
          job_id: string
          message?: string | null
          proposed_rate?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          applied_at?: string | null
          currency?: string | null
          id?: string
          job_id?: string
          message?: string | null
          proposed_rate?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          subcategories: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          subcategories?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          subcategories?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      job_saves: {
        Row: {
          job_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          job_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          job_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_saves_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_views: {
        Row: {
          id: string
          job_id: string
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          id?: string
          job_id: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          id?: string
          job_id?: string
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          approved: boolean | null
          budget_currency: string | null
          budget_is_negotiable: boolean | null
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          end_date: string | null
          expires_at: string | null
          id: string
          location_address: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          location_pin_code: string | null
          location_state: string | null
          professional_types: string[] | null
          status: string | null
          time_slots: Json | null
          title: string
          updated_at: string | null
          urgency: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          approved?: boolean | null
          budget_currency?: string | null
          budget_is_negotiable?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          end_date?: string | null
          expires_at?: string | null
          id?: string
          location_address?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_pin_code?: string | null
          location_state?: string | null
          professional_types?: string[] | null
          status?: string | null
          time_slots?: Json | null
          title: string
          updated_at?: string | null
          urgency?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          approved?: boolean | null
          budget_currency?: string | null
          budget_is_negotiable?: boolean | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          end_date?: string | null
          expires_at?: string | null
          id?: string
          location_address?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_pin_code?: string | null
          location_state?: string | null
          professional_types?: string[] | null
          status?: string | null
          time_slots?: Json | null
          title?: string
          updated_at?: string | null
          urgency?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_steps: string[] | null
          created_at: string | null
          current_step: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          camera_model: string | null
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          exif_data: Json | null
          id: string
          image_url: string
          is_featured: boolean | null
          is_visible: boolean | null
          lens_model: string | null
          likes_count: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string | null
          views_count: number | null
        }
        Insert: {
          camera_model?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          exif_data?: Json | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          lens_model?: string | null
          likes_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Update: {
          camera_model?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          exif_data?: Json | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          is_visible?: boolean | null
          lens_model?: string | null
          likes_count?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      pose_camera_data: {
        Row: {
          aperture: number | null
          camera_model: string | null
          created_at: string | null
          exif_extraction_success: boolean | null
          flash_used: boolean | null
          focal_length: number | null
          id: string
          iso_setting: number | null
          lens_model: string | null
          manual_override: boolean | null
          pose_id: string
          raw_exif_data: Json | null
          shutter_speed: string | null
        }
        Insert: {
          aperture?: number | null
          camera_model?: string | null
          created_at?: string | null
          exif_extraction_success?: boolean | null
          flash_used?: boolean | null
          focal_length?: number | null
          id?: string
          iso_setting?: number | null
          lens_model?: string | null
          manual_override?: boolean | null
          pose_id: string
          raw_exif_data?: Json | null
          shutter_speed?: string | null
        }
        Update: {
          aperture?: number | null
          camera_model?: string | null
          created_at?: string | null
          exif_extraction_success?: boolean | null
          flash_used?: boolean | null
          focal_length?: number | null
          id?: string
          iso_setting?: number | null
          lens_model?: string | null
          manual_override?: boolean | null
          pose_id?: string
          raw_exif_data?: Json | null
          shutter_speed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pose_camera_data_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "community_poses"
            referencedColumns: ["id"]
          },
        ]
      }
      pose_collections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pose_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          id: string
          is_flagged: boolean | null
          pose_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          pose_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          pose_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pose_comments_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "community_poses"
            referencedColumns: ["id"]
          },
        ]
      }
      pose_equipment: {
        Row: {
          created_at: string | null
          equipment_name: string
          equipment_type: string | null
          id: string
          pose_id: string
        }
        Insert: {
          created_at?: string | null
          equipment_name: string
          equipment_type?: string | null
          id?: string
          pose_id: string
        }
        Update: {
          created_at?: string | null
          equipment_name?: string
          equipment_type?: string | null
          id?: string
          pose_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pose_equipment_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "community_poses"
            referencedColumns: ["id"]
          },
        ]
      }
      pose_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string
          pose_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type: string
          pose_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string
          pose_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pose_interactions_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "community_poses"
            referencedColumns: ["id"]
          },
        ]
      }
      pose_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          pose_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          pose_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          pose_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pose_reports_pose_id_fkey"
            columns: ["pose_id"]
            isOneToOne: false
            referencedRelation: "community_poses"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          additional_locations: Json | null
          city: string | null
          created_at: string | null
          equipment: Json | null
          experience_level: string | null
          instagram_handle: string | null
          pin_code: string | null
          portfolio_links: string[] | null
          pricing: Json | null
          selected_category: string | null
          selected_type: string | null
          specializations: string[] | null
          state: string | null
          updated_at: string | null
          user_id: string
          work_radius_km: number | null
        }
        Insert: {
          additional_locations?: Json | null
          city?: string | null
          created_at?: string | null
          equipment?: Json | null
          experience_level?: string | null
          instagram_handle?: string | null
          pin_code?: string | null
          portfolio_links?: string[] | null
          pricing?: Json | null
          selected_category?: string | null
          selected_type?: string | null
          specializations?: string[] | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          work_radius_km?: number | null
        }
        Update: {
          additional_locations?: Json | null
          city?: string | null
          created_at?: string | null
          equipment?: Json | null
          experience_level?: string | null
          instagram_handle?: string | null
          pin_code?: string | null
          portfolio_links?: string[] | null
          pricing?: Json | null
          selected_category?: string | null
          selected_type?: string | null
          specializations?: string[] | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          work_radius_km?: number | null
        }
        Relationships: []
      }
      profile_analytics: {
        Row: {
          average_rating: number | null
          average_response_time: number | null
          average_session_duration: number | null
          contact_requests_count: number | null
          conversion_rate: number | null
          created_at: string | null
          job_inquiries_count: number | null
          last_calculated_at: string | null
          professional_id: string
          profile_completion_percent: number | null
          profile_saves_count: number | null
          rating_distribution: Json | null
          response_rate: number | null
          total_reviews: number | null
          total_views: number | null
          trending_score: number | null
          unique_viewers: number | null
          updated_at: string | null
          views_this_month: number | null
          views_this_week: number | null
        }
        Insert: {
          average_rating?: number | null
          average_response_time?: number | null
          average_session_duration?: number | null
          contact_requests_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          job_inquiries_count?: number | null
          last_calculated_at?: string | null
          professional_id: string
          profile_completion_percent?: number | null
          profile_saves_count?: number | null
          rating_distribution?: Json | null
          response_rate?: number | null
          total_reviews?: number | null
          total_views?: number | null
          trending_score?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          views_this_month?: number | null
          views_this_week?: number | null
        }
        Update: {
          average_rating?: number | null
          average_response_time?: number | null
          average_session_duration?: number | null
          contact_requests_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          job_inquiries_count?: number | null
          last_calculated_at?: string | null
          professional_id?: string
          profile_completion_percent?: number | null
          profile_saves_count?: number | null
          rating_distribution?: Json | null
          response_rate?: number | null
          total_reviews?: number | null
          total_views?: number | null
          trending_score?: number | null
          unique_viewers?: number | null
          updated_at?: string | null
          views_this_month?: number | null
          views_this_week?: number | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          city: string | null
          country: string | null
          device_type: string | null
          id: string
          professional_id: string | null
          referrer_url: string | null
          session_duration: number | null
          session_id: string | null
          source: string | null
          state: string | null
          user_agent: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          professional_id?: string | null
          referrer_url?: string | null
          session_duration?: number | null
          session_id?: string | null
          source?: string | null
          state?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          professional_id?: string | null
          referrer_url?: string | null
          session_duration?: number | null
          session_id?: string | null
          source?: string | null
          state?: string | null
          user_agent?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          client_id: string | null
          communication_rating: number | null
          created_at: string | null
          flag_reason: string | null
          helpful_count: number | null
          id: string
          is_flagged: boolean | null
          is_verified: boolean | null
          is_visible: boolean | null
          job_id: string | null
          media_urls: string[] | null
          moderated_at: string | null
          moderator_id: string | null
          not_helpful_count: number | null
          professional_id: string | null
          professionalism_rating: number | null
          punctuality_rating: number | null
          quality_rating: number | null
          rating: number
          response_at: string | null
          response_text: string | null
          review_text: string | null
          review_title: string | null
          updated_at: string | null
          value_rating: number | null
          verified_job_completion: boolean | null
        }
        Insert: {
          client_id?: string | null
          communication_rating?: number | null
          created_at?: string | null
          flag_reason?: string | null
          helpful_count?: number | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          job_id?: string | null
          media_urls?: string[] | null
          moderated_at?: string | null
          moderator_id?: string | null
          not_helpful_count?: number | null
          professional_id?: string | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          rating: number
          response_at?: string | null
          response_text?: string | null
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          value_rating?: number | null
          verified_job_completion?: boolean | null
        }
        Update: {
          client_id?: string | null
          communication_rating?: number | null
          created_at?: string | null
          flag_reason?: string | null
          helpful_count?: number | null
          id?: string
          is_flagged?: boolean | null
          is_verified?: boolean | null
          is_visible?: boolean | null
          job_id?: string | null
          media_urls?: string[] | null
          moderated_at?: string | null
          moderator_id?: string | null
          not_helpful_count?: number | null
          professional_id?: string | null
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          rating?: number
          response_at?: string | null
          response_text?: string | null
          review_text?: string | null
          review_title?: string | null
          updated_at?: string | null
          value_rating?: number | null
          verified_job_completion?: boolean | null
        }
        Relationships: []
      }
      recurring_patterns: {
        Row: {
          created_at: string | null
          end_date: string | null
          exceptions: Json | null
          id: string
          is_active: boolean | null
          name: string
          pattern_type: string
          schedule: Json
          start_date: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          exceptions?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          pattern_type: string
          schedule: Json
          start_date: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          exceptions?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          pattern_type?: string
          schedule?: Json
          start_date?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      review_helpfulness: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_profiles: {
        Row: {
          collection_name: string | null
          id: string
          note: string | null
          professional_id: string | null
          saved_at: string | null
          user_id: string | null
        }
        Insert: {
          collection_name?: string | null
          id?: string
          note?: string | null
          professional_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Update: {
          collection_name?: string | null
          id?: string
          note?: string | null
          professional_id?: string | null
          saved_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          booking_reference: string | null
          calendar_entry_id: string | null
          client_name: string | null
          created_at: string | null
          end_time: string
          id: string
          is_booked: boolean | null
          job_id: string | null
          job_title: string | null
          notes: string | null
          rate_per_hour: number | null
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          booking_reference?: string | null
          calendar_entry_id?: string | null
          client_name?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          is_booked?: boolean | null
          job_id?: string | null
          job_title?: string | null
          notes?: string | null
          rate_per_hour?: number | null
          start_time: string
          status: string
          updated_at?: string | null
        }
        Update: {
          booking_reference?: string | null
          calendar_entry_id?: string | null
          client_name?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          is_booked?: boolean | null
          job_id?: string | null
          job_title?: string | null
          notes?: string | null
          rate_per_hour?: number | null
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_slots_calendar_entry_id_fkey"
            columns: ["calendar_entry_id"]
            isOneToOne: false
            referencedRelation: "calendar_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_status: {
        Row: {
          badge_earned_at: string | null
          created_at: string | null
          credential_document_url: string | null
          credential_type: string | null
          credential_verified_at: string | null
          email_verified: boolean | null
          email_verified_at: string | null
          id_document_type: string | null
          id_document_url: string | null
          id_verified_at: string | null
          identity_verified: boolean | null
          is_featured: boolean | null
          is_top_rated: boolean | null
          phone_verified: boolean | null
          phone_verified_at: string | null
          professional_verified: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_earned_at?: string | null
          created_at?: string | null
          credential_document_url?: string | null
          credential_type?: string | null
          credential_verified_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id_document_type?: string | null
          id_document_url?: string | null
          id_verified_at?: string | null
          identity_verified?: boolean | null
          is_featured?: boolean | null
          is_top_rated?: boolean | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          professional_verified?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_earned_at?: string | null
          created_at?: string | null
          credential_document_url?: string | null
          credential_type?: string | null
          credential_verified_at?: string | null
          email_verified?: boolean | null
          email_verified_at?: string | null
          id_document_type?: string | null
          id_document_url?: string | null
          id_verified_at?: string | null
          identity_verified?: boolean | null
          is_featured?: boolean | null
          is_top_rated?: boolean | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          professional_verified?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_portfolio_item: {
        Args: {
          category_param?: string
          description_param: string
          exif_data_param?: Json
          image_url_param: string
          tags_param?: string[]
          thumbnail_url_param?: string
          title_param: string
        }
        Returns: Json
      }
      add_pose_comment: {
        Args: { p_comment_text: string; p_pose_id: string }
        Returns: string
      }
      apply_recurring_pattern: {
        Args: { end_date: string; pattern_id: string; start_date: string }
        Returns: Json
      }
      apply_to_job: {
        Args: { application_data: Json; job_id: string }
        Returns: string
      }
      calculate_profile_completion: { Args: never; Returns: number }
      complete_onboarding_step: {
        Args: { step: string }
        Returns: {
          completed_steps: string[] | null
          created_at: string | null
          current_step: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "onboarding_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_contact_request: {
        Args: {
          contact_method_param?: string
          job_id_param?: string
          professional_id_param: string
          request_message_param?: string
        }
        Returns: Json
      }
      create_job: { Args: { job_data: Json }; Returns: string }
      detect_booking_conflicts: {
        Args: {
          booking_date: string
          end_time: string
          job_id?: string
          start_time: string
        }
        Returns: Json
      }
      ensure_profile_exists: {
        Args: never
        Returns: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      export_calendar_data: {
        Args: { end_date: string; format_type?: string; start_date: string }
        Returns: Json
      }
      get_availability_stats: {
        Args: { end_date: string; start_date: string }
        Returns: Json
      }
      get_availability_with_slots: {
        Args: { end_date: string; start_date: string }
        Returns: {
          date: string
          entry_id: string
          is_recurring: boolean
          notes: string
          status: string
          time_slots: Json
        }[]
      }
      get_community_poses: {
        Args: {
          p_categories?: string[]
          p_difficulty_levels?: string[]
          p_limit?: number
          p_location_types?: string[]
          p_offset?: number
          p_people_count?: number[]
          p_sort_by?: string
        }
        Returns: {
          aperture: number
          camera_model: string
          category: string
          comments_count: number
          created_at: string
          difficulty_level: string
          flash_used: boolean
          focal_length: number
          id: string
          image_url: string
          is_approved: boolean
          iso_setting: number
          lens_model: string
          lighting_setup: string
          likes_count: number
          location_type: string
          mood_emotion: string
          people_count: number
          photographer_id: string
          photographer_location: string
          photographer_name: string
          photographer_photo: string
          photographer_verified: boolean
          portfolio_image_id: string
          posing_tips: string
          saves_count: number
          shutter_speed: string
          story_behind: string
          title: string
          updated_at: string
          views_count: number
        }[]
      }
      get_job_applications: {
        Args: { job_id: string }
        Returns: {
          applicant_id: string
          applied_at: string | null
          currency: string | null
          id: string
          job_id: string
          message: string | null
          proposed_rate: number | null
          status: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "job_applications"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_moderation_queue: {
        Args: { p_limit?: number; p_status?: string }
        Returns: {
          created_at: string
          id: string
          image_url: string
          moderation_status: string
          photographer_id: string
          title: string
        }[]
      }
      get_my_jobs: {
        Args: { status_filter?: string }
        Returns: {
          approved: boolean | null
          budget_currency: string | null
          budget_is_negotiable: boolean | null
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          end_date: string | null
          expires_at: string | null
          id: string
          location_address: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          location_pin_code: string | null
          location_state: string | null
          professional_types: string[] | null
          status: string | null
          time_slots: Json | null
          title: string
          updated_at: string | null
          urgency: string | null
          user_id: string
          view_count: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_nearby_jobs: {
        Args: { filters?: Json; lat: number; lng: number; radius_km: number }
        Returns: {
          budget_currency: string
          budget_is_negotiable: boolean
          budget_max: number
          budget_min: number
          budget_type: string
          category: string
          created_at: string
          date: string
          description: string
          distance_km: number
          expires_at: string
          id: string
          location_address: string
          location_city: string
          location_lat: number
          location_lng: number
          location_pin_code: string
          location_state: string
          professional_types: string[]
          status: string
          time_slots: Json
          title: string
          updated_at: string
          urgency: string
          view_count: number
        }[]
      }
      get_onboarding_status: {
        Args: never
        Returns: {
          completed_steps: string[] | null
          created_at: string | null
          current_step: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "onboarding_progress"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_pose_comments: {
        Args: { p_limit?: number; p_offset?: number; p_pose_id: string }
        Returns: {
          comment_text: string
          created_at: string
          id: string
          pose_id: string
          user_id: string
          user_name: string
          user_photo: string
        }[]
      }
      get_pose_details: {
        Args: { p_pose_id: string }
        Returns: {
          aperture: number
          camera_model: string
          category: string
          comments_count: number
          created_at: string
          difficulty_level: string
          flash_used: boolean
          focal_length: number
          id: string
          image_url: string
          is_approved: boolean
          iso_setting: number
          lens_model: string
          lighting_setup: string
          likes_count: number
          location_type: string
          mood_emotion: string
          people_count: number
          photographer_id: string
          photographer_location: string
          photographer_name: string
          photographer_photo: string
          photographer_verified: boolean
          portfolio_image_id: string
          posing_tips: string
          saves_count: number
          shutter_speed: string
          story_behind: string
          title: string
          updated_at: string
          views_count: number
        }[]
      }
      get_professional_ratings: {
        Args: {
          limit_param?: number
          offset_param?: number
          professional_id_param: string
          sort_by?: string
        }
        Returns: {
          client_avatar: string
          client_name: string
          communication_rating: number
          created_at: string
          helpful_count: number
          id: string
          is_verified: boolean
          media_urls: string[]
          not_helpful_count: number
          professionalism_rating: number
          punctuality_rating: number
          quality_rating: number
          rating: number
          response_at: string
          response_text: string
          review_text: string
          review_title: string
          value_rating: number
        }[]
      }
      get_profile_analytics_data: {
        Args: { date_range_days?: number }
        Returns: Json
      }
      get_saved_profiles: {
        Args: {
          collection_name_param?: string
          limit_param?: number
          offset_param?: number
        }
        Returns: {
          average_rating: number
          city: string
          collection_name: string
          note: string
          professional_avatar: string
          professional_category: string
          professional_id: string
          professional_name: string
          professional_type: string
          saved_at: string
          state: string
          total_reviews: number
        }[]
      }
      get_user_contributions: {
        Args: { p_limit?: number; p_user_id?: string }
        Returns: {
          category: string
          comments_count: number
          created_at: string
          id: string
          image_url: string
          is_approved: boolean
          likes_count: number
          title: string
        }[]
      }
      get_user_saved_poses: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          category: string
          difficulty_level: string
          id: string
          image_url: string
          likes_count: number
          saved_at: string
          title: string
        }[]
      }
      haversine_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      initialize_calendar_privacy: {
        Args: never
        Returns: {
          advance_booking_days: number | null
          allow_booking_requests: boolean | null
          allowed_users: string[] | null
          auto_decline_conflicts: boolean | null
          created_at: string | null
          hidden_dates: string[] | null
          is_visible: boolean | null
          lead_time_hours: number | null
          notification_preferences: Json | null
          show_partial_availability: boolean | null
          updated_at: string | null
          user_id: string
          visibility_level: string | null
        }
        SetofOptions: {
          from: "*"
          to: "calendar_privacy_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      initialize_profile_analytics: { Args: never; Returns: undefined }
      initialize_verification_status: { Args: never; Returns: undefined }
      mark_review_helpful: {
        Args: { is_helpful_param: boolean; review_id_param: string }
        Returns: Json
      }
      moderate_pose: {
        Args: { p_action: string; p_feedback?: string; p_pose_id: string }
        Returns: undefined
      }
      reorder_portfolio_items: {
        Args: { item_ids_ordered: string[] }
        Returns: Json
      }
      respond_to_contact_request: {
        Args: {
          request_id_param: string
          response_message_param?: string
          status_param: string
        }
        Returns: Json
      }
      respond_to_rating: {
        Args: { rating_id_param: string; response_text_param: string }
        Returns: Json
      }
      search_community_poses: {
        Args: { p_limit?: number; p_search_query: string }
        Returns: {
          category: string
          created_at: string
          difficulty_level: string
          id: string
          image_url: string
          likes_count: number
          photographer_id: string
          photographer_name: string
          posing_tips: string
          title: string
          views_count: number
        }[]
      }
      search_jobs: {
        Args: { filters?: Json; query: string }
        Returns: {
          budget_currency: string
          budget_is_negotiable: boolean
          budget_max: number
          budget_min: number
          budget_type: string
          category: string
          created_at: string
          date: string
          description: string
          expires_at: string
          id: string
          location_address: string
          location_city: string
          location_lat: number
          location_lng: number
          location_pin_code: string
          location_state: string
          professional_types: string[]
          status: string
          time_slots: Json
          title: string
          updated_at: string
          urgency: string
          view_count: number
        }[]
      }
      set_availability_bulk: {
        Args: { availability_data: Json }
        Returns: Json
      }
      submit_community_pose: {
        Args: {
          p_camera_data?: Json
          p_category: string
          p_difficulty_level: string
          p_equipment?: Json
          p_image_url: string
          p_lighting_setup?: string
          p_location_type?: string
          p_medium_url?: string
          p_mood_emotion?: string
          p_people_count: number
          p_posing_tips: string
          p_story_behind?: string
          p_thumbnail_url?: string
          p_title: string
        }
        Returns: string
      }
      submit_rating: {
        Args: {
          communication_rating_param?: number
          job_id_param: string
          media_urls_param?: string[]
          professional_id_param: string
          professionalism_rating_param?: number
          punctuality_rating_param?: number
          quality_rating_param?: number
          rating_param: number
          review_text_param: string
          review_title_param: string
          value_rating_param?: number
        }
        Returns: Json
      }
      toggle_pose_interaction: {
        Args: { p_interaction_type: string; p_pose_id: string }
        Returns: undefined
      }
      toggle_save_profile: {
        Args: {
          collection_name_param?: string
          note_param?: string
          professional_id_param: string
        }
        Returns: Json
      }
      track_pose_view: { Args: { p_pose_id: string }; Returns: undefined }
      track_profile_view_event: {
        Args: {
          device_type_param?: string
          professional_id_param: string
          referrer_url_param?: string
          session_id_param?: string
          source_param?: string
        }
        Returns: Json
      }
      update_application_status: {
        Args: { application_id: string; new_status: string }
        Returns: boolean
      }
      update_booking_status: {
        Args: { booking_data?: Json; booking_id: string; new_status: string }
        Returns: Json
      }
      update_job: { Args: { job_data: Json; job_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
