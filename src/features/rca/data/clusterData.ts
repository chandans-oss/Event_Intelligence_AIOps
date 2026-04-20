// Cluster-specific RCA, Impact, and Remediation data
// Each cluster has unique data for RCA process steps, evidence, impact topology, and remediation

export interface RCAProcessStep {
    id: string;
    name: string;
    description: string;
    status: 'complete' | 'active' | 'pending';
    details: {
        input?: string[];
        processing?: string;
        output?: string;
        duration?: string;
        rawInput?: string;
        rawOutput?: string;
        metadata?: Record<string, string | string[]>;
        bulletPoints?: string[];
        sections?: Array<{
            title: string;
            type: 'text' | 'list' | 'kv' | 'table' | 'scored-list';
            content: any;
            columns?: Array<{ key: string; label: string; align?: 'left' | 'right' }>;
        }>;
    };
}

export interface DataEvidence {
    source: string;
    type: 'Metrics' | 'Logs' | 'Events' | 'Topology' | 'Config' | 'Traces';
    count: number;
    samples: string[];
    relevance: number;
}

export interface ImpactedAsset {
    id: string;
    name: string;
    type: string;
    severity: 'Critical' | 'Major' | 'Minor' | 'Low';
    status: string;
    dependencies: string[];
}

export interface RemediationStep {
    id: string;
    phase: 'Immediate' | 'Temporary' | 'Long-term';
    action: string;
    description: string;
    status: 'complete' | 'in_progress' | 'pending' | 'failed';
    duration: string;
    automated: boolean;
    command?: string;
    verification?: string[];
}

export interface ClusterSpecificData {
    clusterId: string;
    rcaMetadata: {
        rootEventId: string;
        rootEventType: string;
        timestamp: string;
        device: string;
        severity: string;
    };
    rcaSummary: string;
    rootCause: string;
    confidence: number;
    remedyTitle?: string;
    rcaProcessSteps: RCAProcessStep[];
    dataEvidence: DataEvidence[];
    correlatedChildEvents: Array<{
        id: string;
        alertType: string;
        source: string;
        severity: string;
        timestamp: string;
        correlationScore: number;
        correlationReason: string;
        message?: string;
    }>;
    impactedAssets: ImpactedAsset[];
    impactTopology: {
        nodes: Array<{ id: string; label: string; type: string; status: string; severity?: string }>;
        edges: Array<{ from: string; to: string; type: string; status?: string }>;
    };
    remediationSteps: RemediationStep[];
    remediationKB: Array<{ title: string; relevance: number; url: string }>;
}

// ============================================================================
// HELPER: Generate High-Fidelity 8-Step RCA Trace (matching user image)
// ============================================================================
const generateRCASteps = (id: string, type: string, device: string): RCAProcessStep[] => {
    const intent = `availability.${type.toLowerCase().replace(/_/g, '.')}`;
    const hypothesis = `H_${type}`;

    // Use-case specific content
    let proc_orchestration = `Created investigation goal: Determine cause of ${type.replace(/_/g, ' ')} on ${device}. Initializing diagnostic agents.`;
    let bullet_orchestration = [
        'Contextual entity lookup from CMDB',
        'Analytical goal generation based on incident severity',
        'Diagnostic agent swarm initialization'
    ];

    if (type.includes('MEMORY')) {
        proc_orchestration = `Initializing Memory diagnostic agents for ${device}. Analyzing heap residency and GC logs.`;
    } else if (type.includes('DISK') || type.includes('STORAGE')) {
        proc_orchestration = `Initializing Storage diagnostic agents. Scanning mount points and file indices on ${device}.`;
    } else if (type.includes('NETWORK') || type.includes('LINK')) {
        proc_orchestration = `Initializing Network Topology agents. Analyzing traffic flows and interface performance.`;
    } else if (type.includes('SSL')) {
        proc_orchestration = `Checking certificate chain and OCSP status for ${device}.`;
    }

    const matchedConfidence = type.includes('SSL') ? '98.5%' : type.includes('DISK') ? '94.2%' : '91.2%';

    return [
        {
            id: 'orchestration',
            name: 'Orchestration',
            description: 'Incident & Goal creation for investigation',
            status: 'complete',
            details: {
                input: ['Correlated incident group', 'Entity lookup'],
                processing: proc_orchestration,
                output: 'Investigation workflow bootstrapped.',
                duration: '1.2s',
                bulletPoints: bullet_orchestration,
                metadata: {
                    'Goal Status': 'Initialized',
                    'Orchestrator': 'AgenticFlow-V3',
                    'Assigned Workers': '3 Diagnostic Agents',
                    'Trigger Event': type
                },
                rawOutput: `{"status": "initialized", "signals": {"${device}": {"state": "investigating"}}}`
            },
        },
        {
            id: 'intent-routing',
            name: 'Intent Routing',
            description: 'Mapping failure to specific diagnostic intent',
            status: 'complete',
            details: {
                input: ['Orchestration context', 'Intent Knowledge Base'],
                processing: `Matched signature for ${type.toLowerCase()}. Statistical confidence: ${matchedConfidence}`,
                output: intent,
                duration: '0.8s',
                metadata: {
                    'Matched Intent': intent,
                    'Sub-intent': type.split('_').pop()?.toLowerCase() || 'failure',
                    'Confidence': matchedConfidence,
                    'KB Version': '2.4.1'
                }
            },
        },
        {
            id: 'hypothesis-scorer',
            name: 'Hypotheses Scorer',
            description: 'Ranking potential root cause hypotheses',
            status: 'complete',
            details: {
                input: [`Intent: ${intent}`, 'Device status'],
                processing: `Scoring H_${type}_PHYSICAL, H_${type}_CONFIG, H_EXTERNAL. Checking signal stability.`,
                output: hypothesis,
                duration: '2.5s',
                metadata: {
                    'Top Hypothesis': hypothesis,
                    'Lead Evidence': type.includes('SSL') ? 'Expiry Alert' : 'Signal Anomaly Detected',
                    'Rejection Reason': 'H_EXTERNAL lack of correlation',
                    'Sample Count': '128 signals'
                }
            },
        },
        {
            id: 'situation-builder',
            name: 'Situation Builder',
            description: 'Generating human-centric situation card',
            status: 'complete',
            details: {
                input: ['Scored hypotheses', 'Blast radius estimate'],
                processing: 'Applying LLM prompt template for situation generation.',
                output: `SIT-${id.split('-').pop()}`,
                duration: '1.5s',
                metadata: {
                    'Situation Summary': `Critical ${type.replace(/_/g, ' ')} on ${device} impacting downstream services.`,
                    'Blast Radius': 'Confirmed',
                    'Impact Score': '8.5/10'
                }
            },
        },
        {
            id: 'data-correlator',
            name: 'Historical Data Retriever',
            description: 'Semantic match against historical incident database',
            status: 'complete',
            details: {
                input: ['Investigation results', 'Historical Vector Store'],
                processing: `Scanning previous ${type.replace(/_/g, ' ')} cases in this region.`,
                output: type.includes('DISK') ? 'Found identical case in STG-002' : 'Found 2 historical matches.',
                duration: '1.8s',
                metadata: {
                    'Matched Cases': type.includes('DISK') ? '1' : '2',
                    'Top Similarity': '0.88',
                    'Recommended Action': 'Contextual Playbook'
                }
            },
        },
        {
            id: 'rca-engine',
            name: 'RCA Correlator Engine',
            description: 'Final multi-modal synthesis of root cause evidence',
            status: 'complete',
            details: {
                input: ['All evidence stages', 'Correlation results'],
                processing: 'Correlator LLM synthesis completed.',
                output: 'Final RCA confirmed.',
                duration: '3.1s',
                metadata: {
                    'Final RCA': `${type.replace(/_/g, ' ')} on ${device}`,
                    'Root Cause Category': type.includes('SSL') || type.includes('DISK') ? 'Process Failure' : 'Resource Exhaustion',
                    'Evidence Strength': 'High'
                }
            },
        },
    ]
};

const generateRemediationSteps = (id: string, type: string, device: string): RemediationStep[] => [
    { id: `REM-${id}-01`, phase: 'Immediate', action: 'Validate Signal Drift', description: `Running health checks on ${device} to confirm ${type.toLowerCase()} error codes and current health state.`, status: 'complete', duration: '30s', automated: true, command: `show ${type.toLowerCase()} diag`, verification: ['Exit code 0', 'Signal stability > 90%'] },
    { id: `REM-${id}-02`, phase: 'Immediate', action: 'Isolate Impacted Segment', description: 'Applying temporary traffic micro-segmentation to prevent lateral impact propagation.', status: 'pending', duration: '1m', automated: true, command: 'microseg --isolate --source ' + device, verification: ['VLAN isolation confirmed', 'Packet flow sanitized'] },
    { id: `REM-${id}-03`, phase: 'Temporary', action: 'Execute Adaptive Payload', description: `Applying remediation payload tailored for ${type.replace(/_/g, ' ')}.`, status: 'pending', duration: '3m', automated: true, command: `./apply_fix.sh --incident ${id} --target ${device}`, verification: ['Target health restored', 'Latency < 50ms'] },
    { id: `REM-${id}-04`, phase: 'Temporary', action: 'Post-Execution Verification', description: 'Running end-to-end synthetic transactions to verify full path restoration.', status: 'pending', duration: '2m', automated: true, command: 'synthetic_probe --target ' + device, verification: ['SLA compliance 100%', 'No retries detected'] },
    { id: `REM-${id}-05`, phase: 'Long-term', action: 'Policy Configuration Update', description: 'Generating permanent configuration change request for the NOC management office.', status: 'pending', duration: '5m', automated: false, verification: ['PR submitted', 'Admin approval pending'] },
    { id: `REM-${id}-06`, phase: 'Long-term', action: 'Close-Loop Lifecycle Update', description: 'Recording lifecycle event in the global incident knowledge base for future training.', status: 'pending', duration: '1m', automated: true, command: 'kb_client upload --case ' + id, verification: ['KB entry created', 'Vector store updated'] }
];

