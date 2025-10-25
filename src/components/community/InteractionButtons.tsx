import React, { useState } from 'react';
import { Box, Button, Badge, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import OutputOutlinedIcon from '@mui/icons-material/OutputOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkIcon from '@mui/icons-material/Link';
import { formatLikesCount } from '../../utils/communityFormatters';
import communityTheme from '../../theme/communityTheme';

interface InteractionButtonsProps {
  poseId: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
  onShare: (platform: string) => void;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const InteractionButton = styled(Button)<{ isActive?: boolean; interactionType?: string }>(({ theme, isActive, interactionType }) => {
  let activeColor = theme.palette.primary.main;
  
  if (interactionType === 'like') {
    activeColor = communityTheme.interactions.like.active;
  } else if (interactionType === 'save') {
    activeColor = communityTheme.interactions.save.active;
  }
  
  return {
    flex: 1,
    borderRadius: communityTheme.layout.buttonBorderRadius,
    transition: communityTheme.animations.buttonPress,
    color: isActive ? activeColor : theme.palette.text.secondary,
    borderColor: isActive ? activeColor : theme.palette.divider,
    '&:hover': {
      backgroundColor: isActive ? `${activeColor}15` : theme.palette.action.hover,
      borderColor: activeColor,
      transform: 'scale(1.02)',
    },
  };
});

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  poseId,
  isLiked = false,
  isSaved = false,
  likesCount,
  commentsCount,
  onLike,
  onSave,
  onComment,
  onShare,
}) => {
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);

  const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const handleSharePlatform = (platform: string) => {
    onShare(platform);
    handleShareClose();
  };

  return (
    <>
      <StyledContainer>
        <InteractionButton
          variant={isLiked ? "contained" : "outlined"}
          startIcon={<FavoriteOutlinedIcon />}
          onClick={onLike}
          isActive={isLiked as any}
          interactionType="like"
        >
          {formatLikesCount(likesCount)}
        </InteractionButton>
        
        <InteractionButton
          variant="outlined"
          startIcon={<ChatBubbleOutlinedIcon />}
          onClick={onComment}
        >
          {commentsCount}
        </InteractionButton>
        
        <InteractionButton
          variant={isSaved ? "contained" : "outlined"}
          startIcon={<BookmarkBorderOutlinedIcon />}
          onClick={onSave}
          isActive={isSaved as any}
          interactionType="save"
        >
          Save
        </InteractionButton>
        
        <InteractionButton
          variant="outlined"
          startIcon={<OutputOutlinedIcon />}
          onClick={handleShareClick}
        >
          Share
        </InteractionButton>
      </StyledContainer>

      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleSharePlatform('instagram')}>
          <ListItemIcon>
            <InstagramIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Instagram</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSharePlatform('whatsapp')}>
          <ListItemIcon>
            <WhatsAppIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>WhatsApp</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSharePlatform('facebook')}>
          <ListItemIcon>
            <FacebookIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Facebook</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSharePlatform('twitter')}>
          <ListItemIcon>
            <TwitterIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Twitter</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleSharePlatform('copy_link')}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};