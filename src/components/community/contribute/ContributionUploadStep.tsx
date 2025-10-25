import React, { useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Stack,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { validateImageFile } from '../../../utils/communityValidation';
import { formatFileSize } from '../../../utils/communityFormatters';
import communityTheme from '../../../theme/communityTheme';

interface ContributionUploadStepProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onNext: () => void;
  error?: string;
}

const UploadCard = styled(Box)(({ theme }) => ({
  borderRadius: communityTheme.layout.cardBorderRadius,
  border: `2px dashed ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: communityTheme.animations.cardHover,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const UploadArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const PreviewImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: 300,
  borderRadius: communityTheme.layout.cardBorderRadius,
  objectFit: 'cover',
}));

const HiddenInput = styled('input')({
  display: 'none',
});

export const ContributionUploadStep: React.FC<ContributionUploadStepProps> = ({
  selectedFile,
  onFileSelect,
  onNext,
  error
}) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        onFileSelect(null);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validationError = validateImageFile(file);
      if (validationError) {
        onFileSelect(null);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Upload Your Pose
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a high-quality image that showcases your posing technique
        </Typography>
      </Box>

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {selectedFile ? (
        <Card sx={{ borderRadius: communityTheme.layout.cardBorderRadius }}>
          <CardContent>
            <Stack spacing={2}>
              <PreviewImage
                src={URL.createObjectURL(selectedFile)}
                alt="Selected image preview"
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
                >
                  Change Image
                  <HiddenInput
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                  />
                </Button>
                <Button
                  variant="contained"
                  onClick={onNext}
                  sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
                >
                  Continue
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Box component="label">
          <UploadCard
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <UploadArea>
              <CloudUploadOutlinedIcon 
                sx={{ fontSize: 64, color: 'text.secondary' }} 
              />
              <Typography variant="h6" fontWeight={600}>
                Drop your image here or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports JPG and PNG files up to 5MB
              </Typography>
              <Button
                variant="contained"
                component="span"
                sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
              >
                Choose File
              </Button>
            </UploadArea>
          </UploadCard>
          <HiddenInput
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
          />
        </Box>
      )}

      <Box>
        <Typography variant="body2" color="text.secondary">
          <strong>Tips for best results:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul" sx={{ mt: 1 }}>
          <li>Use high-resolution images (at least 1080px)</li>
          <li>Ensure good lighting and clear visibility of the pose</li>
          <li>Avoid heavily edited or filtered images</li>
          <li>Make sure the pose is the main focus of the image</li>
        </Typography>
      </Box>
    </Stack>
  );
};