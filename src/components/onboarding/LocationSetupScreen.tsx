import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { DistanceRadius } from '../../types/enums';
import { LocationPermission, OnboardingStep } from '../../types/onboarding';
import { 
  getCurrentPosition, 
  reverseGeocode, 
  getDistanceRadiusOptions, 
  getIndianStates,
  checkLocationPermission
} from '../../utils/locationServices';
import { isMobileDevice, getLocationPermissionInstructions } from '../../utils/locationUtils';
import { validateCity, validateState, validatePinCode } from '../../utils/registrationValidation';
import { analyticsService } from '../../utils/analyticsEvents';
import { StepNavigation } from './StepNavigation';

interface LocationData {
  coordinates: { lat: number; lng: number } | null;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  workRadius: DistanceRadius;
  additionalLocations: string[];
}

interface LocationSetupScreenProps {
  locationData: LocationData;
  onLocationUpdate: (data: Partial<LocationData>) => void;
  locationPermission: LocationPermission;
  onRequestLocation: () => void;
  onNext: () => void;
  onBack: () => void;
}

const LocationCard = styled(Card)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    borderColor: theme.palette.primary.light
  }
}));

const GPSButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
  color: 'white',
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
  }
}));

export const LocationSetupScreen: React.FC<LocationSetupScreenProps> = ({
  locationData,
  onLocationUpdate,
  locationPermission,
  onRequestLocation,
  onNext,
  onBack
}) => {
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsError, setGpsError] = useState<string>('');

  const distanceOptions = getDistanceRadiusOptions();
  const indianStates = getIndianStates();

  useEffect(() => {
    analyticsService.trackStepViewed(OnboardingStep.LOCATION_SETUP);
  }, []);

  const handleGPSLocation = async () => {
    setIsLoadingGPS(true);
    setGpsError('');
    
    try {
      // Check basic capability issues first (non-HTTPS or unsupported)
      const permissionStatus = await checkLocationPermission();
      if (permissionStatus.error === 'Geolocation not supported') {
        throw new Error('Geolocation is not supported by this browser');
      }
      if (permissionStatus.error === 'Geolocation requires a secure context (HTTPS)') {
        throw new Error('Geolocation requires a secure context (HTTPS). Please use HTTPS to access this site.');
      }

      // Attempt to get current position regardless of prompt state
      const position = await getCurrentPosition();
      const address = await reverseGeocode(position.coordinates);
      
      onLocationUpdate({
        coordinates: position.coordinates,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
        address: address.formattedAddress
      });

      analyticsService.trackLocationPermission(true, 'gps');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setGpsError(errorMessage);
      
      // For mobile devices, provide more specific instructions
      if (isMobileDevice() && errorMessage.includes('denied')) {
        setGpsError(errorMessage + ' ' + getLocationPermissionInstructions());
      }
      
      analyticsService.trackLocationPermission(false, 'gps');
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const handleFieldChange = (field: keyof LocationData, value: any) => {
    onLocationUpdate({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cityValidation = validateCity(locationData.city);
    if (!cityValidation.isValid) {
      newErrors.city = cityValidation.error!;
    }

    const stateValidation = validateState(locationData.state);
    if (!stateValidation.isValid) {
      newErrors.state = stateValidation.error!;
    }

    const pinValidation = validatePinCode(locationData.pinCode);
    if (!pinValidation.isValid) {
      newErrors.pinCode = pinValidation.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      analyticsService.trackStepCompleted(OnboardingStep.LOCATION_SETUP, {
        hasGPSLocation: !!locationData.coordinates,
        city: locationData.city,
        state: locationData.state,
        workRadius: locationData.workRadius
      });
      onNext();
    } else {
      Object.entries(errors).forEach(([field, error]) => {
        analyticsService.trackValidationError(OnboardingStep.LOCATION_SETUP, field, error);
      });
    }
  };

  const canProceed = locationData.city && locationData.state && locationData.pinCode;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box textAlign="center">
            <LocationOnIcon 
              sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} 
            />
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              Where are you based?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}
            >
              Help clients find you by sharing your location and work radius
            </Typography>
          </Box>
        </Fade>

        {/* GPS Location */}
        <Fade in timeout={800}>
          <LocationCard>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Auto-detect Location
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Allow location access for quick setup
                </Typography>
                
                {gpsError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {gpsError}
                  </Alert>
                )}

                <GPSButton
                  variant="contained"
                  startIcon={isLoadingGPS ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
                  onClick={handleGPSLocation}
                  disabled={isLoadingGPS as any}
                  fullWidth
                >
                  {isLoadingGPS ? 'Getting Location...' : 'Use Current Location'}
                </GPSButton>
              </Stack>
            </CardContent>
          </LocationCard>
        </Fade>

        {/* Manual Location Entry */}
        <Fade in timeout={1000}>
          <LocationCard>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Enter Location Manually
                </Typography>

                {/* City */}
                <TextField
                  fullWidth
                  label="City"
                  value={locationData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  error={!!errors.city}
                  helperText={errors.city}
                  placeholder="e.g., Mumbai"
                  required
                />

                {/* State */}
                <Autocomplete
                  options={indianStates}
                  value={locationData.state}
                  onChange={(_, value) => handleFieldChange('state', value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="State"
                      error={!!errors.state}
                      helperText={errors.state}
                      required
                    />
                  )}
                  freeSolo
                />

                {/* PIN Code */}
                <TextField
                  fullWidth
                  label="PIN Code"
                  value={locationData.pinCode}
                  onChange={(e) => handleFieldChange('pinCode', e.target.value)}
                  error={!!errors.pinCode}
                  helperText={errors.pinCode}
                  placeholder="e.g., 400001"
                  inputProps={{ maxLength: 6 }}
                  required
                />

                {/* Work Radius */}
                <FormControl fullWidth>
                  <InputLabel>Work Radius</InputLabel>
                  <Select
                    value={locationData.workRadius}
                    label="Work Radius"
                    onChange={(e) => handleFieldChange('workRadius', e.target.value)}
                  >
                    {distanceOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Address (Optional) */}
                <TextField
                  fullWidth
                  label="Full Address (Optional)"
                  value={locationData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Complete address for better visibility"
                  multiline
                  rows={2}
                />
              </Stack>
            </CardContent>
          </LocationCard>
        </Fade>

        {/* Navigation */}
        <Fade in timeout={1200}>
          <StepNavigation
            onBack={onBack}
            onNext={handleNext}
            canProceed={!!canProceed}
            nextLabel="Continue"
            backLabel="Back"
          />
        </Fade>
      </Stack>
    </Box>
  );
};