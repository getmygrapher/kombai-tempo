import React from 'react';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import { RatingStars } from './RatingStars';
import { RatingStats as RatingStatsType } from '../../services/ratingService';

interface RatingStatsProps {
    stats: RatingStatsType;
}

export const RatingStats: React.FC<RatingStatsProps> = ({ stats }) => {
    const { averageRating, totalRatings, ratingDistribution } = stats;

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                {/* Average Rating */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" fontWeight="bold" color="text.primary">
                        {averageRating.toFixed(1)}
                    </Typography>
                    <RatingStars rating={averageRating} size="medium" />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                    </Typography>
                </Box>

                {/* Distribution Bars */}
                <Box sx={{ flex: 1 }}>
                    <Stack spacing={1}>
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingDistribution[star.toString() as keyof typeof ratingDistribution] || 0;
                            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                            return (
                                <Box key={star} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 12 }}>
                                        {star}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{
                                            flex: 1,
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: 'action.hover',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: 'warning.main',
                                                borderRadius: 4,
                                            },
                                        }}
                                    />
                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 24, textAlign: 'right' }}>
                                        {count}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
};
