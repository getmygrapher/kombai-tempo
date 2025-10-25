import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Tabs,
  Tab,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContactsIcon from '@mui/icons-material/Contacts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { PrivacySettings as IPrivacySettings } from '../../store/profileManagementStore';
import { NotificationSettings } from '../../types';
import { VisibilityControls } from './VisibilityControls';
import { ContactSettings } from './ContactSettings';
import { NotificationSettingsComponent } from './NotificationSettings';
import { useProfileManagementStore } from '../../store/profileManagementStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const TabPanel = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(3),
}));

interface PrivacySettingsProps {
  settings: IPrivacySettings;
  notificationSettings: NotificationSettings;
  onSave: (settings: IPrivacySettings) => Promise<void>;
  onNotificationSave: (settings: NotificationSettings) => Promise<void>;
  onCancel: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  settings: initialSettings,
  notificationSettings: initialNotificationSettings,
  onSave,
  onNotificationSave,
  onCancel
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState<IPrivacySettings>(initialSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(initialNotificationSettings);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { isSaving, error } = useProfileManagementStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSettingsChange = (newSettings: Partial<IPrivacySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleNotificationSettingsChange = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
  };

  const handleSave = async () => {
    try {
      if (currentTab === 0 || currentTab === 1) {
        // Save privacy/visibility settings
        await onSave(settings);
      } else if (currentTab === 2) {
        // Save notification settings
        await onNotificationSave(notificationSettings);
      }
      
      setShowSuccessSnackbar(true);
    } catch (error) {
      setErrorMessage('Failed to save settings. Please try again.');
      setShowErrorSnackbar(true);
    }
  };

  const tabs = [
    {
      label: 'Visibility',
      icon: <VisibilityIcon />,
      description: 'Control who can see your profile and information'
    },
    {
      label: 'Contact',
      icon: <ContactsIcon />,
      description: 'Manage contact sharing and communication preferences'
    },
    {
      label: 'Notifications',
      icon: <NotificationsIcon />,
      description: 'Customize your notification preferences'
    }
  ];

  return (
    <>
      <StyledContainer>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={onCancel} 
              sx={{ mb: 2 }}
            >
              Back to Profile
            </Button>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Privacy & Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabs[currentTab].description}
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => useProfileManagementStore.getState().setError(null)}>
              {error}
            </Alert>
          )}

          {/* Tabs */}
          <Paper sx={{ borderRadius: 2 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 72,
                  textTransform: 'none',
                  fontWeight: 500
                }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {tab.icon}
                      <Typography variant="subtitle2" fontWeight="medium">
                        {tab.label}
                      </Typography>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <TabPanel>
            {currentTab === 0 && (
              <VisibilityControls
                settings={settings}
                onChange={handleSettingsChange}
              />
            )}

            {currentTab === 1 && (
              <ContactSettings
                settings={settings}
                onChange={handleSettingsChange}
              />
            )}

            {currentTab === 2 && (
              <Box sx={{ mt: -2 }}>
                <NotificationSettingsComponent
                  settings={notificationSettings}
                  onSettingsUpdate={handleNotificationSettingsChange}
                  onBack={() => {}} // Empty function since we handle navigation differently
                />
              </Box>
            )}
          </TabPanel>

          {/* Save Button */}
          {currentTab !== 2 && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSaving as any}
              size="large"
              sx={{ alignSelf: 'flex-start' }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          )}
        </Stack>
      </StyledContainer>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar as any}
        autoHideDuration={3000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessSnackbar(false)} 
          severity="success"
          variant="filled"
        >
          Settings saved successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar as any}
        autoHideDuration={5000}
        onClose={() => setShowErrorSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowErrorSnackbar(false)} 
          severity="error"
          variant="filled"
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};