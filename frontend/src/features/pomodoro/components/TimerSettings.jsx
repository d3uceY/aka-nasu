import { useState } from 'react'
import { Button } from '../../../components/ui/Button.jsx'
import { Slider } from '../../../components/ui/Slider.jsx'
import { usePomodoroStore } from '../state/pomodoroStore.js'

export function TimerSettings({ actions }) {
  const settings = usePomodoroStore((s) => s.settings)
  const status = usePomodoroStore((s) => s.status)
  const [open, setOpen] = useState(false)

  // Settings are locked while a timer is running or paused.
  const locked = status !== 'idle'

  return (
    <section className="settings">
      <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
        {open ? 'Hide settings' : '⚙ Settings'}
      </Button>
      {open && (
        <div className="settings__panel">
          <Slider
            label="Focus"
            value={settings.focusMinutes}
            min={1}
            max={60}
            disabled={locked}
            onChange={(v) => actions.setSettings({ focusMinutes: v })}
          />
          <Slider
            label="Short break"
            value={settings.shortBreakMinutes}
            min={1}
            max={30}
            disabled={locked}
            onChange={(v) => actions.setSettings({ shortBreakMinutes: v })}
          />
          <Slider
            label="Long break"
            value={settings.longBreakMinutes}
            min={5}
            max={60}
            disabled={locked}
            onChange={(v) => actions.setSettings({ longBreakMinutes: v })}
          />
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              disabled={locked}
              onChange={(e) => actions.setSettings({ autoStartBreaks: e.target.checked })}
            />
            <span>Auto-start breaks</span>
          </label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.autoStartFocus}
              disabled={locked}
              onChange={(e) => actions.setSettings({ autoStartFocus: e.target.checked })}
            />
            <span>Auto-start focus sessions</span>
          </label>
        </div>
      )}
    </section>
  )
}
