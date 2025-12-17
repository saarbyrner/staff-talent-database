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
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { DataGridPro } from '@mui/x-data-grid-pro';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { generateInitialsImage } from '../utils/assetManager';
import '../styles/design-tokens.css';

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

  // Determine if we're viewing from league context
  const isLeagueView = location.pathname.startsWith('/league');

  // Find staff member from either talent database or current staff
  const staffMember = useMemo(() => {
    // Check talent database first
    let member = staffTalentData.find(s => s.id === id);
    if (member) {
      return { ...member, source: 'talent' };
    }
    
    // Check current staff
    member = currentStaffData.find(s => s.id === parseInt(id));
    if (member) {
      return { ...member, source: 'current' };
    }
    
    return null;
  }, [id]);

  const handleBack = () => {
    const basePath = isLeagueView ? '/league/staff' : '/staff';
    // Use the returnTab from navigation state, or default based on source
    const returnTab = location.state?.returnTab ?? (staffMember?.source === 'current' ? 0 : 1);
    navigate(basePath, { state: { activeTab: returnTab } });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
          {staffMember.source === 'current' && <Tab label="Employment" />}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {activeTab === 0 && <ProfileDetailsTab staffMember={staffMember} />}
        {activeTab === 1 && <ExperienceTab staffMember={staffMember} />}
        {activeTab === 2 && <QualificationsTab staffMember={staffMember} />}
        {activeTab === 3 && <PreferencesTab staffMember={staffMember} />}
        {activeTab === 4 && staffMember.source === 'current' && <EmploymentTab staffMember={staffMember} />}
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

export default StaffProfile;
