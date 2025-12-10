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
    'Columbus': { lat: 39.9612, lon: -82.9988, country: 'USA' }
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

  // Filter staff data
  const filteredStaff = staffTalentData.filter(staff => {
    const countryMatch = selectedCountry === 'all' || staff.country === selectedCountry;
    const roleMatch = selectedRole === 'all' || staff.interestArea === selectedRole;
    return countryMatch && roleMatch;
  });

  const locations = aggregateStaffByLocation(filteredStaff);

  // Get statistics
  const stats = {
    totalStaff: filteredStaff.length,
    totalLocations: locations.length,
    countries: [...new Set(filteredStaff.map(s => s.country))].length,
    topLocation: locations.sort((a, b) => b.count - a.count)[0]
  };

  // Get unique countries and roles for filters
  const countries = ['all', ...new Set(staffTalentData.map(s => s.country))].sort();
  const roles = ['all', ...new Set(staffTalentData.map(s => s.interestArea).filter(Boolean))].sort();

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

    // Color scale based on count
    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(locations, d => d.count)])
      .interpolator(d3.interpolateRgb('var(--color-chart-2)', 'var(--color-primary)'));

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
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

  }, [locations, dimensions]);

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography 
            variant="h4" 
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
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid var(--color-border-primary)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'var(--color-chart-2)', width: 48, height: 48 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {stats.totalStaff}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Staff
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid var(--color-border-primary)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'var(--color-chart-3)', width: 48, height: 48 }}>
                  <LocationOn />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {stats.totalLocations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Locations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid var(--color-border-primary)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'var(--color-chart-4)', width: 48, height: 48 }}>
                  <Public />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {stats.countries}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Countries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: '1px solid var(--color-border-primary)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'var(--color-primary)', width: 48, height: 48 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {stats.topLocation?.city || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Top Location
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
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
