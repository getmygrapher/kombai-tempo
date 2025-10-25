import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { JobCard } from './JobCard';
import { Job } from '../../types';
import { useJobDiscoveryStore } from '../../store/jobDiscoveryStore';

interface JobFeedProps {
  onOpenFilters?: () => void;
  showFilterButton?: boolean;
}

const FeedContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const SearchSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.default,
  zIndex: 10,
  paddingBottom: theme.spacing(1),
}));

const JobListContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  paddingRight: theme.spacing(0.5), // Space for scrollbar
}));

const JobSkeleton = () => (
  <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2, mb: 2 }}>
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
      </Stack>
      <Skeleton variant="rectangular" height={60} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={100} height={24} />
        <Skeleton variant="rectangular" width={60} height={24} />
      </Stack>
    </Stack>
  </Box>
);

export const JobFeed: React.FC<JobFeedProps> = ({
  onOpenFilters,
  showFilterButton = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    jobs,
    isLoading,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadJobs,
    loadMoreJobs,
    refreshJobs,
    filters
  } = useJobDiscoveryStore();

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100; // Load more when 100px from bottom

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadMoreJobs();
    }
  }, [isLoading, hasMore, loadMoreJobs]);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refreshJobs();
    setIsRefreshing(false);
  }, [refreshJobs]);

  const handleJobDetails = (jobId: string) => {
    console.log('View job details:', jobId);
  };

  const handleJobApply = (jobId: string) => {
    console.log('Apply to job:', jobId);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const hasActiveFilters = () => {
    return (
      filters.categories.length > 0 ||
      filters.urgency.length > 0 ||
      filters.budgetRange.min > 0 ||
      filters.budgetRange.max < 100000 ||
      filters.dateRange.start ||
      filters.dateRange.end
    );
  };

  return (
    <FeedContainer>
      {/* Search and Filter Section */}
      <SearchSection>
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search jobs by title, description, or type..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper',
              },
            }}
          />
          
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              {showFilterButton && onOpenFilters && (
                <Button
                  variant={hasActiveFilters() ? "contained" : "outlined"}
                  startIcon={<FilterAltOutlinedIcon />}
                  onClick={onOpenFilters}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    minWidth: 'auto',
                    px: 2,
                  }}
                >
                  Filters
                  {hasActiveFilters() && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {[
                        filters.categories.length,
                        filters.urgency.length,
                        filters.budgetRange.min > 0 || filters.budgetRange.max < 100000 ? 1 : 0,
                        filters.dateRange.start || filters.dateRange.end ? 1 : 0
                      ].reduce((sum, count) => sum + count, 0)}
                    </Box>
                  )}
                </Button>
              )}
              
              <Button
                variant="text"
                startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Stack>
            
            <Typography variant="body2" color="text.secondary">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            </Typography>
          </Stack>
        </Stack>
      </SearchSection>

      {/* Job List */}
      <JobListContainer ref={containerRef}>
        {jobs.length === 0 && !isLoading ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No jobs match your search' : 'No jobs found in your area'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery 
                ? 'Try different search terms or adjust your filters' 
                : 'Try expanding your search radius or check back later'
              }
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                showDistance={true}
                showApplicantCount={true}
                onViewDetails={handleJobDetails}
                onApply={handleJobApply}
              />
            ))}
            
            {/* Loading skeletons */}
            {isLoading && (
              <>
                <JobSkeleton />
                <JobSkeleton />
                <JobSkeleton />
              </>
            )}
            
            {/* Load more indicator */}
            {hasMore && !isLoading && jobs.length > 0 && (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary">
                  Scroll down to load more jobs
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </JobListContainer>
    </FeedContainer>
  );
};