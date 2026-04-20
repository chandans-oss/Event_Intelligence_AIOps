import { ClusterSpecificData } from '@/features/rca/data/clusterData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Activity, TrendingUp, Users, DollarSign, Clock, AlertTriangle, ArrowRight, ExternalLink, Wrench } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';

interface RCASummaryProps {
    data: ClusterSpecificData;
    confidence?: number;
    onViewDetailedRCA: () => void;
}

export function RCASummary({ data, confidence = 0.95, onViewDetailedRCA }: RCASummaryProps) {
    return (
        <div className="space-y-6">
            {/* Root Cause Description */}
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Root Cause Analysis
                        </CardTitle>
                        <CardDescription>
                            {data.rcaMetadata.device} • {new Date(data.rcaMetadata.timestamp).toLocaleString()}
                        </CardDescription>
                    </div>
                    <Button onClick={onViewDetailedRCA} variant="default" size="sm" className="gap-2 shadow-md">
                        RCA Analysis Flow
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground text-lg leading-relaxed font-medium">
                        {data.rcaSummary}
                    </p>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
                            <span className="text-muted-foreground text-sm">Severity:</span>
                            <Badge variant={data.rcaMetadata.severity === 'Critical' ? 'destructive' : 'default'}>
                                {data.rcaMetadata.severity}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
                            <span className="text-muted-foreground text-sm">Confidence:</span>
                            <span className="font-bold text-primary">{Math.round(confidence * 100)}%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>




            {/* Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Incident Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative flex items-start justify-between pt-2 px-2">
                        {/* Connecting Line */}
                        <div className="absolute top-[13px] left-8 right-8 h-[2px] bg-primary/30" />

                        <div className="flex flex-col items-center text-center space-y-2 relative px-2">
                            <div className="h-3 w-3 rounded-full bg-muted border border-border ring-4 ring-card" />
                            <div>
                                <p className="text-sm font-medium">Issue Started</p>
                                <p className="text-xs text-muted-foreground font-mono">14:00:00</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2 relative px-2">
                            <div className="h-3 w-3 rounded-full bg-orange-500 border border-border ring-4 ring-card" />
                            <div>
                                <p className="text-sm font-medium">Detection</p>
                                <p className="text-xs text-muted-foreground font-mono">+2m 15s</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2 relative px-2">
                            <div className="h-3 w-3 rounded-full bg-primary border border-border ring-4 ring-card" />
                            <div>
                                <p className="text-sm font-medium">RCA Done</p>
                                <p className="text-xs text-muted-foreground font-mono">+30s</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2 relative px-2">
                            <div className="h-3 w-3 rounded-full bg-muted border border-border animate-pulse ring-4 ring-card" />
                            <div>
                                <p className="text-sm font-medium">Resolution</p>
                                <p className="text-xs text-muted-foreground font-mono">14:45:00</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}
