import React, { useState, Suspense } from 'react';
import {
  Container,
  Typography,
  Stack,
  Box,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ProfileViewProps, ProfileTab } from '../../data/profileViewSystemMockData';
import { useProfileData } from '../../hooks/useProfileView';
import { ProfileHero } from './ProfileHero';
import { ProfileNavigation } from './ProfileNavigation';
import { ProfileOverview } from './ProfileOverview';
import { PortfolioGallery } from './PortfolioGallery';
import { EquipmentShowcase } from './EquipmentShowcase';
const ReviewsSection = React.lazy(() => import('./ReviewsSection').then(m => ({ default: m.ReviewsSection })));
const AvailabilityWidget = React.lazy(() => import('./AvailabilityWidget').then(m => ({ default: m.AvailabilityWidget })));
import { ContactActions } from './ContactActions';
import { ImageLightbox } from './ImageLightbox';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(12), // Extra space for mobile contact actions
  maxWidth: '1200px',
}));

const LoadingContainer = styled(Stack)(({ theme }) => ({
  minHeight: '50vh',
  justifyContent: 'center',
  alignItems: 'center',
}));

const ContentContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
}));

const MainContent = styled(Stack)(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing(4),
  },
}));

const TabContent = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flex: 1,
  },
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    width: '320px',
    flexShrink: 0,
  },
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

export const EnhancedProfileViewContainer: React.FC<ProfileViewProps> = ({
  professionalId,
  viewMode = 'detailed',
  currentUserId,
  onContactProfessional,
  onBookProfessional,
  onSaveProfile,
  onShareProfile,
  onReportProfile,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.OVERVIEW);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: profileData, isLoading, error } = useProfileData(professionalId);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
  };

  const handleImageClick = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const handleLightboxClose = () => {
    setLightboxOpen(false);
  };

  if (isLoading) {
    return (
      <StyledContainer>
        <LoadingContainer>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Profile...
          </Typography>
        </LoadingContainer>
      </StyledContainer>
    );
  }

  if (error || !profileData) {
    return (
      <StyledContainer>
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Profile Not Found
          </Typography>
          <Typography>
            Unable to load the requested profile. Please try again later.
          </Typography>
        </Alert>
      </StyledContainer>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case ProfileTab.OVERVIEW:
        return (
          <ProfileOverview
            professional={profileData.professional}
            analytics={profileData.analytics}
            viewerPermissions={profileData.viewerPermissions}
          />
        );
      case ProfileTab.PORTFOLIO:
        return (
          <PortfolioGallery
            portfolio={profileData.portfolio}
            professional={profileData.professional}
            onImageClick={handleImageClick}
          />
        );
      case ProfileTab.EQUIPMENT:
        return (
          <EquipmentShowcase
            equipment={profileData.equipment}
            viewerPermissions={profileData.viewerPermissions}
          />
        );
      case ProfileTab.REVIEWS:
        return (
          <Suspense fallback={<Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>}>
            <ReviewsSection
              reviews={profileData.reviews}
              professional={profileData.professional}
            />
          </Suspense>
        );
      case ProfileTab.AVAILABILITY:
        return (
          <Suspense fallback={<Box sx={{ p: 2 }}><CircularProgress size={24} /></Box>}>
            <AvailabilityWidget
              availability={profileData.availability}
              professional={profileData.professional}
              viewerPermissions={profileData.viewerPermissions}
              onBookingRequest={(date, timeSlot) => {
                console.log('Booking request:', date, timeSlot);
                onBookProfessional(professionalId);
              }}
            />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <StyledContainer>
      <ContentContainer>
        {/* Profile Hero Section */}
        <ProfileHero
          professional={profileData.professional}
          analytics={profileData.analytics}
          viewMode={viewMode}
        />

        {/* Profile Navigation */}
        <ProfileNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isMobile={isMobile as any}
        />

        {/* Main Content Area */}
        <MainContent>
          {/* Tab Content */}
          <TabContent>
            {renderTabContent()}
          </TabContent>

          {/* Desktop Sidebar */}
          {!isTablet && (
            <SidebarContent>
              <ContactActions
                professional={profileData.professional}
                viewerPermissions={profileData.viewerPermissions}
                onContact={onContactProfessional}
                onBook={onBookProfessional}
                onSave={onSaveProfile}
                onShare={onShareProfile}
                onReport={onReportProfile}
                variant="desktop"
              />
            </SidebarContent>
          )}
        </MainContent>

        {/* Mobile Contact Actions */}
        {(isMobile || isTablet) && (
          <ContactActions
            professional={profileData.professional}
            viewerPermissions={profileData.viewerPermissions}
            onContact={onContactProfessional}
            onBook={onBookProfessional}
            onSave={onSaveProfile}
            onShare={onShareProfile}
            onReport={onReportProfile}
            variant="mobile"
          />
        )}

        {/* Image Lightbox */}
        <ImageLightbox
          images={profileData.portfolio.filter(item => item.type === 'image')}
          open={lightboxOpen}
          selectedIndex={selectedImageIndex}
          onClose={handleLightboxClose}
          onIndexChange={setSelectedImageIndex}
        />
      </ContentContainer>
    </StyledContainer>
  );
};