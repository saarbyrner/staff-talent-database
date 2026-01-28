import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Chip, Avatar, Link, Stack, Typography, Tooltip, Button, IconButton, Snackbar, Alert, Badge, LinearProgress, Menu, MenuItem } from '@mui/material';
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
  Visibility,
  VisibilityOutlined,
  InboxOutlined,
  NotesOutlined,
  MoreVert,
  DeleteOutlined,
} from '@mui/icons-material';
import staffData from '../data/staff_talent.json';
import { generateInitialsImage } from '../utils/assetManager';
import BulkEditBar from './BulkEditBar';
import TagChip from './TagChip';
import TagSelector from './TagSelector';
import TagManagementDrawer from './TagManagementDrawer';
import TagApprovalDrawer from './TagApprovalDrawer';
import ClubApprovalInbox from './ClubApprovalInbox';
import NotesDrawer from './NotesDrawer';
import '../styles/design-tokens.css';

// Helper to generate consistent random stats based on staff ID
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

export const CustomToolbar = React.forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onInviteClick, onManageTags, hideAddButton, onApprovals, pendingApprovalsCount = 0 } = props;
  
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
        {!hideAddButton && (
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
        )}
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

const createColumns = (onTagsClick, watchlistIds = [], onToggleWatchlist, isLeagueView = false, onNotesClick, staffNotes = {}, onDelete) => {
  const watchlistColumn = isLeagueView ? {
    field: 'watchlistCount',
    headerName: 'Watchlist',
    width: 100,
    type: 'number',
    valueGetter: (params) => {
       const seed = params.row.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
       return (seed % 15) + 1;
    },
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <VisibilityOutlined fontSize="small" color="action" />
        <Typography variant="body2">{params.value}</Typography>
      </Box>
    )
  } : {
    field: 'watchlist',
    headerName: '',
    width: 60,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const isWatchlisted = watchlistIds.includes(params.row.id);
      return (
        <Tooltip title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(params.row.id);
            }}
            sx={{
              color: isWatchlisted ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              '&:hover': {
                backgroundColor: 'var(--color-background-tertiary)',
              }
            }}
          >
            {isWatchlisted ? (
              <Visibility fontSize="small" />
            ) : (
              <VisibilityOutlined fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      );
    }
  };

  const notesColumn = {
    field: 'notes',
    headerName: '',
    width: 60,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const noteCount = staffNotes[params.row.id]?.length || 0;
      return (
        <Tooltip title={noteCount > 0 ? `${noteCount} private note${noteCount > 1 ? 's' : ''}` : "Add private note"}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onNotesClick(params.row.id);
            }}
            sx={{
              color: noteCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              '&:hover': {
                backgroundColor: 'var(--color-background-tertiary)',
              }
            }}
          >
            {noteCount > 0 ? (
              <Badge badgeContent={noteCount} color="primary" max={99}>
                <NotesOutlined fontSize="small" />
              </Badge>
            ) : (
              <NotesOutlined fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      );
    }
  };

  return [
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
  
  // --- COACHING STATISTICS (from CoachLeaderboard) ---
  {
    field: 'age',
    headerName: 'Age',
    type: 'number',
    width: 70,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.age;
      return null;
    }
  },
  {
    field: 'yearsExp',
    headerName: 'Exp (Yrs)',
    type: 'number',
    width: 100,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.yearsExp;
      return null;
    }
  },
  {
    field: 'license',
    headerName: 'License',
    width: 160,
    valueGetter: (params) => {
      const licenses = params.row.coachingLicenses;
      if (Array.isArray(licenses) && licenses.length > 0) return licenses[0];
      return 'None';
    },
    renderCell: (params) => (
      <Chip 
        label={params.value} 
        size="small" 
        variant="outlined" 
        sx={{ height: 24, fontSize: '0.75rem', maxWidth: '100%' }} 
      />
    )
  },
  {
    field: 'winRate',
    headerName: 'Win %',
    type: 'number',
    width: 110,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.winRate;
      return null;
    },
    renderCell: (params) => {
      if (!params.value) return null;
      return (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ minWidth: 35 }}>{params.value}%</Typography>
          <LinearProgress 
            variant="determinate" 
            value={params.value} 
            sx={{ 
              flexGrow: 1, 
              height: 6, 
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: params.value > 55 ? 'success.main' : params.value > 40 ? 'warning.main' : 'error.main'
              }
            }} 
          />
        </Box>
      );
    }
  },
  {
    field: 'ppm',
    headerName: 'PPM',
    type: 'number',
    width: 80,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.ppm;
      return null;
    },
    renderCell: (params) => {
      if (!params.value) return null;
      return (
        <Typography variant="body2" fontWeight={params.value > 1.8 ? 700 : 400}>
          {params.value}
        </Typography>
      );
    }
  },
  {
    field: 'trophies',
    headerName: 'Trophies',
    type: 'number',
    width: 110,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.trophies;
      return null;
    },
    renderCell: (params) => {
      if (params.value === null || params.value === undefined) return null;
      return params.value > 0 ? (
        <Chip 
          label={params.value} 
          size="small" 
          color="warning" 
          variant="outlined"
          sx={{ height: 24 }}
        />
      ) : <Typography variant="body2" color="text.secondary">-</Typography>;
    }
  },
  {
    field: 'xgDiff',
    headerName: 'xG Diff',
    type: 'number',
    width: 90,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.xgDiff;
      return null;
    },
    renderCell: (params) => {
      if (!params.value) return null;
      return (
        <Typography 
          variant="body2" 
          color={params.value > 0 ? 'success.main' : 'error.main'}
          fontWeight={600}
        >
          {params.value > 0 ? '+' : ''}{params.value}
        </Typography>
      );
    }
  },
  {
    field: 'squadValuePerf',
    headerName: 'Squad Val %',
    type: 'number',
    width: 110,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.squadValuePerf;
      return null;
    },
    renderCell: (params) => {
      if (!params.value) return null;
      return (
        <Typography 
          variant="body2" 
          color={params.value > 0 ? 'success.main' : 'error.main'}
        >
          {params.value > 0 ? '+' : ''}{params.value}%
        </Typography>
      );
    }
  },
  {
    field: 'possession',
    headerName: 'Possession',
    type: 'number',
    width: 110,
    align: 'right',
    headerAlign: 'right',
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.possession;
      return null;
    },
    renderCell: (params) => {
      if (!params.value) return null;
      return (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          <Typography variant="body2">{params.value}%</Typography>
        </Box>
      );
    }
  },
  {
    field: 'ppda',
    headerName: 'PPDA',
    description: 'Passes Allowed Per Defensive Action (Lower is more intense pressing)',
    type: 'number',
    width: 80,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.ppda;
      return null;
    }
  },
  {
    field: 'u23Minutes',
    headerName: 'U23 Mins',
    type: 'number',
    width: 100,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.u23Minutes;
      return null;
    },
    renderCell: (params) => {
      if (params.value === null || params.value === undefined) return null;
      return `${params.value}%`;
    }
  },
  {
    field: 'academyDebuts',
    headerName: 'Debuts',
    type: 'number',
    width: 120,
    valueGetter: (params) => {
      if (params.row.coachingStats) return params.row.coachingStats.academyDebuts;
      return null;
    },
    renderHeader: () => (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 4 }}>
        Debuts
      </Box>
    ),
    renderCell: (params) => {
      if (params.value === null || params.value === undefined) return null;
      return (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 4 }}>
          {params.value}
        </Box>
      );
    }
  },
  {
    field: 'eloRating',
    headerName: 'Elo Rating',
    type: 'number',
    width: 120,
    valueGetter: (params) => params.row.eloRating || 1200,
  },
  ...(isLeagueView ? [{
    field: 'actions',
    headerName: '',
    width: 60,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      const [anchorEl, setAnchorEl] = React.useState(null);
      const open = Boolean(anchorEl);

      const handleMouseEnter = (event) => {
        setAnchorEl(event.currentTarget);
      };

      const handleMouseLeave = () => {
        setAnchorEl(null);
      };

      const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${params.row.firstName} ${params.row.lastName}?`)) {
          if (onDelete) {
            onDelete(params.row.id);
          }
        }
        setAnchorEl(null);
      };

      return (
        <Box
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
        >
          <IconButton
            size="small"
            sx={{
              color: 'var(--color-text-secondary)',
              '&:hover': {
                color: 'var(--color-primary)',
              }
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMouseLeave}
            MenuListProps={{
              onMouseLeave: handleMouseLeave,
              sx: { py: 0 }
            }}
            anchorOrigin={{
              vertical: 'center',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'right',
            }}
            slotProps={{
              paper: {
                sx: {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  minWidth: 120,
                }
              }
            }}
          >
            <MenuItem
              onClick={handleDelete}
              sx={{
                fontSize: '0.875rem',
                py: 1,
                px: 2,
                '&:hover': {
                  backgroundColor: 'var(--color-background-tertiary)',
                }
              }}
            >
              <DeleteOutlined fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </Menu>
        </Box>
      );
    }
  }] : []),
  {
    field: 'spacer',
    headerName: '',
    width: 100,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
  },
];
};

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

export default function TalentDatabaseGrid({ onInviteClick, watchlistIds = [], onAddToWatchlist }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [bulkEditOpen, setBulkEditOpen] = React.useState(false);
  
  // Enrich staff data with coaching statistics
  const [localStaffData, setLocalStaffData] = React.useState(() => {
    return staffData.map(staff => {
      // Check multiple indicators that someone is a coach
      const currentRole = staff.currentEmployer?.split('-')[1]?.trim() || '';
      const interestArea = staff.interestArea || '';
      const hasCoachingRoles = staff.coachingRoles && staff.coachingRoles.length > 0;
      const hasCoachingExp = staff.proCoachExp || staff.mlsCoachExp;
      const hasCoachingLicenses = staff.coachingLicenses && staff.coachingLicenses.length > 0;
      
      // Consider someone a coach if they have ANY coaching-related data
      const isCoach = currentRole.toLowerCase().includes('coach') || 
                      currentRole.toLowerCase().includes('manager') || 
                      interestArea.toLowerCase().includes('coach') ||
                      hasCoachingRoles ||
                      hasCoachingExp ||
                      hasCoachingLicenses;
      
      // Add coaching stats if they're a coach
      if (isCoach) {
        return {
          ...staff,
          coachingStats: generateStats(staff.id)
        };
      }
      return staff;
    });
  });
  
  // Tag management state
  const [tagSelectorAnchor, setTagSelectorAnchor] = React.useState(null);
  const [selectedStaffForTags, setSelectedStaffForTags] = React.useState(null);
  const [tagManagementOpen, setTagManagementOpen] = React.useState(false);
  
  // Notes management state
  const [notesDrawerOpen, setNotesDrawerOpen] = React.useState(false);
  const [selectedStaffForNotes, setSelectedStaffForNotes] = React.useState(null);
  const [staffNotes, setStaffNotes] = React.useState({});
  
  // Approval system state
  const [pendingApprovals, setPendingApprovals] = React.useState([
    {
      id: 'approval-example-1',
      staffId: '101',
      staffName: 'James Rivera',
      clubName: 'LAFC',
      oldTags: ['Proven'],
      newTags: ['High Potential'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: 'approval-example-2',
      staffId: '102',
      staffName: 'Michael Okoro',
      clubName: 'FC Cincinnati',
      oldTags: ['Proven'],
      newTags: ['Emerging'],
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      id: 'approval-example-3',
      staffId: '105',
      staffName: 'David Smith',
      clubName: 'LA Galaxy',
      oldTags: ['Proven'],
      newTags: ['Proven', 'High Potential'],
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      id: 'approval-example-4',
      staffId: '110',
      staffName: 'Christopher Nair',
      clubName: 'Austin FC',
      oldTags: ['Emerging'],
      newTags: ['Proven'],
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    },
    {
      id: 'approval-example-5',
      staffId: '115',
      staffName: 'Mark Wilson',
      clubName: 'Seattle Sounders FC',
      oldTags: ['Emerging'],
      newTags: ['Unproven'],
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    },
  ]);
  const [approvalDrawerOpen, setApprovalDrawerOpen] = React.useState(false);
  
  // Club sent approvals state (for club view)
  const [sentApprovals, setSentApprovals] = React.useState([
    {
      id: 'sent-1',
      staffId: '103',
      staffName: 'Robert Vasiliev',
      oldTags: ['Emerging'],
      newTags: ['High Potential'],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      status: 'pending',
    },
    {
      id: 'sent-2',
      staffId: '106',
      staffName: 'William Martinez',
      oldTags: ['Emerging'],
      newTags: ['Proven'],
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      status: 'approved',
    },
    {
      id: 'sent-3',
      staffId: '108',
      staffName: 'Joseph Khan',
      oldTags: ['Emerging'],
      newTags: ['Unproven'],
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      status: 'rejected',
      responseMessage: 'This staff member shows consistent growth and should remain in Emerging category.',
    },
    {
      id: 'sent-4',
      staffId: '112',
      staffName: 'Daniel Chen',
      clubName: 'LA Galaxy',
      oldTags: ['Proven'],
      newTags: ['High Potential'],
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      status: 'approved',
    },
    {
      id: 'sent-5',
      staffId: '114',
      staffName: 'Anthony Lee',
      clubName: 'Seattle Sounders FC',
      oldTags: ['High Potential'],
      newTags: ['Proven'],
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: 'pending',
    },
  ]);
  const [clubInboxOpen, setClubInboxOpen] = React.useState(false);
  
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  
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
    const staff = localStaffData.find(s => s.id === staffId);
    const oldTags = staff?.tags || [];
    
    // For club users, create a pending approval instead of directly changing
    if (!isLeagueView) {
      const approval = {
        id: `approval-${Date.now()}-${staffId}`,
        staffId,
        staffName: `${staff.firstName} ${staff.lastName}`,
        clubName: 'Club User', // In a real app, get from auth context
        oldTags,
        newTags,
        timestamp: new Date().toISOString(),
      };
      
      setPendingApprovals(prev => [...prev, approval]);
      setToastMessage('Tag change sent for approval');
      setToastOpen(true);
      handleTagSelectorClose();
    } else {
      // League users can directly change tags
      setLocalStaffData(prevData =>
        prevData.map(staff =>
          staff.id === staffId ? { ...staff, tags: newTags } : staff
        )
      );
    }
  };
  
  const handleTagSelectorClose = () => {
    setTagSelectorAnchor(null);
    setSelectedStaffForTags(null);
  };
  
  // Notes handlers
  const handleNotesClick = (staffId) => {
    const staff = filteredStaffData.find(s => s.id === staffId);
    setSelectedStaffForNotes(staff);
    setNotesDrawerOpen(true);
  };
  
  const handleAddNote = (staffId, noteText) => {
    const newNote = {
      id: `note-${Date.now()}`,
      staffId,
      text: noteText,
      authorName: 'Current User', // In real app, get from auth context
      authorInitials: 'CU',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setStaffNotes(prev => ({
      ...prev,
      [staffId]: [...(prev[staffId] || []), newNote]
    }));
    
    setToastMessage('Note added successfully');
    setToastOpen(true);
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
    
    setToastMessage('Note updated successfully');
    setToastOpen(true);
  };
  
  const handleDeleteNote = (staffId, noteId) => {
    setStaffNotes(prev => ({
      ...prev,
      [staffId]: (prev[staffId] || []).filter(note => note.id !== noteId)
    }));
    
    setToastMessage('Note deleted successfully');
    setToastOpen(true);
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
  
  // Approval handlers
  const handleApproveTagChange = (approvalId, note = '') => {
    const approval = pendingApprovals.find(a => a.id === approvalId);
    if (approval) {
      // Apply the tag change
      setLocalStaffData(prevData =>
        prevData.map(staff =>
          staff.id === approval.staffId ? { ...staff, tags: approval.newTags } : staff
        )
      );
      
      // Update the sent approvals for the club (if we track those globally)
      // For now, just remove from pending
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
      
      // In a real app, you'd also update the approval in the club's sent list with the response
      // setSentApprovals(prev => prev.map(a => 
      //   a.id === approvalId ? { ...a, status: 'approved', responseMessage: note } : a
      // ));
      
      setToastMessage(`Approved tag change for ${approval.staffName}${note ? ' with note' : ''}`);
      setToastOpen(true);
    }
  };
  
  const handleRejectTagChange = (approvalId, note = '') => {
    const approval = pendingApprovals.find(a => a.id === approvalId);
    if (approval) {
      // Remove from pending without applying
      setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
      
      // In a real app, you'd update the approval in the club's sent list with the response
      // setSentApprovals(prev => prev.map(a => 
      //   a.id === approvalId ? { ...a, status: 'rejected', responseMessage: note } : a
      // ));
      
      setToastMessage(`Rejected tag change for ${approval.staffName}${note ? ' with note' : ''}`);
      setToastOpen(true);
    }
  };

  const handleBulkEditSave = (updates) => {
    console.log('Bulk editing fields:', Object.keys(updates), 'for', selectedRows.length, 'staff members');
    console.log('Updates:', updates);
    
    // Process tags if present
    if (updates.tags) {
      const { action, values } = updates.tags;
      
      // For club users, create pending approvals for each selected staff
      if (!isLeagueView) {
        selectedRows.forEach(staffId => {
          const staff = localStaffData.find(s => s.id === staffId);
          if (staff) {
            let newTags = staff.tags || [];
            if (action === 'add') {
              const tagsToAdd = values.filter(tag => !newTags.includes(tag));
              newTags = [...newTags, ...tagsToAdd].slice(0, 5);
            } else if (action === 'remove') {
              newTags = newTags.filter(tag => !values.includes(tag));
            }
            
            const approval = {
              id: `approval-${Date.now()}-${staffId}`,
              staffId,
              staffName: `${staff.firstName} ${staff.lastName}`,
              clubName: 'Club User',
              oldTags: staff.tags || [],
              newTags,
              timestamp: new Date().toISOString(),
            };
            
            setPendingApprovals(prev => [...prev, approval]);
          }
        });
        
        setToastMessage(`${selectedRows.length} tag change${selectedRows.length > 1 ? 's' : ''} sent for approval`);
        setToastOpen(true);
      } else {
        // League users can directly change tags
        setLocalStaffData(prevData =>
          prevData.map(staff => {
            if (!selectedRows.includes(staff.id)) return staff;
            
            let newTags = staff.tags || [];
            if (action === 'add') {
              const tagsToAdd = values.filter(tag => !newTags.includes(tag));
              newTags = [...newTags, ...tagsToAdd].slice(0, 5);
            } else if (action === 'remove') {
              newTags = newTags.filter(tag => !values.includes(tag));
            }
            
            return { ...staff, tags: newTags };
          })
        );
      }
    }
    
    // In a real application, other updates would also be applied here
    const selectedStaff = filteredStaffData.filter(staff => selectedRows.includes(staff.id));
    console.log('Selected staff:', selectedStaff.map(s => `${s.firstName} ${s.lastName}`));
    
    if (isLeagueView) {
      const updateSummary = Object.entries(updates)
        .map(([field, value]) => `${field}: ${JSON.stringify(value)}`)
        .join(', ');
      
      alert(`Updated ${updateSummary} for ${selectedRows.length} staff members`);
    }
    
    // Clear selection and close bulk edit bar
    setSelectedRows([]);
    setBulkEditOpen(false);
  };

  const handleBulkAddToWatchlist = () => {
    selectedRows.forEach(staffId => {
      if (onAddToWatchlist) {
        onAddToWatchlist(staffId);
      }
    });
    alert(`Added ${selectedRows.length} staff member${selectedRows.length > 1 ? 's' : ''} to watchlist`);
    setSelectedRows([]);
  };
  
  const handleDeleteStaff = (staffId) => {
    setLocalStaffData(prevData => prevData.filter(staff => staff.id !== staffId));
    setToastMessage('Staff member deleted successfully');
    setToastOpen(true);
  };
  
  // Ensure only one Elo Rating column
  const columns = React.useMemo(() => createColumns(
    (staffId, event) => {
      if (event) {
        handleTagsClick(staffId, event.currentTarget);
      }
    },
    watchlistIds,
    onAddToWatchlist,
    isLeagueView,
    handleNotesClick,
    staffNotes,
    handleDeleteStaff
  ), [watchlistIds, onAddToWatchlist, isLeagueView, staffNotes]);
  
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
          onAddToWatchlist={handleBulkAddToWatchlist}
          isLeagueView={isLeagueView}
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
          isLeagueView={isLeagueView}
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
        isLeagueView={isLeagueView}
      />
      
      {/* Tag Approval Drawer - Only for League View */}
      {isLeagueView && (
        <TagApprovalDrawer
          open={approvalDrawerOpen}
          onClose={() => setApprovalDrawerOpen(false)}
          pendingApprovals={pendingApprovals}
          onApprove={handleApproveTagChange}
          onReject={handleRejectTagChange}
        />
      )}
      
      {/* Club Approval Inbox - Only for Club View */}
      {!isLeagueView && (
        <ClubApprovalInbox
          open={clubInboxOpen}
          onClose={() => setClubInboxOpen(false)}
          sentApprovals={sentApprovals}
        />
      )}
      
      {/* Notes Drawer */}
      {selectedStaffForNotes && (
        <NotesDrawer
          open={notesDrawerOpen}
          onClose={() => {
            setNotesDrawerOpen(false);
            setSelectedStaffForNotes(null);
          }}
          staffMember={selectedStaffForNotes}
          notes={staffNotes[selectedStaffForNotes.id] || []}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="info" sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
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
            onApprovals: isLeagueView ? () => setApprovalDrawerOpen(true) : () => setClubInboxOpen(true),
            pendingApprovalsCount: isLeagueView ? pendingApprovals.length : sentApprovals.filter(a => a.status === 'pending').length,
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
              watchlist: !isLeagueView,
              watchlistCount: isLeagueView,
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
              // Coaching stats - hidden by default but available
              age: false,
              yearsExp: false,
              license: false,
              winRate: false,
              ppm: false,
              trophies: false,
              xgDiff: false,
              squadValuePerf: false,
              possession: false,
              ppda: false,
              u23Minutes: false,
              academyDebuts: false,
              eloRating: true,
              spacer: true,
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
