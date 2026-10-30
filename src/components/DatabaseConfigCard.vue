<template>
  <div class="bg-white dark:bg-[#0f2238] rounded-xl border border-slate-200 dark:border-[#1b3654] shadow-xs overflow-hidden transition-all">
    <!-- Header Banner -->
    <div class="p-4 sm:p-5 border-b border-slate-100 dark:border-[#1b3654] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-sky-50/30 dark:from-[#0a1829] dark:via-[#0f2238] dark:to-[#0e2a42]">
      <div class="flex items-start sm:items-center space-x-3">
        <div class="p-2.5 bg-[#e8f2f8] dark:bg-[#0e2a42] text-[#005386] dark:text-[#7dd3fc] rounded-xl border border-[#bad8eb] dark:border-[#1d4d73] shadow-xs shrink-0">
          <Database class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Database Connection & Storage Engine
            </h2>
            <!-- Active Status Badge -->
            <span
              v-if="dbStatus?.connected"
              class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active: {{ getEngineDisplayName(dbStatus.engine) }}</span>
            </span>
            <span
              v-else
              class="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Disconnected</span>
            </span>
          </div>
          <p class="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Configure primary database storage, create table structures, and bidirectionally migrate data between flat JSON files and the database.
          </p>
        </div>
      </div>

      <!-- Quick Action: Refresh Status -->
      <div class="flex items-center space-x-2 shrink-0">
        <button
          @click="handleRefreshStatus"
          :disabled="isRefreshing"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#071524] hover:bg-slate-50 dark:hover:bg-[#0b1d30] text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
          title="Refresh database and file storage status"
        >
          <RefreshCw :class="['w-3.5 h-3.5', isRefreshing ? 'animate-spin text-[#005386]' : '']" />
          <span>{{ isRefreshing ? 'Checking...' : 'Refresh Status' }}</span>
        </button>
      </div>
    </div>

    <div class="p-4 sm:p-5 space-y-6">
      <!-- 1. Database Engine Switcher (SQLite, PostgreSQL, SQL Server) -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Select Storage Engine
        </label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- 1. SQLite Option -->
          <div
            id="engine-select-sqlite"
            @click="selectEngine('sqlite')"
            :class="[
              'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3',
              formConfig.engine === 'sqlite'
                ? 'bg-[#e8f2f8]/70 dark:bg-[#0e2a42]/60 border-[#005386] dark:border-[#0082c3] ring-1 ring-[#005386] dark:ring-[#0082c3]'
                : 'bg-slate-50/60 dark:bg-[#071524]/60 border-slate-200 dark:border-[#1b3654] hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <div
              :class="[
                'p-2 rounded-lg shrink-0',
                formConfig.engine === 'sqlite'
                  ? 'bg-[#005386] text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              ]"
            >
              <HardDrive class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  SQLite
                </span>
                <span
                  v-if="formConfig.engine === 'sqlite'"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#005386] text-white shrink-0 ml-1"
                >
                  Selected
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Embedded local ACID SQL engine in <code class="text-[#005386] dark:text-[#7dd3fc]">data/quintiq.db</code>. Zero configuration.
              </p>
            </div>
          </div>

          <!-- 2. PostgreSQL Option -->
          <div
            id="engine-select-postgres"
            @click="selectEngine('postgres')"
            :class="[
              'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3',
              formConfig.engine === 'postgres'
                ? 'bg-[#e8f2f8]/70 dark:bg-[#0e2a42]/60 border-[#005386] dark:border-[#0082c3] ring-1 ring-[#005386] dark:ring-[#0082c3]'
                : 'bg-slate-50/60 dark:bg-[#071524]/60 border-slate-200 dark:border-[#1b3654] hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <div
              :class="[
                'p-2 rounded-lg shrink-0',
                formConfig.engine === 'postgres'
                  ? 'bg-[#005386] text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              ]"
            >
              <Server class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  PostgreSQL
                </span>
                <span
                  v-if="formConfig.engine === 'postgres'"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#005386] text-white shrink-0 ml-1"
                >
                  Selected
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Cloud SQL, Amazon RDS, Aurora, or self-hosted PostgreSQL cluster with connection pooling.
              </p>
            </div>
          </div>

          <!-- 3. Microsoft SQL Server Option -->
          <div
            id="engine-select-mssql"
            @click="selectEngine('mssql')"
            :class="[
              'p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3',
              formConfig.engine === 'mssql'
                ? 'bg-[#e8f2f8]/70 dark:bg-[#0e2a42]/60 border-[#005386] dark:border-[#0082c3] ring-1 ring-[#005386] dark:ring-[#0082c3]'
                : 'bg-slate-50/60 dark:bg-[#071524]/60 border-slate-200 dark:border-[#1b3654] hover:border-slate-300 dark:hover:border-slate-600'
            ]"
          >
            <div
              :class="[
                'p-2 rounded-lg shrink-0',
                formConfig.engine === 'mssql'
                  ? 'bg-[#005386] text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              ]"
            >
              <Layers class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  SQL Server
                </span>
                <span
                  v-if="formConfig.engine === 'mssql'"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#005386] text-white shrink-0 ml-1"
                >
                  Selected
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Microsoft SQL Server (MSSQL, Azure SQL, Express, Enterprise) with T-SQL support.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Connection Parameters Forms -->
      <!-- A. SQLite Configuration -->
      <div v-if="formConfig.engine === 'sqlite'" class="p-4 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <HardDrive class="w-4 h-4 text-[#005386] dark:text-[#7dd3fc]" />
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              SQLite File Settings
            </h3>
          </div>
          <span class="text-[11px] text-slate-500 font-mono">WAL Journaling Active</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Database File Path
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              id="sqlite-file-path-input"
              type="text"
              v-model="formConfig.filePath"
              placeholder="data/quintiq.db"
              class="flex-1 p-2.5 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
            <div class="flex items-center space-x-1.5 text-xs">
              <button
                type="button"
                @click="formConfig.filePath = 'data/quintiq.db'"
                class="px-2.5 py-1.5 bg-slate-200 dark:bg-[#0f2238] hover:bg-slate-300 dark:hover:bg-[#1b3654] text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"
              >
                Default Path
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- B. PostgreSQL Configuration -->
      <div v-else-if="formConfig.engine === 'postgres'" class="p-4 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-[#1b3654] pb-2.5">
          <div class="flex items-center space-x-2">
            <Server class="w-4 h-4 text-[#005386] dark:text-[#7dd3fc]" />
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              PostgreSQL Configuration
            </h3>
          </div>

          <div class="flex items-center space-x-1 bg-white dark:bg-[#0f2238] p-1 rounded-lg border border-slate-200 dark:border-[#1b3654]">
            <button
              type="button"
              @click="formConfig.useConnectionString = false"
              :class="[
                'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer',
                !formConfig.useConnectionString
                  ? 'bg-[#005386] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              Parameters
            </button>
            <button
              type="button"
              @click="formConfig.useConnectionString = true"
              :class="[
                'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer',
                formConfig.useConnectionString
                  ? 'bg-[#005386] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              Connection URI
            </button>
          </div>
        </div>

        <!-- Parameters Mode -->
        <div v-if="!formConfig.useConnectionString" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Host / Server Address
            </label>
            <input
              id="pg-host-input"
              type="text"
              v-model="formConfig.host"
              placeholder="localhost"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Port
            </label>
            <input
              id="pg-port-input"
              type="number"
              v-model.number="formConfig.port"
              placeholder="5432"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Database Name
            </label>
            <input
              id="pg-database-input"
              type="text"
              v-model="formConfig.database"
              placeholder="quintiq_delivery_tracker"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Username
            </label>
            <input
              id="pg-user-input"
              type="text"
              v-model="formConfig.username"
              placeholder="postgres"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div class="relative">
              <input
                id="pg-password-input"
                :type="showPassword ? 'text' : 'password'"
                v-model="formConfig.password"
                placeholder="••••••••"
                class="w-full p-2 pr-9 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Toggle password visibility"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              SSL Mode
            </label>
            <select
              id="pg-ssl-select"
              v-model="formConfig.sslMode"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            >
              <option value="disable">Disable SSL (Local / Private)</option>
              <option value="require">Require SSL (Cloud / Production)</option>
              <option value="prefer">Prefer SSL</option>
            </select>
          </div>
        </div>

        <div v-else class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            PostgreSQL Connection String / URI
          </label>
          <input
            id="pg-connection-uri-input"
            type="text"
            v-model="formConfig.connectionString"
            placeholder="postgresql://username:password@hostname:5432/databasename?sslmode=disable"
            class="w-full p-2.5 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
          />
        </div>
      </div>

      <!-- C. Microsoft SQL Server Configuration -->
      <div v-else class="p-4 rounded-xl bg-slate-50 dark:bg-[#071524] border border-slate-200/80 dark:border-[#1b3654] space-y-4">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-[#1b3654] pb-2.5">
          <div class="flex items-center space-x-2">
            <Layers class="w-4 h-4 text-[#005386] dark:text-[#7dd3fc]" />
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Microsoft SQL Server (T-SQL) Configuration
            </h3>
          </div>

          <div class="flex items-center space-x-1 bg-white dark:bg-[#0f2238] p-1 rounded-lg border border-slate-200 dark:border-[#1b3654]">
            <button
              type="button"
              @click="formConfig.useConnectionString = false"
              :class="[
                'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer',
                !formConfig.useConnectionString
                  ? 'bg-[#005386] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              Parameters
            </button>
            <button
              type="button"
              @click="formConfig.useConnectionString = true"
              :class="[
                'px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer',
                formConfig.useConnectionString
                  ? 'bg-[#005386] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              Connection String
            </button>
          </div>
        </div>

        <div v-if="!formConfig.useConnectionString" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              SQL Server Host / IP Address
            </label>
            <input
              id="mssql-host-input"
              type="text"
              v-model="formConfig.host"
              placeholder="localhost or 192.168.1.10"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Port
            </label>
            <input
              id="mssql-port-input"
              type="number"
              v-model.number="formConfig.port"
              placeholder="1433"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Database / Catalog
            </label>
            <input
              id="mssql-database-input"
              type="text"
              v-model="formConfig.database"
              placeholder="quintiq_delivery_tracker"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Login Username
            </label>
            <input
              id="mssql-user-input"
              type="text"
              v-model="formConfig.username"
              placeholder="sa"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div class="relative">
              <input
                id="mssql-password-input"
                :type="showPassword ? 'text' : 'password'"
                v-model="formConfig.password"
                placeholder="••••••••"
                class="w-full p-2 pr-9 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Toggle password visibility"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Encryption (SSL)
            </label>
            <select
              id="mssql-ssl-select"
              v-model="formConfig.sslMode"
              class="w-full p-2 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
            >
              <option value="disable">False (Local SQL Server / Express)</option>
              <option value="require">True (Azure SQL / Encrypted)</option>
            </select>
          </div>

          <div class="sm:col-span-2 lg:col-span-3 flex items-center space-x-2 pt-1">
            <input
              id="mssql-trust-cert-check"
              type="checkbox"
              v-model="formConfig.trustServerCertificate"
              class="w-4 h-4 text-[#005386] rounded border-slate-300 focus:ring-[#005386]"
            />
            <label for="mssql-trust-cert-check" class="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Trust Server Certificate (Recommended for self-signed certificates in corporate LANs)
            </label>
          </div>
        </div>

        <div v-else class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            SQL Server Connection String
          </label>
          <input
            id="mssql-connection-string-input"
            type="text"
            v-model="formConfig.connectionString"
            placeholder="Server=localhost,1433;Database=quintiq_db;User Id=sa;Password=your_password;Encrypt=false;TrustServerCertificate=true;"
            class="w-full p-2.5 bg-white dark:bg-[#0f2238] border border-slate-200 dark:border-[#1b3654] rounded-lg text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#005386]"
          />
        </div>
      </div>

      <!-- 3. Primary Actions Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#1b3654]">
        <div class="flex flex-wrap items-center gap-2">
          <!-- 1. TEST CONNECTION BUTTON -->
          <button
            id="test-database-connection-btn"
            type="button"
            @click="handleTestConnection"
            :disabled="isTestingConnection"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw v-if="isTestingConnection" class="w-3.5 h-3.5 animate-spin" />
            <Zap v-else class="w-3.5 h-3.5 text-amber-300" />
            <span>{{ isTestingConnection ? 'Testing Connection...' : 'Test Connection' }}</span>
          </button>

          <!-- 2. CREATE TABLE STRUCTURES BUTTON -->
          <button
            id="create-tables-btn"
            type="button"
            @click="handleCreateTables"
            :disabled="isCreatingTables"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            title="Create and verify projects, weekly_updates, and settings tables"
          >
            <RefreshCw v-if="isCreatingTables" class="w-3.5 h-3.5 animate-spin" />
            <Table2 v-else class="w-3.5 h-3.5 text-indigo-200" />
            <span>{{ isCreatingTables ? 'Creating Tables...' : 'Create Table Structures' }}</span>
          </button>

          <!-- 3. SAVE & APPLY BUTTON -->
          <button
            id="save-database-config-btn"
            type="button"
            @click="handleSaveConfig"
            :disabled="isSavingDbConfig"
            class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] disabled:opacity-50 text-white font-semibold text-xs shadow-xs border border-[#005386] transition-colors cursor-pointer"
          >
            <Check class="w-3.5 h-3.5 text-[#7dd3fc]" />
            <span>{{ isSavingDbConfig ? 'Applying & Connecting...' : 'Save & Apply Connection' }}</span>
          </button>
        </div>

        <div class="flex items-center space-x-2">
          <!-- VIEW DDL SCRIPT BUTTON -->
          <button
            id="view-ddl-btn"
            type="button"
            @click="handleOpenDdlModal"
            class="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#071524] dark:hover:bg-[#0b1d30] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-[#1b3654] transition-colors cursor-pointer"
            title="Inspect generated DDL SQL scripts for current dialect"
          >
            <Code class="w-3.5 h-3.5 text-slate-500" />
            <span>View DDL Scripts</span>
          </button>
        </div>
      </div>

      <!-- 4. Table Structure Creation Result Banner -->
      <div
        v-if="structureResult"
        :class="[
          'p-3.5 rounded-xl border space-y-2 text-xs animate-fade-in',
          structureResult.success
            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <CheckCircle2 v-if="structureResult.success" class="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <AlertCircle v-else class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span class="font-bold text-sm">
              {{ structureResult.success ? 'Table Structures Initialized & Verified' : 'Failed to Create Table Structures' }}
            </span>
          </div>
          <button
            @click="structureResult = null"
            class="text-xs p-1 opacity-70 hover:opacity-100 rounded-md cursor-pointer"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <p class="text-[11px] opacity-90">
          {{ structureResult.message }}
        </p>

        <div v-if="structureResult.logs?.length" class="space-y-1 bg-white/70 dark:bg-[#071524]/80 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 font-mono text-[11px]">
          <div v-for="(log, idx) in structureResult.logs" :key="idx" class="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
            <Check class="w-3 h-3 text-emerald-500 shrink-0" />
            <span>{{ log }}</span>
          </div>
        </div>
      </div>

      <!-- 5. Test Connection Diagnostic Result Banner -->
      <div
        v-if="testResult"
        :class="[
          'p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fade-in',
          testResult.success
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
        ]"
      >
        <div class="flex items-start space-x-2.5">
          <CheckCircle2 v-if="testResult.success" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <AlertCircle v-else class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold">
                {{ testResult.success ? 'Connection Test Successful' : 'Connection Test Failed' }}
              </span>
              <span
                class="px-2 py-0.2 rounded-md font-mono text-[10px] font-bold"
                :class="testResult.success ? 'bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-rose-200/80 dark:bg-rose-900 text-rose-800 dark:text-rose-200'"
              >
                {{ testResult.latencyMs }} ms
              </span>
            </div>
            <p class="text-[11px] mt-0.5 opacity-90">
              {{ testResult.message }}
            </p>
            <div v-if="testResult.version" class="text-[10px] font-mono mt-1 opacity-80">
              Engine Version: {{ testResult.version }}
            </div>
            <div v-if="testResult.tablesFound?.length" class="text-[10px] font-mono mt-0.5 opacity-80">
              Verified Tables: {{ testResult.tablesFound.join(', ') }}
            </div>
          </div>
        </div>

        <button
          @click="testResult = null"
          class="text-xs p-1 opacity-70 hover:opacity-100 rounded-md cursor-pointer self-end sm:self-center"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- 6. BIDIRECTIONAL DATA MIGRATION SECTION (Flat JSON Files ⇄ Active Database) -->
      <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/20 dark:from-[#0a1829] dark:via-[#0f2238] dark:to-[#112744] border border-slate-200/90 dark:border-[#1b3654] space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-[#1b3654] pb-3">
          <div class="flex items-center space-x-2.5">
            <div class="p-2 bg-[#005386]/10 dark:bg-[#7dd3fc]/10 text-[#005386] dark:text-[#7dd3fc] rounded-lg border border-[#005386]/20">
              <ArrowRightLeft class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                Bidirectional Data Migration (Flat JSON Files ⇄ Active Database)
              </h3>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Synchronize records between server filesystem JSON files and your SQL database in either direction.
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2 text-xs">
            <label class="flex items-center space-x-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
              <input
                id="create-safety-backup-checkbox"
                type="checkbox"
                v-model="createSafetyBackup"
                class="w-3.5 h-3.5 text-[#005386] rounded border-slate-300 focus:ring-[#005386]"
              />
              <span class="text-[11px]">Safety backup before file export</span>
            </label>
          </div>
        </div>

        <!-- 3-Column Comparison & Action Hub -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
          <!-- A. Source 1: Flat JSON Files Store -->
          <div class="p-3.5 bg-white dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] flex flex-col justify-between space-y-2">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <FolderArchive class="w-3 h-3 text-[#005386]" />
                  <span>Flat JSON Files Store</span>
                </span>
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#0f2238] text-slate-600 dark:text-slate-300">
                  data/projects/
                </span>
              </div>

              <div class="mt-2.5 flex items-baseline space-x-3">
                <div>
                  <span class="text-lg font-black text-slate-900 dark:text-white">
                    {{ fileStats?.projectsCount ?? 0 }}
                  </span>
                  <span class="text-[11px] text-slate-500 ml-1">Projects</span>
                </div>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <div>
                  <span class="text-lg font-black text-[#005386] dark:text-[#7dd3fc]">
                    {{ fileStats?.updatesCount ?? 0 }}
                  </span>
                  <span class="text-[11px] text-slate-500 ml-1">Updates</span>
                </div>
              </div>
            </div>

            <p class="text-[10px] text-slate-400 font-mono truncate" title="data/settings.json">
              Settings: {{ fileStats?.hasSettings ? 'data/settings.json present' : 'Missing' }}
            </p>
          </div>

          <!-- B. Migration Actions (Center) -->
          <div class="p-3 bg-white/60 dark:bg-[#071524]/60 rounded-xl border border-slate-200/80 dark:border-[#1b3654] flex flex-col justify-center space-y-2">
            <!-- 1. IMPORT: Files -> Database -->
            <button
              id="import-files-to-db-btn"
              type="button"
              @click="handleImportFilesToDb"
              :disabled="isMigratingDb"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#005386] hover:bg-[#004169] disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer group"
              title="Read JSON files from disk and upsert them into the database"
            >
              <div class="flex items-center space-x-2">
                <RefreshCw v-if="isImportingFiles" class="w-3.5 h-3.5 animate-spin" />
                <Upload v-else class="w-3.5 h-3.5 text-[#7dd3fc] group-hover:scale-110 transition-transform" />
                <div class="text-left">
                  <div class="leading-tight">Import: Files → Database</div>
                  <div class="text-[9px] font-normal text-slate-200">Load disk JSONs into DB</div>
                </div>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-[#7dd3fc]" />
            </button>

            <!-- 2. EXPORT: Database -> Files -->
            <button
              id="export-db-to-files-btn"
              type="button"
              @click="handleExportDbToFiles"
              :disabled="isMigratingDb"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer group"
              title="Dump database records into data/projects/ and data/settings.json files"
            >
              <div class="flex items-center space-x-2">
                <RefreshCw v-if="isExportingFiles" class="w-3.5 h-3.5 animate-spin" />
                <Download v-else class="w-3.5 h-3.5 text-emerald-200 group-hover:scale-110 transition-transform" />
                <div class="text-left">
                  <div class="leading-tight">Export: Database → Files</div>
                  <div class="text-[9px] font-normal text-emerald-100">Dump DB records to disk</div>
                </div>
              </div>
              <ArrowLeft class="w-3.5 h-3.5 text-emerald-200" />
            </button>
          </div>

          <!-- C. Source 2: Active Database Store -->
          <div class="p-3.5 bg-white dark:bg-[#071524] rounded-xl border border-slate-200 dark:border-[#1b3654] flex flex-col justify-between space-y-2">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <Database class="w-3 h-3 text-[#0082c3]" />
                  <span>Active Database Store</span>
                </span>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#005386]/10 text-[#005386] dark:text-[#7dd3fc]">
                  {{ getEngineDisplayName(formConfig.engine) }}
                </span>
              </div>

              <div class="mt-2.5 flex items-baseline space-x-3">
                <div>
                  <span class="text-lg font-black text-slate-900 dark:text-white">
                    {{ dbStatus?.projectsCount ?? projects.length }}
                  </span>
                  <span class="text-[11px] text-slate-500 ml-1">Projects</span>
                </div>
                <span class="text-slate-300 dark:text-slate-600">|</span>
                <div>
                  <span class="text-lg font-black text-[#0082c3] dark:text-[#38bdf8]">
                    {{ dbStatus?.updatesCount ?? weeklyUpdates.length }}
                  </span>
                  <span class="text-[11px] text-slate-500 ml-1">Updates</span>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-1.5 text-[10px]">
              <span class="w-1.5 h-1.5 rounded-full" :class="dbStatus?.connected ? 'bg-emerald-500' : 'bg-rose-500'"></span>
              <span class="text-slate-500 dark:text-slate-400 truncate">
                Status: {{ dbStatus?.connected ? 'Connected' : 'Offline' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Migration Execution Result Banner -->
        <div
          v-if="migrationResult"
          :class="[
            'p-3.5 rounded-xl border space-y-2 text-xs animate-fade-in',
            migrationResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <CheckCircle2 v-if="migrationResult.success" class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <AlertCircle v-else class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span class="font-bold text-xs sm:text-sm">
                {{ migrationResult.direction === 'files_to_db' ? 'Import (Files → Database) Completed' : 'Export (Database → Files) Completed' }}
              </span>
              <span class="px-2 py-0.2 rounded-md font-mono text-[10px] font-bold bg-white/80 dark:bg-[#071524]">
                {{ migrationResult.durationMs }} ms
              </span>
            </div>

            <button
              @click="migrationResult = null"
              class="text-xs p-1 opacity-70 hover:opacity-100 rounded-md cursor-pointer"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <p class="text-[11px] opacity-90">
            {{ migrationResult.message }}
          </p>

          <!-- Toggleable Detailed Logs -->
          <div class="pt-1">
            <button
              @click="showMigrationLogs = !showMigrationLogs"
              class="flex items-center space-x-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
            >
              <span>{{ showMigrationLogs ? 'Hide detailed logs' : `Show detailed execution logs (${migrationResult.logs?.length || 0})` }}</span>
              <ChevronUp v-if="showMigrationLogs" class="w-3.5 h-3.5" />
              <ChevronDown v-else class="w-3.5 h-3.5" />
            </button>

            <div
              v-if="showMigrationLogs && migrationResult.logs?.length"
              class="mt-2 space-y-1 bg-white/70 dark:bg-[#071524]/80 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 font-mono text-[11px] max-h-48 overflow-y-auto"
            >
              <div v-for="(log, idx) in migrationResult.logs" :key="idx" class="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Check class="w-3 h-3 text-emerald-500 shrink-0" />
                <span>{{ log }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 7. Active Database Live Metrics & Information Cards (3-Column) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <!-- Metric 1: Active Engine & Location -->
        <div class="p-3 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200/80 dark:border-[#1b3654]">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Storage Target
          </span>
          <div class="flex items-center space-x-1.5 mt-1">
            <span
              :class="[
                'w-2 h-2 rounded-full',
                dbStatus?.connected ? 'bg-emerald-500' : 'bg-rose-500'
              ]"
            ></span>
            <span class="font-bold text-xs text-slate-900 dark:text-white truncate">
              {{ getEngineDisplayName(dbStatus?.engine || 'sqlite') }}
            </span>
          </div>
          <p class="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5" :title="dbStatus?.target">
            {{ dbStatus?.target || 'data/quintiq.db' }}
          </p>
        </div>

        <!-- Metric 2: Record Statistics -->
        <div class="p-3 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200/80 dark:border-[#1b3654]">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Stored Database Records
          </span>
          <div class="flex items-center space-x-3 mt-1 text-xs">
            <div>
              <span class="text-base font-black text-slate-900 dark:text-white">
                {{ dbStatus?.projectsCount ?? projects.length }}
              </span>
              <span class="text-[11px] text-slate-500 ml-1">Projects</span>
            </div>
            <span class="text-slate-300 dark:text-slate-600">|</span>
            <div>
              <span class="text-base font-black text-[#0082c3] dark:text-[#38bdf8]">
                {{ dbStatus?.updatesCount ?? weeklyUpdates.length }}
              </span>
              <span class="text-[11px] text-slate-500 ml-1">Updates</span>
            </div>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">
            Tables: <code class="font-mono text-[#005386] dark:text-[#7dd3fc]">projects</code>, <code class="font-mono text-[#005386] dark:text-[#7dd3fc]">weekly_updates</code>, <code class="font-mono text-[#005386] dark:text-[#7dd3fc]">settings</code>
          </p>
        </div>

        <!-- Metric 3: Health & Diagnostics -->
        <div class="p-3 bg-slate-50 dark:bg-[#071524] rounded-xl border border-slate-200/80 dark:border-[#1b3654]">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Health & Response Latency
          </span>
          <div class="flex items-center space-x-2 mt-1">
            <Activity class="w-4 h-4 text-emerald-500" />
            <span class="font-bold text-xs text-slate-900 dark:text-white">
              {{ dbStatus?.connected ? 'Online & Operational' : 'Degraded' }}
            </span>
            <span v-if="dbStatus?.latencyMs !== undefined" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#0f2238] text-slate-700 dark:text-slate-300 font-semibold">
              {{ dbStatus.latencyMs }}ms
            </span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5 truncate" :title="dbStatus?.version">
            {{ dbStatus?.version || 'Relational SQL Store' }}
          </p>
        </div>
      </div>
    </div>

    <!-- DDL SQL Scripts Modal -->
    <div
      v-if="isDdlModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div class="bg-white dark:bg-[#0f2238] rounded-2xl border border-slate-200 dark:border-[#1b3654] shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-[#1b3654] flex items-center justify-between bg-slate-50/50 dark:bg-[#071524]">
          <div class="flex items-center space-x-2">
            <Code class="w-5 h-5 text-[#005386] dark:text-[#7dd3fc]" />
            <div>
              <h3 class="font-bold text-sm text-slate-900 dark:text-white">
                DDL Table Structure Scripts — {{ getEngineDisplayName(formConfig.engine) }}
              </h3>
              <p class="text-[11px] text-slate-500">
                SQL schema definitions executed by the "Create Table Structures" command.
              </p>
            </div>
          </div>
          <button
            @click="isDdlModalOpen = false"
            class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#1b3654] text-slate-500 cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Table Script Tabs -->
        <div class="flex items-center space-x-1 p-2 border-b border-slate-200 dark:border-[#1b3654] bg-slate-100/60 dark:bg-[#0b1a2e]">
          <button
            v-for="t in ['projects', 'weekly_updates', 'settings']"
            :key="t"
            @click="activeDdlTab = t"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer',
              activeDdlTab === t
                ? 'bg-white dark:bg-[#0f2238] text-[#005386] dark:text-[#7dd3fc] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ t }}
          </button>
        </div>

        <!-- SQL Code Viewer -->
        <div class="p-4 overflow-y-auto flex-1 font-mono text-xs bg-[#0b1a2e] text-slate-200 select-all">
          <pre class="whitespace-pre-wrap">{{ ddlScripts[activeDdlTab] || 'Loading DDL...' }}</pre>
        </div>

        <div class="p-3 border-t border-slate-200 dark:border-[#1b3654] flex items-center justify-between bg-slate-50 dark:bg-[#071524]">
          <span class="text-[11px] text-slate-500">
            Table: <strong>{{ activeDdlTab }}</strong> ({{ formConfig.engine.toUpperCase() }})
          </span>
          <div class="flex items-center space-x-2">
            <button
              @click="copyDdlScript"
              class="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0f2238] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-[#1b3654] hover:bg-slate-50 dark:hover:bg-[#1b3654] transition-colors cursor-pointer"
            >
              {{ copiedDdl ? 'Copied to Clipboard!' : 'Copy SQL Script' }}
            </button>
            <button
              @click="isDdlModalOpen = false"
              class="px-3 py-1.5 rounded-lg bg-[#005386] text-white text-xs font-semibold hover:bg-[#004169] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useProjects } from '../composables/useProjects';
import { DatabaseConfig, DatabaseEngine, DatabaseTestResult, TableStructureResult, MigrationResult } from '../types';
import {
  Database,
  HardDrive,
  Server,
  Layers,
  Zap,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  Table2,
  Code,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  Upload,
  Download,
  FolderArchive,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'notify', msg: string): void;
}>();

const {
  projects,
  weeklyUpdates,
  dbConfig,
  dbStatus,
  fileStats,
  isTestingConnection,
  isSavingDbConfig,
  isMigratingDb,
  isCreatingTables,
  fetchDbConfig,
  fetchDbStatus,
  fetchFileStats,
  testDatabaseConnection,
  saveDatabaseConfiguration,
  migrateFilesToDb,
  migrateDbToFiles,
  createDbTableStructures,
  fetchDdlScripts,
} = useProjects();

const showPassword = ref(false);
const isRefreshing = ref(false);
const isImportingFiles = ref(false);
const isExportingFiles = ref(false);
const createSafetyBackup = ref(true);

const testResult = ref<DatabaseTestResult | null>(null);
const structureResult = ref<TableStructureResult | null>(null);
const migrationResult = ref<MigrationResult | null>(null);
const showMigrationLogs = ref(false);

const isDdlModalOpen = ref(false);
const activeDdlTab = ref('projects');
const ddlScripts = ref<Record<string, string>>({});
const copiedDdl = ref(false);

const formConfig = reactive<DatabaseConfig>({
  engine: 'sqlite',
  filePath: 'data/quintiq.db',
  host: 'localhost',
  port: 5432,
  database: 'quintiq_delivery_tracker',
  username: 'postgres',
  password: '',
  sslMode: 'disable',
  trustServerCertificate: true,
  connectionString: '',
  useConnectionString: false,
});

const getEngineDisplayName = (engine: DatabaseEngine) => {
  switch (engine) {
    case 'sqlite':
      return 'SQLite';
    case 'postgres':
      return 'PostgreSQL';
    case 'mssql':
      return 'SQL Server';
    default:
      return (engine as string).toUpperCase();
  }
};

const selectEngine = (engine: DatabaseEngine) => {
  formConfig.engine = engine;
  if (engine === 'sqlite') {
    formConfig.filePath = formConfig.filePath || 'data/quintiq.db';
  } else if (engine === 'postgres') {
    formConfig.port = 5432;
    formConfig.username = formConfig.username || 'postgres';
    formConfig.database = formConfig.database || 'quintiq_delivery_tracker';
  } else if (engine === 'mssql') {
    formConfig.port = 1433;
    formConfig.username = formConfig.username || 'sa';
    formConfig.database = formConfig.database || 'quintiq_delivery_tracker';
  }
  testResult.value = null;
  structureResult.value = null;
};

// Sync local form state with global dbConfig
watch(
  dbConfig,
  (newVal) => {
    if (newVal) {
      formConfig.engine = newVal.engine || 'sqlite';
      formConfig.filePath = newVal.filePath || 'data/quintiq.db';
      formConfig.host = newVal.host || 'localhost';
      formConfig.port = newVal.port || (newVal.engine === 'mssql' ? 1433 : 5432);
      formConfig.database = newVal.database || 'quintiq_delivery_tracker';
      formConfig.username = newVal.username || (newVal.engine === 'mssql' ? 'sa' : 'postgres');
      formConfig.password = newVal.password || '';
      formConfig.sslMode = newVal.sslMode || 'disable';
      formConfig.trustServerCertificate = newVal.trustServerCertificate ?? true;
      formConfig.connectionString = newVal.connectionString || '';
      formConfig.useConnectionString = !!newVal.useConnectionString;
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  await fetchDbConfig();
  await fetchDbStatus();
  await fetchFileStats();
});

const handleRefreshStatus = async () => {
  isRefreshing.value = true;
  await Promise.all([fetchDbStatus(), fetchFileStats()]);
  isRefreshing.value = false;
  emit('notify', 'Database & file storage status refreshed');
};

const handleTestConnection = async () => {
  testResult.value = null;
  const result = await testDatabaseConnection({ ...formConfig });
  testResult.value = result;
  if (result.success) {
    emit('notify', `Connection test passed (${result.latencyMs}ms)`);
  } else {
    emit('notify', `Connection test failed: ${result.error || result.message}`);
  }
};

const handleCreateTables = async () => {
  structureResult.value = null;
  const result = await createDbTableStructures({ ...formConfig });
  structureResult.value = result;
  if (result.success) {
    emit('notify', `Table structures initialized on ${getEngineDisplayName(formConfig.engine)}`);
  } else {
    emit('notify', `Failed to initialize tables: ${result.error || result.message}`);
  }
};

const handleSaveConfig = async () => {
  const ok = await saveDatabaseConfiguration({ ...formConfig });
  if (ok) {
    await Promise.all([fetchDbStatus(), fetchFileStats()]);
    emit('notify', `Connected and switched to ${getEngineDisplayName(formConfig.engine)} database`);
  } else {
    emit('notify', 'Failed to connect with the specified configuration');
  }
};

// Import: Flat JSON Files -> Active Database
const handleImportFilesToDb = async () => {
  isImportingFiles.value = true;
  migrationResult.value = null;
  const result = await migrateFilesToDb();
  isImportingFiles.value = false;
  migrationResult.value = result;
  if (result.success) {
    await Promise.all([fetchDbStatus(), fetchFileStats()]);
    emit('notify', `Imported ${result.projectsCount} projects and ${result.updatesCount} updates to DB`);
  } else {
    emit('notify', `Import failed: ${result.message}`);
  }
};

// Export: Active Database -> Flat JSON Files
const handleExportDbToFiles = async () => {
  isExportingFiles.value = true;
  migrationResult.value = null;
  const result = await migrateDbToFiles(createSafetyBackup.value);
  isExportingFiles.value = false;
  migrationResult.value = result;
  if (result.success) {
    await Promise.all([fetchDbStatus(), fetchFileStats()]);
    emit('notify', `Exported ${result.projectsCount} projects and ${result.updatesCount} updates to JSON files`);
  } else {
    emit('notify', `Export failed: ${result.message}`);
  }
};

const handleOpenDdlModal = async () => {
  ddlScripts.value = await fetchDdlScripts(formConfig.engine);
  isDdlModalOpen.value = true;
};

const copyDdlScript = () => {
  const script = ddlScripts.value[activeDdlTab.value];
  if (script) {
    navigator.clipboard.writeText(script).catch(() => {});
    copiedDdl.value = true;
    setTimeout(() => {
      copiedDdl.value = false;
    }, 2000);
  }
};
</script>
