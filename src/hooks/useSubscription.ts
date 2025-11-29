import { useEffect } from 'react';
import { usePaymentStore } from '../store/paymentStore';
import { TierFeatures } from '../services/paymentService';

/**
 * Hook to get current subscription status
 */
export const useSubscriptionStatus = () => {
    const {
        subscription,
        subscriptionLoading,
        subscriptionError,
        fetchSubscription,
    } = usePaymentStore();

    useEffect(() => {
        if (!subscription && !subscriptionLoading) {
            fetchSubscription();
        }
    }, []);

    return {
        subscription,
        loading: subscriptionLoading,
        error: subscriptionError,
        refetch: fetchSubscription,
        isPro: subscription?.tier === 'pro' && subscription?.status === 'active',
        isFree: subscription?.tier === 'free' || !subscription,
    };
};

/**
 * Hook to handle subscription upgrades
 */
export const useUpgradeSubscription = () => {
    const { createSubscription, subscriptionLoading, subscriptionError } = usePaymentStore();

    const upgrade = async (billingPeriod: 'monthly' | 'yearly') => {
        try {
            const subscriptionId = await createSubscription('pro', billingPeriod);
            return subscriptionId;
        } catch (error) {
            console.error('Upgrade failed:', error);
            throw error;
        }
    };

    return {
        upgrade,
        loading: subscriptionLoading,
        error: subscriptionError,
    };
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
    const { cancelSubscription, subscriptionLoading, subscriptionError } = usePaymentStore();

    const cancel = async (subscriptionId: string) => {
        try {
            await cancelSubscription(subscriptionId);
        } catch (error) {
            console.error('Cancel failed:', error);
            throw error;
        }
    };

    return {
        cancel,
        loading: subscriptionLoading,
        error: subscriptionError,
    };
};

/**
 * Hook to check usage limits for a feature
 */
export const useUsageLimit = (feature: string) => {
    const { usageLimits, checkUsageLimit, incrementUsage } = usePaymentStore();

    useEffect(() => {
        if (!usageLimits[feature]) {
            checkUsageLimit(feature);
        }
    }, [feature]);

    const limit = usageLimits[feature];

    return {
        limit,
        allowed: limit?.allowed ?? true,
        currentUsage: limit?.currentUsage ?? 0,
        limitValue: limit?.limitValue ?? -1,
        remaining: limit?.remaining ?? -1,
        isUnlimited: limit?.limitValue === -1,
        isNearLimit: limit ? limit.remaining <= 2 && limit.remaining > 0 : false,
        isAtLimit: limit?.allowed === false,
        refetch: () => checkUsageLimit(feature),
        increment: () => incrementUsage(feature),
    };
};

/**
 * Hook to get tier features
 */
export const useTierFeatures = () => {
    const { tierFeatures, fetchTierFeatures } = usePaymentStore();

    useEffect(() => {
        if (!tierFeatures) {
            fetchTierFeatures();
        }
    }, []);

    return {
        features: tierFeatures,
        refetch: fetchTierFeatures,
    };
};

/**
 * Hook to get payment history
 */
export const usePaymentHistory = (limit = 10, offset = 0) => {
    const {
        paymentHistory,
        paymentHistoryLoading,
        paymentHistoryError,
        fetchPaymentHistory,
    } = usePaymentStore();

    useEffect(() => {
        fetchPaymentHistory(limit, offset);
    }, [limit, offset]);

    return {
        payments: paymentHistory,
        loading: paymentHistoryLoading,
        error: paymentHistoryError,
        refetch: () => fetchPaymentHistory(limit, offset),
    };
};

/**
 * Hook to check if a feature is accessible based on subscription
 */
export const useFeatureAccess = (feature: keyof TierFeatures) => {
    const { features } = useTierFeatures();

    if (!features) {
        return { hasAccess: false, loading: true };
    }

    const featureValue = features[feature];

    // Boolean features
    if (typeof featureValue === 'boolean') {
        return { hasAccess: featureValue, loading: false };
    }

    // Numeric features (-1 means unlimited, 0 means no access)
    if (typeof featureValue === 'number') {
        return { hasAccess: featureValue !== 0, loading: false, limit: featureValue };
    }

    return { hasAccess: false, loading: false };
};
