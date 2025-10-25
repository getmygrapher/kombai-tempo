import React from 'react';
import { Stack, Avatar, Paper, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

interface TypingIndicatorProps {
  userName: string;
  userAvatar?: string;
}

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const TypingBubble = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderRadius: 18,
  borderBottomLeftRadius: 6,
  backgroundColor: theme.palette.grey[100],
  maxWidth: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const Dot = styled(Box)(({ theme }) => ({
  width: 6,
  height: 6,
  borderRadius: '50%',
  backgroundColor: theme.palette.text.secondary,
  animation: `${bounce} 1.4s infinite ease-in-out`,
  '&:nth-of-type(1)': {
    animationDelay: '-0.32s'
  },
  '&:nth-of-type(2)': {
    animationDelay: '-0.16s'
  }
}));

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  userAvatar = 'https://i.pravatar.cc/150?img=5'
}) => {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ mb: 1 }}>
      <Avatar src={userAvatar} sx={{ width: 32, height: 32 }} />
      
      <TypingBubble elevation={1}>
        <Stack direction="row" spacing={0.5}>
          <Dot />
          <Dot />
          <Dot />
        </Stack>
      </TypingBubble>
    </Stack>
  );
};