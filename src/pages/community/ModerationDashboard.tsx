import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Drawer,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { 
  ModerationSubmission, 
  ModerationStatus, 
  ModerationAction 
} from '../../types/community';
import { 
  formatModerationStatus, 
  formatTimeAgo 
} from '../../utils/communityFormatters';
import { communityService } from '../../services/communityService';
import { useCommunityStore } from '../../store/communityStore';
import communityTheme from '../../theme/communityTheme';

interface ModerationDashboardProps {
  isModerator: boolean;
  onNavigateBack?: () => void;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const StatusChip = styled(Chip)<{ status: ModerationStatus }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case ModerationStatus.PENDING:
        return {
          bg: communityTheme.community.warning.background,
          color: communityTheme.community.warning.main
        };
      case ModerationStatus.APPROVED:
        return {
          bg: communityTheme.community.success.background,
          color: communityTheme.community.success.main
        };
      case ModerationStatus.REJECTED:
        return {
          bg: communityTheme.community.error.background,
          color: communityTheme.community.error.main
        };
      case ModerationStatus.FLAGGED:
        return {
          bg: communityTheme.community.error.background,
          color: communityTheme.community.error.main
        };
      default:
        return {
          bg: theme.palette.grey[100],
          color: theme.palette.grey[700]
        };
    }
  };

  const colors = getStatusColor();
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    borderRadius: communityTheme.layout.chipBorderRadius,
  };
});

const SubmissionImage = styled('img')(() => ({
  width: 80,
  height: 80,
  borderRadius: communityTheme.layout.cardBorderRadius,
  objectFit: 'cover',
}));

const DetailDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing(2),
  },
}));

const DetailImage = styled('img')(() => ({
  width: '100%',
  maxHeight: 300,
  borderRadius: communityTheme.layout.cardBorderRadius,
  objectFit: 'cover',
}));

export const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  isModerator,
  // onNavigateBack intentionally unused
}) => {
  const [submissions, setSubmissions] = useState<ModerationSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ModerationSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const { setModerationQueue, updateSubmissionStatus } = useCommunityStore();

  useEffect(() => {
    if (isModerator) {
      loadModerationQueue();
    }
  }, [isModerator]);

  // Real-time subscription for moderation queue updates
  useEffect(() => {
    if (!isModerator) return;
    const unsubscribe = communityService.subscribeToModeration((incoming: ModerationSubmission) => {
      setSubmissions(prev => {
        const exists = prev.find(s => s.id === incoming.id);
        const next = exists
          ? prev.map(s => (s.id === incoming.id ? { ...s, ...incoming } : s))
          : [incoming, ...prev];
        setModerationQueue(next);
        return next;
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isModerator, setModerationQueue]);

  const loadModerationQueue = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await communityService.getModerationQueue();
      setSubmissions(response.submissions);
      setModerationQueue(response.submissions);
    } catch {
      setError('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSelect = (submission: ModerationSubmission) => {
    setSelectedSubmission(submission);
    setFeedback('');
  };

  const handleCloseDetail = () => {
    setSelectedSubmission(null);
    setFeedback('');
  };

  const handleModerationAction = async (action: ModerationAction) => {
    if (!selectedSubmission) return;

    setActionLoading(true);
    
    try {
      await communityService.reviewPose(
        selectedSubmission.pose_id, 
        action, 
        feedback || undefined
      );

      // Update local state
      const newStatus = action === ModerationAction.APPROVE 
        ? ModerationStatus.APPROVED 
        : action === ModerationAction.REJECT 
        ? ModerationStatus.REJECTED 
        : ModerationStatus.FLAGGED;

      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === selectedSubmission.id 
            ? { ...sub, status: newStatus, feedback }
            : sub
        )
      );
      // Mirror to global store
      updateSubmissionStatus(selectedSubmission.id, newStatus);

      handleCloseDetail();
    } catch {
      setError('Failed to update submission status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isModerator) {
    return (
      <StyledContainer>
        <Alert severity="warning">
          You don't have permission to access the moderation dashboard.
        </Alert>
      </StyledContainer>
    );
  }

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  return (
    <>
      <StyledContainer>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Moderation Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review and moderate community pose submissions
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Card sx={{ borderRadius: communityTheme.layout.cardBorderRadius }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Submission Queue ({submissions.length})
              </Typography>
              
              {submissions.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No submissions pending review
                  </Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {submissions.map((submission, index) => (
                    <React.Fragment key={submission.id}>
                      <ListItem
                        component="button"
                        onClick={() => handleSubmissionSelect(submission)}
                        sx={{ 
                          borderRadius: communityTheme.layout.cardBorderRadius,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ width: 60, height: 60 }}>
                            <SubmissionImage
                              src={submission.image_url}
                              alt={submission.title}
                            />
                          </Avatar>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {submission.title}
                              </Typography>
                              <StatusChip
                                status={submission.status}
                                label={formatModerationStatus(submission.status)}
                                size="small"
                              />
                            </Stack>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              Submitted {formatTimeAgo(submission.submitted_at)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      
                      {index < submissions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Stack>
      </StyledContainer>

      {/* Detail Drawer */}
      <DetailDrawer
        anchor="right"
        open={!!selectedSubmission}
        onClose={handleCloseDetail}
      >
        {selectedSubmission && (
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={600}>
                Review Submission
              </Typography>
              <IconButton onClick={handleCloseDetail}>
                <CloseIcon />
              </IconButton>
            </Box>

            <DetailImage
              src={selectedSubmission.image_url}
              alt={selectedSubmission.title}
            />

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Typography variant="h6" fontWeight={600}>
                  {selectedSubmission.title}
                </Typography>
                <StatusChip
                  status={selectedSubmission.status}
                  label={formatModerationStatus(selectedSubmission.status)}
                  size="small"
                />
              </Stack>
              
              <Typography variant="body2" color="text.secondary">
                Submitted {formatTimeAgo(selectedSubmission.submitted_at)}
              </Typography>
            </Box>

            <TextField
              label="Feedback (Optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Provide feedback for the contributor..."
            />

            <Stack spacing={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlinedIcon />}
                onClick={() => handleModerationAction(ModerationAction.APPROVE)}
                disabled={(actionLoading || selectedSubmission.status !== ModerationStatus.PENDING) as any}
                sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
              >
                Approve
              </Button>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => handleModerationAction(ModerationAction.REJECT)}
                disabled={(actionLoading || selectedSubmission.status !== ModerationStatus.PENDING) as any}
                sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
              >
                Reject
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                startIcon={<FlagOutlinedIcon />}
                onClick={() => handleModerationAction(ModerationAction.FLAG)}
                disabled={actionLoading as any}
                sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
              >
                Flag for Review
              </Button>
            </Stack>

            {selectedSubmission.feedback && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Previous Feedback:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedSubmission.feedback}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </DetailDrawer>
    </>
  );
};