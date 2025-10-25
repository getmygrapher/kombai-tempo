// Additional types for availability management system
import { AvailabilityStatus, BookingStatus } from './enums';

// Re-export enums for easier importing
export { AvailabilityStatus, BookingStatus } from './enums';

// Additional enums for availability management system
export enum PatternType {
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly', 
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
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

export enum SlotGranularity {
  THIRTY_MINUTES = '30min',
  ONE_HOUR = '1hour',
  TWO_HOURS = '2hours',
  FOUR_HOURS = '4hours',
  FULL_DAY = 'full_day'
}

export enum CalendarVisibility {
  PUBLIC = 'public',
  PROFESSIONAL_NETWORK = 'professional_network',
  PRIVATE = 'private',
  CONTACTS_ONLY = 'contacts_only'
}

export enum ConflictType {
  DOUBLE_BOOKING = 'double_booking',
  AVAILABILITY_CHANGE = 'availability_change',
  SCHEDULE_OVERLAP = 'schedule_overlap'
}

export enum ConflictResolution {
  AUTO_DECLINE = 'auto_decline',
  MANUAL_REVIEW = 'manual_review',
  FLEXIBLE_BOOKING = 'flexible_booking',
  WAITLIST = 'waitlist'
}

export enum BookingAvailabilityStatus {
  AVAILABLE = 'available',
  TENTATIVELY_BOOKED = 'tentatively_booked',
  CONFIRMED_BOOKED = 'confirmed_booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CalendarViewMode {
  MONTH = 'month',
  WEEK = 'week'
}

// Enhanced TimeSlot interface
export interface TimeSlot {
  id: string;
  start: string; // HH:mm format
  end: string; // HH:mm format
  status: AvailabilityStatus;
  isBooked: boolean;
  bookingId?: string;
  jobTitle?: string;
  jobId?: string;
  clientName?: string;
  ratePerHour?: number;
  notes?: string;
}

// Enhanced CalendarEntry interface
export interface CalendarEntry {
  id: string;
  userId: string;
  date: string; // ISO date string
  status: AvailabilityStatus;
  timeSlots: TimeSlot[];
  isRecurring: boolean;
  recurringPatternId?: string;
  bookings: BookingReference[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Recurring pattern interfaces
export interface RecurringPattern {
  id: string;
  userId: string;
  name: string;
  type: PatternType;
  schedule: WeeklySchedule;
  dateRange: DateRange;
  exceptions: Date[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WeeklySchedule = {
  [key in AvailabilityDay]: DaySchedule;
};

export interface DaySchedule {
  available: boolean;
  timeSlots: TimeSlot[];
  isFullDay: boolean;
  notes?: string;
}

// Booking integration interfaces
export interface BookingReference {
  id: string;
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  status: BookingAvailabilityStatus;
  timeSlots: TimeSlot[];
  confirmedAt?: Date;
  completedAt?: Date;
}

export interface BookingConflict {
  id: string;
  conflictType: ConflictType;
  affectedTimeSlots: TimeSlot[];
  existingBooking?: BookingReference;
  newBooking?: BookingReference;
  resolutionOptions: string[];
  resolvedAt?: Date;
}

// Privacy and settings interfaces
export interface CalendarPrivacySettings {
  userId: string;
  isVisible: boolean;
  visibilityLevel: CalendarVisibility;
  allowedUsers: string[];
  hiddenDates: Date[];
  hiddenTimeSlots: TimeSlot[];
  showPartialAvailability: boolean;
  allowBookingRequests: boolean;
  autoDeclineConflicts: boolean;
}

// Utility interfaces
export interface OperatingHours {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AvailabilityStats {
  totalAvailableHours: number;
  bookedHours: number;
  utilizationRate: number;
  averageBookingDuration: number;
  mostBookedTimeSlot: string;
  weeklyAvailabilityTrend: number[];
}

// Component prop interfaces
export interface AvailabilityCalendarProps {
  currentDate: Date;
  calendarEntries: CalendarEntry[];
  selectedDates: Date[];
  viewMode: CalendarViewMode;
  onDateSelect: (dates: Date[]) => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export interface TimeSlotSelectorProps {
  date: Date;
  selectedSlots: TimeSlot[];
  availableSlots: TimeSlot[];
  operatingHours: OperatingHours;
  granularity: SlotGranularity;
  onSlotSelect: (slots: TimeSlot[]) => void;
}

export interface RecurringPatternProps {
  patterns: RecurringPattern[];
  activePattern: RecurringPattern | null;
  onCreatePattern: (pattern: RecurringPattern) => void;
  onApplyPattern: (patternId: string, dateRange: DateRange) => void;
  onDeletePattern: (patternId: string) => void;
}

// Store interface
export interface AvailabilityStore {
  calendarData: CalendarEntry[];
  selectedDates: Date[];
  currentViewDate: Date;
  viewMode: CalendarViewMode;
  timeSlots: TimeSlot[];
  selectedTimeSlots: TimeSlot[];
  operatingHours: OperatingHours;
  recurringPatterns: RecurringPattern[];
  activePattern: RecurringPattern | null;
  bookings: BookingReference[];
  conflicts: BookingConflict[];
  privacySettings: CalendarPrivacySettings;
}