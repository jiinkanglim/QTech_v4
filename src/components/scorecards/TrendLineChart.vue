<template>
  <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
    <!-- Chart Header & Legend Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-[#1b3654]">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <span>Quality Score Progression</span>
          <span class="text-xs font-normal normal-case text-slate-500 dark:text-slate-400">
            ({{ templateId === 'SWE_MODEL' ? 'Scale 1.0 – 3.0' : 'Scale 0 – 10.0' }})
          </span>
        </h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Gaps indicate missing evaluation periods. Click points to inspect scorecard details.
        </p>
      </div>

      <!-- Toggles & Legend -->
      <div class="flex flex-wrap items-center gap-3 text-xs">
        <!-- SWE Sub-part toggles -->
        <template v-if="templateId === 'SWE_MODEL'">
          <label class="flex items-center space-x-1.5 cursor-pointer select-none text-slate-700 dark:text-slate-300">
            <span class="w-3 h-0.5 bg-[#005386] dark:bg-[#38bdf8] inline-block"></span>
            <span class="font-semibold text-[11px]">Overall</span>
          </label>
          <label class="flex items-center space-x-1.5 cursor-pointer select-none text-slate-600 dark:text-slate-400">
            <input type="checkbox" v-model="showReviewPart" class="rounded text-purple-600 focus:ring-purple-500 cursor-pointer text-xs" />
            <span class="w-2.5 h-0.5 bg-purple-500 inline-block"></span>
            <span class="text-[11px]">Review</span>
          </label>
          <label class="flex items-center space-x-1.5 cursor-pointer select-none text-slate-600 dark:text-slate-400">
            <input type="checkbox" v-model="showMetricsPart" class="rounded text-teal-600 focus:ring-teal-500 cursor-pointer text-xs" />
            <span class="w-2.5 h-0.5 bg-teal-500 inline-block"></span>
            <span class="text-[11px]">Metrics</span>
          </label>
        </template>

        <!-- ORS Legend -->
        <template v-else>
          <div class="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span class="flex items-center space-x-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><span>Green</span></span>
            <span class="flex items-center space-x-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span><span>Amber</span></span>
            <span class="flex items-center space-x-1"><span class="w-2 h-2 rounded-full bg-rose-500"></span><span>Red</span></span>
          </div>
        </template>
      </div>
    </div>

    <!-- Empty state if no periods -->
    <div v-if="periods.length === 0" class="py-12 text-center text-xs text-slate-400">
      No periods available in the selected range.
    </div>

    <!-- SVG Chart Container -->
    <div v-else class="relative w-full overflow-hidden" ref="chartContainer">
      <svg
        :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
        class="w-full h-auto select-none overflow-visible"
        @mouseleave="activeTooltip = null"
      >
        <!-- Background Bands for SWE Model (Red / Amber / Green) -->
        <template v-if="templateId === 'SWE_MODEL'">
          <!-- Red Band: [1.0, amberFrom] -->
          <rect
            :x="padLeft"
            :y="getY(amberFrom)"
            :width="plotWidth"
            :height="getY(1.0) - getY(amberFrom)"
            fill="currentColor"
            class="text-rose-500/10 dark:text-rose-950/30"
          />
          <!-- Amber Band: [amberFrom, greenFrom] -->
          <rect
            :x="padLeft"
            :y="getY(greenFrom)"
            :width="plotWidth"
            :height="getY(amberFrom) - getY(greenFrom)"
            fill="currentColor"
            class="text-amber-500/10 dark:text-amber-950/30"
          />
          <!-- Green Band: [greenFrom, 3.0] -->
          <rect
            :x="padLeft"
            :y="getY(3.0)"
            :width="plotWidth"
            :height="getY(greenFrom) - getY(3.0)"
            fill="currentColor"
            class="text-emerald-500/10 dark:text-emerald-950/30"
          />
        </template>

        <!-- Y-Axis Grid Lines & Ticks -->
        <g class="text-slate-400 dark:text-slate-600">
          <template v-for="tick in yTicks" :key="tick">
            <line
              :x1="padLeft"
              :y1="getY(tick)"
              :x2="padLeft + plotWidth"
              :y2="getY(tick)"
              stroke="currentColor"
              stroke-dasharray="3 3"
              stroke-width="0.8"
              class="opacity-40"
            />
            <text
              :x="padLeft - 8"
              :y="getY(tick) + 3.5"
              text-anchor="end"
              class="text-[9px] font-mono fill-slate-400"
            >
              {{ tick.toFixed(templateId === 'SWE_MODEL' ? 1 : 0) }}
            </text>
          </template>
        </g>

        <!-- X-Axis Labels -->
        <g>
          <template v-for="(p, i) in periods" :key="p.periodKey">
            <!-- Label every Nth item if many periods -->
            <text
              v-if="shouldShowXLabel(i)"
              :x="getX(i)"
              :y="chartHeight - padBottom + 16"
              text-anchor="middle"
              class="text-[9px] font-mono fill-slate-500 dark:fill-slate-400"
            >
              {{ formatShortPeriod(p.periodLabel) }}
            </text>
          </template>
        </g>

        <!-- Sub-lines for SWE (Review & Metrics) -->
        <template v-if="templateId === 'SWE_MODEL'">
          <!-- Review Line -->
          <path
            v-if="showReviewPart"
            v-for="(seg, idx) in reviewPathSegments"
            :key="`rev-${idx}`"
            :d="seg"
            fill="none"
            stroke="#a855f7"
            stroke-width="1.4"
            stroke-dasharray="4 2"
            stroke-linecap="round"
          />
          <!-- Metrics Line -->
          <path
            v-if="showMetricsPart"
            v-for="(seg, idx) in metricsPathSegments"
            :key="`met-${idx}`"
            :d="seg"
            fill="none"
            stroke="#14b8a6"
            stroke-width="1.4"
            stroke-dasharray="4 2"
            stroke-linecap="round"
          />
        </template>

        <!-- Primary Line Segments (Gap-aware) -->
        <path
          v-for="(seg, idx) in mainPathSegments"
          :key="`main-${idx}`"
          :d="seg"
          fill="none"
          :stroke="templateId === 'SWE_MODEL' ? '#005386' : '#64748b'"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data Points Circles (Clickable) -->
        <g v-for="(pt, i) in dataPoints" :key="`pt-${i}`">
          <template v-if="pt !== null">
            <!-- Outer clickable hover halo -->
            <circle
              :cx="pt.x"
              :cy="pt.y"
              r="9"
              fill="transparent"
              class="cursor-pointer"
              @mouseenter="activeTooltip = pt"
              @click="$emit('openDetail', pt.scorecard.id)"
            />
            <!-- Visual Point Circle -->
            <circle
              :cx="pt.x"
              :cy="pt.y"
              :r="activeTooltip?.periodKey === pt.periodKey ? 5.5 : 4"
              :fill="getPointColor(pt)"
              stroke="#ffffff"
              stroke-width="1.5"
              class="cursor-pointer transition-all hover:scale-125 shadow-xs"
              @mouseenter="activeTooltip = pt"
              @click="$emit('openDetail', pt.scorecard.id)"
            />
          </template>
        </g>

        <!-- Interactive Hover Tooltip Box in SVG -->
        <g v-if="activeTooltip" class="pointer-events-none transition-all">
          <g :transform="`translate(${getTooltipX(activeTooltip.x)}, ${getTooltipY(activeTooltip.y)})`">
            <rect
              x="-60"
              y="-42"
              width="120"
              height="36"
              rx="6"
              fill="#0f172a"
              class="opacity-95 shadow-xl"
            />
            <text x="0" y="-27" text-anchor="middle" class="text-[10px] font-bold fill-white">
              {{ activeTooltip.periodLabel }}
            </text>
            <text x="0" y="-13" text-anchor="middle" class="text-[9px] font-mono fill-slate-300">
              Score: {{ formatValue(activeTooltip.val) }} ({{ activeTooltip.rag || '—' }})
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Scorecard, ScorecardSummary, ScorecardTemplateId, ScoringSettings } from '../../types';

