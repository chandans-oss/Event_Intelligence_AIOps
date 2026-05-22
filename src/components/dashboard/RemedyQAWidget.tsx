import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Info, AlertTriangle, ChevronRight, CheckCircle2, XCircle, Terminal, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ---

// Bar Chart Data for Remedy Failure Flow
const REMEDY_OUTCOME_DATA = [
  { name: 'Clear Session (BGP)', Failed: 7, Repeated: 4, AssetMismatch: 0 },
  { name: 'Restart IPS (CPU)', Failed: 0, Repeated: 0, AssetMismatch: 3 },
  { name: 'Circuit Breaker (API)', Failed: 5, Repeated: 4, AssetMismatch: 0 },
];

// Heatmap Data for KB Gaps (Vendors x Incident Types)
const VENDORS = ['Cisco', 'Juniper', 'Palo Alto', 'Arista', 'Generic'];
const INCIDENTS = ['BGP Route Flap', 'High CPU', 'Memory Exhaustion', 'SIP Timeout', 'IPSec Drop'];

type FailureTrace = {
  executionId: string;
  failedStep: string;
  errorCode: string;
  errorMessage: string;
  timestamp: string;
};

type HeatmapCellData = {
  status: 'GOOD' | 'REVIEW' | 'GAP';
  gapType: string;
  action: string;
  lastFailureTrace?: FailureTrace;
};

const HEATMAP_DATA: Record<string, Record<string, HeatmapCellData>> = {
  'BGP Route Flap': {
    'Cisco': { status: 'GOOD', gapType: 'Good Coverage', action: 'Verified' },
    'Juniper': { status: 'REVIEW', gapType: 'Weak Match', action: 'Update KB', lastFailureTrace: { executionId: 'EXEC-1102', failedStep: '2. Apply BGP Config', errorCode: 'SYNTAX_ERROR', errorMessage: 'Invalid command: router bgp 65000', timestamp: '2026-05-22T08:15:00Z' } },
    'Arista': { status: 'GAP', gapType: 'Missing Remedy', action: 'Create New KB', lastFailureTrace: { executionId: 'EXEC-1105', failedStep: '1. Init Connection', errorCode: 'AUTH_TIMEOUT', errorMessage: 'Connection timed out while waiting for prompt', timestamp: '2026-05-22T09:30:00Z' } }
  },
  'High CPU': {
    'Palo Alto': { status: 'GOOD', gapType: 'Good Coverage', action: 'Verified' },
    'Generic': { status: 'REVIEW', gapType: 'Incomplete Steps', action: 'Add Details' },
    'Cisco': { status: 'GAP', gapType: 'Missing Remedy', action: 'Create New KB', lastFailureTrace: { executionId: 'EXEC-2291', failedStep: '3. Restart IPS Engine', errorCode: 'AUTH_TIMEOUT', errorMessage: 'Terminal response: 401 Unauthorized. Token expired.', timestamp: '2026-05-22T10:14:00Z' } }
  },
  'Memory Exhaustion': {
    'Cisco': { status: 'GOOD', gapType: 'Good Coverage', action: 'Verified' },
    'Juniper': { status: 'GOOD', gapType: 'Good Coverage', action: 'Verified' },
    'Palo Alto': { status: 'GAP', gapType: 'Missing Remedy', action: 'Create New KB', lastFailureTrace: { executionId: 'EXEC-3312', failedStep: '4. Clear Cache', errorCode: 'DEPENDENCY_FAILED', errorMessage: 'Service unavailable. Cannot flush memory pool.', timestamp: '2026-05-22T11:05:00Z' } }
  },
  'SIP Timeout': {
    'Generic': { status: 'REVIEW', gapType: 'Weak Match', action: 'Add QoS Steps' },
    'Cisco': { status: 'GAP', gapType: 'Vendor Gap', action: 'Add CUBE logic', lastFailureTrace: { executionId: 'EXEC-4411', failedStep: '2. Apply QoS Policy', errorCode: 'CMD_NOT_FOUND', errorMessage: '% Invalid input detected at \'^\' marker.', timestamp: '2026-05-22T12:20:00Z' } },
    'Arista': { status: 'GAP', gapType: 'Missing Remedy', action: 'Not Applicable' }
  },
  'IPSec Drop': {
    'Juniper': { status: 'GAP', gapType: 'Missing Remedy', action: 'Create New KB', lastFailureTrace: { executionId: 'EXEC-5590', failedStep: '1. Reset Tunnel', errorCode: 'API_ERROR', errorMessage: '500 Internal Server Error: Crypto module not responding.', timestamp: '2026-05-22T14:45:00Z' } },
    'Palo Alto': { status: 'REVIEW', gapType: 'Incomplete Steps', action: 'Add NAT Traversal' },
    'Cisco': { status: 'GOOD', gapType: 'Good Coverage', action: 'Verified' }
  }
};

