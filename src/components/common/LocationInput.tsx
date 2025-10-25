import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocationOn,
  MyLocation,
  Map,
  Clear
} from '@mui/icons-material';
import { useFormValidation, useLocationValidation } from '../../hooks/useFormValidation';
import { LocationFormData } from '../../utils/validationSchemas';
import { isMobileDevice, getLocationPermissionInstructions } from '../../utils/locationUtils';

interface LocationInputProps {
  value?: LocationFormData;
  onChange: (location: LocationFormData) => void;
  onError?: (error: string | null) => void;
  required?: boolean;
  showMap?: boolean;
  disabled?: boolean;
  label?: string;
  helperText?: string;
}

const LocationContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const MapPreview = styled(Box)(({ theme }) => ({
  height: 200,
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(2),
}));

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onError,
  required = true,
  showMap = true,
  disabled = false,
  label = 'Location',
  helperText
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const form = useLocationValidation({
    address: value?.address || '',
    city: value?.city || '',
    state: value?.state || '',
    pinCode: value?.pinCode || '',
    coordinates: value?.coordinates
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = form;

  const watchedValues = watch();

  // Update parent component when form values change
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data && Object.values(data).some(val => val !== '')) {
        onChange(data as LocationFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  // Update error state
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const errorMessage = hasErrors ? Object.values(errors)[0]?.message || 'Invalid location data' : null;
    setLocationError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
  }, [errors, onError]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }
    
    // Check if we're in a secure context (HTTPS) - required for geolocation on modern browsers
    if (window.isSecureContext === false) {
      setLocationError('Geolocation requires a secure context (HTTPS). Please use HTTPS to access this site.');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        setValue('coordinates', { lat: latitude, lng: longitude });
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. ' + getLocationPermissionInstructions();
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again later.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please check your internet connection and try again.';
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for mobile devices
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const clearLocation = () => {
    reset();
    setCoordinates(null);
    setLocationError(null);
    onChange({
      address: '',
      city: '',
      state: '',
      pinCode: '',
      coordinates: undefined
    });
  };

  const formatPinCode = (value: string) => {
    // Remove non-numeric characters and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    return numericValue;
  };

  return (
    <LocationContainer>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {label}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Use current location">
              <IconButton
                onClick={getCurrentLocation}
                disabled={disabled || isGettingLocation}
                size="small"
              >
                {isGettingLocation ? (
                  <CircularProgress size={20} />
                ) : (
                  <MyLocation />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear location">
              <IconButton
                onClick={clearLocation}
                disabled={disabled}
                size="small"
              >
                <Clear />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Error Alert */}
        {locationError && (
          <Alert severity="error" sx={{ fontSize: '0.875rem' }}>
            {locationError}
          </Alert>
        )}

        {/* Address Field */}
        <TextField
          {...register('address')}
          label="Address"
          placeholder="Enter full address"
          fullWidth
          required={required}
          disabled={disabled}
          error={!!errors.address}
          helperText={errors.address?.message || 'Enter the complete address'}
          InputProps={{
            startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />

        {/* City and State */}
        <Stack direction="row" spacing={2}>
          <TextField
            {...register('city')}
            label="City"
            placeholder="Enter city"
            fullWidth
            required={required}
            disabled={disabled}
            error={!!errors.city}
            helperText={errors.city?.message}
          />
          <TextField
            {...register('state')}
            label="State"
            placeholder="Enter state"
            fullWidth
            required={required}
            disabled={disabled}
            error={!!errors.state}
            helperText={errors.state?.message}
          />
        </Stack>

        {/* PIN Code */}
        <TextField
          {...register('pinCode')}
          label="PIN Code"
          placeholder="Enter 6-digit PIN code"
          fullWidth
          required={required}
          disabled={disabled}
          error={!!errors.pinCode}
          helperText={errors.pinCode?.message || 'Enter 6-digit postal code'}
          inputProps={{
            maxLength: 6,
            inputMode: 'numeric'
          }}
          onChange={(e) => {
            const formattedValue = formatPinCode(e.target.value);
            setValue('pinCode', formattedValue);
          }}
        />

        {/* Coordinates Display */}
        {coordinates && (
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Coordinates:
            </Typography>
            <Chip
              label={`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
        )}

        {/* Map Preview */}
        {showMap && (watchedValues.address || coordinates) && (
          <MapPreview>
            <Stack alignItems="center" spacing={1}>
              <Map sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Map preview would be shown here
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Map integration coming soon)
              </Typography>
            </Stack>
          </MapPreview>
        )}

        {/* Helper Text */}
        {helperText && (
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        )}
      </Stack>
    </LocationContainer>
  );
};