import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Button,
  Box,
  CircularProgress,
  Alert,
  Fab,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { JobCard } from '../jobs/JobCard';
import { Job } from '../../types';
import { useAppStore } from '../../store/appStore';
import { useNearbyJobs } from '../../hooks/useJobs';

interface HomePageProps {
  onJobDetails: (jobId: string) => void;
  onJobApply: (jobId: string) => void;
  onCreateJob: () => void;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10), // Above bottom navigation
  right: theme.spacing(2),
  zIndex: 1000,
}));

export const HomePage: React.FC<HomePageProps> = ({
  onJobDetails,
  onJobApply,
  onCreateJob,
}) => {
  const { currentLocation, selectedRadius, jobFilters } = useAppStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useNearbyJobs(
    currentLocation || { lat: 9.9312, lng: 76.2673 },
    selectedRadius,
    jobFilters
  );

  useEffect(() => {
    if (jobsData?.jobs) {
      setJobs(jobsData.jobs);
    }
  }, [jobsData]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          Failed to load jobs. Please try again.
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <>
      <StyledContainer>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Jobs Near You
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {jobs.length} opportunities within {selectedRadius}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<FilterAltOutlinedIcon />}
              onClick={() => setShowFilters(true)}
            >
              Filters
            </Button>
          </Stack>

          {/* Job List */}
          {jobs.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No jobs found in your area
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Try expanding your search radius or check back later
              </Typography>
              <Button variant="contained" onClick={onCreateJob} sx={{ mt: 2 }}>
                Post Your First Job
              </Button>
            </Box>
          ) : (
            <Stack spacing={2}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showDistance={true as any}
              showApplicantCount={true as any}
                  onViewDetails={onJobDetails}
                  onApply={onJobApply}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </StyledContainer>

      {/* Floating Action Button */}
      <FloatingActionButton
        color="primary"
        aria-label="post job"
        onClick={onCreateJob}
      >
        <AddIcon />
      </FloatingActionButton>
    </>
  );
};