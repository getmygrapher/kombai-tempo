import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Tabs,
    Tab,
    useMediaQuery,
    useTheme,
    Drawer,
    Fab,
    Alert
} from '@mui/material';
import MuiGrid from '@mui/material/Grid';
import { FilterList as FilterIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

const Grid = MuiGrid as any;
import { SearchBar } from '../components/search/SearchBar';
import { SearchFilters } from '../components/search/SearchFilters';
import { ProfessionalSearchResults } from '../components/search/ProfessionalSearchResults';
import { PoseSearchResults } from '../components/search/PoseSearchResults';
import { useSearchStore } from '../store/searchStore';
import { useSearchLocation } from '../hooks/useSearch';

interface SearchPageProps {
    onViewProfile?: (professionalId: string) => void;
    onSendMessage?: (professionalId: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onViewProfile, onSendMessage }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const initialTab = searchParams.get('type') === 'pose' ? 1 : 0;

    const [tabValue, setTabValue] = useState(initialTab);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { setQuery, clearFilters } = useSearchStore();
    const { detectLocation, location, error: locationError } = useSearchLocation();

    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
        }
        // Try to detect location on mount for better results
        if (!location) {
            detectLocation();
        }
    }, []);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSearchParams({
            q: initialQuery,
            type: newValue === 0 ? 'professional' : 'pose'
        });
        // Clear filters when switching tabs as they are different
        clearFilters();
    };

    const handleSearch = (query: string) => {
        setSearchParams({
            q: query,
            type: tabValue === 0 ? 'professional' : 'pose'
        });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
            {/* Header */}
            <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', pt: 2, pb: 0 }}>
                <Container maxWidth="xl">
                    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <Grid item xs={12} md={3}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                Explore
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <SearchBar
                                initialQuery={initialQuery}
                                onSearch={handleSearch}
                                fullWidth
                            />
                        </Grid>
                    </Grid>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab label="Find Professionals" />
                        <Tab label="Discover Poses" />
                    </Tabs>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 3 }}>
                {locationError && (
                    <Alert severity="warning" sx={{ mb: 2 }} onClose={() => { }}>
                        Could not detect location: {locationError}. Results may not be sorted by distance.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Filters - Desktop */}
                    {!isMobile && (
                        <Grid item md={3} lg={2.5}>
                            <Box sx={{ position: 'sticky', top: 24 }}>
                                <SearchFilters type={tabValue === 0 ? 'professional' : 'pose'} />
                            </Box>
                        </Grid>
                    )}

                    {/* Results */}
                    <Grid item xs={12} md={9} lg={9.5}>
                        {tabValue === 0 ? (
                            <ProfessionalSearchResults
                                onViewProfile={onViewProfile}
                                onSendMessage={onSendMessage}
                            />
                        ) : (
                            <PoseSearchResults />
                        )}
                    </Grid>
                </Grid>
            </Container>

            {/* Mobile Filters Fab */}
            {isMobile && (
                <>
                    <Fab
                        color="primary"
                        aria-label="filters"
                        sx={{ position: 'fixed', bottom: 16, right: 16 }}
                        onClick={() => setMobileFiltersOpen(true)}
                    >
                        <FilterIcon />
                    </Fab>
                    <Drawer
                        anchor="bottom"
                        open={mobileFiltersOpen}
                        onClose={() => setMobileFiltersOpen(false)}
                        PaperProps={{
                            sx: { height: '80vh', borderRadius: '20px 20px 0 0' }
                        }}
                    >
                        <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                            <SearchFilters type={tabValue === 0 ? 'professional' : 'pose'} />
                        </Box>
                    </Drawer>
                </>
            )}
        </Box>
    );
};
