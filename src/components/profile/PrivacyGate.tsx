import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import LoginIcon from '@mui/icons-material/Login';
import { ViewerPermissions } from '../../data/profileViewSystemMockData';

interface PrivacyGateProps {
  children: React.ReactNode;
  viewerPermissions: ViewerPermissions;
  requiredPermission: keyof ViewerPermissions;
  gateType?: 'pricing' | 'contact' | 'availability' | 'instagram' | 'equipment';
  fallbackContent?: React.ReactNode;
}

const GatedContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
}));

const GateOverlay = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(8px)',
  zIndex: 10,
  borderRadius: theme.shape.borderRadius,
}));

const BlurredContent = styled(Box)(({ theme }) => ({
  filter: 'blur(4px)',
  pointerEvents: 'none',
  userSelect: 'none',
}));

const GateContent = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(3),
  maxWidth: 400,
}));

const getGateConfig = (gateType: string) => {
  switch (gateType) {
    case 'pricing':
      return {
        title: 'Pricing Information',
        description: 'Sign in to view detailed pricing and rate information',
        icon: <LockIcon sx={{ fontSize: 48 }} />,
        ctaText: 'Sign In to View Pricing',
        upgradeText: 'Upgrade to Pro for Full Access'
      };
    case 'contact':
      return {
        title: 'Contact Information',
        description: 'Sign in to access contact details and send messages',
        icon: <LockIcon sx={{ fontSize: 48 }} />,
        ctaText: 'Sign In to Contact',
        upgradeText: 'Upgrade to Pro for Direct Contact'
      };
    case 'availability':
      return {
        title: 'Availability Calendar',
        description: 'Sign in to view real-time availability and book appointments',
        icon: <LockIcon sx={{ fontSize: 48 }} />,
        ctaText: 'Sign In to View Availability',
        upgradeText: 'Upgrade to Pro for Full Calendar Access'
      };
    case 'instagram':
      return {
        title: 'Instagram Feed',
        description: 'This professional\'s Instagram feed is available to Pro users only',
        icon: <UpgradeIcon sx={{ fontSize: 48 }} />,
        ctaText: 'Sign In to View',
        upgradeText: 'Upgrade to Pro to View Instagram'
      };
    case 'equipment':
      return {
        title: 'Equipment Details',
        description: 'Sign in to view detailed equipment specifications and availability',
        icon: <LockIcon sx={{ fontSize: 48 }} />,
        ctaText: 'Sign In to View Equipment',
        upgradeText: 'Upgrade to Pro for Full Equipment Access'
      };
    default:
      return {
        title: 'Premium Content',
        description: 'Sign in to access this content',
        icon: <LockIcon sx={{ fontSize: 48 }} />,
        ctaText: 'Sign In',
        upgradeText: 'Upgrade to Pro'
      };
  }
};

export const PrivacyGate: React.FC<PrivacyGateProps> = ({
  children,
  viewerPermissions,
  requiredPermission,
  gateType = 'contact',
  fallbackContent
}) => {
  const theme = useTheme();
  const hasPermission = viewerPermissions[requiredPermission];
  const gateConfig = getGateConfig(gateType);

  // If user has permission, render children normally
  if (hasPermission) {
    return <>{children}</>;
  }

  // If fallback content is provided, use it instead of gating
  if (fallbackContent) {
    return <>{fallbackContent}</>;
  }

  // Render gated content
  return (
    <GatedContainer>
      {/* Blurred content behind gate */}
      <BlurredContent>
        {children}
      </BlurredContent>
      
      {/* Gate overlay */}
      <GateOverlay elevation={3}>
        <GateContent spacing={2}>
          <Box sx={{ 
            color: theme.palette.text.secondary,
            opacity: 0.7 
          }}>
            {gateConfig.icon}
          </Box>
          
          <Typography variant="h6" component="h3" gutterBottom>
            {gateConfig.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {gateConfig.description}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => {
                // Navigate to sign in
                window.location.href = '/auth';
              }}
              aria-label={gateConfig.ctaText}
            >
              {gateConfig.ctaText}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<UpgradeIcon />}
              onClick={() => {
                // Navigate to upgrade flow
                console.log('Navigate to upgrade flow');
              }}
              aria-label={gateConfig.upgradeText}
            >
              Upgrade
            </Button>
          </Stack>
        </GateContent>
      </GateOverlay>
    </GatedContainer>
  );
};