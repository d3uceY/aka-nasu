import { beforeEach, describe, it, expect } from 'vitest'
import { uiStore } from './uiStore.js'

beforeEach(() => {
  uiStore.setMode('full')
  // introDone can't be unset; recreate fresh module state via explicit reset
  // below is not available, so drive assertions from setMode/markIntroDone.
})

describe('uiStore', () => {
  it('starts in full mode', () => {
    expect(uiStore.getState().mode).toBe('full')
    expect(uiStore.getState().introDone).toBe(false)
  })

  it('switches to mini mode', () => {
    uiStore.setMode('mini')
    expect(uiStore.getState().mode).toBe('mini')
  })

  it('marks the intro as done', () => {
    uiStore.markIntroDone()
    expect(uiStore.getState().introDone).toBe(true)
  })
})
