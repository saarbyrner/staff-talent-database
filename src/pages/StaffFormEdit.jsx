import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormGroup,
  Checkbox,
  Chip,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  CircularProgress,
  Collapse
} from '@mui/material';
import { 
  ArrowBack, 
  SaveOutlined, 
  ExpandMoreOutlined, 
  DragIndicatorOutlined, 
  CloudUpload, 
  InsertDriveFile,
  ChevronRight as ChevronRightIcon,
  RadioButtonUnchecked,
  CheckCircle
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { staffForm as staffFormDefinition } from '../data';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import '../styles/design-tokens.css';

/**
 * Create grouped navigation structure for the form
 * Groups sections into logical categories with progress tracking
 */
const createFormNavigationStructure = (formDefinition, isLeagueView = true) => {
  if (!formDefinition) return [];
  
  const sectionNames = Object.keys(formDefinition);
  
  return [
    {
      id: 'contact-info',
      title: 'Profile Details',
      subgroups: [
        { id: 0, title: 'Staff Information', sectionIndex: 0, isCompleted: false },
        { id: 1, title: 'Voluntary Self Identification', sectionIndex: 1, isCompleted: false },
  { id: 2, title: 'Agent information', sectionIndex: 2, isCompleted: false }
      ]
    },
    // Removed Personal Information group
    {
      id: 'experience',
      title: 'Experience',
      subgroups: [
        { id: 3, title: sectionNames[3] || 'Playing Experience', sectionIndex: 3, isCompleted: false },
        { id: 4, title: sectionNames[5] || 'Professional Coaching Section', sectionIndex: 5, isCompleted: false },
        { id: 5, title: sectionNames[6] || 'Professional Sporting Experience Section', sectionIndex: 6, isCompleted: false },
        { id: 6, title: sectionNames[7] || 'Employment History Section', sectionIndex: 7, isCompleted: false }
      ]
    },
    {
      id: 'education',
      title: 'Qualifications',
      subgroups: [
        { id: 7, title: 'Education & Language', sectionIndex: 8, isCompleted: false },
        { id: 8, title: 'Licenses & Certifications', sectionIndex: 9, isCompleted: false }
      ]
    },
    {
      id: 'documents',
      title: 'Preferences',
      subgroups: [
        { id: 9, title: sectionNames[4] || 'Interest Section', sectionIndex: 4, isCompleted: false },
        // Only show Profile privacy for league users (section index 10)
        ...(isLeagueView ? [{ id: 10, title: sectionNames[10] || 'Profile privacy', sectionIndex: 10, isCompleted: false }] : [])
      ]
    },
    {
      id: 'consent',
      title: 'Consent',
      subgroups: [
        { id: 11, title: sectionNames[11] || 'Consent', sectionIndex: 11, isCompleted: false }
      ]
    }
  ];
};

/**
 * Staff Form Edit Page
 * Displays the staff form in edit/input mode for a specific staff member
 * Similar to the preview tab in form builder, but standalone for editing staff data
 */
function StaffFormEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're creating a new staff member (either id is undefined or 'new')
  const isNewStaff = !id || id === 'new' || location.pathname.includes('/new');

  // Debug logging
  console.log('StaffFormEdit - location.pathname:', location.pathname);
  console.log('StaffFormEdit - id:', id);
  console.log('StaffFormEdit - isNewStaff:', isNewStaff);

  // Determine if we're viewing from league context
  const isLeagueView = location.pathname.startsWith('/league');

  // Find staff member (or null if creating new)
  const staffMember = React.useMemo(() => {
    // If creating new staff, return null
    if (isNewStaff) return null;
    
    let member = staffTalentData.find(s => s.id === id);
    if (member) return { ...member, source: 'talent' };
    
    member = currentStaffData.find(s => s.id === parseInt(id));
    if (member) return { ...member, source: 'current' };
    
    return null;
  }, [id, isNewStaff]);

  console.log('StaffFormEdit - staffMember:', staffMember);
  console.log('StaffFormEdit - isNewStaff check:', isNewStaff, '- Will show error?', !isNewStaff && !staffMember);

  // Initialize form values from staff member data
  const [formValues, setFormValues] = React.useState(() => {
    if (!staffMember) return {};
    
    // Map staff member data to form field names
    const values = {};
    if (staffMember.source === 'talent') {
      // Contact Information
      values.firstName = staffMember.firstName || '';
      values.lastName = staffMember.lastName || '';
      values.phone = staffMember.phone || '';
      values.email = staffMember.email || '';
      values.country = staffMember.country || '';
      values.state = staffMember.state || '';
      values.city = staffMember.city || '';
      values.usSponsorship = staffMember.workAuthUS ? 'No' : 'Yes';
      values.caSponsorship = staffMember.workAuthCA ? 'No' : 'Yes';
      
      // Voluntary Self Identification
      values.gender = staffMember.gender || '';
      values.ethnicity = staffMember.ethnicity || '';
      
      // Agent & Playing Experience
      values.hasAgent = staffMember.hasAgent ? 'Yes' : 'No';
      values.agentName = staffMember.agentName || '';
      values.agencyName = staffMember.agencyName || '';
      values.proPlayerExp = staffMember.proPlayerExp ? 'Yes' : 'No';
      values.mlsPlayerExp = staffMember.mlsPlayerExp ? 'Yes' : 'No';
      values.mlsClubsPlayed = staffMember.mlsClubsPlayed || [];
      values.otherPlayerExp = staffMember.otherPlayerExp || '';
      
      // Interest Section
      values.interestArea = staffMember.interestArea || '';
      values.coachingRoles = staffMember.coachingRoles || [];
      values.execRoles = staffMember.execRoles || [];
      values.techRoles = staffMember.techRoles || [];
      values.relocation = staffMember.relocation || [];
      
      // Professional Coaching Section
      values.proCoachExpUpdate = staffMember.proCoachExpUpdate ? 'Yes' : 'No';
      values.prevMlsCoachExp = staffMember.prevMlsCoachExp ? 'Yes' : 'No';
      values.mlsCoachingExpList = staffMember.mlsCoachingExpList || [];
      values.mlsClubsCoached = staffMember.mlsClubsCoached || [];
      values.nonMlsCoachExp = staffMember.nonMlsCoachExp || [];
      
      // Professional Sporting Experience Section
      values.proSportingExpUpdate = staffMember.proSportingExpUpdate ? 'Yes' : 'No';
      values.prevMlsSportingExp = staffMember.prevMlsSportingExp ? 'Yes' : 'No';
      values.mlsClubsSporting = staffMember.mlsClubsSporting || [];
      values.nonMlsSportingExp = staffMember.nonMlsSportingExp || [];
      values.sportingVertical = staffMember.sportingVertical || [];
      
      // Employment History Section
      values.currentlyEmployed = staffMember.currentlyEmployed ? 'Yes' : 'No';
      values.currentEmployer = staffMember.currentEmployer || '';
      values.prevEmployer1 = staffMember.prevEmployer1 || '';
      values.prevEmployer2 = staffMember.prevEmployer2 || '';
      values.prevEmployer3 = staffMember.prevEmployer3 || '';
      values.prevEmployer4 = staffMember.prevEmployer4 || '';
      
      // Education & Languages Section
      values.highestDegree = Array.isArray(staffMember.highestDegree) ? staffMember.highestDegree : (staffMember.degree ? [staffMember.degree] : []);
      values.mlsProgramming = staffMember.mlsProgramming || staffMember.mlsPrograms || [];
      values.coachingLicenses = staffMember.coachingLicenses || [];
      values.sportingDirectorCerts = staffMember.sportingDirectorCerts || staffMember.sportingCerts || [];
      values.otherLicenses = staffMember.otherLicenses ? 'Yes' : 'No';
      values.otherLicensesList = staffMember.otherLicensesList || '';
      values.languages = staffMember.languages || [];
      
      // Upload Documents
      values.profilePic = staffMember.picUrl || '';
      values.resume = staffMember.resumeUrl || '';
      values.coachingLicenseDoc = staffMember.coachingLicenseDoc || '';
      values.otherCertsDoc = staffMember.otherCertsDoc || '';
      
      // Preferences
      values.profilePrivacy = staffMember.profilePrivacy || 'Public';
    } else if (staffMember.source === 'current') {
      values.firstName = staffMember.firstname || '';
      values.lastName = staffMember.lastname || '';
      values.phone = staffMember.phone || '';
      values.email = staffMember.email || '';
      values.country = staffMember.country || '';
      values.state = staffMember.state || '';
      values.city = staffMember.city || '';
    }
    
    return values;
  });

  // Create navigation structure with progress tracking
  const [navigationData, setNavigationData] = React.useState(() => 
    createFormNavigationStructure(staffFormDefinition, isLeagueView)
  );

  // State for accordion expansion and navigation
  const [expandedGroups, setExpandedGroups] = React.useState(() => {
    // Auto-expand the first group
    const firstGroup = navigationData[0];
    return firstGroup ? [firstGroup.id] : [];
  });
  const [activeSubgroupId, setActiveSubgroupId] = React.useState(() => {
    // Set first subgroup as active
    const firstGroup = navigationData[0];
    return firstGroup?.subgroups[0]?.id ?? 0;
  });
  const [selectedFieldId, setSelectedFieldId] = React.useState(null);
  const fieldRefs = React.useRef({});

  // Helper functions for navigation
  const flattenSubgroups = React.useMemo(() => {
    return navigationData.flatMap(group => group.subgroups || []);
  }, [navigationData]);

  const getCurrentSubgroup = React.useCallback(() => {
    return flattenSubgroups.find(sub => sub.id === activeSubgroupId);
  }, [flattenSubgroups, activeSubgroupId]);

  const getCurrentSectionIndex = React.useCallback(() => {
    const subgroup = getCurrentSubgroup();
    return subgroup?.sectionIndex ?? 0;
  }, [getCurrentSubgroup]);

  const canGoNext = React.useMemo(() => {
    const currentIndex = flattenSubgroups.findIndex(sub => sub.id === activeSubgroupId);
    return currentIndex < flattenSubgroups.length - 1;
  }, [flattenSubgroups, activeSubgroupId]);

  const canGoBack = React.useMemo(() => {
    const currentIndex = flattenSubgroups.findIndex(sub => sub.id === activeSubgroupId);
    return currentIndex > 0;
  }, [flattenSubgroups, activeSubgroupId]);

  const calculateGroupProgress = (group) => {
    if (!group.subgroups || group.subgroups.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    const completed = group.subgroups.filter(sub => sub.isCompleted).length;
    const total = group.subgroups.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubgroupClick = (subgroupId) => {
    setActiveSubgroupId(subgroupId);
    const subgroup = flattenSubgroups.find(sub => sub.id === subgroupId);
    if (subgroup) {
      const group = navigationData.find(g => 
        g.subgroups?.some(s => s.id === subgroupId)
      );
      if (group && !expandedGroups.includes(group.id)) {
        setExpandedGroups(prev => [...prev, group.id]);
      }
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      const currentIndex = flattenSubgroups.findIndex(sub => sub.id === activeSubgroupId);
      const nextSubgroup = flattenSubgroups[currentIndex + 1];
      if (nextSubgroup) {
        handleSubgroupClick(nextSubgroup.id);
      }
    }
  };

  const handlePrevious = () => {
    if (canGoBack) {
      const currentIndex = flattenSubgroups.findIndex(sub => sub.id === activeSubgroupId);
      const prevSubgroup = flattenSubgroups[currentIndex - 1];
      if (prevSubgroup) {
        handleSubgroupClick(prevSubgroup.id);
      }
    }
  };


  const handleBack = () => {
    const basePath = isLeagueView ? '/league/staff' : '/staff';
    if (isNewStaff) {
      navigate(basePath);
    } else {
      navigate(`${basePath}/${id}`);
    }
  };

  const handleValueChange = (fieldName, value) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFieldClick = (fieldId, sectionIndex) => {
    // Find the subgroup for this section
    const subgroup = flattenSubgroups.find(sub => sub.sectionIndex === sectionIndex);
    if (subgroup) {
      handleSubgroupClick(subgroup.id);
    }
    // Set selected field
    setSelectedFieldId(fieldId);
    // Scroll to field
    setTimeout(() => {
      if (fieldRefs.current[fieldId]) {
        fieldRefs.current[fieldId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleCheckboxGroupChange = (fieldName, option) => (event) => {
    const isChecked = event.target.checked;
    setFormValues(prev => {
      const current = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      
      // Special handling for "Not Applicable" - it clears all other selections
      if (option === 'Not Applicable' && isChecked) {
        return { ...prev, [fieldName]: ['Not Applicable'] };
      }
      
      // If checking any other option, remove "Not Applicable"
      if (isChecked) {
        const withoutNA = current.filter(v => v !== 'Not Applicable');
        return { ...prev, [fieldName]: [...withoutNA, option] };
      }
      
      // Unchecking
      return { ...prev, [fieldName]: current.filter(value => value !== option) };
    });
  };

  const handleSave = () => {
    console.log('Saving form values:', formValues);
    // In a real app, this would save to the backend
    if (isNewStaff) {
      alert('New staff member created successfully!');
    } else {
      alert('Form saved successfully!');
    }
    const basePath = isLeagueView ? '/league/staff' : '/staff';
    navigate(basePath);
  };

  const evaluateDependency = (field) => {
    if (!field.dependency) return true;
    
    // Handle complex conditional expressions like "interestArea == 'Coaching'"
    if (typeof field.dependency === 'string' && field.dependency.includes('==')) {
      const [fieldName, expectedValue] = field.dependency.split('==').map(s => s.trim().replace(/'/g, ''));
      return formValues[fieldName] === expectedValue;
    }
    
    // Simple field dependency - check if parent field is truthy or "Yes"
    const dependentValue = formValues[field.dependency];
    
    // For array values (MultiSelect), check if "Other" is included
    if (Array.isArray(dependentValue)) {
      return dependentValue.includes('Other');
    }
    
    return dependentValue === 'Yes' || dependentValue === true;
  };

  const renderField = (field, sectionIndex, fieldIndex) => {
    if (!evaluateDependency(field)) return null;

    const fieldId = field.name;
    const value = formValues[fieldId];

    let control = null;

    switch (field.type) {
      case 'TextField':
        control = (
          <TextField
            variant="filled"
            size="small"
            fullWidth
            placeholder={field.helperText || `Enter ${field.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => handleValueChange(fieldId, e.target.value)}
            multiline={field.multiline}
            rows={field.multiline ? 3 : 1}
          />
        );
        break;

      case 'Select':
        control = (
          <TextField
            select
            variant="filled"
            size="small"
            fullWidth
            value={value || ''}
            onChange={(e) => handleValueChange(fieldId, e.target.value)}
          >
            {field.options?.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );
        break;

      case 'MultiSelect':
        control = (
          <TextField
            select
            variant="filled"
            size="small"
            fullWidth
            value={Array.isArray(value) ? value : []}
            onChange={(e) => handleValueChange(fieldId, e.target.value)}
            SelectProps={{
              multiple: true,
              renderValue: (selected) => {
                if (selected.length === 0) {
                  return <em>Select options...</em>;
                }
                return selected.join(', ');
              }
            }}
          >
            {field.options?.map(option => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={Array.isArray(value) ? value.includes(option) : false} />
                {option}
              </MenuItem>
            ))}
          </TextField>
        );
        break;

      case 'RadioGroup':
        control = (
          <FormControl component="fieldset">
            <RadioGroup
              value={value || ''}
              onChange={(e) => handleValueChange(fieldId, e.target.value)}
            >
              {field.options?.map(option => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
        break;

      case 'CheckboxGroup':
        control = (
          <FormGroup>
            {field.options?.map(option => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={handleCheckboxGroupChange(fieldId, option)}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        );
        break;

      case 'DatePicker':
        control = (
          <DatePicker
            value={value ? dayjs(value) : null}
            onChange={(newValue) => handleValueChange(fieldId, newValue ? newValue.toISOString() : '')}
            slotProps={{
              textField: {
                variant: 'filled',
                size: 'small',
                fullWidth: true,
                placeholder: 'Select date'
              }
            }}
          />
        );
        break;

      case 'FileUpload':
        control = (
          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              sx={{ textTransform: 'none' }}
            >
              Choose File
              <input
                type="file"
                hidden
                accept={fieldId.includes('Pic') || fieldId.includes('picture') ? '.jpg,.jpeg,.png' : '.pdf,.doc,.docx'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      alert('File size must be less than 10MB');
                      return;
                    }
                    handleValueChange(fieldId, file);
                  }
                }}
              />
            </Button>
            {value && typeof value === 'object' && value.name && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'var(--color-text-secondary)' }}>
                Selected: {value.name} ({(value.size / 1024).toFixed(1)} KB)
              </Typography>
            )}
            {value && typeof value === 'string' && value.startsWith('http') && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <InsertDriveFile fontSize="small" />
                <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                  {value.split('/').pop()}
                </Typography>
              </Box>
            )}
          </Box>
        );
        break;

      case 'ProfilePictureUpload':
        control = (
          <ProfilePictureUpload
            value={value}
            onChange={(file) => handleValueChange(fieldId, file)}
          />
        );
        break;

      default:
        control = (
          <TextField
            variant="filled"
            size="small"
            fullWidth
            placeholder={`Enter ${field.label.toLowerCase()}`}
            value={value || ''}
            onChange={(e) => handleValueChange(fieldId, e.target.value)}
          />
        );
    }

    return (
      <Box
        key={`${sectionIndex}-${fieldIndex}`}
        ref={(el) => { fieldRefs.current[fieldId] = el }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          py: 1.5,
          borderBottom: '1px solid var(--color-border-secondary)',
          scrollMarginTop: '16px'
        }}
      >
        <Typography sx={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {field.label}
          {field.required && (
            <Typography component="span" sx={{ color: 'var(--color-error)', ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
        {field.helperText && (
          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mt: -0.5 }}>
            {field.helperText}
          </Typography>
        )}
        <Box
          sx={{
            mt: 0.5,
            width: '100%',
            maxWidth: 480,
            alignSelf: 'flex-start'
          }}
        >
          {control}
        </Box>
      </Box>
    );
  };

  // Only show error if staff not found and not creating a new one
  if (!isNewStaff && !staffMember) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Staff member not found</Typography>
      </Box>
    );
  }

  const displayName = isNewStaff
    ? 'New Staff Member'
    : staffMember && staffMember.source === 'talent'
    ? `${staffMember.firstName} ${staffMember.lastName}`
    : staffMember
    ? `${staffMember.firstname} ${staffMember.lastname}`
    : 'New Staff Member';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            borderBottom: '1px solid var(--color-border-primary)',
            backgroundColor: 'var(--color-background-primary)',
            px: 3,
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton
              onClick={handleBack}
              size="small"
              sx={{ color: 'var(--color-text-secondary)' }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
              Back
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              startIcon={<SaveOutlined />}
              onClick={handleSave}
              sx={{
                textTransform: 'none',
                backgroundColor: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-hover)',
                },
              }}
            >
              Save Changes
            </Button>
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {isNewStaff ? 'Add MLS Advance Candidate' : `Edit Staff Information: ${displayName}`}
          </Typography>
        </Paper>

        {/* Form Content with Side Panel */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Left Side Panel - Menu Tree */}
          <Box sx={{
            width: '340px',
            borderRight: '1px solid var(--color-border-primary)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto',
            backgroundColor: 'var(--color-background-primary)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pl: 2, pr: 2, pt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Menu</Typography>
            </Box>

            {/* Nested Navigation with Groups and Subgroups */}
            <List aria-label="Form Menu" disablePadding sx={{ flexGrow: 1 }}>
              {navigationData.map((group) => {
                const isExpanded = expandedGroups.includes(group.id);
                const { completed, total, percentage } = calculateGroupProgress(group);
                const hasActiveSubgroup = group.subgroups?.some(sub => sub.id === activeSubgroupId);

                return (
                  <Box key={group.id}>
                    {/* Group Header */}
                    <ListItemButton
                      onClick={() => toggleGroup(group.id)}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          bgcolor: 'var(--color-background-secondary)',
                        },
                      }}
                    >
                      {/* Progress Icon */}
                      <Box
                        sx={{
                          position: 'relative',
                          display: 'inline-flex',
                          mr: 2,
                        }}
                      >
                        <CircularProgress
                          variant="determinate"
                          value={percentage}
                          size={24}
                          thickness={4}
                          sx={{
                            color: percentage === 100 
                              ? 'var(--color-success)' 
                              : 'var(--color-primary)',
                            '& .MuiCircularProgress-circle': {
                              strokeLinecap: 'round',
                            },
                          }}
                        />
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          size={24}
                          thickness={4}
                          sx={{
                            color: 'var(--color-border-primary)',
                            position: 'absolute',
                            left: 0,
                            zIndex: -1,
                          }}
                        />
                      </Box>

                      {/* Group Title and Progress */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            mb: 0.25,
                          }}
                        >
                          {group.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--color-text-secondary)',
                          }}
                        >
                          {completed} of {total} completed
                        </Typography>
                      </Box>

                      {/* Expand/Collapse Icon */}
                      {isExpanded ? (
                        <ExpandMoreOutlined sx={{ color: 'var(--color-text-secondary)' }} />
                      ) : (
                        <ChevronRightIcon sx={{ color: 'var(--color-text-secondary)' }} />
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
                                py: 1,
                                pl: 6,
                                pr: 2,
                                bgcolor: isActive ? 'var(--color-background-secondary)' : 'transparent',
                                borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                                '&:hover': {
                                  bgcolor: 'var(--color-background-secondary)',
                                },
                              }}
                            >
                              {/* Completion Icon */}
                              <Box sx={{ mr: 1.5 }}>
                                {subgroup.isCompleted ? (
                                  <CheckCircle
                                    sx={{
                                      fontSize: 18,
                                      color: 'var(--color-success)',
                                    }}
                                  />
                                ) : (
                                  <RadioButtonUnchecked
                                    sx={{
                                      fontSize: 18,
                                      color: 'var(--color-border-primary)',
                                    }}
                                  />
                                )}
                              </Box>

                              {/* Subgroup Title */}
                              <Typography
                                variant="body2"
                                sx={{
                                  color: isActive 
                                    ? 'var(--color-text-primary)' 
                                    : 'var(--color-text-secondary)',
                                  fontWeight: isActive ? 500 : 400,
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

            {/* Bottom Navigation Buttons */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid var(--color-border-primary)',
                display: 'flex',
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={!canGoBack}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  borderColor: 'var(--color-border-primary)',
                  color: 'var(--color-text-primary)',
                  '&:hover': {
                    borderColor: 'var(--color-border-primary)',
                    bgcolor: 'var(--color-background-secondary)',
                  },
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canGoNext}
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  bgcolor: 'var(--color-primary)',
                  '&:hover': {
                    bgcolor: 'var(--color-primary-hover)',
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>

          {/* Right Content Area - Form Fields */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, backgroundColor: '#fafafa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {staffFormDefinition && Object.entries(staffFormDefinition)
                .filter(([, ], sectionIndex) => sectionIndex === getCurrentSectionIndex())
                .map(([sectionTitle, fields], ) => (
                <Paper
                  key={getCurrentSectionIndex()}
                  elevation={0}
                  sx={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border-primary)',
                    p: 3
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      mb: 1
                    }}
                  >
                    {sectionTitle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
                    {fields.length} field{fields.length === 1 ? '' : 's'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {fields.map((field, fieldIndex) => renderField(field, getCurrentSectionIndex(), fieldIndex))}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default StaffFormEdit;
