import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Switch,
  Divider,
  Button,
} from '@mui/material';
import { CloseOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';

/**
 * DashboardSettingsDrawer - Side panel for managing dashboard visibility settings
 * @param {boolean} open - Whether drawer is open
 * @param {function} onClose - Close handler
 * @param {object} dashboardSettings - Object with dashboard visibility settings
 * @param {function} onUpdateSettings - Callback to update settings
 */
const DashboardSettingsDrawer = ({ open, onClose, dashboardSettings, onUpdateSettings }) => {
  const [localSettings, setLocalSettings] = useState(dashboardSettings);

  const dashboards = [
    { id: 'locationAnalysis', label: 'Location Analysis', description: 'Geographic distribution and insights' },
    { id: 'employmentStability', label: 'Employment Stability', description: 'Employment trends and stability metrics' },
    { id: 'originBreakdown', label: 'Origin Breakdown', description: 'Domestic vs. international talent comparison' },
    { id: 'qualificationStandards', label: 'Qualification Standards', description: 'Coaching license and credential trends' },
    { id: 'talentPipeline', label: 'Talent Pipeline', description: 'Tag progression and talent development pipeline' },
    { id: 'coachLeaderboard', label: 'Coach Leaderboard', description: 'Performance metrics and staff rankings' },
  ];

  const handleToggle = (dashboardId) => {
    setLocalSettings(prev => ({
      ...prev,
      [dashboardId]: !prev[dashboardId]
    }));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(dashboardSettings);
    onClose();
  };

  const handleShowAll = () => {
    const allVisible = {};
    dashboards.forEach(dashboard => {
      allVisible[dashboard.id] = true;
    });
    setLocalSettings(allVisible);
  };

  const handleHideAll = () => {
    const allHidden = {};
    dashboards.forEach(dashboard => {
      allHidden[dashboard.id] = false;
    });
    setLocalSettings(allHidden);
  };

  const visibleCount = Object.values(localSettings).filter(Boolean).length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          width: 420,
          p: 3,
        }
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Club View Dashboard Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Control which dashboards are visible in club view
            </Typography>
          </Box>
          <IconButton onClick={handleCancel} size="small">
            <CloseOutlined />
          </IconButton>
        </Box>

        {/* Info Box */}
        <Box 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: 'var(--color-info-background)', 
            borderRadius: 1,
            border: '1px solid var(--color-info-border)'
          }}
        >
          <Typography variant="body2" sx={{ color: 'var(--color-info-text)', fontSize: '0.813rem' }}>
            <strong>Note:</strong> These settings only affect the club view. League view always shows all dashboards.
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleShowAll}
            startIcon={<VisibilityOutlined />}
            sx={{ flex: 1, textTransform: 'none' }}
          >
            Show All
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleHideAll}
            startIcon={<VisibilityOffOutlined />}
            sx={{ flex: 1, textTransform: 'none' }}
          >
            Hide All
          </Button>
        </Box>

        {/* Visibility Counter */}
        <Box 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: 'var(--color-background-secondary)', 
            borderRadius: 1,
            border: '1px solid var(--color-border-primary)'
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {visibleCount} of {dashboards.length} dashboards visible
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Dashboard Toggle List */}
        <List sx={{ p: 0 }}>
          {dashboards.map((dashboard, index) => (
            <Box key={dashboard.id}>
              <ListItem
                sx={{
                  px: 0,
                  py: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 600, 
                      color: localSettings[dashboard.id] ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      mb: 0.5
                    }}
                  >
                    {dashboard.label}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.813rem'
                    }}
                  >
                    {dashboard.description}
                  </Typography>
                </Box>
                <Switch
                  checked={localSettings[dashboard.id]}
                  onChange={() => handleToggle(dashboard.id)}
                  color="primary"
                />
              </ListItem>
              {index < dashboards.length - 1 && <Divider />}
            </Box>
          ))}
        </List>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 3, borderTop: '1px solid var(--color-border-primary)' }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ flex: 1, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{ flex: 1, textTransform: 'none' }}
            disabled={visibleCount === 0}
          >
            Save Changes
          </Button>
        </Box>

        {/* Warning if no dashboards visible */}
        {visibleCount === 0 && (
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: 'var(--color-error-background)', 
              borderRadius: 1,
              border: '1px solid var(--color-error-border)'
            }}
          >
            <Typography variant="body2" sx={{ color: 'var(--color-error-text)' }}>
              At least one dashboard must be visible
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default DashboardSettingsDrawer;
