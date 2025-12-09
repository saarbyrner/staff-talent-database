import React from 'react'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  IconButton,
  Button
} from '@mui/material'
import { ExpandMoreOutlined, MoreVertOutlined, DragIndicatorOutlined, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material'

export default function MenuTree({ form, selectedQuestionId, onSelectQuestion, selectedSectionId, onSelectSection, mode = 'build', completionByQuestionId = {} }) {
  const [expanded, setExpanded] = React.useState([])

  function toggleExpanded(id) {
    setExpanded((prev) => (
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    ))
  }
  
  function findSectionForQuestion(questionId) {
    for (const section of form.sections || []) {
      const questions = (section.items || []).flatMap(sub => sub.items || [])
      if (questions.some(q => q.id === questionId)) {
        return section.id
      }
    }
    return null
  }
  
  function handleQuestionClick(questionId) {
    const sectionId = findSectionForQuestion(questionId)
    if (sectionId) {
      // Expand the section if not already expanded
      setExpanded((prev) => prev.includes(sectionId) ? prev : [...prev, sectionId])
      // Select the section in preview mode
      if (mode === 'preview' && onSelectSection) {
        onSelectSection(sectionId)
      }
    }
    // Select the question
    onSelectQuestion(questionId)
  }

  function countItemsInSection(section) {
    return (section.items || []).reduce((count, item) => count + ((item.items || []).length), 0)
  }

  return (
    <Box sx={{
      borderRight: '1px solid var(--color-border-primary)',
      pr: 0,
      pt: 2,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pl: 2, pr: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Menu</Typography>
        {mode === 'build' && (
          <Button
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: 'var(--button-secondary-bg)',
              color: 'var(--button-secondary-color)',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { backgroundColor: 'var(--button-secondary-hover-bg)', boxShadow: 'none' }
            }}
          >
            Add
          </Button>
        )}
      </Box>

      <List aria-label="Form Menu" disablePadding sx={{ flexGrow: 1 }}>
        {(form.sections || []).map((section) => (
          <Box key={section.id}>
            <Accordion elevation={1} expanded={expanded.includes(section.id)} onChange={() => toggleExpanded(section.id)} sx={{ boxShadow: 'none', borderRadius: 0, '&:hover': { backgroundColor: 'var(--color-background-secondary)' } }}>
              <AccordionSummary
                expandIcon={<ExpandMoreOutlined />}
                onClick={(e) => {
                  if (mode === 'preview' && onSelectSection) {
                    onSelectSection(section.id)
                  }
                }}
                sx={{ pl: 2, pr: 2, '& .MuiAccordionSummary-content': { my: 0 }, ...(mode === 'preview' && selectedSectionId === section.id && { backgroundColor: 'var(--color-background-secondary)' }) }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {mode === 'build' && (<DragIndicatorOutlined fontSize="small" />)}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{section.title}</Typography>
                      <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                        {countItemsInSection(section)} question{countItemsInSection(section) === 1 ? '' : 's'}
                      </Typography>
                    </Box>
                  </Box>
                  {mode === 'build' && (
                    <IconButton size="small" aria-label="section actions">
                      <MoreVertOutlined fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pl: 0, pr: 0, pt: 0, pb: 0 }}>
                <List component="div" disablePadding>
                  {(section.items || []).flatMap(sub => sub.items || []).map((q) => (
                    <ListItemButton
                      key={q.id}
                      selected={selectedQuestionId === q.id}
                      onClick={() => handleQuestionClick(q.id)}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 0, pl: 4, pr: 2, py: 1 }}
                      role="menuitem"
                    >
                      {mode === 'build' ? (
                        <DragIndicatorOutlined fontSize="small" />
                      ) : (
                        completionByQuestionId[q.id] ? (
                          <CheckCircle fontSize="small" sx={{ color: 'var(--color-success, #2e7d32)' }} />
                        ) : (
                          <RadioButtonUnchecked fontSize="small" sx={{ color: 'var(--color-border-primary)' }} />
                        )
                      )}
                      <Typography variant="body1" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.label?.length > 40 ? `${q.label.slice(0, 40)}...` : q.label}
                      </Typography>
                    </ListItemButton>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
      </List>
    </Box>
  )
}


