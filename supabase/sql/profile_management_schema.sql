-- Profile Management Complete Backend Schema
-- Extends existing profiles and professional_profiles tables with ratings, reviews, analytics, and saved profiles

-- 1) Ratings & Reviews System
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid, -- Reference to job (when job system is ready)
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_title text,
  -- Review categories for detailed feedback
  professionalism_rating integer CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  punctuality_rating integer CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  value_rating integer CHECK (value_rating >= 1 AND value_rating <= 5),
  -- Media attachments (photos from the work done)
  media_urls text[] DEFAULT '{}',
  -- Response from professional
  response_text text,
  response_at timestamptz,
  -- Verification
  is_verified boolean DEFAULT false,
  verified_job_completion boolean DEFAULT false,
  -- Helpfulness tracking
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  -- Status
  is_visible boolean DEFAULT true,
  is_flagged boolean DEFAULT false,
  flag_reason text,
  moderated_at timestamptz,
  moderator_id uuid,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(professional_id, client_id, job_id),
  CONSTRAINT rating_with_review CHECK (
    (rating >= 4) OR (review_text IS NOT NULL AND length(review_text) >= 10)
  )
);

-- 2) Review Helpfulness Tracking
CREATE TABLE IF NOT EXISTS public.review_helpfulness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES public.ratings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(review_id, user_id)
);

-- 3) Profile Views & Analytics
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Session tracking (for anonymous/repeat views)
  session_id text,
  -- Source tracking
  source text, -- 'search', 'direct', 'job_post', 'recommendation', 'featured'
  referrer_url text,
  -- Device info
  device_type text, -- 'mobile', 'tablet', 'desktop'
  user_agent text,
  -- Location (if available)
  city text,
  state text,
  country text DEFAULT 'India',
  -- Timestamps
  viewed_at timestamptz DEFAULT now(),
  session_duration integer, -- seconds spent on profile
  
  -- Index for analytics queries
  CONSTRAINT valid_duration CHECK (session_duration IS NULL OR session_duration >= 0)
);

-- 4) Profile Analytics Aggregates (for dashboard performance)
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  professional_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- View metrics
  total_views integer DEFAULT 0,
  unique_viewers integer DEFAULT 0,
  views_this_week integer DEFAULT 0,
  views_this_month integer DEFAULT 0,
  average_session_duration integer DEFAULT 0,
  -- Engagement metrics
  profile_saves_count integer DEFAULT 0,
  contact_requests_count integer DEFAULT 0,
  job_inquiries_count integer DEFAULT 0,
  -- Conversion metrics
  conversion_rate decimal(5,2) DEFAULT 0, -- views to contact rate
  -- Rating metrics
  average_rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  rating_distribution jsonb DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
  -- Profile completion
  profile_completion_percent integer DEFAULT 0,
  -- Trending score (algorithm-based)
  trending_score decimal(10,2) DEFAULT 0,
  -- Response metrics
  average_response_time integer, -- minutes
  response_rate decimal(5,2), -- percentage
  -- Timestamps
  last_calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5) Saved Profiles (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Optional note
  note text,
  -- Collection/folder support
  collection_name text,
  -- Timestamps
  saved_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, professional_id)
);

-- 6) Portfolio Items (for professional profiles)
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  -- Media
  image_url text NOT NULL,
  thumbnail_url text,
  -- Categorization
  category text, -- matches professional categories
  tags text[] DEFAULT '{}',
  -- EXIF data for photography work
  camera_model text,
  lens_model text,
  exif_data jsonb,
  -- Ordering
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  -- Visibility
  is_visible boolean DEFAULT true,
  -- Engagement
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_order CHECK (display_order >= 0)
);

