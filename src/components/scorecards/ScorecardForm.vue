<template>
  <div class="space-y-6 pb-12">
    <!-- Top Action & Navigation Breadcrumb Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f2238] p-4 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
      <div class="flex items-center space-x-3">
        <button
          type="button"
          @click="handleCancel"
          class="p-2 rounded-xl bg-slate-100 dark:bg-[#071524] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#163352] transition-colors cursor-pointer"
          title="Back / Cancel"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>

        <div>
          <div class="flex items-center space-x-2">
            <h1 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ isEditingExisting ? 'Edit Quality Scorecard' : 'New Quality Scorecard' }}
            </h1>
            <span
              :class="[
                'px-2 py-0.5 text-[11px] font-bold rounded-full border',
                scorecardStatus === 'submitted'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
              ]"
            >
              {{ scorecardStatus === 'submitted' ? 'Submitted' : 'Draft' }}
            </span>
          </div>
          <p v-if="lastEditedInfo" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {{ lastEditedInfo }}
          </p>
        </div>
      </div>

      <!-- Header Action Buttons -->
      <div class="flex items-center space-x-2">
        <button
          v-if="isEditingExisting"
          type="button"
          @click="showDeleteConfirm = true"
          :disabled="isSaving"
          class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Delete</span>
        </button>

        <button
          type="button"
          @click="handleCancel"
          :disabled="isSaving"
          class="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#163352] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          @click="saveAsDraft"
          :disabled="isSaving"
          class="px-3.5 py-1.5 rounded-xl bg-[#e8f2f8] hover:bg-[#d5e7f4] dark:bg-[#0e2a42] dark:hover:bg-[#133857] text-[#005386] dark:text-[#38bdf8] font-semibold text-xs border border-[#bad8eb] dark:border-[#1d4d73] transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <Save class="w-3.5 h-3.5" />
          <span>{{ isSaving && targetStatus === 'draft' ? 'Saving...' : 'Save Draft' }}</span>
        </button>

        <button
          type="button"
          @click="submitScorecard"
          :disabled="isSaving"
          class="px-4 py-1.5 rounded-xl bg-[#005386] hover:bg-[#004169] text-white font-semibold text-xs shadow-md shadow-[#005386]/20 border border-[#005386] transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-[#7dd3fc]" />
          <span>{{ isSaving && targetStatus === 'submitted' ? 'Submitting...' : 'Submit Scorecard' }}</span>
        </button>
      </div>
    </div>

    <!-- Validation Error Banner with Jump Links -->
    <div
      v-if="validationErrors.length > 0"
      class="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-2xl space-y-2 text-rose-900 dark:text-rose-200 animate-fade-in"
    >
      <div class="flex items-center space-x-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span>Please resolve the following {{ validationErrors.length }} error(s) before submitting:</span>
      </div>
      <ul class="list-disc list-inside space-y-1 text-xs">
        <li v-for="(err, idx) in validationErrors" :key="idx">
          <a
            href="#"
            @click.prevent="jumpToError(err)"
            class="underline hover:text-rose-700 dark:hover:text-rose-100 font-medium cursor-pointer"
          >
            {{ err }}
          </a>
        </li>
      </ul>
    </div>

    <!-- Duplicate Scorecard Notice -->
    <div
      v-if="duplicateExistingId && duplicateExistingId !== currentScorecardId"
      class="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-fade-in"
    >
      <div class="flex items-center space-x-2 text-xs">
        <AlertCircle class="w-4 h-4 shrink-0 text-amber-600" />
        <span>
          A scorecard already exists for <strong>{{ selectedProject?.name }}</strong> ({{ currentTemplateLabel }}) for <strong>{{ periodLabelStr }}</strong>.
        </span>
      </div>
      <button
        type="button"
        @click="loadExistingDuplicate"
        class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-center shrink-0"
      >
        Open existing scorecard
      </button>
    </div>

    <!-- Main Grid: Form on Left (col-span-2 or 3), Summary on Right (col-span-1) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <!-- Left Column: Form Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- HEADER TOP CARD -->
        <div class="bg-white dark:bg-[#0f2238] p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1b3654]">
            <h2 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Assessment Metadata
            </h2>

            <!-- Copy from previous button -->
            <button
              v-if="previousScorecard"
              type="button"
              @click="handleCopyFromPrevious"
              class="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#163352] text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-[#1b3654] transition-colors flex items-center space-x-1.5 cursor-pointer"
              :title="`Prefill from ${previousScorecard.periodLabel}`"
            >
              <Copy class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
              <span>Copy from previous ({{ previousScorecard.periodLabel }})</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Project Select -->
            <div id="field-project" class="space-y-1">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Project <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="selectedProjectId"
                @change="onProjectChange"
                :disabled="isEditingExisting"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386] disabled:opacity-60"
              >
                <option v-for="p in eligibleProjects" :key="p.id" :value="p.id">
                  {{ p.name }} ({{ p.customerCode }})
                </option>
              </select>
              <p v-if="eligibleProjects.length === 0" class="text-[11px] text-amber-600 mt-1">
                No projects have Quality Scorecards enabled. Enable them in Project Directory.
              </p>
            </div>

            <!-- Template Select -->
            <div id="field-template" class="space-y-1">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Scorecard Template <span class="text-rose-500">*</span>
              </label>
              <select
                v-model="selectedTemplateId"
                @change="onTemplateChange"
                :disabled="isEditingExisting"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386] disabled:opacity-60"
              >
                <option v-for="t in availableTemplates" :key="t.id" :value="t.id">
                  {{ t.label }}
                </option>
              </select>
            </div>

            <!-- Week Date Picker & Computed Period -->
            <div id="field-week" class="space-y-1">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Assessment Period <span class="text-rose-500">*</span>
                </label>
                <span class="text-xs font-mono font-bold text-[#005386] dark:text-[#38bdf8]">
                  {{ periodLabelStr }}
                </span>
              </div>
              <input
                type="date"
                v-model="periodDate"
                @change="onPeriodDateChange"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
              />
            </div>

            <!-- Assessment Date & Assessor -->
            <div id="field-assessment-date" class="space-y-1">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Assessment Date <span class="text-rose-500">*</span>
              </label>
              <input
                type="date"
                v-model="assessmentDate"
                class="w-full px-3 py-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
              />
            </div>

            <div id="field-assessor" class="space-y-1 sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Assessor / Lead Expert <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                v-model="assessor"
                placeholder="Name of reviewer or lead expert..."
                class="w-full px-3 py-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
              />
            </div>
          </div>

          <!-- SWE Specific Header Fields -->
          <div v-if="selectedTemplateId === 'SWE_MODEL'" class="pt-3 border-t border-slate-100 dark:border-[#1b3654] space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Phase Select -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Project Phase
                </label>
                <select
                  v-model="headerPhase"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
                >
                  <option value="Modeling">Modeling</option>
                  <option value="Iterative Development">Iterative Development</option>
                </select>
              </div>

              <!-- Model Version -->
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Model Version
                </label>
                <input
                  type="text"
                  v-model="headerModelVersion"
                  placeholder="0.0.1"
                  class="w-full px-3 py-2 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
                />
              </div>
            </div>

            <!-- General Comments -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  General Project Comment(s)
                </label>
                <textarea
                  v-model="headerProjectComment"
                  rows="2"
                  placeholder="Overall project context, milestones, environment notes..."
                  class="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
                ></textarea>
              </div>

              <div class="space-y-1">
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  General Model Comment(s)
                </label>
                <textarea
                  v-model="headerModelComment"
                  rows="2"
                  placeholder="Architecture observations, core domain model notes..."
                  class="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- ORS Specific Header Fields -->
          <div v-else-if="selectedTemplateId === 'ORS_RAG'" class="pt-3 border-t border-slate-100 dark:border-[#1b3654] space-y-3">
            <div class="p-3.5 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] space-y-2">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Daily updates received last week (0 to 5)
              </label>
              <div class="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="5"
                  v-model.number="orsDailyUpdates"
                  class="w-24 px-3 py-1.5 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
                />

                <div v-if="suggestedInteractionRag" class="flex items-center space-x-2 text-xs">
                  <span class="text-slate-600 dark:text-slate-300">
                    Suggests Interaction =
                    <strong
                      :class="[
                        'px-1.5 py-0.5 rounded text-[11px] font-bold',
                        suggestedInteractionRag === 'G' ? 'bg-emerald-500 text-white' :
                        suggestedInteractionRag === 'A' ? 'bg-amber-500 text-white' :
                        'bg-rose-500 text-white'
                      ]"
                    >
                      {{ suggestedInteractionRag === 'G' ? 'Green (fine)' : suggestedInteractionRag === 'A' ? 'Amber (trouble)' : 'Red (trouble)' }}
                    </strong>
                  </span>

                  <button
                    type="button"
                    @click="applySuggestedInteraction"
                    class="px-2.5 py-1 rounded-lg bg-[#005386] hover:bg-[#004169] text-white text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Apply to Interaction
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CATEGORIES SECTION -->
        <div class="space-y-6">
          <!-- SWE Template Part 1 Divider -->
          <div v-if="selectedTemplateId === 'SWE_MODEL'" class="flex items-center space-x-3 pt-2">
            <span class="px-3 py-1 rounded-lg bg-[#005386] text-white text-xs font-bold tracking-wide uppercase shadow-xs">
              PART 1 – MODEL REVIEW
            </span>
            <div class="flex-1 h-px bg-slate-200 dark:bg-[#1b3654]"></div>
          </div>

          <!-- Render Review Categories (1 - 7 for SWE, all for ORS) -->
          <template v-for="cat in reviewCategories" :key="cat.id">
            <ScorecardCategoryBlock
              :category="cat"
              :entries="entries"
              :templateId="selectedTemplateId"
              :categoryScore="computedScore.categories?.[cat.id]?.value"
              :categoryRag="computedScore.categories?.[cat.id]?.rag"
              @updateItem="handleItemUpdate"
              @addCustomItem="handleAddCustomItem"
              @removeCustomItem="handleRemoveCustomItem"
            />
          </template>

          <!-- SWE Template Part 2 Divider -->
          <div v-if="selectedTemplateId === 'SWE_MODEL' && metricsCategories.length > 0" class="flex items-center space-x-3 pt-4">
            <span class="px-3 py-1 rounded-lg bg-[#005386] text-white text-xs font-bold tracking-wide uppercase shadow-xs">
              PART 2 – METRICS (MSG COMPLIANCE)
            </span>
            <div class="flex-1 h-px bg-slate-200 dark:bg-[#1b3654]"></div>
          </div>

          <!-- Render Metrics Categories (8 - 9 for SWE) -->
          <template v-for="cat in metricsCategories" :key="cat.id">
            <ScorecardCategoryBlock
              :category="cat"
              :entries="entries"
              :templateId="selectedTemplateId"
              :categoryScore="computedScore.categories?.[cat.id]?.value"
              :categoryRag="computedScore.categories?.[cat.id]?.rag"
              @updateItem="handleItemUpdate"
              @addCustomItem="handleAddCustomItem"
              @removeCustomItem="handleRemoveCustomItem"
            />
          </template>
        </div>

        <!-- Bottom Form Action Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#1b3654]">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#163352] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div class="flex items-center space-x-3">
            <button
              type="button"
              @click="saveAsDraft"
              :disabled="isSaving"
              class="px-4 py-2 rounded-xl bg-[#e8f2f8] hover:bg-[#d5e7f4] dark:bg-[#0e2a42] dark:hover:bg-[#133857] text-[#005386] dark:text-[#38bdf8] font-semibold text-xs border border-[#bad8eb] dark:border-[#1d4d73] transition-colors cursor-pointer disabled:opacity-50"
            >
              {{ isSaving && targetStatus === 'draft' ? 'Saving...' : 'Save Draft' }}
            </button>

            <button
              type="button"
              @click="submitScorecard"
              :disabled="isSaving"
              class="px-5 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] text-white font-semibold text-xs shadow-md shadow-[#005386]/20 border border-[#005386] transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 class="w-4 h-4 text-[#7dd3fc]" />
              <span>{{ isSaving && targetStatus === 'submitted' ? 'Submitting...' : 'Submit Scorecard' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Sticky Summary Panel -->
      <div class="lg:col-span-1 lg:sticky lg:top-20">
        <ScoreSummaryPanel
          :templateId="selectedTemplateId"
          :computedScore="computedScore"
          :scoringSettings="scoringSettings"
        />
      </div>
    </div>

    <!-- Confirm Cancel Modal -->
    <ConfirmModal
      :isOpen="showCancelConfirm"
      title="Discard Unsaved Changes?"
      message="You have unsaved changes in this scorecard. Leaving now will discard all modifications."
      confirmText="Discard Changes"
      @confirm="confirmCancel"
      @cancel="showCancelConfirm = false"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Delete Quality Scorecard"
      message="Are you sure you want to permanently delete this scorecard? This action cannot be undone."
      confirmText="Delete Scorecard"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  Scorecard,
  ScorecardItemEntry,
  ScorecardTemplateId,
  ScorecardStatus,
  ScoringSettings
} from '../../types';
import { SCORECARD_TEMPLATES } from '../../scoring/templates';
import {
  computeScorecard,
  validateForSubmit,
  buildEmptyEntries,
  copyEntriesFrom,
  suggestInteraction,
  DEFAULT_SCORING_SETTINGS
} from '../../scoring/engine';
import { isoWeekOf, periodLabel } from '../../scoring/period';
import { useProjects } from '../../composables/useProjects';
import { useScorecards } from '../../composables/useScorecards';
import ScorecardCategoryBlock from './ScorecardCategoryBlock.vue';
import ScoreSummaryPanel from './ScoreSummaryPanel.vue';
import ConfirmModal from '../ConfirmModal.vue';
import {
  ArrowLeft,
  CheckCircle2,
  Save,
  Trash2,
  Copy,
  AlertTriangle,
  AlertCircle
} from 'lucide-vue-next';

const props = defineProps<{
  scorecardId?: string;
  projectId?: string;
  templateId?: ScorecardTemplateId;
}>();

const emit = defineEmits<{
  (e: 'saved', sc: Scorecard): void;
  (e: 'cancelled'): void;
  (e: 'deleted', id: string): void;
  (e: 'openScorecard', id: string): void;
}>();

const { projects } = useProjects();
const { getScorecard, saveScorecard, deleteScorecard: apiDeleteScorecard, fetchScorecards, scorecardSummaries } = useScorecards();

// Form Reactive State
const currentScorecardId = ref<string | null>(props.scorecardId || null);
const selectedProjectId = ref<string>('');
const selectedTemplateId = ref<ScorecardTemplateId>(props.templateId || 'SWE_MODEL');
const periodDate = ref<string>(new Date().toISOString().slice(0, 10));
const assessmentDate = ref<string>(new Date().toISOString().slice(0, 10));
const assessor = ref<string>('');
const scorecardStatus = ref<ScorecardStatus>('draft');
const targetStatus = ref<ScorecardStatus>('draft');

// SWE extra header state
const headerPhase = ref<'Modeling' | 'Iterative Development'>('Modeling');
const headerModelVersion = ref<string>('');
const headerProjectComment = ref<string>('');
const headerModelComment = ref<string>('');

// ORS extra header state
const orsDailyUpdates = ref<number>(5);

// Entries & Scoring
const entries = ref<ScorecardItemEntry[]>([]);
const scoringSettings = ref<ScoringSettings>({ ...DEFAULT_SCORING_SETTINGS });

// Meta state
const isDirty = ref(false);
const isSaving = ref(false);
const showCancelConfirm = ref(false);
const showDeleteConfirm = ref(false);
const validationErrors = ref<string[]>([]);
const previousScorecard = ref<Scorecard | null>(null);
const lastEditedInfo = ref<string | null>(null);

// Eligible projects with scorecardConfig enabled
const eligibleProjects = computed(() => {
  return projects.value.filter((p) => p.scorecardConfig && p.scorecardConfig.enabled && p.scorecardConfig.enabled.length > 0);
});

const selectedProject = computed(() => {
  return projects.value.find((p) => p.id === selectedProjectId.value);
});

// Available templates for selected project
const availableTemplates = computed(() => {
  const enabled = selectedProject.value?.scorecardConfig?.enabled || ['SWE_MODEL', 'ORS_RAG'];
  return [
    { id: 'SWE_MODEL' as ScorecardTemplateId, label: 'Software Expert – Model Scoring Sheet' },
    { id: 'ORS_RAG' as ScorecardTemplateId, label: 'ORS – Optimizer RAG Sheet' },
  ].filter((t) => enabled.includes(t.id));
});

const currentTemplateLabel = computed(() => {
  return selectedTemplateId.value === 'SWE_MODEL'
    ? 'Software Expert – Model Scoring Sheet'
    : 'ORS – Optimizer RAG Sheet';
});

// ISO Week Calculation
const periodYearAndWeek = computed(() => {
  return isoWeekOf(periodDate.value);
});

const periodLabelStr = computed(() => {
  const { year, week } = periodYearAndWeek.value;
  return periodLabel(year, week);
});

// Categories for Template
const templateDef = computed(() => {
  return SCORECARD_TEMPLATES[selectedTemplateId.value];
});

const reviewCategories = computed(() => {
  if (selectedTemplateId.value === 'SWE_MODEL') {
    return templateDef.value.categories.filter((c) => c.part === 'REVIEW' || !c.part);
  }
  return templateDef.value.categories;
});

const metricsCategories = computed(() => {
  if (selectedTemplateId.value === 'SWE_MODEL') {
    return templateDef.value.categories.filter((c) => c.part === 'METRICS');
  }
  return [];
});

// Computed Score calculation on every entry/settings update
const computedScore = computed(() => {
  return computeScorecard(selectedTemplateId.value, entries.value, scoringSettings.value);
});

// ORS Suggested Interaction
const suggestedInteractionRag = computed(() => {
  if (selectedTemplateId.value !== 'ORS_RAG') return null;
  return suggestInteraction(Number(orsDailyUpdates.value) || 0);
});

const isEditingExisting = computed(() => {
  return !!currentScorecardId.value;
});

// Duplicate Detection
const duplicateExistingId = computed(() => {
  const { year, week } = periodYearAndWeek.value;
  const match = scorecardSummaries.value.find(
    (s) =>
      s.projectId === selectedProjectId.value &&
      s.templateId === selectedTemplateId.value &&
      s.periodYear === year &&
      s.periodWeek === week
  );
  return match ? match.id : null;
});

// Handle custom/dynamic item addition
const handleAddCustomItem = (payload: {
  categoryId: string;
  customLabel?: string;
  customDescription?: string;
  isCustom?: boolean;
}) => {
  isDirty.value = true;
  const newId = payload.isCustom
    ? `custom_${Date.now()}`
    : `perf_kt_custom_${Date.now()}`;

  entries.value.push({
    itemId: newId,
    categoryId: payload.categoryId,
    value: null,
    remarks: '',
    customLabel: payload.customLabel || '',
    customDescription: payload.customDescription || '',
    isCustom: !!payload.isCustom,
  });
};

const handleRemoveCustomItem = (itemId: string) => {
  isDirty.value = true;
  entries.value = entries.value.filter((e) => e.itemId !== itemId);
};

const handleItemUpdate = (updatedEntry: ScorecardItemEntry) => {
  isDirty.value = true;
  const idx = entries.value.findIndex((e) => e.itemId === updatedEntry.itemId);
  if (idx >= 0) {
    entries.value[idx] = updatedEntry;
  } else {
    entries.value.push(updatedEntry);
  }
};

const applySuggestedInteraction = () => {
  if (!suggestedInteractionRag.value) return;
  const interactionEntry = entries.value.find((e) => e.itemId === 'ors_interaction');
  if (interactionEntry) {
    handleItemUpdate({
      ...interactionEntry,
      value: suggestedInteractionRag.value,
    });
  }
};

// Lifecycle & Data Fetching
const fetchSettings = async () => {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.scoringSettings) {
        scoringSettings.value = {
          sweAmberFrom: Number(data.scoringSettings.sweAmberFrom) || DEFAULT_SCORING_SETTINGS.sweAmberFrom,
          sweGreenFrom: Number(data.scoringSettings.sweGreenFrom) || DEFAULT_SCORING_SETTINGS.sweGreenFrom,
          defaultCadence: data.scoringSettings.defaultCadence || DEFAULT_SCORING_SETTINGS.defaultCadence,
        };
      }
    }
  } catch (e) {
    console.warn('[ScorecardForm] Failed to load settings:', e);
  }
};

