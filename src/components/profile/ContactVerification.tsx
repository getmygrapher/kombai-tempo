import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import VerifiedIcon from '@mui/icons-material/Verified';
import RefreshIcon from '@mui/icons-material/Refresh';
import { VerificationStatus } from '../../types/enums';

const OTPInput = styled(TextField)(({ theme }) => ({
  '& input': {
    textAlign: 'center',
    fontSize: '1.5rem',
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: '0.5em',
  }
}));

const CountdownText = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.primary.main,
}));

interface ContactVerificationProps {
  open: boolean;
  onClose: () => void;
  verificationType: 'email' | 'mobile';
  contactInfo: string;
  currentStatus: VerificationStatus;
  onVerificationComplete: (type: 'email' | 'mobile') => void;
}

export const ContactVerification: React.FC<ContactVerificationProps> = ({
  open,
  onClose,
  verificationType,
  contactInfo,
  currentStatus,
  onVerificationComplete
}) => {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep(currentStatus === VerificationStatus.NOT_VERIFIED ? 'send' : 'verify');
      setOtp('');
      setError('');
      setSuccess(false);
      setCountdown(0);
    }
  }, [open, currentStatus]);

  const handleSendOTP = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call to send OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success
      setStep('verify');
      setCountdown(60); // 60 second countdown
      
    } catch (error) {
      setError(`Failed to send OTP to your ${verificationType}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call to verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification (accept any 6-digit code)
      if (otp === '123456' || otp.length === 6) {
        setSuccess(true);
        onVerificationComplete(verificationType);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Invalid OTP. Please check and try again.');
      }
      
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setOtp('');
    setError('');
    await handleSendOTP();
  };

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getIcon = () => {
    return verificationType === 'email' ? <EmailIcon /> : <PhoneIcon />;
  };

  const getTitle = () => {
    return verificationType === 'email' ? 'Verify Email Address' : 'Verify Mobile Number';
  };

  const getDescription = () => {
    return verificationType === 'email' 
      ? 'We\'ll send a verification code to your email address'
      : 'We\'ll send a verification code via SMS to your mobile number';
  };

  const getMaskedContact = (contact: string): string => {
    if (verificationType === 'email') {
      const [username, domain] = contact.split('@');
      const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
      return `${maskedUsername}@${domain}`;
    } else {
      // Mask mobile number
      return contact.substring(0, 3) + '*'.repeat(6) + contact.substring(-2);
    }
  };

  return (
    <Dialog open={open as any} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          {getIcon()}
          <Typography variant="h6">
            {getTitle()}
          </Typography>
          {currentStatus === VerificationStatus.VERIFIED && (
            <Chip
              icon={<VerifiedIcon />}
              label="Verified"
              color="success"
              size="small"
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Success State */}
          {success && (
            <Alert severity="success" icon={<VerifiedIcon />}>
              <Typography variant="body2">
                Your {verificationType} has been successfully verified!
              </Typography>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Send OTP Step */}
          {step === 'send' && !success && (
            <>
              <Typography variant="body1">
                {getDescription()}
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {verificationType === 'email' ? 'Email Address:' : 'Mobile Number:'}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {contactInfo}
                </Typography>
              </Box>

              <Alert severity="info">
                <Typography variant="body2">
                  Make sure you have access to this {verificationType} to receive the verification code.
                </Typography>
              </Alert>
            </>
          )}

          {/* Verify OTP Step */}
          {step === 'verify' && !success && (
            <>
              <Typography variant="body1">
                Enter the 6-digit verification code sent to:
              </Typography>
              
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body1" fontWeight="medium" color="primary.contrastText">
                  {getMaskedContact(contactInfo)}
                </Typography>
              </Box>

              <OTPInput
                label="Verification Code"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setOtp(value);
                  setError('');
                }}
                placeholder="000000"
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*',
                }}
                fullWidth
              />

              <Divider />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Didn't receive the code?
                </Typography>
                
                {countdown > 0 ? (
                  <CountdownText variant="body2">
                    Resend code in {formatCountdown(countdown)}
                  </CountdownText>
                ) : (
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={handleResendOTP}
                    disabled={isLoading as any}
                    size="small"
                  >
                    Resend Code
                  </Button>
                )}
              </Box>

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Demo Note:</strong> For testing purposes, use code <strong>123456</strong> 
                  or any 6-digit number to verify.
                </Typography>
              </Alert>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading as any}>
          Cancel
        </Button>
        
        {step === 'send' && !success && (
          <Button
            onClick={handleSendOTP}
            variant="contained"
            disabled={isLoading as any}
            startIcon={isLoading ? <CircularProgress size={16} /> : getIcon()}
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        )}
        
        {step === 'verify' && !success && (
          <Button
            onClick={handleVerifyOTP}
            variant="contained"
            disabled={(isLoading || otp.length !== 6) as any}
            startIcon={isLoading ? <CircularProgress size={16} /> : <VerifiedIcon />}
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};