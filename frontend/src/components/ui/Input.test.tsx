import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input.jsx'

describe('Input', () => {
  it('renders a styled text input with forwarded props', () => {
    render(<Input aria-label="Task" placeholder="What next?" defaultValue="hello" />)
    const input = screen.getByRole('textbox', { name: 'Task' })
    expect(input).toHaveClass('input')
    expect(input).toHaveAttribute('placeholder', 'What next?')
    expect(input).toHaveValue('hello')
  })

  it('merges a custom className', () => {
    render(<Input aria-label="Task" className="wide" />)
    expect(screen.getByRole('textbox')).toHaveClass('input', 'wide')
  })
})
