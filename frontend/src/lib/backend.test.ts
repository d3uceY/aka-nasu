import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import {
  loadAppState,
  getAppVersion,
  saveSettings,
  saveTimer,
  saveStats,
  addTodo,
  toggleTodo,
  removeTodo,
  updateTodo,
  setActiveTodo,
  notifyPhaseComplete,
} from './backend.js'
import * as SettingsService from '../../bindings/aka-nasu/backend/settings/service.js'
import * as TodoService from '../../bindings/aka-nasu/backend/todos/service.js'
import * as StatsService from '../../bindings/aka-nasu/backend/stats/service.js'
import * as TimerService from '../../bindings/aka-nasu/backend/timer/service.js'
import * as VersionService from '../../bindings/aka-nasu/backend/version/service.js'
import * as NotifyService from '../../bindings/aka-nasu/backend/notify/service.js'

vi.mock('../../bindings/aka-nasu/backend/settings/service.js', () => ({
  GetSettings: vi.fn(),
  UpdateSettings: vi.fn(),
}))
vi.mock('../../bindings/aka-nasu/backend/todos/service.js', () => ({
  GetTodos: vi.fn(),
  AddTodo: vi.fn(),
  ToggleTodo: vi.fn(),
  RemoveTodo: vi.fn(),
  UpdateTodo: vi.fn(),
  SetActiveTodo: vi.fn(),
}))
vi.mock('../../bindings/aka-nasu/backend/stats/service.js', () => ({
  GetStats: vi.fn(),
  UpdateStats: vi.fn(),
}))
vi.mock('../../bindings/aka-nasu/backend/timer/service.js', () => ({
  GetTimerState: vi.fn(),
  UpdateTimerState: vi.fn(),
}))
vi.mock('../../bindings/aka-nasu/backend/version/service.js', () => ({
  GetVersion: vi.fn(),
}))
vi.mock('../../bindings/aka-nasu/backend/notify/service.js', () => ({
  Send: vi.fn(() => Promise.resolve()),
}))

function clearBridge(): void {
  delete window.chrome
  delete window.webkit
  delete window.wails
}

function setBridge(): void {
  window.wails = { invoke: vi.fn() }
}

beforeEach(() => {
  clearBridge()
  vi.clearAllMocks()
})

afterEach(() => {
  clearBridge()
})

describe('loadAppState', () => {
  it('returns browser defaults without a bridge', async () => {
    const state = await loadAppState()
    expect(state.settings.focusMinutes).toBe(0)
    expect(state.timer).toBeDefined()
    expect(state.todos).toEqual([])
    expect(state.stats).toBeDefined()
    expect(SettingsService.GetSettings).not.toHaveBeenCalled()
  })

  it('loads from all four services when the bridge is present', async () => {
    setBridge()
    vi.mocked(SettingsService.GetSettings).mockResolvedValue({ focusMinutes: 40 } as never)
    vi.mocked(TimerService.GetTimerState).mockResolvedValue({ status: 'idle' } as never)
    vi.mocked(TodoService.GetTodos).mockResolvedValue([{ id: '1', text: 'a' }] as never)
    vi.mocked(StatsService.GetStats).mockResolvedValue({ round: 1 } as never)

    const state = await loadAppState()
    expect(state.settings.focusMinutes).toBe(40)
    expect(state.todos[0].id).toBe('1')
    expect(SettingsService.GetSettings).toHaveBeenCalledTimes(1)
    expect(TimerService.GetTimerState).toHaveBeenCalledTimes(1)
    expect(TodoService.GetTodos).toHaveBeenCalledTimes(1)
    expect(StatsService.GetStats).toHaveBeenCalledTimes(1)
  })
})

describe('getAppVersion', () => {
  it('returns null without a bridge', async () => {
    expect(await getAppVersion()).toBeNull()
  })

  it('returns the version with a bridge', async () => {
    setBridge()
    vi.mocked(VersionService.GetVersion).mockResolvedValue('0.1.0' as never)
    expect(await getAppVersion()).toBe('0.1.0')
  })
})

describe('save wrappers', () => {
  it('resolve through without a bridge', async () => {
    const settings = { focusMinutes: 25 } as never
    await expect(saveSettings(settings)).resolves.toBe(settings)
    const timer = { status: 'idle' } as never
    await expect(saveTimer(timer)).resolves.toBe(timer)
    const stats = { round: 1 } as never
    await expect(saveStats(stats)).resolves.toBe(stats)
    await expect(addTodo('x', true)).resolves.toEqual([])
    await expect(toggleTodo('1', '')).resolves.toEqual([])
    await expect(removeTodo('1', '')).resolves.toEqual([])
    await expect(updateTodo('1', 'x', 'n')).resolves.toEqual([])
    await expect(setActiveTodo('1')).resolves.toEqual([])
  })

  it('delegate to the bindings with a bridge', async () => {
    setBridge()
    vi.mocked(SettingsService.UpdateSettings).mockResolvedValue({} as never)
    vi.mocked(TimerService.UpdateTimerState).mockResolvedValue({} as never)
    vi.mocked(StatsService.UpdateStats).mockResolvedValue({} as never)
    vi.mocked(TodoService.AddTodo).mockResolvedValue([])
    vi.mocked(TodoService.ToggleTodo).mockResolvedValue([])
    vi.mocked(TodoService.RemoveTodo).mockResolvedValue([])
    vi.mocked(TodoService.UpdateTodo).mockResolvedValue([])
    vi.mocked(TodoService.SetActiveTodo).mockResolvedValue([])

    await saveSettings({ focusMinutes: 25 } as never)
    await saveTimer({ status: 'idle' } as never)
    await saveStats({ round: 1 } as never)
    await addTodo('x', true)
    await toggleTodo('1', '')
    await removeTodo('2', '')
    await updateTodo('3', 'new', 'note')
    await setActiveTodo('4')

    expect(SettingsService.UpdateSettings).toHaveBeenCalledWith({ focusMinutes: 25 })
    expect(TimerService.UpdateTimerState).toHaveBeenCalled()
    expect(StatsService.UpdateStats).toHaveBeenCalled()
    expect(TodoService.AddTodo).toHaveBeenCalledWith('x', true)
    expect(TodoService.ToggleTodo).toHaveBeenCalledWith('1', '')
    expect(TodoService.RemoveTodo).toHaveBeenCalledWith('2', '')
    expect(TodoService.UpdateTodo).toHaveBeenCalledWith('3', 'new', 'note')
    expect(TodoService.SetActiveTodo).toHaveBeenCalledWith('4')
  })
})

describe('notifyPhaseComplete', () => {
  it('is a no-op without a bridge', () => {
    notifyPhaseComplete('focus')
    expect(NotifyService.Send).not.toHaveBeenCalled()
  })

  it('sends the matching copy with a bridge', () => {
    setBridge()
    notifyPhaseComplete('focus')
    expect(NotifyService.Send).toHaveBeenCalledWith('Focus complete', 'Time for a break.')
    notifyPhaseComplete('shortBreak')
    expect(NotifyService.Send).toHaveBeenLastCalledWith('Break over', 'Back to focus.')
  })
})
