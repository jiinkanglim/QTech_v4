<template>
  <div class="space-y-4 pb-8">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-0.5 rounded-full bg-[#e8f2f8] dark:bg-[#0082c3]/20 text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#0082c3]/40 font-mono text-[10px] font-bold uppercase tracking-wider">
            Quality Assurance & Optimization
          </span>
          <span class="text-slate-500 dark:text-slate-300 text-xs font-medium">
            • {{ filteredScorecards.length }} of {{ scorecards.length }} Scorecards
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Quality Scorecard Register
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5 max-w-2xl leading-relaxed">
          Periodic quality scorecards across software delivery projects. Track model architecture reviews (SWE) and mathematical optimizer performance (ORS).
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 shrink-0">
        <!-- Export Summary CSV -->
        <button
          type="button"
          @click="handleExportSummary"
          title="Export filtered scorecards summary to CSV"
          class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-all cursor-pointer"
        >
          <Download class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
          <span>Summary CSV</span>
        </button>

        <!-- Export Detail CSV -->
        <button
          type="button"
          @click="handleExportDetail"
          title="Export filtered scorecards item-level detail to CSV"
          class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-all cursor-pointer"
        >
          <Download class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Detail CSV</span>
        </button>

        <!-- Import Excel Button -->
        <button
          type="button"
          @click="showImportDialog = true"
          title="Import scorecards from Excel .xlsx / .xlsm"
          class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-all cursor-pointer"
        >
          <Upload class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Import Excel</span>
        </button>

        <!-- Trends View Button -->
        <button
          type="button"
          @click="$emit('viewTrends')"
          class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-[#005386] dark:text-[#38bdf8] font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-all cursor-pointer"
        >
          <BarChart3 class="w-3.5 h-3.5" />
          <span>Trends</span>
        </button>

        <!-- New Scorecard Button -->
        <button
          type="button"
          @click="$emit('newScorecard')"
          class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] text-white font-semibold text-xs shadow-md shadow-[#005386]/25 border border-[#005386] transition-all cursor-pointer"
        >
          <PlusCircle class="w-4 h-4 text-[#7dd3fc]" />
          <span>New Scorecard</span>
        </button>
      </div>
    </div>

    <!-- Toolbar Filters -->
    <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
      <!-- Row 1: Search & Main Filters -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <!-- Search -->
        <div class="relative lg:col-span-2">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search project name, code, assessor..."
            class="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
          />
        </div>

        <!-- Project Filter -->
        <div>
          <select
            v-model="selectedProject"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Projects</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">
              {{ p.name }} ({{ p.code }})
            </option>
          </select>
        </div>

        <!-- Role Filter (SWE / ORS / All) -->
        <div>
          <select
            v-model="selectedRole"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="SWE_MODEL">SWE Model (Lead Software Expert)</option>
            <option value="ORS_RAG">ORS RAG (Optimizer Scientist)</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            v-model="selectedStatus"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <!-- Row 2: Secondary Filters -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1b3654]">
        <!-- Overall RAG -->
        <div>
          <select
            v-model="selectedRag"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">Overall RAG: All</option>
            <option value="G">Green (Good)</option>
            <option value="A">Amber (Warning)</option>
            <option value="R">Red (Trouble)</option>
          </select>
        </div>

        <!-- Product Suite -->
        <div>
          <select
            v-model="selectedProduct"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All Products</option>
            <option v-for="prod in products" :key="prod" :value="prod">{{ prod }}</option>
          </select>
        </div>

        <!-- GEO -->
        <div>
          <select
            v-model="selectedGeo"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          >
            <option value="ALL">All GEOs</option>
            <option v-for="geo in geos" :key="geo" :value="geo">{{ geo }}</option>
          </select>
        </div>

        <!-- From Period -->
        <div>
          <input
            v-model="fromPeriod"
            type="text"
            placeholder="From: e.g. 2026-W30"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-mono"
          />
        </div>

        <!-- To Period -->
        <div class="col-span-2 sm:col-span-1">
          <input
            v-model="toPeriod"
            type="text"
            placeholder="To: e.g. 2026-W52"
            class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-mono"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white dark:bg-[#0f2238] p-12 rounded-xl border border-slate-200 dark:border-[#1b3654] text-center">
      <Loader2 class="w-8 h-8 animate-spin mx-auto text-[#005386] dark:text-[#38bdf8]" />
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">Loading scorecards...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredScorecards.length === 0"
      class="bg-white dark:bg-[#0f2238] p-12 rounded-xl border border-slate-200 dark:border-[#1b3654] text-center space-y-3"
    >
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#071524] flex items-center justify-center mx-auto text-slate-400">
        <ClipboardCheck class="w-6 h-6" />
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">No scorecards found</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
        No quality scorecards match your current filters. Clear filters or create a new quality scorecard.
      </p>
      <button
        type="button"
        @click="$emit('newScorecard')"
        class="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <PlusCircle class="w-4 h-4 text-[#7dd3fc]" />
        <span>Create Scorecard</span>
      </button>
    </div>

    <!-- Desktop Table View (>= md) -->
    <div v-else class="hidden md:block bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/80 dark:bg-[#071524]/80 border-b border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <th @click="toggleSort('period')" class="py-3 px-3.5 cursor-pointer hover:text-[#005386] select-none">
                Period <span v-if="sortField === 'period'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('project')" class="py-3 px-3 cursor-pointer hover:text-[#005386] select-none">
                Project <span v-if="sortField === 'project'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('role')" class="py-3 px-3 cursor-pointer hover:text-[#005386] select-none">
                Role <span v-if="sortField === 'role'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('overall')" class="py-3 px-3 text-center cursor-pointer hover:text-[#005386] select-none">
                Overall <span v-if="sortField === 'overall'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('delta')" class="py-3 px-3 text-center cursor-pointer hover:text-[#005386] select-none">
                Δ vs Prev <span v-if="sortField === 'delta'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('status')" class="py-3 px-3 text-center cursor-pointer hover:text-[#005386] select-none">
                Status <span v-if="sortField === 'status'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('assessor')" class="py-3 px-3 cursor-pointer hover:text-[#005386] select-none">
                Assessor <span v-if="sortField === 'assessor'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th @click="toggleSort('date')" class="py-3 px-3 cursor-pointer hover:text-[#005386] select-none">
                Date <span v-if="sortField === 'date'">{{ sortAsc ? '↑' : '↓' }}</span>
              </th>
              <th class="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-[#1b3654]">
            <tr
              v-for="row in sortedRows"
              :key="row.sc.id"
              @click="$emit('openDetail', row.sc.id)"
              class="hover:bg-slate-50/70 dark:hover:bg-[#0e243d]/60 cursor-pointer transition-colors group"
            >
              <!-- Period -->
              <td class="py-3 px-3.5 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                <div class="flex items-center space-x-1.5">
                  <Calendar class="w-3.5 h-3.5 text-slate-400" />
                  <span>{{ row.sc.periodLabel }}</span>
                </div>
                <span class="text-[10px] text-slate-400 font-mono block">{{ row.periodKey }}</span>
              </td>

              <!-- Project -->
              <td class="py-3 px-3 min-w-[200px]">
                <div class="font-bold text-slate-900 dark:text-white group-hover:text-[#005386] dark:group-hover:text-[#38bdf8] transition-colors">
                  {{ row.project?.name || row.sc.projectId }}
                </div>
                <div class="flex items-center space-x-1.5 mt-0.5">
                  <span class="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#071524] px-1.5 py-0.2 rounded border border-slate-200/60 dark:border-[#1b3654]">
                    {{ row.project?.code || '—' }}
                  </span>
                  <span v-if="row.project?.product" class="text-[10px] text-slate-500 dark:text-slate-400">
                    {{ row.project.product }}
                  </span>
                  <span v-if="row.project?.geo" class="text-[10px] text-slate-400">• {{ row.project.geo }}</span>
                </div>
              </td>

              <!-- Role -->
              <td class="py-3 px-3 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-md text-[10px] font-bold border',
                    row.sc.templateId === 'SWE_MODEL'
                      ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border-[#bad8eb] dark:border-[#1d4d73]'
                      : 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  ]"
                >
                  {{ row.sc.templateId === 'SWE_MODEL' ? 'SWE Model' : 'ORS Optimizer' }}
                </span>
              </td>

              <!-- Overall RAG + Value -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <div class="inline-flex items-center space-x-1.5">
                  <span
                    v-if="row.sc.computed?.overallRag"
                    :class="[
                      'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white shrink-0',
                      row.sc.computed.overallRag === 'G' ? 'bg-emerald-600' :
                      row.sc.computed.overallRag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
                    ]"
                  >
                    {{ row.sc.computed.overallRag }}
                  </span>
                  <span v-else class="text-slate-400 font-mono">—</span>
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {{ formatOverallValue(row.sc) }}
                  </span>
                </div>
              </td>

              <!-- Delta vs Prev -->
              <td class="py-3 px-3 text-center whitespace-nowrap font-mono text-xs">
                <span
                  v-if="row.delta !== null"
                  :class="[
                    'inline-flex items-center space-x-0.5 font-bold',
                    row.delta > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                    row.delta < 0 ? 'text-rose-600 dark:text-rose-400' :
                    'text-slate-400 dark:text-slate-500'
                  ]"
                >
                  <span>{{ row.delta > 0 ? '↑' : row.delta < 0 ? '↓' : '→' }}</span>
                  <span>{{ row.delta > 0 ? `+${Math.round(row.delta)}%` : `${Math.round(row.delta)}%` }}</span>
                </span>
                <span v-else class="text-slate-300 dark:text-slate-600">—</span>
              </td>

              <!-- Status -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                    row.sc.status === 'submitted'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  ]"
                >
                  {{ row.sc.status }}
                </span>
              </td>

              <!-- Assessor -->
              <td class="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                {{ row.sc.assessor || '—' }}
              </td>

              <!-- Date -->
              <td class="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                {{ row.sc.assessmentDate || '—' }}
              </td>

              <!-- Actions -->
              <td class="py-3 px-3 text-right whitespace-nowrap" @click.stop>
                <div class="flex items-center justify-end space-x-1">
                  <button
                    type="button"
                    title="Compare across periods"
                    @click="$emit('compare', row.sc.projectId, row.sc.templateId)"
                    class="p-1 rounded text-slate-500 hover:text-[#005386] dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-[#071524] cursor-pointer"
                  >
                    <BarChart3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Edit scorecard"
                    @click="$emit('editScorecard', row.sc.id)"
                    class="p-1 rounded text-slate-500 hover:text-[#005386] dark:hover:text-[#38bdf8] hover:bg-slate-100 dark:hover:bg-[#071524] cursor-pointer"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Delete scorecard"
                    @click="requestDelete(row.sc)"
                    class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Card List View (< md) -->
    <div v-if="!loading && filteredScorecards.length > 0" class="md:hidden space-y-3">
      <div
        v-for="row in sortedRows"
        :key="row.sc.id"
        @click="$emit('openDetail', row.sc.id)"
        class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3 cursor-pointer"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="font-bold text-slate-900 dark:text-white text-sm">
              {{ row.project?.name || row.sc.projectId }}
            </div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <span>{{ row.sc.periodLabel }}</span>
              <span>•</span>
              <span class="font-mono">{{ row.project?.code }}</span>
            </div>
          </div>
          <span
            :class="[
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0',
              row.sc.status === 'submitted'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            ]"
          >
            {{ row.sc.status }}
          </span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1b3654] text-xs">
          <div class="flex items-center space-x-2">
            <span
              v-if="row.sc.computed?.overallRag"
              :class="[
                'w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white',
                row.sc.computed.overallRag === 'G' ? 'bg-emerald-600' :
                row.sc.computed.overallRag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
              ]"
            >
              {{ row.sc.computed.overallRag }}
            </span>
            <span class="font-bold font-mono">{{ formatOverallValue(row.sc) }}</span>
            <span
              v-if="row.delta !== null"
              :class="[
                'text-[11px] font-mono font-bold',
                row.delta > 0 ? 'text-emerald-600' : row.delta < 0 ? 'text-rose-600' : 'text-slate-400'
              ]"
            >
              {{ row.delta > 0 ? '↑' : row.delta < 0 ? '↓' : '→' }}{{ Math.round(row.delta) }}%
            </span>
          </div>

          <div class="flex items-center space-x-1" @click.stop>
            <button
              type="button"
              @click="$emit('compare', row.sc.projectId, row.sc.templateId)"
              class="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 dark:bg-[#071524] text-slate-700 dark:text-slate-300"
            >
              Compare
            </button>
            <button
              type="button"
              @click="$emit('editScorecard', row.sc.id)"
              class="p-1 rounded text-slate-500 hover:text-[#005386]"
            >
              <Edit3 class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click="requestDelete(row.sc)"
              class="p-1 rounded text-rose-500 hover:text-rose-700"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :isOpen="showDeleteModal"
      title="Delete Quality Scorecard"
      :message="`Are you sure you want to delete the scorecard for ${deletingScorecard?.periodLabel}? This action cannot be undone.`"
      confirmText="Delete Scorecard"
      @confirm="handleConfirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Excel Import Dialog (WP8) -->
    <ImportDialog
      :isOpen="showImportDialog"
      :projects="projects"
      :initialProjectId="selectedProject !== 'ALL' ? selectedProject : undefined"
      @close="showImportDialog = false"
      @imported="handleImported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Scorecard, ScorecardTemplateId } from '../../types';
