import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Avatar, Typography, Chip, LinearProgress, Paper } from '@mui/material';
import { DataGridPro as DataGrid } from '@mui/x-data-grid-pro';
import { VisibilityOutlined } from '@mui/icons-material';
import staffData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { generateInitialsImage } from '../utils/assetManager';
import { CustomToolbar } from './TalentDatabaseGrid';
import { applyFilters } from './DashboardFilters';

// Helper to generate random stats
const generateStats = (id) => {
  // Seeded-like random based on ID string char codes to be consistent across renders
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (offset = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const winRate = 35 + Math.floor(random(1) * 40); // 35-75%
  const draws = Math.floor(random(2) * 20); // 0-20%
  // PPM approx: (Win * 3 + Draw * 1) / 100
  const ppm = ((winRate * 3) + draws) / 100;
  
  const age = 32 + Math.floor(random(3) * 25); // 32-57
  // Ensure experience is realistic relative to age (started coaching at 21+)
  const maxExp = age - 21;
  // Base experience calculation, capped by age constraint
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

const CoachLeaderboard = ({ dashboardFilters = null }) => {
  const navigate = useNavigate();
  
  // Enrich data with stats and filter for coaches
  const rows = useMemo(() => {
    // Apply dashboard filters first
    const filtered = applyFilters(staffData, currentStaffData, dashboardFilters);
    
    return filtered
      .filter(staff => {
        // Filter for coaches
        const role = staff.currentEmployer?.split('-')[1]?.trim() || staff.coachingRoles?.[0] || staff.role || '';
        const isCoach = role.toLowerCase().includes('coach') || 
                        role.toLowerCase().includes('manager') || 
                        (staff.coachingRoles && staff.coachingRoles.length > 0);
        return isCoach;
      })
      .map((staff) => {
        const stats = generateStats(staff.id || String(staff.id));
        return {
          ...staff,
          ...stats,
        };
      });
  }, [dashboardFilters]);

  const columns = [
    // --- Profile ---
    {
      field: 'fullName',
      headerName: 'Profile',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar 
            src={params.row.picUrl} 
            alt={params.row.firstName}
            sx={{ width: 32, height: 32 }}
          >
            {(!params.row.picUrl || params.row.picUrl.includes('undefined')) && 
              <img src={generateInitialsImage(params.row.firstName, params.row.lastName)} alt="" style={{width: '100%', height: '100%'}} />
            }
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {params.row.firstName} {params.row.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.currentEmployer?.split('-')[0]?.trim() || 'Free Agent'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    // --- Watchlist Count ---
    {
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
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 70,
    },
    {
      field: 'currentRole',
      headerName: 'Role',
      width: 180,
      valueGetter: (params) => {
          // Try to extract role from currentEmployer string "Club - Role"
          if (params.row.currentEmployer && params.row.currentEmployer.includes('-')) {
              return params.row.currentEmployer.split('-')[1].trim();
          }
          return params.row.coachingRoles?.[0] || 'Coach';
      }
    },

    // --- Career Overview ---
    {
      field: 'yearsExp',
      headerName: 'Exp (Yrs)',
      type: 'number',
      width: 100,
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
            sx={{ 
                height: 24, 
                fontSize: '0.75rem',
                maxWidth: '100%'
            }} 
        />
      )
    },

    // --- Headline Performance ---
    {
      field: 'winRate',
      headerName: 'Win %',
      type: 'number',
      width: 110,
      renderCell: (params) => (
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
      )
    },
    {
      field: 'ppm',
      headerName: 'PPM',
      type: 'number',
      width: 80,
      renderCell: (params) => (
          <Typography variant="body2" fontWeight={params.value > 1.8 ? 700 : 400}>
              {params.value}
          </Typography>
      )
    },
    {
      field: 'trophies',
      headerName: 'Trophies',
      type: 'number',
      width: 110,
      renderCell: (params) => (
          params.value > 0 ? (
            <Chip 
              label={params.value} 
              size="small" 
              color="warning" 
              variant="outlined"
              sx={{ height: 24 }}
            />
          ) : <Typography variant="body2" color="text.secondary">-</Typography>
      )
    },

    // --- Value Added ---
    {
      field: 'xgDiff',
      headerName: 'xG Diff',
      type: 'number',
      width: 90,
      renderCell: (params) => (
        <Typography 
            variant="body2" 
            color={params.value > 0 ? 'success.main' : 'error.main'}
            fontWeight={600}
        >
            {params.value > 0 ? '+' : ''}{params.value}
        </Typography>
      )
    },
    {
      field: 'squadValuePerf',
      headerName: 'Squad Val %',
      type: 'number',
      width: 110,
      renderCell: (params) => (
        <Typography 
            variant="body2" 
            color={params.value > 0 ? 'success.main' : 'error.main'}
        >
            {params.value > 0 ? '+' : ''}{params.value}%
        </Typography>
      )
    },

    // --- Tactical Style ---
    {
      field: 'possession',
      headerName: 'Possession',
      type: 'number',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Typography variant="body2">{params.value}%</Typography>
        </Box>
      )
    },
    {
      field: 'ppda',
      headerName: 'PPDA',
      description: 'Passes Allowed Per Defensive Action (Lower is more intense pressing)',
      type: 'number',
      width: 80,
    },

    // --- Development ---
    {
      field: 'u23Minutes',
      headerName: 'U23 Mins',
      type: 'number',
      width: 100,
      renderCell: (params) => `${params.value}%`
    },
    {
      field: 'academyDebuts',
      headerName: 'Debuts',
      type: 'number',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 4 }}>
          {params.value}
        </Box>
      ),
      renderHeader: () => (
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 4 }}>
          Debuts
        </Box>
      )
    },
  ];

  return (
    <Paper 
        elevation={0} 
        sx={{ 
          height: 'calc(100vh - 100px)', 
          width: '100%', 
          bgcolor: '#ffffff',
          border: '1px solid var(--color-border-primary)',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 4
        }}
      >
        <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
            sorting: {
                sortModel: [{ field: 'ppm', sort: 'desc' }],
            },
            pagination: { 
                paginationModel: { pageSize: 25 } 
            },
        }}
        pageSizeOptions={[10, 25, 50]}
        disableRowSelectionOnClick
        onRowClick={(params) => navigate(`/staff/${params.id}`)}
        density="comfortable"
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          toolbar: {
            hideAddButton: true
          }
        }}
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
    </Paper>

  );
};

export default CoachLeaderboard;
