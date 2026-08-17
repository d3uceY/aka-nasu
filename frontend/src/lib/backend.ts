import * as SettingsService from '../../bindings/aka-nasu/backend/settings/service.js'
import * as TodoService from '../../bindings/aka-nasu/backend/todos/service.js'
import * as StatsService from '../../bindings/aka-nasu/backend/stats/service.js'
import * as TimerService from '../../bindings/aka-nasu/backend/timer/service.js'
import * as VersionService from '../../bindings/aka-nasu/backend/version/service.js'
import * as NotifyService from '../../bindings/aka-nasu/backend/notify/service.js'
import { Settings, TimerState, Stats, Todo } from '../../bindings/aka-nasu/backend/config/models.js'
import type { Phase } from '../features/pomodoro/types.js'

// True when a native Wails bridge is present. In a plain browser (Vite
// preview) there's no bridge, so binding calls would just 404 against the
// dev server. Browser preview then runs on defaults instead.
function hasBridge(): boolean {
  return Boolean(
    window.chrome?.webview?.postMessage ||
      window.webkit?.messageHandlers?.['external']?.postMessage ||
      window.wails?.invoke,
  )
}

// The whole persisted app state, as the stores consume it on load.
export interface AppState {
  settings: Settings
  timer: TimerState
  todos: Todo[]
  stats: Stats
}

// Shape the stores can load when the bridge is absent. Each store merges
// these over its own defaults, so an empty shell is all they need.
const BROWSER_DEFAULTS: AppState = {
  settings: new Settings(),
  timer: new TimerState(),
  todos: [],
  stats: new Stats(),
}

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value)
}

export async function loadAppState(): Promise<AppState> {
  if (!hasBridge()) return BROWSER_DEFAULTS
  const [settings, timer, todos, stats] = await Promise.all([
    SettingsService.GetSettings(),
    TimerService.GetTimerState(),
    TodoService.GetTodos(),
    StatsService.GetStats(),
  ])
  return { settings, timer, todos, stats }
}

export async function getAppVersion(): Promise<string | null> {
  if (!hasBridge()) return null
  return VersionService.GetVersion()
}

export const saveSettings = (settings: Settings): Promise<Settings> =>
  hasBridge() ? SettingsService.UpdateSettings(settings) : resolve(settings)
export const saveTimer = (state: TimerState): Promise<TimerState> =>
  hasBridge() ? TimerService.UpdateTimerState(state) : resolve(state)
export const saveStats = (stats: Stats): Promise<Stats> =>
  hasBridge() ? StatsService.UpdateStats(stats) : resolve(stats)
export const addTodo = (text: string): Promise<Todo[]> =>
  hasBridge() ? TodoService.AddTodo(text) : resolve([])
export const toggleTodo = (id: string): Promise<Todo[]> =>
  hasBridge() ? TodoService.ToggleTodo(id) : resolve([])
export const removeTodo = (id: string): Promise<Todo[]> =>
  hasBridge() ? TodoService.RemoveTodo(id) : resolve([])

// Native OS notification for a finished phase. The Go side (backend/notify)
// queues the send onto a contained worker goroutine, so this resolves
// immediately and can never block or crash the app. Fire-and-forget here too:
// a notification failure must never bubble into the timer flow. In a plain
// browser (no Wails bridge) it's a no-op.
const PHASE_NOTIFY: Record<Phase, { title: string; body: string }> = {
  focus: { title: 'Focus complete', body: 'Time for a break.' },
  shortBreak: { title: 'Break over', body: 'Back to focus.' },
  longBreak: { title: 'Break over', body: 'Back to focus.' },
}

export function notifyPhaseComplete(phase: Phase): void {
  if (!hasBridge()) return
  const copy = PHASE_NOTIFY[phase] ?? PHASE_NOTIFY.focus
  NotifyService.Send(copy.title, copy.body).catch(() => {})
}
