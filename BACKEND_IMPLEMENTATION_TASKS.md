# GetMyGrapher - Backend Implementation Task Breakdown
## Manageable Tasks for Launch Readiness

---

## 🎯 Phase 1: Job Posting System (Week 1)

### Task 1.1: Complete Job RPC Functions (2 days)
**File:** `supabase/sql/job_functions.sql`

**Subtasks:**
- [ ] Implement `create_job()` function
  - Validate job data
  - Insert into jobs table
  - Return job_id
  - Handle errors

- [ ] Implement `update_job()` function
  - Check ownership
  - Update job fields
  - Update updated_at timestamp

- [ ] Implement `get_my_jobs()` function
  - Filter by user_id
  - Optional status filter
  - Order by created_at DESC
  - Return with pagination

- [ ] Implement `apply_to_job()` function
  - Validate job exists and is active
  - Check not already applied
  - Insert application
  - Return application_id

- [ ] Implement `get_job_applications()` function
  - Check job ownership
  - Fetch applications with applicant details
  - Order by applied_at DESC

- [ ] Implement `update_application_status()` function
  - Check job ownership
  - Update application status
  - Return success

**Testing:**
```sql
-- Test create_job
SELECT create_job('{"title": "Wedding Photographer Needed", "category": "Photography", ...}');

-- Test get_my_jobs
SELECT * FROM get_my_jobs();

-- Test apply_to_job
SELECT apply_to_job('job-uuid', '{"message": "I am interested", ...}');
```

---

### Task 1.2: Enable PostGIS for Proximity Search (1 day)
**File:** New migration file `supabase/migrations/enable_postgis.sql`

**Subtasks:**
- [ ] Enable PostGIS extension
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  ```

- [ ] Add geography column to jobs table
  ```sql
  ALTER TABLE public.jobs 
    ADD COLUMN IF NOT EXISTS location geography(POINT,4326);
  ```

- [ ] Create spatial index
  ```sql
  CREATE INDEX IF NOT EXISTS idx_jobs_location_geo 
    ON public.jobs USING GIST (location);
  ```

- [ ] Create trigger to update location from lat/lng
  ```sql
  CREATE OR REPLACE FUNCTION update_job_location()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.location_lat IS NOT NULL AND NEW.location_lng IS NOT NULL THEN
      NEW.location = ST_SetSRID(ST_MakePoint(NEW.location_lng, NEW.location_lat), 4326)::geography;
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

- [ ] Test proximity search
  ```sql
  -- Find jobs within 10km of a location
  SELECT *, ST_Distance(location, ST_SetSRID(ST_MakePoint(76.2673, 9.9312), 4326)::geography) / 1000 as distance_km
  FROM public.jobs
  WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(76.2673, 9.9312), 4326)::geography, 10000)
  ORDER BY distance_km;
  ```

---

### Task 1.3: Implement Proximity Search RPC (1 day)
**File:** `supabase/sql/job_functions.sql`

**Subtasks:**
- [ ] Implement `get_nearby_jobs()` function
  ```sql
  CREATE OR REPLACE FUNCTION get_nearby_jobs(
    user_lat double precision,
    user_lng double precision,
    radius_km integer DEFAULT 25,
    filters jsonb DEFAULT '{}'
  )
  RETURNS TABLE (
    job_data jsonb,
    distance_km numeric
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT 
      to_jsonb(j.*) as job_data,
      ROUND((ST_Distance(
        j.location, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      ) / 1000)::numeric, 2) as distance_km
    FROM public.jobs j
    WHERE 
      j.status = 'active' 
      AND j.approved = true
      AND ST_DWithin(
        j.location, 
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, 
        radius_km * 1000
      )
      -- Add filter conditions
    ORDER BY distance_km ASC;
  END;
  $$ LANGUAGE plpgsql;
  ```

- [ ] Implement `search_jobs()` function with filters
  - Text search on title, description
  - Filter by category, professional_types
  - Filter by budget range
  - Filter by date range
  - Filter by urgency

- [ ] Test proximity search with various radii

---

### Task 1.4: Update jobsService.ts (2 days)
**File:** `src/services/jobsService.ts`

