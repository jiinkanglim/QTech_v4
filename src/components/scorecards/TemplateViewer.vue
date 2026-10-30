<template>
  <div class="space-y-4">
    <!-- Template Selector Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654]">
      <div class="flex items-center space-x-2">
        <button
          v-for="tpl in templateList"
          :key="tpl.id"
          type="button"
          @click="selectedId = tpl.id"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5',
            selectedId === tpl.id
              ? 'bg-[#005386] text-white shadow-xs'
              : 'bg-white dark:bg-[#0f2238] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#163352] border border-slate-200 dark:border-[#1b3654]'
          ]"
        >
          <span>{{ tpl.id === 'SWE_MODEL' ? 'SWE Model Scoring' : 'ORS Optimizer RAG' }}</span>
          <span
            :class="[
              'text-[10px] px-1.5 py-0.2 rounded font-mono',
              selectedId === tpl.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            ]"
          >
            v{{ tpl.version }}
          </span>
        </button>
      </div>

      <div class="flex items-center space-x-2 text-xs">
        <button
          type="button"
          @click="toggleAll(true)"
          class="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-[#005386] dark:hover:text-[#7dd3fc] font-medium cursor-pointer"
        >
          Expand All
        </button>
        <span class="text-slate-300 dark:text-slate-700">•</span>
        <button
          type="button"
          @click="toggleAll(false)"
          class="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-[#005386] dark:hover:text-[#7dd3fc] font-medium cursor-pointer"
        >
          Collapse All
        </button>
      </div>
    </div>

    <!-- Active Template Card -->
    <div v-if="activeTemplate" class="space-y-3">
      <!-- Template Metadata Header -->
      <div class="p-4 bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ activeTemplate.name }}
              </h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]">
                {{ activeTemplate.role }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ activeTemplate.categories.length }} categories,
              {{ totalItemsCount }} evaluated items total
            </p>
          </div>

          <div class="flex items-center space-x-1.5 self-start sm:self-auto">
            <span class="text-[11px] text-slate-400">Allowed RAG:</span>
            <span
              v-for="v in activeTemplate.allowedValues"
              :key="v"
              :class="[
                'text-[10px] font-bold px-1.5 py-0.5 rounded',
                v === 'G' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                v === 'A' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                v === 'R' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              ]"
            >
              {{ v === 'NA' ? 'N/A' : v }}
            </span>
          </div>
        </div>
      </div>

      <!-- Categories Accordion -->
      <div class="space-y-2">
        <div
          v-for="cat in activeTemplate.categories"
          :key="cat.id"
          class="bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] overflow-hidden shadow-xs transition-all"
        >
          <!-- Category Header -->
          <button
            type="button"
            @click="toggleCategory(cat.id)"
            class="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50/80 dark:hover:bg-[#071524]/60 transition-colors cursor-pointer"
          >
            <div class="flex items-center space-x-2.5">
              <span class="w-6 h-6 rounded-md bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] font-bold text-xs flex items-center justify-center shrink-0">
                {{ cat.no }}
              </span>
              <div>
                <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {{ cat.name }}
                </span>
                <span v-if="cat.part" class="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#163352] text-slate-600 dark:text-slate-300">
                  Part: {{ cat.part }}
                </span>
                <span v-if="cat.optional" class="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Optional
                </span>
                <span v-if="cat.extensible" class="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Extensible ({{ cat.extensible === 'KEY_TRANSACTION' ? 'Key Trans' : 'Custom' }})
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-2 shrink-0">
              <span class="text-[11px] text-slate-400 font-medium">
                {{ cat.items.length }} {{ cat.items.length === 1 ? 'item' : 'items' }}
              </span>
              <ChevronDown
                :class="[
                  'w-4 h-4 text-slate-400 transition-transform duration-200',
                  expandedCategories[cat.id] ? 'rotate-180' : ''
                ]"
              />
            </div>
          </button>

          <!-- Category Items List -->
          <div
            v-if="expandedCategories[cat.id]"
            class="border-t border-slate-100 dark:border-[#1b3654] bg-slate-50/50 dark:bg-[#071524]/40 divide-y divide-slate-100 dark:divide-[#1b3654]"
          >
            <div
              v-for="item in cat.items"
              :key="item.id"
              class="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2"
            >
              <div class="space-y-1 flex-1">
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-semibold text-slate-900 dark:text-white">
                    {{ item.name }}
                  </span>
                  <span class="text-[10px] font-mono text-slate-400">
                    ({{ item.id }})
                  </span>
                </div>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {{ item.description }}
                </p>
              </div>

              <div class="shrink-0 flex items-center space-x-1 sm:pt-0.5">
                <span class="text-[10px] font-medium text-slate-400 mr-1">RAG:</span>
                <span
                  v-for="val in activeTemplate.allowedValues"
                  :key="val"
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0f2238]"
                >
                  {{ val === 'NA' ? 'N/A' : val }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { SCORECARD_TEMPLATES } from '../../scoring/templates';
import { ScorecardTemplateId } from '../../types';
import { ChevronDown } from 'lucide-vue-next';

const selectedId = ref<ScorecardTemplateId>('SWE_MODEL');
const templateList = Object.values(SCORECARD_TEMPLATES);

const activeTemplate = computed(() => SCORECARD_TEMPLATES[selectedId.value]);

const totalItemsCount = computed(() => {
  if (!activeTemplate.value) return 0;
  return activeTemplate.value.categories.reduce((acc, cat) => acc + cat.items.length, 0);
});

// Category expand/collapse state: default all expanded
const expandedCategories = ref<Record<string, boolean>>({
  general: true,
  ood: true,
  logic: true,
  ui: true,
  thin_client: true,
  integration: true,
  metrics: true,
  ors_cat_1: true,
  ors_cat_2: true,
  ors_cat_3: true,
  ors_cat_4: true,
  ors_cat_5: true,
  ors_cat_6: true,
  ors_cat_7: true,
  ors_cat_8: true,
  ors_cat_9: true,
  ors_cat_10: true,
});

function toggleCategory(catId: string) {
  expandedCategories.value[catId] = !expandedCategories.value[catId];
}

function toggleAll(expand: boolean) {
  if (!activeTemplate.value) return;
  for (const cat of activeTemplate.value.categories) {
    expandedCategories.value[cat.id] = expand;
  }
}
</script>
