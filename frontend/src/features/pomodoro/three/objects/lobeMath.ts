import * as THREE from 'three'
import { BODY, getLobeEnd } from '../../constants/three.js'

// ---------------------------------------------------------------------------
// Shared lobe math, used identically by both the body and the cap so the
// cap is always a strict superset of the body's radius (no clipping).
//
// The lobe amplitude follows a bell curve across phi ∈ [0, LOBE_END]:
//   0 at the crown (phi=0) → peaks at LOBE_END/2 → 0 at LOBE_END
// Beyond LOBE_END (which is well above the band), amplitude is hard-clamped
// to 0. The band and everything below it are perfectly circular.
// ---------------------------------------------------------------------------

const LOBE_END = getLobeEnd()

/**
 * Returns the radial displacement (in world units) for a given azimuth theta
 * and polar angle phi.  Positive = lobe crest, negative = valley.
 */
export function lobeAmount(theta: number, phi: number): number {
  if (phi >= LOBE_END) return 0
  const t = phi / LOBE_END                           // 0 at crown .. 1 at LOBE_END
  const amplitude = BODY.lobeDepth * Math.sin(t * Math.PI) // bell: 0 → peak → 0
  return Math.cos(BODY.lobes * theta) * amplitude
}

/**
 * Displaces every vertex in `geo` radially by `lobeAmount(theta, phi)`.
 * Call computeVertexNormals() after this.
 */
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
