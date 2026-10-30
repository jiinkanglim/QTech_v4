import path from 'path';
import fs from 'fs';
import { promises as fsp } from 'fs';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';
import sql from 'mssql';
import {
  Project,
  WeeklyUpdate,
  DatabaseConfig,
  DatabaseEngine,
  DatabaseStatus,
  DatabaseTestResult,
  TableStructureResult,
  MigrationResult,
  FileStorageStats,
  Scorecard,
  ScorecardSummary,
  ScorecardTemplateId,
  ScoringSettings,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_UPDATES,
  DEFAULT_PRODUCTS,
  DEFAULT_GEOS,
  DEFAULT_PROJECT_TYPES,
} from '../data/initialData';
import { periodKey, comparePeriods } from '../scoring/period';
import { computeScorecard, DEFAULT_SCORING_SETTINGS } from '../scoring/engine';
import { SCORECARD_TEMPLATES } from '../scoring/templates';

const { Pool } = pg;

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_DIR = path.join(DATA_DIR, 'projects');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const DB_CONFIG_FILE = path.join(DATA_DIR, 'db-config.json');
const DEFAULT_SQLITE_PATH = path.join(DATA_DIR, 'quintiq.db');

export const DEFAULT_DB_CONFIG: DatabaseConfig = {
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
};

let currentConfig: DatabaseConfig = { ...DEFAULT_DB_CONFIG };
let sqliteInstance: DatabaseSync | null = null;
let pgPoolInstance: pg.Pool | null = null;
let mssqlPoolInstance: sql.ConnectionPool | null = null;
let isConnected = false;
let lastError: string | null = null;
let lastLatencyMs = 0;
let lastTestedAt: string = new Date().toISOString();

