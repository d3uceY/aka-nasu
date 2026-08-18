// Sound file paths + volumes; playback goes through utils/audio.ts.

export const SOUNDS = {
  complete: { file: '/sounds/complete.mp3', volume: 1 },
  dialRatchetTick: { file: '/sounds/dial-ratchet-tick.mp3', volume: 1 },
  clickIntoPlace: { file: '/sounds/click-into-place.wav', volume: 0.3 },
  resetSpring: { file: '/sounds/reset-spring.mp3', volume: 1 },
  gearClick: { file: '/sounds/gear-click.mp3', volume: 1 },
  pop: { file: '/sounds/pop.mp3', volume: 1 },
  ding: { file: '/sounds/ding.mp3', volume: 1 },
  swish: { file: '/sounds/swish.mp3', volume: 1 },
} as const

export type SoundName = keyof typeof SOUNDS
