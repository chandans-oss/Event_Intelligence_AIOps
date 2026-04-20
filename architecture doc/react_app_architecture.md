# Event Analytics AIOps Platform — Frontend Architecture Documentation

> **Project:** `event-analytics-main` | **Framework:** React + Vite + TypeScript + Tailwind CSS
> **Note:** Pages listed under the "Tmp / UI (Draft)" sidebar section are excluded per request.

---

## Table of Contents

1. [Route & Page Map](#1-route--page-map)
2. [Page-by-Page Data Inventory](#2-page-by-page-data-inventory)
3. [Hardcoded JSON / Mock Data Files](#3-hardcoded-json--mock-data-files)
4. [Third-Party Library Catalog](#4-third-party-library-catalog)

---

## 1. Route & Page Map

Routing is defined in `src/App.tsx` using `react-router-dom`.

| Route Path | Component File | Page Title |
|---|---|---|
| `/` | `AnalyticsDashboard.tsx` | Analytics Dashboard (Main) |
| `/dashboard/alarm-prediction` | `AlarmPredictionDashboard.tsx` | Alarm Prediction |
| `/dashboard/kpi` | `KpiDashboard.tsx` | KPI Dashboard |
| `/dashboard/rca-analysis` | `RcaAnalysisDashboard.tsx` | RCA Analysis Dashboard |
| `/dashboard/roi` | `RoiDashboard.tsx` | ROI Dashboard |
| `/dashboard/prediction` | `PredictionDashboard.tsx` | Topology Prediction |
| `/events` | `EventsPage.tsx` | Event Command Center |
| `/rca/detail/:id` | `RcaImpactPage.tsx` | Root Cause Analysis (Detail) |
| `/remediation` | `RemediationPage.tsx` | Payload Orchestrator (Remediation) |
| `/preprocessing` | `PreprocessingPage.tsx` | Event Pre-Processing |
| `/clustering` | `ClusteringPage.tsx` (AnomalyDetection) | Anomaly Detection |
| `/algo-training/*` | `TrainingLovelablePage.tsx` | Algorithm Training Report |
| `/pattern-prediction/*` | `PatternPredictionPage.tsx` | Pattern Prediction |
| `/playground/rca` | `RCAPlaygroundPage.tsx` | RCA Playground |
| `/deduplication` | `DeduplicationPage.tsx` | Deduplication Lab |
| `/suppression` | `SuppressionPage.tsx` | Suppression Lab |
| `/bulk-processing` | `BulkEventProcessingPage.tsx` | Bulk Processing Lab |

---

## 2. Page-by-Page Data Inventory

### `/` — Analytics Dashboard (`AnalyticsDashboard.tsx`)

**Purpose:** Main AIOps command center. Shows active clusters, intent breakdown, live metric trends, and link information.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Active Clusters Table | `mockClusters` (mockData.ts) | Cluster ID, severity, root event, RCA status, affected users |
| Intent Category Chart | `linkCongestionIntent` (mockData.ts) | Doughnut chart of intent categories |
| Link Congestion Metrics | `linkCongestionMetrics` (mockData.ts) | Utilization, latency, queue drops per link |
| Suppression Rules | `mockSuppressionRules` (mockData.ts) | Active suppression policies |
| Correlation Rules | `mockCorrelationRules` (mockData.ts) | Pattern correlation rules |
| KB Articles | `mockKBArticles` (mockData.ts) | Runbook/knowledge base articles |
| Summary Stats | Derived from `mockClusters` | Total events, critical count, MTTR, confidence |

**On-Click / Interaction:**
- Click a cluster row → RCA Sidebar slides in from right (RCA detail for that cluster)
- "Run Remediation" button in RCA Sidebar → Remediation Sidebar replaces it (remediationSteps from `clusterData.ts`)
- "Go to RCA" button → navigates to `/rca/detail/:id`

---

### `/dashboard/alarm-prediction` — Alarm Prediction Dashboard (`AlarmPredictionDashboard.tsx`)

**Purpose:** Live streaming visualization of predicted vs. actual alarm metrics with threshold breach alerts.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Live Metric Chart | Inline `useState` + `setInterval` | Recharts `AreaChart` with auto-generated streaming data |
| Prediction vs. Actual | Computed synthetic data | Upper/Lower confidence bands, forecasted values |
| Alert Threshold Lines | Hardcoded inline values | `ReferenceLine` overlays |
| Summary KPIs | Derived from chart state | Alarm count, prediction accuracy, detection lead time |

> **Note:** This page simulates live streaming with `setInterval` and does **not** connect to a real API.

---

### `/dashboard/kpi` — KPI Dashboard (`KpiDashboard.tsx`)

**Purpose:** Visualizes AIOps pipeline performance — noise reduction, MTTR improvement, RCA accuracy, and auto-remediation success.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Noise Reduction Over Time | `resultsData.ts` (`buildNoiseReductionData`) | Recharts `AreaChart` (monthly trend) |
| MTTR Improvement | `resultsData.ts` (`buildMTTRData`) | Line chart comparing manual vs. AI-driven MTTR |
| RCA Accuracy | `resultsData.ts` (`buildRCAAccuracyData`) | Monthly accuracy % bar chart |
| Auto-Remediation Success | `resultsData.ts` (`buildAutoRemediationData`) | Success/failure rate trend |
| Pipeline Stage Stats | Direct inline data in component | Cards showing events processed per stage |
| Top Cluster Types | Derived from `mockClusters` | Most frequent cluster types |

---

### `/dashboard/rca-analysis` — RCA Analysis Dashboard (`RcaAnalysisDashboard.tsx`)

**Purpose:** High-level analytics on Root Cause Analysis performance, intent distribution, and confidence scoring.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Intent Distribution | `mockClusters` + `linkCongestionIntent` | Pie/Doughnut chart of RCA intents |
| Confidence Score Histogram | `mockClusters` | Bar chart of RCA confidence distribution |
| Top Root Causes | `mockClusters` + inline data | Ranked list of most common root causes |
| RCA Time-to-Complete | Inline hardcoded data | Avg. pipeline completion time per stage |
| Hypothesis Scores | `mockClusters[*].rca.hypotheses` | Top hypothesis per cluster |

---

### `/dashboard/roi` — ROI Dashboard (`RoiDashboard.tsx`)

**Purpose:** Business value visualization — operational savings, engineer hours saved, MTTR delta, and infrastructure cost impact.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Cost Savings Chart | Inline hardcoded array `ROI_DATA` | Monthly savings in USD (Recharts `AreaChart`) |
| MTTR Delta | Inline `MTTR_COMPARISON` | Bar chart comparing before/after MTTR |
| FTE Efficiency | Inline `FTE_DATA` | Bar chart: manual hours vs. AI-automated hours |
| KPI Summary Cards | Inline computed values | Total events suppressed, MTTR reduction %, cost saved |
| Noise Reduction Impact | `resultsData.ts` | Line chart of events filtered per month |

---

### `/dashboard/prediction` — Topology Prediction (`PredictionDashboard.tsx`)

**Purpose:** SVG-based interactive network topology visualization with predictive alarm overlays and Framer Motion animations.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Network Topology SVG | Inline `NODES` and `EDGES` arrays (hardcoded) | Router/Switch/Server nodes with connections |
| Alarm Predictions | Inline `PREDICTED_ALARMS` array | Predicted alarm severity per node |
| Metric Sparklines | Inline mock time-series per node | CPU, Latency, Bandwidth mini-charts |
| Confidence Bands | Computed from predictions | Probability scores displayed on node tooltips |

---

### `/events` — Event Command Center (`EventsPage.tsx`)

**Purpose:** Main event management page with filtering, pagination, RCA sidebar, and remediation workflow.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Events Table | `mockClusters` (all clusters + child events) | Event ID, source, severity, status, timestamp |
| RCA Sidebar | `mockClusters[selectedId]` | Root cause, hypothesis, confidence, affected services |
| Remediation Sidebar | `clusterData.ts` (`getClusterData()`) | Step-by-step remediation actions |
| Summary Stats | Derived from `mockClusters` | Total events, critical count, processing stats |
| Filter State | Local `useState` | Severity, status, date range filters |

**On-Click / Interaction:**
- Click event row → opens RCA Sidebar
- "Start Remediation" in RCA Sidebar → swaps to Remediation Sidebar
- Pagination state is local

---

### `/rca/detail/:id` — RCA Impact (`RcaImpactPage.tsx`)

**Purpose:** Detailed RCA processing view showing 6-stage pipeline status, matched signals, similar cases, and remediation recommendations.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Processing Clusters List | `mockClusters` (filtered: Active/Pending) | Cluster cards with pipeline progress |
| Stage Progress | `getClusterProcessingState()` (local hardcoded map) | Stage 1–6 status per cluster |
| RCA Results | `getClusterRCAResult()` (local inline data) | Root cause, confidence, signals, similar cases |
| Matched Signals | Inline in `getClusterRCAResult` | Interface Utilization, Queue Drops, DSCP0 values |
| Similar Past Incidents | Inline `similarCases` array | Past incident IDs with similarity % |
| Recommendations | Inline `recommendations` array | Step-by-step fix actions |
| Timeline View | Derived from `mockClusters` dates | Stage-level gantt-style timeline |

---

### `/remediation` — Payload Orchestrator (`RemediationPage.tsx`)

**Purpose:** Guided, step-by-step remediation execution view with terminal log, runbook, and post-verification metrics.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Remediation Steps | `clusterData.ts` (`getClusterData()`) | Ordered list of actions with commands and verifications |
| Terminal Logs | Local `useState` (runtime) | CLI-style log of executed commands |
| Runbook Articles | `clusterData.ts` (`remediationKB`) | AI KB references with relevance scores |
| Verification Metrics | `VERIFICATION_METRICS` (inline in component) | Before/after: Latency, Packet Loss, Queue Drops, Bandwidth |
| Timeline | `TIMELINE_DATA` (inline in component) | Event timestamps from detection → resolution |
| History / Archive | Computed | MTTR gain, health recovery %, audit score |

---

### `/preprocessing` — Event Pre-Processing (`PreprocessingPage.tsx`)

**Purpose:** File upload page for normalizing and ingesting raw event data (CSV/Excel).

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Processing Metrics | `processingStats` (mockData.ts) | Total events uploaded, normalized, errors |
| Processing Steps | `processingSteps` (inline in component) | 5-step pipeline with status indicator |
| Data Preview Table | Inline hardcoded array (5 rows) | Sample event rows: timestamp, source, alert type, severity, message |
| Progress Bars | `useState` (uploadProgress, processingProgress) | Upload 100%, processing 75% (static) |

---

### `/clustering` — Anomaly Detection (`ClusteringPage.tsx`)

**Purpose:** Displays detected outliers from Isolation Forest and DBSCAN algorithms with metric deviation charts and ML explainability.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Detected Outliers Table | `mockAnomalies` (inline in component) | Device, interface, metric, observed, expected, anomaly score |
| Historical Metric Chart | `mockHistoricalData` (inline in component) | Recharts `AreaChart` — actual vs. baseline with anomaly spike |
| ML Explainability Panel | `selectedAnomalyData` (derived from selected anomaly) | Feature importance, model decision (Isolation Forest/DBSCAN), pipeline stages |

---

### `/algo-training/*` — Algorithm Training Report (`TrainingLovelablePage.tsx`)

**Purpose:** Comprehensive multi-tab ML training analytics report with clustering plots, co-occurrence heatmaps, correlation Venn diagrams, and pre-event analysis.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| K-Means Cluster Plot | `LOVELABLE_REPORT_DATA (D)` from `lovelableReportData.ts` | PCA-projected 2D scatter plot of clusters |
| Cluster Donut | `D.clR`, `D.clS` | Cluster size % donut chart |
| Resource Anomaly Heatmap | `D.anomalyHeatmap` | CPU/Mem/Latency/Buffer/CRC per entity |
| Event Co-occurrence Matrix | `D.assocR`, `D.assocS` | Lift score heatmap (association rules) |
| Correlation Venn Diagrams | `D.corrR` | Metric pair correlation % and lag |
| Causal Venn Diagrams | `D.causalR` | Granger causality: cause → effect |
| Multivariate Spike Plot | `D.anomalyHeatmap` | SVG polyline chart across features |
| Pre-Event Pattern | `PreEventData` from `lovelableReportData.ts` | Pre-fault metric delta bars |
| RF Feature Importance | `RFData` from `lovelableReportData.ts` | Random Forest feature weights |
| Scope Targets | `SCOPE_TARGETS` from `lovelableReportData.ts` | Target device/link list |

---

### `/playground/rca` — RCA Playground (`RCAPlaygroundPage.tsx`)

**Purpose:** Interactive RCA demo — upload a CSV event file and watch the 7-step agentic RCA pipeline execute in real time. Connects to the real Django backend API.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Timeline Flow | `RCA_STEP_CONFIG` (inline configuration) | 7-step visual stepper (Step 0–6) |
| Step Cards | `runRcaFlow(file)` → Django API response | Real streaming data parsed per step |
| Orchestration (Step 1) | API: `incident.signals` | Device KPIs in tabular view |
| Intent Routing (Step 2) | API: `incident.intent_output` | Selected intent, score, top 3 alternatives |
| Hypothesis Scoring (Step 3) | API: `incident.hypotheses` | Top hypothesis, scores, log evidence |
| Situation Card (Step 4) | API: `incident.situation_card` | Situation ID, summary, embedded metadata |
| Historical Retriever (Step 5) | API: `incident.historical.retrieved_cases` | Matched past cases with similarity scores |
| RCA Correlator (Step 6) | API: `incident.correlator_llm_output` | Final RCA, confidence, evidence, remedy |

> **Note:** This is the **only page** that makes real API calls to the Django backend (`src/api/rcaApi.ts`).

---

### `/deduplication` — Deduplication Lab (`DeduplicationPage.tsx`)

**Purpose:** Interactive lab to test 6 deduplication techniques on sample network events.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Events Table | `SAMPLE_EVENTS` (inline in component — 15 events) | Device, interface, raw syslog message |
| Dedup Results | Computed by `runDedup()` (client-side simulation) | Is_duplicate, group_id, reason |
| Event Insight Panel | Derived from selected event | Status badge, technique, reasoning, raw payload, internal trace |
| Technique | URL search param `?technique=` | exact / structured / state / template / similarity / semantic |

**Techniques Available:**
- Exact Match (SHA256), Structured Exact, State Transition, Template-Based, Similarity-Based, Semantic-Based

---

### `/suppression` — Suppression Lab (`SuppressionPage.tsx`)

**Purpose:** Interactive lab to test 12 suppression techniques on 15 sample network events.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Events Table | `SAMPLE_EVENTS` (inline in component — 15 events) | Device, interface, raw syslog message |
| Suppression Results | Computed by `runSuppression()` (client-side simulation) | Is_suppressed, category, reason, policy_id |
| Suppression Insight Panel | Derived from selected event | Status, reason, internal logic trace, raw log |
| Technique | URL search param `?technique=` | 12 techniques (maintenance, flap, tag-based, etc.) |

**Techniques Available:**
- Maintenance Window, Business Hours, Tag-Based, Parent-Child, Spatial, Dedup-Based, Time-Window, Flap Detection, Temporal Cluster, Dynamic Threshold, Event Storm, Seasonal

---

### `/bulk-processing` — Bulk Processing Lab (`BulkEventProcessingPage.tsx`)

**Purpose:** Upload large Excel event dumps and run the full dedup + suppression pipeline to extract actionable signals.

**Data Displayed:**
| Section | Data Source | Description |
|---|---|---|
| Summary Stats | Hardcoded in `useMemo` (after processing) | Total: 10,000 / Duplicates: 3,500 / Suppressed: 4,000 / Actionable: 2,500 |
| Trace Grid | `MOCK_EVENTS` (inline — 15 events) | Event ID, device, message, duplicate/suppressed/actionable status |
| Logic Breakdown Sidebar | `logicStats` (inline computed) | Per-logic event counts (Exact Match, Semantic Cluster, etc.) |
| Event Insight Panel | Selected event from `MOCK_EVENTS` | Dedup trace + suppression check trail |

---

## 3. Hardcoded JSON / Mock Data Files

All mock data is located in `src/data/` and `src/data/mock/`.

### `src/data/mock/mockData.ts` ← **Central Mock Data Hub**

| Export Name | Type | Used In | Description |
|---|---|---|---|
| `mockClusters` | `Cluster[]` | Analytics, Events, RCA, KPI dashboards | Array of 7+ clusters with rootEvent, childEvents, RCA data, affectedServices, affectedUsers |
| `linkCongestionIntent` | `object[]` | Analytics Dashboard | Intent category distribution for doughnut chart |
| `linkCongestionMetrics` | `object[]` | Analytics Dashboard | Per-link utilization, latency, queue metrics |
| `mockSuppressionRules` | `object[]` | Analytics Dashboard (sidebar) | Active suppression policies with status |
| `mockCorrelationRules` | `object[]` | Analytics Dashboard (sidebar) | Pattern correlation rule definitions |
| `mockKBArticles` | `object[]` | Analytics Dashboard + Remediation | Knowledge base article titles, relevance scores |
| `processingStats` | `object` | Preprocessing Page | `{ totalEvents, normalized, errors }` |

### `src/data/trainingData.ts`

| Export Name | Type | Used In | Description |
|---|---|---|---|
| `STEPS` | `string[]` | Training pages | Pipeline stage names |
| `FUNC_META` | `object[]` | Training pages | Stage metadata (function name, description) |
| `TRAIN_LINES` | `string[]` | Training pages | Training log messages |

### `src/data/resultsData.ts`

| Export Name | Type | Used In | Description |
|---|---|---|---|
| `buildNoiseReductionData()` | Function → array | KPI Dashboard | Monthly events in/out for reduction chart |
| `buildMTTRData()` | Function → array | KPI Dashboard | Manual vs. AI MTTR by month |
| `buildRCAAccuracyData()` | Function → array | KPI Dashboard | Monthly RCA accuracy % |
| `buildAutoRemediationData()` | Function → array | KPI Dashboard | Auto-remediation success/failure trend |

### `src/data/lovelableReportData.ts`

| Export Name | Type | Used In | Description |
|---|---|---|---|
| `LOVELABLE_REPORT_DATA (D)` | Large object | Training Report Page | Contains: `clR` / `clS` (clusters), `assocR` / `assocS` (association rules), `corrR` (correlations), `causalR` (causality), `anomalyHeatmap` |
| `RFData` | `object[]` | Training Report Page | Random Forest feature importance per metric |
| `SCOPE_TARGETS` | `string[]` | Training Report Page | List of target devices/interfaces |
| `PreEventData` | `object[]` | Training Report Page | Pre-event metric comparison (normal vs. pre-fault) |

### `src/features/rca/data/clusterData.ts`

| Export Name | Type | Used In | Description |
|---|---|---|---|
| `getClusterData(id)` | Function → `ClusterSpecificData` | Remediation Page, RCA Sidebar | Returns per-cluster remediation steps, KB articles, RCA metadata |
| `ClusterSpecificData.remediationSteps` | `RemediationStep[]` | Remediation Page | Steps with action, command, verification, duration, phase |
| `ClusterSpecificData.remediationKB` | `object[]` | Remediation Page (Runbook tab) | AI knowledge base references with relevance scores |
| `ClusterSpecificData.rcaMetadata` | `object` | Remediation Page | Device name, interface, RCA summary for display |

### Inline Local Mock Data (inside component files)

These are defined directly within their component files and are not in shared data files:

| Page | Variable | Description |
|---|---|---|
| `ClusteringPage.tsx` | `mockAnomalies` | 4 anomaly objects (Isolation Forest / DBSCAN) |
| `ClusteringPage.tsx` | `mockHistoricalData` | 6-point time series for deviation chart |
| `RemediationPage.tsx` | `VERIFICATION_METRICS` | Before/after metrics: Latency, Packet Loss, Queue Drops, Bandwidth |
| `RemediationPage.tsx` | `TIMELINE_DATA` | 7 timestamped incident lifecycle events |
| `RcaImpactPage.tsx` | `getClusterRCAResult()` | Inline RCA results keyed by cluster ID |
| `RcaImpactPage.tsx` | `getClusterProcessingState()` | Inline map of cluster → pipeline stage |
| `RoiDashboard.tsx` | `ROI_DATA`, `MTTR_COMPARISON`, `FTE_DATA` | ROI/MTTR/FTE chart data |
| `DeduplicationPage.tsx` | `SAMPLE_EVENTS` | 15 syslog events for dedup lab |
| `SuppressionPage.tsx` | `SAMPLE_EVENTS` | 15 syslog events for suppression lab |
| `BulkEventProcessingPage.tsx` | `MOCK_EVENTS` | 15 structured bulk events |
| `PreprocessingPage.tsx` | `processingSteps`, inline table rows | Upload steps + 5-row data preview |
| `PredictionDashboard.tsx` | `NODES`, `EDGES`, `PREDICTED_ALARMS` | Network topology + predictions |

---

## 4. Third-Party Library Catalog

### Charting Libraries

| Library | Package | Used In | Purpose |
|---|---|---|---|
| **Chart.js** | `chart.js` | Analytics Dashboard, RCA Dashboard | Doughnut, Bar, Line charts with `canvas` |
| **React-Chartjs-2** | `react-chartjs-2` | Analytics Dashboard, RCA Dashboard | React wrapper for Chart.js |
| **Recharts** | `recharts` | KPI, ROI, Alarm, Anomaly, Remediation | `AreaChart`, `BarChart`, `LineChart`, `PieChart`, `ResponsiveContainer` |

### Icon Libraries

| Library | Package | Used In | Purpose |
|---|---|---|---|
| **Lucide React** | `lucide-react` | All pages | Primary icon library — 80+ icons used (ShieldAlert, Activity, BrainCircuit, etc.) |
| **MUI Icons** | `@mui/icons-material` | RCA Playground | Material-style icons for MUI ThemeProvider context |

### UI Component Libraries

| Library | Package | Used In | Purpose |
|---|---|---|---|
| **Radix UI** | `@radix-ui/react-*` | All pages | Headless UI primitives: Dialog, Tabs, Select, ScrollArea, Tooltip, Badge, Progress, Switch, Separator |
| **Material UI (MUI)** | `@mui/material` | RCA Playground | `Typography`, `Box`, `Container`, `Tabs`, `Tab`, `CircularProgress`, `Button`, `Paper`, `ThemeProvider`, `createTheme` |
| **Shadcn UI** | Built on Radix | All pages | Pre-styled component wrappers (`Card`, `Button`, `Badge`, `Input`, `Table`, `Dialog`) |
| **Vaul** | `vaul` | Potential drawer use | Accessible drawer/sheet component |
| **Sonner** | `sonner` | RCA Playground, Events | `toast.success()`, `toast.error()` notification toasts |

### State & Data Management

| Library | Package | Used In | Purpose |
|---|---|---|---|
| **TanStack Query** | `@tanstack/react-query` | Service layer | Server-state caching, async data fetching (partially implemented) |
| **Axios** | `axios` | RCA API, service files | HTTP client for Django backend calls |
| **React Router DOM** | `react-router-dom` | App.tsx, all pages | Client-side routing, `useParams`, `useSearchParams`, `Link`, `Navigate` |

### Form & Validation

| Library | Package | Used In | Purpose |
|---|---|---|---|
| **React Hook Form** | `react-hook-form` | Admin / Config forms | Performant form state management |
| **Zod** | `zod` | Admin / Config forms | Schema-based validation |
| **@hookform/resolvers** | `@hookform/resolvers` | Admin / Config forms | Connects Zod to React Hook Form |

### Animation & Styling

| Library | Package | Used In | Purpose |
|---|---|---|---|
| **Framer Motion** | `framer-motion` | Prediction Dashboard, sidebars | `motion.div`, `AnimatePresence` for transitions |
| **Tailwind CSS** | `tailwindcss` | All pages | Utility-first CSS framework |
| **Tailwind Merge** | `tailwind-merge` | `cn()` utility | Merges and deduplicates Tailwind class strings |
| **Class Variance Authority** | `class-variance-authority` | Shadcn components | Variant-based component styling |
| **next-themes** | `next-themes` | RCA Playground, layout | Dark/light theme toggling and detection |

### Utility Libraries

| Library | Package | Used In | Purpose |
|---|---|---|---|
| **date-fns** | `date-fns` | Event timestamps | Date parsing and formatting |
| **React Markdown** | `react-markdown` | KB articles, RCA descriptions | Renders markdown string content |
| **clsx** | `clsx` | `cn()` utility | Conditional className composition |

---

## Summary

| Category | Count |
|---|---|
| Total Routes (active, excl. Tmp) | 17 |
| Shared Mock Data Files | 4 |
| Pages w/ Inline Local Mock Data | 12 |
| Charting Libraries | 2 (+ wrappers) |
| Icon Libraries | 2 |
| UI Component Frameworks | 3 (Radix, MUI, Shadcn) |
| Pages connected to Real API | **1** (`/playground/rca`) |

> **Key Insight:** The overwhelming majority of the UI is driven by **hardcoded mock data**. The highest-priority technical debt is replacing imports from `src/data/mock/` and inline arrays with live API calls via `axios` + `@tanstack/react-query`.
