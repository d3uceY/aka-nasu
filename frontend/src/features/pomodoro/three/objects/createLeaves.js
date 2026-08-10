import * as THREE from 'three'
import { BODY, getSeamY, getCapRadius, getCapThetaSplit } from '../../constants/three.js'

// 5 realistic calyx leaves (sepals) fanning out from the stem base, resting
// on the top of the cap dome.  Each leaf is a quadratic-curve Shape extruded
// for thickness — more organic than the old ConeGeometry slivers.
function leafShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.quadraticCurveTo(0.16, 0.18, 0, 0.55)
  s.quadraticCurveTo(-0.16, 0.18, 0, 0)
  return s
}

export function createLeaves(materials) {
  const group = new THREE.Group()
  group.name = 'leaves'

  const count = 5
  const leafGeo = new THREE.ExtrudeGeometry(leafShape(), {
    depth: 0.035,
    bevelEnabled: false,
    curveSegments: 8,
  })

  const capR = getCapRadius()
  const seamYVal = getSeamY()
  const thetaSplit = getCapThetaSplit()
  const capTopY = seamYVal + capR * BODY.scaleY * (1 - Math.cos(thetaSplit))

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const pivot = new THREE.Group()
    pivot.rotation.y = angle

    const leaf = new THREE.Mesh(leafGeo, materials.leaf)
    // Lay the leaf flat on the dome: rotate so the shape's +Y points outward
    // along the dome surface, tilted slightly down.
    leaf.rotation.z = -Math.PI / 2.35
    leaf.position.set(0, capTopY - 0.02, 0)

    pivot.add(leaf)
    group.add(pivot)
  }

  return group
}
