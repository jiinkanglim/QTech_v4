<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] max-w-2xl w-full shadow-2xl p-6 space-y-4 text-left max-h-[90vh] flex flex-col"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-3">
          <div class="flex items-center space-x-2.5">
            <div class="p-2 bg-[#e8f2f8] dark:bg-[#0e2a42] rounded-xl text-[#005386] dark:text-[#38bdf8] border border-[#bad8eb] dark:border-[#1d4d73]">
              <Upload class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Import Scorecards from Excel
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Upload .xlsx or .xlsm workbooks containing periodic quality evaluation sheets.
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="handleClose"
            class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="overflow-y-auto flex-1 space-y-4 pr-1">
          <!-- Step 1: Form Inputs & File Upload -->
          <div v-if="!importResult || importResult.mode === 'preview'" class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- Target Project -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="selectedProjectId"
                  class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
                >
                  <option v-for="p in projects" :key="p.id" :value="p.id">
                    {{ p.name }} ({{ p.code }})
                  </option>
                </select>
              </div>

              <!-- Role / Template -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role / Template <span class="text-rose-500">*</span>
                </label>
                <select
                  v-model="selectedTemplateId"
                  class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
                >
                  <option value="SWE_MODEL">SWE Model (Lead Software Expert)</option>
                  <option value="ORS_RAG">ORS RAG (Optimizer Scientist)</option>
                </select>
              </div>

              <!-- Year for ORS -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Evaluation Year <span v-if="selectedTemplateId === 'ORS_RAG'" class="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  v-model.number="orsYear"
                  :min="2020"
                  :max="2035"
                  class="w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-mono font-medium"
                />
              </div>
            </div>

            <!-- File Drop Area -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Excel Workbook File (.xlsx, .xlsm)
              </label>
              <div
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDrop"
                :class="[
                  'border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2',
                  isDragging
                    ? 'border-[#005386] bg-[#005386]/5 dark:bg-[#38bdf8]/10'
                    : 'border-slate-200 dark:border-[#1b3654] hover:bg-slate-50 dark:hover:bg-[#071524]'
                ]"
                @click="triggerFileInput"
              >
                <input
                  type="file"
                  ref="fileInput"
                  accept=".xlsx,.xlsm"
                  class="hidden"
                  @change="onFileSelected"
                />
                <FileSpreadsheet class="w-8 h-8 text-[#005386] dark:text-[#38bdf8]" />
                <div class="text-xs">
                  <span class="font-bold text-slate-800 dark:text-slate-200">
                    {{ selectedFile ? selectedFile.name : 'Click to select or drag and drop workbook here' }}
                  </span>
                  <p class="text-[11px] text-slate-400 mt-0.5" v-if="!selectedFile">
                    Supports Microsoft Excel .xlsx and Macro-Enabled .xlsm templates
                  </p>
                  <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5" v-else>
                    {{ (selectedFile.size / 1024).toFixed(1) }} KB ready for preview
                  </p>
                </div>
              </div>
            </div>

            <!-- Error message if any -->
            <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Preview Button -->
            <div v-if="!importResult" class="flex justify-end pt-1">
              <button
                type="button"
                :disabled="!selectedFile || isProcessing"
                @click="runPreview"
                class="px-4 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Loader2 v-if="isProcessing" class="w-3.5 h-3.5 animate-spin" />
                <span>Parse & Preview Sheets</span>
              </button>
            </div>
          </div>

          <!-- Preview Table & Duplicate Choice -->
          <div v-if="importResult && importResult.mode === 'preview'" class="space-y-4 pt-2 border-t border-slate-100 dark:border-[#1b3654]">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Worksheet Preview ({{ importResult.sheets.length }} Sheets Detected)
              </h4>
              <button
                type="button"
                @click="resetPreview"
                class="text-xs text-[#005386] dark:text-[#38bdf8] hover:underline cursor-pointer"
              >
                Change File
              </button>
            </div>

            <!-- Duplicate Handling Radio -->
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] space-y-2 text-xs">
              <span class="font-bold text-slate-700 dark:text-slate-300 block">
                Duplicate Handling (for sheets with existing scorecards):
              </span>
              <div class="flex items-center space-x-4">
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="duplicateChoice" value="skip" class="text-[#005386]" />
                  <span>Skip existing</span>
                </label>
                <label class="flex items-center space-x-1.5 cursor-pointer">
                  <input type="radio" v-model="duplicateChoice" value="overwrite" class="text-[#005386]" />
                  <span>Overwrite existing</span>
                </label>
              </div>
            </div>

            <!-- Sheets Table -->
            <div class="border border-slate-200 dark:border-[#1b3654] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-50 dark:bg-[#071524] border-b border-slate-200 dark:border-[#1b3654] text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th class="py-2 px-3">Sheet</th>
                    <th class="py-2 px-3">Period</th>
                    <th class="py-2 px-3 text-center">Items</th>
                    <th class="py-2 px-3 text-center">Rating</th>
                    <th class="py-2 px-3 text-center">Duplicate</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-[#1b3654]">
                  <tr v-for="sh in importResult.sheets" :key="sh.sheetName" class="hover:bg-slate-50/50 dark:hover:bg-[#0e243d]/40">
                    <td class="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {{ sh.sheetName }}
                    </td>
                    <td class="py-2 px-3 font-mono text-[11px]">
                      {{ sh.periodLabel }}
                    </td>
                    <td class="py-2 px-3 text-center font-mono font-semibold">
                      {{ sh.mappedItemsCount }} items
                    </td>
                    <td class="py-2 px-3 text-center">
                      <div class="inline-flex items-center space-x-1 font-mono font-bold">
                        <span
                          v-if="sh.computedOverall?.overallRag"
                          :class="[
                            'w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white',
                            sh.computedOverall.overallRag === 'G' ? 'bg-emerald-600' :
                            sh.computedOverall.overallRag === 'A' ? 'bg-amber-500' : 'bg-rose-600'
                          ]"
                        >
                          {{ sh.computedOverall.overallRag }}
                        </span>
                        <span>{{ formatOverallVal(sh.computedOverall) }}</span>
                      </div>
                    </td>
                    <td class="py-2 px-3 text-center">
                      <span
                        :class="[
                          'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                          sh.duplicateFlag
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        ]"
                      >
                        {{ sh.duplicateFlag ? 'Duplicate' : 'New' }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Unmapped warnings if any -->
            <div v-if="allUnmappedRows.length > 0" class="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
              <span class="font-bold flex items-center space-x-1">
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>Notice: {{ allUnmappedRows.length }} rows skipped or unmapped</span>
              </span>
              <ul class="list-disc pl-4 space-y-0.5 text-[10px] max-h-24 overflow-y-auto">
                <li v-for="(warn, i) in allUnmappedRows" :key="i">{{ warn }}</li>
              </ul>
            </div>
          </div>

          <!-- Step 3: Commit Success Summary -->
          <div v-if="commitSummary" class="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 class="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h4 class="text-base font-bold text-slate-900 dark:text-white">Import Complete!</h4>
            <p class="text-xs text-slate-600 dark:text-slate-300">
              Successfully committed <strong>{{ commitSummary.importedCount }}</strong> scorecards.
              <span v-if="commitSummary.skippedCount > 0"> ({{ commitSummary.skippedCount }} skipped as duplicates).</span>
            </p>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-[#1b3654]">
          <button
            type="button"
            @click="handleClose"
            class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
          >
            {{ commitSummary ? 'Close' : 'Cancel' }}
          </button>

          <button
            v-if="importResult && !commitSummary"
            type="button"
            :disabled="isProcessing"
            @click="runCommit"
            class="px-4 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Loader2 v-if="isProcessing" class="w-3.5 h-3.5 animate-spin" />
            <span>Commit {{ importResult.sheets.length }} Scorecards</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Project, ScorecardTemplateId, ScorecardComputed } from '../../types';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  projects: Project[];
  initialProjectId?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'imported'): void;
}>();

