import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useOutletContext } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraIcon from '@mui/icons-material/Camera';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { EquipmentInfo, EquipmentItem, ViewerPermissions } from '../../data/profileViewSystemMockData';
import { PrivacyGate } from './PrivacyGate';

interface EquipmentShowcaseProps {
  equipment?: EquipmentInfo;
  viewerPermissions?: ViewerPermissions;
}

interface OutletContext {
  profileData: any;
  viewerPermissions: ViewerPermissions;
}

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const EquipmentCard = styled(Card)(({ theme }) => ({
  height: '100%',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: theme.shadows[2],
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => ({
  fontSize: '0.75rem',
  height: 24,
  ...(status === 'available' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
  ...(status === 'in_use' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(status === 'maintenance' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
  ...(status === 'unavailable' && {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.grey[800],
  }),
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'available':
      return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    case 'in_use':
      return <WarningIcon sx={{ fontSize: 16 }} />;
    case 'maintenance':
    case 'unavailable':
      return <ErrorIcon sx={{ fontSize: 16 }} />;
    default:
      return null;
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'in_use':
      return 'In Use';
    case 'maintenance':
      return 'Maintenance';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Unknown';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'cameras':
      return <CameraAltIcon />;
    case 'lenses':
      return <CameraIcon />;
    case 'lighting':
      return <FlashlightOnIcon />;
    default:
      return <BuildIcon />;
  }
};

const EquipmentItemCard: React.FC<{ item: EquipmentItem }> = ({ item }) => {
  return (
    <EquipmentCard>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" gutterBottom noWrap>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {item.category}
              </Typography>
            </Box>
            <StatusChip
              status={item.status}
              label={getStatusLabel(item.status)}
              size="small"
              icon={getStatusIcon(item.status)}
            />
          </Stack>
          
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Condition: {item.condition}
            </Typography>
            
            {(item.isIndoorCapable !== undefined || item.isOutdoorCapable !== undefined) && (
              <Stack direction="row" spacing={0.5}>
                {item.isIndoorCapable && (
                  <Chip label="Indoor" size="small" variant="outlined" />
                )}
                {item.isOutdoorCapable && (
                  <Chip label="Outdoor" size="small" variant="outlined" />
                )}
              </Stack>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </EquipmentCard>
  );
};

const EquipmentCategory: React.FC<{
  title: string;
  items: EquipmentItem[];
  icon: React.ReactNode;
}> = ({ title, items, icon }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (items.length === 0) {
    return null;
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <CategoryHeader>
          {icon}
          <Typography variant="h6" component="h3">
            {title} ({items.length})
          </Typography>
        </CategoryHeader>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid xs={12} sm={6} md={4} key={item.id}>
              <EquipmentItemCard item={item} />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

const EquipmentSkeleton = () => (
  <Stack spacing={3}>
    {[1, 2, 3].map((i) => (
      <Box key={i}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3].map((j) => (
            <Grid item xs={12} sm={6} md={4} key={j}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    ))}
  </Stack>
);

export const EquipmentShowcase: React.FC<EquipmentShowcaseProps> = ({
  equipment: propEquipment,
  viewerPermissions: propViewerPermissions
}) => {
  // Try to get data from outlet context if not provided as props
  const outletContext = useOutletContext<OutletContext>();
  const equipment = propEquipment || outletContext?.profileData?.equipment;
  const viewerPermissions = propViewerPermissions || outletContext?.viewerPermissions;

  if (!equipment || !viewerPermissions) {
    return <EquipmentSkeleton />;
  }

  const EquipmentContent = () => {
    const categories = [
      { key: 'cameras', title: 'Cameras', items: equipment.cameras, icon: getCategoryIcon('cameras') },
      { key: 'lenses', title: 'Lenses', items: equipment.lenses, icon: getCategoryIcon('lenses') },
      { key: 'lighting', title: 'Lighting', items: equipment.lighting, icon: getCategoryIcon('lighting') },
      { key: 'other', title: 'Other Equipment', items: equipment.other, icon: getCategoryIcon('other') }
    ];

    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const availableItems = categories.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.status === 'available').length, 0
    );

    if (totalItems === 0) {
      return (
        <StyledCard>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <BuildIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Equipment Listed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This professional hasn't added their equipment details yet.
            </Typography>
          </CardContent>
        </StyledCard>
      );
    }

    return (
      <Stack spacing={3}>
        {/* Equipment Summary */}
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" gutterBottom>
                  Equipment Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Professional-grade equipment for high-quality results
                </Typography>
              </Box>
              <Stack spacing={1} alignItems="flex-end">
                <Typography variant="h4" color="primary">
                  {totalItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
                <Chip
                  label={`${availableItems} Available`}
                  color="success"
                  size="small"
                />
              </Stack>
            </Stack>
          </CardContent>
        </StyledCard>

        {/* Equipment Categories */}
        <Box>
          {categories.map((category) => (
            <EquipmentCategory
              key={category.key}
              title={category.title}
              items={category.items}
              icon={category.icon}
            />
          ))}
        </Box>

        {/* Equipment Notes */}
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'action.hover', 
          borderRadius: 1 
        }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> Equipment availability is updated in real-time. 
            Some items may become unavailable due to bookings or maintenance.
          </Typography>
        </Box>
      </Stack>
    );
  };

  return (
    <Box
      role="tabpanel"
      id="tabpanel-equipment"
      aria-labelledby="tab-equipment"
    >
      <PrivacyGate
        viewerPermissions={viewerPermissions}
        requiredPermission="canViewEquipment"
        gateType="equipment"
        fallbackContent={
          <StyledCard>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <BuildIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Equipment Details Available on Request
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact this professional to learn more about their equipment and capabilities.
              </Typography>
            </CardContent>
          </StyledCard>
        }
      >
        <EquipmentContent />
      </PrivacyGate>
    </Box>
  );
};