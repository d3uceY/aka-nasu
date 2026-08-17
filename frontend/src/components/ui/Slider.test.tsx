import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Slider } from './Slider.jsx'

describe('Slider', () => {
  it('renders a range input with the current value', () => {
    render(<Slider label="Focus" value={25} min={1} max={60} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveValue('25')
    expect(screen.getByText('25 min')).toBeInTheDocument()
  })

  it('reports numeric changes through onChange', () => {
    const onChange = vi.fn()
    render(<Slider label="Focus" value={25} min={1} max={60} onChange={onChange} />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '30' } })
    expect(onChange).toHaveBeenCalledWith(30)
  })

  it('forwards disabled state', () => {
    render(<Slider label="Focus" value={25} min={1} max={60} disabled />)
    expect(screen.getByRole('slider')).toBeDisabled()
  })
})
