import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTheme as useNextTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Play, FileJson, List, AlertCircle, BarChart2,
    Upload, Search, Brain, Activity, Shield,
    ArrowRight, Info, Cpu, Zap, X, ChevronRight,
    ChevronDown, Database, Link as LinkIcon, Eye,
    Maximize2, RefreshCw, Layers, Sliders, ToggleLeft,
    CheckCircle2, Circle, ArrowDown, Terminal, Fingerprint,
    ArrowUpRight, ArrowDownRight,
    Boxes, Network, Sparkles, Layout
} from 'lucide-react';
import { toast } from "sonner";

import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import { Switch } from "@/shared/components/ui/switch";
import { Badge } from "@/shared/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/shared/components/ui/select";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { runRagAnalysis, fetchRAGKB } from "@/api/rcaApi";

// --- Constants ---

const STAGES = [
    { id: 'input', label: '01_INGEST', icon: FileJson },
    { id: 'ner', label: '02_MINING', icon: Brain },
    { id: 'search', label: '03_RETRIEVE', icon: Database },
    { id: 'rerank', label: '04_RERANK', icon: Zap },
    { id: 'topk', label: '05_RCA_GEN', icon: Shield }
];

const INITIAL_JSON_EXAMPLE = {
    "root_event": {
        "_id": {
            "$oid": "69876eaeb278a13bebf27960"
        },
        "organization": "131135018821674340352",
        "agent_id": "BD738AA304BF4CFBAF5E152EA5B4095D",
        "last_update_time": {
            "$date": "2026-05-07T14:27:35.951Z"
        },
        "datetime": "2026-05-07 14:27:00.000000",
        "is_cleared": 1,
        "is_deleted": true,
        "last_down_at": {
            "$date": "2026-05-07T14:26:15.031Z"
        },
        "ci_id": "138706292364207460512",
        "parent_ci_id": "138706292364207460458",
        "probable_cause": "Performance Threshold Breach",
        "additional_text": "Critical infrastructure router became unreachable after prolonged CPU, memory, thermal and fan degradation.",
        "ip_address": "10.0.4.14",
        "event_type": "State Change",
        "parameter_name": "Availability",
        "parameter_value": 100,
        "parameter_unit": "%",
        "threshold_type": "1",
        "event_suppression": -1,
        "last_event": {
            "$date": "2026-05-07T14:27:00.000Z"
        },
        "event_count": 6,
        "stat_dn": "avail",
        "last_alarm_id": "26038771592",
        "severity": 5,
        "alarm_msg": "Device Not Reachable",
        "device_type": "Router",
        "managed_object_name": "Core-Router-01",
        "managed_object_class": "Device",
        "managed_object_type": "Node",
        "system_dn": null,
        "alarm_category": "Infrastructure Availability",
        "alarm_profile_id": "",
        "priority": 2,
        "remediation_procedure": "Verify hardware health, cooling subsystem, BGP processes, and restore management connectivity.",
        "audible_tone": "",
        "thresid": "141249995196148486144",
        "vendor": "Cisco",
        "managed_ems_ip": "",
        "managed_ems_name": "",
        "tracking_indicator": "",
        "creation_time": {
            "$date": "2026-05-07T14:12:14.418Z"
        },
        "first_event": {
            "$date": "2026-05-07T14:12:00.000Z"
        },
        "event_ids": [
            "143002795400926072862"
        ],
        "trackid": "142153051274325528602",
        "impacted_services": [
            "MPLS Backbone",
            "Internet Edge Connectivity",
            "BGP Transit Routing"
        ],
        "termination_status": true,
        "parent_alarms": [],
        "is_root": 1,
        "is_dependent": 0,
        "is_correlated": 1,
        "underlying_alarms": [
            "139165560427345088547"
        ],
        "clear_msg": "Device Reachable",
        "terminated_by": "System",
        "terminated_time": {
            "$date": "2026-05-07T14:28:00.000Z"
        }
    },
    "metrics_payload": {
        "cpu_util": {
            "Core-Router-01": [
                72,
                78,
                85,
                91,
                94,
                96,
                97,
                95
            ]
        },
        "memory_util": {
            "Core-Router-01": [
                68,
                75,
                81,
                86,
                89,
                92,
                94
            ]
        },
        "temp_c": {
            "RP0": [
                65,
                72,
                78,
                82,
                85,
                88,
                89
            ]
        },
        "fan_speed_rpm": {
            "Tray1": [
                4800,
                4500,
                3900,
                3200,
                2800,
                2400
            ]
        },
        "availability": {
            "Core-Router-01": [
                100,
                100,
                99,
                98,
                95,
                85,
                45,
                0
            ]
        },
        "icmp_response_ms": {
            "NMS": [
                15,
                18,
                22,
                45,
                120,
                450,
                1200,
                0
            ]
        }
    },
    "raw_logs": [
        "2026-05-07T14:12:05.123Z Core-Router-01 %SYS-5-CONFIG_I: Configured from console by automation",
        "2026-05-07T14:13:15.456Z Core-Router-01 %CPU-5-UTIL: CPU utilization 78%",
        "2026-05-07T14:14:22.789Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 6800ms",
        "2026-05-07T14:15:10.234Z Core-Router-01 %CPU-5-UTIL: CPU utilization 85%",
        "2026-05-07T14:16:05.678Z Core-Router-01 %SYS-2-MEMORY: Memory usage 82% - high pressure",
        "2026-05-07T14:16:55.111Z Core-Router-01 %CPU-5-UTIL: CPU utilization 91%",
        "2026-05-07T14:17:40.345Z Core-Router-01 %ENV-4-TEMP: Temperature threshold exceeded on RP0 (CPU temp 82C)",
        "2026-05-07T14:18:20.901Z Core-Router-01 %FAN-3-FANFAIL: Fan tray 1 speed below normal",
        "2026-05-07T14:19:05.567Z Core-Router-01 %CPU-5-UTIL: CPU utilization 94%",
        "2026-05-07T14:19:50.234Z Core-Router-01 %SYS-2-MEMORY: Critical memory usage - 89% utilized",
        "2026-05-07T14:20:35.890Z Core-Router-01 %ENV-3-TEMP: Chassis temperature rising rapidly (88C)",
        "2026-05-07T14:21:15.123Z Core-Router-01 %LINEPROTO-5-UPDOWN: Line protocol on Interface Te0/0/0 changed state to down",
        "2026-05-07T14:22:05.456Z Core-Router-01 %CPU-5-UTIL: CPU utilization 96% - sustained high",
        "2026-05-07T14:22:50.789Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 14500ms",
        "2026-05-07T14:23:30.234Z Core-Router-01 %FAN-3-FANFAIL: Multiple fan trays operating at reduced speed",
        "2026-05-07T14:24:10.567Z Core-Router-01 %SNMP-5-SNMP_AUTH_FAIL: SNMP polling failure from NMS",
        "2026-05-07T14:25:05.901Z Core-Router-01 %SYS-5-RESTART: System restarted due to high CPU",
        "2026-05-07T14:25:55.345Z Core-Router-01 %LINEPROTO-5-UPDOWN: Line protocol on Interface Te0/0/1 changed state to down",
        "2026-05-07T14:26:40.678Z Core-Router-01 info: Device not responding to ICMP echo requests",
        "2026-05-07T14:27:15.123Z Core-Router-01 %SYS-2-INTSCHED: Internal scheduler stalled for 4500ms",
        "2026-05-07T14:27:50.456Z Core-Router-01 Critical: Device unreachable from monitoring system"
    ],
    "topology": {}
};

