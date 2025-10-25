import React from 'react';
import { Card, CardMedia, Box, Typography, Avatar, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import { CommunityPose } from '../../types/community';
import { DifficultyBadge } from './DifficultyBadge';
import { formatLikesCount } from '../../utils/communityFormatters';
import communityTheme from '../../theme/communityTheme';

interface PoseGridItemProps {
  pose: CommunityPose;
  onSelect: (poseId: string) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  position: 'relative',
  borderRadius: communityTheme.layout.cardBorderRadius,
  transition: communityTheme.animations.cardHover,
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  objectFit: 'cover',
}));

const OverlayBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
}));

const LikesContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: 'white',
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const PhotographerAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  border: '2px solid white',
}));

export const PoseGridItem: React.FC<PoseGridItemProps> = ({
  pose,
  onSelect,
}) => {
  const handleClick = () => {
    onSelect(pose.id);
  };

  return (
    <StyledCard onClick={handleClick}>
      <StyledCardMedia
        image={pose.image_url}
        title={pose.title}
      />
      
      <OverlayBox>
        <Box display="flex" justifyContent="flex-end">
          <DifficultyBadge level={pose.difficulty_level} />
        </Box>
        
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <LikesContainer>
            <FavoriteOutlinedIcon fontSize="small" />
            <Typography variant="body2" color="inherit">
              {formatLikesCount(pose.likes_count)}
            </Typography>
          </LikesContainer>
          
          <PhotographerAvatar
            src={pose.photographer.profile_photo}
            alt={pose.photographer.name}
          />
        </Stack>
      </OverlayBox>
    </StyledCard>
  );
};