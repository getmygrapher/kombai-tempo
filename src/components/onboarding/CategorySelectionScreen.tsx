import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Fade,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VideocamIcon from '@mui/icons-material/Videocam';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ProfessionalCategory } from '../../types/enums';
import { OnboardingStep } from '../../types/onboarding';
import { analyticsService } from '../../utils/analyticsEvents';
import { StepNavigation } from './StepNavigation';

interface CategorySelectionScreenProps {
  selectedCategory: ProfessionalCategory | null;
  onCategorySelect: (category: ProfessionalCategory) => void;
  onNext: () => void;
  onBack: () => void;
}

const CategoryCard = styled(Card)<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  border: selected 
    ? `2px solid ${theme.palette.primary.main}` 
    : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected 
    ? `${theme.palette.primary.main}08` 
    : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light
  }
}));

const IconContainer = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
  width: 64,
  height: 64,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: selected 
    ? theme.palette.primary.main 
    : `${theme.palette.primary.main}15`,
  color: selected ? 'white' : theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  transition: 'all 0.3s ease-in-out'
}));

const categories = [
  {
    value: ProfessionalCategory.PHOTOGRAPHY,
    title: 'Photography',
    description: 'Portrait, Wedding, Event, Commercial, and specialized photography services',
    icon: <CameraAltIcon sx={{ fontSize: 32 }} />
  },
  {
    value: ProfessionalCategory.VIDEOGRAPHY,
    title: 'Videography & Film',
    description: 'Wedding films, commercials, music videos, and digital content creation',
    icon: <VideocamIcon sx={{ fontSize: 32 }} />
  },
  {
    value: ProfessionalCategory.AUDIO,
    title: 'Audio Production',
    description: 'Mixing, mastering, live sound engineering, and audio post-production',
    icon: <AudiotrackIcon sx={{ fontSize: 32 }} />
  },
  {
    value: ProfessionalCategory.DESIGN,
    title: 'Design & Creative',
    description: 'Graphic design, social media design, illustration, and creative direction',
    icon: <DesignServicesIcon sx={{ fontSize: 32 }} />
  },
  {
    value: ProfessionalCategory.MULTI_DISCIPLINARY,
    title: 'Multi-Disciplinary',
    description: 'Content creation, brand specialists, event planning, and combined services',
    icon: <AutoAwesomeIcon sx={{ fontSize: 32 }} />
  }
];

export const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({
  selectedCategory,
  onCategorySelect,
  onNext,
  onBack
}) => {
  const theme = useTheme();
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    analyticsService.trackStepViewed(OnboardingStep.CATEGORY_SELECTION);
  }, []);

  const handleCategorySelect = (category: ProfessionalCategory) => {
    onCategorySelect(category);
    analyticsService.trackCategorySelected(category);
  };

  const handleNext = () => {
    if (selectedCategory) {
      analyticsService.trackStepCompleted(OnboardingStep.CATEGORY_SELECTION, {
        selectedCategory
      });
      onNext();
    }
  };

  const canProceed = !!selectedCategory;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box textAlign="center">
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              What's your creative specialty?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
            >
              Choose your primary professional category. You can add multiple specializations in the next step.
            </Typography>
          </Box>
        </Fade>

        {/* Categories Grid */}
        <Box>
          <Stack spacing={3}>
            {categories.map((category, index) => (
              <Fade 
                in 
                timeout={800 + (index * 100)} 
                key={category.value}
              >
                <CategoryCard
                  selected={selectedCategory === category.value}
                  onClick={() => handleCategorySelect(category.value)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCategory === category.value}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategorySelect(category.value);
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <IconContainer selected={selectedCategory === category.value}>
                        {category.icon}
                      </IconContainer>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h6" 
                          component="h3"
                          gutterBottom
                          sx={{ 
                            fontWeight: 600,
                            color: selectedCategory === category.value 
                              ? 'primary.main' 
                              : 'text.primary'
                          }}
                        >
                          {category.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ lineHeight: 1.5 }}
                        >
                          {category.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </CategoryCard>
              </Fade>
            ))}
          </Stack>
        </Box>

        {/* Navigation */}
        <Fade in timeout={1400}>
          <StepNavigation
            onBack={onBack}
            onNext={handleNext}
            canProceed={canProceed as any}
            nextLabel="Continue"
            backLabel="Back"
          />
        </Fade>
      </Stack>
    </Box>
  );
};