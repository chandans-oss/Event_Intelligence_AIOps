import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { FileUpload } from '../components/rca/FileUpload';
import { TimelineFlow } from '../components/rca/TimelineFlow';
import { StepCard } from '../components/rca/StepCard';
import { runRcaFlow } from '../api/rcaApi';
import { Typography, Box, Container, CircularProgress, Button, Paper, Tabs, Tab, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { LayoutDashboard, RotateCcw } from 'lucide-react';
import { toast } from "sonner";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import '@/styles/rcaPlayground.css';



const KPI_MAP: Record<string, [string, string]> = {
    "utilization_percent": ["B/W Util", "%"],
    "util_pct": ["B/W Util", "%"],
    "cpu_percent": ["CPU Util", "%"],
    "cpu_pct": ["CPU Util", "%"],
    "mem_percent": ["Mem Util", "%"],
    "mem_util_pct": ["Mem Util", "%"],
    "men_util_pct": ["Mem Util", "%"],
    "temp_c": ["Device Temperature", " ℃"],
    "latency_ms": ["Latency", " ms"],
    "packet_loss_percent": ["Packet Loss", "%"],
    "traffic_dscp0_percent": ["DSCP0 Traffic", "%"],
    "in_errors": ["Input Errors", " pkts"],
    "crc_errors": ["CRC Errors", " pkts"],
    "out_discards": ["Output Errors", " pkts"],
    "queue_depth": ["Buffer Util", " pkts"],
    "buffer_util": ["Buffer Util", " pkts"],
    "fan_speed": ["Fan Speed", " rpm"],
    "power_watt": ["Power Supply", " watt"]
};

const LOADING_MESSAGES = [
    "Event PreProcessing and Correlating...",
    "Orchestrator: Orchestrating and forming incident and goal...",
    "Intent Router: Routing to possible intent...",
    "Hypothesis Scorer: Scoring hypotheses using metrics and logs...",
    "Situation Builder: Building semantic situation card...",
    // "Planner LLM: Planning diagnostic steps for backup analysis...",
    "Historical Data Retriever: Executes Plans and Fetches from history...",
    "RCA Correlator Engine: Finalizing RCA...",
];
const RCA_STEP_CONFIG = [
    {
        "title": "Step 0: Event Pre-processing / Correlation",
        "icon": "🚨",
        "sub": "• Event Deduplication / Suppression / Normalization.  <br>• Event Correlation.",
        "data": {},
        "tl_title": "Event Pre-processing / Correlation",
        "tl_desc": "",
        "mini": "Event Pre-processing / Correlation process completed.",
    },
    {
        "title": "Step 1: Orchestration",
        "icon": "📊",
        "sub": "• Incident Creation. <br> • Goal Creation.",
        "data": {
            "Incident ID": "",
            "Device": "",
            "Interface": "",
            "Correlation Window": "",
            "Trigger Event": "",
            "Logs and Trap": "",
            "Initial Severity": "",
            "Goal": "",
            "KPIs": {},
        },
        "tl_title": "Orchestration",
        "tl_desc": "Incident & Goal created",
        "mini": "Orchestration process completed.",
    },
    {
        "title": "Step 2: Intent Routing",
        "icon": "🎯",
        "sub": "• Identify Intent.",
        "data": {
            "Selected Intent": "",
            "Intent Status": "",
            "Intent Score": "",
            "Top 3 Intents": "",
            "Key Matches": "",
        },
        "tl_title": "Intent Routing",
        "tl_desc": "",
        "mini": "Intent Router process completed.",
    },
    {
        "title": "Step 3: Hypothesis Scoring",
        "icon": "🔍",
        "sub": "• Identify possible hypothesis.",
        "data": {
            "Selected Intent": "",
            "Top Hypothesis": "",
            "Hypothesis Scores": "",
            "Log Evidence": "",
        },
        "tl_title": "Hypotheses Scorer",
        "tl_desc": "",
        "mini": "Hypothesis Scorer process completed.",
    },
    {
        "title": "Step 4: Situation Card Generation",
        "icon": "📋",
        "sub": "• Create Situation Card <br>• Dump to current vector DB.",
        "data": {
            "Situation ID": "",
            "Summary": "",
            "Tags": "",
            "Input Data": "",
            "Embedding": "Vector representation stored for similarity search",
        },
        "tl_title": "Situation Builder",
        "tl_desc": "",
        "mini": "Situation Builder process completed.",
    },
    // {
    //     "title": "Step 5: Planner LLM",
    //     "icon": "🧠",
    //     "sub": "• Plans Tools for execution.",
    //     "data": {
    //         "Plan ID": "",
    //         "Tools": "",
    //         "Plan Steps": {},
    //         "Stop Condition": "",
    //     },
    //     "tl_title": "Planner LLM",
    //     "tl_desc": "",
    //     "mini": "Planner LLM process completed",
    // },
    {
        "title": "Step 5: Historical Data Retriever",
        "icon": "📚",
        "sub": " • Fetches Data from system (Base on PlannerLLM recommendations). <br>• Updates latest values in current vector DB. <br>• And Retrives similar historical cases from vector DB.",
        "data": {
            "Query": "",
            "Top Match": "",
            "Retrieved Cases": "",
            "Confidence Boost": "",
        },
        "tl_title": "Historical Data Retriever",
        "tl_desc": "",
        "mini": "Historical Data Retriever process completed.",
    },
    {
        "title": "Step 6: RCA Correlator Engine",
        "icon": "🔗",
        "sub": "• Final RCA. <br>• Remedy.",
        "data": {
            "Final RCA": "",
            "RCA Confidence": "",
            "Key Evidence": [],
            "Proposed Remedy": "",
        },
        "tl_title": "RCA Correlator Engine",
        "tl_desc": "",
        "mini": "RCA Correlator Engine process completed.",
    }
];

const RCAPlaygroundPage = () => {
    const { theme: appTheme, systemTheme } = useNextTheme();
    const isDark = appTheme === 'dark' || (appTheme === 'system' && systemTheme === 'dark');

    const muiTheme = useMemo(() => createTheme({
        palette: {
            mode: isDark ? 'dark' : 'light',
            primary: { main: '#3b82f6' },
            background: {
                default: 'transparent',
                paper: isDark ? '#12172b' : '#ffffff'
            },
            text: {
                primary: isDark ? '#e8ecf5' : '#1e293b',
                secondary: isDark ? '#8b94b0' : '#64748b'
            },
            divider: isDark ? '#2a3354' : '#e2e8f0'
        },
        typography: { fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none', borderColor: isDark ? '#2a3354' : '#e2e8f0' }
                }
            }
        }
    }), [isDark]);

    const [rawSteps, setRawSteps] = useState<any[]>([]);
    const [animatedSteps, setAnimatedSteps] = useState<any[]>([]);
    const [currentStepIdx, setCurrentStepIdx] = useState(-1);
    const [activeTab, setActiveTab] = useState(0);
    const [loadingStepIdx, setLoadingStepIdx] = useState(-1);
    const [isFetching, setIsFetching] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const animationRef = useRef<NodeJS.Timeout | null>(null);

    const formatStepData = (stepIdx: number, incident: any) => {
        const config = RCA_STEP_CONFIG[stepIdx] || { title: `Step ${stepIdx}`, tl_title: `Step ${stepIdx}`, icon: "📍", mini: "Awaiting...", sub: "" };
        let formattedData: Record<string, any> = {};
        let tl_desc = "";
        let mini = config.mini;

        if (!incident) return { ...config, step: stepIdx, data: {}, tl_desc: "Wait...", mini: "Awaiting..." };

        const id = incident.incident_id || incident.alaram_id || "N/A";
        const dev = incident.device || "N/A";
        const res = incident.resource_name || incident.resoure_name || "N/A";

        switch (stepIdx) {
            case 0:
                formattedData = {};
                tl_desc = id;
                break;

            case 1:
                const signals = incident.signals || {};
                formattedData = {
                    "Incident ID": id,
                    "Device": dev,
                    "Interface": res,
                    "Correlation Window": `Last 15 min from ${incident.timestamp || 'N/A'}`,
                    "Trigger Event": (incident.logs || [])[0] || "N/A",
                    "Logs and Trap": (
                        <div style={{ fontSize: '0.85rem' }}>
                            <div>Logs and traps found in system during last 15 minutes</div>
                            {(incident.logs || []).slice(1).map((log: string, i: number) => (
                                <div key={i} style={{ color: 'var(--rca-text-secondary)', wordBreak: 'break-word' }}>• {log}</div>
                            ))}
                        </div>
                    ),
                    "Initial Severity": "Critical",
                    "Goal": incident.goal || "N/A",
                    "KPIs": (
                        <div className="metrics-container">
                            {Object.entries(signals).map(([deviceName, metrics]: [string, any]) => (
                                <div key={deviceName} style={{ marginTop: '10px' }}>
                                    <h5 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Device: {deviceName}</h5>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--rca-border-color)' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--rca-bg-tertiary)' }}>
                                                <th style={{ textAlign: 'left', padding: '6px', border: '1px solid var(--rca-border-color)' }}>Metric</th>
                                                <th style={{ textAlign: 'left', padding: '6px', border: '1px solid var(--rca-border-color)' }}>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(metrics).map(([k, v]: [string, any]) => {
                                                const [label, unit] = KPI_MAP[k] || [k, ""];
                                                return (
                                                    <tr key={k}>
                                                        <td style={{ padding: '6px', border: '1px solid var(--rca-border-color)' }}>{label}</td>
                                                        <td style={{ padding: '6px', border: '1px solid var(--rca-border-color)', fontFamily: 'monospace' }}>{String(v)}{unit}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )
                };
                tl_desc = "Incident & Goal created";
                break;

            case 2:
                const [bestIntent, restAll, matchRules] = incident.intent_output || [["N/A", 0, "N/A"], [], {}];
                const sortedRest = [...restAll].sort((a, b) => b[1] - a[1]);
                const bestId = bestIntent[0];
                const score = bestIntent[1];

                formattedData = {
                    "Selected Intent": bestId,
                    "Intent Status": (
                        <span style={{ fontWeight: 600 }}>
                            Score: {score} {score > 0.85 ? '🟢 Strong match' : score > 0.65 ? '🟡 Medium match' : '🔴 Weak match'}
                        </span>
                    ),
                    "Intent Score": score,
                    "Top 3 Intents": sortedRest.slice(0, 3).map(i => `${i[0]} (${i[1]})`).join(', '),
                    "Key Matches": (
                        <div style={{ fontSize: '0.88rem' }}>
                            <div style={{ marginBottom: '4px' }}>Signal Matches:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                                {(matchRules[bestId]?.signals || []).map((s: string) => (
                                    <span key={s} className="rule-pill rule-hit" style={{ background: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', color: isDark ? '#4ade80' : '#166534', border: isDark ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid #22c55e', padding: '2px 8px', borderRadius: '4px' }}>{s}</span>
                                ))}
                            </div>
                            <div style={{ marginBottom: '4px' }}>Log Matches:</div>
                            <div style={{ color: 'var(--rca-text-secondary)' }}>{(matchRules[bestId]?.keyword || []).join(', ') || 'None'}</div>
                        </div>
                    )
                };
                tl_desc = bestId;
                break;

            case 3:
                const topHypo = incident.top_hypothesis || {};
                const topP = Math.round(Math.min(Math.max(topHypo.total_score || 0, 0), 1) * 100);

                const scoresMap: Record<string, any> = {};
                (incident.hypotheses || []).forEach((h: any) => {
                    scoresMap[h.hypothesis_id] = h.total_score;
                });

                formattedData = {
                    "Selected Intent": incident.intent || "N/A",
                    "Top Hypothesis": `${topHypo.description || ''} (score: ${topP}%)`,
                    "Hypothesis Scores": (
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {Object.entries(scoresMap).map(([hId, hScore]) => (
                                <div key={hId} style={{ fontSize: '0.85rem' }}><b>{hId}:</b> {String(hScore)}</div>
                            ))}
                        </div>
                    ),
                    "Log Evidence": (
                        <div style={{ fontSize: '0.85rem' }}>
                            {(incident.hypotheses || []).map((h: any) => h.matched_logs?.length > 0 && (
                                <div key={h.hypothesis_id} style={{ marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 700, color: isDark ? '#60a5fa' : '#1e40af' }}>{h.hypothesis_id}</div>
                                    {h.matched_logs.map((log: string, i: number) => <div key={i} style={{ paddingLeft: '8px', color: 'var(--rca-text-secondary)', wordBreak: 'break-word' }}>• {log}</div>)}
                                </div>
                            ))}
                        </div>
                    )
                };
                tl_desc = topHypo.hypothesis_id || "Decision";
                break;

            case 4:
                const sitObj = incident.situation_card || {};
                formattedData = {
                    "Situation ID": sitObj.situation_id || "N/A",
                    "Summary": sitObj.situation_text || "N/A",
                    "Tags": "N/A",
                    "Input Data": (
                        <pre style={{ margin: 0, padding: '10px', background: 'var(--rca-bg-tertiary)', color: 'var(--rca-text-primary)', borderRadius: '6px', fontSize: '0.75rem', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {JSON.stringify({ ...sitObj.metadata, logs: incident.logs }, null, 2)}
                        </pre>
                    ),
                    "Embedding": "Vector representation stored for similarity search"
                };
                tl_desc = sitObj.situation_id || "Verified";
                break;

            // case 5:
            //     const p = incident.plan || { steps: [] };
            //     formattedData = {
            //         "Plan ID": p.plan_id || "N/A",
            //         "Tools": (p.steps || []).map((s: any) => s.tool).join(', '),
            //         "Plan Steps": (
            //             <pre style={{ margin: 0, padding: '10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.75rem', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            //                 {JSON.stringify(p.steps || [], null, 2)}
            //             </pre>
            //         ),
            //         "Stop Condition": p.stop_when || "N/A"
            //     };
            //     tl_desc = "Planner LLM process completed";
            //     break;

            case 5: {
                const hCases = incident.historical?.retrieved_cases || [];
                formattedData = {
                    "Query": incident.situation_card?.situation_text || "N/A",
                    "Top Match": hCases[0]?.case_id || "N/A",
                    "Retrieved Cases": (
                        <div style={{ fontSize: '0.88rem' }}>
                            {hCases.map((c: any, i: number) => (
                                <div key={c.case_id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: i < hCases.length - 1 ? '1px solid var(--rca-border-color)' : 'none' }}>
                                    <div><b>Case ID:</b> {c.case_id}</div>
                                    <div style={{ marginTop: '4px' }}><b>Situation Summary:</b> {c.sit_summary}</div>
                                    <div style={{ marginTop: '4px' }}><b>Predicted RCA:</b> {c.rca}</div>
                                    <div style={{ marginTop: '4px' }}><b>Remedy:</b> {c.remedy}</div>
                                    <div style={{ marginTop: '4px' }}><b>Matching Score:</b> {Math.round(c.sim_score * 100)}%</div>
                                </div>
                            ))}
                        </div>
                    ),
                    "Confidence Boost": "+0.15"
                };
                tl_desc = "Historical Data Retriever process completed";
                break;
            }

            case 6: {
                const rcaOut = incident.correlator_llm_output || {};
                formattedData = {
                    "Final RCA": rcaOut.rca || "No Prediction",
                    "RCA Confidence": rcaOut.confidence || "N/A",
                    "Key Evidence": (rcaOut.evidence_used || []).map((e: any) => `metric: ${e.metric} -> value: ${e.value}`).join(' | '),
                    "Proposed Remedy": (rcaOut.remedy || []).map((r: string) => r.replace(';', '<br>• ')).join('\n')
                };
                tl_desc = "Correlator LLM process completed";
                break;
            }

            default:
                formattedData = { "Status": "Processing..." };
        }

        return { ...config, step: stepIdx, data: formattedData, tl_desc, mini, is_final: stepIdx === 6 };
    };

    const runAnimation = (fullSteps: any[]) => {
        setIsAnimating(true);
        setCurrentStepIdx(-1);
        setLoadingStepIdx(0);
        setActiveTab(0);
        let idx = 0;
        const total = Math.min(fullSteps.length, RCA_STEP_CONFIG.length);

        const next = () => {
            if (idx < total) {
                setLoadingStepIdx(idx);
                setActiveTab(idx);

                animationRef.current = setTimeout(() => {
                    const formatted = formatStepData(idx, fullSteps[idx].data);
                    setAnimatedSteps(prev => {
                        const newArr = [...prev];
                        newArr[idx] = formatted;
                        return newArr;
                    });
                    setLoadingStepIdx(-1);
                    setCurrentStepIdx(idx);

                    animationRef.current = setTimeout(() => {
                        idx++;
                        next();
                    }, 1200);
                }, 800);
            } else {
                setLoadingStepIdx(-1);
                setIsAnimating(false);
            }
        };

        setAnimatedSteps([]);
        next();
    };

    const handleRunRca = async (file: File) => {
        setIsFetching(true);
        setRawSteps([]);
        setAnimatedSteps([]);
        setCurrentStepIdx(-1);
        setLoadingStepIdx(-1);
        setActiveTab(0);
        try {
            const response = await runRcaFlow(file);
            if (response.steps && response.steps.length > 0) {
                setRawSteps(response.steps);
                toast.success("Analysis started...");
                runAnimation(response.steps);
            } else {
                toast.error("No results.");
            }
        } catch (error) {
            toast.error("Error communicating with backend.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleRestart = () => {
        if (animationRef.current) clearTimeout(animationRef.current);
        setRawSteps([]);
        setAnimatedSteps([]);
        setCurrentStepIdx(-1);
        setLoadingStepIdx(-1);
        setActiveTab(0);
        setIsAnimating(false);
    };

    return (
        <MainLayout>
            <ThemeProvider theme={muiTheme}>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <LayoutDashboard size={32} color="#3b82f6" />
                            <Typography variant="h4" fontWeight="800" color="text.primary">RCA Playground</Typography>
                        </Box>
                        {(animatedSteps.length > 0) && (
                            <Button variant="outlined" startIcon={<RotateCcw size={18} />} onClick={handleRestart} sx={{ borderRadius: '10px' }}>
                                Restart Analysis
                            </Button>
                        )}
                    </Box>

                    <Box mt={1}>
                        <TimelineFlow
                            steps={RCA_STEP_CONFIG.map((c, i) => ({
                                ...c,
                                step: i,
                                tl_desc: animatedSteps[i]?.tl_desc || 'Pending...'
                            }))}
                            currentIdx={currentStepIdx}
                        />
                    </Box>

                    {animatedSteps.length === 0 && !isFetching && (
                        <Box mt={2} display="flex" justifyContent="center">
                            <FileUpload onFileSelect={handleRunRca} isLoading={isFetching} />
                        </Box>
                    )}

                    {isFetching && (
                        <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                            <CircularProgress size={60} thickness={4} sx={{ mb: 4 }} />
                            <Typography variant="h6" color="text.secondary">Running Backend Flow...</Typography>
                        </Box>
                    )}

                    {animatedSteps.length > 0 && (
                        <Box mt={2}>
                            <Box mt={4} sx={{ maxWidth: '1000px', mx: 'auto' }}>
                                <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, pt: 1, pb: 0 }}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={(e, val) => setActiveTab(val)}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        sx={{
                                            minHeight: '48px',
                                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'var(--rca-text-secondary)' },
                                            '& .Mui-selected': { color: '#2563eb !important' },
                                            '& .MuiTabs-indicator': { backgroundColor: '#2563eb', height: '3px', borderRadius: '3px 3px 0 0' }
                                        }}
                                    >
                                        {RCA_STEP_CONFIG.map((c, i) => (
                                            <Tab
                                                key={i}
                                                label={c.tl_title}
                                                disabled={i > Math.max(currentStepIdx, loadingStepIdx)}
                                            />
                                        ))}
                                    </Tabs>
                                </Paper>

                                {animatedSteps[activeTab] ? (
                                    <StepCard step={animatedSteps[activeTab]} />
                                ) : (
                                    loadingStepIdx === activeTab && isAnimating && (
                                        <Paper className="rca-card loading" sx={{ p: 4, mb: 4, background: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb', borderLeft: '6px solid #f59e0b' }}>
                                            <Typography variant="h6" display="flex" alignItems="center" gap={2} sx={{ color: isDark ? '#fcd34d' : '#92400e' }}>
                                                <CircularProgress size={20} color="inherit" />
                                                {LOADING_MESSAGES[activeTab] || 'Processing step...'}
                                            </Typography>
                                        </Paper>
                                    )
                                )}
                            </Box>
                        </Box>
                    )}
                </Container>
            </ThemeProvider>
        </MainLayout>
    );
};

export default RCAPlaygroundPage;
