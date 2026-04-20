import { useEffect, useRef, useState, useMemo } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Brain, Zap, Search, Activity } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { RCASidebar } from '@/features/rca/components/RcaSidebar';
import { mockClusters } from '@/data/mock/mockData';
import { Cluster } from '@/shared/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  ChartDataLabels
);

const P = '#7c6ff7', P2 = '#a89ff7', P3 = '#c4beff', P4 = '#dcdaff', P5 = '#ede9ff';
const RED = '#f05252', ORANGE = '#f97316', GREEN = '#22c55e', AMBER = '#f59e0b';
const T2 = '#6b7280', T3 = '#9ca3af', GRID = 'rgba(0,0,0,0.05)';

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a2e',
      padding: 8,
      titleColor: '#fff',
      bodyColor: '#9ca3af',
      cornerRadius: 6,
      borderColor: 'rgba(108,99,255,0.2)',
      borderWidth: 1
    },
    datalabels: {
      display: true,
      color: '#fff',
      font: { weight: 'bold', size: 10 },
      formatter: (value: any) => value
    }
  },
  scales: {
    x: { grid: { color: GRID }, ticks: { color: T3, font: { size: 10 } } },
    y: { grid: { color: GRID }, ticks: { color: T3, font: { size: 10 } } },
  }
} as any;

