import { create } from 'zustand';
import {
  User,
  ProfileFormData,
  EquipmentItem,
  PricingInfo,
  NotificationSettings,
  ProfileStats
} from '../types';
import {
  ProfileEditSection,
  EquipmentCondition,
  PricingStructure,
  VisibilityLevel,
  ProfileAnalyticsMetric,
  InstagramConnectionStatus,
  VerificationStatus
} from '../types/enums';
import { profileManagementService } from '../services/profileManagementService';

// Extended types for profile management
export interface PortfolioItem {
  id: string;
  url: string;
  caption: string;
  order: number;
  uploadedAt: string;
}

export interface PrivacySettings {
  visibility: VisibilityLevel;
  showEquipment: boolean;
  showPricing: boolean;
  showAvailability: boolean;
  allowContactSharing: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface ProfileAnalytics {
  profileViews: number;
  profileSaves: number;
  contactRequests: number;
  completionRate: number;
  viewsThisMonth: AnalyticsDataPoint[];
  recommendations: string[];
}

export interface AnalyticsDataPoint {
  date: string;
  views: number;
}

export interface InstagramConnection {
  status: InstagramConnectionStatus;
  handle: string | null;
  followers: number;
  posts: number;
  lastSync: string | null;
}

export interface VerificationData {
  profilePhoto: VerificationStatus;
  documents: VerificationStatus;
  email: VerificationStatus;
  mobile: VerificationStatus;
}

export interface AvailabilityPreview {
  nextAvailable: string;
  availableDays: number;
  bookedDays: number;
  partiallyAvailableDays: number;
}

// Store interface
interface ProfileManagementStore {
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Current section
  currentSection: ProfileEditSection | null;

  // Profile data
  profileDraft: ProfileFormData | null;
  equipmentDraft: EquipmentItem[];
  pricingDraft: PricingInfo | null;
  privacySettings: PrivacySettings;
  portfolioState: PortfolioItem[];
  instagramConnection: InstagramConnection;
  verificationData: VerificationData;
  analytics: ProfileAnalytics;
  availabilityPreview: AvailabilityPreview;

  // Actions
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentSection: (section: ProfileEditSection | null) => void;

  // Profile actions
  loadProfile: (userId: string) => Promise<void>;
  saveProfile: (data: ProfileFormData) => Promise<void>;
  updateProfileDraft: (data: Partial<ProfileFormData>) => void;

  // Equipment actions
  saveEquipment: (equipment: EquipmentItem[]) => Promise<void>;
  addEquipment: (equipment: EquipmentItem) => Promise<void>;
  updateEquipment: (equipmentId: string, equipment: EquipmentItem) => Promise<void>;
  deleteEquipment: (equipmentId: string) => Promise<void>;

  // Pricing actions
  savePricing: (pricing: PricingInfo) => Promise<void>;
  updatePricingDraft: (pricing: Partial<PricingInfo>) => void;

  // Privacy actions
  savePrivacy: (settings: PrivacySettings) => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;

  // Portfolio actions
  savePortfolio: (portfolio: PortfolioItem[]) => Promise<void>;
  uploadPortfolioImage: (file: File) => Promise<PortfolioItem>;
  reorderPortfolio: (items: PortfolioItem[]) => Promise<void>;
  deletePortfolioItem: (itemId: string) => Promise<void>;
  updatePortfolioCaption: (itemId: string, caption: string) => Promise<void>;

  // Instagram actions
  connectInstagram: () => Promise<void>;
  disconnectInstagram: () => Promise<void>;
  syncInstagramData: () => Promise<void>;

  // Verification actions
  submitVerification: (type: string, data: any) => Promise<void>;
  checkVerificationStatus: () => Promise<void>;

  // Analytics actions
  loadAnalytics: (dateRange?: { start: string; end: string }) => Promise<void>;
  trackProfileView: () => Promise<void>;

