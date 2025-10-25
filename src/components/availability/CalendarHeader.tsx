import React from 'react';
import {
  Stack,
  Typography,
  IconButton,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ViewWeekOutlinedIcon from '@mui/icons-material/ViewWeekOutlined';
import AddIcon from '@mui/icons-material/Add';
import { CalendarViewMode } from '../../types/availability';

const HeaderContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const NavigationContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const MonthYearText = styled(Typography)(({ theme }) => ({
  minWidth: 200,
  textAlign: 'center',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const ViewToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButton-root': {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.5, 1.5),
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onAddAvailability: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  onNavigate,
  onToday,
  onViewModeChange,
  onAddAvailability,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatHeaderDate = () => {
    if (viewMode === CalendarViewMode.WEEK) {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}-${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      } else {
        return `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()} - ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`;
      }
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  return (
    <HeaderContainer>
      {/* Top row with title and add button */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          My Calendar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddAvailability}
          size="small"
        >
          Mark Available
        </Button>
      </Stack>

      {/* Navigation and view controls */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <NavigationContainer direction="row">
          <IconButton 
            onClick={() => onNavigate('prev')}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ChevronLeftIcon />
          </IconButton>
          
          <MonthYearText variant="h6">
            {formatHeaderDate()}
          </MonthYearText>
          
          <IconButton 
            onClick={() => onNavigate('next')}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ChevronRightIcon />
          </IconButton>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<TodayIcon />}
            onClick={onToday}
            sx={{ ml: 2 }}
          >
            Today
          </Button>
        </NavigationContainer>

        <ViewToggle
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && onViewModeChange(newMode)}
          size="small"
        >
          <ToggleButton value={CalendarViewMode.MONTH}>
            <CalendarMonthOutlinedIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
            Month
          </ToggleButton>
          <ToggleButton value={CalendarViewMode.WEEK}>
            <ViewWeekOutlinedIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} />
            Week
          </ToggleButton>
        </ViewToggle>
      </Stack>
    </HeaderContainer>
  );
};