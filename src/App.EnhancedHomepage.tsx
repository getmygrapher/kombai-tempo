import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { EnhancedHomePage } from './components/homepage/EnhancedHomePage';
import { AppBottomNavigation } from './components/navigation/BottomNavigation';
import { useAppStore } from './store/appStore';

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
  const { setCurrentTab } = useAppStore();

  const handleJobDetails = (jobId: string) => {
    console.log('View job details:', jobId);
    // Navigate to job details
  };

  const handleJobApply = (jobId: string) => {
    console.log('Apply to job:', jobId);
    // Handle job application
  };

  const handleCreateJob = () => {
    console.log('Create new job');
    setCurrentTab('post-job');
  };

  const handleViewProfile = (professionalId: string) => {
    console.log('View profile:', professionalId);
    // Navigate to professional profile
  };

  const handleSendMessage = (professionalId: string) => {
    console.log('Send message to:', professionalId);
    setCurrentTab('messages');
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ pb: 7 }}> {/* Space for bottom navigation */}
          <EnhancedHomePage
            onJobDetails={handleJobDetails}
            onJobApply={handleJobApply}
            onCreateJob={handleCreateJob}
            onViewProfile={handleViewProfile}
            onSendMessage={handleSendMessage}
          />
        </Box>
        <AppBottomNavigation
          value="home"
          onChange={handleTabChange}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;