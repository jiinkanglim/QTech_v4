<template>
  <div class="space-y-4 pb-8 max-w-7xl mx-auto">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <button
          type="button"
          @click="$emit('back')"
          class="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005386] dark:hover:text-[#38bdf8] mb-1.5 cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono text-[10px] font-bold uppercase tracking-wider">
            Quality Trend Matrix
          </span>
          <span class="text-slate-500 dark:text-slate-400 text-xs">
            • {{ project?.name || projectId }}
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Scorecard Period Comparison
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
          Side-by-side progression for {{ template?.name }} ({{ templateId === 'SWE_MODEL' ? 'Software Expert' : 'ORS Optimizer' }}).
        </p>
      </div>

      <!-- Quick Selector / Role Toggle if project has both -->
      <div class="flex items-center space-x-2">
        <span class="text-xs font-semibold text-slate-500">Showing {{ selectedPeriods.length }} of {{ availableScorecards.length }} Periods</span>
      </div>
    </div>

    <!-- Period Selection Toolbar -->
    <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Select Periods to Compare (Max 6):
        </label>
        <span class="text-[11px] text-slate-400">
          {{ selectedPeriodIds.length }}/6 Selected
        </span>
      </div>

      <!-- Period Selection Pills -->
      <div class="flex flex-wrap gap-2 pt-1">
        <button
          v-for="sc in availableScorecards"
          :key="sc.id"
          type="button"
          @click="togglePeriod(sc.id)"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5',
            selectedPeriodIds.includes(sc.id)
              ? 'bg-[#005386] text-white border-[#005386] shadow-xs'
              : 'bg-slate-50 dark:bg-[#071524] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#1b3654] hover:bg-slate-100 dark:hover:bg-[#0e243d]'
          ]"
        >
          <span>{{ sc.periodLabel }}</span>
          <span
            v-if="sc.computed?.overallRag"
            :class="[
              'w-2 h-2 rounded-full',
              sc.computed.overallRag === 'G' ? 'bg-emerald-400' :
              sc.computed.overallRag === 'A' ? 'bg-amber-400' : 'bg-rose-400'
            ]"
          ></span>
        </button>

        <span v-if="availableScorecards.length === 0" class="text-xs text-slate-400 py-1">
          No submitted or saved scorecards found for this project & role.
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-[#0f2238] p-12 rounded-2xl border border-slate-200 dark:border-[#1b3654] text-center">
      <Loader2 class="w-8 h-8 animate-spin mx-auto text-[#005386] dark:text-[#38bdf8]" />
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading comparison matrix...</p>
    </div>

    <!-- Empty Selection State -->
    <div
      v-else-if="selectedPeriods.length === 0"
      class="bg-white dark:bg-[#0f2238] p-12 rounded-2xl border border-slate-200 dark:border-[#1b3654] text-center space-y-2"
    >
      <AlertCircle class="w-8 h-8 mx-auto text-amber-500" />
      <h3 class="text-base font-bold text-slate-900 dark:text-white">No periods selected</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">Select at least one period above to view the criteria matrix.</p>
    </div>

    <!-- Matrix Comparison Table -->
    <div v-else class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden">
      <!-- Horizontal Scrollable Container -->
      <div class="overflow-x-auto max-w-full">
        <table class="w-full text-left text-xs border-collapse">
          <!-- Table Header -->
          <thead>
            <tr class="bg-slate-50 dark:bg-[#071524] border-b border-slate-200 dark:border-[#1b3654]">
              <!-- Sticky First Column: Criteria -->
              <th class="sticky left-0 z-30 bg-slate-50 dark:bg-[#071524] py-3.5 px-4 font-bold text-slate-700 dark:text-slate-200 min-w-[280px] sm:min-w-[340px] border-r border-slate-200 dark:border-[#1b3654] shadow-xs">
                Criteria / Evaluation Area
              </th>

              <!-- Period Columns -->
              <th
                v-for="sc in selectedPeriods"
                :key="sc.id"
                class="py-3 px-3 text-center min-w-[120px] sm:min-w-[140px] border-r border-slate-200/70 dark:border-[#1b3654]/70"
              >
                <div
                  @click="$emit('openDetail', sc.id)"
                  class="cursor-pointer group hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                >
                  <div class="font-bold text-slate-900 dark:text-white group-hover:underline">
                    {{ sc.periodLabel }}
                  </div>
                  <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                    {{ sc.assessmentDate || '—' }}
                  </div>
                  <div class="text-[10px] text-slate-500 truncate mt-0.5">
                    {{ sc.assessor || '—' }}
                  </div>
                </div>
              </th>

              <!-- Trend Column -->
              <th class="py-3 px-4 text-center min-w-[100px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100/60 dark:bg-[#091a2d]">
                Trend
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-[#1b3654]">
            <!-- Row: Overall Summary -->
            <tr class="bg-slate-100/70 dark:bg-[#0a1e33] font-bold text-slate-900 dark:text-white">
              <td class="sticky left-0 z-20 bg-slate-100/90 dark:bg-[#0a1e33] py-3 px-4 border-r border-slate-200 dark:border-[#1b3654]">
                <div class="flex items-center space-x-2">
                  <Activity class="w-4 h-4 text-[#005386] dark:text-[#38bdf8]" />
                  <span class="text-xs uppercase tracking-wider">Overall Evaluation</span>
                </div>
              </td>

              <!-- Overall Cells -->
              <td
                v-for="sc in selectedPeriods"
                :key="sc.id"
                class="py-3 px-3 text-center border-r border-slate-200/70 dark:border-[#1b3654]/70"
              >
                <div class="inline-flex items-center space-x-1.5">
                  <span
                    v-if="sc.computed?.overallRag"
                    :class="[
                      'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white',
                      sc.computed.overallRag === 'G' ? 'bg-emerald-600' :
                      sc.computed.overallRag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
                    ]"
                  >
                    {{ sc.computed.overallRag }}
                  </span>
                  <span class="font-mono">{{ formatOverall(sc) }}</span>
                </div>
              </td>

              <!-- Overall Trend -->
              <td class="py-3 px-4 text-center font-bold font-mono text-sm bg-slate-100/40 dark:bg-[#091a2d]/40">
                <span
                  v-if="overallTrend !== null"
                  :class="[
                    overallTrend > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                    overallTrend < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                  ]"
                >
                  {{ overallTrend > 0 ? '↑' : overallTrend < 0 ? '↓' : '→' }}
                </span>
                <span v-else class="text-slate-300">—</span>
              </td>
            </tr>

            <!-- Category & Item Rows -->
            <template v-for="cat in template?.categories || []" :key="cat.id">
              <!-- Category Header Row -->
              <tr class="bg-slate-50/50 dark:bg-[#071524]/60 font-bold border-t border-slate-200 dark:border-[#1b3654]">
                <td class="sticky left-0 z-20 bg-slate-50/95 dark:bg-[#071524] py-2.5 px-4 border-r border-slate-200 dark:border-[#1b3654] text-slate-800 dark:text-slate-200">
                  <div class="flex items-center justify-between">
                    <span>{{ cat.no }}. {{ cat.name }}</span>
                    <span v-if="cat.part" class="text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300 font-normal">
                      {{ cat.part }}
                    </span>
                  </div>
                </td>

                <!-- Category Score per period -->
                <td
                  v-for="sc in selectedPeriods"
                  :key="sc.id"
                  class="py-2.5 px-3 text-center border-r border-slate-200/70 dark:border-[#1b3654]/70"
                >
                  <div class="inline-flex items-center space-x-1 font-mono text-[11px]">
                    <span>{{ formatCategoryScore(sc.computed?.categories?.[cat.id]?.value) }}</span>
                    <span
                      v-if="sc.computed?.categories?.[cat.id]?.rag"
                      :class="[
                        'w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white',
                        sc.computed.categories[cat.id].rag === 'G' ? 'bg-emerald-600' :
                        sc.computed.categories[cat.id].rag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
                      ]"
                    >
                      {{ sc.computed.categories[cat.id].rag }}
                    </span>
                  </div>
                </td>

                <!-- Category Trend -->
                <td class="py-2.5 px-4 text-center font-bold font-mono text-xs bg-slate-50/30 dark:bg-[#091a2d]/30">
                  {{ computeCategoryTrend(cat.id) }}
                </td>
              </tr>

              <!-- Items under this Category -->
              <tr
                v-for="item in cat.items"
                :key="item.id"
                class="hover:bg-slate-50/70 dark:hover:bg-[#0e243d]/40 transition-colors"
              >
                <!-- Sticky Item Name -->
                <td class="sticky left-0 z-20 bg-white dark:bg-[#0f2238] py-2 px-4 pl-8 border-r border-slate-200 dark:border-[#1b3654]">
                  <div class="font-medium text-slate-800 dark:text-slate-200 text-xs">
                    {{ item.name }}
                  </div>
                  <div class="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {{ item.description }}
                  </div>
                </td>

                <!-- Item Score Cell with remarks tooltip -->
                <td
                  v-for="sc in selectedPeriods"
                  :key="sc.id"
                  class="py-2 px-3 text-center border-r border-slate-200/70 dark:border-[#1b3654]/70"
                >
                  <div class="flex items-center justify-center">
                    <span
                      :title="getItemTooltip(sc, item.id)"
                      :class="[
                        'w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center transition-transform hover:scale-110 cursor-help select-none',
                        getItemClass(sc, item.id)
                      ]"
                    >
                      {{ getItemDisplay(sc, item.id) }}
                    </span>
                  </div>
                </td>

                <!-- Item Trend -->
                <td class="py-2 px-4 text-center font-bold font-mono text-xs">
                  <span
                    :class="[
                      getItemTrend(item.id) === '↑' ? 'text-emerald-600 dark:text-emerald-400' :
                      getItemTrend(item.id) === '↓' ? 'text-rose-600 dark:text-rose-400' :
                      'text-slate-400'
                    ]"
                  >
                    {{ getItemTrend(item.id) }}
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Scorecard, ScorecardTemplateId } from '../../types';
import { useProjects } from '../../composables/useProjects';
import { useScorecards } from '../../composables/useScorecards';
import { SCORECARD_TEMPLATES } from '../../scoring/templates';
import { comparePeriods } from '../../scoring/period';
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  Loader2,
} from 'lucide-vue-next';

