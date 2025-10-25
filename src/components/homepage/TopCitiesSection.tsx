import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { CityInfo } from '../../types/homepage';
import { formatCityStats } from '../../utils/homepageFormatters';

interface TopCitiesSectionProps {
  cities: CityInfo[];
  isLoading?: boolean;
  onViewAll: () => void;
  onCitySelect: (cityId: string) => void;
}

const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}));

const CityCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
  minHeight: 120,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const CityName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  marginBottom: theme.spacing(0.5)
}));

const CityStats = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  opacity: 0.9,
  marginBottom: theme.spacing(1)
}));

export const TopCitiesSection: React.FC<TopCitiesSectionProps> = ({
  cities,
  isLoading = false,
  onViewAll,
  onCitySelect
}) => {
  const handleCityClick = (cityId: string) => {
    onCitySelect(cityId);
  };

  if (isLoading) {
    return (
      <SectionContainer>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </Stack>
        <Grid container spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 2 }}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </SectionContainer>
    );
  }

  if (!cities || cities.length === 0) {
    return null;
  }

  return (
    <SectionContainer>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Hire from Top Cities
        </Typography>
        <Button
          variant="text"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onViewAll}
          size="small"
        >
          View All Cities
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {cities.slice(0, 6).map((city) => (
          <Grid key={city.id} size={{ xs: 6, sm: 4, md: 2 }}>
            <CityCard onClick={() => handleCityClick(city.id)}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
                    <CityName variant="h6">
                      {city.name}
                    </CityName>
                  </Stack>
                  
                  <CityStats variant="body2">
                    {formatCityStats(city.professionalCount, city.averageRating)}
                  </CityStats>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Popular: {city.popularCategories.slice(0, 2).join(', ')}
                  </Typography>
                </Box>
              </CardContent>
            </CityCard>
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  );
};