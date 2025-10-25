import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Box,
  IconButton,
  Alert,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { Job } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ApplicationDialogProps {
  job: Job;
  open: boolean;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: '500px',
    width: '100%',
    margin: theme.spacing(2),
  },
}));

export const ApplicationDialog: React.FC<ApplicationDialogProps> = ({
  job,
  open,
  onClose,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful application
      const applicationId = `app_${Date.now()}`;
      onSuccess(applicationId);
      
      // Reset form
      setMessage('');
      setProposedRate('');
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Apply for Job
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          {/* Job Summary */}
          <Box
            sx={{
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 2,
              border: 1,
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Budget: {formatCurrency(job.budgetRange.min)} - {formatCurrency(job.budgetRange.max)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Location: {job.location.city}, {job.location.state}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          {/* Application Message */}
          <TextField
            label="Cover Message"
            multiline
            rows={4}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the client why you're the right fit for this job..."
            helperText={`${message.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
            required
          />

          {/* Proposed Rate (Optional) */}
          {job.budgetRange.isNegotiable && (
            <TextField
              label="Proposed Rate (Optional)"
              fullWidth
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              placeholder="Enter your proposed rate"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              helperText="Leave blank to accept the posted budget range"
              type="number"
            />
          )}

          <Typography variant="body2" color="text.secondary">
            Your application will be sent to {job.postedBy.name}. They will be able to view your profile and contact you if interested.
          </Typography>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || !message.trim()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};