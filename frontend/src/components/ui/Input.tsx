import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export function Input({ className = '', ...props }: InputProps) {
  return (
    <div className="field">
      <input className={`input ${className}`.trim()} {...props} />
    </div>
  )
}
