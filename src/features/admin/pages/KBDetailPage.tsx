import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ArrowLeft, BookOpen, Clock, Tag, ArrowRightCircle, CheckCircle2, AlertTriangle, Layers, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { mockKBArticlesEnhanced } from '@/features/admin/data/adminData';
import { useEffect, useState } from 'react';
import { KBArticle } from '@/shared/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';

function escapePlaceholders(md: string): string {
    return md.replace(/<([a-zA-Z][a-zA-Z0-9_-]*)>/g, (_, tag) => `\`<${tag}>\``);
}

export default function KBDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<KBArticle | null>(null);

    useEffect(() => {
        if (id) {
            const found = mockKBArticlesEnhanced.find(a => a.id === id);
            if (found) setArticle(found);
        }
    }, [id]);

    if (!article) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <h2 className="text-xl font-bold mb-4">Article Not Found</h2>
                    <Button onClick={() => navigate('/admin')}>Return to Admin</Button>
                </div>
            </MainLayout>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, duration: 0.3 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.97 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto py-4 px-5">

                {/* Top Nav */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin?section=KB')} className="mb-3 gap-2 text-slate-500 hover:text-primary transition-colors hover:bg-primary/5 rounded-full px-3">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-bold uppercase tracking-widest text-[10px]">Back to KnowledgeBase</span>
                    </Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-5 bg-card border border-white/5 rounded-2xl shadow relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/15 transition-all duration-700" />

                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
                                {article.category}
                            </Badge>
                            {article.subcategory && (
                                <Badge variant="secondary" className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 border-none font-bold uppercase tracking-wider text-[10px]">
                                    {article.subcategory}
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-lg lg:text-xl font-bold tracking-tight text-foreground leading-snug flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg w-fit shrink-0">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 bg-slate-500/5 px-3 py-1.5 rounded-lg border border-slate-500/10 w-fit">
                            <span className="flex items-center gap-1.5"><Tag className="h-3 w-3 text-primary" /> {article.id}</span>
                            <span className="flex items-center gap-1.5 border-l border-slate-500/20 pl-3"><Clock className="h-3 w-3 text-purple-400" /> Updated: {new Date(article.lastUpdated).toLocaleDateString()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Top Info Row: Root Issue | Linked Intents */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
                >
                    {/* Root Issue */}
                    <motion.section variants={itemVariants} className="md:col-span-1 lg:col-span-2 bg-destructive/5 border border-destructive/20 rounded-2xl p-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <AlertTriangle className="h-16 w-16 text-destructive" />
                        </div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2 text-destructive/80">
                            <AlertTriangle className="h-3 w-3" /> Root Issue
                        </h2>
                        <p className="text-sm font-semibold text-foreground leading-snug">{article.problem}</p>
                    </motion.section>

                    {/* Linked Intents */}
                    <motion.section variants={itemVariants} className="bg-card border border-white/5 rounded-2xl p-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-2 text-slate-400">
                            <LinkIcon className="h-3 w-3 text-blue-400" /> Linked Intents
                        </h2>
                        <div className="flex flex-col gap-1.5">
                            {article.linkedIntents.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground ">No intents linked</p>
                            ) : article.linkedIntents.map(intent => (
                                <div
                                    key={intent}
                                    onClick={() => navigate(`/admin?section=Intents&highlight=${encodeURIComponent(intent)}`)}
                                    className="bg-primary/5 hover:bg-primary/15 border border-primary/20 hover:border-primary/50 rounded-lg px-3 py-1.5 text-[11px] font-mono flex items-center gap-2 text-primary transition-all cursor-pointer group select-none"
                                    title={`Go to intent: ${intent}`}
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse group-hover:scale-125 transition-transform shrink-0" />
                                    <span className="flex-1">{intent}</span>
                                    <ArrowRightCircle className="ml-auto h-3 w-3 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all shrink-0" />
                                </div>
                            ))}
                        </div>
                    </motion.section>
                </motion.div>

                {/* Main Content: Intel Summary | Tactical Remediation Plan */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-5"
                >
                    {/* Intel Summary — now in main body */}
                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-8 bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 text-slate-400">
                                <BookOpen className="h-3.5 w-3.5 text-primary" /> Intel Summary
                            </h3>
                        </div>
                        <div className="p-4 prose prose-invert prose-sm max-w-none text-slate-300">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h3: ({node, ...props}) => <h3 className="text-primary font-black uppercase tracking-widest mt-4 mb-1.5 text-[10px]" {...props} />,
                                    ul: ({node, ...props}) => <ul className="space-y-1 my-2 list-none pl-0" {...props} />,
                                    li: ({node, ...props}) => (
                                        <li className="flex items-start gap-2 text-[11px] bg-white/5 px-2 py-1 rounded-md border border-white/5" {...props}>
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                            <span>{props.children}</span>
                                        </li>
                                    ),
                                    p: ({node, ...props}) => <p className="leading-relaxed text-[12px] opacity-80" {...props} />,
                                    code: ({node, ...props}) => <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-[10px] text-blue-400" {...props} />
                                }}
                            >
                                {escapePlaceholders(article.content)}
                            </ReactMarkdown>
                        </div>
                    </motion.div>

                    {/* Tactical Remediation Plan — now in sidebar */}
                    <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4">
                        <div className="bg-card border border-white/5 rounded-2xl p-4 relative overflow-hidden h-full">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 mb-3 text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" /> Tactical Remediation Plan
                            </h2>
                            <div className="flex flex-col gap-2">
                                {article.remedyItems.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ x: 4 }}
                                        className="flex gap-3 items-center bg-white/[0.02] hover:bg-white/[0.04] px-3 py-2 rounded-xl border border-white/5 transition-all group"
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs group-hover:bg-emerald-500 group-hover:text-white transition-all duration-200">
                                            {idx + 1}
                                        </div>
                                        <p className="text-foreground text-xs leading-snug">{item}</p>
                                        <ArrowRightCircle className="ml-auto h-3.5 w-3.5 text-slate-700 opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition-all shrink-0" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </MainLayout>
    );
}
