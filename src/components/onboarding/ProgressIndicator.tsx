import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { OnboardingStep } from '../../types/onboarding';
import { calculateProgress, formatStepNumber } from '../../utils/onboardingFormatters';

interface ProgressIndicatorProps {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  variant?: 'linear' | 'stepper';
  showStepNumber?: boolean;
}

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
  },
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  '& .MuiStepLabel-root .Mui-completed': {
    color: theme.palette.success.main,
  },
  '& .MuiStepLabel-root .Mui-active': {
    color: theme.palette.primary.main,
  },
}));

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  completedSteps,
  variant = 'linear',
  showStepNumber = true,
}) => {
  const progress = calculateProgress(currentStep);
  const stepNumber = formatStepNumber(currentStep);

  const steps = [
    { step: OnboardingStep.WELCOME, label: 'Welcome' },
    { step: OnboardingStep.AUTHENTICATION, label: 'Authentication' },
    { step: OnboardingStep.CATEGORY_SELECTION, label: 'Category' },
    { step: OnboardingStep.TYPE_SELECTION, label: 'Type' },
    { step: OnboardingStep.LOCATION_SETUP, label: 'Location' },
    { step: OnboardingStep.BASIC_PROFILE, label: 'Profile' },
    { step: OnboardingStep.PROFESSIONAL_DETAILS, label: 'Details' },
    { step: OnboardingStep.AVAILABILITY_SETUP, label: 'Availability' },
    { step: OnboardingStep.REGISTRATION_COMPLETE, label: 'Complete' },
  ];

  if (variant === 'stepper') {
    const activeStep = steps.findIndex(s => s.step === currentStep);
    
    return (
      <StepperContainer>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.slice(0, -1).map((stepInfo) => (
            <Step 
              key={stepInfo.step}
              completed={completedSteps.includes(stepInfo.step)}
            >
              <StepLabel>{stepInfo.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </StepperContainer>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {showStepNumber && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Step {stepNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress}% Complete
          </Typography>
        </Box>
      )}
      <StyledLinearProgress
        variant="determinate"
        value={progress}
      />
    </Box>
  );
};