import * as THREE from 'three'
import gsap from 'gsap'
import { playSound } from '../../../utils/audio.js'
import { GROUND, SEAM, getSeamY, getCrossR } from '../constants/three.js'
import { createTomatoMaterials } from './materials/tomatoMaterials.js'
import { setupLighting } from './lighting/setupLighting.js'
import { setupCamera } from './camera/setupCamera.js'
import { createTomatoLobes } from './objects/createTomatoLobes.js'
import { createCap } from './objects/createCap.js'
import { createStem } from './objects/createStem.js'
import { createLeaves } from './objects/createLeaves.js'
import { createPointer } from './objects/createPointer.js'
import { attachDialDrag } from './interaction/dialDrag.js'
import { attachDialWheel } from './interaction/dialWheel.js'
import { attachDialKeyboard, tweenSnap, snapToMinute } from './interaction/dialSnap.js'
import {
  DEGREES_PER_MINUTE,
  minutesToDegrees,
  normalizeDegrees,
  shortestAngleDeg,
} from '../utils/dialMath.js'

// ---------------------------------------------------------------------------
// TomatoTimerScene
//
// The mechanical pomodoro kitchen timer: a fixed lower tomato body with a
// white pointer, and a rotating upper cap (textured with band, ticks, and
// numerals) that carries the stem and calyx leaves.  Turning the cap winds
// the timer — the pointer on the static body always points to the current
// minute on the rotating band beneath it.
//
// Every frame it *pulls* the target minute from `getDialMinute()` and eases
// the cap toward it (smooth, frame-rate independent — no setInterval). Manual
// drag / wheel / keyboard rotation is only allowed while `getInteractionEnabled()`
// returns true (idle), and the cap springs/snaps to the nearest minute on
// release, reporting the new focus length via `onDialChange`.
// ---------------------------------------------------------------------------
export class TomatoTimerScene {
  constructor(
    container,
    {
      getDialMinute = () => 25,
      onDialChange = () => {},
      getInteractionEnabled = () => true,
    } = {},
  ) {
    this.container = container
    this.getDialMinute = getDialMinute
    this.onDialChange = onDialChange
    this.getInteractionEnabled = getInteractionEnabled

    this._buildRenderer()
    this._buildScene()
    this._buildCamera()
    this._buildLights()
    this._buildGround()
    this._buildTomato()
    this._buildInteraction()

    this.targetDeg = minutesToDegrees(this.getDialMinute())
    this.currentDeg = this.targetDeg
    this._lastTickMinute = Math.round(this.getDialMinute())
    this._interacting = false
    this._elapsed = 0
    this._snapTween = null
    this._pulseTween = null
    this._lastTime = performance.now()
    this._disposed = false

    this._ro = new ResizeObserver(() => this.resize())
    this._ro.observe(container)
    this.resize()

    this._raf = requestAnimationFrame(this._loop)
  }

  // --- construction ---------------------------------------------------------

  _buildRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(1, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    const el = renderer.domElement
    el.style.width = '100%'
    el.style.height = '100%'
    el.style.display = 'block'
    el.style.touchAction = 'none'
    el.tabIndex = 0
    el.setAttribute('aria-label', 'Tomato timer dial: drag, scroll, or use arrow keys to set the focus length')
    this.container.appendChild(el)
    this.renderer = renderer
  }

  _buildScene() {
    const scene = new THREE.Scene()
    // Transparent background — the CSS gradient shows through.
    // No environment map — matches the reference's simple, punchy lighting.
    scene.background = null
    this.scene = scene
  }

  _buildCamera() {
    this.camera = setupCamera()
  }

  _buildLights() {
    this.lights = setupLighting(this.scene)
  }

