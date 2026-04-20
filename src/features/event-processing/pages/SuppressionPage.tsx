import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";
import { 
  Database, 
  Play, 
  RefreshCw, 
  XCircle, 
  CheckCircle2,
  Info, 
  Sparkles,
  Search,
  Filter,
  Activity,
  Calendar,
  Clock,
  Tag,
  Network,
  MapPin,
  Layers,
  Zap,
  History,
  TrendingUp,
  Snowflake,
  ShieldCheck,
  GitMerge
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Separator } from "@/shared/components/ui/separator";
import { SuppressionSidebar, SuppressionTechnique } from "@/components/suppression/SuppressionSidebar";

// --- Types ---
interface RawEvent {
  id: number;
  raw: string;
  device: string;
  interface: string;
  event_code: string;
  timestamp: string;
  category?: string;
}

interface SuppressionResult {
  id: number;
  is_suppressed: boolean;
  category: string;
  reason: string;
  policy_id?: string;
  logic_details?: any;
}

// --- Mock Data ---
const SAMPLE_EVENTS: RawEvent[] = [
  { id: 1, raw: "Mar 27 02:15:01 Router1 REBOOT detected", device: "Router1", interface: "System", event_code: "SYS_REBOOT", timestamp: "02:15:01" },
  { id: 2, raw: "Mar 27 02:16:10 SW-CORE-1 Te1/1/1 flap", device: "SW-CORE-1", interface: "Te1/1/1", event_code: "IF_FLAP", timestamp: "02:16:10" },
  { id: 3, raw: "Mar 27 02:16:15 SW-CORE-1 Te1/1/1 flap", device: "SW-CORE-1", interface: "Te1/1/1", event_code: "IF_FLAP", timestamp: "02:16:15" },
  { id: 4, raw: "Mar 27 02:16:20 Gateway-HQ CPU high 92%", device: "Gateway-HQ", interface: "CPU", event_code: "PERF_CPU", timestamp: "02:16:20" },
  { id: 5, raw: "Mar 27 02:20:01 Edge-R3 BGP session down", device: "Edge-R3", interface: "BGP", event_code: "BGP_DOWN", timestamp: "02:20:01" },
  { id: 6, raw: "Mar 27 02:20:05 Printer-Floor2 Offline", device: "Printer-Floor2", interface: "Service", event_code: "SRV_OFFLINE", timestamp: "02:20:05" },
  { id: 7, raw: "Mar 27 02:25:00 Dev-Srv-01 SSH login failed", device: "Dev-Srv-01", interface: "Auth", event_code: "LOGIN_FAIL", timestamp: "02:25:00" },
  { id: 8, raw: "Mar 27 02:30:10 Core-SW-1 Gi0/10 input errors", device: "Core-SW-1", interface: "Gi0/10", event_code: "PORT_ERR", timestamp: "02:30:10" },
  { id: 9, raw: "Mar 27 02:35:00 Router2 OSPF neighbor change", device: "Router2", interface: "Gi0/1", event_code: "OSPF_CHG", timestamp: "02:35:00" },
  { id: 10, raw: "Mar 27 02:40:00 UPS-Unit-1 Battery Low", device: "UPS-Unit-1", interface: "Power", event_code: "PWR_LOW", timestamp: "02:40:00" },
  { id: 11, raw: "Mar 27 02:45:00 SW-Dist-2 Port 2/1 disabled", device: "SW-Dist-2", interface: "Port 2/1", event_code: "PORT_DIS", timestamp: "02:45:00" },
  { id: 12, raw: "Mar 27 02:50:00 FW-EXT-01 High session count", device: "FW-EXT-01", interface: "Global", event_code: "SESS_HIGH", timestamp: "02:50:00" },
  { id: 13, raw: "Mar 27 02:55:00 Storage-Net-A Disk space 88%", device: "Storage-Net-A", interface: "Disk", event_code: "DISK_WARN", timestamp: "02:55:00" },
  { id: 14, raw: "Mar 27 03:00:00 Router3 Memory 94%", device: "Router3", interface: "System", event_code: "MEM_HIGH", timestamp: "03:00:00" },
  { id: 15, raw: "Mar 27 03:05:00 Core-R1 VPN tunnel down", device: "Core-R1", interface: "Tun10", event_code: "VPN_DOWN", timestamp: "03:05:00" },
];

