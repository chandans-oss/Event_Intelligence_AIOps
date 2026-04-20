# AIOps Platform — Route Use Cases & Functional Breakdown

> Each route is documented with: **Why this path exists**, **Who uses it**, **What they do**, **Step-by-step flow**, and **Navigation triggers**.

---

## Route 1 — `/`
### 🏠 Analytics Dashboard (Main Command Center)

**Why this route exists:**
This is the **primary entry point** of the entire AIOps platform. Engineers and NOC operators land here first. It provides a **bird's-eye view** of the entire network health — active incidents, suppression policies, RCA confidence, and live metric signals — all in one place.

**Target Users:** NOC Engineers, Network Operations Managers, On-call SREs

**Business Problem Solved:**
- Reduces time-to-awareness during a network incident
- Eliminates the need to check multiple monitoring tools (Solarwinds, Grafana, ticketing systems) by aggregating everything into one dashboard

**What the user can do:**
- See all **active incident clusters** (severity, RCA status, affected users) in a sortable table
- View **intent distribution** (QoS Congestion, Link Failure, BGP Down, etc.) as a chart
- Review **active suppression rules** (what noise is being filtered and why)
- Review **correlation rules** (which event patterns are being grouped together)
- Browse **AI knowledge base articles** relevant to ongoing incidents
- Click any cluster row to **slide open the RCA Sidebar** and view the root cause

**Step-by-Step Functional Flow:**
```
1. Page loads → fetches clusters from mockClusters
2. User sees event table sorted by severity (Critical first)
3. User clicks a cluster row → RCA Sidebar slides in from right
4. Sidebar shows: root cause, hypothesis, confidence score, affected services
5. User clicks "Start Remediation" in sidebar
   → Sidebar swaps to RemediationSidebar (guided fix steps)
6. User clicks "Go to Full RCA" → navigates to /rca/detail/:id
7. User uses "Acknowledge" / "Suppress" actions
```

**Navigation FROM here to:**
- `/rca/detail/:id` — for deep-dive RCA
- `/remediation` — for guided remediation
- `/events` — for raw event log view

---

## Route 2 — `/dashboard/alarm-prediction`
### 🔔 Alarm Prediction Dashboard

**Why this route exists:**
This is a **futures-facing dashboard** — it shows what alarms are *likely to happen* in the next 15–60 minutes based on current metric trends. Unlike other dashboards that show what already happened, this one is **proactive**.

**Target Users:** NOC Leads, Capacity Planners, Shift Supervisors

**Business Problem Solved:**
- Enables operators to **act before alarms fire**, not just after
- Reduces alarm fatigue by showing only *predicted high-confidence* alerts
- Helps teams pre-position resources (backup engineers, rollback scripts) before an outage

**What the user can do:**
- Watch a **live streaming chart** (Recharts AreaChart) showing actual vs. forecasted metric values
- See **prediction confidence bands** (upper/lower bounds) on the chart
- View **alarm threshold breach predictions** highlighted with `ReferenceLine` markers
- Monitor KPI cards: alarm count, prediction accuracy %, detection lead time

**Step-by-Step Functional Flow:**
```
1. Page loads → setInterval starts streaming new data points every 2 seconds
2. Chart renders actual values (solid line) + prediction envelope (shaded band)
3. When forecasted value crosses threshold line → alarm prediction fires
4. Operator sees which device/metric is about to breach SLA
5. Operator can navigate to /events to take preemptive action
6. Timer resets (live data keeps flowing)
```

**Why this is a separate route:**
The streaming chart requires its own isolated `setInterval` lifecycle. Embedding it in the main dashboard would cause performance interference with other components.

---

## Route 3 — `/dashboard/kpi`
### 📈 KPI Dashboard

**Why this route exists:**
This is the **AIOps system performance dashboard** — not network health, but how well the *AI pipeline itself* is performing. It answers: "Is our AIOps system actually reducing noise? Is MTTR improving?"

**Target Users:** Platform Owners, Engineering Managers, CTO/VP-level stakeholders

**Business Problem Solved:**
- Provides evidence that the AIOps investment is working
- Tracks operational efficiency metrics over time
- Identifies if any pipeline stage is degrading in accuracy

