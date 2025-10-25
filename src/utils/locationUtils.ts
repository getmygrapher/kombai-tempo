import { Coordinates } from '../types';

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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
 * Sort jobs by distance from a given location
 * @param jobs Array of jobs with location data
 * @param userLocation User's current location
 * @returns Sorted array of jobs by distance
 */
export const sortJobsByDistance = <T extends { location: { coordinates: Coordinates } }>(
  jobs: T[],
  userLocation: Coordinates
): T[] => {
  return jobs
    .map(job => ({
      ...job,
      distance: calculateDistance(userLocation, job.location.coordinates)
    }))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

/**
 * Filter jobs within a certain radius
 * @param jobs Array of jobs with location data
 * @param userLocation User's current location
 * @param radiusKm Radius in kilometers
 * @returns Filtered array of jobs within radius
 */
export const filterJobsByRadius = <T extends { location: { coordinates: Coordinates } }>(
  jobs: T[],
  userLocation: Coordinates,
  radiusKm: number
): T[] => {
  return jobs.filter(job => {
    const distance = calculateDistance(userLocation, job.location.coordinates);
    return distance <= radiusKm;
  });
};

/**
 * Detect if the user is on a mobile device
 * @returns Boolean indicating if user is on mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get platform-specific location permission instructions
 * @returns String with instructions for the user's platform
 */
export const getLocationPermissionInstructions = (): string => {
  if (!isMobileDevice()) {
    return 'Please check your browser settings and ensure location access is enabled for this site.';
  }
  
  // Mobile device instructions
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return 'On iOS devices, go to Settings > Privacy > Location Services, enable Location Services, and ensure your browser is allowed to access your location.';
  } else if (/Android/i.test(navigator.userAgent)) {
    return 'On Android devices, go to Settings > Location and ensure location services are turned on. Then check your browser settings to allow location access.';
  } else {
    return 'On mobile devices, you may need to enable location services in your device settings and grant permission to your browser.';
  }
};

/**
 * Get user's current location using geolocation API
 * @returns Promise with coordinates or null if failed
 */
export const getCurrentLocation = (): Promise<Coordinates | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    
    // Check if we're in a secure context (HTTPS) - required for geolocation on modern browsers
    if (window.isSecureContext === false) {
      console.warn('Geolocation requires a secure context (HTTPS)');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout for mobile devices
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Validate Indian PIN code format
 * @param pinCode PIN code to validate
 * @returns True if valid Indian PIN code
 */
export const isValidIndianPinCode = (pinCode: string): boolean => {
  return /^\d{6}$/.test(pinCode);
};

/**
 * Get distance radius options for filtering
 */
export const getDistanceRadiusOptions = () => [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: 500, label: '500 km' }
];

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

/**
 * Get default location (Kochi, Kerala)
 */
export const getDefaultLocation = (): Coordinates => ({
  lat: 9.9312,
  lng: 76.2673
});