<template>
  <div class="space-y-4 pb-8">
    <!-- Top Executive Header Banner - 3DS DELMIA Quintiq Aesthetic -->
    <div class="bg-white dark:bg-gradient-to-r dark:from-[#07192b] dark:via-[#003b60] dark:to-[#005386] text-slate-900 dark:text-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 dark:border-[#0082c3]/30 relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-0.5 rounded-full bg-[#e8f2f8] dark:bg-[#0082c3]/20 text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#0082c3]/40 font-mono text-[10px] font-bold uppercase tracking-wider">
              3DS DELMIA Executive Briefing
            </span>
            <span class="text-slate-500 dark:text-slate-300 text-xs font-medium">• Week {{ currentWeekNumber }} Status</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight mt-1 text-slate-900 dark:text-white">
            Engineering Delivery & Health Dashboard
          </h1>
          <p class="text-slate-600 dark:text-slate-200 text-xs max-w-2xl mt-1 leading-relaxed">
            Real-time status overview across {{ activeProjects.length }} active software delivery projects grouped by Product Suite and GEO Region.
          </p>
        </div>
      </div>
    </div>

    <!-- Top KPI RAG Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      <!-- Total Active -->
      <div class="bg-white dark:bg-[#0f2238] py-2 px-3 sm:px-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs flex items-center justify-between">
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">Total Active</span>
          <div class="flex items-baseline space-x-1.5 mt-0.5">
            <span class="text-xl sm:text-2xl font-black text-[#003b60] dark:text-white tracking-tight leading-none">
              {{ activeProjects.length }}
            </span>
            <span class="text-[10px] text-slate-400 font-medium">Projects</span>
          </div>
        </div>
        <div class="p-2 rounded-lg bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73] shrink-0 ml-2">
          <FolderKanban class="w-4 h-4" />
        </div>
      </div>

      <!-- Green On Track -->
      <div class="bg-white dark:bg-[#0f2238] py-2 px-3 sm:px-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-950/80 shadow-xs flex items-center justify-between">
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">On Track (Green)</span>
          <div class="flex items-baseline space-x-1.5 mt-0.5">
            <span class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
              {{ ragCounts.GREEN }}
            </span>
            <span class="text-[10px] text-slate-400 font-medium">{{ getPercentage(ragCounts.GREEN) }}%</span>
          </div>
        </div>
        <div class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
          <CheckCircle2 class="w-4 h-4" />
        </div>
      </div>

      <!-- Amber Needs Attention -->
      <div class="bg-white dark:bg-[#0f2238] py-2 px-3 sm:px-3.5 rounded-xl border border-amber-200/80 dark:border-amber-950/80 shadow-xs flex items-center justify-between">
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">Needs Attn (Amber)</span>
          <div class="flex items-baseline space-x-1.5 mt-0.5">
            <span class="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight leading-none">
              {{ ragCounts.AMBER }}
            </span>
            <span class="text-[10px] text-slate-400 font-medium">{{ getPercentage(ragCounts.AMBER) }}%</span>
          </div>
        </div>
        <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shrink-0 ml-2">
          <AlertTriangle class="w-4 h-4" />
        </div>
      </div>

      <!-- Red At Risk -->
      <div class="bg-white dark:bg-[#0f2238] py-2 px-3 sm:px-3.5 rounded-xl border border-rose-200/80 dark:border-rose-950/80 shadow-xs flex items-center justify-between">
        <div class="min-w-0">
          <span class="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block truncate">At Risk (Red)</span>
          <div class="flex items-baseline space-x-1.5 mt-0.5">
            <span class="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight leading-none">
              {{ ragCounts.RED }}
            </span>
            <span class="text-[10px] text-slate-400 font-medium">{{ getPercentage(ragCounts.RED) }}%</span>
          </div>
        </div>
        <div class="p-2 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0 ml-2">
          <XCircle class="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Quality Scorecards Metric Card (WP6) -->
    <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <ClipboardCheck class="w-4 h-4 text-[#005386] dark:text-[#38bdf8]" />
          <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Quality Scorecards
          </h3>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#071524] text-slate-600 dark:text-slate-300 font-mono">
            SWE & ORS Reviews
          </span>
        </div>
        <div class="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <!-- SWE breakdown -->
          <div class="flex items-center space-x-1.5">
            <span class="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">SWE Model:</span>
            <span class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[11px]">
              {{ scorecardStats.swe.G }}G
            </span>
            <span class="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold font-mono text-[11px]">
              {{ scorecardStats.swe.A }}A
            </span>
            <span class="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold font-mono text-[11px]">
              {{ scorecardStats.swe.R }}R
            </span>
          </div>

          <span class="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

          <!-- ORS breakdown -->
          <div class="flex items-center space-x-1.5">
            <span class="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">ORS Optimizer:</span>
            <span class="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold font-mono text-[11px]">
              {{ scorecardStats.ors.G }}G
            </span>
            <span class="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold font-mono text-[11px]">
              {{ scorecardStats.ors.A }}A
            </span>
            <span class="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold font-mono text-[11px]">
              {{ scorecardStats.ors.R }}R
            </span>
          </div>

          <span class="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

          <!-- Cadence status -->
          <div class="flex items-center space-x-2 text-[11px]">
            <span v-if="scorecardStats.dueCount > 0" class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
              {{ scorecardStats.dueCount }} Due
            </span>
            <span v-if="scorecardStats.overdueCount > 0" class="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold animate-pulse">
              {{ scorecardStats.overdueCount }} Overdue
            </span>
            <span v-if="scorecardStats.dueCount === 0 && scorecardStats.overdueCount === 0" class="text-emerald-600 dark:text-emerald-400 font-bold">
              All on schedule
            </span>
          </div>
        </div>
      </div>

      <!-- Link to Portfolio Tab -->
      <button
        type="button"
        @click="$emit('navigateToTrends', 'portfolio')"
        class="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-[#005386] dark:text-[#38bdf8] font-bold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer shrink-0"
      >
        <span>View Scorecard Portfolio</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Charts Row: RAG Donut Chart + Project Type + Product Breakdown + GEO Breakdown -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
      <!-- 1. Overall Health RAG Breakdown (Visual Donut Representation) -->
      <div class="bg-white dark:bg-[#0f2238] p-3 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-2">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-1.5">
          <h2 class="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
            <PieChart class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
            <span>Overall RAG</span>
          </h2>
          <span class="text-[10px] text-slate-400">{{ activeProjects.length }} Projects</span>
        </div>

        <div class="flex items-center justify-around py-1 gap-2">
          <!-- Custom SVG Donut Chart -->
          <div class="relative w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 36 36" class="w-20 h-20 sm:w-22 sm:h-22 transform -rotate-90">
              <!-- Background circle -->
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                stroke-width="4"
                class="dark:stroke-[#1b3654]"
              />
              <!-- Green segment -->
              <path
                v-if="ragCounts.GREEN > 0"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#059669"
                stroke-width="4"
                :stroke-dasharray="`${getPercentage(ragCounts.GREEN)}, 100`"
                stroke-dashoffset="0"
              />
              <!-- Amber segment -->
              <path
                v-if="ragCounts.AMBER > 0"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#d97706"
                stroke-width="4"
                :stroke-dasharray="`${getPercentage(ragCounts.AMBER)}, 100`"
                :stroke-dashoffset="`-${getPercentage(ragCounts.GREEN)}`"
              />
              <!-- Red segment -->
              <path
                v-if="ragCounts.RED > 0"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#dc2626"
                stroke-width="4"
                :stroke-dasharray="`${getPercentage(ragCounts.RED)}, 100`"
                :stroke-dashoffset="`-${getPercentage(ragCounts.GREEN) + getPercentage(ragCounts.AMBER)}`"
              />
            </svg>
            <div class="absolute text-center">
              <span class="text-base sm:text-lg font-black text-slate-900 dark:text-white block leading-none">
                {{ activeProjects.length }}
              </span>
              <span class="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Active</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="space-y-1.5 text-xs w-full sm:w-auto">
            <div class="flex items-center justify-between space-x-3 text-[11px]">
              <span class="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span class="font-medium">On Track</span>
              </span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">{{ ragCounts.GREEN }}</span>
            </div>

            <div class="flex items-center justify-between space-x-3 text-[11px]">
              <span class="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                <span class="w-2 h-2 rounded-full bg-amber-600"></span>
                <span class="font-medium">Needs Attn</span>
              </span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">{{ ragCounts.AMBER }}</span>
            </div>

            <div class="flex items-center justify-between space-x-3 text-[11px]">
              <span class="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
                <span class="w-2 h-2 rounded-full bg-rose-600"></span>
                <span class="font-medium">At Risk</span>
              </span>
              <span class="font-bold text-slate-900 dark:text-white font-mono">{{ ragCounts.RED }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Project Type Distribution Card -->
      <div class="bg-white dark:bg-[#0f2238] p-3 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-2">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-1.5">
          <h2 class="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
            <Sliders class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
            <span>Project Types</span>
          </h2>
          <span class="text-[10px] text-slate-400">{{ allConfiguredTypes.length }} Types</span>
        </div>

        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          <!-- Overall Type Split Ratio Stack Bar -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[10px] text-slate-500">
              <span class="font-semibold text-slate-700 dark:text-slate-300">Ratio</span>
              <span class="truncate ml-2 text-right text-[10px]">
                <span v-for="(stat, idx) in projectTypeStats" :key="stat.type">
                  {{ stat.count }} {{ stat.type }}<span v-if="idx < projectTypeStats.length - 1"> / </span>
                </span>
              </span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
              <div
                v-for="stat in projectTypeStats"
                :key="stat.type"
                v-show="stat.percentage > 0"
                :class="[stat.barColor, 'h-full transition-all']"
                :style="{ width: `${stat.percentage}%` }"
                :title="`${stat.type}: ${stat.count} (${stat.percentage}%)`"
              ></div>
            </div>
          </div>

          <!-- Type Breakdown Cards with RAG Stack -->
          <div
            v-for="item in projectTypeStats"
            :key="item.type"
            @click="selectedTypeFilter = selectedTypeFilter === item.type ? 'ALL' : item.type"
            :class="[
              'p-1.5 rounded-lg border transition-all cursor-pointer space-y-1',
              selectedTypeFilter === item.type
                ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] border-[#005386] dark:border-[#38bdf8]'
                : 'bg-slate-50/70 dark:bg-[#071524] border-slate-100 dark:border-[#1b3654] hover:border-slate-300 dark:hover:border-slate-600'
            ]"
            :title="`Click to filter matrix by ${item.type} projects`"
          >
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center space-x-1.5">
                <ProjectTypeBadge :type="item.type" size="xs" />
                <span class="text-[9px] text-slate-500 font-semibold">
                  {{ item.percentage }}%
                </span>
              </div>
              <span class="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                {{ item.count }} project{{ item.count === 1 ? '' : 's' }}
              </span>
            </div>

            <!-- RAG health bar for this project type -->
            <div class="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden flex">
              <div
                v-if="item.green > 0"
                class="bg-emerald-600 h-full"
                :style="{ width: `${(item.green / item.count) * 100}%` }"
                :title="`${item.green} On Track`"
              ></div>
              <div
                v-if="item.amber > 0"
                class="bg-amber-500 h-full"
                :style="{ width: `${(item.amber / item.count) * 100}%` }"
                :title="`${item.amber} Needs Attention`"
              ></div>
              <div
                v-if="item.red > 0"
                class="bg-rose-600 h-full"
                :style="{ width: `${(item.red / item.count) * 100}%` }"
                :title="`${item.red} At Risk`"
              ></div>
            </div>

            <div class="flex items-center justify-between text-[8px] text-slate-400">
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">{{ item.green }} Track</span>
              <span class="text-amber-600 dark:text-amber-400 font-semibold">{{ item.amber }} Attn</span>
              <span class="text-rose-600 dark:text-rose-400 font-semibold">{{ item.red }} Risk</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Product Suite Breakdown Bar Stack -->
      <div class="bg-white dark:bg-[#0f2238] p-3 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-2">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-1.5">
          <h2 class="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
            <Tag class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
            <span>Product Suites</span>
          </h2>
          <span class="text-[10px] text-slate-400">{{ productStats.length }} Suites</span>
        </div>

        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          <div v-for="item in productStats" :key="item.product" class="space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-800 dark:text-slate-200 font-mono truncate mr-2">
                {{ item.product }}
              </span>
              <span class="text-[10px] font-semibold text-slate-500 shrink-0">
                {{ item.count }} proj
              </span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
              <div
                v-if="item.green > 0"
                class="bg-emerald-600 h-full"
                :style="{ width: `${(item.green / item.count) * 100}%` }"
                :title="`${item.green} Green`"
              ></div>
              <div
                v-if="item.amber > 0"
                class="bg-amber-500 h-full"
                :style="{ width: `${(item.amber / item.count) * 100}%` }"
                :title="`${item.amber} Amber`"
              ></div>
              <div
                v-if="item.red > 0"
                class="bg-rose-600 h-full"
                :style="{ width: `${(item.red / item.count) * 100}%` }"
                :title="`${item.red} Red`"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. GEO Region Breakdown Bar Stack -->
      <div class="bg-white dark:bg-[#0f2238] p-3 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-2">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-1.5">
          <h2 class="font-bold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
            <Globe class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
            <span>GEO Regions</span>
          </h2>
          <span class="text-[10px] text-slate-400">{{ geoStats.length }} GEOs</span>
        </div>

        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          <div v-for="item in geoStats" :key="item.geo" class="space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-800 dark:text-slate-200 font-mono truncate mr-2">
                {{ item.geo }}
              </span>
              <span class="text-[10px] font-semibold text-slate-500 shrink-0">
                {{ item.count }} proj
              </span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
              <div
                v-if="item.green > 0"
                class="bg-emerald-600 h-full"
                :style="{ width: `${(item.green / item.count) * 100}%` }"
              ></div>
              <div
                v-if="item.amber > 0"
                class="bg-amber-500 h-full"
                :style="{ width: `${(item.amber / item.count) * 100}%` }"
              ></div>
              <div
                v-if="item.red > 0"
                class="bg-rose-600 h-full"
                :style="{ width: `${(item.red / item.count) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Projects Delivery Health List -->
    <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
      <!-- Title & RAG Quick Switcher Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1b3654] pb-3">
        <div>
          <div class="flex items-center space-x-2">
            <h2 class="font-bold text-slate-900 dark:text-white text-base">
              Software Project Delivery Matrix
            </h2>
            <span class="px-2 py-0.5 rounded-full bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] font-bold text-[11px]">
              {{ filteredProjectHealthList.length }} of {{ activeProjects.length }}
            </span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Filter active projects by keyword, RAG status, Product Suite, or GEO region. Click any project code or name to open its summary.
          </p>
        </div>

        <div class="flex items-center bg-slate-100 dark:bg-[#071524] p-0.5 rounded-lg border border-slate-200 dark:border-[#1b3654] text-xs self-start sm:self-auto shrink-0">
          <button
            @click="selectedRagFilter = 'ALL'"
            :class="[
              'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
              selectedRagFilter === 'ALL' ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            All ({{ activeProjects.length }})
          </button>
          <button
            @click="selectedRagFilter = 'GREEN'"
            :class="[
              'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
              selectedRagFilter === 'GREEN' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-emerald-600'
            ]"
          >
            Green ({{ ragCounts.GREEN }})
          </button>
          <button
            @click="selectedRagFilter = 'AMBER'"
            :class="[
              'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
              selectedRagFilter === 'AMBER' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-500 hover:text-amber-600'
            ]"
          >
            Amber ({{ ragCounts.AMBER }})
          </button>
          <button
            @click="selectedRagFilter = 'RED'"
            :class="[
              'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
              selectedRagFilter === 'RED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-rose-600'
            ]"
          >
            Red ({{ ragCounts.RED }})
          </button>
        </div>
      </div>

      <!-- Search & Multi-Filter Controls Bar (Similar to Project Directory) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2">
        <!-- Search Box -->
        <div class="sm:col-span-2 lg:col-span-3 relative">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="search-matrix-input"
            type="text"
            placeholder="Search by name, key, lead, type, product, GEO..."
            v-model="searchTerm"
            class="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
          />
          <button
            v-if="searchTerm"
            type="button"
            @click="searchTerm = ''"
            class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            title="Clear search"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Project Status Filter Select -->
        <div class="sm:col-span-1 lg:col-span-2">
          <select
            id="matrix-status-filter"
            v-model="selectedStatusFilter"
            class="w-full py-1.5 px-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
          >
            <option value="ALL">All Statuses ({{ projects.length }})</option>
            <option value="ACTIVE">Active ({{ statusCounts.ACTIVE }})</option>
            <option value="ON_HOLD">On Hold ({{ statusCounts.ON_HOLD }})</option>
            <option value="COMPLETED">Completed ({{ statusCounts.COMPLETED }})</option>
            <option value="PLANNING">Planning ({{ statusCounts.PLANNING }})</option>
          </select>
        </div>

        <!-- Project Type Filter Select -->
        <div class="sm:col-span-1 lg:col-span-2">
          <select
            id="matrix-type-filter"
            v-model="selectedTypeFilter"
            class="w-full py-1.5 px-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
          >
            <option value="ALL">All Types ({{ allConfiguredTypes.length }})</option>
            <option v-for="t in allConfiguredTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- Product Filter Multi-Select Dropdown -->
        <div class="sm:col-span-1 lg:col-span-3">
          <MultiSelectDropdown
            id="matrix-product-filter"
            v-model="selectedProductFilters"
            :options="allConfiguredProducts"
            placeholder="All Product Suites"
            label="Product Suites"
            :counts="productCounts"
          />
        </div>

        <!-- GEO Filter Select -->
        <div class="sm:col-span-1 lg:col-span-2">
          <select
            id="matrix-geo-filter"
            v-model="selectedGeoFilter"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
          >
            <option value="ALL">All GEOs ({{ geos.length }})</option>
            <option v-for="g in geos" :key="g" :value="g">GEO: {{ g }}</option>
          </select>
        </div>
      </div>

      <!-- Project Health Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-[#071524] border-b border-slate-200 dark:border-[#1b3654] text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
              <th
                @click="toggleSort('code')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by Project Key"
              >
                <div class="flex items-center space-x-1">
                  <span>Project Key</span>
                  <ArrowUp v-if="sortField === 'code' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'code' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('name')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by Project Name"
              >
                <div class="flex items-center space-x-1">
                  <span>Software Project Name</span>
                  <ArrowUp v-if="sortField === 'name' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'name' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('type')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by Project Type"
              >
                <div class="flex items-center space-x-1">
                  <span>Type</span>
                  <ArrowUp v-if="sortField === 'type' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'type' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('product')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by Product Suite"
              >
                <div class="flex items-center space-x-1">
                  <span>Product</span>
                  <ArrowUp v-if="sortField === 'product' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'product' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('geo')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by GEO Region"
              >
                <div class="flex items-center space-x-1">
                  <span>GEO</span>
                  <ArrowUp v-if="sortField === 'geo' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'geo' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('status')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by Project Lifecycle Status"
              >
                <div class="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUp v-if="sortField === 'status' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'status' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('owner')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by Tech Lead"
              >
                <div class="flex items-center space-x-1">
                  <span>Tech Lead</span>
                  <ArrowUp v-if="sortField === 'owner' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'owner' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('rag')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                title="Sort by Overall RAG Health"
              >
                <div class="flex items-center space-x-1">
                  <span>Overall RAG</span>
                  <ArrowUp v-if="sortField === 'rag' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'rag' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>

              <th
                @click="toggleSort('update')"
                class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors min-w-[340px] sm:min-w-[440px]"
                title="Sort by Latest Update Week"
              >
                <div class="flex items-center space-x-1">
                  <span>Latest Status Snapshot</span>
                  <ArrowUp v-if="sortField === 'update' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowDown v-else-if="sortField === 'update' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-[#1b3654]/60 text-xs">
            <tr v-if="sortedProjectHealthList.length === 0">
              <td colspan="9" class="py-8 text-center text-slate-400">
                <div class="space-y-1.5">
                  <p>No software projects match your search or filter criteria.</p>
                  <button
                    v-if="searchTerm || selectedRagFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || selectedTypeFilter !== 'ALL' || selectedProductFilters.length > 0 || selectedGeoFilter !== 'ALL'"
                    @click="clearFilters"
                    class="text-xs font-semibold text-[#005386] dark:text-[#38bdf8] hover:underline cursor-pointer"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              </td>
            </tr>
            <tr
              v-for="item in sortedProjectHealthList"
              :key="item.project.id"
              class="hover:bg-[#005386]/5 dark:hover:bg-[#005386]/20 transition-colors group"
            >
              <td class="py-2.5 px-3 font-mono font-bold text-[#005386] dark:text-[#38bdf8] whitespace-nowrap">
                <button
                  @click="$emit('navigateToProjectSummary', item.project.id)"
                  class="font-mono font-bold text-[#005386] dark:text-[#38bdf8] hover:underline cursor-pointer text-left flex items-center space-x-1 group/code"
                  title="Open Project Summary & Status Updates"
                >
                  <span>{{ item.project.code }}</span>
                  <ExternalLink class="w-3 h-3 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                </button>
              </td>

              <td class="py-2.5 px-3">
                <button
                  @click="$emit('navigateToProjectSummary', item.project.id)"
                  class="font-bold text-slate-900 dark:text-white text-xs hover:text-[#005386] dark:hover:text-[#38bdf8] hover:underline cursor-pointer text-left transition-colors flex items-center space-x-1 group/name"
                  title="Open Project Summary & Status Updates"
                >
                  <span>{{ item.project.name }}</span>
                  <ChevronRight class="w-3 h-3 opacity-0 group-hover/name:opacity-100 transition-opacity text-[#005386] dark:text-[#38bdf8]" />
                </button>
                <div class="text-[10px] text-slate-400">
                  Target: {{ item.project.targetDate }}
                </div>
              </td>

              <td class="py-2.5 px-3 whitespace-nowrap">
                <ProjectTypeBadge :type="item.project.projectType" size="xs" />
              </td>

              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="px-2 py-0.5 rounded-md bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] text-[#005386] dark:text-[#7dd3fc] font-bold text-[10px] flex items-center space-x-1 w-fit">
                  <Tag class="w-2.5 h-2.5 text-[#0082c3]" />
                  <span>{{ item.project.product || 'General' }}</span>
                </span>
              </td>

              <td class="py-2.5 px-3 whitespace-nowrap">
                <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1 text-xs">
                  <Globe class="w-2.5 h-2.5 text-[#0082c3]" />
                  <span>{{ item.project.geo }}</span>
                </span>
              </td>

              <!-- Project Status Column -->
              <td class="py-2.5 px-3 whitespace-nowrap">
                <ProjectStatusBadge :status="item.project.status" size="xs" />
              </td>

              <td class="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {{ item.project.owner }}
              </td>

              <td class="py-2.5 px-3 whitespace-nowrap">
                <RAGBadge :status="item.rag" size="sm" />
              </td>

              <!-- Wider Latest Status Snapshot showing full update text -->
              <td class="py-3 px-3 text-slate-700 dark:text-slate-200 min-w-[340px] sm:min-w-[440px]">
                <div v-if="item.latestUpdate" class="space-y-1.5 text-xs">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-[#005386] text-white">
                      Week {{ item.latestUpdate.weekNumber }}
                    </span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {{ item.latestUpdate.updateDate }}
                    </span>
                    <span v-if="item.latestUpdate.author" class="text-[11px] text-slate-500 dark:text-slate-400">
                      • by <strong>{{ item.latestUpdate.author }}</strong>
                    </span>
                  </div>

                  <!-- Full Highlights text -->
                  <div class="text-[11px] leading-relaxed">
                    <span class="font-bold text-slate-900 dark:text-white">Wins / Highlights: </span>
                    <span class="whitespace-pre-line text-slate-700 dark:text-slate-300">{{ item.latestUpdate.highlights }}</span>
                  </div>

                  <!-- Technical Blockers if any -->
                  <div
                    v-if="item.latestUpdate.lowlights"
                    class="text-[11px] leading-relaxed text-rose-700 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900/60"
                  >
                    <span class="font-bold">Technical Blockers: </span>
                    <span class="whitespace-pre-line">{{ item.latestUpdate.lowlights }}</span>
                  </div>

                  <!-- Next Targets if any -->
                  <div v-if="item.latestUpdate.nextSteps" class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                    <span class="font-bold text-slate-800 dark:text-slate-200">Next Targets: </span>
                    <span class="whitespace-pre-line">{{ item.latestUpdate.nextSteps }}</span>
                  </div>

                  <!-- Metric Note if any -->
                  <div v-if="item.latestUpdate.kpiProgress" class="text-[10px] text-slate-500 font-mono">
                    <span class="font-semibold text-slate-600 dark:text-slate-400">Metric Note: </span>
                    <span>{{ item.latestUpdate.kpiProgress }}</span>
                  </div>
                </div>
                <div v-else class="text-slate-400 italic text-[11px]">
                  No update logged yet.
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
import { useProjects } from '../composables/useProjects';
import { useScorecards } from '../composables/useScorecards';
import { submissionState } from '../scoring/compliance';
import { comparePeriods } from '../scoring/period';
import RAGBadge from './RAGBadge.vue';
import ProjectTypeBadge from './ProjectTypeBadge.vue';
import ProjectStatusBadge from './ProjectStatusBadge.vue';
import MultiSelectDropdown from './MultiSelectDropdown.vue';
import { RAGStatus, ProjectType, ProjectStatus } from '../types';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PieChart,
  Sliders,
  Tag,
  Globe,
  ExternalLink,
  ChevronRight,
  Search,
  X,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ClipboardCheck,
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'navigateToEntry', projectId: string): void;
  (e: 'navigateToProjects'): void;
  (e: 'navigateToProjectSummary', projectId: string): void;
  (e: 'navigateToTrends', subTab?: string): void;
}>();

const { projects, weeklyUpdates, products, geos, projectTypes, getLatestUpdateForProject } = useProjects();
const { scorecardSummaries } = useScorecards();

const scorecardStats = computed(() => {
  const swe = { G: 0, A: 0, R: 0 };
  const ors = { G: 0, A: 0, R: 0 };
  let dueCount = 0;
  let overdueCount = 0;

  for (const p of projects.value) {
    // Check SWE
    const sweSummaries = scorecardSummaries.value
      .filter((s) => s.projectId === p.id && s.templateId === 'SWE_MODEL' && s.status === 'submitted')
      .sort((a, b) => comparePeriods({ year: a.periodYear, week: a.periodWeek }, { year: b.periodYear, week: b.periodWeek }));
    if (sweSummaries.length > 0) {
      const latestRag = sweSummaries[sweSummaries.length - 1].overallRag;
      if (latestRag === 'G') swe.G++;
      else if (latestRag === 'A') swe.A++;
      else if (latestRag === 'R') swe.R++;
    }

    const sweState = submissionState(p, 'SWE_MODEL', scorecardSummaries.value);
    if (sweState.state === 'due') dueCount++;
    else if (sweState.state === 'overdue') overdueCount++;

    // Check ORS
    const orsSummaries = scorecardSummaries.value
      .filter((s) => s.projectId === p.id && s.templateId === 'ORS_RAG' && s.status === 'submitted')
      .sort((a, b) => comparePeriods({ year: a.periodYear, week: a.periodWeek }, { year: b.periodYear, week: b.periodWeek }));
    if (orsSummaries.length > 0) {
      const latestRag = orsSummaries[orsSummaries.length - 1].overallRag;
      if (latestRag === 'G') ors.G++;
      else if (latestRag === 'A') ors.A++;
      else if (latestRag === 'R') ors.R++;
    }

    const orsState = submissionState(p, 'ORS_RAG', scorecardSummaries.value);
    if (orsState.state === 'due') dueCount++;
    else if (orsState.state === 'overdue') overdueCount++;
  }

  return { swe, ors, dueCount, overdueCount };
});

const searchTerm = ref<string>('');
const selectedRagFilter = ref<string>('ALL');
const selectedStatusFilter = ref<string>('ALL');
const selectedTypeFilter = ref<string>('ALL');
const selectedProductFilters = ref<string[]>([]);
const selectedGeoFilter = ref<string>('ALL');

type MatrixSortField = 'code' | 'name' | 'type' | 'product' | 'geo' | 'status' | 'owner' | 'rag' | 'update';
const sortField = ref<MatrixSortField>('code');
const sortOrder = ref<'asc' | 'desc'>('asc');

const toggleSort = (field: MatrixSortField) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

const clearFilters = () => {
  searchTerm.value = '';
  selectedRagFilter.value = 'ALL';
  selectedStatusFilter.value = 'ALL';
  selectedTypeFilter.value = 'ALL';
  selectedProductFilters.value = [];
  selectedGeoFilter.value = 'ALL';
};

const productCounts = computed(() => {
  const map: Record<string, number> = {};
  projects.value.forEach((p) => {
    const prod = p.product || 'General';
    map[prod] = (map[prod] || 0) + 1;
  });
  return map;
});

const activeProjects = computed(() => projects.value.filter((p) => p.status === 'ACTIVE'));

const statusCounts = computed(() => {
  const counts: Record<string, number> = {
    ACTIVE: 0,
    ON_HOLD: 0,
    COMPLETED: 0,
    PLANNING: 0,
  };
  projects.value.forEach((p) => {
    if (counts[p.status] !== undefined) {
      counts[p.status]++;
    }
  });
  return counts;
});

const allConfiguredTypes = computed(() => {
  const set = new Set<string>(projectTypes.value);
  projects.value.forEach((p) => {
    if (p.projectType) set.add(p.projectType);
  });
  if (set.size === 0) {
    set.add('Manual');
    set.add('Optimization');
  }
  return Array.from(set);
});

const allConfiguredProducts = computed(() => {
  const set = new Set<string>(products.value);
  projects.value.forEach((p) => {
    if (p.product) set.add(p.product);
  });
  return Array.from(set).sort();
});

// Current Week number
const currentWeekNumber = computed(() => {
  const d = new Date();
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
});

// Project Health List with Latest RAG across all projects
const projectHealthList = computed(() => {
  return projects.value.map((project) => {
    const latestUpdate = getLatestUpdateForProject(project.id);
    const rag: RAGStatus = latestUpdate ? latestUpdate.overallRag : 'GREEN';
    return {
      project,
      latestUpdate,
      rag,
    };
  });
});

// Overall Active RAG Counts
const ragCounts = computed(() => {
  const counts = { GREEN: 0, AMBER: 0, RED: 0 };
  projectHealthList.value
    .filter((item) => item.project.status === 'ACTIVE')
    .forEach((item) => {
      if (counts[item.rag] !== undefined) {
        counts[item.rag]++;
      }
    });
  return counts;
});

const getPercentage = (count: number) => {
  if (!activeProjects.value.length) return 0;
  return Math.round((count / activeProjects.value.length) * 100);
};

// Project Type Stats with RAG breakdown
const projectTypeStats = computed(() => {
  const types = allConfiguredTypes.value;
  const total = activeProjects.value.length || 1;
  const palette = ['bg-slate-500', 'bg-[#0082c3]', 'bg-emerald-600', 'bg-indigo-600', 'bg-amber-600', 'bg-purple-600', 'bg-teal-600'];

  return types.map((type, idx) => {
    const matching = projectHealthList.value.filter(
      (item) => (item.project.projectType || 'Manual') === type
    );
    const green = matching.filter((item) => item.rag === 'GREEN').length;
    const amber = matching.filter((item) => item.rag === 'AMBER').length;
    const red = matching.filter((item) => item.rag === 'RED').length;
    const count = matching.length;
    const percentage = Math.round((count / total) * 100);
    const barColor = palette[idx % palette.length];

    return {
      type,
      count,
      percentage,
      green,
      amber,
      red,
      barColor,
    };
  });
});

// Product Stats with RAG breakdown
const productStats = computed(() => {
  const map: Record<string, { count: number; green: number; amber: number; red: number }> = {};
  projectHealthList.value.forEach((item) => {
    const prod = item.project.product || 'General';
    if (!map[prod]) {
      map[prod] = { count: 0, green: 0, amber: 0, red: 0 };
    }
    map[prod].count++;
    if (item.rag === 'GREEN') map[prod].green++;
    if (item.rag === 'AMBER') map[prod].amber++;
    if (item.rag === 'RED') map[prod].red++;
  });

  return Object.entries(map).map(([product, stats]) => ({
    product,
    ...stats,
  })).sort((a, b) => b.count - a.count);
});

// GEO Stats with RAG breakdown
const geoStats = computed(() => {
  const map: Record<string, { count: number; green: number; amber: number; red: number }> = {};
  projectHealthList.value.forEach((item) => {
    const geo = item.project.geo || 'Global';
    if (!map[geo]) {
      map[geo] = { count: 0, green: 0, amber: 0, red: 0 };
    }
    map[geo].count++;
    if (item.rag === 'GREEN') map[geo].green++;
    if (item.rag === 'AMBER') map[geo].amber++;
    if (item.rag === 'RED') map[geo].red++;
  });

  return Object.entries(map).map(([geo, stats]) => ({
    geo,
    ...stats,
  })).sort((a, b) => b.count - a.count);
});

// Filtered Project Health List
const filteredProjectHealthList = computed(() => {
  const query = searchTerm.value.trim().toLowerCase();

  return projectHealthList.value.filter((item) => {
    if (selectedRagFilter.value !== 'ALL' && item.rag !== selectedRagFilter.value) {
      return false;
    }
    if (selectedStatusFilter.value !== 'ALL' && item.project.status !== selectedStatusFilter.value) {
      return false;
    }
    if (
      selectedTypeFilter.value !== 'ALL' &&
      (item.project.projectType || 'Manual') !== selectedTypeFilter.value
    ) {
      return false;
    }
    if (
      selectedProductFilters.value.length > 0 &&
      !selectedProductFilters.value.includes(item.project.product || 'General')
    ) {
      return false;
    }
    if (selectedGeoFilter.value !== 'ALL' && item.project.geo !== selectedGeoFilter.value) {
      return false;
    }
    if (query) {
      const matchName = (item.project.name || '').toLowerCase().includes(query);
      const matchCode = (item.project.code || '').toLowerCase().includes(query);
      const matchType = (item.project.projectType || 'Manual').toLowerCase().includes(query);
      const matchStatus = (item.project.status || 'ACTIVE').toLowerCase().includes(query);
      const matchOwner = (item.project.owner || '').toLowerCase().includes(query);
      const matchProduct = (item.project.product || '').toLowerCase().includes(query);
      const matchGeo = (item.project.geo || '').toLowerCase().includes(query);
      const matchDesc = (item.project.description || '').toLowerCase().includes(query);
      const matchHighlights = (item.latestUpdate?.highlights || '').toLowerCase().includes(query);
      const matchAuthor = (item.latestUpdate?.author || '').toLowerCase().includes(query);

      if (!matchName && !matchCode && !matchType && !matchStatus && !matchOwner && !matchProduct && !matchGeo && !matchDesc && !matchHighlights && !matchAuthor) {
        return false;
      }
    }
    return true;
  });
});

const ragRank: Record<RAGStatus, number> = {
  GREEN: 3,
  AMBER: 2,
  RED: 1,
};

// Sorted Project Health List
const sortedProjectHealthList = computed(() => {
  const list = [...filteredProjectHealthList.value];

  return list.sort((a, b) => {
    let comparison = 0;

    switch (sortField.value) {
      case 'code':
        comparison = (a.project.code || '').localeCompare(b.project.code || '');
        break;
      case 'name':
        comparison = (a.project.name || '').localeCompare(b.project.name || '');
        break;
      case 'type':
        comparison = (a.project.projectType || 'Manual').localeCompare(b.project.projectType || 'Manual');
        break;
      case 'product':
        comparison = (a.project.product || 'General').localeCompare(b.project.product || 'General');
        break;
      case 'geo':
        comparison = (a.project.geo || '').localeCompare(b.project.geo || '');
        break;
      case 'status':
        comparison = (a.project.status || 'ACTIVE').localeCompare(b.project.status || 'ACTIVE');
        break;
      case 'owner':
        comparison = (a.project.owner || '').localeCompare(b.project.owner || '');
        break;
      case 'rag':
        comparison = (ragRank[a.rag] || 0) - (ragRank[b.rag] || 0);
        break;
      case 'update': {
        const weekA = a.latestUpdate?.weekNumber || 0;
        const weekB = b.latestUpdate?.weekNumber || 0;
        const dateA = a.latestUpdate?.updateDate || '';
        const dateB = b.latestUpdate?.updateDate || '';
        comparison = weekA !== weekB ? weekA - weekB : dateA.localeCompare(dateB);
        break;
      }
      default:
        comparison = 0;
    }

    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
});
</script>
