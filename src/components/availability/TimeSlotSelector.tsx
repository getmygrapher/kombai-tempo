import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAvailabilityStore } from '../../store/availabilityStore';
import { useUpdateAvailability, useCurrentUser } from '../../hooks/useAvailability';
import { formatTimeSlot } from '../../utils/availabilityFormatters';
import { 
  TimeSlot, 
  AvailabilityStatus, 
  SlotGranularity,
  OperatingHours 
} from '../../types/availability';

const TimeSlotGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2)
}));

const TimeSlotChip = styled(ToggleButton)<{ status?: AvailabilityStatus }>(({ theme, status, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: selected
    ? theme.palette.primary.main
    : status === AvailabilityStatus.AVAILABLE
      ? theme.palette.success.light
      : status === AvailabilityStatus.PARTIALLY_AVAILABLE
        ? theme.palette.warning.light
        : status === AvailabilityStatus.BOOKED
          ? theme.palette.info.light
          : status === AvailabilityStatus.UNAVAILABLE
            ? theme.palette.error.light
            : theme.palette.background.paper,
  color: selected
    ? theme.palette.primary.contrastText
    : status === AvailabilityStatus.AVAILABLE
      ? theme.palette.success.dark
      : status === AvailabilityStatus.PARTIALLY_AVAILABLE
        ? theme.palette.warning.dark
        : status === AvailabilityStatus.BOOKED
          ? theme.palette.info.dark
          : status === AvailabilityStatus.UNAVAILABLE
            ? theme.palette.error.dark
            : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: selected
      ? theme.palette.primary.dark
      : theme.palette.action.hover
  }
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500
}));

