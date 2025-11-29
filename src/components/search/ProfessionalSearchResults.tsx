import React from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Avatar,
    Button,
    Skeleton,
    Stack
} from '@mui/material';
import MuiGrid from '@mui/material/Grid';
import {
    LocationOn as LocationIcon,
    Verified as VerifiedIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { useSearchProfessionals } from '../../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

const Grid = MuiGrid as any;

interface ProfessionalSearchResultsProps {
    onViewProfile?: (professionalId: string) => void;
    onSendMessage?: (professionalId: string) => void;
}

export const ProfessionalSearchResults: React.FC<ProfessionalSearchResultsProps> = ({
    onViewProfile,
    onSendMessage
}) => {
    const { results, loading, error, hasMore, loadMore } = useSearchProfessionals();
    const navigate = useNavigate();

    const handleProfileClick = (proId: string) => {
        if (onViewProfile) {
            onViewProfile(proId);
        } else {
            navigate(`/profile/${proId}`);
        }
    };

    if (loading && results.length === 0) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <Card>
                            <Skeleton variant="rectangular" height={200} />
                            <CardContent>
                                <Skeleton variant="text" height={32} width="80%" />
                                <Skeleton variant="text" width="60%" />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">Failed to load results: {error}</Typography>
            </Box>
        );
    }

    if (results.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    No professionals found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or search query
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Grid container spacing={3}>
                {results.map((pro) => (
                    <Grid item xs={12} sm={6} md={4} key={pro.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}
                            onClick={() => handleProfileClick(pro.id)}
                        >
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={pro.portfolioImages?.[0] || 'https://via.placeholder.com/400x200'}
                                    alt={pro.fullName}
                                />
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        position: 'absolute',
                                        bottom: -40,
                                        left: 16,
                                        border: '4px solid white',
                                        bgcolor: 'primary.main'
                                    }}
                                >
                                    {pro.fullName.charAt(0)}
                                </Avatar>
                                {pro.isVerified && (
                                    <Chip
                                        icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                                        label="Verified"
                                        size="small"
                                        color="primary"
                                        sx={{ position: 'absolute', top: 16, right: 16 }}
                                    />
                                )}
                            </Box>

                            <CardContent sx={{ pt: 6, flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            {pro.fullName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {pro.professionalType}
                                        </Typography>
                                    </Box>
                                    {pro.relevanceScore > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <StarIcon color="warning" fontSize="small" />
                                            <Typography variant="body2" fontWeight="bold">
                                                {(pro.relevanceScore * 5).toFixed(1)}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Chip label={pro.professionalType} size="small" variant="outlined" />
                                </Stack>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
                                    <LocationIcon fontSize="small" />
                                    <Typography variant="body2">
                                        {pro.city}
                                        {pro.distanceKm !== undefined && ` • ${pro.distanceKm.toFixed(1)} km away`}
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onSendMessage) onSendMessage(pro.id);
                                    }}
                                >
                                    Message
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {hasMore && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="outlined" onClick={loadMore}>
                        Load More
                    </Button>
                </Box>
            )}
        </Box>
    );
};
