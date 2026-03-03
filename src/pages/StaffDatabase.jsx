import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, Avatar } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { CustomToolbar } from '../components/TalentDatabaseGrid';
import TalentDatabaseGrid from '../components/TalentDatabaseGrid';
import WatchlistGrid from '../components/WatchlistGrid';
import SuccessionPlanning from '../pages/SuccessionPlanning';
import InviteModal from '../components/InviteModal';
import staffList from '../data/users_staff.json';
import staffTalentData from '../data/staff_talent.json';
import { generateInitialsImage } from '../utils/assetManager';
import '../styles/design-tokens.css';

// Initialize watchlist with some pre-populated staff objects
// Remove Michael Okoro (id: '102') and David Smith (id: '105') from the initial watchlist for club view
const INITIAL_WATCHLIST = [
  { id: '101', priority: 'High', targetRole: 'Head Coach' },
  { id: '110', priority: 'Low', targetRole: 'Sporting Director' }, // Christopher Nair
  { id: '115', priority: 'Medium', targetRole: 'Video Analyst' },
];

/**
 * Staff Database page
 * Displays staff talent profiles in a DataGrid
 */
function StaffDatabase() {
  // Check if we're returning from a staff profile with a specific tab to show
  const location = useLocation();
  const [tab, setTab] = useState(3); // 0 = Staff, 1 = Succession, 2 = Watchlist, 3 = Talent Database (default)

  // If navigated to this page with a desired active tab in location state, apply it.
  React.useEffect(() => {
    const incoming = location.state && (location.state.activeTab ?? location.state.returnTab);
    // Only accept valid numeric tab indices (avoid null or unexpected types)
    if (Number.isInteger(incoming) && incoming !== tab) {
      setTab(incoming);
    }
    // We want this to run when location changes
    // Debugging: log incoming state to help diagnose tab routing issues
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[StaffDatabase] location.state:', location.state, 'resolved incoming:', incoming, 'current tab:', tab);
    }
  }, [location]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  
  // Initialize staff data with archived status and pending users from localStorage
  const [staffData, setStaffData] = useState(() => {
    const archivedIds = JSON.parse(localStorage.getItem('archivedStaffIds') || '[]');
    const pendingUsers = JSON.parse(localStorage.getItem('pendingStaffUsers') || '[]');
    
    // Merge pending users with existing talent data
    const baseData = staffTalentData.map(staff => ({
      ...staff,
      isArchived: archivedIds.includes(staff.id)
    }));
    
    return [...pendingUsers, ...baseData];
  });
  
  const navigate = useNavigate();
  
  // Check if we're in league view
  const isLeagueView = location.pathname.startsWith('/league');
  
  // Helper to determine if a staff record is complete
  const getStaffStatus = (staff) => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const isIncomplete = requiredFields.some(field => {
      const value = staff[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    return isIncomplete ? 'Incomplete' : 'Complete';
  };
  
  // Remove incomplete users from watchlist (league view only)
  React.useEffect(() => {
    if (isLeagueView) {
      setWatchlist(currentWatchlist => {
        return currentWatchlist.filter(item => {
          const staff = staffData.find(s => s.id === item.id);
          if (!staff) return true; // Keep if staff not found
          return getStaffStatus(staff) !== 'Incomplete';
        });
      });
    }
  }, [staffData, isLeagueView]);

  const handleChange = (event, value) => {
    setTab(value);
  };
  
  // If in league view and watchlist tab is selected, redirect to talent database
  React.useEffect(() => {
    if (isLeagueView && tab === 1) {
      setTab(3); // Default to Talent Database
    }
  }, [isLeagueView, tab]);

  const handleAddToWatchlist = (staffId) => {
    // At league level, prevent adding incomplete users
    if (isLeagueView) {
      const staff = staffData.find(s => s.id === staffId);
      if (staff && getStaffStatus(staff) === 'Incomplete') {
        return; // Silently ignore - error already shown by TalentDatabaseGrid
      }
    }
    if (!watchlist.find(item => item.id === staffId)) {
      setWatchlist([...watchlist, { id: staffId, priority: 'Medium', targetRole: '' }]);
    }
  };

  const handleRemoveFromWatchlist = (staffId) => {
    setWatchlist(watchlist.filter(item => item.id !== staffId));
  };

  const handleArchiveStaff = (staffId) => {
    setStaffData(prevData => 
      prevData.map(staff => 
        staff.id === staffId ? { ...staff, isArchived: true } : staff
      )
    );
    
    // Persist to localStorage
    const archivedIds = JSON.parse(localStorage.getItem('archivedStaffIds') || '[]');
    if (!archivedIds.includes(staffId)) {
      archivedIds.push(staffId);
      localStorage.setItem('archivedStaffIds', JSON.stringify(archivedIds));
    }
  };

  const handleUnarchiveStaff = (staffId) => {
    setStaffData(prevData => 
      prevData.map(staff => 
        staff.id === staffId ? { ...staff, isArchived: false } : staff
      )
    );
    
    // Persist to localStorage
    const archivedIds = JSON.parse(localStorage.getItem('archivedStaffIds') || '[]');
    const updatedIds = archivedIds.filter(id => id !== staffId);
    localStorage.setItem('archivedStaffIds', JSON.stringify(updatedIds));
  };

  const handleWatchlistUpdate = (updatedItem) => {
    setWatchlist(currentWatchlist => {
      const newWatchlist = currentWatchlist.map(item => 
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );
      return newWatchlist;
    });
  };

  const handleAddPendingUser = (userData) => {
    // Get existing pending users from localStorage
    const existingPending = JSON.parse(localStorage.getItem('pendingStaffUsers') || '[]');
    
    // Generate a new unique ID (check both staffData and existing pending)
    const allIds = [...staffData.map(s => parseInt(s.id) || 0), ...existingPending.map(s => parseInt(s.id) || 0)];
    const maxId = Math.max(...allIds, 200); // Start from 200 to avoid conflicts
    const newId = String(maxId + 1);
    
    // Create a new pending user with minimal required fields
    const newUser = {
      id: newId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: '', // Empty - makes it incomplete/pending
      status: 'Pending',
      country: '',
      state: '',
      city: '',
      workAuthUS: false,
      workAuthCA: false,
      gender: '',
      ethnicity: '',
      hasAgent: false,
      agentName: '',
      agencyName: '',
      proPlayerExp: false,
      mlsPlayerExp: false,
      mlsClubsPlayed: [],
      otherPlayerExp: '',
      interestArea: '',
      coachingRoles: [],
      execRoles: [],
      techRoles: [],
      relocation: [],
      proCoachExp: false,
      mlsCoachExp: false,
      mlsCoachRoles: [],
      mlsClubsCoached: [],
      nonMlsCoachExp: [],
      sportingExp: false,
      mlsSportingExp: false,
      mlsClubsSporting: [],
      profilePrivacy: 'Private',
      isArchived: false,
    };
    
    // Store in localStorage
    const updatedPending = [newUser, ...existingPending];
    localStorage.setItem('pendingStaffUsers', JSON.stringify(updatedPending));
    
    // Add to staff data
    setStaffData(prevData => [newUser, ...prevData]);
  };

  const handleRowClick = (params, event) => {
    // Don't navigate if clicking on checkbox or action buttons
    if (
      event.target.closest('.MuiCheckbox-root') ||
      event.target.closest('.MuiDataGrid-checkboxInput')
    ) {
      return;
    }
    const isLeague = location.pathname.startsWith('/league');
    const basePath = isLeague ? '/league/staff' : '/staff';
    // Pass a `from` location-like object so StaffProfile can navigate back precisely
    const from = { pathname: location.pathname, search: location.search, state: { activeTab: tab } };
    navigate(`${basePath}/${params.row.id}`, { state: { from } });
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#fafafa' }}>
      

      <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid var(--color-border-primary)',
          backgroundColor: 'var(--color-background-primary)',
          borderRadius: 0,
          mx: -3,
          mt: -3,
        }}
      >
        <Tabs value={Number.isInteger(tab) ? tab : 3} onChange={handleChange} aria-label="Staff Tabs" sx={{ px: 0 }}>
          <Tab label="Staff" value={0} />
          {!isLeagueView && <Tab label="Watchlist" value={1} />}
          <Tab label="Talent Database" value={3} />
          {isLeagueView && <Tab label="Archived Candidates" value={4} />}
        </Tabs>
      </Paper>

      {!isLeagueView && (
        <Paper 
          elevation={0} 
          sx={{ 
            flexGrow: 1, 
            border: '1px solid var(--color-border-primary)',
            borderRadius: 1,
            overflow: 'hidden',
            display: tab !== 1 ? 'none' : 'block'
          }}
        >
          <WatchlistGrid
            watchlist={watchlist}
            onRemoveFromWatchlist={handleRemoveFromWatchlist}
            onUpdateWatchlist={handleWatchlistUpdate}
            staff={staffData}
          />
        </Paper>
      )}

      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1, 
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          overflow: 'hidden',
          display: tab !== 3 ? 'none' : 'block'
        }}
      >
        <TalentDatabaseGrid 
          onInviteClick={() => setInviteModalOpen(true)} 
          watchlistIds={watchlist.map(i => i.id)}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          showArchived={false}
          staffData={staffData}
          onArchive={handleArchiveStaff}
          onAddPendingUser={handleAddPendingUser}
        />
      </Paper>
      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1, 
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          overflow: 'hidden',
          display: tab !== 4 ? 'none' : 'block'
        }}
      >
        <TalentDatabaseGrid 
          onInviteClick={() => setInviteModalOpen(true)} 
          watchlistIds={watchlist.map(i => i.id)}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          showArchived={true}
          staffData={staffData}
          onUnarchive={handleUnarchiveStaff}
          onAddPendingUser={handleAddPendingUser}
        />
      </Paper>
      
      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1, 
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          overflow: 'hidden',
          display: tab !== 0 ? 'none' : 'block'
        }}
      >
        <Box sx={{ height: '100%', width: '100%' }}>
          <DataGridPro
            rows={staffList}
            columns={[
              {
                field: 'avatar',
                headerName: '',
                width: 72,
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                  const name = `${params.row.firstname || ''} ${params.row.lastname || ''}`.trim();
                  const initials = name
                    .split(' ')
                    .filter(Boolean)
                    .map(part => part.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join('') || 'U';
                  const fallbackSrc = generateInitialsImage(name || 'Staff Member', 128, '#040037', '#ffffff');
                  const hasRemoteImage = params.row.profilePic && params.row.profilePic.length > 0;
                  
                  return (
                    <Avatar
                      src={hasRemoteImage ? params.row.profilePic : undefined}
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        bgcolor: 'var(--color-background-secondary)', 
                        color: 'var(--color-text-primary)' 
                      }}
                      imgProps={{
                        onError: (event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackSrc;
                        }
                      }}
                    >
                      {initials}
                    </Avatar>
                  );
                }
              },
              { field: 'firstname', headerName: 'First Name', width: 150 },
              { field: 'lastname', headerName: 'Last Name', width: 150 },
              { field: 'phone', headerName: 'Phone', width: 160 },
              { field: 'email', headerName: 'Email', width: 240 },
              { field: 'role', headerName: 'Role', width: 180 }
            ]}
            slots={{ toolbar: CustomToolbar }}
            onRowClick={handleRowClick}
            checkboxSelection
            pageSizeOptions={[25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } }
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid var(--color-border-secondary)'
              },
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: '1px solid var(--color-border-primary)',
                backgroundColor: 'var(--color-background-secondary)'
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid var(--color-border-primary)'
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer'
              }
            }}
          />
        </Box>
      </Paper>

      <InviteModal 
        open={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />
    </Box>
  );
}

export default StaffDatabase;
