import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  Divider,
  Box,
  Alert,
  Link,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import { User } from '../../types';
import { OnboardingStep } from '../../types/onboarding';
import { sessionManager } from '../../services/auth/session';
import { supabaseAuth } from '../../services/auth/supabaseAuth';
import { analyticsService } from '../../utils/analyticsEvents';
import { onboardingService } from '../../services/onboardingService';

interface AuthenticationScreenProps {
  onAuthSuccess: (user: User) => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(8),
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4285f4',
  color: 'white',
  '&:hover': {
    backgroundColor: '#357ae8',
  },
  padding: theme.spacing(1.5),
  fontSize: '1rem',
}));

export const AuthenticationScreen: React.FC<AuthenticationScreenProps> = ({
  onAuthSuccess,
}) => {
  const navigate = useNavigate();
  const [isEmailAuth, setIsEmailAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const stepToPath: Record<string, string> = {
    CATEGORY_SELECTION: '/onboarding/category',
    TYPE_SELECTION: '/onboarding/type',
    LOCATION_SETUP: '/onboarding/location',
    BASIC_PROFILE: '/onboarding/basic-profile',
    PROFESSIONAL_DETAILS: '/onboarding/professional-details',
    AVAILABILITY_SETUP: '/onboarding/availability',
    REGISTRATION_COMPLETE: '/home',
  };
  const pathForStep = (step?: string) => step ? (stepToPath[step] || '/onboarding/category') : '/onboarding/category';

  useEffect(() => {
    analyticsService.trackStepViewed(OnboardingStep.AUTHENTICATION);
    const { data: subscription } = supabaseAuth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const user = supabaseAuth.mapUserFromSession(session);
        if (user) {
          const expiresAtMs = (session.expires_at || 0) * 1000;
          sessionManager.storeSession({
            user,
            accessToken: session.access_token,
            refreshToken: session.refresh_token || '',
            expiresAt: expiresAtMs,
          });
          analyticsService.trackStepCompleted(OnboardingStep.AUTHENTICATION, {
            method: 'supabase',
            email: user.email,
          });
          onAuthSuccess(user);
          // Decide post-auth route based on onboarding status
          void (async () => {
            try {
              const status = await onboardingService.getStatus();
              const isCompleted = status?.status === 'completed' || status?.current_step === 'REGISTRATION_COMPLETE';
              if (isCompleted) {
                navigate('/home');
              } else {
                navigate(pathForStep(status?.current_step));
              }
            } catch {
              navigate('/onboarding/category');
            }
          })();
        }
      }
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [navigate, onAuthSuccess]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      analyticsService.trackAuthMethod('google');
      await supabaseAuth.signInWithGoogle();
      // Supabase will redirect; session handling occurs via onAuthStateChange
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to authenticate with Google';
      setError(errorMessage);
      analyticsService.trackValidationError(OnboardingStep.AUTHENTICATION, 'google_auth', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      analyticsService.trackAuthMethod(isSignUp ? 'email_signup' : 'email_login');
      if (isSignUp) {
        await supabaseAuth.signUpWithEmail(email, password);
        // Supabase sends verification email; prompt user
        setError('Check your email to verify your account.');
      } else {
        const { session } = await supabaseAuth.signInWithEmail(email, password);
        const user = supabaseAuth.mapUserFromSession(session || null);
        if (session && user) {
          sessionManager.storeSession({
            user,
            accessToken: session.access_token,
            refreshToken: session.refresh_token || '',
            expiresAt: (session.expires_at || 0) * 1000,
          });
          analyticsService.trackStepCompleted(OnboardingStep.AUTHENTICATION, {
            method: 'email',
            email,
          });
          onAuthSuccess(user);
          // Decide post-auth route based on onboarding status
          try {
            const status = await onboardingService.getStatus();
            const isCompleted = status?.status === 'completed' || status?.current_step === 'REGISTRATION_COMPLETE';
            if (isCompleted) {
              navigate('/home');
            } else {
              navigate(pathForStep(status?.current_step));
            }
          } catch {
            navigate('/onboarding/category');
          }
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || (isSignUp ? 'Sign up failed' : 'Invalid email or password');
      setError(errorMessage);
      analyticsService.trackValidationError(OnboardingStep.AUTHENTICATION, 'email_auth', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={3}>
        <Stack spacing={3} alignItems="center">
          {/* Logo and Title */}
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              <span className="text-gradient">GetMyGrapher</span>
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Find Creative Professionals Near You
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          )}

          {!isEmailAuth ? (
            <Stack spacing={2} sx={{ width: '100%' }}>
              {/* Google OAuth Button */}
              <GoogleButton
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
                onClick={handleGoogleAuth}
                disabled={loading as any}
              >
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </GoogleButton>

              <Divider>OR</Divider>

              {/* Email Option */}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setIsEmailAuth(true)}
              >
                Continue with Email
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ width: '100%' }} component="form" onSubmit={handleEmailAuth}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  variant="text"
                  onClick={() => setIsSignUp((s) => !s)}
                >
                  {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
                </Button>
                <Button
                  variant="text"
                  onClick={async () => {
                    if (!email) {
                      setError('Enter your email to reset password');
                      return;
                    }
                    try {
                      await supabaseAuth.requestPasswordReset(email);
                      setError('Password reset email sent. Check your inbox.');
                    } catch (err: any) {
                      setError(err.message || 'Failed to send reset email');
                    }
                  }}
                >
                  Forgot password?
                </Button>
              </Stack>
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading as any}
              >
                {loading ? (isSignUp ? 'Signing up...' : 'Signing in...') : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => setIsEmailAuth(false)}
              >
                Back to Google Sign In
              </Button>
            </Stack>
          )}

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ textAlign: 'center' }}
          >
            <Typography variant="caption" color="text.secondary">
              By signing in, you agree to our
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Link 
                href="#" 
                color="primary" 
                variant="caption"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Terms of Service
              </Link>
              <Typography variant="caption" color="text.disabled">and</Typography>
              <Link 
                href="#" 
                color="primary" 
                variant="caption"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Privacy Policy
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </StyledPaper>
    </Container>
  );
};