import React from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';

interface QuickActionsPanelProps {
  onPostJob: () => void;
  onEmergencyHire: () => void;
  onSearchJobs: () => void;
  onSearchProfessionals: () => void;
}

const QuickActionsContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(10), // Above bottom navigation
  right: theme.spacing(2),
  zIndex: 1000
}));

const actions = [
  {
    icon: <WorkOutlineOutlinedIcon />,
    name: 'Post Job',
    action: 'postJob'
  },
  {
    icon: <FlashOnOutlinedIcon />,
    name: 'Emergency Hire',
    action: 'emergencyHire'
  },
  {
    icon: <SearchOutlinedIcon />,
    name: 'Search Jobs',
    action: 'searchJobs'
  },
  {
    icon: <PersonSearchOutlinedIcon />,
    name: 'Find Professionals',
    action: 'searchProfessionals'
  }
];

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onPostJob,
  onEmergencyHire,
  onSearchJobs,
  onSearchProfessionals
}) => {
  const handleAction = (action: string) => {
    switch (action) {
      case 'postJob':
        onPostJob();
        break;
      case 'emergencyHire':
        onEmergencyHire();
        break;
      case 'searchJobs':
        onSearchJobs();
        break;
      case 'searchProfessionals':
        onSearchProfessionals();
        break;
    }
  };

  return (
    <QuickActionsContainer>
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'absolute', bottom: 0, right: 0 }}
        icon={<SpeedDialIcon openIcon={<AddOutlinedIcon />} />}
        FabProps={{
          color: 'primary',
          size: 'large'
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => handleAction(action.action)}
            FabProps={{
              size: 'medium'
            }}
          />
        ))}
      </SpeedDial>
    </QuickActionsContainer>
  );
};