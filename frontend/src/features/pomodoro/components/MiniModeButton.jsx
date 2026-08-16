import { playSound } from '../../../utils/audio.js'
import { enterMiniMode } from '../../../lib/window.js'
import { uiStore } from '../../../state/uiStore.js'

// A square receding into the bottom-right corner: "shrink me to a mini".
function MiniIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="12" height="12" rx="3" />
      <path d="M20 12.5V17a3 3 0 0 1-3 3h-4.5" />
    </svg>
  )
}

// Fades the whole shell out so the window shrink + layout swap never show a
// squished frame, then hands off to the compact layout.
function switchToMini() {
  playSound('gearClick')
  const shell = document.querySelector('.app-shell')
  shell?.classList.add('app-shell--switching')
  enterMiniMode().finally(() => {
    uiStore.setMode('mini')
    requestAnimationFrame(() => shell?.classList.remove('app-shell--switching'))
  })
}

export function MiniModeButton() {
  return (
    <button
      type="button"
      className="mini-mode-btn"
      aria-label="Enter mini timer"
      title="Mini timer"
      onClick={switchToMini}
    >
      <MiniIcon />
    </button>
  )
}
