-- Community Posing Library Database Schema
-- Tables for pose sharing, EXIF data, interactions, comments, and moderation

-- 1. Community Poses Table
CREATE TABLE IF NOT EXISTS public.community_poses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_image_id uuid,
  title text NOT NULL,
  posing_tips text NOT NULL,
  difficulty_level text CHECK (difficulty_level IN ('beginner','intermediate','advanced')) NOT NULL,
  people_count integer DEFAULT 1,
  category text CHECK (category IN ('portrait','couple','family','wedding','maternity','commercial','group','creative','lifestyle','fashion')) NOT NULL,
  mood_emotion text,
  image_url text NOT NULL,
  thumbnail_url text,
  medium_url text,
  
  -- Location and context
  location_type text CHECK (location_type IN ('studio','outdoor','indoor','beach','urban','nature','home','event_venue')),
  lighting_setup text,
  story_behind text,
  
  -- Moderation
  is_approved boolean DEFAULT false,
  moderation_status text CHECK (moderation_status IN ('pending','approved','rejected','flagged')) DEFAULT 'pending',
  moderation_feedback text,
  moderated_at timestamptz,
  moderated_by uuid REFERENCES auth.users(id),
  
  -- Metrics
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  saves_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Pose Camera Data Table (EXIF)
CREATE TABLE IF NOT EXISTS public.pose_camera_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pose_id uuid NOT NULL REFERENCES public.community_poses(id) ON DELETE CASCADE,
  camera_model text,
  lens_model text,
  focal_length numeric,
  aperture numeric,
  shutter_speed text,
  iso_setting integer,
  flash_used boolean DEFAULT false,
  exif_extraction_success boolean DEFAULT false,
  manual_override boolean DEFAULT false,
  raw_exif_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Pose Equipment Table
CREATE TABLE IF NOT EXISTS public.pose_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pose_id uuid NOT NULL REFERENCES public.community_poses(id) ON DELETE CASCADE,
  equipment_name text NOT NULL,
  equipment_type text,
  created_at timestamptz DEFAULT now()
);

-- 4. Pose Interactions Table
CREATE TABLE IF NOT EXISTS public.pose_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pose_id uuid NOT NULL REFERENCES public.community_poses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text CHECK (interaction_type IN ('like','save','view','share')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pose_id, user_id, interaction_type)
);

-- 5. Pose Comments Table
CREATE TABLE IF NOT EXISTS public.pose_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pose_id uuid NOT NULL REFERENCES public.community_poses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Pose Collections Table (for saved poses)
CREATE TABLE IF NOT EXISTS public.pose_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Collection Items Table
CREATE TABLE IF NOT EXISTS public.collection_items (
  collection_id uuid NOT NULL REFERENCES public.pose_collections(id) ON DELETE CASCADE,
  pose_id uuid NOT NULL REFERENCES public.community_poses(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, pose_id)
);

-- 8. Pose Reports Table
CREATE TABLE IF NOT EXISTS public.pose_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pose_id uuid NOT NULL REFERENCES public.community_poses(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text CHECK (reason IN ('inappropriate_content','copyright_violation','spam','misleading_info','other')) NOT NULL,
  description text,
  status text CHECK (status IN ('pending','reviewed','resolved','dismissed')) DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_poses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pose_camera_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pose_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pose_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pose_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pose_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pose_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_poses
DROP POLICY IF EXISTS "Public can view approved poses" ON public.community_poses;
CREATE POLICY "Public can view approved poses"
  ON public.community_poses FOR SELECT
  USING (is_approved = true AND moderation_status = 'approved');

DROP POLICY IF EXISTS "Users can view own poses" ON public.community_poses;
CREATE POLICY "Users can view own poses"
  ON public.community_poses FOR SELECT
  USING (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Authenticated users can create poses" ON public.community_poses;
CREATE POLICY "Authenticated users can create poses"
  ON public.community_poses FOR INSERT
  WITH CHECK (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Users can update own poses" ON public.community_poses;
CREATE POLICY "Users can update own poses"
  ON public.community_poses FOR UPDATE
  USING (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Users can delete own poses" ON public.community_poses;
CREATE POLICY "Users can delete own poses"
  ON public.community_poses FOR DELETE
  USING (auth.uid() = photographer_id);

-- RLS Policies for pose_camera_data
DROP POLICY IF EXISTS "Public can view camera data" ON public.pose_camera_data;
CREATE POLICY "Public can view camera data"
  ON public.pose_camera_data FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_poses p 
    WHERE p.id = pose_id AND p.is_approved = true
  ));

DROP POLICY IF EXISTS "Users can insert camera data for own poses" ON public.pose_camera_data;
CREATE POLICY "Users can insert camera data for own poses"
  ON public.pose_camera_data FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.community_poses p 
    WHERE p.id = pose_id AND p.photographer_id = auth.uid()
  ));

-- RLS Policies for pose_equipment
DROP POLICY IF EXISTS "Public can view equipment" ON public.pose_equipment;
CREATE POLICY "Public can view equipment"
  ON public.pose_equipment FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.community_poses p 
    WHERE p.id = pose_id AND p.is_approved = true
  ));

