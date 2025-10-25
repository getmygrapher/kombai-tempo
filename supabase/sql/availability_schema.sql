-- Availability Management System - Complete Backend Schema
-- Run in Supabase SQL editor to create comprehensive availability management system

-- 1) Calendar Entries - Main availability data
CREATE TABLE IF NOT EXISTS public.calendar_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'unavailable', 'partial', 'booked', 'blocked')),
  is_recurring boolean DEFAULT false,
  recurring_pattern_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one entry per user per date
  UNIQUE(user_id, date)
);

-- 2) Time Slots - Granular time availability within calendar entries
CREATE TABLE IF NOT EXISTS public.time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_entry_id uuid REFERENCES public.calendar_entries(id) ON DELETE CASCADE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL CHECK (status IN ('available', 'booked', 'blocked', 'break')),
  is_booked boolean DEFAULT false,
  job_id uuid, -- Reference to job if booked
  job_title text,
  client_name text,
  booking_reference text,
  rate_per_hour decimal(10,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure time slots don't overlap
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- 3) Recurring Patterns - Templates for recurring availability
CREATE TABLE IF NOT EXISTS public.recurring_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  pattern_type text NOT NULL CHECK (pattern_type IN ('weekly', 'monthly', 'custom')),
  schedule jsonb NOT NULL, -- { "monday": [{"start": "09:00", "end": "17:00"}], ... }
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  exceptions jsonb DEFAULT '[]', -- Array of exception dates
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Booking References - Integration with job system
CREATE TABLE IF NOT EXISTS public.booking_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL,
  job_title text NOT NULL,
  client_id uuid,
  client_name text NOT NULL,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed_booked', 'completed', 'cancelled')),
  total_amount decimal(10,2),
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5) Booking Conflicts - Track and resolve conflicts
CREATE TABLE IF NOT EXISTS public.booking_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conflict_type text NOT NULL CHECK (conflict_type IN ('double_booking', 'overlap', 'pattern_conflict', 'availability_conflict')),
  primary_booking_id uuid,
  conflicting_booking_id uuid,
  affected_date date NOT NULL,
  affected_time_start time NOT NULL,
  affected_time_end time NOT NULL,
  resolution_status text DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored')),
  resolution_action text, -- 'auto_decline', 'manual_review', 'flexible_booking'
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 6) Calendar Privacy Settings - Control visibility and access
CREATE TABLE IF NOT EXISTS public.calendar_privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_visible boolean DEFAULT true,
  visibility_level text DEFAULT 'professional_network' CHECK (visibility_level IN ('public', 'professional_network', 'contacts_only', 'private')),
  allowed_users uuid[] DEFAULT '{}',
  hidden_dates date[] DEFAULT '{}',
  show_partial_availability boolean DEFAULT true,
  allow_booking_requests boolean DEFAULT true,
  auto_decline_conflicts boolean DEFAULT false,
  lead_time_hours integer DEFAULT 24,
  advance_booking_days integer DEFAULT 90,
  notification_preferences jsonb DEFAULT '{"booking_requests": true, "reminders": true, "conflicts": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7) Availability Analytics - Track metrics and insights
CREATE TABLE IF NOT EXISTS public.availability_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_available_hours decimal(5,2) DEFAULT 0,
  total_booked_hours decimal(5,2) DEFAULT 0,
  utilization_rate decimal(5,2) DEFAULT 0,
  booking_count integer DEFAULT 0,
  revenue_generated decimal(10,2) DEFAULT 0,
  average_booking_duration decimal(5,2) DEFAULT 0,
  peak_hours jsonb DEFAULT '[]', -- Array of popular time slots
  created_at timestamptz DEFAULT now(),
  
  -- One record per user per date
  UNIQUE(user_id, date)
);

-- 8) Calendar Export/Import Logs - Track data operations
CREATE TABLE IF NOT EXISTS public.calendar_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type text NOT NULL CHECK (operation_type IN ('export', 'import', 'sync')),
  format text, -- 'ics', 'csv', 'json'
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  file_url text,
  records_count integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security on all tables
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_operations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Calendar Entries
CREATE POLICY "Users can view own calendar entries"
  ON public.calendar_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar entries"
  ON public.calendar_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar entries"
  ON public.calendar_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar entries"
  ON public.calendar_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Time Slots
CREATE POLICY "Users can view own time slots"
  ON public.time_slots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.calendar_entries ce 
    WHERE ce.id = calendar_entry_id AND ce.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own time slots"
  ON public.time_slots FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.calendar_entries ce 
    WHERE ce.id = calendar_entry_id AND ce.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own time slots"
  ON public.time_slots FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.calendar_entries ce 
    WHERE ce.id = calendar_entry_id AND ce.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own time slots"
  ON public.time_slots FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.calendar_entries ce 
    WHERE ce.id = calendar_entry_id AND ce.user_id = auth.uid()
  ));

-- RLS Policies for Recurring Patterns
CREATE POLICY "Users can manage own recurring patterns"
  ON public.recurring_patterns FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Booking References
CREATE POLICY "Users can manage own booking references"
  ON public.booking_references FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Booking Conflicts
CREATE POLICY "Users can manage own booking conflicts"
  ON public.booking_conflicts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Privacy Settings
CREATE POLICY "Users can manage own privacy settings"
  ON public.calendar_privacy_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Analytics
CREATE POLICY "Users can view own analytics"
  ON public.availability_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics"
  ON public.availability_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Calendar Operations
CREATE POLICY "Users can manage own calendar operations"
  ON public.calendar_operations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add foreign key constraint for recurring patterns
ALTER TABLE public.calendar_entries 
ADD CONSTRAINT fk_recurring_pattern 
FOREIGN KEY (recurring_pattern_id) REFERENCES public.recurring_patterns(id);

-- Create indexes for performance
CREATE INDEX idx_calendar_entries_user_date ON public.calendar_entries(user_id, date);
CREATE INDEX idx_calendar_entries_recurring ON public.calendar_entries(recurring_pattern_id) WHERE recurring_pattern_id IS NOT NULL;
CREATE INDEX idx_time_slots_calendar_entry ON public.time_slots(calendar_entry_id);
CREATE INDEX idx_time_slots_booking ON public.time_slots(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_booking_references_user_date ON public.booking_references(user_id, booking_date);
CREATE INDEX idx_booking_conflicts_user_date ON public.booking_conflicts(user_id, affected_date);
CREATE INDEX idx_availability_analytics_user_date ON public.availability_analytics(user_id, date);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Apply triggers to all relevant tables
DROP TRIGGER IF EXISTS update_calendar_entries_updated_at ON public.calendar_entries;
CREATE TRIGGER update_calendar_entries_updated_at
  BEFORE UPDATE ON public.calendar_entries
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_slots_updated_at ON public.time_slots;
CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_recurring_patterns_updated_at ON public.recurring_patterns;
CREATE TRIGGER update_recurring_patterns_updated_at
  BEFORE UPDATE ON public.recurring_patterns
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_booking_references_updated_at ON public.booking_references;
CREATE TRIGGER update_booking_references_updated_at
  BEFORE UPDATE ON public.booking_references
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_privacy_settings_updated_at ON public.calendar_privacy_settings;
CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.calendar_privacy_settings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();