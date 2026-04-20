import { useState, useCallback, useMemo } from 'react';
import { Server, Database, Globe, Shield, Cpu, HardDrive, AlertCircle, CheckCircle2, Network } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';

export interface ServiceNode {
  id: string;
  name: string;
  type: 'api' | 'database' | 'web' | 'auth' | 'compute' | 'storage' | 'network' | 'core' | 'edge';
  status: 'healthy' | 'degraded' | 'critical' | 'impacted';
  x: number;
  y: number;
  connections: string[];
  metrics?: {
    latency?: string;
    errorRate?: string;
    throughput?: string;
    utilization?: string;
    queueDepth?: string;
    cpu?: string;
    memory?: string;
  };
}

interface ServiceTopologyProps {
  nodes?: ServiceNode[];
  affectedServices?: string[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const defaultNodes: ServiceNode[] = [
  { id: 'web-app', name: 'Web App', type: 'web', status: 'healthy', x: 400, y: 50, connections: ['api-gateway'], metrics: { latency: '45ms', errorRate: '0.1%' } },
  { id: 'mobile-app', name: 'Mobile App', type: 'web', status: 'healthy', x: 600, y: 50, connections: ['api-gateway'], metrics: { latency: '120ms', errorRate: '0.3%' } },
  { id: 'api-gateway', name: 'API Gateway', type: 'api', status: 'healthy', x: 500, y: 150, connections: ['auth-service', 'user-service', 'order-service'], metrics: { latency: '12ms', throughput: '5K/s' } },
  { id: 'auth-service', name: 'Auth Service', type: 'auth', status: 'healthy', x: 300, y: 250, connections: ['user-db'], metrics: { latency: '25ms', errorRate: '0%' } },
  { id: 'user-service', name: 'User Service', type: 'api', status: 'healthy', x: 500, y: 250, connections: ['user-db', 'cache'], metrics: { latency: '35ms', errorRate: '0.2%' } },
  { id: 'order-service', name: 'Order Service', type: 'api', status: 'healthy', x: 700, y: 250, connections: ['order-db', 'payment-service'], metrics: { latency: '55ms', errorRate: '0.5%' } },
  { id: 'payment-service', name: 'Payment Service', type: 'api', status: 'healthy', x: 800, y: 350, connections: ['payment-db'], metrics: { latency: '180ms', errorRate: '0.1%' } },
  { id: 'user-db', name: 'User DB', type: 'database', status: 'healthy', x: 350, y: 380, connections: [], metrics: { latency: '5ms' } },
  { id: 'order-db', name: 'Order DB', type: 'database', status: 'healthy', x: 600, y: 380, connections: [], metrics: { latency: '8ms' } },
  { id: 'payment-db', name: 'Payment DB', type: 'database', status: 'healthy', x: 800, y: 450, connections: [], metrics: { latency: '6ms' } },
  { id: 'cache', name: 'Redis Cache', type: 'storage', status: 'healthy', x: 500, y: 380, connections: [], metrics: { latency: '1ms' } },
];

const getIcon = (type: ServiceNode['type']) => {
  switch (type) {
    case 'api': return Server;
    case 'database': return Database;
    case 'web': return Globe;
    case 'auth': return Shield;
    case 'compute': return Cpu;
    case 'storage': return HardDrive;
    case 'network': return Network;
    case 'core': return Server; // Or a specific Core Router icon if improved
    case 'edge': return Globe; // Or a specific Edge icon
    default: return Server;
  }
};

const getStatusColor = (status: ServiceNode['status']) => {
  switch (status) {
    case 'healthy': return 'bg-status-success border-status-success/50 text-status-success';
    case 'degraded': return 'bg-severity-high border-severity-high/50 text-severity-high';
    case 'critical': return 'bg-severity-critical border-severity-critical/50 text-severity-critical animate-pulse-glow';
    case 'impacted': return 'bg-severity-medium border-severity-medium/50 text-severity-medium';
    default: return 'bg-muted border-border text-muted-foreground';
  }
};

const getNodeBg = (status: ServiceNode['status']) => {
  switch (status) {
    case 'healthy': return 'bg-card hover:bg-secondary/50';
    case 'degraded': return 'bg-severity-high/10 hover:bg-severity-high/20';
    case 'critical': return 'bg-severity-critical/10 hover:bg-severity-critical/20 ring-2 ring-severity-critical/50';
    case 'impacted': return 'bg-severity-medium/10 hover:bg-severity-medium/20';
    default: return 'bg-card hover:bg-secondary/50';
  }
};

export function ServiceTopology({ nodes: propNodes, affectedServices = [], onNodeClick, className }: ServiceTopologyProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = useMemo(() => {
    const nodesToUse = propNodes || defaultNodes;
    return nodesToUse.map(node => ({
      ...node,
      status: affectedServices.includes(node.name) || affectedServices.includes(node.id)
        ? (affectedServices[0] === node.name || affectedServices[0] === node.id ? 'critical' : 'impacted') as ServiceNode['status']
        : node.status
    }));
  }, [affectedServices, propNodes]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    onNodeClick?.(nodeId);
  }, [selectedNode, onNodeClick]);

  // Generate connection lines with curved paths
  const connections = useMemo(() => {
    const lines: { from: ServiceNode; to: ServiceNode; isAffected: boolean; path: string }[] = [];
    nodes.forEach(node => {
      node.connections.forEach(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode) {
          const isAffected =
            (node.status === 'critical' || node.status === 'impacted') &&
            (targetNode.status === 'critical' || targetNode.status === 'impacted');

          // Calculate curved path
          const dx = targetNode.x - node.x;
          const dy = targetNode.y - node.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          const path = `M${node.x},${node.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`;

          lines.push({ from: node, to: targetNode, isAffected, path });
        }
      });
    });
    return lines;
  }, [nodes]);

  return (
    <div className={cn("relative w-full h-[900px] bg-secondary/5 rounded-2xl border border-border/50 overflow-hidden backdrop-blur-sm shadow-inner", className)}>
      {/* Legend & Controls */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
        <div className="flex gap-3 flex-wrap">
          <Badge variant="outline" className="gap-2 bg-card/80 backdrop-blur-md border-status-success/30 px-3 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Operational</span>
          </Badge>
          <Badge variant="outline" className="gap-2 bg-card/80 backdrop-blur-md border-severity-medium/30 px-3 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-severity-medium shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Degraded</span>
          </Badge>
          <Badge variant="outline" className="gap-2 bg-card/80 backdrop-blur-md border-severity-critical/30 px-3 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-severity-critical shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Failure Domain</span>
          </Badge>
        </div>
      </div>

      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {connections.map((conn, index) => {
          const isHighlighted =
            hoveredNode === conn.from.id ||
            hoveredNode === conn.to.id ||
            selectedNode === conn.from.id ||
            selectedNode === conn.to.id;

          const strokeWidth = isHighlighted ? 3 : (conn.isAffected ? 2.5 : 1.5);
          const strokeOpacity = isHighlighted ? 1 : (conn.isAffected ? 0.8 : 0.3);
          const strokeColor = conn.isAffected ? 'hsl(var(--severity-critical))' : 'hsl(var(--primary))';

          return (
            <g key={index}>
              {/* Main Path */}
              <path
                d={conn.path}
                fill="transparent"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={conn.isAffected ? "8,4" : "none"}
                className="transition-all duration-500 ease-in-out"
                filter={isHighlighted ? "url(#glow)" : "none"}
              />

              {/* Animated Traffic Flows */}
              {!conn.isAffected && (
                <path
                  d={conn.path}
                  fill="transparent"
                  stroke="white"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                  strokeDasharray="2, 30"
                  className="animate-flow"
                />
              )}

              {/* Congestion Pulse for Affected Links */}
              {conn.isAffected && (
                <path
                  d={conn.path}
                  fill="transparent"
                  stroke="hsl(var(--severity-critical))"
                  strokeWidth={strokeWidth + 2}
                  strokeOpacity={0.2}
                  className="animate-pulse"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Service Nodes */}
      {nodes.map((node) => {
        const Icon = getIcon(node.type);
        const isSelected = selectedNode === node.id;
        const isHovered = hoveredNode === node.id;
        const isConnected = hoveredNode && (
          nodes.find(n => n.id === hoveredNode)?.connections.includes(node.id) ||
          node.connections.includes(hoveredNode)
        );

        return (
          <Tooltip key={node.id} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className={cn(
                  "absolute flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 -translate-x-1/2 -translate-y-1/2 group",
                  isSelected && "z-30 scale-110",
                  (isHovered || isConnected) && "z-20 scale-110",
                  !isHovered && !isConnected && !isSelected && "opacity-80"
                )}
                style={{ left: node.x, top: node.y }}
              >
                {/* Node Outer Ring */}
                <div className={cn(
                  "relative flex items-center justify-center w-14 h-14 rounded-2xl border-2 backdrop-blur-md transition-all duration-300 shadow-xl",
                  isSelected ? "bg-primary/20 border-primary ring-4 ring-primary/20" :
                    node.status === 'critical' ? "bg-severity-critical/10 border-severity-critical animate-pulse-glow shadow-severity-critical/20" :
                      node.status === 'impacted' ? "bg-severity-medium/10 border-severity-medium shadow-severity-medium/10" :
                        "bg-card/40 border-border group-hover:border-primary/50"
                )}>
                  {/* Status Indicator Dot */}
                  <div className={cn(
                    "absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-background z-10",
                    getStatusColor(node.status).split(' ')[0]
                  )} />

                  <Icon className={cn(
                    "h-7 w-7 transition-transform duration-300 group-hover:scale-110",
                    node.status === 'healthy' ? "text-status-success" :
                      node.status === 'critical' ? "text-severity-critical" :
                        node.status === 'impacted' ? "text-severity-medium" : "text-primary"
                  )} />
                </div>

                {/* Label */}
                <span className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-full transition-all duration-300 whitespace-nowrap tracking-tight",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-background/80 text-foreground border border-border/50 group-hover:border-primary/30"
                )}>
                  {node.name}
                </span>

                {/* Metric Quick-View (Visible on Hover/Select) */}
                {(isHovered || isSelected) && node.metrics && (
                  <div className="absolute top-[65px] left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-background shadow-2xl border border-border rounded-lg scale-90 origin-top pointer-events-none z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col items-center border-r border-border pr-2">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Lat</span>
                      <span className="text-xs font-bold text-primary">{node.metrics.latency || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Util</span>
                      <span className="text-xs font-bold text-status-success">{node.metrics.utilization || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-0 border-none bg-transparent shadow-none">
              <div className="bg-card w-48 border border-border rounded-xl shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs">{node.name}</span>
                  </div>
                  <Badge variant={node.status === 'healthy' ? 'secondary' : 'destructive'} className="text-[9px] h-4 py-0 font-bold uppercase">
                    {node.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {Object.entries(node.metrics || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground capitalize font-medium">{key}</span>
                      <span className="font-bold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Connection Direction Legend Overlay */}
      <div className="absolute bottom-6 left-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pointer-events-none">
        Traffic Flow: Edge → Funnel → Core Services
      </div>
    </div>
  );
}
