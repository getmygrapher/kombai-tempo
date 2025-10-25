import React from 'react';
import { Stack, Typography } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { formatDistance } from '../../utils/formatters';

interface DistanceIndicatorProps {
  distance: number;
  location?: string;
  size?: 'small' | 'medium';
}

export const DistanceIndicator: React.FC<DistanceIndicatorProps> = ({
  distance,
  location,
  size = 'small',
}) => {
  const iconSize = size === 'small' ? 16 : 20;
  const textVariant = size === 'small' ? 'caption' : 'body2';

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <LocationOnOutlinedIcon 
        sx={{ 
          fontSize: iconSize, 
          color: 'text.secondary' 
        }} 
      />
      <Typography variant={textVariant} color="text.secondary">
        {formatDistance(distance)}
        {location && ` • ${location}`}
      </Typography>
    </Stack>
  );
};