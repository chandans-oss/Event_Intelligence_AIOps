import React, { useState, useMemo } from 'react';
import {
  Search, Plus, ArrowLeft, Edit, Trash2,
  X, ChevronRight, Save, Loader2,
  AlertTriangle, Shield, Zap, Terminal,
  Clock, Info, BookOpen, ListChecks, Tag,
  ExternalLink, CheckCircle2, AlertCircle,
  Wrench, Server, Network, Cpu, Code, Database, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { KBEntry } from '@/features/admin/pages/KBManagerPage';

// ─── Color / Config Maps ─────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, any> = {
    Network: { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500', border: 'border-blue-500/30', icon: <Network className="w-4 h-4" /> },
    Compute: { bg: 'bg-purple-500/10', text: 'text-purple-500', accent: 'bg-purple-500', border: 'border-purple-500/30', icon: <Cpu className="w-4 h-4" /> },
    Storage: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', accent: 'bg-emerald-500', border: 'border-emerald-500/30', icon: <Database className="w-4 h-4" /> },
    Application: { bg: 'bg-orange-500/10', text: 'text-orange-500', accent: 'bg-orange-500', border: 'border-orange-500/30', icon: <Layers className="w-4 h-4" /> },
    Security: { bg: 'bg-red-500/10', text: 'text-red-500', accent: 'bg-red-500', border: 'border-red-500/30', icon: <Shield className="w-4 h-4" /> },
    default: { bg: 'bg-slate-500/10', text: 'text-slate-500', accent: 'bg-slate-500', border: 'border-slate-500/30', icon: <BookOpen className="w-4 h-4" /> },
};

const RISK_ICON: Record<string, JSX.Element> = {
  critical: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  high: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
  medium: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />,
  low: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function RcaKBSection({ 
    entries,
    isLoading,
    onEdit,
    onNew,
    onDelete
}: { 
    entries: any[];
    isLoading: boolean;
    onEdit: (entry: any) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
}) {
  const [viewMode, setViewMode] = useState<'drill' | 'list' | 'detail'>('drill');
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

   // ── Derived State ───────────────────────────────────────────────────────────
  const currentDrillItems = useMemo(() => {
    const level = drillPath.length;
    const stats: Record<string, { count: number; samples: Set<string>; risks: string[] }> = {};

    entries.forEach(entry => {
      const d = entry.category_hierarchy?.domain || 'Network';
      const c = entry.category_hierarchy?.category || 'General';
      const s = entry.category_hierarchy?.subcategory || 'General';

      const matches =
        (level === 0) ||
        (level === 1 && d === drillPath[0]) ||
        (level === 2 && d === drillPath[0] && c === drillPath[1]);

      if (!matches) return;

      const name = level === 0 ? d : level === 1 ? c : s;

      if (!stats[name]) stats[name] = { count: 0, samples: new Set(), risks: [] };
      stats[name].count++;
      stats[name].samples.add(entry.title);
      stats[name].risks.push(entry.metadata?.severity || 'medium');
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      count: data.count,
      samples: Array.from(data.samples).slice(0, 3),
      topRisk: data.risks.includes('critical') ? 'critical'
        : data.risks.includes('high') ? 'high'
        : data.risks.includes('medium') ? 'medium' : 'low',
    }));
  }, [entries, drillPath]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const d = e.category_hierarchy?.domain || 'Network';
      const c = e.category_hierarchy?.category || 'General';
      const s = e.category_hierarchy?.subcategory || 'General';

      const matchesDrill =
        (drillPath.length === 0) ||
        (drillPath.length === 1 && d === drillPath[0]) ||
        (drillPath.length === 2 && d === drillPath[0] && c === drillPath[1]) ||
        (drillPath.length === 3 && d === drillPath[0] && c === drillPath[1] && s === drillPath[2]);

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.rca_id.toLowerCase().includes(q) ||
          e.root_cause_analysis?.toLowerCase().includes(q) ||
          e.keywords?.some((k: string) => k.toLowerCase().includes(q));
      }
      return matchesDrill;
    });
  }, [entries, drillPath, searchQuery]);

  const selectedEntry = useMemo(() => entries.find(e => e._id === selectedId || e.rca_id === selectedId), [entries, selectedId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const goToDrillPath = (next: string[]) => {
    setDrillPath(next);
    if (next.length >= 3) {
      setViewMode('list');
    } else {
      setViewMode('drill');
    }
  };

  const handleDrill = (name: string) => {
    goToDrillPath([...drillPath, name]);
  };

  // ── Loading State ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-bold">Loading RCA Knowledge Base...</p>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden flex-1">

      {/* ── Header / Actions ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10">
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[14px] font-extrabold tracking-tight">RCA KNOWLEDGE BASE</h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Root Cause Analysis Records</p>
          </div>
        </div>
        
        {viewMode !== 'detail' ? (
          <Button size="sm" onClick={onNew} className="h-8 gap-1.5 rounded-md font-bold px-3 text-[11px]">
            <Plus className="w-3.5 h-3.5" /> NEW RCA ENTRY
          </Button>
        ) : selectedEntry && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-md font-bold px-3 h-8 gap-1.5 text-[10px]" onClick={() => {
                setViewMode('list');
                setSelectedId(null);
            }}>
              <ArrowLeft className="w-3.5 h-3.5" /> BACK TO LIST
            </Button>
            <Button size="sm" className="rounded-md font-bold px-3 h-8 gap-1.5 text-[10px]" onClick={() => onEdit(selectedEntry)}>
              <Edit className="w-3.5 h-3.5" /> EDIT
            </Button>
            <Button size="sm" variant="destructive" className="rounded-md font-bold px-3 h-8 gap-1.5 text-[10px]" onClick={() => onDelete(selectedEntry._id)}>
              <Trash2 className="w-3.5 h-3.5" /> DELETE
            </Button>
          </div>
        )}
      </div>

      {/* ── Breadcrumbs & Search ── */}
      {viewMode !== 'detail' && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/10 shrink-0">
          <div className="flex items-center gap-2 text-[10px]">
            <button
              onClick={() => goToDrillPath([])}
              className={cn('hover:text-primary transition-colors', drillPath.length === 0 ? 'text-primary font-bold' : 'text-muted-foreground')}
            >
              ROOT
            </button>
            {drillPath.map((p, i) => (
              <React.Fragment key={p}>
                <ChevronRight className="w-3 h-3 text-muted-foreground opacity-50" />
                <button
                  onClick={() => goToDrillPath(drillPath.slice(0, i + 1))}
                  className={cn('hover:text-primary transition-colors', i === drillPath.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground')}
                >
                  {p.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search RCA ID, title, keyword..."
              className="pl-8 h-8 text-[11px] rounded-md bg-card border-border hover:bg-muted/30 focus-visible:ring-1 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Main Area ── */}
      <ScrollArea className="flex-1">
        <div className="p-4">

          {/* ── DRILL VIEW ── */}
          {viewMode === 'drill' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {currentDrillItems.map(item => {
                const domainKey = drillPath.length === 0 ? item.name : drillPath[0];
                const config = DOMAIN_COLORS[domainKey] || DOMAIN_COLORS.default;
                return (
                  <Card
                    key={item.name}
                    className="group cursor-pointer hover:border-primary/50 transition-all border-border/50 shadow-none rounded-xl overflow-hidden bg-card/50"
                    onClick={() => handleDrill(item.name)}
                  >
                    <div className={cn('h-1', config.accent)} />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className={cn('p-2 rounded-lg', config.bg, config.text)}>
                          {config.icon}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {RISK_ICON[item.topRisk]}
                          <Badge variant="secondary" className="font-bold text-[9px] h-4 px-1.5">{item.count} Entries</Badge>
                        </div>
                      </div>
                      <h3 className="text-sm font-extrabold tracking-tight mb-1 truncate uppercase">{item.name}</h3>
                      <p className="text-[10px] text-muted-foreground mb-4 line-clamp-1">
                        {drillPath.length === 0 ? 'Explore domain categories' : drillPath.length === 1 ? 'Explore subcategories' : 'View RCA entries'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.samples.slice(0, 2).map(s => (
                          <Badge key={s} variant="outline" className={cn('text-[8px] font-medium opacity-60 h-4 px-1.5 truncate max-w-[120px]', config.border)}>
                            {s}
                          </Badge>
                        ))}
                        {item.count > 2 && <span className="text-[8px] text-muted-foreground font-bold">+{item.count - 2} more</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Quick Add Card */}
              <Card
                className="group cursor-pointer border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-none rounded-xl flex flex-col items-center justify-center p-4 min-h-[140px]"
                onClick={onNew}
              >
                <div className="p-2 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-all mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-wider">
                  ADD {drillPath.length === 0 ? 'DOMAIN' : drillPath.length === 1 ? 'CATEGORY' : 'RCA ENTRY'}
                </p>
              </Card>
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {viewMode === 'list' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200 max-w-5xl mx-auto">
              {filteredEntries.map(entry => {
                const domainKey = entry.category_hierarchy?.domain || 'Network';
                const config = DOMAIN_COLORS[domainKey] || DOMAIN_COLORS.default;
                const riskLevel = entry.metadata?.severity || 'medium';
                return (
                  <Card
                    key={entry._id}
                    className="group hover:border-primary/50 transition-all border-border/50 shadow-sm rounded-xl overflow-hidden cursor-pointer bg-card/50 backdrop-blur-sm"
                    onClick={() => { setSelectedId(entry._id); setViewMode('detail'); }}
                  >
                    <div className="flex">
                      <div className={cn('w-1 transition-colors group-hover:opacity-100 opacity-60', config.accent)} />
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="space-y-1 flex-1 mr-4">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <Badge variant="outline" className={cn('text-[9px] font-bold h-5 px-2', config.text, config.border)}>{entry.rca_id}</Badge>
                              <Badge variant="outline" className="text-[9px] h-5">{entry.category_hierarchy?.domain} / {entry.category_hierarchy?.category}</Badge>
                            </div>
                            <h3 className="text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors">
                              {entry.title}
                            </h3>
                          </div>
                          <div className="p-2 rounded-lg bg-muted border border-border/50 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all flex-shrink-0">
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                          {entry.description}
                        </p>

                        <div className="flex justify-between items-center pt-3 border-t border-dashed">
                          <div className="flex gap-2 flex-wrap">
                            {entry.keywords?.slice(0, 5).map((k: string) => (
                              <Badge key={k} variant="secondary" className="text-[9px] font-medium opacity-70 h-5 px-2">#{k}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                            <span className="flex items-center gap-1.5">{RISK_ICON[riskLevel]} <span className="uppercase">{riskLevel}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {filteredEntries.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-base font-bold text-foreground">No entries found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}

          {/* ── DETAIL VIEW ── */}
          {viewMode === 'detail' && selectedEntry && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-8 pb-10"
            >
              {/* Title Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5 text-[11px]">{selectedEntry.category_hierarchy?.domain?.toUpperCase()}</Badge>
                  <Badge variant="outline" className="text-[11px] font-mono">{selectedEntry.category_hierarchy?.category}</Badge>
                  <Badge variant="outline" className="text-[11px] font-mono">{selectedEntry.category_hierarchy?.subcategory}</Badge>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight leading-tight">{selectedEntry.title}</h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl italic">"{selectedEntry.description}"</p>
                <p className="text-[11px] font-mono text-muted-foreground/60">{selectedEntry.rca_id}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left: RCA Details ── */}
                <div className="lg:col-span-2 space-y-8">

                  <section>
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <ListChecks className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Root Cause Analysis</h3>
                    </div>
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/20 text-[13px] leading-relaxed font-medium">
                      {selectedEntry.root_cause_analysis}
                    </div>
                  </section>

                  {/* Symptoms */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                      <Zap className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Symptoms & Patterns</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {selectedEntry.situation?.symptoms?.map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[11px] py-1 border-amber-500/30 text-amber-600 bg-amber-500/5">{s}</Badge>
                      ))}
                      {selectedEntry.situation?.log_patterns?.map((s: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[11px] py-1 border-slate-500/30 text-slate-400 bg-slate-500/5 font-mono">{s}</Badge>
                      ))}
                    </div>
                  </section>

                  {/* Hypotheses */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Hypotheses</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedEntry.hypotheses?.map((h: any, i: number) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <p className="text-[13px] font-bold">{h.id}</p>
                              <Badge className="text-[10px] bg-emerald-500/20 text-emerald-500 border-emerald-500/30">Weight: {h.weight}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{h.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Template */}
                  {selectedEntry.render_template && (
                    <section>
                      <div className="flex items-center gap-2 mb-3 text-slate-500">
                        <Terminal className="w-5 h-5" />
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em]">RAG Context Template</h3>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-950 text-slate-300 font-mono text-[11px] leading-relaxed border border-slate-800">
                        {selectedEntry.render_template}
                      </div>
                    </section>
                  )}
                </div>

                {/* ── Right: Metadata & Info ── */}
                <div className="space-y-6">

                  {/* Classification Card */}
                  <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" /> Classification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Domain</span>
                        <Badge variant="secondary" className="font-bold capitalize text-[10px]">{selectedEntry.category_hierarchy?.domain}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="secondary" className="font-bold text-[10px]">{selectedEntry.category_hierarchy?.category}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">RCA ID</span>
                        <Badge variant="secondary" className="font-bold font-mono text-[10px]">{selectedEntry.rca_id}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Severity</span>
                        <span className="flex items-center gap-1.5 font-bold capitalize text-xs">{RISK_ICON[selectedEntry.metadata?.severity]} {selectedEntry.metadata?.severity}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={selectedEntry.metadata?.status === 'active' ? 'default' : 'outline'} className="font-bold text-[10px] capitalize">{selectedEntry.metadata?.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords */}
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" /> Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.keywords?.map((k: string) => (
                          <Badge key={k} variant="secondary" className="text-[10px] opacity-80">#{k}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
