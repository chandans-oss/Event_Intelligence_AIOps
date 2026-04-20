import { useState, useEffect, useMemo } from 'react';
import {
  Wrench, CheckCircle2, Circle, Play, Terminal, BookOpen, AlertTriangle,
  RotateCcw, XCircle, ArrowRight, ArrowLeft, Clock, ShieldCheck, History, TrendingDown,
  Download, Check, AlertCircle, Activity, Info, ChevronRight, ClipboardCheck,
  Trash2, Users, X
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Separator } from '@/shared/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { getClusterData, ClusterSpecificData } from '@/features/rca/data/clusterData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { Cluster } from '@/shared/types';

// Post-remediation verification metrics mock data
const VERIFICATION_METRICS = [
  { name: 'Latency', before: 170, after: 35, unit: 'ms', improvement: '79%' },
  { name: 'Packet Loss', before: 1.3, after: 0.2, unit: '%', improvement: '85%' },
  { name: 'Queue Drops', before: 2.5, after: 0.1, unit: '%', improvement: '96%' },
  { name: 'Bandwidth', before: 96, after: 45, unit: '%', improvement: '53%' },
];

const TIMELINE_DATA = [
  { time: '14:30:00', event: 'Issue Detected', details: 'EWMA anomaly, Z-score = 3.2σ', icon: AlertCircle, color: 'text-destructive' },
  { time: '14:32:15', event: 'Root Cause Identified', details: 'Backup-Induced Congestion (93%)', icon: Activity, color: 'text-primary' },
  { time: '14:35:00', event: 'Remediation Started', details: 'Workflow initiated by operator', icon: Play, color: 'text-blue-500' },
  { time: '14:37:30', event: 'Step 1: Completed', details: 'Verified backup traffic pattern', icon: CheckCircle2, color: 'text-status-success' },
  { time: '14:39:00', event: 'Step 2: Completed', details: 'Applied QoS Traffic Shaping', icon: CheckCircle2, color: 'text-status-success' },
  { time: '14:42:15', event: 'Step 3: Completed', details: 'Rescheduled backup jobs', icon: CheckCircle2, color: 'text-status-success' },
  { time: '14:45:00', event: 'Verification Finalized', details: 'All metrics stabilized within SLA', icon: ShieldCheck, color: 'text-emerald-500' },
];

interface RemediationSidebarProps {
  cluster: Cluster;
  onClose: () => void;
  onBack?: () => void;
}