// Helper to ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Helper to write JSON files
async function writeJsonFile(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Load database configuration
export function loadSavedConfig(): DatabaseConfig {
  ensureDataDir();
  try {
    if (fs.existsSync(DB_CONFIG_FILE)) {
      const raw = fs.readFileSync(DB_CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      currentConfig = { ...DEFAULT_DB_CONFIG, ...parsed };
      return currentConfig;
    }
  } catch (err) {
    console.warn('[Database] Failed to read db-config.json, using defaults:', err);
  }
  currentConfig = { ...DEFAULT_DB_CONFIG };
  fs.writeFileSync(DB_CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf8');
  return currentConfig;
}

// -------------------------------------------------------------
// DDL Generator for each supported database dialect
// -------------------------------------------------------------
export function getDdlScripts(engine: DatabaseEngine): Record<string, string> {
  if (engine === 'sqlite') {
    return {
      projects: `CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  product TEXT NOT NULL,
  projectType TEXT NOT NULL,
  geo TEXT NOT NULL,
  owner TEXT NOT NULL,
  ownerEmail TEXT,
  targetDate TEXT,
  completionPercentage REAL DEFAULT 0,
  category TEXT,
  description TEXT,
  status TEXT NOT NULL,
  scorecard_config TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_projects_product ON projects(product);
CREATE INDEX IF NOT EXISTS idx_projects_geo ON projects(geo);`,
      weekly_updates: `CREATE TABLE IF NOT EXISTS weekly_updates (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  weekNumber INTEGER NOT NULL,
  year INTEGER NOT NULL,
  updateDate TEXT NOT NULL,
  author TEXT NOT NULL,
  overallRag TEXT NOT NULL,
  qualityRag TEXT NOT NULL,
  scheduleRag TEXT NOT NULL,
  scopeRag TEXT NOT NULL,
  highlights TEXT,
  lowlights TEXT,
  nextSteps TEXT,
  kpiProgress TEXT,
  completionPercentage REAL DEFAULT 0,
  createdAt TEXT
);
CREATE INDEX IF NOT EXISTS idx_updates_project ON weekly_updates(projectId);`,
      settings: `CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);`,
      scorecards: `CREATE TABLE IF NOT EXISTS scorecards (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  template_version INTEGER,
  period_year INTEGER NOT NULL,
  period_week INTEGER NOT NULL,
  period_label TEXT,
  assessment_date TEXT,
  assessor TEXT,
  status TEXT,
  overall_rag TEXT,
  overall_value REAL,
  normalized_pct REAL,
  payload TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE(project_id, template_id, period_year, period_week)
);
CREATE INDEX IF NOT EXISTS idx_scorecards_period ON scorecards(project_id, template_id, period_year, period_week);`,
    };
  }

  if (engine === 'postgres') {
    return {
      projects: `CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  product VARCHAR(100) NOT NULL,
  "projectType" VARCHAR(100) NOT NULL,
  geo VARCHAR(100) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  "ownerEmail" VARCHAR(255),
  "targetDate" VARCHAR(50),
  "completionPercentage" NUMERIC DEFAULT 0,
  category VARCHAR(255),
  description TEXT,
  status VARCHAR(50) NOT NULL,
  "scorecard_config" TEXT,
  "createdAt" VARCHAR(50) NOT NULL,
  "updatedAt" VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_projects_product ON projects(product);
CREATE INDEX IF NOT EXISTS idx_projects_geo ON projects(geo);`,
      weekly_updates: `CREATE TABLE IF NOT EXISTS weekly_updates (
  id VARCHAR(255) PRIMARY KEY,
  "projectId" VARCHAR(255) NOT NULL,
  "weekNumber" INT NOT NULL,
  year INT NOT NULL,
  "updateDate" VARCHAR(50) NOT NULL,
  author VARCHAR(255) NOT NULL,
  "overallRag" VARCHAR(20) NOT NULL,
  "qualityRag" VARCHAR(20) NOT NULL,
  "scheduleRag" VARCHAR(20) NOT NULL,
  "scopeRag" VARCHAR(20) NOT NULL,
  highlights TEXT,
  lowlights TEXT,
  "nextSteps" TEXT,
  "kpiProgress" TEXT,
  "completionPercentage" NUMERIC DEFAULT 0,
  "createdAt" VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_updates_project ON weekly_updates("projectId");`,
      settings: `CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL
);`,
      scorecards: `CREATE TABLE IF NOT EXISTS scorecards (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  template_id VARCHAR(20) NOT NULL,
  template_version INT,
  period_year INT NOT NULL,
  period_week INT NOT NULL,
  period_label VARCHAR(40),
  assessment_date VARCHAR(10),
  assessor VARCHAR(120),
  status VARCHAR(10),
  overall_rag CHAR(1),
  overall_value NUMERIC(6,3),
  normalized_pct NUMERIC(5,1),
  payload TEXT NOT NULL,
  created_at VARCHAR(30),
  updated_at VARCHAR(30),
  CONSTRAINT uq_scorecards_period UNIQUE(project_id, template_id, period_year, period_week)
);
CREATE INDEX IF NOT EXISTS idx_scorecards_period ON scorecards(project_id, template_id, period_year, period_week);`,
    };
  }

  // SQL Server (T-SQL)
  return {
    projects: `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'projects')
BEGIN
  CREATE TABLE projects (
    id NVARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    code NVARCHAR(100) NOT NULL,
    product NVARCHAR(100) NOT NULL,
    projectType NVARCHAR(100) NOT NULL,
    geo NVARCHAR(100) NOT NULL,
    owner NVARCHAR(255) NOT NULL,
    ownerEmail NVARCHAR(255),
    targetDate NVARCHAR(50),
    completionPercentage FLOAT DEFAULT 0,
    category NVARCHAR(255),
    description NVARCHAR(MAX),
    status NVARCHAR(50) NOT NULL,
    scorecard_config NVARCHAR(MAX),
    createdAt NVARCHAR(50) NOT NULL,
    updatedAt NVARCHAR(50)
  );
  CREATE INDEX idx_projects_product ON projects(product);
  CREATE INDEX idx_projects_geo ON projects(geo);
END;`,
    weekly_updates: `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'weekly_updates')
BEGIN
  CREATE TABLE weekly_updates (
    id NVARCHAR(255) PRIMARY KEY,
    projectId NVARCHAR(255) NOT NULL,
    weekNumber INT NOT NULL,
    year INT NOT NULL,
    updateDate NVARCHAR(50) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    overallRag NVARCHAR(20) NOT NULL,
    qualityRag NVARCHAR(20) NOT NULL,
    scheduleRag NVARCHAR(20) NOT NULL,
    scopeRag NVARCHAR(20) NOT NULL,
    highlights NVARCHAR(MAX),
    lowlights NVARCHAR(MAX),
    nextSteps NVARCHAR(MAX),
    kpiProgress NVARCHAR(MAX),
    completionPercentage FLOAT DEFAULT 0,
    createdAt NVARCHAR(50)
  );
  CREATE INDEX idx_updates_project ON weekly_updates(projectId);
END;`,
    settings: `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'settings')
BEGIN
  CREATE TABLE settings (
    [key] NVARCHAR(100) PRIMARY KEY,
    value NVARCHAR(MAX) NOT NULL
  );
END;`,
    scorecards: `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'scorecards')
BEGIN
  CREATE TABLE scorecards (
    id NVARCHAR(64) PRIMARY KEY,
    project_id NVARCHAR(64) NOT NULL,
    template_id NVARCHAR(20) NOT NULL,
    template_version INT,
    period_year INT NOT NULL,
    period_week INT NOT NULL,
    period_label NVARCHAR(40),
    assessment_date NVARCHAR(10),
    assessor NVARCHAR(120),
    status NVARCHAR(10),
    overall_rag NVARCHAR(1),
    overall_value DECIMAL(6,3),
    normalized_pct DECIMAL(5,1),
    payload NVARCHAR(MAX) NOT NULL,
    created_at NVARCHAR(30),
    updated_at NVARCHAR(30),
    CONSTRAINT uq_scorecards_period UNIQUE(project_id, template_id, period_year, period_week)
  );
  CREATE INDEX idx_scorecards_period ON scorecards(project_id, template_id, period_year, period_week);
END;`,
  };
}

// -------------------------------------------------------------
// Table Initializers
// -------------------------------------------------------------
function initSqliteTables(db: DatabaseSync): string[] {
  const ddl = getDdlScripts('sqlite');
  db.exec(ddl.projects);
  db.exec(ddl.weekly_updates);
  db.exec(ddl.settings);
  db.exec(ddl.scorecards);

  // Migration for existing tables
  try {
    const pragma = db.prepare("PRAGMA table_info(projects)").all() as any[];
    if (pragma.length > 0 && !pragma.some((col) => col.name === 'scorecard_config')) {
      db.exec("ALTER TABLE projects ADD COLUMN scorecard_config TEXT");
    }
  } catch (e: any) {
    console.warn('[Database] Could not add scorecard_config to projects in SQLite:', e.message);
  }

  return ['projects', 'weekly_updates', 'settings', 'scorecards'];
}

async function initPgTables(pool: pg.Pool): Promise<string[]> {
  const client = await pool.connect();
  try {
    const ddl = getDdlScripts('postgres');
    await client.query(ddl.projects);
    await client.query(ddl.weekly_updates);
    await client.query(ddl.settings);
    await client.query(ddl.scorecards);

    // Migration for existing tables
    try {
      await client.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS "scorecard_config" TEXT;');
    } catch (e: any) {
      console.warn('[Database] Could not add scorecard_config to projects in PostgreSQL:', e.message);
    }

    return ['projects', 'weekly_updates', 'settings', 'scorecards'];
  } finally {
    client.release();
  }
}

async function initMssqlTables(pool: sql.ConnectionPool): Promise<string[]> {
  const ddl = getDdlScripts('mssql');
  await pool.request().batch(ddl.projects);
  await pool.request().batch(ddl.weekly_updates);
  await pool.request().batch(ddl.settings);
  await pool.request().batch(ddl.scorecards);

  // Migration for existing tables
  try {
    await pool.request().batch(`
      IF COL_LENGTH('projects', 'scorecard_config') IS NULL
        ALTER TABLE projects ADD scorecard_config NVARCHAR(MAX);
    `);
  } catch (e: any) {
    console.warn('[Database] Could not add scorecard_config to projects in MSSQL:', e.message);
  }

  return ['projects', 'weekly_updates', 'settings', 'scorecards'];
}

// Helper to build SQL Server connection config
function getMssqlConfig(cfg: DatabaseConfig): sql.config {
  if (cfg.useConnectionString && cfg.connectionString?.trim()) {
    return cfg.connectionString.trim() as any;
  }
  return {
    server: cfg.host || 'localhost',
    port: Number(cfg.port) || 1433,
    database: cfg.database || 'master',
    user: cfg.username || 'sa',
    password: cfg.password || '',
    options: {
      encrypt: cfg.sslMode === 'require',
      trustServerCertificate: cfg.trustServerCertificate ?? true,
      connectTimeout: 5000,
      requestTimeout: 15000,
    },
  };
}

// -------------------------------------------------------------
// Connect to Database
// -------------------------------------------------------------
export async function connectDatabase(config: DatabaseConfig): Promise<boolean> {
  const start = Date.now();
  currentConfig = { ...config };

  // Close existing connections
  if (sqliteInstance) {
    try {
      sqliteInstance.close();
    } catch {}
    sqliteInstance = null;
  }
  if (pgPoolInstance) {
    try {
      await pgPoolInstance.end();
    } catch {}
    pgPoolInstance = null;
  }
  if (mssqlPoolInstance) {
    try {
      await mssqlPoolInstance.close();
    } catch {}
    mssqlPoolInstance = null;
  }

  try {
    if (config.engine === 'sqlite') {
      const resolvedPath = path.isAbsolute(config.filePath)
        ? config.filePath
        : path.join(process.cwd(), config.filePath);

      const dbDir = path.dirname(resolvedPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      sqliteInstance = new DatabaseSync(resolvedPath);
      initSqliteTables(sqliteInstance);

      const stmt = sqliteInstance.prepare('SELECT sqlite_version() AS version');
      const row = stmt.get() as any;
      console.log(`[Database] SQLite connected at "${resolvedPath}" (version: ${row?.version || 'unknown'})`);

      isConnected = true;
      lastError = null;
      lastLatencyMs = Date.now() - start;
      lastTestedAt = new Date().toISOString();
      return true;
    } else if (config.engine === 'postgres') {
      let poolConfig: pg.PoolConfig;

      if (config.useConnectionString && config.connectionString?.trim()) {
        poolConfig = {
          connectionString: config.connectionString.trim(),
          connectionTimeoutMillis: 5000,
          ssl: config.sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
        };
      } else {
        poolConfig = {
          host: config.host || 'localhost',
          port: Number(config.port) || 5432,
          database: config.database || 'postgres',
          user: config.username || 'postgres',
          password: config.password || '',
          connectionTimeoutMillis: 5000,
          ssl: config.sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
        };
      }

      pgPoolInstance = new Pool(poolConfig);
      await initPgTables(pgPoolInstance);

      const res = await pgPoolInstance.query('SELECT version() AS version');
      console.log(`[Database] PostgreSQL connected successfully (${res.rows[0]?.version?.substring(0, 40)}...)`);

      isConnected = true;
      lastError = null;
      lastLatencyMs = Date.now() - start;
      lastTestedAt = new Date().toISOString();
      return true;
    } else if (config.engine === 'mssql') {
      const sqlConfig = getMssqlConfig(config);
      mssqlPoolInstance = new sql.ConnectionPool(sqlConfig);
      await mssqlPoolInstance.connect();
      await initMssqlTables(mssqlPoolInstance);

      const res = await mssqlPoolInstance.request().query('SELECT @@VERSION AS version');
      const verStr = res.recordset[0]?.version?.split('\n')[0] || 'SQL Server';
      console.log(`[Database] Microsoft SQL Server connected successfully (${verStr})`);

      isConnected = true;
      lastError = null;
      lastLatencyMs = Date.now() - start;
      lastTestedAt = new Date().toISOString();
      return true;
    }
    return false;
  } catch (err: any) {
    console.error(`[Database] Failed to connect to ${config.engine}:`, err.message);
    isConnected = false;
    lastError = err.message;
    lastLatencyMs = Date.now() - start;
    lastTestedAt = new Date().toISOString();

    // Fall back to SQLite if network DB failed
    if (config.engine === 'postgres' || config.engine === 'mssql') {
      console.warn('[Database] Falling back to default SQLite database...');
      try {
        const fallbackPath = DEFAULT_SQLITE_PATH;
        sqliteInstance = new DatabaseSync(fallbackPath);
        initSqliteTables(sqliteInstance);
        isConnected = true;
      } catch (fallbackErr: any) {
        console.error('[Database] Fallback SQLite connection failed:', fallbackErr);
      }
    }
    return false;
  }
}

// -------------------------------------------------------------
// Test Connection
// -------------------------------------------------------------
export async function testConnection(testCfg: DatabaseConfig): Promise<DatabaseTestResult> {
  const start = Date.now();
  try {
    if (testCfg.engine === 'sqlite') {
      const resolvedPath = path.isAbsolute(testCfg.filePath)
        ? testCfg.filePath
        : path.join(process.cwd(), testCfg.filePath);

      const dbDir = path.dirname(resolvedPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      const tempDb = new DatabaseSync(resolvedPath);
      try {
        initSqliteTables(tempDb);
        const stmt = tempDb.prepare('SELECT sqlite_version() AS version');
        const row = stmt.get() as any;
        const tablesStmt = tempDb.prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        );
        const tables = (tablesStmt.all() as any[]).map((r) => r.name);

        const latency = Date.now() - start;
        return {
          success: true,
          engine: 'sqlite',
          latencyMs: latency,
          version: `SQLite ${row?.version || '3.x'} (Built-in engine)`,
          message: `Connected successfully to local SQLite file at "${resolvedPath}". Read/write verified.`,
          tablesFound: tables,
        };
      } finally {
        tempDb.close();
      }
    } else if (testCfg.engine === 'postgres') {
      let poolConfig: pg.PoolConfig;

      if (testCfg.useConnectionString && testCfg.connectionString?.trim()) {
        poolConfig = {
          connectionString: testCfg.connectionString.trim(),
          connectionTimeoutMillis: 5000,
          ssl: testCfg.sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
        };
      } else {
        poolConfig = {
          host: testCfg.host || 'localhost',
          port: Number(testCfg.port) || 5432,
          database: testCfg.database || 'postgres',
          user: testCfg.username || 'postgres',
          password: testCfg.password || '',
          connectionTimeoutMillis: 5000,
          ssl: testCfg.sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
        };
      }

      const tempPool = new Pool(poolConfig);
      try {
        const client = await tempPool.connect();
        try {
          const vRes = await client.query('SELECT version() AS version');
          const tRes = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
          );
          const tables = tRes.rows.map((r: any) => r.table_name);
          const latency = Date.now() - start;

          return {
            success: true,
            engine: 'postgres',
            latencyMs: latency,
            version: vRes.rows[0]?.version || 'PostgreSQL',
            message: `Connected successfully to PostgreSQL host ${testCfg.host || 'server'}:${testCfg.port || 5432} / ${testCfg.database || ''}.`,
            tablesFound: tables,
          };
        } finally {
          client.release();
        }
      } finally {
        await tempPool.end();
      }
    } else if (testCfg.engine === 'mssql') {
      const sqlConfig = getMssqlConfig(testCfg);
      const tempPool = new sql.ConnectionPool(sqlConfig);
      try {
        await tempPool.connect();
        const vRes = await tempPool.request().query('SELECT @@VERSION AS version');
        const tRes = await tempPool
          .request()
          .query("SELECT name FROM sys.tables WHERE type = 'U' ORDER BY name");
        const tables = tRes.recordset.map((r: any) => r.name);
        const latency = Date.now() - start;
        const verStr = vRes.recordset[0]?.version?.split('\n')[0] || 'Microsoft SQL Server';

        return {
          success: true,
          engine: 'mssql',
          latencyMs: latency,
          version: verStr,
          message: `Connected successfully to Microsoft SQL Server at ${testCfg.host || 'localhost'}:${testCfg.port || 1433} / ${testCfg.database || 'master'}.`,
          tablesFound: tables,
        };
      } finally {
        await tempPool.close();
      }
    }

    return {
      success: false,
      engine: testCfg.engine,
      latencyMs: Date.now() - start,
      message: `Unsupported database engine: ${testCfg.engine}`,
    };
  } catch (err: any) {
    return {
      success: false,
      engine: testCfg.engine,
      latencyMs: Date.now() - start,
      error: err.message,
      message: `Connection failed: ${err.message}`,
    };
  }
}

// -------------------------------------------------------------
// Explicit Create Table Structures Feature
// -------------------------------------------------------------
export async function createTableStructures(targetConfig?: DatabaseConfig): Promise<TableStructureResult> {
  const cfg = targetConfig || currentConfig;
  const logs: string[] = [];

  try {
    if (cfg.engine === 'sqlite') {
      const resolvedPath = path.isAbsolute(cfg.filePath)
        ? cfg.filePath
        : path.join(process.cwd(), cfg.filePath);

      const dbDir = path.dirname(resolvedPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        logs.push(`Created directory: ${dbDir}`);
      }

      const db = sqliteInstance || new DatabaseSync(resolvedPath);
      const tables = initSqliteTables(db);
      logs.push(`Created / verified table 'projects' (Primary Key: id, Columns: 15)`);
      logs.push(`Created / verified index 'idx_projects_product' on projects(product)`);
      logs.push(`Created / verified index 'idx_projects_geo' on projects(geo)`);
      logs.push(`Created / verified table 'weekly_updates' (Primary Key: id, Foreign Key: projectId, Columns: 16)`);
      logs.push(`Created / verified index 'idx_updates_project' on weekly_updates(projectId)`);
      logs.push(`Created / verified table 'settings' (Primary Key: key, Columns: 2)`);
      logs.push(`Created / verified table 'scorecards' (Primary Key: id, Unique: project_id+template_id+period, Columns: 16)`);
      logs.push(`Created / verified index 'idx_scorecards_period' on scorecards(project_id, template_id, period_year, period_week)`);

      return {
        success: true,
        engine: 'sqlite',
        tablesCreated: tables,
        logs,
        message: `Successfully created and verified all table structures in SQLite database (${resolvedPath}).`,
      };
    } else if (cfg.engine === 'postgres') {
      let poolToUse = pgPoolInstance;
      let shouldClose = false;

      if (!poolToUse || targetConfig) {
        let poolConfig: pg.PoolConfig;
        if (cfg.useConnectionString && cfg.connectionString?.trim()) {
          poolConfig = {
            connectionString: cfg.connectionString.trim(),
            connectionTimeoutMillis: 5000,
            ssl: cfg.sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
          };
        } else {
          poolConfig = {
            host: cfg.host || 'localhost',
            port: Number(cfg.port) || 5432,
            database: cfg.database || 'postgres',
            user: cfg.username || 'postgres',
            password: cfg.password || '',
            connectionTimeoutMillis: 5000,
            ssl: cfg.sslMode === 'require' ? { rejectUnauthorized: false } : undefined,
          };
        }
        poolToUse = new Pool(poolConfig);
        shouldClose = true;
      }

      try {
        const tables = await initPgTables(poolToUse);
        logs.push(`Created / verified table "projects" (Primary Key: id, Columns: 15)`);
        logs.push(`Created / verified index "idx_projects_product" on projects(product)`);
        logs.push(`Created / verified index "idx_projects_geo" on projects(geo)`);
        logs.push(`Created / verified table "weekly_updates" (Primary Key: id, Columns: 16)`);
        logs.push(`Created / verified index "idx_updates_project" on weekly_updates("projectId")`);
        logs.push(`Created / verified table "settings" (Primary Key: key, Columns: 2)`);
        logs.push(`Created / verified table "scorecards" (Primary Key: id, Unique constraint, Columns: 16)`);
        logs.push(`Created / verified index "idx_scorecards_period" on scorecards(project_id, template_id, period_year, period_week)`);

        return {
          success: true,
          engine: 'postgres',
          tablesCreated: tables,
          logs,
          message: `Successfully created and verified all PostgreSQL table structures in database "${cfg.database || 'postgres'}".`,
        };
      } finally {
        if (shouldClose && poolToUse) {
          await poolToUse.end();
        }
      }
    } else if (cfg.engine === 'mssql') {
      let poolToUse = mssqlPoolInstance;
      let shouldClose = false;

      if (!poolToUse || targetConfig) {
        const sqlConfig = getMssqlConfig(cfg);
        poolToUse = new sql.ConnectionPool(sqlConfig);
        await poolToUse.connect();
        shouldClose = true;
      }

      try {
        const tables = await initMssqlTables(poolToUse);
        logs.push(`Created / verified table [dbo].[projects] with Primary Key and index on product/geo`);
        logs.push(`Created / verified table [dbo].[weekly_updates] with Primary Key and index on projectId`);
        logs.push(`Created / verified table [dbo].[settings] with Primary Key on [key]`);
        logs.push(`Created / verified table [dbo].[scorecards] with Primary Key and index on period`);

        return {
          success: true,
          engine: 'mssql',
          tablesCreated: tables,
          logs,
          message: `Successfully created and verified all Microsoft SQL Server table structures in database "${cfg.database || 'master'}".`,
        };
      } finally {
        if (shouldClose && poolToUse) {
          await poolToUse.close();
        }
      }
    }

    return {
      success: false,
      engine: cfg.engine,
      tablesCreated: [],
      logs: [`Unsupported database engine: ${cfg.engine}`],
      message: `Unsupported database engine: ${cfg.engine}`,
    };
  } catch (err: any) {
    return {
      success: false,
      engine: cfg.engine,
      tablesCreated: [],
      logs: [...logs, `Error executing DDL: ${err.message}`],
      error: err.message,
      message: `Failed to create table structures: ${err.message}`,
    };
  }
}

// -------------------------------------------------------------
// Seed initial database data if tables are empty
// -------------------------------------------------------------
export async function seedDatabaseIfEmpty() {
  try {
    const existing = await getAllProjects();
    if (existing.length === 0) {
      console.log('[Database] Database tables empty. Seeding initial projects, updates, and master data...');

      const seedProjects: Project[] = [];
      const seedUpdates: WeeklyUpdate[] = [];

      if (fs.existsSync(PROJECTS_DIR)) {
        const entries = await fsp.readdir(PROJECTS_DIR, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const projectFile = path.join(PROJECTS_DIR, entry.name, 'project.json');
            if (fs.existsSync(projectFile)) {
              try {
                const data = JSON.parse(await fsp.readFile(projectFile, 'utf8'));
                if (data?.id) seedProjects.push(data);
              } catch {}
            }
            const updatesDir = path.join(PROJECTS_DIR, entry.name, 'updates');
            if (fs.existsSync(updatesDir)) {
              const uFiles = await fsp.readdir(updatesDir);
              for (const uf of uFiles) {
                if (uf.endsWith('.json')) {
                  try {
                    const uData = JSON.parse(await fsp.readFile(path.join(updatesDir, uf), 'utf8'));
                    if (uData?.id) seedUpdates.push(uData);
                  } catch {}
                }
              }
            }
          }
        }
      }

      const projectsToInsert = seedProjects.length > 0 ? seedProjects : INITIAL_PROJECTS;
      const updatesToInsert = seedUpdates.length > 0 ? seedUpdates : INITIAL_UPDATES;

      for (const p of projectsToInsert) {
        await saveProject(p);
      }
      for (const u of updatesToInsert) {
        await saveWeeklyUpdate(u);
      }

      // Settings
      let defaultSettings = {
        products: DEFAULT_PRODUCTS,
        geos: DEFAULT_GEOS,
        projectTypes: DEFAULT_PROJECT_TYPES,
      };
      if (fs.existsSync(SETTINGS_FILE)) {
        try {
          const s = JSON.parse(await fsp.readFile(SETTINGS_FILE, 'utf8'));
          if (s) defaultSettings = { ...defaultSettings, ...s };
        } catch {}
      }
      await saveSettings(defaultSettings);

      console.log(
        `[Database] Successfully seeded ${projectsToInsert.length} projects and ${updatesToInsert.length} updates into database.`
      );
    }
  } catch (err) {
    console.error('[Database] Error checking or seeding database:', err);
  }
}

// -------------------------------------------------------------
// Database CRUD Operations (SQLite, PostgreSQL, SQL Server)
// -------------------------------------------------------------

function parseScorecardConfig(val: any) {
  if (!val) return undefined;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return undefined;
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare('SELECT * FROM projects ORDER BY updatedAt DESC, createdAt DESC');
    const rows = stmt.all() as any[];
    return rows.map((r) => ({
      ...r,
      completionPercentage: Number(r.completionPercentage) || 0,
      projectType: r.projectType || 'Manual',
      scorecardConfig: parseScorecardConfig(r.scorecard_config),
    }));
  }

  if (pgPoolInstance && currentConfig.engine === 'postgres') {
    const res = await pgPoolInstance.query('SELECT * FROM projects ORDER BY "updatedAt" DESC, "createdAt" DESC');
    return res.rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      product: r.product,
      projectType: r.projectType || 'Manual',
      geo: r.geo,
      owner: r.owner,
      ownerEmail: r.ownerEmail || undefined,
      targetDate: r.targetDate,
      completionPercentage: Number(r.completionPercentage) || 0,
      category: r.category || undefined,
      description: r.description,
      status: r.status,
      scorecardConfig: parseScorecardConfig(r.scorecard_config),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt || undefined,
    }));
  }

  if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const res = await mssqlPoolInstance
      .request()
      .query('SELECT * FROM projects ORDER BY updatedAt DESC, createdAt DESC');
    return res.recordset.map((r: any) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      product: r.product,
      projectType: r.projectType || 'Manual',
      geo: r.geo,
      owner: r.owner,
      ownerEmail: r.ownerEmail || undefined,
      targetDate: r.targetDate,
      completionPercentage: Number(r.completionPercentage) || 0,
      category: r.category || undefined,
      description: r.description,
      status: r.status,
      scorecardConfig: parseScorecardConfig(r.scorecard_config),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt || undefined,
    }));
  }

  return [];
}

