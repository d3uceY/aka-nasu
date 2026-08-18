import * as THREE from 'three'

// Side-lit: a warm key rakes the right-front lobes, a low hemi + bounce keep
// the shadow side from going pitch black, and a peachy rim edges the dark side.

export interface SceneLights {
  hemi: THREE.HemisphereLight
  key: THREE.DirectionalLight
  bounce: THREE.DirectionalLight
  rim: THREE.DirectionalLight
  // Base intensities, so the render loop can "breathe" them subtly.
  keyBase: number
  rimBase: number
}

export function setupLighting(scene: THREE.Scene): SceneLights {
  // Faint sky → ground gradient (low, so the shadow side reads dark).
  const hemi = new THREE.HemisphereLight(0xfff3dd, 0xd98a6b, 0.22)
  scene.add(hemi)

  // Strong warm key from 45° off the right at mid-height.
  const key = new THREE.DirectionalLight(0xffe9c9, 2.6)
  key.position.set(3.2, 1.0, 3.2)
  scene.add(key)

  // Faint bounce from below/front opens the front grooves a touch.
  const bounce = new THREE.DirectionalLight(0xffb48f, 0.28)
  bounce.position.set(0, -1.8, 2.6)
  scene.add(bounce)

  // Peachy rim from behind/left gives the shadow side a soft edge.
  const rim = new THREE.DirectionalLight(0xffd9c2, 0.5)
  rim.position.set(-4, 2.4, -3.2)
  scene.add(rim)

  return { hemi, key, bounce, rim, keyBase: key.intensity, rimBase: rim.intensity }
}
