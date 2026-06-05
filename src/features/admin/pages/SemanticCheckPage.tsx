import { useState } from 'react';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent } from '@/shared/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Switch } from '@/shared/components/ui/switch';
import { toast } from 'sonner';
import {
    Brain, Cpu, Layers, RefreshCw, X, Save, ChevronDown, ChevronRight,
    Search, Database, CheckCircle2, Info, Zap, ArrowUpDown, AlertCircle,
    Play, Sparkles, BookOpen, BarChart2, Compass
} from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

const SCENARIOS: Record<string, [string, string]> = {
    "1. Paraphrase": ["Network latency is high", "High delay in network"],
    "2. Same words, different meaning": ["Server is down", "Shut down the server"],
    "3. Completely different": ["I like pizza", "Router failure detected"],
    "4. Technical logs": ["Interface Gig0/1 down", "Link failure on Gig0/1"],
    "5. Subtle variation": ["CPU usage increased", "CPU usage slightly increased"]
};

export default function SemanticCheckPage() {
    const navigate = useNavigate();
    const [sentenceA, setSentenceA] = useState("Network latency is high");
    const [sentenceB, setSentenceB] = useState("High delay in network");
    const [modelName, setModelName] = useState("all-MiniLM-L6-v2");
    const [poolingStrategy, setPoolingStrategy] = useState("Mean Pooling");
    const [selectedScenario, setSelectedScenario] = useState("");
    const [compareAll, setCompareAll] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'theory' | 'results' | 'tokens' | 'viz'>('results');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    const handleScenarioChange = (val: string) => {
        setSelectedScenario(val);
        if (SCENARIOS[val]) {
            setSentenceA(SCENARIOS[val][0]);
            setSentenceB(SCENARIOS[val][1]);
        }
    };

    const handleAnalyze = async () => {
        if (!sentenceA.trim() || !sentenceB.trim()) {
            toast.error("Please enter text for both sentences.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/training/semantic-check`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sentence_a: sentenceA,
                    sentence_b: sentenceB,
                    model_name: modelName,
                    pooling_strategy: poolingStrategy
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server responded with ${res.status}`);
            }

            const result = await res.json();
            setData(result);
            toast.success("Semantic embeddings analyzed successfully!");
        } catch (e: any) {
            toast.error(`Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score > 0.8) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
        if (score > 0.5) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        return 'text-red-500 bg-red-500/10 border-red-500/30';
    };

    const getInterpretation = (score: number) => {
        if (score > 0.8) return { text: "Very Similar", desc: "The sentences describe almost identical semantics or concepts." };
        if (score > 0.5) return { text: "Moderately Similar", desc: "The sentences share some semantic elements but differ in detail or focus." };
        return { text: "Not Similar", desc: "The sentences are semantically distinct and represent different concepts." };
    };

    const getHeatmapColor = (val: number) => {
        const absVal = Math.min(Math.abs(val), 1.0);
        return val >= 0 
            ? `rgba(59, 130, 246, ${absVal * 0.85})` 
            : `rgba(239, 68, 68, ${absVal * 0.85})`;  
    };

    return (
        <MainLayout>
            <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-background">
                
                {/* Header */}
                <div className="shrink-0 border-b border-border px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center animate-pulse">
                            <Brain className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold">Semantic Check Explorer</h1>
                            <p className="text-xs text-muted-foreground">Experiment with Sentence Transformers, manual token pooling, and cosine similarity</p>
                        </div>
                    </div>
                </div>

                {/* Content Body split in Left Configuration & Right Main Panel */}
                <div className="flex-1 flex overflow-hidden">
                        
                        {/* Left sidebar: Configuration controls */}
                        <div className="w-80 shrink-0 border-r border-border/50 flex flex-col bg-card/10 h-full">
                            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                                
                                {/* 1. Model Configuration */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Model Configuration</h3>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="model-select" className="text-xs font-semibold text-muted-foreground">Select SBERT Model</Label>
                                        <Select value={modelName} onValueChange={setModelName}>
                                            <SelectTrigger id="model-select" className="h-9 text-xs bg-background">
                                                <SelectValue placeholder="Select Model" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (Fast, 384d, Cached)</SelectItem>
                                                <SelectItem value="BAAI/bge-base-en-v1.5">bge-base-en-v1.5 (High Accuracy, 768d, Cached)</SelectItem>
                                                <SelectItem value="all-mpnet-base-v2">all-mpnet-base-v2 (Accurate, 768d)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* 2. Scenario Playground */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Scenario Playground</h3>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="scenario-select" className="text-xs font-semibold text-muted-foreground">Choose a scenario</Label>
                                        <Select value={selectedScenario} onValueChange={handleScenarioChange}>
                                            <SelectTrigger id="scenario-select" className="h-9 text-xs bg-background">
                                                <SelectValue placeholder="Select Scenario..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Custom Sentences</SelectItem>
                                                {Object.keys(SCENARIOS).map((key) => (
                                                    <SelectItem key={key} value={key}>{key}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* 3. Pooling Strategy */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Pooling Strategy</h3>
                                    <div className="space-y-3 p-3 rounded-lg border border-border/40 bg-background/50">
                                        <RadioGroup value={poolingStrategy} onValueChange={setPoolingStrategy} className="space-y-2">
                                            <div className="flex items-center space-x-2.5">
                                                <RadioGroupItem value="Mean Pooling" id="mean-pooling" className="scale-90" />
                                                <Label htmlFor="mean-pooling" className="text-xs cursor-pointer">Mean Pooling</Label>
                                            </div>
                                            <div className="flex items-center space-x-2.5">
                                                <RadioGroupItem value="Max Pooling" id="max-pooling" className="scale-90" />
                                                <Label htmlFor="max-pooling" className="text-xs cursor-pointer">Max Pooling</Label>
                                            </div>
                                            <div className="flex items-center space-x-2.5">
                                                <RadioGroupItem value="CLS Pooling" id="cls-pooling" className="scale-90" />
                                                <Label htmlFor="cls-pooling" className="text-xs cursor-pointer">CLS Pooling</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                {/* 4. Compare All Methods */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between rounded-lg border border-border/40 p-3 bg-background/50">
                                        <Label htmlFor="compare-all" className="text-xs cursor-pointer font-semibold text-foreground">👉 Compare All Methods</Label>
                                        <Switch 
                                            id="compare-all"
                                            checked={compareAll} 
                                            onCheckedChange={setCompareAll}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Right Area: Main scrollable panel with inputs and results */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-background">
                            <ScrollArea className="flex-1">
                                <div className="p-6 space-y-6 max-w-5xl mx-auto pb-16">
                                    
                                    {/* Page Title */}
                                    <div className="flex items-center gap-3 pb-2 border-b border-border/40">
                                        <span className="text-3xl">🧠</span>
                                        <div>
                                            <h2 className="text-2xl font-bold tracking-tight">Sentence Transformer & Pooling Explorer</h2>
                                            <p className="text-xs text-muted-foreground mt-0.5">Explore how SBERT turns text into semantic vectors and how CLS, Mean, and Max pooling strategies impact cosine similarity.</p>
                                        </div>
                                    </div>

                                    {/* Input Sentences Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <span>📝</span> Input Sentences
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sentence-a" className="text-xs font-semibold text-muted-foreground">Sentence A</Label>
                                                <textarea
                                                    id="sentence-a"
                                                    value={sentenceA}
                                                    onChange={(e) => {
                                                        setSentenceA(e.target.value);
                                                        setSelectedScenario("");
                                                    }}
                                                    rows={4}
                                                    className="w-full p-3 bg-background border border-border rounded-xl text-xs font-sans leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                                                    placeholder="Enter sentence A..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="sentence-b" className="text-xs font-semibold text-muted-foreground">Sentence B</Label>
                                                <textarea
                                                    id="sentence-b"
                                                    value={sentenceB}
                                                    onChange={(e) => {
                                                        setSentenceB(e.target.value);
                                                        setSelectedScenario("");
                                                    }}
                                                    rows={4}
                                                    className="w-full p-3 bg-background border border-border rounded-xl text-xs font-sans leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground"
                                                    placeholder="Enter sentence B..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Analyze Button */}
                                    <div>
                                        <Button 
                                            onClick={handleAnalyze} 
                                            disabled={loading} 
                                            className="gap-2 text-xs font-bold px-6 py-2.5 h-auto rounded-xl"
                                        >
                                            {loading ? (
                                                <>
                                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    🚀 Analyze Embeddings
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Results tabs & visualizations */}
                                    {data ? (
                                        <div className="space-y-6 pt-6 border-t border-border/40">
                                            
                                            {/* Tabs Headers */}
                                            <div className="flex gap-1 border-b border-border/40 pb-px">
                                                {([
                                                    { id: 'theory', label: '🎓 Theory & Concepts' },
                                                    { id: 'results', label: '📊 Results & Logic' },
                                                    { id: 'tokens', label: '🔍 Token Analysis' },
                                                    { id: 'viz', label: '🌈 2D Visualization' }
                                                ] as const).map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setActiveTab(t.id)}
                                                        className={`px-4 py-2 text-xs font-bold border-b-2 transition-all duration-200 ${
                                                            activeTab === t.id
                                                                ? 'border-primary text-primary font-extrabold'
                                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                                        }`}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Tab Content Panels */}
                                            
                                            {/* TAB: Theory */}
                                            {activeTab === 'theory' && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">🎓 Simple Concepts</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <Card className="bg-card/50 border-border/40">
                                                            <CardContent className="p-5 space-y-3">
                                                                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">📖 What is a Sentence Transformer?</h4>
                                                                <ul className="text-xs space-y-2 text-muted-foreground list-disc list-inside leading-relaxed">
                                                                    <li><strong>The Goal:</strong> Turn text into a list of numbers (a vector) that represents its meaning.</li>
                                                                    <li><strong>Example:</strong> "I love cats" and "I like kittens" should have very similar vectors.</li>
                                                                    <li><strong>The Machine:</strong> SBERT is like a specialized translator that speaks both English and 'Math'.</li>
                                                                </ul>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="bg-card/50 border-border/40">
                                                            <CardContent className="p-5 space-y-3">
                                                                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">🏊 What is Pooling?</h4>
                                                                <ul className="text-xs space-y-2 text-muted-foreground list-disc list-inside leading-relaxed">
                                                                    <li><strong>The Problem:</strong> A sentence has many words (tokens). Each word gets its own vector.</li>
                                                                    <li><strong>The Solution:</strong> We need to combine all word vectors into <strong>one single vector</strong> for the whole sentence.</li>
                                                                    <li><strong>Analogy:</strong> It's like taking multiple snapshots of a room and merging them into one panoramic view.</li>
                                                                </ul>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    <Card className="bg-card/30 border-border/30">
                                                        <CardContent className="p-5 space-y-4">
                                                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">⚖️ Deep Dive: Pooling Strategies</h4>
                                                            <ul className="text-xs space-y-2 text-muted-foreground leading-relaxed">
                                                                <li><strong className="text-foreground">Mean Pooling:</strong> Average of all word vectors. (Most common / stable)</li>
                                                                <li><strong className="text-foreground">Max Pooling:</strong> Takes the highest value for each feature. (Highlights important keywords)</li>
                                                                <li><strong className="text-foreground">CLS Pooling:</strong> Uses a special 'Master Token' ([CLS]) designed to represent the whole sentence.</li>
                                                            </ul>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}

                                            {/* TAB: Results & Logic */}
                                            {activeTab === 'results' && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    
                                                    {/* Comparative Mode or Single Mode Score */}
                                                    <div className="space-y-2">
                                                        <h3 className="text-sm font-bold text-foreground">
                                                            Similarity Score: <span className={data.selected_similarity > 0.8 ? 'text-emerald-500' : data.selected_similarity > 0.5 ? 'text-amber-500' : 'text-red-500'}>{data.selected_similarity.toFixed(4)}</span>
                                                        </h3>
                                                        <div className="p-4 rounded-xl border border-border/40 bg-card/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                                                            <div>
                                                                <div className="text-xs font-black uppercase text-muted-foreground mb-0.5">Interpretation</div>
                                                                <div className="text-sm font-bold">{getInterpretation(data.selected_similarity).text}</div>
                                                                <div className="text-xs text-muted-foreground">{getInterpretation(data.selected_similarity).desc}</div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Badge variant="outline" className="text-[10px] font-mono">{poolingStrategy}</Badge>
                                                                <Badge variant="outline" className="text-[10px] font-mono">{modelName}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Comparisons list if Compare All methods is checked */}
                                                    {compareAll && (
                                                        <Card className="border-border/40 bg-card/20">
                                                            <CardContent className="p-4 space-y-3">
                                                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pooling Strategies Comparison</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                    {Object.entries(data.similarities).map(([strat, score]: any) => {
                                                                        const isSelected = strat === data.selected_strategy;
                                                                        return (
                                                                            <div 
                                                                                key={strat} 
                                                                                className={`p-3 rounded-xl border transition-all ${
                                                                                    isSelected 
                                                                                        ? 'border-primary/50 bg-primary/5 shadow-md shadow-primary/5' 
                                                                                        : 'border-border/40 bg-background/40'
                                                                                }`}
                                                                            >
                                                                                <div className="flex justify-between items-center mb-1">
                                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{strat}</span>
                                                                                    {isSelected && <Badge className="text-[8px] bg-primary text-primary-foreground font-black px-1.5 h-3.5">Active</Badge>}
                                                                                </div>
                                                                                <div className="text-lg font-mono font-bold tracking-tight">{score.toFixed(4)}</div>
                                                                                <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden mt-2">
                                                                                    <div 
                                                                                        className={`h-full rounded-full ${isSelected ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                                                                        style={{ width: `${Math.max(0, score * 100)}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    {/* Calculation Details */}
                                                    <div className="space-y-4">
                                                        <h3 className="text-sm font-bold text-foreground">🧮 Logic Breakdown</h3>
                                                        
                                                        {/* Sentence A calculations */}
                                                        <Card className="border-border/40 bg-card/30">
                                                            <CardContent className="p-4 space-y-2 text-xs leading-relaxed">
                                                                <h4 className="font-bold text-foreground">Input A</h4>
                                                                <p className="text-muted-foreground"><strong className="text-foreground">Text:</strong> {sentenceA}</p>
                                                                <p className="text-muted-foreground">Converted to a pooled vector:</p>
                                                                <div className="p-3 bg-background/50 rounded-lg border border-border/40 text-[11px] font-mono text-primary/80 break-all leading-snug">
                                                                    [{data.vector_a_preview.join(', ')}, ...]
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground"><strong>Shape:</strong> <code>({data.vector_shape.join(', ')})</code> (Full vector has {data.vector_shape[0]} dimensions)</p>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Sentence B calculations */}
                                                        <Card className="border-border/40 bg-card/30">
                                                            <CardContent className="p-4 space-y-2 text-xs leading-relaxed">
                                                                <h4 className="font-bold text-foreground">Input B</h4>
                                                                <p className="text-muted-foreground"><strong className="text-foreground">Text:</strong> {sentenceB}</p>
                                                                <p className="text-muted-foreground">Converted to a pooled vector:</p>
                                                                <div className="p-3 bg-background/50 rounded-lg border border-border/40 text-[11px] font-mono text-primary/80 break-all leading-snug">
                                                                    [{data.vector_b_preview.join(', ')}, ...]
                                                                </div>
                                                                <p className="text-[10px] text-muted-foreground"><strong>Shape:</strong> <code>({data.vector_shape.join(', ')})</code></p>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Similarity Calculations Details */}
                                                        <Card className="border-border/40 bg-card/30">
                                                            <CardContent className="p-4 space-y-3 text-xs leading-relaxed">
                                                                <h4 className="font-bold text-foreground">📐 Similarity Calculation Details</h4>
                                                                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-background/50 border border-border/40 font-mono text-[11px] space-y-2">
                                                                    <div className="text-sm font-bold text-primary">Similarity = (A · B) / (||A|| * ||B||)</div>
                                                                    <div className="text-left w-full space-y-1 mt-1 text-[10px] text-muted-foreground">
                                                                        <div>- Dot Product: <code>{data.calculation_details.dot_product.toFixed(4)}</code></div>
                                                                        <div>- Norm A: <code>{data.calculation_details.norm_a.toFixed(4)}</code>, Norm B: <code>{data.calculation_details.norm_b.toFixed(4)}</code></div>
                                                                        <div>- Result: <code>{data.calculation_details.dot_product.toFixed(4)} / ({data.calculation_details.norm_a.toFixed(4)} * {data.calculation_details.norm_b.toFixed(4)}) = {data.selected_similarity.toFixed(4)}</code></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TAB: Token Analysis */}
                                            {activeTab === 'tokens' && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    <h3 className="text-sm font-bold text-foreground">🪙 Token-Level Embeddings</h3>
                                                    
                                                    <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-xs text-muted-foreground leading-relaxed">
                                                        <p className="font-bold text-blue-500 mb-1">How to read the colors?</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            <li>Each word is a row. Each column is a 'feature' the model detected.</li>
                                                            <li><strong>Blue blocks</strong> indicate positive feature values; <strong>Red blocks</strong> indicate negative values. Darker opacity represents stronger magnitude.</li>
                                                            <li><strong>Visualizing:</strong> Notice how related words (like 'latency' and 'delay') often have similar 'spots' in the same columns.</li>
                                                        </ul>
                                                    </div>

                                                    <p className="text-[10px] text-muted-foreground font-mono">Showing first 10 reference dimensions (Full size is 384/768).</p>

                                                    {/* Sentence A Heatmap */}
                                                    <div className="space-y-2">
                                                        <h5 className="text-xs font-bold text-foreground font-sans">Sentence A Tokens:</h5>
                                                        <div className="overflow-x-auto border border-border/50 rounded-xl bg-card/30">
                                                            <table className="w-full text-[10px] border-collapse font-mono">
                                                                <thead>
                                                                    <tr className="bg-muted/30 border-b border-border/50">
                                                                        <th className="px-3 py-2 text-left font-bold text-muted-foreground w-28">Token</th>
                                                                        {Array.from({ length: 10 }).map((_, i) => (
                                                                            <th key={i} className="px-2 py-2 text-center text-muted-foreground w-12 border-l border-border/40">Dim {i}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {data.token_analysis_a.map((t: any, idx: number) => (
                                                                        <tr key={idx} className="border-b border-border/40 last:border-0 hover:bg-muted/10">
                                                                            <td className="px-3 py-1.5 font-bold text-foreground">{t.token}</td>
                                                                            {t.values.map((v: number, vIdx: number) => (
                                                                                <td 
                                                                                    key={vIdx} 
                                                                                    className="px-2 py-1.5 text-center text-white border-l border-border/40 font-mono text-[9px] relative font-semibold"
                                                                                    style={{ backgroundColor: getHeatmapColor(v) }}
                                                                                    title={`Value: ${v}`}
                                                                                >
                                                                                    {v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                    {/* Sentence B Heatmap */}
                                                    <div className="space-y-2">
                                                        <h5 className="text-xs font-bold text-foreground font-sans">Sentence B Tokens:</h5>
                                                        <div className="overflow-x-auto border border-border/50 rounded-xl bg-card/30">
                                                            <table className="w-full text-[10px] border-collapse font-mono">
                                                                <thead>
                                                                    <tr className="bg-muted/30 border-b border-border/50">
                                                                        <th className="px-3 py-2 text-left font-bold text-muted-foreground w-28">Token</th>
                                                                        {Array.from({ length: 10 }).map((_, i) => (
                                                                            <th key={i} className="px-2 py-2 text-center text-muted-foreground w-12 border-l border-border/40">Dim {i}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {data.token_analysis_b.map((t: any, idx: number) => (
                                                                        <tr key={idx} className="border-b border-border/40 last:border-0 hover:bg-muted/10">
                                                                            <td className="px-3 py-1.5 font-bold text-foreground">{t.token}</td>
                                                                            {t.values.map((v: number, vIdx: number) => (
                                                                                <td 
                                                                                    key={vIdx} 
                                                                                    className="px-2 py-1.5 text-center text-white border-l border-border/40 font-mono text-[9px] relative font-semibold"
                                                                                    style={{ backgroundColor: getHeatmapColor(v) }}
                                                                                    title={`Value: ${v}`}
                                                                                >
                                                                                    {v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                                                                                </td>
                                                                            ))}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TAB: Visualization */}
                                            {activeTab === 'viz' && (
                                                <div className="space-y-6 animate-in fade-in duration-300">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-foreground">🗺️ 2D Semantic Mapping</h3>
                                                        <p className="text-xs text-muted-foreground mt-0.5">This map reduces the massive vector space into 2D so we can see how 'close' the meanings are.</p>
                                                    </div>

                                                    <div className="h-[450px] border border-border/40 bg-card/20 rounded-2xl p-5 relative overflow-hidden">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <ScatterChart
                                                                margin={{ top: 20, right: 30, bottom: 20, left: 10 }}
                                                            >
                                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                                                <XAxis type="number" dataKey="x" name="x" stroke="rgba(255,255,255,0.4)" fontSize={10} domain={['auto', 'auto']} />
                                                                <YAxis type="number" dataKey="y" name="y" stroke="rgba(255,255,255,0.4)" fontSize={10} domain={['auto', 'auto']} />
                                                                <Tooltip 
                                                                    cursor={{ strokeDasharray: '3 3' }} 
                                                                    content={({ active, payload }) => {
                                                                        if (active && payload && payload.length) {
                                                                            const point = payload[0].payload;
                                                                            return (
                                                                                <div className="p-3 bg-background border border-border rounded-xl shadow-xl space-y-1">
                                                                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-wider font-mono h-4 bg-muted">{point.type}</Badge>
                                                                                    <p className="text-xs font-black font-sans text-foreground">{point.label}</p>
                                                                                    <p className="text-[10px] font-mono text-muted-foreground">Coords: ({point.x.toFixed(4)}, {point.y.toFixed(4)})</p>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }}
                                                                />
                                                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                                                
                                                                <Scatter 
                                                                    name="Sentence (Final)" 
                                                                    data={data.pca_points.filter((p: any) => p.type === 'Sentence (Final)')} 
                                                                    fill="#3b82f6" 
                                                                    shape="cross"
                                                                />
                                                                
                                                                <Scatter 
                                                                    name="Tokens from SA" 
                                                                    data={data.pca_points.filter((p: any) => p.type === 'Tokens from SA')} 
                                                                    fill="#10b981" 
                                                                    shape="circle" 
                                                                />
                                                                
                                                                <Scatter 
                                                                    name="Tokens from SB" 
                                                                    data={data.pca_points.filter((p: any) => p.type === 'Tokens from SB')} 
                                                                    fill="#f59e0b" 
                                                                    shape="circle" 
                                                                />
                                                            </ScatterChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl border border-blue-500/10 bg-blue-500/5 text-blue-500 text-xs font-semibold flex items-center gap-2">
                                            <Info className="w-4 h-4 text-blue-500" />
                                            Click 'Analyze Embeddings' to get started!
                                        </div>
                                    )}

                                </div>
                            </ScrollArea>
                        </div>

                </div>
            </div>
        </MainLayout>
    );
}
