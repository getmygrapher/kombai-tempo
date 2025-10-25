import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container, Stack, Button, Typography, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { EnhancedProfileViewContainer } from './components/profile/EnhancedProfileViewContainer';
import { EnhancedHomePage } from './components/home/EnhancedHomePage';
import { useAppStore } from './store/appStore';
import { useProfileViewStore } from './store/profileViewStore';
import { mockRootProps } from './data/profileViewSystemMockData';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  const { currentTab, setCurrentTab } = useAppStore();
  const { currentlyViewingProfile, setCurrentlyViewingProfile, clearProfileViewState } = useProfileViewStore();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);

  // Navigation handlers
  const handleNavigateToProfile = (professionalId: string) => {
    setSelectedProfessionalId(professionalId);
    setCurrentlyViewingProfile(professionalId);
    setCurrentTab('profile-view');
  };

  const handleNavigateToHome = () => {
    setSelectedProfessionalId(null);
    clearProfileViewState();
    setCurrentTab('home');
  };

  const handleJobDetails = (jobId: string) => {
    console.log('View job details:', jobId);
  };

  const handleJobApply = (jobId: string) => {
    console.log('Apply to job:', jobId);
  };

  const handleCreateJob = () => {
    console.log('Create new job');
  };

  // Profile view handlers
  const handleContactProfessional = (professionalId: string, method: string) => {
    console.log('Contact professional:', professionalId, 'via', method);
  };

  const handleBookProfessional = (professionalId: string) => {
    console.log('Book professional:', professionalId);
  };

  const handleSaveProfile = (professionalId: string) => {
    console.log('Save profile:', professionalId);
  };

  const handleShareProfile = (professionalId: string) => {
    console.log('Share profile:', professionalId);
  };

  const handleReportProfile = (professionalId: string) => {
    console.log('Report profile:', professionalId);
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'profile-view':
        return (
          <EnhancedProfileViewContainer
            professionalId={selectedProfessionalId || 'prof_123'}
            viewMode="detailed"
            currentUserId="user_456"
            onContactProfessional={handleContactProfessional}
            onBookProfessional={handleBookProfessional}
            onSaveProfile={handleSaveProfile}
            onShareProfile={handleShareProfile}
            onReportProfile={handleReportProfile}
          />
        );
      case 'home':
      default:
        return (
          <EnhancedHomePage
            onJobDetails={handleJobDetails}
            onJobApply={handleJobApply}
            onCreateJob={handleCreateJob}
            onViewProfile={handleNavigateToProfile}
          />
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
          {/* Navigation Header */}
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h5" fontWeight="bold" color="primary">
                GetMyGrapher
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={currentTab === 'home' ? 'contained' : 'outlined'}
                  onClick={handleNavigateToHome}
                  size="small"
                >
                  Home
                </Button>
                <Button
                  variant={currentTab === 'profile-view' ? 'contained' : 'outlined'}
                  onClick={() => handleNavigateToProfile('prof_123')}
                  size="small"
                >
                  Profile View
                </Button>
              </Stack>
            </Stack>
          </Container>

          {/* Main Content */}
          {renderCurrentView()}

          {/* Demo Info */}
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                Profile View System Demo - Navigate between Home and Profile views
              </Typography>
              <Typography variant="caption">
                Click on featured professionals in Home to view their profiles
              </Typography>
            </Box>
          </Container>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;