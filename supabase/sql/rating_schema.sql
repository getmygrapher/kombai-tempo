-- Rating & Review System - Additional Schema
-- This extends the existing ratings table from profile_management_schema.sql
-- The ratings table already exists with columns: professional_id, client_id, job_id, etc.

-- Note: The main ratings table is already created in profile_management_schema.sql
-- This file only adds the rating_stats table for aggregated statistics

-- 1) Create rating_stats table for aggregated statistics
CREATE TABLE IF NOT EXISTS public.rating_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  average_rating numeric(3,2) DEFAULT 0,
  total_ratings integer DEFAULT 0,
  rating_distribution jsonb DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rating_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rating_stats
DROP POLICY IF EXISTS "Anyone can view rating stats" ON public.rating_stats;
CREATE POLICY "Anyone can view rating stats"
  ON public.rating_stats FOR SELECT
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rating_stats_user 
  ON public.rating_stats(user_id);

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_rating_stats_updated_at ON public.rating_stats;
CREATE TRIGGER update_rating_stats_updated_at
  BEFORE UPDATE ON public.rating_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function to auto-update rating_stats
-- This works with the existing ratings table that uses professional_id and client_id
CREATE OR REPLACE FUNCTION update_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating numeric;
  v_total_ratings integer;
  v_distribution jsonb;
  v_user_id uuid;
BEGIN
  -- Determine which user's stats to update (the professional being rated)
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.professional_id;
  ELSE
    v_user_id := NEW.professional_id;
  END IF;
  
  -- Calculate average rating for visible ratings only
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg_rating, v_total_ratings
  FROM public.ratings
  WHERE professional_id = v_user_id
    AND is_visible = true
    AND is_flagged = false;
  
  -- Calculate rating distribution
  SELECT jsonb_build_object(
    '1', COUNT(*) FILTER (WHERE rating = 1),
    '2', COUNT(*) FILTER (WHERE rating = 2),
    '3', COUNT(*) FILTER (WHERE rating = 3),
    '4', COUNT(*) FILTER (WHERE rating = 4),
    '5', COUNT(*) FILTER (WHERE rating = 5)
  )
  INTO v_distribution
  FROM public.ratings
  WHERE professional_id = v_user_id
    AND is_visible = true
    AND is_flagged = false;
  
  -- Insert or update rating_stats
  INSERT INTO public.rating_stats (
    user_id,
    average_rating,
    total_ratings,
    rating_distribution,
    updated_at
  ) VALUES (
    v_user_id,
    v_avg_rating,
    v_total_ratings,
    v_distribution,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    average_rating = v_avg_rating,
    total_ratings = v_total_ratings,
    rating_distribution = v_distribution,
    updated_at = now();
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update rating_stats
DROP TRIGGER IF EXISTS trigger_update_rating_stats ON public.ratings;
CREATE TRIGGER trigger_update_rating_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_rating_stats();
