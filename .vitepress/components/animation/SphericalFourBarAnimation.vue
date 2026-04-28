<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const inputLength = degreesToRadians(28)
const couplerLength = degreesToRadians(70)
const outputLength = degreesToRadians(58)
const sphereRadius = 2.6

const rootElement = ref<HTMLElement | null>(null)
const viewportElement = ref<HTMLElement | null>(null)
const isReducedMotion = ref(false)
const isVisible = ref(true)
const renderError = ref('')
const previousOutput = ref<THREE.Vector3 | null>(null)

const frameLeft = new THREE.Vector3(0, 0, 1)
const frameRight = new THREE.Vector3(1, 0, 0)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let mediaQuery: MediaQueryList | null = null
let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let frameId: number | null = null
let lastTick = 0
let phase = 0

type MechanismMeshes = {
  frameLink: THREE.Mesh
  inputLink: THREE.Mesh
  couplerLink: THREE.Mesh
  outputLink: THREE.Mesh
  inputGuide: THREE.LineLoop
  outputGuide: THREE.Line
  frameLeftRadius: THREE.Line
  frameRightRadius: THREE.Line
  inputRadius: THREE.Line
  outputRadius: THREE.Line
  frameLeftJoint: THREE.Mesh
  frameRightJoint: THREE.Mesh
  inputJoint: THREE.Mesh
  outputJoint: THREE.Mesh
}

let mechanismMeshes: MechanismMeshes | null = null

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function normalize(vector: THREE.Vector3): THREE.Vector3 {
  return vector.normalize()
}

function pointOnSmallCircle(axis: THREE.Vector3, radiusAngle: number, angle: number, reference: THREE.Vector3): THREE.Vector3 {
  const tangentU = reference.clone().projectOnPlane(axis).normalize()
  const tangentV = new THREE.Vector3().crossVectors(axis, tangentU).normalize()

  return axis
    .clone()
    .multiplyScalar(Math.cos(radiusAngle))
    .add(tangentU.multiplyScalar(Math.sin(radiusAngle) * Math.cos(angle)))
    .add(tangentV.multiplyScalar(Math.sin(radiusAngle) * Math.sin(angle)))
    .normalize()
}

function sphericalIntersections(centerA: THREE.Vector3, centerB: THREE.Vector3, radiusA: number, radiusB: number): THREE.Vector3[] {
  const axisDot = centerA.dot(centerB)
  const determinant = 1 - axisDot ** 2

  if (Math.abs(determinant) < 1e-8) {
    return []
  }

  const cosineA = Math.cos(radiusA)
  const cosineB = Math.cos(radiusB)
  const alpha = (cosineA - axisDot * cosineB) / determinant
  const beta = (cosineB - axisDot * cosineA) / determinant
  const basePoint = centerA.clone().multiplyScalar(alpha).add(centerB.clone().multiplyScalar(beta))
  const remainder = 1 - basePoint.dot(basePoint)

  if (remainder < -1e-8) {
    return []
  }

  const normal = new THREE.Vector3().crossVectors(centerA, centerB).normalize()
  const gamma = Math.sqrt(Math.max(remainder, 0))

  return [basePoint.clone().add(normal.clone().multiplyScalar(gamma)).normalize(), basePoint.clone().add(normal.clone().multiplyScalar(-gamma)).normalize()]
}

function chooseOutputJoint(candidates: THREE.Vector3[]): THREE.Vector3 {
  if (!candidates.length) {
    return previousOutput.value?.clone() ?? frameRight.clone()
  }

  const preferred = previousOutput.value
    ? candidates.reduce(
        (closest, candidate) => (candidate.distanceTo(previousOutput.value as THREE.Vector3) < closest.distanceTo(previousOutput.value as THREE.Vector3) ? candidate : closest),
        candidates[0]
      )
    : candidates.reduce((frontMost, candidate) => (candidate.z > frontMost.z ? candidate : frontMost), candidates[0])

  previousOutput.value = preferred.clone()
  return preferred.clone()
}

