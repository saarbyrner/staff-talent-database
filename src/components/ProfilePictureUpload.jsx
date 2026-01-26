import React, { useState, useRef } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { InsertDriveFile } from '@mui/icons-material';

/**
 * Profile Picture Upload Component
 * Allows users to upload profile pictures via drag & drop or click to browse
 * Supports PDF, SVG, PNG, JPG, GIF with max 10MB file size
 */
function ProfilePictureUpload({ value, onChange, error }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Accepted file types
  const acceptedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  /**
   * Validate file type and size
   */
  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload PDF, PNG, JPG files only.');
      return false;
    }
    if (file.size > maxFileSize) {
      setUploadError('File size exceeds 10MB limit. Please choose a smaller file.');
      return false;
    }
    setUploadError('');
    return true;
  };

  /**
   * Handle file selection
   */
  const handleFile = (file) => {
    if (validateFile(file)) {
      // Pass file to parent component
      if (onChange) {
        onChange(file);
      }
    }
  };

  /**
   * Handle drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handle click to open file browser
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file input change
   */
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Drop Zone Container */}
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        sx={{
          border: dragActive 
            ? '2px dashed var(--color-primary)' 
            : '2px dashed var(--color-border-primary)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: dragActive 
            ? 'rgba(0, 103, 177, 0.05)' 
            : 'var(--color-background-primary)',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '180px',
          '&:hover': {
            borderColor: 'var(--color-primary)',
            backgroundColor: 'rgba(0, 103, 177, 0.02)',
          },
        }}
      >
        {/* Upload Icon */}
        <InsertDriveFile
          sx={{
            fontSize: 48,
            color: 'var(--color-text-secondary)',
            mb: 2,
          }}
        />

        {/* Action Text */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              color: 'var(--color-text-primary)',
              mb: 0.5,
            }}
          >
            <Typography
              component="span"
              sx={{
                color: 'var(--color-primary)',
                textDecoration: 'underline',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  color: 'var(--color-primary-hover)',
                },
              }}
            >
              Click to upload
            </Typography>
            {' '}or drag and drop
          </Typography>

          {/* Helper Text */}
          <Typography
            variant="caption"
            sx={{
              color: 'var(--color-text-secondary)',
              display: 'block',
            }}
          >
            PDF, PNG, JPG (max. 10MB)
          </Typography>
        </Box>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </Box>

      {/* Display selected file name */}
      {value && (
        <Typography
          variant="body2"
          sx={{
            mt: 1.5,
            color: 'var(--color-text-secondary)',
          }}
        >
          Selected: <strong>{value.name || value}</strong>
        </Typography>
      )}

      {/* Error Messages */}
      {(uploadError || error) && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {uploadError || error}
        </Alert>
      )}
    </Box>
  );
}

export default ProfilePictureUpload;
