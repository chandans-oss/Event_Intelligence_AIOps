import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Info, AlertTriangle, ChevronRight } from 'lucide-react';
import { Sankey, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA ---

// Sankey Data for Remedy Flow
const SANKEY_DATA = {
  nodes: [
    { name: 'BGP Route Flap', category: 'incident' },
    { name: 'High CPU', category: 'incident' },
    { name: 'API Timeout', category: 'incident' },
    { name: 'Clear Session', category: 'remedy' },
    { name: 'Restart IPS', category: 'remedy' },
    { name: 'Circuit Breaker', category: 'remedy' },
    { name: 'Failed', category: 'outcome' },
    { name: 'Repeated', category: 'outcome' },
    { name: 'Asset Mismatch', category: 'outcome' },
  ],
  links: [
    { source: 0, target: 3, value: 11 }, // BGP -> Clear
    { source: 1, target: 4, value: 3 }, // CPU -> Restart
    { source: 2, target: 5, value: 9 }, // API -> Circuit
    { source: 3, target: 7, value: 4 }, // Clear -> Repeated (4)
    { source: 3, target: 6, value: 7 }, // Clear -> Failed (7)
    { source: 4, target: 8, value: 3 }, // Restart -> Asset Mismatch (3)
    { source: 5, target: 6, value: 5 }, // Circuit -> Failed (5) [Total Failed = 7+5=12]
    { source: 5, target: 7, value: 4 }, // Circuit -> Repeated (4) [Total Repeated = 4+4=8]
  ]
};

// Heatmap Data for KB Gaps (Vendors x Incident Types)
const VENDORS = ['Cisco', 'Juniper', 'Palo Alto', 'Arista', 'Generic'];
const INCIDENTS = ['BGP Route Flap', 'High CPU', 'Memory Exhaustion', 'SIP Timeout', 'IPSec Drop'];

const HEATMAP_DATA: Record<string, Record<string, { score: number, gapType: string, action: string }>> = {
  'BGP Route Flap': {
    'Cisco': { score: 95, gapType: 'Good Coverage', action: 'Verified' },
    'Juniper': { score: 45, gapType: 'Weak Match', action: 'Update KB' },
    'Arista': { score: 10, gapType: 'Missing Remedy', action: 'Create New KB' }
  },
  'High CPU': {
    'Palo Alto': { score: 88, gapType: 'Good Coverage', action: 'Verified' },
    'Generic': { score: 55, gapType: 'Incomplete Steps', action: 'Add Details' },
    'Cisco': { score: 20, gapType: 'Missing Remedy', action: 'Create New KB' }
  },
  'Memory Exhaustion': {
    'Cisco': { score: 92, gapType: 'Good Coverage', action: 'Verified' },
    'Juniper': { score: 85, gapType: 'Good Coverage', action: 'Verified' },
    'Palo Alto': { score: 5, gapType: 'Missing Remedy', action: 'Create New KB' }
  },
  'SIP Timeout': {
    'Generic': { score: 45, gapType: 'Weak Match', action: 'Add QoS Steps' },
    'Cisco': { score: 35, gapType: 'Vendor Gap', action: 'Add CUBE logic' },
    'Arista': { score: 0, gapType: 'Missing Remedy', action: 'Not Applicable' } // 0 means unmapped/missing
  },
  'IPSec Drop': {
    'Juniper': { score: 25, gapType: 'Missing Remedy', action: 'Create New KB' },
    'Palo Alto': { score: 65, gapType: 'Incomplete Steps', action: 'Add NAT Traversal' },
    'Cisco': { score: 90, gapType: 'Good Coverage', action: 'Verified' }
  }
};

// --- CUSTOM SANKEY NODE ---
const CustomNode = (props: any) => {
  const { x, y, width, height, index, payload } = props;
  const isOutcome = payload.category === 'outcome';
  const isIncident = payload.category === 'incident';

  let fill = '#3b82f6'; // blue for incident
  if (payload.category === 'remedy') fill = '#8b5cf6'; // purple for remedy
  if (isOutcome) {
    if (payload.name === 'Failed') fill = '#ef4444'; // red
    else if (payload.name === 'Repeated') fill = '#f97316'; // orange
    else fill = '#eab308'; // yellow
  }

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} fillOpacity={0.9} />
      <text
        x={isIncident ? x + width + 8 : isOutcome ? x - 8 : x + width / 2}
        y={y + height / 2}
        dy={4}
        textAnchor={isIncident ? 'start' : isOutcome ? 'end' : 'middle'}
        fill="currentColor"
        className="text-[11px] font-semibold"
        style={{ fill: 'hsl(var(--foreground))' }}
      >
        {payload.name}
      </text>
    </g>
  );
};

