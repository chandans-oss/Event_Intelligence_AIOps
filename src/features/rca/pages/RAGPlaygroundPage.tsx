import React, { useState, useMemo, useEffect } from 'react';
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
import { runRagAnalysis } from "@/api/rcaApi";

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
        "managed_object_name": "Core-Router-01",
        "alarm_msg": "Device Not Reachable",
        "probable_cause": "Performance Threshold Breach",
        "severity": 5,
        "event_type": "State Change",
        "ip_address": "10.0.4.14",
        "device_type": "Router"
    },
    "metrics_payload": {
        "cpu_util": { "Core-Router-01": [72, 78, 85, 91, 94, 96, 97, 95] },
        "memory_util": { "Core-Router-01": [68, 75, 81, 86, 89, 92, 94] },
        "availability": { "Core-Router-01": [100, 100, 99, 98, 95, 85, 45, 0] }
    },
    "raw_logs": [
        "2026-05-07T14:14:22Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process BGP Scanner took 6800ms",
        "2026-05-07T14:16:05Z Core-Router-01 %SYS-2-MEMORY: Memory usage 82% - high pressure",
        "2026-05-07T14:21:15Z Core-Router-01 %LINEPROTO-5-UPDOWN: Line protocol on Interface Te0/0/0 changed state to down",
        "2026-05-07T14:27:50Z Core-Router-01 Critical: Device unreachable from monitoring system"
    ]
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
                await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
                setTimings(prev => ({ ...prev, [stage.id]: Math.round(performance.now() - startTs) }));
                setCompletedStages(prev => [...prev, stage.id]);
            }

            const response = await apiPromise;
            setResults(response);
            toast.success("Analysis Complete");
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
                                <Card>
                                    <CardHeader className="py-3 border-b">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">EXTRACTED ENTITIES</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="space-y-5">
                                            {Object.entries(results.entities || {}).map(([key, vals]: [string, any]) => (
                                                <div key={key} className="space-y-2">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{key}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {vals.length > 0 ? vals.map((v: string) => (
                                                            <Badge key={v} variant="secondary" className="text-[10px] font-mono">{v}</Badge>
                                                        )) : <span className="text-[10px] text-muted-foreground italic">None</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="flex flex-col overflow-hidden">
                                    <CardHeader className="py-3 border-b">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">LOG TEMPLATES</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 flex-1">
                                        <ScrollArea className="h-full">
                                            <table className="w-full text-[10px]">
                                                <thead className="bg-muted sticky top-0 z-10">
                                                    <tr className="text-left font-bold text-muted-foreground border-b">
                                                        <th className="p-3">Template</th>
                                                        <th className="p-3 text-center w-16">Count</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {(results.templates || []).map((t: any, i: number) => (
                                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                            <td className="p-3 font-mono opacity-80">{t.template}</td>
                                                            <td className="p-3 text-center"><Badge variant="outline">{t.count}</Badge></td>
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

            case 'search':
                return (
                    <div className="h-full flex flex-col gap-5 animate-in fade-in duration-300">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" /> KNOWLEDGE RETRIEVAL
                        </h2>
                        {!results ? (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Search className="w-12 h-12 text-muted-foreground animate-pulse" />
                                <p className="mt-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Retrieving knowledge from index</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-5 min-h-0">
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div className="flex-1 mr-6">
                                            <p className="text-[9px] font-bold text-primary uppercase mb-1">SEARCH QUERY</p>
                                            <p className="text-xs font-mono text-foreground italic line-clamp-2">"{results.query?.retrieval_text}"</p>
                                        </div>
                                        <div className="flex gap-5 pl-5 border-l">
                                            <div className="text-center">
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">Vectors</p>
                                                <p className="text-lg font-bold">30</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase">Keyword</p>
                                                <p className="text-lg font-bold">15</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <ScrollArea className="flex-1">
                                    <div className="space-y-3 pr-4 pb-4">
                                        {results.results?.map((res: any, i: number) => (
                                            <div key={i} className="p-4 rounded-xl border bg-card flex gap-4 hover:border-primary/30 transition-all group">
                                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:text-primary transition-colors">#{i+1}</div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-sm tracking-tight">{res.doc?.raw?.title || res.doc?.raw?.rca_id}</span>
                                                        <Badge variant="outline" className="text-[9px]">{res.doc?.raw?.category_hierarchy?.subcategory || 'Network'}</Badge>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">{res.doc?.raw?.description || res.doc?.raw?.root_cause_analysis}</p>
                                                </div>
                                                <div className="text-right pl-4 border-l min-w-[80px] flex flex-col justify-center">
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">SCORE</p>
                                                    <p className="text-sm font-bold font-mono">{(res.hybrid_score || 0).toFixed(4)}</p>
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
                            <Zap className="w-5 h-5 text-primary" /> AI RERANKING
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
                                        { label: 'Candidates', value: '15', icon: List },
                                        { label: 'Avg Relevance', value: (results.results?.reduce((acc: any, curr: any) => acc + (curr.cross_encoder_score || 0), 0) / results.results?.length).toFixed(3), icon: Activity },
                                        { label: 'Confidence', value: 'High', icon: Shield }
                                    ].map((stat, i) => (
                                        <Card key={i} className="bg-primary/5 border-primary/10">
                                            <CardContent className="p-4 flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary"><stat.icon className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{stat.label}</p>
                                                    <p className="text-xl font-bold">{stat.value}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                                <Card className="flex-1 flex flex-col overflow-hidden">
                                    <CardHeader className="py-3 border-b">
                                        <CardTitle className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">RERANKING RESULTS</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-5 overflow-y-auto">
                                        {results.results?.slice(0, 6).map((res: any, i: number) => (
                                            <div key={i} className="space-y-1.5">
                                                <div className="flex justify-between items-end">
                                                    <span className="font-bold text-xs tracking-tight truncate max-w-[500px]">{res.doc?.raw?.title || res.doc?.raw?.rca_id}</span>
                                                    <span className="text-primary font-bold font-mono text-xs">{(res.cross_encoder_score || 0).toFixed(4)}</span>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(100, (res.cross_encoder_score || 0) * 100)}%` }}
                                                        className="h-full bg-primary"
                                                        transition={{ duration: 0.8 }}
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
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" /> RCA CONCLUSION
                        </h2>
                        {!results ? (
                            <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/5">
                                <Activity className="w-12 h-12 text-muted-foreground animate-pulse" />
                                <p className="mt-4 text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Generating final outcome</p>
                            </div>
                        ) : (
                            <ScrollArea className="flex-1">
                                <div className="space-y-6 pr-4 pb-6">
                                    {results.results?.slice(0, 3).map((res: any, i: number) => {
                                        const confidence = res.confidence ?? (res.final_score ? res.final_score * 100 : 0);
                                        const title = res.title || res.doc?.raw?.title || 'Root Cause Identified';
                                        const rcaId = res.rca_id || res.doc?.raw?.rca_id || res.doc?.doc_id || 'UNKNOWN';
                                        const analysis = res.root_cause_analysis || res.doc?.raw?.root_cause_analysis || res.doc?.raw?.description;
                                        const hypotheses = res.doc?.raw?.hypotheses || [];
                                        const logs = res.relevant_logs || [];

                                        return (
                                            <Card key={i} className={`overflow-hidden border-border bg-card shadow-sm ${i === 0 ? 'ring-2 ring-primary/20 ring-offset-2' : ''}`}>
                                                <div className={`h-1 ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
                                                <CardContent className="p-6">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="flex gap-3">
                                                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${i === 0 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>#{i+1}</div>
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
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">Analysis</span>
                                                            </div>
                                                            <p className="text-xs leading-relaxed text-muted-foreground">{analysis}</p>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                {hypotheses.length > 0 ? <Fingerprint className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                                    {hypotheses.length > 0 ? 'Verification Hypotheses' : 'Supporting Evidence (Logs)'}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {hypotheses.length > 0 ? (
                                                                    hypotheses.slice(0, 2).map((h: any, j: number) => (
                                                                        <div key={j} className="p-3 rounded-lg bg-muted/40 border border-border/50">
                                                                            <span className="font-bold text-[11px] block mb-0.5">{h.description}</span>
                                                                            <p className="text-[10px] text-muted-foreground line-clamp-1">{h.remediation_steps}</p>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    logs.slice(0, 3).map((log: any, j: number) => (
                                                                        <div key={j} className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                                                                            <p className="text-[10px] font-mono text-muted-foreground line-clamp-2">
                                                                                {log.template}
                                                                            </p>
                                                                            <div className="flex items-center justify-end mt-1">
                                                                                <Badge variant="outline" className="text-[8px] font-bold py-0 h-4">Score: {log.score.toFixed(3)}</Badge>
                                                                            </div>
                                                                        </div>
                                                                    ))
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
                                                            Details <Maximize2 className="w-3 h-3" />
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
                                                            <span className="text-primary">{ (config as any)[s.key] }</span>
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