function slerpVector(start: THREE.Vector3, end: THREE.Vector3, amount: number): THREE.Vector3 {
  const cosine = THREE.MathUtils.clamp(start.dot(end), -1, 1)
  const angle = Math.acos(cosine)

  if (angle < 1e-6) {
    return start.clone()
  }

  const sinAngle = Math.sin(angle)
  const startWeight = Math.sin((1 - amount) * angle) / sinAngle
  const endWeight = Math.sin(amount * angle) / sinAngle

  return start.clone().multiplyScalar(startWeight).add(end.clone().multiplyScalar(endWeight)).normalize()
}

function sampleArc(start: THREE.Vector3, end: THREE.Vector3, steps = 64): THREE.Vector3[] {
  return Array.from({ length: steps + 1 }, (_, index) => slerpVector(start, end, index / steps).multiplyScalar(sphereRadius))
}

function sampleOrbit(axis: THREE.Vector3, radiusAngle: number, reference: THREE.Vector3, startAngle: number, endAngle: number, steps = 128): THREE.Vector3[] {
  return Array.from({ length: steps }, (_, index) => {
    const angle = startAngle + ((endAngle - startAngle) * index) / steps
    return pointOnSmallCircle(axis, radiusAngle, angle, reference).multiplyScalar(sphereRadius)
  })
}

function createSolidLine(color: string, opacity = 1) {
  return new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }))
}

function createTube(color: string, radius = 0.08, opacity = 1) {
  return new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(), new THREE.Vector3(0, 0, 0.01)), 2, radius, 18, false),
    new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity })
  )
}

function createDashedLine(color: string, opacity = 1) {
  return new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08, transparent: true, opacity }))
}

function createJoint(color: string, radius = 0.095) {
  return new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), new THREE.MeshBasicMaterial({ color }))
}

function updateLinePoints(line: THREE.Line, points: THREE.Vector3[]) {
  line.geometry.dispose()
  line.geometry = new THREE.BufferGeometry().setFromPoints(points)

  if (line.material instanceof THREE.LineDashedMaterial) {
    line.computeLineDistances()
  }
}

function updateTube(mesh: THREE.Mesh, points: THREE.Vector3[], radius = 0.08) {
  mesh.geometry.dispose()
  mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), Math.max(points.length * 2, 24), radius, 18, false)
}

function renderScene() {
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

function resizeRenderer() {
  if (!renderer || !camera || !viewportElement.value) {
    return
  }

  const width = viewportElement.value.clientWidth
  const height = Math.max(340, Math.round(width * 0.68))

  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderScene()
}

function updateMechanism() {
  if (!mechanismMeshes) {
    return
  }

  const inputJoint = pointOnSmallCircle(frameLeft, inputLength, phase, frameRight)
  const outputJoint = chooseOutputJoint(sphericalIntersections(inputJoint, frameRight, couplerLength, outputLength))

  updateTube(mechanismMeshes.inputLink, sampleArc(frameLeft, inputJoint), 0.1)
  updateTube(mechanismMeshes.couplerLink, sampleArc(inputJoint, outputJoint), 0.1)
  updateTube(mechanismMeshes.outputLink, sampleArc(frameRight, outputJoint), 0.1)
  updateLinePoints(mechanismMeshes.inputRadius, [new THREE.Vector3(), inputJoint.clone().multiplyScalar(sphereRadius)])
  updateLinePoints(mechanismMeshes.outputRadius, [new THREE.Vector3(), outputJoint.clone().multiplyScalar(sphereRadius)])

  mechanismMeshes.inputJoint.position.copy(inputJoint).multiplyScalar(sphereRadius)
  mechanismMeshes.outputJoint.position.copy(outputJoint).multiplyScalar(sphereRadius)
}

function stopAnimation() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
}

function animate(timestamp: number) {
  const deltaSeconds = lastTick ? Math.min((timestamp - lastTick) / 1000, 0.05) : 0
  lastTick = timestamp

  if (!isReducedMotion.value && isVisible.value) {
    phase = (phase + deltaSeconds * 1.2) % (Math.PI * 2)
    updateMechanism()
  }

  controls?.update()
  renderScene()
  frameId = requestAnimationFrame(animate)
}

