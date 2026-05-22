import { useState } from 'react';
import {
  X, ArrowLeft, ShieldAlert, AlertCircle,
  Settings, Database, LayoutGrid, ArrowUpCircle,
  Brain, Ticket, Sparkles, Globe, Clock,
  Play, CheckCircle2, Circle, ArrowRight, Zap, Activity
} from 'lucide-react';
import { BusinessService, getServiceEvents } from './BusinessServiceHealthWidget';
import { NetworkEvent } from '@/features/events/data/eventsData';
import { cn } from '@/shared/lib/utils';

// ─── helpers ─────────────────────────────────────────────────────────────────

function healthColor(h: number) {
  if (h < 50) return '#ef4444';
  if (h < 75) return '#f97316';
  return '#22c55e';
}

function sevStyles(sev: string) {
  if (sev === 'Critical') return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.28)', text: '#ef4444', dot: '#ef4444', bar: 'bg-red-500' };
  if (sev === 'Major')    return { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.28)', text: '#f97316', dot: '#f97316', bar: 'bg-orange-500' };
  if (sev === 'Minor')    return { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.28)',  text: '#eab308', dot: '#eab308', bar: 'bg-yellow-500' };
  if (sev === 'Warning')  return { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.28)', text: '#f97316', dot: '#f97316', bar: 'bg-orange-500' };
  return { bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)', text: '#3b82f6', dot: '#3b82f6', bar: 'bg-blue-500' };
}

function getIssueIcon(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes('download') || m.includes('config')) return <Database size={18} />;
  if (m.includes('service') || m.includes('portal'))  return <LayoutGrid size={18} />;
  if (m.includes('link') || m.includes('interface') || m.includes('congestion')) return <ArrowUpCircle size={18} style={{ transform: 'rotate(45deg)' }} />;
  return <Settings size={18} />;
}

function getAiStatusDots(aiStatus: NetworkEvent['aiStatus'], extra?: string) {
  const d1 = !!aiStatus;
  const d2 = aiStatus === 'Only RCA' || aiStatus === 'RCA with Remediation' || aiStatus === 'RCA with Auto Remediation';
  const d3 = aiStatus === 'RCA with Remediation' || aiStatus === 'RCA with Auto Remediation';
  const d4 = aiStatus === 'RCA with Auto Remediation';
  return [
    { active: d1, cls: 'bg-violet-500' },
    { active: d2, cls: 'bg-blue-500' },
    { active: d3, cls: 'bg-amber-500' },
    { active: d4, cls: 'bg-emerald-500' },
  ];
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  service: BusinessService;
  onClose: () => void;
}

type StepStatus = 'pending' | 'in-progress' | 'done';

// ─── Component ───────────────────────────────────────────────────────────────