const selectedProjectId = ref<string>('');
const selectedTemplateId = ref<ScorecardTemplateId>('SWE_MODEL');
const orsYear = ref<number>(new Date().getFullYear());
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const isDragging = ref(false);
const isProcessing = ref(false);
const errorMessage = ref<string | null>(null);

const duplicateChoice = ref<'skip' | 'overwrite'>('skip');
const importResult = ref<any | null>(null);
const commitSummary = ref<any | null>(null);

watch(
  () => props.projects,
  (list) => {
    if (list.length > 0 && !selectedProjectId.value) {
      selectedProjectId.value = props.initialProjectId || list[0].id;
    }
  },
  { immediate: true }
);

const handleClose = () => {
  resetAll();
  emit('close');
};

const resetAll = () => {
  selectedFile.value = null;
  errorMessage.value = null;
  importResult.value = null;
  commitSummary.value = null;
  isProcessing.value = false;
};

const resetPreview = () => {
  importResult.value = null;
  commitSummary.value = null;
  selectedFile.value = null;
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    errorMessage.value = null;
  }
};

const onDrop = (e: DragEvent) => {
  isDragging.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    const f = e.dataTransfer.files[0];
    if (f.name.endsWith('.xlsx') || f.name.endsWith('.xlsm')) {
      selectedFile.value = f;
      errorMessage.value = null;
    } else {
      errorMessage.value = 'Please upload a valid .xlsx or .xlsm Excel file.';
    }
  }
};

