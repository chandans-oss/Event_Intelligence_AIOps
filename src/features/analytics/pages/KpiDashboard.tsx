import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Zap,
    AlertTriangle,
    Clock,
    ShieldCheck,
    TrendingUp,
    ChevronRight,
    Search,
    BrainCircuit,
    Workflow,
    RefreshCw,
    Database,
    Layers,
    Target,
    X,
    Info,
    BarChart3,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend,
    Sankey,
    LabelList
} from 'recharts';
import { cn } from '@/shared/lib/utils';

// --- MOCK DATA ---
const BASE_KPI_STATS = [
    { label: 'Noise Reduction', value: 82, trend: '+11% vs last period', color: '#06B6D4' },
    { label: 'Correlation Efficiency', value: 91, trend: '+7% vs last period', color: '#F59E0B' },
    { label: 'SLA Compliance', value: 98, trend: '+2% vs last period', color: '#10B981' },
    { label: 'MTTR Reduction', value: 63, trend: '+15% vs last period', color: '#A855F7' },
    { label: 'Auto-Remediation', value: 74, trend: '+15% vs last period', color: '#06B6D4' },
    { label: 'RCA Confidence', value: 88, trend: '+9% vs last period', color: '#10B981' },
    { label: 'Downtime Reduction', value: 57, trend: '+16% vs last period', color: '#F59E0B' },
    { label: 'Log Error Reduction', value: 68, trend: '+16% vs last period', color: '#A855F7' }
];


const CircularProgress = ({ value, color }: { value: number, color: string }) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width="90" height="90" className="-rotate-90 transform">
                <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    strokeWidth="8"
                    stroke={color}
                    fill="transparent"
                    className="opacity-20"
                />
                <circle
                    cx="45"
                    cy="45"
                    r={radius}
                    strokeWidth="8"
                    stroke={color}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{value}</span>
                <span className="text-[9px] font-bold text-slate-500 mt-0.5">%</span>
            </div>
        </div>
    );
};

const PIPELINE_STAGES = [
    { name: 'Ingest', value: '2,482', delta: '+4.9%', sub: '2.4s', color: 'cyan', description: 'Real-time telemetry ingestion from 128 network nodes.' },
    { name: 'Deduplicate', value: '1,845', delta: '-25.6%', sub: '1.4s', color: 'emerald', conf: '96% conf', input: '2,482 -> 1,845', description: 'Eliminating redundant signals within a 1-minute window.' },
    { name: 'Suppress', value: '1,212', delta: '-34.3%', sub: '1.1s', color: 'emerald', conf: '93% conf', input: '1,845 -> 1,212', description: 'Filtering out non-actionable maintenance/log noise.' },
    { name: 'Correlate', value: '458', delta: '-62.2%', sub: '3.2s', color: 'purple', conf: '91% conf', input: '1,212 -> 458', description: 'Temporal and topological relationship clustering.' },
    { name: 'Rca', value: '118', delta: '-74.2%', sub: '4.5s', color: 'orange', conf: '87% conf', input: '458 -> 118', description: 'AI-driven root cause identification using failure chains.' },
    { name: 'Remediate', value: '28', delta: '-47.2%', sub: '2.1s', color: 'blue', conf: '92% conf', input: '118 -> 38', description: 'Automated remediation playbooks and script execution.' }
];

const SANKEY_DATA = {
    nodes: [
        { name: 'Ingest', fill: '#06B6D4' },          // 0
        { name: 'Deduplicate', fill: '#10B981' },     // 1
        { name: 'Suppress', fill: '#F59E0B' },        // 2
        { name: 'Correlate', fill: '#A855F7' },       // 3
        { name: 'Rca', fill: '#F97316' },             // 4
        { name: 'Remediate', fill: '#3B82F6' },       // 5
        { name: 'Dropped (Dedup)', fill: '#EF4444' }, // 6
        { name: 'Dropped (Sup)', fill: '#EF4444' },   // 7
        { name: 'Dropped (Corr)', fill: '#EF4444' },  // 8
        { name: 'Dropped (Rca)', fill: '#EF4444' }    // 9
    ],
    links: [
        { source: 0, target: 1, value: 2482 },
        { source: 1, target: 2, value: 1845 },
        { source: 1, target: 6, value: 637 },
        { source: 2, target: 3, value: 1212 },
        { source: 2, target: 7, value: 633 },
        { source: 3, target: 4, value: 458 },
        { source: 3, target: 8, value: 754 },
        { source: 4, target: 5, value: 118 },
        { source: 4, target: 9, value: 340 }
    ]
};



const STAGE_COLORS: Record<string, string> = {
    cyan: '#06B6D4',
    emerald: '#10B981',
    purple: '#A855F7',
    orange: '#F97316',
    blue: '#3B82F6'
};

const CustomSankeyNode = ({ x, y, width, height, payload }: any) => {
    return (
        <rect x={x} y={y} width={width} height={height} fill={payload.fill || '#10B981'} rx={2} stroke="#0F172A" strokeWidth={2} />
    );
};

