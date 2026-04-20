import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    ArrowLeft, Search, Network, Share2, Activity, Users, DollarSign,
    ShieldAlert, FileText, ChevronRight, CheckCircle2, Target, Zap
} from 'lucide-react';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import { getClusterData } from '@/features/rca/data/clusterData';
import { useState } from 'react';

const IMPACT_STEPS = [
    { id: 'discovery', label: 'Asset Discovery', icon: Search },
    { id: 'blast-radius', label: 'Blast Radius', icon: Network },
    { id: 'dependencies', label: 'Dependency Trace', icon: Share2 },
    { id: 'kpi-analysis', label: 'KPI Analysis', icon: Activity },
    { id: 'user-quant', label: 'User Impact', icon: Users },
    { id: 'business-risk', label: 'Business Risk', icon: DollarSign },
    { id: 'final-scoring', label: 'Impact Score', icon: ShieldAlert },
];

export default function ImpactDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const clusterData = getClusterData(id || 'CLU-LC-001');

    if (!clusterData) {
        return (
            <MainLayout>
                <div className="p-12 text-center text-muted-foreground">
                    Impact Assessment Data not found for ID: {id}
                    <Button asChild className="mt-4"><Link to="/events">Back to Events</Link></Button>
                </div>
            </MainLayout>
        );
    }

    const impactStepData: Record<string, any> = {
        'discovery': {
            description: 'Scanning infrastructure to identify nodes connected to the root incident device.',
            findings: [
                'Direct neighbor analysis complete',
                'Topological hop count scanned (N=2)',
                'Redundant signal suppression applied',
                `${clusterData.impactedAssets.length + 2} assets identified`
            ],
            metrics: [
                { label: 'Assets Scanned', value: '45' },
                { label: 'Relevant Assets', value: `${clusterData.impactedAssets.length + 2}` },
                { label: 'Scan Duration', value: '14s' },
                { label: 'Confidence', value: '98%' }
            ]
        },
        'blast-radius': {
            description: 'Mapping the propagation of the incident across the network topology tiers.',
            findings: [
                'Physical site DC1 isolation required',
                'Congestion propagation verified on Gi0/2/1',
                'Inter-switch bottleneck identified',
                'Extended to 3 logical tiers'
            ],
            metrics: [
                { label: 'Propagation Tiers', value: '3' },
                { label: 'Affected Sites', value: '2' },
                { label: 'Analysis Time', value: '22s' },
                { label: 'Severity', value: 'Critical' }
            ]
        },
        'dependencies': {
            description: 'Analyzing upstream and downstream service dependencies.',
            findings: [
                'API Gateway throughput restricted',
                'Auth-service retry loop detected',
                'Cache-invalidation delay propagated',
                `${clusterData.impactedAssets.length} services downstream`
            ],
            metrics: [
                { label: 'Services Analyzed', value: '12' },
                { label: 'Critical Services', value: `${clusterData.impactedAssets.length}` },
                { label: 'Trace Duration', value: '31s' },
                { label: 'Dependency Depth', value: '4 levels' }
            ]
        },
        'kpi-analysis': {
            description: 'Evaluating health metrics and performance indicators of affected services.',
            findings: [
                'P99 response time breach (>1s)',
                'Error rate peak: 4.2%',
                'Queue depth threshold exceeded',
                'Average latency increased by +450ms'
            ],
            metrics: [
                { label: 'Latency Increase', value: '+450ms' },
                { label: 'Error Rate', value: '4.2%' },
                { label: 'Throughput Drop', value: '22%' },
                { label: 'Analysis Time', value: '18s' }
            ]
        },
        'user-quant': {
            description: 'Estimating total unique users affected by current service state.',
            findings: [
                'Mobile users (Android) highly impacted',
                'Regional bias: North America East',
                'Session drop rate: +12%',
                '~1,240 unique users affected'
            ],
            metrics: [
                { label: 'Affected Users', value: '~1,240' },
                { label: 'Session Drops', value: '+12%' },
                { label: 'Primary Region', value: 'NA-East' },
                { label: 'Calculation Time', value: '25s' }
            ]
        },
        'business-risk': {
            description: 'Calculating financial risk and potential SLA violation penalties.',
            findings: [
                'Enterprise SLA Breach imminent',
                'Churn probability increased (Medium)',
                'Transactional throughput drop: 22%',
                '$45k projected risk per hour'
            ],
            metrics: [
                { label: 'Revenue Risk', value: '$45k/hr' },
                { label: 'SLA Violations', value: '2' },
                { label: 'Churn Risk', value: 'Medium' },
                { label: 'Analysis Time', value: '12s' }
            ]
        },
        'final-scoring': {
            description: 'Generating the final composite impact score and priority ranking.',
            findings: [
                'Priority uplift: Critical Risk',
                'NOC dispatch suggested',
                'Automation sequence lock acquired',
                'Final impact score: 8.4/10'
            ],
            metrics: [
                { label: 'Impact Score', value: '8.4/10' },
                { label: 'Priority', value: 'Critical' },
                { label: 'Confidence', value: '98.2%' },
                { label: 'Scoring Time', value: '8s' }
            ]
        }
    };

    const activeStepId = IMPACT_STEPS[activeTab].id;
    const activeData = impactStepData[activeStepId];

    return (
        <MainLayout>
            <div className="p-6 space-y-6 bg-background min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/events?cluster=${id}&openSidebar=impact`)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Impact Analysis Assessment</h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <span className="font-mono text-primary">{clusterData.clusterId}</span>
                                <span>•</span>
                                <span>Blast Radius Evaluation</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" /> Export Report
                        </Button>
                        <Button>
                            <Share2 className="h-4 w-4 mr-2" /> Share
                        </Button>
                    </div>
                </div>

                {/* Summary Card */}
                <Card className="bg-primary text-white border-none">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-3">
                                <Badge className="bg-white/20 text-white border-none mb-3">
                                    Impact Summary
                                </Badge>
                                <h2 className="text-xl font-bold mb-2">
                                    Incident on {clusterData.rcaMetadata.device} has propagated to {clusterData.impactedAssets.length} downstream services
                                </h2>
                                <p className="text-sm text-white/80">
                                    Analysis detected critical impact across multiple service tiers with potential revenue implications
                                </p>
                            </div>
                            <div className="flex flex-col justify-center gap-3">
                                <div>
                                    <p className="text-xs text-white/70 uppercase font-semibold mb-1">Affected Users</p>
                                    <p className="text-2xl font-bold">~1,240</p>
                                </div>
                                <div>
                                    <p className="text-xs text-white/70 uppercase font-semibold mb-1">Revenue Risk</p>
                                    <p className="text-2xl font-bold">$45k/hr</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Process Flow Visualization */}
                <Card className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                            {IMPACT_STEPS.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = activeTab === index;
                                return (
                                    <div key={step.id} className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => setActiveTab(index)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all min-w-[120px]",
                                                isActive
                                                    ? "bg-primary/5 border-primary shadow-sm"
                                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                                isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <p className={cn(
                                                "text-[10px] font-semibold leading-tight text-center",
                                                isActive ? "text-primary" : "text-foreground"
                                            )}>
                                                {step.label}
                                            </p>
                                        </button>
                                        {index < IMPACT_STEPS.length - 1 && (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
                    {IMPACT_STEPS.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => setActiveTab(index)}
                            className={cn(
                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                activeTab === index
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {step.label}
                        </button>
                    ))}
                </div>

                {/* Active Step Content */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Main Content */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Target className="h-4 w-4 text-primary" />
                                    Assessment Phase: {IMPACT_STEPS[activeTab].label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground ">
                                    "{activeData.description}"
                                </p>
                            </CardContent>
                        </Card>

                        {/* Key Findings */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    Key Findings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {activeData.findings.map((finding: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                            <span className="text-sm">{finding}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Metrics Grid */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Assessment Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {activeData.metrics.map((metric: any, i: number) => (
                                        <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border">
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">
                                                {metric.label}
                                            </p>
                                            <p className="text-lg font-bold">{metric.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        {/* Impact Score */}
                        <Card className="border-2 border-primary/20 bg-primary/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-primary" />
                                    Overall Impact Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-primary">8.4</span>
                                        <span className="text-lg text-muted-foreground">/ 10</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: '84%' }} />
                                    </div>
                                    <Badge variant="destructive" className="w-full justify-center">
                                        Critical Priority
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Impacted Assets */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Network className="h-4 w-4 text-primary" />
                                    Impacted Assets
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {clusterData.impactedAssets.map((asset) => (
                                        <div key={asset.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-semibold">{asset.name}</p>
                                                <Badge
                                                    variant={asset.severity === 'Critical' ? 'destructive' : 'secondary'}
                                                    className="text-[9px]"
                                                >
                                                    {asset.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{asset.type}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                                    <Zap className="h-4 w-4" />
                                    View RCA Details
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                                    <FileText className="h-4 w-4" />
                                    Generate Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
