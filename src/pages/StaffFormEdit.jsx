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
  Divider
} from '@mui/material';
import { ArrowBack, SaveOutlined } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import staffTalentData from '../data/staff_talent.json';
import currentStaffData from '../data/users_staff.json';
import { staffForm as staffFormDefinition } from '../data';
import '../styles/design-tokens.css';

/**
 * Staff Form Edit Page
 * Displays the staff form in edit/input mode for a specific staff member
 * Similar to the preview tab in form builder, but standalone for editing staff data
 */
function StaffFormEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're viewing from league context
  const isLeagueView = location.pathname.startsWith('/league');

  // Find staff member
  const staffMember = React.useMemo(() => {
    let member = staffTalentData.find(s => s.id === id);
    if (member) return { ...member, source: 'talent' };
    
    member = currentStaffData.find(s => s.id === parseInt(id));
    if (member) return { ...member, source: 'current' };
    
    return null;
  }, [id]);

  // Initialize form values from staff member data
  const [formValues, setFormValues] = React.useState(() => {
    if (!staffMember) return {};
    
    // Map staff member data to form field names
    const values = {};
    if (staffMember.source === 'talent') {
      values.firstName = staffMember.firstName || '';
      values.lastName = staffMember.lastName || '';
      values.phone = staffMember.phone || '';
      values.email = staffMember.email || '';
      values.country = staffMember.country || '';
      values.city = staffMember.city || '';
      values.usSponsorship = staffMember.workAuthUS ? 'No' : 'Yes';
      values.caSponsorship = staffMember.workAuthCA ? 'No' : 'Yes';
      values.gender = staffMember.gender || '';
      values.ethnicity = staffMember.ethnicity || '';
      values.hasAgent = staffMember.hasAgent ? 'Yes' : 'No';
      values.agentName = staffMember.agentName || '';
      values.agencyName = staffMember.agencyName || '';
      values.proPlayerExp = staffMember.proPlayerExp ? 'Yes' : 'No';
      values.mlsPlayerExp = staffMember.mlsPlayerExp ? 'Yes' : 'No';
      values.mlsClubsPlayed = staffMember.mlsClubsPlayed?.join(', ') || '';
      values.otherPlayerExp = staffMember.otherPlayerExp || '';
      values.interestArea = staffMember.interestArea || '';
      values.coachingRoles = staffMember.coachingRoles || [];
      values.execRoles = staffMember.execRoles || [];
      values.techRoles = staffMember.techRoles || [];
      values.relocation = staffMember.relocation || [];
      values.proCoachExp = staffMember.proCoachExp ? 'Yes' : 'No';
      values.mlsCoachExp = staffMember.mlsCoachExp ? 'Yes' : 'No';
      values.degree = staffMember.degree || '';
      values.coachingLicenses = staffMember.coachingLicenses || [];
      values.languages = staffMember.languages || [];
    } else if (staffMember.source === 'current') {
      values.firstName = staffMember.firstname || '';
      values.lastName = staffMember.lastname || '';
      values.phone = staffMember.phone || '';
      values.email = staffMember.email || '';
      values.country = staffMember.country || '';
      values.city = staffMember.city || '';
    }
    
    return values;
  });

  const handleBack = () => {
    const basePath = isLeagueView ? '/league/staff' : '/staff';
    navigate(`${basePath}/${id}`);
  };

  const handleValueChange = (fieldName, value) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleCheckboxGroupChange = (fieldName, option) => (event) => {
    const isChecked = event.target.checked;
    setFormValues(prev => {
      const current = Array.isArray(prev[fieldName]) ? prev[fieldName] : [];
      if (isChecked) {
        return { ...prev, [fieldName]: [...current, option] };
      }
      return { ...prev, [fieldName]: current.filter(value => value !== option) };
    });
  };

  const handleSave = () => {
    console.log('Saving form values:', formValues);
    // In a real app, this would save to the backend
    alert('Form saved successfully!');
    handleBack();
  };

  const evaluateDependency = (field) => {
    if (!field.dependency) return true;
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
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          py: 1.5,
          borderBottom: '1px solid var(--color-border-secondary)',
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
        <Box sx={{ mt: 0.5 }}>
          {control}
        </Box>
      </Box>
    );
  };

  if (!staffMember) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Staff member not found</Typography>
      </Box>
    );
  }

  const displayName = staffMember.source === 'talent'
    ? `${staffMember.firstName} ${staffMember.lastName}`
    : `${staffMember.firstname} ${staffMember.lastname}`;

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
            Edit Staff Information: {displayName}
          </Typography>
        </Paper>

        {/* Form Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid var(--color-border-primary)' }}>
            {staffFormDefinition && Object.entries(staffFormDefinition).map(([sectionTitle, fields], sectionIndex) => (
              <Box key={sectionIndex} sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    mb: 2,
                    pb: 1,
                    borderBottom: '2px solid var(--color-border-primary)',
                  }}
                >
                  {sectionTitle}
                </Typography>
                <Box sx={{ pl: 0 }}>
                  {fields.map((field, fieldIndex) => renderField(field, sectionIndex, fieldIndex))}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}

export default StaffFormEdit;
