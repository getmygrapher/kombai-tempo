import React, { useState, useEffect } from 'react';
import { Box, ThemeProvider, CssBaseline, Button, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Import community components
import { CommunityPosingLibrary } from './components/community/CommunityPosingLibrary';
import { CommunityLibraryPage } from './pages/community/CommunityLibraryPage';
import { PoseDetailPage } from './pages/community/PoseDetailPage';
import { ContributionWizard } from './pages/community/ContributionWizard';
import { ModerationDashboard } from './pages/community/ModerationDashboard';

// Import theme and data
import theme from './theme';
import { mockRootProps } from './data/communityPosingLibraryMockData';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const CommunityPosingLibraryApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <CommunityRouter />
          </BrowserRouter>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

const CommunityRouter: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPoseId, setSelectedPoseId] = useState<string | null>(null);

  const handlePoseSelect = (poseId: string) => {
    setSelectedPoseId(poseId);
    navigate(`/community/pose/${poseId}`);
  };

  const handleNavigateHome = () => {
    navigate('/community');
  };

  const handleNavigateToContribute = () => {
    navigate('/community/contribute');
  };

  const handleNavigateToModeration = () => {
    navigate('/community/moderation');
  };

  const handleContributionComplete = () => {
    navigate('/community');
  };

  const handleContributionCancel = () => {
    navigate('/community');
  };

  const handlePoseDetailClose = () => {
    setSelectedPoseId(null);
    navigate('/community');
  };

  const isDetailView = location.pathname.includes('/pose/');
  const isContributeView = location.pathname.includes('/contribute');
  const isModerationView = location.pathname.includes('/moderation');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navigation */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleNavigateHome}
            sx={{ mr: 2 }}
          >
            <HomeIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Community Posing Library
          </Typography>

          {!isDetailView && !isContributeView && !isModerationView && (
            <>
              <Button
                color="inherit"
                startIcon={<AddIcon />}
                onClick={handleNavigateToContribute}
                sx={{ mr: 1 }}
              >
                Contribute
              </Button>
              
              {mockRootProps.isModerator && (
                <Button
                  color="inherit"
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={handleNavigateToModeration}
                >
                  Moderate
                </Button>
              )}
            </>
          )}

          {(isDetailView || isContributeView || isModerationView) && (
            <IconButton
              color="inherit"
              onClick={handleNavigateHome}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/community" replace />} />
          
          {/* Community routes */}
          <Route 
            path="/community" 
            element={
              <CommunityPosingLibrary 
                onNavigateToBrowse={() => navigate('/community/browse')}
                onNavigateToContribute={handleNavigateToContribute}
                onNavigateToSaved={() => navigate('/community/saved')}
              />
            } 
          />
          
          <Route 
            path="/community/browse" 
            element={
              <CommunityLibraryPage 
                onPoseSelect={handlePoseSelect}
              />
            } 
          />
          
          <Route 
            path="/community/pose/:id" 
            element={
              <PoseDetailPage 
                poseId={selectedPoseId || location.pathname.split('/').pop() || ''}
                onClose={handlePoseDetailClose}
              />
            } 
          />
          
          <Route 
            path="/community/contribute" 
            element={
              <ContributionWizard 
                onComplete={handleContributionComplete}
                onCancel={handleContributionCancel}
              />
            } 
          />
          
          <Route 
            path="/community/moderation" 
            element={
              <ModerationDashboard 
                isModerator={mockRootProps.isModerator}
                onNavigateBack={handleNavigateHome}
              />
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/community" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default CommunityPosingLibraryApp;