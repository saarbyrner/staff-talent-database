import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Paper,
  Typography,
  Chip,
  Autocomplete,
  Divider,
  Stack,
  IconButton,
} from '@mui/material';
import { SaveOutlined, AddOutlined, RemoveOutlined } from '@mui/icons-material';
import TagSelector from './TagSelector';

const DEFAULT_TAGS = ['Proven', 'Emerging', 'High Potential', 'Homegrown'];

const INTEREST_AREAS = [
  'Coaching',
  'Executive',
  'Technical',
  'Sporting',
  'Medical',
  'Performance',
  'Analytics',
  'Operations'
];

const COACHING_ROLES = [
  'Head Coach',
  'Assistant Coach',
  'Goalkeeper Coach',
  'Technical Director',
  'Academy Director',
  'Youth Coach'
];

const EXEC_ROLES = [
  'General Manager',
  'President',
  'CEO',
  'COO',
  'CFO',
  'Vice President'
];

const TECH_ROLES = [
  'Sporting Director',
  'Technical Director',
  'Director of Analytics',
  'Scout',
  'Video Analyst',
  'Performance Analyst'
];

const GENDERS = ['Male', 'Female', 'Non-Binary', 'Prefer Not to Say'];

const ETHNICITIES = [
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Native American or Alaska Native',
  'Native Hawaiian or Pacific Islander',
  'White',
  'Two or More Races',
  'Prefer Not to Say'
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const COUNTRIES = [
  'USA', 'Canada', 'Mexico', 'United Kingdom', 'Spain', 'France', 'Germany', 'Italy',
  'Brazil', 'Argentina', 'Colombia', 'Japan', 'Australia', 'Ghana', 'Poland', 'Ireland'
];

function BulkEditBar({ selectedCount, onSave, onCancel }) {
  const [interestArea, setInterestArea] = useState('');
  const [roleType, setRoleType] = useState('');
  const [roles, setRoles] = useState([]);
  const [gender, setGender] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [hasAgent, setHasAgent] = useState('');
  const [relocation, setRelocation] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagSelectorAnchor, setTagSelectorAnchor] = useState(null);

  const getRoleOptions = () => {
    switch (roleType) {
      case 'coaching':
        return COACHING_ROLES;
      case 'executive':
        return EXEC_ROLES;
      case 'technical':
        return TECH_ROLES;
      default:
        return [];
    }
  };

  const handleSave = () => {
    const updates = {};
    
    if (interestArea) updates.interestArea = interestArea;
    if (roleType && roles.length > 0) {
      updates.roles = { roleType, roles };
    }
    if (gender) updates.gender = gender;
    if (ethnicity) updates.ethnicity = ethnicity;
    if (city) updates.city = city;
    if (state) updates.state = state;
    if (country) updates.country = country;
    if (hasAgent !== '') updates.hasAgent = hasAgent === 'true';
    if (relocation.length > 0) updates.relocation = relocation;
    if (tags.length > 0) {
      updates.tags = { action: 'add', values: tags };
    }
    if (Object.keys(updates).length === 0) {
      alert('Please select at least one field to update');
      return;
    }

    onSave(updates);
  };

  const hasChanges = 
    interestArea || 
    (roleType && roles.length > 0) || 
    gender || 
    ethnicity || 
    city || 
    state || 
    country || 
    hasAgent !== '' || 
    relocation.length > 0 ||
    tags.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: '1px solid var(--color-border-primary)',
        backgroundColor: '#ffffff',
        borderRadius: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            Bulk Edit
          </Typography>
          <Chip
            label={`${selectedCount} selected`}
            size="small"
            sx={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              fontWeight: 600
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onCancel}
            color="inherit"
            variant="outlined"
            size="small"
            sx={{ 
              textTransform: 'none',
              borderColor: 'var(--color-border-primary)',
              '&:hover': {
                borderColor: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-tertiary)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            size="small"
            startIcon={<SaveOutlined />}
            disabled={!hasChanges}
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-hover)'
              }
            }}
          >
            Save
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Interest Area */}
        <FormControl size="small" variant="filled" sx={{ minWidth: 160 }}>
          <InputLabel>Interest Area</InputLabel>
          <Select
            value={interestArea}
            onChange={(e) => setInterestArea(e.target.value)}
            label="Interest Area"
          >
            <MenuItem value="">
              <em>No change</em>
            </MenuItem>
            {INTEREST_AREAS.map((area) => (
              <MenuItem key={area} value={area}>{area}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Role Type */}
        <FormControl size="small" variant="filled" sx={{ minWidth: 160 }}>
          <InputLabel>Role Type</InputLabel>
          <Select
            value={roleType}
            onChange={(e) => {
              setRoleType(e.target.value);
              setRoles([]);
            }}
            label="Role Type"
          >
            <MenuItem value="">
              <em>No change</em>
            </MenuItem>
            <MenuItem value="coaching">Coaching</MenuItem>
            <MenuItem value="executive">Executive</MenuItem>
            <MenuItem value="technical">Technical</MenuItem>
          </Select>
        </FormControl>

        {/* Roles */}
        {roleType && (
          <Autocomplete
            multiple
            size="small"
            options={getRoleOptions()}
            value={roles}
            onChange={(event, newValue) => setRoles(newValue)}
            sx={{ minWidth: 250 }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Roles"
                placeholder="Select roles"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  size="small"
                />
              ))
            }
          />
        )}

        {/* Gender */}
        <FormControl size="small" variant="filled" sx={{ minWidth: 160 }}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            label="Gender"
          >
            <MenuItem value="">
              <em>No change</em>
            </MenuItem>
            {GENDERS.map((g) => (
              <MenuItem key={g} value={g}>{g}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Ethnicity */}
        <FormControl size="small" variant="filled" sx={{ minWidth: 200 }}>
          <InputLabel>Ethnicity</InputLabel>
          <Select
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
            label="Ethnicity"
          >
            <MenuItem value="">
              <em>No change</em>
            </MenuItem>
            {ETHNICITIES.map((e) => (
              <MenuItem key={e} value={e}>{e}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* City */}
        <TextField
          size="small"
          variant="filled"
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="No change"
          sx={{ minWidth: 160 }}
        />

        {/* State */}
        <Autocomplete
          size="small"
          options={US_STATES}
          value={state}
          onChange={(event, newValue) => setState(newValue || '')}
          sx={{ minWidth: 160 }}
          renderInput={(params) => (
            <TextField {...params} variant="filled" label="State" placeholder="No change" />
          )}
        />

        {/* Country */}
        <Autocomplete
          size="small"
          options={COUNTRIES}
          value={country}
          onChange={(event, newValue) => setCountry(newValue || '')}
          sx={{ minWidth: 160 }}
          renderInput={(params) => (
            <TextField {...params} variant="filled" label="Country" placeholder="No change" />
          )}
        />

        {/* Has Agent */}
        <FormControl size="small" variant="filled" sx={{ minWidth: 160 }}>
          <InputLabel>Has Agent</InputLabel>
          <Select
            value={hasAgent}
            onChange={(e) => setHasAgent(e.target.value)}
            label="Has Agent"
          >
            <MenuItem value="">
              <em>No change</em>
            </MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>

        {/* Willing to Relocate */}
        <Autocomplete
          multiple
          size="small"
          options={US_STATES}
          value={relocation}
          onChange={(event, newValue) => setRelocation(newValue)}
          sx={{ minWidth: 250 }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="filled"
              label="Willing to Relocate"
              placeholder="Select states"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                key={option}
                size="small"
              />
            ))
          }
        />

        {/* Tags */}
        <TextField
          size="small"
          variant="filled"
          label="Tags"
          value={tags.length > 0 ? `${tags.length} tag${tags.length > 1 ? 's' : ''} selected` : ''}
          onClick={(e) => setTagSelectorAnchor(e.currentTarget)}
          placeholder="Click to add tags"
          sx={{ minWidth: 200, cursor: 'pointer' }}
          InputProps={{
            readOnly: true,
          }}
        />
      </Box>
        
      {/* Tag Selector Popover */}
      <TagSelector
        selectedTags={tags}
        onChange={setTags}
        anchorEl={tagSelectorAnchor}
        onClose={() => setTagSelectorAnchor(null)}
      />
    </Paper>
  );
}

export default BulkEditBar;
