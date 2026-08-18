import { useEffect, useRef } from 'react'
import { TomatoTimerScene } from '../three/TomatoTimerScene.js'
import type { TomatoPalette } from '../constants/palettes.js'
import type { DialCallbacks } from '../types.js'

export interface TimerCanvasProps {
  config: DialCallbacks
  palette?: TomatoPalette
  onSceneReady?: (scene: TomatoTimerScene | null) => void
}

// Hosts the Three.js tomato. config = stable dial callbacks; onSceneReady
// hands the scene up so the parent can call pulse(). A palette change re-tints
// the live scene in place.
export function TimerCanvas({ config, palette, onSceneReady }: TimerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<TomatoTimerScene | null>(null)
  const configRef = useRef(config)
  configRef.current = config

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new TomatoTimerScene(container, {
      getDialMinute: () => configRef.current.getDialMinute(),
      onDialChange: (m) => configRef.current.handleDialChange?.(m),
      getInteractionEnabled: () => configRef.current.getInteractionEnabled(),
      palette,
    })
    sceneRef.current = scene
    onSceneReady?.(scene)

    return () => {
      scene.dispose()
      sceneRef.current = null
      onSceneReady?.(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (palette) sceneRef.current?.setPalette(palette)
  }, [palette])

  return (
    <div
      className="timer-canvas"
      ref={containerRef}
      role="img"
      aria-label="3D tomato pomodoro timer"
    />
  )
}
