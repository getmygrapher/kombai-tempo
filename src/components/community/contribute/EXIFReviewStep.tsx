import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack,
  TextField,
  Alert,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { EXIFData } from '../../../types/community';
import { exifService } from '../../../services/exifService';
import communityTheme from '../../../theme/communityTheme';

interface EXIFReviewStepProps {
  selectedFile: File;
  exifData: EXIFData | null;
  onExifUpdate: (data: EXIFData) => void;
  onNext: () => void;
  onBack: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: communityTheme.layout.cardBorderRadius,
}));

const SettingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
}));

const StatusChip = styled(Chip)<{ success: boolean }>(({ theme, success }) => ({
  backgroundColor: success 
    ? communityTheme.community.success.background 
    : communityTheme.community.warning.background,
  color: success 
    ? communityTheme.community.success.main 
    : communityTheme.community.warning.main,
  borderRadius: communityTheme.layout.chipBorderRadius,
}));

export const EXIFReviewStep: React.FC<EXIFReviewStepProps> = ({
  selectedFile,
  exifData,
  onExifUpdate,
  onNext,
  onBack
}) => {
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualData, setManualData] = useState<EXIFData>({
    camera_model: '',
    lens_model: '',
    focal_length: undefined,
    aperture: undefined,
    shutter_speed: '',
    iso_setting: undefined,
    flash_used: false,
    extraction_success: false
  });

  useEffect(() => {
    if (!exifData) {
      extractExifData();
    } else {
      setManualData(exifData);
    }
  }, [selectedFile, exifData]);

  const extractExifData = async () => {
    setLoading(true);
    try {
      const extractedData = await exifService.extractMetadata(selectedFile);
      onExifUpdate(extractedData);
      setManualData(extractedData);
    } catch (error) {
      const fallbackData: EXIFData = {
        ...manualData,
        extraction_success: false
      };
      onExifUpdate(fallbackData);
      setManualData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const handleManualChange = (field: keyof EXIFData, value: any) => {
    const updatedData = {
      ...manualData,
      [field]: value,
      extraction_success: false // Mark as manually entered
    };
    setManualData(updatedData);
    onExifUpdate(updatedData);
  };

  const handleContinue = () => {
    onNext();
  };

  const extractionSuccess = exifData?.extraction_success || false;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Camera Settings Review
        </Typography>
        <Typography variant="body1" color="text.secondary">
          We've analyzed your image for camera settings. Review and adjust if needed.
        </Typography>
      </Box>

      <StyledCard>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={600}>
                EXIF Data Extraction
              </Typography>
              <StatusChip
                success={extractionSuccess}
                icon={extractionSuccess ? <CheckCircleOutlinedIcon /> : <ErrorOutlineIcon />}
                label={extractionSuccess ? 'Auto-detected' : 'Manual Entry Required'}
                size="small"
              />
            </Box>

            {!extractionSuccess && (
              <Alert severity="info">
                Camera settings could not be automatically detected. Please enter them manually below.
              </Alert>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={manualMode}
                  onChange={(e) => setManualMode(e.target.checked)}
                />
              }
              label="Manual override"
            />
          </Stack>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Camera Information
          </Typography>
          
          <Stack spacing={2}>
            <TextField
              label="Camera Model"
              value={manualData.camera_model || ''}
              onChange={(e) => handleManualChange('camera_model', e.target.value)}
              disabled={(!manualMode && extractionSuccess) as any}
              fullWidth
              size="small"
            />
            
            <TextField
              label="Lens Model"
              value={manualData.lens_model || ''}
              onChange={(e) => handleManualChange('lens_model', e.target.value)}
              disabled={(!manualMode && extractionSuccess) as any}
              fullWidth
              size="small"
            />
          </Stack>
        </CardContent>
      </StyledCard>

      <StyledCard>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Camera Settings
          </Typography>
          
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Focal Length (mm)"
                type="number"
                value={manualData.focal_length || ''}
                onChange={(e) => handleManualChange('focal_length', parseInt(e.target.value) || undefined)}
                disabled={(!manualMode && extractionSuccess) as any}
                size="small"
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="Aperture (f/)"
                type="number"
                inputProps={{ step: "0.1" }}
                value={manualData.aperture || ''}
                onChange={(e) => handleManualChange('aperture', parseFloat(e.target.value) || undefined)}
                disabled={(!manualMode && extractionSuccess) as any}
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>
            
            <Stack direction="row" spacing={2}>
              <TextField
                label="Shutter Speed"
                value={manualData.shutter_speed || ''}
                onChange={(e) => handleManualChange('shutter_speed', e.target.value)}
                disabled={(!manualMode && extractionSuccess) as any}
                placeholder="e.g., 1/200s"
                size="small"
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="ISO"
                type="number"
                value={manualData.iso_setting || ''}
                onChange={(e) => handleManualChange('iso_setting', parseInt(e.target.value) || undefined)}
                disabled={(!manualMode && extractionSuccess) as any}
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>
            
            <FormControlLabel
              control={
                <Switch
                  checked={manualData.flash_used || false}
                  onChange={(e) => handleManualChange('flash_used', e.target.checked)}
                  disabled={(!manualMode && extractionSuccess) as any}
                />
              }
              label="Flash used"
            />
          </Stack>
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
          disabled={loading as any}
          sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
        >
          Continue
        </Button>
      </Stack>
    </Stack>
  );
};