import React from 'react';
import { Box, Typography } from '@mui/material';
import '../styles/design-tokens.css';

function StaffMapDashboard() {
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#fafafa'
    }}>
      <Box sx={{ textAlign: 'center', maxWidth: 600, p: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            color: 'var(--color-primary)',
            mb: 2
          }}
        >
          Analysis Area
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This area is currently empty.
        </Typography>
      </Box>
    </Box>
  );
}

export default StaffMapDashboard;
