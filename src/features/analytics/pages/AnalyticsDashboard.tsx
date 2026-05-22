import { useEffect, useRef, useState, useMemo } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Brain, Zap, Search, Activity, FileText, Server } from 'lucide-react';
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
import { useTheme } from 'next-themes';

import { RCASidebar } from '@/features/rca/components/RcaSidebar';
import { RemediationSidebar } from '@/features/rca/components/RemediationSidebar';
import { mockClusters } from '@/data/mock/mockData';
import { Cluster } from '@/shared/types';
import { BusinessServiceHealthWidget, BusinessService } from '@/components/dashboard/BusinessServiceHealthWidget';
import { RemedyQualityAssuranceWidget } from '@/components/dashboard/RemedyQAWidget';
import { AutoRemediationFailureWidget } from '@/components/dashboard/AutoRemediationFailureWidget';
import { BusinessServiceHealthSidebar } from '@/components/dashboard/BusinessServiceHealthSidebar';

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

// Semantic Colors using HSL variables from index.css
const P = 'hsl(var(--primary))';
const P2 = 'hsl(var(--primary) / 0.8)';
const P3 = 'hsl(var(--primary) / 0.6)';
const P4 = 'hsl(var(--primary) / 0.4)';
const P5 = 'hsl(var(--primary) / 0.2)';

const RED = 'hsl(var(--severity-critical))';
const ORANGE = 'hsl(var(--severity-high))';
const AMBER = 'hsl(var(--severity-medium))';
const GREEN = 'hsl(var(--status-success))';

const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

const COLOR_PALETTE_HSL = [
  'hsl(217 91% 60%)',
  'hsl(262 83% 58%)',
  'hsl(142 72% 29%)',
  'hsl(38 92% 50%)',
  'hsl(0 84% 60%)',
  'hsl(189 94% 43%)',
  'hsl(330 81% 60%)',
  'hsl(239 84% 67%)',
];

