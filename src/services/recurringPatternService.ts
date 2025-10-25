// Recurring Pattern Management Service
import { supabase } from './supabaseClient';
import { RecurringPattern, DateRange, TimeSlot } from '../types/availability';

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

export class RecurringPatternService {
  // Create a new recurring pattern
  static async createPattern(pattern: Omit<RecurringPattern, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecurringPattern> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('recurring_patterns')
        .insert({
          user_id: uid,
          name: pattern.name,
          pattern_type: pattern.type,
          schedule: pattern.schedule,
          start_date: pattern.dateRange.start.toISOString().split('T')[0],
          end_date: pattern.dateRange.end?.toISOString().split('T')[0],
          is_active: pattern.isActive ?? true,
          exceptions: pattern.exceptions || []
        })
        .select()
        .single();

      if (error) throw mapError(error);

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.pattern_type,
        schedule: data.schedule,
        dateRange: {
          start: new Date(data.start_date),
          end: data.end_date ? new Date(data.end_date) : undefined
        },
        exceptions: data.exceptions || [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Update an existing recurring pattern
  static async updatePattern(patternId: string, updates: Partial<RecurringPattern>): Promise<RecurringPattern> {
    try {
      const uid = await getCurrentUserId();
      
      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.pattern_type = updates.type;
      if (updates.schedule !== undefined) updateData.schedule = updates.schedule;
      if (updates.dateRange !== undefined) {
        updateData.start_date = updates.dateRange.start.toISOString().split('T')[0];
        updateData.end_date = updates.dateRange.end?.toISOString().split('T')[0];
      }
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.exceptions !== undefined) updateData.exceptions = updates.exceptions;

      const { data, error } = await supabase
        .from('recurring_patterns')
        .update(updateData)
        .eq('id', patternId)
        .eq('user_id', uid)
        .select()
        .single();

      if (error) throw mapError(error);

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.pattern_type,
        schedule: data.schedule,
        dateRange: {
          start: new Date(data.start_date),
          end: data.end_date ? new Date(data.end_date) : undefined
        },
        exceptions: data.exceptions || [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Delete a recurring pattern
  static async deletePattern(patternId: string): Promise<void> {
    try {
      const uid = await getCurrentUserId();
      
      // First, remove the pattern from any calendar entries
      await supabase
        .from('calendar_entries')
        .update({ 
          recurring_pattern_id: null,
          is_recurring: false 
        })
        .eq('recurring_pattern_id', patternId)
        .eq('user_id', uid);

      // Then delete the pattern
      const { error } = await supabase
        .from('recurring_patterns')
        .delete()
        .eq('id', patternId)
        .eq('user_id', uid);

      if (error) throw mapError(error);
    } catch (error) {
      throw mapError(error);
    }
  }

  // Get all patterns for the current user
  static async getUserPatterns(): Promise<RecurringPattern[]> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('recurring_patterns')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw mapError(error);

      return (data || []).map((pattern: any) => ({
        id: pattern.id,
        userId: pattern.user_id,
        name: pattern.name,
        type: pattern.pattern_type,
        schedule: pattern.schedule,
        dateRange: {
          start: new Date(pattern.start_date),
          end: pattern.end_date ? new Date(pattern.end_date) : undefined
        },
        exceptions: pattern.exceptions || [],
        isActive: pattern.is_active,
        createdAt: new Date(pattern.created_at),
        updatedAt: new Date(pattern.updated_at)
      }));
    } catch (error) {
      throw mapError(error);
    }
  }

  // Get a specific pattern by ID
  static async getPattern(patternId: string): Promise<RecurringPattern | null> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('recurring_patterns')
        .select('*')
        .eq('id', patternId)
        .eq('user_id', uid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw mapError(error);
      }

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.pattern_type,
        schedule: data.schedule,
        dateRange: {
          start: new Date(data.start_date),
          end: data.end_date ? new Date(data.end_date) : undefined
        },
        exceptions: data.exceptions || [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Apply a pattern to a date range
  static async applyPattern(
    patternId: string, 
    dateRange: DateRange,
    options: {
      overwriteExisting?: boolean;
      skipConflicts?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    entriesCreated: number;
    slotsCreated: number;
    conflicts?: string[];
  }> {
    try {
      const { data, error } = await supabase.rpc('apply_recurring_pattern', {
        pattern_id: patternId,
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0]
      });

      if (error) throw mapError(error);

      return {
        success: data.success,
        entriesCreated: data.entries_created,
        slotsCreated: data.slots_created,
        conflicts: [] // Could be enhanced to return actual conflicts
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Preview what a pattern would create without applying it
  static async previewPattern(
    pattern: RecurringPattern,
    dateRange: DateRange
  ): Promise<{
    dates: string[];
    totalSlots: number;
    conflicts: string[];
    preview: Array<{
      date: string;
      timeSlots: TimeSlot[];
    }>;
  }> {
    try {
      const uid = await getCurrentUserId();
      
      // Generate preview data based on pattern schedule
      const preview: Array<{ date: string; timeSlots: TimeSlot[] }> = [];
      const dates: string[] = [];
      let totalSlots = 0;
      const conflicts: string[] = [];

      const currentDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Skip if date is in exceptions
        if (pattern.exceptions?.includes(dateStr)) {
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }

        // Get day name for schedule lookup
        const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        // Check if pattern has schedule for this day
        if (pattern.schedule && pattern.schedule[dayName]) {
          const daySchedule = pattern.schedule[dayName];
          
          if (Array.isArray(daySchedule) && daySchedule.length > 0) {
            dates.push(dateStr);
            
            const timeSlots: TimeSlot[] = daySchedule.map((slot: any, index: number) => ({
              id: `preview_${dateStr}_${index}`,
              start: slot.start,
              end: slot.end,
              status: 'available' as any,
              isBooked: false
            }));

            preview.push({
              date: dateStr,
              timeSlots
            });

            totalSlots += timeSlots.length;

            // Check for existing bookings on this date
            const { data: existingSlots } = await supabase
              .from('time_slots')
              .select(`
                start_time,
                end_time,
                status,
                calendar_entries!inner(user_id, date)
              `)
              .eq('calendar_entries.user_id', uid)
              .eq('calendar_entries.date', dateStr)
              .eq('status', 'booked');

            if (existingSlots && existingSlots.length > 0) {
              // Check for time overlaps
              timeSlots.forEach(slot => {
                existingSlots.forEach((existing: any) => {
                  if (this.timeOverlaps(slot.start, slot.end, existing.start_time, existing.end_time)) {
                    conflicts.push(`${dateStr}: ${slot.start}-${slot.end} conflicts with existing booking ${existing.start_time}-${existing.end_time}`);
                  }
                });
              });
            }
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        dates,
        totalSlots,
        conflicts,
        preview
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Add exception dates to a pattern
  static async addExceptions(patternId: string, exceptionDates: string[]): Promise<RecurringPattern> {
    try {
      const uid = await getCurrentUserId();
      
      // Get current pattern
      const pattern = await this.getPattern(patternId);
      if (!pattern) throw new Error('Pattern not found');

      // Merge new exceptions with existing ones
      const allExceptions = [...(pattern.exceptions || []), ...exceptionDates];
      const uniqueExceptions = [...new Set(allExceptions)];

      // Update pattern
      const { data, error } = await supabase
        .from('recurring_patterns')
        .update({ exceptions: uniqueExceptions })
        .eq('id', patternId)
        .eq('user_id', uid)
        .select()
        .single();

      if (error) throw mapError(error);

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.pattern_type,
        schedule: data.schedule,
        dateRange: {
          start: new Date(data.start_date),
          end: data.end_date ? new Date(data.end_date) : undefined
        },
        exceptions: data.exceptions || [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Remove exception dates from a pattern
  static async removeExceptions(patternId: string, exceptionDates: string[]): Promise<RecurringPattern> {
    try {
      const uid = await getCurrentUserId();
      
      // Get current pattern
      const pattern = await this.getPattern(patternId);
      if (!pattern) throw new Error('Pattern not found');

      // Remove specified exceptions
      const updatedExceptions = (pattern.exceptions || []).filter(
        date => !exceptionDates.includes(date)
      );

      // Update pattern
      const { data, error } = await supabase
        .from('recurring_patterns')
        .update({ exceptions: updatedExceptions })
        .eq('id', patternId)
        .eq('user_id', uid)
        .select()
        .single();

      if (error) throw mapError(error);

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.pattern_type,
        schedule: data.schedule,
        dateRange: {
          start: new Date(data.start_date),
          end: data.end_date ? new Date(data.end_date) : undefined
        },
        exceptions: data.exceptions || [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Toggle pattern active status
  static async togglePatternStatus(patternId: string): Promise<RecurringPattern> {
    try {
      const uid = await getCurrentUserId();
      
      // Get current pattern
      const pattern = await this.getPattern(patternId);
      if (!pattern) throw new Error('Pattern not found');

      // Toggle active status
      const { data, error } = await supabase
        .from('recurring_patterns')
        .update({ is_active: !pattern.isActive })
        .eq('id', patternId)
        .eq('user_id', uid)
        .select()
        .single();

      if (error) throw mapError(error);

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        type: data.pattern_type,
        schedule: data.schedule,
        dateRange: {
          start: new Date(data.start_date),
          end: data.end_date ? new Date(data.end_date) : undefined
        },
        exceptions: data.exceptions || [],
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Get pattern usage statistics
  static async getPatternStats(patternId: string): Promise<{
    totalApplications: number;
    activeDates: number;
    upcomingDates: number;
    lastApplied?: string;
  }> {
    try {
      const uid = await getCurrentUserId();
      
      const { data, error } = await supabase
        .from('calendar_entries')
        .select('date, created_at')
        .eq('user_id', uid)
        .eq('recurring_pattern_id', patternId)
        .order('date');

      if (error) throw mapError(error);

      const today = new Date().toISOString().split('T')[0];
      const totalApplications = data?.length || 0;
      const activeDates = data?.filter(entry => entry.date >= today).length || 0;
      const upcomingDates = activeDates; // Same as active for now
      const lastApplied = data && data.length > 0 
        ? data[data.length - 1].created_at 
        : undefined;

      return {
        totalApplications,
        activeDates,
        upcomingDates,
        lastApplied
      };
    } catch (error) {
      throw mapError(error);
    }
  }

  // Helper method to check time overlap
  private static timeOverlaps(
    start1: string, 
    end1: string, 
    start2: string, 
    end2: string
  ): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  // Helper method to convert time string to minutes
  private static timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Predefined pattern templates
  static getPatternTemplates(): Array<{
    name: string;
    type: 'weekly' | 'monthly' | 'custom';
    schedule: any;
    description: string;
  }> {
    return [
      {
        name: 'Standard Work Week',
        type: 'weekly',
        schedule: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }]
        },
        description: 'Monday to Friday, 9 AM to 5 PM'
      },
      {
        name: 'Weekend Photographer',
        type: 'weekly',
        schedule: {
          saturday: [
            { start: '08:00', end: '12:00' },
            { start: '14:00', end: '18:00' }
          ],
          sunday: [
            { start: '08:00', end: '12:00' },
            { start: '14:00', end: '18:00' }
          ]
        },
        description: 'Weekend availability with lunch break'
      },
      {
        name: 'Evening Sessions',
        type: 'weekly',
        schedule: {
          monday: [{ start: '17:00', end: '21:00' }],
          tuesday: [{ start: '17:00', end: '21:00' }],
          wednesday: [{ start: '17:00', end: '21:00' }],
          thursday: [{ start: '17:00', end: '21:00' }],
          friday: [{ start: '17:00', end: '21:00' }],
          saturday: [{ start: '16:00', end: '22:00' }],
          sunday: [{ start: '16:00', end: '22:00' }]
        },
        description: 'Evening and night photography sessions'
      },
      {
        name: 'Flexible Schedule',
        type: 'weekly',
        schedule: {
          monday: [
            { start: '10:00', end: '13:00' },
            { start: '15:00', end: '18:00' }
          ],
          wednesday: [
            { start: '10:00', end: '13:00' },
            { start: '15:00', end: '18:00' }
          ],
          friday: [
            { start: '10:00', end: '13:00' },
            { start: '15:00', end: '18:00' }
          ],
          saturday: [{ start: '09:00', end: '15:00' }]
        },
        description: 'Part-time schedule with flexible hours'
      }
    ];
  }
}

export default RecurringPatternService;