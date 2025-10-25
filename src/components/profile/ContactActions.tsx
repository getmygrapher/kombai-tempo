import React, { useState } from 'react';
import {
  Stack,
  Button,
  IconButton,
  Paper,
  Box,
  Typography,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import TurnedInNotOutlinedIcon from '@mui/icons-material/TurnedInNotOutlined';
import TurnedInOutlinedIcon from '@mui/icons-material/TurnedInOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import ReportOutlinedIcon from '@mui/icons-material/ReportOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { Professional, ViewerPermissions } from '../../data/profileViewSystemMockData';

interface ContactActionsProps {
  professional: Professional;
  viewerPermissions: ViewerPermissions;
  onContact: (professionalId: string, method: string) => void;
  onBook: (professionalId: string) => void;
  onSave: (professionalId: string) => void;
  onShare: (professionalId: string) => void;
  onReport: (professionalId: string) => void;
  variant?: 'mobile' | 'desktop';
}

const DesktopContainer = styled(Paper)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
}));

const MobileContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
  boxShadow: theme.shadows[8],
  zIndex: 1000,
  backgroundColor: theme.palette.background.paper,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  padding: theme.spacing(1.5, 3),
}));

const SecondaryActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  padding: theme.spacing(1, 2),
}));

const FloatingActions = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
}));

export const ContactActions: React.FC<ContactActionsProps> = ({
  professional,
  viewerPermissions,
  onContact,
  onBook,
  onSave,
  onShare,
  onReport,
  variant = 'desktop',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSaved, setIsSaved] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(professional.id);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleShare = () => {
    onShare(professional.id);
    handleMenuClose();
  };

  const handleReport = () => {
    onReport(professional.id);
    handleMenuClose();
  };

  if (variant === 'mobile' || isMobile) {
    return (
      <MobileContainer elevation={8}>
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Primary Actions */}
          <ActionButton
            variant="contained"
            color="primary"
            startIcon={<ChatBubbleOutlinedIcon />}
            onClick={() => onContact(professional.id, 'message')}
            disabled={!viewerPermissions.canSendMessage as any}
            sx={{ flex: 1 }}
          >
            Message
          </ActionButton>

          <ActionButton
            variant="contained"
            color="secondary"
            startIcon={<CalendarMonthOutlinedIcon />}
            onClick={() => onBook(professional.id)}
            sx={{ flex: 1 }}
          >
            Book Now
          </ActionButton>

          {/* Secondary Actions */}
          <IconButton
            color={isSaved ? 'primary' : 'default'}
            onClick={handleSave}
            sx={{ 
              border: `1px solid ${isSaved ? theme.palette.primary.main : theme.palette.divider}`,
            }}
          >
            {isSaved ? <TurnedInOutlinedIcon /> : <TurnedInNotOutlinedIcon />}
          </IconButton>

          <IconButton
            onClick={handleMenuClick}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <MoreVertOutlinedIcon />
          </IconButton>
        </Stack>

        {/* More Actions Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          {viewerPermissions.canViewContact && (
            <MenuItem onClick={() => {
              onContact(professional.id, 'phone');
              handleMenuClose();
            }}>
              <ListItemIcon>
                <PhoneOutlinedIcon />
              </ListItemIcon>
              <ListItemText>Call</ListItemText>
            </MenuItem>
          )}
          
          <MenuItem onClick={handleShare}>
            <ListItemIcon>
              <ShareOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Share Profile</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleReport}>
            <ListItemIcon>
              <ReportOutlinedIcon />
            </ListItemIcon>
            <ListItemText>Report Profile</ListItemText>
          </MenuItem>
        </Menu>
      </MobileContainer>
    );
  }

  // Desktop Layout
  return (
    <DesktopContainer>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Contact {professional.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Response time: {professional.responseTime}
          </Typography>
        </Box>

        {/* Primary Actions */}
        <Stack spacing={2}>
          <ActionButton
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ChatBubbleOutlinedIcon />}
            onClick={() => onContact(professional.id, 'message')}
            disabled={!viewerPermissions.canSendMessage as any}
            fullWidth
          >
            Send Message
          </ActionButton>

          <ActionButton
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<CalendarMonthOutlinedIcon />}
            onClick={() => onBook(professional.id)}
            fullWidth
          >
            Book Now
          </ActionButton>

          {viewerPermissions.canViewContact && (
            <SecondaryActionButton
              variant="outlined"
              startIcon={<PhoneOutlinedIcon />}
              onClick={() => onContact(professional.id, 'phone')}
              fullWidth
            >
              Call Now
            </SecondaryActionButton>
          )}
        </Stack>

        {/* Secondary Actions */}
        <Stack direction="row" spacing={1}>
          <SecondaryActionButton
            variant="outlined"
            startIcon={isSaved ? <TurnedInOutlinedIcon /> : <TurnedInNotOutlinedIcon />}
            onClick={handleSave}
            color={isSaved ? 'primary' : 'inherit'}
            sx={{ flex: 1 }}
          >
            {isSaved ? 'Saved' : 'Save'}
          </SecondaryActionButton>

          <SecondaryActionButton
            variant="outlined"
            startIcon={<ShareOutlinedIcon />}
            onClick={() => onShare(professional.id)}
            sx={{ flex: 1 }}
          >
            Share
          </SecondaryActionButton>
        </Stack>

        {/* Report Action */}
        <SecondaryActionButton
          variant="text"
          color="error"
          startIcon={<ReportOutlinedIcon />}
          onClick={() => onReport(professional.id)}
          size="small"
        >
          Report Profile
        </SecondaryActionButton>
      </Stack>
    </DesktopContainer>
  );
};