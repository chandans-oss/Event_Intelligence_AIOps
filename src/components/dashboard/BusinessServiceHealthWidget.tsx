import { useState, useMemo } from 'react';
import { Activity, ChevronRight } from 'lucide-react';
import { sampleNetworkEvents, NetworkEvent } from '@/features/events/data/eventsData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

export interface BusinessService {
  id: string;
  name: string;
  health: number;         // 0-100
  events: number;
  severity: 'Critical' | 'Warning' | 'Healthy';
  rootCause: string;
  affectedResources: string[];
  remediation: RemediationStep[];
  criticalEvents: CriticalEvent[];
}

export interface CriticalEvent {
  id: string;
  time: string;
  resource: string;
  type: string;
  message: string;
  severity: 'Critical' | 'Warning' | 'Info';
}

export interface RemediationStep {
  id: string;
  action: string;
  description: string;
  automated: boolean;
  status: 'pending' | 'in-progress' | 'done';
}

export const BUSINESS_SERVICES: BusinessService[] = [
  {
    id: 'bs-001',
    name: 'Billing Portal',
    health: 42,
    events: 5,
    severity: 'Critical',
    rootCause: 'Payment gateway API timeout cascading into database connection pool exhaustion',
    affectedResources: ['payment-gw-01', 'db-primary-01', 'api-billing-02'],
    criticalEvents: [
      { id: 'ce-001', time: '14:12 UTC', resource: 'payment-gw-01', type: 'API_TIMEOUT', message: 'Payment gateway unresponsive — 503 for 4 min', severity: 'Critical' },
      { id: 'ce-002', time: '14:15 UTC', resource: 'db-primary-01', type: 'CONNECTION_EXHAUSTED', message: 'DB pool at 100% capacity — new connections refused', severity: 'Critical' },
      { id: 'ce-003', time: '14:18 UTC', resource: 'api-billing-02', type: 'HIGH_ERROR_RATE', message: 'HTTP 500 rate 62% on /v2/charge endpoint', severity: 'Critical' },
      { id: 'ce-004', time: '14:20 UTC', resource: 'payment-gw-01', type: 'LATENCY_SPIKE', message: 'p99 latency at 12.4 s — SLA breach', severity: 'Critical' },
      { id: 'ce-005', time: '14:22 UTC', resource: 'db-primary-01', type: 'REPLICATION_LAG', message: 'Replica lag 38 s — read queries degraded', severity: 'Warning' },
    ],
    remediation: [
      { id: 'r-001', action: 'Restart Payment Gateway', description: 'Restart payment-gw-01 service pod and drain existing connections gracefully', automated: true, status: 'pending' },
      { id: 'r-002', action: 'Scale DB Connection Pool', description: 'Temporarily increase max_connections from 200 → 400 on db-primary-01', automated: true, status: 'pending' },
      { id: 'r-003', action: 'Enable Circuit Breaker', description: 'Activate circuit breaker on /v2/charge endpoint to prevent cascade', automated: false, status: 'pending' },
      { id: 'r-004', action: 'Flush Replica Lag', description: 'Trigger manual sync on read-replica to reduce lag below 5 s', automated: false, status: 'pending' },
    ],
  },
  {
    id: 'bs-002',
    name: 'Network Mgmt System',
    health: 33,
    events: 4,
    severity: 'Critical',
    rootCause: 'Core router power supply failure triggering BGP session drops across 3 peering links',
    affectedResources: ['core-router-dc1', 'bgp-peer-01', 'bgp-peer-02', 'nms-collector'],
    criticalEvents: [
      { id: 'ce-006', time: '10:02 UTC', resource: 'core-router-dc1', type: 'PSU_FAILURE', message: 'PSU-1 failed — running on PSU-2 only (no redundancy)', severity: 'Critical' },
      { id: 'ce-007', time: '10:04 UTC', resource: 'bgp-peer-01', type: 'BGP_SESSION_DOWN', message: 'BGP session to ISP-A dropped — 12 routes withdrawn', severity: 'Critical' },
      { id: 'ce-008', time: '10:05 UTC', resource: 'bgp-peer-02', type: 'BGP_ROUTE_FLAP', message: 'BGP route flapping on ISP-B peering — instability', severity: 'Critical' },
      { id: 'ce-009', time: '10:08 UTC', resource: 'nms-collector', type: 'POLLING_FAILURE', message: 'SNMP polling failure — 34 devices unreachable', severity: 'Warning' },
    ],
    remediation: [
      { id: 'r-005', action: 'Replace PSU-1 Unit', description: 'Dispatch hardware team to replace failed PSU on core-router-dc1', automated: false, status: 'pending' },
      { id: 'r-006', action: 'Reset BGP Sessions', description: 'Execute "clear ip bgp * soft" on core-router-dc1 to reset all peers', automated: true, status: 'pending' },
      { id: 'r-007', action: 'Restore SNMP Polling', description: 'Restart nms-collector agent and re-queue unreachable device polls', automated: true, status: 'pending' },
    ],
  },
  {
    id: 'bs-003',
    name: 'VoIP Platform',
    health: 58,
    events: 3,
    severity: 'Warning',
    rootCause: 'WAN link saturation causing packet loss on voice traffic priority queue',
    affectedResources: ['wan-link-primary', 'voip-gateway-01', 'sbc-01'],
    criticalEvents: [
      { id: 'ce-010', time: '13:45 UTC', resource: 'wan-link-primary', type: 'LINK_CONGESTION', message: 'WAN utilization at 96% — voice queue starved', severity: 'Critical' },
      { id: 'ce-011', time: '13:48 UTC', resource: 'voip-gateway-01', type: 'PACKET_LOSS', message: 'Voice packet loss 3.2% — MOS score < 3.5', severity: 'Warning' },
      { id: 'ce-012', time: '13:52 UTC', resource: 'sbc-01', type: 'CALL_DROP_SPIKE', message: 'Call drop rate 8× above baseline in last 15 min', severity: 'Warning' },
    ],
    remediation: [
      { id: 'r-008', action: 'Apply QoS Shaping', description: 'Throttle backup DSCP0 traffic to 200 Mbps to free voice priority bandwidth', automated: true, status: 'pending' },
      { id: 'r-009', action: 'Activate Backup WAN', description: 'Bring up standby WAN link BK-02 to redistribute load', automated: true, status: 'pending' },
    ],
  },
  {
    id: 'bs-004',
    name: 'Web E-Commerce',
    health: 71,
    events: 2,
    severity: 'Warning',
    rootCause: 'CDN edge node cache miss rate elevated due to config change at 09:30 UTC',
    affectedResources: ['cdn-edge-us-east', 'origin-web-01'],
    criticalEvents: [
      { id: 'ce-013', time: '09:31 UTC', resource: 'cdn-edge-us-east', type: 'CACHE_MISS_SURGE', message: 'Cache hit ratio dropped from 94% → 61% post config push', severity: 'Warning' },
      { id: 'ce-014', time: '09:35 UTC', resource: 'origin-web-01', type: 'HIGH_ORIGIN_LOAD', message: 'Origin server CPU at 88% from uncached traffic', severity: 'Warning' },
    ],
    remediation: [
      { id: 'r-010', action: 'Rollback CDN Config', description: 'Revert CDN cache rules to last known-good configuration v2.4.1', automated: true, status: 'pending' },
      { id: 'r-011', action: 'Purge Stale Cache', description: 'Force cache purge and warm critical product pages', automated: true, status: 'pending' },
    ],
  },
  {
    id: 'bs-005',
    name: 'Auth Service',
    health: 95,
    events: 0,
    severity: 'Healthy',
    rootCause: '',
    affectedResources: [],
    criticalEvents: [],
    remediation: [],
  },
  {
    id: 'bs-006',
    name: 'Cloud Backup',
    health: 88,
    events: 1,
    severity: 'Healthy',
    rootCause: '',
    affectedResources: ['backup-agent-03'],
    criticalEvents: [
      { id: 'ce-015', time: '07:00 UTC', resource: 'backup-agent-03', type: 'BACKUP_SLOW', message: 'Nightly backup job 40% slower than baseline — investigating', severity: 'Info' },
    ],
    remediation: [],
  },
];

