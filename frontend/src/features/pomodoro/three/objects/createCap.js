import * as THREE from 'three'
import { BODY, BAND, getCapThetaSplit, getCapRadius } from '../../constants/three.js'
import { applyLobes } from './lobeMath.js'

// ---------------------------------------------------------------------------
// createCap
//
// One partial-sphere mesh (pole → equator) that carries a canvas texture
// with the dark band, 60 ticks, 12 numerals, and a baked seam line.
// The SAME lobe function used on the body is applied here so the cap is
// always a strict superset of the body's radius (CAP_CLEARANCE = 1.035×).
// polygonOffset prevents seam z-fighting.
// ---------------------------------------------------------------------------

export function createCap(_materials) {
  const capRadius = getCapRadius()
  const thetaSplit = getCapThetaSplit() // π/2 — equator

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

  // Base cap colour.
  ctx.fillStyle = '#db4a3e'
  ctx.fillRect(0, 0, texW, texH)
  // Dark backing strip for the band.
  ctx.fillStyle = '#8a1f1f'
  ctx.fillRect(0, bandTopPx, texW, bandHeight + seamPx)
  // Baked seam line at the equator.
  ctx.fillStyle = '#4c1010'
  ctx.fillRect(0, texH - seamPx, texW, seamPx)

  function place(x, drawFn) {
    drawFn(x)
    if (x < wrapMargin) drawFn(x + texW)
    if (x > texW - wrapMargin) drawFn(x - texW)
  }

  // 60 ticks.
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 60; i++) {
    const isMajor = i % 5 === 0
    const h = isMajor ? majorPx : minorPx
    const w = isMajor ? 7 : 3
    const x = (i / 60) * texW
    place(x, (xx) => ctx.fillRect(xx - w / 2, texH - seamPx - h, w, h))
  }

  // 12 numerals.
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

  // ---- cap mesh -----------------------------------------------------------
  const capGeo = new THREE.SphereGeometry(capRadius, 64, 32, 0, Math.PI * 2, 0, thetaSplit)
  applyLobes(capGeo) // same theta/phi bump as body → cap always sits outside
  capGeo.computeVertexNormals()

  const capMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.5,
    metalness: 0,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  })
  const capMesh = new THREE.Mesh(capGeo, capMat)
  capMesh.scale.set(1, BODY.scaleY, 1)
  capMesh.name = 'cap'

  return { mesh: capMesh, texture }
}