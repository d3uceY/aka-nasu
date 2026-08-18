import { beforeEach, afterEach, describe, it, expect } from 'vitest'
import { updateStore } from './updateStore.js'

const dismissedKey = (tag: string) => `aka-nasu:dismissed-update:${tag}`

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
    window.localStorage.setItem(dismissedKey('v1.2.3'), '1')
    updateStore.setRelease(release)
    expect(updateStore.getState().visible).toBe(false)
  })

  it('dismiss remembers the tag and hides the modal', () => {
    updateStore.setRelease(release)
    updateStore.dismiss()
    expect(updateStore.getState().visible).toBe(false)
    expect(window.localStorage.getItem(dismissedKey('v1.2.3'))).toBe('1')
    // A later launch with the same release stays hidden.
    updateStore.reset()
    updateStore.setRelease(release)
    expect(updateStore.getState().visible).toBe(false)
  })

  it('a newer release shows again even after dismissing an older one', () => {
    updateStore.setRelease(release)
    updateStore.dismiss()
    updateStore.reset()
    updateStore.setRelease({ ...release, tag: 'v1.3.0' })
    expect(updateStore.getState().visible).toBe(true)
  })

  it('prunes older dismissed tags when a newer release is dismissed', () => {
    updateStore.setRelease(release)
    updateStore.dismiss()
    updateStore.reset()
    const newer = { ...release, tag: 'v1.3.0' }
    updateStore.setRelease(newer)
    updateStore.dismiss()
    expect(window.localStorage.getItem(dismissedKey('v1.2.3'))).toBeNull()
    expect(window.localStorage.getItem(dismissedKey('v1.3.0'))).toBe('1')
  })

  it('close hides without persisting the dismissal', () => {
    updateStore.setRelease(release)
    updateStore.close()
    expect(updateStore.getState().visible).toBe(false)
    expect(window.localStorage.getItem(dismissedKey('v1.2.3'))).toBeNull()
    updateStore.reset()
    updateStore.setRelease(release)
    expect(updateStore.getState().visible).toBe(true)
  })
})
