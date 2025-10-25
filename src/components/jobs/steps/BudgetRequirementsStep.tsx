import React from 'react';
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { UrgencyLevel, BudgetType } from '../../../types/enums';
import { Job } from '../../../types';

interface BudgetRequirementsStepProps {
  jobData: Partial<Job> | null;
  errors: Record<string, string>;
  onChange: (data: Partial<Job>) => void;
}

export const BudgetRequirementsStep: React.FC<BudgetRequirementsStepProps> = ({
  jobData,
  errors,
  onChange,
}) => {
  const handleBudgetChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value) || 0;
    const currentBudget = jobData?.budgetRange || { min: 0, max: 0, currency: 'INR' as const, type: BudgetType.FIXED, isNegotiable: false };
    
    onChange({
      budgetRange: {
        ...currentBudget,
        [field]: numValue,
      },
    });
  };

  const handleBudgetTypeChange = (type: BudgetType) => {
    const currentBudget = jobData?.budgetRange || { min: 0, max: 0, currency: 'INR' as const, type: BudgetType.FIXED, isNegotiable: false };
    
    onChange({
      budgetRange: {
        ...currentBudget,
        type,
      },
    });
  };

  const handleNegotiableChange = (isNegotiable: boolean) => {
    const currentBudget = jobData?.budgetRange || { min: 0, max: 0, currency: 'INR' as const, type: BudgetType.FIXED, isNegotiable: false };
    
    onChange({
      budgetRange: {
        ...currentBudget,
        isNegotiable,
      },
    });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Budget & Requirements</Typography>
      
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Budget Range (INR) *
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Budget Type</InputLabel>
            <Select
              value={jobData?.budgetRange?.type || BudgetType.FIXED}
              onChange={(e) => handleBudgetTypeChange(e.target.value as BudgetType)}
              label="Budget Type"
            >
              <MenuItem value={BudgetType.FIXED}>Fixed Budget</MenuItem>
              <MenuItem value={BudgetType.HOURLY}>Hourly Rate</MenuItem>
              <MenuItem value={BudgetType.PROJECT}>Project Based</MenuItem>
            </Select>
          </FormControl>
          
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Minimum Budget"
              type="number"
              value={jobData?.budgetRange?.min || ''}
              onChange={(e) => handleBudgetChange('min', e.target.value)}
              error={!!errors.budgetMin}
              helperText={errors.budgetMin}
              InputProps={{
                startAdornment: '₹',
              }}
            />
            
            <TextField
              fullWidth
              label="Maximum Budget"
              type="number"
              value={jobData?.budgetRange?.max || ''}
              onChange={(e) => handleBudgetChange('max', e.target.value)}
              error={!!errors.budgetMax}
              helperText={errors.budgetMax}
              InputProps={{
                startAdornment: '₹',
              }}
            />
          </Stack>
          
          {errors.budgetRange && (
            <FormHelperText error>{errors.budgetRange}</FormHelperText>
          )}
          
          <FormControlLabel
            control={
              <Switch
                checked={jobData?.budgetRange?.isNegotiable || false}
                onChange={(e) => handleNegotiableChange(e.target.checked)}
              />
            }
            label="Budget is negotiable"
          />
        </Stack>
      </Box>

      <FormControl fullWidth error={!!errors.urgency}>
        <InputLabel>Urgency Level *</InputLabel>
        <Select
          value={jobData?.urgency || ''}
          onChange={(e) => onChange({ urgency: e.target.value as UrgencyLevel })}
          label="Urgency Level *"
        >
          <MenuItem value={UrgencyLevel.NORMAL}>Normal - Standard timeline</MenuItem>
          <MenuItem value={UrgencyLevel.URGENT}>Urgent - Need within a week</MenuItem>
          <MenuItem value={UrgencyLevel.EMERGENCY}>Emergency - Need ASAP</MenuItem>
        </Select>
        {errors.urgency && <FormHelperText>{errors.urgency}</FormHelperText>}
      </FormControl>

      <TextField
        fullWidth
        label="Additional Requirements (Optional)"
        multiline
        rows={3}
        value={jobData?.description || ''}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Any specific requirements, equipment needs, dress code, etc..."
      />
    </Stack>
  );
};