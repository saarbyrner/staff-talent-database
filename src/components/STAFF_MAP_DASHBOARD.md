# Staff Map Dashboard

## Overview
The Staff Map Dashboard is an interactive geographic visualization component that displays the distribution of staff members across different locations using D3.js and MUI components.

## Location
- **Component**: `src/components/StaffMapDashboard.jsx`
- **Accessible from**: Staff Database page (navigate to `/staff` or `/league/staff` and click the "Analysis" tab)

## Features

### 1. **Interactive Map**
- Built with D3.js and d3-geo for geographic projections
- Circular markers represent staff locations
- Marker size scales with the number of staff at each location
- Color gradient from green (low) to dark blue (high) indicates staff concentration
- Hover over markers to see detailed information
- Zoom and pan capabilities for better exploration

### 2. **Statistics Cards**
Four key metrics displayed at the top:
- **Total Staff**: Number of staff members in the filtered dataset
- **Locations**: Number of unique cities with staff presence
- **Countries**: Number of countries represented
- **Top Location**: City with the highest staff concentration

### 3. **Filters**
- **Country Filter**: Filter staff by country (USA, Canada, UK, etc.)
- **Role Filter**: Filter by interest area (Coaching, Sporting Executive, etc.)
- Filters update the map and statistics in real-time

### 4. **Hover Tooltips**
When hovering over a location marker:
- Shows city and country name
- Displays total staff count
- Lists up to 5 staff members with their names and roles
- Indicates if there are additional staff members

### 5. **Legend**
Bottom-left legend shows:
- Color scale interpretation (low to high staff count)
- Visual reference for marker sizes

## Styling
The component uses:
- MUI (Material-UI) components for consistent UI elements
- Design tokens from `src/styles/design-tokens.css`
- Theme colors: `--color-primary`, `--color-chart-*` variables
- Responsive layout with Grid and Box components

## Data Source
- Staff data: `src/data/staff_talent.json`
- Location geocoding: Built-in city coordinate mapping
- Supported cities: Los Angeles, London, New York, Vancouver, Toronto, Miami, Austin, Portland, Chicago, Seattle, Boston, Philadelphia, Columbus, Madrid, Paris

## Technical Details
- **D3 Version**: Latest (installed via npm)
- **Projection**: Mercator projection centered on the world
- **Scale**: Responsive sizing based on container width
- **Interactivity**: D3 event handlers for hover and zoom

## Usage Example
```jsx
import StaffMapDashboard from '../components/StaffMapDashboard';

// In your page component:
<StaffMapDashboard />
```

## Future Enhancements
Potential improvements:
- Add more city coordinates for better coverage
- Implement clustering for overlapping locations
- Add export functionality for map data
- Include travel distance calculations
- Add heatmap overlay option
