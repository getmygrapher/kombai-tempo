-- Availability Management RPC Functions
-- Advanced functions for availability management operations

-- 1) Get availability for date range with time slots
CREATE OR REPLACE FUNCTION public.get_availability_with_slots(
  start_date date,
  end_date date
)
RETURNS TABLE (
  entry_id uuid,
  date date,
  status text,
  is_recurring boolean,
  notes text,
  time_slots jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    ce.id as entry_id,
    ce.date,
    ce.status,
    ce.is_recurring,
    ce.notes,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', ts.id,
          'start_time', ts.start_time,
          'end_time', ts.end_time,
          'status', ts.status,
          'is_booked', ts.is_booked,
          'job_title', ts.job_title,
          'client_name', ts.client_name,
          'rate_per_hour', ts.rate_per_hour
        )
        ORDER BY ts.start_time
      ) FILTER (WHERE ts.id IS NOT NULL),
      '[]'::jsonb
    ) as time_slots
  FROM public.calendar_entries ce
  LEFT JOIN public.time_slots ts ON ce.id = ts.calendar_entry_id
  WHERE ce.user_id = uid
    AND ce.date BETWEEN start_date AND end_date
  GROUP BY ce.id, ce.date, ce.status, ce.is_recurring, ce.notes
  ORDER BY ce.date;
END;
$$;

-- 2) Set availability for multiple dates with time slots
CREATE OR REPLACE FUNCTION public.set_availability_bulk(
  availability_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  entry_record jsonb;
  slot_record jsonb;
  calendar_entry_id uuid;
  result jsonb := '{"success": true, "entries_created": 0, "slots_created": 0}'::jsonb;
  entries_count integer := 0;
  slots_count integer := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Loop through each availability entry
  FOR entry_record IN SELECT * FROM jsonb_array_elements(availability_data)
  LOOP
    -- Insert or update calendar entry
    INSERT INTO public.calendar_entries (
      user_id, date, status, is_recurring, recurring_pattern_id, notes
    )
    VALUES (
      uid,
      (entry_record->>'date')::date,
      entry_record->>'status',
      COALESCE((entry_record->>'is_recurring')::boolean, false),
      CASE WHEN entry_record->>'recurring_pattern_id' != '' 
           THEN (entry_record->>'recurring_pattern_id')::uuid 
           ELSE NULL END,
      entry_record->>'notes'
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      status = EXCLUDED.status,
      is_recurring = EXCLUDED.is_recurring,
      recurring_pattern_id = EXCLUDED.recurring_pattern_id,
      notes = EXCLUDED.notes,
      updated_at = now()
    RETURNING id INTO calendar_entry_id;

    entries_count := entries_count + 1;

    -- Delete existing time slots for this entry
    DELETE FROM public.time_slots WHERE calendar_entry_id = calendar_entry_id;

    -- Insert new time slots if provided
    IF entry_record ? 'time_slots' THEN
      FOR slot_record IN SELECT * FROM jsonb_array_elements(entry_record->'time_slots')
      LOOP
        INSERT INTO public.time_slots (
          calendar_entry_id, start_time, end_time, status, 
          is_booked, job_id, job_title, client_name, rate_per_hour, notes
        )
        VALUES (
          calendar_entry_id,
          (slot_record->>'start_time')::time,
          (slot_record->>'end_time')::time,
          slot_record->>'status',
          COALESCE((slot_record->>'is_booked')::boolean, false),
          CASE WHEN slot_record->>'job_id' != '' 
               THEN (slot_record->>'job_id')::uuid 
               ELSE NULL END,
          slot_record->>'job_title',
          slot_record->>'client_name',
          CASE WHEN slot_record->>'rate_per_hour' != '' 
               THEN (slot_record->>'rate_per_hour')::decimal 
               ELSE NULL END,
          slot_record->>'notes'
        );
        slots_count := slots_count + 1;
      END LOOP;
    END IF;
  END LOOP;

  -- Update result counts
  result := jsonb_set(result, '{entries_created}', entries_count::text::jsonb);
  result := jsonb_set(result, '{slots_created}', slots_count::text::jsonb);

  RETURN result;
END;
$$;

-- 3) Apply recurring pattern to date range
CREATE OR REPLACE FUNCTION public.apply_recurring_pattern(
  pattern_id uuid,
  start_date date,
  end_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  pattern_record public.recurring_patterns%ROWTYPE;
  date_cursor date;
  day_name text;
  day_schedule jsonb;
  slot_record jsonb;
  calendar_entry_id uuid;
  entries_created integer := 0;
  slots_created integer := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get the recurring pattern
  SELECT * INTO pattern_record
  FROM public.recurring_patterns
  WHERE id = pattern_id AND user_id = uid AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring pattern not found or inactive';
  END IF;

  -- Loop through date range
  date_cursor := start_date;
  WHILE date_cursor <= end_date LOOP
    -- Skip if date is in exceptions
    IF NOT EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(pattern_record.exceptions) AS ex_date
      WHERE ex_date = date_cursor::text
    ) THEN
      
      -- Get day name (lowercase)
      day_name := lower(to_char(date_cursor, 'Day'));
      day_name := trim(day_name);

      -- Check if pattern has schedule for this day
      IF pattern_record.schedule ? day_name THEN
        day_schedule := pattern_record.schedule->day_name;

        -- Create calendar entry
        INSERT INTO public.calendar_entries (
          user_id, date, status, is_recurring, recurring_pattern_id
        )
        VALUES (
          uid, date_cursor, 'available', true, pattern_id
        )
        ON CONFLICT (user_id, date)
        DO UPDATE SET
          status = 'available',
          is_recurring = true,
          recurring_pattern_id = pattern_id,
          updated_at = now()
        RETURNING id INTO calendar_entry_id;

        entries_created := entries_created + 1;

        -- Delete existing time slots
        DELETE FROM public.time_slots WHERE calendar_entry_id = calendar_entry_id;

        -- Create time slots from pattern
        FOR slot_record IN SELECT * FROM jsonb_array_elements(day_schedule)
        LOOP
          INSERT INTO public.time_slots (
            calendar_entry_id, start_time, end_time, status
          )
          VALUES (
            calendar_entry_id,
            (slot_record->>'start')::time,
            (slot_record->>'end')::time,
            'available'
          );
          slots_created := slots_created + 1;
        END LOOP;
      END IF;
    END IF;

    date_cursor := date_cursor + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'pattern_id', pattern_id,
    'entries_created', entries_created,
    'slots_created', slots_created,
    'date_range', jsonb_build_object(
      'start', start_date,
      'end', end_date
    )
  );
