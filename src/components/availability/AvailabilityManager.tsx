import React, { useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Tabs,
  Tab,
  Divider,
  useTheme,
  useMediaQuery,
  Fab,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLegend } from './CalendarLegend';
import { QuickAvailabilityActions } from './QuickAvailabilityActions';
import { BulkAvailabilityEditor } from './BulkAvailabilityEditor';
import { AvailabilityPresets } from './AvailabilityPresets';
import { TimeSlotSelector } from './TimeSlotSelector';
import { useAvailabilityStore } from '../../store/availabilityStore';
import { CalendarViewMode } from '../../types/availability';

const ManagerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 300px',
  gap: theme.spacing(3),
  flex: 1,
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr 280px',
    gap: theme.spacing(2),
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

const CalendarSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  height: 'fit-content',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const SidePanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  height: 'fit-content',
  position: 'sticky',
  top: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    position: 'static',
  },
}));

const MobileFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10),
  right: theme.spacing(2),
  zIndex: 1000,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const CollapsibleSection = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    '& .MuiCollapse-root': {
      marginTop: theme.spacing(1),
    },
  },
}));

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
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface AvailabilityManagerProps {
  onDateSelect?: (date: Date) => void;
  onTimeSlotSelect?: (date: Date, timeSlots: any[]) => void;
  onBulkAction?: (action: string, dates: Date[]) => void;
}

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  onDateSelect,
  onTimeSlotSelect,
  onBulkAction,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    currentViewDate,
    setCurrentViewDate,
    viewMode,
    setViewMode,
    selectedDates,
  } = useAvailabilityStore();

  const [sideTabValue, setSideTabValue] = useState(0);
  const [bulkEditorOpen, setBulkEditorOpen] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [selectedDateForTimeSlots, setSelectedDateForTimeSlots] = useState<Date | null>(null);

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentViewDate);
    if (viewMode === CalendarViewMode.MONTH) {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentViewDate(newDate);
  };

  const handleToday = () => {
    setCurrentViewDate(new Date());
  };

  const handleViewModeChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
  };

  const handleAddAvailability = () => {
    setBulkEditorOpen(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDateForTimeSlots(date);
    onDateSelect?.(date);
  };

  const handleTimeSlotSelect = (date: Date, timeSlots: any[]) => {
    onTimeSlotSelect?.(date, timeSlots);
  };

  const handleBulkAction = (action: string, dates: Date[]) => {
    onBulkAction?.(action, dates);
  };

  const handleBulkEditorApply = (settings: any) => {
    console.log('Applying bulk settings:', settings);
    // Handle bulk edit application
  };

  const handlePresetApply = (preset: any) => {
    console.log('Applying preset:', preset);
    // Handle preset application
  };

  const handleSideTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSideTabValue(newValue);
  };

  return (
    <ManagerContainer>
      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentViewDate}
        viewMode={viewMode}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onViewModeChange={handleViewModeChange}
        onAddAvailability={handleAddAvailability}
      />

      <Divider sx={{ my: 2 }} />

      {/* Main Content */}
      <MainContent>
        {/* Calendar Section */}
        <CalendarSection elevation={2}>
          <Stack spacing={3}>
            {/* Calendar Legend */}
            <CalendarLegend 
              orientation="horizontal" 
              size="small" 
              hideOnMobile={false as any}
            />
            
            {/* Calendar */}
            <AvailabilityCalendar
              onDateSelect={handleDateSelect}
              onTimeSlotSelect={handleTimeSlotSelect}
            />

            {/* Time Slot Selector for Selected Date */}
            {selectedDateForTimeSlots && (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Time Slots for {selectedDateForTimeSlots.toLocaleDateString()}
                </Typography>
                <TimeSlotSelector
                  date={selectedDateForTimeSlots}
                  onTimeSlotSelect={(timeSlots) => 
                    handleTimeSlotSelect(selectedDateForTimeSlots, timeSlots)
                  }
                />
              </Box>
            )}
          </Stack>
        </CalendarSection>

        {/* Side Panel - Desktop */}
        {!isMobile && (
          <SidePanel elevation={2}>
            <Tabs
              value={sideTabValue}
              onChange={handleSideTabChange}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab
                icon={<FlashOnOutlinedIcon />}
                label="Quick"
                iconPosition="start"
              />
              <Tab
                icon={<BookmarksOutlinedIcon />}
                label="Presets"
                iconPosition="start"
              />
            </Tabs>

            <TabPanel value={sideTabValue} index={0}>
              <QuickAvailabilityActions onBulkAction={handleBulkAction} />
            </TabPanel>

            <TabPanel value={sideTabValue} index={1}>
              <AvailabilityPresets onApplyPreset={handlePresetApply} />
            </TabPanel>
          </SidePanel>
        )}

        {/* Mobile Actions Section */}
        {isMobile && (
          <CollapsibleSection>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => setMobileActionsOpen(!mobileActionsOpen)}
                sx={{ cursor: 'pointer' }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Quick Actions & Presets
                </Typography>
                {mobileActionsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Stack>
              
              <Collapse in={mobileActionsOpen}>
                <Box sx={{ mt: 2 }}>
                  <Tabs
                    value={sideTabValue}
                    onChange={handleSideTabChange}
                    variant="fullWidth"
                    sx={{ mb: 2 }}
                  >
                    <Tab
                      icon={<FlashOnOutlinedIcon />}
                      label="Quick Actions"
                      iconPosition="start"
                    />
                    <Tab
                      icon={<BookmarksOutlinedIcon />}
                      label="Presets"
                      iconPosition="start"
                    />
                  </Tabs>

                  <TabPanel value={sideTabValue} index={0}>
                    <QuickAvailabilityActions onBulkAction={handleBulkAction} />
                  </TabPanel>

                  <TabPanel value={sideTabValue} index={1}>
                    <AvailabilityPresets onApplyPreset={handlePresetApply} />
                  </TabPanel>
                </Box>
              </Collapse>
            </Paper>
          </CollapsibleSection>
        )}
      </MainContent>

      {/* Mobile FAB for Bulk Editor */}
      <MobileFab
        color="primary"
        onClick={() => setBulkEditorOpen(true)}
        disabled={(selectedDates.length === 0) as any}
      >
        <EditOutlinedIcon />
      </MobileFab>

      {/* Bulk Availability Editor */}
      <BulkAvailabilityEditor
        open={bulkEditorOpen}
        onClose={() => setBulkEditorOpen(false)}
        onApply={handleBulkEditorApply}
      />
    </ManagerContainer>
  );
};