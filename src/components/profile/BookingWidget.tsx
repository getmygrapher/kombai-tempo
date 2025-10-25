import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
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
  Box,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import { Professional, AvailabilityInfo, ViewerPermissions } from '../../data/profileViewSystemMockData';
import { analyticsService } from '../../utils/analyticsEvents';

interface BookingWidgetProps {
  professional: Professional;
  availability: AvailabilityInfo;
  viewerPermissions: ViewerPermissions;
  onBookingRequest: (date: Date, timeSlot: string, details: BookingDetails) => void;
}

interface BookingDetails {
  projectType: string;
  duration: number;
  message: string;
  contactMethod: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
  border: `1px solid ${theme.palette.primary.light}`,
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    maxWidth: 600,
    width: '100%',
    margin: theme.spacing(2),
  },
}));

const ConflictChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  '& .MuiChip-icon': {
    color: theme.palette.error.contrastText,
  },
}));

const projectTypes = [
  'Wedding Photography',
  'Portrait Session',
  'Event Photography',
  'Corporate Headshots',
  'Product Photography',
  'Fashion Shoot',
  'Other'
];

const durations = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 4, label: '4 hours' },
  { value: 6, label: '6 hours' },
  { value: 8, label: '8 hours' },
  { value: 12, label: '12 hours' }
];

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  professional,
  availability,
  viewerPermissions,
  onBookingRequest
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [projectType, setProjectType] = useState('');
  const [duration, setDuration] = useState<number>(2);
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState('message');

  const handleOpen = () => {
    setOpen(true);
    analyticsService.trackBookingCtaClicked(professional.id, 'booking_widget');
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form
    setSelectedDate(null);
    setSelectedTime('');
    setProjectType('');
    setDuration(2);
    setMessage('');
    setContactMethod('message');
  };

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime || !projectType) return;

    const bookingDetails: BookingDetails = {
      projectType,
      duration,
      message,
      contactMethod
    };

    onBookingRequest(selectedDate, selectedTime, bookingDetails);
    handleClose();
  };

  // Check for conflicts
  const checkAvailabilityConflicts = (date: Date, timeSlot: string): string[] => {
    const conflicts: string[] = [];
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availability.calendar.find(cal => cal.date === dateStr);
    
    if (!dayAvailability) {
      conflicts.push('No availability data for this date');
      return conflicts;
    }

    if (dayAvailability.status === 'unavailable') {
      conflicts.push('Professional is unavailable on this date');
    } else if (dayAvailability.status === 'booked') {
      conflicts.push('This date is fully booked');
    } else if (dayAvailability.status === 'partially_available') {
      const bookedSlots = dayAvailability.timeSlots.filter(slot => slot.status === 'booked');
      if (bookedSlots.length > 0) {
        conflicts.push(`Partially booked (${bookedSlots.map(slot => slot.jobTitle).join(', ')})`);
      }
    }

    return conflicts;
  };

  const conflicts = selectedDate ? checkAvailabilityConflicts(selectedDate, selectedTime) : [];
  const hasConflicts = conflicts.length > 0;
  const isFormValid = selectedDate && selectedTime && projectType && !hasConflicts;

  // Generate available time slots
  const getAvailableTimeSlots = () => {
    const slots = [
      '09:00', '10:00', '11:00', '12:00', 
      '13:00', '14:00', '15:00', '16:00', 
      '17:00', '18:00'
    ];
    return slots;
  };

  return (
    <>
      <StyledCard>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarTodayIcon color="primary" />
              <Typography variant="h6" component="h3">
                Quick Booking
              </Typography>
            </Stack>
            
            <Typography variant="body2" color="text.secondary">
              Book a session with {professional.name} directly
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon fontSize="small" color="success" />
              <Typography variant="body2" color="success.main">
                Next available: {availability.nextAvailable.toLocaleDateString()}
              </Typography>
            </Stack>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleOpen}
              disabled={!viewerPermissions.canSendMessage as any}
              fullWidth
              aria-label={`Book a session with ${professional.name}`}
            >
              Book Now
            </Button>
            
            {!viewerPermissions.canSendMessage && (
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Sign in to book appointments
              </Typography>
            )}
          </Stack>
        </CardContent>
      </StyledCard>

      {/* Booking Dialog */}
      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        fullScreen={isMobile as any}
      >
        <DialogTitle 
          id="booking-dialog-title"
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}
        >
          <Typography variant="h6" component="h2">
            Book Session with {professional.name}
          </Typography>
          <IconButton
            onClick={handleClose}
            aria-label="Close booking dialog"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Date Selection */}
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={new Date()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />

            {/* Time Selection */}
            <FormControl fullWidth required>
              <InputLabel>Select Time</InputLabel>
              <Select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                label="Select Time"
              >
                {getAvailableTimeSlots().map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Conflicts Warning */}
            {hasConflicts && (
              <Alert 
                severity="warning" 
                icon={<WarningIcon />}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Availability Conflicts:
                </Typography>
                <Stack spacing={1}>
                  {conflicts.map((conflict, index) => (
                    <ConflictChip
                      key={index}
                      label={conflict}
                      size="small"
                      icon={<WarningIcon />}
                    />
                  ))}
                </Stack>
              </Alert>
            )}

            {/* Project Type */}
            <FormControl fullWidth required>
              <InputLabel>Project Type</InputLabel>
              <Select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                label="Project Type"
              >
                {projectTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Duration */}
            <FormControl fullWidth>
              <InputLabel>Expected Duration</InputLabel>
              <Select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                label="Expected Duration"
              >
                {durations.map((dur) => (
                  <MenuItem key={dur.value} value={dur.value}>
                    {dur.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Message */}
            <TextField
              label="Project Details"
              multiline
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your project, location, specific requirements, etc."
              fullWidth
            />

            {/* Contact Method */}
            <FormControl fullWidth>
              <InputLabel>Preferred Contact Method</InputLabel>
              <Select
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                label="Preferred Contact Method"
              >
                <MenuItem value="message">In-app Message</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone Call</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="info">
              This will send a booking request to {professional.name}. 
              They will respond within {professional.responseTime} to confirm availability and discuss details.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid as any}
            sx={{ flex: 1 }}
          >
            Send Booking Request
          </Button>
        </DialogActions>
      </StyledDialog>
    </>
  );
};