import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AvailabilityStatus } from '../../types/enums';
import { TimeSlot } from '../../types/availability';
import { formatTimeSlot } from '../../utils/availabilityFormatters';

const CellContainer = styled(Paper)<{ 
  status?: AvailabilityStatus; 
  isSelected?: boolean; 
  isToday?: boolean; 
  isPast?: boolean; 
}>(({ theme, status, isSelected, isToday, isPast }) => {
  const getStatusColor = () => {
    if (isPast) {
      return {
        backgroundColor: theme.palette.grey[100],
        color: theme.palette.text.disabled,
        cursor: 'not-allowed',
      };
    }

    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return {
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.contrastText,
          borderColor: theme.palette.success.main,
        };
      case AvailabilityStatus.PARTIALLY_AVAILABLE:
        return {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.warning.contrastText,
          borderColor: theme.palette.warning.main,
        };
      case AvailabilityStatus.BOOKED:
        return {
          backgroundColor: theme.palette.info.light,
          color: theme.palette.info.contrastText,
          borderColor: theme.palette.info.main,
        };
      case AvailabilityStatus.UNAVAILABLE:
        return {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.contrastText,
          borderColor: theme.palette.error.main,
        };
      default:
        return {
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider,
        };
    }
  };

  const statusColors = getStatusColor();

  return {
    padding: theme.spacing(1),
    minHeight: 80,
    cursor: isPast ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: `2px solid ${isSelected ? theme.palette.primary.main : statusColors.borderColor || theme.palette.divider}`,
    position: 'relative',
    ...statusColors,
    
    ...(isToday && {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
    }),
    
    '&:hover': isPast ? {} : {
      transform: 'scale(1.02)',
      boxShadow: theme.shadows[3],
      zIndex: 1,
    },
    
    ...(isSelected && {
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}40`,
    }),
  };
});

const DateNumber = styled(Typography)<{ isToday?: boolean }>(({ theme, isToday }) => ({
  fontWeight: isToday ? 700 : 600,
  fontSize: '1rem',
  lineHeight: 1,
}));

const StatusLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.65rem',
  fontWeight: 500,
  opacity: 0.9,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const TimeSlotIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.25),
  marginTop: theme.spacing(0.5),
}));

const TimeSlotChip = styled(Chip)(({ theme }) => ({
  height: 16,
  fontSize: '0.6rem',
  '& .MuiChip-label': {
    padding: theme.spacing(0, 0.5),
  },
}));

interface DateCellProps {
  date: Date;
  dayNumber: number;
  status?: AvailabilityStatus;
  timeSlots?: TimeSlot[];
  isToday?: boolean;
  isPast?: boolean;
  isSelected?: boolean;
  onClick: (date: Date) => void;
  onTimeSlotClick?: (timeSlot: TimeSlot) => void;
}

export const DateCell: React.FC<DateCellProps> = ({
  date,
  dayNumber,
  status,
  timeSlots = [],
  isToday = false,
  isPast = false,
  isSelected = false,
  onClick,
  onTimeSlotClick,
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isPast) {
      onClick(date);
    }
  };

  const handleTimeSlotClick = (timeSlot: TimeSlot, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onTimeSlotClick && !isPast) {
      onTimeSlotClick(timeSlot);
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case AvailabilityStatus.AVAILABLE:
        return 'Available';
      case AvailabilityStatus.BOOKED:
        return 'Booked';
      case AvailabilityStatus.PARTIALLY_AVAILABLE:
        return 'Partial';
      case AvailabilityStatus.UNAVAILABLE:
        return 'Unavailable';
      default:
        return '';
    }
  };

  const bookedSlots = timeSlots.filter(slot => slot.isBooked);
  const availableSlots = timeSlots.filter(slot => !slot.isBooked);

  const tooltipContent = (
    <Stack spacing={0.5}>
      <Typography variant="caption" fontWeight="bold">
        {date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
      </Typography>
      {status && (
        <Typography variant="caption">
          Status: {getStatusLabel()}
        </Typography>
      )}
      {bookedSlots.length > 0 && (
        <Box>
          <Typography variant="caption" fontWeight="medium">
            Booked:
          </Typography>
          {bookedSlots.map(slot => (
            <Typography key={slot.id} variant="caption" display="block">
              • {formatTimeSlot(slot.start, slot.end)}
              {slot.jobTitle && ` - ${slot.jobTitle}`}
            </Typography>
          ))}
        </Box>
      )}
      {availableSlots.length > 0 && (
        <Box>
          <Typography variant="caption" fontWeight="medium">
            Available:
          </Typography>
          {availableSlots.map(slot => (
            <Typography key={slot.id} variant="caption" display="block">
              • {formatTimeSlot(slot.start, slot.end)}
            </Typography>
          ))}
        </Box>
      )}
    </Stack>
  );

  return (
    <Tooltip title={tooltipContent} placement="top" arrow>
      <CellContainer
        status={status}
        isSelected={isSelected as any}
        isToday={isToday as any}
      isPast={isPast as any}
        elevation={isSelected ? 2 : 1}
        onClick={handleClick}
      >
        <Stack spacing={0.5} height="100%">
          <DateNumber isToday={isToday as any}>
            {dayNumber}
          </DateNumber>
          
          {status && (
            <StatusLabel>
              {getStatusLabel()}
            </StatusLabel>
          )}
          
          {timeSlots.length > 0 && (
            <TimeSlotIndicator>
              {timeSlots.slice(0, 2).map(slot => (
                <TimeSlotChip
                  key={slot.id}
                  label={`${slot.start}-${slot.end}`}
                  size="small"
                  variant={slot.isBooked ? "filled" : "outlined"}
                  color={slot.isBooked ? "primary" : "default"}
                  onClick={(e) => handleTimeSlotClick(slot, e)}
                />
              ))}
              {timeSlots.length > 2 && (
                <TimeSlotChip
                  label={`+${timeSlots.length - 2}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </TimeSlotIndicator>
          )}
          
          {bookedSlots.length > 0 && (
            <Typography variant="caption" sx={{ mt: 'auto', opacity: 0.8 }}>
              {bookedSlots.length} booking{bookedSlots.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Stack>
      </CellContainer>
    </Tooltip>
  );
};