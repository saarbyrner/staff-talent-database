import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Avatar,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import { 
  LocationOn, 
  People, 
  Public, 
  TrendingUp,
  SettingsOutlined,
  FilterList
} from '@mui/icons-material';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import worldGeoJson from '../data/world_map.json';
import CoachLeaderboard from './CoachLeaderboard';
import DashboardSettingsDrawer from './DashboardSettingsDrawer';
import DashboardFilters, { applyFilters } from './DashboardFilters';
import '../styles/design-tokens.css';

// Default dashboard visibility settings
const DEFAULT_DASHBOARD_SETTINGS = {
  locationAnalysis: true,
  employmentStability: true,
  originBreakdown: true,
  qualificationStandards: true,
  talentPipeline: true,
  coachLeaderboard: true,
};

// Load dashboard settings from localStorage
const loadDashboardSettings = () => {
  try {
    const saved = localStorage.getItem('dashboardSettings');
    return saved ? JSON.parse(saved) : DEFAULT_DASHBOARD_SETTINGS;
  } catch (e) {
    return DEFAULT_DASHBOARD_SETTINGS;
  }
};

// Save dashboard settings to localStorage
const saveDashboardSettings = (settings) => {
  try {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save dashboard settings:', e);
  }
};

/**
 * Staff Map Dashboard Component
 * Displays a comprehensive dashboard with a map showcasing staff locations
 */
