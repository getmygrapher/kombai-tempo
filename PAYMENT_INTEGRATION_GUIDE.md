# Payment System Integration - Example Usage

This document shows how to integrate the payment system components into your existing pages.

## 1. Profile Page Integration

Add subscription badge and upgrade button to the profile page:

```typescript
// In src/components/profile/Profile.tsx or ProfileView.tsx

import { SubscriptionBadge } from './SubscriptionBadge';
import { SubscriptionModal } from './SubscriptionModal';
import { PaymentHistory } from './PaymentHistory';
import { useSubscriptionStatus } from '../../hooks/useSubscription';
import { useState } from 'react';
import { Button } from '@mui/material';
import { TrendingUp as UpgradeIcon } from '@mui/icons-material';

// In your component:
const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
const { isPro, isFree } = useSubscriptionStatus();

// In your JSX (profile header):
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <SubscriptionBadge size="medium" showDetails />
  {isFree && (
    <Button
      variant="contained"
      color="primary"
      startIcon={<UpgradeIcon />}
      onClick={() => setUpgradeModalOpen(true)}
    >
      Upgrade to Pro
    </Button>
  )}
</Box>

// Add modal at the end of component:
<SubscriptionModal
  open={upgradeModalOpen}
  onClose={() => setUpgradeModalOpen(false)}
/>

// In a subscription tab:
<PaymentHistory />
```

## 2. Job Posting Integration

Check usage limits before allowing job posts:

```typescript
// In src/components/jobs/JobCreationWizard.tsx or JobPostingForm.tsx

import { UsageLimitBanner } from '../common/UsageLimitBanner';
import { useUsageLimit } from '../../hooks/useSubscription';
import { useState } from 'react';
import { SubscriptionModal } from '../profile/SubscriptionModal';

// In your component:
const { limit, allowed, currentUsage, limitValue, remaining, isAtLimit } = 
  useUsageLimit('job_posts_per_month');
const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

// Before the job creation form:
<UsageLimitBanner
  feature="job_posts_per_month"
  currentUsage={currentUsage}
  limitValue={limitValue}
  remaining={remaining}
  onUpgrade={() => setUpgradeModalOpen(true)}
/>

// In your submit handler:
const handleSubmit = async (jobData) => {
  // Check if user can post
  if (!allowed) {
    setUpgradeModalOpen(true);
    return;
  }

  try {
    // Create job
    await jobsService.createJob(jobData);
    
    // Increment usage
    await paymentStore.getState().incrementUsage('job_posts_per_month');
    
    // Success handling
  } catch (error) {
    // Error handling
  }
};

// Add modal:
<SubscriptionModal
  open={upgradeModalOpen}
  onClose={() => setUpgradeModalOpen(false)}
/>
```

## 3. Feature Access Control

Conditionally show features based on subscription:

```typescript
// In any component that needs feature gating

import { useFeatureAccess } from '../../hooks/useSubscription';

// In your component:
const { hasAccess: hasCalendarPrivacy } = useFeatureAccess('calendar_privacy');
const { hasAccess: hasAdvancedSearch } = useFeatureAccess('advanced_search');
const { hasAccess: hasInstagram } = useFeatureAccess('instagram_integration');

// Conditional rendering:
{hasCalendarPrivacy && (
  <CalendarPrivacySettings />
)}

{hasAdvancedSearch ? (
  <AdvancedSearchFilters />
) : (
  <Box>
    <Typography>Upgrade to Pro for advanced search</Typography>
    <Button onClick={() => setUpgradeModalOpen(true)}>
      Upgrade Now
    </Button>
  </Box>
)}
```

## 4. Navigation Badge

Show Pro badge in navigation/header:

```typescript
// In src/components/navigation/Navigation.tsx or Header.tsx

import { SubscriptionBadge } from '../profile/SubscriptionBadge';

// In your navigation menu or user menu:
<MenuItem onClick={() => navigate('/profile')}>
  <ListItemIcon>
    <PersonIcon />
  </ListItemIcon>
  <ListItemText primary="Profile" />
  <SubscriptionBadge size="small" />
</MenuItem>
```

## 5. Environment Setup

Make sure to add your Razorpay key to `.env`:

```env
# Payment Integration
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

For production, use your live key:
```env
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
```

## 6. Testing the Integration

### Test Subscription Flow:
1. Open the app as a free user
2. Navigate to Profile
3. Click "Upgrade to Pro"
4. Select monthly or yearly
5. Click upgrade button
6. Razorpay checkout should open
7. Use test card: 4111 1111 1111 1111
8. Complete payment
9. Subscription should activate

### Test Usage Limits:
1. As a free user, try to post a job
2. After 1 post, you should see the usage limit banner
3. Trying to post again should show upgrade modal
4. After upgrading, limits should be removed

### Test Feature Access:
1. As a free user, advanced features should be hidden/disabled
2. After upgrading to Pro, all features should be accessible
3. Pro badge should appear in profile and navigation

## Next Steps

After integrating the payment system:

1. **Deploy Database**: Run the SQL migrations to Supabase
2. **Test in Development**: Use Razorpay test mode
3. **Implement Rating System**: Follow similar pattern
4. **Implement Search System**: Complete the integration
5. **Production Deployment**: Switch to live Razorpay keys
