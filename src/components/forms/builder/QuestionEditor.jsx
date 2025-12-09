import React from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Paper,
  Chip,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  FormControl
} from '@mui/material'
import { DeleteOutlined } from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

export default function QuestionEditor({ question, index, onChange }) {
  if (!question) return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>
        Select a question from the menu.
      </Typography>
    </Box>
  )

  const handleUpdate = (patch) => {
    const updated = { ...question, ...patch }
    onChange?.(updated)
  }

  const typeLabels = {
    text: 'Short answer',
    select: 'Dropdown',
    radio: 'Single choice',
    checkbox: 'Multi-select',
    date: 'Date',
    file: 'File upload'
  }

  const handleFieldChange = (key) => (event) => {
    handleUpdate({ [key]: event.target.value })
  }

  const renderInputPreview = () => {
    const optionCount = (question.options || []).length
    const useDropdownForMany = optionCount > 3
    if (question.type === 'text') {
      return (
        <TextField
          disabled
          variant="filled"
          size="small"
          fullWidth
          placeholder="Enter response"
          multiline={Boolean(question.meta?.multiline)}
          minRows={question.meta?.multiline ? 3 : undefined}
        />
      )
    }

    if (question.type === 'select') {
      return (
        <TextField
          disabled
          variant="filled"
          size="small"
          fullWidth
          select
          value=""
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">
            <em>Select</em>
          </MenuItem>
          {(question.options || []).map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
      )
    }
    if (question.type === 'radio' || question.type === 'checkbox') {
      if (useDropdownForMany) {
        return (
          <TextField
            disabled
            variant="filled"
            size="small"
            fullWidth
            select
            value=""
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=""><em>Select</em></MenuItem>
            {(question.options || []).map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        )
      }

      if (question.type === 'radio') {
        return (
          <FormControl component="fieldset" disabled>
            <RadioGroup>
              {(question.options || []).map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          </FormControl>
        )
      }

      return (
        <FormGroup>
          {(question.options || []).map((option) => (
            <FormControlLabel
              key={option}
              control={<Checkbox disabled />}
              label={option}
            />
          ))}
        </FormGroup>
      )
    }

    if (question.type === 'date') {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            disabled
            slotProps={{
              textField: {
                variant: 'filled',
                size: 'small',
                fullWidth: true,
                placeholder: 'Select date'
              }
            }}
          />
        </LocalizationProvider>
      )
    }

    if (question.type === 'file') {
      return (
        <Box sx={{ border: '1px dashed var(--color-border-primary)', borderRadius: 'var(--radius-md)', p: 2, opacity: 0.6 }}>
          <Button
            disabled
            variant="contained"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Upload file
          </Button>
        </Box>
      )
    }

    return (
      <TextField
        disabled
        variant="filled"
        size="small"
        fullWidth
        placeholder="Enter response"
      />
    )
  }

  return (
    <Paper elevation={1} sx={{ borderRadius: 'var(--radius-md)', px: 3, pt: 2, pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Question {index}</Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)' }}>{typeLabels[question.type] || 'Custom field'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            size="medium"
            sx={{
              textTransform: 'none',
              backgroundColor: 'var(--button-secondary-bg)',
              color: 'var(--button-secondary-color)',
              boxShadow: 'none',
              '&:hover': { backgroundColor: 'var(--button-secondary-hover-bg)', boxShadow: 'none' }
            }}
          >
            Add follow up question
          </Button>
          <FormControlLabel
            label="Mandatory"
            labelPlacement="start"
            control={<Switch color="default" checked={Boolean(question.mandatory)} onChange={(e) => handleUpdate({ mandatory: e.target.checked })} />}
          />
          <IconButton aria-label="delete" color="default"><DeleteOutlined /></IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
        <TextField
          label="Question prompt"
          variant="filled"
          fullWidth
          multiline
          value={question.label || ''}
          onChange={handleFieldChange('label')}
        />

        <Box className={(() => {
          const opts = (question.options || []).length
          if (question.type === 'text') return 'input-size-l'
          if (question.type === 'date' || question.type === 'select') return opts > 3 ? 'input-size-m' : 'input-size-s'
          if (question.type === 'file') return 'input-size-l'
          return 'input-size-m'
        })()}>
          {renderInputPreview()}
        </Box>
      </Box>
    </Paper>
  )
}


