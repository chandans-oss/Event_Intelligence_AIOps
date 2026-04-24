import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Filter, Calendar, Sparkles, Pause, LayoutGrid, LayoutList, 
  Settings, Download, MessageSquare, Database, Globe, Eye, 
  ChevronLeft, ChevronRight, MoreHorizontal, Info, AlertCircle, 
  ArrowUpCircle, AlertTriangle, HelpCircle, Sun, Moon, Target, GitBranch, Copy, BellOff,
  Clock, X, ThumbsUp, Trash2, Menu, Ticket, Brain, Activity
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/shared/components/ui/tooltip';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { RCASidebar } from '@/features/rca/components/RcaSidebar';
import { ImpactSidebar } from '@/features/impact/components/ImpactSidebar';
import { ProbableCauseSidebar } from '@/features/rca/components/ProbableCauseSidebar';
import { RemediationSidebar } from '@/features/rca/components/RemediationSidebar';
import { sampleNetworkEvents, getEventStats, NetworkEvent } from '@/features/events/data/eventsData';
import { mockClusters } from '@/data/mock/mockData';
import { cn } from '@/shared/lib/utils';
import { useToast } from '@/shared/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type SidebarType = 'rca' | 'impact' | 'remediation' | 'probable-cause' | null;

const ITEMS_PER_PAGE = 10;

