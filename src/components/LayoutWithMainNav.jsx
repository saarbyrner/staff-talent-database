import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Select,
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  ClickAwayListener
} from '@mui/material'
import { 
  Notifications
} from '@mui/icons-material'
import MainNavigation from './MainNavigation'
import '../styles/design-tokens.css'

// Mock current user data
const currentUser = {
  name: 'Dr. Sarah Mitchell',
  email: 'sarah.mitchell@example.com',
  role: 'Sports Medicine Director',
  avatar: '👩‍⚕️'
}

// Mock squad data
const availableSquads = [
  { id: 1, name: 'First Team', short: 'FT' },
  { id: 2, name: 'Reserve Team', short: 'RES' },
  { id: 3, name: 'Academy U21', short: 'U21' },
  { id: 4, name: 'Academy U18', short: 'U18' }
]

// Page titles mapping
const pageTitles = {
  '/dashboard': 'Dashboard',
  '/medical': 'Medical',
  '/analysis': 'Analysis',
  '/athlete': 'Athletes',
  '/staff': 'Staff',
  '/workloads': 'Workload',
  '/questionnaires': 'Forms',
  '/forms/form_templates': 'Forms',
  '/forms/form_answers_sets': 'Forms',
  '/planning': 'Calendar',
  '/activity': 'Activity log',
  '/settings': 'Admin',
  '/help': 'Help'
}

