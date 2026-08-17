import { beforeEach, describe, it, expect, vi } from 'vitest'
import { todoStore } from './todoStore.js'
import { addTodo, toggleTodo, removeTodo } from '../../../lib/backend.js'

vi.mock('../../../lib/backend.js', () => ({
  addTodo: vi.fn(),
  toggleTodo: vi.fn(),
  removeTodo: vi.fn(),
}))

const mockAdd = vi.mocked(addTodo)
const mockToggle = vi.mocked(toggleTodo)
const mockRemove = vi.mocked(removeTodo)

beforeEach(() => {
  todoStore.load([])
  mockAdd.mockClear()
  mockToggle.mockClear()
  mockRemove.mockClear()
})

describe('todoStore', () => {
  it('loads a list', () => {
    const list = [{ id: '1', text: 'a', done: false, createdAt: 1 }]
    todoStore.load(list)
    expect(todoStore.getTodos()).toEqual(list)
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
    await vi.waitFor(() => expect(todoStore.getTodos()).toEqual(returned))
  })

  it('ignores empty additions', () => {
    todoStore.add('   ')
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('toggles and applies the returned list', async () => {
    const returned = [{ id: '1', text: 'a', done: true, createdAt: 1 }]
    mockToggle.mockResolvedValue(returned)
    todoStore.toggle('1')
    expect(mockToggle).toHaveBeenCalledWith('1')
    await vi.waitFor(() => expect(todoStore.getTodos()).toEqual(returned))
  })

  it('removes and applies the returned list', async () => {
    const returned: never[] = []
    mockRemove.mockResolvedValue(returned)
    todoStore.remove('1')
    expect(mockRemove).toHaveBeenCalledWith('1')
    await vi.waitFor(() => expect(todoStore.getTodos()).toEqual(returned))
  })
})
