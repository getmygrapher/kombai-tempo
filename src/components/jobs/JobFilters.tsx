import React from 'react';
import {
  Stack,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Box,
  Chip,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import { JobFilters as JobFiltersType } from '../../types';
import { useJobDiscoveryStore } from '../../store/jobDiscoveryStore';
import { ProfessionalCategory, UrgencyLevel } from '../../types/enums';
import { formatCurrency } from '../../utils/formatters';

interface JobFiltersProps {
  filters?: JobFiltersType;
  onFiltersChange?: (filters: Partial<JobFiltersType>) => void;
  onClearFilters?: () => void;
}

const FilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const BudgetSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
  },
  '& .MuiSlider-track': {
    height: 6,
  },
  '& .MuiSlider-rail': {
    height: 6,
  },
}));

const categoryOptions = [
  { value: ProfessionalCategory.PHOTOGRAPHY, label: 'Photography' },
  { value: ProfessionalCategory.VIDEOGRAPHY, label: 'Videography & Film' },
  { value: ProfessionalCategory.AUDIO, label: 'Audio Production' },
  { value: ProfessionalCategory.DESIGN, label: 'Design & Creative' },
  { value: ProfessionalCategory.MULTI_DISCIPLINARY, label: 'Multi-Disciplinary' },
];

const urgencyOptions = [
  { value: UrgencyLevel.NORMAL, label: 'Normal' },
  { value: UrgencyLevel.URGENT, label: 'Urgent' },
  { value: UrgencyLevel.EMERGENCY, label: 'Emergency' },
];

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  // Fallback to discovery store if props are not provided
  const { filters: storeFilters, setFilters: storeSetFilters, clearFilters: storeClearFilters } = useJobDiscoveryStore();
  const effectiveFilters = filters || storeFilters;
  const applyFilters = onFiltersChange || storeSetFilters;
  const clearAll = onClearFilters || storeClearFilters;
  const handleCategoryChange = (category: ProfessionalCategory, checked: boolean) => {
    const current = effectiveFilters?.categories || [];
    const newCategories = checked
      ? [...current, category]
      : current.filter(c => c !== category);
    applyFilters({ categories: newCategories });
  };

  const handleUrgencyChange = (urgency: UrgencyLevel, checked: boolean) => {
    const current = effectiveFilters?.urgency || [];
    const newUrgency = checked
      ? [...current, urgency]
      : current.filter(u => u !== urgency);
    applyFilters({ urgency: newUrgency });
  };

  const handleBudgetChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    applyFilters({
      budgetRange: { min, max }
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', date: Date | null) => {
    const current = effectiveFilters?.dateRange || { start: '', end: '' };
    applyFilters({
      dateRange: {
        ...current,
        [field]: date ? date.toISOString() : ''
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    const f = effectiveFilters;
    if (!f) return 0;
    if ((f.categories?.length || 0) > 0) count += f.categories.length;
    if ((f.urgency?.length || 0) > 0) count += f.urgency.length;
    if ((f.budgetRange?.min ?? 0) > 0 || (f.budgetRange?.max ?? 100000) < 100000) count++;
    if ((f.dateRange?.start) || (f.dateRange?.end)) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            {activeFiltersCount > 0 && `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} applied`}
          </Typography>
          {activeFiltersCount > 0 && (
            <Button size="small" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </Stack>

        {/* Category Filter */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" fontWeight={600}>
              Category
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {categoryOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={(effectiveFilters?.categories || []).includes(option.value)}
                      onChange={(e) => handleCategoryChange(option.value, e.target.checked)}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>

        {/* Urgency Filter */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" fontWeight={600}>
              Urgency Level
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {urgencyOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  variant={(effectiveFilters?.urgency || []).includes(option.value) ? 'filled' : 'outlined'}
                  color={(effectiveFilters?.urgency || []).includes(option.value) ? 'primary' : 'default'}
                  onClick={() => handleUrgencyChange(
                    option.value,
                    !(effectiveFilters?.urgency || []).includes(option.value)
                  )}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Budget Filter */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" fontWeight={600}>
              Budget Range
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <Box sx={{ px: 2 }}>
                <BudgetSlider
                  value={[(effectiveFilters?.budgetRange?.min ?? 0), (effectiveFilters?.budgetRange?.max ?? 100000)]}
                  onChange={handleBudgetChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => formatCurrency(value)}
                  min={0}
                  max={100000}
                  step={1000}
                />
              </Box>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  {formatCurrency(effectiveFilters?.budgetRange?.min ?? 0)}
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(effectiveFilters?.budgetRange?.max ?? 100000)}
                </Typography>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Date Range Filter */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2" fontWeight={600}>
              Date Range
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <DatePicker
                label="From Date"
                value={effectiveFilters?.dateRange?.start ? new Date(effectiveFilters.dateRange.start) : null}
                onChange={(date) => handleDateRangeChange('start', date)}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' }
                }}
              />
              <DatePicker
                label="To Date"
                value={effectiveFilters?.dateRange?.end ? new Date(effectiveFilters.dateRange.end) : null}
                onChange={(date) => handleDateRangeChange('end', date)}
                minDate={effectiveFilters?.dateRange?.start ? new Date(effectiveFilters.dateRange.start) : undefined}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' }
                }}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {/* Filter Summary */}
        {activeFiltersCount > 0 && (
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: 'primary.50', 
              borderRadius: 2,
              border: 1,
              borderColor: 'primary.200'
            }}
          >
            <Typography variant="body2" color="primary.main" fontWeight="medium">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} will be applied
            </Typography>
          </Box>
        )}
      </Stack>
    </LocalizationProvider>
  );
};