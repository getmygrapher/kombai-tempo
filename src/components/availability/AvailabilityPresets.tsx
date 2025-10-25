import React, { useState } from 'react';
import {
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import WeekendIcon from '@mui/icons-material/Weekend';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { SlotGranularity } from '../../types/availability';

const PresetCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

const PresetIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(1),
}));

interface AvailabilityPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  timeSlots: string[];
  days: string[];
  isCustom?: boolean;
}

interface AvailabilityPresetsProps {
  onApplyPreset: (preset: AvailabilityPreset) => void;
}

export const AvailabilityPresets: React.FC<AvailabilityPresetsProps> = ({
  onApplyPreset,
}) => {
  const [customPresets, setCustomPresets] = useState<AvailabilityPreset[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<AvailabilityPreset | null>(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const defaultPresets: AvailabilityPreset[] = [
    {
      id: 'business_hours',
      name: 'Business Hours',
      description: '9 AM - 5 PM, Monday to Friday',
      icon: <BusinessCenterIcon />,
      timeSlots: ['09:00-12:00', '13:00-17:00'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    {
      id: 'morning_only',
      name: 'Morning Only',
      description: '8 AM - 12 PM, all weekdays',
      icon: <AccessTimeIcon />,
      timeSlots: ['08:00-12:00'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    {
      id: 'afternoon_evening',
      name: 'Afternoon & Evening',
      description: '1 PM - 9 PM, all weekdays',
      icon: <EventAvailableIcon />,
      timeSlots: ['13:00-17:00', '18:00-21:00'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    {
      id: 'weekends_only',
      name: 'Weekends Only',
      description: '10 AM - 6 PM, Saturday and Sunday',
      icon: <WeekendIcon />,
      timeSlots: ['10:00-14:00', '15:00-18:00'],
      days: ['Saturday', 'Sunday'],
    },
    {
      id: 'flexible_schedule',
      name: 'Flexible Schedule',
      description: '10 AM - 2 PM and 6 PM - 10 PM, all days',
      icon: <AccessTimeIcon />,
      timeSlots: ['10:00-14:00', '18:00-22:00'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  ];

  const allPresets = [...defaultPresets, ...customPresets];

  const timeSlotOptions = [
    '06:00-08:00', '08:00-10:00', '10:00-12:00', '12:00-14:00',
    '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-23:00'
  ];

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleCreatePreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: AvailabilityPreset = {
      id: `custom_${Date.now()}`,
      name: newPresetName,
      description: newPresetDescription || `Custom preset: ${selectedTimeSlots.join(', ')}`,
      icon: <EventAvailableIcon />,
      timeSlots: selectedTimeSlots,
      days: selectedDays,
      isCustom: true,
    };

    setCustomPresets(prev => [...prev, newPreset]);
    handleCloseDialog();
  };

  const handleEditPreset = (preset: AvailabilityPreset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setNewPresetDescription(preset.description);
    setSelectedTimeSlots(preset.timeSlots);
    setSelectedDays(preset.days);
    setCreateDialogOpen(true);
  };

  const handleUpdatePreset = () => {
    if (!editingPreset || !newPresetName.trim()) return;

    const updatedPreset: AvailabilityPreset = {
      ...editingPreset,
      name: newPresetName,
      description: newPresetDescription || `Custom preset: ${selectedTimeSlots.join(', ')}`,
      timeSlots: selectedTimeSlots,
      days: selectedDays,
    };

    setCustomPresets(prev => 
      prev.map(p => p.id === editingPreset.id ? updatedPreset : p)
    );
    handleCloseDialog();
  };

  const handleDeletePreset = (presetId: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== presetId));
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditingPreset(null);
    setNewPresetName('');
    setNewPresetDescription('');
    setSelectedTimeSlots([]);
    setSelectedDays([]);
  };

  const handleTimeSlotToggle = (slot: string) => {
    setSelectedTimeSlots(prev => 
      prev.includes(slot) 
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
    );
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Availability Presets
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            variant="outlined"
            size="small"
          >
            Create Custom
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Quick apply common availability patterns to your calendar.
        </Typography>

        {/* Default Presets */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Default Presets
          </Typography>
          <Stack spacing={2}>
            {defaultPresets.map((preset) => (
              <PresetCard key={preset.id} onClick={() => onApplyPreset(preset)}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <PresetIcon>
                      {preset.icon}
                    </PresetIcon>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {preset.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {preset.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        {preset.timeSlots.map((slot, index) => (
                          <Chip
                            key={index}
                            label={slot}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                        {preset.days.map((day, index) => (
                          <Chip
                            key={index}
                            label={day.slice(0, 3)}
                            size="small"
                            variant="filled"
                            color="default"
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </PresetCard>
            ))}
          </Stack>
        </Box>

        {/* Custom Presets */}
        {customPresets.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Custom Presets
            </Typography>
            <Stack spacing={2}>
              {customPresets.map((preset) => (
                <PresetCard key={preset.id}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <PresetIcon>
                        {preset.icon}
                      </PresetIcon>
                      <Box flex={1} onClick={() => onApplyPreset(preset)} sx={{ cursor: 'pointer' }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {preset.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {preset.description}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                          {preset.timeSlots.map((slot, index) => (
                            <Chip
                              key={index}
                              label={slot}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Stack>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1 }}>
                          {preset.days.map((day, index) => (
                            <Chip
                              key={index}
                              label={day.slice(0, 3)}
                              size="small"
                              variant="filled"
                              color="default"
                            />
                          ))}
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPreset(preset);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(preset.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </PresetCard>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>

      {/* Create/Edit Preset Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPreset ? 'Edit Preset' : 'Create Custom Preset'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Preset Name"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={newPresetDescription}
              onChange={(e) => setNewPresetDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Time Slots
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {timeSlotOptions.map((slot) => (
                  <Chip
                    key={slot}
                    label={slot}
                    clickable
                    color={selectedTimeSlots.includes(slot) ? 'primary' : 'default'}
                    variant={selectedTimeSlots.includes(slot) ? 'filled' : 'outlined'}
                    onClick={() => handleTimeSlotToggle(slot)}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Days of Week
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {dayOptions.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    clickable
                    color={selectedDays.includes(day) ? 'primary' : 'default'}
                    variant={selectedDays.includes(day) ? 'filled' : 'outlined'}
                    onClick={() => handleDayToggle(day)}
                  />
                ))}
              </Stack>
            </Box>

            {selectedTimeSlots.length > 0 && selectedDays.length > 0 && (
              <Alert severity="info">
                <Typography variant="body2">
                  This preset will set availability for {selectedTimeSlots.length} time slot(s) 
                  on {selectedDays.length} day(s) of the week.
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={editingPreset ? handleUpdatePreset : handleCreatePreset}
            variant="contained"
            disabled={(!newPresetName.trim() || selectedTimeSlots.length === 0 || selectedDays.length === 0) as any}
          >
            {editingPreset ? 'Update' : 'Create'} Preset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};