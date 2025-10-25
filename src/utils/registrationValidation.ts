export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => ValidationResult;
}

/**
 * Validate Indian mobile number (+91 format)
 */
export const validateMobileNumber = (mobile: string): ValidationResult => {
  if (!mobile || mobile.trim() === '') {
    return { isValid: false, error: 'Mobile number is required' };
  }

  // Remove spaces and special characters
  const cleanMobile = mobile.replace(/[\s\-()]/g, '');
  
  // Check for +91 prefix or 10-digit number
  const indianMobilePattern = /^(\+91|91)?[6-9]\d{9}$/;
  
  if (!indianMobilePattern.test(cleanMobile)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid Indian mobile number (+91 XXXXXXXXXX)' 
    };
  }

  return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validate full name
 */
export const validateFullName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const namePattern = /^[a-zA-Z\s\-'.]+$/;
  
  if (!namePattern.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validate Indian PIN code (6 digits)
 */
export const validatePinCode = (pinCode: string): ValidationResult => {
  if (!pinCode || pinCode.trim() === '') {
    return { isValid: false, error: 'PIN code is required' };
  }

  const pinPattern = /^[1-9][0-9]{5}$/;
  
  if (!pinPattern.test(pinCode)) {
    return { isValid: false, error: 'Please enter a valid 6-digit PIN code' };
  }

  return { isValid: true };
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Please select an image' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPG and PNG images are allowed' };
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 5MB' };
  }

  return { isValid: true };
};

/**
 * Validate city name
 */
export const validateCity = (city: string): ValidationResult => {
  if (!city || city.trim() === '') {
    return { isValid: false, error: 'City is required' };
  }

  if (city.trim().length < 2) {
    return { isValid: false, error: 'City name must be at least 2 characters long' };
  }

  const cityPattern = /^[a-zA-Z\s\-'.]+$/;
  
  if (!cityPattern.test(city)) {
    return { isValid: false, error: 'City name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validate state name
 */
export const validateState = (state: string): ValidationResult => {
  if (!state || state.trim() === '') {
    return { isValid: false, error: 'State is required' };
  }

  if (state.trim().length < 2) {
    return { isValid: false, error: 'State name must be at least 2 characters long' };
  }

  return { isValid: true };
};

/**
 * Validate pricing rate
 */
export const validatePricingRate = (rate: number): ValidationResult => {
  if (rate === undefined || rate === null) {
    return { isValid: false, error: 'Pricing rate is required' };
  }

  if (rate < 0) {
    return { isValid: false, error: 'Pricing rate cannot be negative' };
  }

  if (rate > 1000000) {
    return { isValid: false, error: 'Pricing rate seems too high' };
  }

  return { isValid: true };
};

/**
 * Generic field validator
 */
export const validateField = (value: any, rules: ValidationRules): ValidationResult => {
  // Required check
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: false, error: 'This field is required' };
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true };
  }

  // String length validations
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return { isValid: false, error: `Must be at least ${rules.minLength} characters long` };
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return { isValid: false, error: `Must be less than ${rules.maxLength} characters long` };
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return { isValid: false, error: 'Invalid format' };
    }
  }

  // Custom validator
  if (rules.customValidator) {
    return rules.customValidator(value);
  }

  return { isValid: true };
};

/**
 * Validate multiple fields at once
 */
export const validateFields = (data: Record<string, any>, validationRules: Record<string, ValidationRules>): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach(fieldName => {
    const value = data[fieldName];
    const rules = validationRules[fieldName];
    const result = validateField(value, rules);

    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });

  return errors;
};