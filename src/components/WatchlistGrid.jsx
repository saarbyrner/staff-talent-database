import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Chip, Avatar, Link, Stack, Typography, Tooltip, IconButton, LinearProgress, Badge } from '@mui/material';
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
  NotesOutlined,
} from '@mui/icons-material';
import staffData from '../data/staff_talent.json';
import { generateInitialsImage } from '../utils/assetManager';
import BulkEditBar from './BulkEditBar';
import TagChip from './TagChip';
import TagSelector from './TagSelector';
import TagManagementDrawer from './TagManagementDrawer';
import NotesDrawer from './NotesDrawer';
import '../styles/design-tokens.css';

// Helper to generate consistent random stats based on staff ID
export const generateStats = (id) => {
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

export const WatchlistToolbar = React.forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onManageTags } = props;
  
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
          <Box
            sx={{
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              minWidth: 'auto',
              padding: '6px 12px',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-tertiary)'
              }
            }}
          >
            {/* Placeholder for future actions */}
          </Box>
        )}
      </Box>
    </Box>
  );
});

WatchlistToolbar.displayName = 'WatchlistToolbar';

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

export const createWatchlistColumns = (
  onTagsClick,
  onRemoveFromWatchlist,
  onNotesClick,
  staffNotes = {},
  options = {},
) => {
  const {
    includeActions = true,
    includeNotes = true,
    enableTagEditing = true,
  } = options;

  const columns = [
    ...(includeActions
      ? [
          {
            field: 'watchlistActions',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
              <Tooltip title="Remove from Watchlist">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof onRemoveFromWatchlist === 'function') {
                      onRemoveFromWatchlist(params.row.id);
                    }
                  }}
                  sx={{
                    color: 'var(--color-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-background-tertiary)',
                    }
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          },
        ]
      : []),
    ...(includeNotes
      ? [
          {
            field: 'notes',
            headerName: '',
            width: 60,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
              const noteCount = staffNotes[params.row.id]?.length || 0;
              if (typeof onNotesClick !== 'function') {
                return noteCount > 0 ? (
                  <Chip label={`${noteCount} note${noteCount > 1 ? 's' : ''}`} size="small" />
                ) : null;
              }
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
          },
        ]
      : []),
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
  {
    field: 'priority',
    headerName: 'Priority',
    width: 120,
    editable: true,
    type: 'singleSelect',
    valueOptions: ['High', 'Medium', 'Low'],
    renderCell: (params) => {
      const priority = params.value;
      const priorityColors = {
        High: 'error',
        Medium: 'warning',
        Low: 'info',
      };
      return (
        <Chip 
          label={priority} 
          size="small" 
          color={priorityColors[priority] || 'default'} 
          variant="outlined" 
        />
      );
    }
  },
  {
    field: 'targetRole',
    headerName: 'Target Role',
    width: 180,
    editable: true,
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
          {enableTagEditing && typeof onTagsClick === 'function' && (
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
          )}
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
        />
      );
    }
  },
  {
    field: 'roles',
    headerName: 'Roles',
    width: 180,
    valueGetter: (params) => {
      const roles = [];
      if (params.row.coachingRoles && params.row.coachingRoles.length > 0) roles.push(...params.row.coachingRoles);
      if (params.row.execRoles && params.row.execRoles.length > 0) roles.push(...params.row.execRoles);
      if (params.row.techRoles && params.row.techRoles.length > 0) roles.push(...params.row.techRoles);
      return roles.join(', ') || '—';
    },
    renderCell: (params) => {
      const roles = [];
      if (params.row.coachingRoles && params.row.coachingRoles.length > 0) roles.push(...params.row.coachingRoles);
      if (params.row.execRoles && params.row.execRoles.length > 0) roles.push(...params.row.execRoles);
      if (params.row.techRoles && params.row.techRoles.length > 0) roles.push(...params.row.techRoles);
      
      if (roles.length === 0) return <Typography variant="body2">—</Typography>;
      
      return (
        <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto', py: 1 }}>
          {roles.slice(0, 2).map((role, index) => (
            <Chip key={index} label={role} size="small" variant="outlined" />
          ))}
          {roles.length > 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              +{roles.length - 2}
            </Typography>
          )}
        </Stack>
      );
    }
  },
  // More columns following the same structure as TalentDatabaseGrid
  { 
    field: 'location', 
    headerName: 'Location', 
    width: 200,
    valueGetter: (params) => {
      const parts = [params.row.city, params.row.state, params.row.country].filter(Boolean);
      return parts.join(', ') || '—';
    }
  },
  { field: 'state', headerName: 'State', width: 120 },
  { field: 'workAuthUS', headerName: 'US Work Auth', width: 120, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'workAuthCA', headerName: 'CA Work Auth', width: 120, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'gender', headerName: 'Gender', width: 100 },
  { field: 'ethnicity', headerName: 'Ethnicity', width: 180 },
  { field: 'hasAgent', headerName: 'Has Agent', width: 100, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'agentName', headerName: 'Agent Name', width: 180 },
  { field: 'agencyName', headerName: 'Agency', width: 200 },
  { field: 'proPlayerExp', headerName: 'Pro Player Exp', width: 130, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'mlsPlayerExp', headerName: 'MLS Player Exp', width: 130, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'mlsClubsPlayed', headerName: 'MLS Clubs Played', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'otherPlayerExp', headerName: 'Other Player Exp', width: 200 },
  { field: 'interestArea', headerName: 'Interest Area', width: 150 },
  { field: 'relocation', headerName: 'Relocation', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'proCoachExp', headerName: 'Pro Coach Exp', width: 130, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'mlsCoachExp', headerName: 'MLS Coach Exp', width: 130, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'mlsCoachRoles', headerName: 'MLS Coach Roles', width: 250, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'mlsClubsCoached', headerName: 'MLS Clubs Coached', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'nonMlsCoachExp', headerName: 'Non-MLS Coach Exp', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'sportingExp', headerName: 'Sporting Exp', width: 130, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'mlsSportingExp', headerName: 'MLS Sporting Exp', width: 150, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'mlsClubsSporting', headerName: 'MLS Clubs (Sporting)', width: 220, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'nonMlsSportingExp', headerName: 'Non-MLS Sporting', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'sportingVertical', headerName: 'Sporting Vertical', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'currentlyEmployed', headerName: 'Currently Employed', width: 150, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'currentEmployer', headerName: 'Current Employer', width: 200 },
  { field: 'prevEmployer1', headerName: 'Previous Employer 1', width: 200 },
  { field: 'prevEmployer2', headerName: 'Previous Employer 2', width: 200 },
  { field: 'prevEmployer3', headerName: 'Previous Employer 3', width: 200 },
  { field: 'prevEmployer4', headerName: 'Previous Employer 4', width: 200 },
  { field: 'degree', headerName: 'Degree', width: 150, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'highestDegree', headerName: 'Highest Degree', width: 200 },
  { field: 'mlsPrograms', headerName: 'MLS Programs', width: 130, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'mlsProgramming', headerName: 'MLS Programming', width: 250, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'coachingLicenses', headerName: 'Coaching Licenses', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'sportingCerts', headerName: 'Sporting Certs', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'sportingDirectorCerts', headerName: 'Sporting Director Certs', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'otherLicenses', headerName: 'Other Licenses', width: 130, renderCell: (params) => <BooleanCell value={params.value} /> },
  { field: 'otherLicensesList', headerName: 'Other Licenses List', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { field: 'languages', headerName: 'Languages', width: 200, renderCell: (params) => <ArrayCell value={params.value} /> },
  { 
    field: 'resumeUrl', 
    headerName: 'Resume', 
    width: 100, 
    renderCell: (params) => <LinkCell value={params.value} />
  },
  { 
    field: 'coachingLicenseDoc', 
    headerName: 'Coach License Doc', 
    width: 150, 
    renderCell: (params) => <LinkCell value={params.value} />
  },
  { 
    field: 'otherCertsDoc', 
    headerName: 'Other Certs Doc', 
    width: 150, 
    renderCell: (params) => <LinkCell value={params.value} />
  },
  
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
    valueGetter: (params) => params.row.coachingLicenses?.[0] || 'None',
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
    valueGetter: (params) => params.row.eloRating || 1200, // Default Elo Rating
  },
  // Add spacing after the last column
  {
    field: 'spacer',
    headerName: '',
    width: 50,
    sortable: false,
    filterable: false,
  },
  ];

  return columns;
};

