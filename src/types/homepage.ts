// Homepage-specific enums and types for the enhanced homepage system

export enum SearchMode {
  JOBS = 'jobs',
  PROFESSIONALS = 'professionals', 
  BOTH = 'both'
}

export enum ContentDisplayMode {
  JOBS = 'jobs',
  PROFESSIONALS = 'professionals'
}

export enum ViewMode {
  CARD = 'card',
  LIST = 'list'
}

export enum FeaturedSectionType {
  TOP_RATED = 'top-rated',
  RECENTLY_ACTIVE = 'recently-active',
  TRENDING = 'trending',
  NEW_ARRIVALS = 'new-arrivals',
  SPECIALIZED_SKILLS = 'specialized-skills',
  QUICK_HIRE = 'quick-hire'
}

export enum SortOption {
  DISTANCE = 'distance',
  DATE_POSTED = 'date_posted', 
  BUDGET_HIGH_TO_LOW = 'budget_high_to_low',
  BUDGET_LOW_TO_HIGH = 'budget_low_to_high',
  URGENCY = 'urgency',
  RATING = 'rating',
  RELEVANCE = 'relevance'
}

// Homepage component interfaces
export interface HomepageProps {
  initialSearchMode?: SearchMode;
  initialDisplayMode?: ContentDisplayMode;
  showFeaturedSections?: boolean;
  enableVoiceSearch?: boolean;
  maxSearchSuggestions?: number;
}

export interface SearchBarProps {
  searchQuery: string;
  searchMode: SearchMode;
  suggestions: string[];
  onSearchChange: (query: string) => void;
  onModeChange: (mode: SearchMode) => void;
  onSuggestionSelect: (suggestion: string) => void;
}

export interface CategoryGridProps {
  categories: CategoryInfo[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export interface FeaturedSectionProps {
  type: FeaturedSectionType;
  professionals: any[];
  title: string;
  onViewAll: () => void;
  onProfessionalSelect: (id: string) => void;
}

// Homepage state interfaces
export interface HomepageState {
  searchQuery: string;
  searchMode: SearchMode;
  selectedCategory: string | null;
  displayMode: ContentDisplayMode;
  viewMode: ViewMode;
  sortBy: SortOption;
  filters: HomepageFilters;
  recentSearches: string[];
  savedSearches: SavedSearch[];
  isLoading: boolean;
  error: string | null;
}

export interface HomepageFilters {
  location: LocationFilter;
  category: string[];
  budget: BudgetFilter;
  rating: number;
  experience: string[];
  availability: boolean;
  verified: boolean;
  distance: number;
}

export interface LocationFilter {
  city?: string;
  state?: string;
  radius: number;
}

export interface BudgetFilter {
  min: number;
  max: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  jobCount: number;
  professionalCount: number;
  trending: boolean;
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  professionalCount: number;
  averageRating: number;
  popularCategories: string[];
  isTopCity: boolean;
}

export interface SavedSearch {
  id: string;
  query: string;
  filters: Partial<HomepageFilters>;
  name: string;
  createdAt: string;
}

// API response interfaces
export interface SearchResults {
  jobs: any[];
  professionals: any[];
  total: number;
  hasMore: boolean;
  suggestions: string[];
}

export interface FeaturedContent {
  topRated: any[];
  trending: any[];
  recentlyActive: any[];
  newArrivals: any[];
  specializedSkills: any[];
  quickHire: any[];
}

export interface CategoryStats {
  category: string;
  jobCount: number;
  professionalCount: number;
  trending: boolean;
  averageRating: number;
}