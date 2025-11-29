# Search System Integration Guide

This guide explains how to integrate the Search System components into the GetMyGrapher application.

## Overview

The Search System consists of:
- **Search Store**: Zustand store for managing search state (`searchStore.ts`).
- **Search Hooks**: Custom hooks for search functionality (`useSearch.ts`).
- **Search Components**: UI components for search bar, filters, and results.
- **Search Page**: The main page for searching professionals and poses.

## Components

### 1. SearchBar

The `SearchBar` component provides an autocomplete search input with suggestions.

```tsx
import { SearchBar } from './components/search/SearchBar';

// Usage
<SearchBar 
  initialQuery="photographer" 
  onSearch={(query) => console.log(query)} 
  fullWidth 
/>
```

### 2. SearchFilters

The `SearchFilters` component displays filters based on the search type (professional or pose).

```tsx
import { SearchFilters } from './components/search/SearchFilters';

// Usage
<SearchFilters type="professional" />
// or
<SearchFilters type="pose" />
```

### 3. ProfessionalSearchResults

The `ProfessionalSearchResults` component displays a grid of professional cards.

```tsx
import { ProfessionalSearchResults } from './components/search/ProfessionalSearchResults';

// Usage
<ProfessionalSearchResults 
  onViewProfile={(id) => navigate(`/profile/${id}`)}
  onSendMessage={(id) => openChat(id)}
/>
```

### 4. PoseSearchResults

The `PoseSearchResults` component displays a grid of pose cards.

```tsx
import { PoseSearchResults } from './components/search/PoseSearchResults';

// Usage
<PoseSearchResults />
```

### 5. SearchPage

The `SearchPage` component integrates all the above components into a full search page.

```tsx
import { SearchPage } from './pages/SearchPage';

// Usage in App.tsx routing
<Route 
  path="/search" 
  element={
    <SearchPage 
      onViewProfile={(id) => navigate(`/profile/${id}`)}
      onSendMessage={(id) => openChat(id)}
    />
  } 
/>
```

## State Management

The search state is managed globally by `useSearchStore`. You can access it anywhere:

```tsx
import { useSearchStore } from './store/searchStore';

const { query, filters, setQuery, setFilters } = useSearchStore();
```

## Database Requirements

Ensure the following SQL schemas and functions are deployed to Supabase:
- `search_schema.sql`: Adds search vectors and indexes.
- `search_functions.sql`: RPC functions for searching (`search_professionals`, `search_poses`, `get_search_suggestions`).

## Integration Steps

1.  **Deploy Database Changes**: Run the SQL scripts in Supabase.
2.  **Add Route**: Add the `/search` route to your `App.tsx` or router configuration.
3.  **Link to Search**: Add links to `/search` in your navigation menu or home page.
4.  **Handle Actions**: Implement `onViewProfile` and `onSendMessage` callbacks in `App.tsx` to handle navigation and messaging.
