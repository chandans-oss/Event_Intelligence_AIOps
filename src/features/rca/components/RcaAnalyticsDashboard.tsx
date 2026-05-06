import { useState } from 'react';
import {
  Brain, Zap, AlertTriangle, ArrowRight, Activity,
  Database, GitBranch, Target, BarChart2, ShieldAlert,
  ArrowLeft, X, Wrench, Cpu, BrainCircuit
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
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950/20">
      {/* Probable Root Causes Section */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight font-sans">Probable Root Causes</h2>
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

        {/* Main Hypothesis Card */}
        <div className="max-w-4xl">
          <MainHypothesisCard
            cause={mainCause}
            remedyTitle={data.remedyTitle}
            isSelected={selectedCauseIndex === 0}
            onClick={() => setSelectedCauseIndex(0)}
            onRemediate={(e) => handleRemediate(e, 0)}
          />
        </div>

        {/* Alternative Possibilities */}
        {alternativeCauses.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-sans px-1">Alternative Possibilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternativeCauses.map((cause, idx) => (
                <AlternativeHypothesisCard
                  key={cause.id}
                  cause={cause}
                  isSelected={selectedCauseIndex === idx + 1}
                  onClick={() => setSelectedCauseIndex(idx + 1)}
                  onRemediate={(e) => handleRemediate(e, idx + 1)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation Section */}
        <div className="bg-transparent border-b border-slate-200 dark:border-border/50 pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-12 w-full bg-transparent p-0 flex items-center justify-start gap-0">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "relative h-12 px-6 flex items-center justify-center gap-2.5 rounded-none border-b-2 border-transparent bg-transparent transition-all duration-300 text-slate-500",
                    "data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:bg-white/50 dark:data-[state=active]:bg-white/5",
                    "hover:text-slate-800 dark:hover:text-foreground/80"
                  )}
                >
                  <tab.icon className={cn(
                    "h-3.5 w-3.5",
                    activeTab === tab.id ? "opacity-100" : "opacity-50"
                  )} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border shadow-sm rounded-xl overflow-hidden min-h-[400px]">
          <div className="p-6">
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
  remedyTitle?: string;
  isSelected: boolean;
  onClick: () => void;
  onRemediate: (e: React.MouseEvent) => void;
}

function MainHypothesisCard({ cause, remedyTitle, isSelected, onClick, onRemediate }: MainHypothesisCardProps) {
  const percentage = Math.round(cause.confidence * 100);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden transition-all cursor-pointer border-2 shadow-lg rounded-2xl p-6",
        isSelected
          ? "border-blue-500 bg-white dark:bg-slate-900 ring-2 ring-blue-500/5"
          : "border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-card/50 hover:border-slate-200 shadow-sm"
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
                {cause.title}
              </h1>
              {percentage > 80 && (
                <Badge className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                  <Zap className="h-2.5 w-2.5 fill-blue-600" /> AI High Confidence
                </Badge>
              )}
            </div>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
              {cause.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-24">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Signature Strength</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{cause.confidence.toFixed(2)}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 flex items-center gap-4 h-24">
            <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-0.5">Occurrences</span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">{cause.occurrenceCount || 1}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onRemediate}
          className="w-full h-14 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
             Execute AI Remediation
          </div>
          {remedyTitle && (
            <span className="text-[10px] font-medium opacity-80">(Recommended: {remedyTitle})</span>
          )}
        </Button>
      </div>
    </Card>
  );
}

interface AlternativeHypothesisCardProps {
  cause: ProbableCause;
  isSelected: boolean;
  onClick: () => void;
  onRemediate: (e: React.MouseEvent) => void;
}

function AlternativeHypothesisCard({ cause, isSelected, onClick, onRemediate }: AlternativeHypothesisCardProps) {
  const percentage = Math.round(cause.confidence * 100);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden transition-all cursor-pointer border shadow-sm rounded-xl flex flex-col",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/5 bg-white dark:bg-slate-900"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-card hover:border-slate-300 hover:shadow-md"
      )}
    >
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-blue-600 transition-colors pr-2 flex-1">
            {cause.title}
          </h4>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-tighter mb-0.5">{percentage}%</span>
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 block uppercase tracking-widest">Match</span>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 font-medium">
          {cause.description}
        </p>

        <div className="mt-auto pt-3 border-t border-slate-50 dark:border-slate-800/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onRemediate}
            className="w-full h-9 text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:border-slate-700 rounded-lg transition-all"
          >
            Remediate
          </Button>
        </div>
      </div>
    </Card>
  );
}
