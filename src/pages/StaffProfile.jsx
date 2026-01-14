import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Divider,
  TextField,
  Button,
  LinearProgress,
  Grid,
} from '@mui/material';
import { ArrowBack, AddOutlined, DeleteOutlined, EditOutlined, TrendingUp, TrendingDown } from '@mui/icons-material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { generateInitialsImage } from '../utils/assetManager';
import { formatDistance } from 'date-fns';
import '../styles/design-tokens.css';

// Helper to generate consistent coaching statistics
const generateStats = (id) => {
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const winRate = 35 + Math.floor(random(1) * 40); // 35-75%
  const draws = Math.floor(random(2) * 20); // 0-20%
  const ppm = ((winRate * 3) + draws) / 100;
  
  const age = 32 + Math.floor(random(3) * 25); // 32-57
  const maxExp = age - 21;
  const yearsExp = Math.min(3 + Math.floor(random(4) * 25), maxExp);

  return {
    age,
    yearsExp,
    winRate: winRate,
    ppm: ppm.toFixed(2),
    trophies: Math.floor(random(5) * 8), // 0-7
    xgDiff: (random(6) * 1.5 - 0.5).toFixed(2), // -0.5 to +1.0
    squadValuePerf: (random(7) * 40 - 10).toFixed(1), // -10% to +30%
    possession: 40 + Math.floor(random(8) * 30), // 40-70%
    ppda: (6 + random(9) * 10).toFixed(1), // 6.0 - 16.0
    u23Minutes: Math.floor(random(10) * 40), // 0-40%
    academyDebuts: Math.floor(random(11) * 12), // 0-11
  };
};

/**
 * Staff Profile Detail Page
 * Displays detailed information about a staff member with tabs for different sections
 * Follows the player profile pattern with header, tabs, and detail views
 */
function StaffProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  
  // Notes state management
  const [staffNotes, setStaffNotes] = useState({});

  // Determine if we're viewing from league context
  const isLeagueView = location.pathname.startsWith('/league');

  // Find staff member from either talent database or current staff
  const staffMember = useMemo(() => {
    // Check talent database first
    let member = staffTalentData.find(s => s.id === id);
    if (member) {
      // Check multiple indicators that someone is a coach
      const currentRole = member.currentEmployer?.split('-')[1]?.trim() || '';
      const interestArea = member.interestArea || '';
      const hasCoachingRoles = member.coachingRoles && member.coachingRoles.length > 0;
      const hasCoachingExp = member.proCoachExp || member.mlsCoachExp;
      const hasCoachingLicenses = member.coachingLicenses && member.coachingLicenses.length > 0;
      
      // Consider someone a coach if they have ANY coaching-related data
      const isCoach = currentRole.toLowerCase().includes('coach') || 
                      currentRole.toLowerCase().includes('manager') || 
                      interestArea.toLowerCase().includes('coach') ||
                      hasCoachingRoles ||
                      hasCoachingExp ||
                      hasCoachingLicenses;
      
      return { 
        ...member, 
        source: 'talent',
        coachingStats: isCoach ? generateStats(member.id) : null
      };
    }
    
    // Check current staff
    member = currentStaffData.find(s => s.id === parseInt(id));
    if (member) {
      const role = member.role || '';
      const isCoach = role.toLowerCase().includes('coach') || role.toLowerCase().includes('manager');
      
      return { 
        ...member, 
        source: 'current',
        coachingStats: isCoach ? generateStats(String(member.id)) : null
      };
    }
    
    return null;
  }, [id]);

  const handleBack = () => {
    // Prefer explicit navigation hints when available.
    // 1) `location.state.from` may be a string or a location-like object (preserve pathname/search and nested state)
    // 2) `location.state.returnTab` or `location.state.activeTab` may be provided by `StaffDatabase` to restore the selected tab
    const state = location.state || {};

    // Handle explicit `from` provided as string or location-like object
    const from = state.from;
    if (from) {
      if (typeof from === 'string') {
        navigate(from);
        return;
      }

      if (typeof from === 'object' && (from.pathname || from.search)) {
        const pathname = from.pathname || '';
        const search = from.search || '';
        const nestedActive = from.state && (from.state.activeTab ?? from.state.returnTab);
        if (Number.isInteger(nestedActive)) {
          navigate(`${pathname}${search}`, { state: { activeTab: nestedActive } });
        } else {
          navigate(`${pathname}${search}`);
        }
        return;
      }
    }

    // Handle legacy/alternate property used by StaffDatabase
    const returnTab = state.returnTab ?? state.activeTab;
    if (Number.isInteger(returnTab)) {
      const base = isLeagueView ? '/league/staff' : '/staff';
      navigate(base, { state: { activeTab: returnTab } });
      return;
    }

    // Fallback to history back
    navigate(-1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Notes handlers
  const handleAddNote = (staffId, noteText) => {
    const newNote = {
      id: `note-${Date.now()}`,
      staffId,
      text: noteText,
      authorName: 'Current User',
      authorInitials: 'CU',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setStaffNotes(prev => ({
      ...prev,
      [staffId]: [...(prev[staffId] || []), newNote]
    }));
  };
  
  const handleUpdateNote = (staffId, noteId, newText) => {
    setStaffNotes(prev => ({
      ...prev,
      [staffId]: (prev[staffId] || []).map(note =>
        note.id === noteId
          ? { ...note, text: newText, updatedAt: new Date().toISOString() }
          : note
      )
    }));
  };
  
  const handleDeleteNote = (staffId, noteId) => {
    setStaffNotes(prev => ({
      ...prev,
      [staffId]: (prev[staffId] || []).filter(note => note.id !== noteId)
    }));
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
      {/* Header Section */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: '1px solid var(--color-border-primary)',
          backgroundColor: 'var(--color-background-primary)',
        }}
      >
        {/* Top bar with back button and title */}
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleBack}
            size="small"
            sx={{ color: 'var(--color-text-secondary)' }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            Back
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton 
            onClick={() => navigate(`${isLeagueView ? '/league' : ''}/staff/${id}/edit`)}
            size="small" 
            sx={{ color: 'var(--color-text-secondary)' }}
          >
            <Typography variant="body2">Edit</Typography>
          </IconButton>
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

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 'auto',
              px: 2,
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Profile Details" />
          <Tab label="Experience" />
          <Tab label="Qualifications" />
          <Tab label="Preferences" />
          <Tab label="Notes" />
          {staffMember.coachingStats && <Tab label="Coaching Performance" />}
          {staffMember.source === 'current' && <Tab label="Employment" />}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {activeTab === 0 && <ProfileDetailsTab staffMember={staffMember} />}
        {activeTab === 1 && <ExperienceTab staffMember={staffMember} />}
        {activeTab === 2 && <QualificationsTab staffMember={staffMember} />}
        {activeTab === 3 && <PreferencesTab staffMember={staffMember} />}
        {activeTab === 4 && (
          <NotesTab
            staffMember={staffMember}
            notes={staffNotes[staffMember.id] || []}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
        {activeTab === 5 && staffMember.coachingStats && <CoachingPerformanceTab staffMember={staffMember} />}
        {activeTab === (staffMember.coachingStats ? 6 : 5) && staffMember.source === 'current' && <EmploymentTab staffMember={staffMember} />}
      </Box>
    </Box>
  );
}

// Tab Components
function ProfileDetailsTab({ staffMember }) {
  const isCurrentStaff = staffMember.source === 'current';
  
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Contact Information
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Email</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.email}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Phone</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.phone}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Country</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.country || 'N/A'}</Typography>
        
        {staffMember.state && (
          <>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>State</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.state}</Typography>
          </>
        )}
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>City</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.city || 'N/A'}</Typography>
        
        {!isCurrentStaff && (
          <>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>US Work Authorization</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
              {staffMember.workAuthUS ? 'Yes' : 'No'}
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Canada Work Authorization</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
              {staffMember.workAuthCA ? 'Yes' : 'No'}
            </Typography>
          </>
        )}
        
        {staffMember.gender && (
          <>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Gender</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.gender}</Typography>
          </>
        )}
        
        {staffMember.ethnicity && (
          <>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Ethnicity</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.ethnicity}</Typography>
          </>
        )}
      </Box>
      
      {!isCurrentStaff && staffMember.hasAgent && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Agent Information
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Agent Name</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.agentName}</Typography>
            
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Agency Name</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.agencyName}</Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}

