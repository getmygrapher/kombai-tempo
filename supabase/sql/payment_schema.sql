-- Payment Integration - Database Schema
-- Subscription management and payment tracking for Pro tier

-- 1) Create subscription_tiers table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
  tier text PRIMARY KEY,
  name text NOT NULL,
  price_monthly numeric NOT NULL,
  price_yearly numeric NOT NULL,
  features jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Insert tier data
INSERT INTO public.subscription_tiers (tier, name, price_monthly, price_yearly, features) 
VALUES
  (
    'free', 
    'Free', 
    0, 
    0, 
    '{
      "job_posts_per_month": 1, 
      "job_accepts_per_month": 1, 
      "search_radius_km": 25, 
      "messaging_limit": 10,
      "portfolio_images": 5,
      "calendar_privacy": false,
      "instagram_integration": false,
      "advanced_search": false,
      "priority_support": false
    }'::jsonb
  ),
  (
    'pro', 
    'Pro', 
    299, 
    2999, 
    '{
      "job_posts_per_month": -1, 
      "job_accepts_per_month": -1, 
      "search_radius_km": 500, 
      "messaging_limit": -1,
      "portfolio_images": -1,
      "calendar_privacy": true,
      "instagram_integration": true,
      "advanced_search": true,
      "priority_support": true,
      "verified_badge": true,
      "analytics_dashboard": true
    }'::jsonb
  )
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  updated_at = now();

-- 3) Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier text NOT NULL REFERENCES public.subscription_tiers(tier),
  billing_period text CHECK (billing_period IN ('monthly','yearly')) NOT NULL,
  status text CHECK (status IN ('active','cancelled','expired','grace_period','pending')) NOT NULL DEFAULT 'pending',
  start_date timestamptz,
  end_date timestamptz,
  auto_renew boolean DEFAULT true,
  razorpay_subscription_id text,
  razorpay_plan_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'INR',
  status text CHECK (status IN ('pending','success','failed','refunded')) NOT NULL DEFAULT 'pending',
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_signature text,
  payment_method text,
  failure_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5) Create usage_tracking table for free tier limits
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  usage_count integer DEFAULT 0,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature, period_start)
);

-- Enable Row Level Security
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (public read)
DROP POLICY IF EXISTS "Anyone can read subscription tiers" ON public.subscription_tiers;
CREATE POLICY "Anyone can read subscription tiers"
  ON public.subscription_tiers FOR SELECT
  USING (is_active = true);

-- RLS Policies for subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON public.payments;
CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for usage_tracking
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
CREATE POLICY "Users can view own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own usage" ON public.usage_tracking;
CREATE POLICY "Users can manage own usage"
  ON public.usage_tracking FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
  ON public.subscriptions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date 
  ON public.subscriptions(end_date) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_payments_user 
  ON public.payments(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_subscription 
  ON public.payments(subscription_id);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature 
  ON public.usage_tracking(user_id, feature, period_start);

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON public.usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check and expire subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS void AS $$
BEGIN
  UPDATE public.subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < now()
    AND auto_renew = false;
END;
$$ LANGUAGE plpgsql;
