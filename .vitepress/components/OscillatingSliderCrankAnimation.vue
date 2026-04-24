<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Point = {
  x: number
  y: number
}

const svgWidth = 520
const svgHeight = 340

const rockerPivot: Point = { x: 84, y: 205 }
const cylinderCenter: Point = { x: 350, y: 205 }

const rockerLength = 52
const rodLength = 250
const pistonWidth = 28
const pistonHeight = 84
const cylinderWidth = 280
const cylinderHeight = 96
const cylinderInset = 14

const angle = ref(0.38)
const isReducedMotion = ref(false)
const isVisible = ref(true)
const rootElement = ref<HTMLElement | null>(null)

let frameId: number | null = null
let mediaQuery: MediaQueryList | null = null
let observer: IntersectionObserver | null = null

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

function polarPoint(origin: Point, length: number, radians: number): Point {
  return {
    x: origin.x + length * Math.cos(radians),
    y: origin.y + length * Math.sin(radians),
  }
}

const rockerEnd = computed<Point>(() => ({
  x: rockerPivot.x + rockerLength * Math.cos(angle.value),
  y: rockerPivot.y - rockerLength * Math.sin(angle.value),
}))

const cylinderDirection = computed<Point>(() => {
  const dx = cylinderCenter.x - rockerEnd.value.x
  const dy = cylinderCenter.y - rockerEnd.value.y
  const length = Math.hypot(dx, dy) || 1

  return {
    x: dx / length,
    y: dy / length,
  }
})

const cylinderNormal = computed<Point>(() => ({
  x: -cylinderDirection.value.y,
  y: cylinderDirection.value.x,
}))

const cylinderAngle = computed(() => Math.atan2(cylinderDirection.value.y, cylinderDirection.value.x))

const pinDistanceFromCenter = computed(() => {
  const centerToRocker = Math.hypot(
    cylinderCenter.x - rockerEnd.value.x,
    cylinderCenter.y - rockerEnd.value.y,
  )

  return centerToRocker - rodLength
})

const cylinderStart = computed<Point>(() => polarPoint(cylinderCenter, cylinderWidth / 2, cylinderAngle.value + Math.PI))

const sliderCenter = computed<Point>(() => ({
  x: cylinderCenter.x - cylinderDirection.value.x * pinDistanceFromCenter.value,
  y: cylinderCenter.y - cylinderDirection.value.y * pinDistanceFromCenter.value,
}))

const sliderOffset = computed(() => (
  cylinderWidth / 2 - pinDistanceFromCenter.value
))

const rodVisualEnd = computed<Point>(() => polarPoint(sliderCenter.value, pistonWidth / 2 - 3, cylinderAngle.value + Math.PI))

const cylinderBodyX = computed(() => cylinderStart.value.x - cylinderNormal.value.x * (cylinderHeight / 2))
const cylinderBodyY = computed(() => cylinderStart.value.y - cylinderNormal.value.y * (cylinderHeight / 2))
const cylinderDegrees = computed(() => (cylinderAngle.value * 180) / Math.PI)

function stopAnimation() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
}

