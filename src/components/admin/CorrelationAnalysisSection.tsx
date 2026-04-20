
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RefreshCw, ArrowRightLeft, Activity, Network, TrendingUp, AlertTriangle, GitCompare } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useToast } from '@/shared/hooks/use-toast';

type ScenarioType = 'baseline' | 'congestion';

interface MetricPoint {
    time: string;
    timestamp: number;
    utilization: number; // %
    latency: number; // ms
    drops: number; // count
    cpu: number; // %
    event?: string;
}

const generateData = (scenario: ScenarioType, seed: number): MetricPoint[] => {
    const points: MetricPoint[] = [];
    const now = Date.now();

    for (let i = 0; i < 30; i++) {
        const time = new Date(now - (29 - i) * 60000);
        const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Random noise factor based on seed
        const noise = () => (Math.random() - 0.5) * 5;

        let utilization = 40 + noise();
        let latency = 20 + noise();
        let drops = 0;
        let cpu = 30 + noise();
        let event: string | undefined = undefined;

        if (scenario === 'congestion') {
            // Congestion ramp up from t=10 to t=20
            if (i > 9) {
                utilization += (i - 9) * 4; // Ramps to ~100%
            }
            if (utilization > 95) utilization = 98 + Math.random();

            // Drops start when util > 80
            if (utilization > 85) {
                drops = Math.floor((utilization - 80) * 10 + noise() * 2);
                if (drops < 0) drops = 0;
            }

            // Latency correlates with drops/utilization
            if (utilization > 70) {
                latency += (utilization - 70) * 2 + drops * 0.5;
            }

            // CPU correlates with utilization loosely
            cpu = utilization * 0.8 + 10 + noise();

            // Events
            if (i === 10) event = 'Traffic Spike';
            if (i === 20 && drops > 0) event = 'Queue Full';
        } else {
            // Baseline occasional spikes
            if (i === 15) {
                utilization += 20;
                latency += 10;
            }
        }

        points.push({
            time: timeStr,
            timestamp: time.getTime(),
            utilization: Math.max(0, Math.min(100, utilization)),
            latency: Math.max(0, latency),
            drops: Math.max(0, drops),
            cpu: Math.max(0, Math.min(100, cpu)),
            event
        });
    }
    return points;
};

const calculateCorrelation = (data: MetricPoint[], key1: keyof MetricPoint, key2: keyof MetricPoint): number => {
    const n = data.length;
    let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;

    for (const p of data) {
        const v1 = p[key1] as number;
        const v2 = p[key2] as number;
        sum1 += v1;
        sum2 += v2;
        sum1Sq += v1 * v1;
        sum2Sq += v2 * v2;
        pSum += v1 * v2;
    }

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    if (den === 0) return 0;
    return num / den;
};

