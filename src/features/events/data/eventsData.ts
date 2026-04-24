import { Severity, EventLabel } from '@/shared/types';
import { MOCK_PATTERNS, EvidenceItem } from '@/features/analytics/data/patternData';

export interface PerformanceMetric {
  time: string;
  value: number;
}

export interface AssetDetails {
  ip: string;
  os: string;
  type: string;
  version: string;
  summary: string;
}

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
  assetDetails?: AssetDetails;
  availabilityStats?: PerformanceMetric[];
  operationalStats?: PerformanceMetric[];
  // New Filter Fields
  isAcknowledged?: boolean;
  ticketId?: string;
  businessService?: string;
  priority?: 'High' | 'Medium' | 'Low';
  source?: 'Trap' | 'Syslog' | 'Adaptive' | 'Seasonal' | 'NCCM' | 'IPAM';
  aiStatus?: 'Only RCA' | 'RCA with Remediation' | 'RCA with Auto Remediation' | 'RCA Not Found';
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
  { 
    event_id: 'EVT-B-101', 
    device: 'edge-router-01', 
    event_code: 'THROTTLE_DETECTED', 
    timestamp: new Date(Date.now() - 3600000).toISOString(), 
    severity: 'Minor', 
    metric: 'throughput', 
    value: '75 Mbps', 
    site: 'DC3', 
    region: 'EMEA', 
    rack: 'K1', 
    message: 'Traffic throttle detected on edge link', 
    label: 'Child', 
    status: 'Active', 
    correlationLabels: ['Temporal Correlation', 'Dynamic Rule Correlation'],
    source: 'Trap',
    aiStatus: 'RCA Not Found',
    priority: 'Low'
  },
  { 
    event_id: 'EVT-B-102', 
    device: 'edge-router-02', 
    event_code: 'BDP_THROUGHPUT_DROP', 
    timestamp: new Date(Date.now() - 7200000).toISOString(), 
    severity: 'Major', 
    metric: 'throughput', 
    value: '70 Mbps', 
    site: 'DC3', 
    region: 'EMEA', 
    rack: 'K2', 
    message: 'BDP drop detected on edge link', 
    label: 'Child', 
    status: 'Active', 
    correlationLabels: ['Topological Correlation', 'Causal / Rule-based Correlation'],
    source: 'Syslog',
    aiStatus: 'Only RCA',
    priority: 'Medium',
    isAcknowledged: true
  },

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
    label: 'Root',
    status: 'Active',
    clusterId: 'CLU-NET-004',
    correlationLabels: ['Dynamic Rule Correlation', 'Topological Correlation', 'Interface Flap Pattern'],
    classificationReason: {
      rule: 'Pattern Match',
      description: 'Matched Pattern: Interface Flap Pattern (Congestion → Saturation → Errors → Loss → Flap)',
      confidence: 0.99
    },
    assetDetails: {
      ip: '10.50.2.14',
      os: 'Nexus OS',
      type: 'Distribution Switch',
      version: '9.3(7)',
      summary: 'Cisco Nexus 9000 Series Chassis. High-performance distribution layer switch providing backbone connectivity for Server Rack 5.'
    },
    availabilityStats: [
      { time: '08:00', value: 1.0 }, { time: '08:05', value: 0.85 }, { time: '08:10', value: 0.60 }, { time: '08:15', value: 0.30 }, { time: '08:20', value: 0.0 }
    ],
    operationalStats: [
      { time: '08:00', value: 4 }, { time: '08:05', value: 3 }, { time: '08:10', value: 2 }, { time: '08:15', value: 1 }, { time: '08:20', value: 0 }
    ],
    source: 'Adaptive',
    aiStatus: 'RCA with Auto Remediation',
    priority: 'High',
    businessService: 'E-Commerce Checkout',
    ticketId: 'INC-99221'
  },
  {
    event_id: 'EVT-LC-010',
    device: 'core-router-dc1',
    event_code: 'LINK_CONGESTION',
    timestamp: new Date(Date.now() - (12 * 3600000)).toISOString(),
    severity: 'Critical',
    metric: 'utilization',
    value: '96',
    site: 'DC1',
    region: 'NA',
    rack: 'R3',
    message: 'Gi0/1/0 interface congestion - 96% utilization',
    label: 'Root',
    status: 'Active',
    clusterId: 'CLU-LC-001',
    assetDetails: {
      ip: '172.16.100.1',
      os: 'IOS-XE',
      type: 'Core Router',
      version: '17.3.1',
      summary: 'Cisco ASR 1001-X Core Router. Handles primary edge termination and multi-protocol BGP routing for the NA-East sector.'
    },
    availabilityStats: [
      { time: '06:00', value: 0.99 }, { time: '07:00', value: 0.98 }, { time: '08:00', value: 0.92 }, { time: '09:00', value: 0.88 }, { time: '10:00', value: 0.85 }
    ],
    operationalStats: [
      { time: '06:00', value: 4 }, { time: '07:00', value: 4 }, { time: '08:00', value: 3 }, { time: '09:00', value: 3 }, { time: '10:00', value: 2 }
    ],
    source: 'Seasonal',
    aiStatus: 'RCA with Remediation',
    priority: 'High',
    businessService: 'Core Banking API'
  },
  {
    event_id: 'EVT-001',
    device: 'db-server-01',
    event_code: 'DB_CONNECTION_FAILED',
    timestamp: new Date(Date.now() - (5 * 3600000)).toISOString(),
    severity: 'Critical',
    metric: 'connections',
    value: '100',
    site: 'DC1',
    region: 'NA',
    rack: 'S1',
    message: 'Database connection pool exhausted',
    label: 'Root',
    status: 'Active',
    clusterId: 'CLU-12345',
    assetDetails: {
      ip: '10.0.0.55',
      os: 'Ubuntu 22.04 LTS',
      type: 'Database Server',
      version: 'PostgreSQL 14.2',
      summary: 'Primary Production Database Cluster. Running on bare metal with 256GB RAM and NVMe storage for high-concurrency transactions.'
    },
    availabilityStats: [
      { time: '12:00', value: 1.0 }, { time: '13:00', value: 0.95 }, { time: '14:00', value: 0.40 }, { time: '15:00', value: 0.10 }, { time: '16:00', value: 0.05 }
    ],
    operationalStats: [
      { time: '12:00', value: 4 }, { time: '13:00', value: 3 }, { time: '14:00', value: 2 }, { time: '15:00', value: 1 }, { time: '16:00', value: 1 }
    ],
    source: 'NCCM',
    aiStatus: 'RCA with Remediation',
    priority: 'High',
    ticketId: 'INC-88123'
  },
  {
    event_id: 'EVT-030',
    device: 'app-server-05',
    event_code: 'MEMORY_EXHAUSTION',
    timestamp: '2026-02-25T04:45:00Z',
    severity: 'Critical',
    metric: 'heap_usage',
    value: '98',
    site: 'DC1',
    region: 'NA',
    rack: 'R10',
    message: 'JVM heap exhausted - 7.8GB/8GB used',
    label: 'Root',
    status: 'Active',
    clusterId: 'CLU-12348',
    assetDetails: {
      ip: '192.168.10.205',
      os: 'RHEL 8.6',
      type: 'Application Server',
      version: 'Java 17 / Spring Boot',
      summary: 'E-commerce Frontend API Server. Responsible for processing user checkout requests. High memory pressure detected during morning peak.'
    },
    availabilityStats: [
      { time: '02:00', value: 1.0 }, { time: '03:00', value: 1.0 }, { time: '04:00', value: 0.88 }, { time: '04:30', value: 0.45 }, { time: '05:00', value: 0.12 }
    ],
    operationalStats: [
      { time: '02:00', value: 4 }, { time: '03:00', value: 4 }, { time: '04:00', value: 3 }, { time: '04:30', value: 2 }, { time: '05:00', value: 1 }
    ],
    source: 'IPAM',
    aiStatus: 'Only RCA',
    priority: 'Medium'
  },


  // --- Supporting Child Events ---
  { event_id: 'EVT-LC-009', device: 'core-router-dc1', event_code: 'PACKET_DISCARD', timestamp: new Date(Date.now() - (12 * 3600000 + 300000)).toISOString(), severity: 'Critical', metric: 'drops', value: '500', site: 'DC1', region: 'NA', rack: 'R3', message: 'Output discards on Gi0/1/0', label: 'Child', status: 'Active', clusterId: 'CLU-LC-001', correlationLabels: ['Temporal Correlation'], source: 'Trap', aiStatus: 'Only RCA' },
  { event_id: 'EVT-002', device: 'api-gateway-01', event_code: 'API_TIMEOUT', timestamp: new Date(Date.now() - (5 * 3600000 + 60000)).toISOString(), severity: 'Major', metric: '', value: '', site: 'DC1', region: 'NA', rack: 'R7', message: 'API timeout - upstream service unavailable', label: 'Child', status: 'Active', clusterId: 'CLU-12345', correlationLabels: ['Temporal Correlation', 'Topological Correlation'], source: 'Syslog', aiStatus: 'Only RCA' },

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
          },
          source: (['Trap', 'Syslog', 'Adaptive', 'Seasonal'][Math.floor(Math.random() * 4)]) as any,
          aiStatus: 'Only RCA' as any
        };
      }).filter(Boolean) as NetworkEvent[]
    )
  ),

  // --- Bulk Generated Data (100+ Events) ---
  ...Array.from({ length: 120 }).map((_, i) => {
    const sources: NetworkEvent['source'][] = ['Trap', 'Syslog', 'Adaptive', 'Seasonal', 'NCCM', 'IPAM'];
    const aiStatuses: NetworkEvent['aiStatus'][] = ['Only RCA', 'RCA with Remediation', 'RCA with Auto Remediation', 'RCA Not Found'];
    const severities: Severity[] = ['Critical', 'Major', 'Minor', 'Low'];
    const priorities: NetworkEvent['priority'][] = ['High', 'Medium', 'Low'];
    const businessServices = ['Core Banking', 'E-Commerce Checkout', 'Customer Portal', 'SAP ERP', 'Voice Gateway', 'Inventory API'];
    const devices = ['core-router-01', 'dist-switch-05', 'edge-gateway-02', 'app-server-12', 'db-cluster-01', 'firewall-primary'];
    
    const source = sources[i % sources.length];
    const aiStatus = aiStatuses[i % aiStatuses.length];
    const severity = severities[i % severities.length];
    const priority = priorities[i % priorities.length];
    const isRoot = i % 12 === 0;
    
    return {
      event_id: `EVT-GEN-${1000 + i}`,
      device: devices[i % devices.length],
      event_code: i % 3 === 0 ? 'LINK_CONGESTION' : i % 3 === 1 ? 'MEMORY_HIGH' : 'TCP_RETRANSMIT',
      timestamp: new Date(Date.now() - (i * 1800000)).toISOString(), // Spread over 60 hours
      severity: severity,
      metric: i % 2 === 0 ? 'utilization' : 'error_rate',
      value: `${Math.floor(Math.random() * 40) + 60}`,
      site: i % 2 === 0 ? 'DC1' : 'DC2',
      region: i % 2 === 0 ? 'NA' : 'EMEA',
      rack: `R${(i % 20) + 1}`,
      message: i % 5 === 0 ? `High latency on ${devices[i % devices.length]} interface` : `Performance threshold exceeded for ${source} source`,
      label: (isRoot ? 'Root' : 'Child') as EventLabel,
      status: (i % 7 === 0 ? 'Resolved' : 'Active') as 'Resolved' | 'Active',
      clusterId: i % 4 === 0 ? `CLU-G-${100 + Math.floor(i/4)}` : undefined,
      correlationLabels: i % 2 === 0 ? ['Temporal Correlation'] : ['Topological Correlation'],
      source: source,
      aiStatus: aiStatus,
      priority: priority,
      isAcknowledged: i % 5 === 0,
      ticketId: i % 6 === 0 ? `INC-${55000 + i}` : undefined,
      businessService: i % 10 === 0 ? businessServices[i % businessServices.length] : undefined
    };
  })
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

  // New Categories Counts
  const statusCounts = {
    Acknowledged: events.filter(e => e.isAcknowledged).length,
    Ticketed: events.filter(e => e.ticketId).length,
    BusinessService: events.filter(e => e.businessService).length,
  };

  const associationCounts = {
    Root: events.filter(e => e.label === 'Root').length,
    Priority: events.filter(e => e.priority === 'High').length,
    Associated: events.filter(e => e.clusterId).length,
  };

  const sourceCounts = {
    Trap: events.filter(e => e.source === 'Trap').length,
    Syslog: events.filter(e => e.source === 'Syslog').length,
    Adaptive: events.filter(e => e.source === 'Adaptive').length,
    Seasonal: events.filter(e => e.source === 'Seasonal').length,
    NCCM: events.filter(e => e.source === 'NCCM').length,
    IPAM: events.filter(e => e.source === 'IPAM').length,
  };

  const aiCounts = {
    'Only RCA': events.filter(e => e.aiStatus === 'Only RCA').length,
    'RCA with Remediation': events.filter(e => e.aiStatus === 'RCA with Remediation').length,
    'RCA with Auto Remediation': events.filter(e => e.aiStatus === 'RCA with Auto Remediation').length,
    'RCA Not Found': events.filter(e => e.aiStatus === 'RCA Not Found').length,
  };

  return {
    total: events.length,
    active: activeEvents.length,
    resolved: resolvedEvents.length,
    labelCounts,
    severityCounts,
    statusCounts,
    associationCounts,
    sourceCounts,
    aiCounts
  };
};

