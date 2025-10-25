import { useQuery } from '@tanstack/react-query';
import { Professional, Coordinates, DistanceRadius, SearchFilters } from '../types';
import { mockQuery } from '../data/getMyGrapherMockData';

export const useNearbyProfessionals = (
  location: Coordinates,
  radius: DistanceRadius,
  filters?: SearchFilters
) => {
  return useQuery({
    queryKey: ['nearbyProfessionals', location, radius, filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        professionals: mockQuery.nearbyProfessionals,
        total: mockQuery.nearbyProfessionals.length,
        hasMore: false
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProfessionalProfile = (professionalId: string) => {
  return useQuery({
    queryKey: ['professionalProfile', professionalId],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockQuery.nearbyProfessionals.find(prof => prof.id === professionalId);
    },
    enabled: !!professionalId,
  });
};