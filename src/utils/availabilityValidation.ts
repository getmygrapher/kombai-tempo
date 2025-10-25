// Validation utilities for availability management
import { TimeSlot, OperatingHours, DateRange } from '../types/availability';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class AvailabilityValidator {
  // Validate date is not in the past
  static validateNotPastDate(date: Date): ValidationResult {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return {
        isValid: false,
        errors: ['Cannot set availability for past dates'],
        warnings: []
      };
    }
    
    return { isValid: true, errors: [], warnings: [] };
  }

  // Validate date range is within 6 months
  static validateDateRange(dateRange: DateRange): ValidationResult {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    if (dateRange.end > sixMonthsFromNow) {
      return {
        isValid: false,
        errors: ['Date range cannot exceed 6 months from today'],
        warnings: []
      };
    }
    
    if (dateRange.start > dateRange.end) {
      return {
        isValid: false,
        errors: ['Start date must be before end date'],
        warnings: []
      };
    }
    
    return { isValid: true, errors: [], warnings: [] };
  }

  // Validate time slots are within operating hours
  static validateOperatingHours(timeSlots: TimeSlot[], operatingHours: OperatingHours): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const operatingStart = this.timeToMinutes(operatingHours.start);
    const operatingEnd = this.timeToMinutes(operatingHours.end);
    
    for (const slot of timeSlots) {
      const slotStart = this.timeToMinutes(slot.start);
      const slotEnd = this.timeToMinutes(slot.end);
      
      if (slotStart < operatingStart || slotEnd > operatingEnd) {
        errors.push(`Time slot ${slot.start}-${slot.end} is outside operating hours (${operatingHours.start}-${operatingHours.end})`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate minimum and maximum slot duration
  static validateSlotDuration(timeSlots: TimeSlot[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const slot of timeSlots) {
      const duration = this.getSlotDurationInHours(slot);
      
      if (duration < 1) {
        errors.push(`Time slot ${slot.start}-${slot.end} is less than minimum 1 hour duration`);
      }
      
      if (duration > 12) {
        errors.push(`Time slot ${slot.start}-${slot.end} exceeds maximum 12 hour duration`);
      }
      
      // Suggest breaks for long sessions
      if (duration > 6) {
        warnings.push(`Consider adding breaks for long session ${slot.start}-${slot.end}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate no overlapping time slots
  static validateNoOverlaps(timeSlots: TimeSlot[]): ValidationResult {
    const errors: string[] = [];
    const sortedSlots = [...timeSlots].sort((a, b) => 
      this.timeToMinutes(a.start) - this.timeToMinutes(b.start)
    );
    
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];
      
      const currentEnd = this.timeToMinutes(current.end);
      const nextStart = this.timeToMinutes(next.start);
      
      if (currentEnd > nextStart) {
        errors.push(`Time slots overlap: ${current.start}-${current.end} and ${next.start}-${next.end}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  // Validate booking conflicts
  static validateBookingConflicts(newSlots: TimeSlot[], existingBookings: TimeSlot[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (const newSlot of newSlots) {
      for (const booking of existingBookings) {
        if (this.slotsOverlap(newSlot, booking)) {
          if (booking.isBooked) {
            errors.push(`Cannot mark time as unavailable - confirmed booking exists: ${booking.start}-${booking.end}`);
          } else {
            warnings.push(`Tentative booking exists for ${booking.start}-${booking.end}`);
          }
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate lead time requirements
  static validateLeadTime(date: Date, leadTimeHours: number = 24): ValidationResult {
    const now = new Date();
    const leadTimeMs = leadTimeHours * 60 * 60 * 1000;
    const requiredTime = new Date(now.getTime() + leadTimeMs);
    
    if (date < requiredTime) {
      return {
        isValid: false,
        errors: [`Availability must be set at least ${leadTimeHours} hours in advance`],
        warnings: []
      };
    }
    
    return { isValid: true, errors: [], warnings: [] };
  }

  // Comprehensive validation
  static validateAvailabilityUpdate(
    date: Date,
    timeSlots: TimeSlot[],
    operatingHours: OperatingHours,
    existingBookings: TimeSlot[] = [],
    leadTimeHours: number = 24
  ): ValidationResult {
    const results = [
      this.validateNotPastDate(date),
      this.validateOperatingHours(timeSlots, operatingHours),
      this.validateSlotDuration(timeSlots),
      this.validateNoOverlaps(timeSlots),
      this.validateBookingConflicts(timeSlots, existingBookings),
      this.validateLeadTime(date, leadTimeHours)
    ];
    
    const allErrors = results.flatMap(r => r.errors);
    const allWarnings = results.flatMap(r => r.warnings);
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  // Helper methods
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static getSlotDurationInHours(slot: TimeSlot): number {
    const startMinutes = this.timeToMinutes(slot.start);
    const endMinutes = this.timeToMinutes(slot.end);
    return (endMinutes - startMinutes) / 60;
  }

  private static slotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    const slot1Start = this.timeToMinutes(slot1.start);
    const slot1End = this.timeToMinutes(slot1.end);
    const slot2Start = this.timeToMinutes(slot2.start);
    const slot2End = this.timeToMinutes(slot2.end);
    
    return slot1Start < slot2End && slot2Start < slot1End;
  }
}

// Quick validation functions for common use cases
export const validateTimeSlot = (slot: TimeSlot, operatingHours: OperatingHours): ValidationResult => {
  return AvailabilityValidator.validateAvailabilityUpdate(
    new Date(),
    [slot],
    operatingHours
  );
};

export const validateDateNotPast = (date: Date): boolean => {
  return AvailabilityValidator.validateNotPastDate(date).isValid;
};

export const validateTimeInOperatingHours = (time: string, operatingHours: OperatingHours): boolean => {
  const timeMinutes = AvailabilityValidator['timeToMinutes'](time);
  const startMinutes = AvailabilityValidator['timeToMinutes'](operatingHours.start);
  const endMinutes = AvailabilityValidator['timeToMinutes'](operatingHours.end);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};