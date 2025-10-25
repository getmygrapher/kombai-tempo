import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ContributionFormData, 
  DifficultyLevel, 
  PoseCategory 
} from '../../../types/community';
import { 
  formatDifficultyLevel, 
  formatPoseCategory 
} from '../../../utils/communityFormatters';
import { validateContributionForm } from '../../../utils/communityValidation';
import communityTheme from '../../../theme/communityTheme';

interface PoseDetailsStepProps {
  formData: ContributionFormData;
  onFormUpdate: (data: Partial<ContributionFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: communityTheme.layout.cardBorderRadius,
}));

const EquipmentChip = styled(Chip)(({ theme }) => ({
  borderRadius: communityTheme.layout.chipBorderRadius,
  margin: theme.spacing(0.5),
}));

export const PoseDetailsStep: React.FC<PoseDetailsStepProps> = ({
  formData,
  onFormUpdate,
  onNext,
  onBack
}) => {
  const [equipmentInput, setEquipmentInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof ContributionFormData, value: any) => {
    onFormUpdate({ [field]: value });
  };

  const handleAddEquipment = () => {
    if (equipmentInput.trim() && !formData.additional_equipment.includes(equipmentInput.trim())) {
      onFormUpdate({
        additional_equipment: [...formData.additional_equipment, equipmentInput.trim()]
      });
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (equipment: string) => {
    onFormUpdate({
      additional_equipment: formData.additional_equipment.filter(item => item !== equipment)
    });
  };

  const handleEquipmentKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddEquipment();
    }
  };

  const handleContinue = () => {
    const validation = validateContributionForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors.map(error => error.message));
      return;
    }
    setValidationErrors([]);
    onNext();
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Pose Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Help others learn by providing detailed information about your pose
        </Typography>
      </Box>

      {validationErrors.length > 0 && (
        <Alert severity="error">
          <Typography variant="subtitle2" gutterBottom>
            Please fix the following errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Basic Information
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              fullWidth
              required
              placeholder="e.g., Elegant Bridal Portrait"
            />
            
            <TextField
              label="Posing Tips"
              value={formData.posing_tips}
              onChange={(e) => handleInputChange('posing_tips', e.target.value)}
              fullWidth
              multiline
              rows={4}
              required
              placeholder="Describe the pose, positioning, and any specific techniques..."
            />
            
            <Stack direction="row" spacing={2}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={formData.difficulty_level}
                  label="Difficulty Level"
                  onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                >
                  {Object.values(DifficultyLevel).map((level) => (
                    <MenuItem key={level} value={level}>
                      {formatDifficultyLevel(level)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {Object.values(PoseCategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {formatPoseCategory(category)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            
            <Stack direction="row" spacing={2}>
              <TextField
                label="People Count"
                type="number"
                value={formData.people_count}
                onChange={(e) => handleInputChange('people_count', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 20 }}
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="Mood/Emotion"
                value={formData.mood_emotion}
                onChange={(e) => handleInputChange('mood_emotion', e.target.value)}
                placeholder="e.g., Elegant, Playful, Dramatic"
                sx={{ flex: 2 }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Equipment & Setup
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Additional Equipment
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  onKeyPress={handleEquipmentKeyPress}
                  placeholder="e.g., Reflector, Softbox, Tripod"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddEquipment}
                  disabled={!equipmentInput.trim() as any}
                  sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
                >
                  Add
                </Button>
              </Stack>
              
              <Box mt={1}>
                {formData.additional_equipment.map((equipment, index) => (
                  <EquipmentChip
                    key={index}
                    label={equipment}
                    onDelete={() => handleRemoveEquipment(equipment)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
            
            <TextField
              label="Lighting Setup"
              value={formData.lighting_setup}
              onChange={(e) => handleInputChange('lighting_setup', e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Describe your lighting setup..."
            />
          </Stack>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Story Behind (Optional)
          </Typography>
          
          <TextField
            value={formData.story_behind}
            onChange={(e) => handleInputChange('story_behind', e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Share the story behind this pose - the context, inspiration, or any interesting details..."
          />
        </CardContent>
      </StyledCard>

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          onClick={handleContinue}
          sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
        >
          Continue
        </Button>
      </Stack>
    </Stack>
  );
};