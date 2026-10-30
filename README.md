# QTech - Software Engineering Status & KPI Tracking System

QTech is a full-stack engineering status management and portfolio KPI tracking dashboard built for software delivery teams, tech leads, and engineering leadership. It provides real-time visibility into project health (RAG status), technical blockers, release milestones, product suites, and GEO regional distributions, backed by persistent, human-readable file-based data storage.

---

## 🌟 Key Features

- **Executive KPI Dashboard**: Interactive delivery RAG breakdown, product suite distribution, GEO regional health map, and priority technical risk/blocker watchlists.
- **Weekly Status Reports Directory**: Filter, search, and sort weekly status entries by Product Suite, GEO region, and RAG status (Green, Amber, Red).
- **Weekly Status Reporting**: Submit, edit, and delete weekly engineering updates with detailed technical wins, blockers, and next sprint commitments.
- **Software Project Directory**: High-density table and grid views to manage software projects, tech lead assignments, target release dates, and project codes.
- **Master Data Management**: Configurable master data for Product Suites, GEO regions, and Project Delivery Types with automatic propagation and master data reset options.
- **File-Based JSON Storage**: All application data is stored cleanly on the server filesystem inside the `data/` directory, broken down into individual files per project and status update.

---

## 📁 Data Storage Structure

All application data is persisted directly to disk in the `data/` folder:

```text
data/
├── settings.json                   # Product Suites, GEO regions, and Project Types master data
└── projects/
    ├── prj-101/
    │   ├── project.json            # Project specifications & metadata
    │   └── updates/
    │       ├── upd-31-101.json     # Individual weekly status report file
    │       └── ...
    ├── prj-102/
    │   ├── project.json
    │   └── updates/
    │       └── ...
    └── ...
```

- Each project's metadata resides in its own `project.json` file inside `data/projects/<projectId>/`.
- Each weekly status update is stored as an individual JSON file inside `data/projects/<projectId>/updates/<updateId>.json`.
- The system automatically initializes and seeds these files if the directory is empty on startup.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vue 3 (Composition API with `<script setup>`), TypeScript, Tailwind CSS v4, Lucide Icons (`lucide-vue-next`).
- **Backend Server**: Node.js, Express 4, TypeScript, `tsx` (Dev Execution Engine), `esbuild` (Production bundling into CommonJS).
- **Data Persistence**: File-system JSON storage in `data/` with live API sync.
- **Build System**: Vite 6 (Client Assets Compilation via `@vitejs/plugin-vue`) + `esbuild` (Server CJS Bundle).

---

## 📋 Prerequisites

Before setting up the project locally or deploying to production, ensure you have:

- **Node.js**: `v18.0.0` or higher (Node 20+ LTS recommended).
- **npm**: `v9.0.0` or higher.

---

## ⚙️ Environment Setup & Configuration

1. **Clone the Repository** and navigate to the project root:
   ```bash
   git clone <repository-url>
   cd qtech-status
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the project root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Populate Environment Variables**:
   Open `.env` and configure your port settings:
   ```env
   # Server port (defaults to 3000):
   PORT=3000
   ```

---

## 🚀 Local Development Guide

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   This launches the Express server using `tsx`, mounting Vite middleware for hot development reloading on `http://localhost:3000`.

3. **Type Checking & Linting**:
   ```bash
   npm run lint
   ```

---

## 🏗️ Production Build & Local Preview

The production build process compiles both the client-side Vue 3 SPA and the server-side Node.js application into a standalone bundle.

1. **Build the Application**:
   ```bash
   npm run build
   ```
   This command executes two steps:
   - `vite build`: Compiles client-side Vue 3 assets into the `dist/` directory.
   - `esbuild server.ts`: Bundles the Node.js Express server into `dist/server.cjs` as a single, self-contained CommonJS file.

2. **Run in Production Mode**:
   ```bash
   npm run start
   ```
   This starts the pre-built application server on `http://localhost:3000` via `node dist/server.cjs`.

---

## ☁️ Deployment Guidelines

### Option A: Windows Server Deployment (IIS + NSSM)

Dedicated production deployment manuals are provided for Windows Server environments:
- 📄 **[ServerDeployment.md](./ServerDeployment.md)** — Optimized guide for **Windows Server 2022 Standard**.
- 📄 **[ServerDeployment2019.md](./ServerDeployment2019.md)** — Optimized guide for **Windows Server 2019 Standard** (includes Visual C++ runtime requirements and PowerShell TLS 1.2 configuration).

