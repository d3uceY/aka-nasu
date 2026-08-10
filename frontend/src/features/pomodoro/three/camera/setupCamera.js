import * as THREE from 'three'
import { CAMERA } from '../../constants/three.js'

// Front-facing, slightly elevated, looking gently downward — the tomato fills
// most of the frame. Aspect is set on resize.
export function setupCamera() {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 100)
  camera.position.set(...CAMERA.position)
  camera.lookAt(...CAMERA.lookAt)
  return camera
}
