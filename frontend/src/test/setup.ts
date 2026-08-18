import '@testing-library/jest-dom/vitest'

// Stub ResizeObserver; jsdom lacks it and the 3D scene relies on it.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

// Stub matchMedia; a non-matching MediaQueryList keeps animations out of tests.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// Silence jsdom's "Not implemented: HTMLMediaElement's play()" noise for
// component tests that trigger sounds. utils/audio.test.ts stubs its own
// Audio on top of this.
if (typeof window.Audio === 'function') {
  window.Audio = class {
    volume = 1
    play(): Promise<void> {
      return Promise.resolve()
    }
  } as unknown as typeof Audio
}
