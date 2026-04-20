// RCA Pipeline Step-by-Step Data (Based on Backend Implementation)

// Step 1: Orchestration Input/Output
export const orchestrationStep = {
  id: 1,
  name: 'Orchestration',
  subtitle: 'Data Collection',
  input: {
    label: 'NMS Trigger Event',
    data: {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      device: 'core-router-dc1',
      alarm_id: 'ALARM-12345',
      resource_name: 'Gi0/1/0',
      resource_type: 'interface',
      alert_msg: ['High interface utilization detected on Gi0/0/0']
    }
  },
  output: {
    label: 'Enriched Incident Data',
    data: {
      device: 'core-router-dc1',
      incident_id: 'ALARM-12345',
      resource_name: 'Gi0/1/0',
      resource_type: 'interface',
      signals: {
        'core-router-dc1': {
          cpu_percent: 85.0,
          mem_percent: 75.0,
          temp_c: 45.0,
          avail_percent: 100.0,
          utilization_percent: 96.0,
          in_errors: 20.0,
          out_discards: 500.0,
          latency_ms: 500.0,
          packet_loss_percent: 1.2,
          traffic_dscp0_percent: 76.0
        }
      },
      logs: [
        'High interface utilization detected on Gi0/0/0',
        `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 4200000).toISOString()} | Message: Backup job started on agent-server-01 and tail drop observed`,
        `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 4110000).toISOString()} | Message: Backup traffic detected on Gi0/1/0 (source: agent-server-01, destination: backup-server-02)`,
        `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 3900000).toISOString()} | Message: Interface Gi0/1/0 output queue full`,
        `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 3600000).toISOString()} | Message: CPU utilization crossed 85% threshold`,
        `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 3720000).toISOString()} | Message: Interface Gi0/1/1 link status: up, duplex: full, speed: 1Gbps`,
        `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 3600000).toISOString()} | Message: Normal packet forwarding observed on Gi0/1/1`
      ],
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      goal: 'Investigate interface Gi0/1/0 queue full and high CPU utilization on core-router-dc1 possibly related to the Backup job processing traffic.'
    }
  }
};

// Step 2: Intent Routing Input/Output
export const intentRoutingStep = {
  id: 2,
  name: 'Intent Router',
  subtitle: 'Pattern Matching',
  input: {
    label: 'Enriched Incident + Intents Library',
    description: 'Incident data with signals and logs matched against intent definitions'
  },
  output: {
    label: 'Intent Classification Result',
    data: {
      intent: 'performance',
      subintent: 'congestion',
      confidence: 1.3,
      template_id: 'planner.performance.congestion.v1',
      intent_scores: [
        { id: 'performance.congestion', score: 1.3 },
        { id: 'system.cpu_high', score: 0.8 },
        { id: 'link.high_errors', score: 0.3 },
        { id: 'thermal.early_thermal_risk', score: 0.3 },
        { id: 'thermal.environmental_heat_anomaly', score: 0.2 },
        { id: 'thermal.device_temperature_high', score: 0.1 },
        { id: 'link.down', score: 0 },
        { id: 'link.flap', score: 0 },
        { id: 'routing.bgp_down', score: 0 },
        { id: 'system.memory_high', score: 0 },
        { id: 'system.device_overheat', score: 0 },
        { id: 'security.ddos', score: 0 },
        { id: 'unknown.low_confidence', score: 0 }
      ],
      matched_evidence: {
        'performance.congestion': {
          signals: ['utilization_percent > 90 (0.5)', 'out_discards > 0 (0.4)'],
          keywords: ['tail drop', 'backup']
        },
        'system.cpu_high': {
          signals: ['cpu_percent > 80 (0.8)'],
          keywords: []
        },
        'link.high_errors': {
          signals: ['out_discards > 100 (0.3)'],
          keywords: []
        }
      }
    }
  }
};

