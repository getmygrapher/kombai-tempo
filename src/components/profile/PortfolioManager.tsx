import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Stack,
  Paper,
  Button,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PortfolioItem } from '../../store/profileManagementStore';
import { useProfileManagementStore } from '../../store/profileManagementStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
}));

const UploadArea = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  border: `2px dashed ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.grey[50],
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '05',
  },
  '&.drag-active': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '10',
  }
}));

const PortfolioCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
    '& .portfolio-actions': {
      opacity: 1,
    }
  }
}));

const PortfolioActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
}));

const DragHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  opacity: 0.7,
  cursor: 'grab',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  '&:active': {
    cursor: 'grabbing',
  }
}));

interface PortfolioManagerProps {
  portfolio: PortfolioItem[];
  onUpload: (files: File[]) => Promise<void>;
  onReorder: (items: PortfolioItem[]) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  onUpdateCaption: (itemId: string, caption: string) => Promise<void>;
  onBack: () => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolio,
  onUpload,
  onReorder,
  onDelete,
  onUpdateCaption,
  onBack
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { isSaving, uploadPortfolioImage, portfolioState } = useProfileManagementStore();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      await handleFileUpload(files);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFileUpload(files);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    setErrorMessage('');
    
    try {
      // Validate files
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isImage && isValidSize;
      });

      if (validFiles.length === 0) {
        setErrorMessage('Please select valid image files (max 5MB each)');
        return;
      }

      // Upload files one by one
      for (const file of validFiles) {
        await uploadPortfolioImage(file);
      }

      setSuccessMessage(`Successfully uploaded ${validFiles.length} image(s)`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditCaption = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditCaption(item.caption);
  };

  const handleSaveCaption = async () => {
    if (editingItem) {
      try {
        await onUpdateCaption(editingItem.id, editCaption);
        setEditingItem(null);
        setEditCaption('');
        setSuccessMessage('Caption updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage('Failed to update caption');
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await onDelete(itemId);
        setSuccessMessage('Image deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        setErrorMessage('Failed to delete image');
      }
    }
  };

  const currentPortfolio = portfolioState.length > 0 ? portfolioState : portfolio;

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={onBack} 
            sx={{ mb: 2 }}
          >
            Back to Profile
          </Button>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Portfolio Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload and organize your best work to showcase your skills
          </Typography>
        </Box>

        {/* Alerts */}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Upload Area */}
        <UploadArea
          className={dragActive ? 'drag-active' : ''}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('portfolio-upload')?.click()}
        >
          <input
            id="portfolio-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {isUploading ? (
            <Stack spacing={2} alignItems="center">
              <CircularProgress />
              <Typography variant="body1">Uploading images...</Typography>
            </Stack>
          ) : (
            <Stack spacing={2} alignItems="center">
              <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="medium">
                Drag & Drop Images Here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to select files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supports JPG, PNG, WebP (max 5MB each)
              </Typography>
            </Stack>
          )}
        </UploadArea>

        {/* Portfolio Grid */}
        {currentPortfolio.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Your Portfolio ({currentPortfolio.length} images)
            </Typography>
            
            <Grid container spacing={2}>
              {currentPortfolio
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <PortfolioCard>
                      <DragHandle>
                        <DragIndicatorIcon sx={{ color: 'white', fontSize: 20 }} />
                      </DragHandle>
                      
                      <PortfolioActions className="portfolio-actions">
                        <IconButton
                          size="small"
                          onClick={() => handleEditCaption(item)}
                          sx={{ color: 'white' }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item.id)}
                          sx={{ color: 'white' }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </PortfolioActions>

                      <CardMedia
                        component="img"
                        height="200"
                        image={item.url}
                        alt={item.caption || 'Portfolio image'}
                        sx={{ objectFit: 'cover' }}
                      />
                      
                      {item.caption && (
                        <CardContent sx={{ py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {item.caption}
                          </Typography>
                        </CardContent>
                      )}
                    </PortfolioCard>
                  </Grid>
                ))}
            </Grid>
          </Box>
        )}

        {/* Empty State */}
        {currentPortfolio.length === 0 && !isUploading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No portfolio images yet
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload your best work to showcase your photography skills
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => document.getElementById('portfolio-upload')?.click()}
              sx={{ mt: 2 }}
            >
              Upload Your First Image
            </Button>
          </Paper>
        )}

        {/* Edit Caption Dialog */}
        <Dialog 
          open={!!editingItem} 
          onClose={() => setEditingItem(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Image Caption</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Caption"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              placeholder="Add a caption to describe this image..."
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCaption} variant="contained">
              Save Caption
            </Button>
          </DialogActions>
        </Dialog>

        {/* Floating Action Button for Upload */}
        {currentPortfolio.length > 0 && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
            }}
            onClick={() => document.getElementById('portfolio-upload')?.click()}
          >
            <AddIcon />
          </Fab>
        )}
      </Stack>
    </StyledContainer>
  );
};