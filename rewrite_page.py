import os

content = """import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { RAW_TRAINING_REPORTS } from "@/data/trainingReports";
import { STRUCTURED_REPORTS } from "@/data/structuredTrainingData";
import { renderCorrelationSession, renderGrangerSession } from "@/shared/lib/analysis-utils";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { CheckCircle2, Workflow, ChevronLeft, Download, Play, Monitor, BrainCircuit, GitBranch, Activity, Clock, Terminal } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/**
 * DonutLoader: A premium, animated SVG donut loader for step-level progress.
 */
const DonutLoader = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="opacity-10" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="18 32" />
  </svg>
);

const PIPELINE_STEPS = [
  { id: "cross_correlation", name: "Cross-Correlation", type: "Statistical", desc: "Discovering temporal lags and relationships between metrics" },
  { id: "granger_causality", name: "Granger Causality", type: "Statistical", desc: "Determining directional influence and predictive causality" },
  { id: "pre_event_behavior", name: "Pre-Event Metric Behaviour", type: "Diagnostic", desc: "Analyzing metric shifts prior to critical events" },
  { id: "pattern_clustering", name: "Pattern Clustering", type: "Unsupervised", desc: "Grouping similar device behaviors and signatures" },
  { id: "random_forest", name: "Random Forest Predictor", type: "Ensemble", desc: "High-accuracy event forecasting and feature weights" },
  { id: "sequence_mining", name: "Event Sequence Mining", type: "Mining", desc: "Extracting sequential dependencies and patterns" },
  { id: "anomaly_detection", name: "Anomaly Detection", type: "Unsupervised", desc: "Identifying outliers and localized behavior spikes" },
  { id: "co_occurrence_matrix", name: "Event Co-Occurrence Matrix", type: "Statistical", desc: "Analyzing synergy between concurrent network events" },
  { id: "failure_chain", name: "Failure Chain Patterns", type: "Neural", desc: "Mapping causal chains from metric drift to root failure" },
];

const BATCHES = [
  { id: 'BATCH-01', start: '10:00', end: '11:15', color: 'from-blue-500/20 to-blue-600/10' },
  { id: 'BATCH-02', start: '10:01', end: '11:16', color: 'from-cyan-500/20 to-cyan-600/10' },
  { id: 'BATCH-03', start: '10:02', end: '11:17', color: 'from-emerald-500/20 to-emerald-600/10' },
  { id: 'BATCH-04', start: '10:03', end: '11:18', color: 'from-indigo-500/20 to-indigo-600/10' },
  { id: 'BATCH-05', start: '10:04', end: '11:19', color: 'from-violet-500/20 to-violet-600/10' },
];

export default function TrainingAnalysisPage() {
  const { modelId } = useParams<{ modelId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [lines, setLines]           = useState<string[]>([]);
  const [linesShown, setLinesShown] = useState(0);
  const [done, setDone]             = useState(false);
  const [started, setStarted]       = useState(false);
  const [windowingDone, setWindowingDone] = useState(false);
  const [batchProgress, setBatchProgress] = useState<number[]>([0, 0, 0, 0, 0]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const currentStepId = modelId ?? "cross_correlation";
  const stepIdx = PIPELINE_STEPS.findIndex(s => s.id === currentStepId);

  useEffect(() => {
    if (location.state?.autoStart) setStarted(true);
  }, [location.state]);

  // Sliding Window "Water Filling" Effect
  useEffect(() => {
    if (!started || windowingDone) return;

    let timers: NodeJS.Timeout[] = [];
    BATCHES.forEach((_, i) => {
      timers.push(setTimeout(() => {
        const interval = setInterval(() => {
          setBatchProgress(prev => {
            const next = [...prev];
            if (next[i] < 100) { next[i] += 5; return next; }
            clearInterval(interval); return next;
          });
        }, 40);
      }, i * 300));
    });

    const checkTimer = setInterval(() => {
      setBatchProgress(curr => {
        if (curr.every(p => p >= 100)) { setWindowingDone(true); clearInterval(checkTimer); }
        return curr;
      });
    }, 100);

    return () => { timers.forEach(clearTimeout); clearInterval(checkTimer); };
  }, [started, windowingDone]);

  // Report Loading
  useEffect(() => {
    let finalLines: string[] = [];
    
    if (modelId === "cross_correlation" && STRUCTURED_REPORTS.cross_correlation) {
      STRUCTURED_REPORTS.cross_correlation.forEach(session => {
        finalLines = [...finalLines, ...renderCorrelationSession(session)];
      });
    } else if (modelId === "granger_causality" && STRUCTURED_REPORTS.granger_causality) {
      STRUCTURED_REPORTS.granger_causality.forEach(session => {
        finalLines = [...finalLines, ...renderGrangerSession(session)];
      });
    } else {
      const raw = (modelId && RAW_TRAINING_REPORTS[modelId]) ? RAW_TRAINING_REPORTS[modelId] : RAW_TRAINING_REPORTS.default;
      finalLines = raw.split("\\n");
    }

    setLines(finalLines);
    setLinesShown(0);
    setDone(false);
  }, [modelId]);

  // Line-by-line Streaming (0.2s per line)
  useEffect(() => {
    if (!started || !windowingDone || lines.length === 0) return;
    if (linesShown >= lines.length) { setDone(true); return; }
    const timer = setTimeout(() => setLinesShown(prev => prev + 1), 250);
    return () => clearTimeout(timer);
  }, [lines, linesShown, started, windowingDone]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [linesShown]);

  const progress = lines.length > 0 ? Math.round((linesShown / lines.length) * 100) : 0;
  const visibleLines = lines.slice(0, linesShown);

  return (
    <MainLayout>
      <div className="h-screen flex flex-col p-6 gap-6 overflow-hidden bg-[#02040a] font-sans selection:bg-orange-500/30">

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/pattern-prediction/training")}
              className="bg-[#0a0a0a] border-white/10 hover:border-orange-500/50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-[#555] mb-0.5">
                <BrainCircuit className="h-3 w-3 text-orange-500/60" />
                Training Core / v3.4 Alpha
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-white leading-none">
                {PIPELINE_STEPS[stepIdx]?.name} <span className="text-muted-foreground/30 ml-2">— Live Analysis</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!started && (
              <Button
                onClick={() => setStarted(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-black uppercase tracking-widest px-8 h-10 rounded-full shadow-[0_0_25px_rgba(249,115,22,0.3)] transition-all transform hover:scale-105"
              >
                <div className="flex items-center">
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  Start Training Engine
                </div>
              </Button>
            )}
            <Button variant="outline" className="bg-[#0a0a0a] border-white/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white h-10 px-6 rounded-full">
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex gap-8 min-h-0">

          {/* LEFT: Visualizers */}
          <div className="w-[420px] flex flex-col gap-8 flex-shrink-0">

            {/* Telemetry Ingestion Visualizer */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/80 flex items-center gap-3">
                  <Monitor className="h-4 w-4" />
                  Telemetry Ingestion
                </h2>
                {started && <Badge className="bg-orange-500/10 text-orange-500 border-none animate-pulse text-[8px] font-black tracking-widest">REALTIME</Badge>}
              </div>

              <Card className="p-6 bg-[#0a0a0a]/80 border-white/5 space-y-6 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/50 via-amber-500/50 to-orange-500/50 opacity-20 group-hover:opacity-100 transition-opacity duration-700" />
                 <h3 className="text-[10px] font-black uppercase opacity-30 text-muted-foreground">75-Minute Temporal Windows</h3>

                <div className="space-y-4">
                  {BATCHES.map((batch, i) => (
                    <div key={batch.id} className="space-y-2">
                      <div className="flex justify-between text-[9px] font-mono font-bold tracking-tight">
                        <span className="text-white/40 uppercase">{batch.id} / Partition-0{i+1}</span>
                        <span className="text-orange-500/60 ">{batch.start} — {batch.end}</span>
                      </div>
                      <div className="h-[16px] bg-[#111] border border-white/5 rounded-md overflow-hidden relative shadow-inner">
                        <div
                          className={cn(
                            "h-full transition-all duration-300 ease-out bg-gradient-to-r shadow-[0_0_15px_rgba(249,115,22,0.1)]",
                            batchProgress[i] >= 100 ? "from-emerald-600/30 to-emerald-500/20" : "from-orange-600/40 to-amber-500/30"
                          )}
                          style={{ width: `${batchProgress[i]}%` }}
                        >
                          <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer", batchProgress[i] >= 100 && "hidden")} />
                        </div>
                        {batchProgress[i] > 0 && batchProgress[i] < 100 && (
                          <div className="absolute top-0 bottom-0 right-0 w-2 bg-white/20 blur-sm animate-pulse" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>

            {/* Algorithm Pipeline List */}
            <section className="flex-1 flex flex-col gap-4 min-h-0">
               <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500/80 flex items-center gap-3">
                <Workflow className="h-4 w-4" />
                Algorithmic Engine Pipeline
              </h2>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3 pb-8">
                  {PIPELINE_STEPS.map((step, idx) => {
                    const isActive = started && windowingDone && step.id === currentStepId;
                    const isDone = started && windowingDone && idx < stepIdx;
                    return (
                      <Card
                        key={step.id}
                        onClick={() => navigate(`/pattern-prediction/training/analysis/${step.id}`)}
                        className={cn(
                          "group p-5 border-white/5 bg-white/[0.02] cursor-pointer transition-all active:scale-[0.98]",
                          isActive && "bg-orange-500/[0.05] border-orange-500/20 shadow-lg",
                          isDone && "opacity-60 grayscale-[0.5]"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-7 w-7 rounded-lg flex items-center justify-center border transition-all duration-500",
                              isActive ? "bg-orange-500/20 border-orange-500/30 rotate-12" : "bg-white/5 border-white/5",
                              isDone && "bg-emerald-500/10 border-emerald-500/20"
                            )}>
                              {isDone ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <GitBranch className={cn("h-4 w-4", isActive ? "text-orange-500 animate-pulse" : "opacity-10")} />}
                            </div>
                            <span className={cn("text-[11px] font-black uppercase tracking-tight", isActive ? "text-orange-500" : "text-white/50")}>{step.name}</span>
                          </div>
                          {isActive && (
                            <div className="flex items-center gap-3 text-orange-500 text-[10px] font-black bg-orange-500/10 px-2 py-0.5 rounded-full">
                              <DonutLoader className="h-3 w-3" />
                              <span className="tabular-nums">{progress}%</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] opacity-20 font-bold leading-relaxed pl-11 group-hover:opacity-40 transition-opacity">{step.desc}</p>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </section>
          </div>

          {/* RIGHT: Terminal Terminal */}
          <div className="flex-1 flex flex-col min-w-0">
            <Card className="flex-1 bg-[#020202] border border-white/5 flex flex-col overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-xl">

              {/* Terminal Title Bar */}
              <div className="h-10 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
                  </div>
                  <div className="h-4 w-[1px] bg-white/5 mx-2" />
                  <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Terminal className="h-3 w-3" />
                    Diagnostic_Kernel.log
                  </span>
                </div>
                {started && windowingDone && !done && (
                  <div className="flex items-center gap-4">
                    <div className="h-0.5 w-24 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500/60 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="font-mono text-[9px] text-orange-500/50 animate-pulse font-bold tracking-widest">{progress}% ANALYZED</span>
                  </div>
                )}
              </div>

              {/* Log Output Area */}
              <ScrollArea className="flex-1 relative bg-black/40">
                {!started && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl animate-pulse" />
                      <div className="h-24 w-24 rounded-full border border-white/10 flex items-center justify-center relative bg-black/40 shadow-2xl">
                        <Play className="h-10 w-10 text-orange-500 fill-orange-500/20 ml-1.5" />
                      </div>
                    </div>
                     <h3 className="mt-8 text-xs font-black uppercase tracking-[0.4em] text-white/40">System Ready</h3>
                    <p className="mt-2 text-[10px] text-white/20 font-bold uppercase tracking-widest">Awaiting algorithmic trigger...</p>
                  </div>
                )}

                <div className="p-10 font-mono text-[12px] leading-[1.8] text-white/40 whitespace-pre selection:bg-orange-500/50 min-h-full">
                  {visibleLines.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "animate-in fade-in slide-in-from-left-2 duration-500 min-h-[1.5em]",
                        line.includes("SECTION") && "text-orange-500 font-black tracking-wider text-[13px] border-b border-orange-500/20 pb-1 mb-4 first:mt-0",
                        line.includes("[RESULT]") && "text-emerald-400 bg-emerald-400/5 px-2 rounded-sm",
                        line.includes("*** SIGNIFICANT") && "text-amber-400"
                      )}
                    >
                      {line}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>

                {/* Subtle Scanline / CRT Effect */}
                <div className="absolute inset-0 pointer-events-none animate-scanline opacity-[0.05] bg-gradient-to-b from-transparent via-white/40 to-transparent bg-[size:100%_20px]" />
              </ScrollArea>

              {/* Terminal Footer */}
              <div className="h-12 border-t border-white/5 bg-white/[0.01] flex items-center justify-between px-8 text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3">
                    {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <DonutLoader className="h-4 w-4 text-orange-500" />}
                    <span className="text-white/60">
                      {done ? "Engine Sequence Complete" : started ? (windowingDone ? `Processing: ${currentStepId.replace(/_/g, ' ')}` : "Aggregating Telemetry Partitions...") : "Engine Suspended"}
                    </span>
                  </div>
                  <div className="h-3 w-[1px] bg-white/5" />
                  <span className="text-white/20 flex items-center gap-2"><Clock className="h-3 w-3" /> Buffer Status: Optimal</span>
                </div>
                <div className="text-white/10 hover:text-white/30 transition-colors cursor-help">
                  CHARSET: UTF-8 | POLL: 5M
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Global Animations Component */}
      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-scanline { animation: scanline 15s linear infinite; }
        .animate-shimmer { animation: shimmer 2.5s infinite linear; }
      `}</style>
    </MainLayout>
  );
}
"""

with open("d:/Rnd files/event-analytics-main/src/pages/TrainingAnalysisPage.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Rewrote TrainingAnalysisPage.tsx with structured data support")
