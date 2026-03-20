import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
} from '@mui/material';
import { ArrowBack, Edit as EditIcon } from '@mui/icons-material';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { generateInitialsImage } from '../utils/assetManager';
import StaffProfileDetails from '../components/StaffProfileDetails';
import MedinahStatusChip from '../components/StatusChip';
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

  // Find staff member from talent database, pending users, or current staff
  const staffMember = useMemo(() => {
    // Check pending users from localStorage first
    const pendingUsers = JSON.parse(localStorage.getItem('pendingStaffUsers') || '[]');
    let member = pendingUsers.find(s => s.id === id);
    if (member) {
      return { 
        ...member, 
        source: 'talent',
        isPending: true
      };
    }
    
    // Check talent database
    member = staffTalentData.find(s => s.id === id);
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

  const handleCompleteProfile = () => {
    navigate(`${isLeagueView ? '/league' : ''}/staff/new`);
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
  const displayPhone = staffMember.phone ? staffMember.phone : '-';
  const displayCountry = staffMember.country ? staffMember.country : '-';
  const displayCity = staffMember.city ? staffMember.city : '-';

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
    ? (staffMember.interestArea ? staffMember.interestArea : '-')
    : (staffMember.role ? staffMember.role : '-');

  // Status
  // App Status from Talent Database
  let status = 'Incomplete';
  if (staffMember.source === 'talent') {
    // Use the same logic as getStaffStatus in TalentDatabaseGrid
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const isIncomplete = requiredFields.some(field => {
      const value = staffMember[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });
    status = isIncomplete ? 'Incomplete' : 'Submitted';
  } else if (staffMember.source === 'current' && staffMember.is_active) {
    status = 'Active';
  }

  // Determine if this candidate is club-added (using same logic as TalentDatabaseGrid)
  const isClubAdded = useMemo(() => {
    if (staffMember.source !== 'talent') return false;
    const seed = staffMember.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isComplete = status === 'Submitted';
    return seed % 4 === 0 && isComplete;
  }, [staffMember.source, staffMember.id, status]);

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
            {staffMember.source === 'current' ? staffMember.currentEmployer : 'Talent Database'}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {staffMember.source === 'talent' && !staffMember.phone && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCompleteProfile}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                backgroundColor: '#3B4960',
                '&:hover': {
                  backgroundColor: '#2c3750',
                },
              }}
            >
              Complete Profile
            </Button>
          )}
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
              
              {/* Only show status for league view */}
              {isLeagueView && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'block' }}>
                    Status
                  </Typography>
                  {/* Use MedinahStatusChip for App Status styling */}
                  <MedinahStatusChip
                    status={status}
                    type={
                      status === 'Submitted' ? 'success'
                      : status === 'Incomplete' ? 'error'
                      : status === 'Active' ? 'success'
                      : 'default'
                    }
                    sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Profile Details Component */}
      <StaffProfileDetails
        staffData={staffMember}
        isLeagueView={isLeagueView}
        onEdit={
          // Don't show edit for incomplete profiles without phone
          staffMember.source === 'talent' && !staffMember.phone ? undefined :
          // For league view, always show edit
          isLeagueView ? handleEdit :
          // For club view, only show edit if candidate is club-added
          isClubAdded ? handleEdit : undefined
        }
      />
    </Box>
  );
}

export default StaffProfile;
