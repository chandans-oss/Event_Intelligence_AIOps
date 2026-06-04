import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
    Settings, Play, FileJson, Brain, Activity, Shield,
    Cpu, Zap, X, Database, Maximize2, RefreshCw, Sliders,
    CheckCircle2, Circle, Terminal, ArrowUpRight, ArrowDownRight,
    Sparkles, Layout, Plus, Trash2, ChevronDown, ChevronUp,
    AlertTriangle, Clock, Link, FileText, Server, Wifi, Network
} from 'lucide-react';
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { runRagV6Analysis, updateRcaConfig } from "@/api/rcaApi";

// ─────────────────────────── TYPES ──────────────────────────────────────────

interface MetricEntry { entity: string; values: number[] }

interface StepPayload {
    root_event: Record<string, any>;
    raw_logs: string[];
    metrics_payload: Record<string, MetricEntry[]>;
    topology: Record<string, any>;
}

// ─────────────────────────── PIPELINE STAGES ────────────────────────────────

const STAGES = [
    { id: 'input', label: '01 · INPUT', icon: FileJson, desc: 'Build your event payload' },
    { id: 'ner', label: '02 · NER/Drain3', icon: Brain, desc: 'Entity & log extraction' },
    { id: 'search', label: '03 · RETRIEVE', icon: Database, desc: 'Hybrid vector search' },
    { id: 'rerank', label: '04 · RERANK', icon: Zap, desc: 'Cross-Encoder Reranking' },
    { id: 'topk', label: '05 · RCA', icon: Shield, desc: 'Diagnosis & remediation' },
];

// ─────────────────────────── DEFAULT PAYLOAD ────────────────────────────────

const DEFAULT_ROOT_EVENT = {
    managed_object_name: "Core-Router-01",
    ip_address: "10.0.4.14",
    probable_cause: "Performance Threshold Breach",
    alarm_msg: "Device Not Reachable",
    device_type: "Router",
    vendor: "Cisco",
    severity: 5,
    event_type: "State Change",
    parameter_name: "Availability",
    parameter_value: 100,
    parameter_unit: "%",
    additional_text: "Critical infrastructure router became unreachable after prolonged CPU, memory, thermal and fan degradation.",
    impacted_services: ["MPLS Backbone", "Internet Edge Connectivity", "BGP Transit Routing"],
    is_root: 1,
    is_correlated: 1,
};

const DEFAULT_LOGS = [
    "2026-05-07T14:12:05.123Z Core-Router-01 %SYS-5-CONFIG_I: Configured from console by automation",
    "2026-05-07T14:13:15.456Z Core-Router-01 %CPU-5-UTIL: CPU utilization 78%",
    "2026-05-07T14:14:22.789Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 6800ms",
    "2026-05-07T14:16:05.678Z Core-Router-01 %SYS-2-MEMORY: Memory usage 82% - high pressure",
    "2026-05-07T14:17:40.345Z Core-Router-01 %ENV-4-TEMP: Temperature threshold exceeded on RP0 (CPU temp 82C)",
    "2026-05-07T14:18:20.901Z Core-Router-01 %FAN-3-FANFAIL: Fan tray 1 speed below normal",
    "2026-05-07T14:19:05.567Z Core-Router-01 %CPU-5-UTIL: CPU utilization 94%",
    "2026-05-07T14:21:15.123Z Core-Router-01 %LINEPROTO-5-UPDOWN: Line protocol on Interface Te0/0/0 changed state to down",
    "2026-05-07T14:25:05.901Z Core-Router-01 %SYS-5-RESTART: System restarted due to high CPU",
    "2026-05-07T14:26:40.678Z Core-Router-01 info: Device not responding to ICMP echo requests",
    "2026-05-07T14:27:50.456Z Core-Router-01 Critical: Device unreachable from monitoring system",
];

const DEFAULT_METRICS_PAYLOAD = {
    cpu_util: { "Core-Router-01": [72, 78, 85, 91, 94, 96, 97, 95] },
    memory_util: { "Core-Router-01": [68, 75, 81, 86, 89, 92, 94] },
    temp_c: { "RP0": [65, 72, 78, 82, 85, 88, 89] },
    fan_speed_rpm: { "Tray1": [4800, 4500, 3900, 3200, 2800, 2400] },
    availability: { "Core-Router-01": [100, 100, 99, 98, 95, 85, 45, 0] },
    icmp_response_ms: { "NMS": [15, 18, 22, 45, 120, 450, 1200, 0] }
};

// ─────────────────────────── TIMELINE ───────────────────────────────────────

