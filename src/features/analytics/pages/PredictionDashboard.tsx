import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useTheme } from 'next-themes';
import {
    Activity,
    Layers,
    Zap,
    Router,
    Shield,
    Server,
    Database,
    Cpu,
    HardDrive,
    Globe,
    AlertCircle,
    XCircle,
    BarChart3,
    CheckCircle2,
    Workflow,
    History,
    ChevronRight,
    Play
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// --- DATA DEFINITIONS ---
const topologies: Record<string, any> = {
    enterprise: {
        nodes: [
            { id: 'Edge Router R4', x: 120, y: 150, type: 'edge', status: 'warning', predicted: true },
            { id: 'Edge Router R3', x: 120, y: 450, type: 'edge', status: 'warning' },
            { id: 'Agg Switch SW1', x: 380, y: 300, type: 'switch', status: 'critical', anomaly: true },
            { id: 'Core Router R1', x: 600, y: 300, type: 'router', status: 'normal' },
            { id: 'App Gateway 1', x: 820, y: 150, type: 'gateway', status: 'warning', predicted: true },
            { id: 'Auth Cluster', x: 1040, y: 150, type: 'auth', status: 'normal' },
            { id: 'Compute Cluster A', x: 820, y: 400, type: 'compute', status: 'normal' },
            { id: 'DB Cluster Main', x: 1040, y: 500, type: 'database', status: 'critical', anomaly: true },
            { id: 'Storage Cluster', x: 820, y: 600, type: 'storage', status: 'normal' }
        ],
        links: [
            { source: 'Edge Router R4', target: 'Agg Switch SW1', status: 'critical', curve: 'down', label: '10ms' },
            { source: 'Edge Router R3', target: 'Agg Switch SW1', status: 'critical', curve: 'up', label: '12ms' },
            { source: 'Agg Switch SW1', target: 'Core Router R1', status: 'normal', curve: 'up', label: '2ms' },
            { source: 'Core Router R1', target: 'App Gateway 1', status: 'normal', curve: 'up', label: '5ms' },
            { source: 'Core Router R1', target: 'Compute Cluster A', status: 'normal', curve: 'down', label: '8ms' },
            { source: 'Core Router R1', target: 'Storage Cluster', status: 'normal', curve: 'down', label: '15ms' },
            { source: 'App Gateway 1', target: 'Auth Cluster', status: 'normal', curve: 'up', label: '45ms' },
            { source: 'Compute Cluster A', target: 'DB Cluster Main', status: 'normal', curve: 'up', label: '120ms' }
        ]
    },
    hop_distance: {
        nodes: [
            { id: 'R1 (Router)', x: 150, y: 400, type: 'router', status: 'warning', predicted: true },
            { id: 'SW1 (Access)', x: 415, y: 400, type: 'switch', status: 'normal' },
            { id: 'SW2 (Dist)', x: 680, y: 400, type: 'switch', status: 'normal' },
            { id: 'FW1 (Firewall)', x: 945, y: 400, type: 'auth', status: 'critical', anomaly: true },
            { id: 'Edge1 (Edge)', x: 1210, y: 400, type: 'edge', status: 'normal' }
        ],
        links: [
            { source: 'R1 (Router)', target: 'SW1 (Access)', label: '', status: 'normal', curve: 'up' },
            { source: 'SW1 (Access)', target: 'SW2 (Dist)', label: '', status: 'normal', curve: 'down' },
            { source: 'SW2 (Dist)', target: 'FW1 (Firewall)', label: '', status: 'normal', curve: 'up' },
            { source: 'FW1 (Firewall)', target: 'Edge1 (Edge)', label: '', status: 'normal', curve: 'down' }
        ]
    }
};

const STATUS_COLORS: Record<string, string> = {
    normal: 'hsl(var(--status-success))',
    warning: 'hsl(var(--severity-medium))',
    critical: 'hsl(var(--severity-critical))',
    info: 'hsl(var(--primary))'
};

const NODE_TYPES: Record<string, { size: number, icon: any }> = {
    edge: { size: 30, icon: Globe },
    router: { size: 30, icon: Server },
    switch: { size: 30, icon: Server },
    gateway: { size: 30, icon: Server },
    auth: { size: 30, icon: Shield },
    compute: { size: 30, icon: Cpu },
    database: { size: 30, icon: Database },
    storage: { size: 30, icon: HardDrive },
    firewall: { size: 30, icon: Shield }
};

const SERVICES_MAP: Record<string, any> = {
    'Edge Router': { name: 'BGP Routing', protocol: 'BGP', latency: '12ms', throughput: '10 Gbps', impact: 'critical' },
    'Agg Switch': { name: 'VLAN Trunking', protocol: '802.1Q', latency: '3ms', throughput: '40 Gbps', impact: 'high' },
    'Core Router': { name: 'MPLS Backbone', protocol: 'MPLS', latency: '8ms', throughput: '100 Gbps', impact: 'critical' },
    'App Gateway': { name: 'HTTP/HTTPS Proxy', protocol: 'HTTPS', latency: '22ms', throughput: '5 Gbps', impact: 'high' },
    'Auth Cluster': { name: 'OAuth2 / Identity', protocol: 'TLS 1.3', latency: '45ms', throughput: '1 Gbps', impact: 'critical' },
    'Compute Cluster': { name: 'Microservices Mesh', protocol: 'gRPC', latency: '5ms', throughput: '20 Gbps', impact: 'medium' },
    'DB Cluster': { name: 'SQL Query Engine', protocol: 'TDS/Postgres', latency: '150ms', throughput: '2 Gbps', impact: 'critical' },
    'Storage Cluster': { name: 'Object Storage', protocol: 'S3/iSCSI', latency: '40ms', throughput: '50 Gbps', impact: 'high' }
};

const SLA_DATA = [
    { type: 'critical', name: 'Tier 1 Service Availability', target: '99.99%', mttr: '15m', penalty: '$5,000/hr' },
    { type: 'high', name: 'Database Durability', target: '99.95%', mttr: '30m', penalty: '$2,500/hr' },
    { type: 'medium', name: 'Internal API Latency', target: '99.90%', mttr: '1h', penalty: 'Service Credit' }
];

const calculateNodeImpact = (node: any, topology: any) => {
    // Generate dynamic mock data based on the selected node and its neighbors
    const otherNodes = topology.nodes.filter((n: any) => n.id !== node.id);
    const affectedCount = node.status === 'critical' ? 6 : 4;
    const pickedNodes = otherNodes.slice(0, affectedCount);

    const timeline = pickedNodes.map((n: any, idx: number) => {
        const typeInfo = NODE_TYPES[n.type] || NODE_TYPES.router;
        const timeOffset = (idx + 1) * 45;
        const eventTime = new Date();
        eventTime.setSeconds(eventTime.getSeconds() + timeOffset);

        return {
            time: `T+${timeOffset}s`,
            timestamp: eventTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            device: n.id,
            status: n.status === 'normal' ? 'DEGRADED' : 'FAILED',
            layer: `Level ${idx + 1}`,
            type: n.type.charAt(0).toUpperCase() + n.type.slice(1),
            health: n.status === 'normal' ? '88%' : '62%',
            impact: n.status === 'critical' ? '95%' : (n.status === 'warning' ? '70%' : '45%'),
            icon: typeInfo.icon,
            color: STATUS_COLORS[n.status] || 'hsl(var(--primary))'
        };
    });

    const affectedDevices = pickedNodes.map((n: any, idx: number) => ({
        id: n.id,
        criticality: n.status === 'critical' ? 'CRITICAL' : 'ORCHESTRATED',
        health: n.status === 'normal' ? '92%' : '48%',
        status: n.status === 'normal' ? 'DEGRADED' : 'FAILED',
        cascade: `Level ${Math.floor(idx / 2)}`,
        impact: n.status === 'critical' ? '100%' : '65%',
        type: n.type
    }));

    const affectedServices = pickedNodes.slice(0, 3).map((n: any) => {
        const serviceKey = Object.keys(SERVICES_MAP).find(k => n.id.includes(k)) || 'Edge Router';
        const svc = SERVICES_MAP[serviceKey];
        return {
            ...svc,
            impact: svc.impact.toUpperCase(),
            icon: (NODE_TYPES[n.type] || NODE_TYPES.router).icon
        };
    });

    const slaSummary = {
        total: pickedNodes.length * 2,
        critical: Math.floor(pickedNodes.length / 2),
        high: pickedNodes.length,
        medium: Math.ceil(pickedNodes.length / 3),
        low: 2
    };

    return { timeline, affectedDevices, affectedServices, slaSummary };
};

export default function PredictionDashboard() {
    const [currentTopology, setCurrentTopology] = useState('enterprise');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'timeline' | 'devices' | 'services' | 'sla'>('timeline');
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [impactData, setImpactData] = useState<any>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: any } | null>(null);

    const activeTopo = topologies[currentTopology] || topologies.enterprise;

    const handleNodeClick = (node: any) => {
        // Left click no longer opens sidebar directly as per user request
    };

    const onContextMenuNode = (e: React.MouseEvent, node: any) => {
        e.preventDefault();
        if (!node.predicted && !node.anomaly) return;
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    const handleImpactAnalysis = (node: any) => {
        setSelectedNode(node);
        setImpactData(calculateNodeImpact(node, activeTopo));
        setSidebarOpen(true);
        setContextMenu(null);
    };

    return (
        <MainLayout>
            <style dangerouslySetInnerHTML={{
                __html: `
                .predictive-ring { 
                    stroke-dasharray: 12, 4; 
                    animation: rotate-ring 40s linear infinite; 
                    transform-origin: center; 
                    stroke-opacity: 0.4;
                }
                @keyframes rotate-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .predictive-pulse { 
                    animation: professional-pulse 8s ease-in-out infinite; 
                }
                @keyframes professional-pulse { 
                    0%, 100% { opacity: 0.1; transform: scale(1.0); } 
                    50% { opacity: 0.25; transform: scale(1.2); } 
                }
                
                .anomaly-blink { 
                    animation: professional-breath 3s ease-in-out infinite; 
                }
                @keyframes professional-breath { 
                    0%, 100% { opacity: 1; filter: brightness(1); } 
                    50% { opacity: 0.7; filter: brightness(1.5) drop-shadow(0 0 5px currentColor); } 
                }
                
                .link-beads { stroke-dasharray: 0.1, 20; stroke-linecap: round; animation: bead-flow 30s linear infinite; }
                @keyframes bead-flow { to { stroke-dashoffset: -1000; } }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--muted-foreground) / 0.2); border-radius: 10px; }
            `}} />

            <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background relative">
                {/* TOPOLOGY SECTION */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
                        <Select value={currentTopology} onValueChange={setCurrentTopology}>
                            <SelectTrigger className="w-[280px] bg-card/80 backdrop-blur-md border-border text-foreground rounded-xl h-11">
                                <Layers className="w-4 h-4 mr-2 text-primary" />
                                <SelectValue placeholder="Select Topology" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="enterprise">Enterprise Data Center</SelectItem>
                                <SelectItem value="hop_distance">Hop-Distance Topology</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="absolute top-6 right-6 z-10 bg-card/80 backdrop-blur-xl px-6 py-2.5 rounded-full border border-border flex items-center gap-8 shadow-2xl">
                        <div className="flex items-center gap-4 border-r border-border pr-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Healthy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Major</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Critical</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 group">
                                <div className="relative w-3 h-3">
                                    <div className="absolute inset-0 rounded-full border border-primary/50" />
                                    <div className="absolute inset-[2px] rounded-full bg-primary predictive-pulse" />
                                </div>
                                <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Prediction</span>
                            </div>
                            <div className="flex items-center gap-2 group">
                                <div className="w-3 h-3 rounded-sm bg-red-500 anomaly-blink shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">Anomaly</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar relative bg-[radial-gradient(circle_at_center,_hsl(var(--primary)_/_0.05),transparent)]">
                        <svg className="w-full min-h-[800px]" viewBox="0 0 1300 800" preserveAspectRatio="xMidYMid meet">
                            {activeTopo.links.map((link: any, i: number) => {
                                const src = activeTopo.nodes.find((n: any) => n.id === link.source);
                                const tgt = activeTopo.nodes.find((n: any) => n.id === link.target);
                                if (!src || !tgt) return null;
                                const midX = (src.x + tgt.x) / 2;
                                const midY = (src.y + tgt.y) / 2;
                                const offset = link.curve === 'straight' ? 0 : (link.curve === 'up' ? -40 : 40);
                                const pathData = `M ${src.x} ${src.y} Q ${midX} ${midY + offset} ${tgt.x} ${tgt.y}`;
                                return (
                                    <g key={i}>
                                        <path d={pathData} stroke={link.status === 'critical' ? 'hsl(var(--severity-critical))' : 'hsl(var(--primary))'} strokeWidth="2" fill="none" strokeOpacity="0.2" />
                                        <path d={pathData} stroke={link.status === 'critical' ? 'hsl(var(--severity-critical))' : 'hsl(var(--primary))'} strokeWidth="3" fill="none" strokeOpacity="0.6" className="link-beads" />
                                        {link.label && (
                                            <text x={midX} y={midY + offset - 12} textAnchor="middle" className="text-[11px] font-black fill-muted-foreground uppercase tracking-widest opacity-60">
                                                {link.label}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                            {activeTopo.nodes.map((node: any, i: number) => {
                                const nodeType = NODE_TYPES[node.type] || NODE_TYPES.router;
                                const IconComp = nodeType.icon;
                                const size = nodeType.size;
                                const color = STATUS_COLORS[node.status];

                                return (
                                    <g 
                                        key={i} 
                                        transform={`translate(${node.x}, ${node.y})`} 
                                        onClick={() => handleNodeClick(node)}
                                        onContextMenu={(e) => onContextMenuNode(e, node)}
                                        className="cursor-pointer group"
                                    >
                                        {node.predicted && (
                                            <circle r={size * 1.5} fill={color} className="predictive-pulse" opacity="0.1" />
                                        )}
                                        <rect x="-24" y="-24" width="48" height="48" rx="12" fill="hsl(var(--card))" stroke={node.status !== 'normal' ? color : 'hsl(var(--border))'} strokeWidth="2" className={cn(node.anomaly && "anomaly-blink shadow-[0_0_20px_rgba(239,68,68,0.2)]")} />

                                        <foreignObject x="-12" y="-12" width="24" height="24" style={{ pointerEvents: 'none' }}>
                                            <div className="flex items-center justify-center w-full h-full">
                                                <IconComp size={20} className={cn(node.anomaly && "anomaly-blink", "transition-colors")} style={{ color: color }} strokeWidth={2.5} />
                                            </div>
                                        </foreignObject>

                                        <text y="42" textAnchor="middle" className="text-[11px] font-black fill-muted-foreground group-hover:fill-foreground tracking-tighter transition-colors uppercase">
                                            {node.id}
                                        </text>

                                        <circle cx="18" cy="-18" r="5" fill={color} className={cn(node.status !== 'normal' && "animate-pulse")} />
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                
                {/* CONTEXT MENU */}
                {contextMenu && (
                    <div 
                        className="fixed inset-0 z-[100]" 
                        onClick={() => setContextMenu(null)}
                        onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute bg-popover border border-border rounded-xl shadow-2xl p-1 min-w-[200px] backdrop-blur-xl"
                            style={{ left: contextMenu.x, top: contextMenu.y }}
                        >
                            <button 
                                onClick={() => handleImpactAnalysis(contextMenu.node)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 hover:text-primary rounded-lg text-[12px] font-black text-foreground tracking-widest transition-all text-left uppercase"
                            >
                                <Zap className="h-3.5 w-3.5" />
                                Impact Analysis
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* ADVANCED IMPACT SIDEBAR */}
                <AnimatePresence>
                    {isSidebarOpen && selectedNode && impactData && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 480, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full border-l border-border bg-card flex flex-col shadow-2xl relative z-50"
                        >
                            {/* SIDEBAR HEADER with CLOSE */}
                            <div className="flex items-center justify-between px-6 h-14 bg-muted/30 border-b border-border shrink-0">
                                <h2 className="text-[13px] font-black text-foreground tracking-widest uppercase">Impact Analysis</h2>
                                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-muted rounded-full transition-colors">
                                    <XCircle size={20} className="text-muted-foreground hover:text-foreground" />
                                </button>
                            </div>

                            {/* TABS */}
                            <div className="flex bg-muted/20 border-b border-border shrink-0 h-14">
                                {(['timeline', 'devices', 'services', 'sla'] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 text-[12px] font-black tracking-widest transition-all relative uppercase",
                                            activeTab === tab ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {tab === 'timeline' && <History size={14} />}
                                        {tab === 'devices' && <Server size={14} />}
                                        {tab === 'services' && <Zap size={14} />}
                                        {tab === 'sla' && <Shield size={14} />}
                                        {tab === 'sla' ? 'SLA' : tab}
                                        {activeTab === tab && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                {activeTab === 'timeline' && (
                                    <div className="space-y-4">
                                        <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#00D4FF]/30">
                                            {impactData.timeline.map((event: any, idx: number) => (
                                                <div key={idx} className="relative">
                                                    <div className="absolute -left-[23px] top-0 w-6 h-6 rounded-full bg-[#010816] border-2 border-[#00D4FF]/50 flex items-center justify-center z-10">
                                                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: event.color + '33' }}>
                                                            {React.createElement(event.icon, { size: 10, color: event.color })}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="text-[15px] font-black text-primary leading-none mb-1 tracking-tighter">{event.time}</div>
                                                            <div className="text-[12px] font-bold text-muted-foreground font-mono tracking-tighter">{event.timestamp}</div>
                                                        </div>
                                                         <div className="p-3 rounded-xl bg-gradient-to-br from-primary/[0.04] to-transparent border border-border relative group hover:border-primary/30 transition-all shadow-sm">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h3 className="text-[15px] font-black text-foreground tracking-tight">{event.device}</h3>
                                                                <div className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[11px] font-black">
                                                                    {event.impact}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-y-2">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5">Status</p>
                                                                    <p className="text-[12px] font-black text-red-500">{event.status.charAt(0).toUpperCase() + event.status.slice(1).toLowerCase()}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 mb-0.5">Layer</p>
                                                                    <p className="text-[12px] font-black text-white">{event.layer}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-slate-500 mb-0.5">Type</p>
                                                                    <p className="text-[12px] font-black text-white">{event.type}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Health</p>
                                                                    <p className="text-[12px] font-black text-foreground">{event.health}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'devices' && (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/30 text-center relative overflow-hidden shadow-inner">
                                            <div className="text-[34px] font-black text-primary mb-1 tracking-tighter">
                                                {impactData.affectedDevices.length}
                                            </div>
                                            <div className="text-[11px] font-black text-muted-foreground tracking-[0.2em] uppercase">Devices Affected</div>
                                        </div>


                                        <div className="space-y-2">
                                            {impactData.affectedDevices.map((device: any, idx: number) => (
                                                 <div key={idx} className="p-3 rounded-xl bg-muted/10 border border-border hover:border-primary/20 transition-all shadow-sm">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <Router size={14} className="text-primary" />
                                                            <span className="text-[13px] font-black text-foreground tracking-tight">{device.id}</span>
                                                        </div>
                                                        <div className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase">
                                                            {device.impact}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-2">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Criticality</p>
                                                            <p className="text-[12px] font-black text-foreground uppercase">{device.criticality}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Health</p>
                                                            <p className="text-[12px] font-black text-foreground">{device.health}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Status</p>
                                                            <p className="text-[12px] font-black text-red-500 uppercase">{device.status}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Cascade Level</p>
                                                            <p className="text-[12px] font-black text-foreground uppercase">{device.cascade}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'services' && (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/30 text-center relative overflow-hidden shadow-inner">
                                            <div className="text-[34px] font-black text-primary mb-1 tracking-tighter">
                                                {impactData.affectedServices.length}
                                            </div>
                                            <div className="text-[11px] font-black text-muted-foreground tracking-[0.2em] uppercase">Network Services Affected</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-muted/10 p-3 rounded-xl border border-border text-center shadow-sm">
                                                <div className="text-[26px] font-black text-red-500 mb-1 leading-none tracking-tighter">
                                                    {impactData.affectedServices.filter((s: any) => s.impact === 'CRITICAL').length}
                                                </div>
                                                <div className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">Critical Impact</div>
                                            </div>
                                            <div className="bg-muted/10 p-3 rounded-xl border border-border text-center shadow-sm">
                                                <div className="text-[26px] font-black text-orange-500 mb-1 leading-none tracking-tighter">
                                                    {impactData.affectedServices.filter((s: any) => s.impact === 'HIGH').length}
                                                </div>
                                                <div className="text-[9px] font-black text-muted-foreground tracking-widest uppercase">High Impact</div>
                                            </div>
                                        </div>


                                        <div className="space-y-2">
                                            {impactData.affectedServices.map((service: any, idx: number) => (
                                                 <div key={idx} className="p-3 rounded-xl bg-muted/10 border border-border group hover:border-primary/20 transition-all shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-2">
                                                            {React.createElement(service.icon, { size: 14, className: "text-primary" })}
                                                            <p className="text-[14px] font-black text-foreground tracking-tight">{service.name}</p>
                                                        </div>
                                                        <div className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase", service.impact === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500')}>
                                                            {service.impact}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-y-2">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Protocol</p>
                                                            <p className="text-[12px] font-black text-foreground uppercase">{service.protocol}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Port</p>
                                                            <p className="text-[12px] font-black text-foreground">{service.port}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Dependencies</p>
                                                            <p className="text-[12px] font-black text-foreground uppercase">{service.dependencies}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Uptime</p>
                                                            <p className="text-[12px] font-black text-foreground">{service.uptime}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'sla' && (
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/30 text-center relative overflow-hidden shadow-inner">
                                            <div className="text-[32px] font-black text-primary mb-1 tracking-tighter">
                                                {impactData.slaSummary.total}
                                            </div>
                                            <div className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase">Total SLA Affected</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: 'Critical SLA', count: impactData.slaSummary.critical, color: 'text-red-500' },
                                                { label: 'High Priority', count: impactData.slaSummary.high, color: 'text-orange-500' },
                                                { label: 'Medium Priority', count: impactData.slaSummary.medium, color: 'text-blue-500' },
                                                { label: 'Low Priority', count: impactData.slaSummary.low, color: 'text-emerald-500' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="bg-muted/10 p-3 rounded-xl border border-border text-center shadow-sm">
                                                    <div className={cn("text-[20px] font-black mb-1 leading-none tracking-tighter", item.color)}>{item.count}</div>
                                                    <div className="text-[8px] font-black text-muted-foreground tracking-widest uppercase">{item.label}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            {/* Critical SLA Card */}
                                            <div className="p-3 rounded-xl bg-muted/10 border border-border hover:border-red-500/30 transition-all shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={14} className="text-red-500" />
                                                        <span className="text-[14px] font-black text-foreground tracking-tight uppercase">Critical SLA</span>
                                                    </div>
                                                    <div className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase">
                                                        {impactData.slaSummary.critical} SLA
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-2 text-[12px] font-black">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Uptime Target</p>
                                                        <p className="text-foreground">99.99%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">MTTR</p>
                                                        <p className="text-foreground">15 min</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* High Priority SLA Card */}
                                            <div className="p-3 rounded-xl bg-muted/10 border border-border hover:border-orange-500/30 transition-all shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={14} className="text-orange-500" />
                                                        <span className="text-[14px] font-black text-foreground tracking-tight uppercase">High Priority</span>
                                                    </div>
                                                    <div className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase">
                                                        {impactData.slaSummary.high} SLA
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-y-2 text-[12px] font-black">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Uptime Target</p>
                                                        <p className="text-foreground">99.95%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">MTTR</p>
                                                        <p className="text-foreground">30 min</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MainLayout>
    );
}