const formatOverallVal = (comp: ScorecardComputed | undefined) => {
  if (!comp || comp.overallValue === null || comp.overallValue === undefined) return '—';
  return selectedTemplateId.value === 'SWE_MODEL' ? comp.overallValue.toFixed(2) : `${comp.overallValue.toFixed(1)}/10`;
};

const allUnmappedRows = computed(() => {
  if (!importResult.value?.sheets) return [];
  const list: string[] = [];
  for (const s of importResult.value.sheets) {
    if (s.unmappedRows && s.unmappedRows.length > 0) {
      list.push(...s.unmappedRows.map((r: string) => `[${s.sheetName}] ${r}`));
    }
  }
  return list;
});

const runPreview = async () => {
  if (!selectedFile.value || !selectedProjectId.value) return;
  isProcessing.value = true;
  errorMessage.value = null;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('projectId', selectedProjectId.value);
    formData.append('templateId', selectedTemplateId.value);
    formData.append('year', String(orsYear.value));
    formData.append('mode', 'preview');
    formData.append('onDuplicate', duplicateChoice.value);

    const res = await fetch('/api/scorecards/import', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to parse workbook');
    }

    if (data.sheets.length === 0) {
      throw new Error('No valid scorecard sheets found in this workbook for the selected role.');
    }

    importResult.value = data;
  } catch (err: any) {
    errorMessage.value = err.message || 'Error parsing Excel workbook';
  } finally {
    isProcessing.value = false;
  }
};

const runCommit = async () => {
  if (!selectedFile.value || !selectedProjectId.value) return;
  isProcessing.value = true;
  errorMessage.value = null;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('projectId', selectedProjectId.value);
    formData.append('templateId', selectedTemplateId.value);
    formData.append('year', String(orsYear.value));
    formData.append('mode', 'commit');
    formData.append('onDuplicate', duplicateChoice.value);

    const res = await fetch('/api/scorecards/import', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to commit scorecards');
    }

    commitSummary.value = data;
    emit('imported');
  } catch (err: any) {
    errorMessage.value = err.message || 'Error committing scorecards';
  } finally {
    isProcessing.value = false;
  }
};
</script>