import { useProjects } from '../../composables/useProjects';
import { useScorecards } from '../../composables/useScorecards';
import { periodKey, comparePeriods } from '../../scoring/period';
import { generateSummaryCsv, generateDetailCsv, downloadCsv } from '../../scoring/csv';
import ConfirmModal from '../ConfirmModal.vue';
import ImportDialog from './ImportDialog.vue';
import {
  PlusCircle,
  Search,
  ClipboardCheck,
  Calendar,
  Edit3,
  Trash2,
  BarChart3,
  Loader2,
  Download,
  Upload,
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'newScorecard'): void;
  (e: 'openDetail', id: string): void;
  (e: 'editScorecard', id: string): void;
  (e: 'compare', projectId: string, templateId: ScorecardTemplateId): void;
  (e: 'viewTrends', subTab?: string): void;
}>();

const { projects, products, geos } = useProjects();
const { fetchScorecards, deleteScorecard, loading } = useScorecards();

const scorecards = ref<Scorecard[]>([]);
const searchQuery = ref('');
const selectedProject = ref('ALL');
const selectedRole = ref('ALL');
const selectedStatus = ref('ALL');
const selectedRag = ref('ALL');
const selectedProduct = ref('ALL');
const selectedGeo = ref('ALL');
const fromPeriod = ref('');
const toPeriod = ref('');

