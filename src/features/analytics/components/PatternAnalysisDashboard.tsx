
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Slider } from '@/shared/components/ui/slider'; // Assuming slider is available or we use input
import {
    Search, Activity,
    CheckCircle2, XCircle,
    ArrowLeft, Settings, BrainCircuit,
    Server, Activity as ActivityIcon, TrendingUp,
    Scale, BarChart3, GripHorizontal, RefreshCcw
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";

// --- Types ---

interface MetricContext {
    name: string;
    baseline: number; // value
    baselineLabel: string; // e.g., "20-30%"
    current: number; // value
    currentLabel: string; // e.g. "62%"
    deviationPct: number; // e.g. 148
    unit: string;
    severity: 'Normal' | 'Low' | 'Medium' | 'High' | 'Critical';
}

interface PatternOccurrence {
    id: string; // Detection ID e.g. "DET-2024-001"
    timestamp: string;
    events: EvidenceEvent[];
}

interface Pattern {
    id: string;
    name: string;
    description: string;
    signature: string;
    confidence: number;
    seenCount: number;
    applicability: string[];
    status: 'Enabled' | 'Disabled' | 'Discarded';
    type: 'Behavioral Deviation' | 'Temporal Sequence';
    ruleType: 'Relative (Baseline-aware)' | 'Traditional (Threshold)';
    metrics: MetricContext[];
    flow: PatternStep[];
    variations: DeviceVariation[];
    explanation: string;
    technicalLogic: string;
    evidenceHistory?: PatternOccurrence[];
}

interface PatternStep {
    label: string;
    type: 'metric' | 'event';
    delay?: string;
    details?: string;
}

const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
        case 'high':
        case 'major': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        case 'medium':
        case 'minor': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        case 'info': return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
        default: return 'text-muted-foreground bg-muted/10 border-border';
    }
};

interface DeviceVariation {
    deviceType: string;
    behavior: string;
    make?: string;
}

interface EvidenceEvent {
    event_id: string;
    timestamp: string;
    device: string;
    severity: 'Critical' | 'Major' | 'Minor' | 'Low' | 'Info';
    message: string;
}

// --- Mock Data ---

