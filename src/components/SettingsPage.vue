<template>
  <div class="space-y-4 pb-8">
    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      class="fixed bottom-8 right-6 z-50 bg-[#07192b] text-white px-3 py-2 rounded-xl shadow-xl border border-[#0082c3]/40 flex items-center space-x-2 text-xs font-semibold animate-fade-in"
    >
      <Check class="w-3.5 h-3.5 text-emerald-400" />
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#0f2238] p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs">
      <div>
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-lg bg-[#e8f2f8] dark:bg-[#0e2a42] border border-[#bad8eb] dark:border-[#1d4d73] flex items-center justify-center text-[#005386] dark:text-[#7dd3fc]">
            <Settings class="w-4 h-4" />
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Master Data Management
            </h1>
            <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              Manage global master data for <strong>Product Suites</strong>, <strong>GEO Regions</strong>, and <strong>Project Types</strong> used across projects, filters, and executive analytics.
            </p>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          id="reset-settings-defaults-btn"
          @click="handleRestoreDefaults"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#0b1d30] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-[#1b3654] transition-colors shrink-0 cursor-pointer"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Restore Default Master Data</span>
        </button>
      </div>
    </div>

    <!-- Settings Sub Navigation Bar -->
    <div class="flex items-center space-x-2 border-b border-slate-200 dark:border-[#1b3654] pb-2">
      <button
        type="button"
        id="tab-master-data-btn"
        @click="settingsTab = 'master'"
        :class="[
          'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2',
          settingsTab === 'master'
            ? 'bg-[#005386] text-white shadow-xs'
            : 'bg-white dark:bg-[#0f2238] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#163352] border border-slate-200 dark:border-[#1b3654]'
        ]"
      >
        <Layers class="w-4 h-4" />
        <span>Master Data (Products, GEOs, Types)</span>
      </button>

      <button
        type="button"
        id="tab-scoring-settings-btn"
        @click="settingsTab = 'scoring'"
        :class="[
          'px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center space-x-2',
          settingsTab === 'scoring'
            ? 'bg-[#005386] text-white shadow-xs'
            : 'bg-white dark:bg-[#0f2238] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#163352] border border-slate-200 dark:border-[#1b3654]'
        ]"
      >
        <Gauge class="w-4 h-4" />
        <span>Scoring & Quality Scorecards</span>
      </button>
    </div>

    <!-- SCORING TAB VIEW -->
    <ScoringSettingsSection
      v-if="settingsTab === 'scoring'"
      ref="scoringSectionRef"
      @toast="showToast"
    />

    <!-- MASTER DATA TAB VIEW -->
    <template v-else>
      <!-- MASTER DATA CONFIGURATION SECTION (3 COLUMNS) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- 1. PRODUCTS MASTER DATA CARD -->
      <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-3">
          <div class="flex items-center space-x-2">
            <div class="p-1.5 bg-[#e8f2f8] dark:bg-[#0e2a42] rounded-lg text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]">
              <Tag class="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                Product Suites
              </h2>
              <p class="text-[11px] text-slate-500">
                {{ products.length }} configured product line(s)
              </p>
            </div>
          </div>

          <span class="px-2 py-0.5 bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73] font-mono text-xs font-bold rounded-md">
            {{ products.length }} Active
          </span>
        </div>

        <!-- Add Product Form -->
        <form @submit.prevent="handleAddProduct" class="flex gap-2">
          <input
            id="add-product-input"
            type="text"
            placeholder="Enter new Product name (e.g. CP, DP, Quintiq)..."
            v-model="newProductName"
            class="flex-1 p-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          />
          <button
            id="submit-add-product-btn"
            type="submit"
            :disabled="!newProductName.trim()"
            class="px-3.5 py-2.5 bg-[#005386] hover:bg-[#004169] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs border border-[#005386] transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <Plus class="w-4 h-4 text-[#7dd3fc]" />
            <span class="hidden sm:inline">Add</span>
          </button>
        </form>

        <!-- Product List -->
        <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          <div v-if="products.length === 0" class="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
            No products configured. Add a product above or restore defaults.
          </div>
          <div
            v-else
            v-for="prod in products"
            :key="prod"
            class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] hover:border-[#0082c3]/60 dark:hover:border-[#0082c3]/60 transition-all group"
          >
            <div v-if="editingProduct === prod" class="flex items-center space-x-2 flex-1 mr-2">
              <input
                type="text"
                v-model="editProductVal"
                @keyup.enter="handleSaveEditProduct(prod)"
                @keyup.esc="editingProduct = null"
                autoFocus
                class="flex-1 p-1.5 bg-white dark:bg-[#0f2238] border border-[#005386] rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
              />
              <button
                @click="handleSaveEditProduct(prod)"
                class="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer"
                title="Save change"
              >
                <Check class="w-3.5 h-3.5" />
              </button>
              <button
                @click="editingProduct = null"
                class="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                title="Cancel edit"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <template v-else>
              <div class="flex items-center space-x-2.5 truncate mr-2">
                <span class="w-2 h-2 rounded-full bg-[#005386] shrink-0"></span>
                <span class="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                  {{ prod }}
                </span>
              </div>

              <div class="flex items-center space-x-2 shrink-0">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    productProjectCounts[prod] > 0
                      ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]'
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                  ]"
                >
                  {{ productProjectCounts[prod] || 0 }} proj
                </span>

                <div class="flex items-center space-x-0.5 opacity-80 group-hover:opacity-100">
                  <button
                    @click="
                      editingProduct = prod;
                      editProductVal = prod;
                    "
                    class="p-1 text-slate-400 hover:text-[#005386] dark:hover:text-[#38bdf8] rounded-md hover:bg-white dark:hover:bg-[#0f2238] transition-colors cursor-pointer"
                    title="Edit product name"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="deletingProductTarget = prod"
                    class="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-white dark:hover:bg-[#0f2238] transition-colors cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 2. GEO REGIONS MASTER DATA CARD -->
      <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-3">
          <div class="flex items-center space-x-2">
            <div class="p-1.5 bg-[#e8f2f8] dark:bg-[#0e2a42] rounded-lg text-[#0082c3] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]">
              <Globe class="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                GEO Regions
              </h2>
              <p class="text-[11px] text-slate-500">
                {{ geos.length }} configured geographic region(s)
              </p>
            </div>
          </div>

          <span class="px-2 py-0.5 bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73] font-mono text-xs font-bold rounded-md">
            {{ geos.length }} Active
          </span>
        </div>

        <!-- Add GEO Form -->
        <form @submit.prevent="handleAddGeo" class="flex gap-2">
          <input
            id="add-geo-input"
            type="text"
            placeholder="Enter new GEO Region code (e.g. NORAM, DACH)..."
            v-model="newGeoName"
            class="flex-1 p-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          />
          <button
            id="submit-add-geo-btn"
            type="submit"
            :disabled="!newGeoName.trim()"
            class="px-3.5 py-2.5 bg-[#005386] hover:bg-[#004169] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs border border-[#005386] transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <Plus class="w-4 h-4 text-[#7dd3fc]" />
            <span class="hidden sm:inline">Add</span>
          </button>
        </form>

        <!-- GEO List -->
        <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          <div v-if="geos.length === 0" class="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
            No GEO regions configured. Add a region above or restore defaults.
          </div>
          <div
            v-else
            v-for="geo in geos"
            :key="geo"
            class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] hover:border-[#0082c3]/60 dark:hover:border-[#0082c3]/60 transition-all group"
          >
            <div v-if="editingGeo === geo" class="flex items-center space-x-2 flex-1 mr-2">
              <input
                type="text"
                v-model="editGeoVal"
                @keyup.enter="handleSaveEditGeo(geo)"
                @keyup.esc="editingGeo = null"
                autoFocus
                class="flex-1 p-1.5 bg-white dark:bg-[#0f2238] border border-[#005386] rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
              />
              <button
                @click="handleSaveEditGeo(geo)"
                class="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer"
                title="Save change"
              >
                <Check class="w-3.5 h-3.5" />
              </button>
              <button
                @click="editingGeo = null"
                class="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                title="Cancel edit"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <template v-else>
              <div class="flex items-center space-x-2.5 truncate mr-2">
                <span class="w-2 h-2 rounded-full bg-[#0082c3] shrink-0"></span>
                <span class="font-bold font-mono text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                  {{ geo }}
                </span>
              </div>

              <div class="flex items-center space-x-2 shrink-0">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    geoProjectCounts[geo] > 0
                      ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]'
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                  ]"
                >
                  {{ geoProjectCounts[geo] || 0 }} proj
                </span>

                <div class="flex items-center space-x-0.5 opacity-80 group-hover:opacity-100">
                  <button
                    @click="
                      editingGeo = geo;
                      editGeoVal = geo;
                    "
                    class="p-1 text-slate-400 hover:text-[#005386] dark:hover:text-[#38bdf8] rounded-md hover:bg-white dark:hover:bg-[#0f2238] transition-colors cursor-pointer"
                    title="Edit GEO region"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="deletingGeoTarget = geo"
                    class="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-white dark:hover:bg-[#0f2238] transition-colors cursor-pointer"
                    title="Delete GEO region"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 3. PROJECT TYPES MASTER DATA CARD -->
      <div class="bg-white dark:bg-[#0f2238] p-4 rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-[#1b3654] pb-3">
          <div class="flex items-center space-x-2">
            <div class="p-1.5 bg-[#e8f2f8] dark:bg-[#0e2a42] rounded-lg text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]">
              <Layers class="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-900 dark:text-white">
                Project Types
              </h2>
              <p class="text-[11px] text-slate-500">
                {{ projectTypes.length }} configured delivery type(s)
              </p>
            </div>
          </div>

          <span class="px-2 py-0.5 bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73] font-mono text-xs font-bold rounded-md">
            {{ projectTypes.length }} Active
          </span>
        </div>

        <!-- Add Project Type Form -->
        <form @submit.prevent="handleAddProjectType" class="flex gap-2">
          <input
            id="add-project-type-input"
            type="text"
            placeholder="Enter new Project Type (e.g. Manual, Optimization, Automated)..."
            v-model="newProjectTypeName"
            class="flex-1 p-2.5 bg-slate-50 dark:bg-[#071524] border border-slate-200 dark:border-[#1b3654] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#005386] text-slate-900 dark:text-white font-medium"
          />
          <button
            id="submit-add-type-btn"
            type="submit"
            :disabled="!newProjectTypeName.trim()"
            class="px-3.5 py-2.5 bg-[#005386] hover:bg-[#004169] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs border border-[#005386] transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <Plus class="w-4 h-4 text-[#7dd3fc]" />
            <span class="hidden sm:inline">Add</span>
          </button>
        </form>

        <!-- Project Type List -->
        <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          <div v-if="projectTypes.length === 0" class="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
            No project types configured. Add a type above or restore defaults.
          </div>
          <div
            v-else
            v-for="type in projectTypes"
            :key="type"
            class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] hover:border-[#0082c3]/60 dark:hover:border-[#0082c3]/60 transition-all group"
          >
            <div v-if="editingProjectType === type" class="flex items-center space-x-2 flex-1 mr-2">
              <input
                type="text"
                v-model="editProjectTypeVal"
                @keyup.enter="handleSaveEditProjectType(type)"
                @keyup.esc="editingProjectType = null"
                autoFocus
                class="flex-1 p-1.5 bg-white dark:bg-[#0f2238] border border-[#005386] rounded-lg text-xs font-semibold text-slate-900 dark:text-white"
              />
              <button
                @click="handleSaveEditProjectType(type)"
                class="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer"
                title="Save change"
              >
                <Check class="w-3.5 h-3.5" />
              </button>
              <button
                @click="editingProjectType = null"
                class="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                title="Cancel edit"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <template v-else>
              <div class="flex items-center space-x-2.5 truncate mr-2">
                <ProjectTypeBadge :type="type" size="xs" />
                <span class="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                  {{ type }}
                </span>
              </div>

              <div class="flex items-center space-x-2 shrink-0">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    projectTypeCounts[type] > 0
                      ? 'bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] border border-[#bad8eb] dark:border-[#1d4d73]'
                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-500'
                  ]"
                >
                  {{ projectTypeCounts[type] || 0 }} proj
                </span>

                <div class="flex items-center space-x-0.5 opacity-80 group-hover:opacity-100">
                  <button
                    @click="
                      editingProjectType = type;
                      editProjectTypeVal = type;
                    "
                    class="p-1 text-slate-400 hover:text-[#005386] dark:hover:text-[#38bdf8] rounded-md hover:bg-white dark:hover:bg-[#0f2238] transition-colors cursor-pointer"
                    title="Edit project type"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="deletingProjectTypeTarget = type"
                    class="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-white dark:hover:bg-[#0f2238] transition-colors cursor-pointer"
                    title="Delete project type"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- SYSTEM OVERVIEW & IMPACT SUMMARY -->
    <div class="bg-white dark:bg-[#0f2238] p-5 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs space-y-4">
      <div class="flex items-center space-x-2 border-b border-slate-100 dark:border-[#1b3654] pb-3">
        <BarChart2 class="w-5 h-5 text-[#005386] dark:text-[#38bdf8]" />
        <h2 class="text-base font-bold text-slate-900 dark:text-white">
          Master Data Distribution Overview
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <!-- 1. Products Breakdown -->
        <div class="space-y-3">
          <h3 class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span class="flex items-center space-x-1.5">
              <Tag class="w-3.5 h-3.5 text-[#005386] dark:text-[#38bdf8]" />
              <span>Product Suites</span>
            </span>
            <span class="text-[11px] text-slate-400 font-normal">Based on {{ projects.length }} projects</span>
          </h3>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div v-for="prod in products" :key="prod" class="space-y-1">
              <div class="flex justify-between text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                <span>{{ prod }}</span>
                <span>{{ productProjectCounts[prod] || 0 }} ({{ getProductPct(prod) }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-[#071524] h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#1b3654]">
                <div
                  class="bg-[#005386] dark:bg-[#0082c3] h-full rounded-full transition-all duration-500"
                  :style="{ width: `${getProductPct(prod)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. GEO Breakdown -->
        <div class="space-y-3">
          <h3 class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span class="flex items-center space-x-1.5">
              <Globe class="w-3.5 h-3.5 text-[#0082c3] dark:text-[#38bdf8]" />
              <span>GEO Regions</span>
            </span>
            <span class="text-[11px] text-slate-400 font-normal">Based on {{ projects.length }} projects</span>
          </h3>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div v-for="geo in geos" :key="geo" class="space-y-1">
              <div class="flex justify-between text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                <span class="font-mono font-bold">{{ geo }}</span>
                <span>{{ geoProjectCounts[geo] || 0 }} ({{ getGeoPct(geo) }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-[#071524] h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#1b3654]">
                <div
                  class="bg-[#0082c3] dark:bg-[#38bdf8] h-full rounded-full transition-all duration-500"
                  :style="{ width: `${getGeoPct(geo)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Project Types Breakdown -->
        <div class="space-y-3">
          <h3 class="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span class="flex items-center space-x-1.5">
              <Layers class="w-3.5 h-3.5 text-[#005386] dark:text-[#7dd3fc]" />
              <span>Project Delivery Types</span>
            </span>
            <span class="text-[11px] text-slate-400 font-normal">Based on {{ projects.length }} projects</span>
          </h3>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div v-for="type in projectTypes" :key="type" class="space-y-1">
              <div class="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                <div class="flex items-center space-x-1.5">
                  <ProjectTypeBadge :type="type" size="xs" />
                  <span class="font-semibold">{{ type }}</span>
                </div>
                <span>{{ projectTypeCounts[type] || 0 }} ({{ getProjectTypePct(type) }}%)</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-[#071524] h-2 rounded-full overflow-hidden border border-slate-200/50 dark:border-[#1b3654]">
                <div
                  class="bg-[#005386] dark:bg-[#38bdf8] h-full rounded-full transition-all duration-500"
                  :style="{ width: `${getProjectTypePct(type)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 bg-[#e8f2f8] dark:bg-[#0e2a42]/50 border border-[#bad8eb] dark:border-[#1d4d73] rounded-xl flex items-start space-x-2.5 text-[#003b60] dark:text-[#7dd3fc] text-xs mt-4">
        <Info class="w-4 h-4 shrink-0 mt-0.5 text-[#0082c3]" />
        <span>
          <strong>Automatic Propagation:</strong> Renaming a Product, GEO region, or Project Type automatically updates all active projects registered to that name so your historical weekly status records remain 100% consistent across the Executive Dashboard, Weekly Log History, and Project Directory.
        </span>
      </div>
    </div>

    <!-- ADVANCED DATABASE STORAGE & MIGRATION ENTRY BANNER (AT THE BOTTOM OF MASTER DATA) -->
    <div class="bg-gradient-to-r from-slate-50 via-sky-50/30 to-indigo-50/30 dark:from-[#0a1829] dark:via-[#0f2238] dark:to-[#112744] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
      <div class="flex items-start sm:items-center space-x-3.5">
        <div class="p-3 bg-[#005386]/10 dark:bg-[#7dd3fc]/10 text-[#005386] dark:text-[#7dd3fc] rounded-xl border border-[#005386]/20 shrink-0">
          <Database class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center space-x-2 flex-wrap gap-y-1">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              Database Connection, Schemas & Data Migration
            </h3>
            <span
              v-if="dbStatus?.connected"
              class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active: {{ dbStatus.engine.toUpperCase() }}</span>
            </span>
            <span
              v-else
              class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Database Offline</span>
            </span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-2xl">
            Configure enterprise database connections (SQLite, PostgreSQL, Microsoft SQL Server), initialize and verify table structures, inspect DDL scripts, and bidirectionally migrate data between flat JSON files and the database.
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-3 shrink-0">
        <button
          id="open-database-config-btn"
          @click="$emit('navigateToDatabase')"
          class="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#005386] hover:bg-[#004169] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#005386]/25 border border-[#005386] transition-all cursor-pointer group"
        >
          <Database class="w-4 h-4 text-[#7dd3fc] group-hover:scale-110 transition-transform" />
          <span>Manage Database Configuration & Migration</span>
          <ArrowRight class="w-4 h-4 text-[#7dd3fc] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
    </template>

    <!-- Delete Product Confirmation Modal -->
    <ConfirmModal
      :isOpen="!!deletingProductTarget"
      title="Remove Product"
      :message="
        deletingProductTarget && (productProjectCounts[deletingProductTarget] || 0) > 0
          ? `Warning: ${productProjectCounts[deletingProductTarget]} active project(s) are currently assigned to '${deletingProductTarget}'. Removing this product will exclude it from future select menus. Proceed?`
          : `Are you sure you want to remove '${deletingProductTarget}' from the product list?`
      "
      confirmText="Remove Product"
      @confirm="handleConfirmDeleteProduct"
      @cancel="deletingProductTarget = null"
    />

    <!-- Delete GEO Confirmation Modal -->
    <ConfirmModal
      :isOpen="!!deletingGeoTarget"
      title="Remove GEO Region"
      :message="
        deletingGeoTarget && (geoProjectCounts[deletingGeoTarget] || 0) > 0
          ? `Warning: ${geoProjectCounts[deletingGeoTarget]} active project(s) are assigned to '${deletingGeoTarget}'. Removing this region will exclude it from drop-down menus. Proceed?`
          : `Are you sure you want to remove GEO region '${deletingGeoTarget}'?`
      "
      confirmText="Remove Region"
      @confirm="handleConfirmDeleteGeo"
      @cancel="deletingGeoTarget = null"
    />

    <!-- Delete Project Type Confirmation Modal -->
    <ConfirmModal
      :isOpen="!!deletingProjectTypeTarget"
      title="Remove Project Type"
      :message="
        deletingProjectTypeTarget && (projectTypeCounts[deletingProjectTypeTarget] || 0) > 0
          ? `Warning: ${projectTypeCounts[deletingProjectTypeTarget]} active project(s) are currently assigned to '${deletingProjectTypeTarget}'. Removing this project type will exclude it from future selection menus. Proceed?`
          : `Are you sure you want to remove Project Type '${deletingProjectTypeTarget}'?`
      "
      confirmText="Remove Project Type"
      @confirm="handleConfirmDeleteProjectType"
      @cancel="deletingProjectTypeTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProjects } from '../composables/useProjects';
import ConfirmModal from './ConfirmModal.vue';
import ProjectTypeBadge from './ProjectTypeBadge.vue';
import ScoringSettingsSection from './scorecards/ScoringSettingsSection.vue';
import {
  Settings,
  Tag,
  Globe,
  Layers,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Check,
  X,
  BarChart2,
  Info,
  Database,
  ArrowRight,
  Gauge,
} from 'lucide-vue-next';

const settingsTab = ref<'master' | 'scoring'>('master');
const scoringSectionRef = ref<any>(null);

defineEmits<{
  (e: 'navigateToDatabase'): void;
}>();

const {
  products,
  geos,
  projectTypes,
  projects,
  dbStatus,
  addProduct,
  updateProduct,
  deleteProduct,
  addGeo,
  updateGeo,
  deleteGeo,
  addProjectType,
  updateProjectType,
  deleteProjectType,
  resetMasterData
} = useProjects();

const newProductName = ref('');
const editingProduct = ref<string | null>(null);
const editProductVal = ref('');

const newGeoName = ref('');
const editingGeo = ref<string | null>(null);
const editGeoVal = ref('');

const newProjectTypeName = ref('');
const editingProjectType = ref<string | null>(null);
const editProjectTypeVal = ref('');

const deletingProductTarget = ref<string | null>(null);
const deletingGeoTarget = ref<string | null>(null);
const deletingProjectTypeTarget = ref<string | null>(null);

const toastMessage = ref<string | null>(null);

const showToast = (msg: string) => {
  toastMessage.value = msg;
  setTimeout(() => {
    toastMessage.value = null;
  }, 3000);
};

const productProjectCounts = computed(() => {
  const counts: Record<string, number> = {};
  products.value.forEach((p) => { counts[p] = 0; });
  projects.value.forEach((prj) => {
    const p = prj.product || 'Unassigned';
    counts[p] = (counts[p] || 0) + 1;
  });
  return counts;
});

const geoProjectCounts = computed(() => {
  const counts: Record<string, number> = {};
  geos.value.forEach((g) => { counts[g] = 0; });
  projects.value.forEach((prj) => {
    const g = prj.geo || 'Unassigned';
    counts[g] = (counts[g] || 0) + 1;
  });
  return counts;
});

const projectTypeCounts = computed(() => {
  const counts: Record<string, number> = {};
  projectTypes.value.forEach((t) => { counts[t] = 0; });
  projects.value.forEach((prj) => {
    const t = prj.projectType || 'Manual';
    counts[t] = (counts[t] || 0) + 1;
  });
  return counts;
});

const getProductPct = (prod: string) => {
  if (!projects.value.length) return 0;
  return Math.round(((productProjectCounts.value[prod] || 0) / projects.value.length) * 100);
};

const getGeoPct = (geo: string) => {
  if (!projects.value.length) return 0;
  return Math.round(((geoProjectCounts.value[geo] || 0) / projects.value.length) * 100);
};

const getProjectTypePct = (type: string) => {
  if (!projects.value.length) return 0;
  return Math.round(((projectTypeCounts.value[type] || 0) / projects.value.length) * 100);
};

// Handlers for Products
const handleAddProduct = () => {
  if (!newProductName.value.trim()) return;
  addProduct(newProductName.value.trim());
  showToast(`Added product "${newProductName.value.trim()}"`);
  newProductName.value = '';
};

const handleSaveEditProduct = (oldName: string) => {
  if (!editProductVal.value.trim() || editProductVal.value.trim() === oldName) {
    editingProduct.value = null;
    return;
  }
  updateProduct(oldName, editProductVal.value.trim());
  showToast(`Updated product "${oldName}" to "${editProductVal.value.trim()}"`);
  editingProduct.value = null;
};

const handleConfirmDeleteProduct = () => {
  if (deletingProductTarget.value) {
    deleteProduct(deletingProductTarget.value);
    showToast(`Removed product "${deletingProductTarget.value}"`);
    deletingProductTarget.value = null;
  }
};

// Handlers for GEO Regions
const handleAddGeo = () => {
  if (!newGeoName.value.trim()) return;
  addGeo(newGeoName.value.trim() as any);
  showToast(`Added GEO "${newGeoName.value.trim()}"`);
  newGeoName.value = '';
};

const handleSaveEditGeo = (oldGeo: string) => {
  if (!editGeoVal.value.trim() || editGeoVal.value.trim() === oldGeo) {
    editingGeo.value = null;
    return;
  }
  updateGeo(oldGeo as any, editGeoVal.value.trim() as any);
  showToast(`Updated GEO "${oldGeo}" to "${editGeoVal.value.trim()}"`);
  editingGeo.value = null;
};

const handleConfirmDeleteGeo = () => {
  if (deletingGeoTarget.value) {
    deleteGeo(deletingGeoTarget.value as any);
    showToast(`Removed GEO "${deletingGeoTarget.value}"`);
    deletingGeoTarget.value = null;
  }
};

// Handlers for Project Types
const handleAddProjectType = () => {
  if (!newProjectTypeName.value.trim()) return;
  addProjectType(newProjectTypeName.value.trim());
  showToast(`Added Project Type "${newProjectTypeName.value.trim()}"`);
  newProjectTypeName.value = '';
};

const handleSaveEditProjectType = (oldType: string) => {
  if (!editProjectTypeVal.value.trim() || editProjectTypeVal.value.trim() === oldType) {
    editingProjectType.value = null;
    return;
  }
  const newType = editProjectTypeVal.value.trim();
  const affected = projects.value.filter((p) => (p.projectType || 'Manual') === oldType).length;
  updateProjectType(oldType, newType);
  showToast(`Updated Project Type "${oldType}" to "${newType}" (${affected} project${affected === 1 ? '' : 's'} updated)`);
  editingProjectType.value = null;
};

const handleConfirmDeleteProjectType = () => {
  if (deletingProjectTypeTarget.value) {
    deleteProjectType(deletingProjectTypeTarget.value);
    showToast(`Removed Project Type "${deletingProjectTypeTarget.value}"`);
    deletingProjectTypeTarget.value = null;
  }
};

const handleRestoreDefaults = () => {
  resetMasterData();
  scoringSectionRef.value?.loadSettings();
  showToast('Restored default Products, GEO regions, Project Types, and Scoring settings');
};
</script>
