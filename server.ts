import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import http from "http";
import https from "https";
import { createServer as createViteServer } from "vite";
import { Project, WeeklyUpdate, DatabaseConfig, Scorecard, ScorecardTemplateId } from "./src/types";
import {
  loadSavedConfig,
  connectDatabase,
  seedDatabaseIfEmpty,
  getAllApplicationData,
  getAllProjects,
  saveProject,
  deleteProject,
  saveWeeklyUpdate,
  deleteWeeklyUpdate,
  listScorecards,
  getScorecard,
  saveScorecard,
  deleteScorecard,
  getSettings,
  saveSettings,
  resetSettings,
  testConnection,
  updateDatabaseConfig,
  getDatabaseStatus,
  migrateDataToActiveDatabase,
  getCurrentConfig,
  createTableStructures,
  getDdlScripts,
  getFileStorageStats,
  migrateFilesToDatabase,
  migrateDatabaseToFiles,
  recalculateAllScorecards,
} from "./src/server/database";
import { runScoringSelfTest } from "./src/scoring/selftest";
import { SCORECARD_TEMPLATES } from "./src/scoring/templates";
import { computeScorecard, validateForSubmit, DEFAULT_SCORING_SETTINGS } from "./src/scoring/engine";
import { periodKey, periodLabel } from "./src/scoring/period";
import multer from "multer";
import { processScorecardsImport } from "./src/server/scorecardImport";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
});

const app = express();
const PORT = Number(process.env.APP_PORT || process.env.DEFAULT_APP_PORT) || 3000;

app.enable("trust proxy");

// Prevent browsers and proxies from caching any redirect or stale response
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(express.json());

// Health check endpoint
app.get("/api/health", async (_req, res) => {
  const status = await getDatabaseStatus();
  res.json({
    status: status.connected ? "ok" : "degraded",
    storage: "database",
    engine: status.engine,
    connected: status.connected,
  });
});

// GET all application data from active database
app.get("/api/data", async (_req, res) => {
  try {
    const data = await getAllApplicationData();
    res.json(data);
  } catch (err: any) {
    console.error("[API] Error reading database data:", err);
    res.status(500).json({ error: err.message || "Failed to load database data" });
  }
});

// POST create project -> saves to database
app.post("/api/projects", async (req, res) => {
  try {
    const project: Project = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    await saveProject(project);
    res.json({ success: true, project });
  } catch (err: any) {
    console.error("[API] Error creating project in database:", err);
    res.status(500).json({ error: err.message || "Failed to save project" });
  }
});

// PUT update project -> updates in database
app.put("/api/projects/:id", async (req, res) => {
  try {
    const project: Project = req.body;
    if (!project || !project.id) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    await saveProject(project);
    res.json({ success: true, project });
  } catch (err: any) {
    console.error("[API] Error updating project in database:", err);
    res.status(500).json({ error: err.message || "Failed to update project" });
  }
});

// DELETE project -> deletes from database
app.delete("/api/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    await deleteProject(projectId);
    res.json({ success: true, message: `Project ${projectId} deleted` });
  } catch (err: any) {
    console.error("[API] Error deleting project from database:", err);
    res.status(500).json({ error: err.message || "Failed to delete project" });
  }
});

// POST create weekly update -> saves to database
app.post("/api/updates", async (req, res) => {
  try {
    const update: WeeklyUpdate = req.body;
    if (!update || !update.id || !update.projectId) {
      return res.status(400).json({ error: "Update ID and Project ID are required" });
    }
    await saveWeeklyUpdate(update);
    res.json({ success: true, update });
  } catch (err: any) {
    console.error("[API] Error creating update in database:", err);
    res.status(500).json({ error: err.message || "Failed to save weekly update" });
  }
});

// PUT update weekly update -> updates in database
app.put("/api/updates/:id", async (req, res) => {
  try {
    const update: WeeklyUpdate = req.body;
    if (!update || !update.id) {
      return res.status(400).json({ error: "Update ID is required" });
    }
    await saveWeeklyUpdate(update);
    res.json({ success: true, update });
  } catch (err: any) {
    console.error("[API] Error updating weekly update in database:", err);
    res.status(500).json({ error: err.message || "Failed to update status update" });
  }
});