export async function saveProject(project: Project): Promise<void> {
  const completion = Number(project.completionPercentage) || 0;
  const now = new Date().toISOString();
  const createdAt = project.createdAt || now;
  const updatedAt = project.updatedAt || now;
  const scorecardConfigStr = project.scorecardConfig ? JSON.stringify(project.scorecardConfig) : null;

  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare(`
      INSERT INTO projects (
        id, name, code, product, projectType, geo, owner, ownerEmail, targetDate, completionPercentage, category, description, status, scorecard_config, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        code = excluded.code,
        product = excluded.product,
        projectType = excluded.projectType,
        geo = excluded.geo,
        owner = excluded.owner,
        ownerEmail = excluded.ownerEmail,
        targetDate = excluded.targetDate,
        completionPercentage = excluded.completionPercentage,
        category = excluded.category,
        description = excluded.description,
        status = excluded.status,
        scorecard_config = excluded.scorecard_config,
        updatedAt = excluded.updatedAt
    `);
    stmt.run(
      project.id,
      project.name,
      project.code,
      project.product,
      project.projectType || 'Manual',
      project.geo,
      project.owner,
      project.ownerEmail || null,
      project.targetDate,
      completion,
      project.category || null,
      project.description,
      project.status,
      scorecardConfigStr,
      createdAt,
      updatedAt
    );
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    await pgPoolInstance.query(
      `
      INSERT INTO projects (
        id, name, code, product, "projectType", geo, owner, "ownerEmail", "targetDate", "completionPercentage", category, description, status, "scorecard_config", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        code = EXCLUDED.code,
        product = EXCLUDED.product,
        "projectType" = EXCLUDED."projectType",
        geo = EXCLUDED.geo,
        owner = EXCLUDED.owner,
        "ownerEmail" = EXCLUDED."ownerEmail",
        "targetDate" = EXCLUDED."targetDate",
        "completionPercentage" = EXCLUDED."completionPercentage",
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        "scorecard_config" = EXCLUDED."scorecard_config",
        "updatedAt" = EXCLUDED."updatedAt"
      `,
      [
        project.id,
        project.name,
        project.code,
        project.product,
        project.projectType || 'Manual',
        project.geo,
        project.owner,
        project.ownerEmail || null,
        project.targetDate,
        completion,
        project.category || null,
        project.description,
        project.status,
        scorecardConfigStr,
        createdAt,
        updatedAt,
      ]
    );
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const req = mssqlPoolInstance.request();
    req.input('id', sql.NVarChar(255), project.id);
    req.input('name', sql.NVarChar(255), project.name);
    req.input('code', sql.NVarChar(100), project.code);
    req.input('product', sql.NVarChar(100), project.product);
    req.input('projectType', sql.NVarChar(100), project.projectType || 'Manual');
    req.input('geo', sql.NVarChar(100), project.geo);
    req.input('owner', sql.NVarChar(255), project.owner);
    req.input('ownerEmail', sql.NVarChar(255), project.ownerEmail || null);
    req.input('targetDate', sql.NVarChar(50), project.targetDate || null);
    req.input('completionPercentage', sql.Float, completion);
    req.input('category', sql.NVarChar(255), project.category || null);
    req.input('description', sql.NVarChar(sql.MAX), project.description || '');
    req.input('status', sql.NVarChar(50), project.status);
    req.input('scorecard_config', sql.NVarChar(sql.MAX), scorecardConfigStr);
    req.input('createdAt', sql.NVarChar(50), createdAt);
    req.input('updatedAt', sql.NVarChar(50), updatedAt);

    await req.query(`
      IF EXISTS (SELECT 1 FROM projects WHERE id = @id)
        UPDATE projects SET
          name = @name,
          code = @code,
          product = @product,
          projectType = @projectType,
          geo = @geo,
          owner = @owner,
          ownerEmail = @ownerEmail,
          targetDate = @targetDate,
          completionPercentage = @completionPercentage,
          category = @category,
          description = @description,
          status = @status,
          scorecard_config = @scorecard_config,
          updatedAt = @updatedAt
        WHERE id = @id
      ELSE
        INSERT INTO projects (
          id, name, code, product, projectType, geo, owner, ownerEmail, targetDate, completionPercentage, category, description, status, scorecard_config, createdAt, updatedAt
        ) VALUES (
          @id, @name, @code, @product, @projectType, @geo, @owner, @ownerEmail, @targetDate, @completionPercentage, @category, @description, @status, @scorecard_config, @createdAt, @updatedAt
        )
    `);
  }

  // File system backup sync
  try {
    const projectDir = path.join(PROJECTS_DIR, project.id);
    await writeJsonFile(path.join(projectDir, 'project.json'), { ...project, createdAt, updatedAt });
  } catch {}
}

