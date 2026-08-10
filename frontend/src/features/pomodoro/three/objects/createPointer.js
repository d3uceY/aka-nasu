import * as THREE from 'three'
import { POINTER, getSeamY, getCrossR } from '../../constants/three.js'

// Small, crisp white triangle at the front (12-o'clock / +Z position), sitting
// right at the seam line between body and cap.  Fixed to BodyGroup — never
// rotates with the cap/dial.  Points down toward the "0" marking on the band.
export function createPointer(materials) {
  const { width, height } = POINTER
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, height / 2)
  shape.lineTo(width / 2, height / 2)
  shape.lineTo(0, -height / 2)
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: false })
  const mesh = new THREE.Mesh(geo, materials.pointer)
  const seamY = getSeamY()
  const crossR = getCrossR()
  mesh.position.set(0, seamY + 0.05, crossR * 1.06)
  mesh.rotation.x = -0.1
  mesh.name = 'pointer'
  return mesh
}
