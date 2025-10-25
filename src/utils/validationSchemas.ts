import { z } from 'zod';
import { ProfessionalCategory, UrgencyLevel, BudgetType } from '../types';

// Job Creation Validation Schemas

export const basicInfoSchema = z.object({
  title: z.string()
    .min(1, 'Job title is required')
    .max(100, 'Job title must be 100 characters or less'),
  type: z.nativeEnum(ProfessionalCategory, {
    errorMap: () => ({ message: 'Work type is required' })
  }),
  professionalTypesNeeded: z.array(z.string())
    .min(1, 'At least one professional type is required')
    .max(5, 'Maximum 5 professional types allowed')
});

export const scheduleLocationSchema = z.object({
  date: z.string()
    .min(1, 'Job date is required')
    .refine((date) => {
      const jobDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return jobDate >= today;
    }, 'Job date must be in the future'),
  timeSlots: z.array(z.object({
    start: z.string().min(1, 'Start time is required'),
    end: z.string().min(1, 'End time is required')
  })).min(1, 'At least one time slot is required'),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pinCode: z.string()
      .min(6, 'PIN code must be 6 digits')
      .max(6, 'PIN code must be 6 digits')
      .regex(/^\d{6}$/, 'PIN code must contain only numbers'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional(),
    venueDetails: z.string().optional(),
    accessInstructions: z.string().optional(),
    parkingAvailable: z.boolean().optional()
  })
});

export const budgetRequirementsSchema = z.object({
  budgetRange: z.object({
    min: z.number()
      .min(500, 'Minimum budget must be at least ₹500')
      .max(100000, 'Maximum budget cannot exceed ₹1,00,000'),
    max: z.number()
      .min(500, 'Maximum budget must be at least ₹500')
      .max(100000, 'Maximum budget cannot exceed ₹1,00,000'),
    currency: z.literal('INR'),
    type: z.nativeEnum(BudgetType),
    isNegotiable: z.boolean()
  }).refine((data) => data.min < data.max, {
    message: 'Maximum budget must be greater than minimum budget',
    path: ['max']
  }),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be 1000 characters or less'),
  urgency: z.nativeEnum(UrgencyLevel, {
    errorMap: () => ({ message: 'Urgency level is required' })
  })
});

export const jobCreationSchema = z.object({
  ...basicInfoSchema.shape,
  ...scheduleLocationSchema.shape,
  ...budgetRequirementsSchema.shape
});

// Location Validation

export const locationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string()
    .min(6, 'PIN code must be 6 digits')
    .max(6, 'PIN code must be 6 digits')
    .regex(/^\d{6}$/, 'PIN code must contain only numbers'),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }).optional()
});

// Application Validation

export const applicationSchema = z.object({
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be 500 characters or less'),
  proposedRate: z.number()
    .min(500, 'Proposed rate must be at least ₹500')
    .max(100000, 'Proposed rate cannot exceed ₹1,00,000')
    .optional()
});

// Search and Filter Validation

export const jobFiltersSchema = z.object({
  categories: z.array(z.nativeEnum(ProfessionalCategory)).optional(),
  urgency: z.array(z.nativeEnum(UrgencyLevel)).optional(),
  budgetRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional()
  }).optional(),
  distance: z.string().optional(),
  dateRange: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional()
});

// Utility validation functions

export const isValidPincodeIndia = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

export const isFutureDate = (date: string): boolean => {
  const jobDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return jobDate >= today;
};

export const isValidBudgetRange = (min: number, max: number): boolean => {
  return min > 0 && max > 0 && min < max && min >= 500 && max <= 100000;
};

// Type exports for form integration
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type ScheduleLocationFormData = z.infer<typeof scheduleLocationSchema>;
export type BudgetRequirementsFormData = z.infer<typeof budgetRequirementsSchema>;
export type JobCreationFormData = z.infer<typeof jobCreationSchema>;
export type LocationFormData = z.infer<typeof locationSchema>;
export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type JobFiltersFormData = z.infer<typeof jobFiltersSchema>;