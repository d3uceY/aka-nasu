import gsap from 'gsap'

// Nearest whole minute.
export function snapToMinute(value: number): number {
  return Math.round(value)
}

// Springy GSAP tween used for the mechanical "click into place" on release.
export function tweenSnap(
  target: object,
  prop: string,
  toValue: number,
  { duration = 0.45, ease = 'back.out(1.5)' }: { duration?: number; ease?: string } = {},
): gsap.core.Tween {
  return gsap.to(target, { [prop]: toValue, duration, ease, overwrite: 'auto' })
}

// Optional keyboard controls (dial must be focused).
export function attachDialKeyboard({
  domElement,
  enabled,
  onRotate,
}: {
  domElement: HTMLElement
  enabled: () => boolean
  onRotate?: (degrees: number) => void
}): () => void {
  function onKey(e: KeyboardEvent): void {
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
