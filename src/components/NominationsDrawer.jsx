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
  Chip,
} from '@mui/material';
import { CloseOutlined, UploadFileOutlined, DeleteOutlined } from '@mui/icons-material';
import '../styles/design-tokens.css';

/**
 * NominationsDrawer Component
 * A side panel for nominating staff members by entering their details
 */
function NominationsDrawer({ open, onClose, onSubmitNomination, editMode = false, nominationToEdit = null, clubName = 'Portland Timbers' }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    reason: '',
    resume: null,
  });
  const [existingResumeData, setExistingResumeData] = useState(null);
  const [keepExistingResume, setKeepExistingResume] = useState(true);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Populate form when editing
  React.useEffect(() => {
    if (editMode && nominationToEdit && open) {
      setFormData({
        firstName: nominationToEdit.firstName || '',
        lastName: nominationToEdit.lastName || '',
        email: nominationToEdit.email || '',
        phoneNumber: nominationToEdit.phoneNumber || '',
        reason: nominationToEdit.reason || '',
        resume: null,
      });
      if (nominationToEdit.resumeFileName) {
        setExistingResumeData({
          fileName: nominationToEdit.resumeFileName,
          data: nominationToEdit.resumeData,
          type: nominationToEdit.resumeType,
        });
        setKeepExistingResume(true);
      } else {
        setExistingResumeData(null);
        setKeepExistingResume(true);
      }
    } else if (!editMode && open) {
      // Reset for new nomination
      setExistingResumeData(null);
      setKeepExistingResume(true);
    }
  }, [editMode, nominationToEdit, open]);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone number validation regex (basic)
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;

  // Handle input changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle file upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type (PDF only)
      const validTypes = ['application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, resume: 'Please upload a PDF file' }));
        return;
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, resume: 'File size must be less than 10MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, resume: file }));
      if (errors.resume) {
        setErrors(prev => ({ ...prev, resume: '' }));
      }
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, resume: null }));
  };

  // Handle removing existing resume
  const handleRemoveExistingResume = () => {
    setExistingResumeData(null);
    setKeepExistingResume(false);
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
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for nomination is required';
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
      emailRegex.test(formData.email) &&
      formData.phoneNumber.trim() !== '' &&
      phoneRegex.test(formData.phoneNumber) &&
      formData.reason.trim() !== ''
    );
  };

  // Handle submit nomination
  const handleSubmit = async () => {
    if (validateForm()) {
      // Convert resume file to data URL if present
      let resumeData = null;
      let resumeFileName = null;
      let resumeType = null;

      // Check if new file was uploaded
      if (formData.resume) {
        resumeData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(formData.resume);
        });
        resumeFileName = formData.resume.name;
        resumeType = formData.resume.type;
      } else if (editMode && keepExistingResume && existingResumeData) {
        // Keep existing resume
        resumeData = existingResumeData.data;
        resumeFileName = existingResumeData.fileName;
        resumeType = existingResumeData.type;
      }
      
      // Create or update nomination object
      const nomination = {
        id: editMode && nominationToEdit ? nominationToEdit.id : `NOM-${Date.now()}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        reason: formData.reason.trim(),
        resumeFileName,
        resumeData,
        resumeType,
        nominatedBy: editMode && nominationToEdit ? nominationToEdit.nominatedBy : clubName,
        status: editMode && nominationToEdit ? nominationToEdit.status : 'Pending',
        submittedDate: editMode && nominationToEdit ? nominationToEdit.submittedDate : new Date().toISOString(),
      };
      
      // Log the data (excluding large resumeData for readability)
      console.log('Nomination Data:', JSON.stringify({ ...nomination, resumeData: resumeData ? '[FILE DATA]' : null }, null, 2));
      
      // Call the callback if provided
      if (onSubmitNomination) {
        onSubmitNomination(nomination, editMode);
      }
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        reason: '',
        resume: null,
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
      phoneNumber: '',
      reason: '',
      resume: null,
    });
    setErrors({});
    setExistingResumeData(null);
    setKeepExistingResume(true);
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
              {editMode ? 'Edit Nomination' : 'Nominate'}
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

              <TextField
                label="Phone Number"
                variant="outlined"
                fullWidth
                required
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                placeholder="e.g., +1 (555) 123-4567"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />

              <TextField
                label="Reason for Nomination"
                variant="outlined"
                fullWidth
                required
                multiline
                rows={4}
                value={formData.reason}
                onChange={handleChange('reason')}
                error={!!errors.reason}
                helperText={errors.reason}
                placeholder="Please describe why you are nominating this person..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />

              {/* Resume Upload */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: '#374151',
                    fontSize: '0.875rem',
                  }}
                >
                  Upload Resume (Optional)
                </Typography>
                
                <input
                  type="file"
                  id="resume-upload-input"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                
                {/* Show existing resume if in edit mode and no new file uploaded */}
                {editMode && existingResumeData && !formData.resume && keepExistingResume ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      border: '1px solid #d1d5db',
                      borderRadius: 1,
                      backgroundColor: '#f9fafb',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
                      <UploadFileOutlined sx={{ color: '#6b7280' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#374151',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {existingResumeData.fileName}
                      </Typography>
                      <Chip 
                        label="Current" 
                        size="small" 
                        sx={{ 
                          ml: 1,
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: '#e0f2fe',
                          color: '#0369a1'
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        component="label"
                        htmlFor="resume-upload-input"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          minWidth: 'auto',
                          px: 1,
                        }}
                      >
                        Replace
                      </Button>
                      <IconButton
                        size="small"
                        onClick={handleRemoveExistingResume}
                        sx={{
                          color: '#6b7280',
                          '&:hover': {
                            color: '#ef4444',
                          },
                        }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ) : !formData.resume ? (
                  <label htmlFor="resume-upload-input">
                    <Box
                      sx={{
                        border: '2px dashed #d1d5db',
                        borderRadius: 1,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: '#ffffff',
                        '&:hover': {
                          borderColor: '#9ca3af',
                          backgroundColor: '#f9fafb',
                        },
                      }}
                    >
                      <UploadFileOutlined
                        sx={{
                          fontSize: 48,
                          color: '#6b7280',
                          mb: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#374151', mb: 0.5 }}>
                        <Box
                          component="span"
                          sx={{
                            color: '#2563eb',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          Click to upload
                        </Box>{' '}
                        or drag and drop
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5 }}>
                        PDF (max. 10MB)
                      </Typography>
                    </Box>
                  </label>
                ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: 1,
                        backgroundColor: 'var(--color-background-secondary)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
                        <UploadFileOutlined sx={{ color: 'var(--color-text-secondary)' }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'var(--color-text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formData.resume.name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={handleRemoveFile}
                        sx={{
                          color: 'var(--color-text-secondary)',
                          '&:hover': {
                            color: 'error.main',
                          },
                        }}
                      >
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                {errors.resume && (
                  <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 1 }}>
                    {errors.resume}
                  </Typography>
                )}
              </Box>
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
              onClick={handleSubmit}
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
              {editMode ? 'Update Nomination' : 'Submit Nomination'}
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
          {editMode ? 'Nomination updated successfully!' : 'Nomination submitted successfully!'}
        </Alert>
      </Snackbar>
    </>
  );
}

export default NominationsDrawer;
