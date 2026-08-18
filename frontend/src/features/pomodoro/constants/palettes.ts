// Tomato color palettes: each one re-tints the 3D tomato (body, grooves,
// seam, stem, leaves, pointer) AND the app's focus accent so the whole room
// re-tunes when the user swaps color. The break phases keep their own
// atmosphere (leaf / golden hour) — only the focus/tomato identity changes.
//
// `body/groove/seam/stem/leaf/pointer` are Three.js hex numbers for the scene;
// `accent/accentDeep/wash/glow` are CSS strings applied to the `--tomato*`
// tokens so buttons, dots, sliders and glows follow the palette.

export interface TomatoPalette {
  id: string
  name: string
  /** Body base color (Three.js hex). */
  body: number
  /** Darker groove between lobes (Three.js hex). */
  groove: number
  /** Equator seam (Three.js hex). */
  seam: number
  /** Stem (Three.js hex). */
  stem: number
  /** Calyx leaves (Three.js hex). */
  leaf: number
  /** Pointer (Three.js hex). */
  pointer: number
  /** UI accent for the focus phase — CSS hex. */
  accent: string
  /** Deeper accent for gradients / hover — CSS hex. */
  accentDeep: string
  /** Soft wash tint — CSS hex. */
  wash: string
  /** Ambient glow — CSS color (rgba). */
  glow: string
}

export const DEFAULT_PALETTE_ID = 'classic'

export const TOMATO_PALETTES: TomatoPalette[] = [
  {
    id: 'classic',
    name: 'Classic',
    body: 0xe8442e,
    groove: 0x9c2c1c,
    seam: 0x4a0f0c,
    stem: 0x2f9e54,
    leaf: 0x25904a,
    pointer: 0xffffff,
    accent: '#e8442e',
    accentDeep: '#c5361f',
    wash: '#fbe9e3',
    glow: 'rgba(232, 68, 46, 0.09)',
  },
  {
    id: 'ember',
    name: 'Ember',
    body: 0xe2682e,
    groove: 0xa33c12,
    seam: 0x571d06,
    stem: 0x2f9e54,
    leaf: 0x25904a,
    pointer: 0xffffff,
    accent: '#e2682e',
    accentDeep: '#bf4d13',
    wash: '#fdefe3',
    glow: 'rgba(226, 104, 46, 0.1)',
  },
  {
    id: 'gold',
    name: 'Golden hour',
    body: 0xe8a33d,
    groove: 0xa86a12,
    seam: 0x5a3305,
    stem: 0x2f9e54,
    leaf: 0x25904a,
    pointer: 0xffffff,
    accent: '#e8a33d',
    accentDeep: '#c98118',
    wash: '#fdf4e2',
    glow: 'rgba(232, 163, 61, 0.12)',
  },
  {
    id: 'meadow',
    name: 'Meadow',
    body: 0x3d9a5c,
    groove: 0x1f5e34,
    seam: 0x0e2f19,
    stem: 0x1f7a44,
    leaf: 0x175c33,
    pointer: 0xffffff,
    accent: '#3d9a5c',
    accentDeep: '#2a7a46',
    wash: '#e9f5ec',
    glow: 'rgba(61, 154, 92, 0.1)',
  },
  {
    id: 'lagoon',
    name: 'Lagoon',
    body: 0x2f96a8,
    groove: 0x155b66,
    seam: 0x072a30,
    stem: 0x2f9e54,
    leaf: 0x25904a,
    pointer: 0xffffff,
    accent: '#2f96a8',
    accentDeep: '#1d7688',
    wash: '#e7f4f6',
    glow: 'rgba(47, 150, 168, 0.1)',
  },
  {
    id: 'grape',
    name: 'Grape',
    body: 0x8b5aa8,
    groove: 0x5a2f74,
    seam: 0x2a1438,
    stem: 0x2f9e54,
    leaf: 0x25904a,
    pointer: 0xffffff,
    accent: '#8b5aa8',
    accentDeep: '#6d3f8a',
    wash: '#f3edf7',
    glow: 'rgba(139, 90, 168, 0.1)',
  },
  {
    id: 'berry',
    name: 'Berry',
    body: 0xd94f7c,
    groove: 0x942b50,
    seam: 0x471223,
    stem: 0x2f9e54,
    leaf: 0x25904a,
    pointer: 0xffffff,
    accent: '#d94f7c',
    accentDeep: '#b52f5e',
    wash: '#fdeef3',
    glow: 'rgba(217, 79, 124, 0.1)',
  },
  {
    id: 'cocoa',
    name: 'Cocoa',
    body: 0x8a5a3b,
    groove: 0x5a351d,
    seam: 0x2c180a,
    stem: 0x2f9e54,
    leaf: 0x25904a,
    pointer: 0xffffff,
    accent: '#8a5a3b',
    accentDeep: '#6b3f26',
    wash: '#f5eee7',
    glow: 'rgba(138, 90, 59, 0.1)',
  },
]

const PALETTE_BY_ID = new Map(TOMATO_PALETTES.map((p) => [p.id, p]))

export function isPaletteId(id: string): boolean {
  return PALETTE_BY_ID.has(id)
}

export function getPalette(id: string): TomatoPalette {
  return PALETTE_BY_ID.get(id) ?? PALETTE_BY_ID.get(DEFAULT_PALETTE_ID)!
}

// Three.js hex number → "#rrggbb" for inline CSS fills (swatch stems etc.).
export function hexColor(n: number): string {
  return `#${n.toString(16).padStart(6, '0')}`
}