const PATTERNS: Pattern[] = [
    {
        id: 'P-CON-01',
        name: 'Relative Behavior Congestion Escalation',
        description: 'Detects congestion based on relative deviation from learned interface baselines rather than static thresholds.',
        signature: 'Util (+30% rel) → Queue (+40% rel) → Drop event',
        confidence: 0.94,
        seenCount: 2,
        applicability: ['Access Links', 'Low-Baseline Interfaces'],
        status: 'Enabled',
        type: 'Behavioral Deviation',
        ruleType: 'Relative (Baseline-aware)',
        evidenceHistory: [
            {
                id: 'DET-2024-001',
                timestamp: '2025-10-28 14:30',
                events: [
                    { event_id: 'EVT-LC-010', timestamp: '2025-10-28 14:25', device: 'core-router-dc1', severity: 'Major', message: 'Interface utilization normalized deviation > 30%' },
                    { event_id: 'EVT-LC-011', timestamp: '2025-10-28 14:28', device: 'core-router-dc1', severity: 'Major', message: 'Queue depth increased by 40% vs baseline' },
                    { event_id: 'EVT-LC-012', timestamp: '2025-10-28 14:30', device: 'core-router-dc1', severity: 'Critical', message: 'Packet drop rate exceeded 1%' }
                ]
            },
            {
                id: 'DET-2024-042',
                timestamp: '2024-02-28 18:45',
                events: [
                    { event_id: 'EVT-LC-040', timestamp: '2024-02-28 18:40', device: 'dist-rtr-04', severity: 'Major', message: 'Utilization spike +35% relative to hour' },
                    { event_id: 'EVT-LC-041', timestamp: '2024-02-28 18:43', device: 'dist-rtr-04', severity: 'Critical', message: 'Buffer memory allocation fault' },
                    { event_id: 'EVT-LC-042', timestamp: '2024-02-28 18:45', device: 'dist-rtr-04', severity: 'Critical', message: 'Service degraded - extensive packet loss' }
                ]
            }
        ],
        metrics: [
            {
                name: 'Interface Utilization',
                baseline: 25,
                baselineLabel: '20-30%',
                current: 62,
                currentLabel: '62%',
                deviationPct: 148,
                unit: '%',
                severity: 'Critical'
            },
            {
                name: 'Buffer Util',
                baseline: 10,
                baselineLabel: '5-12',
                current: 45,
                currentLabel: '45',
                deviationPct: 350,
                unit: 'packets',
                severity: 'Critical'
            },
            {
                name: 'CRC Errors',
                baseline: 0,
                baselineLabel: 'None',
                current: 12,
                currentLabel: '12',
                deviationPct: 100,
                unit: 'count',
                severity: 'Medium'
            }
        ],
        flow: [
            { label: 'Baseline Deviation > 30%', type: 'metric', delay: '-5 min' },
            { label: 'Buffer Util Spike', type: 'metric', delay: '-30s' },
            { label: 'PREDICTED: Packet Loss', type: 'event', delay: 'Now' }
        ],
        variations: [
            { deviceType: 'Cisco IOS-XE', behavior: 'Queue monitoring normalized to 100ms polling', make: 'Cisco' },
            { deviceType: 'Juniper MX', behavior: 'Baseline accounts for microbursts', make: 'Juniper' }
        ],
        explanation: 'The interface is operating at 62% utilization, which is significantly higher than its learned baseline of ~25% for this time of day. This deviation, combined with a sharp rise in queue depth, matches the "Congestion Escalation" pattern that typically precedes packet loss by 2-5 minutes.',
        technicalLogic: '((Current_Util - Baseline_Util) / Baseline_Util) > 0.3 AND Queue_Depth_ZScore > 3.0'
    },
    {
        id: 'P-OPT-02',
        name: 'Optical Signal Degradation',
        description: 'Gradual decrease in optical power combined with intermittent flaps predicts hard link failure.',
        signature: 'Rx Power ↓ → Flap → Link Down',
        confidence: 0.89,
        seenCount: 2,
        applicability: ['Fiber Links', 'Optical Transceivers'],
        status: 'Enabled',
        type: 'Behavioral Deviation',
        ruleType: 'Relative (Baseline-aware)',
        evidenceHistory: [
            {
                id: 'DET-OPT-001',
                timestamp: '2023-11-05 08:30',
                events: [
                    { event_id: 'EVT-OPT-101', timestamp: '2023-11-04 08:30', device: 'agg-switch-01', severity: 'Minor', message: 'Optical power -3dB drop trend observed' },
                    { event_id: 'EVT-OPT-102', timestamp: '2023-11-05 02:15', device: 'agg-switch-01', severity: 'Major', message: 'Intermittent link flaps (3 in 1 hour)' },
                    { event_id: 'EVT-OPT-103', timestamp: '2023-11-05 08:30', device: 'agg-switch-01', severity: 'Critical', message: 'Link Down - Signal Loss' }
                ]
            },
            {
                id: 'DET-OPT-002',
                timestamp: '2023-12-12 14:15',
                events: [
                    { event_id: 'EVT-OPT-120', timestamp: '2023-12-12 10:00', device: 'core-router-02', severity: 'Major', message: 'Rx Power low warning (-24dBm)' },
                    { event_id: 'EVT-OPT-121', timestamp: '2023-12-12 13:45', device: 'core-router-02', severity: 'Major', message: 'Significant error burst (CRC/FEC)' },
                    { event_id: 'EVT-OPT-122', timestamp: '2023-12-12 14:15', device: 'core-router-02', severity: 'Critical', message: 'Transceiver Failure' }
                ]
            }
        ],
        metrics: [
            {
                name: 'Rx Optical Power',
                baseline: -9,
                baselineLabel: '-9 dBm',
                current: -22,
                currentLabel: '-22 dBm',
                deviationPct: 144,
                unit: 'dBm',
                severity: 'Critical'
            }
        ],
        flow: [
            { label: 'Rx Power Trend Down', type: 'metric', delay: '-7 Days' },
            { label: 'Intermittent Link Flap', type: 'event', delay: '-1 Hour' },
            { label: 'PREDICTION: Hard Link Down', type: 'event', delay: '90% Probable' }
        ],
        variations: [],
        explanation: 'Current signal behavior matches the pattern of degrading fiber connectors seen in 8 previous link failures. Power loss is accelerating.',
        technicalLogic: 'Match Score: 0.89 (High) | Precursor to permanent signal loss.'
    },
    {
        id: 'P-CPU-03',
        name: 'Control Plane CPU Exhaustion',
        description: 'Sustained high CPU usage leading to routing protocol instability and neighbor loss.',
        signature: 'CPU ↗ → Hello Drop → Adjacency Loss',
        confidence: 0.95,
        seenCount: 2,
        applicability: ['Routers', 'Firewalls'],
        status: 'Enabled',
        type: 'Behavioral Deviation',
        ruleType: 'Relative (Baseline-aware)',
        evidenceHistory: [
            {
                id: 'DET-CPU-005',
                timestamp: '2023-10-15 11:20',
                events: [
                    { event_id: 'EVT-CPU-097', timestamp: '2023-10-15 11:10', device: 'bgp-reflector-01', severity: 'Major', message: 'CPU Utilization > 90% (5min avg)' },
                    { event_id: 'EVT-CPU-098', timestamp: '2023-10-15 11:18', device: 'bgp-reflector-01', severity: 'Critical', message: 'BGP Keepalive missing from peer 10.2.2.2' },
                    { event_id: 'EVT-CPU-099', timestamp: '2023-10-15 11:20', device: 'bgp-reflector-01', severity: 'Critical', message: 'BGP Neighbor Down (Hold Timer Expired)' }
                ]
            },
            {
                id: 'DET-CPU-008',
                timestamp: '2024-01-25 16:45',
                events: [
                    { event_id: 'EVT-CPU-010', timestamp: '2024-01-25 16:40', device: 'core-router-03', severity: 'Major', message: 'Critical Process (OSPF) High CPU' },
                    { event_id: 'EVT-CPU-011', timestamp: '2024-01-25 16:45', device: 'core-router-03', severity: 'Major', message: 'OSPF Hello drops detected' },
                    { event_id: 'EVT-CPU-012', timestamp: '2024-01-25 16:46', device: 'core-router-03', severity: 'Critical', message: 'OSPF Adjacency Loss Area 0' }
                ]
            }
        ],
        metrics: [
            {
                name: 'CPU Utilization',
                baseline: 25,
                baselineLabel: '20-30%',
                current: 94,
                currentLabel: '94%',
                deviationPct: 276,
                unit: '%',
                severity: 'Critical'
            }
        ],
        flow: [
            { label: 'CPU Load > 90%', type: 'metric', delay: '-10 min' },
            { label: 'Protocol Hello Drops', type: 'event', delay: 'Now' },
            { label: 'PREDICTION: Neighbor Down', type: 'event', delay: '95% Probable' }
        ],
        variations: [],
        explanation: 'CPU usage has deviated >200% from baseline for 10 minutes. In 95% of similar past cases, this led to OSPF/BGP adjacency drops.',
        technicalLogic: 'Match Score: 0.95 (Critical) | Immediate risk to control plane.'
    },
    {
        id: 'P-SEQ-04',
        name: 'Cascade Failure Precursor',
        description: 'Complex multi-metric sequence indicating impending service collapse.',
        signature: 'Util ↗ → Queue ↗ → Drops ↗',
        confidence: 0.93,
        seenCount: 2,
        applicability: ['Aggregated Links', 'Backbone'],
        status: 'Enabled',
        type: 'Behavioral Deviation',
        ruleType: 'Relative (Baseline-aware)',
        evidenceHistory: [
            {
                id: 'DET-SEQ-010',
                timestamp: '2023-08-12 10:00',
                events: [
                    { event_id: 'EVT-SEQ-048', timestamp: '2023-08-12 09:50', device: 'backbone-switch-01', severity: 'Major', message: 'Link Util > 50% deviation' },
                    { event_id: 'EVT-SEQ-049', timestamp: '2023-08-12 09:55', device: 'backbone-switch-01', severity: 'Critical', message: 'Output Queue Saturation' },
                    { event_id: 'EVT-SEQ-050', timestamp: '2023-08-12 10:00', device: 'backbone-switch-01', severity: 'Critical', message: 'Massive Packet Drops > 5%' }
                ]
            },
            {
                id: 'DET-SEQ-015',
                timestamp: '2023-09-30 22:15',
                events: [
                    { event_id: 'EVT-SEQ-086', timestamp: '2023-09-30 22:05', device: 'dist-switch-12', severity: 'Major', message: 'Backbone Link Util Spike' },
                    { event_id: 'EVT-SEQ-087', timestamp: '2023-09-30 22:12', device: 'dist-switch-12', severity: 'Major', message: 'Buffer Credit Exhaustion' },
                    { event_id: 'EVT-SEQ-088', timestamp: '2023-09-30 22:15', device: 'dist-switch-12', severity: 'Major', message: 'Application Latency & Retransmits' }
                ]
            }
        ],
        metrics: [
            {
                name: 'Link Utilization',
                baseline: 55,
                baselineLabel: '50-60%',
                current: 85,
                currentLabel: '85%',
                deviationPct: 54,
                unit: '%',
                severity: 'High'
            },
            {
                name: 'Output Queue',
                baseline: 5,
                baselineLabel: 'Low',
                current: 25,
                currentLabel: 'High',
                deviationPct: 400,
                unit: 'packets',
                severity: 'Critical'
            },
            {
                name: 'Interface Drops',
                baseline: 0,
                baselineLabel: '0',
                current: 120,
                currentLabel: '120',
                deviationPct: 100,
                unit: 'count',
                severity: 'Critical'
            }
        ],
        flow: [
            { label: 'Util Deviation > 50%', type: 'metric', delay: '-10 min' },
            { label: 'Queue Saturation', type: 'metric', delay: '-5 min' },
            { label: 'Packet Drops Start', type: 'metric', delay: 'Now' },
            { label: 'PREDICTED: Service Down', type: 'event', delay: '90% Probable' }
        ],
        variations: [],
        explanation: 'Sequential escalation of three key metrics detected. This specific pattern (A->B->C) matches the pre-failure signature of 5 past backbone outages.',
        technicalLogic: 'Sequence(Util_Rise -> Queue_Rise -> Drop_Rise) within 15 mins.'
    },
    {
        id: 'P-TRAD-01',
        name: 'Static Core Congestion',
        description: 'Standard deterministic rule checking for simultaneous high utilization and queue depth on core links.',
        signature: 'Util > 90% + Queue > 70% → Congestion Alert',
        confidence: 0.99,
        seenCount: 2,
        applicability: ['Core Uplinks', 'Data Center Spines'],
        status: 'Enabled',
        type: 'Temporal Sequence',
        ruleType: 'Traditional (Threshold)',
        evidenceHistory: [
            {
                id: 'DET-TRAD-001',
                timestamp: '2023-02-15 13:30',
                events: [
                    { event_id: 'EVT-TRAD-008', timestamp: '2023-02-15 13:30', device: 'core-router-01', severity: 'Critical', message: 'Physical Interface Utilization > 95%' },
                    { event_id: 'EVT-TRAD-009', timestamp: '2023-02-15 13:30', device: 'core-router-01', severity: 'Critical', message: 'QoS Class Default Queue > 80%' },
                    { event_id: 'EVT-TRAD-010', timestamp: '2023-02-15 13:30', device: 'core-router-01', severity: 'Info', message: 'Congestion Control Action: RED Drop' }
                ]
            },
            {
                id: 'DET-TRAD-005',
                timestamp: '2023-05-20 09:00',
                events: [
                    { event_id: 'EVT-TRAD-043', timestamp: '2023-05-20 09:00', device: 'spine-switch-04', severity: 'Major', message: 'Egress Port Util > 90%' },
                    { event_id: 'EVT-TRAD-044', timestamp: '2023-05-20 09:00', device: 'spine-switch-04', severity: 'Critical', message: 'VoIP Buffer Util > 10ms' },
                    { event_id: 'EVT-TRAD-045', timestamp: '2023-05-20 09:00', device: 'spine-switch-04', severity: 'Major', message: 'Tail Drop on Voice Class' }
                ]
            }
        ],
        metrics: [
            {
                name: 'Utilization',
                baseline: 0,
                baselineLabel: 'N/A',
                current: 92,
                currentLabel: '92%',
                deviationPct: 0,
                unit: '%',
                severity: 'Critical'
            },
            {
                name: 'Buffer Util',
                baseline: 0,
                baselineLabel: 'N/A',
                current: 75,
                currentLabel: '75%',
                deviationPct: 0,
                unit: '%',
                severity: 'Critical'
            }
        ],
        flow: [
            { label: 'Utilization > 90%', type: 'metric', delay: 'Now' },
            { label: 'Buffer Util > 70%', type: 'metric', delay: 'Concurrent' },
            { label: 'ALERT: Congestion Risk', type: 'event', delay: 'Immediate' }
        ],
        variations: [],
        explanation: 'Hard threshold rule: Interface Utilization (92%) and Buffer Util (75%) have both exceeded their critical static thresholds defined for Core Links.',
        technicalLogic: 'IF Util > 90 AND Queue > 70 THEN Raise_Alert(Congestion)'
    },
    {
        id: 'P-SEQ-02',
        name: 'Control Plane Overload Sequence',
        description: 'Correlates control plane CPU spikes with downstream forwarding drops and latency increases.',
        signature: 'CPU_HIGH → QUEUE_DROP → LATENCY_HIGH',
        confidence: 0.88,
        seenCount: 2,
        applicability: ['Routers', 'Gateways'],
        status: 'Enabled',
        type: 'Temporal Sequence',
        ruleType: 'Traditional (Threshold)',
        evidenceHistory: [
            {
                id: 'DET-SEQ-020',
                timestamp: '2023-11-20 04:30',
                events: [
                    { event_id: 'EVT-SEQ-110', timestamp: '2023-11-20 04:28', device: 'edge-firewall-01', severity: 'Critical', message: 'Control Plane CPU > 95%' },
                    { event_id: 'EVT-SEQ-111', timestamp: '2023-11-20 04:29', device: 'edge-firewall-01', severity: 'Major', message: 'Input Queue Drops (Software)' },
                    { event_id: 'EVT-SEQ-112', timestamp: '2023-11-20 04:30', device: 'edge-firewall-01', severity: 'Major', message: 'High Latency Alarm (>200ms)' }
                ]
            },
            {
                id: 'DET-SEQ-022',
                timestamp: '2024-02-10 12:00',
                events: [
                    { event_id: 'EVT-SEQ-023', timestamp: '2024-02-10 11:58', device: 'core-router-05', severity: 'Major', message: 'Routing Engine CPU High' },
                    { event_id: 'EVT-SEQ-024', timestamp: '2024-02-10 11:59', device: 'core-router-05', severity: 'Major', message: 'Forwarding buffer drops' },
                    { event_id: 'EVT-SEQ-025', timestamp: '2024-02-10 12:00', device: 'core-router-05', severity: 'Critical', message: 'Synthetic Probe Timeout' }
                ]
            }
        ],
        metrics: [
            {
                name: 'CPU Load',
                baseline: 0,
                baselineLabel: 'N/A',
                current: 95,
                currentLabel: '95%',
                deviationPct: 0,
                unit: '%',
                severity: 'Critical'
            },
            {
                name: 'Forwarding Latency',
                baseline: 0,
                baselineLabel: 'N/A',
                current: 120,
                currentLabel: '120ms',
                deviationPct: 0,
                unit: 'ms',
                severity: 'High'
            }
        ],
        flow: [
            { label: 'EVENT: CPU_HIGH', type: 'event', delay: '-2 min' },
            { label: 'EVENT: QUEUE_DROP', type: 'event', delay: '-30s' },
            { label: 'EVENT: LATENCY_HIGH', type: 'event', delay: 'Now' }
        ],
        variations: [],
        explanation: 'Detected a known failure sequence: High CPU load on the control plane has caused packet processing delays (Latency) and buffer overflows (Drops).',
        technicalLogic: 'Sequence Match: CPU_ALARM -> DROP_EVENT -> LATENCY_ALARM within 5 min window.'
    },
    {
        id: 'P-FAIL-03',
        name: 'Root Cause Node Isolation',
        description: 'Identifies physical link failure as the root cause of subsequent node unreachable and service down events.',
        signature: 'LINK_DOWN → NODE_UNREACHABLE → SERVICE_DOWN',
        confidence: 1.0,
        seenCount: 2,
        applicability: ['All Devices'],
        status: 'Enabled',
        type: 'Temporal Sequence',
        ruleType: 'Traditional (Threshold)',
        evidenceHistory: [
            {
                id: 'DET-FAIL-001',
                timestamp: '2023-01-15 02:22',
                events: [
                    { event_id: 'EVT-FAIL-003', timestamp: '2023-01-15 02:21:40', device: 'agg-switch-03', severity: 'Critical', message: 'Link Down: Te1/0/1' },
                    { event_id: 'EVT-FAIL-004', timestamp: '2023-01-15 02:21:50', device: 'agg-switch-03', severity: 'Critical', message: 'Neighbor Unreachable: 192.168.10.5' },
                    { event_id: 'EVT-FAIL-005', timestamp: '2023-01-15 02:22:00', device: 'agg-switch-03', severity: 'Major', message: 'Service Down: Web-Front' }
                ]
            },
            {
                id: 'DET-FAIL-003',
                timestamp: '2024-01-22 19:40',
                events: [
                    { event_id: 'EVT-FAIL-007', timestamp: '2024-01-22 19:40:00', device: 'site-router-10', severity: 'Critical', message: 'Link Down: Gi0/0' },
                    { event_id: 'EVT-FAIL-008', timestamp: '2024-01-22 19:40:05', device: 'site-router-10', severity: 'Critical', message: 'Remote Site Unreachable' },
                    { event_id: 'EVT-FAIL-009', timestamp: '2024-01-22 19:40:10', device: 'site-router-10', severity: 'Major', message: 'Branch Service Interrupt' }
                ]
            }
        ],
        metrics: [
            {
                name: 'Link Status',
                baseline: 1,
                baselineLabel: 'Up',
                current: 0,
                currentLabel: 'Down',
                deviationPct: 100,
                unit: 'state',
                severity: 'Critical'
            }
        ],
        flow: [
            { label: 'EVENT: LINK_DOWN', type: 'event', delay: '-10s' },
            { label: 'EVENT: NODE_UNREACHABLE', type: 'event', delay: '-2s' },
            { label: 'EVENT: SERVICE_DOWN', type: 'event', delay: 'Now' }
        ],
        variations: [],
        explanation: 'Discrete event correlation confirms that the Service Outage is a direct downstream effect of the physical Link Failure event received 10 seconds prior.',
        technicalLogic: 'Root Cause: LINK_DOWN (t-10s) -> Symptom: SERVICE_DOWN (t=0)'
    }
];

