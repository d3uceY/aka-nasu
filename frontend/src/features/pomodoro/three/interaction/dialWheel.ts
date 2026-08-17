// Mouse wheel rotates the dial one minute (6 degrees) per notch.

export interface DialWheelOptions {
  domElement: HTMLElement
  enabled: () => boolean
  onRotate?: (degrees: number) => void
}

export function attachDialWheel({ domElement, enabled, onRotate }: DialWheelOptions): () => void {
  function onWheel(e: WheelEvent): void {
    if (!enabled()) return
    e.preventDefault()
    onRotate?.(e.deltaY > 0 ? -6 : 6)
  }

  domElement.addEventListener('wheel', onWheel, { passive: false })
  return () => domElement.removeEventListener('wheel', onWheel)
}
