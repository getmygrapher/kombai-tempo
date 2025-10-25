import { create } from 'zustand';
import { 
  CalendarEntry, 
  TimeSlot, 
  RecurringPattern, 
  BookingReference, 
  BookingConflict, 
  CalendarPrivacySettings,
  OperatingHours,
  CalendarViewMode,
  AvailabilityStore
} from '../types/availability';

interface AvailabilityStoreActions {
  // Calendar data actions
  setCalendarData: (data: CalendarEntry[]) => void;
  addCalendarEntry: (entry: CalendarEntry) => void;
  updateCalendarEntry: (id: string, entry: Partial<CalendarEntry>) => void;
  removeCalendarEntry: (id: string) => void;
  
  // Date and view actions
  setSelectedDates: (dates: Date[]) => void;
  addSelectedDate: (date: Date) => void;
  removeSelectedDate: (date: Date) => void;
  clearSelectedDates: () => void;
  setCurrentViewDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  
  // Time slot actions
  setSelectedTimeSlots: (slots: TimeSlot[]) => void;
  addSelectedTimeSlot: (slot: TimeSlot) => void;
  removeSelectedTimeSlot: (slotId: string) => void;
  clearSelectedTimeSlots: () => void;
  setOperatingHours: (hours: OperatingHours) => void;
  
  // Recurring pattern actions
  setRecurringPatterns: (patterns: RecurringPattern[]) => void;
  addRecurringPattern: (pattern: RecurringPattern) => void;
  updateRecurringPattern: (id: string, pattern: Partial<RecurringPattern>) => void;
  removeRecurringPattern: (id: string) => void;
  setActivePattern: (pattern: RecurringPattern | null) => void;
  
  // Booking actions
  setBookings: (bookings: BookingReference[]) => void;
  addBooking: (booking: BookingReference) => void;
  updateBooking: (id: string, booking: Partial<BookingReference>) => void;
  removeBooking: (id: string) => void;
  
  // Conflict actions
  setConflicts: (conflicts: BookingConflict[]) => void;
  addConflict: (conflict: BookingConflict) => void;
  resolveConflict: (id: string) => void;
  
  // Privacy actions
  updatePrivacySettings: (settings: Partial<CalendarPrivacySettings>) => void;
  
  // Utility actions
  resetStore: () => void;
}

const initialState: AvailabilityStore = {
  calendarData: [],
  selectedDates: [],
  currentViewDate: new Date(),
  viewMode: CalendarViewMode.MONTH,
  timeSlots: [],
  selectedTimeSlots: [],
  operatingHours: { start: '06:00', end: '23:00' },
  recurringPatterns: [],
  activePattern: null,
  bookings: [],
  conflicts: [],
  privacySettings: {
    userId: '',
    isVisible: true,
    visibilityLevel: 'professional_network' as any,
    allowedUsers: [],
    hiddenDates: [],
    hiddenTimeSlots: [],
    showPartialAvailability: true,
    allowBookingRequests: true,
    autoDeclineConflicts: false
  }
};

export const useAvailabilityStore = create<AvailabilityStore & AvailabilityStoreActions>((set, get) => ({
  ...initialState,
  
  // Calendar data actions
  setCalendarData: (data) => set({ calendarData: data }),
  
  addCalendarEntry: (entry) => set((state) => ({
    calendarData: [...state.calendarData, entry]
  })),
  
  updateCalendarEntry: (id, entry) => set((state) => ({
    calendarData: state.calendarData.map(item =>
      item.id === id ? { ...item, ...entry } : item
    )
  })),
  
  removeCalendarEntry: (id) => set((state) => ({
    calendarData: state.calendarData.filter(item => item.id !== id)
  })),
  
  // Date and view actions
  setSelectedDates: (dates) => set({ selectedDates: dates }),
  
  addSelectedDate: (date) => set((state) => ({
    selectedDates: [...state.selectedDates, date]
  })),
  
  removeSelectedDate: (date) => set((state) => ({
    selectedDates: state.selectedDates.filter(d => d.getTime() !== date.getTime())
  })),
  
  clearSelectedDates: () => set({ selectedDates: [] }),
  
  setCurrentViewDate: (date) => set({ currentViewDate: date }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // Time slot actions
  setSelectedTimeSlots: (slots) => set({ selectedTimeSlots: slots }),
  
  addSelectedTimeSlot: (slot) => set((state) => ({
    selectedTimeSlots: [...state.selectedTimeSlots, slot]
  })),
  
  removeSelectedTimeSlot: (slotId) => set((state) => ({
    selectedTimeSlots: state.selectedTimeSlots.filter(slot => slot.id !== slotId)
  })),
  
  clearSelectedTimeSlots: () => set({ selectedTimeSlots: [] }),
  
  setOperatingHours: (hours) => set({ operatingHours: hours }),
  
  // Recurring pattern actions
  setRecurringPatterns: (patterns) => set({ recurringPatterns: patterns }),
  
  addRecurringPattern: (pattern) => set((state) => ({
    recurringPatterns: [...state.recurringPatterns, pattern]
  })),
  
  updateRecurringPattern: (id, pattern) => set((state) => ({
    recurringPatterns: state.recurringPatterns.map(item =>
      item.id === id ? { ...item, ...pattern } : item
    )
  })),
  
  removeRecurringPattern: (id) => set((state) => ({
    recurringPatterns: state.recurringPatterns.filter(item => item.id !== id)
  })),
  
  setActivePattern: (pattern) => set({ activePattern: pattern }),
  
  // Booking actions
  setBookings: (bookings) => set({ bookings }),
  
  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, booking]
  })),
  
  updateBooking: (id, booking) => set((state) => ({
    bookings: state.bookings.map(item =>
      item.id === id ? { ...item, ...booking } : item
    )
  })),
  
  removeBooking: (id) => set((state) => ({
    bookings: state.bookings.filter(item => item.id !== id)
  })),
  
  // Conflict actions
  setConflicts: (conflicts) => set({ conflicts }),
  
  addConflict: (conflict) => set((state) => ({
    conflicts: [...state.conflicts, conflict]
  })),
  
  resolveConflict: (id) => set((state) => ({
    conflicts: state.conflicts.filter(item => item.id !== id)
  })),
  
  // Privacy actions
  updatePrivacySettings: (settings) => set((state) => ({
    privacySettings: { ...state.privacySettings, ...settings }
  })),
  
  // Utility actions
  resetStore: () => set(initialState)
}));