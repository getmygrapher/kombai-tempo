import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { 
  ContributionFormData, 
  EXIFData 
} from '../../../types/community';
import { 
  formatDifficultyLevel, 
  formatPoseCategory,
  formatEquipmentList,
  formatFileSize
} from '../../../utils/communityFormatters';
import { DifficultyBadge } from '../DifficultyBadge';
import communityTheme from '../../../theme/communityTheme';

interface ReviewSubmitStepProps {
  selectedFile: File;
  exifData: EXIFData;
  formData: ContributionFormData;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
  submitError?: string;
  submitSuccess?: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: communityTheme.layout.cardBorderRadius,
}));

const PreviewImage = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: 300,
  borderRadius: communityTheme.layout.cardBorderRadius,
  objectFit: 'cover',
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 0),
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: communityTheme.community.primary.background,
  color: communityTheme.community.primary.main,
  borderRadius: communityTheme.layout.chipBorderRadius,
}));

export const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
  selectedFile,
  exifData,
  formData,
  onSubmit,
  onBack,
  isSubmitting = false,
  submitError,
  submitSuccess = false
}) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async () => {
    setHasSubmitted(true);
    try {
      await onSubmit();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  if (submitSuccess) {
    return (
      <Stack spacing={3} alignItems="center" textAlign="center">
        <CheckCircleOutlinedIcon 
          sx={{ fontSize: 80, color: 'success.main' }} 
        />
        
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Submission Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your pose has been submitted for review. You'll be notified once it's approved and published to the community library.
          </Typography>
        </Box>

        <Alert severity="info" sx={{ maxWidth: 500 }}>
          <Typography variant="body2">
            <strong>What happens next?</strong><br />
            • Our moderation team will review your submission<br />
            • You'll receive a notification about the approval status<br />
            • Approved poses appear in the community library within 24 hours
          </Typography>
        </Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Review & Submit
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please review your submission before publishing to the community
        </Typography>
      </Box>

      {submitError && (
        <Alert severity="error">{submitError}</Alert>
      )}

      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Image Preview
          </Typography>
          
          <Stack spacing={2}>
            <PreviewImage
              src={URL.createObjectURL(selectedFile)}
              alt="Pose preview"
            />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                File: {selectedFile.name}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Size: {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="h5" fontWeight={700} flex={1}>
                {formData.title}
              </Typography>
              <CategoryChip 
                label={formatPoseCategory(formData.category)} 
                size="small" 
              />
              <DifficultyBadge level={formData.difficulty_level} />
            </Stack>

            <Divider />

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                📝 Posing Tips
              </Typography>
              <Typography variant="body1" lineHeight={1.6}>
                {formData.posing_tips}
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Details
              </Typography>
              
              <Stack spacing={1}>
                <InfoRow>
                  <Typography variant="body2" color="text.secondary">
                    People Count:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formData.people_count}
                  </Typography>
                </InfoRow>

                {formData.mood_emotion && (
                  <InfoRow>
                    <Typography variant="body2" color="text.secondary">
                      Mood/Emotion:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formData.mood_emotion}
                    </Typography>
                  </InfoRow>
                )}

                {formData.additional_equipment.length > 0 && (
                  <InfoRow>
                    <Typography variant="body2" color="text.secondary">
                      Equipment:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatEquipmentList(formData.additional_equipment)}
                    </Typography>
                  </InfoRow>
                )}

                {formData.lighting_setup && (
                  <InfoRow>
                    <Typography variant="body2" color="text.secondary">
                      Lighting:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formData.lighting_setup}
                    </Typography>
                  </InfoRow>
                )}
              </Stack>
            </Box>

            {formData.story_behind && (
              <>
                <Divider />
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    📖 Story Behind
                  </Typography>
                  <Typography variant="body1" lineHeight={1.6}>
                    {formData.story_behind}
                  </Typography>
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📸 Camera Settings
          </Typography>
          
          <Stack spacing={1}>
            {exifData.camera_model && (
              <InfoRow>
                <Typography variant="body2" color="text.secondary">
                  Camera:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {exifData.camera_model}
                </Typography>
              </InfoRow>
            )}

            {exifData.lens_model && (
              <InfoRow>
                <Typography variant="body2" color="text.secondary">
                  Lens:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {exifData.lens_model}
                </Typography>
              </InfoRow>
            )}

            {exifData.aperture && (
              <InfoRow>
                <Typography variant="body2" color="text.secondary">
                  Aperture:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  f/{exifData.aperture}
                </Typography>
              </InfoRow>
            )}

            {exifData.shutter_speed && (
              <InfoRow>
                <Typography variant="body2" color="text.secondary">
                  Shutter Speed:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {exifData.shutter_speed}
                </Typography>
              </InfoRow>
            )}

            {exifData.iso_setting && (
              <InfoRow>
                <Typography variant="body2" color="text.secondary">
                  ISO:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {exifData.iso_setting}
                </Typography>
              </InfoRow>
            )}
          </Stack>
        </CardContent>
      </StyledCard>

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={isSubmitting as any}
          sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={(isSubmitting || hasSubmitted) as any}
          sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Submitting...
            </>
          ) : (
            'Submit for Review'
          )}
        </Button>
      </Stack>
    </Stack>
  );
};