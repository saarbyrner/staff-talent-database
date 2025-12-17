import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, Avatar } from '@mui/material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { CustomToolbar } from '../components/TalentDatabaseGrid';
import TalentDatabaseGrid from '../components/TalentDatabaseGrid';
import InviteModal from '../components/InviteModal';
import staffList from '../data/users_staff.json';
import { generateInitialsImage } from '../utils/assetManager';
import '../styles/design-tokens.css';

/**
 * Staff Database page
 * Displays staff talent profiles in a DataGrid
 */
function StaffDatabase() {
  // Check if we're returning from a staff profile with a specific tab to show
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.activeTab ?? 1); // 0 = Staff (My Current Staff), 1 = Talent Database (default)
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event, value) => {
    setTab(value);
  };

  const handleRowClick = (params, event) => {
    // Don't navigate if clicking on checkbox or action buttons
    if (
      event.target.closest('.MuiCheckbox-root') ||
      event.target.closest('.MuiDataGrid-checkboxInput')
    ) {
      return;
    }
    const basePath = location.pathname.startsWith('/league') ? '/league/staff' : '/staff';
    // Pass the current tab in state so StaffProfile knows which tab to return to
    navigate(`${basePath}/${params.row.id}`, { state: { returnTab: tab } });
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
        <Tabs value={tab} onChange={handleChange} aria-label="Staff Tabs" sx={{ px: 0 }}>
          <Tab label="Staff" value={0} />
          <Tab label="Talent Database" value={1} />
        </Tabs>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          flexGrow: 1, 
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        {tab === 1 && <TalentDatabaseGrid onInviteClick={() => setInviteModalOpen(true)} />}
        {tab === 0 && (
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
        )}
      </Paper>

      <InviteModal 
        open={inviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />
    </Box>
  );
}

export default StaffDatabase;
