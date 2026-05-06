import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, ArrowLeft, Edit, Trash2, 
  ExternalLink, Check, X, ChevronRight, Hash, 
  LayoutGrid, ListFilter, Terminal, Activity
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription,
  CardFooter
} from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';
import { 
  RAGKBEntry, 
  RAGKBSignal,
  RAGKBHypothesis,
  CATEGORY_COLORS 
} from '@/features/admin/data/ragKBData';
import ragKBData from '../../../ragkb.json';

// Helper to map raw JSON to our UI model
const mapRawToEntry = (raw: any): RAGKBEntry => {
  const path = raw.category_path || (raw.category ? [raw.category] : ['Other']);
  return {
    doc_id: raw.doc_id || raw._id || '',
    intent_id: raw.intent_id || '',
    category: path[0] || 'Uncategorized',
    sub_category: path[1] || 'General',
    issue_group: path[2] || 'Common',
    metric_family: raw.metric_family || '',
    description: raw.description || raw.title || '',
    keywords: raw.keywords || [],
    distinguishing_clues: raw.distinguishing_clues || [],
    negative_clues: raw.negative_clues || [],
    signals: (raw.signals || raw.situation?.metrics || []).map((s: any) => ({
      metric: s.metric,
      op: s.op === 'eq' ? '==' : s.op === 'ne' ? '!=' : s.op === 'gt' ? '>' : s.op === 'lt' ? '<' : s.op === 'ge' ? '>=' : s.op === 'le' ? '<=' : s.op,
      value: s.value,
      weight: s.weight
    })),
    hypotheses: (raw.hypotheses || []).map((h: any) => ({
      id: h.id || h.intent_id || 'hyp-1',
      description: h.description || 'Primary Hypothesis',
      log_patterns: h.log_patterns || []
    })),
    metadata: raw.metadata || {
      domain: 'network',
      severity: 'medium',
      created_by: 'system',
      created_at: new Date().toISOString(),
      version: 1,
      is_latest: true,
      status: 'active'
    }
  };
};

type ViewMode = 'home' | 'list';

