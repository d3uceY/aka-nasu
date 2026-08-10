export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = 'min',
  onChange,
  ...props
}) {
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
        onChange={(e) => onChange?.(Number(e.target.value))}
        {...props}
      />
    </div>
  )
}
