import React from 'react';
import { Paper, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const OutdatedNotification = ({ onClose }) => {
  return (
    <Paper 
      style={{ 
        padding: '10px 20px', 
        marginBottom: '20px', 
        backgroundColor: '#fffbe6', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}
    >
      <Typography style={{ color: '#8a6d3b' }}>
        Some of your succession plans are more than 6 months old. Please review and update them.
      </Typography>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Paper>
  );
};

export default OutdatedNotification;