  // Availability actions
  loadAvailabilityPreview: () => Promise<void>;
  updateAvailability: (data: any) => Promise<void>;
}

export const useProfileManagementStore = create<ProfileManagementStore>((set, get) => ({
  // Initial state
  isLoading: false,
  isSaving: false,
  error: null,
  currentSection: null,
  profileDraft: null,
  equipmentDraft: [],
  pricingDraft: null,
  privacySettings: {
    visibility: VisibilityLevel.PUBLIC,
    showEquipment: true,
    showPricing: true,
    showAvailability: true,
    allowContactSharing: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  },
  portfolioState: [],
  instagramConnection: {
    status: InstagramConnectionStatus.NOT_CONNECTED,
    handle: null,
    followers: 0,
    posts: 0,
    lastSync: null
  },
  verificationData: {
    profilePhoto: VerificationStatus.NOT_VERIFIED,
    documents: VerificationStatus.NOT_VERIFIED,
    email: VerificationStatus.NOT_VERIFIED,
    mobile: VerificationStatus.NOT_VERIFIED
  },
  analytics: {
    profileViews: 0,
    profileSaves: 0,
    contactRequests: 0,
    completionRate: 0,
    viewsThisMonth: [],
    recommendations: []
  },
  availabilityPreview: {
    nextAvailable: '2024-01-15',
    availableDays: 18,
    bookedDays: 5,
    partiallyAvailableDays: 3
  },

  // Basic actions
  setLoading: (loading) => set({ isLoading: loading }),
  setSaving: (saving) => set({ isSaving: saving }),
  setError: (error) => set({ error }),
  setCurrentSection: (section) => set({ currentSection: section }),

  // Profile actions
  loadProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const profileData = await profileManagementService.profile.loadProfile(userId);
      set({ profileDraft: profileData });

      // Also load other data
      const analytics = await profileManagementService.analytics.getProfileAnalytics();
      set({
        analytics: {
          profileViews: analytics.totalViews,
          profileSaves: analytics.profileSavesCount,
          contactRequests: analytics.contactRequestsCount,
          completionRate: analytics.profileCompletionPercent,
          viewsThisMonth: [], // Need to map this if service returns it
          recommendations: []
        }
      });

      // Load portfolio
      const portfolioItems = await profileManagementService.portfolio.getPortfolioItems(userId);
      set({
        portfolioState: portfolioItems.map(item => ({
          id: item.id,
          url: item.imageUrl,
          caption: item.title,
          order: item.displayOrder,
          uploadedAt: item.createdAt
        }))
      });

    } catch (error) {
      console.error(error);
      set({ error: 'Failed to load profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveProfile: async (data) => {
    set({ isSaving: true, error: null });
    try {
      await profileManagementService.profile.saveProfile(data);
      set({ profileDraft: data });
    } catch (error) {
      console.error(error);
      set({ error: 'Failed to save profile' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  updateProfileDraft: (data) => {
    const currentDraft = get().profileDraft;
    if (currentDraft) {
      set({ profileDraft: { ...currentDraft, ...data } });
    }
  },

  // Equipment actions
  saveEquipment: async (equipment) => {
    set({ isSaving: true, error: null });
    try {
      await profileManagementService.profile.saveEquipment(equipment);
      set({ equipmentDraft: equipment });
    } catch (error) {
      set({ error: 'Failed to save equipment' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  addEquipment: async (equipment) => {
    const currentEquipment = get().equipmentDraft;
    const updatedEquipment = [...currentEquipment, equipment];
    await get().saveEquipment(updatedEquipment);
  },

  updateEquipment: async (equipmentId, equipment) => {
    const currentEquipment = get().equipmentDraft;
    const updatedEquipment = currentEquipment.map(item =>
      item.id === equipmentId ? equipment : item
    );
    await get().saveEquipment(updatedEquipment);
  },

  deleteEquipment: async (equipmentId) => {
    const currentEquipment = get().equipmentDraft;
    const updatedEquipment = currentEquipment.filter(item => item.id !== equipmentId);
    await get().saveEquipment(updatedEquipment);
  },

  // Pricing actions
  savePricing: async (pricing) => {
    set({ isSaving: true, error: null });
    try {
      await profileManagementService.profile.savePricing(pricing);
      set({ pricingDraft: pricing });
    } catch (error) {
      set({ error: 'Failed to save pricing' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  updatePricingDraft: (pricing) => {
    const currentPricing = get().pricingDraft;
    if (currentPricing) {
      set({ pricingDraft: { ...currentPricing, ...pricing } });
    }
  },

  // Privacy actions
  savePrivacy: async (settings) => {
    set({ isSaving: true, error: null });
    try {
      // Not implemented in backend yet, just update local state
      // await profileManagementService.savePrivacy(settings);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      set({ privacySettings: settings });
    } catch (error) {
      set({ error: 'Failed to save privacy settings' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  updatePrivacySettings: (settings) => {
    const currentSettings = get().privacySettings;
    set({ privacySettings: { ...currentSettings, ...settings } });
  },

  // Portfolio actions
  savePortfolio: async (portfolio) => {
    set({ isSaving: true, error: null });
    try {
      // Reorder items
      const ids = portfolio.map(p => p.id);
      await profileManagementService.portfolio.reorderPortfolioItems(ids);
      set({ portfolioState: portfolio });
    } catch (error) {
      set({ error: 'Failed to save portfolio' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  uploadPortfolioImage: async (file) => {
    set({ isSaving: true, error: null });
    try {
      const newItem = await profileManagementService.portfolio.uploadPortfolioImage(file);
      const currentPortfolio = get().portfolioState;
      const mappedItem: PortfolioItem = {
        id: newItem.id,
        url: newItem.imageUrl,
        caption: newItem.title,
        order: newItem.displayOrder,
        uploadedAt: newItem.createdAt
      };
      set({ portfolioState: [...currentPortfolio, mappedItem] });
      return mappedItem;
    } catch (error) {
      set({ error: 'Failed to upload image' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  reorderPortfolio: async (items) => {
    await get().savePortfolio(items);
  },

  deletePortfolioItem: async (itemId) => {
    set({ isSaving: true, error: null });
    try {
      await profileManagementService.portfolio.deletePortfolioItem(itemId);
      const currentPortfolio = get().portfolioState;
      const updatedPortfolio = currentPortfolio.filter(item => item.id !== itemId);
      set({ portfolioState: updatedPortfolio });
    } catch (error) {
      set({ error: 'Failed to delete portfolio item' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  updatePortfolioCaption: async (itemId, caption) => {
    set({ isSaving: true, error: null });
    try {
      await profileManagementService.portfolio.updatePortfolioItem(itemId, { title: caption });
      const currentPortfolio = get().portfolioState;
      const updatedPortfolio = currentPortfolio.map(item =>
        item.id === itemId ? { ...item, caption } : item
      );
      set({ portfolioState: updatedPortfolio });
    } catch (error) {
      set({ error: 'Failed to update portfolio item' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Instagram actions
  connectInstagram: async () => {
    set({ isSaving: true, error: null });
    try {
      // Mock for now as it requires OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));
      set({
        instagramConnection: {
          status: InstagramConnectionStatus.CONNECTED,
          handle: '@mock_handle',
          followers: 1000,
          posts: 50,
          lastSync: new Date().toISOString()
        }
      });
    } catch (error) {
      set({ error: 'Failed to connect Instagram' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  disconnectInstagram: async () => {
    set({ isSaving: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({
        instagramConnection: {
          status: InstagramConnectionStatus.NOT_CONNECTED,
          handle: null,
          followers: 0,
          posts: 0,
          lastSync: null
        }
      });
    } catch (error) {
      set({ error: 'Failed to disconnect Instagram' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  syncInstagramData: async () => {
    set({ isSaving: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const currentConnection = get().instagramConnection;
      set({
        instagramConnection: {
          ...currentConnection,
          lastSync: new Date().toISOString()
        }
      });
    } catch (error) {
      set({ error: 'Failed to sync Instagram data' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Verification actions
  submitVerification: async (type, data) => {
    set({ isSaving: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const currentVerification = get().verificationData;
      set({
        verificationData: {
          ...currentVerification,
          [type]: VerificationStatus.PENDING
        }
      });
    } catch (error) {
      set({ error: 'Failed to submit verification' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  checkVerificationStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Mock verification status check
    } catch (error) {
      set({ error: 'Failed to check verification status' });
    } finally {
      set({ isLoading: false });
    }
  },

  // Analytics actions
  loadAnalytics: async (dateRange) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await profileManagementService.analytics.getProfileAnalytics();
      set({
        analytics: {
          profileViews: analytics.totalViews,
          profileSaves: analytics.profileSavesCount,
          contactRequests: analytics.contactRequestsCount,
          completionRate: analytics.profileCompletionPercent,
          viewsThisMonth: [],
          recommendations: []
        }
      });
    } catch (error) {
      set({ error: 'Failed to load analytics' });
    } finally {
      set({ isLoading: false });
    }
  },

  trackProfileView: async () => {
    try {
      // We need professional ID, but store doesn't have it easily accessible in this action context without passing it.
      // Assuming we track view for the currently loaded profile? But trackProfileView usually happens when viewing SOMEONE ELSE's profile.
      // The store seems to be for managing OWN profile.
      // So maybe this action is redundant here or should be called with an ID.
      // For now, silent fail or mock.
    } catch (error) {
      // Silent fail for tracking
    }
  },

  // Availability actions
  loadAvailabilityPreview: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      // Mock availability preview is already set in initial state
    } catch (error) {
      set({ error: 'Failed to load availability preview' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAvailability: async (data) => {
    set({ isSaving: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update availability preview based on new data
      set({
        availabilityPreview: {
          ...get().availabilityPreview,
          ...data
        }
      });
    } catch (error) {
      set({ error: 'Failed to update availability' });
      throw error;
    } finally {
      set({ isSaving: false });
    }
  }
}));