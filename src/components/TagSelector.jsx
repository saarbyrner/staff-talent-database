import React, { useState } from 'react';
import {
  Box,
  Popover,
  TextField,
  Stack,
  Button,
  Typography,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import { AddOutlined, CloseOutlined } from '@mui/icons-material';
import TagChip from './TagChip';

// Tag mapping between league and club tags
const TAG_MAPPING = {
  leagueToClub: {
    'Unproven': 'Raw Talent',
    'Emerging': 'Growth stage',
    'High Potential': 'Top prospect',
    'Proven': 'Vetted Elite'
  },
  clubToLeague: {
    'Raw Talent': 'Unproven',
    'Growth stage': 'Emerging',
    'Top prospect': 'High Potential',
    'Vetted Elite': 'Proven'
  }
};

/**
 * TagSelector component - Allows selecting from default tags and creating custom ones
 * @param {string[]} selectedTags - Currently selected tags
 * @param {function} onChange - Callback when tags change
 * @param {number} maxTags - Maximum number of tags allowed (default: 4)
 * @param {object} anchorEl - Popover anchor element
 * @param {function} onClose - Close handler
 * @param {boolean} isLeagueView - Whether viewing as league admin (uses different tag set)
 * @param {function} onAddCustomTag - Callback when a new custom tag is created
 * @param {string[]} availableCustomTags - List of custom tags available in the system
 * @param {object} tagColorSeeds - Map of tag names to their original names for stable color generation
 */
const TagSelector = ({ selectedTags = [], onChange, maxTags = 4, anchorEl, onClose, isLeagueView = false, onAddCustomTag, availableCustomTags = [], tagColorSeeds = {} }) => {
  const [customTagInput, setCustomTagInput] = useState('');
  const open = Boolean(anchorEl);
  
  // Different default tags for league vs club
  const DEFAULT_TAGS = isLeagueView 
    ? ['Unproven', 'Emerging', 'High Potential', 'Proven']
    : ['Raw Talent', 'Growth stage', 'Top prospect', 'Vetted Elite'];
  
  // Helper to get original tag name for color seed lookup
  const getOriginalTagName = (displayTag) => {
    if (isLeagueView) return displayTag; // League view uses original names
    // Club view: reverse map to get original name
    return TAG_MAPPING.clubToLeague[displayTag] || displayTag;
  };
  
  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      // Remove tag
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      // Add tag if under limit
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tag]);
      }
    }
  };
  
  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed) && selectedTags.length < maxTags) {
      onChange([...selectedTags, trimmed]);
      // Register the new custom tag in the system
      if (onAddCustomTag) {
        onAddCustomTag(trimmed);
      }
      setCustomTagInput('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };
  
  const atMaxTags = selectedTags.length >= maxTags;
  
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      PaperProps={{
        sx: {
          width: 320,
          p: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Add Tags
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>
        
        {atMaxTags && (
          <Box sx={{ mb: 2, p: 1, bgcolor: '#FFF3CD', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Maximum of {maxTags} tags reached
            </Typography>
          </Box>
        )}
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Selected ({selectedTags.length}/{DEFAULT_TAGS.length + availableCustomTags.length})
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {selectedTags.map((tag) => {
                const originalTag = getOriginalTagName(tag);
                return (
                  <TagChip
                    key={tag}
                    label={tag}
                    onDelete={() => handleToggleTag(tag)}
                    size="small"
                    isLeagueView={isLeagueView}
                    colorSeed={tagColorSeeds[originalTag]}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
        
        {selectedTags.length > 0 && <Divider sx={{ my: 2 }} />}
        
        {/* Default Tags */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Tags
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {DEFAULT_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  clickable={!atMaxTags || isSelected}
                  onClick={() => handleToggleTag(tag)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  disabled={atMaxTags && !isSelected}
                  sx={{
                    fontWeight: 500,
                  }}
                />
              );
            })}
            {/* Display custom tags */}
            {availableCustomTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  clickable={!atMaxTags || isSelected}
                  onClick={() => handleToggleTag(tag)}
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  disabled={atMaxTags && !isSelected}
                  sx={{
                    fontWeight: 500,
                  }}
                />
              );
            })}
          </Stack>
        </Box>
            {/* Custom Tag Input - Always Visible */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Create New Tag
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder="Enter custom tag"
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={atMaxTags}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleAddCustomTag}
                  disabled={atMaxTags || !customTagInput.trim()}
                >
                  <AddOutlined />
                </Button>
              </Stack>
            </Box>
      </Box>
    </Popover>
  );
};

export default TagSelector;
