import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import * as d3 from 'd3';

/**
 * EmploymentStabilityBarChart
 * Visualizes employment stability with Seasons on the X-axis.
 * grouped by Team side-by-side within each season.
 * 
 * Logic:
 * - X-axis: Seasons (Time Trend)
 * - Group: Teams
 * - Y-axis: Staff Count
 * - Line: Average staff count per season
 * 
 * Props:
 *   matrix: Array<{ team, seasons: { [year]: count }, total, average }>
 *   seasons: Array<number> (e.g. [2025, 2024, 2023...])
 */
const EmploymentStabilityBarChart = ({ matrix, seasons }) => {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 450 });

    // Prepare data: Sort seasons ascending for a proper time trend (Left to Right)
    // [2021, 2022, 2023, 2024, 2025]
    const sortedSeasons = [...seasons].sort((a, b) => a - b);

    // Filter active teams (ensure we have consistent colors/order)
    // We can just use the matrix ordering (which is sorted by total count desc)
    const teams = matrix.map(d => d.team);

    // Group data by season
    const groupedData = sortedSeasons.map(season => {
        const values = matrix.map(d => ({
            team: d.team,
            count: d.seasons[season] || 0
        }));

        // Calculate season average
        const totalCount = values.reduce((sum, d) => sum + d.count, 0);
        const avg = values.length > 0 ? totalCount / values.length : 0;

        return {
            season,
            values, // Array of {team, count}
            avg
        };
    });

    // Dynamic width calculation
    // 5 Seasons * (30 Teams * 14px bar + padding)
    const barWidth = 14;
    const groupPadding = 60;
    const seasonGroupWidth = (teams.length * barWidth) + groupPadding;
    const chartWidth = Math.max(dimensions.width, sortedSeasons.length * seasonGroupWidth + 100);

    // Resize handler
    useEffect(() => {
        if (!containerRef.current) return;
        const updateDimensions = () => {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: 600 // Increased height for labels
            });
        };
        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Draw chart
    useEffect(() => {
        if (!svgRef.current || !matrix.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 50, right: 50, bottom: 200, left: 60 }; // Large bottom margin
        const width = chartWidth - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X0 Scale: Seasons
        const x0 = d3.scaleBand()
            .domain(sortedSeasons)
            .rangeRound([0, width])
            .paddingInner(0.1);

        // X1 Scale: Teams within Season
        const x1 = d3.scaleBand()
            .domain(teams)
            .rangeRound([0, x0.bandwidth()])
            .padding(0.05);

        // Y Scale
        const maxCount = d3.max(groupedData, s => d3.max(s.values, v => v.count)) || 5;
        const yScale = d3.scaleLinear()
            .domain([0, maxCount * 1.2])
            .range([height, 0]);

        const color = '#3B4960';

        // Grid lines
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScale)
                .tickSize(-width)
                .tickFormat('')
                .ticks(5)
            )
            .selectAll('line')
            .attr('stroke', '#e0e0e0')
            .attr('stroke-dasharray', '3,3');

        // Draw Groups (Seasons)
        const seasonGroups = g.selectAll('.season-group')
            .data(groupedData)
            .enter().append('g')
            .attr('class', 'season-group')
            .attr('transform', d => `translate(${x0(d.season)},0)`);

        // Draw Bars (Teams)
        seasonGroups.selectAll('rect')
            .data(d => d.values)
            .enter().append('rect')
            .attr('x', d => x1(d.team))
            .attr('y', d => yScale(d.count))
            .attr('width', x1.bandwidth())
            .attr('height', d => height - yScale(d.count))
            .attr('fill', color)
            .attr('opacity', 0.9)
            .on('mouseenter', function (event, d) {
                d3.select(this).attr('opacity', 1).attr('fill', '#29AE61');

                const group = d3.select(this.parentNode);
                group.append('text')
                    .attr('class', 'temp-label')
                    .attr('x', x1(d.team) + x1.bandwidth() / 2)
                    .attr('y', yScale(d.count) - 5)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '10px')
                    .style('font-weight', 'bold')
                    .text(`${d.team}: ${d.count}`);
            })
            .on('mouseleave', function () {
                d3.select(this).attr('opacity', 0.9).attr('fill', color);
                d3.selectAll('.temp-label').remove();
            })
            .append('title')
            .text(d => `${d.team}: ${d.count}`);

        // Add Individual Team Labels (Vertical)
        seasonGroups.selectAll('.team-label')
            .data(d => d.values)
            .enter().append('text')
            .attr('transform', d => `translate(${x1(d.team) + x1.bandwidth() / 2}, ${height + 10}) rotate(-90)`)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'middle')
            .style('font-size', '10px')
            .style('fill', '#666')
            .text(d => d.team);

        // Draw Average Line
        const lineGenerator = d3.line()
            .x(d => x0(d.season) + x0.bandwidth() / 2)
            .y(d => yScale(d.avg))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(groupedData)
            .attr('fill', 'none')
            .attr('stroke', '#ff9800')
            .attr('stroke-width', 3)
            .attr('d', lineGenerator)
            .style('filter', 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))');

        // Add dots for average
        g.selectAll('.avg-dot')
            .data(groupedData)
            .enter().append('circle')
            .attr('cx', d => x0(d.season) + x0.bandwidth() / 2)
            .attr('cy', d => yScale(d.avg))
            .attr('r', 5)
            .attr('fill', '#ff9800')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Add Average Labels
        g.selectAll('.avg-label')
            .data(groupedData)
            .enter().append('text')
            .attr('x', d => x0(d.season) + x0.bandwidth() / 2)
            .attr('y', d => yScale(d.avg) - 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#e65100')
            .text(d => d.avg.toFixed(1));

        // X Axis (Seasons)
        g.append('g')
            .attr('transform', `translate(0,${height + 170})`) // Push season labels below team labels
            .call(d3.axisBottom(x0))
            .selectAll('text')
            .style('font-size', '16px')
            .style('font-weight', '700')
            .style('fill', '#333');

        // Add separators
        if (sortedSeasons.length > 1) {
            g.append('g')
                .selectAll('line')
                .data(sortedSeasons.slice(0, -1))
                .enter().append('line')
                .attr('x1', d => x0(d) + x0.bandwidth() + (x0.paddingInner() * x0.bandwidth() / 2))
                .attr('x2', d => x0(d) + x0.bandwidth() + (x0.paddingInner() * x0.bandwidth() / 2))
                .attr('y1', 0)
                .attr('y2', height + 150)
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 1);
        }

        // Y Axis
        g.append('g')
            .call(d3.axisLeft(yScale)
                .ticks(Math.min(maxCount, 10))
                .tickFormat(d3.format('d'))
            );

        // Y Axis Label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -40)
            .attr('text-anchor', 'middle')
            .style('font-size', '13px')
            .style('fill', '#666')
            .text('Staff Count');

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 200}, ${margin.top - 20})`);

        // Bar legend
        legend.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', color)
            .attr('opacity', 0.9);

        legend.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .text('Team Staff Count')
            .style('font-size', '12px');

        // Line legend
        legend.append('line')
            .attr('x1', 0)
            .attr('x2', 15)
            .attr('y1', 32)
            .attr('y2', 32)
            .attr('stroke', '#ff9800')
            .attr('stroke-width', 3);

        legend.append('text')
            .attr('x', 20)
            .attr('y', 36)
            .text('Season Average')
            .style('font-size', '12px');

    }, [groupedData, dimensions, chartWidth, teams, sortedSeasons]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%' }}>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 1,
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden' // Ensure card doesn't expand
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        Employment Stability Trends
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Staff count per team across seasons. The orange line indicates the league average.
                    </Typography>
                </Box>

                {/* Scrollable container with fixed viewport behavior */}
                <Box
                    ref={containerRef}
                    sx={{
                        overflowX: 'auto',
                        width: '100%',
                        pb: 1,
                        position: 'relative'
                    }}
                >
                    <svg
                        ref={svgRef}
                        width={chartWidth}
                        height={dimensions.height}
                        style={{
                            display: 'block',
                            minWidth: chartWidth // Ensure SVG maintains calculated width
                        }}
                    />
                </Box>
            </Paper>
        </div>
    );
};

export default EmploymentStabilityBarChart;