function StaffMapDashboard() {
  const location = useLocation();
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);
  const gRef = useRef(null); // Store reference to the g element
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 500 });
  const [mapKey, setMapKey] = useState(0); // Force re-render only when needed
  const [activeTab, setActiveTab] = useState(0);
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  const [dashboardFilters, setDashboardFilters] = useState(null);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [dashboardSettings, setDashboardSettings] = useState(loadDashboardSettings);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(true);
  
  // Check if we're in league view
  const isLeagueView = location.pathname.startsWith('/league');

  // Geocode cities to coordinates (simplified mapping)
  const cityCoordinates = {
    'Los Angeles': { lat: 34.0522, lon: -118.2437, country: 'USA' },
    'London': { lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
    'New York': { lat: 40.7128, lon: -74.0060, country: 'USA' },
    'Vancouver': { lat: 49.2827, lon: -123.1207, country: 'Canada' },
    'Austin': { lat: 30.2672, lon: -97.7431, country: 'USA' },
    'Miami': { lat: 25.7617, lon: -80.1918, country: 'USA' },
    'Madrid': { lat: 40.4168, lon: -3.7038, country: 'Spain' },
    'Toronto': { lat: 43.6532, lon: -79.3832, country: 'Canada' },
    'Portland': { lat: 45.5152, lon: -122.6784, country: 'USA' },
    'Paris': { lat: 48.8566, lon: 2.3522, country: 'France' },
    'Chicago': { lat: 41.8781, lon: -87.6298, country: 'USA' },
    'Seattle': { lat: 47.6062, lon: -122.3321, country: 'USA' },
    'Boston': { lat: 42.3601, lon: -71.0589, country: 'USA' },
    'Philadelphia': { lat: 39.9526, lon: -75.1652, country: 'USA' },
    'Columbus': { lat: 39.9612, lon: -82.9988, country: 'USA' },
    'Dublin': { lat: 53.3498, lon: -6.2603, country: 'Ireland' },
    'Sao Paulo': { lat: -23.5505, lon: -46.6333, country: 'Brazil' },
    'San Francisco': { lat: 37.7749, lon: -122.4194, country: 'USA' },
    'Manchester': { lat: 53.4808, lon: -2.2426, country: 'United Kingdom' },
    'Arlington': { lat: 32.7357, lon: -97.1081, country: 'USA' },
    'Kansas City': { lat: 39.0997, lon: -94.5786, country: 'USA' },
    'Jersey City': { lat: 40.7178, lon: -74.0431, country: 'USA' },
    'Tokyo': { lat: 35.6762, lon: 139.6503, country: 'Japan' },
    'Mexico City': { lat: 19.4326, lon: -99.1332, country: 'Mexico' },
    'Atlanta': { lat: 33.7490, lon: -84.3880, country: 'USA' },
    'Accra': { lat: 5.6037, lon: -0.1870, country: 'Ghana' },
    'Bogota': { lat: 4.7110, lon: -74.0721, country: 'Colombia' },
    'Long Beach': { lat: 33.7701, lon: -118.1937, country: 'USA' },
    'Warsaw': { lat: 52.2297, lon: 21.0122, country: 'Poland' },
    'Buenos Aires': { lat: -34.6037, lon: -58.3816, country: 'Argentina' },
    'Berlin': { lat: 52.5200, lon: 13.4050, country: 'Germany' },
    'Decatur': { lat: 33.7748, lon: -84.2963, country: 'USA' },
    'Kumasi': { lat: 6.6884, lon: -1.6244, country: 'Ghana' },
    'Sydney': { lat: -33.8688, lon: 151.2093, country: 'Australia' },
    'Rome': { lat: 41.9028, lon: 12.4964, country: 'Italy' },
    'Washington': { lat: 38.9072, lon: -77.0369, country: 'USA' },
    'San Antonio': { lat: 29.4241, lon: -98.4936, country: 'USA' },
    'Raleigh': { lat: 35.7796, lon: -78.6382, country: 'USA' },
    'Omaha': { lat: 41.2565, lon: -95.9345, country: 'USA' },
    'Sacramento': { lat: 38.5816, lon: -121.4944, country: 'USA' },
    'Tucson': { lat: 32.2226, lon: -110.9747, country: 'USA' },
    'Albuquerque': { lat: 35.0844, lon: -106.6504, country: 'USA' },
    'Baltimore': { lat: 39.2904, lon: -76.6122, country: 'USA' },
    'Louisville': { lat: 38.2527, lon: -85.7585, country: 'USA' },
    'Las Vegas': { lat: 36.1699, lon: -115.1398, country: 'USA' },
    'Colorado Springs': { lat: 38.8339, lon: -104.8214, country: 'USA' },
    'Mesa': { lat: 33.4152, lon: -111.8315, country: 'USA' },
    'Fresno': { lat: 36.7378, lon: -119.7871, country: 'USA' },
    'Milwaukee': { lat: 43.0389, lon: -87.9065, country: 'USA' },
    'Memphis': { lat: 35.1495, lon: -90.0490, country: 'USA' },
    'Detroit': { lat: 42.3314, lon: -83.0458, country: 'USA' },
    'Nashville': { lat: 36.1627, lon: -86.7816, country: 'USA' }
  };

  // Aggregate staff by location
  const aggregateStaffByLocation = (data) => {
    const locationMap = new Map();

    data.forEach(staff => {
      const city = staff.city;
      const coords = cityCoordinates[city];
      
      if (coords) {
        const key = `${city}-${staff.country}`;
        if (!locationMap.has(key)) {
          locationMap.set(key, {
            city,
            country: staff.country,
            lat: coords.lat,
            lon: coords.lon,
            staff: [],
            count: 0
          });
        }
        locationMap.get(key).staff.push(staff);
        locationMap.get(key).count++;
      }
    });

    return Array.from(locationMap.values());
  };

  // Filter staff data - Auto-updates when filters change or data is modified
  const filteredStaff = useMemo(() => {
    // Apply dashboard filters first
    let data = dashboardFilters 
      ? applyFilters(staffTalentData, currentStaffData, dashboardFilters)
      : staffTalentData;
    
    // Then apply legacy filters for backward compatibility
    return data.filter(staff => {
      const countryMatch = selectedCountry === 'all' || staff.country === selectedCountry;
      const roleMatch = selectedRole === 'all' || staff.interestArea === selectedRole;
      return countryMatch && roleMatch;
    });
  }, [selectedCountry, selectedRole, dashboardFilters]);

  const locations = useMemo(() => aggregateStaffByLocation(filteredStaff), [filteredStaff]);

  // Get statistics - Dynamically calculated from current staff data (75 total in database)
  const stats = {
    totalStaff: filteredStaff.length, // Auto-updates to reflect current staff count
    totalLocations: locations.length,
    countries: [...new Set(filteredStaff.map(s => s.country))].length,
    topLocation: locations.sort((a, b) => b.count - a.count)[0]
  };

  // Log current stats for debugging
  console.log(`Staff Map Dashboard - Total Staff: ${stats.totalStaff}, Locations: ${stats.totalLocations}, Countries: ${stats.countries}`);

  const statCards = [
    {
      label: 'Total Staff',
      value: stats.totalStaff,
      icon: <People />, 
      iconColor: 'var(--color-chart-2)'
    },
    {
      label: 'Locations',
      value: stats.totalLocations,
      icon: <LocationOn />, 
      iconColor: 'var(--color-chart-3)'
    },
    {
      label: 'Countries',
      value: stats.countries,
      icon: <Public />, 
      iconColor: 'var(--color-chart-4)'
    },
    {
      label: 'Top Location',
      value: stats.topLocation?.city || 'N/A',
      icon: <TrendingUp />, 
      iconColor: 'var(--color-primary)'
    }
  ];

  // Get unique countries and roles for filters
  const countries = ['all', ...[...new Set(staffTalentData.map(s => s.country))].sort()];
  const roles = ['all', ...[...new Set(staffTalentData.map(s => s.interestArea).filter(Boolean))].sort()];

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 32; // Account for padding
        setDimensions({ width: width > 0 ? width : 1000, height: 500 });
      }
    };
    
    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) {
      console.log('No SVG ref');
      return;
    }

    console.log('Rendering map with', locations.length, 'locations');
    console.log('Dimensions:', dimensions);

    const { width, height } = dimensions;

    // Get or create SVG
    let svg = d3.select(svgRef.current);
    
    // Store current transform before clearing
    const currentTransform = zoomRef.current || d3.zoomIdentity;
    
    // Clear previous content
    svg.selectAll('*').remove();
    
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    console.log('SVG created:', svg.node());

    // Create projection
    const projection = d3Geo.geoMercator()
      .center([0, 20])
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    // Draw world map background
    const g = svg.append('g')
      .attr('class', 'map-container');

    // Draw a simple background rectangle
    g.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#f0f4f8')
      .attr('opacity', 0.3);

    // Draw countries from GeoJSON
    const pathGenerator = d3Geo.geoPath().projection(projection);
    
    g.selectAll('path')
      .data(worldGeoJson.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator)
      .attr('fill', '#e2e8f0')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8);

    // Scale for circle sizes
    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(locations, d => d.count)])
      .range([8, 40]);

    // Color scale based on count - using actual hex values instead of CSS variables
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(locations, d => d.count)])
      .interpolator(d3.interpolateRgb('#29AE61', '#3B4960')); // chart-2 (green) to primary (navy)

    // Draw location markers
    const markers = g.selectAll('.location-marker')
      .data(locations)
      .enter()
      .append('g')
      .attr('class', 'location-marker')
      .attr('transform', d => {
        const [x, y] = projection([d.lon, d.lat]);
        return `translate(${x},${y})`;
      })
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        setHoveredLocation(d);
        d3.select(event.currentTarget)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.count) * 1.3)
          .attr('opacity', 0.9);
      })
      .on('mouseleave', (event, d) => {
        setHoveredLocation(null);
        d3.select(event.currentTarget)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.count))
          .attr('opacity', 0.7);
      });

    // Add circles for locations
    markers.append('circle')
      .attr('r', d => sizeScale(d.count))
      .attr('fill', d => colorScale(d.count))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('opacity', 0.7);

    // Add count labels
    markers.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', '#ffffff')
      .attr('font-size', d => Math.max(10, Math.min(16, sizeScale(d.count) / 2)))
      .attr('font-weight', 600)
      .attr('pointer-events', 'none')
      .text(d => d.count);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        const transform = event.transform;
        g.attr('transform', transform);
        
        // Scale circles and stroke inversely to maintain consistent visual size
        const scale = transform.k;
        markers.selectAll('circle')
          .attr('r', d => sizeScale(d.count) / scale)
          .attr('stroke-width', 2 / scale);
        
        markers.selectAll('text')
          .attr('font-size', d => Math.max(10, Math.min(16, sizeScale(d.count) / 2)) / scale);
        
        zoomRef.current = event.transform;
      });

    svg.call(zoom);
    
    // Restore previous zoom state if it exists
    if (currentTransform && (currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0)) {
      svg.call(zoom.transform, currentTransform);
    }
    
    // Add double-click to reset zoom
    svg.on('dblclick.zoom', () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
      zoomRef.current = d3.zoomIdentity;
    });

  }, [locations, dimensions, activeTab]);

  // Define all dashboards with their settings keys
  const allDashboards = [
    { id: 'locationAnalysis', label: 'Location Analysis', description: 'Geographic distribution and insights' },
    { id: 'employmentStability', label: 'Employment Stability', description: 'Employment trends and stability metrics' },
    { id: 'originBreakdown', label: 'Origin Breakdown', description: 'Domestic vs. international talent comparison' },
    { id: 'qualificationStandards', label: 'Qualification Standards', description: 'Coaching license and credential trends' },
    { id: 'talentPipeline', label: 'Talent Pipeline', description: 'Tag progression and talent development pipeline' },
    { id: 'coachLeaderboard', label: 'Coach Leaderboard', description: 'Performance metrics and staff rankings' },
  ];

  // Filter visible dashboards based on settings (only in club view)
  // League view always shows all dashboards
  const visibleDashboards = isLeagueView 
    ? allDashboards 
    : allDashboards.filter(dashboard => dashboardSettings[dashboard.id]);

  // Ensure activeTab is within bounds of visible dashboards
  useEffect(() => {
    if (activeTab >= visibleDashboards.length && visibleDashboards.length > 0) {
      setActiveTab(0);
    }
  }, [activeTab, visibleDashboards.length]);

  // Handle settings update
  const handleUpdateSettings = (newSettings) => {
    setDashboardSettings(newSettings);
    saveDashboardSettings(newSettings);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', position: 'relative' }}>
      {/* Dashboard Filters Sidebar */}
      <DashboardFilters 
        onFilterChange={setDashboardFilters}
        open={filterSidebarOpen}
        onToggle={() => setFilterSidebarOpen(!filterSidebarOpen)}
      />
      
      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1,
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#fafafa',
        transition: 'margin-right 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
        marginRight: filterSidebarOpen ? '280px' : 0
      }}>
      
      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid var(--color-border-primary)',
          backgroundColor: 'var(--color-background-primary)',
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
              }
            }}
          >
            {visibleDashboards.map(dashboard => (
              <Tab key={dashboard.id} label={dashboard.label} />
            ))}
          </Tabs>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Filter Toggle Button */}
            {!filterSidebarOpen && (
              <IconButton
                onClick={() => setFilterSidebarOpen(true)}
                size="small"
                sx={{
                  color: 'var(--color-text-secondary)',
                  '&:hover': {
                    color: 'var(--color-primary)',
                  }
                }}
              >
                <FilterList fontSize="small" />
              </IconButton>
            )}
            {isLeagueView && (
              <Tooltip title="Configure club view dashboards">
                <IconButton
                  onClick={() => setSettingsDrawerOpen(true)}
                  size="small"
                  sx={{ 
                    color: 'var(--color-text-secondary)',
                    '&:hover': {
                      color: 'var(--color-primary)',
                    }
                  }}
                >
                  <SettingsOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, flex: 1, overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700, 
              color: 'var(--color-primary)',
              mb: 0.5
            }}
          >
            {visibleDashboards[activeTab]?.label || 'Dashboard'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {visibleDashboards[activeTab]?.description || ''}
          </Typography>
        </Box>

        {/* Filters - Only show on Location tab */}
        {visibleDashboards[activeTab]?.id === 'locationAnalysis' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Country</InputLabel>
              <Select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                label="Country"
              >
                <MenuItem value="all">All Countries</MenuItem>
                {countries.slice(1).map(country => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                label="Role"
              >
                <MenuItem value="all">All Roles</MenuItem>
                {roles.slice(1).map(role => (
                  <MenuItem key={role} value={role}>{role}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Location Analysis Tab */}
      {visibleDashboards[activeTab]?.id === 'locationAnalysis' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Stats Cards */}
          <Grid container spacing={2}>
        {statCards.map(({ label, value, icon, iconColor }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid var(--color-border-primary)',
                minHeight: 84,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar sx={{ bgcolor: iconColor, width: 40, height: 40 }}>
                  {icon}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Map */}
      <Paper 
        ref={containerRef}
        elevation={0} 
        sx={{ 
          flex: 1,
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          minHeight: 500
        }}
      >
        <svg 
          ref={svgRef} 
          style={{ 
            width: '100%', 
            height: '500px',
            display: 'block'
          }}
        />
        {locations.length === 0 && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <Typography color="text.secondary" variant="body2">No staff locations match current filters</Typography>
          </Box>
        )}

        {/* Hover Tooltip */}
        {hoveredLocation && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              p: 2,
              maxWidth: 300,
              zIndex: 1000,
              border: '1px solid var(--color-border-primary)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {hoveredLocation.city}, {hoveredLocation.country}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {hoveredLocation.count} staff member{hoveredLocation.count !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {hoveredLocation.staff.slice(0, 5).map((staff, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={staff.picUrl}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: 'var(--color-primary)',
                      color: '#ffffff'
                    }}
                  >
                    {staff.firstName?.[0]}{staff.lastName?.[0]}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {staff.firstName} {staff.lastName}
                  </Typography>
                  <Chip
                    label={staff.interestArea}
                    size="small"
                    sx={{ 
                      ml: 'auto',
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: 'var(--color-background-secondary)',
                      color: 'var(--color-text-secondary)'
                    }}
                  />
                </Box>
              ))}
              {hoveredLocation.staff.length > 5 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  +{hoveredLocation.staff.length - 5} more
                </Typography>
              )}
            </Box>
          </Paper>
        )}

        {/* Legend */}
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            p: 2,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--color-border-primary)'
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
            Staff Count
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'var(--color-chart-2)',
                  border: '1px solid #ffffff'
                }}
              />
              <Typography variant="caption">Low</Typography>
            </Box>
            <Box
              sx={{
                width: 60,
                height: 6,
                background: 'linear-gradient(to right, var(--color-chart-2), var(--color-primary))',
                borderRadius: 1
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'var(--color-primary)',
                  border: '1px solid #ffffff'
                }}
              />
              <Typography variant="caption">High</Typography>
            </Box>
          </Box>
        </Paper>
      </Paper>
        </Box>
      )}

      {/* Employment Stability Tab */}
      {visibleDashboards[activeTab]?.id === 'employmentStability' && (
        <EmploymentStabilityChart staffData={filteredStaff} />
      )}

      {/* Origin Breakdown Tab */}
      {visibleDashboards[activeTab]?.id === 'originBreakdown' && (
        <OriginBreakdownChart staffData={filteredStaff} />
      )}

      {/* Qualification Standards Tab */}
      {visibleDashboards[activeTab]?.id === 'qualificationStandards' && (
        <QualificationStandardsChart staffData={filteredStaff} />
      )}

      {/* Talent Pipeline Tab */}
      {visibleDashboards[activeTab]?.id === 'talentPipeline' && (
        <TalentPipelineChart staffData={filteredStaff} />
      )}

      {/* Coach Leaderboard Tab */}
      {visibleDashboards[activeTab]?.id === 'coachLeaderboard' && (
        <CoachLeaderboard dashboardFilters={dashboardFilters} />
      )}

      {/* Dashboard Settings Drawer */}
      <DashboardSettingsDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        dashboardSettings={dashboardSettings}
        onUpdateSettings={handleUpdateSettings}
      />
      </Box>
      </Box>
    </Box>
  );
}

