import { useState, useEffect, useRef, useCallback } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import {
  Brain, Play, Database, FlaskConical, TestTube2,
  CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp,
  RotateCcw, Download, Info, Zap,
} from 'lucide-react';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DatasetRow { raw_text: string; processed_text: string; label: string; label_id: number; }
interface Score { label: string; score: number; }
interface PredictResult {
  raw_text: string; processed_text: string;
  prediction: string; confidence: number; all_scores: Score[];
}
interface TrainingConfig {
  n_per_class: number;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  max_length: number;
  test_size: number;
  base_model: string;
}
interface ModelInfo {
  exists: boolean; path: string; size_mb: number;
  trained_at: string | null; accuracy: number | null; base_model: string | null;
  confusion_matrix: number[][] | null;
  classification_report: Record<string, any> | null;
}

const LABEL_COLORS: Record<string, string> = {
  LINK_DOWN: 'bg-red-500/20 text-red-400 border-red-500/30',
  LINK_UP:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  UNKNOWN:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
};
const LABEL_DOT: Record<string, string> = {
  LINK_DOWN: 'bg-red-500', LINK_UP: 'bg-emerald-500', UNKNOWN: 'bg-amber-500',
};
const CM_LABELS = ['LINK_DOWN', 'LINK_UP', 'UNKNOWN'];
const BASE_MODELS = ['distilbert-base-uncased', 'bert-base-uncased'];

// ── Helper: format % ─────────────────────────────────────────────────────────
const fmt = (n: number | null | undefined, d = 4) =>
  n == null ? '—' : (n * 100).toFixed(d === 4 ? 2 : d) + '%';

// ══════════════════════════════════════════════════════════════════════════════

