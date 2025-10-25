import { OnboardingStep } from '../types/onboarding';
import { ProfessionalCategory } from '../types/enums';

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
}

export interface OnboardingAnalytics {
  sessionId: string;
  startTime: number;
  events: AnalyticsEvent[];
}

class AnalyticsService {
  private sessionId: string;
  private startTime: number;
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.startTime = Date.now();
  }

  /**
   * Track generic event
   */
  private track(event: string, properties: Record<string, any> = {}): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };

    this.events.push(analyticsEvent);
    
    // In a real implementation, this would send to analytics service
    console.log('Analytics Event:', analyticsEvent);
  }

  /**
   * Track onboarding step viewed
   */
  trackStepViewed(step: OnboardingStep, metadata?: Record<string, any>): void {
    this.track('onboarding_step_viewed', {
      step,
      stepIndex: this.getStepIndex(step),
      ...metadata
    });
  }

  /**
   * Track onboarding step completed
   */
  trackStepCompleted(step: OnboardingStep, data?: Record<string, any>): void {
    this.track('onboarding_step_completed', {
      step,
      stepIndex: this.getStepIndex(step),
      completionTime: Date.now() - this.startTime,
      ...data
    });
  }

  /**
   * Track validation error
   */
  trackValidationError(step: OnboardingStep, field: string, error: string): void {
    this.track('onboarding_validation_error', {
      step,
      field,
      error,
      stepIndex: this.getStepIndex(step)
    });
  }

  /**
   * Track draft resumed
   */
  trackDraftResumed(resumedStep: OnboardingStep, lastCompletedStep: OnboardingStep): void {
    this.track('onboarding_draft_resumed', {
      resumedStep,
      lastCompletedStep,
      resumedStepIndex: this.getStepIndex(resumedStep),
      lastCompletedStepIndex: this.getStepIndex(lastCompletedStep)
    });
  }

  /**
   * Track registration completed
   */
  trackRegistrationCompleted(userData: {
    category: ProfessionalCategory;
    type: string;
    location: { city: string; state: string };
    hasProfilePhoto: boolean;
  }): void {
    this.track('onboarding_registration_completed', {
      ...userData,
      totalTime: Date.now() - this.startTime,
      totalSteps: this.events.filter(e => e.event === 'onboarding_step_completed').length,
      totalErrors: this.events.filter(e => e.event === 'onboarding_validation_error').length
    });
  }

  /**
   * Track authentication method used
   */
  trackAuthMethod(method: 'google' | 'email'): void {
    this.track('onboarding_auth_method', {
      method
    });
  }

  /**
   * Track location permission response
   */
  trackLocationPermission(granted: boolean, method: 'gps' | 'manual'): void {
    this.track('onboarding_location_permission', {
      granted,
      method
    });
  }

  /**
   * Track photo upload
   */
  trackPhotoUpload(success: boolean, fileSize?: number, error?: string): void {
    this.track('onboarding_photo_upload', {
      success,
      fileSize,
      error
    });
  }

  /**
   * Track category selection
   */
  trackCategorySelected(category: ProfessionalCategory): void {
    this.track('onboarding_category_selected', {
      category
    });
  }

  /**
   * Track professional type selection
   */
  trackTypeSelected(category: ProfessionalCategory, type: string): void {
    this.track('onboarding_type_selected', {
      category,
      type
    });
  }

  /**
   * Track step navigation (back/next)
   */
  trackStepNavigation(from: OnboardingStep, to: OnboardingStep, direction: 'next' | 'back'): void {
    this.track('onboarding_step_navigation', {
      from,
      to,
      direction,
      fromIndex: this.getStepIndex(from),
      toIndex: this.getStepIndex(to)
    });
  }

  /**
   * Track onboarding exit
   */
  trackOnboardingExit(currentStep: OnboardingStep, reason: 'user_exit' | 'error' | 'timeout'): void {
    this.track('onboarding_exit', {
      currentStep,
      reason,
      stepIndex: this.getStepIndex(currentStep),
      timeSpent: Date.now() - this.startTime,
      completedSteps: this.events.filter(e => e.event === 'onboarding_step_completed').length
    });
  }

  /**
   * Get step index for analytics
   */
  private getStepIndex(step: OnboardingStep): number {
    const stepOrder = [
      OnboardingStep.WELCOME,
      OnboardingStep.AUTHENTICATION,
      OnboardingStep.CATEGORY_SELECTION,
      OnboardingStep.TYPE_SELECTION,
      OnboardingStep.LOCATION_SETUP,
      OnboardingStep.BASIC_PROFILE,
      OnboardingStep.PROFESSIONAL_DETAILS,
      OnboardingStep.AVAILABILITY_SETUP,
      OnboardingStep.REGISTRATION_COMPLETE
    ];
    
    return stepOrder.indexOf(step);
  }

  /**
   * Get analytics summary
   */
  getAnalyticsSummary(): OnboardingAnalytics {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      events: [...this.events]
    };
  }

  /**
   * Reset analytics session
   */
  resetSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    this.startTime = Date.now();
    this.events = [];
  }

  // Profile View Analytics Events
  
  /**
   * Track profile viewed
   */
  trackProfileViewed(profileId: string, source: string = 'direct'): void {
    this.track('profile_viewed', {
      profileId,
      source,
      timestamp: Date.now()
    });
  }

  /**
   * Track profile tab viewed
   */
  trackProfileTabViewed(profileId: string, tabName: string, source: string = 'tab_click'): void {
    this.track('profile_tab_viewed', {
      profileId,
      tabName,
      source,
      timestamp: Date.now()
    });
  }

  /**
   * Track contact action clicked
   */
  trackContactActionClicked(profileId: string, method: string, source: string = 'profile_view'): void {
    this.track('contact_action_clicked', {
      profileId,
      method,
      source,
      timestamp: Date.now()
    });
  }

  /**
   * Track booking CTA clicked
   */
  trackBookingCtaClicked(profileId: string, source: string = 'profile_view'): void {
    this.track('booking_cta_clicked', {
      profileId,
      source,
      timestamp: Date.now()
    });
  }

  /**
   * Track share clicked
   */
  trackShareClicked(profileId: string, method: string = 'modal', source: string = 'profile_view'): void {
    this.track('share_clicked', {
      profileId,
      method,
      source,
      timestamp: Date.now()
    });
  }

  /**
   * Track report clicked
   */
  trackReportClicked(profileId: string, reason: string, source: string = 'profile_view'): void {
    this.track('report_clicked', {
      profileId,
      reason,
      source,
      timestamp: Date.now()
    });
  }
}

// Debounced analytics to prevent duplicate events
class DebouncedAnalytics {
  private recentEvents = new Map<string, number>();
  private debounceTime = 1000; // 1 second

  private shouldTrack(eventKey: string): boolean {
    const now = Date.now();
    const lastTracked = this.recentEvents.get(eventKey);
    
    if (!lastTracked || (now - lastTracked) > this.debounceTime) {
      this.recentEvents.set(eventKey, now);
      return true;
    }
    
    return false;
  }

  trackProfileViewed(profileId: string, source: string = 'direct'): void {
    const eventKey = `profile_viewed_${profileId}`;
    if (this.shouldTrack(eventKey)) {
      analyticsService.trackProfileViewed(profileId, source);
    }
  }

  trackProfileTabViewed(profileId: string, tabName: string, source: string = 'tab_click'): void {
    const eventKey = `profile_tab_viewed_${profileId}_${tabName}`;
    if (this.shouldTrack(eventKey)) {
      analyticsService.trackProfileTabViewed(profileId, tabName, source);
    }
  }
}

// Export singleton instances
export const analyticsService = new AnalyticsService();
export const debouncedAnalytics = new DebouncedAnalytics();