const props = defineProps<{
  projectId: string;
  templateId: ScorecardTemplateId;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'openDetail', id: string): void;
}>();

const { projects } = useProjects();
const { fetchScorecards, loading } = useScorecards();

const allScorecards = ref<Scorecard[]>([]);
const selectedPeriodIds = ref<string[]>([]);

const project = computed(() => projects.value.find((p) => p.id === props.projectId));
const template = computed(() => SCORECARD_TEMPLATES[props.templateId] || null);

const loadScorecards = async () => {
  try {
    const list = await fetchScorecards({
      projectId: props.projectId,
      templateId: props.templateId,
    });
    // Sort chronologically ascending
    list.sort((a, b) =>
      comparePeriods({ year: a.periodYear, week: a.periodWeek }, { year: b.periodYear, week: b.periodWeek })
    );
    allScorecards.value = list;

    // Default: Pick up to last 6 submitted (or available)
    const submitted = list.filter((s) => s.status === 'submitted');
    const defaultSelection = (submitted.length > 0 ? submitted : list).slice(-6);
    selectedPeriodIds.value = defaultSelection.map((s) => s.id);
  } catch (err) {
    console.error('Failed to load scorecards for comparison:', err);
  }
};

watch(
  () => [props.projectId, props.templateId],
  () => {
    loadScorecards();
  },
  { immediate: true }
);

