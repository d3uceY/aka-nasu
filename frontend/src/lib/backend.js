import * as SettingsService from '../../bindings/aka-nasu/backend/settings/service.js'
import * as TodoService from '../../bindings/aka-nasu/backend/todos/service.js'
import * as StatsService from '../../bindings/aka-nasu/backend/stats/service.js'
import * as TimerService from '../../bindings/aka-nasu/backend/timer/service.js'

// Thin wrapper over the generated Wails bindings. Errors surface in the
// console and callers keep running on defaults.

export async function loadAppState() {
  const [settings, timer, todos, stats] = await Promise.all([
    SettingsService.GetSettings(),
    TimerService.GetTimerState(),
    TodoService.GetTodos(),
    StatsService.GetStats(),
  ])
  return { settings, timer, todos, stats }
}

export const saveSettings = (settings) => SettingsService.UpdateSettings(settings)
export const saveTimer = (state) => TimerService.UpdateTimerState(state)
export const saveStats = (stats) => StatsService.UpdateStats(stats)
export const addTodo = (text) => TodoService.AddTodo(text)
export const toggleTodo = (id) => TodoService.ToggleTodo(id)
export const removeTodo = (id) => TodoService.RemoveTodo(id)
