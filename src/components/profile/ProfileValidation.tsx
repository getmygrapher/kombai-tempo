import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { VerificationStatus } from '../../types/enums';
import { VerificationData } from '../../store/profileManagementStore';
import { useProfileManagementStore } from '../../store/profileManagementStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const VerificationCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
}));

interface ProfileValidationProps {
  verificationData: VerificationData;
  onSubmitVerification: (type: string, data: any) => Promise<void>;
  onBack: () => void;
}

export const ProfileValidation: React.FC<ProfileValidationProps> = ({
  verificationData,
  onSubmitVerification,
  onBack
}) => {
  const [selectedVerificationType, setSelectedVerificationType] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { isSaving } = useProfileManagementStore();

  const getStatusColor = (status: VerificationStatus): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'success';
      case VerificationStatus.PENDING:
        return 'warning';
      case VerificationStatus.REJECTED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <VerifiedIcon color="success" />;
      case VerificationStatus.PENDING:
        return <PendingIcon color="warning" />;
      case VerificationStatus.REJECTED:
        return <ErrorIcon color="error" />;
      default:
        return <PhotoCameraIcon color="disabled" />;
    }
  };

  const getStatusLabel = (status: VerificationStatus): string => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'Verified';
      case VerificationStatus.PENDING:
        return 'Under Review';
      case VerificationStatus.REJECTED:
        return 'Rejected';
      default:
        return 'Not Started';
    }
  };

  const calculateCompletionPercentage = (): number => {
    const statuses = Object.values(verificationData);
    const completedCount = statuses.filter(status => status === VerificationStatus.VERIFIED).length;
    return (completedCount / statuses.length) * 100;
  };

  const handleStartVerification = (type: string) => {
    setSelectedVerificationType(type);
    setShowUploadDialog(true);
  };

  const handleSubmitVerification = async () => {
    if (!selectedVerificationType) return;

    setIsSubmitting(true);
    try {
      await onSubmitVerification(selectedVerificationType, {
        timestamp: new Date().toISOString(),
        type: selectedVerificationType
      });
      setSuccessMessage(`${selectedVerificationType} verification submitted successfully!`);
      setShowUploadDialog(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const verificationSteps = [
    {
      id: 'profilePhoto',
      title: 'Profile Photo Verification',
      description: 'Verify your identity with a clear profile photo',
      icon: <PhotoCameraIcon />,
      status: verificationData.profilePhoto,
      requirements: [
        'Clear, recent photo of yourself',
        'Good lighting and resolution',
        'Face clearly visible',
        'Professional appearance preferred'
      ],
      benefits: [
        'Increased client trust',
        'Higher profile visibility',
        'Professional credibility'
      ]
    },
    {
      id: 'documents',
      title: 'Document Verification',
      description: 'Upload government ID or professional certificates',
      icon: <DescriptionIcon />,
      status: verificationData.documents,
      requirements: [
        'Government-issued photo ID',
        'Professional certificates (optional)',
        'Business registration (if applicable)',
        'Clear, readable scans'
      ],
      benefits: [
        'Enhanced security badge',
        'Priority in search results',
        'Access to premium features'
      ]
    }
  ];

  const completionPercentage = calculateCompletionPercentage();

  return (
    <>
      <StyledContainer>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={onBack} 
              sx={{ mb: 2 }}
            >
              Back to Profile
            </Button>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Profile Verification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verify your profile to build trust with clients and unlock premium features
            </Typography>
          </Box>

          {/* Success Message */}
          {successMessage && (
            <Alert severity="success" onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Progress Overview */}
          <ProgressContainer>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="medium">
                Verification Progress
              </Typography>
              <Chip 
                label={`${Math.round(completionPercentage)}% Complete`}
                color={completionPercentage === 100 ? 'success' : 'primary'}
                variant="outlined"
              />
            </Stack>
            
            <LinearProgress 
              variant="determinate" 
              value={completionPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }} 
            />
            
            <Typography variant="body2" color="text.secondary">
              Complete all verification steps to unlock full platform benefits
            </Typography>
          </ProgressContainer>

          {/* Verification Steps */}
          {verificationSteps.map((step) => (
            <VerificationCard key={step.id}>
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                      {step.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="medium">
                          {step.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getStatusIcon(step.status)}
                          <Chip
                            label={getStatusLabel(step.status)}
                            color={getStatusColor(step.status)}
                            size="small"
                          />
                        </Stack>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {step.description}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Requirements and Benefits */}
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Requirements
                      </Typography>
                      <List dense>
                        {step.requirements.map((req, index) => (
                          <ListItem key={index} sx={{ py: 0, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" color="text.secondary">
                                  {req}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                        Benefits
                      </Typography>
                      <List dense>
                        {step.benefits.map((benefit, index) => (
                          <ListItem key={index} sx={{ py: 0, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" color="success.main">
                                  {benefit}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Stack>

                  {/* Action Button */}
                  <Box>
                    {step.status === VerificationStatus.NOT_VERIFIED && (
                      <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => handleStartVerification(step.id)}
                      >
                        Start Verification
                      </Button>
                    )}
                    
                    {step.status === VerificationStatus.PENDING && (
                      <Alert severity="info">
                        Your {step.title.toLowerCase()} is under review. We'll notify you once it's processed.
                      </Alert>
                    )}
                    
                    {step.status === VerificationStatus.VERIFIED && (
                      <Alert severity="success" icon={<VerifiedIcon />}>
                        Your {step.title.toLowerCase()} has been successfully verified!
                      </Alert>
                    )}
                    
                    {step.status === VerificationStatus.REJECTED && (
                      <Stack spacing={1}>
                        <Alert severity="error">
                          Your {step.title.toLowerCase()} was rejected. Please review the requirements and try again.
                        </Alert>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CloudUploadIcon />}
                          onClick={() => handleStartVerification(step.id)}
                        >
                          Resubmit Verification
                        </Button>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </VerificationCard>
          ))}

          {/* Verification Benefits */}
          <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" fontWeight="medium" gutterBottom>
              Why Verify Your Profile?
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Verified profiles receive significant advantages on our platform:
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>3x more profile views</li>
                  <li>Higher search ranking</li>
                  <li>Increased client trust</li>
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  <li>Access to premium jobs</li>
                  <li>Verified badge display</li>
                  <li>Priority customer support</li>
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </StyledContainer>

      {/* Upload Dialog */}
      <Dialog 
        open={showUploadDialog as any} 
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Verification Documents
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="info">
              This is a placeholder for the document upload interface. In the actual implementation, 
              you would integrate with a file upload service and document verification system.
            </Alert>
            
            <Typography variant="body2">
              Selected verification type: <strong>{selectedVerificationType}</strong>
            </Typography>
            
            <Box 
              sx={{ 
                p: 4, 
                border: '2px dashed', 
                borderColor: 'grey.300',
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: 'grey.50'
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Drag and drop your files here or click to browse
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitVerification}
            variant="contained"
            disabled={(isSubmitting || isSaving) as any}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};