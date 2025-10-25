import { supabase } from './supabaseClient';
import { 
  Job,
  JobFilters,
  Coordinates,
  DistanceRadius,
  BudgetRange,
  JobLocation,
  Application
} from '../types';
import { 
  BudgetType,
  JobStatus,
  UrgencyLevel,
  ProfessionalCategory,
  AvailabilityStatus,
  ApplicationStatus
} from '../types/enums';

function mapError(error: any): Error {
  if (!error) return new Error('Unknown error');
  const message = error.message || error.error_description || 'Unexpected error';
  return new Error(message);
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw mapError(error);
  const uid = data.user?.id;
  if (!uid) throw new Error('No authenticated user');
  return uid;
}

function radiusToKm(radius: DistanceRadius): number {
  switch (radius) {
    case DistanceRadius.FIVE_KM: return 5;
    case DistanceRadius.TEN_KM: return 10;
    case DistanceRadius.TWENTY_FIVE_KM: return 25;
    case DistanceRadius.FIFTY_KM: return 50;
    case DistanceRadius.HUNDRED_PLUS_KM: return 100;
    default: return 25;
  }
}

// DB row mapping
type JobRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  professional_types: string[] | null;
  date: string | null; // date
  end_date?: string | null;
  time_slots: any[] | null; // jsonb array
  urgency: string | null;
  status: string;
  location_city: string | null;
  location_state: string | null;
  location_pin_code: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string | null;
  budget_type: string | null;
  budget_is_negotiable: boolean | null;
  view_count: number | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  // Nearby specific
  distance_km?: number | null;
};

function mapJob(row: JobRow): Job {
  const jobLocation: JobLocation = {
    city: row.location_city || '',
    state: row.location_state || '',
    pinCode: row.location_pin_code || undefined,
    address: row.location_address || undefined,
    coordinates: {
      lat: row.location_lat || 0,
      lng: row.location_lng || 0
    },
    venueDetails: undefined,
    accessInstructions: undefined,
    parkingAvailable: undefined
  };

  const budget: BudgetRange = {
    min: Number(row.budget_min || 0),
    max: Number(row.budget_max || 0),
    currency: (row.budget_currency as 'INR') || 'INR',
    type: (row.budget_type as BudgetType) || BudgetType.FIXED,
    isNegotiable: !!row.budget_is_negotiable
  };

  const timeSlots = Array.isArray(row.time_slots) ? row.time_slots.map((ts: any) => ({
    start: ts.start,
    end: ts.end,
    status: ts.status as AvailabilityStatus
  })) : undefined;

  const expiresAtIso = row.expires_at || '';
  const isExpired = !!(row.expires_at && new Date(row.expires_at).getTime() < Date.now());

  return {
    id: row.id,
    title: row.title,
    type: (row.category as ProfessionalCategory) || ProfessionalCategory.PHOTOGRAPHY,
    professionalTypesNeeded: row.professional_types || [],
    date: row.date || '',
    endDate: row.end_date || undefined,
    timeSlots,
    location: jobLocation,
    budgetRange: budget,
    description: row.description || '',
    urgency: (row.urgency as UrgencyLevel) || UrgencyLevel.NORMAL,
    postedBy: {
      id: row.user_id,
      name: '',
      rating: 0,
      totalJobs: 0
    },
    applicants: [],
    status: row.status as JobStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: expiresAtIso,
    isExpired,
    viewCount: Number(row.view_count || 0),
    distance: row.distance_km || undefined
  };
}

export const jobsQueries = {
  nearby: (location: Coordinates, radius: DistanceRadius, filters?: JobFilters) => ['nearbyJobs', location, radius, filters],
  detail: (jobId: string) => ['jobDetails', jobId],
  myJobs: (status?: JobStatus) => ['myJobs', status],
  applications: (jobId: string) => ['jobApplications', jobId],
  search: (query: string, filters?: any) => ['searchJobs', query, filters]
};

