import { useState } from 'react';
import {
  Brain, Zap, AlertTriangle, ArrowRight, Activity,
  Database, GitBranch, Target, BarChart2, ShieldAlert,
  ArrowLeft, X, Wrench
} from 'lucide-react';
import { ClusterSpecificData, getProbableCauses, ProbableCause } from '@/features/rca/data/clusterData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';
import { RCASummary } from './RcaSummary';
import { RCADataEvidence } from './RcaDataEvidence';
import { RCACorrelatedEvents } from './RcaCorrelatedEvents';
import { RCAImpactMap } from './RcaImpactMap';
import { RCAAnalytics } from './RcaAnalytics';
import { RemediationSidebar } from './RemediationSidebar';
import { RCARemediation } from './RcaRemediation';

interface RcaAnalyticsDashboardProps {
  data: ClusterSpecificData;
  onViewDetailedRCA: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function RcaAnalyticsDashboard({ data, onViewDetailedRCA, onBack, onClose }: RcaAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedCauseIndex, setSelectedCauseIndex] = useState(0);
  const [isRemediationOpen, setIsRemediationOpen] = useState(false);

  const causes = getProbableCauses(data.clusterId);
  const selectedCause = causes[selectedCauseIndex] || causes[0];

  const tabs = [
    { id: 'summary', label: 'RCA Summary', icon: Target },
    { id: 'evidence', label: 'Data Evidence', icon: Database },
    { id: 'events', label: 'Correlated Events', icon: GitBranch },
    { id: 'impact', label: 'Impact Map', icon: Zap },
    { id: 'analytics', label: 'RCA Analytics', icon: BarChart2 },
  ];

  const handleRemediate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemediationOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/20">
      {/* Top Header Section */}
      <div className="px-6 py-4 border-b border-border/50 bg-background/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1 text-xs font-bold">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Probable Root Causes</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground font-mono">{data.clusterId}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1 text-xs font-bold">
                Close <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Hypothesis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          {causes.map((cause, idx) => (
            <HypothesisCard
              key={cause.id}
              cause={cause}
              index={idx + 1}
              isSelected={selectedCauseIndex === idx}
              onClick={() => setSelectedCauseIndex(idx)}
              onRemediate={handleRemediate}
            />
          ))}
        </div>
      </div>

      {/* Tab Navigation Section */}
      <div className="px-6 bg-background/50 border-b border-border/50 sticky top-0 z-40 backdrop-blur-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="h-14 w-full bg-transparent p-0 flex items-center justify-between gap-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "relative h-14 px-4 flex-1 flex items-center justify-center gap-2.5 rounded-none border-b-2 border-transparent bg-transparent transition-all duration-300",
                  "data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary",
                  "hover:text-foreground/80 hover:bg-muted/30"
                )}
              >
                <tab.icon className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  activeTab === tab.id ? "scale-110" : "opacity-70"
                )} />
                <span className="text-[13px] font-bold">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'summary' && (
            <RCASummary
              data={{
                ...data,
                rcaSummary: selectedCause.description,
                rcaMetadata: {
                  ...data.rcaMetadata,
                  severity: selectedCause.severity
                }
              }}
              confidence={selectedCause.confidence}
              onViewDetailedRCA={onViewDetailedRCA}
            />
          )}
          {activeTab === 'evidence' && <RCADataEvidence data={data} />}
          {activeTab === 'events' && <RCACorrelatedEvents data={data} />}
          {activeTab === 'impact' && <RCAImpactMap data={data} />}
          {activeTab === 'analytics' && <RCAAnalytics data={data} />}
        </div>
      </div>

      {/* Sliding Remediation Sidebar Overlay */}
      {isRemediationOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
            onClick={() => setIsRemediationOpen(false)}
          />
          <RemediationSidebar
            cluster={data}
            causeId={selectedCause.id}
            onClose={() => setIsRemediationOpen(false)}
            isEmbedded={false}
          />
        </>
      )}
    </div>
  );
}

interface HypothesisCardProps {
  cause: ProbableCause;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onRemediate: (e: React.MouseEvent) => void;
}

function HypothesisCard({ cause, index, isSelected, onClick, onRemediate }: HypothesisCardProps) {
  const percentage = Math.round(cause.confidence * 100);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition-all hover:ring-1 hover:ring-primary/30 cursor-pointer",
        isSelected ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "bg-card/50"
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="outline" className={cn(
            "text-[10px] font-black bg-muted/50",
            isSelected && "border-primary/50 text-primary"
          )}>
            #{index} - {percentage > 80 ? 'High' : percentage > 50 ? 'Medium' : 'Low'} Confidence
          </Badge>
          <div className="relative h-10 w-10">
            <svg className="h-full w-full" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none"
                className={cn(
                  "transition-all duration-1000",
                  percentage > 80 ? "stroke-emerald-500" : percentage > 50 ? "stroke-orange-500" : "stroke-blue-500"
                )}
                strokeWidth="3"
                strokeDasharray={`${percentage}, 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
              <text x="18" y="21" className="text-[8px] font-bold" textAnchor="middle" fill="currentColor">{percentage}%</text>
            </svg>
          </div>
        </div>
        <CardTitle className="text-sm font-black mt-2 leading-tight">
          {cause.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
          {cause.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            {cause.occurrenceCount && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                <Activity className="h-3 w-3" />
                {cause.occurrenceCount} Occurrences
              </div>
            )}
            <Badge className={cn(
              "text-[9px] font-black h-4 px-1.5",
              cause.severity === 'Critical' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-orange-500/10 text-orange-500 border-orange-500/20"
            )}>
              {cause.severity}
            </Badge>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRemediate}
            className="h-7 px-2 text-[10px] font-bold text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 gap-1"
          >
            <ShieldAlert className="h-3 w-3" />
            Remediate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