// Step 3: Hypothesis Scoring Input/Output
export const hypothesisScoringStep = {
  id: 3,
  name: 'Hypothesis Scorer',
  subtitle: 'Probability Assessment',
  input: {
    label: 'Incident + Intent + Hypotheses Library',
    description: 'Best intent matched with available hypotheses for scoring'
  },
  output: {
    label: 'Ranked Hypotheses',
    data: {
      intent_id: 'performance.congestion',
      intent_score: 1.4,
      hypotheses: [
        {
          hypothesis_id: 'H_QOS_CONGESTION',
          description: 'QOS_CONGESTION - High utilization and queue discards',
          signal_score: 0.9,
          log_score: 0.6,
          total_score: 1.5,
          matched_logs: [
            `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 4200000).toISOString()} | Message: Backup job started on agent-server-01 and tail drop observed`,
            `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 3900000).toISOString()} | Message: Interface Gi0/1/0 output queue full`
          ]
        },
        {
          hypothesis_id: 'H_BACKUP_TRAFFIC',
          description: 'Backup using default DSCP0 traffic',
          signal_score: 0.8,
          log_score: 0.3,
          total_score: 1.1,
          matched_logs: [
            `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 4200000).toISOString()} | Message: Backup job started on agent-server-01 and tail drop observed`,
            `Device: core-router-dc1 | Timestamp: ${new Date(Date.now() - 4110000).toISOString()} | Message: Backup traffic detected on Gi0/1/0 (source: agent-server-01, destination: backup-server-02)`
          ]
        },
        {
          hypothesis_id: 'H_PEAK_TRAFFIC',
          description: 'Peak-hour usage causing congestion',
          signal_score: 0.4,
          log_score: 0,
          total_score: 0.4,
          matched_logs: []
        }
      ],
      top_hypothesis: {
        hypothesis_id: 'H_QOS_CONGESTION',
        description: 'QOS_CONGESTION - High utilization and queue discards',
        signal_score: 0.9,
        log_score: 0.6,
        total_score: 1.5
      },
      prior: 1.5
    }
  }
};

// Step 4: Situation Card Input/Output
export const situationCardStep = {
  id: 4,
  name: 'Situation Builder',
  subtitle: 'Context Assembly',
  input: {
    label: 'Incident + Intents + Top Hypothesis',
    description: 'All context assembled for situation generation'
  },
  output: {
    label: 'Situation Card',
    data: {
      situation_id: 'INFRAON-ALARM-12345',
      situation_text: 'Interface Gi0/1/0 on core-router-dc1 shows high utilization (96.0%), with 500.0 queue drops. Top hypothesis: QOS_CONGESTION - High utilization and queue discards (score=1.5).',
      metadata: {
        device: 'core-router-dc1',
        resource_name: 'Gi0/1/0',
        resource_type: 'interface',
        filled_stats: {
          utilization_percent: 96.0,
          queue_drops: 500.0
        }
      }
    }
  }
};

// Step 5: Planner LLM Input/Output
export const plannerLLMStep = {
  id: 5,
  name: 'Planner LLM',
  subtitle: 'Investigation Plan',
  input: {
    label: 'Aggregated Incident Data',
    description: 'Complete incident context for investigation planning'
  },
  output: {
    label: 'Investigation Plan',
    data: {
      plan_id: 'PLAN-CRC-20491',
      steps: [
        {
          id: 1,
          tool: 'tsdb_query',
          hypothesis: 'H_CRC_PHYSICAL_CORRUPTION',
          params: {
            query: [
              "interface_input_errors_total{device='core-router-dc1',iface='Gi0/1/0'}",
              "interface_output_discards_total{device='core-router-dc1',iface='Gi0/1/0'}",
              "crc_errors_total{device='core-router-dc1',iface='Gi0/1/0'}",
              "input_signal_strength_dbm{device='core-router-dc1',iface='Gi0/1/0'}"
            ]
          },
          why: 'Check sustained spikes in CRC errors, input errors, discards, and signal degradation'
        },
        {
          id: 2,
          tool: 'snmp_query',
          hypothesis: 'H_CRC_PHYSICAL_CORRUPTION',
          params: {
            oids: [
              'IF-MIB::ifInErrors.Gi0/1/0',
              'IF-MIB::ifOutDiscards.Gi0/1/0',
              'CISCO-ENTITY-SENSOR-MIB::entSensorValue.Gi0/1/0'
            ],
            device: 'core-router-dc1'
          },
          why: 'Validate physical port health and optical/electrical signal via SNMP'
        },
        {
          id: 3,
          tool: 'log_query',
          hypothesis: 'H_CRC_PHYSICAL_CORRUPTION',
          params: {
            device: 'core-router-dc1',
            search: ['CRC', 'input error', 'link flap', 'PHY error', 'transceiver fault', 'optical power low']
          },
          why: 'Look for system logs indicating CRC bursts, link flaps, or transceiver faults'
        },
        {
          id: 4,
          tool: 'config_check',
          hypothesis: 'H_CRC_PHYSICAL_CORRUPTION',
          params: {
            device: 'core-router-dc1',
            checks: [
              'speed/duplex mismatch on Gi0/1/0',
              'verify transceiver type & DOM support',
              'auto-negotiation status on Gi0/1/0'
            ]
          },
          why: 'Detect configuration issues that commonly cause CRC and physical errors'
        },
        {
          id: 5,
          tool: 'phy_test',
          hypothesis: 'H_CRC_PHYSICAL_CORRUPTION',
          params: {
            device: 'core-router-dc1',
            interface: 'Gi0/1/0',
            tests: ['cable_diagnostics', 'optic_dom_check']
          },
          why: 'Run cable/optic diagnostics to confirm hardware-level corruption'
        }
      ],
      stop_when: 'CRC/root-cause indicators confirmed OR score ≥ 0.85',
      enriched_correlator_output: {
        correlation_summary: 'Sustained 96% utilization and 500k drops indicate QoS congestion likely.',
        enriched_metrics: {
          dscp0_share: 0.4,
          p95_util_1h: 0.97,
          queue_drops_total: 820000,
          util_5m: 0.98
        },
        hypotheses_updated: [
          { id: 'H_QOS_CONGESTION', posterior: 0.9 },
          { id: 'H_PEAK_TRAFFIC', posterior: 0.55 }
        ],
        vector_embedding: 'vec_789012'
      }
    }
  }
};