function MedinahLayoutWithMainNav({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  // Read persisted nav state from localStorage; default closed (false)
  const persistedNav = (() => {
    try {
      const raw = localStorage.getItem('mainNav:isOpen')
      if (raw === null) return false
      return raw === 'true'
    } catch (e) {
      return false
    }
  })()
  const [isNavOpen, setIsNavOpen] = useState(persistedNav)
  const [currentSquad, setCurrentSquad] = useState(availableSquads[0])
  const [userMenuAnchor, setUserMenuAnchor] = useState(null)
  // Read persisted forms flyout state; default closed
  const persistedForms = (() => {
    try {
      const raw = localStorage.getItem('mainNav:formsOpen')
      if (raw === null) return false
      return raw === 'true'
    } catch (e) {
      return false
    }
  })()
  const [isFormsMenuOpen, setIsFormsMenuOpen] = useState(persistedForms)

  // Determine if we're in league view mode based on path prefix
  const isLeagueView = location.pathname.startsWith('/league')
  const viewMode = isLeagueView ? 'league' : 'default'

  const getPageTitle = () => {
    if (location.pathname === '/league') return 'League'
    if (location.pathname === '/league/analysis') return 'Analysis'
    if (location.pathname === '/league/athlete') return 'Athletes'
    if (location.pathname === '/league/staff') return 'Staff'
    if (location.pathname.startsWith('/league/forms')) return 'Forms'
    if (location.pathname === '/league/planning') return 'Calendar'
    if (location.pathname === '/league/settings') return 'Admin'
    if (location.pathname === '/league/help') return 'Help'
    return pageTitles[location.pathname] || 'Dashboard'
  }

  const handleNavToggle = () => {
    setIsNavOpen((prev) => {
      const next = !prev
      try { localStorage.setItem('mainNav:isOpen', String(next)) } catch (e) {}
      return next
    })
  }

  const handleFormsToggle = () => {
    setIsFormsMenuOpen((prev) => {
      const next = !prev
      try { localStorage.setItem('mainNav:formsOpen', String(next)) } catch (e) {}
      return next
    })
  }

  const handleFormsMenuClose = () => {
    setIsFormsMenuOpen(false)
    try { localStorage.setItem('mainNav:formsOpen', 'false') } catch (e) {}
  }

  const handleFormsSecondaryClick = (path) => {
    // If in league view, prepend /league to the path
    const targetPath = viewMode === 'league' ? `/league${path}` : path
    navigate(targetPath)
    setIsFormsMenuOpen(false)
  }

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleSquadChange = (event) => {
    const squad = availableSquads.find(s => s.id === event.target.value)
    setCurrentSquad(squad)
  }

  const isFormsSection = isFormsMenuOpen
  const formsSecondaryItems = [
    { id: 'form_templates', label: 'Form templates', path: '/forms/form_templates' },
    { id: 'form_responses', label: 'Form responses', path: '/forms/form_answers_sets' }
  ]

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', gap: 0, height: '100vh', bgcolor: 'var(--color-background-primary)' }}>
      {/* Main Navigation */}
      <MainNavigation 
        isOpen={isNavOpen}
        onToggle={handleNavToggle}
        variant="permanent"
        onFormsToggle={handleFormsToggle}
        isFormsMenuOpen={isFormsMenuOpen}
        viewMode={viewMode}
      />

      {/* Secondary Navigation for Forms */}
      {isFormsSection && (
        <ClickAwayListener onClickAway={handleFormsMenuClose}>
          <Box
            className="mainNavBarDesktop__secondaryMenu mainNavBarDesktop__secondaryMenu--open mainNavBarDesktop__secondaryMenu--mainMenuOpen"
            sx={{
              position: 'fixed',
              top: 0,
              left: isNavOpen ? 'var(--layout-nav-width)' : 'var(--layout-nav-width-collapsed)',
              height: '100vh',
              width: 260,
              zIndex: 1200,
              background: viewMode === 'league'
                ? 'linear-gradient(180deg, #C8102E 0%, #a00d25 40%, #8a0b1f 70%, #6a0818 90%, #6a0818 100%)'
                : 'linear-gradient(180deg, #004812 0%, #003a0e 40%, #002a09 70%, #001f06 90%, #001f06 100%)',
              color: '#ffffff',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid rgba(255,255,255,0.12)'
            }}
          >
            <Box className="mainNavBarDesktop__secondaryMenuTitle" sx={{ px: 2, py: 1.5, fontWeight: 600 }}>
              Forms
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
            <List sx={{ py: 0 }}>
              {formsSecondaryItems.map((item) => {
                // Check if item is active, considering league view prefix
                const currentPath = viewMode === 'league' ? `/league${item.path}` : item.path
                const isActive = location.pathname === currentPath
                return (
                  <ListItem key={item.id} disablePadding className={`mainNavBarDesktop__secondaryMenuItem${isActive ? ' mainNavBarDesktop__secondaryMenuItem--active' : ''}`}>
                    <ListItemButton
                      onClick={() => handleFormsSecondaryClick(item.path)}
                      sx={{
                        height: 40,
                        px: 2,
                        position: 'relative',
                        color: '#ffffff',
                        '&::before': isActive ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: '3px',
                          backgroundColor: '#ffffff'
                        } : {},
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.08)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: 14 }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        </ClickAwayListener>
      )}

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Top App Bar */}
        <AppBar 
          position="sticky" 
          elevation={1}
          sx={{ 
            bgcolor: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Page Title */}
            <Typography 
              variant="h6" 
              component="h1"
              sx={{ 
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textTransform: 'none'
              }}
            >
              {getPageTitle()}
            </Typography>

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Squad Selector */}
              <Select
                value={currentSquad.id}
                onChange={handleSquadChange}
                displayEmpty
                size="small"
                sx={{ 
                  fontSize: '14px',
                  minWidth: 160,
                  backgroundColor: '#ffffff',
                  border: 'none',
                  boxShadow: 'none',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  },
                  '& .MuiSelect-select': {
                    py: 1,
                    px: 2
                  }
                }}
              >
                {availableSquads.map(squad => (
                  <MenuItem key={squad.id} value={squad.id}>
                    {squad.name}
                  </MenuItem>
                ))}
              </Select>

              {/* Notifications */}
              <IconButton 
                sx={{ 
                  color: 'var(--color-text-secondary)',
                  '&:hover': { 
                    bgcolor: 'rgba(0, 0, 0, 0.04)' 
                  }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <Avatar 
                onClick={handleUserMenuOpen}
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: 'var(--color-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'var(--color-primary-hover)'
                  }
                }}
              >
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </Avatar>

              {/* User Dropdown Menu */}
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleUserMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleUserMenuClose}>Settings</MenuItem>
                <MenuItem onClick={handleUserMenuClose}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto',
            p: 0,
            bgcolor: 'var(--color-background-primary)'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
    </>
  )
}

export default MedinahLayoutWithMainNav