import React, { useState } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MoreVert,
  CheckCircle,
  Cancel,
  Schedule,
  Person,
  Message,
  Phone,
  Email
} from '@mui/icons-material';
import { Application, ApplicationStatus } from '../../types';
import { useApplicationStore } from '../../store/applicationStore';
import { formatDistance } from '../../utils/locationUtils';

interface ApplicationStatusManagerProps {
  applications: Application[];
  jobId: string;
  onStatusChange?: (applicationId: string, status: ApplicationStatus) => void;
}

const StatusChip = styled(Chip)(({ theme, color }) => ({
  fontWeight: 600,
  ...(color === 'success' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(color === 'error' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
  ...(color === 'warning' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(color === 'info' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  }),
}));

const ApplicationCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const getStatusColor = (status: ApplicationStatus): 'success' | 'error' | 'warning' | 'info' => {
  switch (status) {
    case 'HIRED':
      return 'success';
    case 'REJECTED':
    case 'WITHDRAWN':
      return 'error';
    case 'SHORTLISTED':
      return 'warning';
    case 'PENDING':
    case 'UNDER_REVIEW':
    default:
      return 'info';
  }
};

const getStatusIcon = (status: ApplicationStatus) => {
  switch (status) {
    case 'HIRED':
      return <CheckCircle />;
    case 'REJECTED':
      return <Cancel />;
    case 'SHORTLISTED':
      return <Schedule />;
    default:
      return <Person />;
  }
};

export const ApplicationStatusManager: React.FC<ApplicationStatusManagerProps> = ({
  applications,
  jobId,
  onStatusChange
}) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { updateApplicationStatus, isLoading } = useApplicationStore();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, application: Application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleStatusChange = (status: ApplicationStatus) => {
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication) return;

    setIsUpdating(true);
    try {
      const success = await updateApplicationStatus(selectedApplication.id, newStatus);
      if (success) {
        onStatusChange?.(selectedApplication.id, newStatus);
        setStatusDialogOpen(false);
        handleMenuClose();
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleContact = (method: 'message' | 'phone' | 'email') => {
    // TODO: Implement contact functionality
    console.log(`Contact ${selectedApplication?.applicant.name} via ${method}`);
  };

  const statusOptions: { value: ApplicationStatus; label: string; color: string }[] = [
    { value: 'UNDER_REVIEW', label: 'Under Review', color: 'info' },
    { value: 'SHORTLISTED', label: 'Shortlisted', color: 'warning' },
    { value: 'HIRED', label: 'Hired', color: 'success' },
    { value: 'REJECTED', label: 'Rejected', color: 'error' }
  ];

  if (applications.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No applications yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Applications will appear here when professionals apply to your job
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Applications ({applications.length})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {applications.filter(app => app.status === 'PENDING').length} pending
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {applications.map((application) => (
          <ApplicationCard key={application.id}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar
                  src={application.applicant.profilePhoto}
                  sx={{ width: 56, height: 56 }}
                />
                
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {application.applicant.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {application.applicant.professionalType}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {application.applicant.specializations.slice(0, 3).map((spec, index) => (
                          <Chip key={index} label={spec} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusChip
                        icon={getStatusIcon(application.status)}
                        label={application.status.replace('_', ' ')}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, application)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Application Message:
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: 'grey.50', 
                      p: 1, 
                      borderRadius: 1,
                      fontStyle: 'italic'
                    }}>
                      "{application.message}"
                    </Typography>
                  </Box>

                  {application.proposedRate && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Proposed Rate: ₹{application.proposedRate.toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      startIcon={<Message />}
                      onClick={() => handleContact('message')}
                    >
                      Message
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Phone />}
                      onClick={() => handleContact('phone')}
                    >
                      Call
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Email />}
                      onClick={() => handleContact('email')}
                    >
                      Email
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </ApplicationCard>
        ))}
      </Stack>

      {/* Status Change Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {statusOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            disabled={selectedApplication?.status === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Application Status
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>New Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                label="New Status"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status change..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={16} /> : null}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};