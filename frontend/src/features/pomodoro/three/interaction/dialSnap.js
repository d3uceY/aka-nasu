import gsap from 'gsap'

// Nearest whole minute.
export function snapToMinute(value) {
  return Math.round(value)
}

// Springy GSAP tween of a numeric property toward a target — used for the
// mechanical "click into place" when the user releases the dial.
export function tweenSnap(target, prop, toValue, { duration = 0.45, ease = 'back.out(1.5)' } = {}) {
  return gsap.to(target, { [prop]: toValue, duration, ease, overwrite: 'auto' })
}

// Optional keyboard controls (dial must be focused).
export function attachDialKeyboard({ domElement, enabled, onRotate }) {
  function onKey(e) {
    if (!enabled()) return
    if (e.key === 'ArrowLeft') {
      onRotate?.(-6)
      e.preventDefault()
    } else if (e.key === 'ArrowRight') {
      onRotate?.(6)
      e.preventDefault()
    }
  }

  domElement.addEventListener('keydown', onKey)
  return () => domElement.removeEventListener('keydown', onKey)
}
