import { OnboardingStep, RegistrationStatus, ValidationError } from '../types/onboarding';
import { ExperienceLevel, ProfessionalCategory } from '../types/enums';

// Progress calculation
export const calculateProgress = (currentStep: OnboardingStep): number => {
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
  
  const currentIndex = stepOrder.indexOf(currentStep);
  return Math.round((currentIndex / (stepOrder.length - 1)) * 100);
};

// Step formatting
export const formatStepNumber = (step: OnboardingStep): string => {
  const stepNumbers = {
    // Onboarding proper has 6 steps: Category(1) → Type(2) → Location(3) → Profile(4) → Details(5) → Availability(6)
    [OnboardingStep.WELCOME]: 'Intro',
    [OnboardingStep.AUTHENTICATION]: 'Intro',
    [OnboardingStep.CATEGORY_SELECTION]: '1 of 6',
    [OnboardingStep.TYPE_SELECTION]: '2 of 6',
    [OnboardingStep.LOCATION_SETUP]: '3 of 6',
    [OnboardingStep.BASIC_PROFILE]: '4 of 6',
    [OnboardingStep.PROFESSIONAL_DETAILS]: '5 of 6',
    [OnboardingStep.AVAILABILITY_SETUP]: '6 of 6',
    [OnboardingStep.REGISTRATION_COMPLETE]: 'Complete'
  };
  
  return stepNumbers[step] || '';
};

// Validation error formatting
export const formatValidationError = (error: ValidationError, fieldName?: string): string => {
  const errorMessages = {
    [ValidationError.REQUIRED_FIELD]: `${fieldName || 'This field'} is required`,
    [ValidationError.INVALID_FORMAT]: `${fieldName || 'Field'} format is invalid`,
    [ValidationError.INVALID_LENGTH]: `${fieldName || 'Field'} length is invalid`,
    [ValidationError.INVALID_FILE_TYPE]: 'Please select a valid file type (JPG, PNG)',
    [ValidationError.FILE_TOO_LARGE]: 'File size must be less than 5MB',
    [ValidationError.NETWORK_ERROR]: 'Network error. Please try again'
  };
  
  return errorMessages[error] || 'An error occurred';
};

// Professional category descriptions
export const formatCategoryDescription = (category: ProfessionalCategory): string => {
  const descriptions = {
    [ProfessionalCategory.PHOTOGRAPHY]: 'Capture moments and create visual stories',
    [ProfessionalCategory.VIDEOGRAPHY]: 'Create compelling video content and films',
    [ProfessionalCategory.AUDIO]: 'Produce and engineer high-quality audio',
    [ProfessionalCategory.DESIGN]: 'Design visual communications and experiences',
    [ProfessionalCategory.MULTI_DISCIPLINARY]: 'Combine multiple creative skills and services'
  };
  
  return descriptions[category] || '';
};

// Experience level descriptions
export const formatExperienceDescription = (level: ExperienceLevel): string => {
  const descriptions = {
    [ExperienceLevel.ENTRY]: 'Just starting your professional journey',
    [ExperienceLevel.JUNIOR]: 'Building experience and developing skills',
    [ExperienceLevel.MID]: 'Established professional with solid experience',
    [ExperienceLevel.SENIOR]: 'Highly experienced with specialized expertise',
    [ExperienceLevel.EXPERT]: 'Industry leader with extensive experience'
  };
  
  return descriptions[level] || '';
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('91')) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};