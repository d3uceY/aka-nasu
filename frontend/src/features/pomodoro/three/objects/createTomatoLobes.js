import * as THREE from 'three'
import { BODY, COLORS } from '../../constants/three.js'

// Squashed sphere body with 5 smooth lobes and subtle darker grooves between
// them.  Vertex colours make the grooves read as shadowy creases — the lobe
// crests are the bright tomato red while the valleys fade toward a deeper
// maroon, giving the body depth without extra geometry.
export function createTomatoLobes(materials) {
  const { radius, scaleY, lobes, lobeDepth, segments } = BODY
  const geo = new THREE.SphereGeometry(radius, segments, Math.round(segments * 0.75))
  const mesh = new THREE.Mesh(geo, materials.bodyVertex)
  mesh.scale.set(1, scaleY, 1)
  mesh.castShadow = true
  mesh.name = 'tomatoBody'

  const pos = geo.attributes.position
  const vcolors = new Float32Array(pos.count * 3)
  const baseColor = new THREE.Color(COLORS.tomato)
  const grooveColor = new THREE.Color(COLORS.tomatoGroove)

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const r = Math.sqrt(x * x + z * z)
    if (r < 1e-4) {
      // Pole — just use base color, can't determine theta.
      vcolors[i * 3] = baseColor.r
      vcolors[i * 3 + 1] = baseColor.g
      vcolors[i * 3 + 2] = baseColor.b
      continue
    }

    const theta = Math.atan2(z, x)
    const phi = Math.acos(THREE.MathUtils.clamp(y / Math.sqrt(x * x + y * y + z * z), -1, 1))
    // Lobe wave: cos(5θ) pushes out at crests, dips in valleys.
    const wave = Math.cos(lobes * theta)
    // Fade lobe effect toward the poles so only the equator band gets lobed.
    const equatorFade = Math.sin(phi)
    const lobe = lobeDepth * wave * equatorFade

    // Displace the vertex radially.
    const origR = Math.sqrt(x * x + y * y + z * z)
    const newR = origR + lobe
    const scaleF = newR / origR
    pos.setXYZ(i, x * scaleF, y * scaleF, z * scaleF)

    // Vertex colour: blend between groove (valley) and base (crest).
    const t = (wave + 1) / 2 // 0=valley, 1=crest
    const c = grooveColor.clone().lerp(baseColor, THREE.MathUtils.clamp(0.35 + t * 0.75, 0, 1))
    vcolors[i * 3] = c.r
    vcolors[i * 3 + 1] = c.g
    vcolors[i * 3 + 2] = c.b
  }

  geo.setAttribute('color', new THREE.BufferAttribute(vcolors, 3))
  geo.computeVertexNormals()

  return mesh
}
