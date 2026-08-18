import { beforeEach, describe, it, expect, vi } from 'vitest'
import { todoStore } from './todoStore.js'
import { addTodo, toggleTodo, removeTodo, updateTodo, setActiveTodo } from '../../../lib/backend.js'

vi.mock('../../../lib/backend.js', () => ({
  addTodo: vi.fn(),
  toggleTodo: vi.fn(),
  removeTodo: vi.fn(),
  updateTodo: vi.fn(),
  setActiveTodo: vi.fn(),
}))

const mockAdd = vi.mocked(addTodo)
const mockToggle = vi.mocked(toggleTodo)
const mockRemove = vi.mocked(removeTodo)
const mockUpdate = vi.mocked(updateTodo)
const mockSetActive = vi.mocked(setActiveTodo)

beforeEach(() => {
  todoStore.load([])
  mockAdd.mockClear()
  mockToggle.mockClear()
  mockRemove.mockClear()
  mockUpdate.mockClear()
  mockSetActive.mockClear()
})

describe('todoStore', () => {
  it('loads and normalizes a list', () => {
    const list = [{ id: '1', text: 'a', done: false, active: true, createdAt: 1 }]
    todoStore.load(list)
    expect(todoStore.getTodos()).toEqual([{ id: '1', text: 'a', done: false, notes: '', active: true, createdAt: 1 }])
  })

  it('pins the newest open todo when a loaded list has no pin (legacy)', () => {
    todoStore.load([
      { id: '1', text: 'old', done: true, createdAt: 1 },
      { id: '2', text: 'new', done: false, createdAt: 2 },
    ])
    expect(todoStore.getTodos().filter((t) => t.active).map((t) => t.id)).toEqual(['2'])
  })

  it('repairs a stale pin left on a done task to the newest open task', () => {
    todoStore.load([
      { id: '2', text: 'done-ish', done: true, active: true, createdAt: 2 },
      { id: '1', text: 'open one', done: false, createdAt: 1 },
    ])
    expect(todoStore.getTodos().filter((t) => t.active).map((t) => t.id)).toEqual(['1'])
  })

  it('clears the pin when every loaded task is done', () => {
    todoStore.load([
      { id: '2', text: 'old', done: true, active: true, createdAt: 2 },
      { id: '1', text: 'newer', done: true, createdAt: 1 },
    ])
    expect(todoStore.getTodos().filter((t) => t.active)).toEqual([])
  })

  it('treats a non-array load as empty', () => {
    // @ts-expect-error testing malformed input
    todoStore.load('nope')
    expect(todoStore.getTodos()).toEqual([])
  })

  it('adds a trimmed todo through the backend and applies the result', async () => {
    const returned = [{ id: '2', text: 'write tests', done: false, createdAt: 2 }]
    mockAdd.mockResolvedValue(returned)
    todoStore.add('  write tests  ')
    // Empty list -> the first task is told to be active.
    expect(mockAdd).toHaveBeenCalledWith('write tests', true)
    // The backend's response has no pin, so the frontend pins the newest open.
    await vi.waitFor(() => expect(todoStore.getTodos()).toEqual([{ ...returned[0], notes: '', active: true }]))
  })

  it('adds a later todo without stealing the pin', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, active: true, createdAt: 1 }])
    const returned = [
      { id: '1', text: 'a', done: false, active: true, createdAt: 1 },
      { id: '2', text: 'b', done: false, createdAt: 2 },
    ]
    mockAdd.mockResolvedValue(returned)
    todoStore.add('b')
    expect(mockAdd).toHaveBeenCalledWith('b', false)
    await vi.waitFor(() => expect(todoStore.getTodos().find((t) => t.id === '1')?.active).toBe(true))
  })

  it('ignores empty additions', () => {
    todoStore.add('   ')
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('toggles optimistically and applies the returned list', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, createdAt: 1 }])
    mockToggle.mockResolvedValue([{ id: '1', text: 'a', done: true, createdAt: 1 }])
    todoStore.toggle('1')
    // Optimistic: flipped before the backend resolves. Load pinned the only
    // open task; completing it leaves nothing open to pin (nextActive = '').
    expect(todoStore.getTodos()[0].done).toBe(true)
    expect(mockToggle).toHaveBeenCalledWith('1', '')
    await vi.waitFor(() => expect(todoStore.getTodos()[0].done).toBe(true))
  })

  it('rolls a toggle back when the backend fails', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, createdAt: 1 }])
    mockToggle.mockRejectedValue(new Error('boom'))
    todoStore.toggle('1')
    expect(todoStore.getTodos()[0].done).toBe(true)
    await vi.waitFor(() => expect(todoStore.getTodos()[0].done).toBe(false))
  })

  it('removes optimistically and applies the returned list', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, createdAt: 1 }])
    mockRemove.mockResolvedValue([])
    todoStore.remove('1')
    expect(todoStore.getTodos()).toEqual([])
    // Load pinned the only task; removing it leaves nothing to pin.
    expect(mockRemove).toHaveBeenCalledWith('1', '')
    await vi.waitFor(() => expect(todoStore.getTodos()).toEqual([]))
  })

  it('updates text and notes optimistically', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, createdAt: 1 }])
    const returned = [{ id: '1', text: 'edited', done: false, notes: 'note here', createdAt: 1 }]
    mockUpdate.mockResolvedValue(returned)
    todoStore.update('1', 'edited', 'note here')
    expect(todoStore.getTodos()[0]).toMatchObject({ text: 'edited', notes: 'note here' })
    expect(mockUpdate).toHaveBeenCalledWith('1', 'edited', 'note here')
    await vi.waitFor(() => expect(todoStore.getTodos()[0].notes).toBe('note here'))
  })

  it('sets a todo active and clears the previous one', async () => {
    todoStore.load([
      { id: '1', text: 'a', done: false, active: true, createdAt: 1 },
      { id: '2', text: 'b', done: false, createdAt: 2 },
    ])
    const returned = [
      { id: '1', text: 'a', done: false, active: false, createdAt: 1 },
      { id: '2', text: 'b', done: false, active: true, createdAt: 2 },
    ]
    mockSetActive.mockResolvedValue(returned)
    todoStore.setActive('2')
    // Optimistic: only '2' active.
    expect(todoStore.getTodos().filter((t) => t.active).map((t) => t.id)).toEqual(['2'])
    expect(mockSetActive).toHaveBeenCalledWith('2')
    await vi.waitFor(() => expect(todoStore.getTodos().find((t) => t.id === '2')?.active).toBe(true))
  })

  it('tapping the current task is a no-op (no unpin)', () => {
    todoStore.load([{ id: '1', text: 'a', done: false, active: true, createdAt: 1 }])
    todoStore.setActive('1')
    expect(mockSetActive).not.toHaveBeenCalled()
    expect(todoStore.getTodos()[0].active).toBe(true)
  })

  it('completing the active task hands the pin to the top of the list', async () => {
    // Newest-first: [c, b, a]; b is active. Completing b pins c (the top).
    todoStore.load([
      { id: '3', text: 'c', done: false, createdAt: 3 },
      { id: '2', text: 'b', done: false, active: true, createdAt: 2 },
      { id: '1', text: 'a', done: false, createdAt: 1 },
    ])
    mockToggle.mockResolvedValue([
      { id: '3', text: 'c', done: false, active: true, createdAt: 3 },
      { id: '2', text: 'b', done: true, active: false, createdAt: 2 },
      { id: '1', text: 'a', done: false, active: false, createdAt: 1 },
    ])
    todoStore.toggle('2')
    expect(mockToggle).toHaveBeenCalledWith('2', '3')
    expect(todoStore.getTodos().filter((t) => t.active).map((t) => t.id)).toEqual(['3'])
    await vi.waitFor(() => expect(todoStore.getTodos().find((t) => t.id === '3')?.active).toBe(true))
  })

  it('completing the last open todo clears the pin (a done task is never current)', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, active: true, createdAt: 1 }])
    mockToggle.mockResolvedValue([{ id: '1', text: 'a', done: true, active: true, createdAt: 1 }])
    todoStore.toggle('1')
    // Nothing is left open to hand the pin to, so the done task is unpinned.
    expect(mockToggle).toHaveBeenCalledWith('1', '')
    expect(todoStore.getTodos().filter((t) => t.active)).toEqual([])
    expect(todoStore.getTodos()[0].done).toBe(true)
    await vi.waitFor(() => expect(todoStore.getTodos().filter((t) => t.active)).toEqual([]))
  })

  it('completing the active task hands the pin to the newest open, skipping done ones', async () => {
    // Newest-first: [c(done), b(open), a(active)]. Completing a pins b — the
    // top open todo — never the done task c.
    todoStore.load([
      { id: '3', text: 'c', done: true, createdAt: 3 },
      { id: '2', text: 'b', done: false, active: false, createdAt: 2 },
      { id: '1', text: 'a', done: false, active: true, createdAt: 1 },
    ])
    mockToggle.mockResolvedValue([
      { id: '3', text: 'c', done: true, active: false, createdAt: 3 },
      { id: '2', text: 'b', done: false, active: true, createdAt: 2 },
      { id: '1', text: 'a', done: true, active: false, createdAt: 1 },
    ])
    todoStore.toggle('1')
    expect(mockToggle).toHaveBeenCalledWith('1', '2')
    expect(todoStore.getTodos().filter((t) => t.active).map((t) => t.id)).toEqual(['2'])
    await vi.waitFor(() => expect(todoStore.getTodos().find((t) => t.id === '2')?.active).toBe(true))
  })

  it('completing the current task moves the pin to the top open todo below done ones', async () => {
    // Newest-first: [a(active, newest), b(done), c(open)]. Completing a pins c —
    // the top of the "To-do" (open) list — not the done task above it.
    todoStore.load([
      { id: '3', text: 'a', done: false, active: true, createdAt: 3 },
      { id: '2', text: 'b', done: true, createdAt: 2 },
      { id: '1', text: 'c', done: false, createdAt: 1 },
    ])
    mockToggle.mockResolvedValue([
      { id: '3', text: 'a', done: true, active: false, createdAt: 3 },
      { id: '2', text: 'b', done: true, active: false, createdAt: 2 },
      { id: '1', text: 'c', done: false, active: true, createdAt: 1 },
    ])
    todoStore.toggle('3')
    expect(mockToggle).toHaveBeenCalledWith('3', '1')
    expect(todoStore.getTodos().filter((t) => t.active).map((t) => t.id)).toEqual(['1'])
    await vi.waitFor(() => expect(todoStore.getTodos().find((t) => t.id === '1')?.active).toBe(true))
  })

  it('removing the active task hands the pin to the next open todo', async () => {
    // Newest-first: [c, b, a]; b is active. Removing b pins a.
    todoStore.load([
      { id: '3', text: 'c', done: false, createdAt: 3 },
      { id: '2', text: 'b', done: false, active: true, createdAt: 2 },
      { id: '1', text: 'a', done: false, createdAt: 1 },
    ])
    mockRemove.mockResolvedValue([
      { id: '3', text: 'c', done: false, active: false, createdAt: 3 },
      { id: '1', text: 'a', done: false, active: true, createdAt: 1 },
    ])
    todoStore.remove('2')
    expect(mockRemove).toHaveBeenCalledWith('2', '1')
    expect(todoStore.getTodos().map((t) => t.id)).toEqual(['3', '1'])
    expect(todoStore.getTodos().filter((t) => t.active).map((t) => t.id)).toEqual(['1'])
    await vi.waitFor(() => expect(todoStore.getTodos().find((t) => t.id === '1')?.active).toBe(true))
  })

  it('removing the last open task clears the pin when only done tasks remain', async () => {
    // Newest-first: [b(done), a(open, active)]. Removing a leaves no open task
    // to pin, so the done task b is unpinned.
    todoStore.load([
      { id: '2', text: 'b', done: true, createdAt: 2 },
      { id: '1', text: 'a', done: false, active: true, createdAt: 1 },
    ])
    mockRemove.mockResolvedValue([{ id: '2', text: 'b', done: true, active: true, createdAt: 2 }])
    todoStore.remove('1')
    expect(mockRemove).toHaveBeenCalledWith('1', '')
    expect(todoStore.getTodos().filter((t) => t.active)).toEqual([])
    await vi.waitFor(() => expect(todoStore.getTodos().filter((t) => t.active)).toEqual([]))
  })
})
