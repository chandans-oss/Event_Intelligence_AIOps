# Event Analytics — AIOps Platform
## Complete Technical & Project Management Documentation
**Version**: 1.0.0 | **Status**: Active Development

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Build & Development Workflow](#4-build--development-workflow)
5. [Application Architecture](#5-application-architecture)
6. [Module 1 — AIOps Dashboards](#6-module-1--aiops-dashboards)
7. [Module 2 — Events](#7-module-2--events)
8. [Module 3 — Admin](#8-module-3--admin)
9. [Module 4 — Playground Labs](#9-module-4--playground-labs)
10. [RCA Intelligence Pipeline (7 Steps)](#10-rca-intelligence-pipeline-7-steps)
11. [AI/ML Training Pipeline](#11-aiml-training-pipeline)
12. [Live Inference Engine](#12-live-inference-engine)
13. [Noise Reduction Engine](#13-noise-reduction-engine)
14. [UI Component System](#14-ui-component-system)
15. [State Management](#15-state-management)
16. [Data Models & Schemas](#16-data-models--schemas)
17. [Routing Table](#17-routing-table)
18. [Project Management Notes](#18-project-management-notes)

> **Note**: All pages and routes under the `Temp` sidebar group are excluded from this document. They are experimental and not part of the production application.

---

## 1. Project Overview

**Event Analytics** is a next-generation AIOps (Artificial Intelligence for IT Operations) platform for enterprise network operations teams. It provides:

- **Event Correlation**: Grouping raw NMS alarms into meaningful RCA clusters
- **Predictive Intelligence**: Forecasting failures before they occur using trained ML models
- **Root Cause Analysis**: A structured 7-step diagnostic pipeline from raw event to remediation
- **Noise Reduction**: 18 deduplication and suppression strategies for alert fatigue reduction
- **Knowledge Base**: Historical case retrieval to automate remediation recommendations

**Target Users**: NOC (Network Operations Center) operators, AIOps engineers, infrastructure architects

---

## 2. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React | `^18.3.1` | Component-driven UI |
| Language | TypeScript | `^5.8.3` | Strict type safety |
| Build Tool | Vite + SWC | `^5.4.19` | Fast dev server, optimized builds |
| Routing | React Router DOM | `^6.30.1` | Client-side navigation |
| Server State | TanStack Query | `^5.83.0` | Async data fetching and caching |
| Forms | React Hook Form + Zod | `^7.61.1` | Performant forms with schema validation |
| Styling | Tailwind CSS | `^3.4.17` | Utility-first CSS |
| UI Primitives | Radix UI (full suite) | various | Accessible headless components |
| Secondary UI | MUI (Material UI) | `^7.3.9` | RCA Playground complex components |
| Charts | Recharts | `^2.15.4` | Responsive charts |
| Charts | Chart.js + react-chartjs-2 | `^4.5.1` | High-density analytical charts |
| Chart Labels | chartjs-plugin-datalabels | `^2.2.0` | Inline chart value labels |
| Animations | Framer Motion | `^12.34.2` | UI animations and transitions |
| Icons | Lucide React | `^0.462.0` | SVG icon system |
| Theming | next-themes | `^0.3.0` | Light/dark mode |
| HTTP | Axios | `^1.13.6` | REST API client |
| Notifications | Sonner | `^1.7.4` | Toast system |
| Testing | Vitest + Testing Library | `^4.0.18` | Unit and integration tests |
| Linting | ESLint + typescript-eslint | `^9.32.0` | Code quality |

---

## 3. Project Structure

```
event-analytics-main/
├── docs/                             ← Project documentation
├── src/
│   ├── App.tsx                       ← Root routing definition
│   ├── main.tsx                      ← Application entry point
│   ├── index.css                     ← Global CSS tokens
│   │
│   ├── features/                     ← Domain-driven feature modules
│   │   ├── admin/
│   │   │   └── pages/
│   │   │       ├── AdminPage.tsx
│   │   │       └── KBDetailPage.tsx
│   │   ├── analytics/
│   │   │   ├── components/
│   │   │   │   ├── BehavioralPatternAnalysis.tsx
│   │   │   │   ├── MLExplainabilityPanel.tsx
│   │   │   │   ├── PatternAnalysisDashboard.tsx
│   │   │   │   └── patterns/
│   │   │   │       ├── PatternData.ts
│   │   │   │       └── PatternGallery.tsx
│   │   │   ├── data/
│   │   │   │   └── roiData.ts
│   │   │   └── pages/
│   │   │       ├── AnalyticsDashboard.tsx  ← LANDING PAGE (/)
│   │   │       ├── CorrelationPage.tsx
│   │   │       ├── KpiDashboard.tsx
│   │   │       └── PredictionDashboard.tsx
│   │   ├── events/
│   │   │   └── pages/
│   │   │       └── EventsPage.tsx
│   │   ├── rca/
│   │   │   ├── components/
│   │   │   │   ├── RcaAnalytics.tsx
│   │   │   │   ├── RcaCorrelatedEvents.tsx
│   │   │   │   ├── RcaDataEvidence.tsx
│   │   │   │   ├── RcaDiagnosisPath.tsx
│   │   │   │   ├── RcaImpactMap.tsx
│   │   │   │   ├── RcaRemediation.tsx
│   │   │   │   └── RcaSummary.tsx
│   │   │   ├── data/
│   │   │   │   ├── clusterData.ts
│   │   │   │   ├── detailedClusterData.ts
│   │   │   │   └── rcaPipelineData.ts    ← 7-step pipeline definitions
│   │   │   └── sidebars/
│   │   │       └── RcaSidebar.tsx
│   │   └── remediation/
│   │       └── pages/
│   │           └── RemediationPage.tsx
│   │
│   ├── pages/                         ← Top-level route page components
│   │   ├── DeduplicationPage.tsx
│   │   ├── SuppressionPage.tsx
│   │   ├── BulkEventProcessingPage.tsx
│   │   ├── EventProcessingPage.tsx
│   │   ├── LiveInferencePage.tsx
│   │   ├── RCAPlaygroundPage.tsx
│   │   ├── TrainingLovelablePage.tsx
│   │   ├── TrainingAnalysisPage.tsx
│   │   ├── TrainingReportPage.tsx
│   │   ├── LovelableResultsPage.tsx
│   │   └── algo-training/
│   │       ├── AlgoConfigPage.tsx
│   │       ├── AlgoTrainingPage.tsx
│   │       └── AlgoResultsPage.tsx
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── common/               ← ErrorBoundary, NotFound
│   │   │   ├── layout/
│   │   │   │   ├── LeftSidebar.tsx
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── EventFlowStepper.tsx
│   │   │   └── ui/                   ← 45+ Radix UI primitive wrappers
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx
│   │   │   └── use-toast.ts
│   │   └── lib/
│   │       ├── utils.ts              ← cn() helper
│   │       └── analysis-utils.ts    ← Report rendering utilities
│   │
│   ├── stores/
│   │   └── trainingStore.ts          ← Training config & localStorage
│   │
│   └── data/
│       ├── mock/
│       │   ├── mockData.ts           ← Core cluster mock data
│       │   └── correlationDemoData.ts
│       ├── trainingReports.ts        ← Static training report logs
│       ├── structuredTrainingData.ts ← Cross-correlation session data
│       └── lovelableReportData.ts    ← Scope target definitions
│
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Build & Development Workflow

### Scripts
```bash
npm run dev          # Start Vite dev server (port 8080, HMR enabled)
npm run build        # Production build → ./dist
npm run build:dev    # Development-mode build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run Vitest once
npm run test:watch   # Vitest in watch mode
```

### Path Alias
`@/` maps to `./src/` — use this for all cross-feature imports.

### App Bootstrap Chain
```
main.tsx
  └── <App />
        └── <QueryClientProvider>      (TanStack Query)
              └── <ThemeProvider>      (next-themes light/dark)
                    └── <TooltipProvider>
                          └── <BrowserRouter>
                                └── <ErrorBoundary>
                                      └── <Routes>
```

---

## 5. Application Architecture

### Feature-Driven Design
Each feature in `src/features/` is fully self-contained with its own components, pages, data, and sidebars. Features communicate only through shared types (`src/shared/types/`).

### Layout System
All pages are wrapped in `<MainLayout>` which renders:
- **`Navbar`** — top bar with branding and global controls
- **`LeftSidebar`** — stateful collapsible navigation (width: `w-56` expanded / `w-16` collapsed)
- **Page content area**

### Sidebar Navigation (`LeftSidebar.tsx`)
- Built with `Radix UI Collapsible` for accessible accordion behavior
- Uses `useLocation()` to auto-expand the active parent group on route change
- `openMenus: string[]` state tracks expanded groups by their root path
- Collapsed mode shows icon-only tooltips via `Radix UI Tooltip`

---

## 6. Module 1 — AIOps Dashboards

### 6.1 AIOps Dashboard (`/`) — Landing Page
**Component**: `src/features/analytics/pages/AnalyticsDashboard.tsx` (40 KB)

**Chart Library**: Chart.js registered with: `CategoryScale`, `LinearScale`, `BarElement`, `ArcElement`, `PointElement`, `LineElement`, `Filler`, `ChartDataLabels`

**Layout**: CSS Grid (`grid-2-1`, `grid-3`, `grid-2-1-wide`) using inline `<style>` scoped to the component.

**Widgets & Data Flow**:

| Widget | Chart Type | Data Source | Key Metrics |
|--------|-----------|-------------|-------------|
| Root Cause Insights | Card list | `mockClusters` via `useMemo` | Severity, Confidence %, Evidence count, Affected services |
| SLA Breach Risk | Bar chart (Chart.js) | Static: `[18,14,12,9,7]` | WiFi, Video, WAN, Internet, Voice risk % |
| Capacity Risk | Grouped Bar (Chart.js) | Static planned vs in-use | Voice, Video, WAN, WiFi, Internet capacity |
| Service Health | Doughnut + Line | Static data | Health score, trend over time |
| Asset Health Gauge | Custom Canvas arc | Static — needle at 240/300 | Red/Orange/Green arc segments, needle render |
| Predictive Risks | Progress bar rows | Static | Per-service predicted breach % |
| Active Anomalies | List rows | Static | Device name, anomaly type, timestamp |
| Recommended Actions | Action cards | Static | Action title, body, confidence badge |

**RCA Insight Logic**:
```typescript
const rcaInsightsData = useMemo(() => {
  return mockClusters
    .map(cluster => ({
      id: cluster.id,
      sev: cluster.rootEvent.severity,          // critical/high/medium
      conf: cluster.rca?.confidence * 100,      // 0-100%
      evidence: cluster.childEvents?.length,    // correlated events
      services: cluster.affectedServices?.length
    }))
    .sort((a, b) => b.services - a.services || b.conf - a.conf)
    .slice(0, 4);                                // Top 4 shown
}, []);
```

**RCA Sidebar**: Clicking "Analyze" on any RCA insight opens `RcaSidebar` as a sliding panel — powered by the full `Cluster` object from `mockData.ts`.

---

### 6.2 Topology Dashboard (`/dashboard/prediction`)
**Component**: `src/features/analytics/pages/PredictionDashboard.tsx` (43 KB)

**Purpose**: Network topology visualization showing how alarms propagate through device dependency chains.

**Key Features**:
- Interactive node-graph representing physical/logical topology
- Event flow highlighting along dependency paths
- `EventFlowStepper` component for step-by-step cascade visualization
- Scrollable topology container with diagnostic legends for AI predictions and anomalies

---

### 6.3 ROI/KPI Dashboard (`/dashboard/kpi`)
**Component**: `src/features/analytics/pages/KpiDashboard.tsx` (108 KB — largest component)

**Purpose**: Business value and operational efficiency reporting for AIOps ROI justification.

**Key Panels**:
- MTTR reduction % vs baseline
- Automation rate (manual vs automated resolutions)
- Alert volume reduction (noise suppression effectiveness)
- Cost avoidance calculations
- SLA compliance improvement trends

---

## 7. Module 2 — Events

### 7.1 Events Page (`/events`)
**Component**: `src/features/events/pages/EventsPage.tsx` (25 KB)

**Purpose**: High-velocity, real-time event list for NOC operators.

**Technical Features**:
- Multi-field filter: device, severity, category, time range
- Sortable columns with stable sort
- Horizontal scroll for wide event tables

---

## 8. Module 3 — Admin

### 8.1 Configuration (`/admin`)
**Component**: `src/features/admin/pages/AdminPage.tsx`

**Purpose**: System-wide platform settings and global configuration.

---

### 8.2 Knowledge Base Detail (`/admin/kb/:id`)
**Component**: `src/features/admin/pages/KBDetailPage.tsx` (13 KB)

**Purpose**: View and manage individual KB entries that feed back into the RCA pipeline's Step 6 (Data Correlator).

**KB Entry Structure**:
- `situation_summary` — What was happening
- `identified_rca` — Root cause label + confidence
- `applied_remedy` — Steps that resolved the issue
- `vector_embedding` — Used for similarity retrieval in RCA Step 6

---

### 8.3 Correlation Patterns (`/correlation`)
**Component**: `src/features/analytics/pages/CorrelationPage.tsx` → renders `PatternGallery`

**Purpose**: View, enable/disable, and inspect learned behavioral correlation rules.

**Pattern Data Model**:
```typescript
interface Pattern {
  id: string;
  name: string;
  domain: string;         // e.g., 'network', 'compute'
  steps: PatternStep[];   // Ordered metric sequence
  confidence: number;     // 0.0 – 1.0
  seenCount: number;      // Historical occurrence count
  lastSeen: string;
  ruleCreationDate: string;
  tags: string[];
}
```

**PatternGallery Features**:
- Live search filter on `name` and `tags`
- Toggle switch per pattern (enable/disable active inference)
- Sequence visualization: steps rendered as `Metric A -> Metric B -> Metric C`
- Failure step highlighting: steps matching `/flap|down|reboot|breach/` rendered in red
- Standard metric label normalization (`cpu_pct` → `CPU Util`, `util_pct` → `B/W Util`, etc.)

---

### 8.4 Training (`/pattern-prediction/training`)
**Component**: `src/pages/TrainingLovelablePage.tsx` (208 KB — most complex)

**Purpose**: Full ML training configuration and job execution.

**Workflow**:
1. Select training scope: `device` | `topology` | `device_group`
2. Select target entity from `SCOPE_TARGETS`
3. Choose duration: `1h` | `24h` | `7d` | `30d`
4. Select algorithms per category
5. Launch → Navigate to `TrainingAnalysisPage` per algorithm

**Duration Scaling Table**:
| Duration | Label | Sliding Windows | Batches | Entities |
|----------|-------|----------------|---------|----------|
| `1h` | 1 Hour (Recent) | 12 | 1 | 32 |
| `24h` | 24 Hours (Daily) | 288 | 4 | 32 |
| `7d` | 7 Days (Weekly) | 2,016 | 12 | 32 |
| `30d` | 30 Days (Monthly) | 8,640 | 30 | 32 |

---

### 8.5 Training Analysis (`/pattern-prediction/training/analysis/:modelId`)
**Component**: `src/pages/TrainingAnalysisPage.tsx` (22 KB)

**Purpose**: Per-algorithm diagnostic output with streaming terminal simulation.

**Pipeline Steps** (navigable via `modelId` URL param):

| modelId | Name | Type | Description |
|---------|------|------|-------------|
| `cross_correlation` | Cross Correlation | Statistical | Lagged Pearson & Spearman (±15 lags) for all metric pairs |
| `granger_causality` | Granger Causality | Statistical | F-test with OLS residuals for directional causality |
| `pre_event_behavior` | Pre Event Metric Behavior | Diagnostic | Metric shifts prior to critical events |
| `pattern_clustering` | Pattern Clustering | Unsupervised | K-Means grouping of device behaviors |
| `random_forest` | Random Forest Predictor | Ensemble | 150-tree event forecasting with feature weights |
| `sequence_mining` | Event Sequence Mining | Mining | Frequent 3-event patterns (support ≥ 2, lift ≥ 1.5) |
| `anomaly_detection` | Anomaly Detection | Unsupervised | Isolation Forest (5% contamination) |
| `co_occurrence_matrix` | Event Co-Occurrence Matrix | Statistical | Concurrent event synergy analysis |
| `failure_chain` | Failure Chain Patterns | Neural | Metric drift-to-failure cascade mapping |

**Terminal Simulation**:
- 5 batch progress bars fill simultaneously (75-min telemetry windows)
- Line-by-line log streaming at 250ms per line
- Progress tracked as `(linesShown / lines.length) * 100`
- "Next Step" button navigates to next `modelId` with `autoStart: true` in location state

---

### 8.6 Training Results (`/pattern-prediction/results`)
**Component**: `src/pages/LovelableResultsPage.tsx` (17 KB)

**Purpose**: List and filter all completed training reports stored in localStorage.

---

### 8.7 Training Report (`/pattern-prediction/report/:reportId`)
**Component**: `src/pages/TrainingReportPage.tsx` (39 KB)

**Purpose**: Full drill-down for a completed training run including algorithm outputs, metrics, and pattern discoveries.

---

## 9. Module 4 — Playground Labs

### 9.1 RCA Playground (`/playground/rca`)
**Component**: `src/pages/RCAPlaygroundPage.tsx` (27 KB)

**Purpose**: Interactive end-to-end RCA simulation. Upload an event file → backend runs the 7-step pipeline → results displayed step-by-step.

**API Integration**: Calls `runRcaFlow(file)` from `src/api/rcaApi.ts` (live backend connection).

**UI Framework**: Uses **MUI** (`ThemeProvider`, `Tabs`, `Paper`, `CircularProgress`) for this page, dynamically themed to match the app's light/dark mode via `next-themes`.

**Step Flow** (7 steps rendered as animated tabs):

| Step | Title | Icon | Key Output Fields |
|------|-------|------|-------------------|
| 0 | Event Pre-processing / Correlation | 🚨 | Dedup/Suppress/Normalize completion |
| 1 | Orchestration | 📊 | Incident ID, Device, Interface, KPIs table, Logs, Goal |
| 2 | Intent Routing | 🎯 | Selected Intent, Score, Top 3 Intents, Signal+Log matches |
| 3 | Hypothesis Scoring | 🔍 | Top Hypothesis, All scores, Log Evidence per hypothesis |
| 4 | Situation Card | 📋 | Situation ID, Summary text, Input data JSON, Embedding note |
| 5 | Historical Data Retriever | 📚 | Query, Top case match, Retrieved cases with sim scores |
| 6 | RCA Correlator Engine | 🔗 | Final RCA, Confidence, Key Evidence metrics, Proposed Remedy |

**Animation Logic**: Steps reveal at 800ms intervals with 1200ms display time each. `animationRef` (useRef) manages the timeout chain. Can be restarted at any time.

**KPI Label Map** (raw signal → display label):
```typescript
const KPI_MAP = {
  "utilization_percent": ["Bandwidth Utilization", "%"],
  "cpu_percent":         ["CPU Utilization", "%"],
  "mem_percent":         ["Memory Utilization", "%"],
  "latency_ms":          ["Latency", " ms"],
  "crc_errors":          ["CRC Errors", " pkts"],
  "out_discards":        ["Output Errors", " pkts"],
  "queue_depth":         ["Buffer Utilization", " pkts"],
  ...
}
```

---

### 9.2 Event Deduplication Lab (`/event-processing/deduplication`)
**Component**: `src/pages/DeduplicationPage.tsx` (19 KB)

**Technique Selection**: URL param `?technique=<key>` controls the active algorithm.

| Technique Key | Name | Algorithm |
|---------------|------|-----------|
| `exact` | Exact Match | SHA256 of raw log string; Set membership check |
| `structured` | Structured Exact | Signature `{device}\|{interface}\|{event_code}` dedup |
| `state` | State Transition | Suppresses if state (UP/DOWN) is unchanged |
| `template` | Template-Based | Normalize logs into templates before comparing |
| `similarity` | Similarity-Based | TF-IDF + Cosine distance; threshold: 0.90 |
| `semantic` | Semantic-Based | LLM embedding cluster matching |

**Data Types**:
```typescript
interface RawEvent {
  id: number;
  raw: string;        // Full syslog string
  device: string;
  interface: string;
  event_code: string;
  timestamp: string;
}

interface DedupResult {
  id: number;
  is_duplicate: boolean;
  group_id: string;
  reason: string;
  confidence?: number;
  logic_details?: Record<string, any>;  // Technique-specific trace
}
```

**UI Pattern**: Split view — event list (2/3 width) + sliding detail panel (1/3 width) when an event is selected. Detail panel shows Status badge, Reasoning, Raw Payload, Internal Trace, and Confidence Score bar.

---

### 9.3 Event Suppression Lab (`/event-processing/suppression`)
**Component**: `src/pages/SuppressionPage.tsx` (21 KB)

**Policy Selection**: URL param `?technique=<key>`.

| Policy Key | Name | Logic |
|------------|------|-------|
| `maintenance` | Maintenance Window | Calendar-based suppression during planned downtime (e.g., `MW-101: 02:00–04:00`) |
| `business_hours` | Business Hours | Non-critical assets silenced outside `09:00–18:00` |
| `tag_based` | Tag-Based | `env=dev` or `env=test` metadata filtering |
| `parent_child` | Parent-Child Topology | Downstream child events suppressed if parent event is active |
| `spatial` | Spatial | Regional aggregation of concurrent events |
| `dedup_suppress` | Dedup-Based | Sub-second high-frequency repeat removal |
| `time_window` | Time-Window | Sliding window redundant event suppression |
| `flap_detection` | Flap Detection | Oscillation count check (e.g., 4 transitions in 10s → FLAPPING) |
| `temporal_cluster` | Temporal Cluster | Grouping temporally proximate events |
| `dynamic_threshold` | Dynamic Threshold | p95 learned baseline — suppresses if value within normal range |
| `event_storm` | Event Storm | Pattern-matched aggregated suppression during major incidents |
| `seasonal` | Seasonal | Recognition of periodic recurring event signatures |

**Suppression Result Schema**:
```typescript
interface SuppressionResult {
  id: number;
  is_suppressed: boolean;
  category: string;       // Policy category name
  reason: string;         // Human-readable explanation
  policy_id?: string;     // e.g., "MW-101", "BH-99"
  logic_details?: {
    window?: string;
    activeCalendar?: string;
    topologyPath?: string;
    transitions?: string;
    currentVal?: string;
    baselineP95?: string;
    decision?: string;
  };
}
```

---

### 9.4 Bulk Event Processing (`/event-processing/bulk-processing`)
**Component**: `src/pages/BulkEventProcessingPage.tsx` (27 KB)

**Purpose**: Batch-process large event volumes through suppression/deduplication pipelines simultaneously.

---

### 9.5 Live Inference (`/pattern-prediction/live-inference`)
**Component**: `src/pages/LiveInferencePage.tsx` (74 KB)

See full detail in **Section 12 — Live Inference Engine**.

---

## 10. RCA Intelligence Pipeline (7 Steps)

**Source**: `src/features/rca/data/rcaPipelineData.ts`

### Step 0 — Event Pre-Processing / Correlation
- Input: Raw NMS trigger event batch
- Process: Deduplication, suppression, normalization
- Output: Correlated event group ready for incident creation

### Step 1 — Orchestration
- Input: Correlated events
- Output: Enriched Incident `{incident_id, device, resource_name, signals{}, logs[], goal}`
- Telemetry collected: `cpu_percent`, `mem_percent`, `utilization_percent`, `in_errors`, `out_discards`, `latency_ms`, `packet_loss_percent`, `traffic_dscp0_percent`

### Step 2 — Intent Router
- Input: Enriched incident + Intent Library
- Scoring: Each intent scored by signal threshold hits + log keyword matches
- Output: Ranked intent list. Key intents: `performance.congestion`, `system.cpu_high`, `link.down`, `link.flap`, `thermal.*`, `routing.bgp_down`, `security.ddos`
- Example output: `performance.congestion (1.3) > system.cpu_high (0.8) > link.high_errors (0.3)`

### Step 3 — Hypothesis Scorer
- Input: Best intent + Hypotheses Library
- Each hypothesis has: `signal_score` (numeric) + `log_score` (keyword match)
- Example:
  ```
  H_QOS_CONGESTION:  signal=0.9, log=0.6, total=1.5 ← Selected
  H_BACKUP_TRAFFIC:  signal=0.8, log=0.3, total=1.1
  H_PEAK_TRAFFIC:    signal=0.4, log=0.0, total=0.4
  ```

### Step 4 — Situation Builder
- Input: Incident + top intent + top hypothesis
- Output: Situation Card `{situation_id, situation_text, metadata{device, resource, filled_stats}, vector_embedding}`
- Situation card written to current vector DB for future retrieval

### Step 5 — Historical Data Retriever
- Input: Situation card as vector query
- Process: Semantic similarity search in historical KB using vector embeddings
- Output: Top-N similar cases `{case_id, sim_score, rca, remedy, sit_summary}`
- Similarity threshold typically `> 0.84`. Top average similarity: `0.8481`
- Confidence boost applied: `+0.15`

### Step 6 — RCA Correlator Engine
- Input: All prior aggregated data + historical cases
- Output:
  ```typescript
  {
    rca: string;              // Root cause label
    confidence: number;       // 0.0–1.0
    remedy: string[];         // Ordered remediation steps
    evidence_used: {id, metric, value}[];
    explanation: string;      // Human-readable narrative
  }
  ```

---

## 11. AI/ML Training Pipeline

### Algorithm Catalog

**Time Series (Supervised)**
| ID | Name | Description |
|----|------|-------------|
| `ts-linreg` | Linear Regression | Fit linear trend to time-series features for event prediction |
| `ts-xgboost` | XG Boost | Gradient boosted trees optimized for tabular classification |
| `ts-rf` | Random Forest | 150-tree ensemble with bagging for robust prediction |

**Clustering (Unsupervised)**
| ID | Name | Description |
|----|------|-------------|
| `cluster-kmeans` | K-Means | Partition windows into k=4 behavioral clusters by centroid distance |

**Anomaly Detection**
| ID | Name | Description |
|----|------|-------------|
| `anom-isoforest` | Isolation Forest | 5% contamination rate to flag outlier windows |

**Pattern Matching**
| ID | Name | Description |
|----|------|-------------|
| `pattern-seq` | Sequence Mining | Frequent 3-event patterns with support ≥ 2 and lift ≥ 1.5 |
| `pattern-chains` | Failure Chains | Metric cascade chains leading to failure events |

**Statistical**
| ID | Name | Description |
|----|------|-------------|
| `stat-xcorr` | Cross Correlation | Lagged Pearson & Spearman for all metric pairs (±15 lags) |
| `stat-granger` | Granger Causality | F-test with OLS residuals to detect causal metric relationships |

### Training Config Schema
```typescript
interface TrainingConfig {
  duration: '1h' | '24h' | '7d' | '30d';
  trainingScope: 'device' | 'topology' | 'device_group';
  selectedTarget: string;
  algorithms: {
    timeSeries: string[];
    clustering: string[];
    statistical: string[];
    patternMatching: string[];
  };
  anomaly: string[];
}
```

### Default Configuration
```typescript
{
  duration: '30d',
  trainingScope: 'topology',
  selectedTarget: 'topo-dc-west',
  algorithms: {
    timeSeries: ['ts-rf'],
    clustering: ['cluster-kmeans'],
    statistical: ['stat-granger', 'stat-xcorr'],
    patternMatching: ['pattern-seq', 'pattern-chains'],
  },
  anomaly: ['anom-isoforest']
}
```

---

## 12. Live Inference Engine

**Component**: `src/pages/LiveInferencePage.tsx`

### Loaded Model Artifacts
| File | Type | Purpose |
|------|------|---------|
| `iso_router.pkl` | Anomaly | Isolation Forest — router anomalies |
| `iso_switch.pkl` | Anomaly | Isolation Forest — switch anomalies |
| `kmeans_router.pkl` | Pattern | K-Means — router behavioral clustering |
| `kmeans_switch.pkl` | Pattern | K-Means — switch behavioral clustering |
| `rf_router_HIGH_LATENCY.pkl` | RF | Router latency failure predictor |
| `rf_router_HIGH_UTIL_WARNING.pkl` | RF | Router utilization predictor |
| `rf_router_INTERFACE_FLAP.pkl` | RF | Router flap predictor |
| `rf_router_PACKET_DROP.pkl` | RF | Router packet drop forecaster |
| `rf_switch_HIGH_UTIL_WARNING.pkl` | RF | Switch utilization predictor |
| `rf_switch_INTERFACE_FLAP.pkl` | RF | Switch flap predictor |
| `rf_switch_PACKET_DROP.pkl` | RF | Switch packet drop forecaster |
| `scaler_router.pkl` | Scaler | Feature normalization — routers |
| `scaler_switch.pkl` | Scaler | Feature normalization — switches |

### Failure Chain Templates

| Template ID | Label | Occurrences | Confidence | Sequence |
|------------|-------|-------------|-----------|----------|
| `HIGH_LATENCY_VALIDATED` | High Latency | 289 | 0.72 | CPU Util Rise (R1) → CRC Errors (SW1, +10m) → Buffer Util Rise (SW2, +20m) → Latency Rise (FW1, +30m) |
| `PACKET_DROP_CASCADE` | Packet Drop | 412 | 0.81 | Buffer Util Rise → CRC Errors (+5m) → Latency Rise (+10m) → Packet Drop (+5m) |
| `CONFIG_DRIFT_CHAIN` | High Latency (Config) | 156 | 0.68 | Config Change → Peer Down (+5m) → CRC Errors (+10m) → Latency Rise (+10m) |
| `INTERFACE_FLAP_STORM` | Interface Flap | 532 | 0.82 | B/W Util Rise → Buffer Util Rise (+4m) → CRC Errors (+2m) → Packet Loss (+5m) |

### Confidence Jump Logic
```typescript
const CONFIDENCE_JUMPS = [0.32, 0.55, 0.74, 0.89, 1.0, 1.0];
// Index = number of steps confirmed (0-based)
// Each confirmed step bumps confidence to next jump value

const GAP_PENALTY = 0.12;
// Deducted per missing step between two confirmed steps
```

### Polling Engine
- **Default Poll Interval**: 30 seconds (configurable to 5s)
- **Warm-up Phase**: 15 polls required before inference activates (stabilizes sliding windows)
- **Processing State Machine**: `PAUSED → IDLE → PROCESSING → IDLE`
- **Sliding Window**: Each poll generates a fresh 75-minute `{startTime, endTime}` window
- **Inference Output Types**: `PREDICTION`, `ANOMALY`, `PROGRESSIVE`
- **Status Labels**: `CRITICAL`, `WARNING`, `WATCH`, `HEALTHY`, `ANALYZED`

### View Modes
1. **Default** — Live inference stream (latest predictions/anomalies)
2. **Pattern Match** — Active chain matches per device with step progress
3. **Progressive** — Step-by-step timeline of a pattern confirming over 6 poll cycles

---

## 13. Noise Reduction Engine

### Standardized Metric Labels
| Raw Key | Canonical Display |
|---------|------------------|
| `cpu_pct`, `cpu_percent` | CPU Util |
| `util_pct`, `utilization_percent` | B/W Util |
| `mem_util_pct`, `men_util_pct` | Mem Util |
| `queue_depth`, `buffer_util` | Buffer Util |
| `latency_ms` | Latency |
| `crc_errors`, `crc` | CRC Errors |
| `packet_loss` | Packet Loss |
| `packet_drop` | Packet Drop |

Label normalization is applied identically in `LiveInferencePage.tsx`, `PatternGallery.tsx`, and `TrainingLovelablePage.tsx` via a shared `formatLabel()` function.

### Deduplication Techniques (6)
See Section 9.2 for full detail.

### Suppression Policies (12)
See Section 9.3 for full detail.

---

## 14. UI Component System

### Atomic Primitives (45+) — `src/shared/components/ui/`
All Radix UI-based, styled with Tailwind CSS.

`Accordion`, `Alert`, `AlertDialog`, `AspectRatio`, `Avatar`, `Badge`, `Breadcrumb`, `Button`, `Calendar`, `Card`, `Carousel`, `Chart`, `Checkbox`, `Collapsible`, `Command`, `ContextMenu`, `Dialog`, `Drawer`, `DropdownMenu`, `Form`, `HoverCard`, `Input`, `InputOtp`, `Label`, `Menubar`, `NavigationMenu`, `Pagination`, `Popover`, `Progress`, `RadioGroup`, `ResizablePanels`, `ScrollArea`, `Select`, `Separator`, `Sheet`, `Sidebar`, `Skeleton`, `Slider`, `Sonner`, `Switch`, `Table`, `Tabs`, `Textarea`, `Toast`, `Toggle`, `ToggleGroup`, `Tooltip`

### Utility Function
```typescript
// src/shared/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
Used everywhere for conditional/dynamic Tailwind class composition.

---

## 15. State Management

| Layer | Technology | Storage | Scope |
|-------|-----------|---------|-------|
| Server State | TanStack Query | In-memory cache | Async API data |
| Training Config | localStorage key `npm_training_config` | Persistent | Training job setup |
| Training Reports | localStorage key `npm_training_reports` | Persistent (max 50) | Historical job reports |
| Sidebar State | `useState` | Session | Open menus, collapsed state |
| URL State | `useSearchParams` | URL | Active dedup/suppression technique |
| Local UI State | `useState` / `useRef` | Render | Selected items, animations, modals |

---

## 16. Data Models & Schemas

### TrainingReport
```typescript
interface TrainingReport {
  id: string;
  timestamp: string;
  config: TrainingConfig;
  status: 'completed' | 'failed';
  duration: string;
  windowCount: number;
  entityCount: number;
  results: any;
}
```

### InferenceItem (Live Engine)
```typescript
interface InferenceItem {
  id: string;
  timestamp: string;
  device: string;
  interface: string;
  type: 'PREDICTION' | 'ANOMALY' | 'PROGRESSIVE';
  event: string;
  confidence: number;
  pattern?: string;
  topology?: string;
  status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'ANALYZED' | 'WATCH';
  estimatedWait?: string;
  predictedTime?: string;
}
```

### PatternMatchItem (Live Engine)
```typescript
interface PatternMatchItem {
  id: string;
  device: string;
  deviceType: string;
  prefix: string;
  ip: string;
  model: string;
  interface: string;
  timestamp: string;
  currentStep: number;
  confidence: number;
  templateId: string;
  topology?: string;
  steps: PatternStep[];  // {status:'arrived'|'gap'|'pending', timestamp?, confValue?}
}
```

### Cluster (RCA Core)
```typescript
interface Cluster {
  id: string;
  rootEvent: Event;
  childEvents: Event[];
  rca: { rootCause: string; confidence: number; };
  affectedServices: string[];
}
```

---

## 17. Routing Table (Production Routes Only)

| Route | Component | Module |
|-------|-----------|--------|
| `/` | `AnalyticsDashboard` | Dashboard — Landing |
| `/dashboard/prediction` | `PredictionDashboard` | Dashboard — Topology |
| `/dashboard/kpi` | `KpiDashboard` | Dashboard — ROI/KPI |
| `/events` | `EventsPage` | Events |
| `/admin` | `AdminPage` | Admin — Config |
| `/admin/kb/:id` | `KBDetailPage` | Admin — KB |
| `/correlation` | `CorrelationPage` | Admin — Patterns |
| `/pattern-prediction/training` | `TrainingLovelablePage` | Admin — Training |
| `/pattern-prediction/training/analysis/:modelId` | `TrainingAnalysisPage` | Admin — Training |
| `/pattern-prediction/results` | `LovelableResultsPage` | Admin — Results |
| `/pattern-prediction/report/:reportId` | `TrainingReportPage` | Admin — Report |
| `/playground/rca` | `RCAPlaygroundPage` | Playground — RCA |
| `/event-processing/deduplication` | `DeduplicationPage` | Playground — Dedup |
| `/event-processing/suppression` | `SuppressionPage` | Playground — Suppression |
| `/event-processing/bulk-processing` | `BulkEventProcessingPage` | Playground — Bulk |
| `/pattern-prediction/live-inference` | `LiveInferencePage` | Playground — Live |
| `/docs` | `DocsPage` | Documentation |
| `*` | `NotFound` | 404 |

---

## 18. Project Management Notes

### File Complexity Reference
| File | Size | Notes |
|------|------|-------|
| `KpiDashboard.tsx` | 108 KB | Largest single page |
| `TrainingLovelablePage.tsx` | 208 KB | Most complex workflow |
| `LiveInferencePage.tsx` | 74 KB | Real-time polling engine |
| `AnomaliesPage.tsx` | 75 KB | (Under Temp — excluded) |
| `PatternPage.tsx` | 79 KB | (Under Temp — excluded) |
| `clusterData.ts` | 83 KB | Large static dataset |
| `trainingReports.ts` | 86 KB | Large static log dataset |

### Development Guidelines
- Use `@/` path alias for all imports across feature boundaries
- All pages must be wrapped in `<MainLayout>`
- Use `cn()` for all conditional Tailwind class composition
- Persist long-running configs via `trainingStore.ts` pattern (localStorage)
- New routes must be added to `src/App.tsx` and `src/shared/components/layout/LeftSidebar.tsx`

### API Integration Readiness
- All data fetching is structured for TanStack Query hooks
- Replace `src/data/mock/` imports with API calls at hook level
- Axios instance in `src/api/` ready for auth header injection via interceptors
- RCA Playground already has live backend call (`src/api/rcaApi.ts`)

### Testing
- `vitest` test runner with `jsdom` environment
- `src/data/mock/mockData.test.ts` validates core data integrity
- Use `@testing-library/react` for component tests

---
*Event Analytics AIOps Platform | Technical Documentation v1.0.0*
*Excludes all pages/routes under the Temp sidebar group*
