import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Container } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { ProfileViewContainer } from './components/profile/ProfileViewContainer';
import { mockRootProps } from './data/profileViewMockData';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth={false} disableGutters>
          <ProfileViewContainer
            professionalId={mockRootProps.professionalId}
            viewMode={mockRootProps.viewMode}
            currentUserId={mockRootProps.currentUserId}
            onContactProfessional={mockRootProps.onContactProfessional}
            onBookProfessional={mockRootProps.onBookProfessional}
            onSaveProfile={mockRootProps.onSaveProfile}
            onShareProfile={mockRootProps.onShareProfile}
            onReportProfile={mockRootProps.onReportProfile}
          />
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;