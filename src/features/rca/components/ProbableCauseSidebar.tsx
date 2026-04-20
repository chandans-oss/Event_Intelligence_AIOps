
import { useState, useMemo } from 'react';
import { X, ArrowRight, Brain, AlertTriangle, Target, LineChart, ShieldCheck, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Cluster } from '@/shared/types';
import { getProbableCauses, ProbableCause } from '@/features/rca/data/clusterData';
import { cn } from '@/shared/lib/utils';

interface CircularProgressProps {
    value: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

interface ProbableCauseSidebarProps {
    cluster: Cluster;
    onClose: () => void;
    onSelectCause: (causeId: string) => void;
}

function CircularProgress({ value, size = 48, strokeWidth = 5, className }: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const getColor = (val: number) => {
        if (val > 80) return "stroke-status-success";
        if (val > 50) return "stroke-yellow-500";
        return "stroke-muted-foreground/50";
    };

    const getTextColor = (val: number) => {
        if (val > 80) return "text-status-success";
        if (val > 50) return "text-yellow-500";
        return "text-muted-foreground";
    };

    return (
        <div className={cn("relative flex items-center justify-center shrink-0", className)} style={{ width: size, height: size }}>
            <svg className="rotate-[-90deg]" width={size} height={size}>
                {/* Background Circle */}
                <circle
                    className="stroke-muted/20"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <circle
                    className={cn("transition-all duration-500 ease-in-out", getColor(value))}
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
            <span className={cn("absolute text-[10px] font-bold", getTextColor(value))}>
                {value}%
            </span>
        </div>
    );
}

export function ProbableCauseSidebar({ cluster, onClose, onSelectCause }: ProbableCauseSidebarProps) {
    const causes = useMemo(() => cluster?.id ? getProbableCauses(cluster.id) : [], [cluster]);

    if (!cluster) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[85%] max-w-[1200px] bg-background border-l border-border shadow-2xl z-50 animate-slide-in-right flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                        <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Root Causes Analysis</h2>
                        <p className="text-sm text-muted-foreground font-mono">{cluster.id}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-6">
                    {causes.map((cause, index) => (
                        <div
                            key={cause.id}
                            className={cn(
                                "group relative overflow-hidden rounded-xl border border-border bg-card p-1 transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer flex flex-col h-full",
                                index === 0 && cluster.status !== 'Resolved' && "border-primary/40 shadow-md ring-1 ring-primary/20"
                            )}
                            onClick={() => onSelectCause(cause.id)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative p-5 space-y-4 flex flex-col h-full">
                                <div className="flex justify-between items-start gap-4 flex-1">
                                    <div className="space-y-1.5 flex-1">
                                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">{cause.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{cause.description}</p>

                                        {cause.occurrenceCount !== undefined && (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider mt-2 border border-primary/10">
                                                <HistoryIcon className="h-3 w-3" />
                                                <span>{cause.occurrenceCount} Occurrences</span>
                                            </div>
                                        )}
                                    </div>
                                    <CircularProgress value={Math.round(cause.confidence * 100)} />
                                </div>

                                <div className="flex items-center justify-end pt-3 mt-auto border-t border-border/50">
                                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2 ml-auto group-hover:bg-primary group-hover:text-primary-foreground group/btn">
                                        Analyze <ChevronRight className="ml-1 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
