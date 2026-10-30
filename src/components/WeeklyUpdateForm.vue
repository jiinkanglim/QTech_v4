<template>
  <div class="space-y-4 pb-8 max-w-4xl mx-auto">
    <!-- Top Header Banner -->
    <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <Edit3 class="w-5 h-5 text-[#005386] dark:text-[#38bdf8]" />
          <span>{{ editingUpdateId ? 'Edit Operations Status Report' : 'Log Tech Lead Status Update' }}</span>
        </h1>
        <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
          {{ editingUpdateId ? 'Modify existing engineering status entry, ratings, highlights, or blockers.' : 'Submit weekly engineering status focusing on code quality, sprint targets, release timelines, and technical blockers.' }}
        </p>
      </div>

      <div class="flex items-center space-x-2 shrink-0">
        <button
          type="button"
          @click="$emit('cancel')"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#133758] text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
          <span>Cancel & Back</span>
        </button>
      </div>
    </div>

    <!-- Form Layout -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 1. Select Delivery Project & Metadata -->
      <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
        <h2 class="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-[#1b3654] pb-2">
          1. Select Delivery Project & Metadata
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Software Project <span class="text-rose-500">*</span>
            </label>
            <select
              id="select-project-dropdown"
              v-model="selectedProjectId"
              required
              class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
            >
              <option v-for="p in activeProjects" :key="p.id" :value="p.id">
                [{{ p.product || 'General' }} • {{ p.projectType || 'Manual' }}] {{ p.name }} — GEO: {{ p.geo }} ({{ p.code }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tech Lead Author
            </label>
            <input
              id="author-input"
              type="text"
              v-model="author"
              required
              class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
            />
          </div>

          <div class="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Update Date
              </label>
              <input
                id="update-date-input"
                type="date"
                v-model="updateDate"
                class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Week Number
              </label>
              <input
                id="week-number-input"
                type="number"
                min="1"
                max="53"
                v-model.number="weekNumber"
                class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year
              </label>
              <input
                id="year-input"
                type="number"
                v-model.number="year"
                class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <!-- Project Summary Banner -->
        <div v-if="selectedProject" class="p-3 bg-[#e8f2f8] dark:bg-[#0e2a42] rounded-lg border border-[#bad8eb] dark:border-[#1d4d73] text-xs flex flex-wrap items-center justify-between gap-2">
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="font-bold text-[#003b60] dark:text-[#7dd3fc] flex items-center space-x-1">
              <Code2 class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
              <span>{{ selectedProject.name }}</span>
            </span>
            <span class="px-2 py-0.5 bg-white dark:bg-[#071524] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73] font-bold rounded-md flex items-center space-x-1">
              <Tag class="w-3 h-3 text-[#0082c3]" />
              <span>Product: {{ selectedProject.product || 'General' }}</span>
            </span>
            <ProjectTypeBadge :type="selectedProject.projectType" size="sm" />
            <span class="text-slate-600 dark:text-slate-300 flex items-center space-x-1">
              <Globe class="w-3.5 h-3.5 text-[#0082c3]" />
              <span>GEO: <strong>{{ selectedProject.geo }}</strong></span>
            </span>
            <span class="text-slate-600 dark:text-slate-300">Tech Lead: <strong>{{ selectedProject.owner }}</strong></span>
          </div>
        </div>
      </div>

      <!-- 2. Quality & Timeline RAG Assessment Matrix -->
      <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-2">
          <div>
            <h2 class="font-bold text-slate-900 dark:text-white text-sm">
              2. Quality & Timeline RAG Assessment
            </h2>
            <p class="text-[11px] text-slate-400">
              Rate overall health and key engineering pillars (Code Quality, Release Schedule, Scope Alignment).
            </p>
          </div>
          <RAGBadge :status="overallRag" size="sm" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <!-- Overall -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Overall Project Health RAG
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="overallRag = 'GREEN'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  overallRag === 'GREEN' ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Green</span>
              </button>
              <button
                type="button"
                @click="overallRag = 'AMBER'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  overallRag === 'AMBER' ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>Amber</span>
              </button>
              <button
                type="button"
                @click="overallRag = 'RED'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  overallRag === 'RED' ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <XCircle class="w-3.5 h-3.5" />
                <span>Red</span>
              </button>
            </div>
          </div>

          <!-- Quality -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Code Quality & Defect Debt RAG
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="qualityRag = 'GREEN'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  qualityRag === 'GREEN' ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Green</span>
              </button>
              <button
                type="button"
                @click="qualityRag = 'AMBER'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  qualityRag === 'AMBER' ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>Amber</span>
              </button>
              <button
                type="button"
                @click="qualityRag = 'RED'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  qualityRag === 'RED' ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <XCircle class="w-3.5 h-3.5" />
                <span>Red</span>
              </button>
            </div>
          </div>

          <!-- Schedule -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Release Schedule & Timeline RAG
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="scheduleRag = 'GREEN'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  scheduleRag === 'GREEN' ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Green</span>
              </button>
              <button
                type="button"
                @click="scheduleRag = 'AMBER'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  scheduleRag === 'AMBER' ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>Amber</span>
              </button>
              <button
                type="button"
                @click="scheduleRag = 'RED'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  scheduleRag === 'RED' ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <XCircle class="w-3.5 h-3.5" />
                <span>Red</span>
              </button>
            </div>
          </div>

          <!-- Scope -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Scope & Architecture RAG
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="scopeRag = 'GREEN'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  scopeRag === 'GREEN' ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <CheckCircle2 class="w-3.5 h-3.5" />
                <span>Green</span>
              </button>
              <button
                type="button"
                @click="scopeRag = 'AMBER'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  scopeRag === 'AMBER' ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>Amber</span>
              </button>
              <button
                type="button"
                @click="scopeRag = 'RED'"
                :class="[
                  'flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer',
                  scopeRag === 'RED' ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400/50' : 'bg-white dark:bg-[#071524] border-slate-200 dark:border-[#1b3654] text-slate-600 dark:text-slate-300'
                ]"
              >
                <XCircle class="w-3.5 h-3.5" />
                <span>Red</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Weekly Engineering Narrative -->
      <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-2">
          <div>
            <h2 class="font-bold text-slate-900 dark:text-white text-sm">
              3. Weekly Engineering Narrative
            </h2>
            <span class="text-[11px] text-slate-400">Log technical wins, blockers, and next sprint deliverables</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Technical Wins, PRs Merged & Milestones <span class="text-rose-500">*</span>
          </label>
          <textarea
            id="highlights-textarea"
            rows="2"
            v-model="highlights"
            placeholder="What went well? Major PRs merged, staging deployments, performance optimizations..."
            required
            class="w-full p-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white leading-relaxed"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Technical Blockers, Outages & Defect Debt
          </label>
          <textarea
            id="lowlights-textarea"
            rows="2"
            v-model="lowlights"
            placeholder="What delayed delivery? Memory leaks, third-party API dependencies, test failures..."
            class="w-full p-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white leading-relaxed"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Next Milestones / Targets & Architecture Focus
          </label>
          <textarea
            id="next-steps-textarea"
            rows="2"
            v-model="nextSteps"
            placeholder="Key technical targets for next week..."
            class="w-full p-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white leading-relaxed"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Code Quality / Delivery Metric Note (Optional)
          </label>
          <input
            id="kpi-progress-input"
            type="text"
            v-model="kpiProgress"
            placeholder="e.g., Code coverage: 92% | P0 Bugs: 0 | Sub-30ms p99 latency"
            class="w-full p-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <!-- Historical Updates Context -->
      <div v-if="pastProjectUpdates.length > 0" class="bg-slate-50 dark:bg-[#071524] p-3.5 rounded-xl border border-slate-200 dark:border-[#1b3654] space-y-2">
        <h3 class="font-bold text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
          <History class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
          <span>Reference: Previous Status Entries for {{ selectedProject?.name }}</span>
        </h3>

        <div class="space-y-1.5 max-h-36 overflow-y-auto">
          <div v-for="past in pastProjectUpdates.slice(0, 3)" :key="past.id" class="p-2.5 bg-white dark:bg-[#0f2238] rounded-lg border border-slate-200 dark:border-[#1b3654] text-xs space-y-0.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 dark:text-white text-[11px]">
                Week {{ past.weekNumber }} ({{ past.updateDate }})
              </span>
              <RAGBadge :status="past.overallRag" size="sm" />
            </div>
            <p class="text-slate-600 dark:text-slate-300 line-clamp-1 text-[11px]">
              <strong>Wins:</strong> {{ past.highlights }}
            </p>
          </div>
        </div>
      </div>

      <!-- Submit & Delete Actions -->
      <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1b3654]">
        <div>
          <button
            v-if="editingUpdateId"
            type="button"
            @click="isDeleteModalOpen = true"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold text-xs transition-all cursor-pointer border border-rose-200 dark:border-rose-800"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Delete Status Entry</span>
          </button>
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="button"
            id="cancel-weekly-update-form-btn"
            @click="$emit('cancel')"
            class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#071524] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-all cursor-pointer border border-slate-200 dark:border-[#1b3654]"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="submit-weekly-update-form-btn"
            class="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#005386] hover:bg-[#004169] text-white font-semibold text-xs shadow-md shadow-[#005386]/25 border border-[#005386] transition-all cursor-pointer"
          >
            <Send class="w-4 h-4 text-[#7dd3fc]" />
            <span>{{ editingUpdateId ? 'Save Changes' : 'Publish Status Update' }}</span>
          </button>
        </div>
      </div>
    </form>

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      title="Delete Weekly Status Update"
      message="Are you sure you want to delete this weekly status update? This action cannot be undone."
      confirmText="Delete Status Entry"
      @confirm="handleConfirmDelete"
      @cancel="isDeleteModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useProjects } from '../composables/useProjects';
import RAGBadge from './RAGBadge.vue';
import ProjectTypeBadge from './ProjectTypeBadge.vue';
import ConfirmModal from './ConfirmModal.vue';
import { RAGStatus } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Send,
  History,
  Globe,
  Code2,
  Tag,
  Trash2,
  Edit3,
  ArrowLeft
} from 'lucide-vue-next';