const props = withDefaults(
  defineProps<{
    templateId: ScorecardTemplateId;
    periods: { periodKey: string; periodLabel: string }[];
    scorecardsMap: Record<string, ScorecardSummary | Scorecard>;
    scoringSettings?: ScoringSettings;
  }>(),
  {
    scoringSettings: () => ({
      sweAmberFrom: 1.5,
      sweGreenFrom: 2.5,
      defaultCadence: 'weekly',
    }),
  }
);

defineEmits<{
  (e: 'openDetail', id: string): void;
}>();

const showReviewPart = ref(true);
const showMetricsPart = ref(true);
const activeTooltip = ref<any | null>(null);

const chartWidth = 760;
const chartHeight = 240;
const padLeft = 40;
const padRight = 25;
const padTop = 20;
const padBottom = 35;
const plotWidth = computed(() => chartWidth - padLeft - padRight);
const plotHeight = computed(() => chartHeight - padTop - padBottom);

const amberFrom = computed(() => props.scoringSettings?.sweAmberFrom ?? 1.5);
const greenFrom = computed(() => props.scoringSettings?.sweGreenFrom ?? 2.5);

// Y min/max based on template
const yMin = computed(() => (props.templateId === 'SWE_MODEL' ? 1.0 : 0));
const yMax = computed(() => (props.templateId === 'SWE_MODEL' ? 3.0 : 10.0));

