import * as THREE from 'three'
import { BODY, getCapThetaSplit } from '../../constants/three.js'
import type { TomatoPalette } from '../../constants/palettes.js'
import { lobeAmount, applyLobes } from './lobeMath.js'
import type { TomatoMaterials } from '../materials/tomatoMaterials.js'

// Lower half of a squashed sphere (equator → south pole). Lobes fade to zero
// above the band; vertex colours make the grooves read as dark creases.
export function createTomatoLobes(
  materials: TomatoMaterials,
  palette: TomatoPalette,
): THREE.Mesh {
  const { radius, scaleY, segments } = BODY
  const thetaSplit = getCapThetaSplit() // π/2 (equator)

  // Partial sphere: theta from equator down to south pole.
  const geo = new THREE.SphereGeometry(
    radius,
    segments,
    Math.round(segments * 0.5),
    undefined,
    undefined,
    thetaSplit,                  // start at equator
    Math.PI - thetaSplit,        // down to south pole
  )
  applyLobes(geo)
  geo.computeVertexNormals()

  const mesh = new THREE.Mesh(geo, materials.bodyVertex)
  mesh.scale.set(1, scaleY, 1)
  mesh.castShadow = true
  mesh.name = 'tomatoBody'

  paintTomatoBody(mesh, palette)

  return mesh
}

// (Re)paint the body's vertex colours for a palette. Reused on palette switch
// so the geometry (and any cap rotation) is never disturbed.
export function paintTomatoBody(mesh: THREE.Mesh, palette: TomatoPalette): void {
  const geo = mesh.geometry
  const pos = geo.attributes.position
  const vcolors = new Float32Array(pos.count * 3)
  const baseColor = new THREE.Color(palette.body)
  const grooveColor = new THREE.Color(palette.groove)
  const { lobeDepth } = BODY

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
}
