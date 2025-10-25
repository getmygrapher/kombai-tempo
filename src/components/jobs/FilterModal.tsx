import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Slide,
  Box,
  Drawer,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { JobFilters } from './JobFilters';
import { JobFilters as JobFiltersType } from '../../types';

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  filters?: JobFiltersType;
  onFiltersChange?: (filters: Partial<JobFiltersType>) => void;
  onClearFilters?: () => void;
  onApplyFilters?: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: '500px',
    width: '100%',
    margin: theme.spacing(2),
    maxHeight: 'calc(100vh - 32px)',
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      maxWidth: '100%',
      maxHeight: '100vh',
      borderRadius: 0,
      height: '100vh',
    },
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    borderTopLeftRadius: theme.spacing(2),
    borderTopRightRadius: theme.spacing(2),
    maxHeight: '85vh',
    minHeight: '50vh',
  },
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

const DialogContentStyled = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(0),
  '&:first-of-type': {
    paddingTop: 0,
  },
  overflow: 'auto',
  flex: 1,
}));

const DialogFooter = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  position: 'sticky',
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  gap: theme.spacing(2),
}));

export const FilterModal: React.FC<FilterModalProps> = ({
  open,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  onApplyFilters
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [localFilters, setLocalFilters] = useState<JobFiltersType | undefined>(filters);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleLocalFiltersChange = (newFilters: Partial<JobFiltersType>) => {
    setLocalFilters(prev => prev ? { ...prev, ...newFilters } : newFilters as JobFiltersType);
  };

  const handleApply = () => {
    if (onFiltersChange && localFilters) {
      onFiltersChange(localFilters);
    }
    if (onApplyFilters) {
      onApplyFilters();
    }
    onClose();
  };

  const handleClear = () => {
    if (onClearFilters) {
      onClearFilters();
    }
    setLocalFilters({
      categories: [],
      urgency: [],
      budgetRange: { min: 0, max: 100000 },
      distance: 'TWENTY_FIVE_KM' as any,
      dateRange: { start: '', end: '' }
    });
  };

  const getActiveFiltersCount = () => {
    if (!localFilters) return 0;
    let count = 0;
    if ((localFilters.categories?.length || 0) > 0) count += localFilters.categories.length;
    if ((localFilters.urgency?.length || 0) > 0) count += localFilters.urgency.length;
    if ((localFilters.budgetRange?.min ?? 0) > 0 || (localFilters.budgetRange?.max ?? 100000) < 100000) count++;
    if ((localFilters.dateRange?.start) || (localFilters.dateRange?.end)) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const FilterContent = () => (
    <>
      <DialogHeader>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Filter Jobs
          </Typography>
          {activeFiltersCount > 0 && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {activeFiltersCount}
            </Box>
          )}
        </Stack>
        <IconButton onClick={onClose} edge="end" size="small">
          <CloseIcon />
        </IconButton>
      </DialogHeader>
      
      <DialogContentStyled>
        <Box sx={{ p: 3 }}>
          <JobFilters 
            filters={localFilters}
            onFiltersChange={handleLocalFiltersChange}
            onClearFilters={handleClear}
          />
        </Box>
      </DialogContentStyled>
      
      <DialogFooter>
        <Button 
          variant="outlined" 
          onClick={onClose}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleApply}
          sx={{ minWidth: 100 }}
        >
          Apply Filters
          {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
        </Button>
      </DialogFooter>
    </>
  );

  if (isMobile) {
    return (
      <StyledDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        keepMounted
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <FilterContent />
        </Box>
      </StyledDrawer>
    );
  }

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullScreen={false}
    >
      <FilterContent />
    </StyledDialog>
  );
};