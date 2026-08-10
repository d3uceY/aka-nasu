import * as THREE from 'three'

// Bright, soft studio lighting: a warm key from upper-left/front, a gentle
// fill, a subtle pink rim for a playful edge, plus ambient + hemisphere fill.
// Kept simple and product-render-like (no dramatic cinema lighting).
export function setupLighting(scene) {
  const ambient = new THREE.AmbientLight(0xfff3e0, 0.5)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xffffff, 0xffe0cc, 0.45)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xfff8f0, 1.5)
  key.position.set(3.5, 5, 4)
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xffe8d6, 0.55)
  fill.position.set(-4, 2, -2)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xffd3e6, 0.9)
  rim.position.set(0, 1.5, -5)
  scene.add(rim)

  return { ambient, hemi, key, fill, rim }
}
