import { usePomodoroStore } from '../state/pomodoroStore.js'

export function FocusDuration() {
  const focusMinutes = usePomodoroStore((s) => s.settings.focusMinutes)
  const status = usePomodoroStore((s) => s.status)

  return (
    <div className="focus-duration">
      <span className="focus-duration__label">Focus length</span>
      <strong className="focus-duration__value">{focusMinutes} min</strong>
      {status === 'idle' && (
        <span className="focus-duration__hint">spin the dial, scroll, or use the slider</span>
      )}
    </div>
  )
}