// Step 6: Data Correlation Engine Input/Output
export const dataCorrelationStep = {
  id: 6,
  name: 'Data Correlator',
  subtitle: 'Historical Case Matching',
  input: {
    label: 'Aggregate Incident + Situation Card',
    description: 'Semantic and similarity check against historical cases'
  },
  output: {
    label: 'Retrieved Similar Cases',
    data: {
      retrieved_cases: [
        {
          case_id: 'NET-2026-001',
          intent: 'performance',
          rca: 'Unthrottled backup traffic saturated the link due to missing QoS policy, causing tail drops and increased CPU.',
          sim_score: 0.8667,
          remedy: 'Applied QoS shaping to limit backup traffic to 70% of interface capacity; scheduled backups during off-peak hours.',
          sit_summary: 'Interface Gi0/1/0 shows 96% utilization and 500 output queue drops during nightly backup window.'
        },
        {
          case_id: 'NET-2026-604',
          intent: 'performance',
          rca: 'Real-time traffic competing with bulk traffic in class-default, causing congestion and drops in default queue.',
          sim_score: 0.8489,
          remedy: 'Introduced LLQ for real-time traffic and reduced burst size on bulk-transfer ACLs.',
          sit_summary: 'Link utilization peaks at 93% with QoS class-default drops during video conferencing.'
        },
        {
          case_id: 'NET-2026-319',
          intent: 'performance',
          rca: 'Unshaped application traffic saturating link, supported by high utilization and absence of DSCP marking.',
          sim_score: 0.8474,
          remedy: 'Deployed application-aware QoS and DSCP classification; upgraded to 25G link.',
          sit_summary: 'Sustained 92% utilization; latency spikes to 180ms. NetFlow shows unclassified bulk traffic.'
        },
        {
          case_id: 'NET-2026-418',
          intent: 'performance',
          rca: "Link oversubscription without traffic shaping, supported by utilization_percent > 90 and log 'tail drop'.",
          sim_score: 0.8471,
          remedy: 'Applied hierarchical QoS with priority queuing for voice/video.',
          sit_summary: "Utilization at 96%; output discards > 800/min. Logs: 'tail drop on Gi0/1/1'."
        },
        {
          case_id: 'NET-2026-563',
          intent: 'performance',
          rca: 'Interface congestion due to bursty traffic and lack of proper queue shaping.',
          sim_score: 0.8456,
          remedy: 'Enabled traffic shaping and configured priority queue for real-time applications.',
          sit_summary: 'Sustained utilization above 92% with queue depth spikes and 750+ output drops during peak hours.'
        }
      ],
      top_case: 'NET-2026-001',
      average_similarity: 0.8481
    }
  }
};

// Step 7: RCA Correlator Engine Input/Output
export const rcaCorrelatorStep = {
  id: 7,
  name: 'RCA Engine',
  subtitle: 'Final Analysis',
  input: {
    label: 'All Aggregated Data',
    description: 'Complete incident data, hypotheses, and historical cases'
  },
  output: {
    label: 'Root Cause Analysis Result',
    data: {
      rca: 'QOS_CONGESTION - High utilization and queue discards (score=1.5)',
      confidence: 0.95,
      remedy: [
        'Implement QoS shaping policies to limit backup traffic to 70% of interface capacity',
        'Schedule backups during off-peak hours',
        'Deploy priority queues for real-time applications',
        'Upgrade to a 10G link if necessary'
      ],
      evidence_used: [
        { id: 'NET-2026-001', metric: 'utilization_percent', value: '96.0' },
        { id: 'NET-2026-004', metric: 'out_discards', value: '500.0' },
        { id: 'NET-2026-563', metric: 'out_discards', value: '750.0' },
        { id: 'NET-2026-004', metric: 'utilization_percent', value: '85.0' }
      ],
      explanation: 'The combination of high CPU utilization (96%) and frequent queue discards indicates insufficient QoS policy enforcement, leading to congestion and traffic imbalance. Remedies include prioritizing backup traffic and adjusting QoS parameters to manage traffic flow.'
    }
  }
};

// All steps combined
export const rcaPipelineSteps = [
  orchestrationStep,
  intentRoutingStep,
  hypothesisScoringStep,
  situationCardStep,
  plannerLLMStep,
  dataCorrelationStep,
  rcaCorrelatorStep
];
