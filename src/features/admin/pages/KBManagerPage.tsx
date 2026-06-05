import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import {
    Plus, Search, Edit3, Trash2, BookOpen, AlertTriangle, Cpu, Network,
    RefreshCw, X, Save, ChevronDown, ChevronRight, Filter, Database,
    Tag, Layers, CheckCircle2, Info, Zap, ArrowUpDown, AlertCircle, Shield, Wrench, Server, Code
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { RcaKBSection } from '@/components/admin/RcaKBSection';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

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

const DOMAIN_COLORS: Record<string, any> = {
    Network: { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500', border: 'border-blue-500/30', icon: <Network className="w-4 h-4" /> },
    Compute: { bg: 'bg-purple-500/10', text: 'text-purple-500', accent: 'bg-purple-500', border: 'border-purple-500/30', icon: <Cpu className="w-4 h-4" /> },
    Storage: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', accent: 'bg-emerald-500', border: 'border-emerald-500/30', icon: <Database className="w-4 h-4" /> },
    Application: { bg: 'bg-orange-500/10', text: 'text-orange-500', accent: 'bg-orange-500', border: 'border-orange-500/30', icon: <Layers className="w-4 h-4" /> },
    Security: { bg: 'bg-red-500/10', text: 'text-red-500', accent: 'bg-red-500', border: 'border-red-500/30', icon: <Shield className="w-4 h-4" /> },
    default: { bg: 'bg-slate-500/10', text: 'text-slate-500', accent: 'bg-slate-500', border: 'border-slate-500/30', icon: <BookOpen className="w-4 h-4" /> }
};

const RISK_ICON: Record<string, JSX.Element> = {
    critical: <AlertCircle className="w-3.5 h-3.5 text-red-500" />,
    high: <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
    medium: <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />,
    low: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />,
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
    const navigate = useNavigate();
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

    // ── Drill-down Logic ──────────────────────────────────────────────────────
    const domains = [...new Set(entries.map(e => e.category_hierarchy?.domain || 'Network'))];
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

    const isDrilldownView = !search && !filterCat && !filterSev && !selectedDomain;

    const renderDrilldownCards = () => (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {domains.map(domain => {
                    const domainEntries = entries.filter(e => (e.category_hierarchy?.domain || 'Network') === domain);
                    const subcats = [...new Set(domainEntries.map(e => e.category_hierarchy?.category).filter(Boolean))];
                    
                    const topSeverity = domainEntries.some(e => e.metadata?.severity === 'critical') ? 'critical' 
                        : domainEntries.some(e => e.metadata?.severity === 'high') ? 'high' 
                        : domainEntries.some(e => e.metadata?.severity === 'medium') ? 'medium' : 'low';
                    
                    const config = DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;

                    return (
                        <Card
                            key={domain}
                            onClick={() => setSelectedDomain(domain)}
                            className="group cursor-pointer hover:border-primary/50 transition-all border-border/50 shadow-none rounded-xl overflow-hidden bg-card/50"
                        >
                            <div className={cn('h-1', config.accent)} />
                            <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={cn('p-1.5 rounded-lg', config.bg, config.text)}>
                                        {config.icon}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {RISK_ICON[topSeverity]}
                                        <Badge variant="secondary" className="font-bold text-[8px] h-3.5 px-1">{domainEntries.length} Entries</Badge>
                                    </div>
                                </div>
                                <h3 className="text-xs font-extrabold tracking-tight mb-0.5 truncate uppercase">{domain}</h3>
                                <p className="text-[9px] text-muted-foreground mb-3 line-clamp-1">Explore RCA entries</p>
                                
                                <div className="flex flex-wrap gap-1">
                                    {subcats.slice(0, 2).map(s => (
                                        <Badge key={s} variant="outline" className={cn('text-[7px] font-medium opacity-60 h-3 px-1 truncate max-w-[100px]', config.border)}>
                                            {s}
                                        </Badge>
                                    ))}
                                    {subcats.length > 2 && <span className="text-[7px] text-muted-foreground font-bold">+{subcats.length - 2} more</span>}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Quick Add Card */}
                <Card
                    className="group cursor-pointer border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all shadow-none rounded-xl flex flex-col items-center justify-center p-4 min-h-[100px]"
                    onClick={() => { setEditEntry({ ...EMPTY_ENTRY, metadata: { ...EMPTY_ENTRY.metadata!, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } }); setDrawerOpen(true); }}
                >
                    <div className="p-1.5 rounded-full bg-muted group-hover:bg-primary/20 group-hover:text-primary transition-all mb-1.5">
                        <Plus className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-wider">
                        ADD RCA ENTRY
                    </p>
                </Card>
            </div>
        </div>
    );

    // Apply domain filter to the existing filtered list
    const finalFiltered = selectedDomain 
        ? filtered.filter(e => (e.category_hierarchy?.domain || 'Network') === selectedDomain)
        : filtered;

    const categories = [...new Set(entries.map(e => e.category_hierarchy?.category).filter(Boolean))];
    const severities = ['critical', 'high', 'medium', 'low'];

    // Counts
    const catCounts = Object.fromEntries(categories.map(c => [c, entries.filter(e => e.category_hierarchy?.category === c).length]));
    const sevCounts = Object.fromEntries(severities.map(s => [s, entries.filter(e => e.metadata?.severity === s).length]));

    return (
        <MainLayout>
            <div className="flex h-[calc(100vh-4rem)]">
                <AdminSidebar activeSection="KBManager" onSectionChange={(section) => {
                    navigate(`/admin?section=${section}`);
                }} />
                <div className="flex flex-col flex-1 overflow-hidden bg-background text-foreground">
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
                        <RcaKBSection
                            entries={entries}
                            isLoading={loading}
                            onEdit={(entry) => { setEditEntry(entry); setDrawerOpen(true); }}
                            onNew={() => {
                                setEditEntry({
                                    ...EMPTY_ENTRY,
                                    metadata: { ...EMPTY_ENTRY.metadata!, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
                                });
                                setDrawerOpen(true);
                            }}
                            onDelete={(id) => {
                                const entry = entries.find(e => e._id === id);
                                if (entry) setDeleteEntry(entry);
                            }}
                        />
                    ) : (
                    <div className="flex flex-1 overflow-hidden">
                        <RemedyKBSection />
                    </div>
                    )}
                </div>
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
