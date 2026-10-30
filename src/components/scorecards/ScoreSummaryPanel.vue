<template>
  <div class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-md p-5 space-y-5">
    <!-- Panel Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b3654]">
      <div class="flex items-center space-x-2">
        <Activity class="w-4 h-4 text-[#005386] dark:text-[#38bdf8]" />
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Evaluation Summary
        </h3>
      </div>
      <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#071524] text-slate-600 dark:text-slate-300">
        {{ templateId === 'SWE_MODEL' ? 'SWE Model' : 'ORS Optimizer' }}
      </span>
    </div>

    <!-- SWE SUMMARY SECTION -->
    <div v-if="templateId === 'SWE_MODEL'" class="space-y-4">
      <!-- Overall RAG Hero Box -->
      <div
        :class="[
          'p-4 rounded-xl border flex items-center justify-between transition-all',
          computedScore.overallRag === 'G' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' :
          computedScore.overallRag === 'A' ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300' :
          computedScore.overallRag === 'R' ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300' :
          'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-400'
        ]"
      >
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider opacity-75">
            Overall Rating
          </span>
          <div class="text-xl font-black mt-0.5 tracking-tight flex items-center space-x-2">
            <span>{{ computedScore.overallLabel }}</span>
          </div>
          <p class="text-[11px] mt-0.5 opacity-80" v-if="computedScore.normalizedPct !== null">
            Normalized quality: <strong>{{ computedScore.normalizedPct }}%</strong>
          </p>
        </div>

        <div class="text-right">
          <div class="text-2xl font-black font-mono">
            {{ computedScore.overallValue !== null ? computedScore.overallValue.toFixed(2) : '—' }}
          </div>
          <span
            v-if="computedScore.overallRag"
            :class="[
              'inline-block px-2.5 py-0.5 text-xs font-black rounded-full border',
              computedScore.overallRag === 'G' ? 'bg-emerald-600 text-white border-emerald-700' :
              computedScore.overallRag === 'A' ? 'bg-amber-500 text-white border-amber-600' :
              'bg-rose-600 text-white border-rose-700'
            ]"
          >
            {{ computedScore.overallRag }}
          </span>
        </div>
      </div>

      <!-- Parts Breakdown -->
      <div class="grid grid-cols-2 gap-2.5">
        <!-- Review Part -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] space-y-1">
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Part 1: Model Review
          </span>
          <div class="flex items-center justify-between">
            <span class="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
              {{ computedScore.parts?.review !== null && computedScore.parts?.review !== undefined ? computedScore.parts.review.toFixed(2) : '—' }}
            </span>
            <span
              v-if="computedScore.parts?.reviewRag"
              :class="[
                'px-2 py-0.5 text-[10px] font-black rounded-full',
                computedScore.parts.reviewRag === 'G' ? 'bg-emerald-500 text-white' :
                computedScore.parts.reviewRag === 'A' ? 'bg-amber-500 text-white' :
                'bg-rose-500 text-white'
              ]"
            >
              {{ computedScore.parts.reviewRag }}
            </span>
          </div>
        </div>

        <!-- Metrics Part -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] space-y-1">
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Part 2: Metrics
          </span>
          <div class="flex items-center justify-between">
            <span class="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
              {{ computedScore.parts?.metrics !== null && computedScore.parts?.metrics !== undefined ? computedScore.parts.metrics.toFixed(2) : '—' }}
            </span>
            <span
              v-if="computedScore.parts?.metricsRag"
              :class="[
                'px-2 py-0.5 text-[10px] font-black rounded-full',
                computedScore.parts.metricsRag === 'G' ? 'bg-emerald-500 text-white' :
                computedScore.parts.metricsRag === 'A' ? 'bg-amber-500 text-white' :
                'bg-rose-500 text-white'
              ]"
            >
              {{ computedScore.parts.metricsRag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Scored Items Progress Meter -->
      <div class="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654]">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-600 dark:text-slate-400">Scored Criteria</span>
          <span class="font-bold text-slate-800 dark:text-slate-200">
            {{ computedScore.scoredItems }} / {{ computedScore.totalItems }}
          </span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            class="bg-[#005386] dark:bg-[#38bdf8] h-full transition-all duration-300"
            :style="{ width: `${computedScore.totalItems ? (computedScore.scoredItems / computedScore.totalItems) * 100 : 0}%` }"
          ></div>
        </div>
      </div>

      <!-- Category Breakdown List -->
      <div class="space-y-1.5 pt-1">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Categories Breakdown
        </span>
        <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
          <div
            v-for="(catData, catId) in computedScore.categories"
            :key="catId"
            class="flex items-center justify-between py-1 px-2 rounded-lg text-xs bg-slate-50/70 dark:bg-[#071524]/70 border border-slate-100 dark:border-[#1b3654]/60"
          >
            <span class="text-slate-700 dark:text-slate-300 capitalize truncate max-w-[150px]">
              {{ formatCategoryName(String(catId)) }}
            </span>
            <div class="flex items-center space-x-1.5 shrink-0">
              <span class="font-mono font-semibold text-slate-600 dark:text-slate-400">
                {{ catData.value !== null ? catData.value.toFixed(2) : '—' }}
              </span>
              <span
                v-if="catData.rag"
                :class="[
                  'w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white',
                  catData.rag === 'G' ? 'bg-emerald-500' :
                  catData.rag === 'A' ? 'bg-amber-500' :
                  'bg-rose-500'
                ]"
              >
                {{ catData.rag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="pt-3 border-t border-slate-100 dark:border-[#1b3654] space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <span class="font-bold uppercase tracking-wider text-[10px]">Score Thresholds</span>
        <div class="grid grid-cols-3 gap-1">
          <div class="flex items-center space-x-1">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>G &ge; {{ scoringSettings.sweGreenFrom.toFixed(1) }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>A &ge; {{ scoringSettings.sweAmberFrom.toFixed(1) }}</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>R &lt; {{ scoringSettings.sweAmberFrom.toFixed(1) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ORS SUMMARY SECTION -->
    <div v-else class="space-y-4">
      <!-- Overall Status Hero Box -->
      <div
        :class="[
          'p-4 rounded-xl border flex items-center justify-between transition-all',
          computedScore.overallRag === 'G' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' :
          computedScore.overallRag === 'A' ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300' :
          computedScore.overallRag === 'R' ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300' :
          'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-400'
        ]"
      >
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider opacity-75">
            Optimizer Status
          </span>
          <div class="text-xl font-black mt-0.5 tracking-tight flex items-center space-x-2">
            <span>{{ computedScore.overallRag ? `Status ${computedScore.overallRag}` : 'Not assessed' }}</span>
          </div>
          <p class="text-[11px] mt-0.5 opacity-80" v-if="computedScore.orsPoints !== null && computedScore.orsPoints !== undefined">
            Points: <strong>{{ computedScore.orsPoints }} / {{ computedScore.orsApplicable }}</strong> applicable
          </p>
        </div>

        <div class="text-right">
          <div class="text-2xl font-black font-mono">
            {{ computedScore.overallValue !== null ? computedScore.overallValue.toFixed(1) + '/10' : '—' }}
          </div>
          <span
            v-if="computedScore.overallRag"
            :class="[
              'inline-block px-2.5 py-0.5 text-xs font-black rounded-full border',
              computedScore.overallRag === 'G' ? 'bg-emerald-600 text-white border-emerald-700' :
              computedScore.overallRag === 'A' ? 'bg-amber-500 text-white border-amber-600' :
              'bg-rose-600 text-white border-rose-700'
            ]"
          >
            {{ computedScore.overallRag }}
          </span>
        </div>
      </div>

      <!-- Coexistence Alert (if overall status is R but score >= 7) -->
      <div
        v-if="computedScore.overallRag === 'R' && computedScore.overallValue !== null && computedScore.overallValue >= 7"
        class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start space-x-2 text-xs text-amber-800 dark:text-amber-200"
      >
        <AlertTriangle class="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <p class="leading-relaxed">
          <strong>Notice:</strong> A high score can coexist with a Red status. In ORS, any category in Red dictates the overall status.
        </p>
      </div>

      <!-- Scored Criteria Count -->
      <div class="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654]">
        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-600 dark:text-slate-400">Assessed Items</span>
          <span class="font-bold text-slate-800 dark:text-slate-200">
            {{ computedScore.scoredItems }} / {{ computedScore.totalItems }}
          </span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            class="bg-[#005386] dark:bg-[#38bdf8] h-full transition-all duration-300"
            :style="{ width: `${computedScore.totalItems ? (computedScore.scoredItems / computedScore.totalItems) * 100 : 0}%` }"
          ></div>
        </div>
      </div>

      <!-- ORS 4 Categories Breakdown Table -->
      <div class="space-y-1.5 pt-1">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Categories Status
        </span>
        <div class="space-y-1.5">
          <div
            v-for="(label, key) in orsCategoryNames"
            :key="key"
            class="flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs bg-slate-50/70 dark:bg-[#071524]/70 border border-slate-100 dark:border-[#1b3654]/60"
          >
            <span class="font-semibold text-slate-700 dark:text-slate-300">{{ label }}</span>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-slate-600 dark:text-slate-400">
                {{ formatOrsCatValue(computedScore.categories?.[key]?.value) }}
              </span>
              <span
                v-if="computedScore.categories?.[key]?.rag"
                :class="[
                  'px-2 py-0.5 text-[10px] font-bold rounded-full',
                  computedScore.categories[key].rag === 'G' ? 'bg-emerald-500 text-white' :
                  computedScore.categories[key].rag === 'A' ? 'bg-amber-500 text-white' :
                  'bg-rose-500 text-white'
                ]"
              >
                {{ computedScore.categories[key].rag }}
              </span>
              <span v-else class="text-[10px] text-slate-400 italic">n/a</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ORS Legend -->
      <div class="pt-3 border-t border-slate-100 dark:border-[#1b3654] space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <span class="font-bold uppercase tracking-wider text-[10px]">Evaluation Scale</span>
        <ul class="space-y-1">
          <li class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span><strong>Green</strong> – fine, no risks</span>
          </li>
          <li class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
            <span><strong>Amber</strong> – some trouble or considerable risk</span>
          </li>
          <li class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
            <span><strong>Red</strong> – serious trouble or huge risk</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ScorecardComputed,
  ScorecardTemplateId,
  ScoringSettings
} from '../../types';
import { Activity, AlertTriangle } from 'lucide-vue-next';

defineProps<{
  templateId: ScorecardTemplateId;
  computedScore: ScorecardComputed;
  scoringSettings: ScoringSettings;
}>();

const orsCategoryNames: Record<string, string> = {
  process: 'Process (4 items)',
  content: 'Content (4 items)',
  data_quality: 'Data Quality (1 item)',
  interaction: 'Interaction (1 item)',
};

const formatCategoryName = (id: string): string => {
  return id.replace(/_/g, ' ');
};

const formatOrsCatValue = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return 'n/a';
  return val.toFixed(2);
};
</script>
