import type { CSSProperties } from 'react'
import type { TomatoPalette } from '../constants/palettes.js'
import { hexColor } from '../constants/palettes.js'
import { playSound } from '../../../utils/audio.js'

export interface PaletteSwatchProps {
  palette: TomatoPalette
  selected: boolean
  disabled?: boolean
  onSelect: () => void
}

// A single tomato-color option: a mini tomato preview that mirrors the 3D
// scene's colors, with a ring showing the selected state. Exposes the accent
// as `--swatch`/`--swatch-deep` so CSS can draw the active ring in-palette.
export function PaletteSwatch({ palette, selected, disabled, onSelect }: PaletteSwatchProps) {
  const style = { '--swatch': palette.accent, '--swatch-deep': palette.accentDeep } as CSSProperties

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`palette-swatch${selected ? ' is-active' : ''}`}
      style={style}
      title={palette.name}
      aria-label={palette.name}
      disabled={disabled}
      onClick={() => {
        playSound('pop')
        onSelect()
      }}
    >
      <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        {/* calyx leaves */}
        <g fill={hexColor(palette.leaf)}>
          <ellipse cx="20" cy="10.4" rx="2.6" ry="5.4" transform="rotate(-42 20 10.4)" />
          <ellipse cx="20" cy="10.2" rx="2.5" ry="5.7" transform="rotate(-12 20 10.2)" />
          <ellipse cx="20" cy="10" rx="2.3" ry="5.9" transform="rotate(12 20 10)" />
          <ellipse cx="20" cy="10.4" rx="2.6" ry="5.4" transform="rotate(42 20 10.4)" />
        </g>
        {/* stem */}
        <rect x="18.6" y="4.4" width="2.8" height="4.6" rx="1.4" fill={hexColor(palette.stem)} />
        {/* body */}
        <path
          d="M20 35.6C9.5 35.6 4.4 28.6 4.4 20.3 4.4 13.7 7.9 10 11.6 10c2.7 0 5.2 1.3 8.4 1.3s5.7-1.3 8.4-1.3C32.1 10 35.6 13.7 35.6 20.3c0 8.3-5.1 15.3-15.6 15.3z"
          fill={palette.accent}
        />
        {/* soft highlight */}
        <ellipse
          cx="13.2"
          cy="17.8"
          rx="3.4"
          ry="4.8"
          fill="rgba(255,255,255,0.32)"
          transform="rotate(-24 13.2 17.8)"
        />
      </svg>
    </button>
  )
}
