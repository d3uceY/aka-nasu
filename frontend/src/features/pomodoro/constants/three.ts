// Tomato pomodoro timer, mechanical kitchen-timer style.
//
// Body + cap share one lobe function; the cap is always 3.5% larger so it
// never clips the body. Cap/stem/leaves rotate as topGroup, body/pointer are static.
// (The tomato's colors now live in constants/palettes.ts; the scene is
// re-tinted from the selected palette.)

export const BODY = {
  radius: 1.15,
  scaleY: 0.82,           // flattened: wider than tall
  lobes: 5,
  lobeDepth: 0.17,         // enough depth that lobes read clearly
  segments: 64,
} as const

// 1.035 = 3.5% radial clearance so the cap always sits outside the body.
export const CAP_CLEARANCE = 1.035

// 0 = split at the equator; the top half is the cap.
export const CAP_FRACTION = 0

// Lobes end well before the band so it sits on a perfectly circular cross-section.
export const LOBE_END_FRACTION = 0.58 // derived: 0.72 - 0.14

// ---- Derived helpers -------------------------------------------------------
export const getTopY = (): number => BODY.radius * BODY.scaleY
export const getSeamY = (): number => CAP_FRACTION * getTopY()                       // = 0 (equator)
export const getCapThetaSplit = (): number => {
  const y0 = getSeamY() / BODY.scaleY
  return Math.acos(Math.max(-1, Math.min(1, y0 / BODY.radius)))              // = π/2
}
export const getLobeEnd = (): number => getCapThetaSplit() * LOBE_END_FRACTION
export const getCapRadius = (): number => BODY.radius * CAP_CLEARANCE               // 1.15 × 1.035
export const getCapTopY = (): number => getCapRadius() * BODY.scaleY                 // top of the cap dome
export const getCrossR = (): number => {
  const y0 = getSeamY() / BODY.scaleY
  return Math.sqrt(Math.max(0, BODY.radius * BODY.radius - y0 * y0))        // = 1.15
}

export const SEAM = {
  tube: 0.018,
} as const

export const STEM = {
  radiusTop: 0.055,
  radiusBottom: 0.075,
  height: 0.34,
} as const

export const POINTER = {
  width: 0.09,
  height: 0.08,
} as const

export const CAMERA = {
  fov: 38,
  position: [0, 1.1, 5.0],
  lookAt: [0, 0.15, 0],
} as const

export const GROUND = {
  y: -getTopY() - 0.08,
} as const

// ---- Band texture constants (baked into the cap map) ------------------------
export const BAND = {
  texW: 2048,
  texH: 512,
  bandTop: 0.72,       // texture v where the dark band starts (0=top, 1=bottom)
  seamPx: 7,           // height of the baked seam line
  minorH: 0.55,        // minor tick height as fraction of band height
  majorH: 0.92,        // major tick height as fraction of band height
  wrapMargin: 50,       // px; duplicate near-edge elements so the wrap is smooth
  labels: ['0', '55', '50', '45', '40', '35', '30', '25', '20', '15', '10', '5'],
  // "0" sits at tick index 15 → u=0.25 → world +Z (front), then clockwise
  zeroTickIndex: 15,
} as const
