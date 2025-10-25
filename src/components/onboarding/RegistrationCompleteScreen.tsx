import React from 'react';
import {
  Container,
  Typography,
  Button,
  Stack,
  Box,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { User } from '../../types';

interface RegistrationCompleteScreenProps {
  user: User;
  onContinue: () => void;
}

const CelebrationContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
  borderRadius: 24,
}));

const SuccessIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.success.main,
  marginBottom: theme.spacing(2),
}));

const ContinueButton = styled(Button)(({ theme }) => ({
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

export const RegistrationCompleteScreen: React.FC<RegistrationCompleteScreenProps> = ({
  user,
  onContinue,
}) => {
  return (
    <Container maxWidth="sm">
      <CelebrationContainer>
        <Stack spacing={4} alignItems="center">
          {/* Success Icon */}
          <SuccessIcon />
          
          {/* Celebration */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CelebrationIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h3" fontWeight="bold">
              <span className="text-gradient">Welcome to GetMyGrapher!</span>
            </Typography>
            <CelebrationIcon sx={{ color: 'secondary.main' }} />
          </Box>

          {/* User Info */}
          <Card sx={{ width: '100%', textAlign: 'center' }}>
            <CardContent>
              <Avatar
                src={user.profilePhoto}
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.professionalType} • {user.location.city}
              </Typography>
              <Typography variant="body2" color="success.main">
                Registration Complete ✓
              </Typography>
            </CardContent>
          </Card>

          {/* Success Message */}
          <Box>
            <Typography variant="h6" gutterBottom>
              🎉 Congratulations!
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Your professional profile has been created successfully. 
              You can now start connecting with clients and growing your business.
            </Typography>
          </Box>

          {/* Next Steps */}
          <Card sx={{ width: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                What's Next?
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  • Browse available jobs in your area
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Complete your portfolio and showcase your work
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Set up your availability calendar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Start connecting with potential clients
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <ContinueButton
            fullWidth
            size="large"
            onClick={onContinue}
          >
            Start Exploring
          </ContinueButton>
        </Stack>
      </CelebrationContainer>
    </Container>
  );
};