function ExperienceTab({ staffMember }) {
  const isCurrentStaff = staffMember.source === 'current';
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Playing Experience */}
      {!isCurrentStaff && staffMember.proPlayerExp && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Playing Experience
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Professional Player</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>Yes</Typography>
            
            {staffMember.mlsPlayerExp && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>MLS Experience</Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                  {staffMember.mlsClubsPlayed?.join(', ') || 'Yes'}
                </Typography>
              </>
            )}
            
            {staffMember.otherPlayerExp && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Other Experience</Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                  {staffMember.otherPlayerExp}
                </Typography>
              </>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Coaching Experience */}
      {!isCurrentStaff && staffMember.proCoachExp && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Coaching Experience
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Professional Coach</Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>Yes</Typography>
            
            {staffMember.mlsCoachExp && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>MLS Experience</Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                  {staffMember.mlsCoachRoles?.join(', ') || 'Yes'}
                </Typography>
                
                {staffMember.mlsClubsCoached?.length > 0 && (
                  <>
                    <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>MLS Clubs</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {staffMember.mlsClubsCoached.map((club, idx) => (
                        <Chip key={idx} label={club} size="small" />
                      ))}
                    </Box>
                  </>
                )}
              </>
            )}
            
            {staffMember.mlsCoachingExpList?.length > 0 && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Experience Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {staffMember.mlsCoachingExpList.map((exp, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                      {exp}
                    </Typography>
                  ))}
                </Box>
              </>
            )}
            
            {staffMember.nonMlsCoachExp?.length > 0 && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Other Experience</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {staffMember.nonMlsCoachExp.map((exp, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                      {exp}
                    </Typography>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Sporting/Executive Experience */}
      {!isCurrentStaff && staffMember.sportingExp && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Sporting/Executive Experience
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
            {staffMember.sportingVertical?.length > 0 && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Specializations</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {staffMember.sportingVertical.map((vert, idx) => (
                    <Chip key={idx} label={vert} size="small" />
                  ))}
                </Box>
              </>
            )}
            
            {staffMember.mlsClubsSporting?.length > 0 && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>MLS Clubs</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {staffMember.mlsClubsSporting.map((club, idx) => (
                    <Chip key={idx} label={club} size="small" />
                  ))}
                </Box>
              </>
            )}
            
            {staffMember.nonMlsSportingExp?.length > 0 && (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Experience</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {staffMember.nonMlsSportingExp.map((exp, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                      {exp}
                    </Typography>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      )}
      
      {/* Employment History */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Employment History
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
          {!isCurrentStaff ? (
            <>
              {staffMember.currentlyEmployed !== undefined && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Currently Employed</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {staffMember.currentlyEmployed ? 'Yes' : 'No'}
                  </Typography>
                </>
              )}
              
              {staffMember.currentEmployer && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Current</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {staffMember.currentEmployer}
                  </Typography>
                </>
              )}
              
              {staffMember.prevEmployer1 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Previous</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {staffMember.prevEmployer1}
                  </Typography>
                </>
              )}
              
              {staffMember.prevEmployer2 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Previous</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {staffMember.prevEmployer2}
                  </Typography>
                </>
              )}
              
              {staffMember.prevEmployer3 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Previous</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {staffMember.prevEmployer3}
                  </Typography>
                </>
              )}
              
              {staffMember.prevEmployer4 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Previous</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {staffMember.prevEmployer4}
                  </Typography>
                </>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Current Organization</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                {staffMember.organisation_name}
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Department</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                {staffMember.department}
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Hire Date</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                {staffMember.hire_date ? new Date(staffMember.hire_date).toLocaleDateString() : 'N/A'}
              </Typography>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

function QualificationsTab({ staffMember }) {
  const isCurrentStaff = staffMember.source === 'current';
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Education */}
      {!isCurrentStaff && (staffMember.degree || staffMember.highestDegree) && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Education
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
            {staffMember.highestDegree?.length > 0 ? (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Degrees</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {staffMember.highestDegree.map((deg, idx) => (
                    <Chip key={idx} label={deg} size="small" />
                  ))}
                </Box>
              </>
            ) : staffMember.degree ? (
              <>
                <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Degree</Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.degree}</Typography>
              </>
            ) : null}
          </Box>
        </Paper>
      )}
      
      {/* Licenses & Certifications */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Licenses & Certifications
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
          {!isCurrentStaff ? (
            <>
              {staffMember.coachingLicenses?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Coaching Licenses</Typography>
                  <Box>
                    {staffMember.coachingLicenses.map((license, index) => (
                      <Chip
                        key={index}
                        label={license}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              {staffMember.sportingCerts?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Sporting Certifications</Typography>
                  <Box>
                    {staffMember.sportingCerts.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              {staffMember.sportingDirectorCerts?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Sporting Director Certifications</Typography>
                  <Box>
                    {staffMember.sportingDirectorCerts.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              {staffMember.mlsPrograms?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>MLS Programs (Legacy)</Typography>
                  <Box>
                    {staffMember.mlsPrograms.map((program, index) => (
                      <Chip
                        key={index}
                        label={program}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              {staffMember.mlsProgramming?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>MLS Programming</Typography>
                  <Box>
                    {staffMember.mlsProgramming.map((program, index) => (
                      <Chip
                        key={index}
                        label={program}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              {staffMember.otherLicensesList && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Other Licenses</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {staffMember.otherLicensesList}
                  </Typography>
                </>
              )}
            </>
          ) : (
            <>
              {staffMember.qualifications?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Qualifications</Typography>
                  <Box>
                    {staffMember.qualifications.map((qual, index) => (
                      <Chip
                        key={index}
                        label={qual}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
              
              {staffMember.specializations?.length > 0 && (
                <>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Specializations</Typography>
                  <Box>
                    {staffMember.specializations.map((spec, index) => (
                      <Chip
                        key={index}
                        label={spec}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Paper>
      
      {/* Languages */}
      {!isCurrentStaff && staffMember.languages?.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Languages
          </Typography>
          <Box>
            {staffMember.languages.map((language, index) => (
              <Chip
                key={index}
                label={language}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

function PreferencesTab({ staffMember }) {
  const isCurrentStaff = staffMember.source === 'current';
  
  if (isCurrentStaff) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
          No preference data available for current staff
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Role Preferences */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Role Preferences
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Interest Area</Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
            {staffMember.interestArea || 'N/A'}
          </Typography>
          
          {staffMember.coachingRoles?.length > 0 && (
            <>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Coaching Roles</Typography>
              <Box>
                {staffMember.coachingRoles.map((role, index) => (
                  <Chip key={index} label={role} size="small" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </>
          )}
          
          {staffMember.execRoles?.length > 0 && (
            <>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Executive Roles</Typography>
              <Box>
                {staffMember.execRoles.map((role, index) => (
                  <Chip key={index} label={role} size="small" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </>
          )}
          
          {staffMember.techRoles?.length > 0 && (
            <>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Technical Roles</Typography>
              <Box>
                {staffMember.techRoles.map((role, index) => (
                  <Chip key={index} label={role} size="small" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Paper>
      
      {/* Location Preferences */}
      {staffMember.relocation?.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Location Preferences
          </Typography>
          <Box>
            {staffMember.relocation.map((location, index) => (
              <Chip key={index} label={location} size="small" sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

function EmploymentTab({ staffMember }) {
  if (staffMember.source !== 'current') {
    return null;
  }
  
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Employment Details
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 2, rowGap: 2 }}>
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Username</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.username}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Role</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.role}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Permission Group</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.permission_group}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Department</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.department}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Organization</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.organisation_name}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Hire Date</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
          {staffMember.hire_date ? new Date(staffMember.hire_date).toLocaleDateString() : 'N/A'}
        </Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Emergency Contact</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.emergency_contact || 'N/A'}</Typography>
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Status</Typography>
        <Chip
          label={staffMember.is_active ? 'Active' : 'Inactive'}
          size="small"
          color={staffMember.is_active ? 'success' : 'default'}
        />
        
        <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Admin Rights</Typography>
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>{staffMember.is_admin ? 'Yes' : 'No'}</Typography>
        
        {staffMember.squads?.length > 0 && (
          <>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>Assigned Squads</Typography>
            <Box>
              {staffMember.squads.map((squad, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                    {squad.squad_name} - {squad.role}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}

function NotesTab({ staffMember, notes = [], onAddNote, onUpdateNote, onDeleteNote }) {
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      onAddNote(staffMember.id, newNoteText.trim());
      setNewNoteText('');
    }
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditNoteText(note.text);
  };

  const handleSaveEdit = (noteId) => {
    if (editNoteText.trim()) {
      onUpdateNote(staffMember.id, noteId, editNoteText.trim());
      setEditingNoteId(null);
      setEditNoteText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(staffMember.id, noteId);
    }
  };

  // Sort notes by date, newest first
  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Info Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: 'var(--color-info-background)',
          border: '1px solid var(--color-border-primary)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
          Notes are private to your organization and will not be shared with other clubs or the staff member.
        </Typography>
      </Paper>

      {/* New Note Input */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Add New Note
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Enter your note here..."
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'var(--color-background-secondary)',
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={handleAddNote}
          disabled={!newNoteText.trim()}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Add Note
        </Button>
      </Paper>

      {/* Notes List */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          All Notes ({sortedNotes.length})
        </Typography>

        {sortedNotes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid var(--color-border-primary)',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            <Typography variant="body2">No notes yet</Typography>
            <Typography variant="caption">Add your first note above</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sortedNotes.map((note) => (
              <Paper
                key={note.id}
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                {/* Note Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: '0.875rem',
                      bgcolor: 'var(--color-primary)',
                    }}
                  >
                    {note.authorInitials || 'U'}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {note.authorName || 'Unknown User'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                      {formatDistance(new Date(note.createdAt), new Date(), { addSuffix: true })}
                      {note.updatedAt && note.updatedAt !== note.createdAt && ' (edited)'}
                    </Typography>
                  </Box>
                  {!editingNoteId && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => handleStartEdit(note)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(note.id)} color="error">
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/* Note Content */}
                {editingNoteId === note.id ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      variant="outlined"
                      size="small"
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'var(--color-background-secondary)',
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSaveEdit(note.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Save
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleCancelEdit}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      pl: 7, // Indent to align with author name
                    }}
                  >
                    {note.text}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// Coaching Performance Tab with Visualizations
function CoachingPerformanceTab({ staffMember }) {
  const stats = staffMember.coachingStats;
  if (!stats) return null;
  const primaryLicense = staffMember.coachingLicenses?.[0] || 'None';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Career Overview</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>{stats.age}</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>Years Old</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>{stats.yearsExp}</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>Years Experience</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>{stats.trophies}</Typography>
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>Trophies Won</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Chip label={primaryLicense} sx={{ height: 36, fontSize: '0.875rem', fontWeight: 600, px: 2 }} color="primary" variant="outlined" />
              <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>Highest License</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Performance Metrics</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Win Rate</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: stats.winRate > 55 ? 'success.main' : stats.winRate > 40 ? 'warning.main' : 'error.main' }}>{stats.winRate}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={stats.winRate} sx={{ height: 12, borderRadius: 6, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: stats.winRate > 55 ? 'success.main' : stats.winRate > 40 ? 'warning.main' : 'error.main', borderRadius: 6 } }} />
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mt: 0.5, display: 'block' }}>{stats.winRate > 55 ? 'Excellent' : stats.winRate > 40 ? 'Good' : 'Needs Improvement'}</Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Points Per Match (PPM)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--color-primary)' }}>{stats.ppm}</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>Average points earned per match</Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>Average Possession</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{stats.possession}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={stats.possession} sx={{ height: 12, borderRadius: 6, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: 'info.main', borderRadius: 6 } }} />
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mt: 0.5, display: 'block' }}>{stats.possession > 55 ? 'Possession-based' : stats.possession < 45 ? 'Counter-attacking' : 'Balanced'}</Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>U23 Playing Time</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: stats.u23Minutes > 25 ? 'success.main' : 'text.primary' }}>{stats.u23Minutes}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={stats.u23Minutes} sx={{ height: 12, borderRadius: 6, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { bgcolor: stats.u23Minutes > 25 ? 'success.main' : 'warning.main', borderRadius: 6 } }} />
            <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mt: 0.5, display: 'block' }}>Minutes given to U23 players</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Advanced Analytics</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: parseFloat(stats.xgDiff) > 0 ? 'success.lighter' : 'error.lighter', border: '1px solid', borderColor: parseFloat(stats.xgDiff) > 0 ? 'success.main' : 'error.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {parseFloat(stats.xgDiff) > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                <Typography variant="h4" sx={{ fontWeight: 700, color: parseFloat(stats.xgDiff) > 0 ? 'success.main' : 'error.main' }}>{parseFloat(stats.xgDiff) > 0 ? '+' : ''}{stats.xgDiff}</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>xG Differential</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Goals vs Expected</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: parseFloat(stats.squadValuePerf) > 0 ? 'success.lighter' : 'error.lighter', border: '1px solid', borderColor: parseFloat(stats.squadValuePerf) > 0 ? 'success.main' : 'error.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {parseFloat(stats.squadValuePerf) > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                <Typography variant="h4" sx={{ fontWeight: 700, color: parseFloat(stats.squadValuePerf) > 0 ? 'success.main' : 'error.main' }}>{parseFloat(stats.squadValuePerf) > 0 ? '+' : ''}{stats.squadValuePerf}%</Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Squad Value Perf</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>vs League Avg</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.lighter', border: '1px solid var(--color-border-primary)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>{stats.ppda}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>PPDA</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Pressing Intensity</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.lighter', border: '1px solid var(--color-border-primary)' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>{stats.academyDebuts}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Academy Debuts</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Youth Promoted</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default StaffProfile;
