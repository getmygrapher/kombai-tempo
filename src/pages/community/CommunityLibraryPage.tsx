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
import { PoseGridItem } from '../../components/community/PoseGridItem';
import { FilterBottomSheet } from '../../components/community/FilterBottomSheet';
import { 
  CommunityPose, 
  LibraryFilters, 
  SortBy 
} from '../../types/community';
import { formatSortBy } from '../../utils/communityFormatters';
import { communityService } from '../../services/communityService';
import { useCommunityStore } from '../../store/communityStore';
import communityTheme from '../../theme/communityTheme';

interface CommunityLibraryPageProps {
  onPoseSelect: (poseId: string) => void;
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

export const CommunityLibraryPage: React.FC<CommunityLibraryPageProps> = ({
  onPoseSelect,
}) => {
  const {
    currentSort,
    activeFilters,
    searchQuery,
    showFilters,
    poses,
    isLoading,
    error,
    setCurrentSort,
    setActiveFilters,
    setSearchQuery,
    setShowFilters,
    setPoses,
    setLoading,
    setError,
    clearFilters
  } = useCommunityStore();

  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Load initial data
  useEffect(() => {
    loadPoses();
  }, [currentSort, activeFilters]);

  const loadPoses = async (pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await communityService.listPoses(activeFilters, currentSort, pageNum);
      
      if (append) {
        setPoses([...poses, ...response.poses]);
      } else {
        setPoses(response.poses);
      }
      
      setHasMore(response.hasMore);
      setPage(pageNum);
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
    setCurrentSort(newSortBy);
  };

  const handleApplyFilters = (newFilters: LibraryFilters) => {
    setActiveFilters(newFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    clearFilters();
  };

  const handleLoadMore = () => {
    loadPoses(page + 1, true);
  };

  const filteredPoses = poses.filter(pose => {
    if (searchQuery && !pose.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !pose.posing_tips.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

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
                    value={currentSort}
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
          {isLoading && page === 1 && (
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
          {!isLoading && !error && (
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
                        onSelect={onPoseSelect}
                      />
                    ))}
                  </PoseGrid>

                  {/* Load More Button */}
                  {hasMore && (
                    <LoadMoreContainer>
                      <Button
                        variant="outlined"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
                      >
                        {isLoading ? <CircularProgress size={24} /> : 'Load More'}
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
        filters={activeFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
    </>
  );
};