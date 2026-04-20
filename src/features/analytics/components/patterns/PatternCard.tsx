
import { motion } from 'framer-motion';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    BrainCircuit,
    Activity,
    TrendingUp,
    Eye,
    ArrowRight
} from 'lucide-react';
import { Pattern } from '@/features/analytics/data/patternData';

interface PatternCardProps {
    pattern: Pattern;
    onClick: (pattern: Pattern) => void;
}

export function PatternCard({ pattern, onClick }: PatternCardProps) {
    return (
        <motion.div
            layoutId={`card-${pattern.id}`}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card
                className="h-full cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden group border-border/60 bg-card/40 backdrop-blur-sm"
                onClick={() => onClick(pattern)}
            >
                <div className={`h-1 w-full ${pattern.severity === 'Critical' ? 'bg-red-500' :
                    pattern.severity === 'Major' ? 'bg-orange-500' :
                        'bg-amber-500'
                    }`} />

                <CardHeader className="pb-2 pt-4">
                    <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider bg-background/50">
                            {pattern.domain}
                        </Badge>
                        {pattern.status === 'Learning' && (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-[10px]">
                                Learning
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {pattern.name}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 min-h-[40px]">
                        {pattern.description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                    {/* Visual Signature Mini-View */}
                    {/* Visual Signature Mini-View */}
                    <div className="w-full overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-secondary/50 scrollbar-track-transparent">
                        <div className="flex items-center gap-2 min-w-max px-0.5">
                            {pattern.steps.map((step, idx) => {
                                const isFailure = /flap|down|reboot|withdrawal|collapse|breach|outage|unresponsive|sla/i.test(step.name) && !/flapping/i.test(step.name);
                                const isCritical = /loss|drop|jitter|latency|timeout|intermittent|missed|flapping|mismatch/i.test(step.name);

                                return (
                                    <div key={idx} className="flex items-center">
                                        <span className={`px-2 py-1 rounded text-[10px] border whitespace-nowrap transition-colors ${isFailure
                                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold'
                                                : isCritical
                                                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 font-bold'
                                                    : 'bg-secondary/50 border-border/50 text-muted-foreground'
                                            }`}>
                                            {step.name}
                                        </span>
                                        {idx < pattern.steps.length - 1 && (
                                            <ArrowRight className="h-3 w-3 mx-1 opacity-50 flex-shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-secondary/20 rounded p-2 border border-border/50">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Confidence</div>
                            <div className="flex items-center gap-1.5">
                                <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold text-sm">{(pattern.confidence * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                        <div className="bg-secondary/20 rounded p-2 border border-border/50">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Seen</div>
                            <div className="flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold text-sm">{pattern.seenCount} times</span>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-2 pb-4 text-[10px] text-muted-foreground flex justify-between items-center border-t border-border/30 bg-secondary/5">
                    <span>Applies to: {pattern.appliesTo.join(', ')}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-primary font-medium">
                        View Details <ArrowRight className="h-3 w-3" />
                    </span>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
