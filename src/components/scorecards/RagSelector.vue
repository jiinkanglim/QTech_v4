<template>
  <div class="inline-flex items-center rounded-lg border border-slate-200 dark:border-[#1b3654] p-0.5 bg-slate-50 dark:bg-[#071524]">
    <!-- Green Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="toggleValue('G')"
      @keydown.enter.prevent="toggleValue('G')"
      @keydown.space.prevent="toggleValue('G')"
      :title="labelType === 'compliance' ? 'Green – Fully Compliant' : 'Green – Good / On Track'"
      :aria-label="labelType === 'compliance' ? 'Green Compliance' : 'Green Score'"
      :aria-pressed="modelValue === 'G'"
      :class="[
        'px-2.5 py-1 text-xs font-bold rounded-md transition-all select-none cursor-pointer flex items-center justify-center space-x-1 min-w-[32px]',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        modelValue === 'G'
          ? 'bg-emerald-600 text-white shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
      ]"
    >
      <span>G</span>
    </button>

    <!-- Amber Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="toggleValue('A')"
      @keydown.enter.prevent="toggleValue('A')"
      @keydown.space.prevent="toggleValue('A')"
      :title="labelType === 'compliance' ? 'Amber – Partially Compliant / Needs Review' : 'Amber – Attention / Risk'"
      :aria-label="labelType === 'compliance' ? 'Amber Compliance' : 'Amber Score'"
      :aria-pressed="modelValue === 'A'"
      :class="[
        'px-2.5 py-1 text-xs font-bold rounded-md transition-all select-none cursor-pointer flex items-center justify-center space-x-1 min-w-[32px]',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        modelValue === 'A'
          ? 'bg-amber-500 text-white shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
      ]"
    >
      <span>A</span>
    </button>

    <!-- Red Button -->
    <button
      type="button"
      :disabled="disabled"
      @click="toggleValue('R')"
      @keydown.enter.prevent="toggleValue('R')"
      @keydown.space.prevent="toggleValue('R')"
      :title="labelType === 'compliance' ? 'Red – Non-Compliant / Violation' : 'Red – Critical / Serious Risk'"
      :aria-label="labelType === 'compliance' ? 'Red Compliance' : 'Red Score'"
      :aria-pressed="modelValue === 'R'"
      :class="[
        'px-2.5 py-1 text-xs font-bold rounded-md transition-all select-none cursor-pointer flex items-center justify-center space-x-1 min-w-[32px]',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        modelValue === 'R'
          ? 'bg-rose-600 text-white shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
      ]"
    >
      <span>R</span>
    </button>

    <!-- Optional NA Button (for ORS) -->
    <button
      v-if="allowNA"
      type="button"
      :disabled="disabled"
      @click="toggleValue('NA')"
      @keydown.enter.prevent="toggleValue('NA')"
      @keydown.space.prevent="toggleValue('NA')"
      title="N/A – Not Applicable (excluded from point calculation)"
      aria-label="Not Applicable"
      :aria-pressed="modelValue === 'NA'"
      :class="[
        'px-2.5 py-1 text-xs font-bold rounded-md transition-all select-none cursor-pointer flex items-center justify-center space-x-1 min-w-[36px]',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        modelValue === 'NA'
          ? 'bg-slate-500 text-white shadow-xs'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800'
      ]"
    >
      <span>N/A</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { RagValue } from '../../types';

const props = withDefaults(
  defineProps<{
    modelValue: RagValue | null;
    allowNA?: boolean;
    labelType?: 'score' | 'compliance';
    disabled?: boolean;
  }>(),
  {
    allowNA: false,
    labelType: 'score',
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: RagValue | null): void;
}>();

const toggleValue = (val: RagValue) => {
  if (props.disabled) return;
  // Clicking the currently active button toggles it off (clears to unscored null)
  if (props.modelValue === val) {
    emit('update:modelValue', null);
  } else {
    emit('update:modelValue', val);
  }
};
</script>
