<template>
  <div class="space-y-4 pb-8 max-w-7xl mx-auto">
    <!-- Top Header Banner -->
    <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-0.5 rounded-full bg-[#e8f2f8] dark:bg-[#0082c3]/20 text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#0082c3]/40 font-mono text-[10px] font-bold uppercase tracking-wider">
            Quality Trend Analytics
          </span>
          <span class="text-slate-500 dark:text-slate-300 text-xs font-medium">
            • Longitudinal Progression & Compliance
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Scorecard Trends & Compliance
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
          Analyze quality ratings over time, track non-compliance alerts, and inspect team review cadences.
        </p>
      </div>

      <!-- Tab Switcher: Project vs Portfolio -->
      <div class="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] self-start md:self-auto">
        <button
          type="button"
          @click="activeSubTab = 'project'"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5',
            activeSubTab === 'project'
              ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <FolderKanban class="w-3.5 h-3.5" />
          <span>Project Deep-Dive</span>
        </button>
        <button
          type="button"
          @click="activeSubTab = 'portfolio'"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5',
            activeSubTab === 'portfolio'
              ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <BarChart3 class="w-3.5 h-3.5" />
          <span>Portfolio Matrix</span>
        </button>
      </div>
    </div>

    <!-- Global Filter Toolbar -->
    <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
        <!-- Role Filter (SWE / ORS) -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role / Model</label>
          <select
            v-model="selectedRole"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="SWE_MODEL">Lead Software Expert (SWE)</option>
            <option value="ORS_RAG">Optimization Scientist (ORS)</option>
          </select>
        </div>

        <!-- Project Filter (Project Deep Dive tab) -->
        <div v-if="activeSubTab === 'project'">
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Project</label>
          <select
            v-model="selectedProjectId"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option v-for="p in filteredProjects" :key="p.id" :value="p.id">
              {{ p.name }} ({{ p.code }})
            </option>
          </select>
        </div>

        <!-- Range Selection (Default 26 weeks) -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Period Range</label>
          <select
            v-model="selectedWeeksRange"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option :value="12">Last 12 Weeks</option>
            <option :value="26">Last 26 Weeks (Default)</option>
            <option :value="52">Last 52 Weeks (Yearly)</option>
          </select>
        </div>

        <!-- Product Suite Filter -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Product Suite</label>
          <select
            v-model="selectedProduct"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Suites</option>
            <option v-for="prod in products" :key="prod" :value="prod">{{ prod }}</option>
          </select>
        </div>

        <!-- GEO Filter -->
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">GEO Region</label>
          <select
            v-model="selectedGeo"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All GEOs</option>
            <option v-for="geo in geos" :key="geo" :value="geo">{{ geo }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- TAB 1: PROJECT DEEP-DIVE -->
    <div v-if="activeSubTab === 'project'" class="space-y-4">
      <!-- 5 KPI Tiles for Selected Project -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        <!-- 1. Latest Overall Score -->
        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latest Overall</span>
          <div class="flex items-center space-x-2 mt-1">
            <span
              v-if="latestProjectScorecard?.overallRag"
              :class="[
                'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white',
                latestProjectScorecard.overallRag === 'G' ? 'bg-emerald-600' :
                latestProjectScorecard.overallRag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
              ]"
            >
              {{ latestProjectScorecard.overallRag }}
            </span>
            <span class="text-xl font-black font-mono text-slate-900 dark:text-white">
              {{ formatScore(latestProjectScorecard) }}
            </span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-0.5">
            {{ latestProjectScorecard ? latestProjectScorecard.periodLabel : 'No submissions' }}
          </span>
        </div>

        <!-- 2. Change vs Previous -->
        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Change vs Prev</span>
          <div class="flex items-baseline space-x-1.5 mt-1 font-mono">
            <span
              v-if="projectScoreDelta !== null"
              :class="[
                'text-xl font-black',
                projectScoreDelta > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                projectScoreDelta < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
              ]"
            >
              {{ projectScoreDelta > 0 ? '↑' : projectScoreDelta < 0 ? '↓' : '→' }}
              {{ projectScoreDelta > 0 ? `+${Math.round(projectScoreDelta)}%` : `${Math.round(projectScoreDelta)}%` }}
            </span>
            <span v-else class="text-xl font-bold text-slate-300">—</span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-0.5">Normalized Δ</span>
        </div>

        <!-- 3. Best & Worst in Range -->
        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Range Min / Max</span>
          <div class="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 space-y-0.5">
            <div class="flex items-center justify-between">
              <span class="text-emerald-600 dark:text-emerald-400 font-bold">Best:</span>
              <span class="font-mono">{{ bestWorstScore.best ? `${bestWorstScore.best.val} (${bestWorstScore.best.label})` : '—' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-rose-600 dark:text-rose-400 font-bold">Worst:</span>
              <span class="font-mono">{{ bestWorstScore.worst ? `${bestWorstScore.worst.val} (${bestWorstScore.worst.label})` : '—' }}</span>
            </div>
          </div>
        </div>

        <!-- 4. Compliance Rate -->
        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compliance Rate</span>
          <div class="flex items-baseline space-x-1 mt-1 font-mono">
            <span
              :class="[
                'text-xl font-black',
                projectCompliance >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                projectCompliance >= 75 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
              ]"
            >
              {{ projectCompliance }}%
            </span>
            <span class="text-[10px] text-slate-400">12 wks</span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-0.5">
            Cadence: {{ currentProject?.scorecardConfig?.cadence || 'weekly' }}
          </span>
        </div>

        <!-- 5. Submission State Chip -->
        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs col-span-2 lg:col-span-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submission State</span>
          <div class="mt-1">
            <span
              :class="[
                'px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border inline-block',
                projectSubmissionState.state === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : projectSubmissionState.state === 'due'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
              ]"
            >
              {{ projectSubmissionState.state }}
            </span>
          </div>
          <span class="text-[10px] text-slate-400 block mt-1 truncate">
            Last: {{ projectSubmissionState.lastSubmittedLabel }}
          </span>
        </div>
      </div>

      <!-- Trend Line Chart -->
      <TrendLineChart
        :templateId="selectedRole"
        :periods="rangePeriods"
        :scorecardsMap="projectScorecardsMap"
        @openDetail="(id) => $emit('openDetail', id)"
      />

      <!-- Category Health Heatmap -->
      <RagHeatmap
        :templateId="selectedRole"
        :periods="rangePeriods"
        :scorecardsMap="projectFullScorecardsMap"
        @openDetail="(id) => $emit('openDetail', id)"
      />

      <!-- Top Red/Amber Alert Items -->
      <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle class="w-4 h-4 text-amber-500" />
          <span>Most Frequently Red / Amber Quality Items (Top 5)</span>
        </h3>

        <div v-if="topAlertItems.length === 0" class="py-6 text-center text-xs text-slate-400">
          No Red or Amber ratings recorded across items for this project in the selected period range.
        </div>

        <div v-else class="divide-y divide-slate-100 dark:divide-[#1b3654]">
          <div
            v-for="(item, idx) in topAlertItems"
            :key="item.itemId"
            class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          >
            <div>
              <div class="flex items-center space-x-2">
                <span class="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-bold flex items-center justify-center">
                  {{ idx + 1 }}
                </span>
                <span class="text-[10px] text-slate-400 uppercase font-semibold">{{ item.categoryName }}</span>
              </div>
              <h4 class="font-bold text-slate-900 dark:text-white mt-0.5 ml-6">{{ item.name }}</h4>
              <p v-if="item.latestRemarks" class="text-[11px] text-slate-500 dark:text-slate-400 italic ml-6 mt-0.5">
                Latest remarks: "{{ item.latestRemarks }}"
              </p>
            </div>

            <div class="flex items-center space-x-2 shrink-0 ml-6 sm:ml-0 font-mono font-bold">
              <span class="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px]">
                {{ item.redCount }} Red
              </span>
              <span class="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px]">
                {{ item.amberCount }} Amber
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: PORTFOLIO OVERVIEW -->
    <div v-else>
      <PortfolioScoreTable
        :projects="filteredProjects"
        :role="selectedRole"
        :summaries="scorecardSummaries"
        @selectProject="handleSelectProject"
        @openDetail="(id) => $emit('openDetail', id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Project, Scorecard, ScorecardSummary, ScorecardTemplateId } from '../../types';
