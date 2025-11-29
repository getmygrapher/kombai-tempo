import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';
import { useSubscriptionStatus } from '../../hooks/useSubscription';

interface SubscriptionBadgeProps {
    size?: 'small' | 'medium';
    showDetails?: boolean;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({
    size = 'medium',
    showDetails = false,
}) => {
    const { subscription, isPro, isFree } = useSubscriptionStatus();

    if (!subscription) {
        return null;
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getExpiryText = () => {
        if (!subscription.endDate) return '';
        const daysUntilExpiry = Math.ceil(
            (new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilExpiry < 0) return 'Expired';
        if (daysUntilExpiry === 0) return 'Expires today';
        if (daysUntilExpiry === 1) return 'Expires tomorrow';
        if (daysUntilExpiry <= 7) return `Expires in ${daysUntilExpiry} days`;
        return `Expires ${formatDate(subscription.endDate)}`;
    };

    if (isPro) {
        const expiryText = getExpiryText();
        const isExpiringSoon = subscription.endDate
            ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7
            : false;

        return (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Pro Member - Verified">
                    <Chip
                        icon={<StarIcon />}
                        label="Pro"
                        color="primary"
                        size={size}
                        sx={{
                            fontWeight: 'bold',
                            '& .MuiChip-icon': {
                                color: 'inherit',
                            },
                        }}
                    />
                </Tooltip>
                {showDetails && expiryText && (
                    <Typography
                        variant="caption"
                        color={isExpiringSoon ? 'warning.main' : 'text.secondary'}
                    >
                        {expiryText}
                    </Typography>
                )}
            </Box>
        );
    }

    if (isFree) {
        return (
            <Tooltip title="Free Plan">
                <Chip
                    label="Free"
                    size={size}
                    variant="outlined"
                    sx={{
                        borderColor: 'text.secondary',
                        color: 'text.secondary',
                    }}
                />
            </Tooltip>
        );
    }

    return null;
};
