// Community Posing Library theme extensions
import { createTheme } from '@mui/material/styles';

const communityTheme = {
  // Community-specific color palette
  community: {
    primary: {
      main: '#6366F1', // Indigo for primary actions
      light: '#818CF8',
      dark: '#4338CA',
      background: '#EEF2FF'
    },
    secondary: {
      main: '#EC4899', // Pink for secondary actions
      light: '#F472B6', 
      dark: '#BE185D',
      background: '#FDF2F8'
    },
    success: {
      main: '#10B981', // Green for approved/verified
      light: '#34D399',
      dark: '#047857',
      background: '#ECFDF5'
    },
    warning: {
      main: '#F59E0B', // Amber for pending/review
      light: '#FCD34D',
      dark: '#D97706', 
      background: '#FFFBEB'
    },
    error: {
      main: '#EF4444', // Red for rejected/errors
      light: '#F87171',
      dark: '#DC2626',
      background: '#FEF2F2'
    }
  },
  
  // Difficulty level colors
  difficulty: {
    beginner: {
      main: '#10B981', // Green
      background: '#ECFDF5',
      text: '#047857'
    },
    intermediate: {
      main: '#F59E0B', // Amber
      background: '#FFFBEB',
      text: '#D97706'
    },
    advanced: {
      main: '#EF4444', // Red
      background: '#FEF2F2',
      text: '#DC2626'
    }
  },
  
  // Category colors
  categories: {
    portrait: '#8B5CF6', // Purple
    couple: '#EC4899',   // Pink
    family: '#10B981',   // Green
    wedding: '#F59E0B',  // Amber
    maternity: '#F472B6', // Light Pink
    commercial: '#3B82F6', // Blue
    group: '#6366F1',    // Indigo
    creative: '#8B5CF6', // Purple
    lifestyle: '#10B981', // Green
    fashion: '#EC4899'   // Pink
  },
  
  // Interaction colors
  interactions: {
    like: {
      active: '#EF4444', // Red heart
      inactive: '#9CA3AF'
    },
    save: {
      active: '#F59E0B', // Amber bookmark
      inactive: '#9CA3AF'
    },
    comment: {
      main: '#3B82F6', // Blue
      background: '#EFF6FF'
    },
    share: {
      main: '#6366F1', // Indigo
      background: '#EEF2FF'
    }
  },
  
  // Layout and spacing
  layout: {
    gridGap: 16,
    cardBorderRadius: 16,
    chipBorderRadius: 20,
    buttonBorderRadius: 12,
    bottomSheetBorderRadius: 24
  },
  
  // Animation and transitions
  animations: {
    cardHover: 'all 0.2s ease-in-out',
    buttonPress: 'all 0.1s ease-in-out',
    filterTransition: 'all 0.3s ease-in-out',
    likeAnimation: 'bounce 0.3s ease-in-out'
  }
};

export default communityTheme;