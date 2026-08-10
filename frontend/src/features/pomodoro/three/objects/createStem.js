import * as THREE from 'three'
import { BODY, STEM, getSeamY, getCapRadius, getCapThetaSplit } from '../../constants/three.js'

// Short, thick green stalk standing upright from the centre of the calyx,
// mounted on topGroup so it rotates with the cap when the user winds the dial.
export function createStem(materials) {
  const geo = new THREE.CylinderGeometry(STEM.radiusTop, STEM.radiusBottom, STEM.height, 12)
  const mesh = new THREE.Mesh(geo, materials.stem)
  const capR = getCapRadius()
  const seamYVal = getSeamY()
  const thetaSplit = getCapThetaSplit()
  // capMesh centre is at: seamY - capR * cos(thetaSplit) * scaleY
  // cap top is at:       capMesh.y + capR * scaleY
  //                   = seamY + capR * scaleY * (1 - cos(thetaSplit))
  const capTopY = seamYVal + capR * BODY.scaleY * (1 - Math.cos(thetaSplit))
  mesh.position.y = capTopY + 0.07
  mesh.castShadow = true
  mesh.name = 'stem'
  return mesh
}