**What the user can do:**
- Track **Noise Reduction** trend month-over-month (events in vs. events forwarded)
- Track **MTTR (Mean Time to Resolve)** — AI-assisted vs. manual baselines
- See **RCA Accuracy %** per month (how often AI's root cause matched the actual)
- See **Auto-Remediation Success Rate** (how often automated fixes worked without human override)
- View per-stage pipeline health cards

**Step-by-Step Functional Flow:**
```
1. User opens KPI Dashboard (typically from sidebar nav)
2. All charts rendered from resultsData.ts (pre-computed arrays)
3. User reads Noise Reduction chart → sees 73% of events being filtered
4. User reads MTTR chart → sees 15min AI-MTTR vs. 60min manual baseline
5. User presents this data in a weekly review or executive report
6. [Future] Date range filter will fetch real data from backend
```

**Why this is a separate route:**
This is a **management-facing** view, not an operator tool. It has a completely different audience and shouldn't clutter the operational dashboards.

---

## Route 4 — `/dashboard/rca-analysis`
### 🔍 RCA Analysis Dashboard

**Why this route exists:**
This route provides **analytical deep-dive into RCA patterns** — not individual incidents, but aggregate trends. It answers: "Which root causes keep recurring? What intents dominate? How confident is the AI across all incidents?"

**Target Users:** Network Architects, Reliability Engineers, AI/ML Platform Engineers

**Business Problem Solved:**
- Identifies systemic root causes (e.g., "QoS Congestion happens every Monday morning")
- Helps engineers decide which network issues to address permanently vs. suppress repeatedly
- Validates that AI intent classification is working correctly

**What the user can do:**
- View **Intent Distribution** pie chart across all historical incidents
- See **Confidence Score Histogram** — how confident the RCA engine is across incidents
- Browse **Top Root Causes** ranked by frequency
- View **Hypothesis Score Distribution** for each intent
- See **RCA pipeline time breakdown** per stage

**Step-by-Step Functional Flow:**
```
1. Engineer opens this page during a post-incident review
2. Filters by time range (this week / this month)
3. Sees that "QoS Congestion" accounts for 45% of all incidents
4. Drills into hypothesis scores → confirms "Backup Traffic" is top hypothesis
5. Decides to create a dedicated suppression rule for known backup windows
6. Navigates to main dashboard to update suppression rules
```

---

## Route 5 — `/dashboard/roi`
### 💰 ROI Dashboard

**Why this route exists:**
This is the **business justification dashboard**. It converts operational metrics into financial terms — cost savings, engineer hours saved, MTTR reduction in dollars — to demonstrate the value of the AIOps platform to business stakeholders.

**Target Users:** IT Directors, CFO/Finance Teams, C-Suite stakeholders, Procurement

**Business Problem Solved:**
- Justifies the cost of running the AI platform
- Demonstrates measurable ROI on the AIOps investment
- Translates technical improvements (MTTR, noise reduction) into financial outcomes

**What the user can do:**
- See **monthly cost savings** in USD (derived from MTTR reduction × engineer hourly rate)
- View **FTE efficiency chart** — hours spent manually vs. AI-automated
- View **MTTR before/after comparison** bar chart
- Read summary KPIs: total incidents resolved, total hours saved, total cost saved

**Step-by-Step Functional Flow:**
```
1. Monthly business review → stakeholder opens ROI Dashboard
2. Sees $240K saved YTD in engineer hours (example from mock)
3. Sees MTTR reduced from 60min → 15min average
4. Exports data (future) for inclusion in quarterly business review deck
5. Uses as evidence for expanding AI platform to more network regions
```

---

## Route 6 — `/dashboard/prediction`
### 🗺 Topology Prediction Dashboard

**Why this route exists:**
This route provides a **visual network topology map** overlaid with predictive alarm indicators. Unlike other dashboards that use charts, this one uses an **SVG node-graph** so operators can see *where in the network* problems are predicted to occur.

**Target Users:** Network Architects, NOC Engineers (during major incidents)

**Business Problem Solved:**
- Gives a **spatial understanding** of impact — "Router-01 failing will cascade to Switch-05 and Edge-FW"
- Enables faster decision-making by showing topology relationships, not just raw metrics
- Visualizes blast radius of predicted failures

**What the user can do:**
- View the network topology as an interactive SVG graph (nodes = devices, edges = links)
- See **alarm prediction overlays** on each node (color-coded severity)
- Hover over a node to see metric sparklines (CPU, Latency, Bandwidth)
- See **root cause predictions** at specific topology nodes with confidence %
- Framer Motion animations show propagation paths

**Step-by-Step Functional Flow:**
```
1. Operator opens during a suspected network event
2. Topology renders with all devices and connections
3. Color-coded nodes show: Green (healthy), Yellow (warning), Red (predicted alarm)
4. Operator clicks a Red node → metric sparklines appear
5. Operator identifies propagation path (which downstream devices will be affected)
6. Operator initiates pre-emptive isolation or capacity increase
```

---

## Route 7 — `/events`
### ⚡ Event Command Center

**Why this route exists:**
This is the **operational core** of the platform — the primary page NOC engineers work from during an active incident. It shows all events (raw and correlated), supports filtering, and provides direct access to RCA and Remediation workflows without leaving the page.

**Target Users:** NOC Engineers, L1/L2 Support, On-call Engineers

**Business Problem Solved:**
- Single pane of glass for all active events
- Eliminates tab-switching between event management tool and RCA tool
- RCA Sidebar + Remediation Sidebar pattern keeps the engineer in-context

**What the user can do:**
- View **all events** in a filterable, paginated table (severity, status, source, timestamp)
- Apply **filters**: severity (Critical/Major/Minor), status (Active/Resolved/Suppressed), device
- Click an event row → **RCA Sidebar** slides in with full root cause analysis
- Click "Start Remediation" in RCA Sidebar → **Remediation Sidebar** replaces it
- Acknowledge, suppress, or escalate events from the sidebar
- Navigate to full-page remediation via "Open Full Remediation"

**Step-by-Step Functional Flow:**
```
1. L1 Engineer opens /events at start of shift
2. Filters to "Critical" severity only
3. Sees 3 active Critical clusters
4. Clicks first cluster → RCA Sidebar shows AI root cause: 
   "QoS Congestion - Backup Traffic (93% confidence)"
5. Reviews hypothesis and affected services
6. Clicks "Start Remediation"
7. Remediation Sidebar replaces RCA Sidebar with 4-step fix plan
8. Executes Step 1: "Apply QoS Traffic Shaping"
9. Marks step as done
10. Continues with remaining steps
11. Incident resolved → returns to event table
```

**Why this is separate from `/`:**
The main dashboard (`/`) is a **high-level overview**. The Events page (`/events`) is a **working tool** — it's where engineers spend most of their time during incidents.

---

## Route 8 — `/rca/detail/:id`
### 🧠 Root Cause Analysis — Incident Detail

**Why this route exists:**
When an operator wants to understand an incident in full depth — seeing every pipeline stage, all matched signals, similar historical cases — the sidebar views are not enough. This route provides **full-page RCA detail** with Overview, Detail, and Timeline views.

**Target Users:** L2/L3 Engineers, Senior Network Engineers doing post-incident analysis

**Business Problem Solved:**
- Provides full transparency into how the AI reached its RCA conclusion
- Enables engineers to **validate or override** the AI's judgment
- Supports post-incident review and documentation with complete audit trail

**What the user can do on this page:**
- Switch between **Overview mode** (all processing clusters in cards)
- Switch to **Timeline mode** (Gantt-style view of 6 pipeline stages per cluster)
- Switch to **Detail mode** (clicking any cluster) — shows:
  - Root cause identified (with confidence %)
  - Key matched signals (metric values vs. thresholds)
  - Top hypothesis selected
  - Similar past incidents (with % similarity and past resolution)
  - Recommended actions
  - Affected services list
  - All related events (root + child)
- Click **"Start Remediation"** → navigates to `/remediation?cluster=:id`

**Step-by-Step Functional Flow:**
```
1. Engineer clicks "View Full RCA" from event sidebar
2. /rca/detail/CLU-LC-001 loads
3. Overview shows: 3 clusters processing, 2 complete
4. Engineer clicks on CLU-LC-001 card → switches to Detail view
5. Sees: "Root Cause: QoS Congestion — Backup-Induced (93%)"
6. Reviews matched signals: Interface Util 96% (threshold: 90%)
7. Sees similar past incident: NET-2025-001 (87% match, resolved with QoS shaping)
8. Reviews 3 recommended actions
9. Clicks "Start Remediation" → goes to /remediation?cluster=CLU-LC-001
```

**URL Parameter `:id`:**
The cluster ID in the URL allows direct linking to a specific incident — useful for sharing in Slack, tickets, or email for team collaboration.

---

## Route 9 — `/remediation`
### 🔧 Payload Orchestrator (Guided Remediation)

**Why this route exists:**
Once the root cause is known, engineers need a **structured, step-by-step guided workflow** to fix it. This route is the **execution engine** — it shows what commands to run, what to verify, tracks progress, logs all actions, and confirms successful resolution.

**Target Users:** L2/L3 Network Engineers, Senior Network Admins, Automation Engineers

**Business Problem Solved:**
- Eliminates guesswork — engineers follow an AI-generated, proven fix plan
- Provides full audit trail of every action taken (terminal log)
- Reduces human error during high-pressure incident response
- Closes the loop: Detection → RCA → Remediation → Verification

**What the user can do on this page:**
- Follow a **step-by-step execution roadmap** (4–6 steps per incident)
- For each step:
  - Read the **execution context** (what this step does)
  - View the **CLI command/payload** to run
  - See **verification criteria** (what success looks like)
  - Click **"EXECUTE FLOW STEP"** (mark success) or **"ABORT"** (mark failure)
  - Click **"Retry"** if a step fails
- View **Live Terminal Logs** (CLI-style log of all executed commands)
- Read **Runbook Knowledge** (AI KB references with relevance scores)
- After all steps complete → switch to **Verification View**:
  - Before/after metrics: Latency, Packet Loss, Queue Drops, Bandwidth
  - Bar chart comparison
- After verification → switch to **History/Archive View**:
  - MTTR Gain, Health Recovery %, Audit Compliance score
  - Export incident PDF (planned)
  - "Finalize & Exit" → navigates back to `/events`

**URL Parameter `?cluster=`:**
`/remediation?cluster=CLU-LC-001` — pre-loads the remediation steps and KB articles for that specific cluster. Without this parameter, it defaults to `CLU-LC-001`.

---

## Route 10 — `/preprocessing`
### 📁 Event Pre-Processing

**Why this route exists:**
Before the AI pipeline can process events, raw event data (from CSV or Excel exports from network tools) must be **uploaded, validated, normalized, and mapped** to the system's schema. This route is the **data ingestion gateway**.

**Target Users:** Platform Engineers, Data Engineers, AIOps Admins setting up a new network domain

**Business Problem Solved:**
- Standardizes raw, inconsistent event formats from different NMS tools (Cisco, Juniper, Solarwinds) into a common schema
- Validates data quality before it enters the AI pipeline
- Provides visibility into data processing status

**What the user can do:**
- **Drag & drop** or **browse** CSV/Excel event files
- Track **upload progress** (progress bar)
- Track **processing pipeline** (5 steps: File Validation → Timestamp Normalization → Field Mapping → Data Type Conversion → Null Handling)
- See **processing metrics**: total events, normalized count, error count, % complete
- Preview **first 5 rows** of the normalized data
- Click **"Go to Clustering"** → navigates to `/clustering`

**Step-by-Step Functional Flow:**
```
1. Admin uploads "events_2026-01-05.xlsx" (15,420 rows, 2.4MB)
2. Upload progress bar fills → 100% (checkmark)
3. Processing pipeline executes:
   - File Validation: 15,420 events ✓
   - Timestamp Normalization: 15,420 events ✓
   - Field Mapping: 15,380 events ✓ (40 unmapped = error)
   - Data Type Conversion: In Progress...
   - Null Handling: Pending
4. User reviews 5-row data preview to confirm correct schema mapping
5. Clicks "Go to Clustering" to proceed to anomaly detection
```

---

## Route 11 — `/clustering`
### 🔬 Anomaly Detection (Clustering)

**Why this route exists:**
After preprocessing, the next pipeline stage is **identifying statistical anomalies** in the metrics. This page exposes the raw anomaly scoring output from **Isolation Forest** and **DBSCAN** ML models — showing which device/interface metrics are behaving outside their normal envelope.

**Target Users:** AI/ML Engineers, Data Scientists, Senior Network Engineers validating ML output

**Business Problem Solved:**
- Provides **explainability** for why the AI flagged a specific device/metric as anomalous
- Allows engineers to **tune the model** by reviewing false positives/negatives
- Bridges the gap between raw ML scoring and human-interpretable alert logic

**What the user can do:**
- View **Detected Outliers** table (device, interface, metric, observed value, expected value, anomaly score)
- Filter by device name or metric name
- Click an anomaly row → **Metric Deviation Chart** appears:
  - Recharts AreaChart showing actual vs. 30-day dynamic baseline
  - Reference line at expected value
  - % deviation badge (e.g., "+550% Deviation")
- View **Anomaly Explanation Engine** panel:
  - Model used (Isolation Forest or DBSCAN)
  - Path length / cluster density metrics
  - Feature importance (which metric contributed most to the anomaly score)
  - Training dataset metadata (accuracy, precision, recall, F1)
  - Full inference pipeline trace (Stream Ingestion → Normalization → Scoring → Clustering → Dashboard)

**Step-by-Step Functional Flow:**
```
1. Engineer opens /clustering after preprocessing completes
2. Sees 4 detected outliers (2 Critical, 2 Major)
3. Clicks ANOM-4021: Router01 / Gi0/1 / Latency: 65ms (expected: 10ms)
4. Anomaly Score: -0.68 (Isolation Forest)
5. Chart shows: flat baseline at ~10ms, then spike to 65ms at 10:15
6. Explainability panel reveals:
   - Latency contributed 65% of anomaly score
   - Path Length: 4.2 (vs. expected 7.2 — shorter path = more isolated = anomalous)
   - Training: 94% accuracy, F1: 0.85
7. Engineer confirms: this is a real anomaly, not a false positive
8. Anomaly feeds into the RCA pipeline for root cause identification
```

---

## Route 12 — `/algo-training/*`
### 🤖 Algorithm Training Report

**Why this route exists:**
This route provides a **comprehensive post-training analytics report** for the clustering and correlation ML models. It shows how the models learned the network's behavioral patterns — cluster shapes, metric correlations, event associations, and causal relationships — so engineers can **validate model quality before deployment**.

**Target Users:** ML Engineers, Data Scientists, AI Platform Engineers, Senior Network Researchers

**Business Problem Solved:**
- Validates that the trained ML model has learned *meaningful* cluster boundaries
- Detects data drift or model degradation before it impacts production RCA
- Provides a scientific record of what patterns the AI has internalized

**What the user can do:**
- View **K-Means Cluster Plot** (2D PCA projection of trained clusters)
  - Interactive scatter plot where each cluster has a distinct color
  - Hover centroid to see: B/W Util, Buffer Util, cluster share %
- View **Cluster Donut** (how many observation windows each cluster captured)
- View **Resource Anomaly Heatmap** (CPU/Mem/Latency/Buffer/CRC per entity)
- View **Event Co-occurrence Matrix** (lift score heatmap — which events happen together)
- View **Correlation Venn Diagrams** (metric pair correlation % with lag time)
- View **Causal Venn Diagrams** (Granger causality: which metric causes which)
- View **Multivariate Spike Plot** (how top entities deviate across all features simultaneously)
- View **Pre-Event Pattern Analysis** (how metrics behave in the minutes before a fault)
- View **Random Forest Feature Importance** (which metrics matter most for predictions)
- Switch device filter: Router only vs. Router + Switch combined

**Step-by-Step Functional Flow:**
```
1. ML Engineer completes model training run on new dataset
2. Opens /algo-training to review report
3. Reviews cluster plot → 4 clusters well-separated (good model)
4. Reviews co-occurrence matrix → LINK_DOWN and BGP_DOWN have high lift (1.4x) → expected
5. Reviews causal analysis → B/W Util causes Latency (lag: +2 polls) → confirms network intuition
6. Reviews pre-event patterns → CPU spikes 3 polls before LINK_DOWN → new insight
7. Approves model for deployment to production RCA pipeline
```

---

## Route 13 — `/pattern-prediction/*`
### 🎯 Pattern Prediction

**Why this route exists:**
This route focuses on **predicting which event pattern will occur next** based on historical co-occurrence rules (Association Rule Mining). It answers: "Given that LINK_DOWN just fired on Router01, what event is most likely to follow in the next 5 minutes?"

**Target Users:** NOC Engineers, Network Reliability Engineers

**Business Problem Solved:**
- Enables **cascading failure prediction** — warns about downstream events before they fire
- Reduces surprise from storm events (one issue triggers 20 alerts — system predicts all 20 ahead of time)
- Pre-arms the NOC with context before the alert storm hits

**What the user can do:**
- View **pattern rules** (IF event A → THEN event B with confidence %)
- Select a seed event and see **predicted propagation sequence**
- View prediction confidence and historical lift scores
- See time-to-next-event estimate

---

## Route 14 — `/playground/rca`
### 🧪 RCA Playground

**Why this route exists:**
This is the **live demo and testing environment** for the full agentic RCA pipeline. Engineers can upload a real CSV event file and watch the AI process it through all 7 stages in real time — connecting to the actual Django backend. It serves as both a **demo tool** and a **developer testing harness**.

**Target Users:** AI/ML Engineers, Platform Developers, Pre-sales Demo Team, QA Engineers

**Business Problem Solved:**
- Allows testing of new RCA logic without impacting production dashboards
- Provides a transparent, step-by-step visualization of what the AI "thinks" at each stage
- Enables demos to customers or stakeholders showing real AI pipeline behavior

**What the user can do:**
- Upload a CSV event file via drag-and-drop or file browser
- Click "Run RCA" → **real API call** to Django backend `/rca/` endpoint
- Watch **7-step animated timeline** fill in progressively:
  - Step 0: Event Pre-processing / Correlation
  - Step 1: Orchestration (Incident + Goal creation)
  - Step 2: Intent Routing (which intent pattern matches)
  - Step 3: Hypothesis Scoring (which root cause is most likely)
  - Step 4: Situation Card Generation (context embedding for vector DB)
  - Step 5: Historical Data Retriever (similar past cases from vector DB)
  - Step 6: RCA Correlator Engine (final RCA + remedy)
- Click any step tab to see detailed output for that stage
- Click "Restart Analysis" to run with a different file

**Step-by-Step Functional Flow:**
```
1. Engineer uploads "incident_events.csv"
2. RCA Playground calls: POST /api/rca/run/ with file
3. Django backend runs full agentic pipeline (30–60 seconds)
4. Response: array of 7 step results with data payloads
5. UI animates through each step (800ms reveal per step)
6. Step 1 reveals: Incident ID, Device, Interface, KPIs, Goal
7. Step 2 reveals: Selected Intent = "QoS_Congestion_Intent" (score: 0.93)
8. Step 3 reveals: Top Hypothesis = "Backup Traffic Congestion" (85%)
9. Step 4 reveals: Situation card ID, summary text
10. Step 5 reveals: 3 similar past cases (87%, 85%, 82% similarity)
11. Step 6 reveals: Final RCA + proposed remedy commands
12. Engineer reviews output → confirms or escalates
```

**Why this is separate from `/events`:**
The Playground connects to a **real backend API** and is primarily a debugging/demo tool, not an operational one. It needs its own isolated route so it doesn't interfere with the mock-data-driven operational dashboards.

---

## Route 15 — `/deduplication`
### 🔁 Deduplication Lab

**Why this route exists:**
Event deduplication is one of the most critical — and complex — stages of the AIOps pipeline. Different techniques (exact match, semantic similarity, state transition) behave very differently. This lab lets engineers **understand, test, and select** the right deduplication strategy for their environment.

**Target Users:** AIOps Platform Engineers, NMS Administrators, Network Engineers evaluating the system

**Business Problem Solved:**
- Eliminates 30–60% of events before they enter the AI pipeline (pure noise)
- Allows teams to understand *why* an event was marked as duplicate (explainability)
- Enables tuning and selection of the most appropriate dedup algorithm per event type

**What the user can do:**
- Select a **deduplication technique** from the left sidebar (6 options):
  - Exact Match (SHA256 bitwise)
  - Structured Exact (Device + Interface + Event Code)
  - State Transition (suppresses repeated same-state events)
  - Template-Based (normalizes log text into templates)
  - Similarity-Based (TF-IDF + Cosine > 0.90 threshold)
  - Semantic-Based (LLM embedding similarity)
- Click **"Load Sample Events"** → loads 15 real syslog events
- Click **"Run Deduplication"** → client-side simulation marks each event as Unique or Duplicate
- Click any event row → **Event Insight Panel** slides in:
  - Status (Unique / Duplicate)
  - Technique used
  - Reasoning (e.g., "Identical SHA256 matches existing event")
  - Internal trace (hash value, matched with event ID)
  - Raw payload
- Technique switches via URL `?technique=exact`

**Step-by-Step Functional Flow:**
```
1. Platform engineer selects "Structured Exact" technique
2. Loads 15 sample events
3. Clicks "Run Deduplication"
4. Events 2, 3 (same device/interface/code) → marked Duplicate
5. Event 7 (different device) → Unique
6. Engineer clicks Event 2 → sees:
   "Signature: Router1|Gi0/1|LINK_DOWN — matches existing event"
7. Engineer validates: yes, this is correct
8. Engineer tries "Similarity-Based" → different results
9. Engineer decides which technique matches their environment
10. Configures chosen technique in the pipeline settings
```

---

## Route 16 — `/suppression`
### 🛡 Suppression Lab

**Why this route exists:**
Suppression is different from deduplication — it doesn't remove *identical* events but removes events that are **valid but irrelevant** in a given context (e.g., during a maintenance window, from non-production devices, or caused by a known parent failure). This lab lets engineers test 12 suppression strategies with full explainability.

**Target Users:** AIOps Platform Engineers, Network Operations Managers, NOC Leads

**Business Problem Solved:**
- Reduces alert fatigue by suppressing expected, known, or contextually irrelevant events
- Ensures engineers only see events that actually require action
- Provides full audit trail explaining why each event was suppressed

**What the user can do:**
- Select a **suppression technique** from left sidebar (12 options):
  - Maintenance Window (suppress during scheduled downtime)
  - Business Hours (suppress non-critical non-prod events outside hours)
  - Tag-Based (suppress events from dev/test environment tags)
  - Parent-Child (suppress child alarms when parent root cause is known)
  - Spatial (suppress geographically co-located concurrent events)
  - Dedup-Based (suppress high-frequency sub-second repeats)
  - Time-Window (suppress redundant events within a rolling window)
  - Flap Detection (suppress oscillating up/down interface events)
  - Temporal Cluster (group events from same time window)
  - Dynamic Threshold (suppress if within learned p95 baseline)
  - Event Storm (suppress known noisy patterns during major incidents)
  - Seasonal (suppress known periodic recurring events)
- Load events → Run Suppression → See which events are suppressed and why
- Click any event → **Suppression Insight Panel** with:
  - Status (Active / Suppressed)
  - Suppression reason
  - Internal logic trace (e.g., "Window: 02:00–04:00, Calendar: Core Infrastructure Plan")
  - Matched policy ID

**Step-by-Step Functional Flow:**
```
1. NOC Manager evaluates "Flap Detection" technique
2. Loads 15 sample events
3. Clicks "Run Suppression"
4. Events 2, 3 (SW-CORE-1 Te1/1/1 flapping up/down every 2s) → Suppressed
5. Event 15 (Router Core-R1 VPN tunnel down) → Active (real issue, not a flap)
6. Manager clicks Event 2 → sees:
   "Transitions: DOWN→UP→DOWN→UP, Count: 4 in 10s
    Action: Final Alert: FLAPPING DETECTED"
7. Manager confirms this correctly separates flap noise from real failure
8. Approves Flap Detection for production use
```

---

## Route 17 — `/bulk-processing`
### 📤 Bulk Processing Lab

**Why this route exists:**
This route represents the **complete end-to-end preprocessing pipeline** — upload a large event dump (10,000+ events from an NMS export), and the system automatically runs **both deduplication AND suppression** back-to-back, then shows you only the **actionable signals** that remain.

**Target Users:** AIOps Admins, Platform Engineers, Network Managers doing batch event analysis

**Business Problem Solved:**
- Automates the full noise-reduction pipeline on bulk historical data
- Enables retrospective analysis ("of last month's 50,000 events, how many were real incidents?")
- Validates the pipeline's overall effectiveness end-to-end

**What the user can do:**
- Click **"Upload Excel"** → simulates selecting a large event file
- Click **"Process Events"** → animated progress bar + runs the full pipeline
- After processing, see **4 summary KPI cards**:
  - Total Input: 10,000 events
  - Duplicates Removed: 3,500
  - Suppressed: 4,000
  - Actionable: 2,500 (25% signal extraction rate)
- Switch tabs: All Events / Duplicates / Suppressed / Actionable Events
- In Duplicates/Suppressed tabs → left sidebar shows **logic breakdown**:
  - Which dedup logic removed how many (Exact Match: 1,250, Semantic: 1,100, etc.)
  - Which suppression logic removed how many (Maintenance: 1,500, Flap: 1,300, etc.)
  - Click a logic name → filters the trace grid to only those events
- Click any event row → right panel shows:
  - Deduplication trace (unique or duplicate + reason)
  - Suppression check (active or suppressed + reason)
  - Final outcome verdict (Actionable Signal / Operational Noise)
- After processing → **"Download Full Report"** and **"Download Clean Signal Only"** buttons appear

**Step-by-Step Functional Flow:**
```
1. Admin exports 10,000 events from Solarwinds as Excel
2. Uploads file → "3 Sheets Detected" badge appears
3. Clicks "Process Events" → progress bar fills (2 seconds animation)
4. Summary cards show: 10K → 3.5K removed (dedup) → 4K removed (suppression) → 2.5K actionable
5. Clicks "Duplicates" tab → 3,500 duplicate events shown
6. Clicks "Exact Match" in left sidebar → filters to 1,250 exact duplicates only
7. Clicks Event #102 → "Exact Match — Identical to Event #101"
8. Clicks "Actionable Events" tab → 2,500 clean events ready for RCA
9. Clicks "Download Clean Signal Only" → exports for further analysis
10. 2,500 actionable events are fed into the RCA pipeline
```

---

## Route Relationship Map

```
/                        ← Entry point for NOC engineers
 └── /events             ← Primary working page (RCA + Remediation sidebars)
      └── /rca/detail/:id ← Full RCA detail (post-sidebar deep-dive)
           └── /remediation?cluster=:id ← Guided fix execution
                └── / (back to command center after resolution)

/dashboard/alarm-prediction  ← Proactive: what will happen?
/dashboard/kpi               ← Retrospective: is AI working?
/dashboard/rca-analysis      ← Analytical: what causes repeat?
/dashboard/roi               ← Business: is this worth the cost?
/dashboard/prediction        ← Spatial: where in topology?

/preprocessing → /clustering         ← Data pipeline stages
/algo-training                        ← ML model validation
/pattern-prediction                   ← Pattern forecasting

/deduplication  ← Lab: test dedup techniques
/suppression    ← Lab: test suppression techniques
/bulk-processing ← Lab: test full pipeline end-to-end

/playground/rca ← Live API demo + developer sandbox
```

---

## Summary Table

| Route | Primary User | Core Action | Business Value |
|---|---|---|---|
| `/` | NOC Engineer | Monitor + triage active incidents | Real-time visibility |
| `/dashboard/alarm-prediction` | NOC Lead | Predict alarms before they fire | Proactive operations |
| `/dashboard/kpi` | Manager | Track AI system performance | Platform ROI evidence |
| `/dashboard/rca-analysis` | Architect | Analyze RCA patterns | Systemic improvement |
| `/dashboard/roi` | CTO/Finance | Measure cost savings | Business justification |
| `/dashboard/prediction` | Network Architect | See topology impact | Spatial incident context |
| `/events` | L1/L2 Engineer | Triage + remediate incidents | Operational efficiency |
| `/rca/detail/:id` | L2/L3 Engineer | Deep-dive RCA audit | Full incident transparency |
| `/remediation` | L2/L3 Engineer | Execute guided fix steps | Reduce MTTR |
| `/preprocessing` | Data Engineer | Ingest + normalize raw events | Data quality |
| `/clustering` | ML Engineer | Review anomaly detections | Model validation |
| `/algo-training/*` | Data Scientist | Validate trained ML models | AI quality assurance |
| `/pattern-prediction/*` | NOC Engineer | Predict event chains | Cascading failure prevention |
| `/playground/rca` | Developer/Demo | Run live end-to-end RCA | Testing + demonstration |
| `/deduplication` | Platform Engineer | Test dedup strategies | Noise reduction config |
| `/suppression` | Platform Engineer | Test suppression strategies | Alert fatigue reduction |
| `/bulk-processing` | Admin | Process large event batches | Batch pipeline validation |