END;
$$;

-- 4) Detect and resolve booking conflicts
CREATE OR REPLACE FUNCTION public.detect_booking_conflicts(
  booking_date date,
  start_time time,
  end_time time,
  job_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  conflict_record record;
  conflicts jsonb := '[]'::jsonb;
  conflict_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Check for overlapping time slots
  FOR conflict_record IN
    SELECT ts.*, ce.date, br.job_title as existing_job_title
    FROM public.time_slots ts
    JOIN public.calendar_entries ce ON ts.calendar_entry_id = ce.id
    LEFT JOIN public.booking_references br ON ts.job_id = br.job_id
    WHERE ce.user_id = uid
      AND ce.date = booking_date
      AND ts.status IN ('booked', 'blocked')
      AND (
        (ts.start_time, ts.end_time) OVERLAPS (start_time, end_time)
      )
      AND (job_id IS NULL OR ts.job_id != job_id)
  LOOP
    -- Create conflict record
    INSERT INTO public.booking_conflicts (
      user_id, conflict_type, primary_booking_id, affected_date,
      affected_time_start, affected_time_end
    )
    VALUES (
      uid, 'overlap', conflict_record.job_id, booking_date,
      GREATEST(conflict_record.start_time, start_time),
      LEAST(conflict_record.end_time, end_time)
    )
    RETURNING id INTO conflict_id;

    -- Add to conflicts array
    conflicts := conflicts || jsonb_build_object(
      'id', conflict_id,
      'type', 'overlap',
      'existing_job_id', conflict_record.job_id,
      'existing_job_title', conflict_record.existing_job_title,
      'conflict_start', GREATEST(conflict_record.start_time, start_time),
      'conflict_end', LEAST(conflict_record.end_time, end_time)
    );
  END LOOP;

  RETURN jsonb_build_object(
    'has_conflicts', jsonb_array_length(conflicts) > 0,
    'conflicts', conflicts
  );
END;
$$;

-- 5) Update booking status and sync with availability
CREATE OR REPLACE FUNCTION public.update_booking_status(
  booking_id uuid,
  new_status text,
  booking_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  booking_record public.booking_references%ROWTYPE;
  calendar_entry_id uuid;
  slot_status text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Get booking record
  SELECT * INTO booking_record
  FROM public.booking_references
  WHERE id = booking_id AND user_id = uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  -- Update booking status
  UPDATE public.booking_references
  SET 
    status = new_status,
    confirmed_at = CASE WHEN new_status = 'confirmed_booked' THEN now() ELSE confirmed_at END,
    updated_at = now()
  WHERE id = booking_id;

  -- Determine slot status based on booking status
  slot_status := CASE 
    WHEN new_status = 'confirmed_booked' THEN 'booked'
    WHEN new_status = 'cancelled' THEN 'available'
    ELSE 'available'
  END;

  -- Find or create calendar entry
  INSERT INTO public.calendar_entries (user_id, date, status)
  VALUES (uid, booking_record.booking_date, 'partial')
  ON CONFLICT (user_id, date)
  DO UPDATE SET updated_at = now()
  RETURNING id INTO calendar_entry_id;

  -- Update or create time slot
  INSERT INTO public.time_slots (
    calendar_entry_id, start_time, end_time, status, is_booked,
    job_id, job_title, client_name
  )
  VALUES (
    calendar_entry_id,
    booking_record.start_time,
    booking_record.end_time,
    slot_status,
    new_status = 'confirmed_booked',
    booking_record.job_id,
    booking_record.job_title,
    booking_record.client_name
  )
  ON CONFLICT (calendar_entry_id, start_time, end_time)
  DO UPDATE SET
    status = EXCLUDED.status,
    is_booked = EXCLUDED.is_booked,
    job_id = EXCLUDED.job_id,
    job_title = EXCLUDED.job_title,
    client_name = EXCLUDED.client_name,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'booking_id', booking_id,
    'new_status', new_status,
    'calendar_updated', true
  );
