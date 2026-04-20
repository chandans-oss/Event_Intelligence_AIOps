import { useState, useEffect } from 'react';
import { ClusterSpecificData, RemediationStep } from '@/features/rca/data/clusterData';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import {
    Play, CheckSquare, BookOpen, AlertTriangle, Timer, ShieldCheck, Undo2,
    Bot, Terminal, CheckCircle2, XCircle, Loader2, ChevronRight, ChevronDown, RefreshCw
} from 'lucide-react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { Separator } from '@/shared/components/ui/separator';

interface RCARemediationProps {
    data: ClusterSpecificData;
}

export function RCARemediation({ data }: RCARemediationProps) {
    const isConsolidatedView = data.clusterId === 'CLU-LC-001';

    if (isConsolidatedView) {
        return <ConsolidatedRemediationPanel data={data} />;
    }

    const automatedSteps = data.remediationSteps.filter(s => s.automated);
    const manualSteps = data.remediationSteps.filter(s => !s.automated);

    return (
        <div className="space-y-6">
            <RemediationMetrics /> {/* Refactored metrics to component */}

            <Tabs defaultValue="automated" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="automated">1. Automated</TabsTrigger>
                    <TabsTrigger value="guided">2. Guided Steps</TabsTrigger>
                    <TabsTrigger value="knowledge">3. Vendor KB</TabsTrigger>
                </TabsList>

                <TabsContent value="automated" className="space-y-4 mt-4">
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        <p className="text-sm text-foreground">These actions are pre-validated and safe to execute automatically.</p>
                    </div>
                    {automatedSteps.map(step => (
                        <RemediationStepCard key={step.id} step={step} />
                    ))}
                </TabsContent>

                <TabsContent value="guided" className="space-y-4 mt-4">
                    <div className="rounded-lg border border-border bg-secondary/20 p-4">
                        <p className="text-sm text-muted-foreground">Follow these steps if automated remediation fails or is skipped.</p>
                    </div>
                    {manualSteps.map(step => (
                        <RemediationStepCard key={step.id} step={step} mode="manual" />
                    ))}
                </TabsContent>

                <TabsContent value="knowledge" className="space-y-4 mt-4">
                    <KnowledgeBaseTab data={data} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RemediationMetrics() {
    return (
        <div className="grid grid-cols-3 gap-4">
            <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Timer className="h-6 w-6 text-primary mb-2" />
                    <div className="text-xl font-bold">~15 min</div>
                    <div className="text-xs text-muted-foreground">Est. Resolution</div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <ShieldCheck className="h-6 w-6 text-status-success mb-2" />
                    <div className="text-xl font-bold">Low Risk</div>
                    <div className="text-xs text-muted-foreground">Correction Impact</div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Undo2 className="h-6 w-6 text-muted-foreground mb-2" />
                    <div className="text-xl font-bold">Auto</div>
                    <div className="text-xs text-muted-foreground">Rollback Available</div>
                </CardContent>
            </Card>
        </div>
    );
}

function ConsolidatedRemediationPanel({ data }: { data: ClusterSpecificData }) {
    // Filter for immediate/temporary automated steps for the playbook
    const steps = data.remediationSteps.filter(s => s.automated && (s.phase === 'Immediate' || s.phase === 'Temporary'));

    // Status: 'pending', 'running', 'success', 'error', 'analyzing', 'fixed'
    const [stepStates, setStepStates] = useState<Record<string, { status: string; output?: string; llmSolution?: string }>>({});
    const [isRunning, setIsRunning] = useState(false);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    const toggleExpand = (id: string) => setExpandedStep(curr => curr === id ? null : id);

    const runPlaybook = async () => {
        setIsRunning(true);
        // Reset subsequent steps if re-running

        for (const step of steps) {
            const currentStatus = stepStates[step.id]?.status;
            if (currentStatus === 'success' || currentStatus === 'fixed') continue;

            setExpandedStep(step.id);
            setStepStates(prev => ({ ...prev, [step.id]: { status: 'running' } }));

            // Simulate execution time
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Hardcoded Failure for Demo Scene REM-LC-02
            if (step.id === 'REM-LC-02' && currentStatus !== 'fixed') {
                setStepStates(prev => ({
                    ...prev,
                    [step.id]: {
                        status: 'error',
                        output: "Error: QoS Policy Map 'SHAPE_BACKUP' configuration failed.\nDetails: Conflicts with existing map 'DEFAULT' on Gi0/1/0.\nErrorCode: CFM-409-CONFLICT. Operation aborted."
                    }
                }));
                setIsRunning(false);
                return; // Stop execution
            }

            // Success
            setStepStates(prev => ({
                ...prev,
                [step.id]: {
                    status: 'success',
                    output: `Command executed successfully.\n> ${step.command}\nResult: OK\nVerification: ${step.verification?.join(', ')}`
                }
            }));

            // Wait a bit before collapsing to show success
            await new Promise(resolve => setTimeout(resolve, 500));
            setExpandedStep(null);
        }
        setIsRunning(false);
    };

    const askLLM = async (stepId: string) => {
        setStepStates(prev => ({ ...prev, [stepId]: { ...prev[stepId]!, status: 'analyzing' } }));
        await new Promise(resolve => setTimeout(resolve, 2500));

        setStepStates(prev => ({
            ...prev,
            [stepId]: {
                ...prev[stepId]!,
                status: 'error', // Remains error until fixed, but has solution
                llmSolution: "I analyzed the configuration conflict. The interface Gi0/1/0 already has a service policy 'DEFAULT'.\n\nStrategy: Remove the existing policy before applying the new one.\n\nRecommended Command:\nconf t\ninterface Gi0/1/0\n no service-policy output DEFAULT\n service-policy output SHAPE_BACKUP\nend"
            }
        }));
    };

    const applyFix = async (stepId: string) => {
        setStepStates(prev => ({ ...prev, [stepId]: { ...prev[stepId]!, status: 'fixing' } }));
        await new Promise(resolve => setTimeout(resolve, 2000));

        setStepStates(prev => ({
            ...prev,
            [stepId]: {
                status: 'fixed',
                output: "Fix applied: Existing policy removed. New policy applied successfully.\nVerification: Queue drops: 0."
            }
        }));
        // Auto-resume playbook could happen here, or user clicks resume
    };

    const isAllComplete = steps.every(s => {
        const status = stepStates[s.id]?.status;
        return status === 'success' || status === 'fixed';
    });

    return (
        <div className="space-y-6">
            <RemediationMetrics />

            <Card className="border-primary/20 shadow-md">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" />
                                Consolidated Remediation Plan
                            </CardTitle>
                            <CardDescription>
                                Auto-generated runbook for {data.rcaMetadata.rootEventType.replace(/_/g, ' ')}.
                                <br />Executes {steps.length} sequential actions.
                            </CardDescription>
                        </div>
                        {isAllComplete ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 gap-1 pl-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" /> All Steps Complete
                            </Badge>
                        ) : (
                            <Button size="sm" onClick={runPlaybook} disabled={isRunning} className={cn(isRunning && "animate-pulse")}>
                                {isRunning ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</>
                                ) : (
                                    Object.keys(stepStates).some(k => stepStates[k].status === 'error') ?
                                        <><Play className="mr-2 h-4 w-4" /> Resume Playbook</> :
                                        <><Play className="mr-2 h-4 w-4" /> Execute Playbook</>
                                )}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {steps.map((step, index) => {
                            const state = stepStates[step.id] || { status: 'pending' };
                            const status = state.status;
                            const isExpanded = expandedStep === step.id;

                            return (
                                <div key={step.id} className="bg-card">
                                    <div
                                        className={cn(
                                            "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                                            status === 'running' && "bg-primary/5"
                                        )}
                                        onClick={() => toggleExpand(step.id)}
                                    >
                                        <div className="shrink-0">
                                            {status === 'pending' && <div className="h-6 w-6 rounded-full border-2 border-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold">{index + 1}</div>}
                                            {status === 'running' && <Loader2 className="h-6 w-6 text-primary animate-spin" />}
                                            {status === 'success' && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                                            {status === 'fixed' && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                                            {(status === 'error' || status === 'analyzing' || status === 'fixing') && <XCircle className="h-6 w-6 text-destructive" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className={cn("text-sm font-semibold", status === 'pending' && "text-muted-foreground")}>{step.action}</h4>
                                                {status === 'fixed' && <Badge variant="outline" className="text-[10px] h-5 border-emerald-500 text-emerald-500">Fixed by AI</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                                        </div>

                                        <div className="shrink-0">
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 pl-14 animate-in slide-in-from-top-2 duration-200">
                                            {/* Command Preview */}
                                            <div className="bg-black/90 rounded-md p-3 font-mono text-xs text-muted-foreground mb-3">
                                                <div className="flex justify-between text-muted-foreground/50 mb-1 text-[10px] uppercase tracking-wider">
                                                    Action Command
                                                </div>
                                                <span className="text-green-400">$ {step.command}</span>
                                            </div>

                                            {/* Terminal Output / Error */}
                                            {state.output && (
                                                <div className={cn(
                                                    "rounded-md p-3 font-mono text-xs mb-3 border",
                                                    (status === 'error' || status === 'analyzing') ? "bg-red-950/20 border-red-900/50 text-red-400" : "bg-muted/30 border-border text-foreground/80"
                                                )}>
                                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                                        <Terminal className="h-3 w-3" />
                                                        <span className="text-[10px] uppercase font-bold">{status === 'error' ? 'Execution Failure' : 'System Output'}</span>
                                                    </div>
                                                    <div className="whitespace-pre-wrap">{state.output}</div>
                                                </div>
                                            )}

                                            {/* LLM Section */}
                                            {(status === 'error' || status === 'analyzing' || status === 'fixing' || state.llmSolution) && (
                                                <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-indigo-400">
                                                            <Bot className="h-4 w-4" />
                                                            <span className="text-sm font-bold">AI Assistant</span>
                                                        </div>
                                                        {status === 'analyzing' && <Badge className="bg-indigo-500 animate-pulse">Analyzing Logs...</Badge>}
                                                    </div>

                                                    {status === 'error' && !state.llmSolution && (
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs text-muted-foreground">Action failed. Ask AI to analyze logs and suggest a fix?</p>
                                                            <Button size="sm" variant="secondary" onClick={() => askLLM(step.id)} className="h-8 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                                                <Bot className="mr-2 h-3 w-3" /> Ask Copilot
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {state.llmSolution && (
                                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                                            <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                                {state.llmSolution}
                                                            </div>
                                                            {status !== 'fixed' && status !== 'fixing' && (
                                                                <Button size="sm" onClick={() => applyFix(step.id)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                                                    <RefreshCw className="mr-2 h-3 w-3" /> Apply Recommended Fix
                                                                </Button>
                                                            )}
                                                            {status === 'fixing' && (
                                                                <div className="flex items-center justify-center text-xs text-indigo-400 py-2">
                                                                    <Loader2 className="h-3 w-3 animate-spin mr-2" /> Applying Fix...
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function KnowledgeBaseTab({ data }: { data: ClusterSpecificData }) {
    return (
        <ScrollArea className="h-[400px]">
            {data.remediationKB.map((kb, idx) => (
                <Card key={idx} className="mb-4 hover:bg-secondary/20 cursor-pointer transition-colors">
                    <CardContent className="p-4 flex items-start gap-4">
                        <BookOpen className="h-6 w-6 text-primary mt-1" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground hover:underline">{kb.title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline">{kb.relevance}% Match</Badge>
                                <span className="text-xs text-muted-foreground truncate max-w-[300px]">{kb.url}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Open</Button>
                    </CardContent>
                </Card>
            ))}
        </ScrollArea>
    );
}

function RemediationStepCard({ step, mode = 'auto' }: { step: RemediationStep, mode?: 'auto' | 'manual' }) {
    return (
        <Card>
            <CardHeader className="py-3 bg-secondary/30">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold">{step.action}</CardTitle>
                    <Badge variant={step.automated ? "default" : "secondary"}>
                        {step.automated ? "Automated" : "Manual"}
                    </Badge>
                </div>
                <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {step.command && (
                    <div className="bg-black/90 p-3 rounded-md font-mono text-xs text-green-400 overflow-x-auto">
                        {step.command}
                    </div>
                )}
                {mode === 'auto' && (
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Preview</Button>
                        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                            <Play className="h-3 w-3" /> Execute
                        </Button>
                    </div>
                )}
                {mode === 'manual' && step.verification && (
                    <div className="mt-2 bg-secondary/20 p-3 rounded text-sm">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                            <CheckSquare className="h-3 w-3" /> Validation
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground">
                            {step.verification.map((v, i) => <li key={i}>{v}</li>)}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
