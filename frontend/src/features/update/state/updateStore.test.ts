import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { updateStore } from './updateStore.js'

const DISMISS_KEY = 'aka-nasu:dismissed-update'

const release = { tag: 'v1.2.3', name: 'v1.2.3', url: 'https://x', notes: '' }

beforeEach(() => {
  updateStore.reset()
  window.localStorage.clear()
})

afterEach(() => {
  window.localStorage.clear()
})

describe('updateStore', () => {
  it('starts closed with no release', () => {
    expect(updateStore.getState()).toEqual({ release: null, visible: false })
  })

  it('shows the modal for a fresh release', () => {
    updateStore.setRelease(release)
    expect(updateStore.getState()).toEqual({ release, visible: true })
  })

  it('skips a release the user already dismissed', () => {
    window.localStorage.setItem(DISMISS_KEY, 'v1.2.3')
    updateStore.setRelease(release)
    expect(updateStore.getState().visible).toBe(false)
  })

  it('dismiss remembers the tag and hides the modal', () => {
    updateStore.setRelease(release)
    updateStore.dismiss()
    expect(updateStore.getState().visible).toBe(false)
    expect(window.localStorage.getItem(DISMISS_KEY)).toBe('v1.2.3')
    // A later launch with the same release stays hidden.
    updateStore.reset()
    updateStore.setRelease(release)
    expect(updateStore.getState().visible).toBe(false)
  })

  it('close hides without persisting the dismissal', () => {
    updateStore.setRelease(release)
    updateStore.close()
    expect(updateStore.getState().visible).toBe(false)
    expect(window.localStorage.getItem(DISMISS_KEY)).toBeNull()
    updateStore.reset()
    updateStore.setRelease(release)
    expect(updateStore.getState().visible).toBe(true)
  })
})