**Subtasks:**
- [ ] Replace `createJob()` mock with real Supabase call
  ```typescript
  async createJob(jobData: Partial<Job>): Promise<{ job: Job; success: boolean }> {
    const { data, error } = await supabase.rpc('create_job', {
      job_data: jobData
    });
    
    if (error) throw mapError(error);
    
    return { job: mapJob(data), success: true };
  }
  ```

- [ ] Replace `getNearbyJobs()` with proximity search
  ```typescript
  async getNearbyJobs(location: Coordinates, radius: DistanceRadius): Promise<{ jobs: Job[] }> {
    const { data, error } = await supabase.rpc('get_nearby_jobs', {
      user_lat: location.latitude,
      user_lng: location.longitude,
      radius_km: radiusToKm(radius)
    });
    
    if (error) throw mapError(error);
    
    return { jobs: data.map(row => ({ ...mapJob(row.job_data), distance: row.distance_km })) };
  }
  ```

- [ ] Update all other methods (getJob, getMyJobs, applyToJob, etc.)

- [ ] Add error handling and retry logic

- [ ] Add loading states

- [ ] Test all methods

---

### Task 1.5: Frontend Integration Testing (1 day)
**Files:** Job-related components and stores

**Subtasks:**
- [ ] Test job creation flow
  - Create job from UI
  - Verify job appears in database
  - Check all fields saved correctly

- [ ] Test job discovery
  - Search by location
  - Apply filters
  - Verify proximity sorting

- [ ] Test application flow
  - Apply to job
  - Check application status
  - Verify job poster sees application

- [ ] Fix any integration issues

---

## 🎯 Phase 2: Communication System (Week 2)

### Task 2.1: Create Communication Database Schema (1 day)
**File:** New file `supabase/sql/communication_schema.sql`

**Subtasks:**
- [ ] Create `conversations` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_ids uuid[] NOT NULL,
    job_id uuid REFERENCES public.jobs(id),
    last_message_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
  );
  ```

- [ ] Create `messages` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id),
    content text NOT NULL,
    message_type text CHECK (message_type IN ('text','image','file','system')) DEFAULT 'text',
    attachments jsonb DEFAULT '[]',
    read_by uuid[] DEFAULT '{}',
    sent_at timestamptz DEFAULT now()
  );
  ```

- [ ] Create `conversation_participants` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at timestamptz DEFAULT now(),
    last_read_at timestamptz,
    PRIMARY KEY (conversation_id, user_id)
  );
  ```

- [ ] Create `contact_shares` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.contact_shares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id uuid NOT NULL REFERENCES auth.users(id),
    to_user_id uuid NOT NULL REFERENCES auth.users(id),
    conversation_id uuid REFERENCES public.conversations(id),
    status text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    requested_at timestamptz DEFAULT now(),
    responded_at timestamptz
  );
  ```

- [ ] Add RLS policies for all tables

- [ ] Create indexes for performance

---

### Task 2.2: Enable Supabase Realtime (0.5 day)
**File:** Same as above

**Subtasks:**
- [ ] Enable realtime for messages table
  ```sql
  alter publication supabase_realtime add table messages;
  alter publication supabase_realtime add table conversations;
  ```

- [ ] Test realtime subscription
  ```typescript
  const subscription = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, (payload) => {
      console.log('New message:', payload);
    })
    .subscribe();
  ```

---

### Task 2.3: Implement Communication RPC Functions (2 days)
**File:** New file `supabase/sql/communication_functions.sql`

**Subtasks:**
- [ ] Implement `create_conversation()` function
  - Check if conversation already exists between participants
  - Create new conversation
  - Add participants
  - Return conversation_id

- [ ] Implement `send_message()` function
  - Validate conversation access
  - Insert message
  - Update conversation.last_message_at
  - Return message_id

- [ ] Implement `mark_messages_read()` function
  - Update read_by array
  - Update last_read_at for participant

- [ ] Implement `get_conversations()` function
  - Fetch user's conversations
  - Include last message preview
  - Include unread count
  - Order by last_message_at DESC

- [ ] Implement `get_messages()` function
  - Fetch messages for conversation
  - Check user is participant
  - Pagination support
  - Order by sent_at ASC

- [ ] Implement `request_contact_share()` function
  - Create contact share request
  - Notify recipient

