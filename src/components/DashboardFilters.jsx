import React, { useState, useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Drawer,
  IconButton,
  Typography,
  Divider
} from '@mui/material';
import { Clear, FilterList, ChevronLeft } from '@mui/icons-material';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';

// Predefined experience timeframes
const EXPERIENCE_TIMEFRAMES = [
  { value: 'all', label: 'All Experience Levels' },
  { value: '0-5', label: '0-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10-15', label: '10-15 years' },
  { value: '15-20', label: '15-20 years' },
  { value: '20+', label: '20+ years' }
];

// Predefined trophy ranges
const TROPHY_RANGES = [
  { value: 'all', label: 'All Trophy Counts' },
  { value: '0', label: 'No Trophies' },
  { value: '1-2', label: '1-2 trophies' },
  { value: '3-5', label: '3-5 trophies' },
  { value: '6+', label: '6+ trophies' }
];

/**
 * Comprehensive Dashboard Filters Component - Sidebar Interface
 * Provides filtering across multiple dimensions for staff analysis dashboards
 */
export default function DashboardFilters({ onFilterChange, open, onToggle }) {
  // Filter states - simple single select dropdowns
  const [staffType, setStaffType] = useState('all');
  const [location, setLocation] = useState('all');
  const [watchlistStatus, setWatchlistStatus] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedUEFABadge, setSelectedUEFABadge] = useState('all');
  const [experienceRange, setExperienceRange] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [employmentStatus, setEmploymentStatus] = useState('all');
  const [trophiesRange, setTrophiesRange] = useState('all');

  // Extract unique values from data for filter options
  const filterOptions = useMemo(() => {
    // Get all unique tags
    const tags = new Set();
    staffTalentData.forEach(staff => {
      if (staff.tags && Array.isArray(staff.tags)) {
        staff.tags.forEach(tag => tags.add(tag));
      }
    });

    // Get all unique roles
    const roles = new Set();
    staffTalentData.forEach(staff => {
      if (staff.coachingRoles && Array.isArray(staff.coachingRoles)) {
        staff.coachingRoles.forEach(role => roles.add(role));
      }
      if (staff.execRoles && Array.isArray(staff.execRoles)) {
        staff.execRoles.forEach(role => roles.add(role));
      }
      if (staff.techRoles && Array.isArray(staff.techRoles)) {
        staff.techRoles.forEach(role => roles.add(role));
      }
    });
    currentStaffData.forEach(staff => {
      if (staff.role) roles.add(staff.role);
    });

    // Get UEFA badges from coaching licenses
    const uefaBadges = new Set();
    staffTalentData.forEach(staff => {
      if (staff.coachingLicenses && Array.isArray(staff.coachingLicenses)) {
        staff.coachingLicenses.forEach(license => {
          if (license.toLowerCase().includes('uefa')) {
            uefaBadges.add(license);
          }
        });
      }
    });
    currentStaffData.forEach(staff => {
      if (staff.qualifications && Array.isArray(staff.qualifications)) {
        staff.qualifications.forEach(qual => {
          if (qual.toLowerCase().includes('uefa')) {
            uefaBadges.add(qual);
          }
        });
      }
    });

    // Get unique countries
    const countries = new Set();
    staffTalentData.forEach(staff => {
      if (staff.country) countries.add(staff.country);
    });

    return {
      tags: Array.from(tags).sort(),
      roles: Array.from(roles).sort(),
      uefaBadges: Array.from(uefaBadges).sort(),
      countries: Array.from(countries).sort()
    };
  }, []);

  // Build filter object to pass to parent
  const buildFilters = () => {
    return {
      staffType,
      location,
      watchlistStatus,
      tags: selectedTag === 'all' ? [] : [selectedTag],
      roles: selectedRole === 'all' ? [] : [selectedRole],
      uefaBadges: selectedUEFABadge === 'all' ? [] : [selectedUEFABadge],
      experienceRange: parseExperienceRange(experienceRange),
      countries: selectedCountry === 'all' ? [] : [selectedCountry],
      employmentStatus,
      trophiesRange: parseTrophiesRange(trophiesRange)
    };
  };

  // Parse experience range from predefined timeframes
  const parseExperienceRange = (range) => {
    if (range === 'all') return { min: null, max: null };
    if (range === '0-5') return { min: 0, max: 5 };
    if (range === '5-10') return { min: 5, max: 10 };
    if (range === '10-15') return { min: 10, max: 15 };
    if (range === '15-20') return { min: 15, max: 20 };
    if (range === '20+') return { min: 20, max: null };
    return { min: null, max: null };
  };

  // Parse trophies range from predefined ranges
  const parseTrophiesRange = (range) => {
    if (range === 'all') return { min: null, max: null };
    if (range === '0') return { min: 0, max: 0 };
    if (range === '1-2') return { min: 1, max: 2 };
    if (range === '3-5') return { min: 3, max: 5 };
    if (range === '6+') return { min: 6, max: null };
    return { min: null, max: null };
  };

  // Notify parent of filter changes
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(buildFilters());
    }
  }, [staffType, location, watchlistStatus, selectedTag, selectedRole, selectedUEFABadge, experienceRange, selectedCountry, employmentStatus, trophiesRange, onFilterChange]);

  // Handle reset all filters
  const handleResetFilters = () => {
    setStaffType('all');
    setLocation('all');
    setWatchlistStatus('all');
    setSelectedTag('all');
    setSelectedRole('all');
    setSelectedUEFABadge('all');
    setExperienceRange('all');
    setSelectedCountry('all');
    setEmploymentStatus('all');
    setTrophiesRange('all');
  };

  // Check if any filters are active
  const hasActiveFilters = staffType !== 'all' || location !== 'all' || watchlistStatus !== 'all' ||
    selectedTag !== 'all' || selectedRole !== 'all' || selectedUEFABadge !== 'all' ||
    experienceRange !== 'all' || selectedCountry !== 'all' || employmentStatus !== 'all' || trophiesRange !== 'all';

  return (
    <>
      {/* Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={onToggle}
        variant="persistent"
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)',
            borderLeft: '1px solid var(--color-border-primary)',
            borderRight: 'none',
            bgcolor: 'white',
            position: 'fixed'
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid var(--color-border-primary)',
            bgcolor: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Filters
              </Typography>
              {hasActiveFilters && (
                <Box
                  sx={{
                    bgcolor: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: '12px',
                    px: 1,
                    py: 0.25,
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  {[staffType, location, watchlistStatus, selectedTag, selectedRole, selectedUEFABadge, experienceRange, selectedCountry, employmentStatus, trophiesRange].filter(v => v !== 'all').length}
                </Box>
              )}
            </Box>
            <IconButton onClick={onToggle} size="small">
              <ChevronLeft />
            </IconButton>
          </Box>

          {/* Filters Content */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={2.5}>
              {/* Staff Type */}
              <FormControl size="small" fullWidth>
                <InputLabel>Staff Type</InputLabel>
                <Select
                  value={staffType}
                  label="Staff Type"
                  onChange={(e) => setStaffType(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="myStaff">My Staff</MenuItem>
                  <MenuItem value="database">Database Talent</MenuItem>
                </Select>
              </FormControl>

              {/* Location */}
              <FormControl size="small" fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  value={location}
                  label="Location"
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <MenuItem value="all">All Locations</MenuItem>
                  <MenuItem value="domestic">Domestic (US/CA)</MenuItem>
                  <MenuItem value="international">International</MenuItem>
                </Select>
              </FormControl>

              {/* Watchlist Status */}
              <FormControl size="small" fullWidth>
                <InputLabel>Watchlist</InputLabel>
                <Select
                  value={watchlistStatus}
                  label="Watchlist"
                  onChange={(e) => setWatchlistStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="watchlist">On Watchlist</MenuItem>
                  <MenuItem value="nonWatchlist">Not on Watchlist</MenuItem>
                </Select>
              </FormControl>

              {/* Employment Status */}
              <FormControl size="small" fullWidth>
                <InputLabel>Employment</InputLabel>
                <Select
                  value={employmentStatus}
                  label="Employment"
                  onChange={(e) => setEmploymentStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="employed">Employed</MenuItem>
                  <MenuItem value="unemployed">Free Agent</MenuItem>
                </Select>
              </FormControl>

              <Divider />

              {/* Tags */}
              {filterOptions.tags.length > 0 && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Tags</InputLabel>
                  <Select
                    value={selectedTag}
                    label="Tags"
                    onChange={(e) => setSelectedTag(e.target.value)}
                  >
                    <MenuItem value="all">All Tags</MenuItem>
                    {filterOptions.tags.map((tag) => (
                      <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Roles */}
              {filterOptions.roles.length > 0 && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedRole}
                    label="Role"
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    {filterOptions.roles.slice(0, 15).map((role) => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* UEFA Badges */}
              {filterOptions.uefaBadges.length > 0 && (
                <FormControl size="small" fullWidth>
                  <InputLabel>UEFA License</InputLabel>
                  <Select
                    value={selectedUEFABadge}
                    label="UEFA License"
                    onChange={(e) => setSelectedUEFABadge(e.target.value)}
                  >
                    <MenuItem value="all">All Licenses</MenuItem>
                    {filterOptions.uefaBadges.map((badge) => (
                      <MenuItem key={badge} value={badge}>{badge}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Experience */}
              <FormControl size="small" fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={experienceRange}
                  label="Experience"
                  onChange={(e) => setExperienceRange(e.target.value)}
                >
                  {EXPERIENCE_TIMEFRAMES.map((tf) => (
                    <MenuItem key={tf.value} value={tf.value}>{tf.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Trophies Won */}
              <FormControl size="small" fullWidth>
                <InputLabel>Trophies Won</InputLabel>
                <Select
                  value={trophiesRange}
                  label="Trophies Won"
                  onChange={(e) => setTrophiesRange(e.target.value)}
                >
                  {TROPHY_RANGES.map((tf) => (
                    <MenuItem key={tf.value} value={tf.value}>{tf.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Countries */}
              {filterOptions.countries.length > 0 && (
                <FormControl size="small" fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={selectedCountry}
                    label="Country"
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <MenuItem value="all">All Countries</MenuItem>
                    {filterOptions.countries.slice(0, 15).map((country) => (
                      <MenuItem key={country} value={country}>{country}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          </Box>

          {/* Footer with Reset Button */}
          {hasActiveFilters && (
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid var(--color-border-primary)',
              bgcolor: 'white'
            }}>
              <Button
                startIcon={<Clear />}
                onClick={handleResetFilters}
                size="small"
                variant="outlined"
                fullWidth
              >
                Reset All Filters
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}

/**
 * Helper to generate consistent coaching statistics based on staff ID
 */
const generateStats = (id) => {
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
    xgDiff: (random(6) * 1.5 - 0.5).toFixed(2),
    squadValuePerf: (random(7) * 40 - 10).toFixed(1),
    possession: 40 + Math.floor(random(8) * 30),
    ppda: (6 + random(9) * 10).toFixed(1),
    u23Minutes: Math.floor(random(10) * 40),
  };
};

/**
 * Helper function to apply filters to staff data
 * Can be imported and used in any dashboard component
 */
export function applyFilters(staffData, currentStaffData, filters) {
  if (!filters) return staffData;

  let filtered = [];

  // Filter by staff type
  if (filters.staffType === 'all') {
    filtered = [...staffData];
  } else if (filters.staffType === 'myStaff') {
    // Return current staff data
    filtered = currentStaffData.map(staff => ({
      ...staff,
      // Normalize field names
      firstName: staff.firstname || staff.firstName,
      lastName: staff.lastname || staff.lastName,
      isMyStaff: true
    }));
  } else if (filters.staffType === 'database') {
    filtered = [...staffData];
  }

  // Apply location filter (domestic vs international)
  if (filters.location !== 'all' && filtered.length > 0) {
    filtered = filtered.filter(staff => {
      const country = staff.country;
      if (filters.location === 'domestic') {
        return country === 'USA' || country === 'Canada';
      } else if (filters.location === 'international') {
        return country !== 'USA' && country !== 'Canada';
      }
      return true;
    });
  }

  // Apply watchlist filter
  if (filters.watchlistStatus !== 'all') {
    filtered = filtered.filter(staff => {
      const isOnWatchlist = staff.watchlistCount > 0 || staff.isWatchlisted;
      return filters.watchlistStatus === 'watchlist' ? isOnWatchlist : !isOnWatchlist;
    });
  }

  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(staff => {
      if (!staff.tags || !Array.isArray(staff.tags)) return false;
      return filters.tags.some(tag => staff.tags.includes(tag));
    });
  }

  // Apply roles filter
  if (filters.roles && filters.roles.length > 0) {
    filtered = filtered.filter(staff => {
      const staffRoles = [
        ...(staff.coachingRoles || []),
        ...(staff.execRoles || []),
        ...(staff.techRoles || []),
        staff.role
      ].filter(Boolean);
      return filters.roles.some(role => staffRoles.includes(role));
    });
  }

  // Apply UEFA badges filter
  if (filters.uefaBadges && filters.uefaBadges.length > 0) {
    filtered = filtered.filter(staff => {
      const licenses = [
        ...(staff.coachingLicenses || []),
        ...(staff.qualifications || [])
      ];
      return filters.uefaBadges.some(badge => 
        licenses.some(license => license === badge)
      );
    });
  }

  // Apply experience range filter
  if (filters.experienceRange) {
    const { min, max } = filters.experienceRange;
    if (min !== null || max !== null) {
      filtered = filtered.filter(staff => {
        // Calculate years of experience
        let yearsExp = staff.yearsExp || staff.yearsOfExperience;
        
        // If not directly available, try to calculate from employment history
        if (!yearsExp && staff.currentEmployer) {
          const match = staff.currentEmployer.match(/\((\d{4})-/);
          if (match) {
            yearsExp = new Date().getFullYear() - parseInt(match[1]);
          }
        }

        if (!yearsExp) return min === null && max === null;
        
        if (min !== null && yearsExp < min) return false;
        if (max !== null && yearsExp > max) return false;
        return true;
      });
    }
  }

  // Apply countries filter
  if (filters.countries && filters.countries.length > 0) {
    filtered = filtered.filter(staff => 
      filters.countries.includes(staff.country)
    );
  }

  // Apply employment status filter
  if (filters.employmentStatus !== 'all') {
    filtered = filtered.filter(staff => {
      const isEmployed = staff.currentEmployer && 
        !staff.currentEmployer.toLowerCase().includes('free agent') &&
        staff.currentEmployer !== 'Unemployed';
      
      return filters.employmentStatus === 'employed' ? isEmployed : !isEmployed;
    });
  }

  // Apply trophies range filter
  if (filters.trophiesRange) {
    const { min, max } = filters.trophiesRange;
    if (min !== null || max !== null) {
      filtered = filtered.filter(staff => {
        // Check if staff member has coaching experience to generate stats
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
        
        if (!isCoach) {
          // Non-coaches have 0 trophies
          return min === 0 && (max === null || max >= 0);
        }
        
        // Generate trophies count from coaching stats
        const stats = generateStats(staff.id);
        const trophies = stats.trophies;
        
        if (min !== null && trophies < min) return false;
        if (max !== null && trophies > max) return false;
        return true;
      });
    }
  }

  return filtered;
}
