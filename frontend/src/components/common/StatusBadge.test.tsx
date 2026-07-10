import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the status label with underscores replaced by spaces', () => {
    render(<StatusBadge status="IN_USE" />)
    expect(screen.getByText('IN USE')).toBeInTheDocument()
  })

  it('applies a bootstrap badge class', () => {
    render(<StatusBadge status="AVAILABLE" />)
    expect(screen.getByText('AVAILABLE').className).toContain('badge')
  })
})
