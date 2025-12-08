import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TalentDatabaseGrid from '../components/TalentDatabaseGrid';
import '../styles/design-tokens.css';

/**
 * Staff Database page
 * Displays staff talent profiles in a DataGrid
 */
function StaffDatabase() {
  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#fafafa' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ color: 'var(--color-text-primary)' }}>
          Staff Talent Database
        </Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1, 
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <TalentDatabaseGrid />
      </Paper>
    </Box>
  );
}

export default StaffDatabase;
