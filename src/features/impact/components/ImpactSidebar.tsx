import { X, BarChart3, Server, Users, AlertTriangle, TrendingUp, ArrowDownRight, ArrowUpRight, Network, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Cluster } from '@/shared/types';
import { cn } from '@/shared/lib/utils';
import { getClusterData } from '@/features/rca/data/clusterData';

interface ImpactSidebarProps {
  cluster: Cluster;
  onClose: () => void;
}

const impactMetrics = [
  { label: 'Service Degradation', value: 85, trend: 'up', severity: 'critical' },
  { label: 'User Experience', value: 42, trend: 'down', severity: 'high' },
  { label: 'Revenue Impact', value: 15, trend: 'stable', severity: 'medium' },
  { label: 'SLA Compliance', value: 78, trend: 'down', severity: 'high' },
];

export function ImpactSidebar({ cluster, onClose }: ImpactSidebarProps) {
  const clusterData = getClusterData(cluster.id);

  // Simple topology visualization using SVG
  const renderTopology = () => {
    if (!clusterData) return null;

    const { nodes, edges } = clusterData.impactTopology;
    const nodeRadius = 40;
    const svgWidth = 600;
    const svgHeight = 400;

    // Simple circular layout
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = 120;

    const nodePositions = nodes.map((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const getSeverityColor = (severity?: string) => {
      switch (severity) {
        case 'Critical': return '#ef4444';
        case 'Major': return '#f97316';
        case 'Minor': return '#eab308';
        default: return '#10b981';
      }
    };

    return (
      <svg width="100%" height="400" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="bg-secondary/10 rounded-lg">
        {/* Edges */}
        {edges.map((edge, index) => {
          const fromNode = nodePositions.find(n => n.id === edge.from);
          const toNode = nodePositions.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          return (
            <line
              key={index}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={edge.type === 'backup-traffic' ? '#f97316' : '#64748b'}
              strokeWidth="2"
              strokeDasharray={edge.type === 'backup-traffic' ? '5,5' : '0'}
              opacity="0.6"
            />
          );
        })}

        {/* Nodes */}
        {nodePositions.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              fill={getSeverityColor(node.severity)}
              opacity="0.2"
              stroke={getSeverityColor(node.severity)}
              strokeWidth="2"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius - 10}
              fill="currentColor"
              className="fill-background"
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-xs font-medium"
              style={{ fontSize: '11px' }}
            >
              {node.label.split(' ').map((word, i) => (
                <tspan key={i} x={node.x} dy={i === 0 ? 0 : 12}>
                  {word}
                </tspan>
              ))}
            </text>
            {node.severity && (
              <circle
                cx={node.x + nodeRadius - 10}
                cy={node.y - nodeRadius + 10}
                r="6"
                fill={getSeverityColor(node.severity)}
              />
            )}
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[85%] max-w-[1200px] bg-background border-l border-border shadow-2xl z-50 animate-slide-in-right">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back
            </Button>
            <div className="h-8 w-px bg-border" />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-severity-high/20 border border-severity-high/30">
              <BarChart3 className="h-6 w-6 text-severity-high" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Impact Analysis</h2>
              <p className="text-sm text-muted-foreground font-mono">{cluster.id}</p>
            </div>
          </div>

        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Impact Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-5 text-center">
                <Users className="h-8 w-8 text-severity-critical mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{cluster.affectedUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Users Affected</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <Server className="h-8 w-8 text-severity-high mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{cluster.affectedServices.length}</p>
                <p className="text-sm text-muted-foreground">Services Impacted</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center">
                <AlertTriangle className="h-8 w-8 text-severity-medium mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{cluster.childEvents.length + 1}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Impact Metrics
              </h3>
              <div className="space-y-4">
                {impactMetrics.map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        {metric.trend === 'up' && <ArrowUpRight className="h-4 w-4 text-severity-critical" />}
                        {metric.trend === 'down' && <ArrowDownRight className="h-4 w-4 text-status-success" />}
                        <span className={cn(
                          "font-bold",
                          metric.severity === 'critical' && "text-severity-critical",
                          metric.severity === 'high' && "text-severity-high",
                          metric.severity === 'medium' && "text-severity-medium",
                        )}>{metric.value}%</span>
                      </div>
                    </div>
                    <Progress
                      value={metric.value}
                      className={cn(
                        "h-2",
                        metric.severity === 'critical' && "[&>div]:bg-severity-critical",
                        metric.severity === 'high' && "[&>div]:bg-severity-high",
                        metric.severity === 'medium' && "[&>div]:bg-severity-medium",
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Service Topology */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Network className="h-5 w-5 text-primary" />
                Impacted Assets Topology
              </h3>
              <div className="mb-4">
                {renderTopology()}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-severity-critical" />
                  <span className="text-muted-foreground">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-severity-high" />
                  <span className="text-muted-foreground">Major</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-severity-medium" />
                  <span className="text-muted-foreground">Minor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-success" />
                  <span className="text-muted-foreground">Normal</span>
                </div>
              </div>
            </div>

            {/* Impacted Assets List */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Impacted Assets Details
              </h3>
              <div className="space-y-3">
                {clusterData?.impactedAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className={cn(
                      "flex flex-col gap-3 p-4 rounded-lg border",
                      asset.severity === 'Critical' && "bg-severity-critical/10 border-severity-critical/30",
                      asset.severity === 'Major' && "bg-severity-high/10 border-severity-high/30",
                      asset.severity === 'Minor' && "bg-severity-medium/10 border-severity-medium/30",
                      asset.severity === 'Low' && "bg-secondary/30 border-border/50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          asset.severity === 'Critical' && "bg-severity-critical/20",
                          asset.severity === 'Major' && "bg-severity-high/20",
                          asset.severity === 'Minor' && "bg-severity-medium/20",
                        )}>
                          {asset.type === 'Router' && <Network className="h-5 w-5" />}
                          {asset.type === 'Server' && <Server className="h-5 w-5" />}
                          {asset.type === 'Service' && <Activity className="h-5 w-5" />}
                          {asset.type === 'Database' && <Server className="h-5 w-5" />}
                          {asset.type === 'Gateway' && <Network className="h-5 w-5" />}
                          {asset.type === 'Microservice' && <Activity className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{asset.name}</p>
                          <p className="text-sm text-muted-foreground">{asset.type}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={cn(
                          asset.severity === 'Critical' && "bg-severity-critical",
                          asset.severity === 'Major' && "bg-severity-high",
                          asset.severity === 'Minor' && "bg-severity-medium",
                        )}>
                          {asset.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{asset.status}</span>
                      </div>
                    </div>

                    {asset.dependencies.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Dependencies:</p>
                        <div className="flex flex-wrap gap-2">
                          {asset.dependencies.map((dep) => (
                            <Badge key={dep} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!clusterData || clusterData.impactedAssets.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Server className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No impacted assets data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Timeline */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Impact Propagation Timeline</h3>
              <div className="relative pl-6 border-l-2 border-primary/30 space-y-4">
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-severity-critical border-2 border-background" />
                  <div className="bg-severity-critical/10 rounded-lg p-3 border border-severity-critical/20">
                    <p className="text-sm font-medium text-foreground">Initial Incident</p>
                    <p className="text-xs text-muted-foreground">{cluster.rootEvent.alertType}</p>
                    <p className="text-xs text-muted-foreground mt-1">+0s</p>
                  </div>
                </div>
                {cluster.childEvents.slice(0, 3).map((event, index) => (
                  <div key={event.id} className="relative">
                    <div className={cn(
                      "absolute -left-[25px] w-4 h-4 rounded-full border-2 border-background",
                      index === 0 ? "bg-severity-high" : "bg-severity-medium"
                    )} />
                    <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                      <p className="text-sm font-medium text-foreground">{event.alertType.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{event.source}</p>
                      <p className="text-xs text-muted-foreground mt-1">+{(index + 1) * 3}s</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex gap-3">

            <Button className="flex-1 bg-severity-high hover:bg-severity-high/90">
              Generate Impact Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
