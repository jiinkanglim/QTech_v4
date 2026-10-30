export type RAGStatus = 'GREEN' | 'AMBER' | 'RED';

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export type ProjectType = string;

export type GeoRegion = string;

export interface Project {
  id: string;
  name: string;
  code: string; // e.g. Repo / Jira key "SVC-PAY"
  product: string; // Product family e.g. "CP", "DP", "F&CP", "MP", "SP", "TP", "WP", "YP"
  projectType: ProjectType; // 'Manual' | 'Optimization'
  geo: GeoRegion;
  owner: string; // Tech Lead Name
  ownerEmail?: string;
  targetDate: string; // Target Release Date YYYY-MM-DD
  completionPercentage: number;
  category?: string;
  description: string;
  status: ProjectStatus;
  scorecardConfig?: {
    enabled: ScorecardTemplateId[];
    cadence: 'weekly' | 'biweekly';
    assessors: Partial<Record<ScorecardTemplateId, string>>;
    startPeriod?: string; /* periodKey e.g. 2026-W40 */
  };
  createdAt: string;
  updatedAt?: string;
}

export interface WeeklyUpdate {
  id: string;
  projectId: string;
  weekNumber: number;
  year: number;
  updateDate: string; // YYYY-MM-DD
  author: string; // Tech Lead
  overallRag: RAGStatus;
  qualityRag: RAGStatus; // Code Quality, Defect & Bug Debt RAG
  scheduleRag: RAGStatus; // Timeline, Milestones & Sprint Target RAG
  scopeRag: RAGStatus; // Scope & Architectural Alignment RAG
  highlights: string; // Technical Wins, PRs Merged & Key Modules Delivered
  lowlights: string; // Technical Blockers, Outages & Defect Debt
  nextSteps: string; // Next Sprint Deliverables & Architecture Focus
  kpiProgress?: string; // e.g., "94% Test Coverage, 0 P0 Bugs"
  completionPercentage: number;
  createdAt?: string;
}

export type DatabaseEngine = 'sqlite' | 'postgres' | 'mssql';

export interface DatabaseConfig {
  engine: DatabaseEngine;
  filePath: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  sslMode?: 'disable' | 'require' | 'prefer';
  trustServerCertificate?: boolean;
  connectionString?: string;
  useConnectionString?: boolean;
}

export interface DatabaseStatus {
  connected: boolean;
  engine: DatabaseEngine;
  target: string;
  projectsCount: number;
  updatesCount: number;
  latencyMs?: number;
  lastTested?: string;
  version?: string;
  tables?: string[];
  error?: string;
}

export interface DatabaseTestResult {
  success: boolean;
  engine: DatabaseEngine;
  latencyMs: number;
  version?: string;
  message: string;
  tablesFound?: string[];
  error?: string;
}

export interface TableStructureResult {
  success: boolean;
  engine: DatabaseEngine;
  tablesCreated: string[];
  logs: string[];
  message: string;
  error?: string;
}

export type MigrationDirection = 'files_to_db' | 'db_to_files';

export interface MigrationResult {
  success: boolean;
  direction: MigrationDirection;
  projectsCount: number;
  updatesCount: number;
  settingsCount: number;
  engine: DatabaseEngine;
  message: string;
  logs: string[];
  durationMs: number;
  error?: string;
}

export interface FileStorageStats {
  projectsCount: number;
  updatesCount: number;
  hasSettings: boolean;
  storagePath: string;
  scorecardsCount?: number;
}

export interface ScorecardSummary {
  id: string;
  projectId: string;
  templateId: ScorecardTemplateId;
  periodYear: number;
  periodWeek: number;
  periodLabel: string;
  status: ScorecardStatus;
  overallRag: 'G' | 'A' | 'R' | null;
  overallValue: number | null;
  normalizedPct: number | null;
  assessmentDate: string;
  assessor: string;
}

// ---------------------------------------------------------------------------
// Scorecard Types & Interfaces
// ---------------------------------------------------------------------------

export type ScorecardTemplateId = 'SWE_MODEL' | 'ORS_RAG';
export type RagValue = 'G' | 'A' | 'R' | 'NA'; // 'NA' displayed as "N/A", only allowed in ORS_RAG; excluded from all calculations
export type ScorecardStatus = 'draft' | 'submitted';

export interface TemplateItem {
  id: string;
  name: string;
  description: string;
}

export interface TemplateCategory {
  id: string;
  no: number;
  name: string;
  part?: 'REVIEW' | 'METRICS';
  optional?: boolean;
  extensible?: 'KEY_TRANSACTION' | 'CUSTOM';
  maxCustomItems?: number;
  items: TemplateItem[];
}

export interface ScorecardTemplate {
  id: ScorecardTemplateId;
  version: number;
  name: string;
  role: string;
  allowedValues: RagValue[];
  categories: TemplateCategory[];
}

export interface ScorecardItemEntry {
  itemId: string;
  categoryId: string;
  value: RagValue | null;
  remarks: string;
  customLabel?: string;
  customDescription?: string;
  isCustom?: boolean;
}

export interface ScorecardComputed {
  overallRag: 'G' | 'A' | 'R' | null;
  overallValue: number | null;
  overallLabel: string;
  normalizedPct: number | null;
  parts?: {
    review: number | null;
    reviewRag: 'G' | 'A' | 'R' | null;
    metrics: number | null;
    metricsRag: 'G' | 'A' | 'R' | null;
  };
  categories: Record<string, { value: number | null; rag: 'G' | 'A' | 'R' | null }>;
  orsPoints?: number | null;
  orsApplicable?: number;
  scoredItems: number;
  totalItems: number;
}

export interface Scorecard {
  id: string;
  projectId: string;
  templateId: ScorecardTemplateId;
  templateVersion: number;
  periodYear: number;
  periodWeek: number;
  periodLabel: string;
  assessmentDate: string /* YYYY-MM-DD */;
  assessor: string;
  status: ScorecardStatus;
  header: {
    phase?: 'Modeling' | 'Iterative Development';
    modelVersion?: string;
    projectComment?: string;
    modelComment?: string;
    dailyUpdatesLastWeek?: number;
  };
  items: ScorecardItemEntry[];
  computed: ScorecardComputed;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  lastEditedBy?: string;
}

export interface ScoringSettings {
  sweAmberFrom: number /* default 1.5 */;
  sweGreenFrom: number /* default 2.5 */;
  defaultCadence: 'weekly' | 'biweekly';
}

export interface MasterSettings {
  products: string[];
  geos: GeoRegion[];
  projectTypes: string[];
  scoringSettings: ScoringSettings;
}



