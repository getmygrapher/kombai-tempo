import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  Chip,
  Avatar,
  Box,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import InstagramIcon from '@mui/icons-material/Instagram';
import { Professional } from '../../types';
import { TierType } from '../../types/enums';
import { formatCurrency } from '../../utils/formatters';
import { StatusChip } from '../common/StatusChip';
import { DistanceIndicator } from '../common/DistanceIndicator';
import { RatingDisplay } from '../common/RatingDisplay';

interface ProfessionalCardProps {
  professional: Professional;
  showDistance?: boolean;
  showAvailability?: boolean;
  onViewProfile: (professionalId: string) => void;
  onSendMessage: (professionalId: string) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
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
  fontWeight: theme.typography.fontWeightMedium,
}));

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  showDistance = true,
  showAvailability = true,
  onViewProfile,
  onSendMessage,
}) => {
  const handleCardClick = () => {
    onViewProfile(professional.id);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSendMessage(professional.id);
  };

  return (
    <StyledCard onClick={handleCardClick} sx={{ position: 'relative' }}>
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
                <Typography variant="h6">
                  {professional.name}
                </Typography>
                {professional.isVerified && (
                  <VerifiedIcon
                    color="primary"
                    sx={{ fontSize: 18 }}
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
          <Stack direction="row" spacing={1} flexWrap="wrap">
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
                label={`+${professional.specializations.length - 2} more`}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
          </Stack>

          {/* Pricing */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body1" fontWeight="medium">
              {formatCurrency(professional.pricing.rate)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {professional.pricing.type}
            </Typography>
            {professional.pricing.isNegotiable && (
              <Chip label="Negotiable" size="small" color="success" />
            )}
          </Stack>

          {/* Location & Distance */}
          {showDistance && professional.distance && (
            <DistanceIndicator
              distance={professional.distance}
              location={professional.location.city}
            />
          )}

          {/* Availability */}
          {showAvailability && professional.availability && (
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip
                status={professional.availability.isAvailableToday ? 'Available Today' : 'Not Available Today'}
              />
              <Typography variant="caption" color="text.secondary">
                Next available: {new Date(professional.availability.nextAvailable).toLocaleDateString()}
              </Typography>
            </Stack>
          )}

          {/* Instagram Handle */}
          {professional.instagramHandle && professional.tier === TierType.PRO && (
            <Stack direction="row" spacing={1} alignItems="center">
              <InstagramIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {professional.instagramHandle}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {professional.experience} experience
        </Typography>
        <IconButton
          size="small"
          onClick={handleMessageClick}
          color="primary"
        >
          <MessageOutlinedIcon />
        </IconButton>
      </CardActions>
    </StyledCard>
  );
};