import { useProjects } from '../../composables/useProjects';
import { useScorecards } from '../../composables/useScorecards';
import { isoWeekOf, previousPeriod, periodKey, periodLabel, comparePeriods } from '../../scoring/period';
import { submissionState, complianceRate } from '../../scoring/compliance';
import { SCORECARD_TEMPLATES } from '../../scoring/templates';
import TrendLineChart from './TrendLineChart.vue';
import RagHeatmap from './RagHeatmap.vue';
import PortfolioScoreTable from './PortfolioScoreTable.vue';
import {
  FolderKanban,
  BarChart3,
  AlertTriangle,
} from 'lucide-vue-next';

const props = defineProps<{
  initialProjectId?: string;
  initialRole?: ScorecardTemplateId;
  initialTab?: 'project' | 'portfolio';
}>();

const emit = defineEmits<{
  (e: 'openDetail', id: string): void;
}>();

const { projects, products, geos } = useProjects();
const { scorecardSummaries, fetchScorecards } = useScorecards();

const activeSubTab = ref<'project' | 'portfolio'>(props.initialTab || 'project');
const selectedRole = ref<ScorecardTemplateId>(props.initialRole || 'SWE_MODEL');
const selectedWeeksRange = ref<number>(26);
const selectedProduct = ref('ALL');
const selectedGeo = ref('ALL');
const selectedProjectId = ref<string>('');

