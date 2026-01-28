import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  Collapse,
} from '@mui/material';
import { EditOutlined, ExpandMoreOutlined, ChevronRight } from '@mui/icons-material';
import { staffForm as staffFormDefinition } from '../data';
import DocumentFileTile from './DocumentFileTile';
import '../styles/design-tokens.css';

/**
 * Create grouped navigation structure for profile viewing
 * Groups sections into logical categories
 */
const createProfileNavigationStructure = (formDefinition, isLeagueView = true) => {
  if (!formDefinition) return [];
  
  const sectionNames = Object.keys(formDefinition);
  
  return [
    {
      id: 'staff-details',
      title: 'Profile information',
      subgroups: [
        { id: 0, title: 'Staff Information', sectionIndex: 0 },
        { id: 1, title: 'Voluntary Self Identification', sectionIndex: 1 },
        { id: 2, title: 'Agent information', sectionIndex: 2 }
      ]
    },
    {
      id: 'experience',
      title: 'Experience',
      subgroups: [
        { id: 3, title: sectionNames[3] || 'Playing Experience', sectionIndex: 3 },
        { id: 4, title: sectionNames[5] || 'Professional Coaching', sectionIndex: 5 },
        { id: 5, title: sectionNames[6] || 'Professional Sporting Experience', sectionIndex: 6 },
        { id: 6, title: sectionNames[7] || 'Employment History', sectionIndex: 7 }
      ]
    },
    {
      id: 'qualifications',
      title: 'Qualifications',
      subgroups: [
        { id: 7, title: 'Education & Language', sectionIndex: 8 },
        { id: 8, title: 'Licenses & Certifications', sectionIndex: 9 }
      ]
    },
    {
      id: 'documents',
      title: 'Preferences',
      subgroups: [
        { id: 9, title: sectionNames[4] || 'Role and location preferences', sectionIndex: 4 },
        // Only show Profile privacy for league users (section index 10)
        ...(isLeagueView ? [{ id: 10, title: sectionNames[10] || 'Profile privacy', sectionIndex: 10 }] : [])
      ]
    }
  ];
};

/**
 * StaffProfileDetails Component
 * Master-Detail layout for viewing staff profile information
 * @param {object} staffData - The staff member's complete data
 * @param {boolean} isLeagueView - Whether viewing as league admin
 * @param {function} onEdit - Callback when edit button is clicked
 */