export async function deleteProject(projectId: string): Promise<void> {
  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    sqliteInstance.prepare('DELETE FROM projects WHERE id = ?').run(projectId);
    sqliteInstance.prepare('DELETE FROM weekly_updates WHERE projectId = ?').run(projectId);
    sqliteInstance.prepare('DELETE FROM scorecards WHERE project_id = ?').run(projectId);
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    await pgPoolInstance.query('DELETE FROM projects WHERE id = $1', [projectId]);
    await pgPoolInstance.query('DELETE FROM weekly_updates WHERE "projectId" = $1', [projectId]);
    await pgPoolInstance.query('DELETE FROM scorecards WHERE project_id = $1', [projectId]);
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const req = mssqlPoolInstance.request();
    req.input('id', sql.NVarChar(255), projectId);
    await req.query('DELETE FROM projects WHERE id = @id; DELETE FROM weekly_updates WHERE projectId = @id; DELETE FROM scorecards WHERE project_id = @id;');
  }

  try {
    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (fs.existsSync(projectDir)) {
      await fsp.rm(projectDir, { recursive: true, force: true });
    }
  } catch {}
}

export async function getAllWeeklyUpdates(): Promise<WeeklyUpdate[]> {
  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare('SELECT * FROM weekly_updates ORDER BY updateDate DESC');
    const rows = stmt.all() as any[];
    return rows.map((r) => ({
      ...r,
      weekNumber: Number(r.weekNumber),
      year: Number(r.year),
      completionPercentage: Number(r.completionPercentage) || 0,
    }));
  }

  if (pgPoolInstance && currentConfig.engine === 'postgres') {
    const res = await pgPoolInstance.query('SELECT * FROM weekly_updates ORDER BY "updateDate" DESC');
    return res.rows.map((r: any) => ({
      id: r.id,
      projectId: r.projectId,
      weekNumber: Number(r.weekNumber),
      year: Number(r.year),
      updateDate: r.updateDate,
      author: r.author,
      overallRag: r.overallRag,
      qualityRag: r.qualityRag,
      scheduleRag: r.scheduleRag,
      scopeRag: r.scopeRag,
      highlights: r.highlights || '',
      lowlights: r.lowlights || '',
      nextSteps: r.nextSteps || '',
      kpiProgress: r.kpiProgress || undefined,
      completionPercentage: Number(r.completionPercentage) || 0,
      createdAt: r.createdAt || undefined,
    }));
  }

  if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const res = await mssqlPoolInstance
      .request()
      .query('SELECT * FROM weekly_updates ORDER BY updateDate DESC');
    return res.recordset.map((r: any) => ({
      id: r.id,
      projectId: r.projectId,
      weekNumber: Number(r.weekNumber),
      year: Number(r.year),
      updateDate: r.updateDate,
      author: r.author,
      overallRag: r.overallRag,
      qualityRag: r.qualityRag,
      scheduleRag: r.scheduleRag,
      scopeRag: r.scopeRag,
      highlights: r.highlights || '',
      lowlights: r.lowlights || '',
      nextSteps: r.nextSteps || '',
      kpiProgress: r.kpiProgress || undefined,
      completionPercentage: Number(r.completionPercentage) || 0,
      createdAt: r.createdAt || undefined,
    }));
  }

  return [];
}

export async function saveWeeklyUpdate(update: WeeklyUpdate): Promise<void> {
  const completion = Number(update.completionPercentage) || 0;
  const createdAt = update.createdAt || new Date().toISOString();

  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare(`
      INSERT INTO weekly_updates (
        id, projectId, weekNumber, year, updateDate, author, overallRag, qualityRag, scheduleRag, scopeRag, highlights, lowlights, nextSteps, kpiProgress, completionPercentage, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        projectId = excluded.projectId,
        weekNumber = excluded.weekNumber,
        year = excluded.year,
        updateDate = excluded.updateDate,
        author = excluded.author,
        overallRag = excluded.overallRag,
        qualityRag = excluded.qualityRag,
        scheduleRag = excluded.scheduleRag,
        scopeRag = excluded.scopeRag,
        highlights = excluded.highlights,
        lowlights = excluded.lowlights,
        nextSteps = excluded.nextSteps,
        kpiProgress = excluded.kpiProgress,
        completionPercentage = excluded.completionPercentage
    `);
    stmt.run(
      update.id,
      update.projectId,
      update.weekNumber,
      update.year,
      update.updateDate,
      update.author,
      update.overallRag,
      update.qualityRag,
      update.scheduleRag,
      update.scopeRag,
      update.highlights,
      update.lowlights,
      update.nextSteps,
      update.kpiProgress || null,
      completion,
      createdAt
    );
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    await pgPoolInstance.query(
      `
      INSERT INTO weekly_updates (
        id, "projectId", "weekNumber", year, "updateDate", author, "overallRag", "qualityRag", "scheduleRag", "scopeRag", highlights, lowlights, "nextSteps", "kpiProgress", "completionPercentage", "createdAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        "projectId" = EXCLUDED."projectId",
        "weekNumber" = EXCLUDED."weekNumber",
        year = EXCLUDED.year,
        "updateDate" = EXCLUDED."updateDate",
        author = EXCLUDED.author,
        "overallRag" = EXCLUDED."overallRag",
        "qualityRag" = EXCLUDED."qualityRag",
        "scheduleRag" = EXCLUDED."scheduleRag",
        "scopeRag" = EXCLUDED."scopeRag",
        highlights = EXCLUDED.highlights,
        lowlights = EXCLUDED.lowlights,
        "nextSteps" = EXCLUDED."nextSteps",
        "kpiProgress" = EXCLUDED."kpiProgress",
        "completionPercentage" = EXCLUDED."completionPercentage"
      `,
      [
        update.id,
        update.projectId,
        update.weekNumber,
        update.year,
        update.updateDate,
        update.author,
        update.overallRag,
        update.qualityRag,
        update.scheduleRag,
        update.scopeRag,
        update.highlights,
        update.lowlights,
        update.nextSteps,
        update.kpiProgress || null,
        completion,
        createdAt,
      ]
    );
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const req = mssqlPoolInstance.request();
    req.input('id', sql.NVarChar(255), update.id);
    req.input('projectId', sql.NVarChar(255), update.projectId);
    req.input('weekNumber', sql.Int, update.weekNumber);
    req.input('year', sql.Int, update.year);
    req.input('updateDate', sql.NVarChar(50), update.updateDate);
    req.input('author', sql.NVarChar(255), update.author);
    req.input('overallRag', sql.NVarChar(20), update.overallRag);
    req.input('qualityRag', sql.NVarChar(20), update.qualityRag);
    req.input('scheduleRag', sql.NVarChar(20), update.scheduleRag);
    req.input('scopeRag', sql.NVarChar(20), update.scopeRag);
    req.input('highlights', sql.NVarChar(sql.MAX), update.highlights || '');
    req.input('lowlights', sql.NVarChar(sql.MAX), update.lowlights || '');
    req.input('nextSteps', sql.NVarChar(sql.MAX), update.nextSteps || '');
    req.input('kpiProgress', sql.NVarChar(sql.MAX), update.kpiProgress || null);
    req.input('completionPercentage', sql.Float, completion);
    req.input('createdAt', sql.NVarChar(50), createdAt);

    await req.query(`
      IF EXISTS (SELECT 1 FROM weekly_updates WHERE id = @id)
        UPDATE weekly_updates SET
          projectId = @projectId,
          weekNumber = @weekNumber,
          year = @year,
          updateDate = @updateDate,
          author = @author,
          overallRag = @overallRag,
          qualityRag = @qualityRag,
          scheduleRag = @scheduleRag,
          scopeRag = @scopeRag,
          highlights = @highlights,
          lowlights = @lowlights,
          nextSteps = @nextSteps,
          kpiProgress = @kpiProgress,
          completionPercentage = @completionPercentage
        WHERE id = @id
      ELSE
        INSERT INTO weekly_updates (
          id, projectId, weekNumber, year, updateDate, author, overallRag, qualityRag, scheduleRag, scopeRag, highlights, lowlights, nextSteps, kpiProgress, completionPercentage, createdAt
        ) VALUES (
          @id, @projectId, @weekNumber, @year, @updateDate, @author, @overallRag, @qualityRag, @scheduleRag, @scopeRag, @highlights, @lowlights, @nextSteps, @kpiProgress, @completionPercentage, @createdAt
        )
    `);
  }

  // File system backup sync
  try {
    const updatesDir = path.join(PROJECTS_DIR, update.projectId, 'updates');
    await writeJsonFile(path.join(updatesDir, `${update.id}.json`), { ...update, createdAt });
  } catch {}
}

