// String formatters for homepage components

import { SearchMode, FeaturedSectionType, SortOption } from '../types/homepage';

export const formatSearchPlaceholder = (mode: SearchMode): string => {
  switch (mode) {
    case SearchMode.JOBS:
      return 'Search jobs...';
    case SearchMode.PROFESSIONALS:
      return 'Search professionals...';
    case SearchMode.BOTH:
    default:
      return 'Search jobs, professionals, or locations...';
  }
};

export const formatResultsCount = (count: number, type: 'jobs' | 'professionals'): string => {
  if (count === 0) return `No ${type} found`;
  if (count === 1) return `1 ${type.slice(0, -1)} found`;
  return `${count} ${type} found`;
};

export const formatCategoryStats = (jobCount: number, professionalCount: number): string => {
  return `${jobCount} jobs • ${professionalCount} professionals`;
};

export const formatCityStats = (professionalCount: number, averageRating: number): string => {
  return `${professionalCount} professionals • ${averageRating.toFixed(1)}★ avg rating`;
};

export const formatFeaturedSectionTitle = (type: FeaturedSectionType): string => {
  const titles = {
    [FeaturedSectionType.TOP_RATED]: 'Top Rated Professionals',
    [FeaturedSectionType.RECENTLY_ACTIVE]: 'Recently Active',
    [FeaturedSectionType.TRENDING]: 'Trending This Week',
    [FeaturedSectionType.NEW_ARRIVALS]: 'New to Platform',
    [FeaturedSectionType.SPECIALIZED_SKILLS]: 'Specialized Skills',
    [FeaturedSectionType.QUICK_HIRE]: 'Available for Quick Hire'
  };
  return titles[type];
};

export const formatSortOptionLabel = (option: SortOption): string => {
  const labels = {
    [SortOption.DISTANCE]: 'Distance',
    [SortOption.DATE_POSTED]: 'Date Posted',
    [SortOption.BUDGET_HIGH_TO_LOW]: 'Budget: High to Low',
    [SortOption.BUDGET_LOW_TO_HIGH]: 'Budget: Low to High', 
    [SortOption.URGENCY]: 'Urgency',
    [SortOption.RATING]: 'Rating',
    [SortOption.RELEVANCE]: 'Relevance'
  };
  return labels[option];
};