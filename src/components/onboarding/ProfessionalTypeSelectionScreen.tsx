import React, { useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  ProfessionalCategory, 
  PhotographyType, 
  VideographyType, 
  AudioType, 
  DesignType, 
  MultiDisciplinaryType 
} from '../../types/enums';
import { OnboardingStep } from '../../types/onboarding';
import { analyticsService } from '../../utils/analyticsEvents';
import { StepNavigation } from './StepNavigation';

interface ProfessionalTypeSelectionScreenProps {
  selectedCategory: ProfessionalCategory;
  selectedType: string;
  onTypeSelect: (type: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TypeCard = styled(Card)<{ selected?: boolean }>(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  border: selected 
    ? `2px solid ${theme.palette.primary.main}` 
    : `1px solid ${theme.palette.divider}`,
  backgroundColor: selected 
    ? `${theme.palette.primary.main}08` 
    : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light
  }
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: `${theme.palette.primary.main}15`,
  color: theme.palette.primary.main,
  fontWeight: 500,
  '& .MuiChip-label': {
    padding: theme.spacing(0.5, 1)
  }
}));

// Type mappings for each category
const getTypesForCategory = (category: ProfessionalCategory): string[] => {
  switch (category) {
    case ProfessionalCategory.PHOTOGRAPHY:
      return Object.values(PhotographyType);
    case ProfessionalCategory.VIDEOGRAPHY:
      return Object.values(VideographyType);
    case ProfessionalCategory.AUDIO:
      return Object.values(AudioType);
    case ProfessionalCategory.DESIGN:
      return Object.values(DesignType);
    case ProfessionalCategory.MULTI_DISCIPLINARY:
      return Object.values(MultiDisciplinaryType);
    default:
      return [];
  }
};

// Get description for each type
const getTypeDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    // Photography
    [PhotographyType.PORTRAIT]: 'Individual and family portraits, headshots, and personal photography',
    [PhotographyType.WEDDING]: 'Wedding ceremonies, pre-wedding shoots, and related celebrations',
    [PhotographyType.EVENT]: 'Corporate events, parties, conferences, and social gatherings',
    [PhotographyType.COMMERCIAL]: 'Product photography, brand campaigns, and business photography',
    [PhotographyType.REAL_ESTATE]: 'Property photography, architectural shots, and interior design',
    [PhotographyType.TRAVEL]: 'Destination photography, travel documentation, and location shoots',
    [PhotographyType.SPORTS]: 'Sports events, action photography, and athletic documentation',
    [PhotographyType.DOCUMENTARY]: 'Storytelling photography, photojournalism, and documentary projects',
    [PhotographyType.FINE_ART]: 'Artistic photography, exhibitions, and creative visual art',
    [PhotographyType.ARCHITECTURAL]: 'Building photography, construction documentation, and design photography',

    // Videography
    [VideographyType.WEDDING]: 'Wedding films, ceremony coverage, and romantic storytelling',
    [VideographyType.COMMERCIAL]: 'Brand videos, advertisements, and corporate content',
    [VideographyType.MUSIC]: 'Music videos, artist content, and performance documentation',
    [VideographyType.CONTENT_CREATOR]: 'Social media content, YouTube videos, and digital storytelling',
    [VideographyType.BROADCAST]: 'Television production, live streaming, and broadcast content',

    // Audio
    [AudioType.MIXING]: 'Audio mixing, sound design, and post-production services',
    [AudioType.MASTERING]: 'Audio mastering, final production, and sound optimization',
    [AudioType.LIVE_SOUND]: 'Live event audio, sound engineering, and PA system management',

    // Design
    [DesignType.GRAPHIC]: 'Logo design, branding, print design, and visual identity',
    [DesignType.SOCIAL_MEDIA]: 'Social media graphics, digital content, and online branding',
    [DesignType.ILLUSTRATOR]: 'Custom illustrations, digital art, and creative artwork',
    [DesignType.CREATIVE_DIRECTOR]: 'Creative strategy, art direction, and brand development',

    // Multi-disciplinary
    [MultiDisciplinaryType.CONTENT_CREATOR]: 'Multi-platform content creation and digital storytelling',
    [MultiDisciplinaryType.VISUAL_STORYTELLER]: 'Combined photo/video storytelling and narrative creation',
    [MultiDisciplinaryType.BRAND_SPECIALIST]: 'Complete brand development and marketing solutions',
    [MultiDisciplinaryType.SOCIAL_MEDIA_MANAGER]: 'Social media strategy, content planning, and community management',
    [MultiDisciplinaryType.EVENT_PLANNER]: 'Event planning, coordination, and creative direction'
  };

  return descriptions[type] || 'Professional services in this specialty';
};

export const ProfessionalTypeSelectionScreen: React.FC<ProfessionalTypeSelectionScreenProps> = ({
  selectedCategory,
  selectedType,
  onTypeSelect,
  onNext,
  onBack
}) => {
  const availableTypes = useMemo(() => {
    return selectedCategory ? getTypesForCategory(selectedCategory) : [];
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      analyticsService.trackStepViewed(OnboardingStep.TYPE_SELECTION, {
        selectedCategory
      });
    }
  }, [selectedCategory]);

  const handleTypeSelect = (type: string) => {
    onTypeSelect(type);
    if (selectedCategory) {
      analyticsService.trackTypeSelected(selectedCategory, type);
    }
  };

  const handleNext = () => {
    if (selectedType) {
      analyticsService.trackStepCompleted(OnboardingStep.TYPE_SELECTION, {
        selectedCategory: selectedCategory || 'Unknown',
        selectedType
      });
      onNext();
    }
  };

  const canProceed = !!selectedType;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Fade in timeout={600}>
          <Box textAlign="center">
            {selectedCategory && (
              <CategoryChip 
                label={selectedCategory} 
                size="small" 
                sx={{ mb: 2 }}
              />
            )}
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              What type of {selectedCategory?.toLowerCase() || 'service'} do you specialize in?
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
            >
              Choose your primary specialization. This helps clients find exactly what they're looking for.
            </Typography>
          </Box>
        </Fade>

        {/* Types Grid */}
        <Box>
          <Stack spacing={2}>
            {availableTypes.map((type, index) => (
              <Fade 
                in 
                timeout={800 + (index * 100)} 
                key={type}
              >
                <TypeCard
                  selected={selectedType === type}
                  onClick={() => handleTypeSelect(type)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedType === type}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTypeSelect(type);
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1}>
                      <Typography 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          color: selectedType === type 
                            ? 'primary.main' 
                            : 'text.primary'
                        }}
                      >
                        {type}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ lineHeight: 1.5 }}
                      >
                        {getTypeDescription(type)}
                      </Typography>
                    </Stack>
                  </CardContent>
                </TypeCard>
              </Fade>
            ))}
          </Stack>
        </Box>

        {/* Navigation */}
        <Fade in timeout={1200}>
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