const CustomSankeyLink = ({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload }: any) => {
    const fill = payload?.source?.fill || '#3B82F6';
    return (
        <path
            d={`
                M${sourceX},${sourceY}
                C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
            `}
            stroke={fill}
            strokeWidth={Math.max(1, linkWidth)}
            fill="none"
            strokeOpacity={0.4}
            className="hover:stroke-opacity-70 transition-opacity duration-300"
        />
    );
};

export default function KpiDashboard() {
    const [selectedStage, setSelectedStage] = useState<any>(null);
    const [timeFilter, setTimeFilter] = useState('Last 24 Hours');
    const [selectedTrend, setSelectedTrend] = useState<any>(null);

    const kpiStats = useMemo(() => {
        let multi = 1;
        if (timeFilter === 'Last 3 Hours') multi = 0.92;
        else if (timeFilter === 'Last Week') multi = 1.05;
        else if (timeFilter === '1 Month') multi = 1.08;
        else if (timeFilter === '6 Months') multi = 1.12;

        return BASE_KPI_STATS.map(kpi => ({
            ...kpi,
            value: Math.min(99, Math.round(kpi.value * multi))
        }));
    }, [timeFilter]);

    const trendData = useMemo(() => {
        let length = 24;
        let scale = 1;

        if (timeFilter === 'Last 3 Hours') { length = 12; scale = 0.2; }
        else if (timeFilter === 'Last 24 Hours') { length = 24; scale = 1; }
        else if (timeFilter === 'Last Week') { length = 7; scale = 4.5; }
        else if (timeFilter === '1 Month') { length = 30; scale = 15; }
        else if (timeFilter === '6 Months') { length = 6; scale = 90; }

        return Array.from({ length }, (_, i) => {
            let timeLabel = `${i}:00`;
            if (timeFilter === 'Last 3 Hours') {
                const d = new Date();
                d.setMinutes(d.getMinutes() - ((12 - i) * 15));
                timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (timeFilter === 'Last Week') {
                const d = new Date();
                d.setDate(d.getDate() - (7 - i));
                timeLabel = d.toLocaleDateString([], { weekday: 'short' });
            } else if (timeFilter === '1 Month') {
                timeLabel = `${i + 1}d`;
            } else if (timeFilter === '6 Months') {
                const d = new Date();
                d.setMonth(d.getMonth() - (6 - i));
                timeLabel = d.toLocaleDateString([], { month: 'short' });
            }

            return {
                time: timeLabel,
                raw: Math.round((1800 + Math.random() * 600) * scale),
                deduped: Math.round((1200 + Math.random() * 400) * scale),
                suppressed: Math.round((800 + Math.random() * 200) * scale),
                actionable: Math.round((100 + Math.random() * 50) * scale),
            };
        });
    }, [timeFilter]);
    const kpiTrendHistory = useMemo(() => {
        if (!selectedTrend) return [];
        return Array.from({ length: 12 }, (_, i) => ({
            period: `T-${12 - i}`,
            value: Math.round((selectedTrend.value - 15) + (Math.random() * 25))
        }));
    }, [selectedTrend]);

    return (
        <MainLayout>
            <div className="p-6 space-y-8 bg-slate-50 dark:bg-[#0B0F19] min-h-screen text-slate-700 dark:text-slate-200 font-['Sora',sans-serif] relative">

                {/* HEADER */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#3B82F6]/10 rounded-lg border border-[#3B82F6]/20">
                                <Activity className="h-6 w-6 text-[#3B82F6]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white ">ROI/KPI Dashboard</h1>
                            </div>
                        </div>

                        {/* TIME FILTER */}
                        <div className="flex items-center bg-white dark:bg-[#111827]/50 rounded-lg border border-slate-200 dark:border-white/5 p-1">
                            {['Last 3 Hours', 'Last 24 Hours', 'Last Week', '1 Month', '6 Months'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setTimeFilter(filter)}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                        timeFilter === filter
                                            ? "bg-[#06B6D4] text-white shadow-sm"
                                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 1. TOP KPI BAND */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kpiStats.map((kpi, idx) => (
                        <Card
                            key={idx}
                            className="bg-white dark:bg-[#111827]/50 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:border-white/10 transition-all group overflow-hidden relative cursor-pointer"
                            onClick={() => setSelectedTrend(kpi)}
                        >
                            <CardContent className="p-5 flex flex-col h-full items-center justify-between min-h-[180px]">
                                {/* Top Header */}
                                <div className="w-full flex justify-between items-start mb-2">
                                    <div className="flex flex-col items-start gap-1.5">
                                        <span className="text-[10px] font-black text-slate-500 tracking-widest leading-none">{kpi.label}</span>
                                    </div>
                                </div>

                                {/* Graphic Center */}
                                <div className="flex-1 flex items-center justify-center my-2">
                                    <CircularProgress value={kpi.value} color={kpi.color} />
                                </div>

                                {/* Bottom Trend */}
                                <div className="w-full text-center mt-2 group/trend">
                                    <span className="text-[#10B981] text-[10px] font-black tracking-wide flex items-center justify-center gap-1 group-hover/trend:scale-105 transition-transform">
                                        <ArrowUpRight className="h-3 w-3" />
                                        {kpi.trend}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 2. EVENT PROCESSING PIPELINE */}
                <Card className="bg-white dark:bg-[#111827]/50 border-slate-200 dark:border-white/5 overflow-hidden">
                    <CardHeader className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#06B6D4] animate-pulse" />
                                <CardTitle className="text-[11px] font-black tracking-[0.2em] text-slate-900 dark:text-white">Event Processing Pipeline</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 overflow-x-auto">
                        <div className="flex items-center gap-3 min-w-[1200px]">
                            {PIPELINE_STAGES.map((stage, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="flex-1 min-w-[140px] group cursor-pointer" onClick={() => setSelectedStage(stage)}>
                                        <div className={cn(
                                            "p-4 rounded-xl bg-slate-50 dark:bg-[#0F172A] border transition-all duration-300 relative overflow-hidden",
                                            "border-slate-200 dark:border-white/5 hover:border-white/40 hover:-translate-y-1 shadow-lg active:scale-95"
                                        )}>
                                            {/* Glow Effect */}
                                            <div className="absolute top-0 right-0 w-12 h-12 -mr-6 -mt-6 rounded-full opacity-10 blur-xl transition-all group-hover:opacity-30" style={{ backgroundColor: STAGE_COLORS[stage.color] }} />

                                            <div className="space-y-3 relative z-10">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider">{stage.name}</p>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white" style={{ color: STAGE_COLORS[stage.color] }}>{stage.value}</span>
                                                    {stage.input && <span className="text-[8px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{stage.input}</span>}
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className={cn(
                                                            "text-[10px] font-black flex items-center gap-0.5",
                                                            stage.delta.startsWith('-') ? "text-[#10B981]" : "text-[#F97316]"
                                                        )}>
                                                            {stage.delta.startsWith('-') ? <ArrowDownRight className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
                                                            {stage.delta.replace('-', '').replace('+', '')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {idx < PIPELINE_STAGES.length - 1 && (
                                        <div className="flex-shrink-0">
                                            <ChevronRight className="h-5 w-5 text-slate-700" />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 2.5 AUTO-REMEDIATION PERFORMANCE */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
                        <h3 className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase">Auto-Remediation Performance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Block 1: Overview */}
                        <Card className="bg-[#0F172A] border-white/5 py-4">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Zap className="h-4 w-4 text-[#06B6D4]" />
                                            <span className="text-xs">Total Attempts</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">38</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                                            <span className="text-xs">Success Rate</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">74%</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <XCircle className="h-4 w-4 text-[#EF4444]" />
                                            <span className="text-xs">Failed</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">10</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="h-4 w-4 text-[#F59E0B]" />
                                            <span className="text-xs">MTTR Saved</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">63%</div>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-slate-400">Overall Success</span>
                                        <span className="text-[#10B981] font-bold">74%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#10B981] rounded-full" style={{ width: '74%' }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Block 2: Top Automated Fixes */}
                        <Card className="bg-[#0F172A] border-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-white">Top Automated Fixes</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-4 space-y-5">
                                {[
                                    { label: 'Auto-restart hung services', value: 90, color: 'bg-[#10B981]' },
                                    { label: 'DNS cache flush', value: 70, color: 'bg-[#10B981]' },
                                    { label: 'Certificate rotation', value: 50, color: 'bg-[#06B6D4]' },
                                    { label: 'Load balancer drain', value: 35, color: 'bg-[#F59E0B]' },
                                    { label: 'Memory limit adjustment', value: 20, color: 'bg-[#F59E0B]' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className="w-32 flex-shrink-0 text-right">
                                            <span className="text-xs text-slate-400">{item.label}</span>
                                        </div>
                                        <div className="flex-1 flex items-center gap-3">
                                            <div className="h-3 w-full bg-slate-800 rounded-sm">
                                                <div className={`h-full rounded-sm ${item.color}`} style={{ width: `${item.value}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-300 w-8">{item.value}%</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Block 3: Failures Requiring Manual Intervention */}
                        <Card className="bg-[#0F172A] border-white/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-white">Failures Requiring Manual Intervention</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 pt-4 space-y-3">
                                {[
                                    { title: 'DB failover timeout', count: 312, badge: 'CRITICAL', badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20' },
                                    { title: 'Config rollback conflict', count: 246, badge: 'HIGH', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                                    { title: 'Network partition recovery', count: 240, badge: 'HIGH', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                            <p className="text-[10px] text-slate-500 mt-1">{item.count} occurrences</p>
                                        </div>
                                        <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>{item.badge}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 3. TREND CHART */}
                <Card className="bg-white dark:bg-[#111827]/50 border-slate-200 dark:border-white/5 h-[450px]">
                    <CardHeader className="border-b border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] py-4">
                        <CardTitle className="text-[11px] font-black tracking-[0.2em] text-slate-900 dark:text-white">Event Volume Trend ({timeFilter})</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientRaw" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradientDeduped" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis
                                    dataKey="time"
                                    stroke="#cbd5e1"
                                    fontSize="10"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#f8fafc', fontWeight: 'bold' }}
                                />
                                <YAxis
                                    stroke="#cbd5e1"
                                    fontSize="10"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => Math.floor(val).toString()}
                                    tick={{ fill: '#f8fafc', fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                                    }}
                                    itemStyle={{ padding: '2px 0' }}
                                    formatter={(value: number) => Math.round(value)}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{
                                        paddingTop: '30px',
                                        fontSize: '10px',
                                        fontWeight: 'black',
                                        textTransform: '',
                                        letterSpacing: '0.1em'
                                    }}
                                />
                                <Area type="monotone" dataKey="raw" name="Raw Events" stroke="#06B6D4" fill="url(#gradientRaw)" strokeWidth={3} />
                                <Area type="monotone" dataKey="deduped" name="Deduped" stroke="#10B981" fill="url(#gradientDeduped)" strokeWidth={2} />
                                <Area type="monotone" dataKey="suppressed" name="Suppressed" stroke="#A855F7" fill="transparent" strokeWidth={2} />
                                <Area type="monotone" dataKey="actionable" name="Actionable" stroke="#F97316" fill="transparent" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* --- TREND ANALYSIS MODAL --- */}
                {selectedTrend && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                            onClick={() => setSelectedTrend(null)}
                        />
                        <Card className="relative w-full max-w-2xl bg-[#0F172A] border-white/10 shadow-3xl animate-in zoom-in-95 duration-300 overflow-hidden font-['Sora',sans-serif]">
                            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: selectedTrend.color }} />
                            <CardHeader className="flex flex-row items-center justify-between py-6 bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/5">
                                        <TrendingUp className="h-5 w-5" style={{ color: selectedTrend.color }} />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black tracking-tight text-white">{selectedTrend.label} Trend</CardTitle>
                                        <CardDescription className="text-slate-400">Historical performance mapping from the past {timeFilter}</CardDescription>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    onClick={() => setSelectedTrend(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 tracking-widest mb-1Uppercase">Current Value</p>
                                        <p className="text-3xl font-black text-white">{selectedTrend.value}%</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 tracking-widest mb-1 uppercase">Reliability</p>
                                        <p className="text-3xl font-black text-[#10B981]">99.4%</p>
                                    </div>
                                </div>

                                <div className="h-[250px] w-full bg-black/20 rounded-xl p-4 border border-white/5">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={kpiTrendHistory}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                            <XAxis
                                                dataKey="period"
                                                stroke="#cbd5e1"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#cbd5e1"
                                                fontSize={10}
                                                tickLine={false}
                                                axisLine={false}
                                                domain={['dataMin - 5', 'dataMax + 5']}
                                                tickFormatter={(val) => Math.round(val).toString()}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                                formatter={(value: number) => Math.round(value)}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke={selectedTrend.color}
                                                strokeWidth={4}
                                                dot={{ fill: selectedTrend.color, r: 4 }}
                                                activeDot={{ r: 6, strokeWidth: 0 }}
                                            >
                                                <LabelList dataKey="value" position="top" offset={12} fill="#f8fafc" fontSize={10} fontWeight="black" />
                                            </Line>
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- PIPELINE NODE MODAL --- */}
                {selectedStage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={() => setSelectedStage(null)}
                        />

                        {/* Modal Content - Constrained and Scrollable */}
                        <Card className="relative w-full max-w-3xl max-h-[90vh] bg-slate-50 dark:bg-[#0F172A] border-slate-300 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col font-['Sora',sans-serif]">
                            <div className="absolute top-0 left-0 w-full h-1 shrink-0" style={{ backgroundColor: STAGE_COLORS[selectedStage.color] }} />

                            <CardHeader className="flex flex-row items-center justify-between py-6 shrink-0 bg-slate-100/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-black  tracking-tight text-slate-900 dark:text-white ">{selectedStage.name === 'Rca' ? 'RCA' : selectedStage.name} Analysis</CardTitle>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-white/10 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors"
                                    onClick={() => setSelectedStage(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
                                <CardContent className="p-0">
                                    {selectedStage.name === 'Deduplicate' ? (
                                        <div className="space-y-8">
                                            {/* DEDUP STATS */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Processed Events</p>
                                                    <p className="text-2xl font-black text-[#06B6D4]">{selectedStage.value}</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Reduction</p>
                                                    <p className="text-2xl font-black text-[#10B981]">{selectedStage.delta.replace('-', '')}</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">METHODS</p>
                                                    <p className="text-2xl font-black text-[#A855F7]">4</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Method Distribution Chart */}
                                                <div className="space-y-4">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Method Distribution</p>
                                                    <div className="h-[280px] w-full flex items-center justify-center relative">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={[
                                                                        { name: 'Hash-based', value: 45, color: '#06B6D4' },
                                                                        { name: 'Signature', value: 28, color: '#10B981' },
                                                                        { name: 'Sliding Window', value: 15, color: '#A855F7' },
                                                                        { name: 'Flap Detection', value: 12, color: '#F97316' }
                                                                    ]}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={60}
                                                                    outerRadius={100}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                    stroke="none"
                                                                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                                    labelLine={false}
                                                                >
                                                                    {['#06B6D4', '#10B981', '#A855F7', '#F97316'].map((color, index) => (
                                                                        <Cell key={`cell-${index}`} fill={color} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }}
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        {/* Labels */}
                                                        <div className="absolute left-0 bottom-0 space-y-2">
                                                            {[
                                                                { name: 'Hash-based', val: '45%', color: '#06B6D4' },
                                                                { name: 'Signature', val: '28%', color: '#10B981' },
                                                                { name: 'Sliding Window', val: '15%', color: '#A855F7' },
                                                                { name: 'Flap Detection', val: '12%', color: '#F97316' }
                                                            ].map((item) => (
                                                                <div key={item.name} className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 w-24">{item.name}</span>
                                                                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{item.val}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Top Noisy Devices */}
                                                <div className="space-y-6">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Top Noisy Devices</p>
                                                    <div className="space-y-4">
                                                        {[
                                                            { name: 'edge-rt-03', val: '85%' },
                                                            { name: 'core-sw-01', val: '88.7%' },
                                                            { name: 'fw-ext-02', val: '86.9%' },
                                                            { name: 'lb-prod-01', val: '84.3%' },
                                                            { name: 'dns-01', val: '90.4%' }
                                                        ].map((device) => (
                                                            <div key={device.name} className="space-y-1.5">
                                                                <div className="flex justify-between items-center px-1">
                                                                    <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 font-mono tracking-tight ">{device.name}</span>
                                                                    <span className="text-[11px] font-black text-[#10B981]">{device.val}</span>
                                                                </div>
                                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                                                                    <div
                                                                        className="h-full bg-cyan-500/80 rounded-full"
                                                                        style={{ width: device.val }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedStage.name === 'Suppress' ? (
                                        <div className="space-y-8">
                                            {/* SUPPRESS STATS */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">TOTAL SUPPRESSED</p>
                                                    <p className="text-2xl font-black text-[#F97316]">313.9K</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">SUPPRESSION RATE</p>
                                                    <p className="text-2xl font-black text-[#10B981]">76.1%</p>
                                                </div>
                                            </div>

                                            {/* SUPPRESS Chart */}
                                            <div className="space-y-6">
                                                <div className="h-[250px] w-full bg-[#111827]/30 rounded-xl p-6 border border-slate-200 dark:border-white/5">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            layout="vertical"
                                                            data={[
                                                                { name: 'Policy-Based', value: 124000, color: '#06B6D4', pct: '39.6%' },
                                                                { name: 'Topology-Based', value: 89000, color: '#10B981', pct: '28.4%' },
                                                                { name: 'Noise Reduction', value: 52000, color: '#A855F7', pct: '16.8%' },
                                                                { name: 'Threshold-Based', value: 31000, color: '#F97316', pct: '10%' },
                                                                { name: 'Pattern-Based', value: 16000, color: '#3B82F6', pct: '5.1%' }
                                                            ]}
                                                            margin={{ left: 40, right: 40 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.05} />
                                                            <XAxis type="number" hide />
                                                            <YAxis dataKey="name" type="category" fontSize={10} width={100} tick={{ fill: '#64748B', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                            <Tooltip
                                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}
                                                            />
                                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                                                {['#06B6D4', '#10B981', '#A855F7', '#F97316', '#3B82F6'].map((color, index) => (
                                                                    <Cell key={`cell-${index}`} fill={color} />
                                                                ))}
                                                                <LabelList dataKey="pct" position="right" offset={10} fill="#f8fafc" fontSize={10} fontWeight="black" />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* Legend Bottom */}
                                                <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
                                                    {[
                                                        { name: 'Policy-Based', val: '39.6%', color: '#06B6D4' },
                                                        { name: 'Topology-Based', val: '28.4%', color: '#10B981' },
                                                        { name: 'Noise Reduction', val: '16.8%', color: '#A855F7' },
                                                        { name: 'Threshold-Based', val: '10%', color: '#F97316' },
                                                        { name: 'Pattern-Based', val: '5.1%', color: '#3B82F6' }
                                                    ].map((item) => (
                                                        <div key={item.name} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400">{item.name}</span>
                                                            </div>
                                                            <span className="text-[11px] font-black text-slate-900 dark:text-white">{item.val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedStage.name === 'Correlate' ? (
                                        <div className="space-y-8">
                                            {/* CORRELATE STATS */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Total Correlation</p>
                                                    <p className="text-2xl font-black text-[#A855F7]">{selectedStage.value}</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">AVG. CLUSTER SIZE</p>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white">4.2</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Clustering Conf.</p>
                                                    <p className="text-2xl font-black text-[#10B981]">{selectedStage.conf}</p>
                                                </div>
                                            </div>

                                            {/* Correlation Engine Distribution */}
                                            <div className="space-y-6">
                                                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Correlation Strategy Distribution</p>
                                                <div className="h-[300px] w-full bg-[#111827]/30 rounded-xl p-6 border border-slate-200 dark:border-white/5">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            layout="vertical"
                                                            data={[
                                                                { name: 'Causal Analysis', value: 12400, color: '#06B6D4' },
                                                                { name: 'Temporal Pattern', value: 8900, color: '#10B981' },
                                                                { name: 'Topological Logic', value: 7200, color: '#A855F7' },
                                                                { name: 'LLM Insights', value: 5800, color: '#F97316' },
                                                                { name: 'Dynamic Rules', value: 4500, color: '#3B82F6' },
                                                                { name: 'Static Rules', value: 4000, color: '#6366F1' }
                                                            ]}
                                                            margin={{ left: 60, right: 40 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.05} />
                                                            <XAxis type="number" hide />
                                                            <YAxis dataKey="name" type="category" fontSize={10} width={120} tick={{ fill: '#64748B', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                            <Tooltip
                                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}
                                                            />
                                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                                                {['#06B6D4', '#10B981', '#A855F7', '#F97316', '#3B82F6', '#6366F1'].map((color, index) => (
                                                                    <Cell key={`cell-${index}`} fill={color} />
                                                                ))}
                                                                <LabelList dataKey="value" position="right" offset={10} fill="#f8fafc" fontSize={10} fontWeight="black" />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* Strategy Footer */}
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-white/5">
                                                    {[
                                                        { name: 'Causal', pct: '28%', color: '#06B6D4' },
                                                        { name: 'Temporal', pct: '21%', color: '#10B981' },
                                                        { name: 'Topological', pct: '17%', color: '#A855F7' },
                                                        { name: 'LLM-Based', pct: '14%', color: '#F97316' },
                                                        { name: 'Dynamic', pct: '11%', color: '#3B82F6' },
                                                        { name: 'Static', pct: '9%', color: '#6366F1' }
                                                    ].map((item) => (
                                                        <div key={item.name} className="flex items-center justify-between p-2 bg-slate-100/50 dark:bg-white/[0.02] rounded-lg border border-slate-200 dark:border-white/5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 ">{item.name}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-slate-900 dark:text-white">{item.pct}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedStage.name === 'Ingest' ? (
                                        <div className="space-y-8">
                                            {/* Analysis Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Node Throughput</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">{selectedStage.value} events/min</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Average Latency</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">{selectedStage.sub}</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Node Confidence</p>
                                                    <p className="text-xl font-black text-emerald-500">{selectedStage.conf || '100% conf'}</p>
                                                </div>
                                            </div>

                                            {/* Multivariate Chart */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="h-4 w-4 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Severity Ingestion Performance (Multivariate)</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#EF4444]" /><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 ">Critical</span></div>
                                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F59E0B]" /><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 ">Major</span></div>
                                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]" /><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 ">Minor</span></div>
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] py-0">STABLE</Badge>
                                                    </div>
                                                </div>
                                                <div className="h-[280px] w-full bg-[#111827]/30 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={trendData.slice(0, 12)}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                                            <XAxis dataKey="time" fontSize="9" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} />
                                                            <YAxis fontSize="9" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                                                            />
                                                            <Line type="monotone" dataKey="raw" stroke="#EF4444" strokeWidth={3} dot={false} name="Critical" />
                                                            <Line type="monotone" dataKey="deduped" stroke="#F59E0B" strokeWidth={2.5} dot={false} name="Major" />
                                                            <Line type="monotone" dataKey="suppressed" stroke="#3B82F6" strokeWidth={2} dot={false} name="Minor" />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedStage.name === 'Normalize' ? (
                                        <div className="space-y-8">
                                            {/* NORMALIZE STATS */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">MAPPING ACCURACY</p>
                                                    <p className="text-2xl font-black text-[#10B981]">99.8%</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">SCHEMAS APPLIED</p>
                                                    <p className="text-2xl font-black text-[#3B82F6]">42</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">TRANSFORM TIME</p>
                                                    <p className="text-2xl font-black text-[#A855F7]">0.8ms</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Protocol Distribution */}
                                                <div className="space-y-6">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Inbound Protocol Distribution</p>
                                                    <div className="space-y-4">
                                                        {[
                                                            { name: 'JSON / Webhook', val: '42%', color: '#06B6D4' },
                                                            { name: 'Syslog (RFC5424)', val: '28%', color: '#10B981' },
                                                            { name: 'SNMP Traps', val: '18%', color: '#F97316' },
                                                            { name: 'Netflow / IPFIX', val: '12%', color: '#3B82F6' }
                                                        ].map((proto) => (
                                                            <div key={proto.name} className="space-y-1.5">
                                                                <div className="flex justify-between items-center px-1">
                                                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 ">{proto.name}</span>
                                                                    <span className="text-[11px] font-black text-slate-900 dark:text-white">{proto.val}</span>
                                                                </div>
                                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full rounded-full transition-all duration-1000"
                                                                        style={{ width: proto.val, backgroundColor: proto.color }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Standardization Trend */}
                                                <div className="space-y-4">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Standardization Accuracy Trend</p>
                                                    <div className="h-[200px] w-full bg-[#111827]/30 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={trendData.slice(0, 12)}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                                                <XAxis dataKey="time" hide />
                                                                <YAxis hide domain={[95, 100]} />
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', fontSize: '10px' }}
                                                                />
                                                                <Area
                                                                    type="stepAfter"
                                                                    dataKey="raw"
                                                                    stroke="#10B981"
                                                                    fill="#10B981"
                                                                    fillOpacity={0.1}
                                                                    strokeWidth={2}
                                                                    name="Accuracy %"
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                        <p className="text-[10px] font-bold text-emerald-500/80 ">All inbound telemetry compliant with OCSF v1.1 Schema</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedStage.name === 'Rca' ? (
                                        <div className="space-y-8">
                                            {/* RCA STATS */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Incidents Analyzed</p>
                                                    <p className="text-2xl font-black text-[#F97316]">{selectedStage.value}</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Mean Time to RCA</p>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedStage.sub}</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Identification Accuracy</p>
                                                    <p className="text-2xl font-black text-[#10B981]">{selectedStage.conf}</p>
                                                </div>
                                            </div>                                    {/* Failure Origin Distribution */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div className="space-y-6">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Incident Root Cause Distribution</p>
                                                    <div className="h-[300px] w-full bg-[#111827]/30 rounded-xl p-6 border border-slate-200 dark:border-white/5">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart
                                                                layout="vertical"
                                                                data={[
                                                                    { name: 'Networking Logic', value: 420, color: '#06B6D4' },
                                                                    { name: 'Hardware Failure', value: 310, color: '#EF4444' },
                                                                    { name: 'Configuration Drift', value: 280, color: '#F59E0B' },
                                                                    { name: 'Software Bug', value: 190, color: '#A855F7' },
                                                                    { name: 'External Resource', value: 140, color: '#3B82F6' },
                                                                    { name: 'Traffic Overload', value: 112, color: '#6366F1' }
                                                                ]}
                                                                margin={{ left: 60, right: 40 }}
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.05} />
                                                                <XAxis type="number" hide />
                                                                <YAxis dataKey="name" type="category" fontSize={10} width={120} tick={{ fill: '#64748B', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                                                <Tooltip
                                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px' }}
                                                                />
                                                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                                                                    {['#06B6D4', '#EF4444', '#F59E0B', '#A855F7', '#3B82F6', '#6366F1'].map((color, index) => (
                                                                        <Cell key={`cell-${index}`} fill={color} />
                                                                    ))}
                                                                </Bar>
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Temporal Remediation Efficiency (7D)</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" /><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-widest">RCA</span></div>
                                                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" /><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-widest">REMED</span></div>
                                                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /><span className="text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-widest">AUTO</span></div>
                                                        </div>
                                                    </div>
                                                    <div className="h-[300px] w-full bg-[#111827]/30 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart
                                                                data={[
                                                                    { day: 'Mon', found: 140, remed: 120, auto: 95 },
                                                                    { day: 'Tue', found: 165, remed: 150, auto: 110 },
                                                                    { day: 'Wed', found: 120, remed: 105, auto: 82 },
                                                                    { day: 'Thu', found: 190, remed: 175, auto: 145 },
                                                                    { day: 'Fri', found: 210, remed: 195, auto: 160 },
                                                                    { day: 'Sat', found: 95, remed: 88, auto: 72 },
                                                                    { day: 'Sun', found: 82, remed: 75, auto: 65 }
                                                                ]}
                                                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                                                <XAxis
                                                                    dataKey="day"
                                                                    fontSize={10}
                                                                    tick={{ fill: '#64748B', fontWeight: 'bold' }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                />
                                                                <YAxis
                                                                    fontSize={10}
                                                                    tick={{ fill: '#64748B', fontWeight: 'bold' }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                />
                                                                <Tooltip
                                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }}
                                                                />
                                                                <Bar dataKey="found" name="RCA Found" fill="#F97316" radius={[2, 2, 0, 0]} barSize={12} />
                                                                <Bar dataKey="remed" name="Remediated" fill="#3B82F6" radius={[2, 2, 0, 0]} barSize={12} />
                                                                <Bar dataKey="auto" name="Auto-Remediated" fill="#10B981" radius={[2, 2, 0, 0]} barSize={12} />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedStage.name === 'Impact' ? (
                                        <div className="space-y-8">
                                            {/* IMPACT STATS */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Devices Affected</p>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white">124</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Services Impacted</p>
                                                    <p className="text-2xl font-black text-[#F59E0B]">12</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">MTTI (Impact Detect)</p>
                                                    <p className="text-2xl font-black text-[#A855F7]">1.2s</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Affected Devices Trend */}
                                                <div className="space-y-6">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Temporal Device Exposure ({timeFilter})</p>
                                                    <div className="h-[280px] w-full bg-[#111827]/30 rounded-xl p-6 border border-slate-200 dark:border-white/5">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={trendData.slice(0, 12)}>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                                                <XAxis dataKey="time" fontSize="9" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} />
                                                                <YAxis fontSize="9" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} />
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="actionable"
                                                                    name="Impacted Devices"
                                                                    stroke="#F97316"
                                                                    fill="#F97316"
                                                                    fillOpacity={0.1}
                                                                    strokeWidth={3}
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Service Impact Breakdown */}
                                                <div className="space-y-6">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Service Disruption Profile</p>
                                                    <div className="space-y-4">
                                                        {[
                                                            { name: 'Critical (Core Routing)', val: '85%', color: '#EF4444' },
                                                            { name: 'Business-Essential (Storage)', val: '42%', color: '#F59E0B' },
                                                            { name: 'Standard (Dev/Test)', val: '12%', color: '#3B82F6' },
                                                            { name: 'External API Gateway', val: '8%', color: '#A855F7' }
                                                        ].map((service) => (
                                                            <div key={service.name} className="space-y-1.5">
                                                                <div className="flex justify-between items-center px-1">
                                                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight">{service.name}</span>
                                                                    <span className="text-[10px] font-black text-slate-900 dark:text-white">{service.val} exposure</span>
                                                                </div>
                                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                                                                    <div
                                                                        className="h-full rounded-full"
                                                                        style={{ width: service.val, backgroundColor: service.color }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                                            <span className="text-[10px] font-black text-orange-500 tracking-widest">Blast Radius Warning</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                                            Current failure chain indicates potential impact to secondary distribution layer in the next 15 minutes if unmitigated.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedStage.name === 'Remediate' ? (
                                        <div className="space-y-8">
                                            {/* REMEDIATE STATS */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Total Remediations</p>
                                                    <p className="text-2xl font-black text-[#A855F7]">2,842</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">Success Rate</p>
                                                    <p className="text-2xl font-black text-[#10B981]">94.2%</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-5 rounded-xl border border-slate-200 dark:border-white/5 text-center">
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">MTTR (Auto)</p>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white">2.1s</p>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Remediation Delivery Profile ({timeFilter})</p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 align-middle">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest">Manual Resolution</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 align-middle">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest">Autonomous Playbook</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="h-[320px] w-full bg-[#111827]/30 rounded-xl p-6 border border-slate-200 dark:border-white/5">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={timeFilter === 'Last Week' ? [
                                                                { day: 'Mon', manual: 42, auto: 124 },
                                                                { day: 'Tue', manual: 38, auto: 135 },
                                                                { day: 'Wed', manual: 45, auto: 118 },
                                                                { day: 'Thu', manual: 52, auto: 156 },
                                                                { day: 'Fri', manual: 48, auto: 142 },
                                                                { day: 'Sat', manual: 24, auto: 84 },
                                                                { day: 'Sun', manual: 20, auto: 76 }
                                                            ] : [
                                                                { time: '00:00', manual: 12, auto: 45 },
                                                                { time: '04:00', manual: 15, auto: 52 },
                                                                { time: '08:00', manual: 18, auto: 64 },
                                                                { time: '12:00', manual: 22, auto: 82 },
                                                                { time: '16:00', manual: 25, auto: 94 },
                                                                { time: '20:00', manual: 20, auto: 76 }
                                                            ]}
                                                            margin={{ top: 20, right: 20, left: -20, bottom: 0 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                                            <XAxis
                                                                dataKey={timeFilter.includes('Hours') || timeFilter.includes('Hour') ? 'time' : 'day'}
                                                                fontSize={11}
                                                                tick={{ fill: '#64748B', fontWeight: 'bold' }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                            />
                                                            <YAxis
                                                                fontSize={11}
                                                                tick={{ fill: '#64748B', fontWeight: 'bold' }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                            />
                                                            <Tooltip
                                                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                                                            />
                                                            <Bar dataKey="manual" name="Manual Resolution" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={25} />
                                                            <Bar dataKey="auto" name="Autonomous Playbook" fill="#10B981" radius={[4, 4, 0, 0]} barSize={25} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {/* Analysis Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-[#1E293B]/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">NODE THROUGHPUT</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">{selectedStage.value} events/min</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">AVG LATENCY</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">{selectedStage.sub}</p>
                                                </div>
                                                <div className="bg-[#1E293B]/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1">NODE CONFIDENCE</p>
                                                    <p className="text-xl font-black text-emerald-500">{selectedStage.conf || '100% conf'}</p>
                                                </div>
                                            </div>

                                            {/* Detailed Chart */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <BarChart3 className="h-4 w-4 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 dark:text-slate-400 tracking-widest">Temporal Node Performance (60m Window)</span>
                                                    </div>
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] py-0">STABLE</Badge>
                                                </div>
                                                <div className="h-[250px] w-full bg-[#111827]/30 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={trendData.slice(0, 12)}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                                            <XAxis dataKey="time" fontSize="9" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} />
                                                            <YAxis fontSize="9" axisLine={false} tickLine={false} tick={{ fill: '#475569' }} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="raw"
                                                                stroke={STAGE_COLORS[selectedStage.color]}
                                                                fill={STAGE_COLORS[selectedStage.color]}
                                                                fillOpacity={0.15}
                                                                strokeWidth={3}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