export default function ModelTrainingPage() {
  const [activeTab, setActiveTab] = useState<'dataset' | 'training' | 'evaluate' | 'test'>('dataset');

  // ── Dataset tab ─────────────────────────────────────────────────────────────
  const [nPerClass, setNPerClass] = useState(400);
  const [datasetRows, setDatasetRows] = useState<DatasetRow[]>([]);
  const [datasetTotal, setDatasetTotal] = useState<number | null>(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [showProcessed, setShowProcessed] = useState(false);

  // ── Training tab ─────────────────────────────────────────────────────────────
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    n_per_class: 400, epochs: 3, batch_size: 16,
    learning_rate: 2e-5, max_length: 64, test_size: 0.2,
    base_model: 'distilbert-base-uncased',
  });
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [trainingStage, setTrainingStage] = useState('');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [trainingMetrics, setTrainingMetrics] = useState<any>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  // ── Evaluate tab ─────────────────────────────────────────────────────────────
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [modelInfoLoading, setModelInfoLoading] = useState(false);

  // ── Test tab ─────────────────────────────────────────────────────────────────
  const [testInput, setTestInput] = useState('Interface GigabitEthernet0/1 is down, line protocol is down');
  const [testResults, setTestResults] = useState<PredictResult[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [batchMode, setBatchMode] = useState(false);

  // ── Auto-scroll logs ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [trainingLogs]);

  // ── Load model info on mount ──────────────────────────────────────────────────
  const loadModelInfo = useCallback(async () => {
    setModelInfoLoading(true);
    try {
      const r = await fetch(`${API}/api/training/model-info`);
      const d = await r.json();
      setModelInfo(d);
      if (d.confusion_matrix) setTrainingMetrics({ confusion_matrix: d.confusion_matrix, classification_report: d.classification_report });
    } catch { /* ignore */ }
    finally { setModelInfoLoading(false); }
  }, []);

  useEffect(() => { loadModelInfo(); }, [loadModelInfo]);

  // ── Dataset generation ───────────────────────────────────────────────────────
  const handleGenerateDataset = async () => {
    setDatasetLoading(true);
    try {
      const r = await fetch(`${API}/api/training/generate-dataset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ n_per_class: nPerClass }),
      });
      const d = await r.json();
      setDatasetRows(d.preview || []);
      setDatasetTotal(d.total);
      toast.success(`Dataset generated: ${d.total} samples`);
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    } finally { setDatasetLoading(false); }
  };

  // ── Start training ───────────────────────────────────────────────────────────
  const handleStartTraining = async () => {
    if (trainingStatus === 'running') return;

    setTrainingStatus('running');
    setTrainingLogs([]);
    setTrainingProgress(0);
    setTrainingStage('init');

    const cfg = { ...trainingConfig };
    const body = JSON.stringify(cfg);

    const es = new EventSource(
      `${API}/api/training/start?` + new URLSearchParams()
    );
    esRef.current?.close();

    // Use fetch + ReadableStream since EventSource doesn't support POST body
    // We'll use a polling status + POST approach
    try {
      const resp = await fetch(`${API}/api/training/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.log) setTrainingLogs(p => [...p, data.log]);
              if (data.progress != null) setTrainingProgress(data.progress);
              if (data.stage) setTrainingStage(data.stage);
              if (data.status) setTrainingStatus(data.status as any);
              if (data.done) {
                setTrainingStatus(data.status);
                if (data.metrics) setTrainingMetrics(data.metrics);
                if (data.status === 'done') {
                  toast.success('Training complete!');
                  loadModelInfo();
                } else {
                  toast.error('Training failed. Check logs.');
                }
              }
            } catch { /* bad json line */ }
          }
        }
      }
    } catch (e: any) {
      setTrainingStatus('error');
      setTrainingLogs(p => [...p, `[Error] ${e.message}`]);
      toast.error(`Training error: ${e.message}`);
    }
  };

  // ── Predict ──────────────────────────────────────────────────────────────────
  const handlePredict = async () => {
    if (!testInput.trim()) return;
    setTestLoading(true);
    try {
      const texts = batchMode
        ? testInput.split('\n').map(l => l.trim()).filter(Boolean)
        : [testInput.trim()];
      const r = await fetch(`${API}/api/training/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setTestResults(d.results || []);
    } catch (e: any) {
      toast.error(`Prediction failed: ${e.message}`);
    } finally { setTestLoading(false); }
  };

  // ── Stages list ───────────────────────────────────────────────────────────────
  const stages = ['dataset', 'tokenize', 'model', 'train', 'evaluate', 'save'];
  const stageIdx = stages.indexOf(trainingStage);

  // ══════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <MainLayout>
      <div className="h-full flex flex-col overflow-hidden bg-background">

        {/* Header */}
        <div className="shrink-0 border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-base font-bold">Deduplication Model Training</h1>
              <p className="text-xs text-muted-foreground">Train &amp; evaluate the alarm classifier (LINK_DOWN / LINK_UP / UNKNOWN)</p>
            </div>
          </div>

          {/* Model status pill */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold',
            modelInfo?.exists
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-muted/20 border-border text-muted-foreground'
          )}>
            {modelInfo?.exists
              ? <><CheckCircle2 className="w-3.5 h-3.5" /> Model Ready — {fmt(modelInfo.accuracy)} acc</>
              : <><AlertCircle className="w-3.5 h-3.5" /> No model trained yet</>
            }
          </div>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 border-b border-border px-6 flex gap-1 pt-2">
          {([
            { id: 'dataset',  label: 'Dataset',  icon: Database },
            { id: 'training', label: 'Training', icon: Play },
            { id: 'evaluate', label: 'Evaluate', icon: FlaskConical },
            { id: 'test',     label: 'Test',     icon: TestTube2 },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors mb-[-1px]',
                activeTab === t.id
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ TAB: DATASET */}
          {activeTab === 'dataset' && (
            <div className="h-full flex overflow-hidden">
              
              {/* Left: Config */}
              <div className="w-80 shrink-0 border-r border-border flex flex-col bg-background/50">
                <ScrollArea className="flex-1 p-5 space-y-6">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Dataset Config</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-semibold">Samples per class</span>
                      <span className="font-mono text-violet-400">{nPerClass}</span>
                    </div>
                    <Slider value={[nPerClass]} min={100} max={2000} step={100}
                      onValueChange={([v]) => setNPerClass(v)} className="py-1" />
                    <p className="text-[10px] text-muted-foreground">Total: {nPerClass * 3} samples ({nPerClass} × 3 classes)</p>
                  </div>

                  {/* Class bars */}
                  <div className="space-y-3 mb-8">
                    {(['LINK_DOWN', 'LINK_UP', 'UNKNOWN'] as const).map(lbl => (
                      <div key={lbl} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className={cn('font-bold', { LINK_DOWN: 'text-red-400', LINK_UP: 'text-emerald-400', UNKNOWN: 'text-amber-400' }[lbl])}>{lbl}</span>
                          <span className="text-muted-foreground font-mono">{nPerClass}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <div className={cn('h-full rounded-full', { LINK_DOWN: 'bg-red-500', LINK_UP: 'bg-emerald-500', UNKNOWN: 'bg-amber-500' }[lbl])}
                            style={{ width: `${Math.min(100, (nPerClass / 2000) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                </ScrollArea>
                
                <div className="p-4 border-t border-border">
                  <Button onClick={handleGenerateDataset} disabled={datasetLoading} className="w-full">
                    {datasetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
                    Generate Dataset
                  </Button>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="shrink-0 px-6 py-4 border-b border-border flex items-center justify-between bg-card/50">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-violet-400" />
                    <p className="text-sm font-bold">Dataset Preview</p>
                    {datasetTotal != null && (
                      <Badge variant="outline" className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {datasetTotal} samples generated
                      </Badge>
                    )}
                  </div>
                  
                  {datasetRows.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold">Show preprocessed</span>
                      <Switch checked={showProcessed} onCheckedChange={setShowProcessed} className="scale-75" />
                    </div>
                  )}
                </div>

                <ScrollArea className="flex-1 p-6">
                  {datasetRows.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/20 border-b border-border">
                            <th className="px-3 py-2 text-left font-bold text-muted-foreground w-24">Label</th>
                            <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                              Raw Text
                            </th>
                            {showProcessed && (
                              <th className="px-3 py-2 text-left font-bold text-muted-foreground border-l border-border/50">
                                Processed Text
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {datasetRows.map((row, i) => (
                            <tr key={i} className={cn('border-b border-border/50 last:border-0', i % 2 === 0 ? 'bg-muted/5' : '')}>
                              <td className="px-3 py-2 align-top">
                                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-black border', LABEL_COLORS[row.label])}>
                                  {row.label}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono text-[11px] text-foreground/80 align-top">
                                {row.raw_text}
                              </td>
                              {showProcessed && (
                                <td className="px-3 py-2 font-mono text-[11px] text-foreground/60 align-top bg-muted/10 border-l border-border/50">
                                  {row.processed_text}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground">
                      <Database className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm font-semibold">No dataset generated yet</p>
                      <p className="text-xs">Configure and click Generate Dataset</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ TAB: TRAINING */}
          {activeTab === 'training' && (
            <div className="h-full flex overflow-hidden">

              {/* Left: Config */}
              <div className="w-80 shrink-0 border-r border-border flex flex-col">
                <ScrollArea className="flex-1 p-5 space-y-5">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Training Config</p>

                  {/* Base model */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-muted-foreground">Base Model</p>
                    <div className="flex flex-col gap-1">
                      {BASE_MODELS.map(m => (
                        <button key={m} onClick={() => setTrainingConfig(p => ({ ...p, base_model: m }))}
                          className={cn('text-left px-3 py-2 rounded-lg border text-xs font-mono transition-all',
                            trainingConfig.base_model === m
                              ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                              : 'border-border bg-muted/10 hover:bg-muted/30 text-muted-foreground'
                          )}>
                          {m}
                          {trainingConfig.base_model === m && <span className="ml-2 text-[9px] font-black">● SELECTED</span>}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-muted-foreground">Downloaded to model/hf_cache/ on first use</p>
                  </div>

                  {/* Sliders */}
                  {[
                    { label: 'Samples / class', key: 'n_per_class', min: 100, max: 2000, step: 100, format: (v: number) => `${v}` },
                    { label: 'Epochs', key: 'epochs', min: 1, max: 20, step: 1, format: (v: number) => `${v}` },
                    { label: 'Batch Size', key: 'batch_size', min: 4, max: 64, step: 4, format: (v: number) => `${v}` },
                    { label: 'Max Token Length', key: 'max_length', min: 32, max: 256, step: 16, format: (v: number) => `${v}` },
                    { label: 'Test Split', key: 'test_size', min: 0.1, max: 0.4, step: 0.05, format: (v: number) => `${Math.round(v * 100)}%` },
                  ].map(s => (
                    <div key={s.key} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-muted-foreground font-semibold">{s.label}</span>
                        <span className="font-mono text-violet-400">{s.format((trainingConfig as any)[s.key])}</span>
                      </div>
                      <Slider
                        value={[(trainingConfig as any)[s.key]]}
                        min={s.min} max={s.max} step={s.step}
                        onValueChange={([v]) => setTrainingConfig(p => ({ ...p, [s.key]: v }))}
                        disabled={trainingStatus === 'running'}
                        className="py-1"
                      />
                    </div>
                  ))}

                  {/* Learning rate (text) */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-muted-foreground font-semibold">Learning Rate</p>
                    <div className="flex gap-1">
                      {[1e-5, 2e-5, 5e-5, 1e-4].map(lr => (
                        <button key={lr} onClick={() => setTrainingConfig(p => ({ ...p, learning_rate: lr }))}
                          disabled={trainingStatus === 'running'}
                          className={cn('flex-1 py-1 rounded text-[9px] font-mono border transition-all',
                            trainingConfig.learning_rate === lr
                              ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                              : 'border-border bg-muted/10 text-muted-foreground hover:bg-muted/30'
                          )}>
                          {lr.toExponential(0)}
                        </button>
                      ))}
                    </div>
                  </div>

                </ScrollArea>

                <div className="p-4 border-t border-border space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleStartTraining}
                    disabled={trainingStatus === 'running'}
                    variant={trainingStatus === 'error' ? 'destructive' : 'default'}
                  >
                    {trainingStatus === 'running'
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Training…</>
                      : <><Play className="w-4 h-4 mr-2" />Start Training</>
                    }
                  </Button>
                  {trainingStatus !== 'idle' && (
                    <Button variant="ghost" size="sm" className="w-full text-xs"
                      onClick={() => { setTrainingStatus('idle'); setTrainingLogs([]); setTrainingProgress(0); }}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Right: Progress + Logs */}
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Pipeline stages */}
                <div className="shrink-0 px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-0">
                    {['dataset','tokenize','model','train','evaluate','save'].map((s, i) => {
                      const done = trainingStatus === 'done' || i < stageIdx;
                      const active = s === trainingStage && trainingStatus === 'running';
                      return (
                        <div key={s} className="flex items-center">
                          <div className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all',
                            done   ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                            active ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 animate-pulse' :
                                     'bg-muted/10 border-border text-muted-foreground/50'
                          )}>
                            {done ? <CheckCircle2 className="w-3 h-3" /> : active ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </div>
                          {i < 5 && <div className={cn('w-6 h-px mx-1', done ? 'bg-emerald-500/40' : 'bg-border')} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress bar */}
                  {trainingStatus !== 'idle' && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">{trainingStage}</span>
                        <span className="font-mono text-violet-400">{trainingProgress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all duration-500',
                          trainingStatus === 'done' ? 'bg-emerald-500' :
                          trainingStatus === 'error' ? 'bg-red-500' : 'bg-violet-500'
                        )} style={{ width: `${trainingProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Log stream */}
                <div ref={logsRef} className="flex-1 overflow-y-auto p-4 font-mono text-[11px] bg-background/50 space-y-0.5">
                  {trainingLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Zap className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-semibold">Training logs will appear here</p>
                        <p className="text-xs mt-1">Configure parameters and click Start Training</p>
                      </div>
                    </div>
                  ) : trainingLogs.map((l, i) => {
                    const isError = l.includes('[Error]') || l.includes('❌');
                    const isDone  = l.includes('✅') || l.includes('[Done]');
                    const isEval  = l.includes('[Evaluate]') || l.includes('[Train]');
                    return (
                      <div key={i} className={cn('leading-relaxed',
                        isError ? 'text-red-400' :
                        isDone  ? 'text-emerald-400 font-semibold' :
                        isEval  ? 'text-violet-300' : 'text-foreground/70'
                      )}>
                        {l}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ TAB: EVALUATE */}
          {activeTab === 'evaluate' && (
            <ScrollArea className="h-full p-6">
              <div className="max-w-4xl mx-auto space-y-6">

                {/* Model info card */}
                <div className="rounded-xl border p-5 bg-card/50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold">Trained Model</p>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={loadModelInfo}>
                      <RotateCcw className={cn('w-3.5 h-3.5 mr-1.5', modelInfoLoading && 'animate-spin')} />
                      Refresh
                    </Button>
                  </div>
                  {modelInfo?.exists ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Accuracy', value: fmt(modelInfo.accuracy), color: 'text-emerald-400' },
                        { label: 'Base Model', value: modelInfo.base_model || '—', color: 'text-violet-400' },
                        { label: 'Model Size', value: `${modelInfo.size_mb} MB`, color: 'text-blue-400' },
                        { label: 'Trained At', value: modelInfo.trained_at ? new Date(modelInfo.trained_at).toLocaleDateString() : '—', color: 'text-amber-400' },
                      ].map(s => (
                        <div key={s.label} className="rounded-lg bg-muted/10 border p-3">
                          <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                          <p className={cn('text-sm font-bold font-mono', s.color)}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No trained model found. Train the model first.</p>
                  )}
                </div>

                {/* Confusion matrix */}
                {trainingMetrics?.confusion_matrix && (
                  <div className="rounded-xl border p-5 bg-card/50">
                    <p className="text-sm font-bold mb-4">Confusion Matrix</p>
                    <div className="overflow-x-auto">
                      <table className="text-xs">
                        <thead>
                          <tr>
                            <th className="p-2 text-right text-muted-foreground text-[10px]">Actual ↓ / Pred →</th>
                            {CM_LABELS.map(l => (
                              <th key={l} className="p-2 text-center font-bold" style={{ minWidth: 90 }}>
                                <span className={cn('px-1.5 py-0.5 rounded text-[10px] border', LABEL_COLORS[l])}>{l}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {trainingMetrics.confusion_matrix.map((row: number[], ri: number) => {
                            const rowSum = row.reduce((a, b) => a + b, 0);
                            return (
                              <tr key={ri}>
                                <td className="p-2 text-right">
                                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] border font-bold', LABEL_COLORS[CM_LABELS[ri]])}>
                                    {CM_LABELS[ri]}
                                  </span>
                                </td>
                                {row.map((val, ci) => {
                                  const isCorrect = ri === ci;
                                  const intensity = rowSum > 0 ? val / rowSum : 0;
                                  return (
                                    <td key={ci} className="p-2 text-center relative">
                                      <div className={cn(
                                        'rounded-lg px-4 py-3 font-mono font-bold text-sm border',
                                        isCorrect
                                          ? `bg-emerald-500/${Math.round(intensity * 40 + 10)} border-emerald-500/30 text-emerald-400`
                                          : val > 0
                                            ? 'bg-red-500/20 border-red-500/20 text-red-400'
                                            : 'bg-muted/5 border-border text-muted-foreground'
                                      )}>
                                        {val}
                                        {rowSum > 0 && <div className="text-[9px] opacity-60">{(intensity * 100).toFixed(0)}%</div>}
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Classification report */}
                {trainingMetrics?.classification_report && (
                  <div className="rounded-xl border p-5 bg-card/50">
                    <p className="text-sm font-bold mb-4">Classification Report</p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          {['Class', 'Precision', 'Recall', 'F1-Score', 'Support'].map(h => (
                            <th key={h} className="pb-2 text-left font-bold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {CM_LABELS.map(lbl => {
                          const r = trainingMetrics.classification_report[lbl];
                          if (!r) return null;
                          return (
                            <tr key={lbl}>
                              <td className="py-2"><span className={cn('px-1.5 py-0.5 rounded text-[10px] border font-bold', LABEL_COLORS[lbl])}>{lbl}</span></td>
                              <td className="py-2 font-mono">{(r.precision * 100).toFixed(1)}%</td>
                              <td className="py-2 font-mono">{(r.recall * 100).toFixed(1)}%</td>
                              <td className="py-2 font-mono font-bold text-violet-400">{(r['f1-score'] * 100).toFixed(1)}%</td>
                              <td className="py-2 font-mono text-muted-foreground">{r.support}</td>
                            </tr>
                          );
                        })}
                        <tr className="font-bold">
                          <td className="py-2 text-muted-foreground">Overall</td>
                          <td className="py-2 font-mono">{fmt(trainingMetrics.classification_report.accuracy)}</td>
                          <td className="py-2 font-mono">{fmt(trainingMetrics.classification_report.accuracy)}</td>
                          <td className="py-2 font-mono text-emerald-400">{fmt(trainingMetrics.classification_report.accuracy)}</td>
                          <td className="py-2 font-mono text-muted-foreground">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {!trainingMetrics && (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <FlaskConical className="w-14 h-14 mb-3 opacity-20" />
                    <p className="text-sm font-semibold">No evaluation data</p>
                    <p className="text-xs">Train the model to see evaluation metrics</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ TAB: TEST */}
          {activeTab === 'test' && (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="shrink-0 p-6 border-b border-border space-y-4">
                <div className="flex items-center gap-4">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alarm Classifier Test</p>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-xs text-muted-foreground">Batch mode</span>
                    <Switch checked={batchMode} onCheckedChange={v => { setBatchMode(v); setTestResults([]); }} className="scale-75" />
                    {batchMode && <span className="text-[10px] text-muted-foreground">(one alarm per line)</span>}
                  </div>
                </div>

                <textarea
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  rows={batchMode ? 6 : 2}
                  className="w-full p-3 bg-background border rounded-lg text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-violet-500/50 text-foreground"
                  placeholder={batchMode
                    ? 'Enter one alarm per line…\nInterface GigabitEthernet0/1 is down\nBGP neighbor went down\nLink restored on xe-0/0/1'
                    : 'Enter alarm text to classify…'
                  }
                />

                <div className="flex items-center gap-3">
                  <Button onClick={handlePredict} disabled={testLoading || !modelInfo?.exists}
                    className="px-6">
                    {testLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Classifying…</>
                      : <><Zap className="w-4 h-4 mr-2" />Classify</>
                    }
                  </Button>
                  {!modelInfo?.exists && (
                    <p className="text-xs text-amber-400 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Train the model first
                    </p>
                  )}
                  {testResults.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs ml-auto"
                      onClick={() => setTestResults([])}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Clear
                    </Button>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {testResults.map((r, i) => (
                    <div key={i} className={cn(
                      'rounded-xl border p-4 transition-all',
                      { LINK_DOWN: 'border-red-500/20 bg-red-500/5', LINK_UP: 'border-emerald-500/20 bg-emerald-500/5', UNKNOWN: 'border-amber-500/20 bg-amber-500/5' }[r.prediction] || 'border-border bg-card/50'
                    )}>
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', LABEL_DOT[r.prediction] || 'bg-muted-foreground')} />
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-black border', LABEL_COLORS[r.prediction] || '')}>
                          {r.prediction}
                        </span>
                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-xs text-muted-foreground">Confidence</span>
                          <div className="w-24 h-2 rounded-full bg-muted/30 overflow-hidden">
                            <div className={cn('h-full rounded-full',
                              r.confidence > 0.9 ? 'bg-emerald-500' :
                              r.confidence > 0.7 ? 'bg-amber-500' : 'bg-red-500'
                            )} style={{ width: `${r.confidence * 100}%` }} />
                          </div>
                          <span className="text-xs font-mono font-bold">{(r.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* Texts */}
                      <div className="space-y-1.5 mb-3">
                        <div>
                          <span className="text-[9px] font-black uppercase text-muted-foreground">Raw</span>
                          <p className="text-xs font-mono text-foreground/80 mt-0.5">{r.raw_text}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-muted-foreground">Preprocessed</span>
                          <p className="text-xs font-mono text-foreground/60 mt-0.5">{r.processed_text}</p>
                        </div>
                      </div>

                      {/* Score bars */}
                      <div className="space-y-1">
                        {r.all_scores.map(s => (
                          <div key={s.label} className="flex items-center gap-3">
                            <span className={cn('text-[10px] font-bold w-20 shrink-0', { LINK_DOWN: 'text-red-400', LINK_UP: 'text-emerald-400', UNKNOWN: 'text-amber-400' }[s.label] || '')}>{s.label}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                              <div className={cn('h-full rounded-full',
                                { LINK_DOWN: 'bg-red-500', LINK_UP: 'bg-emerald-500', UNKNOWN: 'bg-amber-500' }[s.label] || 'bg-violet-500'
                              )} style={{ width: `${s.score * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-mono w-12 text-right text-muted-foreground">{(s.score * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {testResults.length === 0 && !testLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                      <TestTube2 className="w-14 h-14 mb-3 opacity-20" />
                      <p className="text-sm font-semibold">No predictions yet</p>
                      <p className="text-xs">Enter alarm text above and click Classify</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
