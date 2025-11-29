import { supabase } from './supabaseClient';

// Types
export interface SubscriptionTier {
    tier: 'free' | 'pro';
    name: string;
    priceMonthly: number;
    priceYearly: number;
    features: TierFeatures;
    isActive: boolean;
}

export interface TierFeatures {
    job_posts_per_month: number; // -1 = unlimited
    job_accepts_per_month: number;
    search_radius_km: number;
    messaging_limit: number;
    portfolio_images: number;
    calendar_privacy: boolean;
    instagram_integration: boolean;
    advanced_search: boolean;
    priority_support: boolean;
    verified_badge?: boolean;
    analytics_dashboard?: boolean;
}

export interface Subscription {
    subscriptionId: string | null;
    tier: 'free' | 'pro';
    billingPeriod: 'monthly' | 'yearly' | null;
    status: 'active' | 'cancelled' | 'expired' | 'grace_period' | 'pending';
    startDate: string | null;
    endDate: string | null;
    autoRenew: boolean;
    features: TierFeatures;
}

export interface Payment {
    paymentId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'success' | 'failed' | 'refunded';
    razorpayPaymentId: string;
    createdAt: string;
}

export interface UsageLimit {
    allowed: boolean;
    currentUsage: number;
    limitValue: number;
    remaining: number;
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
}

export interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const paymentService = {
    /**
     * Get current user's subscription status
     */
    async getSubscriptionStatus(): Promise<Subscription> {
        try {
            const { data, error } = await supabase.rpc('get_subscription_status');

            if (error) throw error;

            if (!data || data.length === 0) {
                // Return free tier as default
                return {
                    subscriptionId: null,
                    tier: 'free',
                    billingPeriod: null,
                    status: 'active',
                    startDate: null,
                    endDate: null,
                    autoRenew: false,
                    features: {
                        job_posts_per_month: 1,
                        job_accepts_per_month: 1,
                        search_radius_km: 25,
                        messaging_limit: 10,
                        portfolio_images: 5,
                        calendar_privacy: false,
                        instagram_integration: false,
                        advanced_search: false,
                        priority_support: false
                    }
                };
            }

            const row = data[0];
            return {
                subscriptionId: row.subscription_id,
                tier: row.tier,
                billingPeriod: row.billing_period,
                status: row.status,
                startDate: row.start_date,
                endDate: row.end_date,
                autoRenew: row.auto_renew,
                features: row.features
            };
        } catch (error) {
            console.error('Error getting subscription status:', error);
            throw error;
        }
    },

    /**
     * Get user's tier features
     */
    async getUserTierFeatures(): Promise<TierFeatures> {
        try {
            const { data, error } = await supabase.rpc('get_user_tier_features');

            if (error) throw error;

            return data as TierFeatures;
        } catch (error) {
            console.error('Error getting tier features:', error);
            throw error;
        }
    },

    /**
     * Create a new subscription
     */
    async createSubscription(
        tier: 'pro',
        billingPeriod: 'monthly' | 'yearly'
    ): Promise<string> {
        try {
            const amount = billingPeriod === 'monthly' ? 299 : 2999;

            const { data, error } = await supabase.rpc('create_subscription', {
                p_tier: tier,
                p_billing_period: billingPeriod,
                p_amount: amount
            });

            if (error) throw error;

            return data as string; // subscription_id
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    },

    /**
     * Activate subscription after successful payment
     */
    async activateSubscription(
        subscriptionId: string,
        razorpaySubscriptionId?: string,
        razorpayPlanId?: string
    ): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('activate_subscription', {
                p_subscription_id: subscriptionId,
                p_razorpay_subscription_id: razorpaySubscriptionId || null,
                p_razorpay_plan_id: razorpayPlanId || null
            });

            if (error) throw error;

            return data as boolean;
        } catch (error) {
            console.error('Error activating subscription:', error);
            throw error;
        }
    },

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('cancel_subscription', {
                p_subscription_id: subscriptionId
            });

            if (error) throw error;

            return data as boolean;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    },

    /**
     * Record a payment
     */
    async recordPayment(
        subscriptionId: string,
        amount: number,
        currency: string,
        razorpayPaymentId: string,
        razorpayOrderId: string,
        razorpaySignature: string,
        status: 'success' | 'failed' = 'success'
    ): Promise<string> {
        try {
            const { data, error } = await supabase.rpc('record_payment', {
                p_subscription_id: subscriptionId,
                p_amount: amount,
                p_currency: currency,
                p_razorpay_payment_id: razorpayPaymentId,
                p_razorpay_order_id: razorpayOrderId,
                p_razorpay_signature: razorpaySignature,
                p_status: status
            });

            if (error) throw error;

            return data as string; // payment_id
        } catch (error) {
            console.error('Error recording payment:', error);
            throw error;
        }
    },

    /**
     * Check usage limit for a feature
     */
    async checkUsageLimit(feature: string): Promise<UsageLimit> {
        try {
            const { data, error } = await supabase.rpc('check_usage_limit', {
                p_feature: feature
            });

            if (error) throw error;

            if (!data || data.length === 0) {
                return {
                    allowed: true,
                    currentUsage: 0,
                    limitValue: -1,
                    remaining: -1
                };
            }

            const row = data[0];
            return {
                allowed: row.allowed,
                currentUsage: row.current_usage,
                limitValue: row.limit_value,
                remaining: row.remaining
            };
        } catch (error) {
            console.error('Error checking usage limit:', error);
            throw error;
        }
    },

    /**
     * Increment usage for a feature
     */
    async incrementUsage(feature: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.rpc('increment_usage', {
                p_feature: feature
            });

            if (error) throw error;

            return data as boolean;
        } catch (error) {
            console.error('Error incrementing usage:', error);
            throw error;
        }
    },

    /**
     * Get payment history
     */
    async getPaymentHistory(limit: number = 10, offset: number = 0): Promise<Payment[]> {
        try {
            const { data, error } = await supabase.rpc('get_payment_history', {
                p_limit: limit,
                p_offset: offset
            });

            if (error) throw error;

            return (data || []).map((row: any) => ({
                paymentId: row.payment_id,
                amount: row.amount,
                currency: row.currency,
                status: row.status,
                razorpayPaymentId: row.razorpay_payment_id,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error('Error getting payment history:', error);
            throw error;
        }
    },

    /**
     * Initialize Razorpay checkout
     * Note: Requires Razorpay script to be loaded in HTML
     */
    async initiateRazorpayCheckout(
        tier: 'pro',
        billingPeriod: 'monthly' | 'yearly',
        userEmail: string,
        userName: string
    ): Promise<void> {
        try {
            // Create subscription first
            const subscriptionId = await this.createSubscription(tier, billingPeriod);

            const amount = billingPeriod === 'monthly' ? 299 : 2999;

            // Note: In production, you would create a Razorpay order on your backend
            // For now, we'll use a simplified flow
            const options: RazorpayOptions = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                name: 'GetMyGrapher',
                description: `${tier.toUpperCase()} - ${billingPeriod} subscription`,
                order_id: '', // This should come from backend order creation
                handler: async (response: RazorpayResponse) => {
                    try {
                        // Record payment
                        await this.recordPayment(
                            subscriptionId,
                            amount,
                            'INR',
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            response.razorpay_signature
                        );

                        // Activate subscription
                        await this.activateSubscription(subscriptionId);

                        // Reload page or show success message
                        window.location.reload();
                    } catch (error) {
                        console.error('Error processing payment:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail
                },
                theme: {
                    color: '#6366f1'
                }
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                throw new Error('Razorpay SDK not loaded');
            }
        } catch (error) {
            console.error('Error initiating Razorpay checkout:', error);
            throw error;
        }
    }
};
