import '@testing-library/jest-dom/vitest'

// jsdom has no ResizeObserver; the 3D scene and any layout observer rely on
// it, so stub it out so component tests can mount freely.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

// jsdom has no real matchMedia; the magnetic Button and the GSAP entrances
// feature-detect it. A non-matching MediaQueryList keeps animation branches
// (and the Button's pointer-tracking) out of the way in tests.
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
