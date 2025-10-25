import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Modal,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { CommunityPose, PoseComment } from '../../types/community';
import { PhotographerInfo } from '../../components/community/PhotographerInfo';
import { CameraSettingsCard } from '../../components/community/CameraSettingsCard';
import { InteractionButtons } from '../../components/community/InteractionButtons';
import { CommentsSection } from '../../components/community/CommentsSection';
import { DifficultyBadge } from '../../components/community/DifficultyBadge';
import { formatPoseCategory, formatEquipmentList } from '../../utils/communityFormatters';
import { communityService } from '../../services/communityService';
import { useCommunityStore } from '../../store/communityStore';
import communityTheme from '../../theme/communityTheme';

interface PoseDetailPageProps {
  poseId: string;
  onClose: () => void;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  overflow: 'auto',
  backgroundColor: theme.palette.background.default,
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 10,
}));

const ImageContainer = styled(Box)(() => ({
  position: 'relative',
  cursor: 'pointer',
}));

const ZoomButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: communityTheme.layout.cardBorderRadius,
}));

const CategoryChip = styled(Chip)(() => ({
  backgroundColor: communityTheme.community.primary.background,
  color: communityTheme.community.primary.main,
  borderRadius: communityTheme.layout.chipBorderRadius,
}));

const ModalContent = styled(Box)(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  height: '90vh',
  backgroundColor: 'black',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
}));

const ModalImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

const CloseModalButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: 16,
  right: 16,
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

