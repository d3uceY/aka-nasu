import * as THREE from 'three'

// Matches the reference pomodoro-timer.html lighting exactly.
// Simple, punchy: ambient fill + a warm key from upper-right/front +
// a subtle warm fill from behind/left.  No environment map, no rim lights.
export function setupLighting(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.55)
  scene.add(ambient)

  const key = new THREE.DirectionalLight(0xffffff, 1.0)
  key.position.set(3, 5, 4)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xffd9c2, 0.4)
  fill.position.set(-4, 2, -3)
  scene.add(fill)

  return { ambient, key, fill }
}