- [ ] Implement `respond_to_contact_share()` function
  - Update status (approved/rejected)
  - Return contact info if approved

---

### Task 2.4: Update communicationService.ts (2 days)
**File:** `src/services/communicationService.ts` (needs creation)

**Subtasks:**
- [ ] Create service file with methods:
  - `createConversation()`
  - `sendMessage()`
  - `getConversations()`
  - `getMessages()`
  - `markAsRead()`
  - `subscribeToMessages()`
  - `requestContactShare()`
  - `respondToContactShare()`

- [ ] Implement real-time subscriptions
  ```typescript
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        callback(mapMessage(payload.new));
      })
      .subscribe();
  }
  ```

- [ ] Add error handling and retry logic

- [ ] Test all methods

---

### Task 2.5: Frontend Integration (1 day)
**Files:** Communication components and stores

**Subtasks:**
- [ ] Update `communicationStore.ts` to use real service

- [ ] Test conversation creation

- [ ] Test message sending and receiving

- [ ] Test real-time updates

- [ ] Test read receipts

- [ ] Fix any integration issues

---

## 🎯 Phase 3: Community Library Integration (Week 3)

### Task 3.1: Configure Supabase Storage (0.5 day)
**Location:** Supabase Dashboard

**Subtasks:**
- [ ] Create storage bucket `community-poses`
  - Public read access
  - Authenticated write access
  - Max file size: 10MB
  - Allowed types: image/jpeg, image/png, image/webp

- [ ] Create storage bucket `community-poses-thumbnails`
  - Public read access
  - System write access

- [ ] Set up RLS policies for buckets
  ```sql
  CREATE POLICY "Users can upload poses"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'community-poses' AND auth.uid() IS NOT NULL);
  
  CREATE POLICY "Public can view poses"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-poses');
  ```

- [ ] Test upload and download

---

### Task 3.2: Implement Image Upload Pipeline (1 day)
**File:** `src/services/communityService.ts`

**Subtasks:**
- [ ] Create `uploadPoseImage()` method
  ```typescript
  async uploadPoseImage(file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('community-poses')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('community-poses')
      .getPublicUrl(fileName);
    
    return publicUrl;
  }
  ```

- [ ] Add image compression before upload
  - Resize to max 2048px width
  - Convert to WebP format
  - Maintain aspect ratio

- [ ] Generate thumbnails (small, medium, large)

- [ ] Test upload with various image sizes

---

### Task 3.3: Test EXIF Extraction (1 day)
**File:** `src/services/exifService.ts`

**Subtasks:**
- [ ] Test EXIF extraction with sample images
  - Camera model
  - Lens model
  - Focal length
  - Aperture
  - Shutter speed
  - ISO
  - Flash settings

- [ ] Handle images without EXIF data

- [ ] Test manual override functionality

- [ ] Validate extracted data accuracy

---

### Task 3.4: Update communityService.ts (2 days)
**File:** `src/services/communityService.ts`

**Subtasks:**
- [ ] Replace mock data in `listPoses()`
  ```typescript
  async listPoses(filters: LibraryFilters, sortBy: SortBy): Promise<CommunityPosesResponse> {
    const { data, error } = await supabase.rpc('get_community_poses', {
      filters: filters,
      sort_by: sortBy
    });
    
    if (error) throw error;
    
    return {
      poses: data.map(mapPoseToCommunityPose),
      total: data.length,
      hasMore: false
    };
  }
  ```

- [ ] Replace mock data in `submitContribution()`
  - Upload image
  - Extract EXIF
  - Submit pose data
  - Return submission result

- [ ] Update all interaction methods (like, save, share, view)

- [ ] Update comment methods

- [ ] Test all methods

---

### Task 3.5: Frontend Integration Testing (1 day)
**Files:** Community components

**Subtasks:**
- [ ] Test pose browsing
  - Load poses from database
  - Apply filters
  - Test sorting

- [ ] Test contribution flow
  - Upload image
  - Extract EXIF
  - Fill details
  - Submit

- [ ] Test interactions
  - Like pose
  - Save pose
  - Comment on pose

- [ ] Fix any integration issues

---

## 🎯 Phase 4: Search & Discovery (Week 4)

