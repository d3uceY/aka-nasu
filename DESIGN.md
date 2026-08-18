# Aka Nasu — DESIGN.md

> Visual world: **"Tomato on paper."** A gallery-white studio wall where the 3D
> tomato is the single living red object. White space is the material; the
> tomato carries the play. Theme v2, built 2026-08.

## The world in one line
A pomodoro timer that reads like a quiet white gallery room with one ripe
tomato sitting on it — monumental editorial typography over precise, minimal UI.

## Canvas & color (Restrained)
- **Paper:** warm gallery white, never sterile. `--paper-0 #fcfbf9` →
  `--paper-1 #f5f3ef`. The paper never changes; only the *light* does.
- **The room's light follows the phase** — one faint radial kiss behind the
  stage, driven by `body[data-phase]` (synced from the timer store) and
  cross-faded via registered `<color>` custom properties (`@property
  --phase-accent / -deep / -wash / -glow`). Focus = tomato red, short break =
  leaf green, long break = **golden hour** `#d9942c`. Each glow stays around
  0.08–0.09 alpha — a whisper, never a drenched gradient.
- **Ink:** warm, never pure black — `--ink #2b211b`, `--ink-2 #6e615a`,
  `--ink-3 #7d7066` (all ≥ 4.5:1 on paper for their tiers).
- **Three state accents, one identity:** ripe tomato `#e8442e` (focus), leaf
  `#2f9e54` (short break), gold `#d9942c` (long break) — used on the primary
  CTA, phase dot, and sliders. Tomato stays the brand on selection, focus
  ring, and the whole todo "harvest" panel; leaf also marks done checks.
  Never decoration outside those roles.
- Shadows are neutral warm ink; the CTA's shadow is tinted by its own accent
  via `color-mix`.

## Typography (the architecture)
- **Fraunces** (variable serif) is the voice:
  - The **roaring timer number** — `opsz 144`, weight 540, `clamp(4rem …
    8.75rem)` so it fills the column height, `line-height 0.86`, ink on paper.
  - Italic accents: wordmark "Nasu", subtitle, "Today" heading, hints, empty
    states.
- **Instrument Sans** is the quiet workhorse for all UI, controls, labels, body.
- Hierarchy is a clean 3-step ladder: ink 15:1 → ink-2 5.8:1 → ink-3 4.6:1 on
  paper, plus the scale gap between the monumental number and small tracked
  uppercase phase label.

## Craft details
- **Tabular stability:** Fraunces has no tabular figures, so each glyph of the
  ticking number renders in a fixed `1ch` slot (`.timer-glyph`, ch = width of
  "0"). The number never jitters while counting. Implemented in
  `TimerDisplay.jsx` (`TimeSlots`).
- **Surfaces:** white cards + hairline borders (`--line`), neutral soft shadows.
  No frosted glass. Pills only for small controls (buttons, tabs, sliders).
- **Motion:** custom curves only. `--ease-out` (expo) for structure; a gentle
  physical `--ease-spring` for toggles/thumbs/check. Choreographed entrance,
  breathing number, magnetic buttons, dial rotation.
- **Playfulness lives in the tomato**, not the typeface: the 3D dial, spring
  micro-interactions, and garden copy ("spin the tomato to set your focus",
  "Nothing planted yet. Add a seed above.").

## Non-goals (v2)
- No Baloo 2 (rounded voice retired), no cream-drenched field, no drenched
  phase atmosphere (the phase light stays a faint kiss), no backdrop-blur
  frosted glass.
