<template>
  <div
    :id="'cat-' + category.id"
    class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden transition-all"
  >
    <!-- Collapsible Header -->
    <div
      @click="isOpen = !isOpen"
      class="px-4 py-3.5 bg-slate-50/80 dark:bg-[#0b1a2e]/80 border-b border-slate-200/80 dark:border-[#1b3654] flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 dark:hover:bg-[#0e243d] transition-colors"
    >
      <div class="flex items-center space-x-3">
        <button
          type="button"
          class="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-transform duration-200"
          :aria-expanded="isOpen"
          :aria-label="isOpen ? 'Collapse category' : 'Expand category'"
        >
          <ChevronDown
            class="w-4 h-4 transition-transform duration-200"
            :class="{ '-rotate-90': !isOpen }"
          />
        </button>

        <div class="flex items-center space-x-2">
          <span class="w-6 h-6 rounded-md bg-[#005386]/10 dark:bg-[#005386]/30 text-[#005386] dark:text-[#38bdf8] text-xs font-bold flex items-center justify-center shrink-0">
            {{ category.no }}
          </span>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            {{ category.name }}
          </h3>
          <span
            v-if="category.optional"
            class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          >
            Optional
          </span>
        </div>
      </div>

      <!-- Live Category Score & Status -->
      <div class="flex items-center space-x-2.5">
        <div v-if="categoryScore !== null && categoryScore !== undefined" class="flex items-center space-x-2">
          <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {{ categoryScoreFormatted }}
          </span>
          <span
            v-if="categoryRag"
            :class="[
              'px-2 py-0.5 text-[11px] font-bold rounded-full border',
              categoryRag === 'G' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
              categoryRag === 'A' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' :
              'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
            ]"
          >
            {{ categoryRag }}
          </span>
        </div>
        <span
          v-else
          class="text-xs text-slate-400 dark:text-slate-500 italic"
        >
          Not scored
        </span>
      </div>
    </div>

    <!-- Category Items Table / Body -->
    <div v-show="isOpen" class="p-4 space-y-4">
      <div class="divide-y divide-slate-100 dark:divide-[#1b3654]/60">
        <!-- Render each item (predefined items and dynamically added items) -->
        <div
          v-for="entry in categoryEntries"
          :key="entry.itemId"
          :id="'item-' + category.id + '-' + entry.itemId"
          class="py-3.5 first:pt-0 last:pb-0 space-y-2.5 transition-colors"
        >
          <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
            <!-- Left: Title and Description -->
            <div class="flex-1 space-y-1">
              <div class="flex items-center space-x-2">
                <!-- Standard Item Title -->
                <div v-if="!entry.isCustom && !isDynamicKeyTransaction(entry.itemId)" class="flex items-center space-x-1.5">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {{ getItemName(entry.itemId) }}
                  </span>
                </div>

                <!-- Custom Key Transaction Title Input -->
                <div v-else-if="isDynamicKeyTransaction(entry.itemId)" class="flex items-center space-x-2 w-full max-w-md">
                  <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                    Key transaction / decision:
                  </span>
                  <input
                    type="text"
                    :value="entry.customLabel || ''"
                    @input="handleCustomLabelChange(entry, ($event.target as HTMLInputElement).value)"
                    placeholder="e.g. Publish Schedule to ERP"
                    class="flex-1 px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
                  />
                </div>

                <!-- Fully Custom Other Item Title Input -->
                <div v-else class="flex items-center space-x-2 w-full max-w-md">
                  <input
                    type="text"
                    :value="entry.customLabel || ''"
                    @input="handleCustomLabelChange(entry, ($event.target as HTMLInputElement).value)"
                    placeholder="Custom assessment criteria title..."
                    class="flex-1 px-2.5 py-1 text-xs font-bold bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
                  />
                </div>

                <!-- Delete button for dynamic custom rows -->
                <button
                  v-if="entry.isCustom || isDynamicKeyTransaction(entry.itemId)"
                  type="button"
                  @click="$emit('removeCustomItem', entry.itemId)"
                  class="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="Remove this custom item"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Item Description -->
              <p
                v-if="!entry.isCustom && !isDynamicKeyTransaction(entry.itemId)"
                class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed"
              >
                {{ getItemDescription(entry.itemId) }}
              </p>
              <div v-else-if="entry.isCustom" class="pt-1">
                <input
                  type="text"
                  :value="entry.customDescription || ''"
                  @input="handleCustomDescChange(entry, ($event.target as HTMLInputElement).value)"
                  placeholder="Optional criteria description / guidelines..."
                  class="w-full max-w-md px-2.5 py-1 text-[11px] bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-lg text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#005386]"
                />
              </div>
            </div>

            <!-- Right: Segmented RAG Selector -->
            <div class="flex items-center space-x-3 shrink-0 self-start lg:self-center">
              <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {{ category.part === 'METRICS' ? 'Compliance' : 'Score' }}:
              </span>
              <RagSelector
                :modelValue="entry.value"
                :allowNA="templateId === 'ORS_RAG'"
                :labelType="category.part === 'METRICS' ? 'compliance' : 'score'"
                @update:modelValue="handleValueChange(entry, $event)"
              />
            </div>
          </div>

          <!-- Remarks Textarea & ORS Validation Visual -->
          <div class="space-y-1">
            <textarea
              :value="entry.remarks"
              @input="handleRemarksChange(entry, ($event.target as HTMLTextAreaElement).value)"
              rows="2"
              placeholder="Remarks, findings, evidence, or improvement notes..."
              :class="[
                'w-full px-3 py-1.5 text-xs bg-slate-50/60 dark:bg-[#071524]/60 border rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none transition-all',
                isOrsRemarksRequired(entry)
                  ? 'border-rose-500 ring-1 ring-rose-500/50 bg-rose-50/20 dark:bg-rose-950/20 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-[#1b3654] focus:border-[#005386] focus:ring-1 focus:ring-[#005386]'
              ]"
            ></textarea>

            <!-- ORS Validation Warning -->
            <div
              v-if="isOrsRemarksRequired(entry)"
              class="flex items-center space-x-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-semibold"
            >
              <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
              <span>Improvement action required in remarks for Red/Amber assessment.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Extensible Action Buttons -->
      <div v-if="category.extensible" class="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#1b3654]">
        <button
          v-if="category.extensible === 'KEY_TRANSACTION'"
          type="button"
          @click="addKeyTransaction"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#e8f2f8] hover:bg-[#d5e7f4] dark:bg-[#0e2a42] dark:hover:bg-[#133857] text-[#005386] dark:text-[#38bdf8] text-xs font-semibold border border-[#bad8eb] dark:border-[#1d4d73] transition-colors cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add key transaction / decision</span>
        </button>

        <button
          v-if="category.extensible === 'CUSTOM'"
          type="button"
          :disabled="customItemsCount >= (category.maxCustomItems || 5)"
          @click="addCustomItem"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#e8f2f8] hover:bg-[#d5e7f4] dark:bg-[#0e2a42] dark:hover:bg-[#133857] text-[#005386] dark:text-[#38bdf8] text-xs font-semibold border border-[#bad8eb] dark:border-[#1d4d73] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add item ({{ customItemsCount }}/{{ category.maxCustomItems || 5 }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  TemplateCategory,
  ScorecardItemEntry,
  ScorecardTemplateId,
  RagValue
} from '../../types';
import RagSelector from './RagSelector.vue';
import { ChevronDown, Plus, Trash2, AlertTriangle } from 'lucide-vue-next';

