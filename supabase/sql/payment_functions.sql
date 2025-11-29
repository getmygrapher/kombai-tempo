-- Payment Integration - RPC Functions
-- Functions for subscription management and payment processing

-- 1) Get current user's subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status()
RETURNS TABLE (
  subscription_id uuid,
  tier text,
  billing_period text,
  status text,
  start_date timestamptz,
  end_date timestamptz,
  auto_renew boolean,
  features jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as subscription_id,
    s.tier,
    s.billing_period,
    s.status,
    s.start_date,
    s.end_date,
    s.auto_renew,
    st.features
  FROM public.subscriptions s
  JOIN public.subscription_tiers st ON s.tier = st.tier
  WHERE s.user_id = auth.uid()
    AND s.status IN ('active', 'grace_period')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, return free tier
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      NULL::uuid as subscription_id,
      'free'::text as tier,
      NULL::text as billing_period,
      'active'::text as status,
      NULL::timestamptz as start_date,
      NULL::timestamptz as end_date,
      false as auto_renew,
      st.features
    FROM public.subscription_tiers st
    WHERE st.tier = 'free';
  END IF;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2) Create a new subscription
CREATE OR REPLACE FUNCTION public.create_subscription(
  p_tier text,
  p_billing_period text,
  p_amount numeric
)
RETURNS uuid AS $$
DECLARE
  v_subscription_id uuid;
BEGIN
  -- Validate tier exists
  IF NOT EXISTS (SELECT 1 FROM public.subscription_tiers WHERE tier = p_tier) THEN
    RAISE EXCEPTION 'Invalid subscription tier: %', p_tier;
  END IF;
  
  -- Validate billing period
  IF p_billing_period NOT IN ('monthly', 'yearly') THEN
    RAISE EXCEPTION 'Invalid billing period: %', p_billing_period;
  END IF;
  
  -- Cancel any existing active subscriptions
  UPDATE public.subscriptions
  SET status = 'cancelled', auto_renew = false, updated_at = now()
  WHERE user_id = auth.uid()
    AND status IN ('active', 'pending');
  
  -- Create new subscription
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    billing_period,
    status
  ) VALUES (
    auth.uid(),
    p_tier,
    p_billing_period,
    'pending'
  )
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Activate subscription after successful payment
CREATE OR REPLACE FUNCTION public.activate_subscription(
  p_subscription_id uuid,
  p_razorpay_subscription_id text DEFAULT NULL,
  p_razorpay_plan_id text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_billing_period text;
  v_end_date timestamptz;
BEGIN
  -- Get billing period
  SELECT billing_period INTO v_billing_period
  FROM public.subscriptions
  WHERE id = p_subscription_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  -- Calculate end date
  IF v_billing_period = 'monthly' THEN
    v_end_date := now() + interval '1 month';
  ELSE
    v_end_date := now() + interval '1 year';
  END IF;
  
  -- Update subscription
  UPDATE public.subscriptions
  SET 
    status = 'active',
    start_date = now(),
    end_date = v_end_date,
    razorpay_subscription_id = p_razorpay_subscription_id,
    razorpay_plan_id = p_razorpay_plan_id,
    updated_at = now()
  WHERE id = p_subscription_id AND user_id = auth.uid();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4) Cancel subscription
CREATE OR REPLACE FUNCTION public.cancel_subscription(
  p_subscription_id uuid
)
RETURNS boolean AS $$
BEGIN
  -- Update subscription to cancelled (maintains access until end_date)
  UPDATE public.subscriptions
  SET 
    status = 'cancelled',
    auto_renew = false,
    updated_at = now()
  WHERE id = p_subscription_id 
    AND user_id = auth.uid()
    AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active subscription not found';
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) Record a payment
CREATE OR REPLACE FUNCTION public.record_payment(
  p_subscription_id uuid,
  p_amount numeric,
  p_currency text,
  p_razorpay_payment_id text,
  p_razorpay_order_id text,
  p_razorpay_signature text,
  p_status text DEFAULT 'success'
)
RETURNS uuid AS $$
DECLARE
  v_payment_id uuid;
BEGIN
  INSERT INTO public.payments (
    user_id,
    subscription_id,
    amount,
    currency,
    status,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature
  ) VALUES (
    auth.uid(),
    p_subscription_id,
    p_amount,
    p_currency,
    p_status,
    p_razorpay_payment_id,
    p_razorpay_order_id,
    p_razorpay_signature
  )
  RETURNING id INTO v_payment_id;
  
  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6) Get user's tier features
CREATE OR REPLACE FUNCTION public.get_user_tier_features()
RETURNS jsonb AS $$
DECLARE
  v_features jsonb;
BEGIN
  -- Get features from active subscription
  SELECT st.features INTO v_features
  FROM public.subscriptions s
  JOIN public.subscription_tiers st ON s.tier = st.tier
  WHERE s.user_id = auth.uid()
    AND s.status IN ('active', 'grace_period')
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- If no active subscription, return free tier features
  IF v_features IS NULL THEN
    SELECT features INTO v_features
    FROM public.subscription_tiers
    WHERE tier = 'free';
  END IF;
  
  RETURN v_features;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7) Check usage limit for a feature
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_feature text
)
RETURNS TABLE (
  allowed boolean,
  current_usage integer,
  limit_value integer,
  remaining integer
) AS $$
DECLARE
  v_features jsonb;
  v_limit integer;
  v_usage integer;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  -- Get user's tier features
  v_features := get_user_tier_features();
  
  -- Get limit for feature (-1 means unlimited)
  v_limit := (v_features->>p_feature)::integer;
  
  -- If unlimited, return allowed
  IF v_limit = -1 THEN
    RETURN QUERY SELECT true, 0, -1, -1;
    RETURN;
  END IF;
  
  -- Calculate current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  -- Get current usage
  SELECT COALESCE(usage_count, 0) INTO v_usage
  FROM public.usage_tracking
  WHERE user_id = auth.uid()
    AND feature = p_feature
    AND period_start = v_period_start;
  
  -- Return result
  RETURN QUERY SELECT 
    (v_usage < v_limit) as allowed,
    v_usage as current_usage,
    v_limit as limit_value,
    GREATEST(0, v_limit - v_usage) as remaining;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 8) Increment usage for a feature
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_feature text
)
RETURNS boolean AS $$
DECLARE
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  -- Calculate current period (monthly)
  v_period_start := date_trunc('month', now());
  v_period_end := v_period_start + interval '1 month';
  
  -- Insert or update usage
  INSERT INTO public.usage_tracking (
    user_id,
    feature,
    usage_count,
    period_start,
    period_end
  ) VALUES (
    auth.uid(),
    p_feature,
    1,
    v_period_start,
    v_period_end
  )
  ON CONFLICT (user_id, feature, period_start)
  DO UPDATE SET
    usage_count = usage_tracking.usage_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9) Get payment history
CREATE OR REPLACE FUNCTION public.get_payment_history(
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  payment_id uuid,
  amount numeric,
  currency text,
  status text,
  razorpay_payment_id text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as payment_id,
    p.amount,
    p.currency,
    p.status,
    p.razorpay_payment_id,
    p.created_at
  FROM public.payments p
  WHERE p.user_id = auth.uid()
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