export const NETWORK_SERVICES: BusinessService[] = [
  {
    id: 'ns-001',
    name: 'Voice Network',
    health: 48,
    events: 0,
    severity: 'Critical',
    rootCause: 'SIP Trunk Registration Failures due to high latency',
    affectedResources: ['voip-gateway', 'sbc-core', 'voice'],
    criticalEvents: [],
    remediation: []
  },
  {
    id: 'ns-002',
    name: 'Video Conferencing',
    health: 65,
    events: 0,
    severity: 'Warning',
    rootCause: 'High jitter on VC endpoints in EMEA region',
    affectedResources: ['vc-mcu', 'video'],
    criticalEvents: [],
    remediation: []
  },
  {
    id: 'ns-003',
    name: 'WAN Backbone',
    health: 30,
    events: 0,
    severity: 'Critical',
    rootCause: 'BGP peering drop to ISP-A resulting in sub-optimal routing',
    affectedResources: ['core-router', 'wan-link', 'bgp-peer'],
    criticalEvents: [],
    remediation: []
  },
  {
    id: 'ns-004',
    name: 'Corporate WiFi',
    health: 92,
    events: 0,
    severity: 'Healthy',
    rootCause: '',
    affectedResources: ['wlc-primary', 'ap-group'],
    criticalEvents: [],
    remediation: []
  },
  {
    id: 'ns-005',
    name: 'Internet Edge',
    health: 85,
    events: 0,
    severity: 'Healthy',
    rootCause: '',
    affectedResources: ['edge-router', 'fw-primary', 'firewall'],
    criticalEvents: [],
    remediation: []
  }
];