const findPreviousScorecard = async () => {
  if (!selectedProjectId.value || !selectedTemplateId.value) {
    previousScorecard.value = null;
    return;
  }
  try {
    const list = await fetchScorecards({
      projectId: selectedProjectId.value,
      templateId: selectedTemplateId.value,
      status: 'submitted',
    });
    // Filter out current scorecard and find most recent prior period
    const { year, week } = periodYearAndWeek.value;
    const prior = list
      .filter((sc) => sc.id !== currentScorecardId.value)
      .filter((sc) => sc.periodYear < year || (sc.periodYear === year && sc.periodWeek < week))
      .sort((a, b) => (b.periodYear * 100 + b.periodWeek) - (a.periodYear * 100 + a.periodWeek));

    previousScorecard.value = prior.length > 0 ? prior[0] : null;
  } catch (e) {
    console.warn('[ScorecardForm] Failed to fetch previous scorecard:', e);
    previousScorecard.value = null;
  }
};

const handleCopyFromPrevious = () => {
  if (!previousScorecard.value) return;
  isDirty.value = true;
  entries.value = copyEntriesFrom(previousScorecard.value);
};

const onProjectChange = () => {
  isDirty.value = true;
  const proj = selectedProject.value;
  if (proj?.scorecardConfig?.enabled?.length) {
    if (!proj.scorecardConfig.enabled.includes(selectedTemplateId.value)) {
      selectedTemplateId.value = proj.scorecardConfig.enabled[0];
      entries.value = buildEmptyEntries(selectedTemplateId.value);
    }
    const defaultAssessor = proj.scorecardConfig.assessors?.[selectedTemplateId.value];
    if (defaultAssessor) {
      assessor.value = defaultAssessor;
    }
  }
  findPreviousScorecard();
};

