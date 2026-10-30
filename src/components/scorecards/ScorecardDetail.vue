<template>
  <div class="space-y-4 pb-8 max-w-5xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading && !scorecard" class="bg-white dark:bg-[#0f2238] p-12 rounded-2xl border border-slate-200 dark:border-[#1b3654] text-center">
      <Loader2 class="w-8 h-8 animate-spin mx-auto text-[#005386] dark:text-[#38bdf8]" />
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading scorecard details...</p>
    </div>

    <!-- Error / Not Found State -->
    <div v-else-if="!scorecard" class="bg-white dark:bg-[#0f2238] p-12 rounded-2xl border border-slate-200 dark:border-[#1b3654] text-center space-y-3">
      <AlertTriangle class="w-8 h-8 mx-auto text-amber-500" />
      <h3 class="text-base font-bold text-slate-900 dark:text-white">Scorecard not found</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">The requested quality scorecard could not be retrieved.</p>
      <button
        type="button"
        @click="$emit('back')"
        class="px-4 py-2 rounded-xl bg-[#005386] text-white text-xs font-semibold cursor-pointer"
      >
        Back to Register
      </button>
    </div>

    <!-- Scorecard Content -->
    <template v-else>
      <!-- Top Action Bar & Navigation -->
      <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            @click="$emit('back')"
            class="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#005386] dark:hover:text-[#38bdf8] cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4" />
            <span>Back to Register</span>
          </button>

          <div class="flex items-center space-x-2 shrink-0">
            <!-- Previous / Next Period Navigation for same project + role -->
            <button
              type="button"
              :disabled="!prevScorecard"
              @click="prevScorecard && $emit('navigateScorecard', prevScorecard.id)"
              :title="prevScorecard ? `Previous: ${prevScorecard.periodLabel}` : 'No previous period'"
              :class="[
                'flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors',
                prevScorecard
                  ? 'bg-slate-50 dark:bg-[#071524] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1b3654] hover:bg-slate-100 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed border-slate-200 dark:border-[#1b3654] text-slate-400'
              ]"
            >
              <ChevronLeft class="w-4 h-4" />
              <span class="hidden sm:inline">Previous</span>
            </button>

            <button
              type="button"
              :disabled="!nextScorecard"
              @click="nextScorecard && $emit('navigateScorecard', nextScorecard.id)"
              :title="nextScorecard ? `Next: ${nextScorecard.periodLabel}` : 'No newer period'"
              :class="[
                'flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors',
                nextScorecard
                  ? 'bg-slate-50 dark:bg-[#071524] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[#1b3654] hover:bg-slate-100 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed border-slate-200 dark:border-[#1b3654] text-slate-400'
              ]"
            >
              <span class="hidden sm:inline">Next</span>
              <ChevronRight class="w-4 h-4" />
            </button>

            <!-- Compare Button -->
            <button
              type="button"
              @click="$emit('compare', scorecard.projectId, scorecard.templateId)"
              class="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold hover:bg-purple-100 cursor-pointer"
            >
              <BarChart3 class="w-3.5 h-3.5" />
              <span>Compare…</span>
            </button>

            <!-- Edit Button -->
            <button
              type="button"
              @click="$emit('edit', scorecard.id)"
              class="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#005386] hover:bg-[#004169] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        <!-- Header Metadata Details -->
        <div class="pt-3 border-t border-slate-100 dark:border-[#1b3654] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Project</span>
            <div class="font-bold text-slate-900 dark:text-white text-sm">
              {{ project?.name || scorecard.projectId }}
            </div>
            <div class="text-[11px] text-slate-500 font-mono">{{ project?.code }} • {{ project?.product }}</div>
          </div>

          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role & Period</span>
            <div class="font-bold text-slate-900 dark:text-white text-sm">
              {{ scorecard.templateId === 'SWE_MODEL' ? 'Lead Software Expert (SWE)' : 'ORS Optimizer Scientist' }}
            </div>
            <div class="text-[11px] text-[#005386] dark:text-[#38bdf8] font-semibold">
              {{ scorecard.periodLabel }}
            </div>
          </div>

          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assessor & Date</span>
            <div class="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              {{ scorecard.assessor || '—' }}
            </div>
            <div class="text-[11px] text-slate-500 font-mono">
              {{ scorecard.assessmentDate || '—' }}
            </div>
          </div>

          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
            <div class="flex items-center space-x-2 mt-0.5">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  scorecard.status === 'submitted'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                ]"
              >
                {{ scorecard.status }}
              </span>
              <span v-if="scorecard.header?.phase" class="text-[11px] font-medium text-slate-500">
                Phase: {{ scorecard.header.phase }}
              </span>
            </div>
            <span v-if="scorecard.header?.modelVersion" class="text-[10px] text-slate-400 font-mono block mt-0.5">
              Model: {{ scorecard.header.modelVersion }}
            </span>
          </div>
        </div>

        <!-- Optional Comments Block -->
        <div
          v-if="scorecard.header?.projectComment || scorecard.header?.modelComment"
          class="p-3 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] text-xs space-y-1.5"
        >
          <div v-if="scorecard.header.projectComment">
            <span class="font-bold text-slate-700 dark:text-slate-300">Project Comments: </span>
            <span class="text-slate-600 dark:text-slate-400">{{ scorecard.header.projectComment }}</span>
          </div>
          <div v-if="scorecard.header.modelComment">
            <span class="font-bold text-slate-700 dark:text-slate-300">Model / Optimizer Comments: </span>
            <span class="text-slate-600 dark:text-slate-400">{{ scorecard.header.modelComment }}</span>
          </div>
        </div>
      </div>

      <!-- Evaluation Summary Panel -->
      <ScoreSummaryPanel
        :templateId="scorecard.templateId"
        :computedScore="scorecard.computed"
        :scoringSettings="scoringSettings"
      />

      <!-- Changes Since Previous Period Block -->
      <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
        <div class="flex items-center space-x-2">
          <GitCompare class="w-4 h-4 text-[#005386] dark:text-[#38bdf8]" />
          <h2 class="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
            Changes Since {{ prevScorecard ? prevScorecard.periodLabel : 'Previous Period' }}
          </h2>
        </div>

        <div v-if="!prevScorecard" class="text-xs text-slate-500 dark:text-slate-400 italic py-2">
          This is the initial scorecard recorded for this project and role (no previous period to compare).
        </div>

        <div v-else-if="changedItems.length === 0 && changedCategories.length === 0" class="text-xs text-slate-500 dark:text-slate-400 py-2">
          No item score or category rating changes detected compared to {{ prevScorecard.periodLabel }}.
        </div>

        <div v-else class="space-y-3">
          <!-- Category RAG Changes -->
          <div v-if="changedCategories.length > 0" class="space-y-1.5">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category Status Changes</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                v-for="cat in changedCategories"
                :key="cat.name"
                class="p-2.5 rounded-lg bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] flex items-center justify-between text-xs"
              >
                <span class="font-semibold text-slate-800 dark:text-slate-200">{{ cat.name }}</span>
                <div class="flex items-center space-x-1.5 font-bold font-mono">
                  <span :class="ragTextClass(cat.prevRag)">{{ cat.prevRag || '—' }}</span>
                  <ArrowRight class="w-3 h-3 text-slate-400" />
                  <span :class="ragTextClass(cat.currRag)">{{ cat.currRag || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Item Value Changes -->
          <div v-if="changedItems.length > 0" class="space-y-1.5">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Rating Changes</span>
            <div class="divide-y divide-slate-100 dark:divide-[#1b3654] border border-slate-200/80 dark:border-[#1b3654] rounded-xl overflow-hidden">
              <div
                v-for="item in changedItems"
                :key="item.itemId"
                class="p-3 bg-slate-50/50 dark:bg-[#071524]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span class="text-[10px] text-slate-400 font-semibold block uppercase">{{ item.categoryName }}</span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ item.name }}</span>
                  <p v-if="item.remarks" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    "{{ item.remarks }}"
                  </p>
                </div>

                <div class="flex items-center space-x-2 shrink-0">
                  <span :class="['w-6 h-6 rounded text-xs font-black flex items-center justify-center text-white', ragBgClass(item.prevVal)]">
                    {{ item.prevVal || '—' }}
                  </span>
                  <ArrowRight class="w-3.5 h-3.5 text-slate-400" />
                  <span :class="['w-6 h-6 rounded text-xs font-black flex items-center justify-center text-white', ragBgClass(item.currVal)]">
                    {{ item.currVal || '—' }}
                  </span>
                  <span
                    v-if="item.isNewRed"
                    class="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black uppercase"
                  >
                    New Trouble
                  </span>
                  <span
                    v-else-if="item.isImproved"
                    class="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase"
                  >
                    Improved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Read-Only Detailed Breakdown -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-slate-900 dark:text-white text-base">
            Detailed Quality Criteria
          </h2>
          <!-- Toggle Only Red/Amber -->
          <label class="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="onlyRedAmber"
              class="rounded border-slate-300 dark:border-[#1b3654] text-[#005386] focus:ring-[#005386] cursor-pointer"
            />
            <span>Only Red/Amber Criteria</span>
          </label>
        </div>

        <div
          v-for="cat in visibleCategories"
          :key="cat.id"
          class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden"
        >
          <!-- Category Header -->
          <div class="p-4 bg-slate-50/80 dark:bg-[#071524]/80 border-b border-slate-200 dark:border-[#1b3654] flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-[#005386] dark:text-[#38bdf8]">
                  Category {{ cat.no }}
                </span>
                <span v-if="cat.part" class="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-mono text-slate-600 dark:text-slate-300">
                  {{ cat.part }}
                </span>
              </div>
              <h3 class="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                {{ cat.name }}
              </h3>
            </div>

            <!-- Category Score Badge -->
            <div v-if="scorecard.computed?.categories?.[cat.id]" class="flex items-center space-x-2">
              <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {{ formatCatScore(scorecard.computed.categories[cat.id]?.value) }}
              </span>
              <span
                v-if="scorecard.computed.categories[cat.id]?.rag"
                :class="[
                  'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white',
                  scorecard.computed.categories[cat.id]?.rag === 'G' ? 'bg-emerald-600' :
                  scorecard.computed.categories[cat.id]?.rag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
                ]"
              >
                {{ scorecard.computed.categories[cat.id]?.rag }}
              </span>
            </div>
          </div>

          <!-- Items in Category -->
          <div class="divide-y divide-slate-100 dark:divide-[#1b3654]">
            <div
              v-for="item in cat.visibleItems"
              :key="item.id"
              class="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div class="space-y-1">
                <h4 class="font-bold text-slate-900 dark:text-white text-xs">
                  {{ item.name }}
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {{ item.description }}
                </p>
                <div v-if="item.entry?.remarks" class="mt-2 p-2 rounded-lg bg-slate-50 dark:bg-[#071524] border border-slate-200/60 dark:border-[#1b3654] text-[11px] text-slate-700 dark:text-slate-300">
                  <span class="font-bold text-slate-500">Remarks: </span>{{ item.entry.remarks }}
                </div>
              </div>

              <!-- RAG Pill -->
              <div class="shrink-0 flex items-center space-x-1.5">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-black shadow-xs flex items-center space-x-1 border',
                    item.entry?.value === 'G' ? 'bg-emerald-600 text-white border-emerald-700' :
                    item.entry?.value === 'A' ? 'bg-amber-500 text-white border-amber-600' :
                    item.entry?.value === 'R' ? 'bg-rose-600 text-white border-rose-700' :
                    item.entry?.value === 'NA' ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600' :
                    'bg-slate-100 text-slate-400 border-slate-200'
                  ]"
                >
                  <span>{{ item.entry?.value === 'NA' ? 'N/A' : (item.entry?.value || '—') }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Scorecard, ScorecardTemplateId, ScoringSettings, TemplateCategory } from '../../types';
