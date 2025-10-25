import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { JobCreationWizard } from '../../components/jobs/JobCreationWizard';

export const JobCreationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleJobCreated = (job: any) => {
    console.log('Job created:', job);
    navigate('/jobs/manage');
  };

  const handleClose = () => {
    navigate('/jobs');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={handleClose} size="small">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            Post New Job
          </Typography>
        </Stack>
      </Box>

      {/* Job Creation Wizard */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <JobCreationWizard
          open={true}
          onClose={handleClose}
          onComplete={handleJobCreated}
          fullScreen={true}
        />
      </Box>
    </Box>
  );
};