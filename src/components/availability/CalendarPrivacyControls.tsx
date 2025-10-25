import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAvailabilityStore } from '../../store/availabilityStore';
import { useUpdatePrivacySettings } from '../../hooks/useAvailability';
import { formatCalendarVisibility } from '../../utils/availabilityFormatters';
import { CalendarVisibility } from '../../types/availability';
import { TierType } from '../../types/enums';

const PrivacyCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(236, 72, 153, 0.03) 100%)',
  border: `1px solid ${theme.palette.divider}`
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`
}));

interface CalendarPrivacyControlsProps {
  userTier: TierType;
}

export const CalendarPrivacyControls: React.FC<CalendarPrivacyControlsProps> = ({
  userTier
}) => {
  const { privacySettings, updatePrivacySettings } = useAvailabilityStore();
  const [allowedUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Sarah Wilson', email: 'sarah@example.com' }
  ]);

  const updatePrivacyMutation = useUpdatePrivacySettings();

  const handleVisibilityChange = async (visibility: CalendarVisibility) => {
    const updatedSettings = { ...privacySettings, visibilityLevel: visibility };
    updatePrivacySettings(updatedSettings);
    
    try {
      await updatePrivacyMutation.mutateAsync(updatedSettings);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const handleSettingToggle = async (setting: string, value: boolean) => {
    const updatedSettings = { ...privacySettings, [setting]: value };
    updatePrivacySettings(updatedSettings);
    
    try {
      await updatePrivacyMutation.mutateAsync(updatedSettings);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const isPremiumFeature = userTier !== TierType.PRO;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <ShieldOutlinedIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Privacy & Visibility Settings
        </Typography>
        {userTier === TierType.PRO && (
          <Chip label="Pro Feature" color="primary" size="small" />
        )}
      </Stack>

      <Stack spacing={3}>
        {/* Calendar Visibility */}
        <PrivacyCard>
          <CardContent>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Calendar Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Control who can see your availability calendar
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Visibility Level</InputLabel>
              <Select
                value={privacySettings.visibilityLevel}
                onChange={(e) => handleVisibilityChange(e.target.value as CalendarVisibility)}
                label="Visibility Level"
              >
                <MenuItem value={CalendarVisibility.PUBLIC}>
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>Public</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Visible to all users on the platform
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value={CalendarVisibility.PROFESSIONAL_NETWORK}>
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>Professional Network</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Visible to verified professionals only
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value={CalendarVisibility.CONTACTS_ONLY}>
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>Contacts Only</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Visible to your connected professionals
                    </Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value={CalendarVisibility.PRIVATE}>
                  <Stack>
                    <Typography variant="body2" fontWeight={500}>Private</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hidden from all users
                    </Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <Alert severity="info" sx={{ mt: 2 }}>
              Current setting: {formatCalendarVisibility(privacySettings.visibilityLevel)}
            </Alert>
          </CardContent>
        </PrivacyCard>

        {/* Booking Settings */}
        <FeatureCard elevation={1}>
          <Typography variant="h6" mb={2} fontWeight={600}>
            Booking Preferences
          </Typography>
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.allowBookingRequests}
                  onChange={(e) => handleSettingToggle('allowBookingRequests', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Allow Booking Requests
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Let clients send booking requests for your available slots
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.showPartialAvailability}
                  onChange={(e) => handleSettingToggle('showPartialAvailability', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Show Partial Availability
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Display partially available time slots to potential clients
                  </Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.autoDeclineConflicts}
                  onChange={(e) => handleSettingToggle('autoDeclineConflicts', e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    Auto-decline Conflicts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Automatically decline booking requests that conflict with existing bookings
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </FeatureCard>

        {/* Advanced Privacy Controls */}
        {isPremiumFeature ? (
          <Paper sx={{ p: 4, textAlign: 'center', opacity: 0.6 }}>
            <Typography variant="h6" mb={2}>
              Advanced Privacy Controls
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Upgrade to Pro to access granular privacy controls
            </Typography>
            <Stack spacing={2} sx={{ filter: 'blur(2px)', pointerEvents: 'none' }}>
              <FormControlLabel
                control={<Switch checked />}
                label="Hide specific dates"
              />
              <FormControlLabel
                control={<Switch checked />}
                label="Custom user permissions"
              />
              <FormControlLabel
                control={<Switch checked />}
                label="Time slot level privacy"
              />
            </Stack>
          </Paper>
        ) : (
          <FeatureCard elevation={1}>
            <Typography variant="h6" mb={2} fontWeight={600}>
              Allowed Users
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Manage who can view your calendar when set to "Contacts Only"
            </Typography>

            {allowedUsers.length === 0 ? (
              <Alert severity="info">
                No specific users added. All your professional contacts can view your calendar.
              </Alert>
            ) : (
              <List>
                {allowedUsers.map((user) => (
                  <ListItem key={user.id} divider>
                    <ListItemText
                      primary={user.name}
                      secondary={user.email}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            <Button
              startIcon={<PersonAddIcon />}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add User
            </Button>
          </FeatureCard>
        )}

        {/* Calendar Status */}
        <FeatureCard elevation={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Calendar Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {privacySettings.isVisible ? 'Your calendar is visible' : 'Your calendar is hidden'}
              </Typography>
            </Box>
            
            <Stack direction="row" alignItems="center" spacing={2}>
              {privacySettings.isVisible ? (
                <VisibilityIcon color="success" />
              ) : (
                <VisibilityOffIcon color="error" />
              )}
              <Switch
                checked={privacySettings.isVisible}
                onChange={(e) => handleSettingToggle('isVisible', e.target.checked)}
                color="primary"
              />
            </Stack>
          </Stack>
        </FeatureCard>

        {/* Save Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            disabled={updatePrivacyMutation.isPending as any}
          >
            {updatePrivacyMutation.isPending ? 'Saving...' : 'Settings Auto-saved'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};