const onTemplateChange = () => {
  isDirty.value = true;
  entries.value = buildEmptyEntries(selectedTemplateId.value);
  const defaultAssessor = selectedProject.value?.scorecardConfig?.assessors?.[selectedTemplateId.value];
  if (defaultAssessor) {
    assessor.value = defaultAssessor;
  }
  findPreviousScorecard();
};

const onPeriodDateChange = () => {
  isDirty.value = true;
  findPreviousScorecard();
};

const loadExistingDuplicate = () => {
  if (duplicateExistingId.value) {
    emit('openScorecard', duplicateExistingId.value);
  }
};

// Form Assembly
const buildScorecardObject = (status: ScorecardStatus): Scorecard => {
  const { year, week } = periodYearAndWeek.value;
  const now = new Date().toISOString();

  return {
    id: currentScorecardId.value || '',
    projectId: selectedProjectId.value,
    templateId: selectedTemplateId.value,
    templateVersion: templateDef.value.version,
    periodYear: year,
    periodWeek: week,
    periodLabel: periodLabel(year, week),
    assessmentDate: assessmentDate.value,
    assessor: assessor.value.trim(),
    status,
    header: {
      phase: selectedTemplateId.value === 'SWE_MODEL' ? headerPhase.value : undefined,
      modelVersion: selectedTemplateId.value === 'SWE_MODEL' ? headerModelVersion.value.trim() : undefined,
      projectComment: selectedTemplateId.value === 'SWE_MODEL' ? headerProjectComment.value.trim() : undefined,
      modelComment: selectedTemplateId.value === 'SWE_MODEL' ? headerModelComment.value.trim() : undefined,
      dailyUpdatesLastWeek: selectedTemplateId.value === 'ORS_RAG' ? Number(orsDailyUpdates.value) : undefined,
    },
    items: entries.value.map((e) => ({ ...e })),
    computed: computedScore.value,
    createdAt: now,
    updatedAt: now,
    submittedAt: status === 'submitted' ? now : undefined,
    lastEditedBy: assessor.value.trim() || undefined,
  };
};

