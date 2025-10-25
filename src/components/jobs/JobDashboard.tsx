import React, { useState, useEffect } from 'react';
import {
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MoreVert,
  Edit,
  Delete,
  Visibility,
  People,
  Close,
  CheckCircle,
  Schedule,
  TrendingUp
} from '@mui/icons-material';
import { JobCard } from './JobCard';
import { Job } from '../../types';
import { JobStatus } from '../../types/enums';
import { useMyJobs } from '../../hooks/useJobs';
import { ApplicationStatusManager } from './ApplicationStatusManager';
import { useApplicationStore } from '../../store/applicationStore';

const TabPanel = (props: { children?: React.ReactNode; value: number; index: number }) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

export const JobDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplications, setShowApplications] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useMyJobs();

  const { getApplications } = useApplicationStore();

  useEffect(() => {
    if (jobsData?.jobs) {
      setJobs(jobsData.jobs);
    }
  }, [jobsData]);

  const handleJobMenuOpen = (event: React.MouseEvent<HTMLElement>, job: Job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleJobMenuClose = () => {
    setAnchorEl(null);
    setSelectedJob(null);
  };

  const handleViewApplications = () => {
    setShowApplications(true);
    handleJobMenuClose();
  };

  const handleEditJob = () => {
    // TODO: Navigate to job edit page
    console.log('Edit job:', selectedJob?.id);
    handleJobMenuClose();
  };

  const handleDeleteJob = () => {
    setJobToDelete(selectedJob);
    setDeleteDialogOpen(true);
    handleJobMenuClose();
  };

  const confirmDeleteJob = async () => {
    if (jobToDelete) {
      // TODO: Implement job deletion
      console.log('Delete job:', jobToDelete.id);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
      refetch();
    }
  };

  const handleCloseApplications = () => {
    setShowApplications(false);
    setSelectedJob(null);
  };

  const getJobStats = (job: Job) => {
    const applications = getApplications(job.id);
    const hiredCount = applications.filter(app => app.status === 'HIRED').length;
    const pendingCount = applications.filter(app => app.status === 'PENDING').length;
    const shortlistedCount = applications.filter(app => app.status === 'SHORTLISTED').length;
    
    return {
      total: applications.length,
      hired: hiredCount,
      pending: pendingCount,
      shortlisted: shortlistedCount
    };
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleJobDetails = (jobId: string) => {
    console.log('View job details:', jobId);
  };

  const handleJobEdit = (jobId: string) => {
    console.log('Edit job:', jobId);
  };

  const handleRefresh = () => {
    refetch();
  };

  const getJobsByStatus = (status?: JobStatus) => {
    if (!status) return jobs;
    return jobs.filter(job => job.status === status);
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.ACTIVE:
        return 'success';
      case JobStatus.DRAFT:
        return 'warning';
      case JobStatus.CLOSED:
        return 'info';
      case JobStatus.EXPIRED:
        return 'error';
      case JobStatus.COMPLETED:
        return 'primary';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={handleRefresh}>
          Retry
        </Button>
      }>
        Failed to load your jobs. Please try again.
      </Alert>
    );
  }

  const activeJobs = getJobsByStatus(JobStatus.ACTIVE);
  const draftJobs = getJobsByStatus(JobStatus.DRAFT);
  const closedJobs = getJobsByStatus(JobStatus.CLOSED);
  const allJobs = jobs;

  const tabs = [
    { label: `All (${allJobs.length})`, jobs: allJobs },
    { label: `Active (${activeJobs.length})`, jobs: activeJobs },
    { label: `Drafts (${draftJobs.length})`, jobs: draftJobs },
    { label: `Closed (${closedJobs.length})`, jobs: closedJobs },
  ];

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Typography variant="h6" gutterBottom>
          My Posted Jobs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and track your job postings
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={selectedTab} index={index}>
          {tab.jobs.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No jobs found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {index === 0 ? 'You haven\'t posted any jobs yet' : 
                 index === 1 ? 'No active jobs at the moment' :
                 index === 2 ? 'No draft jobs saved' :
                 'No closed jobs'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {tab.jobs.map((job) => {
                const stats = getJobStats(job);
                return (
                  <Card key={job.id} sx={{ position: 'relative' }}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flexGrow: 1 }}>
                          <JobCard
                            job={job}
                            showDistance={false as any}
                            showApplicantCount={true as any}
                            onViewDetails={handleJobDetails}
                            onApply={() => {}}
                            actionLabel=""
                          />
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {stats.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Applications
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={(e) => handleJobMenuOpen(e, job)}
                            size="small"
                          >
                            <MoreVert />
                          </IconButton>
                        </Stack>
                      </Stack>
                      
                      {stats.total > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Stack direction="row" spacing={2} justifyContent="center">
                            {stats.hired > 0 && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <CheckCircle color="success" fontSize="small" />
                                <Typography variant="caption" color="success.main">
                                  {stats.hired} Hired
                                </Typography>
                              </Stack>
                            )}
                            {stats.shortlisted > 0 && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Schedule color="warning" fontSize="small" />
                                <Typography variant="caption" color="warning.main">
                                  {stats.shortlisted} Shortlisted
                                </Typography>
                              </Stack>
                            )}
                            {stats.pending > 0 && (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <TrendingUp color="info" fontSize="small" />
                                <Typography variant="caption" color="info.main">
                                  {stats.pending} Pending
                                </Typography>
                              </Stack>
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </TabPanel>
      ))}

      {/* Job Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleJobMenuClose}
      >
        <MenuItem onClick={handleViewApplications}>
          <People sx={{ mr: 1 }} />
          View Applications
        </MenuItem>
        <MenuItem onClick={handleEditJob}>
          <Edit sx={{ mr: 1 }} />
          Edit Job
        </MenuItem>
        <MenuItem onClick={handleJobDetails(selectedJob?.id || '')}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteJob} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Job
        </MenuItem>
      </Menu>

      {/* Applications Dialog */}
      <Dialog
        open={showApplications}
        onClose={handleCloseApplications}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Applications for {selectedJob?.title}
            </Typography>
            <IconButton onClick={handleCloseApplications} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedJob && (
            <ApplicationStatusManager
              applications={getApplications(selectedJob.id)}
              jobId={selectedJob.id}
              onStatusChange={(applicationId, status) => {
                console.log('Application status changed:', applicationId, status);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Delete Job
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteJob}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};