export function RemediationSidebar({ cluster, onClose, onBack }: RemediationSidebarProps) {
  const clusterData = getClusterData(cluster.id);

  const [viewMode, setViewMode] = useState<'execution' | 'verification' | 'history'>('execution');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepStates, setStepStates] = useState<Record<string, 'pending' | 'executed' | 'success' | 'failed'>>({});
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'command' | 'output'; text: string }>>([]);
  const [currentTab, setCurrentTab] = useState('steps');

  useEffect(() => {
    if (clusterData) {
      const initialStates: Record<string, 'pending' | 'executed' | 'success' | 'failed'> = {};
      clusterData.remediationSteps.forEach(step => {
        initialStates[step.id] = 'pending';
      });
      setStepStates(initialStates);
    }
  }, [cluster.id]);

  const handleStepAction = (stepId: string, result: 'success' | 'failed' | 'pending' | 'executed') => {
    setStepStates(prev => ({ ...prev, [stepId]: result }));

    // Log to terminal
    const step = clusterData?.remediationSteps.find(s => s.id === stepId);
    if (step) {
      if (result === 'pending') {
        const logs = [
          { type: 'command' as const, text: `$ retry remediation_step --id ${step.id}` },
          { type: 'output' as const, text: `↺ Retrying step: ${step.action}...` },
        ];
        setTerminalHistory(prev => [...prev, ...logs]);
        return;
      }

      if (result === 'executed') {
        const logs = [
          { type: 'command' as const, text: `$ execute remediation_step --id ${step.id} --action "${step.action}"` },
          { type: 'output' as const, text: `> Initiating execution protocol...` },
          { type: 'output' as const, text: `> Command sent to device ${cluster.id} via SSH` },
          { type: 'output' as const, text: `> Waiting for execution confirmation...` },
          { type: 'output' as const, text: `✓ Execution completed. Please verify impact.` },
        ];
        setTerminalHistory(prev => [...prev, ...logs]);
        return;
      }

      const logs = [
        { type: 'output' as const, text: result === 'success' ? `✓ Verification: Step succeeded.` : `❌ Verification: Step failed.` },
        { type: 'output' as const, text: result === 'success' ? `  Post-action metrics check: PASS` : `  Post-action metrics check: FAIL` },
      ];
      setTerminalHistory(prev => [...prev, ...logs]);
    }

    if (result === 'success' && clusterData && activeStepIndex < clusterData.remediationSteps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
    }
  };

  const isAllComplete = useMemo(() => {
    if (!clusterData) return false;
    return clusterData.remediationSteps.every(s => stepStates[s.id] === 'success');
  }, [stepStates, clusterData]);

  if (!clusterData) return null;

  const steps = clusterData.remediationSteps;
  const progress = Math.round((Object.values(stepStates).filter(s => s === 'success').length / steps.length) * 100);

  // Render Execution View
  const renderExecution = () => (
    <div className="grid grid-cols-12 gap-6">
      {/* Steps List */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        {steps.map((step, index) => {
          const state = stepStates[step.id];
          const isActive = index === activeStepIndex && (state === 'pending' || state === 'executed');
          const isCompleted = state === 'success';
          const isFailed = state === 'failed';
          const StepIcon = isCompleted ? CheckCircle2 : (isFailed ? XCircle : Circle);

          return (
            <Card key={step.id} className={cn(
              "transition-all duration-300 border",
              isActive && "ring-2 ring-primary border-primary shadow-lg scale-[1.01] bg-primary/5",
              isCompleted && "border-status-success/30 bg-status-success/5 opacity-90",
              isFailed && "border-destructive/30 bg-destructive/5"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive ? "bg-primary text-primary-foreground animate-pulse" :
                        isCompleted ? "bg-status-success text-status-success-foreground" :
                          isFailed ? "bg-destructive text-destructive-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {isActive ? <Activity className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        STEP {index + 1}: {step.action}
                        {isCompleted && <Badge className="bg-status-success text-[13px] h-5 font-medium">Worked</Badge>}
                        {isFailed && <Badge variant="destructive" className="text-[13px] h-5 font-medium">Failed</Badge>}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-1">{step.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px]">~{step.duration}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Command Block */}
                <div className="bg-secondary/30 rounded-lg p-3 border border-border/50 font-mono text-[13px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-[13px] font-medium">Execution Command</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[13px]">Copy</Button>
                  </div>
                  <pre className="text-foreground whitespace-pre-wrap">{step.command || `# Manual Action Required`}</pre>
                </div>

                {/* Expected Result */}
                <div className="flex items-start gap-2 text-[13px] text-muted-foreground ">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Expected Result: {step.verification?.join(', ') || 'Successful execution confirmation'}</p>
                </div>

                {isActive && state === 'pending' && (
                  <div className="pt-2">
                    <Button
                      className="w-full gap-2 shadow-md"
                      size="default"
                      onClick={() => handleStepAction(step.id, 'executed')}
                    >
                      <Play className="h-4 w-4" />
                      Execute Remediation
                    </Button>
                  </div>
                )}

                {isActive && state === 'executed' && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-foreground font-medium mb-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Execution Completed
                      </div>
                      <p className="text-[13px] text-muted-foreground">The command has been executed on the device. Please verify if the issue is resolved.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        className="bg-status-success hover:bg-status-success/90 flex-1 gap-2"
                        onClick={() => handleStepAction(step.id, 'success')}
                      >
                        <Check className="h-4 w-4" />
                        Worked
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => handleStepAction(step.id, 'failed')}
                      >
                        <XCircle className="h-4 w-4" />
                        Didn't Work
                      </Button>
                    </div>
                  </div>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-4 text-sm text-status-success font-bold animate-fade-in bg-status-success/10 p-3 rounded-lg border border-status-success/20">
                    <CheckCircle2 className="h-4 w-4 text-status-success" />
                    Step verified successfully. Metrics stabilizing.
                  </div>
                )}

                {isFailed && (
                  <div className="space-y-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-fade-in shadow-inner">
                    <div className="flex items-center gap-2 text-sm text-destructive font-black uppercase tracking-wider">
                      <AlertTriangle className="h-5 w-5" />
                      Remediation Failure Detected
                    </div>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                      This step failed to produce the expected health improvements. anomaly detected in the execution path.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-[11px] font-black border-destructive/30 hover:bg-destructive/10 uppercase" onClick={() => handleStepAction(step.id, 'pending')}>
                        <RotateCcw className="h-3.5 w-3.5" /> Retry
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-2 text-[11px] font-black text-destructive border-destructive/30 hover:bg-destructive/20 uppercase">
                        <XCircle className="h-3.5 w-3.5" /> Rollback
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 gap-2 text-[11px] font-black hover:bg-destructive/10 uppercase">
                        <Users className="h-3.5 w-3.5" /> Support
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {isAllComplete && (
          <div className="flex justify-center pt-4 animate-bounce">
            <Button
              size="lg"
              className="bg-status-success hover:bg-status-success/90 shadow-2xl shadow-status-success/40 gap-3 px-10 font-black h-14 text-base"
              onClick={() => setViewMode('verification')}
            >
              Finish & Verify Resolution
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card className="sticky top-0 bg-background/50 backdrop-blur-sm border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2 font-black uppercase tracking-widest">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Live Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest">Real-time Telemetry</span>
              </div>

              <div className="overflow-hidden rounded-lg border border-orange-500/20">
                <table className="w-full text-[11px]">
                  <thead className="bg-orange-500/10 border-b border-orange-500/20">
                    <tr>
                      <th className="px-2 py-2 text-left font-bold text-orange-500 uppercase">Metric</th>
                      <th className="px-2 py-2 text-center font-bold text-orange-500 uppercase">Base</th>
                      <th className="px-2 py-2 text-right font-bold text-orange-500 uppercase">Now</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-500/10">
                    <tr>
                      <td className="px-2 py-2 font-medium">Latency</td>
                      <td className="px-2 py-2 text-center text-rose-400 font-mono">170ms</td>
                      <td className="px-2 py-2 text-right text-emerald-400 font-black font-mono">110ms</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2 font-medium">Utilization</td>
                      <td className="px-2 py-2 text-center text-rose-400 font-mono">96%</td>
                      <td className="px-2 py-2 text-right text-emerald-400 font-black font-mono">82%</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2 font-medium">Pkt Loss</td>
                      <td className="px-2 py-2 text-center text-rose-400 font-mono">1.3%</td>
                      <td className="px-2 py-2 text-right text-emerald-400 font-black font-mono">0.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 opacity-70">Execution Roadmap</h4>
              <div className="space-y-4">
                {steps.map((step, i) => {
                  const state = stepStates[step.id];
                  return (
                    <div key={step.id} className="flex gap-3 relative pb-4 last:pb-0">
                      {i < steps.length - 1 && (
                        <div className={cn(
                          "absolute left-2.5 top-6 bottom-0 w-0.5 bg-border transition-colors",
                          state === 'success' && "bg-status-success"
                        )} />
                      )}
                      <div className={cn(
                        "z-10 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors bg-background",
                        state === 'success' ? "bg-status-success border-status-success" :
                          i === activeStepIndex ? "border-primary" : "border-border"
                      )}>
                        {state === 'success' && <Check className="h-3 w-3 text-white font-black" />}
                        {i === activeStepIndex && state === 'pending' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-[11px] font-black",
                          state === 'success' ? "text-status-success" :
                            i === activeStepIndex ? "text-primary" : "text-muted-foreground"
                        )}>{step.action}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{step.phase} Phase</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2 text-[11px] font-black uppercase h-10 tracking-widest bg-secondary/30" onClick={() => setCurrentTab('kb')}>
              <BookOpen className="h-4 w-4" />
              Runbook Docs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render Verification View
  const renderVerification = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-background to-blue-500/10 border-2 border-emerald-500/20 shadow-2xl">
        <div className="flex items-center gap-8 mb-4 md:mb-0">
          <div className="h-20 w-20 rounded-2xl bg-status-success flex items-center justify-center shadow-2xl shadow-status-success/30 rotate-3">
            <ShieldCheck className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black flex items-center gap-4">
              Verification Dashboard
              <Badge className="bg-status-success animate-pulse h-6 px-3 text-[11px] font-black uppercase tracking-widest border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">Checks Passing</Badge>
            </h2>
            <p className="text-muted-foreground text-lg  mt-1 font-medium opacity-80">System Health Stabilized • Verification phase complete</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2 font-black uppercase h-12 px-6 border-2 hover:bg-secondary">
            <Download className="h-5 w-5" /> Export Report
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 gap-2 font-black uppercase h-12 px-8 shadow-xl shadow-primary/30"
            onClick={() => setViewMode('history')}
          >
            Resolve Case
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <Card className="col-span-12 lg:col-span-7 border-2 overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b-2">
            <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-widest">
              <TrendingDown className="h-6 w-6 text-status-success" />
              Post-Remedy Metrics
            </CardTitle>
            <CardDescription className="text-sm font-medium">Detailed observation table and delta analysis</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="overflow-hidden rounded-2xl border-2 border-border shadow-xl">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 border-b-2 border-border">
                    <tr>
                      <th className="px-6 py-5 text-left font-black uppercase tracking-widest text-[11px] text-muted-foreground">Verification Metric</th>
                      <th className="px-4 py-5 text-center font-black uppercase tracking-widest text-[11px] text-muted-foreground">Baseline (Pre)</th>
                      <th className="px-4 py-5 text-center font-black uppercase tracking-widest text-[11px] text-muted-foreground">Observed (Post)</th>
                      <th className="px-6 py-5 text-right font-black uppercase tracking-widest text-[11px] text-muted-foreground">Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-border">
                    {VERIFICATION_METRICS.map(metric => (
                      <tr key={metric.name} className="hover:bg-status-success/5 transition-all group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-3 w-3 rounded-full bg-primary/40 group-hover:bg-primary transition-all ring-4 ring-primary/5" />
                            <span className="font-black text-foreground text-base">{metric.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center font-mono">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-destructive/10 text-destructive text-[12px] font-black border-2 border-destructive/20 shadow-sm">
                            {metric.before}{metric.unit}
                          </span>
                        </td>
                        <td className="px-4 py-5 text-center font-mono">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-status-success/10 text-status-success text-[12px] font-black border-2 border-status-success/20 shadow-sm">
                            {metric.after}{metric.unit}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3 translate-x-1 group-hover:translate-x-0 transition-transform">
                            <span className="text-sm font-black text-emerald-500 tracking-tighter">{metric.improvement} Recovery</span>
                            <TrendingDown className="h-5 w-5 text-emerald-500 drop-shadow-sm" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="h-[250px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={VERIFICATION_METRICS}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <YAxis hide />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background/90 backdrop-blur border-2 border-border p-3 rounded-xl shadow-2xl text-[11px] font-black uppercase tracking-widest">
                              <p className="mb-2 text-primary">{payload[0].payload.name}</p>
                              <p className="text-destructive mb-1">Pre: {payload[0].value}{payload[0].payload.unit}</p>
                              <p className="text-status-success">Post: {payload[1].value}{payload[1].payload.unit}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="before" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} opacity={0.2} />
                    <Bar dataKey="after" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-5 border-2">
          <CardHeader className="bg-secondary/20 border-b-2">
            <CardTitle className="text-xl flex items-center gap-3 font-black uppercase tracking-widest">
              <History className="h-6 w-6 text-primary" />
              Resolution Audit
            </CardTitle>
            <CardDescription className="text-sm font-medium">Verified event sequence and timing</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-border before:rounded-full">
              {TIMELINE_DATA.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative group">
                    <div className={cn(
                      "absolute -left-[41px] top-1 h-7 w-7 bg-background rounded-full border-2 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform",
                      i === TIMELINE_DATA.length - 1 ? "border-status-success" : "border-border"
                    )}>
                      <div className={cn("h-2.5 w-2.5 rounded-full bg-border", item.color.replace('text-', 'bg-'))} />
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{item.event}</p>
                        <span className="text-[11px] text-muted-foreground font-black font-mono bg-secondary px-2 py-1 rounded-lg border-2 border-border/10 shadow-inner">{item.time}</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-1 font-medium opacity-80 leading-relaxed">{item.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 p-8 rounded-3xl bg-primary/5 border-2 border-primary/20 text-center shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-[0.2em] font-black">Resolution MTTR</p>
              <div className="relative inline-block">
                <p className="text-5xl font-black text-primary tracking-tighter">15m 00s</p>
                <Badge className="absolute -right-12 -top-2 bg-emerald-500 text-[9px] font-black uppercase px-2 py-0.5 shadow-lg shadow-emerald-500/30">-75%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 font-bold uppercase tracking-widest opacity-60 ">AI-Accelerated Remediation</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render History / Resolved View
  const renderHistory = () => (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-10">
      <div className="text-center py-12">
        <div className="h-32 w-32 rounded-full bg-status-success/20 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-status-success/10 border-4 border-status-success/10">
          <CheckCircle2 className="h-16 w-16 text-status-success animate-in zoom-in-50 duration-500" />
        </div>
        <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase mb-2">Ticket Resolved</h2>
        <p className="text-muted-foreground text-xl font-medium  opacity-70">
          Closed-Loop AIOps lifecycle complete
        </p>
      </div>

      <Card className="border-2 border-status-success/40 bg-status-success/5 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-status-success/10 p-8 border-b-2 border-status-success/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="bg-status-success p-3 rounded-2xl shadow-xl shadow-status-success/30 rotate-2">
                <ShieldCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight uppercase">Case: {cluster.id}</CardTitle>
                <CardDescription className="text-status-success/80 font-bold uppercase text-[11px] tracking-widest mt-1">Archived {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</CardDescription>
              </div>
            </div>
            <Badge className="bg-foreground text-background font-black px-4 py-1.5 rounded-full tracking-widest shadow-xl">ARCHIVED</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-3xl bg-background/50 border-2 border-border/50 shadow-inner">
              <p className="text-[11px] uppercase tracking-widest font-black text-muted-foreground mb-2">Final MTTR</p>
              <p className="text-3xl font-black text-foreground tracking-tighter">15m 00s</p>
            </div>
            <div className="text-center p-6 rounded-3xl bg-background/50 border-2 border-border/50 shadow-inner">
              <p className="text-[11px] uppercase tracking-widest font-black text-muted-foreground mb-2">Improvement</p>
              <p className="text-3xl font-black text-emerald-500 tracking-tighter">79% Avg</p>
            </div>
            <div className="text-center p-6 rounded-3xl bg-background/50 border-2 border-border/50 shadow-inner">
              <p className="text-[11px] uppercase tracking-widest font-black text-muted-foreground mb-2">Audit Score</p>
              <p className="text-3xl font-black text-primary tracking-tighter">A+ / 98%</p>
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur rounded-3xl p-8 border-2 border-border/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <History className="h-32 w-32" />
            </div>
            <h4 className="text-[12px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              Executive Resolution Summary
            </h4>
            <p className="text-base text-muted-foreground leading-relaxed font-medium">
              The case {cluster.id} has been fully remediated through automated QoS optimization.
              Recovery metrics have been verified against established baselines, showing a total suppression of the anomalous link congestion pattern.
              Stability period is now active with 100% telemetry health.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
            <Button variant="outline" size="lg" onClick={() => setViewMode('verification')} className="h-14 gap-3 px-8 font-black uppercase tracking-widest border-2 shadow-xl hover:bg-secondary">
              <Download className="h-5 w-5" /> Detailed Report
            </Button>

          </div>
        </CardContent>
      </Card>

      <div className="text-center pt-8">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-3 font-black uppercase tracking-widest opacity-50">
          <Trash2 className="h-4 w-4" /> Purge Tracking Data
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-[85%] max-w-[1200px] bg-background border-l-4 border-border shadow-[0_0_100px_rgba(0,0,0,0.5)] z-50 animate-slide-in-right flex flex-col">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border bg-card/30 backdrop-blur shadow-sm shrink-0">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack || onClose}
              className="group h-12 w-12 rounded-full border-2 border-border hover:bg-primary hover:border-primary hover:text-white transition-all"
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div className="h-10 w-0.5 bg-border rounded-full" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/30 shadow-inner group overflow-hidden relative">
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
              <Wrench className="h-6 w-6 text-primary group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-foreground">{viewMode === 'execution' ? 'Guided Remediation' : viewMode === 'verification' ? 'Resolution Verification' : 'Case Resolved'}</h2>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-primary" />
                {cluster.id} • {clusterData.rcaMetadata.rootEventType.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {viewMode === 'execution' && (
              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary">{progress}%</span>
                  <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden border border-border">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <p className="text-[13px] text-muted-foreground translate-x-1">Execution Payload Activity</p>
              </div>
            )}

          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-4 border-b-2 border-border bg-background/50 sticky top-0 z-20 shrink-0 shadow-sm">
            <TabsList className="h-12 w-full max-w-2xl bg-transparent p-0 flex items-center justify-start gap-6">
              <TabsTrigger value="steps" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-2 py-4 text-sm font-medium transition-all">
                Remediation Steps
              </TabsTrigger>
              <TabsTrigger value="terminal" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-2 py-4 text-sm font-medium transition-all">
                Terminal
              </TabsTrigger>
              <TabsTrigger value="kb" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-2 py-4 text-sm font-medium transition-all">
                Knowledge Base
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-secondary/5 min-h-0 relative">
            <ScrollArea className="h-full">
              <div className="p-4">
                <TabsContent value="steps" className="m-0 border-none p-0 focus-visible:ring-0">
                  {viewMode === 'execution' && renderExecution()}
                  {viewMode === 'verification' && renderVerification()}
                  {viewMode === 'history' && renderHistory()}
                </TabsContent>

                <TabsContent value="terminal" className="m-0 border-none p-0 focus-visible:ring-0">
                  <Card className="bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-sm overflow-hidden shadow-2xl rounded-3xl group">
                    <CardHeader className="bg-zinc-900 border-b border-zinc-800 p-6 flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-2.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-lg shadow-red-500/20" />
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-lg shadow-amber-500/20" />
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-lg shadow-emerald-500/20" />
                        </div>
                        <span className="text-[11px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-4 group-hover:text-zinc-400 transition-colors">AIOps-Agent:~/remediation-session-v4</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 text-[11px] font-black uppercase hover:bg-zinc-800 hover:text-white border-zinc-800/50" onClick={() => setTerminalHistory([])}>
                        <RotateCcw className="h-3.5 w-3.5 mr-2" /> Clear Buffer
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0 h-[600px] relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 to-transparent pointer-events-none z-10" />
                      <ScrollArea className="h-full p-8 font-mono">
                        <div className="space-y-2">
                          <div className="text-zinc-500 mb-6 flex items-center gap-4">
                            <div className="h-px bg-zinc-800 flex-1" />
                            <span className="text-[11px] font-black uppercase">Session Initialized: {new Date().toISOString()}</span>
                            <div className="h-px bg-zinc-800 flex-1" />
                          </div>
                          {terminalHistory.length > 0 ? terminalHistory.map((line, index) => (
                            <div key={index} className={cn(
                              "flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-300",
                              line.type === 'command' ? "text-emerald-400" : "text-zinc-300"
                            )}>
                              <span className="text-zinc-600 shrink-0 select-none">[{index.toString().padStart(3, '0')}]</span>
                              <span className="text-zinc-500 shrink-0 select-none font-bold">{line.type === 'command' ? '➜' : ' '}</span>
                              <span className="whitespace-pre-wrap">{line.text}</span>
                            </div>
                          )) : (
                            <div className="text-zinc-700  flex items-center gap-3 py-10 justify-center">
                              <Terminal className="h-10 w-10 opacity-20" />
                              <span className="font-black uppercase tracking-widest text-lg">Waiting for instruction payload...</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-6 opacity-80">
                            <span className="text-zinc-600 shrink-0 select-none">[{terminalHistory.length.toString().padStart(3, '0')}]</span>
                            <span className="text-emerald-500 font-bold shrink-0">➜</span>
                            <div className="w-2.5 h-5 bg-emerald-500/50 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="kb" className="m-0 border-none p-0 focus-visible:ring-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clusterData.remediationKB.map((article, i) => (
                      <Card key={i} className="hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group rounded-3xl border-2 overflow-hidden bg-background/50">
                        <CardHeader className="pb-4 bg-secondary/10 border-b-2">
                          <div className="flex justify-between items-start mb-4">
                            <Badge className="bg-foreground text-background text-[9px] font-black uppercase tracking-widest px-2.5 py-1">Doc: #{i + 1}</Badge>
                            <Badge className="bg-primary/20 text-primary border-primary/20 text-[11px] font-black uppercase tracking-widest px-2.5 py-1 transition-all group-hover:bg-primary group-hover:text-white">{article.relevance}% MATCH</Badge>
                          </div>
                          <CardTitle className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{article.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-[13px] text-muted-foreground font-medium  opacity-80 leading-relaxed mb-6">Cross-referenced solution from central AIOps repository based on current link_congestion fingerprint.</p>
                          <Button variant="secondary" size="sm" className="w-full text-[11px] font-black uppercase tracking-[0.2em] h-10 gap-2 border-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-inner" asChild>
                            <a href={article.url} target="_blank" rel="noopener noreferrer">
                              <BookOpen className="h-4 w-4" /> Open Full Briefing
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
