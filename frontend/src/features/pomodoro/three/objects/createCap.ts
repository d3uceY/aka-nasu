import * as THREE from 'three'
import { BODY, BAND, getCapThetaSplit, getCapRadius } from '../../constants/three.js'
import type { TomatoPalette } from '../../constants/palettes.js'
import { hexColor } from '../../constants/palettes.js'
import { applyLobes } from './lobeMath.js'
import type { TomatoMaterials } from '../materials/tomatoMaterials.js'

// Partial sphere (pole → equator) textured with the band, ticks, numerals,
// and seam. Same lobe function as the body so the cap always clears it;
// polygonOffset prevents seam z-fighting.

export interface CapMesh {
  mesh: THREE.Mesh
  texture: THREE.CanvasTexture
  canvas: HTMLCanvasElement
}

// Paint the cap's baked texture (base color, band backing, seam) for a
// palette. Reuses `existing` when provided so a live texture can be repainted
// in place on a palette switch.
export function drawCapCanvas(
  palette: TomatoPalette,
  existing?: HTMLCanvasElement,
): HTMLCanvasElement {
  const { texW, texH, bandTop, seamPx, minorH, majorH, wrapMargin, labels, zeroTickIndex } = BAND
  const bandTopPx = Math.round(texH * bandTop)
  const bandHeight = texH - bandTopPx
  const minorPx = bandHeight * minorH
  const majorPx = bandHeight * majorH

  const canvas = existing ?? document.createElement('canvas')
  canvas.width = texW
  canvas.height = texH
  const ctx = canvas.getContext('2d')!

  // Base cap colour (the palette's body) …
  ctx.fillStyle = hexColor(palette.body)
  ctx.fillRect(0, 0, texW, texH)
  // Dark backing strip for the band (the palette's groove) …
  ctx.fillStyle = hexColor(palette.groove)
  ctx.fillRect(0, bandTopPx, texW, bandHeight + seamPx)
  // Baked seam line at the equator.
  ctx.fillStyle = hexColor(palette.seam)
  ctx.fillRect(0, texH - seamPx, texW, seamPx)

  function place(x: number, drawFn: (xx: number) => void): void {
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

  return canvas
}

export function createCap(_materials: TomatoMaterials, palette: TomatoPalette): CapMesh {
  const capRadius = getCapRadius()
  const thetaSplit = getCapThetaSplit() // π/2 (equator)

  const canvas = drawCapCanvas(palette)
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

  return { mesh: capMesh, texture, canvas }
}
