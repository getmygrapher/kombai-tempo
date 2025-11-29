import React from 'react';
import { Box, Typography } from '@mui/material';
import { Star, StarHalf, StarBorder } from '@mui/icons-material';

interface RatingStarsProps {
    rating: number;
    size?: 'small' | 'medium' | 'large';
    color?: string;
    showValue?: boolean;
    precision?: 0.5 | 1;
    readOnly?: boolean;
    onChange?: (newValue: number) => void;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    size = 'medium',
    color = '#faaf00',
    showValue = false,
    precision = 0.5,
    readOnly = true,
    onChange,
}) => {
    const stars = [];
    const maxStars = 5;
    const fontSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;

    // Handle click for interactive mode
    const handleClick = (index: number) => {
        if (!readOnly && onChange) {
            onChange(index + 1);
        }
    };

    for (let i = 0; i < maxStars; i++) {
        let StarIcon = StarBorder;

        if (rating >= i + 1) {
            StarIcon = Star;
        } else if (rating >= i + 0.5 && precision === 0.5) {
            StarIcon = StarHalf;
        }

        stars.push(
            <Box
                key={i}
                component="span"
                onClick={() => handleClick(i)}
                sx={{
                    cursor: readOnly ? 'default' : 'pointer',
                    display: 'inline-flex',
                    color: color,
                    '&:hover': !readOnly ? { transform: 'scale(1.1)' } : {},
                    transition: 'transform 0.1s',
                }}
            >
                <StarIcon style={{ fontSize }} />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ display: 'flex' }}>{stars}</Box>
            {showValue && (
                <Typography
                    variant={size === 'small' ? 'caption' : 'body2'}
                    color="text.secondary"
                    fontWeight="medium"
                    sx={{ ml: 0.5 }}
                >
                    {rating.toFixed(1)}
                </Typography>
            )}
        </Box>
    );
};