function tick() {
  angle.value += 0.03
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
  <figure ref="rootElement" class="oscillating-slider-crank-demo" data-oscillating-slider-crank-animation>
    <svg class="oscillating-slider-crank-demo__svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" role="img" aria-labelledby="oscillating-slider-crank-title oscillating-slider-crank-desc">
      <title id="oscillating-slider-crank-title">擺動滑塊曲柄機構動畫</title>
      <desc id="oscillating-slider-crank-desc">展示左側搖桿來回擺動，帶動固定長度連桿，並由幾何約束反算出與 A 點同高且可繞中心擺動的汽缸姿態與活塞往復位置的擺動滑塊曲柄機構。</desc>

      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" rx="8" class="oscillating-slider-crank-demo__panel" />

      <circle :cx="rockerPivot.x" :cy="rockerPivot.y" :r="rockerLength" class="oscillating-slider-crank-demo__orbit" />

      <circle :cx="cylinderCenter.x" :cy="cylinderCenter.y" r="6" class="oscillating-slider-crank-demo__center-mark" />

      <g :transform="`translate(${cylinderBodyX} ${cylinderBodyY}) rotate(${cylinderDegrees})`">
        <path :d="`M 0 0 H ${cylinderWidth} V ${cylinderHeight} H 0 V ${cylinderHeight - cylinderInset} H ${cylinderInset} V ${cylinderInset} H 0 Z`" class="oscillating-slider-crank-demo__cylinder-shell-fill" />
        <path :d="`M ${cylinderInset} ${cylinderInset} H ${cylinderWidth - cylinderInset} V ${cylinderHeight - cylinderInset} H ${cylinderInset} Z`" class="oscillating-slider-crank-demo__cylinder-bore-fill" />
        <path :d="`M 0 0 H ${cylinderWidth} V ${cylinderHeight} H 0 V ${cylinderHeight - cylinderInset}`" class="oscillating-slider-crank-demo__cylinder-shell-stroke" />
        <path :d="`M 0 ${cylinderInset} H ${cylinderInset}`" class="oscillating-slider-crank-demo__cylinder-shell-stroke" />
        <path :d="`M 0 ${cylinderHeight - cylinderInset} H ${cylinderInset}`" class="oscillating-slider-crank-demo__cylinder-shell-stroke" />
        <path :d="`M ${cylinderInset} ${cylinderInset} H ${cylinderWidth - cylinderInset} V ${cylinderHeight - cylinderInset} H ${cylinderInset}`" class="oscillating-slider-crank-demo__cylinder-bore-stroke" />
        <rect :x="sliderOffset - pistonWidth / 2" :y="(cylinderHeight - pistonHeight) / 2" :width="pistonWidth" :height="pistonHeight" rx="6" class="oscillating-slider-crank-demo__slider" />
      </g>

      <line :x1="rockerPivot.x" :y1="rockerPivot.y" :x2="rockerEnd.x" :y2="rockerEnd.y" class="oscillating-slider-crank-demo__rocker" />
      <line :x1="rockerEnd.x" :y1="rockerEnd.y" :x2="rodVisualEnd.x" :y2="rodVisualEnd.y" class="oscillating-slider-crank-demo__rod" />

      <circle :cx="rockerPivot.x" :cy="rockerPivot.y" r="8" class="oscillating-slider-crank-demo__pivot" />
      <circle :cx="rockerEnd.x" :cy="rockerEnd.y" r="6.5" class="oscillating-slider-crank-demo__joint" />

      <text :transform="labelTransform(rockerPivot, rockerEnd, -18)" class="oscillating-slider-crank-demo__label oscillating-slider-crank-demo__label--moving">搖桿</text>
      <text :transform="labelTransform(rockerEnd, rodVisualEnd, -16)" class="oscillating-slider-crank-demo__label oscillating-slider-crank-demo__label--moving">連桿</text>
      <text :x="rockerPivot.x - 16" :y="rockerPivot.y + 28" class="oscillating-slider-crank-demo__point-label">A</text>
    </svg>
  </figure>
</template>

<style scoped>
.oscillating-slider-crank-demo {
  margin: 2rem 0;
}

.oscillating-slider-crank-demo__svg {
  width: 100%;
  height: auto;
  display: block;
}

.oscillating-slider-crank-demo__panel {
  fill: #f7f5ef;
  stroke: #d7d0c3;
  stroke-width: 1.5;
}

.oscillating-slider-crank-demo__orbit {
  fill: none;
  stroke: #d6d3d1;
  stroke-width: 3;
  stroke-dasharray: 6 6;
}

.oscillating-slider-crank-demo__cylinder-shell-fill {
  fill: #5b6470;
}

.oscillating-slider-crank-demo__cylinder-bore-fill {
  fill: #c7ced9;
}

.oscillating-slider-crank-demo__cylinder-shell-stroke {
  fill: none;
  stroke: #3f4650;
  stroke-width: 1.5;
}

.oscillating-slider-crank-demo__cylinder-bore-stroke {
  fill: none;
  stroke: #8e98a8;
  stroke-width: 1.25;
}

.oscillating-slider-crank-demo__rocker {
  stroke: #2563eb;
  stroke-width: 10;
  stroke-linecap: round;
}

.oscillating-slider-crank-demo__rod {
  stroke: #6b7280;
  stroke-width: 10;
  stroke-linecap: round;
}

.oscillating-slider-crank-demo__slider {
  fill: #6b7280;
  stroke: #4b5563;
  stroke-width: 1.5;
}

.oscillating-slider-crank-demo__center-mark {
  fill: #e7e5e4;
  stroke: #57534e;
  stroke-width: 2;
  stroke-dasharray: 3 2;
}

.oscillating-slider-crank-demo__pivot {
  fill: #44403c;
}

.oscillating-slider-crank-demo__joint {
  fill: #fafaf9;
  stroke: #44403c;
  stroke-width: 3;
}

.oscillating-slider-crank-demo__label,
.oscillating-slider-crank-demo__point-label {
  fill: #57534e;
  font-size: 15px;
  font-weight: 600;
}

.oscillating-slider-crank-demo__label--moving {
  dominant-baseline: middle;
  text-anchor: middle;
}

@media (max-width: 640px) {
  .oscillating-slider-crank-demo__label,
  .oscillating-slider-crank-demo__point-label {
    font-size: 13px;
  }
}
</style>