export function RAGKBSection() {
  const [allEntries, setAllEntries] = useState<RAGKBEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [editingEntry, setEditingEntry] = useState<Partial<RAGKBEntry> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Initial load
  useEffect(() => {
    const mapped = (ragKBData as any[]).map(mapRawToEntry);
    setAllEntries(mapped);
  }, []);

  // Sync search to view mode
  useEffect(() => {
    if (searchQuery.trim() !== '' && viewMode === 'home') {
      setViewMode('list');
      setDrillPath([]);
    }
  }, [searchQuery, viewMode]);

  // Derived state for drill-down
  const currentLevelItems = useMemo(() => {
    const level = drillPath.length;
    const stats: Record<string, { count: number; families: Set<string>; icon?: string }> = {};

    allEntries.forEach(entry => {
      // Logic for matching based on explicit fields
      const matches = 
        (level === 0) ||
        (level === 1 && entry.category === drillPath[0]) ||
        (level === 2 && entry.category === drillPath[0] && entry.sub_category === drillPath[1]);
      
      if (!matches) return;

      const itemName = level === 0 ? entry.category : 
                       level === 1 ? entry.sub_category : 
                       entry.issue_group;

      if (!stats[itemName]) {
        stats[itemName] = { count: 0, families: new Set() };
      }
      stats[itemName].count++;
      if (entry.metric_family) stats[itemName].families.add(entry.metric_family);
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      count: data.count,
      families: Array.from(data.families).slice(0, 3)
    }));
  }, [allEntries, drillPath]);

  const maxItemCount = useMemo(() => 
    Math.max(...currentLevelItems.map(c => c.count), 1), 
  [currentLevelItems]);

  const stats = useMemo(() => ({
    totalEntries: allEntries.length,
    totalCategories: new Set(allEntries.map(e => e.category)).size,
    totalHypotheses: allEntries.reduce((acc, curr) => acc + curr.hypotheses.length, 0),
    totalSignals: allEntries.reduce((acc, curr) => acc + curr.signals.length, 0),
  }), [allEntries]);

  const filteredEntries = useMemo(() => {
    return allEntries.filter(entry => {
      const matchesDrill = 
        (drillPath.length === 0) ||
        (drillPath.length === 1 && entry.category === drillPath[0]) ||
        (drillPath.length === 2 && entry.category === drillPath[0] && entry.sub_category === drillPath[1]) ||
        (drillPath.length === 3 && entry.category === drillPath[0] && entry.sub_category === drillPath[1] && entry.issue_group === drillPath[2]);

      if (!matchesDrill && viewMode === 'list' && searchQuery === '') return false;

      if (!searchQuery.trim()) return matchesDrill || viewMode === 'list';

      const q = searchQuery.toLowerCase();
      return (
        entry.description.toLowerCase().includes(q) ||
        entry.doc_id.toLowerCase().includes(q) ||
        entry.intent_id.toLowerCase().includes(q) ||
        entry.keywords.some(k => k.toLowerCase().includes(q)) ||
        entry.distinguishing_clues.some(c => c.toLowerCase().includes(q))
      );
    });
  }, [allEntries, drillPath, viewMode, searchQuery]);

  const selectedEntry = useMemo(() => 
    allEntries.find(e => e.doc_id === selectedDocId), 
  [allEntries, selectedDocId]);

  // Actions
  const handleItemClick = (name: string) => {
    const nextPath = [...drillPath, name];
    if (nextPath.length >= 3) {
      setDrillPath(nextPath);
      setViewMode('list');
    } else {
      setDrillPath(nextPath);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setDrillPath([]);
      setViewMode('home');
    } else {
      setDrillPath(drillPath.slice(0, index + 1));
      setViewMode('home');
    }
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setDrillPath([]);
    setSearchQuery('');
    setSelectedDocId(null);
    setIsDetailOpen(false);
  };

  const handleCardClick = (docId: string) => {
    setSelectedDocId(docId);
    setIsDetailOpen(true);
  };

  const handleCreate = () => {
    setDrawerMode('create');
    setEditingEntry({
      category: drillPath[0] || 'Network',
      sub_category: drillPath[1] || 'Link',
      issue_group: drillPath[2] || 'Down',
      signals: [{ metric: '', op: '==', value: '', weight: 0.5 }],
      keywords: [],
      distinguishing_clues: [],
      negative_clues: [],
      hypotheses: []
    });
    setIsDrawerOpen(true);
  };

  const handleEdit = (entry: RAGKBEntry) => {
    setDrawerMode('edit');
    setEditingEntry({ ...entry });
    setIsDrawerOpen(true);
  };

  const handleDelete = (docId: string) => {
    setDeleteConfirmId(docId);
  };

  const confirmDelete = (docId: string) => {
    setAllEntries(prev => prev.filter(e => e.doc_id !== docId));
    if (selectedDocId === docId) {
      setSelectedDocId(null);
      setIsDetailOpen(false);
    }
    setDeleteConfirmId(null);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-[#FAEEDA] text-[#633806] px-0.5 rounded-sm">{part}</mark>
      ) : (
        part
      )
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 w-full bg-background border-b border-border/50 h-14 flex items-center px-6 gap-6">
        <div className="text-[14px] font-medium whitespace-nowrap">KB Explorer</div>
        
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search intents, keywords, descriptions..." 
            className="pl-10 h-9 w-full bg-secondary/30 border-none focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button size="sm" onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New entry
        </Button>
      </header>

      {/* Breadcrumbs */}
      <div className="h-12 border-b border-border/50 bg-secondary/5 flex items-center px-6 gap-2 text-[12px]">
        <button 
          onClick={() => handleBreadcrumbClick(-1)}
          className={cn("hover:text-primary transition-colors", drillPath.length === 0 ? "text-foreground font-bold" : "text-muted-foreground")}
        >
          Base
        </button>
        {drillPath.map((p, i) => (
          <React.Fragment key={i}>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <button 
              onClick={() => handleBreadcrumbClick(i)}
              className={cn("hover:text-primary transition-colors", i === drillPath.length - 1 ? "text-foreground font-bold" : "text-muted-foreground")}
            >
              {p}
            </button>
          </React.Fragment>
        ))}
        {viewMode === 'list' && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-primary font-bold">Results</span>
          </>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {viewMode === 'home' ? (
          <ScrollArea className="flex-1">
            <div className="p-8 max-w-6xl mx-auto space-y-10">
              {drillPath.length === 0 && (
                <div className="grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  {[
                    { label: 'Total KB entries', value: stats.totalEntries },
                    { label: 'Categories', value: stats.totalCategories },
                    { label: 'Hypotheses', value: stats.totalHypotheses },
                    { label: 'Signals', value: stats.totalSignals },
                  ].map((stat, i) => (
                    <div key={i} className="bg-secondary/40 p-5 rounded-xl border-none">
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</div>
                      <div className="text-24px font-medium">{stat.value}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold uppercase tracking-tight">
                    {drillPath.length === 0 ? 'Explore Categories' : 
                     drillPath.length === 1 ? `Sub-categories in ${drillPath[0]}` : 
                     `Issue Groups for ${drillPath[1]}`}
                  </h2>
                  <p className="text-[12px] text-muted-foreground">
                    Select a {drillPath.length === 0 ? 'category' : drillPath.length === 1 ? 'sub-category' : 'issue group'} to drill down
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
                {currentLevelItems.map((item) => {
                  const topCat = drillPath[0] || item.name;
                  const config = CATEGORY_COLORS[topCat.toLowerCase()] || { 
                    icon: topCat.substring(0, 2).toUpperCase(), 
                    bg: '#f1f1f1', text: '#333', accent: '#666',
                    description: 'Standard fault category'
                  };
                  return (
                    <Card 
                      key={item.name}
                      className="cursor-pointer hover:border-primary/50 transition-all group overflow-hidden border-border/50 shadow-none rounded-[12px]"
                      onClick={() => handleItemClick(item.name)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div 
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-[13px] font-bold"
                            style={{ backgroundColor: config.bg, color: config.text }}
                          >
                            {config.icon}
                          </div>
                          <div className="text-24px font-medium">{item.count}</div>
                        </div>
                        
                        <div className="space-y-1 mb-6">
                          <h3 className="text-[13px] font-semibold uppercase tracking-wide">{item.name}</h3>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {drillPath.length === 0 ? config.description : `${item.count} intents available`}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="h-[3px] w-full bg-secondary/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-500"
                              style={{ width: `${(item.count / maxItemCount) * 100}%`, backgroundColor: config.accent }}
                            />
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {item.families.map(f => (
                              <Badge 
                                key={f} variant="secondary" 
                                className="text-[10px] border-none font-medium px-2 py-0"
                                style={{ backgroundColor: config.bg, color: config.text }}
                              >
                                {f.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col border-r border-border/50">
              <div className="h-14 px-6 border-b border-border/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={handleBackToHome} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[13px] font-medium">Reset</span>
                  </button>
                  <div className="flex items-center gap-1">
                    {drillPath.map((p, i) => (
                      <Badge 
                        key={i} className="border-none font-bold text-[10px] px-2"
                        style={{ 
                          backgroundColor: i === 0 ? (CATEGORY_COLORS[p.toLowerCase()]?.bg || '#eee') : '#eee',
                          color: i === 0 ? (CATEGORY_COLORS[p.toLowerCase()]?.text || '#333') : '#333'
                        }}
                      >
                        {p.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 bg-secondary/10">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-300">
                  {filteredEntries.map(entry => {
                    const isSelected = selectedDocId === entry.doc_id;
                    const config = CATEGORY_COLORS[entry.category.toLowerCase()] || { bg: '#eee', text: '#333', accent: '#666' };
                    return (
                      <Card 
                        key={entry.doc_id}
                        className={cn(
                          "relative overflow-hidden border-border/50 shadow-none transition-all rounded-[12px] group cursor-pointer hover:border-primary/50",
                          isSelected && "ring-[1.5px] ring-primary ring-inset border-primary/50 bg-primary/[0.02]"
                        )}
                        onClick={() => handleCardClick(entry.doc_id)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <CardTitle className="text-[13px] font-medium leading-tight line-clamp-2 min-h-[32px]">
                                {highlightText(entry.description, searchQuery)}
                              </CardTitle>
                              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                                {highlightText(entry.doc_id, searchQuery)}
                              </div>
                            </div>
                            <Badge 
                              className="border-none text-[9px] font-bold shrink-0"
                              style={{ backgroundColor: config.bg, color: config.text }}
                            >
                              {entry.issue_group.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 space-y-4">
                          <div className="flex flex-wrap gap-1.5 h-[20px] overflow-hidden">
                            {entry.keywords.slice(0, 3).map((k, i) => (
                              <Badge key={i} variant="secondary" className="bg-secondary/50 text-muted-foreground font-normal text-[9px] border-none px-1.5">
                                {highlightText(k, searchQuery)}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="p-0 border-t border-border/50">
                          <div className="flex items-center w-full">
                            <Button variant="ghost" className="flex-1 h-9 text-[11px] rounded-none hover:bg-secondary/50 border-r border-border/50 text-muted-foreground" onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}>
                              <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button variant="ghost" className="flex-1 h-9 text-[11px] rounded-none hover:bg-destructive/5 text-muted-foreground" onClick={(e) => { e.stopPropagation(); handleDelete(entry.doc_id); }}>
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* 70% Width Detail Sidebar */}
            {isDetailOpen && selectedEntry && (
              <div className="absolute inset-0 z-40 flex justify-end animate-in fade-in duration-300">
                <div className="absolute inset-0 bg-black/20" onClick={() => setIsDetailOpen(false)} />
                <div className="relative w-[70%] h-full bg-background border-l border-border/50 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                  <div className="h-14 px-6 border-b border-border/50 flex items-center justify-between shrink-0 bg-secondary/5">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-[13px] font-medium font-mono uppercase">{selectedEntry.intent_id}</CardTitle>
                      <div className="flex gap-1">
                        <Badge className="border-none text-[9px] font-bold bg-secondary/50">{selectedEntry.category.toUpperCase()}</Badge>
                        <Badge className="border-none text-[9px] font-bold bg-secondary/50">{selectedEntry.sub_category.toUpperCase()}</Badge>
                        <Badge className="border-none text-[9px] font-bold bg-secondary/50">{selectedEntry.issue_group.toUpperCase()}</Badge>
                      </div>
                    </div>
                    <button onClick={() => setIsDetailOpen(false)} className="p-1.5 rounded-md hover:bg-secondary transition-colors"><X className="h-4 w-4" /></button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-8 grid grid-cols-2 gap-12">
                      <div className="space-y-10">
                        <section className="space-y-4">
                          <SectionLabel label="Hierarchy" />
                          <div className="space-y-4">
                            <DataRow label="Category" value={selectedEntry.category} />
                            <DataRow label="Sub Category" value={selectedEntry.sub_category} />
                            <DataRow label="Issue Group" value={selectedEntry.issue_group} />
                            <DataRow label="Metric Family" value={selectedEntry.metric_family} />
                          </div>
                        </section>
                        <section className="space-y-4">
                          <SectionLabel label="Signals" />
                          <div className="space-y-5">
                            {selectedEntry.signals.map((s, i) => (
                              <div key={i} className="space-y-2 bg-secondary/20 p-3 rounded-lg border border-border/30">
                                <div className="flex justify-between items-center text-[12px] font-mono">
                                  <span className="text-foreground font-bold">{s.metric}</span>
                                  <Badge variant="outline" className="text-[10px]">{s.op} {s.value}</Badge>
                                  <span className="text-muted-foreground font-bold">{s.weight}</span>
                                </div>
                                <div className="h-[4px] w-full bg-secondary rounded-full overflow-hidden">
                                  <div className={cn("h-full transition-all duration-300", s.weight >= 0.7 ? "bg-blue-500" : s.weight >= 0.4 ? "bg-amber-500" : "bg-muted-foreground/40")} style={{ width: `${s.weight * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                      <div className="space-y-10">
                        <section className="space-y-4">
                          <SectionLabel label="Description" />
                          <p className="text-[14px] leading-relaxed text-foreground/80">{selectedEntry.description}</p>
                        </section>
                        <section className="space-y-4">
                          <SectionLabel label="Clues Analysis" />
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Distinguishing</span>
                              <div className="space-y-2">
                                {selectedEntry.distinguishing_clues.map((c, i) => (
                                  <div key={i} className="flex gap-2 text-[12px] leading-normal"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" /><span>{c}</span></div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3 p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                              <span className="text-[11px] font-black text-destructive uppercase tracking-widest">Negative</span>
                              <div className="space-y-2">
                                {selectedEntry.negative_clues.map((c, i) => (
                                  <div key={i} className="flex gap-2 text-[12px] leading-normal"><X className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" /><span>{c}</span></div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* CRUD Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-[400px] h-full bg-background border-l border-border/50 shadow-2xl flex flex-col">
            <div className="h-14 px-6 border-b border-border/50 flex items-center justify-between shrink-0">
              <h2 className="text-[14px] font-semibold">{drawerMode === 'create' ? 'New KB entry' : 'Edit KB entry'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded-md hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                <FormRow label="Doc ID" required><Input value={editingEntry?.doc_id} className="h-9 text-[12px] font-mono" /></FormRow>
                <FormRow label="Intent ID" required><Input value={editingEntry?.intent_id} className="h-9 text-[12px] font-mono" /></FormRow>
                <FormRow label="Category" required><Input value={editingEntry?.category} className="h-9 text-[12px]" /></FormRow>
                <FormRow label="Sub Category" required><Input value={editingEntry?.sub_category} className="h-9 text-[12px]" /></FormRow>
                <FormRow label="Issue Group" required><Input value={editingEntry?.issue_group} className="h-9 text-[12px]" /></FormRow>
                <FormRow label="Description" required><Input value={editingEntry?.description} className="h-9 text-[12px]" /></FormRow>
                <FormRow label="Keywords"><textarea className="w-full min-h-[80px] bg-background border border-border/50 rounded-[8px] p-3 text-[12px]" value={editingEntry?.keywords?.join(', ')} /></FormRow>
              </div>
            </ScrollArea>
            <div className="p-6 border-t border-border/50 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => setIsDrawerOpen(false)}>Save entry</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <div className="text-[10px] font-black uppercase tracking-[0.08em] text-muted-foreground/60 border-b border-border/30 pb-1.5">{label}</div>;
}

function DataRow({ label, value }: { label: string, value: string }) {
  return <div className="flex justify-between items-start gap-4 text-[12px]"><span className="text-muted-foreground">{label}</span><span className="text-foreground font-medium text-right">{value}</span></div>;
}

function FormRow({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
  return <div className="space-y-2"><div className="flex items-center gap-1"><label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>{required && <span className="text-destructive font-bold">*</span>}</div>{children}</div>;
}
