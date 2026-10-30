<template>
  <div class="space-y-4">
    <!-- Distribution Chart (Last 12 Periods) -->
    <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1b3654]">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart2 class="w-4 h-4 text-[#005386] dark:text-[#38bdf8]" />
            <span>Portfolio Quality Distribution (Last 12 Weeks)</span>
          </h3>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Weekly stacked count of projects rated Green, Amber, and Red for {{ role === 'SWE_MODEL' ? 'Software Experts (SWE)' : 'ORS Optimizers' }}.
          </p>
        </div>

        <div class="flex items-center space-x-3 text-xs font-semibold">
          <span class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span class="text-slate-600 dark:text-slate-300">Green</span></span>
          <span class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span class="text-slate-600 dark:text-slate-300">Amber</span></span>
          <span class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span class="text-slate-600 dark:text-slate-300">Red</span></span>
        </div>
      </div>

      <!-- Distribution Stacked Bar Chart SVG -->
      <div class="h-40 w-full overflow-hidden">
        <svg viewBox="0 0 720 150" class="w-full h-full select-none">
          <!-- Horizontal Grid Lines -->
          <line
            v-for="y in [25, 60, 95, 130]"
            :key="y"
            x1="30"
            :y1="y"
            x2="700"
            :y2="y"
            stroke="currentColor"
            class="text-slate-100 dark:text-slate-800"
            stroke-width="1"
          />

          <!-- Columns per Period -->
          <g v-for="(col, idx) in distributionData" :key="col.periodKey">
            <!-- Stacked Bars -->
            <g :transform="`translate(${col.x}, 0)`">
              <!-- Green (bottom) -->
              <rect
                v-if="col.greenH > 0"
                x="-14"
                :y="130 - col.greenH"
                width="28"
                :height="col.greenH"
                class="fill-emerald-600 dark:fill-emerald-500 transition-all hover:opacity-85"
                rx="2"
              >
                <title>{{ col.periodLabel }}: {{ col.green }} Green</title>
              </rect>
              <!-- Amber (middle) -->
              <rect
                v-if="col.amberH > 0"
                x="-14"
                :y="130 - col.greenH - col.amberH"
                width="28"
                :height="col.amberH"
                class="fill-amber-500 transition-all hover:opacity-85"
                rx="2"
              >
                <title>{{ col.periodLabel }}: {{ col.amber }} Amber</title>
              </rect>
              <!-- Red (top) -->
              <rect
                v-if="col.redH > 0"
                x="-14"
                :y="130 - col.greenH - col.amberH - col.redH"
                width="28"
                :height="col.redH"
                class="fill-rose-600 dark:fill-rose-500 transition-all hover:opacity-85"
                rx="2"
              >
                <title>{{ col.periodLabel }}: {{ col.red }} Red</title>
              </rect>

              <!-- Total count above bar if > 0 -->
              <text
                v-if="col.total > 0"
                x="0"
                :y="130 - col.totalH - 4"
                text-anchor="middle"
                class="text-[9px] font-mono font-bold fill-slate-500 dark:fill-slate-400"
              >
                {{ col.total }}
              </text>

              <!-- X Period Label -->
              <text
                x="0"
                y="145"
                text-anchor="middle"
                class="text-[9px] font-mono fill-slate-400"
              >
                {{ col.shortLabel }}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>

    <!-- Portfolio Score Table -->
    <div class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 dark:border-[#1b3654] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Portfolio Quality Overview ({{ sortedRows.length }} Projects)
        </h3>
        <span class="text-xs text-slate-500">
          Default sorted: Overdue first, then lowest quality score
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-[#071524]/80 border-b border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <th @click="toggleSort('project')" class="py-3 px-4 cursor-pointer hover:text-[#005386] select-none">
                Project <span v-if="sortField === 'project'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('suite')" class="py-3 px-3 cursor-pointer hover:text-[#005386] select-none">
                Suite <span v-if="sortField === 'suite'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('geo')" class="py-3 px-3 cursor-pointer hover:text-[#005386] select-none">
                GEO <span v-if="sortField === 'geo'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('score')" class="py-3 px-3 text-center cursor-pointer hover:text-[#005386] select-none">
                Latest Score <span v-if="sortField === 'score'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th class="py-3 px-3 text-center">Trend (8 Wks)</th>
              <th @click="toggleSort('delta')" class="py-3 px-3 text-center cursor-pointer hover:text-[#005386] select-none">
                Δ vs Prev <span v-if="sortField === 'delta'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('status')" class="py-3 px-3 text-center cursor-pointer hover:text-[#005386] select-none">
                Status <span v-if="sortField === 'status'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('compliance')" class="py-3 px-3 text-center cursor-pointer hover:text-[#005386] select-none">
                Compliance <span v-if="sortField === 'compliance'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('lastSubmitted')" class="py-3 px-4 cursor-pointer hover:text-[#005386] select-none">
                Last Submitted <span v-if="sortField === 'lastSubmitted'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-[#1b3654]">
            <tr
              v-for="row in sortedRows"
              :key="row.project.id"
              @click="$emit('selectProject', row.project.id, role)"
              class="hover:bg-slate-50/70 dark:hover:bg-[#0e243d]/60 cursor-pointer transition-colors group"
            >
              <!-- Project -->
              <td class="py-3 px-4 min-w-[200px]">
                <div class="font-bold text-slate-900 dark:text-white group-hover:text-[#005386] dark:group-hover:text-[#38bdf8] transition-colors">
                  {{ row.project.name }}
                </div>
                <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#071524] px-1.5 py-0.2 rounded border border-slate-200/60 dark:border-[#1b3654]">
                  {{ row.project.code }}
                </span>
              </td>

              <!-- Product Suite -->
              <td class="py-3 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                {{ row.project.product || 'General' }}
              </td>

              <!-- GEO -->
              <td class="py-3 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                {{ row.project.geo }}
              </td>

              <!-- Latest Score -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <div v-if="row.latest" class="inline-flex items-center space-x-1.5">
                  <span
                    v-if="row.latest.overallRag"
                    :class="[
                      'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white shrink-0',
                      row.latest.overallRag === 'G' ? 'bg-emerald-600' :
                      row.latest.overallRag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
                    ]"
                  >
                    {{ row.latest.overallRag }}
                  </span>
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {{ formatScore(row.latest) }}
                  </span>
                </div>
                <span v-else class="text-slate-300">—</span>
              </td>

              <!-- Sparkline -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <Sparkline :data="row.sparklineData" :width="72" :height="20" />
              </td>

              <!-- Delta vs Prev -->
              <td class="py-3 px-3 text-center whitespace-nowrap font-mono text-xs">
                <span
                  v-if="row.delta !== null"
                  :class="[
                    'font-bold inline-flex items-center space-x-0.5',
                    row.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                    row.delta < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'
                  ]"
                >
                  <span>{{ row.delta > 0 ? '↑' : row.delta < 0 ? '↓' : '→' }}</span>
                  <span>{{ row.delta > 0 ? `+${Math.round(row.delta)}%` : `${Math.round(row.delta)}%` }}</span>
                </span>
                <span v-else class="text-slate-300">—</span>
              </td>

              <!-- Submission State Chip -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                    row.submissionState.state === 'ok'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : row.submissionState.state === 'due'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 animate-pulse'
                  ]"
                >
                  {{ row.submissionState.state }}
                </span>
              </td>

              <!-- Compliance % -->
              <td class="py-3 px-3 text-center whitespace-nowrap font-mono font-bold text-xs">
                <span
                  :class="[
                    row.compliance >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                    row.compliance >= 75 ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
                  ]"
                >
                  {{ row.compliance }}%
                </span>
              </td>

              <!-- Last Submitted -->
              <td class="py-3 px-4 whitespace-nowrap">
                <div class="text-slate-800 dark:text-slate-200 font-semibold text-xs">
                  {{ row.submissionState.lastSubmittedLabel }}
                </div>
                <div v-if="row.submissionState.weeksSinceLast !== null" class="text-[10px] text-slate-400">
                  {{ row.submissionState.weeksSinceLast === 0 ? 'This week' : `${row.submissionState.weeksSinceLast} wks ago` }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Project, ScorecardSummary, ScorecardTemplateId } from '../../types';
