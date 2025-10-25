import React from 'react';
import {
  Container,
  Typography,
  Button,
  Stack,
  Box,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 500,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[50],
  marginBottom: theme.spacing(2),
}));

const WelcomeIcon = styled(HandshakeOutlinedIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const JoinButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
  color: 'white',
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: 24,
  boxShadow: '0px 8px 20px rgba(99, 102, 241, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #4338CA 0%, #BE185D 100%)',
    boxShadow: '0px 12px 24px rgba(99, 102, 241, 0.4)',
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease-in-out',
}));

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinue,
}) => {
  const features = [
    {
      icon: <PhotoCameraOutlinedIcon sx={{ fontSize: 24, color: 'primary.main' }} />,
      text: 'Connect with local opportunities'
    },
    {
      icon: <VideocamOutlinedIcon sx={{ fontSize: 24, color: 'primary.main' }} />,
      text: 'Showcase your professional portfolio'
    },
    {
      icon: <MicOutlinedIcon sx={{ fontSize: 24, color: 'primary.main' }} />,
      text: 'Build your creative network'
    }
  ];

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={3}>
        <Stack spacing={4} alignItems="center">
          {/* Welcome Icon */}
          <WelcomeIcon />
          
          {/* Main Heading */}
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              <span className="text-gradient">Welcome to GetMyGrapher</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              India's Leading Platform for Creative Professionals
            </Typography>
          </Box>

          {/* Features */}
          <Stack spacing={2} sx={{ width: '100%' }}>
            {features.map((feature, index) => (
              <FeatureBox key={index}>
                {feature.icon}
                <Typography variant="body1" fontWeight="medium">
                  {feature.text}
                </Typography>
              </FeatureBox>
            ))}
          </Stack>

          {/* Value Proposition */}
          <Box>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Join thousands of photographers, videographers, designers, and audio professionals 
              who are growing their careers with GetMyGrapher.
            </Typography>
          </Box>

          {/* CTA Button */}
          <JoinButton
            fullWidth
            size="large"
            onClick={onContinue}
          >
            Join as Professional
          </JoinButton>

          {/* Terms */}
          <Typography variant="caption" color="text.secondary" textAlign="center">
            By continuing, you agree to our{' '}
            <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
              Terms of Service
            </Typography>
            {' '}and{' '}
            <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
              Privacy Policy
            </Typography>
          </Typography>
        </Stack>
      </StyledPaper>
    </Container>
  );
};