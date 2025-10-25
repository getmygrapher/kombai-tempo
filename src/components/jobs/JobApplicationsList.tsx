import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Stack,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useJobApplications, useUpdateApplicationStatus } from '../../hooks/useJobs';
import { Application } from '../../types';
import { ApplicationStatus } from '../../types/enums';
import { formatTimeAgo, formatCurrency } from '../../utils/formatters';
import { RatingDisplay } from '../common/RatingDisplay';

interface JobApplicationsListProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '800px',
    width: '100%',
    height: '80vh',
    margin: theme.spacing(2),
  }
}));

const ApplicationCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const TabPanel = (props: { children?: React.ReactNode; value: number; index: number }) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const statusTabs = [
  { label: 'All', status: null },
  { label: 'New', status: ApplicationStatus.PENDING },
  { label: 'Under Review', status: ApplicationStatus.UNDER_REVIEW },
  { label: 'Shortlisted', status: ApplicationStatus.SHORTLISTED },
  { label: 'Rejected', status: ApplicationStatus.REJECTED },
  { label: 'Hired', status: ApplicationStatus.HIRED },
];

export const JobApplicationsList: React.FC<JobApplicationsListProps> = ({
  jobId,
  open,
  onClose
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: applicationsData, isLoading, error } = useJobApplications(jobId);
  const updateStatusMutation = useUpdateApplicationStatus();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleStatusUpdate = async (applicationId: string, status: ApplicationStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ applicationId, status });
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'default';
      case ApplicationStatus.UNDER_REVIEW:
        return 'info';
      case ApplicationStatus.SHORTLISTED:
        return 'success';
      case ApplicationStatus.REJECTED:
        return 'error';
      case ApplicationStatus.HIRED:
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return 'New';
      case ApplicationStatus.UNDER_REVIEW:
        return 'Under Review';
      case ApplicationStatus.SHORTLISTED:
        return 'Shortlisted';
      case ApplicationStatus.REJECTED:
        return 'Rejected';
      case ApplicationStatus.HIRED:
        return 'Hired';
      default:
        return status;
    }
  };

  const filteredApplications = applicationsData?.applications?.filter(app => {
    const currentStatus = statusTabs[selectedTab].status;
    return currentStatus === null || app.status === currentStatus;
  }) || [];

  const renderApplicationCard = (application: Application) => (
    <ApplicationCard key={application.id}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <Avatar
                src={application.applicant.profilePhoto}
                sx={{ width: 48, height: 48 }}
              >
                {application.applicant.name.charAt(0)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {application.applicant.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {application.applicant.professionalType}
                </Typography>
                <RatingDisplay
                  rating={application.applicant.rating}
                  totalReviews={application.applicant.totalReviews}
                  showReviewCount={true as any}
                />
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={getStatusLabel(application.status)}
                color={getStatusColor(application.status) as any}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(new Date(application.appliedAt))}
              </Typography>
            </Stack>
          </Stack>

          {/* Application Message */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              {application.message}
            </Typography>
          </Box>

          {/* Proposed Rate */}
          {application.proposedRate && (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                Proposed Rate: {formatCurrency(application.proposedRate)}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          {application.status === ApplicationStatus.PENDING && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => handleStatusUpdate(application.id, ApplicationStatus.UNDER_REVIEW)}
              >
                Review
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => handleStatusUpdate(application.id, ApplicationStatus.SHORTLISTED)}
              >
                Shortlist
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => handleStatusUpdate(application.id, ApplicationStatus.REJECTED)}
              >
                Reject
              </Button>
            </Stack>
          )}

          {application.status === ApplicationStatus.SHORTLISTED && (
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleStatusUpdate(application.id, ApplicationStatus.HIRED)}
              >
                Hire
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<MessageOutlinedIcon />}
              >
                Message
              </Button>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </ApplicationCard>
  );

  return (
    <StyledDialog open={open as any} onClose={onClose}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Job Applications
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable">
            {statusTabs.map((tab, index) => (
              <Tab 
                key={index} 
                label={`${tab.label} ${filteredApplications.length > 0 ? `(${filteredApplications.length})` : ''}`} 
              />
            ))}
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {statusTabs.map((tab, index) => (
            <TabPanel key={index} value={selectedTab} index={index}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">
                  Failed to load applications. Please try again.
                </Alert>
              ) : filteredApplications.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No applications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tab.status === null 
                      ? "No one has applied to this job yet."
                      : `No ${tab.label.toLowerCase()} applications.`
                    }
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {filteredApplications.map(renderApplicationCard)}
                </Stack>
              )}
            </TabPanel>
          ))}
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};