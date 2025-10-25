import React, { useEffect } from 'react';
import { Box, Typography, Stack, Button, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import { CommunityLibraryBrowser } from './CommunityLibraryBrowser';
import { useCommunityStore } from '../../store/communityStore';
import { useAppStore } from '../../store/appStore';
import { mockQuery } from '../../data/communityPosingLibraryMockData';
import communityTheme from '../../theme/communityTheme';

interface CommunityPosingLibraryProps {
  initialTab?: 'browse' | 'contribute' | 'saved';
  onNavigateToBrowse?: () => void;
  onNavigateToContribute?: () => void;
  onNavigateToSaved?: () => void;
}

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  minHeight: '100vh',
}));

const WelcomeCard = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${communityTheme.community.primary.background} 0%, ${communityTheme.community.secondary.background} 100%)`,
  borderRadius: communityTheme.layout.cardBorderRadius,
  padding: theme.spacing(4),
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: communityTheme.layout.buttonBorderRadius,
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  fontWeight: 600,
  transition: communityTheme.animations.buttonPress,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(4),
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: communityTheme.layout.cardBorderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  boxShadow: theme.shadows[1],
  transition: communityTheme.animations.cardHover,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  backgroundColor: communityTheme.community.primary.background,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  color: communityTheme.community.primary.main,
}));

export const CommunityPosingLibrary: React.FC<CommunityPosingLibraryProps> = ({
  initialTab = 'browse',
  onNavigateToBrowse,
  onNavigateToContribute,
  onNavigateToSaved,
}) => {
  const { 
    setPoses, 
    setComments, 
    setLoading, 
    setError 
  } = useCommunityStore();

  // Initialize with mock data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Simulate API loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPoses(mockQuery.communityPoses);
        setComments(mockQuery.poseComments);
      } catch (error) {
        setError('Failed to load community data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [setPoses, setComments, setLoading, setError]);

  const handleNavigateToLibrary = () => {
    if (onNavigateToBrowse) {
      onNavigateToBrowse();
    }
  };

  const handleNavigateToContribute = () => {
    if (onNavigateToContribute) {
      onNavigateToContribute();
    }
  };

  const handleNavigateToSaved = () => {
    if (onNavigateToSaved) {
      onNavigateToSaved();
    }
  };

  // Main landing page
  return (
    <StyledContainer>
      <Stack spacing={4}>
        {/* Welcome Section */}
        <WelcomeCard>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            🌟 Community Posing Library
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Transform your photography with community-shared posing techniques
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Learn from experienced photographers, discover new poses, and share your own creative insights with the GetMyGrapher community.
          </Typography>
          
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <ActionButton
              variant="contained"
              size="large"
              startIcon={<PhotoLibraryOutlinedIcon />}
              onClick={handleNavigateToLibrary}
            >
              Browse Poses
            </ActionButton>
            <ActionButton
              variant="outlined"
              size="large"
              startIcon={<AddPhotoAlternateOutlinedIcon />}
              onClick={handleNavigateToContribute}
            >
              Contribute
            </ActionButton>
          </Stack>
        </WelcomeCard>

        {/* Feature Cards */}
        <Box>
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Discover & Learn
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            Explore our comprehensive library of posing techniques and camera settings
          </Typography>

          <FeatureGrid>
            <FeatureCard onClick={handleNavigateToLibrary}>
              <IconContainer>
                <PhotoLibraryOutlinedIcon fontSize="large" />
              </IconContainer>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Browse Poses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Discover thousands of poses with detailed tips, camera settings, and behind-the-scenes stories from professional photographers.
              </Typography>
            </FeatureCard>

            <FeatureCard onClick={handleNavigateToContribute}>
              <IconContainer>
                <AddPhotoAlternateOutlinedIcon fontSize="large" />
              </IconContainer>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Share Your Work
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contribute your best poses to help fellow photographers learn. Share your techniques, settings, and creative process.
              </Typography>
            </FeatureCard>

            <FeatureCard onClick={handleNavigateToSaved}>
              <IconContainer>
                <BookmarkBorderOutlinedIcon fontSize="large" />
              </IconContainer>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Saved Collection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep track of your favorite poses and build your personal collection for quick reference during shoots.
              </Typography>
            </FeatureCard>
          </FeatureGrid>
        </Box>

        {/* Stats Section */}
        <Box textAlign="center" py={4}>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Join Our Growing Community
          </Typography>
          <Stack direction="row" spacing={4} justifyContent="center" flexWrap="wrap">
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                1,200+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Poses Shared
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                850+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contributors
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                15K+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Community Likes
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </StyledContainer>
  );
};