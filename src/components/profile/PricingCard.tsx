import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import { PricingType } from '../../types/enums';
import { PricingInfo } from '../../types';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const PriceDisplay = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const FeatureList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItem-root': {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: 0,
    paddingRight: 0,
  }
}));

interface PricingCardProps {
  pricing: PricingInfo;
  additionalData?: {
    minimumHours?: number;
    overtimeRate?: number;
    inclusions?: string[];
  };
  isPreview?: boolean;
  showDetails?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  pricing,
  additionalData = {},
  isPreview = false,
  showDetails = true
}) => {
  const formatPriceDisplay = (): string => {
    const currency = '₹';
    const rate = pricing.rate.toLocaleString();
    
    switch (pricing.type) {
      case PricingType.PER_HOUR:
        return `${currency}${rate}/hour`;
      case PricingType.PER_DAY:
        return `${currency}${rate}/day`;
      case PricingType.PER_EVENT:
        return `${currency}${rate}/event`;
      default:
        return `${currency}${rate}`;
    }
  };

  const getPricingIcon = () => {
    switch (pricing.type) {
      case PricingType.PER_HOUR:
        return <AccessTimeIcon />;
      case PricingType.PER_DAY:
        return <EventIcon />;
      case PricingType.PER_EVENT:
        return <EventIcon />;
      default:
        return <EventIcon />;
    }
  };

  const getPricingDescription = (): string => {
    switch (pricing.type) {
      case PricingType.PER_HOUR:
        return additionalData.minimumHours 
          ? `Minimum ${additionalData.minimumHours} hours booking`
          : 'Hourly rate for flexible bookings';
      case PricingType.PER_DAY:
        return additionalData.overtimeRate
          ? `Overtime: ₹${additionalData.overtimeRate.toLocaleString()}/hour`
          : 'Full day photography session';
      case PricingType.PER_EVENT:
        return 'Complete event coverage package';
      default:
        return 'Professional photography services';
    }
  };

  const getIncludedFeatures = (): string[] => {
    if (additionalData.inclusions && additionalData.inclusions.length > 0) {
      return additionalData.inclusions;
    }

    // Default inclusions based on pricing type
    switch (pricing.type) {
      case PricingType.PER_HOUR:
        return [
          'High-resolution photos',
          'Basic editing',
          'Online gallery access'
        ];
      case PricingType.PER_DAY:
        return [
          'Full day coverage',
          'High-resolution photos',
          'Professional editing',
          'Online gallery',
          'Print-ready files'
        ];
      case PricingType.PER_EVENT:
        return [
          'Complete event coverage',
          'High-resolution photos',
          'Professional editing',
          'Online gallery',
          'Print-ready files',
          'Backup photographer (if needed)'
        ];
      default:
        return ['Professional photography services'];
    }
  };

  return (
    <StyledCard variant={isPreview ? "outlined" : "elevation"}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ color: 'primary.main' }}>
              {getPricingIcon()}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {pricing.type}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getPricingDescription()}
              </Typography>
            </Box>
            {pricing.isNegotiable && (
              <Chip 
                label="Negotiable" 
                size="small" 
                color="success" 
                variant="outlined"
              />
            )}
          </Stack>

          {/* Price Display */}
          <PriceDisplay>
            <Typography variant="h4" fontWeight="bold">
              {formatPriceDisplay()}
            </Typography>
            {pricing.isNegotiable && (
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Starting from
              </Typography>
            )}
          </PriceDisplay>

          {showDetails && (
            <>
              <Divider />

              {/* Included Features */}
              <Box>
                <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                  What's Included
                </Typography>
                <FeatureList>
                  {getIncludedFeatures().map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleOutlineIcon 
                          sx={{ fontSize: 18, color: 'success.main' }} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">
                            {feature}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </FeatureList>
              </Box>

              {/* Additional Info */}
              {(additionalData.minimumHours || additionalData.overtimeRate) && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                      Additional Information
                    </Typography>
                    <Stack spacing={1}>
                      {additionalData.minimumHours && (
                        <Typography variant="body2" color="text.secondary">
                          • Minimum booking: {additionalData.minimumHours} hours
                        </Typography>
                      )}
                      {additionalData.overtimeRate && (
                        <Typography variant="body2" color="text.secondary">
                          • Overtime rate: ₹{additionalData.overtimeRate.toLocaleString()}/hour
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </>
              )}
            </>
          )}

          {/* Preview Badge */}
          {isPreview && (
            <Box sx={{ textAlign: 'center', pt: 1 }}>
              <Chip 
                label="Preview" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          )}
        </Stack>
      </CardContent>
    </StyledCard>
  );
};