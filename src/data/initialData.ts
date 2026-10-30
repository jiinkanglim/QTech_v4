import { Project, WeeklyUpdate, GeoRegion, ProjectType } from '../types';
import { SAMPLE_WEEKLY_UPDATES } from './sampleUpdates';

export const DEFAULT_PROJECT_TYPES: ProjectType[] = ['Manual', 'Optimization'];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'prj-101',
    name: 'Payment Processing Microservice V2',
    code: 'SVC-PAY',
    product: 'CP',
    projectType: 'Manual',
    geo: 'EMEA',
    owner: 'Marcus Vance',
    ownerEmail: 'marcus.vance@company.com',
    targetDate: '2026-09-30',
    completionPercentage: 68,
    description: 'Refactoring EMEA regional payment orchestrator into idempotent Go microservices with zero-downtime DB migration.',
    status: 'ACTIVE',
    createdAt: '2026-05-01'
  },
  {
    id: 'prj-102',
    name: 'Mobile Checkout SDK & Biometrics',
    code: 'SDK-MOB',
    product: 'DP',
    projectType: 'Optimization',
    geo: 'NAM',
    owner: 'Elena Rostova',
    ownerEmail: 'elena.rostova@company.com',
    targetDate: '2026-08-25',
    completionPercentage: 82,
    description: 'Native iOS & Android SDK overhaul providing 1-click biometric checkout for North American retail partners.',
    status: 'ACTIVE',
    createdAt: '2026-04-15'
  },
  {
    id: 'prj-103',
    name: 'Real-time Fraud & Anomaly Detection Engine',
    code: 'ENG-FRD',
    product: 'F&CP',
    projectType: 'Optimization',
    geo: 'APAC',
    owner: 'David Chen',
    ownerEmail: 'david.chen@company.com',
    targetDate: '2026-08-15',
    completionPercentage: 45,
    description: 'Stream processing event pipeline using Flink and statistical models for sub-50ms fraud evaluation in APAC.',
    status: 'ACTIVE',
    createdAt: '2026-06-01'
  },
  {
    id: 'prj-104',
    name: 'GraphQL Federated Gateway Mesh',
    code: 'API-GW',
    product: 'MP',
    projectType: 'Optimization',
    geo: 'Global',
    owner: 'Sarah Jenkins',
    ownerEmail: 'sarah.jenkins@company.com',
    targetDate: '2026-10-15',
    completionPercentage: 55,
    description: 'Consolidating legacy REST endpoints into unified global GraphQL Apollo Federation with sub-second caching.',
    status: 'ACTIVE',
    createdAt: '2026-06-10'
  },
  {
    id: 'prj-105',
    name: 'Inventory Sync & ERP Event Bus',
    code: 'EVT-INV',
    product: 'SP',
    projectType: 'Manual',
    geo: 'LATAM',
    owner: 'Carlos Mendez',
    ownerEmail: 'carlos.mendez@company.com',
    targetDate: '2026-09-15',
    completionPercentage: 90,
    description: 'Kafka event-driven synchronization between SAP ERP and localized LATAM warehouse fulfillment nodes.',
    status: 'ACTIVE',
    createdAt: '2026-07-01'
  },
  {
    id: 'prj-106',
    name: 'Zero-Trust Identity & OAuth Refresh Module',
    code: 'SEC-AUTH',
    product: 'TP',
    projectType: 'Manual',
    geo: 'EMEA',
    owner: 'Amara Patel',
    ownerEmail: 'amara.patel@company.com',
    targetDate: '2026-11-30',
    completionPercentage: 30,
    description: 'Upgrading token rotation mechanisms to satisfy GDPR and EMEA regulatory OAuth 2.1 zero-trust mandates.',
    status: 'ACTIVE',
    createdAt: '2026-07-05'
  },
  {
    id: 'prj-107',
    name: '3D Secure 2.2 Payment Authentication Bridge',
    code: 'SVC-3DS',
    product: 'WP',
    projectType: 'Optimization',
    geo: 'EMEA',
    owner: 'Sven Lindqvist',
    ownerEmail: 'sven.l@company.com',
    targetDate: '2026-10-01',
    completionPercentage: 75,
    description: 'Mandatory PSD2 compliance upgrade for friction-free EMV 3DS merchant authentication across European banks.',
    status: 'ACTIVE',
    createdAt: '2026-05-20'
  },
  {
    id: 'prj-108',
    name: 'Merchant Analytics & Settlement Dashboard',
    code: 'FE-MERCH',
    product: 'YP',
    projectType: 'Manual',
    geo: 'NAM',
    owner: 'Rachel Adams',
    ownerEmail: 'rachel.a@company.com',
    targetDate: '2026-09-10',
    completionPercentage: 60,
    description: 'Next.js merchant portal enabling real-time payout reconciliation and custom dispute management workflows.',
    status: 'ACTIVE',
    createdAt: '2026-06-12'
  },
  {
    id: 'prj-109',
    name: 'Sanctions Screening & AML Compliance Bot',
    code: 'ENG-AML',
    product: 'F&CP',
    projectType: 'Optimization',
    geo: 'Global',
    owner: 'Taro Tanaka',
    ownerEmail: 'taro.t@company.com',
    targetDate: '2026-11-15',
    completionPercentage: 40,
    description: 'Automated fuzzy matching pipeline against global OFAC and UN watchlist databases with sub-second hit resolution.',
    status: 'ACTIVE',
    createdAt: '2026-06-25'
  },
  {
    id: 'prj-110',
    name: 'Cross-Border FX Clearing & Multi-Currency Engine',
    code: 'SVC-FX',
    product: 'CP',
    projectType: 'Manual',
    geo: 'APAC',
    owner: 'Priya Sharma',
    ownerEmail: 'priya.s@company.com',
    targetDate: '2026-12-10',
    completionPercentage: 25,
    description: 'Dynamic currency conversion (DCC) microservice for real-time forex rate lockouts across APAC payment rails.',
    status: 'ACTIVE',
    createdAt: '2026-07-10'
  },
  {
    id: 'prj-111',
    name: 'Developer Portal Open API Sandbox',
    code: 'DEV-PORT',
    product: 'DP',
    projectType: 'Manual',
    geo: 'Global',
    owner: 'Liam O\'Connor',
    ownerEmail: 'liam.o@company.com',
    targetDate: '2026-08-30',
    completionPercentage: 88,
    description: 'Interactive OpenAPI v3 docs with instant mock server environment for third-party developer onboarding.',
    status: 'ACTIVE',
    createdAt: '2026-04-01'
  },
  {
    id: 'prj-112',
    name: 'Kubernetes Multi-Cloud Resilience & Chaos Mesh',
    code: 'OPS-K8S',
    product: 'MP',
    projectType: 'Optimization',
    geo: 'Global',
    owner: 'Alex Rivera',
    ownerEmail: 'alex.r@company.com',
    targetDate: '2026-10-20',
    completionPercentage: 50,
    description: 'Automated cross-cloud failover drills using Chaos Mesh between GCP Europe and AWS Frankfurt clusters.',
    status: 'ACTIVE',
    createdAt: '2026-06-18'
  }
];

export const INITIAL_UPDATES: WeeklyUpdate[] = SAMPLE_WEEKLY_UPDATES;

export const DEFAULT_PRODUCTS: string[] = [
  'CP',
  'DP',
  'F&CP',
  'MP',
  'SP',
  'TP',
  'WP',
  'YP'
];

export const DEFAULT_GEOS: GeoRegion[] = [
  'Global',
  'EMEA',
  'NAM',
  'APAC',
  'LATAM'
];