export function CorrelationAnalysisSection() {
    const [scenario, setScenario] = useState<ScenarioType>('baseline');
    const [seed, setSeed] = useState(1);
    const [compareMode, setCompareMode] = useState(false);
    const { toast } = useToast();

    const handleCompareChange = (checked: boolean) => {
        setCompareMode(checked);
        toast({
            title: checked ? 'Comparison Mode Enabled' : 'Comparison Mode Disabled',
            description: `Visual comparison of metrics is now ${checked ? 'active' : 'inactive'}.`,
            variant: checked ? 'success' : 'destructive',
        });
    };

    // Current Data
    const data = useMemo(() => generateData(scenario, seed), [scenario, seed]);

    // Comparison Data (Baseline vs Congestion usually)
    const compareData = useMemo(() => generateData(scenario === 'baseline' ? 'congestion' : 'baseline', seed), [scenario, seed]);

    const correlations = useMemo(() => [
        { pair: ['Utilization', 'Latency'], val: calculateCorrelation(data, 'utilization', 'latency') },
        { pair: ['Utilization', 'Drops'], val: calculateCorrelation(data, 'utilization', 'drops') },
        { pair: ['Latency', 'Drops'], val: calculateCorrelation(data, 'latency', 'drops') },
        { pair: ['CPU', 'Utilization'], val: calculateCorrelation(data, 'cpu', 'utilization') },
    ], [data]);

    const compareCorrelations = useMemo(() => [
        { pair: ['Utilization', 'Latency'], val: calculateCorrelation(compareData, 'utilization', 'latency') },
        { pair: ['Utilization', 'Drops'], val: calculateCorrelation(compareData, 'utilization', 'drops') },
        { pair: ['Latency', 'Drops'], val: calculateCorrelation(compareData, 'latency', 'drops') },
        { pair: ['CPU', 'Utilization'], val: calculateCorrelation(compareData, 'cpu', 'utilization') },
    ], [compareData]);

    const regenerate = () => setSeed(s => s + 1);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-card/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Metric Correlation Analysis
                    </h2>
                    <p className="text-xs text-muted-foreground">Detect hidden relationships between metrics and events.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Scenario Selector */}
                    <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium text-muted-foreground">Scenario:</Label>
                        <Select value={scenario} onValueChange={(v) => setScenario(v as ScenarioType)}>
                            <SelectTrigger className="h-8 w-[180px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="baseline">Normal Traffic (Baseline)</SelectItem>
                                <SelectItem value="congestion">Link Congestion (Incident)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-8 w-px bg-border/60 mx-1 hidden md:block" />

                    {/* Metrics Badges - Compact */}
                    <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">Utilization</Badge>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">Latency</Badge>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">Drops</Badge>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">CPU</Badge>
                    </div>

                    <div className="h-8 w-px bg-border/60 mx-1 hidden md:block" />

                    {/* Compare Switch */}
                    <div className="flex items-center gap-2 bg-secondary/30 px-2 h-8 rounded-md border border-border/50">
                        <Switch id="compare" checked={compareMode} onCheckedChange={handleCompareChange} className="scale-75 origin-left" />
                        <Label htmlFor="compare" className="cursor-pointer text-xs font-medium whitespace-nowrap -ml-1">
                            Compare
                        </Label>
                    </div>

                    {/* Regenerate Button */}
                    <Button variant="outline" size="sm" onClick={regenerate} className="h-8 text-xs gap-1.5">
                        <RefreshCw className="h-3 w-3" /> <span className="hidden sm:inline">Regenerate</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Main Chart Area - Full Width */}
                <Card className="md:col-span-4 border-none shadow-none bg-transparent">
                    <CardHeader className="px-0 pt-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                Time Series Correlation
                                {compareMode && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        — Comparing <span className="font-medium text-primary">{scenario === 'baseline' ? 'Baseline' : 'Congestion'}</span> (Current) vs <span className="font-medium text-primary">{scenario === 'baseline' ? 'Congestion' : 'Baseline'}</span>
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs">Visualizing metric divergence during {scenario} scenario.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="h-[400px] w-full bg-card rounded-xl border border-border/50 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#888' }} interval={4} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} label={{ value: 'Util % / CPU %', angle: -90, position: 'insideLeft', style: { fill: '#666', fontSize: 10 } }} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} label={{ value: 'Latency / Drops', angle: 90, position: 'insideRight', offset: 10, style: { fill: '#666', fontSize: 10 } }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                        labelStyle={{ color: '#666', marginBottom: '4px' }}
                                    />
                                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                                    <Area yAxisId="left" type="monotone" dataKey="utilization" fill="hsl(var(--primary))" fillOpacity={0.1} stroke="hsl(var(--primary))" strokeWidth={2} name="Utilization %" activeDot={{ r: 4 }} />
                                    <Line yAxisId="left" type="monotone" dataKey="cpu" stroke="#82ca9d" strokeDasharray="5 5" strokeWidth={1.5} name="CPU %" dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#ff7300" strokeWidth={1.5} name="Latency (ms)" dot={false} />
                                    <Line yAxisId="right" type="step" dataKey="drops" stroke="#ef4444" strokeWidth={1.5} name="Packet Drops" dot={false} />

                                    {/* Event Annotations */}
                                    {data.map((d, i) => d.event ? (
                                        <ReferenceLine key={i} yAxisId="left" x={d.time} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: d.event, position: 'top', fill: '#ef4444', fontSize: 9, fontWeight: 600 }} />
                                    ) : null)}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Correlation Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={cn(compareMode ? "md:col-span-1" : "md:col-span-2")}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Detected Correlations ({scenario})</span>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {correlations.map((c, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Network className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{c.pair[0]} <span className="text-muted-foreground mx-1">vs</span> {c.pair[1]}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", Math.abs(c.val) > 0.7 ? "bg-primary" : "bg-muted-foreground/30")}
                                                style={{ width: `${Math.abs(c.val) * 100}%` }}
                                            />
                                        </div>
                                        <Badge variant={Math.abs(c.val) > 0.8 ? "default" : "outline"} className="w-16 justify-center">
                                            {c.val.toFixed(2)}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {compareMode && (
                    <Card className="md:col-span-1 border-primary/20 bg-primary/5 animate-in slide-in-from-right-4">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Comparison ({scenario === 'baseline' ? 'Congestion' : 'Baseline'})</span>
                                <GitCompare className="h-4 w-4 text-primary" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {compareCorrelations.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-primary/10 bg-background/50">
                                        <div className="flex items-center gap-3">
                                            <Network className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">{c.pair[0]} vs {c.pair[1]}</span>
                                        </div>
                                        <Badge variant={Math.abs(c.val) > 0.8 ? "default" : "outline"} className="w-16 justify-center">
                                            {c.val.toFixed(2)}
                                        </Badge>
                                    </div>
                                ))}

                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
