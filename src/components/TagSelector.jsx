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

/**
 * Default tag options
 */
const DEFAULT_TAGS = ['Proven', 'Emerging', 'High Potential', 'Homegrown'];

/**
 * TagSelector component - Allows selecting from default tags and creating custom ones
 * @param {string[]} selectedTags - Currently selected tags
 * @param {function} onChange - Callback when tags change
 * @param {number} maxTags - Maximum number of tags allowed (default: 5)
 * @param {object} anchorEl - Popover anchor element
 * @param {function} onClose - Close handler
 */
const TagSelector = ({ selectedTags = [], onChange, maxTags = 5, anchorEl, onClose }) => {
  const [customTagInput, setCustomTagInput] = useState('');
  const open = Boolean(anchorEl);
  
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
              Selected ({selectedTags.length}/{maxTags})
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {selectedTags.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  onDelete={() => handleToggleTag(tag)}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {selectedTags.length > 0 && <Divider sx={{ my: 2 }} />}
        
        {/* Default Tags */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Default Tags
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
          </Stack>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Custom Tag Input */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Create Custom Tag
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Enter tag name..."
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={atMaxTags}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem',
                }
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAddCustomTag}
              disabled={!customTagInput.trim() || atMaxTags}
              sx={{
                minWidth: 'auto',
                px: 1.5,
              }}
            >
              <AddOutlined fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Box>
    </Popover>
  );
};

export default TagSelector;
