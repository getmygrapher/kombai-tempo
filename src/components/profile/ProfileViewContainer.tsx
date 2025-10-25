import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Skeleton,
  Box,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useProfileView } from '../../hooks/useProfileView';
import { useProfileViewStore } from '../../store/profileViewStore';
import { ProfileNavigation } from './ProfileNavigation';
import { ContactCard } from './ContactCard';
import { ActionButtons } from './ActionButtons';
import { ShareModal } from './ShareModal';
import { ReportModal } from './ReportModal';
import { ImageLightbox } from './ImageLightbox';
import { debouncedAnalytics } from '../../utils/analyticsEvents';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
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

const ProfileHeaderSkeleton = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 200,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
}));

const MobileActionBar = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(2),
  borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
  boxShadow: theme.shadows[8],
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

export const ProfileViewContainer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { id: profileId } = useParams<{ id: string }>();
  
  const { profileData, viewerPermissions, isLoading, error } = useProfileView();
  const {
    lightboxOpen,
    selectedImageIndex,
    setLightboxState,
    shareModalOpen,
    reportModalOpen,
    contactModalOpen,
    openShareModal,
    closeShareModal,
    openReportModal,
    closeReportModal,
    openContactModal,
    closeContactModal,
    toggleSaveProfile,
    isProfileSaved
  } = useProfileViewStore();

  // Profile view tracking is now handled in useProfileView hook to avoid duplicates

  const handleImageClick = (imageIndex: number) => {
    setLightboxState(true, imageIndex);
  };

  const handleContactProfessional = (method: string) => {
    if (!profileId) return;
    
    if (method === 'message') {
      // Open communication flow with prefilled template
      navigate('/messages', { 
        state: { 
          recipientId: profileId,
          template: `Hi ${profileData?.professional.name}, I'm interested in your photography services. Could we discuss a potential project?`
        }
      });
    } else if (method === 'phone') {
      // Require consent confirmation
      if (window.confirm('This will share your contact information with the professional. Continue?')) {
        openContactModal();
      }
    } else {
      openContactModal();
    }
  };

  const handleBookProfessional = () => {
    if (!profileId) return;
    // Navigate to availability tab for booking
    navigate(`/profile/${profileId}/availability`);
  };

  const handleSaveProfile = () => {
    if (!profileId) return;
    toggleSaveProfile(profileId);
  };

  const handleShareProfile = () => {
    openShareModal();
  };

  const handleReportProfile = () => {
    openReportModal();
  };

  if (isLoading) {
    return (
      <StyledContainer>
        <ContentContainer>
          {/* Header Skeleton */}
          <ProfileHeaderSkeleton>
            <Skeleton variant="rectangular" width="100%" height={200} />
            <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Skeleton variant="text" width={200} height={32} sx={{ mt: 1 }} />
              <Skeleton variant="text" width={150} height={24} />
            </Box>
          </ProfileHeaderSkeleton>
          
          {/* Navigation Skeleton */}
          <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1 }} />
          
          {/* Content Skeleton */}
          <LoadingContainer>
            <CircularProgress size={48} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading Profile...
            </Typography>
          </LoadingContainer>
        </ContentContainer>
      </StyledContainer>
    );
  }

  if (error || !profileData || !profileId) {
    return (
      <StyledContainer>
        <Alert severity="error" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Profile Not Found
          </Typography>
          <Typography>
            {error || 'Unable to load the requested profile. Please try again later.'}
          </Typography>
        </Alert>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <ContentContainer>
        {/* Profile Navigation */}
        <ProfileNavigation 
          profileId={profileId}
          professional={profileData.professional}
          analytics={profileData.analytics}
        />

        {/* Tab Content via Outlet */}
        <Box sx={{ minHeight: '400px' }}>
          <Outlet context={{
            profileData,
            viewerPermissions,
            onImageClick: handleImageClick,
            onContactProfessional: handleContactProfessional,
            onBookProfessional: handleBookProfessional
          }} />
        </Box>

        {/* Desktop Contact Card */}
        {!isMobile && (
          <ContactCard
            professional={profileData.professional}
            viewerPermissions={viewerPermissions}
            onContact={handleContactProfessional}
            onBook={handleBookProfessional}
            onSave={handleSaveProfile}
            onShare={handleShareProfile}
            onReport={handleReportProfile}
            isSaved={isProfileSaved(profileId)}
          />
        )}

        {/* Mobile Action Bar */}
        {isMobile && (
          <MobileActionBar>
            <ActionButtons
              professional={profileData.professional}
              viewerPermissions={viewerPermissions}
              onContact={handleContactProfessional}
              onBook={handleBookProfessional}
              onSave={handleSaveProfile}
              onShare={handleShareProfile}
              onReport={handleReportProfile}
              isSaved={isProfileSaved(profileId)}
              variant="mobile"
            />
          </MobileActionBar>
        )}

        {/* Modals */}
        <ShareModal
          open={shareModalOpen}
          onClose={closeShareModal}
          professional={profileData.professional}
        />

        <ReportModal
          open={reportModalOpen}
          onClose={closeReportModal}
          professionalId={profileId}
        />

        {/* Image Lightbox */}
        <ImageLightbox
          images={profileData.portfolio.filter(item => item.type === 'image')}
          open={lightboxOpen}
          selectedIndex={selectedImageIndex}
          onClose={() => setLightboxState(false)}
          onIndexChange={(index) => setLightboxState(true, index)}
        />
      </ContentContainer>
    </StyledContainer>
  );
};