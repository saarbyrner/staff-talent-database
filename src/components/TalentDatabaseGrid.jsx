import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Chip, Avatar, Link, Stack, Typography, Tooltip, Button, IconButton, Snackbar, Alert, Badge, LinearProgress } from '@mui/material';
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
  ArchiveOutlined,
  UnarchiveOutlined,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import staffData from '../data/staff_talent.json';
import { generateInitialsImage } from '../utils/assetManager';
import BulkEditBar from './BulkEditBar';
import TagChip from './TagChip';
import TagSelector from './TagSelector';
import TagManagementDrawer from './TagManagementDrawer';
import NotesDrawer from './NotesDrawer';
import InviteDrawer from './InviteDrawer';
import '../styles/design-tokens.css';

// Helper to determine if a staff record is complete
const getStaffStatus = (staff) => {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  const isIncomplete = requiredFields.some(field => {
    const value = staff[field];
    return !value || (typeof value === 'string' && value.trim() === '');
  });
  return isIncomplete ? 'Incomplete' : 'Complete';
};

// Tag mapping between league and club tags
const TAG_MAPPING = {
  leagueToClub: {
    'Unproven': 'Raw Talent',
    'Emerging': 'Growth stage',
    'High Potential': 'Top prospect',
    'Proven': 'Vetted Elite'
  },
  clubToLeague: {
    'Raw Talent': 'Unproven',
    'Growth stage': 'Emerging',
    'Top prospect': 'High Potential',
    'Vetted Elite': 'Proven'
  }
};