-- 7) Professional Verification Status
CREATE TABLE IF NOT EXISTS public.verification_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Verification types
  email_verified boolean DEFAULT false,
  phone_verified boolean DEFAULT false,
  identity_verified boolean DEFAULT false,
  professional_verified boolean DEFAULT false,
  -- Identity documents
  id_document_type text, -- 'aadhar', 'pan', 'driving_license', 'passport'
  id_document_url text,
  id_verified_at timestamptz,
  -- Professional credentials
  credential_type text, -- 'certification', 'license', 'membership'
  credential_document_url text,
  credential_verified_at timestamptz,
  -- Verification dates
  email_verified_at timestamptz,
  phone_verified_at timestamptz,
  -- Verification badges
  is_top_rated boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  badge_earned_at timestamptz,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8) Contact Requests Tracking
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid, -- Optional job context
  request_message text,
  contact_method text, -- 'phone', 'email', 'whatsapp', 'message'
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  -- Contact info sharing
  contact_shared boolean DEFAULT false,
  contact_shared_at timestamptz,
  -- Response
  response_message text,
  responded_at timestamptz,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  
  UNIQUE(professional_id, requester_id, job_id)
);

-- Enable Row Level Security
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpfulness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Ratings
CREATE POLICY "Public can view approved ratings"
  ON public.ratings FOR SELECT
  USING (is_visible = true AND is_flagged = false);

CREATE POLICY "Users can create ratings for jobs they completed"
  ON public.ratings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own ratings within 7 days"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = client_id AND created_at > now() - interval '7 days');

CREATE POLICY "Professionals can respond to their ratings"
  ON public.ratings FOR UPDATE
  USING (auth.uid() = professional_id)
  WITH CHECK (response_text IS NOT NULL);

-- RLS Policies for Review Helpfulness
CREATE POLICY "Users can mark reviews helpful"
  ON public.review_helpfulness FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Profile Views
CREATE POLICY "Anyone can insert profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Professionals can view own analytics"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = professional_id);

-- RLS Policies for Profile Analytics
CREATE POLICY "Professionals can view own analytics"
  ON public.profile_analytics FOR SELECT
  USING (auth.uid() = professional_id);

CREATE POLICY "System can update analytics"
  ON public.profile_analytics FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for Saved Profiles
CREATE POLICY "Users can manage own saved profiles"
  ON public.saved_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professionals can see who saved them"
  ON public.saved_profiles FOR SELECT
  USING (auth.uid() = professional_id);

-- RLS Policies for Portfolio Items
CREATE POLICY "Public can view visible portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can manage own portfolio"
  ON public.portfolio_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Verification Status
CREATE POLICY "Public can view verification badges"
  ON public.verification_status FOR SELECT
  USING (true);

CREATE POLICY "Users can view own verification details"
  ON public.verification_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON public.verification_status FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Contact Requests
CREATE POLICY "Users can view own contact requests"
  ON public.contact_requests FOR SELECT
  USING (auth.uid() = professional_id OR auth.uid() = requester_id);

CREATE POLICY "Users can create contact requests"
  ON public.contact_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Professionals can respond to requests"
  ON public.contact_requests FOR UPDATE
  USING (auth.uid() = professional_id);

