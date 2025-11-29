import { paymentService, TierFeatures } from '../services/paymentService';

/**
 * Feature gating utilities for subscription tier management
 */

export type Feature =
    | 'job_posts_per_month'
    | 'job_accepts_per_month'
    | 'messaging_limit'
    | 'portfolio_images'
    | 'calendar_privacy'
    | 'instagram_integration'
    | 'advanced_search'
    | 'priority_support'
    | 'verified_badge'
    | 'analytics_dashboard';

export type UserTier = 'free' | 'pro';

// Cache for tier features to avoid repeated API calls
let cachedFeatures: TierFeatures | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get user's tier features (with caching)
 */
async function getTierFeatures(): Promise<TierFeatures> {
    const now = Date.now();

    if (cachedFeatures && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedFeatures;
    }

    cachedFeatures = await paymentService.getUserTierFeatures();
    cacheTimestamp = now;

    return cachedFeatures;
}

/**
 * Clear the features cache (call after subscription changes)
 */
export function clearFeatureCache(): void {
    cachedFeatures = null;
    cacheTimestamp = 0;
}

/**
 * Check if user can access a specific feature
 */
export async function canAccessFeature(feature: Feature): Promise<boolean> {
    try {
        const features = await getTierFeatures();
        const featureValue = features[feature];

        // Boolean features
        if (typeof featureValue === 'boolean') {
            return featureValue;
        }

        // Numeric features (-1 means unlimited, 0 means no access)
        if (typeof featureValue === 'number') {
            return featureValue !== 0;
        }

        return false;
    } catch (error) {
        console.error('Error checking feature access:', error);
        return false;
    }
}

/**
 * Check if user has reached usage limit for a feature
 */
export async function checkUsageLimit(feature: string): Promise<{
    allowed: boolean;
    currentUsage: number;
    limitValue: number;
    remaining: number;
}> {
    try {
        return await paymentService.checkUsageLimit(feature);
    } catch (error) {
        console.error('Error checking usage limit:', error);
        return {
            allowed: false,
            currentUsage: 0,
            limitValue: 0,
            remaining: 0
        };
    }
}

/**
 * Increment usage for a feature (call when user uses a limited feature)
 */
export async function incrementUsage(feature: string): Promise<boolean> {
    try {
        return await paymentService.incrementUsage(feature);
    } catch (error) {
        console.error('Error incrementing usage:', error);
        return false;
    }
}

/**
 * Check if user can post a job (respects free tier limit)
 */
export async function canPostJob(): Promise<{
    allowed: boolean;
    reason?: string;
    remaining?: number;
}> {
    try {
        const limit = await checkUsageLimit('job_posts_per_month');

        if (limit.limitValue === -1) {
            return { allowed: true }; // Unlimited (Pro tier)
        }

        if (limit.allowed) {
            return {
                allowed: true,
                remaining: limit.remaining
            };
        }

        return {
            allowed: false,
            reason: `You've reached your monthly limit of ${limit.limitValue} job post(s). Upgrade to Pro for unlimited job posts.`
        };
    } catch (error) {
        console.error('Error checking job post limit:', error);
        return {
            allowed: false,
            reason: 'Unable to verify job posting limit. Please try again.'
        };
    }
}

/**
 * Check if user can accept a job (respects free tier limit)
 */
export async function canAcceptJob(): Promise<{
    allowed: boolean;
    reason?: string;
    remaining?: number;
}> {
    try {
        const limit = await checkUsageLimit('job_accepts_per_month');

        if (limit.limitValue === -1) {
            return { allowed: true }; // Unlimited (Pro tier)
        }

        if (limit.allowed) {
            return {
                allowed: true,
                remaining: limit.remaining
            };
        }

        return {
            allowed: false,
            reason: `You've reached your monthly limit of ${limit.limitValue} job acceptance(s). Upgrade to Pro for unlimited job accepts.`
        };
    } catch (error) {
        console.error('Error checking job accept limit:', error);
        return {
            allowed: false,
            reason: 'Unable to verify job acceptance limit. Please try again.'
        };
    }
}

/**
 * Check if user can send a message (respects free tier limit)
 */
export async function canSendMessage(): Promise<{
    allowed: boolean;
    reason?: string;
    remaining?: number;
}> {
    try {
        const limit = await checkUsageLimit('messaging_limit');

        if (limit.limitValue === -1) {
            return { allowed: true }; // Unlimited (Pro tier)
        }

        if (limit.allowed) {
            return {
                allowed: true,
                remaining: limit.remaining
            };
        }

        return {
            allowed: false,
            reason: `You've reached your monthly limit of ${limit.limitValue} message(s). Upgrade to Pro for unlimited messaging.`
        };
    } catch (error) {
        console.error('Error checking messaging limit:', error);
        return {
            allowed: false,
            reason: 'Unable to verify messaging limit. Please try again.'
        };
    }
}

/**
 * Get search radius limit for user's tier
 */
export async function getSearchRadiusLimit(): Promise<number> {
    try {
        const features = await getTierFeatures();
        return features.search_radius_km;
    } catch (error) {
        console.error('Error getting search radius limit:', error);
        return 25; // Default to free tier limit
    }
}

/**
 * Get portfolio images limit for user's tier
 */
export async function getPortfolioImagesLimit(): Promise<number> {
    try {
        const features = await getTierFeatures();
        return features.portfolio_images;
    } catch (error) {
        console.error('Error getting portfolio images limit:', error);
        return 5; // Default to free tier limit
    }
}

/**
 * Show upgrade prompt (helper function for UI)
 */
export function showUpgradePrompt(feature: string, reason: string): void {
    // This would typically trigger a modal or toast notification
    // Implementation depends on your UI framework
    console.log(`Upgrade required for ${feature}: ${reason}`);

    // Example: You could dispatch a custom event that your UI listens to
    window.dispatchEvent(new CustomEvent('show-upgrade-prompt', {
        detail: { feature, reason }
    }));
}

/**
 * Feature gate wrapper for async functions
 * Usage: await withFeatureGate('instagram_integration', async () => { ... })
 */
export async function withFeatureGate<T>(
    feature: Feature,
    action: () => Promise<T>,
    onDenied?: (reason: string) => void
): Promise<T | null> {
    const hasAccess = await canAccessFeature(feature);

    if (!hasAccess) {
        const reason = `This feature requires a Pro subscription.`;
        if (onDenied) {
            onDenied(reason);
        } else {
            showUpgradePrompt(feature, reason);
        }
        return null;
    }

    return await action();
}

/**
 * Usage limit gate wrapper for async functions
 * Usage: await withUsageLimit('job_posts_per_month', async () => { ... })
 */
export async function withUsageLimit<T>(
    feature: string,
    action: () => Promise<T>,
    onDenied?: (reason: string) => void
): Promise<T | null> {
    const limit = await checkUsageLimit(feature);

    if (!limit.allowed) {
        const reason = `You've reached your monthly limit. Upgrade to Pro for unlimited access.`;
        if (onDenied) {
            onDenied(reason);
        } else {
            showUpgradePrompt(feature, reason);
        }
        return null;
    }

    // Execute action
    const result = await action();

    // Increment usage after successful action
    await incrementUsage(feature);

    return result;
}
