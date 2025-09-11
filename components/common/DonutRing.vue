<template>
  <div class="relative" :style="{ width: sizePx, height: sizePx }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="block">
      <circle
        :cx="size/2"
        :cy="size/2"
        :r="radius"
        :stroke="trackColor"
        :stroke-width="stroke"
        fill="transparent"
        stroke-linecap="round"
      />
      <circle
        :cx="size/2"
        :cy="size/2"
        :r="radius"
        :stroke="color"
        :stroke-width="stroke"
        fill="transparent"
        stroke-linecap="round"
        :style="{ strokeDasharray: circumference + ' ' + circumference, strokeDashoffset: dashOffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center">
      <slot>{{ clamped }}%</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  percent: number
  size?: number
  stroke?: number
  color?: string
  trackColor?: string
}>(), {
  size: 128,
  stroke: 16,
  color: '#2563eb',
  trackColor: '#e5e7eb'
})

const clamped = computed(() => {
  const p = Math.max(0, Math.min(100, Math.round(props.percent)))
  return p
})

const size = computed(() => props.size)
const sizePx = computed(() => `${size.value}px`)
const stroke = computed(() => props.stroke)
const radius = computed(() => (size.value - stroke.value) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => ((100 - clamped.value) / 100) * circumference.value)
const color = computed(() => props.color)
const trackColor = computed(() => props.trackColor)
</script>

<style scoped>
</style>


