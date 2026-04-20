import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Cluster } from '@/shared/types';
import { getClusterData } from '@/features/rca/data/clusterData';

// Import new RCA components
import { RCASummary } from '@/features/rca/components/RcaSummary';
import { RCACorrelatedEvents } from '@/features/rca/components/RcaCorrelatedEvents';
import { RCADataEvidence } from '@/features/rca/components/RcaDataEvidence';
import { RCAImpactMap } from '@/features/rca/components/RcaImpactMap';
import { RCADiagnosisPath } from '@/features/rca/components/RcaDiagnosisPath';
import { RCARemediation } from '@/features/rca/components/RcaRemediation';
import { RCAAnalytics } from '@/features/rca/components/RcaAnalytics';

interface RCASidebarProps {
  cluster: Cluster;
  selectedCauseId?: string | null;
  onClose: () => void;
  onOpenRemediation?: () => void;
  onBack?: () => void;
}

export function RCASidebar({ cluster, selectedCauseId, onClose, onOpenRemediation, onBack }: RCASidebarProps) {
  const [currentTab, setCurrentTab] = useState('summary');
  const navigate = useNavigate();

  if (!cluster || !cluster.id) return null;

  // Get cluster-specific data based on selected cause ID or fallback to cluster ID
  const dataKey = selectedCauseId || cluster.id;
  const clusterData = getClusterData(dataKey) || getClusterData(cluster.id);

  if (!clusterData) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[85%] max-w-[1200px] bg-background border-l border-border shadow-2xl z-50 animate-slide-in-right flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack || onClose} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-px bg-border" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Root Cause Analysis</h2>
            <p className="text-[15px] text-muted-foreground font-mono">{cluster.id} • {clusterData.rcaMetadata.rootEventType.replace(/_/g, ' ')}</p>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {/* Meta Data & Summary Section */}
        <div className="p-4 bg-card/30 backdrop-blur border-b border-border space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Incident Meta Data */}
            <div className="lg:col-span-1 space-y-4 border-r border-border/50 pr-4">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">Incident Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Event ID</span>
                  <span className="text-[13px] font-mono font-medium text-foreground">{cluster.id}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Detect Time</span>
                  <span className="text-[13px] font-mono font-medium text-foreground">{new Date(clusterData.rcaMetadata.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Severity</span>
                  <Badge variant={clusterData.rcaMetadata.severity === 'Critical' ? 'destructive' : 'default'} className="uppercase text-[9px] h-4">
                    {clusterData.rcaMetadata.severity}
                  </Badge>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Confidence</span>
                  <span className="text-[13px] font-mono font-medium text-primary">{(cluster.rca?.confidence || 0.95) * 100}%</span>
                </div>
              </div>
            </div>

            {/* Column 2: Issue Summary & Remediation (Combined) */}
            <div className="lg:col-span-2 flex flex-col justify-between pl-2">
              <div>
                <h4 className="text-[17px] font-bold text-foreground mb-1">{clusterData.remedyTitle || 'Apply Strategic Remediation'}</h4>
                <p className="text-[13px] text-muted-foreground leading-relaxed max-w-2xl">
                  <span className="font-semibold text-foreground">Diagnosis:</span> {clusterData.rcaSummary}
                  <br />
                  <span className="font-semibold text-foreground mt-1 inline-block">Action:</span> {clusterData.remediationSteps?.[0]?.description || 'Initiate standard recovery protocols.'}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-end">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20" onClick={onOpenRemediation}>
                  <div className="flex items-center gap-2">
                    <span>Initiate Remediation</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="p-4 pt-2">
          <div className="border-b border-border bg-background sticky top-0 z-10 -mx-4 px-4 mb-4">
            <TabsList className="h-12 w-full grid grid-cols-5 bg-transparent p-0">
              <TabsTrigger value="summary" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2 text-[13px]">RCA Summary</TabsTrigger>
              <TabsTrigger value="correlated" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2 text-[13px]">Correlated Events</TabsTrigger>
              <TabsTrigger value="impact" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2 text-[13px]">Impact Analysis</TabsTrigger>
              <TabsTrigger value="evidence" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2 text-[13px]">Data Evidence</TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none border-b-2 border-transparent px-4 py-2 text-[13px]">Event Analytics</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="summary" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
            <RCASummary
              data={clusterData}
              confidence={cluster.rca?.confidence || 0.95}
              onViewDetailedRCA={() => navigate(`/rca/detail/${cluster.id}`)}
            />
          </TabsContent>

          <TabsContent value="correlated" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
            <RCACorrelatedEvents data={clusterData} />
          </TabsContent>

          <TabsContent value="impact" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
            <RCAImpactMap data={clusterData} />
          </TabsContent>

          <TabsContent value="evidence" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
            <RCADataEvidence data={clusterData} />
          </TabsContent>

          <TabsContent value="analytics" className="m-0 focus-visible:ring-0 animate-fade-in space-y-4">
            <RCAAnalytics data={clusterData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
