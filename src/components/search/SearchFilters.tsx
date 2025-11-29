import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Button,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import { FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useSearchStore } from '../../store/searchStore';

interface SearchFiltersProps {
    type: 'professional' | 'pose' | 'job';
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ type }) => {
    const { filters, setFilters, clearFilters } = useSearchStore();

    const handlePriceChange = (_: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setFilters({ minPrice: newValue[0], maxPrice: newValue[1] });
        }
    };

    const handleRadiusChange = (_: Event, newValue: number | number[]) => {
        setFilters({ radius: newValue as number });
    };

    const handleExperienceChange = (_: Event, newValue: number | number[]) => {
        if (Array.isArray(newValue)) {
            setFilters({ minExperience: newValue[0], maxExperience: newValue[1] });
        }
    };

    const activeFilterCount = [
        filters.category,
        filters.minPrice,
        filters.verified,
        filters.rating,
        filters.difficulty
    ].filter(Boolean).length;

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon color="action" />
                    <Typography variant="h6">Filters</Typography>
                    {activeFilterCount > 0 && (
                        <Chip label={activeFilterCount} size="small" color="primary" />
                    )}
                </Box>
                <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    disabled={activeFilterCount === 0}
                >
                    Clear
                </Button>
            </Box>

            <Stack spacing={3}>
                {/* Common Filters */}
                {type === 'professional' && (
                    <>
                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filters.category || ''}
                                label="Category"
                                onChange={(e) => setFilters({ category: e.target.value })}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="photographer">Photographer</MenuItem>
                                <MenuItem value="videographer">Videographer</MenuItem>
                                <MenuItem value="editor">Editor</MenuItem>
                                <MenuItem value="model">Model</MenuItem>
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography gutterBottom variant="body2">Price Range (₹/hr)</Typography>
                            <Slider
                                value={[filters.minPrice || 0, filters.maxPrice || 10000]}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={10000}
                                step={500}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption">₹{filters.minPrice || 0}</Typography>
                                <Typography variant="caption">₹{filters.maxPrice || 10000}+</Typography>
                            </Box>
                        </Box>

                        <Box>
                            <Typography gutterBottom variant="body2">Experience (Years)</Typography>
                            <Slider
                                value={[filters.minExperience || 0, filters.maxExperience || 20]}
                                onChange={handleExperienceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={20}
                            />
                        </Box>

                        <Box>
                            <Typography gutterBottom variant="body2">Distance (km)</Typography>
                            <Slider
                                value={filters.radius || 50}
                                onChange={handleRadiusChange}
                                valueLabelDisplay="auto"
                                min={1}
                                max={100}
                            />
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={filters.verified || false}
                                    onChange={(e) => setFilters({ verified: e.target.checked })}
                                />
                            }
                            label="Verified Professionals Only"
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel>Minimum Rating</InputLabel>
                            <Select
                                value={filters.rating || ''}
                                label="Minimum Rating"
                                onChange={(e) => setFilters({ rating: Number(e.target.value) })}
                            >
                                <MenuItem value="">Any</MenuItem>
                                <MenuItem value={4}>4+ Stars</MenuItem>
                                <MenuItem value={4.5}>4.5+ Stars</MenuItem>
                            </Select>
                        </FormControl>
                    </>
                )}

                {type === 'pose' && (
                    <>
                        <FormControl fullWidth size="small">
                            <InputLabel>Difficulty</InputLabel>
                            <Select
                                value={filters.difficulty || ''}
                                label="Difficulty"
                                onChange={(e) => setFilters({ difficulty: e.target.value })}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="beginner">Beginner</MenuItem>
                                <MenuItem value="intermediate">Intermediate</MenuItem>
                                <MenuItem value="advanced">Advanced</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={filters.category || ''}
                                label="Category"
                                onChange={(e) => setFilters({ category: e.target.value })}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="portrait">Portrait</MenuItem>
                                <MenuItem value="couple">Couple</MenuItem>
                                <MenuItem value="group">Group</MenuItem>
                                <MenuItem value="wedding">Wedding</MenuItem>
                                <MenuItem value="fashion">Fashion</MenuItem>
                            </Select>
                        </FormControl>
                    </>
                )}
            </Stack>
        </Paper>
    );
};
