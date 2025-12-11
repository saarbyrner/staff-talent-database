import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton
} from '@mui/material';
import { SaveOutlined, ExpandMoreOutlined, CloudUpload, InsertDriveFile } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { staffForm as staffFormDefinition } from '../data';
import '../styles/design-tokens.css';

/**
 * Staff Portal View
 * A standalone view for staff members to fill in their form
 * This is isolated from the main navigation and is used when staff receive an invitation
 */
function StaffPortalView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  // Check if we're creating a new staff member or editing existing
  const isNewStaff = !id || id === 'new';

  // Find staff member (or null if creating new)
  const staffMember = React.useMemo(() => {
    if (isNewStaff) return null;
    
    let member = staffTalentData.find(s => s.id === id);
    if (member) return { ...member, source: 'talent' };
    
    member = currentStaffData.find(s => s.id === parseInt(id));
    if (member) return { ...member, source: 'current' };
    
    return null;
  }, [id, isNewStaff]);

  // Initialize form values from staff member data
  const [formValues, setFormValues] = React.useState(() => {
    if (!staffMember) {
      // If email is provided from invitation, pre-fill it
      return email ? { email } : {};
    }
    
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

  // State for accordion expansion and field refs
  const [expandedSections, setExpandedSections] = React.useState([0]); // Start with first section expanded
  const [selectedSectionIndex, setSelectedSectionIndex] = React.useState(0);
  const [selectedFieldId, setSelectedFieldId] = React.useState(null);
  const fieldRefs = React.useRef({});

  const handleValueChange = (fieldName, value) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const toggleSection = (sectionIndex) => {
    setExpandedSections((prev) =>
      prev.includes(sectionIndex) ? prev.filter(x => x !== sectionIndex) : [...prev, sectionIndex]
    );
  };

  const handleSectionClick = (sectionIndex) => {
    setSelectedSectionIndex(sectionIndex);
  };

  const handleFieldClick = (fieldId, sectionIndex) => {
    // Expand section if not already expanded
    setExpandedSections((prev) => prev.includes(sectionIndex) ? prev : [...prev, sectionIndex]);
    // Set selected section
    setSelectedSectionIndex(sectionIndex);
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

  const handleSubmit = () => {
    console.log('Submitting form values:', formValues);
    alert('Form submitted successfully! Thank you for completing your staff information.');
    // In a real app, this would submit to the backend
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
      <Box sx={{ p: 3, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Staff member not found</Typography>
          <Typography color="text.secondary">The invitation link may be invalid or expired.</Typography>
        </Paper>
      </Box>
    );
  }

  const displayName = isNewStaff
    ? 'Staff Information Form'
    : staffMember && staffMember.source === 'talent'
    ? `${staffMember.firstName} ${staffMember.lastName}`
    : staffMember
    ? `${staffMember.firstname} ${staffMember.lastname}`
    : 'Staff Information Form';

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
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
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="contained"
              startIcon={<SaveOutlined />}
              onClick={handleSubmit}
              sx={{
                textTransform: 'none',
                backgroundColor: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-hover)',
                },
              }}
            >
              Submit
            </Button>
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mt: 0.5 }}>
            Please complete all required fields and submit your information.
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
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Sections</Typography>
            </Box>

            <List aria-label="Form Menu" disablePadding sx={{ flexGrow: 1 }}>
              {staffFormDefinition && Object.entries(staffFormDefinition).map(([sectionTitle, fields], sectionIndex) => (
                <Box key={sectionIndex}>
                  <Accordion
                    elevation={0}
                    expanded={expandedSections.includes(sectionIndex)}
                    onChange={() => toggleSection(sectionIndex)}
                    sx={{
                      boxShadow: 'none',
                      borderRadius: 0,
                      '&:hover': { backgroundColor: 'var(--color-background-secondary)' },
                      '&:before': { display: 'none' }
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreOutlined />}
                      onClick={(e) => {
                        // Only trigger section selection if not clicking the expand icon
                        if (!e.target.closest('.MuiAccordionSummary-expandIconWrapper')) {
                          handleSectionClick(sectionIndex);
                        }
                      }}
                      sx={{
                        pl: 2,
                        pr: 2,
                        '& .MuiAccordionSummary-content': { my: 1.5 },
                        ...(selectedSectionIndex === sectionIndex && {
                          backgroundColor: 'var(--color-background-secondary)'
                        })
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {sectionTitle}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                            {fields.length} field{fields.length === 1 ? '' : 's'}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pl: 0, pr: 0, pt: 0, pb: 0 }}>
                      <List component="div" disablePadding>
                        {fields.map((field, fieldIndex) => {
                          const fieldId = field.name;
                          return (
                            <ListItemButton
                              key={fieldId}
                              selected={selectedFieldId === fieldId}
                              onClick={() => handleFieldClick(fieldId, sectionIndex)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                borderRadius: 0,
                                pl: 4,
                                pr: 2,
                                py: 1
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {field.label?.length > 35 ? `${field.label.slice(0, 35)}...` : field.label}
                              </Typography>
                            </ListItemButton>
                          );
                        })}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              ))}
            </List>
          </Box>

          {/* Right Content Area - Form Fields */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3, backgroundColor: '#fafafa' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {staffFormDefinition && Object.entries(staffFormDefinition)
                .filter(([, ], sectionIndex) => sectionIndex === selectedSectionIndex)
                .map(([sectionTitle, fields], ) => (
                <Paper
                  key={selectedSectionIndex}
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
                    {fields.map((field, fieldIndex) => renderField(field, selectedSectionIndex, fieldIndex))}
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

export default StaffPortalView;
