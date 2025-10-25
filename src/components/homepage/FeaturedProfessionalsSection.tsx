import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Professional } from '../../types';
import { TierType } from '../../types/enums';
import { formatCurrency } from '../../utils/formatters';
import { RatingDisplay } from '../common/RatingDisplay';
import { FeaturedSectionType } from '../../types/homepage';
import { formatFeaturedSectionTitle } from '../../utils/homepageFormatters';

interface FeaturedProfessionalsSectionProps {
  type: FeaturedSectionType;
  professionals: Professional[];
  isLoading?: boolean;
  onViewAll: () => void;
  onProfessionalSelect: (id: string) => void;
  onSendMessage: (id: string) => void;
}

const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4)
}));

const ScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  overflowX: 'auto',
  paddingBottom: theme.spacing(1),
  '&::-webkit-scrollbar': {
    height: 6
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: 3
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3,
    '&:hover': {
      backgroundColor: theme.palette.grey[400]
    }
  }
}));

const ProfessionalCard = styled(Card)(({ theme }) => ({
  minWidth: 280,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const ProBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  padding: '2px 8px',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: theme.typography.fontWeightMedium
}));

export const FeaturedProfessionalsSection: React.FC<FeaturedProfessionalsSectionProps> = ({
  type,
  professionals,
  isLoading = false,
  onViewAll,
  onProfessionalSelect,
  onSendMessage
}) => {
  const sectionTitle = formatFeaturedSectionTitle(type);

  const handleCardClick = (professionalId: string) => {
    onProfessionalSelect(professionalId);
  };

  const handleMessageClick = (e: React.MouseEvent, professionalId: string) => {
    e.stopPropagation();
    onSendMessage(professionalId);
  };

  if (isLoading) {
    return (
      <SectionContainer>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </Stack>
        <ScrollContainer>
          {[...Array(3)].map((_, index) => (
            <Card key={index} sx={{ minWidth: 280 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Skeleton variant="circular" width={56} height={56} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton variant="text" width="60%" height={20} />
                      <Skeleton variant="text" width="40%" height={16} />
                    </Box>
                  </Stack>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </ScrollContainer>
      </SectionContainer>
    );
  }

  if (!professionals || professionals.length === 0) {
    return null;
  }

  return (
    <SectionContainer>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          {sectionTitle}
        </Typography>
        <Button
          variant="text"
          endIcon={<ArrowForwardOutlinedIcon />}
          onClick={onViewAll}
          size="small"
        >
          View All
        </Button>
      </Stack>

      <ScrollContainer>
        {professionals.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            onClick={() => handleCardClick(professional.id)}
            sx={{ position: 'relative' }}
          >
            {professional.tier === TierType.PRO && (
              <ProBadge>PRO</ProBadge>
            )}
            
            <CardContent>
              <Stack spacing={2}>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    src={professional.profilePhoto}
                    sx={{ width: 56, height: 56 }}
                  >
                    {professional.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {professional.name}
                      </Typography>
                      {professional.isVerified && (
                        <VerifiedIcon
                          color="primary"
                          sx={{ fontSize: 16 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {professional.professionalType}
                    </Typography>
                    <RatingDisplay
                      rating={professional.rating}
                      totalReviews={professional.totalReviews}
                    />
                  </Box>
                </Stack>

                {/* Specializations */}
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {professional.specializations.slice(0, 2).map((spec, index) => (
                    <Chip
                      key={index}
                      label={spec}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {professional.specializations.length > 2 && (
                    <Chip
                      label={`+${professional.specializations.length - 2}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Stack>

                {/* Pricing & Actions */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(professional.pricing.rate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {professional.pricing.type}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMessageClick(e, professional.id)}
                    color="primary"
                  >
                    <MessageOutlinedIcon />
                  </IconButton>
                </Stack>

                {/* Availability */}
                {professional.availability && (
                  <Box>
                    <Chip
                      label={professional.availability.isAvailableToday ? 'Available Today' : 'Not Available Today'}
                      size="small"
                      color={professional.availability.isAvailableToday ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </ProfessionalCard>
        ))}
      </ScrollContainer>
    </SectionContainer>
  );
};