export const PoseDetailPage: React.FC<PoseDetailPageProps> = ({
  poseId,
  onClose,
}) => {
  const [pose, setPose] = useState<CommunityPose | null>(null);
  const [comments, setComments] = useState<PoseComment[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { likedPoses, savedPoses, toggleLike, toggleSave, addComment } = useCommunityStore();

  useEffect(() => {
    loadPoseDetails();
  }, [poseId]);

  // Subscribe to real-time comments for this pose
  useEffect(() => {
    if (!poseId) return;
    const unsubscribe = communityService.subscribeToComments(poseId, (incoming: PoseComment) => {
      setComments((prev) => {
        if (prev.some((c) => c.id === incoming.id)) return prev;
        const next = [incoming, ...prev];
        return next;
      });
      try {
        addComment(incoming);
      } catch (err) {
        // Intentionally ignore store sync issues to avoid breaking UI, but log for debugging
        console.warn('Failed to sync incoming comment to store', err);
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [poseId, addComment]);

  const loadPoseDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [poseData, commentsData] = await Promise.all([
        communityService.getPoseById(poseId),
        communityService.listComments(poseId)
      ]);
      
      if (poseData) {
        setPose(poseData);
        setComments(commentsData.comments);
      } else {
        setError('Pose not found');
      }
    } catch {
      setError('Failed to load pose details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    setImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false);
  };

  const handleLike = () => {
    if (pose) {
      toggleLike(pose.id);
      communityService.likePose(pose.id, 'current-user');
    }
  };

  const handleSave = () => {
    if (pose) {
      toggleSave(pose.id);
      communityService.savePose(pose.id, 'current-user');
    }
  };

  const handleShare = (platform: string) => {
    if (pose) {
      communityService.sharePose(pose.id, platform);
      console.log(`Sharing pose ${pose.id} on ${platform}`);
    }
  };

  const handleAddComment = async (text: string) => {
    if (pose) {
      try {
        const newComment = await communityService.addComment(pose.id, 'current-user', text);
        setComments(prev => [newComment, ...prev]);
        addComment(newComment);
      } catch (err) {
        // Keep UI responsive on comment failure, but log for observability
        console.warn('Failed to add comment', err);
      }
    }
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  if (error || !pose) {
    return (
      <StyledContainer>
        <HeaderContainer>
          <Typography variant="h6" fontWeight={600}>
            Pose Details
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </HeaderContainer>
        <Box p={2}>
          <Alert severity="error">{error || 'Pose not found'}</Alert>
        </Box>
      </StyledContainer>
    );
  }

  const isLiked = likedPoses.has(pose.id);
  const isSaved = savedPoses.has(pose.id);

  return (
    <>
      <StyledContainer>
        {/* Header */}
        <HeaderContainer>
          <Typography variant="h6" fontWeight={600}>
            Pose Details
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </HeaderContainer>

        {/* Main Image */}
        <ImageContainer onClick={handleImageClick}>
          <CardMedia
            component="img"
            image={pose.image_url}
            alt={pose.title}
            sx={{ 
              width: '100%', 
              height: 400, 
              objectFit: 'cover' 
            }}
          />
          <ZoomButton size="small">
            <ZoomInIcon />
          </ZoomButton>
        </ImageContainer>

        <ContentContainer>
          <Stack spacing={2}>
            {/* Title and Category */}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="h5" fontWeight={700} flex={1}>
                {pose.title}
              </Typography>
              <CategoryChip 
                label={formatPoseCategory(pose.category)} 
                size="small" 
              />
              <DifficultyBadge level={pose.difficulty_level} />
            </Stack>

            {/* Photographer Info */}
            <SectionCard>
              <CardContent>
                <PhotographerInfo photographer={pose.photographer} />
              </CardContent>
            </SectionCard>

            {/* Posing Tips */}
            <SectionCard>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📝 Posing Tips
                </Typography>
                <Typography variant="body1" lineHeight={1.6}>
                  {pose.posing_tips}
                </Typography>
              </CardContent>
            </SectionCard>

            {/* Camera Settings */}
            <CameraSettingsCard
              settings={{
                camera_model: pose.camera_model,
                lens_model: pose.lens_model,
                focal_length: pose.focal_length,
                aperture: pose.aperture,
                shutter_speed: pose.shutter_speed,
                iso_setting: pose.iso_setting,
                flash_used: pose.flash_used,
                exif_extraction_success: pose.exif_extraction_success,
              }}
              cameraModel={pose.camera_model}
              lensModel={pose.lens_model}
              focalLength={pose.focal_length}
              aperture={pose.aperture}
              shutterSpeed={pose.shutter_speed}
              isoSetting={pose.iso_setting}
              flashUsed={pose.flash_used}
            />

            {/* Equipment */}
            {pose.additional_equipment.length > 0 && (
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    🛠️ Equipment Used
                  </Typography>
                  <Typography variant="body1">
                    {formatEquipmentList(pose.additional_equipment)}
                  </Typography>
                </CardContent>
              </SectionCard>
            )}

            {/* Lighting Setup */}
            {pose.lighting_setup && (
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    💡 Lighting Setup
                  </Typography>
                  <Typography variant="body1">
                    {pose.lighting_setup}
                  </Typography>
                </CardContent>
              </SectionCard>
            )}

            {/* Story Behind */}
            {pose.story_behind && (
              <SectionCard>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    📖 Story Behind
                  </Typography>
                  <Typography variant="body1" lineHeight={1.6}>
                    {pose.story_behind}
                  </Typography>
                </CardContent>
              </SectionCard>
            )}
          </Stack>
        </ContentContainer>

        {/* Interaction Buttons */}
        <InteractionButtons
          poseId={pose.id}
          isLiked={isLiked}
            isSaved={isSaved}
          likesCount={pose.likes_count}
          commentsCount={pose.comments_count}
          onLike={handleLike}
          onSave={handleSave}
          onComment={() => {}}
          onShare={handleShare}
        />

        {/* Comments Section */}
        <CommentsSection
          comments={comments}
          onAddComment={handleAddComment}
        />
      </StyledContainer>

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onClose={handleImageModalClose}
        sx={{ zIndex: 2000 }}
      >
        <ModalContent>
          <ModalImage src={pose.image_url} alt={pose.title} />
          <CloseModalButton onClick={handleImageModalClose}>
            <CloseIcon />
          </CloseModalButton>
        </ModalContent>
      </Modal>
    </>
  );
};