// Tomato pomodoro timer — mechanical kitchen-timer style.
// The body (lower half) is a static, squashed, lobed sphere with vertex-colored
// grooves.  The cap (upper half) is a partial sphere that carries a canvas
// texture with 60 ticks, 12 numerals, and a seam line — everything baked into
// one map.  The cap, stem, and leaves rotate together as topGroup; the body
// and pointer stay fixed as staticGroup.

export const COLORS = {
  tomato: 0xd0332f,       // brighter base red (reference match)
  tomatoGroove: 0x8f1f1f, // darker groove between lobes
  band: 0x8a1f1f,         // dark backing strip behind ticks
  seam: 0x4c1010,         // very dark equator groove
  stem: 0x2e7d32,
  leaf: 0x256b2a,
  tick: 0xffffff,
  pointer: 0xffffff,
}

export const BODY = {
  radius: 1.15,
  scaleY: 0.82,    // flattening — wider than tall
  lobes: 5,
  lobeDepth: 0.07,  // radial push at lobe crests
  segments: 64,
}

// The split between body and cap.  CAP_FRACTION * (radius * scaleY) = where
// the seam sits on the Y axis.  0.5 puts it halfway up.
export const CAP_FRACTION = 0.5

// Derived helpers — not exported, used by objects that need them.
export const getTopY = () => BODY.radius * BODY.scaleY
export const getSeamY = () => CAP_FRACTION * getTopY()
export const getCapThetaSplit = () => {
  const y0 = getSeamY() / BODY.scaleY
  return Math.acos(Math.max(-1, Math.min(1, y0 / BODY.radius)))
}
export const getCapRadius = () => BODY.radius * 1.015
export const getCrossR = () => {
  const y0 = getSeamY() / BODY.scaleY
  return Math.sqrt(Math.max(0, BODY.radius * BODY.radius - y0 * y0))
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

