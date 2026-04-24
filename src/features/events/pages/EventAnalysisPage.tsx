import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, X, ShieldAlert, Clock, Database, Globe,
  Eye, Search, Download, MessageSquare, ExternalLink,
  Cpu, HardDrive, Activity, AlertCircle, Info, CheckCircle2,
  Ticket, LayoutDashboard, Workflow, GitBranch, Target, ShieldCheck,
  ChevronRight, BookOpen, Zap, MoreHorizontal, ExternalLink as ExternalLinkIcon,
  Calendar, MoreVertical, List, ChevronDown, ChevronUp, Router,
  BrainCircuit
} from 'lucide-react';
import { AreaChart as AreaChartIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { sampleNetworkEvents, NetworkEvent } from '@/features/events/data/eventsData';
import { cn } from '@/shared/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import RCADetailPage from '@/features/rca/pages/RcaDetailPage';
import { getClusterData } from '@/features/rca/data/clusterData';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { RcaAnalyticsDashboard } from '@/features/rca/components/RcaAnalyticsDashboard';
import { RcaFlowSidebar } from '@/features/rca/components/RcaFlowSidebar';

// Mock data for the statistics
const availabilityData = [
  { time: '00:00', value: 1.0 },
  { time: '04:00', value: 0.98 },
  { time: '08:00', value: 0.95 },
  { time: '12:00', value: 0.99 },
  { time: '16:00', value: 0.97 },
  { time: '20:00', value: 1.0 },
  { time: '23:59', value: 1.0 },
];

const operationalData = [
  { time: '00:00', value: 4 },
  { time: '04:00', value: 4 },
  { time: '08:00', value: 3 },
  { time: '12:00', value: 4 },
  { time: '16:00', value: 4 },
  { time: '20:00', value: 4 },
  { time: '23:59', value: 4 },
];

export default function EventAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMainTab, setActiveMainTab] = useState<'details' | 'aiops'>('details');
  const [isRcaFlowSidebarOpen, setIsRcaFlowSidebarOpen] = useState(false);
  
  const handleViewDetailedRCA = useCallback(() => {
    setIsRcaFlowSidebarOpen(true);
  }, []);

  // Find the event from sample data or location state
  const event = useMemo(() => {
    return (location.state as any)?.event || sampleNetworkEvents.find(e => e.event_id === id);
  }, [id, location.state]);

  const deviceEventsCount = useMemo(() => {
    if (!event) return 0;
    return sampleNetworkEvents.filter(e => e.device === event.device && e.severity === 'Critical').length;
  }, [event]);


  const clusterData = useMemo(() => {
    if (!event) return undefined;
    return getClusterData(event.clusterId || event.event_id);
  }, [event]);

  if (!event) {
    return (
      <MainLayout>
        <div className="p-12 text-center">
          <p className="text-muted-foreground">Event not found</p>
          <Button onClick={() => navigate('/events')} className="mt-4">Back to Events</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden text-foreground">
        {/* Navigation Tabs */}
        <div className="bg-card px-6 border-b border-border flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveMainTab('details')}
              className={cn(
                "py-3 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-2",
                activeMainTab === 'details' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Info className="h-4 w-4" />
              Event Details
            </button>

            <button
              onClick={() => {
                setActiveMainTab('aiops');
                setIsRcaFlowSidebarOpen(false);
              }}
              className={cn(
                "py-3 text-[13px] font-bold border-b-2 transition-colors flex items-center gap-2",
                activeMainTab === 'aiops' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <BrainCircuit className="h-4 w-4" />
              AI Analytics
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-bold text-[10px] h-6 px-3">
              Details View
            </Badge>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/events')} className="h-7 w-7 text-muted-foreground hover:bg-muted">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-sm font-bold flex items-center gap-2">
                Event Detail
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-[10px] h-5 px-1.5 font-mono">
                  {event.device}
                </Badge>
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-[10px] h-5 px-1.5 font-mono">
                  {event.event_id}
                </Badge>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/events')} className="h-7 w-7 text-muted-foreground/50 hover:bg-muted">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">
                  {event.description}
                </h2>
                <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-bold uppercase h-4 px-1.5">
                  {event.severity}
                </Badge>
                <span className="text-[12px] text-muted-foreground ml-4">{event.timestamp}</span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Source : <span className="text-foreground font-medium">{event.source || 'State Change'}</span>
              </p>
              <div className="flex items-center gap-2 text-red-500 mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[12px] font-bold">
                  Alarm Probable Cause : <span className="font-normal text-muted-foreground">{event.classificationReason?.description || event.message}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-orange-500/5 border border-orange-500/20 rounded px-4 py-2 min-w-[180px]">
                <p className="text-[10px] font-bold uppercase text-orange-500 mb-1">Alarm Metric</p>
                <p className="text-[12px] font-bold text-orange-600 dark:text-orange-400 capitalize">{event.metric.replace(/_/g, ' ')}</p>
              </div>
              <div className="bg-orange-500/5 border border-orange-500/20 rounded px-4 py-2 min-w-[120px]">
                <p className="text-[10px] font-bold uppercase text-orange-500 mb-1">Alert Value</p>
                <p className="text-[12px] font-bold text-orange-600 dark:text-orange-400">{event.value} {event.metric === 'utilization' || event.metric === 'heap_usage' ? '%' : ''}</p>
              </div>
              <div className="bg-orange-500/5 border border-orange-500/20 rounded px-4 py-2 min-w-[120px]">
                <p className="text-[10px] font-bold uppercase text-orange-500 mb-1">Current Value</p>
                <p className="text-[12px] font-bold text-orange-600 dark:text-orange-400">{event.value} {event.metric === 'utilization' || event.metric === 'heap_usage' ? '%' : ''}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-2.5 border-b border-border bg-card flex items-center gap-4">
          <Button variant="outline" size="sm" className="h-9 border-border text-primary font-bold gap-2 hover:bg-muted text-xs px-4 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Acknowledge
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-border text-primary font-bold gap-2 hover:bg-muted text-xs px-4 shadow-sm">
            <Search className="h-4 w-4 text-primary" /> Diagnose
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-border text-primary font-bold gap-2 hover:bg-muted text-xs px-4 shadow-sm">
            <Ticket className="h-4 w-4 text-primary" /> TKT3335
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-border text-primary font-bold gap-2 hover:bg-muted text-xs px-4 shadow-sm">
            <X className="h-4 w-4 text-primary" /> Clear Event
          </Button>
          <Button variant="outline" size="sm" className="h-9 border-border text-primary font-bold gap-2 hover:bg-muted text-xs px-4 shadow-sm">
            <List className="h-4 w-4 text-primary" /> View Activity Log
          </Button>
        </div>


        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {activeMainTab === 'details' ? (
            <div className="space-y-6 max-w-[1600px] mx-auto">
              {/* Row 1: Asset Details & Recent Events */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="py-3 px-6 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-[13px] font-bold">Asset Details</CardTitle>
                    <Button variant="link" className="h-auto p-0 text-[12px] text-primary flex items-center gap-1.5 font-bold hover:no-underline">
                      More Details <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted px-3 py-1.5 rounded-lg flex items-center gap-2 border border-border shadow-sm">
                        <Globe className="h-4 w-4 text-primary" />
                        <span className="text-[12px] font-bold">{event.assetDetails?.ip || '192.168.1.1'}</span>
                      </div>
                      <div className="bg-muted px-3 py-1.5 rounded-lg flex items-center gap-2 border border-border shadow-sm">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[12px] font-bold">{event.assetDetails?.os || 'Linux'}</span>
                      </div>
                      <div className="bg-muted px-3 py-1.5 rounded-lg flex items-center gap-2 border border-border shadow-sm">
                        <Router className="h-4 w-4 text-muted-foreground" />
                        <span className="text-[12px] font-bold">{event.assetDetails?.type || 'Device'}</span>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 ml-1" />
                      </div>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">
                      {event.assetDetails?.summary || 'Standard asset metadata. Technical specifications and historical deployment logs are available via the administrative CMDB interface.'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                  <CardHeader className="py-3 px-6 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-[13px] font-bold">Recent Events</CardTitle>
                    <div className="flex items-center gap-2 cursor-pointer group">
                      <span className="text-[12px] text-primary font-bold">Current Week</span>
                      <ChevronDown className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg border border-border">
                      <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-sm">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <span className="text-sm font-bold">{deviceEventsCount} Critical</span>
                    </div>

                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Ticket Details */}
              <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="py-3 px-6 border-b border-border/50 flex flex-row items-center justify-between">
                  <CardTitle className="text-[13px] font-bold">Ticket details</CardTitle>
                  <Button variant="link" className="h-auto p-0 text-[12px] text-primary flex items-center gap-1.5 font-bold hover:no-underline">
                    More Details <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-2 flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-[13px] font-bold text-blue-600 dark:text-blue-400">TKT3335</span>
                  </div>
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg px-4 py-2 flex items-center gap-3">
                    <span className="text-[12px] font-bold text-orange-600 dark:text-orange-400">Priority : Medium</span>
                  </div>
                </CardContent>
              </Card>

              {/* Row 3: Statistics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold">Statistics</h3>
                  <Button variant="link" className="h-auto p-0 text-[12px] text-primary flex items-center gap-1.5 font-bold hover:no-underline">
                    Hide Details <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="py-3 px-6 border-b border-border/30 bg-muted/30">
                      <CardTitle className="text-[12px] font-medium text-muted-foreground">Network Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={event.availabilityStats || availabilityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" hide />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: '#94a3b8' }}
                              domain={[0, 1.2]}
                              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                              unit=" %"
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px' }}
                              itemStyle={{ color: '#f97316' }}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#f97316"
                              fill="#f97316"
                              fillOpacity={0.1}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="py-3 px-6 border-b border-border/30 bg-muted/30">
                      <CardTitle className="text-[12px] font-medium text-muted-foreground">Operational Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={event.operationalStats || operationalData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" hide />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fill: '#94a3b8' }}
                              domain={[0, 5]}
                              ticks={[0, 1, 2, 3, 4, 5]}
                            />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px' }}
                              itemStyle={{ color: '#f97316' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#f97316"
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
                              activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            /* AIOps Analytics Content */
            <div className="bg-card rounded-xl border border-border shadow-lg min-h-full overflow-hidden flex flex-col">
              {clusterData ? (
                <RcaAnalyticsDashboard
                  data={clusterData}
                  onViewDetailedRCA={handleViewDetailedRCA}
                />
              ) : (
                <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                  <Target className="h-16 w-16 text-muted-foreground/20 mb-4" />
                  <p className="text-sm font-bold text-foreground">RCA is NOT Provided for this event by the AIOps engine</p>
                  <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">This event is not part of an AI-detected root cause cluster.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RCA Flow Sidebar */}
        <RcaFlowSidebar
          isOpen={isRcaFlowSidebarOpen}
          onClose={() => setIsRcaFlowSidebarOpen(false)}
          eventId={event.clusterId || event.event_id}
        />
      </div>

    </MainLayout>
  );
}