const createPlaceholderData = (id: string, type: string, device: string, summary?: string, remedyTitle?: string): ClusterSpecificData => ({
    clusterId: id,
    rcaMetadata: { rootEventId: `evt_${id}`, rootEventType: type, timestamp: new Date(Date.now() - 300000).toISOString(), device, severity: 'Critical' },
    rcaSummary: summary || `System analysis for ${type} on ${device}. High-confidence correlation indicates persistent module failure causing downstream service degradation.`,
    rootCause: `${type.replace(/_/g, ' ')}: System degradation on ${device}`,
    confidence: 0.88,
    remedyTitle: remedyTitle || `Remediate ${type.replace(/_/g, ' ')}`,
    rcaProcessSteps: generateRCASteps(id, type, device),
    dataEvidence: [
        { source: 'System Logs', type: 'Logs', count: 42, samples: [`${device}: ${type} threshold exceeded`, `${device}: Critical hardware interrupt`, `${device}: Neighbor loss detected`], relevance: 98 },
        { source: 'Interface Stats', type: 'Metrics', count: 120, samples: ['error_count: 500/min', 'discard_rate: 12%', 'utilization: 98%'], relevance: 85 },
        { source: 'Chassis Telemetry', type: 'Metrics', count: 25, samples: ['Internal temp: 45C', 'CPU: 88%', 'Buffer usage: 92%'], relevance: 90 }
    ],
    correlatedChildEvents: [
        { id: `EVT-${id}-CH-01`, alertType: 'INTERFACE_UP_DOWN', source: device, severity: 'Major', timestamp: new Date(Date.now() - 240000).toISOString(), correlationScore: 0.96, correlationReason: 'Temporal Correlation: Events within time window', message: `Interface Gi0/1 on ${device} is flapping` },
        { id: `EVT-${id}-CH-02`, alertType: 'BGP_ADJACENCY_CHANGE', source: device, severity: 'Critical', timestamp: new Date(Date.now() - 180000).toISOString(), correlationScore: 0.89, correlationReason: 'Topological Correlation: Upstream dominates downstream', message: 'BGP session lost with peer 10.1.1.2' }
    ],
    impactedAssets: [
        { id: 'auth-service', name: 'Auth Service', type: 'Microservice', severity: 'Critical', status: 'Degraded', dependencies: [device] },
        { id: 'pay-service', name: 'Payment Service', type: 'Microservice', severity: 'Major', status: 'Slow', dependencies: ['auth-service'] }
    ],
    impactTopology: {
        nodes: [
            { id: device, label: device, type: 'device', status: 'critical', severity: 'Critical' },
            { id: 'switch-agg-01', label: 'Agg Switch 01', type: 'device', status: 'warning', severity: 'Major' },
            { id: 'auth-service', label: 'Auth Service', type: 'service', status: 'critical', severity: 'Critical' },
            { id: 'pay-service', label: 'Payment Service', type: 'service', status: 'warning', severity: 'Major' },
            { id: 'end-users', label: 'End Users', type: 'user', status: 'critical', severity: 'Critical' }
        ],
        edges: [
            { from: device, to: 'switch-agg-01', type: 'connection' },
            { from: 'switch-agg-01', to: 'auth-service', type: 'dependency' },
            { from: 'auth-service', to: 'pay-service', type: 'dependency' },
            { from: 'pay-service', to: 'end-users', type: 'impact' }
        ]
    },
    remediationSteps: generateRemediationSteps(id, type, device),
    remediationKB: [
        { title: `${type} Troubleshooting Guide`, relevance: 95, url: `/kb/${type.toLowerCase()}-guide` },
        { title: 'Standard Service Recovery PR #452', relevance: 88, url: '#' }
    ],
});

// ============================================================================
// SPECIFIC DETAILED MOCK DATA (Top Use Cases)
// ============================================================================