// DELETE weekly update -> deletes from database
app.delete("/api/updates/:id", async (req, res) => {
  try {
    const updateId = req.params.id;
    const deleted = await deleteWeeklyUpdate(updateId);
    res.json({ success: true, deleted });
  } catch (err: any) {
    console.error("[API] Error deleting weekly update from database:", err);
    res.status(500).json({ error: err.message || "Failed to delete weekly update" });
  }
});

// ---------------------------------------------------------------------------
// Scorecard API Endpoints
// ---------------------------------------------------------------------------

// GET list scorecards with optional filters
app.get("/api/scorecards", async (req, res) => {
  try {
    const { projectId, templateId, from, to, status } = req.query;
    const scorecards = await listScorecards({
      projectId: projectId ? String(projectId) : undefined,
      templateId: templateId ? String(templateId) : undefined,
      fromKey: from ? String(from) : undefined,
      toKey: to ? String(to) : undefined,
      status: status ? String(status) : undefined,
    });
    res.json(scorecards);
  } catch (err: any) {
    console.error("[API] Error listing scorecards:", err);
    res.status(500).json({ error: err.message || "Failed to list scorecards" });
  }
});

// GET trend metrics for submitted scorecards (Registered BEFORE /api/scorecards/:id)
app.get("/api/scorecards/trend", async (req, res) => {
  try {
    const { projectId, templateId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: "projectId query param is required" });
    }
    const scorecards = await listScorecards({
      projectId: String(projectId),
      templateId: templateId ? String(templateId) : undefined,
      status: "submitted",
    });

    const trend = scorecards.map((sc) => ({
      periodKey: periodKey(sc.periodYear, sc.periodWeek),
      periodLabel: sc.periodLabel,
      overallRag: sc.computed?.overallRag || null,
      overallValue: sc.computed?.overallValue ?? null,
      normalizedPct: sc.computed?.normalizedPct ?? null,
      categories: sc.computed?.categories || {},
      parts: sc.computed?.parts || undefined,
    }));

    res.json(trend);
  } catch (err: any) {
    console.error("[API] Error fetching scorecard trend:", err);
    res.status(500).json({ error: err.message || "Failed to fetch scorecard trend" });
  }
});

// POST import scorecards from Excel (.xlsx / .xlsm)
app.post("/api/scorecards/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Excel file is required" });
    }

    const { projectId, templateId, year, mode, onDuplicate } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }
    if (templateId !== "SWE_MODEL" && templateId !== "ORS_RAG") {
      return res.status(400).json({ error: "Valid templateId (SWE_MODEL or ORS_RAG) is required" });
    }

    const yr = year ? parseInt(String(year), 10) : undefined;
    const importMode = mode === "commit" ? "commit" : "preview";
    const duplicateHandling = onDuplicate === "overwrite" ? "overwrite" : "skip";

    const settings = await getSettings();
    const scoringSettings = settings.scoringSettings;

    const result = await processScorecardsImport(
      req.file.buffer,
      String(projectId),
      templateId,
      yr,
      importMode,
      duplicateHandling,
      scoringSettings
    );

    res.json(result);
  } catch (err: any) {
    console.error("[API] Error importing scorecards:", err);
    res.status(500).json({ error: err.message || "Failed to import scorecards" });
  }
});

// GET single scorecard by ID
app.get("/api/scorecards/:id", async (req, res) => {
  try {
    const sc = await getScorecard(req.params.id);
    if (!sc) {
      return res.status(404).json({ error: "Scorecard not found" });
    }
    res.json(sc);
  } catch (err: any) {
    console.error("[API] Error fetching scorecard:", err);
    res.status(500).json({ error: err.message || "Failed to fetch scorecard" });
  }
});

