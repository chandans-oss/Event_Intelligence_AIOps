import React, { useMemo } from 'react';
import {
    Activity,
    Cpu,
    Database,
    Layers,
    Clock,
    TrendingUp,
    ChevronRight,
    BarChart3,
    CheckCircle2,
    Info,
    ShieldCheck,
    Zap,
    Network
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    ReferenceLine
} from 'recharts';
import { cn, formatMetricLabel } from '@/shared/lib/utils';

export type ExplainerMode = 'prediction' | 'anomaly' | 'pattern';

interface MLExplainabilityPanelProps {
    mode: ExplainerMode;
    data: {
        context: {
            device: string;
            interface: string;
            vendor: string;
            eventType: string;
            detectionType: string;
            timestamp: string;
        };
        metrics: Record<string, number | string>;
        windowConfig?: {
            pollInterval: number;
            windowSize: number;
        };
        features: Array<{ name: string; value: number }>;
        modelDecision: {
            model: string;
            details: any; // Votes for RF, Scores for Isolation Forest, etc.
            importance: Array<{ name: string; importance: number }>;
        };
        trainingMetadata: {
            datasetSize: number;
            featureCount: number;
            trainingDate: string;
            metrics: {
                accuracy: number;
                precision: number;
                recall: number;
                f1: number;
            };
        };
        pipeline: Array<{ stage: string; time: string; status: 'complete' | 'processing' | 'pending' }>;
    };
    onClose?: () => void;
}

