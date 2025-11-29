import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import { RatingStars } from './RatingStars';
import { useSubmitRating } from '../../hooks/useRatings';

interface RatingDialogProps {
    open: boolean;
    onClose: () => void;
    professionalId: string;
    jobId: string;
    professionalName: string;
    onSuccess?: () => void;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({
    open,
    onClose,
    professionalId,
    jobId,
    professionalName,
    onSuccess,
}) => {
    const [rating, setRating] = useState(0);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const { submit, submitting, error } = useSubmitRating();

    const handleSubmit = async () => {
        if (rating === 0) return;

        try {
            await submit(professionalId, jobId, rating, reviewText, reviewTitle);
            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            // Error is handled by the hook and displayed in the dialog
        }
    };

    const handleClose = () => {
        setRating(0);
        setReviewTitle('');
        setReviewText('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Rate your experience with {professionalName}
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 2 }}>
                    <Typography component="legend">How would you rate the service?</Typography>
                    <RatingStars
                        rating={rating}
                        size="large"
                        readOnly={false}
                        onChange={setRating}
                        precision={1}
                    />
                    {rating > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            {rating === 5 ? 'Excellent!' :
                                rating === 4 ? 'Good' :
                                    rating === 3 ? 'Average' :
                                        rating === 2 ? 'Poor' : 'Terrible'}
                        </Typography>
                    )}
                </Box>

                <TextField
                    autoFocus
                    margin="dense"
                    label="Review Title (Optional)"
                    fullWidth
                    variant="outlined"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    disabled={submitting}
                />

                <TextField
                    margin="dense"
                    label="Share your experience (Optional)"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    disabled={submitting}
                    helperText={`${reviewText.length}/500 characters`}
                    inputProps={{ maxLength: 500 }}
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={rating === 0 || submitting}
                    startIcon={submitting && <CircularProgress size={16} />}
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
