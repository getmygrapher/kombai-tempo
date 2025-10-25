import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Avatar,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Box,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import { TierType, ProfileSection } from '../../types/enums';
import { User, ProfileStats } from '../../types';
import { RatingDisplay } from '../common/RatingDisplay';
import { StatusChip } from '../common/StatusChip';
import { formatCurrency } from '../../utils/formatters';
import { formatProfileCompletion } from '../../data/profileManagementMockData';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  position: 'relative',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
}));

const ProBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  padding: '4px 12px',
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.875rem',
  fontWeight: theme.typography.fontWeightMedium,
}));

const StatsCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out',
    boxShadow: theme.shadows[4],
  }
}));

const SectionCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  }
}));

const CompletionBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
}));

interface ProfileDashboardProps {
  user: User;
  profileStats: ProfileStats;
  onSectionSelect: (section: ProfileSection) => void;
  onEditProfile: () => void;
  onUpgradeTier: () => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({
  user,
  profileStats,
  onSectionSelect,
  onEditProfile,
  onUpgradeTier
}) => {
  const [selectedSection, setSelectedSection] = useState<ProfileSection | null>(null);

  const handleSectionClick = (section: ProfileSection) => {
    setSelectedSection(section);
    onSectionSelect(section);
  };

  const profileSections = [
    {
      id: ProfileSection.BASIC_INFO,
      title: 'Basic Information',
      description: 'Personal details and contact information',
      icon: <EditOutlinedIcon />,
      color: 'primary'
    },
    {
      id: ProfileSection.PROFESSIONAL_DETAILS,
      title: 'Professional Details',
      description: 'Category, specializations, and experience',
      icon: <PhotoCameraOutlinedIcon />,
      color: 'secondary'
    },
    {
      id: ProfileSection.EQUIPMENT,
      title: 'Equipment & Gear',
      description: 'Camera equipment, lenses, and lighting',
      icon: <PhotoCameraOutlinedIcon />,
      color: 'info'
    },
    {
      id: ProfileSection.PRICING,
      title: 'Pricing Setup',
      description: 'Rates and pricing structure',
      icon: <AttachMoneyOutlinedIcon />,
      color: 'success'
    },
    {
      id: ProfileSection.INSTAGRAM,
      title: 'Instagram Integration',
      description: 'Link your Instagram for portfolio display',
      icon: <PhotoCameraOutlinedIcon />,
      color: 'warning',
      isPro: true
    },
    {
      id: ProfileSection.PRIVACY,
      title: 'Privacy Settings',
      description: 'Calendar visibility and privacy controls',
      icon: <SettingsOutlinedIcon />,
      color: 'error',
      isPro: true
    },
    {
      id: ProfileSection.TIER,
      title: 'Tier Management',
      description: 'Subscription and premium features',
      icon: <StarOutlinedIcon />,
      color: 'secondary'
    }
  ];

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Profile Header */}
        <ProfileHeader>
          {user.tier === TierType.PRO && (
            <ProBadge>PRO MEMBER</ProBadge>
          )}
          
          <Stack spacing={2} alignItems="center">
            <Avatar
              src={user.profilePhoto}
              sx={{ width: 100, height: 100 }}
            >
              {user.name.charAt(0)}
            </Avatar>
            
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <Typography variant="h5" fontWeight="bold">
                  {user.name}
                </Typography>
                {user.isVerified && (
                  <VerifiedOutlinedIcon color="primary" />
                )}
              </Stack>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.professionalType}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.location.city}, {user.location.state}
              </Typography>
              
              <RatingDisplay
                rating={user.rating}
                totalReviews={user.totalReviews}
                size="medium"
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<EditOutlinedIcon />}
                size="small"
                onClick={onEditProfile}
              >
                Edit Profile
              </Button>
              <IconButton size="small" onClick={() => handleSectionClick(ProfileSection.TIER)}>
                <SettingsOutlinedIcon />
              </IconButton>
            </Stack>
          </Stack>
        </ProfileHeader>

        {/* Profile Completion */}
        <CompletionBar>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight="medium">
                Profile Completion
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatProfileCompletion(profileStats.profileCompletion)}
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={profileStats.profileCompletion} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            {profileStats.profileCompletion < 100 && (
              <Typography variant="caption" color="text.secondary">
                Complete your profile to increase visibility
              </Typography>
            )}
          </Stack>
        </CompletionBar>

        {/* Profile Statistics */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Profile Statistics
          </Typography>
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
            <StatsCard sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {profileStats.profileViews}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profile Views
                </Typography>
              </CardContent>
            </StatsCard>
            
            <StatsCard sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" color="secondary" fontWeight="bold">
                  {profileStats.jobApplications}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Applications
                </Typography>
              </CardContent>
            </StatsCard>
            
            <StatsCard sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {profileStats.successRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </CardContent>
            </StatsCard>
            
            <StatsCard sx={{ minWidth: 120 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {profileStats.responseRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Response Rate
                </Typography>
              </CardContent>
            </StatsCard>
          </Stack>
        </Box>

        {/* Profile Sections */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Profile Management
          </Typography>
          <Stack spacing={2}>
            {profileSections.map((section) => (
              <SectionCard 
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ color: `${section.color}.main` }}>
                      {section.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight="medium">
                          {section.title}
                        </Typography>
                        {section.isPro && user.tier === TierType.FREE && (
                          <Chip label="PRO" size="small" color="secondary" />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {section.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </SectionCard>
            ))}
          </Stack>
        </Box>

        {/* Tier Upgrade CTA */}
        {user.tier === TierType.FREE && (
          <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #EC489915 0%, #6366F115 100%)' }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <StarOutlinedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Upgrade to Pro
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unlock unlimited features, Instagram integration, and priority support
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={onUpgradeTier}
                sx={{ minWidth: 150 }}
              >
                Upgrade Now
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </StyledContainer>
  );
};