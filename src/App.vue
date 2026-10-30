<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-[#091421] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-[#005386] selection:text-white transition-colors duration-200">
    <!-- Top Navigation Bar -->
    <Navbar
      :activeTab="activeTab"
      @tabChange="handleTabChange"
      @quickLog="handleQuickLog"
    />

    <!-- Main Container -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12">
      <!-- Tab 1: Executive KPIDashboard -->
      <KPIDashboard
        v-if="activeTab === 'dashboard'"
        @navigateToEntry="handleNavigateToEntry"
        @navigateToProjects="handleTabChange('projects')"
        @navigateToProjectSummary="handleNavigateToProjectSummary"
        @navigateToTrends="handleNavigateToTrends"
      />

      <!-- Tab 2: Post Weekly Status Entry Form -->
      <WeeklyUpdateForm
        v-else-if="activeTab === 'entry'"
        :initialProjectId="selectedProjectIdForEntry"
        :editingUpdateId="editingUpdateId"
        @successNavigate="handleFormSuccess"
        @cancel="handleFormCancel"
      />

      <!-- Tab 3: Software Project Directory -->
      <ProjectSetup
        v-else-if="activeTab === 'projects'"
        :initialProjectId="selectedProjectIdForSummary"
        @selectProject="handleProjectSelected"
        @navigateToEntry="handleNavigateToEntry"
        @navigateToScorecard="handleNavigateToScorecard"
        @closeSummary="handleCloseProjectSummary"
      />

      <!-- Tab 4: Master Settings -->
      <SettingsPage
        v-else-if="activeTab === 'settings'"
        @navigateToDatabase="activeTab = 'database'"
      />

      <!-- Tab 5: Database Storage, Schemas & Migration Page -->
      <DatabaseSettingsPage
        v-else-if="activeTab === 'database'"
        @backToMasterData="activeTab = 'settings'"
      />

      <!-- Tab 6: Quality Scorecards Register (WP5) -->
      <ScorecardRegister
        v-else-if="activeTab === 'scorecards'"
        @newScorecard="handleNavigateToScorecard(undefined, undefined)"
        @openDetail="handleOpenScorecardDetail"
        @editScorecard="handleEditScorecard"
        @compare="handleNavigateToCompare"
        @viewTrends="handleNavigateToTrends"
      />

      <!-- Tab 7: Quality Scorecard Form (WP4) -->
      <ScorecardForm
        v-else-if="activeTab === 'scorecard-form'"
        :scorecardId="selectedScorecardId"
        :projectId="selectedScorecardProjectId"
        :templateId="selectedScorecardTemplateId"
        @saved="handleScorecardSaved"
        @cancelled="handleScorecardCancelled"
        @deleted="handleScorecardDeleted"
        @openScorecard="handleOpenScorecardDetail"
      />

      <!-- Tab 8: Quality Scorecard Detail (WP5) -->
      <ScorecardDetail
        v-else-if="activeTab === 'scorecard-detail' && selectedScorecardId"
        :scorecardId="selectedScorecardId"
        @back="activeTab = 'scorecards'"
        @edit="handleEditScorecard"
        @compare="handleNavigateToCompare"
        @navigateScorecard="handleOpenScorecardDetail"
      />

      <!-- Tab 9: Quality Scorecard Comparison Matrix (WP5) -->
      <ScorecardCompare
        v-else-if="activeTab === 'scorecard-compare' && compareProjectId && compareTemplateId"
        :projectId="compareProjectId"
        :templateId="compareTemplateId"
        @back="handleBackFromCompare"
        @openDetail="handleOpenScorecardDetail"
      />

      <!-- Tab 10: Quality Scorecard Trends & Compliance (WP6) -->
      <ScorecardTrends
        v-else-if="activeTab === 'scorecard-trends'"
        :initialProjectId="selectedScorecardProjectId"
        :initialRole="selectedScorecardTemplateId"
        :initialTab="trendsInitialTab"
        @openDetail="handleOpenScorecardDetail"
      />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 dark:border-[#1b3654] bg-white/70 dark:bg-[#0b1a2e]/70 py-6">
      <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p class="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-center space-x-1.5">
          <span class="inline-block w-2 h-2 rounded-full bg-[#005386]"></span>
          <span>DELMIA Quintiq — QTech Operations & Delivery Tracker</span>
        </p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Dassault Systèmes 3DS Design System • Vue 3 Database-Backed Delivery Tracker
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Navbar from './components/Navbar.vue';
import KPIDashboard from './components/KPIDashboard.vue';
import WeeklyUpdateForm from './components/WeeklyUpdateForm.vue';
import ProjectSetup from './components/ProjectSetup.vue';
import SettingsPage from './components/SettingsPage.vue';
import DatabaseSettingsPage from './components/DatabaseSettingsPage.vue';
import ScorecardRegister from './components/scorecards/ScorecardRegister.vue';
import ScorecardForm from './components/scorecards/ScorecardForm.vue';
import ScorecardDetail from './components/scorecards/ScorecardDetail.vue';
import ScorecardCompare from './components/scorecards/ScorecardCompare.vue';
import ScorecardTrends from './components/scorecards/ScorecardTrends.vue';
import { Scorecard, ScorecardTemplateId } from './types';

type TabType =
  | 'dashboard'
  | 'entry'
  | 'projects'
  | 'settings'
  | 'database'
  | 'scorecards'
  | 'scorecard-form'
  | 'scorecard-detail'
  | 'scorecard-compare'
  | 'scorecard-trends';

const activeTab = ref<TabType>('dashboard');
const previousTab = ref<TabType>('dashboard');
const selectedProjectIdForEntry = ref<string | null>(null);
const selectedProjectIdForSummary = ref<string | null>(null);
const previousSummaryProjectId = ref<string | null>(null);
const editingUpdateId = ref<string | null>(null);

// Scorecards view state
const selectedScorecardId = ref<string | undefined>(undefined);
const selectedScorecardProjectId = ref<string | undefined>(undefined);
const selectedScorecardTemplateId = ref<ScorecardTemplateId | undefined>(undefined);
const compareProjectId = ref<string | undefined>(undefined);
const compareTemplateId = ref<ScorecardTemplateId | undefined>(undefined);
const trendsInitialTab = ref<'project' | 'portfolio'>('portfolio');

const navbarActiveTab = computed(() => {
  if (['scorecards', 'scorecard-form', 'scorecard-detail', 'scorecard-compare', 'scorecard-trends'].includes(activeTab.value)) {
    return 'scorecards';
  }
  return activeTab.value;
});

const handleTabChange = (tab: string) => {
  const target = (tab === 'scorecard-form' ? 'scorecards' : tab) as TabType;
  if (activeTab.value !== 'entry' && activeTab.value !== 'scorecard-form' && target !== activeTab.value) {
    previousTab.value = activeTab.value;
    previousSummaryProjectId.value = selectedProjectIdForSummary.value;
  }
  activeTab.value = target;
  if (target !== 'entry') {
    selectedProjectIdForEntry.value = null;
    editingUpdateId.value = null;
  }
  if (!['scorecards', 'scorecard-form', 'scorecard-detail', 'scorecard-compare', 'scorecard-trends'].includes(target)) {
    selectedScorecardId.value = undefined;
    selectedScorecardProjectId.value = undefined;
    selectedScorecardTemplateId.value = undefined;
    compareProjectId.value = undefined;
    compareTemplateId.value = undefined;
  }
  if (target === 'projects') {
    selectedProjectIdForSummary.value = null;
    previousSummaryProjectId.value = null;
  }
};

const handleNavigateToTrends = (subTab?: string) => {
  trendsInitialTab.value = subTab === 'project' ? 'project' : 'portfolio';
  activeTab.value = 'scorecard-trends';
};

const handleOpenScorecardDetail = (id: string) => {
  selectedScorecardId.value = id;
  activeTab.value = 'scorecard-detail';
};

const handleEditScorecard = (id: string) => {
  selectedScorecardId.value = id;
  activeTab.value = 'scorecard-form';
};

const handleNavigateToCompare = (projectId: string, templateId: ScorecardTemplateId) => {
  compareProjectId.value = projectId;
  compareTemplateId.value = templateId;
  activeTab.value = 'scorecard-compare';
};

const handleBackFromCompare = () => {
  if (selectedScorecardId.value) {
    activeTab.value = 'scorecard-detail';
  } else {
    activeTab.value = 'scorecards';
  }
};

const handleNavigateToScorecard = (projectId?: string, templateId?: ScorecardTemplateId) => {
  previousTab.value = activeTab.value;
  selectedScorecardId.value = undefined;
  selectedScorecardProjectId.value = projectId;
  selectedScorecardTemplateId.value = templateId;
  activeTab.value = 'scorecard-form';
};

const handleScorecardSaved = (sc: Scorecard) => {
  selectedScorecardId.value = sc.id;
  activeTab.value = 'scorecard-detail';
};

const handleScorecardCancelled = () => {
  activeTab.value = 'scorecards';
  selectedScorecardId.value = undefined;
  selectedScorecardProjectId.value = undefined;
  selectedScorecardTemplateId.value = undefined;
};

const handleScorecardDeleted = () => {
  activeTab.value = 'scorecards';
  selectedScorecardId.value = undefined;
  selectedScorecardProjectId.value = undefined;
  selectedScorecardTemplateId.value = undefined;
};

const handleProjectSelected = (projectId: string) => {
  selectedProjectIdForSummary.value = projectId;
  previousSummaryProjectId.value = projectId;
};

const handleCloseProjectSummary = () => {
  selectedProjectIdForSummary.value = null;
  previousSummaryProjectId.value = null;
};

const handleNavigateToProjectSummary = (projectId: string) => {
  if (activeTab.value !== 'entry') {
    previousTab.value = activeTab.value;
  }
  selectedProjectIdForSummary.value = projectId;
  previousSummaryProjectId.value = projectId;
  activeTab.value = 'projects';
};

const handleQuickLog = () => {
  if (activeTab.value !== 'entry') {
    previousTab.value = activeTab.value;
    if (activeTab.value === 'projects') {
      previousSummaryProjectId.value = selectedProjectIdForSummary.value;
    } else {
      previousSummaryProjectId.value = null;
    }
  }
  selectedProjectIdForEntry.value = null;
  editingUpdateId.value = null;
  activeTab.value = 'entry';
};

const handleNavigateToEntry = (projectId?: string | null, updateId?: string | null) => {
  if (activeTab.value !== 'entry') {
    previousTab.value = activeTab.value;
    if (activeTab.value === 'projects') {
      previousSummaryProjectId.value = selectedProjectIdForSummary.value || projectId || null;
    } else {
      previousSummaryProjectId.value = null;
    }
  }
  selectedProjectIdForEntry.value = projectId || null;
  editingUpdateId.value = updateId || null;
  activeTab.value = 'entry';
};

const handleFormCancel = () => {
  const targetTab = previousTab.value || 'dashboard';
  const targetSummaryId = previousSummaryProjectId.value;

  selectedProjectIdForEntry.value = null;
  editingUpdateId.value = null;

  activeTab.value = targetTab;
  if (targetTab === 'projects') {
    selectedProjectIdForSummary.value = targetSummaryId || null;
  }
};

const handleFormSuccess = () => {
  const targetTab = previousTab.value || 'dashboard';
  const targetSummaryId = previousSummaryProjectId.value || (previousTab.value === 'projects' ? selectedProjectIdForEntry.value : null);

  selectedProjectIdForEntry.value = null;
  editingUpdateId.value = null;

  activeTab.value = targetTab;
  if (targetTab === 'projects') {
    selectedProjectIdForSummary.value = targetSummaryId || null;
  }
};
</script>
