import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useOutletContext } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { AvailabilityInfo, CalendarEntry, ViewerPermissions, Professional } from '../../data/profileViewSystemMockData';
import { PrivacyGate } from './PrivacyGate';
import { BookingWidget } from './BookingWidget';

interface AvailabilityWidgetProps {
  availability?: AvailabilityInfo;
  professional?: Professional;
  viewerPermissions?: ViewerPermissions;
  onBookingRequest?: (date: Date, timeSlot: string, details: any) => void;
}

interface OutletContext {
  profileData: any;
  viewerPermissions: ViewerPermissions;
  onBookProfessional: () => void;
}

const CalendarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const CalendarGrid = styled(Grid)(({ theme }) => ({
  gap: theme.spacing(1),
}));

const DayCell = styled(Box)<{ status: string }>(({ theme, status }) => ({
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: `1px solid transparent`,
  
  ...(status === 'available' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.success.main,
      transform: 'scale(1.05)',
    },
  }),
  
  ...(status === 'partially_available' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.warning.main,
      transform: 'scale(1.05)',
    },
  }),
  
  ...(status === 'booked' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
    cursor: 'not-allowed',
  }),
  
  ...(status === 'unavailable' && {
    backgroundColor: theme.palette.grey[200],
    color: theme.palette.grey[600],
    cursor: 'not-allowed',
  }),
}));

const LegendItem = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
}));

const LegendDot = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: color,
  flexShrink: 0,
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontSize: '0.75rem',
  height: 24,
  ...(status === 'available' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(status === 'partially_available' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(status === 'booked' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
  ...(status === 'unavailable' && {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[800],
  }),
}));

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'partially_available':
      return 'Partially Available';
    case 'booked':
      return 'Booked';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
};

const generateCalendarDays = (availability: AvailabilityInfo): CalendarEntry[] => {
  // Generate next 14 days for demo
  const days: CalendarEntry[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Find existing availability or create mock data
    const existing = availability.calendar.find(cal => cal.date === dateStr);
    if (existing) {
      days.push(existing);
    } else {
      // Generate mock availability
      const statuses = ['available', 'partially_available', 'booked', 'unavailable'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)] as any;
      
      days.push({
        date: dateStr,
        status: randomStatus,
        timeSlots: [
          { start: '09:00', end: '17:00', status: randomStatus === 'booked' ? 'booked' : 'available' }
        ]
      });
    }
  }
  
  return days;
};

const AvailabilitySkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="text" width={200} height={32} />
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
    <Grid container spacing={1}>
      {Array.from({ length: 14 }).map((_, i) => (
        <Grid item xs={1.7} key={i}>
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
        </Grid>
      ))}
    </Grid>
  </Stack>
);

