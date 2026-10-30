<template>
  <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1b3654]">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Category Health Heatmap
        </h3>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Temporal breakdown across categories. Green = good, Amber = warning, Red = critical trouble, Grey = unrecorded.
        </p>
      </div>

      <!-- Quick Legend -->
      <div class="flex items-center space-x-2 text-[10px] font-bold">
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded bg-emerald-600"></span><span class="text-slate-600 dark:text-slate-400">G</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded bg-amber-500"></span><span class="text-slate-600 dark:text-slate-400">A</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded bg-rose-600"></span><span class="text-slate-600 dark:text-slate-400">R</span></span>
        <span class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700"></span><span class="text-slate-400">N/A</span></span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="periods.length === 0" class="py-12 text-center text-xs text-slate-400">
      No periods available to display heatmap.
    </div>

    <!-- Heatmap Matrix Scroll Container -->
    <div v-else class="overflow-x-auto border border-slate-200/80 dark:border-[#1b3654] rounded-xl">
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-50 dark:bg-[#071524] border-b border-slate-200 dark:border-[#1b3654]">
            <th class="sticky left-0 z-20 bg-slate-50 dark:bg-[#071524] py-2 px-3 font-bold text-slate-700 dark:text-slate-300 min-w-[200px] border-r border-slate-200 dark:border-[#1b3654] text-[11px]">
              Category
            </th>
            <th
              v-for="p in periods"
              :key="p.periodKey"
              class="py-2 px-1 text-center min-w-[36px] max-w-[44px] text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 border-r border-slate-100 dark:border-[#1b3654]/50"
            >
              {{ formatWeekNumber(p.periodLabel) }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-[#1b3654]">
          <tr v-for="cat in categories" :key="cat.id" class="hover:bg-slate-50/50 dark:hover:bg-[#0e243d]/40">
            <!-- Category Title (Sticky) -->
            <td class="sticky left-0 z-10 bg-white dark:bg-[#0f2238] py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-[#1b3654] truncate max-w-[220px]">
              <span class="text-[11px]">{{ cat.no ? `${cat.no}. ` : '' }}{{ cat.name }}</span>
            </td>

            <!-- Heatmap Cells -->
            <td
              v-for="p in periods"
              :key="p.periodKey"
              class="p-1 text-center border-r border-slate-100 dark:border-[#1b3654]/40"
            >
              <div
                @click="onCellClick(p.periodKey)"
                :title="getCellTooltip(cat, p.periodKey, p.periodLabel)"
                :class="[
                  'w-7 h-7 mx-auto rounded text-[10px] font-black flex items-center justify-center transition-all select-none',
                  getCellClass(cat.id, p.periodKey),
                  hasScorecard(p.periodKey) ? 'cursor-pointer hover:scale-115 hover:shadow-sm' : 'cursor-default opacity-40'
                ]"
              >
                {{ getCellLabel(cat.id, p.periodKey) }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Scorecard, ScorecardTemplateId } from '../../types';
import { SCORECARD_TEMPLATES } from '../../scoring/templates';

const props = defineProps<{
  templateId: ScorecardTemplateId;
  periods: { periodKey: string; periodLabel: string }[];
  scorecardsMap: Record<string, Scorecard>;
}>();

const emit = defineEmits<{
  (e: 'openDetail', id: string): void;
}>();

const categories = computed(() => {
  const tmpl = SCORECARD_TEMPLATES[props.templateId];
  return tmpl?.categories || [];
});

const formatWeekNumber = (label: string) => {
  const m = label.match(/Week\s*(\d+)/i);
  return m ? `W${m[1]}` : label;
};

const hasScorecard = (periodKey: string) => {
  return !!props.scorecardsMap[periodKey];
};

const getCellData = (catId: string, periodKey: string) => {
  const sc = props.scorecardsMap[periodKey];
  if (!sc) return null;
  const catScore = sc.computed?.categories?.[catId];
  return {
    sc,
    rag: catScore?.rag || null,
    val: catScore?.value ?? null,
  };
};

const getCellLabel = (catId: string, periodKey: string): string => {
  const data = getCellData(catId, periodKey);
  if (!data || !data.rag) return '—';
  return data.rag;
};

const getCellClass = (catId: string, periodKey: string): string => {
  const data = getCellData(catId, periodKey);
  if (!data || !data.rag) {
    return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
  }
  if (data.rag === 'G') return 'bg-emerald-600 text-white';
  if (data.rag === 'A') return 'bg-amber-500 text-white';
  if (data.rag === 'R') return 'bg-rose-600 text-white';
  return 'bg-slate-200 dark:bg-slate-700 text-slate-500';
};

const getCellTooltip = (cat: any, periodKey: string, periodLabel: string): string => {
  const data = getCellData(cat.id, periodKey);
  if (!data) return `${periodLabel}: No scorecard submitted`;
  const scoreStr = data.val !== null ? ` (score: ${data.val.toFixed(2)})` : '';
  return `${cat.name} • ${periodLabel}\nRating: ${data.rag || 'Not Scored'}${scoreStr}\nAssessor: ${data.sc.assessor || '—'}`;
};

const onCellClick = (periodKey: string) => {
  const sc = props.scorecardsMap[periodKey];
  if (sc?.id) {
    emit('openDetail', sc.id);
  }
};
</script>
