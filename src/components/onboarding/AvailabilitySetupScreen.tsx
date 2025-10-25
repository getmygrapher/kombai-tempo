import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  TextField,
  Fade,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { OnboardingStep, BookingLeadTime, AdvanceBookingLimit } from '../../types/onboarding';
import { analyticsService } from '../../utils/analyticsEvents';
import { StepNavigation } from './StepNavigation';

interface AvailabilityData {
  defaultSchedule: Record<string, { available: boolean; startTime: string; endTime: string }>;
  leadTime: string;
  advanceBookingLimit: string;
  calendarVisibility: string;
}

interface AvailabilitySetupScreenProps {
  availabilityData: AvailabilityData;
  onAvailabilityUpdate: (data: Partial<AvailabilityData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DayCard = styled(Card)<{ available?: boolean }>(({ theme, available }) => ({
  border: available 
    ? `2px solid ${theme.palette.success.main}` 
    : `1px solid ${theme.palette.divider}`,
  backgroundColor: available 
    ? `${theme.palette.success.main}08` 
    : theme.palette.background.paper,
  transition: 'all 0.3s ease-in-out'
}));

const days = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
];

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const AvailabilitySetupScreen: React.FC<AvailabilitySetupScreenProps> = ({
  availabilityData,
  onAvailabilityUpdate,
  onNext,
  onBack
}) => {
  useEffect(() => {
    analyticsService.trackStepViewed(OnboardingStep.AVAILABILITY_SETUP);
  }, []);

  const handleScheduleChange = (day: string, field: string, value: any) => {
    const newSchedule = {
      ...availabilityData.defaultSchedule,
      [day]: {
        ...availabilityData.defaultSchedule[day],
        [field]: value
      }
    };
    onAvailabilityUpdate({ defaultSchedule: newSchedule });
  };

  const handleFieldChange = (field: keyof AvailabilityData, value: any) => {
    onAvailabilityUpdate({ [field]: value });
  };

  const handleNext = () => {
    const availableDays = Object.values(availabilityData.defaultSchedule)
      .filter(day => day.available).length;
    
    analyticsService.trackStepCompleted(OnboardingStep.AVAILABILITY_SETUP, {
      availableDays,
      leadTime: availabilityData.leadTime,
      advanceBookingLimit: availabilityData.advanceBookingLimit,
      calendarVisibility: availabilityData.calendarVisibility
    });
    onNext();
  };

  const getAvailableDaysCount = () => {
    return Object.values(availabilityData.defaultSchedule)
      .filter(day => day.available).length;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box textAlign="center">
            <ScheduleIcon 
              sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} 
            />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              Set your availability
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
            >
              Configure your default schedule and booking preferences. You can always adjust these later.
            </Typography>
          </Box>
        </Fade>

        {/* Weekly Schedule */}
        <Fade in timeout={800}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Weekly Schedule
                  </Typography>
                  <Chip 
                    label={`${getAvailableDaysCount()} days available`}
                    color={getAvailableDaysCount() > 0 ? 'success' : 'default'}
                    size="small"
                  />
                </Box>

                <Grid container spacing={2}>
                  {days.map((day) => {
                    const dayData = availabilityData.defaultSchedule[day.key];
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={day.key}>
                        <DayCard available={dayData.available}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack spacing={2}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={dayData.available}
                                    onChange={(e) => 
                                      handleScheduleChange(day.key, 'available', e.target.checked)
                                    }
                                    color="success"
                                  />
                                }
                                label={
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {day.label}
                                  </Typography>
                                }
                              />

                              {dayData.available && (
                                <Stack spacing={1}>
                                  <FormControl size="small" fullWidth>
                                    <InputLabel>Start Time</InputLabel>
                                    <Select
                                      value={dayData.startTime}
                                      label="Start Time"
                                      onChange={(e) => 
                                        handleScheduleChange(day.key, 'startTime', e.target.value)
                                      }
                                    >
                                      {timeSlots.map((time) => (
                                        <MenuItem key={time} value={time}>
                                          {time}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>

                                  <FormControl size="small" fullWidth>
                                    <InputLabel>End Time</InputLabel>
                                    <Select
                                      value={dayData.endTime}
                                      label="End Time"
                                      onChange={(e) => 
                                        handleScheduleChange(day.key, 'endTime', e.target.value)
                                      }
                                    >
                                      {timeSlots.map((time) => (
                                        <MenuItem key={time} value={time}>
                                          {time}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Stack>
                              )}
                            </Stack>
                          </CardContent>
                        </DayCard>
                      </Grid>
                    );
                  })}
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Booking Settings */}
        <Fade in timeout={1000}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Booking Settings
                </Typography>

                {/* Lead Time */}
                <FormControl fullWidth>
                  <InputLabel>Minimum Lead Time</InputLabel>
                  <Select
                    value={availabilityData.leadTime}
                    label="Minimum Lead Time"
                    onChange={(e) => handleFieldChange('leadTime', e.target.value)}
                  >
                    <MenuItem value={BookingLeadTime.IMMEDIATE}>Immediate</MenuItem>
                    <MenuItem value={BookingLeadTime.ONE_HOUR}>1 Hour</MenuItem>
                    <MenuItem value={BookingLeadTime.FOUR_HOURS}>4 Hours</MenuItem>
                    <MenuItem value={BookingLeadTime.ONE_DAY}>1 Day</MenuItem>
                    <MenuItem value={BookingLeadTime.TWO_DAYS}>2 Days</MenuItem>
                    <MenuItem value={BookingLeadTime.ONE_WEEK}>1 Week</MenuItem>
                  </Select>
                </FormControl>

                {/* Advance Booking Limit */}
                <FormControl fullWidth>
                  <InputLabel>Maximum Advance Booking</InputLabel>
                  <Select
                    value={availabilityData.advanceBookingLimit}
                    label="Maximum Advance Booking"
                    onChange={(e) => handleFieldChange('advanceBookingLimit', e.target.value)}
                  >
                    <MenuItem value={AdvanceBookingLimit.ONE_WEEK}>1 Week</MenuItem>
                    <MenuItem value={AdvanceBookingLimit.TWO_WEEKS}>2 Weeks</MenuItem>
                    <MenuItem value={AdvanceBookingLimit.ONE_MONTH}>1 Month</MenuItem>
                    <MenuItem value={AdvanceBookingLimit.THREE_MONTHS}>3 Months</MenuItem>
                    <MenuItem value={AdvanceBookingLimit.SIX_MONTHS}>6 Months</MenuItem>
                    <MenuItem value={AdvanceBookingLimit.ONE_YEAR}>1 Year</MenuItem>
                  </Select>
                </FormControl>

                {/* Calendar Visibility */}
                <FormControl fullWidth>
                  <InputLabel>Calendar Visibility</InputLabel>
                  <Select
                    value={availabilityData.calendarVisibility}
                    label="Calendar Visibility"
                    onChange={(e) => handleFieldChange('calendarVisibility', e.target.value)}
                  >
                    <MenuItem value="public">Public - Anyone can see your availability</MenuItem>
                    <MenuItem value="contacts_only">Contacts Only - Only your contacts can see</MenuItem>
                    <MenuItem value="private">Private - Only you can see your calendar</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Quick Setup Options */}
        <Fade in timeout={1200}>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  💡 Quick Tip
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Don't worry about getting this perfect right now. You can always update your availability 
                  and booking settings later from your profile. This is just to get you started!
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Navigation */}
        <Fade in timeout={1400}>
          <StepNavigation
            onBack={onBack}
            onNext={handleNext}
            canProceed={true as any} // This step is optional
            nextLabel="Complete Setup"
            backLabel="Back"
          />
        </Fade>
      </Stack>
    </Box>
  );
};