export const AvailabilityWidget: React.FC<AvailabilityWidgetProps> = ({
  availability: propAvailability,
  professional: propProfessional,
  viewerPermissions: propViewerPermissions,
  onBookingRequest: propOnBookingRequest
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Try to get data from outlet context if not provided as props
  const outletContext = useOutletContext<OutletContext>();
  const availability = propAvailability || outletContext?.profileData?.availability;
  const professional = propProfessional || outletContext?.profileData?.professional;
  const viewerPermissions = propViewerPermissions || outletContext?.viewerPermissions;
  const onBookingRequest = propOnBookingRequest || (() => {
    console.log('Booking request triggered');
    outletContext?.onBookProfessional?.();
  });

  if (!availability || !professional || !viewerPermissions) {
    return <AvailabilitySkeleton />;
  }

  const calendarDays = generateCalendarDays(availability);
  const selectedDayData = selectedDate ? calendarDays.find(day => day.date === selectedDate) : null;

  const AvailabilityContent = () => (
    <Stack spacing={3}>
      {/* Availability Summary */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <CalendarTodayIcon color="primary" />
                <Typography variant="h6" component="h3">
                  Availability Calendar
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                View {professional.name}'s availability for the next 2 weeks
              </Typography>
            </Box>
            <Stack spacing={1} alignItems="flex-end">
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTimeIcon fontSize="small" color="success" />
                <Typography variant="body2" color="success.main">
                  Next available: {availability.nextAvailable.toLocaleDateString()}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Responds {professional.responseTime}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Calendar */}
      <CalendarContainer>
        <Typography variant="subtitle1" gutterBottom>
          Select a Date
        </Typography>
        
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {calendarDays.map((day) => {
            const date = new Date(day.date);
            const dayNumber = date.getDate();
            const isSelected = selectedDate === day.date;
            
            return (
              <Grid xs={1.7} key={day.date}>
                <DayCell
                  status={day.status}
                  onClick={() => setSelectedDate(day.date)}
                  sx={{
                    ...(isSelected && {
                      border: `2px solid ${theme.palette.primary.main}`,
                      transform: 'scale(1.05)',
                    }),
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${dayNumber} - ${getStatusLabel(day.status)}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedDate(day.date);
                    }
                  }}
                >
                  {dayNumber}
                </DayCell>
              </Grid>
            );
          })}
        </Grid>

        {/* Legend */}
        <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
          <LegendItem direction="row" spacing={1}>
            <LegendDot color={theme.palette.success.light} />
            <Typography variant="caption">Available</Typography>
          </LegendItem>
          <LegendItem direction="row" spacing={1}>
            <LegendDot color={theme.palette.warning.light} />
            <Typography variant="caption">Partially Available</Typography>
          </LegendItem>
          <LegendItem direction="row" spacing={1}>
            <LegendDot color={theme.palette.error.light} />
            <Typography variant="caption">Booked</Typography>
          </LegendItem>
          <LegendItem direction="row" spacing={1}>
            <LegendDot color={theme.palette.grey[400]} />
            <Typography variant="caption">Unavailable</Typography>
          </LegendItem>
        </Stack>
      </CalendarContainer>

      {/* Selected Date Details */}
      {selectedDayData && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {new Date(selectedDayData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                <StatusChip
                  status={selectedDayData.status}
                  label={getStatusLabel(selectedDayData.status)}
                  icon={selectedDayData.status === 'available' ? <EventAvailableIcon /> : <EventBusyIcon />}
                />
              </Stack>

              {/* Time Slots */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Time Slots
                </Typography>
                <Stack spacing={1}>
                  {selectedDayData.timeSlots.map((slot, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        {slot.start} - {slot.end}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {slot.jobTitle && (
                          <Typography variant="caption" color="text.secondary">
                            {slot.jobTitle}
                          </Typography>
                        )}
                        <StatusChip
                          status={slot.status}
                          label={slot.status === 'available' ? 'Available' : 'Booked'}
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              {/* Book Button */}
              {selectedDayData.status === 'available' && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CalendarTodayIcon />}
                  onClick={() => onBookingRequest(new Date(selectedDayData.date), selectedDayData.timeSlots[0].start, {})}
                  fullWidth
                >
                  Book This Date
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Quick Booking Widget */}
      <BookingWidget
        professional={professional}
        availability={availability}
        viewerPermissions={viewerPermissions}
        onBookingRequest={onBookingRequest}
      />
    </Stack>
  );

  return (
    <Box
      role="tabpanel"
      id="tabpanel-availability"
      aria-labelledby="tab-availability"
    >
      <PrivacyGate
        viewerPermissions={viewerPermissions}
        requiredPermission="canViewAvailability"
        gateType="availability"
        fallbackContent={
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <CalendarTodayIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Availability Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sign in to view real-time availability and book appointments with {professional.name}.
              </Typography>
              <Typography variant="body2" color="success.main">
                Next available: {availability.nextAvailable.toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        }
      >
        <AvailabilityContent />
      </PrivacyGate>
    </Box>
  );
};