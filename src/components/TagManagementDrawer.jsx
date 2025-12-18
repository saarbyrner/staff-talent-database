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

const DEFAULT_TAGS = ['Unproven', 'Emerging', 'High Potential', 'Proven'];

/**
 * TagManagementDrawer - Side panel for managing all tags globally
 * @param {boolean} open - Whether drawer is open
 * @param {function} onClose - Close handler
 * @param {object[]} staffData - All staff members data
 * @param {function} onUpdateTag - Callback to update a tag name across all staff
 * @param {function} onDeleteTag - Callback to delete a tag from all staff
 * @param {function} onAddTag - Callback to create a new tag
 * @param {boolean} isLeagueView - Whether viewing as league admin (can create tags)
 */
const TagManagementDrawer = ({ open, onClose, staffData, onUpdateTag, onDeleteTag, onAddTag, isLeagueView = false }) => {
  const [editingTag, setEditingTag] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newTagName, setNewTagName] = useState('');
  
  // Collect all unique tags and their usage count
  const tagStats = useMemo(() => {
    const stats = {};
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
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [staffData]);
  
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
    if (window.confirm(`Delete tag "${tag.name}"? This will remove it from ${tag.count} staff member(s).`)) {
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
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'var(--color-background-secondary)' }}>
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
        </Paper>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Create New Tag - Only for League View */}
        {isLeagueView && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Create New Tag
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Autocomplete
                  freeSolo
                  size="small"
                  options={DEFAULT_TAGS.filter(tag => !tagStats.find(t => t.name === tag))}
                  value={newTagName}
                  onInputChange={(event, newValue) => setNewTagName(newValue)}
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Enter tag name..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateTag();
                        }
                      }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  sx={{
                    minWidth: 'auto',
                    px: 1.5,
                  }}
                >
                  <AddOutlined fontSize="small" />
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Create a tag that can be applied to any staff member
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
          </>
        )}
        
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
                        <TagChip label={tag.name} size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {tag.count} staff
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
