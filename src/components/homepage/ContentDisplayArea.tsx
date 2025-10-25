import React, { useState } from 'react';
import {
  Box,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { ContentDisplayMode, ViewMode, SortOption } from '../../types/homepage';
import { Job, Professional } from '../../types';
import { JobCard } from '../jobs/JobCard';
import { ProfessionalCard } from '../professionals/ProfessionalCard';
import { formatSortOptionLabel, formatResultsCount } from '../../utils/homepageFormatters';

interface ContentDisplayAreaProps {
  displayMode: ContentDisplayMode;
  viewMode: ViewMode;
  sortBy: SortOption;
  jobs: Job[];
  professionals: Professional[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onDisplayModeChange: (mode: ContentDisplayMode) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: SortOption) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onJobSelect: (jobId: string) => void;
  onJobApply: (jobId: string) => void;
  onProfessionalSelect: (professionalId: string) => void;
  onSendMessage: (professionalId: string) => void;
}

const ControlsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3)
}));

const ContentModeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderRadius: 12,
  padding: 4,
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: 8,
    padding: '8px 20px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    '&.Mui-selected': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      '&:hover': {
        backgroundColor: theme.palette.background.paper
      }
    }
  }
}));

const ViewModeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    border: `1px solid ${theme.palette.divider}`,
    padding: '6px 12px',
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark
      }
    }
  }
}));

const ContentGrid = styled(Box, { shouldForwardProp: (prop) => prop !== 'viewMode' })<{ viewMode: ViewMode }>(({ theme, viewMode }) => ({
  display: viewMode === ViewMode.CARD ? 'grid' : 'flex',
  flexDirection: viewMode === ViewMode.LIST ? 'column' : undefined,
  gridTemplateColumns: viewMode === ViewMode.CARD ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
  gap: theme.spacing(2),
  alignItems: viewMode === ViewMode.LIST ? 'stretch' : undefined,
}));

const LoadMoreContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(3, 0)
}));

export const ContentDisplayArea: React.FC<ContentDisplayAreaProps> = ({
  displayMode,
  viewMode,
  sortBy,
  jobs,
  professionals,
  isLoading,
  error,
  hasMore,
  onDisplayModeChange,
  onViewModeChange,
  onSortChange,
  onLoadMore,
  onRefresh,
  onJobSelect,
  onJobApply,
  onProfessionalSelect,
  onSendMessage
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleDisplayModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ContentDisplayMode | null) => {
    if (newMode) {
      onDisplayModeChange(newMode);
    }
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode) {
      onViewModeChange(newMode);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await onLoadMore();
    setIsLoadingMore(false);
  };

  const currentContent = displayMode === ContentDisplayMode.JOBS ? jobs : professionals;
  const contentCount = currentContent.length;
  const contentType = displayMode === ContentDisplayMode.JOBS ? 'jobs' : 'professionals';

  return (
    <Box>
      {/* Controls */}
      <ControlsContainer>
        <Stack spacing={2}>
          {/* Display Mode Toggle */}
          <Stack direction="row" justifyContent="center">
            <ContentModeToggle
              value={displayMode}
              exclusive
              onChange={handleDisplayModeChange}
            >
              <ToggleButton value={ContentDisplayMode.JOBS}>
                Jobs ({jobs.length})
              </ToggleButton>
              <ToggleButton value={ContentDisplayMode.PROFESSIONALS}>
                Professionals ({professionals.length})
              </ToggleButton>
            </ContentModeToggle>
          </Stack>

          {/* Sort and View Controls */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => onSortChange(e.target.value as SortOption)}
                  startAdornment={<SortOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />}
                >
                  {Object.values(SortOption).map((option) => (
                    <MenuItem key={option} value={option}>
                      {formatSortOptionLabel(option)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" color="text.secondary">
                {formatResultsCount(contentCount, contentType)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshOutlinedIcon />}
                onClick={onRefresh}
                disabled={isLoading as any}
              >
                Refresh
              </Button>

              <ViewModeToggle
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value={ViewMode.CARD}>
                  <ViewModuleOutlinedIcon />
                </ToggleButton>
                <ToggleButton value={ViewMode.LIST}>
                  <ViewListOutlinedIcon />
                </ToggleButton>
              </ViewModeToggle>
            </Stack>
          </Stack>
        </Stack>
      </ControlsContainer>

      {/* Content */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button size="small" onClick={onRefresh} sx={{ ml: 1 }}>
            Retry
          </Button>
        </Alert>
      )}

      {isLoading && contentCount === 0 ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : contentCount === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {contentType} found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Try adjusting your search or filters
          </Typography>
          <Button variant="outlined" onClick={onRefresh} sx={{ mt: 2 }}>
            Refresh
          </Button>
        </Box>
      ) : (
        <>
          <ContentGrid viewMode={viewMode}>
            {displayMode === ContentDisplayMode.JOBS
              ? jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    showDistance={true as any}
              showApplicantCount={true as any}
                    onViewDetails={onJobSelect}
                    onApply={onJobApply}
                  />
                ))
              : professionals.map((professional) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    showDistance={true as any}
              showAvailability={true as any}
                    onViewProfile={onProfessionalSelect}
                    onSendMessage={onSendMessage}
                  />
                ))}
          </ContentGrid>

          {/* Load More */}
          {hasMore && (
            <LoadMoreContainer>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={isLoadingMore as any}
                startIcon={isLoadingMore ? <CircularProgress size={16} /> : undefined}
              >
                {isLoadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </LoadMoreContainer>
          )}
        </>
      )}
    </Box>
  );
};