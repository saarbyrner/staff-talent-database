import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Box, Paper, FormControl, InputLabel, Select, MenuItem, Button, ButtonGroup, Chip } from '@mui/material';
import * as d3 from 'd3';
import staffData from '../data/staff_talent.json';

/**
 * StaffTimelineView Component
 * Displays staff career progression over time with demographic comparisons
 */
const StaffTimelineView = () => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  // State for controls
  const [primaryDimension, setPrimaryDimension] = useState('tags'); // Y-axis grouping
  const [secondaryDimension, setSecondaryDimension] = useState('uefaBadges'); // State changes over time
  const [timeScale, setTimeScale] = useState('25y');
  
  // Available dimensions
  const dimensionOptions = [
    { value: 'tags', label: 'Tags' },
    { value: 'uefaBadges', label: 'UEFA Badges' },
    { value: 'country', label: 'Country' },
    { value: 'role', label: 'Role' },
    { value: 'trophies', label: 'Trophies' },
    { value: 'experience', label: 'Experience' }
  ];

  // Handle container resize (including when drawers open/close)
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setDimensions({
          width: containerWidth - 48,
          height: 600
        });
      }
    };

    handleResize();
    
    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', handleResize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate years in career for each staff member
  const calculateYearsInCareer = (person) => {
    // Use years of experience if available, otherwise estimate from age
    if (person.yearsOfExperience !== undefined) {
      return person.yearsOfExperience;
    }
    
    // Estimate based on age (assuming career starts at 22)
    if (person.age) {
      const years = Math.max(0, person.age - 22);
      return years;
    }

    // Fallback: random between 3-15 years for visualization
    return Math.floor(Math.random() * 13) + 3;
  };

  // List of valid staff roles from users_staff.json
  const validStaffRoles = [
    'Head Coach',
    'Assistant Coach',
    'Team Doctor',
    'Physiotherapist',
    'Strength & Conditioning Coach',
    'S&C Coach',
    'Sports Psychologist',
    'Sports Nutritionist',
    'Nutritionist',
    'Performance Analyst',
    'System Admin',
    'Reserve Team Coach'
  ];

  // Helper function to extract dimension value from person
  const getDimensionValue = (person, dimension) => {
    switch (dimension) {
      case 'tags':
        if (person.tags && person.tags.length > 0) {
          return person.tags[0];
        }
        return 'No Tags';

      case 'uefaBadges':
        if (person.coachingLicenses && person.coachingLicenses.length > 0) {
          const uefaLicense = person.coachingLicenses.find(l => l.toLowerCase().includes('uefa'));
          if (uefaLicense) return uefaLicense;
        }
        return 'No UEFA Badge';

      case 'country':
        return person.country || 'Unknown';

      case 'role': {
        // Try to get the role from the most likely fields
        let role = null;
        if (person.coachingRoles && person.coachingRoles.length > 0) {
          role = person.coachingRoles[0];
        } else if (person.execRoles && person.execRoles.length > 0) {
          role = person.execRoles[0];
        } else if (person.techRoles && person.techRoles.length > 0) {
          role = person.techRoles[0];
        } else if (person.role) {
          role = person.role;
        }
        // Only return the role if it is in the valid list
        if (role && validStaffRoles.includes(role)) {
          return role;
        }
        return 'No Role';
      }

      case 'trophies': {
        // Only show buckets if there are nonzero trophies in the data
        const trophyCount = person.trophies;
        if (typeof trophyCount !== 'number' || isNaN(trophyCount)) return '0 Trophies';
        if (trophyCount === 0) return '0 Trophies';
        if (trophyCount <= 2) return '1-2 Trophies';
        if (trophyCount <= 5) return '3-5 Trophies';
        return '6+ Trophies';
      }

      case 'experience': {
        const exp = person.yearsInCareer || 0;
        if (exp < 5) return '0-4 Years';
        if (exp < 10) return '5-9 Years';
        if (exp < 15) return '10-14 Years';
        return '15+ Years';
      }

      default:
        return 'Unknown';
    }
  };

  // Get max years based on time scale
  const getMaxYears = () => {
    switch (timeScale) {
      case '10y': return 10;
      case '15y': return 15;
      case '25y': return 25;
      case 'full': return 30;
      default: return 25;
    }
  };

  // Group staff by primary dimension
  const groupStaffByDemographic = useMemo(() => {
    const groups = {};
    staffData.forEach(person => {
      const groupKey = getDimensionValue(person, primaryDimension);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push({
        ...person,
        yearsInCareer: calculateYearsInCareer(person),
      });
    });
    return groups;
  }, [primaryDimension]);

  // Aggregate by (primary group, secondary value), show one circle at average years in career
  const aggregatedData = useMemo(() => {
    const result = [];
    const maxYears = getMaxYears();
    const groups = groupStaffByDemographic;
    Object.entries(groups).forEach(([group, people]) => {
      // Map: secondaryValue -> array of people
      const secMap = {};
      people.forEach(person => {
        const secValue = getDimensionValue(person, secondaryDimension);
        if (!secMap[secValue]) secMap[secValue] = [];
        // Only include if within maxYears
        const y = person.yearsInCareer;
        if (y <= maxYears) secMap[secValue].push(person);
      });
      Object.entries(secMap).forEach(([secValue, peopleArr]) => {
        if (peopleArr.length === 0) return;
        // Compute average years in career
        const avgYears = peopleArr.reduce((sum, p) => sum + (p.yearsInCareer || 0), 0) / peopleArr.length;
        result.push({
          group,
          year: avgYears,
          state: secValue,
          count: peopleArr.length,
          staff: peopleArr
        });
      });
    });
    return result;
  }, [groupStaffByDemographic, secondaryDimension, getMaxYears]);

  // Draw the timeline visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 60, right: 100, bottom: 60, left: 150 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const maxYears = getMaxYears();
    const xScale = d3.scaleLinear()
      .domain([0, maxYears])
      .range([0, width]);

    const demographicGroups = Object.keys(groupStaffByDemographic);
    const yScale = d3.scaleBand()
      .domain(demographicGroups)
      .range([0, height])
      .padding(0.3);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(demographicGroups)
      .range(['#5B6D8F', '#29AE61', '#E63946', '#F4A261', '#2A9D8F', '#E76F51']);

    // ...aggregatedData is now calculated above with useMemo...

    // Size scale for circles based on count
    const maxCount = d3.max(aggregatedData, d => d.count) || 1;
    const radiusScale = d3.scaleSqrt()
      .domain([0, maxCount])
      .range([3, 20]);

    // Draw gridlines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(xScale.ticks(maxYears / 5))
      .enter()
      .append('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Draw horizontal lines for each demographic group
    g.append('g')
      .selectAll('line.group-line')
      .data(demographicGroups)
      .enter()
      .append('line')
      .attr('class', 'group-line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d) + yScale.bandwidth() / 2)
      .attr('y2', d => yScale(d) + yScale.bandwidth() / 2)
      .attr('stroke', '#d0d0d0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');

    // Draw aggregated data points
    const jitterRange = yScale.bandwidth() * 0.25;
    
    const circleGroup = g.append('g');
    
    // Store y positions to avoid overlap
    const yPositions = new Map();
    
    aggregatedData.forEach(d => {
      const key = `${d.group}_${d.year}`;
      if (!yPositions.has(key)) {
        yPositions.set(key, []);
      }
      yPositions.get(key).push(d);
    });
    
    // Adjust y positions for multiple states at same year
    aggregatedData.forEach(d => {
      const key = `${d.group}_${d.year}`;
      const siblings = yPositions.get(key);
      const yCenter = yScale(d.group) + yScale.bandwidth() / 2;
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(d);
        const spacing = Math.min(30, yScale.bandwidth() / siblings.length);
        d.adjustedY = yCenter + (index - (siblings.length - 1) / 2) * spacing;
      } else {
        d.adjustedY = yCenter;
      }
    });
    
    circleGroup
      .selectAll('circle')
      .data(aggregatedData)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => d.adjustedY)
      .attr('r', d => radiusScale(d.count))
      .attr('fill', d => colorScale(d.group))
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', radiusScale(d.count) * 1.3)
          .attr('opacity', 1)
          .attr('stroke-width', 2);

        // Highlight corresponding label
        d3.selectAll('.state-label')
          .filter(label => label === d)
          .style('font-weight', '700')
          .style('font-size', '11px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', radiusScale(d.count))
          .attr('opacity', 0.7)
          .attr('stroke-width', 1.5);

        // Reset label
        d3.selectAll('.state-label')
          .filter(label => label === d)
          .style('font-weight', '500')
          .style('font-size', '10px');
      });
    
    // Add labels to circles showing secondary dimension states
    circleGroup
      .selectAll('text')
      .data(aggregatedData)
      .enter()
      .append('text')
      .attr('class', 'state-label')
      .attr('x', d => xScale(d.year))
      .attr('y', d => d.adjustedY + radiusScale(d.count) + 12)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => d.state);

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(maxYears / 5)
      .tickFormat(d => `${d}y`);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text('Years in Career');

    // Y-axis labels (demographic groups)
    g.append('g')
      .selectAll('text')
      .data(demographicGroups)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', d => yScale(d) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '13px')
      .style('font-weight', '500')
      .style('fill', '#333')
      .text(d => d);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -120)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#333')
      .text('Demographic Groups');

    // Legend
    const legend = g.append('g')
      .attr('transform', `translate(${width + 20}, 0)`);

    demographicGroups.forEach((group, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendRow.append('circle')
        .attr('r', 6)
        .attr('fill', colorScale(group))
        .attr('opacity', 0.7);

      legendRow.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .style('font-size', '11px')
        .style('fill', '#666')
        .text(group);
    });

  }, [dimensions, groupStaffByDemographic, timeScale, primaryDimension, secondaryDimension]);

  return (
    <Paper
      ref={containerRef}
      elevation={0}
      sx={{
        border: '1px solid var(--color-border-primary)',
        borderRadius: 1,
        p: 3,
        backgroundColor: '#ffffff'
      }}
    >
      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box>
            <Box component="span" sx={{ fontSize: '13px', fontWeight: 600, color: '#666', mr: 1.5 }}>
              Primary Dimension (Y-axis):
            </Box>
            <ButtonGroup size="small" variant="outlined">
              {dimensionOptions.map(dim => (
                <Button
                  key={dim.value}
                  variant={primaryDimension === dim.value ? 'contained' : 'outlined'}
                  onClick={() => setPrimaryDimension(dim.value)}
                  disabled={secondaryDimension === dim.value}
                  sx={{ 
                    bgcolor: primaryDimension === dim.value ? '#3B4960' : 'transparent',
                    color: primaryDimension === dim.value ? '#fff' : '#3B4960',
                    borderColor: '#3B4960',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: primaryDimension === dim.value ? '#2d3a4d' : 'rgba(59, 73, 96, 0.04)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#f5f5f5',
                      borderColor: '#d0d0d0',
                      color: '#999'
                    }
                  }}
                >
                  {dim.label}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          <Box>
            <Box component="span" sx={{ fontSize: '13px', fontWeight: 600, color: '#666', mr: 1.5 }}>
              Secondary Dimension (States):
            </Box>
            <ButtonGroup size="small" variant="outlined">
              {dimensionOptions.map(dim => (
                <Button
                  key={dim.value}
                  variant={secondaryDimension === dim.value ? 'contained' : 'outlined'}
                  onClick={() => setSecondaryDimension(dim.value)}
                  disabled={primaryDimension === dim.value}
                  sx={{ 
                    bgcolor: secondaryDimension === dim.value ? '#3B4960' : 'transparent',
                    color: secondaryDimension === dim.value ? '#fff' : '#3B4960',
                    borderColor: '#3B4960',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: secondaryDimension === dim.value ? '#2d3a4d' : 'rgba(59, 73, 96, 0.04)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#f5f5f5',
                      borderColor: '#d0d0d0',
                      color: '#999'
                    }
                  }}
                >
                  {dim.label}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          <Box>
            <Box component="span" sx={{ fontSize: '13px', fontWeight: 600, color: '#666', mr: 1.5 }}>
              Time Scale:
            </Box>
            <ButtonGroup size="small" variant="outlined">
              <Button
                variant={timeScale === '10y' ? 'contained' : 'outlined'}
                onClick={() => setTimeScale('10y')}
                sx={{ 
                  bgcolor: timeScale === '10y' ? '#3B4960' : 'transparent',
                  color: timeScale === '10y' ? '#fff' : '#3B4960',
                  borderColor: '#3B4960',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: timeScale === '10y' ? '#2d3a4d' : 'rgba(59, 73, 96, 0.04)',
                  }
                }}
              >
                10y
              </Button>
              <Button
                variant={timeScale === '15y' ? 'contained' : 'outlined'}
                onClick={() => setTimeScale('15y')}
                sx={{ 
                  bgcolor: timeScale === '15y' ? '#3B4960' : 'transparent',
                  color: timeScale === '15y' ? '#fff' : '#3B4960',
                  borderColor: '#3B4960',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: timeScale === '15y' ? '#2d3a4d' : 'rgba(59, 73, 96, 0.04)',
                  }
                }}
              >
                15y
              </Button>
              <Button
                variant={timeScale === '25y' ? 'contained' : 'outlined'}
                onClick={() => setTimeScale('25y')}
                sx={{ 
                  bgcolor: timeScale === '25y' ? '#3B4960' : 'transparent',
                  color: timeScale === '25y' ? '#fff' : '#3B4960',
                  borderColor: '#3B4960',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: timeScale === '25y' ? '#2d3a4d' : 'rgba(59, 73, 96, 0.04)',
                  }
                }}
              >
                25y
              </Button>
              <Button
                variant={timeScale === 'full' ? 'contained' : 'outlined'}
                onClick={() => setTimeScale('full')}
                sx={{ 
                  bgcolor: timeScale === 'full' ? '#3B4960' : 'transparent',
                  color: timeScale === 'full' ? '#fff' : '#3B4960',
                  borderColor: '#3B4960',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: timeScale === 'full' ? '#2d3a4d' : 'rgba(59, 73, 96, 0.04)',
                  }
                }}
              >
                Full
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      </Box>

      {/* SVG Canvas */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <svg ref={svgRef} style={{ display: 'block', maxWidth: '100%' }} />
      </Box>
    </Paper>
  );
};

export default StaffTimelineView;
