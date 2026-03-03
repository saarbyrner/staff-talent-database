import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import '../styles/design-tokens.css';

/**
 * InviteDrawer Component
 * A side panel for inviting staff members by entering their details
 */
function InviteDrawer({ open, onClose, onAddPendingUser }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Handle input changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      emailRegex.test(formData.email)
    );
  };

  // Handle send invite
  const handleSendInvite = () => {
    if (validateForm()) {
      // Log the data as JSON
      console.log('Invite Data:', JSON.stringify(formData, null, 2));
      
      // Add pending user if handler is provided
      if (onAddPendingUser) {
        onAddPendingUser({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        });
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
      });
      
      // Close drawer after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  // Handle drawer close
  const handleClose = () => {
    // Reset form and errors
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
    });
    setErrors({});
    onClose();
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 480,
            backgroundColor: '#fff',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 3,
              borderBottom: '1px solid var(--color-border-primary)',
              backgroundColor: '#fff',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              Invite
            </Typography>
            <IconButton
              onClick={handleClose}
              sx={{
                color: 'var(--color-text-secondary)',
                '&:hover': {
                  backgroundColor: 'var(--color-background-tertiary)',
                },
              }}
            >
              <CloseOutlined />
            </IconButton>
          </Box>

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflowY: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />

              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                required
                value={formData.lastName}
                onChange={handleChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />

              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                required
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Footer Actions */}
          <Box
            sx={{
              p: 3,
              borderTop: '1px solid var(--color-border-primary)',
              backgroundColor: '#fff',
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                textTransform: 'none',
                borderColor: 'var(--color-border-primary)',
                color: 'var(--color-text-primary)',
                '&:hover': {
                  borderColor: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-background-tertiary)',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSendInvite}
              disabled={!isFormValid()}
              sx={{
                textTransform: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-hover)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'var(--color-background-tertiary)',
                  color: 'var(--color-text-disabled)',
                },
              }}
            >
              Send Invite
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSuccessClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Invitation sent successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default InviteDrawer;
