import React from 'react';
import {
  Typography,
  Stack,
  Paper,
  FormControlLabel,
  Switch,
  Box,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ShareIcon from '@mui/icons-material/Share';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import MessageIcon from '@mui/icons-material/Message';
import { PrivacySettings } from '../../store/profileManagementStore';

const SettingGroup = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ContactMethod = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
}));

interface ContactSettingsProps {
  settings: PrivacySettings;
  onChange: (settings: Partial<PrivacySettings>) => void;
}

export const ContactSettings: React.FC<ContactSettingsProps> = ({
  settings,
  onChange
}) => {
  const handleToggleChange = (key: keyof PrivacySettings, value: boolean) => {
    onChange({ [key]: value });
  };

  const contactMethods = [
    {
      icon: <EmailIcon color="primary" />,
      title: 'Email Notifications',
      description: 'Receive important updates and messages via email',
      key: 'emailNotifications' as keyof PrivacySettings,
      enabled: settings.emailNotifications
    },
    {
      icon: <PhoneIcon color="primary" />,
      title: 'SMS Notifications',
      description: 'Get urgent notifications via SMS (charges may apply)',
      key: 'smsNotifications' as keyof PrivacySettings,
      enabled: settings.smsNotifications
    },
    {
      icon: <MessageIcon color="primary" />,
      title: 'Push Notifications',
      description: 'Receive real-time notifications on your device',
      key: 'pushNotifications' as keyof PrivacySettings,
      enabled: settings.pushNotifications
    }
  ];

  return (
    <Stack spacing={3}>
      {/* Contact Sharing */}
      <SettingGroup>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <ShareIcon color="primary" />
          <Typography variant="h6" fontWeight="medium">
            Contact Information Sharing
          </Typography>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={settings.allowContactSharing}
              onChange={(e) => handleToggleChange('allowContactSharing', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography variant="subtitle2" fontWeight="medium">
                Allow Contact Sharing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Let clients access your contact information after initial inquiry
              </Typography>
            </Box>
          }
        />

        <Box sx={{ mt: 2, pl: 4 }}>
          <Typography variant="body2" color="text.secondary">
            When enabled, clients can:
          </Typography>
          <List dense>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="caption" color="text.secondary">
                • View your phone number after sending an inquiry
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="caption" color="text.secondary">
                • Access your email address for direct communication
              </Typography>
            </ListItem>
            <ListItem sx={{ py: 0 }}>
              <Typography variant="caption" color="text.secondary">
                • Contact you outside the platform for urgent matters
              </Typography>
            </ListItem>
          </List>
        </Box>
      </SettingGroup>

      <Divider />

      {/* Communication Preferences */}
      <Box>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Communication Preferences
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose how you want to receive notifications and updates
        </Typography>

        {contactMethods.map((method) => (
          <ContactMethod key={method.key}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                {method.icon}
                <Box>
                  <Typography variant="subtitle2" fontWeight="medium">
                    {method.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {method.description}
                  </Typography>
                </Box>
              </Stack>
              <Switch
                checked={method.enabled}
                onChange={(e) => handleToggleChange(method.key, e.target.checked)}
                color="primary"
              />
            </Stack>
          </ContactMethod>
        ))}
      </Box>

      {/* Privacy Recommendations */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Privacy Tip:</strong> We recommend keeping contact sharing enabled to facilitate 
          smooth communication with clients. Your contact information is only shared after a client 
          shows genuine interest in your services.
        </Typography>
      </Alert>

      {/* Contact Sharing Warning */}
      {!settings.allowContactSharing && (
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Limited Communication:</strong> With contact sharing disabled, all communication 
            must happen through the platform. This may slow down the booking process and limit 
            your ability to handle urgent client requests.
          </Typography>
        </Alert>
      )}

      {/* Notification Recommendations */}
      {!settings.emailNotifications && !settings.pushNotifications && !settings.smsNotifications && (
        <Alert severity="error">
          <Typography variant="body2">
            <strong>No Notifications Enabled:</strong> You won't receive any notifications about 
            new messages, job opportunities, or important updates. This may cause you to miss 
            time-sensitive opportunities.
          </Typography>
        </Alert>
      )}

      {/* SMS Charges Notice */}
      {settings.smsNotifications && (
        <Alert severity="info">
          <Typography variant="body2">
            <strong>SMS Charges:</strong> Standard SMS rates may apply based on your mobile plan. 
            SMS notifications are only sent for urgent matters like booking confirmations and 
            last-minute changes.
          </Typography>
        </Alert>
      )}
    </Stack>
  );
};