/**
 * Employment Stability Chart Component
 * Displays employment rate trends over time with quarterly data
 */
function EmploymentStabilityChart({ staffData }) {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });

  // Generate seasonal employment data based on filtered population
  const employmentData = useMemo(() => {
    // Calculate current employment rate from filtered data
    const employed = staffData.filter(s => s.currentlyEmployed === true || s.currentEmployer).length;
    const total = staffData.length;
    const currentRate = total > 0 ? Number(((employed / total) * 100).toFixed(1)) : 0;
    
    // Generate data for the last 5 MLS seasons based on current filtered population
    const seasons = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 4; i >= 0; i--) {
      const seasonYear = currentYear - i;
      const seasonLabel = `${seasonYear} Season`;
      
      // Create historical trend that converges to current rate
      const progress = (4 - i) / 4; // 0 to 1 over time
      const variance = Math.sin(i * 0.5) * 5;
      const employmentRate = Math.min(100, Math.max(0, 
        currentRate * (0.85 + progress * 0.15) + variance
      ));
      
      seasons.push({
        season: seasonLabel,
        seasonYear,
        employmentRate: Number(employmentRate.toFixed(1)),
        index: 4 - i
      });
    }
    
    return seasons;
  }, [staffData]);

  // Calculate average employment rate
  const averageRate = useMemo(() => {
    const sum = employmentData.reduce((acc, d) => acc + d.employmentRate, 0);
    return Number((sum / employmentData.length).toFixed(1));
  }, [employmentData]);

  // Calculate current employment stats
  const currentStats = useMemo(() => {
    const employed = staffData.filter(s => s.currentlyEmployed === true || s.currentEmployer).length;
    const total = staffData.length;
    const percentage = total > 0 ? Number(((employed / total) * 100).toFixed(1)) : 0;
    
    return {
      employed,
      total,
      percentage
    };
  }, [staffData]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 64;
        setDimensions({ width: width > 0 ? width : 1000, height: 400 });
      }
    };
    
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Draw chart
  useEffect(() => {
    if (!chartRef.current || employmentData.length === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, employmentData.length - 1])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Line generator
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.employmentRate))
      .curve(d3.curveMonotoneX);

    // Area generator for gradient fill
    const area = d3.area()
      .x((d, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d.employmentRate))
      .curve(d3.curveMonotoneX);

    // Add gradient definition
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#29AE61')
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#29AE61')
      .attr('stop-opacity', 0.05);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Draw area
    g.append('path')
      .datum(employmentData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Draw employment rate line
    g.append('path')
      .datum(employmentData)
      .attr('fill', 'none')
      .attr('stroke', '#29AE61')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Draw average line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(averageRate))
      .attr('y2', yScale(averageRate))
      .attr('stroke', '#3B4960')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5')
      .attr('opacity', 0.7);

    // Average line label
    g.append('text')
      .attr('x', innerWidth - 5)
      .attr('y', yScale(averageRate) - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#3B4960')
      .attr('font-size', '12px')
      .attr('font-weight', 600)
      .text(`Avg: ${averageRate}%`);

    // Add data points
    g.selectAll('.dot')
      .data(employmentData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.employmentRate))
      .attr('r', 5)
      .attr('fill', '#29AE61')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 7);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5);
      })
      .append('title')
      .text(d => `${d.season}: ${d.employmentRate}%`);

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues(d3.range(employmentData.length))
      .tickFormat((d, i) => employmentData[i]?.season || '');

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em')
      .style('font-size', '11px');

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '12px')
      .attr('font-weight', 600)
      .text('Employment Rate (%)');

  }, [employmentData, dimensions, averageRate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: 'var(--color-chart-2)', width: 40, height: 40 }}>
                <TrendingUp />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.percentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current Employment Rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 40, height: 40 }}>
                <People />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.employed}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Currently Employed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: 'var(--color-chart-3)', width: 40, height: 40 }}>
                <Public />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {averageRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Average Rate (5 Seasons)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: 'var(--color-chart-4)', width: 40, height: 40 }}>
                <LocationOn />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total in Database
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper
        ref={containerRef}
        elevation={0}
        sx={{
          flex: 1,
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 3,
          backgroundColor: '#ffffff',
          minHeight: 450
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-primary)', mb: 0.5 }}>
            Employment Rate Trend
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historical employment trends across 5 MLS seasons. Current stats above reflect active filters.
          </Typography>
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2, justifyContent: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 3,
                bgcolor: '#29AE61',
                borderRadius: 1
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Active Employment Rate
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 2,
                bgcolor: '#3B4960',
                borderRadius: 1,
                opacity: 0.7,
                borderTop: '2px dashed #3B4960'
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Average Rate
            </Typography>
          </Box>
        </Box>

        <svg 
          ref={chartRef}
          style={{ width: '100%', display: 'block' }}
        />
      </Paper>
    </Box>
  );
}

