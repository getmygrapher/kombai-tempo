import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  IconButton,
  Modal,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { CommunityPose, PoseComment } from '../../types/community';
import { PhotographerInfo } from './PhotographerInfo';
import { CameraSettingsCard } from './CameraSettingsCard';
import { InteractionButtons } from './InteractionButtons';
import { CommentsSection } from './CommentsSection';
import { DifficultyBadge } from './DifficultyBadge';
import { formatPoseCategory, formatEquipmentList } from '../../utils/communityFormatters';
import communityTheme from '../../theme/communityTheme';

interface PoseDetailViewProps {
  pose: CommunityPose;
  comments: PoseComment[];
  isLiked?: boolean;
  isSaved?: boolean;
  onClose: () => void;
  onLike: () => void;
  onSave: () => void;
  onComment: () => void;
  onShare: (platform: string) => void;
  onAddComment: (text: string) => void;
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

const ImageContainer = styled(Box)(({ theme }) => ({
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

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: communityTheme.community.primary.background,
  color: communityTheme.community.primary.main,
  borderRadius: communityTheme.layout.chipBorderRadius,
}));

const ModalContent = styled(Box)(({ theme }) => ({
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

const CloseModalButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

export const PoseDetailView: React.FC<PoseDetailViewProps> = ({
  pose,
  comments,
  isLiked = false,
  isSaved = false,
  onClose,
  onLike,
  onSave,
  onComment,
  onShare,
  onAddComment,
}) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleImageClick = () => {
    setImageModalOpen(true);
  };

  const handleImageModalClose = () => {
    setImageModalOpen(false);
  };

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
          isLiked={isLiked as any}
      isSaved={isSaved as any}
          likesCount={pose.likes_count}
          commentsCount={pose.comments_count}
          onLike={onLike}
          onSave={onSave}
          onComment={onComment}
          onShare={onShare}
        />

        {/* Comments Section */}
        <CommentsSection
          comments={comments}
          onAddComment={onAddComment}
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