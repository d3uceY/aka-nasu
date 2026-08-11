// Tomato pomodoro timer — mechanical kitchen-timer style.
//
// The body is a full squashed sphere with 5 lobes via vertex displacement.
// The cap is a partial sphere (pole → equator) that carries a canvas texture
// with 60 ticks, 12 numerals, and a seam line.  Both body AND cap use the
// SAME lobe function — the cap is always 3.5 % larger so it can never clip
// into the body regardless of lobe strength.  The cap, stem, and leaves
// rotate together as topGroup; the body and pointer stay fixed as staticGroup.
//
// Split at the true equator (CAP_FRACTION = 0) — top HALF is the cap.

export const COLORS = {
  tomato: 0xe8442e,       // ripe signature red (matches --tomato)
  tomatoGroove: 0x9c2c1c, // darker groove between lobes
  seam: 0x4a0f0c,         // very dark equator groove (torus ring)
  stem: 0x2f9e54,
  leaf: 0x25904a,
  pointer: 0xffffff,
}

export const BODY = {
  radius: 1.15,
  scaleY: 0.82,           // flattening — wider than tall
  lobes: 5,
  lobeDepth: 0.17,         // real volume — lobes should pop
  segments: 64,
}

// Cap always sits outside the body.  1.035 = 3.5 % radial clearance.
export const CAP_CLEARANCE = 1.035

// 0 = split at equator — top HALF is the textured cap.
export const CAP_FRACTION = 0

// Lobe bell-curve ends well BEFORE the band starts (band is at 72 % of cap
// theta).  LOBE_END_FRACTION = BAND.bandTop - 0.14 gives a real margin where
// the band sits on a perfectly circular cross-section.
export const LOBE_END_FRACTION = 0.58 // derived: 0.72 - 0.14

// ---- Derived helpers -------------------------------------------------------
export const getTopY = () => BODY.radius * BODY.scaleY
export const getSeamY = () => CAP_FRACTION * getTopY()                       // = 0 (equator)
export const getCapThetaSplit = () => {
  const y0 = getSeamY() / BODY.scaleY
  return Math.acos(Math.max(-1, Math.min(1, y0 / BODY.radius)))              // = π/2
}
export const getLobeEnd = () => getCapThetaSplit() * LOBE_END_FRACTION
export const getCapRadius = () => BODY.radius * CAP_CLEARANCE               // 1.15 × 1.035
export const getCapTopY = () => getCapRadius() * BODY.scaleY                 // top of the cap dome
export const getCrossR = () => {
  const y0 = getSeamY() / BODY.scaleY
  return Math.sqrt(Math.max(0, BODY.radius * BODY.radius - y0 * y0))        // = 1.15
}

export const SEAM = {
  tube: 0.018,
}

export const STEM = {
  radiusTop: 0.055,
  radiusBottom: 0.075,
  height: 0.34,
}

export const POINTER = {
  width: 0.09,
  height: 0.08,
}

export const CAMERA = {
  fov: 38,
  position: [0, 1.1, 5.0],
  lookAt: [0, 0.15, 0],
}

export const GROUND = {
  y: -getTopY() - 0.08,
}

// ---- Band texture constants (baked into the cap map) ------------------------
export const BAND = {
  texW: 2048,
  texH: 512,
  bandTop: 0.72,       // texture v where the dark band starts (0=top, 1=bottom)
  seamPx: 7,           // height of the baked seam line
  minorH: 0.55,        // minor tick height as fraction of band height
  majorH: 0.92,        // major tick height as fraction of band height
  wrapMargin: 50,       // px — duplicate near-edge elements for seamless wrap
  labels: ['0', '55', '50', '45', '40', '35', '30', '25', '20', '15', '10', '5'],
  // "0" sits at tick index 15 → u=0.25 → world +Z (front), then clockwise
  zeroTickIndex: 15,
}

