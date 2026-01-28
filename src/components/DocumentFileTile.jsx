import React from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import { GetApp } from '@mui/icons-material';
import '../styles/design-tokens.css';

/**
 * DocumentFileTile Component
 * Displays a document/file with thumbnail, name, upload date, and actions
 * @param {string} thumbnailUrl - URL of the thumbnail image
 * @param {string} fileName - Name of the file
 * @param {string} uploadDate - Upload date string
 * @param {string} viewUrl - URL for viewing the file
 * @param {string} downloadUrl - URL for downloading the file
 */
function DocumentFileTile({ 
  thumbnailUrl, 
  fileName = 'document_file_name.jpg', 
  uploadDate = 'uploaded Mar 7 2025',
  viewUrl,
  downloadUrl 
}) {
  const handleView = () => {
    if (viewUrl) {
      window.open(viewUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        maxWidth: '100%',
        '&:hover': {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      {/* Thumbnail */}
      <Box
        component="img"
        src={thumbnailUrl}
        alt={fileName}
        sx={{
          width: 48,
          height: 48,
          borderRadius: '4px',
          objectFit: 'cover',
          flexShrink: 0,
          backgroundColor: '#f5f5f5',
        }}
      />

      {/* File Information */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 400,
            color: '#333333',
            fontSize: '0.875rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fileName}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#9e9e9e',
            fontSize: '0.75rem',
          }}
        >
          {uploadDate}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Link
          component="button"
          onClick={handleView}
          sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#1976d2',
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          View
        </Link>
        <IconButton
          size="small"
          onClick={handleDownload}
          sx={{
            color: '#757575',
            '&:hover': {
              color: '#1976d2',
            },
          }}
        >
          <GetApp fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}

export default DocumentFileTile;
