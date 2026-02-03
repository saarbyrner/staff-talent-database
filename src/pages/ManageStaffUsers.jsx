import React, { useState, useEffect } from 'react';
import { Box, Button, Tabs, Tab, InputBase, Paper, Avatar, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';

// Initial example data
const initialUsers = [
  { name: 'Alex Johnson', username: 'ajohnson1', role: 'Account Admin', email: 'alex.johnson@email.com', date: '12 January 2024' },
  { name: 'Brianna Smith', username: 'bsmith2', role: 'Coach', email: 'brianna.smith@email.com', date: '23 February 2024' },
  { name: 'Chris Lee', username: 'clee3', role: 'Staff', email: 'chris.lee@email.com', date: '5 March 2024' },
  { name: 'Dana Patel', username: 'dpatel4', role: 'Coach', email: 'dana.patel@email.com', date: '18 April 2024' },
  { name: 'Evan Garcia', username: 'egarcia5', role: 'Staff', email: 'evan.garcia@email.com', date: '30 May 2024' },
  { name: 'Faith Brown', username: 'fbrown6', role: 'Account Admin', email: 'faith.brown@email.com', date: '14 June 2024' },
  { name: 'Gavin Wilson', username: 'gwilson7', role: 'Coach', email: 'gavin.wilson@email.com', date: '27 July 2024' },
  { name: 'Harper Kim', username: 'hkim8', role: 'Staff', email: 'harper.kim@email.com', date: '9 August 2024' },
  { name: 'Isla Martinez', username: 'imartinez9', role: 'Coach', email: 'isla.martinez@email.com', date: '21 September 2024' },
  { name: 'Jack Nguyen', username: 'jnguyen10', role: 'Staff', email: 'jack.nguyen@email.com', date: '3 October 2024' },
];

function stringAvatar(name) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  return { children: initials };
}

export default function ManageStaffUsers() {
  const [users, setUsers] = useState(initialUsers);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check for new user from navigation state
  useEffect(() => {
    if (location.state?.newUser) {
      setUsers(prevUsers => [location.state.newUser, ...prevUsers]);
      // Clear the navigation state to prevent re-adding on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <Box sx={{ bgcolor: '#f6f7fb', minHeight: '100vh', fontFamily: 'Inter, sans-serif', p: 0 }}>
      {/* Sticky White Header Area */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 100, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', borderRadius: 0, width: '100%', px: 3, pt: 3, pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0, flexWrap: 'wrap' }}>
          <Typography variant="h4" sx={{ fontWeight: 400, fontSize: 32, mb: 0.5, color: '#222' }}>Manage Staff Users</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="contained" sx={{ bgcolor: '#14213d', color: '#fff', fontWeight: 600, borderRadius: 2, px: 3, boxShadow: 'none', textTransform: 'none', '&:hover': { bgcolor: '#1a2752' } }}
              onClick={() => navigate('/staff/add-user')}
            >Create new user</Button>
            <Button variant="outlined" sx={{ borderColor: '#cfd8dc', color: '#222', fontWeight: 500, borderRadius: 2, px: 2, bgcolor: '#fff', textTransform: 'none', '&:hover': { borderColor: '#b0bec5', bgcolor: '#f6f7fb' } }}>Upload users</Button>
            <Button variant="outlined" sx={{ borderColor: '#cfd8dc', color: '#222', fontWeight: 500, borderRadius: 2, px: 2, bgcolor: '#fff', textTransform: 'none', '&:hover': { borderColor: '#b0bec5', bgcolor: '#f6f7fb' } }}>Download csv</Button>
          </Box>
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40, mt: 2, px: 0 }}>
          <Tab label="Active" sx={{ fontWeight: 600, minWidth: 100, color: tab === 0 ? '#14213d' : '#888' }} />
          <Tab label="Inactive" sx={{ fontWeight: 600, minWidth: 100, color: tab === 1 ? '#14213d' : '#888' }} />
        </Tabs>
      </Box>
      {/* Search and subtitle */}
      <Box sx={{ px: 4, pt: 3, pb: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Paper component="form" sx={{ ml: 2, p: '2px 8px', display: 'flex', alignItems: 'center', width: 240, boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fff' }}>
          <SearchIcon sx={{ color: '#888', mr: 1 }} />
          <InputBase
            sx={{ ml: 1, flex: 1, fontFamily: 'Inter, sans-serif' }}
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            inputProps={{ 'aria-label': 'search users' }}
          />
        </Paper>
      </Box>
      {/* Table */}
      <Box sx={{ px: 3, pb: 4, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', bgcolor: '#fff' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 400, color: '#222', fontSize: 15 }}>Staff name</TableCell>
                <TableCell sx={{ fontWeight: 400, color: '#222', fontSize: 15 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 400, color: '#222', fontSize: 15 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 400, color: '#222', fontSize: 15 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 400, color: '#222', fontSize: 15 }}>Creation Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 400, color: '#222', fontSize: 15 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar {...stringAvatar(user.name)} sx={{ width: 36, height: 36, bgcolor: '#14213d', fontWeight: 600, fontSize: 16 }} />
                    <span style={{ fontWeight: 500, color: '#222', fontSize: 15 }}>{user.name}</span>
                  </TableCell>
                  <TableCell sx={{ color: '#222', fontSize: 15 }}>{user.username}</TableCell>
                  <TableCell sx={{ color: '#222', fontSize: 15 }}>{user.role}</TableCell>
                  <TableCell sx={{ color: '#222', fontSize: 15 }}>{user.email}</TableCell>
                  <TableCell sx={{ color: '#222', fontSize: 15 }}>{user.date}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" sx={{ color: '#14213d' }}><EditOutlinedIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
