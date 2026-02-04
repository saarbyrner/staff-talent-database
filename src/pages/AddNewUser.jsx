import React, { useState } from 'react';
import {
  Box, Typography, Grid, TextField, Select, MenuItem, InputLabel, FormControl, Divider, Checkbox, FormGroup, FormControlLabel, Button, Paper, AppBar, Toolbar, Autocomplete
} from '@mui/material';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useNavigate, useLocation } from 'react-router-dom';

const groups = [
  'Account Admin',
  'Staff',
  'Oauth user',
  'Athletic Trainer/Therapist',
  'Coach',
  'Talent Database (candidate managed)',
  'Talent Database (MLS managed)',
  'Strength & Conditioning',
  'Discipline',
  'Injury Surveillance Officer',
  'Match Director',
  'Match Monitor',
  'Match Observer'
];
const languages = ['Use organisation language setting', 'English', 'Spanish', 'French'];
const squads = ['1st Team', 'Next Pro Team', 'U13', 'U13 AD', 'U14', 'U14 AD', 'U15 AD', 'U16', 'U16 AD', 'U17', 'U17 AD', 'U19', 'U19 AD'];

const permissions = {
  Workloads: ['Workload View', 'Edit Games'],
  Settings: ['Manage Athletes', 'Manage Staff Users', 'Manage Squads', 'View Imports', 'Create Imports', 'Exports', 'Labels Admin', 'View Labels', 'Groups Admin', 'View Groups', 'Assign Labels', 'View Staff Users'],
  Registration: ['View Registration', 'View Athlete', 'View Staff', 'View Registration Requirements', 'Manage Registration Status', 'Manage Registration Payment', 'Registration Payment Authorisation', 'View Registration Payment', 'Complete Athlete Registration', 'Complete Staff Registration', 'Payment Export'],
  'Fixture Management': ['Club Fixture Negotiation'],
  'Scout Access Management': ['Manage Scout Access', 'Scout Access Export'],
  Discipline: ['View Discipline Area', 'View Staff', 'View Athlete'],
  'League Game': ['View Game Schedule', 'View Game Information', 'View Game Team', 'Manage Game Information', 'Manage Game Team'],
};