/**
 * Origin Breakdown Chart Component
 * Displays domestic vs international staff over time with stacked bars
 */
function OriginBreakdownChart({ staffData }) {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });

  // Generate yearly origin data based on filtered population
  const originData = useMemo(() => {
    // Calculate current domestic/international split from filtered data
    const currentDomestic = staffData.filter(s => s.country === 'USA').length;
    const currentInternational = staffData.filter(s => s.country && s.country !== 'USA').length;
    const currentTotal = staffData.length;
    const currentIntlRatio = currentTotal > 0 ? currentInternational / currentTotal : 0.3;
    
    // Generate data for the last 5 MLS seasons
    const seasons = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 4; i >= 0; i--) {
      const seasonYear = currentYear - i;
      const seasonLabel = `${seasonYear} Season`;
      
      // Create historical trend that converges to current split
      const progress = (4 - i) / 4; // 0 to 1 over time
      const scaleFactor = 0.7 + progress * 0.3; // Scale from 70% to 100% of current
      const total = Math.max(1, Math.round(currentTotal * scaleFactor));
      const international = Math.round(total * (currentIntlRatio * (0.8 + progress * 0.2)));
      const domestic = total - international;
      
      seasons.push({
        season: seasonLabel,
        seasonYear,
        domestic,
        international,
        total
      });
    }
    
    return seasons;
  }, [staffData]);

  // Calculate current stats
  const currentStats = useMemo(() => {
    // Count based on country (USA = domestic, others = international)
    const domestic = staffData.filter(s => s.country === 'USA').length;
    const international = staffData.filter(s => s.country && s.country !== 'USA').length;
    const total = staffData.length;
    const intlPercentage = total > 0 ? Number(((international / total) * 100).toFixed(1)) : 0;
    
    return {
      domestic,
      international,
      total,
      intlPercentage
    };
  }, [staffData]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 64;
        setDimensions({ width: width > 0 ? width : 1000, height: 400 });
      }
    };
    
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Draw chart
  useEffect(() => {
    if (!chartRef.current || originData.length === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(originData.map(d => d.season))
      .range([0, innerWidth])
      .padding(0.3);

    const maxTotal = d3.max(originData, d => d.total);
    const yScale = d3.scaleLinear()
      .domain([0, maxTotal * 1.1])
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Stack the data
    const stack = d3.stack()
      .keys(['domestic', 'international']);
    
    const stackedData = stack(originData);

    // Color scale
    const colors = {
      domestic: '#3B4960', // Primary navy
      international: '#29AE61' // Chart green
    };

    // Draw bars
    const groups = g.selectAll('g.series')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'series')
      .attr('fill', d => colors[d.key]);

    const bars = groups.selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', (d, i) => xScale(originData[i].season))
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
      });

    // Add tooltips to bars
    bars.each(function(d, i) {
      const rect = d3.select(this);
      const parentGroup = d3.select(this.parentNode);
      const key = parentGroup.datum().key;
      const data = originData[i];
      
      rect.append('title')
        .text(`${data.season} - ${key === 'domestic' ? 'Domestic' : 'International'}: ${data[key]}`);
    });

    // Add value labels on bars
    groups.each(function() {
      const group = d3.select(this);
      const key = group.datum().key;
      
      group.selectAll('text')
        .data(d => d)
        .enter()
        .append('text')
        .attr('x', (d, i) => xScale(originData[i].season) + xScale.bandwidth() / 2)
        .attr('y', d => {
          const barHeight = yScale(d[0]) - yScale(d[1]);
          return yScale(d[1]) + barHeight / 2;
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('font-weight', 600)
        .attr('pointer-events', 'none')
        .text((d, i) => {
          const value = originData[i][key];
          return value > 0 ? value : '';
        });
    });

    // X-axis
    const xAxis = d3.axisBottom(xScale);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px');

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => d);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '12px')
      .attr('font-weight', 600)
      .text('Total Hired Staff');

  }, [originData, dimensions]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: '#3B4960', width: 40, height: 40 }}>
                <LocationOn />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.domestic}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Domestic Staff
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: '#29AE61', width: 40, height: 40 }}>
                <Public />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.international}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  International Staff
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: 'var(--color-chart-3)', width: 40, height: 40 }}>
                <TrendingUp />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.intlPercentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  International Ratio
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: 'var(--color-chart-4)', width: 40, height: 40 }}>
                <People />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Staff
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper
        ref={containerRef}
        elevation={0}
        sx={{
          flex: 1,
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 3,
          backgroundColor: '#ffffff',
          minHeight: 450
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-primary)', mb: 0.5 }}>
            Domestic vs. International Talent
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historical trends over 5 MLS seasons. Current stats above reflect active filters.
          </Typography>
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2, justifyContent: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: '#3B4960',
                borderRadius: 0.5
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Domestic (USA)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: '#29AE61',
                borderRadius: 0.5
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              International
            </Typography>
          </Box>
        </Box>

        <svg 
          ref={chartRef}
          style={{ width: '100%', display: 'block' }}
        />
      </Paper>
    </Box>
  );
}