const PipelineTimeline = ({ activeId, completedIds, onStageClick, timings, isLoading }: {
    activeId: string; completedIds: string[]; onStageClick: (id: string) => void;
    timings: Record<string, number>; isLoading: boolean;
}) => (
    <div className="flex items-center justify-between px-6 py-1.5 border-b bg-card/50 backdrop-blur-sm">
        {STAGES.map((stage, idx) => {
            const isActive = activeId === stage.id;
            const isCompleted = completedIds.includes(stage.id);
            const isPast = STAGES.findIndex(s => s.id === activeId) > idx;
            const Icon = stage.icon;

            return (
                <React.Fragment key={stage.id}>
                    <button
                        onClick={() => onStageClick(stage.id)}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className={cn(
                            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                            isCompleted || isPast
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : isActive
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "bg-card border-border text-muted-foreground group-hover:border-primary/50"
                        )}>
                            {isCompleted || isPast
                                ? <CheckCircle2 className="w-3.5 h-3.5" />
                                : isActive && isLoading
                                    ? <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    : <Icon className="w-3.5 h-3.5" />
                            }
                        </div>
                        <div className="text-center">
                            <p className={cn(
                                "text-[8px] font-black tracking-widest uppercase",
                                isActive ? "text-primary" : isCompleted || isPast ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            )}>{stage.label}</p>
                            <p className="text-[7px] font-mono text-muted-foreground">
                                {((timings?.[stage.id] ?? 0) / 1000).toFixed(2)}s
                            </p>
                        </div>
                    </button>
                    {idx < STAGES.length - 1 && (
                        <div className="flex-1 h-[1.5px] bg-border mx-2 relative -mt-3.5">
                            <div
                                style={{ width: completedIds.includes(stage.id) ? "100%" : "0%" }}
                                className="h-full bg-emerald-500"
                            />
                        </div>
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ─────────────────────────── HELPERS ────────────────────────────────────────

const RiskBadge = ({ level }: { level: string }) => {
    const low = level.toLowerCase();
    const color = low === 'critical' ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
        : low === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
            : low === 'medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    return <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-wider", color)}>⚡ {level}</Badge>;
};

const RemedyExpanderCard = ({ remedy, index }: { remedy: any, index: number }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className={cn("border-dashed overflow-hidden transition-colors", isExpanded ? "bg-muted/10" : "bg-card hover:bg-muted/5")}>
            <div
                className="px-4 py-3 border-b flex items-center justify-between cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-[10px]">
                        OPTION {index + 1}
                    </Badge>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                        {remedy.title || 'Recovery Procedure'}
                    </h4>
                </div>
                <div className="flex items-center gap-3">
                    {remedy.confidence !== undefined && (
                        <span className="text-xs text-primary font-black">
                            {(remedy.confidence * 100).toFixed(1)}%
                        </span>
                    )}
                    {remedy.estimated_time_minutes && (
                        <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {remedy.estimated_time_minutes}m
                        </span>
                    )}
                    <RiskBadge level={remedy.risk_level || 'unknown'} />
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground ml-2" /> : <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />}
                </div>
            </div>

            {isExpanded && (
                <div className="overflow-hidden">
                    <div className="p-4 space-y-4 bg-muted/5">
                        {remedy.steps?.length > 0 && (
                            <div className="space-y-3">
                                <h5 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Execution Steps</h5>
                                <div className="grid gap-2">
                                    {remedy.steps.map((step: any, k: number) => (
                                        <div key={k} className="flex gap-3 bg-background border rounded-lg p-3 shadow-sm">
                                            <div className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                                {k + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{step.action || String(step)}</p>
                                                {step.cli_command && (
                                                    <div className="mt-2 p-2.5 bg-[#0d1117] rounded-md border border-gray-800 flex items-center shadow-inner">
                                                        <code className="text-xs font-mono text-emerald-400">
                                                            {step.cli_command}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

// ─────────────────────────── MAIN PAGE ──────────────────────────────────────

const RAGPlaygroundPage = () => {
    const navigate = useNavigate();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [activeStageId, setActiveStageId] = useState('input');
    const [completedStages, setCompleted] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [timings, setTimings] = useState<Record<string, number>>({});
    const [sidebarOpen, setSidebarOpen] = useState(activeStageId === 'input');
    // Reusable window ref for RAW JSON output — overwritten on every run
    const rawJsonWindowRef = useRef<Window | null>(null);

    const writeRawJson = (data: any) => {
        const content = `<html><head><title>RAW API Response</title><style>body{background:#0d1117;color:#e6edf3;font-family:monospace;padding:20px;margin:0}pre{font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-all}.header{color:#58a6ff;font-size:11px;font-weight:bold;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid #30363d}</style></head><body><div class="header">RAW API RESPONSE — http://10.0.4.161:8000/rca — ${new Date().toLocaleTimeString()}</div><pre>${JSON.stringify(data, null, 2)}</pre></body></html>`;
        // Reuse the existing window if still open, otherwise open a new one with a fixed name
        if (!rawJsonWindowRef.current || rawJsonWindowRef.current.closed) {
            rawJsonWindowRef.current = window.open('', 'rag_raw_json', 'width=900,height=700');
        }
        if (rawJsonWindowRef.current) {
            rawJsonWindowRef.current.document.open();
            rawJsonWindowRef.current.document.write(content);
            rawJsonWindowRef.current.document.close();
        }
    };

    useEffect(() => {
        setSidebarOpen(activeStageId === 'input');
    }, [activeStageId]);

    const DEFAULT_PROMPT = `You are a senior Network Operations expert specializing in Root Cause Analysis.

**Incident Summary:**
- Device: {device}
- Severity: {severity}
- Primary Alarm: {alarm}
- Key Log Messages:
{logs}
- Metric Anomalies:
{metrics}
- Affected Interfaces: {interfaces}

Write a **highly effective, natural language search query** to find the most relevant RCA document in the knowledge base.

Rules:
- Be specific and technical
- Include symptoms, impact, and likely root causes
- Keep total length under 80 words
- Do not add explanations, only return the query text.

Query:`;

    const DEFAULT_REMEDY_PROMPT = `You are a senior Network Operations expert.

Given the following root cause analysis result, generate a concise search query
to find the most relevant remediation procedure, fix steps, and CLI commands.

Root Cause:
- RCA ID   : {rca_id}
- Title    : {title}
- Symptoms : {symptoms}
- Keywords : {keywords}
- Interfaces: {interfaces}
- Alarm codes: {alarm_codes}

Rules:
- Output ONLY the query text, no explanation
- Be specific and technical
- Focus on fix actions, CLI commands, and recovery steps
- Maximum 30 words

Query:`;

    const [config, setConfig] = useState({
        useEnhancedQueryBuilder: true,
        useLlmQueryBuilder: false,
        rerankK: 15,
        runRerankSearch: true,
        useLlmReranker: false,
    });
    
    const handleSaveConfig = async () => {
        try {
            await updateRcaConfig({
                USE_ENHANCED_QUERY_BUILDER: config.useEnhancedQueryBuilder,
                USE_LLM_QUERY_BUILDER: config.useLlmQueryBuilder,
                RERANK_K: config.rerankK,
                RUN_RERANK_SEARCH: config.runRerankSearch,
                USE_LLM_RERANKER: config.useLlmReranker,
                RUN_NORMAL_HYBRID_SEARCH: !config.runRerankSearch
            });
            toast.success("Configuration saved to backend successfully.");
        } catch (error: any) {
            toast.error("Failed to save config: " + (error.message || String(error)));
        }
    };
    const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
    const [isRemedyPromptEditorOpen, setIsRemedyPromptEditorOpen] = useState(false);

    // ── INPUT: 4 JSON panels ──────────────────────────────────────────────────
    const [rootEventJson, setRootEventJson] = useState(JSON.stringify(DEFAULT_ROOT_EVENT, null, 2));
    const [rawLogsJson, setRawLogsJson] = useState(JSON.stringify(DEFAULT_LOGS, null, 2));
    const [metricsJson, setMetricsJson] = useState(JSON.stringify(DEFAULT_METRICS_PAYLOAD, null, 2));
    const [topologyJson, setTopologyJson] = useState('{}');
    const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({});
    const [activeInputPanel, setActiveInputPanel] = useState('root_event');

    // ── Mindmap tree state ────────────────────────────────────────────────────
    const [selectedRCAIdx, setSelectedRCAIdx] = useState<number>(0);

    const setError = (k: string, msg: string) => setJsonErrors(p => ({ ...p, [k]: msg }));
    const clearError = (k: string) => setJsonErrors(p => { const q = { ...p }; delete q[k]; return q; });

    const tryParse = (raw: string, key: string): any | null => {
        try {
            const v = JSON.parse(raw);
            clearError(key);
            return v;
        } catch (e: any) {
            setError(key, e.message);
            return null;
        }
    };

    // ── Build payload ─────────────────────────────────────────────────────────
    const buildPayload = (): StepPayload | null => {
        const rootEvent = tryParse(rootEventJson, 'root_event');
        const rawLogs = rawLogsJson.trim() ? tryParse(rawLogsJson, 'raw_logs') : [];
        const metricsPayload = tryParse(metricsJson, 'metrics_payload');
        const topology = topologyJson.trim() ? tryParse(topologyJson, 'topology') : {};

        if (!rootEvent || !metricsPayload) {
            toast.error('Fix JSON errors before running');
            return null;
        }
        if (rawLogsJson.trim() && !Array.isArray(rawLogs)) {
            setError('raw_logs', 'Must be a JSON array of strings');
            toast.error('raw_logs must be a JSON array');
            return null;
        }
        return { root_event: rootEvent, raw_logs: rawLogs || [], metrics_payload: metricsPayload, topology: topology || {} };
    };

    // ── Run pipeline ──────────────────────────────────────────────────────────
    const handleRun = async () => {
        const payload = buildPayload();
        if (!payload) { toast.error("Fix JSON errors before running"); return; }

        setIsLoading(true);
        setResults(null);
        setTimings({});
        setCompleted([]);
        setActiveStageId('ner');

        const startTs = performance.now();
        let isApiDone = false;
        
        const runConfig = {
            run_rerank_search: config.runRerankSearch,
            run_normal_hybrid_search: !config.runRerankSearch,
            use_enhanced: config.useEnhancedQueryBuilder,
            use_llm_rca: config.useLlmQueryBuilder,
            rerank_k: config.rerankK,
        };

        const apiPromise = runRagV6Analysis(payload, runConfig).then(r => {
            isApiDone = true;
            return r;
        }).catch(e => {
            isApiDone = true;
            throw e;
        });

        const stageOrder = ['ner', 'search', 'rerank', 'topk'];
        const stageTimes = [1000, 900, 1200, 600];

        // Run UI timeline simulation concurrently with API request
        const uiPromise = (async () => {
            for (let i = 0; i < stageOrder.length; i++) {
                if (isApiDone) break; // If API finishes early, stop simulating
                const stageId = stageOrder[i];
                const waitTime = stageTimes[i] + Math.random() * 400;
                let elapsed = 0;

                while (elapsed < waitTime && !isApiDone) {
                    await new Promise(r => setTimeout(r, 50));
                    elapsed += 50;
                    setTimings(p => ({ ...p, [stageId]: Math.round(performance.now() - startTs) }));
                }

                if (!isApiDone) {
                    setTimings(p => ({ ...p, [stageId]: Math.round(performance.now() - startTs) }));
                    setCompleted(p => [...p, stageId]);
                    if (i < stageOrder.length - 1) setActiveStageId(stageOrder[i + 1]);
                }
            }

            // If we finished all fake stages but API is still running, keep ticking the final stage
            while (!isApiDone) {
                await new Promise(r => setTimeout(r, 50));
                setTimings(p => ({ ...p, 'topk': Math.round(performance.now() - startTs) }));
            }
        })();

        try {
            const resp = await apiPromise;
            await uiPromise; // Ensure UI loop terminates

            const finalTs = performance.now() - startTs;
            setCompleted(stageOrder); // Ensure all stages marked complete
            setTimings(p => ({ ...p, 'topk': Math.round(finalTs) })); // Exact final time

            setResults(resp);
            setActiveStageId('topk');
            // Auto-update raw JSON window if it's already open
            if (rawJsonWindowRef.current && !rawJsonWindowRef.current.closed) {
                writeRawJson(resp._raw || resp);
            }
            toast.success(`RCA complete — ${resp.total_rca_count || 0} diagnosis(es) found`);
        } catch (e: any) {
            await uiPromise;
            toast.error(e?.response?.data?.error || e.message || "Pipeline execution failed");
            setActiveStageId('input');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Stage renderers ────────────────────────────────────────────────────────

    const renderInput = () => {
        const panels = [
            {
                id: 'root_event', label: 'Root Event', icon: <Server className="w-5 h-5" />, color: 'text-primary bg-primary/10',
                value: rootEventJson, onChange: (v: string) => { setRootEventJson(v); tryParse(v, 'root_event'); },
                placeholder: 'Paste root_event JSON object...', req: true
            },
            {
                id: 'raw_logs', label: 'Raw Logs', icon: <Terminal className="w-5 h-5" />, color: 'text-purple-500 bg-purple-500/10',
                value: rawLogsJson, onChange: (v: string) => { setRawLogsJson(v); if(v.trim()) tryParse(v, 'raw_logs'); else clearError('raw_logs'); },
                placeholder: '["Log line 1", "Log line 2"]', req: false
            },
            {
                id: 'metrics_payload', label: 'Metrics', icon: <Activity className="w-5 h-5" />, color: 'text-amber-500 bg-amber-500/10',
                value: metricsJson, onChange: (v: string) => { setMetricsJson(v); tryParse(v, 'metrics_payload'); },
                placeholder: '{"cpu_util": {"router-1": [72, 85]}}', req: true
            },
            {
                id: 'topology', label: 'Topology', icon: <Network className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-500/10',
                value: topologyJson, onChange: (v: string) => { setTopologyJson(v); if (v.trim()) tryParse(v, 'topology'); else clearError('topology'); },
                placeholder: '{"downstream_count": 3}', req: false
            }
        ];

        return (
            <div className="h-full flex flex-col gap-1 animate-in fade-in duration-300">
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-1">
                            <FileJson className="w-2 h-2 text-primary" /> INCIDENT PAYLOAD
                        </h2>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 rounded-full gap-2" onClick={() => {
                        setRootEventJson(JSON.stringify(DEFAULT_ROOT_EVENT, null, 2));
                        setRawLogsJson(JSON.stringify(DEFAULT_LOGS, null, 2));
                        setMetricsJson(JSON.stringify(DEFAULT_METRICS_PAYLOAD, null, 2));
                        setTopologyJson('{}');
                        setJsonErrors({});
                        setActiveInputPanel('root_event');
                        toast.success('Reset to default example');
                    }}>
                        <RefreshCw className="w-3 h-3" /> Reset Example
                    </Button>
                </div>

                {(() => {
                    let parsedRootEvent: any = null;
                    try {
                        parsedRootEvent = JSON.parse(rootEventJson);
                    } catch (e) { }

                    if (!parsedRootEvent) return null;

                    return (
                        <div className="flex flex-wrap items-center justify-between gap-y-4 px-8 py-3 bg-card border rounded-xl shadow-sm shrink-0">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><Server className="w-3.5 h-3.5" /> DEVICE</span>
                                <span className="font-bold text-sm truncate">{parsedRootEvent.managed_object_name || parsedRootEvent.device_name || "N/A"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5" /> IP</span>
                                <span className="font-bold text-sm truncate">{parsedRootEvent.ip_address || "N/A"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> PROBABLE CAUSE</span>
                                <span className="font-bold text-sm truncate">{parsedRootEvent.probable_cause || "N/A"}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> SEVERITY</span>
                                <span className="font-bold text-sm truncate">{parsedRootEvent.severity || "N/A"}</span>
                            </div>
                        </div>
                    );
                })()}

                <div className="flex-1 flex flex-row gap-2 pb-2 min-h-0">
                    {panels.map(p => {
                        const isActive = activeInputPanel === p.id;
                        const err = jsonErrors[p.id];

                        return (
                            <div
                                key={p.id}

                                onClick={() => !isActive && setActiveInputPanel(p.id)}
                                className={cn(
                                    "rounded-xl border overflow-hidden flex flex-col relative bg-card",
                                    isActive ? "flex-1 shadow-md border-primary/20" : "w-[72px] shrink-0 cursor-pointer hover:bg-muted/30 opacity-70 hover:opacity-100",
                                    err && !isActive && "border-rose-500/50 bg-rose-500/5"
                                )}
                            >
                                {/* Header */}
                                <div className={cn(
                                    "px-4 py-2 flex items-center justify-between shrink-0",
                                    isActive ? "border-b bg-muted/10" : "flex-col gap-4 h-full pt-8",
                                    err && isActive && "bg-rose-500/5 border-rose-500/20"
                                )}>
                                    <div className={cn("flex gap-3", isActive ? "items-center" : "flex-col items-center")}>
                                        <div className={cn("p-2 rounded-xl shrink-0", p.color)}>{p.icon}</div>
                                        <div className={cn(isActive ? "text-left" : "[writing-mode:vertical-lr] flex items-center gap-2")}>
                                            <span className={cn("font-bold", isActive ? "text-base" : "text-sm tracking-widest whitespace-nowrap")}>
                                                {p.label}
                                            </span>
                                            {!p.req && isActive && <Badge variant="secondary" className="ml-2 text-[9px] h-4">optional</Badge>}
                                        </div>
                                    </div>

                                    {isActive && (
                                        err
                                            ? <span className="text-[10px] text-rose-500 font-mono flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{err}</span>
                                            : <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> VALID</span>
                                    )}
                                </div>

                                {/* Editor Body (only when active) */}
                                {isActive && (
                                    <div className="flex-1 flex flex-col min-h-0">
                                        <textarea
                                            className="flex-1 w-full p-4 bg-transparent text-foreground font-mono text-xs resize-none outline-none leading-relaxed"
                                            value={p.value}
                                            onChange={e => p.onChange(e.target.value)}
                                            spellCheck={false}
                                            placeholder={p.placeholder}
                                        />

                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };



    const renderMining = () => (
        <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" /> NER / Drain3
            </h2>
            {!results ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5 gap-4">
                    <div className="p-4 rounded-2xl bg-primary/10">
                        <Cpu className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="text-center">
                        <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                            {isLoading ? "Extracting entities & log patterns..." : "Run the pipeline to see mining results"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
                    {/* Entities */}
                    <Card className="flex flex-col overflow-hidden">
                        <CardHeader className="py-3 border-b bg-muted/20">
                            <CardTitle className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Extracted NER Entities</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 overflow-y-auto space-y-4">
                            {Object.entries(results.query?.entities || results.entities || {}).map(([k, vals]: [string, any]) => (
                                <div key={k}>
                                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-2">{k.replace('_', ' ')}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.isArray(vals) && vals.length > 0
                                            ? vals.map((v: string) => <Badge key={v} variant="secondary" className="font-mono text-[10px]">{v}</Badge>)
                                            : <span className="text-xs text-muted-foreground italic">None detected</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Log Clusters */}
                    <Card className="flex flex-col overflow-hidden">
                        <CardHeader className="py-3 border-b bg-muted/20">
                            <CardTitle className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Drain3 Log Clusters</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <table className="w-full text-[10px]">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr className="border-b">
                                            <th className="p-3 text-left font-bold text-muted-foreground">Template</th>
                                            <th className="p-3 text-center w-16 font-bold text-muted-foreground">Hits</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {[...(results.templates || results.log_features || results.query?.log_features || [])]
                                            .sort((a: any, b: any) => (b.count || 1) - (a.count || 1))
                                            .map((t: any, i: number) => (
                                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3 font-mono italic text-muted-foreground leading-relaxed">
                                                        <div className="flex items-center gap-2">
                                                            {(t.count || 1) > 1 && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] h-4 px-1.5 shrink-0">PATTERN</Badge>}
                                                            <span className="truncate max-w-xs" title={t.sample || t.text}>{t.template || t.sample}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <Badge variant="outline" className={cn("font-black", (t.count || 1) > 1 ? "border-primary/30 text-primary" : "text-muted-foreground")}>
                                                            {t.count || 1}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );

    const renderSearch = () => (
        <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> HYBRID RETRIEVAL
            </h2>
            {!results ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5 gap-4">
                    <div className="p-4 rounded-2xl bg-blue-500/10">
                        <Database className="w-10 h-10 text-blue-500 animate-pulse" />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                        {isLoading ? "Searching pgvector + BM25 knowledge base..." : "Run the pipeline to see retrieval results"}
                    </p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-5 min-h-0">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4">
                                <p className="text-[9px] font-black text-primary uppercase mb-2 tracking-wider">SEMANTIC VECTOR QUERY</p>
                                <p className="text-[11px] font-mono text-foreground leading-relaxed">{results.query?.semantic_text || "N/A"}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-amber-500/5 border-amber-500/20">
                            <CardContent className="p-4">
                                <p className="text-[9px] font-black text-amber-600 uppercase mb-2 tracking-wider">BM25 KEYWORD STRING</p>
                                <p className="text-[11px] font-mono text-foreground leading-relaxed opacity-70">{results.query?.keyword_string || "N/A"}</p>
                            </CardContent>
                        </Card>
                    </div>
                    {results.llm_usage && results.llm_usage.total_tokens > 0 && (
                        <Card className="bg-purple-500/5 border-purple-500/20">
                            <CardContent className="p-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-purple-500" />
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider">LLM Token Utilization</span>
                                </div>
                                <div className="flex gap-6 text-[10px] font-mono">
                                    <div className="flex flex-col items-center">
                                        <span className="text-muted-foreground uppercase text-[8px] font-bold">Prompt</span>
                                        <span className="text-foreground">{results.llm_usage.prompt_tokens}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-muted-foreground uppercase text-[8px] font-bold">Completion</span>
                                        <span className="text-foreground">{results.llm_usage.completion_tokens}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-purple-600 uppercase text-[8px] font-bold">Total</span>
                                        <span className="text-purple-600 font-bold">{results.llm_usage.total_tokens}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <div className="flex-1">
                        <div className="space-y-2 pb-4">
                            {(results.search_results || results.results || []).map((res: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl border bg-card flex gap-4 hover:border-primary/30 transition-all group">
                                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:text-primary transition-colors shrink-0">#{i + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-sm">{res.doc?.raw?.title || res.title || res.rca_id}</span>
                                            <Badge variant="outline" className="text-[9px] border-primary/20 text-primary shrink-0 ml-2">
                                                {res.doc?.raw?.category_hierarchy?.subcategory || 'Network'}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{res.doc?.raw?.description || res.doc?.raw?.root_cause_analysis}</p>
                                    </div>
                                    <div className="text-right pl-4 border-l min-w-[90px] flex flex-col justify-center shrink-0">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">HYBRID</p>
                                        <p className="text-sm font-bold font-mono">{(res.hybrid_score || res.prerank_score || 0).toFixed(4)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderRerank = () => (
        <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" /> CROSS-ENCODER RERANKING
            </h2>
            {!results ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5 gap-4">
                    <div className="p-4 rounded-2xl bg-yellow-500/10">
                        <Sparkles className="w-10 h-10 text-yellow-500 animate-pulse" />
                    </div>
                    <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                        {isLoading ? "Cross-encoder reranking candidates..." : "Run the pipeline to see reranking results"}
                    </p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-5 min-h-0">
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'CANDIDATES', value: (results.search_results || results.results || []).length, icon: FileText },
                            { label: 'AVG RELEVANCE', value: (() => { const sr = results.search_results || results.results || []; const avg = sr.reduce((acc: number, r: any) => acc + (r.cross_encoder_score || 0), 0) / (sr.length || 1); return avg.toFixed(3); })(), icon: Activity },
                            { label: 'MODEL', value: 'cross-encoder/bge-reranker-base', icon: Shield }
                        ].map((stat, i) => (
                            <Card key={i} className="bg-primary/5 border-primary/10">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary"><stat.icon className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">{stat.label}</p>
                                        <p className="text-sm font-black truncate">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="py-3 border-b bg-muted/20">
                            <CardTitle className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">CROSS-ENCODER SCORES</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            {(results.search_results || results.results || []).slice(0, 10).map((res: any, i: number) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[8px] h-4 font-mono">#{i + 1}</Badge>
                                            <span className="font-bold text-xs">{res.doc?.raw?.title || res.title || res.rca_id}</span>
                                        </div>
                                        <span className="text-primary font-black font-mono text-xs">{(res.cross_encoder_score || 0).toFixed(4)}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            style={{ width: `${Math.max(0, Math.min(100, (res.cross_encoder_score || 0) * 100))}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );

    const renderRCA = () => {
        if (!results) {
            return (
                <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between shrink-0">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" /> RCA &amp; REMEDIATION
                        </h2>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5 gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-500/10">
                            <Shield className="w-10 h-10 text-emerald-500 animate-pulse" />
                        </div>
                        <p className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                            {isLoading ? "Generating master-detail view..." : "Run the pipeline to see diagnosis results"}
                        </p>
                    </div>
                </div>
            );
        }

        const diagnoses = results.diagnoses || [];
        const activeDiagnosis = diagnoses[selectedRCAIdx] || null;

        return (
            <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" /> RCA &amp; REMEDIATION
                    </h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                            {results.total_rca_count || 0} Diagnoses
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold border hover:bg-muted"
                            onClick={() => writeRawJson(results._raw || results)}>
                            <FileJson className="w-3 h-3 mr-1" /> RAW JSON
                        </Button>
                    </div>
                </div>

                {diagnoses.length === 0 ? (
                    <div className="flex-1 p-10 border border-dashed rounded-xl flex flex-col items-center justify-center gap-3 bg-muted/5">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                        <p className="font-bold text-muted-foreground">No diagnoses returned. Try adjusting your payload or check backend logs.</p>
                    </div>
                ) : (
                    <div className="flex-1 flex min-h-0 gap-4">
                        {/* MASTER PANE - LIST OF RCAS */}
                        <div className="w-1/3 flex flex-col gap-3 min-h-0">
                            <ScrollArea className="flex-1 pr-3">
                                <div className="space-y-3 pb-4">
                                    {diagnoses.map((diag: any, i: number) => {
                                        const isSelected = i === selectedRCAIdx;
                                        return (
                                            <Card
                                                key={i}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden",
                                                    isSelected ? "border-primary/50 ring-1 ring-primary/20 bg-primary/5" : ""
                                                )}
                                                onClick={() => setSelectedRCAIdx(i)}
                                            >
                                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                                <div className="p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <Badge variant={i === 0 ? "default" : "secondary"} className="text-[9px]">
                                                            {i === 0 ? "TOP MATCH" : "ALT"}
                                                        </Badge>
                                                        <span className={cn("text-xs font-black", i === 0 ? "text-primary" : "text-muted-foreground")}>
                                                            {((diag.confidence || 0) * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xs font-bold leading-tight mb-2 line-clamp-2">{diag.title}</h3>
                                                    <p className="text-[10px] text-muted-foreground font-mono mt-2 pt-2 border-t">
                                                        {diag.remedies?.length || 0} Remedies
                                                    </p>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* DETAIL PANE */}
                        <Card className="flex-1 flex flex-col min-h-0 bg-card/50">
                            {activeDiagnosis && (
                                <ScrollArea className="flex-1">
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-mono tracking-widest uppercase">
                                                    Diagnosis Details
                                                </Badge>
                                        <span className="font-bold text-primary font-mono bg-primary/10 px-2 py-1 rounded text-xs">
                                                    CONFIDENCE: {((activeDiagnosis.confidence || 0) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold mb-4">{activeDiagnosis.title}</h2>
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap text-justify">
                                                {activeDiagnosis.root_cause_analysis}
                                            </div>
                                        </div>

                                        <div className="h-px bg-border my-6" />

                                        <div>
                                            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                                                <Database className="w-4 h-4 text-blue-500" /> SUPPORTING EVIDENCE
                                            </h3>
                                            <div className="space-y-4">
                                                {/* Relevant Logs */}
                                                {activeDiagnosis.relevant_logs?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Matched Log Patterns</h4>
                                                        <div className="grid gap-2">
                                                            {activeDiagnosis.relevant_logs.map((log: any, idx: number) => (
                                                                <div key={idx} className="bg-[#0d1117] border border-gray-800 rounded-md p-3 flex justify-between items-start gap-4">
                                                                    <code className="text-[11px] font-mono text-gray-300 leading-relaxed flex-1">{log.template || log.text}</code>
                                                                    {log.count && log.count > 1 ? (
                                                                        <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400 bg-blue-500/10 shrink-0">
                                                                            ×{log.count} occurrences
                                                                        </Badge>
                                                                    ) : log.score ? (
                                                                        <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400 bg-blue-500/10 shrink-0">
                                                                            {(log.score * 100).toFixed(0)}% MATCH
                                                                        </Badge>
                                                                    ) : null}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Anomalies */}
                                                {results.anomalies?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-4">Correlated Anomalies</h4>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {results.anomalies.map((anomaly: any, idx: number) => (
                                                                <Card key={idx} className="bg-muted/10 border-dashed p-3">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="text-xs font-bold text-foreground line-clamp-1" title={anomaly.metric}>{anomaly.metric}</span>
                                                                        <Badge variant="outline" className={cn("text-[9px] font-mono", anomaly.direction === 'spike' ? "text-rose-500 border-rose-500/30 bg-rose-500/10" : "text-amber-500 border-amber-500/30 bg-amber-500/10")}>
                                                                            {anomaly.direction === 'spike' ? 'SPIKE' : 'DROP'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex justify-between text-[11px]">
                                                                        <span className="text-muted-foreground">Change: <span className="text-foreground font-mono">{anomaly.change_pct > 0 ? '+' : ''}{anomaly.change_pct.toFixed(1)}%</span></span>
                                                                        <span className="text-muted-foreground">Z-Score: <span className="text-foreground font-mono">{anomaly.z_score.toFixed(1)}</span></span>
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {(!activeDiagnosis.relevant_logs?.length && !results.anomalies?.length) && (
                                                    <p className="text-sm text-muted-foreground italic">No supporting log or metric evidence found.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="h-px bg-border my-6" />

                                        <div>
                                            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                                                <Activity className="w-4 h-4 text-emerald-500" /> RECOMMENDED REMEDIES
                                            </h3>

                                            {(!activeDiagnosis.remedies || activeDiagnosis.remedies.length === 0) ? (
                                                <p className="text-sm text-muted-foreground italic">No specific remedies provided for this diagnosis.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {activeDiagnosis.remedies.map((remedy: any, j: number) => (
                                                        <RemedyExpanderCard key={j} remedy={remedy} index={j} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        );
    };

    const renderStageContent = () => {
        switch (activeStageId) {
            case 'input': return renderInput();
            case 'ner': return renderMining();
            case 'search': return renderSearch();
            case 'rerank': return renderRerank();
            case 'topk': return renderRCA();
            default: return renderInput();
        }
    };

    // ── Layout ────────────────────────────────────────────────────────────────
    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground">

                {/* Header */}
                <div className="h-12 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10"><Layout className="w-4 h-4 text-primary" /></div>
                        <div>
                            <h1 className="font-bold text-base tracking-tight flex items-center gap-2">
                                RAG PLAYGROUND
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted border">
                            <div className={cn("w-1.5 h-1.5 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                {isLoading ? "Processing" : "Engine Ready"}
                            </span>
                        </div>
                        <Button
                            className="h-7 px-4 rounded-md bg-primary hover:bg-primary/90 text-white text-xs font-bold tracking-wide gap-1.5 shadow-sm"
                            onClick={handleRun}
                            disabled={isLoading}
                        >
                            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            {isLoading ? "RUNNING..." : "RUN ANALYSIS"}
                        </Button>
                        <Button variant="outline" size="icon" className={cn("h-7 w-7 rounded-md", sidebarOpen && "bg-muted border-primary/50")}
                            onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <Sliders className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Timeline */}
                <PipelineTimeline
                    activeId={activeStageId}
                    completedIds={completedStages}
                    onStageClick={setActiveStageId}
                    timings={timings}
                    isLoading={isLoading}
                />

                {/* Body */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 px-6 py-2 overflow-hidden">
                        <div
                            key={activeStageId}
                            className="h-full overflow-y-auto pr-1"
                        >
                            {renderStageContent()}
                        </div>
                    </div>

                    {/* Settings Sidebar */}
                    {sidebarOpen && (
                        <div className="border-l bg-card/80 backdrop-blur-lg overflow-hidden z-10 shrink-0">
                            <div className="w-[380px] h-full flex flex-col p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                        <Sliders className="w-3.5 h-3.5 text-primary" /> Pipeline Config
                                    </h3>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSidebarOpen(false)}>
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>

                                <ScrollArea className="flex-1">
                                    <div className="space-y-4 pr-1">

                                        {/* ── Query Builder Mode ── */}
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Query Builder Mode</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-2 p-1.5 rounded border bg-muted/20 hover:bg-muted/40">
                                                    <p className="text-[10px] font-bold">Enhanced Query</p>
                                                    <Switch checked={config.useEnhancedQueryBuilder} onCheckedChange={v => setConfig(p => ({ ...p, useEnhancedQueryBuilder: v }))} className="scale-[0.6] shrink-0 m-0" />
                                                </div>
                                                <div className="flex items-center justify-between gap-2 p-1.5 rounded border bg-muted/20 hover:bg-muted/40">
                                                    <p className="text-[10px] font-bold">LLM Query</p>
                                                    <Switch checked={config.useLlmQueryBuilder} onCheckedChange={v => setConfig(p => ({ ...p, useLlmQueryBuilder: v }))} className="scale-[0.6] shrink-0 m-0" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Search Parameters ── */}
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Search Params</p>
                                            <div className="space-y-2.5">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[9px] font-black uppercase">
                                                        <span className="text-muted-foreground">Rerank K</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={config.rerankK || ''}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value);
                                                            if (!isNaN(val) && val > 0) {
                                                                setConfig(p => ({ ...p, rerankK: val }));
                                                            } else if (e.target.value === '') {
                                                                setConfig(p => ({ ...p, rerankK: '' as any }));
                                                            }
                                                        }}
                                                        className="w-full text-xs font-mono p-1 rounded border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Advanced Flags ── */}
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">Advanced Flags</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-2 p-1.5 rounded border bg-muted/20 hover:bg-muted/40">
                                                    <p className="text-[10px] font-bold">Rerank Search</p>
                                                    <Switch checked={config.runRerankSearch} onCheckedChange={v => setConfig(p => ({ ...p, runRerankSearch: v }))} className="scale-[0.6] shrink-0 m-0" />
                                                </div>
                                                <div className="flex items-center justify-between gap-2 p-1.5 rounded border bg-muted/20 hover:bg-muted/40">
                                                    <p className="text-[10px] font-bold">Use LLM Reranker</p>
                                                    <Switch checked={config.useLlmReranker} onCheckedChange={v => setConfig(p => ({ ...p, useLlmReranker: v }))} className="scale-[0.6] shrink-0 m-0" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── Action Buttons ── */}
                                        <div className="pt-4 pb-4">
                                            <Button
                                                className="w-full h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
                                                onClick={handleSaveConfig}
                                            >
                                                Save Configuration
                                            </Button>
                                        </div>

                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default RAGPlaygroundPage;
