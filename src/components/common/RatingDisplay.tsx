import React from 'react';
import { Stack, Typography, Rating } from '@mui/material';
import { formatRating } from '../../utils/formatters';

interface RatingDisplayProps {
  rating: number;
  totalReviews?: number;
  showReviewCount?: boolean;
  size?: 'small' | 'medium' | 'large';
  readOnly?: boolean;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  totalReviews,
  showReviewCount = true,
  size = 'small',
  readOnly = true,
}) => {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Rating
        value={rating}
        readOnly={readOnly}
        size={size}
        precision={0.1}
      />
      <Typography variant="body2" color="text.secondary">
        {formatRating(rating)}
        {showReviewCount && totalReviews && (
          <span> ({totalReviews} reviews)</span>
        )}
      </Typography>
    </Stack>
  );
};