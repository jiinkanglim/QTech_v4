<template>
  <div class="space-y-3 sm:space-y-4 pb-6">
    <!-- ======================================================== -->
    <!-- VIEW A: PROJECT SUMMARY & CHRONOLOGICAL UPDATES PAGE     -->
    <!-- ======================================================== -->
    <div v-if="activeSummaryProject" class="space-y-4">
      <!-- Breadcrumbs & Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f2238] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
        <div class="flex items-center space-x-2">
          <button
            id="back-to-directory-btn"
            @click="closeProjectSummary"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
            <span>Back to Project Directory</span>
          </button>

          <span class="text-slate-300 dark:text-slate-600">/</span>
          <span class="font-mono text-xs font-bold text-[#005386] dark:text-[#38bdf8]">
            {{ activeSummaryProject.code }}
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="openEditModal(activeSummaryProject)"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
          >
            <Edit3 class="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Project</span>
          </button>

          <button
            v-if="activeSummaryProject.scorecardConfig?.enabled?.length"
            @click="$emit('navigateToScorecard', activeSummaryProject.id)"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#e8f2f8] hover:bg-[#d5e7f4] dark:bg-[#0e2a42] dark:hover:bg-[#133857] text-[#005386] dark:text-[#38bdf8] font-semibold text-xs border border-[#bad8eb] dark:border-[#1d4d73] transition-colors cursor-pointer"
          >
            <ClipboardCheck class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
            <span>New Scorecard</span>
          </button>

          <button
            @click="$emit('navigateToEntry', activeSummaryProject.id)"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#005386] hover:bg-[#004169] text-white font-semibold text-xs shadow-md shadow-[#005386]/25 border border-[#005386] transition-all cursor-pointer"
          >
            <Plus class="w-3.5 h-3.5 text-[#7dd3fc]" />
            <span>Post New Status Entry</span>
          </button>
        </div>
      </div>

      <!-- Project Overview Header Card -->
      <div class="bg-white dark:bg-[#0f2238] p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-4">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="font-mono text-xs font-bold text-[#005386] dark:text-[#38bdf8] bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] px-2 py-0.5 rounded-md">
                {{ activeSummaryProject.code }}
              </span>
              <span :class="[
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                activeSummaryProject.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : activeSummaryProject.status === 'ON_HOLD'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              ]">
                {{ activeSummaryProject.status }}
              </span>
              <span class="px-2 py-0.5 rounded-md bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] text-[#005386] dark:text-[#7dd3fc] font-semibold text-[11px] flex items-center space-x-1">
                <Tag class="w-3 h-3 text-[#0082c3]" />
                <span>Product: {{ activeSummaryProject.product || 'General' }}</span>
              </span>
              <ProjectTypeBadge :type="activeSummaryProject.projectType" size="sm" />
              <span class="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] text-slate-700 dark:text-slate-300 font-semibold text-[11px] flex items-center space-x-1">
                <Globe class="w-3 h-3 text-[#0082c3]" />
                <span>GEO: {{ activeSummaryProject.geo }}</span>
              </span>
              <button
                v-if="activeSummaryProject.scorecardConfig?.enabled?.includes('SWE_MODEL')"
                type="button"
                @click="$emit('navigateToScorecard', activeSummaryProject.id, 'SWE_MODEL')"
                class="px-2 py-0.5 rounded-md bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] text-[#005386] dark:text-[#7dd3fc] font-bold text-[11px] hover:bg-[#d5e7f4] transition-colors cursor-pointer"
                title="Create/View Software Expert – Model Scoring Sheet"
              >
                SWE Scorecard
              </button>
              <button
                v-if="activeSummaryProject.scorecardConfig?.enabled?.includes('ORS_RAG')"
                type="button"
                @click="$emit('navigateToScorecard', activeSummaryProject.id, 'ORS_RAG')"
                class="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-[11px] hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors cursor-pointer"
                title="Create/View ORS – Optimizer RAG Sheet"
              >
                ORS Scorecard
              </button>
            </div>

            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ activeSummaryProject.name }}
            </h1>
            <p v-if="activeSummaryProject.description" class="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1.5 max-w-3xl leading-relaxed">
              {{ activeSummaryProject.description }}
            </p>
          </div>

          <!-- Quick Metadata Box -->
          <div class="grid grid-cols-2 gap-3 min-w-[260px] p-3.5 bg-slate-50/80 dark:bg-[#071524] rounded-xl border border-slate-200/80 dark:border-[#1b3654] text-xs">
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tech Lead</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                <User class="w-3 h-3 text-[#0082c3]" />
                <span>{{ activeSummaryProject.owner }}</span>
              </div>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Target Release</span>
              <div class="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1 mt-0.5">
                <Calendar class="w-3 h-3 text-[#0082c3]" />
                <span>{{ activeSummaryProject.targetDate || 'TBD' }}</span>
              </div>
            </div>
            <div class="col-span-2 pt-2 border-t border-slate-200/60 dark:border-[#1b3654]">
              <div class="flex items-center justify-between text-[11px] mb-1">
                <span class="text-slate-500 font-medium">Completion Progress</span>
                <span class="font-mono font-bold text-[#005386] dark:text-[#38bdf8]">{{ activeSummaryProject.completionPercentage }}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-gradient-to-r from-[#005386] to-[#0082c3] h-full rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min(100, Math.max(0, activeSummaryProject.completionPercentage || 0))}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Summary Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Status Reports</span>
          <span class="text-2xl font-black text-[#003b60] dark:text-white mt-0.5 block">
            {{ summaryProjectUpdates.length }}
          </span>
          <span class="text-[10px] text-slate-400">Weekly entries recorded</span>
        </div>

        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Latest Overall Health</span>
          <div class="mt-1.5 flex items-center space-x-2">
            <RAGBadge v-if="summaryProjectUpdates[0]" :status="summaryProjectUpdates[0].overallRag" size="md" />
            <span v-else class="text-xs text-slate-400 font-medium">No updates</span>
          </div>
          <span v-if="summaryProjectUpdates[0]" class="text-[10px] text-slate-400 block mt-1">Week {{ summaryProjectUpdates[0].weekNumber }} Status</span>
        </div>

        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Latest Status Date</span>
          <span class="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 block">
            {{ summaryProjectUpdates[0]?.updateDate || 'None' }}
          </span>
          <span class="text-[10px] text-slate-400">Latest submission</span>
        </div>

        <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Last Logged Author</span>
          <span class="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
            {{ summaryProjectUpdates[0]?.author || activeSummaryProject.owner }}
          </span>
          <span class="text-[10px] text-slate-400">Reporting engineer</span>
        </div>
      </div>

      <!-- Project Overall Health Trend & Delivery Trajectory Chart -->
      <ProjectHealthTrendChart
        :updates="summaryProjectUpdates"
        :project="activeSummaryProject"
      />

      <!-- Chronological Status Updates Feed -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <History class="w-4 h-4 text-[#005386] dark:text-[#38bdf8]" />
              <span>Status Updates & Chronological History</span>
              <span class="px-2 py-0.5 rounded-full bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] text-[11px] font-bold">
                {{ summaryProjectUpdates.length }}
              </span>
            </h2>
            <p class="text-slate-500 dark:text-slate-400 text-xs">
              Chronological audit trail with the latest weekly update at the top of the list.
            </p>
          </div>

          <button
            @click="$emit('navigateToEntry', activeSummaryProject.id)"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#005386] hover:bg-[#004169] text-white font-medium text-xs shadow-xs border border-[#005386] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus class="w-3.5 h-3.5 text-[#7dd3fc]" />
            <span>+ Log New Status Update</span>
          </button>
        </div>

        <!-- Empty Updates State -->
        <div
          v-if="summaryProjectUpdates.length === 0"
          class="bg-white dark:bg-[#0f2238] rounded-xl border border-dashed border-slate-300 dark:border-[#1b3654] p-8 text-center space-y-3"
        >
          <FileText class="w-8 h-8 text-slate-300 mx-auto" />
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">No Status Updates Recorded Yet</h3>
          <p class="text-slate-500 text-xs max-w-md mx-auto">
            There are currently no weekly status updates logged for {{ activeSummaryProject.name }}. Start logging weekly milestones, RAG ratings, and technical highlights.
          </p>
          <button
            @click="$emit('navigateToEntry', activeSummaryProject.id)"
            class="px-4 py-2 bg-[#005386] hover:bg-[#004169] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors inline-flex items-center space-x-1.5"
          >
            <Plus class="w-3.5 h-3.5 text-[#7dd3fc]" />
            <span>Log First Weekly Status Update</span>
          </button>
        </div>

        <!-- List of Chronological Status Updates (Latest First) -->
        <div v-else class="space-y-3.5">
          <div
            v-for="(update, idx) in summaryProjectUpdates"
            :key="update.id"
            class="bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden transition-all hover:border-[#0082c3]/60 dark:hover:border-[#0082c3]/60"
          >
            <!-- Update Header Bar -->
            <div class="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-[#071524]/60 border-b border-slate-100 dark:border-[#1b3654] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center space-x-2.5">
                <span class="px-2.5 py-1 rounded-lg bg-[#005386] text-white font-mono font-bold text-xs shadow-xs">
                  Week {{ update.weekNumber }}
                </span>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="text-xs font-bold text-slate-900 dark:text-white">
                      {{ update.updateDate }}
                    </span>
                    <span v-if="idx === 0" class="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Latest Update
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400">
                    Logged by <strong>{{ update.author }}</strong>
                  </div>
                </div>
              </div>

              <!-- RAG Status Indicators & Actions -->
              <div class="flex flex-wrap items-center gap-2">
                <div class="flex items-center space-x-1.5 bg-white dark:bg-[#0f2238] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1b3654]">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Overall:</span>
                  <RAGBadge :status="update.overallRag" size="sm" />
                </div>

                <div class="hidden sm:flex items-center space-x-1 bg-white dark:bg-[#0f2238] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1b3654] text-[11px]">
                  <span class="text-slate-400 text-[10px] uppercase font-bold mr-1">Pillars:</span>
                  <span :title="'Quality: ' + (update.qualityRag || 'GREEN')" :class="['px-1.5 py-0.2 rounded font-mono text-[10px] font-bold', update.qualityRag === 'RED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : update.qualityRag === 'AMBER' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300']">
                    Q: {{ update.qualityRag || 'G' }}
                  </span>
                  <span :title="'Schedule: ' + (update.scheduleRag || 'GREEN')" :class="['px-1.5 py-0.2 rounded font-mono text-[10px] font-bold', update.scheduleRag === 'RED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : update.scheduleRag === 'AMBER' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300']">
                    S: {{ update.scheduleRag || 'G' }}
                  </span>
                  <span :title="'Scope: ' + (update.scopeRag || 'GREEN')" :class="['px-1.5 py-0.2 rounded font-mono text-[10px] font-bold', update.scopeRag === 'RED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : update.scopeRag === 'AMBER' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300']">
                    Sc: {{ update.scopeRag || 'G' }}
                  </span>
                </div>

                <button
                  @click="$emit('navigateToEntry', activeSummaryProject.id, update.id)"
                  class="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-[#0f2238] dark:hover:bg-[#133758] rounded-lg border border-slate-200 dark:border-[#1b3654] text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
                  title="Edit this weekly status update"
                >
                  <Edit3 class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <span>Edit</span>
                </button>
              </div>
            </div>

            <!-- Narrative Details Body -->
            <div class="p-4 sm:p-5 space-y-3.5 text-xs">
              <!-- Technical Wins -->
              <div class="space-y-1">
                <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Technical Wins, PRs Merged & Milestones</span>
                </h4>
                <div class="p-3 bg-slate-50 dark:bg-[#071524] rounded-lg text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-[#1b3654] whitespace-pre-line">
                  {{ update.highlights }}
                </div>
              </div>

              <!-- Lowlights / Blockers -->
              <div v-if="update.lowlights" class="space-y-1">
                <h4 class="font-bold text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-1.5">
                  <AlertTriangle class="w-3.5 h-3.5" />
                  <span>Technical Blockers, Outages & Defect Debt</span>
                </h4>
                <div class="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg text-rose-900 dark:text-rose-200 leading-relaxed border border-rose-200/50 dark:border-rose-900/40 whitespace-pre-line">
                  {{ update.lowlights }}
                </div>
              </div>

              <!-- Next Steps -->
              <div v-if="update.nextSteps" class="space-y-1">
                <h4 class="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center space-x-1.5">
                  <Clock class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                  <span>Next Milestones / Targets & Architecture Focus</span>
                </h4>
                <div class="p-3 bg-slate-50 dark:bg-[#071524] rounded-lg text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-[#1b3654] whitespace-pre-line">
                  {{ update.nextSteps }}
                </div>
              </div>

              <!-- KPI Metric Progress -->
              <div v-if="update.kpiProgress" class="p-2.5 bg-[#e8f2f8]/60 dark:bg-[#0e2a42]/50 rounded-lg border border-[#bad8eb]/60 dark:border-[#1d4d73]/60 flex items-start space-x-2 text-[11px] text-[#005386] dark:text-[#7dd3fc]">
                <span class="font-bold uppercase tracking-wider shrink-0">Metric Note:</span>
                <span>{{ update.kpiProgress }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- VIEW B: PROJECT DIRECTORY (TABLE & CARDS)               -->
    <!-- ======================================================== -->
    <template v-else>
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-[#0f2238] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Software Project Directory
            </h1>
            <span class="px-2 py-0.5 rounded-full bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73] font-bold text-[11px]">
              {{ projects.length }} Running
            </span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Optimized directory to filter, sort, and manage concurrent software delivery projects. Click any project code or name to view its summary & update history.
          </p>
        </div>

        <button
          id="add-new-project-btn"
          @click="openAddModal"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#005386] hover:bg-[#004169] text-white font-medium text-xs shadow-xs border border-[#005386] transition-all cursor-pointer shrink-0"
        >
          <Plus class="w-3.5 h-3.5 text-[#7dd3fc]" />
          <span>Setup New Project</span>
        </button>
      </div>

      <!-- Filter and Control Bar -->
      <div class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2">
          <!-- Search -->
          <div class="sm:col-span-2 lg:col-span-4 relative">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-projects-input"
              type="text"
              placeholder="Search by name, key, lead, product, type..."
              v-model="searchTerm"
              class="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
            />
          </div>

          <!-- Project Type Filter -->
          <div class="sm:col-span-1 lg:col-span-2">
            <select
              id="type-filter-select"
              v-model="projectTypeFilter"
              class="w-full py-1.5 px-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-semibold"
            >
              <option value="ALL">All Types ({{ allExistingProjectTypes.length }})</option>
              <option v-for="t in allExistingProjectTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <!-- Product Filter Multi-Select Dropdown -->
          <div class="sm:col-span-1 lg:col-span-2">
            <MultiSelectDropdown
              id="product-filter-select"
              v-model="selectedProductFilters"
              :options="allExistingProducts"
              placeholder="All Products"
              label="Products"
              :counts="productCounts"
            />
          </div>

          <!-- GEO Filter -->
          <div class="sm:col-span-1 lg:col-span-2">
            <select
              id="geo-filter-select"
              v-model="geoFilter"
              class="w-full py-1.5 px-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
            >
              <option value="ALL">All GEOs</option>
              <option v-for="g in geos" :key="g" :value="g">GEO: {{ g }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div class="sm:col-span-1 lg:col-span-2">
            <select
              id="status-filter-select"
              v-model="statusFilter"
              class="w-full py-1.5 px-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_HOLD">ON HOLD</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        <!-- View Mode & Sort Bar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#1b3654] text-[11px]">
          <div class="flex items-center space-x-1.5 text-slate-500">
            <span>Showing <strong class="text-[#005386] dark:text-[#38bdf8]">{{ sortedProjects.length }}</strong> of {{ projects.length }} projects</span>
          </div>

          <div class="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div class="flex items-center space-x-1 overflow-x-auto flex-wrap gap-y-1">
              <span class="text-slate-400 font-medium mr-0.5">Sort:</span>
              <button
                @click="toggleSort('code')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'code'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>Code</span>
                <ArrowUp v-if="sortField === 'code' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'code' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>

              <button
                @click="toggleSort('name')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'name'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>Name</span>
                <ArrowUp v-if="sortField === 'name' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'name' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>

              <button
                @click="toggleSort('type')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'type'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>Type</span>
                <ArrowUp v-if="sortField === 'type' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'type' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>

              <button
                @click="toggleSort('product')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'product'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>Product</span>
                <ArrowUp v-if="sortField === 'product' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'product' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>

              <button
                @click="toggleSort('geo')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'geo'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>GEO</span>
                <ArrowUp v-if="sortField === 'geo' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'geo' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>

              <button
                @click="toggleSort('status')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'status'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>Status</span>
                <ArrowUp v-if="sortField === 'status' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'status' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>

              <button
                @click="toggleSort('owner')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'owner'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>Lead</span>
                <ArrowUp v-if="sortField === 'owner' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'owner' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>

              <button
                @click="toggleSort('targetDate')"
                :class="[
                  'px-2 py-0.5 rounded-md border font-medium flex items-center space-x-1 cursor-pointer transition-colors text-[10px]',
                  sortField === 'targetDate'
                    ? 'bg-[#e8f2f8] border-[#bad8eb] text-[#005386] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73] font-bold'
                    : 'bg-slate-50 dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <span>Target</span>
                <ArrowUp v-if="sortField === 'targetDate' && sortOrder === 'asc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowDown v-else-if="sortField === 'targetDate' && sortOrder === 'desc'" class="w-3 h-3 text-[#005386] dark:text-[#38bdf8]" />
                <ArrowUpDown v-else class="w-3 h-3 opacity-60" />
              </button>
            </div>

            <div class="flex items-center bg-slate-100 dark:bg-[#071524] p-0.5 rounded-lg border border-slate-200 dark:border-[#1b3654] shrink-0">
              <button
                @click="viewMode = 'table'"
                :class="[
                  'px-2 py-0.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer',
                  viewMode === 'table' ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                ]"
              >
                <List class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Dense Table</span>
              </button>

              <button
                @click="viewMode = 'grid'"
                :class="[
                  'px-2 py-0.5 rounded-md text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer',
                  viewMode === 'grid' ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                ]"
              >
                <LayoutGrid class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Cards Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="sortedProjects.length === 0" class="bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] p-8 text-center space-y-2">
        <Briefcase class="w-8 h-8 text-slate-300 mx-auto" />
        <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">No Projects Matched Filters</h3>
        <p class="text-slate-500 text-xs max-w-md mx-auto">
          No active software projects match your current search query or Product / GEO filters.
        </p>
        <button
          @click="clearFilters"
          class="px-3 py-1.5 bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] rounded-lg text-xs font-semibold hover:underline cursor-pointer border border-[#bad8eb] dark:border-[#1d4d73]"
        >
          Clear All Filters
        </button>
      </div>

      <!-- Dense Table View -->
      <div v-else-if="viewMode === 'table'" class="bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 dark:bg-[#071524] border-b border-slate-200 dark:border-[#1b3654] text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th
                  @click="toggleSort('code')"
                  class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                  title="Sort by Code / Key"
                >
                  <div class="flex items-center space-x-1">
                    <span>Code / Key</span>
                    <ArrowUp v-if="sortField === 'code' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                    <ArrowDown v-else-if="sortField === 'code' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                    <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                  </div>
                </th>

                <th
                  @click="toggleSort('name')"
                  class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                  title="Sort by Software Project Name"
                >
                  <div class="flex items-center space-x-1">
                    <span>Software Project</span>
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
                    <span>Product Suite</span>
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
                  title="Sort by Lifecycle Status"
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
                  @click="toggleSort('targetDate')"
                  class="py-2.5 px-3 cursor-pointer select-none hover:text-[#005386] dark:hover:text-[#38bdf8] transition-colors"
                  title="Sort by Target Release Date"
                >
                  <div class="flex items-center space-x-1">
                    <span>Target Release</span>
                    <ArrowUp v-if="sortField === 'targetDate' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                    <ArrowDown v-else-if="sortField === 'targetDate' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
                    <ArrowUpDown v-else class="w-3 h-3 text-slate-300 dark:text-slate-600 opacity-60" />
                  </div>
                </th>

                <th class="py-2.5 px-3">Scorecards</th>

                <th class="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-[#1b3654]/60 text-xs">
              <tr
                v-for="project in sortedProjects"
                :key="project.id"
                class="hover:bg-[#005386]/5 dark:hover:bg-[#005386]/20 transition-colors group"
              >
                <!-- Code / Key Column -->
                <td class="py-2 px-3 font-mono font-bold text-[#005386] dark:text-[#38bdf8] whitespace-nowrap">
                  <button
                    @click="openProjectSummary(project.id)"
                    class="hover:underline cursor-pointer font-mono font-bold text-[#005386] dark:text-[#38bdf8] text-left flex items-center space-x-1 group/code"
                    title="Open Project Summary & Status Updates"
                  >
                    <span>{{ project.code }}</span>
                    <ExternalLink class="w-3 h-3 opacity-0 group-hover/code:opacity-100 transition-opacity" />
                  </button>
                </td>

                <!-- Software Project Name Column -->
                <td class="py-2 px-3">
                  <button
                    @click="openProjectSummary(project.id)"
                    class="font-bold text-slate-900 dark:text-white text-xs hover:text-[#005386] dark:hover:text-[#38bdf8] hover:underline cursor-pointer text-left transition-colors flex items-center space-x-1 group/name"
                    title="Open Project Summary & Status Updates"
                  >
                    <span>{{ project.name }}</span>
                    <ChevronRight class="w-3 h-3 opacity-0 group-hover/name:opacity-100 transition-opacity text-[#005386] dark:text-[#38bdf8]" />
                  </button>
                </td>

                <td class="py-2 px-3 whitespace-nowrap">
                  <ProjectTypeBadge :type="project.projectType" size="xs" />
                </td>

                <td class="py-2 px-3 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-md bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] text-[#005386] dark:text-[#7dd3fc] font-semibold text-[10px] flex items-center space-x-1 w-fit">
                    <Tag class="w-2.5 h-2.5 text-[#0082c3]" />
                    <span>{{ project.product || 'General' }}</span>
                  </span>
                </td>

                <td class="py-2 px-3 whitespace-nowrap">
                  <span class="font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1 text-xs">
                    <Globe class="w-2.5 h-2.5 text-[#0082c3]" />
                    <span>{{ project.geo }}</span>
                  </span>
                </td>

                <!-- Status Column with ProjectStatusBadge -->
                <td class="py-2 px-3 whitespace-nowrap">
                  <ProjectStatusBadge :status="project.status" size="xs" />
                </td>

                <td class="py-2 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                  {{ project.owner }}
                </td>

                <td class="py-2 px-3 text-slate-500 whitespace-nowrap text-xs">
                  {{ project.targetDate }}
                </td>

                <!-- Scorecards Chips Column -->
                <td class="py-2 px-3 whitespace-nowrap">
                  <div v-if="project.scorecardConfig?.enabled?.length" class="flex items-center space-x-1">
                    <span
                      v-if="project.scorecardConfig.enabled.includes('SWE_MODEL')"
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]"
                      title="Software Expert – Model Scoring Sheet"
                    >
                      SWE
                    </span>
                    <span
                      v-if="project.scorecardConfig.enabled.includes('ORS_RAG')"
                      class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      title="ORS – Optimizer RAG Sheet"
                    >
                      ORS
                    </span>
                  </div>
                  <span v-else class="text-slate-300 dark:text-slate-600 text-xs">—</span>
                </td>

                <td class="py-2 px-3 text-right whitespace-nowrap space-x-1.5 text-xs">
                  <button
                    @click="$emit('navigateToEntry', project.id)"
                    class="px-2 py-0.5 bg-[#e8f2f8] hover:bg-[#d8eaf5] text-[#005386] dark:bg-[#0e2a42] dark:hover:bg-[#133758] dark:text-[#7dd3fc] rounded-md font-semibold text-[11px] border border-[#bad8eb]/70 dark:border-[#1d4d73]/70 cursor-pointer transition-colors"
                  >
                    + Log Status
                  </button>
                  <button
                    @click="openEditModal(project)"
                    class="p-1 text-slate-400 hover:text-[#005386] dark:hover:text-[#38bdf8] cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit3 class="w-3.5 h-3.5 inline" />
                  </button>
                  <button
                    @click="deletingProject = project"
                    class="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 class="w-3.5 h-3.5 inline" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cards Grid View -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="project in sortedProjects"
          :key="project.id"
          class="bg-white dark:bg-[#0f2238] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs hover:border-[#0082c3]/60 dark:hover:border-[#0082c3]/60 hover:shadow-md transition-all space-y-2.5 flex flex-col justify-between"
        >
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <div class="flex items-center space-x-1.5">
                  <button
                    @click="openProjectSummary(project.id)"
                    class="font-mono text-[10px] font-bold text-[#005386] dark:text-[#38bdf8] bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] px-1.5 py-0.2 rounded hover:underline cursor-pointer"
                    title="Open Project Summary & Status Updates"
                  >
                    {{ project.code }}
                  </button>
                  <span :class="[
                    'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full',
                    project.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : project.status === 'ON_HOLD' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  ]">
                    {{ project.status }}
                  </span>
                </div>
                <h3 class="font-bold text-slate-900 dark:text-white text-sm mt-1">
                  <button
                    @click="openProjectSummary(project.id)"
                    class="hover:text-[#005386] dark:hover:text-[#38bdf8] hover:underline cursor-pointer text-left transition-colors"
                    title="Open Project Summary & Status Updates"
                  >
                    {{ project.name }}
                  </button>
                </h3>
              </div>

              <div class="flex items-center space-x-0.5 shrink-0">
                <button
                  @click="openEditModal(project)"
                  class="p-1 rounded-md text-slate-400 hover:text-[#005386] dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-[#071524] transition-colors cursor-pointer"
                  title="Edit Project"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="deletingProject = project"
                  class="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-[#071524] transition-colors cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="flex items-center space-x-1.5 text-xs">
              <span class="text-slate-400 font-medium text-[11px]">Type:</span>
              <ProjectTypeBadge :type="project.projectType" size="xs" />
            </div>

            <div class="flex items-center space-x-1.5 text-xs">
              <span class="text-slate-400 font-medium text-[11px]">Product:</span>
              <span class="px-2 py-0.5 rounded-md bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] text-[#005386] dark:text-[#7dd3fc] font-bold text-[10px]">
                {{ project.product || 'General' }}
              </span>
            </div>

            <div class="flex items-center space-x-1.5 text-xs">
              <span class="text-slate-400 font-medium text-[11px]">GEO:</span>
              <span class="font-bold text-slate-700 dark:text-slate-300 text-xs">
                {{ project.geo }}
              </span>
            </div>

            <div v-if="project.scorecardConfig?.enabled?.length" class="flex items-center space-x-1.5 text-xs">
              <span class="text-slate-400 font-medium text-[11px]">Scorecards:</span>
              <div class="flex items-center space-x-1">
                <span
                  v-if="project.scorecardConfig.enabled.includes('SWE_MODEL')"
                  class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]"
                >
                  SWE
                </span>
                <span
                  v-if="project.scorecardConfig.enabled.includes('ORS_RAG')"
                  class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                >
                  ORS
                </span>
              </div>
            </div>

            <p v-if="project.description" class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {{ project.description }}
            </p>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-[#1b3654] space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span>Tech Lead: <strong>{{ project.owner }}</strong></span>
              <span>Target: <strong>{{ project.targetDate }}</strong></span>
            </div>

            <div class="flex items-center justify-between gap-2 pt-1">
              <button
                @click="openProjectSummary(project.id)"
                class="text-xs font-semibold text-[#005386] dark:text-[#38bdf8] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <span>View Summary</span>
                <ChevronRight class="w-3 h-3" />
              </button>

              <button
                @click="$emit('navigateToEntry', project.id)"
                class="px-2 py-1 bg-[#e8f2f8] hover:bg-[#d8eaf5] text-[#005386] dark:bg-[#0e2a42] dark:hover:bg-[#133758] dark:text-[#7dd3fc] rounded-md font-semibold text-[11px] border border-[#bad8eb]/70 dark:border-[#1d4d73]/70 cursor-pointer transition-colors"
              >
                + Log Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ======================================================== -->
    <!-- ADD / EDIT PROJECT MODAL DIALOG                          -->
    <!-- ======================================================== -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-3">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-lg bg-[#e8f2f8] dark:bg-[#0e2a42] flex items-center justify-center text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]">
                <Briefcase class="w-4 h-4" />
              </div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                {{ editingProject ? 'Edit Software Project' : 'Setup New Delivery Project' }}
              </h2>
            </div>
            <button
              @click="isModalOpen = false"
              class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleSave" class="space-y-3.5">
            <!-- Project Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name <span class="text-rose-500">*</span>
              </label>
              <input
                id="modal-project-name"
                type="text"
                v-model="name"
                placeholder="e.g., Quintiq Dispatch Planner 2026"
                required
                class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Code / Repo Key -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Code / Key <span class="text-rose-500">*</span>
                </label>
                <input
                  id="modal-project-code"
                  type="text"
                  v-model="code"
                  placeholder="e.g., DELMIA-DISP"
                  required
                  class="w-full p-2 font-mono bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white uppercase"
                />
              </div>

              <!-- Product Suite -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Suite <span class="text-rose-500">*</span>
                </label>
                <select
                  v-if="!isCustomProduct"
                  id="modal-project-product"
                  v-model="selectedProduct"
                  class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
                >
                  <option v-for="p in allExistingProducts" :key="p" :value="p">{{ p }}</option>
                  <option value="__NEW__">+ Custom Product Suite...</option>
                </select>
                <div v-else class="flex items-center space-x-1">
                  <input
                    type="text"
                    v-model="customProductInput"
                    placeholder="Enter product name..."
                    class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    @click="isCustomProduct = false"
                    class="p-2 text-slate-400 hover:text-slate-600 text-xs"
                    title="Cancel custom product"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Project Type -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Type <span class="text-rose-500">*</span>
                </label>
                <select
                  id="modal-project-type"
                  v-model="projectType"
                  required
                  class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
                >
                  <option v-for="t in allExistingProjectTypes" :key="t" :value="t">{{ t }}</option>
                </select>
                <p class="text-[10px] text-slate-400 mt-1">
                  Choose delivery model configured in Master Data (e.g. Manual, Optimization).
                </p>
              </div>

              <!-- GEO Region -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  GEO Region <span class="text-rose-500">*</span>
                </label>
                <select
                  id="modal-project-geo"
                  v-model="geo"
                  class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
                >
                  <option v-for="g in geos" :key="g" :value="g">{{ g }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Tech Lead Owner -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tech Lead / Owner <span class="text-rose-500">*</span>
                </label>
                <input
                  id="modal-project-owner"
                  type="text"
                  v-model="owner"
                  placeholder="e.g., Alex Mercer"
                  required
                  class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
                />
              </div>

              <!-- Target Release Date -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Release Date
                </label>
                <input
                  id="modal-project-date"
                  type="date"
                  v-model="targetDate"
                  class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <!-- Project Status -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Status
              </label>
              <select
                id="modal-project-status"
                v-model="status"
                class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_HOLD">ON HOLD</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Architecture Overview / Scope
              </label>
              <textarea
                id="modal-project-desc"
                v-model="description"
                rows="2"
                placeholder="High-level architecture, technical scope, objectives..."
                class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <!-- Quality Scorecards Section -->
            <div class="p-3.5 bg-slate-50/80 dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <ClipboardCheck class="w-4 h-4 text-[#005386] dark:text-[#38bdf8]" />
                  <span class="text-xs font-bold text-slate-900 dark:text-white">Quality Scorecards</span>
                </div>
                <span class="text-[10px] text-slate-500">Periodic quality assessments</span>
              </div>

              <div class="space-y-2">
                <!-- Template 1: SWE_MODEL -->
                <div class="p-2.5 bg-white dark:bg-[#0f2238] rounded-lg border border-slate-200 dark:border-[#1b3654] space-y-2">
                  <label class="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="modal-scorecard-swe-checkbox"
                      v-model="scorecardSweEnabled"
                      class="rounded border-slate-300 text-[#005386] focus:ring-[#005386] w-4 h-4"
                    />
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Software Expert – Model Scoring Sheet
                    </span>
                  </label>
                  <div v-if="scorecardSweEnabled" class="pl-6 pt-1">
                    <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Assigned SWE Assessor
                    </label>
                    <input
                      type="text"
                      v-model="scorecardSweAssessor"
                      placeholder="e.g. Lead Software Expert / QA-QS name"
                      class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
                    />
                  </div>
                </div>

                <!-- Template 2: ORS_RAG -->
                <div class="p-2.5 bg-white dark:bg-[#0f2238] rounded-lg border border-slate-200 dark:border-[#1b3654] space-y-2">
                  <label class="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="modal-scorecard-ors-checkbox"
                      v-model="scorecardOrsEnabled"
                      class="rounded border-slate-300 text-[#005386] focus:ring-[#005386] w-4 h-4"
                    />
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ORS – Optimizer RAG Sheet
                    </span>
                  </label>
                  <div v-if="scorecardOrsEnabled" class="pl-6 pt-1">
                    <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Assigned ORS Assessor
                    </label>
                    <input
                      type="text"
                      v-model="scorecardOrsAssessor"
                      placeholder="e.g. Optimization Research Scientist name"
                      class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
                    />
                  </div>
                </div>

                <!-- Cadence and Start Week (when at least one enabled) -->
                <div v-if="scorecardSweEnabled || scorecardOrsEnabled" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cadence
                    </label>
                    <select
                      v-model="scorecardCadence"
                      class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Week (e.g. 2026-W44)
                    </label>
                    <input
                      type="text"
                      v-model="scorecardStartPeriod"
                      placeholder="YYYY-Www e.g. 2026-W44"
                      class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1b3654]">
              <button
                v-if="editingProject"
                type="button"
                @click="
                  deletingProject = editingProject;
                  isModalOpen = false;
                "
                class="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                Delete Project
              </button>
              <div v-else />

              <div class="flex items-center space-x-3">
                <button
                  type="button"
                  @click="isModalOpen = false"
                  class="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-[#071524] text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer border border-slate-200 dark:border-[#1b3654]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-project-btn"
                  class="px-5 py-2 text-xs font-semibold bg-[#005386] hover:bg-[#004169] text-white rounded-xl shadow-md border border-[#005386] cursor-pointer"
                >
                  {{ editingProject ? 'Update Project' : 'Create Delivery Project' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :isOpen="!!deletingProject"
      title="Delete Delivery Project"
      :message="`Are you sure you want to delete '${deletingProject?.name}' and all its weekly status entries? This action cannot be undone.`"
      confirmText="Delete Project"
      @confirm="handleConfirmDelete"
      @cancel="deletingProject = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useProjects } from '../composables/useProjects';
import ConfirmModal from './ConfirmModal.vue';
import RAGBadge from './RAGBadge.vue';
import ProjectTypeBadge from './ProjectTypeBadge.vue';
import ProjectStatusBadge from './ProjectStatusBadge.vue';
import ProjectHealthTrendChart from './ProjectHealthTrendChart.vue';
import MultiSelectDropdown from './MultiSelectDropdown.vue';
import { Project, ProjectStatus, GeoRegion, ProjectType, ScorecardTemplateId } from '../types';
import { isoWeekOf, periodKey } from '../scoring/period';
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  Globe,
  X,
  LayoutGrid,
  List,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Tag,
  Briefcase,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  History,
  ClipboardCheck,
} from 'lucide-vue-next';

const props = defineProps<{
  initialProjectId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'navigateToEntry', projectId?: string | null, updateId?: string | null): void;
  (e: 'navigateToScorecard', projectId: string, templateId?: ScorecardTemplateId): void;
  (e: 'closeSummary'): void;
  (e: 'selectProject', projectId: string): void;
}>();

const { projects, products, geos, projectTypes, addProject, updateProject, deleteProject, getProjectUpdates } = useProjects();

const searchTerm = ref('');
const selectedProductFilters = ref<string[]>([]);
const projectTypeFilter = ref('ALL');
const geoFilter = ref('ALL');
const statusFilter = ref('ALL');

const productCounts = computed(() => {
  const map: Record<string, number> = {};
  projects.value.forEach((p) => {
    const prod = p.product || 'General';
    map[prod] = (map[prod] || 0) + 1;
  });
  return map;
});

type ProjectDirectorySortField =
  | 'code'
  | 'name'
  | 'type'
  | 'product'
  | 'geo'
  | 'status'
  | 'owner'
  | 'targetDate';

const sortField = ref<ProjectDirectorySortField>('code');
const sortOrder = ref<'asc' | 'desc'>('asc');
const viewMode = ref<'table' | 'grid'>('table');

// Selected Project for Summary Page
const selectedSummaryProjectId = ref<string | null>(props.initialProjectId || null);

watch(
  () => props.initialProjectId,
  (newId) => {
    selectedSummaryProjectId.value = newId || null;
    if (newId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  { immediate: true }
);

const activeSummaryProject = computed(() => {
  if (!selectedSummaryProjectId.value) return null;
  return projects.value.find((p) => p.id === selectedSummaryProjectId.value) || null;
});

const summaryProjectUpdates = computed(() => {
  if (!selectedSummaryProjectId.value) return [];
  // getProjectUpdates returns updates sorted by updateDate desc (chronological with latest at top)
  return getProjectUpdates(selectedSummaryProjectId.value);
});

const openProjectSummary = (projectId: string) => {
  selectedSummaryProjectId.value = projectId;
  emit('selectProject', projectId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const closeProjectSummary = () => {
  selectedSummaryProjectId.value = null;
  emit('closeSummary');
};

// Modal States
const isModalOpen = ref(false);
const editingProject = ref<Project | null>(null);
const deletingProject = ref<Project | null>(null);

// Form Fields
const name = ref('');
const code = ref('');
const projectType = ref<ProjectType>('Manual');
const selectedProduct = ref('');
const isCustomProduct = ref(false);
const customProductInput = ref('');
const geo = ref<GeoRegion>('Global');
const owner = ref('');
const targetDate = ref('');
const status = ref<ProjectStatus>('ACTIVE');
const description = ref('');

// Scorecard Form Fields
const scorecardSweEnabled = ref(false);
const scorecardOrsEnabled = ref(false);
const scorecardCadence = ref<'weekly' | 'biweekly'>('weekly');
const scorecardSweAssessor = ref('');
const scorecardOrsAssessor = ref('');
const scorecardStartPeriod = ref('');

const allExistingProducts = computed(() => {
  const set = new Set<string>(products.value);
  projects.value.forEach((p) => {
    if (p.product) set.add(p.product);
  });
  return Array.from(set).sort();
});

const allExistingProjectTypes = computed(() => {
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

const toggleSort = (field: ProjectDirectorySortField) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortOrder.value = 'asc';
  }
};

const clearFilters = () => {
  searchTerm.value = '';
  selectedProductFilters.value = [];
  projectTypeFilter.value = 'ALL';
  geoFilter.value = 'ALL';
  statusFilter.value = 'ALL';
};

const sortedProjects = computed(() => {
  const filtered = projects.value.filter((p) => {
    if (searchTerm.value.trim()) {
      const q = searchTerm.value.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchOwner = p.owner.toLowerCase().includes(q);
      const matchProd = (p.product || '').toLowerCase().includes(q);
      const matchGeo = p.geo.toLowerCase().includes(q);
      const matchType = (p.projectType || 'Manual').toLowerCase().includes(q);
      const matchStatus = (p.status || 'ACTIVE').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchOwner && !matchProd && !matchGeo && !matchType && !matchStatus) {
        return false;
      }
    }

    if (
      selectedProductFilters.value.length > 0 &&
      !selectedProductFilters.value.includes(p.product || 'General')
    ) {
      return false;
    }

    if (projectTypeFilter.value !== 'ALL' && (p.projectType || 'Manual') !== projectTypeFilter.value) {
      return false;
    }

    if (geoFilter.value !== 'ALL' && p.geo !== geoFilter.value) {
      return false;
    }

    if (statusFilter.value !== 'ALL' && p.status !== statusFilter.value) {
      return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    let valA = '';
    let valB = '';

    switch (sortField.value) {
      case 'code':
        valA = (a.code || '').toLowerCase();
        valB = (b.code || '').toLowerCase();
        break;
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case 'type':
        valA = (a.projectType || 'Manual').toLowerCase();
        valB = (b.projectType || 'Manual').toLowerCase();
        break;
      case 'product':
        valA = (a.product || 'General').toLowerCase();
        valB = (b.product || 'General').toLowerCase();
        break;
      case 'geo':
        valA = a.geo.toLowerCase();
        valB = b.geo.toLowerCase();
        break;
      case 'status':
        valA = (a.status || 'ACTIVE').toLowerCase();
        valB = (b.status || 'ACTIVE').toLowerCase();
        break;
      case 'owner':
        valA = (a.owner || '').toLowerCase();
        valB = (b.owner || '').toLowerCase();
        break;
      case 'targetDate':
        valA = (a.targetDate || '').toLowerCase();
        valB = (b.targetDate || '').toLowerCase();
        break;
    }

    if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
    return 0;
  });
});

const openAddModal = () => {
  editingProject.value = null;
  name.value = '';
  code.value = '';
  projectType.value = (allExistingProjectTypes.value[0] || 'Manual') as ProjectType;
  selectedProduct.value = allExistingProducts.value[0] || 'CP';
  isCustomProduct.value = false;
  customProductInput.value = '';
  geo.value = 'Global';
  owner.value = '';
  targetDate.value = '';
  status.value = 'ACTIVE';
  description.value = '';
  scorecardSweEnabled.value = false;
  scorecardOrsEnabled.value = false;
  scorecardCadence.value = 'weekly';
  scorecardSweAssessor.value = '';
  scorecardOrsAssessor.value = '';
  const curPeriod = isoWeekOf(new Date());
  scorecardStartPeriod.value = periodKey(curPeriod.year, curPeriod.week);
  isModalOpen.value = true;
};

const openEditModal = (p: Project) => {
  editingProject.value = p;
  name.value = p.name;
  code.value = p.code;
  projectType.value = p.projectType || 'Manual';
  const prod = p.product || 'General';
  selectedProduct.value = prod;
  isCustomProduct.value = false;
  customProductInput.value = '';
  geo.value = p.geo;
  owner.value = p.owner;
  targetDate.value = p.targetDate;
  status.value = p.status;
  description.value = p.description;

  const curPeriod = isoWeekOf(new Date());
  const cfg = p.scorecardConfig;
  scorecardSweEnabled.value = cfg?.enabled?.includes('SWE_MODEL') ?? false;
  scorecardOrsEnabled.value = cfg?.enabled?.includes('ORS_RAG') ?? false;
  scorecardCadence.value = cfg?.cadence || 'weekly';
  scorecardSweAssessor.value = cfg?.assessors?.SWE_MODEL || '';
  scorecardOrsAssessor.value = cfg?.assessors?.ORS_RAG || '';
  scorecardStartPeriod.value = cfg?.startPeriod || periodKey(curPeriod.year, curPeriod.week);

  isModalOpen.value = true;
};

const handleSave = () => {
  if (!name.value.trim()) return;

  const finalProduct = isCustomProduct.value
    ? customProductInput.value.trim() || 'General'
    : selectedProduct.value || 'General';

  const enabledTemplates: ScorecardTemplateId[] = [];
  if (scorecardSweEnabled.value) enabledTemplates.push('SWE_MODEL');
  if (scorecardOrsEnabled.value) enabledTemplates.push('ORS_RAG');

  const scorecardConfig = enabledTemplates.length > 0
    ? {
        enabled: enabledTemplates,
        cadence: scorecardCadence.value,
        assessors: {
          SWE_MODEL: scorecardSweAssessor.value.trim() || undefined,
          ORS_RAG: scorecardOrsAssessor.value.trim() || undefined,
        },
        startPeriod: scorecardStartPeriod.value.trim() || undefined,
      }
    : undefined;

  const payload = {
    name: name.value.trim(),
    code: code.value.trim() || name.value.substring(0, 4).toUpperCase(),
    product: finalProduct,
    projectType: projectType.value,
    geo: geo.value,
    owner: owner.value.trim(),
    ownerEmail: `${owner.value.toLowerCase().replace(/\s+/g, '.')}@company.com`,
    targetDate: targetDate.value || '2026-12-31',
    status: status.value,
    description: description.value.trim(),
    completionPercentage: editingProject.value?.completionPercentage ?? 50,
    scorecardConfig,
  };

  if (editingProject.value) {
    updateProject(editingProject.value.id, payload);
  } else {
    addProject(payload);
  }

  isModalOpen.value = false;
};

const handleConfirmDelete = () => {
  if (deletingProject.value) {
    const delId = deletingProject.value.id;
    deleteProject(delId);
    if (editingProject.value?.id === delId) {
      isModalOpen.value = false;
    }
    if (selectedSummaryProjectId.value === delId) {
      selectedSummaryProjectId.value = null;
    }
    deletingProject.value = null;
  }
};
</script>
