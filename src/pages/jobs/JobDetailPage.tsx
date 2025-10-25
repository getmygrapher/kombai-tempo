import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Stack, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { JobDetailModal } from '../../components/jobs/JobDetailModal';
import { useJobStore } from '../../store/jobStore';

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJob, currentJob, isLoading, error } = useJobStore();

  React.useEffect(() => {
    if (jobId) {
      getJob(jobId);
    }
  }, [jobId, getJob]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading job details...</Typography>
      </Box>
    );
  }

  if (error || !currentJob) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Job not found'}
        </Alert>
        <IconButton onClick={() => navigate('/jobs')}>
          <ArrowBack />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ px: 2, pt: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/jobs')} size="small">
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            Job Details
          </Typography>
        </Stack>
      </Box>

      {/* Job Detail Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <JobDetailModal
          job={currentJob}
          open={true}
          onClose={() => navigate('/jobs')}
          showCloseButton={false}
        />
      </Box>
    </Box>
  );
};