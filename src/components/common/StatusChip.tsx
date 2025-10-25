import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { UrgencyLevel, AvailabilityStatus, TierType } from '../../types/enums';

interface StatusChipProps {
  status: UrgencyLevel | AvailabilityStatus | TierType | string;
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
}

const StyledChip = styled(Chip)<{ statustype: string }>(({ theme, statustype }) => {
  const getStatusColor = () => {
    switch (statustype) {
      case UrgencyLevel.EMERGENCY:
        return {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
        };
      case UrgencyLevel.URGENT:
        return {
          backgroundColor: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
        };
      case UrgencyLevel.NORMAL:
        return {
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
        };
      case AvailabilityStatus.AVAILABLE:
        return {
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
        };
      case AvailabilityStatus.PARTIALLY_AVAILABLE:
        return {
          backgroundColor: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
        };
      case AvailabilityStatus.UNAVAILABLE:
        return {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
        };
      case AvailabilityStatus.BOOKED:
        return {
          backgroundColor: theme.palette.info.main,
          color: theme.palette.info.contrastText,
        };
      case TierType.PRO:
        return {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        };
      case TierType.FREE:
        return {
          backgroundColor: theme.palette.grey[500],
          color: theme.palette.common.white,
        };
      default:
        return {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
        };
    }
  };

  return {
    ...getStatusColor(),
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: '0.75rem',
  };
});

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  variant = 'filled',
  size = 'small',
}) => {
  return (
    <StyledChip
      label={status}
      variant={variant}
      size={size}
      statustype={status}
    />
  );
};