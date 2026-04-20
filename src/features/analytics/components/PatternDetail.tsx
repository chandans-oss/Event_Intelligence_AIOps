import {
    X,
    TrendingUp,
    BrainCircuit,
    CheckCircle2,
    Clock,
    Cpu,
    Database,
    FlaskConical,
    Grid,
    LayoutList,
    List,
    Network,
    Search,
    Server,
    Zap,
    AlertTriangle,
    ShieldCheck,
    Workflow,
    Calculator,
    Binary,
    ArrowLeft,
    ArrowRight,
    Activity,
    PlayCircle,
    Calendar,
    Terminal as TerminalIcon,
    BarChart3 as BarChart3Icon,
    Plus,
    ChevronDown
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/shared/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from '@/shared/components/ui/tabs';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    ReferenceLine
} from 'recharts';
import { Pattern, PatternOccurrence, EvidenceItem } from '@/features/analytics/data/patternData';
import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatMetricLabel as formatLabel } from '@/shared/lib/utils';

// Local formatLabel removed, using centralized formatMetricLabel via import

// --- Module-level store: persists custom occurrences across re-mounts ---
const _patternCustomOccurrences: Record<string, PatternOccurrence[]> = {};

function generateMockEventsForType(simType: string, occId: string, occTimestamp: string): EvidenceItem[] {
    const offset = (ms: number) => {
        const base = new Date(occTimestamp);
        return new Date(isNaN(base.getTime()) ? Date.now() - ms : base.getTime() - ms).toISOString();
    };
    const map: Record<string, EvidenceItem[]> = {
        congestion: [
            { id: `${occId}-E1`, timestamp: offset(600000), title: 'High Utilization', subtitle: 'Traffic burst detected', severity: 'Warning', nodeName: 'Core-Router-01', nodeIp: '10.0.1.1', resource: 'Gi1/0/1', alertValue: '87%', threshold: '> 80%' },
            { id: `${occId}-E2`, timestamp: offset(300000), title: 'Buffer Overflow', subtitle: 'Output queue drops', severity: 'Major', nodeName: 'Core-Router-01', nodeIp: '10.0.1.1', resource: 'Gi1/0/1', alertValue: '1280', threshold: '> 1000' },
            { id: `${occId}-E3`, timestamp: offset(0), title: 'Interface Flap', subtitle: 'Interface state changed to Down', severity: 'Critical', nodeName: 'Core-Router-01', nodeIp: '10.0.1.1', resource: 'Gi1/0/1', alertValue: 'Down', threshold: 'State' },
        ],
        cpu_spike: [
            { id: `${occId}-E1`, timestamp: offset(600000), title: 'CPU Spike', subtitle: 'Sustained high CPU utilization', severity: 'Warning', nodeName: 'Core-Router-02', nodeIp: '10.10.10.2', resource: 'CPU', alertValue: '88%', threshold: '> 80%' },
            { id: `${occId}-E2`, timestamp: offset(180000), title: 'BGP Keep-alive Missed', subtitle: 'Control plane degraded', severity: 'Major', nodeName: 'Core-Router-02', nodeIp: '10.10.10.2', resource: 'bgp-100', alertValue: 'Timeout', threshold: '> 60s' },
            { id: `${occId}-E3`, timestamp: offset(0), title: 'BGP Session Down', subtitle: 'Neighbor keepalive timeout', severity: 'Critical', nodeName: 'Core-Router-02', nodeIp: '10.10.10.2', resource: 'bgp-100', alertValue: 'Down', threshold: 'State != Established' },
        ],
        device_cpu_saturation: [
            { id: `${occId}-E1`, timestamp: offset(600000), title: 'CPU Warning', subtitle: 'CPU exceeding threshold', severity: 'Warning', nodeName: 'Agg-Switch-01', nodeIp: '10.1.1.1', resource: 'System', alertValue: '85%', threshold: '> 80%' },
            { id: `${occId}-E2`, timestamp: offset(120000), title: 'ICMP Intermittent', subtitle: 'Ping response delays', severity: 'Major', nodeName: 'Agg-Switch-01', nodeIp: '10.1.1.1', resource: 'ICMP', alertValue: '15% loss', threshold: '> 5%' },
            { id: `${occId}-E3`, timestamp: offset(0), title: 'Device Unreachable', subtitle: 'No ping response', severity: 'Critical', nodeName: 'Agg-Switch-01', nodeIp: '10.1.1.1', resource: 'ICMP', alertValue: '100% Loss', threshold: 'Reachability' },
        ],
        link_physical_degradation: [
            { id: `${occId}-E1`, timestamp: offset(900000), title: 'CRC Errors Rise', subtitle: 'Input errors rising rapidly', severity: 'Warning', nodeName: 'PE-Router-01', nodeIp: '10.20.1.1', resource: 'xe-0/0/1', alertValue: '95 cps', threshold: '> 50 cps' },
            { id: `${occId}-E2`, timestamp: offset(300000), title: 'Frame Discards', subtitle: 'Output discards elevated', severity: 'Major', nodeName: 'PE-Router-01', nodeIp: '10.20.1.1', resource: 'xe-0/0/1', alertValue: '45', threshold: '> 10' },
            { id: `${occId}-E3`, timestamp: offset(0), title: 'Interface Flapping', subtitle: 'Link state unstable', severity: 'Major', nodeName: 'PE-Router-01', nodeIp: '10.20.1.1', resource: 'xe-0/0/1', alertValue: 'Flap', threshold: 'State Stability' },
        ],
        firewall_overload: [
            { id: `${occId}-E1`, timestamp: offset(600000), title: 'Session Table Near Capacity', subtitle: 'Connection rate spike', severity: 'Warning', nodeName: 'Edge-FW-01', nodeIp: '192.168.254.1', resource: 'DataPlane', alertValue: '72k sessions', threshold: '75k max' },
            { id: `${occId}-E2`, timestamp: offset(180000), title: 'CPU Saturation', subtitle: 'Firewall CPU overloaded', severity: 'Major', nodeName: 'Edge-FW-01', nodeIp: '192.168.254.1', resource: 'CPU1', alertValue: '96%', threshold: '> 90%' },
            { id: `${occId}-E3`, timestamp: offset(0), title: 'Packet Drop', subtitle: 'Buffer exhaustion — policy drops active', severity: 'Critical', nodeName: 'Edge-FW-01', nodeIp: '192.168.254.1', resource: 'DataPlane', alertValue: '2000 pps', threshold: '> 0 pps' },
        ],
        qoe_jitter: [
            { id: `${occId}-E1`, timestamp: offset(300000), title: 'Latency Variance Spike', subtitle: 'Jitter baseline exceeded', severity: 'Warning', nodeName: 'SDWAN-Branch-01', nodeIp: '10.50.1.1', resource: 'Tunnel-01', alertValue: '28ms', threshold: '< 30ms' },
            { id: `${occId}-E2`, timestamp: offset(0), title: 'SLA Breach', subtitle: 'Voice quality degradation detected', severity: 'Major', nodeName: 'SDWAN-Branch-01', nodeIp: '10.50.1.1', resource: 'Tunnel-01', alertValue: '38ms jitter', threshold: '< 30ms' },
        ],
    };
    return map[simType] ?? map['congestion'];
}

