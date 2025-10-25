import React, { useState, useRef } from 'react';
import {
  Stack,
  OutlinedInput,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import MicIcon from '@mui/icons-material/Mic';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TemplateIcon from '@mui/icons-material/Article';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import { MessageType } from '../../types/enums';
import { MessageTemplate } from '../../types/communication';

interface MessageInputProps {
  onSendMessage: (content: string, type: MessageType) => void;
  onContactShare?: () => void;
  onVoiceMessage?: (audioBlob: Blob) => void;
  templates?: MessageTemplate[];
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const StyledInput = styled(OutlinedInput)(({ theme }) => ({
  borderRadius: 24,
  backgroundColor: theme.palette.grey[50],
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[200]
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[300]
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main + '0a'
  }
}));

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onContactShare,
  onVoiceMessage,
  templates = [],
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 1000
}) => {
  const [message, setMessage] = useState('');
  const [templatesAnchorEl, setTemplatesAnchorEl] = useState<null | HTMLElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), MessageType.TEXT);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setMessage(template.content);
    setTemplatesAnchorEl(null);
    inputRef.current?.focus();
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false);
    } else {
      // Start recording logic would go here
      setIsRecording(true);
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ p: 2 }}>
      {/* Action Buttons */}
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Message Templates">
          <ActionButton
            size="small"
            onClick={(e) => setTemplatesAnchorEl(e.currentTarget)}
            disabled={disabled as any}
          >
            <TemplateIcon fontSize="small" />
          </ActionButton>
        </Tooltip>

        <Tooltip title="Share Contact">
          <ActionButton
            size="small"
            onClick={onContactShare}
            disabled={disabled as any}
          >
            <ContactMailOutlinedIcon fontSize="small" />
          </ActionButton>
        </Tooltip>

        <Tooltip title={isRecording ? "Stop Recording" : "Voice Message"}>
          <ActionButton
            size="small"
            onClick={handleVoiceRecord}
            disabled={disabled as any}
            sx={{ 
              color: isRecording ? 'error.main' : 'text.secondary',
              animation: isRecording ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            <MicIcon fontSize="small" />
          </ActionButton>
        </Tooltip>
      </Stack>

      {/* Message Input */}
      <StyledInput
        ref={inputRef}
        fullWidth
        multiline
        maxRows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled as any}
        endAdornment={
          <InputAdornment position="end">
            <Stack direction="row" spacing={0.5}>
              <ActionButton size="small" disabled={disabled as any}>
                <EmojiEmotionsIcon fontSize="small" />
              </ActionButton>
              
              <ActionButton
                size="small"
                onClick={handleSend}
                disabled={!canSend as any}
                sx={{
                  color: canSend ? 'primary.main' : 'text.disabled',
                  backgroundColor: canSend ? 'primary.main' + '0a' : 'transparent'
                }}
              >
                <SendIcon fontSize="small" />
              </ActionButton>
            </Stack>
          </InputAdornment>
        }
      />

      {/* Templates Menu */}
      <Menu
        anchorEl={templatesAnchorEl}
        open={Boolean(templatesAnchorEl)}
        onClose={() => setTemplatesAnchorEl(null)}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        {templates.map((template) => (
          <MenuItem
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            sx={{ maxWidth: 300 }}
          >
            <Stack>
              <div style={{ fontWeight: 500 }}>{template.title}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                {template.content.slice(0, 60)}...
              </div>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};