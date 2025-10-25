import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Avatar,
  IconButton,
  Alert,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { 
  User, 
  ProfileFormData, 
  ProfessionalCategory, 
  ExperienceLevel, 
  Gender,
  PricingType 
} from '../../types';
import { 
  mockProfessionalTypes, 
  mockSpecializations, 
  mockCities, 
  mockStates
} from '../../data/profileManagementMockData';
import { formatPhoneNumber } from '../../utils/onboardingFormatters';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const PhotoUploadBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  border: `2px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.borderRadius,
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '05',
  }
}));

interface ProfileEditFormProps {
  user: User;
  onSave: (data: ProfileFormData) => void;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  user,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    basicInfo: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      alternatePhone: user.alternatePhone,
      gender: user.gender,
      profilePhoto: user.profilePhoto,
    },
    location: {
      city: user.location.city,
      state: user.location.state,
      pinCode: user.location.pinCode,
      address: user.location.address,
      preferredWorkLocations: user.preferredWorkLocations || [],
    },
    professional: {
      category: user.professionalCategory,
      type: user.professionalType,
      specializations: user.specializations || [],
      experience: user.experience,
      about: user.about,
      instagramHandle: user.instagramHandle,
    },
    equipment: [],
    pricing: user.pricing,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic info validation
    if (!formData.basicInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.basicInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.basicInfo.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.basicInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+91\d{10}$/.test(formatPhoneNumber(formData.basicInfo.phone))) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Location validation
    if (!formData.location.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.location.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Professional validation
    if (!formData.professional.type.trim()) {
      newErrors.professionalType = 'Professional type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (section: keyof ProfileFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Format phone number before saving
      const formattedData = {
        ...formData,
        basicInfo: {
          ...formData.basicInfo,
          phone: formatPhoneNumber(formData.basicInfo.phone),
          alternatePhone: formData.basicInfo.alternatePhone 
            ? formatPhoneNumber(formData.basicInfo.alternatePhone) 
            : undefined
        }
      };
      
      await onSave(formattedData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableProfessionalTypes = mockProfessionalTypes[formData.professional.category] || [];
  const availableSpecializations = mockSpecializations[formData.professional.category] || [];

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Edit Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your professional information and preferences
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {errors.general && (
          <Alert severity="error">
            {errors.general}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <FormSection>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            {/* Profile Photo */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Profile Photo
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={formData.basicInfo.profilePhoto}
                  sx={{ width: 80, height: 80 }}
                >
                  {formData.basicInfo.name.charAt(0)}
                </Avatar>
                <PhotoUploadBox>
                  <PhotoCameraOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Click to upload photo
                  </Typography>
                </PhotoUploadBox>
              </Stack>
            </Box>

            <Stack spacing={2}>
              <TextField
                label="Full Name"
                value={formData.basicInfo.name}
                onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
                fullWidth
              />

              <TextField
                label="Email Address"
                type="email"
                value={formData.basicInfo.email}
                onChange={(e) => handleInputChange('basicInfo', 'email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                required
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Main Mobile Number"
                  value={formData.basicInfo.phone}
                  onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  placeholder="+91XXXXXXXXXX"
                  required
                  fullWidth
                />

                <TextField
                  label="Alternate Mobile Number"
                  value={formData.basicInfo.alternatePhone || ''}
                  onChange={(e) => handleInputChange('basicInfo', 'alternatePhone', e.target.value)}
                  placeholder="+91XXXXXXXXXX"
                  fullWidth
                />
              </Stack>

              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.basicInfo.gender || ''}
                  onChange={(e) => handleInputChange('basicInfo', 'gender', e.target.value)}
                  label="Gender"
                >
                  <MenuItem value={Gender.MALE}>Male</MenuItem>
                  <MenuItem value={Gender.FEMALE}>Female</MenuItem>
                  <MenuItem value={Gender.OTHER}>Other</MenuItem>
                  <MenuItem value={Gender.PREFER_NOT_TO_SAY}>Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </FormSection>

          {/* Location Information */}
          <FormSection>
            <Typography variant="h6" gutterBottom>
              Location Information
            </Typography>
            
            <Stack spacing={2}>
              <Stack direction="row" spacing={2}>
                <Autocomplete
                  options={mockCities}
                  value={formData.location.city}
                  onChange={(_, value) => handleInputChange('location', 'city', value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="City"
                      error={!!errors.city}
                      helperText={errors.city}
                      required
                    />
                  )}
                  fullWidth
                />

                <Autocomplete
                  options={mockStates}
                  value={formData.location.state}
                  onChange={(_, value) => handleInputChange('location', 'state', value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="State"
                      error={!!errors.state}
                      helperText={errors.state}
                      required
                    />
                  )}
                  fullWidth
                />
              </Stack>

              <TextField
                label="PIN Code"
                value={formData.location.pinCode || ''}
                onChange={(e) => handleInputChange('location', 'pinCode', e.target.value)}
                fullWidth
              />

              <TextField
                label="Address"
                value={formData.location.address || ''}
                onChange={(e) => handleInputChange('location', 'address', e.target.value)}
                multiline
                rows={2}
                fullWidth
              />

              <Autocomplete
                multiple
                options={mockCities}
                value={formData.location.preferredWorkLocations}
                onChange={(_, value) => handleInputChange('location', 'preferredWorkLocations', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Preferred Work Locations"
                    placeholder="Select cities where you prefer to work"
                  />
                )}
              />
            </Stack>
          </FormSection>

          {/* Professional Details */}
          <FormSection>
            <Typography variant="h6" gutterBottom>
              Professional Details
            </Typography>
            
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Professional Category</InputLabel>
                <Select
                  value={formData.professional.category}
                  onChange={(e) => handleInputChange('professional', 'category', e.target.value)}
                  label="Professional Category"
                >
                  {Object.values(ProfessionalCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Professional Type</InputLabel>
                <Select
                  value={formData.professional.type}
                  onChange={(e) => handleInputChange('professional', 'type', e.target.value)}
                  label="Professional Type"
                  error={!!errors.professionalType}
                >
                  {availableProfessionalTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                multiple
                options={availableSpecializations}
                value={formData.professional.specializations}
                onChange={(_, value) => handleInputChange('professional', 'specializations', value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Specializations"
                    placeholder="Select your specializations"
                  />
                )}
              />

              <FormControl fullWidth>
                <InputLabel>Working Experience</InputLabel>
                <Select
                  value={formData.professional.experience || ''}
                  onChange={(e) => handleInputChange('professional', 'experience', e.target.value)}
                  label="Working Experience"
                >
                  {Object.values(ExperienceLevel).map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="About Me"
                value={formData.professional.about || ''}
                onChange={(e) => handleInputChange('professional', 'about', e.target.value)}
                multiline
                rows={4}
                placeholder="Tell us about your experience, style, and what makes you unique..."
                inputProps={{ maxLength: 500 }}
                helperText={`${(formData.professional.about || '').length}/500 characters`}
                fullWidth
              />

              <TextField
                label="Instagram Handle"
                value={formData.professional.instagramHandle || ''}
                onChange={(e) => handleInputChange('professional', 'instagramHandle', e.target.value)}
                placeholder="@your_handle"
                fullWidth
              />
            </Stack>
          </FormSection>

          {/* Pricing Information */}
          {formData.pricing && (
            <FormSection>
              <Typography variant="h6" gutterBottom>
                Pricing Information
              </Typography>
              
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Pricing Type</InputLabel>
                    <Select
                      value={formData.pricing.type}
                      onChange={(e) => handleInputChange('pricing', 'type', e.target.value)}
                      label="Pricing Type"
                    >
                      {Object.values(PricingType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Rate (₹)"
                    type="number"
                    value={formData.pricing.rate}
                    onChange={(e) => handleInputChange('pricing', 'rate', Number(e.target.value))}
                    inputProps={{ min: 500, max: 100000 }}
                    fullWidth
                  />
                </Stack>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.pricing.isNegotiable}
                      onChange={(e) => handleInputChange('pricing', 'isNegotiable', e.target.checked)}
                    />
                  }
                  label="Price is negotiable"
                />
              </Stack>
            </FormSection>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isSubmitting as any}
              size="large"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={isSubmitting as any}
              size="large"
            >
              Cancel
            </Button>
          </Stack>
        </form>
      </Stack>
    </StyledContainer>
  );
};