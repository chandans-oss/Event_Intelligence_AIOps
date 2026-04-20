import { ClusterSpecificData, DataEvidence } from '@/features/rca/data/clusterData';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { FileText, BarChart2, GitCommit, Clock, Network, Search, Terminal } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button'; // Added missing import
import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface RCADataEvidenceProps {
    data: ClusterSpecificData;
}

export function RCADataEvidence({ data }: RCADataEvidenceProps) {
    const [activeTab, setActiveTab] = useState('metrics');

    const getEvidenceByType = (type: string) => data.dataEvidence.filter(e => e.type === type);

    // Group evidence
    const metrics = getEvidenceByType('Metrics');
    const logs = getEvidenceByType('Logs');
    const config = getEvidenceByType('Config');
    const similarEvents = getEvidenceByType('Similar Events');
    const netflow = getEvidenceByType('Netflow');

    const content: Record<string, any> = {
        metrics: { label: "Metrics", items: metrics, icon: BarChart2, empty: "No anomalous metrics detected" },
        logs: { label: "Logs", items: logs, icon: Terminal, empty: "No significant log patterns found" },
        configChanges: { label: "Config Changes", items: config, icon: GitCommit, empty: "No recent configuration changes" },
        similarEvents: { label: "Similar Events", items: similarEvents, icon: Clock, empty: "No similar historical events found" },
        netflow: { label: "Netflow", items: netflow, icon: Network, empty: "No anomalous network flows detected" },
    };

    const activeData = content[activeTab];

    return (
        <div className="space-y-4">
            {/* Custom Tab List */}
            <div className="grid w-full grid-cols-5 p-1 bg-secondary/50 rounded-lg">
                {Object.keys(content).map((key) => {
                    const item = content[key];
                    const Icon = item.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                                activeTab === key
                                    ? "bg-background shadow-sm text-primary"
                                    : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="capitalize text-xs">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <Card className="mt-4 border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    {activeData && (activeData.items.length > 0 ? (
                        <EvidenceList items={activeData.items} icon={activeData.icon} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg bg-card/50">
                            <activeData.icon className="h-12 w-12 mb-3 opacity-20" />
                            <p>{activeData.empty}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function EvidenceList({ items, icon: Icon }: { items: DataEvidence[], icon: any }) {
    return (
        <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <Card key={idx} className="overflow-hidden">
                        <div className="px-4 py-3 bg-secondary/30 border-b border-border flex justify-between items-center">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Icon className="h-4 w-4 text-primary" />
                                {item.source}
                            </h4>
                            <Badge variant="outline" className="bg-background">{item.relevance}% Relevance</Badge>
                        </div>
                        <CardContent className="p-4 gap-2 flex flex-col">
                            {item.samples.map((sample, sIdx) => (
                                <div key={sIdx} className="font-mono text-xs p-2 bg-muted/50 rounded border border-border/50 break-all">
                                    {sample}
                                </div>
                            ))}
                            <div className="flex justify-end mt-2">
                                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
                                    <Search className="h-3 w-3" /> View Raw Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
}
