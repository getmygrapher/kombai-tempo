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
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { JobCard } from '../jobs/JobCard';
import { RatingDisplay } from '../common/RatingDisplay';
import { Job } from '../../types';
import { useAppStore } from '../../store/appStore';
import { useNearbyJobs } from '../../hooks/useJobs';

interface EnhancedHomePageProps {
  onJobDetails: (jobId: string) => void;
  onJobApply: (jobId: string) => void;
  onCreateJob: () => void;
  onViewProfile: (professionalId: string) => void;
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

const ProfessionalCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const FeaturedSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

// Mock featured professionals data
const mockFeaturedProfessionals = [
  {
    id: 'prof_123',
    name: 'Arjun Menon',
    profilePhoto: 'https://i.pravatar.cc/150?img=1',
    professionalType: 'Wedding Photographer',
    location: { city: 'Kochi', state: 'Kerala' },
    rating: 4.8,
    totalReviews: 47,
    isVerified: true,
    tier: 'Pro',
    specializations: ['Wedding Photography', 'Portrait Photography'],
  },
  {
    id: 'prof_124',
    name: 'Priya Sharma',
    profilePhoto: 'https://i.pravatar.cc/150?img=2',
    professionalType: 'Event Photographer',
    location: { city: 'Mumbai', state: 'Maharashtra' },
    rating: 4.9,
    totalReviews: 63,
    isVerified: true,
    tier: 'Pro',
    specializations: ['Event Photography', 'Corporate Photography'],
  },
  {
    id: 'prof_125',
    name: 'Raj Kumar',
    profilePhoto: 'https://i.pravatar.cc/150?img=3',
    professionalType: 'Videographer',
    location: { city: 'Bangalore', state: 'Karnataka' },
    rating: 4.7,
    totalReviews: 35,
    isVerified: false,
    tier: 'Free',
    specializations: ['Wedding Videography', 'Commercial Videos'],
  },
];

export const EnhancedHomePage: React.FC<EnhancedHomePageProps> = ({
  onJobDetails,
  onJobApply,
  onCreateJob,
  onViewProfile,
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

  const handleProfessionalClick = (professionalId: string) => {
    onViewProfile(professionalId);
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
        <Stack spacing={4}>
          {/* Featured Professionals Section */}
          <FeaturedSection>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Featured Professionals
            </Typography>
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
              {mockFeaturedProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  sx={{ minWidth: 280, flexShrink: 0 }}
                  onClick={() => handleProfessionalClick(professional.id)}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={professional.profilePhoto}
                          sx={{ width: 48, height: 48 }}
                        >
                          {professional.name.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1" fontWeight="medium">
                              {professional.name}
                            </Typography>
                            {professional.isVerified && (
                              <VerifiedOutlinedIcon color="primary" sx={{ fontSize: 16 }} />
                            )}
                            {professional.tier === 'Pro' && (
                              <Chip label="PRO" size="small" color="secondary" />
                            )}
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {professional.professionalType}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationOnOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {professional.location.city}, {professional.location.state}
                        </Typography>
                      </Stack>

                      <RatingDisplay
                        rating={professional.rating}
                        totalReviews={professional.totalReviews}
                        size="small"
                      />

                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {professional.specializations.slice(0, 2).map((spec, index) => (
                          <Chip
                            key={index}
                            label={spec}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </ProfessionalCard>
              ))}
            </Stack>
          </FeaturedSection>

          {/* Jobs Section */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
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
          </Box>
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