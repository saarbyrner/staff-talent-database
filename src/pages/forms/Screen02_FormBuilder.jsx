import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button as MuiButton,
  Divider,
  Tabs,
  Tab,
  Grid,
  FormControl,
  FormGroup,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  RadioGroup,
  Radio,
  Checkbox,
  Chip
} from '@mui/material'
import { ArrowBackOutlined } from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import '../../styles/design-tokens.css'
import FormBuilderHeader from '../../components/forms/builder/FormBuilderHeader'
import MenuTree from '../../components/forms/builder/MenuTree'
import QuestionEditor from '../../components/forms/builder/QuestionEditor'
import { staffForm as staffFormDefinition } from '../../data'
import defaultTemplate from '../../data/formTemplates/test-toggle-switch.json'

function a11yProps(index) {
  return {
    id: `form-builder-tab-${index}`,
    'aria-controls': `form-builder-tabpanel-${index}`
  }
}

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`form-builder-tabpanel-${index}`}
      aria-labelledby={`form-builder-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

const STAFF_FIELD_TYPE_MAP = {
  TextField: 'text',
  Select: 'select',
  RadioGroup: 'radio',
  CheckboxGroup: 'checkbox',
  DatePicker: 'date',
  FileUpload: 'file'
}

function normalizeStaffField(field = {}, sectionIndex, fieldIndex) {
  const controlType = STAFF_FIELD_TYPE_MAP[field.type] || 'text'
  const baseId = field.name || `staff-field-${sectionIndex + 1}-${fieldIndex + 1}`
  const prompt = field.label || `Untitled field ${fieldIndex + 1}`
  const helper = field.helperText || ''
  return {
    id: baseId,
    label: prompt,
    description: field.description || '',
    helperText: helper,
    mandatory: Boolean(field.required),
    dependency: field.dependency || null,
    conditional: Boolean(field.conditional),
    type: controlType,
    options: Array.isArray(field.options) ? field.options : [],
    meta: {
      originalType: field.type || 'TextField',
      multiline: Boolean(field.multiline)
    }
  }
}

function buildStaffFormTemplate(definition) {
  if (!definition) return null

  const sections = Object.entries(definition).map(([title, fields], sectionIndex) => ({
    id: `staff-section-${sectionIndex + 1}`,
    title,
    items: [
      {
        id: `staff-section-${sectionIndex + 1}-subsection`,
        type: 'subsection',
        title,
        items: (fields || []).map((field, fieldIndex) => normalizeStaffField(field, sectionIndex, fieldIndex))
      }
    ]
  }))

  return {
    id: 'staff_form',
    title: 'Staff Form',
    productArea: 'Staffing',
    category: 'Questionnaire',
    createdAt: '2025-12-08T00:00:00Z',
    creator: 'Staff Operations',
    description: 'Capture staff info',
    sections
  }
}

const STAFF_FORM_TEMPLATE = buildStaffFormTemplate(staffFormDefinition)

const TEMPLATE_REGISTRY = {
  [defaultTemplate.id]: defaultTemplate,
  staff_form: STAFF_FORM_TEMPLATE
}

function cloneTemplate(template) {
  return JSON.parse(JSON.stringify(template || defaultTemplate))
}

function getTemplateForFormId(formId) {
  if (formId && TEMPLATE_REGISTRY[formId]) {
    return cloneTemplate(TEMPLATE_REGISTRY[formId])
  }
  return cloneTemplate(defaultTemplate)
}

function collectQuestions(form) {
  const questions = []
  for (const section of form?.sections || []) {
    for (const item of section.items || []) {
      if (item.type === 'subsection') {
        questions.push(...(item.items || []))
      }
    }
  }
  return questions
}

function buildInitialValues(form) {
  const initial = {}
  for (const question of collectQuestions(form)) {
    if (question.type === 'checkbox') {
      initial[question.id] = []
    } else if (question.type === 'file') {
      initial[question.id] = null
    } else {
      initial[question.id] = ''
    }
  }
  return initial
}

function evaluateDependency(question, values) {
  if (!question?.dependency) return true
  const dependency = question.dependency.trim()
  if (!dependency) return true

  if (dependency.includes('==')) {
    const [rawKey, rawExpected] = dependency.split('==')
    const key = rawKey.trim()
    const expected = rawExpected.trim().replace(/^['"]|['"]$/g, '')
    return values[key] === expected
  }

  const parentValue = values[dependency]
  if (Array.isArray(parentValue)) return parentValue.length > 0
  if (typeof parentValue === 'string') {
    if (!parentValue) return false
    return parentValue.toLowerCase() !== 'no'
  }
  return Boolean(parentValue)
}

export default function Screen02_FormBuilder() {
  const navigate = useNavigate()
  // eslint-disable-next-line no-unused-vars
  const { formId } = useParams()

  const [form, setForm] = React.useState(() => getTemplateForFormId(formId))
  const [tabValue, setTabValue] = React.useState(0)
  const [previewValues, setPreviewValues] = React.useState(() => buildInitialValues(getTemplateForFormId(formId)))

  React.useEffect(() => {
    const nextForm = getTemplateForFormId(formId)
    setForm(nextForm)
    setPreviewValues(buildInitialValues(nextForm))
    // no-op: revert section-selection feature
  }, [formId])

  // Prototype: local settings state for Settings tab toggles
  const [settings, setSettings] = React.useState({
    canEditSubmitted: false,
    canSaveDraft: false,
    savePdfAfterSubmission: false,
    allowAthleteApp: true,
    allowKioskApp: true,
    allowAthleteWeb: true,
  })

  const handleToggleSetting = (key) => (event) => {
    const isChecked = event.target.checked
    setSettings((prev) => ({ ...prev, [key]: isChecked }))
  }

  // Design-system compliant Switch styling
  const switchSx = {
    '& .MuiSwitch-track': {
      backgroundColor: 'var(--color-border-primary)',
      opacity: 1,
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: 'var(--color-text-disabled)'
    },
    // Checked state — brand primary track, white thumb
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: 'var(--color-white)'
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: 'var(--color-primary)',
      opacity: 1,
    },
    '& .MuiSwitch-switchBase:hover': {
      backgroundColor: 'transparent'
    }
  }

  const allQuestions = React.useMemo(() => collectQuestions(form), [form])
  const questionRefs = React.useRef({})
  const sectionRefs = React.useRef({})

  const [selectedQuestionId, setSelectedQuestionId] = React.useState(allQuestions[0]?.id)
  const [selectedSectionId, setSelectedSectionId] = React.useState(() => form.sections?.[0]?.id)
  
  React.useEffect(() => {
    if (allQuestions.length === 0) {
      setSelectedQuestionId(undefined)
      return
    }
    if (!selectedQuestionId || !allQuestions.some(q => q.id === selectedQuestionId)) {
      setSelectedQuestionId(allQuestions[0].id)
    }
  }, [allQuestions, selectedQuestionId])
  
  React.useEffect(() => {
    if (form.sections?.length > 0 && !selectedSectionId) {
      setSelectedSectionId(form.sections[0].id)
    }
  }, [form.sections, selectedSectionId])

  const selectedQuestion = React.useMemo(
    () => allQuestions.find(q => q.id === selectedQuestionId) || null,
    [allQuestions, selectedQuestionId]
  )

  const isDirty = false // Prototype: Save disabled for now

  const handleQuestionSelect = React.useCallback((questionId) => {
    setSelectedQuestionId(questionId)
    // Scroll to the question in preview mode
    if (tabValue === 1 && questionRefs.current[questionId]) {
      questionRefs.current[questionId].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [tabValue])

  const handleSectionSelect = React.useCallback((sectionId) => {
    setSelectedSectionId(sectionId)
    // Scroll to the section in preview mode
    if (tabValue === 1 && sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [tabValue])

  const handlePreviewValueChange = React.useCallback((questionId, nextValue) => {
    setPreviewValues((prev) => ({ ...prev, [questionId]: nextValue }))
  }, [])

  const handleCheckboxGroupChange = (questionId, option) => (event) => {
    const isChecked = event.target.checked
    setPreviewValues((prev) => {
      const current = Array.isArray(prev[questionId]) ? prev[questionId] : []
      if (isChecked) {
        return { ...prev, [questionId]: [...current, option] }
      }
      return { ...prev, [questionId]: current.filter((value) => value !== option) }
    })
  }

  const handleFileUpload = (questionId) => (event) => {
    const file = event.target.files?.[0] || null
    handlePreviewValueChange(questionId, file)
  }

  const renderPreviewField = (question) => {
    if (!evaluateDependency(question, previewValues)) return null

    const prompt = question.label || 'Untitled question'
    const optionCount = (question.options || []).length
    const useDropdownForMany = optionCount > 3
    // Always place answer inputs below the question in preview
    const needsStack = true

    const helperText = question.helperText ? (
      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', mt: 0.5, display: 'block' }}>
        {question.helperText}
      </Typography>
    ) : null

    const control = (() => {
      if (question.type === 'text') {
        return (
          <TextField
            variant="filled"
            size="small"
            fullWidth
            placeholder="Enter response"
            value={previewValues[question.id] || ''}
            onChange={(event) => handlePreviewValueChange(question.id, event.target.value)}
            multiline={Boolean(question.meta?.multiline)}
            minRows={question.meta?.multiline ? 3 : undefined}
            InputLabelProps={{ shrink: false }}
          />
        )
      }

      if (question.type === 'select') {
        return (
          <TextField
            variant="filled"
            size="small"
            fullWidth
            select
            value={previewValues[question.id] || ''}
            onChange={(event) => handlePreviewValueChange(question.id, event.target.value)}
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
        const current = Array.isArray(previewValues[question.id]) ? previewValues[question.id] : (previewValues[question.id] || '')
        // Use dropdown when there are many options
        if (useDropdownForMany) {
          return (
            <TextField
              variant="filled"
              size="small"
              fullWidth
              select
              value={previewValues[question.id] || ''}
              onChange={(event) => handlePreviewValueChange(question.id, event.target.value)}
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
            <FormControl component="fieldset">
              <RadioGroup
                value={previewValues[question.id] || ''}
                onChange={(event) => handlePreviewValueChange(question.id, event.target.value)}
              >
                {(question.options || []).map((option) => (
                  <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                ))}
              </RadioGroup>
            </FormControl>
          )
        }

        // checkbox
        return (
          <FormGroup>
            {(question.options || []).map((option) => (
              <FormControlLabel
                key={option}
                control={<Checkbox checked={Array.isArray(previewValues[question.id]) ? previewValues[question.id].includes(option) : false} onChange={handleCheckboxGroupChange(question.id, option)} />}
                label={option}
              />
            ))}
          </FormGroup>
        )
      }

      if (question.type === 'date') {
        return (
          <DatePicker
            value={previewValues[question.id] ? dayjs(previewValues[question.id]) : null}
            onChange={(newValue) => handlePreviewValueChange(question.id, newValue ? newValue.toISOString() : '')}
            slotProps={{
              textField: {
                variant: 'filled',
                size: 'small',
                fullWidth: true,
                placeholder: 'Select date'
              }
            }}
          />
        )
      }

      if (question.type === 'file') {
        const fileValue = previewValues[question.id]
        const inputId = `${question.id}-preview-upload`
        return (
          <Box sx={{ border: '1px dashed var(--color-border-primary)', borderRadius: 'var(--radius-md)', p: 2 }}>
            <input id={inputId} type="file" hidden onChange={handleFileUpload(question.id)} />
            <MuiButton
              component="label"
              htmlFor={inputId}
              variant="contained"
              size="small"
              sx={{ textTransform: 'none', backgroundColor: 'var(--button-secondary-bg)', color: 'var(--button-secondary-color)', '&:hover': { backgroundColor: 'var(--button-secondary-hover-bg)' } }}
            >
              Upload file
            </MuiButton>
            {fileValue && (
              <Chip
                label={fileValue.name || 'Uploaded file'}
                onDelete={() => handlePreviewValueChange(question.id, null)}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        )
      }

      return (
        <TextField
          variant="filled"
          size="small"
          fullWidth
          placeholder="Enter response"
          value={previewValues[question.id] || ''}
          onChange={(event) => handlePreviewValueChange(question.id, event.target.value)}
        />
      )
    })()

    return (
      <Box
        key={question.id}
        ref={(el) => { questionRefs.current[question.id] = el }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          py: 1.25,
          borderBottom: '1px solid var(--color-border-secondary)',
          scrollMarginTop: '16px'
        }}
      >
        <Typography sx={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {prompt}
          {question.mandatory && <Typography component="span" sx={{ color: 'var(--color-error)', ml: 0.5 }}>*</Typography>}
        </Typography>
        <Box
          sx={{
            mt: 0.5,
            width: '100%',
            maxWidth: 480,
            alignSelf: 'flex-start'
          }}
          className={(() => {
          const opts = (question.options || []).length
          if (question.type === 'text') return 'input-size-l'
          if (question.type === 'date' || question.type === 'select') return opts > 3 ? 'input-size-m' : 'input-size-s'
          if (question.type === 'file') return 'input-size-l'
          return 'input-size-m'
        })()}>
          {control}
          {helperText}
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Back link-style button above the title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, px: 3 }}>
        <Box
          component="button"
          type="button"
          onClick={() => navigate('/questionnaires')}
          aria-label="Back to forms overview"
          sx={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            px: 0,
            '&:hover': { color: 'var(--color-text-primary)', textDecoration: 'underline' }
          }}
        >
          <ArrowBackOutlined fontSize="small" />
          <span>Forms overview</span>
        </Box>
      </Box>

      {/* Title row with Save aligned to far right */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {form.title}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <MuiButton
            variant="contained"
            size="medium"
            disableElevation
            disabled={!isDirty}
            sx={{
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-color)',
              textTransform: 'none',
              '&:hover': { backgroundColor: 'var(--button-primary-hover-bg)' }
            }}
          >
            Save
          </MuiButton>
        </Box>
      </Box>

      <Box sx={{ px: 3 }}>
        <FormBuilderHeader
          productArea={form.productArea}
          category={form.category}
          createdAt={form.createdAt}
          creator={form.creator}
          description={form.description}
        />
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          aria-label="Form builder tabs"
          textColor="inherit"
          sx={{
            px: 3,
            pt: 1,
            '& .MuiTab-root': { color: 'var(--color-text-secondary)', textTransform: 'none', fontWeight: 600 },
            '& .MuiTab-root.Mui-selected': { color: 'var(--color-text-primary)' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-primary)' }
          }}
        >
          <Tab label="Build" {...a11yProps(0)} />
          <Tab label="Preview" {...a11yProps(1)} />
          <Tab label="Settings" {...a11yProps(2)} />
        </Tabs>
        <Divider />

        <TabPanel value={tabValue} index={0}>
          <Box className="form-builder" sx={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, minHeight: 'calc(100vh - var(--layout-header-height) - 120px)' }}>
            <MenuTree
              form={form}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={handleQuestionSelect}
              selectedSectionId={selectedSectionId}
              onSelectSection={handleSectionSelect}
            />

            <QuestionEditor
              question={selectedQuestion}
              index={Math.max(0, allQuestions.findIndex(q => q.id === selectedQuestionId)) + 1}
              onChange={(updated) => {
                // Prototype: update in place minimally
                setForm((prev) => {
                  const clone = JSON.parse(JSON.stringify(prev))
                  for (const section of clone.sections) {
                    for (const item of section.items) {
                      if (item.type === 'subsection') {
                        const i = (item.items || []).findIndex(q => q.id === updated.id)
                        if (i >= 0) { item.items[i] = updated; return clone }
                      } else if (item.id === updated.id) {
                        // not used in this template
                        return clone
                      }
                    }
                  }
                  return clone
                })
              }}
            />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box className="form-preview" sx={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, minHeight: 'calc(100vh - var(--layout-header-height) - 120px)' }}>
            <MenuTree
              form={form}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={handleQuestionSelect}
              selectedSectionId={selectedSectionId}
              onSelectSection={handleSectionSelect}
              mode="preview"
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ p: 3, overflowY: 'auto', backgroundColor: '#fafafa' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {(form.sections || []).filter(section => section.id === selectedSectionId).map((selectedSection) => (
                    <Paper 
                      key={selectedSection.id} 
                      ref={(el) => { sectionRefs.current[selectedSection.id] = el }}
                      elevation={0} 
                      sx={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-primary)', p: 3, scrollMarginTop: '16px' }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{selectedSection.title}</Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', mb: 2 }}>
                        {(selectedSection.items || []).reduce((count, item) => count + ((item.items || []).length), 0)} fields
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {(selectedSection.items || []).map((item) => (
                          <React.Fragment key={item.id}>
                            {(item.items || []).map((question) => renderPreviewField(question))}
                          </React.Fragment>
                        ))}
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </LocalizationProvider>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Actions card */}
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ borderRadius: 'var(--radius-md)' }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 1 }}>
                      Actions
                    </Typography>
                    <FormControl component="fieldset" fullWidth>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              sx={switchSx}
                              checked={settings.canEditSubmitted}
                              onChange={handleToggleSetting('canEditSubmitted')}
                            />
                          }
                          label="Athletes can edit submitted forms"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              sx={switchSx}
                              checked={settings.canSaveDraft}
                              onChange={handleToggleSetting('canSaveDraft')}
                            />
                          }
                          label="Athletes can save a draft"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              sx={switchSx}
                              checked={settings.savePdfAfterSubmission}
                              onChange={handleToggleSetting('savePdfAfterSubmission')}
                            />
                          }
                          label="Save form as a PDF after submission"
                        />
                      </FormGroup>
                    </FormControl>
                  </Box>
                </Paper>
              </Grid>

              {/* Input method card */}
              <Grid item xs={12} sm={6}>
                <Paper elevation={1} sx={{ borderRadius: 'var(--radius-md)' }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 1 }}>
                      Input method for athletes to submit answer sets
                    </Typography>
                    <FormControl component="fieldset" fullWidth>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              sx={switchSx}
                              checked={settings.allowAthleteApp}
                              onChange={handleToggleSetting('allowAthleteApp')}
                            />
                          }
                          label="Athlete app"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              sx={switchSx}
                              checked={settings.allowKioskApp}
                              onChange={handleToggleSetting('allowKioskApp')}
                            />
                          }
                          label="Kiosk app"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              sx={switchSx}
                              checked={settings.allowAthleteWeb}
                              onChange={handleToggleSetting('allowAthleteWeb')}
                            />
                          }
                          label="Athlete Web"
                        />
                      </FormGroup>
                    </FormControl>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  )
}


