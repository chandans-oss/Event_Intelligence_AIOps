import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { 
  Database, 
  Layers, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Sliders,
  Sparkles,
  Target,
  MessageSquare,
  Network,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Separator } from "@/shared/components/ui/separator";
import { DedupSidebar, Technique } from "@/components/dedup/DedupSidebar";

// --- Types ---
interface RawEvent {
  id: number;
  raw: string;
  device: string;
  interface: string;
  event_code: string;
  timestamp: string;
}

interface DedupResult {
  id: number;
  is_duplicate: boolean;
  group_id: string;
  reason: string;
  confidence?: number;
  matched_with?: number;
  logic_details?: any;
}

// --- Mock Data ---
const SAMPLE_EVENTS: RawEvent[] = [
  { id: 1, raw: "Mar 27 10:01:01 Router1 Gi0/1 down", device: "Router1", interface: "Gi0/1", event_code: "LINK_DOWN", timestamp: "10:01:01" },
  { id: 2, raw: "Mar 27 10:01:02 Router1 Gi0/1 down", device: "Router1", interface: "Gi0/1", event_code: "LINK_DOWN", timestamp: "10:01:02" },
  { id: 3, raw: "Mar 27 10:01:05 Router1 Gi0/1 down", device: "Router1", interface: "Gi0/1", event_code: "LINK_DOWN", timestamp: "10:01:05" },
  { id: 4, raw: "Mar 27 10:01:10 SW-CORE-1 Te1/1/1 flap", device: "SW-CORE-1", interface: "Te1/1/1", event_code: "IF_FLAP", timestamp: "10:01:10" },
  { id: 5, raw: "Mar 27 10:01:12 SW-CORE-1 Te1/1/1 flap detected", device: "SW-CORE-1", interface: "Te1/1/1", event_code: "IF_FLAP", timestamp: "10:01:12" },
  { id: 6, raw: "Mar 27 10:01:15 Router1 Gi0/2 down", device: "Router1", interface: "Gi0/2", event_code: "LINK_DOWN", timestamp: "10:01:15" },
  { id: 7, raw: "Mar 27 10:02:01 Firewall-01 Eth1 traffic blocked", device: "Firewall-01", interface: "Eth1", event_code: "ACL_DENY", timestamp: "10:02:01" },
  { id: 8, raw: "Mar 27 10:02:01 Firewall-01 Eth1 traffic blocked", device: "Firewall-01", interface: "Eth1", event_code: "ACL_DENY", timestamp: "10:02:01" },
  { id: 9, raw: "Mar 27 10:03:00 Core-SW-1 Port 10 error", device: "Core-SW-1", interface: "Port 10", event_code: "PORT_ERR", timestamp: "10:03:00" },
  { id: 10, raw: "Mar 27 10:03:01 Core-SW-1 Port 10 error", device: "Core-SW-1", interface: "Port 10", event_code: "PORT_ERR", timestamp: "10:03:01" },
  { id: 11, raw: "Mar 27 10:04:10 Router2 BGP neighbor down", device: "Router2", interface: "Gi0/0", event_code: "BGP_DOWN", timestamp: "10:04:10" },
  { id: 12, raw: "Mar 27 10:04:15 Router2 BGP neighbor down", device: "Router2", interface: "Gi0/0", event_code: "BGP_DOWN", timestamp: "10:04:15" },
  { id: 13, raw: "Mar 27 10:05:00 Dist-1 CPU 90%", device: "Dist-1", interface: "System", event_code: "CPU_HIGH", timestamp: "10:05:00" },
  { id: 14, raw: "Mar 27 10:05:05 Dist-1 CPU 92%", device: "Dist-1", interface: "System", event_code: "CPU_HIGH", timestamp: "10:05:05" },
  { id: 15, raw: "Mar 27 10:06:00 Router1 Gi0/1 up", device: "Router1", interface: "Gi0/1", event_code: "LINK_UP", timestamp: "10:06:00" },
];

const TECHNIQUE_CONFIGS: Record<Technique, { label: string, icon: any, desc: string }> = {
  exact: { label: "Exact Match", icon: Target, desc: "Bit-by-bit identical raw log string comparison." },
  structured: { label: "Structured Exact", icon: Layers, desc: "Matches based on key fields: {Device, Interface, Code}." },
  state: { label: "State Transition", icon: RefreshCw, desc: "Suppresses repeated states without a transition." },
  template: { label: "Template-Based", icon: MessageSquare, desc: "Normalizes logs into templates before matching." },
  similarity: { label: "Similarity-Based", icon: Sliders, desc: "Uses TF-IDF + Cosine distance for fuzzy text matching." },
  semantic: { label: "Semantic-Based", icon: BrainCircuit, desc: "Uses LLM embeddings to cluster contextually identical events." },
};

