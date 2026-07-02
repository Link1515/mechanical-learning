<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Point = {
  x: number
  y: number
}

const svgWidth = 520
const svgHeight = 430

const pivot: Point = { x: 200, y: 82 }
const sliderAxisX = 200
const guideTopY = 58
const guideBottomY = 350
const baseTopY = 272

const handleJointDistance = 132
const handleLength = 250
const connectingRodLength = 152
const sliderWidth = 34
const sliderHeight = 98

const phase = ref(0)
const isReducedMotion = ref(false)
const isVisible = ref(true)
const rootElement = ref<HTMLElement | null>(null)

let frameId: number | null = null
let mediaQuery: MediaQueryList | null = null
let observer: IntersectionObserver | null = null

const handleAngle = computed(() => 0.86 + Math.sin(phase.value) * 0.28)

const handleJoint = computed<Point>(() => ({
  x: pivot.x + handleJointDistance * Math.cos(handleAngle.value),
  y: pivot.y + handleJointDistance * Math.sin(handleAngle.value),
}))

const handleGrip = computed<Point>(() => ({
  x: pivot.x + handleLength * Math.cos(handleAngle.value + 0.02),
  y: pivot.y + handleLength * Math.sin(handleAngle.value + 0.02),
}))

const handleControl = computed<Point>(() => {
  const normalAngle = handleAngle.value - Math.PI / 2

  return {
    x: pivot.x + 168 * Math.cos(handleAngle.value) + 28 * Math.cos(normalAngle),
    y: pivot.y + 168 * Math.sin(handleAngle.value) + 28 * Math.sin(normalAngle),
  }
})

const handlePath = computed(() => (
  `M ${pivot.x} ${pivot.y} Q ${handleControl.value.x} ${handleControl.value.y} ${handleGrip.value.x} ${handleGrip.value.y}`
))

const sliderJoint = computed<Point>(() => {
  const deltaX = sliderAxisX - handleJoint.value.x
  const deltaY = Math.sqrt(Math.max(connectingRodLength ** 2 - deltaX ** 2, 0))

  return {
    x: sliderAxisX,
    y: handleJoint.value.y + deltaY,
  }
})

const sliderTopY = computed(() => sliderJoint.value.y - sliderHeight / 2)

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
  phase.value += 0.026
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
  <figure ref="rootElement" class="fixed-slider-crank-demo" data-fixed-slider-crank-animation>
    <svg class="fixed-slider-crank-demo__svg" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" role="img" aria-labelledby="fixed-slider-crank-title fixed-slider-crank-desc">
      <title id="fixed-slider-crank-title">固定滑塊曲柄機構動畫</title>
      <desc id="fixed-slider-crank-desc">展示手壓式抽水機常見的固定滑塊曲柄機構：把手繞上方固定樞軸擺動，連桿帶動中間滑桿沿固定導槽上下往復。</desc>

      <rect x="0" y="0" :width="svgWidth" :height="svgHeight" rx="8" class="fixed-slider-crank-demo__panel" />

      <rect x="150" :y="baseTopY" width="100" height="96" rx="4" class="fixed-slider-crank-demo__base" />
      <line :x1="sliderAxisX" :y1="guideTopY" :x2="sliderAxisX" :y2="guideBottomY" class="fixed-slider-crank-demo__guide" />
      <line :x1="sliderAxisX - 18" :y1="baseTopY + 18" :x2="sliderAxisX - 18" y2="360" class="fixed-slider-crank-demo__base-slot" />
      <line :x1="sliderAxisX + 18" :y1="baseTopY + 18" :x2="sliderAxisX + 18" y2="360" class="fixed-slider-crank-demo__base-slot" />

      <rect :x="sliderAxisX - sliderWidth / 2" :y="sliderTopY" :width="sliderWidth" :height="sliderHeight" rx="8" class="fixed-slider-crank-demo__slider" />

      <path :d="handlePath" class="fixed-slider-crank-demo__handle" />
      <line :x1="handleJoint.x" :y1="handleJoint.y" :x2="sliderJoint.x" :y2="sliderJoint.y" class="fixed-slider-crank-demo__rod" />

      <circle :cx="pivot.x" :cy="pivot.y" r="9" class="fixed-slider-crank-demo__pivot" />
      <circle :cx="handleJoint.x" :cy="handleJoint.y" r="7" class="fixed-slider-crank-demo__joint" />
      <circle :cx="sliderJoint.x" :cy="sliderJoint.y" r="7" class="fixed-slider-crank-demo__joint" />

      <text :transform="labelTransform(pivot, handleGrip, -36)" class="fixed-slider-crank-demo__label fixed-slider-crank-demo__label--moving">把手</text>
      <text :transform="labelTransform(handleJoint, sliderJoint, -16)" class="fixed-slider-crank-demo__label fixed-slider-crank-demo__label--moving">連桿</text>
      <text :x="sliderAxisX - 90" :y="baseTopY + 52" class="fixed-slider-crank-demo__label fixed-slider-crank-demo__label--static">固定滑塊</text>
    </svg>
  </figure>
</template>

<style scoped>
.fixed-slider-crank-demo {
  margin: 2rem 0;
}

.fixed-slider-crank-demo__svg {
  width: 100%;
  height: auto;
  display: block;
}

.fixed-slider-crank-demo__panel {
  fill: #f7f5ef;
  stroke: #d7d0c3;
  stroke-width: 1.5;
}

.fixed-slider-crank-demo__base {
  fill: #8b949f;
  stroke: #4b5563;
  stroke-width: 2;
}

.fixed-slider-crank-demo__base-slot {
  stroke: #4b5563;
  stroke-width: 1.5;
  stroke-dasharray: 6 5;
}

.fixed-slider-crank-demo__guide {
  stroke: #64748b;
  stroke-width: 28;
  stroke-linecap: round;
}

.fixed-slider-crank-demo__slider {
  fill: #cbd5e1;
  stroke: #475569;
  stroke-width: 2;
}

.fixed-slider-crank-demo__handle {
  fill: none;
  stroke: #2563eb;
  stroke-width: 22;
  stroke-linecap: round;
}

.fixed-slider-crank-demo__rod {
  stroke: #0f766e;
  stroke-width: 12;
  stroke-linecap: round;
}

.fixed-slider-crank-demo__pivot {
  fill: #44403c;
}

.fixed-slider-crank-demo__joint {
  fill: #fafaf9;
  stroke: #44403c;
  stroke-width: 3;
}

.fixed-slider-crank-demo__label,
.fixed-slider-crank-demo__point-label {
  fill: #57534e;
  font-size: 15px;
  font-weight: 600;
}

.fixed-slider-crank-demo__label--moving,
.fixed-slider-crank-demo__label--static {
  dominant-baseline: middle;
  text-anchor: middle;
}

@media (max-width: 640px) {
  .fixed-slider-crank-demo__label,
  .fixed-slider-crank-demo__point-label {
    font-size: 13px;
  }
}
</style>
