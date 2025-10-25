import React, { useEffect } from 'react';
import {
  Container,
  Stack,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAppStore } from '../../store/appStore';
import { useNearbyJobs } from '../../hooks/useJobs';
import { useNearbyProfessionals } from '../../hooks/useProfessionals';
import { 
  useHomepageStore, 
  useFeaturedProfessionals, 
  useTopCities, 
  useCategoryStats 
} from '../../hooks/useHomepage';
import { UniversalSearchBar } from './UniversalSearchBar';
import { CategoryGrid } from './CategoryGrid';
import { FeaturedProfessionalsSection } from './FeaturedProfessionalsSection';
import { TopCitiesSection } from './TopCitiesSection';
import { ContentDisplayArea } from './ContentDisplayArea';
import { QuickActionsPanel } from './QuickActionsPanel';
import { ContentDisplayMode, FeaturedSectionType } from '../../types/homepage';

interface EnhancedHomePageProps {
  onJobDetails: (jobId: string) => void;
  onJobApply: (jobId: string) => void;
  onCreateJob: () => void;
  onViewProfile: (professionalId: string) => void;
  onSendMessage: (professionalId: string) => void;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(12), // Space for floating actions and bottom nav
  maxWidth: '1200px'
}));

const WelcomeSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3, 0)
}));

const SectionDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(4, 0)
}));

export const EnhancedHomePage: React.FC<EnhancedHomePageProps> = ({
  onJobDetails,
  onJobApply,
  onCreateJob,
  onViewProfile,
  onSendMessage
}) => {
  const { currentLocation, selectedRadius } = useAppStore();
  const {
    searchQuery,
    searchMode,
    selectedCategory,
    displayMode,
    viewMode,
    sortBy,
    recentSearches,
    setSearchQuery,
    setSearchMode,
    setDisplayMode,
    setViewMode,
    setSortBy,
    setSelectedCategory,
    addRecentSearch
  } = useHomepageStore();

  // Data fetching hooks
  const { data: jobsData, isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useNearbyJobs(
    currentLocation || { lat: 9.9312, lng: 76.2673 },
    selectedRadius
  );

  const { data: professionalsData, isLoading: professionalsLoading, error: professionalsError, refetch: refetchProfessionals } = useNearbyProfessionals(
    currentLocation || { lat: 9.9312, lng: 76.2673 },
    selectedRadius
  );

  const { data: topRatedProfessionals, isLoading: topRatedLoading } = useFeaturedProfessionals('top-rated');
  const { data: trendingProfessionals, isLoading: trendingLoading } = useFeaturedProfessionals('trending');
  const { data: recentlyActiveProfessionals, isLoading: recentlyActiveLoading } = useFeaturedProfessionals('recently-active');
  const { data: topCities, isLoading: citiesLoading } = useTopCities();
  const { data: categoryStats, isLoading: categoriesLoading } = useCategoryStats();

  const jobs = jobsData?.jobs || [];
  const professionals = professionalsData?.professionals || [];
  const isContentLoading = displayMode === ContentDisplayMode.JOBS ? jobsLoading : professionalsLoading;
  const contentError = displayMode === ContentDisplayMode.JOBS ? jobsError : professionalsError;

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    addRecentSearch(suggestion);
  };

  const handleRecentSearchSelect = (search: string) => {
    setSearchQuery(search);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleRefresh = () => {
    if (displayMode === ContentDisplayMode.JOBS) {
      refetchJobs();
    } else {
      refetchProfessionals();
    }
  };

  const handleLoadMore = async () => {
    // Implement pagination logic here
    console.log('Loading more content...');
  };

  const handleEmergencyHire = () => {
    // Set urgent filter and switch to professionals view
    setDisplayMode(ContentDisplayMode.PROFESSIONALS);
    // Add emergency hire logic
    console.log('Emergency hire initiated');
  };

  const handleSearchJobs = () => {
    setDisplayMode(ContentDisplayMode.JOBS);
  };

  const handleSearchProfessionals = () => {
    setDisplayMode(ContentDisplayMode.PROFESSIONALS);
  };

  return (
    <>
      <StyledContainer>
        <Stack spacing={4}>
          {/* Welcome Section */}
          <WelcomeSection>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Find Jobs & Professionals
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Discover opportunities and connect with creative professionals in your area
            </Typography>
          </WelcomeSection>

          {/* Universal Search */}
          <UniversalSearchBar
            searchQuery={searchQuery}
            searchMode={searchMode}
            recentSearches={recentSearches}
            onSearchChange={handleSearchChange}
            onModeChange={setSearchMode}
            onSuggestionSelect={handleSuggestionSelect}
            onRecentSearchSelect={handleRecentSearchSelect}
          />

          {/* Category Navigation */}
          {categoryStats && (
            <CategoryGrid
              categories={categoryStats}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          )}

          <SectionDivider />

          {/* Featured Professionals Sections */}
          <Stack spacing={3}>
            <FeaturedProfessionalsSection
              type={FeaturedSectionType.TOP_RATED}
              professionals={topRatedProfessionals || []}
              isLoading={topRatedLoading}
              onViewAll={() => setDisplayMode(ContentDisplayMode.PROFESSIONALS)}
              onProfessionalSelect={onViewProfile}
              onSendMessage={onSendMessage}
            />

            <FeaturedProfessionalsSection
              type={FeaturedSectionType.TRENDING}
              professionals={trendingProfessionals || []}
              isLoading={trendingLoading}
              onViewAll={() => setDisplayMode(ContentDisplayMode.PROFESSIONALS)}
              onProfessionalSelect={onViewProfile}
              onSendMessage={onSendMessage}
            />

            <FeaturedProfessionalsSection
              type={FeaturedSectionType.RECENTLY_ACTIVE}
              professionals={recentlyActiveProfessionals || []}
              isLoading={recentlyActiveLoading}
              onViewAll={() => setDisplayMode(ContentDisplayMode.PROFESSIONALS)}
              onProfessionalSelect={onViewProfile}
              onSendMessage={onSendMessage}
            />
          </Stack>

          <SectionDivider />

          {/* Top Cities Section */}
          <TopCitiesSection
            cities={topCities || []}
            isLoading={citiesLoading}
            onViewAll={() => console.log('View all cities')}
            onCitySelect={(cityId) => console.log('City selected:', cityId)}
          />

          <SectionDivider />

          {/* Content Display Area */}
          <ContentDisplayArea
            displayMode={displayMode}
            viewMode={viewMode}
            sortBy={sortBy}
            jobs={jobs}
            professionals={professionals}
            isLoading={isContentLoading as any}
            error={contentError?.message || null}
            hasMore={true as any}
            onDisplayModeChange={setDisplayMode}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            onJobSelect={onJobDetails}
            onJobApply={onJobApply}
            onProfessionalSelect={onViewProfile}
            onSendMessage={onSendMessage}
          />
        </Stack>
      </StyledContainer>

      {/* Quick Actions Panel */}
      <QuickActionsPanel
        onPostJob={onCreateJob}
        onEmergencyHire={handleEmergencyHire}
        onSearchJobs={handleSearchJobs}
        onSearchProfessionals={handleSearchProfessionals}
      />
    </>
  );
};