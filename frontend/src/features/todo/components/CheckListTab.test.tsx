import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { CheckListTab } from './CheckListTab.jsx'
import { todoStore } from '../state/todoStore.js'
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

const openTodo = { id: '1', text: 'buy milk', done: false, createdAt: 1 }
const doneTodo = { id: '2', text: 'water plants', done: true, createdAt: 2 }

describe('CheckListTab', () => {
  it('shows both empty states when there are no todos', () => {
    render(<CheckListTab />)
    expect(screen.getByText('Nothing planted yet. Add a seed above.')).toBeInTheDocument()
    expect(screen.getByText('Nothing harvested yet.')).toBeInTheDocument()
  })

  it('lists open and done todos separately', () => {
    todoStore.load([openTodo, doneTodo])
    render(<CheckListTab />)
    expect(screen.getByText('buy milk')).toBeInTheDocument()
    expect(screen.getByText('water plants')).toBeInTheDocument()
  })

  it('adds a trimmed todo on submit', () => {
    mockAdd.mockResolvedValue([openTodo])
    render(<CheckListTab />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  buy milk  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockAdd).toHaveBeenCalledWith('buy milk')
  })

  it('disables Add for an empty draft', () => {
    render(<CheckListTab />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('toggles a todo through the store', () => {
    todoStore.load([openTodo])
    mockToggle.mockResolvedValue([{ ...openTodo, done: true }])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark as done' }))
    expect(mockToggle).toHaveBeenCalledWith('1')
  })

  it('removes a todo through the store', () => {
    todoStore.load([openTodo])
    mockRemove.mockResolvedValue([])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove task' }))
    expect(mockRemove).toHaveBeenCalledWith('1')
  })
})
