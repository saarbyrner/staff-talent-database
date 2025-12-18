import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Paper,
  Divider,
  Avatar,
  Chip,
} from '@mui/material';
import { CloseOutlined, AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { formatDistance } from 'date-fns';
import '../styles/design-tokens.css';

/**
 * NotesDrawer Component
 * A side panel for viewing and managing private notes for a staff member
 * Notes are organization-specific and not shared with other organizations
 */
function NotesDrawer({ open, onClose, staffMember, notes = [], onAddNote, onUpdateNote, onDeleteNote }) {
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(staffMember.id, newNoteText.trim());
      setNewNoteText('');
    }
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditNoteText(note.text);
  };

  const handleSaveEdit = (noteId) => {
    if (editNoteText.trim()) {
      onUpdateNote(staffMember.id, noteId, editNoteText.trim());
      setEditingNoteId(null);
      setEditNoteText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(staffMember.id, noteId);
    }
  };

  const displayName = staffMember
    ? `${staffMember.firstName || staffMember.firstname || ''} ${staffMember.lastName || staffMember.lastname || ''}`.trim()
    : 'Staff Member';

  // Sort notes by date, newest first
  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 480,
          backgroundColor: 'var(--color-background-secondary)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid var(--color-border-primary)',
            backgroundColor: 'var(--color-background-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Private Notes
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
              {displayName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>

        {/* Info Banner */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'var(--color-info-background)',
            borderBottom: '1px solid var(--color-border-primary)',
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
            Notes are private to your organization and will not be shared with other clubs or the staff member.
          </Typography>
        </Box>

        {/* New Note Input */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid var(--color-border-primary)',
            backgroundColor: 'var(--color-background-primary)',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Add New Note
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter your note here..."
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            variant="outlined"
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--color-background-secondary)',
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={handleAddNote}
            disabled={!newNoteText.trim()}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Note
          </Button>
        </Box>

        {/* Notes List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {sortedNotes.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                color: 'var(--color-text-secondary)',
              }}
            >
              <Typography variant="body2">No notes yet</Typography>
              <Typography variant="caption">Add your first note above</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sortedNotes.map((note) => (
                <Paper
                  key={note.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid var(--color-border-primary)',
                    backgroundColor: 'var(--color-background-primary)',
                  }}
                >
                  {/* Note Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.75rem',
                        bgcolor: 'var(--color-primary)',
                      }}
                    >
                      {note.authorInitials || 'U'}
                    </Avatar>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {note.authorName || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        {formatDistance(new Date(note.createdAt), new Date(), { addSuffix: true })}
                        {note.updatedAt && note.updatedAt !== note.createdAt && ' (edited)'}
                      </Typography>
                    </Box>
                    {!editingNoteId && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleStartEdit(note)}>
                          <EditOutlined fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(note.id)} color="error">
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {/* Note Content */}
                  {editingNoteId === note.id ? (
                    <Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                          mb: 1,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'var(--color-background-secondary)',
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSaveEdit(note.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleCancelEdit}
                          sx={{ textTransform: 'none' }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {note.text}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

export default NotesDrawer;
