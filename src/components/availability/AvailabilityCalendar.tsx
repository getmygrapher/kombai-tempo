import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useAvailabilityStore } from '../../store/availabilityStore';
import { useCalendarEntries, useCurrentUser } from '../../hooks/useAvailability';
import { formatAvailabilityStatus } from '../../utils/availabilityFormatters';
import { AvailabilityStatus, CalendarViewMode, TimeSlot, CalendarEntry } from '../../types/availability';
import { TimeSlotSelector } from './TimeSlotSelector';

const CalendarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(236, 72, 153, 0.02) 100%)'
}));

const CalendarGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2)
}));

const DateCell = styled(Box)<{ status?: AvailabilityStatus; isSelected?: boolean; isToday?: boolean }>(({ theme, status, isSelected, isToday }) => ({
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  minHeight: '48px',
  border: isToday ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  backgroundColor: isSelected 
    ? theme.palette.primary.main
    : status === AvailabilityStatus.AVAILABLE 
      ? theme.palette.success.light
      : status === AvailabilityStatus.PARTIALLY_AVAILABLE
        ? theme.palette.warning.light
        : status === AvailabilityStatus.BOOKED
          ? theme.palette.info.light
          : status === AvailabilityStatus.UNAVAILABLE
            ? theme.palette.error.light
            : theme.palette.grey[50],
  color: isSelected 
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
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4]
  }
}));

const WeekHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1)
}));

const WeekDay = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  padding: theme.spacing(1)
}));

const StatusIndicator = styled(Box)<{ status: AvailabilityStatus }>(({ theme, status }) => ({
  position: 'absolute',
  bottom: 4,
  right: 4,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: status === AvailabilityStatus.AVAILABLE 
    ? theme.palette.success.main
    : status === AvailabilityStatus.PARTIALLY_AVAILABLE
      ? theme.palette.warning.main
      : status === AvailabilityStatus.BOOKED
        ? theme.palette.info.main
        : theme.palette.error.main
}));

