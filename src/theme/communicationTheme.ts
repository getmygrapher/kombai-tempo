// Communication system theme extensions
import { createTheme } from '@mui/material/styles';

// Enhanced theme with communication-specific tokens
const communicationTheme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Blue for professional communication
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#10b981', // Green for online status and success states
      light: '#34d399', 
      dark: '#059669',
      contrastText: '#ffffff'
    },
    success: {
      main: '#10b981', // Green for delivered/read messages
      light: '#6ee7b7',
      dark: '#047857'
    },
    warning: {
      main: '#f59e0b', // Orange for pending/unread states
      light: '#fbbf24',
      dark: '#d97706'
    },
    error: {
      main: '#ef4444', // Red for failed messages and errors
      light: '#f87171',
      dark: '#dc2626'
    },
    info: {
      main: '#3b82f6', // Blue for information states
      light: '#93c5fd',
      dark: '#2563eb'
    },
    text: {
      primary: '#111827', // Dark gray for primary text
      secondary: '#6b7280', // Medium gray for secondary text
      disabled: '#9ca3af' // Light gray for disabled text
    },
    background: {
      default: '#f9fafb', // Very light gray background
      paper: '#ffffff' // White for message bubbles and cards
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.4
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#9ca3af'
    }
  },
  shape: {
    borderRadius: 12 // Rounded corners for modern look
  },
  spacing: 8, // Base spacing unit
  components: {
    // Message bubble specific styling
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.message-bubble': {
            maxWidth: '70%',
            padding: '12px 16px',
            borderRadius: '18px',
            '&.sent': {
              backgroundColor: '#2563eb',
              color: '#ffffff',
              marginLeft: 'auto',
              borderBottomRightRadius: '6px'
            },
            '&.received': {
              backgroundColor: '#f3f4f6',
              color: '#111827',
              marginRight: 'auto', 
              borderBottomLeftRadius: '6px'
            }
          }
        }
      }
    },
    // Chat input styling
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.chat-input': {
            borderRadius: '24px',
            backgroundColor: '#f9fafb',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e5e7eb'
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#d1d5db'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2563eb'
            }
          }
        }
      }
    },
    // Badge styling for unread counts
    MuiBadge: {
      styleOverrides: {
        badge: {
          '&.unread-badge': {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.75rem'
          }
        }
      }
    }
  }
});

export default communicationTheme;