// Helper to map tags based on view context
const mapTagsForView = (tags, isLeagueView) => {
  if (!tags || !Array.isArray(tags)) return [];
  if (isLeagueView) return tags; // League view shows original tags
  
  // Club view: map league tags to club tags
  return tags.map(tag => TAG_MAPPING.leagueToClub[tag] || tag);
};

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
  const { onInviteClick, onManageTags, hideAddButton, onOpenInviteDrawer } = props;
  
  const isLeague = location.pathname.startsWith('/league');
  
  const handleAddClick = () => {
    // Go to league or staff add-user depending on view
    const path = isLeague ? '/league/staff/add-user' : '/staff/add-user';
    navigate(path, { state: { from: location.pathname, returnTab: 3 } });
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
        {!hideAddButton && (
          <Button
            variant="contained"
            startIcon={isLeague ? <MailOutline /> : <AddOutlined />}
            onClick={isLeague ? onOpenInviteDrawer : handleAddClick}
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
            {isLeague ? 'Invite' : 'Add'}
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
  return <span>-</span>;
};

const ArrayCell = ({ value }) => {
  if (!Array.isArray(value) || value.length === 0) return <span>-</span>;
  return (
    <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto', py: 1 }}>
      {value.map((item, index) => (
        <Chip key={index} label={item} size="small" variant="outlined" />
      ))}
    </Stack>
  );
};

const RolesCell = ({ roles }) => {
  if (!Array.isArray(roles) || roles.length === 0) return <span>-</span>;
  
  if (roles.length === 1) {
    return (
      <Stack direction="row" spacing={0.5} sx={{ py: 1, overflowX: 'auto', maxWidth: '100%' }}>
        <Chip label={roles[0]} size="small" variant="outlined" />
      </Stack>
    );
  }
  
  const remainingCount = roles.length - 1;
  const remainingRoles = roles.slice(1).join(', ');
  
  return (
    <Stack direction="row" spacing={0.5} sx={{ py: 1, overflowX: 'auto', maxWidth: '100%' }}>
      <Chip label={roles[0]} size="small" variant="outlined" />
      <Tooltip title={remainingRoles} arrow>
        <Chip label={`+${remainingCount}`} size="small" variant="outlined" />
      </Tooltip>
    </Stack>
  );
};

const getInitials = (name = '') => (
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || '-'
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

const createColumns = (onTagsClick, watchlistIds = [], onToggleWatchlist, isLeagueView = false, onNotesClick, staffNotes = {}, onDelete, showArchived = false, onUnarchive, tagColorSeeds = {}) => {
  const watchlistColumn = isLeagueView ? {
    field: 'watchlistCount',
    headerName: 'Watchlist',
    width: 100,
    type: 'number',
    valueGetter: (params) => {
       // Incomplete users cannot be on watchlists, so return 0
       const staffStatus = getStaffStatus(params.row);
       if (staffStatus === 'Incomplete') {
         return 0;
       }
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
    headerName: 'Watchlist',
    width: 100,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const isWatchlisted = watchlistIds.includes(params.row.id);
      const isIncomplete = getStaffStatus(params.row) === 'Incomplete';
      const isDisabled = isIncomplete && !isWatchlisted;
      
      return (
        <Tooltip title={isDisabled ? "Cannot add incomplete profiles to watchlist" : (isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist")}>
          <span>
            <IconButton
              size="small"
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(params.row.id);
              }}
              sx={{
                color: isWatchlisted ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                '&:hover': {
                  backgroundColor: 'var(--color-background-tertiary)',
                },
                '&.Mui-disabled': {
                  color: 'var(--color-text-disabled)',
                  opacity: 0.5
                }
              }}
            >
              {isWatchlisted ? (
                <Visibility fontSize="small" />
              ) : (
                <VisibilityOutlined fontSize="small" />
              )}
            </IconButton>
          </span>
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
  // WATCHLIST
  watchlistColumn,
  // NAME (combined with headshot)
  {
    field: 'name',
    headerName: 'Name',
    width: 240,
    sortable: true,
    filterable: true,
    valueGetter: (params) => `${params.row.firstName || ''} ${params.row.lastName || ''}`.trim(),
    renderCell: (params) => {
      const hasImage = params.row.picUrl && params.row.picUrl.trim() !== '';
      const initials = `${params.row.firstName?.charAt(0) || ''}${params.row.lastName?.charAt(0) || ''}`.toUpperCase();
      
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={hasImage ? params.row.picUrl : undefined}
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: hasImage ? 'var(--color-background-secondary)' : '#3B4960',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
            imgProps={{
              referrerPolicy: 'no-referrer',
              style: { objectFit: 'cover' }
            }}
          >
            {!hasImage && initials}
          </Avatar>
          <Typography sx={{ fontWeight: 500, fontSize: 14, color: '#222' }}>
            {`${params.row.firstName || ''} ${params.row.lastName || ''}`.trim()}
          </Typography>
        </Box>
      );
    }
  },
  // CONTACT INFO
  { 
    field: 'phone', 
    headerName: 'Phone', 
    width: 150,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'email', 
    headerName: 'Email', 
    width: 250,
    renderCell: (params) => params.value || '-'
  },
  {
    field: 'tags',
    headerName: 'Tags',
    width: 250,
    sortable: false,
    renderCell: (params) => {
      const rawTags = params.value || [];
      const tags = mapTagsForView(rawTags, isLeagueView);
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
          {tags.slice(0, 3).map((tag, index) => {
            // Get the original tag name for color seed lookup
            const originalTag = rawTags[index];
            return (
              <TagChip 
                key={`${tag}-${index}`} 
                label={tag} 
                size="small" 
                isLeagueView={isLeagueView}
                colorSeed={tagColorSeeds[originalTag]}
              />
            );
          })}
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
      // Check if profile is incomplete
      const staffStatus = getStaffStatus(params.row);
      const isIncomplete = staffStatus === 'Incomplete';
      
      // Incomplete users always show Private
      const value = isIncomplete ? 'Private' : (params.value || 'Public');
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
      const location = [city, state, country].filter(Boolean).join(', ');
      return location || '-';
    }
  },
  { 
    field: 'state', 
    headerName: 'State', 
    width: 120,
    renderCell: (params) => params.value || '-'
  },
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
  { 
    field: 'gender', 
    headerName: 'Gender', 
    width: 120,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'ethnicity', 
    headerName: 'Ethnicity', 
    width: 180,
    renderCell: (params) => params.value || '-'
  },

  // AGENT
  { 
    field: 'hasAgent', 
    headerName: 'Has Agent?', 
    width: 120, 
    renderCell: (params) => <BooleanCell value={params.value} /> 
  },
  { 
    field: 'agentName', 
    headerName: 'Agent Name', 
    width: 150,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'agencyName', 
    headerName: 'Agency Name', 
    width: 150,
    renderCell: (params) => params.value || '-'
  },

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
  { 
    field: 'otherPlayerExp', 
    headerName: 'Other Exp', 
    width: 250,
    renderCell: (params) => params.value || '-'
  },

  // INTERESTS
  { 
    field: 'interestArea', 
    headerName: 'Area of Interest', 
    width: 180,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'roles', 
    headerName: 'Roles', 
    width: 280, 
    valueGetter: (params) => {
      const { coachingRoles = [], execRoles = [], techRoles = [] } = params.row;
      return [...coachingRoles, ...execRoles, ...techRoles];
    },
    renderCell: (params) => <RolesCell roles={params.value} /> 
  },
  // ...existing code...
  // STATUS
  // Only show App Status column in league view
  ...(isLeagueView ? [{
    field: 'status',
    headerName: 'App Status',
    width: 110,
    sortable: true,
    valueGetter: (params) => getStaffStatus(params.row),
    renderCell: (params) => {
      const isComplete = params.value === 'Complete';
      const label = isComplete ? 'Submitted' : params.value;
      return (
        <Chip
          label={label}
          size="small"
          color={isComplete ? 'success' : 'default'}
          variant="filled"
          sx={{
            fontWeight: 500,
          }}
        />
      );
    }
  }] : []),
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
    width: 250,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'prevEmployer1', 
    headerName: 'Previous Employer 1', 
    width: 250,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'prevEmployer2', 
    headerName: 'Previous Employer 2', 
    width: 250,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'prevEmployer3', 
    headerName: 'Previous Employer 3', 
    width: 250,
    renderCell: (params) => params.value || '-'
  },
  { 
    field: 'prevEmployer4', 
    headerName: 'Previous Employer 4', 
    width: 250,
    renderCell: (params) => params.value || '-'
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
    width: 200,
    renderCell: (params) => params.value || '-'
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
  ...(isLeagueView ? [{
    field: 'actions',
    headerName: '',
    width: 60,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => {
      const handleAction = (event) => {
        event.stopPropagation(); // Prevent row click from firing
        
        if (showArchived) {
          // Unarchive action
          if (window.confirm(`Are you sure you want to unarchive ${params.row.firstName} ${params.row.lastName}?`)) {
            if (onUnarchive) {
              onUnarchive(params.row.id);
            }
          }
        } else {
          // Archive action
          if (window.confirm(`Are you sure you want to archive ${params.row.firstName} ${params.row.lastName}?`)) {
            if (onDelete) {
              onDelete(params.row.id);
            }
          }
        }
      };

      return (
        <Tooltip title={showArchived ? "Unarchive" : "Archive"} arrow>
          <IconButton
            size="small"
            onClick={handleAction}
            sx={{
              color: 'var(--color-text-secondary)',
              transition: 'color 0.2s',
              '&:hover': {
                color: 'var(--color-primary)',
                backgroundColor: 'transparent',
              }
            }}
          >
            {showArchived ? (
              <UnarchiveOutlined fontSize="small" />
            ) : (
              <ArchiveOutlined fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
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
      { field: 'status' },
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

export default function TalentDatabaseGrid({ onInviteClick, watchlistIds = [], onAddToWatchlist, onRemoveFromWatchlist, showArchived = false, onUnarchive, staffData: externalStaffData, onArchive, onAddPendingUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [bulkEditOpen, setBulkEditOpen] = React.useState(false);
  
  // Use external staff data if provided, otherwise use imported data
  const sourceStaffData = externalStaffData || staffData;
  
  // Enrich staff data with coaching statistics and set privacy for incomplete users
  const [localStaffData, setLocalStaffData] = React.useState(() => {
    const isLeagueContext = location.pathname.startsWith('/league');
    return sourceStaffData.map(staff => {
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
      
      // At league level, automatically set profile privacy to Private for incomplete users
      const staffStatus = getStaffStatus(staff);
      const updatedStaff = {
        ...staff,
        profilePrivacy: (isLeagueContext && staffStatus === 'Incomplete') ? 'Private' : (staff.profilePrivacy || 'Public')
      };
      
      // Add coaching stats if they're a coach
      if (isCoach) {
        return {
          ...updatedStaff,
          coachingStats: generateStats(staff.id)
        };
      }
      return updatedStaff;
    });
  });
  
  // Sync external staff data changes to local state
  React.useEffect(() => {
    if (externalStaffData) {
      const isLeagueContext = location.pathname.startsWith('/league');
      setLocalStaffData(externalStaffData.map(staff => {
        const currentRole = staff.currentEmployer?.split('-')[1]?.trim() || '';
        const interestArea = staff.interestArea || '';
        const hasCoachingRoles = staff.coachingRoles && staff.coachingRoles.length > 0;
        const hasCoachingExp = staff.proCoachExp || staff.mlsCoachExp;
        const hasCoachingLicenses = staff.coachingLicenses && staff.coachingLicenses.length > 0;
        
        const isCoach = currentRole.toLowerCase().includes('coach') || 
                        currentRole.toLowerCase().includes('manager') || 
                        interestArea.toLowerCase().includes('coach') ||
                        hasCoachingRoles ||
                        hasCoachingExp ||
                        hasCoachingLicenses;
        
        // At league level, automatically set profile privacy to Private for incomplete users
        const staffStatus = getStaffStatus(staff);
        const updatedStaff = {
          ...staff,
          profilePrivacy: (isLeagueContext && staffStatus === 'Incomplete') ? 'Private' : (staff.profilePrivacy || 'Public')
        };
        
        if (isCoach) {
          return {
            ...updatedStaff,
            coachingStats: generateStats(staff.id)
          };
        }
        return updatedStaff;
      }));
    }
  }, [externalStaffData, location.pathname]);
  
  // Tag management state
  const [tagSelectorAnchor, setTagSelectorAnchor] = React.useState(null);
  const [selectedStaffForTags, setSelectedStaffForTags] = React.useState(null);
  const [tagManagementOpen, setTagManagementOpen] = React.useState(false);
  const [availableCustomTags, setAvailableCustomTags] = React.useState([]);
  // Map of tag names to their original names (for stable color generation)
  const [tagColorSeeds, setTagColorSeeds] = React.useState({});
  
  // Notes management state
  const [notesDrawerOpen, setNotesDrawerOpen] = React.useState(false);
  const [selectedStaffForNotes, setSelectedStaffForNotes] = React.useState(null);
  const [staffNotes, setStaffNotes] = React.useState({});
  
  // Invite drawer state
  const [inviteDrawerOpen, setInviteDrawerOpen] = React.useState(false);
  
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  
  // Check if viewing from league admin context
  const isLeagueView = location.pathname.startsWith('/league');
  
  // Toggle watchlist handler - adds or removes based on current state
  const handleToggleWatchlist = (staffId) => {
    if (watchlistIds.includes(staffId)) {
      if (onRemoveFromWatchlist) {
        onRemoveFromWatchlist(staffId);
      }
    } else {
      // At league level, prevent adding incomplete users to watchlist
      if (isLeagueView) {
        const staff = localStaffData.find(s => s.id === staffId);
        if (staff && getStaffStatus(staff) === 'Incomplete') {
          alert('Users with incomplete profiles cannot be added to watchlists.');
          return;
        }
      }
      if (onAddToWatchlist) {
        onAddToWatchlist(staffId);
      }
    }
  };
  
  // Filter data based on view context
  const filteredStaffData = React.useMemo(() => {
    let filtered = localStaffData;

    // For league view: filter by archived status based on showArchived prop
    // For club view: always exclude archived candidates
    if (isLeagueView) {
      filtered = filtered.filter(staff => {
        const isArchived = staff.isArchived || false;
        return showArchived ? isArchived : !isArchived;
      });
    } else {
      // Club users should never see archived candidates
      filtered = filtered.filter(staff => !staff.isArchived);
      // Club users should not see users with Incomplete app status
      filtered = filtered.filter(staff => getStaffStatus(staff) !== 'Incomplete');
    }

    // Filter by privacy for non-league users
    if (!isLeagueView) {
      filtered = filtered.filter(staff => staff.profilePrivacy !== 'Private');
    }

    return filtered;
  }, [isLeagueView, localStaffData, showArchived]);

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
    // Convert club tags back to league tags for storage (data stores league tags)
    const tagsToStore = isLeagueView ? newTags : newTags.map(tag => TAG_MAPPING.clubToLeague[tag] || tag);
    
    // Both club and league users can directly change tags
    setLocalStaffData(prevData =>
      prevData.map(staff =>
        staff.id === staffId ? { ...staff, tags: tagsToStore } : staff
      )
    );
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
    // Update in staff data
    setLocalStaffData(prevData =>
      prevData.map(staff => ({
        ...staff,
        tags: staff.tags ? staff.tags.map(t => t === oldTag ? newTag : t) : []
      }))
    );
    
    // Update in available custom tags if it exists there
    setAvailableCustomTags(prevTags =>
      prevTags.map(tag => tag === oldTag ? newTag : tag)
    );
    
    // Preserve color seed when renaming - copy from old tag to new tag
    setTagColorSeeds(prevSeeds => {
      const seeds = { ...prevSeeds };
      if (seeds[oldTag]) {
        seeds[newTag] = seeds[oldTag];
        delete seeds[oldTag];
      } else {
        // If no seed exists, use the old tag name as the seed
        seeds[newTag] = oldTag;
      }
      return seeds;
    });
  };
  
  const handleDeleteTag = (tagToDelete) => {
    // Remove from staff data
    setLocalStaffData(prevData =>
      prevData.map(staff => ({
        ...staff,
        tags: staff.tags ? staff.tags.filter(t => t !== tagToDelete) : []
      }))
    );
    
    // Remove from available custom tags
    setAvailableCustomTags(prevTags =>
      prevTags.filter(tag => tag !== tagToDelete)
    );
  };
  
  const handleBulkEditSave = (updates) => {
    console.log('Bulk editing fields:', Object.keys(updates), 'for', selectedRows.length, 'staff members');
    console.log('Updates:', updates);
    
    // Process tags if present
    if (updates.tags) {
      const { action, values } = updates.tags;
      
      // Convert club tags to league tags for storage if in club view
      const valuesToStore = isLeagueView ? values : values.map(tag => TAG_MAPPING.clubToLeague[tag] || tag);
      
      // Both club and league users can directly change tags
      setLocalStaffData(prevData =>
        prevData.map(staff => {
          if (!selectedRows.includes(staff.id)) return staff;
          
          let newTags = staff.tags || [];
          if (action === 'add') {
            const tagsToAdd = valuesToStore.filter(tag => !newTags.includes(tag));
            newTags = [...newTags, ...tagsToAdd].slice(0, 4);
          } else if (action === 'remove') {
            newTags = newTags.filter(tag => !valuesToStore.includes(tag));
          }
          
          return { ...staff, tags: newTags };
        })
      );
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
    // Filter out incomplete users at league level
    const eligibleStaffIds = selectedRows.filter(staffId => {
      const staff = localStaffData.find(s => s.id === staffId);
      return staff && getStaffStatus(staff) !== 'Incomplete';
    });
    
    const skippedCount = selectedRows.length - eligibleStaffIds.length;
    
    eligibleStaffIds.forEach(staffId => {
      if (onAddToWatchlist) {
        onAddToWatchlist(staffId);
      }
    });
    
    if (eligibleStaffIds.length > 0) {
      const message = skippedCount > 0 
        ? `Added ${eligibleStaffIds.length} staff member${eligibleStaffIds.length > 1 ? 's' : ''} to watchlist. ${skippedCount} incomplete profile${skippedCount > 1 ? 's were' : ' was'} skipped.`
        : `Added ${eligibleStaffIds.length} staff member${eligibleStaffIds.length > 1 ? 's' : ''} to watchlist`;
      alert(message);
    } else {
      alert('Users with incomplete profiles cannot be added to watchlists.');
    }
    setSelectedRows([]);
  };
  
  const handleDeleteStaff = (staffId) => {
    if (onArchive) {
      // Use external handler if provided
      onArchive(staffId);
    } else {
      // Fall back to local state management
      setLocalStaffData(prevData => 
        prevData.map(staff => 
          staff.id === staffId ? { ...staff, isArchived: true } : staff
        )
      );
    }
    setToastMessage('Staff member archived successfully');
    setToastOpen(true);
  };
  
  const handleUnarchiveStaff = (staffId) => {
    if (onUnarchive) {
      // Use external handler if provided
      onUnarchive(staffId);
    } else {
      // Fall back to local state management
      setLocalStaffData(prevData => 
        prevData.map(staff => 
          staff.id === staffId ? { ...staff, isArchived: false } : staff
        )
      );
    }
    setToastMessage('Staff member unarchived successfully');
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
    handleToggleWatchlist,
    isLeagueView,
    handleNotesClick,
    staffNotes,
    handleDeleteStaff,
    showArchived,
    handleUnarchiveStaff,
    tagColorSeeds
  ), [watchlistIds, handleToggleWatchlist, isLeagueView, staffNotes, showArchived, tagColorSeeds]);
  
  const selectedStaff = selectedStaffForTags 
    ? filteredStaffData.find(s => s.id === selectedStaffForTags)
    : null;

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      {showArchived && filteredStaffData.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: 'var(--color-text-secondary)'
        }}>
          <Typography variant="body1">No archived candidates found.</Typography>
        </Box>
      )}
      {(!showArchived || filteredStaffData.length > 0) && (<>
      {selectedRows.length > 0 && isLeagueView && (
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
          selectedTags={mapTagsForView(selectedStaff.tags || [], isLeagueView)}
          onChange={(newTags) => handleTagsChange(selectedStaff.id, newTags)}
          anchorEl={tagSelectorAnchor}
          onClose={handleTagSelectorClose}
          maxTags={4}
          isLeagueView={isLeagueView}
          availableCustomTags={mapTagsForView(availableCustomTags, isLeagueView)}
          tagColorSeeds={tagColorSeeds}
          onAddCustomTag={(tag) => {
            // Convert to league format for storage (like handleTagsChange does)
            const tagToStore = isLeagueView ? tag : (TAG_MAPPING.clubToLeague[tag] || tag);
            
            // Add to availableCustomTags if not already in the list or default tags
            const DEFAULT_LEAGUE_TAGS = ['Unproven', 'Emerging', 'High Potential', 'Proven'];
            const isDefaultTag = DEFAULT_LEAGUE_TAGS.includes(tagToStore);
            
            if (!isDefaultTag && !availableCustomTags.includes(tagToStore)) {
              setAvailableCustomTags([...availableCustomTags, tagToStore]);
              // Initialize color seed for new custom tag
              setTagColorSeeds(prev => ({ ...prev, [tagToStore]: tagToStore }));
            }
          }}
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
          // Add to available custom tags if not already present
          if (!availableCustomTags.includes(tagName)) {
            setAvailableCustomTags(prev => [...prev, tagName]);
            // Initialize color seed for new custom tag
            setTagColorSeeds(prev => ({ ...prev, [tagName]: tagName }));
          }
        }}
        availableCustomTags={availableCustomTags}
        isLeagueView={isLeagueView}
        tagColorSeeds={tagColorSeeds}
      />
      

      
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

      {/* Invite Drawer */}
      <InviteDrawer
        open={inviteDrawerOpen}
        onClose={() => setInviteDrawerOpen(false)}
        onAddPendingUser={onAddPendingUser}
      />

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
            onOpenInviteDrawer: () => setInviteDrawerOpen(true),
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
              notes: false, // Hide notes column
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
      </>)}
    </Box>
  );
}
