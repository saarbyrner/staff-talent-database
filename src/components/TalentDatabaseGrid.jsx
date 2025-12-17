import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Chip, Avatar, Link, Stack, Typography, Tooltip, Button, IconButton } from '@mui/material';
import {
  DataGridPro as DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro';
import {
  CheckOutlined,
  CloseOutlined,
  DescriptionOutlined,
  LinkOutlined,
  AddOutlined,
  MailOutline,
  EditOutlined,
  LocalOfferOutlined,
  LabelOutlined,
} from '@mui/icons-material';
import staffData from '../data/staff_talent.json';
import { generateInitialsImage } from '../utils/assetManager';
import BulkEditBar from './BulkEditBar';
import TagChip from './TagChip';
import TagSelector from './TagSelector';
import TagManagementDrawer from './TagManagementDrawer';
import '../styles/design-tokens.css';

export const CustomToolbar = React.forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onInviteClick, onManageTags } = props;
  
  const handleAddClick = () => {
    const basePath = location.pathname.startsWith('/league') ? '/league/staff' : '/staff';
    navigate(`${basePath}/new`);
  };
  
  return (
    <Box
      ref={ref}
      className="custom-data-grid-toolbar"
      sx={{
        height: '56px',
        px: 2,
        borderBottom: '1px solid var(--color-border-primary)',
        backgroundColor: 'var(--color-background-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        '& .MuiButtonBase-root': {
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          minWidth: 'auto',
          padding: '4px',
          '&:hover': {
            backgroundColor: 'var(--color-background-tertiary)'
          }
        }
      }}>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <GridToolbarQuickFilter 
          sx={{
            '& .MuiInputBase-root': {
              backgroundColor: 'var(--color-background-primary)',
              borderRadius: '4px',
              height: '36px',
              width: '240px',
            }
          }}
          debounceMs={150}
        />
        {onManageTags && (
          <Button
            variant="outlined"
            startIcon={<LabelOutlined />}
            onClick={onManageTags}
            sx={{
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              minWidth: 'auto',
              padding: '6px 12px',
              '&:hover': {
                borderColor: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-tertiary)'
              }
            }}
          >
            Tags
          </Button>
        )}
        {onInviteClick && (
          <Button
            variant="outlined"
            startIcon={<MailOutline />}
            onClick={onInviteClick}
            sx={{
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              minWidth: 'auto',
              padding: '6px 12px',
              '&:hover': {
                borderColor: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-tertiary)'
              }
            }}
          >
            Invite
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={handleAddClick}
          sx={{
            textTransform: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff !important',
            minWidth: 'auto',
            padding: '6px 12px',
            '&:hover': {
              backgroundColor: 'var(--color-primary-hover)',
              color: '#ffffff !important'
            }
          }}
        >
          Add
        </Button>
      </Box>
    </Box>
  );
});

CustomToolbar.displayName = 'CustomToolbar';

const BooleanCell = ({ value }) => {
  if (value === true) {
    return <Chip icon={<CheckOutlined />} label="Yes" size="small" color="success" variant="outlined" />;
  }
  if (value === false) {
    return <Chip icon={<CloseOutlined />} label="No" size="small" color="default" variant="outlined" />;
  }
  return null;
};

const ArrayCell = ({ value }) => {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto', py: 1 }}>
      {value.map((item, index) => (
        <Chip key={index} label={item} size="small" variant="outlined" />
      ))}
    </Stack>
  );
};

const getInitials = (name = '') => (
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || '—'
);

