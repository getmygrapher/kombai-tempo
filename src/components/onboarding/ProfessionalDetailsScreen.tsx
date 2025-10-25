import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Stack,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Switch,
  FormControlLabel,
  InputAdornment,
  Fade,
  Divider
} from '@mui/material';
import { ProfessionalCategory, ExperienceLevel, PricingType } from '../../types/enums';
import { OnboardingStep } from '../../types/onboarding';
import { validatePricingRate } from '../../utils/registrationValidation';
import { analyticsService } from '../../utils/analyticsEvents';
import { StepNavigation } from './StepNavigation';

interface ProfessionalDetailsData {
  experienceLevel: ExperienceLevel | null;
  specializations: string[];
  pricing: {
    type: PricingType | null;
    rate: number;
    isNegotiable: boolean;
  };
  equipment: {
    cameras: string[];
    lenses: string[];
    lighting: string[];
    other: string[];
  };
  instagramHandle: string;
  portfolioLinks: string[];
}

interface ProfessionalDetailsScreenProps {
  selectedCategory: ProfessionalCategory;
  detailsData: ProfessionalDetailsData;
  onDetailsUpdate: (data: Partial<ProfessionalDetailsData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Specialization options based on category
const getSpecializationOptions = (category: ProfessionalCategory): string[] => {
  const options: Record<ProfessionalCategory, string[]> = {
    [ProfessionalCategory.PHOTOGRAPHY]: [
      'Portrait Photography', 'Wedding Photography', 'Event Photography',
      'Commercial Photography', 'Product Photography', 'Fashion Photography',
      'Real Estate Photography', 'Food Photography', 'Travel Photography',
      'Sports Photography', 'Documentary Photography', 'Fine Art Photography'
    ],
    [ProfessionalCategory.VIDEOGRAPHY]: [
      'Wedding Videography', 'Commercial Videos', 'Music Videos',
      'Corporate Videos', 'Documentary Films', 'Social Media Content',
      'Live Streaming', 'Drone Videography', 'Animation', 'Post-Production'
    ],
    [ProfessionalCategory.AUDIO]: [
      'Music Production', 'Podcast Production', 'Voice Over Recording',
      'Live Sound Engineering', 'Audio Mixing', 'Audio Mastering',
      'Sound Design', 'Audio Post-Production'
    ],
    [ProfessionalCategory.DESIGN]: [
      'Logo Design', 'Brand Identity', 'Web Design', 'Print Design',
      'Social Media Graphics', 'Packaging Design', 'Illustration',
      'UI/UX Design', 'Motion Graphics'
    ],
    [ProfessionalCategory.MULTI_DISCIPLINARY]: [
      'Content Creation', 'Brand Strategy', 'Social Media Management',
      'Event Planning', 'Creative Direction', 'Digital Marketing',
      'Photography + Videography', 'Design + Development'
    ]
  };
  
  return options[category] || [];
};

// Equipment options
const equipmentOptions = {
  cameras: [
    'Canon EOS R5', 'Canon EOS R6', 'Canon 5D Mark IV', 'Canon 6D Mark II',
    'Nikon D850', 'Nikon Z7', 'Nikon Z6', 'Nikon D780',
    'Sony A7R IV', 'Sony A7 III', 'Sony A7S III', 'Sony FX3',
    'Fujifilm X-T4', 'Fujifilm GFX 100S', 'Panasonic GH5', 'Blackmagic Pocket 6K'
  ],
  lenses: [
    '24-70mm f/2.8', '70-200mm f/2.8', '85mm f/1.4', '50mm f/1.4',
    '35mm f/1.4', '16-35mm f/2.8', '100mm f/2.8 Macro', '24-105mm f/4',
    '14-24mm f/2.8', '135mm f/2', '24mm f/1.4', '200mm f/2'
  ],
  lighting: [
    'Godox AD600', 'Profoto B1X', 'Elinchrom ELB 500', 'Aputure 300D',
    'Softbox Kit', 'Beauty Dish', 'Ring Light', 'LED Panel',
    'Reflectors', 'Umbrellas', 'Continuous Lights', 'Flash Triggers'
  ],
  other: [
    'Tripods', 'Gimbals', 'Drones', 'Audio Recorders',
    'Microphones', 'Memory Cards', 'Batteries', 'Camera Bags',
    'Filters', 'Remote Triggers', 'Light Stands', 'Backdrop Stands'
  ]
};

export const ProfessionalDetailsScreen: React.FC<ProfessionalDetailsScreenProps> = ({
  selectedCategory,
  detailsData,
  onDetailsUpdate,
  onNext,
  onBack
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const specializationOptions = getSpecializationOptions(selectedCategory);

  useEffect(() => {
    analyticsService.trackStepViewed(OnboardingStep.PROFESSIONAL_DETAILS, {
      selectedCategory
    });
  }, [selectedCategory]);

  const handleFieldChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      onDetailsUpdate({
        [parent]: {
          ...(detailsData as any)[parent],
          [child]: value
        }
      });
    } else {
      onDetailsUpdate({ [field]: value });
    }
    
    // Clear error when user makes changes
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEquipmentChange = (category: keyof typeof detailsData.equipment, values: string[]) => {
    onDetailsUpdate({
      equipment: {
        ...detailsData.equipment,
        [category]: values
      }
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!detailsData.experienceLevel) {
      newErrors.experienceLevel = 'Experience level is required';
    }

    if (!detailsData.pricing.type) {
      newErrors['pricing.type'] = 'Pricing type is required';
    }

    const rateValidation = validatePricingRate(detailsData.pricing.rate);
    if (!rateValidation.isValid) {
      newErrors['pricing.rate'] = rateValidation.error!;
    }

    if (detailsData.specializations.length === 0) {
      newErrors.specializations = 'Please select at least one specialization';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      analyticsService.trackStepCompleted(OnboardingStep.PROFESSIONAL_DETAILS, {
        experienceLevel: detailsData.experienceLevel,
        pricingType: detailsData.pricing.type,
        pricingRate: detailsData.pricing.rate,
        specializationCount: detailsData.specializations.length,
        hasInstagram: !!detailsData.instagramHandle,
        equipmentCount: Object.values(detailsData.equipment).flat().length
      });
      onNext();
    } else {
      Object.entries(errors).forEach(([field, error]) => {
        analyticsService.trackValidationError(OnboardingStep.PROFESSIONAL_DETAILS, field, error);
      });
    }
  };

  const canProceed = detailsData.experienceLevel && 
                    detailsData.pricing.type && 
                    detailsData.pricing.rate > 0 &&
                    detailsData.specializations.length > 0;

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', px: 2 }}>
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
              Professional Details
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
            >
              Share your experience, skills, and pricing to attract the right clients
            </Typography>
          </Box>
        </Fade>

        {/* Experience & Specializations */}
        <Fade in timeout={800}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Experience & Skills
                </Typography>

                {/* Experience Level */}
                <FormControl fullWidth error={!!errors.experienceLevel}>
                  <InputLabel>Experience Level *</InputLabel>
                  <Select
                    value={detailsData.experienceLevel || ''}
                    label="Experience Level *"
                    onChange={(e) => handleFieldChange('experienceLevel', e.target.value)}
                  >
                    {Object.values(ExperienceLevel).map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.experienceLevel && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.experienceLevel}
                    </Typography>
                  )}
                </FormControl>

                {/* Specializations */}
                <Box>
                  <Autocomplete
                    multiple
                    options={specializationOptions}
                    value={detailsData.specializations}
                    onChange={(_, values) => handleFieldChange('specializations', values)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          key={option}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Specializations *"
                        placeholder="Select your specializations"
                        error={!!errors.specializations}
                        helperText={errors.specializations}
                      />
                    )}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Pricing */}
        <Fade in timeout={1000}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pricing
                </Typography>

                {/* Pricing Type */}
                <FormControl fullWidth error={!!errors['pricing.type']}>
                  <InputLabel>Pricing Type *</InputLabel>
                  <Select
                    value={detailsData.pricing.type || ''}
                    label="Pricing Type *"
                    onChange={(e) => handleFieldChange('pricing.type', e.target.value)}
                  >
                    {Object.values(PricingType).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors['pricing.type'] && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors['pricing.type']}
                    </Typography>
                  )}
                </FormControl>

                {/* Rate */}
                <TextField
                  fullWidth
                  label="Rate *"
                  type="number"
                  value={detailsData.pricing.rate || ''}
                  onChange={(e) => handleFieldChange('pricing.rate', parseFloat(e.target.value) || 0)}
                  error={!!errors['pricing.rate']}
                  helperText={errors['pricing.rate']}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  placeholder="Enter your rate"
                />

                {/* Negotiable */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={detailsData.pricing.isNegotiable}
                      onChange={(e) => handleFieldChange('pricing.isNegotiable', e.target.checked)}
                    />
                  }
                  label="Rate is negotiable"
                />
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Equipment */}
        <Fade in timeout={1200}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Equipment (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  List your professional equipment to showcase your capabilities
                </Typography>

                {/* Cameras */}
                <Autocomplete
                  multiple
                  options={equipmentOptions.cameras}
                  value={detailsData.equipment.cameras}
                  onChange={(_, values) => handleEquipmentChange('cameras', values)}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cameras"
                      placeholder="Add cameras"
                    />
                  )}
                />

                {/* Lenses */}
                <Autocomplete
                  multiple
                  options={equipmentOptions.lenses}
                  value={detailsData.equipment.lenses}
                  onChange={(_, values) => handleEquipmentChange('lenses', values)}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Lenses"
                      placeholder="Add lenses"
                    />
                  )}
                />

                {/* Lighting */}
                <Autocomplete
                  multiple
                  options={equipmentOptions.lighting}
                  value={detailsData.equipment.lighting}
                  onChange={(_, values) => handleEquipmentChange('lighting', values)}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Lighting Equipment"
                      placeholder="Add lighting equipment"
                    />
                  )}
                />

                {/* Other Equipment */}
                <Autocomplete
                  multiple
                  options={equipmentOptions.other}
                  value={detailsData.equipment.other}
                  onChange={(_, values) => handleEquipmentChange('other', values)}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Other Equipment"
                      placeholder="Add other equipment"
                    />
                  )}
                />
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Social & Portfolio */}
        <Fade in timeout={1400}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Social & Portfolio (Optional)
                </Typography>

                {/* Instagram Handle */}
                <TextField
                  fullWidth
                  label="Instagram Handle"
                  value={detailsData.instagramHandle}
                  onChange={(e) => handleFieldChange('instagramHandle', e.target.value)}
                  placeholder="@yourusername"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">@</InputAdornment>,
                  }}
                />

                {/* Portfolio Links */}
                <TextField
                  fullWidth
                  label="Portfolio Website"
                  value={detailsData.portfolioLinks[0] || ''}
                  onChange={(e) => handleFieldChange('portfolioLinks', [e.target.value])}
                  placeholder="https://yourportfolio.com"
                  type="url"
                />
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Navigation */}
        <Fade in timeout={1600}>
          <StepNavigation
            onBack={onBack}
            onNext={handleNext}
            canProceed={!!canProceed}
            nextLabel="Continue"
            backLabel="Back"
          />
        </Fade>
      </Stack>
    </Box>
  );
};