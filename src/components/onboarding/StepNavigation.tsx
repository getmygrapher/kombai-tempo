import React from 'react';
import {
  Box,
  Button,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface StepNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  canProceed?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isLoading?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  nextVariant?: 'contained' | 'outlined' | 'text';
  backVariant?: 'contained' | 'outlined' | 'text';
}

const NavigationContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  marginTop: theme.spacing(4),
  zIndex: 1
}));

const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: 120,
  padding: theme.spacing(1.5, 3),
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 1.5 : 12
}));

const NextButton = styled(StyledButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  boxShadow: theme.shadows[2],
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    boxShadow: theme.shadows[4],
    transform: 'translateY(-1px)'
  },
  '&:disabled': {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
    boxShadow: 'none',
    transform: 'none'
  }
}));

const BackButton = styled(StyledButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  borderColor: theme.palette.divider,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.text.secondary
  }
}));

export const StepNavigation = React.forwardRef<HTMLDivElement, StepNavigationProps>(({
  onBack,
  onNext,
  canProceed = true,
  nextLabel = 'Next',
  backLabel = 'Back',
  isLoading = false,
  showBack = true,
  showNext = true,
  nextVariant = 'contained',
  backVariant = 'outlined'
}, ref) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleBack = () => {
    if (onBack && !isLoading) {
      onBack();
    }
  };

  const handleNext = () => {
    if (onNext && canProceed && !isLoading) {
      onNext();
    }
  };

  return (
    <NavigationContainer ref={ref}>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center"
        spacing={2}
      >
        {/* Back Button */}
        {showBack ? (
          <BackButton
            variant={backVariant}
            onClick={handleBack}
            disabled={isLoading}
            startIcon={<ArrowBackIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
            {backLabel}
          </BackButton>
        ) : (
          <Box /> // Spacer
        )}

        {/* Next Button */}
        {showNext && (
          <NextButton
            variant={nextVariant}
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            endIcon={isLoading ? null : <ArrowForwardIcon />}
            size={isMobile ? 'medium' : 'large'}
          >
            {isLoading ? 'Loading...' : nextLabel}
          </NextButton>
        )}
      </Stack>
    </NavigationContainer>
  );
});

StepNavigation.displayName = 'StepNavigation';