export function PatternAnalysisDashboard() {
    const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Simulation State ---
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedPattern, setSimulatedPattern] = useState<Pattern | null>(null);

    // Initialize simulated pattern when selectedPattern changes
    useEffect(() => {
        if (selectedPattern) {
            setSimulatedPattern(JSON.parse(JSON.stringify(selectedPattern))); // Deep copy
        } else {
            setSimulatedPattern(null);
            setIsSimulating(false);
        }
    }, [selectedPattern]);

    const filteredPatterns = PATTERNS.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );


    /**
     * Updates the SIMULATED metric 'current' value.
     * Recalculates deviation and severity automatically.
     */
    const handleSimulationChange = (metricIndex: number, newValue: number) => {
        if (!simulatedPattern) return;

        const updatedMetrics = [...simulatedPattern.metrics];
        const metric = updatedMetrics[metricIndex];

        // 1. Update current value
        metric.current = newValue;
        metric.currentLabel = newValue.toString() + (metric.unit === '%' ? '%' : '');

        // 2. Recalculate Deviation Percentage
        // Formula: ((Current - Baseline) / Baseline) * 100
        const deviation = Math.round(((newValue - metric.baseline) / metric.baseline) * 100);
        metric.deviationPct = deviation > 0 ? deviation : 0; // Show 0 if below baseline for simplicity

        // 3. Recalculate Severity (Simplified Logic)
        if (metric.deviationPct > 100) metric.severity = 'Critical';
        else if (metric.deviationPct > 50) metric.severity = 'High';
        else if (metric.deviationPct > 20) metric.severity = 'Medium';
        else if (metric.deviationPct > 10) metric.severity = 'Low';
        else metric.severity = 'Normal';

        setSimulatedPattern({
            ...simulatedPattern,
            metrics: updatedMetrics
        });
    };

    const toggleSimulationMode = () => {
        if (isSimulating) {
            // Stop Simulating: Revert to original data
            setIsSimulating(false);
            if (selectedPattern) setSimulatedPattern(JSON.parse(JSON.stringify(selectedPattern)));
        } else {
            // Start Simulating
            setIsSimulating(true);
        }
    };

    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'Low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-green-500 bg-green-500/10 border-green-500/20';
        }
    };

    const getProgressColor = (sev: string) => {
        switch (sev) {
            case 'Critical': return 'bg-red-500';
            case 'High': return 'bg-orange-500';
            case 'Medium': return 'bg-amber-500';
            case 'Low': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    // --- LIST VIEW ---
    if (!selectedPattern) {
        return (
            <div className="h-[calc(100vh-8rem)] flex flex-col gap-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                            Pattern Library
                        </h2>
                        {/* Search */}
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search patterns..."
                                className="pl-8 h-9 text-xs"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pb-10 pr-4">
                        {filteredPatterns.map(pattern => (
                            <Card
                                key={pattern.id}
                                onClick={() => setSelectedPattern(pattern)}
                                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group border-border/60 bg-card"
                            >
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "font-mono text-[10px]",
                                                pattern.status === 'Enabled' ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "text-muted-foreground"
                                            )}
                                        >
                                            {pattern.status}
                                        </Badge>
                                        <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] hover:bg-indigo-500/20">
                                            {pattern.ruleType.split(' ')[0]}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">
                                        {pattern.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs line-clamp-2 mt-1.5 h-8">
                                        {pattern.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-secondary/50 p-2 rounded mb-3">
                                        <Scale className="h-3 w-3 text-indigo-400" />
                                        <span className="truncate flex-1">{pattern.signature}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <ActivityIcon className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                            {pattern.seenCount} detections
                                        </div>
                                        <div className="flex items-center text-xs font-medium">
                                            <span className="text-muted-foreground mr-1">Conf:</span>
                                            {pattern.confidence}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        )
    }

    // Guard for initial render
    const activePattern = simulatedPattern || selectedPattern;

    // --- DETAILS VIEW ---
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in slide-in-from-right-4 duration-500">

            {/* Header / Nav */}
            <div className="flex items-start gap-4 shrink-0 mb-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedPattern(null); setIsSimulating(false); }}
                    className="gap-2 pl-2 pr-4 h-9"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Library
                </Button>
                <div className="flex-1 space-y-1.5 ml-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold tracking-tight">{activePattern.name}</h2>
                        <Badge variant="outline" className="font-mono text-[10px] h-5 px-1.5 text-muted-foreground/80">{activePattern.id}</Badge>
                        <Badge className="bg-indigo-500/10 text-indigo-500 text-[10px] h-5 hover:bg-indigo-500/10 border-indigo-500/20 shadow-none font-medium">
                            {activePattern.ruleType}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
                        {activePattern.description}
                    </p>
                </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 pr-4 -mr-4">
                <div className="space-y-4 pb-10 pr-4">

                    {/* Top Meta Grid */}
                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Applicability</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {activePattern.applicability.map(a => (
                                            <Badge key={a} variant="secondary" className="text-[10px] font-medium h-5 px-2 bg-secondary/50">{a}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Confidence Level</span>
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <div className="h-2 w-full max-w-[120px] bg-secondary rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: `${activePattern.confidence * 100}%` }} />
                                        </div>
                                        <span className="font-mono text-amber-500">{activePattern.confidence}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pattern Type</span>
                                    <div className="flex items-center">
                                        <Badge variant="outline" className="text-[10px] font-medium h-5 px-2 border-primary/20 text-primary/80">{activePattern.type}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visual Deviation Context */}
                    <Card className={cn(
                        "border-border/50 bg-card/50 overflow-hidden transition-all duration-300",
                        isSimulating ? "ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10" : ""
                    )}>
                        <CardHeader className={cn(
                            "py-3 px-5 border-b border-border/50 flex flex-row items-center justify-between",
                            isSimulating ? "bg-indigo-500/10" : "bg-secondary/5"
                        )}>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-indigo-500" />
                                {isSimulating ? 'Simulation Mode: Adjust Metrics' : 'Contextual Behavioral Deviations'}
                            </CardTitle>
                            {isSimulating && (
                                <Badge variant="outline" className="bg-background text-indigo-500 border-indigo-500/30 animate-pulse">
                                    Interactive Simulation Active
                                </Badge>
                            )}
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {activePattern.metrics.map((metric, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-sm font-medium flex items-center gap-2">
                                                    {metric.name}
                                                    <span className="text-[10px] text-muted-foreground font-normal bg-secondary/50 px-1.5 py-0.5 rounded">Last 10 min</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                                    <span>Baseline: <span className="font-mono text-foreground">{metric.baselineLabel}</span></span>
                                                    <span className="text-border">|</span>
                                                    <span>Current: <span className="font-mono text-foreground">{metric.currentLabel}</span></span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={cn("text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1", getSeverityColor(metric.severity))}>
                                                    {metric.severity} Severity
                                                </div>
                                                <div className={cn("text-sm font-bold block", metric.deviationPct > 0 ? "text-red-500" : "text-green-500")}>
                                                    {metric.deviationPct > 0 ? '+' : ''}{metric.deviationPct}% Deviation
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <div className="relative h-6 bg-secondary/30 rounded w-full flex items-center overflow-hidden">
                                                {activePattern.ruleType === 'Traditional (Threshold)' ? (
                                                    // Traditional: Simple Progress Bar
                                                    <>
                                                        <div
                                                            className={cn("absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out", getProgressColor(metric.severity))}
                                                            style={{ width: `${Math.min(metric.current, 100)}%`, opacity: 0.8 }}
                                                        />
                                                        <div className="absolute right-2 text-[10px] font-medium text-muted-foreground/80 z-10 mix-blend-difference">
                                                            {metric.currentLabel}
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Behavioral: Baseline Deviation
                                                    <>
                                                        {/* Baseline Marker */}
                                                        <div
                                                            className="absolute top-0 bottom-0 bg-emerald-500/10 border-r border-l border-emerald-500/20 flex items-center justify-center z-10"
                                                            style={{ left: '0%', width: `${(metric.baseline / 100) * 100}%` }}
                                                        >
                                                            <span className="text-[9px] text-emerald-600/70 font-medium tracking-tight">Normal Zone</span>
                                                        </div>

                                                        {/* Current Value Marker (Animated) */}
                                                        <div
                                                            className="absolute h-4 w-1 bg-foreground z-30 rounded-full transition-all duration-300 shadow-sm ring-1 ring-background top-1"
                                                            style={{ left: `${Math.min(metric.current, 100)}%` }}
                                                        />

                                                        {/* Deviation Fill */}
                                                        <div
                                                            className={cn("absolute h-full opacity-60 transition-all duration-300", getProgressColor(metric.severity))}
                                                            style={{
                                                                left: `${metric.baseline}%`,
                                                                width: `${Math.min(Math.max(0, metric.current - metric.baseline), 100 - metric.baseline)}%`
                                                            }}
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            {/* Simulation Slider */}
                                            {isSimulating && (
                                                <div className="animate-in fade-in slide-in-from-top-1 mt-2 p-2 bg-indigo-500/5 rounded border border-indigo-500/10">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] text-muted-foreground w-8 text-right">Min</span>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="150"
                                                            value={metric.current}
                                                            onChange={(e) => handleSimulationChange(i, parseInt(e.target.value))}
                                                            className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                        />
                                                        <span className="text-[10px] text-muted-foreground w-8">Max</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {!isSimulating && (
                                            <p className="text-[11px] text-muted-foreground  pl-1 border-l-2 border-primary/20">
                                                Current {metric.name.toLowerCase()} is <span className="text-foreground font-medium">{metric.deviationPct}% above</span> learned behavior.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logic & Flow Grid - Refined Spacing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-border/50 bg-card/50 h-full">
                            <CardHeader className="py-3 px-5 border-b border-border/50 bg-secondary/5">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <BrainCircuit className="h-4 w-4 text-purple-500" />
                                    Behavioral Logic Explanation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 flex flex-col h-full gap-4">
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {activePattern.explanation}
                                </p>
                                <div className="mt-auto pt-4 border-t border-border/30">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block tracking-wider">Technical Implementation</span>
                                    <div className="p-2.5 bg-secondary/30 rounded border border-border/50 font-mono text-[11px] text-primary/80 whitespace-pre-wrap">
                                        {activePattern.technicalLogic}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/50 h-full">
                            <CardHeader className="py-3 px-5 border-b border-border/50 bg-secondary/5">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Pattern Sequence Flow
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="space-y-0.5 relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border/50 -z-10" />

                                    {activePattern.flow.map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-4 py-2 group">
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold shadow-sm ring-4 ring-background z-10 transition-all",
                                                step.type === 'metric' ? "bg-blue-500/10 text-blue-500 event-node-metric" : "bg-red-500/10 text-red-500 event-node-outcome"
                                            )}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 p-2.5 rounded border border-border/40 bg-card/30 text-xs flex justify-between items-center hover:bg-secondary/10 transition-colors shadow-sm">
                                                <span className="font-medium text-foreground/90">{step.label}</span>
                                                {step.delay && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono text-muted-foreground bg-secondary/50">{step.delay}</Badge>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Historical Evidence Events */}
                    {activePattern.evidenceHistory && activePattern.evidenceHistory.length > 0 && (
                        <Card className="border-border/50 bg-card/50">
                            <CardHeader className="py-3 px-5 border-b border-border/50 bg-secondary/5">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-emerald-500" />
                                    Historical Evidence & Occurrences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border/50 hover:bg-transparent">
                                            <TableHead className="h-9 text-xs w-28">Timestamp</TableHead>
                                            <TableHead className="h-9 text-xs w-24">Event ID</TableHead>
                                            <TableHead className="h-9 text-xs w-32">Device</TableHead>
                                            <TableHead className="h-9 text-xs">Event Message</TableHead>
                                            <TableHead className="h-9 text-xs w-20">Severity</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activePattern.evidenceHistory && activePattern.evidenceHistory.length > 0 ? (
                                            activePattern.evidenceHistory.flatMap((detection) => [
                                                // Detection Header Row
                                                <TableRow key={`det-${detection.id}`} className="bg-secondary/20 hover:bg-secondary/30">
                                                    <TableCell colSpan={5} className="py-2 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold text-xs text-foreground/80">Detection ID: {detection.id}</span>
                                                            <span className="text-muted-foreground text-[10px]">•</span>
                                                            <span className="text-xs text-muted-foreground font-mono">{detection.timestamp}</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>,
                                                // Event Rows
                                                ...detection.events.map((event, i) => (
                                                    <TableRow key={`${detection.id}-evt-${i}`} className="border-border/50 hover:bg-secondary/10">
                                                        <TableCell className="text-xs font-mono text-muted-foreground py-3 pl-8 whitespace-nowrap">
                                                            {event.timestamp.split(' ')[0]} <span className="opacity-50">{event.timestamp.split(' ')[1]}</span>
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium py-3 text-primary/80">{event.event_id}</TableCell>
                                                        <TableCell className="text-xs py-3 text-muted-foreground">{event.device}</TableCell>
                                                        <TableCell className="text-xs py-3">{event.message}</TableCell>
                                                        <TableCell className="text-xs py-3">
                                                            <Badge variant="outline" className={cn("text-[10px] font-normal border-border bg-secondary/20", getSeverityColor(event.severity))}>
                                                                {event.severity}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ])
                                        ) : (
                                            <TableRow className="border-border/50 hover:bg-transparent">
                                                <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground ">
                                                    No specific historical evidence events recorded for this pattern.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* Device Variations */}
                    <Card className="border-border/50 bg-card/50">
                        <CardHeader className="py-3 px-5 border-border/50 bg-secondary/5">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Server className="h-4 w-4 text-orange-500" />
                                Device Specific Variations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="h-9 text-xs">Device Type</TableHead>
                                        <TableHead className="h-9 text-xs">Observed Behavior</TableHead>
                                        <TableHead className="h-9 text-xs">Make</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activePattern.variations.map((v, i) => (
                                        <TableRow key={i} className="border-border/50 hover:bg-secondary/10">
                                            <TableCell className="text-xs font-medium py-3">{v.deviceType}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground py-3">{v.behavior}</TableCell>
                                            <TableCell className="text-xs py-3 w-24">
                                                {v.make && <Badge variant="outline" className="text-[10px] font-normal">{v.make}</Badge>}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                        <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <XCircle className="h-4 w-4 mr-2" />
                            Suppress Pattern
                        </Button>
                        <Button
                            variant={isSimulating ? "default" : "secondary"}
                            onClick={toggleSimulationMode}
                            className={cn(isSimulating && "bg-indigo-600 hover:bg-indigo-700 text-white")}
                        >
                            {isSimulating ? <RefreshCcw className="h-4 w-4 mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                            {isSimulating ? 'Reset Simulation' : 'Simulate Deviation'}
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Enable Behavioral Rule
                        </Button>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