// POST create scorecard
app.post("/api/scorecards", async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(400).json({ error: "Request body is required" });
    }

    // 1. Validate projectId exists
    const projects = await getAllProjects();
    const project = projects.find((p) => p.id === body.projectId);
    if (!project) {
      return res.status(400).json({ error: "Project not found" });
    }

    // 2. Validate templateId valid
    if (body.templateId !== "SWE_MODEL" && body.templateId !== "ORS_RAG") {
      return res.status(400).json({ error: "Invalid templateId" });
    }

    // 3. Validate period present
    const year = Number(body.periodYear);
    const week = Number(body.periodWeek);
    if (!year || !week || isNaN(year) || isNaN(week) || week < 1 || week > 53) {
      return res.status(400).json({ error: "Valid periodYear and periodWeek are required" });
    }

    // Deterministic ID: "sc-<projectId>-<templateId>-<year>-W<week>"
    const id = `sc-${body.projectId}-${body.templateId}-${year}-W${week}`;

    // Duplicate project+template+period -> 409
    const existing = await getScorecard(id);
    if (existing) {
      return res.status(409).json({
        error: "A scorecard for this project, role and week already exists",
        existingId: existing.id,
      });
    }

    const template = SCORECARD_TEMPLATES[body.templateId as ScorecardTemplateId];
    const templateVersion = template ? template.version : 1;
    const label = periodLabel(year, week);
    const now = new Date().toISOString();
    const items = Array.isArray(body.items) ? body.items : [];

    // Always recompute computed with current ScoringSettings
    const currentSettings = await getSettings();
    const computed = computeScorecard(body.templateId, items, currentSettings.scoringSettings);
    const status = body.status === "submitted" ? "submitted" : "draft";

    const sc: Scorecard = {
      id,
      projectId: body.projectId,
      templateId: body.templateId,
      templateVersion,
      periodYear: year,
      periodWeek: week,
      periodLabel: label,
      assessmentDate: body.assessmentDate || "",
      assessor: body.assessor || "",
      status,
      header: body.header || {},
      items,
      computed,
      createdAt: now,
      updatedAt: now,
      lastEditedBy: body.lastEditedBy || body.assessor || undefined,
    };

    if (status === "submitted") {
      const errors = validateForSubmit(sc);
      if (errors.length > 0) {
        return res.status(400).json({ error: "Scorecard validation failed", details: errors });
      }
      sc.submittedAt = now;
    }

    await saveScorecard(sc);
    res.status(201).json({ success: true, scorecard: sc });
  } catch (err: any) {
    console.error("[API] Error creating scorecard:", err);
    res.status(500).json({ error: err.message || "Failed to create scorecard" });
  }
});

