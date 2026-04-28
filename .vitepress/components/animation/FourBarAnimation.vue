<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Point = {
  x: number
  y: number
}

const svgWidth = 520
const svgHeight = 320

const leftPivot: Point = { x: 150, y: 220 }
const rightPivot: Point = { x: 370, y: 220 }

const crankLength = 80
const couplerLength = 250
const rockerLength = 140

const angle = ref(0)
const isReducedMotion = ref(false)
const isVisible = ref(true)
const rootElement = ref<HTMLElement | null>(null)

let frameId: number | null = null
let mediaQuery: MediaQueryList | null = null
let observer: IntersectionObserver | null = null

function circleIntersection(centerA: Point, radiusA: number, centerB: Point, radiusB: number): Point {
  const dx = centerB.x - centerA.x
  const dy = centerB.y - centerA.y
  const distance = Math.hypot(dx, dy)

  if (!distance) {
    return { x: centerA.x, y: centerA.y }
  }

  const a = (radiusA ** 2 - radiusB ** 2 + distance ** 2) / (2 * distance)
  const hSquared = Math.max(radiusA ** 2 - a ** 2, 0)
  const h = Math.sqrt(hSquared)
  const midX = centerA.x + (a * dx) / distance
  const midY = centerA.y + (a * dy) / distance
  const offsetX = (-dy * h) / distance
  const offsetY = (dx * h) / distance

  return {
    x: midX - offsetX,
    y: midY - offsetY,
  }
}

const crankEnd = computed<Point>(() => ({
  x: leftPivot.x + crankLength * Math.cos(angle.value),
  y: leftPivot.y + crankLength * Math.sin(angle.value),
}))

const rockerJoint = computed<Point>(() => circleIntersection(crankEnd.value, couplerLength, rightPivot, rockerLength))

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
  angle.value += 0.025
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
  <figure ref="rootElement" class="four-bar-demo" data-four-bar-animation>
    <svg class="four-bar-demo__svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" role="img" aria-labelledby="four-bar-title four-bar-desc">
      <title id="four-bar-title">四連桿機構動畫</title>
      <desc id="four-bar-desc">展示曲柄持續旋轉、連接桿傳遞運動，並帶動搖桿往復擺動的四連桿機構。</desc>

      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" rx="8" class="four-bar-demo__panel" />

      <line :x1="leftPivot.x" :y1="leftPivot.y" :x2="rightPivot.x" :y2="rightPivot.y" class="four-bar-demo__ground" />

      <line :x1="leftPivot.x" :y1="leftPivot.y" :x2="crankEnd.x" :y2="crankEnd.y" class="four-bar-demo__link four-bar-demo__link--input" />

      <line :x1="crankEnd.x" :y1="crankEnd.y" :x2="rockerJoint.x" :y2="rockerJoint.y" class="four-bar-demo__link four-bar-demo__link--coupler" />

      <line :x1="rightPivot.x" :y1="rightPivot.y" :x2="rockerJoint.x" :y2="rockerJoint.y" class="four-bar-demo__link four-bar-demo__link--output" />

      <circle :cx="leftPivot.x" :cy="leftPivot.y" r="9" class="four-bar-demo__pivot" />
      <circle :cx="rightPivot.x" :cy="rightPivot.y" r="9" class="four-bar-demo__pivot" />
      <circle :cx="crankEnd.x" :cy="crankEnd.y" r="7" class="four-bar-demo__joint" />
      <circle :cx="rockerJoint.x" :cy="rockerJoint.y" r="7" class="four-bar-demo__joint" />
      <text :transform="labelTransform(leftPivot, crankEnd)" class="four-bar-demo__label four-bar-demo__label--moving">曲柄</text>
      <text :transform="labelTransform(crankEnd, rockerJoint)" class="four-bar-demo__label four-bar-demo__label--moving">連接桿</text>
      <text :transform="labelTransform(rightPivot, rockerJoint, 22)" class="four-bar-demo__label four-bar-demo__label--moving">搖桿</text>
    </svg>
  </figure>
</template>

<style scoped>
.four-bar-demo {
  margin: 2rem 0;
}

.four-bar-demo__svg {
  width: 100%;
  height: auto;
  display: block;
}

.four-bar-demo__panel {
  fill: #f7f5ef;
  stroke: #d7d0c3;
  stroke-width: 1.5;
}

.four-bar-demo__ground {
  stroke: #57534e;
  stroke-width: 11;
  stroke-linecap: round;
}

.four-bar-demo__link {
  stroke-linecap: round;
  stroke-width: 12;
}

.four-bar-demo__link--input {
  stroke: #2563eb;
}

.four-bar-demo__link--coupler {
  stroke: #0f766e;
}

.four-bar-demo__link--output {
  stroke: #be123c;
}

.four-bar-demo__pivot {
  fill: #44403c;
}

.four-bar-demo__joint {
  fill: #fafaf9;
  stroke: #44403c;
  stroke-width: 3;
}

.four-bar-demo__label {
  fill: #57534e;
  font-size: 15px;
  font-weight: 600;
}

.four-bar-demo__label--moving {
  dominant-baseline: middle;
  text-anchor: middle;
}

@media (max-width: 640px) {
  .four-bar-demo__label {
    font-size: 13px;
  }
}
</style>
