import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './Button.jsx'

describe('Button', () => {
  it('renders children with default variant and size classes', () => {
    render(<Button>Start</Button>)
    const btn = screen.getByRole('button', { name: 'Start' })
    expect(btn).toHaveClass('btn', 'btn--primary', 'btn--md')
  })

  it('applies ghost and size classes', () => {
    render(
      <Button variant="ghost" size="lg">
        Reset
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Reset' })).toHaveClass('btn--ghost', 'btn--lg')
  })

  it('merges a custom className and forwards native props', () => {
    render(
      <Button className="custom" disabled>
        Go
      </Button>,
    )
    const btn = screen.getByRole('button', { name: 'Go' })
    expect(btn).toHaveClass('custom')
    expect(btn).toBeDisabled()
  })
})
