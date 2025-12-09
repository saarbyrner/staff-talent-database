import React from 'react'
import { Box, Typography } from '@mui/material'

function League() {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3
      }}
    >
      <Typography variant="h4" sx={{ color: 'var(--color-text-primary)', mb: 2 }}>
        League View
      </Typography>
      <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
        Welcome to the MLS League view
      </Typography>
    </Box>
  )
}

export default League
