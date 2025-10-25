import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  Chip,
  Avatar,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import VerifiedIcon from '@mui/icons-material/Verified';
import { TierType } from '../../types/enums';
import { InstagramConnectionStatus } from '../../types/enums';
import { InstagramConnection } from '../../store/profileManagementStore';
import { useProfileManagementStore } from '../../store/profileManagementStore';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    zIndex: -1,
  }
}));

const ProBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: -8,
  right: 16,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
  fontSize: '0.75rem',
}));

const InstagramStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(2, 0),
}));

interface InstagramIntegrationProps {
  userTier: TierType;
  connection: InstagramConnection;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSync: () => Promise<void>;
}

export const InstagramIntegration: React.FC<InstagramIntegrationProps> = ({
  userTier,
  connection,
  onConnect,
  onDisconnect,
  onSync
}) => {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { isSaving } = useProfileManagementStore();

  const handleConnect = async () => {
    if (userTier !== TierType.PRO) {
      setShowUpgradeDialog(true);
      return;
    }

    setIsProcessing(true);
    try {
      await onConnect();
      setSuccessMessage('Instagram connected successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to connect Instagram. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    setIsProcessing(true);
    try {
      await onDisconnect();
      setShowDisconnectDialog(false);
      setSuccessMessage('Instagram disconnected successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to disconnect Instagram. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSync = async () => {
    setIsProcessing(true);
    try {
      await onSync();
      setSuccessMessage('Instagram data synced successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to sync Instagram data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: InstagramConnectionStatus): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case InstagramConnectionStatus.CONNECTED:
        return 'success';
      case InstagramConnectionStatus.CONNECTING:
        return 'warning';
      case InstagramConnectionStatus.ERROR:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: InstagramConnectionStatus): string => {
    switch (status) {
      case InstagramConnectionStatus.CONNECTED:
        return 'Connected';
      case InstagramConnectionStatus.CONNECTING:
        return 'Connecting...';
      case InstagramConnectionStatus.ERROR:
        return 'Connection Error';
      default:
        return 'Not Connected';
    }
  };

  const formatLastSync = (lastSync: string | null): string => {
    if (!lastSync) return 'Never synced';
    
    const syncDate = new Date(lastSync);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return syncDate.toLocaleDateString();
  };

  return (
    <>
      <StyledCard>
        {userTier === TierType.PRO && (
          <ProBadge label="PRO FEATURE" />
        )}
        
        <CardContent sx={{ color: 'text.primary' }}>
          <Stack spacing={2}>
            {/* Header */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'transparent' }}>
                <InstagramIcon sx={{ color: '#E4405F', fontSize: 32 }} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  Instagram Integration
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={getStatusLabel(connection.status)}
                    color={getStatusColor(connection.status)}
                    size="small"
                  />
                  {connection.status === InstagramConnectionStatus.CONNECTED && (
                    <VerifiedIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* Alerts */}
            {successMessage && (
              <Alert severity="success" onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error" onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            {/* Connected State */}
            {connection.status === InstagramConnectionStatus.CONNECTED && connection.handle && (
              <>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                    @{connection.handle.replace('@', '')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last synced: {formatLastSync(connection.lastSync)}
                  </Typography>
                </Box>

                <InstagramStats>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {connection.followers.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Followers
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {connection.posts.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Posts
                    </Typography>
                  </Box>
                </InstagramStats>

                <Divider />

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleSync}
                    disabled={(isProcessing || isSaving) as any}
                    size="small"
                  >
                    {isProcessing ? 'Syncing...' : 'Sync Data'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LinkOffIcon />}
                    onClick={() => setShowDisconnectDialog(true)}
                    disabled={(isProcessing || isSaving) as any}
                    size="small"
                  >
                    Disconnect
                  </Button>
                </Stack>
              </>
            )}

            {/* Not Connected State */}
            {connection.status === InstagramConnectionStatus.NOT_CONNECTED && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Connect your Instagram account to showcase your work and attract more clients.
                </Typography>

                <Box sx={{ bgcolor: 'info.main', color: 'info.contrastText', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Benefits of Instagram Integration:
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mb: 0 }}>
                    <li>Display your Instagram feed on your profile</li>
                    <li>Automatic portfolio updates from your posts</li>
                    <li>Show follower count and engagement metrics</li>
                    <li>Increase your professional credibility</li>
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<InstagramIcon />}
                  onClick={handleConnect}
                  disabled={(isProcessing || isSaving) as any}
                  fullWidth
                >
                  {isProcessing ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 1 }} />
                      Connecting...
                    </>
                  ) : (
                    'Connect Instagram'
                  )}
                </Button>

                {userTier !== TierType.PRO && (
                  <Alert severity="info">
                    Instagram integration is available for Pro members only.
                    <Button size="small" sx={{ ml: 1 }} onClick={() => setShowUpgradeDialog(true)}>
                      Upgrade Now
                    </Button>
                  </Alert>
                )}
              </>
            )}

            {/* Error State */}
            {connection.status === InstagramConnectionStatus.ERROR && (
              <>
                <Alert severity="error">
                  There was an error connecting to Instagram. Please try again or contact support if the problem persists.
                </Alert>
                
                <Button
                  variant="contained"
                  startIcon={<InstagramIcon />}
                  onClick={handleConnect}
                  disabled={(isProcessing || isSaving) as any}
                  fullWidth
                >
                  Retry Connection
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </StyledCard>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog as any} onClose={() => setShowUpgradeDialog(false)}>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <InstagramIcon color="secondary" />
            <Typography variant="h6">Upgrade to Pro Required</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Instagram integration is a premium feature available only to Pro members.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upgrade to Pro to connect your Instagram account and showcase your work to potential clients.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpgradeDialog(false)}>
            Maybe Later
          </Button>
          <Button variant="contained" color="secondary">
            Upgrade to Pro
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectDialog as any} onClose={() => setShowDisconnectDialog(false)}>
        <DialogTitle>Disconnect Instagram?</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to disconnect your Instagram account? This will:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1 }}>
            <li>Remove Instagram feed from your profile</li>
            <li>Stop automatic portfolio updates</li>
            <li>Hide follower count and metrics</li>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You can reconnect anytime from this page.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisconnectDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDisconnect} 
            color="error" 
            disabled={isProcessing as any}
          >
            {isProcessing ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};