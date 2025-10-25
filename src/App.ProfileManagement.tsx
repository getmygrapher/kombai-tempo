import React, { useState } from 'react';
import { Box, ThemeProvider, CssBaseline, Container, Typography, Stack, Button, Paper } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import { ProfileEditPage } from './components/profile/ProfileEditPage';
import { PricingManager } from './components/profile/PricingManager';
import { PricingCard } from './components/profile/PricingCard';
import { PortfolioManager } from './components/profile/PortfolioManager';
import { InstagramIntegration } from './components/profile/InstagramIntegration';
import { PrivacySettings } from './components/profile/PrivacySettings';
import { VisibilityControls } from './components/profile/VisibilityControls';
import { ContactSettings } from './components/profile/ContactSettings';
import { ProfileAnalytics } from './components/profile/ProfileAnalytics';
import { ProfileValidation } from './components/profile/ProfileValidation';
import { ContactVerification } from './components/profile/ContactVerification';
import { useProfileManagementStore } from './store/profileManagementStore';
import { 
  mockUserProfile, 
  mockPricingData, 
  mockPortfolioData, 
  mockPrivacySettings,
  mockAnalyticsData,
  mockInstagramData,
  mockVerificationData,
  mockNotificationSettings
} from './data/profileManagementMockData';
import { TierType, VerificationStatus } from './types/enums';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [showContactVerification, setShowContactVerification] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'mobile'>('email');

  const {
    saveProfile,
    savePricing,
    savePortfolio,
    savePrivacy,
    connectInstagram,
    disconnectInstagram,
    syncInstagramData,
    submitVerification,
    portfolioState,
    instagramConnection,
    privacySettings,
    analytics
  } = useProfileManagementStore();

  const handleProfileSave = async (data: any) => {
    await saveProfile(data);
  };

  const handlePricingSave = async (pricing: any) => {
    await savePricing(pricing);
  };

  const handlePortfolioUpload = async (files: File[]) => {
    for (const file of files) {
      // Mock upload implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handlePortfolioReorder = async (items: any[]) => {
    await savePortfolio(items);
  };

  const handlePortfolioDelete = async (itemId: string) => {
    const updatedPortfolio = portfolioState.filter(item => item.id !== itemId);
    await savePortfolio(updatedPortfolio);
  };

  const handlePortfolioUpdateCaption = async (itemId: string, caption: string) => {
    const updatedPortfolio = portfolioState.map(item =>
      item.id === itemId ? { ...item, caption } : item
    );
    await savePortfolio(updatedPortfolio);
  };

  const handlePrivacySave = async (settings: any) => {
    await savePrivacy(settings);
  };

  const handleNotificationSave = async (settings: any) => {
    // Mock notification settings save
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleVerificationComplete = (type: 'email' | 'mobile') => {
    setShowContactVerification(false);
    // Update verification status in store
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile-edit':
        return (
          <ProfileEditPage
            user={mockUserProfile}
            onSave={handleProfileSave}
            onCancel={() => setCurrentView('overview')}
          />
        );

      case 'pricing-manager':
        return (
          <PricingManager
            pricing={mockUserProfile.pricing}
            onSave={handlePricingSave}
            onCancel={() => setCurrentView('overview')}
          />
        );

      case 'pricing-card':
        return (
          <Container sx={{ py: 4 }}>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" gutterBottom>
                Pricing Card Preview
              </Typography>
              <PricingCard
                pricing={mockUserProfile.pricing!}
                additionalData={mockPricingData}
                showDetails={true}
              />
              <Button onClick={() => setCurrentView('overview')}>
                Back to Overview
              </Button>
            </Stack>
          </Container>
        );

      case 'portfolio-manager':
        return (
          <PortfolioManager
            portfolio={mockPortfolioData}
            onUpload={handlePortfolioUpload}
            onReorder={handlePortfolioReorder}
            onDelete={handlePortfolioDelete}
            onUpdateCaption={handlePortfolioUpdateCaption}
            onBack={() => setCurrentView('overview')}
          />
        );

      case 'instagram-integration':
        return (
          <Container sx={{ py: 4 }}>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" gutterBottom>
                Instagram Integration
              </Typography>
              <InstagramIntegration
                userTier={mockUserProfile.tier}
                connection={mockInstagramData}
                onConnect={connectInstagram}
                onDisconnect={disconnectInstagram}
                onSync={syncInstagramData}
              />
              <Button onClick={() => setCurrentView('overview')}>
                Back to Overview
              </Button>
            </Stack>
          </Container>
        );

      case 'privacy-settings':
        return (
          <PrivacySettings
            settings={mockPrivacySettings}
            notificationSettings={mockNotificationSettings}
            onSave={handlePrivacySave}
            onNotificationSave={handleNotificationSave}
            onCancel={() => setCurrentView('overview')}
          />
        );

      case 'visibility-controls':
        return (
          <Container sx={{ py: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                Visibility Controls
              </Typography>
              <Paper sx={{ p: 3 }}>
                <VisibilityControls
                  settings={mockPrivacySettings}
                  onChange={(settings) => console.log('Settings changed:', settings)}
                />
              </Paper>
              <Button onClick={() => setCurrentView('overview')}>
                Back to Overview
              </Button>
            </Stack>
          </Container>
        );

      case 'contact-settings':
        return (
          <Container sx={{ py: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" gutterBottom>
                Contact Settings
              </Typography>
              <Paper sx={{ p: 3 }}>
                <ContactSettings
                  settings={mockPrivacySettings}
                  onChange={(settings) => console.log('Settings changed:', settings)}
                />
              </Paper>
              <Button onClick={() => setCurrentView('overview')}>
                Back to Overview
              </Button>
            </Stack>
          </Container>
        );

      case 'analytics':
        return (
          <ProfileAnalytics
            analytics={mockAnalyticsData}
            dateRange={{ start: '2024-01-01', end: '2024-01-07' }}
            onDateRangeChange={(range) => console.log('Date range changed:', range)}
            onBack={() => setCurrentView('overview')}
          />
        );

      case 'validation':
        return (
          <ProfileValidation
            verificationData={mockVerificationData}
            onSubmitVerification={submitVerification}
            onBack={() => setCurrentView('overview')}
          />
        );

      default:
        return (
          <Container sx={{ py: 4 }}>
            <Stack spacing={4}>
              <Typography variant="h3" gutterBottom textAlign="center">
                Profile Management System
              </Typography>
              <Typography variant="body1" textAlign="center" color="text.secondary">
                Comprehensive profile management with all features and components
              </Typography>

              {/* Main Components */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Core Components
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setCurrentView('profile-edit')}
                  >
                    Profile Edit Page
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setCurrentView('pricing-manager')}
                  >
                    Pricing Manager
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setCurrentView('pricing-card')}
                  >
                    Pricing Card
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setCurrentView('portfolio-manager')}
                  >
                    Portfolio Manager
                  </Button>
                </Stack>
              </Paper>

              {/* Integration Components */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Integration & Social
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentView('instagram-integration')}
                  >
                    Instagram Integration
                  </Button>
                </Stack>
              </Paper>

              {/* Privacy & Settings */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Privacy & Settings
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentView('privacy-settings')}
                  >
                    Privacy Settings
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentView('visibility-controls')}
                  >
                    Visibility Controls
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentView('contact-settings')}
                  >
                    Contact Settings
                  </Button>
                </Stack>
              </Paper>

              {/* Analytics & Verification */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Analytics & Verification
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentView('analytics')}
                  >
                    Profile Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentView('validation')}
                  >
                    Profile Validation
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setVerificationType('email');
                      setShowContactVerification(true);
                    }}
                  >
                    Email Verification
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setVerificationType('mobile');
                      setShowContactVerification(true);
                    }}
                  >
                    Mobile Verification
                  </Button>
                </Stack>
              </Paper>

              {/* Features Overview */}
              <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h5" gutterBottom>
                  System Features
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">✅ Comprehensive profile editing with validation</Typography>
                  <Typography variant="body2">✅ Equipment management with categories and conditions</Typography>
                  <Typography variant="body2">✅ Pricing configuration with live preview</Typography>
                  <Typography variant="body2">✅ Portfolio management with drag-and-drop upload</Typography>
                  <Typography variant="body2">✅ Instagram integration for Pro users</Typography>
                  <Typography variant="body2">✅ Privacy settings with visibility controls</Typography>
                  <Typography variant="body2">✅ Analytics dashboard with charts and metrics</Typography>
                  <Typography variant="body2">✅ Profile and contact verification system</Typography>
                  <Typography variant="body2">✅ State management with optimistic updates</Typography>
                  <Typography variant="body2">✅ Mobile-responsive design with MUI v7</Typography>
                </Stack>
              </Paper>
            </Stack>
          </Container>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: 'background.default',
            }}
          >
            {renderCurrentView()}

            {/* Contact Verification Dialog */}
            <ContactVerification
              open={showContactVerification}
              onClose={() => setShowContactVerification(false)}
              verificationType={verificationType}
              contactInfo={verificationType === 'email' ? mockUserProfile.email : mockUserProfile.phone}
              currentStatus={mockVerificationData[verificationType]}
              onVerificationComplete={handleVerificationComplete}
            />
          </Box>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default App;