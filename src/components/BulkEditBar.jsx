import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import { ArchiveOutlined } from '@mui/icons-material';

function BulkEditBar({ selectedCount, onSave, onCancel }) {
  const handleArchive = () => {
    const updates = { archived: true };
    onSave(updates);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid var(--color-border-primary)',
        backgroundColor: '#ffffff',
        borderRadius: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Bulk Edit
          </Typography>
          <Chip
            label={`${selectedCount} selected`}
            size="small"
            sx={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 600
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onCancel}
            color="inherit"
            variant="outlined"
            size="small"
            sx={{ 
              textTransform: 'none',
              borderColor: 'var(--color-border-primary)',
              '&:hover': {
                borderColor: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-tertiary)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleArchive}
            variant="contained"
            size="small"
            startIcon={<ArchiveOutlined />}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-hover)'
              }
            }}
          >
            Archive
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default BulkEditBar;