export default function DeduplicationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const technique = (searchParams.get('technique') as Technique) || 'exact';
  const config = TECHNIQUE_CONFIGS[technique];

  const [events, setEvents] = useState<RawEvent[]>([]);
  const [results, setResults] = useState<Record<number, DedupResult>>({});
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTechniqueChange = (newTechnique: Technique) => {
    const params = new URLSearchParams(searchParams);
    params.set('technique', newTechnique);
    setSearchParams(params);
  };

  // Reset when technique changes
  useEffect(() => {
    // Automatically load samples for a better first impression
    setEvents(SAMPLE_EVENTS);
    setResults({});
    setSelectedEventId(null);
  }, [technique]);

  const loadSamples = () => {
    setIsUpdating(true);
    setEvents([]);
    setResults({});
    setSelectedEventId(null);
    
    // Aesthetic delay to show the "loading" action
    setTimeout(() => {
      setEvents(SAMPLE_EVENTS);
      setIsUpdating(false);
    }, 600);
  };

  const runDedup = () => {
    if (events.length === 0) return;
    setIsRunning(true);
    
    // Simulate API delay
    setTimeout(() => {
      const mockResults: Record<number, DedupResult> = {};
      
      const seenHashes = new Set<string>();
      const seenSignatures = new Set<string>();
      
      events.forEach((evt, idx) => {
        if (technique === 'exact') {
          const isDup = seenHashes.has(evt.raw);
          mockResults[evt.id] = { 
            id: evt.id, is_duplicate: isDup, group_id: isDup ? "G-HASH-1" : `G-HASH-${evt.id}`, 
            reason: isDup ? "Identical SHA256 matches existing event" : "Unique bitstream detected",
            logic_details: isDup ? { method: "SHA256 Match", matchedWith: events.find(e => e.raw === evt.raw)?.id } : undefined
          };
          seenHashes.add(evt.raw);
        } else if (technique === 'structured') {
          const sig = `${evt.device}|${evt.interface}|${evt.event_code}`;
          const isDup = seenSignatures.has(sig);
          mockResults[evt.id] = { 
            id: evt.id, is_duplicate: isDup, group_id: isDup ? "G-STRUCT-1" : `G-STRUCT-${evt.id}`,
            reason: isDup ? "Logical fields match existing signature" : "New resource event signature",
            logic_details: { signature: sig }
          };
          seenSignatures.add(sig);
        } else if (technique === 'similarity') {
          const isDup = evt.id === 5 || evt.id === 10 || evt.id === 14;
          mockResults[evt.id] = { 
            id: evt.id, is_duplicate: isDup, group_id: isDup ? "G-SIM-1" : "G-SIM-NEW",
            reason: isDup ? "Fuzzy similarity score exceeds 0.90 threshold" : "Low similarity to existing clusters",
            confidence: isDup ? 0.91 + (Math.random() * 0.05) : 0.45
          };
        } else if (technique === 'state') {
          const isDup = evt.id === 2 || evt.id === 3 || evt.id === 12;
          mockResults[evt.id] = { 
            id: evt.id, is_duplicate: isDup, group_id: "G-STATE",
            reason: isDup ? "Suppressed: State remains unchanged" : "New operational state transition",
            logic_details: { lastState: "DOWN", currentState: "DOWN" }
          };
        } else {
          mockResults[evt.id] = { id: evt.id, is_duplicate: false, group_id: `G-${evt.id}`, reason: "Unique occurrence processed." };
        }
      });
      
      setResults(mockResults);
      setIsRunning(false);
    }, 600);
  };

  const selectedResult = selectedEventId ? results[selectedEventId] : null;
  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <DedupSidebar 
          activeTechnique={technique} 
          onTechniqueChange={handleTechniqueChange} 
        />
        
        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="glass-card rounded-xl p-6 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <config.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">Dedup Lab: {config.label}</h1>
                    <p className="text-sm text-muted-foreground">{config.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={loadSamples}
                    disabled={isUpdating}
                    variant="outline"
                    className="gap-2 bg-secondary/50 border-border/50 transition-all hover:bg-secondary/80"
                  >
                    <RefreshCw className={cn("h-4 w-4", isUpdating ? "animate-spin" : (events.length > 0 ? "text-status-success" : ""))} />
                    Load Sample Events
                  </Button>
                  <Button 
                    onClick={runDedup}
                    disabled={events.length === 0 || isRunning}
                    className="gap-2 font-bold"
                  >
                    {isRunning ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )}
                    Run Deduplication
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Interface */}
            <div className="flex gap-4">
              <div className={cn(
                "transition-all duration-300",
                selectedEventId ? "w-2/3" : "w-full"
              )}>
                <div className="glass-card rounded-xl overflow-hidden border border-border/50 h-[calc(100vh-220px)] flex flex-col">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary/50 border-b border-border text-xs font-bold text-muted-foreground tracking-wide">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-2">Device / Interface</div>
                    <div className="col-span-4">Original Message</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-3">Reasoning</div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="divide-y divide-border">
                      {events.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground opacity-50 ">
                          <Database className="h-10 w-10 mb-2" />
                          <p>No events loaded for this logic.</p>
                        </div>
                      ) : (
                        events.map((evt) => {
                          const result = results[evt.id];
                          return (
                            <div 
                              key={evt.id}
                              onClick={() => setSelectedEventId(evt.id)}
                              className={cn(
                                "grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-all hover:bg-secondary/30 items-center",
                                selectedEventId === evt.id && "bg-secondary/50 ring-1 ring-primary/20"
                              )}
                            >
                              <div className="col-span-1 font-mono text-xs">{evt.id}</div>
                              <div className="col-span-2">
                                <p className="text-sm font-semibold">{evt.device}</p>
                                <p className="text-[10px] text-muted-foreground">{evt.interface}</p>
                              </div>
                              <div className="col-span-4 text-xs font-mono text-muted-foreground break-all line-clamp-2">
                                {evt.raw}
                              </div>
                              <div className="col-span-2 text-center">
                                {result ? (
                                  <Badge className={cn(
                                    "text-[10px] tracking-tight py-0 w-20 justify-center font-bold",
                                    result.is_duplicate ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-primary/20 text-primary border-primary/30"
                                  )}>
                                    {result.is_duplicate ? "Duplicate" : "Unique"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] font-bold">Pending</Badge>
                                )}
                              </div>
                              <div className="col-span-3 text-xs text-muted-foreground line-clamp-1 ">
                                {result?.reason || "Awaiting processing..."}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Right Panel */}
              {selectedEventId && (
                <div className="w-1/3 animate-in slide-in-from-right-4 duration-300">
                  <Card className="glass-card h-[calc(100vh-220px)] border border-border/50 flex flex-col">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Event Insight
                      </h3>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedEventId(null)} className="h-8 w-8">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <ScrollArea className="flex-1">
                      <div className="p-6 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <LabelAndValue label="Status" value={
                              <Badge className={cn(
                                 "font-bold uppercase tracking-widest",
                                 selectedResult?.is_duplicate ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                               )}>
                                 {selectedResult?.is_duplicate ? "Duplicate" : "Unique"}
                               </Badge>
                            } />
                          </div>
                          
                          <div>
                            <LabelAndValue label="Technique" value={config.label} />
                          </div>

                          <Separator className="bg-border/30" />

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground">Reasoning</p>
                            <p className="text-sm font-semibold leading-relaxed text-foreground bg-primary/5 p-3 rounded-lg border border-primary/20 ">
                              "{selectedResult?.reason}"
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground">Raw Payload</p>
                            <div className="p-4 bg-secondary/30 rounded-lg font-mono text-[11px] text-muted-foreground break-all border border-border/50 leading-relaxed">
                              {selectedEvent?.raw}
                            </div>
                          </div>

                          {/* Logic Specific details */}
                          {selectedResult?.logic_details && (
                            <div className="space-y-4 mt-6">
                              <p className="text-[10px] font-bold text-muted-foreground">Internal Trace</p>
                              <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border/50">
                                {Object.entries(selectedResult.logic_details).map(([key, val]: [string, any]) => (
                                  <div key={key} className="flex justify-between items-start text-xs border-b border-border/20 last:border-none pb-2 mb-2 last:pb-0 last:mb-0">
                                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                    <span className="font-mono text-foreground text-right">{val.toString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedResult?.confidence && (
                            <div className="pt-4">
                                <LabelAndValue 
                                  label="Confidence Score" 
                                  value={`${(selectedResult.confidence * 100).toFixed(0)}%`} 
                                />
                                <div className="h-1.5 w-full bg-secondary rounded-full mt-2">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${selectedResult.confidence * 100}%` }} />
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
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
