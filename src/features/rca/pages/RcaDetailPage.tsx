import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getClusterData } from '@/features/rca/data/clusterData';
import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { TimelineFlow } from '@/components/rca/TimelineFlow';
import { Tabs, Tab, Paper, ThemeProvider, createTheme } from '@mui/material';
import { useTheme as useNextTheme } from 'next-themes';
import '@/styles/rcaPlayground.css';

// ──────────────────────────────────────────────────────
// Section renderer: matches "sections" array format
// ──────────────────────────────────────────────────────
function SectionItem({ section }: { section: any }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--rca-text-secondary)', marginBottom: 6
            }}>
                {section.title}
            </div>

            {section.type === 'text' && (
                <p style={{ fontSize: '0.92rem', color: 'var(--rca-text-primary)', lineHeight: 1.6, margin: 0 }}>
                    {section.content}
                </p>
            )}

            {section.type === 'kv' && (
                <div className="rca-grid">
                    {Object.entries(section.content as Record<string, string>).map(([k, v]) => (
                        <>
                            <div key={`k-${k}`} className="rca-k">{k}</div>
                            <div key={`v-${k}`} className="rca-v">{v}</div>
                        </>
                    ))}
                </div>
            )}

            {section.type === 'list' && (
                <div style={{ fontSize: '0.88rem', color: 'var(--rca-text-primary)' }}>
                    {(section.content as string[]).map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0' }}>
                            <span style={{ color: 'var(--rca-text-secondary)' }}>•</span>
                            <span style={{ wordBreak: 'break-word', lineHeight: 1.5 }}>{item}</span>
                        </div>
                    ))}
                </div>
            )}

            {section.type === 'scored-list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(section.content as any[]).map((item, i) => (
                        <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--rca-text-primary)' }}>{item.label}</span>
                                <span style={{
                                    fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700,
                                    background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                                    border: '1px solid rgba(59,130,246,0.3)', borderRadius: 4, padding: '1px 7px'
                                }}>{item.displayScore}</span>
                            </div>
                            <div style={{ height: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.min(item.score, 100)}%`,
                                    borderRadius: 4,
                                    background: item.score >= 80 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#3b82f6',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {section.type === 'table' && section.columns && (
                <div style={{ border: '1px solid var(--rca-border-color)', borderRadius: 6, overflow: 'hidden', fontSize: '0.85rem' }}>
                    <Table>
                        <TableHeader>
                            <TableRow style={{ background: 'var(--rca-bg-tertiary)' }}>
                                {section.columns.map((col: any) => (
                                    <TableHead key={col.key} className={cn("text-[10px] font-bold h-7 py-1 px-3", col.align === 'right' ? "text-right" : "")}>
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(section.content as Record<string, any>[]).map((row, rIdx) => (
                                <TableRow key={rIdx}>
                                    {section.columns.map((col: any) => (
                                        <TableCell key={col.key} className={cn("text-[11px] py-1.5 px-3", col.align === 'right' ? "text-right font-mono" : "")}>
                                            {col.key === 'match' || col.key === 'score' ? (
                                                <span style={{
                                                    fontSize: '0.75rem', fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                                                    background: parseInt(row[col.key]) > 80 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                    color: parseInt(row[col.key]) > 80 ? '#10b981' : '#f59e0b'
                                                }}>{row[col.key]}</span>
                                            ) : (
                                                <span style={{ color: 'var(--rca-text-primary)' }}>{row[col.key]}</span>
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────
// Metadata renderer: for generateRCASteps() format
// ──────────────────────────────────────────────────────
function MetadataStepContent({ details }: { details: any }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Input */}
            {details.input && details.input.length > 0 && (
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rca-text-secondary)', marginBottom: 6 }}>Input</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--rca-text-primary)' }}>
                        {details.input.map((item: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 6, padding: '2px 0' }}>
                                <span style={{ color: 'var(--rca-text-secondary)' }}>•</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Processing */}
            {details.processing && (
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rca-text-secondary)', marginBottom: 6 }}>Processing</div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--rca-text-primary)', lineHeight: 1.6, margin: 0 }}>{details.processing}</p>
                </div>
            )}

            {/* Bullet Points */}
            {details.bulletPoints && details.bulletPoints.length > 0 && (
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rca-text-secondary)', marginBottom: 6 }}>Steps</div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--rca-text-primary)' }}>
                        {details.bulletPoints.map((bp: string, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 6, padding: '2px 0' }}>
                                <span style={{ color: '#3b82f6' }}>•</span>
                                <span>{bp}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Metadata KV */}
            {details.metadata && Object.keys(details.metadata).length > 0 && (
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rca-text-secondary)', marginBottom: 6 }}>Details</div>
                    <div className="rca-grid">
                        {Object.entries(details.metadata as Record<string, any>).map(([k, v]) => (
                            <>
                                <div key={`k-${k}`} className="rca-k">{k}</div>
                                <div key={`v-${k}`} className="rca-v">{Array.isArray(v) ? v.join(', ') : String(v)}</div>
                            </>
                        ))}
                    </div>
                </div>
            )}

            {/* Output */}
            {details.output && (
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rca-text-secondary)', marginBottom: 6 }}>Output</div>
                    <p style={{ fontSize: '0.92rem', color: 'var(--rca-text-primary)', lineHeight: 1.6, margin: 0 }}>{details.output}</p>
                </div>
            )}

            {/* Duration */}
            {details.duration && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rca-text-secondary)' }}>Duration:</span>
                    <span style={{
                        fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700,
                        background: 'rgba(16,185,129,0.15)', color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.3)', borderRadius: 4, padding: '1px 8px'
                    }}>{details.duration}</span>
                </div>
            )}

            {/* Raw Output */}
            {details.rawOutput && (
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--rca-text-secondary)', marginBottom: 6 }}>Raw Output</div>
                    <pre style={{
                        margin: 0, padding: '10px 14px',
                        background: 'var(--rca-bg-tertiary)', color: 'var(--rca-text-primary)',
                        borderRadius: 6, fontSize: '0.75rem', overflow: 'auto',
                        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                        border: '1px solid var(--rca-border-color)'
                    }}>{details.rawOutput}</pre>
                </div>
            )}
        </div>
    );
}

// ──────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────
export default function RCADetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme: appTheme, systemTheme } = useNextTheme();
    const isDark = appTheme === 'dark' || (appTheme === 'system' && systemTheme === 'dark');

    const muiTheme = useMemo(() => createTheme({
        palette: {
            mode: isDark ? 'dark' : 'light',
            primary: { main: '#3b82f6' },
            background: { default: 'transparent', paper: isDark ? '#12172b' : '#ffffff' },
            text: {
                primary: isDark ? '#e8ecf5' : '#1e293b',
                secondary: isDark ? '#8b94b0' : '#64748b'
            },
            divider: isDark ? '#2a3354' : '#e2e8f0'
        },
        typography: { fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif' },
        components: {
            MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', borderColor: isDark ? '#2a3354' : '#e2e8f0' } } }
        }
    }), [isDark]);

    const clusterData = getClusterData(id || 'CLU-LC-001');
    const [activeTab, setActiveTab] = useState(0);

    if (!clusterData) {
        return (
            <MainLayout>
                <div className="p-12 text-center text-muted-foreground">
                    RCA Data not found for ID: {id}
                    <Button asChild className="mt-4"><Link to="/events">Back to Events</Link></Button>
                </div>
            </MainLayout>
        );
    }

    const steps = clusterData.rcaProcessSteps;
    const activeStep = steps[activeTab];

    const tlSteps = steps.map((s, i) => ({
        step: i,
        title: s.name,
        tl_title: s.name,
        tl_desc: s.status === 'complete' ? 'Done' : s.status === 'active' ? 'In Progress...' : 'Pending...',
    }));

    const currentIdx = steps.reduce(
        (acc, s, i) => (s.status === 'complete' || s.status === 'active' ? i : acc), -1
    );

    // Step icon emojis matching RCA steps
    const stepIcons = ['🚨', '📊', '🎯', '🔍', '📋', '📚', '🔗'];

    return (
        <MainLayout>
            <ThemeProvider theme={muiTheme}>
                <div style={{ padding: '16px 24px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={() => navigate(`/events?cluster=${id}&openSidebar=rca`)}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </Button>
                            <div>
                                <h1 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>RCA Analysis Flow</h1>
                                <p style={{ fontSize: '0.7rem', color: 'var(--rca-text-secondary)', margin: 0 }}>
                                    <span style={{ fontFamily: 'monospace' }}>{id}</span> • {clusterData.rootCause?.split(':')[0]}
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px] px-2 py-0.5 font-bold">
                            {((clusterData.confidence || 0) * 100).toFixed(0)}% Conf
                        </Badge>
                    </div>

                    {/* Horizontal Timeline */}
                    <TimelineFlow steps={tlSteps} currentIdx={currentIdx} />

                    {/* MUI Tabs */}
                    <Paper sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, pt: 1, pb: 0 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_e, val) => setActiveTab(val)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: '44px',
                                '& .MuiTab-root': {
                                    textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                                    color: 'var(--rca-text-secondary)', minHeight: '44px',
                                },
                                '& .Mui-selected': { color: '#2563eb !important' },
                                '& .MuiTabs-indicator': { backgroundColor: '#2563eb', height: '3px', borderRadius: '3px 3px 0 0' }
                            }}
                        >
                            {steps.map((s, i) => (
                                <Tab key={i} label={s.name} />
                            ))}
                        </Tabs>
                    </Paper>

                    {/* Step Content Card — rca-card style */}
                    {activeStep && (
                        <div
                            className={`rca-card ${activeTab === steps.length - 1 && activeStep.status === 'complete' ? 'final' : ''}`}
                            style={{ maxWidth: 1000, margin: '0 auto' }}
                        >
                            {/* Step title */}
                            <div className="rca-step-title">
                                {stepIcons[activeTab] || '📍'} {activeStep.name}
                            </div>
                            {/* Step description */}
                            {activeStep.description && (
                                <div className="rca-step-sub">• {activeStep.description}</div>
                            )}

                            {/* Content: "sections" array format */}
                            {activeStep.details?.sections && activeStep.details.sections.length > 0 && (
                                <div>
                                    {activeStep.details.sections.map((section, idx) => (
                                        <SectionItem key={idx} section={section} />
                                    ))}
                                </div>
                            )}

                            {/* Content: generateRCASteps() metadata format */}
                            {!activeStep.details?.sections && (
                                <MetadataStepContent details={activeStep.details} />
                            )}

                            {/* Mini completion badge */}
                            {activeStep.status === 'complete' && (
                                <div className="rca-mini">
                                    <span>✔</span> {activeStep.name} process completed.
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </ThemeProvider>
        </MainLayout>
    );
}
