import { supabase } from '../supabaseClient';
import { User as SupabaseUser, AuthError, Session } from '@supabase/supabase-js';
import { User } from '../../types';

// Map Supabase user to app User type (minimal fields used across app)
const mapUser = (sbUser: SupabaseUser): User => {
  return {
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || '',
    email: sbUser.email || '',
    phone: sbUser.phone || '',
    profilePhoto: sbUser.user_metadata?.avatar_url || '',
    professionalCategory: 'Photography' as any,
    professionalType: 'Portrait Photographer',
    location: {
      city: '',
      state: '',
      coordinates: { lat: 0, lng: 0 },
    },
    tier: 'Free' as any,
    rating: 0,
    totalReviews: 0,
    isVerified: !!sbUser.email_confirmed_at,
    joinedDate: sbUser.created_at,
  };
};

export const supabaseAuth = {
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth',
      },
    });
    if (error) throw error;
    return data;
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth',
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async requestPasswordReset(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth',
    });
    if (error) throw error;
    return data;
  },

  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  mapUserFromSession(session: Session | null): User | null {
    const sbUser = session?.user ?? null;
    return sbUser ? mapUser(sbUser) : null;
  },
};