// PUT update scorecard
app.put("/api/scorecards/:id", async (req, res) => {
  try {
    const existing = await getScorecard(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Scorecard not found" });
    }

    const body = req.body;
    if (!body) {
      return res.status(400).json({ error: "Request body is required" });
    }

    const projectId = body.projectId || existing.projectId;
    const templateId = (body.templateId || existing.templateId) as ScorecardTemplateId;
    if (templateId !== "SWE_MODEL" && templateId !== "ORS_RAG") {
      return res.status(400).json({ error: "Invalid templateId" });
    }

    const year = Number(body.periodYear !== undefined ? body.periodYear : existing.periodYear);
    const week = Number(body.periodWeek !== undefined ? body.periodWeek : existing.periodWeek);
    if (!year || !week || isNaN(year) || isNaN(week) || week < 1 || week > 53) {
      return res.status(400).json({ error: "Valid periodYear and periodWeek are required" });
    }

    const newId = `sc-${projectId}-${templateId}-${year}-W${week}`;

    // Changing period onto an existing one -> 409
    if (newId !== existing.id) {
      const duplicate = await getScorecard(newId);
      if (duplicate) {
        return res.status(409).json({
          error: "A scorecard for this project, role and week already exists",
          existingId: newId,
        });
      }
      await deleteScorecard(existing.id);
    }

    const template = SCORECARD_TEMPLATES[templateId];
    const templateVersion = template ? template.version : existing.templateVersion;
    const label = periodLabel(year, week);
    const now = new Date().toISOString();
    const items = Array.isArray(body.items) ? body.items : existing.items;

    // Always recompute
    const currentSettings = await getSettings();
    const computed = computeScorecard(templateId, items, currentSettings.scoringSettings);
    const status = body.status ? (body.status === "submitted" ? "submitted" : "draft") : existing.status;

    const updatedSc: Scorecard = {
      ...existing,
      id: newId,
      projectId,
      templateId,
      templateVersion,
      periodYear: year,
      periodWeek: week,
      periodLabel: label,
      assessmentDate: body.assessmentDate !== undefined ? body.assessmentDate : existing.assessmentDate,
      assessor: body.assessor !== undefined ? body.assessor : existing.assessor,
      status,
      header: body.header !== undefined ? body.header : existing.header,
      items,
      computed,
      updatedAt: now,
      lastEditedBy: body.lastEditedBy || existing.lastEditedBy,
    };

    if (status === "submitted") {
      const errors = validateForSubmit(updatedSc);
      if (errors.length > 0) {
        return res.status(400).json({ error: "Scorecard validation failed", details: errors });
      }
      if (!updatedSc.submittedAt) {
        updatedSc.submittedAt = now;
      }
    }

    await saveScorecard(updatedSc);
    res.json({ success: true, scorecard: updatedSc });
  } catch (err: any) {
    console.error("[API] Error updating scorecard:", err);
    res.status(500).json({ error: err.message || "Failed to update scorecard" });
  }
});

// DELETE scorecard
app.delete("/api/scorecards/:id", async (req, res) => {
  try {
    const sc = await getScorecard(req.params.id);
    if (!sc) {
      return res.status(404).json({ error: "Scorecard not found" });
    }
    await deleteScorecard(req.params.id);
    res.json({ success: true, message: `Scorecard ${req.params.id} deleted` });
  } catch (err: any) {
    console.error("[API] Error deleting scorecard:", err);
    res.status(500).json({ error: err.message || "Failed to delete scorecard" });
  }
});

// GET Settings (Products, GEOs & Project Types master data)
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to read settings from database" });
  }
});

// POST update Settings (Products, GEOs & Project Types master data, Scoring Settings)
app.post("/api/settings", async (req, res) => {
  try {
    const { products, geos, projectTypes, scoringSettings } = req.body;
    if (scoringSettings) {
      const amber = Number(scoringSettings.sweAmberFrom);
      const green = Number(scoringSettings.sweGreenFrom);
      if (isNaN(amber) || isNaN(green) || amber < 1 || amber >= green || green > 3) {
        return res.status(400).json({
          error: "Invalid scoring thresholds: must satisfy 1 <= sweAmberFrom < sweGreenFrom <= 3",
        });
      }
      if (
        scoringSettings.defaultCadence &&
        scoringSettings.defaultCadence !== "weekly" &&
        scoringSettings.defaultCadence !== "biweekly"
      ) {
        return res.status(400).json({
          error: "Invalid defaultCadence: must be 'weekly' or 'biweekly'",
        });
      }
    }
    await saveSettings({ products, geos, projectTypes, scoringSettings });
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save settings to database" });
  }
});

// POST restore default Settings master data
app.post("/api/settings/reset", async (_req, res) => {
  try {
    const settings = await resetSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to reset settings" });
  }
});

// POST recalculate all scorecards with current settings
app.post("/api/scorecards/recalculate", async (_req, res) => {
  try {
    const result = await recalculateAllScorecards();
    res.json({ success: true, updated: result.updated });
  } catch (err: any) {
    console.error("[API] Error recalculating scorecards:", err);
    res.status(500).json({ error: err.message || "Failed to recalculate scorecards" });
  }
});

// ==========================================
// Database Configuration & Management APIs
// ==========================================