const props = defineProps<{
  category: TemplateCategory;
  entries: ScorecardItemEntry[];
  templateId: ScorecardTemplateId;
  categoryScore?: number | null;
  categoryRag?: 'G' | 'A' | 'R' | null;
}>();

const emit = defineEmits<{
  (e: 'updateItem', entry: ScorecardItemEntry): void;
  (e: 'addCustomItem', payload: { categoryId: string; customLabel?: string; customDescription?: string; isCustom?: boolean }): void;
  (e: 'removeCustomItem', itemId: string): void;
}>();

const isOpen = ref(true);

const categoryEntries = computed(() => {
  return props.entries.filter((e) => e.categoryId === props.category.id);
});

const customItemsCount = computed(() => {
  return categoryEntries.value.filter((e) => e.isCustom).length;
});

const categoryScoreFormatted = computed(() => {
  if (props.categoryScore === null || props.categoryScore === undefined) return '';
  return props.categoryScore.toFixed(2);
});

const getItemName = (itemId: string): string => {
  const item = props.category.items.find((i) => i.id === itemId);
  return item ? item.name : itemId;
};

const getItemDescription = (itemId: string): string => {
  const item = props.category.items.find((i) => i.id === itemId);
  return item ? item.description : '';
};

const isDynamicKeyTransaction = (itemId: string): boolean => {
  return itemId.startsWith('perf_kt_custom_');
};

const isOrsRemarksRequired = (entry: ScorecardItemEntry): boolean => {
  if (props.templateId !== 'ORS_RAG') return false;
  return (entry.value === 'R' || entry.value === 'A') && (!entry.remarks || entry.remarks.trim() === '');
};

const handleValueChange = (entry: ScorecardItemEntry, val: RagValue | null) => {
  emit('updateItem', {
    ...entry,
    value: val,
  });
};

const handleRemarksChange = (entry: ScorecardItemEntry, remarks: string) => {
  emit('updateItem', {
    ...entry,
    remarks,
  });
};

const handleCustomLabelChange = (entry: ScorecardItemEntry, label: string) => {
  emit('updateItem', {
    ...entry,
    customLabel: label,
  });
};

const handleCustomDescChange = (entry: ScorecardItemEntry, desc: string) => {
  emit('updateItem', {
    ...entry,
    customDescription: desc,
  });
};

const addKeyTransaction = () => {
  emit('addCustomItem', {
    categoryId: props.category.id,
    customLabel: '',
  });
};

const addCustomItem = () => {
  emit('addCustomItem', {
    categoryId: props.category.id,
    customLabel: '',
    customDescription: '',
    isCustom: true,
  });
};
</script>
