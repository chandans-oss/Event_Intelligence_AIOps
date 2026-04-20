import { ClusterSpecificData } from '@/features/rca/data/clusterData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { TrendingUp, History, AlertOctagon, CloudRain } from 'lucide-react';
import { Separator } from '@/shared/components/ui/separator';

interface RCAAnalyticsProps {
    data: ClusterSpecificData;
}

export function RCAAnalytics({ data }: RCAAnalyticsProps) {
    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Recurrence Probability</p>
                        <p className="text-2xl font-bold text-orange-500">High (78%)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">MTTD (Avg)</p>
                        <p className="text-2xl font-bold">2m 14s</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">MTTR (Projected)</p>
                        <p className="text-2xl font-bold">45m</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Similar Incidents</p>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-xs text-muted-foreground">Past 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Historical Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Historical Trend Analysis
                    </CardTitle>
                    <CardDescription>Similar incidents over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-end justify-between gap-2 px-4 pb-2 border-b border-border">
                        {[1, 0, 0, 2, 1, 0, 3, 1, 0, 0, 1, 3].map((count, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-full">
                                <div
                                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative group"
                                    style={{ height: `${count * 30 + 10}px` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {count} incidents
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground">{i + 1}w ago</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Risk Forecast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <CloudRain className="h-4 w-4 text-blue-400" />
                            Risk Weather Forecast (7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={day} className="flex flex-col items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{day}</span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 2 || i === 3 ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                                        <AlertOctagon className="h-4 w-4" />
                                    </div>
                                    <span className="text-[10px] font-medium">{i === 2 || i === 3 ? 'High' : 'Low'}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-400" />
                            Capacity Prediction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span>Link Capacity</span>
                                    <span className="text-destructive font-medium">96% utilized</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 w-[96%]" />
                                </div>
                                <p className="text-xs text-muted-foreground">Predicted to reach 100% in 3 days if unresolved.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