const LinkCell = ({ value, type, name = '' }) => {
  if (type === 'avatar') {
    const hasRemoteImage = typeof value === 'string' && value.length > 0 && !value.includes('fake-s3.mls.com');
    const initials = getInitials(name);
    const fallbackSrc = generateInitialsImage(name || 'Staff Candidate', 128, '#040037', '#ffffff');
    const avatarSrc = hasRemoteImage ? value : undefined;

    return (
      <Avatar
        src={avatarSrc}
        sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 600, bgcolor: 'var(--color-background-secondary)', color: 'var(--color-text-primary)' }}
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

  if (!value) return null;

  return (
    <Tooltip title="View Document">
      <Link href={value} target="_blank" rel="noopener noreferrer">
        <DescriptionOutlined color="primary" />
      </Link>
    </Tooltip>
  );
};

const createColumns = (onTagsClick) => [
  {
    field: 'picUrl',
    headerName: '',
    width: 72,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <LinkCell
        value={params.value}
        type="avatar"
        name={`${params.row.firstName || ''} ${params.row.lastName || ''}`.trim()}
      />
    )
  },
  // CONTACT INFO
  { field: 'firstName', headerName: 'First Name', width: 150 },
  { field: 'lastName', headerName: 'Last Name', width: 150 },
  { field: 'phone', headerName: 'Phone', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
  {
    field: 'tags',
    headerName: 'Tags',
    width: 250,
    sortable: false,
    renderCell: (params) => {
      const tags = params.value || [];
      return (
        <Stack 
          direction="row" 
          spacing={0.5} 
          alignItems="center"
          sx={{ 
            py: 1,
            width: '100%',
            overflow: 'hidden'
          }}
        >
          {tags.slice(0, 3).map((tag) => (
            <TagChip key={tag} label={tag} size="small" />
          ))}
          {tags.length > 3 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              +{tags.length - 3}
            </Typography>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onTagsClick(params.row.id, e);
            }}
            sx={{
              ml: 'auto',
              color: 'var(--color-text-secondary)',
              '&:hover': {
                color: 'var(--color-primary)',
              }
            }}
          >
            <LocalOfferOutlined fontSize="small" />
          </IconButton>
        </Stack>
      );
    }
  },
  { 
    field: 'profilePrivacy', 
    headerName: 'Profile Privacy', 
    width: 140,
    renderCell: (params) => {
      const value = params.value || 'Public';
      const isPrivate = value === 'Private';
      return (
        <Chip 
          label={value} 
          size="small" 
          color={isPrivate ? 'default' : 'success'} 
          variant="outlined"
          sx={{
            fontWeight: 500,
            ...(isPrivate && {
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-secondary)'
            })
          }}
        />
      );
    }
  },
  { 
    field: 'location', 
    headerName: 'Location (City, State, Country)', 
    width: 200,
    valueGetter: (params) => {
      const { city, state, country } = params.row;
      return [city, state, country].filter(Boolean).join(', ');
    }
  },
  { field: 'state', headerName: 'State', width: 120 },
  { 
    field: 'workAuthUS', 
    headerName: 'US Sponsorship?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'workAuthCA', 
    headerName: 'CA Sponsorship?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },

  // VOLUNTARY ID
  { field: 'gender', headerName: 'Gender', width: 120 },
  { field: 'ethnicity', headerName: 'Ethnicity', width: 180 },

  // AGENT
  { 
    field: 'hasAgent', 
    headerName: 'Has Agent?', 
    width: 120, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { field: 'agentName', headerName: 'Agent Name', width: 150 },
  { field: 'agencyName', headerName: 'Agency Name', width: 150 },

  // EXPERIENCE
  { 
    field: 'proPlayerExp', 
    headerName: 'Pro Player Exp?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsPlayerExp', 
    headerName: 'MLS Player Exp?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsClubsPlayed', 
    headerName: 'MLS Clubs (Played)', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { field: 'otherPlayerExp', headerName: 'Other Exp', width: 250 },

  // INTERESTS
  { field: 'interestArea', headerName: 'Area of Interest', width: 180 },
  { 
    field: 'roles', 
    headerName: 'Roles', 
    width: 300, 
    valueGetter: (params) => {
      const { coachingRoles = [], execRoles = [], techRoles = [] } = params.row;
      return [...coachingRoles, ...execRoles, ...techRoles];
    },
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'relocation', 
    headerName: 'Willing to Relocate', 
    width: 180, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },

  // COACHING HIST
  { 
    field: 'proCoachExp', 
    headerName: 'Pro Coach Exp?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsCoachExp', 
    headerName: 'MLS Coach Exp?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsCoachRoles', 
    headerName: 'MLS Roles Held', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'mlsClubsCoached', 
    headerName: 'MLS Clubs (Coached)', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'nonMlsCoachExp', 
    headerName: 'Non-MLS Exp', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },

  // SPORTING HIST
  { 
    field: 'sportingExp', 
    headerName: 'Sporting Exp?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsSportingExp', 
    headerName: 'MLS Sporting Exp?', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsClubsSporting', 
    headerName: 'MLS Clubs (Sporting)', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'nonMlsSportingExp', 
    headerName: 'Non-MLS Exp', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'sportingVertical', 
    headerName: 'Vertical', 
    width: 150, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },

  // EMPLOYMENT
  { field: 'currentEmployer', headerName: 'Current Employer', width: 200 },
  { field: 'prevEmployer1', headerName: 'Previous Employer 1', width: 200 },
  { field: 'prevEmployer2', headerName: 'Previous Employer 2', width: 200 },

  // EDUCATION
  { field: 'degree', headerName: 'Degree', width: 150 },
  { 
    field: 'mlsPrograms', 
    headerName: 'MLS Programs', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'coachingLicenses', 
    headerName: 'Coaching Licenses', 
    width: 250, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'sportingCerts', 
    headerName: 'Sporting Certs', 
    width: 150, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'languages', 
    headerName: 'Languages', 
    width: 150, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },

  // PROFESSIONAL COACHING
  { 
    field: 'proCoachExpUpdate', 
    headerName: 'Has Coaching Experience Update', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'prevMlsCoachExp', 
    headerName: 'Previous MLS Coaching Experience', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsCoachingExpList', 
    headerName: 'MLS Coaching Experience Types', 
    width: 250, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'mlsClubsCoached', 
    headerName: 'MLS Clubs Coached', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'nonMlsCoachExp', 
    headerName: 'Non-MLS Coaching Experience', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },

  // PROFESSIONAL SPORTING
  { 
    field: 'proSportingExpUpdate', 
    headerName: 'Has Sporting Experience Update', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'prevMlsSportingExp', 
    headerName: 'Previous MLS Sporting Experience', 
    width: 150, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'mlsClubsSporting', 
    headerName: 'MLS Clubs (Sporting)', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'nonMlsSportingExp', 
    headerName: 'Non-MLS Sporting Experience', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'sportingVertical', 
    headerName: 'Sporting Vertical', 
    width: 180, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },

  // EMPLOYMENT HISTORY
  { 
    field: 'currentlyEmployed', 
    headerName: 'Currently Employed', 
    width: 120, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'currentEmployer', 
    headerName: 'Current Employer', 
    width: 250 
  },
  { 
    field: 'prevEmployer1', 
    headerName: 'Previous Employer 1', 
    width: 250 
  },
  { 
    field: 'prevEmployer2', 
    headerName: 'Previous Employer 2', 
    width: 250 
  },
  { 
    field: 'prevEmployer3', 
    headerName: 'Previous Employer 3', 
    width: 250 
  },
  { 
    field: 'prevEmployer4', 
    headerName: 'Previous Employer 4', 
    width: 250 
  },

  // EDUCATION EXPANDED
  { 
    field: 'highestDegree', 
    headerName: 'Highest Degree', 
    width: 180, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'mlsProgramming', 
    headerName: 'MLS Programming Experience', 
    width: 200, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'sportingDirectorCerts', 
    headerName: 'Sporting Director Certifications', 
    width: 180, 
    renderCell: (params) => <ArrayCell value={params.value} /> 
  },
  { 
    field: 'otherLicenses', 
    headerName: 'Has Other Licenses', 
    width: 120, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'otherLicensesList', 
    headerName: 'Other Licenses List', 
    width: 200 
  },

  // DOCS
  { 
    field: 'coachingLicenseDoc', 
    headerName: 'Coaching License Document', 
    width: 150, 
    renderCell: (params) => params.value ? <LinkCell value={params.value} type="link" /> : null 
  },
  { 
    field: 'otherCertsDoc', 
    headerName: 'Other Certifications Document', 
    width: 150, 
    renderCell: (params) => params.value ? <LinkCell value={params.value} type="link" /> : null 
  },
  { 
    field: 'resumeUrl', 
    headerName: 'Resume', 
    width: 100, 
    renderCell: (params) => <LinkCell value={params.value} type="link" /> 
  },
  // picUrl moved to front as a headerless avatar column
];

const columnGroupingModel = [
  {
    groupId: 'Contact Info',
    children: [
      { field: 'picUrl' },
      { field: 'firstName' },
      { field: 'lastName' },
      { field: 'phone' },
      { field: 'email' },
      { field: 'tags' },
      { field: 'profilePrivacy' },
      { field: 'location' },
      { field: 'state' },
      { field: 'workAuthUS' },
      { field: 'workAuthCA' },
    ],
  },
  {
    groupId: 'Voluntary ID',
    children: [
      { field: 'gender' },
      { field: 'ethnicity' },
    ],
  },
  {
    groupId: 'Agent',
    children: [
      { field: 'hasAgent' },
      { field: 'agentName' },
      { field: 'agencyName' },
    ],
  },
  {
    groupId: 'Playing Experience',
    children: [
      { field: 'proPlayerExp' },
      { field: 'mlsPlayerExp' },
      { field: 'mlsClubsPlayed' },
      { field: 'otherPlayerExp' },
    ],
  },
  {
    groupId: 'Interests',
    children: [
      { field: 'interestArea' },
      { field: 'roles' },
      { field: 'relocation' },
    ],
  },
  {
    groupId: 'Coaching',
    children: [
      { field: 'proCoachExp' },
      { field: 'mlsCoachExp' },
      { field: 'mlsCoachRoles' },
      { field: 'mlsClubsCoached' },
      { field: 'nonMlsCoachExp' },
      { field: 'proCoachExpUpdate' },
      { field: 'prevMlsCoachExp' },
      { field: 'mlsCoachingExpList' },
    ],
  },
  {
    groupId: 'Sporting',
    children: [
      { field: 'sportingExp' },
      { field: 'mlsSportingExp' },
      { field: 'mlsClubsSporting' },
      { field: 'nonMlsSportingExp' },
      { field: 'sportingVertical' },
      { field: 'proSportingExpUpdate' },
      { field: 'prevMlsSportingExp' },
    ],
  },
  {
    groupId: 'Employment',
    children: [
      { field: 'currentlyEmployed' },
      { field: 'currentEmployer' },
      { field: 'prevEmployer1' },
      { field: 'prevEmployer2' },
      { field: 'prevEmployer3' },
      { field: 'prevEmployer4' },
    ],
  },
  {
    groupId: 'Education',
    children: [
      { field: 'degree' },
      { field: 'highestDegree' },
      { field: 'mlsPrograms' },
      { field: 'mlsProgramming' },
      { field: 'coachingLicenses' },
      { field: 'sportingCerts' },
      { field: 'sportingDirectorCerts' },
      { field: 'otherLicenses' },
      { field: 'otherLicensesList' },
      { field: 'languages' },
    ],
  },
  {
    groupId: 'Documents',
    children: [
      { field: 'resumeUrl' },
      { field: 'picUrl' },
      { field: 'coachingLicenseDoc' },
      { field: 'otherCertsDoc' },
    ],
  },
];

export default function TalentDatabaseGrid({ onInviteClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [bulkEditOpen, setBulkEditOpen] = React.useState(false);
  const [localStaffData, setLocalStaffData] = React.useState(staffData);
  
  // Tag management state
  const [tagSelectorAnchor, setTagSelectorAnchor] = React.useState(null);
  const [selectedStaffForTags, setSelectedStaffForTags] = React.useState(null);
  const [tagManagementOpen, setTagManagementOpen] = React.useState(false);
  
  // Check if viewing from league admin context
  const isLeagueView = location.pathname.startsWith('/league');
  
  // Filter data based on view context
  const filteredStaffData = React.useMemo(() => {
    if (isLeagueView) {
      // League admins see all profiles
      return localStaffData;
    } else {
      // Club users only see Public profiles (filter out Private)
      return localStaffData.filter(staff => staff.profilePrivacy !== 'Private');
    }
  }, [isLeagueView, localStaffData]);

  const handleRowClick = (params, event) => {
    // Don't navigate if clicking on checkbox or action buttons
    if (
      event.target.closest('.MuiCheckbox-root') ||
      event.target.closest('.MuiDataGrid-checkboxInput')
    ) {
      return;
    }
    const basePath = location.pathname.startsWith('/league') ? '/league/staff' : '/staff';
    navigate(`${basePath}/${params.row.id}`);
  };
  
  // Tag handlers
  const handleTagsClick = (staffId, anchorEl) => {
    setSelectedStaffForTags(staffId);
    setTagSelectorAnchor(anchorEl || document.activeElement);
  };
  
  const handleTagsChange = (staffId, newTags) => {
    setLocalStaffData(prevData =>
      prevData.map(staff =>
        staff.id === staffId ? { ...staff, tags: newTags } : staff
      )
    );
  };
  
  const handleTagSelectorClose = () => {
    setTagSelectorAnchor(null);
    setSelectedStaffForTags(null);
  };
  
  const handleUpdateTag = (oldTag, newTag) => {
    setLocalStaffData(prevData =>
      prevData.map(staff => ({
        ...staff,
        tags: staff.tags ? staff.tags.map(t => t === oldTag ? newTag : t) : []
      }))
    );
  };
  
  const handleDeleteTag = (tagToDelete) => {
    setLocalStaffData(prevData =>
      prevData.map(staff => ({
        ...staff,
        tags: staff.tags ? staff.tags.filter(t => t !== tagToDelete) : []
      }))
    );
  };

  const handleBulkEditSave = (updates) => {
    console.log('Bulk editing fields:', Object.keys(updates), 'for', selectedRows.length, 'staff members');
    console.log('Updates:', updates);
    
    // Process tags if present
    if (updates.tags) {
      const { action, values } = updates.tags;
      setLocalStaffData(prevData =>
        prevData.map(staff => {
          if (!selectedRows.includes(staff.id)) return staff;
          
          let newTags = staff.tags || [];
          if (action === 'add') {
            // Add tags (avoiding duplicates, max 5)
            const tagsToAdd = values.filter(tag => !newTags.includes(tag));
            newTags = [...newTags, ...tagsToAdd].slice(0, 5);
          } else if (action === 'remove') {
            // Remove tags
            newTags = newTags.filter(tag => !values.includes(tag));
          }
          
          return { ...staff, tags: newTags };
        })
      );
    }
    
    // In a real application, other updates would also be applied here
    const selectedStaff = filteredStaffData.filter(staff => selectedRows.includes(staff.id));
    console.log('Selected staff:', selectedStaff.map(s => `${s.firstName} ${s.lastName}`));
    
    const updateSummary = Object.entries(updates)
      .map(([field, value]) => `${field}: ${JSON.stringify(value)}`)
      .join(', ');
    
    alert(`Updated ${updateSummary} for ${selectedRows.length} staff members`);
    
    // Clear selection and close bulk edit bar
    setSelectedRows([]);
    setBulkEditOpen(false);
  };
  
  const columns = React.useMemo(() => createColumns((staffId, event) => {
    if (event) {
      handleTagsClick(staffId, event.currentTarget);
    }
  }), []);
  
  const selectedStaff = selectedStaffForTags 
    ? filteredStaffData.find(s => s.id === selectedStaffForTags)
    : null;

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      {selectedRows.length > 0 && (
        <BulkEditBar
          selectedCount={selectedRows.length}
          onSave={handleBulkEditSave}
          onCancel={() => setSelectedRows([])}
        />
      )}
      
      {/* Tag Selector Popover */}
      {selectedStaff && (
        <TagSelector
          selectedTags={selectedStaff.tags || []}
          onChange={(newTags) => handleTagsChange(selectedStaff.id, newTags)}
          anchorEl={tagSelectorAnchor}
          onClose={handleTagSelectorClose}
          maxTags={5}
        />
      )}
      
      {/* Tag Management Drawer */}
      <TagManagementDrawer
        open={tagManagementOpen}
        onClose={() => setTagManagementOpen(false)}
        staffData={localStaffData}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
        onAddTag={(tagName) => {
          // Create a new tag by adding it to the first selected staff or showing a message
          console.log('New tag created:', tagName);
          alert(`Tag "${tagName}" created! You can now apply it to staff members.`);
        }}
      />
      
      <DataGrid
        rows={filteredStaffData}
        columns={columns}
        columnGroupingModel={columnGroupingModel}
        slots={{
          toolbar: CustomToolbar,
        }}
        slotProps={{
          toolbar: {
            onInviteClick,
            onManageTags: () => setTagManagementOpen(true),
          },
        }}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={(newSelection) => setSelectedRows(newSelection)}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25,
            },
          },
          columns: {
            columnVisibilityModel: {
              // Show first 5-6 columns by default
              picUrl: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              tags: true, // Show tags column by default
              profilePrivacy: isLeagueView, // Only show in league view
              roles: true, // Show merged roles column by default
              // Hide all other columns by default
              location: false,
              state: false,
              workAuthUS: false,
              workAuthCA: false,
              gender: false,
              ethnicity: false,
              hasAgent: false,
              agentName: false,
              agencyName: false,
              proPlayerExp: false,
              mlsPlayerExp: false,
              mlsClubsPlayed: false,
              otherPlayerExp: false,
              interestArea: false,
              relocation: false,
              proCoachExp: false,
              mlsCoachExp: false,
              mlsCoachRoles: false,
              mlsClubsCoached: false,
              nonMlsCoachExp: false,
              proCoachExpUpdate: false,
              prevMlsCoachExp: false,
              mlsCoachingExpList: false,
              sportingExp: false,
              mlsSportingExp: false,
              mlsClubsSporting: false,
              nonMlsSportingExp: false,
              sportingVertical: false,
              proSportingExpUpdate: false,
              prevMlsSportingExp: false,
              currentlyEmployed: false,
              currentEmployer: false,
              prevEmployer1: false,
              prevEmployer2: false,
              prevEmployer3: false,
              prevEmployer4: false,
              degree: false,
              highestDegree: false,
              mlsPrograms: false,
              mlsProgramming: false,
              coachingLicenses: false,
              sportingCerts: false,
              sportingDirectorCerts: false,
              otherLicenses: false,
              otherLicensesList: false,
              languages: false,
              resumeUrl: false,
              coachingLicenseDoc: false,
              otherCertsDoc: false,
            },
          },
        }}
        pageSizeOptions={[25, 50, 100]}
        checkboxSelection
        onRowClick={handleRowClick}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid var(--color-border-secondary)',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid var(--color-border-primary)',
            backgroundColor: 'var(--color-background-secondary)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid var(--color-border-primary)',
          },
          '& .MuiDataGrid-row': {
            cursor: 'pointer'
          }
        }}
      />
    </Box>
  );
}