function syncAnimationState() {
  stopAnimation()
  lastTick = 0
  frameId = requestAnimationFrame(animate)
}

function handleReducedMotionChange(event: MediaQueryListEvent) {
  isReducedMotion.value = event.matches
}

function buildScene() {
  if (!viewportElement.value) {
    return
  }

  try {
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#e8dece')

    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(5.8, 4.1, 7.0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor('#efe7da')
    renderer.outputColorSpace = THREE.SRGBColorSpace

    viewportElement.value.replaceChildren(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 4.5
    controls.maxDistance = 10
    controls.target.set(0, 0.2, 0)
    camera.lookAt(controls.target)
    controls.update()
    controls.addEventListener('change', renderScene)

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(sphereRadius, 56, 56),
      new THREE.MeshBasicMaterial({
        color: '#cfbea2',
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      })
    )

    const sphereWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.SphereGeometry(sphereRadius, 18, 18)),
      new THREE.LineBasicMaterial({ color: '#8f7a60', transparent: true, opacity: 0.6 })
    )

    const center = createJoint('#57534e', 0.08)
    const axesHelper = new THREE.AxesHelper(3.6)

    const frameLink = createTube('#57534e', 0.1, 0.45)
    const inputLink = createTube('#2563eb', 0.1)
    const couplerLink = createTube('#0f766e', 0.1)
    const outputLink = createTube('#be123c', 0.1)
    const inputGuide = new THREE.LineLoop(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: '#8f8579', dashSize: 0.12, gapSize: 0.08, transparent: true, opacity: 0.55 }))
    const outputGuide = createDashedLine('#8f8579', 0.55)

    const frameLeftRadius = createSolidLine('#8f8579', 0.38)
    const frameRightRadius = createSolidLine('#8f8579', 0.38)
    const inputRadius = createSolidLine('#8f8579', 0.3)
    const outputRadius = createSolidLine('#8f8579', 0.3)

    const frameLeftJoint = createJoint('#1f1b16', 0.16)
    const frameRightJoint = createJoint('#1f1b16', 0.16)
    const inputJoint = createJoint('#2563eb', 0.14)
    const outputJoint = createJoint('#be123c', 0.14)

    frameLeftJoint.position.copy(frameLeft).multiplyScalar(sphereRadius)
    frameRightJoint.position.copy(frameRight).multiplyScalar(sphereRadius)

    mechanismMeshes = {
      frameLink,
      inputLink,
      couplerLink,
      outputLink,
      inputGuide,
      outputGuide,
      frameLeftRadius,
      frameRightRadius,
      inputRadius,
      outputRadius,
      frameLeftJoint,
      frameRightJoint,
      inputJoint,
      outputJoint,
    }

    updateLinePoints(inputGuide, sampleOrbit(frameLeft, inputLength, frameRight, 0, Math.PI * 2))
    updateLinePoints(outputGuide, sampleOrbit(frameRight, outputLength, frameLeft, -1.5, 1.35))
    updateTube(frameLink, sampleArc(frameLeft, frameRight), 0.1)
    updateLinePoints(frameLeftRadius, [new THREE.Vector3(), frameLeft.clone().multiplyScalar(sphereRadius)])
    updateLinePoints(frameRightRadius, [new THREE.Vector3(), frameRight.clone().multiplyScalar(sphereRadius)])
    updateMechanism()

    scene.add(
      axesHelper,
      sphere,
      sphereWire,
      center,
      inputGuide,
      outputGuide,
      frameLink,
      inputLink,
      couplerLink,
      outputLink,
      frameLeftRadius,
      frameRightRadius,
      inputRadius,
      outputRadius,
      frameLeftJoint,
      frameRightJoint,
      inputJoint,
      outputJoint
    )

    resizeRenderer()
    renderScene()
  } catch (error) {
    renderError.value = error instanceof Error ? error.message : 'Three.js initialization failed.'
  }
}

function disposeSceneObject(object: THREE.Object3D) {
  object.traverse(child => {
    const mesh = child as THREE.Mesh

    if ('geometry' in mesh && mesh.geometry) {
      mesh.geometry.dispose()
    }

    if ('material' in mesh && mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose())
      } else {
        mesh.material.dispose()
      }
    }
  })
}

