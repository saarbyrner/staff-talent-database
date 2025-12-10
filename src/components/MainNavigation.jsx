import React from 'react'
import PropTypes from 'prop-types'
import { useLocation, useNavigate } from 'react-router-dom'

const KitmanLogo = '/assets/logos/Kitman Labs base.png'
const MLSLogo = '/assets/logos/teams/mls/MLS.png'
const TimbersLogo = '/assets/logos/teams/mls/timbers.png'

import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  LocalHospitalOutlined,
  AnalyticsOutlined,
  PeopleOutlined,
  FitnessCenterOutlined,
  AssignmentOutlined,
  CalendarMonthOutlined,
  HistoryOutlined,
  SettingsOutlined,
  HelpOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  BadgeOutlined
} from '@mui/icons-material'
import '../styles/design-tokens.css'

// Navigation items configuration
const navigationItems = [
  { 
    id: 'medical', 
    label: 'Medical', 
    icon: LocalHospitalOutlined, 
    path: '/medical',
    section: 'main'
  },
  { 
    id: 'analysis', 
    label: 'Analysis', 
    icon: AnalyticsOutlined, 
    path: '/analysis',
    section: 'main'
  },
  { 
    id: 'athletes', 
    label: 'Athletes', 
    icon: PeopleOutlined, 
    path: '/athlete',
    section: 'main'
  },
  { 
    id: 'staff', 
    label: 'Staff', 
    icon: BadgeOutlined, 
    path: '/staff',
    section: 'main'
  },
  { 
    id: 'workload', 
    label: 'Workload', 
    icon: FitnessCenterOutlined, 
    path: '/workloads',
    section: 'main'
  },
  { 
    id: 'forms', 
    label: 'Forms', 
    icon: AssignmentOutlined, 
    path: '/forms/form_templates',
    section: 'main'
  },
  { 
    id: 'calendar', 
    label: 'Calendar', 
    icon: CalendarMonthOutlined, 
    path: '/planning',
    section: 'main'
  },
  { 
    id: 'activity-log', 
    label: 'Activity log', 
    icon: HistoryOutlined, 
    path: '/activity',
    section: 'main'
  },
  { 
    id: 'admin', 
    label: 'Admin', 
    icon: SettingsOutlined, 
    path: '/settings',
    section: 'main'
  }
]

const bottomItems = [
  { 
    id: 'help', 
    label: 'Help', 
    icon: HelpOutlined, 
    path: '/help'
  }
]

const DRAWER_WIDTH = 240
const DRAWER_WIDTH_COLLAPSED = 60