import { submissionState, complianceRate } from '../../scoring/compliance';
import { isoWeekOf, previousPeriod, periodKey, comparePeriods } from '../../scoring/period';
import Sparkline from './Sparkline.vue';
import { BarChart2 } from 'lucide-vue-next';

const props = defineProps<{
  projects: Project[];
  role: ScorecardTemplateId;
  summaries: ScorecardSummary[];
}>();

defineEmits<{
  (e: 'selectProject', projectId: string, role: ScorecardTemplateId): void;
  (e: 'openDetail', id: string): void;
}>();

const sortField = ref<'project' | 'suite' | 'geo' | 'score' | 'delta' | 'status' | 'compliance' | 'lastSubmitted'>('status');
const sortAsc = ref(true);

const formatScore = (sc: ScorecardSummary) => {
  if (sc.overallValue === null || sc.overallValue === undefined) return '—';
  return props.role === 'SWE_MODEL' ? sc.overallValue.toFixed(2) : `${sc.overallValue.toFixed(1)}/10`;
};

// Build 12-week distribution data
const distributionData = computed(() => {
  const current = isoWeekOf(new Date());
  const weeks: { year: number; week: number; periodKey: string; periodLabel: string; shortLabel: string }[] = [];
  let cur = { ...current };

  for (let i = 0; i < 12; i++) {
    weeks.unshift({
      year: cur.year,
      week: cur.week,
      periodKey: periodKey(cur.year, cur.week),
      periodLabel: `Week ${cur.week} ${cur.year}`,
      shortLabel: `W${cur.week}`,
    });
    cur = previousPeriod(cur.year, cur.week, 'weekly');
  }

  const roleSummaries = props.summaries.filter((s) => s.templateId === props.role && s.status === 'submitted');
  const maxBarH = 90;

  let maxTotal = 1;
  const colCounts = weeks.map((w, idx) => {
    const forPeriod = roleSummaries.filter(
      (s) => s.periodYear === w.year && s.periodWeek === w.week
    );
    const green = forPeriod.filter((s) => s.overallRag === 'G').length;
    const amber = forPeriod.filter((s) => s.overallRag === 'A').length;
    const red = forPeriod.filter((s) => s.overallRag === 'R').length;
    const total = green + amber + red;
    if (total > maxTotal) maxTotal = total;

    return {
      ...w,
      green,
      amber,
      red,
      total,
      x: 60 + idx * 56,
    };
  });

  return colCounts.map((c) => ({
    ...c,
    greenH: (c.green / maxTotal) * maxBarH,
    amberH: (c.amber / maxTotal) * maxBarH,
    redH: (c.red / maxTotal) * maxBarH,
    totalH: (c.total / maxTotal) * maxBarH,
  }));
});

