import { usePomodoroStore } from '../state/pomodoroStore.js'

export function FocusDuration() {
  const focusMinutes = usePomodoroStore((s) => s.settings.focusMinutes)

  return (
    <span className="focus-duration">
      <span className="focus-duration__value">{focusMinutes} min</span>
      <span className="focus-duration__label">focus</span>
    </span>
  )
}