**Key Steps Summary**:
1. Install **Node.js LTS (v20+)** and **IIS** (with WebSocket & CGI features).
2. Install IIS modules: **URL Rewrite 2.1** and **Application Request Routing (ARR) 3.0**. Enable ARR proxy mode.
3. Build the application (`npm ci && npm run build`).
4. Register Node.js as an auto-starting Windows Service using **NSSM**:
   ```powershell
   nssm install QTechStatusService "C:\Program Files\nodejs\node.exe" "C:\inetpub\apps\qtech-status\dist\server.cjs"
   nssm set QTechStatusService AppDirectory "C:\inetpub\apps\qtech-status"
   nssm set QTechStatusService AppEnvironmentExtra "NODE_ENV=production" "PORT=3000" "GEMINI_API_KEY=your_key"
   nssm set QTechStatusService Start SERVICE_AUTO_START
   nssm start QTechStatusService
   ```
5. Place a `web.config` in `C:\inetpub\wwwroot` rewriting inbound traffic to `http://127.0.0.1:3000/{R:1}`.
6. Open inbound firewall ports `80` & `443`.

**Publishing Updates / Deploying New Versions**:
Whenever source files are modified, run `.\update.ps1` or:
```powershell
Stop-Service QTechStatusService
npm install
npm run build
Start-Service QTechStatusService
```
*(See Section 8 of `ServerDeployment.md` or Section 9 of `ServerDeployment2019.md` for full details).*

---

### Option B: Container Deployment (Cloud Run, Docker, Kubernetes)

Because the app operates as a unified Express server serving both API endpoints and static Vue 3 SPA assets, containerizing and deploying it to platforms like Google Cloud Run, AWS ECS, or Docker hosts is straightforward.

#### 1. Sample Dockerfile
Below is a tested multi-stage `Dockerfile`:

```dockerfile
# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and compile both Vue 3 client and Express server
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built dist bundle from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
```

#### 2. Deploying to Google Cloud Run

1. **Build and Submit Container Image**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/qtech-status
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy qtech-status \
     --image gcr.io/YOUR_PROJECT_ID/qtech-status \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3000 \
     --set-env-vars GEMINI_API_KEY="your-gemini-api-key"
   ```

#### 3. Environment Variable Injection in Production

- Ensure `GEMINI_API_KEY` is configured as a secret environment variable in your cloud host environment (e.g., Secret Manager in Cloud Run, Environment Secrets in Render/AWS/Azure).
- The Express server listens on host `0.0.0.0` and port `3000` by default to satisfy container ingress routing.

---

## 📡 API Endpoints

- **`GET /api/health`**: Health check endpoint returning `{ status: "ok" }`.
- **`POST /api/ai/summarize`**: Server-side proxy for AI executive portfolio analysis. Accepts active `projects` and `updates` payloads and returns technical executive summary, systemic risk breakdown, and recommendations.
- **`POST /api/ai/polish`**: Server-side proxy for Gemini AI status draft refinement. Accepts `projectName`, `highlights`, `lowlights`, `nextSteps`, and `overallRag`, and returns polished prose with RAG reasoning.
- **`GET *`**: Fallback route serving the client SPA `dist/index.html`.

---

## 📁 Project Directory Structure

```text
├── src/
│   ├── components/
│   │   ├── KPIDashboard.vue        # Executive KPI & RAG Breakdown Dashboard
│   │   ├── WeeklyUpdatesList.vue   # Filterable & Sortable Status Report Directory
│   │   ├── WeeklyUpdateForm.vue    # Weekly Update Submission & AI Polish Form
│   │   ├── ProjectSetup.vue        # Software Project Directory & Management
│   │   ├── SettingsPage.vue        # Master Data Management (Products, GEO, Project Types)
│   │   ├── RAGBadge.vue            # Standardized RAG Indicator Badge
│   │   ├── Navbar.vue              # Top Navigation Header & View Switcher
│   │   └── ConfirmModal.vue        # Confirmation Dialog for Destructive Actions
│   ├── composables/
│   │   └── useProjects.ts          # Central Reactive State & LocalStorage Persistence
│   ├── data/
│   │   └── initialData.ts          # Initial Mock Seed Data (Projects, Updates, Catalogs)
│   ├── App.vue                     # Root Application Component & View Routing
│   ├── types.ts                    # TypeScript Interfaces & Definitions
│   ├── main.ts                     # Vue 3 Application Entry Point
│   └── index.css                   # Global Tailwind CSS Entry Point
├── server.ts                       # Custom Express Backend, Gemini Proxy & Vite Middleware
├── ServerDeployment.md             # Complete Windows Server 2022 (IIS/NSSM) Guide
├── package.json                    # Scripts, Dependencies & ESBuild Configurations
├── vite.config.ts                  # Vite Build Configuration & Vue/Tailwind Plugins
├── metadata.json                   # Applet Metadata & Capabilities Declaration
├── .env.example                    # Environment Variables Template
└── README.md                       # Documentation & Setup Guidelines
```

---

## 📄 License

This project is licensed under the MIT License.