const sortField = ref<'period' | 'project' | 'role' | 'overall' | 'delta' | 'status' | 'assessor' | 'date'>('period');
const sortAsc = ref(false); // default newest first

const showDeleteModal = ref(false);
const deletingScorecard = ref<Scorecard | null>(null);
const showImportDialog = ref(false);

const handleExportSummary = () => {
  const scList = filteredScorecards.value.map((r) => r.sc);
  const csv = generateSummaryCsv(scList, projects.value);
  const now = new Date().toISOString().split('T')[0];
  downloadCsv(`scorecards_summary_${now}.csv`, csv);
};

const handleExportDetail = () => {
  const scList = filteredScorecards.value.map((r) => r.sc);
  const csv = generateDetailCsv(scList, projects.value);
  const now = new Date().toISOString().split('T')[0];
  downloadCsv(`scorecards_detail_${now}.csv`, csv);
};

const handleImported = () => {
  loadData();
};

const loadData = async () => {
  try {
    const list = await fetchScorecards();
    scorecards.value = list;
  } catch (err) {
    console.error('Failed to load scorecards register:', err);
  }
};

onMounted(() => {
  loadData();
});

const formatOverallValue = (sc: Scorecard): string => {
  if (sc.computed?.overallValue === null || sc.computed?.overallValue === undefined) return '—';
  if (sc.templateId === 'SWE_MODEL') {
    return sc.computed.overallValue.toFixed(2);
  }
  return `${sc.computed.overallValue.toFixed(1)}/10`;
};

