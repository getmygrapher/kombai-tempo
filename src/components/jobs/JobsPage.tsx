import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import { JobFeed } from './JobFeed';
import { JobDashboard } from './JobDashboard';
import { JobCreationWizard } from './JobCreationWizard';
import { useAppStore } from '../../store/appStore';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
}));

const TabPanel = (props: { children?: React.ReactNode; value: number; index: number }) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`jobs-tabpanel-${index}`}
      aria-labelledby={`jobs-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const FabContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10),
  right: theme.spacing(2),
  zIndex: 1000,
  [theme.breakpoints.up('sm')]: {
    bottom: theme.spacing(3),
  },
}));

export const JobsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [showJobCreation, setShowJobCreation] = useState(false);
  const { user } = useAppStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleJobCreated = () => {
    setShowJobCreation(false);
    // Refresh the current tab data
    if (selectedTab === 1) {
      // If on "My Jobs" tab, it will automatically refresh
    }
  };

  const tabs = [
    { label: 'Browse Jobs', value: 0 },
    { label: 'My Jobs', value: 1 },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Jobs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedTab === 0 
            ? 'Discover opportunities near you'
            : 'Manage your posted jobs'
          }
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <StyledTabs 
          value={selectedTab} 
          onChange={handleTabChange}
          variant={isMobile ? 'fullWidth' : 'standard'}
        >
          {tabs.map((tab) => (
            <Tab 
              key={tab.value}
              label={tab.label}
              id={`jobs-tab-${tab.value}`}
              aria-controls={`jobs-tabpanel-${tab.value}`}
            />
          ))}
        </StyledTabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <TabPanel value={selectedTab} index={0}>
          <JobFeed />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <JobDashboard />
          </Box>
        </TabPanel>
      </Box>

      {/* Floating Action Button */}
      <FabContainer>
        <Fab
          color="primary"
          onClick={() => setShowJobCreation(true)}
          sx={{ 
            boxShadow: 3,
            '&:hover': {
              transform: 'scale(1.05)',
            },
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          <AddIcon />
        </Fab>
      </FabContainer>

      {/* Job Creation Wizard */}
      <JobCreationWizard
        open={showJobCreation as any}
        onClose={() => setShowJobCreation(false)}
        onComplete={handleJobCreated}
      />
    </Box>
  );
};