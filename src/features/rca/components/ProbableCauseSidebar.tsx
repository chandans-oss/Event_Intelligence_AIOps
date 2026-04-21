
import { useState, useMemo } from 'react';
import { X, Brain, History as HistoryIcon, Wrench, ChevronRight, Database, GitBranch, Zap, BarChart3, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Cluster } from '@/shared/types';
import { getProbableCauses, ProbableCause, getClusterData, ClusterSpecificData } from '@/features/rca/data/clusterData';
import { cn } from '@/shared/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { RCASummary } from '@/features/rca/components/RcaSummary';
import { RCACorrelatedEvents } from '@/features/rca/components/RcaCorrelatedEvents';
import { RCADataEvidence } from '@/features/rca/components/RcaDataEvidence';
import { RCAImpactMap } from '@/features/rca/components/RcaImpactMap';
import { RCAAnalytics } from '@/features/rca/components/RcaAnalytics';
import { useNavigate, useLocation } from 'react-router-dom';

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
}

function CircularProgress({ value, size = 56, strokeWidth = 5 }: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const getColor = (val: number) => {
        if (val > 80) return 'stroke-emerald-500';
        if (val > 50) return 'stroke-amber-400';
        return 'stroke-blue-400';
    };

    const getTextColor = (val: number) => {
        if (val > 80) return 'text-emerald-400';
        if (val > 50) return 'text-amber-400';
        return 'text-blue-400';
    };

    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg className="rotate-[-90deg]" width={size} height={size}>
                <circle className="stroke-muted/20" strokeWidth={strokeWidth} fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
                <circle
                    className={cn('transition-all duration-700 ease-in-out', getColor(value))}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className={cn('absolute text-[11px] font-bold tabular-nums', getTextColor(value))}>{value}%</span>
        </div>
    );
}

interface ProbableCauseSidebarProps {
    cluster: Cluster;
    onClose: () => void;
    onSelectCause?: (causeId: string) => void;
    onOpenRemediation?: (causeId: string) => void;
}