const availableScorecards = computed(() => allScorecards.value);

const selectedPeriods = computed(() => {
  return allScorecards.value.filter((sc) => selectedPeriodIds.value.includes(sc.id));
});

const togglePeriod = (id: string) => {
  if (selectedPeriodIds.value.includes(id)) {
    selectedPeriodIds.value = selectedPeriodIds.value.filter((pid) => pid !== id);
  } else {
    if (selectedPeriodIds.value.length < 6) {
      selectedPeriodIds.value.push(id);
    }
  }
};

const formatOverall = (sc: Scorecard): string => {
  if (sc.computed?.overallValue === null || sc.computed?.overallValue === undefined) return '—';
  if (sc.templateId === 'SWE_MODEL') {
    return sc.computed.overallValue.toFixed(2);
  }
  return `${sc.computed.overallValue.toFixed(1)}/10`;
};

const formatCategoryScore = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  return val.toFixed(2);
};

const overallTrend = computed(() => {
  if (selectedPeriods.value.length < 2) return null;
  const first = selectedPeriods.value[0];
  const last = selectedPeriods.value[selectedPeriods.value.length - 1];
  const firstPct = first.computed?.normalizedPct ?? null;
  const lastPct = last.computed?.normalizedPct ?? null;
  if (firstPct === null || lastPct === null) return null;
  return lastPct - firstPct;
});

