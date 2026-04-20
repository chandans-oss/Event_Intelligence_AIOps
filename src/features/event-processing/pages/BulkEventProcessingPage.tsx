import { useState, useMemo } from "react";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Download,
  Layers,
  ShieldCheck,
  Database,
  ArrowRight,
  Sparkles,
  Info,
  ChevronRight,
  Filter,
  FileText,
  HelpCircle
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Separator } from "@/shared/components/ui/separator";
import { Progress } from "@/shared/components/ui/progress";

// --- Types ---
interface BulkEvent {
  id: number;
  raw: string;
  source: 'network' | 'server' | 'app';
  device: string;
  is_duplicate: boolean;
  is_suppressed: boolean;
  dedup_reason?: string;
  suppress_reason?: string;
  final_status: 'passed' | 'removed';
}

interface SummaryStats {
  total: number;
  duplicates: number;
  suppressed: number;
  final: number;
}

// --- Mock Data ---
const MOCK_EVENTS: BulkEvent[] = [
  { id: 101, raw: "Interface Gi0/1 down", source: 'network', device: 'Router1', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 102, raw: "Interface Gi0/1 down", source: 'network', device: 'Router1', is_duplicate: true, is_suppressed: false, dedup_reason: "Exact Match", final_status: 'removed' },
  { id: 103, raw: "CPU High 98%", source: 'server', device: 'Srv-DB-01', is_duplicate: false, is_suppressed: true, suppress_reason: "Maintenance Window", final_status: 'removed' },
  { id: 104, raw: "BGP Session Down", source: 'network', device: 'Core-R1', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 105, raw: "Memory Leak Detected", source: 'app', device: 'Web-App-Prod', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 106, raw: "High Latency Node A", source: 'network', device: 'Edge-Switch', is_duplicate: true, is_suppressed: true, dedup_reason: "Semantic Cluster", suppress_reason: "Topology Child", final_status: 'removed' },
  { id: 107, raw: "SSH Login Failure", source: 'app', device: 'Auth-Srv', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 108, raw: "UPS Battery Low", source: 'app', device: 'DC-UPS-1', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 109, raw: "OSPF Neighbor Change", source: 'network', device: 'Router2', is_duplicate: true, is_suppressed: false, dedup_reason: "Exact Match", final_status: 'removed' },
  { id: 110, raw: "Disk Usage 92%", source: 'server', device: 'Storage-01', is_duplicate: false, is_suppressed: true, suppress_reason: "Business Hours", final_status: 'removed' },
  { id: 111, raw: "VLAN Mismatched", source: 'network', device: 'Dist-SW-2', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 112, raw: "Power Supply Fail", source: 'server', device: 'Host-Node-A', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 113, raw: "Packet Loss 5%", source: 'network', device: 'Link-HQ-Edge', is_duplicate: true, is_suppressed: true, dedup_reason: "Structured Template", suppress_reason: "Dynamic Threshold", final_status: 'removed' },
  { id: 114, raw: "NTP Sync Failure", source: 'network', device: 'Clock-Srv', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
  { id: 115, raw: "API Timeout 504", source: 'app', device: 'Gateway-API', is_duplicate: false, is_suppressed: false, final_status: 'passed' },
];

export default function BulkEventProcessingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkEvent[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'duplicates' | 'suppressed' | 'final'>('all');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const [selectedLogic, setSelectedLogic] = useState<string | null>(null);

  const stats: SummaryStats = useMemo(() => {
    if (!results) return { total: 0, duplicates: 0, suppressed: 0, final: 0 };
    return {
      total: 10000,
      duplicates: 3500,
      suppressed: 4000,
      final: 2500,
    };
  }, [results]);

  const logicStats = useMemo(() => {
    if (!results) return null;
    return {
      dedup: [
        { name: "Exact Match", count: 1250 },
        { name: "Semantic Cluster", count: 1100 },
        { name: "Structured Template", count: 1150 }
      ],
      suppress: [
        { name: "Maintenance Window", count: 1500 },
        { name: "Topology Child", count: 1200 },
        { name: "Flap Detection", count: 1300 }
      ]
    };
  }, [results]);

  const filteredResults = useMemo(() => {
    if (!results) return [];
    let list = results;
    if (filter === 'duplicates') list = results.filter(e => e.is_duplicate);
    else if (filter === 'suppressed') list = results.filter(e => e.is_suppressed);
    else if (filter === 'final') list = results.filter(e => e.final_status === 'passed');

    if (selectedLogic) {
      list = list.filter(e =>
        e.dedup_reason?.includes(selectedLogic) ||
        e.suppress_reason?.includes(selectedLogic)
      );
    }
    return list;
  }, [results, filter, selectedLogic]);

  const handleUpload = () => {
    setFile({ name: 'event_data.xlsx' } as File);
  };

  const runProcessing = () => {
    setIsProcessing(true);
    setProgress(0);
    setResults(null);
    setSelectedLogic(null);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setResults(MOCK_EVENTS);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const selectedEvent = selectedEventId ? results?.find(e => e.id === selectedEventId) : null;

  return (
    <MainLayout>
      <div className="p-4 space-y-4 animate-in fade-in duration-500">
        {/* Header with Integrated Actions */}
        <div className="glass-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                   <Database className="h-6 w-6" />
                </div>
                <div>
                   <div className="flex items-center gap-2">
                     <h1 className="text-xl font-bold text-foreground">Bulk Processing Lab</h1>
                     <a href="http://10.0.4.211:7070/docs" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title="View Documentation">
                       <HelpCircle className="h-5 w-5" />
                     </a>
                   </div>
                   <p className="text-sm text-muted-foreground line-clamp-1 truncate max-w-xs">Intelligent signal extraction from massive event dumps.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-border/50">
                <Button
                  variant="outline"
                  onClick={handleUpload}
                  className={cn(
                    "gap-2 h-10 px-4 text-xs font-bold border-border/50",
                    file ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/30"
                  )}
                >
                   <FileSpreadsheet className="h-4 w-4" />
                   {file ? file.name : "Upload Excel"}
                </Button>

                <Button
                  onClick={runProcessing}
                  disabled={!file || isProcessing}
                  className="gap-2 h-10 px-4 text-xs font-bold shadow-lg shadow-primary/10"
                >
                   {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                   Process Events
                </Button>

                {/* Append Export Buttons after processing */}
                {results && !isProcessing && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <Separator orientation="vertical" className="h-6 bg-border/50 mx-1" />
                    <Button variant="ghost" className="gap-2 h-10 px-4 text-xs font-bold text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                       <Download className="h-4 w-4" /> Full Report
                    </Button>
                    <Button variant="ghost" className="gap-2 h-10 px-4 text-xs font-bold text-primary hover:bg-primary/10">
                       <Download className="h-4 w-4" /> Clean Signal Only
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {file && (
              <div className="flex items-center gap-2 animate-in fade-in duration-500 pr-2">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-1 text-[10px] space-x-1 font-bold">
                   <CheckCircle2 className="h-3 w-3" />
                   <span>3 Sheets Detected</span>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {results && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Summary Dashboard - Full Width */}
            <div className="grid grid-cols-4 gap-4">
              <SummaryCard label="Total Input" val={stats.total.toLocaleString()} sub="Events processed" icon={Database} />
              <SummaryCard label="Duplicates" val={stats.duplicates.toLocaleString()} sub="Redundant removed" icon={Layers} color="text-rose-500" />
              <SummaryCard label="Suppressed" val={stats.suppressed.toLocaleString()} sub="Noise suppressed" icon={ShieldCheck} color="text-orange-500" />
              <SummaryCard label="Actionable" val={stats.final.toLocaleString()} sub="Ready for correlation" icon={Sparkles} color="text-emerald-500" isLast />
            </div>

            {/* Sub-Header Tabs */}
            <div className="flex bg-secondary/30 p-1.5 rounded-xl border border-border/50 w-fit">
              {[
                { id: 'all', label: 'All Events', icon: Database },
                { id: 'duplicates', label: 'Duplicates', icon: Layers },
                { id: 'suppressed', label: 'Suppressed', icon: ShieldCheck },
                { id: 'final', label: 'Actionable Events', icon: Sparkles }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setFilter(tab.id as any); setSelectedLogic(null); }}
                  className={cn(
                    "px-6 py-2.5 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-2 transition-all",
                    filter === tab.id ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                   <tab.icon className="h-3.5 w-3.5" />
                   {tab.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              {/* Logic Sidebar (Only for Duplicates/Suppressed) */}
              {(filter === 'duplicates' || filter === 'suppressed') && (
                <Card className="w-64 glass-card border border-border/50 p-4 shrink-0 animate-in slide-in-from-left-4 duration-300">
                  <h3 className="text-[10px] font-bold text-muted-foreground mb-4 tracking-widest uppercase">
                    {filter === 'duplicates' ? 'Deduplication Logic' : 'Suppression Logic'}
                  </h3>
                  <div className="space-y-2">
                    <div
                      onClick={() => setSelectedLogic(null)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group",
                        selectedLogic === null
                          ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                          : "bg-secondary/30 border-border/50 hover:bg-secondary/20"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className={cn(
                          "text-[10px] font-bold transition-colors",
                          selectedLogic === null ? "text-primary" : "text-foreground group-hover:text-primary"
                        )}>All Logics</span>
                        <span className="text-[8px] text-muted-foreground opacity-70">Reset Filter</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-black bg-black/20">
                        {filter === 'duplicates' ? stats.duplicates : stats.suppressed}
                      </Badge>
                    </div>

                    {((filter === 'duplicates' ? logicStats?.dedup : logicStats?.suppress) || []).map(logic => (
                      <div
                        key={logic.name}
                        onClick={() => setSelectedLogic(selectedLogic === logic.name ? null : logic.name)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group",
                          selectedLogic === logic.name
                            ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                            : "bg-secondary/30 border-border/50 hover:bg-secondary/20"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className={cn(
                            "text-[10px] font-bold transition-colors",
                            selectedLogic === logic.name ? "text-primary" : "text-foreground group-hover:text-primary"
                          )}>{logic.name}</span>
                          <span className="text-[8px] text-muted-foreground opacity-70">Impacted Events</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-black bg-secondary/40">{logic.count}</Badge>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4 bg-border/20" />
                  <div className="p-3 bg-secondary/20 rounded-lg flex items-center gap-3">
                    <Info className="h-4 w-4 text-primary opacity-50" />
                    <p className="text-[9px] text-muted-foreground leading-tight ">
                      Select common logic to filter the trace grid results.
                    </p>
                  </div>
                </Card>
              )}

              {/* Main Trace Grid */}
              <Card className={cn(
                "glass-card border border-border/50 overflow-hidden flex flex-col h-[calc(100vh-320px)] transition-all duration-300",
                selectedEventId ? "w-2/3" : "flex-1"
              )}>
                <div className="p-4 bg-secondary/30 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground tracking-widest">
                       <Filter className="h-4 w-4" /> Trace Visualization
                    </h3>
                    {selectedLogic && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 space-x-1 py-1 font-bold">
                        <span className="text-[8px] opacity-70">Filtering:</span>
                        <span className="text-[9px]">{selectedLogic}</span>
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground opacity-50">
                    <ShieldCheck className="h-3 w-3" />
                    Automated Processing Active
                  </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary/50 border-b border-border text-xs font-bold text-muted-foreground tracking-wide">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-2">Resource</div>
                  <div className="col-span-6">Original Message</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="divide-y divide-border">
                    {filteredResults.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        className={cn(
                          "grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-secondary/30 items-center",
                          selectedEventId === evt.id && "bg-secondary/50 ring-1 ring-primary/20",
                          evt.final_status === 'removed' && "opacity-60"
                        )}
                      >
                        <div className="col-span-1 font-mono text-[10px] opacity-50">#{evt.id}</div>
                        <div className="col-span-2 text-xs font-bold">{evt.device}</div>
                        <div className="col-span-6 text-xs font-mono line-clamp-1 opacity-80">{evt.raw}</div>
                        <div className="col-span-3 flex items-center justify-end gap-2">
                           {evt.is_duplicate && <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[7px] px-1 font-bold">Duplicate</Badge>}
                           {evt.is_suppressed && <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[7px] px-1 font-bold">Suppressed</Badge>}
                          <div className={cn(
                            "h-6 w-20 flex items-center justify-center rounded-md font-bold text-[9px] border",
                            evt.final_status === 'passed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          )}>
                             {evt.final_status === 'passed' ? 'Actionable' : 'Removed'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>

              {/* Right Insight Panel */}
              {selectedEventId && selectedEvent && (
                <Card className="w-1/3 glass-card border border-border/50 animate-in slide-in-from-right-4 duration-300 flex flex-col">
                  <div className="p-4 border-b border-border flex items-center justify-between shadow-sm">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                       <BarChart3 className="h-4 w-4 text-primary" />
                       Processing Detail
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedEventId(null)} className="h-6 w-6">
                       <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm border-b border-border/50 pb-4">
                          <span className="text-muted-foreground font-medium">Processing Result</span>
                          <Badge className={cn(
                            "font-bold",
                            selectedEvent.final_status === 'passed' ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"
                          )}>
                             {selectedEvent.final_status === 'passed' ? "Actionable Signal" : "Operational Noise"}
                          </Badge>
                        </div>

                        <div className="p-4 bg-secondary/30 rounded-xl space-y-4 border border-border/50 mt-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground opacity-50">1. Deduplication Trace</p>
                            <div className="flex items-center justify-between">
                               <span className="text-xs font-bold">{selectedEvent.is_duplicate ? "Duplicate Found" : "Unique Event"}</span>
                               {selectedEvent.is_duplicate ? <XCircle className="h-4 w-4 text-rose-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </div>
                            {selectedEvent.dedup_reason && (
                              <p className="text-[10px] text-rose-500  mt-1 pl-2 border-l border-rose-500/30 font-medium">"{selectedEvent.dedup_reason}"</p>
                            )}
                          </div>

                          <Separator className="bg-border/20" />

                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-muted-foreground opacity-50">2. Suppression Check</p>
                            <div className="flex items-center justify-between">
                               <span className="text-xs font-bold">{selectedEvent.is_suppressed ? "Noise Suppressed" : "Active Critical"}</span>
                               {selectedEvent.is_suppressed ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                            </div>
                            {selectedEvent.suppress_reason && (
                              <p className="text-[10px] text-orange-500  mt-1 pl-2 border-l border-orange-500/30 font-medium">"{selectedEvent.suppress_reason}"</p>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col items-center text-center gap-2 mt-4 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-5">
                             <Sparkles className="h-10 w-10 text-primary" />
                          </div>
                          <p className="text-[9px] font-bold tracking-widest text-primary opacity-80">Actionable Outcome</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed px-4 relative z-10">
                            {selectedEvent.final_status === 'passed'
                              ? "Signal extracted successfully. Verified as actionable intelligence ready for root cause analysis."
                              : "Identified as operational noise. Temporarily removed from the active correlation workspace."}
                          </p>
                        </div>

                        <div className="space-y-2 pt-4">
                          <p className="text-[10px] font-bold text-muted-foreground">Raw Payload</p>
                          <div className="p-3 bg-secondary/40 rounded-lg font-mono text-[10px] text-muted-foreground break-all border border-border/50">
                            {selectedEvent.raw}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function SummaryCard({ label, val, sub, icon: Icon, color = "text-foreground", isLast = false }: any) {
  return (
    <Card className={cn(
      "glass-card border border-border/50 p-5 relative overflow-hidden group hover:translate-y-[-2px] transition-all",
      isLast && "bg-primary/5 border-primary/20"
    )}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="h-12 w-12" />
      </div>
      <p className="text-[10px] font-black text-muted-foreground tracking-widest mb-1">{label}</p>
      <div className={cn("text-3xl font-black mb-1", color)}>{val}</div>
      <p className="text-[10px] text-muted-foreground opacity-70 ">{sub}</p>
    </Card>
  );
}

function PipelineNode({ label, val, color, sub, highlight = false }: any) {
  return (
    <div className={cn(
      "p-3 rounded-xl border flex items-center justify-between",
      highlight ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "border-border/50 bg-secondary/20"
    )}>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-muted-foreground">{label}</span>
        <span className="text-[10px] opacity-70 ">{sub}</span>
      </div>
      <Badge className={cn("font-black tracking-tight", color)}>{val}</Badge>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="flex justify-center -my-1">
      <div className="h-4 w-px bg-border/50" />
    </div>
  );
}

function LabelAndValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