// CLU-LC-001: Link Congestion (The Master Sample)
export const CLU_LC_001_Data: ClusterSpecificData = {
    clusterId: 'CLU-LC-001',
    rcaMetadata: { rootEventId: 'EVT-LC-010', rootEventType: 'LINK_CONGESTION', timestamp: new Date(Date.now() - 3600000).toISOString(), device: 'core-router-dc1', severity: 'Critical' },
    remedyTitle: 'Reconfigure and Stabilize DNS Resolution',
    rcaSummary: 'Unscheduled NFS backup from agent-server-01 is consuming >35% link capacity on Gi0/1/0, causing queue drops and latency spikes during business hours.',
    rootCause: 'Backup-Induced Congestion: Unscheduled NFS traffic',
    confidence: 0.93,
    rcaProcessSteps: [
        {
            id: 'orchestration',
            name: 'Orchestration',
            description: 'Incident & Goal creation',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: "Incident Details",
                        type: "kv",
                        content: {
                            "Incident ID": "ALARM-12345",
                            "Device": "core-router-dc1",
                            "Interface": "N/A",
                            "Correlation Window": `Last 15 min from ${new Date(Date.now() - 3600000).toISOString()}`,
                            "Initial Severity": "Critical"
                        }
                    },
                    {
                        title: "Trigger Event",
                        type: "text",
                        content: "High interface utilization detected on Gi0/0/0"
                    },
                    {
                        title: "Goal",
                        type: "text",
                        content: "Investigate interface Gi0/1/0 utilization exceeding 95% on core-router-dc1 possibly related to traffic overloading due to backup job activity."
                    },
                    {
                        title: "Logs and Traps",
                        type: "list",
                        content: [
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:20:00Z | Message: Backup job started on agent-server-01 and tail drop observed",
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:21:30Z | Message: Interface Gi0/1/0 output queue full",
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:25:00Z | Message: CPU utilization crossed 85% threshold",
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:28:00Z | Message: Interface Gi0/1/1 line status: up, duplex: full, speed: 1Gbps",
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:30:00Z | Message: Normal packet forwarding observed on Gi0/1/1"
                        ]
                    },
                    {
                        title: "Key Performance Indicators (KPIs)",
                        type: "table",
                        columns: [{ key: "metric", label: "Metric" }, { key: "value", label: "Value", align: "right" }],
                        content: [
                            { metric: "CPU Utilization", value: "85.0%" },
                            { metric: "Memory Utilization", value: "75.0%" },
                            { metric: "Device Temperature", value: "45.0 °C" },
                            { metric: "Avail_percent", value: "100.0" },
                            { metric: "Bandwidth Utilization", value: "98.0%" },
                            { metric: "Input Errors", value: "20.0 pkts" },
                            { metric: "Output Errors", value: "500.0 pkts" },
                            { metric: "Latency", value: "400.0 ms" },
                            { metric: "Packet Loss", value: "1.2%" },
                            { metric: "DSCP Traffic", value: "78.0%" }
                        ]
                    }
                ]
            }
        },
        {
            id: 'intent-routing',
            name: 'Intent Routing',
            description: 'Identify Intent',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: "Selected Intent",
                        type: "text",
                        content: "performance.congestion"
                    },
                    {
                        title: "Intent Status",
                        type: "kv",
                        content: {
                            "Score": "1.0",
                            "Match Strength": "Strong Match"
                        }
                    },
                    {
                        title: "Top 3 Intents",
                        type: "scored-list",
                        content: [
                            { label: "performance.congestion", score: 100, displayScore: "1.0" },
                            { label: "system.cpu_high", score: 80, displayScore: "0.8" },
                            { label: "link.high_errors", score: 30, displayScore: "0.3" }
                        ]
                    },
                    {
                        title: "Key Matches",
                        type: "kv",
                        content: {
                            "Signal Matches": "utilization_percent > 90 (0.9), out_discards > 0 (0.8)",
                            "Log Matches": "tail drop, backup"
                        }
                    }
                ]
            }
        },
        {
            id: 'hypothesis-scorer',
            name: 'Hypotheses Scorer',
            description: 'Identify possible hypothesis',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: "Selected Intent",
                        type: "text",
                        content: "performance"
                    },
                    {
                        title: "Top Hypothesis",
                        type: "text",
                        content: "QOS_CONGESTION - High utilization and queue discards (score: 1.00)"
                    },
                    {
                        title: "Hypothesis Scores",
                        type: "scored-list",
                        content: [
                            { label: "H_QOS_CONGESTION", score: 100, displayScore: "1.0" },
                            { label: "H_BACKUP_TRAFFIC", score: 100, displayScore: "1.1" },
                            { label: "H_PEAK_TRAFFIC", score: 40, displayScore: "0.4" }
                        ]
                    },
                    {
                        title: "Log Evidence",
                        type: "list",
                        content: [
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:20:00Z | Message: Backup job started on agent-server-01 and tail drop observed",
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:25:00Z | Message: Interface Gi0/1/0 output queue full",
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:20:00Z | Message: Backup job started on agent-server-01 and tail drop observed",
                            "Device: core-router-dc1 | Timestamp: 2025-10-28T14:21:30Z | Message: Backup traffic detected on Gi0/1/0 (source: agent-server-01)"
                        ]
                    }
                ]
            }
        },
        {
            id: 'situation-builder',
            name: 'Situation Builder',
            description: 'Create Situation Card',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: "Situation ID",
                        type: "text",
                        content: "INFRAON-ALARM-12345"
                    },
                    {
                        title: "Summary",
                        type: "text",
                        content: "Interface Gi0/1/0 at 96.0% utilization with 500 queue drops. Top hypothesis: QOS_CONGESTION (Score: 1.0)."
                    },
                    {
                        title: "Input Data Summary",
                        type: "kv",
                        content: {
                            "Device": "core-router-dc1",
                            "Resource": "Gi0/1/0",
                            "Type": "interface",
                            "Logs": "High interface utilization detected, Backup job started..."
                        }
                    },
                    {
                        title: "Action Taken",
                        type: "text",
                        content: "Situation dumped into Vector DB"
                    }
                ]
            }
        },
        {
            id: 'data-correlator',
            name: 'Historical Data Retriever',
            description: 'Semantic match against historical data',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: "Correlation Results",
                        type: "kv",
                        content: {
                            "Historical Matches": "2 similar cases found",
                            "Top Similarity Score": "0.88",
                            "Confidence": "High"
                        }
                    },
                    {
                        title: "Correlated Incidents (Historical KB)",
                        type: "table",
                        columns: [{ key: "id", label: "Incident ID" }, { key: "cause", label: "Root Cause" }, { key: "match", label: "Match %", align: "right" }, { key: "res", label: "Resolution" }],
                        content: [
                            { id: "INC-2026-001", cause: "Backup Traffic Congestion", match: "88%", res: "Apply QoS Policy" },
                            { id: "INC-2026-899", cause: "Unscheduled Data Transfer", match: "72%", res: "Reschedule Job" }
                        ]
                    }
                ]
            }
        },
        {
            id: 'rca-correlator',
            name: 'RCA Correlator Engine',
            description: 'Final multi-modal synthesis',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: "Final Determination",
                        type: "text",
                        content: "Root cause: QOS_CONGESTION from unscheduled backup traffic on Gi0/1/0."
                    },
                    {
                        title: "Evidence Synthesis",
                        type: "kv",
                        content: {
                            "Primary Signal": "Bandwidth Utilization > 95%",
                            "Confirming Log": "Backup job started",
                            "Negative Evidence": "No physical layer errors observed"
                        }
                    },
                    {
                        title: "Recommended Action",
                        type: "text",
                        content: "Implement QoS throttling for backup traffic and reschedule job to maintenance window."
                    }
                ]
            }
        }
    ],
    dataEvidence: [
        { source: 'NetFlow', type: 'Metrics', count: 450, samples: ['DSCP: 0, 76% share', 'Source: agent-server-01', 'Destination: backup-node-dc2'], relevance: 98 },
        { source: 'SNMP', type: 'Metrics', count: 12, samples: ['ifOutDiscards: 542', 'ifUtil: 96%', 'ifErrors: 8'], relevance: 92 },
        { source: 'Interface Logs', type: 'Logs', count: 5, samples: ['Gi0/1/0: Queue full - tail drops active', 'Gi0/1/0: High buffer utilization'], relevance: 88 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-LC-002', alertType: 'QUEUE_DROP', source: 'core-router-dc1', severity: 'Critical', timestamp: new Date(Date.now() - 3595000).toISOString(), correlationScore: 0.96, correlationReason: 'Spatial Correlation: Co-located on core-router-dc1', message: 'Output queue drops on Gi0/1/0' },
        { id: 'EVT-LC-003', alertType: 'LATENCY_HIGH', source: 'edge-router-03', severity: 'Major', timestamp: new Date(Date.now() - 3588000).toISOString(), correlationScore: 0.92, correlationReason: 'Topological Correlation: Downstream of core-router-dc1', message: 'RTT increased to 150ms' },
        { id: 'EVT-LC-004', alertType: 'LATENCY_HIGH', source: 'edge-router-04', severity: 'Major', timestamp: new Date(Date.now() - 3585000).toISOString(), correlationScore: 0.91, correlationReason: 'Topological Correlation: Downstream of core-router-dc1', message: 'RTT increased to 145ms' },
        { id: 'EVT-LC-005', alertType: 'RESPONSE_TIME_HIGH', source: 'api-gw', severity: 'Critical', timestamp: new Date(Date.now() - 3575000).toISOString(), correlationScore: 0.89, correlationReason: 'Causal Correlation: Latency affecting App Response', message: 'HTTP 503 errors and high TTFB' }
    ],
    impactedAssets: [
        { id: 'api-gw', name: 'API Gateway', type: 'Service', severity: 'Critical', status: 'Slow', dependencies: ['core-router-dc1'] },
        { id: 'web-front', name: 'Web Front-end', type: 'Service', severity: 'Major', status: 'Degraded', dependencies: ['api-gw'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-router-dc1', label: 'Core Router DC1', type: 'device', status: 'critical', severity: 'Critical' },
            { id: 'api-gw', label: 'API Gateway', type: 'service', status: 'warning', severity: 'Major' },
            { id: 'web-front', label: 'Web UI', type: 'service', status: 'warning', severity: 'Major' },
            { id: 'customers', label: 'Enterprise Users', type: 'user', status: 'critical', severity: 'Critical' }
        ],
        edges: [
            { from: 'core-router-dc1', to: 'api-gw', type: 'dependency' },
            { from: 'api-gw', to: 'web-front', type: 'dependency' },
            { from: 'web-front', to: 'customers', type: 'impact' }
        ]
    },
    remediationSteps: [
        { id: 'REM-LC-01', phase: 'Immediate', action: 'Verify Backup Flows', description: 'Identifying source IP and destination for the unscheduled NFS transfer.', status: 'complete', duration: '45s', automated: true, command: 'show ip flow top-talkers', verification: ['Talker identified: 10.0.1.5'] },
        { id: 'REM-LC-02', phase: 'Immediate', action: 'Apply QoS Policy', description: 'Enable traffic shaping on Gi0/1/0 to prioritize business traffic.', status: 'pending', duration: '2m', automated: true, command: 'policy-map SHAPE_BACKUP; class BACKUP; shape average 100m', verification: ['Policy applied', 'Queue drops: 0'] },
        { id: 'REM-LC-03', phase: 'Temporary', action: 'Redirect Traffic', description: 'Rerouting secondary backup streams to the OOB management network.', status: 'pending', duration: '3m', automated: true, command: 'ip route 10.50.0.0 255.255.0.0 Gi0/9', verification: ['Route active', 'Management link load: 15%'] },
        { id: 'REM-LC-04', phase: 'Temporary', action: 'Alert Backup Owner', description: 'Automated notification to the storage team regarding SLA violation.', status: 'pending', duration: '1m', automated: true, command: 'send_webhook --team storage --msg "Backup blocked"', verification: ['Webhook 202 OK'] },
        { id: 'REM-LC-05', phase: 'Long-term', action: 'Schedule Adjustment', description: 'Modify cron jobs for agent-server-01 to midnight window.', status: 'pending', duration: '1h', automated: false, verification: ['Crontab updated'] },
        { id: 'REM-LC-06', phase: 'Long-term', action: 'Policy Hardening', description: 'Implement permanent rate-limiting for NFS traffic on core interfaces.', status: 'pending', duration: '10m', automated: true, command: 'conf t; interface Gi0/1/0; service-policy input HARDEN_CORE', verification: ['Policy committed'] }
    ],
    remediationKB: [
        { title: 'Link Congestion Remediation', relevance: 98, url: '#' },
        { title: 'QoS Best Practices DC1', relevance: 92, url: '#' },
        { title: 'NFS Performance Tuning', relevance: 85, url: '#' }
    ],
};

// RCA-LC-001-A: Backup-Induced Congestion (Main cause - 95% confidence)
export const RCA_LC_001_A_Data: ClusterSpecificData = {
    ...CLU_LC_001_Data,
    clusterId: 'RCA-LC-001-A',
    rcaSummary: 'Unscheduled NFS backup consuming >35% capacity on Gi0/1/0. NetFlow confirms server 10.0.1.5 as the source, causing queue saturation and 400ms latency spikes.',
    rootCause: 'Backup-Induced Network Congestion',
    confidence: 0.95,
    remedyTitle: 'Implement QoS Policy and Reschedule Backup Jobs',
};

// RCA-LC-001-B: Microburst Traffic (Alternative - 65% confidence)
export const RCA_LC_001_B_Data: ClusterSpecificData = {
    clusterId: 'RCA-LC-001-B',
    rcaMetadata: { rootEventId: 'EVT-LC-010', rootEventType: 'MICROBURST_TRAFFIC', timestamp: '2025-10-28T14:30:00Z', device: 'core-router-dc1', severity: 'Major' },
    remedyTitle: 'Tune Buffer Allocation and Enable Burst Control',
    rcaSummary: 'High-intensity bursts (<1ms) are exhausting hardware buffers. Telemetry reveals 92% peak usage spikes, causing sporadic packet drops even with normal average utilization.',
    rootCause: 'Microburst Traffic Pattern Causing Buffer Overflow',
    confidence: 0.65,
    rcaProcessSteps: generateRCASteps('CLU-LC-001-B', 'MICROBURST_TRAFFIC', 'core-router-dc1'),
    dataEvidence: [
        { source: 'Buffer Telemetry', type: 'Metrics', count: 320, samples: ['Buffer usage spikes: 92% peak', 'Burst duration: <1ms', 'Queue drops: sporadic'], relevance: 95 },
        { source: 'SNMP Polling', type: 'Metrics', count: 180, samples: ['Average utilization: 75%', 'Microburst count: 45/min', 'Peak burst rate: 8Gbps'], relevance: 88 },
        { source: 'Traffic Analytics', type: 'Metrics', count: 95, samples: ['Multiple TCP sources', 'Retransmission ratio: 3.2%', 'Bursty pattern detected'], relevance: 82 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-LC-012', alertType: 'BUFFER_SPIKE', source: 'core-router-dc1', severity: 'Major', timestamp: '2025-10-28T14:30:15Z', correlationScore: 0.93, correlationReason: 'Temporal Correlation: Buffer spike coincides with drops', message: 'Hardware buffer usage exceeded 90%' },
        { id: 'EVT-LC-013', alertType: 'TCP_RETRANS', source: 'app-cluster-01', severity: 'Major', timestamp: '2025-10-28T14:30:22Z', correlationScore: 0.87, correlationReason: 'Causal Correlation: Drops trigger retransmissions', message: 'TCP retransmission storm detected' }
    ],
    impactedAssets: [
        { id: 'real-time-app', name: 'Real-Time Trading App', type: 'Service', severity: 'Major', status: 'Intermittent Drops', dependencies: ['core-router-dc1'] },
        { id: 'voip-service', name: 'VoIP Service', type: 'Service', severity: 'Major', status: 'Jitter', dependencies: ['core-router-dc1'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-router-dc1', label: 'Core Router DC1', type: 'device', status: 'warning', severity: 'Major' },
            { id: 'real-time-app', label: 'Trading App', type: 'service', status: 'warning', severity: 'Major' },
            { id: 'voip-service', label: 'VoIP', type: 'service', status: 'warning', severity: 'Major' }
        ],
        edges: [
            { from: 'core-router-dc1', to: 'real-time-app', type: 'dependency' },
            { from: 'core-router-dc1', to: 'voip-service', type: 'dependency' }
        ]
    },
    remediationSteps: [
        { id: 'REM-MB-01', phase: 'Immediate', action: 'Analyze Burst Pattern', description: 'Deep packet inspection on interface Gi0/1/0 to identify burst sources and timing patterns.', status: 'complete', duration: '2m', automated: true, command: 'show interfaces Gi0/1/0 stats burst-analysis', verification: ['Pattern identified', 'Top talkers logged'] },
        { id: 'REM-MB-02', phase: 'Immediate', action: 'Increase Buffer Allocation', description: 'Temporarily increase hardware buffer allocation for the affected interface to absorb microbursts.', status: 'pending', duration: '1m', automated: true, command: 'interface Gi0/1/0; buffer-size 256k', verification: ['Buffer increased', 'Queue depth stable'] },
        { id: 'REM-MB-03', phase: 'Temporary', action: 'Enable Burst Smoothing', description: 'Apply traffic shaping to smooth out burst patterns and prevent queue overflow.', status: 'pending', duration: '2m', automated: true, command: 'policy-map SMOOTH_BURSTS; shape peak 800m', verification: ['Shaper active', 'Bursts reduced'] },
        { id: 'REM-MB-04', phase: 'Long-term', action: 'Application-Side Optimization', description: 'Work with application teams to implement pacing mechanisms and reduce bursty send patterns.', status: 'pending', duration: '1h', automated: false, verification: ['Team notified', 'Optimization scheduled'] }
    ],
    remediationKB: [
        { title: 'Microburst Detection Guide', relevance: 94, url: '#' },
        { title: 'Buffer Tuning Best Practices', relevance: 89, url: '#' }
    ],
};

// RCA-LC-001-C: Interface Duplex Mismatch (Least likely - 35% confidence)
export const RCA_LC_001_C_Data: ClusterSpecificData = {
    clusterId: 'RCA-LC-001-C',
    rcaMetadata: { rootEventId: 'EVT-LC-010', rootEventType: 'DUPLEX_MISMATCH', timestamp: '2025-10-28T14:30:00Z', device: 'core-router-dc1', severity: 'Minor' },
    remedyTitle: 'Verify and Configure Interface Speed/Duplex Settings',
    rcaSummary: 'Potential speed/duplex auto-negotiation failure between core-router-dc1 (Gi0/1/0) and the connected aggregation switch. While link status shows operational (up/up) with full-duplex at 1Gbps, asymmetric configuration on either end could manifest as increased late collisions and CRC errors. Current interface statistics show minimal input errors (20 packets) and normal output, making this hypothesis less likely. However, historical cases show duplex mismatch can produce intermittent issues that align with current symptoms.',
    rootCause: 'Suspected Duplex/Speed Negotiation Inconsistency',
    confidence: 0.35,
    rcaProcessSteps: generateRCASteps('CLU-LC-001-C', 'DUPLEX_MISMATCH', 'core-router-dc1'),
    dataEvidence: [
        { source: 'Interface Stats', type: 'Metrics', count: 45, samples: ['Link status: up/up', 'Speed: 1Gbps', 'Duplex: full (local)'], relevance: 70 },
        { source: 'Error Counters', type: 'Metrics', count: 28, samples: ['Input errors: 20 packets', 'Late collisions: 3', 'CRC errors: 8'], relevance: 65 },
        { source: 'Historical Logs', type: 'Logs', count: 12, samples: ['Previous duplex issues on similar hardware', 'Auto-negotiation flap 2 weeks ago'], relevance: 55 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-LC-014', alertType: 'CRC_ERROR', source: 'core-router-dc1', severity: 'Minor', timestamp: '2025-10-28T14:28:00Z', correlationScore: 0.78, correlationReason: 'Symptomatic Correlation: CRC errors align with duplex issues', message: 'CRC errors detected on Gi0/1/0' },
        { id: 'EVT-LC-015', alertType: 'LATE_COLLISION', source: 'core-router-dc1', severity: 'Minor', timestamp: '2025-10-28T14:29:00Z', correlationScore: 0.72, correlationReason: 'Characteristic Symptom: Late collisions indicate duplex mismatch', message: 'Late collision count increased' }
    ],
    impactedAssets: [
        { id: 'downstream-switch', name: 'Aggregation Switch', type: 'Device', severity: 'Minor', status: 'Possible Config Issue', dependencies: ['core-router-dc1'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-router-dc1', label: 'Core Router DC1', type: 'device', status: 'info', severity: 'Minor' },
            { id: 'agg-switch-01', label: 'Agg Switch 01', type: 'device', status: 'info', severity: 'Minor' }
        ],
        edges: [
            { from: 'core-router-dc1', to: 'agg-switch-01', type: 'connection' }
        ]
    },
    remediationSteps: [
        { id: 'REM-DM-01', phase: 'Immediate', action: 'Check Remote Side Config', description: 'Verify speed/duplex configuration on the connected aggregation switch to detect asymmetry.', status: 'complete', duration: '1m', automated: true, command: 'show run interface Gi0/1/0 | include duplex', verification: ['Remote config retrieved', 'Both sides logged'] },
        { id: 'REM-DM-02', phase: 'Immediate', action: 'Force Manual Configuration', description: 'Disable auto-negotiation and manually configure both sides to 1Gbps full-duplex.', status: 'pending', duration: '3m', automated: false, command: 'interface Gi0/1/0; speed 1000; duplex full', verification: ['Manual config applied', 'Link re-established'] },
        { id: 'REM-DM-03', phase: 'Temporary', action: 'Monitor Error Counters', description: 'Clear counters and monitor for 15 minutes to confirm duplex fix resolved the issue.', status: 'pending', duration: '15m', automated: true, command: 'clear counters Gi0/1/0; show int Gi0/1/0 | include error', verification: ['Counters cleared', 'No new errors'] },
        { id: 'REM-DM-04', phase: 'Long-term', action: 'Document Standard Config', description: 'Update network standards to mandate manual duplex/speed configuration for critical links.', status: 'pending', duration: '30m', automated: false, verification: ['Documentation updated'] }
    ],
    remediationKB: [
        { title: 'Duplex Mismatch Troubleshooting', relevance: 72, url: '#' },
        { title: 'Interface Configuration Standards', relevance: 68, url: '#' }
    ],
};

// CLU-002: Fiber Cut
export const CLU_002_Data: ClusterSpecificData = {
    clusterId: 'CLU-002',
    rcaMetadata: { rootEventId: 'EVT-FC-001', rootEventType: 'FIBER_CUT', timestamp: new Date(Date.now() - 7200000).toISOString(), device: 'Dist-R4', severity: 'Critical' },
    remedyTitle: 'Dispatch Field Technician for Fiber Repair',
    rcaSummary: 'Physical fiber cut detected on uplink interface Gi0/0/1 connecting Dist-R4 to Core-R1. Optical signal loss (LOS) alarm triggered immediately, preceded by rapid light level degradation from -8dBm to complete loss. Correlation with construction activity 500m from fiber route suggests excavation damage.',
    rootCause: 'Physical Fiber Optic Cable Severance',
    confidence: 0.98,
    rcaProcessSteps: generateRCASteps('CLU-002', 'FIBER_CUT', 'Dist-R4'),
    dataEvidence: [
        { source: 'Optical Monitoring', type: 'Metrics', count: 150, samples: ['RX Power: -8dBm → 0dBm', 'LOS Alarm: Active'], relevance: 99 },
        { source: 'Interface Logs', type: 'Logs', count: 12, samples: ['%LINK-3-UPDOWN: Interface Gi0/0/1, changed state to down'], relevance: 95 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-FC-002', alertType: 'BGP_PEER_DOWN', source: 'Dist-R4', severity: 'Critical', timestamp: new Date(Date.now() - 7199000).toISOString(), correlationScore: 0.97, correlationReason: 'Causal Correlation', message: 'BGP neighbor 10.1.1.1 down' }
    ],
    impactedAssets: [
        { id: 'building-a', name: 'Building A Users', type: 'Subnet', severity: 'Critical', status: 'Offline', dependencies: ['Dist-R4'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-r1', label: 'Core-R1', type: 'device', status: 'operational' },
            { id: 'dist-r4', label: 'Dist-R4', type: 'device', status: 'critical', severity: 'Critical' }
        ],
        edges: [{ from: 'core-r1', to: 'dist-r4', type: 'failed-connection' }]
    },
    remediationSteps: [
        { id: 'REM-FC-01', phase: 'Immediate', action: 'Dispatch Crew', description: 'Contact fiber repair crew for emergency site visit.', status: 'complete', duration: '5m', automated: false, verification: ['Crew dispatched'] },
        { id: 'REM-FC-02', phase: 'Temporary', action: 'Reroute Traffic', description: 'Attempting to reroute critical traffic through secondary OOB link.', status: 'pending', duration: '10m', automated: true, command: 'ip route 0.0.0.0 0.0.0.0 Gi0/9', verification: ['Reachability restored'] }
    ],
    remediationKB: [{ title: 'Fiber Cut Response', relevance: 98, url: '#' }]
};

// CLU-003: Power Supply Failure
export const CLU_003_Data: ClusterSpecificData = {
    clusterId: 'CLU-003',
    rcaMetadata: { rootEventId: 'EVT-PS-001', rootEventType: 'POWER_SUPPLY_FAIL', timestamp: new Date(Date.now() - 86400000).toISOString(), device: 'Core-R2', severity: 'Critical' },
    remedyTitle: 'Replace Power Supply Unit (PSU-1)',
    rcaSummary: 'Hardware Failure: Primary Power Supply Unit (PSU-1) failed on Core-R2. Voltage telemetry dropped below 10.5V before complete power loss. Internal thermal sensors reported a spike to 85°C prior to shutdown, indicating a probable component short-circuit.',
    rootCause: 'Internal Component Failure in PSU-1',
    confidence: 0.95,
    rcaProcessSteps: generateRCASteps('CLU-003', 'POWER_SUPPLY_FAIL', 'Core-R2'),
    dataEvidence: [
        { source: 'Chassis Telemetry', type: 'Metrics', count: 45, samples: ['PSU-1 Voltage: 0.0V', 'Fan Speed: 0 RPM'], relevance: 98 },
        { source: 'Environment Logs', type: 'Logs', count: 8, samples: ['%ENVM-3-PSFAIL: Power supply 1 failed'], relevance: 95 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-PS-002', alertType: 'FAN_FAILURE', source: 'Core-R2', severity: 'Major', timestamp: new Date(Date.now() - 86395000).toISOString(), correlationScore: 0.88, correlationReason: 'Linked Power Domain', message: 'PSU Fan stopped' }
    ],
    impactedAssets: [
        { id: 'core-r2-chassis', name: 'Core-R2 Chassis', type: 'Device', severity: 'Major', status: 'Reduced Redundancy', dependencies: [] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-r2', label: 'Core-R2', type: 'device', status: 'warning', severity: 'Major' },
            { id: 'psu-1', label: 'PSU-1', type: 'component', status: 'critical', severity: 'Critical' }
        ],
        edges: [{ from: 'core-r2', to: 'psu-1', type: 'containment' }]
    },
    remediationSteps: [
        { id: 'REM-PS-01', phase: 'Immediate', action: 'Verify Redundancy', description: 'Confirm PSU-2 is handling full chassis load.', status: 'complete', duration: '1m', automated: true, command: 'show environment power', verification: ['PSU-2: Active/OK'] },
        { id: 'REM-PS-02', phase: 'Temporary', action: 'RMA Process', description: 'Initiating RMA for hardware replacement.', status: 'pending', duration: '24h', automated: false, verification: ['RMA Ticket created'] }
    ],
    remediationKB: [{ title: 'PSU Replacement Guide', relevance: 95, url: '#' }]
};

// CLU-004: Traffic Flood
export const CLU_004_Data: ClusterSpecificData = {
    clusterId: 'CLU-004',
    rcaMetadata: { rootEventId: 'EVT-TF-001', rootEventType: 'CPU_HIGH', timestamp: new Date(Date.now() - 172800000).toISOString(), device: 'Dist-R6', severity: 'Critical' },
    remedyTitle: 'Identify and Mitigate Ingress Traffic Flood',
    rcaSummary: 'Control Plane Exhaustion: Ingress packet storm (source 192.168.50.12) on Dist-R6 Gi0/1 causing CPU spikes to 98%. Most CPU cycles consumed by "IP Input" process, indicating a massive volume of punts to CPU.',
    rootCause: 'Unfiltered Ingress UDP Flood from Internal Host',
    confidence: 0.92,
    rcaProcessSteps: generateRCASteps('CLU-004', 'CPU_HIGH', 'Dist-R6'),
    dataEvidence: [
        { source: 'Flow Analytics', type: 'Metrics', count: 1200, samples: ['Source: 192.168.50.12', 'PPS: 150k', 'Protocol: UDP/53'], relevance: 96 },
        { source: 'CPU Monitor', type: 'Metrics', count: 60, samples: ['CPU: 98%', 'Process: IP Input (85%)'], relevance: 94 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-TF-002', alertType: 'SERVICE_LATENCY', source: 'DNS-Srv', severity: 'Major', timestamp: new Date(Date.now() - 172740000).toISOString(), correlationScore: 0.85, correlationReason: 'Symptomatic Impact', message: 'DNS resolution slow' }
    ],
    impactedAssets: [
        { id: 'dns-service', name: 'DNS Services', type: 'Service', severity: 'Major', status: 'Degraded', dependencies: ['Dist-R6'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'dist-r6', label: 'Dist-R6', type: 'device', status: 'critical', severity: 'Critical' },
            { id: 'source-host', label: 'Host 192.168.50.12', type: 'endpoint', status: 'suspicious' }
        ],
        edges: [{ from: 'source-host', to: 'dist-r6', type: 'traffic-flow' }]
    },
    remediationSteps: [
        { id: 'REM-TF-01', phase: 'Immediate', action: 'Apply Ingress ACL', description: 'Blocking source IP at the ingress interface.', status: 'pending', duration: '2m', automated: true, command: 'access-list 101 deny ip host 192.168.50.12 any', verification: ['CPU utilization < 20%'] }
    ],
    remediationKB: [{ title: 'DDoS Mitigation Playbook', relevance: 90, url: '#' }]
};

// CLU-005: Switching Loop
export const CLU_005_Data: ClusterSpecificData = {
    clusterId: 'CLU-005',
    rcaMetadata: { rootEventId: 'EVT-SL-001', rootEventType: 'MAC_FLAP', timestamp: new Date(Date.now() - 259200000).toISOString(), device: 'Core-R1', severity: 'Critical' },
    remedyTitle: 'Identify and Break Switching Loop on VLAN 100',
    rcaSummary: 'Layer 2 Switching Loop: Rapid MAC address flapping detected on VLAN 100 between ports Gi0/1 and Gi0/2. Broadcast traffic has reached 85% of total interface capacity, causing control plane instability and high CPU on Core-R1.',
    rootCause: 'Improper STP Configuration on Downstream Access switch',
    confidence: 0.94,
    rcaProcessSteps: generateRCASteps('CLU-005', 'MAC_FLAP', 'Core-R1'),
    dataEvidence: [
        { source: 'MAC Table', type: 'Events', count: 450, samples: ['MAC 00:50:56:8a:c2:11 flapping between Gi0/1 and Gi0/2'], relevance: 98 },
        { source: 'Traffic Stats', type: 'Metrics', count: 120, samples: ['Broadcast: 850Mbps', 'Multicast: 120Mbps'], relevance: 95 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-SL-002', alertType: 'STP_CHANGE', source: 'Core-R1', severity: 'Major', timestamp: new Date(Date.now() - 259195000).toISOString(), correlationScore: 0.91, correlationReason: 'Topology Change', message: 'VLAN 100 STP root changed' }
    ],
    impactedAssets: [
        { id: 'vlan-100', name: 'Users on VLAN 100', type: 'Network Segment', severity: 'Critical', status: 'Saturated', dependencies: ['Core-R1'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-r1', label: 'Core-R1', type: 'device', status: 'critical', severity: 'Critical' },
            { id: 'acc-sw-02', label: 'Access-SW-02', type: 'device', status: 'warning' }
        ],
        edges: [
            { from: 'core-r1', to: 'acc-sw-02', type: 'loop-path' },
            { from: 'acc-sw-02', to: 'core-r1', type: 'loop-path' }
        ]
    },
    remediationSteps: [
        { id: 'REM-SL-01', phase: 'Immediate', action: 'Shutdown Loop Port', description: 'Shutting down Gi0/2 to break the physical loop.', status: 'pending', duration: '1m', automated: true, command: 'interface Gi0/2; shutdown', verification: ['MAC flapping cleared'] }
    ],
    remediationKB: [{ title: 'Spanning Tree Optimization', relevance: 92, url: '#' }]
};

// CLU-006: Transceiver Failure
export const CLU_006_Data: ClusterSpecificData = {
    clusterId: 'CLU-006',
    rcaMetadata: { rootEventId: 'EVT-TR-001', rootEventType: 'LINK_DOWN', timestamp: new Date(Date.now() - 345600000).toISOString(), device: 'Core-R1', severity: 'Critical' },
    remedyTitle: 'Replace Faulty SFP Transceiver on Gi0/2/0',
    rcaSummary: 'Physical Interface Failure: The SFP transceiver on Gi0/2/0 has failed. DOM (Digital Optical Monitoring) report shows TX fault and temperature out of range (95°C) just before the link dropped.',
    rootCause: 'Hardware Failure: SFP TX Laser Burnout',
    confidence: 0.96,
    rcaProcessSteps: generateRCASteps('CLU-006', 'LINK_DOWN', 'Core-R1'),
    dataEvidence: [
        { source: 'Digital Optical Monitoring', type: 'Metrics', count: 12, samples: ['TX Power: -40dBm', 'Temp: 95C'], relevance: 99 },
        { source: 'Interface Logs', type: 'Logs', count: 5, samples: ['%SFP-3-FAULT: TX Fault detected on Gi0/2/0'], relevance: 97 }
    ],
    correlatedChildEvents: [],
    impactedAssets: [
        { id: 'uplink-redundancy', name: 'DC Uplink Redundancy', type: 'Infrastructure', severity: 'Major', status: 'Lost', dependencies: [] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-r1', label: 'Core-R1', type: 'device', status: 'warning' },
            { id: 'sfp-module', label: 'SFP-Gi0/2/0', type: 'component', status: 'critical' }
        ],
        edges: [{ from: 'core-r1', to: 'sfp-module', type: 'containment' }]
    },
    remediationSteps: [
        { id: 'REM-TR-01', phase: 'Immediate', action: 'Disable Faulty Port', description: 'Admin down the port to prevent flapping.', status: 'complete', duration: '1m', automated: true, command: 'interface Gi0/2/0; shutdown', verification: ['Port status: Admin Down'] }
    ],
    remediationKB: [{ title: 'SFP Troubleshooting', relevance: 88, url: '#' }]
};

// CLU-007: Driver Bug
export const CLU_007_Data: ClusterSpecificData = {
    clusterId: 'CLU-007',
    rcaMetadata: { rootEventId: 'EVT-DB-001', rootEventType: 'LINK_DOWN', timestamp: new Date(Date.now() - 432000000).toISOString(), device: 'Core-R2', severity: 'Critical' },
    remedyTitle: 'Update Linecard Driver / Patch IOS-XE',
    rcaSummary: 'Software Crash: Linecard 2 experienced a fatal error in the ASIC driver. Memory registers showed an overflow condition consistent with Caveat CSCvm12345 (Mem Leak in Buffer Manager).',
    rootCause: 'Software Bug: Memory Leak in Linecard ASIC Driver',
    confidence: 0.90,
    rcaProcessSteps: generateRCASteps('CLU-007', 'LINK_DOWN', 'Core-R2'),
    dataEvidence: [
        { source: 'Crash Dump', type: 'Logs', count: 1, samples: ['Exception in thread "ASIC-Driver-0" at 0x44A2F'], relevance: 98 },
        { source: 'System Memory', type: 'Metrics', count: 45, samples: ['Driver Mem Usage: 1.2GB (Peak)'], relevance: 92 }
    ],
    correlatedChildEvents: [],
    impactedAssets: [
        { id: 'linecard-2', name: 'Linecard 2 (Core-R2)', type: 'Hardware', severity: 'Critical', status: 'Offline', dependencies: [] }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-r2', label: 'Core-R2', type: 'device', status: 'critical' },
            { id: 'lc-2', label: 'Linecard 2', type: 'component', status: 'critical' }
        ],
        edges: [{ from: 'core-r2', to: 'lc-2', type: 'containment' }]
    },
    remediationSteps: [
        { id: 'REM-DB-01', phase: 'Immediate', action: 'Reset Linecard', description: 'Attempting a warm reload of linecard 2.', status: 'pending', duration: '5m', automated: true, command: 'hw-module subslot 0/2 reload', verification: ['Linecard back online'] }
    ],
    remediationKB: [{ title: 'Bug Search Tool Reference', relevance: 95, url: '#' }]
};

// CLU-12345: DB Connection Failed
export const CLU_12345_Data: ClusterSpecificData = {
    clusterId: 'CLU-12345',
    rcaMetadata: { rootEventId: 'EVT-DB-101', rootEventType: 'DB_CONNECTION_FAILED', timestamp: new Date(Date.now() - 518400000).toISOString(), device: 'db-server-01', severity: 'Critical' },
    remedyTitle: 'Restart Connection Pool and Release Leaked Connections',
    rcaSummary: 'Database connection pool exhaustion on db-server-01. Payment processing service (app-pay-01) is holding 80% of pool connections in "IDLE in transaction" state, preventing other services from connecting.',
    rootCause: 'Connection Leak in payment-processing-service v2.4.1',
    confidence: 0.95,
    rcaProcessSteps: generateRCASteps('CLU-12345', 'DB_CONNECTION_FAILED', 'db-server-01'),
    dataEvidence: [
        { source: 'DB Metrics', type: 'Metrics', count: 100, samples: ['Active Connections: 500/500', 'Wait Queue: 45'], relevance: 98 },
        { source: 'App Logs', type: 'Logs', count: 250, samples: ['HikariPool-1 - Connection is not available'], relevance: 95 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-DB-102', alertType: 'SERVICE_DOWN', source: 'Checkout-UI', severity: 'Critical', timestamp: new Date(Date.now() - 518340000).toISOString(), correlationScore: 0.92, correlationReason: 'Cascade Failure', message: 'Checkout backend unreachable' }
    ],
    impactedAssets: [
        { id: 'payment-service', name: 'Payment Service', type: 'Microservice', severity: 'Critical', status: 'Deadlocked', dependencies: ['db-server-01'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'db-server', label: 'DB-Server-01', type: 'device', status: 'critical' },
            { id: 'pay-service', label: 'Payment-Service', type: 'service', status: 'critical' }
        ],
        edges: [{ from: 'pay-service', to: 'db-server', type: 'database-connection' }]
    },
    remediationSteps: [
        { id: 'REM-DB-101', phase: 'Immediate', action: 'Flush Connection Pool', description: 'Force restart of the connection pool to clear idle connections.', status: 'pending', duration: '2m', automated: true, command: 'pkill -HUP pg_bouncer', verification: ['Active connections < 100'] }
    ],
    remediationKB: [{ title: 'HikariCP Leak Detection', relevance: 85, url: '#' }]
};

// CLU-12346: Disk Full
export const CLU_12346_Data: ClusterSpecificData = {
    clusterId: 'CLU-12346',
    rcaMetadata: { rootEventId: 'EVT-DF-101', rootEventType: 'DISK_FULL', timestamp: new Date(Date.now() - 604800000).toISOString(), device: 'storage-node-03', severity: 'Critical' },
    remedyTitle: 'Prune Old Logs and Fix Rotation Script',
    rcaSummary: 'Filesystem Exhaustion: The /var/log partition is 100% full. Log rotation script failed to gzip old files, causing /var/log/syslog to grow to 45GB. This has stalled the syslog daemon and dependent application logging.',
    rootCause: 'Log Rotation Script Failure (Exit Code 1)',
    confidence: 0.98,
    rcaProcessSteps: generateRCASteps('CLU-12346', 'DISK_FULL', 'storage-node-03'),
    dataEvidence: [
        { source: 'Disk Usage', type: 'Metrics', count: 12, samples: ['/var/log: 100%', '/: 45%'], relevance: 99 },
        { source: 'System Logs', type: 'Logs', count: 4, samples: ['No space left on device'], relevance: 98 }
    ],
    correlatedChildEvents: [],
    impactedAssets: [
        { id: 'logging-infra', name: 'Central Logging', type: 'Service', severity: 'Major', status: 'Stalled', dependencies: ['storage-node-03'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'storage-03', label: 'Storage-Node-03', type: 'device', status: 'critical' },
            { id: 'log-vol', label: '/var/log', type: 'volume', status: 'full' }
        ],
        edges: [{ from: 'storage-03', to: 'log-vol', type: 'mount' }]
    },
    remediationSteps: [
        { id: 'REM-DF-101', phase: 'Immediate', action: 'Prune Large Logs', description: 'Deleting .1 .2 .3 rotated files to gain space.', status: 'pending', duration: '5m', automated: true, command: 'rm /var/log/*.1 /var/log/*.2', verification: ['Disk space > 10%'] }
    ],
    remediationKB: [{ title: 'Logrotate Troubleshooting', relevance: 90, url: '#' }]
};

// CLU-12347: Network Latency
export const CLU_12347_Data: ClusterSpecificData = {
    clusterId: 'CLU-12347',
    rcaMetadata: { rootEventId: 'EVT-NL-101', rootEventType: 'NETWORK_LATENCY', timestamp: new Date(Date.now() - 691200000).toISOString(), device: 'router-dc-east-01', severity: 'Major' },
    remedyTitle: 'Stabilize BGP Peer and Mitigate Flapping',
    rcaSummary: 'Intermittent Latency: RTT spikes of 500ms observed between East DC and West DC. BGP session with AS 65001 is flapping every 120 seconds, causing recursive route re-calculation and packet drops across the backbone.',
    rootCause: 'BGP Flapping due to Layer 1 errors on Peer Link',
    confidence: 0.88,
    rcaProcessSteps: generateRCASteps('CLU-12347', 'NETWORK_LATENCY', 'router-dc-east-01'),
    dataEvidence: [
        { source: 'BGP Peer Stats', type: 'Events', count: 15, samples: ['BGP-5-ADJCHANGE: neighbor 10.1.1.1 Down (Hold Timer Expired)'], relevance: 95 },
        { source: 'Ping Monitor', type: 'Metrics', count: 600, samples: ['Latency: 500ms (Avg)', 'Loss: 2.5%'], relevance: 90 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-NL-102', alertType: 'ROUTE_FLAP', source: 'Core-R1', severity: 'Major', timestamp: new Date(Date.now() - 691140000).toISOString(), correlationScore: 0.85, correlationReason: 'Re-routing Latency', message: 'Backbone route instability' }
    ],
    impactedAssets: [
        { id: 'dc-connectivity', name: 'Inter-DC Link', type: 'Infrastructure', severity: 'Major', status: 'Unstable', dependencies: [] }
    ],
    impactTopology: {
        nodes: [
            { id: 'router-east', label: 'Router-DC-East', type: 'device', status: 'warning' },
            { id: 'router-west', label: 'Router-DC-West', type: 'device', status: 'warning' }
        ],
        edges: [{ from: 'router-east', to: 'router-west', type: 'bgp-session', status: 'flapping' }]
    },
    remediationSteps: [
        { id: 'REM-NL-101', phase: 'Immediate', action: 'Configure BGP Dampening', description: 'Applying dampening to prevent flapping routes from being advertised.', status: 'pending', duration: '2m', automated: true, command: 'router bgp 65000; address-family ipv4; bgp dampening', verification: ['Neighbor status stable'] }
    ],
    remediationKB: [{ title: 'BGP Dampening Best Practices', relevance: 88, url: '#' }]
};

// CLU-12348: Memory Exhaustion
export const CLU_12348_Data: ClusterSpecificData = {
    clusterId: 'CLU-12348',
    rcaMetadata: { rootEventId: 'EVT-ME-101', rootEventType: 'MEMORY_EXHAUSTION', timestamp: new Date(Date.now() - 777600000).toISOString(), device: 'app-server-05', severity: 'Critical' },
    remedyTitle: 'Scale Up JVM Heap and Investigate Memory Leak',
    rcaSummary: 'Application Failure: JVM heap memory exhausted on app-server-05. Garbage collection overhead is exceeding 95%, causing frequent "Stop-the-world" pauses and request timeouts for the order-service.',
    rootCause: 'JVM Heap Leak in order-service (Old Gen accumulation)',
    confidence: 0.94,
    rcaProcessSteps: generateRCASteps('CLU-12348', 'MEMORY_EXHAUSTION', 'app-server-05'),
    dataEvidence: [
        { source: 'JVM Metrics', type: 'Metrics', count: 45, samples: ['Heap Usage: 3.9GB/4GB', 'GC Overhead: 96%'], relevance: 98 },
        { source: 'App Logs', type: 'Logs', count: 12, samples: ['java.lang.OutOfMemoryError: Java heap space'], relevance: 99 }
    ],
    correlatedChildEvents: [],
    impactedAssets: [
        { id: 'order-service', name: 'Order Service', type: 'Microservice', severity: 'Critical', status: 'Unresponsive', dependencies: ['app-server-05'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'app-05', label: 'App-Server-05', type: 'device', status: 'critical' },
            { id: 'jvm', label: 'JVM Heap', type: 'component', status: 'exhausted' }
        ],
        edges: [{ from: 'app-05', to: 'jvm', type: 'resource-usage' }]
    },
    remediationSteps: [
        { id: 'REM-ME-101', phase: 'Immediate', action: 'Restart Application', description: 'Performing a clean restart of the order-service to clear heap.', status: 'pending', duration: '3m', automated: true, command: 'systemctl restart order-service', verification: ['Heap usage < 50%'] }
    ],
    remediationKB: [{ title: 'JVM Memory Leak Analysis', relevance: 92, url: '#' }]
};

// CLU-12349: SSL Cert Expiry
export const CLU_12349_Data: ClusterSpecificData = {
    clusterId: 'CLU-12349',
    rcaMetadata: { rootEventId: 'EVT-SSL-101', rootEventType: 'SSL_CERT_EXPIRY', timestamp: new Date(Date.now() - 864000000).toISOString(), device: 'proxy-ssl-01', severity: 'Critical' },
    remedyTitle: 'Renew and Deploy SSL Certificate for domain.com',
    rcaSummary: 'Security Breach: The SSL certificate for api.production.com expired at 00:00:00 UTC. Load balancers are rejecting TLS handshakes, resulting in 100% service unavailability for external clients.',
    rootCause: 'Automated Certificate Renewal Script Failure',
    confidence: 1.0,
    rcaProcessSteps: generateRCASteps('CLU-12349', 'SSL_CERT_EXPIRY', 'proxy-ssl-01'),
    dataEvidence: [
        { source: 'SSL Checker', type: 'Events', count: 1, samples: ['Expiry: 2025-12-07 00:00:00 (EXPIRED)'], relevance: 100 },
        { source: 'LB Logs', type: 'Logs', count: 5000, samples: ['SSL_ERROR_EXPIRED_CERT_ALERT'], relevance: 99 }
    ],
    correlatedChildEvents: [],
    impactedAssets: [
        { id: 'external-api', name: 'External API Gateway', type: 'Service', severity: 'Critical', status: 'Inaccessible', dependencies: [] }
    ],
    impactTopology: {
        nodes: [
            { id: 'proxy-01', label: 'Proxy-SSL-01', type: 'device', status: 'critical' },
            { id: 'cert', label: 'SSL Certificate', type: 'security', status: 'expired' }
        ],
        edges: [{ from: 'proxy-01', to: 'cert', type: 'validity-check' }]
    },
    remediationSteps: [
        { id: 'REM-SSL-101', phase: 'Immediate', action: 'Deploy New Certificate', description: 'Uploading emergency wildcard certificate to the load balancer.', status: 'pending', duration: '5m', automated: false, verification: ['Handshake Status: OK'] }
    ],
    remediationKB: [{ title: 'SSL Renewal Procedure', relevance: 98, url: '#' }]
};

// CLU-12350: CPU Spike
export const CLU_12350_Data: ClusterSpecificData = {
    clusterId: 'CLU-12350',
    rcaMetadata: { rootEventId: 'EVT-CS-101', rootEventType: 'CPU_SPIKE', timestamp: new Date(Date.now() - 950400000).toISOString(), device: 'worker-node-12', severity: 'Critical' },
    remedyTitle: 'Terminate Runaway Process and Optimize Code',
    rcaSummary: 'Performance Degradation: Worker-node-12 CPU usage sustained at 100%. A single Python process (PID 4421) is consuming 99.5% CPU executing a regex matching task against a malformed 2GB log file.',
    rootCause: 'ReDoS (Regular Expression Denial of Service) in log-parser-service',
    confidence: 0.96,
    rcaProcessSteps: generateRCASteps('CLU-12350', 'CPU_SPIKE', 'worker-node-12'),
    dataEvidence: [
        { source: 'Top/Htop', type: 'Metrics', count: 120, samples: ['PID 4421: 99.5% CPU', 'State: running'], relevance: 99 },
        { source: 'App Health', type: 'Metrics', count: 30, samples: ['Request latency: 15s'], relevance: 90 }
    ],
    correlatedChildEvents: [],
    impactedAssets: [
        { id: 'log-parser', name: 'Log Parser Service', type: 'Service', severity: 'Major', status: 'Hanging', dependencies: ['worker-node-12'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'worker-12', label: 'Worker-Node-12', type: 'device', status: 'critical' },
            { id: 'pid-4421', label: 'Python (PID 4421)', type: 'process', status: 'runaway' }
        ],
        edges: [{ from: 'worker-12', to: 'pid-4421', type: 'resource-consumption' }]
    },
    remediationSteps: [
        { id: 'REM-CS-101', phase: 'Immediate', action: 'Kill Process', description: 'SIGKILL runaway process to restore node health.', status: 'pending', duration: '1m', automated: true, command: 'kill -9 4421', verification: ['CPU utilization < 5%'] }
    ],
    remediationKB: [{ title: 'Avoiding ReDoS Patterns', relevance: 94, url: '#' }]
};


// CLU-NET-004: Pattern Match - Complex Interface Flap Pattern

export const CLU_NET_004_Data: ClusterSpecificData = {
    clusterId: 'CLU-NET-004',
    rcaMetadata: {
        rootEventId: 'EVT-NET-004-1',
        rootEventType: 'LINK_CONGESTION',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        device: 'Dist-Switch-02',
        severity: 'Critical'
    },
    remedyTitle: 'Interface Hardware Stabilization & Traffic Shaping',
    rcaSummary: `[Pattern Match] - Interface Degradation Lifecycle. The system identifies a high-confidence correlation between initial congestion and terminal link failure. The sequence of Buffer Saturation, CRC Errors, and Packet Loss confirmed a physical-layer/buffer instability leading to the Interface Flap.`,
    rootCause: 'Saturation-Induced Physical Layer Instability leading to Link Flap',
    confidence: 0.99,
    rcaProcessSteps: generateRCASteps('CLU-NET-004', 'LINK_CONGESTION', 'Dist-Switch-02'),
    dataEvidence: [
        { source: 'Pattern Discovery', type: 'Events', count: 1, samples: ['Signature Match: Saturation -> Error -> Loss -> Flap'], relevance: 100 },
        { source: 'Buffer Telemetry', type: 'Metrics', count: 45, samples: ['Peak egress buffer: 85%', 'Queue wait time: 120ms'], relevance: 98 },
        { source: 'Physical Layer (PHY)', type: 'Metrics', count: 120, samples: ['CRC Error Rate: 1.2k/min', 'Input discards: 5%'], relevance: 95 }
    ],
    correlatedChildEvents: [
        { id: 'EVT-NET-004-2', alertType: 'BUFFER_UTILIZATION', source: 'Dist-Switch-02', severity: 'Major', timestamp: new Date(Date.now() - 3300000).toISOString(), correlationScore: 0.98, correlationReason: 'Pattern-Based Correlation: Step 2 - Buffer Exhaustion', message: 'Output queue buffers reaching threshold (85%)' },
        { id: 'EVT-NET-004-3', alertType: 'CRC_ERRORS', source: 'Dist-Switch-02', severity: 'Major', timestamp: new Date(Date.now() - 3240000).toISOString(), correlationScore: 0.99, correlationReason: 'Pattern-Based Correlation: Step 3 - Signal Instability', message: 'High CRC error rate detected on Et0/0' },
        { id: 'EVT-NET-004-4', alertType: 'PACKET_LOSS', source: 'Dist-Switch-02', severity: 'Critical', timestamp: new Date(Date.now() - 3180000).toISOString(), correlationScore: 0.99, correlationReason: 'Pattern-Based Correlation: Step 4 - Data Plane Fault', message: 'Packet loss exceeds 5% on Et0/0' },
        { id: 'EVT-NET-004-5', alertType: 'INTERFACE_FLAP', source: 'Dist-Switch-02', severity: 'Critical', timestamp: new Date(Date.now() - 3120000).toISOString(), correlationScore: 0.99, correlationReason: 'Pattern-Based Correlation: Step 5 - Terminal Failure', message: 'Interface transition to Down state' }
    ],
    impactedAssets: [
        { id: 'internal-wifi', name: 'Corporate WiFi Backbone', type: 'Service', severity: 'Major', status: 'Degraded', dependencies: ['Dist-Switch-02'] },
        { id: 'voip-gw', name: 'VoIP Gateway Cluster', type: 'Service', severity: 'Critical', status: 'Unreachable', dependencies: ['Dist-Switch-02'] }
    ],
    impactTopology: {
        nodes: [
            { id: 'dist-sw-02', label: 'Dist-Switch-02', type: 'device', status: 'critical', severity: 'Critical' },
            { id: 'internal-wifi', label: 'WiFi Service', type: 'service', status: 'warning', severity: 'Major' },
            { id: 'voip-gw', label: 'VoIP Cluster', type: 'service', status: 'critical', severity: 'Critical' }
        ],
        edges: [
            { from: 'dist-sw-02', to: 'internal-wifi', type: 'dependency' },
            { from: 'dist-sw-02', to: 'voip-gw', type: 'dependency' }
        ]
    },
    remediationSteps: [
        { id: 'REM-NET-004-1', phase: 'Immediate', action: 'Adaptive Buffer Reallocation', description: 'Applying emergency buffer expansion on Et0/0 to dissipate microburst pressure.', status: 'pending', duration: '1m', automated: true, command: 'interface Et0/0; buffer-size 256k', verification: ['Allocated buffers: 256k OK'] },
        { id: 'REM-NET-004-2', phase: 'Immediate', action: 'Interface Reset', description: 'Performing hardware-level power-cycle of the SFP/PHY to clear error states.', status: 'pending', duration: '2m', automated: true, command: 'hw-module int Et0/0 reset', verification: ['PHY re-link successful'] },
        { id: 'REM-NET-004-3', phase: 'Long-term', action: 'Traffic Profile Audit', description: 'Generating deep packet inspection report to identify upstream sources causing burst saturation.', status: 'pending', duration: '1h', automated: false, verification: ['Audit report generated'] },
    ],
    remediationKB: [{ title: 'Pattern-Based RCA: Interface Flap Pattern', relevance: 98, url: '#' }]
};

// Export a map for easy lookup
export const clusterDataMap: Record<string, ClusterSpecificData> = {
    'CLU-LC-001': CLU_LC_001_Data,
    'RCA-LC-001-A': RCA_LC_001_A_Data,
    'RCA-LC-001-B': RCA_LC_001_B_Data,
    'RCA-LC-001-C': RCA_LC_001_C_Data,
    'CLU-12345': CLU_12345_Data,
    'CLU-12346': CLU_12346_Data,
    'CLU-12347': CLU_12347_Data,
    'CLU-12348': CLU_12348_Data,
    'CLU-12349': CLU_12349_Data,
    'CLU-12350': CLU_12350_Data,
    'CLU-002': CLU_002_Data,
    'CLU-003': CLU_003_Data,
    'CLU-004': CLU_004_Data,
    'CLU-005': CLU_005_Data,
    'CLU-006': CLU_006_Data,
    'CLU-007': CLU_007_Data,
    'CLU-NET-004': CLU_NET_004_Data,
};

// Probable Cause Definitions
export interface ProbableCause {
    id: string;
    title: string;
    description: string;
    confidence: number;
    severity: 'Critical' | 'Major' | 'Minor';
    tags?: string[];
    occurrenceCount?: number;
}

export const CLU_LC_001_Causes: ProbableCause[] = [
    {
        id: 'RCA-LC-001-A',
        title: 'Network Congestion (Backup Induced)',
        description: 'Unscheduled NFS backup traffic from agent-server-01 is consuming >35% link capacity on Gi0/1/0. This saturation results in queue tail drops and 400ms latency spikes, confirmed by NetFlow data with DSCP 0 classification.',
        confidence: 0.95,
        severity: 'Major',
        occurrenceCount: 12
    },
    {
        id: 'RCA-LC-001-B',
        title: 'Microburst Traffic',
        description: 'High-intensity traffic bursts (<1ms) are causing instantaneous buffer exhaustion. Telemetry shows periodic spikes to 92% buffer usage, leading to sporadic packet drops even when average utilization appears normal.',
        confidence: 0.65,
        severity: 'Major',
        occurrenceCount: 5
    },
    {
        id: 'RCA-LC-001-C',
        title: 'Interface Duplex Mismatch',
        description: 'Potential auto-negotiation failure between router and switch may be causing CRC errors. While currently less likely due to low error counts (20 pkts), a duplex mismatch would manifest as late collisions and packet drops.',
        confidence: 0.35,
        severity: 'Minor',
        occurrenceCount: 2
    },
];

// Probable Cause Definitions per Cluster
export const CLU_002_Causes: ProbableCause[] = [
    { id: 'CLU-002-RCA-01', title: 'External Fiber Cut', description: 'Excavation activity at 123 Main St has physically severed the backbone cable. Most likely cause due to reported construction.', confidence: 0.98, severity: 'Critical', occurrenceCount: 1 },
    { id: 'CLU-002-RCA-02', title: 'Remote Chassis Failure', description: 'Power loss or chassis reload on Core-R1 could also manifest as a sudden link loss.', confidence: 0.15, severity: 'Major' },
    { id: 'CLU-002-RCA-03', title: 'Double SFP Failure', description: 'Probability of both ends failing simultaneously is low but possible due to shared environmental factors.', confidence: 0.05, severity: 'Minor' }
];

export const CLU_003_Causes: ProbableCause[] = [
    { id: 'CLU-003-RCA-01', title: 'PSU Internal Component Failure', description: 'Capacitor or voltage regulator failure within PSU-1. Thermal sensors recorded extreme heat prior to the trip.', confidence: 0.95, severity: 'Critical', occurrenceCount: 3 },
    { id: 'CLU-003-RCA-02', title: 'PDU / Power Source Issue', description: 'Problem with the external power distribution unit or phase imbalance in the rack.', confidence: 0.25, severity: 'Major' },
    { id: 'CLU-003-RCA-03', title: 'Chassis Power Management Bug', description: 'Software-triggered shutdown of the PSU due to erroneous sensor readings.', confidence: 0.10, severity: 'Minor' }
];

export const CLU_004_Causes: ProbableCause[] = [
    { id: 'CLU-004-RCA-01', title: 'UDP Reflection Attack', description: 'Inbound UDP flood targeting internal DNS infrastructure, originating from compromised host 192.168.50.12.', confidence: 0.92, severity: 'Critical' },
    { id: 'CLU-004-RCA-02', title: 'Application Traffic Spike', description: 'Sudden surge in legitimate traffic due to a marketing campaign or service launch.', confidence: 0.35, severity: 'Major' },
    { id: 'CLU-004-RCA-03', title: 'BGP Route Leak', description: 'Unexpected external traffic being routed through the local network due to a peering misconfiguration.', confidence: 0.15, severity: 'Minor' }
];

export const CLU_005_Causes: ProbableCause[] = [
    { id: 'CLU-005-RCA-01', title: 'STP Priority Misconfiguration', description: 'A new switch added to the network with default STP priority caused a root bridge shift and loop.', confidence: 0.94, severity: 'Critical', occurrenceCount: 8 },
    { id: 'CLU-005-RCA-02', title: 'Accidental Patching Loop', description: 'Physical cable looped between two ports on the same VLAN on Access-SW-02.', confidence: 0.70, severity: 'Major' },
    { id: 'CLU-005-RCA-03', title: 'Virtual Machine Bridging Loop', description: 'Misconfigured vSwitch on a hypervisor bridging two different physical networks.', confidence: 0.30, severity: 'Minor' }
];

export const CLU_12345_Causes: ProbableCause[] = [
    { id: 'CLU-12345-RCA-01', title: 'Connection Pool Leak', description: 'Application is opening database connections but failing to close them in the finally block.', confidence: 0.95, severity: 'Critical' },
    { id: 'CLU-12345-RCA-02', title: 'Slow Query Backlog', description: 'Degraded index on the orders table causing long-running queries to hold connections for >30s.', confidence: 0.45, severity: 'Major' },
    { id: 'CLU-12345-RCA-03', title: 'Database Deadlock', description: 'Concurrent updates on shared rows causing transactions to hang and exhaust the pool.', confidence: 0.25, severity: 'Minor' }
];

export const CLU_12346_Causes: ProbableCause[] = [
    {
        id: 'CLU-12346-RCA-01',
        title: 'Log Rotation Failure',
        description: 'Missing logrotate configuration for a new service caused system logs to grow to 85GB, exhausting the mount point. This has significantly increased I/O wait times and degraded system performance.',
        confidence: 0.95,
        severity: 'Critical'
    },
    {
        id: 'CLU-12346-RCA-02',
        title: 'Large Core Dump Generation',
        description: 'A 12GB full core dump from the report-generator service exhausted the remaining 5% storage on storage-node-03. The sudden drop in space coincides exactly with the service crash timestamp.',
        confidence: 0.70,
        severity: 'Major'
    }
];

export const CLU_12347_Causes: ProbableCause[] = [
    {
        id: 'CLU-12347-RCA-01',
        title: 'BGP Route Flapping (ISP-A)',
        description: 'Intermittent Layer 1 errors on peer 10.1.1.2 are causing BGP resets every 120s. Each reset triggers a global routing reload, resulting in high control plane CPU and 500ms latency spikes during path reconvergence.',
        confidence: 0.92,
        severity: 'Major'
    },
    {
        id: 'CLU-12347-RCA-02',
        title: 'Recursive Routing Loop',
        description: 'A misconfigured static route is pointing back to a dynamic next-hop that resolves via the same static route, creating a circular routing loop. This causes TTL expiry and packet loss for specific prefixes.',
        confidence: 0.40,
        severity: 'Major'
    }
];

export const CLU_12348_Causes: ProbableCause[] = [
    {
        id: 'CLU-12348-RCA-01',
        title: 'JVM Heap Leak (Order Service Cache)',
        description: 'An unbounded HashMap in the pricing-engine is causing steady growth in JVM Old Gen space. Heap analysis shows 3.2GB consumed by cache objects, resulting in 98% GC overhead and OOM imminent alerts.',
        confidence: 0.94,
        severity: 'Critical'
    },
    {
        id: 'CLU-12348-RCA-02',
        title: 'Sudden Bulk Transaction Surge',
        description: 'A batch processing job is loading 500k concurrent records, forcing survivor space spikes into Old Gen. This volume triggers frequent Stop-the-world Full GCs and temporary application unresponsiveness.',
        confidence: 0.60,
        severity: 'Major'
    }
];

export const CLU_12349_Causes: ProbableCause[] = [
    {
        id: 'CLU-12349-RCA-01',
        title: 'SSL Certificate Expiration',
        description: 'The api.production.com SSL certificate expired at 00:00 UTC due to an ACME renewal failure. Load balancers are rejecting all TLS handshakes, causing 100% service unavailability for external clients.',
        confidence: 1.0,
        severity: 'Critical'
    }

];

export const CLU_NET_004_Causes: ProbableCause[] = [
    {
        id: 'RCA-NET-004-A',
        title: 'Pattern Match: Interface Flap Pattern',
        description: 'High-confidence match of the 5-phase degradation lifecycle (link util → Buffer util → CRC Errors → Loss → Flap). This behavioral fingerprint indicates a systemic buffer-to-physical layer collapse rather than isolated hardware failure.',
        confidence: 0.99,
        severity: 'Critical',
        occurrenceCount: 7,
        tags: ['Pattern Match', 'Complex Sequence', 'Buffer Saturation']
    },
    {
        id: 'RCA-NET-004-B',
        title: 'Physical Layer / Transceiver Fault',
        description: 'Physical degradation of the SFP or cable. While possible, the absence of early-stage link instability signatures makes this less likely than the recognized congestion-driven pattern.',
        confidence: 0.15,
        severity: 'Major'
    }
];

export const getProbableCauses = (clusterId: string): ProbableCause[] => {
    switch (clusterId) {
        case 'CLU-LC-001': return CLU_LC_001_Causes;
        case 'CLU-003': return CLU_003_Causes;
        case 'CLU-12345': return CLU_12345_Causes;
        case 'CLU-12346': return CLU_12346_Causes;
        case 'CLU-12347': return CLU_12347_Causes;
        case 'CLU-12348': return CLU_12348_Causes;
        case 'CLU-12349': return CLU_12349_Causes;
        case 'CLU-NET-004': return CLU_NET_004_Causes;
        default:
            return [
                { id: `${clusterId}-RCA-01`, title: 'Anomalous Behavior Detected', description: 'The system has identified abnormal patterns in resource utilization correlating with the initial event.', confidence: 0.85, severity: 'Critical' },
                { id: `${clusterId}-RCA-02`, title: 'Configuration Change Suspected', description: 'Recent audit logs show configuration modifications in the 15-minute window preceding the failure.', confidence: 0.55, severity: 'Major' },
                { id: `${clusterId}-RCA-03`, title: 'Transient Workload Spike', description: 'A sudden burst of activity may have temporarily overwhelmed system capacity before stabilizing.', confidence: 0.35, severity: 'Minor' }
            ];
    }
};

export const getClusterData = (id: string): ClusterSpecificData | undefined => {
    return clusterDataMap[id];
};
