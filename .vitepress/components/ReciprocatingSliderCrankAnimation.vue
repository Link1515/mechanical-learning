<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Point = {
  x: number
  y: number
}

const svgWidth = 520
const svgHeight = 320

const crankCenter: Point = { x: 150, y: 180 }
const sliderAxisY = 180
const sliderStartX = 312

const crankLength = 72
const connectingRodLength = 180
const sliderWidth = 104
const sliderHeight = 60

const angle = ref(0)
const isReducedMotion = ref(false)
const isVisible = ref(true)
const rootElement = ref<HTMLElement | null>(null)

let frameId: number | null = null
let mediaQuery: MediaQueryList | null = null
let observer: IntersectionObserver | null = null

const crankEnd = computed<Point>(() => ({
  x: crankCenter.x + crankLength * Math.cos(angle.value),
  y: crankCenter.y + crankLength * Math.sin(angle.value),
}))

const sliderJoint = computed<Point>(() => {
  const deltaY = sliderAxisY - crankEnd.value.y
  const sliderOffsetX = Math.sqrt(Math.max(connectingRodLength ** 2 - deltaY ** 2, 0))

  return {
    x: crankEnd.value.x + sliderOffsetX,
    y: sliderAxisY,
  }
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
  <figure ref="rootElement" class="reciprocating-slider-crank-demo" data-reciprocating-slider-crank-animation>
    <svg class="reciprocating-slider-crank-demo__svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" role="img" aria-labelledby="reciprocating-slider-crank-title reciprocating-slider-crank-desc">
      <title id="reciprocating-slider-crank-title">往復滑塊機構動畫</title>
      <desc id="reciprocating-slider-crank-desc">展示曲柄連續旋轉、連接桿傳遞運動，帶動滑塊沿固定軌道往復直線移動的滑塊曲柄機構。</desc>

      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" rx="8" class="reciprocating-slider-crank-demo__panel" />

      <circle :cx="crankCenter.x" :cy="crankCenter.y" :r="crankLength" class="reciprocating-slider-crank-demo__orbit" />
      <line :x1="crankCenter.x" :y1="sliderAxisY" x2="468" :y2="sliderAxisY" class="reciprocating-slider-crank-demo__guide" />

      <rect :x="sliderStartX" :y="sliderAxisY - sliderHeight / 2 - 16" width="140" :height="sliderHeight + 32" rx="14" class="reciprocating-slider-crank-demo__housing" />

      <line :x1="crankCenter.x" :y1="crankCenter.y" :x2="crankEnd.x" :y2="crankEnd.y" class="reciprocating-slider-crank-demo__link reciprocating-slider-crank-demo__link--input" />

      <line :x1="crankEnd.x" :y1="crankEnd.y" :x2="sliderJoint.x" :y2="sliderJoint.y" class="reciprocating-slider-crank-demo__link reciprocating-slider-crank-demo__link--coupler" />

      <rect :x="sliderJoint.x - sliderWidth / 2" :y="sliderAxisY - sliderHeight / 2" :width="sliderWidth" :height="sliderHeight" rx="12" class="reciprocating-slider-crank-demo__slider" />

      <circle :cx="crankCenter.x" :cy="crankCenter.y" r="9" class="reciprocating-slider-crank-demo__pivot" />
      <circle :cx="crankEnd.x" :cy="crankEnd.y" r="7" class="reciprocating-slider-crank-demo__joint" />
      <circle :cx="sliderJoint.x" :cy="sliderJoint.y" r="7" class="reciprocating-slider-crank-demo__joint" />

      <text :transform="labelTransform(crankCenter, crankEnd)" class="reciprocating-slider-crank-demo__label reciprocating-slider-crank-demo__label--moving">曲柄</text>
      <text :transform="labelTransform(crankEnd, sliderJoint)" class="reciprocating-slider-crank-demo__label reciprocating-slider-crank-demo__label--moving">連接桿</text>
      <text :x="sliderJoint.x" :y="sliderAxisY - sliderHeight / 2 - 14" class="reciprocating-slider-crank-demo__label reciprocating-slider-crank-demo__label--static">滑塊</text>
    </svg>
  </figure>
</template>

<style scoped>
.reciprocating-slider-crank-demo {
  margin: 2rem 0;
}

.reciprocating-slider-crank-demo__svg {
  width: 100%;
  height: auto;
  display: block;
}

.reciprocating-slider-crank-demo__panel {
  fill: #f7f5ef;
  stroke: #d7d0c3;
  stroke-width: 1.5;
}

.reciprocating-slider-crank-demo__support {
  stroke: #57534e;
  stroke-width: 10;
  stroke-linecap: round;
}

.reciprocating-slider-crank-demo__orbit {
  fill: none;
  stroke: #d6d3d1;
  stroke-width: 3;
  stroke-dasharray: 6 6;
}

.reciprocating-slider-crank-demo__guide {
  stroke: #57534e;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 10 10;
}

.reciprocating-slider-crank-demo__housing {
  fill: #ece7dd;
  stroke: #d7d0c3;
  stroke-width: 1.5;
}

.reciprocating-slider-crank-demo__link {
  stroke-linecap: round;
  stroke-width: 12;
}

.reciprocating-slider-crank-demo__link--input {
  stroke: #2563eb;
}

.reciprocating-slider-crank-demo__link--coupler {
  stroke: #0f766e;
}

.reciprocating-slider-crank-demo__slider {
  fill: #be123c;
  stroke: #881337;
  stroke-width: 2;
}

.reciprocating-slider-crank-demo__pivot {
  fill: #44403c;
}

.reciprocating-slider-crank-demo__joint {
  fill: #fafaf9;
  stroke: #44403c;
  stroke-width: 3;
}

.reciprocating-slider-crank-demo__label {
  fill: #57534e;
  font-size: 15px;
  font-weight: 600;
}

.reciprocating-slider-crank-demo__label--moving,
.reciprocating-slider-crank-demo__label--static {
  dominant-baseline: middle;
  text-anchor: middle;
}

@media (max-width: 640px) {
  .reciprocating-slider-crank-demo__label {
    font-size: 13px;
  }
}
</style>
