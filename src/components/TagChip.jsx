import React from 'react';
import { Chip } from '@mui/material';

/**
 * Tag color mapping - GitHub-style labels
 */
const TAG_COLORS = {
  'Proven': { bg: '#0E8A16', color: '#ffffff' },
  'Emerging': { bg: '#1D76DB', color: '#ffffff' },
  'High Potential': { bg: '#8250DF', color: '#ffffff' },
  'Homegrown': { bg: '#FBCA04', color: '#000000' },
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
 */
const TagChip = ({ label, onDelete, clickable = false, onClick, size = 'small' }) => {
  const colors = TAG_COLORS[label] || generateTagColor(label);
  
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
