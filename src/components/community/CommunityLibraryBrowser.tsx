import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { PoseGridItem } from './PoseGridItem';
import { FilterBottomSheet } from './FilterBottomSheet';
import { PoseDetailView } from './PoseDetailView';
import { 
  CommunityPose, 
  PoseComment, 
  LibraryFilters, 
  SortBy 
} from '../../types/community';
import { formatSortBy } from '../../utils/communityFormatters';
import { mockQuery } from '../../data/communityPosingLibraryMockData';
import communityTheme from '../../theme/communityTheme';

interface CommunityLibraryBrowserProps {
  onNavigateBack?: () => void;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.default,
  zIndex: 10,
  paddingBottom: theme.spacing(2),
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: communityTheme.layout.buttonBorderRadius,
  },
}));

const PoseGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: communityTheme.layout.gridGap,
  marginTop: theme.spacing(2),
}));

const LoadMoreContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(4),
}));

export const CommunityLibraryBrowser: React.FC<CommunityLibraryBrowserProps> = ({
  onNavigateBack,
}) => {
  const [poses, setPoses] = useState<CommunityPose[]>([]);
  const [comments, setComments] = useState<PoseComment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.POPULAR);
  const [filters, setFilters] = useState<LibraryFilters>({
    categories: [],
    difficultyLevels: [],
    locationTypes: [],
    equipmentTypes: [],
    peopleCount: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPose, setSelectedPose] = useState<CommunityPose | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Mock interactions state
  const [likedPoses, setLikedPoses] = useState<Set<string>>(new Set(['pose-001']));
  const [savedPoses, setSavedPoses] = useState<Set<string>>(new Set(['pose-002']));

  // Load initial data
  useEffect(() => {
    loadPoses();
    setComments(mockQuery.poseComments);
  }, []);

  const loadPoses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPoses(mockQuery.communityPoses);
      setHasMore(false); // For demo, no more pages
    } catch (err) {
      setError('Failed to load poses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In real app, this would trigger API call with search
  };

  const handleSortChange = (newSortBy: SortBy) => {
    setSortBy(newSortBy);
    // In real app, this would trigger API call with new sort
  };

  const handleApplyFilters = (newFilters: LibraryFilters) => {
    setFilters(newFilters);
    // In real app, this would trigger API call with filters
  };

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      difficultyLevels: [],
      locationTypes: [],
      equipmentTypes: [],
      peopleCount: [],
    });
  };

  const handlePoseSelect = (poseId: string) => {
    const pose = poses.find(p => p.id === poseId);
    if (pose) {
      setSelectedPose(pose);
    }
  };

  const handleClosePoseDetail = () => {
    setSelectedPose(null);
  };

  const handleLike = () => {
    if (selectedPose) {
      setLikedPoses(prev => {
        const newSet = new Set(prev);
        if (newSet.has(selectedPose.id)) {
          newSet.delete(selectedPose.id);
        } else {
          newSet.add(selectedPose.id);
        }
        return newSet;
      });
    }
  };

  const handleSave = () => {
    if (selectedPose) {
      setSavedPoses(prev => {
        const newSet = new Set(prev);
        if (newSet.has(selectedPose.id)) {
          newSet.delete(selectedPose.id);
        } else {
          newSet.add(selectedPose.id);
        }
        return newSet;
      });
    }
  };

  const handleShare = (platform: string) => {
    console.log(`Sharing pose ${selectedPose?.id} on ${platform}`);
    // Implement sharing logic
  };

  const handleAddComment = (text: string) => {
    if (selectedPose) {
      const newComment: PoseComment = {
        id: `comment-${Date.now()}`,
        pose_id: selectedPose.id,
        user_id: 'current-user',
        comment_text: text,
        created_at: new Date().toISOString(),
        user: {
          name: 'Current User',
          profile_photo: 'https://i.pravatar.cc/150?img=10'
        }
      };
      setComments(prev => [newComment, ...prev]);
    }
  };

  const filteredPoses = poses.filter(pose => {
    if (searchQuery && !pose.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pose.posing_tips.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filters.categories.length > 0 && !filters.categories.includes(pose.category)) {
      return false;
    }
    
    if (filters.difficultyLevels.length > 0 && !filters.difficultyLevels.includes(pose.difficulty_level)) {
      return false;
    }
    
    if (filters.locationTypes.length > 0 && !filters.locationTypes.includes(pose.location_type)) {
      return false;
    }
    
    return true;
  });

  if (selectedPose) {
    const poseComments = comments.filter(c => c.pose_id === selectedPose.id);
    
    return (
      <PoseDetailView
        pose={selectedPose}
        comments={poseComments}
        isLiked={likedPoses.has(selectedPose.id)}
        isSaved={savedPoses.has(selectedPose.id)}
        onClose={handleClosePoseDetail}
        onLike={handleLike}
        onSave={handleSave}
        onComment={() => {}}
        onShare={handleShare}
        onAddComment={handleAddComment}
      />
    );
  }

  return (
    <>
      <StyledContainer>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Community Posing Library
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover & Learn from {poses.length} inspiring poses
            </Typography>
          </Box>

          {/* Search and Filters */}
          <SearchContainer>
            <Stack spacing={2}>
              <SearchField
                fullWidth
                placeholder="Search poses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort by</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort by"
                    onChange={(e) => handleSortChange(e.target.value as SortBy)}
                  >
                    {Object.values(SortBy).map((sort) => (
                      <MenuItem key={sort} value={sort}>
                        {formatSortBy(sort)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  variant="outlined"
                  startIcon={<FilterAltOutlinedIcon />}
                  onClick={() => setShowFilters(true)}
                  sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
                >
                  Filters
                </Button>
              </Stack>
            </Stack>
          </SearchContainer>

          {/* Loading State */}
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Poses Grid */}
          {!loading && !error && (
            <>
              {filteredPoses.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No poses found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or search terms
                  </Typography>
                </Box>
              ) : (
                <>
                  <PoseGrid>
                    {filteredPoses.map((pose) => (
                      <PoseGridItem
                        key={pose.id}
                        pose={pose}
                        onSelect={handlePoseSelect}
                      />
                    ))}
                  </PoseGrid>

                  {/* Load More Button */}
                  {hasMore && (
                    <LoadMoreContainer>
                      <Button
                        variant="outlined"
                        onClick={loadPoses}
                        disabled={loading as any}
                        sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Load More'}
                      </Button>
                    </LoadMoreContainer>
                  )}
                </>
              )}
            </>
          )}
        </Stack>
      </StyledContainer>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        open={showFilters as any}
        filters={filters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </>
  );
};