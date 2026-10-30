import { ref, watch } from 'vue';
import {
  Project,
  WeeklyUpdate,
  GeoRegion,
  DatabaseConfig,
  DatabaseEngine,
  DatabaseStatus,
  DatabaseTestResult,
  TableStructureResult,
  MigrationResult,
  FileStorageStats,
} from '../types';
import { INITIAL_PROJECTS, INITIAL_UPDATES, DEFAULT_PRODUCTS, DEFAULT_GEOS, DEFAULT_PROJECT_TYPES } from '../data/initialData';
import { setScorecardSummaries } from './useScorecards';

const PROJECTS_STORAGE_KEY = 'remix_projects_v2';
const UPDATES_STORAGE_KEY = 'remix_weekly_updates_v2';
const PRODUCTS_STORAGE_KEY = 'remix_products_v2';
const GEOS_STORAGE_KEY = 'remix_geos_v2';
const PROJECT_TYPES_STORAGE_KEY = 'remix_project_types_v2';

// Shared global state for Vue
const projects = ref<Project[]>([]);
const weeklyUpdates = ref<WeeklyUpdate[]>([]);
const products = ref<string[]>([]);
const geos = ref<GeoRegion[]>([]);
const projectTypes = ref<string[]>([]);
const selectedProjectId = ref<string | null>(null);

const dbConfig = ref<DatabaseConfig>({
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

const dbStatus = ref<DatabaseStatus | null>(null);
const fileStats = ref<FileStorageStats | null>(null);
const isTestingConnection = ref(false);
const isSavingDbConfig = ref(false);
const isMigratingDb = ref(false);
const isCreatingTables = ref(false);

let initialized = false;

// Fetch database configuration
async function fetchDbConfig() {
  try {
    const res = await fetch('/api/database/config');
    if (res.ok) {
      const data = await res.json();
      if (data && data.engine) {
        dbConfig.value = { ...dbConfig.value, ...data };
      }
    }
  } catch (err) {
    console.warn('[Database] Could not fetch db config:', err);
  }
}

// Fetch database status
async function fetchDbStatus() {
  try {
    const res = await fetch('/api/database/status');
    if (res.ok) {
      const data = await res.json();
      dbStatus.value = data;
    }
  } catch (err) {
    console.warn('[Database] Could not fetch db status:', err);
  }
}

// Fetch flat JSON file storage stats
async function fetchFileStats() {
  try {
    const res = await fetch('/api/database/files-stats');
    if (res.ok) {
      const data = await res.json();
      fileStats.value = data;
    }
  } catch (err) {
    console.warn('[Database] Could not fetch file stats:', err);
  }
}

// Fetch all data from server database
async function fetchServerData() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.projects)) {
        projects.value = data.projects.map((p: any) => ({
          ...p,
          projectType: p.projectType || 'Manual',
        }));
      }
      if (Array.isArray(data.weeklyUpdates)) {
        weeklyUpdates.value = data.weeklyUpdates;
      }
      if (Array.isArray(data.products) && data.products.length > 0) {
        products.value = data.products;
      }
      if (Array.isArray(data.geos) && data.geos.length > 0) {
        geos.value = data.geos;
      }
      if (Array.isArray(data.projectTypes) && data.projectTypes.length > 0) {
        projectTypes.value = data.projectTypes;
      }
      if (Array.isArray(data.scorecardSummaries)) {
        setScorecardSummaries(data.scorecardSummaries);
      }
    }
    await fetchDbStatus();
    await fetchDbConfig();
    await fetchFileStats();
  } catch (err) {
    console.warn('[Storage] Could not fetch server data, falling back to local cache:', err);
  }
}

// Background sync helper
function syncSettingsToServer() {
  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: products.value,
      geos: geos.value,
      projectTypes: projectTypes.value,
    }),
  }).catch((err) => console.warn('[Storage] Failed to sync settings to server:', err));
}