const computeCategoryTrend = (catId: string): string => {
  if (selectedPeriods.value.length < 2) return '—';
  const first = selectedPeriods.value[0].computed?.categories?.[catId]?.value;
  const last = selectedPeriods.value[selectedPeriods.value.length - 1].computed?.categories?.[catId]?.value;
  if (first === null || first === undefined || last === null || last === undefined) return '—';
  if (last > first + 0.01) return '↑';
  if (last < first - 0.01) return '↓';
  return '→';
};

const getItemEntry = (sc: Scorecard, itemId: string) => {
  return sc.items.find((i) => i.itemId === itemId);
};

const getItemDisplay = (sc: Scorecard, itemId: string): string => {
  const entry = getItemEntry(sc, itemId);
  if (!entry || !entry.value) return '—';
  return entry.value === 'NA' ? 'NA' : entry.value;
};

const getItemClass = (sc: Scorecard, itemId: string): string => {
  const entry = getItemEntry(sc, itemId);
  if (!entry || !entry.value) {
    return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
  }
  if (entry.value === 'G') return 'bg-emerald-600 text-white shadow-xs';
  if (entry.value === 'A') return 'bg-amber-500 text-white shadow-xs';
  if (entry.value === 'R') return 'bg-rose-600 text-white shadow-xs';
  return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
};

const getItemTooltip = (sc: Scorecard, itemId: string): string => {
  const entry = getItemEntry(sc, itemId);
  const val = entry?.value === 'NA' ? 'N/A' : (entry?.value || 'Unscored');
  const remarks = entry?.remarks ? `\nRemarks: "${entry.remarks}"` : '\nNo remarks';
  return `${sc.periodLabel}: ${val}${remarks}`;
};

const rankValue = (val: string | null | undefined): number => {
  if (val === 'G') return 3;
  if (val === 'A') return 2;
  if (val === 'R') return 1;
  return 0;
};

const getItemTrend = (itemId: string): string => {
  if (selectedPeriods.value.length < 2) return '—';
  const first = getItemEntry(selectedPeriods.value[0], itemId)?.value;
  const last = getItemEntry(selectedPeriods.value[selectedPeriods.value.length - 1], itemId)?.value;
  if (!first || !last || first === 'NA' || last === 'NA') return '—';
  const rFirst = rankValue(first);
  const rLast = rankValue(last);
  if (rLast > rFirst) return '↑';
  if (rLast < rFirst) return '↓';
  return '→';
};
</script>