// GET current database configuration
app.get("/api/database/config", (_req, res) => {
  try {
    const config = getCurrentConfig();
    res.json(config);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to read database config" });
  }
});

// POST test database connection
app.post("/api/database/test", async (req, res) => {
  try {
    const testCfg: DatabaseConfig = req.body;
    if (!testCfg || !testCfg.engine) {
      return res.status(400).json({ success: false, message: "Database engine is required" });
    }
    const result = await testConnection(testCfg);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
      message: `Database test error: ${err.message}`,
    });
  }
});

// POST save and switch database configuration
app.post("/api/database/config", async (req, res) => {
  try {
    const newConfig: DatabaseConfig = req.body;
    if (!newConfig || !newConfig.engine) {
      return res.status(400).json({ success: false, error: "Database engine is required" });
    }
    const outcome = await updateDatabaseConfig(newConfig);
    res.json(outcome);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to save database config" });
  }
});

// GET current database status and statistics
app.get("/api/database/status", async (_req, res) => {
  try {
    const status = await getDatabaseStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to retrieve database status" });
  }
});

// GET flat JSON file storage stats
app.get("/api/database/files-stats", async (_req, res) => {
  try {
    const stats = await getFileStorageStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to inspect file storage" });
  }
});

// POST migrate flat JSON files INTO active database
app.post("/api/database/migrate/files-to-db", async (_req, res) => {
  try {
    const result = await migrateFilesToDatabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to migrate files to database" });
  }
});

// POST export active database OUT TO flat JSON files
app.post("/api/database/migrate/db-to-files", async (req, res) => {
  try {
    const createBackup = req.body?.createBackup !== false;
    const result = await migrateDatabaseToFiles(createBackup);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to export database to files" });
  }
});

// POST migrate / re-sync data to the active database (backward-compatible alias)
app.post("/api/database/migrate", async (_req, res) => {
  try {
    const result = await migrateFilesToDatabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to migrate data" });
  }
});

// POST create table structures into database
app.post("/api/database/schema/create", async (req, res) => {
  try {
    const targetConfig: DatabaseConfig | undefined = req.body && req.body.engine ? req.body : undefined;
    const result = await createTableStructures(targetConfig);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      tablesCreated: [],
      logs: [err.message],
      error: err.message,
      message: `Failed to create tables: ${err.message}`,
    });
  }
});

// GET DDL scripts for table structures
app.get("/api/database/schema/ddl", (req, res) => {
  try {
    const engine = (req.query.engine as any) || "sqlite";
    const ddl = getDdlScripts(engine);
    res.json({ engine, ddl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate DDL scripts" });
  }
});

async function startServer() {
  // Initialize Database Storage
  const config = loadSavedConfig();
  console.log(`[Database] Initializing with storage engine: ${config.engine.toUpperCase()}...`);
  await connectDatabase(config);
  await seedDatabaseIfEmpty();

  if (process.env.NODE_ENV !== "production") {
    runScoringSelfTest();
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Detect SSL certificates for direct HTTPS serving on LAN
  const sslKeyPath = process.env.SSL_KEY_PATH || (fs.existsSync(path.join(process.cwd(), "certs", "server.key")) ? path.join(process.cwd(), "certs", "server.key") : null);
  const sslCertPath = process.env.SSL_CERT_PATH || (fs.existsSync(path.join(process.cwd(), "certs", "server.crt")) ? path.join(process.cwd(), "certs", "server.crt") : null);

  if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      };
      https.createServer(httpsOptions, app).listen(PORT, "0.0.0.0", () => {
        console.log(`[HTTPS] Secure server running on https://0.0.0.0:${PORT}`);
        console.log(`[Storage] Active Database Engine: ${config.engine.toUpperCase()}`);
      });
      return;
    } catch (err: any) {
      console.warn(`[HTTPS] Failed to initialize SSL with provided certs: ${err.message}. Falling back to HTTP.`);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Storage] Active Database Engine: ${config.engine.toUpperCase()}`);
  });
}

startServer();
