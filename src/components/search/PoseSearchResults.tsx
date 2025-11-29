import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Skeleton,
    Button,
    Stack
} from '@mui/material';
import MuiGrid from '@mui/material/Grid';
import { useSearchPoses } from '../../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

const Grid = MuiGrid as any;

export const PoseSearchResults: React.FC = () => {
    const { results, loading, error, hasMore, loadMore } = useSearchPoses();
    const navigate = useNavigate();

    // Removed getDifficultyColor function as it's replaced by inline logic

    if (loading && results.length === 0) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item component="div" xs={12} sm={6} md={4} key={i}>
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
                    No poses found
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
                {results.map((pose) => (
                    <Grid item component="div" xs={12} sm={6} md={4} key={pose.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)' }
                            }}
                            onClick={() => navigate(`/community/pose/${pose.id}`)}
                        >
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={pose.thumbnailUrl || pose.imageUrl}
                                    alt={pose.title}
                                />
                                <Chip
                                    label={pose.category}
                                    size="small"
                                    color="primary"
                                    sx={{ position: 'absolute', top: 16, right: 16 }}
                                />
                            </Box>

                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom noWrap>
                                    {pose.title}
                                </Typography>

                                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                    <Chip
                                        label={pose.difficulty || 'Medium'}
                                        size="small"
                                        color={
                                            pose.difficulty === 'Beginner' ? 'success' :
                                                pose.difficulty === 'Advanced' ? 'error' : 'warning'
                                        }
                                        variant="outlined"
                                    />
                                </Stack>

                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {pose.tags?.slice(0, 3).map((tag) => (
                                        <Typography
                                            key={tag}
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                bgcolor: 'action.hover',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1
                                            }}
                                        >
                                            #{tag}
                                        </Typography>
                                    ))}
                                </Box>
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
