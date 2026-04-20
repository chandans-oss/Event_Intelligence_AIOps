
import { useState } from 'react';
import {
    Activity,
    ArrowRight,
    BrainCircuit,
    CheckCircle2,
    Clock,
    Cpu,
    Database,
    Grid,
    LayoutList,
    List,
    Network,
    Search,
    Server,
    TrendingUp,
    Zap,
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';

// --- Types ---

export interface PatternStep {
    id: string;
    name: string;
    description: string;
    icon: any; // Lucide Icon
    delay?: string;
}

export interface LogicStep {
    order: number;
    title: string;
    description: string;
    color: 'blue' | 'amber' | 'red';
}

export interface PredictedEvent {
    name: string; // E.g., PACKET_DROP
    probability: number; // 0-1
    severity: 'Critical' | 'Major' | 'High' | 'Medium' | 'Low';
    title: string;
    subtitle: string;
}

export interface EvidenceItem {
    id: string; // Incident/Alarm ID
    timestamp: string;
    title: string;
    subtitle: string;
    severity: 'Critical' | 'Major' | 'Warning';
    nodeName: string;
    nodeIp: string;
    resource: string;
    alertValue: string;
    threshold: string;
}

export interface PatternOccurrence {
    id: string;
    timestamp: string;
    severity: 'Critical' | 'Major' | 'Warning';
    summary: string;
    outcomes: string[];
    events: EvidenceItem[];
    metricData: any[]; // For the chart
}

export interface Pattern {
    id: string;
    name: string;
    description: string;
    confidence: number;
    seenCount: number;
    lastSeen: string;
    domain: 'Network' | 'Compute' | 'Storage' | 'Application' | 'Data Center' | 'Security';
    appliesTo: string[];
    status: 'Enabled' | 'Disabled' | 'Learning';
    severity: 'Critical' | 'Major' | 'Warning';
    ruleCreationDate: string;
    steps: PatternStep[];
    tags: string[];

    // Dynamic Content Fields
    logicSummary: string;
    logicSteps: LogicStep[];
    predictedEvents: PredictedEvent[];
    drillDownMetrics: {
        label: string;
        value: string;
        icon: 'trending' | 'database' | 'alert';
        color: 'blue' | 'amber' | 'red';
    }[];
    occurrences: PatternOccurrence[];
    simulationType: 'congestion' | 'cpu_spike' | 'device_cpu_saturation' | 'link_physical_degradation' | 'firewall_overload' | 'qoe_jitter';
}

// --- Mock Data ---

const generateCongestionData = (severity: 'High' | 'Med' | 'Low', variation: number = 1) => {
    const data = [];
    const baseUtil = severity === 'High' ? 65 : severity === 'Med' ? 45 : 25;
    const pointCount = 24; // ~2 mins of data at 5s intervals

    for (let i = 0; i < pointCount; i++) {
        // Organic multi-frequency noise
        const primaryNoise = Math.sin(i * 0.5 + variation) * 4;
        const jitter = (Math.random() - 0.5) * (severity === 'High' ? 12 : 6);
        const microJitter = (Math.random() - 0.5) * 3;

        // Pattern logic
        let utilProgress = (i / pointCount) * (severity === 'High' ? 35 : 20);
        let util = baseUtil + utilProgress + primaryNoise + jitter + microJitter;

        // Drops kicks in exponentially after 60% progress
        let drops = 0;
        if (i > pointCount * 0.6) {
            const dropImpact = Math.pow(i - (pointCount * 0.6), 1.8) * (variation % 2 === 0 ? 1.5 : 0.8);
            drops = dropImpact + (Math.random() * 5);
            if (severity === 'High') drops += 10;
        }

        // CRC errors appear late and bursty
        let errors = 0;
        if (i > pointCount * 0.8 && severity !== 'Low') {
            errors = (i - pointCount * 0.8) * 2 + (Math.random() > 0.7 ? 5 : 0);
        }

        data.push({
            time: `${i * 5}s`,
            utilization: Math.min(100, Math.max(0, util)),
            drops: Math.round(drops),
            errors: Math.round(errors)
        });
    }
    return data;
};

const generateCpuData = (peak: number, variation: number = 1) => {
    const data = [];
    const pointCount = 25;
    const spikeStart = Math.floor(pointCount * 0.5) + (variation % 5);
    const baseLoad = 15 + (variation * 7) % 15;

    for (let i = 0; i < pointCount; i++) {
        const jitter = (Math.random() - 0.5) * 8;
        let cpu = baseLoad + (Math.sin(i * 0.4) * 5) + jitter;

        if (i >= spikeStart) {
            // Plateau/Saturation phase
            cpu = peak - (Math.random() * 6);
        } else if (i >= spikeStart - 4) {
            // Aggressive ramp-up
            const progress = (i - (spikeStart - 4)) / 4;
            cpu = baseLoad + (peak - baseLoad) * progress + jitter;
        }

        const bgpState = i > spikeStart + 5 ? 0 : 1;

        data.push({
            time: `${i * 5}s`,
            cpu: Math.min(100, Math.max(0, cpu)),
            bgpState: bgpState
        });
    }
    return data;
};

const generateCpuSaturation = (variation: number = 1) => {
    const data = [];
    const pointCount = 25;
    for (let i = 0; i < pointCount; i++) {
        const noise = (Math.random() - 0.5) * 6;
        const cpu = Math.min(100, 40 + (i * 2.8) + noise + (Math.sin(i * 0.5) * 4));
        const lossThreshold = Math.floor(pointCount * 0.7);
        const pingLoss = i > lossThreshold ? Math.min(100, (i - lossThreshold) * 12 + (Math.random() * 15)) : (Math.random() > 0.8 ? 2 : 0);
        data.push({
            time: `${i * 5}s`,
            cpuUtil: Math.round(cpu),
            pingLoss: Math.round(pingLoss)
        });
    }
    return data;
};

const generateLinkPhysData = (variation: number = 1) => {
    const data = [];
    const pointCount = 25;
    for (let i = 0; i < pointCount; i++) {
        const baseNoise = Math.random() * 5;
        const errThreshold = Math.floor(pointCount * 0.4);
        const errors = i > errThreshold ? (i - errThreshold) * 45 * variation + (Math.random() * 40) : baseNoise;

        const discThreshold = Math.floor(pointCount * 0.6);
        const discards = i > discThreshold ? (i - discThreshold) * 15 * variation + (Math.random() * 20) : 0;

        data.push({
            time: `${i * 5}s`,
            inErrors: Math.round(errors),
            discards: Math.round(discards)
        });
    }
    return data;
};

const generateFwLoadData = (variation: number = 1) => {
    const data = [];
    const pointCount = 25;
    for (let i = 0; i < pointCount; i++) {
        const sessions = 10000 + (Math.pow(i, 2.7) * 40 * variation) + (Math.random() * 500);
        const noise = (Math.random() - 0.5) * 10;
        const cpu = Math.min(100, 25 + (i * 3.2) + noise + (Math.sin(i * 0.4) * 5));
        const latThreshold = Math.floor(pointCount * 0.7);
        const latency = i > latThreshold ? 12 + Math.pow(i - latThreshold, 2) * 4 + (Math.random() * 15) : 10 + (Math.random() * 5);
        data.push({
            time: `${i * 5}s`,
            sessions: Math.round(sessions),
            fwCpu: Math.round(cpu),
            latency: Math.round(latency)
        });
    }
    return data;
};

const generateQoeData = (variation: number = 1) => {
    const data = [];
    const pointCount = 25;
    for (let i = 0; i < pointCount; i++) {
        const jitNoise = (Math.random() - 0.5) * 4;
        const jitter = 2 + (i * 1.4 * variation) + jitNoise + (Math.sin(i * 0.6) * 3);
        const varNoise = (Math.random() - 0.5) * 6;
        const latencyVar = 5 + (Math.pow(i, 1.25) * variation) + varNoise + (Math.sin(i * 0.3) * 5);
        data.push({
            time: `${i * 5}s`,
            jitter: Math.round(jitter * 10) / 10,
            latencyVar: Math.round(latencyVar * 10) / 10
        });
    }
    return data;
};

const generateOccurrences = (patternName: string, count: number, severity: string, metrics: any[]) => {
    const occs = [];
    const devices = ['R1-Edge-01', 'Sw1-Core-02', 'Fw1-Trust-01', 'R2-Border-02', 'Sw2-Dist-01'];
    for (let i = 0; i < count; i++) {
        const timeAgo = (i + 1) * 4 * 3600000 + Math.random() * 3600000; // staggered by 4 hours
        const ts = new Date(Date.now() - timeAgo).toISOString();
        const dev = devices[Math.floor(Math.random() * devices.length)];
        occs.push({
            id: `OCC-${patternName.slice(0, 3)}-${100 + i}`,
            timestamp: ts,
            severity: severity,
            summary: `${patternName} matched on ${dev}`,
            outcomes: ['Service Degradation', 'High Latency'],
            metricData: metrics,
            events: [
                {
                    id: `E-${Math.floor(Math.random() * 1000000)}`,
                    timestamp: new Date(new Date(ts).getTime() - 600000).toISOString(),
                    title: 'Precursor Detected',
                    subtitle: 'Anomalous shift',
                    severity: 'Warning',
                    nodeName: dev,
                    nodeIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                    resource: 'Interface-1',
                    alertValue: 'Threshold breach',
                    threshold: 'Standard correlation'
                }
            ]
        });
    }
    return occs;
};

export const MOCK_PATTERNS: Pattern[] = [
    {
        id: 'P-Con-01',
        name: 'Interface Flap Pattern',
        description: 'R1:B/W Util | Sw1:Buffer Util | Sw1:CRC Errors | Sw1:Packet Loss',
        confidence: 0.92,
        seenCount: 48,
        lastSeen: '2 hours ago',
        domain: 'Network',
        appliesTo: ['Routers', 'Switches'],
        status: 'Enabled',
        severity: 'Critical',
        ruleCreationDate: 'Jan 10, 2025',
        tags: ['Congestion', 'Predictive', 'Interface', 'Pattern Match'],
        steps: [
            { id: 'S1', name: 'R1:B/W Util', description: '50% -> 95%', icon: TrendingUp, delay: '0m' },
            { id: 'S2', name: 'Sw1:Buffer Util', description: '20% -> 90%', icon: Database, delay: '+4m' },
            { id: 'S3', name: 'Sw1:CRC Errors', description: '0 -> 85', icon: AlertTriangle, delay: '+2m' },
            { id: 'S4', name: 'Sw1:Packet Loss', description: '0% -> 8%', icon: Activity, delay: '+5m' },
            { id: 'S5', name: 'Interface Flap', description: '', icon: ShieldCheck, delay: '(Final)' }
        ],
        logicSummary: 'Saturation-to-Failure Sequence:',
        logicSteps: [
            { order: 1, title: 'Traffic Overload', description: 'B/W Util', color: 'blue' },
            { order: 2, title: 'Buffer Saturation', description: 'Buffer Util', color: 'amber' },
            { order: 3, title: 'Physical Layer Errors', description: 'CRC Errors', color: 'amber' },
            { order: 4, title: 'Packet Loss', description: 'Packet Loss', color: 'amber' },
            { order: 5, title: 'Connection Collapse', description: 'Link Flap', color: 'red' }
        ],
        predictedEvents: [
            { name: 'Packet Loss', probability: 0.92, severity: 'Major', title: '', subtitle: 'Edge congestion detected' },
            { name: 'Interface Flap', probability: 0.99, severity: 'Critical', title: '', subtitle: 'Interface stability failure' }
        ],
        drillDownMetrics: [
            { label: 'B/W Util', value: 'Gradual rise from ~50% → ~95%', icon: 'trending', color: 'blue' },
            { label: 'Buffer Util', value: 'Starts increasing after util crosses ~80%', icon: 'database', color: 'amber' },
            { label: 'CRC Errors', value: 'Begin to appear when queue > ~75% (Total Discards)', icon: 'alert', color: 'red' }
        ],
        occurrences: [
            {
                id: 'OCC-2026-001',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                severity: 'Critical',
                summary: 'Edge Router Congestion to Flap',
                outcomes: ['Packet Loss', 'Interface Flap'],
                metricData: generateCongestionData('High', 1),
                events: [
                    {
                        id: 'E-2605011', timestamp: new Date(Date.now() - 3600000 - 600000).toISOString(),
                        title: 'Link Overload', subtitle: '92% Utilization', severity: 'Warning',
                        nodeName: 'R1-Edge-01', nodeIp: '10.0.4.203', resource: 'Gi1/0/1',
                        alertValue: '92%', threshold: '> 80%'
                    }
                ]
            },
            {
                id: 'OCC-2026-002',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                severity: 'Major',
                summary: 'Partial Sequence: High Drops',
                outcomes: ['Packet Loss'],
                metricData: generateCongestionData('Med', 2),
                events: [
                    {
                        id: 'E-2605012', timestamp: new Date(Date.now() - 86400000 - 1200000).toISOString(),
                        title: 'Buffer Overflow', subtitle: 'Queue Exhausted', severity: 'Major',
                        nodeName: 'R1-Edge-01', nodeIp: '10.0.4.203', resource: 'Gi1/0/1',
                        alertValue: '1450', threshold: '> 1000'
                    }
                ]
            },
            {
                id: 'OCC-2026-003',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                severity: 'Critical',
                summary: 'DC Backbone Flap Sequence',
                outcomes: ['Packet Loss', 'Interface Flap'],
                metricData: generateCongestionData('High', 3),
                events: [
                    {
                        id: 'E-2605013', timestamp: new Date(Date.now() - 172800000 - 300000).toISOString(),
                        title: 'Interface Reset', subtitle: 'Flap Detected', severity: 'Critical',
                        nodeName: 'R2-Core', nodeIp: '10.0.1.1', resource: 'Te0/1/1',
                        alertValue: 'Down', threshold: 'State'
                    }
                ]
            },
            ...generateOccurrences('Flap', 15, 'Critical', generateCongestionData('High', 1.1))
        ],
        simulationType: 'congestion'
    },
    {
        id: 'P-CPU-01',
        name: 'CPU Exhaustion Chain',
        description: 'R1:CPU Util | Sw1:CRC Errors | Sw2:Buffer Util | Fw1:Latency',
        confidence: 0.89,
        seenCount: 34,
        lastSeen: '45 mins ago',
        domain: 'Data Center',
        appliesTo: ['Core Routers', 'Firewalls'],
        status: 'Enabled',
        severity: 'Critical',
        ruleCreationDate: 'Mar 12, 2025',
        tags: ['Compute', 'Latency', 'Cascading Failure'],
        steps: [
            { id: 'S1', name: 'R1:CPU Util', description: '20% -> 98%', icon: Cpu, delay: '0s' },
            { id: 'S2', name: 'Sw1:CRC Errors', description: 'Rising CRC rate', icon: Activity, delay: '+45s' },
            { id: 'S3', name: 'Sw2:Buffer Util', description: 'Backlog in Sw2', icon: Database, delay: '+2m' },
            { id: 'S4', name: 'Fw1:Latency', description: 'Critical latency threshold breach', icon: Clock, delay: 'Final' }
        ],
        logicSummary: 'Resource Starvation Propagation:',
        logicSteps: [
            { order: 1, title: 'Control Plane Stress', description: 'R1:CPU Util', color: 'blue' },
            { order: 2, title: 'Interconnect Errors', description: 'Sw1:CRC Errors', color: 'amber' },
            { order: 3, title: 'Switch Congestion', description: 'Sw2:Buffer Util', color: 'amber' },
            { order: 4, title: 'Service Slowdown', description: 'Fw1:Latency', color: 'red' }
        ],
        predictedEvents: [
            { name: 'Latency', probability: 0.94, severity: 'Major', title: 'Predicted Latency Spike', subtitle: 'Service degradation likely' }
        ],
        drillDownMetrics: [
            { label: 'CPU Util', value: 'Sustained > 95% in DC East', icon: 'trending', color: 'blue' },
            { label: 'CRC Errors', value: 'High rate on Sw1 backplane', icon: 'alert', color: 'amber' },
            { label: 'Buffer Util', value: 'Sw2 saturation observed', icon: 'database', color: 'red' }
        ],
        occurrences: [
            {
                id: 'OCC-CPU-01',
                timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
                severity: 'Critical',
                summary: 'DC East Cascading Latency Spike',
                outcomes: ['High Latency', 'Packet Retries'],
                metricData: generateCpuSaturation(1),
                events: [
                    {
                        id: 'E-C-01', timestamp: new Date(Date.now() - 3600000 * 2 - 600000).toISOString(),
                        title: 'CPU Critical', subtitle: 'Process Starvation', severity: 'Critical',
                        nodeName: 'R1-DC-East', nodeIp: '10.50.1.1', resource: 'ControlPlane',
                        alertValue: '98%', threshold: '> 90%'
                    }
                ]
            },
            {
                id: 'OCC-CPU-02',
                timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
                severity: 'Major',
                summary: 'Mid-night Sync CPU Spike',
                outcomes: ['High Latency'],
                metricData: generateCpuSaturation(2),
                events: [
                    {
                        id: 'E-C-02', timestamp: new Date(Date.now() - 3600000 * 12 - 300000).toISOString(),
                        title: 'CPU Warning', subtitle: 'Batch Process High', severity: 'Warning',
                        nodeName: 'R1-DC-East', nodeIp: '10.50.1.1', resource: 'Management',
                        alertValue: '88%', threshold: '> 85%'
                    }
                ]
            },
            {
                id: 'OCC-CPU-03',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                severity: 'Critical',
                summary: 'BGP Table Recalculation Surge',
                outcomes: ['High Latency', 'BGP Flap'],
                metricData: generateCpuSaturation(3),
                events: [
                    {
                        id: 'E-C-03', timestamp: new Date(Date.now() - 172800000 - 900000).toISOString(),
                        title: 'CPU Lock', subtitle: 'BGP Scanner High', severity: 'Critical',
                        nodeName: 'R1-DC-East', nodeIp: '10.50.1.1', resource: 'Routing',
                        alertValue: '100%', threshold: '> 95%'
                    }
                ]
            },
            ...generateOccurrences('CPU', 12, 'Major', generateCpuSaturation(1.1))
        ],
        simulationType: 'device_cpu_saturation'
    },
    {
        id: 'P-DIS-01',
        name: 'Congestion Discard Chain',
        description: 'R1:Buffer Util | Sw1:CRC Errors | Sw2:Latency | Fw1:Packet Drop',
        confidence: 0.87,
        seenCount: 52,
        lastSeen: '1 hour ago',
        domain: 'Network',
        appliesTo: ['Switches', 'Firewalls'],
        status: 'Enabled',
        severity: 'Major',
        ruleCreationDate: 'Feb 10, 2025',
        tags: ['Congestion', 'Packet Loss', 'Queue'],
        steps: [
            { id: 'S1', name: 'R1:Buffer Util', description: 'Buffer Util > 1200', icon: Database, delay: '0s' },
            { id: 'S2', name: 'Sw1:CRC Errors', description: 'Rising input errors', icon: Activity, delay: '+1m' },
            { id: 'S3', name: 'Sw2:Latency', description: 'Jitter > 50ms', icon: Clock, delay: '+2m' },
            { id: 'S4', name: 'Fw1:Packet Drop', description: 'Terminal egress discard', icon: AlertTriangle, delay: 'Final' }
        ],
        logicSummary: 'Queue-induced Decay Sequence:',
        logicSteps: [
            { order: 1, title: 'Upstream Backlog', description: 'R1:Buffer Util', color: 'blue' },
            { order: 2, title: 'Inter-site Fluctuations', description: 'Sw1:CRC Errors', color: 'amber' },
            { order: 3, title: 'Transit Delay', description: 'Sw2:Latency', color: 'amber' },
            { order: 4, title: 'Ingress Discards', description: 'Fw1:Packet Drop', color: 'red' }
        ],
        predictedEvents: [
            { name: 'Packet Drop', probability: 0.91, severity: 'Major', title: 'Data Loss Expected', subtitle: 'TCP throttled' }
        ],
        drillDownMetrics: [
            { label: 'Buffer Util', value: 'R1 overflowing on 10G link', icon: 'database', color: 'blue' },
            { label: 'Latency', value: 'Sw2 transit jitter > 80ms', icon: 'trending', color: 'amber' },
            { label: 'CRC Errors', value: 'FCS failures appearing', icon: 'alert', color: 'red' }
        ],
        occurrences: [
            {
                id: 'OCC-DIS-01',
                timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
                severity: 'Major',
                summary: 'Regional Traffic Spike Congestion',
                outcomes: ['Packet Drop', 'Latency Spike'],
                metricData: generateCongestionData('High', 2),
                events: [
                    {
                        id: 'E-D-01', timestamp: new Date(Date.now() - 3600000 * 5 - 300000).toISOString(),
                        title: 'Buffer Util', subtitle: 'R1 Output Drops', severity: 'Major',
                        nodeName: 'R1-DC-East', nodeIp: '10.50.1.1', resource: 'Gi0/1',
                        alertValue: '1250', threshold: '> 1000'
                    }
                ]
            },
            {
                id: 'OCC-DIS-02',
                timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
                severity: 'Major',
                summary: 'Inter-DC Replication Burst',
                outcomes: ['Packet Drop'],
                metricData: generateCongestionData('High', 4),
                events: [
                    {
                        id: 'E-D-02', timestamp: new Date(Date.now() - 86400000 * 3 - 600000).toISOString(),
                        title: 'CRC Spike', subtitle: 'Physical error burst', severity: 'Major',
                        nodeName: 'Sw1-Fabric', nodeIp: '10.50.2.1', resource: 'HundredGi1/0/1',
                        alertValue: '85/sec', threshold: '> 10/sec'
                    }
                ]
            },
            {
                id: 'OCC-DIS-03',
                timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
                severity: 'Critical',
                summary: 'Micro-burst Congestion Chain',
                outcomes: ['Packet Drop', 'Voice Lag'],
                metricData: generateCongestionData('High', 6),
                events: [
                    {
                        id: 'E-D-03', timestamp: new Date(Date.now() - 86400000 * 5 - 1200000).toISOString(),
                        title: 'Latency Trigger', subtitle: 'Real-time delay major', severity: 'Critical',
                        nodeName: 'Fw1-Edge', nodeIp: '10.50.0.1', resource: 'External',
                        alertValue: '150ms', threshold: '> 50ms'
                    }
                ]
            },
            ...generateOccurrences('Discard', 11, 'Major', generateCongestionData('High', 1.0))
        ],
        simulationType: 'congestion'
    },
    {
        id: 'P-CFG-01',
        name: 'Configuration Drift Chain',
        description: 'R2:Config Change | R2:Peer Down | Sw1:CRC Errors | Fw1:Latency',
        confidence: 0.85,
        seenCount: 18,
        lastSeen: 'Yesterday',
        domain: 'Data Center',
        appliesTo: ['BGP Peers', 'Core Switches'],
        status: 'Learning',
        severity: 'Critical',
        ruleCreationDate: 'Jan 28, 2025',
        tags: ['Config Drift', 'BGP', 'Control Plane'],
        steps: [
            { id: 'S1', name: 'R2:Config Change', description: 'MTU/Interface update', icon: Grid, delay: '0s' },
            { id: 'S2', name: 'R2:Peer Down', description: 'BGP Protocol timeout', icon: Zap, delay: '+5s' },
            { id: 'S3', name: 'Sw1:CRC Errors', description: 'PFE misconfig signals', icon: Activity, delay: '+1m' },
            { id: 'S4', name: 'Fw1:Latency', description: 'Network re-convergence delay', icon: Clock, delay: 'Final' }
        ],
        logicSummary: 'Operational Drift Impact:',
        logicSteps: [
            { order: 1, title: 'Ad-hoc Modifier', description: 'R2:Config Change', color: 'blue' },
            { order: 2, title: 'Connectivity Break', description: 'R2:Peer Down', color: 'red' },
            { order: 3, title: 'Platform Instability', description: 'Sw1:CRC Errors', color: 'amber' },
            { order: 4, title: 'User Experience Drop', description: 'Fw1:Latency', color: 'red' }
        ],
        predictedEvents: [
            { name: 'High Latency', probability: 0.88, severity: 'Major', title: 'Slow Convergence', subtitle: 'Peers flapping' },
            { name: 'BGP Down', probability: 0.75, severity: 'Critical', title: 'Neighbor Isolation', subtitle: 'Routing table purged' }
        ],
        drillDownMetrics: [
            { label: 'Config Changes', value: '5 changes in last 24h', icon: 'alert', color: 'blue' },
            { label: 'Peer Status', value: 'Established -> Connect', icon: 'trending', color: 'red' },
            { label: 'CRC Errors', value: 'L2 Mismatch Detected', icon: 'database', color: 'amber' }
        ],
        occurrences: [
            {
                id: 'OCC-CFG-01',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                severity: 'Critical',
                summary: 'Unplanned MTU Change Outage',
                outcomes: ['Peer Down', 'High Latency'],
                metricData: generateCpuData(85, 4),
                events: [
                    {
                        id: 'E-CF-01', timestamp: new Date(Date.now() - 86400000 - 300000).toISOString(),
                        title: 'Config Change', subtitle: 'Admin "MTU" update', severity: 'Warning',
                        nodeName: 'R2-West', nodeIp: '10.20.1.5', resource: 'Gi1/0/2',
                        alertValue: '9000', threshold: 'Mismatch'
                    }
                ]
            },
            ...generateOccurrences('Config Drift', 13, 'Major', generateCpuSaturation(1.0))
        ],
        simulationType: 'cpu_spike'
    }
];