const projectFullScorecards = ref<Scorecard[]>([]);

// Filter projects by Product and GEO
const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    if (selectedProduct.value !== 'ALL' && p.product !== selectedProduct.value) return false;
    if (selectedGeo.value !== 'ALL' && p.geo !== selectedGeo.value) return false;
    return true;
  });
});

const currentProject = computed(() => {
  return projects.value.find((p) => p.id === selectedProjectId.value) || null;
});

// Set default project when list loads or changes
watch(
  filteredProjects,
  (list) => {
    if (list.length > 0 && (!selectedProjectId.value || !list.some((p) => p.id === selectedProjectId.value))) {
      selectedProjectId.value = props.initialProjectId && list.some((p) => p.id === props.initialProjectId)
        ? props.initialProjectId
        : list[0].id;
    }
  },
  { immediate: true }
);

// Generate periods for the selected range (chronologically ascending)
const rangePeriods = computed(() => {
  const current = isoWeekOf(new Date());
  const list: { year: number; week: number; periodKey: string; periodLabel: string }[] = [];
  let cur = { ...current };

  for (let i = 0; i < selectedWeeksRange.value; i++) {
    list.unshift({
      year: cur.year,
      week: cur.week,
      periodKey: periodKey(cur.year, cur.week),
      periodLabel: periodLabel(cur.year, cur.week),
    });
    cur = previousPeriod(cur.year, cur.week, 'weekly');
  }

  return list;
});

// Load full scorecards for the selected project when project or role changes
const loadProjectFullScorecards = async () => {
  if (!selectedProjectId.value) return;
  try {
    const list = await fetchScorecards({
      projectId: selectedProjectId.value,
      templateId: selectedRole.value,
    });
    projectFullScorecards.value = list;
  } catch (err) {
    console.error('Failed to load project scorecards:', err);
  }
};

watch(
  () => [selectedProjectId.value, selectedRole.value],
  () => {
    loadProjectFullScorecards();
  },
  { immediate: true }
);

onMounted(() => {
  loadProjectFullScorecards();
});

// Project Map of summaries / scorecards by periodKey
const projectScorecardsMap = computed(() => {
  const map: Record<string, ScorecardSummary | Scorecard> = {};
  const list = scorecardSummaries.value.filter(
    (s) => s.projectId === selectedProjectId.value && s.templateId === selectedRole.value
  );
  for (const sc of list) {
    map[periodKey(sc.periodYear, sc.periodWeek)] = sc;
  }
  return map;
});

const projectFullScorecardsMap = computed(() => {
  const map: Record<string, Scorecard> = {};
  for (const sc of projectFullScorecards.value) {
    map[periodKey(sc.periodYear, sc.periodWeek)] = sc;
  }
  return map;
});

// Latest scorecard for selected project
const projectSubmittedSummaries = computed(() => {
  return scorecardSummaries.value
    .filter((s) => s.projectId === selectedProjectId.value && s.templateId === selectedRole.value && s.status === 'submitted')
    .sort((a, b) => comparePeriods({ year: a.periodYear, week: a.periodWeek }, { year: b.periodYear, week: b.periodWeek }));
});

