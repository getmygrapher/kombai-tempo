import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Chip,
  Avatar,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SettingsVoiceOutlinedIcon from '@mui/icons-material/SettingsVoiceOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { ProfessionalCategory } from '../../types/enums';
import { CategoryStats } from '../../types/homepage';
import { formatCategoryStats } from '../../utils/homepageFormatters';

interface CategoryGridProps {
  categories: CategoryStats[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  border: `2px solid transparent`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.light
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '08'
  }
}));

const CategoryIcon = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1)
}));

const getCategoryIcon = (category: string) => {
  switch (category) {
    case ProfessionalCategory.PHOTOGRAPHY:
      return <PhotoCameraOutlinedIcon />;
    case ProfessionalCategory.VIDEOGRAPHY:
      return <VideocamOutlinedIcon />;
    case ProfessionalCategory.AUDIO:
      return <SettingsVoiceOutlinedIcon />;
    case ProfessionalCategory.DESIGN:
      return <PaletteOutlinedIcon />;
    case ProfessionalCategory.MULTI_DISCIPLINARY:
      return <AutoAwesomeOutlinedIcon />;
    default:
      return <PhotoCameraOutlinedIcon />;
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case ProfessionalCategory.PHOTOGRAPHY:
      return 'Photography';
    case ProfessionalCategory.VIDEOGRAPHY:
      return 'Videography';
    case ProfessionalCategory.AUDIO:
      return 'Audio Production';
    case ProfessionalCategory.DESIGN:
      return 'Design & Creative';
    case ProfessionalCategory.MULTI_DISCIPLINARY:
      return 'Multi-Disciplinary';
    default:
      return category;
  }
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onCategorySelect(null); // Deselect if already selected
    } else {
      onCategorySelect(category);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          Browse by Category
        </Typography>
        {selectedCategory && (
          <Chip
            label="Clear Filter"
            variant="outlined"
            size="small"
            onDelete={() => onCategorySelect(null)}
            color="primary"
          />
        )}
      </Stack>

      <Grid container spacing={2}>
        {categories.map((categoryData) => (
          <Grid key={categoryData.category} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <StyledCard
              className={selectedCategory === categoryData.category ? 'selected' : ''}
              onClick={() => handleCategoryClick(categoryData.category)}
              elevation={selectedCategory === categoryData.category ? 2 : 1}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Stack spacing={1} alignItems="center">
                  <Box position="relative">
                    <CategoryIcon>
                      {getCategoryIcon(categoryData.category)}
                    </CategoryIcon>
                    {categoryData.trending && (
                      <Box
                        position="absolute"
                        top={-4}
                        right={-4}
                        sx={{
                          backgroundColor: 'success.main',
                          borderRadius: '50%',
                          p: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <TrendingUpOutlinedIcon 
                          sx={{ fontSize: 12, color: 'white' }} 
                        />
                      </Box>
                    )}
                  </Box>

                  <Typography variant="subtitle2" fontWeight={600} textAlign="center">
                    {getCategoryName(categoryData.category)}
                  </Typography>

                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    textAlign="center"
                    sx={{ lineHeight: 1.2 }}
                  >
                    {formatCategoryStats(categoryData.jobCount, categoryData.professionalCount)}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {categoryData.averageRating.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="warning.main">
                      ★
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};