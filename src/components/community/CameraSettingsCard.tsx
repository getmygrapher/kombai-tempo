import React from 'react';
import { Card, CardContent, Typography, Stack, Chip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { CameraSettings } from '../../types/community';
import communityTheme from '../../theme/communityTheme';

interface CameraSettingsCardProps {
  settings: CameraSettings;
  cameraModel?: string;
  lensModel?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: string;
  isoSetting?: number;
  flashUsed?: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: communityTheme.layout.cardBorderRadius,
  boxShadow: theme.shadows[1],
}));

const SettingRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingY: theme.spacing(0.5),
}));

const VerifiedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: communityTheme.community.success.background,
  color: communityTheme.community.success.main,
  fontSize: '0.75rem',
  height: 20,
  '& .MuiChip-icon': {
    fontSize: 12,
  },
}));

export const CameraSettingsCard: React.FC<CameraSettingsCardProps> = ({
  settings,
  cameraModel,
  lensModel,
  focalLength,
  aperture,
  shutterSpeed,
  isoSetting,
  flashUsed
}) => {
  const isVerified = settings.exif_extraction_success;

  return (
    <StyledCard>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PhotoCameraOutlinedIcon color="action" />
            <Typography variant="h6" fontWeight={600}>
              📸 Camera Settings
            </Typography>
            {isVerified && (
              <VerifiedChip
                icon={<VerifiedOutlinedIcon />}
                label="Auto-detected"
                size="small"
              />
            )}
          </Stack>

          <Stack spacing={1}>
            {cameraModel && (
              <SettingRow>
                <Typography variant="body2" color="text.secondary">
                  Camera:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {cameraModel}
                </Typography>
              </SettingRow>
            )}

            {lensModel && (
              <SettingRow>
                <Typography variant="body2" color="text.secondary">
                  Lens:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {lensModel}
                </Typography>
              </SettingRow>
            )}

            <Divider />

            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Settings:
            </Typography>

            {aperture && (
              <SettingRow>
                <Typography variant="body2" color="text.secondary">
                  Aperture:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  f/{aperture}
                </Typography>
              </SettingRow>
            )}

            {shutterSpeed && (
              <SettingRow>
                <Typography variant="body2" color="text.secondary">
                  Shutter:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {shutterSpeed}
                </Typography>
              </SettingRow>
            )}

            {isoSetting && (
              <SettingRow>
                <Typography variant="body2" color="text.secondary">
                  ISO:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {isoSetting}
                </Typography>
              </SettingRow>
            )}

            {flashUsed !== undefined && (
              <SettingRow>
                <Typography variant="body2" color="text.secondary">
                  Flash:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {flashUsed ? 'Yes' : 'No'}
                </Typography>
              </SettingRow>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </StyledCard>
  );
};