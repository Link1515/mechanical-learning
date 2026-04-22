<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Point = {
  x: number
  y: number
}

const svgWidth = 520
const svgHeight = 400

const leftPivot: Point = { x: 215, y: 200 }
const rightPivot: Point = { x: 305, y: 200 }

const inputCrankLength = 180
const couplerLength = 100
const outputCrankLength = 180

const angle = ref(0)
const isReducedMotion = ref(false)
const isVisible = ref(true)
const rootElement = ref<HTMLElement | null>(null)
const previousJoint = ref<Point | null>(null)

let frameId: number | null = null
let mediaQuery: MediaQueryList | null = null
let observer: IntersectionObserver | null = null

function circleIntersections(centerA: Point, radiusA: number, centerB: Point, radiusB: number): Point[] {
  const dx = centerB.x - centerA.x
  const dy = centerB.y - centerA.y
  const distance = Math.hypot(dx, dy)

  if (!distance || distance > radiusA + radiusB || distance < Math.abs(radiusA - radiusB)) {
    return []
  }

  const a = (radiusA ** 2 - radiusB ** 2 + distance ** 2) / (2 * distance)
  const hSquared = Math.max(radiusA ** 2 - a ** 2, 0)
  const h = Math.sqrt(hSquared)
  const midX = centerA.x + (a * dx) / distance
  const midY = centerA.y + (a * dy) / distance
  const offsetX = (-dy * h) / distance
  const offsetY = (dx * h) / distance

  return [
    { x: midX + offsetX, y: midY + offsetY },
    { x: midX - offsetX, y: midY - offsetY },
  ]
}

function distanceBetween(pointA: Point, pointB: Point): number {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y)
}

const inputJoint = computed<Point>(() => ({
  x: leftPivot.x + inputCrankLength * Math.cos(angle.value),
  y: leftPivot.y + inputCrankLength * Math.sin(angle.value),
}))

const outputJoint = computed<Point>(() => {
  const intersections = circleIntersections(inputJoint.value, couplerLength, rightPivot, outputCrankLength)

  if (!intersections.length) {
    return previousJoint.value ?? { x: rightPivot.x, y: rightPivot.y - outputCrankLength }
  }

  const nextJoint = previousJoint.value
    ? intersections.reduce((closest, point) => (distanceBetween(point, previousJoint.value as Point) < distanceBetween(closest, previousJoint.value as Point) ? point : closest), intersections[0])
    : intersections.reduce((upperPoint, point) => (point.y < upperPoint.y ? point : upperPoint), intersections[0])

  previousJoint.value = nextJoint
  return nextJoint
})

function midpoint(pointA: Point, pointB: Point): Point {
  return {
    x: (pointA.x + pointB.x) / 2,
    y: (pointA.y + pointB.y) / 2,
  }
}

function angleDegrees(pointA: Point, pointB: Point): number {
  return (Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180) / Math.PI
}

function uprightAngle(degrees: number): number {
  const normalized = ((degrees % 360) + 360) % 360

  return normalized > 90 && normalized < 270 ? normalized + 180 : normalized
}

function labelTransform(pointA: Point, pointB: Point, offset = -18): string {
  const center = midpoint(pointA, pointB)
  const degrees = angleDegrees(pointA, pointB)
  const labelAngle = uprightAngle(degrees)
  const radians = (degrees * Math.PI) / 180
  const normalX = -Math.sin(radians)
  const normalY = Math.cos(radians)
  const x = center.x + normalX * offset
  const y = center.y + normalY * offset

  return `translate(${x} ${y}) rotate(${labelAngle})`
}

function stopAnimation() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
}

function tick() {
  angle.value += 0.02
  frameId = requestAnimationFrame(tick)
}

function syncAnimationState() {
  stopAnimation()

  if (!isReducedMotion.value && isVisible.value) {
    frameId = requestAnimationFrame(tick)
  }
}