// ─── Real event lookup (shared with sidebar) ─────────────────────────────────

export function getServiceEvents(service: BusinessService): NetworkEvent[] {
  const nameKeywords = service.name.toLowerCase().split(' ').filter(w => w.length > 3);
  const resources = service.affectedResources.map(r => r.toLowerCase());

  const matched = sampleNetworkEvents.filter(e =>
    e.businessService && (
      e.businessService.toLowerCase().includes(nameKeywords[0]) ||
      service.name.toLowerCase().includes(e.businessService.toLowerCase().split(' ')[0])
    )
  );

  const devMatched = sampleNetworkEvents.filter(e =>
    resources.some(r => e.device.toLowerCase().includes(r.split('-')[0]))
  );

  const combined = [...matched, ...devMatched];
  const seen = new Set<string>();
  const unique = combined.filter(e => { if (seen.has(e.event_id)) return false; seen.add(e.event_id); return true; });

  if (unique.length === 0) {
    const sev = service.severity === 'Critical' ? ['Critical', 'Major'] : ['Major', 'Minor'];
    return sampleNetworkEvents.filter(e => sev.includes(e.severity)).slice(0, 8);
  }
  return unique.slice(0, 20);
}

// ─── Summary counters ─────────────────────────────────────────────────────────

function getSummary(services: BusinessService[]) {
  return {
    total: services.length,
    critical: services.filter(s => s.severity === 'Critical').length,
    degraded: services.filter(s => s.severity === 'Warning').length,
    healthy: services.filter(s => s.severity === 'Healthy').length,
  };
}

// ─── Severity colour helpers ──────────────────────────────────────────────────

