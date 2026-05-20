import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Activity, Zap, AlertTriangle, ShieldCheck, TrendingUp, Search, Info,
  CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight, Layers, Database,
  Cpu, Server, Network, BarChart3, Clock, Play, HelpCircle, ChevronRight, X, Sparkles, Filter
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Sankey,
  ScatterChart, Scatter, ZAxis, Treemap
} from 'recharts';
import { sampleNetworkEvents, getEventStats } from '@/features/events/data/eventsData';
import { MOCK_PATTERNS } from '@/features/analytics/data/patternData';

// Custom chart tooltip component with premium aesthetics and 100% readability
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 border border-border/80 px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-left font-['Sora',sans-serif] z-[100] min-w-[150px]">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</p>
        <div className="space-y-1.5 mt-2">
          {payload.map((pld: any, idx: number) => {
            const isPercentage = 
              pld.name?.toLowerCase().includes('confidence') || 
              pld.name?.toLowerCase().includes('coverage') ||
              pld.name?.toLowerCase().includes('precision') ||
              pld.name?.toLowerCase().includes('rate');
            return (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: pld.color || pld.fill }} />
                  <span className="text-[10px] font-bold text-foreground">{pld.name || pld.dataKey}</span>
                </div>
                <span className="text-[10px] font-black text-primary">{pld.value}{isPercentage ? '%' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

// Custom circular progress indicator for premium dashboards
const ConcentricGauge = ({ value, label, subLabel, color, size = 110, strokeWidth = 8 }: {
  value: number;
  label: string;
  subLabel: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center font-['Sora',sans-serif]">
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/10 dark:text-white/5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-foreground leading-none tracking-tighter">{value}%</span>
        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">{label}</span>
        <span className="text-[7px] text-muted-foreground mt-0.5">{subLabel}</span>
      </div>
    </div>
  );
};

export default function AIOpsAdvancedAnalytics() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State Management
  const [activeTab, setActiveTab] = useState('events');
  const [selectedDetails, setSelectedDetails] = useState<any>(null);
  const [hoveredCalendarCell, setHoveredCalendarCell] = useState<any>(null);
  const [hoveredSankeyLink, setHoveredSankeyLink] = useState<any>(null);
  const [hoveredSankeyNode, setHoveredSankeyNode] = useState<any>(null);
  const [hoveredPatternCell, setHoveredPatternCell] = useState<any>(null);
  const [hoveredLogZone, setHoveredLogZone] = useState<any>(null);
  const [hoveredMatrixCell, setHoveredMatrixCell] = useState<any>(null);
  const [hoveredEvidence, setHoveredEvidence] = useState<any>(null);
  const [hoveredNetworkNode, setHoveredNetworkNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  // Load Event Statistics
  const eventStats = useMemo(() => getEventStats(sampleNetworkEvents), []);
  
  // Mapped theme colors
  const colors = useMemo(() => ({
    primary: 'hsl(var(--primary))',
    success: 'hsl(var(--status-success))',
    warning: 'hsl(var(--severity-medium))',
    error: 'hsl(var(--severity-critical))',
    orange: 'hsl(var(--severity-high))',
    muted: 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
    card: 'hsl(var(--card))'
  }), [resolvedTheme]);

  // W-E1: Severity Heat Calendar Data Generation (7 days x 12 weeks)
  const heatCalendarData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 84 }).map((_, idx) => {
      const dayIdx = idx % 7;
      const weekIdx = Math.floor(idx / 7);
      const val = Math.floor(Math.sin(idx * 0.1) * 15 + Math.cos(idx * 0.2) * 10 + 20);
      let severity: 'Critical' | 'Major' | 'Minor' | 'Low' = 'Low';
      if (val > 38) severity = 'Critical';
      else if (val > 28) severity = 'Major';
      else if (val > 18) severity = 'Minor';

      return {
        id: `cell-${idx}`,
        day: days[dayIdx],
        week: weekIdx,
        count: Math.max(2, val),
        severity,
        date: new Date(Date.now() - (83 - idx) * 24 * 3600000).toLocaleDateString([], { month: 'short', day: 'numeric' })
      };
    });
  }, []);

  // W-E2: Sankey Ingress to outcome diagram mapping data
  const sankeyData = useMemo(() => ({
    nodes: [
      { name: 'Trap', fill: '#06B6D4' },
      { name: 'Syslog', fill: '#A855F7' },
      { name: 'Adaptive', fill: '#10B981' },
      { name: 'Seasonal', fill: '#F59E0B' },
      { name: 'NCCM', fill: '#3B82F6' },
      { name: 'Only RCA', fill: '#EC4899' },
      { name: 'Auto Remediation', fill: '#10B981' },
      { name: 'Manual Remediation', fill: '#3B82F6' },
      { name: 'RCA Not Found', fill: '#EF4444' }
    ],
    links: [
      { source: 0, target: 5, value: 120 },
      { source: 0, target: 8, value: 40 },
      { source: 1, target: 5, value: 90 },
      { source: 1, target: 7, value: 110 },
      { source: 2, target: 6, value: 200 },
      { source: 3, target: 7, value: 80 },
      { source: 4, target: 6, value: 150 },
      { source: 4, target: 8, value: 25 }
    ]
  }), []);

  // W-E4: Business Service Impact matrix
  const serviceImpacts = useMemo(() => [
    { name: 'Core Banking API', critical: 8, major: 12, minor: 25, score: 73 },
    { name: 'E-Commerce Checkout', critical: 12, major: 18, minor: 14, score: 86 },
    { name: 'Customer Portal', critical: 3, major: 9, minor: 32, score: 49 },
    { name: 'SAP ERP Financials', critical: 5, major: 15, minor: 18, score: 63 },
    { name: 'Inventory API Gateway', critical: 2, major: 8, minor: 45, score: 47 },
    { name: 'Voice Gateway Services', critical: 6, major: 4, minor: 11, score: 37 }
  ].sort((a, b) => b.score - a.score), []);

  // W-E9: Event reduction waterfall data
  const reductionWaterfall = useMemo(() => [
    { name: 'Raw Ingress', val: 2482, display: '2.5K', change: '100%', fill: 'hsl(var(--primary))' },
    { name: 'Deduplicated', val: 1845, display: '-637', change: '-25.6%', fill: 'hsl(var(--status-success))' },
    { name: 'Suppressed', val: 1212, display: '-633', change: '-34.3%', fill: 'hsl(var(--severity-medium))' },
    { name: 'Correlated', val: 458, display: '-754', change: '-62.2%', fill: 'hsl(var(--severity-high))' },
    { name: 'Root Causes', val: 118, display: '118 Act', change: '4.7% Rem', fill: 'hsl(var(--severity-critical))' }
  ], []);

  // W-E10: Sickest Devices
  const sickestDevices = useMemo(() => [
    { name: 'dist-sw-05.dc1', ip: '10.50.2.14', type: 'Switch', score: 92, events: 14, status: 'Critical', trend: [10, 45, 78, 62, 92] },
    { name: 'core-rt-01.dc1', ip: '172.16.100.1', type: 'Router', score: 84, events: 9, status: 'High', trend: [15, 22, 45, 68, 84] },
    { name: 'app-srv-05.dc1', ip: '192.168.10.205', type: 'Server', score: 79, events: 12, status: 'High', trend: [8, 31, 22, 59, 79] },
    { name: 'fw-primary.dc2', ip: '10.20.1.5', type: 'Firewall', score: 62, events: 6, status: 'Medium', trend: [2, 18, 12, 44, 62] },
    { name: 'db-cluster-01.dc1', ip: '10.0.0.55', type: 'Database', score: 55, events: 4, status: 'Medium', trend: [5, 9, 33, 40, 55] }
  ], []);

  // W-R1: Packed Circular Hypotheses Data
  const hypothesesBubbles = useMemo(() => [
    { id: 'h1', title: 'Fibre Cut Outage', domain: 'Network', conf: 92, sev: 'Critical', services: 8, evidence: 14, cx: 35, cy: 30, r: 42, color: 'hsl(var(--severity-critical))', gradient: 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.35), rgba(239, 68, 68, 0.05))', border: 'border-red-500/50' },
    { id: 'h2', title: 'BGP Peer Flapping', domain: 'Routing', conf: 84, sev: 'High', services: 5, evidence: 9, cx: 70, cy: 32, r: 35, color: 'hsl(var(--severity-high))', gradient: 'radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.35), rgba(249, 115, 22, 0.05))', border: 'border-orange-500/50' },
    { id: 'h3', title: 'CPU Leak Starvation', domain: 'Compute', conf: 76, sev: 'High', services: 4, evidence: 11, cx: 25, cy: 75, r: 32, color: 'hsl(var(--severity-high))', gradient: 'radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.35), rgba(249, 115, 22, 0.05))', border: 'border-orange-500/50' },
    { id: 'h4', title: 'DB Pool Exhaustion', domain: 'Database', conf: 68, sev: 'Medium', services: 6, evidence: 4, cx: 52, cy: 68, r: 28, color: 'hsl(var(--severity-medium))', gradient: 'radial-gradient(circle at 30% 30%, rgba(13, 148, 136, 0.35), rgba(13, 148, 136, 0.05))', border: 'border-teal-500/50' },
    { id: 'h5', title: 'SFP Optical Decay', domain: 'Physical', conf: 55, sev: 'Medium', services: 2, evidence: 3, cx: 80, cy: 70, r: 24, color: 'hsl(var(--severity-medium))', gradient: 'radial-gradient(circle at 30% 30%, rgba(13, 148, 136, 0.35), rgba(13, 148, 136, 0.05))', border: 'border-teal-500/50' }
  ], []);

  // W-R3: Radar diagram category counts
  const domainCoverage = useMemo(() => [
    { subject: 'Network Link', coverage: 95, frequency: 82, fullMark: 100 },
    { subject: 'Compute Hardware', coverage: 88, frequency: 65, fullMark: 100 },
    { subject: 'Database Systems', coverage: 72, frequency: 90, fullMark: 100 },
    { subject: 'App Middleware', coverage: 65, frequency: 45, fullMark: 100 },
    { subject: 'Cloud Services', coverage: 78, frequency: 58, fullMark: 100 },
    { subject: 'Security Policy', coverage: 90, frequency: 30, fullMark: 100 }
  ], []);

  // W-R8: SLA Breach Predictions
  const slaBreachPredictions = useMemo(() => [
    { name: 'E-Commerce Transactions', risk: 88, breachTime: '24 mins', trend: 'rising', color: 'bg-red-500' },
    { name: 'Core Banking API Gateway', risk: 74, breachTime: '52 mins', trend: 'rising', color: 'bg-orange-500' },
    { name: 'SAP Finance Ledger', risk: 52, breachTime: '2 hours', trend: 'stable', color: 'bg-teal-500' },
    { name: 'Mobile Notification Bus', risk: 38, breachTime: '5 hours', trend: 'falling', color: 'bg-teal-500' },
    { name: 'Internal LDAP Directory', risk: 15, breachTime: '12 hours', trend: 'stable', color: 'bg-teal-500' }
  ], []);

  // W-R9: KB Version Coverage Matrix
  const kbMatrix = useMemo(() => [
    { name: 'Physical Link Failures', rules: 24, coverage: 95, ver: 'v4.2', status: 'Active' },
    { name: 'Routing Protocol BGP/OSPF', rules: 18, coverage: 88, ver: 'v3.8', status: 'Active' },
    { name: 'Interface Flap Sequencing', rules: 15, coverage: 92, ver: 'v5.1', status: 'Active' },
    { name: 'System Memory Saturation', rules: 12, coverage: 65, ver: 'v2.1', status: 'Learning' },
    { name: 'Firewall Policy Overload', rules: 9, coverage: 78, ver: 'v1.4', status: 'Learning' },
    { name: 'Storage LUN Path Failovers', rules: 6, coverage: 50, ver: 'v1.0', status: 'Disabled' }
  ], []);

  // A-1: Waterfall Data
  const waterfallData = useMemo(() => [
    { name: 'Initial Guess', val: 95, color: '#3B82F6' },
    { name: 'Syslog Offset', val: -12, color: '#EF4444' },
    { name: 'Metric Match', val: 8, color: '#10B981' },
    { name: 'Topology Match', val: 5, color: '#10B981' },
    { name: 'FAISS Penalty', val: -10, color: '#EF4444' },
    { name: 'Final Score', val: 86, color: '#A855F7' }
  ], []);

  // A-2: Spider Radar Data
  const spiderData = useMemo(() => [
    { subject: 'Semantic (FAISS)', semantic: 94, bm25: 60, rrf: 85 },
    { subject: 'Keyword (BM25)', semantic: 50, bm25: 88, rrf: 75 },
    { subject: 'Temporal Correlation', semantic: 78, bm25: 45, rrf: 80 },
    { subject: 'Topological Reach', semantic: 85, bm25: 30, rrf: 70 },
    { subject: 'Cross-Encoder', semantic: 90, bm25: 50, rrf: 92 }
  ], []);

  // A-3: Log Zone Heatmap Data
  const logZoneData = useMemo(() => [
    { template: 'Fibre cut interface down', zone: 'Probable Cause', count: 14, score: 96 },
    { template: 'LACP rate limit exceeded', zone: 'Probable Cause', count: 8, score: 88 },
    { template: 'BGP state transition to Idle', zone: 'Impact', count: 24, score: 91 },
    { template: 'SFP rx power low threshold', zone: 'Impact', count: 18, score: 79 },
    { template: 'HTTP 502 transaction timeout', zone: 'Impact', count: 45, score: 85 },
    { template: 'Syslog buffer overrun warning', zone: 'Noise', count: 110, score: 12 },
    { template: 'DHCP lease renew retry', zone: 'Noise', count: 95, score: 8 },
    { template: 'SSH connection disconnect', zone: 'Noise', count: 62, score: 15 }
  ], []);

  // A-4: Anomaly Z-Score Magnitude Data
  const zScoreBubbleData = useMemo(() => [
    { x: 10, y: 15, z: 200, name: 'cpu_ready_percent', zScore: 8.5 },
    { x: 25, y: 40, z: 500, name: 'mem_swapin', zScore: 24.1 },
    { x: 45, y: 12, z: 120, name: 'icmp_response_time_ms', zScore: 4.8 },
    { x: 60, y: 85, z: 800, name: 'storage_latency_ms', zScore: 37.2 },
    { x: 75, y: 55, z: 300, name: 'avail', zScore: -12.4 },
    { x: 90, y: 30, z: 150, name: 'optical_rx_power_dbm', zScore: -5.6 }
  ], []);

  // A-5: Evidence Timeline Data
  const evidenceTimelineData = useMemo(() => [
    { time: '06:01:10', node: 'vmnic2', event: 'Link State Down', severity: 'Critical', source: 'Syslog' },
    { time: '06:01:12', node: 'core-rt-01', event: 'BGP Peer Flap', severity: 'High', source: 'SNMP Trap' },
    { time: '06:01:15', node: 'db-cluster-01', event: 'Storage Latency Spike', severity: 'High', source: 'Metric Poller' },
    { time: '06:01:22', node: 'app-srv-05', event: 'App Pool Exhaustion', severity: 'Medium', source: 'Agent Log' },
    { time: '06:01:30', node: 'checkout-api', event: 'HTTP 502 Bad Gateway', severity: 'Critical', source: 'Synthetic APM' }
  ], []);

  // A-6: Drain3 Similarity Matrix Data
  const drainSimilarityData = useMemo(() => [
    [1.0, 0.72, 0.31, 0.15, 0.08],
    [0.72, 1.0, 0.45, 0.22, 0.11],
    [0.31, 0.45, 1.0, 0.65, 0.28],
    [0.15, 0.22, 0.65, 1.0, 0.52],
    [0.08, 0.11, 0.28, 0.52, 1.0]
  ], []);

  // A-7: KB Domain Confidence Box Plot Data
  const kbDomainConfidenceData = useMemo(() => [
    { name: 'Compute/VM', min: 72, max: 98, avg: 86, color: '#3B82F6' },
    { name: 'Network Link', min: 65, max: 95, avg: 82, color: '#10B981' },
    { name: 'Database OS', min: 50, max: 88, avg: 71, color: '#F59E0B' },
    { name: 'Storage LUN', min: 78, max: 99, avg: 91, color: '#EF4444' },
    { name: 'Routing BGP', min: 58, max: 92, avg: 77, color: '#A855F7' }
  ], []);

  // A-8: Word Cloud Text
  const wordCloudWords = useMemo(() => [
    { text: 'vmnic_down', size: 24, weight: 'font-black', color: 'text-red-500' },
    { text: 'storage_latency', size: 20, weight: 'font-extrabold', color: 'text-orange-500' },
    { text: 'BGP_flap', size: 18, weight: 'font-bold', color: 'text-amber-500' },
    { text: 'db_pool_leak', size: 16, weight: 'font-bold', color: 'text-purple-500' },
    { text: 'MTU_drift', size: 12, weight: 'font-semibold', color: 'text-blue-500' },
    { text: 'mem_swapin', size: 14, weight: 'font-bold', color: 'text-emerald-500' },
    { text: 'packet_drop', size: 22, weight: 'font-black', color: 'text-rose-500' },
    { text: 'syslog_error', size: 10, weight: 'font-normal', color: 'text-muted-foreground' }
  ], []);

  // A-9: Inferred Domain Stacked Bar Data
  const inferredDomainData = useMemo(() => [
    { name: 'Inc-101', Network: 65, Compute: 20, Storage: 10, Other: 5 },
    { name: 'Inc-102', Network: 15, Compute: 70, Storage: 10, Other: 5 },
    { name: 'Inc-103', Network: 10, Compute: 15, Storage: 65, Other: 10 },
    { name: 'Inc-104', Network: 40, Compute: 40, Storage: 15, Other: 5 },
    { name: 'Inc-105', Network: 90, Compute: 5, Storage: 0, Other: 5 }
  ], []);

  // A-10: Relevant Log Leaderboard Data
  const relevantLogData = useMemo(() => [
    { text: 'Failed to write metadata block to ESXi Datastore', score: 94, count: 18, source: 'vmkernel.log' },
    { text: 'Link vmnic2 transition to Down - carrier lost', score: 91, count: 12, source: 'syslog.log' },
    { text: 'BGP peer 10.254.1.2 state changed: Established -> Idle', score: 86, count: 8, source: 'edge_router.log' },
    { text: 'FATAL: connection pool limit of 100 reached for user dbadmin', score: 79, count: 32, source: 'postgresql.log' },
    { text: 'Out of Memory: Killed process 8242 (java)', score: 72, count: 3, source: 'kern.log' }
  ], []);

  // A-11: Entity Extraction Coverage Trend
  const entityCoverageData = useMemo(() => [
    { period: 'T-12h', IP: 32, Interface: 18, ErrorCode: 42, Port: 28 },
    { period: 'T-9h', IP: 45, Interface: 24, ErrorCode: 58, Port: 35 },
    { period: 'T-6h', IP: 58, Interface: 31, ErrorCode: 72, Port: 42 },
    { period: 'T-3h', IP: 74, Interface: 39, ErrorCode: 85, Port: 56 },
    { period: 'T-0h', IP: 91, Interface: 52, ErrorCode: 98, Port: 74 }
  ], []);

  // A-12: Confidence Gate Funnel Data
  const confidenceGateData = useMemo(() => [
    { name: 'FAISS Ingest', val: 100, label: '50 candidates' },
    { name: 'BM25 Filter', val: 78, label: '39 candidates' },
    { name: 'Cross-Encoder', val: 42, label: '21 candidates' },
    { name: 'LLM Synthesizer', val: 26, label: '13 candidates' },
    { name: 'SOP Execution', val: 18, label: '9 candidates' }
  ], []);

  // A-13: Hypothesis Network Connections
  const hypothesisNetworkNodes = useMemo(() => [
    { id: 1, label: 'Fibre Cut', group: 'Network', cx: 80, cy: 80, size: 24, color: '#EF4444' },
    { id: 2, label: 'vmnic2 Down', group: 'Hardware', cx: 160, cy: 120, size: 16, color: '#F59E0B' },
    { id: 3, label: 'BGP Flap', group: 'Protocol', cx: 280, cy: 70, size: 20, color: '#A855F7' },
    { id: 4, label: 'IO Contention', group: 'Storage', cx: 240, cy: 220, size: 22, color: '#3B82F6' },
    { id: 5, label: 'Datastore Lag', group: 'Storage', cx: 340, cy: 170, size: 18, color: '#10B981' }
  ], []);

  const hypothesisNetworkLinks = useMemo(() => [
    { source: 1, target: 2, weight: 5 },
    { source: 2, target: 3, weight: 4 },
    { source: 2, target: 4, weight: 2 },
    { source: 4, target: 5, weight: 5 }
  ], []);

  // A-14: Metric Deviation Gauge Values
  const metricDeviations = useMemo(() => [
    { name: 'mem_swapin', val: 86, dev: '+4.2 Z', status: 'critical' },
    { name: 'cpu_ready_percent', val: 74, dev: '+3.1 Z', status: 'high' },
    { name: 'icmp_response_time', val: 62, dev: '+2.4 Z', status: 'medium' },
    { name: 'storage_latency_ms', val: 92, dev: '+5.5 Z', status: 'critical' },
    { name: 'packet_drop_rate', val: 45, dev: '+1.5 Z', status: 'low' },
    { name: 'bgp_state_transitions', val: 80, dev: '+3.8 Z', status: 'high' }
  ], []);

  // A-15: RAG Build Time vs Inc Complexity Scatter Data
  const buildTimeScatterData = useMemo(() => [
    { complexity: 12, buildTime: 4.2, kbDocs: 15 },
    { complexity: 28, buildTime: 8.5, kbDocs: 34 },
    { complexity: 45, buildTime: 12.1, kbDocs: 48 },
    { complexity: 62, buildTime: 18.0, kbDocs: 85 },
    { complexity: 78, buildTime: 24.5, kbDocs: 110 },
    { complexity: 95, buildTime: 32.2, kbDocs: 142 },
    { complexity: 18, buildTime: 5.8, kbDocs: 22 },
    { complexity: 55, buildTime: 15.2, kbDocs: 62 }
  ], []);

  // B-1: Remedy Confidence per Vendor Box Plot Data
  const remedyVendorConfidenceData = useMemo(() => [
    { vendor: 'Cisco IOS', min: 70, max: 98, avg: 89, color: '#3B82F6' },
    { vendor: 'VMware ESXi', min: 62, max: 96, avg: 84, color: '#10B981' },
    { vendor: 'MongoDB Corp', min: 55, max: 92, avg: 78, color: '#F59E0B' },
    { vendor: 'Juniper Junos', min: 68, max: 95, avg: 83, color: '#A855F7' },
    { vendor: 'Fallback SOP', min: 40, max: 80, avg: 62, color: '#64748B' }
  ], []);

  // B-2: Remediation Time Estimate Histogram Data
  const remedyTimeHistogram = useMemo(() => [
    { bin: '0-5m', auto: 18, manual: 4 },
    { bin: '6-15m', auto: 34, manual: 12 },
    { bin: '16-30m', auto: 28, manual: 25 },
    { bin: '31-60m', auto: 12, manual: 42 },
    { bin: '60m+', auto: 3, manual: 18 }
  ], []);

  // B-3: Risk Level vs Confidence 2D Matrix Data
  const riskConfidenceMatrix = useMemo(() => [
    { risk: 'Critical', confidence: '>90%', count: 18, color: 'bg-emerald-500/80 border-emerald-500 text-emerald-950 font-black' },
    { risk: 'Critical', confidence: '75-90%', count: 8, color: 'bg-emerald-500/50 border-emerald-500/70 text-emerald-900 font-bold' },
    { risk: 'Critical', confidence: '60-75%', count: 4, color: 'bg-amber-500/40 border-amber-500/60 text-amber-900 font-medium' },
    { risk: 'Critical', confidence: '<60%', count: 1, color: 'bg-red-500/30 border-red-500/50 text-red-950' },
    
    { risk: 'High', confidence: '>90%', count: 24, color: 'bg-emerald-500/80 border-emerald-500 text-emerald-950 font-black' },
    { risk: 'High', confidence: '75-90%', count: 15, color: 'bg-emerald-500/60 border-emerald-500/80 text-emerald-950' },
    { risk: 'High', confidence: '60-75%', count: 8, color: 'bg-amber-500/30 border-amber-500/50 text-amber-900' },
    { risk: 'High', confidence: '<60%', count: 2, color: 'bg-red-500/20 border-red-500/40 text-red-900' },

    { risk: 'Medium', confidence: '>90%', count: 42, color: 'bg-emerald-500/90 border-emerald-500 text-emerald-950 font-black' },
    { risk: 'Medium', confidence: '75-90%', count: 28, color: 'bg-emerald-500/70 border-emerald-500/90 text-emerald-950' },
    { risk: 'Medium', confidence: '60-75%', count: 12, color: 'bg-amber-500/20 border-amber-500/40 text-amber-900' },
    { risk: 'Medium', confidence: '<60%', count: 3, color: 'bg-red-500/10 border-red-500/30 text-red-900' },

    { risk: 'Low', confidence: '>90%', count: 85, color: 'bg-emerald-500/95 border-emerald-500 text-emerald-950 font-black' },
    { risk: 'Low', confidence: '75-90%', count: 52, color: 'bg-emerald-500/80 border-emerald-500/90 text-emerald-950 font-bold' },
    { risk: 'Low', confidence: '60-75%', count: 18, color: 'bg-emerald-500/40 border-emerald-500/60 text-emerald-900' },
    { risk: 'Low', confidence: '<60%', count: 5, color: 'bg-red-500/10 border-red-500/20 text-red-900' }
  ], []);

  // B-4: Remedy Step Complexity vs Time Scatter Data
  const complexityTimeScatter = useMemo(() => [
    { name: 'Vlan Restore', steps: 4, estTime: 8, risk: 'Low' },
    { name: 'Disk Cleanup', steps: 6, estTime: 12, risk: 'Low' },
    { name: 'BGP Path Prep', steps: 8, estTime: 22, risk: 'Medium' },
    { name: 'LUN Path Failover', steps: 11, estTime: 35, risk: 'Medium' },
    { name: 'Replica Re-Sync', steps: 14, estTime: 48, risk: 'High' },
    { name: 'Core Router SOP', steps: 19, estTime: 75, risk: 'Critical' },
    { name: 'Fibre Backup Route', steps: 22, estTime: 92, risk: 'Critical' }
  ], []);

  // B-5: Top Served Remedy Leaderboard Data
  const topRemedyArticles = useMemo(() => [
    { title: 'ESXi Host Storage Latency Mitigation Protocol', count: 68, successRate: 94, id: 'RM-8041' },
    { title: 'Juniper vmnic Carrier Flap Redirection Routine', count: 52, successRate: 88, id: 'RM-7210' },
    { title: 'MongoDB Replica Replication Timeout Recoverer', count: 41, successRate: 81, id: 'RM-5902' },
    { title: 'BGP Multihop Peering Reset Script', count: 35, successRate: 92, id: 'RM-3048' },
    { title: 'Generic Ping Failure Auto-Diagnostic Loop', count: 28, successRate: 64, id: 'RM-1011' }
  ], []);

  // B-6: Escalation Rate Tracker Data
  const escalationRateData = useMemo(() => [
    { period: 'May 1', AutoClosed: 78, Escalated: 12 },
    { period: 'May 5', AutoClosed: 84, Escalated: 10 },
    { period: 'May 10', AutoClosed: 89, Escalated: 8 },
    { period: 'May 15', AutoClosed: 91, Escalated: 7 },
    { period: 'May 20', AutoClosed: 95, Escalated: 5 }
  ], []);

  // B-7: Vendor Coverage Gap Analysis
  const vendorCoverageGapData = useMemo(() => [
    { segment: 'Switches', targetVendor: 'Cisco Catalyst', activeRemedy: 'Cisco IOS SOP', mismatch: false },
    { segment: 'Firewalls', targetVendor: 'Fortinet FortiOS', activeRemedy: 'Fallback SOP', mismatch: true },
    { segment: 'Core Routers', targetVendor: 'Juniper Junos', activeRemedy: 'Juniper Core Script', mismatch: false },
    { segment: 'Load Balancers', targetVendor: 'F5 BIG-IP', activeRemedy: 'Fallback SOP', mismatch: true },
    { segment: 'Hypervisors', targetVendor: 'VMware ESXi 8.0', activeRemedy: 'VMware ESXi SOP', mismatch: false }
  ], []);

  // B-8: RCA-to-Remedy Success Funnel
  const mappingSuccessFunnel = useMemo(() => [
    { stage: 'Incidents Ingested', val: 458, color: 'bg-primary' },
    { stage: 'RCA Confirmed (>75%)', val: 342, color: 'bg-indigo-500' },
    { stage: 'Remedy Associated', val: 298, color: 'bg-purple-500' },
    { stage: 'Auto-Run Dispatched', val: 242, color: 'bg-emerald-500' },
    { stage: 'Verification Complete', val: 218, color: 'bg-teal-500' }
  ], []);

  // B-9: Cross-Encoder Probability Threshold Sensitivity
  const ceSensitivityData = useMemo(() => [
    { threshold: 0.1, precision: 32, recall: 99 },
    { threshold: 0.3, precision: 54, recall: 95 },
    { threshold: 0.5, precision: 76, recall: 88 },
    { threshold: 0.6, precision: 86, recall: 81 },
    { threshold: 0.7, precision: 92, recall: 68 },
    { threshold: 0.8, precision: 96, recall: 45 },
    { threshold: 0.9, precision: 98, recall: 18 }
  ], []);

  // B-10: OS Flavor Coverage Map Data
  const remedyOSCoverageData = useMemo(() => [
    { name: 'Linux RHEL/CentOS', value: 45, color: '#3B82F6' },
    { name: 'Cisco IOS-XE', value: 28, color: '#10B981' },
    { name: 'VMware ESXi shell', value: 22, color: '#F59E0B' },
    { name: 'Juniper JunOS CLI', value: 15, color: '#A855F7' },
    { name: 'Windows PowerShell', value: 8, color: '#EC4899' }
  ], []);

  // B-11: Remedy OS Flavor Coverage Treemap Data
  const treemapData = useMemo(() => [
    {
      name: 'Linux Flavor',
      children: [
        { name: 'RHEL/CentOS', size: 450 },
        { name: 'Ubuntu/Debian', size: 150 },
      ]
    },
    {
      name: 'Network OS',
      children: [
        { name: 'Cisco IOS-XE', size: 280 },
        { name: 'Juniper Junos', size: 180 },
        { name: 'Arista EOS', size: 90 },
      ]
    },
    {
      name: 'Hypervisors',
      children: [
        { name: 'ESXi shell', size: 220 }
      ]
    }
  ], []);

  // B-11: Remedy Confidence Trend
  const remedyConfidenceTrend = useMemo(() => [
    { week: 'Wk 1', Network: 81, Compute: 74, Storage: 88 },
    { week: 'Wk 2', Network: 83, Compute: 79, Storage: 89 },
    { week: 'Wk 3', Network: 88, Compute: 82, Storage: 91 },
    { week: 'Wk 4', Network: 91, Compute: 86, Storage: 92 },
    { week: 'Wk 5', Network: 94, Compute: 88, Storage: 95 }
  ], []);

  // B-12: Auto vs Manual Ratio
  const autoManualRatio = useMemo(() => [
    { name: 'Auto Remedied', value: 74, color: 'hsl(var(--status-success))' },
    { name: 'Manual Verification Required', value: 26, color: 'hsl(var(--severity-medium))' }
  ], []);

  // B-13: Doc Links Coverage
  const docLinksCoverage = useMemo(() => [
    { name: 'Has Confluence Link', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Has Vendor KB Doc', value: 25, color: 'hsl(var(--status-success))' },
    { name: 'No Attached Reference', value: 10, color: 'hsl(var(--severity-critical))' }
  ], []);

  // B-14: Estimated Time Saved Data
  const timeSavedHistory = useMemo(() => [
    { period: 'Day 1', hoursSaved: 12 },
    { period: 'Day 2', hoursSaved: 18 },
    { period: 'Day 3', hoursSaved: 25 },
    { period: 'Day 4', hoursSaved: 32 },
    { period: 'Day 5', hoursSaved: 48 },
    { period: 'Day 6', hoursSaved: 54 },
    { period: 'Day 7', hoursSaved: 68 }
  ], []);

  // B-15: Feedback Loop Readiness Score
  const feedbackReadinessData = useMemo(() => [
    { dimension: 'Operator Rating Coverage', score: 85 },
    { dimension: 'Execution Logs Success', score: 92 },
    { dimension: 'Error-Path Retries Logged', score: 78 },
    { dimension: 'Config drift tracked', score: 64 },
    { dimension: 'Telemetry Pre-Post Verified', score: 90 }
  ], []);

  return (
    <MainLayout>
      <div className="p-6 space-y-8 bg-background min-h-screen text-foreground font-['Sora',sans-serif] relative overflow-hidden">
        
        {/* Glow decoration layers */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none z-0" />

        {/* 1. HEADER CONTROL BAND */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6 z-10 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                AIOps Advanced Analytics
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full uppercase tracking-widest">PRO</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Multi-dimensional Operational Intelligence, RAG Pipeline Insights, and Cause Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search metrics, devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border/50 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Time Filter Tabs */}
            <div className="flex items-center bg-card border border-border/50 rounded-xl p-1 shrink-0">
              {['3h', '24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase transition-all ${
                    timeRange === range
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. DYNAMIC NAVIGATION TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8 z-10 relative">
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <TabsList className="bg-transparent gap-6 p-0 h-auto">
              <TabsTrigger
                value="events"
                className={`text-xs font-black tracking-widest uppercase pb-3 border-b-2 rounded-none transition-all px-0 h-auto ${
                  activeTab === 'events'
                    ? 'border-primary text-primary bg-transparent'
                    : 'border-transparent text-muted-foreground hover:text-foreground bg-transparent'
                }`}
              >
                <Activity className="h-3.5 w-3.5 mr-2" />
                1. Event Intelligence
              </TabsTrigger>
              <TabsTrigger
                value="rca"
                className={`text-xs font-black tracking-widest uppercase pb-3 border-b-2 rounded-none transition-all px-0 h-auto ${
                  activeTab === 'rca'
                    ? 'border-primary text-primary bg-transparent'
                    : 'border-transparent text-muted-foreground hover:text-foreground bg-transparent'
                }`}
              >
                <Cpu className="h-3.5 w-3.5 mr-2" />
                2. RAG & RCA Insights
              </TabsTrigger>
              <TabsTrigger
                value="remediation"
                className={`text-xs font-black tracking-widest uppercase pb-3 border-b-2 rounded-none transition-all px-0 h-auto ${
                  activeTab === 'remediation'
                    ? 'border-primary text-primary bg-transparent'
                    : 'border-transparent text-muted-foreground hover:text-foreground bg-transparent'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                3. Remediation Analytics
              </TabsTrigger>
            </TabsList>

            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 bg-card border border-border/40 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Telemetry Feed Active
            </div>
          </div>

          {/* ========================================================
              TAB 1: EVENT INTELLIGENCE
              ======================================================== */}
          <TabsContent value="events" className="mt-0 space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* W-E1: Severity Heat Calendar */}
              <Card className="lg:col-span-2 bg-card/40 border-border/50 backdrop-blur-md">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground flex items-center justify-between">
                    W-E1 · Severity Heat Calendar
                    <span className="text-[9px] font-black text-primary border border-primary/20 bg-primary/5 px-2 py-0.5 rounded-full tracking-normal">84 Days Analyzed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold">Incident distribution timeline</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-teal-500/20 rounded-sm border border-teal-500/30" /><span className="text-[9px] font-black text-muted-foreground">LOW</span></div>
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-amber-500/20 rounded-sm border border-amber-500/30" /><span className="text-[9px] font-black text-muted-foreground">MINOR</span></div>
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-orange-500/30 rounded-sm border border-orange-500/40" /><span className="text-[9px] font-black text-muted-foreground">MAJOR</span></div>
                      <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-red-500/40 rounded-sm border border-red-500/55 animate-pulse" /><span className="text-[9px] font-black text-muted-foreground">CRITICAL</span></div>
                    </div>
                  </div>
                  
                  {/* Heat Matrix */}
                  <div className="relative">
                    <div className="grid grid-cols-12 gap-2 overflow-x-auto pb-2">
                      {Array.from({ length: 12 }).map((_, colIdx) => (
                        <div key={colIdx} className="space-y-2 min-w-[32px]">
                          {heatCalendarData.slice(colIdx * 7, (colIdx + 1) * 7).map((cell) => {
                            const colorClass =
                              cell.severity === 'Critical' ? 'bg-red-500/40 border-red-500/60 hover:bg-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.2)]' :
                              cell.severity === 'Major' ? 'bg-orange-500/35 border-orange-500/50 hover:bg-orange-500/50' :
                              cell.severity === 'Minor' ? 'bg-amber-500/20 border-amber-500/35 hover:bg-amber-500/40' :
                              'bg-teal-500/10 border-teal-500/25 hover:bg-teal-500/30';
                            return (
                              <div
                                key={cell.id}
                                onClick={() => setSelectedDetails({ type: 'heat', data: cell })}
                                onMouseEnter={() => setHoveredCalendarCell(cell)}
                                onMouseLeave={() => setHoveredCalendarCell(null)}
                                className={`h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center text-[8px] font-black tracking-tighter ${colorClass}`}
                              >
                                {cell.count}
                              </div>
                            );
                          })}
                          <div className="text-[8px] font-black text-center text-muted-foreground tracking-tighter uppercase mt-1">W{colIdx + 1}</div>
                        </div>
                      ))}
                    </div>

                    {/* Highly interactive calendar custom tooltip */}
                    {hoveredCalendarCell && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover/95 border border-border/80 px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-xl text-center font-['Sora',sans-serif] z-50 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block leading-none">{hoveredCalendarCell.date}</span>
                        <div className="flex items-center gap-2 mt-1.5 justify-center">
                          <span className="text-xs font-black text-foreground">{hoveredCalendarCell.count} Events</span>
                          <span className="text-muted-foreground font-medium text-[10px]">•</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            hoveredCalendarCell.severity === 'Critical' ? 'text-red-500' :
                            hoveredCalendarCell.severity === 'Major' ? 'text-orange-500' :
                            hoveredCalendarCell.severity === 'Minor' ? 'text-amber-500' :
                            'text-teal-500'
                          }`}>{hoveredCalendarCell.severity}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* W-E3: Live Event Rate Gauge + Trend */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E3 · Live Event Rate Gauge
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-between h-[250px] relative">
                  <div className="relative flex justify-center items-center h-28 w-full mt-2">
                    <svg width="200" height="110" className="overflow-visible">
                      <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="currentColor" className="text-muted/10 dark:text-white/5" strokeWidth="12" strokeLinecap="round" />
                      <path d="M 20 100 A 80 80 0 0 1 140 38" fill="none" stroke="url(#rateGradient)" strokeWidth="12" strokeLinecap="round" />
                      <line x1="100" y1="100" x2="135" y2="40" stroke="hsl(var(--severity-high))" strokeWidth="4" strokeLinecap="round" className="origin-[100px_100px] transition-transform duration-1000 ease-out" />
                      <circle cx="100" cy="100" r="8" fill="hsl(var(--card))" stroke="hsl(var(--severity-high))" strokeWidth="3" />
                      <defs>
                        <linearGradient id="rateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="60%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#EF4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute bottom-2 flex flex-col items-center">
                      <span className="text-2xl font-black text-foreground">34.2 / min</span>
                      <span className="text-[8px] font-black tracking-widest text-[#EF4444] flex items-center gap-1 mt-1 uppercase">
                        <ArrowUpRight className="h-3 w-3" /> Peak Spike
                      </span>
                    </div>
                  </div>

                  {/* Sparkline trend over past 1 hour */}
                  <div className="w-full h-14 bg-muted/20 border border-border/40 rounded-xl overflow-hidden p-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={Array.from({ length: 12 }).map((_, idx) => ({ idx, val: Math.round(20 + Math.sin(idx * 0.8) * 12 + Math.random() * 8) }))}>
                        <defs>
                          <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="val" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#sparkGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* W-E2: Source Sankey Flow */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md flex flex-col h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E2 · Ingress Source Sankey Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Ingress Channels → AI Classifications</div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative w-full h-[280px] overflow-visible select-none">
                      <svg viewBox="0 0 450 250" className="w-full h-full overflow-visible">
                        {/* Define gradients for link streams */}
                        <defs>
                          {sankeyData.links.map((link, idx) => {
                            const srcNode = sankeyData.nodes[link.source];
                            const tgtNode = sankeyData.nodes[link.target];
                            return (
                              <linearGradient key={`grad-${idx}`} id={`grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={srcNode.fill} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={tgtNode.fill} stopOpacity={0.4} />
                              </linearGradient>
                            );
                          })}
                        </defs>

                        {/* Interactive flow links */}
                        {sankeyData.links.map((link, idx) => {
                          const srcY = 25 + link.source * 50;
                          const tgtY = 35 + (link.target - 5) * 60;
                          const pathStr = `M 45 ${srcY} C 225 ${srcY}, 225 ${tgtY}, 405 ${tgtY}`;
                          const strokeWidth = Math.max(3, link.value / 18);
                          const isHovered = hoveredSankeyLink?.id === `link-${idx}`;
                          
                          return (
                            <g key={`link-group-${idx}`}>
                              <path
                                d={pathStr}
                                stroke={`url(#grad-${idx})`}
                                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                fill="none"
                                className="transition-all duration-200 cursor-pointer"
                                opacity={isHovered ? 0.95 : 0.45}
                                onMouseEnter={() => setHoveredSankeyLink({ id: `link-${idx}`, value: link.value, source: sankeyData.nodes[link.source].name, target: sankeyData.nodes[link.target].name })}
                                onMouseLeave={() => setHoveredSankeyLink(null)}
                              />
                              {/* Display values along path */}
                              <g transform={`translate(225, ${(srcY + tgtY) / 2})`} className="pointer-events-none">
                                <rect x="-14" y="-7" width="28" height="14" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" className="opacity-95" />
                                <text textAnchor="middle" y="3" fontSize="8" fontWeight="bold" fill="currentColor" className="font-mono">{link.value}</text>
                              </g>
                            </g>
                          );
                        })}

                        {/* Left source nodes */}
                        {sankeyData.nodes.slice(0, 5).map((node, idx) => {
                          const Y = 25 + idx * 50;
                          return (
                            <g key={`src-${idx}`} className="cursor-pointer" onMouseEnter={() => setHoveredSankeyNode(node)} onMouseLeave={() => setHoveredSankeyNode(null)}>
                              <rect x="10" y={Y - 14} width="35" height="28" rx="6" fill={node.fill} className="opacity-10" />
                              <rect x="40" y={Y - 14} width="5" height="28" rx="1.5" fill={node.fill} />
                              <text x="32" y={Y + 4} textAnchor="end" fontSize="9" fontWeight="black" fill="currentColor" className="uppercase tracking-wider">{node.name}</text>
                            </g>
                          );
                        })}

                        {/* Right target nodes */}
                        {sankeyData.nodes.slice(5).map((node, idx) => {
                          const Y = 35 + idx * 60;
                          return (
                            <g key={`tgt-${idx}`} className="cursor-pointer" onMouseEnter={() => setHoveredSankeyNode(node)} onMouseLeave={() => setHoveredSankeyNode(null)}>
                              <rect x="405" y={Y - 14} width="5" height="28" rx="1.5" fill={node.fill} />
                              <rect x="405" y={Y - 14} width="40" height="28" rx="6" fill={node.fill} className="opacity-10" />
                              <text x="415" y={Y + 4} textAnchor="start" fontSize="8" fontWeight="black" fill="currentColor" className="uppercase tracking-wider">{node.name}</text>
                            </g>
                          );
                        })}
                      </svg>

                      {/* Sankey interactive tooltip */}
                      {hoveredSankeyLink && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-popover/95 border border-border/80 px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-xl text-center font-['Sora',sans-serif] z-50 min-w-[280px]">
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block leading-none">Ingress Mapping Flow</span>
                          <div className="flex items-center gap-1.5 mt-1.5 justify-center text-[10px] font-black">
                            <span className="text-primary">{hoveredSankeyLink.source}</span>
                            <span className="text-muted-foreground font-medium">→</span>
                            <span className="text-foreground">{hoveredSankeyLink.value} events</span>
                            <span className="text-muted-foreground font-medium">→</span>
                            <span className="text-emerald-500">{hoveredSankeyLink.target}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* W-E4: Business Service Impact Heatmap */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E4 · Business Service Impact Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="space-y-4">
                    {serviceImpacts.map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-border/20 pb-3 last:border-b-0">
                        <div className="space-y-1">
                          <span className="text-xs font-black text-foreground block">{service.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-red-500">{service.critical} Crit</span>
                            <span className="text-[9px] font-bold text-orange-500">{service.major} Maj</span>
                            <span className="text-[9px] font-bold text-amber-500">{service.minor} Min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-foreground w-8 text-right">{service.score}</span>
                          <div className="w-16 h-2.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              service.score > 80 ? 'bg-red-500' : service.score > 60 ? 'bg-orange-500' : 'bg-teal-500'
                            }`} style={{ width: `${service.score}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* W-E5: AI Pipeline Funnel */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E5 · AI Pipeline Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="space-y-3">
                    {[
                      { stage: 'Ingest Raw Events', value: 2482, conversion: '100%', color: 'bg-primary' },
                      { stage: 'Deduplicated Nodes', value: 1845, conversion: '74.3%', color: 'bg-emerald-500' },
                      { stage: 'Suppressed Alarms', value: 1212, conversion: '48.8%', color: 'bg-teal-500' },
                      { stage: 'Correlated Clusters', value: 458, conversion: '18.4%', color: 'bg-orange-500' },
                      { stage: 'Remediated & Closed', value: 118, conversion: '4.7%', color: 'bg-red-500' }
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase">
                          <span>{step.stage}</span>
                          <span className="text-foreground">{step.value} ({step.conversion})</span>
                        </div>
                        <div className="h-3.5 bg-muted rounded-lg overflow-hidden border border-border/40 relative">
                          <div className={`h-full rounded-lg ${step.color} opacity-80`} style={{ width: step.conversion }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* W-E6: Correlation Label Chord Diagram */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E6 · Correlation Label Connectivity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Correlation Method Inter-relationships</div>
                  <div className="flex-1 flex items-center justify-center relative">
                    <svg width="200" height="200" className="overflow-visible">
                      <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" className="text-muted/10 dark:text-white/5" strokeWidth="2" />
                      {/* Interactive nodes along circle */}
                      {[
                        { name: 'Temporal', x: 100, y: 30, color: '#06B6D4' },
                        { name: 'Topological', x: 165, y: 75, color: '#10B981' },
                        { name: 'Rule-Based', x: 140, y: 155, color: '#A855F7' },
                        { name: 'Dynamic', x: 60, y: 155, color: '#F97316' },
                        { name: 'Interface Flap', x: 35, y: 75, color: '#EF4444' }
                      ].map((node, idx, arr) => (
                        <g key={idx}>
                          {/* Inner connector lines */}
                          {arr.slice(idx + 1).map((peer, pIdx) => (
                            <line
                              key={pIdx}
                              x1={node.x}
                              y1={node.y}
                              x2={peer.x}
                              y2={peer.y}
                              stroke="currentColor"
                              className="text-muted/20 dark:text-white/10"
                              strokeWidth="1.5"
                              strokeDasharray="2 2"
                            />
                          ))}
                          <circle cx={node.x} cy={node.y} r="10" fill="hsl(var(--card))" stroke={node.color} strokeWidth="3.5" className="cursor-pointer hover:r-12 transition-all" />
                          <text x={node.x} y={node.y - 14} textAnchor="middle" fill="currentColor" className="text-[8px] font-black uppercase tracking-wider">{node.name}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* W-E7: Site / Region Bubble Map */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E7 · Site / Region Bubble Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Operational Status Across Regions</div>
                  <div className="flex-1 flex flex-col justify-around">
                    {[
                      { region: 'North America (NA)', site: 'DC1 Primary', events: 142, status: 'Critical', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
                      { region: 'Europe (EMEA)', site: 'DC3 Secondary', events: 78, status: 'Major', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' },
                      { region: 'Asia-Pacific (APAC)', site: 'DC2 Recovery', events: 24, status: 'Healthy', color: 'bg-teal-500/20 text-teal-500 border-teal-500/30' }
                    ].map((site, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${site.color}`}>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black tracking-widest uppercase block">{site.region}</span>
                          <span className="text-[9px] font-bold block opacity-85">{site.site}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black block leading-none">{site.events}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest block opacity-75">{site.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* W-E8: ACK & Ticket Coverage Arc */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E8 · ACK & Ticket Coverage Arc
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-around h-[330px]">
                  <div className="flex justify-around w-full gap-4">
                    <ConcentricGauge value={85} label="Acknowledged" subLabel="35/41 Events" color="hsl(var(--primary))" />
                    <ConcentricGauge value={92} label="Ticketed" subLabel="38/41 Events" color="hsl(var(--status-success))" />
                  </div>
                  <div className="w-full bg-muted/10 border border-border/30 rounded-xl p-3.5 space-y-2 text-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Operational Coverage SLA</span>
                    <span className="text-xs font-bold text-foreground block">Critical events require verification within 15 minutes</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* W-E9: Noise Reduction Waterfall */}
              <Card className="lg:col-span-2 bg-card/40 border-border/50 backdrop-blur-md h-[420px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E9 · Noise Reduction Waterfall
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[350px]">
                  <div className="space-y-4">
                    {reductionWaterfall.map((stage, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-28 flex-shrink-0">
                          <span className="text-xs font-black text-foreground">{stage.name}</span>
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="h-3 w-full bg-muted rounded-full">
                            <div className="h-full rounded-full" style={{ width: `${(stage.val / 2482) * 100}%`, backgroundColor: stage.fill }} />
                          </div>
                          <span className="text-xs font-black text-foreground w-12 text-right">{stage.val}</span>
                        </div>
                        <div className="w-20 text-right">
                          <Badge variant="outline" className="text-[9px] font-black border-border/80 text-muted-foreground">{stage.change}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* W-E10: Device Health Scorecard Grid */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[420px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-E10 · Device Health Scorecard Grid
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[350px] custom-scrollbar">
                  <div className="space-y-3">
                    {sickestDevices.map((device, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedDetails({ type: 'device', data: device })}
                        className="p-3 bg-muted/20 border border-border/50 rounded-xl hover:border-primary/50 cursor-pointer flex items-center justify-between transition-all"
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-black text-foreground block font-mono">{device.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{device.type}</span>
                            <span className="text-[9px] font-bold text-muted-foreground font-mono">{device.ip}</span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="space-y-0.5">
                            <span className="text-sm font-black text-foreground block">{device.score}</span>
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block">{device.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================================
              TAB 2: RAG & RCA INSIGHTS
              ======================================================== */}
          {/* ========================================================
              TAB 2: RAG & RCA INSIGHTS (15 WIDGETS)
              ======================================================== */}
          <TabsContent value="rca" className="mt-0 space-y-8 animate-in fade-in duration-300">
            {/* Row 1: A-1, A-2, A-3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* A-1: RCA Confidence Waterfall */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-1 · RCA Confidence Waterfall
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Confidence Score Contributors</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={waterfallData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                          {waterfallData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.val >= 0 ? 'hsl(var(--status-success))' : 'hsl(var(--severity-critical))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* A-2: Semantic vs BM25 Spider Contribution */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-2 · Semantic vs BM25 Pre-Score Contribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Retrieval Score Decomposition</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={spiderData}>
                        <PolarGrid strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 8 }} axisLine={false} />
                        <Radar name="Semantic FAISS" dataKey="semantic" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                        <Radar name="Keyword BM25" dataKey="bm25" stroke="hsl(var(--status-success))" fill="hsl(var(--status-success))" fillOpacity={0.1} />
                        <Radar name="Reciprocal Rank Fusion" dataKey="rrf" stroke="hsl(var(--severity-high))" fill="hsl(var(--severity-high))" fillOpacity={0.15} />
                        <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* A-3: Log Zone Classification Heatmap */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-3 · Log Zone Classification Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar relative">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Retrieved Logs Classified by AI Pipeline</div>
                  <div className="space-y-2">
                    {logZoneData.map((log, idx) => {
                      const badgeColor =
                        log.zone === 'Probable Cause' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        log.zone === 'Impact' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        'bg-teal-500/10 text-teal-500 border-teal-500/20';
                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredLogZone(log)}
                          onMouseLeave={() => setHoveredLogZone(null)}
                          onClick={() => setSelectedDetails({ type: 'logZone', data: log })}
                          className="p-2.5 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all"
                        >
                          <div className="truncate pr-2 space-y-0.5">
                            <span className="text-[10px] font-black text-foreground block truncate font-mono">{log.template}</span>
                            <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono">Count: {log.count}</span>
                          </div>
                          <Badge variant="outline" className={`text-[8px] font-black px-2 uppercase shrink-0 ${badgeColor}`}>
                            {log.zone}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>

                  {hoveredLogZone && (
                    <div className="absolute top-12 left-6 right-6 bg-popover border border-border px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl text-left z-50">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">AI Zone Classifier details</span>
                      <p className="text-[10px] font-black text-foreground font-mono mt-1 leading-normal">{hoveredLogZone.template}</p>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-border/40 text-[9px] font-bold">
                        <span className="text-muted-foreground">Similarity Score:</span>
                        <span className="text-primary font-mono">{(hoveredLogZone.score / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Row 2: A-4, A-5, A-6 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* A-4: Anomaly Z-Score Magnitude */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-4 · Anomaly Z-Score Magnitude
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Metrics Z-score deviations</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeOpacity={0.05} />
                        <XAxis type="number" dataKey="x" name="Metric Phase" unit="" tick={{ fontSize: 8, fill: '#64748B' }} hide />
                        <YAxis type="number" dataKey="y" name="Z-Score" unit="Z" tick={{ fontSize: 8, fill: '#64748B' }} />
                        <ZAxis type="number" dataKey="z" range={[60, 400]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomChartTooltip />} />
                        <Scatter name="Anomalies" data={zScoreBubbleData} fill="hsl(var(--severity-critical))" shape="circle" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* A-5: RCA Evidence Chain */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-5 · RCA Evidence Chain Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar relative">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Chronological Correlation Path</div>
                  <div className="relative pl-6 border-l border-border/50 space-y-4">
                    {evidenceTimelineData.map((evt, idx) => (
                      <div
                        key={idx}
                        className="relative group cursor-pointer"
                        onMouseEnter={() => setHoveredEvidence(evt)}
                        onMouseLeave={() => setHoveredEvidence(null)}
                      >
                        <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full border-2 bg-card border-primary flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-muted-foreground font-mono block">{evt.time} · {evt.source}</span>
                          <span className="text-[10px] font-black text-foreground block font-mono">{evt.node}</span>
                          <span className="text-[10px] text-muted-foreground block">{evt.event}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hoveredEvidence && (
                    <div className="absolute bottom-6 left-6 right-6 bg-popover border border-border p-3.5 rounded-xl shadow-2xl backdrop-blur-xl">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Evidence Payload</span>
                      <p className="text-[11px] font-black text-foreground mt-1.5 font-mono">{hoveredEvidence.node} - {hoveredEvidence.event}</p>
                      <div className="grid grid-cols-2 gap-4 mt-2.5 pt-2 border-t border-border/40 text-[9px] font-bold">
                        <span className="text-muted-foreground">Severity: <span className="text-red-500 font-mono">{hoveredEvidence.severity}</span></span>
                        <span className="text-muted-foreground text-right">Source: <span className="text-primary font-mono">{hoveredEvidence.source}</span></span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* A-6: Drain3 Similarity Matrix */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-6 · Drain3 Similarity Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px] relative">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Template Cluster Relationships</div>
                  <div className="flex-1 flex flex-col gap-1">
                    {drainSimilarityData.map((row, rIdx) => (
                      <div key={rIdx} className="flex gap-1 flex-1">
                        {row.map((cell, cIdx) => {
                          const opacity = Math.round(cell * 100);
                          const cellBg =
                            cell > 0.8 ? 'bg-primary/90 hover:bg-primary text-primary-foreground font-black' :
                            cell > 0.5 ? 'bg-primary/50 hover:bg-primary/70 text-foreground font-bold' :
                            cell > 0.2 ? 'bg-primary/20 hover:bg-primary/30 text-muted-foreground' :
                            'bg-primary/5 hover:bg-primary/10 text-muted-foreground/50';
                          return (
                            <div
                              key={cIdx}
                              onMouseEnter={() => setHoveredMatrixCell({ r: rIdx + 1, c: cIdx + 1, val: cell })}
                              onMouseLeave={() => setHoveredMatrixCell(null)}
                              className={`flex-1 rounded-lg border border-border/10 flex items-center justify-center text-[9px] font-mono transition-all cursor-pointer ${cellBg}`}
                            >
                              {cell.toFixed(2)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {hoveredMatrixCell && (
                    <div className="absolute top-12 left-6 right-6 bg-popover border border-border px-3 py-2 rounded-xl shadow-2xl text-center backdrop-blur-xl">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block leading-none">Similarity Grid</span>
                      <p className="text-[10px] font-black text-foreground font-mono mt-1">Cluster {hoveredMatrixCell.r} ↔ Cluster {hoveredMatrixCell.c}: {Math.round(hoveredMatrixCell.val * 100)}% Similarity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Row 3: A-7, A-8, A-9 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* A-7: KB Domain Confidence */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-7 · KB Domain Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Min-Max Match Distribution</div>
                  <div className="space-y-4">
                    {kbDomainConfidenceData.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black font-mono">
                          <span>{item.name}</span>
                          <span className="text-primary">{item.avg}% Avg</span>
                        </div>
                        <div className="relative h-4 bg-muted/20 border border-border/30 rounded-full overflow-hidden flex items-center">
                          {/* Min-Max Bar Range */}
                          <div
                            className="absolute h-2.5 rounded-full opacity-60"
                            style={{
                              left: `${item.min}%`,
                              width: `${item.max - item.min}%`,
                              backgroundColor: item.color
                            }}
                          />
                          {/* Average Tick Marker */}
                          <div
                            className="absolute w-1.5 h-4 bg-foreground border border-background shadow rounded-full z-10"
                            style={{ left: `${item.avg}%`, transform: 'translateX(-50%)' }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-muted-foreground font-mono px-1">
                          <span>Min: {item.min}%</span>
                          <span>Max: {item.max}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* A-8: Query Semantic Text Word Cloud */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-8 · Query Semantic Text Word Cloud
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Active RAG Search query weights</div>
                  <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-2 p-2">
                    {wordCloudWords.map((word, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-xl bg-muted/10 border border-border/40 font-mono tracking-tight transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/30 ${word.size > 20 ? 'shadow-md' : ''} ${word.color} ${word.weight}`}
                        style={{ fontSize: word.size }}
                      >
                        {word.text}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* A-9: Inferred Domain Stacked Bar */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-9 · Inferred Domain Stacked Bar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Category Inference Overlap</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inferredDomainData} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                        <Bar dataKey="Network" stackId="a" fill="#3B82F6" />
                        <Bar dataKey="Compute" stackId="a" fill="#10B981" />
                        <Bar dataKey="Storage" stackId="a" fill="#F59E0B" />
                        <Bar dataKey="Other" stackId="a" fill="#A855F7" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 4: A-10, A-11, A-12 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* A-10: Relevant Log Leaderboard */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-10 · Relevant Log Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 font-sans">Semantic Match Rank Logs</div>
                  <div className="space-y-4">
                    {relevantLogData.map((log, idx) => (
                      <div key={idx} className="space-y-1.5 border-b border-border/20 pb-3 last:border-b-0">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-black text-foreground block truncate max-w-[200px] font-mono">{log.text}</span>
                          <span className="text-[9px] font-black text-primary font-mono">{log.score}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${log.score}%` }} />
                          </div>
                          <span className="text-[8px] font-black text-muted-foreground uppercase shrink-0 font-mono">{log.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* A-11: Entity Extraction Coverage Trend */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-11 · Entity Extraction Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Entity Count Progression</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={entityCoverageData} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="IP" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="Interface" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="ErrorCode" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="Port" stackId="1" stroke="#A855F7" fill="#A855F7" fillOpacity={0.15} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* A-12: Confidence Gate Funnel */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-12 · Confidence Gate Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">SOP Retrieval Filtering Gate</div>
                  <div className="space-y-3">
                    {confidenceGateData.map((step, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase">
                          <span>{step.name}</span>
                          <span className="text-foreground">{step.val}% ({step.label})</span>
                        </div>
                        <div className="h-3.5 bg-muted/20 rounded-lg overflow-hidden border border-border/40 relative">
                          <div className="h-full rounded-lg bg-primary opacity-80" style={{ width: `${step.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 5: A-13, A-14, A-15 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* A-13: Hypothesis Overlap Network */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-13 · Hypothesis Overlap Network Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px] relative">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Diagnostic Intersection Network</div>
                  <div className="flex-1 flex items-center justify-center overflow-visible">
                    <svg viewBox="0 0 420 280" className="w-full h-full overflow-visible">
                      {/* Connection Links */}
                      {hypothesisNetworkLinks.map((link, idx) => {
                        const srcNode = hypothesisNetworkNodes.find(n => n.id === link.source);
                        const tgtNode = hypothesisNetworkNodes.find(n => n.id === link.target);
                        if (!srcNode || !tgtNode) return null;
                        return (
                          <line
                            key={`link-${idx}`}
                            x1={srcNode.cx}
                            y1={srcNode.cy}
                            x2={tgtNode.cx}
                            y2={tgtNode.cy}
                            stroke="hsl(var(--border))"
                            strokeWidth={link.weight}
                            strokeOpacity={0.4}
                          />
                        );
                      })}

                      {/* Interactive Nodes */}
                      {hypothesisNetworkNodes.map((node) => (
                        <g
                          key={node.id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredNetworkNode(node)}
                          onMouseLeave={() => setHoveredNetworkNode(null)}
                          onClick={() => setSelectedDetails({ type: 'networkNode', data: node })}
                        >
                          <circle
                            cx={node.cx}
                            cy={node.cy}
                            r={node.size}
                            fill="hsl(var(--card))"
                            stroke={node.color}
                            strokeWidth={3}
                            className="transition-all hover:scale-[1.1] origin-center"
                          />
                          <text
                            x={node.cx}
                            y={node.cy + 4}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="black"
                            fill="currentColor"
                            className="pointer-events-none uppercase tracking-wide font-mono"
                          >
                            {node.label.split(' ')[0]}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  {hoveredNetworkNode && (
                    <div className="absolute top-12 left-6 right-6 bg-popover border border-border px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-xl">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Interactive Network Node</span>
                      <p className="text-[11px] font-black text-foreground font-mono mt-1">{hoveredNetworkNode.label}</p>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-border/40 text-[9px] font-bold">
                        <span className="text-muted-foreground">Category: {hoveredNetworkNode.group}</span>
                        <span className="text-primary font-mono">Index: {hoveredNetworkNode.id}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* A-14: Metric Baseline Gauge */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-14 · Metric Baseline Gauge
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Deviation from historical baseline</div>
                  <div className="grid grid-cols-2 gap-4">
                    {metricDeviations.map((metric, idx) => {
                      const color =
                        metric.status === 'critical' ? 'text-red-500 border-red-500/20' :
                        metric.status === 'high' ? 'text-orange-500 border-orange-500/20' :
                        metric.status === 'medium' ? 'text-amber-500 border-amber-500/20' :
                        'text-teal-500 border-teal-500/20';
                      return (
                        <div key={idx} className="p-3 bg-muted/15 border border-border/50 rounded-xl flex items-center justify-between font-mono">
                          <div className="space-y-1 truncate pr-1">
                            <span className="text-[9px] font-black text-foreground block truncate">{metric.name}</span>
                            <span className={`text-[8px] font-black uppercase tracking-wider block ${color}`}>{metric.dev}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-foreground block">{metric.val}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* A-15: RAG Build Time vs Complexity */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    A-15 · RAG Build Time vs Complexity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Build Latency (s) vs Logic Nodes</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeOpacity={0.05} />
                        <XAxis type="number" dataKey="complexity" name="Complexity" unit=" nodes" tick={{ fontSize: 8, fill: '#64748B' }} />
                        <YAxis type="number" dataKey="buildTime" name="Build Time" unit="s" tick={{ fontSize: 8, fill: '#64748B' }} />
                        <ZAxis type="number" dataKey="kbDocs" range={[40, 200]} name="Docs Searched" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomChartTooltip />} />
                        <Scatter name="Build Sessions" data={buildTimeScatterData} fill="hsl(var(--primary))" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================================
              TAB 3: REMEDIATION ANALYTICS (15 WIDGETS)
              ======================================================== */}
          <TabsContent value="remediation" className="mt-0 space-y-8 animate-in fade-in duration-300">
            {/* Row 1: B-1, B-2, B-3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* B-1: Remedy Confidence per Vendor Box Plot */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-1 · Remedy Confidence by Vendor Box Plot
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Verification ranges by OS vendor</div>
                  <div className="space-y-4">
                    {remedyVendorConfidenceData.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-black font-mono">
                          <span>{item.vendor}</span>
                          <span className="text-primary">{item.avg}% Avg</span>
                        </div>
                        <div className="relative h-4 bg-muted/20 border border-border/30 rounded-full overflow-hidden flex items-center">
                          {/* Box range */}
                          <div
                            className="absolute h-2.5 rounded-full opacity-60"
                            style={{
                              left: `${item.min}%`,
                              width: `${item.max - item.min}%`,
                              backgroundColor: item.color
                            }}
                          />
                          {/* Avg tick */}
                          <div
                            className="absolute w-1.5 h-4 bg-foreground border border-background shadow rounded-full z-10"
                            style={{ left: `${item.avg}%`, transform: 'translateX(-50%)' }}
                          />
                        </div>
                        <div className="flex justify-between text-[8px] font-bold text-muted-foreground font-mono px-1">
                          <span>Low Limit: {item.min}%</span>
                          <span>High Limit: {item.max}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* B-2: Remediation Time Estimate Histogram */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-2 · Remediation Time Estimate Histogram
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Duration Bins (Auto vs Manual)</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={remedyTimeHistogram} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="bin" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                        <Bar dataKey="auto" name="Auto Run" fill="hsl(var(--status-success))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="manual" name="Manual Verification" fill="hsl(var(--severity-high))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* B-3: Risk Level vs Confidence 2D Matrix */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-3 · Risk Level vs Confidence 2D Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px] relative">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Incident Matrix distribution</div>
                  <div className="grid grid-cols-4 gap-1 flex-1">
                    {riskConfidenceMatrix.map((cell, idx) => (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredMatrixCell(cell)}
                        onMouseLeave={() => setHoveredMatrixCell(null)}
                        className={`rounded-lg border border-border/20 flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-all duration-200 hover:scale-[1.03] ${cell.color}`}
                      >
                        <span className="text-[10px] block font-black leading-none font-mono">{cell.count}</span>
                        <span className="text-[7px] block opacity-80 mt-1 uppercase font-mono tracking-tight truncate w-full">{cell.risk}</span>
                      </div>
                    ))}
                  </div>

                  {hoveredMatrixCell && (
                    <div className="absolute top-12 left-6 right-6 bg-popover border border-border px-3.5 py-2.5 rounded-xl shadow-2xl text-center backdrop-blur-xl">
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block leading-none">Matrix Cell Details</span>
                      <p className="text-[10px] font-black text-foreground font-mono mt-1">Confidence {hoveredMatrixCell.confidence} ↔ Risk {hoveredMatrixCell.risk}: {hoveredMatrixCell.count} Incidents</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Row 2: B-4, B-5, B-6 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* B-4: Remedy Step Complexity vs Time Estimate */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-4 · Remedy Step Complexity vs Time Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Step Count vs Est Execution Time (m)</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <CartesianGrid strokeOpacity={0.05} />
                        <XAxis type="number" dataKey="steps" name="Steps" unit=" steps" tick={{ fontSize: 8, fill: '#64748B' }} />
                        <YAxis type="number" dataKey="estTime" name="Est Time" unit="m" tick={{ fontSize: 8, fill: '#64748B' }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomChartTooltip />} />
                        <Scatter name="Remedies" data={complexityTimeScatter} fill="hsl(var(--primary))" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* B-5: Top Served Remedy Leaderboard */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-5 · Top Served Remedy Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Remediation Script Execution Counts</div>
                  <div className="space-y-4">
                    {topRemedyArticles.map((art, idx) => (
                      <div key={idx} className="space-y-1.5 border-b border-border/20 pb-3 last:border-b-0">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-black text-foreground block truncate max-w-[220px]">{art.title}</span>
                          <span className="text-[9px] font-black text-primary font-mono">{art.count} runs</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${art.successRate}%` }} />
                          </div>
                          <span className="text-[8px] font-black text-emerald-500 uppercase shrink-0 font-mono">{art.successRate}% Success</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* B-6: Remedy Escalation Rate Tracker */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-6 · Remedy Escalation Rate Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Escalation rates for top articles</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={escalationRateData} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="AutoClosed" stackId="1" name="Auto Resolved" stroke="hsl(var(--status-success))" fill="hsl(var(--status-success))" fillOpacity={0.15} />
                        <Area type="monotone" dataKey="Escalated" stackId="1" name="Escalated" stroke="hsl(var(--severity-critical))" fill="hsl(var(--severity-critical))" fillOpacity={0.15} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 3: B-7, B-8, B-9 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* B-7: Vendor Coverage Gap Analysis */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-7 · Vendor Coverage Gap Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Fallback Match Flags</div>
                  <div className="space-y-2">
                    {vendorCoverageGapData.map((item, idx) => (
                      <div key={idx} className="p-2.5 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between font-mono">
                        <div className="space-y-0.5 truncate pr-1">
                          <span className="text-[10px] font-black text-foreground block truncate">{item.segment}</span>
                          <span className="text-[8px] font-bold text-muted-foreground block truncate">{item.targetVendor} → {item.activeRemedy}</span>
                        </div>
                        <Badge variant="outline" className={`text-[8px] font-black px-2 uppercase shrink-0 ${
                          item.mismatch ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}>
                          {item.mismatch ? 'Coverage Gap' : 'Matched'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* B-8: RCA-to-Remedy Mapping Success Funnel */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-8 · RCA-to-Remedy Success Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Association Pipeline Steps</div>
                  <div className="space-y-3">
                    {mappingSuccessFunnel.map((step, idx) => {
                      const widthPercent = (step.val / 458) * 100;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase">
                            <span>{step.stage}</span>
                            <span className="text-foreground">{step.val} runs ({Math.round(widthPercent)}%)</span>
                          </div>
                          <div className="h-3.5 bg-muted/20 rounded-lg overflow-hidden border border-border/40 relative">
                            <div className={`h-full rounded-lg ${step.color} opacity-85`} style={{ width: `${widthPercent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* B-9: CE Threshold Sensitivity Histogram */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-9 · CE Threshold Sensitivity Histogram
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Precision & Recall by Reranker Threshold</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ceSensitivityData} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="threshold" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="precision" name="Precision" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
                        <Area type="monotone" dataKey="recall" name="Recall" stroke="hsl(var(--severity-critical))" fill="hsl(var(--severity-critical))" fillOpacity={0.05} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 4: B-10, B-11, B-12 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* B-10: OS Flavor Coverage Treemap */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-10 · OS Flavor Coverage Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">SOP Compatibility Coverage</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <Treemap
                        data={treemapData}
                        dataKey="size"
                        stroke="#fff"
                        fill="hsl(var(--primary))"
                      >
                        <Tooltip content={<CustomChartTooltip />} />
                      </Treemap>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* B-11: Remedy Confidence Trend */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-11 · Remedy Confidence Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Average confidence over 5 weeks</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={remedyConfidenceTrend} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="Network" stroke="#3B82F6" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="Compute" stroke="#10B981" strokeWidth={2} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="Storage" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* B-12: Auto vs Manual Ratio */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-12 · Auto vs Manual Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">AI Execution Dispatches</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={autoManualRatio}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {autoManualRatio.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 5: B-13, B-14, B-15 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* B-13: Doc Links Coverage */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-13 · Remedy Doc Links Coverage
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Linked reference articles distribution</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={docLinksCoverage}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {docLinksCoverage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 8, fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* B-14: Estimated Time Saved */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-14 · Estimated Time Saved
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Cumulative Operator Hours Saved</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSavedHistory} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <YAxis tick={{ fill: '#64748B', fontSize: 8 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area type="monotone" dataKey="hoursSaved" name="Hours Saved" stroke="hsl(var(--status-success))" fill="hsl(var(--status-success))" fillOpacity={0.15} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* B-15: Feedback Loop Readiness Score */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    B-15 · Feedback Loop Readiness Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Pipeline learning loop maturity</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={feedbackReadinessData}>
                        <PolarGrid strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748B', fontSize: 7, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 8 }} axisLine={false} />
                        <Radar name="Readiness" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* ========================================================
            3. SLIDE-OUT DETAIL DRAWERS (SIDEBAR)
            ======================================================== */}
        {selectedDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-end font-['Sora',sans-serif]">
            {/* Backdrop layer */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setSelectedDetails(null)}
            />

            {/* Sidebar Body */}
            <Card className="relative w-full max-w-md h-full rounded-none bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col z-10">
              <CardHeader className="py-6 border-b border-border flex flex-row items-center justify-between shrink-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-black tracking-tight text-foreground">Diagnostic Insights</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Detailed telemetry parameters and root cause vectors</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedDetails(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>

              <ScrollArea className="flex-1 p-6 overflow-y-auto">
                {selectedDetails.type === 'heat' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/20 border border-border rounded-xl">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Selected Timeline Date</span>
                      <span className="text-xl font-black text-foreground block mt-1">{selectedDetails.data.date}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Event Counts</span>
                        <span className="text-lg font-black text-foreground block mt-1">{selectedDetails.data.count}</span>
                      </div>
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Worst Severity</span>
                        <span className="text-lg font-black text-red-500 block mt-1 uppercase tracking-wider">{selectedDetails.data.severity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetails.type === 'device' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/20 border border-border rounded-xl">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block font-mono">{selectedDetails.data.ip}</span>
                      <span className="text-xl font-black text-foreground block mt-1 font-mono">{selectedDetails.data.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Sick Score</span>
                        <span className="text-lg font-black text-red-500 block mt-1">{selectedDetails.data.score}%</span>
                      </div>
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Active Incidents</span>
                        <span className="text-lg font-black text-foreground block mt-1">{selectedDetails.data.events} Events</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetails.type === 'hypothesis' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/20 border border-border rounded-xl">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">{selectedDetails.data.domain} Diagnosis</span>
                      <span className="text-xl font-black text-foreground block mt-1">{selectedDetails.data.title}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Confidence Match</span>
                        <span className="text-lg font-black text-primary block mt-1">{selectedDetails.data.conf}%</span>
                      </div>
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Severity State</span>
                        <span className="text-lg font-black text-red-500 block mt-1 uppercase tracking-wider">{selectedDetails.data.sev}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetails.type === 'logZone' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/20 border border-border rounded-xl">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block font-mono">Log Template classification</span>
                      <span className="text-sm font-black text-foreground block mt-1 font-mono">{selectedDetails.data.template}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Pipeline Zone</span>
                        <span className="text-lg font-black text-primary block mt-1 uppercase">{selectedDetails.data.zone}</span>
                      </div>
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Trigger Frequency</span>
                        <span className="text-lg font-black text-foreground block mt-1">{selectedDetails.data.count} occurrences</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDetails.type === 'networkNode' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-muted/20 border border-border rounded-xl">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Hypothesis network node</span>
                      <span className="text-xl font-black text-foreground block mt-1">{selectedDetails.data.label}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Group Category</span>
                        <span className="text-lg font-black text-primary block mt-1 uppercase">{selectedDetails.data.group}</span>
                      </div>
                      <div className="p-3 bg-muted/10 border border-border/60 rounded-xl">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block">Node Weight</span>
                        <span className="text-lg font-black text-foreground block mt-1">{selectedDetails.data.size} units</span>
                      </div>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
