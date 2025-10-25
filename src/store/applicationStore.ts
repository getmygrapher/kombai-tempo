import { create } from 'zustand';
import { Application } from '../types';

interface ApplicationStore {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getApplications: (jobId: string) => Application[];
  submitApplication: (jobId: string, message: string, proposedRate?: number) => Promise<void>;
  withdrawApplication: (applicationId: string) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<void>;
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,

  getApplications: (jobId: string) => {
    const { applications } = get();
    return applications.filter(app => app.jobId === jobId);
  },

  submitApplication: async (jobId: string, message: string, proposedRate?: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newApplication: Application = {
        id: `app_${Date.now()}`,
        jobId,
        applicantId: 'current-user',
        applicant: {
          id: 'current-user',
          name: 'Current User',
          profilePhoto: 'https://i.pravatar.cc/150?img=1',
          professionalType: 'Photographer',
          specializations: ['Wedding Photography'],
          experience: 'MID' as any,
          location: {
            city: 'Kochi',
            state: 'Kerala',
            coordinates: { lat: 9.9312, lng: 76.2673 }
          },
          pricing: {
            type: 'Per Event' as any,
            rate: 25000,
            isNegotiable: true
          },
          rating: 4.5,
          totalReviews: 45,
          isVerified: true,
          tier: 'PRO' as any
        },
        message,
        proposedRate,
        status: 'PENDING' as any,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({
        applications: [...state.applications, newApplication],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: 'Failed to submit application' });
      throw error;
    }
  },

  withdrawApplication: async (applicationId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        applications: state.applications.filter(app => app.id !== applicationId),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: 'Failed to withdraw application' });
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId: string, status: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        applications: state.applications.map(app =>
          app.id === applicationId
            ? { ...app, status: status as any, updatedAt: new Date().toISOString() }
            : app
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: 'Failed to update application status' });
      throw error;
    }
  }
}));