// --- Components ---

const HorizontalTimeline = ({ activeId, completedIds, onStageClick, timings }: any) => {
    return (
        <div className="w-full flex items-center justify-between px-20 py-4 bg-card/30 border-b relative">
            {STAGES.map((stage, idx) => {
                const isActive = activeId === stage.id;
                const isCompleted = completedIds.includes(stage.id);
                const isPast = STAGES.findIndex(s => s.id === activeId) > idx;

                return (
                    <React.Fragment key={stage.id}>
                        <div
                            className="flex flex-col items-center gap-1.5 relative z-10 cursor-pointer group"
                            onClick={() => onStageClick(stage.id)}
                        >
                            {/* Node */}
                            <div className={`
                                w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300
                                ${isActive ? 'bg-primary/10 border-primary text-primary' : ''}
                                ${isCompleted || isPast ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-background border-border text-muted-foreground'}
                            `}>
                                {isCompleted || isPast ? (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                    isActive ? <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> : <Circle className="w-3.5 h-3.5" />
                                )}
                            </div>

                            {/* Label */}
                            <div className="flex flex-col items-center">
                                <span className={`text-[9px] font-bold tracking-tight uppercase ${isActive ? 'text-primary' : isCompleted || isPast ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                    {stage.label}
                                </span>
                                {timings[stage.id] && (
                                    <span className="text-[8px] font-mono text-muted-foreground">{timings[stage.id]}ms</span>
                                )}
                            </div>
                        </div>

                        {/* Connector */}
                        {idx < STAGES.length - 1 && (
                            <div className="flex-1 h-[1.5px] bg-border mx-2 relative -top-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: isCompleted || isPast ? '100%' : '0%' }}
                                    className="h-full bg-emerald-500"
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const RAGPlaygroundPage = () => {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [activeStageId, setActiveStageId] = useState('input');
    const [completedStages, setCompletedStages] = useState<string[]>([]);
    const [jsonInput, setJsonInput] = useState(JSON.stringify(INITIAL_JSON_EXAMPLE, null, 2));
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [timings, setTimings] = useState<Record<string, number>>({});

    const [config, setConfig] = useState({
        kbPath: "rca_json.json",
        retrieveK: 30,
        rerankK: 15,
        topK: 5,
        runRerank: true
    });

    const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);

    useEffect(() => {
        const loadKB = async () => {
            try {
                const data = await fetchRAGKB();
                setKnowledgeBase(data);
            } catch (e) {
                console.error("Failed to load KB for enrichment:", e);
            }
        };
        loadKB();
    }, []);

    const handleRunPipeline = async () => {
        setIsLoading(true);
        setResults(null);
        setTimings({});
        setCompletedStages([]);

        try {
            const parsed = JSON.parse(jsonInput);
            const payload = parsed.root_event ? parsed : { root_event: parsed, raw_logs: parsed.raw_logs || [], metrics_payload: parsed.metrics_payload || {} };

            const startTs = performance.now();
            const apiPromise = runRagAnalysis({ payload });

            for (const stage of STAGES) {
                setActiveStageId(stage.id);
                await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
                setTimings(prev => ({ ...prev, [stage.id]: Math.round(performance.now() - startTs) }));
                setCompletedStages(prev => [...prev, stage.id]);
            }

            const response = await apiPromise;
            // Ensure response matches the structure from logs if it doesn't already
            setResults(response);
            toast.success("RCA Pipeline Completed");
        } catch (e: any) {
            toast.error(e.message || "Execution failed");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStageContent = () => {
        let currentJson: any = {};
        try { currentJson = JSON.parse(jsonInput); } catch (e) { currentJson = {}; }
        const rootEvent = currentJson.root_event || currentJson;

        switch (activeStageId) {
            case 'input':
                return (
                    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <FileJson className="w-5 h-5 text-primary" /> EVENT INGESTION
                            </h2>
                            <Button variant="outline" size="sm" className="h-8 rounded-full" onClick={() => setJsonInput(JSON.stringify(INITIAL_JSON_EXAMPLE, null, 2))}>
                                <RefreshCw className="w-3 h-3 mr-2" /> Reset
                            </Button>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
                            <Card className="flex flex-col bg-slate-950/5 border-border overflow-hidden">
                                <CardHeader className="py-3 border-b bg-muted/30">
                                    <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">RAW JSON PAYLOAD</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 p-0">
                                    <textarea
                                        className="w-full h-full p-5 bg-transparent text-foreground font-mono text-xs resize-none outline-none"
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        spellCheck={false}
                                    />
                                </CardContent>
                            </Card>
                            <Card className="flex flex-col border-dashed bg-muted/10">
                                <CardHeader className="py-3 border-b">
                                    <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">PAYLOAD SUMMARY</CardTitle>
                                </CardHeader>
                                <CardContent className="p-5 space-y-5 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 rounded-xl border bg-card">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">Managed Object</p>
                                            <p className="text-sm font-bold truncate">{rootEvent.managed_object_name || rootEvent.device || "Unknown"}</p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-card">
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-1">IP Address</p>
                                            <p className="text-sm font-bold text-primary">{rootEvent.ip_address || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase">RAW LOGS ({currentJson.raw_logs?.length || 0})</p>
                                        <div className="space-y-1.5">
                                            {(currentJson.raw_logs || []).slice(0, 5).map((log: string, i: number) => (
                                                <div key={i} className="text-[10px] font-mono p-2.5 rounded-lg border bg-muted/20 truncate opacity-80">
                                                    {log}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'ner':
                return (
                    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" /> INTELLIGENT MINING
                        </h2>
                        {!results ? (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Cpu className="w-12 h-12 text-muted-foreground animate-pulse" />
                                <p className="mt-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Mining entities & log clusters</p>
                            </div>
                        ) : (
                            <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
                                <Card className="flex flex-col">
                                    <CardHeader className="py-3 border-b">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">EXTRACTED ENTITIES</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 overflow-y-auto">
                                        <div className="space-y-5">
                                            {Object.entries(results.entities || results.query?.entities || {}).map(([key, vals]: [string, any]) => (
                                                <div key={key} className="space-y-2">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{key.replace('_', ' ')}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {Array.isArray(vals) && vals.length > 0 ? vals.map((v: string) => (
                                                            <Badge key={v} variant="secondary" className="text-[10px] font-mono border-primary/10">{v}</Badge>
                                                        )) : <span className="text-[10px] text-muted-foreground italic">No entities detected</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="flex flex-col overflow-hidden">
                                    <CardHeader className="py-3 border-b">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">DRAIN3 LOG CLUSTERS</CardTitle>
                                            {results.templates?.length > 0 && (
                                                <Badge variant="outline" className="text-[9px] font-bold">
                                                    {results.templates.length} clusters
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
                                        <ScrollArea className="h-[450px]">
                                            <table className="w-full text-[10px]">
                                                <thead className="bg-muted sticky top-0 z-10">
                                                    <tr className="text-left font-bold text-muted-foreground border-b">
                                                        <th className="p-3">Template / Cluster</th>
                                                        <th className="p-3 text-center w-16">Hits</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {[...(results.templates || results.log_features || results.query?.log_features || [])]
                                                        .sort((a: any, b: any) => (b.count || b.hits || 1) - (a.count || a.hits || 1))
                                                        .map((t: any, i: number) => {
                                                            const isPattern = (t.count || t.hits || 1) > 1;
                                                            return (
                                                                <tr key={i} className={`hover:bg-muted/50 transition-colors ${isPattern ? 'bg-primary/[0.02]' : ''}`}>
                                                                    <td className="p-3 font-mono opacity-80 leading-relaxed italic text-primary/80">
                                                                        <div className="flex items-center gap-2">
                                                                            {isPattern && <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] h-4 px-1.5 font-black shrink-0">PATTERN</Badge>}
                                                                            <span className="truncate max-w-[800px]" title={t.sample || t.text}>
                                                                                {t.template || t.sample || t.text}
                                                                            </span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-3 text-center">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`bg-primary/5 ${isPattern ? 'border-primary/30 text-primary font-black scale-110 shadow-sm' : 'text-muted-foreground'}`}
                                                                        >
                                                                            {t.count || t.hits || 1}
                                                                        </Badge>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                );

            case 'search':
                return (
                    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" /> HYBRID RETRIEVAL
                        </h2>
                        {!results ? (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Search className="w-12 h-12 text-muted-foreground animate-pulse" />
                                <p className="mt-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Retrieving knowledge from index</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-5 min-h-0">
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-primary/5 border-primary/20">
                                        <CardContent className="p-4">
                                            <p className="text-[9px] font-bold text-primary uppercase mb-2">SEMANTIC VECTOR QUERY</p>
                                            <ScrollArea className="h-16">
                                                <p className="text-[11px] font-mono text-foreground leading-normal">
                                                    {results.query?.semantic_text || "N/A"}
                                                </p>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-amber-500/5 border-amber-500/20">
                                        <CardContent className="p-4">
                                            <p className="text-[9px] font-bold text-amber-600 uppercase mb-2">BM25 KEYWORD STRING</p>
                                            <ScrollArea className="h-16">
                                                <p className="text-[11px] font-mono text-foreground leading-normal opacity-70">
                                                    {results.query?.keyword_string || "N/A"}
                                                </p>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>
                                <ScrollArea className="flex-1">
                                    <div className="space-y-3 pr-4 pb-4">
                                        {(results.search_results || results.results)?.map((res: any, i: number) => (
                                            <div key={i} className="p-4 rounded-xl border bg-card flex gap-4 hover:border-primary/30 transition-all group">
                                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:text-primary transition-colors">#{i + 1}</div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-sm tracking-tight">{res.doc?.raw?.title || res.title || res.rca_id}</span>
                                                        <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">{res.doc?.raw?.category_hierarchy?.subcategory || 'Network'}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">{res.doc?.raw?.description || res.doc?.raw?.root_cause_analysis || res.root_cause_analysis}</p>
                                                </div>
                                                <div className="text-right pl-4 border-l min-w-[80px] flex flex-col justify-center">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5 tracking-tighter">HYBRID SCORE</p>
                                                    <p className="text-sm font-bold font-mono">{(res.hybrid_score || res.prerank_score || 0).toFixed(4)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                );

            case 'rerank':
                return (
                    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-primary" /> NEURAL RERANKING
                        </h2>
                        {!results ? (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Sparkles className="w-12 h-12 text-muted-foreground animate-pulse" />
                                <p className="mt-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Running Neural Reranker</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-6 min-h-0">
                                <div className="grid grid-cols-3 gap-5">
                                    {[
                                        { label: 'CANDIDATES', value: (results.search_results || results.results)?.length || 0, icon: List },
                                        { label: 'AVG RELEVANCE', value: (() => { const sr = results.search_results || results.results || []; const avg = sr.reduce((acc: number, r: any) => acc + (r.cross_encoder_score || 0), 0) / (sr.length || 1); return avg.toFixed(3); })(), icon: Activity },
                                        { label: 'MODEL', value: 'ms-marco-L6', icon: Shield }
                                    ].map((stat, i) => (
                                        <Card key={i} className="bg-primary/5 border-primary/10 shadow-sm">
                                            <CardContent className="p-4 flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary"><stat.icon className="w-4 h-4" /></div>
                                                <div>
                                                    <p className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">{stat.label}</p>
                                                    <p className="text-lg font-black">{stat.value}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <Card className="flex-1 flex flex-col overflow-hidden">
                                    <CardHeader className="py-3 border-b bg-muted/20">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">CROSS-ENCODER VALIDATION</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5 overflow-y-auto">
                                        {(results.search_results || results.results)?.slice(0, 8).map((res: any, i: number) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex items-center gap-2 truncate max-w-[500px]">
                                                        <Badge variant="outline" className="text-[8px] h-4 font-mono">#{i + 1}</Badge>
                                                        <span className="font-bold text-xs tracking-tight">{res.doc?.raw?.title || res.title || res.rca_id}</span>
                                                    </div>
                                                    <span className="text-primary font-black font-mono text-xs">{(res.cross_encoder_score || 0).toFixed(4)}</span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.max(5, Math.min(100, (res.cross_encoder_score || 0) * 100))}%` }}
                                                        className="h-full bg-primary"
                                                        transition={{ duration: 1, ease: "easeOut" }}
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

            case 'topk':
                return (
                    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" /> RCA CONCLUSION
                            </h2>
                            {results && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-[10px] font-bold border hover:bg-muted"
                                        onClick={() => {
                                            const win = window.open("", "_blank");
                                            win?.document.write(`<pre>${JSON.stringify(results, null, 2)}</pre>`);
                                        }}
                                    >
                                        <FileJson className="w-3 h-3 mr-1" /> RAW OUTPUT
                                    </Button>
                                    <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20">
                                        Build: {results.build_ms || '---'}ms
                                    </Badge>
                                </div>
                            )}
                        </div>
                        {!results ? (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Activity className="w-12 h-12 text-muted-foreground animate-pulse" />
                                <p className="mt-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Generating final outcome</p>
                            </div>
                        ) : (
                            <ScrollArea className="flex-1">
                                <div className="space-y-6 pr-4 pb-6">
                                    {/* Anomalies Band */}
                                    {((results.metric_facts || results.anomalies || results.anomaly_metrics || results.query?.metric_facts)?.length > 0) && (
                                        <Card className="bg-muted/30 border-dashed">
                                            <CardHeader className="py-2 border-b">
                                                <CardTitle className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Active Anomalies Detected</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3">
                                                <div className="flex flex-wrap gap-3">
                                                    {(results.metric_facts || results.anomalies || results.anomaly_metrics || results.query?.metric_facts).map((m: any, idx: number) => {
                                                        const isSpike = m.direction === 'spike' || m.change_pct > 0;
                                                        const absChange = Math.abs(m.change_pct).toFixed(1);

                                                        return (
                                                            <div key={idx} className="px-3 py-1.5 rounded-lg border bg-card flex items-center gap-3">
                                                                <div>
                                                                    <p className="text-[8px] font-bold text-muted-foreground uppercase">{m.metric}</p>
                                                                    <p className="text-[10px] font-mono font-bold">{m.entity}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={cn("text-xs font-black flex items-center gap-1", isSpike ? 'text-rose-500' : 'text-amber-500')}>
                                                                        {isSpike ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                                        {absChange}%
                                                                    </p>
                                                                    <p className="text-[7px] text-muted-foreground font-bold">Z:{Math.abs(m.z_score).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {(Array.isArray(results) ? results : results.results)?.slice(0, 3).map((res: any, i: number) => {
                                        // Robust mapping for varying backend schemas
                                        let rawConfidence = res.confidence ??
                                            (res.score && res.score <= 1 ? res.score * 100 : res.score) ??
                                            (res.final_score ? res.final_score * 100 : 0);

                                        // Ensure confidence is positive and formatted correctly
                                        const confidence = Math.abs(rawConfidence);

                                        const rcaId = res.rca_id || res.doc?.raw?.rca_id || res.doc?.doc_id || 'UNKNOWN';
                                        const title = res.title || res.doc?.raw?.title || 'Root Cause Identified';
                                        const analysis = res.root_cause_analysis || res.doc?.raw?.root_cause_analysis || res.doc?.raw?.description;

                                        // Matched Logs Fallbacks - extremely aggressive search
                                        const logs = res.relevant_logs ||
                                            res.matched_logs ||
                                            res.logs ||
                                            res.doc?.relevant_logs ||
                                            res.doc?.raw?.relevant_logs || [];

                                        return (
                                            <Card key={i} className={`overflow-hidden border-border bg-card shadow-sm ${i === 0 ? 'ring-2 ring-primary/20 ring-offset-2' : ''}`}>
                                                <div className={`h-1 ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex gap-3">
                                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>#{i + 1}</div>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge className={i === 0 ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"}>
                                                                        {i === 0 ? 'RECOMMENDED' : 'ALTERNATIVE'}
                                                                    </Badge>
                                                                    <span className="text-[10px] text-muted-foreground font-mono">ID: {rcaId}</span>
                                                                </div>
                                                                <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] text-muted-foreground font-bold uppercase mb-0.5">CONFIDENCE</p>
                                                            <p className={`text-3xl font-bold ${i === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                                                {confidence.toFixed(1)}%
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-8 mb-6">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Info className="w-4 h-4" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Analysis Summary</span>
                                                            </div>
                                                            <p className="text-xs leading-relaxed text-muted-foreground">{analysis}</p>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Terminal className="w-4 h-4" />
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Matched Log Evidence</span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {logs.length > 0 ? logs.slice(0, 3).map((log: any, j: number) => (
                                                                    <div key={j} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                                                                        <p className="text-[10px] font-mono text-muted-foreground line-clamp-2 italic" title={log.template}>
                                                                            "{log.sample || log.template || log.text}"
                                                                        </p>
                                                                        <div className="flex items-center justify-end mt-1">
                                                                            <Badge variant="outline" className="text-[8px] font-bold py-0 h-4">
                                                                                Score: {Math.abs(log.score || log.relevance || 0).toFixed(3)}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                )) : (
                                                                    <div className="p-4 border border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/5">
                                                                        <span className="text-[10px] text-muted-foreground font-bold italic">No log matches found</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center pt-4 border-t">
                                                        <div className="flex gap-1.5">
                                                            {(res.doc?.raw?.keywords || []).slice(0, 4).map((kw: string) => (
                                                                <Badge key={kw} variant="secondary" className="bg-muted text-muted-foreground text-[9px] px-2 py-0">{kw}</Badge>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            className="h-8 px-4 text-xs font-bold gap-2"
                                                            onClick={() => navigate(`/admin?section=RAGKB&highlight=${encodeURIComponent(rcaId)}`)}
                                                        >
                                                            KB Details <Maximize2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground">

                {/* Header */}
                <div className="h-16 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm z-20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Layout className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
                                RAG PLAYGROUND
                                <Badge variant="secondary" className="text-[9px] font-bold">V5 ENGINE</Badge>
                            </h1>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Automated Root Cause Investigation</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border">
                            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                {isLoading ? 'Processing' : 'Engine Ready'}
                            </span>
                        </div>
                        <Button
                            className="h-9 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold tracking-wide gap-2 shadow-sm transition-all"
                            onClick={handleRunPipeline}
                            disabled={isLoading}
                        >
                            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            RUN ANALYSIS
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className={`h-9 w-9 rounded-lg transition-colors ${!sidebarCollapsed ? 'bg-muted border-primary/50' : ''}`}
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Timeline */}
                <HorizontalTimeline
                    activeId={activeStageId}
                    completedIds={completedStages}
                    onStageClick={setActiveStageId}
                    timings={timings}
                />

                {/* Main View */}
                <div className="flex-1 flex overflow-hidden relative">
                    <div className="flex-1 p-6 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStageId}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className="h-full overflow-y-auto pr-2 scrollbar-thin"
                            >
                                {renderStageContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 300, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="border-l bg-card/80 backdrop-blur-lg overflow-hidden relative z-20"
                            >
                                <div className="w-[300px] h-full flex flex-col p-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Sliders className="w-4 h-4 text-primary" /> Configuration
                                        </h3>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setSidebarCollapsed(true)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <ScrollArea className="flex-1">
                                        <div className="space-y-8">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Knowledge Base</Label>
                                                <Select value={config.kbPath} onValueChange={(v) => setConfig(prev => ({ ...prev, kbPath: v }))}>
                                                    <SelectTrigger className="h-9 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="rca_json.json">Network RCA v5</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-6">
                                                <Label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Search Parameters</Label>
                                                {[
                                                    { label: 'Retrieve K', key: 'retrieveK', max: 50 },
                                                    { label: 'Rerank K', key: 'rerankK', max: 20 },
                                                    { label: 'Top K', key: 'topK', max: 10 },
                                                ].map((s) => (
                                                    <div key={s.key} className="space-y-2">
                                                        <div className="flex justify-between text-[10px] font-bold uppercase">
                                                            <span className="text-muted-foreground">{s.label}</span>
                                                            <span className="text-primary">{(config as any)[s.key]}</span>
                                                        </div>
                                                        <Slider
                                                            value={[(config as any)[s.key]]}
                                                            max={s.max}
                                                            min={1}
                                                            onValueChange={([v]) => setConfig(prev => ({ ...prev, [s.key]: v }))}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="pt-6 border-t">
                                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-primary" />
                                                        <span className="text-xs font-bold">AI Reranking</span>
                                                    </div>
                                                    <Switch checked={config.runRerank} onCheckedChange={(v) => setConfig(prev => ({ ...prev, runRerank: v }))} />
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </MainLayout>
    );
};

export default RAGPlaygroundPage;