const TECHNIQUE_CONFIGS: Record<SuppressionTechnique, { label: string, icon: any, desc: string }> = {
  maintenance: { label: "Maintenance Window", icon: Calendar, desc: "Suppresses alerts during scheduled downtime." },
  business_hours: { label: "Business Hours", icon: Clock, desc: "Operating hours logic for non-critical assets." },
  tag_based: { label: "Tag-Based", icon: Tag, desc: "Filtering based on environment and system metadata." },
  parent_child: { label: "Parent-Child", icon: Network, desc: "Root cause analysis via topology dependency." },
  spatial: { label: "Spatial", icon: MapPin, desc: "Regional or local aggregation of concurrent events." },
  dedup_suppress: { label: "Dedup-Based", icon: Layers, desc: "Removal of high-frequency sub-second repeats." },
  time_window: { label: "Time-Window", icon: History, desc: "Suppression of redundant events in a sliding window." },
  flap_detection: { label: "Flap Detection", icon: Activity, desc: "Stability check for oscillating interface states." },
  temporal_cluster: { label: "Temporal Cluster", icon: GitMerge, desc: "Grouping of events occurring in close proximity." },
  dynamic_threshold: { label: "Dynamic Threshold", icon: TrendingUp, desc: "Suppression of events within learned baselines." },
  event_storm: { label: "Event Storm", icon: Zap, desc: "Suppression of known noisy patterns during major incidents." },
  seasonal: { label: "Seasonal", icon: Snowflake, desc: "Recognition of periodic recurring events." },
};

