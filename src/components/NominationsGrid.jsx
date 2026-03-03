import React, { useState } from 'react';
import { 
  Box, 
  Chip, 
  Button, 
  Typography, 
  IconButton, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  DataGridPro as DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro';
import { AddOutlined, DescriptionOutlined, CheckCircleOutlined, CancelOutlined, EditOutlined, DeleteOutlined } from '@mui/icons-material';
import ResumeViewerModal from './ResumeViewerModal';
import '../styles/design-tokens.css';

/**
 * Custom toolbar for Nominations Grid
 */
function NominationsToolbar({ onNominateClick, isLeagueView }) {
  return (
    <Box
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

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <GridToolbarQuickFilter
          sx={{ 
            width: 250,
            '& .MuiOutlinedInput-root': {
              height: '36px',
              backgroundColor: '#fff',
              fontSize: '0.875rem'
            }
          }}
        />
        {!isLeagueView && (
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={onNominateClick}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'var(--color-primary-hover)',
              },
            }}
          >
            Nominate
          </Button>
        )}
      </Box>
    </Box>
  );
}

/**
 * NominationsGrid Component
 * Displays nominations in a data grid with status and details
 */
function NominationsGrid({ 
  nominations, 
  onNominateClick, 
  isLeagueView = false, 
  onAcceptNomination, 
  onRejectNomination,
  onEditNomination,
  onDeleteNomination
}) {
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [nominationToDelete, setNominationToDelete] = useState(null);

  const handleViewResume = (nomination) => {
    setSelectedResume(nomination);
    setResumeModalOpen(true);
  };

  const handleCloseResumeModal = () => {
    setResumeModalOpen(false);
    setSelectedResume(null);
  };

  const handleDeleteClick = (nominationId) => {
    setNominationToDelete(nominationId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (nominationToDelete && onDeleteNomination) {
      onDeleteNomination(nominationToDelete);
    }
    setDeleteConfirmOpen(false);
    setNominationToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setNominationToDelete(null);
  };

  // Define columns for the nominations grid
  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.firstName} {params.row.lastName}
          </Typography>
        </Box>
      ),
    },
  ];

  // Add Nominated By column for league view only
  if (isLeagueView) {
    columns.push({
      field: 'nominatedBy',
      headerName: 'Nominated By',
      flex: 1,
      minWidth: 180,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value || '—'}
        </Typography>
      ),
    });
  }

  // Add remaining columns
  columns.push(
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'reason',
      headerName: 'Reason for Nomination',
      flex: 2,
      minWidth: 300,
      renderCell: (params) => (
        <Tooltip title={params.value || ''} placement="top">
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'resumeFileName',
      headerName: 'Resume',
      width: 120,
      renderCell: (params) => (
        params.value ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DescriptionOutlined 
              sx={{ 
                fontSize: 18, 
                color: 'var(--color-text-secondary)' 
              }} 
            />
            <Typography 
              variant="body2" 
              onClick={() => handleViewResume(params.row)}
              sx={{ 
                color: 'var(--color-primary)',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              View
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
            —
          </Typography>
        )
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const status = params.value;
        let color = 'default';
        let backgroundColor = '#f3f4f6';
        let textColor = '#6b7280';
        
        if (status === 'Pending') {
          backgroundColor = '#fef3c7';
          textColor = '#92400e';
        } else if (status === 'Approved') {
          backgroundColor = '#d1fae5';
          textColor = '#065f46';
        } else if (status === 'Rejected') {
          backgroundColor = '#fee2e2';
          textColor = '#991b1b';
        }
        
        return (
          <Chip
            label={status}
            size="small"
            sx={{
              backgroundColor,
              color: textColor,
              fontWeight: 500,
              fontSize: '0.75rem',
              height: '24px',
            }}
          />
        );
      },
    },
    {
      field: 'submittedDate',
      headerName: 'Submitted',
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return (
          <Typography variant="body2">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Typography>
        );
      },
    }
  );

  // Add Actions column for club view (Edit/Delete)
  if (!isLeagueView) {
    columns.push({
      field: 'clubActions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isPending = params.row.status === 'Pending';
        
        if (!isPending) {
          return null;
        }
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEditNomination && onEditNomination(params.row)}
                sx={{
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: 'var(--color-background-tertiary)',
                  },
                }}
              >
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDeleteClick(params.row.id)}
                sx={{
                  color: '#6b7280',
                  '&:hover': {
                    backgroundColor: 'var(--color-background-tertiary)',
                  },
                }}
              >
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    });
  }

  // Add Actions column for league view (Accept/Reject)
  if (isLeagueView) {
    columns.push({
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isPending = params.row.status === 'Pending';
        
        if (!isPending) {
          return null;
        }
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Accept">
              <IconButton
                size="small"
                onClick={() => onAcceptNomination && onAcceptNomination(params.row.id)}
                sx={{
                  color: '#065f46',
                  '&:hover': {
                    backgroundColor: '#d1fae5',
                  },
                }}
              >
                <CheckCircleOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject">
              <IconButton
                size="small"
                onClick={() => onRejectNomination && onRejectNomination(params.row.id)}
                sx={{
                  color: '#991b1b',
                  '&:hover': {
                    backgroundColor: '#fee2e2',
                  },
                }}
              >
                <CancelOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    });
  }

  const finalColumns = columns;

  return (
    <Box sx={{ height: 'calc(100vh - 56px)', width: '100%' }}>
      <DataGrid
        rows={nominations}
        columns={finalColumns}
        density="comfortable"
        disableRowSelectionOnClick
        slots={{
          toolbar: NominationsToolbar,
        }}
        slotProps={{
          toolbar: {
            onNominateClick,
            isLeagueView,
          },
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
          sorting: {
            sortModel: [{ field: 'submittedDate', sort: 'desc' }],
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          border: 'none',
          '& .MuiDataGrid-main': {
            border: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'var(--color-background-secondary)',
            borderBottom: '1px solid var(--color-border-primary)',
            borderTop: 'none',
          },
          '& .MuiDataGrid-columnHeader': {
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid var(--color-border-primary)',
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'var(--color-background-tertiary)',
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid var(--color-border-primary)',
          },
        }}
      />
      
      <ResumeViewerModal
        open={resumeModalOpen}
        onClose={handleCloseResumeModal}
        resumeData={selectedResume?.resumeData}
        resumeFileName={selectedResume?.resumeFileName}
        resumeType={selectedResume?.resumeType}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Nomination</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this nomination? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-primary)',
              '&:hover': {
                borderColor: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-tertiary)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#991b1b',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default NominationsGrid;