function StaffProfileDetails({ staffData, isLeagueView = false, onEdit }) {
  const [expandedGroups, setExpandedGroups] = useState(['staff-details']);
  const [activeSubgroupId, setActiveSubgroupId] = useState(0);

  const navigationData = useMemo(() => 
    createProfileNavigationStructure(staffFormDefinition, isLeagueView),
    [isLeagueView]
  );

  const handleGroupToggle = (groupId) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubgroupClick = (subgroupId) => {
    setActiveSubgroupId(subgroupId);
  };

  const getCurrentSubgroup = () => {
    for (const group of navigationData) {
      const subgroup = group.subgroups.find(sg => sg.id === activeSubgroupId);
      if (subgroup) return subgroup;
    }
    return null;
  };

  const getCurrentSectionData = () => {
    const currentSubgroup = getCurrentSubgroup();
    if (!currentSubgroup || !staffFormDefinition) return null;

    const sectionNames = Object.keys(staffFormDefinition);
    const sectionName = sectionNames[currentSubgroup.sectionIndex];
    const fields = staffFormDefinition[sectionName];

    return { sectionName, fields };
  };

  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (field.type === 'DatePicker') {
      // Format date if needed
      return value;
    }

    return value;
  };

  const sectionData = getCurrentSectionData();
  const currentSubgroup = getCurrentSubgroup();

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)', backgroundColor: '#fafafa' }}>
      {/* Left Sidebar - Navigation */}
      <Box
        sx={{
          width: 280,
          borderRight: '1px solid var(--color-border-primary)',
          backgroundColor: 'var(--color-background-primary)',
          overflow: 'auto',
        }}
      >
        <List disablePadding>
          {navigationData.map((group) => {
            const isExpanded = expandedGroups.includes(group.id);

            return (
              <Box key={group.id}>
                {/* Group Header */}
                <ListItemButton
                  onClick={() => handleGroupToggle(group.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid var(--color-border-primary)',
                    '&:hover': {
                      backgroundColor: 'var(--color-background-secondary)',
                    },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {group.title}
                    </Typography>
                  </Box>

                  {/* Expand/Collapse Icon */}
                  {isExpanded ? (
                    <ExpandMoreOutlined sx={{ color: 'var(--color-text-secondary)', fontSize: 20 }} />
                  ) : (
                    <ChevronRight sx={{ color: 'var(--color-text-secondary)', fontSize: 20 }} />
                  )}
                </ListItemButton>

                {/* Subgroups */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List disablePadding>
                    {group.subgroups?.map((subgroup) => {
                      const isActive = subgroup.id === activeSubgroupId;

                      return (
                        <ListItemButton
                          key={subgroup.id}
                          onClick={() => handleSubgroupClick(subgroup.id)}
                          sx={{
                            py: 1.25,
                            pl: 4,
                            pr: 2,
                            bgcolor: isActive ? 'var(--color-background-secondary)' : 'transparent',
                            borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                            '&:hover': {
                              bgcolor: 'var(--color-background-secondary)',
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: isActive 
                                ? 'var(--color-text-primary)' 
                                : 'var(--color-text-secondary)',
                              fontWeight: isActive ? 500 : 400,
                              fontSize: '0.875rem',
                            }}
                          >
                            {subgroup.title}
                          </Typography>
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Right Content Area - Detail View */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box sx={{ p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-primary)',
              backgroundColor: 'var(--color-background-primary)',
            }}
          >
            {/* Section Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                borderBottom: '1px solid var(--color-border-primary)',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}
              >
                {currentSubgroup?.title || 'Profile Details'}
              </Typography>
              {onEdit && (
                <Button
                  variant="outlined"
                  startIcon={<EditOutlined />}
                  onClick={onEdit}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'var(--color-border-primary)',
                    color: 'var(--color-text-primary)',
                    '&:hover': {
                      borderColor: 'var(--color-primary)',
                      backgroundColor: 'var(--color-background-secondary)',
                    },
                  }}
                >
                  Edit
                </Button>
              )}
            </Box>

            {/* Section Content - Grid Layout */}
            <Box sx={{ p: 3 }}>
              {sectionData && sectionData.fields ? (
                <>
                  <Grid container spacing={3} sx={{ maxWidth: '550px' }}>
                    {sectionData.fields.map((field) => {
                      const value = staffData?.[field.name];
                      
                      // Skip fields that don't have values and aren't required to show
                      if ((value === null || value === undefined || value === '') && field.type === 'ProfilePictureUpload') {
                        return null;
                      }

                      return (
                        <Grid item xs={12} sm={6} key={field.name} sx={{ minWidth: '250px', maxWidth: '250px' }}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.75rem',
                                mb: 0.5,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              {field.label}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                color: 'var(--color-text-primary)',
                                fontSize: '0.9375rem',
                                fontWeight: 400,
                              }}
                            >
                              {formatFieldValue(field, value)}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                  
                  {/* Profile Picture Document Tile - Only show for Staff Information section */}
                  {currentSubgroup?.sectionIndex === 0 && staffData?.picUrl && (
                    <Box sx={{ mt: 3, maxWidth: '550px' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.75rem',
                          mb: 1,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Profile image
                      </Typography>
                      <DocumentFileTile
                        thumbnailUrl={staffData.picUrl}
                        fileName={`${staffData.firstName || 'profile'}_${staffData.lastName || 'picture'}.jpg`}
                        uploadDate={staffData.picUploadDate || 'uploaded Mar 7 2025'}
                        viewUrl={staffData.picUrl}
                        downloadUrl={staffData.picUrl}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No data available for this section
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default StaffProfileDetails;
