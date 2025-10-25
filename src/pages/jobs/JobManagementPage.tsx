import React from 'react';
import { Box, Typography, Stack, Fab } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { JobDashboard } from '../../components/jobs/JobDashboard';

export const JobManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateJob = () => {
    navigate('/jobs/new');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Jobs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your posted jobs and applications
        </Typography>
      </Box>

      {/* Job Dashboard */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <JobDashboard />
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={handleCreateJob}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Add />
      </Fab>
    </Box>
  );
};