// --- Simulation Logic ---

const getChartConfig = (type: 'congestion' | 'cpu_spike' | 'device_cpu_saturation' | 'link_physical_degradation' | 'firewall_overload' | 'qoe_jitter') => {
    const keys = SIM_METRICS[type] || SIM_METRICS['congestion'];
    return {
        metric1: keys[0] ? { key: keys[0].key, name: keys[0].name, color: keys[0].color } : null,
        metric2: keys[1] ? { key: keys[1].key, name: keys[1].name, color: keys[1].color } : null,
        metric3: keys[2] ? { key: keys[2].key, name: keys[2].name, color: keys[2].color } : null,
    };
};

const generateSimulationData = (type: 'congestion' | 'cpu_spike' | 'device_cpu_saturation' | 'link_physical_degradation' | 'firewall_overload' | 'qoe_jitter') => {
    const data = [];
    const keys = SIM_METRICS[type] || SIM_METRICS['congestion'];

    for (let i = 0; i <= 20; i++) {
        let m1, m2, m3;

        // Common organic noise component (more significant)
        const organicNoise = () => (Math.random() - 0.5) * 12; // +/- 6% variance
        const drift = Math.sin(i * 0.8) * 8; // Cyclic load pattern

        if (type === 'cpu_spike') {
            const baseCPU = 25 + drift;
            const spike = i > 8 ? 60 : 0;
            m1 = Math.max(5, Math.min(100, baseCPU + spike + organicNoise()));
            m3 = i > 14 ? 0 : 1;
            m2 = i > 10 ? (i - 10) * 8 + Math.random() * 10 : 0;
        } else if (type === 'device_cpu_saturation') {
            m1 = Math.max(0, Math.min(100, 45 + drift + (i * 2.5)));
            m2 = i > 10 ? (i - 10) * 12 + organicNoise() : 0;
            m3 = i > 15 ? 0 : 1;
        } else if (type === 'link_physical_degradation') {
            m1 = i > 5 ? (i - 5) * 45 + (Math.random() * 20) : Math.random() * 5;
            m2 = i > 8 ? (i - 8) * 15 + organicNoise() : 0;
            m3 = i > 12 ? Math.floor(Math.random() * 3) : 0;
        } else if (type === 'firewall_overload') {
            m1 = 1500 + drift * 100 + (Math.pow(i, 2.7) * 40);
            m2 = Math.min(100, 30 + (i * 3.5) + organicNoise());
            m3 = i > 10 ? 10 + Math.pow(i - 10, 2) * 5 : 10;
        } else if (type === 'qoe_jitter') {
            m1 = 2 + (i * 1.5) + organicNoise() * 0.5;
            m2 = 5 + Math.pow(i, 1.2) + organicNoise();
            m3 = i > 12 ? (i - 12) * 5 : 0;
        } else {
            // Congestion
            const utilBase = 45 + drift;
            const utilRise = 45 / (1 + Math.exp(-0.8 * (i - 8)));
            m1 = Math.max(10, Math.min(100, utilBase + utilRise + organicNoise()));
            const queueBase = Math.max(0, drift * 0.5 + organicNoise());
            const queueRise = i > 8 ? (i - 8) * 5 : 0;
            m2 = Math.max(0, Math.min(100, queueBase + queueRise + organicNoise()));
            const errorBase = Math.random() > 0.9 ? 1 : 0;
            const errorRise = i > 14 ? (i - 14) * 1.5 + Math.random() : 0;
            m3 = Math.floor(Math.max(0, errorBase + errorRise));
        }

        const point: any = { time: `T+${i}m` };
        if (keys[0]) point[keys[0].key] = Math.round(m1);
        if (keys[1]) point[keys[1].key] = Math.round(m2);
        if (keys[2]) point[keys[2].key] = Math.round(m3);
        data.push(point);
    }
    return data;
};

const SIM_METRICS: Record<string, { key: string, name: string, color: string }[]> = {
    'congestion': [
        { key: 'utilization', name: 'B/W Util', color: '#3b82f6' },
        { key: 'drops', name: 'Drops', color: '#ef4444' },
        { key: 'errors', name: 'CRC Errors', color: '#f59e0b' }
    ],
    'cpu_spike': [
        { key: 'cpu', name: 'CPU Util', color: '#ef4444' },
        { key: 'bgpState', name: 'BGP State', color: '#3b82f6' }
    ],
    'device_cpu_saturation': [
        { key: 'cpuUtil', name: 'CPU Util', color: '#ef4444' },
        { key: 'pingLoss', name: 'Ping Loss', color: '#f59e0b' }
    ],
    'link_physical_degradation': [
        { key: 'inErrors', name: 'CRC Errors', color: '#f59e0b' },
        { key: 'discards', name: 'Discards', color: '#ef4444' }
    ],
    'firewall_overload': [
        { key: 'sessions', name: 'Sessions', color: '#3b82f6' },
        { key: 'fwCpu', name: 'CPU Util', color: '#ef4444' },
        { key: 'latency', name: 'Latency', color: '#f59e0b' }
    ],
    'qoe_jitter': [
        { key: 'jitter', name: 'Jitter', color: '#3b82f6' },
        { key: 'latencyVar', name: 'Latency Var', color: '#f59e0b' }
    ]
};

