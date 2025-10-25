import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Job, Coordinates, DistanceRadius, JobFilters } from '../types';
import { JobStatus, ApplicationStatus } from '../types/enums';
import { jobsService, jobsQueries } from '../services/jobsService';

export const useNearbyJobs = (
  location: Coordinates,
  radius: DistanceRadius,
  filters?: JobFilters
) => {
  return useQuery({
    queryKey: jobsQueries.nearby(location, radius, filters),
    queryFn: async () => {
      return await jobsService.getNearbyJobs(location, radius, filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJobDetails = (jobId: string) => {
  return useQuery({
    queryKey: jobsQueries.detail(jobId),
    queryFn: async () => {
      return await jobsService.getJob(jobId);
    },
    enabled: !!jobId,
  });
};

export const useMyJobs = (status?: JobStatus) => {
  return useQuery({
    queryKey: jobsQueries.myJobs(status),
    queryFn: async () => {
      return await jobsService.getMyJobs(status);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobData: Partial<Job>) => {
      return await jobsService.createJob(jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      queryClient.invalidateQueries({ queryKey: ['nearbyJobs'] });
    },
  });
};

export const useJobApplications = (jobId: string) => {
  return useQuery({
    queryKey: jobsQueries.applications(jobId),
    queryFn: async () => {
      return await jobsService.getJobApplications(jobId);
    },
    enabled: !!jobId,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (applicationData: {
      jobId: string;
      message: string;
      proposedRate?: number;
    }) => {
      const result = await jobsService.applyToJob(applicationData.jobId, {
        message: applicationData.message,
        proposedRate: applicationData.proposedRate,
        currency: 'INR'
      });
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobDetails', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobApplications', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['nearbyJobs'] });
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      applicationId: string;
      status: string;
    }) => {
      return await jobsService.updateApplicationStatus(data.applicationId, data.status as ApplicationStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
    },
  });
};