export default function Events() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [secondaryActiveTab, setSecondaryActiveTab] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const [selectedEvent, setSelectedEvent] = useState<NetworkEvent | null>(null);
  const [activeSidebar, setActiveSidebar] = useState<SidebarType>(null);
  const [selectedCauseId, setSelectedCauseId] = useState<string | null>(null);

  const stats = useMemo(() => getEventStats(sampleNetworkEvents), []);

  const categoryGroups = [
    {
      id: 'severity',
      name: 'Severity',
      icon: AlertCircle,
      filters: [
        { label: 'Critical', value: 'Critical', count: stats.severityCounts.Critical, icon: AlertCircle, color: 'text-red-500' },
        { label: 'Major', value: 'Major', count: stats.severityCounts.Major, icon: ArrowUpCircle, color: 'text-orange-500' },
        { label: 'Minor', value: 'Minor', count: stats.severityCounts.Minor, icon: AlertTriangle, color: 'text-amber-500' },
      ]
    },
    {
      id: 'status',
      name: 'Status/Service',
      icon: Ticket,
      filters: [
        { label: 'Acknowledged', value: 'Acknowledged', count: stats.statusCounts.Acknowledged, icon: ThumbsUp, color: 'text-blue-500' },
        { label: 'Ticketed', value: 'Ticketed', count: stats.statusCounts.Ticketed, icon: Ticket, color: 'text-indigo-500' },
        { label: 'Business Service', value: 'BusinessService', count: stats.statusCounts.BusinessService, icon: LayoutGrid, color: 'text-emerald-500' },
      ]
    },
    {
      id: 'association',
      name: 'Association',
      icon: Target,
      filters: [
        { label: 'Root', value: 'Root', count: stats.associationCounts.Root, icon: Target, color: 'text-violet-500' },
        { label: 'Priority', value: 'Priority', count: stats.associationCounts.Priority, icon: Sparkles, color: 'text-amber-400' },
        { label: 'Associated', value: 'Associated', count: stats.associationCounts.Associated, icon: GitBranch, color: 'text-blue-400' },
      ]
    },
    {
      id: 'sources',
      name: 'Sources',
      icon: Database,
      filters: [
        { label: 'Trap', value: 'Trap', count: stats.sourceCounts.Trap, icon: Globe, color: 'text-slate-400' },
        { label: 'Syslog', value: 'Syslog', count: stats.sourceCounts.Syslog, icon: MessageSquare, color: 'text-slate-400' },
        { label: 'Adaptive', value: 'Adaptive', count: stats.sourceCounts.Adaptive, icon: Activity, color: 'text-emerald-400' },
        { label: 'Seasonal', value: 'Seasonal', count: stats.sourceCounts.Seasonal, icon: Moon, color: 'text-indigo-400' },
        { label: 'NCCM', value: 'NCCM', count: stats.sourceCounts.NCCM, icon: Settings, color: 'text-blue-400' },
        { label: 'IPAM', value: 'IPAM', count: stats.sourceCounts.IPAM, icon: Database, color: 'text-cyan-400' },
      ]
    },
    {
      id: 'ai',
      name: 'AI Analytics',
      icon: Brain,
      filters: [
        { label: 'Only RCA', value: 'OnlyRCA', count: stats.aiCounts['Only RCA'], icon: Brain, color: 'text-purple-500' },
        { label: 'RCA with Remediation', value: 'RcaRemediation', count: stats.aiCounts['RCA with Remediation'], icon: Ticket, color: 'text-blue-500' },
        { label: 'RCA with Auto Remediation', value: 'RcaAuto', count: stats.aiCounts['RCA with Auto Remediation'], icon: Sparkles, color: 'text-emerald-500' },
        { label: 'RCA Not Found', value: 'RcaNotFound', count: stats.aiCounts['RCA Not Found'], icon: AlertCircle, color: 'text-rose-500' },
      ]
    }
  ];

  const filteredEvents = useMemo(() => {
    return sampleNetworkEvents.filter((event) => {
      // Main Filter Logic
      if (filterCategory) {
        // Severity
        if (['Critical', 'Major', 'Minor'].includes(filterCategory)) {
          if (event.severity !== filterCategory) return false;
        }
        // Status
        if (filterCategory === 'Acknowledged' && !event.isAcknowledged) return false;
        if (filterCategory === 'Ticketed' && !event.ticketId) return false;
        if (filterCategory === 'BusinessService' && !event.businessService) return false;
        // Association
        if (filterCategory === 'Root' && event.label !== 'Root') return false;
        if (filterCategory === 'Priority' && event.priority !== 'High') return false;
        if (filterCategory === 'Associated' && !event.clusterId) return false;
        // Sources
        if (['Trap', 'Syslog', 'Adaptive', 'Seasonal', 'NCCM', 'IPAM'].includes(filterCategory)) {
          if (event.source !== filterCategory) return false;
        }
        // AI
        if (filterCategory === 'OnlyRCA' && event.aiStatus !== 'Only RCA') return false;
        if (filterCategory === 'RcaRemediation' && event.aiStatus !== 'RCA with Remediation') return false;
        if (filterCategory === 'RcaAuto' && event.aiStatus !== 'RCA with Auto Remediation') return false;
        if (filterCategory === 'RcaNotFound' && event.aiStatus !== 'RCA Not Found') return false;
      }

      // History (Status) filter
      if (!showHistory && event.status === 'Resolved') return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.device.toLowerCase().includes(query) ||
          event.message.toLowerCase().includes(query) ||
          event.event_id.toLowerCase().includes(query) ||
          event.event_code.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [searchQuery, filterCategory, showHistory]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  const openSidebar = (type: SidebarType, event: NetworkEvent) => {
    setSelectedEvent(event);
    setActiveSidebar(type);
  };

  const closeSidebar = () => {
    setActiveSidebar(null);
    setSelectedEvent(null);
  };

  const currentCluster = useMemo(() => {
    if (!selectedEvent?.clusterId) return null;
    return mockClusters.find(c => c.id === selectedEvent.clusterId) || null;
  }, [selectedEvent]);

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-background overflow-hidden text-foreground">
        {/* Header Section - Controls Bar */}
        <div className="p-4 space-y-4 border-b border-border bg-card/50">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[300px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 bg-background border-border shadow-sm"
              />
              <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative min-w-[200px]">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="pl-10 pr-4 h-10 flex items-center justify-between bg-background border border-border rounded-md shadow-sm cursor-pointer hover:border-primary/50 transition-colors text-muted-foreground">
                <span className="text-sm">Select Date Range</span>
                <ChevronLeft className="h-4 w-4 rotate-270" />
              </div>
            </div>

            <div className="flex items-center gap-1 ml-auto">
              {[Sparkles, Pause].map((Icon, idx) => (
                <Button key={idx} variant="outline" size="icon" className="h-10 w-10 border-border text-primary hover:bg-primary/5">
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
              <div className="flex items-center bg-secondary/30 p-1 rounded-md border border-border ml-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><LayoutList className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm text-primary"><LayoutGrid className="h-4 w-4" /></Button>
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 border-border text-primary ml-2"><Settings className="h-4 w-4" /></Button>
              <div className="flex items-center gap-2 px-3 border-x border-border mx-2">
                <span className="text-xs font-medium text-muted-foreground">History</span>
                <Switch checked={showHistory} onCheckedChange={setShowHistory} />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 border-border text-primary"><Download className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-10 w-10 border-border text-primary"><MessageSquare className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-1 py-1">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setFilterCategory(null);
                        setExpandedCategories([]);
                      }}
                      className={cn(
                        "px-6 py-1.5 rounded-xl text-xs font-black transition-all shadow-lg h-10 min-w-[100px] flex flex-col items-center justify-center leading-tight",
                        !filterCategory
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                          : "bg-card text-muted-foreground hover:bg-accent border border-border"
                      )}
                    >
                      <span>All</span>
                      <span className="text-[10px] opacity-70">({stats.total})</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Show All Events</TooltipContent>
                </Tooltip>


                {categoryGroups.map((group, gIdx) => {
                  const isStatic = group.id === 'severity' || group.id === 'status';
                  const isExpanded = expandedCategories.includes(group.id) || isStatic;

                  const toggleCategory = () => {
                    setExpandedCategories(prev => 
                      prev.includes(group.id) 
                        ? prev.filter(c => c !== group.id) 
                        : [...prev, group.id]
                    );
                  };

                  return (
                    <div key={group.id} className="flex items-center">
                      <div className="h-6 w-[1px] bg-border mx-2" />
                      
                      <div className={cn(
                        "flex items-center gap-1 transition-all duration-500 ease-in-out bg-card/30 rounded-xl border border-border/50",
                        !isStatic && "overflow-hidden",
                        isExpanded ? "max-w-[1000px] px-1.5 py-0.5 z-10" : "max-w-[44px] z-0"
                      )}>
                        {/* Main Category Icon / Toggle - Only for non-static */}
                        {!isStatic && (
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={toggleCategory}
                                className={cn(
                                  "flex items-center justify-center h-9 w-9 min-w-[36px] rounded-lg transition-all",
                                  expandedCategories.includes(group.id) ? "bg-primary text-primary-foreground shadow-inner" : "hover:bg-accent text-muted-foreground"
                                )}
                              >
                                <group.icon className="h-5 w-5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="z-[100] p-0 overflow-hidden bg-background/95 backdrop-blur-md border-primary/20 shadow-2xl min-w-[180px] rounded-xl">
                              <div className="px-4 py-2.5 bg-primary/10 border-b border-primary/20">
                                <span className="text-[10px] font-black text-primary tracking-widest uppercase">{group.name}</span>
                              </div>
                              <div className="p-2 space-y-0.5">
                                {group.filters.map((f) => (
                                  <div key={f.label} className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-accent/50 transition-colors group/item">
                                    <f.icon className={cn("h-4 w-4 transition-transform group-hover/item:scale-110", f.color)} />
                                    <span className="text-[11px] font-bold text-foreground/80">{f.label}</span>
                                    <span className="ml-auto text-[10px] font-black text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                                      {f.count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}


                        {/* Filters */}
                        <div className={cn(
                          "flex items-center gap-1 transition-all duration-300",
                          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                        )}>
                          {group.filters.map((filter) => (
                            <Tooltip key={filter.label} delayDuration={0}>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setFilterCategory(filterCategory === filter.value ? null : filter.value)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all h-8 border",
                                    filterCategory === filter.value
                                      ? "border-primary/30 bg-primary/10 ring-1 ring-primary/10"
                                      : "text-muted-foreground border-transparent hover:bg-accent/50"
                                  )}
                                >
                                  <filter.icon className={cn("h-3.5 w-3.5", filter.color)} />
                                  <span className="opacity-80">({filter.count})</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="z-[100] font-bold">{filter.label}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </TooltipProvider>
          </div>
        </div>


        {/* Table Content */}
        <div className="flex-1 overflow-auto bg-background/50">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b border-border">
              <tr className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-border bg-background" /></th>
                <th className="px-4 py-3">Issue</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Alarm ID</th>
                <th className="px-4 py-3">Node</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3 text-right">Acknowledged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedEvents.map((event) => {
                // Determine icon based on message content
                const getIssueIcon = () => {
                  const msg = event.message.toLowerCase();
                  if (msg.includes('download')) return <Database className="h-5 w-5" />;
                  if (msg.includes('service')) return <LayoutGrid className="h-5 w-5" />;
                  if (msg.includes('link') || msg.includes('wifi')) return <ArrowUpCircle className="h-5 w-5 rotate-45" />; // wifi-like
                  return <Settings className="h-5 w-5" />;
                };

                return (
                  <tr 
                    key={event.event_id}
                    className={cn(
                      "group relative hover:bg-muted/50 transition-colors cursor-default border-b border-border/50",
                      hoveredRowId === event.event_id && "bg-muted/50",
                      event.status === 'Resolved' && "opacity-60"
                    )}
                    onMouseEnter={() => setHoveredRowId(event.event_id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    <td className="px-4 py-4 w-10">
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1",
                        event.severity === 'Critical' ? "bg-red-500" : 
                        event.severity === 'Major' ? "bg-orange-500" :
                        event.severity === 'Minor' ? "bg-yellow-500" : "bg-blue-400"
                      )} />
                      <input type="checkbox" className="rounded border-border bg-background" />
                    </td>
                    
                    {/* ISSUE COLUMN */}
                    <td className="px-4 py-4 w-[350px]">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground">
                          {getIssueIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{event.message}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate opacity-70">
                            {event.message.includes('threshold') ? 'Performance Threshold Breach' : 'Configuration Download Failed For Running.'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SEVERITY COLUMN */}
                    <td className="px-4 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <Badge className={cn(
                          "h-6 px-3 text-[10px] font-black uppercase border-none rounded shadow-sm flex items-center gap-1.5",
                          event.severity === 'Critical' ? "bg-red-500/10 text-red-500" : 
                          event.severity === 'Major' ? "bg-orange-500/10 text-orange-500" :
                          "bg-yellow-500/10 text-yellow-500"
                        )}>
                          {event.severity === 'Major' ? <ArrowUpCircle className="h-3 w-3" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                          {event.severity}
                        </Badge>
                        {event.clusterId && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
                            <Clock className="h-3 w-3" />
                            {Math.floor(Math.random() * 60)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* DATE COLUMN */}
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-foreground whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </td>

                    {/* ALARM ID COLUMN */}
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-muted-foreground">{event.event_id}</p>
                    </td>

                    {/* NODE COLUMN */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-bold text-foreground">{event.device}</p>
                          <p className="text-[11px] text-muted-foreground font-medium opacity-70">10.0.4.244</p>
                        </div>
                      </div>
                    </td>

                    {/* RESOURCE COLUMN */}
                    <td className="px-4 py-4">
                      <p className="text-xs font-bold text-foreground">{event.device}</p>
                    </td>

                    {/* ACTIONS / ACKNOWLEDGED COLUMN */}
                    <td className="px-4 py-4 relative text-right">
                      <div className={cn(
                        "flex items-center justify-end gap-2 transition-all duration-200",
                        hoveredRowId === event.event_id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"
                      )}>
                        <Button 
                          size="sm" 
                          className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6 shadow-lg rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/analysis/${event.event_id}`, { state: { event } });
                          }}
                        >
                          <div className="relative flex items-center justify-center">
                            <Info className="h-4 w-4" />
                            <div className="absolute inset-0 scale-150 border border-white/30 rounded-full" />
                          </div>
                          Analyse
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-card border-border text-primary shadow-sm hover:bg-accent rounded-lg">
                          <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-card border-border text-primary shadow-sm hover:bg-accent rounded-lg">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-card border-border text-primary shadow-sm hover:bg-accent rounded-lg">
                          <Ticket className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-card border-border text-destructive shadow-sm hover:bg-destructive/10 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-card border-border text-primary shadow-sm hover:bg-accent rounded-lg">
                          <Menu className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="p-3 border-t border-border bg-card/50 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Show</span>
            <select className="bg-background border border-border rounded px-1 py-0.5 h-7">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </div>

      {/* Sidebars */}
      {activeSidebar && selectedEvent && (
        <>
          <div
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          />

          {activeSidebar === 'rca' && currentCluster && (
            <RCASidebar
              cluster={currentCluster}
              selectedCauseId={selectedCauseId}
              onClose={closeSidebar}
              onOpenRemediation={() => setActiveSidebar('remediation')}
              onBack={() => setActiveSidebar('probable-cause')}
            />
          )}

          {activeSidebar === 'impact' && currentCluster && (
            <ImpactSidebar
              cluster={currentCluster}
              onClose={closeSidebar}
            />
          )}

          {activeSidebar === 'remediation' && currentCluster && (
            <RemediationSidebar
              cluster={currentCluster}
              causeId={selectedCauseId || undefined}
              onClose={closeSidebar}
              onBack={() => setActiveSidebar('probable-cause')}
            />
          )}

          {activeSidebar === 'probable-cause' && currentCluster && (
            <ProbableCauseSidebar
              cluster={currentCluster}
              onClose={closeSidebar}
              onOpenRemediation={(causeId) => {
                setSelectedCauseId(causeId);
                setActiveSidebar('remediation');
              }}
            />
          )}
        </>
      )}
    </MainLayout>
  );
}
