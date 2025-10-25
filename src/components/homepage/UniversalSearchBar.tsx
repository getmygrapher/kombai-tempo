import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Fade,
  ClickAwayListener
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { SearchMode } from '../../types/homepage';
import { useSearchSuggestions } from '../../hooks/useHomepage';
import { formatSearchPlaceholder } from '../../utils/homepageFormatters';

interface UniversalSearchBarProps {
  searchQuery: string;
  searchMode: SearchMode;
  recentSearches: string[];
  onSearchChange: (query: string) => void;
  onModeChange: (mode: SearchMode) => void;
  onSuggestionSelect: (suggestion: string) => void;
  onRecentSearchSelect: (search: string) => void;
}

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 600,
  margin: '0 auto'
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 24,
    backgroundColor: theme.palette.grey[50],
    border: `1px solid ${theme.palette.grey[200]}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.grey[300]
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}15`
    }
  }
}));

const SuggestionsPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 1300,
  marginTop: theme.spacing(1),
  borderRadius: 12,
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: theme.shadows[4],
  maxHeight: 400,
  overflow: 'auto'
}));

const ModeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  borderRadius: 12,
  padding: 4,
  '& .MuiToggleButton-root': {
    border: 'none',
    borderRadius: 8,
    padding: '6px 16px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none',
    '&.Mui-selected': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      '&:hover': {
        backgroundColor: theme.palette.background.paper
      }
    }
  }
}));

export const UniversalSearchBar: React.FC<UniversalSearchBarProps> = ({
  searchQuery,
  searchMode,
  recentSearches,
  onSearchChange,
  onModeChange,
  onSuggestionSelect,
  onRecentSearchSelect
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions = [] } = useSearchSuggestions(searchQuery);

  useEffect(() => {
    setShowSuggestions(isFocused && (searchQuery.length >= 2 || recentSearches.length > 0));
  }, [isFocused, searchQuery, recentSearches]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleClickAway = () => {
    setIsFocused(false);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleRecentSearchClick = (search: string) => {
    onRecentSearchSelect(search);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onSearchChange('');
    inputRef.current?.focus();
  };

  const handleModeChange = (event: React.MouseEvent<HTMLElement>, newMode: SearchMode | null) => {
    if (newMode) {
      onModeChange(newMode);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <SearchContainer>
        <Stack spacing={2}>
          {/* Search Mode Toggle */}
          <Box display="flex" justifyContent="center">
            <ModeToggle
              value={searchMode}
              exclusive
              onChange={handleModeChange}
              size="small"
            >
              <ToggleButton value={SearchMode.BOTH}>
                Both
              </ToggleButton>
              <ToggleButton value={SearchMode.JOBS}>
                Jobs
              </ToggleButton>
              <ToggleButton value={SearchMode.PROFESSIONALS}>
                Professionals
              </ToggleButton>
            </ModeToggle>
          </Box>

          {/* Search Input */}
          <StyledTextField
            ref={inputRef}
            fullWidth
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleFocus}
            placeholder={formatSearchPlaceholder(searchMode)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    edge="end"
                  >
                    <ClearOutlinedIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Stack>

        {/* Suggestions Panel */}
        <Fade in={showSuggestions as any}>
          <SuggestionsPanel>
            <List disablePadding>
              {/* Recent Searches */}
              {searchQuery.length < 2 && recentSearches.length > 0 && (
                <>
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Recent Searches
                    </Typography>
                  </ListItem>
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      <HistoryOutlinedIcon 
                        sx={{ mr: 2, fontSize: 18, color: 'text.secondary' }} 
                      />
                      <ListItemText primary={search} />
                    </ListItemButton>
                  ))}
                  {suggestions.length > 0 && <Divider />}
                </>
              )}

              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <>
                  {searchQuery.length >= 2 && (
                    <ListItem>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Suggestions
                      </Typography>
                    </ListItem>
                  )}
                  {suggestions.slice(0, 5).map((suggestion, index) => (
                    <ListItemButton
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <SearchOutlinedIcon 
                        sx={{ mr: 2, fontSize: 18, color: 'text.secondary' }} 
                      />
                      <ListItemText primary={suggestion} />
                    </ListItemButton>
                  ))}
                </>
              )}

              {/* Popular Searches */}
              {searchQuery.length < 2 && recentSearches.length === 0 && (
                <>
                  <ListItem>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Popular Searches
                    </Typography>
                  </ListItem>
                  <ListItem>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      {['wedding photographer', 'videographer', 'graphic designer'].map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          onClick={() => handleSuggestionClick(tag)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Stack>
                  </ListItem>
                </>
              )}
            </List>
          </SuggestionsPanel>
        </Fade>
      </SearchContainer>
    </ClickAwayListener>
  );
};