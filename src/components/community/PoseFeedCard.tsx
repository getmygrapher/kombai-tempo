import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CommunityPose } from '../../types/community';
import { InteractionButtons } from './InteractionButtons';
import { 
  formatPoseCategory, 
  formatDifficultyLevel, 
  formatTimeAgo 
} from '../../utils/communityFormatters';
import communityTheme from '../../theme/communityTheme';

interface PoseFeedCardProps {
  pose: CommunityPose;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
  onShare: (platform: string) => void;
  onClick: () => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: communityTheme.layout.cardBorderRadius,
  boxShadow: theme.shadows[1],
  transition: communityTheme.animations.cardHover,
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 300,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1) 100%)',
  },
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: 2,
  display: 'flex',
  gap: theme.spacing(1),
}));

const StyledChip = styled(Chip)<{ chipType: 'category' | 'difficulty' }>(({ theme, chipType }) => {
  const getChipColor = () => {
    if (chipType === 'difficulty') {
      return {
        backgroundColor: communityTheme.difficulty.beginner.background,
        color: communityTheme.difficulty.beginner.text,
      };
    }
    return {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    };
  };

  return {
    borderRadius: communityTheme.layout.chipBorderRadius,
    fontSize: '0.75rem',
    fontWeight: 600,
    ...getChipColor(),
  };
});

const ContentContainer = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

const PhotographerInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const PhotographerAvatar = styled('img')(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  objectFit: 'cover',
}));

const TruncatedText = styled(Typography)(({ theme }) => ({
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const PoseFeedCard: React.FC<PoseFeedCardProps> = ({
  pose,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onComment,
  onShare,
  onClick,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on interaction buttons
    if ((e.target as HTMLElement).closest('[data-interaction-button]')) {
      return;
    }
    onClick();
  };

  const handleInteractionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <StyledCard onClick={handleCardClick}>
      <Box position="relative">
        <StyledCardMedia
          image={pose.image_url}
          title={pose.title}
        />
        <ChipContainer>
          <StyledChip
            label={formatPoseCategory(pose.category)}
            size="small"
            chipType="category"
          />
          <StyledChip
            label={formatDifficultyLevel(pose.difficulty_level)}
            size="small"
            chipType="difficulty"
          />
        </ChipContainer>
      </Box>

      <ContentContainer>
        <Stack spacing={2}>
          {/* Photographer Info */}
          <PhotographerInfo>
            <PhotographerAvatar
              src={pose.photographer.profile_photo}
              alt={pose.photographer.name}
            />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {pose.photographer.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTimeAgo(pose.created_at)}
              </Typography>
            </Box>
          </PhotographerInfo>

          {/* Title */}
          <Typography variant="h6" fontWeight="bold">
            {pose.title}
          </Typography>

          {/* Posing Tips Excerpt */}
          <TruncatedText variant="body2" color="text.secondary">
            {pose.posing_tips}
          </TruncatedText>

          {/* Camera Settings */}
          {pose.camera_model && (
            <Typography variant="caption" color="text.secondary">
              {pose.camera_model} • f/{pose.aperture} • {pose.shutter_speed} • ISO {pose.iso_setting}
            </Typography>
          )}
        </Stack>
      </ContentContainer>

      {/* Interaction Buttons */}
      <Box data-interaction-button onClick={handleInteractionClick}>
        <InteractionButtons
          poseId={pose.id}
          isLiked={isLiked as any}
      isSaved={isSaved as any}
          likesCount={pose.likes_count}
          commentsCount={pose.comments_count}
          onLike={onLike}
          onSave={onSave}
          onComment={onComment}
          onShare={onShare}
        />
      </Box>
    </StyledCard>
  );
};