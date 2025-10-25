import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Professional, ViewerPermissions } from '../../data/profileViewSystemMockData';
import { PrivacyGate } from './PrivacyGate';

interface PricingDisplayProps {
  professional: Professional;
  viewerPermissions: ViewerPermissions;
}

interface PricingInfo {
  baseRate: number;
  pricingType: 'hourly' | 'daily' | 'project' | 'package';
  isNegotiable: boolean;
  packages?: {
    name: string;
    price: number;
    duration: string;
    includes: string[];
  }[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const PriceTag = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'baseline',
  gap: theme.spacing(0.5),
}));

const PackageCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

// Mock pricing data - in real app this would come from the professional's profile
const getMockPricingData = (professional: Professional): PricingInfo => {
  return {
    baseRate: professional.professionalType.includes('Wedding') ? 25000 : 15000,
    pricingType: professional.professionalType.includes('Wedding') ? 'daily' : 'hourly',
    isNegotiable: true,
    packages: [
      {
        name: 'Basic Package',
        price: professional.professionalType.includes('Wedding') ? 35000 : 8000,
        duration: professional.professionalType.includes('Wedding') ? '6 hours' : '2 hours',
        includes: [
          '50+ edited photos',
          'Online gallery',
          'Basic retouching'
        ]
      },
      {
        name: 'Premium Package',
        price: professional.professionalType.includes('Wedding') ? 65000 : 15000,
        duration: professional.professionalType.includes('Wedding') ? '10 hours' : '4 hours',
        includes: [
          '100+ edited photos',
          'Online gallery',
          'Advanced retouching',
          'Print release',
          '2 outfit changes'
        ]
      }
    ]
  };
};

const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

const getPricingTypeLabel = (type: string): string => {
  switch (type) {
    case 'hourly': return 'per hour';
    case 'daily': return 'per day';
    case 'project': return 'per project';
    case 'package': return 'per package';
    default: return '';
  }
};

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  professional,
  viewerPermissions
}) => {
  const pricingData = getMockPricingData(professional);

  const PricingContent = () => (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" component="h3">
                Pricing Information
              </Typography>
              <Tooltip title="Pricing may vary based on project requirements and location">
                <IconButton size="small" aria-label="Pricing information">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Base Rate */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PriceTag>
                <Typography variant="h4" component="span" color="primary">
                  {formatPrice(pricingData.baseRate)}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {getPricingTypeLabel(pricingData.pricingType)}
                </Typography>
              </PriceTag>
              
              {pricingData.isNegotiable && (
                <Chip
                  label="Negotiable"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Starting rate • Final pricing depends on project scope
            </Typography>
          </Box>

          <Divider />

          {/* Packages */}
          {pricingData.packages && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Popular Packages
              </Typography>
              <Stack spacing={2}>
                {pricingData.packages.map((pkg, index) => (
                  <PackageCard key={index} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {pkg.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {pkg.duration}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary">
                            {formatPrice(pkg.price)}
                          </Typography>
                        </Stack>
                        
                        <Stack spacing={0.5}>
                          {pkg.includes.map((item, itemIndex) => (
                            <Stack key={itemIndex} direction="row" spacing={1} alignItems="center">
                              <CheckCircleIcon 
                                sx={{ 
                                  fontSize: 16, 
                                  color: 'success.main' 
                                }} 
                              />
                              <Typography variant="body2">
                                {item}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </PackageCard>
                ))}
              </Stack>
            </Box>
          )}

          {/* Disclaimer */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'action.hover', 
            borderRadius: 1 
          }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Note:</strong> Prices are indicative and may vary based on specific requirements, 
              location, duration, and additional services. Contact {professional.name} for a detailed quote.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </StyledCard>
  );

  return (
    <PrivacyGate
      viewerPermissions={viewerPermissions}
      requiredPermission="canViewPricing"
      gateType="pricing"
      fallbackContent={
        <StyledCard>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Pricing Available on Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contact {professional.name} directly for detailed pricing information.
            </Typography>
          </CardContent>
        </StyledCard>
      }
    >
      <PricingContent />
    </PrivacyGate>
  );
};