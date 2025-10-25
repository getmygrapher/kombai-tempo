import React, { useState } from 'react';
import { 
  Container,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ContributionStep,
  ContributionFormData,
  EXIFData,
  ContributionSubmission,
  ModerationStatus,
  LocationType
} from '../../types/community';
import { formatContributionStep } from '../../utils/communityFormatters';
import { useCommunityStore } from '../../store/communityStore';
import { communityService } from '../../services/communityService';
import { ContributionUploadStep } from '../../components/community/contribute/ContributionUploadStep';
import { EXIFReviewStep } from '../../components/community/contribute/EXIFReviewStep';
import { PoseDetailsStep } from '../../components/community/contribute/PoseDetailsStep';
import { ReviewSubmitStep } from '../../components/community/contribute/ReviewSubmitStep';
import communityTheme from '../../theme/communityTheme';

interface ContributionWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  minHeight: '100vh',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: communityTheme.layout.cardBorderRadius,
  marginTop: theme.spacing(3),
}));

const steps = [
  ContributionStep.UPLOAD,
  ContributionStep.EXIF_REVIEW,
  ContributionStep.POSE_DETAILS,
  ContributionStep.REVIEW_SUBMIT
];

export const ContributionWizard: React.FC<ContributionWizardProps> = ({
  onComplete,
  // onCancel intentionally unused for now
}) => {
  const {
    contributionDraft,
    contributionStep,
    updateContributionDraft,
    setContributionStep,
    clearContributionDraft,
    // Moderation queue wiring
    moderationQueue,
    setModerationQueue,
  } = useCommunityStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const currentStepIndex = steps.indexOf(contributionStep);

  const handleFileSelect = (file: File | null) => {
    updateContributionDraft({ image: file });
  };

  const handleExifUpdate = (exifData: EXIFData) => {
    updateContributionDraft({ exifData });
  };

  const handleFormUpdate = (formData: Partial<ContributionFormData>) => {
    updateContributionDraft({ 
      formData: { ...contributionDraft.formData, ...formData }
    });
  };

  const handleNext = () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setContributionStep(steps[nextStepIndex]);
  };

  const handleBack = () => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    setContributionStep(steps[prevStepIndex]);
  };

  const handleSubmit = async () => {
    if (!contributionDraft.image || !contributionDraft.exifData) {
      setSubmitError('Missing required data');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submissionPayload: ContributionSubmission = {
        pose: {
          photographer_id: 'current-user',
          portfolio_image_id: 'temp-id',
          title: contributionDraft.formData.title,
          posing_tips: contributionDraft.formData.posing_tips,
          difficulty_level: contributionDraft.formData.difficulty_level,
          people_count: contributionDraft.formData.people_count,
          category: contributionDraft.formData.category,
          mood_emotion: contributionDraft.formData.mood_emotion,
          image_url: URL.createObjectURL(contributionDraft.image),
          camera_model: contributionDraft.exifData.camera_model,
          lens_model: contributionDraft.exifData.lens_model,
          focal_length: contributionDraft.exifData.focal_length,
          aperture: contributionDraft.exifData.aperture,
          shutter_speed: contributionDraft.exifData.shutter_speed,
          iso_setting: contributionDraft.exifData.iso_setting,
          flash_used: contributionDraft.exifData.flash_used,
          exif_extraction_success: contributionDraft.exifData.extraction_success,
          manual_override: !contributionDraft.exifData.extraction_success,
          additional_equipment: contributionDraft.formData.additional_equipment,
          lighting_setup: contributionDraft.formData.lighting_setup,
          // For mock/demo, map category to a default location type
          location_type: LocationType.OUTDOOR,
          story_behind: contributionDraft.formData.story_behind,
          photographer: {
            id: 'current-user',
            name: 'Current User',
            profile_photo: 'https://i.pravatar.cc/150?img=10',
            location: 'Mumbai, India',
            is_verified: false,
            rating: 0,
            total_reviews: 0
          }
        },
        status: ModerationStatus.PENDING
      };

      // Submit via service (mocked) and mirror into global moderation queue
      const submitted = await communityService.submitContribution(submissionPayload);
      setSubmitSuccess(true);

      // Update global moderation queue so it appears immediately in ModerationDashboard
      setModerationQueue([submitted, ...moderationQueue]);
      
      // Clear draft after successful submission
      setTimeout(() => {
        clearContributionDraft();
        onComplete();
      }, 3000);
      
    } catch {
      setSubmitError('Failed to submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (contributionStep) {
      case ContributionStep.UPLOAD:
        return (
          <ContributionUploadStep
            selectedFile={contributionDraft.image}
            onFileSelect={handleFileSelect}
            onNext={handleNext}
          />
        );
      
      case ContributionStep.EXIF_REVIEW:
        if (!contributionDraft.image) return null;
        return (
          <EXIFReviewStep
            selectedFile={contributionDraft.image}
            exifData={contributionDraft.exifData}
            onExifUpdate={handleExifUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case ContributionStep.POSE_DETAILS:
        return (
          <PoseDetailsStep
            formData={contributionDraft.formData}
            onFormUpdate={handleFormUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      
      case ContributionStep.REVIEW_SUBMIT:
        if (!contributionDraft.image || !contributionDraft.exifData) return null;
        return (
          <ReviewSubmitStep
            selectedFile={contributionDraft.image}
            exifData={contributionDraft.exifData}
            formData={contributionDraft.formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting as any}
            submitError={submitError}
            submitSuccess={submitSuccess}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <StyledContainer>
      <Stepper activeStep={currentStepIndex} alternativeLabel>
        {steps.map((step) => (
          <Step key={step}>
            <StepLabel>{formatContributionStep(step)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <StyledPaper>
        {renderStepContent()}
      </StyledPaper>
    </StyledContainer>
  );
};