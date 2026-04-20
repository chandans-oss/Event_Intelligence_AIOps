
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import {
    Zap,
    Activity,
    Clock,
    ArrowRight,
    GitCommit,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    BrainCircuit,
    History as HistoryIcon,
    FlaskConical,
    Workflow,
    Calculator,
    Binary,
    Grid,
    Cpu,
    ShieldCheck,
    BarChart3 as BarChart3Icon,
    Terminal as TerminalIcon
} from 'lucide-react';
import {
    ComposedChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { cn } from '@/shared/lib/utils';

// --- Types ---

type PatternType = 'sequence' | 'metric';
type PatternStatus = 'active' | 'learning' | 'draft' | 'discarded';

interface HistoricalIncident {
    id: string;
    timestamp: string;
    device: string;
    duration: string;
    outcome: string;
}

interface Pattern {
    id: string;
    name: string;
    type: PatternType;
    status: PatternStatus;
    confidence: number;
    occurrences: number;
    lastSeen: string;
    description: string;
    sequence?: string[];
    metricTemplate?: any[];
    prediction?: {
        if: string;
        then: string;
        probability: number;
    };
    history: HistoricalIncident[];
}

// --- Mock Data ---

const PATTERNS: Pattern[] = [
    {
        id: 'PAT-SEQ-001',
        name: 'Switch Congestion Cascade',
        type: 'sequence',
        status: 'active',
        confidence: 92,
        occurrences: 12,
        lastSeen: '2 hours ago',
        description: 'High CPU utilization on Aggregation switches typically precedes queue drops and downstream latency spikes within 5 minutes.',
        sequence: ['CPU_HIGH', 'QUEUE_DROP', 'LATENCY_HIGH'],
        prediction: {
            if: 'CPU_HIGH + QUEUE_DROP',
            then: 'LATENCY_HIGH (Downstream)',
            probability: 85
        },
        history: [
            { id: 'INC-1023', timestamp: 'Today, 10:00 AM', device: 'Agg-SW1', duration: '5m', outcome: 'Verified' },
            { id: 'INC-0988', timestamp: 'Yesterday, 02:15 PM', device: 'Agg-SW2', duration: '4m', outcome: 'Verified' },
            { id: 'INC-0842', timestamp: 'Oct 24, 09:10 AM', device: 'Core-R1', duration: '8m', outcome: 'Verified' },
            { id: 'INC-0755', timestamp: 'Oct 22, 06:05 PM', device: 'Agg-SW3', duration: '6m', outcome: 'Verified' },
            { id: 'INC-0611', timestamp: 'Oct 20, 10:30 PM', device: 'Agg-SW1', duration: '5m', outcome: 'Verified' },
        ]
    },
    {
        id: 'PAT-MET-002',
        name: 'Interface Instability Precursor',
        type: 'metric',
        status: 'learning',
        confidence: 88,
        occurrences: 8,
        lastSeen: '5 hours ago',
        description: 'Gradual increase in interface utilization > 80% combined with rising buffer usage reliably predicts packet drops and eventual link flap.',
        metricTemplate: [
            { time: '0m', util: 50, buffer: 10, errors: 0 },
            { time: '3m', util: 62, buffer: 20, errors: 0 },
            { time: '6m', util: 75, buffer: 45, errors: 2 },
            { time: '9m', util: 89, buffer: 68, errors: 7 },
            { time: '12m', util: 94, buffer: 85, errors: 15 },
            { time: '15m', util: 98, buffer: 92, errors: 45, event: 'PACKET_LOSS' },
        ],
        prediction: {
            if: 'Util > 85% + Buffer Rise',
            then: 'PACKET_LOSS -> LINK_FLAP',
            probability: 78
        },
        history: [
            { id: 'INC-1105', timestamp: 'Today, 08:30 AM', device: 'Edge-R5', duration: '15m', outcome: 'Predicted' },
            { id: 'INC-1042', timestamp: 'Yesterday, 11:20 AM', device: 'Edge-R2', duration: '12m', outcome: 'Verified' },
            { id: 'INC-0921', timestamp: 'Oct 25, 04:15 PM', device: 'Edge-R5', duration: '18m', outcome: 'Verified' },
        ]
    }
];

// --- Components ---

export function BehavioralPatternAnalysis() {
    const [selectedPattern, setSelectedPattern] = useState<Pattern>(PATTERNS[0]);

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">

            {/* Left Sidebar: Pattern List */}
            <Card className="w-80 flex flex-col border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
                <CardHeader className="p-4 border-b border-border/50">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                        Behavioral Patterns
                    </CardTitle>
                    <CardDescription className="text-xs">
                        AI-discovered correlations from historical data
                    </CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {PATTERNS.map(pattern => (
                            <div
                                key={pattern.id}
                                onClick={() => setSelectedPattern(pattern)}
                                className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all hover:bg-secondary/40",
                                    selectedPattern.id === pattern.id
                                        ? "bg-primary/5 border-primary/40 shadow-sm ring-1 ring-primary/20"
                                        : "bg-card border-border/30"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] px-1.5 h-5 font-normal capitalize",
                                            pattern.status === 'active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                pattern.status === 'learning' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : ""
                                        )}
                                    >
                                        {pattern.status}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground">{pattern.lastSeen}</span>
                                </div>
                                <h4 className="text-sm font-medium leading-tight mb-1">{pattern.name}</h4>
                                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {pattern.occurrences} Cases
                                    </div>
                                    <div className="font-mono text-primary font-medium">
                                        {pattern.confidence}% Conf.
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-3 border-t border-border/50 bg-secondary/10">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-2" />
                        Review New Patterns (2)
                    </Button>
                </div>
            </Card>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">

                {/* Header Card */}
                <Card className="shrink-0 border-border/50 bg-card/50 backdrop-blur-sm">
                    <div className="p-4 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold">{selectedPattern.name}</h2>
                                <Badge variant="secondary" className="font-mono text-xs">{selectedPattern.id}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-3xl">{selectedPattern.description}</p>

                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">Type:</span>
                                    <Badge variant="outline" className="capitalize">{selectedPattern.type}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">Confidence Score:</span>
                                    <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${selectedPattern.confidence}%` }}
                                        />
                                    </div>
                                    <span className="font-medium">{selectedPattern.confidence}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="text-muted-foreground">Historical Support:</span>
                                    <span className="font-medium text-foreground">{selectedPattern.occurrences} Verified Incidents</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">Discard</Button>
                            <Button size="sm" className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {selectedPattern.status === 'active' ? 'Enabled' : 'Approve Pattern'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Main Content Area */}
                <Card className="flex-1 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
                    <Tabs defaultValue="definition" className="h-full flex flex-col">
                        <div className="border-b border-border/50 px-4">
                            <TabsList className="bg-transparent h-12 w-full justify-start gap-4">
                                <TabsTrigger value="definition" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 border-b-2 border-transparent">
                                    <GitCommit className="h-4 w-4 mr-2" /> Pattern Definition
                                </TabsTrigger>
                                <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 border-b-2 border-transparent">
                                    <HistoryIcon className="h-4 w-4 mr-2" /> Historical Evidence
                                </TabsTrigger>
                                <TabsTrigger value="mining" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 border-b-2 border-transparent">
                                    <FlaskConical className="h-4 w-4 mr-2" /> Discovery Logic
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1">
                            <TabsContent value="definition" className="m-0 p-6 space-y-8">

                                {/* 1. Visualization Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pattern Signature</h3>

                                    {selectedPattern.type === 'sequence' ? (
                                        <div className="flex items-center gap-4 bg-secondary/20 p-8 rounded-xl border border-border/50 justify-center overflow-x-auto">
                                            {selectedPattern.sequence?.map((step, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={cn(
                                                            "h-16 w-16 rounded-full flex items-center justify-center border-2 text-[10px] font-bold text-center shadow-lg",
                                                            i === 0 ? "bg-red-500/10 border-red-500 text-red-500" :
                                                                i === selectedPattern.sequence!.length - 1 ? "bg-primary/10 border-primary text-primary" :
                                                                    "bg-secondary border-muted-foreground/30 text-muted-foreground"
                                                        )}>
                                                            {step}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground uppercase font-mono">Step {i + 1}</span>
                                                    </div>
                                                    {i < selectedPattern.sequence!.length - 1 && (
                                                        <div className="flex flex-col items-center -mt-6">
                                                            <span className="text-[9px] text-muted-foreground mb-1">~2-3 min</span>
                                                            <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-[300px] w-full bg-card rounded-xl border border-border/50 p-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart data={selectedPattern.metricTemplate} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                    <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                                                    <YAxis yAxisId="left" label={{ value: 'Util %', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 10 }} />
                                                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Errors', angle: 90, position: 'insideRight' }} tick={{ fontSize: 10 }} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                                    />
                                                    <Legend />
                                                    <Area yAxisId="left" type="monotone" dataKey="util" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={2} name="Utilization %" />
                                                    <Line yAxisId="left" type="monotone" dataKey="buffer" stroke="#f59e0b" strokeWidth={2} name="Buffer %" dot={false} />
                                                    <Line yAxisId="right" type="step" dataKey="errors" stroke="#ef4444" strokeWidth={2} name="CRC Errors" dot={false} />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                <Separator className="bg-border/50" />

                                {/* 2. Prediction Insight */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Predictive Inference</h3>
                                    <div className="bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary p-4 rounded-r-lg">
                                        <div className="flex items-start gap-4">
                                            <Zap className="h-5 w-5 text-primary mt-1" />
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">
                                                    If the system detects <span className="text-primary font-bold">{selectedPattern.prediction?.if}</span>...
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                    <p className="text-sm">
                                                        It predicts <span className="text-foreground font-bold">{selectedPattern.prediction?.then}</span> with <span className="text-emerald-500 font-bold">{selectedPattern.prediction?.probability}% probability</span>.
                                                    </p>
                                                </div>
                                                <p className="text-xs text-muted-foreground  mt-2">
                                                    "Based on historical patterns, a {selectedPattern.sequence ? selectedPattern.sequence[selectedPattern.sequence.length - 1] : 'Failure'} event is likely to follow within the next few minutes."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </TabsContent>

                            <TabsContent value="mining" className="m-0 overflow-hidden">
                                <div className="p-6 h-full space-y-8">
                                    {/* Mining Overview */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Algorithmic Flow */}
                                        <Card className="bg-card/30 border-border/40 overflow-hidden">
                                            <CardHeader className="bg-white/5 border-b border-white/5 pb-3">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <Workflow className="h-4 w-4 text-primary" />
                                                    Discovery Pipeline (v2.0)
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="relative space-y-8">
                                                    <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/30 via-purple-500/30 to-emerald-500/30" />

                                                    {[
                                                        { step: '1', title: 'Grid-Based Resampling', desc: 'Interface metrics and device resource data are synchronized onto a 5-minute floor-bucket grid.', icon: Grid, color: 'text-blue-400' },
                                                        { step: '2', title: 'Sliding Window Extraction', desc: '15-poll observability windows generate multivariate feature vectors (mean, slope, variance).', icon: Binary, color: 'text-purple-400' },
                                                        { step: '3', title: 'Anomaly Attribution', desc: 'Isolation Forest identifies outlier sequences while Random Forest scores feature significance.', icon: Cpu, color: 'text-emerald-400' },
                                                        { step: '4', title: 'Causal Verification', desc: 'Granger Causality and Lift matrices confirm if Pattern X is a statistically reliable precursor to Event Y.', icon: ShieldCheck, color: 'text-primary' }
                                                    ].map((step, idx) => (
                                                        <div key={idx} className="relative flex gap-4">
                                                            <div className="z-10 w-7 h-7 rounded-full bg-background border border-white/10 flex items-center justify-center shrink-0">
                                                                <step.icon className={cn("h-3.5 w-3.5", step.color)} />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold leading-none mb-1">{step.title}</div>
                                                                <div className="text-[10px] text-muted-foreground leading-relaxed ">{step.desc}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Statistical Proofs */}
                                        <Card className="bg-card/30 border-border/40 overflow-hidden">
                                            <CardHeader className="bg-white/5 border-b border-white/5 pb-3">
                                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                                    <Calculator className="h-4 w-4 text-amber-400" />
                                                    Mathematical Validations
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-4">
                                                <div className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-1">
                                                    <div className="text-[10px] font-bold text-primary uppercase tracking-wider">Sync Correlation (Pearson r)</div>
                                                    <div className="text-xs font-mono text-muted-foreground  tracking-tight">r = Î£(x-xÌ…)(y-yÌ…) / âˆš[Î£(x-xÌ…)Â² Î£(y-yÌ…)Â²]</div>
                                                    <div className="text-[9px] text-muted-foreground/60 ">Measures temporal alignment between telemetry sensors.</div>
                                                </div>

                                                <div className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-1">
                                                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Causal Integrity (Granger F-Stat)</div>
                                                    <div className="text-xs font-mono text-muted-foreground  tracking-tight">{"Y_t = Î± + Î£Î²_i Y_{t - i} + Î£Î³_i X_{t - i} + Îµ"}</div>
                                                    <div className="text-[9px] text-muted-foreground/60 ">Verifies if Metric X adds significant predictive value for Metric Y.</div>
                                                </div>

                                                <div className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-1">
                                                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Predictive Lift Coefficient</div>
                                                    <div className="text-xs font-mono text-muted-foreground  tracking-tight">Lift(Pâ†’E) = P(Event|Pattern) / P(Event)</div>
                                                    <div className="text-[9px] text-muted-foreground/60 ">Ratio of event occurrence likelihood given the presence of this pattern.</div>
                                                </div>

                                                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-primary uppercase">Reliability Score</div>
                                                        <div className="text-2xl font-bold tracking-tighter">{(selectedPattern.confidence / 100 * selectedPattern.prediction!.probability / 100 * 100).toFixed(1)}%</div>
                                                    </div>
                                                    <div className="text-right space-y-1">
                                                        <div className="text-[9px] text-muted-foreground uppercase">Stability Epoch</div>
                                                        <div className="text-xs font-mono">v{selectedPattern.id.split('-').pop()}.8.0</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Feature Attribution & Model Performance */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="md:col-span-2 bg-card/30 border-border/40">
                                            <CardHeader className="pb-3 border-b border-white/5">
                                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                    <BarChart3Icon className="h-3.5 w-3.5" /> Random Forest Feature Attribution
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="space-y-5">
                                                    {[
                                                        { label: 'Temporal Slope (Rate of Change)', val: 82, color: 'bg-primary' },
                                                        { label: 'Variance across 15-poll Window', val: 71, color: 'bg-blue-400' },
                                                        { label: 'Cross-Entity Synchronization', val: 54, color: 'bg-purple-400' },
                                                        { label: 'Metric-to-Device Dependency', val: 38, color: 'bg-emerald-400' },
                                                        { label: 'Historical Baseline Deviation', val: 26, color: 'bg-amber-400' }
                                                    ].map((feat, i) => (
                                                        <div key={i} className="space-y-1.5">
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="font-medium text-foreground/80">{feat.label}</span>
                                                                <span className="font-mono font-bold text-primary">{feat.val}% Importance</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div
                                                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", feat.color)}
                                                                    style={{ width: `${feat.val}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-primary/5 border-primary/20">
                                            <CardHeader className="pb-3 border-b border-primary/10">
                                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                                    <TerminalIcon className="h-3.5 w-3.5" /> Model Performance
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-6">
                                                {[
                                                    { label: 'Precision', val: 0.942 },
                                                    { label: 'Recall', val: 0.887 },
                                                    { label: 'F1-Score', val: 0.914 },
                                                    { label: 'Accuracy', val: 0.958 }
                                                ].map((stat, i) => (
                                                    <div key={i} className="flex justify-between items-center">
                                                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                                                        <span className="text-sm font-mono font-bold text-foreground">{(stat.val * 100).toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                                <div className="pt-4 mt-2 border-t border-primary/10">
                                                    <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter">Mining Runtime</div>
                                                    <div className="text-xs font-mono ">3.4s (optimized sub-loops)</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
