import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { UpdateModal } from './UpdateModal.jsx'
import { updateStore } from '../state/updateStore.js'
import { openExternal } from '../../../lib/externalLink.js'

vi.mock('../../../lib/externalLink.js', () => ({
  openExternal: vi.fn(),
}))

const mockOpenExternal = vi.mocked(openExternal)

const release = { tag: 'v1.2.3', name: 'v1.2.3', url: 'https://x/releases/tag/v1.2.3', notes: '' }

beforeEach(() => {
  updateStore.reset()
  window.localStorage.clear()
  mockOpenExternal.mockClear()
})

afterEach(() => {
  window.localStorage.clear()
})

describe('UpdateModal', () => {
  it('renders nothing when hidden', () => {
    const { container } = render(<UpdateModal />)
    expect(container.querySelector('.update-modal')).toBeNull()
  })

  it('shows the version and actions for a release', () => {
    updateStore.setRelease(release)
    render(<UpdateModal />)
    expect(screen.getByText('1.2.3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get 1.2.3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Install guide' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument()
  })

  it('opens the release and dismisses on "Get"', () => {
    updateStore.setRelease(release)
    render(<UpdateModal />)
    fireEvent.click(screen.getByRole('button', { name: 'Get 1.2.3' }))
    expect(mockOpenExternal).toHaveBeenCalledWith('https://x/releases/tag/v1.2.3')
    expect(updateStore.getState().visible).toBe(false)
    expect(window.localStorage.getItem('aka-nasu:dismissed-update')).toBe('v1.2.3')
  })

  it('opens the install guide and closes without persisting', () => {
    updateStore.setRelease(release)
    render(<UpdateModal />)
    fireEvent.click(screen.getByRole('button', { name: 'Install guide' }))
    expect(mockOpenExternal).toHaveBeenCalledWith('https://github.com/d3uceY/aka-nasu#download')
    expect(updateStore.getState().visible).toBe(false)
    expect(window.localStorage.getItem('aka-nasu:dismissed-update')).toBeNull()
  })

  it('dismisses via "Not now"', () => {
    updateStore.setRelease(release)
    render(<UpdateModal />)
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }))
    expect(updateStore.getState().visible).toBe(false)
    expect(window.localStorage.getItem('aka-nasu:dismissed-update')).toBe('v1.2.3')
  })
})
