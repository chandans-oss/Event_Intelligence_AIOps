import { ClusterSpecificData } from '@/features/rca/data/clusterData';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowDown, BrainCircuit, Lightbulb, CheckCircle2 } from 'lucide-react';

interface RCADiagnosisPathProps {
    data: ClusterSpecificData;
}

export function RCADiagnosisPath({ data }: RCADiagnosisPathProps) {
    return (
        <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-primary" />
                        AI Reasoning Engine
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground">
                        The system analyzed <span className="font-bold">1,405</span> signals and rejected <span className="font-bold">2</span> alternative hypotheses before concluding <span className="font-bold">{data.rcaMetadata.rootEventType.replace(/_/g, ' ')}</span> with <span className="font-bold">94%</span> confidence.
                    </p>
                </CardContent>
            </Card>

            <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-0 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border" />

                    {data.rcaProcessSteps.map((step, index) => (
                        <div key={step.id} className="relative pl-14 pb-8 last:pb-0">
                            {/* Icon Node */}
                            <div className="absolute left-3 top-0 w-6 h-6 rounded-full bg-background border-2 border-primary z-10 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>

                            <Card className="relative hover:shadow-md transition-shadow">
                                <CardHeader className="py-3 bg-secondary/20">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-bold">{step.name}</CardTitle>
                                        <Badge variant="outline" className="text-xs">{step.details.duration}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-sm text-muted-foreground">{step.description}</p>

                                    <div className="bg-secondary/30 p-3 rounded-lg text-xs space-y-2">
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-primary min-w-[60px]">Input:</span>
                                            <span>{step.details.input.join(', ')}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-primary min-w-[60px]">Reasoning:</span>
                                            <span>{step.details.processing}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="font-semibold text-status-success min-w-[60px]">Output:</span>
                                            <span className="font-medium text-foreground">{step.details.output}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {index < data.rcaProcessSteps.length - 1 && (
                                <div className="absolute left-[-15px] bottom-[-20px] hidden">
                                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
