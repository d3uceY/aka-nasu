import * as THREE from 'three'
import { getCapTopY } from '../../constants/three.js'
import type { TomatoMaterials } from '../materials/tomatoMaterials.js'

// 5 realistic calyx leaves (sepals) fanning out from the stem base, resting
// on the top of the cap dome.
function leafShape(): THREE.Shape {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.quadraticCurveTo(0.16, 0.18, 0, 0.55)
  s.quadraticCurveTo(-0.16, 0.18, 0, 0)
  return s
}

export function createLeaves(materials: TomatoMaterials): THREE.Group {
  const group = new THREE.Group()
  group.name = 'leaves'

  const count = 5
  const leafGeo = new THREE.ExtrudeGeometry(leafShape(), {
    depth: 0.035,
    bevelEnabled: false,
    curveSegments: 8,
  })

  const capTopY = getCapTopY()

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const pivot = new THREE.Group()
    pivot.rotation.y = angle

    const leaf = new THREE.Mesh(leafGeo, materials.leaf)
    leaf.rotation.z = -Math.PI / 2.35
    leaf.position.set(0, capTopY - 0.02, 0)

    pivot.add(leaf)
    group.add(pivot)
  }

  return group
}