const CONFIDENCE_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
    high: { label: 'High Confidence', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    medium: { label: 'Medium Confidence', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    low: { label: 'Low Confidence', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
};

function getConfidenceTier(confidence: number) {
    if (confidence > 0.8) return CONFIDENCE_LABELS.high;
    if (confidence > 0.5) return CONFIDENCE_LABELS.medium;
    return CONFIDENCE_LABELS.low;
}

export function ProbableCauseSidebar({ cluster, onClose, onOpenRemediation }: ProbableCauseSidebarProps) {
    const navigate = useNavigate();
    const causes = useMemo(() => cluster?.id ? getProbableCauses(cluster.id) : [], [cluster]);
    // Map cause ID -> cluster data (before early return to respect hooks rules)
    const causeDataMap: Record<string, ClusterSpecificData | undefined> = useMemo(() => {
        if (!cluster?.id) return {};
        const map: Record<string, ClusterSpecificData | undefined> = {};
        causes.forEach(cause => {
            map[cause.id] = getClusterData(cause.id) || getClusterData(cluster.id);
        });
        return map;
    }, [causes, cluster?.id]);
    const location = useLocation();
    const [selectedCauseIndex, setSelectedCauseIndex] = useState(
        (location.state as any)?.causeIndex ?? 0
    );
    const [activeTab, setActiveTab] = useState(
        (location.state as any)?.activeTab ?? 'summary'
    );

    if (!cluster) return null;

    const selectedCause = causes[selectedCauseIndex];

    const activeData = selectedCause ? (causeDataMap[selectedCause.id] || null) : null;

    const TABS = [
        { id: 'summary', label: 'RCA Summary', icon: Target },
        { id: 'evidence', label: 'Data Evidence', icon: Database },
        { id: 'correlated', label: 'Correlated Events', icon: GitBranch },
        { id: 'impact', label: 'Impact', icon: Zap },
        { id: 'analytics', label: 'RCA Analytics', icon: BarChart3 },
    ];

    return (
        <div className="fixed inset-y-0 right-0 w-[90%] max-w-[1300px] bg-background border-l border-border shadow-2xl z-50 animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/50 backdrop-blur shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                        <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-foreground">Root Cause Analysis</h2>
                        <p className="text-xs text-muted-foreground font-mono">{cluster.id}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* ── RCA Cards Section ── */}
                <div className="px-5 pt-4 pb-3 bg-gradient-to-b from-card/30 to-transparent border-b border-border">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {causes.map((cause, index) => {
                            const pct = Math.round(cause.confidence * 100);
                            const tier = getConfidenceTier(cause.confidence);
                            const isSelected = selectedCauseIndex === index;
                            const isPrimary = index === 0;

                            return (
                                <div
                                    key={cause.id}
                                    className={cn(
                                        'group relative rounded-xl border bg-card transition-all duration-300 cursor-pointer flex flex-col overflow-hidden',
                                        isSelected
                                            ? 'border-primary shadow-lg shadow-primary/15 ring-1 ring-primary/30'
                                            : 'border-border hover:border-primary/40 hover:shadow-md',
                                        isPrimary && !isSelected && 'border-primary/25'
                                    )}
                                    onClick={() => {
                                        setSelectedCauseIndex(index);
                                        setActiveTab('summary');
                                    }}
                                >
                                    {/* Selected indicator top strip */}
                                    <div className={cn(
                                        'h-0.5 w-full transition-all duration-300',
                                        isSelected ? 'bg-primary' : 'bg-transparent'
                                    )} />

                                    {/* Gradient overlay */}
                                    <div className={cn(
                                        'absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent transition-opacity duration-300',
                                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                    )} />

                                    <div className="relative p-4 flex flex-col h-full gap-3">
                                        {/* Top: rank badge + confidence circle */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={cn(
                                                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border',
                                                        tier.bg, tier.color, tier.border
                                                    )}>
                                                        #{index + 1} · {tier.label}
                                                    </span>
                                                </div>
                                                <h3 className={cn(
                                                    'text-[13px] font-bold leading-snug transition-colors',
                                                    isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'
                                                )}>
                                                    {cause.title}
                                                </h3>
                                            </div>
                                            <CircularProgress value={pct} size={52} strokeWidth={5} />
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                                            {cause.description}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50 gap-2">
                                            <div className="flex items-center gap-2">
                                                {cause.occurrenceCount !== undefined && (
                                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground text-[10px] font-semibold border border-border/50">
                                                        <HistoryIcon className="h-2.5 w-2.5" />
                                                        {cause.occurrenceCount} occurrences

                                                    </div>
                                                )}
                                                <Badge variant="outline" className={cn('text-[9px] h-4 px-1.5 border', tier.border, tier.color)}>
                                                    {cause.severity}
                                                </Badge>
                                            </div>

                                            {/* Remediate Button */}
                                            <Button
                                                size="sm"
                                                className={cn(
                                                    'h-7 text-[11px] px-2.5 gap-1 font-semibold shrink-0',
                                                    'bg-emerald-600 hover:bg-emerald-700 text-white shadow shadow-emerald-500/20'
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onOpenRemediation) onOpenRemediation(cause.id);
                                                }}
                                            >
                                                <Wrench className="h-3 w-3" />
                                                Remediate
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Common Analysis Tabs ── */}
                {activeData ? (
                    <div className="px-5 pt-4 pb-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            {/* Tab Navigation */}
                            <div className="border-b border-border -mx-5 px-5 mb-4 sticky top-0 bg-background/95 backdrop-blur z-10">
                                <TabsList className="h-11 w-full grid grid-cols-5 bg-transparent p-0">
                                    {TABS.map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <TabsTrigger
                                                key={tab.id}
                                                value={tab.id}
                                                className="h-11 w-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none text-muted-foreground text-[12px] font-medium gap-1.5 transition-all flex items-center justify-center"
                                            >
                                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                                {tab.label}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                            </div>

                            <TabsContent value="summary" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
                                <RCASummary
                                    data={activeData}
                                    confidence={selectedCause?.confidence || 0.9}
                                    onViewDetailedRCA={() => navigate(`/rca/detail/${activeData.clusterId}`, {
                                        state: { fromCauseIndex: selectedCauseIndex, fromTab: activeTab, fromClusterId: cluster.id }
                                    })}
                                />
                            </TabsContent>

                            <TabsContent value="evidence" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
                                <RCADataEvidence data={activeData} />
                            </TabsContent>

                            <TabsContent value="correlated" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
                                <RCACorrelatedEvents data={activeData} />
                            </TabsContent>

                            <TabsContent value="impact" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
                                <RCAImpactMap data={activeData} />
                            </TabsContent>

                            <TabsContent value="analytics" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
                                <RCAAnalytics data={activeData} />
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3 px-5">
                        <AlertTriangle className="h-10 w-10 opacity-30" />
                        <p className="text-sm">No detailed data available for this probable cause.</p>
                    </div>
                )}
            </div>
        </div >
    );
}
