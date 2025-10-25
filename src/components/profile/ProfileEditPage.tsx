import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { ProfileEditSection } from '../../types/enums';
import { User, ProfileFormData } from '../../types';
import { ProfileEditForm } from './ProfileEditForm';
import { useProfileManagementStore } from '../../store/profileManagementStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: 0,
  paddingBottom: theme.spacing(10),
}));

const TabPanel = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

interface ProfileEditPageProps {
  user: User;
  onSave: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  initialSection?: ProfileEditSection;
}

export const ProfileEditPage: React.FC<ProfileEditPageProps> = ({
  user,
  onSave,
  onCancel,
  initialSection = ProfileEditSection.BASIC_INFO
}) => {
  const [currentTab, setCurrentTab] = useState<ProfileEditSection>(initialSection);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { isSaving, error } = useProfileManagementStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: ProfileEditSection) => {
    setCurrentTab(newValue);
  };

  const handleSave = async (data: ProfileFormData) => {
    try {
      await onSave(data);
      setShowSuccessSnackbar(true);
      // Auto-close after successful save
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error) {
      setErrorMessage('Failed to save profile changes. Please try again.');
      setShowErrorSnackbar(true);
    }
  };

  const tabs = [
    {
      value: ProfileEditSection.BASIC_INFO,
      label: 'Basic Info',
      description: 'Personal information and contact details'
    },
    {
      value: ProfileEditSection.PROFESSIONAL,
      label: 'Professional',
      description: 'Professional category, experience, and specializations'
    },
    {
      value: ProfileEditSection.PRICING,
      label: 'Pricing',
      description: 'Pricing structure and rates'
    }
  ];

  return (
    <>
      {/* Header */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onCancel}
            disabled={isSaving as any}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Edit Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tabs.find(tab => tab.value === currentTab)?.description}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSaving as any}
            onClick={() => {
              // Trigger form submission
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Toolbar>
      </AppBar>

      <StyledContainer>
        <Stack spacing={3}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => useProfileManagementStore.getState().setError(null)}>
              {error}
            </Alert>
          )}

          {/* Section Tabs */}
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
              {tabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {tab.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tab.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <TabPanel>
            <ProfileEditForm
              user={user}
              onSave={handleSave}
              onCancel={onCancel}
            />
          </TabPanel>
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
          Profile updated successfully!
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