### Task 4.1: Add Geography Columns to Profiles (0.5 day)
**File:** New migration `supabase/migrations/add_profile_geography.sql`

**Subtasks:**
- [ ] Add geography column to professional_profiles
  ```sql
  ALTER TABLE public.professional_profiles 
    ADD COLUMN IF NOT EXISTS location geography(POINT,4326);
  ```

- [ ] Create spatial index
  ```sql
  CREATE INDEX IF NOT EXISTS idx_profiles_location 
    ON public.professional_profiles USING GIST (location);
  ```

- [ ] Create trigger to update location from city/state
  - Use geocoding service or manual lat/lng input

- [ ] Backfill existing profiles with location data

---

### Task 4.2: Implement Full-Text Search (1 day)
**File:** Same migration file

**Subtasks:**
- [ ] Add tsvector column to professional_profiles
  ```sql
  ALTER TABLE public.professional_profiles 
    ADD COLUMN IF NOT EXISTS search_vector tsvector;
  ```

- [ ] Create GIN index
  ```sql
  CREATE INDEX IF NOT EXISTS idx_profiles_search 
    ON public.professional_profiles USING GIN (search_vector);
  ```

- [ ] Create trigger to update search_vector
  ```sql
  CREATE OR REPLACE FUNCTION update_profile_search_vector()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.search_vector = 
      setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.professional_type, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(NEW.about, '')), 'C');
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  ```

- [ ] Test full-text search
  ```sql
  SELECT * FROM professional_profiles
  WHERE search_vector @@ to_tsquery('english', 'photographer & wedding');
  ```

---

### Task 4.3: Implement Search RPC Functions (2 days)
**File:** New file `supabase/sql/search_functions.sql`

**Subtasks:**
- [ ] Implement `search_professionals()` function
  ```sql
  CREATE OR REPLACE FUNCTION search_professionals(
    query_text text DEFAULT '',
    user_lat double precision DEFAULT NULL,
    user_lng double precision DEFAULT NULL,
    radius_km integer DEFAULT 25,
    filters jsonb DEFAULT '{}'
  )
  RETURNS TABLE (
    profile_data jsonb,
    distance_km numeric,
    relevance_score real
  ) AS $$
  -- Implementation with text search + proximity + filters
  ```

- [ ] Implement `search_jobs()` function
  - Similar to search_professionals but for jobs

- [ ] Implement `search_poses()` function
  - Full-text search on pose titles, tips, story

- [ ] Implement `get_search_suggestions()` function
  - Autocomplete based on partial query
  - Return top 10 suggestions

- [ ] Test all search functions with various queries

---

### Task 4.4: Create searchService.ts (1 day)
**File:** New file `src/services/searchService.ts`

**Subtasks:**
- [ ] Create service with methods:
  - `searchProfessionals()`
  - `searchJobs()`
  - `searchPoses()`
  - `getSearchSuggestions()`

- [ ] Add debouncing for search input (300ms)

- [ ] Add caching for recent searches

- [ ] Test all methods

---

### Task 4.5: Frontend Integration (2 days)
**Files:** Search components and stores

**Subtasks:**
- [ ] Create universal search bar component
  - Debounced input
  - Real-time suggestions
  - Multi-tab results

- [ ] Create search results page
  - Professional results
  - Job results
  - Pose results
  - Filter panels
  - Sort options

- [ ] Update homepage with search integration

- [ ] Test search flow end-to-end

---

## 🎯 Phase 5: Payment Integration (Week 5)

### Task 5.1: Create Payment Database Schema (1 day)
**File:** New file `supabase/sql/payment_schema.sql`

**Subtasks:**
- [ ] Create `subscriptions` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tier text CHECK (tier IN ('free','pro')) NOT NULL,
    status text CHECK (status IN ('active','cancelled','expired','grace_period')) NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    auto_renew boolean DEFAULT true,
    razorpay_subscription_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );
  ```

- [ ] Create `payments` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    subscription_id uuid REFERENCES public.subscriptions(id),
    amount numeric NOT NULL,
    currency text DEFAULT 'INR',
    status text CHECK (status IN ('pending','success','failed','refunded')) NOT NULL,
    razorpay_payment_id text,
    razorpay_order_id text,
    created_at timestamptz DEFAULT now()
  );
  ```

