import { create } from 'zustand';
import { OnboardingStep, RegistrationStatus, LocationPermission } from '../types/onboarding';
import { ProfessionalCategory, ExperienceLevel, PricingType, Gender, DistanceRadius } from '../types/enums';

interface RegistrationData {
  authMethod: 'google' | 'email';
  email: string;
  isEmailVerified: boolean;
  selectedCategory: ProfessionalCategory | null;
  selectedType: string;
  location: {
    coordinates: { lat: number; lng: number } | null;
    city: string;
    state: string;
    pinCode: string;
    address: string;
    workRadius: DistanceRadius;
    additionalLocations: string[];
  };
  basicProfile: {
    fullName: string;
    profilePhoto: File | null;
    profilePhotoUrl: string;
    primaryMobile: string;
    alternateMobile: string;
    gender: Gender | null;
    about: string;
  };
  professionalDetails: {
    experienceLevel: ExperienceLevel | null;
    specializations: string[];
    pricing: {
      type: PricingType | null;
      rate: number;
      isNegotiable: boolean;
    };
    equipment: {
      cameras: string[];
      lenses: string[];
      lighting: string[];
      other: string[];
    };
    instagramHandle: string;
    portfolioLinks: string[];
  };
  availability: {
    defaultSchedule: Record<string, { available: boolean; startTime: string; endTime: string }>;
    leadTime: string;
    advanceBookingLimit: string;
    calendarVisibility: string;
  };
}

interface OnboardingStore {
  // State
  currentStep: OnboardingStep;
  registrationStatus: RegistrationStatus;
  completedSteps: OnboardingStep[];
  registrationData: RegistrationData;
  validationErrors: Record<string, string>;
  isLoading: boolean;
  locationPermission: LocationPermission;
  uploadProgress: number;
  lastCompletedStep: OnboardingStep | null;
  isDraftSaved: boolean;

  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  setRegistrationStatus: (status: RegistrationStatus) => void;
  addCompletedStep: (step: OnboardingStep) => void;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  clearValidationError: (field: string) => void;
  setIsLoading: (loading: boolean) => void;
  setLocationPermission: (permission: LocationPermission) => void;
  setUploadProgress: (progress: number) => void;
  resetRegistration: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  canProceed: (step: OnboardingStep) => boolean;
  saveDraft: () => void;
  loadDraft: () => boolean;
  clearDraft: () => void;
  getNextIncompleteStep: () => OnboardingStep;
}

