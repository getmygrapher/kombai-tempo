import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, Container, Tabs, Tab, Stack, Typography, Fab } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import theme from './theme';
import { useAppStore } from './store/appStore';
import { JobFeed } from './components/jobs/JobFeed';
import { JobDashboard } from './components/jobs/JobDashboard';
import { JobCreationWizard } from './components/jobs/JobCreationWizard';

// Create a client
const queryClient = new QueryClient();

const TabPanel = (props: { children?: React.ReactNode; value: number; index: number }) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const JobPostingSystemApp: React.FC = () => {
  const { currentTab, setCurrentTab } = useAppStore();
  const [showJobCreation, setShowJobCreation] = useState(false);

  const tabValue = currentTab === 'jobs' ? 0 : currentTab === 'my-jobs' ? 1 : 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    const newTab = newValue === 0 ? 'jobs' : 'my-jobs';
    setCurrentTab(newTab);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <Stack spacing={3}>
              {/* Header */}
              <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  GetMyGrapher Jobs
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Discover opportunities and manage your job postings
                </Typography>
              </Box>

              {/* Navigation Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Discover Jobs" />
                  <Tab label="My Posted Jobs" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <TabPanel value={tabValue} index={0}>
                <JobFeed />
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <JobDashboard />
              </TabPanel>

              {/* Floating Action Button for Quick Job Creation */}
              <Fab
                color="primary"
                onClick={() => setShowJobCreation(true)}
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  right: 24,
                  zIndex: 1000,
                }}
              >
                <AddCircleOutlinedIcon />
              </Fab>

              {/* Job Creation Wizard */}
              <JobCreationWizard
                open={showJobCreation as any}
                onClose={() => setShowJobCreation(false)}
                onComplete={(job) => {
                  console.log('Job created:', job);
                  setCurrentTab('my-jobs');
                }}
              />
            </Stack>
          </Container>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default JobPostingSystemApp;