export function MLExplainabilityPanel({ mode, data, onClose }: MLExplainabilityPanelProps) {
    const chartData = useMemo(() => {
        return data.modelDecision.importance.sort((a, b) => b.importance - a.importance).slice(0, 5);
    }, [data.modelDecision.importance]);

    return (
        <div className="flex flex-col gap-6 p-1 animate-in fade-in slide-in-from-right-4 duration-500">

            {/* Section 1: Context Information */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader className="py-3 px-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Contextual Intelligence
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider bg-primary/5 text-primary">
                            {data.context.detectionType}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                        <ContextItem label="Node Name" value={data.context.device} />
                        <ContextItem label="Target Interface" value={data.context.interface} />
                        <ContextItem label="Platform" value={data.context.vendor} />
                        <ContextItem label="Subject Event" value={data.context.eventType} />
                        <ContextItem label="Time Reference" value={data.context.timestamp} />
                        <ContextItem label="Discovery Method" value={mode.toUpperCase()} />
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Raw Telemetry Metrics */}
            <Card className="border-border/50 bg-card/40">
                <CardHeader className="py-3 px-4 border-b border-border/40">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Ingested Telemetry (T-0)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(data.metrics).map(([key, value]) => (
                            <div key={key} className="flex flex-col p-2.5 rounded-lg bg-secondary/30 border border-border/40">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{formatMetricLabel(key)}</span>
                                <span className="text-lg font-mono font-bold text-foreground">
                                    {value}{typeof value === 'number' && key.includes('pct') ? '%' : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Feature Engineering Window */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/40">
                    <CardHeader className="py-3 px-4 border-b border-border/40">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Layers className="h-4 w-4 text-amber-500" />
                            Feature Extraction Window
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase">
                            Sliding Window: {data.windowConfig?.windowSize || 15} polls ({data.windowConfig?.pollInterval || 5}m interval)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            {data.features.slice(0, 6).map((feat) => (
                                <div key={feat.name} className="flex items-center justify-between p-2 rounded bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                    <span className="text-xs font-medium text-muted-foreground">{formatMetricLabel(feat.name)}</span>
                                    <span className="text-xs font-mono font-bold text-foreground">{feat.value}</span>
                                </div>
                            ))}
                            <div className="text-[10px] text-center text-muted-foreground mt-2 ">
                                + {data.features.length - 6} more encoded features in vector
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Model Decision Explanation */}
                <Card className="border-border/50 bg-card/40 shadow-lg">
                    <CardHeader className="py-3 px-4 border-b border-border/40">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-emerald-500" />
                            Algorithmic Decision Path
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">{data.modelDecision.model} Analysis</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black tracking-tight text-foreground">
                                        {mode === 'prediction' ? `${Math.round(data.modelDecision.details.probability * 100)}%` :
                                            mode === 'anomaly' ? data.modelDecision.details.score :
                                                'Discovery'}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                        {mode === 'prediction' ? 'Predictive Confidence' :
                                            mode === 'anomaly' ? 'Anomaly Score' :
                                                'Pattern Established'}
                                    </span>
                                </div>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                                {data.modelDecision.model} Optimized
                            </Badge>
                        </div>

                        {/* Algorithm Specific Logic Display */}
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 text-[11px] space-y-2">
                            <p className="font-bold text-muted-foreground uppercase text-[9px]">Decision Logic Breakdown ({data.modelDecision.model})</p>

                            {mode === 'prediction' && data.modelDecision.model.includes('Forest') && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    <div>
                                        <span className="text-muted-foreground">Forest Votes ({data.modelDecision.details.totalTrees} Trees):</span>
                                        <div className="flex justify-between mt-1">
                                            <span>{data.context.eventType}:</span>
                                            <span className="font-bold text-primary">{data.modelDecision.details.votes?.[data.context.eventType] || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Normal Class:</span>
                                            <span className="font-bold">{data.modelDecision.details.votes?.['NORMAL'] || 0}</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-border/40 pl-4">
                                        <span className="text-muted-foreground">Probability Hub:</span>
                                        <div className="mt-1 font-mono text-xs">
                                            {data.modelDecision.details.votes?.[data.context.eventType]} / {data.modelDecision.details.totalTrees} = <span className="text-emerald-500">{data.modelDecision.details.probability}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === 'prediction' && data.modelDecision.model.includes('XGBoost') && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    <div>
                                        <span className="text-muted-foreground">Gradient Boosting Metrics:</span>
                                        <div className="flex justify-between mt-1">
                                            <span>Information Gain:</span>
                                            <span className="font-bold text-primary">{data.modelDecision.details.gain}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Feature Cover:</span>
                                            <span className="font-bold">{data.modelDecision.details.cover}</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-border/40 pl-4">
                                        <span className="text-muted-foreground">Logarithmic Odds:</span>
                                        <p className="mt-1 leading-tight  text-muted-foreground">
                                            Cumulative residuals across trees optimized for minimized objective loss function.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {mode === 'anomaly' && data.modelDecision.model.includes('Isolation') && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    <div>
                                        <span className="text-muted-foreground">Isolation Path Depth:</span>
                                        <div className="flex justify-between mt-1">
                                            <span>Observed Path:</span>
                                            <span className="font-bold text-amber-500">{data.modelDecision.details.pathLength}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Expected Path:</span>
                                            <span className="font-bold">{data.modelDecision.details.expectedPath}</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-border/40 pl-4">
                                        <span className="text-muted-foreground">Score Interpretation:</span>
                                        <p className="mt-1 leading-tight  text-muted-foreground">
                                            Short path length ({data.modelDecision.details.pathLength} &lt; {data.modelDecision.details.expectedPath}) indicates high sample isolation, confirming anomalous behavior.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {mode === 'anomaly' && data.modelDecision.model.includes('DBSCAN') && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    <div>
                                        <span className="text-muted-foreground">Density Clustering Param:</span>
                                        <div className="flex justify-between mt-1">
                                            <span>Epsilon (Radius):</span>
                                            <span className="font-bold text-primary">{data.modelDecision.details.eps}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Min Samples:</span>
                                            <span className="font-bold font-mono">{data.modelDecision.details.minSamples}</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-border/40 pl-4">
                                        <span className="text-muted-foreground">Cluster Assignment:</span>
                                        <div className="mt-1 text-xs px-2 py-1 rounded bg-background border border-primary/20 text-emerald-400">
                                            Core Point identified in Cluster {data.modelDecision.details.clusterId}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {mode === 'pattern' && data.modelDecision.model.includes('GNN') && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                    <div>
                                        <span className="text-muted-foreground">Topological Propagation:</span>
                                        <div className="flex justify-between mt-1">
                                            <span>Adjacency Weight:</span>
                                            <span className="font-bold text-emerald-400">{data.modelDecision.details.adjacencyWeight}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>GNN Layers:</span>
                                            <span className="font-bold font-mono">{data.modelDecision.details.layers} L</span>
                                        </div>
                                    </div>
                                    <div className="border-l border-border/40 pl-4">
                                        <span className="text-muted-foreground">Graph Attention:</span>
                                        <p className="mt-1 leading-tight  text-[10px] text-muted-foreground">
                                            Message-passing verified across {data.modelDecision.details.hops} topological hops.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {(mode === 'pattern' && !data.modelDecision.model.includes('GNN')) && (
                                <div className="space-y-1 animate-in fade-in duration-300">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Association Rule Mining Metrics:</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        <div className="bg-background/50 p-1.5 rounded text-center">
                                            <span className="block text-muted-foreground uppercase text-[8px]">Support</span>
                                            <span className="font-bold text-primary">{data.modelDecision.details.support}</span>
                                        </div>
                                        <div className="bg-background/50 p-1.5 rounded text-center">
                                            <span className="block text-muted-foreground uppercase text-[8px]">Confidence</span>
                                            <span className="font-bold text-emerald-500">{data.modelDecision.details.confidence}</span>
                                        </div>
                                        <div className="bg-background/50 p-1.5 rounded text-center">
                                            <span className="block text-muted-foreground uppercase text-[8px]">Lift Score</span>
                                            <span className="font-bold text-amber-500">{data.modelDecision.details.lift}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator className="bg-border/40" />

                        <div className="h-40 w-full">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Feature Attribution (Feature Importance)</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                                        width={100}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={index} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 5: Training Stats & Section 6: Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50 bg-card/40">
                    <CardHeader className="py-3 px-4 border-b border-border/40">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Model Training & Validation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-secondary/20">
                                <p className="text-[10px] text-muted-foreground uppercase mb-1">Training Dataset</p>
                                <p className="text-sm font-bold">{data.trainingMetadata.datasetSize.toLocaleString()} Windows</p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/20">
                                <p className="text-[10px] text-muted-foreground uppercase mb-1">Model Precision</p>
                                <p className="text-sm font-bold text-emerald-500">{Math.round(data.trainingMetadata.metrics.precision * 100)}%</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <MetricBar label="Accuracy Score" value={data.trainingMetadata.metrics.accuracy} />
                            <MetricBar label="F1 Score (Balanced)" value={data.trainingMetadata.metrics.f1} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/40 overflow-hidden">
                    <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/20">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary animate-pulse" />
                            Real-time Processing Pipeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-6">
                        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                            {data.pipeline.map((step, idx) => (
                                <div key={idx} className="relative flex items-center gap-4 group">
                                    <div className={cn(
                                        "absolute -left-6 w-3 h-3 rounded-full border-2 border-background z-10",
                                        step.status === 'complete' ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" :
                                            step.status === 'processing' ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" :
                                                "bg-muted-foreground/30"
                                    )} />
                                    <div className="flex-1 flex items-center justify-between">
                                        <span className={cn(
                                            "text-xs font-medium transition-colors",
                                            step.status === 'complete' ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {step.stage}
                                        </span>
                                        <span className="text-[10px] font-mono text-muted-foreground">{step.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ContextItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
            <span className="text-sm font-medium text-foreground truncate" title={value}>{value}</span>
        </div>
    );
}

function MetricBar({ label, value }: { label: string; value: number }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold">
                <span className="text-muted-foreground uppercase">{label}</span>
                <span className="text-foreground">{Math.round(value * 100)}%</span>
            </div>
            <Progress value={value * 100} className="h-1 bg-secondary" />
        </div>
    );
}