const initialRegistrationData: RegistrationData = {
  authMethod: 'google',
  email: '',
  isEmailVerified: false,
  selectedCategory: null,
  selectedType: '',
  location: {
    coordinates: null,
    city: '',
    state: '',
    pinCode: '',
    address: '',
    workRadius: DistanceRadius.TWENTY_FIVE_KM,
    additionalLocations: []
  },
  basicProfile: {
    fullName: '',
    profilePhoto: null,
    profilePhotoUrl: '',
    primaryMobile: '',
    alternateMobile: '',
    gender: null,
    about: ''
  },
  professionalDetails: {
    experienceLevel: null,
    specializations: [],
    pricing: {
      type: null,
      rate: 0,
      isNegotiable: false
    },
    equipment: {
      cameras: [],
      lenses: [],
      lighting: [],
      other: []
    },
    instagramHandle: '',
    portfolioLinks: []
  },
  availability: {
    defaultSchedule: {
      monday: { available: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00' },
      friday: { available: true, startTime: '09:00', endTime: '17:00' },
      saturday: { available: false, startTime: '09:00', endTime: '17:00' },
      sunday: { available: false, startTime: '09:00', endTime: '17:00' }
    },
    leadTime: '24',
    advanceBookingLimit: '90',
    calendarVisibility: 'public'
  }
};

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

const DRAFT_STORAGE_KEY = 'gmg_onboarding_draft';

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  // Initial state
  currentStep: OnboardingStep.WELCOME,
  registrationStatus: RegistrationStatus.NOT_STARTED,
  completedSteps: [],
  registrationData: initialRegistrationData,
  validationErrors: {},
  isLoading: false,
  locationPermission: LocationPermission.PROMPT,
  uploadProgress: 0,
  lastCompletedStep: null,
  isDraftSaved: false,

  // Actions
  setCurrentStep: (step) => {
    set({ currentStep: step });
    get().saveDraft();
  },
  
  setRegistrationStatus: (status) => set({ registrationStatus: status }),
  
  addCompletedStep: (step) => set((state) => {
    const newCompletedSteps = state.completedSteps.includes(step) 
      ? state.completedSteps 
      : [...state.completedSteps, step];
    
    const newState = {
      completedSteps: newCompletedSteps,
      lastCompletedStep: step
    };
    
    // Auto-save draft
    setTimeout(() => get().saveDraft(), 100);
    
    return newState;
  }),
  
  updateRegistrationData: (data) => {
    set((state) => ({
      registrationData: { ...state.registrationData, ...data }
    }));
    // Auto-save draft
    setTimeout(() => get().saveDraft(), 100);
  },
  
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  
  clearValidationError: (field) => set((state) => {
    const newErrors = { ...state.validationErrors };
    delete newErrors[field];
    return { validationErrors: newErrors };
  }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  setLocationPermission: (permission) => set({ locationPermission: permission }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  resetRegistration: () => {
    get().clearDraft();
    set({
      currentStep: OnboardingStep.WELCOME,
      registrationStatus: RegistrationStatus.NOT_STARTED,
      completedSteps: [],
      registrationData: initialRegistrationData,
      validationErrors: {},
      isLoading: false,
      locationPermission: LocationPermission.PROMPT,
      uploadProgress: 0,
      lastCompletedStep: null,
      isDraftSaved: false
    });
  },
  
  goToNextStep: () => set((state) => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    const nextIndex = Math.min(currentIndex + 1, stepOrder.length - 1);
    const nextStep = stepOrder[nextIndex];
    
    // Auto-save draft
    setTimeout(() => get().saveDraft(), 100);
    
    return { currentStep: nextStep };
  }),
  
  goToPreviousStep: () => set((state) => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    const prevIndex = Math.max(currentIndex - 1, 0);
    return { currentStep: stepOrder[prevIndex] };
  }),

  // Enhanced validation function
  canProceed: (step: OnboardingStep) => {
    const state = get();
    const { registrationData } = state;

    switch (step) {
      case OnboardingStep.WELCOME:
        return true;
      
      case OnboardingStep.AUTHENTICATION:
        return true;
      
      case OnboardingStep.CATEGORY_SELECTION:
        return !!registrationData.selectedCategory;
      
      case OnboardingStep.TYPE_SELECTION:
        return !!registrationData.selectedCategory && !!registrationData.selectedType;
      
      case OnboardingStep.LOCATION_SETUP:
        return !!(
          registrationData.location.city &&
          registrationData.location.state &&
          registrationData.location.pinCode
        );
      
      case OnboardingStep.BASIC_PROFILE:
        return !!(
          registrationData.basicProfile.fullName &&
          registrationData.basicProfile.primaryMobile
        );
      
      case OnboardingStep.PROFESSIONAL_DETAILS:
        return !!(
          registrationData.professionalDetails.experienceLevel &&
          registrationData.professionalDetails.pricing.type &&
          registrationData.professionalDetails.pricing.rate > 0
        );
      
      case OnboardingStep.AVAILABILITY_SETUP:
        return true; // Optional step
      
      case OnboardingStep.REGISTRATION_COMPLETE:
        return get().canProceed(OnboardingStep.AVAILABILITY_SETUP);
      
      default:
        return false;
    }
  },

  // Draft persistence
  saveDraft: () => {
    try {
      const state = get();
      const draftData = {
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        registrationData: state.registrationData,
        lastCompletedStep: state.lastCompletedStep,
        timestamp: Date.now()
      };
      
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      set({ isDraftSaved: true });
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },

  loadDraft: () => {
    try {
      const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftJson) return false;

      const draftData = JSON.parse(draftJson);
      
      // Check if draft is not too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (Date.now() - draftData.timestamp > maxAge) {
        get().clearDraft();
        return false;
      }

      set({
        currentStep: draftData.currentStep,
        completedSteps: draftData.completedSteps || [],
        registrationData: { ...initialRegistrationData, ...draftData.registrationData },
        lastCompletedStep: draftData.lastCompletedStep,
        isDraftSaved: true
      });

      return true;
    } catch (error) {
      console.error('Failed to load draft:', error);
      get().clearDraft();
      return false;
    }
  },

  clearDraft: () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      set({ isDraftSaved: false });
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  },

  getNextIncompleteStep: () => {
    const state = get();
    
    for (const step of stepOrder) {
      if (!state.completedSteps.includes(step)) {
        return step;
      }
    }
    
    return OnboardingStep.REGISTRATION_COMPLETE;
  }
}));