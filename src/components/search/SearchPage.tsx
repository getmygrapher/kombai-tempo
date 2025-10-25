import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { ProfessionalCard } from '../professionals/ProfessionalCard';
import { Professional } from '../../types';
import { useAppStore } from '../../store/appStore';
import { useNearbyProfessionals } from '../../hooks/useProfessionals';

interface SearchPageProps {
  onViewProfile: (professionalId: string) => void;
  onSendMessage: (professionalId: string) => void;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

export const SearchPage: React.FC<SearchPageProps> = ({
  onViewProfile,
  onSendMessage,
}) => {
  const { currentLocation, selectedRadius, searchFilters } = useAppStore();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const {
    data: professionalsData,
    isLoading,
    error,
    refetch,
  } = useNearbyProfessionals(
    currentLocation || { lat: 9.9312, lng: 76.2673 },
    selectedRadius,
    searchFilters
  );

  useEffect(() => {
    if (professionalsData?.professionals) {
      setProfessionals(professionalsData.professionals);
    }
  }, [professionalsData]);

  const filteredProfessionals = professionals.filter(prof =>
    prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.professionalType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prof.specializations.some(spec =>
      spec.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
          Failed to load professionals. Please try again.
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Find Professionals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {professionals.length} professionals within {selectedRadius}
          </Typography>
        </Box>

        {/* Search and Filters */}
        <Stack spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by name, type, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TravelExploreOutlinedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterAltOutlinedIcon />}
            onClick={() => setShowFilters(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Advanced Filters
          </Button>
        </Stack>

        {/* Professional List */}
        {filteredProfessionals.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? 'No professionals match your search' : 'No professionals found in your area'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try different search terms' : 'Try expanding your search radius'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                showDistance={true as any}
              showAvailability={true as any}
                onViewProfile={onViewProfile}
                onSendMessage={onSendMessage}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </StyledContainer>
  );
};