import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Chip, Avatar, Link, Stack, Typography, Tooltip, Button } from '@mui/material';
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
} from '@mui/icons-material';
import staffData from '../data/staff_talent.json';
import { generateInitialsImage } from '../utils/assetManager';
import '../styles/design-tokens.css';

export const CustomToolbar = React.forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

const columns = [
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
    field: 'location', 
    headerName: 'Location (City, State, Country)', 
    width: 200,
    valueGetter: (params) => {
      const { city, state, country } = params.row;
      return [city, state, country].filter(Boolean).join(', ');
    }
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

  // DOCS
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
      { field: 'location' },
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
    groupId: 'Coaching History',
    children: [
      { field: 'proCoachExp' },
      { field: 'mlsCoachExp' },
      { field: 'mlsCoachRoles' },
      { field: 'mlsClubsCoached' },
      { field: 'nonMlsCoachExp' },
    ],
  },
  {
    groupId: 'Sporting History',
    children: [
      { field: 'sportingExp' },
      { field: 'mlsSportingExp' },
      { field: 'mlsClubsSporting' },
      { field: 'nonMlsSportingExp' },
      { field: 'sportingVertical' },
    ],
  },
  {
    groupId: 'Employment',
    children: [
      { field: 'currentEmployer' },
      { field: 'prevEmployer1' },
      { field: 'prevEmployer2' },
    ],
  },
  {
    groupId: 'Education',
    children: [
      { field: 'degree' },
      { field: 'mlsPrograms' },
      { field: 'coachingLicenses' },
      { field: 'sportingCerts' },
      { field: 'languages' },
    ],
  },
  {
    groupId: 'Documents',
    children: [
      { field: 'resumeUrl' },
      { field: 'picUrl' },
    ],
  },
];

export default function TalentDatabaseGrid() {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', width: '100%' }}>
      <DataGrid
        rows={staffData}
        columns={columns}
        columnGroupingModel={columnGroupingModel}
        slots={{
          toolbar: CustomToolbar,
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 25,
            },
          },
          columns: {
            columnVisibilityModel: {
              // Show first 5 columns by default
              picUrl: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              roles: true, // Show merged roles column by default
              // Hide all other columns by default
              location: false,
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
              currentEmployer: false,
              prevEmployer1: false,
              prevEmployer2: false,
              degree: false,
              mlsPrograms: false,
              coachingLicenses: false,
              sportingCerts: false,
              languages: false,
              resumeUrl: false,
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
