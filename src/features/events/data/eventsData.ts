import { Severity, EventLabel } from '@/shared/types';
import { MOCK_PATTERNS, EvidenceItem } from '@/features/analytics/data/patternData';

export interface NetworkEvent {
  event_id: string;
  device: string;
  event_code: string;
  timestamp: string;
  severity: Severity;
  metric: string;
  value: string;
  site: string;
  region: string;
  rack: string;
  message: string;
  label?: EventLabel;
  status: 'Active' | 'Resolved';
  clusterId?: string;
  classificationReason?: {
    rule: string;
    description: string;
    confidence: number;
  };
  correlationLabels?: string[];
}

const safeISO = (ts: string) => {
  try {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
};

export const sampleNetworkEvents: NetworkEvent[] = [
  // --- Noise Events (To push the pattern down) ---
  { event_id: 'EVT-B-101', device: 'edge-router-01', event_code: 'THROTTLE_DETECTED', timestamp: new Date(Date.now() - 3600000).toISOString(), severity: 'Minor', metric: 'throughput', value: '75 Mbps', site: 'DC3', region: 'EMEA', rack: 'K1', message: 'Traffic throttle detected on edge link', label: 'Child', status: 'Active', correlationLabels: ['Temporal Correlation', 'Dynamic Rule Correlation'] },
  { event_id: 'EVT-B-102', device: 'edge-router-02', event_code: 'BDP_THROUGHPUT_DROP', timestamp: new Date(Date.now() - 7200000).toISOString(), severity: 'Major', metric: 'throughput', value: '70 Mbps', site: 'DC3', region: 'EMEA', rack: 'K2', message: 'BDP drop detected on edge link', label: 'Child', status: 'Active', correlationLabels: ['Topological Correlation', 'Causal / Rule-based Correlation'] },

  // --- Interface Flap Pattern Cluster (MEANINGFUL DEMO) ---
  {
    event_id: 'EVT-NET-004-1',
    device: 'Dist-Switch-02',
    event_code: 'LINK_CONGESTION',
    timestamp: '2026-02-25T08:00:00Z',
    severity: 'Critical',
    metric: 'utilization',
    value: '98',
    site: 'DC1',
    region: 'NA',
    rack: 'R5',
    message: 'Interface Et0/0 utilization > 90% for 5 mins',
    label: 'Child',
    status: 'Active',
    clusterId: 'CLU-NET-004',
    correlationLabels: ['Dynamic Rule Correlation', 'Topological Correlation', 'Interface Flap Pattern'],
    classificationReason: {
      rule: 'Pattern Match',
      description: 'Matched Pattern: Interface Flap Pattern (Congestion → Saturation → Errors → Loss → Flap)',
      confidence: 0.99
    }
  },
  {
    event_id: 'EVT-NET-004-2',
    device: 'Dist-Switch-02',
    event_code: 'BUFFER_UTILIZATION',
    timestamp: '2026-02-25T08:05:00Z',
    severity: 'Major',
    metric: 'buffer_util',
    value: '85%',
    site: 'DC1',
    region: 'NA',
    rack: 'R5',
    message: 'Output queue buffers reaching threshold (85%)',
    label: 'Child',
    status: 'Active',
    clusterId: 'CLU-NET-004',
    correlationLabels: ['Dynamic Rule Correlation', 'Interface Flap Pattern'],
    classificationReason: { rule: 'Pattern Match', description: 'Step 2: Buffer exhaustion following congestion', confidence: 0.98 }
  },
  {
    event_id: 'EVT-NET-004-3',
    device: 'Dist-Switch-02',
    event_code: 'CRC_ERRORS',
    timestamp: '2026-02-25T08:06:00Z',
    severity: 'Major',
    metric: 'errors',
    value: '1200',
    site: 'DC1',
    region: 'NA',
    rack: 'R5',
    message: 'High CRC error rate detected on Et0/0',
    label: 'Child',
    status: 'Active',
    clusterId: 'CLU-NET-004',
    correlationLabels: ['Dynamic Rule Correlation', 'Interface Flap Pattern'],
    classificationReason: { rule: 'Pattern Match', description: 'Step 3: Physical layer instability due to queue pressure', confidence: 0.99 }
  },
  {
    event_id: 'EVT-NET-004-4',
    device: 'Dist-Switch-02',
    event_code: 'PACKET_LOSS',
    timestamp: '2026-02-25T08:07:00Z',
    severity: 'Critical',
    metric: 'drops',
    value: '5%',
    site: 'DC1',
    region: 'NA',
    rack: 'R5',
    message: 'Packet loss exceeds 5% on Et0/0',
    label: 'Child',
    status: 'Active',
    clusterId: 'CLU-NET-004',
    correlationLabels: ['Dynamic Rule Correlation', 'Interface Flap Pattern'],
    classificationReason: { rule: 'Pattern Match', description: 'Step 4: Data plane impairment confirmed', confidence: 0.99 }
  },
  {
    event_id: 'EVT-NET-004-5',
    device: 'Dist-Switch-02',
    event_code: 'INTERFACE_FLAP',
    timestamp: '2026-02-25T08:08:00Z',
    severity: 'Critical',
    metric: 'state',
    value: 'Down',
    site: 'DC1',
    region: 'NA',
    rack: 'R5',
    message: 'Interface Et0/0 transition to Down state',
    label: 'Child',
    status: 'Active',
    clusterId: 'CLU-NET-004',
    correlationLabels: ['Dynamic Rule Correlation', 'Interface Flap Pattern'],
    classificationReason: { rule: 'Pattern Match', description: 'Step 5: Final service impact - Link Flap', confidence: 0.99 }
  },

  // --- Other Root Causes (Reduced to fulfill 6 total Root events max) ---
  { event_id: 'EVT-LC-010', device: 'core-router-dc1', event_code: 'LINK_CONGESTION', timestamp: new Date(Date.now() - (12 * 3600000)).toISOString(), severity: 'Critical', metric: 'utilization', value: '96', site: 'DC1', region: 'NA', rack: 'R3', message: 'Gi0/1/0 interface congestion - 96% utilization', label: 'Root', status: 'Active', clusterId: 'CLU-LC-001' },
  { event_id: 'EVT-001', device: 'db-server-01', event_code: 'DB_CONNECTION_FAILED', timestamp: new Date(Date.now() - (5 * 3600000)).toISOString(), severity: 'Critical', metric: 'connections', value: '100', site: 'DC1', region: 'NA', rack: 'S1', message: 'Database connection pool exhausted', label: 'Root', status: 'Active', clusterId: 'CLU-12345' },
  { event_id: 'evt_011', device: 'Core-R2', event_code: 'POWER_SUPPLY_FAIL', timestamp: new Date(Date.now() - (24 * 3600000)).toISOString(), severity: 'Critical', metric: '', value: '', site: 'DC2', region: 'NA', rack: 'R2', message: 'PSU-1 failed', label: 'Root', status: 'Active', clusterId: 'CLU-003' },
  { event_id: 'EVT-020', device: 'router-dc-east-01', event_code: 'NETWORK_LATENCY', timestamp: '2026-02-25T06:00:00Z', severity: 'Major', metric: 'latency', value: '500ms', site: 'DC-East', region: 'NA', rack: 'R10', message: 'BGP route flapping detected', label: 'Root', status: 'Active', clusterId: 'CLU-12347' },
  { event_id: 'EVT-030', device: 'app-server-05', event_code: 'MEMORY_EXHAUSTION', timestamp: '2026-02-25T04:45:00Z', severity: 'Critical', metric: 'heap_usage', value: '98', site: 'DC1', region: 'NA', rack: 'R10', message: 'JVM heap exhausted - 7.8GB/8GB used', label: 'Root', status: 'Active', clusterId: 'CLU-12348' },

  // --- Supporting Child Events ---
  { event_id: 'EVT-LC-009', device: 'core-router-dc1', event_code: 'PACKET_DISCARD', timestamp: new Date(Date.now() - (12 * 3600000 + 300000)).toISOString(), severity: 'Critical', metric: 'drops', value: '500', site: 'DC1', region: 'NA', rack: 'R3', message: 'Output discards on Gi0/1/0', label: 'Child', status: 'Active', clusterId: 'CLU-LC-001', correlationLabels: ['Temporal Correlation'] },
  { event_id: 'EVT-002', device: 'api-gateway-01', event_code: 'API_TIMEOUT', timestamp: new Date(Date.now() - (5 * 3600000 + 60000)).toISOString(), severity: 'Major', metric: '', value: '', site: 'DC1', region: 'NA', rack: 'R7', message: 'API timeout - upstream service unavailable', label: 'Child', status: 'Active', clusterId: 'CLU-12345', correlationLabels: ['Temporal Correlation', 'Topological Correlation'] },

  // --- Dynamic Pattern-Based Child Events ---
  ...MOCK_PATTERNS.flatMap(pattern =>
    pattern.occurrences.flatMap(occ =>
      occ.events.map((ev: EvidenceItem) => {
        // Only generate for those without EVT-NET... prefixes because the first few are manually added
        if (ev.id.includes('111004203')) return null; // Skip manually matched OCC-2026-001

        return {
          event_id: `EVT-PAT-${ev.id.replace(/\s/g, '-')}`,
          device: ev.nodeName,
          event_code: ev.title.toUpperCase().replace(/\s+/g, '_'),
          timestamp: safeISO(ev.timestamp),
          severity: ev.severity === 'Warning' ? 'Minor' : (ev.severity as Severity),
          metric: ev.resource,
          value: ev.alertValue,
          site: 'DC1',
          region: 'NA',
          rack: 'RCK',
          message: `${ev.title}: ${ev.subtitle} (${ev.alertValue})`,
          label: 'Child' as EventLabel,
          status: 'Resolved' as const,
          clusterId: occ.id,
          correlationLabels: ['Dynamic Rule Correlation', pattern.name],
          classificationReason: {
            rule: 'Pattern Match',
            description: `Historical Evidence for: ${pattern.name}`,
            confidence: pattern.confidence
          }
        };
      }).filter(Boolean) as NetworkEvent[]
    )
  ),

  // --- Bulk Non-Root Data ---
  ...Array.from({ length: 40 }).map((_, i) => ({
    event_id: `EVT-B-${i + 200}`,
    device: `edge-router-0${(i % 5) + 1}`,
    event_code: 'GENERIC_ALERT',
    timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
    severity: 'Minor' as Severity,
    metric: 'health',
    value: 'Normal',
    site: 'DC3',
    region: 'EMEA',
    rack: `K${(i % 10) + 1}`,
    message: 'Standard metric heartbeat',
    label: 'Child' as EventLabel,
    status: 'Active' as 'Resolved' | 'Active',
    correlationLabels: i % 2 === 0 ? ['Temporal Correlation'] : ['Dynamic Rule Correlation', 'ML / GNN Refinement']
  }))
];


export const getEventStats = (events: NetworkEvent[]) => {
  const activeEvents = events.filter(e => e.status === 'Active');
  const resolvedEvents = events.filter(e => e.status === 'Resolved');

  const labelCounts = {
    Root: events.filter(e => e.label === 'Root').length,
    Child: events.filter(e => e.label === 'Child').length,
    Duplicate: events.filter(e => e.label === 'Duplicate').length,
    Suppressed: events.filter(e => e.label === 'Suppressed').length,
  };

  const severityCounts = {
    Critical: events.filter(e => e.severity === 'Critical').length,
    Major: events.filter(e => e.severity === 'Major').length,
    Minor: events.filter(e => e.severity === 'Minor').length,
    Low: events.filter(e => e.severity === 'Low').length,
  };

  return {
    total: events.length,
    active: activeEvents.length,
    resolved: resolvedEvents.length,
    labelCounts,
    severityCounts,
  };
};
