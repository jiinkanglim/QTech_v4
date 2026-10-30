<template>
  <span
    :class="[
      'inline-flex items-center font-bold rounded-md transition-all border whitespace-nowrap select-none',
      sizeClasses,
      badgeStyle
    ]"
    :title="`Project Delivery Type: ${normalizedType}`"
  >
    <Zap v-if="normalizedType.toLowerCase() === 'optimization'" :class="iconSizeClass" />
    <Sliders v-else-if="normalizedType.toLowerCase() === 'manual'" :class="iconSizeClass" />
    <Layers v-else :class="iconSizeClass" />
    <span :class="['tracking-tight', textVisibilityClass]">
      {{ normalizedType }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ProjectType } from '../types';
import { Zap, Sliders, Layers } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    type?: ProjectType | string | null;
    size?: 'xs' | 'sm' | 'md';
    showText?: boolean;
  }>(),
  {
    type: 'Manual',
    size: 'sm',
    showText: true,
  }
);

const normalizedType = computed<string>(() => {
  return (props.type && String(props.type).trim()) ? String(props.type).trim() : 'Manual';
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-1.5 py-0.2 text-[9px] space-x-1';
    case 'md':
      return 'px-2.5 py-1 text-xs space-x-1.5';
    case 'sm':
    default:
      return 'px-2 py-0.5 text-[10px] space-x-1';
  }
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-2.5 h-2.5 shrink-0';
    case 'md':
      return 'w-3.5 h-3.5 shrink-0';
    case 'sm':
    default:
      return 'w-3 h-3 shrink-0';
  }
});

const badgeStyle = computed(() => {
  const lower = normalizedType.value.toLowerCase();
  if (lower === 'optimization') {
    return 'bg-sky-50 text-[#005386] border-sky-300 dark:bg-[#0a2744] dark:text-[#38bdf8] dark:border-[#0284c7]/50';
  }
  if (lower === 'manual') {
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#0d1e33] dark:text-slate-300 dark:border-[#1e3a5f]';
  }
  if (lower.includes('auto') || lower.includes('bot') || lower.includes('ai')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  }
  if (lower.includes('migrat') || lower.includes('transform')) {
    return 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
  }
  if (lower.includes('maint') || lower.includes('support') || lower.includes('ops')) {
    return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  }
  // Custom project types configured in Master Data
  return 'bg-[#e8f2f8] text-[#005386] border-[#bad8eb] dark:bg-[#0e2a42] dark:text-[#7dd3fc] dark:border-[#1d4d73]';
});

const textVisibilityClass = computed(() => {
  return props.showText ? 'inline' : 'hidden';
});
</script>
