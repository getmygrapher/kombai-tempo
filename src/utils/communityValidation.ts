import { ContributionFormData, ValidationErrorType } from '../types/community';

export interface ValidationError {
  field: string;
  type: ValidationErrorType;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export const validateContributionForm = (formData: ContributionFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!formData.title.trim()) {
    errors.push({
      field: 'title',
      type: ValidationErrorType.REQUIRED_FIELD,
      message: 'Title is required'
    });
  } else if (formData.title.length < 5) {
    errors.push({
      field: 'title',
      type: ValidationErrorType.INVALID_FORMAT,
      message: 'Title must be at least 5 characters long'
    });
  }

  // Posing tips validation
  if (!formData.posing_tips.trim()) {
    errors.push({
      field: 'posing_tips',
      type: ValidationErrorType.REQUIRED_FIELD,
      message: 'Posing tips are required'
    });
  } else if (formData.posing_tips.length < 20) {
    errors.push({
      field: 'posing_tips',
      type: ValidationErrorType.INVALID_FORMAT,
      message: 'Posing tips must be at least 20 characters long'
    });
  }

  // People count validation
  if (formData.people_count < 1 || formData.people_count > 20) {
    errors.push({
      field: 'people_count',
      type: ValidationErrorType.INVALID_FORMAT,
      message: 'People count must be between 1 and 20'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateImageFile = (file: File): ValidationError | null => {
  // File type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return {
      field: 'image',
      type: ValidationErrorType.INVALID_FILE_TYPE,
      message: 'Only JPG and PNG files are allowed'
    };
  }

  // File size validation (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      field: 'image',
      type: ValidationErrorType.FILE_TOO_LARGE,
      message: 'File size exceeds 5MB limit'
    };
  }

  return null;
};

export const isValidTitle = (title: string): boolean => {
  return title.trim().length >= 5;
};

export const isValidPosingTips = (tips: string): boolean => {
  return tips.trim().length >= 20;
};

export const isValidPeopleCount = (count: number): boolean => {
  return count >= 1 && count <= 20;
};