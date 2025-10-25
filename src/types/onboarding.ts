// Registration and onboarding related enums
export enum OnboardingStep {
  WELCOME = 'welcome',
  AUTHENTICATION = 'authentication',
  CATEGORY_SELECTION = 'category_selection',
  TYPE_SELECTION = 'type_selection',
  LOCATION_SETUP = 'location_setup',
  BASIC_PROFILE = 'basic_profile',
  PROFESSIONAL_DETAILS = 'professional_details',
  AVAILABILITY_SETUP = 'availability_setup',
  REGISTRATION_COMPLETE = 'registration_complete'
}

export enum RegistrationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum ValidationError {
  REQUIRED_FIELD = 'required_field',
  INVALID_FORMAT = 'invalid_format',
  INVALID_LENGTH = 'invalid_length',
  INVALID_FILE_TYPE = 'invalid_file_type',
  FILE_TOO_LARGE = 'file_too_large',
  NETWORK_ERROR = 'network_error'
}

export enum LocationPermission {
  GRANTED = 'granted',
  DENIED = 'denied',
  PROMPT = 'prompt',
  NOT_SUPPORTED = 'not_supported'
}

export enum FileUploadStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum CalendarVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  CONTACTS_ONLY = 'contacts_only'
}

export enum AvailabilityDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

export enum BookingLeadTime {
  IMMEDIATE = '0',
  ONE_HOUR = '1',
  FOUR_HOURS = '4',
  ONE_DAY = '24',
  TWO_DAYS = '48',
  ONE_WEEK = '168'
}

export enum AdvanceBookingLimit {
  ONE_WEEK = '7',
  TWO_WEEKS = '14',
  ONE_MONTH = '30',
  THREE_MONTHS = '90',
  SIX_MONTHS = '180',
  ONE_YEAR = '365'
}