export function BusinessServiceHealthSidebar({ service, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'events' | 'remediation'>('events');
  const [stepStates, setStepStates] = useState<Record<string, StepStatus>>(() =>
    Object.fromEntries(service.remediation.map(r => [r.id, 'pending']))
  );

  const hCol = healthColor(service.health);
  const ss   = sevStyles(service.severity);

  const completedCount = Object.values(stepStates).filter(s => s === 'done').length;
  const progress = service.remediation.length > 0
    ? Math.round((completedCount / service.remediation.length) * 100)
    : 100;

  const handleExecute = (stepId: string) => {
    setStepStates(prev => ({ ...prev, [stepId]: 'in-progress' }));
    setTimeout(() => setStepStates(prev => ({ ...prev, [stepId]: 'done' })), 1800);
  };

  // Get real events filtered for this business service
  const events = getServiceEvents(service);

  const STATUS_LEGEND = [
    { cls: 'bg-violet-500',             label: 'RCA Started' },
    { cls: 'bg-blue-500',               label: 'RCA Identified' },
    { cls: 'bg-amber-500',              label: 'Remedy Identified' },
    { cls: 'bg-emerald-500',            label: 'Auto-Remedy: Success' },
    { cls: 'bg-orange-500 animate-pulse', label: 'Auto-Remedy: Running' },
    { cls: 'bg-red-500',                label: 'Auto-Remedy: Failed' },
    { cls: 'bg-muted-foreground/30',    label: 'Not Reached' },
  ];

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.38)',
          backdropFilter: 'blur(2px)',
          zIndex: 40,
        }}
      />

      {/* ── 70 % Slide-in Panel ── */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '70vw', minWidth: 860,
        background: 'hsl(var(--background))',
        borderLeft: '1px solid hsl(var(--border))',
        boxShadow: '-12px 0 50px rgba(0,0,0,0.25)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        animation: 'bshSlideIn 0.28s cubic-bezier(0.16,1,0.3,1)',
        fontFamily: 'var(--font-sans, Inter, sans-serif)',
      }}>

        <style>{`
          @keyframes bshSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes bshSpin { to { transform: rotate(360deg); } }
          .bsh-row:hover td { background: hsl(var(--muted) / 0.45) !important; }
          .bsh-tab-btn {
            background: none; border: none; cursor: pointer;
            padding: 10px 18px; font-size: 12px; font-weight: 700;
            color: hsl(var(--muted-foreground));
            border-bottom: 2px solid transparent;
            transition: color .15s, border-color .15s;
            white-space: nowrap;
          }
          .bsh-tab-btn.on { color: hsl(var(--foreground)); border-bottom-color: hsl(var(--primary)); }
        `}</style>

        {/* ══ HEADER ══ */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'hsl(var(--card) / 0.6)',
          backdropFilter: 'blur(10px)',
          flexShrink: 0,
        }}>
          {/* top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', padding: 4, display: 'flex' }}>
                <ArrowLeft size={18} />
              </button>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: ss.bg, border: `1.5px solid ${ss.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ShieldAlert size={17} style={{ color: ss.text }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'hsl(var(--foreground))' }}>{service.name}</div>
                <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                  Service Health Analysis&nbsp;•&nbsp;{events.length} active event{events.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', padding: 6, display: 'flex' }}>
              <X size={18} />
            </button>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, background: 'hsl(var(--muted) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: 10, padding: '9px 14px' }}>
              <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontWeight: 700, marginBottom: 6, letterSpacing: '.06em' }}>SERVICE HEALTH</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 7, background: 'hsl(var(--muted))', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${service.health}%`, height: '100%', background: hCol, borderRadius: 4, transition: 'width .5s' }} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: hCol, lineHeight: 1 }}>{service.health}%</span>
              </div>
            </div>
            <div style={{ background: ss.bg, border: `1.5px solid ${ss.border}`, borderRadius: 10, padding: '9px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 90 }}>
              <div style={{ fontSize: 10, color: ss.text, fontWeight: 700, marginBottom: 3, letterSpacing: '.06em' }}>SEVERITY</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: ss.text }}>{service.severity}</div>
            </div>
            <div style={{ background: 'hsl(var(--muted) / 0.2)', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: 10, padding: '9px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 70 }}>
              <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontWeight: 700, marginBottom: 3, letterSpacing: '.06em' }}>EVENTS</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'hsl(var(--foreground))' }}>{events.length}</div>
            </div>
          </div>

          {/* root cause */}
          {service.rootCause && (
            <div style={{ padding: '9px 13px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 9, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <AlertCircle size={13} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', letterSpacing: '.07em', marginBottom: 2 }}>ROOT CAUSE IDENTIFIED</div>
                <div style={{ fontSize: 12, color: 'hsl(var(--foreground))', fontWeight: 500, lineHeight: 1.5 }}>{service.rootCause}</div>
              </div>
            </div>
          )}
        </div>

        {/* ══ TABS ══ */}
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', paddingLeft: 20, flexShrink: 0, background: 'hsl(var(--card) / 0.3)' }}>
          <button className={`bsh-tab-btn${activeTab === 'events' ? ' on' : ''}`} onClick={() => setActiveTab('events')}>
            Business Service Events
            <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 800, padding: '1px 7px', borderRadius: 10, background: 'rgba(239,68,68,0.13)', color: '#ef4444' }}>
              {events.length}
            </span>
          </button>
          <button className={`bsh-tab-btn${activeTab === 'remediation' ? ' on' : ''}`} onClick={() => setActiveTab('remediation')}>
            Remediation Playbook
            {service.remediation.length > 0 && (
              <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 800, padding: '1px 7px', borderRadius: 10, background: 'hsl(var(--primary) / 0.12)', color: 'hsl(var(--primary))' }}>
                {progress}%
              </span>
            )}
          </button>
        </div>

        {/* ══ BODY ══ */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* ══════════════════════ EVENTS TAB ══════════════════════ */}
          {activeTab === 'events' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Status legend bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                padding: '7px 20px', borderBottom: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted) / 0.25)', flexShrink: 0,
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'hsl(var(--muted-foreground))', letterSpacing: '.07em', marginRight: 4 }}>STATUS:</span>
                {STATUS_LEGEND.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 9px', borderRadius: 999,
                    background: 'hsl(var(--background) / 0.6)',
                    border: '1px solid hsl(var(--border) / 0.5)',
                  }}>
                    <span className={cn('h-2 w-2 rounded-full shrink-0', s.cls)} style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%' }} />
                    <span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontWeight: 500, whiteSpace: 'nowrap' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Scrollable table */}
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto' }}>
                {events.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, padding: '60px 0', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>
                    <ShieldAlert size={36} style={{ opacity: 0.2 }} />
                    No events for this service
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 820 }}>
                    <colgroup>
                      <col style={{ width: 40 }} />
                      <col style={{ width: 260 }} />
                      <col style={{ width: 110 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 100 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 90 }} />
                      <col style={{ width: 120 }} />
                      <col style={{ width: 110 }} />
                    </colgroup>

                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                      <tr style={{ background: 'hsl(var(--muted) / 0.8)', backdropFilter: 'blur(4px)' }}>
                        {['', 'ISSUE', 'SEVERITY', 'RCA/REMEDY', 'STATUS', 'DATE', 'ALARM ID', 'NODE', 'RESOURCE'].map((h, i) => (
                          <th key={i} style={{
                            padding: '10px 14px',
                            textAlign: h === '' ? 'center' : 'left',
                            fontSize: 10, fontWeight: 700,
                            color: 'hsl(var(--muted-foreground))',
                            letterSpacing: '.07em',
                            borderBottom: '1px solid hsl(var(--border) / 0.7)',
                            whiteSpace: 'nowrap',
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {events.map((evt, idx) => {
                        const es   = sevStyles(evt.severity);
                        const dots = getAiStatusDots(evt.aiStatus);

                        return (
                          <tr
                            key={evt.event_id}
                            className="bsh-row"
                            style={{
                              position: 'relative',
                              cursor: 'default',
                              background: idx % 2 === 0 ? 'transparent' : 'hsl(var(--muted) / 0.06)',
                              borderBottom: '1px solid hsl(var(--border) / 0.3)',
                            }}
                          >
                            {/* Severity left bar */}
                            <td style={{ padding: '13px 14px', position: 'relative', width: 40 }}>
                              <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                                background: es.dot, borderRadius: '2px 0 0 2px',
                              }} />
                              <input type="checkbox" style={{ accentColor: 'hsl(var(--primary))' }} />
                            </td>

                            {/* ISSUE */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                  width: 36, height: 36, borderRadius: 8,
                                  background: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  color: 'hsl(var(--muted-foreground))', flexShrink: 0,
                                }}>
                                  {getIssueIcon(evt.message)}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {evt.message}
                                  </div>
                                  <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 2, opacity: 0.7 }}>
                                    Configuration Download Failed For Running.
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* SEVERITY */}
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                fontSize: 10, fontWeight: 800,
                                padding: '3px 10px', borderRadius: 6,
                                background: es.bg, color: es.text,
                                border: `1px solid ${es.border}`,
                              }}>
                                {evt.severity === 'Major'
                                  ? <ArrowUpCircle size={11} />
                                  : <span style={{ width: 6, height: 6, borderRadius: '50%', background: es.dot, display: 'inline-block' }} />}
                                {evt.severity.toUpperCase()}
                              </span>
                            </td>

                            {/* RCA/REMEDY */}
                            <td style={{ padding: '12px 14px' }}>
                              {evt.aiStatus && evt.aiStatus !== 'RCA Not Found' ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  fontSize: 9, fontWeight: 800,
                                  padding: '3px 9px', borderRadius: 6,
                                  background: evt.aiStatus === 'Only RCA'
                                    ? 'rgba(168,85,247,0.12)'
                                    : evt.aiStatus === 'RCA with Remediation'
                                      ? 'rgba(59,130,246,0.12)'
                                      : 'rgba(16,185,129,0.12)',
                                  color: evt.aiStatus === 'Only RCA'
                                    ? '#a855f7'
                                    : evt.aiStatus === 'RCA with Remediation'
                                      ? '#3b82f6'
                                      : '#10b981',
                                }}>
                                  {evt.aiStatus === 'Only RCA' && <Brain size={10} />}
                                  {evt.aiStatus === 'RCA with Remediation' && <Ticket size={10} />}
                                  {evt.aiStatus === 'RCA with Auto Remediation' && <Sparkles size={10} />}
                                  {evt.aiStatus === 'Only RCA' ? 'RCA'
                                    : evt.aiStatus === 'RCA with Remediation' ? 'REMEDY'
                                      : 'AUTO-REMEDY'}
                                </span>
                              ) : (
                                <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground) / 0.3)', fontWeight: 700, paddingLeft: 8 }}>—</span>
                              )}
                            </td>

                            {/* STATUS dots */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {dots.map((d, i) => (
                                  <span
                                    key={i}
                                    className={cn('rounded-full shrink-0', d.active ? d.cls : 'bg-muted-foreground/20')}
                                    style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%' }}
                                    title={d.active ? 'Reached' : 'Pending'}
                                  />
                                ))}
                              </div>
                            </td>

                            {/* DATE */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap' }}>
                                {new Date(evt.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                              </div>
                              <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>
                                {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </div>
                            </td>

                            {/* ALARM ID */}
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}>
                                {evt.event_id}
                              </span>
                            </td>

                            {/* NODE */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Globe size={13} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90 }}>
                                    {evt.device}
                                  </div>
                                  <div style={{ fontSize: 9, color: 'hsl(var(--muted-foreground))', opacity: 0.7 }}>10.0.4.244</div>
                                </div>
                              </div>
                            </td>

                            {/* RESOURCE */}
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--foreground))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: 100 }}>
                                {evt.device}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Table footer */}
              <div style={{
                flexShrink: 0, padding: '8px 20px',
                borderTop: '1px solid hsl(var(--border) / 0.4)',
                background: 'hsl(var(--muted) / 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>
                  Showing {events.length} event{events.length !== 1 ? 's' : ''} for <strong style={{ color: 'hsl(var(--foreground))' }}>{service.name}</strong>
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['Critical', 'Major', 'Minor'] as const).map(s => {
                    const count = events.filter(e => e.severity === s).length;
                    if (!count) return null;
                    const c = sevStyles(s);
                    return (
                      <span key={s} style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 6,
                        background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                      }}>
                        {count} {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════ REMEDIATION TAB ══════════════════════ */}
          {activeTab === 'remediation' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {service.remediation.length > 0 && (
                <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border) / 0.5)', borderRadius: 12, padding: '12px 16px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                      <Activity size={13} style={{ color: 'hsl(var(--primary))' }} />
                      Remediation Progress
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: progress === 100 ? '#22c55e' : 'hsl(var(--primary))' }}>
                      {completedCount}/{service.remediation.length} completed
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'hsl(var(--muted))', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', borderRadius: 3, background: progress === 100 ? '#22c55e' : 'hsl(var(--primary))', transition: 'width .5s' }} />
                  </div>
                </div>
              )}

              {service.remediation.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--muted-foreground))', fontSize: 13 }}>
                  No remediation playbook for this service.
                </div>
              )}

              {service.remediation.map((step, idx) => {
                const status = stepStates[step.id] || 'pending';
                const isDone = status === 'done';
                const isRun  = status === 'in-progress';
                return (
                  <div key={step.id} style={{
                    background: isDone ? 'rgba(34,197,94,0.04)' : isRun ? 'hsl(var(--primary) / 0.04)' : 'hsl(var(--card))',
                    border: `1px solid ${isDone ? 'rgba(34,197,94,0.28)' : isRun ? 'hsl(var(--primary) / 0.35)' : 'hsl(var(--border) / 0.5)'}`,
                    borderRadius: 12, padding: '14px 16px', transition: 'border-color .2s, background .2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isDone  ? <CheckCircle2 size={15} style={{ color: '#22c55e' }} />
                         : isRun ? <div style={{ width: 15, height: 15, border: '2px solid hsl(var(--primary))', borderTopColor: 'transparent', borderRadius: '50%', animation: 'bshSpin .8s linear infinite' }} />
                         : <Circle size={15} style={{ color: 'hsl(var(--muted-foreground))' }} />}
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>Step {idx + 1}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 5,
                          background: step.automated ? 'rgba(99,102,241,0.12)' : 'rgba(245,158,11,0.12)',
                          color: step.automated ? '#6366f1' : '#f59e0b',
                        }}>
                          {step.automated ? 'AUTO' : 'MANUAL'}
                        </span>
                      </div>
                      {isDone && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>✓ Done</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: 4 }}>{step.action}</div>
                    <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', fontWeight: 500, lineHeight: 1.5, marginBottom: isDone ? 0 : 10 }}>{step.description}</div>
                    {!isDone && (
                      <button
                        onClick={() => handleExecute(step.id)}
                        disabled={isRun}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 11, fontWeight: 700, padding: '7px 16px', borderRadius: 8, border: 'none',
                          cursor: isRun ? 'not-allowed' : 'pointer',
                          background: isRun ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
                          color: isRun ? 'hsl(var(--muted-foreground))' : '#fff',
                          opacity: isRun ? 0.7 : 1, transition: 'opacity .15s',
                        }}
                      >
                        {isRun
                          ? <><div style={{ width: 11, height: 11, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'bshSpin .8s linear infinite' }} />Executing…</>
                          : <><Play size={11} />Execute<ArrowRight size={11} /></>}
                      </button>
                    )}
                  </div>
                );
              })}

              {progress === 100 && service.remediation.length > 0 && (
                <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Zap size={18} style={{ color: '#22c55e' }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>All steps completed!</div>
                    <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Service health should recover within 5–10 minutes.</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
