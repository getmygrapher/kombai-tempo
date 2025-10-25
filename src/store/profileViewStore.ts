import { create } from 'zustand';
import { ProfileTab, ProfileViewData, ViewerPermissions } from '../data/profileViewSystemMockData';

interface ProfileData {
  [profileId: string]: {
    data: ProfileViewData;
    lastFetched: number;
    ttl: number;
  };
}

interface ProfileViewStore {
  // Profile data and caching
  profiles: ProfileData;
  currentProfileId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Viewer permissions
  viewerPermissions: ViewerPermissions | null;
  
  // UI state management
  activeTab: ProfileTab;
  
  // Modal states
  contactModalOpen: boolean;
  shareModalOpen: boolean;
  reportModalOpen: boolean;
  
  // Lightbox state
  lightboxOpen: boolean;
  selectedImageIndex: number;
  
  // Profile view history and saved profiles
  profileViewHistory: string[];
  savedProfiles: string[];
  
  // Actions
  loadProfile: (profileId: string) => Promise<void>;
  setActiveTab: (tab: ProfileTab) => void;
  setViewerPermissions: (permissions: ViewerPermissions) => void;
  
  // Modal actions
  openContactModal: () => void;
  closeContactModal: () => void;
  openShareModal: () => void;
  closeShareModal: () => void;
  openReportModal: () => void;
  closeReportModal: () => void;
  
  // Lightbox actions
  setLightboxState: (open: boolean, index?: number) => void;
  
  // Profile management
  addToViewHistory: (profileId: string) => void;
  toggleSaveProfile: (profileId: string) => void;
  setCurrentlyViewingProfile: (profileId: string | null) => void;
  
  // Utility actions
  clearError: () => void;
  clearProfileViewState: () => void;
  
  // Selectors (memoized)
  getCurrentProfile: () => ProfileViewData | null;
  getViewerPermissions: () => ViewerPermissions | null;
  isProfileSaved: (profileId: string) => boolean;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useProfileViewStore = create<ProfileViewStore>((set, get) => ({
  // Initial state
  profiles: {},
  currentProfileId: null,
  isLoading: false,
  error: null,
  viewerPermissions: null,
  activeTab: ProfileTab.OVERVIEW,
  contactModalOpen: false,
  shareModalOpen: false,
  reportModalOpen: false,
  lightboxOpen: false,
  selectedImageIndex: 0,
  profileViewHistory: [],
  savedProfiles: [],

  // Load profile with caching
  loadProfile: async (profileId: string) => {
    const state = get();
    const cached = state.profiles[profileId];
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cached && (now - cached.lastFetched) < cached.ttl) {
      set({
        currentProfileId: profileId,
        viewerPermissions: cached.data.viewerPermissions,
        error: null
      });
      get().addToViewHistory(profileId);
      return;
    }
    
    set({ isLoading: true, error: null, currentProfileId: profileId });
    
    try {
      // Import mock data dynamically to avoid circular dependencies
      const { mockProfessionalsData } = await import('../data/profileViewSystemMockData');
      
      if (!mockProfessionalsData[profileId]) {
        throw new Error('Profile not found');
      }
      
      const profileData = mockProfessionalsData[profileId];
      
      set((state) => ({
        profiles: {
          ...state.profiles,
          [profileId]: {
            data: profileData,
            lastFetched: now,
            ttl: CACHE_TTL
          }
        },
        viewerPermissions: profileData.viewerPermissions,
        isLoading: false,
        error: null
      }));
      
      get().addToViewHistory(profileId);
      
      // Prefetch adjacent tab data (simulate)
      setTimeout(() => {
        console.log('Prefetching adjacent tab data for profile:', profileId);
      }, 100);
      
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load profile'
      });
    }
  },

  setActiveTab: (tab: ProfileTab) => {
    set({ activeTab: tab });
  },

  setViewerPermissions: (permissions: ViewerPermissions) => {
    set({ viewerPermissions: permissions });
  },

  // Modal actions
  openContactModal: () => set({ contactModalOpen: true }),
  closeContactModal: () => set({ contactModalOpen: false }),
  openShareModal: () => set({ shareModalOpen: true }),
  closeShareModal: () => set({ shareModalOpen: false }),
  openReportModal: () => set({ reportModalOpen: true }),
  closeReportModal: () => set({ reportModalOpen: false }),

  // Lightbox actions
  setLightboxState: (open: boolean, index?: number) => {
    set({
      lightboxOpen: open,
      selectedImageIndex: index !== undefined ? index : get().selectedImageIndex,
    });
  },

  // Profile management
  addToViewHistory: (profileId: string) => {
    set((state) => {
      const history = state.profileViewHistory.filter(id => id !== profileId);
      return {
        profileViewHistory: [profileId, ...history].slice(0, 10), // Keep last 10
      };
    });
  },

  toggleSaveProfile: (profileId: string) => {
    set((state) => {
      const isSaved = state.savedProfiles.includes(profileId);
      return {
        savedProfiles: isSaved
          ? state.savedProfiles.filter(id => id !== profileId)
          : [...state.savedProfiles, profileId],
      };
    });
  },

  setCurrentlyViewingProfile: (profileId: string | null) => {
    set({ currentProfileId: profileId });
    if (profileId) {
      get().addToViewHistory(profileId);
    }
  },

  // Utility actions
  clearError: () => set({ error: null }),
  
  clearProfileViewState: () => {
    set({
      currentProfileId: null,
      activeTab: ProfileTab.OVERVIEW,
      lightboxOpen: false,
      selectedImageIndex: 0,
      contactModalOpen: false,
      shareModalOpen: false,
      reportModalOpen: false,
      error: null
    });
  },

  // Memoized selectors
  getCurrentProfile: () => {
    const state = get();
    if (!state.currentProfileId || !state.profiles[state.currentProfileId]) {
      return null;
    }
    return state.profiles[state.currentProfileId].data;
  },

  getViewerPermissions: () => {
    return get().viewerPermissions;
  },

  isProfileSaved: (profileId: string) => {
    return get().savedProfiles.includes(profileId);
  },
}));