const props = defineProps<{
  initialProjectId?: string | null;
  editingUpdateId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'successNavigate'): void;
  (e: 'cancel'): void;
}>();

const {
  projects,
  weeklyUpdates,
  addWeeklyUpdate,
  updateWeeklyUpdate,
  deleteWeeklyUpdate,
  getProjectUpdates
} = useProjects();

const activeProjects = computed(() => projects.value.filter((p) => p.status === 'ACTIVE'));

// Week number calculator helper
const getWeekNumber = (d: Date) => {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
};

const todayStr = new Date().toISOString().split('T')[0];
const currentWeek = getWeekNumber(new Date());

const selectedProjectId = ref<string>(
  props.initialProjectId && activeProjects.value.some((p) => p.id === props.initialProjectId)
    ? props.initialProjectId
    : activeProjects.value[0]?.id || ''
);

const updateDate = ref(todayStr);
const weekNumber = ref(currentWeek);
const year = ref(2026);
const author = ref('');

const overallRag = ref<RAGStatus>('GREEN');
const qualityRag = ref<RAGStatus>('GREEN');
const scheduleRag = ref<RAGStatus>('GREEN');
const scopeRag = ref<RAGStatus>('GREEN');

const highlights = ref('');
const lowlights = ref('');
const nextSteps = ref('');
const kpiProgress = ref('');

