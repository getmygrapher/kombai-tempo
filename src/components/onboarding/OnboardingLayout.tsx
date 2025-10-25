import React from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { OnboardingStep } from '../../types/onboarding';
import { ProgressIndicator } from './ProgressIndicator';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  showProgress?: boolean;
  onExit?: () => void;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: 'calc(100vh - 120px)',
  display: 'flex',
  alignItems: 'center',
}));

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  completedSteps,
  showProgress = true,
  onExit,
}) => {
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleExitConfirm = () => {
    setShowExitDialog(false);
    onExit?.();
  };

  const handleExitCancel = () => {
    setShowExitDialog(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <span className="text-gradient">GetMyGrapher</span>
          </Typography>
          {onExit && (
            <IconButton
              color="inherit"
              onClick={handleExitClick}
              aria-label="exit registration"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Toolbar>
      </StyledAppBar>

      {/* Progress Indicator */}
      {showProgress && (
        <Box sx={{ px: 3, py: 2 }}>
          <ProgressIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </Box>
      )}

      {/* Main Content */}
      <ContentContainer maxWidth="lg">
        <Box sx={{ width: '100%' }}>
          {children}
        </Box>
      </ContentContainer>

      {/* Exit Confirmation Dialog */}
      <Dialog
        open={showExitDialog}
        onClose={handleExitCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Exit Registration
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to exit the registration process? 
            Your progress will be saved and you can continue later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExitCancel}>
            Continue Registration
          </Button>
          <Button 
            onClick={handleExitConfirm} 
            color="error"
            variant="contained"
          >
            Yes, Exit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};