function WatchlistGrid({ watchlist, onRemoveFromWatchlist, onWatchlistUpdate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLeagueView = location.pathname.startsWith('/league');
  
  const [localStaffData, setLocalStaffData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tagSelectorAnchor, setTagSelectorAnchor] = useState(null);
  const [selectedStaffForTags, setSelectedStaffForTags] = useState(null);
  const [tagManagementOpen, setTagManagementOpen] = useState(false);
  
  // Notes management state
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [selectedStaffForNotes, setSelectedStaffForNotes] = useState(null);
  const [staffNotes, setStaffNotes] = useState({});

  // Filter staff data to only show watchlisted items and enrich with coaching stats
  useEffect(() => {
    const watchlistIds = watchlist.map(item => item.id);
    const watchlistedStaff = staffData
      .filter(staff => watchlistIds.includes(staff.id))
      .map(staff => {
        const watchlistItem = watchlist.find(item => item.id === staff.id);
        return {
          ...enrichStaffWithCoachingStats(staff),
          priority: watchlistItem.priority,
          targetRole: watchlistItem.targetRole,
        };
      });
    setLocalStaffData(watchlistedStaff);
  }, [watchlist]);

  const handleRowClick = (params, event) => {
    if (
      event.target.closest('.MuiCheckbox-root') ||
      event.target.closest('.MuiDataGrid-checkboxInput') ||
      event.target.closest('button') ||
      event.target.closest('.MuiIconButton-root')
    ) {
      return;
    }
    const basePath = location.pathname.startsWith('/league') ? '/league/staff' : '/staff';
    navigate(`${basePath}/${params.row.id}`, { state: { returnTab: 1 } });
  };

  const handleTagsClick = (staffId, anchorEl) => {
    setSelectedStaffForTags(staffId);
    setTagSelectorAnchor(anchorEl);
  };

  const handleTagsChange = (staffId, newTags) => {
    setLocalStaffData(prevData =>
      prevData.map(staff =>
        staff.id === staffId ? { ...staff, tags: newTags } : staff
      )
    );
  };
  
  // Helper to check if staff member has coaching stats
  const enrichStaffWithCoachingStats = (staff) => {
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
    
    if (isCoach && !staff.coachingStats) {
      return {
        ...staff,
        coachingStats: generateStats(staff.id)
      };
    }
    return staff;
  };

  const handleProcessRowUpdate = (newRow) => {
    onWatchlistUpdate(newRow);
    setLocalStaffData((prev) =>
      prev.map((row) => (row.id === newRow.id ? newRow : row))
    );
    return newRow;
  };

  const handleTagSelectorClose = () => {
    setTagSelectorAnchor(null);
    setSelectedStaffForTags(null);
  };
  
  // Notes handlers
  const handleNotesClick = (staffId) => {
    const staff = localStaffData.find(s => s.id === staffId);
    setSelectedStaffForNotes(staff);
    setNotesDrawerOpen(true);
  };
  
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

  // Ensure only one Elo Rating column
  const columns = React.useMemo(() => createWatchlistColumns(
    (staffId, event) => {
      if (event) {
        handleTagsClick(staffId, event.currentTarget);
      }
    },
    onRemoveFromWatchlist,
    handleNotesClick,
    staffNotes,
    {
      includeActions: true,
      includeNotes: true,
      enableTagEditing: true,
    }
  ), [onRemoveFromWatchlist, staffNotes]);

  const selectedStaff = selectedStaffForTags 
    ? localStaffData.find(s => s.id === selectedStaffForTags)
    : null;

  const columnGroupingModel = [
    {
      groupId: 'contact',
      headerName: 'Contact Information',
      children: [
        { field: 'picUrl' },
        { field: 'firstName' },
        { field: 'lastName' },
        { field: 'phone' },
        { field: 'email' },
        { field: 'tags' }
      ]
    }
  ];

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      {selectedRows.length > 0 && (
        <BulkEditBar
          selectedCount={selectedRows.length}
          onSave={() => {}}
          onCancel={() => setSelectedRows([])}
        />
      )}

      {selectedStaff && (
        <TagSelector
          selectedTags={selectedStaff.tags || []}
          onChange={(newTags) => handleTagsChange(selectedStaff.id, newTags)}
          anchorEl={tagSelectorAnchor}
          onClose={handleTagSelectorClose}
          maxTags={5}
        />
      )}

      <TagManagementDrawer
        open={tagManagementOpen}
        onClose={() => setTagManagementOpen(false)}
        staffData={localStaffData}
        onUpdateTag={handleUpdateTag}
        onDeleteTag={handleDeleteTag}
        onAddTag={(tagName) => {
          console.log('New tag created:', tagName);
          alert(`Tag "${tagName}" created! You can now apply it to staff members.`);
        }}
      />

      <DataGrid
        rows={localStaffData}
        columns={columns}
        processRowUpdate={handleProcessRowUpdate}
        columnGroupingModel={columnGroupingModel}
        slots={{
          toolbar: WatchlistToolbar,
        }}
        slotProps={{
          toolbar: {
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
              watchlistActions: true,
              notes: true,
              picUrl: true,
              priority: true,
              targetRole: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              tags: true,
              profilePrivacy: isLeagueView,
              roles: true,
              // Coaching stats - visible by default
              age: true,
              yearsExp: true,
              license: true,
              winRate: true,
              ppm: true,
              trophies: true,
              xgDiff: true,
              squadValuePerf: true,
              possession: true,
              ppda: true,
              u23Minutes: true,
              academyDebuts: true,
              eloRating: true,
              spacer: false,
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
              sportingExp: false,
              mlsSportingExp: false,
              mlsClubsSporting: false,
              nonMlsSportingExp: false,
              sportingVertical: false,
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
    </Box>
  );
}

export default WatchlistGrid;
