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
  isLeagueView = false,
  tagColorSeeds = {}
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
    // NAME (combined with headshot)
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
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {`${params.row.firstName || ''} ${params.row.lastName || ''}`.trim()}
          </Typography>
        </Box>
      );
    }
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
  // Removed separate firstName and lastName columns; now combined in 'Name' column
  { field: 'phone', headerName: 'Phone', width: 150 },
  { field: 'email', headerName: 'Email', width: 200 },
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
    width: 280,
    valueGetter: (params) => {
      const { coachingRoles = [], execRoles = [], techRoles = [] } = params.row;
      return [...coachingRoles, ...execRoles, ...techRoles];
    },
    renderCell: (params) => <RolesCell roles={params.value} />
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
  // ...existing code...
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

function WatchlistGrid({ watchlist, onRemoveFromWatchlist, onWatchlistUpdate, hideCheckboxes = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isLeagueView = location.pathname.startsWith('/league');
  
  const [localStaffData, setLocalStaffData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tagSelectorAnchor, setTagSelectorAnchor] = useState(null);
  const [selectedStaffForTags, setSelectedStaffForTags] = useState(null);
  const [tagManagementOpen, setTagManagementOpen] = useState(false);
  const [availableCustomTags, setAvailableCustomTags] = useState([]);
  // Map of tag names to their original names (for stable color generation)
  const [tagColorSeeds, setTagColorSeeds] = useState({});
  
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
    // Convert club tags back to league tags for storage (data stores league tags)
    const tagsToStore = isLeagueView ? newTags : newTags.map(tag => TAG_MAPPING.clubToLeague[tag] || tag);
    
    setLocalStaffData(prevData =>
      prevData.map(staff =>
        staff.id === staffId ? { ...staff, tags: tagsToStore } : staff
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
      includeNotes: false,
      enableTagEditing: true,
    },
    isLeagueView,
    tagColorSeeds
  ), [onRemoveFromWatchlist, staffNotes, isLeagueView, tagColorSeeds]);

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
        checkboxSelection={!hideCheckboxes}
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

export default WatchlistGrid;
