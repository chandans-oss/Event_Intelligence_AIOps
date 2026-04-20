// Detailed RCA data for all clusters
// This file contains comprehensive, realistic data for each failure scenario

import { ClusterSpecificData } from './clusterData';



// ============================================================================
// CLU-002: FIBER CUT - Physical Layer Failure
// ============================================================================
export const CLU_002_DetailedData: ClusterSpecificData = {
    clusterId: 'CLU-002',
    rcaMetadata: {
        rootEventId: 'EVT-FC-001',
        rootEventType: 'FIBER_CUT',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        device: 'Dist-R4',
        severity: 'Critical'
    },
    remedyTitle: 'Dispatch Field Technician for Fiber Repair',
    rcaSummary: 'Physical fiber cut detected on uplink interface Gi0/0/1 connecting Dist-R4 to Core-R1. Optical signal loss (LOS) alarm triggered immediately at 09:42:15, preceded by rapid light level degradation from -8dBm to complete loss within 200ms. Correlation with reported construction activity 500m from fiber route suggests excavation damage. Complete loss of connectivity affecting 450 downstream users across 3 VLANs.',
    rootCause: 'Physical Fiber Optic Cable Severance',
    confidence: 0.98,
    rcaProcessSteps: [
        {
            id: 'orchestration',
            name: 'Orchestration',
            description: 'Incident detection and goal creation',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: 'Incident Detection',
                        type: 'kv',
                        content: {
                            'Alert Type': 'LINK_DOWN',
                            'Device': 'Dist-R4',
                            'Interface': 'Gi0/0/1',
                            'Detection Time': '09:42:15 UTC',
                            'Initial Severity': 'Critical'
                        }
                    },
                    {
                        title: 'Immediate Symptoms',
                        type: 'list',
                        content: [
                            'Optical signal loss (LOS) alarm on Gi0/0/1',
                            'Light level dropped from -8dBm to 0dBm in 200ms',
                            'BGP neighbor adjacency lost with Core-R1',
                            'Traffic blackhole for 450 downstream users',
                            'Automatic failover to backup path attempted but unavailable'
                        ]
                    }
                ]
            }
        },
        {
            id: 'intent-routing',
            name: 'Intent Routing',
            description: 'Classify failure intent',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: 'Intent Classification',
                        type: 'text',
                        content: 'availability.connectivity.physical'
                    },
                    {
                        title: 'Classification Confidence',
                        type: 'kv',
                        content: {
                            'Match Score': '0.98',
                            'Primary Indicator': 'Optical LOS alarm',
                            'Secondary Indicator': 'Rapid light level drop',
                            'Pattern Match': 'Physical layer failure'
                        }
                    }
                ]
            }
        },
        {
            id: 'hypothesis-scorer',
            name: 'Hypotheses Scorer',
            description: 'Evaluate potential causes',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: 'Hypothesis Ranking',
                        type: 'scored-list',
                        content: [
                            { label: 'H_FIBER_CUT', score: 98, displayScore: '0.98' },
                            { label: 'H_TRANSCEIVER_FAIL', score: 15, displayScore: '0.15' },
                            { label: 'H_PATCH_PANEL_DISCONNECT', score: 8, displayScore: '0.08' }
                        ]
                    },
                    {
                        title: 'Key Evidence',
                        type: 'list',
                        content: [
                            'Light level drop pattern inconsistent with transceiver failure',
                            'No pre-failure degradation typical of aging optics',
                            'Correlation with construction activity report filed 30 minutes prior',
                            'Fiber route passes through active construction zone'
                        ]
                    }
                ]
            }
        },
        {
            id: 'data-correlator',
            name: 'Historical Data Retriever',
            description: 'Historical pattern matching',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: 'Historical Matches',
                        type: 'table',
                        columns: [
                            { key: 'id', label: 'Incident ID' },
                            { key: 'date', label: 'Date' },
                            { key: 'cause', label: 'Cause' },
                            { key: 'similarity', label: 'Similarity', align: 'right' }
                        ],
                        content: [
                            { id: 'INC-2026-422', date: '2026-08-12', cause: 'Excavation damage', similarity: '92%' },
                            { id: 'INC-2026-156', date: '2026-11-03', cause: 'Construction cut', similarity: '88%' }
                        ]
                    }
                ]
            }
        },
        {
            id: 'rca-correlator',
            name: 'RCA Correlator Engine',
            description: 'Final determination',
            status: 'complete',
            details: {
                sections: [
                    {
                        title: 'Root Cause Determination',
                        type: 'text',
                        content: 'Physical fiber cut confirmed through optical signature analysis and correlation with external construction activity. Field technician dispatch required for visual inspection and repair.'
                    },
                    {
                        title: 'Recommended Actions',
                        type: 'list',
                        content: [
                            'Dispatch fiber repair crew to suspected cut location',
                            'Activate redundant path if available',
                            'Notify affected users and provide ETA',
                            'Update fiber route documentation with construction flags'
                        ]
                    }
                ]
            }
        }
    ],
    dataEvidence: [
        {
            source: 'Optical Power Monitoring',
            type: 'Metrics',
            count: 150,
            samples: [
                'RX Power: -8dBm → 0dBm (200ms transition)',
                'TX Power: Normal (+2dBm)',
                'LOS Alarm: Active',
                'Temperature: Normal (42°C)'
            ],
            relevance: 99
        },
        {
            source: 'SNMP Interface Stats',
            type: 'Metrics',
            count: 85,
            samples: [
                'Interface Status: Down/Down',
                'Last state change: 09:42:15',
                'Line protocol: Down',
                'No CRC errors prior to failure'
            ],
            relevance: 95
        },
        {
            source: 'External Systems',
            type: 'Events',
            count: 2,
            samples: [
                'Construction permit filed for 123 Main St (fiber route path)',
                'Dig-safe alert: Excavation planned 500m from Dist-R4'
            ],
            relevance: 92
        },
        {
            source: 'Device Logs',
            type: 'Logs',
            count: 12,
            samples: [
                '%LINK-3-UPDOWN: Interface Gi0/0/1, changed state to down',
                '%LINEPROTO-5-UPDOWN: Line protocol on Interface Gi0/0/1, changed state to down',
                'OPTICAL_LOS: Loss of signal detected on Gi0/0/1'
            ],
            relevance: 88
        }
    ],
    correlatedChildEvents: [
        {
            id: 'EVT-FC-002',
            alertType: 'BGP_PEER_DOWN',
            source: 'Dist-R4',
            severity: 'Critical',
            timestamp: new Date(Date.now() - 7199000).toISOString(),
            correlationScore: 0.97,
            correlationReason: 'Causal Relationship: Link down caused BGP session loss',
            message: 'BGP neighbor 10.1.1.1 (Core-R1) down'
        },
        {
            id: 'EVT-FC-003',
            alertType: 'ROUTE_WITHDRAWN',
            source: 'Core-R1',
            severity: 'Major',
            timestamp: new Date(Date.now() - 7197000).toISOString(),
            correlationScore: 0.95,
            correlationReason: 'Downstream Impact: Routes withdrawn after link failure',
            message: '3 prefixes withdrawn from BGP'
        },
        {
            id: 'EVT-FC-004',
            alertType: 'REACHABILITY_LOSS',
            source: 'Monitoring-System',
            severity: 'Critical',
            timestamp: new Date(Date.now() - 7190000).toISOString(),
            correlationScore: 0.93,
            correlationReason: 'Service Impact: Users unreachable',
            message: '450 endpoints unreachable in subnet 10.20.0.0/16'
        }
    ],
    impactedAssets: [
        {
            id: 'building-a-users',
            name: 'Building A User VLAN',
            type: 'Network Segment',
            severity: 'Critical',
            status: 'Offline',
            dependencies: ['Dist-R4']
        },
        {
            id: 'voip-phones',
            name: 'VoIP Phone System',
            type: 'Service',
            severity: 'Critical',
            status: 'No Connectivity',
            dependencies: ['Dist-R4']
        },
        {
            id: 'access-layer-sw',
            name: 'Access Layer Switches (x15)',
            type: 'Infrastructure',
            severity: 'Major',
            status: 'Isolated',
            dependencies: ['Dist-R4']
        }
    ],
    impactTopology: {
        nodes: [
            { id: 'core-r1', label: 'Core-R1', type: 'device', status: 'operational', severity: 'Low' },
            { id: 'dist-r4', label: 'Dist-R4 (FAILED UPLINK)', type: 'device', status: 'critical', severity: 'Critical' },
            { id: 'access-switches', label: '15 Access Switches', type: 'device', status: 'isolated', severity: 'Major' },
            { id: 'user-segment', label: '450 Users', type: 'user', status: 'critical', severity: 'Critical' },
            { id: 'voip', label: 'VoIP Service', type: 'service', status: 'critical', severity: 'Critical' }
        ],
        edges: [
            { from: 'core-r1', to: 'dist-r4', type: 'failed-connection' },
            { from: 'dist-r4', to: 'access-switches', type: 'dependency' },
            { from: 'access-switches', to: 'user-segment', type: 'dependency' },
            { from: 'access-switches', to: 'voip', type: 'dependency' }
        ]
    },
    remediationSteps: [
        {
            id: 'REM-FC-01',
            phase: 'Immediate',
            action: 'Activate Emergency Response',
            description: 'Contact fiber repair crew and dispatch to suspected cut location (123 Main St, 500m from Dist-R4). Estimated arrival: 45 minutes.',
            status: 'complete',
            duration: '5m',
            automated: false,
            verification: ['Crew dispatched', 'ETA confirmed']
        },
        {
            id: 'REM-FC-02',
            phase: 'Immediate',
            action: 'User Communication',
            description: 'Send mass notification to affected users informing them of service outage and expected restoration time.',
            status: 'complete',
            duration: '2m',
            automated: true,
            command: 'send_notification --group "Building-A" --template "fiber-cut-outage"',
            verification: ['Notification sent to 450 users']
        },
        {
            id: 'REM-FC-03',
            phase: 'Immediate',
            action: 'Evaluate Alternate Path',
            description: 'Check if traffic can be rerouted through backup fiber path or wireless bridge.',
            status: 'pending',
            duration: '10m',
            automated: false,
            verification: ['Alternate path evaluated', 'Capacity assessed']
        },
        {
            id: 'REM-FC-04',
            phase: 'Temporary',
            action: 'Physical Fiber Repair',
            description: 'Field technician splices damaged fiber and verifies optical power levels are within acceptable range (-10dBm to -5dBm).',
            status: 'pending',
            duration: '2h',
            automated: false,
            verification: ['Splice complete', 'Optical power within spec', 'Link restored']
        },
        {
            id: 'REM-FC-05',
            phase: 'Temporary',
            action: 'Service Validation',
            description: 'Verify all BGP sessions re-established, routes installed, and user connectivity restored.',
            status: 'pending',
            duration: '15m',
            automated: true,
            command: 'validate_services --device Dist-R4 --full-check',
            verification: ['BGP up', 'All routes present', '450 users reachable']
        },
        {
            id: 'REM-FC-06',
            phase: 'Long-term',
            action: 'Route Protection Enhancement',
            description: 'Work with facilities team to install conduit markers and update fiber route maps to prevent future construction damage.',
            status: 'pending',
            duration: '1 week',
            automated: false,
            verification: ['Markers installed', 'Documentation updated']
        }
    ],
    remediationKB: [
        { title: 'Fiber Cut Emergency Response Procedure', relevance: 98, url: '/kb/fiber-cut-response' },
        { title: 'Optical Power Level Standards', relevance: 85, url: '/kb/optical-standards' },
        { title: 'Construction Coordination Process', relevance: 78, url: '/kb/construction-coord' }
    ]
};
