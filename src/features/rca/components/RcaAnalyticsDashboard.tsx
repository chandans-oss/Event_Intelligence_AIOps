import { useState } from 'react';
import {
  Brain, Zap, AlertTriangle, ArrowRight, Activity,
  Database, GitBranch, Target, BarChart2, ShieldAlert,
  ArrowLeft, X, Wrench, Cpu, BrainCircuit, Clock
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
  const mainCause = causes[0];
  const alternativeCauses = causes.slice(1);
  const selectedCause = causes[selectedCauseIndex] || causes[0];

  const tabs = [
    { id: 'summary', label: 'RCA Summary', icon: Target },
    { id: 'evidence', label: 'Data Evidence', icon: Database },
    { id: 'events', label: 'Correlated Events', icon: GitBranch },
    { id: 'impact', label: 'Impact Map', icon: Zap },
    { id: 'analytics', label: 'RCA Analytics', icon: BarChart2 },
  ];

  const handleRemediate = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSelectedCauseIndex(index);
    setIsRemediationOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      <div className="p-4 pb-0">
        <IncidentLifecycle data={data} />
      </div>

      {/* Probable Root Causes Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Cpu className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-[15px] font-bold text-foreground tracking-tight font-sans">Probable Root Causes</h2>
          </div>

          <Button
            onClick={onViewDetailedRCA}
            className="h-9 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>RCA Analysis Flow</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-row gap-6 items-start">
          {/* Left: Main Selected Cause Details */}
          <div className="flex-[2.5] h-full min-h-[300px]">
            <MainHypothesisCard
              cause={selectedCause}
              index={selectedCauseIndex}
              remedyTitle={data.remedyTitle}
              onRemediate={(e) => handleRemediate(e, selectedCauseIndex)}
            />
          </div>

          {/* Right: Scrollable Cause Sidebar */}
          <div className="flex-[1] h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Root Causes</h3>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-slate-800">{causes.length} Found</Badge>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {causes.map((cause, idx) => (
                <AlternativeHypothesisCard
                  key={cause.id}
                  cause={cause}
                  index={idx}
                  isSelected={selectedCauseIndex === idx}
                  onClick={() => setSelectedCauseIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-6">
          {/* Bottom Diagnostics Tabs */}
          <div className="flex-1">
            {/* Tab Navigation Section */}
            <div className="bg-transparent border-b border-slate-200 dark:border-border/50">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="h-10 w-full bg-transparent p-0 flex items-center justify-start gap-0">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "relative h-10 px-5 flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent bg-transparent transition-all",
                        "text-muted-foreground hover:text-foreground",
                        "data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold"
                      )}
                    >
                      <tab.icon className={cn(
                        "h-3.5 w-3.5",
                        activeTab === tab.id ? "opacity-100" : "opacity-70"
                      )} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Tab Content */}
            <div className="bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm rounded-xl overflow-hidden min-h-[300px] mt-1">
              <div className="p-4">
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
                  />
                )}
                {activeTab === 'evidence' && <RCADataEvidence data={data} />}
                {activeTab === 'events' && <RCACorrelatedEvents data={data} />}
                {activeTab === 'impact' && <RCAImpactMap data={data} />}
                {activeTab === 'analytics' && <RCAAnalytics data={data} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Remediation Sidebar Overlay */}
      {isRemediationOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] animate-in fade-in duration-300"
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

interface MainHypothesisCardProps {
  cause: ProbableCause;
  index: number;
  remedyTitle?: string;
  onRemediate: (e: React.MouseEvent) => void;
}

function MainHypothesisCard({ cause, index, remedyTitle, onRemediate }: MainHypothesisCardProps) {
  const percentage = Math.round(cause.confidence * 100);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getConfidenceTag = (idx: number) => {
    switch (idx) {
      case 0: return { label: 'AI High Confidence', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 1: return { label: 'AI Medium Confidence', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
      default: return { label: 'AI Low Confidence', color: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const tag = getConfidenceTag(index);

  return (
    <Card className="relative overflow-hidden h-full border-2 shadow-lg rounded-2xl p-5 bg-card border-primary/10">
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold tracking-tight text-foreground font-sans pr-4">
              {cause.title}
            </h1>
            <Badge variant="outline" className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm whitespace-nowrap", tag.color)}>
              <Zap className="h-2.5 w-2.5 fill-current" /> {tag.label}
            </Badge>
          </div>

          <div className="flex items-center gap-8 py-2">
            <div className="flex-[2]">
              <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
                {cause.description}
              </p>
            </div>

            {/* SVG Circular Progress Display */}
            <div className="flex-[1] flex flex-col items-center justify-center gap-2">
              <div className="relative h-24 w-24 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/30"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-2xl font-black text-foreground">{percentage}%</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confidence Score</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onRemediate}
          className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          Remediation <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

interface AlternativeHypothesisCardProps {
  cause: ProbableCause;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

function AlternativeHypothesisCard({ cause, index, isSelected, onClick }: AlternativeHypothesisCardProps) {
  const percentage = Math.round(cause.confidence * 100);

  const getConfidenceTag = (idx: number) => {
    switch (idx) {
      case 0: return { label: 'HIGH', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 1: return { label: 'MEDIUM', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
      default: return { label: 'LOW', color: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const tag = getConfidenceTag(index);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all cursor-pointer border shadow-sm rounded-xl flex flex-col p-3",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/10"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <h4 className="text-[11px] font-bold text-foreground leading-tight pr-2 line-clamp-2">
            {cause.title}
          </h4>
          <Badge className={cn("px-1.5 py-0 rounded text-[8px] font-black uppercase tracking-tighter whitespace-nowrap", tag.color)}>
            {tag.label}
          </Badge>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5 w-full mr-4">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{percentage}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function IncidentLifecycle({ data }: { data: ClusterSpecificData }) {
  const steps = [
    { label: 'Issue Started', time: '14:00:00', color: 'bg-slate-400', bgColor: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Detection', time: '+2m 15s', color: 'bg-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'RCA Done', time: '+30s', color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Resolution', time: '14:45:00', color: 'bg-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', pulse: true },
  ];

  return (
    <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 border-b border-border/50">
        <h3 className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary" /> Incident Life cycle
        </h3>
      </div>
      <CardContent className="p-4 py-6">
        <div className="relative flex items-center justify-between px-16">
          {/* Connecting Line */}
          <div className="absolute top-[12px] left-16 right-16 h-[2px] bg-slate-100 dark:bg-slate-800" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center gap-2 z-10">
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm",
                step.bgColor
              )}>
                <div className={cn("h-2 w-2 rounded-full", step.color, step.pulse && "animate-pulse")} />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-bold text-foreground whitespace-nowrap">{step.label}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
