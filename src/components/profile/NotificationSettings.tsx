import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import SaveIcon from '@mui/icons-material/Save';
import { NotificationSettings } from '../../types';
import { mockNotificationSettings } from '../../data/profileManagementMockData';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const NotificationGroup = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

interface NotificationSettingsProps {
  settings: NotificationSettings;
  onSettingsUpdate: (settings: NotificationSettings) => void;
  onBack: () => void;
}

export const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({
  settings: initialSettings,
  onSettingsUpdate,
  onBack
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSettingsUpdate(settings);
      setSuccessMessage('Notification settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const notificationCategories = [
    {
      title: 'Job Notifications',
      description: 'Get notified about new job opportunities and updates',
      settings: [
        {
          key: 'jobAlerts' as keyof NotificationSettings,
          label: 'New Job Alerts',
          description: 'Notify me when new jobs match my preferences'
        }
      ]
    },
    {
      title: 'Communication',
      description: 'Stay updated on messages and interactions',
      settings: [
        {
          key: 'messageNotifications' as keyof NotificationSettings,
          label: 'Message Notifications',
          description: 'Notify me when I receive new messages'
        },
        {
          key: 'bookingUpdates' as keyof NotificationSettings,
          label: 'Booking Updates',
          description: 'Notify me about booking confirmations and changes'
        }
      ]
    },
    {
      title: 'Engagement',
      description: 'Reminders and engagement notifications',
      settings: [
        {
          key: 'ratingReminders' as keyof NotificationSettings,
          label: 'Rating Reminders',
          description: 'Remind me to rate clients after job completion'
        }
      ]
    },
    {
      title: 'Marketing',
      description: 'Promotional and marketing communications',
      settings: [
        {
          key: 'marketingCommunications' as keyof NotificationSettings,
          label: 'Marketing Communications',
          description: 'Receive updates about new features and promotions'
        }
      ]
    }
  ];

  const deliveryMethods = [
    {
      key: 'emailNotifications' as keyof NotificationSettings,
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <EmailOutlinedIcon />
    },
    {
      key: 'pushNotifications' as keyof NotificationSettings,
      label: 'Push Notifications',
      description: 'Receive push notifications on your device',
      icon: <PhoneAndroidOutlinedIcon />
    },
    {
      key: 'smsNotifications' as keyof NotificationSettings,
      label: 'SMS Notifications',
      description: 'Receive notifications via SMS (charges may apply)',
      icon: <SmsOutlinedIcon />
    }
  ];

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button onClick={onBack} sx={{ mb: 2 }}>
            ← Back to Profile
          </Button>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Notification Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize how and when you receive notifications
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Notification Categories */}
        <SectionPaper>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <NotificationsOutlinedIcon color="primary" />
            <Typography variant="h6" fontWeight="medium">
              Notification Categories
            </Typography>
          </Stack>

          <Stack spacing={3}>
            {notificationCategories.map((category, index) => (
              <NotificationGroup key={index}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>
                
                <List dense>
                  {category.settings.map((setting) => (
                    <ListItem key={setting.key} sx={{ px: 0 }}>
                      <ListItemText
                        primary={setting.label}
                        secondary={setting.description}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          checked={settings[setting.key] as boolean}
                          onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                          color="primary"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </NotificationGroup>
            ))}
          </Stack>
        </SectionPaper>

        {/* Delivery Methods */}
        <SectionPaper>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Delivery Methods
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose how you want to receive notifications
          </Typography>

          <List>
            {deliveryMethods.map((method, index) => (
              <React.Fragment key={method.key}>
                <ListItem sx={{ px: 0 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {method.icon}
                  </Box>
                  <ListItemText
                    primary={method.label}
                    secondary={method.description}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings[method.key] as boolean}
                      onChange={(e) => handleSettingChange(method.key, e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < deliveryMethods.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </SectionPaper>

        {/* Quick Settings */}
        <SectionPaper>
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Quick Settings
          </Typography>
          
          <Stack spacing={2}>
            <Button
              variant="outlined"
              onClick={() => {
                const allEnabled = { ...settings };
                Object.keys(allEnabled).forEach(key => {
                  allEnabled[key as keyof NotificationSettings] = true;
                });
                setSettings(allEnabled);
              }}
              fullWidth
            >
              Enable All Notifications
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                const allDisabled = { ...settings };
                Object.keys(allDisabled).forEach(key => {
                  allDisabled[key as keyof NotificationSettings] = false;
                });
                setSettings(allDisabled);
              }}
              fullWidth
            >
              Disable All Notifications
            </Button>
          </Stack>
        </SectionPaper>

        {/* Save Button */}
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={isSubmitting as any}
          size="large"
          sx={{ alignSelf: 'flex-start' }}
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>

        {/* Information */}
        <Paper sx={{ p: 2, bgcolor: 'info.main', color: 'info.contrastText' }}>
          <Typography variant="body2">
            <strong>Note:</strong> You can change these settings anytime. 
            Critical notifications (like booking confirmations) will always be delivered 
            regardless of your preferences to ensure you don't miss important updates.
          </Typography>
        </Paper>
      </Stack>
    </StyledContainer>
  );
};