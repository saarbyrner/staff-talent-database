import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import * as d3 from 'd3';

/**
 * EmploymentStabilityBarChart
 * Visualizes employment stability with Seasons on the X-axis.
 * grouped by Team side-by-side within each season.
 * 
 * Logic:
 * - X-axis: Teams (Population)
 * - Y-axis: Staff Count (Aggregated over period)
 * - Line: Average staff count across all teams
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

    // Data is already aggregated per team in 'matrix'
    // We'll use 'matrix' directly for the bars
    const data = matrix;

    // Use container width directly so the graph doesn't grow in size
    const chartWidth = dimensions.width || 1000;

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

        // X Scale: Teams
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.team))
            .rangeRound([0, width])
            .padding(0.2);

        // Y Scale
        const maxCount = d3.max(data, d => d.total) || 5;
        const yScale = d3.scaleLinear()
            .domain([0, maxCount * 1.1])
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

        // Draw Bars
        g.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('x', d => xScale(d.team))
            .attr('y', d => yScale(d.total))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.total))
            .attr('fill', color)
            .attr('opacity', 0.9)
            .on('mouseenter', function (event, d) {
                d3.select(this).attr('opacity', 1).attr('fill', '#29AE61');

                g.append('text')
                    .attr('class', 'temp-label')
                    .attr('x', xScale(d.team) + xScale.bandwidth() / 2)
                    .attr('y', yScale(d.total) - 5)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '11px')
                    .style('font-weight', 'bold')
                    .text(d.total);
            })
            .on('mouseleave', function () {
                d3.select(this).attr('opacity', 0.9).attr('fill', color);
                d3.selectAll('.temp-label').remove();
            })
            .append('title')
            .text(d => `${d.team}: ${d.total} placements`);

        // X Axis Labels
        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style('font-size', '11px')
            .style('fill', '#666');

        // Draw Average Line (Global Average)
        const globalAvg = d3.mean(data, d => d.total);

        g.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', yScale(globalAvg))
            .attr('y2', yScale(globalAvg))
            .attr('stroke', '#ff9800')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        g.append('text')
            .attr('x', width - 5)
            .attr('y', yScale(globalAvg) - 5)
            .attr('text-anchor', 'end')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#e65100')
            .text(`Avg: ${globalAvg.toFixed(1)}`);

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

    }, [data, dimensions, chartWidth]);

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
                <Box sx={{ mb: 2 }} />

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