-- Create Indexes for Performance
CREATE INDEX idx_ratings_professional ON public.ratings(professional_id, is_visible, created_at DESC);
CREATE INDEX idx_ratings_rating ON public.ratings(rating, is_visible);
CREATE INDEX idx_profile_views_professional ON public.profile_views(professional_id, viewed_at DESC);
CREATE INDEX idx_profile_views_viewer ON public.profile_views(viewer_id, viewed_at DESC);
CREATE INDEX idx_saved_profiles_user ON public.saved_profiles(user_id, saved_at DESC);
CREATE INDEX idx_saved_profiles_professional ON public.saved_profiles(professional_id);
CREATE INDEX idx_portfolio_items_user ON public.portfolio_items(user_id, display_order);
CREATE INDEX idx_portfolio_items_featured ON public.portfolio_items(is_featured, is_visible);
CREATE INDEX idx_contact_requests_professional ON public.contact_requests(professional_id, status, created_at DESC);
CREATE INDEX idx_contact_requests_requester ON public.contact_requests(requester_id, created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_profile_analytics_updated_at
  BEFORE UPDATE ON public.profile_analytics
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_verification_status_updated_at
  BEFORE UPDATE ON public.verification_status
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Trigger to update review counts when rating is added
CREATE OR REPLACE FUNCTION public.update_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update professional profile rating stats
    UPDATE public.profile_analytics
    SET 
      total_reviews = total_reviews + 1,
      average_rating = (
        SELECT AVG(rating)::decimal(3,2)
        FROM public.ratings
        WHERE professional_id = NEW.professional_id
          AND is_visible = true
      ),
      rating_distribution = (
        SELECT jsonb_build_object(
          '1', COUNT(*) FILTER (WHERE rating = 1),
          '2', COUNT(*) FILTER (WHERE rating = 2),
          '3', COUNT(*) FILTER (WHERE rating = 3),
          '4', COUNT(*) FILTER (WHERE rating = 4),
          '5', COUNT(*) FILTER (WHERE rating = 5)
        )
        FROM public.ratings
        WHERE professional_id = NEW.professional_id
          AND is_visible = true
      ),
      updated_at = now()
    WHERE professional_id = NEW.professional_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Recalculate if visibility changed
    IF OLD.is_visible != NEW.is_visible THEN
      UPDATE public.profile_analytics
      SET 
        total_reviews = (
          SELECT COUNT(*)
          FROM public.ratings
          WHERE professional_id = NEW.professional_id
            AND is_visible = true
        ),
        average_rating = (
          SELECT AVG(rating)::decimal(3,2)
          FROM public.ratings
          WHERE professional_id = NEW.professional_id
            AND is_visible = true
        ),
        rating_distribution = (
          SELECT jsonb_build_object(
            '1', COUNT(*) FILTER (WHERE rating = 1),
            '2', COUNT(*) FILTER (WHERE rating = 2),
            '3', COUNT(*) FILTER (WHERE rating = 3),
            '4', COUNT(*) FILTER (WHERE rating = 4),
            '5', COUNT(*) FILTER (WHERE rating = 5)
          )
          FROM public.ratings
          WHERE professional_id = NEW.professional_id
            AND is_visible = true
        ),
        updated_at = now()
      WHERE professional_id = NEW.professional_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_rating_aggregates ON public.ratings;
CREATE TRIGGER trigger_update_rating_aggregates
  AFTER INSERT OR UPDATE ON public.ratings
  FOR EACH ROW EXECUTE PROCEDURE public.update_rating_aggregates();

-- Trigger to track profile views
CREATE OR REPLACE FUNCTION public.track_profile_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Update view count in portfolio items if applicable
  UPDATE public.profile_analytics
  SET 
    total_views = total_views + 1,
    views_this_week = views_this_week + 1,
    views_this_month = views_this_month + 1,
    updated_at = now()
  WHERE professional_id = NEW.professional_id;
  
  -- Create analytics record if doesn't exist
  INSERT INTO public.profile_analytics (professional_id, total_views)
  VALUES (NEW.professional_id, 1)
  ON CONFLICT (professional_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_track_profile_view ON public.profile_views;
CREATE TRIGGER trigger_track_profile_view
  AFTER INSERT ON public.profile_views
  FOR EACH ROW EXECUTE PROCEDURE public.track_profile_view();

-- Function to initialize profile analytics for existing users
CREATE OR REPLACE FUNCTION public.initialize_profile_analytics()
RETURNS void AS $$
BEGIN
  INSERT INTO public.profile_analytics (professional_id)
  SELECT id FROM auth.users
  ON CONFLICT (professional_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize verification status for existing users
CREATE OR REPLACE FUNCTION public.initialize_verification_status()
RETURNS void AS $$
BEGIN
  INSERT INTO public.verification_status (user_id, email_verified)
  SELECT id, (email_confirmed_at IS NOT NULL)
  FROM auth.users
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