function severityColor(sev: BusinessService['severity']) {
  if (sev === 'Critical') return { dot: '#ef4444', badge: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' };
  if (sev === 'Warning')  return { dot: '#f97316', badge: 'rgba(249,115,22,0.12)', text: '#f97316', border: 'rgba(249,115,22,0.25)' };
  return { dot: '#22c55e', badge: 'rgba(34,197,94,0.12)', text: '#22c55e', border: 'rgba(34,197,94,0.25)' };
}

function healthBarColor(health: number) {
  if (health < 50) return '#ef4444';
  if (health < 75) return '#f97316';
  return '#22c55e';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BusinessServiceHealthWidgetProps {
  onSelectService: (service: BusinessService) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BusinessServiceHealthWidget({ onSelectService }: BusinessServiceHealthWidgetProps) {
  const [filter, setFilter] = useState<'All' | 'Critical' | 'Warning' | 'Healthy'>('All');
  const [serviceType, setServiceType] = useState<'Business' | 'Network'>('Business');

  const activeServices = serviceType === 'Business' ? BUSINESS_SERVICES : NETWORK_SERVICES;
  const summary = useMemo(() => getSummary(activeServices), [activeServices]);

  const visible = useMemo(() =>
    filter === 'All'
      ? activeServices
      : activeServices.filter(s => s.severity === filter),
    [filter, activeServices]
  );

  const FILTERS: Array<'All' | 'Critical' | 'Warning'> = ['All', 'Critical', 'Warning'];

  return (
    <div style={{
      background: 'hsl(var(--card))',
      borderRadius: 14,
      padding: '18px 20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      border: '1px solid hsl(var(--border) / 0.5)',
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
      height: '100%',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, color: 'hsl(var(--card-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Activity size={14} style={{ color: 'hsl(var(--primary))' }} />
            Service Health
          </div>

          {/* Service Type Tabs */}
          <div style={{ display: 'flex', background: 'hsl(var(--muted)/0.5)', borderRadius: 8, padding: 2 }}>
            <button
              onClick={() => { setServiceType('Business'); setFilter('All'); }}
              style={{
                fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 6,
                background: serviceType === 'Business' ? 'hsl(var(--background))' : 'transparent',
                color: serviceType === 'Business' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: serviceType === 'Business' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              Business
            </button>
            <button
              onClick={() => { setServiceType('Network'); setFilter('All'); }}
              style={{
                fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 6,
                background: serviceType === 'Network' ? 'hsl(var(--background))' : 'transparent',
                color: serviceType === 'Network' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                boxShadow: serviceType === 'Network' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              Network
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary KPI strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14, flexShrink: 0 }}>
        {[
          { label: 'Total services', filterVal: 'All', value: summary.total, color: 'hsl(var(--foreground))' },
          { label: 'Critical',       filterVal: 'Critical', value: summary.critical, color: '#ef4444' },
          { label: 'Degraded',       filterVal: 'Warning', value: summary.degraded, color: '#f97316' },
          { label: 'Healthy',        filterVal: 'Healthy', value: summary.healthy,  color: '#22c55e' },
        ].map(k => {
          const isActive = filter === k.filterVal;
          return (
            <div 
              key={k.label} 
              onClick={() => setFilter(k.filterVal as any)}
              style={{
                background: isActive ? 'hsl(var(--muted) / 0.4)' : 'hsl(var(--muted) / 0.18)',
                border: isActive ? `1.5px solid ${k.color}` : '1px solid hsl(var(--border) / 0.4)',
                borderRadius: 10,
                padding: isActive ? '9.5px 11.5px' : '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isActive ? `0 0 8px ${k.color}22` : 'none'
              }}
            >
              <div style={{ fontSize: 10, color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', fontWeight: isActive ? 700 : 600, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* ── Column headers ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 160px 60px 80px',
        gap: 8,
        padding: '0 4px 6px',
        borderBottom: '1px solid hsl(var(--border) / 0.4)',
        flexShrink: 0,
      }}>
        {['Service name', 'Health', 'Events', 'Severity'].map(h => (
          <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Events' || h === 'Severity' ? 'right' : 'left' }}>{h}</div>
        ))}
      </div>

      {/* ── Bar Chart ── */}
      <div style={{ flex: 1, minHeight: 220, position: 'relative' }}>
        {visible.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={visible.map(s => ({
                ...s,
                eventsCount: getServiceEvents(s).length,
                barColor: healthBarColor(s.health),
              }))}
              margin={{ top: 20, right: 20, bottom: 40, left: 0 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as any;
                    return (
                      <div className="bg-card border border-border shadow-lg rounded-lg p-3">
                        <div className="font-bold text-sm mb-2">{data.name}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                          <div className="text-muted-foreground">Health</div>
                          <div className="font-bold text-right" style={{ color: data.barColor }}>{data.health}%</div>
                          
                          <div className="text-muted-foreground">Events</div>
                          <div className="font-bold text-right text-foreground">{data.eventsCount}</div>
                          
                          <div className="text-muted-foreground">Severity</div>
                          <div className="font-bold text-right" style={{ color: severityColor(data.severity).text }}>{data.severity}</div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="health" 
                radius={[4, 4, 0, 0]}
                barSize={32}
                onClick={(data) => onSelectService(data)}
                style={{ cursor: 'pointer' }}
              >
                {visible.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={healthBarColor(entry.health)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}>
            No services match this filter
          </div>
        )}
      </div>
    </div>
  );
}
