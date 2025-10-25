// Real-time availability synchronization service
import { supabase } from './supabaseClient';
import { CalendarEntry, TimeSlot, BookingReference } from '../types/availability';

type AvailabilityEventType = 
  | 'availability_updated' 
  | 'booking_created' 
  | 'booking_updated' 
  | 'conflict_detected'
  | 'pattern_applied';

interface AvailabilityEvent {
  type: AvailabilityEventType;
  payload: any;
  userId: string;
  timestamp: string;
}

type EventHandler = (event: AvailabilityEvent) => void;

export class AvailabilityRealtimeService {
  private subscriptions: Map<string, any> = new Map();
  private eventHandlers: Map<AvailabilityEventType, EventHandler[]> = new Map();
  private isConnected = false;
  private userId: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.userId = user.id;
      this.connect();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.userId = session.user.id;
        this.connect();
      } else if (event === 'SIGNED_OUT') {
        this.disconnect();
        this.userId = null;
      }
    });
  }

  public connect(): void {
    if (!this.userId || this.isConnected) return;

    try {
      // Subscribe to calendar entries changes
      const calendarSubscription = supabase
        .channel('calendar_entries_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'calendar_entries',
            filter: `user_id=eq.${this.userId}`
          },
          (payload) => {
            this.handleCalendarEntryChange(payload);
          }
        )
        .subscribe();

      this.subscriptions.set('calendar_entries', calendarSubscription);

      // Subscribe to time slots changes
      const timeSlotsSubscription = supabase
        .channel('time_slots_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'time_slots'
          },
          (payload) => {
            this.handleTimeSlotChange(payload);
          }
        )
        .subscribe();

      this.subscriptions.set('time_slots', timeSlotsSubscription);

      // Subscribe to booking references changes
      const bookingSubscription = supabase
        .channel('booking_references_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_references',
            filter: `user_id=eq.${this.userId}`
          },
          (payload) => {
            this.handleBookingChange(payload);
          }
        )
        .subscribe();

      this.subscriptions.set('booking_references', bookingSubscription);

      // Subscribe to booking conflicts
      const conflictSubscription = supabase
        .channel('booking_conflicts_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'booking_conflicts',
            filter: `user_id=eq.${this.userId}`
          },
          (payload) => {
            this.handleConflictChange(payload);
          }
        )
        .subscribe();

      this.subscriptions.set('booking_conflicts', conflictSubscription);

      // Subscribe to recurring patterns changes
      const patternsSubscription = supabase
        .channel('recurring_patterns_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'recurring_patterns',
            filter: `user_id=eq.${this.userId}`
          },
          (payload) => {
            this.handlePatternChange(payload);
          }
        )
        .subscribe();

      this.subscriptions.set('recurring_patterns', patternsSubscription);

      this.isConnected = true;
      console.log('✅ Availability realtime service connected');
    } catch (error) {
      console.error('❌ Failed to connect availability realtime service:', error);
    }
  }

  public disconnect(): void {
    if (!this.isConnected) return;

    this.subscriptions.forEach((subscription, key) => {
      try {
        supabase.removeChannel(subscription);
      } catch (error) {
        console.error(`Failed to unsubscribe from ${key}:`, error);
      }
    });

    this.subscriptions.clear();
    this.isConnected = false;
    console.log('🔌 Availability realtime service disconnected');
  }

  public on(eventType: AvailabilityEventType, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  private emit(eventType: AvailabilityEventType, payload: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (!handlers) return;

    const event: AvailabilityEvent = {
      type: eventType,
      payload,
      userId: this.userId || '',
      timestamp: new Date().toISOString()
    };

    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
      }
    });
  }

  private async handleCalendarEntryChange(payload: any): Promise<void> {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Only handle changes for the current user
    if (newRecord?.user_id !== this.userId && oldRecord?.user_id !== this.userId) {
      return;
    }

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        // Fetch complete entry with time slots
        const { data: entryData, error } = await supabase.rpc('get_availability_with_slots', {
          start_date: newRecord.date,
          end_date: newRecord.date
        });

        if (!error && entryData && entryData.length > 0) {
          this.emit('availability_updated', {
            action: eventType.toLowerCase(),
            entry: entryData[0],
            previous: oldRecord
          });
        }
        break;

      case 'DELETE':
        this.emit('availability_updated', {
          action: 'delete',
          entry: oldRecord,
          previous: null
        });
        break;
    }
  }

  private async handleTimeSlotChange(payload: any): Promise<void> {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Check if this time slot belongs to current user's calendar entry
    let calendarEntry = null;
    if (newRecord?.calendar_entry_id) {
      const { data } = await supabase
        .from('calendar_entries')
        .select('user_id, date')
        .eq('id', newRecord.calendar_entry_id)
        .single();
      
      if (data?.user_id === this.userId) {
        calendarEntry = data;
      }
    }

    if (!calendarEntry && oldRecord?.calendar_entry_id) {
      const { data } = await supabase
        .from('calendar_entries')
        .select('user_id, date')
        .eq('id', oldRecord.calendar_entry_id)
        .single();
      
      if (data?.user_id === this.userId) {
        calendarEntry = data;
      }
    }

    if (!calendarEntry) return;

    this.emit('availability_updated', {
      action: `time_slot_${eventType.toLowerCase()}`,
      timeSlot: newRecord || oldRecord,
      calendarEntry,
      previous: oldRecord
    });
  }

  private handleBookingChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    this.emit('booking_updated', {
      action: eventType.toLowerCase(),
      booking: newRecord || oldRecord,
      previous: oldRecord,
      statusChanged: oldRecord && newRecord && oldRecord.status !== newRecord.status
    });
  }

  private handleConflictChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      this.emit('conflict_detected', {
        conflict: newRecord,
        requiresAttention: newRecord.resolution_status === 'pending'
      });
    } else if (eventType === 'UPDATE' && newRecord.resolution_status !== oldRecord.resolution_status) {
      this.emit('conflict_detected', {
        conflict: newRecord,
        resolved: newRecord.resolution_status === 'resolved',
        previous: oldRecord
      });
    }
  }

  private handlePatternChange(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    this.emit('pattern_applied', {
      action: eventType.toLowerCase(),
      pattern: newRecord || oldRecord,
      previous: oldRecord,
      statusChanged: oldRecord && newRecord && oldRecord.is_active !== newRecord.is_active
    });
  }

  // Utility methods for common operations
  public async broadcastAvailabilityUpdate(
    calendarEntryId: string,
    updateType: 'created' | 'updated' | 'deleted'
  ): Promise<void> {
    try {
      // This would be used to notify other parts of the app about availability changes
      // For now, we rely on the database triggers to handle real-time updates
      console.log(`Broadcasting availability update: ${updateType} for entry ${calendarEntryId}`);
    } catch (error) {
      console.error('Failed to broadcast availability update:', error);
    }
  }

  public async syncAvailabilityState(): Promise<void> {
    if (!this.userId) return;

    try {
      // Force refresh of availability data
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      
      const { data, error } = await supabase.rpc('get_availability_with_slots', {
        start_date: today.toISOString().split('T')[0],
        end_date: nextMonth.toISOString().split('T')[0]
      });

      if (!error && data) {
        this.emit('availability_updated', {
          action: 'sync',
          entries: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to sync availability state:', error);
    }
  }

  // Getters
  public get connected(): boolean {
    return this.isConnected;
  }

  public get currentUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const availabilityRealtimeService = new AvailabilityRealtimeService();

// Export convenience hooks for React components
export const useAvailabilityRealtime = () => {
  return {
    service: availabilityRealtimeService,
    isConnected: availabilityRealtimeService.connected,
    userId: availabilityRealtimeService.currentUserId
  };
};