import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { useAppStore } from '../../store/appStore';

interface AppBottomNavigationProps {
  value: string;
  onChange: (newValue: string) => void;
}

const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(0.25, 0.5),
  minHeight: 48,
  '& .MuiBottomNavigationAction-root': {
    minWidth: 'auto',
    minHeight: 44,
    margin: theme.spacing(0, 0.25),
    borderRadius: 999,
    padding: theme.spacing(0.5, 1.25),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    transition: theme.transitions.create(['gap', 'padding', 'background-color', 'color'], {
      duration: 250,
    }),
    // Make label sit inline and be collapsible when not selected
    '& .MuiBottomNavigationAction-label': {
      marginLeft: 0,
      maxWidth: 0,
      opacity: 0,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      transition: theme.transitions.create(['max-width', 'opacity', 'margin'], {
        duration: 250,
      }),
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.action.selected,
      gap: theme.spacing(0.5),
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}22`,
      '& .MuiBottomNavigationAction-label': {
        marginLeft: theme.spacing(0.5),
        maxWidth: 100,
        opacity: 1,
      },
    },
  },
}));

export const AppBottomNavigation: React.FC<AppBottomNavigationProps> = ({
  value,
  onChange,
}) => {
  const { notifications } = useAppStore();
  const unreadMessages = notifications.filter(n => !n.isRead && n.type === 'message').length;

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      {/* showLabels keeps label node in DOM so CSS can animate */}
      <StyledBottomNavigation value={value} onChange={handleChange} showLabels>
        <BottomNavigationAction
          label="Home"
          value="home"
          icon={<HomeOutlinedIcon fontSize="small" />}
        />
        <BottomNavigationAction
          label="Search"
          value="search"
          icon={<TravelExploreOutlinedIcon fontSize="small" />}
        />
        <BottomNavigationAction
          label="Jobs"
          value="jobs"
          icon={<WorkOutlinedIcon fontSize="small" />}
        />
        <BottomNavigationAction
          label="Calendar"
          value="calendar"
          icon={<CalendarMonthOutlinedIcon fontSize="small" />}
        />
        <BottomNavigationAction
          label="Community"
          value="community"
          icon={<PhotoLibraryOutlinedIcon fontSize="small" />}
        />
        <BottomNavigationAction
          label="Messages"
          value="messages"
          icon={
            <Badge badgeContent={unreadMessages} color="error">
              <ChatBubbleOutlinedIcon fontSize="small" />
            </Badge>
          }
        />
        <BottomNavigationAction
          label="Profile"
          value="profile"
          icon={<PermIdentityOutlinedIcon fontSize="small" />}
        />
      </StyledBottomNavigation>
    </Paper>
  );
};