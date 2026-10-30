<template>
  <span
    :class="[
      'inline-flex items-center font-bold rounded-md transition-all border whitespace-nowrap select-none',
      sizeClasses,
      badgeStyle
    ]"
    :title="`Project Lifecycle Status: ${displayLabel}`"
  >
    <span :class="['w-1.5 h-1.5 rounded-full shrink-0 mr-1.5', dotStyle]"></span>
    <span class="tracking-tight uppercase text-[9px] font-black">
      {{ displayLabel }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ProjectStatus } from '../types';

const props = withDefaults(
  defineProps<{
    status?: ProjectStatus | string | null;
    size?: 'xs' | 'sm' | 'md';
  }>(),
  {
    status: 'ACTIVE',
    size: 'xs',
  }
);

const normalizedStatus = computed<string>(() => {
  return (props.status && String(props.status).trim()) ? String(props.status).trim().toUpperCase() : 'ACTIVE';
});

const displayLabel = computed(() => {
  switch (normalizedStatus.value) {
    case 'ACTIVE':
      return 'Active';
    case 'ON_HOLD':
      return 'On Hold';
    case 'COMPLETED':
      return 'Completed';
    case 'PLANNING':
      return 'Planning';
    default:
      return normalizedStatus.value;
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'md':
      return 'px-2.5 py-1 text-xs';
    case 'sm':
      return 'px-2 py-0.5 text-[10px]';
    case 'xs':
    default:
      return 'px-1.5 py-0.5 text-[9px]';
  }
});

const badgeStyle = computed(() => {
  switch (normalizedStatus.value) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    case 'ON_HOLD':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'COMPLETED':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800';
    case 'PLANNING':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
});

const dotStyle = computed(() => {
  switch (normalizedStatus.value) {
    case 'ACTIVE':
      return 'bg-emerald-500 animate-pulse';
    case 'ON_HOLD':
      return 'bg-amber-500';
    case 'COMPLETED':
      return 'bg-sky-500';
    case 'PLANNING':
      return 'bg-purple-500';
    default:
      return 'bg-slate-400';
  }
});
</script>