// Map each scorecard to its previous scorecard (same projectId + templateId, immediate preceding period)
const rowsWithDelta = computed(() => {
  const mapByGroup: Record<string, Scorecard[]> = {};
  for (const sc of scorecards.value) {
    const key = `${sc.projectId}:${sc.templateId}`;
    if (!mapByGroup[key]) mapByGroup[key] = [];
    mapByGroup[key].push(sc);
  }

  // Sort each group chronologically ascending
  for (const key of Object.keys(mapByGroup)) {
    mapByGroup[key].sort((a, b) =>
      comparePeriods({ year: a.periodYear, week: a.periodWeek }, { year: b.periodYear, week: b.periodWeek })
    );
  }

  return scorecards.value.map((sc) => {
    const key = `${sc.projectId}:${sc.templateId}`;
    const group = mapByGroup[key] || [];
    const idx = group.findIndex((item) => item.id === sc.id);
    const prev = idx > 0 ? group[idx - 1] : null;

    let delta: number | null = null;
    if (
      prev &&
      prev.computed?.normalizedPct !== null &&
      prev.computed?.normalizedPct !== undefined &&
      sc.computed?.normalizedPct !== null &&
      sc.computed?.normalizedPct !== undefined
    ) {
      delta = sc.computed.normalizedPct - prev.computed.normalizedPct;
    }

    const p = projects.value.find((prj) => prj.id === sc.projectId);
    const pKey = periodKey(sc.periodYear, sc.periodWeek);

    return {
      sc,
      project: p,
      periodKey: pKey,
      delta,
    };
  });
});

