import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import NominationsGrid from '../components/NominationsGrid';
import NominationsDrawer from '../components/NominationsDrawer';
import '../styles/design-tokens.css';

/**
 * Nominations page
 * Displays staff nominations in a DataGrid with ability to add new nominations
 */
function Nominations() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Initialize nominations from localStorage
  const [nominations, setNominations] = useState(() => {
    const stored = localStorage.getItem('nominations');
    return stored ? JSON.parse(stored) : [];
  });

  // Check if we're in league view
  const isLeagueView = location.pathname.startsWith('/league');

  // Handle opening the nomination drawer
  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  // Handle closing the nomination drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  // Handle submitting a new nomination
  const handleSubmitNomination = (nomination) => {
    const updatedNominations = [nomination, ...nominations];
    setNominations(updatedNominations);
    
    // Persist to localStorage
    localStorage.setItem('nominations', JSON.stringify(updatedNominations));
  };

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 56px)' }}>
      <NominationsGrid
        nominations={nominations}
        onNominateClick={handleOpenDrawer}
      />
      
      <NominationsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        onSubmitNomination={handleSubmitNomination}
      />
    </Box>
  );
}

export default Nominations;
