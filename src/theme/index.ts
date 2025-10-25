// Modern theme for GetMyGrapher platform with vibrant, professional colors

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366F1', // Modern indigo for primary actions
      light: '#818CF8',
      dark: '#4338CA',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#EC4899', // Vibrant pink for secondary actions
      light: '#F472B6',
      dark: '#BE185D',
      contrastText: '#FFFFFF'
    },
    success: {
      main: '#10B981', // Modern green for success states
      light: '#34D399',
      dark: '#047857',
      contrastText: '#FFFFFF'
    },
    warning: {
      main: '#F59E0B', // Warm amber for warnings
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#FFFFFF'
    },
    error: {
      main: '#EF4444', // Modern red for errors
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#FFFFFF'
    },
    info: {
      main: '#3B82F6', // Bright blue for info
      light: '#60A5FA',
      dark: '#1D4ED8',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FAFAFA', // Light gray background
      paper: '#FFFFFF'
    },
    text: {
      primary: '#111827', // Dark gray for primary text
      secondary: '#6B7280', // Medium gray for secondary text
      disabled: '#9CA3AF'
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    },
    divider: '#E5E7EB'
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none'
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.1em'
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)'
  ]
});

// Enhanced theme for availability management system
const availabilityTheme = {
  // Availability status colors
  availability: {
    available: {
      main: '#10B981', // Green for available
      light: '#34D399',
      dark: '#047857',
      background: '#ECFDF5'
    },
    partiallyAvailable: {
      main: '#F59E0B', // Amber for partially available
      light: '#FCD34D', 
      dark: '#D97706',
      background: '#FFFBEB'
    },
    unavailable: {
      main: '#EF4444', // Red for unavailable
      light: '#F87171',
      dark: '#DC2626', 
      background: '#FEF2F2'
    },
    booked: {
      main: '#3B82F6', // Blue for booked
      light: '#60A5FA',
      dark: '#1D4ED8',
      background: '#EFF6FF'
    }
  },
  
  // Calendar specific styling
  calendar: {
    cellSize: 60,
    cellBorderRadius: 8,
    headerHeight: 48,
    timeSlotHeight: 40,
    gridGap: 8
  },
  
  // Pattern and conflict colors
  patterns: {
    active: '#6366F1',
    inactive: '#9CA3AF',
    conflict: '#DC2626',
    resolved: '#059669'
  }
};

export default theme;
export { availabilityTheme };