export async function deleteWeeklyUpdate(updateId: string): Promise<boolean> {
  let deleted = false;
  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const res = sqliteInstance.prepare('DELETE FROM weekly_updates WHERE id = ?').run(updateId);
    deleted = (res.changes as number) > 0;
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    const res = await pgPoolInstance.query('DELETE FROM weekly_updates WHERE id = $1', [updateId]);
    deleted = (res.rowCount ?? 0) > 0;
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const req = mssqlPoolInstance.request();
    req.input('id', sql.NVarChar(255), updateId);
    const res = await req.query('DELETE FROM weekly_updates WHERE id = @id');
    deleted = (res.rowsAffected[0] ?? 0) > 0;
  }

  try {
    if (fs.existsSync(PROJECTS_DIR)) {
      const pDirs = await fsp.readdir(PROJECTS_DIR);
      for (const pd of pDirs) {
        const uFile = path.join(PROJECTS_DIR, pd, 'updates', `${updateId}.json`);
        if (fs.existsSync(uFile)) {
          await fsp.unlink(uFile);
          deleted = true;
        }
      }
    }
  } catch {}

  return deleted;
}

export async function getSettings(): Promise<{
  products: string[];
  geos: string[];
  projectTypes: string[];
  scoringSettings: ScoringSettings;
}> {
  let products = DEFAULT_PRODUCTS;
  let geos = DEFAULT_GEOS;
  let projectTypes = DEFAULT_PROJECT_TYPES;
  let scoringSettings: ScoringSettings = { ...DEFAULT_SCORING_SETTINGS };

  // Check file backup first
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const fileData = JSON.parse(await fsp.readFile(SETTINGS_FILE, 'utf-8'));
      if (Array.isArray(fileData.products)) products = fileData.products;
      if (Array.isArray(fileData.geos)) geos = fileData.geos;
      if (Array.isArray(fileData.projectTypes)) projectTypes = fileData.projectTypes;
      if (fileData.scoringSettings) {
        scoringSettings = {
          sweAmberFrom:
            typeof fileData.scoringSettings.sweAmberFrom === 'number'
              ? fileData.scoringSettings.sweAmberFrom
              : DEFAULT_SCORING_SETTINGS.sweAmberFrom,
          sweGreenFrom:
            typeof fileData.scoringSettings.sweGreenFrom === 'number'
              ? fileData.scoringSettings.sweGreenFrom
              : DEFAULT_SCORING_SETTINGS.sweGreenFrom,
          defaultCadence:
            fileData.scoringSettings.defaultCadence === 'biweekly' ? 'biweekly' : 'weekly',
        };
      }
    }
  } catch {}

  const parseRow = (key: string, val: string) => {
    try {
      const parsed = JSON.parse(val);
      if (key === 'products' && Array.isArray(parsed)) products = parsed;
      if (key === 'geos' && Array.isArray(parsed)) geos = parsed;
      if (key === 'projectTypes' && Array.isArray(parsed)) projectTypes = parsed;
      if (key === 'scoringSettings' && typeof parsed === 'object' && parsed !== null) {
        scoringSettings = {
          sweAmberFrom:
            typeof parsed.sweAmberFrom === 'number'
              ? parsed.sweAmberFrom
              : DEFAULT_SCORING_SETTINGS.sweAmberFrom,
          sweGreenFrom:
            typeof parsed.sweGreenFrom === 'number'
              ? parsed.sweGreenFrom
              : DEFAULT_SCORING_SETTINGS.sweGreenFrom,
          defaultCadence: parsed.defaultCadence === 'biweekly' ? 'biweekly' : 'weekly',
        };
      }
    } catch {}
  };

  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare('SELECT key, value FROM settings');
    const rows = stmt.all() as any[];
    for (const r of rows) {
      parseRow(r.key, r.value);
    }
    return { products, geos, projectTypes, scoringSettings };
  }

  if (pgPoolInstance && currentConfig.engine === 'postgres') {
    const res = await pgPoolInstance.query('SELECT key, value FROM settings');
    for (const r of res.rows) {
      parseRow(r.key, r.value);
    }
    return { products, geos, projectTypes, scoringSettings };
  }

  if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const res = await mssqlPoolInstance.request().query('SELECT [key], value FROM settings');
    for (const r of res.recordset) {
      parseRow(r.key, r.value);
    }
    return { products, geos, projectTypes, scoringSettings };
  }

  return { products, geos, projectTypes, scoringSettings };
}

export async function saveSettings(settings: {
  products?: string[];
  geos?: string[];
  projectTypes?: string[];
  scoringSettings?: ScoringSettings;
}): Promise<void> {
  const current = await getSettings();
  const nextProducts = Array.isArray(settings.products) ? settings.products : current.products;
  const nextGeos = Array.isArray(settings.geos) ? settings.geos : current.geos;
  const nextTypes = Array.isArray(settings.projectTypes) ? settings.projectTypes : current.projectTypes;
  const nextScoring: ScoringSettings = settings.scoringSettings
    ? {
        sweAmberFrom:
          typeof settings.scoringSettings.sweAmberFrom === 'number'
            ? settings.scoringSettings.sweAmberFrom
            : DEFAULT_SCORING_SETTINGS.sweAmberFrom,
        sweGreenFrom:
          typeof settings.scoringSettings.sweGreenFrom === 'number'
            ? settings.scoringSettings.sweGreenFrom
            : DEFAULT_SCORING_SETTINGS.sweGreenFrom,
        defaultCadence:
          settings.scoringSettings.defaultCadence === 'biweekly' ? 'biweekly' : 'weekly',
      }
    : current.scoringSettings;

  const pairs = [
    { key: 'products', val: JSON.stringify(nextProducts) },
    { key: 'geos', val: JSON.stringify(nextGeos) },
    { key: 'projectTypes', val: JSON.stringify(nextTypes) },
    { key: 'scoringSettings', val: JSON.stringify(nextScoring) },
  ];

  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    for (const p of pairs) {
      stmt.run(p.key, p.val);
    }
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    for (const p of pairs) {
      await pgPoolInstance.query(
        `
        INSERT INTO settings (key, value) VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `,
        [p.key, p.val]
      );
    }
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    for (const p of pairs) {
      const req = mssqlPoolInstance.request();
      req.input('key', sql.NVarChar(100), p.key);
      req.input('value', sql.NVarChar(sql.MAX), p.val);
      await req.query(`
        IF EXISTS (SELECT 1 FROM settings WHERE [key] = @key)
          UPDATE settings SET value = @value WHERE [key] = @key
        ELSE
          INSERT INTO settings ([key], value) VALUES (@key, @value)
      `);
    }
  }

  // Backup sync to settings.json
  try {
    await writeJsonFile(SETTINGS_FILE, {
      products: nextProducts,
      geos: nextGeos,
      projectTypes: nextTypes,
      scoringSettings: nextScoring,
    });
  } catch {}
}

export async function resetSettings(): Promise<{
  products: string[];
  geos: string[];
  projectTypes: string[];
  scoringSettings: ScoringSettings;
}> {
  const defaults = {
    products: DEFAULT_PRODUCTS,
    geos: DEFAULT_GEOS,
    projectTypes: DEFAULT_PROJECT_TYPES,
    scoringSettings: { ...DEFAULT_SCORING_SETTINGS },
  };
  await saveSettings(defaults);
  return defaults;
}

// Get all application data from active database
export async function getAllApplicationData() {
  const [projects, weeklyUpdates, settings, scorecardSummaries] = await Promise.all([
    getAllProjects(),
    getAllWeeklyUpdates(),
    getSettings(),
    getSubmittedScorecardSummaries(),
  ]);

  return {
    projects,
    weeklyUpdates,
    products: settings.products,
    geos: settings.geos,
    projectTypes: settings.projectTypes,
    scoringSettings: settings.scoringSettings,
    scorecardSummaries,
    storageEngine: currentConfig.engine,
  };
}

