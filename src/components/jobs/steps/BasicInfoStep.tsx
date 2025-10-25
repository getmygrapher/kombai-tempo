import React, { useEffect } from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import { useController, useForm } from 'react-hook-form';
import { ProfessionalCategory } from '../../../types/enums';
import { Job } from '../../../types';
import { useBasicInfoValidation } from '../../../hooks/useFormValidation';
import { BasicInfoFormData } from '../../../utils/validationSchemas';

interface BasicInfoStepProps {
  jobData: Partial<Job> | null;
  errors: Record<string, string>;
  onChange: (data: Partial<Job>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const professionalTypes = {
  [ProfessionalCategory.PHOTOGRAPHY]: [
    'Wedding Photographer',
    'Portrait Photographer',
    'Event Photographer',
    'Commercial Photographer',
    'Real Estate Photographer',
  ],
  [ProfessionalCategory.VIDEOGRAPHY]: [
    'Wedding Videographer',
    'Commercial Videographer',
    'Music Videographer',
    'Content Creator',
  ],
  [ProfessionalCategory.AUDIO]: [
    'Mixing Engineer',
    'Mastering Engineer',
    'Live Sound Engineer',
  ],
  [ProfessionalCategory.DESIGN]: [
    'Graphic Designer',
    'Social Media Designer',
    'Illustrator',
    'Creative Director',
  ],
};

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  jobData,
  errors,
  onChange,
  onValidationChange,
}) => {
  const form = useBasicInfoValidation({
    title: jobData?.title || '',
    type: jobData?.type || undefined,
    professionalTypesNeeded: jobData?.professionalTypesNeeded || []
  });

  const { control, watch, setValue, formState: { errors: formErrors, isValid } } = form;

  // Watch form values for UI only
  const watchedValues = watch();
  
  // Subscribe to value changes and notify parent
  useEffect(() => {
    const subscription = form.watch((values) => {
      onChange(values as Partial<Job>);
    });
    return () => subscription.unsubscribe();
  }, [form, onChange]);

  // Notify parent about validation state
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleTypeChange = (type: ProfessionalCategory) => {
    setValue('type', type);
    setValue('professionalTypesNeeded', []); // Reset when category changes
  };

  const handleProfessionalTypeToggle = (professionalType: string) => {
    const current = watchedValues.professionalTypesNeeded || [];
    const updated = current.includes(professionalType)
      ? current.filter(t => t !== professionalType)
      : [...current, professionalType];
    
    setValue('professionalTypesNeeded', updated);
  };

  const availableTypes = watchedValues.type ? professionalTypes[watchedValues.type] || [] : [];

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Basic Job Information</Typography>
      
      <TextField
        fullWidth
        label="Job Title"
        {...control.register('title')}
        error={!!formErrors.title}
        helperText={formErrors.title?.message || `${(watchedValues.title || '').length}/100 characters`}
        placeholder="e.g., Wedding Photography - Traditional Kerala Wedding"
        inputProps={{ maxLength: 100 }}
      />

      <FormControl fullWidth error={!!formErrors.type}>
        <InputLabel>Work Category</InputLabel>
        <Select
          {...control.register('type')}
          value={watchedValues.type || ''}
          onChange={(e) => handleTypeChange(e.target.value as ProfessionalCategory)}
          label="Work Category"
        >
          {Object.values(ProfessionalCategory).map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>
        {formErrors.type && <FormHelperText>{formErrors.type.message}</FormHelperText>}
      </FormControl>

      {watchedValues.type && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Professional Types Needed *
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {availableTypes.map((type) => (
              <Chip
                key={type}
                label={type}
                clickable
                color={watchedValues.professionalTypesNeeded?.includes(type) ? 'primary' : 'default'}
                variant={watchedValues.professionalTypesNeeded?.includes(type) ? 'filled' : 'outlined'}
                onClick={() => handleProfessionalTypeToggle(type)}
              />
            ))}
          </Stack>
          {formErrors.professionalTypesNeeded && (
            <FormHelperText error>{formErrors.professionalTypesNeeded.message}</FormHelperText>
          )}
        </Box>
      )}
    </Stack>
  );
};