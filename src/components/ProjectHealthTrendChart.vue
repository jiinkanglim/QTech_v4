<template>
  <div class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden">
    <!-- Header with Trend Indicator and Mode Selector -->
    <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-[#1b3654] flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <div class="p-1.5 rounded-lg bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#38bdf8] border border-[#bad8eb] dark:border-[#1d4d73]">
            <Activity class="w-4 h-4" />
          </div>
          <h2 class="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            Project Health & Delivery Trajectory
          </h2>
          <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#071524] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1b3654]">
            {{ chronologicalUpdates.length }} reporting periods
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Chronological weekly RAG health status, sprint velocity, and milestone progress trends over time.
        </p>
      </div>

      <!-- Quick Trajectory Badge & View Mode Toggle -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Trend Direction Pill -->
        <div
          v-if="trendDirection"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
          :class="[
            trendDirection.type === 'improving'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : trendDirection.type === 'declining'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              : 'bg-[#e8f2f8] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] border-[#bad8eb] dark:border-[#1d4d73]'
          ]"
        >
          <component :is="trendDirection.icon" class="w-3.5 h-3.5" />
          <span>{{ trendDirection.label }}</span>
        </div>

        <!-- Metric View Mode Switcher -->
        <div class="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654]">
          <button
            @click="chartMetric = 'rag'"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              chartMetric === 'rag'
                ? 'bg-white dark:bg-[#005386] text-[#005386] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            Overall RAG Health
          </button>
          <button
            @click="chartMetric = 'progress'"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              chartMetric === 'progress'
                ? 'bg-white dark:bg-[#005386] text-[#005386] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            Completion %
          </button>
          <button
            @click="chartMetric = 'subrag'"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
              chartMetric === 'subrag'
                ? 'bg-white dark:bg-[#005386] text-[#005386] dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            Sub-Dimensions Matrix
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Body -->
    <div class="p-4 sm:p-5">
      <!-- Empty State if fewer than 1 update -->
      <div v-if="chronologicalUpdates.length === 0" class="py-12 text-center space-y-2">
        <AlertCircle class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">No Weekly Updates Logged Yet</p>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          Log weekly status reports to generate interactive health trajectories and milestone progression curves.
        </p>
      </div>

      <div v-else class="space-y-4">
        <!-- ========================================== -->
        <!-- VIEW 1: OVERALL RAG HEALTH TREND (SVG)     -->
        <!-- ========================================== -->
        <div v-if="chartMetric === 'rag'" class="space-y-3">
          <!-- Trend Graph Container -->
          <div class="relative w-full h-56 sm:h-64 pt-4 pb-2 px-1 select-none">
            <!-- Grid Lines and Y-Axis Labels -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pr-2">
              <div class="flex items-center space-x-2 border-b border-dashed border-emerald-500/20 pb-1">
                <span class="w-16 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Green</span>
                </span>
                <div class="w-full"></div>
                <span class="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 font-mono">On Track</span>
              </div>

              <div class="flex items-center space-x-2 border-b border-dashed border-amber-500/20 pb-1">
                <span class="w-16 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Amber</span>
                </span>
                <div class="w-full"></div>
                <span class="text-[9px] text-amber-600/70 dark:text-amber-400/70 font-mono">Attention</span>
              </div>

              <div class="flex items-center space-x-2 border-b border-dashed border-rose-500/20 pb-1">
                <span class="w-16 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider shrink-0 flex items-center space-x-1">
                  <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Red</span>
                </span>
                <div class="w-full"></div>
                <span class="text-[9px] text-rose-600/70 dark:text-rose-400/70 font-mono">At Risk</span>
              </div>
            </div>

            <!-- SVG Trend Visualization -->
            <svg class="w-full h-full overflow-visible" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" preserveAspectRatio="none">
              <defs>
                <!-- Dynamic Gradient under the Curve -->
                <linearGradient id="ragTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.30" />
                  <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.20" />
                  <stop offset="100%" stop-color="#ef4444" stop-opacity="0.10" />
                </linearGradient>

                <!-- Filter for subtle drop-shadow on path -->
                <filter id="trendShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
                </filter>
              </defs>

              <!-- Gradient Fill Under Path -->
              <path
                v-if="ragAreaPath"
                :d="ragAreaPath"
                fill="url(#ragTrendGradient)"
              />

              <!-- Trend Stroke Path -->
              <path
                v-if="ragStrokePath"
                :d="ragStrokePath"
                fill="none"
                stroke="#005386"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="dark:stroke-[#38bdf8] transition-all duration-300"
                filter="url(#trendShadow)"
              />

              <!-- Data Point Nodes -->
              <g
                v-for="(point, idx) in ragPlotPoints"
                :key="point.update.id"
                class="cursor-pointer group"
                @mouseenter="hoveredIndex = idx"
                @click="selectedPointIndex = idx"
              >
                <!-- Outer Pulse Glow for the Latest Update -->
                <circle
                  v-if="idx === ragPlotPoints.length - 1"
                  :cx="point.x"
                  :cy="point.y"
                  r="12"
                  :class="[
                    point.update.overallRag === 'GREEN'
                      ? 'fill-emerald-500/20 stroke-emerald-500/40 animate-ping'
                      : point.update.overallRag === 'AMBER'
                      ? 'fill-amber-500/20 stroke-amber-500/40 animate-ping'
                      : 'fill-rose-500/20 stroke-rose-500/40 animate-ping'
                  ]"
                />

                <!-- Selection Target Outer Ring -->
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  :r="selectedPointIndex === idx ? 10 : 7"
                  :class="[
                    selectedPointIndex === idx
                      ? 'stroke-slate-900 dark:stroke-white stroke-2'
                      : 'stroke-white dark:stroke-[#091421] stroke-2',
                    'transition-all duration-200'
                  ]"
                  :fill="getRagHexColor(point.update.overallRag)"
                />

                <!-- Inner White Center -->
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  :r="selectedPointIndex === idx ? 3.5 : 2.5"
                  fill="#ffffff"
                />
              </g>
            </svg>

            <!-- X-Axis Labels (Weeks & Dates) -->
            <div class="absolute bottom-0 left-0 right-0 flex justify-between pt-2 px-1">
              <div
                v-for="(point, idx) in ragPlotPoints"
                :key="point.update.id"
                class="flex flex-col items-center cursor-pointer transition-all"
                :class="[
                  selectedPointIndex === idx
                    ? 'text-[#005386] dark:text-[#38bdf8] font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                ]"
                @click="selectedPointIndex = idx"
              >
                <span class="font-mono text-[11px] font-bold">W{{ point.update.weekNumber }}</span>
                <span class="text-[9px] text-slate-400">{{ formatShortDate(point.update.updateDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW 2: COMPLETION PROGRESS TREND          -->
        <!-- ========================================== -->
        <div v-else-if="chartMetric === 'progress'" class="space-y-3">
          <div class="relative w-full h-56 sm:h-64 pt-4 pb-2 px-1 select-none">
            <!-- Y-Axis Percentage Benchmarks -->
            <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pr-2">
              <div class="flex items-center space-x-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                <span class="w-12 text-[10px] font-mono text-slate-400">100%</span>
                <div class="w-full"></div>
                <span class="text-[9px] text-slate-400 font-mono">Target Completion</span>
              </div>
              <div class="flex items-center space-x-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                <span class="w-12 text-[10px] font-mono text-slate-400">50%</span>
                <div class="w-full"></div>
                <span class="text-[9px] text-slate-400 font-mono">Midpoint</span>
              </div>
              <div class="flex items-center space-x-2 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1">
                <span class="w-12 text-[10px] font-mono text-slate-400">0%</span>
                <div class="w-full"></div>
                <span class="text-[9px] text-slate-400 font-mono">Project Kickoff</span>
              </div>
            </div>

            <!-- SVG Percentage Curve -->
            <svg class="w-full h-full overflow-visible" :viewBox="`0 0 ${svgWidth} ${svgHeight}`" preserveAspectRatio="none">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#005386" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#0082c3" stop-opacity="0.05" />
                </linearGradient>
              </defs>

              <path
                v-if="progressAreaPath"
                :d="progressAreaPath"
                fill="url(#progressGradient)"
              />

              <path
                v-if="progressStrokePath"
                :d="progressStrokePath"
                fill="none"
                stroke="#0082c3"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="transition-all duration-300"
              />

              <g
                v-for="(point, idx) in progressPlotPoints"
                :key="point.update.id"
                class="cursor-pointer"
                @mouseenter="hoveredIndex = idx"
                @click="selectedPointIndex = idx"
              >
                <circle
                  :cx="point.x"
                  :cy="point.y"
                  :r="selectedPointIndex === idx ? 9 : 6"
                  :class="selectedPointIndex === idx ? 'stroke-slate-900 dark:stroke-white stroke-2' : 'stroke-white dark:stroke-[#091421] stroke-2'"
                  fill="#005386"
                />
                <circle :cx="point.x" :cy="point.y" r="2.5" fill="#ffffff" />
              </g>
            </svg>

            <!-- X-Axis Labels -->
            <div class="absolute bottom-0 left-0 right-0 flex justify-between pt-2 px-1">
              <div
                v-for="(point, idx) in progressPlotPoints"
                :key="point.update.id"
                class="flex flex-col items-center cursor-pointer transition-all"
                :class="[
                  selectedPointIndex === idx
                    ? 'text-[#005386] dark:text-[#38bdf8] font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                ]"
                @click="selectedPointIndex = idx"
              >
                <span class="font-mono text-[11px] font-bold">{{ point.update.completionPercentage }}%</span>
                <span class="text-[9px] text-slate-400">W{{ point.update.weekNumber }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW 3: SUB-DIMENSIONS MATRIX (Quality, Schedule, Scope) -->
        <!-- ========================================== -->
        <div v-else class="space-y-3 pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              v-for="(item, idx) in chronologicalUpdates"
              :key="item.id"
              @click="selectedPointIndex = idx"
              :class="[
                'p-3.5 rounded-xl border transition-all cursor-pointer',
                selectedPointIndex === idx
                  ? 'border-[#005386] dark:border-[#38bdf8] bg-[#f0f7fb] dark:bg-[#0c2238] shadow-xs'
                  : 'border-slate-200 dark:border-[#1b3654] bg-slate-50/50 dark:bg-[#071524]/60 hover:border-slate-300'
              ]"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-xs font-black text-[#005386] dark:text-[#38bdf8]">
                  Week {{ item.weekNumber }}
                </span>
                <RAGBadge :status="item.overallRag" size="xs" />
              </div>

              <div class="space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Quality:</span>
                  <RAGBadge :status="item.qualityRag" size="xs" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Schedule:</span>
                  <RAGBadge :status="item.scheduleRag" size="xs" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-500 dark:text-slate-400">Scope:</span>
                  <RAGBadge :status="item.scopeRag" size="xs" />
                </div>
                <div class="pt-1.5 border-t border-slate-200/60 dark:border-[#1b3654] flex items-center justify-between text-[11px] font-mono">
                  <span class="text-slate-400">Progress:</span>
                  <span class="font-bold text-slate-700 dark:text-slate-300">{{ item.completionPercentage }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- SELECTED PERIOD INSPECTOR CARD             -->
        <!-- ========================================== -->
        <div
          v-if="selectedUpdate"
          class="p-4 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] space-y-3 transition-all"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-[#1b3654] pb-2.5">
            <div class="flex items-center space-x-2.5">
              <span class="font-mono text-sm font-black text-[#005386] dark:text-[#38bdf8] bg-white dark:bg-[#0f2238] px-2 py-0.5 rounded-md border border-[#bad8eb] dark:border-[#1d4d73]">
                Week {{ selectedUpdate.weekNumber }} Status Snapshot
              </span>
              <RAGBadge :status="selectedUpdate.overallRag" size="sm" />
              <span class="text-xs text-slate-500 dark:text-slate-400">
                Log Date: {{ selectedUpdate.updateDate }}
              </span>
            </div>

            <div class="flex items-center space-x-3 text-xs">
              <span class="text-slate-500">Author: <strong class="text-slate-800 dark:text-slate-200">{{ selectedUpdate.author }}</strong></span>
              <span class="font-mono font-bold text-[#005386] dark:text-[#38bdf8]">{{ selectedUpdate.completionPercentage }}% Complete</span>
            </div>
          </div>

          <!-- Highlight / Lowlight / Next Steps Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <!-- Highlights -->
            <div class="p-3 bg-white dark:bg-[#0f2238] rounded-lg border border-slate-200/80 dark:border-[#1b3654] space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 class="w-3 h-3" />
                <span>Technical Wins & Milestones</span>
              </span>
              <p class="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {{ selectedUpdate.highlights }}
              </p>
            </div>

            <!-- Lowlights / Blockers -->
            <div class="p-3 bg-white dark:bg-[#0f2238] rounded-lg border border-slate-200/80 dark:border-[#1b3654] space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                <AlertTriangle class="w-3 h-3" />
                <span>Blockers & Defect Debt</span>
              </span>
              <p class="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {{ selectedUpdate.lowlights || 'No critical blockers reported.' }}
              </p>
            </div>

            <!-- Next Sprint Focus -->
            <div class="p-3 bg-white dark:bg-[#0f2238] rounded-lg border border-slate-200/80 dark:border-[#1b3654] space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#005386] dark:text-[#38bdf8] flex items-center space-x-1">
                <ArrowRight class="w-3 h-3" />
                <span>Next Sprint Targets</span>
              </span>
              <p class="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                {{ selectedUpdate.nextSteps || 'Standard sprint cycle.' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { WeeklyUpdate, RAGStatus, Project } from '../types';
import RAGBadge from './RAGBadge.vue';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight
} from 'lucide-vue-next';

const props = defineProps<{
  updates: WeeklyUpdate[];
  project?: Project | null;
}>();

const chartMetric = ref<'rag' | 'progress' | 'subrag'>('rag');
const selectedPointIndex = ref<number>(0);
const hoveredIndex = ref<number | null>(null);

// Chronological sorting (earliest week to latest week)
const chronologicalUpdates = computed(() => {
  if (!props.updates || props.updates.length === 0) return [];
  return [...props.updates].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
    return a.updateDate.localeCompare(b.updateDate);
  });
});

// Set default selected point to latest update
watch(
  () => chronologicalUpdates.value.length,
  (len) => {
    if (len > 0) {
      selectedPointIndex.value = len - 1;
    }
  },
  { immediate: true }
);

const selectedUpdate = computed(() => {
  if (chronologicalUpdates.value.length === 0) return null;
  const idx = Math.min(
    Math.max(0, selectedPointIndex.value),
    chronologicalUpdates.value.length - 1
  );
  return chronologicalUpdates.value[idx] || null;
});

// SVG Dimensions
const svgWidth = 800;
const svgHeight = 180;
const paddingX = 40;
const paddingTop = 25;
const paddingBottom = 25;

const ragToScore = (rag: RAGStatus): number => {
  switch (rag) {
    case 'GREEN':
      return 3;
    case 'AMBER':
      return 2;
    case 'RED':
      return 1;
    default:
      return 2;
  }
};

const getRagHexColor = (rag: RAGStatus): string => {
  switch (rag) {
    case 'GREEN':
      return '#10b981';
    case 'AMBER':
      return '#f59e0b';
    case 'RED':
      return '#ef4444';
    default:
      return '#94a3b8';
  }
};

// RAG Coordinates Calculation
const ragPlotPoints = computed(() => {
  const list = chronologicalUpdates.value;
  if (list.length === 0) return [];

  const availableW = svgWidth - paddingX * 2;
  const stepX = list.length > 1 ? availableW / (list.length - 1) : availableW / 2;

  // Y mapping: Score 3 (Green) -> paddingTop; Score 1 (Red) -> svgHeight - paddingBottom
  const minY = paddingTop;
  const maxY = svgHeight - paddingBottom;
  const rangeY = maxY - minY;

  return list.map((update, idx) => {
    const x = list.length === 1 ? svgWidth / 2 : paddingX + idx * stepX;
    const score = ragToScore(update.overallRag);
    // Score 3 -> 0 fraction (top), Score 1 -> 1 fraction (bottom)
    const normalized = (3 - score) / 2;
    const y = minY + normalized * rangeY;
    return {
      x,
      y,
      update
    };
  });
});

// Path generator helper for smooth lines
function createPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const ragStrokePath = computed(() => createPath(ragPlotPoints.value));

const ragAreaPath = computed(() => {
  const points = ragPlotPoints.value;
  if (points.length < 2) return '';
  const stroke = createPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const bottomY = svgHeight;
  return `${stroke} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
});

// Percentage Coordinates Calculation
const progressPlotPoints = computed(() => {
  const list = chronologicalUpdates.value;
  if (list.length === 0) return [];

  const availableW = svgWidth - paddingX * 2;
  const stepX = list.length > 1 ? availableW / (list.length - 1) : availableW / 2;

  const minY = paddingTop;
  const maxY = svgHeight - paddingBottom;
  const rangeY = maxY - minY;

  return list.map((update, idx) => {
    const x = list.length === 1 ? svgWidth / 2 : paddingX + idx * stepX;
    const pct = Math.min(100, Math.max(0, update.completionPercentage || 0));
    const normalized = (100 - pct) / 100;
    const y = minY + normalized * rangeY;
    return {
      x,
      y,
      update
    };
  });
});

const progressStrokePath = computed(() => createPath(progressPlotPoints.value));

const progressAreaPath = computed(() => {
  const points = progressPlotPoints.value;
  if (points.length < 2) return '';
  const stroke = createPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  const bottomY = svgHeight;
  return `${stroke} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
});

// Trajectory Trend Direction Analysis
const trendDirection = computed(() => {
  const list = chronologicalUpdates.value;
  if (list.length < 2) {
    if (list.length === 1) {
      return {
        type: 'stable',
        label: `${list[0].overallRag} Baseline Established`,
        icon: Minus
      };
    }
    return null;
  }

  const latest = ragToScore(list[list.length - 1].overallRag);
  const previous = ragToScore(list[list.length - 2].overallRag);

  if (latest > previous) {
    return {
      type: 'improving',
      label: '↗ Improving Health Trajectory',
      icon: TrendingUp
    };
  } else if (latest < previous) {
    return {
      type: 'declining',
      label: '↘ Degradation (Attention Required)',
      icon: TrendingDown
    };
  } else {
    return {
      type: 'stable',
      label: `→ Stable ${list[list.length - 1].overallRag} Health`,
      icon: Minus
    };
  }
});

const formatShortDate = (isoStr: string): string => {
  if (!isoStr) return '';
  try {
    const [, month, day] = isoStr.split('-');
    const mNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIdx = parseInt(month, 10) - 1;
    return `${mNames[mIdx] || month} ${day}`;
  } catch {
    return isoStr;
  }
};
</script>