onMounted(() => {
  buildScene()

  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  isReducedMotion.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleReducedMotionChange)

  observer = new IntersectionObserver(([entry]) => {
    isVisible.value = Boolean(entry?.isIntersecting)
  })

  if (rootElement.value) {
    observer.observe(rootElement.value)
  }

  if (viewportElement.value) {
    resizeObserver = new ResizeObserver(() => resizeRenderer())
    resizeObserver.observe(viewportElement.value)
  }

  syncAnimationState()
})

onBeforeUnmount(() => {
  stopAnimation()
  mediaQuery?.removeEventListener('change', handleReducedMotionChange)
  observer?.disconnect()
  resizeObserver?.disconnect()
  controls?.dispose()

  if (scene) {
    disposeSceneObject(scene)
  }

  renderer?.dispose()
  scene = null
  camera = null
  controls = null
  renderer = null
  mechanismMeshes = null
})
</script>

<template>
  <figure ref="rootElement" class="spherical-four-bar-three" data-spherical-four-bar-animation>
    <div ref="viewportElement" class="spherical-four-bar-three__viewport" aria-label="球面四連桿機構 Three.js 動畫"></div>
    <p v-if="renderError" class="spherical-four-bar-three__error">Three.js 無法初始化：{{ renderError }}</p>

    <figcaption class="spherical-four-bar-three__meta">
      <p class="spherical-four-bar-three__caption">可拖曳旋轉視角。</p>
      <span class="spherical-four-bar-three__legend-item">
        <span class="spherical-four-bar-three__swatch spherical-four-bar-three__swatch--frame"></span>
        固定桿
      </span>
      <span class="spherical-four-bar-three__legend-item">
        <span class="spherical-four-bar-three__swatch spherical-four-bar-three__swatch--input"></span>
        主動桿
      </span>
      <span class="spherical-four-bar-three__legend-item">
        <span class="spherical-four-bar-three__swatch spherical-four-bar-three__swatch--coupler"></span>
        連接桿
      </span>
      <span class="spherical-four-bar-three__legend-item">
        <span class="spherical-four-bar-three__swatch spherical-four-bar-three__swatch--output"></span>
        從動桿
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.spherical-four-bar-three {
  margin: 2rem 0;
  border: 1px solid #d8ccbc;
  border-radius: 14px;
  overflow: hidden;
  background: #f8f4eb;
}

.spherical-four-bar-three__viewport {
  width: 100%;
  min-height: 340px;
  aspect-ratio: 1.47 / 1;
  background: radial-gradient(circle at 35% 28%, rgba(255, 250, 240, 0.9), rgba(239, 231, 218, 0.96) 62%, rgba(224, 210, 189, 0.95));
}

.spherical-four-bar-three__viewport :deep(canvas) {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}

.spherical-four-bar-three__viewport :deep(canvas:active) {
  cursor: grabbing;
}

.spherical-four-bar-three__error {
  margin: 0;
  padding: 0.8rem 1rem 0;
  color: #991b1b;
  font-size: 0.92rem;
  text-align: center;
}

.spherical-four-bar-three__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.1rem;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1rem 1rem;
  color: #57534e;
  font-size: 0.95rem;
  font-weight: 600;
}

.spherical-four-bar-three__caption {
  width: 100%;
  margin: 0;
  text-align: center;
}

.spherical-four-bar-three__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.spherical-four-bar-three__swatch {
  width: 1.1rem;
  height: 0.45rem;
  border-radius: 999px;
  display: inline-block;
}

.spherical-four-bar-three__swatch--frame {
  background: #57534e;
}

.spherical-four-bar-three__swatch--input {
  background: #2563eb;
}

.spherical-four-bar-three__swatch--coupler {
  background: #0f766e;
}

.spherical-four-bar-three__swatch--output {
  background: #be123c;
}

@media (max-width: 640px) {
  .spherical-four-bar-three__meta {
    font-size: 0.88rem;
  }
}
</style>
