import React, { useState, useMemo, useRef } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import {
    Typography, Box, Container, Button, Paper, ThemeProvider, createTheme,
    Grid, TextField, Divider, Chip, Card, CardContent, IconButton,
    Table, TableBody, TableCell, TableContainer, TableRow, CircularProgress,
    Tooltip
} from '@mui/material';
import {
    LayoutDashboard, Play, FileJson, List, AlertCircle, BarChart2,
    Upload, Trash2, CheckCircle2, Search, Brain, Activity, Shield,
    ArrowRight, Info, Cpu, Thermometer, Wifi, Link2, Zap, FileUp, X
} from 'lucide-react';
import { toast } from "sonner";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { runRagAnalysis } from "@/api/rcaApi";

// --- Types ---
interface RootEvent {
    _id?: any;
    organization?: string;
    datetime?: string;
    is_cleared?: number;
    probable_cause?: string;
    ip_address?: string;
    event_type?: string;
    alarm_msg?: string;
    device_type?: string;
    managed_object_name?: string;
    severity?: number;
    priority?: number;
    alarm_category?: string;
    vendor?: string;
    event_count?: number;
    [key: string]: any;
}

interface RAGPayload {
    intent_id?: string;
    description?: string;
    payload: {
        raw_logs: string[];
        root_event: RootEvent;
        metrics_payload: Record<string, Record<string, any[]>>;
        topology?: Record<string, any>;
    };
}

// --- Constants ---
const INITIAL_JSON_EXAMPLE = {
    "intent_id": "link.down",
    "description": "Realistic vendor data simulation",
    "payload": {
        "raw_logs": [
            "2026-02-07T18:00:45.123Z Core-Router-X %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 4500ms",
            "2026-02-07T18:02:10.567Z Core-Router-X %ENV-4-TEMP: Temperature threshold exceeded on slot 1 (CPU temp 78C)",
            "2026-02-07T18:03:55.890Z Core-Router-X %FAN-3-FANFAIL: Fan tray 2 speed below normal",
            "2026-02-07T18:05:20.234Z Core-Router-X %LINK-5-CHANGED: Interface Gi0/5 changed state to administratively down (unrelated port)",
            "2026-02-07T18:07:15.678Z Core-Router-X %CPU-5-UTIL: CPU utilization 92% - high memory pressure also detected",
            "2026-02-07T18:09:40.012Z Core-Router-X %THERMAL-2-ALERT: Chassis temperature rising rapidly",
            "2026-02-07T18:12:05.456Z Core-Router-X info: SNMP polling to 10.0.4.14 intermittent but not fully lost"
        ],
        "root_event": {
            "organization": "131135018821674340352",
            "ip_address": "10.0.4.14",
            "event_type": "State Change",
            "severity": 5,
            "alarm_msg": "Device Not Reachable",
            "managed_object_name": "System"
        },
        "metrics_payload": {
            "cpu_util": { "Core-Router-X": [75, 82, 91, 95, 93, 88] },
            "temp_c": { "Core-Router-X": [62, 68, 74, 79, 81, 77] },
            "fan_speed": { "Tray2": [4200, 3800, 3100, 2800, 2500, 2900] }
        },
        "topology": {}
    }
};

