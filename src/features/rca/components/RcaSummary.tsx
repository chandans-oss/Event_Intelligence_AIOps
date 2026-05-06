import { ClusterSpecificData } from '@/features/rca/data/clusterData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Activity, TrendingUp, Users, DollarSign, Clock, AlertTriangle, ArrowRight, ExternalLink, Wrench, BrainCircuit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';

interface RCASummaryProps {
    data: ClusterSpecificData;
    confidence?: number;
}

export function RCASummary({ data, confidence = 0.95 }: RCASummaryProps) {
    return (
        <div className="space-y-4">
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



        </div>
    );
}
