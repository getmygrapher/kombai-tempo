import React, { useEffect, useRef } from 'react';
import {
  Tabs,
  Tab,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  Typography,
  Stack,
  Chip,
  Rating
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import VerifiedIcon from '@mui/icons-material/Verified';
import { ProfileTab, Professional, ProfileAnalytics } from '../../data/profileViewSystemMockData';
import { debouncedAnalytics } from '../../utils/analyticsEvents';

interface ProfileNavigationProps {
  profileId?: string;
  professional?: Professional;
  analytics?: ProfileAnalytics;
  activeTab?: ProfileTab;
  onTabChange?: (tab: ProfileTab) => void;
  isMobile?: boolean;
}

const ProfileHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: 200,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
    zIndex: 1,
  },
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 2,
  color: 'white',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTabs-flexContainer': {
    '&[role="tablist"]': {
      // Ensure proper ARIA role
    }
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: '0.95rem',
  minHeight: 48,
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightBold,
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

const tabConfig = [
  { key: ProfileTab.OVERVIEW, label: 'Overview', path: '' },
  { key: ProfileTab.PORTFOLIO, label: 'Portfolio', path: '/portfolio' },
  { key: ProfileTab.EQUIPMENT, label: 'Equipment', path: '/equipment' },
  { key: ProfileTab.REVIEWS, label: 'Reviews', path: '/reviews' },
  { key: ProfileTab.AVAILABILITY, label: 'Availability', path: '/availability' },
];

// Get tab from pathname
const getActiveTabFromPath = (pathname: string): ProfileTab => {
  if (pathname.includes('/portfolio')) return ProfileTab.PORTFOLIO;
  if (pathname.includes('/equipment')) return ProfileTab.EQUIPMENT;
  if (pathname.includes('/reviews')) return ProfileTab.REVIEWS;
  if (pathname.includes('/availability')) return ProfileTab.AVAILABILITY;
  return ProfileTab.OVERVIEW;
};

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  profileId,
  professional,
  analytics,
  activeTab: controlledActiveTab,
  onTabChange,
  isMobile: isMobileProp,
}) => {
  const theme = useTheme();
  const mobileFallback = useMediaQuery(theme.breakpoints.down('md'));
  const computedIsMobile = isMobileProp ?? mobileFallback;
  const location = useLocation();
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);
  
  const routerActiveTab = getActiveTabFromPath(location.pathname);
  const activeTab = controlledActiveTab ?? routerActiveTab;
  const activeTabIndex = tabConfig.findIndex(tab => tab.key === activeTab);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!tabsRef.current?.contains(event.target as Node)) return;
      
      const currentIndex = activeTabIndex;
      let newIndex = currentIndex;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabConfig.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          newIndex = currentIndex < tabConfig.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = tabConfig.length - 1;
          break;
        default:
          return;
      }
      
      // Navigate to new tab using React Router or controlled handler
      const newTab = tabConfig[newIndex];
      if (onTabChange) {
        onTabChange(newTab.key);
      } else if (profileId) {
        const newPath = `/profile/${profileId}${newTab.path}`;
        navigate(newPath);
      }
      
      // Track tab navigation
      if (profileId) {
        debouncedAnalytics.trackProfileTabViewed(profileId, newTab.key, 'keyboard_navigation');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTabIndex, profileId, onTabChange]);

  const handleTabClick = (tabKey: ProfileTab) => {
    const tab = tabConfig.find(t => t.key === tabKey);
    if (!tab) return;

    if (onTabChange) {
      onTabChange(tabKey);
    } else if (profileId) {
      navigate(`/profile/${profileId}${tab.path}`);
    }

    if (profileId) {
      debouncedAnalytics.trackProfileTabViewed(profileId, tabKey, 'tab_click');
    }
  };

  return (
    <Box>
      {/* Profile Header - render only if professional is provided */}
      {professional && (
        <ProfileHeader
          sx={{
            backgroundImage: professional.coverPhoto 
              ? `url(${professional.coverPhoto})`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
          }}
        >
          <ProfileInfo>
            <Stack direction="row" spacing={2} alignItems="flex-end">
              <Avatar
                src={professional.profilePhoto}
                alt={`${professional.name}'s profile photo`}
                sx={{ 
                  width: 80, 
                  height: 80,
                  border: `3px solid ${theme.palette.common.white}`,
                  boxShadow: theme.shadows[4]
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h4" component="h1" sx={{ 
                    fontWeight: 'bold',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {professional.name}
                  </Typography>
                  {professional.isVerified && (
                    <VerifiedIcon 
                      sx={{ 
                        color: theme.palette.info.main,
                        fontSize: '1.5rem'
                      }} 
                      aria-label="Verified professional"
                    />
                  )}
                  <Chip
                    label={professional.tier}
                    size="small"
                    color={professional.tier === 'Pro' ? 'secondary' : 'default'}
                    sx={{ 
                      fontWeight: 'bold',
                      textShadow: 'none'
                    }}
                  />
                </Stack>
                
                <Typography variant="subtitle1" sx={{ 
                  opacity: 0.9,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  {professional.professionalType} • {professional.location.city}, {professional.location.state}
                </Typography>
                
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Rating 
                      value={professional.rating} 
                      precision={0.1} 
                      readOnly 
                      size="small"
                      sx={{ 
                        '& .MuiRating-iconFilled': {
                          color: theme.palette.warning.main
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ 
                      opacity: 0.9,
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {professional.rating} ({professional.totalReviews} reviews)
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body2" sx={{ 
                    opacity: 0.8,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {professional.completedJobs} jobs completed
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </ProfileInfo>
        </ProfileHeader>
      )}

      {/* Navigation Tabs */}
      <StyledTabs
        ref={tabsRef}
        value={activeTabIndex}
        variant={computedIsMobile ? 'scrollable' : 'fullWidth'}
        scrollButtons={computedIsMobile ? 'auto' : false as any}
        allowScrollButtonsMobile
        role="tablist"
        aria-label="Profile sections"
      >
        {tabConfig.map((tab, index) => (
          <StyledTab
            key={tab.key}
            label={tab.label}
            onClick={() => handleTabClick(tab.key)}
            role="tab"
            aria-selected={index === activeTabIndex}
            aria-controls={`tabpanel-${tab.key}`}
            id={`tab-${tab.key}`}
          />
        ))}
      </StyledTabs>
    </Box>
  );
};