import { render, screen, fireEvent, within } from '@testing-library/react'
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
    // The pinned open task appears in the current-task line AND its row.
    expect(screen.getAllByText('buy milk').length).toBeGreaterThan(0)
    expect(screen.getByText('water plants')).toBeInTheDocument()
  })

  it('adds a trimmed todo on submit', () => {
    mockAdd.mockResolvedValue([openTodo])
    render(<CheckListTab />)
    fireEvent.change(screen.getByRole('textbox', { name: 'What are you going to do today?' }), {
      target: { value: '  buy milk  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    // Empty list -> the first task is told to be active.
    expect(mockAdd).toHaveBeenCalledWith('buy milk', true)
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
    // Load pinned the only task; it is the top of the list, so it keeps the pin.
    expect(mockToggle).toHaveBeenCalledWith('1', '1')
  })

  it('removes a todo through the store', () => {
    todoStore.load([openTodo])
    mockRemove.mockResolvedValue([])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove task' }))
    expect(mockRemove).toHaveBeenCalledWith('1', '')
  })

  it('pins the clicked task in the current-task line', () => {
    // Load pins the newest open task, so pin a different one by hand.
    todoStore.load([
      { id: '2', text: 'water plants', done: false, active: true, createdAt: 2 },
      { ...openTodo, active: false },
    ])
    mockSetActive.mockResolvedValue([{ ...openTodo, active: true }])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Make current: buy milk' }))
    expect(mockSetActive).toHaveBeenCalledWith('1')
    // Optimistic: the line updates immediately.
    const activeLine = within(document.querySelector('.todo-active') as HTMLElement)
    expect(activeLine.getByText('buy milk')).toBeInTheDocument()
  })

  it('shows the active task as plain clamped text, no label or clear button', () => {
    todoStore.load([{ ...openTodo, active: true }])
    render(<CheckListTab />)
    expect(screen.queryByText('Now working on')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear the current task' })).not.toBeInTheDocument()
    const activeLine = within(document.querySelector('.todo-active') as HTMLElement)
    expect(activeLine.getByText('buy milk')).toBeInTheDocument()
  })

  it('tapping the already-current task leaves it current (no unpin)', () => {
    todoStore.load([{ ...openTodo, active: true }])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Make current: buy milk' }))
    expect(mockSetActive).not.toHaveBeenCalled()
    const activeLine = within(document.querySelector('.todo-active') as HTMLElement)
    expect(activeLine.getByText('buy milk')).toBeInTheDocument()
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
    // Back in the row (the pinned task also shows in the current-task line).
    expect(screen.getAllByText('buy milk').length).toBeGreaterThan(0)
  })

  it('deletes a todo from inside the edit form', () => {
    todoStore.load([openTodo])
    mockRemove.mockResolvedValue([])
    render(<CheckListTab />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit task' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete task' }))
    // Load pinned the only task; deleting it leaves nothing to pin.
    expect(mockRemove).toHaveBeenCalledWith('1', '')
  })
})