function initStore() {
  if (initialized) return;
  initialized = true;

  // 1. Initial quick load from localStorage for instant render
  try {
    const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    projects.value = savedProjects
      ? JSON.parse(savedProjects).map((p: any) => ({
          ...p,
          projectType: p.projectType || 'Manual',
        }))
      : INITIAL_PROJECTS;
  } catch {
    projects.value = INITIAL_PROJECTS;
  }

  try {
    const savedUpdates = localStorage.getItem(UPDATES_STORAGE_KEY);
    weeklyUpdates.value = savedUpdates ? JSON.parse(savedUpdates) : INITIAL_UPDATES;
  } catch {
    weeklyUpdates.value = INITIAL_UPDATES;
  }

  try {
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    products.value = savedProducts ? JSON.parse(savedProducts) : DEFAULT_PRODUCTS;
  } catch {
    products.value = DEFAULT_PRODUCTS;
  }

  try {
    const savedGeos = localStorage.getItem(GEOS_STORAGE_KEY);
    geos.value = savedGeos ? JSON.parse(savedGeos) : DEFAULT_GEOS;
  } catch {
    geos.value = DEFAULT_GEOS;
  }

  try {
    const savedTypes = localStorage.getItem(PROJECT_TYPES_STORAGE_KEY);
    projectTypes.value = savedTypes ? JSON.parse(savedTypes) : [...DEFAULT_PROJECT_TYPES];
  } catch {
    projectTypes.value = [...DEFAULT_PROJECT_TYPES];
  }

  // 2. Fetch authoritative data from the server-side data/ folder
  fetchServerData();

  // 3. Mirror to localStorage as cache
  watch(
    projects,
    (val) => {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(val));
    },
    { deep: true }
  );

  watch(
    weeklyUpdates,
    (val) => {
      localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(val));
    },
    { deep: true }
  );

  watch(
    products,
    (val) => {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(val));
    },
    { deep: true }
  );

  watch(
    geos,
    (val) => {
      localStorage.setItem(GEOS_STORAGE_KEY, JSON.stringify(val));
    },
    { deep: true }
  );

  watch(
    projectTypes,
    (val) => {
      localStorage.setItem(PROJECT_TYPES_STORAGE_KEY, JSON.stringify(val));
    },
    { deep: true }
  );
}