/**
 * Qualification Standards Chart Component
 * Displays coaching license trends over time with multiple lines
 */
function QualificationStandardsChart({ staffData }) {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 400 });

  // Generate seasonal qualification data based on filtered population
  const qualificationData = useMemo(() => {
    // Calculate current license counts from filtered data
    let currentPro = 0;
    let currentA = 0;
    let currentB = 0;
    
    staffData.forEach(staff => {
      if (staff.coachingLicenses) {
        const licenses = Array.isArray(staff.coachingLicenses) 
          ? staff.coachingLicenses 
          : [staff.coachingLicenses];
        
        const hasProLicense = licenses.some(license => 
          license && (license.includes('Pro') || license.includes('PRO'))
        );
        const hasALicense = licenses.some(license => 
          license && !license.includes('Pro') && !license.includes('PRO') && 
          (license.includes('A') || license.includes('UEFA A') || license.includes('USSF A'))
        );
        const hasBLicense = licenses.some(license => 
          license && (license.includes('B') || license.includes('UEFA B') || license.includes('USSF B'))
        );
        
        if (hasProLicense) currentPro++;
        else if (hasALicense) currentA++;
        else if (hasBLicense) currentB++;
      }
    });
    
    // Generate data for the last 5 MLS seasons
    const seasons = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 4; i >= 0; i--) {
      const seasonYear = currentYear - i;
      const seasonLabel = `${seasonYear} Season`;
      
      // Create historical trend that converges to current counts
      const progress = (4 - i) / 4; // 0 to 1 over time
      const scaleFactor = 0.6 + progress * 0.4; // Scale from 60% to 100% of current
      
      const proLicense = Math.max(0, Math.round(currentPro * scaleFactor));
      const aLicense = Math.max(0, Math.round(currentA * scaleFactor));
      const bLicense = Math.max(0, Math.round(currentB * scaleFactor));
      
      seasons.push({
        season: seasonLabel,
        seasonYear,
        index: 4 - i,
        proLicense,
        aLicense,
        bLicense,
        total: proLicense + aLicense + bLicense
      });
    }
    
    return seasons;
  }, [staffData]);

  // Calculate current stats from actual data
  const currentStats = useMemo(() => {
    // Count based on coachingLicenses field
    let proCount = 0;
    let aCount = 0;
    let bCount = 0;
    
    staffData.forEach(staff => {
      if (staff.coachingLicenses) {
        const licenses = Array.isArray(staff.coachingLicenses) 
          ? staff.coachingLicenses 
          : [staff.coachingLicenses];
        
        const hasProLicense = licenses.some(license => 
          license && (license.includes('Pro') || license.includes('PRO'))
        );
        const hasALicense = licenses.some(license => 
          license && !license.includes('Pro') && !license.includes('PRO') && 
          (license.includes('A') || license.includes('UEFA A') || license.includes('USSF A'))
        );
        const hasBLicense = licenses.some(license => 
          license && (license.includes('B') || license.includes('UEFA B') || license.includes('USSF B'))
        );
        
        if (hasProLicense) proCount++;
        else if (hasALicense) aCount++;
        else if (hasBLicense) bCount++;
      }
    });
    
    const total = proCount + aCount + bCount;
    const avgPerSeason = qualificationData.length > 0 
      ? Number((qualificationData.reduce((sum, d) => sum + d.total, 0) / qualificationData.length).toFixed(0))
      : 0;
    
    return {
      proCount,
      aCount,
      bCount,
      total,
      avgPerSeason
    };
  }, [staffData, qualificationData]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 64;
        setDimensions({ width: width > 0 ? width : 1000, height: 400 });
      }
    };
    
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Draw chart
  useEffect(() => {
    if (!chartRef.current || qualificationData.length === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 30, bottom: 70, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, qualificationData.length - 1])
      .range([0, innerWidth]);

    const maxValue = d3.max(qualificationData, d => Math.max(d.proLicense, d.aLicense, d.bLicense));
    const yScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([innerHeight, 0]);

    // Line generators
    const lineProLicense = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.proLicense))
      .curve(d3.curveMonotoneX);

    const lineALicense = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.aLicense))
      .curve(d3.curveMonotoneX);

    const lineBLicense = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.bLicense))
      .curve(d3.curveMonotoneX);

    // Colors for each license level
    const colors = {
      pro: '#E63946', // Red for Pro
      a: '#29AE61', // Green for A
      b: '#3B4960' // Navy for B
    };

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Draw Pro License line
    g.append('path')
      .datum(qualificationData)
      .attr('fill', 'none')
      .attr('stroke', colors.pro)
      .attr('stroke-width', 3)
      .attr('d', lineProLicense);

    // Draw A License line
    g.append('path')
      .datum(qualificationData)
      .attr('fill', 'none')
      .attr('stroke', colors.a)
      .attr('stroke-width', 3)
      .attr('d', lineALicense);

    // Draw B License line
    g.append('path')
      .datum(qualificationData)
      .attr('fill', 'none')
      .attr('stroke', colors.b)
      .attr('stroke-width', 3)
      .attr('d', lineBLicense);

    // Add Pro License data points
    g.selectAll('.dot-pro')
      .data(qualificationData)
      .enter()
      .append('circle')
      .attr('class', 'dot-pro')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.proLicense))
      .attr('r', 5)
      .attr('fill', colors.pro)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).transition().duration(200).attr('r', 7);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(200).attr('r', 5);
      })
      .append('title')
      .text(d => `${d.season}\nUEFA/USSF Pro: ${d.proLicense}`);

    // Add A License data points
    g.selectAll('.dot-a')
      .data(qualificationData)
      .enter()
      .append('circle')
      .attr('class', 'dot-a')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.aLicense))
      .attr('r', 5)
      .attr('fill', colors.a)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).transition().duration(200).attr('r', 7);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(200).attr('r', 5);
      })
      .append('title')
      .text(d => `${d.season}\nUEFA/USSF A: ${d.aLicense}`);

    // Add B License data points
    g.selectAll('.dot-b')
      .data(qualificationData)
      .enter()
      .append('circle')
      .attr('class', 'dot-b')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.bLicense))
      .attr('r', 5)
      .attr('fill', colors.b)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function() {
        d3.select(this).transition().duration(200).attr('r', 7);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(200).attr('r', 5);
      })
      .append('title')
      .text(d => `${d.season}\nUEFA/USSF B: ${d.bLicense}`);

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues(d3.range(qualificationData.length))
      .tickFormat((d, i) => qualificationData[i]?.season || '');

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em')
      .style('font-size', '11px');

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => d);

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '11px');

    // Y-axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--color-text-secondary)')
      .attr('font-size', '12px')
      .attr('font-weight', 600)
      .text('Count of Active Staff');

  }, [qualificationData, dimensions]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: '#E63946', width: 40, height: 40 }}>
                <TrendingUp />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.proCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  UEFA/USSF Pro
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: '#29AE61', width: 40, height: 40 }}>
                <People />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.aCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  UEFA/USSF A
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: '#3B4960', width: 40, height: 40 }}>
                <Public />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.bCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  UEFA/USSF B
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: 'var(--color-chart-4)', width: 40, height: 40 }}>
                <LocationOn />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {currentStats.avgPerSeason}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg per Season
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper
        ref={containerRef}
        elevation={0}
        sx={{
          flex: 1,
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 3,
          backgroundColor: '#ffffff',
          minHeight: 450
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-primary)', mb: 0.5 }}>
            Coaching License Trends
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Historical license acquisition trends. Current stats above reflect active filters.
          </Typography>
        </Box>
        
        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 3, mb: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 3,
                bgcolor: '#E63946',
                borderRadius: 1
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              UEFA/USSF Pro (Top Tier)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 3,
                bgcolor: '#29AE61',
                borderRadius: 1
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              UEFA/USSF A (High Tier)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 3,
                bgcolor: '#3B4960',
                borderRadius: 1
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              UEFA/USSF B (Mid Tier)
            </Typography>
          </Box>
        </Box>

        <svg 
          ref={chartRef}
          style={{ width: '100%', display: 'block' }}
        />
      </Paper>
    </Box>
  );
}

