import * as THREE from 'three'
import { STEM, getCapTopY } from '../../constants/three.js'
import type { TomatoMaterials } from '../materials/tomatoMaterials.js'

// Short, thick green stalk at the top of the cap dome.
// Mounted on topGroup so it rotates with the cap.
export function createStem(materials: TomatoMaterials): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(STEM.radiusTop, STEM.radiusBottom, STEM.height, 12)
  const mesh = new THREE.Mesh(geo, materials.stem)
  mesh.position.y = getCapTopY() + 0.07
  mesh.castShadow = true
  mesh.name = 'stem'
  return mesh
}
