<template>
  <div class="inline-flex items-center">
    <svg :width="width" :height="height" class="overflow-visible">
      <!-- Background guide line -->
      <line
        :x1="0"
        :y1="height / 2"
        :x2="width"
        :y2="height / 2"
        stroke="currentColor"
        stroke-dasharray="2 2"
        class="text-slate-200 dark:text-slate-700/60"
        stroke-width="1"
      />

      <!-- Sparkline Path segments -->
      <path
        v-for="(seg, idx) in pathSegments"
        :key="idx"
        :d="seg"
        fill="none"
        :stroke="strokeColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Dots for valid data points -->
      <circle
        v-for="(pt, idx) in validPoints"
        :key="idx"
        :cx="pt.x"
        :cy="pt.y"
        r="2"
        :fill="strokeColor"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    data: (number | null)[];
    width?: number;
    height?: number;
    min?: number;
    max?: number;
  }>(),
  {
    width: 72,
    height: 20,
    min: 0,
    max: 100,
  }
);

const points = computed(() => {
  if (!props.data || props.data.length === 0) return [];
  const n = props.data.length;
  const step = n > 1 ? props.width / (n - 1) : 0;
  const range = props.max - props.min || 1;

  return props.data.map((val, i) => {
    if (val === null || val === undefined) return null;
    const clamped = Math.max(props.min, Math.min(props.max, val));
    const x = i * step;
    // In SVG, y=0 is top, y=height is bottom
    const y = props.height - ((clamped - props.min) / range) * (props.height - 4) - 2;
    return { x, y, val };
  });
});

const validPoints = computed(() => {
  return points.value.filter((p): p is { x: number; y: number; val: number } => p !== null);
});

const pathSegments = computed(() => {
  const segments: string[] = [];
  let currentSegment = '';

  for (const pt of points.value) {
    if (pt === null) {
      if (currentSegment) {
        segments.push(currentSegment);
        currentSegment = '';
      }
    } else {
      if (!currentSegment) {
        currentSegment = `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      } else {
        currentSegment += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
});

const strokeColor = computed(() => {
  const pts = validPoints.value;
  if (pts.length < 2) return '#005386';
  const first = pts[0].val;
  const last = pts[pts.length - 1].val;
  if (last > first + 0.1) return '#059669'; // Green up
  if (last < first - 0.1) return '#e11d48'; // Red down
  return '#005386'; // Blue neutral
});
</script>
