import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Alert,
  Box,
  Divider,
  Switch,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useAvailabilityStore } from '../../store/availabilityStore';
import { AvailabilityStatus, SlotGranularity } from '../../types/availability';

const EditorContainer = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: 400,
}));

const DateChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  maxHeight: 120,
  overflowY: 'auto',
}));

const TimeSlotContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const TimeSlotChip = styled(Chip)<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  backgroundColor: selected ? theme.palette.primary.main : theme.palette.background.paper,
  color: selected ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.action.hover,
  },
}));

interface BulkAvailabilityEditorProps {
  open: boolean;
  onClose: () => void;
  onApply: (settings: BulkEditSettings) => void;
}

interface BulkEditSettings {
  action: 'available' | 'unavailable' | 'custom';
  applyToAllDates: boolean;
  timeSlots: string[];
  customStartTime?: string;
  customEndTime?: string;
  notes?: string;
  granularity: SlotGranularity;
}

export const BulkAvailabilityEditor: React.FC<BulkAvailabilityEditorProps> = ({
  open,
  onClose,
  onApply,
}) => {
  const { selectedDates, operatingHours } = useAvailabilityStore();
  
  const [settings, setSettings] = useState<BulkEditSettings>({
    action: 'available',
    applyToAllDates: true,
    timeSlots: [],
    granularity: SlotGranularity.ONE_HOUR,
    notes: '',
  });

  const [customStartTime, setCustomStartTime] = useState<Date | null>(null);
  const [customEndTime, setCustomEndTime] = useState<Date | null>(null);

  // Generate time slots based on operating hours and granularity
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = parseInt(operatingHours.start.split(':')[0]);
    const endHour = parseInt(operatingHours.end.split(':')[0]);
    
    const increment = settings.granularity === SlotGranularity.THIRTY_MINUTES ? 0.5 : 
                     settings.granularity === SlotGranularity.TWO_HOURS ? 2 :
                     settings.granularity === SlotGranularity.FOUR_HOURS ? 4 : 1;
    
    for (let hour = startHour; hour < endHour; hour += increment) {
      const startTime = `${Math.floor(hour).toString().padStart(2, '0')}:${hour % 1 === 0 ? '00' : '30'}`;
      const endTime = `${Math.floor(hour + increment).toString().padStart(2, '0')}:${(hour + increment) % 1 === 0 ? '00' : '30'}`;
      slots.push(`${startTime}-${endTime}`);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      action: event.target.value as 'available' | 'unavailable' | 'custom',
      timeSlots: event.target.value === 'unavailable' ? [] : prev.timeSlots,
    }));
  };

  const handleTimeSlotToggle = (slot: string) => {
    setSettings(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot],
    }));
  };

  const handleSelectAllTimeSlots = () => {
    setSettings(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.length === timeSlots.length ? [] : [...timeSlots],
    }));
  };

  const handleGranularityChange = (granularity: SlotGranularity) => {
    setSettings(prev => ({
      ...prev,
      granularity,
      timeSlots: [], // Reset time slots when granularity changes
    }));
  };

  const handleApply = () => {
    const finalSettings = {
      ...settings,
      customStartTime: customStartTime?.toTimeString().slice(0, 5),
      customEndTime: customEndTime?.toTimeString().slice(0, 5),
    };
    
    onApply(finalSettings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      action: 'available',
      applyToAllDates: true,
      timeSlots: [],
      granularity: SlotGranularity.ONE_HOUR,
      notes: '',
    });
    setCustomStartTime(null);
    setCustomEndTime(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 600 }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventAvailableIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Bulk Availability Editor
          </Typography>
        </Stack>
      </DialogTitle>

      <EditorContainer>
        <Stack spacing={3}>
          {/* Selected Dates Summary */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Selected Dates ({selectedDates.length})
            </Typography>
            <DateChipContainer>
              {selectedDates.map((date, index) => (
                <Chip
                  key={index}
                  label={date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </DateChipContainer>
          </Box>

          <Divider />

          {/* Action Selection */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
              Availability Action
            </FormLabel>
            <RadioGroup
              value={settings.action}
              onChange={handleActionChange}
              row
            >
              <FormControlLabel
                value="available"
                control={<Radio />}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <EventAvailableIcon fontSize="small" color="success" />
                    <span>Mark Available</span>
                  </Stack>
                }
              />
              <FormControlLabel
                value="unavailable"
                control={<Radio />}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <EventBusyIcon fontSize="small" color="error" />
                    <span>Mark Unavailable</span>
                  </Stack>
                }
              />
              <FormControlLabel
                value="custom"
                control={<Radio />}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <AccessTimeIcon fontSize="small" color="primary" />
                    <span>Custom Time Range</span>
                  </Stack>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Time Slot Configuration */}
          {settings.action !== 'unavailable' && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Time Slot Configuration
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  {/* Granularity Selection */}
                  <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{ fontWeight: 500, mb: 1 }}>
                      Time Slot Duration
                    </FormLabel>
                    <RadioGroup
                      value={settings.granularity}
                      onChange={(e) => handleGranularityChange(e.target.value as SlotGranularity)}
                      row
                    >
                      <FormControlLabel
                        value={SlotGranularity.THIRTY_MINUTES}
                        control={<Radio size="small" />}
                        label="30 min"
                      />
                      <FormControlLabel
                        value={SlotGranularity.ONE_HOUR}
                        control={<Radio size="small" />}
                        label="1 hour"
                      />
                      <FormControlLabel
                        value={SlotGranularity.TWO_HOURS}
                        control={<Radio size="small" />}
                        label="2 hours"
                      />
                      <FormControlLabel
                        value={SlotGranularity.FOUR_HOURS}
                        control={<Radio size="small" />}
                        label="4 hours"
                      />
                    </RadioGroup>
                  </FormControl>

                  {/* Custom Time Range for Custom Action */}
                  {settings.action === 'custom' && (
                    <Stack direction="row" spacing={2}>
                      <TimePicker
                        label="Start Time"
                        value={customStartTime}
                        onChange={setCustomStartTime}
                        slotProps={{
                          textField: { size: 'small', fullWidth: true }
                        }}
                      />
                      <TimePicker
                        label="End Time"
                        value={customEndTime}
                        onChange={setCustomEndTime}
                        slotProps={{
                          textField: { size: 'small', fullWidth: true }
                        }}
                      />
                    </Stack>
                  )}

                  {/* Time Slot Selection */}
                  {settings.action === 'available' && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight={500}>
                          Select Time Slots
                        </Typography>
                        <Button
                          size="small"
                          onClick={handleSelectAllTimeSlots}
                          variant="outlined"
                        >
                          {settings.timeSlots.length === timeSlots.length ? 'Deselect All' : 'Select All'}
                        </Button>
                      </Stack>
                      <TimeSlotContainer>
                        {timeSlots.map((slot) => (
                          <TimeSlotChip
                            key={slot}
                            label={slot}
                            selected={settings.timeSlots.includes(slot)}
                            onClick={() => handleTimeSlotToggle(slot)}
                            variant="outlined"
                          />
                        ))}
                      </TimeSlotContainer>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Additional Options */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" fontWeight={600}>
                Additional Options
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.applyToAllDates}
                      onChange={(e) => setSettings(prev => ({ ...prev, applyToAllDates: e.target.checked }))}
                    />
                  }
                  label="Apply to all selected dates"
                />
                
                <TextField
                  label="Notes (optional)"
                  multiline
                  rows={2}
                  value={settings.notes}
                  onChange={(e) => setSettings(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this availability change..."
                  size="small"
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Preview */}
          {selectedDates.length > 0 && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Preview:</strong> This will {settings.action === 'unavailable' ? 'mark as unavailable' : 
                settings.action === 'custom' ? 'set custom availability' : 
                `mark as available for ${settings.timeSlots.length} time slot(s)`} 
                {' '}for {selectedDates.length} selected date(s).
              </Typography>
            </Alert>
          )}
        </Stack>
      </EditorContainer>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleReset} color="inherit">
          Reset
        </Button>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={
            selectedDates.length === 0 ||
            (settings.action === 'available' && settings.timeSlots.length === 0) ||
            (settings.action === 'custom' && (!customStartTime || !customEndTime))
          }
        >
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};