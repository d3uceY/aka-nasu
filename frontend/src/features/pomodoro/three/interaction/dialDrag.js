// Pointer drag on the dial. Horizontal movement rotates the lower dial around
// Y; the dial follows the pointer with damping applied by the scene's own
// animation loop. Only the dial moves; the tomato stays put.
export function attachDialDrag({ domElement, enabled, onDragStart, onRotate, onDragEnd }) {
  let dragging = false
  let pointerId = null
  let lastX = 0

  function onPointerDown(e) {
    if (!enabled()) return
    dragging = true
    pointerId = e.pointerId
    lastX = e.clientX
    domElement.setPointerCapture?.(e.pointerId)
    onDragStart?.()
  }

  function onPointerMove(e) {
    if (!dragging || e.pointerId !== pointerId) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    // Sensitivity tuned so ~one drag width spans the whole dial.
    onRotate?.(dx * 0.55)
  }

  function onPointerUp(e) {
    if (e.pointerId !== pointerId) return
    dragging = false
    domElement.releasePointerCapture?.(e.pointerId)
    onDragEnd?.()
  }

  domElement.addEventListener('pointerdown', onPointerDown)
  domElement.addEventListener('pointermove', onPointerMove)
  domElement.addEventListener('pointerup', onPointerUp)
  domElement.addEventListener('pointercancel', onPointerUp)

  return () => {
    domElement.removeEventListener('pointerdown', onPointerDown)
    domElement.removeEventListener('pointermove', onPointerMove)
    domElement.removeEventListener('pointerup', onPointerUp)
    domElement.removeEventListener('pointercancel', onPointerUp)
  }
}
