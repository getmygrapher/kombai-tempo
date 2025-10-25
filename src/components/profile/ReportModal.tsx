import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  FormControl,
  FormLabel,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ReportIcon from '@mui/icons-material/Report';
import { useReportProfile } from '../../hooks/useProfileView';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  professionalId: string;
  type?: 'profile' | 'content';
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    maxWidth: 500,
    width: '100%',
    margin: theme.spacing(2),
  },
}));

const reportReasons = [
  { value: 'inappropriate_content', label: 'Inappropriate content or images' },
  { value: 'fake_profile', label: 'Fake or misleading profile' },
  { value: 'spam', label: 'Spam or promotional content' },
  { value: 'harassment', label: 'Harassment or inappropriate behavior' },
  { value: 'copyright', label: 'Copyright infringement' },
  { value: 'pricing_issues', label: 'Misleading pricing or terms' },
  { value: 'other', label: 'Other (please specify)' }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  professionalId,
  type = 'profile'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const firstInputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  const reportMutation = useReportProfile();

  // Focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus first radio button after dialog opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    } else if (previousFocusRef.current) {
      // Return focus to trigger element
      previousFocusRef.current.focus();
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedReason('');
      setAdditionalDetails('');
      setShowSuccess(false);
    }
  }, [open]);

  const handleClose = () => {
    if (!reportMutation.isPending) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    try {
      await reportMutation.mutateAsync({
        professionalId,
        reason: selectedReason,
        details: additionalDetails
      });
      
      setShowSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const isFormValid = selectedReason !== '';
  const showOtherField = selectedReason === 'other';

  if (showSuccess) {
    return (
      <StyledDialog
        open={open as any}
        onClose={handleClose}
        aria-modal="true"
        aria-labelledby="report-success-title"
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <ReportIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Report Submitted
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thank you for your report. We'll review it and take appropriate action if needed.
          </Typography>
        </DialogContent>
      </StyledDialog>
    );
  }

  return (
    <StyledDialog
      open={open as any}
      onClose={handleClose}
      aria-modal="true"
      aria-labelledby="report-dialog-title"
      aria-describedby="report-dialog-description"
      fullScreen={isMobile as any}
    >
      <DialogTitle 
        id="report-dialog-title"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}
      >
        <Typography variant="h6" component="h2">
          Report Profile
        </Typography>
        <IconButton
          onClick={handleClose}
          aria-label="Close report dialog"
          size="small"
          disabled={reportMutation.isPending as any}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent id="report-dialog-description">
        <Stack spacing={3}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Help us maintain a safe community by reporting profiles that violate our guidelines.
          </Alert>

          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 2 }}>
              What's the issue with this profile?
            </FormLabel>
            <RadioGroup
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              aria-labelledby="report-reason-label"
            >
              {reportReasons.map((reason, index) => (
                <FormControlLabel
                  key={reason.value}
                  value={reason.value}
                  control={
                    <Radio 
                      inputRef={index === 0 ? firstInputRef : undefined}
                    />
                  }
                  label={reason.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {showOtherField && (
            <TextField
              label="Please specify the issue"
              multiline
              rows={3}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
              fullWidth
            />
          )}

          {selectedReason && selectedReason !== 'other' && (
            <TextField
              label="Additional details (optional)"
              multiline
              rows={3}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              placeholder="Any additional information that might be helpful..."
              fullWidth
            />
          )}

          {reportMutation.error && (
            <Alert severity="error">
              Failed to submit report. Please try again.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          disabled={reportMutation.isPending as any}
          sx={{ flex: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={(!isFormValid || reportMutation.isPending) as any}
          sx={{ flex: 1 }}
        >
          {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};