import { useProjects } from '../../composables/useProjects';
import { useScorecards } from '../../composables/useScorecards';
import { SCORECARD_TEMPLATES } from '../../scoring/templates';
import { comparePeriods } from '../../scoring/period';
import ScoreSummaryPanel from './ScoreSummaryPanel.vue';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Edit3,
  GitCompare,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from 'lucide-vue-next';

const props = defineProps<{
  scorecardId: string;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'edit', id: string): void;
  (e: 'compare', projectId: string, templateId: ScorecardTemplateId): void;
  (e: 'navigateScorecard', newId: string): void;
}>();

const { projects } = useProjects();
const { getScorecard, fetchScorecards, loading } = useScorecards();

const scorecard = ref<Scorecard | null>(null);
const allProjectScorecards = ref<Scorecard[]>([]);
const onlyRedAmber = ref(false);

const scoringSettings: ScoringSettings = {
  sweAmberFrom: 1.5,
  sweGreenFrom: 2.5,
  defaultCadence: 'weekly',
};

const project = computed(() => {
  if (!scorecard.value) return null;
  return projects.value.find((p) => p.id === scorecard.value!.projectId) || null;
});

const loadCurrentScorecard = async (id: string) => {
  try {
    const sc = await getScorecard(id);
    scorecard.value = sc;
    if (sc) {
      const list = await fetchScorecards({
        projectId: sc.projectId,
        templateId: sc.templateId,
      });
      // Sort chronologically ascending
      list.sort((a, b) =>
        comparePeriods({ year: a.periodYear, week: a.periodWeek }, { year: b.periodYear, week: b.periodWeek })
      );
      allProjectScorecards.value = list;
    }
  } catch (err) {
    console.error('Failed to load scorecard details:', err);
  }
};

