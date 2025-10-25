import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  Button, 
  CircularProgress, 
  Alert,
  Fab,
  Container
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useCommunityStore } from '../../store/communityStore';
import { communityService } from '../../services/communityService';
import { PoseFeedCard } from '../../components/community/PoseFeedCard';
import { SortBy } from '../../types/community';
import communityTheme from '../../theme/communityTheme';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(12), // Extra space for FAB
  minHeight: '100vh',
}));

const FabContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10),
  right: theme.spacing(2),
  zIndex: 1000,
  [theme.breakpoints.up('sm')]: {
    bottom: theme.spacing(3),
  },
}));

const LoadMoreContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(3),
}));

const LoadMoreButton = styled(Button)(({ theme }) => ({
  borderRadius: communityTheme.layout.buttonBorderRadius,
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  transition: communityTheme.animations.buttonPress,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

export const CommunityFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const {
    poses,
    likedPoses,
    savedPoses,
    activeFilters,
    isLoading,
    error,
    setPoses,
    toggleLike,
    toggleSave,
    setLoading,
    setError
  } = useCommunityStore();

  // Load initial poses
  useEffect(() => {
    loadPoses(1, true);
  }, []);

  const loadPoses = async (pageNum: number, reset: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await communityService.listPoses(
        activeFilters,
        SortBy.RECENT,
        pageNum
      );
      
      if (reset) {
        setPoses(response.poses);
      } else {
        setPoses([...poses, ...response.poses]);
      }
      
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load poses');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadPoses(page + 1, false);
    }
  };

  const handlePoseClick = (poseId: string) => {
    navigate(`/community/pose/${poseId}`);
  };

  const handleLike = (poseId: string) => {
    toggleLike(poseId);
    // In real app, would call communityService.likePose
  };

  const handleSave = (poseId: string) => {
    toggleSave(poseId);
    // In real app, would call communityService.savePose
  };

  const handleComment = (poseId: string) => {
    navigate(`/community/pose/${poseId}#comments`);
  };

  const handleShare = (poseId: string, platform: string) => {
    communityService.sharePose(poseId, platform);
  };

  const handleContribute = () => {
    navigate('/community/contribute');
  };

  if (error) {
    return (
      <StyledContainer>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <>
      <StyledContainer>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Community Feed
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover the latest poses shared by our community
            </Typography>
          </Box>

          {/* Poses Feed */}
          {poses.length === 0 && !isLoading ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No poses available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Be the first to share a pose with the community!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {poses.map((pose) => (
                <PoseFeedCard
                  key={pose.id}
                  pose={pose}
                  isLiked={likedPoses.has(pose.id)}
                  isSaved={savedPoses.has(pose.id)}
                  onLike={() => handleLike(pose.id)}
                  onSave={() => handleSave(pose.id)}
                  onComment={() => handleComment(pose.id)}
                  onShare={(platform) => handleShare(pose.id, platform)}
                  onClick={() => handlePoseClick(pose.id)}
                />
              ))}
            </Stack>
          )}

          {/* Load More Button */}
          {hasMore && poses.length > 0 && (
            <LoadMoreContainer>
              <LoadMoreButton
                variant="outlined"
                onClick={handleLoadMore}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </LoadMoreButton>
            </LoadMoreContainer>
          )}

          {/* Loading indicator for initial load */}
          {isLoading && poses.length === 0 && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}
        </Stack>
      </StyledContainer>

      {/* Floating Action Button */}
      <FabContainer>
        <Fab
          color="primary"
          onClick={handleContribute}
          sx={{ 
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
          }}
          aria-label="Create new pose"
        >
          <AddIcon />
        </Fab>
      </FabContainer>
    </>
  );
};