const latestProjectScorecard = computed(() => {
  const list = projectSubmittedSummaries.value;
  return list.length > 0 ? list[list.length - 1] : null;
});

const projectScoreDelta = computed(() => {
  const list = projectSubmittedSummaries.value;
  if (list.length < 2) return null;
  const latest = list[list.length - 1];
  const prev = list[list.length - 2];
  if (latest.normalizedPct === null || prev.normalizedPct === null) return null;
  return latest.normalizedPct - prev.normalizedPct;
});

const bestWorstScore = computed(() => {
  const rangeKeys = new Set(rangePeriods.value.map((p) => p.periodKey));
  const inRange = projectSubmittedSummaries.value.filter((s) =>
    rangeKeys.has(periodKey(s.periodYear, s.periodWeek)) && s.overallValue !== null
  );

  if (inRange.length === 0) return { best: null, worst: null };

  let best = inRange[0];
  let worst = inRange[0];

  for (const s of inRange) {
    if ((s.normalizedPct ?? 0) > (best.normalizedPct ?? 0)) best = s;
    if ((s.normalizedPct ?? 0) < (worst.normalizedPct ?? 0)) worst = s;
  }

  const format = (s: ScorecardSummary) =>
    selectedRole.value === 'SWE_MODEL' ? s.overallValue!.toFixed(2) : `${s.overallValue!.toFixed(1)}/10`;

  return {
    best: { val: format(best), label: `W${best.periodWeek}` },
    worst: { val: format(worst), label: `W${worst.periodWeek}` },
  };
});

const projectCompliance = computed(() => {
  if (!currentProject.value) return 100;
  return complianceRate(currentProject.value, selectedRole.value, scorecardSummaries.value);
});

const projectSubmissionState = computed(() => {
  if (!currentProject.value) return { state: 'due' as const, lastSubmittedLabel: 'Never', weeksSinceLast: null };
  return submissionState(currentProject.value, selectedRole.value, scorecardSummaries.value);
});

const formatScore = (sc: ScorecardSummary | null) => {
  if (!sc || sc.overallValue === null || sc.overallValue === undefined) return '—';
  return selectedRole.value === 'SWE_MODEL' ? sc.overallValue.toFixed(2) : `${sc.overallValue.toFixed(1)}/10`;
};

// Calculate top 5 most frequently Red/Amber items across range
const topAlertItems = computed(() => {
  const rangeKeys = new Set(rangePeriods.value.map((p) => p.periodKey));
  const inRangeScorecards = projectFullScorecards.value.filter((sc) =>
    rangeKeys.has(periodKey(sc.periodYear, sc.periodWeek))
  );

  const tmpl = SCORECARD_TEMPLATES[selectedRole.value];
  if (!tmpl) return [];

  const counts: Record<string, { redCount: number; amberCount: number; latestRemarks: string; name: string; categoryName: string }> = {};

  for (const cat of tmpl.categories) {
    for (const item of cat.items) {
      counts[item.id] = {
        name: item.name,
        categoryName: cat.name,
        redCount: 0,
        amberCount: 0,
        latestRemarks: '',
      };
    }
  }

  // Count occurrences
  for (const sc of inRangeScorecards) {
    for (const item of sc.items) {
      if (counts[item.itemId]) {
        if (item.value === 'R') {
          counts[item.itemId].redCount++;
          if (item.remarks) counts[item.itemId].latestRemarks = item.remarks;
        } else if (item.value === 'A') {
          counts[item.itemId].amberCount++;
          if (item.remarks) counts[item.itemId].latestRemarks = item.remarks;
        }
      }
    }
  }

  return Object.entries(counts)
    .filter(([_, data]) => data.redCount > 0 || data.amberCount > 0)
    .map(([itemId, data]) => ({
      itemId,
      ...data,
      totalWeight: data.redCount * 3 + data.amberCount,
    }))
    .sort((a, b) => b.totalWeight - a.totalWeight || b.redCount - a.redCount)
    .slice(0, 5);
});

const handleSelectProject = (projectId: string, role: ScorecardTemplateId) => {
  selectedProjectId.value = projectId;
  selectedRole.value = role;
  activeSubTab.value = 'project';
};
</script>