const yTicks = computed(() => {
  if (props.templateId === 'SWE_MODEL') {
    return [1.0, 1.5, 2.0, 2.5, 3.0];
  }
  return [0, 2, 4, 6, 8, 10];
});

const getY = (val: number) => {
  const range = yMax.value - yMin.value || 1;
  const clamped = Math.max(yMin.value, Math.min(yMax.value, val));
  const ratio = (clamped - yMin.value) / range;
  return chartHeight - padBottom - ratio * plotHeight.value;
};

const getX = (index: number) => {
  const n = props.periods.length;
  if (n <= 1) return padLeft + plotWidth.value / 2;
  return padLeft + (index / (n - 1)) * plotWidth.value;
};

const shouldShowXLabel = (index: number) => {
  const total = props.periods.length;
  if (total <= 12) return true;
  if (total <= 26) return index % 2 === 0 || index === total - 1;
  return index % 4 === 0 || index === total - 1;
};

const formatShortPeriod = (label: string) => {
  // E.g. "Week 40 2026" -> "W40"
  const m = label.match(/Week\s*(\d+)/i);
  return m ? `W${m[1]}` : label;
};

// Compute data points for primary line (show gaps for missing periods)
const dataPoints = computed(() => {
  return props.periods.map((p, idx) => {
    const sc = props.scorecardsMap[p.periodKey];
    if (!sc) return null;

    const val =
      props.templateId === 'SWE_MODEL'
        ? sc.overallValue ?? (sc as any).computed?.overallValue
        : (sc as any).computed?.orsPoints ?? sc.overallValue ?? (sc as any).computed?.overallValue;

    if (val === null || val === undefined) return null;

    return {
      x: getX(idx),
      y: getY(val),
      val,
      rag: sc.overallRag ?? (sc as any).computed?.overallRag,
      periodKey: p.periodKey,
      periodLabel: p.periodLabel,
      scorecard: sc,
    };
  });
});

// Construct SVG path segments broken by nulls
const makePathSegments = (points: ({ x: number; y: number } | null)[]) => {
  const segments: string[] = [];
  let currentSeg = '';

  for (const pt of points) {
    if (pt === null) {
      if (currentSeg) {
        segments.push(currentSeg);
        currentSeg = '';
      }
    } else {
      if (!currentSeg) {
        currentSeg = `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      } else {
        currentSeg += ` L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      }
    }
  }

  if (currentSeg) segments.push(currentSeg);
  return segments;
};

const mainPathSegments = computed(() => makePathSegments(dataPoints.value));

// SWE sub-part paths
const reviewPoints = computed(() => {
  return props.periods.map((p, idx) => {
    const sc: any = props.scorecardsMap[p.periodKey];
    const val = sc?.computed?.parts?.review;
    if (val === null || val === undefined) return null;
    return { x: getX(idx), y: getY(val) };
  });
});
const reviewPathSegments = computed(() => makePathSegments(reviewPoints.value));

const metricsPoints = computed(() => {
  return props.periods.map((p, idx) => {
    const sc: any = props.scorecardsMap[p.periodKey];
    const val = sc?.computed?.parts?.metrics;
    if (val === null || val === undefined) return null;
    return { x: getX(idx), y: getY(val) };
  });
});
const metricsPathSegments = computed(() => makePathSegments(metricsPoints.value));

const getPointColor = (pt: any) => {
  if (pt.rag === 'G') return '#059669';
  if (pt.rag === 'A') return '#d97706';
  if (pt.rag === 'R') return '#e11d48';
  return '#005386';
};

const formatValue = (val: number) => {
  return props.templateId === 'SWE_MODEL' ? val.toFixed(2) : `${val.toFixed(1)}/10`;
};

const getTooltipX = (x: number) => {
  return Math.max(padLeft + 60, Math.min(chartWidth - padRight - 60, x));
};

const getTooltipY = (y: number) => {
  return y < 50 ? y + 50 : y - 10;
};
</script>
