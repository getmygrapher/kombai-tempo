import React, { useState } from 'react';
import { Box, ThemeProvider, CssBaseline, Container, Typography, Stack, Fab } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BrowserRouter as Router } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import theme from './theme';
import { JobFeedPage } from './pages/jobs/JobFeedPage';
import { FilterModal } from './components/jobs/FilterModal';
import { ActiveFiltersChips } from './components/jobs/ActiveFiltersChips';
import { JobCard } from './components/jobs/JobCard';
import { useNearbyJobs } from './hooks/useJobs';
import { DistanceRadius } from './types';
import { getDefaultLocation } from './utils/locationUtils';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const JobSystemPreview: React.FC = () => {
  const [currentView, setCurrentView] = useState<'feed' | 'modal' | 'components'>('feed');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [mockFilters, setMockFilters] = useState({
    categories: [],
    urgency: [],
    budgetRange: { min: 0, max: 100000 },
    distance: 'TWENTY_FIVE_KM' as any,
    dateRange: { start: '', end: '' }
  });
  const defaultLocation = getDefaultLocation();
  const { data: nearbyData, isLoading: nearbyLoading } = useNearbyJobs(defaultLocation, DistanceRadius.TWENTY_FIVE_KM);

  const handleJobDetails = (jobId: string) => {
    console.log('View job details:', jobId);
  };

  const handleJobApply = (jobId: string) => {
    console.log('Apply to job:', jobId);
  };

  const handleRemoveFilter = (filterType: string, value?: any) => {
    console.log('Remove filter:', filterType, value);
  };

  const ViewSelector = () => (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
        Job System Preview
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        {[
          { key: 'feed', label: 'Job Feed Page' },
          { key: 'modal', label: 'Filter Modal' },
          { key: 'components', label: 'Individual Components' }
        ].map((view) => (
          <Box
            key={view.key}
            onClick={() => setCurrentView(view.key as any)}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              cursor: 'pointer',
              backgroundColor: currentView === view.key ? 'primary.main' : 'grey.100',
              color: currentView === view.key ? 'white' : 'text.primary',
              fontWeight: currentView === view.key ? 'bold' : 'normal',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 2,
              },
            }}
          >
            {view.label}
          </Box>
        ))}
      </Stack>
    </Box>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'feed':
        return (
          <Box sx={{ height: '80vh', border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <JobFeedPage />
          </Box>
        );
      
      case 'modal':
        return (
          <Container maxWidth="md">
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Filter Modal Demo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click the button below to open the filter modal
                </Typography>
                <Box
                  onClick={() => setShowFilterModal(true)}
                  sx={{
                    p: 3,
                    border: 2,
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'primary.50',
                    '&:hover': {
                      backgroundColor: 'primary.100',
                    },
                  }}
                >
                  <Typography variant="h6" color="primary.main">
                    Open Filter Modal
                  </Typography>
                </Box>
              </Box>
            </Stack>
            
            <FilterModal
              open={showFilterModal}
              onClose={() => setShowFilterModal(false)}
              filters={mockFilters}
              onFiltersChange={(newFilters) => setMockFilters({ ...mockFilters, ...newFilters })}
              onClearFilters={() => setMockFilters({
                categories: [],
                urgency: [],
                budgetRange: { min: 0, max: 100000 },
                distance: 'TWENTY_FIVE_KM' as any,
                dateRange: { start: '', end: '' }
              })}
            />
          </Container>
        );
      
      case 'components':
        return (
          <Container maxWidth="md">
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Active Filters Chips
                </Typography>
                <ActiveFiltersChips
                  filters={{
                    categories: ['PHOTOGRAPHY' as any],
                    urgency: ['URGENT' as any],
                    budgetRange: { min: 5000, max: 25000 },
                    distance: 'TEN_KM' as any,
                    dateRange: { start: '2024-01-15', end: '2024-01-30' }
                  }}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAll={() => console.log('Clear all filters')}
                />
              </Box>
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  Job Cards
                </Typography>
                <Stack spacing={2}>
                  {nearbyLoading && (
                    <Typography variant="body2" color="text.secondary">Loading jobs…</Typography>
                  )}
                  {nearbyData?.jobs?.slice(0, 2).map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      showDistance={true}
                      showApplicantCount={true}
                      onViewDetails={handleJobDetails}
                      onApply={handleJobApply}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Container>
        );
      
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 4 }}>
              <Container maxWidth="xl">
                <ViewSelector />
                {renderCurrentView()}
              </Container>
            </Box>
          </Router>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default JobSystemPreview;