import React, { useEffect, useRef, useState } from 'react';
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
  InputLabel
} from '@mui/material';
import { 
  LocationOn, 
  People, 
  Public, 
  TrendingUp 
} from '@mui/icons-material';
import * as d3 from 'd3';
import * as d3Geo from 'd3-geo';
import staffTalentData from '../data/staff_talent.json';
import worldGeoJson from '../data/world_map.json';
import '../styles/design-tokens.css';

/**
 * Staff Map Dashboard Component
 * Displays a comprehensive dashboard with a map showcasing staff locations
 */
function StaffMapDashboard() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 500 });

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
  const filteredStaff = staffTalentData.filter(staff => {
    const countryMatch = selectedCountry === 'all' || staff.country === selectedCountry;
    const roleMatch = selectedRole === 'all' || staff.interestArea === selectedRole;
    return countryMatch && roleMatch;
  });

  const locations = aggregateStaffByLocation(filteredStaff);

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
    
    if (locations.length === 0) {
      console.log('No locations found');
      return;
    }

    console.log('Rendering map with', locations.length, 'locations');
    console.log('Dimensions:', dimensions);

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const { width, height } = dimensions;

    const svg = d3.select(svgRef.current)
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
    const g = svg.append('g');

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

    // Add zoom behavior with proper constraints
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10]) // Allow zooming out to 0.5x and in to 10x
      .translateExtent([[-width * 0.5, -height * 0.5], [width * 1.5, height * 1.5]]) // Limit panning
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    
    // Add double-click to reset zoom
    svg.on('dblclick.zoom', () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });

  }, [locations, dimensions]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
            Staff Location Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Geographic distribution and insights
          </Typography>
        </Box>

        {/* Filters */}
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
      </Box>

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
        {locations.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 500 }}>
            <Typography color="text.secondary">No location data available</Typography>
          </Box>
        )}
        <svg 
          ref={svgRef} 
          style={{ 
            width: '100%', 
            height: '500px',
            display: locations.length > 0 ? 'block' : 'none'
          }}
        />

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
  );
}

export default StaffMapDashboard;
