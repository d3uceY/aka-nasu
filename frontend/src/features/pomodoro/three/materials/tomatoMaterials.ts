import * as THREE from 'three'
import { COLORS } from '../../constants/three.js'

// Shared PBR materials for every visible part of the timer.
export interface TomatoMaterials {
  bodyVertex: THREE.MeshStandardMaterial
  seam: THREE.MeshStandardMaterial
  stem: THREE.MeshStandardMaterial
  leaf: THREE.MeshStandardMaterial
  pointer: THREE.MeshStandardMaterial
}

export function createTomatoMaterials(): TomatoMaterials {
  // Vertex-colored body with roughness tuned for a slightly waxy tomato skin.
  const bodyVertex = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.55,
    metalness: 0.02,
  })

  const seam = new THREE.MeshStandardMaterial({
    color: COLORS.seam,
    roughness: 0.65,
    metalness: 0,
  })

  const stem = new THREE.MeshStandardMaterial({
    color: COLORS.stem,
    roughness: 0.55,
    metalness: 0,
  })

  const leaf = new THREE.MeshStandardMaterial({
    color: COLORS.leaf,
    roughness: 0.6,
    metalness: 0,
    side: THREE.DoubleSide,
  })

  const pointer = new THREE.MeshStandardMaterial({
    color: COLORS.pointer,
    roughness: 0.35,
    metalness: 0,
  })

  return { bodyVertex, seam, stem, leaf, pointer }
}