export default function SuppressionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const technique = (searchParams.get('technique') as SuppressionTechnique) || 'maintenance';
  const config = TECHNIQUE_CONFIGS[technique];

  const [events, setEvents] = useState<RawEvent[]>(SAMPLE_EVENTS);
  const [results, setResults] = useState<Record<number, SuppressionResult>>({});
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleTechniqueChange = (newTechnique: SuppressionTechnique) => {
    const params = new URLSearchParams(searchParams);
    params.set('technique', newTechnique);
    setSearchParams(params);
  };

  useEffect(() => {
    // Automatically reset when technique changes
    setEvents(SAMPLE_EVENTS);
    setResults({});
    setSelectedEventId(null);
  }, [technique]);

  const loadSamples = () => {
    setIsUpdating(true);
    setEvents([]);
    setResults({});
    setSelectedEventId(null);
    
    // Aesthetic delay to show the action
    setTimeout(() => {
      setEvents(SAMPLE_EVENTS);
      setIsUpdating(false);
    }, 600);
  };

  const runSuppression = () => {
    if (events.length === 0) return;
    setIsRunning(true);
    
    setTimeout(() => {
      const mockResults: Record<number, SuppressionResult> = {};
      
      events.forEach((evt) => {
        if (technique === 'maintenance' && (evt.id === 1 || evt.id === 15)) {
          mockResults[evt.id] = { id: evt.id, is_suppressed: true, category: "Maintenance Window", reason: "Event occurred during scheduled maintenance", policy_id: "MW-101", logic_details: { window: "02:00 – 04:00", activeCalendar: "Core Infrastructure Plan", decision: "Suppressed (Expected behavior)" } };
        } else if (technique === 'business_hours' && (evt.id === 6 || evt.id === 7)) {
          mockResults[evt.id] = { id: evt.id, is_suppressed: true, category: "Business Hours", reason: "Outside business hours (Non-critical asset)", policy_id: "BH-99", logic_details: { assetType: "Floor Printer / Dev Srv", activeHours: "09:00 – 18:00", eventTime: evt.timestamp, decision: "Suppressed / Downgraded" } };
        } else if (technique === 'tag_based' && (evt.device.includes("Dev") || evt.device.includes("Test"))) {
           mockResults[evt.id] = { id: evt.id, is_suppressed: true, category: "Tag-Based", reason: "Non-production system policy", logic_details: { tags: "env=dev", policy: "Ignore dev alerts", decision: "Suppressed" } };
        } else if (technique === 'parent_child' && (evt.id === 5 || evt.id === 15)) {
          mockResults[evt.id] = { id: evt.id, is_suppressed: true, category: "Parent-Child", reason: "Downstream impact of parent failure", policy_id: "RCA-402", logic_details: { parentEvent: "Core-R1 LINK_DOWN", topologyPath: "Core-R1 → Edge-R3", decision: "Child event suppressed" } };
        } else if (technique === 'flap_detection' && (evt.id === 2 || evt.id === 3)) {
          mockResults[evt.id] = { id: evt.id, is_suppressed: true, category: "Flap Detection", reason: "Interface instability detected", logic_details: { transitions: "DOWN → UP → DOWN → UP", count: "4 in 10s", action: "Final Alert: FLAPPING DETECTED" } };
        } else if (technique === 'dynamic_threshold' && (evt.id === 4 || evt.id === 13)) {
          mockResults[evt.id] = { id: evt.id, is_suppressed: true, category: "Dynamic Threshold", reason: "Within normal p95 baseline", logic_details: { currentVal: "92%", baselineP95: "95%", decision: "Suppressed as expected" } };
        } else if (technique === 'event_storm' && (evt.id === 2 || evt.id === 3 || evt.id === 8)) {
          mockResults[evt.id] = { id: evt.id, is_suppressed: true, category: "Event Storm", reason: "Matched known post-reboot noise pattern", logic_details: { pattern: "Network storm signature", matchedEvents: "High frequency burst", action: "Aggregated suppression" } };
        } else {
          mockResults[evt.id] = { id: evt.id, is_suppressed: false, category: "Active", reason: "Valid operational event" };
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
        <SuppressionSidebar 
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
                    <h1 className="text-xl font-bold text-foreground">Suppression Lab: {config.label}</h1>
                    <p className="text-sm text-muted-foreground">{config.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={loadSamples}
                    variant="outline"
                    disabled={isUpdating}
                    className="gap-2 bg-secondary/50 border-border/50 transition-all hover:bg-secondary/80"
                  >
                    <RefreshCw className={cn("h-4 w-4", isUpdating ? "animate-spin" : (events.length > 0 ? "text-status-success" : ""))} />
                    Load Sample Events
                  </Button>
                  <Button 
                    onClick={runSuppression}
                    disabled={events.length === 0 || isRunning}
                    className="gap-2 font-bold"
                  >
                    {isRunning ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 fill-primary" />
                    )}
                    Run Suppression
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Panel */}
            <div className="flex gap-4">
              <div className={cn(
                "transition-all duration-300",
                selectedEventId ? "w-2/3" : "w-full"
              )}>
                <div className="glass-card rounded-xl overflow-hidden border border-border/50 h-[calc(100vh-220px)] flex flex-col">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-secondary/50 border-b border-border text-xs font-bold text-muted-foreground tracking-wide">
                    <div className="col-span-1">ID</div>
                    <div className="col-span-2">Resource</div>
                    <div className="col-span-4">Event Message</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-3">Suppression Logic</div>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="divide-y divide-border">
                      {events.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-muted-foreground opacity-50 ">
                          <Database className="h-10 w-10 mb-2" />
                          <p>Click "Load Events" to test suppression policies.</p>
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
                              <div className="col-span-1 font-mono text-xs text-muted-foreground">#{evt.id}</div>
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
                                    "text-[10px] tracking-tight py-0 w-24 justify-center font-bold",
                                    result.is_suppressed ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-primary/20 text-primary border-primary/30"
                                  )}>
                                    {result.is_suppressed ? "Suppressed" : "Active"}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] font-bold">Waiting</Badge>
                                )}
                              </div>
                              <div className="col-span-3 text-xs text-muted-foreground line-clamp-1 ">
                                {result?.category || "---"}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {selectedEventId && (
                <div className="w-1/3 animate-in slide-in-from-right-4 duration-300">
                  <Card className="glass-card h-[calc(100vh-220px)] border border-border/50 flex flex-col">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Suppression Insight
                      </h3>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedEventId(null)} className="h-8 w-8">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <ScrollArea className="flex-1">
                      <div className="p-6 space-y-6">
                        <div className="space-y-4">
                          <LabelAndValue label="Status" value={
                            <Badge className={cn(
                               "font-bold tracking-widest",
                               selectedResult?.is_suppressed ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
                             )}>
                               {selectedResult?.is_suppressed ? "Suppressed" : "Active"}
                             </Badge>
                          } />

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground">Suppression Reason</p>
                            <p className="text-sm font-semibold leading-relaxed text-foreground bg-primary/5 p-3 rounded-lg border border-primary/20 ">
                              "{selectedResult?.reason}"
                            </p>
                          </div>

                          <Separator className="bg-border/30" />

                          {selectedResult?.logic_details && (
                            <div className="space-y-4">
                               <p className="text-[10px] font-bold text-muted-foreground tracking-widest">Internal Logic Trace</p>
                               <div className="bg-secondary/20 p-4 rounded-xl space-y-3 border border-border/50">
                                  {Object.entries(selectedResult.logic_details).map(([key, val]: [string, any]) => (
                                    <div key={key} className="flex flex-col gap-1 border-b border-border/20 last:border-none pb-2 last:pb-0">
                                       <span className="text-[9px] uppercase font-bold text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                       <span className="text-sm font-semibold text-foreground">{val.toString()}</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          )}

                          {selectedResult?.policy_id && (
                             <div className="pt-2">
                               <LabelAndValue label="Matched Policy" value={
                                 <span className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded border border-border/50">{selectedResult.policy_id}</span>
                               } />
                             </div>
                          )}

                          <div className="space-y-2 pt-4">
                            <p className="text-[10px] font-bold text-muted-foreground">Raw Log</p>
                            <div className="p-3 bg-secondary/30 rounded-lg font-mono text-[10px] text-muted-foreground break-all border border-border/50">
                              {selectedEvent?.raw}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-border/30 bg-secondary/10">
                      <div className="flex items-center gap-2 justify-center">
                        <ShieldCheck className="h-4 w-4 text-status-success" />
                        <span className="text-[10px] font-bold text-muted-foreground">Noise Reduction Success</span>
                      </div>
                    </div>
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
