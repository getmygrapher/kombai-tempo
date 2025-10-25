import React from 'react';
import {
  Stack,
  Chip,
  Typography,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AvailabilityStatus } from '../../types/availability';

const LegendContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const LegendChip = styled(Chip)<{ status: AvailabilityStatus }>(({ theme, status }) => {
  const getStatusColors = () => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return {
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.dark,
          borderColor: theme.palette.success.main,
        };
      case AvailabilityStatus.PARTIALLY_AVAILABLE:
        return {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.warning.dark,
          borderColor: theme.palette.warning.main,
        };
      case AvailabilityStatus.BOOKED:
        return {
          backgroundColor: theme.palette.info.light,
          color: theme.palette.info.dark,
          borderColor: theme.palette.info.main,
        };
      case AvailabilityStatus.UNAVAILABLE:
        return {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.dark,
          borderColor: theme.palette.error.main,
        };
      default:
        return {
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.text.secondary,
          borderColor: theme.palette.divider,
        };
    }
  };

  const colors = getStatusColors();

  return {
    ...colors,
    border: `1px solid ${colors.borderColor}`,
    fontWeight: 500,
    '& .MuiChip-icon': {
      color: colors.color,
    },
  };
});

const StatusIndicator = styled(Box)<{ status: AvailabilityStatus }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return theme.palette.success.main;
      case AvailabilityStatus.PARTIALLY_AVAILABLE:
        return theme.palette.warning.main;
      case AvailabilityStatus.BOOKED:
        return theme.palette.info.main;
      case AvailabilityStatus.UNAVAILABLE:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[400];
    }
  };

  return {
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: getStatusColor(),
    marginRight: theme.spacing(1),
    flexShrink: 0,
  };
});

interface CalendarLegendProps {
  showTitle?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium';
  hideOnMobile?: boolean;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({
  showTitle = true,
  orientation = 'horizontal',
  size = 'medium',
  hideOnMobile = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (hideOnMobile && isMobile) {
    return null;
  }

  const legendItems = [
    {
      status: AvailabilityStatus.AVAILABLE,
      label: 'Available',
      description: 'Free time slots for booking',
    },
    {
      status: AvailabilityStatus.PARTIALLY_AVAILABLE,
      label: 'Partially Available',
      description: 'Some time slots are booked',
    },
    {
      status: AvailabilityStatus.BOOKED,
      label: 'Booked',
      description: 'Confirmed bookings',
    },
    {
      status: AvailabilityStatus.UNAVAILABLE,
      label: 'Unavailable',
      description: 'Not available for booking',
    },
  ];

  return (
    <LegendContainer>
      {showTitle && (
        <Typography
          variant="subtitle2"
          fontWeight={600}
          color="text.secondary"
          sx={{ mb: 1.5 }}
        >
          Availability Status
        </Typography>
      )}
      
      <Stack
        direction={orientation === 'horizontal' ? 'row' : 'column'}
        spacing={orientation === 'horizontal' ? 2 : 1}
        flexWrap={orientation === 'horizontal' ? 'wrap' : 'nowrap'}
        useFlexGap
      >
        {legendItems.map((item) => (
          <Stack
            key={item.status}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              minWidth: orientation === 'horizontal' ? 'auto' : '200px',
            }}
          >
            <StatusIndicator status={item.status} />
            <Box>
              <Typography
                variant={size === 'small' ? 'caption' : 'body2'}
                fontWeight={500}
                color="text.primary"
              >
                {item.label}
              </Typography>
              {size === 'medium' && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ lineHeight: 1.2 }}
                >
                  {item.description}
                </Typography>
              )}
            </Box>
          </Stack>
        ))}
      </Stack>
    </LegendContainer>
  );
};

// Alternative chip-based legend for compact spaces
export const CompactCalendarLegend: React.FC = () => {
  const legendItems = [
    { status: AvailabilityStatus.AVAILABLE, label: 'Available' },
    { status: AvailabilityStatus.PARTIALLY_AVAILABLE, label: 'Partial' },
    { status: AvailabilityStatus.BOOKED, label: 'Booked' },
    { status: AvailabilityStatus.UNAVAILABLE, label: 'Unavailable' },
  ];

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {legendItems.map((item) => (
        <LegendChip
          key={item.status}
          status={item.status}
          label={item.label}
          size="small"
          variant="outlined"
        />
      ))}
    </Stack>
  );
};