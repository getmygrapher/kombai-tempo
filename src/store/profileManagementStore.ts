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

// Mock API functions with simulated latency
const mockAPI = {
  async loadProfile(userId: string): Promise<ProfileFormData> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return mock profile data
    return {
      basicInfo: {
        name: 'Arjun Menon',
        email: 'arjun.menon@example.com',
        phone: '+919876543210',
        alternatePhone: '+919876543211',
        profilePhoto: 'https://i.pravatar.cc/150?img=1'
      },
      location: {
        city: 'Kochi',
        state: 'Kerala',
        pinCode: '682001',
        address: 'Marine Drive, Ernakulam',
        preferredWorkLocations: ['Kochi', 'Thiruvananthapuram', 'Kozhikode']
      },
      professional: {
        category: 'Photography' as any,
        type: 'Wedding Photographer',
        specializations: ['Wedding Photography', 'Portrait Photography'],
        experience: '3-5 years' as any,
        about: 'Passionate photographer with expertise in weddings and portraits.',
        instagramHandle: '@arjun_captures'
      },
      equipment: [],
      pricing: {
        type: 'Per Event' as any,
        rate: 25000,
        isNegotiable: true
      }
    };
  },

  async saveProfile(data: ProfileFormData): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate potential failure
    if (Math.random() < 0.1) {
      throw new Error('Failed to save profile');
    }
  },

  async saveEquipment(equipment: EquipmentItem[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async savePricing(pricing: PricingInfo): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
  },

  async savePrivacy(settings: PrivacySettings): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
  },

  async uploadPortfolioImage(file: File): Promise<PortfolioItem> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      id: Date.now().toString(),
      url: `https://picsum.photos/800/600?random=${Date.now()}`,
      caption: '',
      order: Date.now(),
      uploadedAt: new Date().toISOString()
    };
  },

  async connectInstagram(): Promise<InstagramConnection> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      status: InstagramConnectionStatus.CONNECTED,
      handle: '@arjun_captures',
      followers: 2500,
      posts: 150,
      lastSync: new Date().toISOString()
    };
  },

  async loadAnalytics(): Promise<ProfileAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      profileViews: 1250,
      profileSaves: 89,
      contactRequests: 45,
      completionRate: 85,
      viewsThisMonth: [
        { date: '2024-01-01', views: 45 },
        { date: '2024-01-02', views: 52 },
        { date: '2024-01-03', views: 38 },
        { date: '2024-01-04', views: 61 },
        { date: '2024-01-05', views: 55 },
        { date: '2024-01-06', views: 48 },
        { date: '2024-01-07', views: 42 }
      ],
      recommendations: [
        'Add more portfolio images to increase engagement',
        'Complete your equipment list to attract more clients',
        'Update your availability calendar regularly',
        'Consider upgrading to Pro for better visibility'
      ]
    };
  }
};

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
      const profileData = await mockAPI.loadProfile(userId);
      set({ profileDraft: profileData });
    } catch (error) {
      set({ error: 'Failed to load profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveProfile: async (data) => {
    set({ isSaving: true, error: null });
    try {
      await mockAPI.saveProfile(data);
      set({ profileDraft: data });
    } catch (error) {
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
      await mockAPI.saveEquipment(equipment);
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
      await mockAPI.savePricing(pricing);
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
      await mockAPI.savePrivacy(settings);
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
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      const newItem = await mockAPI.uploadPortfolioImage(file);
      const currentPortfolio = get().portfolioState;
      set({ portfolioState: [...currentPortfolio, newItem] });
      return newItem;
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
    const currentPortfolio = get().portfolioState;
    const updatedPortfolio = currentPortfolio.filter(item => item.id !== itemId);
    await get().savePortfolio(updatedPortfolio);
  },

  updatePortfolioCaption: async (itemId, caption) => {
    const currentPortfolio = get().portfolioState;
    const updatedPortfolio = currentPortfolio.map(item =>
      item.id === itemId ? { ...item, caption } : item
    );
    await get().savePortfolio(updatedPortfolio);
  },

  // Instagram actions
  connectInstagram: async () => {
    set({ isSaving: true, error: null });
    try {
      const connection = await mockAPI.connectInstagram();
      set({ instagramConnection: connection });
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
      const analytics = await mockAPI.loadAnalytics();
      set({ analytics });
    } catch (error) {
      set({ error: 'Failed to load analytics' });
    } finally {
      set({ isLoading: false });
    }
  },

  trackProfileView: async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const currentAnalytics = get().analytics;
      set({ 
        analytics: {
          ...currentAnalytics,
          profileViews: currentAnalytics.profileViews + 1
        }
      });
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