const MiniMetricPlot = ({ data, dataKey, color, name, occId }: { data: any[], dataKey: string, color: string, name: string, occId: string }) => {
    return (
        <div className="flex flex-col gap-2 flex-1 min-w-[140px] h-full group">
            <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold text-foreground/80 tracking-tight group-hover:text-foreground/90 transition-colors">{name}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-foreground/60">
                    {data && data.length > 0 ? (data[data.length - 1][dataKey] ?? 0) : 0}
                </span>
            </div>

            <div className="flex-1 h-20 w-full bg-background/40 border-l border-b border-white/10 relative overflow-hidden group-hover:border-white/20 transition-colors">
                {/* Technical Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }} />

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
                        <Area
                            type="linear"
                            dataKey={dataKey}
                            stroke={color}
                            fill={color}
                            fillOpacity={0.08}
                            strokeWidth={1.5}
                            dot={{ r: 1.5, fill: color, strokeWidth: 0, fillOpacity: 0.8 }}
                            activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="absolute right-1 top-1 text-[8px] font-mono text-muted-foreground/30 pointer-events-none">
                    MAX
                </div>
            </div>
        </div>
    );
};

interface PatternDetailProps {
    pattern: Pattern;
    onClose: () => void;
}

export function PatternDetail({ pattern, onClose }: PatternDetailProps) {

    const [chartData, setChartData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'simulation'>('overview');
    const [manualInputs, setManualInputs] = useState({ metric1: 0, metric2: 0, metric3: 0 });
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [dynamicPredictions, setDynamicPredictions] = useState(pattern.predictedEvents);
    const [timeFilter, setTimeFilter] = useState<'24H' | '7D' | '1M' | 'ALL'>('ALL');
    const [subTab, setSubTab] = useState<'occurrence' | 'history' | 'analysis'>('occurrence');
    const navigate = useNavigate();

    // Custom occurrences: initialized from module-level store so they persist across re-mounts
    const [customOccurrences, setCustomOccurrences] = useState<PatternOccurrence[]>(
        () => _patternCustomOccurrences[pattern.id] ?? []
    );

    // Re-hydrate custom occurrences when the selected pattern changes
    useEffect(() => {
        setCustomOccurrences(_patternCustomOccurrences[pattern.id] ?? []);
    }, [pattern.id]);

    // Persist custom occurrences to the module-level store on every change
    useEffect(() => {
        _patternCustomOccurrences[pattern.id] = customOccurrences;
    }, [pattern.id, customOccurrences]);

    const chartConfig = getChartConfig(pattern.simulationType || 'congestion');

    // Internal helper component to keep the tabs clean and reusable
    const OccurrenceCard = ({ occ, idx, showMatch = true }: { occ: PatternOccurrence, idx: number, showMatch?: boolean }) => {
        const [showEvents, setShowEvents] = useState(false);
        // Auto-resolve events: use existing ones or generate mock events if empty
        const resolvedEvents = occ.events && occ.events.length > 0
            ? occ.events
            : generateMockEventsForType(pattern.simulationType || 'congestion', occ.id, occ.timestamp);

        const getSeverityStyle = (sev: string) => {
            if (sev === 'Critical') return 'border-red-500/30 text-red-400 bg-red-400/5';
            if (sev === 'Major') return 'border-orange-500/30 text-orange-400 bg-orange-400/5';
            return 'border-yellow-500/30 text-yellow-400 bg-yellow-400/5';
        };

        // Date & Time Formatting using date-fns
        let dateDisplay = 'N/A';
        let timeDisplay = '';
        try {
            const d = new Date(occ.timestamp);
            if (!isNaN(d.getTime())) {
                dateDisplay = format(d, 'MMM dd, yyyy');
                timeDisplay = format(d, 'hh:mm:ss a');
            } else {
                // Fallback for old strings
                dateDisplay = occ.timestamp.split(',')[0] || 'N/A';
                timeDisplay = occ.timestamp.split(',')[1]?.trim() || '';
            }
        } catch (e) {
            dateDisplay = occ.timestamp;
        }

        return (
            <div
                key={occ.id}
                className="relative bg-card/30 border border-white/5 rounded-xl p-5 flex flex-col lg:flex-row items-stretch gap-6 group hover:border-primary/20 transition-all shadow-sm max-w-7xl mx-auto w-full"
            >
                {/* Occurrence Info Sidebar */}
                <div className="flex flex-col min-w-[200px] border-r border-white/5 pr-6 justify-center">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        <span className="text-[10px] font-bold text-foreground/60 tracking-widest">Case #{pattern.occurrences.length - idx}</span>
                    </div>

                    <div className="space-y-0.5">
                        <div className="text-sm font-bold text-foreground/40 tracking-tighter">Event Date</div>
                        <div className="text-lg font-black text-foreground tracking-tight leading-none mb-2">
                            {dateDisplay}
                        </div>
                        <div className="text-sm font-bold text-foreground/40 tracking-tighter">Trigger Time</div>
                        <div className="text-[12px] font-mono font-bold text-primary/80 bg-primary/5 px-2 py-1 rounded w-fit">
                            {timeDisplay}
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <Badge variant="outline" className={`py-0.5 h-5 text-[10px] font-bold px-3 ${occ.severity === 'Critical' ? 'border-red-500/30 text-red-400 bg-red-400/5' :
                            'border-orange-500/30 text-orange-400 bg-orange-400/5'
                            }`}>
                            {occ.severity}
                        </Badge>
                        {showMatch && (
                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-400/5 py-0.5 h-5 text-[10px] font-bold px-3">
                                {(94 + (Math.sin(idx + 10) * 4.5)).toFixed(1)}% Match
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Metrics Row - Constrained and tidy */}
                <div className="flex-1 max-w-[800px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 h-full items-center">
                        {SIM_METRICS[pattern.simulationType || 'congestion']?.map(m => (
                            <div key={m.key} className="h-[120px]">
                                <MiniMetricPlot
                                    data={occ.metricData}
                                    dataKey={m.key}
                                    color={m.color}
                                    name={m.name}
                                    occId={occ.id}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outcomes */}
                <div className="min-w-[180px] border-l border-white/5 pl-6 flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-foreground/50 mb-4 flex items-center gap-2 tracking-widest">
                        <Zap className="h-3 w-3 text-primary/70" /> Predictions
                    </div>
                    <div className="flex flex-col gap-2">
                        {occ.outcomes?.map((out, i) => (
                            <div key={i} className="flex items-center gap-2 group/item">
                                <div className="w-[3px] h-3 bg-red-500/60 rounded-full" />
                                <span className="text-[10px] font-black text-red-400 tracking-widest">{formatLabel(out)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const filterOccurrences = (occurrences: PatternOccurrence[]) => {
        if (timeFilter === 'ALL') return occurrences;

        const now = new Date('2026-02-19'); // metadata timestamp
        const cutoff = new Date(now);

        switch (timeFilter) {
            case '24H': cutoff.setHours(now.getHours() - 24); break;
            case '7D': cutoff.setDate(now.getDate() - 7); break;
            case '1M': cutoff.setMonth(now.getMonth() - 1); break;
        }

        return occurrences.filter(occ => {
            const occDate = new Date(occ.timestamp);
            return occDate >= cutoff;
        });
    };

    const filteredOccurrences = pattern.occurrences ? filterOccurrences(pattern.occurrences) : [];

    // All occurrences combined: custom ones first (most recent), then pattern ones
    const allOccurrences = [...customOccurrences, ...pattern.occurrences];

    const handleAddOccurrence = () => {
        const nowTs = new Date().toISOString();
        const newId = `OCC-CUSTOM-${Date.now()}`;
        const newOcc: PatternOccurrence = {
            id: newId,
            timestamp: nowTs,
            severity: 'Major',
            summary: 'Manually Added Occurrence',
            outcomes: pattern.predictedEvents.map(e => e.name.replace(/_/g, ' ')),
            metricData: generateSimulationData(pattern.simulationType || 'congestion'),
            events: generateMockEventsForType(pattern.simulationType || 'congestion', newId, nowTs),
        };
        setCustomOccurrences(prev => [newOcc, ...prev]);
    };

    // Initialize with some historical context, but allow manual extension
    useEffect(() => {
        // Start with a smaller subset of data for the "Live" feel
        const initialData = generateSimulationData(pattern.simulationType || 'congestion').slice(0, 5);
        setChartData(initialData);
        // Initialize inputs with the last values
        if (initialData.length > 0) {
            const last = initialData[initialData.length - 1];
            setManualInputs({
                metric1: Math.round(last.metric1),
                metric2: Math.round(last.metric2),
                metric3: Math.round(last.metric3)
            });
        }
    }, [pattern]);

    // Real-time prediction analysis based on LATEST CHART DATA (Committed)
    useEffect(() => {
        if (activeTab === 'simulation') {
            // Only show predictions if user has explicitly pushed data
            if (!hasUserInteracted || chartData.length === 0) {
                setDynamicPredictions([]);
                return;
            }

            const latestPoint = chartData[chartData.length - 1];
            const simType = pattern.simulationType || 'congestion';

            const keys = SIM_METRICS[simType] || SIM_METRICS['congestion'];

            // Raw inputs (mapped from descriptive keys)
            const m1 = latestPoint[keys[0]?.key] || 0; // Util or CPU
            const m2 = latestPoint[keys[1]?.key] || 0; // Queue or Loss
            const m3 = latestPoint[keys[2]?.key] || 0; // Errors or BGP State

            const activeEvents: any[] = [];

            if (simType === 'cpu_spike') {
                // CPU Spike Logic
                // Thresholds: CPU > 50% starts warnings
                // Critical: CPU > 85% OR BGP State = 0 (Down)

                const isBgpDown = m3 === 0;

                if (m1 > 50 || isBgpDown || m2 > 5) {
                    // Filter events based on severity/stage
                    pattern.predictedEvents?.forEach(event => {
                        let shouldShow = false;
                        let prob = 0.1;

                        if (event.name === 'BGP_SESSION_DOWN') {
                            // Only show if BGP is actually threatened
                            if (m1 > 85 || isBgpDown) shouldShow = true;
                            // Prob jumps if Down
                            prob = isBgpDown ? 0.95 : (m1 / 100);
                        } else {
                            // Other events (Route Withdrawal etc)
                            shouldShow = true;
                            // Probability
                            prob = 0.4 + (m1 * 0.005);
                        }

                        if (shouldShow) {
                            activeEvents.push({
                                ...event,
                                probability: Math.min(0.99, Math.max(0.1, prob))
                            });
                        }
                    });
                }

            } else {
                // Congestion Logic (User's primary focus)
                // "prediction comes only when all three values start increase"
                // Interactive gating:
                // Stage 1: Traffic rising (Util > 40 AND Queue > 10) -> Packet Drop
                // Stage 2: Saturation (Util > 80 OR Errors > 0) -> Link Flap

                // Stage 1: Traffic rising (Util > 40 AND Queue > 10 AND Errors >= 1) -> Packet Drop
                // Stage 2: Saturation (Util > 80 OR Errors > 5) -> Link Flap

                const isTrafficRising = m1 > 40 && m2 > 10 && m3 >= 1;
                const isSaturated = m1 > 80 || m3 > 5;

                if (isTrafficRising) {
                    pattern.predictedEvents?.forEach(event => {
                        let shouldShow = false;
                        let prob = 0;

                        if (event.name === 'INTERFACE_FLAP') {
                            // Only show Link Flap in Stage 2 (Saturation)
                            if (isSaturated) {
                                shouldShow = true;
                                // Probability driven by Errors (m3) and saturation
                                prob = 0.6 + (m3 * 0.05) + ((m1 - 80) * 0.01);
                            }
                        } else {
                            // PACKET_DROP / Threshold Exceeded
                            // Show immediately in Stage 1
                            shouldShow = true;
                            // Probability starts at 50% and scales with Util
                            prob = 0.5 + ((m1 - 40) * 0.01) + (m2 * 0.002);
                        }

                        if (shouldShow) {
                            activeEvents.push({
                                ...event,
                                probability: Math.min(0.99, Math.max(0.1, prob))
                            });
                        }
                    });
                }
            }

            setDynamicPredictions(activeEvents);
        } else {
            setDynamicPredictions(pattern.predictedEvents);
        }
    }, [chartData, hasUserInteracted, activeTab, pattern.predictedEvents, pattern.simulationType]);

    const injectTelemetry = () => {
        setHasUserInteracted(true);

        let nextIndex = 0;
        if (chartData.length > 0) {
            const lastTime = chartData[chartData.length - 1].time;
            // format "T+10m"
            const match = lastTime.match(/T\+(\d+)m/);
            if (match) nextIndex = parseInt(match[1]) + 1;
        } else {
            nextIndex = 0;
        }

        const keys = SIM_METRICS[pattern.simulationType || 'congestion'];
        const newPoint: any = { time: `T+${nextIndex}m` };
        if (keys[0]) newPoint[keys[0].key] = Number(manualInputs.metric1);
        if (keys[1]) newPoint[keys[1].key] = Number(manualInputs.metric2);
        if (keys[2]) newPoint[keys[2].key] = Number(manualInputs.metric3);

        setChartData(prev => {
            const newData = [...prev, newPoint];
            // Keep only last 20 points to prevent overcrowding
            if (newData.length > 20) return newData.slice(newData.length - 20);
            return newData;
        });
    };

    const currentSimStep = chartData[chartData.length - 1] || { metric1: 0, metric2: 0, metric3: 0 };

    // Helper for Logic Step Colors
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue': return "bg-blue-500/10 text-blue-500";
            case 'amber': return "bg-amber-500/10 text-amber-500";
            case 'red': return "bg-red-500/10 text-red-500";
            default: return "bg-secondary/10 text-foreground";
        }
    };

    // Helper for Event Badge Colors
    const getEventBadgeStyles = (severity: string) => {
        const s = severity.toLowerCase();
        if (s === 'critical' || s === 'high') return "bg-red-500/15 text-red-500 hover:bg-red-500/25 border-red-500/20";
        if (s === 'major' || s === 'medium') return "bg-orange-500/15 text-orange-500 hover:bg-orange-500/25 border-orange-500/20";
        if (s === 'warning' || s === 'low') return "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20";
        return "bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 border-blue-500/20";
    };

    const getPredictionValueColor = (probability: number) => {
        if (probability > 0.8) return "text-red-500";
        if (probability > 0.5) return "text-orange-500";
        return "text-blue-500";
    };


    // Notification State
    const [notification, setNotification] = useState<any | null>(null);

    // Effect to trigger notification on new predictions
    useEffect(() => {
        if (dynamicPredictions.length > 0) {
            // Priority list for critical events
            const criticalEvents = ['INTERFACE_FLAP', 'BGP_SESSION_DOWN', 'LINK_DOWN'];

            // Find highest priority event (Critical > High Probability)
            const topEvent = dynamicPredictions.reduce((prev, current) => {
                const isPrevCritical = criticalEvents.includes(prev.name);
                const isCurrCritical = criticalEvents.includes(current.name);

                // If current is critical and previous is not, switch to current
                if (isCurrCritical && !isPrevCritical) return current;
                // If previous is critical and current is not, keep previous
                if (!isCurrCritical && isPrevCritical) return prev;

                // If both are same priority tier, use probability
                return (prev.probability < current.probability) ? current : prev; // Fixed comparison to ensure max probability
            });

            // Only notify if probability is significant
            if (topEvent.probability > 0.4) {
                setNotification(topEvent);
                // Notification duration
                const timer = setTimeout(() => setNotification(null), 4000);
                return () => clearTimeout(timer);
            }
        }
    }, [dynamicPredictions]);

    if (activeTab === 'simulation') {
        return (
            <div className="h-full flex flex-col bg-background animate-in slide-in-from-right-4 duration-300 relative overflow-hidden">
                {/* Notification Toast */}
                <AnimatePresence>
                    {notification && (
                        <motion.div
                            initial={{ x: 300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="absolute top-20 right-4 z-50 pointer-events-none"
                        >
                            <div className="bg-background/95 backdrop-blur border border-emerald-500/30 shadow-lg shadow-emerald-500/10 rounded-xl p-4 flex gap-4 w-80">
                                <div className={`p-2 rounded-lg bg-emerald-500/10 h-fit`}>
                                    <AlertTriangle className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-4 ${getEventBadgeStyles(notification.severity)}`}>
                                            {notification.name}
                                        </Badge>
                                        <span className="text-xs font-bold text-emerald-500">{Math.round(notification.probability * 100)}%</span>
                                    </div>
                                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{notification.subtitle}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="border-b border-border/50 p-4 flex items-center justify-between bg-card/50">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setActiveTab('overview')} className="hover:bg-accent hover:text-accent-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight leading-none">Simulation Mode</h2>
                            <p className="text-xs text-muted-foreground mt-1">Interactive Pattern Lab: {pattern.name}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('overview')}>
                        Exit Simulation
                    </Button>
                </div>

                <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
                    {/* Left Panel: Chart & Predictions */}
                    <div className="col-span-9 flex flex-col gap-6 h-full overflow-y-auto pr-2">
                        {/* Chart */}
                        <Card className="border-border/50 bg-card/40 min-h-[400px]">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-muted-foreground">Real-time Telemetry & Response</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[350px] pb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                        <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ padding: 0 }}
                                        />
                                        {chartConfig.metric1 && <Line type="monotone" dataKey={chartConfig.metric1.key} stroke={chartConfig.metric1.color} strokeWidth={2} name={chartConfig.metric1.name} dot={true} isAnimationActive={false} />}
                                        {chartConfig.metric2 && <Line type="monotone" dataKey={chartConfig.metric2.key} stroke={chartConfig.metric2.color} strokeWidth={2} name={chartConfig.metric2.name} dot={true} isAnimationActive={false} />}
                                        {chartConfig.metric3 && <Line type="step" dataKey={chartConfig.metric3.key} stroke={chartConfig.metric3.color} strokeWidth={2} name={chartConfig.metric3.name} dot={true} isAnimationActive={false} />}
                                        <ReferenceLine x={chartData[chartData.length - 1]?.time} stroke="white" strokeDasharray="3 3" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Predicted Events (Moved Here) */}
                        <Card className="flex-1 border-l-4 border-l-emerald-500 bg-emerald-500/5">
                            <CardHeader className="pb-2 py-3 border-b border-border/10">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm font-medium text-emerald-500 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Predicted Impact Log
                                    </CardTitle>
                                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">Live Analysis</span>
                                </div>
                            </CardHeader>
                            <CardContent className="py-4">
                                {((activeTab === 'simulation' && !hasUserInteracted) ? [] : dynamicPredictions)?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed border-border/30 rounded-xl h-full">
                                        <Activity className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-xs">Push telemetry data to generate impact predictions.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {(activeTab === 'simulation' && !hasUserInteracted ? [] : dynamicPredictions)?.map((event, idx) => (
                                            <div key={idx} className={`relative bg-background/80 p-4 rounded-xl border border-emerald-500/20 shadow-sm transition-all duration-300 ${idx === 0 ? 'ring-1 ring-emerald-500/30' : 'opacity-90'}`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-5 ${getEventBadgeStyles(event.severity)}`}>
                                                        {formatLabel(event.name)}
                                                    </Badge>
                                                    <div className="text-right">
                                                        <span className={`text-2xl font-bold leading-none ${getPredictionValueColor(event.probability)}`}>
                                                            {Math.round(event.probability * 100)}%
                                                        </span>
                                                        <div className="text-[10px] text-muted-foreground uppercase opacity-70 mt-1">Probability</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-base font-semibold text-foreground">{event.title}</div>
                                                    <div className="text-xs text-muted-foreground leading-snug">{event.subtitle}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Controls (Moved Here) */}
                    <div className="col-span-3 h-full overflow-y-auto">
                        <Card className="border-border/50 bg-card/40 h-full">
                            <CardHeader className="pb-2 py-3 border-b border-border/50">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Telemetry Injection
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 flex flex-col gap-8">
                                <div className="space-y-4">
                                    {chartConfig.metric1 && (
                                        <>
                                            <label className="text-sm font-medium text-muted-foreground flex justify-between">
                                                {chartConfig.metric1.name}
                                                <span className="text-foreground font-mono bg-secondary/30 px-2 py-0.5 rounded">{manualInputs.metric1}%</span>
                                            </label>
                                            <input
                                                type="range" min="0" max="100" step="1"
                                                value={manualInputs.metric1}
                                                onChange={(e) => setManualInputs(prev => ({ ...prev, metric1: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-500"
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {chartConfig.metric2 && (
                                        <>
                                            <label className="text-sm font-medium text-muted-foreground flex justify-between">
                                                {chartConfig.metric2.name}
                                                <span className="text-foreground font-mono bg-secondary/30 px-2 py-0.5 rounded">{manualInputs.metric2}</span>
                                            </label>
                                            <input
                                                type="range" min="0" max="100" step="1"
                                                value={manualInputs.metric2}
                                                onChange={(e) => setManualInputs(prev => ({ ...prev, metric2: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {chartConfig.metric3 && (
                                        <>
                                            <label className="text-sm font-medium text-muted-foreground flex justify-between">
                                                {chartConfig.metric3.name}
                                                <span className="text-foreground font-mono bg-secondary/30 px-2 py-0.5 rounded">{manualInputs.metric3}</span>
                                            </label>
                                            <input
                                                type="range" min="0" max="20" step="1"
                                                value={manualInputs.metric3}
                                                onChange={(e) => setManualInputs(prev => ({ ...prev, metric3: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-red-500"
                                            />
                                        </>
                                    )}
                                </div>

                                <div className="pt-6 mt-auto">
                                    <Button onClick={injectTelemetry} className="w-full" size="lg">
                                        <PlayCircle className="mr-2 h-5 w-5" />
                                        Push Data Point
                                    </Button>
                                    <div className="mt-4 text-[10px] text-center text-muted-foreground">
                                        {manualInputs.metric3 > 5 ? 'High CRC Detected due to inputs' : 'Ready to inject next time step'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-in slide-in-from-right-4 duration-300 min-h-0">

            {/* Header */}
            <div className="border-b border-border/50 p-4 flex items-center justify-between bg-card/50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-accent hover:text-accent-foreground">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-lg border border-primary/20">
                            <BrainCircuit className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight leading-none">{pattern.name}</h2>
                                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] h-5">
                                    {pattern.confidence * 100}% Conf.
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    {pattern.domain}
                                </span>
                                <span className="flex items-center gap-1 text-primary/80 font-medium">
                                    <Calendar className="h-3 w-3" />
                                    Rule Identified: {pattern.ruleCreationDate}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {pattern.seenCount} occurrences since created
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Last seen: {pattern.lastSeen}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('simulation')}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Open Simulation
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-6">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Metric Visualization & Explanation */}
                    <div className="space-y-4">

                        {/* Consolidated Analytical Intelligence Section */}
                        <Card className="border-border/50 bg-card/40 overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col">
                                    <div className="p-6 bg-background/20">
                                        {/* Header with styled line */}
                                        <div className="flex items-center gap-4 mb-5 w-full">
                                            <div className="text-[10px] font-bold text-muted-foreground tracking-widest whitespace-nowrap">
                                                Incident Progression Lifecycle
                                            </div>
                                            <div className="h-[1px] flex-grow bg-muted-foreground/10" />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-[10px] font-bold tracking-widest border-primary/30 text-primary hover:bg-primary/10 gap-1"
                                                onClick={() => navigate(`/events?correlation=${encodeURIComponent(pattern.name)}`)}
                                            >
                                                Related events
                                                <ArrowRight className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="flex items-stretch gap-3">
                                            {(() => {
                                                const behavioralSteps = pattern.steps.filter(s => s.name !== 'Critical Breach').map(s => ({
                                                    ...s,
                                                    description: s.description.replace('cross', '>').replace('->', '->')
                                                }));
                                                const outcomeSteps = pattern.predictedEvents
                                                    .filter(evt => {
                                                        const evtLower = evt.name.toLowerCase();
                                                        return !behavioralSteps.some(bs => {
                                                            const bsLower = bs.name.toLowerCase();
                                                            return bsLower.includes(evtLower) || evtLower.includes(bsLower);
                                                        });
                                                    })
                                                    .map(evt => ({
                                                        name: evt.name,
                                                        description: '', 
                                                        delay: '(EVENT)'
                                                    }));

                                                const allFlowItems = [...behavioralSteps, ...outcomeSteps];

                                                return allFlowItems.map((item, idx) => {
                                                    const isOutcome = idx >= behavioralSteps.length;

                                                    return (
                                                        <Fragment key={idx}>
                                                            {/* Segmented Block Container */}
                                                            <div className="flex-1 flex flex-col items-center">
                                                                {/* The Block Div */}
                                                                <div className={`w-full border border-border/40 rounded-lg p-3 min-h-[60px] flex flex-col justify-center transition-all hover:bg-muted/5 group ${isOutcome ? 'bg-primary/5 border-primary/20' : 'bg-card/30'}`}>
                                                                    <div className={`text-[13px] font-bold tracking-tight text-center truncate w-full ${(() => {
                                                                        const isFailure = /flap|down|reboot|withdrawal|collapse|breach|outage|unresponsive|sla/i.test(item.name) && !/flapping/i.test(item.name);
                                                                        const isCritical = /loss|drop|jitter|latency|timeout|intermittent|missed|flapping|mismatch/i.test(item.name);

                                                                        if (isOutcome) {
                                                                            if (isFailure || idx === allFlowItems.length - 1) return 'text-rose-400';
                                                                            return 'text-orange-400';
                                                                        }

                                                                        if (isFailure) return 'text-rose-400';
                                                                        if (isCritical) return 'text-orange-400';
                                                                        return 'text-foreground';
                                                                    })()}`}>
                                                                        <span className="opacity-50 mr-1">{idx + 1}.</span>
                                                                        {formatLabel(item.name)}
                                                                        {!isOutcome && /util|rise|spike|up|cross|error|discard|drop|loss|mismatch|flapping/i.test(item.name + item.description) && (
                                                                            <span className="text-rose-500 ml-1">↑</span>
                                                                        )}
                                                                    </div>
                                                                    {item.description && !isOutcome && (
                                                                        <div className={`text-[11px] font-mono font-bold text-center mt-1 ${(/flap|down|reboot|withdrawal|collapse|breach|outage|unresponsive|sla/i.test(item.name) && !/flapping/i.test(item.name)) ? 'text-rose-300/80' :
                                                                            /loss|drop|jitter|latency|timeout|intermittent|missed|flapping|mismatch/i.test(item.name) ? 'text-orange-300/80' :
                                                                                'text-blue-300/90'
                                                                            }`}>
                                                                            {item.description.replace('cross', '>')}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Timing Pill & Connection at Bottom */}
                                                                {idx < allFlowItems.length - 1 && allFlowItems[idx + 1].delay !== '(EVENT)' && (
                                                                    <div className="relative w-full h-10 flex items-center mt-2">
                                                                        <div className={`absolute left-[85%] translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-sm whitespace-nowrap z-10 border-primary/30 bg-primary/5`}>
                                                                            <Clock className={`h-3 w-3 text-primary/50`} />
                                                                            <span className={`text-[10px] font-bold uppercase text-primary/80`}>
                                                                                {allFlowItems[idx + 1].delay}
                                                                            </span>
                                                                        </div>
                                                                        {/* Joining line */}
                                                                        <div className="w-[120%] h-[1px] bg-primary/10" />
                                                                    </div>
                                                                )}
                                                                {idx < allFlowItems.length - 1 && allFlowItems[idx + 1].delay === '(EVENT)' && (
                                                                    <div className="relative w-full h-10 flex items-center mt-2">
                                                                        <div className="w-[120%] h-[1px] bg-primary/10" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Centered Arrow Flow */}
                                                            {idx < allFlowItems.length - 1 && (
                                                                <div className="flex items-center justify-center h-[60px] opacity-60">
                                                                    <ArrowRight className="w-5 h-5 text-primary/60" />
                                                                </div>
                                                            )}
                                                        </Fragment>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* TABS SECTION (Refactored) */}
                        <div className="mt-8 space-y-6">
                            <Tabs value={subTab} onValueChange={(v) => setSubTab(v as 'occurrence' | 'history' | 'analysis')} className="w-full">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                    <TabsList className="bg-transparent gap-8 h-auto p-0 justify-start">
                                        <TabsTrigger
                                            value="occurrence"
                                            className="px-0 py-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none font-bold text-[11px] tracking-widest transition-all"
                                        >
                                            Result / Accuracy ({Math.min(5, pattern.occurrences.length)})
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="history"
                                            className="px-0 py-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none font-bold text-[11px] tracking-widest transition-all"
                                        >
                                            History / Proof ({Math.max(0, pattern.occurrences.length - 5)})
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="analysis"
                                            className="px-0 py-2 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none font-bold text-[11px] tracking-widest transition-all"
                                        >
                                            Analysis
                                        </TabsTrigger>
                                    </TabsList>

                                    {subTab === 'history' && (
                                        <div className="flex items-center gap-2">
                                            {(['24H', '7D', '1M', 'ALL'] as const).map((tf) => (
                                                <button
                                                    key={tf}
                                                    onClick={() => setTimeFilter(tf)}
                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${timeFilter === tf ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
                                                >
                                                    {tf === '24H' ? '24 Hrs' : tf}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Tab Contents */}
                                <TabsContent value="occurrence" className="mt-0 outline-none">
                                    <div className="flex flex-col gap-4">
                                        {allOccurrences.slice(0, 5 + customOccurrences.length).map((occ, idx) => (
                                            <OccurrenceCard key={occ.id} occ={occ} idx={idx} showMatch={true} />
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="history" className="mt-0 outline-none">
                                    <div className="flex flex-col gap-4">
                                        {filteredOccurrences.length > 5 ? (
                                            filteredOccurrences.slice(5).map((occ, idx) => (
                                                <OccurrenceCard key={occ.id} occ={occ} idx={idx + 5} showMatch={false} />
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 bg-card/20 rounded-xl border border-dashed border-border/30">
                                                <Clock className="h-10 w-10 mb-2 opacity-20" />
                                                <p className="text-sm ">No additional historical occurrences found for this pattern.</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="analysis" className="mt-0 outline-none">
                                    <div className="flex flex-col gap-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Logic Description */}
                                            <Card className="bg-card/30 border-border/40">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <BrainCircuit className="h-4 w-4 text-primary" />
                                                        Causal Logic Profile
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="bg-muted/30 p-3 rounded-lg text-xs leading-relaxed text-muted-foreground border border-border/20 ">
                                                        "{pattern.logicSummary || "Multivariate correlation logic identifies cascading failures across layers using semantic proximity and temporal clustering."}"
                                                    </div>
                                                    <div className="space-y-3">
                                                        {pattern.logicSteps?.map((step, idx) => (
                                                            <div key={idx} className="flex gap-3">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] ${getColorClasses(step.color)}`}>
                                                                    {step.order}
                                                                </div>
                                                                <div>
                                                                    <div className="text-xs font-bold text-foreground">{step.title}</div>
                                                                    <div className="text-[10px] text-muted-foreground leading-snug">{step.description}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Drill-down Analytics */}
                                            <Card className="bg-card/30 border-border/40">
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                                                        Pattern Reliability Analysis
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {pattern.drillDownMetrics?.map((metric, idx) => (
                                                            <div key={idx} className="bg-muted/20 p-4 rounded-xl flex items-center justify-between border border-border/20">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                                                                        {metric.icon === 'trending' ? <TrendingUp className="h-4 w-4" /> : metric.icon === 'database' ? <Database className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs font-bold text-foreground">{metric.label}</div>
                                                                        <div className="text-[10px] text-muted-foreground">Historical Benchmark</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-lg font-bold text-foreground">{metric.value}</div>
                                                            </div>
                                                        ))}
                                                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-bold uppercase text-primary tracking-widest">Composite Confidence Score</span>
                                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-2xl font-bold">{(pattern.confidence * 100).toFixed(0)}%</span>
                                                                <span className="text-[10px] font-medium text-primary/70">Verified Accuracy</span>
                                                            </div>
                                                            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden mt-1">
                                                                <div className="h-full bg-primary" style={{ width: `${pattern.confidence * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* NEW: Scientific Foundation & Discovery Logic */}
                                        <Card className="bg-card/20 border-border/30 overflow-hidden">
                                            <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <FlaskConical className="h-4 w-4 text-purple-400" />
                                                    Scientific Foundation & Discovery Logic
                                                </CardTitle>
                                                <CardDescription className="text-[10px]">Technical aspects of algorithmic pattern mining and validation</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-white/5">
                                                    {/* Pipeline Flow */}
                                                    <div className="p-6 space-y-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                                            <Workflow className="h-3 w-3" /> Discovery Pipeline
                                                        </div>
                                                        <div className="space-y-6 relative ml-2">
                                                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/40 via-purple-500/40 to-emerald-500/40" />

                                                            {[
                                                                { label: 'Temporal Resampling', desc: 'Alignment of interface metrics & device resource data to 5-min synchronized grids.', icon: Grid, color: 'text-primary' },
                                                                { label: 'Sliding Window Featurization', desc: 'Extraction of mean, slope, and variance across 15-poll observability windows.', icon: Binary, color: 'text-blue-400' },
                                                                { label: 'Isolation Forest Anomaly', desc: 'Unsupervised identification of multivariate outliers and structural noise reduction.', icon: ShieldCheck, color: 'text-purple-400' },
                                                                { label: 'Random Forest Attribution', desc: 'Gini-importance based feature scoring to isolate the most significant failure precursors.', icon: Cpu, color: 'text-emerald-400' }
                                                            ].map((step, i) => (
                                                                <div key={i} className="relative flex gap-4 pl-1">
                                                                    <div className={`z-10 w-5 h-5 rounded-full bg-background border border-white/10 flex items-center justify-center shrink-0`}>
                                                                        <step.icon className={`h-2.5 w-2.5 ${step.color}`} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[11px] font-bold text-foreground leading-tight mb-1">{step.label}</div>
                                                                        <div className="text-[10px] text-muted-foreground leading-snug">{step.desc}</div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Mathematical Proofs */}
                                                    <div className="p-6 space-y-5 bg-white/[0.02]">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                                            <Calculator className="h-3 w-3" /> Statistical Metrics & Calculus
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                                                                <div className="text-[10px] font-bold text-primary mb-1 uppercase">Signal Synchronization (Pearson r)</div>
                                                                <div className="text-[11px] font-mono text-muted-foreground mb-2 ">r = [âˆ‘(x-xÌ…)(y-yÌ…)] / [âˆšâˆ‘(x-xÌ…)Â²âˆ‘(y-yÌ…)Â²]</div>
                                                                <p className="text-[10px] text-muted-foreground ">Quantifies temporal alignment between metric pairs (e.g., Links vs Buffers).</p>
                                                            </div>

                                                            <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                                                                <div className="text-[10px] font-bold text-purple-400 mb-1 uppercase">Causal Integrity (Granger F-Stat)</div>
                                                                <div className="text-[11px] font-mono text-muted-foreground mb-2 ">{"Y_t = âˆ‘a_i Y_{t - i} + âˆ‘b_i X_{t - i} + Îµ"}</div>
                                                                <p className="text-[10px] text-muted-foreground ">Verifies that Metric X (Cause) significantly improves prediction of Metric Y (Effect).</p>
                                                            </div>

                                                            <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                                                                <div className="text-[10px] font-bold text-emerald-400 mb-1 uppercase">Predictive Lift Score</div>
                                                                <div className="text-[11px] font-mono text-muted-foreground mb-2 ">Lift = P(Event | Pattern) / P(Event)</div>
                                                                <p className="text-[10px] text-muted-foreground ">Measures how much more likely an event is when the pattern is observed vs baseline.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Attribution & Weights */}
                                                    <div className="p-6 space-y-4">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                                            <TrendingUp className="h-3 w-3" /> Feature Attribution
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="text-[10px] text-muted-foreground mb-3">
                                                                Random Forest importance weights for precursor identification:
                                                            </div>
                                                            {[
                                                                { label: 'Temporal Slope (Rate of Change)', val: 82 },
                                                                { label: 'Window Peak Variance', val: 64 },
                                                                { label: 'Historical Cluster Deviation', val: 45 },
                                                                { label: 'Cross-Entity Correlation', val: 30 }
                                                            ].map((f, i) => (
                                                                <div key={i} className="space-y-1.5">
                                                                    <div className="flex justify-between text-[10px] font-medium">
                                                                        <span className="text-foreground">{f.label}</span>
                                                                        <span className="text-primary font-bold">{f.val}%</span>
                                                                    </div>
                                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-primary/60 rounded-full"
                                                                            style={{ width: `${f.val}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                                            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                                                <div className="text-[10px] font-bold text-primary flex items-center gap-2 mb-1">
                                                                    <Activity className="h-3 w-3" /> LEAD TIME ANALYSIS
                                                                </div>
                                                                <div className="text-[18px] font-bold text-foreground">15 - 20 Minutes</div>
                                                                <p className="text-[10px] text-muted-foreground ">Typical horizon for high-confidence predictive warnings.</p>
                                                            </div>

                                                            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                                                <div className="text-[10px] font-bold text-purple-400 flex items-center gap-2 mb-1">
                                                                    <TerminalIcon className="h-3 w-3" /> ENGINE RUNTIME
                                                                </div>
                                                                <div className="text-[18px] font-bold text-foreground">0.84 Seconds</div>
                                                                <p className="text-[10px] text-muted-foreground ">Pattern extraction & causal mining latency.</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 p-4 rounded-xl bg-black/20 border border-white/5">
                                                            <div className="text-[10px] font-bold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                                                                <BarChart3Icon className="h-3 w-3" /> Model Precision Analytics
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                                                {[
                                                                    { label: 'Precision', val: 0.94 },
                                                                    { label: 'Recall', val: 0.88 },
                                                                    { label: 'F1-Score', val: 0.91 },
                                                                    { label: 'Accuracy', val: 0.96 }
                                                                ].map((m, i) => (
                                                                    <div key={i} className="flex justify-between items-center">
                                                                        <span className="text-[10px] text-muted-foreground">{m.label}</span>
                                                                        <span className="text-[11px] font-mono font-bold text-emerald-400">{(m.val * 100).toFixed(0)}%</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
