import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { RecurringPatternManager } from './RecurringPatternManager';
import { useAvailabilityStore } from '../../store/availabilityStore';
import { useCalendarEntries, useRecurringPatterns, useUpdateAvailability, useCurrentUser } from '../../hooks/useAvailability';
import { 
  CalendarViewMode, 
  TimeSlot, 
  RecurringPattern,
  CalendarEntry 
} from '../../types/availability';
import { AvailabilityStatus } from '../../types/enums';

const TabContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 400,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`availability-tabpanel-${index}`}
      aria-labelledby={`availability-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Fade in={true as any}>
          <TabPanel>{children}</TabPanel>
        </Fade>
      )}
    </div>
  );
};

export const AvailabilityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Store state
  const {
    selectedDates,
    currentViewDate,
    viewMode,
    operatingHours,
    setSelectedDates,
    setCurrentViewDate,
    setViewMode,
  } = useAvailabilityStore();

  // Get current authenticated user
  const { data: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();
  const userId = currentUser?.id;

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

  // API hooks
  const { data: calendarEntries = [], isLoading: calendarLoading, error: calendarError } = useCalendarEntries(userId || '', dateRange);
  const { data: recurringPatterns = [], isLoading: patternsLoading } = useRecurringPatterns(userId || '');
  const updateAvailabilityMutation = useUpdateAvailability();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentViewDate);
    if (direction === 'prev') {
      newDate.setMonth(currentViewDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentViewDate.getMonth() + 1);
    }
    setCurrentViewDate(newDate);
  };

  const handleAvailabilityUpdate = async (dates: Date[], timeSlots: TimeSlot[]) => {
    if (!userId) return;
    
    try {
      for (const date of dates) {
        await updateAvailabilityMutation.mutateAsync({
          userId,
          date: date.toISOString().split('T')[0],
          timeSlots,
          status: timeSlots.length > 0 ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.UNAVAILABLE,
        });
      }
      // Clear selection after successful update
      setSelectedDates([]);
    } catch (error) {
      console.error('Failed to update availability:', error);
    }
  };

  const handleCreatePattern = () => {
    // TODO: Open pattern creation wizard
    console.log('Create pattern');
  };

  const handleEditPattern = (pattern: RecurringPattern) => {
    // TODO: Open pattern edit dialog
    console.log('Edit pattern:', pattern);
  };

  const handleDeletePattern = (patternId: string) => {
    // TODO: Delete pattern
    console.log('Delete pattern:', patternId);
  };

  const handleTogglePattern = (patternId: string, isActive: boolean) => {
    // TODO: Toggle pattern active state
    console.log('Toggle pattern:', patternId, isActive);
  };

  const handleApplyPattern = (patternId: string) => {
    // TODO: Apply pattern to calendar
    console.log('Apply pattern:', patternId);
  };

  const handlePreviewPattern = (pattern: RecurringPattern) => {
    // TODO: Show pattern preview
    console.log('Preview pattern:', pattern);
  };

  if (userError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Authentication error. Please log in to access your availability calendar.
      </Alert>
    );
  }

  if (calendarError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load calendar data. Please try again.
      </Alert>
    );
  }

  if (userLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (!userId) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Please log in to manage your availability.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Tabs */}
      <TabContainer>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab
            icon={<CalendarMonthOutlinedIcon />}
            label="Calendar"
            iconPosition="start"
          />
          <Tab
            icon={<SyncOutlinedIcon />}
            label="Recurring Patterns"
            iconPosition="start"
          />
          <Tab
            icon={<ShieldOutlinedIcon />}
            label="Privacy Settings"
            iconPosition="start"
            disabled
          />
          <Tab
            icon={<PollOutlinedIcon />}
            label="Analytics"
            iconPosition="start"
            disabled
          />
        </Tabs>
      </TabContainer>

      {/* Tab Panels */}
      <CustomTabPanel value={activeTab} index={0}>
        {calendarLoading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : (
          <AvailabilityCalendar
            calendarEntries={calendarEntries}
            selectedDates={selectedDates}
            currentViewDate={currentViewDate}
            viewMode={viewMode}
            operatingHours={operatingHours}
            onDateSelect={setSelectedDates}
            onViewModeChange={setViewMode}
            onNavigate={handleNavigate}
            onAvailabilityUpdate={handleAvailabilityUpdate}
            loading={updateAvailabilityMutation.isPending}
          />
        )}
      </CustomTabPanel>

      <CustomTabPanel value={activeTab} index={1}>
        {patternsLoading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : (
          <RecurringPatternManager
            patterns={recurringPatterns}
            onCreatePattern={handleCreatePattern}
            onEditPattern={handleEditPattern}
            onDeletePattern={handleDeletePattern}
            onTogglePattern={handleTogglePattern}
            onApplyPattern={handleApplyPattern}
            onPreviewPattern={handlePreviewPattern}
          />
        )}
      </CustomTabPanel>

      <CustomTabPanel value={activeTab} index={2}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ShieldOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Privacy Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon - Control who can see your availability
          </Typography>
        </Box>
      </CustomTabPanel>

      <CustomTabPanel value={activeTab} index={3}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PollOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Coming soon - Insights about your availability and bookings
          </Typography>
        </Box>
      </CustomTabPanel>
    </Box>
  );
};