# DELMIA Quintiq — QTech Delivery & Operations Tracker

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Databases](https://img.shields.io/badge/Databases-SQLite%20%7C%20Postgres%20%7C%20MSSQL-005386)](https://github.com/)
[![ExcelJS](https://img.shields.io/badge/ExcelJS-4.4-217346?logo=microsoftexcel&logoColor=white)](https://github.com/exceljs/exceljs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**DELMIA Quintiq QTech Delivery & Operations Tracker** is an enterprise-grade full-stack delivery governance, engineering status tracking, and software quality scorecard platform tailored for Dassault Systèmes DELMIA Quintiq customer programs, product delivery organizations, tech leads, and optimization research teams.

The platform combines portfolio-level executive KPI visibility, 4-dimensional weekly RAG status tracking, dual-track quality scorecards (Software Expert Model Reviews & Optimization Research Scientist RAG Sheets), and an enterprise multi-engine SQL database storage layer with automatic flat-file synchronization, timestamped backups, and offline Excel batch processing.

---

## 📑 Table of Contents

1. [Executive Summary & Capabilities](#-executive-summary--capabilities)
2. [Visual Design & 3DS DELMIA Aesthetic](#-visual-design--3ds-delmia-aesthetic)
3. [System Architecture](#-system-architecture)
4. [Core Functional Modules](#-core-functional-modules)
   - [1. Executive KPI & Delivery Dashboard](#1-executive-kpi--delivery-dashboard)
   - [2. Weekly Status Reporting & Directory](#2-weekly-status-reporting--directory)
   - [3. Software Project Directory](#3-software-project-directory)
   - [4. Quality Scorecard System (SWE Model & ORS RAG)](#4-quality-scorecard-system-swe-model--ors-rag)
   - [5. Scorecard Register, Detail & Comparison Matrix](#5-scorecard-register-detail--comparison-matrix)
   - [6. Scorecard Trends, Heatmap & Compliance Tracking](#6-scorecard-trends-heatmap--compliance-tracking)
   - [7. Batch Excel & CSV Import / Export Engine](#7-batch-excel--csv-import--export-engine)
   - [8. Multi-Engine Relational Database Storage & Migration](#8-multi-engine-relational-database-storage--migration)
   - [9. Master Data & Scoring Settings](#9-master-data--scoring-settings)
5. [Quality Scorecard Framework & Math Engine](#-quality-scorecard-framework--math-engine)
   - [SWE Model Scoring Sheet (SWE_MODEL)](#swe-model-scoring-sheet-swe_model)
   - [ORS Optimizer RAG Sheet (ORS_RAG)](#ors-optimizer-rag-sheet-ors_rag)
   - [Scoring Banding & Mathematical Rules](#scoring-banding--mathematical-rules)
6. [Data Storage & Relational Database Architecture](#-data-storage--relational-database-architecture)
   - [Supported Database Engines](#supported-database-engines)
   - [SQL DDL Table Schemas](#sql-ddl-table-schemas)
   - [Dual Persistence & Automated Backup Strategy](#dual-persistence--automated-backup-strategy)
7. [REST API Documentation](#-rest-api-documentation)
8. [Project Directory Structure](#-project-directory-structure)
9. [Prerequisites & Environment Configuration](#-prerequisites--environment-configuration)
10. [Local Development Guide](#-local-development-guide)
11. [Production Build & Compilation](#-production-build--compilation)
12. [Enterprise Deployment Manuals](#-enterprise-deployment-manuals)
    - [Option A: Windows Server 2022 / 2019 (IIS + NSSM)](#option-a-windows-server-2022--2019-iis--nssm)
    - [Option B: Automated Publishing via PowerShell (`update.ps1`)](#option-b-automated-publishing-via-powershell-updateps1)
    - [Option C: Direct HTTPS / SSL LAN Deployment](#option-c-direct-https--ssl-lan-deployment)
    - [Option D: Container Deployment (Cloud Run, Docker, Kubernetes)](#option-d-container-deployment-cloud-run-docker-kubernetes)
13. [License](#-license)

---

## 🌟 Executive Summary & Capabilities

- **Unified Delivery Operations**: Consolidates project milestones, sprint commitments, technical blockers, defect debt, and quality assessments across global product suites (CP, DP, F&CP, MP, SP, TP, WP, YP) and GEO regions (EMEAR, NAM, APAC, LATAM).
- **Dual-Role Engineering Governance**: Dedicated scoring matrices designed specifically for:
  - **Lead Software Experts / QA-QS**: Comprehensive model reviews covering Server startup, Object-Oriented Design, Business/Client Logic, Performance/Transactions, Solutions, UX, and automated Editor/Designer code metrics.
  - **Optimization Research Scientists (ORS)**: Rigorous mathematical optimizer assessments evaluating Process, Problem Content, Data Quality, and daily team interaction cadences.
- **Enterprise Storage Flexibility**: Live multi-engine SQL support (SQLite, PostgreSQL, Microsoft SQL Server / Azure SQL) with in-app connection testing, automated schema generation, and bi-directional migration to/from flat JSON file systems with timestamped recovery backups.
- **Excel Batch Ingestion & CSV Export**: Bulk ingestion of multi-week Excel workbooks (`.xlsx` and `.xlsm`) with a live 2-phase Preview/Commit workflow, duplicate handling (overwrite vs skip), and UTF-8 BOM CSV exports formatted for Microsoft Excel compatibility.
- **Audit-Ready Cadence Tracking**: Monitors submission cadence compliance (Weekly vs Bi-weekly), flagging Due or Overdue deliverables with historical sparklines and comparative diff matrices.

---

## 🎨 Visual Design & 3DS DELMIA Aesthetic

The user interface follows the official **Dassault Systèmes 3DS DELMIA Quintiq** industrial design language:

| Design Token | Color Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Primary 3DS Blue** | `#005386` | Brand headers, primary action buttons, active navigation states, accent highlights |
| **Hover 3DS Blue** | `#00436d` | Interactive hover states for primary buttons and links |
| **Accent Cyan** | `#0082c3` | Highlights, badges, focus rings, progress indicators |
| **Navy Dark** | `#0b1a2e` | Dark mode navigation bar, header blocks, card borders |
| **Dark Canvas** | `#091421` | Deep dark mode background canvas |
| **Dark Card** | `#0f2238` | Dark mode container and surface card background |
| **Accent Light** | `#e8f2f8` | Light mode card backgrounds, badges, and selected item rows |

- **Instant Dark/Light Mode**: User preference stored in `localStorage` with zero-flash inline bootstrap initialization in `index.html`.
- **Responsive Typography & Density**: Optimized for both high-density workstation displays (multi-column tables, data grids) and mobile devices.
- **Print Optimization**: High-contrast, clutter-free printable layouts specifically styled for executive scorecard exports and project audit packs.

---

## 🏛️ System Architecture

QTech Status operates as a unified, full-stack application where Vite powers modern frontend compilation while Node.js Express provides robust backend APIs, database management, and static bundle delivery:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Client Browser (Vue 3 SPA)                            │
│   ├── Navigation Bar & Theme Engine (Dark / Light 3DS DELMIA Styling)       │
│   ├── Executive KPI Dashboard & Delivery Health Trend Line Charts           │
│   ├── Weekly Status Form (4D RAG, Technical Wins, Blockers, Sprint Targets) │
│   ├── Project Directory & Master Data Catalogs (Products, GEOs, Types)      │
│   ├── Quality Scorecards Register, Form, Detail & Multi-Week Compare        │
│   ├── Analytics: Recharts Trend Lines, Sparklines, RAG Heatmap & Compliance │
│   ├── Batch Excel (.xlsx / .xlsm) Import Modal with 2-Phase Preview/Commit  │
│   └── Database Storage Management: Live Connection Test, DDL Generator      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / JSON
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Node.js Express Server (server.ts)                      │
│   ├── Environment & Config Loader (dotenv, db-config.json, .env)            │
│   ├── Scoring Engine Self-Test on Boot (runScoringSelfTest)                 │
│   ├── Dual HTTP/HTTPS Listener (Direct SSL Support on Port 3000)            │
│   ├── Multer Memory Storage Pipeline (Max 30MB Excel Workbook Ingestion)    │
│   ├── ExcelJS Parser (Weekly Sheet Extraction, Cell Normalization)          │
│   └── REST API Endpoints (/api/projects, /api/updates, /api/scorecards)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
┌─────────────────────────────────────────┐     ┌─────────────────────────────────────────┐
│     Relational Database Storage Layer   │     │    Flat File System & Backup Layer      │
│  (src/server/database.ts Multi-Engine)  │     │       (data/ Storage Subsystem)         │
│                                         │     │                                         │
│  • SQLite (Node 22 DatabaseSync Engine) │◄───►│  • data/settings.json                   │
│    Default local DB: data/quintiq.db    │     │  • data/projects/<id>/project.json      │
│  • PostgreSQL (pg Connection Pool)      │     │  • data/projects/<id>/updates/*.json    │
│    Cloud / Remote Relational DB         │     │  • data/projects/<id>/scorecards/*.json │
│  • Microsoft SQL Server (mssql Pool)    │     │  • data/backups/backup-<timestamp>/     │
│    Enterprise MSSQL / Azure SQL DB      │     │    (Automated snapshots before sync)    │
└─────────────────────────────────────────┘     └─────────────────────────────────────────┘
```

---

## 🚀 Core Functional Modules

### 1. Executive KPI & Delivery Dashboard
- **Delivery Portfolio Health Breakdown**: Visual RAG breakdown counting projects in Green, Amber, and Red states.
- **Product Suite Distribution**: Project density across CP, DP, F&CP, MP, SP, TP, WP, and YP.
- **GEO Regional Health**: Regional delivery status cards across EMEAR, NAM, APAC, and LATAM.
- **Critical Risk & Blocker Watchlist**: Aggregated list of active technical blockers and lowlights needing executive attention.
- **Project Health Trend Chart**: Historical view of RAG status trajectory over previous weekly intervals.
- **Direct Drill-Down**: Quick navigation buttons to jump directly into status entry, project specifications, or quality scorecards.

### 2. Weekly Status Reporting & Directory
- **4-Dimensional Evaluation**:
  1. **Overall RAG**: Primary project health indicator.
  2. **Quality RAG**: Defect debt, static analysis warnings, code health.
  3. **Schedule RAG**: Timeline, sprint targets, release milestones.
  4. **Scope RAG**: Architecture alignment and requirement drift.
- **Structured Engineering Fields**:
  - **Technical Wins / Highlights**: PRs merged, core features delivered, architecture milestones.
  - **Blockers / Lowlights**: Outages, third-party delays, technical impediments.
  - **Next Sprint Commitments**: Specific deliverables targeted for the upcoming cycle.
  - **KPI Progress**: Measurable statistics (e.g., `"94% Test Coverage, 0 P0 Bugs"`).
  - **Completion Percentage**: Visual completion slider (0% to 100%).
- **Directory Search & Sorting**: Real-time filtering by Product Suite, GEO region, and RAG status.

### 3. Software Project Directory
- **Project Registry**: Manage delivery projects with project code (e.g. `SVC-PAY`, `QTC-ROUT`), product family, project delivery type (`Manual` vs `Optimization`), regional assignment, and assigned tech leads.
- **Scorecard Configuration**: Enable/disable specific scorecards (`SWE_MODEL`, `ORS_RAG`), assign designated assessors, configure submission cadence (`weekly` or `biweekly`), and define start periods (e.g., `2026-W40`).
- **Project Summary Drawer**: Detailed sidebar showing project specifications, completion percentage, assigned tech lead, and historical weekly logs.

### 4. Quality Scorecard System (SWE Model & ORS RAG)
- Specialized quality assessment framework replacing unstructured status notes with formal, repeatable engineering criteria.
- **Deterministic ID Generation**: `sc-<projectId>-<templateId>-<year>-W<week>` (e.g., `sc-prj-112-SWE_MODEL-2026-W40`), guaranteeing zero duplicate entries for any project/role/week combination.
- **Interactive Scoring Form**:
  - Live calculations displaying overall RAG, numerical scores, and percentage grades as items are checked.
  - Draft mode saving for in-progress reviews.
  - Strict submission validation requiring all mandatory categories and items to be scored prior to finalization.
  - Dynamic extensibility: Add/remove custom Key Transactions (Import, Export, Sync, Custom) and up to 5 custom review items under "Other".

### 5. Scorecard Register, Detail & Comparison Matrix
- **Scorecard Register**: Filterable table showing period, project, scorecard role, assessor, status (`draft` vs `submitted`), overall score, and normalized percentage.
- **Scorecard Detail View**: Clean, audit-ready presentation of all category items, remarks, assessor notes, model phase, version, and timestamps. Features previous/next period quick navigation arrows and dedicated print mode.
- **Multi-Week Comparison Matrix**: Side-by-side diff view comparing multiple periods of the same project and role, highlighting score variances, improvements, and regressions.

### 6. Scorecard Trends, Heatmap & Compliance Tracking
- **Interactive Trend Line Charts**: Powered by Recharts, plotting overall score, Review part, and Metrics part over chronological ISO weeks.
- **Portfolio RAG Heatmap**: Color-coded matrix showing all active projects against historical calendar weeks, providing an instant macro-view of organizational delivery health.
- **Submission Cadence Compliance**: Automated compliance engine evaluating submission timelines against configured cadence (`weekly` = 1 week window, `biweekly` = 2 week window), flagging status as `OK`, `Due`, or `Overdue`.

### 7. Batch Excel & CSV Import / Export Engine
- **Excel Ingestion (`.xlsx` / `.xlsm`)**:
  - Parses multi-sheet Excel files matching `"Week {N}"` tabs.
  - Supports both ORS Optimizer RAG Sheets and Lead Software Expert Model sheets.
  - **2-Phase Import Workflow**:
    - **Preview Mode**: Validates sheet names, matches row labels to template criteria, displays unmapped rows, and flags duplicate periods.
    - **Commit Mode**: Persists validated scorecards into the active database.
  - **Duplicate Handling**: Configurable behavior (`overwrite` existing records or `skip` duplicates).
- **Summary CSV Export**: Generates RFC 4180 compliant CSV files with UTF-8 BOM encoding for seamless opening in Microsoft Excel without character corruption.

### 8. Multi-Engine Relational Database Storage & Migration
- Out-of-the-box support for **SQLite**, **PostgreSQL**, and **Microsoft SQL Server**.
- **In-App Database Settings Console**:
  - Live connection verification testing host, port, credentials, latency, and database version.
  - In-app DDL generator with one-click automated table creation.
  - Bi-directional data migration: Import flat JSON files into active SQL database, or export active SQL database out to flat JSON files with automatic timestamped snapshot backups.
  - Live scorecard recalculation tool to recompute cached RAG bands when scoring threshold settings are modified.

### 9. Master Data & Scoring Settings
- **Product Suites**: Add, edit, or remove enterprise product families.
- **GEO Regions**: Maintain global geographical zones.
- **Project Delivery Types**: Configure project classifications (`Manual`, `Optimization`, `Hybrid`).
- **Scoring Thresholds**: Adjust SWE Amber and Green cut-off values (`sweAmberFrom`, `sweGreenFrom`) and default cadence.
- **Restore Defaults**: One-click restore to standard DELMIA Quintiq corporate defaults.

---

## 🧮 Quality Scorecard Framework & Math Engine

The system implements two distinct scoring templates defined in `src/scoring/templates.ts` and evaluated by `src/scoring/engine.ts`.

### SWE Model Scoring Sheet (`SWE_MODEL`)
Designed for **Lead Software Experts and QA-QS Auditors** to evaluate Quintiq software models.

#### Structure & Categories:
- **Part 1: Review (Categories 1 - 7)**
  1. *General*: Server start-up, installation sanity.
  2. *Object Oriented Design*: Object structure, element levels, lifecycle creation/deletion.
  3. *Logic (Business and Client)*: Correctness, efficiency, clean code, exception handling, server/client methods, Knowledge Tables (KT), procedural vs. declarative.
  4. *Performance*: Memory overhead, thread locking, business logic bindings, client UI instances, and extensible Key Transactions (Import, Synchronize, Export, Custom).
  5. *Solution*: Correct business solution fit.
  6. *User Experience*: Feedback/responsiveness, interaction design, intuitive interface, navigation.
  7. *Other (Optional)*: Extensible with up to 5 custom review items.
- **Part 2: Metrics (Categories 8 - 9)**
  8. *Metrics (Editor)*: Code complexity, lines of code, code style, reconsidered code, model errors, hardcoding, TODOs, type casting, unused elements, comment density, model warnings.
  9. *Metrics (Designer)*: Complexity, size, style, reconsidered code, duplicate responses, designer errors, hardcoding, multiple object bindings, TODOs, casting, unused elements, comments, warnings.

#### Value Scale:
- `G` (Green) = `3`
- `A` (Amber) = `2`
- `R` (Red) = `1`
*(N/A is not permitted in SWE Model assessments).*

#### Calculation Formula:
1. **Category Score**: Average of all valid scored item costs in the category:
   $$\text{CatScore} = \frac{\sum \text{Cost}(v)}{N_{\text{valid}}}$$
2. **Part Scores**:
   $$\text{ReviewPart} = \text{Average}(\text{CatScore}_1 \dots \text{CatScore}_7)$$
   $$\text{MetricsPart} = \text{Average}(\text{CatScore}_8, \text{CatScore}_9)$$
3. **Overall Value**: Average of the two parts:
   $$\text{OverallValue} = \frac{\text{ReviewPart} + \text{MetricsPart}}{2}$$
4. **Normalized Percentage (0% - 100%)**:
   $$\text{NormalizedPct} = \frac{\text{OverallValue} - 1}{2} \times 100$$
5. **RAG Banding**:
   - $\text{OverallValue} < \text{sweAmberFrom} \ (1.5) \implies \mathbf{R} \ (\text{Red - BAD})$
   - $\text{sweAmberFrom} \le \text{OverallValue} < \text{sweGreenFrom} \ (2.5) \implies \mathbf{A} \ (\text{Amber - OK})$
   - $\text{OverallValue} \ge \text{sweGreenFrom} \ (2.5) \implies \mathbf{G} \ (\text{Green - GOOD})$

---

### ORS Optimizer RAG Sheet (`ORS_RAG`)
Designed for **Optimization Research Scientists** to evaluate mathematical optimization algorithms and solvers.

#### Structure & Categories:
1. *Process*: Team composition, Timeline adherence, ORS/Team Efficiency, Optimizer Tracking Sheet (OTS) Reporting.
2. *Content*: Optimization Puzzle clarity, Optimizer Specification Document (OSD) Design, Benchmark Quality, Execution Speed.
3. *Data Quality*: Benchmark and customer test data availability and fidelity.
4. *Interaction*: Daily status cadence (1-2 updates = Red, 3 updates = Amber, 4-5 updates = Green).

#### Value Scale:
- `G` (Green) = `1.0 point`
- `A` (Amber) = `0.5 points`
- `R` (Red) = `0.0 points`
- `NA` (Not Applicable) = Excluded from both points and total applicable count.

#### Calculation & Gating Rules:
- **Category Status**: Averaged item value mapped to status:
  $$\text{StatusValue} = \text{round}(\max(\text{Val}, 1) - 0.01)$$
  *(3 $\implies$ Green, 2 $\implies$ Amber, 1 $\implies$ Red; ties round down).*
- **Overall RAG Status (Worst-Case Gating)**: Determined strictly by the **minimum** category score:
  $$\text{OverallRAG} = \min(\text{CatRAG}_{\text{process}}, \text{CatRAG}_{\text{content}}, \text{CatRAG}_{\text{data}}, \text{CatRAG}_{\text{interaction}})$$
- **Points Fraction & Overall Value**:
  $$\text{OverallValue} = \frac{\text{orsPoints}}{\text{orsApplicable}} \times 10$$
  $$\text{NormalizedPct} = \text{OverallValue} \times 10$$
  *Display Label*: `"Status {RAG} – {orsPoints}/{orsApplicable}"` (e.g., `Status G – 9.5/10`).

---

## 💾 Data Storage & Relational Database Architecture

The backend implements a dual-persistence architecture. By default, it operates against an embedded SQLite database, with full support for enterprise PostgreSQL and Microsoft SQL Server databases. Flat JSON files in `data/` serve as an accessible file interchange format and backup source.

### Supported Database Engines

| Engine | Driver / Library | Configuration Parameters | Best Suited For |
| :--- | :--- | :--- | :--- |
| **SQLite** *(Default)* | Node 22 `node:sqlite` (`DatabaseSync`) | `filePath` (default: `data/quintiq.db`) | Local development, single-server VMs, zero-config setups |
| **PostgreSQL** | `pg` (`Pool`) | `host`, `port` (5432), `database`, `username`, `password`, `sslMode` | Cloud native hosting, AWS RDS, Cloud SQL, Supabase |
| **Microsoft SQL Server** | `mssql` (`ConnectionPool`) | `host`, `port` (1433), `database`, `username`, `password`, `trustServerCertificate` | Corporate Windows Server environments, Azure SQL |

---

### SQL DDL Table Schemas

Below are the schema definitions managed automatically by the application (and viewable via the In-App DDL Inspector):

#### SQLite DDL:
```sql
CREATE TABLE IF NOT EXISTS projects (
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
CREATE INDEX IF NOT EXISTS idx_projects_geo ON projects(geo);

CREATE TABLE IF NOT EXISTS weekly_updates (
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
  createdAt TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_updates_project ON weekly_updates(projectId);
CREATE INDEX IF NOT EXISTS idx_updates_period ON weekly_updates(year, weekNumber);

CREATE TABLE IF NOT EXISTS scorecards (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  templateId TEXT NOT NULL,
  templateVersion INTEGER NOT NULL,
  periodYear INTEGER NOT NULL,
  periodWeek INTEGER NOT NULL,
  periodLabel TEXT NOT NULL,
  assessmentDate TEXT NOT NULL,
  assessor TEXT NOT NULL,
  status TEXT NOT NULL,
  header TEXT,
  items TEXT NOT NULL,
  computed TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  submittedAt TEXT,
  lastEditedBy TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_scorecards_project ON scorecards(projectId);
CREATE INDEX IF NOT EXISTS idx_scorecards_template ON scorecards(templateId);
CREATE INDEX IF NOT EXISTS idx_scorecards_period ON scorecards(periodYear, periodWeek);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

#### PostgreSQL & Microsoft SQL Server Dialects:
- **PostgreSQL**: Replaces `TEXT` with `VARCHAR`/`TEXT`, `REAL` with `NUMERIC(5,2)`, and stores nested structures (`scorecard_config`, `header`, `items`, `computed`) in `JSONB` columns with GIN indexes.
- **SQL Server (MSSQL)**: Utilizes `NVARCHAR(MAX)`, `FLOAT`, and foreign key cascading constraints (`ON DELETE CASCADE`).

---

### Dual Persistence & Automated Backup Strategy

The application guarantees zero data loss during migrations and maintenance:
1. **Flat File Layout**:
   ```text
   data/
   ├── db-config.json                   # Active database connection settings
   ├── quintiq.db                       # SQLite embedded database file
   ├── settings.json                   # Master data (Products, GEOs, Project Types)
   ├── projects/
   │   ├── prj-101/
   │   │   ├── project.json            # Project definition & scorecard configuration
   │   │   ├── updates/
   │   │   │   └── upd-31-101.json     # Weekly engineering updates
   │   │   └── scorecards/
   │   │       └── sc-prj-101-SWE_MODEL-2026-W40.json
   │   └── ...
   └── backups/
       └── backup-2026-10-30T05-42-41-408Z/   # Auto-generated timestamped snapshot
           ├── settings.json
           └── projects/
   ```
2. **Automated Snapshot Backups**:
   - Every time an export from the database to files occurs (`/api/database/migrate/db-to-files`), the system automatically archives the existing `data/projects` and `data/settings.json` into a timestamped directory inside `data/backups/`.
   - Backup directories can be inspected or restored directly via file management or the database migration interface.

---

## 📡 REST API Documentation

The Express server exposes a comprehensive, RESTful API:

### 1. Health & Core Data
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, database engine, and connection state |
| `GET` | `/api/data` | Bulk payload returning all projects, updates, settings, and scorecards |

### 2. Software Projects
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/projects` | Create a new project (validates unique `id`) |
| `PUT` | `/api/projects/:id` | Update an existing project's metadata or scorecard configuration |
| `DELETE` | `/api/projects/:id` | Cascading delete of project, updates, and associated scorecards |

### 3. Weekly Status Updates
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/updates` | Submit a weekly update (requires `id` and `projectId`) |
| `PUT` | `/api/updates/:id` | Update an existing weekly update |
| `DELETE` | `/api/updates/:id` | Delete a weekly update |

### 4. Quality Scorecards
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/scorecards` | List scorecards with optional query params (`projectId`, `templateId`, `from`, `to`, `status`) |
| `GET` | `/api/scorecards/trend` | Chronological trend points for submitted scorecards (`projectId` required, optional `templateId`) |
| `GET` | `/api/scorecards/:id` | Retrieve full scorecard by ID |
| `POST` | `/api/scorecards` | Create scorecard (returns `409 Conflict` if project+role+period exists) |
| `PUT` | `/api/scorecards/:id` | Update scorecard (recalculates computed score; handles period key rename) |
| `DELETE` | `/api/scorecards/:id` | Delete a scorecard |
| `POST` | `/api/scorecards/recalculate` | Recompute all scorecards across the system with current settings |
| `POST` | `/api/scorecards/import` | Upload Excel file (`multipart/form-data`) with `mode=preview\|commit` and `onDuplicate=skip\|overwrite` |

### 5. Master Data & Scoring Settings
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/settings` | Retrieve active products, geos, project types, and scoring settings |
| `POST` | `/api/settings` | Update master data catalogs and scoring thresholds |
| `POST` | `/api/settings/reset` | Reset master data to Dassault Systèmes DELMIA Quintiq corporate defaults |

### 6. Database Storage & Migrations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/database/config` | Read current database configuration |
| `POST` | `/api/database/test` | Test database connectivity, return latency and database version |
| `POST` | `/api/database/config` | Save database configuration and reconnect live engine |
| `GET` | `/api/database/status` | Current database metrics (connection status, tables, record counts) |
| `GET` | `/api/database/files-stats` | Storage metrics of disk files in `data/` |
| `POST` | `/api/database/migrate/files-to-db` | Ingest all flat JSON files from `data/` into active SQL database |
| `POST` | `/api/database/migrate/db-to-files` | Export all active SQL database tables to `data/` JSON files with auto-backup |
| `GET` | `/api/database/schema/ddl` | Generate SQL DDL scripts for `sqlite`, `postgres`, or `mssql` |
| `POST` | `/api/database/schema/create` | Execute table creation DDL on active database |

---

## 📁 Project Directory Structure

```text
.
├── .env.example                               # Environment configuration template
├── .gitignore                                 # Git ignore patterns
├── README.md                                  # Complete architecture & operations documentation
├── ServerDeployment.md                        # Windows Server 2022 deployment manual
├── ServerDeployment2019.md                    # Windows Server 2019 deployment manual
├── update.ps1                                 # Automated update & republish script for Windows Server
├── package.json                               # NPM scripts, dependencies & build tools
├── server.ts                                  # Express backend, SQLite/PG/MSSQL layer & Vite middleware
├── tsconfig.json                              # TypeScript compiler settings
├── vite.config.ts                             # Vite configuration with Vue 3 & Tailwind v4 plugins
├── metadata.json                              # Applet metadata & permission specifications
│
├── data/                                      # Application persistent storage directory
│   ├── db-config.json                         # Active database connection parameters
│   ├── quintiq.db                             # Default embedded SQLite database
│   ├── settings.json                          # Master data & scoring configuration
│   ├── backups/                               # Timestamped backup snapshots
│   └── projects/                              # Per-project JSON data files
│       └── <projectId>/
│           ├── project.json                   # Project metadata & scorecard config
│           ├── updates/                       # Weekly status reports
│           └── scorecards/                    # Evaluated quality scorecards
│
└── src/
    ├── main.ts                                # Client application entry point
    ├── index.css                              # Tailwind CSS v4 entry point & 3DS color tokens
    ├── App.vue                                # Root component, navigation tabs & view routing
    ├── types.ts                               # TypeScript types, interfaces & scoring models
    │
    ├── components/                            # Vue 3 UI Components
    │   ├── Navbar.vue                         # Top header, view tabs & quick-log modal
    │   ├── KPIDashboard.vue                   # Executive KPI delivery metrics & health breakdown
    │   ├── ProjectHealthTrendChart.vue        # Historical delivery RAG trend chart
    │   ├── WeeklyUpdateForm.vue               # 4D RAG status submission form
    │   ├── ProjectSetup.vue                   # Software project directory & drawer
    │   ├── SettingsPage.vue                   # Master data management & reset controls
    │   ├── DatabaseSettingsPage.vue           # Database config, live test, DDL & migration
    │   ├── DatabaseConfigCard.vue             # Reusable database parameters input card
    │   ├── MultiSelectDropdown.vue            # Reusable multi-select component
    │   ├── RAGBadge.vue                       # Standardized Green/Amber/Red badge
    │   ├── ProjectStatusBadge.vue             # Active/On-Hold/Completed/Archived badge
    │   ├── ProjectTypeBadge.vue               # Manual vs Optimization project badge
    │   ├── ConfirmModal.vue                   # Modal dialog for destructive actions
    │   │
    │   └── scorecards/                        # Quality Scorecard UI Subsystem
    │       ├── ScorecardRegister.vue          # Register of all scorecards with filters & CSV export
    │       ├── PortfolioScoreTable.vue        # Matrix view of project scores
    │       ├── ScorecardForm.vue              # Assessment form with live preview & validation
    │       ├── ScorecardCategoryBlock.vue     # Category scoring block with item remarks
    │       ├── ScorecardDetail.vue            # Read-only audit view with print optimization
    │       ├── ScorecardCompare.vue           # Multi-period side-by-side diff matrix
    │       ├── ScorecardTrends.vue            # Analytics hub (Trend lines, Heatmap, Compliance)
    │       ├── TrendLineChart.vue             # Recharts multi-metric trend chart
    │       ├── RagHeatmap.vue                 # Visual project x week RAG heatmap
    │       ├── RagSelector.vue                # Interactive G/A/R/NA toggle buttons
    │       ├── ScoreSummaryPanel.vue          # Top-level score & percentage summary pill
    │       ├── ScoringSettingsSection.vue     # Thresholds and cadence configuration
    │       ├── Sparkline.vue                  # Inline SVG 6-week trend indicator
    │       ├── TemplateViewer.vue             # Full template criteria browser
    │       └── ImportDialog.vue               # 2-Phase Excel import modal (Preview/Commit)
    │
    ├── composables/                           # Reactive State Composables
    │   ├── useProjects.ts                     # Projects, updates & master settings state
    │   └── useScorecards.ts                   # Scorecards CRUD, filter & summary state
    │
    ├── data/
    │   ├── initialData.ts                     # Initial seed projects, products, and GEO catalogs
    │   └── sampleUpdates.ts                   # Sample status updates for bootstrapping
    │
    ├── scoring/                               # Pure Scoring Domain Logic
    │   ├── compliance.ts                      # Cadence tracking, expected periods, due/overdue
    │   ├── csv.ts                             # Summary CSV generator with UTF-8 BOM
    │   ├── engine.ts                          # SWE and ORS mathematical computation engine
    │   ├── period.ts                          # ISO week math, period keys & date formatting
    │   ├── selftest.ts                        # Boot-time regression test for scoring engine
    │   └── templates.ts                       # Complete SWE_MODEL & ORS_RAG template criteria
    │
    └── server/                                # Server-Side Database & File Handlers
        ├── database.ts                        # Multi-engine SQL client (SQLite, PG, MSSQL)
        └── scorecardImport.ts                 # ExcelJS workbook parser & preview builder
```

---

## 📋 Prerequisites & Environment Configuration

### Prerequisites
- **Node.js**: `v20.0.0` or higher LTS (Required for native `node:sqlite`).
- **npm**: `v9.0.0` or higher.
- *(Optional)* PostgreSQL `12+` or Microsoft SQL Server `2016+` if using external relational engines.

### Environment Setup (`.env`)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your environment parameters:
```env
# ==========================================
# Server Hosting & Networking
# ==========================================
PORT=3000
APP_URL="http://localhost:3000"

# Optional direct HTTPS / SSL (if hosting directly without an IIS/Nginx reverse proxy)
# SSL_KEY_PATH="certs/server.key"
# SSL_CERT_PATH="certs/server.crt"

# ==========================================
# Data Storage & Database
# ==========================================
# Primary storage is configured directly in the UI under Master Data -> Database Storage,
# or pre-configured in data/db-config.json.
```

---

## 🛠️ Local Development Guide

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   - Starts Express via `tsx`.
   - Executes `runScoringSelfTest()` to verify the scoring math engine.
   - Connects to the active database (or initializes `data/quintiq.db`).
   - Mounts Vite in middleware mode for hot module replacement.
   - Available at: `http://localhost:3000`.

3. **Run Type Checking & Lints**:
   ```bash
   npm run lint
   ```

---

## 🏗️ Production Build & Compilation

The build pipeline compiles both frontend assets and the backend server into an optimized standalone artifact:

```bash
npm run build
```

This script executes two sequential operations:
1. `vite build`: Compiles Vue 3 client assets, CSS, and vendor chunks into `dist/`.
2. `esbuild server.ts`: Bundles the Express backend and server handlers into a single, high-performance CommonJS file at `dist/server.cjs`.

### Running in Production:
```bash
npm run start
```
Starts the production server directly via `node dist/server.cjs` on port `3000`.

---

## ☁️ Enterprise Deployment Manuals

### Option A: Windows Server 2022 / 2019 (IIS + NSSM)
Complete step-by-step guides are provided in the repository:
- 📄 **[ServerDeployment.md](./ServerDeployment.md)** — Optimized guide for **Windows Server 2022 Standard**.
- 📄 **[ServerDeployment2019.md](./ServerDeployment2019.md)** — Optimized guide for **Windows Server 2019 Standard** (includes Visual C++ redistributable and TLS 1.2 PowerShell instructions).

#### Architecture Summary:
- **Node.js Service**: Managed by **NSSM** (Non-Sucking Service Manager) as `QTechStatusService` running `dist/server.cjs` on port `3000`.
- **IIS Reverse Proxy**: Uses **URL Rewrite 2.1** and **Application Request Routing (ARR) 3.0** to forward external port `80`/`443` traffic to `http://127.0.0.1:3000`.

---

### Option B: Automated Publishing via PowerShell (`update.ps1`)
To publish code updates on a production Windows Server without file-locking errors:

1. Open **PowerShell as Administrator**.
2. Run the update script:
   ```powershell
   .\update.ps1
   ```
3. The script executes the following automated workflow:
   - Temporarily stops `QTechStatusService` (releasing locks on `dist/server.cjs`).
   - Runs `npm install --no-audit` for dependency updates.
   - Compiles production bundles via `npm run build`.
   - Restarts `QTechStatusService`.
   - Executes an automated health verification check against `/api/health`.

---

### Option C: Direct HTTPS / SSL LAN Deployment
If deploying on an internal LAN VM without an external reverse proxy, QTech Status can terminate SSL directly:
1. Place your private key and certificate inside a `certs/` folder:
   - `certs/server.key`
   - `certs/server.crt`
2. Or point to their paths via `.env`:
   ```env
   SSL_KEY_PATH="C:\certificates\server.key"
   SSL_CERT_PATH="C:\certificates\server.crt"
   ```
3. Upon launch, the server automatically initializes an HTTPS server on `https://0.0.0.0:3000`.

---

### Option D: Container Deployment (Cloud Run, Docker, Kubernetes)

A tested multi-stage `Dockerfile` is provided below:

```dockerfile
# Stage 1: Build Frontend and Server Bundles
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
```

#### Deploying to Google Cloud Run:
```bash
# 1. Build and push image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/qtech-status

# 2. Deploy service
gcloud run deploy qtech-status \
  --image gcr.io/YOUR_PROJECT_ID/qtech-status \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

---

## 📄 License

This project is licensed under the **MIT License**.
See the LICENSE file for full details.