interface AvailabilityCalendarProps {
  calendarEntries?: CalendarEntry[];
  selectedDates?: Date[];
  currentViewDate?: Date;
  viewMode?: CalendarViewMode;
  operatingHours?: { start: string; end: string };
  onDateSelect?: (dates: Date[]) => void;
  onViewModeChange?: (mode: CalendarViewMode) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  onAvailabilityUpdate?: (dates: Date[], timeSlots: TimeSlot[]) => void;
  onTimeSlotSelect?: (date: Date, timeSlots: TimeSlot[]) => void;
  loading?: boolean;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  calendarEntries: propCalendarEntries,
  selectedDates: propSelectedDates,
  currentViewDate: propCurrentViewDate,
  viewMode: propViewMode,
  operatingHours,
  onDateSelect,
  onViewModeChange,
  onNavigate,
  onAvailabilityUpdate,
  onTimeSlotSelect,
  loading
}) => {
  const {
    currentViewDate: storeCurrentViewDate,
    setCurrentViewDate,
    viewMode: storeViewMode,
    setViewMode,
    selectedDates: storeSelectedDates,
    setSelectedDates
  } = useAvailabilityStore();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);

  // Get current user
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  // Use props if provided, otherwise fall back to store
  const currentViewDate = propCurrentViewDate || storeCurrentViewDate;
  const viewMode = propViewMode || storeViewMode;
  const selectedDates = propSelectedDates || storeSelectedDates;
  
  // Calculate date range for current month view (with buffer for better UX)
  const dateRange = React.useMemo(() => {
    const startOfMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
    const endOfMonth = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0);
    
    // Add buffer days before and after to show previous/next month dates that appear in calendar
    const start = new Date(startOfMonth);
    start.setDate(start.getDate() - 7); // Week before
    
    const end = new Date(endOfMonth);
    end.setDate(end.getDate() + 7); // Week after
    
    return { start, end };
  }, [currentViewDate]);
  
  const { data: fallbackCalendarEntries = [] } = useCalendarEntries(userId || '', dateRange);
  const calendarEntries = propCalendarEntries || fallbackCalendarEntries;

  const today = new Date();
  const currentMonth = currentViewDate.getMonth();
  const currentYear = currentViewDate.getFullYear();

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentYear, currentMonth, day));
  }

  const getDateStatus = (date: Date): AvailabilityStatus | undefined => {
    const dateStr = date.toISOString().split('T')[0];
    const entry = calendarEntries.find(entry => entry.date === dateStr);
    return entry?.status;
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(selectedDate => 
      selectedDate.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date): boolean => {
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    
    const newSelectedDates = isDateSelected(date)
      ? selectedDates.filter(d => d.toDateString() !== date.toDateString())
      : [...selectedDates, date];
    
    if (onDateSelect) {
      onDateSelect(newSelectedDates);
    } else {
      setSelectedDates(newSelectedDates);
    }
    
    setTimeSlotDialogOpen(true);
  };

  const handlePrevMonth = () => {
    if (onNavigate) {
      onNavigate('prev');
    } else {
      setCurrentViewDate(new Date(currentYear, currentMonth - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (onNavigate) {
      onNavigate('next');
    } else {
      setCurrentViewDate(new Date(currentYear, currentMonth + 1, 1));
    }
  };

  const handleViewModeChange = (event: React.MouseEvent<HTMLElement>, newMode: CalendarViewMode | null) => {
    if (newMode !== null) {
      if (onViewModeChange) {
        onViewModeChange(newMode);
      } else {
        setViewMode(newMode);
      }
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <CalendarContainer elevation={2}>
      {/* Calendar Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <CalendarMonthOutlinedIcon color="primary" />
          <Typography variant="h5" fontWeight={600}>
            Availability Calendar
          </Typography>
        </Stack>
        
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value={CalendarViewMode.MONTH}>
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value={CalendarViewMode.WEEK}>
            <ViewWeekIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Month Navigation */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <IconButton onClick={handlePrevMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>
        
        <Typography variant="h6" fontWeight={600}>
          {monthNames[currentMonth]} {currentYear}
        </Typography>
        
        <IconButton onClick={handleNextMonth} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      {/* Status Legend */}
      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
        <Chip
          size="small"
          label="Available"
          sx={{ backgroundColor: (t) => t.palette.success.light, color: (t) => t.palette.success.dark }}
        />
        <Chip
          size="small"
          label="Partially Available"
          sx={{ backgroundColor: (t) => t.palette.warning.light, color: (t) => t.palette.warning.dark }}
        />
        <Chip
          size="small"
          label="Booked"
          sx={{ backgroundColor: (t) => t.palette.info.light, color: (t) => t.palette.info.dark }}
        />
        <Chip
          size="small"
          label="Unavailable"
          sx={{ backgroundColor: (t) => t.palette.error.light, color: (t) => t.palette.error.dark }}
        />
      </Stack>

      {/* Week Headers */}
      <WeekHeader>
        {weekDays.map(day => (
          <WeekDay key={day} variant="caption">
            {day}
          </WeekDay>
        ))}
      </WeekHeader>

      {/* Calendar Grid */}
      <CalendarGrid role="grid" aria-label={`Calendar ${monthNames[currentMonth]} ${currentYear}`}>
        {calendarDays.map((date, index) => (
          <Box key={index} role="row">
            {date ? (
              <Tooltip title={date ? formatAvailabilityStatus(getDateStatus(date) || AvailabilityStatus.AVAILABLE) : ''}>
                <DateCell
                  role="gridcell"
                  aria-label={`${date.getDate()} ${monthNames[currentMonth]} ${currentYear}, ${formatAvailabilityStatus(getDateStatus(date) || AvailabilityStatus.AVAILABLE)}`}
                  status={getDateStatus(date)}
                  isSelected={isDateSelected(date)}
                  isToday={isToday(date)}
                  onClick={() => handleDateClick(date)}
                >
                  <Typography variant="body2" fontWeight={isToday(date) ? 600 : 400}>
                    {date.getDate()}
                  </Typography>
                  {getDateStatus(date) && (
                    <StatusIndicator status={getDateStatus(date)!} />
                  )}
                </DateCell>
              </Tooltip>
            ) : (
              <Box role="gridcell" aria-hidden />
            )}
          </Box>
        ))}
      </CalendarGrid>

      {/* Time Slot Selection Dialog */}
      <Dialog
        open={timeSlotDialogOpen}
        onClose={() => setTimeSlotDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Availability - {selectedDate?.toLocaleDateString()}
        </DialogTitle>
        <DialogContent>
          {selectedDate && (
            <TimeSlotSelector
              date={selectedDate}
              onTimeSlotSelect={(timeSlots) => {
                onTimeSlotSelect?.(selectedDate, timeSlots);
                if (onAvailabilityUpdate && selectedDate) {
                  onAvailabilityUpdate([selectedDate], timeSlots);
                }
              }}
              onSaveComplete={() => setTimeSlotDialogOpen(false)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimeSlotDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </CalendarContainer>
  );
};