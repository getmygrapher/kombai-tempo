import React from 'react';
import { Stack, Chip, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { JobFilters } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ProfessionalCategory, UrgencyLevel } from '../../types/enums';

interface ActiveFiltersChipsProps {
  filters: JobFilters;
  onRemoveFilter: (filterType: string, value?: any) => void;
  onClearAll: () => void;
}

const FilterChip = styled(Chip)(({ theme }) => ({
  '& .MuiChip-deleteIcon': {
    fontSize: '18px',
    '&:hover': {
      color: theme.palette.error.main,
    },
  },
}));

const getCategoryLabel = (category: ProfessionalCategory): string => {
  switch (category) {
    case ProfessionalCategory.PHOTOGRAPHY:
      return 'Photography';
    case ProfessionalCategory.VIDEOGRAPHY:
      return 'Videography';
    case ProfessionalCategory.AUDIO:
      return 'Audio';
    case ProfessionalCategory.DESIGN:
      return 'Design';
    case ProfessionalCategory.MULTI_DISCIPLINARY:
      return 'Multi-Disciplinary';
    default:
      return category;
  }
};

const getUrgencyLabel = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case UrgencyLevel.NORMAL:
      return 'Normal';
    case UrgencyLevel.URGENT:
      return 'Urgent';
    case UrgencyLevel.EMERGENCY:
      return 'Emergency';
    default:
      return urgency;
  }
};

export const ActiveFiltersChips: React.FC<ActiveFiltersChipsProps> = ({
  filters,
  onRemoveFilter,
  onClearAll
}) => {
  const activeFilters: Array<{ type: string; label: string; value?: any }> = [];

  // Category filters
  if (filters.categories && filters.categories.length > 0) {
    filters.categories.forEach(category => {
      activeFilters.push({
        type: 'category',
        label: getCategoryLabel(category),
        value: category
      });
    });
  }

  // Urgency filters
  if (filters.urgency && filters.urgency.length > 0) {
    filters.urgency.forEach(urgency => {
      activeFilters.push({
        type: 'urgency',
        label: getUrgencyLabel(urgency),
        value: urgency
      });
    });
  }

  // Budget filter
  if (filters.budgetRange && (filters.budgetRange.min > 0 || filters.budgetRange.max < 100000)) {
    const label = `${formatCurrency(filters.budgetRange.min)} - ${formatCurrency(filters.budgetRange.max)}`;
    activeFilters.push({
      type: 'budget',
      label: `Budget: ${label}`
    });
  }

  // Date range filter
  if (filters.dateRange && (filters.dateRange.start || filters.dateRange.end)) {
    let label = 'Date: ';
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = new Date(filters.dateRange.start).toLocaleDateString();
      const endDate = new Date(filters.dateRange.end).toLocaleDateString();
      label += `${startDate} - ${endDate}`;
    } else if (filters.dateRange.start) {
      label += `From ${new Date(filters.dateRange.start).toLocaleDateString()}`;
    } else if (filters.dateRange.end) {
      label += `Until ${new Date(filters.dateRange.end).toLocaleDateString()}`;
    }
    activeFilters.push({
      type: 'dateRange',
      label
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''} applied
        </Typography>
        <Button size="small" onClick={onClearAll} color="primary">
          Clear All
        </Button>
      </Stack>
      
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {activeFilters.map((filter, index) => (
          <FilterChip
            key={`${filter.type}-${index}`}
            label={filter.label}
            onDelete={() => onRemoveFilter(filter.type, filter.value)}
            color="primary"
            variant="outlined"
            size="small"
          />
        ))}
      </Stack>
    </Stack>
  );
};