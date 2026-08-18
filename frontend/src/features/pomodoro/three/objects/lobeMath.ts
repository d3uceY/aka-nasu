import * as THREE from 'three'
import { BODY, getLobeEnd } from '../../constants/three.js'

// Lobe displacement shared by body and cap (so the cap always clears the
// body). A bell curve across phi ∈ [0, LOBE_END]; clamped to 0 beyond it,
// so the band stays perfectly circular.

const LOBE_END = getLobeEnd()

/** Radial displacement for azimuth theta and polar phi (+ crest, − valley). */
export function lobeAmount(theta: number, phi: number): number {
  if (phi >= LOBE_END) return 0
  const t = phi / LOBE_END                           // 0 at crown .. 1 at LOBE_END
  const amplitude = BODY.lobeDepth * Math.sin(t * Math.PI) // bell: 0 → peak → 0
  return Math.cos(BODY.lobes * theta) * amplitude
}

/** Displace every vertex in geo radially; call computeVertexNormals() after. */
export function applyLobes(geo: THREE.BufferGeometry): void {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const r = Math.sqrt(x * x + y * y + z * z)
    const theta = Math.atan2(z, x)
    const phi = Math.acos(THREE.MathUtils.clamp(y / r, -1, 1))
    const lobe = lobeAmount(theta, phi)
    const scaleF = (r + lobe) / r
    pos.setXYZ(i, x * scaleF, y * scaleF, z * scaleF)
  }
}
