import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, IconButton, Menu, MenuItem, Tooltip, Chip } from '@mui/material';
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { 
  DeleteOutlined, 
  AssignmentOutlined,
  PersonOutlined, 
  EditOutlined,
  FitnessCenterOutlined,
  MedicalServicesOutlined
} from '@mui/icons-material';
import athletesData from '../data/athletes.json';
import '../styles/design-tokens.css';

const BulkActionsToolbar = React.forwardRef(({ numSelected, onBulkAction }, ref) => {
  if (numSelected === 0) return null;

  return (
    <Box
      ref={ref}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '56px',
        px: 2,
        backgroundColor: 'var(--color-background-secondary)',
        borderBottom: '1px solid var(--color-border-primary)',
        zIndex: 1,
      }}
    >
      <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
        {numSelected} items selected
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            cursor: 'pointer',
            '&:hover': {
              color: 'var(--color-primary)'
            }
          }}
          onClick={() => onBulkAction('delete')}
        >
          <DeleteOutlined fontSize="small" />
          <Typography variant="body2">Delete</Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            cursor: 'pointer',
            '&:hover': {
              color: 'var(--color-primary)'
            }
          }}
          onClick={() => onBulkAction('archive')}
        >
          <AssignmentOutlined fontSize="small" />
          <Typography variant="body2">Archive</Typography>
        </Box>
      </Box>
    </Box>
  );
});

BulkActionsToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onBulkAction: PropTypes.func.isRequired,
};

BulkActionsToolbar.displayName = 'BulkActionsToolbar';

const CustomToolbar = React.forwardRef((props, ref) => {
  return (
    <Box
      ref={ref}
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
    </Box>
  );
});

CustomToolbar.displayName = 'CustomToolbar';

const AthleteDataGrid = ({ 
  data = athletesData, 
  height = 600,
  showToolbar = true,
  groupingEnabled = true,
  onBulkAction,
  ...props 
}) => {
  // Ensure data is always an array and filter out any null/undefined entries
  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(row => row && typeof row === 'object' && row.id);
  }, [data]);
  const columns = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      type: 'number',
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      renderCell: (params) => {
        const { firstname, lastname } = params.row;
        return firstname && lastname ? `${firstname} ${lastname}` : '';
      },
      valueGetter: (value, row) => {
        return row?.firstname && row?.lastname ? `${row.firstname} ${row.lastname}` : '';
      },
      filterable: true,
      groupable: false,
    },
    {
      field: 'position',
      headerName: 'Position',
      width: 120,
      filterable: true,
      groupable: true,
    },
    {
      field: 'position_group',
      headerName: 'Position Group',
      width: 130,
      filterable: true,
      groupable: true,
    },
    {
      field: 'squad_name',
      headerName: 'Squad',
      width: 130,
      filterable: true,
      groupable: true,
    },
    {
      field: 'availability_status',
      headerName: 'Status',
      width: 120,
      filterable: true,
      groupable: true,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Available' ? 'success' :
            params.value === 'Injured' ? 'error' :
            'default'
          }
          variant={params.value === 'Available' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'performance_score',
      headerName: 'Performance',
      type: 'number',
      width: 110,
      filterable: true,
      valueFormatter: (value) => `${value}%`,
    },
    {
      field: 'fitness_level',
      headerName: 'Fitness',
      width: 120,
      filterable: true,
      groupable: true,
    },
    {
      field: 'injury_status',
      headerName: 'Injury Status',
      width: 150,
      filterable: true,
      groupable: true,
    },
    {
      field: 'training_load',
      headerName: 'Training Load',
      type: 'number',
      width: 130,
      filterable: true,
      valueFormatter: (value) => (typeof value === 'number' ? value.toFixed(1) : '-'),
    },
    {
      field: 'wellbeing_score',
      headerName: 'Wellbeing',
      type: 'number',
      width: 110,
      filterable: true,
      valueFormatter: (value) => (typeof value === 'number' ? value.toFixed(1) : '-'),
    },
    {
      field: 'last_assessment',
      headerName: 'Last Assessment',
      type: 'date',
      width: 140,
      valueGetter: (value) => value ? new Date(value) : null,
    }
  ], []);
  // Pagination temporarily disabled to avoid footer runtime issue
  
  const [selectedRows, setSelectedRows] = useState([]);

  const handleBulkAction = (action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedRows);
    } else {
      const selectedAthletes = data.filter(athlete => selectedRows.includes(athlete.id));
      console.log(`Bulk action ${action} on athletes:`, selectedAthletes);
    }
  };

  const CustomToolbarComponent = useMemo(() => {
    return function CustomToolbarWithSelection(props) {
      return (
        <Box sx={{ position: 'relative' }}>
          <CustomToolbar {...props} />
          <BulkActionsToolbar
            numSelected={selectedRows.length}
            onBulkAction={handleBulkAction}
          />
        </Box>
      );
    };
  }, [selectedRows.length, handleBulkAction]);

  // Basic styling for the grid container
  const containerStyles = {
    height,
    width: '100%',
    '& .MuiDataGrid-root': {
      border: 'none',
    },
    '& .MuiDataGrid-cell': {
      borderBottom: '1px solid var(--color-border-secondary)',
    },
    '& .MuiDataGrid-columnHeaders': {
      borderBottom: '1px solid var(--color-border-primary)',
      backgroundColor: 'var(--color-background-secondary)',
    },
    '& .MuiDataGrid-footerContainer': {
      borderTop: '1px solid var(--color-border-primary)',
      justifyContent: 'flex-start',
    },
  };

  return (
    <Box sx={containerStyles}>
      <DataGrid
        rows={safeData}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        density="comfortable"
        loading={safeData.length === 0}
        onRowSelectionModelChange={setSelectedRows}
        hideFooter
        slots={{ toolbar: CustomToolbarComponent }}
        slotProps={{
          basePopper: {
            sx: {
              '& .MuiPaper-root': {
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-primary)'
              }
            }
          },
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {},
          },
        }}
        {...props}
      />
    </Box>
  );
};

AthleteDataGrid.propTypes = {
  data: PropTypes.array,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  showToolbar: PropTypes.bool,
  groupingEnabled: PropTypes.bool,
  onBulkAction: PropTypes.func,
};

export default AthleteDataGrid;