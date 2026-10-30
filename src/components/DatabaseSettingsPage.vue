<template>
  <div class="space-y-4 pb-10">
    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      class="fixed bottom-8 right-6 z-50 bg-[#07192b] text-white px-3 py-2 rounded-xl shadow-xl border border-[#0082c3]/40 flex items-center space-x-2 text-xs font-semibold animate-fade-in"
    >
      <Check class="w-3.5 h-3.5 text-emerald-400" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Header Navigation & Title Banner -->
    <div class="bg-white dark:bg-[#0f2238] p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-3">
      <!-- Breadcrumb & Back Button -->
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-3">
        <div class="flex items-center space-x-2 text-xs">
          <button
            id="back-to-master-data-btn"
            @click="$emit('backToMasterData')"
            class="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 hover:text-[#005386] dark:hover:text-[#7dd3fc] font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Master Data</span>
          </button>
          <ChevronRight class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span class="font-bold text-slate-800 dark:text-slate-200">
            Database Configuration & Migration
          </span>
        </div>

        <button
          @click="$emit('backToMasterData')"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#0b1d30] text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Master Data</span>
        </button>
      </div>

      <!-- Main Header Details -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-start sm:items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003b60] via-[#005386] to-[#0082c3] flex items-center justify-center text-white shadow-md shadow-[#005386]/25 border border-[#0082c3]/30 shrink-0">
            <Database class="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
              <span>Database Connection, Schemas & Migration</span>
            </h1>
            <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Enterprise relational storage hub supporting <strong>SQLite</strong>, <strong>PostgreSQL</strong>, and <strong>Microsoft SQL Server</strong>. Create table structures, inspect DDL scripts, and sync flat JSON data.
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <span
            v-if="dbStatus?.connected"
            class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online: {{ dbStatus.engine.toUpperCase() }}</span>
          </span>
          <span
            v-else
            class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Database Offline</span>
          </span>
        </div>
      </div>
    </div>

    <!-- MAIN DATABASE CONFIGURATION CARD -->
    <DatabaseConfigCard @notify="showToast" />

    <!-- Bottom Navigation Bar -->
    <div class="flex items-center justify-between p-4 bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
      <div class="text-xs text-slate-500 dark:text-slate-400">
        Finished configuring database settings? Return to manage products, regions, and project types.
      </div>
      <button
        id="bottom-back-to-master-data-btn"
        @click="$emit('backToMasterData')"
        class="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Return to Master Data</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProjects } from '../composables/useProjects';
import DatabaseConfigCard from './DatabaseConfigCard.vue';
import { Database, ArrowLeft, ChevronRight, Check } from 'lucide-vue-next';

defineEmits<{
  (e: 'backToMasterData'): void;
}>();

const { dbStatus } = useProjects();
const toastMessage = ref('');

const showToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3500);
};
</script>
