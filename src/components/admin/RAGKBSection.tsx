import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, ArrowLeft, Edit, Trash2, 
  Check, X, ChevronRight, Hash, 
  LayoutGrid, Terminal, Activity, Database,
  ArrowRightCircle, Shield, Zap, Info,
  Filter, RotateCcw, Save, Loader2,
  AlertTriangle, ListChecks, Code, Settings,
  History, User, Calendar, Cpu, Tag, BrainCircuit
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
  CardFooter
} from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { toast } from "sonner";
import { fetchRAGKB, saveRAGKBEntry, deleteRAGKBEntry } from '@/api/rcaApi';

// --- Types ---

interface RAGKBEntry {
  doc_id: string;
  intent_id: string;
  title: string;
  category: string;
  sub_category: string;
  issue_group: string;
  description: string;
  root_cause_analysis: string;
  render_template: string;
  keywords: string[];
  situation: {
    symptoms: string[];
    negative_indicators: string[];
    metrics: { metric: string; op: string; value: any; weight: number }[];
    log_patterns: string[];
    affected_components: string[];
  };
  hypotheses: { id: string; description: string; weight: number; log_patterns: string[] }[];
  metadata: {
    domain: string;
    severity: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    version: number;
    is_latest: boolean;
    status: string;
  };
  raw?: any;
}