const filteredScorecards = computed(() => {
  return rowsWithDelta.value.filter((row) => {
    const { sc, project, periodKey: pKey } = row;

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const name = (project?.name || '').toLowerCase();
      const code = (project?.code || '').toLowerCase();
      const assessor = (sc.assessor || '').toLowerCase();
      if (!name.includes(q) && !code.includes(q) && !assessor.includes(q)) {
        return false;
      }
    }

    if (selectedProject.value !== 'ALL' && sc.projectId !== selectedProject.value) return false;
    if (selectedRole.value !== 'ALL' && sc.templateId !== selectedRole.value) return false;
    if (selectedStatus.value !== 'ALL' && sc.status !== selectedStatus.value) return false;
    if (selectedRag.value !== 'ALL' && sc.computed?.overallRag !== selectedRag.value) return false;
    if (selectedProduct.value !== 'ALL' && project?.product !== selectedProduct.value) return false;
    if (selectedGeo.value !== 'ALL' && project?.geo !== selectedGeo.value) return false;

    if (fromPeriod.value.trim() && pKey < fromPeriod.value.trim().toUpperCase()) return false;
    if (toPeriod.value.trim() && pKey > toPeriod.value.trim().toUpperCase()) return false;

    return true;
  });
});

const sortedRows = computed(() => {
  const rows = [...filteredScorecards.value];
  rows.sort((a, b) => {
    let cmp = 0;
    if (sortField.value === 'period') {
      cmp = comparePeriods(
        { year: a.sc.periodYear, week: a.sc.periodWeek },
        { year: b.sc.periodYear, week: b.sc.periodWeek }
      );
    } else if (sortField.value === 'project') {
      cmp = (a.project?.name || '').localeCompare(b.project?.name || '');
    } else if (sortField.value === 'role') {
      cmp = a.sc.templateId.localeCompare(b.sc.templateId);
    } else if (sortField.value === 'overall') {
      cmp = (a.sc.computed?.normalizedPct ?? -1) - (b.sc.computed?.normalizedPct ?? -1);
    } else if (sortField.value === 'delta') {
      cmp = (a.delta ?? -999) - (b.delta ?? -999);
    } else if (sortField.value === 'status') {
      cmp = a.sc.status.localeCompare(b.sc.status);
    } else if (sortField.value === 'assessor') {
      cmp = (a.sc.assessor || '').localeCompare(b.sc.assessor || '');
    } else if (sortField.value === 'date') {
      cmp = (a.sc.assessmentDate || '').localeCompare(b.sc.assessmentDate || '');
    }
    return sortAsc.value ? cmp : -cmp;
  });
  return rows;
});

const toggleSort = (field: typeof sortField.value) => {
  if (sortField.value === field) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortField.value = field;
    sortAsc.value = field === 'project' || field === 'assessor';
  }
};

const requestDelete = (sc: Scorecard) => {
  deletingScorecard.value = sc;
  showDeleteModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!deletingScorecard.value) return;
  try {
    await deleteScorecard(deletingScorecard.value.id);
    scorecards.value = scorecards.value.filter((s) => s.id !== deletingScorecard.value!.id);
    showDeleteModal.value = false;
    deletingScorecard.value = null;
  } catch (err) {
    console.error('Failed to delete scorecard:', err);
  }
};
</script>
