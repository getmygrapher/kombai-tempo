import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Stack,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { 
  PoseCategory, 
  DifficultyLevel, 
  LocationType, 
  LibraryFilters 
} from '../../types/community';
import { 
  formatPoseCategory, 
  formatDifficultyLevel, 
  formatLocationType 
} from '../../utils/communityFormatters';
import communityTheme from '../../theme/communityTheme';

interface FilterBottomSheetProps {
  open: boolean;
  filters: LibraryFilters;
  onClose: () => void;
  onApplyFilters: (filters: LibraryFilters) => void;
  onResetFilters: () => void;
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    borderTopLeftRadius: communityTheme.layout.bottomSheetBorderRadius,
    borderTopRightRadius: communityTheme.layout.bottomSheetBorderRadius,
    maxHeight: '80vh',
  },
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  maxHeight: 'calc(80vh - 140px)',
  overflowY: 'auto',
}));

const FooterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  gap: theme.spacing(1),
}));

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  open,
  filters,
  onClose,
  onApplyFilters,
  onResetFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<LibraryFilters>(filters);

  const handleCategoryChange = (category: PoseCategory, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleDifficultyChange = (difficulty: DifficultyLevel, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      difficultyLevels: checked 
        ? [...prev.difficultyLevels, difficulty]
        : prev.difficultyLevels.filter(d => d !== difficulty)
    }));
  };

  const handleLocationChange = (location: LocationType, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      locationTypes: checked 
        ? [...prev.locationTypes, location]
        : prev.locationTypes.filter(l => l !== location)
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: LibraryFilters = {
      categories: [],
      difficultyLevels: [],
      locationTypes: [],
      equipmentTypes: [],
      peopleCount: [],
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  const getActiveFiltersCount = () => {
    return localFilters.categories.length + 
           localFilters.difficultyLevels.length + 
           localFilters.locationTypes.length;
  };

  return (
    <StyledDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
    >
      <HeaderContainer>
        <Typography variant="h6" fontWeight={600}>
          Filters
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </HeaderContainer>

      <ContentContainer>
        <Stack spacing={3}>
          {/* Categories */}
          <FilterSection>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Categories
            </Typography>
            <ChipContainer>
              {Object.values(PoseCategory).map((category) => (
                <Chip
                  key={category}
                  label={formatPoseCategory(category)}
                  clickable
                  color={localFilters.categories.includes(category) ? "primary" : "default"}
                  onClick={() => handleCategoryChange(category, !localFilters.categories.includes(category))}
                  sx={{ borderRadius: communityTheme.layout.chipBorderRadius }}
                />
              ))}
            </ChipContainer>
          </FilterSection>

          <Divider />

          {/* Difficulty Levels */}
          <FilterSection>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Difficulty Level
            </Typography>
            <FormGroup row>
              {Object.values(DifficultyLevel).map((difficulty) => (
                <FormControlLabel
                  key={difficulty}
                  control={
                    <Checkbox
                      checked={localFilters.difficultyLevels.includes(difficulty)}
                      onChange={(e) => handleDifficultyChange(difficulty, e.target.checked)}
                    />
                  }
                  label={formatDifficultyLevel(difficulty)}
                />
              ))}
            </FormGroup>
          </FilterSection>

          <Divider />

          {/* Location Types */}
          <FilterSection>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Location Type
            </Typography>
            <ChipContainer>
              {Object.values(LocationType).map((location) => (
                <Chip
                  key={location}
                  label={formatLocationType(location)}
                  clickable
                  color={localFilters.locationTypes.includes(location) ? "primary" : "default"}
                  onClick={() => handleLocationChange(location, !localFilters.locationTypes.includes(location))}
                  sx={{ borderRadius: communityTheme.layout.chipBorderRadius }}
                />
              ))}
            </ChipContainer>
          </FilterSection>
        </Stack>
      </ContentContainer>

      <FooterContainer>
        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{ 
            flex: 1,
            borderRadius: communityTheme.layout.buttonBorderRadius 
          }}
        >
          Reset Filters
        </Button>
        <Button
          variant="contained"
          onClick={handleApply}
          sx={{ 
            flex: 2,
            borderRadius: communityTheme.layout.buttonBorderRadius 
          }}
        >
          Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>
      </FooterContainer>
    </StyledDrawer>
  );
};