  _buildGround() {
    // Soft radial contact shadow under the tomato (product-render look).
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 256
    const ctx = c.getContext('2d')
    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 126)
    grad.addColorStop(0, 'rgba(120, 60, 30, 0.32)')
    grad.addColorStop(0.55, 'rgba(120, 60, 30, 0.16)')
    grad.addColorStop(1, 'rgba(120, 60, 30, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 256, 256)

    const texture = new THREE.CanvasTexture(c)
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.6, 5.6),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
    )
    plane.rotation.x = -Math.PI / 2
    plane.position.y = GROUND.y + 0.012
    this.scene.add(plane)
    this.shadowPlane = plane
  }

  _buildTomato() {
    const materials = createTomatoMaterials()
    this.materials = materials

    // ---- Static body: lower lobed sphere + pointer + seam ring -----------
    const staticGroup = new THREE.Group()
    staticGroup.name = 'StaticGroup'
    staticGroup.add(createTomatoLobes(materials))
    staticGroup.add(createPointer(materials))

    const seamY = getSeamY()
    const crossR = getCrossR()
    const seam = new THREE.Mesh(
      new THREE.TorusGeometry(crossR, SEAM.tube, 16, 64),
      materials.seam,
    )
    seam.rotation.x = Math.PI / 2
    seam.position.y = seamY
    seam.name = 'seam'
    staticGroup.add(seam)

    // ---- Rotating top: textured cap + stem + leaves ---------------------
    const topGroup = new THREE.Group()
    topGroup.name = 'TopGroup'

    const { mesh: capMesh } = createCap(materials)
    topGroup.add(capMesh)
    topGroup.add(createStem(materials))
    topGroup.add(createLeaves(materials))

    // ---- Timer root -----------------------------------------------------
    const timerGroup = new THREE.Group()
    timerGroup.name = 'TimerGroup'
    timerGroup.add(staticGroup)
    timerGroup.add(topGroup)
    this.scene.add(timerGroup)

    this.timerGroup = timerGroup
    this.staticGroup = staticGroup
    this.topGroup = topGroup
  }

  _buildInteraction() {
    this._detachDrag = attachDialDrag({
      domElement: this.renderer.domElement,
      enabled: () => this.getInteractionEnabled(),
      onDragStart: () => {
        this._interacting = true
        this._snapTween?.kill?.()
      },
      onRotate: (deg) => {
        if (!this.getInteractionEnabled()) return
        this._setTargetDeg(this.currentDeg + deg)
        this._tickOnMinuteChange()
      },
      onDragEnd: () => this._endDrag(),
    })

    this._detachWheel = attachDialWheel({
      domElement: this.renderer.domElement,
      enabled: () => this.getInteractionEnabled(),
      onRotate: (deg) => this._userRotate(deg),
    })

    this._detachKeyboard = attachDialKeyboard({
      domElement: this.renderer.domElement,
      enabled: () => this.getInteractionEnabled(),
      onRotate: (deg) => this._userRotate(deg),
    })
  }

  // --- rotation control -----------------------------------------------------

  _setTargetDeg(deg) {
    // Keep the rotation continuous (no wrap) so dragging/snapping never jumps.
    this.targetDeg = this.currentDeg + shortestAngleDeg(this.currentDeg, normalizeDegrees(deg))
  }

  _userRotate(deg) {
    if (!this.getInteractionEnabled()) return
    playSound('dialRatchetTick')
    const from = this.targetDeg
    const to = from + shortestAngleDeg(from, from + deg)
    this._snapTween?.kill?.()
    this._snapTween = tweenSnap(this, 'targetDeg', to, { duration: 0.3, ease: 'power3.out' })
    this._notify()
  }

  _endDrag() {
    this._interacting = false
    const minute = this.minuteUnderPointer()
    const snapped = snapToMinute(minute)
    const snappedDeg = minutesToDegrees(snapped)
    const dist = Math.abs(shortestAngleDeg(this.targetDeg, snappedDeg))
    const duration = Math.min(0.6, 0.25 + (dist / 360) * 0.6)
    this._snapTween?.kill?.()
    this._snapTween = tweenSnap(this, 'targetDeg', snappedDeg, {
      duration,
      ease: 'back.out(1.5)',
    })
    this._lastTickMinute = snapped
    // The dial springs into place — ratchet as it starts to spin, then the
    // clunk as it clicks onto the minute (spin first, clunk after). The tick
    // is skipped for a dead-center release (no real rotation).
    this._snapTween.eventCallback('onStart', () => {
      if (dist > 0.5) playSound('dialRatchetTick')
    })
    this._snapTween.eventCallback('onComplete', () => {
      playSound('clickIntoPlace')
    })
    this.onDialChange(snapped)
  }

  minuteUnderPointer() {
    return normalizeDegrees(this.targetDeg) / DEGREES_PER_MINUTE // 0..60
  }

  // Plays one ratchet tick each time the pointer crosses a whole minute while
  // the dial is being dragged (wheel/keyboard steps tick in _userRotate).
  _tickOnMinuteChange() {
    const minute = Math.round(this.minuteUnderPointer())
    if (minute === this._lastTickMinute) return
    this._lastTickMinute = minute
    playSound('dialRatchetTick')
  }

  _notify() {
    this.onDialChange(snapToMinute(this.minuteUnderPointer()))
  }

  // --- public API -----------------------------------------------------------

  pulse() {
    if (this._disposed) return
    this._pulseTween?.kill?.()
    this._pulseTween = gsap
      .timeline()
      .to(this.timerGroup.scale, { x: 1.09, y: 1.09, z: 1.09, duration: 0.16, ease: 'power2.out' })
      .to(this.timerGroup.scale, { x: 1, y: 1, z: 1, duration: 0.55, ease: 'elastic.out(1, 0.35)' })
  }

  resize() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  dispose() {
    if (this._disposed) return
    this._disposed = true
    cancelAnimationFrame(this._raf)
    this._ro.disconnect()
    this._detachDrag?.()
    this._detachWheel?.()
    this._detachKeyboard?.()
    this._snapTween?.kill?.()
    this._pulseTween?.kill?.()

    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const m of mats) {
          if (m.map) m.map.dispose()
          m.dispose()
        }
      }
    })
    this.renderer.dispose()
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement)
    }
  }

  // --- render loop timer-----------------------------------------------------

  _loop = () => {
    if (this._disposed) return
    const now = performance.now()
    const dt = Math.min(0.05, (now - this._lastTime) / 1000)
    this._lastTime = now
    const snapActive = this._snapTween?.isActive?.() ?? false

    if (!this._interacting && !snapActive) {
      const targetMinute = this.getDialMinute()
      const rawTarget = minutesToDegrees(targetMinute)
      // Shortest-path targeting keeps dial changes natural (no long sweeps).
      this.targetDeg = this.currentDeg + shortestAngleDeg(this.currentDeg, rawTarget)
    }

    if (snapActive || this._interacting) {
      // GSAP snap or pointer drag control the rotation exactly.
      this.currentDeg = this.targetDeg
    } else {
      const k = 1 - Math.pow(0.0009, dt)
      this.currentDeg += (this.targetDeg - this.currentDeg) * k
    }

    this.topGroup.rotation.y = THREE.MathUtils.degToRad(normalizeDegrees(this.currentDeg))

    // Playful idle life: gentle bob + breathing contact shadow.
    this._elapsed += dt
    this.timerGroup.position.y = Math.sin(this._elapsed * 1.3) * 0.012
    this.shadowPlane.scale.setScalar(1 + Math.sin(this._elapsed * 1.3) * 0.02)

    // Cozy light breathing — a slow, warm shimmer that never distracts.
    const breathe = Math.sin(this._elapsed * 0.9)
    this.lights.key.intensity = this.lights.keyBase + breathe * 0.06
    this.lights.rim.intensity = this.lights.rimBase + Math.sin(this._elapsed * 0.9 + 1.3) * 0.05

    this.renderer.render(this.scene, this.camera)
    this._raf = requestAnimationFrame(this._loop)
  }
}
