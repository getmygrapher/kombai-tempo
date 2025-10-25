import React from 'react';
import {
  Stack,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Job } from '../../../types';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

interface ReviewPublishStepProps {
  jobData: Partial<Job> | null;
  onEdit: (step: number) => void;
}

export const ReviewPublishStep: React.FC<ReviewPublishStepProps> = ({
  jobData,
  onEdit,
}) => {
  if (!jobData) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          No job data to review
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Review & Publish</Typography>
      <Typography variant="body2" color="text.secondary">
        Please review your job details before publishing
      </Typography>
      
      {/* Basic Information */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Basic Information</Typography>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(1)}
          >
            Edit
          </Button>
        </Stack>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Job Title
            </Typography>
            <Typography variant="body1">
              {jobData.title || 'Not specified'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>
            <Typography variant="body1">
              {jobData.type || 'Not specified'}
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Professional Types Needed
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {jobData.professionalTypesNeeded?.map((type, index) => (
                <Chip key={index} label={type} size="small" />
              )) || <Typography variant="body2" color="text.secondary">None specified</Typography>}
            </Stack>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {jobData.description || 'No description provided'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Schedule & Location */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Schedule & Location</Typography>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(2)}
          >
            Edit
          </Button>
        </Stack>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Date & Time
            </Typography>
            <Typography variant="body1">
              {jobData.date ? formatDateTime(new Date(jobData.date)) : 'Not specified'}
            </Typography>
            {jobData.endDate && (
              <Typography variant="body2" color="text.secondary">
                Ends: {formatDateTime(new Date(jobData.endDate))}
              </Typography>
            )}
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body1">
              {jobData.location?.address || 'Not specified'}
            </Typography>
            {jobData.location?.city && jobData.location?.state && (
              <Typography variant="body2" color="text.secondary">
                {jobData.location.city}, {jobData.location.state} - {jobData.location.pinCode}
              </Typography>
            )}
            {jobData.location?.venueDetails && (
              <Typography variant="body2" color="text.secondary">
                {jobData.location.venueDetails}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Budget & Requirements */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Budget & Requirements</Typography>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(3)}
          >
            Edit
          </Button>
        </Stack>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Budget Range
            </Typography>
            <Typography variant="body1">
              {jobData.budgetRange ? 
                `${formatCurrency(jobData.budgetRange.min)} - ${formatCurrency(jobData.budgetRange.max)}` :
                'Not specified'
              }
            </Typography>
            {jobData.budgetRange?.type && (
              <Typography variant="body2" color="text.secondary">
                Type: {jobData.budgetRange.type}
                {jobData.budgetRange.isNegotiable && ' (Negotiable)'}
              </Typography>
            )}
          </Box>
          
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Urgency Level
            </Typography>
            <Chip
              label={jobData.urgency || 'Not specified'}
              size="small"
              color={
                jobData.urgency === 'Emergency' ? 'error' :
                jobData.urgency === 'Urgent' ? 'warning' : 'default'
              }
            />
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          Once published, your job will be visible to professionals in your area. 
          You'll receive applications and can manage them from your dashboard.
        </Typography>
      </Box>
    </Stack>
  );
};