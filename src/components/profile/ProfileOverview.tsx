import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  useTheme,
  Skeleton,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useOutletContext } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Professional, ProfileAnalytics, ViewerPermissions } from '../../data/profileViewSystemMockData';
import { PricingDisplay } from './PricingDisplay';
import { formatLastActive } from '../../data/profileViewSystemMockData';

interface ProfileOverviewProps {
  professional?: Professional;
  analytics?: ProfileAnalytics;
  viewerPermissions?: ViewerPermissions;
}

interface OutletContext {
  profileData: any;
  viewerPermissions: ViewerPermissions;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const AboutSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
}));

const SpecializationChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const OverviewSkeleton = () => (
  <Stack spacing={3}>
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map((i) => (
        <Grid item xs={6} md={3} key={i}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
  </Stack>
);

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  professional: propProfessional,
  analytics: propAnalytics,
  viewerPermissions: propViewerPermissions
}) => {
  // Try to get data from outlet context if not provided as props
  const outletContext = useOutletContext<OutletContext>();
  const professional = propProfessional || outletContext?.profileData?.professional;
  const analytics = propAnalytics || outletContext?.profileData?.analytics;
  const viewerPermissions = propViewerPermissions || outletContext?.viewerPermissions;

  if (!professional || !analytics || !viewerPermissions) {
    return <OverviewSkeleton />;
  }

  const stats = [
    {
      label: 'Rating',
      value: professional.rating.toFixed(1),
      icon: <StarIcon sx={{ color: 'warning.main' }} />,
      subtitle: `${professional.totalReviews} reviews`
    },
    {
      label: 'Jobs Completed',
      value: professional.completedJobs.toString(),
      icon: <WorkIcon sx={{ color: 'success.main' }} />,
      subtitle: 'Successful projects'
    },
    {
      label: 'Response Time',
      value: professional.responseTime.split(' ')[1] || '2h',
      icon: <AccessTimeIcon sx={{ color: 'info.main' }} />,
      subtitle: 'Average response'
    },
    {
      label: 'Experience',
      value: professional.experience.split('-')[0] || '3+',
      icon: <VerifiedIcon sx={{ color: 'primary.main' }} />,
      subtitle: 'Years in field'
    }
  ];

  return (
    <Box
      role="tabpanel"
      id="tabpanel-overview"
      aria-labelledby="tab-overview"
    >
      <Stack spacing={3}>
        {/* Key Statistics */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <StatCard elevation={1}>
                <Stack spacing={1} alignItems="center">
                  {stat.icon}
                  <Typography variant="h4" component="div" color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="subtitle2" color="text.primary">
                    {stat.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                </Stack>
              </StatCard>
            </Grid>
          ))}
        </Grid>

        {/* About Section */}
        <AboutSection>
          <Typography variant="h6" gutterBottom>
            About {professional.name}
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
            {professional.about}
          </Typography>

          <Stack spacing={2}>
            {/* Professional Details */}
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {professional.location.city}, {professional.location.state}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  {formatLastActive(professional.lastActive)}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={1} alignItems="center">
                <WorkIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  Member since {professional.joinedDate.getFullYear()}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Specializations */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Specializations
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {professional.specializations.map((spec, index) => (
                  <SpecializationChip
                    key={index}
                    label={spec}
                    size="small"
                    variant="filled"
                  />
                ))}
              </Box>
            </Box>

            {/* Portfolio Links */}
            {professional.portfolioLinks.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Portfolio Links
                </Typography>
                <Stack spacing={1}>
                  {professional.portfolioLinks.map((link, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      component="a"
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {link}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Instagram Handle */}
            {professional.instagramHandle && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Instagram
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href={`https://instagram.com/${professional.instagramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  {professional.instagramHandle}
                </Typography>
              </Box>
            )}
          </Stack>
        </AboutSection>

        {/* Pricing Information */}
        <PricingDisplay
          professional={professional}
          viewerPermissions={viewerPermissions}
        />

        {/* Quick Availability Summary */}
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Availability Summary
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Next Available
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Response Time
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {professional.responseTime}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              View the Availability tab for detailed calendar and booking options.
            </Typography>
          </CardContent>
        </StyledCard>

        {/* Profile Completion Score (Pro Feature) */}
        {analytics.profileCompletionScore && (
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Profile Strength
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Based on completeness and engagement
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" color="primary">
                    {analytics.profileCompletionScore}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completion Score
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StyledCard>
        )}
      </Stack>
    </Box>
  );
};