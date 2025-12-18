import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Stack,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { CloseOutlined, InboxOutlined, CheckCircleOutlined, CancelOutlined, PendingOutlined } from '@mui/icons-material';
import TagChip from './TagChip';

/**
 * Get status chip styling based on approval status
 */
const getStatusChip = (status) => {
  const configs = {
    pending: { label: 'Pending', icon: <PendingOutlined />, color: 'warning' },
    approved: { label: 'Approved', icon: <CheckCircleOutlined />, color: 'success' },
    rejected: { label: 'Rejected', icon: <CancelOutlined />, color: 'error' },
  };
  
  const config = configs[status] || configs.pending;
  
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      color={config.color}
      variant="outlined"
    />
  );
};

/**
 * ClubApprovalInbox - Side panel for clubs to track their submitted tag change requests
 * @param {boolean} open - Whether drawer is open
 * @param {function} onClose - Close handler
 * @param {object[]} sentApprovals - Array of approval requests sent by the club
 */
const ClubApprovalInbox = ({ open, onClose, sentApprovals = [] }) => {
  const pendingCount = sentApprovals.filter(a => a.status === 'pending').length;
  const approvedCount = sentApprovals.filter(a => a.status === 'approved').length;
  const rejectedCount = sentApprovals.filter(a => a.status === 'rejected').length;
  
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 460,
          p: 3,
        }
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InboxOutlined />
            <Typography variant="h6" fontWeight={600}>
              Approval Requests
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>
        
        {/* Stats */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'var(--color-background-secondary)' }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {pendingCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {approvedCount}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
              <Typography variant="body2" fontWeight={600} color="error.main">
                {rejectedCount}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Approval List */}
        {sentApprovals.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <InboxOutlined sx={{ fontSize: 64, color: 'var(--color-text-tertiary)', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No approval requests yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tag changes you submit will appear here
            </Typography>
          </Box>
        ) : (
          <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
            {sentApprovals.map((approval) => (
              <ListItem
                key={approval.id}
                sx={{
                  py: 2,
                  borderBottom: '1px solid var(--color-border-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 1.5,
                }}
              >
                {/* Staff Info and Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {approval.staffName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(approval.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  {getStatusChip(approval.status)}
                </Box>
                
                {/* Tag Change Details */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    py: 1.5,
                    px: 2,
                    bgcolor: 'var(--color-background-tertiary)',
                    borderRadius: 1,
                  }}
                >
                  {approval.oldTags && approval.oldTags.length > 0 ? (
                    <Stack direction="row" spacing={0.5}>
                      {approval.oldTags.map(tag => (
                        <TagChip key={tag} label={tag} size="small" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No tags
                    </Typography>
                  )}
                  
                  <Typography variant="body2" sx={{ mx: 0.5 }}>→</Typography>
                  
                  <Stack direction="row" spacing={0.5}>
                    {approval.newTags.map(tag => (
                      <TagChip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </Box>
                
                {/* Response Message (if rejected or approved with note) */}
                {approval.responseMessage && (
                  <Box sx={{ 
                    px: 2, 
                    py: 1, 
                    bgcolor: approval.status === 'rejected' ? 'rgba(211, 47, 47, 0.08)' : 'rgba(46, 125, 50, 0.08)',
                    borderRadius: 1,
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {approval.responseMessage}
                    </Typography>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default ClubApprovalInbox;
