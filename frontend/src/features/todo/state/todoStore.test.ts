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
  it('loads a list', () => {
    const list = [{ id: '1', text: 'a', done: false, createdAt: 1 }]
    todoStore.load(list)
    expect(todoStore.getTodos()).toEqual([{ id: '1', text: 'a', done: false, notes: '', active: false, createdAt: 1 }])
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
    expect(mockAdd).toHaveBeenCalledWith('write tests')
    await vi.waitFor(() => expect(todoStore.getTodos()).toEqual([{ ...returned[0], notes: '', active: false }]))
  })

  it('ignores empty additions', () => {
    todoStore.add('   ')
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('toggles optimistically and applies the returned list', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, createdAt: 1 }])
    mockToggle.mockResolvedValue([{ id: '1', text: 'a', done: true, createdAt: 1 }])
    todoStore.toggle('1')
    // Optimistic: flipped before the backend resolves.
    expect(todoStore.getTodos()[0].done).toBe(true)
    expect(mockToggle).toHaveBeenCalledWith('1')
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
    expect(mockRemove).toHaveBeenCalledWith('1')
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
      { id: '1', text: 'a', done: false, createdAt: 1 },
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

  it('clears the pin when the active task is clicked again', async () => {
    todoStore.load([{ id: '1', text: 'a', done: false, active: true, createdAt: 1 }])
    mockSetActive.mockResolvedValue([])
    todoStore.setActive('1')
    expect(mockSetActive).toHaveBeenCalledWith('')
    expect(todoStore.getTodos()[0].active).toBe(false)
  })
})