const CATEGORY_COLORS: Record<string, any> = {
  'network': { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500', icon: <Database className="w-4 h-4" /> },
  'device': { bg: 'bg-purple-500/10', text: 'text-purple-500', accent: 'bg-purple-500', icon: <Cpu className="w-4 h-4" /> },
  'application': { bg: 'bg-amber-500/10', text: 'text-amber-500', accent: 'bg-amber-500', icon: <Activity className="w-4 h-4" /> },
  'default': { bg: 'bg-slate-500/10', text: 'text-slate-500', accent: 'bg-slate-500', icon: <Shield className="w-4 h-4" /> }
};

const mapRawToEntry = (raw: any): RAGKBEntry => {
    const path = raw.category_hierarchy || {};
    return {
        doc_id: raw._id || raw.doc_id || '',
        intent_id: raw.rca_id || raw.intent_id || '',
        title: raw.title || '',
        category: path.domain || 'Network',
        sub_category: path.category || 'General',
        issue_group: path.subcategory || 'Fault',
        description: raw.description || '',
        root_cause_analysis: raw.root_cause_analysis || '',
        render_template: raw.render_template || '',
        keywords: raw.keywords || [],
        situation: {
            symptoms: raw.situation?.symptoms || [],
            negative_indicators: raw.situation?.negative_indicators || [],
            metrics: raw.situation?.metrics || [],
            log_patterns: raw.situation?.log_patterns || [],
            affected_components: raw.situation?.affected_components || []
        },
        hypotheses: (raw.hypotheses || []).map((h: any) => ({
            id: h.id || '',
            description: h.description || '',
            weight: h.weight || 0,
            log_patterns: h.log_patterns || []
        })),
        metadata: raw.metadata || {
            domain: 'network',
            severity: 'medium',
            created_by: 'system',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            version: 1,
            is_latest: true,
            status: 'active'
        },
        raw: raw
    };
};

// --- Main Component ---

export function RAGKBSection({ highlightDocId }: { highlightDocId?: string }) {
    const [entries, setEntries] = useState<RAGKBEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [viewMode, setViewMode] = useState<'drill' | 'list' | 'detail'>('drill');
    const [drillPath, setDrillPath] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);

    // Initial Fetch
    const loadKB = async () => {
        setIsLoading(true);
        try {
            const data = await fetchRAGKB();
            setEntries(data.map(mapRawToEntry));
        } catch (e: any) {
            toast.error("Failed to load Knowledge Base");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadKB();
    }, []);

    // Handle external highlighting (Deep Linking)
    useEffect(() => {
        if (highlightDocId && entries.length > 0) {
            const entry = entries.find(e => e.doc_id === highlightDocId || e.intent_id === highlightDocId);
            if (entry) {
                setSelectedDocId(entry.doc_id);
                setViewMode('detail');
            }
        }
    }, [highlightDocId, entries]);

    // Derived State
    const currentDrillItems = useMemo(() => {
        const level = drillPath.length;
        const stats: Record<string, { count: number; families: Set<string> }> = {};

        entries.forEach(entry => {
            const matches = 
                (level === 0) ||
                (level === 1 && entry.category === drillPath[0]) ||
                (level === 2 && entry.category === drillPath[0] && entry.sub_category === drillPath[1]);
            
            if (!matches) return;

            const name = level === 0 ? entry.category : 
                         level === 1 ? entry.sub_category : 
                         entry.issue_group;

            if (!stats[name]) stats[name] = { count: 0, families: new Set() };
            stats[name].count++;
            if (entry.intent_id) stats[name].families.add(entry.intent_id);
        });

        return Object.entries(stats).map(([name, data]) => ({
            name,
            count: data.count,
            intents: Array.from(data.families).slice(0, 3)
        }));
    }, [entries, drillPath]);

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const matchesDrill = 
                (drillPath.length === 0) ||
                (drillPath.length === 1 && e.category === drillPath[0]) ||
                (drillPath.length === 2 && e.category === drillPath[0] && e.sub_category === drillPath[1]) ||
                (drillPath.length === 3 && e.category === drillPath[0] && e.sub_category === drillPath[1] && e.issue_group === drillPath[2]);

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return e.description.toLowerCase().includes(q) || 
                       e.intent_id.toLowerCase().includes(q) || 
                       e.doc_id.toLowerCase().includes(q) ||
                       e.title.toLowerCase().includes(q);
            }
            return matchesDrill;
        });
    }, [entries, drillPath, searchQuery]);

    const selectedEntry = useMemo(() => entries.find(e => e.doc_id === selectedDocId), [entries, selectedDocId]);

    // Handlers
    const handleDrill = (name: string) => {
        const next = [...drillPath, name];

        // Find all entries that match this drill path
        const matchingEntries = entries.filter(e => {
            if (next.length === 1) return e.category === next[0];
            if (next.length === 2) return e.category === next[0] && e.sub_category === next[1];
            if (next.length === 3) return e.category === next[0] && e.sub_category === next[1] && e.issue_group === next[2];
            return false;
        });

        if (next.length >= 3) {
            if (matchingEntries.length === 1) {
                // Skip the list — go straight to the single entry's detail view
                setDrillPath(next);
                setSelectedDocId(matchingEntries[0].doc_id);
                setViewMode('detail');
            } else {
                setDrillPath(next);
                setViewMode('list');
            }
        } else if (next.length === 2 && matchingEntries.length === 1) {
            // Only 1 entry under this category — skip the sub-category drill level too
            setDrillPath(next);
            setSelectedDocId(matchingEntries[0].doc_id);
            setViewMode('detail');
        } else {
            setDrillPath(next);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const rawToSave = {
                ...editingEntry.raw,
                _id: editingEntry.doc_id,
                rca_id: editingEntry.intent_id,
                title: editingEntry.title,
                description: editingEntry.description,
                root_cause_analysis: editingEntry.root_cause_analysis,
                category_hierarchy: {
                    domain: editingEntry.category,
                    category: editingEntry.sub_category,
                    subcategory: editingEntry.issue_group
                }
            };
            
            const isNew = !entries.some(e => e.doc_id === editingEntry.doc_id);
            await saveRAGKBEntry(rawToSave, isNew);
            toast.success("Knowledge Base updated");
            setIsEditorOpen(false);
            loadKB();
        } catch (e) {
            toast.error("Failed to save entry");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;
        try {
            await deleteRAGKBEntry(docId);
            toast.success("Entry deleted");
            loadKB();
            setViewMode('list');
        } catch (e) {
            toast.error("Failed to delete entry");
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-background relative overflow-hidden">
            
            {/* Header / Actions */}
            <div className="flex items-center justify-between px-4 py-1 border-b bg-card/30 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/10">
                        <Database className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-[13px] font-extrabold tracking-tight">RAG KNOWLEDGE BASE</h2>
                        <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Global RCA Semantic Index</p>
                    </div>
                </div>
                {viewMode !== 'detail' ? (
                    <Button size="sm" onClick={() => {
                        setEditingEntry({
                            doc_id: `rca-${Date.now()}`,
                            intent_id: 'new.intent',
                            title: '',
                            category: drillPath[0] || 'Network',
                            sub_category: drillPath[1] || 'General',
                            issue_group: drillPath[2] || 'Fault',
                            description: '',
                            keywords: [],
                            situation: { symptoms: [], negative_indicators: [], metrics: [], log_patterns: [], affected_components: [] },
                            hypotheses: []
                        });
                        setIsEditorOpen(true);
                    }} className="h-7 gap-1.5 rounded-md font-bold px-3 text-[10px]">
                        <Plus className="w-3 h-3" /> NEW ENTRY
                    </Button>
                ) : selectedEntry && (
                    <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" className="rounded-md font-bold px-2.5 h-7 gap-1.5 text-[9px]" onClick={() => {
                            if (searchQuery) {
                                setViewMode('list');
                                return;
                            }
                            const matchingEntries = entries.filter(e => {
                                if (drillPath.length === 1) return e.category === drillPath[0];
                                if (drillPath.length === 2) return e.category === drillPath[0] && e.sub_category === drillPath[1];
                                if (drillPath.length >= 3) return e.category === drillPath[0] && e.sub_category === drillPath[1] && e.issue_group === drillPath[2];
                                return false;
                            });
                            if (matchingEntries.length === 1 && drillPath.length > 0) {
                                setDrillPath(drillPath.slice(0, -1));
                                setViewMode('drill');
                            } else {
                                setViewMode('list');
                            }
                        }}>
                            <ArrowLeft className="w-3 h-3" /> BACK
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-md font-bold px-2.5 h-7 gap-1.5 text-[9px]" onClick={() => { setEditingEntry(selectedEntry); setIsEditorOpen(true); }}>
                            <Edit className="w-3 h-3" /> EDIT
                        </Button>
                        <Button size="sm" variant="destructive" className="rounded-md font-bold px-2.5 h-7 gap-1.5 text-[9px]" onClick={() => handleDelete(selectedEntry.doc_id)}>
                            <Trash2 className="w-3 h-3" /> DELETE
                        </Button>
                    </div>
                )}
            </div>

            {/* Breadcrumbs & Search */}
            {viewMode !== 'detail' && (
                <div className="flex items-center justify-between px-4 py-1 border-b bg-muted/10 shrink-0">
                    <div className="flex items-center gap-1.5 text-[8px]">
                        <button 
                            onClick={() => { setDrillPath([]); setViewMode('drill'); }}
                            className={cn("hover:text-primary transition-colors", drillPath.length === 0 ? "text-primary font-bold" : "text-muted-foreground")}
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
                                    className={cn("hover:text-primary transition-colors", i === drillPath.length - 1 ? "text-primary font-bold" : "text-muted-foreground")}
                                >
                                    {p.toUpperCase()}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="relative w-60">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                        <Input 
                            placeholder="Search Knowledge Base..." 
                            className="pl-7 h-6 text-[9px] rounded-sm bg-transparent border-none hover:bg-muted/30 focus-visible:ring-0 focus-visible:bg-muted/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Main Area */}
            <ScrollArea className="flex-1">
                <div className="p-3">
                    {viewMode === 'drill' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {currentDrillItems.map((item) => {
                                const config = CATEGORY_COLORS[item.name.toLowerCase()] || CATEGORY_COLORS.default;
                                return (
                                    <Card 
                                        key={item.name}
                                        className="group cursor-pointer hover:border-primary/50 transition-all border-border/50 shadow-none rounded-xl overflow-hidden bg-card/50"
                                        onClick={() => handleDrill(item.name)}
                                    >
                                        <div className={cn("h-1", config.accent)} />
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={cn("p-1.5 rounded-lg", config.bg, config.text)}>
                                                    <Database className="w-3.5 h-3.5" />
                                                </div>
                                                {item.count === 1
                                                    ? <Badge variant="outline" className="font-bold text-[8px] h-3.5 px-1 border-primary/40 text-primary bg-primary/5">Direct</Badge>
                                                    : <Badge variant="secondary" className="font-bold text-[8px] h-3.5 px-1">{item.count} Items</Badge>
                                                }
                                            </div>
                                            <h3 className="text-xs font-extrabold tracking-tight mb-0.5 truncate uppercase">{item.name}</h3>
                                            <p className="text-[9px] text-muted-foreground mb-3 line-clamp-1">
                                                {item.count === 1 ? 'Open entry directly →' : `Explore ${item.count} root causes`}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {item.intents.slice(0, 3).map(int => (
                                                    <Badge key={int} variant="outline" className="text-[7px] font-mono opacity-60 h-3 px-1">
                                                        {int}
                                                    </Badge>
                                                ))}
                                                {item.intents.length > 3 && <span className="text-[7px] text-muted-foreground font-bold">+{item.intents.length - 3}</span>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            
                            {/* Quick Add Card */}
                            <Card 
                                className="group cursor-pointer border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all shadow-none rounded-xl flex flex-col items-center justify-center p-4 min-h-[100px]"
                                onClick={() => {
                                    setEditingEntry({
                                        doc_id: `rca-${Date.now()}`,
                                        intent_id: 'new.intent',
                                        title: '',
                                        category: drillPath[0] || 'New Domain',
                                        sub_category: drillPath[1] || (drillPath[0] ? 'New Category' : 'General'),
                                        issue_group: drillPath[2] || (drillPath[1] ? 'New Sub-Category' : 'Fault'),
                                        description: '',
                                        keywords: [],
                                        situation: { symptoms: [], negative_indicators: [], metrics: [], log_patterns: [], affected_components: [] },
                                        hypotheses: []
                                    });
                                    setIsEditorOpen(true);
                                }}
                            >
                                <div className="p-1.5 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-all mb-1.5">
                                    <Plus className="w-3.5 h-3.5" />
                                </div>
                                <p className="text-[8px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-wider">
                                    ADD {drillPath.length === 0 ? 'DOMAIN' : drillPath.length === 1 ? 'CATEGORY' : 'SUB-CATEGORY'}
                                </p>
                            </Card>
                        </div>
                    )}

                    {viewMode === 'list' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-200 max-w-5xl mx-auto">
                            {filteredEntries.map(entry => (
                                <Card 
                                    key={entry.doc_id}
                                    className="group hover:border-primary/50 transition-all border-border/50 shadow-sm rounded-xl overflow-hidden cursor-pointer bg-card/50 backdrop-blur-sm"
                                    onClick={() => { setSelectedDocId(entry.doc_id); setViewMode('detail'); }}
                                >
                                    <div className="flex">
                                        <div className="w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                                        <div className="flex-1 p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[8px] font-bold text-primary border-primary/20 h-4 px-1.5">{entry.intent_id}</Badge>
                                                        <span className="text-[8px] text-muted-foreground font-mono">ID: {entry.doc_id}</span>
                                                    </div>
                                                    <h3 className="text-base font-extrabold tracking-tight group-hover:text-primary transition-colors">
                                                        {entry.title || entry.description}
                                                    </h3>
                                                </div>
                                                <div className="p-1.5 rounded-lg bg-muted border border-border/50 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-3">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                        <Info className="w-2.5 h-2.5" /> Analysis Summary
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                                        {entry.root_cause_analysis || entry.description}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                        <Zap className="w-2.5 h-2.5" /> Key Signal Metrics
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {entry.situation.metrics.slice(0, 4).map((m, idx) => (
                                                            <div key={idx} className="px-1.5 py-1 rounded-md bg-muted/50 border border-border/30 flex flex-col gap-0.5 min-w-[80px]">
                                                                <span className="text-[7px] font-bold uppercase text-muted-foreground truncate">{m.metric}</span>
                                                                <span className="text-[9px] font-bold">{m.op} {m.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-dashed">
                                                <div className="flex gap-1.5">
                                                    {entry.keywords.slice(0, 6).map(k => (
                                                        <Badge key={k} variant="secondary" className="text-[8px] font-medium opacity-70 h-4 px-1.5">#{k}</Badge>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground">
                                                    <span className="flex items-center gap-1"><History className="w-2.5 h-2.5" /> v{entry.metadata.version}</span>
                                                    <span className="flex items-center gap-1 uppercase"><Badge variant="outline" className="text-[8px] h-4 px-1.5">{entry.metadata.severity}</Badge></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {viewMode === 'detail' && selectedEntry && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="max-w-6xl mx-auto space-y-6"
                        >
                            {/* Title Section */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-2 py-0.5 text-[10px]">{selectedEntry.intent_id}</Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">DOC ID: {selectedEntry.doc_id}</span>
                                    <Badge variant="outline" className="text-[9px] font-bold text-amber-500 border-amber-500/30 uppercase ml-auto">
                                        {selectedEntry.metadata?.severity || 'MEDIUM'} SEVERITY
                                    </Badge>
                                </div>
                                <h1 className="text-2xl font-extrabold tracking-tight leading-tight">{selectedEntry.title || selectedEntry.description}</h1>
                                <p className="text-muted-foreground text-xs leading-relaxed max-w-4xl italic">"{selectedEntry.description}"</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Left Column: Logic & Analysis */}
                                <div className="lg:col-span-2 space-y-6">
                                    
                                    {/* Analysis Section */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-2 text-primary">
                                            <BrainCircuit className="w-4 h-4" />
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Root Cause Analysis</h3>
                                        </div>
                                        <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-[13px] leading-relaxed font-medium shadow-inner">
                                            {selectedEntry.root_cause_analysis || "No detailed analysis provided."}
                                        </div>
                                    </section>

                                    {/* Symptoms & Indicators */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <section>
                                            <div className="flex items-center gap-2 mb-3 text-amber-500">
                                                <Activity className="w-4 h-4" />
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Symptoms</h3>
                                            </div>
                                            <div className="space-y-1.5">
                                                {selectedEntry.situation.symptoms.map((s, i) => (
                                                    <div key={i} className="flex gap-2 text-[11px] font-medium p-1.5 hover:bg-muted/30 rounded-md transition-colors border border-transparent hover:border-border/30">
                                                        <div className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-amber-500" />
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                        <section>
                                            <div className="flex items-center gap-2 mb-3 text-rose-500">
                                                <AlertTriangle className="w-4 h-4" />
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Negative Indicators</h3>
                                            </div>
                                            <div className="space-y-1.5">
                                                {selectedEntry.situation.negative_indicators.map((s, i) => (
                                                    <div key={i} className="flex gap-2 text-[11px] font-medium p-1.5 hover:bg-muted/30 rounded-md transition-colors opacity-80 border border-transparent hover:border-border/30">
                                                        <X className="mt-1 flex-shrink-0 w-2.5 h-2.5 text-rose-500" />
                                                        {s}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Hypotheses */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                            <Shield className="w-5 h-5" />
                                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Verification Hypotheses</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedEntry.hypotheses.map((h, i) => (
                                                <div key={i} className="p-4 rounded-xl border border-border/50 bg-card hover:border-emerald-500/30 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-bold text-muted-foreground font-mono">{h.id}</span>
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">W: {h.weight}</Badge>
                                                    </div>
                                                    <p className="text-xs font-bold mb-3">{h.description}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {h.log_patterns.slice(0, 2).map(lp => (
                                                            <Badge key={lp} variant="secondary" className="text-[8px] opacity-70">{lp}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Configuration & Metadata */}
                                <div className="space-y-10">
                                    
                                    {/* Hierarchy Card */}
                                    <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Database className="w-4 h-4 text-primary" /> Classification
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Domain</span>
                                                    <Badge variant="secondary" className="font-bold">{selectedEntry.category}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Category</span>
                                                    <Badge variant="secondary" className="font-bold">{selectedEntry.sub_category}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-muted-foreground">Sub-Category</span>
                                                    <Badge variant="secondary" className="font-bold">{selectedEntry.issue_group}</Badge>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                                    <Tag className="w-3 h-3" /> Keywords
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedEntry.keywords.slice(0, 10).map(kw => (
                                                        <Badge key={kw} variant="outline" className="text-[9px] opacity-70">{kw}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Metrics Section */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4 text-blue-500">
                                            <Zap className="w-5 h-5" />
                                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Signal Metrics</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {selectedEntry.situation.metrics.map((s, i) => (
                                                <div key={i} className="p-3 rounded-xl border bg-card flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-muted-foreground uppercase font-mono">{s.metric}</p>
                                                        <p className="text-xs font-bold">{s.op} {s.value}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="h-1 w-12 bg-muted rounded-full overflow-hidden mb-1">
                                                            <div className="h-full bg-blue-500" style={{ width: `${s.weight * 100}%` }} />
                                                        </div>
                                                        <p className="text-[9px] font-bold text-blue-500">{Math.round(s.weight * 100)}% Weight</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Templates & Code */}
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Code className="w-5 h-5" />
                                            <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Render Template</h3>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] leading-relaxed border border-slate-800">
                                            {selectedEntry.render_template}
                                        </div>
                                    </section>

                                    {/* Metadata Footer Card */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                                            <User className="w-4 h-4 mx-auto mb-2 text-muted-foreground opacity-50" />
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Author</p>
                                            <p className="text-xs font-bold capitalize">{selectedEntry.metadata.created_by}</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                                            <History className="w-4 h-4 mx-auto mb-2 text-muted-foreground opacity-50" />
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase">Version</p>
                                            <p className="text-xs font-bold">v{selectedEntry.metadata.version}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </ScrollArea>

            {/* Editor Drawer (Kept as drawer for focus) */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setIsEditorOpen(false)} />
                    <div className="relative w-[500px] h-full bg-card border-l shadow-2xl flex flex-col p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-lg font-bold">ENTRY EDITOR</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditorOpen(false)}><X className="w-5 h-5" /></Button>
                        </div>
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Record ID (Doc ID)</Label>
                                    <Input value={editingEntry?.doc_id} onChange={(e) => setEditingEntry({...editingEntry, doc_id: e.target.value})} disabled />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">RCA Intent ID</Label>
                                    <Input value={editingEntry?.intent_id} onChange={(e) => setEditingEntry({...editingEntry, intent_id: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Display Title</Label>
                                    <Input value={editingEntry?.title} onChange={(e) => setEditingEntry({...editingEntry, title: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Short Description</Label>
                                    <textarea 
                                        className="w-full h-20 p-3 bg-background border rounded-lg text-sm"
                                        value={editingEntry?.description}
                                        onChange={(e) => setEditingEntry({...editingEntry, description: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Detailed Root Cause Analysis</Label>
                                    <textarea 
                                        className="w-full h-40 p-3 bg-background border rounded-lg text-sm"
                                        value={editingEntry?.root_cause_analysis}
                                        onChange={(e) => setEditingEntry({...editingEntry, root_cause_analysis: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Domain</Label>
                                        <Input value={editingEntry?.category} onChange={(e) => setEditingEntry({...editingEntry, category: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Category</Label>
                                        <Input value={editingEntry?.sub_category} onChange={(e) => setEditingEntry({...editingEntry, sub_category: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-bold uppercase">Sub-Category</Label>
                                        <Input value={editingEntry?.issue_group} onChange={(e) => setEditingEntry({...editingEntry, issue_group: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase">Render Template</Label>
                                    <Input value={editingEntry?.render_template} onChange={(e) => setEditingEntry({...editingEntry, render_template: e.target.value})} placeholder="e.g. default, table, list" />
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="flex gap-3 pt-6 border-t mt-auto">
                            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditorOpen(false)}>CANCEL</Button>
                            <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} SAVE RECORD
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