const RAGPlaygroundPage = () => {
    const { theme: appTheme, systemTheme } = useNextTheme();
    const isDark = appTheme === 'dark' || (appTheme === 'system' && systemTheme === 'dark');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const muiTheme = useMemo(() => createTheme({
        palette: {
            mode: isDark ? 'dark' : 'light',
            primary: { main: '#3b82f6' },
            background: {
                default: 'transparent',
                paper: isDark ? '#0f172a' : '#ffffff'
            },
            text: {
                primary: isDark ? '#f8fafc' : '#0f172a',
                secondary: isDark ? '#94a3b8' : '#64748b'
            },
            divider: isDark ? '#1e293b' : '#e2e8f0'
        },
        typography: { 
            fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h4: { fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1.75rem' },
            h5: { fontWeight: 700, fontSize: '1.25rem' },
            h6: { fontWeight: 700, fontSize: '1.1rem' },
            subtitle2: { fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em' }
        }
    }), [isDark]);

    const [jsonInput, setJsonInput] = useState("");
    const [parsedData, setParsedData] = useState<RAGPayload | null>(null);
    const [results, setResults] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showInput, setShowInput] = useState(true);

    const handleProcessPayload = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed.payload || (!parsed.payload.raw_logs && !parsed.payload.root_event)) {
                toast.error("JSON structure is invalid. Must contain 'payload' with 'raw_logs' or 'root_event'.");
                return;
            }
            setParsedData(parsed);
            setShowInput(false);
            toast.success("Payload Ingested Successfully");
        } catch (e) {
            toast.error("Invalid JSON format");
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            setJsonInput(content);
            try {
                const parsed = JSON.parse(content);
                if (!parsed.payload || (!parsed.payload.raw_logs && !parsed.payload.root_event)) {
                    toast.error("JSON structure is invalid. Must contain 'payload'.");
                    return;
                }
                setParsedData(parsed);
                setShowInput(false);
                toast.success(`Simulation "${file.name}" Ingested & Ready`);
            } catch (err) {
                toast.error("Invalid JSON file format");
            }
        };
        reader.readAsText(file);
    };

    const handleClear = () => {
        setJsonInput("");
        toast.info("Input cleared");
    };

    const handleReset = () => {
        setParsedData(null);
        setResults(null);
        setShowInput(true);
    };

    const handleAnalyze = async () => {
        if (!parsedData) return;
        setIsLoading(true);
        try {
            const analysisResults = await runRagAnalysis(parsedData);
            setResults(analysisResults);
            toast.success("RAG Pipeline Analysis Complete");
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.error || "Pipeline Execution Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <ThemeProvider theme={muiTheme}>
                <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Box sx={{
                                p: 1, borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white', boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
                            }}>
                                <Brain size={24} />
                            </Box>
                            <Box>
                                <Typography variant="h5">RAG Ingestion Playground</Typography>
                            </Box>
                        </Box>
                        <Box display="flex" gap={2}>
                            {parsedData && (
                                <>
                                    <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: '10px', textTransform: 'none', px: 2, py: 0.6, fontSize: '0.85rem' }}>
                                        Back to Input
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleAnalyze}
                                        disabled={isLoading}
                                        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <Play size={16} />}
                                        sx={{ borderRadius: '10px', px: 3, py: 0.8, fontWeight: 600, textTransform: 'none', fontSize: '0.85rem' }}
                                    >
                                        {isLoading ? 'Running Analysis...' : 'Run Analysis'}
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* Step 1: User Input (JSON) */}
                    {showInput && (
                        <Paper sx={{
                            p: 4, borderRadius: '24px', border: '1px solid', borderColor: 'divider',
                            position: 'relative', overflow: 'hidden',
                            background: isDark
                                ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)'
                                : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                            boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />

                            <Box sx={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                py: 3, px: 2, borderRadius: '24px', border: '2px dashed', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#e2e8f0',
                                bgcolor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(248, 250, 252, 0.5)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)'
                                }
                            }}>
                                <Box sx={{
                                    mb: 3, p: 3, borderRadius: '50%',
                                    bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                                    color: 'primary.main'
                                }}>
                                    <Upload size={48} strokeWidth={1.5} />
                                </Box>

                                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Upload Incident Data</Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '500px', mb: 5, lineHeight: 1.6 }}>
                                    Upload a JSON simulation file containing incident metrics, events, and topology data to execute the IERAG2 RCA Pipeline.
                                </Typography>

                                <Box display="flex" gap={2}>
                                    <input
                                        type="file"
                                        accept=".json"
                                        style={{ display: 'none' }}
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        startIcon={<FileJson size={20} />}
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{
                                            borderRadius: '14px', px: 4, py: 1.5,
                                            fontWeight: 700, textTransform: 'none',
                                            borderWidth: '2px',
                                            '&:hover': { borderWidth: '2px' }
                                        }}
                                    >
                                        CHOOSE FILE
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        disabled={!jsonInput || jsonInput.trim() === ""}
                                        onClick={handleProcessPayload}
                                        sx={{
                                            borderRadius: '14px', px: 4, py: 1.5,
                                            fontWeight: 700, textTransform: 'none',
                                            boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
                                        }}
                                    >
                                        RUN ANALYSIS
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    )}

                    {/* Step 2: Visualized Ingested Data */}
                    {parsedData && !showInput && (
                        <Box>
                            <Grid container spacing={3} mb={4}>
                                {/* Logs */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card sx={{ height: '550px', borderRadius: '24px', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                                        <Box p={2.5} borderBottom="1px solid" borderColor="divider" display="flex" alignItems="center" justifyContent="space-between">
                                            <Box display="flex" alignItems="center" gap={1.5}><List size={20} color="#3b82f6" /><Typography variant="h6">Logs Ingested</Typography></Box>
                                            <Chip label={parsedData.payload.raw_logs?.length || 0} size="small" variant="outlined" />
                                        </Box>
                                        <Box flex={1} overflow="auto" p={2} bgcolor={isDark ? 'rgba(0,0,0,0.1)' : '#f8fafc'}>
                                            {parsedData.payload.raw_logs?.map((log, i) => (
                                                <Box key={i} mb={1} p={1.5} sx={{ borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', fontSize: '0.75rem', fontFamily: 'monospace' }}>{log}</Box>
                                            )) || <Typography variant="caption" color="text.secondary">No logs provided</Typography>}
                                        </Box>
                                    </Card>
                                </Grid>

                                {/* Incident */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card sx={{ height: '550px', borderRadius: '24px', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                                        <Box p={2.5} borderBottom="1px solid" borderColor="divider" display="flex" alignItems="center" gap={1.5}><AlertCircle size={20} color="#ef4444" /><Typography variant="h6">Root Event</Typography></Box>
                                        <Box flex={1} overflow="auto" p={2}>
                                            {parsedData.payload.root_event ? Object.entries(parsedData.payload.root_event)
                                                .filter(([k]) => !['id', '_id', 'ID', 'organization', 'ORGANIZATION'].includes(k.toLowerCase()))
                                                .map(([k, v]) => (
                                                    <Box key={k} mb={2}>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{k.replace(/_/g, ' ')}</Typography>
                                                        <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</Typography>
                                                        <Divider sx={{ mt: 1 }} />
                                                    </Box>
                                                )) : <Typography variant="caption" color="text.secondary">No event details provided</Typography>}
                                        </Box>
                                    </Card>
                                </Grid>

                                {/* Metrics */}
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Card sx={{ height: '550px', borderRadius: '24px', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                                        <Box p={2.5} borderBottom="1px solid" borderColor="divider" display="flex" alignItems="center" gap={1.5}><BarChart2 size={20} color="#10b981" /><Typography variant="h6">Metric Telemetry</Typography></Box>
                                        <Box flex={1} overflow="auto" p={2.5} bgcolor={isDark ? 'rgba(0,0,0,0.1)' : '#f8fafc'}>
                                            {parsedData.payload.metrics_payload ? Object.entries(parsedData.payload.metrics_payload).map(([name, data]) => (
                                                <Box key={name} mb={3}>
                                                    <Typography variant="subtitle2" color="primary" fontWeight={700} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Activity size={16} />{name}</Typography>
                                                    {Object.entries(data).map(([dev, vals]) => (
                                                        <Box key={dev} mb={1} p={1.5} bgcolor="background.paper" borderRadius="12px" border="1px solid" borderColor="divider">
                                                            <Typography variant="caption" color="text.secondary" fontWeight={600}>{dev}</Typography>
                                                            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>{vals.map((v, i) => <Chip key={i} label={String(v)} size="small" sx={{ fontSize: '0.7rem' }} />)}</Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )) : <Typography variant="caption" color="text.secondary">No metrics provided</Typography>}
                                        </Box>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Analysis Results (Displayed after Run Analysis) */}
                            {results && (
                                <Box sx={{ animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                                    <Divider sx={{ my: 6 }}><Chip label="RAG PIPELINE INSIGHTS" color="primary" sx={{ fontWeight: 800, px: 2 }} /></Divider>
                                    
                                    {/* Top Row: Insights Summary */}
                                    <Grid container spacing={3} mb={4}>
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Card sx={{ p: 3, borderRadius: '24px', height: '100%', border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>DOMAIN CLASSIFICATION</Typography>
                                                <Box display="flex" flexWrap="wrap" gap={1} mt={1.5}>{results.query.inferred_domains.map((d: string) => <Chip key={d} label={d.toUpperCase()} color="primary" size="small" sx={{ fontWeight: 700, borderRadius: '6px' }} />)}</Box>
                                            </Card>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 8 }}>
                                            <Card sx={{ p: 3, borderRadius: '24px', height: '100%', border: '1px solid', borderColor: 'divider' }}>
                                                <Typography variant="subtitle2" fontWeight={800} color="text.secondary" gutterBottom>ANOMALY DETECTION</Typography>
                                                <Box display="flex" flexWrap="wrap" gap={2}>
                                                    {results.anomalies?.length > 0 ? results.anomalies.map((a: any, idx: number) => (
                                                        <Box key={idx} mt={1} p={2} borderRadius="16px" bgcolor={isDark ? 'rgba(239,68,68,0.05)' : '#fef2f2'} border="1px solid" borderColor="error.light" sx={{ minWidth: '280px', flex: 1 }}>
                                                            <Box display="flex" justifyContent="space-between" alignItems="center"><Typography variant="body2" fontWeight={700} color="error">{a.metric}</Typography><Chip label={a.direction.toUpperCase()} size="small" color="error" sx={{ height: '20px', fontSize: '0.6rem', fontWeight: 800 }} /></Box>
                                                            <Typography variant="caption" display="block" mt={0.5} fontWeight={600}>{a.entity}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{a.baseline} → {a.current} ({a.change_pct}%)</Typography>
                                                            <Box mt={0.5} display="flex" justifyContent="space-between"><Typography variant="caption" fontWeight={700}>Z-Score</Typography><Typography variant="caption" fontWeight={800}>{a.z_score.toFixed(2)}</Typography></Box>
                                                        </Box>
                                                    )) : <Typography variant="caption" color="text.secondary">No statistical anomalies detected.</Typography>}
                                                </Box>
                                            </Card>
                                        </Grid>
                                    </Grid>

                                    {/* Semantic Matches Row */}
                                    <Paper sx={{ p: 4, borderRadius: '32px', border: '1px solid', borderColor: 'primary.main', position: 'relative', overflow: 'hidden', boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(59,130,246,0.1)' }}>
                                        <Box display="flex" alignItems="center" gap={1.5} mb={4}><Search size={24} color="#3b82f6" /><Typography variant="h5">Knowledge Base Semantic Matches</Typography></Box>
                                        <Grid container spacing={3}>
                                            {results.results && results.results.length > 0 ? results.results.map((r: any, i: number) => (
                                                <Grid size={{ xs: 12, md: 6 }} key={i}>
                                                    <Box sx={{ 
                                                         p: 3, borderRadius: '20px', height: '100%', 
                                                         bgcolor: i === 0 
                                                            ? (isDark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.02)') 
                                                            : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'), 
                                                         border: '1px solid', 
                                                         borderColor: i === 0 ? 'success.main' : 'divider',
                                                         position: 'relative',
                                                         transition: 'all 0.3s ease',
                                                         '&:hover': { transform: 'translateY(-4px)', boxShadow: i === 0 ? '0 10px 20px rgba(34, 197, 94, 0.1)' : 'none' }
                                                     }}>
                                                         {i === 0 && (
                                                             <Chip 
                                                                label="TOP MATCH" 
                                                                size="small" 
                                                                color="success" 
                                                                sx={{ position: 'absolute', top: -10, right: 20, fontWeight: 900, height: '20px', fontSize: '0.6rem' }} 
                                                             />
                                                         )}
                                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                            <Box>
                                                                <Typography variant="h6" fontWeight={800} color={i === 0 ? 'success.main' : 'primary'}>
                                                                    {typeof r.doc.raw.intent_id === 'string'
                                                                        ? r.doc.raw.intent_id
                                                                        : (r.doc.raw.category ? `${r.doc.raw.category.toUpperCase()} Analysis` : 'RCA Intent')}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{r.doc.raw.description}</Typography>
                                                            </Box>
                                                            <Box textAlign="right" sx={{ minWidth: '80px' }}>
                                                                <Typography variant="h4" color={i === 0 ? 'success.main' : 'primary'} fontWeight={800}>
                                                                    {(r.final_score * 100).toFixed(1)}%
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.6rem' }}>Confidence</Typography>
                                                            </Box>
                                                        </Box>
                                                        <Grid container spacing={2} mt={1}>
                                                            <Grid size={4}><Box p={1} sx={{ textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}><Typography variant="caption" display="block" color="text.secondary">Pre-rank</Typography><Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.75rem' }}>{r.prerank_score.toFixed(3)}</Typography></Box></Grid>
                                                            <Grid size={4}><Box p={1} sx={{ textAlign: 'center', borderRight: '1px solid', borderColor: 'divider' }}><Typography variant="caption" display="block" color="text.secondary">Cross-Encoder</Typography><Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.75rem' }}>{r.cross_encoder_score.toFixed(3)}</Typography></Box></Grid>
                                                            <Grid size={4}><Box p={1} sx={{ textAlign: 'center' }}><Typography variant="caption" display="block" color="text.secondary">Final</Typography><Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.75rem' }}>{r.final_score.toFixed(3)}</Typography></Box></Grid>
                                                        </Grid>
                                                    </Box>
                                                </Grid>
                                            )) : <Grid size={12}><Box textAlign="center" py={8}><Info size={48} color="#94a3b8" /><Typography mt={2} color="text.secondary">No semantic matches identified for this payload.</Typography></Box></Grid>}
                                        </Grid>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    )}
                </Container>
            </ThemeProvider>
        </MainLayout>
    );
};

export default RAGPlaygroundPage;
