import { DistanceRadius } from '../types/enums';
import { Coordinates } from '../types';

export interface LocationPermissionResult {
  granted: boolean;
  error?: string;
}

export interface GeolocationResult {
  coordinates: Coordinates;
  accuracy: number;
}

export interface AddressComponents {
  city: string;
  state: string;
  pinCode: string;
  formattedAddress: string;
}

/**
 * Request geolocation permission and get current position
 */
export const getCurrentPosition = (): Promise<GeolocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    // Check if we're in a secure context (HTTPS) - required for geolocation on modern browsers
    if (window.isSecureContext === false) {
      reject(new Error('Geolocation requires a secure context (HTTPS)'));
      return;
    }

    const attemptGet = (opts: PositionOptions) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          // If position unavailable or timeout, try a more relaxed second attempt
          if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
            const fallbackOpts: PositionOptions = {
              enableHighAccuracy: false,
              timeout: 20000,
              maximumAge: 600000 // 10 minutes
            };
            // Only retry if we haven't already relaxed options
            if (opts.enableHighAccuracy) {
              attemptGet(fallbackOpts);
              return;
            }
          }

          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please check your browser settings and ensure location access is enabled.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Ensure location services are ON and try again.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Check connectivity and try again.';
              break;
          }
          reject(new Error(errorMessage));
        },
        opts
      );
    };

    // First attempt: high accuracy
    attemptGet({ enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  });
};

/**
 * Check if geolocation is supported and get permission status
 */
export const checkLocationPermission = async (): Promise<LocationPermissionResult> => {
  if (!navigator.geolocation) {
    return { granted: false, error: 'Geolocation not supported' };
  }

  // Check if we're in a secure context (HTTPS) - required for geolocation on modern browsers
  if (window.isSecureContext === false) {
    return { granted: false, error: 'Geolocation requires a secure context (HTTPS)' };
  }

  // Check if permissions API is available
  if ('permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      if (permission.state === 'prompt') {
        return { granted: false, error: 'Location permission needs to be requested' };
      }
      
      return { granted: permission.state === 'granted' };
    } catch (error) {
      console.warn('Permissions API not available:', error);
    }
  }

  // Fallback: assume permission needs to be requested
  return { granted: false };
};

/**
 * Reverse geocoding - get address from coordinates
 * In a real implementation, this would use Google Maps Geocoding API
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<AddressComponents> => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock address data based on coordinates
    const mockAddresses: Record<string, AddressComponents> = {
      'mumbai': {
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
        formattedAddress: 'Mumbai, Maharashtra 400001, India'
      },
      'delhi': {
        city: 'New Delhi',
        state: 'Delhi',
        pinCode: '110001',
        formattedAddress: 'New Delhi, Delhi 110001, India'
      },
      'bangalore': {
        city: 'Bangalore',
        state: 'Karnataka',
        pinCode: '560001',
        formattedAddress: 'Bangalore, Karnataka 560001, India'
      }
    };

    // Simple logic to determine city based on coordinates
    let selectedCity = 'mumbai';
    if (coordinates.lat > 28 && coordinates.lat < 29) {
      selectedCity = 'delhi';
    } else if (coordinates.lat > 12 && coordinates.lat < 13) {
      selectedCity = 'bangalore';
    }

    return mockAddresses[selectedCity];
  } catch (error) {
    throw new Error('Failed to get address from coordinates');
  }
};

/**
 * Get distance radius options
 */
export const getDistanceRadiusOptions = () => [
  { value: DistanceRadius.FIVE_KM, label: '5 km' },
  { value: DistanceRadius.TEN_KM, label: '10 km' },
  { value: DistanceRadius.TWENTY_FIVE_KM, label: '25 km' },
  { value: DistanceRadius.FIFTY_KM, label: '50 km' },
  { value: DistanceRadius.HUNDRED_PLUS_KM, label: '100+ km' }
];

/**
 * Get Indian states list
 */
export const getIndianStates = () => [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};