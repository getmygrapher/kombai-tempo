import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
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
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useRecurringPatterns, useCreateRecurringPattern, useApplyRecurringPattern } from '../../hooks/useAvailability';
import { formatPatternType } from '../../utils/availabilityFormatters';
import { 
  RecurringPattern, 
  PatternType, 
  AvailabilityDay, 
  AvailabilityStatus,
  DateRange 
} from '../../types/availability';

const PatternCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const DayChip = styled(Chip)<{ available: boolean }>(({ theme, available }) => ({
  backgroundColor: available ? '#ECFDF5' : '#FEF2F2',
  color: available ? '#047857' : '#DC2626',
  fontWeight: 500
}));

interface RecurringPatternManagerProps {
  onPatternApplied?: (patternId: string) => void;
}

export const RecurringPatternManager: React.FC<RecurringPatternManagerProps> = ({
  onPatternApplied
}) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<RecurringPattern | null>(null);
  const [newPattern, setNewPattern] = useState<Partial<RecurringPattern>>({
    name: '',
    type: PatternType.WEEKLY,
    schedule: {
      [AvailabilityDay.MONDAY]: { available: true, timeSlots: [], isFullDay: false },
      [AvailabilityDay.TUESDAY]: { available: true, timeSlots: [], isFullDay: false },
      [AvailabilityDay.WEDNESDAY]: { available: true, timeSlots: [], isFullDay: false },
      [AvailabilityDay.THURSDAY]: { available: true, timeSlots: [], isFullDay: false },
      [AvailabilityDay.FRIDAY]: { available: true, timeSlots: [], isFullDay: false },
      [AvailabilityDay.SATURDAY]: { available: false, timeSlots: [], isFullDay: false },
      [AvailabilityDay.SUNDAY]: { available: false, timeSlots: [], isFullDay: false }
    },
    dateRange: {
      start: new Date(),
      end: new Date(new Date().getFullYear(), 11, 31) // End of current year
    },
    exceptions: [],
    isActive: true
  });

  const { data: patterns = [], isLoading } = useRecurringPatterns('user_123');
  const createPatternMutation = useCreateRecurringPattern();
  const applyPatternMutation = useApplyRecurringPattern();

  const handleCreatePattern = async () => {
    if (!newPattern.name) return;

    try {
      await createPatternMutation.mutateAsync({
        userId: 'user_123',
        name: newPattern.name,
        type: newPattern.type!,
        schedule: newPattern.schedule!,
        dateRange: newPattern.dateRange!,
        exceptions: newPattern.exceptions!,
        isActive: newPattern.isActive!
      });
      
      setCreateDialogOpen(false);
      resetNewPattern();
    } catch (error) {
      console.error('Failed to create pattern:', error);
    }
  };

  const handleApplyPattern = async (pattern: RecurringPattern) => {
    try {
      await applyPatternMutation.mutateAsync({
        patternId: pattern.id,
        userId: 'user_123',
        dateRange: pattern.dateRange
      });
      
      onPatternApplied?.(pattern.id);
    } catch (error) {
      console.error('Failed to apply pattern:', error);
    }
  };

  const resetNewPattern = () => {
    setNewPattern({
      name: '',
      type: PatternType.WEEKLY,
      schedule: {
        [AvailabilityDay.MONDAY]: { available: true, timeSlots: [], isFullDay: false },
        [AvailabilityDay.TUESDAY]: { available: true, timeSlots: [], isFullDay: false },
        [AvailabilityDay.WEDNESDAY]: { available: true, timeSlots: [], isFullDay: false },
        [AvailabilityDay.THURSDAY]: { available: true, timeSlots: [], isFullDay: false },
        [AvailabilityDay.FRIDAY]: { available: true, timeSlots: [], isFullDay: false },
        [AvailabilityDay.SATURDAY]: { available: false, timeSlots: [], isFullDay: false },
        [AvailabilityDay.SUNDAY]: { available: false, timeSlots: [], isFullDay: false }
      },
      dateRange: {
        start: new Date(),
        end: new Date(new Date().getFullYear(), 11, 31)
      },
      exceptions: [],
      isActive: true
    });
  };

  const handleDayToggle = (day: AvailabilityDay, available: boolean) => {
    setNewPattern(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule!,
        [day]: {
          ...prev.schedule![day],
          available
        }
      }
    }));
  };

  const dayLabels = {
    [AvailabilityDay.MONDAY]: 'Mon',
    [AvailabilityDay.TUESDAY]: 'Tue',
    [AvailabilityDay.WEDNESDAY]: 'Wed',
    [AvailabilityDay.THURSDAY]: 'Thu',
    [AvailabilityDay.FRIDAY]: 'Fri',
    [AvailabilityDay.SATURDAY]: 'Sat',
    [AvailabilityDay.SUNDAY]: 'Sun'
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <SyncOutlinedIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Recurring Patterns
          </Typography>
        </Stack>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Pattern
        </Button>
      </Stack>

      {/* Patterns List */}
      {isLoading ? (
        <Typography>Loading patterns...</Typography>
      ) : patterns.length === 0 ? (
        <Alert severity="info">
          No recurring patterns found. Create your first pattern to automate your availability schedule.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {patterns.map((pattern) => (
            <PatternCard key={pattern.id} elevation={2}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {pattern.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {formatPatternType(pattern.type)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pattern.dateRange.start.toLocaleDateString()} - {pattern.dateRange.end.toLocaleDateString()}
                    </Typography>
                  </Box>
                  
                  <Chip
                    label={pattern.isActive ? 'Active' : 'Inactive'}
                    color={pattern.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Stack>

                {/* Weekly Schedule Preview */}
                <Box mb={2}>
                  <Typography variant="subtitle2" mb={1} fontWeight={500}>
                    Weekly Schedule
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {Object.entries(pattern.schedule).map(([day, schedule]) => (
                      <DayChip
                        key={day}
                        label={dayLabels[day as AvailabilityDay]}
                        size="small"
                        available={schedule.available}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Exceptions */}
                {pattern.exceptions.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" mb={1} fontWeight={500}>
                      Exceptions ({pattern.exceptions.length})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pattern.exceptions.slice(0, 3).map(date => date.toLocaleDateString()).join(', ')}
                      {pattern.exceptions.length > 3 && ` +${pattern.exceptions.length - 3} more`}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => handleApplyPattern(pattern)}
                  disabled={applyPatternMutation.isPending as any}
                >
                  Apply Pattern
                </Button>
                <IconButton size="small">
                  <EditIcon />
                </IconButton>
                <IconButton size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </PatternCard>
          ))}
        </Stack>
      )}

      {/* Create Pattern Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Recurring Pattern</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Pattern Name */}
            <TextField
              label="Pattern Name"
              value={newPattern.name}
              onChange={(e) => setNewPattern(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              placeholder="e.g., Weekday Work Schedule"
            />

            {/* Pattern Type */}
            <FormControl fullWidth>
              <InputLabel>Pattern Type</InputLabel>
              <Select
                value={newPattern.type}
                onChange={(e) => setNewPattern(prev => ({ ...prev, type: e.target.value as PatternType }))}
                label="Pattern Type"
              >
                <MenuItem value={PatternType.WEEKLY}>Weekly</MenuItem>
                <MenuItem value={PatternType.BI_WEEKLY}>Bi-weekly</MenuItem>
                <MenuItem value={PatternType.MONTHLY}>Monthly</MenuItem>
                <MenuItem value={PatternType.CUSTOM}>Custom</MenuItem>
              </Select>
            </FormControl>

            <Divider />

            {/* Weekly Schedule */}
            <Box>
              <Typography variant="subtitle1" mb={2} fontWeight={600}>
                Weekly Availability
              </Typography>
              <Stack spacing={2}>
                {Object.entries(newPattern.schedule || {}).map(([day, schedule]) => (
                  <Stack key={day} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1" sx={{ minWidth: 100 }}>
                      {day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={schedule.available}
                          onChange={(e) => handleDayToggle(day as AvailabilityDay, e.target.checked)}
                        />
                      }
                      label={schedule.available ? 'Available' : 'Unavailable'}
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* Date Range */}
            <Box>
              <Typography variant="subtitle1" mb={2} fontWeight={600}>
                Date Range
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={newPattern.dateRange?.start.toISOString().split('T')[0]}
                  onChange={(e) => setNewPattern(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange!,
                      start: new Date(e.target.value)
                    }
                  }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={newPattern.dateRange?.end.toISOString().split('T')[0]}
                  onChange={(e) => setNewPattern(prev => ({
                    ...prev,
                    dateRange: {
                      ...prev.dateRange!,
                      end: new Date(e.target.value)
                    }
                  }))}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </Box>

            {/* Active Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={newPattern.isActive}
                  onChange={(e) => setNewPattern(prev => ({ ...prev, isActive: e.target.checked }))}
                />
              }
              label="Activate pattern immediately"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreatePattern}
            disabled={(!newPattern.name || createPatternMutation.isPending) as any}
          >
            {createPatternMutation.isPending ? 'Creating...' : 'Create Pattern'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};