export function useProjects() {
  initStore();

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
      updatedAt: now,
    };

    projects.value.unshift(newProject);

    if (newProject.product && !products.value.includes(newProject.product)) {
      products.value.push(newProject.product);
      products.value.sort();
      syncSettingsToServer();
    }

    // Persist to server data/projects/<id>/project.json
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    }).catch((err) => console.error('[Storage] Error adding project to server:', err));
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    const idx = projects.value.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const updated = {
        ...projects.value[idx],
        ...projectData,
        updatedAt: new Date().toISOString(),
      };
      projects.value[idx] = updated;

      if (updated.product && !products.value.includes(updated.product)) {
        products.value.push(updated.product);
        products.value.sort();
        syncSettingsToServer();
      }

      // Persist to server data/projects/<id>/project.json
      fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((err) => console.error('[Storage] Error updating project on server:', err));
    }
  };

  const deleteProject = (id: string) => {
    projects.value = projects.value.filter((p) => p.id !== id);
    weeklyUpdates.value = weeklyUpdates.value.filter((u) => u.projectId !== id);
    if (selectedProjectId.value === id) {
      selectedProjectId.value = null;
    }

    // Delete project directory from server data/projects/<id>/
    fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    }).catch((err) => console.error('[Storage] Error deleting project on server:', err));
  };

  const addWeeklyUpdate = (updateData: Omit<WeeklyUpdate, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString();
    const newUpdate: WeeklyUpdate = {
      ...updateData,
      id: `upd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: now,
    };
    weeklyUpdates.value.unshift(newUpdate);

    // Persist to server data/projects/<projectId>/updates/<updateId>.json
    fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUpdate),
    }).catch((err) => console.error('[Storage] Error adding update to server:', err));
  };

  const updateWeeklyUpdate = (id: string, updateData: Partial<WeeklyUpdate>) => {
    const idx = weeklyUpdates.value.findIndex((u) => u.id === id);
    if (idx !== -1) {
      const updated = {
        ...weeklyUpdates.value[idx],
        ...updateData,
      };
      weeklyUpdates.value[idx] = updated;

      // Persist to server data/projects/<projectId>/updates/<updateId>.json
      fetch(`/api/updates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch((err) => console.error('[Storage] Error updating update on server:', err));
    }
  };

  const deleteWeeklyUpdate = (id: string) => {
    weeklyUpdates.value = weeklyUpdates.value.filter((u) => u.id !== id);

    // Delete update file from server
    fetch(`/api/updates/${id}`, {
      method: 'DELETE',
    }).catch((err) => console.error('[Storage] Error deleting update on server:', err));
  };

  const getLatestUpdateForProject = (projectId: string): WeeklyUpdate | undefined => {
    const projectUpdates = weeklyUpdates.value
      .filter((u) => u.projectId === projectId)
      .sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime());
    return projectUpdates[0];
  };

  const getProjectUpdates = (projectId: string): WeeklyUpdate[] => {
    return weeklyUpdates.value
      .filter((u) => u.projectId === projectId)
      .sort((a, b) => new Date(b.updateDate).getTime() - new Date(a.updateDate).getTime());
  };

  const addProduct = (productName: string) => {
    const trimmed = productName.trim();
    if (!trimmed) return;
    if (!products.value.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      products.value.push(trimmed);
      products.value.sort();
      syncSettingsToServer();
    }
  };

  const updateProduct = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const idx = products.value.indexOf(oldName);
    if (idx !== -1) {
      products.value[idx] = trimmed;
      products.value.sort();
    }
    // Update all projects referencing oldName
    projects.value.forEach((p) => {
      if (p.product === oldName) {
        p.product = trimmed;
        fetch(`/api/projects/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).catch(() => {});
      }
    });
    syncSettingsToServer();
  };

  const deleteProduct = (productName: string) => {
    products.value = products.value.filter((p) => p !== productName);
    syncSettingsToServer();
  };

  const addGeo = (geoName: string) => {
    const trimmed = geoName.trim() as GeoRegion;
    if (!trimmed) return;
    if (!geos.value.some((g) => g.toLowerCase() === trimmed.toLowerCase())) {
      geos.value.push(trimmed);
      syncSettingsToServer();
    }
  };

  const updateGeo = (oldGeo: string, newGeo: string) => {
    const trimmed = newGeo.trim() as GeoRegion;
    if (!trimmed) return;
    const idx = geos.value.indexOf(oldGeo as GeoRegion);
    if (idx !== -1) {
      geos.value[idx] = trimmed;
    }
    projects.value.forEach((p) => {
      if (p.geo === oldGeo) {
        p.geo = trimmed;
        fetch(`/api/projects/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).catch(() => {});
      }
    });
    syncSettingsToServer();
  };

  const deleteGeo = (geoName: string) => {
    geos.value = geos.value.filter((g) => g !== geoName);
    syncSettingsToServer();
  };

  const addProjectType = (typeName: string) => {
    const trimmed = typeName.trim();
    if (!trimmed) return;
    if (!projectTypes.value.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      projectTypes.value.push(trimmed);
      syncSettingsToServer();
    }
  };

  const updateProjectType = (oldType: string, newType: string) => {
    const trimmed = newType.trim();
    if (!trimmed) return;
    const idx = projectTypes.value.indexOf(oldType);
    if (idx !== -1) {
      projectTypes.value[idx] = trimmed;
    }
    // Update all projects referencing oldType automatically!
    projects.value.forEach((p) => {
      if ((p.projectType || 'Manual') === oldType) {
        p.projectType = trimmed;
        fetch(`/api/projects/${p.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).catch(() => {});
      }
    });
    syncSettingsToServer();
  };

  const deleteProjectType = (typeName: string) => {
    projectTypes.value = projectTypes.value.filter((t) => t !== typeName);
    syncSettingsToServer();
  };

  const resetMasterData = () => {
    products.value = [...DEFAULT_PRODUCTS];
    geos.value = [...DEFAULT_GEOS];
    projectTypes.value = [...DEFAULT_PROJECT_TYPES];
    fetch('/api/settings/reset', { method: 'POST' }).catch(() => {});
  };

  const testDatabaseConnection = async (testConfig: DatabaseConfig): Promise<DatabaseTestResult> => {
    isTestingConnection.value = true;
    try {
      const res = await fetch('/api/database/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        engine: testConfig.engine,
        latencyMs: 0,
        error: err.message,
        message: `Network error testing connection: ${err.message}`,
      };
    } finally {
      isTestingConnection.value = false;
    }
  };

  const saveDatabaseConfiguration = async (configToSave: DatabaseConfig): Promise<boolean> => {
    isSavingDbConfig.value = true;
    try {
      const res = await fetch('/api/database/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave),
      });
      const data = await res.json();
      if (data.success) {
        dbConfig.value = { ...configToSave };
        await fetchServerData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[Database] Failed to save config:', err);
      return false;
    } finally {
      isSavingDbConfig.value = false;
    }
  };

  const migrateFilesToDb = async (): Promise<MigrationResult> => {
    isMigratingDb.value = true;
    try {
      const res = await fetch('/api/database/migrate/files-to-db', {
        method: 'POST',
      });
      const data: MigrationResult = await res.json();
      if (data.success) {
        await fetchServerData();
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        direction: 'files_to_db',
        projectsCount: 0,
        updatesCount: 0,
        settingsCount: 0,
        engine: dbConfig.value.engine,
        message: `Import from files to database failed: ${err.message}`,
        logs: [err.message],
        durationMs: 0,
        error: err.message,
      };
    } finally {
      isMigratingDb.value = false;
    }
  };

  const migrateDbToFiles = async (createBackup = true): Promise<MigrationResult> => {
    isMigratingDb.value = true;
    try {
      const res = await fetch('/api/database/migrate/db-to-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createBackup }),
      });
      const data: MigrationResult = await res.json();
      if (data.success) {
        await fetchFileStats();
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        direction: 'db_to_files',
        projectsCount: 0,
        updatesCount: 0,
        settingsCount: 0,
        engine: dbConfig.value.engine,
        message: `Export from database to files failed: ${err.message}`,
        logs: [err.message],
        durationMs: 0,
        error: err.message,
      };
    } finally {
      isMigratingDb.value = false;
    }
  };

  const migrateToActiveDatabase = async (): Promise<{ success: boolean; message: string; projectsMigrated: number; updatesMigrated: number }> => {
    const res = await migrateFilesToDb();
    return {
      success: res.success,
      message: res.message,
      projectsMigrated: res.projectsCount,
      updatesMigrated: res.updatesCount,
    };
  };

  const createDbTableStructures = async (targetConfig?: DatabaseConfig): Promise<TableStructureResult> => {
    isCreatingTables.value = true;
    try {
      const res = await fetch('/api/database/schema/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetConfig || dbConfig.value),
      });
      const data: TableStructureResult = await res.json();
      if (data.success) {
        await fetchDbStatus();
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        engine: targetConfig?.engine || dbConfig.value.engine,
        tablesCreated: [],
        logs: [err.message],
        error: err.message,
        message: `Failed to create tables: ${err.message}`,
      };
    } finally {
      isCreatingTables.value = false;
    }
  };

  const fetchDdlScripts = async (engine: DatabaseEngine): Promise<Record<string, string>> => {
    try {
      const res = await fetch(`/api/database/schema/ddl?engine=${engine}`);
      if (res.ok) {
        const data = await res.json();
        return data.ddl || {};
      }
      return {};
    } catch {
      return {};
    }
  };

  return {
    projects,
    weeklyUpdates,
    products,
    geos,
    projectTypes,
    selectedProjectId,
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
    migrateToActiveDatabase,
    migrateFilesToDb,
    migrateDbToFiles,
    createDbTableStructures,
    fetchDdlScripts,
    refreshServerData: fetchServerData,
    addProject,
    updateProject,
    deleteProject,
    addWeeklyUpdate,
    updateWeeklyUpdate,
    deleteWeeklyUpdate,
    getLatestUpdateForProject,
    getProjectUpdates,
    addProduct,
    updateProduct,
    deleteProduct,
    addGeo,
    updateGeo,
    deleteGeo,
    addProjectType,
    updateProjectType,
    deleteProjectType,
    resetMasterData,
    resetProductsAndGeos: resetMasterData,
  };
}
