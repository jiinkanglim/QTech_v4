<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] max-w-md w-full shadow-2xl p-6 space-y-4 text-left"
      >
        <div class="flex items-start space-x-3">
          <div class="p-2.5 bg-rose-50 dark:bg-rose-950/80 rounded-xl text-rose-600 dark:text-rose-400 shrink-0 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              {{ title }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {{ message }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-[#1b3654]">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#071524] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="$emit('confirm')"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
  }>(),
  {
    confirmText: 'Confirm',
  }
);

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>
