<template>
  <span
    :class="[
      'inline-flex items-center space-x-1.5 font-bold rounded-full transition-all border',
      sizeClasses,
      badgeStyle
    ]"
  >
    <CheckCircle2 v-if="status === 'GREEN'" :class="iconSizeClass" />
    <AlertTriangle v-else-if="status === 'AMBER'" :class="iconSizeClass" />
    <XCircle v-else :class="iconSizeClass" />
    <span :class="['tracking-wide', textVisibilityClass]">
      {{ statusText }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RAGStatus } from '../types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    status: RAGStatus;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
  }>(),
  {
    size: 'md',
    showText: true,
  }
);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2 py-0.5 text-[10px]';
    case 'lg':
      return 'px-3.5 py-1.5 text-xs';
    case 'md':
    default:
      return 'px-2.5 py-1 text-xs';
  }
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-3 h-3';
    case 'lg':
      return 'w-4 h-4';
    case 'md':
    default:
      return 'w-3.5 h-3.5';
  }
});

const badgeStyle = computed(() => {
  switch (props.status) {
    case 'GREEN':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 dark:bg-emerald-950/50';
    case 'AMBER':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:bg-amber-950/50';
    case 'RED':
      return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:bg-rose-950/50';
    default:
      return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'GREEN':
      return 'On Track';
    case 'AMBER':
      return 'Needs Attn';
    case 'RED':
      return 'At Risk';
    default:
      return props.status;
  }
});

const textVisibilityClass = computed(() => {
  return props.showText ? 'inline' : 'hidden';
});
</script>
