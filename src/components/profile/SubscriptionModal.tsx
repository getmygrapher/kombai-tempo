import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { paymentService } from '../../services/paymentService';
import { useAppStore } from '../../store/appStore';

interface SubscriptionModalProps {
    open: boolean;
    onClose: () => void;
}

const TIER_FEATURES = {
    free: [
        { text: '1 job post per month', included: true },
        { text: '1 job accept per month', included: true },
        { text: '25 km search radius', included: true },
        { text: '10 messages per month', included: true },
        { text: '5 portfolio images', included: true },
        { text: 'Calendar privacy', included: false },
        { text: 'Instagram integration', included: false },
        { text: 'Advanced search', included: false },
        { text: 'Priority support', included: false },
        { text: 'Verified badge', included: false },
        { text: 'Analytics dashboard', included: false },
    ],
    pro: [
        { text: 'Unlimited job posts', included: true },
        { text: 'Unlimited job accepts', included: true },
        { text: '500 km search radius', included: true },
        { text: 'Unlimited messaging', included: true },
        { text: 'Unlimited portfolio images', included: true },
        { text: 'Calendar privacy controls', included: true },
        { text: 'Instagram integration', included: true },
        { text: 'Advanced search filters', included: true },
        { text: 'Priority support', included: true },
        { text: 'Verified badge', included: true },
        { text: 'Analytics dashboard', included: true },
    ],
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose }) => {
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAppStore();

    const monthlyPrice = 299;
    const yearlyPrice = 2999;
    const yearlySavings = (monthlyPrice * 12 - yearlyPrice);

    const handleBillingPeriodChange = (_: React.MouseEvent<HTMLElement>, newPeriod: 'monthly' | 'yearly' | null) => {
        if (newPeriod) {
            setBillingPeriod(newPeriod);
        }
    };

    const handleUpgrade = async () => {
        if (!user) {
            setError('Please sign in to upgrade');
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Initiate Razorpay checkout
            await paymentService.initiateRazorpayCheckout(
                'pro',
                billingPeriod,
                user.email || '',
                (user as any).user_metadata?.full_name || 'User'
            );
            // Payment success will be handled by Razorpay callback
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
            setError(errorMessage);
            setProcessing(false);
        }
    };

    const currentPrice = billingPeriod === 'monthly' ? monthlyPrice : yearlyPrice;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold">
                    Upgrade to Pro
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Unlock unlimited features and grow your business
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Billing Period Toggle */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <ToggleButtonGroup
                        value={billingPeriod}
                        exclusive
                        onChange={handleBillingPeriodChange}
                        aria-label="billing period"
                    >
                        <ToggleButton value="monthly" aria-label="monthly">
                            Monthly
                        </ToggleButton>
                        <ToggleButton value="yearly" aria-label="yearly">
                            Yearly
                            <Chip
                                label={`Save ₹${yearlySavings}`}
                                size="small"
                                color="success"
                                sx={{ ml: 1 }}
                            />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Price Display */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                        ₹{currentPrice}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        per {billingPeriod === 'monthly' ? 'month' : 'year'}
                    </Typography>
                    {billingPeriod === 'yearly' && (
                        <Typography variant="caption" color="success.main">
                            That's only ₹{Math.round(yearlyPrice / 12)}/month
                        </Typography>
                    )}
                </Box>

                {/* Feature Comparison */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Free Tier */}
                    <Card variant="outlined" sx={{ flex: 1 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Free
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                ₹0
                            </Typography>
                            <List dense>
                                {TIER_FEATURES.free.map((feature, index) => (
                                    <ListItem key={index} disableGutters>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            {feature.included ? (
                                                <CheckIcon color="success" fontSize="small" />
                                            ) : (
                                                <CloseIcon color="disabled" fontSize="small" />
                                            )}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={feature.text}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                color: feature.included ? 'text.primary' : 'text.disabled',
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    {/* Pro Tier */}
                    <Card
                        variant="outlined"
                        sx={{
                            flex: 1,
                            borderColor: 'primary.main',
                            borderWidth: 2,
                            position: 'relative',
                        }}
                    >
                        <Chip
                            label="Recommended"
                            color="primary"
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: -12,
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }}
                        />
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Pro
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                ₹{currentPrice}
                            </Typography>
                            <List dense>
                                {TIER_FEATURES.pro.map((feature, index) => (
                                    <ListItem key={index} disableGutters>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <CheckIcon color="primary" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={feature.text}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                fontWeight: 500,
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={processing}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleUpgrade}
                    disabled={processing}
                    startIcon={processing && <CircularProgress size={16} />}
                >
                    {processing ? 'Processing...' : `Upgrade to Pro - ₹${currentPrice}`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
