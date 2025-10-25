import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useOutletContext } from 'react-router-dom';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import StarIcon from '@mui/icons-material/Star';
import { Review, Professional, ViewerPermissions } from '../../data/profileViewSystemMockData';

interface ReviewsSectionProps {
  reviews?: Review[];
  professional?: Professional;
}

interface OutletContext {
  profileData: any;
  viewerPermissions: ViewerPermissions;
}

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const ReviewCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const RatingBreakdownContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(3),
}));

const RatingRow = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const RatingDisplay: React.FC<{
  rating: number;
  totalReviews?: number;
  showReviewCount?: boolean;
  size?: 'small' | 'medium' | 'large';
}> = ({ rating, totalReviews, showReviewCount = true, size = 'medium' }) => {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  
  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          sx={{
            fontSize: iconSize,
            color: star <= rating ? 'warning.main' : 'grey.300',
          }}
        />
      ))}
      {showReviewCount && totalReviews && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          ({totalReviews})
        </Typography>
      )}
    </Stack>
  );
};

const ReviewsSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="text" width={200} height={32} />
    <Box>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1, mb: 2 }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 1, mb: 2 }} />
      ))}
    </Box>
  </Stack>
);

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews: propReviews,
  professional: propProfessional,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Try to get data from outlet context if not provided as props
  const outletContext = useOutletContext<OutletContext>();
  const reviews = propReviews || outletContext?.profileData?.reviews || [];
  const professional = propProfessional || outletContext?.profileData?.professional;

  if (!professional) {
    return <ReviewsSkeleton />;
  }

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => Math.floor(review.rating) === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  // Pagination logic
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const displayedReviews = showAllReviews 
    ? reviews.slice(startIndex, startIndex + reviewsPerPage)
    : reviews.slice(0, 3);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else {
      setShowAllReviews(true);
      setCurrentPage(1);
    }
  };

  const handleShowLess = () => {
    setShowAllReviews(false);
    setCurrentPage(1);
  };

  if (reviews.length === 0) {
    return (
      <Box
        role="tabpanel"
        id="tabpanel-reviews"
        aria-labelledby="tab-reviews"
      >
        <SectionPaper>
          <SectionTitle variant="h6">Reviews & Ratings</SectionTitle>
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No reviews available yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Be the first to work with {professional.name} and leave a review!
            </Typography>
          </Box>
        </SectionPaper>
      </Box>
    );
  }

  return (
    <Box
      role="tabpanel"
      id="tabpanel-reviews"
      aria-labelledby="tab-reviews"
    >
      <Stack spacing={2}>
        <SectionPaper>
          <SectionTitle variant="h6">Reviews & Ratings</SectionTitle>

          {/* Overall Rating Summary */}
          <Stack direction={isMobile ? 'column' : 'row'} spacing={4} sx={{ mb: 3 }}>
            <Box textAlign={isMobile ? 'center' : 'left'}>
              <Typography variant="h2" fontWeight="bold" color="primary">
                {professional.rating.toFixed(1)}
              </Typography>
              <RatingDisplay
                rating={professional.rating}
                totalReviews={professional.totalReviews}
                size="medium"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Based on {professional.totalReviews} reviews
              </Typography>
            </Box>

            {/* Rating Breakdown */}
            <Box flex={1}>
              <RatingBreakdownContainer>
                {ratingBreakdown.map(({ rating, count, percentage }) => (
                  <RatingRow key={rating} direction="row" spacing={2}>
                    <Typography variant="body2" sx={{ minWidth: '60px' }}>
                      {rating} stars
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ flex: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: '40px' }}>
                      ({count})
                    </Typography>
                  </RatingRow>
                ))}
              </RatingBreakdownContainer>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Individual Reviews */}
          <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
            Recent Reviews
          </Typography>

          <Stack spacing={2} role="list" aria-label="Customer reviews">
            {displayedReviews.map((review, index) => (
              <ReviewCard key={review.id} role="listitem">
                <CardContent>
                  <Stack spacing={2}>
                    {/* Review Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {review.clientName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2" fontWeight="medium">
                              {review.clientName}
                            </Typography>
                            {review.isVerified && (
                              <VerifiedOutlinedIcon 
                                sx={{ fontSize: 16, color: 'primary.main' }} 
                                aria-label="Verified review"
                              />
                            )}
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.date)} • {review.projectType}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Stack alignItems="flex-end" spacing={0.5}>
                        <RatingDisplay
                          rating={review.rating}
                          showReviewCount={false as any}
                          size="small"
                        />
                        {review.isVerified && (
                          <Chip
                            label="Verified"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Stack>

                    {/* Review Content */}
                    <Typography variant="body2" color="text.primary" lineHeight={1.6}>
                      {review.comment}
                    </Typography>
                  </Stack>
                </CardContent>
              </ReviewCard>
            ))}
          </Stack>

          {/* Pagination Controls */}
          {reviews.length > 3 && (
            <Box textAlign="center" sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                {!showAllReviews ? (
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    aria-label={`Load more reviews, showing ${displayedReviews.length} of ${reviews.length}`}
                  >
                    Load More Reviews ({reviews.length - displayedReviews.length} remaining)
                  </Button>
                ) : (
                  <>
                    {currentPage > 1 && (
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        aria-label="Previous page of reviews"
                      >
                        Previous
                      </Button>
                    )}
                    
                    <Typography variant="body2" color="text.secondary">
                      Page {currentPage} of {totalPages}
                    </Typography>
                    
                    {currentPage < totalPages ? (
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        aria-label="Next page of reviews"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="text"
                        onClick={handleShowLess}
                        aria-label="Show fewer reviews"
                      >
                        Show Less
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          )}
        </SectionPaper>
      </Stack>
    </Box>
  );
};