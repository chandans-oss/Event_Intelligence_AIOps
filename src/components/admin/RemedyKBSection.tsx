import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, ArrowLeft, Edit, Trash2,
  X, ChevronRight, Save, Loader2,
  AlertTriangle, Shield, Zap, Terminal,
  Clock, Info, BookOpen, ListChecks, Tag,
  ExternalLink, CheckCircle2, AlertCircle,
  Wrench, Server, Network, Cpu, Code
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
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

// ─── Static JSON Imports ──────────────────────────────────────────────────────
import ciscoIosRaw from '@/data/remedy/cisco_ios.json';
import ciscoIosxeRaw from '@/data/remedy/cisco_iosxe.json';
import ciscoNxosRaw from '@/data/remedy/cisco_nxos.json';
import aristaEosRaw from '@/data/remedy/arista_eos.json';
import paloaltoPanosRaw from '@/data/remedy/paloalto_panos.json';
import juniperJunosRaw from '@/data/remedy/juniper_junos.json';
import fallbackSopRaw from '@/data/remedy/fallback_sop.json';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RemedyKBEntry {
  remedy_id: string;
  rca_id: string;
  title: string;
  description: string;
  vendor: string;
  os_flavor: string;
  appliance_types: string[];
  symptom_patterns: string[];
  rca_keywords: string[];
  steps: string[];
  keywords: string[];
  reranker_text: string;
  estimated_time_minutes: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  requires_maintenance_window: boolean;
  escalation: string;
  doc_links: string[];
  status: 'active' | 'draft' | 'review';
  raw?: any;
}

// ─── Color / Config Maps ─────────────────────────────────────────────────────

