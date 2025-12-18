# Dashboard Filters Documentation

## Overview
The Dashboard Filters component provides comprehensive filtering capabilities across all analysis dashboards in the Staff Talent Database. This component enables users to filter staff data by multiple criteria to perform targeted analysis.

## Features

### Filter Categories

#### 1. **Staff Type**
- **All**: Shows all staff members (both database talent and current staff)
- **My Staff**: Shows only current staff members from your organization
- **Database**: Shows only external database talent

#### 2. **Location**
- **All**: All locations
- **Domestic**: USA and Canada only
- **International**: All countries except USA and Canada

#### 3. **Watchlist Status**
- **All**: Shows all staff regardless of watchlist status
- **Watchlist**: Only shows staff members who are on watchlists
- **Not on Watchlist**: Shows staff not currently on any watchlist

#### 4. **Employment Status**
- **All**: All employment statuses
- **Currently Employed**: Staff members with active employment
- **Free Agent**: Staff members not currently employed

#### 5. **Tags**
Multi-select filter for staff tags (e.g., "Proven", "Emerging", "High Potential")

#### 6. **Roles**
Multi-select filter for coaching, executive, and technical roles

#### 7. **UEFA Badges**
Multi-select filter for UEFA coaching licenses and qualifications

#### 8. **Countries**
Multi-select filter for specific countries

#### 9. **Years of Experience**
Range filter with minimum and maximum years of coaching/professional experience

## Implementation

### Using the Component

```jsx
import DashboardFilters, { applyFilters } from '../components/DashboardFilters';

function MyDashboard() {
  const [dashboardFilters, setDashboardFilters] = useState(null);
  
  // Apply filters to your data
  const filteredData = useMemo(() => {
    return applyFilters(staffTalentData, currentStaffData, dashboardFilters);
  }, [dashboardFilters]);

  return (
    <Box>
      <DashboardFilters 
        onFilterChange={setDashboardFilters}
        defaultExpanded={false}
      />
      {/* Your dashboard content using filteredData */}
    </Box>
  );
}
```

### Helper Function

The `applyFilters` function takes three parameters:
- `staffData`: The external talent database array
- `currentStaffData`: Your organization's current staff array
- `filters`: The filter object from the DashboardFilters component

It returns a filtered array based on all active filter criteria.

## Where Filters Are Applied

The Dashboard Filters are currently integrated into:
1. **Staff Map Dashboard** - Filters all map visualizations and statistics
2. **Coach Leaderboard** - Filters the coach performance leaderboard
3. **Staff Leaderboard** - Filters the general staff leaderboard

## Filter State Management

Filters persist during the user's session but reset on page refresh. Each dashboard maintains its own filter state independently.

## UI/UX Features

- **Collapsible Design**: Filters are contained in an accordion that can be expanded/collapsed
- **Active Filter Badge**: Shows count of active filters when filters are applied
- **Reset Button**: Quickly clear all active filters with one click
- **Visual Feedback**: Active filters are clearly indicated with chips and badges
- **Responsive Layout**: Filters wrap appropriately on smaller screens

## Data Fields Used

The filter system reads from the following data fields:

### Staff Talent Data (staff_talent.json)
- `country`, `state`, `city`
- `tags`
- `coachingRoles`, `execRoles`, `techRoles`
- `coachingLicenses`
- `currentEmployer`
- `yearsExp` (calculated from employment history if not present)
- `watchlistCount`

### Current Staff Data (users_staff.json)
- `country`
- `role`
- `qualifications`
- `hire_date` (used for experience calculation)

## Future Enhancements

Potential additions to the filter system:
- Date range/season filters for employment history
- Salary range filters
- Availability date filters
- Contract status filters
- Performance metric ranges
- Custom tag creation and filtering
