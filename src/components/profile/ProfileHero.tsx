import React from 'react';
import {
  Box,
  Stack,
  Typography,
  Avatar,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { RatingDisplay } from '../common/RatingDisplay';
import { StatusChip } from '../common/StatusChip';
import { Professional, ProfileAnalytics } from '../../data/profileViewSystemMockData';
import { 
  formatLastActive, 
  formatCompletedJobs, 
  formatProfileViewCount 
} from '../../data/profileViewSystemMockData';

interface ProfileHeroProps {
  professional: Professional;
  analytics: ProfileAnalytics;
  viewMode: 'public' | 'detailed' | 'mobile' | 'preview';
}

const HeroContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const CoverImage = styled(Box)(({ theme }) => ({
  height: '200px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    height: '280px',
  },
}));

const CoverOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)',
}));

const ProfileContent = styled(Stack)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  marginTop: theme.spacing(-8),
  zIndex: 1,
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    width: 100,
    height: 100,
  },
}));

const TierBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
  zIndex: 2,
}));

const StatsContainer = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  minWidth: '80px',
}));

const OnlineIndicator = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  border: `2px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: 8,
  right: 8,
}));

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  professional,
  analytics,
  viewMode,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isOnline = () => {
    const now = new Date();
    const lastActiveTime = new Date(professional.lastActive);
    const diffInMinutes = Math.floor((now.getTime() - lastActiveTime.getTime()) / (1000 * 60));
    return diffInMinutes < 5;
  };

  return (
    <HeroContainer elevation={2}>
      {/* Cover Image */}
      <CoverImage
        sx={{
          backgroundImage: professional.coverPhoto 
            ? `url(${professional.coverPhoto})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CoverOverlay />
        
        {/* Tier Badge */}
        {professional.tier === 'Pro' && (
          <TierBadge label="PRO MEMBER" size="small" />
        )}
      </CoverImage>

      {/* Profile Content */}
      <ProfileContent spacing={2} alignItems="center">
        {/* Profile Avatar */}
        <Box position="relative">
          <ProfileAvatar
            src={professional.profilePhoto}
            alt={professional.name}
          >
            {professional.name.charAt(0)}
          </ProfileAvatar>
          {isOnline() && <OnlineIndicator />}
        </Box>

        {/* Basic Information */}
        <Stack spacing={1} alignItems="center" textAlign="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {professional.name}
            </Typography>
            {professional.isVerified && (
              <VerifiedOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
            )}
          </Stack>

          <Typography variant="h6" color="text.secondary">
            {professional.professionalType}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {professional.location.city}, {professional.location.state}
            </Typography>
          </Stack>

          {/* Rating */}
          <RatingDisplay
            rating={professional.rating}
            totalReviews={professional.totalReviews}
            size="medium"
          />

          {/* Status */}
          <Typography variant="body2" color="text.secondary">
            {formatLastActive(professional.lastActive)}
          </Typography>
        </Stack>

        {/* Specializations */}
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
          {professional.specializations.slice(0, isMobile ? 2 : 3).map((spec, index) => (
            <Chip
              key={index}
              label={spec}
              size="small"
              variant="outlined"
              color="primary"
            />
          ))}
          {professional.specializations.length > (isMobile ? 2 : 3) && (
            <Chip
              label={`+${professional.specializations.length - (isMobile ? 2 : 3)} more`}
              size="small"
              variant="outlined"
              color="default"
            />
          )}
        </Stack>

        {/* Statistics */}
        <StatsContainer direction="row" spacing={3} justifyContent="center">
          <StatItem>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {professional.completedJobs}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Jobs Completed
            </Typography>
          </StatItem>

          <StatItem>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {professional.responseTime}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Response Time
            </Typography>
          </StatItem>

          {viewMode === 'detailed' && professional.tier === 'Pro' && (
            <StatItem>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {formatProfileViewCount(analytics.profileViews)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Profile Views
              </Typography>
            </StatItem>
          )}

          <StatItem>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {professional.experience}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Experience
            </Typography>
          </StatItem>
        </StatsContainer>
      </ProfileContent>
    </HeroContainer>
  );
};