// Prepare rows with delta, sparkline (last 8 periods), compliance, submission state
const tableRows = computed(() => {
  const current = isoWeekOf(new Date());

  // Last 8 periods for sparkline
  const last8Periods: { year: number; week: number; periodKey: string }[] = [];
  let cur = { ...current };
  for (let i = 0; i < 8; i++) {
    last8Periods.unshift({
      year: cur.year,
      week: cur.week,
      periodKey: periodKey(cur.year, cur.week),
    });
    cur = previousPeriod(cur.year, cur.week, 'weekly');
  }

  return props.projects.map((p) => {
    const pSummaries = props.summaries
      .filter((s) => s.projectId === p.id && s.templateId === props.role && s.status === 'submitted')
      .sort((a, b) => comparePeriods({ year: a.periodYear, week: a.periodWeek }, { year: b.periodYear, week: b.periodWeek }));

    const latest = pSummaries.length > 0 ? pSummaries[pSummaries.length - 1] : null;
    const prev = pSummaries.length > 1 ? pSummaries[pSummaries.length - 2] : null;

    let delta: number | null = null;
    if (latest?.normalizedPct !== null && latest?.normalizedPct !== undefined &&
        prev?.normalizedPct !== null && prev?.normalizedPct !== undefined) {
      delta = latest.normalizedPct - prev.normalizedPct;
    }

    // Map sparkline points over last 8 periods
    const sumMap = new Map(pSummaries.map((s) => [periodKey(s.periodYear, s.periodWeek), s]));
    const sparklineData = last8Periods.map((per) => {
      const s = sumMap.get(per.periodKey);
      return s?.normalizedPct ?? null;
    });

    const subState = submissionState(p, props.role, props.summaries);
    const comp = complianceRate(p, props.role, props.summaries);

    return {
      project: p,
      latest,
      delta,
      sparklineData,
      submissionState: subState,
      compliance: comp,
    };
  });
});

const sortedRows = computed(() => {
  const rows = [...tableRows.value];

  rows.sort((a, b) => {
    // Default sort: Overdue first, then worst latest score
    if (sortField.value === 'status') {
      const stateRank: Record<string, number> = { overdue: 0, due: 1, ok: 2 };
      const rankA = stateRank[a.submissionState.state] ?? 3;
      const rankB = stateRank[b.submissionState.state] ?? 3;
      if (rankA !== rankB) return sortAsc.value ? rankA - rankB : rankB - rankA;
      // Secondary: worst score first
      const scoreA = a.latest?.normalizedPct ?? -1;
      const scoreB = b.latest?.normalizedPct ?? -1;
      return scoreA - scoreB;
    }

    if (sortField.value === 'project') {
      const cmp = a.project.name.localeCompare(b.project.name);
      return sortAsc.value ? cmp : -cmp;
    }
    if (sortField.value === 'suite') {
      const cmp = (a.project.product || '').localeCompare(b.project.product || '');
      return sortAsc.value ? cmp : -cmp;
    }
    if (sortField.value === 'geo') {
      const cmp = a.project.geo.localeCompare(b.project.geo);
      return sortAsc.value ? cmp : -cmp;
    }
    if (sortField.value === 'score') {
      const valA = a.latest?.normalizedPct ?? -1;
      const valB = b.latest?.normalizedPct ?? -1;
      return sortAsc.value ? valA - valB : valB - valA;
    }
    if (sortField.value === 'delta') {
      const dA = a.delta ?? -999;
      const dB = b.delta ?? -999;
      return sortAsc.value ? dA - dB : dB - dA;
    }
    if (sortField.value === 'compliance') {
      return sortAsc.value ? a.compliance - b.compliance : b.compliance - a.compliance;
    }
    if (sortField.value === 'lastSubmitted') {
      const wA = a.submissionState.weeksSinceLast ?? 999;
      const wB = b.submissionState.weeksSinceLast ?? 999;
      return sortAsc.value ? wA - wB : wB - wA;
    }

    return 0;
  });

  return rows;
});

const toggleSort = (field: typeof sortField.value) => {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortField.value = field;
    sortAsc.value = field === 'project' || field === 'status';
  }
};
</script>
