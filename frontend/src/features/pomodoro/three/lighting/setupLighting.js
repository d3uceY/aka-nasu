import * as THREE from 'three'

// Dramatic angled lighting for the pomodoro timer: the tomato is lit from
// 45° off the right at mid-height so the direction reads immediately:
//   • HemisphereLight: a very low warm sky → terracotta gradient. Just enough
//     to keep the shadow side from going pitch black, dim on purpose so the
//     key stays the obvious star.
//   • Key: the main light, a strong warm raking across the right-front
//     lobe faces, leaving the far side to fall into clear shadow.
//   • Bounce: a faint warm lift from below/front that keeps the front lobe
//     grooves readable without flattening the contrast.
//   • Rim: a peachy kicker from behind/left that gives the dark side a soft
//     edge so the tomato still reads as a full sphere.
// The bright key vs. dark fill is what makes the side light unmistakable.
export function setupLighting(scene) {
  // Faint sky → ground gradient (deliberately low, so the shadow side reads dark).
  const hemi = new THREE.HemisphereLight(0xfff3dd, 0xd98a6b, 0.22)
  scene.add(hemi)

  // Strong key: warm sun from 45° off the right (halfway between the side
  // and the front, at tomato mid-height), so the lobe faces read clearly.
  const key = new THREE.DirectionalLight(0xffe9c9, 2.6)
  key.position.set(3.2, 1.0, 3.2)
  scene.add(key)

  // Faint bounce from below/front opens the front grooves a touch.
  const bounce = new THREE.DirectionalLight(0xffb48f, 0.28)
  bounce.position.set(0, -1.8, 2.6)
  scene.add(bounce)

  // Peachy rim from behind/left gives the shadow side a soft edge.
  const rim = new THREE.DirectionalLight(0xffd9c2, 0.5)
  rim.position.set(-4, 2.4, -3.2)
  scene.add(rim)

  // Base intensities, so the render loop can "breathe" them subtly.
  const lights = { hemi, key, bounce, rim }
  lights.keyBase = key.intensity
  lights.rimBase = rim.intensity
  return lights
}