const VENDOR_COLORS: Record<string, any> = {
  cisco: { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500', border: 'border-blue-500/30', icon: <Network className="w-4 h-4" /> },
  juniper: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', accent: 'bg-emerald-500', border: 'border-emerald-500/30', icon: <Server className="w-4 h-4" /> },
  'palo alto': { bg: 'bg-orange-500/10', text: 'text-orange-500', accent: 'bg-orange-500', border: 'border-orange-500/30', icon: <Shield className="w-4 h-4" /> },
  arista: { bg: 'bg-purple-500/10', text: 'text-purple-500', accent: 'bg-purple-500', border: 'border-purple-500/30', icon: <Cpu className="w-4 h-4" /> },
  generic: { bg: 'bg-slate-500/10', text: 'text-slate-500', accent: 'bg-slate-500', border: 'border-slate-500/30', icon: <Wrench className="w-4 h-4" /> },
  default: { bg: 'bg-primary/10', text: 'text-primary', accent: 'bg-primary', border: 'border-primary/30', icon: <Wrench className="w-4 h-4" /> },
};

const RISK_ICON: Record<string, JSX.Element> = {
  critical: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
  high: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
  medium: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />,
  low: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
};

// ─── Raw → Entry Mapper ──────────────────────────────────────────────────────

const mapRawToEntry = (raw: any): RemedyKBEntry => ({
  remedy_id: raw.remedy_id || raw._id || '',
  rca_id: raw.rca_id || '',
  title: raw.title || '',
  description: raw.description || '',
  vendor: (raw.vendor || 'generic').toLowerCase(),
  os_flavor: raw.os_flavor || 'generic',
  appliance_types: raw.appliance_types || [],
  symptom_patterns: raw.symptom_patterns || [],
  rca_keywords: raw.rca_keywords || [],
  steps: raw.steps || [],
  keywords: raw.keywords || [],
  reranker_text: raw.reranker_text || '',
  estimated_time_minutes: raw.estimated_time_minutes || 0,
  risk_level: raw.risk_level || 'low',
  requires_maintenance_window: raw.requires_maintenance_window || false,
  escalation: raw.escalation || '',
  doc_links: raw.doc_links || [],
  status: raw.status || 'active',
  raw,
});

// ─── Blank Entry Factory ─────────────────────────────────────────────────────

const createBlankEntry = (vendor = '', os_flavor = '', rca_id = ''): RemedyKBEntry => ({
  remedy_id: `remedy-${Date.now()}`,
  rca_id: rca_id || 'new.rca_id',
  title: '',
  description: '',
  vendor: vendor || 'cisco',
  os_flavor: os_flavor || 'ios',
  appliance_types: [],
  symptom_patterns: [],
  rca_keywords: [],
  steps: [],
  keywords: [],
  reranker_text: '',
  estimated_time_minutes: 15,
  risk_level: 'low',
  requires_maintenance_window: false,
  escalation: '',
  doc_links: [],
  status: 'draft',
});

// ─── Normalise all sources into common RemedyKBEntry[] ───────────────────────

const normalizeFallbackStep = (s: any): string => {
  if (typeof s === 'string') return s;
  const parts: string[] = [];
  if (s.action) parts.push(s.action);
  if (s.cli) parts.push(`CLI: ${s.cli}`);
  if (s.notes) parts.push(`Note: ${s.notes}`);
  return parts.join(' · ');
};

const loadAllRemedies = (): RemedyKBEntry[] => {
  const entries: RemedyKBEntry[] = [];

  // cisco_ios.json — has vendor + os_flavor fields
  (ciscoIosRaw as any[]).forEach((raw, idx) => {
    entries.push(mapRawToEntry({ ...raw, _idx: idx }));
  });

  // cisco_iosxe.json — no vendor/os_flavor, infer from filename
  (ciscoIosxeRaw as any[]).forEach((raw, idx) => {
    entries.push(mapRawToEntry({
      ...raw,
      vendor: 'cisco',
      os_flavor: 'ios-xe',
      rca_id: raw.remedy_id?.split('.')[2] || 'general',
      _idx: idx,
    }));
  });

  // cisco_nxos.json
  (ciscoNxosRaw as any[]).forEach((raw, idx) => {
    entries.push(mapRawToEntry({ ...raw, _idx: idx }));
  });

  // arista_eos.json
  (aristaEosRaw as any[]).forEach((raw, idx) => {
    entries.push(mapRawToEntry({ ...raw, _idx: idx }));
  });

  // paloalto_panos.json
  (paloaltoPanosRaw as any[]).forEach((raw, idx) => {
    entries.push(mapRawToEntry({ ...raw, _idx: idx }));
  });

  // juniper_junos.json
  (juniperJunosRaw as any[]).forEach((raw, idx) => {
    entries.push(mapRawToEntry({ ...raw, _idx: idx }));
  });

  // fallback_sop.json — different schema (steps are objects)
  (fallbackSopRaw as any[]).forEach((raw, idx) => {
    entries.push(mapRawToEntry({
      remedy_id: raw.sop_id || `fallback-${idx}`,
      rca_id: raw.rca_id || raw.category || 'general',
      title: raw.title || '',
      description: raw.description || '',
      vendor: 'generic',
      os_flavor: 'fallback-sop',
      severity: raw.severity || 'medium',
      appliance_types: ['All Vendors'],
      symptom_patterns: raw.keywords || [],
      rca_keywords: raw.keywords || [],
      steps: (raw.steps || []).map(normalizeFallbackStep),
      keywords: raw.keywords || [],
      reranker_text: '',
      estimated_time_minutes: raw.estimated_time_minutes || 20,
      risk_level: raw.risk_level || 'medium',
      requires_maintenance_window: false,
      escalation: raw.escalation || '',
      doc_links: raw.doc_links || [],
      status: 'active',
    }));
  });

  return entries;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function RemedyKBSection({ highlightRemedyId }: { highlightRemedyId?: string }) {
  const [entries, setEntries] = useState<RemedyKBEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);  // Drill-down: vendor → os_flavor → rca_id → list → detail
  const [viewMode, setViewMode] = useState<'drill' | 'list' | 'detail'>('drill');
  const [drillPath, setDrillPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<RemedyKBEntry | null>(null);

  // ── Data Loading ────────────────────────────────────────────────────────────
  const loadKB = () => {
    try {
      setEntries(loadAllRemedies());
    } catch (e) {
      toast.error('Failed to parse Remedy Knowledge Base');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadKB(); }, []);

  // Deep link
  useEffect(() => {
    if (highlightRemedyId && entries.length > 0) {
      const entry = entries.find(e => e.remedy_id === highlightRemedyId || e.rca_id === highlightRemedyId);
      if (entry) {
        setSelectedId(entry.remedy_id);
        setViewMode('detail');
      }
    }
  }, [highlightRemedyId, entries]);

  // ── Derived State ───────────────────────────────────────────────────────────
  // Drill hierarchy: level0 = vendor, level1 = os_flavor, level2 = rca_id (category)
  const currentDrillItems = useMemo(() => {
    const level = drillPath.length;
    const stats: Record<string, { count: number; samples: Set<string>; severities: string[] }> = {};

    entries.forEach(entry => {
      const matches =
        (level === 0) ||
        (level === 1 && entry.vendor === drillPath[0]) ||
        (level === 2 && entry.vendor === drillPath[0] && entry.os_flavor === drillPath[1]);

      if (!matches) return;

      const name = level === 0 ? entry.vendor
        : level === 1 ? entry.os_flavor
        : entry.rca_id;

      if (!stats[name]) stats[name] = { count: 0, samples: new Set(), risks: [] };
      stats[name].count++;
      stats[name].samples.add(entry.title);
      stats[name].risks.push(entry.risk_level);
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
      const matchesDrill =
        (drillPath.length === 0) ||
        (drillPath.length === 1 && e.vendor === drillPath[0]) ||
        (drillPath.length === 2 && e.vendor === drillPath[0] && e.os_flavor === drillPath[1]) ||
        (drillPath.length === 3 && e.vendor === drillPath[0] && e.os_flavor === drillPath[1] && e.rca_id === drillPath[2]);

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.remedy_id.toLowerCase().includes(q) ||
          e.rca_id.toLowerCase().includes(q) ||
          e.vendor.toLowerCase().includes(q);
      }
      return matchesDrill;
    });
  }, [entries, drillPath, searchQuery]);

  const selectedEntry = useMemo(() => entries.find(e => e.remedy_id === selectedId), [entries, selectedId]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDrill = (name: string) => {
    const next = [...drillPath, name];
    if (next.length >= 3) {
      setDrillPath(next);
      setViewMode('list');
    } else {
      setDrillPath(next);
    }
  };

  const handleSave = (updatedEntry: RemedyKBEntry) => {
    const isNew = !entries.some(e => e.remedy_id === updatedEntry.remedy_id);
    if (isNew) {
      setEntries(prev => [...prev, updatedEntry]);
      toast.success('New remedy added (local only — connect API to persist)');
    } else {
      setEntries(prev => prev.map(e => e.remedy_id === updatedEntry.remedy_id ? updatedEntry : e));
      toast.success('Remedy updated (local only — connect API to persist)');
    }
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this remedy entry?')) return;
    setEntries(prev => prev.filter(e => e.remedy_id !== id));
    toast.success('Entry removed (local session only)');
    setViewMode('list');
  };

  // ── Loading State ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">

      {/* ── Header / Actions ── */}
      <div className="flex items-center justify-between px-4 py-1 border-b bg-card/30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10">
            <Wrench className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[13px] font-extrabold tracking-tight">REMEDY KNOWLEDGE BASE</h2>
            <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Auto-Remediation Playbook Library</p>
          </div>
        </div>
        {viewMode !== 'detail' ? (
          <Button size="sm" onClick={() => {
            setEditingEntry(createBlankEntry(drillPath[0], drillPath[1], drillPath[2]));
            setIsEditorOpen(true);
          }} className="h-7 gap-1.5 rounded-md font-bold px-3 text-[10px]">
            <Plus className="w-3 h-3" /> NEW REMEDY
          </Button>
        ) : selectedEntry && (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="rounded-md font-bold px-2.5 h-7 gap-1.5 text-[9px]" onClick={() => setViewMode('list')}>
              <ArrowLeft className="w-3 h-3" /> BACK
            </Button>
            <Button size="sm" className="rounded-md font-bold px-2.5 h-7 gap-1.5 text-[9px]" onClick={() => { setEditingEntry(selectedEntry); setIsEditorOpen(true); }}>
              <Edit className="w-3 h-3" /> EDIT
            </Button>
            <Button size="sm" variant="destructive" className="rounded-md font-bold px-2.5 h-7 gap-1.5 text-[9px]" onClick={() => handleDelete(selectedEntry.remedy_id)}>
              <Trash2 className="w-3 h-3" /> DELETE
            </Button>
          </div>
        )}
      </div>

      {/* ── Breadcrumbs & Search ── */}
      {viewMode !== 'detail' && (
        <div className="flex items-center justify-between px-4 py-1 border-b bg-muted/10 shrink-0">
          <div className="flex items-center gap-1.5 text-[8px]">
            <button
              onClick={() => { setDrillPath([]); setViewMode('drill'); }}
              className={cn('hover:text-primary transition-colors', drillPath.length === 0 ? 'text-primary font-bold' : 'text-muted-foreground')}
            >
              ROOT
            </button>
            {drillPath.map((p, i) => (
              <React.Fragment key={p}>
                <ChevronRight className="w-2.5 h-2.5 text-muted-foreground opacity-50" />
                <button
                  onClick={() => {
                    setDrillPath(drillPath.slice(0, i + 1));
                    setViewMode(i + 1 >= 3 ? 'list' : 'drill');
                  }}
                  className={cn('hover:text-primary transition-colors', i === drillPath.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground')}
                >
                  {p.toUpperCase()}
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Search remedy ID, title, vendor..."
              className="pl-7 h-6 text-[9px] rounded-sm bg-transparent border-none hover:bg-muted/30 focus-visible:ring-0 focus-visible:bg-muted/50 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Main Area ── */}
      <ScrollArea className="flex-1">
        <div className="p-3">

          {/* ── DRILL VIEW ── */}
          {viewMode === 'drill' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {currentDrillItems.map(item => {
                const vendorKey = drillPath.length === 0 ? item.name : drillPath[0];
                const config = VENDOR_COLORS[vendorKey] || VENDOR_COLORS.default;
                return (
                  <Card
                    key={item.name}
                    className="group cursor-pointer hover:border-primary/50 transition-all border-border/50 shadow-none rounded-xl overflow-hidden bg-card/50"
                    onClick={() => handleDrill(item.name)}
                  >
                    <div className={cn('h-1', config.accent)} />
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className={cn('p-1.5 rounded-lg', config.bg, config.text)}>
                          {config.icon}
                        </div>
                        <div className="flex items-center gap-1">
                          {RISK_ICON[item.topRisk]}
                          <Badge variant="secondary" className="font-bold text-[8px] h-3.5 px-1">{item.count} Remedies</Badge>
                        </div>
                      </div>
                      <h3 className="text-xs font-extrabold tracking-tight mb-0.5 truncate uppercase">{item.name}</h3>
                      <p className="text-[9px] text-muted-foreground mb-3 line-clamp-1">
                        {drillPath.length === 0 ? 'Explore vendor playbooks' : drillPath.length === 1 ? 'Explore OS flavors' : 'View RCA remedies'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {item.samples.slice(0, 2).map(s => (
                          <Badge key={s} variant="outline" className={cn('text-[7px] font-medium opacity-60 h-3 px-1 truncate max-w-[100px]', config.border)}>
                            {s}
                          </Badge>
                        ))}
                        {item.count > 2 && <span className="text-[7px] text-muted-foreground font-bold">+{item.count - 2} more</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Quick Add Card */}
              <Card
                className="group cursor-pointer border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all shadow-none rounded-xl flex flex-col items-center justify-center p-4 min-h-[100px]"
                onClick={() => { setEditingEntry(createBlankEntry(drillPath[0], drillPath[1], drillPath[2])); setIsEditorOpen(true); }}
              >
                <div className="p-1.5 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-all mb-1.5">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <p className="text-[8px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-wider">
                  ADD {drillPath.length === 0 ? 'VENDOR' : drillPath.length === 1 ? 'OS FLAVOR' : 'RCA REMEDY'}
                </p>
              </Card>
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {viewMode === 'list' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-200 max-w-5xl mx-auto">
              {filteredEntries.map(entry => {
                const config = VENDOR_COLORS[entry.vendor] || VENDOR_COLORS.default;
                return (
                  <Card
                    key={entry.remedy_id}
                    className="group hover:border-primary/50 transition-all border-border/50 shadow-sm rounded-xl overflow-hidden cursor-pointer bg-card/50 backdrop-blur-sm"
                    onClick={() => { setSelectedId(entry.remedy_id); setViewMode('detail'); }}
                  >
                    <div className="flex">
                      <div className={cn('w-1 transition-colors group-hover:opacity-100 opacity-60', config.accent)} />
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-0.5 flex-1 mr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={cn('text-[8px] font-bold h-4 px-1.5', config.text, config.border)}>{entry.remedy_id}</Badge>
                              {entry.requires_maintenance_window && (
                                <Badge variant="outline" className="text-[7px] h-4 px-1.5 text-orange-500 border-orange-500/30">MW Required</Badge>
                              )}
                            </div>
                            <h3 className="text-base font-extrabold tracking-tight group-hover:text-primary transition-colors">
                              {entry.title}
                            </h3>
                          </div>
                          <div className="p-1.5 rounded-lg bg-muted border border-border/50 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all flex-shrink-0">
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                          {entry.description}
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-dashed">
                          <div className="flex gap-1.5 flex-wrap">
                            {entry.keywords.slice(0, 5).map(k => (
                              <Badge key={k} variant="secondary" className="text-[8px] font-medium opacity-70 h-4 px-1.5">#{k}</Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {entry.estimated_time_minutes}m</span>
                            <span className="flex items-center gap-1">{RISK_ICON[entry.risk_level]} {entry.risk_level}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
              {filteredEntries.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Wrench className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No remedies found for this filter.</p>
                </div>
              )}
            </div>
          )}

          {/* ── DETAIL VIEW ── */}
          {viewMode === 'detail' && selectedEntry && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* Title Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-2 py-0.5 text-[10px]">{selectedEntry.vendor.toUpperCase()}</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">{selectedEntry.os_flavor}</Badge>
                  {selectedEntry.requires_maintenance_window && (
                    <Badge variant="outline" className="text-[9px] font-bold text-orange-500 border-orange-500/30 uppercase">Maintenance Window Required</Badge>
                  )}
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight leading-tight">{selectedEntry.title}</h1>
                <p className="text-muted-foreground text-xs leading-relaxed max-w-4xl italic">"{selectedEntry.description}"</p>
                <p className="text-[9px] font-mono text-muted-foreground/60">{selectedEntry.remedy_id} · rca_id: {selectedEntry.rca_id}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left: Steps & Symptoms ── */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Remediation Steps */}
                  <section>
                    <div className="flex items-center gap-2 mb-3 text-primary">
                      <ListChecks className="w-4 h-4" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Remediation Steps</h3>
                    </div>
                    <div className="space-y-1.5">
                      {selectedEntry.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/20 transition-colors group">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">
                            {i + 1}
                          </div>
                          <p className="text-[12px] leading-relaxed font-medium font-mono">{step}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Symptoms */}
                  <section>
                    <div className="flex items-center gap-2 mb-3 text-amber-500">
                      <Zap className="w-4 h-4" />
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Symptom Patterns</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.symptom_patterns.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/5">{s}</Badge>
                      ))}
                    </div>
                  </section>

                  {/* Escalation Path */}
                  {selectedEntry.escalation && (
                    <section>
                      <div className="flex items-center gap-2 mb-3 text-rose-500">
                        <AlertTriangle className="w-4 h-4" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Escalation Path</h3>
                      </div>
                      <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-[12px] leading-relaxed font-medium">
                        {selectedEntry.escalation}
                      </div>
                    </section>
                  )}

                  {/* Reranker Text */}
                  {selectedEntry.reranker_text && (
                    <section>
                      <div className="flex items-center gap-2 mb-2 text-slate-500">
                        <Terminal className="w-4 h-4" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">RAG Reranker Context</h3>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] leading-relaxed border border-slate-800">
                        {selectedEntry.reranker_text}
                      </div>
                    </section>
                  )}
                </div>

                {/* ── Right: Metadata & Info ── */}
                <div className="space-y-6">

                  {/* Classification Card */}
                  <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" /> Classification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Vendor</span>
                        <Badge variant="secondary" className="font-bold capitalize">{selectedEntry.vendor}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">OS Flavor</span>
                        <Badge variant="secondary" className="font-bold">{selectedEntry.os_flavor}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">RCA ID</span>
                        <Badge variant="secondary" className="font-bold font-mono">{selectedEntry.rca_id}</Badge>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Risk Level</span>
                        <span className="flex items-center gap-1 font-bold capitalize">{RISK_ICON[selectedEntry.risk_level]} {selectedEntry.risk_level}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> Est. Time</span>
                        <span className="font-bold">{selectedEntry.estimated_time_minutes} min</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={selectedEntry.status === 'active' ? 'default' : 'outline'} className="font-bold text-[8px] capitalize">{selectedEntry.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Appliance Types */}
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="bg-muted/30 pb-3">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" /> Appliance Types
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEntry.appliance_types.map(a => (
                          <Badge key={a} variant="outline" className="text-[9px]">{a}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords */}
                  <Card className="rounded-2xl border-border/50 shadow-sm">
                    <CardHeader className="bg-muted/30 pb-3">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" /> Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEntry.keywords.map(k => (
                          <Badge key={k} variant="secondary" className="text-[9px] opacity-80">#{k}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Doc Links */}
                  {selectedEntry.doc_links.length > 0 && (
                    <Card className="rounded-2xl border-border/50 shadow-sm">
                      <CardHeader className="bg-muted/30 pb-3">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" /> Documentation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-2">
                        {selectedEntry.doc_links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] text-primary hover:underline font-medium truncate"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{link.replace('https://', '')}</span>
                          </a>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* ── Editor Drawer ── */}
      <AnimatePresence>
        {isEditorOpen && editingEntry && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setIsEditorOpen(false)}
            />
            <motion.div
              initial={{ x: 520 }} animate={{ x: 0 }} exit={{ x: 520 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-[540px] h-full bg-card border-l shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wide">Remedy Entry Editor</h2>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-mono">{editingEntry.remedy_id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsEditorOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase">Vendor</Label>
                      <Input value={editingEntry.vendor} onChange={e => setEditingEntry({ ...editingEntry, vendor: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase">OS Flavor</Label>
                      <Input value={editingEntry.os_flavor} onChange={e => setEditingEntry({ ...editingEntry, os_flavor: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase">RCA ID (Category)</Label>
                    <Input value={editingEntry.rca_id} onChange={e => setEditingEntry({ ...editingEntry, rca_id: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase">Display Title</Label>
                    <Input value={editingEntry.title} onChange={e => setEditingEntry({ ...editingEntry, title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase">Description</Label>
                    <textarea
                      className="w-full h-20 p-3 bg-background border rounded-lg text-sm resize-none"
                      value={editingEntry.description}
                      onChange={e => setEditingEntry({ ...editingEntry, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase">Remediation Steps (one per line)</Label>
                    <textarea
                      className="w-full h-36 p-3 bg-background border rounded-lg text-xs font-mono resize-none"
                      value={editingEntry.steps.join('\n')}
                      onChange={e => setEditingEntry({ ...editingEntry, steps: e.target.value.split('\n').filter(Boolean) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase">Escalation Path</Label>
                    <textarea
                      className="w-full h-16 p-3 bg-background border rounded-lg text-sm resize-none"
                      value={editingEntry.escalation}
                      onChange={e => setEditingEntry({ ...editingEntry, escalation: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase">Risk Level</Label>
                      <select
                        className="w-full h-9 px-3 bg-background border rounded-lg text-sm"
                        value={editingEntry.risk_level}
                        onChange={e => setEditingEntry({ ...editingEntry, risk_level: e.target.value as any })}
                      >
                        {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase">Est. Time (minutes)</Label>
                      <Input type="number" value={editingEntry.estimated_time_minutes} onChange={e => setEditingEntry({ ...editingEntry, estimated_time_minutes: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase">Status</Label>
                      <select
                        className="w-full h-9 px-3 bg-background border rounded-lg text-sm"
                        value={editingEntry.status}
                        onChange={e => setEditingEntry({ ...editingEntry, status: e.target.value as any })}
                      >
                        {['active', 'draft', 'review'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="mw"
                      checked={editingEntry.requires_maintenance_window}
                      onChange={e => setEditingEntry({ ...editingEntry, requires_maintenance_window: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="mw" className="text-[11px] font-semibold cursor-pointer">Requires Maintenance Window</Label>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase">Keywords (comma separated)</Label>
                    <Input
                      value={editingEntry.keywords.join(', ')}
                      onChange={e => setEditingEntry({ ...editingEntry, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                    />
                  </div>
                </div>
              </ScrollArea>
              <div className="flex gap-3 px-6 py-4 border-t">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditorOpen(false)}>CANCEL</Button>
                <Button className="flex-1 rounded-xl" onClick={() => editingEntry && handleSave(editingEntry)} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} SAVE REMEDY
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
