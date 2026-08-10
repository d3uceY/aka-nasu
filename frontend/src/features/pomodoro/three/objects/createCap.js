import * as THREE from 'three'
import { BODY, BAND, getSeamY, getCapThetaSplit, getCapRadius } from '../../constants/three.js'

// ---------------------------------------------------------------------------
// createCap
//
// One partial-sphere mesh (upper portion of the tomato) that carries a
// canvas texture with the dark band, 60 ticks, 12 numerals, and a baked
// seam line — all UV-mapped onto the cap surface.  This single mesh replaces
// the old separate dial-ring + 72 tick/number objects → far fewer draw calls.
//
// The cap covers theta ∈ [0, CAP_THETA_SPLIT] (pole down to the seam).
// Band markings are painted in the bottom portion of the texture so they sit
// right above the equator seam.
// ---------------------------------------------------------------------------

export function createCap(_materials) {
  const capRadius = getCapRadius()
  const thetaSplit = getCapThetaSplit()
  const seamY = getSeamY()

  // ---- build the canvas texture -------------------------------------------
  const { texW, texH, bandTop, seamPx, minorH, majorH, wrapMargin, labels, zeroTickIndex } = BAND
  const bandTopPx = Math.round(texH * bandTop)
  const bandHeight = texH - bandTopPx
  const minorPx = bandHeight * minorH
  const majorPx = bandHeight * majorH

  const canvas = document.createElement('canvas')
  canvas.width = texW
  canvas.height = texH
  const ctx = canvas.getContext('2d')

  // Base cap colour — match the body's base red so the transition is seamless.
  ctx.fillStyle = '#d43a35'
  ctx.fillRect(0, 0, texW, texH)

  // Dark backing strip for the band — slightly lighter than before so white
  // ticks and numerals pop against it under PBR lighting.
  ctx.fillStyle = '#7a1a1a'
  ctx.fillRect(0, bandTopPx, texW, bandHeight + seamPx)

  // Baked seam line right at the bottom edge.
  ctx.fillStyle = '#3a0a0a'
  ctx.fillRect(0, texH - seamPx, texW, seamPx)

  // Helper: draw at x, also at x±texW when near edges for seamless wrap.
  function place(x, drawFn) {
    drawFn(x)
    if (x < wrapMargin) drawFn(x + texW)
    if (x > texW - wrapMargin) drawFn(x - texW)
  }

  // 60 ticks — minor lines, major every 5th (taller).
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0
    const h = isMajor ? majorPx : minorPx
    const w = isMajor ? 7 : 3
    const x = (i / 60) * texW
    place(x, (xx) => ctx.fillRect(xx - w / 2, texH - seamPx - h, w, h))
  }

  // 12 numerals — "0" at zeroTickIndex → u=0.25 → world +Z, then clockwise.
  ctx.font = '700 60px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  for (let i = 0; i < 60; i += 5) {
    const j = (((i - zeroTickIndex) / 5) % 12 + 12) % 12
    const label = labels[j]
    const x = (i / 60) * texW
    place(x, (xx) => ctx.fillText(label, xx, bandTopPx - 6))
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.needsUpdate = true

  // ---- cap mesh: partial sphere from pole down to thetaSplit --------------
  // Position so the bottom edge (theta=thetaSplit) sits exactly at seamY.
  const capGeo = new THREE.SphereGeometry(capRadius, 80, 40, 0, Math.PI * 2, 0, thetaSplit)
  const capMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.45,
    metalness: 0,
  })
  const capMesh = new THREE.Mesh(capGeo, capMat)
  capMesh.scale.set(1, BODY.scaleY, 1)
  // Bottom of the partial sphere (theta=thetaSplit) → world y = centerY + R*cos(thetaSplit)*scaleY
  // We want that to equal seamY, so: centerY = seamY - R*cos(thetaSplit)*scaleY
  capMesh.position.y = seamY - capRadius * Math.cos(thetaSplit) * BODY.scaleY
  capMesh.name = 'cap'

  return { mesh: capMesh, texture }
}