import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarEntry, 
  RecurringPattern, 
  BookingConflict, 
  AvailabilityStats,
  TimeSlot,
  CalendarPrivacySettings,
  DateRange
} from '../types/availability';
import { AvailabilityService, availabilityQueries } from '../services/availabilityService';
import RecurringPatternService from '../services/recurringPatternService';
import { supabase } from '../services/supabaseClient';

// Query hooks for availability data
export const useCalendarEntries = (userId: string, dateRange?: DateRange) => {
  const defaultDateRange = dateRange || {
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
  
  return useQuery({
    ...availabilityQueries.getAvailability(userId, defaultDateRange),
    enabled: !!userId,
  });
};

export const useRecurringPatterns = (userId: string) => {
  return useQuery({
    ...availabilityQueries.getRecurringPatterns(userId),
    enabled: !!userId,
  });
};

export const useBookingConflicts = (userId: string) => {
  return useQuery({
    queryKey: ['bookingConflicts', userId],
    queryFn: () => AvailabilityService.getBookingConflicts(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!userId,
  });
};

export const useAvailabilityStats = (userId: string, dateRange?: DateRange) => {
  const defaultDateRange = dateRange || {
    start: new Date(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };
  
  return useQuery({
    ...availabilityQueries.getAvailabilityStats(userId, defaultDateRange),
    enabled: !!userId,
  });
};

// Mutation hooks for availability updates
export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      userId: string; 
      date: string; 
      timeSlots: TimeSlot[]; 
      status: string;
    }) => {
      const calendarEntry: Partial<CalendarEntry> = {
        date: data.date,
        status: data.status as any,
        timeSlots: data.timeSlots,
      };
      return await AvailabilityService.updateAvailability(calendarEntry);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['availability', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEntries', variables.userId] 
      });
    },
  });
};

export const useCreateRecurringPattern = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pattern: Omit<RecurringPattern, 'id' | 'createdAt' | 'updatedAt'>) => {
      return await RecurringPatternService.createPattern(pattern);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['recurringPatterns', data.userId] 
      });
    },
  });
};

export const useApplyRecurringPattern = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      patternId: string; 
      userId: string; 
      dateRange: DateRange; 
    }) => {
      return await AvailabilityService.applyPattern(data.patternId, data.dateRange);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['availability', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEntries', variables.userId] 
      });
    },
  });
};

export const useResolveBookingConflict = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      conflictId: string; 
      userId: string; 
      resolution: string; 
    }) => {
      const conflict: any = {
        id: data.conflictId,
        resolutionAction: data.resolution
      };
      await AvailabilityService.handleBookingConflict(conflict);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['bookingConflicts', variables.userId] 
      });
    },
  });
};

export const useUpdatePrivacySettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: CalendarPrivacySettings) => {
      return await AvailabilityService.updatePrivacySettings(settings);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['privacySettings', data.userId] 
      });
    },
  });
};

// Additional hooks for new backend functionality
export const usePrivacySettings = (userId: string) => {
  return useQuery({
    ...availabilityQueries.getPrivacySettings(userId),
    enabled: !!userId,
  });
};

export const useTimeSlots = (date: Date) => {
  return useQuery({
    ...availabilityQueries.getTimeSlots(date),
    enabled: !!date,
  });
};

export const useBookings = (userId: string) => {
  return useQuery({
    ...availabilityQueries.getBookings(userId),
    enabled: !!userId,
  });
};

export const useUpdateTimeSlots = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { date: Date; timeSlots: TimeSlot[] }) => {
      await AvailabilityService.setTimeSlots(data.date, data.timeSlots);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['timeSlots', variables.date.toISOString()] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['availability'] 
      });
    },
  });
};

export const useUpdateRecurringPattern = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { patternId: string; updates: Partial<RecurringPattern> }) => {
      return await RecurringPatternService.updatePattern(data.patternId, data.updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['recurringPatterns', data.userId] 
      });
    },
  });
};

export const useDeleteRecurringPattern = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { patternId: string; userId: string }) => {
      await RecurringPatternService.deletePattern(data.patternId);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['recurringPatterns', variables.userId] 
      });
    },
  });
};

export const usePreviewRecurringPattern = () => {
  return useMutation({
    mutationFn: async (data: { pattern: RecurringPattern; dateRange: DateRange }) => {
      return await RecurringPatternService.previewPattern(data.pattern, data.dateRange);
    },
  });
};

export const useBulkUpdateAvailability = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { entries: Partial<CalendarEntry>[]; userId: string }) => {
      return await AvailabilityService.bulkUpdateAvailability(data.entries);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['availability', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEntries', variables.userId] 
      });
    },
  });
};

export const useExportCalendar = () => {
  return useMutation({
    mutationFn: async (data: { 
      userId: string; 
      format: 'ics' | 'csv' | 'json'; 
      dateRange: DateRange 
    }) => {
      return await AvailabilityService.exportCalendar(data.userId, data.format, data.dateRange);
    },
  });
};

export const useImportCalendar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { file: File; format: 'ics' | 'csv' | 'json'; userId: string }) => {
      return await AvailabilityService.importCalendar(data.file, data.format);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['availability', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['calendarEntries', variables.userId] 
      });
    },
  });
};

export const useDetectBookingConflicts = () => {
  return useMutation({
    mutationFn: async (data: { 
      bookingDate: Date; 
      startTime: string; 
      endTime: string; 
      jobId?: string 
    }) => {
      return await AvailabilityService.detectBookingConflicts(
        data.bookingDate, 
        data.startTime, 
        data.endTime, 
        data.jobId
      );
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      bookingId: string; 
      newStatus: string; 
      bookingData?: any;
      userId: string;
    }) => {
      return await AvailabilityService.updateBookingStatus(
        data.bookingId, 
        data.newStatus, 
        data.bookingData
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['bookings', variables.userId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['availability', variables.userId] 
      });
    },
  });
};

// Hook to get current authenticated user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};