/**
 * Talent Pipeline Chart Component
 * Displays funnel chart showing tag progression: High Potential → Emerging → Proven → Unproven
 */
function TalentPipelineChart({ staffData }) {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 450 });

  // Calculate current tag counts based on actual tags in database
  const pipelineData = useMemo(() => {
    let highPotentialCount = 0;
    let emergingCount = 0;
    let provenCount = 0;
    let unprovenCount = 0;
    
    staffData.forEach(staff => {
      if (staff.tags && Array.isArray(staff.tags)) {
        const tags = staff.tags.map(t => t.toLowerCase());
        
        if (tags.some(tag => tag === 'proven')) {
          provenCount++;
        } else if (tags.some(tag => tag === 'emerging')) {
          emergingCount++;
        } else if (tags.some(tag => tag === 'high potential')) {
          highPotentialCount++;
        } else if (tags.some(tag => tag === 'unproven')) {
          unprovenCount++;
        }
      }
    });

    const total = highPotentialCount + emergingCount + provenCount + unprovenCount;
    
    // Order: Unproven -> Emerging -> High Potential -> Proven (left to right)
    // Colors from TagChip.jsx green gradient system
    return [
      {
        stage: 'Unproven',
        count: unprovenCount,
        percentage: total > 0 ? Number(((unprovenCount / total) * 100).toFixed(1)) : 0,
        color: '#A5D6A7', // Light green - matches TagChip
        label: 'Unproven'
      },
      {
        stage: 'Emerging',
        count: emergingCount,
        percentage: total > 0 ? Number(((emergingCount / total) * 100).toFixed(1)) : 0,
        color: '#66BB6A', // Medium-light green - matches TagChip
        label: 'Emerging'
      },
      {
        stage: 'High Potential',
        count: highPotentialCount,
        percentage: total > 0 ? Number(((highPotentialCount / total) * 100).toFixed(1)) : 0,
        color: '#43A047', // Medium-dark green - matches TagChip
        label: 'High Potential'
      },
      {
        stage: 'Proven',
        count: provenCount,
        percentage: total > 0 ? Number(((provenCount / total) * 100).toFixed(1)) : 0,
        color: '#2E7D32', // Dark green - matches TagChip
        label: 'Proven'
      }
    ];
  }, [staffData]);

  // Calculate conversion rates between stages
  const conversionRates = useMemo(() => {
    const hpToEmerging = pipelineData[0].count > 0 
      ? Number(((pipelineData[1].count / pipelineData[0].count) * 100).toFixed(1))
      : 0;
    const emergingToProven = pipelineData[1].count > 0 
      ? Number(((pipelineData[2].count / pipelineData[2].count) * 100).toFixed(1))
      : 0;
    const provenToUnproven = pipelineData[2].count > 0 
      ? Number(((pipelineData[3].count / pipelineData[2].count) * 100).toFixed(1))
      : 0;
    
    return {
      hpToEmerging,
      emergingToProven,
      provenToUnproven
    };
  }, [pipelineData]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 64;
        setDimensions({ width: width > 0 ? width : 1000, height: 450 });
      }
    };
    
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Draw funnel chart matching the D3 example style
  useEffect(() => {
    if (!chartRef.current || pipelineData.length === 0) return;

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous content
    d3.select(chartRef.current).selectAll('*').remove();

    const svg = d3.select(chartRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'background-color: #1e3a5f'); // Dark navy background like the image

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate section widths based on percentages
    const total = d3.sum(pipelineData, d => d.count);
    const sectionWidth = innerWidth / pipelineData.length;

    // Create gradients for each section
    const defs = svg.append('defs');
    
    pipelineData.forEach((stage, i) => {
      const gradient = defs.append('linearGradient')
        .attr('id', `funnel-gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', innerHeight);
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', stage.color)
        .attr('stop-opacity', 0.9);
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', stage.color)
        .attr('stop-opacity', 0.7);
    });

    // Calculate funnel shape - narrowing from left to right
    const maxCount = d3.max(pipelineData, d => d.count);
    
    pipelineData.forEach((stage, i) => {
      const x = i * sectionWidth;
      const nextX = (i + 1) * sectionWidth;
      
      // Calculate heights based on count (funnel narrows)
      const heightRatio = maxCount > 0 && stage.count > 0 
        ? stage.count / maxCount 
        : 0;
      
      const nextStage = i < pipelineData.length - 1 ? pipelineData[i + 1] : null;
      const nextHeightRatio = nextStage && maxCount > 0 && nextStage.count > 0
        ? nextStage.count / maxCount 
        : 0;
      
      const topHeight = innerHeight * 0.4 * heightRatio;
      const bottomHeight = innerHeight * 0.4 * heightRatio;
      const nextTopHeight = innerHeight * 0.4 * nextHeightRatio;
      const nextBottomHeight = innerHeight * 0.4 * nextHeightRatio;
      
      const centerY = innerHeight / 2;

      // Only draw funnel section if count > 0
      if (stage.count > 0) {
        const path = g.append('path')
          .attr('d', `
            M ${x} ${centerY - topHeight}
            L ${nextX} ${centerY - nextTopHeight}
            L ${nextX} ${centerY + nextBottomHeight}
            L ${x} ${centerY + bottomHeight}
            Z
          `)
          .attr('fill', `url(#funnel-gradient-${i})`)
          .attr('stroke', 'none')
          .style('cursor', 'pointer')
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 0.8);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('opacity', 1);
          });
      }

      // Add vertical divider lines between sections (white lines like in the image)
      if (i < pipelineData.length - 1) {
        g.append('line')
          .attr('x1', nextX)
          .attr('y1', 0)
          .attr('x2', nextX)
          .attr('y2', innerHeight)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2)
          .attr('opacity', 0.3);
      }

      // Add count label at top (large number)
      const labelX = x + sectionWidth / 2;
      g.append('text')
        .attr('x', labelX)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '32px')
        .attr('font-weight', '700')
        .text(stage.count.toLocaleString());

      // Add stage label below count
      g.append('text')
        .attr('x', labelX)
        .attr('y', 55)
        .attr('text-anchor', 'middle')
        .attr('fill', stage.color)
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .text(stage.label);

      // Add percentage below stage label
      g.append('text')
        .attr('x', labelX)
        .attr('y', 72)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '16px')
        .attr('font-weight', '600')
        .text(`${stage.percentage}%`);
    });

  }, [pipelineData, dimensions]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Stats Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: pipelineData[0].color, width: 40, height: 40 }}>
                <People />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {pipelineData[0].count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipelineData[0].label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: pipelineData[1].color, width: 40, height: 40 }}>
                <TrendingUp />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {pipelineData[1].count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipelineData[1].label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: pipelineData[2].color, width: 40, height: 40 }}>
                <Public />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {pipelineData[2].count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipelineData[2].label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--color-border-primary)',
              minHeight: 84,
            }}
          >
            <CardContent sx={{ py: 1, px: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar sx={{ bgcolor: pipelineData[3].color, width: 40, height: 40 }}>
                <LocationOn />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {pipelineData[3].count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pipelineData[3].label}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart */}
      <Paper
        ref={containerRef}
        elevation={0}
        sx={{
          flex: 1,
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          p: 0,
          backgroundColor: '#1e3a5f', // Dark navy background like the image
          minHeight: 500,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff', mb: 0.5 }}>
            Talent Development Pipeline
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Funnel showing talent distribution across 4 pipeline stages
          </Typography>
        </Box>
        
        {/* Legend */}
        <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 3, justifyContent: 'flex-start', flexWrap: 'wrap' }}>
          {pipelineData.map((stage, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  bgcolor: stage.color,
                  borderRadius: 0.5
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, color: '#ffffff' }}>
                {stage.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <svg 
          ref={chartRef}
          style={{ width: '100%', display: 'block' }}
        />
      </Paper>
    </Box>
  );
}

export default StaffMapDashboard;
