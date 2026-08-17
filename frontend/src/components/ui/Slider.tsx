import type { ChangeEvent, InputHTMLAttributes } from 'react'

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'min' | 'max' | 'step'> {
  label?: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange?: (value: number) => void
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'min',
  onChange,
  ...props
}: SliderProps) {
  return (
    <div className="slider-field">
      <div className="slider-field__head">
        {label && <label className="slider-field__label">{label}</label>}
        <output className="slider-field__value">
          {value} {unit}
        </output>
      </div>
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(Number(e.target.value))}
        {...props}
      />
    </div>
  )
}