// Get current database status
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  let target = '';
  if (currentConfig.engine === 'sqlite') {
    target = currentConfig.filePath;
  } else if (currentConfig.useConnectionString) {
    target = `${currentConfig.engine.toUpperCase()} Connection URI`;
  } else {
    target = `${currentConfig.host}:${currentConfig.port}/${currentConfig.database}`;
  }

  let projectsCount = 0;
  let updatesCount = 0;
  let version = '';
  let tables: string[] = [];

  try {
    if (sqliteInstance && currentConfig.engine === 'sqlite') {
      const pStmt = sqliteInstance.prepare('SELECT COUNT(*) AS cnt FROM projects');
      const uStmt = sqliteInstance.prepare('SELECT COUNT(*) AS cnt FROM weekly_updates');
      const vStmt = sqliteInstance.prepare('SELECT sqlite_version() AS version');
      const tStmt = sqliteInstance.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      projectsCount = Number((pStmt.get() as any)?.cnt) || 0;
      updatesCount = Number((uStmt.get() as any)?.cnt) || 0;
      version = `SQLite ${(vStmt.get() as any)?.version || '3.x'}`;
      tables = (tStmt.all() as any[]).map((r) => r.name);
      isConnected = true;
    } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
      const pRes = await pgPoolInstance.query('SELECT COUNT(*) AS cnt FROM projects');
      const uRes = await pgPoolInstance.query('SELECT COUNT(*) AS cnt FROM weekly_updates');
      const vRes = await pgPoolInstance.query('SELECT version() AS version');
      const tRes = await pgPoolInstance.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      projectsCount = Number(pRes.rows[0]?.cnt) || 0;
      updatesCount = Number(uRes.rows[0]?.cnt) || 0;
      version = vRes.rows[0]?.version?.split(' on ')[0] || 'PostgreSQL';
      tables = tRes.rows.map((r: any) => r.table_name);
      isConnected = true;
    } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
      const pRes = await mssqlPoolInstance.request().query('SELECT COUNT(*) AS cnt FROM projects');
      const uRes = await mssqlPoolInstance.request().query('SELECT COUNT(*) AS cnt FROM weekly_updates');
      const vRes = await mssqlPoolInstance.request().query('SELECT @@VERSION AS version');
      const tRes = await mssqlPoolInstance
        .request()
        .query("SELECT name FROM sys.tables WHERE type = 'U' ORDER BY name");
      projectsCount = Number(pRes.recordset[0]?.cnt) || 0;
      updatesCount = Number(uRes.recordset[0]?.cnt) || 0;
      version = vRes.recordset[0]?.version?.split('\n')[0] || 'Microsoft SQL Server';
      tables = tRes.recordset.map((r: any) => r.name);
      isConnected = true;
    } else {
      isConnected = false;
    }
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
  }

  return {
    connected: isConnected,
    engine: currentConfig.engine,
    target,
    projectsCount,
    updatesCount,
    latencyMs: lastLatencyMs,
    lastTested: lastTestedAt,
    version,
    tables,
    error: lastError || undefined,
  };
}

// Save database configuration and switch active database
export async function updateDatabaseConfig(
  newConfig: DatabaseConfig
): Promise<{ success: boolean; status: DatabaseStatus }> {
  ensureDataDir();
  const ok = await connectDatabase(newConfig);
  if (ok) {
    await writeJsonFile(DB_CONFIG_FILE, newConfig);
    await seedDatabaseIfEmpty();
  }
  const status = await getDatabaseStatus();
  return { success: ok, status };
}

// -------------------------------------------------------------
// Bidirectional Data Migration: Files <-> Database
// -------------------------------------------------------------

// Inspect current flat JSON files in data/ directory
export async function getFileStorageStats(): Promise<FileStorageStats> {
  let projectsCount = 0;
  let updatesCount = 0;
  let scorecardsCount = 0;
  const hasSettings = fs.existsSync(SETTINGS_FILE);

  try {
    if (fs.existsSync(PROJECTS_DIR)) {
      const pDirs = await fsp.readdir(PROJECTS_DIR);
      for (const pd of pDirs) {
        const pFile = path.join(PROJECTS_DIR, pd, 'project.json');
        if (fs.existsSync(pFile)) {
          projectsCount++;
        }
        const uDir = path.join(PROJECTS_DIR, pd, 'updates');
        if (fs.existsSync(uDir)) {
          const uFiles = await fsp.readdir(uDir);
          for (const uf of uFiles) {
            if (uf.endsWith('.json')) {
              updatesCount++;
            }
          }
        }
        const scDir = path.join(PROJECTS_DIR, pd, 'scorecards');
        if (fs.existsSync(scDir)) {
          const scFiles = await fsp.readdir(scDir);
          for (const sf of scFiles) {
            if (sf.endsWith('.json')) {
              scorecardsCount++;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Database] Error checking file storage stats:', err);
  }

  return {
    projectsCount,
    updatesCount,
    scorecardsCount,
    hasSettings,
    storagePath: 'data/projects',
  };
}

// Direction 1: Migrate flat JSON files INTO the active database
export async function migrateFilesToDatabase(): Promise<MigrationResult> {
  const start = Date.now();
  const logs: string[] = [];
  let projectsCount = 0;
  let updatesCount = 0;
  let scorecardsCount = 0;
  let settingsCount = 0;

  try {
    let sourceProjects: Project[] = [];
    let sourceUpdates: WeeklyUpdate[] = [];
    let sourceScorecards: Scorecard[] = [];

    if (fs.existsSync(PROJECTS_DIR)) {
      const pDirs = await fsp.readdir(PROJECTS_DIR);
      for (const pd of pDirs) {
        const pFile = path.join(PROJECTS_DIR, pd, 'project.json');
        if (fs.existsSync(pFile)) {
          try {
            const parsed = JSON.parse(await fsp.readFile(pFile, 'utf8'));
            if (parsed?.id) sourceProjects.push(parsed);
          } catch (e: any) {
            logs.push(`Warning: Could not parse ${pFile}: ${e.message}`);
          }
        }
        const uDir = path.join(PROJECTS_DIR, pd, 'updates');
        if (fs.existsSync(uDir)) {
          const uFiles = await fsp.readdir(uDir);
          for (const uf of uFiles) {
            if (uf.endsWith('.json')) {
              try {
                const parsed = JSON.parse(await fsp.readFile(path.join(uDir, uf), 'utf8'));
                if (parsed?.id) sourceUpdates.push(parsed);
              } catch (e: any) {
                logs.push(`Warning: Could not parse ${uf}: ${e.message}`);
              }
            }
          }
        }
        const scDir = path.join(PROJECTS_DIR, pd, 'scorecards');
        if (fs.existsSync(scDir)) {
          const scFiles = await fsp.readdir(scDir);
          for (const sf of scFiles) {
            if (sf.endsWith('.json')) {
              try {
                const parsed = JSON.parse(await fsp.readFile(path.join(scDir, sf), 'utf8'));
                if (parsed?.id) sourceScorecards.push(parsed);
              } catch (e: any) {
                logs.push(`Warning: Could not parse ${sf}: ${e.message}`);
              }
            }
          }
        }
      }
    }

    if (sourceProjects.length === 0) {
      logs.push('No project files found in data/projects/, using standard initial dataset.');
      sourceProjects = INITIAL_PROJECTS;
      sourceUpdates = INITIAL_UPDATES;
    }

    // Insert projects into active database
    for (const p of sourceProjects) {
      await saveProject(p);
      projectsCount++;
    }
    logs.push(`Imported ${projectsCount} project(s) into database table [projects].`);

    // Insert weekly updates into active database
    for (const u of sourceUpdates) {
      await saveWeeklyUpdate(u);
      updatesCount++;
    }
    logs.push(`Imported ${updatesCount} weekly update(s) into database table [weekly_updates].`);

    // Insert scorecards into active database
    for (const sc of sourceScorecards) {
      await saveScorecard(sc);
      scorecardsCount++;
    }
    if (scorecardsCount > 0) {
      logs.push(`Imported ${scorecardsCount} scorecard(s) into database table [scorecards].`);
    }

    // Settings
    let settings = { products: DEFAULT_PRODUCTS, geos: DEFAULT_GEOS, projectTypes: DEFAULT_PROJECT_TYPES };
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        const parsed = JSON.parse(await fsp.readFile(SETTINGS_FILE, 'utf8'));
        if (parsed) settings = { ...settings, ...parsed };
      } catch {}
    }
    await saveSettings(settings);
    settingsCount = (settings.products?.length || 0) + (settings.geos?.length || 0) + (settings.projectTypes?.length || 0);
    logs.push(`Imported master settings into database table [settings] (${settingsCount} total entries).`);

    const durationMs = Date.now() - start;
    return {
      success: true,
      direction: 'files_to_db',
      projectsCount,
      updatesCount,
      settingsCount,
      engine: currentConfig.engine,
      message: `Successfully imported ${projectsCount} projects, ${updatesCount} weekly updates, ${scorecardsCount} scorecards, and master data from flat JSON files into ${currentConfig.engine.toUpperCase()} database in ${durationMs}ms.`,
      logs,
      durationMs,
    };
  } catch (err: any) {
    return {
      success: false,
      direction: 'files_to_db',
      projectsCount,
      updatesCount,
      settingsCount,
      engine: currentConfig.engine,
      message: `Migration from files to database failed: ${err.message}`,
      logs: [...logs, `Error: ${err.message}`],
      durationMs: Date.now() - start,
      error: err.message,
    };
  }
}

// Direction 2: Migrate active database records OUT TO flat JSON files
export async function migrateDatabaseToFiles(createBackup = true): Promise<MigrationResult> {
  const start = Date.now();
  const logs: string[] = [];
  let projectsCount = 0;
  let updatesCount = 0;
  let scorecardsCount = 0;
  let settingsCount = 0;

  try {
    ensureDataDir();

    // 1. Create a timestamped backup of current data directory if requested
    if (createBackup && fs.existsSync(PROJECTS_DIR)) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(DATA_DIR, 'backups', `backup-${timestamp}`);
        await fsp.mkdir(backupDir, { recursive: true });

        // Copy existing settings.json if present
        if (fs.existsSync(SETTINGS_FILE)) {
          await fsp.copyFile(SETTINGS_FILE, path.join(backupDir, 'settings.json'));
        }

        // Copy project files
        const pDirs = await fsp.readdir(PROJECTS_DIR);
        for (const pd of pDirs) {
          const srcProjDir = path.join(PROJECTS_DIR, pd);
          const stat = await fsp.stat(srcProjDir);
          if (stat.isDirectory()) {
            const destProjDir = path.join(backupDir, 'projects', pd);
            await fsp.mkdir(destProjDir, { recursive: true });
            const pFile = path.join(srcProjDir, 'project.json');
            if (fs.existsSync(pFile)) {
              await fsp.copyFile(pFile, path.join(destProjDir, 'project.json'));
            }
            const uDir = path.join(srcProjDir, 'updates');
            if (fs.existsSync(uDir)) {
              const destUDir = path.join(destProjDir, 'updates');
              await fsp.mkdir(destUDir, { recursive: true });
              const uFiles = await fsp.readdir(uDir);
              for (const uf of uFiles) {
                if (uf.endsWith('.json')) {
                  await fsp.copyFile(path.join(uDir, uf), path.join(destUDir, uf));
                }
              }
            }
            const scDir = path.join(srcProjDir, 'scorecards');
            if (fs.existsSync(scDir)) {
              const destScDir = path.join(destProjDir, 'scorecards');
              await fsp.mkdir(destScDir, { recursive: true });
              const scFiles = await fsp.readdir(scDir);
              for (const sf of scFiles) {
                if (sf.endsWith('.json')) {
                  await fsp.copyFile(path.join(scDir, sf), path.join(destScDir, sf));
                }
              }
            }
          }
        }
        logs.push(`Created safety backup of existing flat files in: data/backups/backup-${timestamp}`);
      } catch (backupErr: any) {
        logs.push(`Warning: Safety backup skipped: ${backupErr.message}`);
      }
    }

    // 2. Fetch all data from active database
    const [dbProjects, dbUpdates, dbSettings, dbScorecards] = await Promise.all([
      getAllProjects(),
      getAllWeeklyUpdates(),
      getSettings(),
      listScorecards(),
    ]);

    // 3. Write projects to data/projects/<id>/project.json
    for (const project of dbProjects) {
      const projectDir = path.join(PROJECTS_DIR, project.id);
      const updatesDir = path.join(projectDir, 'updates');
      await fsp.mkdir(updatesDir, { recursive: true });
      await writeJsonFile(path.join(projectDir, 'project.json'), project);
      projectsCount++;
    }
    logs.push(`Exported ${projectsCount} project(s) from database to data/projects/ directories.`);

    // 4. Write weekly updates to data/projects/<projectId>/updates/<updateId>.json
    for (const update of dbUpdates) {
      const updatesDir = path.join(PROJECTS_DIR, update.projectId, 'updates');
      await fsp.mkdir(updatesDir, { recursive: true });
      await writeJsonFile(path.join(updatesDir, `${update.id}.json`), update);
      updatesCount++;
    }
    logs.push(`Exported ${updatesCount} weekly update(s) from database to data/projects/*/updates/ files.`);

    // 5. Write scorecards to data/projects/<projectId>/scorecards/<scorecardId>.json
    for (const sc of dbScorecards) {
      const scDir = path.join(PROJECTS_DIR, sc.projectId, 'scorecards');
      await fsp.mkdir(scDir, { recursive: true });
      await writeJsonFile(path.join(scDir, `${sc.id}.json`), sc);
      scorecardsCount++;
    }
    if (scorecardsCount > 0) {
      logs.push(`Exported ${scorecardsCount} scorecard(s) from database to data/projects/*/scorecards/ files.`);
    }

    // 6. Write master settings to data/settings.json
    await writeJsonFile(SETTINGS_FILE, dbSettings);
    settingsCount = (dbSettings.products?.length || 0) + (dbSettings.geos?.length || 0) + (dbSettings.projectTypes?.length || 0);
    logs.push(`Exported master settings to data/settings.json (${settingsCount} total entries).`);

    const durationMs = Date.now() - start;
    return {
      success: true,
      direction: 'db_to_files',
      projectsCount,
      updatesCount,
      settingsCount,
      engine: currentConfig.engine,
      message: `Successfully exported ${projectsCount} projects, ${updatesCount} weekly updates, ${scorecardsCount} scorecards, and master data from ${currentConfig.engine.toUpperCase()} database to flat JSON files in ${durationMs}ms.`,
      logs,
      durationMs,
    };
  } catch (err: any) {
    return {
      success: false,
      direction: 'db_to_files',
      projectsCount,
      updatesCount,
      settingsCount,
      engine: currentConfig.engine,
      message: `Export from database to files failed: ${err.message}`,
      logs: [...logs, `Error: ${err.message}`],
      durationMs: Date.now() - start,
      error: err.message,
    };
  }
}

