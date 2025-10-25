// Mock data for availability management system
import { 
  AvailabilityStatus, 
  PatternType, 
  AvailabilityDay, 
  CalendarVisibility,
  ConflictType,
  BookingAvailabilityStatus,
  SlotGranularity,
  CalendarViewMode,
  CalendarEntry,
  RecurringPattern,
  BookingConflict,
  BookingReference,
  TimeSlot,
  AvailabilityStats
} from '../types/availability';

// Data for global state store
export const mockStore = {
  currentViewDate: new Date('2024-01-15'),
  selectedDates: [],
  selectedTimeSlots: [],
  operatingHours: { start: '06:00', end: '23:00' },
  activePattern: null,
  calendarViewMode: CalendarViewMode.MONTH as const,
  privacySettings: {
    userId: 'user_123',
    isVisible: true,
    visibilityLevel: CalendarVisibility.PROFESSIONAL_NETWORK as const,
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
      status: AvailabilityStatus.AVAILABLE as const,
      timeSlots: [
        {
          id: 'slot_1',
          start: '09:00',
          end: '17:00',
          status: AvailabilityStatus.AVAILABLE as const,
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
      status: AvailabilityStatus.BOOKED as const,
      timeSlots: [
        {
          id: 'slot_2',
          start: '10:00',
          end: '18:00',
          status: AvailabilityStatus.BOOKED as const,
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
          status: BookingAvailabilityStatus.CONFIRMED_BOOKED as const,
          timeSlots: [
            {
              id: 'slot_2',
              start: '10:00',
              end: '18:00',
              status: AvailabilityStatus.BOOKED as const,
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
      status: AvailabilityStatus.PARTIALLY_AVAILABLE as const,
      timeSlots: [
        {
          id: 'slot_3',
          start: '09:00',
          end: '12:00',
          status: AvailabilityStatus.AVAILABLE as const,
          isBooked: false
        },
        {
          id: 'slot_4',
          start: '14:00',
          end: '18:00',
          status: AvailabilityStatus.BOOKED as const,
          isBooked: true,
          jobTitle: 'Product Photography',
          jobId: 'job_prod_1'
        }
      ],
      isRecurring: false,
      bookings: [],
      createdAt: new Date('2024-01-15T12:00:00Z'),
      updatedAt: new Date('2024-01-15T12:00:00Z')
    }
  ] as CalendarEntry[],
  
  recurringPatterns: [
    {
      id: 'pattern_1',
      userId: 'user_123',
      name: 'Weekday Work Schedule',
      type: PatternType.WEEKLY as const,
      schedule: {
        [AvailabilityDay.MONDAY]: {
          available: true,
          timeSlots: [
            { id: 'mon_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE as const, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.TUESDAY]: {
          available: true,
          timeSlots: [
            { id: 'tue_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE as const, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.WEDNESDAY]: {
          available: true,
          timeSlots: [
            { id: 'wed_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE as const, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.THURSDAY]: {
          available: true,
          timeSlots: [
            { id: 'thu_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE as const, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.FRIDAY]: {
          available: true,
          timeSlots: [
            { id: 'fri_slot', start: '09:00', end: '17:00', status: AvailabilityStatus.AVAILABLE as const, isBooked: false }
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
      type: PatternType.WEEKLY as const,
      schedule: {
        [AvailabilityDay.MONDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.TUESDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.WEDNESDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.THURSDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.FRIDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.SATURDAY]: {
          available: true,
          timeSlots: [
            { id: 'sat_slot', start: '08:00', end: '20:00', status: AvailabilityStatus.AVAILABLE as const, isBooked: false }
          ],
          isFullDay: false
        },
        [AvailabilityDay.SUNDAY]: {
          available: true,
          timeSlots: [
            { id: 'sun_slot', start: '08:00', end: '20:00', status: AvailabilityStatus.AVAILABLE as const, isBooked: false }
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
  ] as RecurringPattern[],
  
  bookingConflicts: [
    {
      id: 'conflict_1',
      conflictType: ConflictType.DOUBLE_BOOKING as const,
      affectedTimeSlots: [
        {
          id: 'conflict_slot',
          start: '14:00',
          end: '16:00',
          status: AvailabilityStatus.BOOKED as const,
          isBooked: true
        }
      ],
      existingBooking: {
        id: 'existing_booking',
        jobId: 'job_1',
        jobTitle: 'Wedding Photography',
        clientId: 'client_1',
        clientName: 'Priya Nair',
        status: BookingAvailabilityStatus.CONFIRMED_BOOKED as const,
        timeSlots: [],
        confirmedAt: new Date('2024-01-14T10:00:00Z')
      },
      newBooking: {
        id: 'new_booking',
        jobId: 'job_2',
        jobTitle: 'Corporate Headshots',
        clientId: 'client_2',
        clientName: 'Business Corp',
        status: BookingAvailabilityStatus.TENTATIVELY_BOOKED as const,
        timeSlots: []
      },
      resolutionOptions: ['auto_decline', 'manual_review', 'flexible_booking']
    }
  ] as BookingConflict[],
  
  availabilityStats: {
    totalAvailableHours: 120,
    bookedHours: 45,
    utilizationRate: 37.5,
    averageBookingDuration: 6,
    mostBookedTimeSlot: '10:00-16:00',
    weeklyAvailabilityTrend: [40, 35, 42, 38, 45, 48, 52]
  } as AvailabilityStats
};

// Data passed as props to the root component
export const mockRootProps = {
  initialViewMode: CalendarViewMode.MONTH as const,
  defaultOperatingHours: { start: '06:00', end: '23:00' },
  slotGranularity: SlotGranularity.ONE_HOUR as const,
  enableRecurringPatterns: true,
  enableBookingIntegration: true,
  enablePrivacyControls: true,
  userTier: 'pro' as const
};