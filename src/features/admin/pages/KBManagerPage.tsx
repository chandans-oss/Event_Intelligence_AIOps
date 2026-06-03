import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import {
    Plus, Search, Edit3, Trash2, BookOpen, AlertTriangle, Cpu, Network,
    RefreshCw, X, Save, ChevronDown, ChevronRight, Filter, Database,
    Tag, Layers, CheckCircle2, Info, Zap, ArrowUpDown,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001') + '/api/rag/kb/';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KBEntry {
    _id: string;
    doc_id?: string;
    rca_id: string;
    title: string;
    description: string;
    root_cause_analysis: string;
    situation: {
        symptoms: string[];
        negative_indicators: string[];
        log_patterns: string[];
        metrics: { metric: string; op: string; value: string | number; weight: number }[];
        affected_components: string[];
    };
    hypotheses: { id: string; description: string; weight: number; log_patterns: string[] }[];
    keywords: string[];
    render_template: string;
    metadata: {
        domain: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        version: number;
        is_latest: boolean;
        status: string;
        created_at: string;
        updated_at: string;
        created_by: string;
    };
    category_hierarchy: { domain: string; category: string; subcategory: string };
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
    critical: { label: 'Critical', dot: 'bg-red-500', badge: 'border-red-500/30 bg-red-500/10 text-red-400' },
    high:     { label: 'High',     dot: 'bg-orange-500', badge: 'border-orange-500/30 bg-orange-500/10 text-orange-400' },
    medium:   { label: 'Medium',   dot: 'bg-amber-500', badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
    low:      { label: 'Low',      dot: 'bg-green-500', badge: 'border-green-500/30 bg-green-500/10 text-green-400' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    Link: Network,
    Device: Cpu,
    'L2-Domain': Layers,
};

const EMPTY_ENTRY: Partial<KBEntry> = {
    _id: '',
    doc_id: '',
    rca_id: '',
    title: '',
    description: '',
    root_cause_analysis: '',
    situation: {
        symptoms: [],
        negative_indicators: [],
        log_patterns: [],
        metrics: [],
        affected_components: [],
    },
    hypotheses: [],
    keywords: [],
    render_template: '',
    metadata: {
        domain: 'network',
        severity: 'high',
        version: 1,
        is_latest: true,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'netops',
    },
    category_hierarchy: { domain: 'Network', category: 'Link', subcategory: '' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function arrToText(arr: string[] = []) { return arr.join('\n'); }
function textToArr(text: string) { return text.split('\n').map(s => s.trim()).filter(Boolean); }

// ─── TagInput ──────────────────────────────────────────────────────────────────
function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
    const [input, setInput] = useState('');
    const add = () => {
        const v = input.trim();
        if (v && !value.includes(v)) onChange([...value, v]);
        setInput('');
    };
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
                <Input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    placeholder={placeholder || 'Add item, press Enter'}
                    className="h-7 text-xs bg-background border-border" />
                <Button type="button" size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={add}>
                    <Plus className="w-3 h-3" />
                </Button>
            </div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {value.map((v, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono">
                            {v}
                            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="hover:text-red-400 transition-colors">
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Hypothesis Editor ─────────────────────────────────────────────────────────
function HypothesisEditor({ value, onChange }: {
    value: KBEntry['hypotheses'];
    onChange: (v: KBEntry['hypotheses']) => void;
}) {
    const add = () => onChange([...value, { id: '', description: '', weight: 0.1, log_patterns: [] }]);
    const update = (i: number, field: string, val: any) => {
        const next = [...value];
        (next[i] as any)[field] = val;
        onChange(next);
    };
    const remove = (i: number) => onChange(value.filter((_, j) => j !== i));

    return (
        <div className="flex flex-col gap-2">
            {value.map((h, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/10 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hypothesis {i + 1}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 text-red-400 hover:bg-red-500/10" onClick={() => remove(i)}>
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[10px] text-muted-foreground mb-0.5 block">ID</label>
                            <Input value={h.id} onChange={e => update(i, 'id', e.target.value)} className="h-6 text-[10px] font-mono bg-background" placeholder="H_MY_HYPOTHESIS" />
                        </div>
                        <div>
                            <label className="text-[10px] text-muted-foreground mb-0.5 block">Weight (0-1)</label>
                            <Input type="number" value={h.weight} step={0.05} min={0} max={1} onChange={e => update(i, 'weight', parseFloat(e.target.value) || 0)} className="h-6 text-[10px] bg-background" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Description</label>
                        <Input value={h.description} onChange={e => update(i, 'description', e.target.value)} className="h-6 text-[10px] bg-background" />
                    </div>
                    <div>
                        <label className="text-[10px] text-muted-foreground mb-0.5 block">Log Patterns (one per line)</label>
                        <textarea value={arrToText(h.log_patterns)} onChange={e => update(i, 'log_patterns', textToArr(e.target.value))}
                            className="w-full h-16 p-1.5 bg-background border border-border rounded text-[10px] font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    </div>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1.5" onClick={add}>
                <Plus className="w-3 h-3" /> Add Hypothesis
            </Button>
        </div>
    );
}

// ─── Section Collapse ─────────────────────────────────────────────────────────
function Section({ title, icon: Icon, defaultOpen = false, children }: { title: string; icon: React.ElementType; defaultOpen?: boolean; children: React.ReactNode }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
            <button type="button" onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/20 transition-colors">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 text-primary" /> {title}
                </span>
                {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            {open && <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border">{children}</div>}
        </div>
    );
}

// ─── Edit / Create Drawer ─────────────────────────────────────────────────────
function EntryDrawer({ entry, onClose, onSave }: {
    entry: Partial<KBEntry> | null;
    onClose: () => void;
    onSave: (e: Partial<KBEntry>) => Promise<void>;
}) {
    const isNew = !entry?._id || entry._id === '';
    const [form, setForm] = useState<Partial<KBEntry>>(entry ?? EMPTY_ENTRY);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { setForm(entry ?? { ...EMPTY_ENTRY, metadata: { ...EMPTY_ENTRY.metadata!, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } }); }, [entry]);

    const set = (path: string, val: any) => {
        setForm(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let cur = next;
            for (let i = 0; i < keys.length - 1; i++) {
                if (cur[keys[i]] === undefined || cur[keys[i]] === null) {
                    cur[keys[i]] = {};
                }
                cur = cur[keys[i]];
            }
            cur[keys[keys.length - 1]] = val;
            return next;
        });
    };

    const handleSubmit = async () => {
        setError('');
        if (!form._id || !form.rca_id || !form.title) { setError('ID, RCA ID, and Title are required.'); return; }
        setSaving(true);
        try {
            // Auto-update version and timestamp on edit
            const toSave = {
                ...form,
                metadata: {
                    ...form.metadata!,
                    updated_at: new Date().toISOString(),
                    version: isNew ? 1 : (form.metadata?.version || 1) + 1,
                }
            };
            await onSave(toSave);
            onClose();
        } catch (e: any) {
            setError(e.message || 'Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            {/* Drawer */}
            <div className="w-[680px] max-w-full h-full bg-background border-l border-border flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card/80 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            {isNew ? <Plus className="w-4 h-4 text-primary" /> : <Edit3 className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold">{isNew ? 'New RCA Entry' : 'Edit RCA Entry'}</p>
                            {!isNew && <p className="text-[10px] text-muted-foreground font-mono">{form._id}</p>}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}><X className="w-4 h-4" /></Button>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-5 space-y-3">
                        {error && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
                            </div>
                        )}

                        {/* Core Identity */}
                        <Section title="Core Identity" icon={Tag} defaultOpen>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Entry ID *</label>
                                    <Input value={form._id || ''} onChange={e => { set('_id', e.target.value); set('doc_id', e.target.value); }} placeholder="net-link-down-001" className="h-7 text-xs font-mono bg-background" disabled={!isNew} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Doc ID</label>
                                    <Input value={form.doc_id || ''} onChange={e => set('doc_id', e.target.value)} placeholder="net-link-down-001" className="h-7 text-xs font-mono bg-background" disabled={!isNew} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">RCA ID *</label>
                                    <Input value={form.rca_id || ''} onChange={e => set('rca_id', e.target.value)} placeholder="link.down" className="h-7 text-xs font-mono bg-background" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Title *</label>
                                <Input value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Physical Link Down - Optical Signal Lost" className="h-7 text-xs bg-background" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Short Description</label>
                                <Input value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="One-line description of the failure scenario" className="h-7 text-xs bg-background" />
                            </div>
                        </Section>

                        {/* Category */}
                        <Section title="Category Hierarchy" icon={Layers}>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Domain</label>
                                    <Input value={form.category_hierarchy?.domain || ''} onChange={e => set('category_hierarchy.domain', e.target.value)} placeholder="Network" className="h-7 text-xs bg-background" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Category</label>
                                    <select value={form.category_hierarchy?.category || 'Link'} onChange={e => set('category_hierarchy.category', e.target.value)}
                                        className="w-full h-7 px-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground">
                                        {['Link', 'Device', 'L2-Domain', 'Routing', 'Security', 'Application'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Subcategory</label>
                                    <Input value={form.category_hierarchy?.subcategory || ''} onChange={e => set('category_hierarchy.subcategory', e.target.value)} placeholder="Link Down" className="h-7 text-xs bg-background" />
                                </div>
                            </div>
                        </Section>

                        {/* Metadata */}
                        <Section title="Metadata" icon={Info}>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Severity</label>
                                    <select value={form.metadata?.severity || 'high'} onChange={e => set('metadata.severity', e.target.value)}
                                        className="w-full h-7 px-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground">
                                        {['critical', 'high', 'medium', 'low'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Created By</label>
                                    <Input value={form.metadata?.created_by || 'netops'} onChange={e => set('metadata.created_by', e.target.value)} className="h-7 text-xs bg-background" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
                                    <select value={form.metadata?.status || 'active'} onChange={e => set('metadata.status', e.target.value)}
                                        className="w-full h-7 px-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground">
                                        {['active', 'draft', 'deprecated'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </Section>

                        {/* RCA Text */}
                        <Section title="Root Cause Analysis" icon={BookOpen}>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Full RCA Description</label>
                            <textarea value={form.root_cause_analysis || ''} onChange={e => set('root_cause_analysis', e.target.value)} rows={5}
                                className="w-full p-2.5 bg-background border border-border rounded-lg text-xs leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground font-sans"
                                placeholder="Detailed root cause analysis text..." />
                        </Section>

                        {/* Situation */}
                        <Section title="Situation" icon={AlertTriangle}>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Symptoms</label>
                                <TagInput value={form.situation?.symptoms || []} onChange={v => set('situation.symptoms', v)} placeholder="e.g. oper_status is down" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Negative Indicators (rule-outs)</label>
                                <TagInput value={form.situation?.negative_indicators || []} onChange={v => set('situation.negative_indicators', v)} placeholder="e.g. Interface is flapping — see link.flap" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Log Patterns (one per line)</label>
                                <textarea value={arrToText(form.situation?.log_patterns)} onChange={e => set('situation.log_patterns', textToArr(e.target.value))} rows={5}
                                    className="w-full p-2 bg-background border border-border rounded-lg text-[10px] font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                                    placeholder="%LINK-3-UPDOWN: Interface .*, changed state to down" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Metrics (JSON Array)</label>
                                <textarea value={JSON.stringify(form.situation?.metrics || [], null, 2)} onChange={e => {
                                    try { set('situation.metrics', JSON.parse(e.target.value)); } catch(err) {}
                                }} rows={4}
                                    className="w-full p-2 bg-background border border-border rounded-lg text-[10px] font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                                    placeholder='[{"name": "cpu_usage", "condition": "> 90"}]' />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Affected Components</label>
                                <TagInput value={form.situation?.affected_components || []} onChange={v => set('situation.affected_components', v)} placeholder="e.g. network_interface" />
                            </div>
                        </Section>

                        {/* Hypotheses */}
                        <Section title="Hypotheses" icon={Zap}>
                            <HypothesisEditor
                                value={form.hypotheses || []}
                                onChange={v => setForm(prev => ({ ...prev, hypotheses: v }))}
                            />
                        </Section>

                        {/* Keywords */}
                        <Section title="Keywords & Template" icon={Search}>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Keywords</label>
                                <TagInput value={form.keywords || []} onChange={v => set('keywords', v)} placeholder="e.g. interface down" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Render Template</label>
                                <Input value={form.render_template || ''} onChange={e => set('render_template', e.target.value)}
                                    placeholder="Interface {interface} on device {device} is down."
                                    className="h-7 text-[10px] font-mono bg-background" />
                            </div>
                        </Section>
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-border bg-card/80 flex items-center justify-between shrink-0">
                    <p className="text-[10px] text-muted-foreground">* Required fields</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8" onClick={onClose}>Cancel</Button>
                        <Button size="sm" className="h-8 gap-1.5" onClick={handleSubmit} disabled={saving}>
                            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {isNew ? 'Create Entry' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteDialog({ entry, onClose, onConfirm }: { entry: KBEntry; onClose: () => void; onConfirm: () => Promise<void> }) {
    const [deleting, setDeleting] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-[400px] p-6 z-10">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-red-500/10 shrink-0">
                        <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1">Delete KB Entry?</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            This will permanently remove <span className="font-mono text-foreground">{entry._id}</span> from the knowledge base JSON file. This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                    <Button variant="outline" size="sm" className="h-8" onClick={onClose}>Cancel</Button>
                    <Button size="sm" className="h-8 bg-red-500 hover:bg-red-600 text-white gap-1.5" disabled={deleting}
                        onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false); }}>
                        {deleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete Entry
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Entry Card ────────────────────────────────────────────────────────────────
function EntryCard({ entry, onEdit, onDelete }: { entry: KBEntry; onEdit: () => void; onDelete: () => void }) {
    const sev = SEVERITY_CONFIG[entry.metadata?.severity] ?? SEVERITY_CONFIG.high;
    const CatIcon = CATEGORY_ICONS[entry.category_hierarchy?.category] ?? BookOpen;
    return (
        <div className="rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all group">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                        <CatIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-black border', sev.badge)}>
                                <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1 mb-[1px]', sev.dot)} />
                                {sev.label}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-mono h-4 px-1.5 bg-muted/20">
                                {entry.category_hierarchy?.category}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                {entry.category_hierarchy?.subcategory}
                            </Badge>
                        </div>
                        <h3 className="text-sm font-bold leading-snug mb-0.5 line-clamp-1">{entry.title}</h3>
                        <p className="text-[10px] font-mono text-primary/70 mb-1.5">{entry.rca_id}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{entry.description}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={onEdit}>
                            <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-500/10 hover:text-red-400" onClick={onDelete}>
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Bottom stats */}
                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {entry.hypotheses?.length ?? 0} hypotheses</span>
                    <span className="flex items-center gap-1"><Search className="w-3 h-3" /> {entry.keywords?.length ?? 0} keywords</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> v{entry.metadata?.version ?? 1}</span>
                    <span className="ml-auto font-mono">Updated {entry.metadata?.updated_at ? new Date(entry.metadata.updated_at).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
}

import { RemedyKBSection } from '@/components/admin/RemedyKBSection';

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function KBManagerPage() {
    const [activeTab, setActiveTab] = useState<'rca'|'remedy'>('rca');
    const [entries, setEntries] = useState<KBEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');
    const [filterSev, setFilterSev] = useState('');
    const [sortBy, setSortBy] = useState<'rca_id' | 'severity' | 'updated'>('rca_id');

    const [editEntry, setEditEntry] = useState<Partial<KBEntry> | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [deleteEntry, setDeleteEntry] = useState<KBEntry | null>(null);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setEntries(Array.isArray(data) ? data : []);
        } catch (e: any) {
            setError(e.message || 'Failed to load KB entries');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    // Save (create or update)
    const handleSave = async (entry: Partial<KBEntry>) => {
        const isNew = !entries.find(e => e._id === entry._id);
        const res = await fetch(API_BASE, {
            method: isNew ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || `HTTP ${res.status}`);
        }
        await fetchEntries();
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteEntry) return;
        const res = await fetch(`${API_BASE}?id=${encodeURIComponent(deleteEntry._id)}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setDeleteEntry(null);
        await fetchEntries();
    };

    // Filter + Sort
    const sevOrder = ['critical', 'high', 'medium', 'low'];
    const filtered = entries
        .filter(e => {
            if (filterCat && e.category_hierarchy?.category !== filterCat) return false;
            if (filterSev && e.metadata?.severity !== filterSev) return false;
            if (search) {
                const q = search.toLowerCase();
                return (
                    e.rca_id?.toLowerCase().includes(q) ||
                    e.title?.toLowerCase().includes(q) ||
                    e.description?.toLowerCase().includes(q) ||
                    e.keywords?.some(k => k.toLowerCase().includes(q))
                );
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'severity') return sevOrder.indexOf(a.metadata?.severity) - sevOrder.indexOf(b.metadata?.severity);
            if (sortBy === 'updated') return new Date(b.metadata?.updated_at || 0).getTime() - new Date(a.metadata?.updated_at || 0).getTime();
            return a.rca_id.localeCompare(b.rca_id);
        });

    const categories = [...new Set(entries.map(e => e.category_hierarchy?.category).filter(Boolean))];
    const severities = ['critical', 'high', 'medium', 'low'];

    // Counts
    const catCounts = Object.fromEntries(categories.map(c => [c, entries.filter(e => e.category_hierarchy?.category === c).length]));
    const sevCounts = Object.fromEntries(severities.map(s => [s, entries.filter(e => e.metadata?.severity === s).length]));

    return (
        <MainLayout>
            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground">
                {/* Header */}
                <div className="h-14 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm z-20 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-primary/10"><Database className="w-4 h-4 text-primary" /></div>
                            <div>
                                <h1 className="font-bold text-base tracking-tight">KB Manager</h1>
                                <p className="text-[10px] text-muted-foreground">{activeTab === 'rca' ? `RCA Knowledge Base — ${entries.length} entries` : 'Remedy Playbooks'}</p>
                            </div>
                        </div>
                        <div className="flex bg-muted/30 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('rca')} className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'rca' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>RCA KB</button>
                            <button onClick={() => setActiveTab('remedy')} className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", activeTab === 'remedy' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>Remedy KB</button>
                        </div>
                    </div>
                    {activeTab === 'rca' && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={fetchEntries} disabled={loading}>
                            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} /> Refresh
                        </Button>
                        <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => { setEditEntry({ ...EMPTY_ENTRY, metadata: { ...EMPTY_ENTRY.metadata!, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } }); setDrawerOpen(true); }}>
                            <Plus className="w-3.5 h-3.5" /> New Entry
                        </Button>
                    </div>
                    )}
                </div>

                {activeTab === 'rca' ? (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Filter Sidebar */}
                    <div className="w-56 shrink-0 border-r border-border bg-card/30 flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-border">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Filter className="w-3 h-3" /> Filters
                            </p>
                        </div>
                        <ScrollArea className="flex-1 px-3 py-3">
                            {/* Category */}
                            <div className="mb-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Category</p>
                                <button onClick={() => setFilterCat('')}
                                    className={cn('w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors mb-1',
                                        filterCat === '' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/30 text-muted-foreground')}>
                                    <span className="flex items-center gap-1.5"><BookOpen className="w-3 h-3" /> All</span>
                                    <span className="font-mono text-[10px]">{entries.length}</span>
                                </button>
                                {categories.map(cat => {
                                    const Icon = CATEGORY_ICONS[cat] ?? BookOpen;
                                    return (
                                        <button key={cat} onClick={() => setFilterCat(cat === filterCat ? '' : cat)}
                                            className={cn('w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors mb-1',
                                                filterCat === cat ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/30 text-muted-foreground')}>
                                            <span className="flex items-center gap-1.5"><Icon className="w-3 h-3" /> {cat}</span>
                                            <span className="font-mono text-[10px]">{catCounts[cat] ?? 0}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Severity */}
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Severity</p>
                                {severities.map(sev => {
                                    const cfg = SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG];
                                    return (
                                        <button key={sev} onClick={() => setFilterSev(sev === filterSev ? '' : sev)}
                                            className={cn('w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors mb-1',
                                                filterSev === sev ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-muted/30 text-muted-foreground')}>
                                            <span className="flex items-center gap-1.5">
                                                <span className={cn('w-2 h-2 rounded-full', cfg.dot)} /> {cfg.label}
                                            </span>
                                            <span className="font-mono text-[10px]">{sevCounts[sev] ?? 0}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active filter summary */}
                            {(filterCat || filterSev) && (
                                <div className="mt-4 pt-3 border-t border-border">
                                    <button onClick={() => { setFilterCat(''); setFilterSev(''); }}
                                        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] text-red-400 hover:bg-red-500/10 transition-colors">
                                        <X className="w-3 h-3" /> Clear all filters
                                    </button>
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Search + Sort bar */}
                        <div className="px-5 py-3 border-b border-border bg-card/20 flex items-center gap-3 shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by RCA ID, title, keyword..."
                                    className="pl-8 h-8 text-xs bg-background" />
                                {search && (
                                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                                    className="h-8 px-2 text-[11px] bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground">
                                    <option value="rca_id">Sort: RCA ID</option>
                                    <option value="severity">Sort: Severity</option>
                                    <option value="updated">Sort: Last Updated</option>
                                </select>
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {filtered.length} of {entries.length}
                            </span>
                        </div>

                        {/* Entry List */}
                        <ScrollArea className="flex-1">
                            <div className="p-5 space-y-3">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                        <RefreshCw className="w-8 h-8 animate-spin opacity-30" />
                                        <p className="text-sm">Loading knowledge base...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                                        <AlertTriangle className="w-10 h-10 text-red-400 opacity-60" />
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-red-400 mb-1">Failed to load KB</p>
                                            <p className="text-xs text-muted-foreground">{error}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={fetchEntries} className="gap-1.5">
                                            <RefreshCw className="w-3.5 h-3.5" /> Retry
                                        </Button>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                                        <Database className="w-10 h-10 opacity-20" />
                                        <div className="text-center">
                                            <p className="text-sm font-bold mb-1">No entries found</p>
                                            <p className="text-xs">{search || filterCat || filterSev ? 'Try adjusting your filters' : 'Create your first KB entry'}</p>
                                        </div>
                                        <Button size="sm" className="gap-1.5" onClick={() => { setEditEntry({ ...EMPTY_ENTRY, metadata: { ...EMPTY_ENTRY.metadata!, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } }); setDrawerOpen(true); }}>
                                            <Plus className="w-3.5 h-3.5" /> New Entry
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Group by category */}
                                        {(filterCat ? [filterCat] : categories).map(cat => {
                                            const catEntries = filtered.filter(e => e.category_hierarchy?.category === cat);
                                            if (catEntries.length === 0) return null;
                                            const Icon = CATEGORY_ICONS[cat] ?? BookOpen;
                                            return (
                                                <div key={cat}>
                                                    <div className="flex items-center gap-2 mb-2 mt-1">
                                                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cat}</span>
                                                        <div className="flex-1 h-px bg-border" />
                                                        <span className="text-[10px] text-muted-foreground font-mono">{catEntries.length}</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {catEntries.map(entry => (
                                                            <EntryCard
                                                                key={entry._id}
                                                                entry={entry}
                                                                onEdit={() => { setEditEntry(entry); setDrawerOpen(true); }}
                                                                onDelete={() => setDeleteEntry(entry)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* L2-Domain and others not in category list */}
                                        {filtered.filter(e => !categories.includes(e.category_hierarchy?.category)).length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 mt-1">
                                                    <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Other</span>
                                                    <div className="flex-1 h-px bg-border" />
                                                </div>
                                                <div className="space-y-2">
                                                    {filtered.filter(e => !categories.includes(e.category_hierarchy?.category)).map(entry => (
                                                        <EntryCard key={entry._id} entry={entry}
                                                            onEdit={() => { setEditEntry(entry); setDrawerOpen(true); }}
                                                            onDelete={() => setDeleteEntry(entry)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Stats footer */}
                        {!loading && !error && (
                            <div className="px-5 py-2.5 border-t border-border bg-card/30 flex items-center gap-4 shrink-0">
                                {severities.map(sev => (
                                    <div key={sev} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <span className={cn('w-2 h-2 rounded-full', SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG]?.dot)} />
                                        {sevCounts[sev] ?? 0} {SEVERITY_CONFIG[sev as keyof typeof SEVERITY_CONFIG]?.label}
                                    </div>
                                ))}
                                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3" /> KB Active
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                ) : (
                <div className="flex flex-1 overflow-hidden">
                    <RemedyKBSection />
                </div>
                )}
            </div>

            {/* Edit/Create Drawer */}
            {drawerOpen && (
                <EntryDrawer
                    entry={editEntry}
                    onClose={() => { setDrawerOpen(false); setEditEntry(null); }}
                    onSave={handleSave}
                />
            )}

            {/* Delete Dialog */}
            {deleteEntry && (
                <DeleteDialog
                    entry={deleteEntry}
                    onClose={() => setDeleteEntry(null)}
                    onConfirm={handleDelete}
                />
            )}
        </MainLayout>
    );
}