export const jobsService = {
  async createJob(jobData: Partial<Job>): Promise<{ job: Job; success: boolean; message?: string }> {
    try {
      // Build payload for RPC
      const payload: Record<string, any> = {
        title: jobData.title || '',
        description: jobData.description || null,
        category: jobData.type || null,
        professional_types: jobData.professionalTypesNeeded || [],
        date: jobData.date ? jobData.date.substring(0, 10) : null,
        end_date: jobData.endDate ? jobData.endDate.substring(0, 10) : null,
        time_slots: jobData.timeSlots || [],
        urgency: jobData.urgency || UrgencyLevel.NORMAL,
        status: jobData.status || JobStatus.ACTIVE,
        approved: true,
        location_city: jobData.location?.city || null,
        location_state: jobData.location?.state || null,
        location_pin_code: jobData.location?.pinCode || null,
        location_address: jobData.location?.address || null,
        location_lat: jobData.location?.coordinates?.lat ?? null,
        location_lng: jobData.location?.coordinates?.lng ?? null,
        budget_min: jobData.budgetRange?.min ?? null,
        budget_max: jobData.budgetRange?.max ?? null,
        budget_currency: jobData.budgetRange?.currency || 'INR',
        budget_type: jobData.budgetRange?.type || BudgetType.FIXED,
        budget_is_negotiable: jobData.budgetRange?.isNegotiable ?? false,
        expires_at: jobData.expiresAt || null
      };

      const { data, error } = await supabase.rpc('create_job', { job_data: payload });
      if (error) throw mapError(error);

      const newJobId: string = data as string;
      const job = await this.getJob(newJobId);
      return { job, success: true, message: 'Job posted successfully!' };
    } catch (error) {
      throw mapError(error);
    }
  },

  async updateJob(jobId: string, updates: Partial<Job>): Promise<{ success: boolean }> {
    try {
      const payload: Record<string, any> = {
        title: updates.title ?? undefined,
        description: updates.description ?? undefined,
        category: updates.type ?? undefined,
        professional_types: updates.professionalTypesNeeded ?? undefined,
        date: updates.date ? updates.date.substring(0, 10) : undefined,
        end_date: updates.endDate ? updates.endDate.substring(0, 10) : undefined,
        time_slots: updates.timeSlots ?? undefined,
        urgency: updates.urgency ?? undefined,
        status: updates.status ?? undefined,
        approved: undefined,
        location_city: updates.location?.city ?? undefined,
        location_state: updates.location?.state ?? undefined,
        location_pin_code: updates.location?.pinCode ?? undefined,
        location_address: updates.location?.address ?? undefined,
        location_lat: updates.location?.coordinates?.lat ?? undefined,
        location_lng: updates.location?.coordinates?.lng ?? undefined,
        budget_min: updates.budgetRange?.min ?? undefined,
        budget_max: updates.budgetRange?.max ?? undefined,
        budget_currency: updates.budgetRange?.currency ?? undefined,
        budget_type: updates.budgetRange?.type ?? undefined,
        budget_is_negotiable: updates.budgetRange?.isNegotiable ?? undefined,
        expires_at: updates.expiresAt ?? undefined
      };

      const { error } = await supabase.rpc('update_job', { job_id: jobId, job_data: payload });
      if (error) throw mapError(error);
      return { success: true };
    } catch (error) {
      throw mapError(error);
    }
  },

  async getJob(jobId: string): Promise<Job> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();
      if (error) throw mapError(error);
      if (!data) throw new Error('Job not found');
      return mapJob(data as JobRow);
    } catch (error) {
      throw mapError(error);
    }
  },

  async getNearbyJobs(location: Coordinates, radius: DistanceRadius, filters?: JobFilters): Promise<{ jobs: Job[]; total: number; hasMore: boolean }> {
    try {
      const km = radiusToKm(radius);
      const filterPayload: Record<string, any> = {};

      if (filters?.urgency && filters.urgency.length > 0) {
        // Use the first selected urgency for now
        filterPayload.urgency = filters.urgency[0];
      }
      if (filters?.dateRange?.start) filterPayload.date_start = filters.dateRange.start;
      if (filters?.dateRange?.end) filterPayload.date_end = filters.dateRange.end;
      if (filters?.budgetRange) {
        filterPayload.budget_min = filters.budgetRange.min;
        filterPayload.budget_max = filters.budgetRange.max;
      }

      const { data, error } = await supabase.rpc('get_nearby_jobs', {
        lat: location.lat,
        lng: location.lng,
        radius_km: km,
        filters: filterPayload
      });
      if (error) throw mapError(error);
      const jobs = (data as JobRow[]).map(mapJob);
      return { jobs, total: jobs.length, hasMore: false };
    } catch (error) {
      throw mapError(error);
    }
  },

  async searchJobs(query: string, filters?: Partial<JobFilters> & { professionalTypes?: string[] }): Promise<{ jobs: Job[]; total: number; hasMore: boolean }> {
    try {
      const filterPayload: Record<string, any> = {};
      if (filters?.categories && filters.categories.length > 0) {
        filterPayload.category = filters.categories[0];
      }
      if (filters?.professionalTypes && filters.professionalTypes.length > 0) {
        filterPayload.professional_types = filters.professionalTypes;
      }
      if (filters?.dateRange?.start) filterPayload.date_start = filters.dateRange.start;
      if (filters?.dateRange?.end) filterPayload.date_end = filters.dateRange.end;

      const { data, error } = await supabase.rpc('search_jobs', {
        query,
        filters: filterPayload
      });
      if (error) throw mapError(error);
      const jobs = (data as JobRow[]).map(mapJob);
      return { jobs, total: jobs.length, hasMore: false };
    } catch (error) {
      throw mapError(error);
    }
  },

  async getMyJobs(status?: JobStatus): Promise<{ jobs: Job[]; total: number; hasMore: boolean }> {
    try {
      const { data, error } = await supabase.rpc('get_my_jobs', { status_filter: status || null });
      if (error) throw mapError(error);
      const jobs = (data as JobRow[]).map(mapJob);
      return { jobs, total: jobs.length, hasMore: false };
    } catch (error) {
      throw mapError(error);
    }
  },

  async deleteJob(jobId: string): Promise<{ success: boolean }> {
    try {
      const uid = await getCurrentUserId();
      // Ownership enforced by RLS; delete directly
      const { error } = await supabase.from('jobs').delete().eq('id', jobId).eq('user_id', uid);
      if (error) throw mapError(error);
      return { success: true };
    } catch (error) {
      throw mapError(error);
    }
  },

  async applyToJob(jobId: string, applicationInput: { message: string; proposedRate?: number; currency?: 'INR' }): Promise<{ success: boolean; applicationId: string }> {
    try {
      const { data, error } = await supabase.rpc('apply_to_job', {
        job_id: jobId,
        application_data: {
          message: applicationInput.message,
          proposed_rate: applicationInput.proposedRate ?? null,
          currency: applicationInput.currency || 'INR'
        }
      });
      if (error) throw mapError(error);
      return { success: true, applicationId: data as string };
    } catch (error) {
      throw mapError(error);
    }
  },

  async getJobApplications(jobId: string): Promise<{ applications: Application[]; total: number }> {
    try {
      const { data, error } = await supabase.rpc('get_job_applications', { job_id: jobId });
      if (error) throw mapError(error);
      const applications: Application[] = (data as any[]).map((row) => ({
        id: row.id,
        jobId: row.job_id,
        applicantId: row.applicant_id,
        applicant: {
          id: row.applicant_id,
          name: 'Applicant',
          profilePhoto: '',
          professionalType: '',
          specializations: [],
          experience: '0-1 years' as any,
          location: { city: '', state: '', coordinates: { lat: 0, lng: 0 } },
          pricing: { type: 'Per Event' as any, rate: row.proposed_rate || 0, isNegotiable: true },
          rating: 0,
          totalReviews: 0,
          isVerified: false,
          tier: 'Free' as any
        },
        message: row.message || '',
        proposedRate: row.proposed_rate || undefined,
        status: row.status as ApplicationStatus,
        appliedAt: row.applied_at,
        updatedAt: row.updated_at
      }));
      return { applications, total: applications.length };
    } catch (error) {
      throw mapError(error);
    }
  },

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase.rpc('update_application_status', {
        application_id: applicationId,
        new_status: status
      });
      if (error) throw mapError(error);
      return { success: true };
    } catch (error) {
      throw mapError(error);
    }
  },

  async saveJob(jobId: string): Promise<{ success: boolean }> {
    try {
      const uid = await getCurrentUserId();
      const { error } = await supabase.from('job_saves').upsert({ user_id: uid, job_id: jobId });
      if (error) throw mapError(error);
      return { success: true };
    } catch (error) {
      throw mapError(error);
    }
  },

  async unsaveJob(jobId: string): Promise<{ success: boolean }> {
    try {
      const uid = await getCurrentUserId();
      const { error } = await supabase.from('job_saves').delete().eq('user_id', uid).eq('job_id', jobId);
      if (error) throw mapError(error);
      return { success: true };
    } catch (error) {
      throw mapError(error);
    }
  },

  async getSavedJobs(): Promise<{ jobs: Job[]; total: number; hasMore: boolean }> {
    try {
      const uid = await getCurrentUserId();
      const { data: saves, error: savesError } = await supabase
        .from('job_saves')
        .select('job_id')
        .eq('user_id', uid);
      if (savesError) throw mapError(savesError);
      const ids = (saves || []).map((s) => s.job_id);
      if (ids.length === 0) return { jobs: [], total: 0, hasMore: false };
      const { data, error } = await supabase.from('jobs').select('*').in('id', ids);
      if (error) throw mapError(error);
      const jobs = (data as JobRow[]).map(mapJob);
      return { jobs, total: jobs.length, hasMore: false };
    } catch (error) {
      throw mapError(error);
    }
  }
};