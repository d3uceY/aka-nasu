import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { CheckListTab } from './CheckListTab.jsx'
import { todoStore } from '../state/todoStore.js'
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

const openTodo = { id: '1', text: 'buy milk', done: false, createdAt: 1 }
const doneTodo = { id: '2', text: 'water plants', done: true, createdAt: 2 }

describe('CheckListTab', () => {
  it('shows both empty states and the active-task hint when there are no todos', () => {
    render(<CheckListTab />)
    expect(screen.getByText('Nothing planted yet. Add a seed above.')).toBeInTheDocument()
    expect(screen.getByText('Nothing harvested yet.')).toBeInTheDocument()
    expect(screen.getByText('Tap a task to make it current')).toBeInTheDocument()
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
    fireEvent.change(screen.getByRole('textbox', { name: 'What are you going to do today?' }), {
      target: { value: '  buy milk  ' },
    })
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

  it('pins the clicked task in the current-task header', () => {
    todoStore.load([openTodo])
    mockSetActive.mockResolvedValue([{ ...openTodo, active: true }])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Make current: buy milk' }))
    expect(mockSetActive).toHaveBeenCalledWith('1')
    // Optimistic: the header updates immediately.
    expect(screen.getByText('Now working on')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'buy milk' })).toBeInTheDocument()
  })

  it('shows saved notes below the task', () => {
    todoStore.load([{ ...openTodo, notes: 'two percent please' }])
    render(<CheckListTab />)
    expect(screen.getByText('two percent please')).toBeInTheDocument()
  })

  it('edits text and notes inline through the store', () => {
    todoStore.load([openTodo])
    mockUpdate.mockResolvedValue([{ ...openTodo, text: 'buy oat milk', notes: 'two percent' }])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }))

    const textField = screen.getByRole('textbox', { name: 'Task text' })
    fireEvent.change(textField, { target: { value: 'buy oat milk' } })
    const notesField = screen.getByRole('textbox', { name: 'Notes' })
    fireEvent.change(notesField, { target: { value: 'two percent' } })

    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(mockUpdate).toHaveBeenCalledWith('1', 'buy oat milk', 'two percent')
    // Back out of edit mode.
    expect(screen.queryByRole('textbox', { name: 'Task text' })).not.toBeInTheDocument()
  })

  it('cancels editing without saving', () => {
    todoStore.load([openTodo])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Task text' }), {
      target: { value: 'buy oat milk' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(screen.getByText('buy milk')).toBeInTheDocument()
  })

  it('deletes a todo from inside the edit form', () => {
    todoStore.load([openTodo])
    mockRemove.mockResolvedValue([])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete task' }))
    expect(mockRemove).toHaveBeenCalledWith('1')
  })
})
