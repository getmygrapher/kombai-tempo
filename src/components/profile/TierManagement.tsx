import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Card,
  CardContent,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { TierType } from '../../types/enums';
import { User, TierBenefits } from '../../types';
import { mockTierBenefits, formatTierBenefit } from '../../data/profileManagementMockData';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const TierCard = styled(Card)<{ isActive?: boolean; isPro?: boolean }>(({ theme, isActive, isPro }) => ({
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  border: isActive ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
  background: isPro 
    ? `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.primary.main}15 100%)`
    : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  }
}));

const ProBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -10,
  right: 20,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  padding: '4px 16px',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: theme.typography.fontWeightBold,
  textTransform: 'uppercase',
}));

const PriceBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

interface TierManagementProps {
  user: User;
  onUpgrade: () => void;
  onManageSubscription: () => void;
  onBack: () => void;
}

export const TierManagement: React.FC<TierManagementProps> = ({
  user,
  onUpgrade,
  onManageSubscription,
  onBack
}) => {
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      await onUpgrade();
      setSuccessMessage('Successfully upgraded to Pro! Welcome to premium features.');
      setIsUpgradeDialogOpen(false);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  const renderBenefitsList = (benefits: string[], isPro: boolean) => (
    <List dense>
      {benefits.map((benefit, index) => (
        <ListItem key={index} sx={{ py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            {isPro ? (
              <CheckCircleOutlineIcon sx={{ fontSize: 20, color: 'success.main' }} />
            ) : (
              <CancelOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isPro ? 'text.primary' : 'text.disabled',
                  textDecoration: isPro ? 'none' : 'line-through'
                }}
              >
                {benefit}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button onClick={onBack} sx={{ mb: 2 }}>
            ← Back to Profile
          </Button>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Tier Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your subscription and explore premium features
          </Typography>
        </Box>

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Current Tier Status */}
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <StarOutlinedIcon 
              sx={{ 
                fontSize: 32, 
                color: user.tier === TierType.PRO ? 'secondary.main' : 'text.secondary' 
              }} 
            />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Current Tier: {user.tier}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.tier === TierType.PRO 
                  ? 'You have access to all premium features'
                  : 'Upgrade to unlock premium features'
                }
              </Typography>
            </Box>
          </Stack>

          {user.tier === TierType.PRO && (
            <Button
              variant="outlined"
              onClick={onManageSubscription}
              sx={{ mt: 2 }}
            >
              Manage Subscription
            </Button>
          )}
        </Paper>

        {/* Tier Comparison */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Choose Your Plan
          </Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* Free Tier */}
            <TierCard isActive={user.tier === TierType.FREE}>
              <CardContent sx={{ p: 3 }}>
                <PriceBox>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    Free
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Basic features
                  </Typography>
                </PriceBox>

                <Divider sx={{ mb: 2 }} />

                {renderBenefitsList(mockTierBenefits.free, true)}

                {user.tier === TierType.FREE ? (
                  <Chip 
                    label="Current Plan" 
                    color="primary" 
                    sx={{ mt: 2, width: '100%' }} 
                  />
                ) : (
                  <Button
                    variant="outlined"
                    disabled={true as any}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    Current Plan
                  </Button>
                )}
              </CardContent>
            </TierCard>

            {/* Pro Tier */}
            <TierCard isActive={user.tier === TierType.PRO} isPro>
              <ProBadge>Most Popular</ProBadge>
              <CardContent sx={{ p: 3 }}>
                <PriceBox>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    ₹299
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per month
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    or ₹2999/year (save 17%)
                  </Typography>
                </PriceBox>

                <Divider sx={{ mb: 2 }} />

                {renderBenefitsList(mockTierBenefits.pro, true)}

                {user.tier === TierType.PRO ? (
                  <Chip 
                    label="Current Plan" 
                    color="secondary" 
                    sx={{ mt: 2, width: '100%' }} 
                  />
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setIsUpgradeDialogOpen(true)}
                    sx={{ mt: 2, width: '100%' }}
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </CardContent>
            </TierCard>
          </Stack>
        </Box>

        {/* Feature Comparison */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Feature Comparison
          </Typography>
          
          <Stack spacing={2}>
            {mockTierBenefits.pro.map((feature, index) => (
              <Stack key={index} direction="row" spacing={2} alignItems="center">
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2">
                    {feature}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                  {mockTierBenefits.free.includes(feature) ? (
                    <CheckCircleOutlineIcon sx={{ color: 'success.main' }} />
                  ) : (
                    <CancelOutlinedIcon sx={{ color: 'text.disabled' }} />
                  )}
                </Box>
                <Box sx={{ minWidth: 80, textAlign: 'center' }}>
                  <CheckCircleOutlineIcon sx={{ color: 'success.main' }} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>

        {/* Upgrade Confirmation Dialog */}
        <Dialog 
          open={isUpgradeDialogOpen as any} 
          onClose={() => setIsUpgradeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <StarOutlinedIcon color="secondary" />
              <Typography variant="h6">Upgrade to Pro</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="body1">
                You're about to upgrade to GetMyGrapher Pro for ₹299/month.
              </Typography>
              
              <Paper sx={{ p: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                  What you'll get immediately:
                </Typography>
                <List dense>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText primary="• Ad-free experience" />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText primary="• Unlimited job posts and applications" />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText primary="• Instagram integration" />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText primary="• Priority search placement" />
                  </ListItem>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText primary="• Advanced analytics dashboard" />
                  </ListItem>
                </List>
              </Paper>

              <Typography variant="body2" color="text.secondary">
                You can cancel anytime from your account settings. No long-term commitments.
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsUpgradeDialogOpen(false)}
              disabled={isProcessing as any}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpgrade}
              variant="contained"
              color="secondary"
              disabled={isProcessing as any}
            >
              {isProcessing ? 'Processing...' : 'Upgrade Now'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </StyledContainer>
  );
};