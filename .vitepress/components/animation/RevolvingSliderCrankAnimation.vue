<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Point = {
  x: number
  y: number
}

const svgWidth = 520
const svgHeight = 420

const pivotA: Point = { x: 260, y: 375 }
const pivotB: Point = { x: 260, y: 175 }

const crankLength = 118
const slottedLinkLength = 360
const sliderWidth = 44
const sliderHeight = 34

const angle = ref(-Math.PI / 3)
const isReducedMotion = ref(false)
const isVisible = ref(true)
const rootElement = ref<HTMLElement | null>(null)

let frameId: number | null = null
let mediaQuery: MediaQueryList | null = null
let observer: IntersectionObserver | null = null

function pointAngle(origin: Point, point: Point): number {
  return Math.atan2(point.y - origin.y, point.x - origin.x)
}

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

const crankJoint = computed<Point>(() => ({
  x: pivotB.x + crankLength * Math.cos(angle.value),
  y: pivotB.y + crankLength * Math.sin(angle.value),
}))

const slottedAngle = computed(() => pointAngle(pivotA, crankJoint.value))

const slottedLinkEnd = computed<Point>(() => {
  return {
    x: pivotA.x + slottedLinkLength * Math.cos(slottedAngle.value),
    y: pivotA.y + slottedLinkLength * Math.sin(slottedAngle.value),
  }
})

const sliderRotation = computed(() => (slottedAngle.value * 180) / Math.PI)

function stopAnimation() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
}

function tick() {
  angle.value += 0.022
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
  <figure ref="rootElement" class="revolving-slider-crank-demo" data-revolving-slider-crank-animation>
    <svg class="revolving-slider-crank-demo__svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" role="img" aria-labelledby="revolving-slider-crank-title revolving-slider-crank-desc">
      <title id="revolving-slider-crank-title">迴轉滑塊曲柄機構動畫</title>
      <desc id="revolving-slider-crank-desc">展示件 1 繞 B 點連續迴轉，帶動件 2 在件 3 的槽內滑動，並使件 3 繞 A 點擺動的迴轉滑塊曲柄機構。</desc>

      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" rx="8" class="revolving-slider-crank-demo__panel" />

      <circle :cx="pivotB.x" :cy="pivotB.y" :r="crankLength" class="revolving-slider-crank-demo__orbit" />

      <line :x1="pivotA.x" :y1="pivotA.y" :x2="slottedLinkEnd.x" :y2="slottedLinkEnd.y" class="revolving-slider-crank-demo__slotted-link" />
      <line :x1="pivotA.x" :y1="pivotA.y" :x2="slottedLinkEnd.x" :y2="slottedLinkEnd.y" class="revolving-slider-crank-demo__slot" />

      <line :x1="pivotB.x" :y1="pivotB.y" :x2="crankJoint.x" :y2="crankJoint.y" class="revolving-slider-crank-demo__crank" />

      <g :transform="`translate(${crankJoint.x} ${crankJoint.y}) rotate(${sliderRotation})`">
        <rect :x="-sliderWidth / 2" :y="-sliderHeight / 2" :width="sliderWidth" :height="sliderHeight" rx="8" class="revolving-slider-crank-demo__slider" />
        <circle cx="0" cy="0" r="6" class="revolving-slider-crank-demo__slider-joint" />
      </g>

      <circle :cx="pivotA.x" :cy="pivotA.y" r="9" class="revolving-slider-crank-demo__pivot" />
      <circle :cx="pivotB.x" :cy="pivotB.y" r="9" class="revolving-slider-crank-demo__pivot" />
      <circle :cx="crankJoint.x" :cy="crankJoint.y" r="6.5" class="revolving-slider-crank-demo__joint" />

      <text :transform="labelTransform(pivotB, crankJoint)" class="revolving-slider-crank-demo__label revolving-slider-crank-demo__label--moving">件 1</text>
      <text :transform="labelTransform(pivotA, slottedLinkEnd, 22)" class="revolving-slider-crank-demo__label revolving-slider-crank-demo__label--moving">件 3</text>
      <text :x="crankJoint.x + 30" :y="crankJoint.y - 18" class="revolving-slider-crank-demo__label revolving-slider-crank-demo__label--static">件 2</text>
      <text :x="pivotA.x - 18" :y="pivotA.y + 28" class="revolving-slider-crank-demo__point-label">A</text>
      <text :x="pivotB.x - 18" :y="pivotB.y + 28" class="revolving-slider-crank-demo__point-label">B</text>
    </svg>
  </figure>
</template>

<style scoped>
.revolving-slider-crank-demo {
  margin: 2rem 0;
}

.revolving-slider-crank-demo__svg {
  width: 100%;
  height: auto;
  display: block;
}

.revolving-slider-crank-demo__panel {
  fill: #f7f5ef;
  stroke: #d7d0c3;
  stroke-width: 1.5;
}

.revolving-slider-crank-demo__orbit {
  fill: none;
  stroke: #d6d3d1;
  stroke-width: 3;
  stroke-dasharray: 6 6;
}

.revolving-slider-crank-demo__slotted-link {
  stroke: #0f766e;
  stroke-width: 18;
  stroke-linecap: round;
}

.revolving-slider-crank-demo__slot {
  stroke: #ecfeff;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 10 8;
}

.revolving-slider-crank-demo__crank {
  stroke: #2563eb;
  stroke-width: 12;
  stroke-linecap: round;
}

.revolving-slider-crank-demo__slider {
  fill: #be123c;
  stroke: #881337;
  stroke-width: 2;
}

.revolving-slider-crank-demo__pivot {
  fill: #44403c;
}

.revolving-slider-crank-demo__joint,
.revolving-slider-crank-demo__slider-joint {
  fill: #fafaf9;
  stroke: #44403c;
  stroke-width: 3;
}

.revolving-slider-crank-demo__label,
.revolving-slider-crank-demo__point-label {
  fill: #57534e;
  font-size: 15px;
  font-weight: 600;
}

.revolving-slider-crank-demo__label--moving,
.revolving-slider-crank-demo__label--static {
  dominant-baseline: middle;
  text-anchor: middle;
}

@media (max-width: 640px) {
  .revolving-slider-crank-demo__label,
  .revolving-slider-crank-demo__point-label {
    font-size: 13px;
  }
}
</style>
