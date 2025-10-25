import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Paper,
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useOutletContext } from 'react-router-dom';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { PortfolioItem, Professional, ViewerPermissions } from '../../data/profileViewSystemMockData';
import { PrivacyGate } from './PrivacyGate';

interface PortfolioGalleryProps {
  portfolio?: PortfolioItem[];
  professional?: Professional;
  onImageClick?: (imageIndex: number) => void;
}

interface OutletContext {
  profileData: any;
  viewerPermissions: ViewerPermissions;
  onImageClick: (imageIndex: number) => void;
}

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const PortfolioImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: theme.spacing(1),
  transition: 'transform 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const PortfolioSkeleton = () => (
  <Stack spacing={3}>
    <Skeleton variant="text" width={200} height={32} />
    <ImageList cols={3} gap={16}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ImageListItem key={i}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        </ImageListItem>
      ))}
    </ImageList>
  </Stack>
);

const CategoryFilter = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const InstagramSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  portfolio: propPortfolio,
  professional: propProfessional,
  onImageClick: propOnImageClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Try to get data from outlet context if not provided as props
  const outletContext = useOutletContext<OutletContext>();
  const portfolio = propPortfolio || outletContext?.profileData?.portfolio || [];
  const professional = propProfessional || outletContext?.profileData?.professional;
  const viewerPermissions = outletContext?.viewerPermissions;
  const onImageClick = propOnImageClick || outletContext?.onImageClick || (() => {});

  if (!professional || !viewerPermissions) {
    return <PortfolioSkeleton />;
  }

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(portfolio.map(item => item.category)))];

  // Filter portfolio items
  const filteredPortfolio = selectedCategory === 'All' 
    ? portfolio 
    : portfolio.filter(item => item.category === selectedCategory);

  // Separate Instagram posts
  const instagramPosts = portfolio.filter(item => item.type === 'instagram_post');
  const regularPortfolio = filteredPortfolio.filter(item => item.type !== 'instagram_post');

  return (
    <Box
      role="tabpanel"
      id="tabpanel-portfolio"
      aria-labelledby="tab-portfolio"
    >
      <Stack spacing={2}>
      {/* Instagram Section (Pro Feature) */}
      {professional.tier === 'Pro' && professional.instagramHandle && instagramPosts.length > 0 && (
        <PrivacyGate
          viewerPermissions={viewerPermissions}
          requiredPermission="canViewInstagram"
          gateType="instagram"
        >
          <SectionPaper>
            <SectionTitle variant="h6">Instagram Feed</SectionTitle>
            <InstagramSection>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <InstagramIcon color="primary" />
                <Typography variant="body1" fontWeight="medium">
                  {professional.instagramHandle}
                </Typography>
                <Button variant="outlined" size="small" startIcon={<InstagramIcon />}>
                  View Profile
                </Button>
              </Stack>
              
              <ImageList 
                cols={isMobile ? 2 : 4} 
                gap={8}
                sx={{ margin: 0 }}
              >
                {instagramPosts.slice(0, isMobile ? 4 : 8).map((item, index) => (
                  <ImageListItem key={item.id}>
                    <PortfolioImage
                      src={item.url}
                      alt={item.title}
                      loading="lazy"
                      onClick={() => onImageClick(portfolio.indexOf(item))}
                    />
                    <ImageListItemBar
                      title={item.title}
                      subtitle={item.description}
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                          onClick={() => onImageClick(portfolio.indexOf(item))}
                          aria-label={`View ${item.title} in full screen`}
                        >
                          <FullscreenOutlinedIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </InstagramSection>
          </SectionPaper>
        </PrivacyGate>
      )}

      {/* Portfolio Gallery */}
      <SectionPaper>
        <SectionTitle variant="h6">Portfolio</SectionTitle>
        
        {/* Category Filters */}
        <CategoryFilter direction="row" spacing={1} flexWrap="wrap">
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              clickable
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              onClick={() => setSelectedCategory(category)}
              size="small"
            />
          ))}
        </CategoryFilter>

        {/* Portfolio Grid */}
        {regularPortfolio.length > 0 ? (
          <ImageList 
            cols={isMobile ? 1 : 3} 
            gap={16}
            sx={{ margin: 0 }}
          >
            {regularPortfolio.map((item, index) => (
              <ImageListItem key={item.id}>
                <PortfolioImage
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  onClick={() => onImageClick(portfolio.indexOf(item))}
                />
                <ImageListItemBar
                  title={item.title}
                  subtitle={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption">
                        {item.description}
                      </Typography>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color="primary"
                        sx={{ height: 16, fontSize: '0.6rem' }}
                      />
                    </Stack>
                  }
                  actionIcon={
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                      onClick={() => onImageClick(portfolio.indexOf(item))}
                      aria-label={`View ${item.title} in full screen`}
                    >
                      <FullscreenOutlinedIcon />
                    </IconButton>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No portfolio items found for "{selectedCategory}"
            </Typography>
          </Box>
        )}

        {/* External Portfolio Links */}
        {professional.portfolioLinks.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              External Portfolio Links
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {professional.portfolioLinks.map((link, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  startIcon={<LinkOutlinedIcon />}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Portfolio {index + 1}
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </SectionPaper>
      </Stack>
    </Box>
  );
};