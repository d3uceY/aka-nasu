import * as THREE from 'three'
import { BODY, COLORS, getCapThetaSplit } from '../../constants/three.js'
import { lobeAmount, applyLobes } from './lobeMath.js'

// Lower portion of a squashed sphere — from the equator down to the south
// pole.  The cap covers the top half and is always 3.5 % larger, so no body
// vertices can ever poke through.  Lobes are strongest in the upper-middle,
// fade to zero well above the band, and are zero at the equator and below.
// Vertex colours make the groove valleys read as darker creases.
export function createTomatoLobes(materials) {
  const { radius, scaleY, lobeDepth, segments } = BODY
  const thetaSplit = getCapThetaSplit() // π/2 — equator

  // Partial sphere: theta from equator down to south pole.
  const geo = new THREE.SphereGeometry(
    radius,
    segments,
    Math.round(segments * 0.5),
    undefined, undefined,
    thetaSplit,                  // start at equator
    Math.PI - thetaSplit,        // down to south pole
  )
  applyLobes(geo)
  geo.computeVertexNormals()

  const mesh = new THREE.Mesh(geo, materials.bodyVertex)
  mesh.scale.set(1, scaleY, 1)
  mesh.castShadow = true
  mesh.name = 'tomatoBody'

  // Vertex colours — derive from the same lobeAmount used for displacement.
  const pos = geo.attributes.position
  const vcolors = new Float32Array(pos.count * 3)
  const baseColor = new THREE.Color(COLORS.tomato)
  const grooveColor = new THREE.Color(COLORS.tomatoGroove)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const r = Math.sqrt(x * x + y * y + z * z)
    if (r < 1e-4) {
      vcolors[i * 3] = baseColor.r
      vcolors[i * 3 + 1] = baseColor.g
      vcolors[i * 3 + 2] = baseColor.b
      continue
    }
    const theta = Math.atan2(z, x)
    const phi = Math.acos(THREE.MathUtils.clamp(y / r, -1, 1))
    const lobe = lobeAmount(theta, phi)
    const t = (lobe / lobeDepth + 1) / 2
    const c = grooveColor.clone().lerp(baseColor, THREE.MathUtils.clamp(0.35 + t * 0.75, 0, 1))
    vcolors[i * 3] = c.r
    vcolors[i * 3 + 1] = c.g
    vcolors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(vcolors, 3))

  return mesh
}
