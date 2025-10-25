import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DifficultyLevel } from '../../types/community';
import { formatDifficultyLevel } from '../../utils/communityFormatters';
import communityTheme from '../../theme/communityTheme';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  size?: 'small' | 'medium';
}

const StyledChip = styled(Chip)<{ difficulty: DifficultyLevel }>(({ theme, difficulty }) => {
  const difficultyColors = communityTheme.difficulty[difficulty];
  
  return {
    backgroundColor: difficultyColors.background,
    color: difficultyColors.text,
    fontWeight: 500,
    fontSize: '0.75rem',
    height: 24,
    borderRadius: communityTheme.layout.chipBorderRadius,
    '& .MuiChip-label': {
      paddingLeft: 8,
      paddingRight: 8,
    },
  };
});

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  level,
  size = 'small'
}) => {
  return (
    <StyledChip
      label={formatDifficultyLevel(level)}
      size={size}
      difficulty={level}
    />
  );
};