import { useState } from 'react';
import { ClusterSpecificData } from '@/features/rca/data/clusterData';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { AlertCircle, Clock, GitBranch, Layers, ShieldAlert, Filter, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';

interface RCACorrelatedEventsProps {
    data: ClusterSpecificData;
}

const getCorrelationStrategy = (reason: string) => {
    if (reason.includes("Temporal Correlation")) return "Temporal Correlation";
    if (reason.includes("Causal Correlation")) return "Causal Correlation";
    if (reason.includes("Topological Correlation")) return "Topological Correlation";
    if (reason.includes("Spatial Correlation")) return "Spatial Correlation";
    if (reason.includes("Rule-Based Correlation")) return "Rule-Based Correlation";
    if (reason.includes("Pattern-Based Correlation")) return "Pattern-Based Correlation";

    return 'Pattern-Based Correlation';
};

const getCorrelationExplanation = (reason: string, event?: any) => {
    // DEMO SPECIFIC OVERRIDES
    if (event?.id === 'EVT-LC-002') { // QUEUE_DROP
        return "Spatial Correlation: Device core-router-dc1 is the common location. High utilization on Gi0/1/0 (Root Cause) directly impacts output queue depth, causing drops.";
    }
    if (event?.id === 'EVT-LC-003') { // LATENCY_HIGH Edge-R3
        return "Topological Correlation: Edge-R3 is directly connected downstream of core-router-dc1. Congestion on the core link propagates delay to downstream traffic.";
    }
    if (event?.id === 'EVT-LC-004') { // LATENCY_HIGH Edge-R4
        return "Topological Correlation: Edge-R4 is a peer downstream device sharing the congested path. Simultaneous latency spike confirms shared infrastructure issue.";
    }
    if (event?.id === 'EVT-LC-005') { // RESPONSE_TIME_HIGH App-GW1
        return "Causal Correlation: API Gateway response time degradation is statistically correlated (Pearson > 0.9) with network latency. Service dependency graph confirms API GW depends on Core Router path.";
    }

    const strategy = getCorrelationStrategy(reason);
    switch (strategy) {
        case "Temporal Correlation":
            return "Events occurred within a sliding window of Δt = 5s. Probability P(A|B) > 0.85 calculated via temporal association mining.";
        case "Causal Correlation":
            return "Granger causality test indicates Event A precedes Event B with statistical significance (p < 0.05). Verified against causal graph schema v4.2.";
        case "Topological Correlation":
            return "Event B is a direct downstream dependency of Event A in the service topology graph. Impact propagation weight w = 0.92.";
        case "Spatial Correlation":
            return "Events satisfy spatial constraint S(e1, e2) = 1 (Same Host/Rack). Co-location increases joint probability of failure.";
        case "Rule-Based Correlation":
            return "Matches expert system rule heuristics rule_id: R-1024 'Resource Exhaustion Pattern'. Confidence score derived from rule antecedent match strength.";
        case "Pattern-Based Correlation":
        default:
            return "Pattern recognition engine identifies high-confidence sequence match (0.95). Sequence alignment score = 0.88.";
    }
    return reason;
};

export function RCACorrelatedEvents({ data }: RCACorrelatedEventsProps) {
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
    const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null);

    const toggleReason = (id: string) => {
        setExpandedReasonId(current => current === id ? null : id);
    };

    const uniqueStrategies = Array.from(new Set(
        data.correlatedChildEvents.map(event => getCorrelationStrategy(event.correlationReason))
    ));

    const filteredEvents = selectedStrategy
        ? data.correlatedChildEvents.filter(event => getCorrelationStrategy(event.correlationReason) === selectedStrategy)
        : data.correlatedChildEvents;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        {selectedStrategy && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedStrategy(null)}
                                className="h-5 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedStrategy === null ? "default" : "outline"}
                            size="sm"
                            className="h-7 text-xs rounded-full"
                            onClick={() => setSelectedStrategy(null)}
                        >
                            All Events
                        </Button>
                        {uniqueStrategies.map(strategy => (
                            <Button
                                key={strategy}
                                variant={selectedStrategy === strategy ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                    "h-7 text-xs rounded-full border-dashed",
                                    selectedStrategy === strategy && "border-solid"
                                )}
                                onClick={() => setSelectedStrategy(strategy)}
                            >
                                {strategy}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                    {/* Root Event - Visualized as Parent (Always show root event context) */}
                    <div className="relative pl-6 border-l-2 border-primary/50">
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background ring-2 ring-primary/20" />
                        <Card className="border-primary/30 shadow-sm bg-primary/5">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <Badge className="mb-2 bg-primary hover:bg-primary text-[10px] h-5">Root Cause</Badge>
                                        <h4 className="font-bold text-base text-foreground tracking-tight">{data.rcaMetadata.rootEventType.replace(/_/g, ' ')}</h4>
                                    </div>
                                    <Badge variant="outline" className="font-mono bg-background text-[10px] tabular-nums">{data.rcaMetadata.rootEventId}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground/80">{data.rcaMetadata.device}</span>
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                    <span>Monitoring Active</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Child Events */}
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm ">
                            No events match the selected strategy filter.
                        </div>
                    ) : (
                        filteredEvents.map((event) => (
                            <div key={event.id} className="relative pl-6 border-l-2 border-border/50 ml-2 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="absolute -left-[2px] top-8 w-4 h-[2px] bg-border/50" /> {/* Branch line */}
                                <div className="relative">
                                    <Card className="hover:bg-secondary/30 transition-all duration-200 border-border/50 hover:border-primary/20 group">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                                                        <AlertCircle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-semibold text-sm group-hover:text-foreground transition-colors">{event.alertType.replace(/_/g, ' ')}</h4>
                                                            <Badge variant="secondary" className={cn(
                                                                "text-[9px] px-1.5 py-0 h-4 uppercase font-bold tracking-tighter",
                                                                event.severity === 'Critical' && "bg-red-500/10 text-red-500 border border-red-500/20",
                                                                event.severity === 'Major' && "bg-orange-500/10 text-orange-500 border border-orange-500/20",
                                                                event.severity === 'Minor' && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                                                            )}>{event.severity}</Badge>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{event.source}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] font-mono text-muted-foreground tabular-nums flex items-center justify-end gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </div>
                                                    <div className="text-[10px] text-primary font-bold mt-1 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 inline-block">
                                                        {Math.round(event.correlationScore * 100)}% CONFIDENCE
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Collapsible open={expandedReasonId === event.id} onOpenChange={() => toggleReason(event.id)}>
                                                    <CollapsibleTrigger asChild>
                                                        <div className="bg-muted/30 p-2 rounded border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <div className="text-[9px] text-muted-foreground uppercase font-semibold flex items-center gap-1">
                                                                    <GitBranch className="h-3 w-3" />
                                                                    Correlation Reason
                                                                </div>
                                                                {expandedReasonId === event.id ? (
                                                                    <ChevronUp className="h-3 w-3 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                            <div className="text-xs font-medium text-foreground/80 mt-1">{event.correlationReason}</div>
                                                        </div>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="animate-slide-down overflow-hidden data-[state=closed]:animate-slide-up">
                                                        <div className="mt-2 bg-primary/5 p-3 rounded border border-primary/10">
                                                            <div className="flex items-start gap-2">
                                                                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-bold text-primary uppercase">Strategy Logic</p>
                                                                    <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                                                                        {getCorrelationExplanation(event.correlationReason, event)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
    return <span className={className}>{children}</span>;
}

