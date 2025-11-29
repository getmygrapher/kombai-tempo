import React from 'react';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    LinearProgress,
    Typography,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';

interface UsageLimitBannerProps {
    feature: string;
    currentUsage: number;
    limitValue: number;
    remaining: number;
    onUpgrade?: () => void;
}

export const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({
    feature,
    currentUsage,
    limitValue,
    remaining,
    onUpgrade,
}) => {
    // Don't show for unlimited features
    if (limitValue === -1) {
        return null;
    }

    const percentage = (currentUsage / limitValue) * 100;
    const isAtLimit = remaining === 0;
    const isNearLimit = remaining <= 2 && remaining > 0;

    // Don't show if plenty of usage remaining
    if (!isAtLimit && !isNearLimit) {
        return null;
    }

    const getFeatureName = (feature: string) => {
        const featureNames: Record<string, string> = {
            job_posts_per_month: 'job posts',
            job_accepts_per_month: 'job accepts',
            messaging_limit: 'messages',
            portfolio_images: 'portfolio images',
        };
        return featureNames[feature] || feature;
    };

    const getSeverity = () => {
        if (isAtLimit) return 'error';
        if (isNearLimit) return 'warning';
        return 'info';
    };

    return (
        <Alert
            severity={getSeverity()}
            sx={{ mb: 2 }}
            action={
                onUpgrade && (
                    <Button
                        color="inherit"
                        size="small"
                        startIcon={<TrendingUpIcon />}
                        onClick={onUpgrade}
                    >
                        Upgrade to Pro
                    </Button>
                )
            }
        >
            <AlertTitle>
                {isAtLimit
                    ? `You've reached your ${getFeatureName(feature)} limit`
                    : `Almost at your ${getFeatureName(feature)} limit`}
            </AlertTitle>
            <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                        {currentUsage} of {limitValue} used
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                        {remaining} remaining
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={isAtLimit ? 'error' : 'warning'}
                    sx={{ height: 8, borderRadius: 1 }}
                />
            </Box>
            {isAtLimit && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Upgrade to Pro for unlimited {getFeatureName(feature)} and more features.
                </Typography>
            )}
        </Alert>
    );
};