const isDeleteModalOpen = ref(false);

const selectedProject = computed(() => {
  return activeProjects.value.find((p) => p.id === selectedProjectId.value) || activeProjects.value[0];
});

const pastProjectUpdates = computed(() => {
  return selectedProjectId.value ? getProjectUpdates(selectedProjectId.value) : [];
});

// Sync editing update
const loadEditingUpdate = () => {
  if (props.editingUpdateId) {
    const existing = weeklyUpdates.value.find((u) => u.id === props.editingUpdateId);
    if (existing) {
      selectedProjectId.value = existing.projectId;
      updateDate.value = existing.updateDate;
      weekNumber.value = existing.weekNumber;
      year.value = existing.year;
      author.value = existing.author;
      overallRag.value = existing.overallRag;
      qualityRag.value = existing.qualityRag || 'GREEN';
      scheduleRag.value = existing.scheduleRag || 'GREEN';
      scopeRag.value = existing.scopeRag || 'GREEN';
      highlights.value = existing.highlights;
      lowlights.value = existing.lowlights || '';
      nextSteps.value = existing.nextSteps || '';
      kpiProgress.value = existing.kpiProgress || '';
    }
  } else if (selectedProject.value) {
    author.value = selectedProject.value.owner;
  }
};

onMounted(loadEditingUpdate);
watch(() => props.editingUpdateId, loadEditingUpdate);

watch(selectedProjectId, (newId) => {
  if (!props.editingUpdateId) {
    const proj = activeProjects.value.find((p) => p.id === newId);
    if (proj) {
      author.value = proj.owner;
    }
  }
});

// Form Submit
const handleSubmit = () => {
  if (!selectedProjectId.value) return;

  if (!highlights.value.trim()) {
    alert('Please fill out the Technical Wins / Delivered PRs section.');
    return;
  }

  const payload = {
    projectId: selectedProjectId.value,
    weekNumber: Number(weekNumber.value),
    year: Number(year.value),
    updateDate: updateDate.value,
    author: author.value,
    overallRag: overallRag.value,
    qualityRag: qualityRag.value,
    scheduleRag: scheduleRag.value,
    scopeRag: scopeRag.value,
    highlights: highlights.value,
    lowlights: lowlights.value,
    nextSteps: nextSteps.value,
    kpiProgress: kpiProgress.value,
    completionPercentage: selectedProject.value?.completionPercentage ?? 100,
  };

  if (props.editingUpdateId) {
    updateWeeklyUpdate(props.editingUpdateId, payload);
  } else {
    addWeeklyUpdate(payload);
  }

  emit('successNavigate');
};

const handleConfirmDelete = () => {
  if (props.editingUpdateId) {
    deleteWeeklyUpdate(props.editingUpdateId);
    isDeleteModalOpen.value = false;
    emit('successNavigate');
  }
};
</script>
