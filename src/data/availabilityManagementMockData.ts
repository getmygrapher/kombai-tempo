import { AvailabilityStatus } from '../types/enums';
import { 
  PatternType, 
  AvailabilityDay, 
  CalendarVisibility,
  ConflictType,
  BookingAvailabilityStatus,
  SlotGranularity,
  CalendarViewMode
} from '../types/availability';

// Data for global state store
export const mockStore = {
  currentViewDate: new Date('2024-01-15'),
  selectedDates: [],
  selectedTimeSlots: [],
  operatingHours: { start: '06:00', end: '23:00' },
  activePattern: null,
  calendarViewMode: CalendarViewMode.MONTH,
  privacySettings: {
    userId: 'user_123',
    isVisible: true,
    visibilityLevel: CalendarVisibility.PROFESSIONAL_NETWORK,
    allowedUsers: [],
    hiddenDates: [],
    hiddenTimeSlots: [],
    showPartialAvailability: true,
    allowBookingRequests: true,
    autoDeclineConflicts: false
  }
};

// Data returned by API queries
export const mockQuery = {
  calendarEntries: [
    {
      id: 'cal_1',
      userId: 'user_123',
      date: '2024-01-18',
      status: AvailabilityStatus.AVAILABLE,
      timeSlots: [
        {
          id: 'slot_1',
          start: '09:00',
          end: '17:00',
          status: AvailabilityStatus.AVAILABLE,
          isBooked: false
        }
      ],
      isRecurring: false,
      bookings: [],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: 'cal_2', 
      userId: 'user_123',
      date: '2024-01-19',
      status: AvailabilityStatus.BOOKED,
      timeSlots: [
        {
          id: 'slot_2',
          start: '10:00',
          end: '18:00',
          status: AvailabilityStatus.BOOKED,
          isBooked: true,
          jobTitle: 'Corporate Event Photography',
          jobId: 'job_corp_1'
        }
      ],
      isRecurring: false,
      bookings: [
        {
          id: 'booking_1',
          jobId: 'job_corp_1',
          jobTitle: 'Corporate Event Photography',
          clientId: 'client_corp_1',
          clientName: 'Tech Solutions Ltd',
          status: BookingAvailabilityStatus.CONFIRMED_BOOKED,
          timeSlots: [
            {
              id: 'slot_2',
              start: '10:00',
              end: '18:00',
              status: AvailabilityStatus.BOOKED,
              isBooked: true
            }
          ],
          confirmedAt: new Date('2024-01-16T14:30:00Z')
        }
      ],
      createdAt: new Date('2024-01-15T11:00:00Z'),
      updatedAt: new Date('2024-01-16T14:30:00Z')
    },
    {
      id: 'cal_3',
      userId: 'user_123',
      date: '2024-01-20',
      status: AvailabilityStatus.PARTIALLY_AVAILABLE,
      timeSlots: [
        {
          id: 'slot_3',
          start: '09:00',
          end: '12:00',
          status: AvailabilityStatus.AVAILABLE,
          isBooked: false
        },
        {
          id: 'slot_4',
          start: '14:00',
          end: '18:00',
          status: AvailabilityStatus.BOOKED,
          isBooked: true,
          jobTitle: 'Product Photography',
          jobId: 'job_prod_1'
        }
      ],
      isRecurring: false,
      bookings: [],
      createdAt: new Date('2024-01-15T12:00:00Z'),
      updatedAt: new Date('2024-01-15T12:00:00Z')
    },
    {
      id: 'cal_4',
      userId: 'user_123',
      date: '2024-01-22',
      status: AvailabilityStatus.AVAILABLE,
      timeSlots: [
        {
          id: 'slot_5',
          start: '08:00',
          end: '20:00',
          status: AvailabilityStatus.AVAILABLE,
          isBooked: false
        }
      ],
      isRecurring: true,
      recurringPatternId: 'pattern_2',
      bookings: [],
      createdAt: new Date('2024-01-15T13:00:00Z'),
      updatedAt: new Date('2024-01-15T13:00:00Z')
    },
    {
      id: 'cal_5',
      userId: 'user_123',
      date: '2024-01-25',
      status: AvailabilityStatus.UNAVAILABLE,
      timeSlots: [],
      isRecurring: false,
      bookings: [],
      notes: 'Personal day off',
      createdAt: new Date('2024-01-15T14:00:00Z'),
      updatedAt: new Date('2024-01-15T14:00:00Z')
    }
  ],
  
  recurringPatterns: [
    {
      id: 'pattern_1',
      userId: 'user_123',
      name: 'Weekday Work Schedule',
      type: PatternType.WEEKLY,
      schedule: {
        [AvailabilityDay.MONDAY]: {
          available: true,
          timeSlots: [
            { id: 'mon_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.TUESDAY]: {
          available: true,
          timeSlots: [
            { id: 'tue_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.WEDNESDAY]: {
          available: true,
          timeSlots: [
            { id: 'wed_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.THURSDAY]: {
          available: true,
          timeSlots: [
            { id: 'thu_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.FRIDAY]: {
          available: true,
          timeSlots: [
            { id: 'fri_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
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
      exceptions: [new Date('2024-01-26'), new Date('2024-02-14')],
      isActive: true,
      createdAt: new Date('2024-01-10T09:00:00Z'),
      updatedAt: new Date('2024-01-10T09:00:00Z')
    },
    {
      id: 'pattern_2',
      userId: 'user_123',
      name: 'Weekend Photography',
      type: PatternType.WEEKLY,
      schedule: {
        [AvailabilityDay.MONDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.TUESDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.WEDNESDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.THURSDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.FRIDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.SATURDAY]: {
          available: true,
          timeSlots: [
            { id: 'sat_slot', start: '08:00', end: '20:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.SUNDAY]: {
          available: true,
          timeSlots: [
            { id: 'sun_slot', start: '08:00', end: '20:00', status: AvailabilityStatus.AVAILABLE, isBooked: false }
          ],
          isFullDay: false
        }
      },
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      },
      exceptions: [],
      isActive: false,
      createdAt: new Date('2024-01-12T10:00:00Z'),
      updatedAt: new Date('2024-01-12T10:00:00Z')
    }
  ],
  
  bookingConflicts: [
    {
      id: 'conflict_1',
      conflictType: ConflictType.DOUBLE_BOOKING,
      affectedTimeSlots: [
        {
          id: 'conflict_slot',
          start: '14:00',
          end: '16:00',
          status: AvailabilityStatus.BOOKED,
          isBooked: true
        }
      ],
      existingBooking: {
        id: 'existing_booking',
        jobId: 'job_1',
        jobTitle: 'Wedding Photography',
        clientId: 'client_1',
        clientName: 'Priya Nair',
        status: BookingAvailabilityStatus.CONFIRMED_BOOKED,
        timeSlots: [],
        confirmedAt: new Date('2024-01-14T10:00:00Z')
      },
      newBooking: {
        id: 'new_booking',
        jobId: 'job_2',
        jobTitle: 'Corporate Headshots',
        clientId: 'client_2',
        clientName: 'Business Corp',
        status: BookingAvailabilityStatus.TENTATIVELY_BOOKED,
        timeSlots: []
      },
      resolutionOptions: ['auto_decline', 'manual_review', 'flexible_booking']
    }
  ],
  
  availabilityStats: {
    totalAvailableHours: 120,
    bookedHours: 45,
    utilizationRate: 37.5,
    averageBookingDuration: 6,
    mostBookedTimeSlot: '10:00-16:00',
    weeklyAvailabilityTrend: [40, 35, 42, 38, 45, 48, 52]
  }
};

// Data passed as props to the root component
export const mockRootProps = {
  initialViewMode: CalendarViewMode.MONTH,
  defaultOperatingHours: { start: '06:00', end: '23:00' },
  slotGranularity: SlotGranularity.ONE_HOUR,
  enableRecurringPatterns: true,
  enableBookingIntegration: true,
  enablePrivacyControls: true,
  userTier: 'pro' as const,
  userId: 'user_123'
};