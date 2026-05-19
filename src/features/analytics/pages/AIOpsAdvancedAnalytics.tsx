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
  PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Sankey
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
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
          <TabsContent value="rca" className="mt-0 space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* W-R1: Circular Packed Hypotheses Treemap */}
              <Card className="lg:col-span-2 bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R1 · Circular Packed Hypotheses Treemap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 relative overflow-visible h-[330px]">
                  {/* Packed bubbles representing different competing diagnoses */}
                  <div className="absolute inset-0 bg-background/20 rounded-xl overflow-hidden pointer-events-none z-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  </div>
                  
                  <div className="absolute inset-0 w-full h-full z-10">
                    {hypothesesBubbles.map((bubble) => (
                      <div
                        key={bubble.id}
                        onClick={() => setSelectedDetails({ type: 'hypothesis', data: bubble })}
                        className={`absolute rounded-full border flex flex-col justify-center items-center text-center shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-md group hover:scale-[1.05] hover:z-50 ${bubble.border}`}
                        style={{
                          width: bubble.r * 2,
                          height: bubble.r * 2,
                          top: `${bubble.cy}%`,
                          left: `${bubble.cx}%`,
                          transform: 'translate(-50%, -50%)',
                          background: bubble.gradient,
                          boxShadow: `inset 0 0 20px ${bubble.color}33, 0 10px 40px rgba(0,0,0,0.15)`
                        }}
                      >
                        <span className="text-[10px] font-black text-foreground block tracking-tight px-2 leading-tight">{bubble.title}</span>
                        <div className="mt-1 text-[8px] font-black px-2 py-0.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                          {bubble.conf}% MATCH
                        </div>

                        {/* Interactive tooltip popping out from corner of the bubble */}
                        <div className="absolute top-[5%] left-[80%] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-75 group-hover:scale-100 z-[100] origin-top-left">
                          <div className="bg-popover/95 text-popover-foreground rounded-xl shadow-2xl p-4 border border-border/50 w-[220px] text-left backdrop-blur-xl">
                            <div className="text-[11px] font-black mb-3 pb-2 border-b border-border/50 leading-snug whitespace-normal">
                              {bubble.title}
                            </div>
                            <div className="flex justify-between items-center text-[10px] mb-2 font-bold">
                              <span className="text-muted-foreground">Domain Category</span>
                              <span className="text-foreground">{bubble.domain}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] mb-2 font-bold">
                              <span className="text-muted-foreground">Services Impacted</span>
                              <span className="text-primary">{bubble.services} Services</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-muted-foreground">Evidence Log Entries</span>
                              <span className="text-foreground">{bubble.evidence} Items</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* W-R3: Radar Coverage Diagram */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R3 · RCA Domain Coverage Radar
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">RCA Rule coverage vs Event frequency</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={domainCoverage}>
                        <PolarGrid strokeOpacity={0.1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 8, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 8 }} axisLine={false} />
                        <Radar name="RCA Rules Coverage" dataKey="coverage" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                        <Radar name="Active Event Frequency" dataKey="frequency" stroke="hsl(var(--severity-critical))" fill="hsl(var(--severity-critical))" fillOpacity={0.1} />
                        <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* W-R2: Pattern Confidence Timeline */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R2 · Pattern Confidence Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Neural confidence scoring of patterns</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { period: 'T-5', confA: 82, confB: 65, confC: 40 },
                        { period: 'T-4', confA: 88, confB: 72, confC: 58 },
                        { period: 'T-3', confA: 92, confB: 76, confC: 70 },
                        { period: 'T-2', confA: 91, confB: 84, confC: 82 },
                        { period: 'T-1', confA: 95, confB: 89, confC: 85 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} />
                        <XAxis dataKey="period" tick={{ fill: '#64748B', fontSize: 9, fontWeight: 'bold' }} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 9 }} axisLine={false} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Line type="monotone" dataKey="confA" stroke="hsl(var(--severity-critical))" strokeWidth={2.5} name="Link Flapping" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="confB" stroke="hsl(var(--severity-high))" strokeWidth={2} name="CPU Exhaustion" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="confC" stroke="hsl(var(--severity-medium))" strokeWidth={2} name="DB Pool Leak" dot={{ r: 3 }} />
                        <Legend wrapperStyle={{ fontSize: 9, fontWeight: 'bold' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* W-R4: Hypothesis Weight Waterfall */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R4 · Hypothesis Weight Waterfall
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Incident Hypothesis weight distribution</div>
                  <div className="flex-1 w-full h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: 'Fibre Cut', weight: 45, color: 'hsl(var(--severity-critical))' },
                          { name: 'SFP Transceiver Fail', weight: 28, color: 'hsl(var(--severity-high))' },
                          { name: 'Intermittent Jitter', weight: 15, color: 'hsl(var(--severity-medium))' },
                          { name: 'MTU Configuration Drift', weight: 12, color: 'hsl(var(--primary))' }
                        ]}
                      >
                        <XAxis type="number" domain={[0, 50]} hide />
                        <YAxis dataKey="name" type="category" fontSize={9} width={90} tick={{ fill: '#64748B', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="weight" radius={[0, 4, 4, 0]} barSize={18}>
                          {[
                            'hsl(var(--severity-critical))',
                            'hsl(var(--severity-high))',
                            'hsl(var(--severity-medium))',
                            'hsl(var(--primary))'
                          ].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* W-R5: Pattern Occurrence Heatmap */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R5 · Pattern Occurrence Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px] relative">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Weekly pattern match frequencies</div>
                  <div className="relative flex-1 flex flex-col">
                    <div className="grid grid-cols-7 gap-2 flex-1">
                      {Array.from({ length: 28 }).map((_, idx) => {
                        const count = Math.floor(Math.sin(idx * 0.4) * 8 + Math.cos(idx * 0.2) * 5 + 10);
                        const color =
                          count > 15 ? 'bg-red-500/40 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.15)] hover:bg-red-500/60' :
                          count > 10 ? 'bg-orange-500/30 border-orange-500/40 hover:bg-orange-500/50' :
                          count > 5 ? 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/40' :
                          'bg-teal-500/10 border-teal-500/20 hover:bg-teal-500/30';
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredPatternCell({ day: idx + 1, count })}
                            onMouseLeave={() => setHoveredPatternCell(null)}
                            className={`rounded-lg border flex items-center justify-center text-[9px] font-black font-mono transition-all cursor-pointer ${color}`}
                          >
                            {count}
                          </div>
                        );
                      })}
                    </div>

                    {/* Interactive Pattern Tooltip overlay */}
                    {hoveredPatternCell && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover/95 border border-border/80 px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-xl text-center font-['Sora',sans-serif] z-50 min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest block leading-none">Telemetry Pattern Feed</span>
                        <div className="flex items-center gap-2 mt-1.5 justify-center">
                          <span className="text-xs font-black text-foreground">Day {hoveredPatternCell.day}</span>
                          <span className="text-muted-foreground font-medium text-[10px]">•</span>
                          <span className="text-xs font-black text-primary">{hoveredPatternCell.count} Matches</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* W-R6: RAG Retrieval Performance Gauge */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R6 · RAG Retrieval Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-around h-[330px]">
                  <div className="flex justify-around w-full gap-4">
                    <ConcentricGauge value={94} label="Top-K Precision" subLabel="Semantic Search" color="hsl(var(--primary))" />
                    <ConcentricGauge value={87} label="KB Match Rate" subLabel="Prior Verdicts" color="hsl(var(--status-success))" />
                  </div>
                  <div className="w-full bg-muted/10 border border-border/30 rounded-xl p-3 text-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Average Retrieval Latency</span>
                    <span className="text-xl font-black text-foreground block font-mono">142ms</span>
                  </div>
                </CardContent>
              </Card>

              {/* W-R7: Cascading Failure Graph (Topology) */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R7 · Cascading Failure Graph
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col justify-between h-[330px]">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Temporal Parent-Child Failures</div>
                  <div className="flex-1 flex flex-col justify-between relative py-2">
                    <div className="flex justify-center">
                      <div className="bg-red-500/25 border border-red-500/40 p-2.5 rounded-xl text-center w-40 shadow-lg">
                        <span className="text-[9px] font-black block tracking-widest uppercase text-red-500">Root Node</span>
                        <span className="text-[10px] font-bold block text-foreground font-mono">dist-sw-05.dc1</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-around items-center relative">
                      <div className="absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-border/50 -translate-y-1/2 z-0" />
                      
                      <div className="bg-orange-500/20 border border-orange-500/30 p-2.5 rounded-xl text-center w-28 shadow z-10">
                        <span className="text-[8px] font-black block tracking-widest uppercase text-orange-500">Child Node</span>
                        <span className="text-[9px] font-bold block text-foreground font-mono">core-rt-01.dc1</span>
                      </div>
                      
                      <div className="bg-orange-500/20 border border-orange-500/30 p-2.5 rounded-xl text-center w-28 shadow z-10">
                        <span className="text-[8px] font-black block tracking-widest uppercase text-orange-500">Child Node</span>
                        <span className="text-[9px] font-bold block text-foreground font-mono">app-srv-05.dc1</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* W-R8: SLA Breach Prediction Meter */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R8 · SLA Breach Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="space-y-4">
                    {slaBreachPredictions.map((sla, idx) => (
                      <div key={idx} className="space-y-2 border-b border-border/20 pb-3 last:border-b-0">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-foreground block">{sla.name}</span>
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{sla.breachTime}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${sla.color}`} style={{ width: `${sla.risk}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-foreground w-8 text-right">{sla.risk}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* W-R9: KB Version Coverage Matrix */}
              <Card className="lg:col-span-2 bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R9 · KB Version & Coverage Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto h-[330px] custom-scrollbar">
                  <div className="space-y-3">
                    {kbMatrix.map((item, idx) => (
                      <div key={idx} className="p-3 bg-muted/20 border border-border/50 rounded-xl flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-black text-foreground block">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px] font-black">{item.ver}</Badge>
                            <span className="text-[10px] font-bold text-muted-foreground">{item.rules} Rules active</span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-foreground block">{item.coverage}% Cover</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest block ${
                              item.status === 'Active' ? 'text-emerald-500' : 'text-orange-500'
                            }`}>{item.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* W-R10: Auto-Remediation Success Scorecard */}
              <Card className="bg-card/40 border-border/50 backdrop-blur-md h-[400px]">
                <CardHeader className="py-4 border-b border-border/30">
                  <CardTitle className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
                    W-R10 · Auto-Remediation Scorecard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-around h-[330px]">
                  <div className="flex justify-around w-full gap-4">
                    <ConcentricGauge value={74} label="Success Rate" subLabel="38/48 Runs" color="hsl(var(--primary))" />
                    <ConcentricGauge value={63} label="MTTR Saved" subLabel="Saved Hours" color="hsl(var(--status-success))" />
                  </div>
                  <div className="w-full bg-muted/10 border border-border/30 rounded-xl p-3.5 text-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Prevented SLA Breaches</span>
                    <span className="text-xl font-black text-emerald-500 block font-mono">18 Breaches</span>
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
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
