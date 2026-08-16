// Central sound config: every sound file path and its playback volume lives
// here. All playback goes through src/utils/audio.js (playSound), which also
// honours the "Play sounds" setting in the timer settings.

export const SOUND_FILES = {
  complete: '/sounds/complete.mp3',
  dialRatchetTick: '/sounds/dial-ratchet-tick.mp3',
  clickIntoPlace: '/sounds/click-into-place.mp3',
  resetSpring: '/sounds/reset-spring.mp3',
  gearClick: '/sounds/gear-click.mp3',
  pop: '/sounds/pop.mp3',
  ding: '/sounds/ding.mp3',
  swish: '/sounds/swish.mp3',
}

export const SOUND_VOLUMES = {
  complete: 1,
  dialRatchetTick: 1,
  clickIntoPlace: 1,
  resetSpring: 1,
  gearClick: 1,
  pop: 1,
  ding: 1,
  swish: 1,
}

// Combined lookup: name -> { file, volume } used by playSound().
export const SOUNDS = Object.fromEntries(
  Object.entries(SOUND_FILES).map(([name, file]) => [
    name,
    { file, volume: SOUND_VOLUMES[name] },
  ]),
)
