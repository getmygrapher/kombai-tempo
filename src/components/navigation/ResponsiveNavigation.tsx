import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Badge, Box, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { useAppStore } from '../../store/appStore';

interface ResponsiveNavigationProps {
  value: string;
  onChange: (newValue: string) => void;
}

// Desktop Sidebar Navigation Styles
const SidebarContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  left: 0,
  top: 0,
  bottom: 0,
  width: 80,
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  zIndex: 1200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2, 0),
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const SidebarNavItem = styled(Box)<{ selected: boolean }>(({ theme, selected }) => ({
  width: 56,
  height: 56,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  transition: theme.transitions.create(['background-color', 'color', 'transform'], {
    duration: 200,
  }),
  backgroundColor: selected ? theme.palette.action.selected : 'transparent',
  color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: selected ? theme.palette.action.selected : theme.palette.action.hover,
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

// Mobile Bottom Navigation Styles (existing)
const MobileNavContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

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

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  value,
  onChange,
}) => {
  const { notifications } = useAppStore();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const unreadMessages = notifications.filter(n => !n.isRead && n.type === 'message').length;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  const navigationItems = [
    { value: 'home', label: 'Home', icon: <HomeOutlinedIcon fontSize={isDesktop ? 'medium' : 'small'} /> },
    { value: 'search', label: 'Search', icon: <TravelExploreOutlinedIcon fontSize={isDesktop ? 'medium' : 'small'} /> },
    { value: 'jobs', label: 'Jobs', icon: <WorkOutlinedIcon fontSize={isDesktop ? 'medium' : 'small'} /> },
    { value: 'calendar', label: 'Calendar', icon: <CalendarMonthOutlinedIcon fontSize={isDesktop ? 'medium' : 'small'} /> },
    { value: 'community', label: 'Community', icon: <PhotoLibraryOutlinedIcon fontSize={isDesktop ? 'medium' : 'small'} /> },
    { 
      value: 'messages', 
      label: 'Messages', 
      icon: (
        <Badge badgeContent={unreadMessages} color="error">
          <ChatBubbleOutlinedIcon fontSize={isDesktop ? 'medium' : 'small'} />
        </Badge>
      ) 
    },
    { value: 'profile', label: 'Profile', icon: <PermIdentityOutlinedIcon fontSize={isDesktop ? 'medium' : 'small'} /> },
  ];

  // Desktop Sidebar Navigation
  if (isDesktop) {
    return (
      <SidebarContainer>
        {navigationItems.map((item) => (
          <Tooltip
            key={item.value}
            title={item.label}
            placement="right"
            arrow
          >
            <SidebarNavItem
              selected={value === item.value}
              onClick={() => handleChange(item.value)}
              onMouseEnter={() => setHoveredItem(item.value)}
              onMouseLeave={() => setHoveredItem(null)}
              sx={{
                transform: hoveredItem === item.value ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {item.value === 'messages' ? (
                <Badge badgeContent={unreadMessages} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </SidebarNavItem>
          </Tooltip>
        ))}
      </SidebarContainer>
    );
  }

  // Mobile Bottom Navigation
  return (
    <MobileNavContainer elevation={3}>
      <StyledBottomNavigation value={value} onChange={(_event, newValue) => handleChange(newValue)} showLabels>
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </StyledBottomNavigation>
    </MobileNavContainer>
  );
};