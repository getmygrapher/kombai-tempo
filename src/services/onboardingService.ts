import { supabase } from './supabaseClient';

export type BasicProfile = {
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
};

export type LocationData = {
  city?: string;
  state?: string;
  pinCode?: string;
  workRadiusKm?: number;
  coordinates?: { lat: number; lng: number } | null;
  additionalLocations?: Array<{ city?: string; state?: string; pinCode?: string }>;
};

export type ProfessionalDetails = {
  selectedCategory?: string;
  selectedType?: string;
  experienceLevel?: string;
  specializations?: string[];
  pricing?: Record<string, any>;
  equipment?: Record<string, any>;
  instagramHandle?: string;
  portfolioLinks?: string[];
};

export type AvailabilitySettings = {
  defaultSchedule?: Record<string, any>;
  leadTime?: string;
  advanceBookingLimit?: string;
  calendarVisibility?: string;
};

function mapError(error: any): Error {
  if (!error) return new Error('Unknown error');
  const message = error.message || error.error_description || 'Unexpected error';
  return new Error(message);
}

export const onboardingService = {
  async getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw mapError(error);
    const uid = data.user?.id;
    if (!uid) throw new Error('No authenticated user');
    return uid;
  },

  async ensureProfileExists(): Promise<void> {
    try {
      const uid = await this.getCurrentUserId();
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', uid)
        .single();
      
      // If profile doesn't exist, create it
      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({ id: uid });
        
        if (error && error.code !== '23505') { // Ignore duplicate key errors
          throw mapError(error);
        }
      }
    } catch (error) {
      // If it's not a "no user" error, log but don't throw
      if (error instanceof Error && !error.message.includes('No authenticated user')) {
        console.warn('ensureProfileExists warning:', error);
      } else {
        throw error;
      }
    }
  },

  async upsertBasicProfile(profile: BasicProfile): Promise<void> {
    const uid = await this.getCurrentUserId();
    const payload: any = { id: uid };
    if (profile.fullName !== undefined) payload.full_name = profile.fullName;
    if (profile.avatarUrl !== undefined) payload.avatar_url = profile.avatarUrl;
    if (profile.phone !== undefined) payload.phone = profile.phone;
    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw mapError(error);
  },

  async upsertProfessionalProfile(details: ProfessionalDetails): Promise<void> {
    const uid = await this.getCurrentUserId();
    const payload: any = { user_id: uid };
    if (details.selectedCategory !== undefined) payload.selected_category = details.selectedCategory;
    if (details.selectedType !== undefined) payload.selected_type = details.selectedType;
    if (details.experienceLevel !== undefined) payload.experience_level = details.experienceLevel;
    if (details.specializations !== undefined) payload.specializations = details.specializations;
    if (details.pricing !== undefined) payload.pricing = details.pricing;
    if (details.equipment !== undefined) payload.equipment = details.equipment;
    if (details.instagramHandle !== undefined) payload.instagram_handle = details.instagramHandle;
    if (details.portfolioLinks !== undefined) payload.portfolio_links = details.portfolioLinks;
    const { error } = await supabase
      .from('professional_profiles')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) throw mapError(error);
  },

  async upsertLocation(location: LocationData): Promise<void> {
    const uid = await this.getCurrentUserId();
    const payload: any = { user_id: uid };
    if (location.city !== undefined) payload.city = location.city;
    if (location.state !== undefined) payload.state = location.state;
    if (location.pinCode !== undefined) payload.pin_code = location.pinCode;
    if (location.workRadiusKm !== undefined) payload.work_radius_km = location.workRadiusKm;
    if (location.additionalLocations !== undefined) payload.additional_locations = location.additionalLocations || [];
    // coordinates could be stored if you plan a separate table or PostGIS; omitted here
    const { error } = await supabase
      .from('professional_profiles')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) throw mapError(error);
  },

  async upsertAvailability(settings: AvailabilitySettings): Promise<void> {
    const uid = await this.getCurrentUserId();
    const payload: any = { user_id: uid };
    if (settings.defaultSchedule !== undefined) payload.default_schedule = settings.defaultSchedule;
    if (settings.leadTime !== undefined) payload.lead_time = settings.leadTime;
    if (settings.advanceBookingLimit !== undefined) payload.advance_booking_limit = settings.advanceBookingLimit;
    if (settings.calendarVisibility !== undefined) payload.calendar_visibility = settings.calendarVisibility;
    const { error } = await supabase
      .from('availability_settings')
      .upsert(payload, { onConflict: 'user_id' });
    if (error) throw mapError(error);
  },

  async completeStep(step: string): Promise<void> {
    try {
      const uid = await this.getCurrentUserId();
      
      // Get current onboarding status
      const { data: existingStatus } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', uid)
        .single();
      
      const completedSteps = existingStatus?.completed_steps || [];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      
      // Update onboarding status
      const { error } = await supabase
        .from('onboarding_status')
        .upsert({
          user_id: uid,
          current_step: step,
          completed_steps: completedSteps,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error) throw mapError(error);
    } catch (error) {
      console.warn('completeStep warning:', error);
    }
  },

  async getStatus(): Promise<{
    current_step?: string;
    completed_steps?: string[];
    status?: string;
  } | null> {
    try {
      const uid = await this.getCurrentUserId();
      
      const { data, error } = await supabase
        .from('onboarding_status')
        .select('*')
        .eq('user_id', uid)
        .single();
      
      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        throw mapError(error);
      }
      
      return data ? {
        current_step: data.current_step,
        completed_steps: data.completed_steps || [],
        status: data.status
      } : null;
    } catch (error) {
      console.warn('getStatus warning:', error);
      return null;
    }
  },
};