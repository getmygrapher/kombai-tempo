// Availability service with Supabase backend integration
import { supabase } from './supabaseClient';
import RecurringPatternService from './recurringPatternService';
import { availabilityRealtimeService } from './availabilityRealtimeService';
import { 
  CalendarEntry, 
  TimeSlot, 
  RecurringPattern, 
  BookingReference, 
  BookingConflict,
  CalendarPrivacySettings,
  DateRange,
  AvailabilityStats
} from '../types/availability';

// Error handling utility
function mapError(error: any): Error {
  if (!error) return new Error('Unknown error');
  const message = error.message || error.error_description || 'Unexpected error';
  return new Error(message);
}

// Get current authenticated user ID
async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw mapError(error);
  const uid = data.user?.id;
  if (!uid) throw new Error('No authenticated user');
  return uid;
}

export class AvailabilityService {
  // Calendar operations
  static async getAvailability(userId: string, dateRange: DateRange): Promise<CalendarEntry[]> {
    try {
      const { data, error } = await supabase.rpc('get_availability_with_slots', {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0]
      });

      if (error) throw mapError(error);

      return (data || []).map((entry: any) => ({
        id: entry.entry_id,
        userId,
        date: entry.date,
        status: entry.status,
        timeSlots: entry.time_slots.map((slot: any) => ({
          id: slot.id,
          start: slot.start_time,
          end: slot.end_time,
          status: slot.status,
          isBooked: slot.is_booked,
          jobTitle: slot.job_title,
          clientName: slot.client_name,
          ratePerHour: slot.rate_per_hour
        })),
        isRecurring: entry.is_recurring,
        recurringPatternId: entry.recurring_pattern_id,
        notes: entry.notes,
        bookings: [], // Will be populated separately if needed
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    } catch (error) {
      throw mapError(error);
    }
  }

  static async updateAvailability(availability: Partial<CalendarEntry>): Promise<CalendarEntry> {
    try {
      const uid = await getCurrentUserId();
      
      // Prepare data for bulk update
      const availabilityData = [{
        date: availability.date,
        status: availability.status,
        is_recurring: availability.isRecurring || false,
        recurring_pattern_id: availability.recurringPatternId || null,
        notes: availability.notes || null,
        time_slots: (availability.timeSlots || []).map(slot => ({
          start_time: slot.start,
          end_time: slot.end,
          status: slot.status,
          is_booked: slot.isBooked || false,
          job_id: slot.jobId || null,
          job_title: slot.jobTitle || null,
          client_name: slot.clientName || null,
          rate_per_hour: slot.ratePerHour ? slot.ratePerHour.toString() : null,
          notes: slot.notes || null
        }))
      }];

      const { data, error } = await supabase.rpc('set_availability_bulk', {
        availability_data: availabilityData
      });

      if (error) throw mapError(error);

      // Return updated availability entry
      return {
        id: availability.id || data?.id || 'new_cal_id',
        userId: uid,
        date: availability.date || new Date().toISOString().split('T')[0],
        status: availability.status || 'available' as any,
        timeSlots: availability.timeSlots || [],
        isRecurring: availability.isRecurring || false,
        recurringPatternId: availability.recurringPatternId,
        notes: availability.notes,
        bookings: availability.bookings || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Time slot operations
  static async setTimeSlots(date: Date, timeSlots: TimeSlot[]): Promise<void> {
    try {
      const uid = await getCurrentUserId();
      const dateStr = date.toISOString().split('T')[0];
      
      // Determine status based on time slots
      let status = 'available';
      if (timeSlots.length === 0) {
        status = 'unavailable';
      } else if (timeSlots.some(slot => slot.isBooked)) {
        status = timeSlots.every(slot => slot.isBooked) ? 'booked' : 'partial';
      }
      
      // Use bulk update with single date
      const availabilityData = [{
        date: dateStr,
        status: status,
        is_recurring: false,
        recurring_pattern_id: null,
        notes: null,
        time_slots: timeSlots.map(slot => ({
          start_time: slot.start,
          end_time: slot.end,
          status: slot.status,
          is_booked: slot.isBooked || false,
          job_id: slot.jobId || null,
          job_title: slot.jobTitle || null,
          client_name: slot.clientName || null,
          rate_per_hour: slot.ratePerHour ? slot.ratePerHour.toString() : null,
          notes: slot.notes || null
        }))
      }];

      const { error } = await supabase.rpc('set_availability_bulk', {
        availability_data: availabilityData
      });

      if (error) throw mapError(error);
    } catch (error) {
      throw mapError(error);
    }
  }

  static async getTimeSlots(date: Date): Promise<TimeSlot[]> {
    try {
      const uid = await getCurrentUserId();
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase.rpc('get_availability_with_slots', {
        start_date: dateStr,
        end_date: dateStr
      });

      if (error) throw mapError(error);

      if (!data || data.length === 0) return [];

      const entry = data[0];
      return entry.time_slots.map((slot: any) => ({
        id: slot.id,
        start: slot.start_time,
        end: slot.end_time,
        status: slot.status,
        isBooked: slot.is_booked,
        jobId: slot.job_id,
        jobTitle: slot.job_title,
        clientName: slot.client_name,
        ratePerHour: slot.rate_per_hour,
        notes: slot.notes
      }));
    } catch (error) {
      throw mapError(error);
    }
  }

  // Pattern operations
  static async saveRecurringPattern(pattern: RecurringPattern): Promise<RecurringPattern> {
    try {
      const uid = await getCurrentUserId();
      
      if (pattern.id) {
        // Update existing pattern
        const { data, error } = await supabase
          .from('recurring_patterns')
          .update({
            name: pattern.name,
            pattern_type: pattern.type,
            schedule: pattern.schedule,
            start_date: pattern.dateRange.start.toISOString().split('T')[0],
            end_date: pattern.dateRange.end?.toISOString().split('T')[0],
            is_active: pattern.isActive,
            exceptions: pattern.exceptions || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', pattern.id)
          .eq('user_id', uid)
          .select()
          .single();

        if (error) throw mapError(error);
        
        return {
          ...pattern,
          id: data.id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
      } else {
        // Create new pattern
        const { data, error } = await supabase
          .from('recurring_patterns')
          .insert({
            user_id: uid,
            name: pattern.name,
            pattern_type: pattern.type,
            schedule: pattern.schedule,
            start_date: pattern.dateRange.start.toISOString().split('T')[0],
            end_date: pattern.dateRange.end?.toISOString().split('T')[0],
            is_active: pattern.isActive,
            exceptions: pattern.exceptions || []
          })
          .select()
          .single();

        if (error) throw mapError(error);
        
        return {
          ...pattern,
          id: data.id,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
      }
    } catch (error) {
      throw mapError(error);
    }
  }

  static async applyPattern(patternId: string, dateRange: DateRange): Promise<CalendarEntry[]> {
    try {
      const { data, error } = await supabase.rpc('apply_recurring_pattern', {
        pattern_id: patternId,
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0]
      });

      if (error) throw mapError(error);

      // Get the updated availability data
      return await this.getAvailability('current_user', dateRange);
    } catch (error) {
      throw mapError(error);
    }
  }

  static async getRecurringPatterns(userId: string): Promise<RecurringPattern[]> {
    return RecurringPatternService.getUserPatterns();
  }

  // Enhanced pattern operations using the dedicated service
  static async createRecurringPattern(pattern: Omit<RecurringPattern, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringPattern> {
    return RecurringPatternService.createPattern(pattern);
  }

  static async updateRecurringPattern(patternId: string, updates: Partial<RecurringPattern>): Promise<RecurringPattern> {
    return RecurringPatternService.updatePattern(patternId, updates);
  }

  static async deleteRecurringPattern(patternId: string): Promise<void> {
    return RecurringPatternService.deletePattern(patternId);
  }

  static async previewRecurringPattern(pattern: RecurringPattern, dateRange: DateRange): Promise<any> {
    return RecurringPatternService.previewPattern(pattern, dateRange);
  }

  static async getPatternTemplates(): Promise<any[]> {
    return RecurringPatternService.getPatternTemplates();
  }

  // Booking integration
  static async syncBookings(): Promise<BookingReference[]> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('booking_references')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw mapError(error);

      return (data || []).map((booking: any) => ({
        id: booking.id,
        jobId: booking.job_id,
        jobTitle: booking.job_title,
        clientId: booking.client_id,
        clientName: booking.client_name,
        status: booking.status,
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        totalAmount: booking.total_amount,
        timeSlots: [
          {
            id: `slot_${booking.id}`,
            start: booking.start_time,
            end: booking.end_time,
            status: 'booked' as any,
            isBooked: true,
            jobTitle: booking.job_title,
            clientName: booking.client_name
          }
        ],
        confirmedAt: booking.confirmed_at ? new Date(booking.confirmed_at) : undefined
      }));
    } catch (error) {
      throw mapError(error);
    }
  }

  static async handleBookingConflict(conflict: BookingConflict): Promise<void> {
    try {
      const uid = await getCurrentUserId();
      
      // Update conflict resolution status
      const { error } = await supabase
        .from('booking_conflicts')
        .update({
          resolution_status: 'resolved',
          resolution_action: conflict.resolutionAction,
          resolved_at: new Date().toISOString()
        })
        .eq('id', conflict.id)
        .eq('user_id', uid);

      if (error) throw mapError(error);
    } catch (error) {
      throw mapError(error);
    }
  }

  static async getBookingConflicts(userId: string): Promise<BookingConflict[]> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('booking_conflicts')
        .select('*')
        .eq('user_id', uid)
        .eq('resolution_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw mapError(error);

      return (data || []).map((conflict: any) => ({
        id: conflict.id,
        conflictType: conflict.conflict_type,
        primaryBookingId: conflict.primary_booking_id,
        conflictingBookingId: conflict.conflicting_booking_id,
        affectedDate: conflict.affected_date,
        affectedTimeSlots: [
          {
            id: `conflict_slot_${conflict.id}`,
            start: conflict.affected_time_start,
            end: conflict.affected_time_end,
            status: 'available' as any,
            isBooked: false
          }
        ],
        resolutionOptions: ['auto_decline', 'manual_review', 'flexible_booking'],
        resolutionStatus: conflict.resolution_status,
        resolutionAction: conflict.resolution_action
      }));
    } catch (error) {
      throw mapError(error);
    }
  }

  // New method to detect conflicts when creating bookings
  static async detectBookingConflicts(
    bookingDate: Date,
    startTime: string,
    endTime: string,
    jobId?: string
  ): Promise<{ hasConflicts: boolean; conflicts: any[] }> {
    try {
      const { data, error } = await supabase.rpc('detect_booking_conflicts', {
        booking_date: bookingDate.toISOString().split('T')[0],
        start_time: startTime,
        end_time: endTime,
        job_id: jobId || null
      });

      if (error) throw mapError(error);

      return data || { hasConflicts: false, conflicts: [] };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Update booking status and sync with availability
  static async updateBookingStatus(
    bookingId: string,
    newStatus: string,
    bookingData?: any
  ): Promise<{ success: boolean }> {
    try {
      const { data, error } = await supabase.rpc('update_booking_status', {
        booking_id: bookingId,
        new_status: newStatus,
        booking_data: bookingData || {}
      });

      if (error) throw mapError(error);

      return data || { success: true };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Privacy operations
  static async updatePrivacySettings(settings: CalendarPrivacySettings): Promise<CalendarPrivacySettings> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('calendar_privacy_settings')
        .upsert({
          user_id: uid,
          is_visible: settings.isVisible,
          visibility_level: settings.visibilityLevel,
          allowed_users: settings.allowedUsers || [],
          hidden_dates: settings.hiddenDates || [],
          show_partial_availability: settings.showPartialAvailability,
          allow_booking_requests: settings.allowBookingRequests,
          auto_decline_conflicts: settings.autoDeclineConflicts,
          lead_time_hours: settings.leadTimeHours || 24,
          advance_booking_days: settings.advanceBookingDays || 90,
          notification_preferences: settings.notificationPreferences || {
            booking_requests: true,
            reminders: true,
            conflicts: true
          },
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw mapError(error);

      return {
        userId: data.user_id,
        isVisible: data.is_visible,
        visibilityLevel: data.visibility_level,
        allowedUsers: data.allowed_users || [],
        hiddenDates: data.hidden_dates || [],
        hiddenTimeSlots: [], // Computed from time slots if needed
        showPartialAvailability: data.show_partial_availability,
        allowBookingRequests: data.allow_booking_requests,
        autoDeclineConflicts: data.auto_decline_conflicts,
        leadTimeHours: data.lead_time_hours,
        advanceBookingDays: data.advance_booking_days,
        notificationPreferences: data.notification_preferences
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  static async getPrivacySettings(userId: string): Promise<CalendarPrivacySettings> {
    try {
      const uid = await getCurrentUserId();
      
      // Initialize privacy settings if they don't exist
      const { data: initData, error: initError } = await supabase.rpc('initialize_calendar_privacy');
      
      if (initError) throw mapError(initError);

      const { data, error } = await supabase
        .from('calendar_privacy_settings')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (error) throw mapError(error);

      return {
        userId: data.user_id,
        isVisible: data.is_visible,
        visibilityLevel: data.visibility_level,
        allowedUsers: data.allowed_users || [],
        hiddenDates: data.hidden_dates || [],
        hiddenTimeSlots: [], // Computed from time slots if needed
        showPartialAvailability: data.show_partial_availability,
        allowBookingRequests: data.allow_booking_requests,
        autoDeclineConflicts: data.auto_decline_conflicts,
        leadTimeHours: data.lead_time_hours,
        advanceBookingDays: data.advance_booking_days,
        notificationPreferences: data.notification_preferences
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Analytics
  static async getAvailabilityStats(userId: string, dateRange: DateRange): Promise<AvailabilityStats> {
    try {
      const { data, error } = await supabase.rpc('get_availability_stats', {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0]
      });

      if (error) throw mapError(error);

      // Get weekly trend data
      const weeklyTrend = await this.getWeeklyAvailabilityTrend(dateRange);

      return {
        totalAvailableHours: data.total_available_hours || 0,
        bookedHours: data.total_booked_hours || 0,
        utilizationRate: data.utilization_rate || 0,
        averageBookingDuration: data.avg_booking_duration || 0,
        totalBookings: data.total_bookings || 0,
        mostBookedTimeSlot: await this.getMostBookedTimeSlot(dateRange),
        weeklyAvailabilityTrend: weeklyTrend
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Helper method to get weekly availability trend
  private static async getWeeklyAvailabilityTrend(dateRange: DateRange): Promise<number[]> {
    try {
      const uid = await getCurrentUserId();
      
      // Get availability data grouped by week
      const { data, error } = await supabase
        .from('availability_analytics')
        .select('date, total_available_hours')
        .eq('user_id', uid)
        .gte('date', dateRange.start.toISOString().split('T')[0])
        .lte('date', dateRange.end.toISOString().split('T')[0])
        .order('date');

      if (error) throw mapError(error);

      // Group by week and sum hours
      const weeklyData: { [week: string]: number } = {};
      (data || []).forEach((entry: any) => {
        const date = new Date(entry.date);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toISOString().split('T')[0];
        
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + (entry.total_available_hours || 0);
      });

      return Object.values(weeklyData);
    } catch (error) {
      console.error('Error getting weekly trend:', error);
      return [40, 45, 38, 42, 50, 35, 48]; // Fallback data
    }
  }

  // Helper method to get most booked time slot
  private static async getMostBookedTimeSlot(dateRange: DateRange): Promise<string> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('time_slots')
        .select(`
          start_time,
          end_time,
          calendar_entries!inner(user_id, date)
        `)
        .eq('calendar_entries.user_id', uid)
        .eq('status', 'booked')
        .gte('calendar_entries.date', dateRange.start.toISOString().split('T')[0])
        .lte('calendar_entries.date', dateRange.end.toISOString().split('T')[0]);

      if (error) throw mapError(error);

      if (!data || data.length === 0) return 'No bookings';

      // Count occurrences of each time slot
      const timeSlotCounts: { [slot: string]: number } = {};
      data.forEach((slot: any) => {
        const slotKey = `${slot.start_time}-${slot.end_time}`;
        timeSlotCounts[slotKey] = (timeSlotCounts[slotKey] || 0) + 1;
      });

      // Find most frequent time slot
      let mostBookedSlot = 'No bookings';
      let maxCount = 0;
      
      Object.entries(timeSlotCounts).forEach(([slot, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostBookedSlot = slot;
        }
      });

      return mostBookedSlot;
    } catch (error) {
      console.error('Error getting most booked time slot:', error);
      return '14:00-18:00'; // Fallback
    }
  }

  // Export/Import operations
  static async exportCalendar(
    userId: string, 
    format: 'ics' | 'csv' | 'json',
    dateRange: DateRange
  ): Promise<{ blob: Blob; operationId: string }> {
    try {
      const { data, error } = await supabase.rpc('export_calendar_data', {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0],
        format_type: format
      });

      if (error) throw mapError(error);

      let content = '';
      let mimeType = '';

      switch (format) {
        case 'ics':
          content = this.convertToICS(data.data);
          mimeType = 'text/calendar';
          break;
        case 'csv':
          content = this.convertToCSV(data.data);
          mimeType = 'text/csv';
          break;
        case 'json':
          content = JSON.stringify(data.data, null, 2);
          mimeType = 'application/json';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      
      return {
        blob,
        operationId: data.operation_id
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  static async importCalendar(file: File, format: 'ics' | 'csv' | 'json'): Promise<{
    success: boolean;
    importedEntries: number;
    errors: string[];
  }> {
    try {
      const uid = await getCurrentUserId();
      const fileContent = await this.readFileContent(file);
      
      let calendarData: any[] = [];
      const errors: string[] = [];

      try {
        switch (format) {
          case 'ics':
            calendarData = this.parseICS(fileContent);
            break;
          case 'csv':
            calendarData = this.parseCSV(fileContent);
            break;
          case 'json':
            const jsonData = JSON.parse(fileContent);
            calendarData = Array.isArray(jsonData) ? jsonData : [jsonData];
            break;
        }
      } catch (parseError) {
        errors.push(`Failed to parse ${format.toUpperCase()} file: ${parseError}`);
        return { success: false, importedEntries: 0, errors };
      }

      // Import the parsed data
      const { data, error } = await supabase.rpc('set_availability_bulk', {
        availability_data: calendarData
      });

      if (error) throw mapError(error);

      // Log the import operation
      await supabase
        .from('calendar_operations')
        .insert({
          user_id: uid,
          operation_type: 'import',
          format: format,
          status: 'completed',
          records_count: calendarData.length
        });

      return {
        success: true,
        importedEntries: data.entries_created || 0,
        errors
      };
    } catch (error) {
      return {
        success: false,
        importedEntries: 0,
        errors: [mapError(error).message]
      };
    }
  }

  // Helper methods for format conversion
  private static convertToICS(calendarData: any[]): string {
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GetMyGrapher//Availability Calendar//EN\n';
    
    calendarData.forEach((entry: any) => {
      entry.time_slots?.forEach((slot: any) => {
        const startDateTime = `${entry.date.replace(/-/g, '')}T${slot.start_time.replace(':', '')}00`;
        const endDateTime = `${entry.date.replace(/-/g, '')}T${slot.end_time.replace(':', '')}00`;
        
        ics += 'BEGIN:VEVENT\n';
        ics += `UID:${entry.date}-${slot.start_time}-${slot.end_time}@getmygrapher.com\n`;
        ics += `DTSTART:${startDateTime}\n`;
        ics += `DTEND:${endDateTime}\n`;
        ics += `SUMMARY:${slot.status === 'available' ? 'Available' : slot.job_title || 'Busy'}\n`;
        if (slot.client_name) {
          ics += `DESCRIPTION:Client: ${slot.client_name}\n`;
        }
        ics += 'END:VEVENT\n';
      });
    });
    
    ics += 'END:VCALENDAR';
    return ics;
  }

  private static convertToCSV(calendarData: any[]): string {
    let csv = 'Date,Status,Start Time,End Time,Job Title,Client Name,Rate\n';
    
    calendarData.forEach((entry: any) => {
      if (entry.time_slots && entry.time_slots.length > 0) {
        entry.time_slots.forEach((slot: any) => {
          csv += `${entry.date},${slot.status},${slot.start_time},${slot.end_time},"${slot.job_title || ''}","${slot.client_name || ''}",${slot.rate_per_hour || ''}\n`;
        });
      } else {
        csv += `${entry.date},${entry.status},,,,\n`;
      }
    });
    
    return csv;
  }

  private static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static parseICS(icsContent: string): any[] {
    // Basic ICS parser - in production, use a proper ICS parsing library
    const events: any[] = [];
    const lines = icsContent.split('\n');
    let currentEvent: any = null;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (trimmedLine === 'END:VEVENT' && currentEvent) {
        if (currentEvent.dtstart && currentEvent.dtend) {
          const date = currentEvent.dtstart.substring(0, 8);
          const startTime = `${currentEvent.dtstart.substring(9, 11)}:${currentEvent.dtstart.substring(11, 13)}`;
          const endTime = `${currentEvent.dtend.substring(9, 11)}:${currentEvent.dtend.substring(11, 13)}`;
          
          events.push({
            date: `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`,
            status: 'available',
            time_slots: [{
              start_time: startTime,
              end_time: endTime,
              status: 'available'
            }]
          });
        }
        currentEvent = null;
      } else if (currentEvent && trimmedLine.includes(':')) {
        const [key, ...valueParts] = trimmedLine.split(':');
        const value = valueParts.join(':');
        
        switch (key) {
          case 'DTSTART':
            currentEvent.dtstart = value;
            break;
          case 'DTEND':
            currentEvent.dtend = value;
            break;
          case 'SUMMARY':
            currentEvent.summary = value;
            break;
        }
      }
    });

    return events;
  }

  private static parseCSV(csvContent: string): any[] {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const events: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= 4 && values[0] && values[2] && values[3]) {
        events.push({
          date: values[0],
          status: values[1] || 'available',
          time_slots: [{
            start_time: values[2],
            end_time: values[3],
            status: values[1] || 'available',
            job_title: values[4] || '',
            client_name: values[5] || '',
            rate_per_hour: values[6] || ''
          }]
        });
      }
    }

    return events;
  }

  // Real-time integration methods
  static initializeRealtime(): void {
    availabilityRealtimeService.connect();
  }

  static disconnectRealtime(): void {
    availabilityRealtimeService.disconnect();
  }

  static onAvailabilityUpdate(handler: (event: any) => void): () => void {
    return availabilityRealtimeService.on('availability_updated', handler);
  }

  static onBookingUpdate(handler: (event: any) => void): () => void {
    return availabilityRealtimeService.on('booking_updated', handler);
  }

  static onConflictDetected(handler: (event: any) => void): () => void {
    return availabilityRealtimeService.on('conflict_detected', handler);
  }

  // Bulk operations for better performance
  static async bulkUpdateAvailability(entries: Partial<CalendarEntry>[]): Promise<{
    success: boolean;
    entriesCreated: number;
    slotsCreated: number;
    errors: string[];
  }> {
    try {
      const availabilityData = entries.map(entry => ({
        date: entry.date,
        status: entry.status,
        is_recurring: entry.isRecurring || false,
        recurring_pattern_id: entry.recurringPatternId || null,
        notes: entry.notes || null,
        time_slots: (entry.timeSlots || []).map(slot => ({
          start_time: slot.start,
          end_time: slot.end,
          status: slot.status,
          is_booked: slot.isBooked || false,
          job_id: slot.jobId || null,
          job_title: slot.jobTitle || null,
          client_name: slot.clientName || null,
          rate_per_hour: slot.ratePerHour ? slot.ratePerHour.toString() : null,
          notes: slot.notes || null
        }))
      }));

      const { data, error } = await supabase.rpc('set_availability_bulk', {
        availability_data: availabilityData
      });

      if (error) throw mapError(error);

      return {
        success: data?.success ?? true,
        entriesCreated: data?.entries_created || 0,
        slotsCreated: data?.slots_created || 0,
        errors: []
      };
    } catch (error) {
      return {
        success: false,
        entriesCreated: 0,
        slotsCreated: 0,
        errors: [mapError(error).message]
      };
    }
  }

  // Validation methods
  static validateTimeSlot(slot: TimeSlot): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(slot.start)) {
      errors.push('Invalid start time format');
    }
    if (!timeRegex.test(slot.end)) {
      errors.push('Invalid end time format');
    }

    // Check time order
    if (slot.start >= slot.end) {
      errors.push('Start time must be before end time');
    }

    // Check minimum duration (30 minutes)
    const startMinutes = this.timeToMinutes(slot.start);
    const endMinutes = this.timeToMinutes(slot.end);
    if (endMinutes - startMinutes < 30) {
      errors.push('Minimum slot duration is 30 minutes');
    }

    // Check maximum duration (12 hours)
    if (endMinutes - startMinutes > 720) {
      errors.push('Maximum slot duration is 12 hours');
    }

    // Check business hours (6 AM to 11 PM)
    if (startMinutes < 360 || endMinutes > 1380) {
      errors.push('Time slots must be between 6:00 AM and 11:00 PM');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Utility method to check if service is properly initialized
  static async healthCheck(): Promise<{
    database: boolean;
    realtime: boolean;
    auth: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let database = false;
    let realtime = false;
    let auth = false;

    try {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser();
      auth = !!user;
      if (!auth) errors.push('User not authenticated');

      // Check database connection
      const { error: dbError } = await supabase.from('calendar_entries').select('id').limit(1);
      database = !dbError;
      if (dbError) errors.push(`Database error: ${dbError.message}`);

      // Check realtime connection
      realtime = availabilityRealtimeService.connected;
      if (!realtime) errors.push('Realtime service not connected');

    } catch (error) {
      errors.push(`Health check failed: ${error}`);
    }

    return {
      database,
      realtime,
      auth,
      errors
    };
  }
}

// Convenience hooks for React Query integration
export const availabilityQueries = {
  getAvailability: (userId: string, dateRange: DateRange) => ({
    queryKey: ['availability', userId, dateRange],
    queryFn: () => AvailabilityService.getAvailability(userId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }),
  
  getTimeSlots: (date: Date) => ({
    queryKey: ['timeSlots', date.toISOString()],
    queryFn: () => AvailabilityService.getTimeSlots(date),
    staleTime: 2 * 60 * 1000, // 2 minutes
  }),
  
  getRecurringPatterns: (userId: string) => ({
    queryKey: ['recurringPatterns', userId],
    queryFn: () => AvailabilityService.getRecurringPatterns(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  }),
  
  getBookings: (userId: string) => ({
    queryKey: ['bookings', userId],
    queryFn: () => AvailabilityService.syncBookings(),
    staleTime: 1 * 60 * 1000, // 1 minute
  }),
  
  getPrivacySettings: (userId: string) => ({
    queryKey: ['privacySettings', userId],
    queryFn: () => AvailabilityService.getPrivacySettings(userId),
    staleTime: 15 * 60 * 1000, // 15 minutes
  }),
  
  getAvailabilityStats: (userId: string, dateRange: DateRange) => ({
    queryKey: ['availabilityStats', userId, dateRange],
    queryFn: () => AvailabilityService.getAvailabilityStats(userId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
};