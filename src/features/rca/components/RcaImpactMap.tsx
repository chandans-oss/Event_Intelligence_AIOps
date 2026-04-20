import { ClusterSpecificData } from '@/features/rca/data/clusterData';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Network, Target, Users, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface RCAImpactMapProps {
    data: ClusterSpecificData;
}

export function RCAImpactMap({ data }: RCAImpactMapProps) {
    const navigate = useNavigate();

    // SVG Topology Visualization (Simplified Sankey-like flow)
    const renderTopology = () => {
        const { nodes, edges } = data.impactTopology;
        const svgWidth = 600;
        const svgHeight = 300;

        // Simple auto-layout for flow (Left -> Right)
        // Group nodes by "stage" or simple column based on dependencies
        // For this demo, we'll just distribute them horizontally
        const nodeRadius = 25;
        const margin = 50;
        const availableWidth = svgWidth - 2 * margin;

        const nodePositions = nodes.map((node, index) => {
            const x = margin + (index / (nodes.length - 1)) * availableWidth;
            // Stagger Y slightly
            const y = svgHeight / 2 + (index % 2 === 0 ? -40 : 40);
            return { ...node, x, y };
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
            <svg width="100%" height="300" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="bg-secondary/10 rounded-lg">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" opacity="0.5" />
                    </marker>
                </defs>
                {/* Edges */}
                {edges.map((edge, index) => {
                    const fromNode = nodePositions.find(n => n.id === edge.from) || nodePositions[0];
                    const toNode = nodePositions.find(n => n.id === edge.to) || nodePositions[1];

                    return (
                        <line
                            key={index}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={getSeverityColor(toNode.severity)}
                            strokeWidth="4"
                            opacity="0.5"
                            markerEnd="url(#arrowhead)"
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
                            r={5}
                            fill={getSeverityColor(node.severity)}
                        />
                        <text
                            x={node.x}
                            y={node.y + nodeRadius + 15}
                            textAnchor="middle"
                            className="fill-foreground text-[10px] font-medium"
                        >
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                {/* Summary Stats */}
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Users className="h-6 w-6 text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">1,240</div>
                        <div className="text-xs text-muted-foreground">Impacted Users</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Server className="h-6 w-6 text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">{data.impactedAssets.length}</div>
                        <div className="text-xs text-muted-foreground">Affected Assets</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Target className="h-6 w-6 text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-xs text-muted-foreground">Business Services</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Network className="h-4 w-4" /> Blast Radius & Propagation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {renderTopology()}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Most Impacted Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.impactedAssets.slice(0, 3).map(asset => (
                            <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                        <Server className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{asset.name}</div>
                                        <div className="text-xs text-muted-foreground">{asset.type}</div>
                                    </div>
                                </div>
                                <Badge variant={asset.severity === 'Critical' ? 'destructive' : 'secondary'}>{asset.severity}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={() => navigate(`/impact/detail/${data.clusterId}`)} className="gap-2">
                    View Detailed Impact Analysis
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