function handleReducedMotionChange(event: MediaQueryListEvent) {
  isReducedMotion.value = event.matches
  syncAnimationState()
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  isReducedMotion.value = mediaQuery.matches
  mediaQuery.addEventListener('change', handleReducedMotionChange)

  observer = new IntersectionObserver(([entry]) => {
    isVisible.value = Boolean(entry?.isIntersecting)
    syncAnimationState()
  })

  if (rootElement.value) {
    observer.observe(rootElement.value)
  }

  syncAnimationState()
})

onBeforeUnmount(() => {
  stopAnimation()
  mediaQuery?.removeEventListener('change', handleReducedMotionChange)
  observer?.disconnect()
})
</script>

<template>
  <figure ref="rootElement" class="double-crank-demo" data-double-crank-animation>
    <svg class="double-crank-demo__svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" role="img" aria-labelledby="double-crank-title double-crank-desc">
      <title id="double-crank-title">雙曲柄機構動畫</title>
      <desc id="double-crank-desc">展示固定桿為最短桿時，左右兩側曲柄皆可連續旋轉的四連桿雙曲柄機構。</desc>

      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" rx="8" class="double-crank-demo__panel" />

      <line :x1="leftPivot.x" :y1="leftPivot.y" :x2="rightPivot.x" :y2="rightPivot.y" class="double-crank-demo__ground" />

      <line :x1="leftPivot.x" :y1="leftPivot.y" :x2="inputJoint.x" :y2="inputJoint.y" class="double-crank-demo__link double-crank-demo__link--input" />

      <line :x1="inputJoint.x" :y1="inputJoint.y" :x2="outputJoint.x" :y2="outputJoint.y" class="double-crank-demo__link double-crank-demo__link--coupler" />

      <line :x1="rightPivot.x" :y1="rightPivot.y" :x2="outputJoint.x" :y2="outputJoint.y" class="double-crank-demo__link double-crank-demo__link--output" />

      <circle :cx="leftPivot.x" :cy="leftPivot.y" r="9" class="double-crank-demo__pivot" />
      <circle :cx="rightPivot.x" :cy="rightPivot.y" r="9" class="double-crank-demo__pivot" />
      <circle :cx="inputJoint.x" :cy="inputJoint.y" r="7" class="double-crank-demo__joint" />
      <circle :cx="outputJoint.x" :cy="outputJoint.y" r="7" class="double-crank-demo__joint" />

      <text :transform="labelTransform(leftPivot, inputJoint)" class="double-crank-demo__label double-crank-demo__label--moving">曲柄</text>
      <text :transform="labelTransform(inputJoint, outputJoint)" class="double-crank-demo__label double-crank-demo__label--moving">連接桿</text>
      <text :transform="labelTransform(rightPivot, outputJoint, 22)" class="double-crank-demo__label double-crank-demo__label--moving">曲柄</text>
    </svg>
  </figure>
</template>

<style scoped>
.double-crank-demo {
  margin: 2rem 0;
}

.double-crank-demo__svg {
  width: 100%;
  height: auto;
  display: block;
}

.double-crank-demo__panel {
  fill: #f7f5ef;
  stroke: #d7d0c3;
  stroke-width: 1.5;
}

.double-crank-demo__ground {
  stroke: #57534e;
  stroke-width: 11;
  stroke-linecap: round;
}

.double-crank-demo__link {
  stroke-linecap: round;
  stroke-width: 12;
}

.double-crank-demo__link--input {
  stroke: #2563eb;
}

.double-crank-demo__link--coupler {
  stroke: #0f766e;
}

.double-crank-demo__link--output {
  stroke: #be123c;
}

.double-crank-demo__pivot {
  fill: #44403c;
}

.double-crank-demo__joint {
  fill: #fafaf9;
  stroke: #44403c;
  stroke-width: 3;
}

.double-crank-demo__label {
  fill: #57534e;
  font-size: 15px;
  font-weight: 600;
}

.double-crank-demo__label--moving {
  dominant-baseline: middle;
  text-anchor: middle;
}

@media (max-width: 640px) {
  .double-crank-demo__label {
    font-size: 13px;
  }
}
</style>
