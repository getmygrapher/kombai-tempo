import React, { useState } from 'react';
import { Box, Container, Typography, Stack, IconButton, Fab, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { JobFeed } from '../../components/jobs/JobFeed';
import { FilterModal } from '../../components/jobs/FilterModal';
import { ActiveFiltersChips } from '../../components/jobs/ActiveFiltersChips';
import { useJobDiscoveryStore } from '../../store/jobDiscoveryStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ContentSection = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));

export const JobFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const { 
    filters, 
    setFilters, 
    clearFilters,
    jobs,
    isLoading 
  } = useJobDiscoveryStore();

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (filterType: string, value?: any) => {
    switch (filterType) {
      case 'category': {
        const newCategories = filters.categories.filter(cat => cat !== value);
        setFilters({ categories: newCategories });
        break;
      }
      case 'urgency': {
        const newUrgency = filters.urgency.filter(urg => urg !== value);
        setFilters({ urgency: newUrgency });
        break;
      }
      case 'budget':
        setFilters({ budgetRange: { min: 0, max: 100000 } });
        break;
      case 'dateRange':
        setFilters({ dateRange: { start: '', end: '' } });
        break;
    }
  };

  const handleCreateJob = () => {
    navigate('/jobs/new');
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
    <StyledContainer maxWidth="lg">
      {/* Header */}
      <HeaderSection>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {isMobile && (
            <IconButton 
              onClick={() => navigate('/home')} 
              edge="start"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Browse Jobs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discover opportunities near you
            </Typography>
          </Box>
        </Stack>

        {/* Active Filters */}
        {hasActiveFilters() && (
          <Box sx={{ mt: 2 }}>
            <ActiveFiltersChips
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={clearFilters}
            />
          </Box>
        )}
      </HeaderSection>

      {/* Job Feed */}
      <ContentSection>
        <JobFeed 
          onOpenFilters={() => setShowFilterModal(true)}
          showFilterButton={true}
        />
      </ContentSection>

      {/* Filter Modal */}
      <FilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={clearFilters}
        onApplyFilters={() => {
          // Filters are already applied via onFiltersChange
          setShowFilterModal(false);
        }}
      />

      {/* Create Job FAB */}
      <Fab
        color="primary"
        onClick={handleCreateJob}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 80 : 24,
          right: 16,
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </Fab>
    </StyledContainer>
  );
};