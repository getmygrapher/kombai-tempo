import { User } from '../../types';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

export interface SessionData {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

class SessionManager {
  private readonly ACCESS_TOKEN_KEY = 'gmg_access_token';
  private readonly REFRESH_TOKEN_KEY = 'gmg_refresh_token';
  private readonly USER_DATA_KEY = 'gmg_user_data';
  private readonly EXPIRES_AT_KEY = 'gmg_expires_at';

  /**
   * Store session data securely
   */
  storeSession(sessionData: SessionData): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, sessionData.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, sessionData.refreshToken);
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(sessionData.user));
      localStorage.setItem(this.EXPIRES_AT_KEY, sessionData.expiresAt.toString());
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Get current session data
   */
  getSession(): SessionData | null {
    try {
      // Prefer Supabase session if available
      // Note: expires_at is in seconds; convert to ms
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      return null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Check if current session is valid
   */
  isSessionValid(): boolean {
    // Check Supabase session first
    // Synchronously approximate validity via local storage fallback
    const sbSessionStr = localStorage.getItem('supabase.auth.token');
    if (sbSessionStr) {
      try {
        const parsed = JSON.parse(sbSessionStr);
        const expiresAtSec = parsed?.currentSession?.expires_at;
        if (expiresAtSec) {
          return Date.now() < expiresAtSec * 1000;
        }
      } catch {
        // Ignore parsing errors and fall back to session check
      }
    }

    const session = this.getSession();
    if (!session) return false;
    const now = Date.now();
    return now < session.expiresAt;
  }

  /**
   * Check if token needs refresh (within 5 minutes of expiry)
   */
  needsRefresh(): boolean {
    const session = this.getSession();
    if (!session) return false;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    return now > (session.expiresAt - fiveMinutes);
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<string | null> {
    const session = this.getSession();
    if (!session) return null;
    try {
      // Attempt Supabase refresh if possible
      const sb = await supabase.auth.getSession();
      const refreshToken = sb.data.session?.refresh_token;
      if (refreshToken) {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (error) throw error;
        const newAccessToken = data.session?.access_token || null;
        const expiresAtSec = data.session?.expires_at || 0;
        if (newAccessToken) {
          localStorage.setItem(this.ACCESS_TOKEN_KEY, newAccessToken);
          localStorage.setItem(this.EXPIRES_AT_KEY, String(expiresAtSec * 1000));
        }
        return newAccessToken;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    if (!this.isSessionValid()) {
      return null;
    }

    if (this.needsRefresh()) {
      return await this.refreshToken();
    }

    const session = this.getSession();
    return session?.accessToken || null;
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_DATA_KEY);
      localStorage.removeItem(this.EXPIRES_AT_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Sign out and clear session
   */
  async signOut(): Promise<void> {
    try {
      // In a real implementation, this would call sign-out API
      await new Promise(resolve => setTimeout(resolve, 500));
      this.clearSession();
    } catch (error) {
      console.error('Sign out failed:', error);
      // Clear session anyway
      this.clearSession();
    }
  }
}

export const sessionManager = new SessionManager();