watch(
  () => props.scorecardId,
  (newId) => {
    if (newId) loadCurrentScorecard(newId);
  },
  { immediate: true }
);

const currentIndex = computed(() => {
  if (!scorecard.value) return -1;
  return allProjectScorecards.value.findIndex((s) => s.id === scorecard.value!.id);
});

const prevScorecard = computed(() => {
  if (currentIndex.value > 0) {
    return allProjectScorecards.value[currentIndex.value - 1];
  }
  return null;
});

const nextScorecard = computed(() => {
  if (currentIndex.value >= 0 && currentIndex.value < allProjectScorecards.value.length - 1) {
    return allProjectScorecards.value[currentIndex.value + 1];
  }
  return null;
});

// Calculate changed items and categories vs prevScorecard
const template = computed(() => {
  if (!scorecard.value) return null;
  return SCORECARD_TEMPLATES[scorecard.value.templateId] || null;
});

const changedCategories = computed(() => {
  if (!scorecard.value || !prevScorecard.value || !template.value) return [];
  const list: { name: string; prevRag: string; currRag: string }[] = [];
  for (const cat of template.value.categories) {
    const prevRag = prevScorecard.value.computed?.categories?.[cat.id]?.rag || null;
    const currRag = scorecard.value.computed?.categories?.[cat.id]?.rag || null;
    if (prevRag !== currRag) {
      list.push({
        name: cat.name,
        prevRag: prevRag || 'None',
        currRag: currRag || 'None',
      });
    }
  }
  return list;
});

