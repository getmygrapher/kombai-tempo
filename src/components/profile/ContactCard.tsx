import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Box,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Professional, ViewerPermissions } from '../../data/profileViewSystemMockData';
import { ActionButtons } from './ActionButtons';
import { PrivacyGate } from './PrivacyGate';
import { formatLastActive } from '../../data/profileViewSystemMockData';

interface ContactCardProps {
  professional: Professional;
  viewerPermissions: ViewerPermissions;
  onContact: (method: string) => void;
  onBook: () => void;
  onSave: () => void;
  onShare: () => void;
  onReport: () => void;
  isSaved: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  maxWidth: 400,
  margin: '0 auto',
  [theme.breakpoints.up('lg')]: {
    position: 'fixed',
    right: theme.spacing(3),
    top: '50%',
    transform: 'translateY(-50%)',
    width: 320,
    zIndex: theme.zIndex.drawer - 1,
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.75rem',
  height: 24,
}));

const InfoItem = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  color: theme.palette.text.secondary,
}));

export const ContactCard: React.FC<ContactCardProps> = ({
  professional,
  viewerPermissions,
  onContact,
  onBook,
  onSave,
  onShare,
  onReport,
  isSaved
}) => {
  const theme = useTheme();
  
  const getStatusColor = (lastActive: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'success';
    if (diffInMinutes < 60) return 'warning';
    return 'default';
  };

  const statusColor = getStatusColor(professional.lastActive);

  return (
    <StyledCard elevation={3}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Professional Info */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Typography variant="h6" component="h2">
                {professional.name}
              </Typography>
              <StatusChip
                label={formatLastActive(professional.lastActive)}
                color={statusColor}
                size="small"
              />
            </Stack>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {professional.professionalType}
            </Typography>
            
            <Stack spacing={1}>
              <InfoItem direction="row" spacing={1}>
                <LocationOnIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  {professional.location.city}, {professional.location.state}
                </Typography>
              </InfoItem>
              
              <InfoItem direction="row" spacing={1}>
                <AccessTimeIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">
                  Responds {professional.responseTime}
                </Typography>
              </InfoItem>
            </Stack>
          </Box>

          {/* Specializations */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Specializations
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {professional.specializations.slice(0, 3).map((spec) => (
                <Chip
                  key={spec}
                  label={spec}
                  size="small"
                  variant="outlined"
                />
              ))}
              {professional.specializations.length > 3 && (
                <Chip
                  label={`+${professional.specializations.length - 3} more`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Stack>
          </Box>

          {/* Contact Actions */}
          <PrivacyGate
            viewerPermissions={viewerPermissions}
            requiredPermission="canViewContact"
            gateType="contact"
          >
            <ActionButtons
              professional={professional}
              viewerPermissions={viewerPermissions}
              onContact={onContact}
              onBook={onBook}
              onSave={onSave}
              onShare={onShare}
              onReport={onReport}
              isSaved={isSaved as any}
              variant="desktop"
            />
          </PrivacyGate>
        </Stack>
      </CardContent>
    </StyledCard>
  );
};