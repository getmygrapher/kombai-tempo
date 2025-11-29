import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    Card,
    CardContent,
    Chip,
    Stack,
    Button,
    CircularProgress,
} from '@mui/material';
import { Verified as VerifiedIcon } from '@mui/icons-material';
import { RatingStars } from './RatingStars';
import { useUserRatings } from '../../hooks/useRatings';

interface RatingsListProps {
    userId: string;
    verifiedOnly?: boolean;
}

export const RatingsList: React.FC<RatingsListProps> = ({ userId, verifiedOnly = false }) => {
    const { ratings, loading, error, hasMore, loadMore } = useUserRatings(userId, 10, verifiedOnly);

    if (loading && ratings.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
                <Typography>Failed to load reviews: {error}</Typography>
            </Box>
        );
    }

    if (ratings.length === 0) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No reviews yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Be the first to leave a review!
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {ratings.map((rating) => (
                <Card key={rating.id} variant="outlined">
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    {rating.raterName.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {rating.raterName}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <RatingStars rating={rating.rating} size="small" />
                                        <Typography variant="caption" color="text.secondary">
                                            • {new Date(rating.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            {rating.isVerified && (
                                <Chip
                                    icon={<VerifiedIcon fontSize="small" />}
                                    label="Verified Job"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                />
                            )}
                        </Box>

                        {rating.jobTitle && (
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Job: {rating.jobTitle}
                            </Typography>
                        )}

                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {rating.reviewText}
                        </Typography>
                    </CardContent>
                </Card>
            ))}

            {hasMore && (
                <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Button onClick={loadMore} disabled={loading}>
                        {loading ? 'Loading...' : 'Load More Reviews'}
                    </Button>
                </Box>
            )}
        </Stack>
    );
};
