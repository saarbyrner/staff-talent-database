import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { CloseOutlined, DownloadOutlined, OpenInNewOutlined } from '@mui/icons-material';
import '../styles/design-tokens.css';

/**
 * ResumeViewerModal Component
 * Displays resume files (PDF/DOC) in a modal
 */
function ResumeViewerModal({ open, onClose, resumeData, resumeFileName, resumeType }) {
  const handleDownload = () => {
    if (!resumeData || !resumeFileName) return;
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = resumeData;
    link.download = resumeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (!resumeData) return;
    
    // Open PDF in new tab
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${resumeData}" width="100%" height="100%" style="border:none;"></iframe>`
      );
      newWindow.document.title = resumeFileName || 'Resume';
    }
  };

  const isPDF = resumeType === 'application/pdf';
  const isWordDoc = resumeType === 'application/msword' || resumeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border-primary)',
          py: 2,
          px: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {resumeFileName || 'Resume'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isPDF && (
            <IconButton
              onClick={handleOpenInNewTab}
              sx={{
                color: 'var(--color-text-secondary)',
                '&:hover': {
                  backgroundColor: 'var(--color-background-tertiary)',
                },
              }}
              title="Open in new tab"
            >
              <OpenInNewOutlined />
            </IconButton>
          )}
          <IconButton
            onClick={handleDownload}
            sx={{
              color: 'var(--color-text-secondary)',
              '&:hover': {
                backgroundColor: 'var(--color-background-tertiary)',
              },
            }}
            title="Download"
          >
            <DownloadOutlined />
          </IconButton>
          <IconButton
            onClick={onClose}
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
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {isPDF && resumeData && (
          <Box
            sx={{
              flex: 1,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <embed
              src={`${resumeData}#toolbar=1&navpanes=0&scrollbar=1`}
              type="application/pdf"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </Box>
        )}
        
        {isWordDoc && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              backgroundColor: 'var(--color-background-secondary)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--color-text-secondary)' }}>
              Preview not available for Word documents
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: 'var(--color-text-secondary)' }}>
              Please download the file to view it
            </Typography>
            <IconButton
              onClick={handleDownload}
              sx={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                width: 56,
                height: 56,
                '&:hover': {
                  backgroundColor: 'var(--color-primary-hover)',
                },
              }}
            >
              <DownloadOutlined sx={{ fontSize: 32 }} />
            </IconButton>
          </Box>
        )}
        
        {!resumeData && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
            }}
          >
            <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
              No resume available
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ResumeViewerModal;
