import { useState } from 'react';
import { Search, BrainCircuit, Activity, Clock, ShieldCheck, Calendar } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { useToast } from '@/shared/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { formatMetricLabel as formatLabel } from '@/shared/lib/utils';
import { Pattern, MOCK_PATTERNS } from '@/features/analytics/data/patternData';

// Local formatLabel removed, using centralized formatMetricLabel via import

interface PatternGalleryProps {
    onSelectPattern: (pattern: Pattern) => void;
}

export function PatternGallery({ onSelectPattern }: PatternGalleryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [enabledPatterns, setEnabledPatterns] = useState<Record<string, boolean>>(
        () => Object.fromEntries(MOCK_PATTERNS.map(p => [p.id, true]))
    );

    const handleTogglePattern = (id: string, name: string, currentStatus: boolean) => {
        const nextStatus = !currentStatus;
        setEnabledPatterns(prev => ({ ...prev, [id]: nextStatus }));
        toast({
            title: `Pattern ${nextStatus ? 'Enabled' : 'Disabled'}`,
            description: `${name} has been ${nextStatus ? 'activated' : 'deactivated'}.`,
            variant: nextStatus ? 'success' : 'destructive',
        });
    };

    const filteredPatterns = MOCK_PATTERNS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Correlation Patterns
                    </h1>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patterns..."
                            className="pl-9 bg-card/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md border border-border/50 bg-card/40 overflow-y-auto h-[max(50vh,600px)] custom-scrollbar">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px] text-[12px] font-bold text-foreground/80">Pattern Name</TableHead>
                            <TableHead className="w-[450px] text-[12px] font-bold text-foreground/80">Details</TableHead>
                            <TableHead className="text-[12px] font-bold text-foreground/80">Domain</TableHead>
                            <TableHead className="text-[12px] font-bold text-foreground/80 whitespace-nowrap">Rule Creation Date</TableHead>
                            <TableHead className="text-[12px] font-bold text-foreground/80">Confidence</TableHead>
                            <TableHead className="text-[12px] font-bold text-foreground/80">Occurrences</TableHead>
                            <TableHead className="text-[12px] font-bold text-foreground/80">Last Seen</TableHead>
                            <TableHead className="text-right text-[12px] font-bold text-foreground/80">Active</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatterns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No patterns found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPatterns.map((pattern) => (
                                <TableRow
                                    key={pattern.id}
                                    className="cursor-pointer hover:bg-muted/5 transition-colors group"
                                    onClick={() => onSelectPattern(pattern)}
                                >
                                    <TableCell className="py-2 pl-4">
                                        <span className="text-[13px] font-medium text-foreground/90 tracking-tight">
                                            {pattern.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2 px-3 py-1.5 font-mono text-[12px]">
                                            {(() => {
                                                const visibleSteps = pattern.steps.filter(s => s.name !== 'Critical Breach');

                                                return (
                                                    <>
                                                        {/* Behavioral Steps */}
                                                        {visibleSteps.map((step, idx) => {
                                                            const isFailure = /flap|down|reboot|withdrawal|collapse|breach|outage|unresponsive|sla/i.test(step.name) && !/flapping/i.test(step.name);
                                                            const isCritical = /loss|drop|jitter|latency|timeout|intermittent|missed|flapping|mismatch/i.test(step.name);

                                                            let textColor = 'text-indigo-200/90';
                                                            if (isFailure) textColor = 'text-rose-400 font-bold';
                                                            else if (isCritical) textColor = 'text-orange-400 font-bold';

                                                            const isAbsoluteLast = idx === visibleSteps.length - 1;

                                                            return (
                                                                <div key={`step-${idx}`} className="flex items-center gap-1.5">
                                                                    <span className={`${textColor}`}>
                                                                        {formatLabel(step.name)}
                                                                    </span>
                                                                    {!isAbsoluteLast && (
                                                                        <span className="text-primary/50 font-bold">{'->'}</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-middle py-1">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground/30" />
                                            <span className="text-[13px] font-medium text-muted-foreground">{pattern.domain}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-middle py-1">
                                        <div className="flex items-center gap-2 text-muted-foreground/60">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="text-[12px] font-medium">{pattern.ruleCreationDate}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-middle py-1">
                                        <div className="flex items-center gap-2">
                                            <BrainCircuit className="h-4 w-4 text-primary/40" />
                                            <span className="text-[14px] font-bold text-primary/90">{(pattern.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-middle py-1">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-muted-foreground/30" />
                                            <span className="text-[13px] font-bold text-muted-foreground">{pattern.seenCount}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-middle py-1">
                                        <div className="flex items-center gap-2 text-muted-foreground/60">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span className="text-[12px] font-medium">{pattern.lastSeen}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right align-middle py-1 pr-6" onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            checked={enabledPatterns[pattern.id] ?? true}
                                            onCheckedChange={() => handleTogglePattern(pattern.id, pattern.name, !!enabledPatterns[pattern.id])}
                                            className="h-4 w-8"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
