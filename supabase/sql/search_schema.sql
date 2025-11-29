-- Search & Discovery System - Database Schema
-- Adds full-text search capabilities to professional profiles and community poses

-- 1) Add search_vector column to professional_profiles for full-text search
ALTER TABLE public.professional_profiles 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2) Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector 
  ON public.professional_profiles USING GIN (search_vector);

-- 3) Create trigger function to update search_vector
CREATE OR REPLACE FUNCTION update_profile_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.selected_type, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.selected_category, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.specializations, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.state, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4) Create trigger to auto-update search_vector
DROP TRIGGER IF EXISTS trigger_update_profile_search_vector ON public.professional_profiles;
CREATE TRIGGER trigger_update_profile_search_vector
  BEFORE INSERT OR UPDATE OF selected_type, selected_category, specializations, city, state 
  ON public.professional_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_profile_search_vector();

-- 5) Backfill existing profiles with search_vector data
UPDATE public.professional_profiles
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(selected_type, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(selected_category, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(array_to_string(specializations, ' '), '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(city, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(state, '')), 'C')
WHERE search_vector IS NULL;

-- 6) Add search_vector to community_poses table
ALTER TABLE public.community_poses 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 7) Create GIN index for pose search
CREATE INDEX IF NOT EXISTS idx_poses_search_vector 
  ON public.community_poses USING GIN (search_vector);

-- 8) Create trigger function to update pose search_vector
CREATE OR REPLACE FUNCTION update_pose_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.story_behind, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.posing_tips, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9) Create trigger to auto-update pose search_vector
DROP TRIGGER IF EXISTS trigger_update_pose_search_vector ON public.community_poses;
CREATE TRIGGER trigger_update_pose_search_vector
  BEFORE INSERT OR UPDATE OF title, story_behind, posing_tips, category 
  ON public.community_poses
  FOR EACH ROW 
  EXECUTE FUNCTION update_pose_search_vector();

-- 10) Backfill existing poses with search_vector data
UPDATE public.community_poses
SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(story_behind, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(posing_tips, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'B')
WHERE search_vector IS NULL;