// Backward-compatible alias
export const migrateDataToActiveDatabase = migrateFilesToDatabase;

export function getCurrentConfig(): DatabaseConfig {
  return { ...currentConfig, password: currentConfig.password ? '••••••••' : '' };
}

// -------------------------------------------------------------
// Scorecards Persistence (SQLite, PostgreSQL, MS SQL, JSON Files)
// -------------------------------------------------------------

async function getScorecardsFromFiles(): Promise<Scorecard[]> {
  const scorecards: Scorecard[] = [];
  try {
    if (fs.existsSync(PROJECTS_DIR)) {
      const pDirs = await fsp.readdir(PROJECTS_DIR);
      for (const pd of pDirs) {
        const scDir = path.join(PROJECTS_DIR, pd, 'scorecards');
        if (fs.existsSync(scDir)) {
          const scFiles = await fsp.readdir(scDir);
          for (const sf of scFiles) {
            if (sf.endsWith('.json')) {
              try {
                const parsed = JSON.parse(await fsp.readFile(path.join(scDir, sf), 'utf8'));
                if (parsed?.id) scorecards.push(parsed);
              } catch {}
            }
          }
        }
      }
    }
  } catch {}
  return scorecards;
}

export async function listScorecards(filter?: {
  projectId?: string;
  templateId?: string;
  fromKey?: string;
  toKey?: string;
  status?: string;
}): Promise<Scorecard[]> {
  let scorecards: Scorecard[] = [];

  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    let sqlQuery = 'SELECT payload FROM scorecards WHERE 1=1';
    const params: any[] = [];
    if (filter?.projectId) {
      sqlQuery += ' AND project_id = ?';
      params.push(filter.projectId);
    }
    if (filter?.templateId) {
      sqlQuery += ' AND template_id = ?';
      params.push(filter.templateId);
    }
    if (filter?.status) {
      sqlQuery += ' AND status = ?';
      params.push(filter.status);
    }
    sqlQuery += ' ORDER BY period_year ASC, period_week ASC';
    const stmt = sqliteInstance.prepare(sqlQuery);
    const rows = stmt.all(...params) as any[];
    scorecards = rows.map((r) => JSON.parse(r.payload));
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    let sqlQuery = 'SELECT payload FROM scorecards WHERE 1=1';
    const params: any[] = [];
    let pIdx = 1;
    if (filter?.projectId) {
      sqlQuery += ` AND project_id = $${pIdx++}`;
      params.push(filter.projectId);
    }
    if (filter?.templateId) {
      sqlQuery += ` AND template_id = $${pIdx++}`;
      params.push(filter.templateId);
    }
    if (filter?.status) {
      sqlQuery += ` AND status = $${pIdx++}`;
      params.push(filter.status);
    }
    sqlQuery += ' ORDER BY period_year ASC, period_week ASC';
    const res = await pgPoolInstance.query(sqlQuery, params);
    scorecards = res.rows.map((r: any) => JSON.parse(r.payload));
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const req = mssqlPoolInstance.request();
    let sqlQuery = 'SELECT payload FROM scorecards WHERE 1=1';
    if (filter?.projectId) {
      sqlQuery += ' AND project_id = @projectId';
      req.input('projectId', sql.NVarChar(64), filter.projectId);
    }
    if (filter?.templateId) {
      sqlQuery += ' AND template_id = @templateId';
      req.input('templateId', sql.NVarChar(20), filter.templateId);
    }
    if (filter?.status) {
      sqlQuery += ' AND status = @status';
      req.input('status', sql.NVarChar(10), filter.status);
    }
    sqlQuery += ' ORDER BY period_year ASC, period_week ASC';
    const res = await req.query(sqlQuery);
    scorecards = res.recordset.map((r: any) => JSON.parse(r.payload));
  } else {
    // Files fallback
    scorecards = await getScorecardsFromFiles();
    if (filter?.projectId) {
      scorecards = scorecards.filter((s) => s.projectId === filter.projectId);
    }
    if (filter?.templateId) {
      scorecards = scorecards.filter((s) => s.templateId === filter.templateId);
    }
    if (filter?.status) {
      scorecards = scorecards.filter((s) => s.status === filter.status);
    }
  }

  // Filter by periodKey fromKey and toKey if provided
  if (filter?.fromKey) {
    scorecards = scorecards.filter(
      (s) => periodKey(s.periodYear, s.periodWeek) >= filter.fromKey!
    );
  }
  if (filter?.toKey) {
    scorecards = scorecards.filter(
      (s) => periodKey(s.periodYear, s.periodWeek) <= filter.toKey!
    );
  }

  scorecards.sort((a, b) =>
    comparePeriods(
      { year: a.periodYear, week: a.periodWeek },
      { year: b.periodYear, week: b.periodWeek }
    )
  );

  return scorecards;
}

export async function getScorecard(id: string): Promise<Scorecard | null> {
  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare('SELECT payload FROM scorecards WHERE id = ?');
    const row = stmt.get(id) as any;
    if (row?.payload) {
      try {
        return JSON.parse(row.payload);
      } catch {}
    }
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    const res = await pgPoolInstance.query('SELECT payload FROM scorecards WHERE id = $1', [id]);
    if (res.rows[0]?.payload) {
      try {
        return JSON.parse(res.rows[0].payload);
      } catch {}
    }
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const res = await mssqlPoolInstance
      .request()
      .input('id', sql.NVarChar(64), id)
      .query('SELECT payload FROM scorecards WHERE id = @id');
    if (res.recordset[0]?.payload) {
      try {
        return JSON.parse(res.recordset[0].payload);
      } catch {}
    }
  }

  // Files fallback
  try {
    if (fs.existsSync(PROJECTS_DIR)) {
      const pDirs = await fsp.readdir(PROJECTS_DIR);
      for (const pd of pDirs) {
        const file = path.join(PROJECTS_DIR, pd, 'scorecards', `${id}.json`);
        if (fs.existsSync(file)) {
          const content = await fsp.readFile(file, 'utf8');
          return JSON.parse(content);
        }
      }
    }
  } catch {}

  return null;
}