DROP POLICY IF EXISTS "Users can insert equipment for own poses" ON public.pose_equipment;
CREATE POLICY "Users can insert equipment for own poses"
  ON public.pose_equipment FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.community_poses p 
    WHERE p.id = pose_id AND p.photographer_id = auth.uid()
  ));

-- RLS Policies for pose_interactions
DROP POLICY IF EXISTS "Users can view own interactions" ON public.pose_interactions;
CREATE POLICY "Users can view own interactions"
  ON public.pose_interactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create interactions" ON public.pose_interactions;
CREATE POLICY "Users can create interactions"
  ON public.pose_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interactions" ON public.pose_interactions;
CREATE POLICY "Users can delete own interactions"
  ON public.pose_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pose_comments
DROP POLICY IF EXISTS "Public can view comments" ON public.pose_comments;
CREATE POLICY "Public can view comments"
  ON public.pose_comments FOR SELECT
  USING (NOT is_flagged);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.pose_comments;
CREATE POLICY "Authenticated users can create comments"
  ON public.pose_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.pose_comments;
CREATE POLICY "Users can update own comments"
  ON public.pose_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.pose_comments;
CREATE POLICY "Users can delete own comments"
  ON public.pose_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for pose_collections
DROP POLICY IF EXISTS "Users can view own collections" ON public.pose_collections;
CREATE POLICY "Users can view own collections"
  ON public.pose_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can manage own collections" ON public.pose_collections;
CREATE POLICY "Users can manage own collections"
  ON public.pose_collections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for collection_items
DROP POLICY IF EXISTS "Users can view collection items" ON public.collection_items;
CREATE POLICY "Users can view collection items"
  ON public.collection_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pose_collections c 
    WHERE c.id = collection_id AND (c.user_id = auth.uid() OR c.is_public = true)
  ));

DROP POLICY IF EXISTS "Users can manage own collection items" ON public.collection_items;
CREATE POLICY "Users can manage own collection items"
  ON public.collection_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.pose_collections c 
    WHERE c.id = collection_id AND c.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pose_collections c 
    WHERE c.id = collection_id AND c.user_id = auth.uid()
  ));

-- RLS Policies for pose_reports
DROP POLICY IF EXISTS "Users can create reports" ON public.pose_reports;
CREATE POLICY "Users can create reports"
  ON public.pose_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_poses_photographer ON public.community_poses(photographer_id);
CREATE INDEX IF NOT EXISTS idx_community_poses_status ON public.community_poses(moderation_status, is_approved);
CREATE INDEX IF NOT EXISTS idx_community_poses_category ON public.community_poses(category);
CREATE INDEX IF NOT EXISTS idx_community_poses_difficulty ON public.community_poses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_community_poses_created ON public.community_poses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pose_interactions_user ON public.pose_interactions(user_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_pose_interactions_pose ON public.pose_interactions(pose_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_pose_comments_pose ON public.pose_comments(pose_id, created_at DESC);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_poses_updated_at ON public.community_poses;
CREATE TRIGGER update_community_poses_updated_at
  BEFORE UPDATE ON public.community_poses
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pose_comments_updated_at ON public.pose_comments;
CREATE TRIGGER update_pose_comments_updated_at
  BEFORE UPDATE ON public.pose_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_pose_collections_updated_at ON public.pose_collections;
CREATE TRIGGER update_pose_collections_updated_at
  BEFORE UPDATE ON public.pose_collections
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger to update interaction counts
CREATE OR REPLACE FUNCTION public.update_pose_interaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.interaction_type = 'like' THEN
      UPDATE public.community_poses SET likes_count = likes_count + 1 WHERE id = NEW.pose_id;
    ELSIF NEW.interaction_type = 'save' THEN
      UPDATE public.community_poses SET saves_count = saves_count + 1 WHERE id = NEW.pose_id;
    ELSIF NEW.interaction_type = 'view' THEN
      UPDATE public.community_poses SET views_count = views_count + 1 WHERE id = NEW.pose_id;
    ELSIF NEW.interaction_type = 'share' THEN
      UPDATE public.community_poses SET shares_count = shares_count + 1 WHERE id = NEW.pose_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.interaction_type = 'like' THEN
      UPDATE public.community_poses SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.pose_id;
    ELSIF OLD.interaction_type = 'save' THEN
      UPDATE public.community_poses SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.pose_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pose_interaction_counts ON public.pose_interactions;
CREATE TRIGGER trigger_update_pose_interaction_counts
  AFTER INSERT OR DELETE ON public.pose_interactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_pose_interaction_counts();

-- Trigger to update comment counts
CREATE OR REPLACE FUNCTION public.update_pose_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_poses SET comments_count = comments_count + 1 WHERE id = NEW.pose_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_poses SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.pose_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pose_comment_counts ON public.pose_comments;
CREATE TRIGGER trigger_update_pose_comment_counts
  AFTER INSERT OR DELETE ON public.pose_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_pose_comment_counts();

-- Enable realtime
alter publication supabase_realtime add table community_poses;
alter publication supabase_realtime add table pose_interactions;
alter publication supabase_realtime add table pose_comments;
