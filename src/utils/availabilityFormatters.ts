// String formatting functions for availability management
import { AvailabilityStatus } from '../types/enums';
import { PatternType, CalendarVisibility, ConflictType } from '../types/availability';

export const formatTimeSlot = (start: string, end: string): string => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
};

export const formatAvailabilityStatus = (status: AvailabilityStatus): string => {
  switch (status) {
    case AvailabilityStatus.AVAILABLE:
      return 'Available';
    case AvailabilityStatus.PARTIALLY_AVAILABLE:
      return 'Partially Available';
    case AvailabilityStatus.UNAVAILABLE:
      return 'Unavailable';
    case AvailabilityStatus.BOOKED:
      return 'Booked';
    default:
      return 'Unknown';
  }
};

export const formatPatternType = (type: PatternType): string => {
  switch (type) {
    case PatternType.WEEKLY:
      return 'Weekly Pattern';
    case PatternType.BI_WEEKLY:
      return 'Bi-weekly Pattern';
    case PatternType.MONTHLY:
      return 'Monthly Pattern';
    case PatternType.CUSTOM:
      return 'Custom Pattern';
    default:
      return 'Unknown Pattern';
  }
};

export const formatCalendarVisibility = (visibility: CalendarVisibility): string => {
  switch (visibility) {
    case CalendarVisibility.PUBLIC:
      return 'Public - Visible to all users';
    case CalendarVisibility.PROFESSIONAL_NETWORK:
      return 'Professional Network - Visible to verified professionals';
    case CalendarVisibility.PRIVATE:
      return 'Private - Hidden from all users';
    case CalendarVisibility.CONTACTS_ONLY:
      return 'Contacts Only - Visible to connected professionals';
    default:
      return 'Unknown Visibility';
  }
};

export const formatConflictType = (type: ConflictType): string => {
  switch (type) {
    case ConflictType.DOUBLE_BOOKING:
      return 'Double Booking Conflict';
    case ConflictType.AVAILABILITY_CHANGE:
      return 'Availability Change Conflict';
    case ConflictType.SCHEDULE_OVERLAP:
      return 'Schedule Overlap Conflict';
    default:
      return 'Unknown Conflict';
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const formatUtilizationRate = (rate: number): string => {
  return `${rate.toFixed(1)}%`;
};