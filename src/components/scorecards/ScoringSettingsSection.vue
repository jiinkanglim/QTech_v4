<template>
  <div class="space-y-6">
    <!-- Scoring Configuration Card -->
    <div class="bg-white dark:bg-[#0f2238] p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1b3654] gap-3">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] flex items-center justify-center text-[#005386] dark:text-[#7dd3fc]">
            <Gauge class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-base font-bold text-slate-900 dark:text-white">
              Software Expert (SWE) Scoring Thresholds
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Configure RAG status bands and delivery cycle cadence for periodic scorecard assessments.
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button
            type="button"
            id="recalculate-scorecards-btn"
            @click="showRecalculateModal = true"
            :disabled="isRecalculating"
            class="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw :class="['w-3.5 h-3.5', isRecalculating ? 'animate-spin' : '']" />
            <span>Recalculate all scorecards</span>
          </button>

          <button
            type="button"
            id="save-scoring-settings-btn"
            @click="saveSettings"
            :disabled="!isValid || isSaving"
            class="px-4 py-1.5 rounded-lg bg-[#005386] hover:bg-[#004169] text-white text-xs font-semibold shadow-xs border border-[#005386] transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check class="w-3.5 h-3.5" />
            <span>{{ isSaving ? 'Saving...' : 'Save Settings' }}</span>
          </button>
        </div>
      </div>

      <!-- Threshold Inputs Form -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Amber Threshold Input -->
        <div class="p-3.5 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Amber (A) Threshold From
          </label>
          <div class="flex items-center space-x-2">
            <input
              id="swe-amber-from-input"
              type="number"
              step="0.1"
              min="1.0"
              max="3.0"
              v-model.number="sweAmberFrom"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>
          <p class="text-[11px] text-slate-500">
            Scores below {{ sweAmberFrom.toFixed(1) }} are marked as <strong class="text-rose-600">Red (R)</strong>.
          </p>
        </div>

        <!-- Green Threshold Input -->
        <div class="p-3.5 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Green (G) Threshold From
          </label>
          <div class="flex items-center space-x-2">
            <input
              id="swe-green-from-input"
              type="number"
              step="0.1"
              min="1.0"
              max="3.0"
              v-model.number="sweGreenFrom"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>
          <p class="text-[11px] text-slate-500">
            Scores at or above {{ sweGreenFrom.toFixed(1) }} are marked as <strong class="text-emerald-600">Green (G)</strong>.
          </p>
        </div>

        <!-- Default Cadence Selector -->
        <div class="p-3.5 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Default Project Cadence
          </label>
          <select
            id="default-cadence-select"
            v-model="defaultCadence"
            class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
          >
            <option value="weekly">Weekly (every ISO week)</option>
            <option value="biweekly">Bi-weekly (every 2 weeks)</option>
          </select>
          <p class="text-[11px] text-slate-500">
            Initial default cadence applied when enabling scorecards on a new project.
          </p>
        </div>
      </div>

      <!-- Validation Error Notice -->
      <div
        v-if="!isValid"
        class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2"
      >
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>Validation failed: Thresholds must satisfy <strong>1.0 &le; Amber &lt; Green &le; 3.0</strong>.</span>
      </div>

      <!-- Visual Legend Preview -->
      <div class="p-4 bg-slate-50/70 dark:bg-[#071524]/60 rounded-xl border border-slate-200 dark:border-[#1b3654] space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
            Visual RAG Band Legend Preview
          </span>
          <span class="text-[11px] text-slate-400 font-mono">
            Scale: 1.0 (Low) to 3.0 (Target)
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Red Band -->
          <div class="p-3 bg-white dark:bg-[#0f2238] rounded-lg border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2.5">
            <span class="w-6 h-6 rounded-md bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              R
            </span>
            <div class="text-xs">
              <div class="font-bold text-rose-700 dark:text-rose-300">
                Red Band (&lt; {{ sweAmberFrom.toFixed(1) }})
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">
                Cost: 1 pt. Significant technical debt or critical deviation.
              </div>
            </div>
          </div>

          <!-- Amber Band -->
          <div class="p-3 bg-white dark:bg-[#0f2238] rounded-lg border border-amber-200 dark:border-amber-900/60 flex items-start space-x-2.5">
            <span class="w-6 h-6 rounded-md bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              A
            </span>
            <div class="text-xs">
              <div class="font-bold text-amber-700 dark:text-amber-300">
                Amber Band ([{{ sweAmberFrom.toFixed(1) }}, {{ sweGreenFrom.toFixed(1) }}))
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">
                Cost: 2 pts. Acceptable progress with minor review findings.
              </div>
            </div>
          </div>

          <!-- Green Band -->
          <div class="p-3 bg-white dark:bg-[#0f2238] rounded-lg border border-emerald-200 dark:border-emerald-900/60 flex items-start space-x-2.5">
            <span class="w-6 h-6 rounded-md bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
              G
            </span>
            <div class="text-xs">
              <div class="font-bold text-emerald-700 dark:text-emerald-300">
                Green Band (&ge; {{ sweGreenFrom.toFixed(1) }})
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">
                Cost: 3 pts. High quality compliant with Delmia Quintiq standards.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Template Viewer Card -->
    <div class="bg-white dark:bg-[#0f2238] p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-4">
      <div class="flex items-center space-x-2.5 pb-2 border-b border-slate-100 dark:border-[#1b3654]">
        <div class="w-8 h-8 rounded-lg bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] flex items-center justify-center text-[#005386] dark:text-[#7dd3fc]">
          <BookOpen class="w-4 h-4" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">
            Scorecard Templates Inspection
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Read-only specification of categories, items, and evaluation rules for all quality scorecards.
          </p>
        </div>
      </div>

      <TemplateViewer />
    </div>

    <!-- Recalculate Confirm Modal -->
    <ConfirmModal
      :isOpen="showRecalculateModal"
      title="Recalculate All Scorecards"
      :message="`Are you sure you want to recalculate all existing scorecards? All stored scorecards will be re-evaluated with current thresholds (Amber: ${sweAmberFrom.toFixed(1)}, Green: ${sweGreenFrom.toFixed(1)}). Historical trend ratings and charts will change accordingly.`"
      confirmText="Recalculate All"
      @confirm="handleConfirmRecalculate"
      @cancel="showRecalculateModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TemplateViewer from './TemplateViewer.vue';
import ConfirmModal from '../ConfirmModal.vue';
import { Gauge, Check, RefreshCw, AlertCircle, BookOpen } from 'lucide-vue-next';
import { ScoringSettings } from '../../types';
import { DEFAULT_SCORING_SETTINGS } from '../../scoring/engine';

const emit = defineEmits<{
  (e: 'toast', msg: string): void;
}>();

const sweAmberFrom = ref<number>(DEFAULT_SCORING_SETTINGS.sweAmberFrom);
const sweGreenFrom = ref<number>(DEFAULT_SCORING_SETTINGS.sweGreenFrom);
const defaultCadence = ref<'weekly' | 'biweekly'>(DEFAULT_SCORING_SETTINGS.defaultCadence);

const isSaving = ref(false);
const isRecalculating = ref(false);
const showRecalculateModal = ref(false);

const isValid = computed(() => {
  const a = Number(sweAmberFrom.value);
  const g = Number(sweGreenFrom.value);
  return !isNaN(a) && !isNaN(g) && a >= 1.0 && a < g && g <= 3.0;
});

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.scoringSettings) {
        sweAmberFrom.value = Number(data.scoringSettings.sweAmberFrom) || DEFAULT_SCORING_SETTINGS.sweAmberFrom;
        sweGreenFrom.value = Number(data.scoringSettings.sweGreenFrom) || DEFAULT_SCORING_SETTINGS.sweGreenFrom;
        defaultCadence.value = data.scoringSettings.defaultCadence === 'biweekly' ? 'biweekly' : 'weekly';
      }
    }
  } catch (err) {
    console.warn('[ScoringSettings] Failed to fetch settings:', err);
  }
}

async function saveSettings() {
  if (!isValid.value) return;
  isSaving.value = true;
  try {
    const payload: { scoringSettings: ScoringSettings } = {
      scoringSettings: {
        sweAmberFrom: Number(sweAmberFrom.value),
        sweGreenFrom: Number(sweGreenFrom.value),
        defaultCadence: defaultCadence.value,
      },
    };
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      emit('toast', 'Scoring settings updated successfully');
    } else {
      const err = await res.json();
      emit('toast', err.error || 'Failed to save scoring settings');
    }
  } catch (err: any) {
    emit('toast', 'Network error saving scoring settings');
  } finally {
    isSaving.value = false;
  }
}

async function handleConfirmRecalculate() {
  showRecalculateModal.value = false;
  isRecalculating.value = true;
  try {
    const res = await fetch('/api/scorecards/recalculate', {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      emit('toast', `Recalculated ${data.updated ?? 0} scorecard(s) with new settings`);
    } else {
      emit('toast', 'Failed to recalculate scorecards');
    }
  } catch (err) {
    emit('toast', 'Error connecting to recalculation API');
  } finally {
    isRecalculating.value = false;
  }
}

defineExpose({
  loadSettings,
});

onMounted(() => {
  loadSettings();
});
</script>
