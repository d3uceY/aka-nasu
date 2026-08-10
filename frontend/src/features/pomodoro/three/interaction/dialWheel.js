// Mouse wheel rotates the dial one minute (6 degrees) per notch.
export function attachDialWheel({ domElement, enabled, onRotate }) {
  function onWheel(e) {
    if (!enabled()) return
    e.preventDefault()
    onRotate?.(e.deltaY > 0 ? -6 : 6)
  }

  domElement.addEventListener('wheel', onWheel, { passive: false })
  return () => domElement.removeEventListener('wheel', onWheel)
}
