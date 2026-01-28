import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { generateInitialsImage } from '../utils/assetManager';
import StaffProfileDetails from '../components/StaffProfileDetails';
import '../styles/design-tokens.css';

/**
 * Staff Profile Detail Page
 * Displays detailed information about a staff member with master-detail layout
 */
function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're viewing from league context
  const isLeagueView = location.pathname.startsWith('/league');

  // Find staff member from either talent database or current staff
  const staffMember = useMemo(() => {
    // Check talent database first
    let member = staffTalentData.find(s => s.id === id);
    if (member) {
      return { 
        ...member, 
        source: 'talent'
      };
    }
    
    // Check current staff
    member = currentStaffData.find(s => s.id === parseInt(id));
    if (member) {
      return { 
        ...member, 
        source: 'current'
      };
    }
    
    return null;
  }, [id]);

  const handleBack = () => {
    const state = location.state || {};
    const from = state.from;
    
    if (from) {
      if (typeof from === 'string') {
        navigate(from);
        return;
      }
      if (typeof from === 'object' && (from.pathname || from.search)) {
        const pathname = from.pathname || '';
        const search = from.search || '';
        navigate(`${pathname}${search}`);
        return;
      }
    }

    const returnTab = state.returnTab ?? state.activeTab;
    if (Number.isInteger(returnTab)) {
      const base = isLeagueView ? '/league/staff' : '/staff';
      navigate(base, { state: { activeTab: returnTab } });
      return;
    }

    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`${isLeagueView ? '/league' : ''}/staff/${id}/edit`);
  };

  if (!staffMember) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Staff member not found</Typography>
      </Box>
    );
  }

  // Format staff data based on source
  const displayName = staffMember.source === 'talent' 
    ? `${staffMember.firstName} ${staffMember.lastName}`
    : `${staffMember.firstname} ${staffMember.lastname}`;

  const displayEmail = staffMember.email;
  const displayPhone = staffMember.phone;
  const displayCountry = staffMember.country || 'N/A';
  const displayCity = staffMember.city || 'N/A';

  // Generate avatar
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || 'SM';
  
  // Handle both picUrl (talent) and profilePic (current staff)
  const imageUrl = staffMember.picUrl || staffMember.profilePic;
  const avatarSrc = imageUrl || generateInitialsImage(displayName, 128, '#040037', '#ffffff');

  // Determine role/position
  const role = staffMember.source === 'talent' 
    ? staffMember.interestArea || 'N/A'
    : staffMember.role || 'N/A';

  // Status
  const status = staffMember.source === 'current' && staffMember.is_active ? 'Active' : 'Available';

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid var(--color-border-primary)',
          backgroundColor: 'var(--color-background-primary)',
        }}
      >
        {/* Top bar with back button */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            sx={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            {isLeagueView ? 'Registration / ' : ''}{staffMember.source === 'current' ? staffMember.currentEmployer : 'Talent Database'}
          </Typography>
        </Box>

        {/* Profile Header */}
        <Box sx={{ px: 3, pb: 3, display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          <Avatar
            src={avatarSrc}
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              fontWeight: 600,
              bgcolor: 'var(--color-background-secondary)',
              color: 'var(--color-text-primary)',
            }}
          >
            {initials}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'var(--color-text-primary)', mb: 1 }}>
              {displayName}
            </Typography>
            
            {/* Info Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, auto)', gap: 3, alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Email
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {displayEmail}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Phone
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {displayPhone}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Country
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {displayCountry}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  City
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {displayCity}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Role
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                  {role}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                  Status
                </Typography>
                <Chip
                  label={status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: status === 'Active' ? 'var(--color-success-background)' : 'var(--color-error-background)',
                    color: status === 'Active' ? 'var(--color-success-text)' : 'var(--color-error-text)',
                    border: 'none',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Details Component */}
      <StaffProfileDetails
        staffData={staffMember}
        isLeagueView={isLeagueView}
        onEdit={handleEdit}
      />
    </Box>
  );
}

export default StaffProfile;
