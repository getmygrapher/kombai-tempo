# Rating System Integration - Example Usage

This document shows how to integrate the rating system components into your existing pages.

## 1. Profile Page Integration

Add rating stats and reviews list to the profile page:

```typescript
// In src/components/profile/ProfileView.tsx

import { RatingStats } from './RatingStats';
import { RatingsList } from './RatingsList';
import { useRatingStats } from '../../hooks/useRatings';
import { Box, Typography, Tabs, Tab } from '@mui/material';

// In your component:
const { stats, loading } = useRatingStats(userId);
const [tabValue, setTabValue] = useState(0);

// In your JSX (header area):
<Box sx={{ mb: 3 }}>
  <RatingStats stats={stats} />
</Box>

// In your tabs:
<Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
  <Tab label="Portfolio" />
  <Tab label={`Reviews (${stats.totalRatings})`} />
</Tabs>

// In reviews tab panel:
{tabValue === 1 && (
  <Box sx={{ mt: 2 }}>
    <RatingsList userId={userId} />
  </Box>
)}
```

## 2. Job Completion Integration

Prompt users to rate after a job is completed:

```typescript
// In src/components/jobs/JobDetail.tsx

import { RatingDialog } from '../profile/RatingDialog';
import { useCanRate } from '../../hooks/useRatings';
import { Button } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

// In your component:
const [ratingOpen, setRatingOpen] = useState(false);
const { canRate } = useCanRate(professionalId, jobId);

// Show rate button if eligible:
{canRate && (
  <Button
    variant="contained"
    color="primary"
    startIcon={<StarIcon />}
    onClick={() => setRatingOpen(true)}
  >
    Rate Professional
  </Button>
)}

// Add dialog:
<RatingDialog
  open={ratingOpen}
  onClose={() => setRatingOpen(false)}
  professionalId={professionalId}
  jobId={jobId}
  professionalName={professionalName}
  onSuccess={() => {
    // Refresh job or show success message
  }}
/>
```

## 3. Professional Card Integration

Show star rating on professional cards:

```typescript
// In src/components/search/ProfessionalCard.tsx

import { RatingStars } from '../profile/RatingStars';

// In your component props:
interface Props {
  rating: number;
  reviewCount: number;
  // ... other props
}

// In your JSX:
<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
  <RatingStars rating={rating} size="small" />
  <Typography variant="caption" color="text.secondary">
    ({reviewCount})
  </Typography>
</Box>
```

## 4. Testing the Integration

### Test Rating Flow:
1. Complete a job as a client
2. Verify "Rate Professional" button appears
3. Click button to open dialog
4. Select star rating (1-5)
5. Enter title and review text
6. Submit review
7. Verify review appears in list
8. Verify stats update

### Test Eligibility:
1. Try to rate a user without a completed job (should fail/hide button)
2. Try to rate same job twice (should fail/hide button)

## Next Steps

After integrating the rating system:

1. **Deploy Database**: Ensure rating schema and functions are deployed
2. **Implement Search System**: Proceed to Phase 4
