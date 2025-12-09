import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { LicenseInfo } from '@mui/x-data-grid-pro'
import App from './App'
import './styles/design-tokens.css'

const theme = createTheme({
  typography: {
    fontFamily: 'Open Sans, sans-serif'
  }
})

// Register MUI X Pro license key from Vite env variable
LicenseInfo.setLicenseKey(import.meta.env.VITE_MUI_X_LICENSE_KEY || '')

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
)