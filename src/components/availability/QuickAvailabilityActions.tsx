import React, { useState } from 'react';
import {
  Stack,
  Button,
  ButtonGroup,
  Typography,
  Paper,
  Divider,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import ClearAllOutlinedIcon from '@mui/icons-material/ClearAllOutlined';
import SelectAllOutlinedIcon from '@mui/icons-material/SelectAllOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAvailabilityStore } from '../../store/availabilityStore';
import { AvailabilityStatus } from '../../types/availability';

const ActionsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 2),
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
}));

const SelectionInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

interface QuickAvailabilityActionsProps {
  onBulkAction?: (action: string, dates: Date[]) => void;
}

export const QuickAvailabilityActions: React.FC<QuickAvailabilityActionsProps> = ({
  onBulkAction,
}) => {
  const {
    selectedDates,
    setSelectedDates,
    currentViewDate,
    setCurrentViewDate,
  } = useAvailabilityStore();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyFromDate, setCopyFromDate] = useState<Date | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleMarkAvailable = () => {
    if (selectedDates.length === 0) {
      showSnackbar('Please select dates first');
      return;
    }
    
    onBulkAction?.('mark_available', selectedDates);
    showSnackbar(`Marked ${selectedDates.length} date(s) as available`);
  };

  const handleMarkUnavailable = () => {
    if (selectedDates.length === 0) {
      showSnackbar('Please select dates first');
      return;
    }
    
    onBulkAction?.('mark_unavailable', selectedDates);
    showSnackbar(`Marked ${selectedDates.length} date(s) as unavailable`);
  };

  const handleCopyAvailability = () => {
    if (selectedDates.length === 0) {
      showSnackbar('Please select target dates first');
      return;
    }
    setCopyDialogOpen(true);
  };

  const handleConfirmCopy = () => {
    if (!copyFromDate) {
      showSnackbar('Please select a date to copy from');
      return;
    }
    
    onBulkAction?.('copy_availability', [...selectedDates, copyFromDate]);
    showSnackbar(`Copied availability from ${copyFromDate.toLocaleDateString()} to ${selectedDates.length} date(s)`);
    setCopyDialogOpen(false);
    setCopyFromDate(null);
  };

  const handleClearSelection = () => {
    setSelectedDates([]);
    showSnackbar('Selection cleared');
  };

  const handleSelectAll = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const allDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date >= new Date()) { // Only future dates
        allDates.push(date);
      }
    }
    
    setSelectedDates(allDates);
    showSnackbar(`Selected ${allDates.length} dates`);
  };

  const handleSelectWeekdays = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const weekdayDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && date >= new Date()) { // Monday to Friday, future dates only
        weekdayDates.push(date);
      }
    }
    
    setSelectedDates(weekdayDates);
    showSnackbar(`Selected ${weekdayDates.length} weekdays`);
  };

  const handleSelectWeekends = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const weekendDates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if ((dayOfWeek === 0 || dayOfWeek === 6) && date >= new Date()) { // Saturday and Sunday, future dates only
        weekendDates.push(date);
      }
    }
    
    setSelectedDates(weekendDates);
    showSnackbar(`Selected ${weekendDates.length} weekend days`);
  };

  return (
    <>
      <ActionsContainer elevation={2}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        
        {/* Selection Info */}
        {selectedDates.length > 0 && (
          <SelectionInfo sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                Selected:
              </Typography>
              <Chip
                label={`${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {selectedDates.length <= 3 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {selectedDates.map((date, index) => (
                    <Chip
                      key={index}
                      label={date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </SelectionInfo>
        )}

        {/* Availability Actions */}
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
              Mark Availability
            </Typography>
            <ButtonGroup variant="outlined" fullWidth>
              <ActionButton
                startIcon={<CheckCircleOutlinedIcon />}
                onClick={handleMarkAvailable}
                color="success"
                disabled={(selectedDates.length === 0) as any}
              >
                Mark Available
              </ActionButton>
              <ActionButton
                startIcon={<CancelOutlinedIcon />}
                onClick={handleMarkUnavailable}
                color="error"
                disabled={(selectedDates.length === 0) as any}
              >
                Mark Unavailable
              </ActionButton>
            </ButtonGroup>
          </Box>

          <Divider />

          {/* Copy and Clear Actions */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
              Manage Selection
            </Typography>
            <Stack direction="row" spacing={1}>
              <ActionButton
                startIcon={<ContentCopyOutlinedIcon />}
                onClick={handleCopyAvailability}
                variant="outlined"
                disabled={(selectedDates.length === 0) as any}
                size="small"
              >
                Copy From Date
              </ActionButton>
              <ActionButton
                startIcon={<ClearAllOutlinedIcon />}
                onClick={handleClearSelection}
                variant="outlined"
                disabled={(selectedDates.length === 0) as any}
                size="small"
              >
                Clear Selection
              </ActionButton>
            </Stack>
          </Box>

          <Divider />

          {/* Bulk Selection Actions */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
              Bulk Selection
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <ActionButton
                startIcon={<SelectAllOutlinedIcon />}
                onClick={handleSelectAll}
                variant="outlined"
                size="small"
              >
                Select All
              </ActionButton>
              <ActionButton
                startIcon={<BusinessCenterOutlinedIcon />}
                onClick={handleSelectWeekdays}
                variant="outlined"
                size="small"
              >
                Weekdays
              </ActionButton>
              <ActionButton
                startIcon={<WeekendOutlinedIcon />}
                onClick={handleSelectWeekends}
                variant="outlined"
                size="small"
              >
                Weekends
              </ActionButton>
            </Stack>
          </Box>
        </Stack>
      </ActionsContainer>

      {/* Copy Availability Dialog */}
      <Dialog
        open={copyDialogOpen}
        onClose={() => setCopyDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Copy Availability</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Copy availability settings from one date to the selected {selectedDates.length} date(s).
            </Alert>
            
            <DatePicker
              label="Copy from date"
              value={copyFromDate}
              onChange={setCopyFromDate}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'Select the date to copy availability from'
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmCopy}
            variant="contained"
            disabled={!copyFromDate as any}
          >
            Copy Availability
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};