export default function AddNewUser() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', dob: '', group: '', language: 'Use organisation language setting',
    squads: [], squadMemberships: [],
    permissions: {},
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect if we're in league context
  const isLeagueContext = location.pathname.startsWith('/league');
  const manageUsersPath = isLeagueContext ? '/league/staff/manage-users' : '/staff/manage-users';

  const handleInput = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const handlePermission = (group, perm) => setForm(f => ({
    ...f,
    permissions: { ...f.permissions, [perm]: !f.permissions[perm] }
  }));
  const handleSquad = (squad) => setForm(f => ({
    ...f,
    squads: f.squads.includes(squad) ? f.squads.filter(s => s !== squad) : [...f.squads, squad]
  }));

  const generateUsername = (firstName, lastName) => {
    const firstInitial = firstName.charAt(0).toLowerCase();
    const cleanLastName = lastName.toLowerCase().replace(/\s+/g, '');
    const randomNumber = Math.floor(Math.random() * 100);
    return `${firstInitial}${cleanLastName}${randomNumber}`;
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.email || !form.group) {
      alert('Please fill in all required fields: First Name, Last Name, Email, and Group');
      return;
    }

    // Generate username
    const username = generateUsername(form.firstName, form.lastName);
    
    // Format current date
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    // Create new user object
    const newUser = {
      name: `${form.firstName} ${form.lastName}`,
      username: username,
      role: form.group,
      email: form.email,
      date: formattedDate
    };

    // Navigate back with new user data
    navigate(manageUsersPath, { state: { newUser } });
  };

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif', pb: 8 }}>
      {/* Header */}
      <Box sx={{ maxWidth: 1100, mx: 0, mt: 0, p: 0 }}>
        <Box sx={{ bgcolor: '#fff', px: 4, pt: 4, pb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 400, fontSize: 32, mb: 0.5 }}>Add New User</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: '#e0e0e0', m: 0, width: '100vw', position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw' }} />
      <Box sx={{ maxWidth: 1100, mx: 0, mt: 0, p: 0 }}>
        {/* User Details */}
        <Paper sx={{ bgcolor: '#fff', px: 4, pt: 4, pb: 2, borderRadius: 0, boxShadow: 'none', mt: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>User Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}><TextField label="First Name" fullWidth value={form.firstName} onChange={e => handleInput('firstName', e.target.value)} /></Grid>
            <Grid item xs={12} md={4}><TextField label="Last Name" fullWidth value={form.lastName} onChange={e => handleInput('lastName', e.target.value)} /></Grid>
            <Grid item xs={12} md={4}><TextField label="Email" fullWidth value={form.email} onChange={e => handleInput('email', e.target.value)} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Date of birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dob}
                onChange={e => handleInput('dob', e.target.value)}
                helperText="Optional"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Group</InputLabel>
                <Select label="Group" value={form.group} onChange={e => handleInput('group', e.target.value)}>
                  {groups.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select label="Language" value={form.language} onChange={e => handleInput('language', e.target.value)}>
                  {languages.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
                <Typography variant="caption" sx={{ color: '#888', ml: 2, mt: 0.5 }}>Optional</Typography>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <Divider sx={{ borderColor: '#e0e0e0', m: 0, width: '100vw', position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw' }} />
      <Box sx={{ maxWidth: 1100, mx: 0, mt: 0, p: 0 }}>
        {/* Permissions */}
        <Paper sx={{ bgcolor: '#fff', px: 4, pt: 4, pb: 2, borderRadius: 0, boxShadow: 'none', mt: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>Permissions</Typography>
          <Divider sx={{ mb: 3, borderColor: '#e0e0e0' }} />
          <Grid container spacing={2}>
            {/* Top Row: Workloads, Settings, Registration */}
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Workloads</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="Workload View" />
                <FormControlLabel control={<Checkbox />} label="Edit Games" />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Settings</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="Manage Athletes" />
                <FormControlLabel control={<Checkbox />} label="Manage Staff Users" />
                <FormControlLabel control={<Checkbox />} label="Manage Squads" />
                <FormControlLabel control={<Checkbox />} label="View Imports" />
                <FormControlLabel control={<Checkbox />} label="Create Imports" />
                <FormControlLabel control={<Checkbox />} label="Exports" />
                <FormControlLabel control={<Checkbox />} label="Labels Admin" />
                <FormControlLabel control={<Checkbox />} label="View Labels" />
                <FormControlLabel control={<Checkbox />} label="Groups Admin" />
                <FormControlLabel control={<Checkbox />} label="View Groups" />
                <FormControlLabel control={<Checkbox />} label="Assign Labels" />
                <FormControlLabel control={<Checkbox />} label="View Staff Users" />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Registration</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="View Registration" />
                <FormControlLabel control={<Checkbox />} label="View Athlete" />
                <FormControlLabel control={<Checkbox />} label="View Staff" />
                <FormControlLabel control={<Checkbox />} label="View Registration Requirements" />
                <FormControlLabel control={<Checkbox />} label="Manage Registration Status" />
                <FormControlLabel control={<Checkbox />} label="Manage Registration Payment" />
                <FormControlLabel control={<Checkbox />} label="Registration Payment Authorisation" />
                <FormControlLabel control={<Checkbox />} label="View Registration Payment" />
                <FormControlLabel control={<Checkbox />} label="Complete Athlete Registration" />
                <FormControlLabel control={<Checkbox />} label="Complete Staff Registration" />
                <FormControlLabel control={<Checkbox />} label="Payment Export" />
              </FormGroup>
            </Grid>

            {/* Divider Row */}
            <Grid item xs={12} sx={{ my: 2 }}>
              <Divider sx={{ borderColor: '#e0e0e0' }} />
            </Grid>

            {/* Second Row: Fixture Management, Scout Access Management, Discipline */}
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Fixture Management</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="Club Fixture Negotiation" />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Scout Access Management</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="Manage Scout Access" />
                <FormControlLabel control={<Checkbox />} label="Scout Access Export" />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Discipline</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="View Discipline Area" />
                <FormControlLabel control={<Checkbox />} label="View Staff" />
                <FormControlLabel control={<Checkbox />} label="View Athlete" />
              </FormGroup>
            </Grid>

            {/* Divider Row */}
            <Grid item xs={12} sx={{ my: 2 }}>
              <Divider sx={{ borderColor: '#e0e0e0' }} />
            </Grid>

            {/* Third Row: League Game and Talent Database */}
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>League Game</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="View Game Schedule" />
                <FormControlLabel control={<Checkbox />} label="View Game Information" />
                <FormControlLabel control={<Checkbox />} label="View Game Team" />
                <FormControlLabel control={<Checkbox />} label="Manage Game Information" />
                <FormControlLabel control={<Checkbox />} label="Manage Game Team" />
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>Talent Database</Typography>
              <FormGroup>
                <FormControlLabel control={<Checkbox />} label="View talent database" />
              </FormGroup>
            </Grid>
            {/* Empty column for alignment */}
            <Grid item xs={12} md={4}></Grid>
          </Grid>
        </Paper>
      </Box>
      <Divider sx={{ borderColor: '#e0e0e0', m: 0, width: '100vw', position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw' }} />
      <Box sx={{ maxWidth: 1100, mx: 0, mt: 0, p: 0 }}>
        {/* Squad Access */}
        <Paper sx={{ bgcolor: '#fff', px: 4, pt: 4, pb: 2, borderRadius: 0, boxShadow: 'none', mt: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>Squad Access</Typography>
          <Typography sx={{ fontSize: 14, color: '#666', mb: 2 }}>Choose the squads that this user has access to.</Typography>
          <FormGroup>
            {squads.map(squad => (
              <FormControlLabel
                key={squad}
                control={<Checkbox checked={form.squads.includes(squad)} onChange={() => handleSquad(squad)} />}
                label={squad}
              />
            ))}
          </FormGroup>
        </Paper>
      </Box>
      <Divider sx={{ borderColor: '#e0e0e0', m: 0, width: '100vw', position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw' }} />
      <Box sx={{ maxWidth: 1100, mx: 0, mt: 0, p: 0 }}>
        {/* Squad Memberships */}
        <Paper sx={{ bgcolor: '#fff', px: 4, pt: 4, pb: 4, borderRadius: 0, boxShadow: 'none', mt: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>Squads Memberships</Typography>
          <Typography sx={{ fontSize: 14, color: '#666', mb: 2 }}>Choose the squads that this user is a member of.</Typography>
          <Autocomplete
            multiple
            options={squads}
            value={form.squadMemberships}
            onChange={(_, v) => handleInput('squadMemberships', v)}
            renderInput={(params) => <TextField {...params} label="Select squads..." variant="outlined" fullWidth />}
            sx={{ maxWidth: 400 }}
          />
        </Paper>
      </Box>
      {/* Footer Actions */}
      <AppBar position="fixed" color="inherit" sx={{ top: 'auto', bottom: 0, boxShadow: '0 -2px 8px rgba(0,0,0,0.03)', bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}>
        <Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" sx={{ borderColor: '#cfd8dc', color: '#222', fontWeight: 500, borderRadius: 2, px: 2, bgcolor: '#fff', textTransform: 'none', '&:hover': { borderColor: '#b0bec5', bgcolor: '#f6f7fb' } }}
            onClick={() => navigate(manageUsersPath)}
          >Cancel</Button>
          <Button variant="contained" sx={{ bgcolor: '#3B4960', color: '#fff', fontWeight: 600, borderRadius: 2, px: 3, boxShadow: 'none', textTransform: 'none', '&:hover': { bgcolor: '#2c364a' } }}
            onClick={handleSubmit}
          >Add user</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
