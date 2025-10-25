import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Box, Tabs, Tab, Paper } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '../../theme';
import { AvailabilityCalendar } from '../availability/AvailabilityCalendar';
import { RecurringPatternManager } from '../availability/RecurringPatternManager';
import { AvailabilityStats } from '../availability/AvailabilityStats';
import { CalendarPrivacyControls } from '../availability/CalendarPrivacyControls';
import { QuickAvailabilityActions } from '../availability/QuickAvailabilityActions';
import { TierType } from '../../types/enums';

// Create a client
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

export const CalendarPage: React.FC = () => {
  const [availabilityTab, setAvailabilityTab] = useState(0);
  
  // Mock user tier - in real app this would come from user context
  const userTier = TierType.PRO;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setAvailabilityTab(newValue);
  };

  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date);
  };

  const handleTimeSlotSelect = (date: Date, timeSlots: any[]) => {
    console.log('Time slots selected for', date, ':', timeSlots);
  };

  const handlePatternApplied = (patternId: string) => {
    console.log('Pattern applied:', patternId);
  };

  const handleBulkAction = (action: string, dates: Date[]) => {
    console.log('Bulk action:', action, 'for dates:', dates);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Container maxWidth="lg" sx={{ py: 2, pb: 12 }}>
          {/* Main Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={availabilityTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Calendar" />
              <Tab label="Quick Actions" />
              <Tab label="Recurring Patterns" />
              <Tab label="Analytics" />
              <Tab label="Privacy Settings" />
            </Tabs>
          </Paper>

          {/* Tab Panels */}
          <TabPanel value={availabilityTab} index={0}>
            <AvailabilityCalendar
              onDateSelect={handleDateSelect}
              onTimeSlotSelect={handleTimeSlotSelect}
            />
          </TabPanel>

          <TabPanel value={availabilityTab} index={1}>
            <QuickAvailabilityActions onBulkAction={handleBulkAction} />
          </TabPanel>

          <TabPanel value={availabilityTab} index={2}>
            <RecurringPatternManager onPatternApplied={handlePatternApplied} />
          </TabPanel>

          <TabPanel value={availabilityTab} index={3}>
            <AvailabilityStats userTier={userTier} />
          </TabPanel>

          <TabPanel value={availabilityTab} index={4}>
            <CalendarPrivacyControls userTier={userTier} />
          </TabPanel>
        </Container>
      </QueryClientProvider>
    </ThemeProvider>
  );
};