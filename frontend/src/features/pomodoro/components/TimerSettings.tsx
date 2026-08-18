import { useState } from 'react'
import { Slider } from '../../../components/ui/Slider.jsx'
import { usePomodoroStore, pomodoroActions } from '../state/pomodoroStore.js'
import { TOMATO_PALETTES } from '../constants/palettes.js'
import { PaletteSwatch } from './PaletteSwatch.jsx'
import { playSound } from '../../../utils/audio.js'
import { useUpdateStore } from '../../update/state/updateStore.js'
import { DOWNLOAD_URL, displayVersion } from '../../update/constants.js'
import { openExternal } from '../../../lib/externalLink.js'

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

export function TimerSettings() {
  const settings = usePomodoroStore((s) => s.settings)
  const status = usePomodoroStore((s) => s.status)
  // Latest release found by the startup check (null when up to date).
  const update = useUpdateStore((s) => s.release)
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
        {update && (
          <span
            className="settings__update-badge"
            title={`Version ${displayVersion(update.tag)} available`}
            aria-hidden="true"
          />
        )}
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
            pomodoroActions.setSettings({ focusMinutes: v })
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
            pomodoroActions.setSettings({ shortBreakMinutes: v })
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
            pomodoroActions.setSettings({ longBreakMinutes: v })
          }}
        />
        <p className="settings__title">Color</p>
        <div
          className="palette-grid"
          role="radiogroup"
          aria-label="Tomato color"
        >
          {TOMATO_PALETTES.map((p) => (
            <PaletteSwatch
              key={p.id}
              palette={p}
              selected={settings.palette === p.id}
              disabled={locked}
              onSelect={() => pomodoroActions.setSettings({ palette: p.id })}
            />
          ))}
        </div>

        <p className="settings__title">Automation</p>
        <label className="toggle">
          <span>Auto-start breaks</span>
          <input
            type="checkbox"
            checked={settings.autoStartBreaks}
            disabled={locked}
            onChange={(e) => {
              playSound('gearClick')
              pomodoroActions.setSettings({ autoStartBreaks: e.target.checked })
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
              pomodoroActions.setSettings({ autoStartFocus: e.target.checked })
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
            onChange={(e) => pomodoroActions.setSettings({ soundEnabled: e.target.checked })}
          />
        </label>
        <Slider
          label="Volume"
          value={Math.round(settings.soundVolume * 100)}
          min={0}
          max={100}
          step={5}
          unit="%"
          disabled={locked}
          onChange={(v) => pomodoroActions.setSettings({ soundVolume: v / 100 })}
        />
        {update && (
          <>
            <p className="settings__title">Update</p>
            <div className="settings__update">
              <p className="settings__update-text">
                Version {displayVersion(update.tag)} is available.
              </p>
              <button
                type="button"
                className="settings__update-link"
                onClick={() => {
                  playSound('gearClick')
                  openExternal(DOWNLOAD_URL)
                }}
              >
                Go to website
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
