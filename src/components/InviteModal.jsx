import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import { Close, Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/design-tokens.css';

/**
 * InviteModal Component
 * Modal for inviting staff members by email with a preview button
 */
function InviteModal({ open, onClose }) {
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    
    if (!trimmedEmail) {
      setError('Please enter an email address');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (emails.includes(trimmedEmail)) {
      setError('This email has already been added');
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmailInput('');
    setError('');
  };

  const handleRemoveEmail = (emailToRemove) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddEmail();
    }
  };

  const handlePreview = () => {
    // Open the staff portal view in a new window for preview
    // In a real app, this would include a token or ID
    const previewUrl = `${window.location.origin}/portal/new${emails.length > 0 ? `?email=${encodeURIComponent(emails[0])}` : ''}`;
    window.open(previewUrl, '_blank');
  };

  const handleSendInvites = () => {
    if (emails.length === 0) {
      setError('Please add at least one email address');
      return;
    }

    console.log('Sending invites to:', emails);
    alert(`Invitations would be sent to ${emails.length} recipient${emails.length === 1 ? '' : 's'}:\n${emails.join('\n')}`);
    
    // Reset and close
    setEmails([]);
    setEmailInput('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setEmails([]);
    setEmailInput('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 'var(--radius-lg)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border-primary)',
        pb: 2
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Invite Staff Members
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: 'var(--color-text-secondary)' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
          Add email addresses of staff members you want to invite to fill out their information form.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Enter email address"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (error) setError('');
              }}
              onKeyPress={handleKeyPress}
              error={!!error}
              helperText={error}
            />
            <Button
              variant="outlined"
              onClick={handleAddEmail}
              startIcon={<Add />}
              sx={{ 
                textTransform: 'none',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
              }}
            >
              Add
            </Button>
          </Box>
        </Box>

        {emails.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: 'var(--color-text-primary)' }}>
              Recipients ({emails.length})
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {emails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() => handleRemoveEmail(email)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {emails.length === 0 && (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 4, 
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border-primary)'
            }}
          >
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              No recipients added yet
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        borderTop: '1px solid var(--color-border-primary)',
        px: 3,
        py: 2,
        gap: 1
      }}>
        <Button
          variant="outlined"
          onClick={handlePreview}
          startIcon={<Visibility />}
          sx={{ textTransform: 'none' }}
        >
          Preview Form
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="text"
          onClick={handleClose}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSendInvites}
          disabled={emails.length === 0}
          sx={{
            textTransform: 'none',
            backgroundColor: 'var(--color-primary)',
            '&:hover': {
              backgroundColor: 'var(--color-primary-hover)',
            },
          }}
        >
          Send Invitations
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InviteModal;
