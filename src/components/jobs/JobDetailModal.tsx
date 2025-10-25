import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  Box,
  Chip,
  Divider,
  Avatar,
  IconButton,
  TextField,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useJobDetails, useApplyToJob } from '../../hooks/useJobs';
import { formatJobDateTime, formatJobBudget, formatBudgetType } from '../../utils/formatters';
import { StatusChip } from '../common/StatusChip';
import { RatingDisplay } from '../common/RatingDisplay';
import { DistanceIndicator } from '../common/DistanceIndicator';
import { Job } from '../../types';

interface JobDetailModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
  showCloseButton?: boolean;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '600px',
    width: '100%',
    margin: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1),
      maxHeight: 'calc(100vh - 16px)'
    }
  }
}));

const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const PosterCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
}));

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  open,
  onClose,
  onApply,
  showCloseButton = true
}) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  
  const applyMutation = useApplyToJob();

  const handleApply = async () => {
    if (!applicationMessage.trim()) return;
    
    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        message: applicationMessage,
        proposedRate: proposedRate ? parseInt(proposedRate) : undefined
      });
      if (onApply) {
        onApply(job.id);
      }
      onClose();
    } catch (error) {
      console.error('Failed to apply:', error);
    }
  };


  return (
    <StyledDialog open={open as any} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flexGrow: 1, pr: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {job.title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <StatusChip status={job.urgency} />
              {job.professionalTypesNeeded.map((type, index) => (
                <Chip
                  key={index}
                  label={type}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Stack>
          </Box>
          {showCloseButton && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Job Details */}
          <Stack spacing={2}>
            <InfoRow>
              <CalendarMonthOutlinedIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {formatJobDateTime(new Date(job.date))}
                </Typography>
                {job.endDate && (
                  <Typography variant="caption" color="text.secondary">
                    Until {formatJobDateTime(new Date(job.endDate))}
                  </Typography>
                )}
              </Box>
            </InfoRow>

            <InfoRow>
              <LocationOnOutlinedIcon fontSize="small" color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {job.location.address}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {job.location.city}, {job.location.state} - {job.location.pinCode}
                </Typography>
                {job.distance && (
                  <Box sx={{ mt: 0.5 }}>
                    <DistanceIndicator
                      distance={job.distance}
                      location={job.location.city}
                    />
                  </Box>
                )}
                {job.location.venueDetails && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {job.location.venueDetails}
                  </Typography>
                )}
                {job.location.parkingAvailable && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                    ✓ Parking available
                  </Typography>
                )}
              </Box>
            </InfoRow>

            <InfoRow>
              <CurrencyRupeeOutlinedIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {formatJobBudget(job.budgetRange.min, job.budgetRange.max)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatBudgetType(job.budgetRange.type)}
                  {job.budgetRange.isNegotiable && ' • Negotiable'}
                </Typography>
              </Box>
            </InfoRow>
          </Stack>

          <Divider />

          {/* Description */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Job Description
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {job.description}
            </Typography>
          </Box>

          <Divider />

          {/* Posted By */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Posted By
            </Typography>
            <PosterCard>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>
                  <PersonOutlineIcon />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {job.postedBy.name}
                  </Typography>
                  <RatingDisplay
                rating={job.postedBy.rating}
                totalReviews={job.postedBy.totalJobs}
                showReviewCount={true}
              />
                </Box>
              </Stack>
            </PosterCard>
          </Box>

          {/* Application Form */}
          {showApplicationForm && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Apply for this Job
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Cover Message"
                  placeholder="Tell the client why you're the right fit for this job..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  required
                />
                {job.budgetRange.isNegotiable && (
                  <TextField
                    fullWidth
                    label="Your Proposed Rate (Optional)"
                    placeholder="Enter your rate"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    type="number"
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}

          {/* Job Stats */}
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Applications
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {job.applicants?.length || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Views
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {job.viewCount}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Posted
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatJobDateTime(new Date(job.createdAt))}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {!showApplicationForm ? (
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowApplicationForm(true)}
              sx={{ flexGrow: 1 }}
            >
              Apply Now
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
            <Button
              variant="outlined"
              onClick={() => setShowApplicationForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={(!applicationMessage.trim() || applyMutation.isPending) as any}
              sx={{ flexGrow: 1 }}
            >
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </StyledDialog>
  );
};