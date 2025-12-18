import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import * as d3 from 'd3';
import staffData from '../data/staff_talent.json';

// Helper to generate random Elo ratings if not present
const generateEloRating = (id) => {
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = () => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  return 1200 + Math.floor(random() * 600); // 1200-1800
};

/**
 * ELO Graph Component
 * Displays a horizontal bar chart of top 20 staff by Elo Rating
 */
function EloGraph({ dashboardFilters = null }) {
  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 });

  // Prepare staff data with Elo ratings
  const staffWithElo = useMemo(() => {
    return staffData.map(staff => ({
      ...staff,
      eloRating: staff.eloRating || generateEloRating(staff.id),
      fullName: `${staff.firstName} ${staff.lastName}`,
    }));
  }, []);

  // Filter and sort staff
  const topStaff = useMemo(() => {
    let filtered = [...staffWithElo];
    
    // Apply staff filter from dashboardFilters if any are selected
    if (dashboardFilters?.selectedStaff?.length > 0) {
      const selectedIds = dashboardFilters.selectedStaff.map(s => s.id);
      filtered = filtered.filter(s => selectedIds.includes(s.id));
    }
    
    // Sort by Elo rating and take top 20
    return filtered
      .sort((a, b) => b.eloRating - a.eloRating)
      .slice(0, 20);
  }, [staffWithElo, dashboardFilters]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Account for padding and ensure minimum width
        const chartWidth = Math.max(width - 96, 600);
        setDimensions({ width: chartWidth, height: Math.min(topStaff.length * 35 + 150, 700) });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [topStaff.length]);

  // Draw chart
  useEffect(() => {
    if (!chartRef.current || topStaff.length === 0) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 40, bottom: 40, left: 200 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .attr('width', dimensions.width)
      .attr('height', dimensions.height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([1000, d3.max(topStaff, d => d.eloRating) + 100])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(topStaff.map((d, i) => i))
      .range([0, height])
      .padding(0.2);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#666');

    // Add Y axis with names
    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat((d, i) => {
        const staff = topStaff[i];
        return staff.fullName.length > 20 
          ? staff.fullName.substring(0, 20) + '...' 
          : staff.fullName;
      }))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#333')
      .style('font-weight', '500');

    // Remove Y axis line
    g.select('.domain').remove();

    // Add bars
    const bars = g.selectAll('.bar')
      .data(topStaff)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', (d, i) => yScale(i))
      .attr('width', d => xScale(d.eloRating) - xScale(1000))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d, i) => {
        // Color gradient from top to bottom
        if (i < 5) return '#1976d2';
        if (i < 10) return '#42a5f5';
        if (i < 15) return '#64b5f6';
        return '#90caf9';
      })
      .attr('rx', 4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8);
        
        // Show tooltip
        const tooltip = g.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${xScale(d.eloRating) + 5},${yScale(topStaff.indexOf(d)) + yScale.bandwidth() / 2})`);

        tooltip.append('rect')
          .attr('fill', 'rgba(0,0,0,0.8)')
          .attr('rx', 4)
          .attr('x', 0)
          .attr('y', -15)
          .attr('width', 100)
          .attr('height', 30);

        tooltip.append('text')
          .attr('fill', 'white')
          .attr('x', 10)
          .attr('y', 5)
          .attr('font-size', '12px')
          .text(`Elo: ${d.eloRating}`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
        
        g.selectAll('.tooltip').remove();
      });

    // Add value labels
    g.selectAll('.label')
      .data(topStaff)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.eloRating) + 5)
      .attr('y', (d, i) => yScale(i) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('fill', '#333')
      .text(d => d.eloRating);

  }, [topStaff, dimensions]);

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%', overflow: 'hidden' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          height: '100%',
          bgcolor: '#ffffff',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          m: 2,
          mt: 0
        }}
      >
        {/* Chart Section */}
        <Box 
          ref={containerRef}
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: 0
          }}
        >
          <svg ref={chartRef} style={{ display: 'block' }} />
        </Box>
      </Paper>
    </Box>
  );
}

export default EloGraph;
