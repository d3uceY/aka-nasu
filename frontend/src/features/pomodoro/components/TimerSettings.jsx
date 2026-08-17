import { useState } from 'react'
import { Slider } from '../../../components/ui/Slider.jsx'
import { usePomodoroStore } from '../state/pomodoroStore.js'
import { playSound } from '../../../utils/audio.js'

function GearIcon() {
  return (
    <svg
      className="settings__toggle-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.09a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
    </svg>
  )
}

export function TimerSettings({ actions }) {
  const settings = usePomodoroStore((s) => s.settings)
  const status = usePomodoroStore((s) => s.status)
  const [open, setOpen] = useState(false)

  // Settings are locked while a timer is running or paused.
  const locked = status !== 'idle'

  return (
    <section className="settings">
      <button
        type="button"
        className="settings__toggle"
        aria-label="Timer settings"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          playSound('gearClick')
        }}
      >
        <GearIcon />
      </button>
      <button
        type="button"
        className="settings__scrim"
        tabIndex={-1}
        aria-hidden="true"
        data-open={open}
        onClick={() => {
          setOpen(false)
          playSound('gearClick')
        }}
      />
      <div
        className="settings__popover"
        data-open={open}
        role="dialog"
        aria-label="Timer settings"
      >
        <p className="settings__title">Durations</p>
        <Slider
          label="Focus"
          value={settings.focusMinutes}
          min={1}
          max={60}
          disabled={locked}
          onChange={(v) => {
            playSound('dialRatchetTick', 50)
            actions.setSettings({ focusMinutes: v })
          }}
        />
        <Slider
          label="Short break"
          value={settings.shortBreakMinutes}
          min={1}
          max={30}
          disabled={locked}
          onChange={(v) => {
            playSound('dialRatchetTick', 50)
            actions.setSettings({ shortBreakMinutes: v })
          }}
        />
        <Slider
          label="Long break"
          value={settings.longBreakMinutes}
          min={5}
          max={60}
          disabled={locked}
          onChange={(v) => {
            playSound('dialRatchetTick', 50)
            actions.setSettings({ longBreakMinutes: v })
          }}
        />
        <p className="settings__title">Automation</p>
        <label className="toggle">
          <span>Auto-start breaks</span>
          <input
            type="checkbox"
            checked={settings.autoStartBreaks}
            disabled={locked}
            onChange={(e) => {
              playSound('gearClick')
              actions.setSettings({ autoStartBreaks: e.target.checked })
            }}
          />
        </label>
        <label className="toggle">
          <span>Auto-start focus sessions</span>
          <input
            type="checkbox"
            checked={settings.autoStartFocus}
            disabled={locked}
            onChange={(e) => {
              playSound('gearClick')
              actions.setSettings({ autoStartFocus: e.target.checked })
            }}
          />
        </label>
        <p className="settings__title">Sound</p>
        <label className="toggle">
          <span>Play sounds</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            disabled={locked}
            onChange={(e) => actions.setSettings({ soundEnabled: e.target.checked })}
          />
        </label>
      </div>
    </section>
  )
}
