import { useEffect, useRef } from 'react'
import { TomatoTimerScene } from '../three/TomatoTimerScene.js'
import type { DialCallbacks } from '../types.js'

export interface TimerCanvasProps {
  config: DialCallbacks
  onSceneReady?: (scene: TomatoTimerScene | null) => void
}

// Hosts the Three.js tomato. config = stable dial callbacks; onSceneReady
// hands the scene up so the parent can call pulse().
export function TimerCanvas({ config, onSceneReady }: TimerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new TomatoTimerScene(container, {
      getDialMinute: () => configRef.current.getDialMinute(),
      onDialChange: (m) => configRef.current.handleDialChange?.(m),
      getInteractionEnabled: () => configRef.current.getInteractionEnabled(),
    })
    onSceneReady?.(scene)

    return () => {
      scene.dispose()
      onSceneReady?.(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="timer-canvas"
      ref={containerRef}
      role="img"
      aria-label="3D tomato pomodoro timer"
    />
  )
}