export default function AnalyticsDashboard() {
  const { theme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const assetGaugeRef = useRef<HTMLCanvasElement>(null);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<'rca' | 'remediation' | null>(null);
  const [rcaView, setRcaView] = useState<'list' | 'graph'>('graph');
  const [hoveredRca, setHoveredRca] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<BusinessService | null>(null);

  const baseOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'hsl(var(--popover))' : '#ffffff',
        padding: 12,
        titleColor: isDark ? 'hsl(var(--popover-foreground))' : 'hsl(var(--foreground))',
        bodyColor: isDark ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))',
        cornerRadius: 8,
        borderColor: 'hsl(var(--border) / 0.5)',
        borderWidth: 1,
        titleFont: { weight: 'bold', size: 13 },
        bodyFont: { size: 12 }
      },
      datalabels: {
        display: true,
        color: 'hsl(var(--foreground))',
        font: { weight: 'bold', size: 10 },
        formatter: (value: any) => value
      }
    },
    scales: {
      x: {
        grid: { color: 'hsl(var(--border) / 0.3)' },
        ticks: { color: 'hsl(var(--muted-foreground))', font: { size: 10, weight: '600' } }
      },
      y: {
        grid: { color: 'hsl(var(--border) / 0.3)' },
        ticks: { color: 'hsl(var(--muted-foreground))', font: { size: 10, weight: '600' } }
      },
    }
  }), [isDark]);

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
        const bgTrack = isDark ? 'hsl(222 47% 15%)' : 'hsl(210 40% 96%)';
        const needleColor = isDark ? 'hsl(210 100% 50%)' : 'hsl(222 47% 11%)';

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height * 0.8, r = canvas.width * 0.4;
        const arc = (start: number, end: number, color: string, lw: number) => {
          ctx.beginPath(); ctx.arc(cx, cy, r, start, end); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
        };
        // Background arc
        arc(Math.PI * 0.75, Math.PI * 2.25, bgTrack, 14);
        // Severity segments
        arc(Math.PI * 0.75, Math.PI * 1.3, '#f05252', 14); // Critical
        arc(Math.PI * 1.3, Math.PI * 1.75, '#f97316', 14); // Warning
        arc(Math.PI * 1.75, Math.PI * 2.25, '#22c55e', 14); // Success
        // Needle
        const pct = 240 / 300;
        const angle = Math.PI * 0.75 + pct * (Math.PI * 1.5);
        const nx = cx + Math.cos(angle) * (r * 0.7), ny = cy + Math.sin(angle) * (r * 0.7);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.strokeStyle = needleColor; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx, ny); ctx.strokeStyle = needleColor; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fillStyle = needleColor; ctx.fill();
      }
    }
  }, [isDark]);

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
        .grid-3-equal { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .card { background: hsl(var(--card)); color: hsl(var(--card-foreground)); border-radius: 14px; padding: 18px 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: relative; border: 1px solid hsl(var(--border) / 0.5); }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .card-title { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; color: hsl(var(--card-foreground)); text-transform: uppercase; letter-spacing: 0.05em; }
        .analyze-btn { font-size: 11px; font-weight: 600; color: hsl(var(--primary)); border: 1px solid hsl(var(--primary) / 0.3); background: hsl(var(--primary) / 0.05); padding: 5px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .analyze-btn:hover { background: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary) / 0.5); transform: translateY(-1px); }
        .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
        .badge-up { background: hsl(var(--severity-critical) / 0.1); color: hsl(var(--severity-critical)); }
        .badge-down { background: hsl(var(--status-success) / 0.1); color: hsl(var(--status-success)); }
        .kpi-block { display: flex; flex-direction: column; }
        .kpi-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: hsl(var(--muted-foreground)); margin-bottom: 4px; text-transform: uppercase; }
        .kpi-row { display: flex; align-items: baseline; gap: 8px; }
        .kpi-value { font-size: 28px; font-weight: 800; color: hsl(var(--foreground)); line-height: 1; }
        .legend { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 10px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: hsl(var(--muted-foreground)); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cap-legend { display: flex; gap: 16px; align-items: center; }
        .cap-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: hsl(var(--muted-foreground)); }
        .cap-dot { width: 8px; height: 8px; border-radius: 2px; }
        .anomaly-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid hsl(var(--border) / 0.3); }
        .anomaly-name { font-size: 12px; font-weight: 600; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 8px; }
        .anomaly-dot { width: 6px; height: 6px; border-radius: 50%; }
        .anomaly-time { font-size: 10px; font-weight: 700; color: hsl(var(--muted-foreground)); font-family: monospace; }
        .pred-row { padding: 10px 0; border-bottom: 1px solid hsl(var(--border) / 0.3); }
        .pred-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .pred-name { font-size: 12px; font-weight: 600; color: hsl(var(--card-foreground)); }
        .pred-track { height: 6px; background: hsl(var(--muted)); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
        .pred-fill { height: 100%; border-radius: 3px; }
        .pred-meta { font-size: 10px; font-weight: 600; color: hsl(var(--muted-foreground)); display: flex; justify-content: space-between; }
        .asset-row { padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; border: 1px solid hsl(var(--border) / 0.3); display: flex; align-items: center; justify-content: space-between; background: hsl(var(--muted) / 0.1); }
        .asset-name { font-size: 12px; font-weight: 700; color: hsl(var(--card-foreground)); }
        .asset-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
        .asset-tag { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); text-transform: uppercase; }
        .action-row { padding: 12px 14px; background: hsl(var(--muted) / 0.15); border: 1px solid hsl(var(--border) / 0.4); border-radius: 12px; margin-bottom: 10px; transition: all 0.2s; }
        .action-row:hover { border-color: hsl(var(--primary) / 0.4); background: hsl(var(--primary) / 0.05); }
        .action-title { font-size: 12px; font-weight: 700; color: hsl(var(--card-foreground)); display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .action-body { font-size: 11px; color: hsl(var(--muted-foreground)); line-height: 1.6; font-weight: 500; }
        .action-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
        .conf-badge { font-size: 9px; background: hsl(var(--primary) / 0.1); color: hsl(var(--primary)); padding: 2px 10px; border-radius: 6px; font-weight: 800; text-transform: uppercase; }
        .exec-btn { font-size: 10px; font-weight: 700; color: hsl(var(--primary)); background: hsl(var(--primary) / 0.1); border: none; padding: 4px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .exec-btn:hover { background: hsl(var(--primary)); color: white; }
      `}</style>

      <div className="dashboard-container">
        <div className="page">
          <div className="page-title">Dashboard</div>

          <div className="grid-3-equal mb-4">
            <div className="card flex flex-col min-w-0">
              <div className="card-header shrink-0">
                <div className="card-title">Root Cause Insights</div>
                <div className="flex bg-muted/50 rounded-md p-0.5 border border-border/50">
                  <button 
                    onClick={() => setRcaView('list')} 
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-sm transition-all ${rcaView === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    List
                  </button>
                  <button 
                    onClick={() => setRcaView('graph')} 
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-sm transition-all ${rcaView === 'graph' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Circular Map
                  </button>
                </div>
              </div>

              {rcaView === 'list' ? (
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {rcaInsightsData.map((item, i) => (
                    <div key={item.id} className="bg-muted/30 border border-border/50 rounded-xl p-3 transition-all hover:border-primary/30 group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-foreground font-bold text-[14px] leading-tight truncate" title={item.fullTitle}>{item.title}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="relative w-8 h-8 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
                              <circle 
                                cx="18" cy="18" r="16" fill="none" 
                                className={item.conf >= 90 ? 'stroke-green-500' : item.conf >= 75 ? 'stroke-yellow-500' : 'stroke-red-500'} strokeWidth="3" 
                                strokeDasharray="100" strokeDashoffset={100 - item.conf} 
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[9px] font-bold text-foreground">{item.conf}</span>
                          </div>
                          <button
                            onClick={() => handleAnalyze(item)}
                            className="flex items-center gap-2 text-primary text-[12px] font-bold opacity-90 hover:opacity-100 transition-opacity"
                          >
                            <Brain className="h-4 w-4" />
                            Analyze
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground text-[11px] font-medium ml-1">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3" />
                          Events : <span className="text-primary hover:underline cursor-pointer font-bold">{item.evidence}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Server className="w-3 h-3" />
                          Services : <span className="text-primary hover:underline cursor-pointer font-bold">{item.services}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-[280px] relative overflow-visible custom-scrollbar bg-background rounded-b-xl z-10">
                   {/* Background layer (hidden overflow) */}
                   <div className="absolute inset-0 overflow-hidden rounded-b-xl z-0 pointer-events-none">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                   </div>
                   
                   {/* Absolute container for dynamically packed bubbles */}
                   <div className="absolute inset-0 w-full h-full z-10">
                      {(() => {
                         const bubbles: any[] = [];
                         rcaInsightsData.forEach((item, i) => {
                            const size = Math.max(80, 165 - (i * 22)); // Scales down for future items
                            
                            // Severity mapped colors (Red, Orange, Teal)
                            const getSeverityConfig = (sev: string) => {
                               const s = sev.toLowerCase();
                               if (s === 'critical') return { border: 'border-red-500/50', shadow: 'rgba(239, 68, 68, 0.3)', gradient: 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.35), rgba(239, 68, 68, 0.05))', badge: 'bg-red-500/10 text-red-500 border-red-500/20' };
                               if (s === 'high' || s === 'major') return { border: 'border-orange-500/50', shadow: 'rgba(249, 115, 22, 0.3)', gradient: 'radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.35), rgba(249, 115, 22, 0.05))', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
                               return { border: 'border-teal-500/50', shadow: 'rgba(13, 148, 136, 0.3)', gradient: 'radial-gradient(circle at 30% 30%, rgba(13, 148, 136, 0.35), rgba(13, 148, 136, 0.05))', badge: 'bg-teal-500/10 text-teal-500 border-teal-500/20' };
                            };
                            const config = getSeverityConfig(item.sev);

                            // Robust Dynamic Elliptical Circle Packing
                            let x = 0, y = 0;
                            if (i === 0) {
                               x = 0; y = 0;
                            } else {
                               let placed = false;
                               let r = (bubbles[0].size/2) + (size/2) + 5;
                               while (!placed && r < 800) {
                                  const startAngle = i * 137.5; 
                                  for (let a = 0; a < 360; a += 15) {
                                     const rad = (startAngle + a) * Math.PI / 180;
                                     const testX = r * Math.cos(rad);
                                     const testY = r * 0.65 * Math.sin(rad); // Elliptical horizontal spread
                                     
                                     let overlap = false;
                                     for (let b of bubbles) {
                                        const dist = Math.sqrt(Math.pow(testX - b.x, 2) + Math.pow(testY - b.y, 2));
                                        const minDist = (size/2) + (b.size/2) + 16; // 16px strict safe gap
                                        if (dist < minDist) { overlap = true; break; }
                                     }
                                     
                                     if (!overlap) {
                                        x = testX; y = testY;
                                        placed = true;
                                        break;
                                     }
                                  }
                                  r += 10;
                               }
                            }
                            
                            bubbles.push({ x, y, size, config, item });
                         });

                         // Center the entire cluster perfectly
                         if (bubbles.length > 0) {
                            let minX = 0, maxX = 0, minY = 0, maxY = 0;
                            bubbles.forEach(b => {
                               minX = Math.min(minX, b.x - b.size/2);
                               maxX = Math.max(maxX, b.x + b.size/2);
                               minY = Math.min(minY, b.y - b.size/2);
                               maxY = Math.max(maxY, b.y + b.size/2);
                            });
                            const offsetX = -(maxX + minX) / 2;
                            const offsetY = -(maxY + minY) / 2;
                            bubbles.forEach(b => {
                               b.x += offsetX;
                               b.y += offsetY;
                            });
                         }

                         return bubbles.map((b) => {
                           const fontSize = b.size >= 140 ? '13px' : b.size >= 110 ? '11px' : b.size >= 90 ? '10px' : '9px';
                           const clamp = b.size >= 130 ? 3 : 2;
                           
                           // Deterministic mock values based on ID so they don't blink
                           const idHash = b.item.id.charCodeAt(0) + b.item.id.charCodeAt(b.item.id.length - 1);
                           const customers = (idHash % 50) + 10;
                           const slas = (idHash % 5) + 1;

                           return (
                             <div 
                               key={b.item.id} 
                               className={`absolute rounded-full border flex flex-col justify-center items-center text-center shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-md group hover:scale-[1.03] hover:z-50 ${b.config.border}`}
                               style={{
                                  width: b.size, height: b.size,
                                  top: '50%', left: '50%',
                                  transform: `translate(calc(-50% + ${b.x}px), calc(-50% + ${b.y}px))`,
                                  background: b.config.gradient,
                                  boxShadow: `inset 0 0 20px ${b.config.shadow}, 0 10px 40px rgba(0,0,0,0.15)`
                               }}
                               onClick={() => handleAnalyze(b.item)}
                             >
                                <div className="w-full h-full flex flex-col justify-center items-center overflow-hidden rounded-full p-3 transition-opacity duration-300 group-hover:opacity-40">
                                  <h4 
                                     className="font-bold text-foreground drop-shadow-md px-1" 
                                     style={{ fontSize: fontSize, display: '-webkit-box', WebkitLineClamp: clamp, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                  >
                                     {b.item.title}
                                  </h4>
                                  {b.size > 90 && (
                                     <div className={`mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${b.config.badge}`}>
                                       {b.item.conf}% Match
                                     </div>
                                  )}
                                </div>
                                
                                {/* Fixed Corner Tooltip for Hover Details */}
                                <div className="absolute top-[5%] left-[80%] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-75 group-hover:scale-100 z-[100] origin-top-left">
                                   <div className="bg-popover/95 text-popover-foreground rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] p-4 border border-border/50 w-[220px] text-left backdrop-blur-xl">
                                      <div className="text-[12px] font-bold mb-3 pb-2 border-b border-border/50 text-left leading-snug whitespace-normal">
                                         {b.item.fullTitle}
                                      </div>
                                      <div className="flex justify-between items-center text-[11px] mb-2">
                                         <span className="text-muted-foreground font-medium">Services</span>
                                         <span className="font-bold text-primary">{b.item.services}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[11px] mb-2">
                                         <span className="text-muted-foreground font-medium">Customers</span>
                                         <span className="font-bold text-foreground">{customers}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[11px] mb-2">
                                         <span className="text-muted-foreground font-medium">SLA's Effected</span>
                                         <span className="font-bold text-red-500">{slas}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-[11px]">
                                         <span className="text-muted-foreground font-medium">Events</span>
                                         <span className="font-bold text-foreground">{b.item.evidence}</span>
                                      </div>
                                   </div>
                                </div>
                             </div>
                           );
                         });
                      })()}
                   </div>
                </div>
              )}
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
                    datasets: [{ data: [18, 14, 12, 9, 7], backgroundColor: COLOR_PALETTE, borderRadius: 4 }]
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

            {/* Business Service Health Widget */}
            <BusinessServiceHealthWidget onSelectService={(svc) => setSelectedService(svc)} />
          </div>

          <div className="grid-2-1 mb-4">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Capacity Risk</div>
                <div className="flex items-center gap-3">
                  <div className="cap-legend">
                    <div className="cap-legend-item"><div className="cap-dot" style={{ background: COLOR_PALETTE[0] }}></div>Planned Capacity</div>
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
                      { label: 'In Use', data: [38, 42, 98, 35, 28], backgroundColor: COLOR_PALETTE, borderRadius: 4 },
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
                      datasets: [{ data: [30, 25, 20, 15, 10], backgroundColor: COLOR_PALETTE, borderWidth: 0 }]
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
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLOR_PALETTE[0] }}></div>Voice</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLOR_PALETTE[1] }}></div>Video</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLOR_PALETTE[2] }}></div>WAN</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLOR_PALETTE[3] }}></div>WiFi</div>
                  <div className="legend-item"><div className="legend-dot" style={{ background: COLOR_PALETTE[4] }}></div>Internet</div>
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
                    datasets: [{ data: [19200, 17800, 14200, 11400, 9600, 7800, 3200, 2100, 1800], backgroundColor: COLOR_PALETTE, borderRadius: 4 }]
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

          <div className="mt-4 text-[13px] font-bold text-foreground mb-3 tracking-tight">Intelligence & Prediction</div>
          
          <RemedyQualityAssuranceWidget />
          <AutoRemediationFailureWidget />

          <div className="grid-2-1 mb-4">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Active Anomalies</div>
                <span className="bg-red-500/10 text-red-500 text-[11px] px-2 py-1 rounded-full font-bold">4 detected</span>
              </div>
              <div className="anomaly-row">
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: RED }}></div>Unusual traffic spike on CR-01</div><div className="text-[11px] text-muted-foreground mt-0.5 ml-3">Outbound 340% above baseline · Flow Analytics</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge bg-red-500/10 text-red-500">Critical</span><span className="anomaly-time">14:12 UTC</span></div>
              </div>
              <div className="anomaly-row">
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: ORANGE }}></div>DNS query rate anomaly</div><div className="text-[11px] text-muted-foreground mt-0.5 ml-3">Primary ↓78%, Secondary ↑5× · DNS Monitor</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge bg-orange-500/10 text-orange-500">High</span><span className="anomaly-time">14:18 UTC</span></div>
              </div>
              <div className="anomaly-row">
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: 'var(--primary)' }}></div>Authentication latency deviation</div><div className="text-[11px] text-muted-foreground mt-0.5 ml-3">Response 3.2× std dev above mean · APM</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge bg-primary/10 text-primary">Medium</span><span className="anomaly-time">14:05 UTC</span></div>
              </div>
              <div className="anomaly-row" style={{ border: 'none' }}>
                <div><div className="anomaly-name"><div className="anomaly-dot" style={{ background: ORANGE }}></div>BGP route flapping detected</div><div className="text-[11px] text-muted-foreground mt-0.5 ml-3">CR-01 ↔ PE-02 · 12 changes in 30 min</div></div>
                <div className="flex flex-col items-end gap-1"><span className="badge bg-orange-500/10 text-orange-500">High</span><span className="anomaly-time">13:50 UTC</span></div>
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
                <div className="text-right"><span className="badge bg-[hsl(var(--severity-high)/0.15)] text-[hsl(var(--severity-high))] border border-[hsl(var(--severity-high)/0.2)]">High</span><div className="text-[11px] text-muted-foreground mt-1">8 signals</div></div>
              </div>
              <div className="asset-row" style={{ marginBottom: 0 }}>
                <div><div className="asset-name">DNS Primary</div><div className="asset-tags"><span className="asset-tag">Service failure</span></div></div>
                <div className="text-right"><span className="badge bg-[hsl(var(--severity-high)/0.15)] text-[hsl(var(--severity-high))] border border-[hsl(var(--severity-high)/0.2)]">High</span><div className="text-[11px] text-muted-foreground mt-1">11 signals</div></div>
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
                  <div className="action-title"><span className="bg-[hsl(var(--status-success)/0.2)] text-[hsl(var(--status-success))] text-[9px] px-1 rounded border border-[hsl(var(--status-success)/0.3)]">Auto</span>Reroute WAN traffic via backup link</div>
                  <div className="action-body">Activate standby WAN link BK-02 and redistribute traffic. Expected to reduce primary link utilization to 45%.</div>
                  <div className="action-footer"><span className="text-[9px] text-muted-foreground">Resolved similar congestion 3× in past 6 months</span><div className="flex items-center gap-2"><span className="conf-badge">91% conf.</span><button className="exec-btn">Execute</button></div></div>
                </div>
                <div className="action-row">
                  <div className="action-title"><span className="bg-[hsl(var(--status-success)/0.2)] text-[hsl(var(--status-success))] text-[9px] px-1 rounded border border-[hsl(var(--status-success)/0.3)]">Auto</span>Restart DNS Primary service</div>
                  <div className="action-body">DNS service process is unresponsive. Restart with config validation will restore resolution. (CVE-2024-1234)</div>
                  <div className="action-footer"><span className="text-[9px] text-muted-foreground">Memory leak pattern detected</span><div className="flex items-center gap-2"><span className="conf-badge">85% conf.</span><button className="exec-btn">Execute</button></div></div>
                </div>
                <div className="action-row">
                  <div className="action-title"><span className="bg-[hsl(var(--severity-medium)/0.2)] text-[hsl(var(--severity-medium))] text-[9px] px-1 rounded border border-[hsl(var(--severity-medium)/0.3)]">Investigate</span>Audit FW-03 config changes</div>
                  <div className="action-body">Review ACL modifications at 13:45 UTC. Compare against golden baseline and validate change authorization.</div>
                  <div className="action-footer"><span className="text-[9px] text-muted-foreground">No change ticket found for this window</span><div className="flex items-center gap-2"><span className="conf-badge">72% conf.</span><button className="exec-btn bg-accent/20 border border-accent/30 text-accent-foreground">Investigate</button></div></div>
                </div>
                <div className="action-row" style={{ marginBottom: 0 }}>
                  <div className="action-title"><span className="bg-[hsl(var(--status-success)/0.2)] text-[hsl(var(--status-success))] text-[9px] px-1 rounded border border-[hsl(var(--status-success)/0.3)]">Auto</span>Deploy auto-failover for DNS</div>
                  <div className="action-body">Configure health-check-based automatic failover DNS-Primary → DNS-Secondary with &lt;30s switchover.</div>
                  <div className="action-footer"><span className="text-[9px] text-muted-foreground">DNS SPOF identified across 5 incidents</span><div className="flex items-center gap-2"><span className="conf-badge">94% conf.</span><button className="exec-btn">Execute</button></div></div>
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
                      { label: 'Memory', data: [60, 61, 62, 63, 64, 66, 68, 70, 71, 72, 73, 73, 74, 74, 74], borderColor: 'var(--primary)', backgroundColor: 'rgba(108, 99, 255, 0.05)', tension: 0.4, fill: true },
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
                      { label: 'Changes', data: [1, 4, 3], borderColor: 'var(--primary)', tension: 0.3 },
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
                  <span className="text-[10px] text-muted-foreground font-bold">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: ORANGE }}></div>
                  <span className="text-[10px] text-muted-foreground font-bold">High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ background: AMBER }}></div>
                  <span className="text-[10px] text-muted-foreground font-bold">Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-muted border border-border"></div>
                  <span className="text-[10px] text-muted-foreground font-bold">Low</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 p-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                <div key={day} className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground w-6 font-bold">{day}</span>
                  <div className="flex flex-1 gap-1">
                    {Array.from({ length: 24 }).map((_, j) => {
                      const baseVal = Math.sin(j * 0.5);
                      const randVal = Math.random() * 2;
                      const combined = baseVal + randVal;
                      const count = Math.floor(combined * 50) + 10;

                      const color = count > 80 ? RED : count > 50 ? ORANGE : count > 20 ? AMBER : 'hsl(var(--muted))';
                      const textColor = (count > 20) ? '#fff' : 'hsl(var(--muted-foreground))';

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
            <div className="flex justify-between mt-2 text-[9px] text-muted-foreground pl-10 pr-2 pb-2 font-bold font-mono"><span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span></div>
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
              onOpenRemediation={() => setActiveSidebar('remediation')}
            />
          )}

          {activeSidebar === 'remediation' && (
            <RemediationSidebar
              cluster={selectedCluster as any}
              onClose={() => { setActiveSidebar(null); setSelectedCluster(null); }}
              onBack={() => setActiveSidebar('rca')}
            />
          )}
        </>
      )}

      {/* ── Business Service Health Sidebar ── */}
      {selectedService && (
        <BusinessServiceHealthSidebar
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </MainLayout>
  );
}