// --- COMPONENT ---

export function RemedyQualityAssuranceWidget() {
  const [activeTab, setActiveTab] = useState<'Failed' | 'Gap'>('Failed');
  const [hoveredCell, setHoveredCell] = useState<{ v: string, i: string } | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<FailureTrace | null>(null);
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate('/admin?section=RemedyKB');
  };

  const getHeatmapColor = (status?: string) => {
    if (!status) return 'bg-muted/10 border-transparent'; // No data
    if (status === 'GOOD') return 'bg-green-500/20 border-green-500/30 text-green-600';
    if (status === 'REVIEW') return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-600';
    return 'bg-red-500/20 border-red-500/30 text-red-600';
  };

  const failedCount = REMEDY_OUTCOME_DATA.reduce((acc, curr) => acc + curr.Failed, 0);
  const repeatedCount = REMEDY_OUTCOME_DATA.reduce((acc, curr) => acc + curr.Repeated, 0);
  const assetMismatchCount = REMEDY_OUTCOME_DATA.reduce((acc, curr) => acc + curr.AssetMismatch, 0);

  let lowConfidenceCount = 0;
  let missingKBCount = 0;
  
  INCIDENTS.forEach(inc => {
    VENDORS.forEach(ven => {
      const cell = HEATMAP_DATA[inc]?.[ven];
      if (!cell) {
        missingKBCount++; // Only the empty "-" spaces
      } else if (cell.status === 'REVIEW' || cell.status === 'GAP') {
        lowConfidenceCount++; // Only the rendered red/yellow squares
      }
    });
  });

  return (
    <div className="card flex flex-col h-full bg-card border border-border shadow-sm rounded-xl p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground tracking-tight">Remedy Quality Assurance</h2>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
          <button
            onClick={() => setActiveTab('Failed')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'Failed' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Remedy Failure Flow
          </button>
          <button
            onClick={() => setActiveTab('Gap')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'Gap' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            KB Gap Heatmap
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={`grid gap-4 mb-6 flex-shrink-0 ${activeTab === 'Failed' ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {(activeTab === 'Failed' ? [
          { label: 'Total Failed Remedies', value: failedCount, color: 'text-red-500' },
          { label: 'Repeated Incidents', value: repeatedCount, color: 'text-orange-500' },
          { label: 'Incorrect Asset Mappings', value: assetMismatchCount, color: 'text-purple-500' },
        ] : [
          { label: 'Low Confidence Matches', value: lowConfidenceCount, color: 'text-yellow-500' },
          { label: 'Missing KB Entries', value: missingKBCount, color: 'text-blue-500' },
        ]).map((kpi) => (
          <div key={kpi.label} className="bg-muted/30 border border-border/40 rounded-lg p-3 flex flex-col items-center justify-center text-center">
            <span className={`text-2xl font-black mb-1 ${kpi.color}`}>{kpi.value}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[300px] border border-border/50 rounded-xl bg-muted/10 relative p-4" onClick={handleRowClick}>
        
        {/* TAB 1: BAR CHART */}
        {activeTab === 'Failed' && (
          <div className="w-full h-full flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider text-center">
              Failure Outcomes by Applied Remedy
            </div>
            <div className="w-full h-[300px]" title="Click to manage Remedy KB">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={REMEDY_OUTCOME_DATA}
                  margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }} />
                  <Bar dataKey="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="Repeated" fill="#f97316" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="AssetMismatch" name="Asset Mismatch" fill="#eab308" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: HEATMAP */}
        {activeTab === 'Gap' && (
          <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer" title="Click to manage Remedy KB">
            <div className="text-xs font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
              Knowledge Base Coverage Status
            </div>
            
            <div className="grid gap-2" style={{ gridTemplateColumns: `auto repeat(${VENDORS.length}, minmax(60px, 1fr))` }}>
              {/* Header Row (Vendors) */}
              <div className="col-start-2 col-span-full grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-muted-foreground uppercase">
                {VENDORS.map(v => <div key={v}>{v}</div>)}
              </div>

              {/* Rows (Incidents) */}
              {INCIDENTS.map((incident) => (
                <div key={incident} className="contents">
                  {/* Y-Axis Label */}
                  <div className="text-[11px] font-semibold text-foreground flex items-center justify-end pr-4 text-right">
                    {incident}
                  </div>
                  
                  {/* Heatmap Cells */}
                  <div className="col-start-2 col-span-full grid grid-cols-5 gap-2">
                    {VENDORS.map(vendor => {
                      const data = HEATMAP_DATA[incident]?.[vendor];
                      const isHovered = hoveredCell?.i === incident && hoveredCell?.v === vendor;
                      return (
                        <div
                          key={`${incident}-${vendor}`}
                          onMouseEnter={() => setHoveredCell({ i: incident, v: vendor })}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (data?.lastFailureTrace) setSelectedTrace(data.lastFailureTrace);
                          }}
                          className={`relative h-12 rounded-md border flex items-center justify-center transition-all ${getHeatmapColor(data?.status)} ${isHovered ? 'ring-2 ring-primary ring-offset-1 ring-offset-background z-10 scale-105' : ''} ${data?.lastFailureTrace ? 'cursor-pointer' : ''}`}
                        >
                          {!data ? (
                            <span className="text-xs font-bold opacity-50">-</span>
                          ) : data.status === 'GOOD' ? (
                            <CheckCircle2 className="h-5 w-5 opacity-80" />
                          ) : data.status === 'REVIEW' ? (
                            <AlertTriangle className="h-5 w-5 opacity-80" />
                          ) : (
                            <XCircle className="h-5 w-5 opacity-80" />
                          )}
                          
                          {/* Tooltip Popup */}
                          {isHovered && data && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-card border border-border shadow-xl rounded-lg p-3 z-50 pointer-events-none animate-in fade-in zoom-in-95">
                              <div className="text-[10px] text-muted-foreground uppercase mb-1">{vendor} / {incident}</div>
                              <div className="font-bold text-sm mb-1">{data.gapType}</div>
                              <div className="text-xs flex items-center gap-1 text-primary mb-2">
                                <ChevronRight className="h-3 w-3" /> {data.action}
                              </div>
                              {data.lastFailureTrace && (
                                <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-red-500 font-medium">
                                  <div className="font-bold mb-0.5 text-foreground">Last Error:</div>
                                  Failed at "{data.lastFailureTrace.failedStep}" ({data.lastFailureTrace.errorCode})
                                  <div className="mt-1 text-muted-foreground">Click to view trace</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-8 text-[10px] font-semibold text-muted-foreground uppercase">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30 flex items-center justify-center"><XCircle className="h-2 w-2 text-red-600" /></div> Severe Gap</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center"><AlertTriangle className="h-2 w-2 text-yellow-700" /></div> Needs Review</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30 flex items-center justify-center"><CheckCircle2 className="h-2 w-2 text-green-700" /></div> Good Coverage</div>
            </div>
          </div>
        )}
      </div>

      {/* Execution Trace Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedTrace(null)} />
          <div className="relative w-full max-w-2xl bg-[#0F172A] border border-slate-700 shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#1E293B]">
              <div className="flex items-center gap-2 text-slate-200">
                <Terminal className="h-4 w-4" />
                <span className="text-sm font-semibold font-mono">{selectedTrace.executionId} - Execution Trace</span>
              </div>
              <button onClick={() => setSelectedTrace(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 bg-[#0F172A] font-mono text-xs overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="text-slate-400 mb-1">[{selectedTrace.timestamp}] Initializing playbook execution...</div>
              <div className="text-emerald-400 mb-1">[{selectedTrace.timestamp}] Connect to target asset... OK</div>
              <div className="text-emerald-400 mb-1">[{selectedTrace.timestamp}] Authenticate... OK</div>
              <div className="text-slate-400 mb-1">[{selectedTrace.timestamp}] Running step: {selectedTrace.failedStep}...</div>
              <div className="text-red-400 mt-2 mb-2">
                ====================================================<br/>
                ERROR: {selectedTrace.errorCode}<br/>
                ====================================================
              </div>
              <div className="text-red-300 bg-red-950/30 p-3 rounded border border-red-900/50 break-words whitespace-pre-wrap">
                {selectedTrace.errorMessage}
              </div>
              <div className="text-slate-500 mt-4">Execution terminated. Playbook failed.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