// Saving Actions
const saveAsDraft = async () => {
  if (!selectedProjectId.value) {
    validationErrors.value = ['Please select a project before saving.'];
    return;
  }
  targetStatus.value = 'draft';
  isSaving.value = true;
  validationErrors.value = [];

  try {
    const sc = buildScorecardObject('draft');
    const saved = await saveScorecard(sc);
    currentScorecardId.value = saved.id;
    scorecardStatus.value = 'draft';
    isDirty.value = false;
    lastEditedInfo = ref(`Last saved draft on ${new Date().toLocaleTimeString()}`);
    emit('saved', saved);
  } catch (err: any) {
    console.error('[ScorecardForm] Save draft error:', err);
    validationErrors.value = [err.message || 'Failed to save draft scorecard.'];
  } finally {
    isSaving.value = false;
  }
};

const submitScorecard = async () => {
  if (!selectedProjectId.value) {
    validationErrors.value = ['Please select a project before submitting.'];
    return;
  }
  targetStatus.value = 'submitted';
  validationErrors.value = [];

  const sc = buildScorecardObject('submitted');
  const errors = validateForSubmit(sc);

  if (errors.length > 0) {
    validationErrors.value = errors;
    // Scroll smoothly to top error box
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  isSaving.value = true;
  try {
    const saved = await saveScorecard(sc);
    currentScorecardId.value = saved.id;
    scorecardStatus.value = 'submitted';
    isDirty.value = false;
    emit('saved', saved);
  } catch (err: any) {
    console.error('[ScorecardForm] Submit error:', err);
    if (err.details && Array.isArray(err.details)) {
      validationErrors.value = err.details;
    } else {
      validationErrors.value = [err.message || 'Failed to submit scorecard.'];
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    isSaving.value = false;
  }
};

// Jump to Error
const jumpToError = (errorMsg: string) => {
  if (errorMsg.includes('Assessor')) {
    document.getElementById('field-assessor')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (errorMsg.includes('Assessment date')) {
    document.getElementById('field-assessment-date')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (errorMsg.includes('Category "')) {
    // Find category name
    const match = errorMsg.match(/Category "([^"]+)"/);
    if (match && match[1]) {
      const cat = templateDef.value.categories.find((c) => c.name === match[1]);
      if (cat) {
        document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
  }
  if (errorMsg.includes('Remarks')) {
    // Find first empty remark for R/A
    const emptyRemark = entries.value.find(
      (e) => (e.value === 'R' || e.value === 'A') && (!e.remarks || !e.remarks.trim())
    );
    if (emptyRemark) {
      document.getElementById(`item-${emptyRemark.categoryId}-${emptyRemark.itemId}`)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }
  if (errorMsg.includes('10 items')) {
    // Find first unscored item
    const unScored = entries.value.find((e) => e.value === null || e.value === undefined);
    if (unScored) {
      document.getElementById(`item-${unScored.categoryId}-${unScored.itemId}`)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Cancel & Delete
const handleCancel = () => {
  if (isDirty.value) {
    showCancelConfirm.value = true;
  } else {
    emit('cancelled');
  }
};

const confirmCancel = () => {
  showCancelConfirm.value = false;
  isDirty.value = false;
  emit('cancelled');
};

const confirmDelete = async () => {
  if (!currentScorecardId.value) return;
  showDeleteConfirm.value = false;
  isSaving.value = true;
  try {
    await apiDeleteScorecard(currentScorecardId.value);
    isDirty.value = false;
    emit('deleted', currentScorecardId.value);
  } catch (err: any) {
    console.error('[ScorecardForm] Delete error:', err);
    validationErrors.value = [err.message || 'Failed to delete scorecard.'];
  } finally {
    isSaving.value = false;
  }
};

// Window unload listener
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

// Initializer
const initForm = async () => {
  await fetchSettings();

  if (props.scorecardId) {
    const sc = await getScorecard(props.scorecardId);
    if (sc) {
      currentScorecardId.value = sc.id;
      selectedProjectId.value = sc.projectId;
      selectedTemplateId.value = sc.templateId;
      assessmentDate.value = sc.assessmentDate || new Date().toISOString().slice(0, 10);
      assessor.value = sc.assessor || '';
      scorecardStatus.value = sc.status;
      headerPhase.value = sc.header?.phase || 'Modeling';
      headerModelVersion.value = sc.header?.modelVersion || '';
      headerProjectComment.value = sc.header?.projectComment || '';
      headerModelComment.value = sc.header?.modelComment || '';
      orsDailyUpdates.value = sc.header?.dailyUpdatesLastWeek ?? 5;
      entries.value = sc.items && sc.items.length > 0 ? sc.items : buildEmptyEntries(sc.templateId);

      if (sc.lastEditedBy) {
        lastEditedInfo.value = `Last edited by ${sc.lastEditedBy} on ${new Date(sc.updatedAt).toLocaleDateString()}`;
      } else if (sc.submittedAt) {
        lastEditedInfo.value = `Submitted on ${new Date(sc.submittedAt).toLocaleDateString()}`;
      }
      isDirty.value = false;
      findPreviousScorecard();
      return;
    }
  }

  // New scorecard setup
  const initialProj = props.projectId
    ? projects.value.find((p) => p.id === props.projectId)
    : eligibleProjects.value[0] || projects.value[0];

  if (initialProj) {
    selectedProjectId.value = initialProj.id;
    if (initialProj.scorecardConfig?.enabled?.length) {
      selectedTemplateId.value = props.templateId && initialProj.scorecardConfig.enabled.includes(props.templateId)
        ? props.templateId
        : initialProj.scorecardConfig.enabled[0];
    }
    const defaultAssessor = initialProj.scorecardConfig?.assessors?.[selectedTemplateId.value];
    if (defaultAssessor) {
      assessor.value = defaultAssessor;
    }
  }

  entries.value = buildEmptyEntries(selectedTemplateId.value);
  isDirty.value = false;
  findPreviousScorecard();
};

watch(
  () => props.scorecardId,
  (newId) => {
    if (newId) {
      currentScorecardId.value = newId;
      initForm();
    }
  }
);

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  initForm();
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>
