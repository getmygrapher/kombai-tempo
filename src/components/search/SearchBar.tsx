import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    InputBase,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Box,
    ClickAwayListener,
    CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import PoseIcon from '@mui/icons-material/CameraAlt';
import JobIcon from '@mui/icons-material/Work';
import { useSearchSuggestions } from '../../hooks/useSearch';
import { useSearchStore } from '../../store/searchStore';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
    initialQuery?: string;
    onSearch?: (query: string) => void;
    fullWidth?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    initialQuery = '',
    onSearch,
    fullWidth = false
}) => {
    const [inputValue, setInputValue] = useState(initialQuery);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const { query, setQuery, suggestions, loading } = useSearchSuggestions();
    const { setQuery: setStoreQuery } = useSearchStore();

    useEffect(() => {
        setQuery(inputValue);
    }, [inputValue, setQuery]);

    const handleSearch = (searchQuery: string) => {
        setStoreQuery(searchQuery);
        setIsOpen(false);
        if (onSearch) {
            onSearch(searchQuery);
        } else {
            navigate(`/ search ? q = ${encodeURIComponent(searchQuery)} `);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(inputValue);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'professional': return <PersonIcon fontSize="small" />;
            case 'pose': return <PoseIcon fontSize="small" />;
            case 'job': return <JobIcon fontSize="small" />;
            default: return <SearchIcon fontSize="small" />;
        }
    };

    return (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
            <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto', minWidth: fullWidth ? 'auto' : 300 }}>
                <Paper
                    elevation={isOpen ? 3 : 1}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: isOpen ? '20px 20px 0 0' : 20,
                        borderBottomLeftRadius: isOpen ? 0 : 20,
                        borderBottomRightRadius: isOpen ? 0 : 20,
                        transition: 'all 0.2s',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <IconButton sx={{ p: '10px' }} aria-label="search" onClick={() => handleSearch(inputValue)}>
                        <SearchIcon />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search professionals, poses, or jobs..."
                        inputProps={{ 'aria-label': 'search' }}
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        inputRef={inputRef}
                    />
                    {inputValue && (
                        <IconButton
                            sx={{ p: '10px' }}
                            aria-label="clear"
                            onClick={() => {
                                setInputValue('');
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                        >
                            <ClearIcon />
                        </IconButton>
                    )}
                </Paper>

                {isOpen && (inputValue || suggestions.length > 0) && (
                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 1000,
                            borderRadius: '0 0 20px 20px',
                            borderTop: 'none',
                            maxHeight: 400,
                            overflow: 'auto',
                        }}
                    >
                        <List dense sx={{ py: 0 }}>
                            {loading ? (
                                <ListItem>
                                    <ListItemIcon><CircularProgress size={20} /></ListItemIcon>
                                    <ListItemText primary="Loading suggestions..." />
                                </ListItem>
                            ) : suggestions.length > 0 ? (
                                suggestions.map((suggestion, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            button
                                            onClick={() => {
                                                setInputValue(suggestion.suggestion);
                                                handleSearch(suggestion.suggestion);
                                            }}
                                        >
                                            <ListItemIcon>
                                                {getIcon(suggestion.type)}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={suggestion.suggestion}
                                                secondary={suggestion.type !== 'professional_type' && suggestion.type !== 'specialization' ? suggestion.type : null}
                                            />
                                        </ListItem>
                                        {index < suggestions.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))
                            ) : inputValue.length >= 2 ? (
                                <ListItem>
                                    <ListItemText primary={`Search for "${inputValue}"`} />
                                </ListItem>
                            ) : null}
                        </List>
                    </Paper>
                )}
            </Box>
        </ClickAwayListener>
    );
};
