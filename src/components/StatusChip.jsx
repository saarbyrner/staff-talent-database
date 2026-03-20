import React from 'react'
import PropTypes from 'prop-types'
import { Chip } from '@mui/material'

/**
 * Medinah Design System Status Chip Component
 * 
 * Uses MUI Chip with consistent colors and styling
 * Automatically applies correct status colors based on type
 */
function MedinahStatusChip({ status, type = 'default', className = '', ...props }) {
  const getChipProps = () => {
    // Custom: If status is 'Incomplete', use grey
    if (status === 'Incomplete') {
      return {
        variant: 'filled',
        size: 'small',
        sx: {
          backgroundColor: '#bdbdbd',
          color: '#fff',
        }
      };
    }
    switch (type) {
      case 'success':
        return {
          color: 'success',
          variant: 'filled',
          size: 'small'
        }
      case 'error':
        return {
          color: 'error',
          variant: 'filled',
          size: 'small'
        }
      case 'warning':
        return {
          color: 'warning',
          variant: 'filled',
          size: 'small'
        }
      case 'primary':
        return {
          color: 'primary',
          variant: 'filled',
          size: 'small'
        }
      default:
        return {
          variant: 'outlined',
          size: 'small'
        }
    }
  }

  const chipProps = getChipProps()

  return (
    <Chip
      label={status}
      className={className}
      {...chipProps}
      {...props}
    />
  )
}

MedinahStatusChip.propTypes = {
  status: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'primary', 'default']),
  className: PropTypes.string
}

export default MedinahStatusChip