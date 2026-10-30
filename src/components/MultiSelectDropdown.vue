<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      :id="id"
      type="button"
      @click="isOpen = !isOpen"
      :class="[
        'w-full py-1.5 px-2.5 bg-slate-50 dark:bg-[#071524] border rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white flex items-center justify-between gap-1.5 transition-colors cursor-pointer text-left',
        isOpen ? 'ring-2 ring-[#005386] border-[#005386]' : 'border-slate-200 dark:border-[#1b3654]',
        modelValue.length > 0
          ? 'bg-[#e8f2f8]/70 dark:bg-[#0e2a42]/60 border-[#bad8eb] dark:border-[#1d4d73] text-[#005386] dark:text-[#7dd3fc]'
          : ''
      ]"
      :aria-expanded="isOpen"
      :title="buttonTooltip"
    >
      <div class="flex items-center space-x-1.5 truncate flex-1 min-w-0">
        <Tag class="w-3 h-3 text-[#0082c3] shrink-0" />
        <span class="truncate">{{ displayLabel }}</span>
      </div>

      <div class="flex items-center space-x-1 shrink-0">
        <!-- Count Badge if multiple selected -->
        <span
          v-if="modelValue.length > 0"
          class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#005386] text-white dark:bg-[#38bdf8] dark:text-slate-900 leading-tight"
        >
          {{ modelValue.length }}
        </span>

        <!-- Clear Selection Button -->
        <button
          v-if="modelValue.length > 0"
          type="button"
          @click.stop="clearSelection"
          class="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
          title="Clear product selection"
        >
          <X class="w-3 h-3" />
        </button>

        <ChevronDown
          :class="[
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
            isOpen ? 'transform rotate-180 text-[#005386] dark:text-[#38bdf8]' : ''
          ]"
        />
      </div>
    </button>

    <!-- Dropdown Menu Popover -->
    <div
      v-if="isOpen"
      class="absolute left-0 mt-1 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0f2238] rounded-xl shadow-xl border border-slate-200 dark:border-[#1b3654] z-50 overflow-hidden text-xs"
    >
      <!-- Header Actions -->
      <div class="p-2 border-b border-slate-100 dark:border-[#1b3654] flex items-center justify-between bg-slate-50/80 dark:bg-[#071524]/60">
        <span class="font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase tracking-wider">
          {{ label || 'Product Suites' }}
        </span>
        <div class="flex items-center space-x-2 text-[11px]">
          <button
            type="button"
            @click="selectAll"
            class="text-[#005386] dark:text-[#38bdf8] font-semibold hover:underline cursor-pointer"
          >
            Select All
          </button>
          <span class="text-slate-300 dark:text-slate-600">|</span>
          <button
            type="button"
            @click="clearSelection"
            class="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Search Box (shown if > 4 items) -->
      <div v-if="options.length > 4" class="p-2 border-b border-slate-100 dark:border-[#1b3654]">
        <div class="relative">
          <Search class="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full pl-7 pr-6 py-1 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-md text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005386]"
          />
          <button
            v-if="searchQuery"
            type="button"
            @click="searchQuery = ''"
            class="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X class="w-3 h-3" />
          </button>
        </div>
      </div>

      <!-- Options List -->
      <div class="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
        <div
          v-if="filteredOptions.length === 0"
          class="py-4 text-center text-slate-400 text-xs italic"
        >
          No products match "{{ searchQuery }}"
        </div>

        <label
          v-for="opt in filteredOptions"
          :key="opt"
          class="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-[#133758] cursor-pointer transition-colors group select-none"
        >
          <div class="flex items-center space-x-2 truncate mr-2">
            <!-- Custom Checkbox -->
            <div
              :class="[
                'w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0',
                isSelected(opt)
                  ? 'bg-[#005386] border-[#005386] text-white dark:bg-[#38bdf8] dark:border-[#38bdf8] dark:text-slate-900'
                  : 'bg-white dark:bg-[#071524] border-slate-300 dark:border-slate-600 group-hover:border-[#005386]'
              ]"
            >
              <Check v-if="isSelected(opt)" class="w-3 h-3 stroke-[3]" />
            </div>

            <input
              type="checkbox"
              :checked="isSelected(opt)"
              @change="toggleOption(opt)"
              class="sr-only"
            />

            <span
              :class="[
                'truncate font-medium text-xs',
                isSelected(opt)
                  ? 'text-[#005386] dark:text-[#38bdf8] font-bold'
                  : 'text-slate-700 dark:text-slate-300'
              ]"
            >
              {{ opt }}
            </span>
          </div>

          <!-- Optional Count Badge -->
          <span
            v-if="counts && counts[opt] !== undefined"
            class="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-[#071524] text-slate-500 dark:text-slate-400 font-mono shrink-0"
          >
            {{ counts[opt] }}
          </span>
        </label>
      </div>

      <!-- Footer -->
      <div class="p-2 border-t border-slate-100 dark:border-[#1b3654] bg-slate-50/50 dark:bg-[#071524]/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>
          {{ modelValue.length === 0 ? 'All products visible' : `${modelValue.length} of ${options.length} selected` }}
        </span>
        <button
          type="button"
          @click="isOpen = false"
          class="px-2.5 py-1 bg-[#005386] hover:bg-[#004169] text-white rounded-md font-semibold text-xs transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Tag, ChevronDown, Check, X, Search } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    options: string[];
    placeholder?: string;
    label?: string;
    id?: string;
    counts?: Record<string, number>;
  }>(),
  {
    modelValue: () => [],
    options: () => [],
    placeholder: 'All Products',
    label: 'Product Suites',
    id: 'multi-select-products',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isSelected = (opt: string) => {
  return props.modelValue.includes(opt);
};

const toggleOption = (opt: string) => {
  const current = [...props.modelValue];
  const idx = current.indexOf(opt);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(opt);
  }
  emit('update:modelValue', current);
};

const selectAll = () => {
  emit('update:modelValue', [...props.options]);
};

const clearSelection = () => {
  emit('update:modelValue', []);
};

const filteredOptions = computed(() => {
  if (!searchQuery.value.trim()) return props.options;
  const q = searchQuery.value.toLowerCase().trim();
  return props.options.filter((opt) => opt.toLowerCase().includes(q));
});

const displayLabel = computed(() => {
  if (props.modelValue.length === 0) {
    return `${props.placeholder || 'All Products'} (${props.options.length})`;
  }
  if (props.modelValue.length === 1) {
    return `Product: ${props.modelValue[0]}`;
  }
  if (props.modelValue.length === 2) {
    return `Products: ${props.modelValue.join(', ')}`;
  }
  return `${props.modelValue.length} Products selected`;
});

const buttonTooltip = computed(() => {
  if (props.modelValue.length === 0) {
    return `Filtering: Showing all ${props.options.length} products`;
  }
  return `Filtered by: ${props.modelValue.join(', ')}`;
});

// Close on outside click
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

// Close on Escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});
</script>
