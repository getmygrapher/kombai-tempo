import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job } from '../types';
import { jobsService } from '../services/jobsService';

interface JobStore {
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getJob: (jobId: string) => Promise<void>;
  setCurrentJob: (job: Job | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      currentJob: null,
      isLoading: false,
      error: null,

      getJob: async (jobId: string) => {
        set({ isLoading: true, error: null });
        try {
          const job = await jobsService.getJob(jobId);
          set({ currentJob: job, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load job',
            isLoading: false 
          });
        }
      },

      setCurrentJob: (job) => set({ currentJob: job }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'job-store',
      partialize: (state) => ({ currentJob: state.currentJob }),
    }
  )
);