import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider,
  Paper,
  Autocomplete,
  Chip,
} from '@mui/material';
import { CloseOutlined, EditOutlined, DeleteOutlined, SaveOutlined, AddOutlined } from '@mui/icons-material';
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
 * TagManagementDrawer - Side panel for managing all tags globally
 * @param {boolean} open - Whether drawer is open
 * @param {function} onClose - Close handler
 * @param {object[]} staffData - All staff members data
 * @param {function} onUpdateTag - Callback to update a tag name across all staff
 * @param {function} onDeleteTag - Callback to delete a tag from all staff
 * @param {function} onAddTag - Callback to create a new tag
 * @param {string[]} availableCustomTags - Array of custom tags available but not yet applied
 * @param {boolean} isLeagueView - Whether viewing as league admin (can create tags)
 * @param {object} tagColorSeeds - Map of tag names to their original names for stable color generation
 */
const TagManagementDrawer = ({ open, onClose, staffData, onUpdateTag, onDeleteTag, onAddTag, availableCustomTags = [], isLeagueView = false, tagColorSeeds = {} }) => {
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newTagName, setNewTagName] = useState('');
  
  // Collect all unique tags and their usage count, including custom tags
  const tagStats = useMemo(() => {
    const stats = {};
    
    // Add tags from staff members
    staffData.forEach(staff => {
      if (staff.tags && Array.isArray(staff.tags)) {
        staff.tags.forEach(tag => {
          if (!stats[tag]) {
            stats[tag] = { name: tag, count: 0, staffIds: [] };
          }
          stats[tag].count++;
          stats[tag].staffIds.push(staff.id);
        });
      }
    });
    
    // Add custom tags that aren't yet applied to anyone
    availableCustomTags.forEach(tag => {
      if (!stats[tag]) {
        stats[tag] = { name: tag, count: 0, staffIds: [] };
      }
    });
    
    // Map tags for display based on view context
    return Object.values(stats).map(stat => ({
      ...stat,
      displayName: isLeagueView ? stat.name : (TAG_MAPPING.leagueToClub[stat.name] || stat.name)
    })).sort((a, b) => b.count - a.count);
  }, [staffData, availableCustomTags, isLeagueView]);
  
  const handleStartEdit = (tag) => {
    setEditingTag(tag.name);
    setEditValue(tag.name);
  };
  
  const handleSaveEdit = () => {
    if (editValue.trim() && editValue !== editingTag) {
      onUpdateTag(editingTag, editValue.trim());
    }
    setEditingTag(null);
    setEditValue('');
  };
  
  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
  };
  
  const handleDelete = (tag) => {
    const message = tag.count > 0 
      ? `Delete tag "${tag.displayName}"? This will remove it from ${tag.count} staff member(s).`
      : `Delete tag "${tag.displayName}"?`;
    if (window.confirm(message)) {
      onDeleteTag(tag.name);
    }
  };
  
  const handleCreateTag = () => {
    const trimmed = newTagName.trim();
    if (trimmed && !tagStats.find(t => t.name === trimmed)) {
      onAddTag(trimmed);
      setNewTagName('');
    }
  };
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          p: 3,
        }
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Manage Tags
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>
        
        {/* Stats */}
        <Box sx={{ mb: 3 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Total Tags
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {tagStats.length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Tagged Staff
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {staffData.filter(s => s.tags && s.tags.length > 0).length}
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        {/* Create New Tag Section */}
        <Box sx={{ my: 3, py: 3, borderTop: '1px solid var(--color-border-primary)', borderBottom: '1px solid var(--color-border-primary)' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Create New Tag
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              variant="outlined"
              placeholder="Enter tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              <AddOutlined />
            </Button>
          </Stack>
        </Box>
        
        {/* Tag List */}
        {tagStats.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No tags created yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
            {tagStats.map((tag) => (
              <ListItem
                key={tag.name}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid var(--color-border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {editingTag === tag.name ? (
                  // Edit Mode
                  <Box sx={{ display: 'flex', gap: 1, flex: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      fullWidth
                      sx={{ flex: 1 }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                      <SaveOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEdit}>
                      <CloseOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  // View Mode
                  <>  
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <TagChip 
                          label={tag.displayName} 
                          size="small" 
                          isLeagueView={isLeagueView}
                          colorSeed={tagColorSeeds[tag.name]}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {tag.count > 0 ? `${tag.count} staff` : 'Not in use'}
                        </Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleStartEdit(tag)}
                        sx={{ color: 'var(--color-text-secondary)' }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(tag)}
                        sx={{ color: 'var(--color-text-secondary)' }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default TagManagementDrawer;
