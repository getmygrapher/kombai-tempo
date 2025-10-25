-- Job Posting & Discovery System - Backend Schema
-- Run in Supabase SQL editor to create job-related tables, indexes, RLS policies, and triggers

-- 1) Job Categories (optional taxonomy for discovery)
CREATE TABLE IF NOT EXISTS public.job_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  subcategories text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Jobs - Core job posting table
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,                         -- e.g., Photography, Videography, etc.
  professional_types text[] DEFAULT '{}'::text[],
  date date,                             -- primary job date
  end_date date,                         -- optional end date (multi-day jobs)
  time_slots jsonb DEFAULT '[]',         -- array of { start, end, status }
  urgency text CHECK (urgency IN ('Normal','Urgent','Emergency')) DEFAULT 'Normal',
  status text CHECK (status IN ('draft','active','closed','expired','completed')) DEFAULT 'active',
  approved boolean DEFAULT true,         -- moderation flag; public read if true

  -- Location fields
  location_city text,
  location_state text,
  location_pin_code text,
  location_address text,
  location_lat double precision,         -- for proximity search
  location_lng double precision,

  -- Budget fields
  budget_min numeric,
  budget_max numeric,
  budget_currency text DEFAULT 'INR',
  budget_type text CHECK (budget_type IN ('fixed','hourly','project')) DEFAULT 'fixed',
  budget_is_negotiable boolean DEFAULT false,

  -- Meta
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- 3) Job Applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text,
  proposed_rate numeric,
  currency text DEFAULT 'INR',
  status text CHECK (status IN ('pending','under_review','shortlisted','rejected','hired','withdrawn')) DEFAULT 'pending',
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Job Saves (Bookmarks)
CREATE TABLE IF NOT EXISTS public.job_saves (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

-- 5) Job Views (optional; used for analytics)
CREATE TABLE IF NOT EXISTS public.job_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  viewer_id uuid, -- NULL allowed for anonymous views
  viewed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_categories (read-only public)
DROP POLICY IF EXISTS "Public can read job categories" ON public.job_categories;
CREATE POLICY "Public can read job categories"
  ON public.job_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage job categories" ON public.job_categories;
CREATE POLICY "Admins can manage job categories"
  ON public.job_categories FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for jobs
DROP POLICY IF EXISTS "Public can view approved active jobs" ON public.jobs;
CREATE POLICY "Public can view approved active jobs"
  ON public.jobs FOR SELECT
  USING (approved = true AND status = 'active');

DROP POLICY IF EXISTS "Users can view own jobs" ON public.jobs;
CREATE POLICY "Users can view own jobs"
  ON public.jobs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert own jobs" ON public.jobs;
CREATE POLICY "Authenticated users can insert own jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Job owner can update jobs" ON public.jobs;
CREATE POLICY "Job owner can update jobs"
  ON public.jobs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Job owner can delete jobs" ON public.jobs;
CREATE POLICY "Job owner can delete jobs"
  ON public.jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for job_applications
DROP POLICY IF EXISTS "Job owner or applicant can view applications" ON public.job_applications;
CREATE POLICY "Job owner or applicant can view applications"
  ON public.job_applications FOR SELECT
  USING (
    auth.uid() = applicant_id OR
    EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Applicants can create their applications" ON public.job_applications;
CREATE POLICY "Applicants can create their applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Job owner can update application status" ON public.job_applications;
CREATE POLICY "Job owner can update application status"
  ON public.job_applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.user_id = auth.uid()
  ));

-- RLS Policies for job_saves
DROP POLICY IF EXISTS "Users can manage their job saves" ON public.job_saves;
CREATE POLICY "Users can manage their job saves"
  ON public.job_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for job_views (allow authenticated inserts; public read not needed)
DROP POLICY IF EXISTS "Users can insert job views" ON public.job_views;
CREATE POLICY "Users can insert job views"
  ON public.job_views FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON public.jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_date_urgency ON public.jobs(date, urgency);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON public.jobs(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_jobs_prof_types ON public.jobs USING GIN (professional_types);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id, status);
CREATE INDEX IF NOT EXISTS idx_job_saves_user ON public.job_saves(user_id);

-- Triggers for updated_at timestamps
-- Reuse common helper if exists; else create
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Auto-increment view_count when a job_view is inserted
CREATE OR REPLACE FUNCTION public.track_job_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.jobs SET view_count = COALESCE(view_count,0) + 1, updated_at = now()
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_track_job_view ON public.job_views;
CREATE TRIGGER trigger_track_job_view
  AFTER INSERT ON public.job_views
  FOR EACH ROW EXECUTE PROCEDURE public.track_job_view();