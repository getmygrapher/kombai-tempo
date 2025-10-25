import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ProfileViewData, ContactRequest, BookingRequest, mockProfessionalsData, ProfileTab } from '../data/profileViewSystemMockData';
import { useProfileViewStore } from '../store/profileViewStore';
import { analyticsService, debouncedAnalytics } from '../utils/analyticsEvents';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
const fetchProfileData = async (professionalId: string): Promise<ProfileViewData> => {
  await delay(1000); // Simulate network delay
  
  // Check if professional exists in our mock data
  if (mockProfessionalsData[professionalId]) {
    return mockProfessionalsData[professionalId];
  }
  
  throw new Error('Profile not found');
};

const contactProfessional = async (request: ContactRequest): Promise<{ success: boolean }> => {
  await delay(500);
  return { success: true };
};

const bookProfessional = async (request: BookingRequest): Promise<{ success: boolean }> => {
  await delay(500);
  return { success: true };
};

const saveProfile = async (professionalId: string): Promise<{ success: boolean }> => {
  await delay(300);
  return { success: true };
};

const reportProfile = async (professionalId: string, reason: string): Promise<{ success: boolean }> => {
  await delay(500);
  return { success: true };
};

// Get tab from pathname
const getTabFromPath = (pathname: string): ProfileTab => {
  if (pathname.includes('/portfolio')) return ProfileTab.PORTFOLIO;
  if (pathname.includes('/equipment')) return ProfileTab.EQUIPMENT;
  if (pathname.includes('/reviews')) return ProfileTab.REVIEWS;
  if (pathname.includes('/availability')) return ProfileTab.AVAILABILITY;
  return ProfileTab.OVERVIEW;
};

// Main hook for profile view functionality
export const useProfileView = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const location = useLocation();
  const {
    loadProfile,
    setActiveTab,
    getCurrentProfile,
    getViewerPermissions,
    isLoading,
    error,
    activeTab,
    clearError
  } = useProfileViewStore();

  // Sync active tab with URL
  useEffect(() => {
    const tabFromUrl = getTabFromPath(location.pathname);
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
      
      // Track tab view using debounced analytics
      if (profileId) {
        debouncedAnalytics.trackProfileTabViewed(profileId, tabFromUrl, 'url_navigation');
      }
    }
  }, [location.pathname, activeTab, setActiveTab, profileId]);

  // Load profile when profileId changes
  useEffect(() => {
    if (profileId) {
      loadProfile(profileId);
      
      // Track profile view using debounced analytics
      debouncedAnalytics.trackProfileViewed(profileId, 'direct_link');
    }
  }, [profileId, loadProfile]);

  const profileData = getCurrentProfile();
  const viewerPermissions = getViewerPermissions();

  return {
    profileId,
    profileData,
    viewerPermissions,
    isLoading,
    error,
    activeTab,
    clearError,
    refetch: () => profileId && loadProfile(profileId)
  };
};

// Legacy hooks for backward compatibility
export const useProfileData = (professionalId: string) => {
  return useQuery({
    queryKey: ['profile', professionalId],
    queryFn: () => fetchProfileData(professionalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useContactProfessional = () => {
  return useMutation({
    mutationFn: contactProfessional,
    onSuccess: (_, variables) => {
      analyticsService.trackContactActionClicked(variables.professionalId, variables.method, 'profile_view');
    }
  });
};

export const useBookProfessional = () => {
  return useMutation({
    mutationFn: bookProfessional,
    onSuccess: (_, variables) => {
      analyticsService.trackBookingCtaClicked(variables.professionalId, 'profile_view');
    }
  });
};

export const useSaveProfile = () => {
  return useMutation({
    mutationFn: saveProfile,
  });
};

export const useReportProfile = () => {
  return useMutation({
    mutationFn: (data: { professionalId: string; reason: string }) => 
      reportProfile(data.professionalId, data.reason),
    onSuccess: (_, variables) => {
      analyticsService.trackReportClicked(variables.professionalId, variables.reason, 'profile_view');
    }
  });
};