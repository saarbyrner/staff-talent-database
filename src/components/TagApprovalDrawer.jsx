import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Stack,
  Divider,
  Paper,
  Chip,
  Button,
  TextField,
  Collapse,
} from '@mui/material';
import { CloseOutlined, CheckOutlined, CloseRounded, InboxOutlined, NoteOutlined } from '@mui/icons-material';
import TagChip from './TagChip';

/**
 * TagApprovalDrawer - Side panel for reviewing and approving/rejecting tag changes from clubs
 * @param {boolean} open - Whether drawer is open
 * @param {function} onClose - Close handler
 * @param {object[]} pendingApprovals - Array of pending tag change requests
 * @param {function} onApprove - Callback to approve a tag change (approvalId, note)
 * @param {function} onReject - Callback to reject a tag change (approvalId, note)
 */
const TagApprovalDrawer = ({ open, onClose, pendingApprovals = [], onApprove, onReject }) => {
  const [notes, setNotes] = useState({});
  const [expandedNote, setExpandedNote] = useState(null);

  const handleNoteChange = (approvalId, value) => {
    setNotes(prev => ({ ...prev, [approvalId]: value }));
  };

  const handleApprove = (approvalId) => {
    onApprove(approvalId, notes[approvalId] || '');
    setNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[approvalId];
      return newNotes;
    });
    setExpandedNote(null);
  };

  const handleReject = (approvalId) => {
    onReject(approvalId, notes[approvalId] || '');
    setNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[approvalId];
      return newNotes;
    });
    setExpandedNote(null);
  };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 460,
          p: 3,
        }
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InboxOutlined />
            <Typography variant="h6" fontWeight={600}>
              Tag Change Approvals
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>
        
        {/* Stats */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'var(--color-background-secondary)' }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Pending Approvals
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {pendingApprovals.length}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Approval List */}
        {pendingApprovals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <InboxOutlined sx={{ fontSize: 64, color: 'var(--color-text-tertiary)', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No pending approvals
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tag changes from clubs will appear here
            </Typography>
          </Box>
        ) : (
          <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
            {pendingApprovals.map((approval) => (
              <ListItem
                key={approval.id}
                sx={{
                  py: 2,
                  borderBottom: '1px solid var(--color-border-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 1.5,
                }}
              >
                {/* Staff Info */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {approval.staffName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {approval.clubName} • {new Date(approval.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                
                {/* Tag Change Details with Action Buttons */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    py: 1.5,
                    px: 2,
                    bgcolor: 'var(--color-background-tertiary)',
                    borderRadius: 1,
                  }}
                >
                  {approval.oldTags && approval.oldTags.length > 0 ? (
                    <Stack direction="row" spacing={0.5}>
                      {approval.oldTags.map(tag => (
                        <TagChip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No tags
                    </Typography>
                  )}
                  
                  <Typography variant="body2" sx={{ mx: 0.5 }}>→</Typography>
                  
                  <Stack direction="row" spacing={0.5}>
                    {approval.newTags.map(tag => (
                      <TagChip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                  
                  {/* Action Icon Buttons */}
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                    <IconButton
                      size="small"
                      onClick={() => setExpandedNote(expandedNote === approval.id ? null : approval.id)}
                      sx={{
                        backgroundColor: 'var(--color-background-secondary)',
                        color: 'var(--color-text-secondary)',
                        '&:hover': {
                          backgroundColor: 'var(--color-background-tertiary)',
                        },
                        width: 32,
                        height: 32,
                      }}
                      title="Add note"
                    >
                      <NoteOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleApprove(approval.id)}
                      sx={{
                        backgroundColor: '#2e7d32',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: '#1b5e20',
                        },
                        width: 32,
                        height: 32,
                      }}
                    >
                      <CheckOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleReject(approval.id)}
                      sx={{
                        backgroundColor: '#ffffff',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        },
                        width: 32,
                        height: 32,
                      }}
                    >
                      <CloseRounded fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Note Input (Expandable) */}
                <Collapse in={expandedNote === approval.id}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Add a note (optional)"
                    value={notes[approval.id] || ''}
                    onChange={(e) => handleNoteChange(approval.id, e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Collapse>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default TagApprovalDrawer;
