import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Stack,
  IconButton,
  Typography,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { useJobPostingStore } from '../../store/jobPostingStore';
import { useCreateJob } from '../../hooks/useJobs';
import { Job } from '../../types';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { ScheduleLocationStep } from './steps/ScheduleLocationStep';
import { BudgetRequirementsStep } from './steps/BudgetRequirementsStep';
import { ReviewPublishStep } from './steps/ReviewPublishStep';

interface JobCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (job: Job) => void;
  fullScreen?: boolean;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '800px',
    width: '100%',
    margin: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      maxHeight: 'calc(100vh - 16px)'
    }
  }
}));

const steps = [
  'Basic Information',
  'Schedule & Location', 
  'Budget & Requirements',
  'Review & Publish'
];

export const JobCreationWizard: React.FC<JobCreationWizardProps> = ({
  open,
  onClose,
  onComplete,
  fullScreen = false
}) => {
  const {
    currentJob,
    step,
    isSubmitting,
    errors,
    setJobData,
    nextStep,
    prevStep,
    setStep,
    submitJob,
    resetForm,
    setErrors,
    clearErrors,
    setSubmitting
  } = useJobPostingStore();

  const createJobMutation = useCreateJob();
  
  const handleNext = () => {
    if (step < steps.length) {
      nextStep();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      prevStep();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleJobDataChange = (data: Partial<Job>) => {
    setJobData(data);
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const [stepValidation, setStepValidation] = React.useState<Record<number, boolean>>({});

  const handleStepValidationChange = (stepNumber: number, isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [stepNumber]: isValid }));
  };

  const handleSubmit = async () => {
    if (!currentJob) return;
    
    setSubmitting(true);
    try {
      const result = await submitJob();
      if (result.success && onComplete && result.job) {
        onComplete(result.job);
      }
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Failed to create job. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return (
          <BasicInfoStep
            jobData={currentJob}
            errors={errors}
            onChange={handleJobDataChange}
            onValidationChange={(isValid) => handleStepValidationChange(1, isValid)}
          />
        );
      case 2:
        return (
          <ScheduleLocationStep
            jobData={currentJob}
            errors={errors}
            onChange={handleJobDataChange}
            onValidationChange={(isValid) => handleStepValidationChange(2, isValid)}
          />
        );
      case 3:
        return (
          <BudgetRequirementsStep
            jobData={currentJob}
            errors={errors}
            onChange={handleJobDataChange}
            onValidationChange={(isValid) => handleStepValidationChange(3, isValid)}
          />
        );
      case 4:
        return (
          <ReviewPublishStep
            jobData={currentJob}
            onEdit={(stepNumber) => setStep(stepNumber)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth={fullScreen ? false : "md"}
      fullWidth={!fullScreen}
      fullScreen={fullScreen}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Post New Job
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={4}>
          {/* Stepper */}
          <Stepper activeStep={step - 1} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {errors.submit && (
            <Alert severity="error" onClose={() => clearErrors()}>
              {errors.submit}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(step)}
          </Box>

          {/* Navigation Buttons */}
          <Stack direction="row" justifyContent="space-between" sx={{ pt: 2 }}>
            <Button
              onClick={handleBack}
              disabled={step === 1}
              variant="outlined"
            >
              Back
            </Button>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={handleClose}
              >
                Save as Draft
              </Button>
              
              {step < steps.length ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!stepValidation[step]}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Job'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </StyledDialog>
  );
};