export function Input({ label, id, className = '', ...props }) {
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className={`input ${className}`.trim()} {...props} />
    </div>
  )
}
