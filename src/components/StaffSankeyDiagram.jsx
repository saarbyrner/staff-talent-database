import React, { useState, useEffect, useRef } from 'react'
import { Box, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import staffData from '../data/staff_talent.json'

const StaffSankeyDiagram = ({ sourceField, targetField }) => {
  const svgRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        setDimensions({
          width: containerWidth - 48, // Account for padding
          height: 800
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Extract values from staff data based on field type
  const extractFieldValues = (person, field) => {
    switch (field) {
      case 'tags':
        return person.tags && person.tags.length > 0 ? person.tags : ['No Tags']
      
      case 'role':
        // Use interestArea for high-level role categorization
        if (person.interestArea) {
          return [person.interestArea]
        }
        // Fallback to categorizing based on which role arrays are populated
        if (person.coachingRoles && person.coachingRoles.length > 0) {
          return ['Coaching']
        }
        if (person.execRoles && person.execRoles.length > 0) {
          return ['Executive']
        }
        if (person.sportingVertical && person.sportingVertical.length > 0) {
          return ['Sporting Executive']
        }
        if (person.techRoles && person.techRoles.length > 0) {
          return ['Technical']
        }
        return ['No Role Specified']
      
      case 'country':
        return [person.country]
      
      case 'location':
        // Domestic (US/CA) vs International
        if (person.country === 'USA' || person.country === 'Canada') {
          return ['Domestic (US/CA)']
        }
        return ['International']
      
      case 'workAuth':
        const auths = []
        if (person.workAuthUS) auths.push('US')
        if (person.workAuthCA) auths.push('Canada')
        return auths.length > 0 ? auths : ['No Work Auth']
      
      case 'degree':
        return person.highestDegree || [person.degree || 'Not Specified']
      
      case 'mlsExperience':
        const exp = []
        if (person.mlsPlayerExp) exp.push('MLS Player')
        if (person.mlsCoachExp) exp.push('MLS Coach')
        if (person.mlsSportingExp) exp.push('MLS Sporting')
        return exp.length > 0 ? exp : ['No MLS Experience']
      
      case 'coachingLicense':
        if (person.coachingLicenses && person.coachingLicenses.length > 0) {
          // Get the highest level license
          return [person.coachingLicenses[0]]
        }
        return ['No License']
      
      case 'interestArea':
        return [person.interestArea || 'Not Specified']
      
      case 'employmentStatus':
        return [person.currentlyEmployed ? 'Employed' : 'Available']
      
      case 'trophies':
        const trophies = person.trophies || 0
        if (trophies === 0) return ['No Trophies']
        if (trophies <= 2) return ['1-2 Trophies']
        if (trophies <= 5) return ['3-5 Trophies']
        return ['6+ Trophies']
      
      default:
        return ['Unknown']
    }
  }

  // Generate Sankey data
  const generateSankeyData = () => {
    const flowMap = new Map()

    staffData.forEach(person => {
      const sourceValues = extractFieldValues(person, sourceField)
      const targetValues = extractFieldValues(person, targetField)

      sourceValues.forEach(source => {
        targetValues.forEach(target => {
          const key = `${source}|||${target}`
          flowMap.set(key, (flowMap.get(key) || 0) + 1)
        })
      })
    })

    // Create nodes
    const nodeSet = new Set()
    flowMap.forEach((value, key) => {
      const [source, target] = key.split('|||')
      nodeSet.add(`source_${source}`)
      nodeSet.add(`target_${target}`)
    })

    const nodes = Array.from(nodeSet).map(id => ({ id }))
    const nodeIndexMap = new Map(nodes.map((node, i) => [node.id, i]))

    // Create links
    const links = []
    flowMap.forEach((value, key) => {
      const [source, target] = key.split('|||')
      links.push({
        source: nodeIndexMap.get(`source_${source}`),
        target: nodeIndexMap.get(`target_${target}`),
        value
      })
    })

    return { nodes, links }
  }

  // Draw Sankey diagram
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const margin = { top: 20, right: 200, bottom: 20, left: 200 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Generate data
    const data = generateSankeyData()

    // Create sankey layout
    const sankeyGenerator = sankey()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[0, 0], [innerWidth, innerHeight]])

    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map(d => Object.assign({}, d)),
      links: data.links.map(d => Object.assign({}, d))
    })

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(['source', 'target'])
      .range(['#2E5C8A', '#8B4789'])

    // Draw links
    g.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', d => {
        const sourceNode = nodes[d.source.index]
        return sourceNode.id.startsWith('source_') ? '#2E5C8A' : '#8B4789'
      })
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.3)
      .append('title')
      .text(d => {
        const sourceName = nodes[d.source.index].id.replace('source_', '').replace('target_', '')
        const targetName = nodes[d.target.index].id.replace('source_', '').replace('target_', '')
        return `${sourceName} → ${targetName}\n${d.value} staff`
      })

    // Draw nodes
    const node = g.append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => d.id.startsWith('source_') ? '#2E5C8A' : '#8B4789')
      .attr('opacity', 0.8)
      .append('title')
      .text(d => {
        const name = d.id.replace('source_', '').replace('target_', '')
        return `${name}\n${d.value} staff`
      })

    // Add labels
    g.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x0 < innerWidth / 2 ? d.x0 - 6 : d.x1 + 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < innerWidth / 2 ? 'end' : 'start')
      .attr('font-size', '12px')
      .attr('fill', '#1A1A1A')
      .text(d => {
        const name = d.id.replace('source_', '').replace('target_', '')
        const count = d.value
        const percentage = ((count / staffData.length) * 100).toFixed(0)
        return `${name} ${count} (${percentage}%)`
      })

    // Add column headers
    g.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .attr('text-anchor', 'start')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1A1A1A')
      .text(sourceField.charAt(0).toUpperCase() + sourceField.slice(1))

    g.append('text')
      .attr('x', innerWidth)
      .attr('y', -5)
      .attr('text-anchor', 'end')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1A1A1A')
      .text(targetField.charAt(0).toUpperCase() + targetField.slice(1))

  }, [sourceField, targetField, dimensions])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Paper sx={{ p: 3, overflow: 'auto', flex: 1 }} ref={containerRef}>
        <svg ref={svgRef}></svg>
      </Paper>
    </Box>
  )
}

// Export selectors as a separate component for use in the dashboard header
export const StaffSankeySelectors = ({ sourceField, setSourceField, targetField, setTargetField, fieldOptions }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Source Data</InputLabel>
        <Select
          value={sourceField}
          onChange={(e) => setSourceField(e.target.value)}
          label="Source Data"
        >
          {fieldOptions.map(option => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              disabled={option.value === targetField}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Target Data</InputLabel>
        <Select
          value={targetField}
          onChange={(e) => setTargetField(e.target.value)}
          label="Target Data"
        >
          {fieldOptions.map(option => (
            <MenuItem 
              key={option.value} 
              value={option.value}
              disabled={option.value === sourceField}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default StaffSankeyDiagram