interface TimeSlotSelectorProps {
  date: Date;
  onTimeSlotSelect?: (timeSlots: TimeSlot[]) => void;
  onSaveComplete?: () => void;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  date,
  onTimeSlotSelect,
  onSaveComplete
}) => {
  const {
    selectedTimeSlots,
    setSelectedTimeSlots,
    operatingHours
  } = useAvailabilityStore();

  const [granularity, setGranularity] = useState<SlotGranularity>(SlotGranularity.ONE_HOUR);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AvailabilityStatus>(AvailabilityStatus.AVAILABLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const updateAvailabilityMutation = useUpdateAvailability();
  const { data: currentUser } = useCurrentUser();

  // Generate time slots based on operating hours and granularity
  useEffect(() => {
    const slots = generateTimeSlots(operatingHours, granularity);
    setAvailableSlots(slots);
  }, [operatingHours, granularity]);

  const generateTimeSlots = (hours: OperatingHours, granularity: SlotGranularity): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = parseInt(hours.start.split(':')[0]);
    const endHour = parseInt(hours.end.split(':')[0]);
    
    let slotDuration: number;
    switch (granularity) {
      case SlotGranularity.THIRTY_MINUTES:
        slotDuration = 30;
        break;
      case SlotGranularity.TWO_HOURS:
        slotDuration = 120;
        break;
      case SlotGranularity.FOUR_HOURS:
        slotDuration = 240;
        break;
      case SlotGranularity.FULL_DAY:
        slotDuration = (endHour - startHour) * 60;
        break;
      default:
        slotDuration = 60;
    }

    if (granularity === SlotGranularity.FULL_DAY) {
      slots.push({
        id: `slot_full_day`,
        start: hours.start,
        end: hours.end,
        status: AvailabilityStatus.AVAILABLE,
        isBooked: false
      });
    } else {
      for (let hour = startHour; hour < endHour; hour += slotDuration / 60) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${Math.min(hour + slotDuration / 60, endHour).toString().padStart(2, '0')}:00`;
        
        slots.push({
          id: `slot_${hour}`,
          start: startTime,
          end: endTime,
          status: AvailabilityStatus.AVAILABLE,
          isBooked: false
        });
      }
    }

    return slots;
  };

  const handleSlotToggle = (slot: TimeSlot) => {
    const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
    
    if (isSelected) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s.id !== slot.id));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, { ...slot, status: selectedStatus }]);
    }
  };

  const handleGranularityChange = (event: React.MouseEvent<HTMLElement>, newGranularity: SlotGranularity | null) => {
    if (newGranularity !== null) {
      setGranularity(newGranularity);
      setSelectedTimeSlots([]); // Clear selections when changing granularity
    }
  };

  const handleStatusChange = (event: React.MouseEvent<HTMLElement>, newStatus: AvailabilityStatus | null) => {
    if (newStatus !== null) {
      setSelectedStatus(newStatus);
    }
  };

  const handleQuickAction = (action: 'all_available' | 'all_unavailable' | 'clear') => {
    switch (action) {
      case 'all_available':
        setSelectedTimeSlots(availableSlots.map(slot => ({ ...slot, status: AvailabilityStatus.AVAILABLE })));
        break;
      case 'all_unavailable':
        setSelectedTimeSlots(availableSlots.map(slot => ({ ...slot, status: AvailabilityStatus.UNAVAILABLE })));
        break;
      case 'clear':
        setSelectedTimeSlots([]);
        break;
    }
  };

  const handleSaveAvailability = async () => {
    try {
      const userId = currentUser?.id;
      
      if (!userId) {
        setErrorMessage('No authenticated user found. Please log in again.');
        return;
      }
      
      await updateAvailabilityMutation.mutateAsync({
        userId,
        date: date.toISOString().split('T')[0],
        timeSlots: selectedTimeSlots,
        status: selectedTimeSlots.length > 0 ? selectedTimeSlots[0].status : AvailabilityStatus.UNAVAILABLE
      });
      
      setSuccessMessage('Availability saved successfully!');
      onTimeSlotSelect?.(selectedTimeSlots);
      
      // Close dialog after a short delay to show success message
      setTimeout(() => {
        onSaveComplete?.();
      }, 1000);
    } catch (error) {
      console.error('Failed to save availability:', error);
      setErrorMessage(`Failed to save availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const isSlotSelected = (slot: TimeSlot): boolean => {
    return selectedTimeSlots.some(s => s.id === slot.id);
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <ScheduleOutlinedIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Time Slot Management
        </Typography>
      </Stack>

      {/* Granularity Selection */}
      <Box mb={3}>
        <Typography variant="subtitle2" mb={1} fontWeight={500}>
          Time Slot Duration
        </Typography>
        <ToggleButtonGroup
          value={granularity}
          exclusive
          onChange={handleGranularityChange}
          size="small"
        >
          <ToggleButton value={SlotGranularity.THIRTY_MINUTES}>30 min</ToggleButton>
          <ToggleButton value={SlotGranularity.ONE_HOUR}>1 hour</ToggleButton>
          <ToggleButton value={SlotGranularity.TWO_HOURS}>2 hours</ToggleButton>
          <ToggleButton value={SlotGranularity.FOUR_HOURS}>4 hours</ToggleButton>
          <ToggleButton value={SlotGranularity.FULL_DAY}>Full Day</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Status Selection */}
      <Box mb={3}>
        <Typography variant="subtitle2" mb={1} fontWeight={500}>
          Availability Status
        </Typography>
        <ToggleButtonGroup
          value={selectedStatus}
          exclusive
          onChange={handleStatusChange}
          size="small"
        >
          <ToggleButton value={AvailabilityStatus.AVAILABLE}>Available</ToggleButton>
          <ToggleButton value={AvailabilityStatus.PARTIALLY_AVAILABLE}>Partially</ToggleButton>
          <ToggleButton value={AvailabilityStatus.UNAVAILABLE}>Unavailable</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Quick Actions */}
      <Box mb={3}>
        <Typography variant="subtitle2" mb={1} fontWeight={500}>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <QuickActionButton
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => handleQuickAction('all_available')}
          >
            Mark All Available
          </QuickActionButton>
          <QuickActionButton
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => handleQuickAction('all_unavailable')}
          >
            Mark All Unavailable
          </QuickActionButton>
          <QuickActionButton
            variant="outlined"
            size="small"
            onClick={() => handleQuickAction('clear')}
          >
            Clear Selection
          </QuickActionButton>
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Time Slots Grid */}
      <Typography variant="subtitle2" mb={1} fontWeight={500}>
        Select Time Slots
      </Typography>
      
      <TimeSlotGrid>
        {availableSlots.map((slot) => (
          <TimeSlotChip
            key={slot.id}
            value={slot.id}
            selected={isSlotSelected(slot)}
            status={slot.status}
            onClick={() => handleSlotToggle(slot)}
          >
            <Stack alignItems="center" spacing={0.5}>
              <Typography variant="body2" fontWeight={500}>
                {formatTimeSlot(slot.start, slot.end)}
              </Typography>
              {slot.isBooked && (
                <Chip label="Booked" size="small" color="primary" />
              )}
            </Stack>
          </TimeSlotChip>
        ))}
      </TimeSlotGrid>

      {/* Selected Slots Summary */}
      {selectedTimeSlots.length > 0 && (
        <Box mt={3}>
          <Alert severity="info">
            <Typography variant="body2">
              {selectedTimeSlots.length} time slot{selectedTimeSlots.length > 1 ? 's' : ''} selected
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Save Button */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSaveAvailability}
          disabled={updateAvailabilityMutation.isPending as any}
          startIcon={updateAvailabilityMutation.isPending ? undefined : <AddIcon />}
        >
          {updateAvailabilityMutation.isPending ? 'Saving...' : 'Save Availability'}
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Removed unused getColors helper as styling is handled via TimeSlotChip