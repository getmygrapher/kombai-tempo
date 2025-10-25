import React from 'react';
import { Box, Avatar, Typography, Stack, Rating } from '@mui/material';
import { styled } from '@mui/material/styles';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { PhotographerInfo as PhotographerInfoType } from '../../types/community';
import communityTheme from '../../theme/communityTheme';

interface PhotographerInfoProps {
  photographer: PhotographerInfoType;
  showRating?: boolean;
  avatarSize?: number;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const VerifiedIcon = styled(VerifiedOutlinedIcon)(({ theme }) => ({
  fontSize: 16,
  color: communityTheme.community.success.main,
}));

export const PhotographerInfo: React.FC<PhotographerInfoProps> = ({
  photographer,
  showRating = true,
  avatarSize = 40
}) => {
  return (
    <StyledContainer>
      <Avatar
        src={photographer.profile_photo}
        alt={photographer.name}
        sx={{ width: avatarSize, height: avatarSize }}
      />
      
      <Stack spacing={0.5} flex={1}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            {photographer.name}
          </Typography>
          {photographer.is_verified && <VerifiedIcon />}
        </Stack>
        
        <Typography variant="caption" color="text.secondary">
          {photographer.location}
        </Typography>
        
        {showRating && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Rating
              value={photographer.rating}
              precision={0.1}
              size="small"
              readOnly
            />
            <Typography variant="caption" color="text.secondary">
              ({photographer.total_reviews})
            </Typography>
          </Stack>
        )}
      </Stack>
    </StyledContainer>
  );
};