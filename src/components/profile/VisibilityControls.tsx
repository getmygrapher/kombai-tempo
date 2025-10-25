import React from 'react';
import {
  Typography,
  Stack,
  Paper,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
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
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import { VisibilityLevel } from '../../types/enums';
import { PrivacySettings } from '../../store/profileManagementStore';

const VisibilityOption = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const FeatureToggle = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

interface VisibilityControlsProps {
  settings: PrivacySettings;
  onChange: (settings: Partial<PrivacySettings>) => void;
}

export const VisibilityControls: React.FC<VisibilityControlsProps> = ({
  settings,
  onChange
}) => {
  const handleVisibilityChange = (visibility: VisibilityLevel) => {
    onChange({ visibility });
  };

  const handleToggleChange = (key: keyof PrivacySettings, value: boolean) => {
    onChange({ [key]: value });
  };

  const visibilityOptions = [
    {
      value: VisibilityLevel.PUBLIC,
      icon: <PublicIcon color="success" />,
      title: 'Public',
      description: 'Anyone can view your profile and contact you',
      details: [
        'Visible in search results',
        'Profile appears in recommendations',
        'Anyone can view your portfolio and pricing',
        'Maximum visibility for new opportunities'
      ]
    },
    {
      value: VisibilityLevel.NETWORK,
      icon: <GroupIcon color="warning" />,
      title: 'Network Only',
      description: 'Only your connections and their networks can see your profile',
      details: [
        'Limited search visibility',
        'Shown to connected professionals',
        'Referrals from your network',
        'Balanced privacy and discoverability'
      ]
    },
    {
      value: VisibilityLevel.PRIVATE,
      icon: <LockIcon color="error" />,
      title: 'Private',
      description: 'Your profile is hidden from public searches',
      details: [
        'Not visible in search results',
        'Only direct links work',
        'Maximum privacy protection',
        'You can still apply to jobs'
      ]
    }
  ];

  const getVisibilityColor = (level: VisibilityLevel): 'success' | 'warning' | 'error' => {
    switch (level) {
      case VisibilityLevel.PUBLIC:
        return 'success';
      case VisibilityLevel.NETWORK:
        return 'warning';
      case VisibilityLevel.PRIVATE:
        return 'error';
      default:
        return 'success';
    }
  };

  const profileFeatures = [
    {
      key: 'showEquipment' as keyof PrivacySettings,
      title: 'Show Equipment List',
      description: 'Display your photography equipment on your profile'
    },
    {
      key: 'showPricing' as keyof PrivacySettings,
      title: 'Show Pricing Information',
      description: 'Display your rates and pricing structure to potential clients'
    },
    {
      key: 'showAvailability' as keyof PrivacySettings,
      title: 'Show Availability Calendar',
      description: 'Allow clients to see your available dates and time slots'
    }
  ];

  return (
    <Stack spacing={3}>
      {/* Profile Visibility */}
      <Box>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Profile Visibility
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control who can discover and view your profile
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={settings.visibility}
            onChange={(e) => handleVisibilityChange(e.target.value as VisibilityLevel)}
          >
            {visibilityOptions.map((option) => (
              <VisibilityOption
                key={option.value}
                sx={{
                  borderColor: settings.visibility === option.value 
                    ? `${getVisibilityColor(option.value)}.main` 
                    : 'divider',
                  backgroundColor: settings.visibility === option.value 
                    ? `${getVisibilityColor(option.value)}.light` 
                    : 'transparent',
                }}
              >
                <FormControlLabel
                  value={option.value}
                  control={<Radio color={getVisibilityColor(option.value)} />}
                  label={
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ width: '100%' }}>
                      {option.icon}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {option.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {option.description}
                        </Typography>
                        <List dense sx={{ mt: 1 }}>
                          {option.details.map((detail, index) => (
                            <ListItem key={index} sx={{ py: 0, px: 0 }}>
                              <Typography variant="caption" color="text.secondary">
                                • {detail}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Stack>
                  }
                  sx={{ margin: 0, alignItems: 'flex-start' }}
                />
              </VisibilityOption>
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider />

      {/* Profile Information Display */}
      <Box>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          Profile Information Display
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose what information to show on your public profile
        </Typography>

        {profileFeatures.map((feature) => (
          <FeatureToggle key={feature.key}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
              <Switch
                checked={settings[feature.key] as boolean}
                onChange={(e) => handleToggleChange(feature.key, e.target.checked)}
                color="primary"
              />
            </Stack>
          </FeatureToggle>
        ))}
      </Box>

      {/* Privacy Notice */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Privacy Note:</strong> Even with private settings, your profile may still be visible to:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
          <li>Clients you've previously worked with</li>
          <li>Professionals you've connected with</li>
          <li>GetMyGrapher support team (for verification purposes)</li>
        </Typography>
      </Alert>

      {/* Visibility Impact Warning */}
      {settings.visibility === VisibilityLevel.PRIVATE && (
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Impact of Private Profile:</strong> Setting your profile to private will significantly 
            reduce your visibility to potential clients. You may receive fewer job opportunities and 
            client inquiries.
          </Typography>
        </Alert>
      )}

      {/* Feature Recommendations */}
      {(!settings.showPricing || !settings.showEquipment) && (
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Recommendation:</strong> Showing your pricing and equipment information helps clients 
            make informed decisions and can lead to more qualified inquiries.
          </Typography>
        </Alert>
      )}
    </Stack>
  );
};