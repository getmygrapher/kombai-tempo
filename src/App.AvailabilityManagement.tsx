import React, { useState } from 'react';
import { 
  Box, 
  ThemeProvider, 
  CssBaseline, 
  Container,
  Tabs,
  Tab,
  Paper,
  Stack,
  Typography,
  Button,
  Chip
} from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';

// Import theme
import theme from './theme';

// Import availability components
import { AvailabilityManager } from './components/availability/AvailabilityManager';
import { AvailabilityAnalytics } from './components/availability/AvailabilityAnalytics';
import { CalendarHeader } from './components/availability/CalendarHeader';
import { CalendarLegend } from './components/availability/CalendarLegend';
import { QuickAvailabilityActions } from './components/availability/QuickAvailabilityActions';
import { BulkAvailabilityEditor } from './components/availability/BulkAvailabilityEditor';
import { AvailabilityPresets } from './components/availability/AvailabilityPresets';
import { RecurringPatternManager } from './components/availability/RecurringPatternManager';
import { TimeSlotSelector } from './components/availability/TimeSlotSelector';
import { CalendarViewMode } from './types/availability';

// Import availability services
import { AvailabilityService } from './services/availabilityService';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`availability-tabpanel-${index}`}
      aria-labelledby={`availability-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AvailabilityManagementApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [bulkEditorOpen, setBulkEditorOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Initialize real-time service
  React.useEffect(() => {
    AvailabilityService.initializeRealtime();
    
    return () => {
      AvailabilityService.disconnectRealtime();
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    console.log('Date selected:', date);
  };

  const handleTimeSlotSelect = (date: Date, timeSlots: any[]) => {
    console.log('Time slots selected for', date, ':', timeSlots);
  };

  const handleBulkAction = (action: string, dates: Date[]) => {
    console.log('Bulk action:', action, 'for dates:', dates);
  };

  const handlePatternApplied = (patternId: string) => {
    console.log('Pattern applied:', patternId);
  };

  const handleBulkEditorApply = (settings: any) => {
    console.log('Applying bulk settings:', settings);
    setBulkEditorOpen(false);
  };

  const handlePresetApply = (preset: any) => {
    console.log('Applying preset:', preset);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
            
            {/* Header */}
            <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)' }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    Availability Management System
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Comprehensive calendar and booking management for creative professionals
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="Calendar Navigation" color="primary" variant="outlined" size="small" />
                <Chip label="Time Slot Management" color="success" variant="outlined" size="small" />
                <Chip label="Recurring Patterns" color="info" variant="outlined" size="small" />
                <Chip label="Booking Integration" color="warning" variant="outlined" size="small" />
                <Chip label="Privacy Controls" color="secondary" variant="outlined" size="small" />
                <Chip label="Analytics Dashboard" color="error" variant="outlined" size="small" />
              </Stack>
            </Paper>

            {/* Navigation Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  icon={<CalendarMonthOutlinedIcon />} 
                  label="Calendar View" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SettingsOutlinedIcon />} 
                  label="Manage Availability" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SyncOutlinedIcon />} 
                  label="Recurring Patterns" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<PollOutlinedIcon />} 
                  label="Analytics" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<GppGoodOutlinedIcon />} 
                  label="Privacy Settings" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<BusinessCenterOutlinedIcon />} 
                  label="Components Demo" 
                  iconPosition="start"
                />
              </Tabs>
            </Paper>

            {/* Tab Panels */}
            <TabPanel value={currentTab} index={0}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Calendar View
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Interactive calendar with availability status, date selection, and time slot management.
                </Typography>
                
                <Stack spacing={3}>
                  <CalendarLegend orientation="horizontal" size="medium" />
                  
                  <AvailabilityManager
                    onDateSelect={handleDateSelect}
                    onTimeSlotSelect={handleTimeSlotSelect}
                    onBulkAction={handleBulkAction}
                  />
                </Stack>
              </Paper>
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Manage Availability
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Quick actions, bulk editing, and preset templates for efficient availability management.
                </Typography>
                
                <Stack spacing={4}>
                  <QuickAvailabilityActions onBulkAction={handleBulkAction} />
                  
                  <AvailabilityPresets onApplyPreset={handlePresetApply} />
                  
                  <Box>
                    <Button 
                      variant="contained" 
                      onClick={() => setBulkEditorOpen(true)}
                      sx={{ mb: 2 }}
                    >
                      Open Bulk Editor
                    </Button>
                    
                    <BulkAvailabilityEditor
                      open={bulkEditorOpen}
                      onClose={() => setBulkEditorOpen(false)}
                      onApply={handleBulkEditorApply}
                    />
                  </Box>
                </Stack>
              </Paper>
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Recurring Patterns
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create and manage recurring availability patterns with weekly schedules and exceptions.
                </Typography>
                
                <RecurringPatternManager onPatternApplied={handlePatternApplied} />
              </Paper>
            </TabPanel>

            <TabPanel value={currentTab} index={3}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Analytics Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Comprehensive analytics showing utilization rates, booking trends, and performance insights.
                </Typography>
                
                <AvailabilityAnalytics userId={mockRootProps.userId} />
              </Paper>
            </TabPanel>

            <TabPanel value={currentTab} index={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Privacy Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Control calendar visibility and manage privacy settings for your availability.
                </Typography>
                
                <Stack spacing={3}>
                  <Typography variant="h6">Privacy Controls Coming Soon</Typography>
                  <Typography variant="body2" color="text.secondary">
                    This section will include calendar visibility controls, access management, and privacy dashboard.
                  </Typography>
                  
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>Current Privacy Settings:</Typography>
                    <Typography variant="body2">• Visibility: {mockPrivacySettings.visibilityLevel}</Typography>
                    <Typography variant="body2">• Show Partial Availability: {mockPrivacySettings.showPartialAvailability ? 'Yes' : 'No'}</Typography>
                    <Typography variant="body2">• Allow Booking Requests: {mockPrivacySettings.allowBookingRequests ? 'Yes' : 'No'}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </TabPanel>

            <TabPanel value={currentTab} index={5}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Components Demo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Individual component demonstrations and testing.
                </Typography>
                
                <Stack spacing={4}>
                  {/* Calendar Header Demo */}
                  <Box>
                    <Typography variant="h6" gutterBottom>Calendar Header</Typography>
                    <CalendarHeader
                      currentDate={selectedDate}
                      viewMode={CalendarViewMode.MONTH}
                      onNavigate={(direction) => {
                        const newDate = new Date(selectedDate);
                        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
                        setSelectedDate(newDate);
                      }}
                      onToday={() => setSelectedDate(new Date())}
                      onViewModeChange={(mode) => console.log('View mode:', mode)}
                      onAddAvailability={() => console.log('Add availability')}
                    />
                  </Box>

                  {/* Time Slot Selector Demo */}
                  <Box>
                    <Typography variant="h6" gutterBottom>Time Slot Selector</Typography>
                    <TimeSlotSelector
                      date={selectedDate}
                      onTimeSlotSelect={(timeSlots) => console.log('Selected time slots:', timeSlots)}
                    />
                  </Box>

                  {/* Calendar Legend Demo */}
                  <Box>
                    <Typography variant="h6" gutterBottom>Calendar Legend</Typography>
                    <CalendarLegend orientation="vertical" size="medium" />
                  </Box>
                </Stack>
              </Paper>
            </TabPanel>

          </Container>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default AvailabilityManagementApp;