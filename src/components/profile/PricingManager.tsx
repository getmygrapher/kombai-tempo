import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Alert,
  Divider,
  InputAdornment,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PricingType } from '../../types/enums';
import { PricingInfo } from '../../types';
import { PricingCard } from './PricingCard';
import { useProfileManagementStore } from '../../store/profileManagementStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const FormSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const PreviewSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  border: `1px dashed ${theme.palette.grey[300]}`,
}));

interface PricingManagerProps {
  pricing?: PricingInfo;
  onSave: (pricing: PricingInfo) => Promise<void>;
  onCancel: () => void;
}

export const PricingManager: React.FC<PricingManagerProps> = ({
  pricing,
  onSave,
  onCancel
}) => {
  const [pricingData, setPricingData] = useState<PricingInfo>(
    pricing || {
      type: PricingType.PER_EVENT,
      rate: 5000,
      isNegotiable: false
    }
  );

  const [additionalData, setAdditionalData] = useState({
    minimumHours: 4,
    overtimeRate: 1000,
    inclusions: ['High-resolution photos', 'Basic editing', 'Online gallery']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { isSaving } = useProfileManagementStore();

  const validatePricing = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (pricingData.rate < 500) {
      newErrors.rate = 'Minimum rate is ₹500';
    } else if (pricingData.rate > 100000) {
      newErrors.rate = 'Maximum rate is ₹100,000';
    }

    if (pricingData.type === PricingType.PER_HOUR && additionalData.minimumHours < 1) {
      newErrors.minimumHours = 'Minimum hours must be at least 1';
    }

    if (pricingData.type === PricingType.PER_DAY && additionalData.overtimeRate < 0) {
      newErrors.overtimeRate = 'Overtime rate cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PricingInfo, value: any) => {
    setPricingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAdditionalDataChange = (field: string, value: any) => {
    setAdditionalData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePricing()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(pricingData);
      setSuccessMessage('Pricing updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ general: 'Failed to update pricing. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPricingTypeDescription = (type: PricingType): string => {
    switch (type) {
      case PricingType.PER_HOUR:
        return 'Charge clients based on hourly rates';
      case PricingType.PER_DAY:
        return 'Charge clients for full day sessions';
      case PricingType.PER_EVENT:
        return 'Charge a fixed rate per event or project';
      default:
        return '';
    }
  };

  const formatPricingPreview = (): string => {
    const currency = '₹';
    const rate = pricingData.rate.toLocaleString();
    
    switch (pricingData.type) {
      case PricingType.PER_HOUR:
        return `${currency}${rate}/hour`;
      case PricingType.PER_DAY:
        return `${currency}${rate}/day`;
      case PricingType.PER_EVENT:
        return `${currency}${rate}/event`;
      default:
        return `${currency}${rate}`;
    }
  };

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={onCancel} 
            sx={{ mb: 2 }}
          >
            Back to Profile
          </Button>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Pricing Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set your rates and pricing structure for potential clients
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
          <Stack spacing={3}>
            {/* Pricing Structure */}
            <FormSection>
              <Typography variant="h6" gutterBottom>
                Pricing Structure
              </Typography>
              
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Pricing Type</InputLabel>
                  <Select
                    value={pricingData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    label="Pricing Type"
                  >
                    {Object.values(PricingType).map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box>
                          <Typography variant="body1">{type}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getPricingTypeDescription(type)}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Rate"
                  type="number"
                  value={pricingData.rate}
                  onChange={(e) => handleInputChange('rate', Number(e.target.value))}
                  error={!!errors.rate}
                  helperText={errors.rate || `Rate must be between ₹500 and ₹100,000`}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  inputProps={{ min: 500, max: 100000 }}
                  fullWidth
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={pricingData.isNegotiable}
                      onChange={(e) => handleInputChange('isNegotiable', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">Price is negotiable</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Allow clients to negotiate pricing with you
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </FormSection>

            {/* Additional Settings */}
            <FormSection>
              <Typography variant="h6" gutterBottom>
                Additional Settings
              </Typography>
              
              <Stack spacing={2}>
                {pricingData.type === PricingType.PER_HOUR && (
                  <TextField
                    label="Minimum Hours"
                    type="number"
                    value={additionalData.minimumHours}
                    onChange={(e) => handleAdditionalDataChange('minimumHours', Number(e.target.value))}
                    error={!!errors.minimumHours}
                    helperText={errors.minimumHours || 'Minimum booking duration in hours'}
                    inputProps={{ min: 1, max: 24 }}
                    fullWidth
                  />
                )}

                {pricingData.type === PricingType.PER_DAY && (
                  <TextField
                    label="Overtime Rate"
                    type="number"
                    value={additionalData.overtimeRate}
                    onChange={(e) => handleAdditionalDataChange('overtimeRate', Number(e.target.value))}
                    error={!!errors.overtimeRate}
                    helperText={errors.overtimeRate || 'Additional rate for overtime work'}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      endAdornment: <InputAdornment position="end">/hour</InputAdornment>,
                    }}
                    inputProps={{ min: 0 }}
                    fullWidth
                  />
                )}

                {pricingData.type === PricingType.PER_EVENT && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      What's Included
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      {additionalData.inclusions.map((inclusion, index) => (
                        <Chip
                          key={index}
                          label={inclusion}
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Services included in your event pricing
                    </Typography>
                  </Box>
                )}
              </Stack>
            </FormSection>

            {/* Live Preview */}
            <PreviewSection>
              <Typography variant="h6" gutterBottom>
                Live Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This is how your pricing will appear to clients
              </Typography>
              
              <PricingCard
                pricing={pricingData}
                additionalData={additionalData}
                isPreview={true as any}
              />
            </PreviewSection>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={(isSubmitting || isSaving) as any}
                size="large"
              >
                {isSubmitting || isSaving ? 'Saving...' : 'Save Pricing'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={(isSubmitting || isSaving) as any}
                size="large"
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Stack>
    </StyledContainer>
  );
};