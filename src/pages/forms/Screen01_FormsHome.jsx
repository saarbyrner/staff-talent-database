import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Link
} from '@mui/material'
import { DataGrid, GridPagination } from '@mui/x-data-grid'
import { SearchOutlined, ExpandMoreOutlined, MoreVertOutlined } from '@mui/icons-material'
import '../../styles/design-tokens.css'
import TokenizedDrawerAthleteSelector from '../../components/forms/TokenizedDrawerAthleteSelector'
import CreateFormDrawer from '../../components/forms/CreateFormDrawer'
import athletesData from '../../data/athletes.json'

function Screen01_FormsHome() {
  const navigate = useNavigate()
  // Inline stub data to visually render the screen (no behavior)
  const rows = [
    { id: 'f-001', title: 'Daily Wellness Check', type: 'Questionnaire', status: 'Active', owner: 'Performance', updated: 'Today 10:12', due: 'Today 18:00', recipients: 53, completion: 41 },
    { id: 'f-002', title: 'Post-Game RPE', type: 'Questionnaire', status: 'Scheduled', owner: 'Coaching', updated: 'Yesterday 16:40', due: 'Tomorrow 09:00', recipients: 53, completion: null },
    { id: 'f-003', title: 'Injury Follow-up', type: 'Questionnaire', status: 'Draft', owner: 'Medical', updated: 'Mon 14:20', due: null, recipients: 8, completion: null },
    { id: 'staff_form', title: 'Staff Form', type: 'Questionnaire', status: 'Draft', owner: 'Sporting Operations', updated: 'Today 09:30', due: null, recipients: 0, completion: null, route: '/forms/staff_form/build' }
  ]

  const columns = useMemo(() => [
    {
      field: 'title',
      headerName: 'Template',
      flex: 1,
      minWidth: 360,
      headerClassName: 'grid-cell--pad-left',
      cellClassName: 'grid-cell--pad-left',
      renderCell: (params) => (
        <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          <Link
            component="button"
            underline="none"
            onClick={(e) => {
              e.stopPropagation()
              navigate(params.row.route || `/forms/${params.row.id}/build`)
            }}
            sx={{ color: 'var(--color-text-primary)' }}
          >
            {params.value}
          </Link>
        </Typography>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 160,
      valueGetter: (params) => (params?.row && params.row.category) ? params.row.category : '—',
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 260,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={params.value}
        >
          {(params && params.value) ? params.value : '—'}
        </Typography>
      )
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 180,
    },
    {
      field: 'updated',
      headerName: 'Last updated at',
      width: 260,
      headerClassName: 'grid-cell--pad-right',
      cellClassName: 'grid-cell--pad-right',
    },
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      filterable: false,
      width: 56,
      align: 'right',
      headerAlign: 'right',
      headerClassName: 'grid-cell--pad-right',
      cellClassName: 'grid-cell--pad-right',
      renderCell: (params) => (
        <IconButton size="small" aria-label="more" onClick={(e) => {
          e.stopPropagation();
          setActionMenuAnchor(e.currentTarget);
          setActionRowId(params.row.id);
        }}>
          <MoreVertOutlined fontSize="small" />
        </IconButton>
      )
    },
  ], [navigate])

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 })
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [actionRowId, setActionRowId] = useState(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [selectedAthletes, setSelectedAthletes] = useState([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const drawerAthletes = React.useMemo(() => (
    (athletesData || []).map((a) => ({
      id: String(a.id ?? `${a.firstname}-${a.lastname}`),
      name: `${a.firstname} ${a.lastname}`.trim(),
      position: a.position || a.position_group || '—',
      ageGroup: (a.squad_name && /U\d+/.test(a.squad_name))
        ? (a.squad_name.match(/U\d+/)?.[0] || 'U21')
        : 'U21',
      status: a.availability_status === 'Injured' ? 'injured' : (a.availability_status === 'Available' ? 'available' : 'available'),
      avatar: undefined
    }))
  ), [])

  // Removed custom Footer to align with form_answers_sets styling

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'var(--color-background-primary)' }}>
      {/* Header / Toolbar */}
  {/* Filters + Table combined in a single Paper (no gaps) */}
  <Paper
    elevation={0}
    sx={{
      borderRadius: 'var(--radius-md)',
      border: 'none',
      width: '100%'
    }}
  >
    <Box sx={{
      px: 3,
      pt: 1,
      pb: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      flexWrap: 'wrap',
      bgcolor: 'var(--color-background-primary)'
    }}>
      <TextField 
        size="small" 
        variant="filled" 
        placeholder="Search" 
        sx={{ minWidth: 260 }}
        InputProps={{ 
          endAdornment: (
            <InputAdornment position="end">
              <SearchOutlined fontSize="small" sx={{ color: 'var(--color-primary)' }} />
            </InputAdornment>
          ) 
        }}
      />
      <TextField select size="small" variant="filled" label="Category" sx={{ minWidth: 220 }} value="">
        <MenuItem value="">Category</MenuItem>
        <MenuItem value="medical">Medical</MenuItem>
        <MenuItem value="performance">Performance</MenuItem>
      </TextField>
      <Box sx={{ flexGrow: 1 }} />
      <Button 
        variant="contained" 
        size="small"
        disableElevation
        sx={{
          backgroundColor: 'var(--button-primary-bg)',
          color: 'var(--button-primary-color)',
          textTransform: 'none',
          '&:hover': { backgroundColor: 'var(--button-primary-hover-bg)' }
        }}
        onClick={() => setIsCreateOpen(true)}
      >
        Create
      </Button>
    </Box>
    <Divider />
    <Box sx={{
      height: 560,
      width: '100%',
      '& .MuiDataGrid-root': { border: 'none' },
      '& .MuiDataGrid-columnHeaders': {
        backgroundColor: 'var(--color-background-primary)',
        '& .MuiDataGrid-columnHeaderTitle': {
          fontWeight: 600,
          fontSize: '14px'
        }
      },
      '& .MuiDataGrid-cell': {
        borderBottom: '1px solid var(--color-border-secondary)',
        display: 'flex',
        alignItems: 'center'
      },
      '& .MuiDataGrid-withBorderColor': {},
      '& .grid-cell--pad-left': { pl: 3, paddingLeft: '24px !important' },
      '& .grid-cell--pad-right': { pr: 3, paddingRight: '24px !important' },
      '& .MuiDataGrid-footerContainer': { px: 3 },
    }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[25, 50, 100]}
        slots={{ pagination: GridPagination }}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
      />
    </Box>
  </Paper>

  {/* Row actions menu */}
  <Menu
    anchorEl={actionMenuAnchor}
    open={Boolean(actionMenuAnchor)}
    onClose={() => { setActionMenuAnchor(null); setActionRowId(null); }}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <MenuItem onClick={() => { setActionMenuAnchor(null); setActionRowId(null); }}>Edit</MenuItem>
    <MenuItem onClick={() => { setActionMenuAnchor(null); /* open drawer below */ setAssignOpen(true); }}>Assign</MenuItem>
    <MenuItem onClick={() => { setActionMenuAnchor(null); setActionRowId(null); }}>Delete</MenuItem>
  </Menu>

  <TokenizedDrawerAthleteSelector 
    open={assignOpen}
    onClose={() => setAssignOpen(false)}
    athletes={drawerAthletes}
    selectedAthletes={selectedAthletes}
    onSelectionChange={setSelectedAthletes}
  />

  <CreateFormDrawer 
    open={isCreateOpen}
    onClose={() => setIsCreateOpen(false)}
    onSubmit={(payload) => {
      // For now, just log. Integrate with actual creation flow later.
      // eslint-disable-next-line no-console
      console.log('Create form payload', payload)
      setIsCreateOpen(false)
    }}
    categories={[ 'Medical', 'Performance', 'Wellbeing' ]}
  />

      {/* Table */}
      {/* (Table now included in the Paper above) */}
    </Box>
  )
}

export default Screen01_FormsHome