END;
$$;

-- 6) Get availability statistics for date range
CREATE OR REPLACE FUNCTION public.get_availability_stats(
  start_date date,
  end_date date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  stats_record record;
  result jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT 
    COUNT(DISTINCT ce.date) as total_days,
    COUNT(DISTINCT CASE WHEN ce.status = 'available' THEN ce.date END) as available_days,
    COUNT(DISTINCT CASE WHEN ce.status = 'booked' THEN ce.date END) as booked_days,
    COALESCE(SUM(
      EXTRACT(EPOCH FROM (ts.end_time - ts.start_time)) / 3600
    ) FILTER (WHERE ts.status = 'available'), 0) as total_available_hours,
    COALESCE(SUM(
      EXTRACT(EPOCH FROM (ts.end_time - ts.start_time)) / 3600
    ) FILTER (WHERE ts.status = 'booked'), 0) as total_booked_hours,
    COUNT(ts.id) FILTER (WHERE ts.status = 'booked') as total_bookings,
    COALESCE(AVG(
      EXTRACT(EPOCH FROM (ts.end_time - ts.start_time)) / 3600
    ) FILTER (WHERE ts.status = 'booked'), 0) as avg_booking_duration
  INTO stats_record
  FROM public.calendar_entries ce
  LEFT JOIN public.time_slots ts ON ce.id = ts.calendar_entry_id
  WHERE ce.user_id = uid
    AND ce.date BETWEEN start_date AND end_date;

  -- Calculate utilization rate
  result := jsonb_build_object(
    'total_days', COALESCE(stats_record.total_days, 0),
    'available_days', COALESCE(stats_record.available_days, 0),
    'booked_days', COALESCE(stats_record.booked_days, 0),
    'total_available_hours', COALESCE(stats_record.total_available_hours, 0),
    'total_booked_hours', COALESCE(stats_record.total_booked_hours, 0),
    'utilization_rate', CASE 
      WHEN COALESCE(stats_record.total_available_hours, 0) > 0 
      THEN ROUND((COALESCE(stats_record.total_booked_hours, 0) / stats_record.total_available_hours) * 100, 2)
      ELSE 0 
    END,
    'total_bookings', COALESCE(stats_record.total_bookings, 0),
    'avg_booking_duration', ROUND(COALESCE(stats_record.avg_booking_duration, 0), 2)
  );

  RETURN result;
END;
$$;

-- 7) Export calendar data in various formats
CREATE OR REPLACE FUNCTION public.export_calendar_data(
  start_date date,
  end_date date,
  format_type text DEFAULT 'json'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  export_data jsonb;
  operation_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Create export operation record
  INSERT INTO public.calendar_operations (
    user_id, operation_type, format, status
  )
  VALUES (uid, 'export', format_type, 'pending')
  RETURNING id INTO operation_id;

  -- Get calendar data
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', ce.date,
      'status', ce.status,
      'is_recurring', ce.is_recurring,
      'notes', ce.notes,
      'time_slots', COALESCE(
        (SELECT jsonb_agg(
          jsonb_build_object(
            'start_time', ts.start_time,
            'end_time', ts.end_time,
            'status', ts.status,
            'is_booked', ts.is_booked,
            'job_title', ts.job_title,
            'client_name', ts.client_name
          )
        )
        FROM public.time_slots ts
        WHERE ts.calendar_entry_id = ce.id
        ), '[]'::jsonb
      )
    )
  )
  INTO export_data
  FROM public.calendar_entries ce
  WHERE ce.user_id = uid
    AND ce.date BETWEEN start_date AND end_date
  ORDER BY ce.date;

  -- Update operation status
  UPDATE public.calendar_operations
  SET 
    status = 'completed',
    records_count = jsonb_array_length(COALESCE(export_data, '[]'::jsonb)),
    completed_at = now()
  WHERE id = operation_id;

  RETURN jsonb_build_object(
    'success', true,
    'operation_id', operation_id,
    'format', format_type,
    'records_count', jsonb_array_length(COALESCE(export_data, '[]'::jsonb)),
    'data', export_data
  );
END;
$$;

-- 8) Initialize default privacy settings for user
CREATE OR REPLACE FUNCTION public.initialize_calendar_privacy()
RETURNS public.calendar_privacy_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  result public.calendar_privacy_settings;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.calendar_privacy_settings (user_id)
  VALUES (uid)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING * INTO result;

  -- If no insert happened (conflict), get existing record
  IF result IS NULL THEN
    SELECT * INTO result
    FROM public.calendar_privacy_settings
    WHERE user_id = uid;
  END IF;

  RETURN result;
END;
$$;