export async function saveScorecard(sc: Scorecard): Promise<void> {
  const createdAt = sc.createdAt || new Date().toISOString();
  const updatedAt = sc.updatedAt || new Date().toISOString();
  const templateVersion = sc.templateVersion || 1;
  const overallRag = sc.computed?.overallRag || null;
  const overallValue = sc.computed?.overallValue ?? null;
  const normalizedPct = sc.computed?.normalizedPct ?? null;
  const payload = JSON.stringify(sc, null, 2);

  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare(`
      INSERT INTO scorecards (
        id, project_id, template_id, template_version, period_year, period_week,
        period_label, assessment_date, assessor, status, overall_rag, overall_value,
        normalized_pct, payload, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        project_id = excluded.project_id,
        template_id = excluded.template_id,
        template_version = excluded.template_version,
        period_year = excluded.period_year,
        period_week = excluded.period_week,
        period_label = excluded.period_label,
        assessment_date = excluded.assessment_date,
        assessor = excluded.assessor,
        status = excluded.status,
        overall_rag = excluded.overall_rag,
        overall_value = excluded.overall_value,
        normalized_pct = excluded.normalized_pct,
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      sc.id,
      sc.projectId,
      sc.templateId,
      templateVersion,
      sc.periodYear,
      sc.periodWeek,
      sc.periodLabel,
      sc.assessmentDate || null,
      sc.assessor || null,
      sc.status,
      overallRag,
      overallValue,
      normalizedPct,
      payload,
      createdAt,
      updatedAt
    );
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    await pgPoolInstance.query(
      `
      INSERT INTO scorecards (
        id, project_id, template_id, template_version, period_year, period_week,
        period_label, assessment_date, assessor, status, overall_rag, overall_value,
        normalized_pct, payload, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        project_id = EXCLUDED.project_id,
        template_id = EXCLUDED.template_id,
        template_version = EXCLUDED.template_version,
        period_year = EXCLUDED.period_year,
        period_week = EXCLUDED.period_week,
        period_label = EXCLUDED.period_label,
        assessment_date = EXCLUDED.assessment_date,
        assessor = EXCLUDED.assessor,
        status = EXCLUDED.status,
        overall_rag = EXCLUDED.overall_rag,
        overall_value = EXCLUDED.overall_value,
        normalized_pct = EXCLUDED.normalized_pct,
        payload = EXCLUDED.payload,
        updated_at = EXCLUDED.updated_at
      `,
      [
        sc.id,
        sc.projectId,
        sc.templateId,
        templateVersion,
        sc.periodYear,
        sc.periodWeek,
        sc.periodLabel,
        sc.assessmentDate || null,
        sc.assessor || null,
        sc.status,
        overallRag,
        overallValue,
        normalizedPct,
        payload,
        createdAt,
        updatedAt,
      ]
    );
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const req = mssqlPoolInstance.request();
    req.input('id', sql.NVarChar(64), sc.id);
    req.input('projectId', sql.NVarChar(64), sc.projectId);
    req.input('templateId', sql.NVarChar(20), sc.templateId);
    req.input('templateVersion', sql.Int, templateVersion);
    req.input('periodYear', sql.Int, sc.periodYear);
    req.input('periodWeek', sql.Int, sc.periodWeek);
    req.input('periodLabel', sql.NVarChar(40), sc.periodLabel);
    req.input('assessmentDate', sql.NVarChar(10), sc.assessmentDate || null);
    req.input('assessor', sql.NVarChar(120), sc.assessor || null);
    req.input('status', sql.NVarChar(10), sc.status);
    req.input('overallRag', sql.NVarChar(1), overallRag);
    req.input('overallValue', sql.Decimal(6, 3), overallValue);
    req.input('normalizedPct', sql.Decimal(5, 1), normalizedPct);
    req.input('payload', sql.NVarChar(sql.MAX), payload);
    req.input('createdAt', sql.NVarChar(30), createdAt);
    req.input('updatedAt', sql.NVarChar(30), updatedAt);

    await req.query(`
      IF EXISTS (SELECT 1 FROM scorecards WHERE id = @id)
        UPDATE scorecards SET
          project_id = @projectId,
          template_id = @templateId,
          template_version = @templateVersion,
          period_year = @periodYear,
          period_week = @periodWeek,
          period_label = @periodLabel,
          assessment_date = @assessmentDate,
          assessor = @assessor,
          status = @status,
          overall_rag = @overallRag,
          overall_value = @overallValue,
          normalized_pct = @normalizedPct,
          payload = @payload,
          updated_at = @updatedAt
        WHERE id = @id
      ELSE
        INSERT INTO scorecards (
          id, project_id, template_id, template_version, period_year, period_week,
          period_label, assessment_date, assessor, status, overall_rag, overall_value,
          normalized_pct, payload, created_at, updated_at
        ) VALUES (
          @id, @projectId, @templateId, @templateVersion, @periodYear, @periodWeek,
          @periodLabel, @assessmentDate, @assessor, @status, @overallRag, @overallValue,
          @normalizedPct, @payload, @createdAt, @updatedAt
        )
    `);
  }

  // File system dual-write / backup sync
  try {
    const scDir = path.join(PROJECTS_DIR, sc.projectId, 'scorecards');
    if (!fs.existsSync(scDir)) {
      await fsp.mkdir(scDir, { recursive: true });
    }
    await writeJsonFile(path.join(scDir, `${sc.id}.json`), sc);
  } catch (e: any) {
    console.warn(`[Storage] Failed to sync scorecard to file: ${e.message}`);
  }
}

export async function deleteScorecard(id: string): Promise<boolean> {
  let deleted = false;
  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    sqliteInstance.prepare('DELETE FROM scorecards WHERE id = ?').run(id);
    deleted = true;
  } else if (pgPoolInstance && currentConfig.engine === 'postgres') {
    await pgPoolInstance.query('DELETE FROM scorecards WHERE id = $1', [id]);
    deleted = true;
  } else if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    await mssqlPoolInstance
      .request()
      .input('id', sql.NVarChar(64), id)
      .query('DELETE FROM scorecards WHERE id = @id');
    deleted = true;
  }

  // Delete from file system
  try {
    if (fs.existsSync(PROJECTS_DIR)) {
      const pDirs = await fsp.readdir(PROJECTS_DIR);
      for (const pd of pDirs) {
        const file = path.join(PROJECTS_DIR, pd, 'scorecards', `${id}.json`);
        if (fs.existsSync(file)) {
          await fsp.unlink(file);
          deleted = true;
        }
      }
    }
  } catch {}

  return deleted;
}

export async function getSubmittedScorecardSummaries(): Promise<ScorecardSummary[]> {
  if (sqliteInstance && currentConfig.engine === 'sqlite') {
    const stmt = sqliteInstance.prepare(`
      SELECT id, project_id, template_id, period_year, period_week, period_label, status, overall_rag, overall_value, normalized_pct, assessment_date, assessor
      FROM scorecards
      WHERE status = 'submitted'
      ORDER BY period_year ASC, period_week ASC
    `);
    const rows = stmt.all() as any[];
    return rows.map((r) => ({
      id: r.id,
      projectId: r.project_id,
      templateId: r.template_id,
      periodYear: Number(r.period_year),
      periodWeek: Number(r.period_week),
      periodLabel: r.period_label,
      status: r.status,
      overallRag: r.overall_rag || null,
      overallValue: r.overall_value !== null && r.overall_value !== undefined ? Number(r.overall_value) : null,
      normalizedPct: r.normalized_pct !== null && r.normalized_pct !== undefined ? Number(r.normalized_pct) : null,
      assessmentDate: r.assessment_date || '',
      assessor: r.assessor || '',
    }));
  }

  if (pgPoolInstance && currentConfig.engine === 'postgres') {
    const res = await pgPoolInstance.query(`
      SELECT id, project_id, template_id, period_year, period_week, period_label, status, overall_rag, overall_value, normalized_pct, assessment_date, assessor
      FROM scorecards
      WHERE status = 'submitted'
      ORDER BY period_year ASC, period_week ASC
    `);
    return res.rows.map((r: any) => ({
      id: r.id,
      projectId: r.project_id,
      templateId: r.template_id,
      periodYear: Number(r.period_year),
      periodWeek: Number(r.period_week),
      periodLabel: r.period_label,
      status: r.status,
      overallRag: r.overall_rag || null,
      overallValue: r.overall_value !== null && r.overall_value !== undefined ? Number(r.overall_value) : null,
      normalizedPct: r.normalized_pct !== null && r.normalized_pct !== undefined ? Number(r.normalized_pct) : null,
      assessmentDate: r.assessment_date || '',
      assessor: r.assessor || '',
    }));
  }

  if (mssqlPoolInstance && currentConfig.engine === 'mssql') {
    const res = await mssqlPoolInstance.request().query(`
      SELECT id, project_id, template_id, period_year, period_week, period_label, status, overall_rag, overall_value, normalized_pct, assessment_date, assessor
      FROM scorecards
      WHERE status = 'submitted'
      ORDER BY period_year ASC, period_week ASC
    `);
    return res.recordset.map((r: any) => ({
      id: r.id,
      projectId: r.project_id,
      templateId: r.template_id,
      periodYear: Number(r.period_year),
      periodWeek: Number(r.period_week),
      periodLabel: r.period_label,
      status: r.status,
      overallRag: r.overall_rag || null,
      overallValue: r.overall_value !== null && r.overall_value !== undefined ? Number(r.overall_value) : null,
      normalizedPct: r.normalized_pct !== null && r.normalized_pct !== undefined ? Number(r.normalized_pct) : null,
      assessmentDate: r.assessment_date || '',
      assessor: r.assessor || '',
    }));
  }

  // Fallback to files
  const filesSc = await getScorecardsFromFiles();
  return filesSc
    .filter((s) => s.status === 'submitted')
    .map((s) => ({
      id: s.id,
      projectId: s.projectId,
      templateId: s.templateId,
      periodYear: s.periodYear,
      periodWeek: s.periodWeek,
      periodLabel: s.periodLabel,
      status: s.status,
      overallRag: s.computed?.overallRag || null,
      overallValue: s.computed?.overallValue ?? null,
      normalizedPct: s.computed?.normalizedPct ?? null,
      assessmentDate: s.assessmentDate || '',
      assessor: s.assessor || '',
    }));
}

export async function recalculateAllScorecards(): Promise<{ updated: number }> {
  const settings = await getSettings();
  const scorecards = await listScorecards({});
  let count = 0;
  for (const sc of scorecards) {
    const recalculated = computeScorecard(
      sc.templateId,
      sc.items,
      settings.scoringSettings
    );
    sc.computed = recalculated;
    sc.updatedAt = new Date().toISOString();
    await saveScorecard(sc);
    count++;
  }
  return { updated: count };
}



