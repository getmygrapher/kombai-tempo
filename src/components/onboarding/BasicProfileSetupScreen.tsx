import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Card,
  CardContent,
  Avatar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Fade,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { Gender } from '../../types/enums';
import { OnboardingStep } from '../../types/onboarding';
import { 
  validateFullName, 
  validateMobileNumber, 
  validateImageFile 
} from '../../utils/registrationValidation';
import { 
  createImagePreview, 
  uploadImage, 
  formatFileSize 
} from '../../utils/fileUploadUtils';
import { analyticsService } from '../../utils/analyticsEvents';
import { StepNavigation } from './StepNavigation';

interface BasicProfileData {
  fullName: string;
  profilePhoto: File | null;
  profilePhotoUrl: string;
  primaryMobile: string;
  alternateMobile: string;
  gender: Gender | null;
  about: string;
}

interface BasicProfileSetupScreenProps {
  profileData: BasicProfileData;
  onProfileUpdate: (data: Partial<BasicProfileData>) => void;
  onPhotoUpload: (file: File) => void;
  uploadProgress: number;
  onNext: () => void;
  onBack: () => void;
}

const ProfilePhotoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(2)
}));

const PhotoUploadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  width: 40,
  height: 40,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  }
}));

const HiddenInput = styled('input')({
  display: 'none'
});

export const BasicProfileSetupScreen: React.FC<BasicProfileSetupScreenProps> = ({
  profileData,
  onProfileUpdate,
  onPhotoUpload,
  uploadProgress,
  onNext,
  onBack
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(profileData.profilePhotoUrl);

  useEffect(() => {
    analyticsService.trackStepViewed(OnboardingStep.BASIC_PROFILE);
  }, []);

  const handleFieldChange = (field: keyof BasicProfileData, value: any) => {
    onProfileUpdate({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePhotoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, profilePhoto: validation.error! }));
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const preview = await createImagePreview(file);
      setPreviewUrl(preview);
      
      // Upload file
      const uploadResult = await uploadImage(file, (progress) => {
        // Progress is handled by parent component
      });

      if (uploadResult.success && uploadResult.url) {
        onProfileUpdate({
          profilePhoto: file,
          profilePhotoUrl: uploadResult.url
        });
        
        analyticsService.trackPhotoUpload(true, file.size);
      } else {
        throw new Error(uploadResult.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      setErrors(prev => ({ ...prev, profilePhoto: errorMessage }));
      analyticsService.trackPhotoUpload(false, file.size, errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    onProfileUpdate({
      profilePhoto: null,
      profilePhotoUrl: ''
    });
    setPreviewUrl('');
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.profilePhoto;
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateFullName(profileData.fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.error!;
    }

    const mobileValidation = validateMobileNumber(profileData.primaryMobile);
    if (!mobileValidation.isValid) {
      newErrors.primaryMobile = mobileValidation.error!;
    }

    // Validate alternate mobile if provided
    if (profileData.alternateMobile) {
      const altMobileValidation = validateMobileNumber(profileData.alternateMobile);
      if (!altMobileValidation.isValid) {
        newErrors.alternateMobile = altMobileValidation.error!;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      analyticsService.trackStepCompleted(OnboardingStep.BASIC_PROFILE, {
        hasProfilePhoto: !!profileData.profilePhoto,
        hasGender: !!profileData.gender,
        hasAbout: !!profileData.about,
        hasAlternateMobile: !!profileData.alternateMobile
      });
      onNext();
    } else {
      Object.entries(errors).forEach(([field, error]) => {
        analyticsService.trackValidationError(OnboardingStep.BASIC_PROFILE, field, error);
      });
    }
  };

  const canProceed = profileData.fullName && profileData.primaryMobile && !isUploading;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box textAlign="center">
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              Set up your profile
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}
            >
              Add your basic information to help clients get to know you better
            </Typography>
          </Box>
        </Fade>

        {/* Profile Photo */}
        <Fade in timeout={800}>
          <Card>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Profile Photo
              </Typography>
              
              <ProfilePhotoContainer>
                <Avatar
                  src={previewUrl}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    fontSize: '3rem',
                    bgcolor: 'primary.light'
                  }}
                >
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'P'}
                </Avatar>
                
                <HiddenInput
                  accept="image/jpeg,image/jpg,image/png"
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoSelect}
                  disabled={isUploading as any}
                />
                <label htmlFor="photo-upload">
                  <PhotoUploadButton disabled={isUploading as any}>
                    <PhotoCameraIcon />
                  </PhotoUploadButton>
                </label>
                
                {previewUrl && (
                  <IconButton
                    onClick={handleRemovePhoto}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: 'error.main',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'error.dark'
                      }
                    }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </ProfilePhotoContainer>

              {isUploading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}

              {errors.profilePhoto && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.profilePhoto}
                </Alert>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                JPG or PNG, max 5MB
              </Typography>
            </CardContent>
          </Card>
        </Fade>

        {/* Basic Information */}
        <Fade in timeout={1000}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Basic Information
                </Typography>

                {/* Full Name */}
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  placeholder="Enter your full name"
                  required
                />

                {/* Primary Mobile */}
                <TextField
                  fullWidth
                  label="Primary Mobile Number"
                  value={profileData.primaryMobile}
                  onChange={(e) => handleFieldChange('primaryMobile', e.target.value)}
                  error={!!errors.primaryMobile}
                  helperText={errors.primaryMobile}
                  placeholder="+91 9876543210"
                  required
                />

                {/* Alternate Mobile */}
                <TextField
                  fullWidth
                  label="Alternate Mobile Number (Optional)"
                  value={profileData.alternateMobile}
                  onChange={(e) => handleFieldChange('alternateMobile', e.target.value)}
                  error={!!errors.alternateMobile}
                  helperText={errors.alternateMobile}
                  placeholder="+91 9876543210"
                />

                {/* Gender */}
                <FormControl fullWidth>
                  <InputLabel>Gender (Optional)</InputLabel>
                  <Select
                    value={profileData.gender || ''}
                    label="Gender (Optional)"
                    onChange={(e) => handleFieldChange('gender', e.target.value || null)}
                  >
                    <MenuItem value="">
                      <em>Prefer not to say</em>
                    </MenuItem>
                    {Object.values(Gender).map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {gender}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* About */}
                <TextField
                  fullWidth
                  label="About You (Optional)"
                  value={profileData.about}
                  onChange={(e) => handleFieldChange('about', e.target.value)}
                  placeholder="Tell clients a bit about yourself and your work..."
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${profileData.about.length}/500 characters`}
                />
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Navigation */}
        <Fade in timeout={1200}>
          <StepNavigation
            onBack={onBack}
            onNext={handleNext}
            canProceed={!!canProceed}
            isLoading={isUploading as any}
            nextLabel="Continue"
            backLabel="Back"
          />
        </Fade>
      </Stack>
    </Box>
  );
};