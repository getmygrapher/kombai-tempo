import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Stack, 
  Avatar, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PoseComment } from '../../types/community';
import { formatTimeAgo } from '../../utils/communityFormatters';
import communityTheme from '../../theme/communityTheme';

interface CommentsSectionProps {
  comments: PoseComment[];
  onAddComment: (text: string) => void;
  currentUserAvatar?: string;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const CommentInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: communityTheme.layout.buttonBorderRadius,
  },
}));

const CommentItem = styled(ListItem)(({ theme }) => ({
  alignItems: 'flex-start',
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

const CommentText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  lineHeight: 1.5,
  marginBottom: theme.spacing(0.5),
}));

const CommentMeta = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  onAddComment,
  currentUserAvatar = 'https://i.pravatar.cc/150?img=10',
}) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <StyledContainer>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={600}>
          💬 Comments ({comments.length})
        </Typography>

        {/* Comment Input */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Avatar
            src={currentUserAvatar}
            alt="Your avatar"
            sx={{ width: 32, height: 32, mt: 0.5 }}
          />
          <Box flex={1}>
            <CommentInput
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
            />
            <Box mt={1} display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                disabled={!commentText.trim() as any}
                sx={{ borderRadius: communityTheme.layout.buttonBorderRadius }}
              >
                Post Comment
              </Button>
            </Box>
          </Box>
        </Stack>

        {/* Comments List */}
        {comments.length > 0 ? (
          <List disablePadding>
            {comments.map((comment) => (
              <CommentItem key={comment.id}>
                <ListItemAvatar>
                  <Avatar
                    src={comment.user.profile_photo}
                    alt={comment.user.name}
                    sx={{ width: 32, height: 32 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Stack spacing={0.5}>
                      <CommentText>{comment.comment_text}</CommentText>
                      <CommentMeta>
                        <strong>{comment.user.name}</strong> • {formatTimeAgo(comment.created_at)}
                      </CommentMeta>
                    </Stack>
                  }
                />
              </CommentItem>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={3}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to share your thoughts!
            </Typography>
          </Box>
        )}
      </Stack>
    </StyledContainer>
  );
};