// --- COMPONENT ---

export function RemedyQualityAssuranceWidget() {
  const [activeTab, setActiveTab] = useState<'Failed' | 'Gap'>('Failed');
  const [hoveredCell, setHoveredCell] = useState<{ v: string, i: string } | null>(null);
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate('/admin?section=RemedyKB');
  };

  const getHeatmapColor = (score?: number) => {
    if (score === undefined) return 'bg-muted/10 border-transparent'; // No data
    if (score >= 80) return 'bg-green-500/20 border-green-500/30 text-green-600';
    if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-600';
    return 'bg-red-500/20 border-red-500/30 text-red-600';
  };

  const failedCount = SANKEY_DATA.links.filter(l => l.target === 6).reduce((acc, curr) => acc + curr.value, 0);
  const repeatedCount = SANKEY_DATA.links.filter(l => l.target === 7).reduce((acc, curr) => acc + curr.value, 0);
  const assetMismatchCount = SANKEY_DATA.links.filter(l => l.target === 8).reduce((acc, curr) => acc + curr.value, 0);

  let lowConfidenceCount = 0;
  let missingKBCount = 0;
  
  INCIDENTS.forEach(inc => {
    VENDORS.forEach(ven => {
      const cell = HEATMAP_DATA[inc]?.[ven];
      if (!cell) {
        missingKBCount++; // Only the empty "-" spaces
      } else if (cell.score < 80) {
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
      <div className="grid grid-cols-5 gap-4 mb-6 flex-shrink-0">
        {[
          { label: 'Total Failed Remedies', value: failedCount, color: 'text-red-500' },
          { label: 'Repeated Incidents', value: repeatedCount, color: 'text-orange-500' },
          { label: 'Low Confidence Matches', value: lowConfidenceCount, color: 'text-yellow-500' },
          { label: 'Missing KB Entries', value: missingKBCount, color: 'text-blue-500' },
          { label: 'Incorrect Asset Mappings', value: assetMismatchCount, color: 'text-purple-500' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-muted/30 border border-border/40 rounded-lg p-3 flex flex-col items-center justify-center text-center">
            <span className={`text-2xl font-black mb-1 ${kpi.color}`}>{kpi.value}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[300px] border border-border/50 rounded-xl bg-muted/10 relative p-4" onClick={handleRowClick}>
        
        {/* TAB 1: SANKEY DIAGRAM */}
        {activeTab === 'Failed' && (
          <div className="w-full h-full flex flex-col">
            <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider text-center">
              Incident → Applied Remedy → Failure Outcome
            </div>
            <div className="w-full h-[300px] cursor-pointer overflow-hidden flex justify-center" title="Click to manage Remedy KB">
              <Sankey
                width={800}
                height={300}
                data={SANKEY_DATA}
                nodePadding={40}
                margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
                link={{ stroke: '#8b5cf6', strokeOpacity: 0.2 }}
                node={<CustomNode />}
              >
                <RechartsTooltip />
              </Sankey>
            </div>
          </div>
        )}

        {/* TAB 2: HEATMAP */}
        {activeTab === 'Gap' && (
          <div className="w-full h-full flex flex-col items-center justify-center cursor-pointer" title="Click to manage Remedy KB">
            <div className="text-xs font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
              Knowledge Base Coverage (Confidence Score %)
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
                          className={`relative h-12 rounded-md border flex items-center justify-center transition-all ${getHeatmapColor(data?.score)} ${isHovered ? 'ring-2 ring-primary ring-offset-1 ring-offset-background z-10 scale-105' : ''}`}
                        >
                          <span className="text-xs font-bold">{data ? `${data.score}%` : '-'}</span>
                          
                          {/* Tooltip Popup */}
                          {isHovered && data && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-card border border-border shadow-xl rounded-lg p-3 z-50 pointer-events-none animate-in fade-in zoom-in-95">
                              <div className="text-[10px] text-muted-foreground uppercase mb-1">{vendor} / {incident}</div>
                              <div className="font-bold text-sm mb-1">{data.gapType}</div>
                              <div className="text-xs flex items-center gap-1 text-primary">
                                <ChevronRight className="h-3 w-3" /> {data.action}
                              </div>
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
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" /> Severe Gap (0-49%)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30" /> Needs Review (50-79%)</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30" /> Good Coverage (80-100%)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