const changedItems = computed(() => {
  if (!scorecard.value || !prevScorecard.value || !template.value) return [];
  const list: any[] = [];

  const currMap = new Map(scorecard.value.items.map((i) => [i.itemId, i]));
  const prevMap = new Map(prevScorecard.value.items.map((i) => [i.itemId, i]));

  for (const cat of template.value.categories) {
    for (const item of cat.items) {
      const c = currMap.get(item.id);
      const p = prevMap.get(item.id);
      const cVal = c?.value || null;
      const pVal = p?.value || null;

      if (cVal !== pVal) {
        const isNewRed = cVal === 'R' && pVal !== 'R';
        const isImproved = cVal === 'G' || (pVal === 'R' && cVal === 'A');
        list.push({
          itemId: item.id,
          name: item.name,
          categoryName: cat.name,
          prevVal: pVal,
          currVal: cVal,
          remarks: c?.remarks || '',
          isNewRed,
          isImproved,
        });
      }
    }
  }

  // New Red items first, then degraded, then improved
  return list.sort((a, b) => {
    if (a.isNewRed && !b.isNewRed) return -1;
    if (!a.isNewRed && b.isNewRed) return 1;
    if (a.isImproved && !b.isImproved) return 1;
    if (!a.isImproved && b.isImproved) return -1;
    return a.name.localeCompare(b.name);
  });
});

const visibleCategories = computed(() => {
  if (!scorecard.value || !template.value) return [];
  const itemMap = new Map(scorecard.value.items.map((i) => [i.itemId, i]));

  return template.value.categories
    .map((cat) => {
      const allItems = cat.items.map((item) => ({
        ...item,
        entry: itemMap.get(item.id),
      }));

      const visibleItems = onlyRedAmber.value
        ? allItems.filter((i) => i.entry?.value === 'R' || i.entry?.value === 'A')
        : allItems;

      return {
        ...cat,
        visibleItems,
      };
    })
    .filter((cat) => !onlyRedAmber.value || cat.visibleItems.length > 0);
});

const formatCatScore = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  return val.toFixed(2);
};

const ragTextClass = (rag: string | null) => {
  if (rag === 'G') return 'text-emerald-600 dark:text-emerald-400';
  if (rag === 'A') return 'text-amber-600 dark:text-amber-400';
  if (rag === 'R') return 'text-rose-600 dark:text-rose-400';
  return 'text-slate-400';
};

const ragBgClass = (rag: string | null) => {
  if (rag === 'G') return 'bg-emerald-600';
  if (rag === 'A') return 'bg-amber-500';
  if (rag === 'R') return 'bg-rose-600';
  return 'bg-slate-400';
};
</script>
