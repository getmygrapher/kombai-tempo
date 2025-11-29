import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { paymentService, Subscription, Payment, UsageLimit, TierFeatures } from '../services/paymentService';

interface PaymentState {
    // Subscription state
    subscription: Subscription | null;
    subscriptionLoading: boolean;
    subscriptionError: string | null;

    // Payment history
    paymentHistory: Payment[];
    paymentHistoryLoading: boolean;
    paymentHistoryError: string | null;

    // Usage limits
    usageLimits: Record<string, UsageLimit>;
    usageLimitsLoading: boolean;

    // Tier features
    tierFeatures: TierFeatures | null;

    // Actions
    fetchSubscription: () => Promise<void>;
    fetchTierFeatures: () => Promise<void>;
    createSubscription: (tier: 'pro', billingPeriod: 'monthly' | 'yearly') => Promise<string>;
    cancelSubscription: (subscriptionId: string) => Promise<void>;
    fetchPaymentHistory: (limit?: number, offset?: number) => Promise<void>;
    checkUsageLimit: (feature: string) => Promise<UsageLimit>;
    incrementUsage: (feature: string) => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    subscription: null,
    subscriptionLoading: false,
    subscriptionError: null,
    paymentHistory: [],
    paymentHistoryLoading: false,
    paymentHistoryError: null,
    usageLimits: {},
    usageLimitsLoading: false,
    tierFeatures: null,
};

export const usePaymentStore = create<PaymentState>()(
    persist(
        (set, get) => ({
            ...initialState,

            fetchSubscription: async () => {
                set({ subscriptionLoading: true, subscriptionError: null });
                try {
                    const subscription = await paymentService.getSubscriptionStatus();
                    set({ subscription, subscriptionLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subscription';
                    set({ subscriptionError: errorMessage, subscriptionLoading: false });
                    console.error('Error fetching subscription:', error);
                }
            },

            fetchTierFeatures: async () => {
                try {
                    const features = await paymentService.getUserTierFeatures();
                    set({ tierFeatures: features });
                } catch (error) {
                    console.error('Error fetching tier features:', error);
                }
            },

            createSubscription: async (tier: 'pro', billingPeriod: 'monthly' | 'yearly') => {
                set({ subscriptionLoading: true, subscriptionError: null });
                try {
                    const subscriptionId = await paymentService.createSubscription(tier, billingPeriod);
                    // Refresh subscription status
                    await get().fetchSubscription();
                    return subscriptionId;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription';
                    set({ subscriptionError: errorMessage, subscriptionLoading: false });
                    throw error;
                }
            },

            cancelSubscription: async (subscriptionId: string) => {
                set({ subscriptionLoading: true, subscriptionError: null });
                try {
                    await paymentService.cancelSubscription(subscriptionId);
                    // Refresh subscription status
                    await get().fetchSubscription();
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel subscription';
                    set({ subscriptionError: errorMessage, subscriptionLoading: false });
                    throw error;
                }
            },

            fetchPaymentHistory: async (limit = 10, offset = 0) => {
                set({ paymentHistoryLoading: true, paymentHistoryError: null });
                try {
                    const history = await paymentService.getPaymentHistory(limit, offset);
                    set({ paymentHistory: history, paymentHistoryLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch payment history';
                    set({ paymentHistoryError: errorMessage, paymentHistoryLoading: false });
                    console.error('Error fetching payment history:', error);
                }
            },

            checkUsageLimit: async (feature: string) => {
                set({ usageLimitsLoading: true });
                try {
                    const limit = await paymentService.checkUsageLimit(feature);
                    set((state) => ({
                        usageLimits: { ...state.usageLimits, [feature]: limit },
                        usageLimitsLoading: false,
                    }));
                    return limit;
                } catch (error) {
                    set({ usageLimitsLoading: false });
                    console.error('Error checking usage limit:', error);
                    throw error;
                }
            },

            incrementUsage: async (feature: string) => {
                try {
                    await paymentService.incrementUsage(feature);
                    // Refresh usage limit for this feature
                    await get().checkUsageLimit(feature);
                } catch (error) {
                    console.error('Error incrementing usage:', error);
                    throw error;
                }
            },

            clearError: () => {
                set({ subscriptionError: null, paymentHistoryError: null });
            },

            reset: () => {
                set(initialState);
            },
        }),
        {
            name: 'payment-storage',
            partialize: (state) => ({
                subscription: state.subscription,
                tierFeatures: state.tierFeatures,
            }),
        }
    )
);
