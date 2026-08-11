import * as THREE from 'three'

// Friendly warm studio lighting for the pomodoro timer.
//
// The page sits on a soft cream → peach gradient, so the tomato is lit with
// warm, diffused light instead of harsh white studio lights:
//   • HemisphereLight — a gentle warm sky → terracotta ground gradient that
//     wraps cozy color around the whole dome (no flat white ambient).
//   • Key — a warm "afternoon sun" from the upper right/front.
//   • Bounce — a low warm fill from below/front that opens the shadow side so
//     the lobe grooves stay soft and readable instead of going black.
//   • Rim — a peachy kicker from behind/left that gently separates the tomato
//     from the background.
// Intensities stay modest; the renderer's ACES tone mapping rounds them off.
export function setupLighting(scene) {
  // Soft sky → ground gradient (cozy warm fill, no flat ambient).
  const hemi = new THREE.HemisphereLight(0xfff3dd, 0xd98a6b, 0.7)
  scene.add(hemi)

  // Warm key — like afternoon sun from the upper right/front.
  const key = new THREE.DirectionalLight(0xffe9c9, 1.0)
  key.position.set(3, 5, 4)
  scene.add(key)

  // Warm bounce from below/front — lifts the under-shadows, keeps grooves soft.
  const bounce = new THREE.DirectionalLight(0xffb48f, 0.45)
  bounce.position.set(0, -1.8, 2.6)
  scene.add(bounce)

  // Peachy rim from behind/left — gentle separation from the background.
  const rim = new THREE.DirectionalLight(0xffd9c2, 0.45)
  rim.position.set(-4, 2.4, -3.2)
  scene.add(rim)

  // Base intensities, so the render loop can "breathe" them subtly.
  const lights = { hemi, key, bounce, rim }
  lights.keyBase = key.intensity
  lights.rimBase = rim.intensity
  return lights
}
