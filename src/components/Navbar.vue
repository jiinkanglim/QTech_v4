<template>
  <header class="sticky top-0 z-40 bg-white/95 dark:bg-[#0b1a2e]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#1b3654] transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Brand Logo & Title: DELMIA Quintiq Style -->
        <div class="flex items-center space-x-3 cursor-pointer group" @click="$emit('tabChange', 'dashboard')">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003b60] via-[#005386] to-[#0082c3] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#005386]/30 border border-[#0082c3]/40 group-hover:shadow-lg group-hover:shadow-[#0082c3]/30 transition-all">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" fill="currentColor" fill-opacity="0.2"/>
              <line x1="12" y1="22" x2="12" y2="15.5"/>
              <polyline points="22 8.5 12 15.5 2 8.5"/>
              <polyline points="2 15.5 12 8.5 22 15.5"/>
              <line x1="12" y1="2" x2="12" y2="8.5"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-black text-[#003b60] dark:text-white text-base sm:text-lg tracking-tight">
                DELMIA <span class="text-[#005386] dark:text-[#38bdf8]">Quintiq</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden xs:block font-medium">
              Operations & Engineering Delivery Tracker
            </p>
          </div>
        </div>

        <!-- Desktop Navigation Tabs -->
        <nav class="hidden lg:flex items-center space-x-1 bg-slate-100/90 dark:bg-[#071524] p-1 rounded-xl border border-slate-200/80 dark:border-[#1b3654]">
          <button
            id="nav-tab-dashboard"
            @click="$emit('tabChange', 'dashboard')"
            :class="[
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs border-b-2 border-[#005386] dark:border-[#38bdf8]'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#005386] dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            ]"
          >
            <LayoutDashboard class="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>

          <button
            id="nav-tab-projects"
            @click="$emit('tabChange', 'projects')"
            :class="[
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'projects'
                ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs border-b-2 border-[#005386] dark:border-[#38bdf8]'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#005386] dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            ]"
          >
            <FolderKanban class="w-4 h-4" />
            <span>Project Directory</span>
          </button>

          <button
            id="nav-tab-scorecards"
            @click="$emit('tabChange', 'scorecard-form')"
            :class="[
              'flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'scorecards' || activeTab === 'scorecard-form' || activeTab === 'scorecard-trends'
                ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs border-b-2 border-[#005386] dark:border-[#38bdf8]'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#005386] dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            ]"
          >
            <ClipboardCheck class="w-4 h-4" />
            <span>Scorecards</span>
          </button>

          <button
            id="nav-tab-settings"
            @click="$emit('tabChange', 'settings')"
            title="Master Data"
            aria-label="Master Data"
            :class="[
              'flex items-center justify-center p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'settings'
                ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#38bdf8] shadow-xs border-b-2 border-[#005386] dark:border-[#38bdf8]'
                : 'text-slate-600 dark:text-slate-300 hover:text-[#005386] dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40'
            ]"
          >
            <Settings class="w-4 h-4" />
          </button>
        </nav>

        <!-- Right Quick Action Bar -->
        <div class="flex items-center space-x-2">
          <!-- Quick Log Button in 3DS DELMIA Blue -->
          <button
            id="quick-post-update-btn"
            @click="$emit('quickLog')"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#005386] hover:bg-[#004169] text-white font-semibold text-xs shadow-md shadow-[#005386]/25 border border-[#005386] transition-all cursor-pointer"
          >
            <PlusCircle class="w-4 h-4 text-[#7dd3fc]" />
            <span class="hidden sm:inline">Log Status</span>
          </button>

          <!-- Theme Toggle -->
          <button
            id="theme-toggle-btn"
            @click="toggleDarkMode"
            class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-[#005386] dark:text-slate-300 dark:hover:text-[#38bdf8] bg-slate-100/80 hover:bg-slate-200/80 dark:bg-[#0f2238] dark:hover:bg-[#152e4d] border border-slate-200 dark:border-[#1b3654] transition-all cursor-pointer"
            :title="isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
            :aria-label="isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          >
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-[#005386]" />
            <span class="text-xs font-semibold select-none">{{ isDark ? 'Light' : 'Dark' }}</span>
          </button>

          <!-- Mobile Drawer Toggle -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0f2238]"
          >
            <X v-if="isMobileMenuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div v-if="isMobileMenuOpen" class="lg:hidden border-t border-slate-200 dark:border-[#1b3654] bg-white dark:bg-[#0b1a2e] px-4 py-3 space-y-1">
      <button
        @click="selectMobileTab('dashboard')"
        :class="[
          'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold',
          activeTab === 'dashboard' ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#38bdf8]' : 'text-slate-700 dark:text-slate-300'
        ]"
      >
        <LayoutDashboard class="w-4 h-4" />
        <span>Executive Dashboard</span>
      </button>

      <button
        @click="selectMobileTab('projects')"
        :class="[
          'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold',
          activeTab === 'projects' ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#38bdf8]' : 'text-slate-700 dark:text-slate-300'
        ]"
      >
        <FolderKanban class="w-4 h-4" />
        <span>Project Directory</span>
      </button>

      <button
        @click="selectMobileTab('scorecard-form')"
        :class="[
          'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold',
          activeTab === 'scorecards' || activeTab === 'scorecard-form' || activeTab === 'scorecard-trends' ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#38bdf8]' : 'text-slate-700 dark:text-slate-300'
        ]"
      >
        <ClipboardCheck class="w-4 h-4" />
        <span>Scorecards</span>
      </button>

      <button
        @click="selectMobileTab('settings')"
        :class="[
          'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold',
          activeTab === 'settings' ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#38bdf8]' : 'text-slate-700 dark:text-slate-300'
        ]"
      >
        <Settings class="w-4 h-4" />
        <span>Master Data</span>
      </button>

      <div class="pt-2 border-t border-slate-100 dark:border-[#1b3654]">
        <button
          @click="toggleDarkMode"
          class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0f2238] transition-colors"
        >
          <span class="flex items-center space-x-2">
            <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
            <Moon v-else class="w-4 h-4 text-[#005386]" />
            <span>Theme Mode</span>
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#071524] text-[#005386] dark:text-[#38bdf8] border border-slate-200 dark:border-[#1b3654]">
            {{ isDark ? 'Dark Theme' : 'Light Theme' }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-vue-next';

defineProps<{
  activeTab: string;
}>();

const emit = defineEmits<{
  (e: 'tabChange', tab: string): void;
  (e: 'quickLog'): void;
}>();

const isMobileMenuOpen = ref(false);
const isDark = ref(false);

const applyTheme = (dark: boolean) => {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

onMounted(() => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      applyTheme(true);
    } else if (saved === 'light') {
      applyTheme(false);
    } else {
      // Default to light theme for high-contrast presentation if not previously set
      applyTheme(document.documentElement.classList.contains('dark'));
    }
  } catch (e) {
    applyTheme(document.documentElement.classList.contains('dark'));
  }
});

const toggleDarkMode = () => {
  const next = !isDark.value;
  applyTheme(next);
  try {
    localStorage.setItem('theme', next ? 'dark' : 'light');
  } catch (e) {}
};

const selectMobileTab = (tab: string) => {
  emit('tabChange', tab);
  isMobileMenuOpen.value = false;
};
</script>
