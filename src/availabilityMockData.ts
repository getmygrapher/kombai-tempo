// Mock data for availability management system
import { 
  CalendarEntry, 
  TimeSlot, 
  RecurringPattern, 
  BookingReference, 
  BookingConflict,
  CalendarPrivacySettings,
  AvailabilityStatus,
  PatternType,
  AvailabilityDay,
  CalendarVisibility,
  ConflictType,
  BookingAvailabilityStatus
} from './types/availability';

// Mock calendar entries
export const mockCalendarData: CalendarEntry[] = [
  {
    id: 'cal_001',
    userId: 'user_123',
    date: '2024-01-15',
    status: AvailabilityStatus.AVAILABLE,
    timeSlots: [
      {
        id: 'slot_001',
        start: '09:00',
        end: '12:00',
        status: AvailabilityStatus.AVAILABLE,
        isBooked: false
      },
      {
        id: 'slot_002', 
        start: '14:00',
        end: '17:00',
        status: AvailabilityStatus.BOOKED,
        isBooked: true,
        bookingId: 'booking_001',
        jobTitle: 'Wedding Photography'
      }
    ],
    isRecurring: false,
    bookings: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12')
  }
];
// Mock recurring patterns
export const mockRecurringPatterns: RecurringPattern[] = [
  {
    id: 'pattern_001',
    userId: 'user_123',
    name: 'Standard Work Week',
    type: PatternType.WEEKLY,
    schedule: {
      [AvailabilityDay.MONDAY]: {
        available: true,
        timeSlots: [
          { id: 'slot_mon_1', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
        ],
        isFullDay: false
      },
      [AvailabilityDay.TUESDAY]: {
        available: true,
        timeSlots: [
          { id: 'slot_tue_1', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
        ],
        isFullDay: false
      },
      [AvailabilityDay.WEDNESDAY]: {
        available: true,
        timeSlots: [
          { id: 'slot_wed_1', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
        ],
        isFullDay: false
      },
      [AvailabilityDay.THURSDAY]: {
        available: true,
        timeSlots: [
          { id: 'slot_thu_1', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
        ],
        isFullDay: false
      },
      [AvailabilityDay.FRIDAY]: {
        available: true,
        timeSlots: [
          { id: 'slot_fri_1', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
        ],
        isFullDay: false
      },
      [AvailabilityDay.SATURDAY]: {
        available: false,
        timeSlots: [],
        isFullDay: false
      },
      [AvailabilityDay.SUNDAY]: {
        available: false,
        timeSlots: [],
        isFullDay: false
      }
    },
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    },
    exceptions: [new Date('2024-01-15'), new Date('2024-02-14')],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05')
  }
];

// Mock bookings
export const mockBookings: BookingReference[] = [
  {
    id: 'booking_001',
    jobId: 'job_001',
    jobTitle: 'Wedding Photography',
    clientId: 'client_001',
    clientName: 'John & Sarah Wedding',
    status: BookingAvailabilityStatus.CONFIRMED_BOOKED,
    timeSlots: [
      {
        id: 'slot_booking_1',
        start: '14:00',
        end: '17:00',
        status: AvailabilityStatus.BOOKED,
        isBooked: true,
        bookingId: 'booking_001'
      }
    ],
    confirmedAt: new Date('2024-01-10')
  }
];

// Mock conflicts
export const mockConflicts: BookingConflict[] = [
  {
    id: 'conflict_001',
    conflictType: ConflictType.DOUBLE_BOOKING,
    affectedTimeSlots: [
      {
        id: 'slot_conflict_1',
        start: '15:00',
        end: '18:00',
        status: AvailabilityStatus.AVAILABLE,
        isBooked: false
      }
    ],
    existingBooking: mockBookings[0],
    resolutionOptions: ['auto_decline', 'manual_review', 'flexible_booking']
  }
];

// Mock privacy settings
export const mockPrivacySettings: CalendarPrivacySettings = {
  userId: 'user_123',
  isVisible: true,
  visibilityLevel: CalendarVisibility.PROFESSIONAL_NETWORK,
  allowedUsers: ['user_456', 'user_789'],
  hiddenDates: [],
  hiddenTimeSlots: [],
  showPartialAvailability: true,
  allowBookingRequests: true,
  autoDeclineConflicts: false
};

// Root props data
export const mockRootProps = {
  userId: 'user_123' as const,
  currentDate: new Date('2024-01-15'),
  viewMode: 'month' as const,
  operatingHours: { start: '06:00', end: '23:00' },
  granularity: '1hour' as const
};