export default function AnalyticsDashboard() {
  const assetGaugeRef = useRef<HTMLCanvasElement>(null);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<'rca' | null>(null);

  // Map Root Cause Insights directly from mockClusters to display real data
  const rcaInsightsData = useMemo(() => {
    return mockClusters
      .map((cluster) => {
        const deviceName = cluster.rootEvent?.source || 'Unknown Device';
        let sev = cluster.rootEvent.severity.toLowerCase();
        if (sev === 'major') sev = 'high';
        if (sev === 'minor') sev = 'medium';

        let rawTitle = cluster.rca?.rootCause || cluster.rootEvent.message || '';
        rawTitle = rawTitle.replace(/^\[Pattern Recognized\]:\s*/i, '');
        
        const fullTitle = `${rawTitle} — ${deviceName}`;
        
        // Smartly abbreviate to a clean one-liner for the dashboard UI
        let shortTitle = rawTitle;
        if (shortTitle.includes(':')) shortTitle = shortTitle.split(':')[0].trim();
        else if (shortTitle.includes(' - ')) shortTitle = shortTitle.split(' - ')[0].trim();
        else if (shortTitle.includes(' due to ')) shortTitle = shortTitle.split(' due to ')[0].trim();

        return {
          id: cluster.id,
          sev: sev,
          title: `${shortTitle} — ${deviceName}`,
          fullTitle: fullTitle,
          conf: cluster.rca?.confidence ? Math.round(cluster.rca.confidence * 100) : 75 + ((cluster.childEvents?.length || 0) % 20),
          evidence: cluster.childEvents?.length || 0,
          services: cluster.affectedServices?.length || 0,
          originalCluster: cluster
        };
      })
      .sort((a, b) => b.services - a.services || b.conf - a.conf)
      .slice(0, 4);
  }, []);

  const handleAnalyze = (item: any) => {
    const cluster = mockClusters.find(c => c.id === item.id) || item.originalCluster;
    setSelectedCluster(cluster as any);
    setActiveSidebar('rca');
  };



  useEffect(() => {
    if (assetGaugeRef.current) {
      const canvas = assetGaugeRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const isDark = document.documentElement.classList.contains('dark');
        const bgTrack = isDark ? '#1e293b' : '#f3f4f6';
        const needleColor = isDark ? '#38bdf8' : '#1a1a2e';

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height * 0.8, r = canvas.width * 0.4;
        const arc = (start: number, end: number, color: string, lw: number) => {
          ctx.beginPath(); ctx.arc(cx, cy, r, start, end); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
        };
        // Background arc
        arc(Math.PI * 0.75, Math.PI * 2.25, bgTrack, 14);
        // Red segment (high risk)
        arc(Math.PI * 0.75, Math.PI * 1.3, RED, 14);
        // Orange segment (medium)
        arc(Math.PI * 1.3, Math.PI * 1.75, ORANGE, 14);
        // Green segment (low)
        arc(Math.PI * 1.75, Math.PI * 2.25, GREEN, 14);
        // Needle
        const pct = 240 / 300;
        const angle = Math.PI * 0.75 + pct * (Math.PI * 1.5);
        const nx = cx + Math.cos(angle) * (r * 0.7), ny = cy + Math.sin(angle) * (r * 0.7);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.strokeStyle = needleColor; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fillStyle = needleColor; ctx.fill();
      }
    }
  }, []);

  return (
    <MainLayout>
      <style>{`
        .dashboard-container { background: transparent; min-height: 100%; border-radius: 12px; margin-top: -10px; }
        .page { padding: 24px; font-family: 'Inter', sans-serif; color: hsl(var(--foreground)); }
        .page-title { font-size: 26px; font-weight: 700; color: hsl(var(--foreground)); margin-bottom: 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 16px; margin-bottom: 16px; }
        .grid-2-1-wide { display: grid; grid-template-columns: 1.5fr 1fr 1.5fr; gap: 16px; margin-bottom: 16px; }
        .grid-3b { display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 16px; }
        .grid-2-1 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .card { background: hsl(var(--card)); color: hsl(var(--card-foreground)); border-radius: 14px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); position: relative; border: 1px solid hsl(var(--border) / 0.5); }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .card-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: hsl(var(--card-foreground)); }
        .analyze-btn { font-size: 11px; font-weight: 500; color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); background: hsl(var(--card)); padding: 4px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .analyze-btn:hover { background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); border-color: hsl(var(--primary) / 0.3); }
        .badge { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 600; }
        .badge-up { background: #fee2e2; color: #dc2626; }
        .badge-down { background: #dcfce7; color: #16a34a; }
        .dark .badge-up { background: #991b1b40; color: #f87171; }
        .dark .badge-down { background: #065f4640; color: #34d399; }
        .kpi-block { display: flex; flex-direction: column; }
        .kpi-label { font-size: 10px; font-weight: 600; letter-spacing: 0.05em; color: hsl(var(--muted-foreground)); margin-bottom: 4px; }
        .kpi-row { display: flex; align-items: baseline; gap: 8px; }
        .kpi-value { font-size: 28px; font-weight: 700; color: hsl(var(--foreground)); line-height: 1; }
        .legend { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
        .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: hsl(var(--muted-foreground)); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cap-legend { display: flex; gap: 16px; align-items: center; }
        .cap-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: hsl(var(--muted-foreground)); }
        .cap-dot { width: 8px; height: 8px; border-radius: 50%; }
        .anomaly-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid hsl(var(--border) / 0.5); }
        .anomaly-name { font-size: 12px; font-weight: 500; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 6px; }
        .anomaly-dot { width: 7px; height: 7px; border-radius: 50%; }
        .anomaly-time { font-size: 11px; color: hsl(var(--muted-foreground)); }
        .pred-row { padding: 8px 0; border-bottom: 1px solid hsl(var(--border) / 0.5); }
        .pred-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .pred-name { font-size: 12px; font-weight: 500; color: hsl(var(--card-foreground)); }
        .pred-track { height: 6px; background: hsl(var(--muted)); border-radius: 3px; overflow: hidden; margin-bottom: 3px; }
        .pred-fill { height: 100%; border-radius: 3px; }
        .pred-meta { font-size: 10px; color: hsl(var(--muted-foreground)); display: flex; justify-content: space-between; }
        .asset-row { padding: 8px 12px; border-radius: 8px; margin-bottom: 8px; border: 1px solid hsl(var(--border) / 0.5); display: flex; align-items: center; justify-content: space-between; }
        .asset-name { font-size: 12px; font-weight: 600; color: hsl(var(--card-foreground)); }
        .asset-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 3px; }
        .asset-tag { font-size: 10px; padding: 2px 7px; border-radius: 4px; background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }
        .action-row { padding: 10px 12px; background: hsl(var(--muted) / 0.3); border: 1px solid hsl(var(--border) / 0.5); border-radius: 8px; margin-bottom: 8px; }
        .action-title { font-size: 12px; font-weight: 600; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 7px; margin-bottom: 4px; }
        .action-body { font-size: 11px; color: hsl(var(--muted-foreground)); line-height: 1.5; }
        .action-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
        .conf-badge { font-size: 10px; background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); padding: 2px 8px; border-radius: 5px; font-weight: 600; }
        .exec-btn { font-size: 10px; font-weight: 600; color: hsl(var(--primary)); background: hsl(var(--primary) / 0.1); border: none; padding: 3px 10px; border-radius: 5px; cursor: pointer; }
      `}</style>

      <div className="dashboard-container">
        <div className="page">
          <div className="page-title">Dashboard</div>

          <div className="grid-2-1 mb-4">
            <div className="card flex flex-col min-w-0">
              <div className="card-header shrink-0">
                <div className="card-title">Root Cause Insights</div>
              </div>

              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {rcaInsightsData.map((item, i) => (
                  <div key={item.id} className="bg-[#1e293b]/40 border border-[#334155]/50 rounded-xl p-3 transition-all hover:border-[#38bdf8]/30 group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.sev === 'critical' ? 'bg-red-500/10 text-red-500' : item.sev === 'high' ? 'bg-orange-500/10 text-orange-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{item.sev}</span>
                        <span className="text-white font-bold text-[14px] leading-tight truncate" title={item.fullTitle}>{item.title}</span>
                      </div>
                      <button 
                        onClick={() => handleAnalyze(item)}
                        className="flex items-center gap-2 text-[#38bdf8] text-[12px] font-bold opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <Brain className="h-4 w-4" />
                        Analyze
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-[#94a3b8] text-[11px] font-medium ml-1">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3 text-[#38bdf8]" />
                        {item.conf}% confidence
                      </div>
                      <div className="flex items-center gap-1.5 underline decoration-[#38bdf8]/20">{item.evidence} evidence</div>
                      <div className="flex items-center gap-1.5">{item.services} services</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card flex flex-col min-w-0">
              <div className="card-header shrink-0"><div className="card-title">SLA Breach Risk</div><button className="analyze-btn">Analyze & fix</button></div>
              <div className="flex gap-6 mb-3 shrink-0">
                <div className="kpi-block">
                  <div className="kpi-label">Overall Risk</div>
                  <div className="kpi-row"><span className="kpi-value text-lg">15%</span><span className="badge badge-up">+5%</span></div>
                </div>
              </div>
              <div className="flex-1 w-full relative min-h-[140px] max-h-[180px]">
                <Bar
                  data={{
                    labels: ['WiFi', 'Video', 'WAN', 'Internet', 'Voice'],
                    datasets: [{ data: [18, 14, 12, 9, 7], backgroundColor: P, borderRadius: 4 }]
                  }}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      datalabels: { ...baseOptions.plugins.datalabels, anchor: 'end', align: 'top', color: (ctx: any) => document.documentElement.classList.contains('dark') ? '#fff' : '#1a1a2e' }
                    },
                    scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, max: 25 } }
                  } as any}
                />
              </div>
            </div>
          </div>

          <div className="grid-2-1 mb-4">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Capacity Risk</div>
                <div className="flex items-center gap-3">
                  <div className="cap-legend">
                    <div className="cap-legend-item"><div className="cap-dot" style={{ background: P }}></div>Planned Capacity</div>
                    <div className="cap-legend-item"><div className="cap-dot" style={{ background: '#d1d5db' }}></div>In Use</div>
                  </div>
                  <button className="analyze-btn">Analyze & fix</button>
                </div>
              </div>
              <div style={{ height: '180px' }}>
                <Bar
                  data={{
                    labels: ['Voice', 'Video', 'WAN', 'WiFi', 'Internet'],
                    datasets: [
                      { label: 'Planned', data: [100, 100, 100, 100, 100], backgroundColor: '#d1d5db', borderRadius: 4 },
                      { label: 'In Use', data: [38, 42, 98, 35, 28], backgroundColor: P, borderRadius: 4 },
                    ]
                  }}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      datalabels: {
                        display: (ctx: any) => ctx.datasetIndex === 1,
                        anchor: 'end', align: 'top',
                        color: (ctx: any) => document.documentElement.classList.contains('dark') ? '#fff' : '#1a1a2e'
                      }
                    },
                    scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, max: 120 } }
                  } as any}
                />
              </div>
            </div>

            <div className="card flex flex-col">
              <div className="card-header"><div className="card-title">Asset Risk</div><button className="analyze-btn">Analyze & fix</button></div>
              <div className="flex-1 flex items-center justify-center gap-12">
                <div className="relative shrink-0">
                  <canvas ref={assetGaugeRef} width={220} height={130}></canvas>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-2xl font-bold text-foreground">240</div>
                </div>
                <div className="legend flex-col gap-2.5">
                  <div className="legend-item"><div className="legend-dot" style={{ background: RED }}></div>Asset 1</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: ORANGE }}></div>Asset 2</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2-1 mb-4">
            <div className="card flex flex-col">
              <div className="card-header">
                <div className="card-title">Service Health</div>
                <button className="analyze-btn">Analyze & fix</button>
              </div>
              <div className="flex-1 flex items-center justify-center gap-10">
                <div style={{ height: '140px', width: '140px', flexShrink: 0 }}>
                  <Doughnut
                    data={{
                      labels: ['Voice', 'Video', 'WAN', 'WiFi', 'Internet'],
                      datasets: [{ data: [30, 25, 20, 15, 10], backgroundColor: [P, P2, P3, P4, P5], borderWidth: 0 }]
                    }}
                    options={{
                      cutout: '65%',
                      plugins: {
                        legend: { display: false },
                        datalabels: {
                          color: '#fff',
                          formatter: (val: any) => val + '%',
                          font: { size: 9, weight: 'bold' }
                        }
                      }
                    } as any}
                  />
                </div>
                <div className="legend flex-col gap-1.5">
                  <div className="legend-item"><div className="legend-dot" style={{ background: P }}></div>Voice</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: P2 }}></div>Video</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: P3 }}></div>WAN</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: P4 }}></div>WiFi</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: P5 }}></div>Internet</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Config Change Risks</div><button className="analyze-btn">Analyze & fix</button></div>
              <div className="flex gap-6 mb-4">
                <div className="kpi-block">
                  <div className="kpi-label">High-Risk Changes</div>
                  <div className="kpi-row"><span className="kpi-value text-lg">3</span><span className="badge badge-up">+5%</span></div>
                </div>
                <div className="kpi-block">
                  <div className="kpi-label">Avg Proximity (mins)</div>
                  <div className="kpi-row"><span className="kpi-value text-lg">7265</span><span className="badge badge-down">-3%</span></div>
                </div>
              </div>
              <div style={{ height: '120px' }}>
                <Bar
                  data={{
                    labels: ['Dist2', 'Firewall', 'R4', 'DB1', 'AppSrv1', 'Core2', 'R1', 'AccessSW2', 'R2'],
                    datasets: [{ data: [19200, 17800, 14200, 11400, 9600, 7800, 3200, 2100, 1800], backgroundColor: P, borderRadius: 4 }]
                  }}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      datalabels: {
                        anchor: 'end', align: 'top',
                        formatter: (v: any) => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v,
                        color: (ctx: any) => document.documentElement.classList.contains('dark') ? '#fff' : '#1a1a2e'
                      }
                    },
                    scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: (v: any) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v } } }
                  } as any}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 text-[13px] font-bold text-[#1a1a2e] mb-3 tracking-tight">Intelligence & Prediction</div>
          <div className="grid-2-1 mb-4">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Active Anomalies</div>
                <span className="bg-[#fee2e2] text-[#dc2626] text-[11px] px-2 py-1 rounded-full font-bold">4 detected</span>
              </div>
              <div className="anomaly-row">
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: RED }}></div>Unusual traffic spike on CR-01</div><div className="text-[11px] text-[#9ca3af] mt-0.5 ml-3">Outbound 340% above baseline · Flow Analytics</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge badge-up">Critical</span><span className="anomaly-time">14:12 UTC</span></div>
              </div>
              <div className="anomaly-row">
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: ORANGE }}></div>DNS query rate anomaly</div><div className="text-[11px] text-[#9ca3af] mt-0.5 ml-3">Primary ↓78%, Secondary ↑5× · DNS Monitor</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge bg-[#fff3cd] text-[#92400e]">High</span><span className="anomaly-time">14:18 UTC</span></div>
              </div>
              <div className="anomaly-row">
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: P }}></div>Authentication latency deviation</div><div className="text-[11px] text-[#9ca3af] mt-0.5 ml-3">Response 3.2× std dev above mean · APM</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge bg-[#e0e7ff] text-[#4338ca]">Medium</span><span className="anomaly-time">14:05 UTC</span></div>
              </div>
              <div className="anomaly-row" style={{ border: 'none' }}>
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: ORANGE }}></div>BGP route flapping detected</div><div className="text-[11px] text-[#9ca3af] mt-0.5 ml-3">CR-01 ↔ PE-02 · 12 changes in 30 min</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge bg-[#fff3cd] text-[#92400e]">High</span><span className="anomaly-time">13:50 UTC</span></div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Predicted Issues</div>
              </div>
              <div className="pred-row">
                <div className="pred-header"><span className="pred-name">WAN link saturation (100%)</span><span className="badge badge-up">Critical</span></div>
                <div className="pred-track"><div className="pred-fill" style={{ width: '92%', background: 'linear-gradient(90deg,#f05252,#f97316)' }}></div></div>
                <div className="pred-meta"><span>92% confidence</span><span>Next 30 min</span></div>
              </div>
              <div className="pred-row">
                <div className="pred-header"><span className="pred-name">DNS secondary cache exhaustion</span><span className="badge bg-[#fff3cd] text-[#92400e]">High</span></div>
                <div className="pred-track"><div className="pred-fill" style={{ width: '78%', background: 'linear-gradient(90deg,#f59e0b,#6c63ff)' }}></div></div>
                <div className="pred-meta"><span>78% confidence</span><span>Next 2 hours</span></div>
              </div>
              <div className="pred-row" style={{ border: 'none' }}>
                <div className="pred-header"><span className="pred-name">VoIP complete service failure</span><span className="badge badge-up">Critical</span></div>
                <div className="pred-track"><div className="pred-fill" style={{ width: '71%', background: 'linear-gradient(90deg,#f05252,#a78bfa)' }}></div></div>
                <div className="pred-meta"><span>71% confidence</span><span>Next 45 min</span></div>
              </div>
            </div>
          </div>

          <div className="grid-2-1 mb-4">
            <div className="card">
              <div className="card-header"><div className="card-title">Service Impact</div><button className="analyze-btn">Analyze & fix</button></div>
              <div className="anomaly-row">
                <div><div className="font-bold text-sm">VoIP Platform</div><div className="text-[11px] text-[#9ca3af] mt-0.5">Complete Outage · 3 regions, 34 nodes</div></div>
                <span className="badge badge-up">critical</span>
              </div>
              <div className="anomaly-row">
                <div><div className="font-bold text-sm">Web Portal</div><div className="text-[11px] text-[#9ca3af] mt-0.5">Performance Degradation · 2 regions, 12 nodes</div></div>
                <span className="badge bg-[#fff3cd] text-[#92400e]">high</span>
              </div>
              <div className="anomaly-row" style={{ border: 'none' }}>
                <div><div className="font-bold text-sm">Cloud Backup</div><div className="text-[11px] text-[#9ca3af] mt-0.5">Throughput Loss · 1 region, 8 nodes</div></div>
                <span className="badge bg-[#e0e7ff] text-[#4338ca]">medium</span>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Asset Health Alerts</div></div>
              <div className="asset-row">
                <div><div className="asset-name">Core Router CR-01</div><div className="asset-tags"><span className="asset-tag">High utilization</span><span className="asset-tag">EOL firmware</span></div></div>
                <div className="text-right"><span className="badge badge-up">Critical</span><div className="text-[11px] text-[#9ca3af] mt-1">14 signals</div></div>
              </div>
              <div className="asset-row">
                <div><div className="asset-name">Firewall FW-03</div><div className="asset-tags"><span className="asset-tag">Config drift</span><span className="asset-tag">Missed patches</span></div></div>
                <div className="text-right"><span className="badge bg-[#fff3cd] text-[#92400e]">High</span><div className="text-[11px] text-[#9ca3af] mt-1">8 signals</div></div>
              </div>
              <div className="asset-row" style={{ marginBottom: 0 }}>
                <div><div className="asset-name">DNS Primary</div><div className="asset-tags"><span className="asset-tag">Service failure</span></div></div>
                <div className="text-right"><span className="badge bg-[#fff3cd] text-[#92400e]">High</span><div className="text-[11px] text-[#9ca3af] mt-1">11 signals</div></div>
              </div>
            </div>
          </div>

          <div className="grid-2-1 mb-8">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recommended Actions</div>
              </div>
              <div style={{ height: '300px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                <div className="action-row">
                  <div className="action-title"><span className="bg-[#dcfce7] text-[#16a34a] text-[9px] px-1 rounded">Auto</span>Reroute WAN traffic via backup link</div>
                  <div className="action-body">Activate standby WAN link BK-02 and redistribute traffic. Expected to reduce primary link utilization to 45%.</div>
                  <div className="action-footer"><span className="text-[9px] text-[#9ca3af]">Resolved similar congestion 3× in past 6 months</span><div className="flex items-center gap-2"><span className="conf-badge">91% conf.</span><button className="exec-btn">Execute</button></div></div>
                </div>
                <div className="action-row">
                  <div className="action-title"><span className="bg-[#dcfce7] text-[#16a34a] text-[9px] px-1 rounded">Auto</span>Restart DNS Primary service</div>
                  <div className="action-body">DNS service process is unresponsive. Restart with config validation will restore resolution. (CVE-2024-1234)</div>
                  <div className="action-footer"><span className="text-[9px] text-[#9ca3af]">Memory leak pattern detected</span><div className="flex items-center gap-2"><span className="conf-badge">85% conf.</span><button className="exec-btn">Execute</button></div></div>
                </div>
                <div className="action-row">
                  <div className="action-title"><span className="bg-[#fff3cd] text-[#92400e] text-[9px] px-1 rounded">Investigate</span>Audit FW-03 config changes</div>
                  <div className="action-body">Review ACL modifications at 13:45 UTC. Compare against golden baseline and validate change authorization.</div>
                  <div className="action-footer"><span className="text-[9px] text-[#9ca3af]">No change ticket found for this window</span><div className="flex items-center gap-2"><span className="conf-badge">72% conf.</span><button className="exec-btn bg-[#e8e6ff]">Investigate</button></div></div>
                </div>
                <div className="action-row" style={{ marginBottom: 0 }}>
                  <div className="action-title"><span className="bg-[#dcfce7] text-[#16a34a] text-[9px] px-1 rounded">Auto</span>Deploy auto-failover for DNS</div>
                  <div className="action-body">Configure health-check-based automatic failover DNS-Primary → DNS-Secondary with &lt;30s switchover.</div>
                  <div className="action-footer"><span className="text-[9px] text-[#9ca3af]">DNS SPOF identified across 5 incidents</span><div className="flex items-center gap-2"><span className="conf-badge">94% conf.</span><button className="exec-btn">Execute</button></div></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">24h Utilization Trend</div><button className="analyze-btn">Analyze & fix</button></div>
              <div style={{ height: '270px' }}>
                <Line
                  data={{
                    labels: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14'],
                    datasets: [
                      { label: 'WAN CR-01', data: [55, 52, 49, 47, 51, 58, 67, 74, 82, 88, 91, 93, 95, 96, 98], borderColor: RED, backgroundColor: 'rgba(240, 82, 82, 0.07)', tension: 0.4, fill: true },
                      { label: 'CPU DNS', data: [44, 42, 40, 39, 43, 52, 62, 71, 78, 82, 85, 86, 87, 88, 89], borderColor: ORANGE, backgroundColor: 'rgba(249, 115, 22, 0.05)', tension: 0.4, fill: true },
                      { label: 'Memory', data: [60, 61, 62, 63, 64, 66, 68, 70, 71, 72, 73, 73, 74, 74, 74], borderColor: P, backgroundColor: 'rgba(108, 99, 255, 0.05)', tension: 0.4, fill: true },
                    ]
                  }}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                      datalabels: {
                        display: (ctx: any) => ctx.dataIndex === ctx.dataset.data.length - 1,
                        anchor: 'end',
                        align: 'top',
                        color: (ctx: any) => ctx.dataset.borderColor,
                        font: { size: 11, weight: 'bold' },
                        formatter: (val: any) => val + '%'
                      }
                    }
                  } as any}
                />
              </div>
            </div>
          </div>

          <div className="grid-2-1 mb-4">
            <div className="card">
              <div className="card-header"><div className="card-title">MTTR / MTTD Trend</div></div>
              <div style={{ height: '180px' }}>
                <Line
                  data={{
                    labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                    datasets: [
                      { label: 'MTTR (min)', data: [92, 85, 78, 72, 68, 63], borderColor: RED, backgroundColor: 'rgba(240, 82, 82, 0.07)', tension: 0.4, fill: true },
                      { label: 'MTTD (min)', data: [28, 25, 22, 19, 17, 15], borderColor: AMBER, backgroundColor: 'rgba(245, 158, 11, 0.05)', tension: 0.4, fill: true },
                    ]
                  }}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                      datalabels: {
                        display: (ctx: any) => ctx.dataIndex === ctx.dataset.data.length - 1,
                        anchor: 'end',
                        align: 'top',
                        color: (ctx: any) => ctx.dataset.borderColor,
                        font: { size: 11, weight: 'bold' }
                      }
                    }
                  } as any}
                />
              </div>
            </div>
            <div className="card">
              <div className="card-header"><div className="card-title">Change vs Incident Correlation</div></div>
              <div style={{ height: '180px' }}>
                <Line
                  data={{
                    labels: ['D-13', 'D-7', 'Today'],
                    datasets: [
                      { label: 'Changes', data: [1, 4, 3], borderColor: P, tension: 0.3 },
                      { label: 'Incidents', data: [0, 3, 2], borderColor: RED, tension: 0.3 },
                    ]
                  }}
                  options={{
                    ...baseOptions,
                    plugins: {
                      ...baseOptions.plugins,
                      legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                      datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        color: (ctx: any) => ctx.dataset.borderColor,
                        font: { size: 11, weight: 'bold' }
                      }
                    }
                  } as any}
                />
              </div>
            </div>
          </div>

          <div className="card mb-8">
            <div className="card-header flex justify-between items-center bg-card">
              <div className="card-title">Alert Volume Heatmap</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: RED }}></div>
                  <span className="text-[10px] text-muted-foreground">Critical (&gt;100)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: P }}></div>
                  <span className="text-[10px] text-muted-foreground">High (50-100)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: P2 }}></div>
                  <span className="text-[10px] text-muted-foreground">Medium (10-50)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}></div>
                  <span className="text-[10px] text-muted-foreground">Low (&lt;10)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 p-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                <div key={day} className="flex items-center gap-2">
                  <span className="text-[9px] text-[#9ca3af] w-6 font-bold">{day}</span>
                  <div className="flex flex-1 gap-1">
                    {Array.from({ length: 24 }).map((_, j) => {
                      const baseVal = Math.sin(j * 0.5);
                      const randVal = Math.random() * 2;
                      const combined = baseVal + randVal;
                      const count = Math.floor(combined * 50) + 10;

                      const color = count > 80 ? RED : count > 50 ? P : count > 20 ? P2 : '#f3f4f6';
                      const textColor = (count > 20) ? '#fff' : '#64748b';

                      return (
                        <div
                          key={j}
                          className="flex-1 h-5 rounded-[2px] flex items-center justify-center group relative transition-all hover:scale-110 hover:z-10 cursor-pointer"
                          style={{ background: color, opacity: 0.9 }}
                          title={`${day} ${j}:00 - ${count} alerts`}
                        >
                          <span className="text-[7px] font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: textColor }}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-[#9ca3af] pl-10 pr-2 pb-2"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span></div>
          </div>

        </div>
      </div>
      {activeSidebar && selectedCluster && (
        <>
          <div
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
            onClick={() => { setActiveSidebar(null); setSelectedCluster(null); }}
          />

          {activeSidebar === 'rca' && (
            <RCASidebar
              onClose={() => { setActiveSidebar(null); setSelectedCluster(null); }}
              cluster={selectedCluster as any}
            />
          )}


        </>
      )}
    </MainLayout>
  );
}
