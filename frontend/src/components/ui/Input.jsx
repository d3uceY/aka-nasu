export function Input({ className = '', ...props }) {
  return (
    <div className="field">
      <input className={`input ${className}`.trim()} {...props} />
    </div>
  )
}
