import React, { useEffect } from 'react';
import {
  Stack,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useForm } from 'react-hook-form';
import { Job } from '../../../types';
import { LocationInput } from '../../common/LocationInput';
import { useScheduleLocationValidation } from '../../../hooks/useFormValidation';
import { ScheduleLocationFormData } from '../../../utils/validationSchemas';

interface ScheduleLocationStepProps {
  jobData: Partial<Job> | null;
  errors: Record<string, string>;
  onChange: (data: Partial<Job>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const ScheduleLocationStep: React.FC<ScheduleLocationStepProps> = ({
  jobData,
  errors,
  onChange,
  onValidationChange,
}) => {
  const form = useScheduleLocationValidation({
    date: jobData?.date || '',
    timeSlots: jobData?.timeSlots || [],
    location: jobData?.location || {
      address: '',
      city: '',
      state: '',
      pinCode: '',
      coordinates: undefined
    }
  });

  const { control, watch, setValue, formState: { errors: formErrors, isValid } } = form;

  // Watch form values for UI only
  const watchedValues = watch();
  
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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setValue('date', date.toISOString());
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      onChange({ endDate: date.toISOString() });
    }
  };

  const handleLocationChange = (location: any) => {
    setValue('location', location);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Schedule & Location</Typography>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Job Schedule
        </Typography>
        <Stack spacing={2}>
          <DateTimePicker
            label="Start Date & Time *"
            value={watchedValues.date ? new Date(watchedValues.date) : null}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!formErrors.date,
                helperText: formErrors.date?.message,
              },
            }}
          />
          
          <DateTimePicker
            label="End Date & Time (Optional)"
            value={jobData?.endDate ? new Date(jobData.endDate) : null}
            onChange={handleEndDateChange}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Job Location
        </Typography>
        <LocationInput
          value={watchedValues.location}
          onChange={handleLocationChange}
          required={true}
          showMap={true}
          label="Job Location"
          helperText="Enter the complete address where the job will take place"
        />
      </Box>
    </Stack>
  );
};