- [ ] Create `subscription_tiers` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.subscription_tiers (
    tier text PRIMARY KEY,
    name text NOT NULL,
    price_monthly numeric NOT NULL,
    price_yearly numeric NOT NULL,
    features jsonb NOT NULL,
    is_active boolean DEFAULT true
  );
  ```

- [ ] Insert tier data
  ```sql
  INSERT INTO public.subscription_tiers (tier, name, price_monthly, price_yearly, features) VALUES
  ('free', 'Free', 0, 0, '{"job_posts_per_month": 1, "job_accepts_per_month": 1, "search_radius_km": 25, "messaging_limit": 10}'),
  ('pro', 'Pro', 299, 2999, '{"job_posts_per_month": -1, "job_accepts_per_month": -1, "search_radius_km": 500, "messaging_limit": -1, "instagram_integration": true, "calendar_privacy": true}');
  ```

- [ ] Add RLS policies

---

### Task 5.2: Set Up Razorpay Account (0.5 day)
**Location:** Razorpay Dashboard

**Subtasks:**
- [ ] Create Razorpay account
- [ ] Get API keys (test mode)
- [ ] Configure webhook URL
- [ ] Test payment flow in test mode

---

### Task 5.3: Implement Payment RPC Functions (2 days)
**File:** New file `supabase/sql/payment_functions.sql`

**Subtasks:**
- [ ] Implement `create_subscription()` function
  - Create subscription record
  - Set status to pending
  - Return subscription_id

- [ ] Implement `activate_subscription()` function
  - Called after successful payment
  - Update status to active
  - Set start_date and end_date

- [ ] Implement `cancel_subscription()` function
  - Update status to cancelled
  - Keep access until end_date

- [ ] Implement `check_subscription_status()` function
  - Return current subscription tier and status
  - Check if expired

- [ ] Implement `get_user_tier_features()` function
  - Return features available for user's tier

- [ ] Test all functions

---

### Task 5.4: Create Payment Service (2 days)
**File:** New file `src/services/paymentService.ts`

**Subtasks:**
- [ ] Install Razorpay SDK
  ```bash
  npm install razorpay
  ```

- [ ] Create service with methods:
  - `createOrder()` - Create Razorpay order
  - `verifyPayment()` - Verify payment signature
  - `activateSubscription()` - Activate after payment
  - `cancelSubscription()` - Cancel subscription
  - `getSubscriptionStatus()` - Get current status

- [ ] Implement Razorpay checkout integration
  ```typescript
  async createOrder(tier: 'monthly' | 'yearly'): Promise<RazorpayOrder> {
    const amount = tier === 'monthly' ? 299 : 2999;
    
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `sub_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    return order;
  }
  ```

- [ ] Test payment flow

---

### Task 5.5: Implement Feature Gating (1 day)
**File:** New file `src/utils/featureGating.ts`

**Subtasks:**
- [ ] Create feature gating utility
  ```typescript
  export const canAccessFeature = (
    userTier: 'free' | 'pro',
    feature: string
  ): boolean => {
    const tierFeatures = {
      free: ['basic_profile', 'calendar_view', 'job_search'],
      pro: ['instagram_integration', 'calendar_privacy', 'unlimited_jobs', 'advanced_search']
    };
    
    return tierFeatures[userTier].includes(feature) || tierFeatures.free.includes(feature);
  };
  ```

- [ ] Add usage limit checking
  ```typescript
  export const checkUsageLimit = async (
    userId: string,
    feature: string
  ): Promise<{ allowed: boolean; remaining: number }> => {
    // Check current usage against tier limits
  };
  ```

- [ ] Add feature gates to relevant components
  - Job posting (1/month for free)
  - Messaging (10 conversations for free)
  - Search radius (25km for free)

---

### Task 5.6: Frontend Integration (2 days)
**Files:** Payment components and stores

**Subtasks:**
- [ ] Create tier comparison page
  - Feature comparison table
  - Pricing display
  - Upgrade buttons

- [ ] Create payment modal
  - Razorpay checkout widget
  - Success/failure handling

- [ ] Create billing dashboard
  - Current subscription status
  - Payment history
  - Cancel subscription option

- [ ] Add upgrade prompts throughout app
  - When hitting free tier limits
  - On Pro-only features

- [ ] Test payment flow end-to-end

---

## 🎯 Phase 6: Rating & Review System (Week 6)

### Task 6.1: Create Rating Database Schema (0.5 day)
**File:** New file `supabase/sql/rating_schema.sql`

**Subtasks:**
- [ ] Create `ratings` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    rated_user_id uuid NOT NULL REFERENCES auth.users(id),
    rater_user_id uuid NOT NULL REFERENCES auth.users(id),
    job_id uuid REFERENCES public.jobs(id),
    rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text text,
    is_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(job_id, rater_user_id)
  );
  ```

- [ ] Create `rating_stats` table
  ```sql
  CREATE TABLE IF NOT EXISTS public.rating_stats (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id),
    average_rating numeric(3,2) DEFAULT 0,
    total_ratings integer DEFAULT 0,
    rating_distribution jsonb DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
    updated_at timestamptz DEFAULT now()
  );
  ```

- [ ] Add RLS policies

- [ ] Create indexes

---

### Task 6.2: Implement Rating RPC Functions (1 day)
**File:** New file `supabase/sql/rating_functions.sql`

**Subtasks:**
- [ ] Implement `submit_rating()` function
  - Validate job exists and is completed
  - Check user was involved in job
  - Insert rating
  - Update rating_stats
  - Return success

- [ ] Implement `get_user_ratings()` function
  - Fetch ratings for a user
  - Include rater details
  - Pagination support
  - Order by created_at DESC

- [ ] Implement `calculate_average_rating()` function
  - Calculate average from all ratings
  - Update rating_stats table
  - Return new average

- [ ] Create trigger to auto-update rating_stats
  ```sql
  CREATE OR REPLACE FUNCTION update_rating_stats()
  RETURNS TRIGGER AS $$
  BEGIN
    -- Update average_rating and total_ratings
    -- Update rating_distribution
  END;
  $$ LANGUAGE plpgsql;
  ```

---

### Task 6.3: Create Rating Service (1 day)
**File:** New file `src/services/ratingService.ts`

**Subtasks:**
- [ ] Create service with methods:
  - `submitRating()`
  - `getUserRatings()`
  - `getAverageRating()`
  - `canRateUser()` - Check if user can rate

- [ ] Test all methods

---

### Task 6.4: Frontend Integration (1.5 days)
**Files:** Rating components

**Subtasks:**
- [ ] Create rating submission form
  - Star rating selector
  - Review text area
  - Submit button

- [ ] Create rating display component
  - Average rating with stars
  - Total ratings count
  - Individual reviews list

- [ ] Add rating prompt after job completion
  - Modal to rate other party
  - Reminder notification

- [ ] Update profile page to show ratings

- [ ] Test rating flow end-to-end

---

## 📊 Summary

### Total Estimated Time: 10-12 Weeks

| Phase | Duration | Priority |
|-------|----------|----------|
| Job Posting System | 1 week | CRITICAL |
| Communication System | 1.5 weeks | CRITICAL |
| Community Library Integration | 1.5 weeks | HIGH |
| Search & Discovery | 2 weeks | CRITICAL |
| Payment Integration | 2 weeks | CRITICAL |
| Rating & Review System | 1 week | HIGH |
| Testing & Polish | 2 weeks | CRITICAL |
| Production Deployment | 2 weeks | CRITICAL |

### Parallel Work Streams

**Week 1-2:**
- Developer 1: Job Posting System
- Developer 2: Communication System

**Week 3-4:**
- Developer 1: Community Library Integration
- Developer 2: Search & Discovery

**Week 5-6:**
- Developer 1: Payment Integration
- Developer 2: Rating & Review System

**Week 7-8:**
- Both: Testing & Polish

**Week 9-10:**
- Both: Production Deployment

### Success Criteria

- [ ] All 8 backend systems operational
- [ ] Frontend fully integrated (no mock data)
- [ ] 80%+ test coverage
- [ ] Payment system working
- [ ] Production infrastructure ready
- [ ] Legal documents complete

---

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Week 1 tasks
4. Weekly progress reviews