function MainNavigation({ 
  isOpen = true, 
  onToggle, 
  variant = 'permanent',
  onFormsToggle = () => {},
  isFormsMenuOpen = false,
  viewMode = 'default', // 'default' or 'league'
  ...props 
}) {
  const location = useLocation()
  const navigate = useNavigate()

  // Filter navigation items based on view mode
  const getFilteredNavigationItems = () => {
    if (viewMode === 'league') {
      // Remove medical, workload, and activity from league view
      return navigationItems.filter(item => 
        !['medical', 'workload', 'activity-log'].includes(item.id)
      )
    }
    return navigationItems
  }

  const handleItemClick = (item) => {
    if (item.id === 'forms') {
      // Toggle the forms flyover only; do not navigate
      onFormsToggle()
      return
    }
    // If in league view, prepend /league to the path
    const targetPath = viewMode === 'league' ? `/league${item.path}` : item.path
    navigate(targetPath)
  }

  const handleLogoClick = () => {
    // Toggle between league and club view
    if (viewMode === 'league') {
      navigate('/') // Go to club home
    } else {
      navigate('/league') // Go to league home
    }
  }

  const renderNavItem = (item, isCollapsed = false) => {
    // Check if item is active, considering league view prefix
    const currentPath = viewMode === 'league' ? `/league${item.path}` : item.path
    const isActive = item.id === 'forms'
      ? (viewMode === 'league' ? location.pathname.startsWith('/league/forms') : location.pathname.startsWith('/forms')) || isFormsMenuOpen
      : location.pathname === currentPath
    const IconComponent = item.icon

    const button = (
      <ListItemButton
            onClick={() => handleItemClick(item)}
            sx={{
              height: 40,
              justifyContent: isCollapsed ? 'center' : 'initial',
              pl: isCollapsed ? 0 : 2,
              pr: isCollapsed ? 0 : 2,
              py: 1,
              ml: 0,
              mr: 0,
              mb: 0.5,
              position: 'relative',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              color: '#ffffff',
              '&::before': isActive ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '3px',
                backgroundColor: '#ffffff',
                borderRadius: '0 2px 2px 0'
              } : {},
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isCollapsed ? 0 : 2,
                justifyContent: 'center',
                color: 'inherit',
                flexShrink: 0
              }}
            >
              <IconComponent sx={{ fontSize: 20 }} />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary={item.label}
                sx={{ 
                  flex: 1,
                  overflow: 'hidden',
                  '& .MuiTypography-root': {
                    fontSize: '14px',
                    fontWeight: 400,
                    textTransform: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }
                }} 
              />
            )}
          </ListItemButton>
    )

    return (
      <ListItem 
        key={item.id} 
        disablePadding 
        sx={{ 
          display: 'block',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          px: 0,
          mx: 0
        }}
      >
        {isCollapsed ? (
          <Tooltip title={item.label} placement="right">
            {button}
          </Tooltip>
        ) : (
          button
        )}
      </ListItem>
    )
  }

  const drawerContent = (
    <Box
      sx={{
        width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        height: '100vh',
        background: viewMode === 'league' 
          ? 'linear-gradient(180deg, #C8102E 0%, #a00d25 40%, #8a0b1f 70%, #6a0818 90%, #6a0818 100%)'
          : 'linear-gradient(180deg, #004812 0%, #003a0e 40%, #002a09 70%, #001f06 90%, #001f06 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden'
      }}
    >
      {/* Header with Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          p: 2,
          minHeight: 32,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8
          }
        }}
        onClick={handleLogoClick}
      >
        <Box
          sx={{
            width: isOpen ? 'auto' : 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={viewMode === 'league' ? MLSLogo : TimbersLogo}
            alt={viewMode === 'league' ? 'MLS' : 'Portland Timbers'}
            style={{
              height: '100%',
              width: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'screen'
            }}
          />
        </Box>
      </Box>

      {/* Main Navigation Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
        <List disablePadding sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          {getFilteredNavigationItems().map((item) => renderNavItem(item, !isOpen))}
        </List>
      </Box>

      {/* Bottom Items */}
      <Box sx={{ overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
        <List disablePadding sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          {bottomItems.map((item) => renderNavItem(item, !isOpen))}
        </List>
        
        {/* Collapse/Expand Button - Only at bottom, left aligned */}
        <Box sx={{ p: 1, textAlign: isOpen ? 'left' : 'center', pl: isOpen ? 2 : 1 }}>
          <IconButton
            onClick={onToggle}
            sx={{ 
              color: '#9ca3af',
              '&:hover': { color: '#ffffff' },
              p: 0.5
            }}
          >
            {isOpen ? <ChevronLeftOutlined /> : <ChevronRightOutlined />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={variant}
      open={isOpen}
      onClose={onToggle}
      sx={{
        width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
        flexShrink: 0,
        mr: 0,
        '& .MuiDrawer-paper': {
          marginRight: 0,
          width: isOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'none',
          overflowX: 'hidden'
        }
      }}
      {...props}
    >
      {drawerContent}
    </Drawer>
  )
}

MainNavigation.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  variant: PropTypes.oneOf(['permanent', 'persistent', 'temporary']),
  onFormsToggle: PropTypes.func,
  isFormsMenuOpen: PropTypes.bool,
  viewMode: PropTypes.oneOf(['default', 'league'])
}

export default MainNavigation