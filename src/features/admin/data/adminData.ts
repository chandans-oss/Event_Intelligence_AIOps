import { IntentFull, IntentCategory, KBArticle, RemediationPermission } from '@/shared/types';

// Intent Categories and Subcategories
export const mockIntentCategories: IntentCategory[] = [
  {
    id: "network",
    name: "Network",
    domain: "Network",
    subcategories: [
      { id: "link", name: "Link", function: "Link Layer", intentCount: 12 },
      { id: "performance", name: "Performance", function: "Performance", intentCount: 8 },
      { id: "routing", name: "Routing", function: "Routing", intentCount: 5 },
      { id: "wan", name: "Wan", function: "Wan", intentCount: 4 },
      { id: "wireless", name: "Wireless", function: "Wireless", intentCount: 2 },
      { id: "switching", name: "Switching", function: "Switching", intentCount: 2 },
      { id: "vpn", name: "Vpn", function: "Vpn", intentCount: 1 },
      { id: "mpls", name: "Mpls", function: "Mpls", intentCount: 3 },
      { id: "connectivity", name: "Connectivity", function: "Connectivity", intentCount: 3 },
      { id: "sdwan", name: "Sd Wan", function: "Sd Wan", intentCount: 4 },
      { id: "lb", name: "Load Balancer", function: "Load Balancer", intentCount: 5 }
    ]
  },
  {
    id: "compute",
    name: "Compute",
    domain: "Compute",
    subcategories: [
      { id: "system", name: "System", function: "System", intentCount: 10 },
      { id: "container", name: "Container", function: "Container", intentCount: 5 },
      { id: "kubernetes", name: "Kubernetes", function: "Kubernetes", intentCount: 6 },
      { id: "device", name: "Device Health", function: "Device Health", intentCount: 2 },
      { id: "infra", name: "Infrastructure", function: "Infrastructure", intentCount: 1 },
      { id: "lifecycle", name: "Lifecycle", function: "Lifecycle", intentCount: 1 }
    ]
  },
  {
    id: "application",
    name: "Application",
    domain: "Application",
    subcategories: [
      { id: "errors", name: "Http Errors", function: "Http Errors", intentCount: 5 },
      { id: "latency", name: "Latency", function: "Latency", intentCount: 4 },
      { id: "resource", name: "Resource Context", function: "Resource Context", intentCount: 4 },
      { id: "experience", name: "User Experience", function: "User Experience", intentCount: 3 },
      { id: "throughput", name: "Throughput", function: "Throughput", intentCount: 2 },
      { id: "concurrency", name: "Concurrency", function: "Concurrency", intentCount: 1 },
      { id: "jobs", name: "Job Processing", function: "Job Processing", intentCount: 1 }
    ]
  },
  {
    id: "database",
    name: "Database",
    domain: "Database",
    subcategories: [
      { id: "availability", name: "Availability", function: "Availability", intentCount: 5 },
      { id: "query", name: "Query Performance", function: "Query Performance", intentCount: 4 },
      { id: "replication", name: "Replication", function: "Replication", intentCount: 3 },
      { id: "pool", name: "Connection Pool", function: "Connection Pool", intentCount: 2 },
      { id: "locking", name: "Locking", function: "Locking", intentCount: 1 }
    ]
  },
  {
    id: "security",
    name: "Security",
    domain: "Security",
    subcategories: [
      { id: "detection", name: "Detection", function: "Detection", intentCount: 4 },
      { id: "policy", name: "Policy", function: "Policy", intentCount: 2 },
      { id: "iam", name: "Iam", function: "Iam", intentCount: 2 },
      { id: "auth", name: "Authentication", function: "Authentication", intentCount: 1 }
    ]
  },
  {
    id: "platform",
    name: "Platform",
    domain: "Platform",
    subcategories: [
      { id: "quality", name: "Intent Quality", function: "Intent Quality", intentCount: 5 },
      { id: "correlation", name: "Correlation", function: "Correlation", intentCount: 3 },
      { id: "observability", name: "Observability", function: "Observability Status", intentCount: 3 },
      { id: "dashboards", name: "Dashboards", function: "Dashboards", intentCount: 2 },
      { id: "alerting", name: "Alerting", function: "Alerting", intentCount: 2 }
    ]
  },
  {
    id: "storage",
    name: "Storage",
    domain: "Storage",
    subcategories: [
      { id: "disk", name: "Disk Health", function: "Disk Health", intentCount: 4 },
      { id: "capacity", name: "Capacity", function: "Capacity", intentCount: 2 },
      { id: "snapshots", name: "Snapshots", function: "Snapshots", intentCount: 1 },
      { id: "io", name: "Io Latency", function: "Io Latency", intentCount: 1 }
    ]
  },
  {
    id: "middleware",
    name: "Middleware",
    domain: "Middleware",
    subcategories: [
      { id: "queue", name: "Queue Health", function: "Queue Health", intentCount: 3 },
      { id: "broker", name: "Broker Health", function: "Broker Health", intentCount: 2 },
      { id: "transactions", name: "Transactions", function: "Transaction Health", intentCount: 1 }
    ]
  },
  {
    id: "facility",
    name: "Facility",
    domain: "Facility",
    subcategories: [
      { id: "thermal", name: "Thermal", function: "Thermal", intentCount: 2 },
      { id: "power", name: "Power", function: "Power", intentCount: 1 },
      { id: "cooling", name: "Cooling", function: "Cooling", intentCount: 1 }
    ]
  }
];

// Full Intent Data
export const mockIntentsFull: IntentFull[] = [
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdf8"
    },
    id: "link.down",
    intent: "link",
    description: "Physical/optical link down",
    domain: "Network",
    function: "Link Layer",
    keywords: [
      "interface down",
      "link down",
      "port down",
      "los",
      "loss of signal"
    ],
    signals: [
      {
        metric: "oper_status",
        op: "==",
        value: "down",
        weight: 0.7
      },
      {
        metric: "admin_status",
        op: "==",
        value: "up",
        weight: 0.2
      }
    ],
    hypotheses: [
      {
        id: "H_CABLE_UNPLUGGED",
        description: "Physical cable disconnected or optical signal lost",
        signals: [
          {
            metric: "oper_status",
            op: "==",
            value: "down",
            weight: 0.7
          },
          {
            metric: "admin_status",
            op: "==",
            value: "up",
            weight: 0.2
          }
        ],
        logPatterns: [
          {
            keyword: "loss of signal",
            weight: 0.3
          },
          {
            keyword: "LOS",
            weight: 0.3
          }
        ]
      },
      {
        id: "H_TRANSCEIVER_FAILURE",
        description: "Optical module or SFP failure",
        signals: [
          {
            metric: "oper_status",
            op: "==",
            value: "down",
            weight: 0.6
          }
        ],
        logPatterns: [
          {
            keyword: "transceiver",
            weight: 0.3
          },
          {
            keyword: "module failure",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Link/Interface {interface} on device {device} is down. Operational status is {oper_status}, while administrative status is {admin_status}. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "down"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdf9"
    },
    id: "link.flap",
    intent: "link",
    description: "Interface flapping frequently",
    domain: "Network",
    function: "Link Layer",
    keywords: [
      "flap",
      "bouncing",
      "up/down",
      "interface changed state"
    ],
    signals: [
      {
        metric: "flap_count",
        op: ">",
        value: 3,
        weight: 0.7
      },
      {
        metric: "oper_changes_per_min",
        op: ">",
        value: 1,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_LOOSE_CONNECTION",
        description: "Loose connection or faulty cable",
        signals: [
          {
            metric: "flap_count",
            op: ">",
            value: 3,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "changed state to down",
            weight: 0.3
          }
        ]
      },
      {
        id: "H_NEGOTIATION_ISSUE",
        description: "Speed/Duplex negotiation mismatch",
        signals: [
          {
            metric: "oper_changes_per_min",
            op: ">",
            value: 1,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "duplex",
            weight: 0.3
          },
          {
            keyword: "speed mismatch",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Interface {resoure_name} on {device} is flapping frequently ({flap_count} flaps, {oper_changes_per_min} state changes per minute). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "flap"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdfa"
    },
    id: "link.high_errors",
    intent: "link",
    description: "High CRC/Input/Output errors",
    domain: "Network",
    function: "Link Layer",
    keywords: [
      "crc",
      "input error",
      "output error",
      "frame error"
    ],
    signals: [
      {
        metric: "in_errors",
        op: ">",
        value: 100,
        weight: 0.5
      },
      {
        metric: "out_discards",
        op: ">",
        value: 100,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_CRC_ERRORS",
        description: "CRC or physical layer corruption",
        signals: [
          {
            metric: "in_errors",
            op: ">",
            value: 100,
            weight: 0.6
          }
        ],
        logPatterns: [
          {
            keyword: "crc error",
            weight: 0.3
          }
        ]
      },
      {
        id: "H_BUFFER_OVERFLOW",
        description: "Packet drops due to output queue overflow",
        signals: [
          {
            metric: "out_discards",
            op: ">",
            value: 100,
            weight: 0.4
          }
        ],
        logPatterns: [
          {
            keyword: "queue full",
            weight: 0.2
          },
          {
            keyword: "tail drop",
            weight: 0.2
          }
        ]
      }
    ],
    situationDesc: "Interface {resoure_name} on {device} is experiencing high error rates {in_errors} input errors, {out_discards} output discards. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "high_errors"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdfb"
    },
    id: "performance.congestion",
    intent: "performance",
    description: "Interface congestion",
    domain: "Network",
    function: "Performance",
    keywords: [
      "congestion",
      "queue drop",
      "buffer full",
      "tail drop",
      "backup",
      "rsync"
    ],
    signals: [
      {
        metric: "utilization_percent",
        op: ">",
        value: 90,
        weight: 0.5
      },
      {
        metric: "out_discards",
        op: ">",
        value: 0,
        weight: 0.4
      }
    ],
    hypotheses: [
      {
        id: "H_QOS_CONGESTION",
        description: "High utilization and queue discards",
        signals: [
          {
            metric: "utilization_percent",
            op: ">",
            value: 90,
            weight: 0.5
          },
          {
            metric: "out_discards",
            op: ">",
            value: 0,
            weight: 0.4
          }
        ],
        logPatterns: [
          {
            keyword: "tail drop",
            weight: 0.3
          },
          {
            keyword: "buffer full",
            weight: 0.3
          },
          {
            keyword: "queue full",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Interface {resoure_name} on {device} shows high utilization ({utilization_percent}%), with {out_discards} queue drops. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "congestion"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdfc"
    },
    id: "routing.bgp_down",
    intent: "routing",
    description: "BGP session down",
    domain: "Network",
    function: "Routing",
    keywords: [
      "bgp",
      "neighbor down"
    ],
    signals: [
      {
        metric: "bgp_session_state",
        op: "==",
        value: "down",
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_BGP_NEIGHBOR_LOST",
        description: "BGP peer or transport failure",
        signals: [
          {
            metric: "bgp_session_state",
            op: "==",
            value: "down",
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "BGP-5-ADJCHANGE",
            weight: 0.3
          },
          {
            keyword: "neighbor down",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "BGP session between {device} and neighbor {peer} is down (state={bgp_session_state}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "bgp_down"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdfd"
    },
    id: "system.cpu_high",
    intent: "system",
    description: "High CPU on device",
    domain: "Compute",
    function: "CPU",
    keywords: [
      "cpu high",
      "high load"
    ],
    signals: [
      {
        metric: "cpu_percent",
        op: ">",
        value: 80,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_CPU_SPIKE",
        description: "CPU nearing threshold causing impact",
        signals: [
          {
            metric: "cpu_percent",
            op: ">",
            value: 80,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "high cpu",
            weight: 0.3
          },
          {
            keyword: "process",
            weight: 0.2
          }
        ]
      }
    ],
    situationDesc: "Device {device} CPU utilization is high ({cpu_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "cpu_high"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdfe"
    },
    id: "system.memory_high",
    intent: "system",
    description: "High memory usage",
    domain: "Compute",
    function: "Memory",
    keywords: [
      "memory high",
      "ram usage"
    ],
    signals: [
      {
        metric: "mem_percent",
        op: ">",
        value: 80,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_MEMORY_PRESSURE",
        description: "Memory nearing full capacity",
        signals: [
          {
            metric: "mem_percent",
            op: ">",
            value: 80,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "memory",
            weight: 0.3
          },
          {
            keyword: "oom",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Device {device} memory utilization is high ({mem_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "memory_high"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75cdff"
    },
    id: "security.ddos",
    intent: "security",
    description: "High PPS traffic —œ potential DDOS",
    domain: "Security",
    function: "Threat",
    keywords: [
      "ddos",
      "attack",
      "flood"
    ],
    signals: [
      {
        metric: "pps_rate",
        op: ">",
        value: 1000000,
        weight: 0.6
      }
    ],
    hypotheses: [
      {
        id: "H_VOLUME_ATTACK",
        description: "High-volume packet flood attack",
        signals: [
          {
            metric: "pps_rate",
            op: ">",
            value: 1000000,
            weight: 0.6
          }
        ],
        logPatterns: [
          {
            keyword: "attack",
            weight: 0.3
          },
          {
            keyword: "flood",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Device {device} is experiencing unusually high packet rate ({pps_rate} PPS) indicating possible DDOS. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "ddos"
  },
  {
    _id: {
      $oid: "6937d9c6a4cd14665b75ce00"
    },
    id: "unknown.low_confidence",
    intent: "unknown",
    description: "No confident match",
    domain: "Platform",
    function: "Intent Quality",
    keywords: [
      "unknown",
      "investigate"
    ],
    signals: [
      {
        metric: "combined_score",
        op: "<",
        value: 0.6,
        weight: 1
      }
    ],
    hypotheses: [
      {
        id: "H_MANUAL_INVESTIGATION",
        description: "Not enough evidence —œ manual analysis required",
        signals: [
          {
            metric: "combined_score",
            op: "<",
            value: 0.6,
            weight: 1
          }
        ],
        logPatterns: [
          {
            keyword: "unknown",
            weight: 0.2
          }
        ]
      }
    ],
    situationDesc: "No clear pattern detected for {device}. Combined score = {combined_score}. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "low_confidence"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce01"
    },
    id: "link.unidirectional",
    intent: "link",
    domain: "Network",
    function: "Link Layer",
    description: "Unidirectional link issue detected between two devices",
    keywords: [
      "unidirectional",
      "rx only",
      "tx only",
      "fiber issue"
    ],
    signals: [
      {
        metric: "rx_errors",
        op: ">",
        value: 100,
        weight: 0.5
      },
      {
        metric: "tx_errors",
        op: "==",
        value: 0,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_FIBER_ONE_SIDE_BROKEN",
        description: "One strand of the fiber pair is broken or mispatched",
        signals: [
          {
            metric: "rx_errors",
            op: ">",
            value: 100,
            weight: 0.6
          },
          {
            metric: "tx_errors",
            op: "==",
            value: 0,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "unidirectional link",
            weight: 0.3
          },
          {
            keyword: "no light received",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Link between {device} and {peer} appears unidirectional. {device} is receiving frames with errors (rx_errors={rx_errors}) while not transmitting successfully (tx_errors={tx_errors}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "unidirectional"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce02"
    },
    id: "link.duplex_mismatch",
    intent: "link",
    domain: "Network",
    function: "Link Layer",
    description: "Possible speed/duplex mismatch detected on interface",
    keywords: [
      "duplex mismatch",
      "late collisions",
      "half duplex"
    ],
    signals: [
      {
        metric: "collisions",
        op: ">",
        value: 10,
        weight: 0.5
      },
      {
        metric: "speed_mismatch_flag",
        op: "==",
        value: 1,
        weight: 0.4
      }
    ],
    hypotheses: [
      {
        id: "H_AUTONEG_FAILED",
        description: "Auto-negotiation failed leading to speed/duplex mismatch",
        signals: [
          {
            metric: "collisions",
            op: ">",
            value: 10,
            weight: 0.5
          },
          {
            metric: "speed_mismatch_flag",
            op: "==",
            value: 1,
            weight: 0.4
          }
        ],
        logPatterns: [
          {
            keyword: "duplex mismatch",
            weight: 0.3
          },
          {
            keyword: "late collision",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Interface {interface} on {device} shows collision errors (collisions={collisions}) and a speed/duplex mismatch indicator. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "duplex_mismatch"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce03"
    },
    id: "performance.jitter_high",
    intent: "performance",
    domain: "Network",
    function: "Performance",
    description: "High jitter observed on path impacting real-time traffic",
    keywords: [
      "jitter",
      "voice quality",
      "realtime",
      "RTP"
    ],
    signals: [
      {
        metric: "jitter_ms",
        op: ">",
        value: 30,
        weight: 0.6
      },
      {
        metric: "packet_loss_percent",
        op: ">",
        value: 1,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_TRANSIENT_CONGESTION",
        description: "Transient congestion or microbursts causing jitter",
        signals: [
          {
            metric: "jitter_ms",
            op: ">",
            value: 30,
            weight: 0.6
          },
          {
            metric: "packet_loss_percent",
            op: ">",
            value: 1,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "voice quality degraded",
            weight: 0.3
          },
          {
            keyword: "RTP jitter",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "High jitter detected on path involving {device} (jitter={jitter_ms} ms, loss={packet_loss_percent}%). Real-time applications may be impacted. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "jitter_high"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce04"
    },
    id: "routing.ospf_flap",
    intent: "routing",
    domain: "Network",
    function: "Routing",
    description: "OSPF adjacency flapping between neighbors",
    keywords: [
      "ospf",
      "adjacency reset",
      "routing flap"
    ],
    signals: [
      {
        metric: "ospf_adj_changes",
        op: ">",
        value: 3,
        weight: 0.7
      }
    ],
    hypotheses: [
      {
        id: "H_OSPF_HELLO_MISS",
        description: "Hello packets being missed due to loss or delay",
        signals: [
          {
            metric: "ospf_adj_changes",
            op: ">",
            value: 3,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "LOST_ADJACENCY",
            weight: 0.3
          },
          {
            keyword: "Dead timer expired",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "OSPF adjacency between {device} and {peer} is flapping (changes={ospf_adj_changes}). This can cause route instability. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "ospf_flap"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce05"
    },
    id: "wan.mtu_mismatch",
    intent: "wan",
    domain: "Network",
    function: "WAN",
    description: "Possible MTU mismatch on WAN path",
    keywords: [
      "mtu",
      "fragmentation",
      "path mtu"
    ],
    signals: [
      {
        metric: "fragmented_packets",
        op: ">",
        value: 100,
        weight: 0.5
      },
      {
        metric: "icmp_frag_needed",
        op: ">",
        value: 0,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_PATH_MTU_MISMATCH",
        description: "Intermediate hop enforcing smaller MTU than endpoints",
        signals: [
          {
            metric: "fragmented_packets",
            op: ">",
            value: 100,
            weight: 0.5
          },
          {
            metric: "icmp_frag_needed",
            op: ">",
            value: 0,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "fragmentation needed",
            weight: 0.3
          },
          {
            keyword: "DF bit set",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "WAN path involving {device} shows fragmentation events (fragmented_packets={fragmented_packets}) and ICMP 'fragmentation needed' messages. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "mtu_mismatch"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce06"
    },
    id: "wireless.client_auth_failure",
    intent: "wireless",
    domain: "Network",
    function: "Wireless",
    description: "Multiple wireless client authentication failures on SSID",
    keywords: [
      "wifi",
      "auth failure",
      "802.1x",
      "EAP"
    ],
    signals: [
      {
        metric: "wifi_auth_failures",
        op: ">",
        value: 20,
        weight: 0.7
      }
    ],
    hypotheses: [
      {
        id: "H_RADIUS_ISSUE",
        description: "RADIUS or 802.1X authentication issues",
        signals: [
          {
            metric: "wifi_auth_failures",
            op: ">",
            value: 20,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "EAP failure",
            weight: 0.3
          },
          {
            keyword: "RADIUS server not responding",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "High wireless authentication failure rate detected on {ssid} at {device} (failures={wifi_auth_failures}). Users may be unable to join the network. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "client_auth_failure"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce07"
    },
    id: "system.cpu_spike",
    intent: "system",
    domain: "Compute",
    function: "CPU",
    description: "Short-term CPU spike on host",
    keywords: [
      "cpu spike",
      "high load",
      "process spike"
    ],
    signals: [
      {
        metric: "cpu_percent",
        op: ">",
        value: 90,
        weight: 0.7
      },
      {
        metric: "cpu_load_1min",
        op: ">",
        value: 4,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_BATCH_JOB",
        description: "Batch or background job temporarily consuming CPU",
        signals: [
          {
            metric: "cpu_percent",
            op: ">",
            value: 90,
            weight: 0.7
          },
          {
            metric: "cpu_load_1min",
            op: ">",
            value: 4,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "cron",
            weight: 0.3
          },
          {
            keyword: "scheduled job",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Host {device} shows a CPU spike (cpu={cpu_percent}%, load_1={cpu_load_1min}). Short bursts may impact latency-sensitive workloads. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "cpu_spike"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce08"
    },
    id: "system.memory_leak_suspected",
    intent: "system",
    domain: "Compute",
    function: "Memory",
    description: "Sustained growth in memory usage suggesting a leak",
    keywords: [
      "memory leak",
      "heap growth",
      "rss increasing"
    ],
    signals: [
      {
        metric: "mem_percent",
        op: ">",
        value: 85,
        weight: 0.6
      },
      {
        metric: "mem_trend_1h",
        op: ">",
        value: 10,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_APP_MEMORY_LEAK",
        description: "Application memory leak causing continuous growth in RAM usage",
        signals: [
          {
            metric: "mem_percent",
            op: ">",
            value: 85,
            weight: 0.6
          },
          {
            metric: "mem_trend_1h",
            op: ">",
            value: 10,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "OutOfMemoryError",
            weight: 0.3
          },
          {
            keyword: "memory allocation failure",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Host {device} shows sustained high memory usage (mem={mem_percent}%, 1h increase={mem_trend_1h}%). This may indicate a leak. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "memory_leak_suspected"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce09"
    },
    id: "system.psu_sensor_alarm",
    intent: "system",
    domain: "Compute",
    function: "Sensors",
    description: "Power supply unit sensor reporting alarm",
    keywords: [
      "psu failure",
      "power supply",
      "sensor alarm"
    ],
    signals: [
      {
        metric: "psu_status",
        op: "==",
        value: "failed",
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_PSU_FAILED",
        description: "One of the PSUs on the server has failed",
        signals: [
          {
            metric: "psu_status",
            op: "==",
            value: "failed",
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "PSU failure",
            weight: 0.3
          },
          {
            keyword: "power supply error",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Power supply sensor on {device} reports a failure (psu_status={psu_status}). Redundancy may be degraded. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "psu_sensor_alarm"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce0a"
    },
    id: "system.critical_service_down",
    intent: "system",
    domain: "Compute",
    function: "Os Services",
    description: "Critical OS-level service is not running",
    keywords: [
      "service down",
      "daemon stopped",
      "process not running"
    ],
    signals: [
      {
        metric: "service_running",
        op: "==",
        value: 0,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_SERVICE_CRASHED",
        description: "Critical service crashed or failed to start",
        signals: [
          {
            metric: "service_running",
            op: "==",
            value: 0,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "service crashed",
            weight: 0.3
          },
          {
            keyword: "failed to start",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Service {service_name} on {device} is not running (service_running={service_running}). This may impact application availability. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "critical_service_down"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce0b"
    },
    id: "container.restart_loop",
    intent: "container",
    domain: "Compute",
    function: "Containers",
    description: "Container repeatedly restarting on host",
    keywords: [
      "crashloop",
      "restart backoff",
      "container crash"
    ],
    signals: [
      {
        metric: "container_restarts",
        op: ">",
        value: 5,
        weight: 0.7
      }
    ],
    hypotheses: [
      {
        id: "H_BAD_CONFIG_OR_DEPENDENCY",
        description: "Misconfiguration or missing dependency causing container to crash",
        signals: [
          {
            metric: "container_restarts",
            op: ">",
            value: 5,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "CrashLoopBackOff",
            weight: 0.3
          },
          {
            keyword: "ImagePullBackOff",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Container {container_name} on {device} is restarting repeatedly (restarts={container_restarts}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "restart_loop"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce0c"
    },
    id: "security.port_scan",
    intent: "security",
    domain: "Security",
    function: "Threat",
    description: "Possible port scanning activity detected",
    keywords: [
      "port scan",
      "nmap",
      "reconnaissance"
    ],
    signals: [
      {
        metric: "unique_dest_ports",
        op: ">",
        value: 100,
        weight: 0.7
      },
      {
        metric: "conn_attempts_per_sec",
        op: ">",
        value: 200,
        weight: 0.5
      }
    ],
    hypotheses: [
      {
        id: "H_EXTERNAL_RECON",
        description: "External actor scanning ports to discover open services",
        signals: [
          {
            metric: "unique_dest_ports",
            op: ">",
            value: 100,
            weight: 0.7
          },
          {
            metric: "conn_attempts_per_sec",
            op: ">",
            value: 200,
            weight: 0.5
          }
        ],
        logPatterns: [
          {
            keyword: "port scan detected",
            weight: 0.3
          },
          {
            keyword: "reconnaissance",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "High rate of connection attempts to many ports observed on {device} (ports={unique_dest_ports}, rate={conn_attempts_per_sec}/s). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "port_scan"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce0d"
    },
    id: "security.policy_block",
    intent: "security",
    domain: "Security",
    function: "Policy",
    description: "Traffic blocked due to security policy",
    keywords: [
      "policy deny",
      "acl drop",
      "firewall block"
    ],
    signals: [
      {
        metric: "policy_denies",
        op: ">",
        value: 100,
        weight: 0.7
      }
    ],
    hypotheses: [
      {
        id: "H_MISCONFIGURED_RULE",
        description: "Overly restrictive or misconfigured security rule blocking legitimate traffic",
        signals: [
          {
            metric: "policy_denies",
            op: ">",
            value: 100,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "deny",
            weight: 0.3
          },
          {
            keyword: "dropped by policy",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Security device {device} is blocking a high volume of traffic (policy_denies={policy_denies}). This may impact legitimate flows. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "policy_block"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce0e"
    },
    id: "security.login_bruteforce",
    intent: "security",
    domain: "Security",
    function: "Authentication",
    description: "Multiple failed login attempts from same source",
    keywords: [
      "bruteforce",
      "login failure",
      "account attack"
    ],
    signals: [
      {
        metric: "auth_failures",
        op: ">",
        value: 50,
        weight: 0.7
      },
      {
        metric: "unique_usernames",
        op: ">",
        value: 5,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_PASSWORD_BRUTEFORCE",
        description: "Attacker attempting to guess passwords on multiple accounts",
        signals: [
          {
            metric: "auth_failures",
            op: ">",
            value: 50,
            weight: 0.7
          },
          {
            metric: "unique_usernames",
            op: ">",
            value: 5,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "invalid credentials",
            weight: 0.3
          },
          {
            keyword: "too many failed attempts",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Authentication system on {device} sees many failed logins (failures={auth_failures}, users={unique_usernames}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "login_bruteforce"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce0f"
    },
    id: "security.malware_detected",
    intent: "security",
    domain: "Security",
    function: "Detection",
    description: "Endpoint or network malware indicator detected",
    keywords: [
      "malware",
      "virus",
      "trojan",
      "endpoint alert"
    ],
    signals: [
      {
        metric: "malware_alerts",
        op: ">",
        value: 1,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_CONFIRMED_MALWARE",
        description: "Malware detected and classified by endpoint or IDS/IPS",
        signals: [
          {
            metric: "malware_alerts",
            op: ">",
            value: 1,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "malware detected",
            weight: 0.3
          },
          {
            keyword: "quarantined file",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Malware detection event raised for {device} (alerts={malware_alerts}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "malware_detected"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce10"
    },
    id: "platform.intent_ambiguous",
    intent: "platform",
    domain: "Platform",
    function: "Intent Quality",
    description: "User query maps to multiple low-confidence intents",
    keywords: [
      "ambiguous intent",
      "overlapping intents",
      "low confidence"
    ],
    signals: [
      {
        metric: "top_intent_score",
        op: "<",
        value: 0.6,
        weight: 0.7
      },
      {
        metric: "intent_score_gap",
        op: "<",
        value: 0.1,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_INTENT_OVERLAP",
        description: "Two or more intents modeled too similarly causing ambiguity",
        signals: [
          {
            metric: "top_intent_score",
            op: "<",
            value: 0.6,
            weight: 0.7
          },
          {
            metric: "intent_score_gap",
            op: "<",
            value: 0.1,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "multiple candidate intents",
            weight: 0.3
          },
          {
            keyword: "intent overlap",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Platform detected ambiguous mapping for input on {device}: top_intent_score={top_intent_score}, gap={intent_score_gap}. Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "intent_ambiguous"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce11"
    },
    id: "platform.correlation_missing",
    intent: "platform",
    domain: "Platform",
    function: "Correlation",
    description: "Correlator unable to link related events into a single situation",
    keywords: [
      "correlation gap",
      "uncorrelated alarms"
    ],
    signals: [
      {
        metric: "raw_events_clustered",
        op: "<",
        value: 2,
        weight: 0.6
      },
      {
        metric: "events_in_window",
        op: ">",
        value: 20,
        weight: 0.4
      }
    ],
    hypotheses: [
      {
        id: "H_TOPOLOGY_MISSING",
        description: "Missing or outdated topology/metadata causing correlation failure",
        signals: [
          {
            metric: "raw_events_clustered",
            op: "<",
            value: 2,
            weight: 0.6
          },
          {
            metric: "events_in_window",
            op: ">",
            value: 20,
            weight: 0.4
          }
        ],
        logPatterns: [
          {
            keyword: "no correlation rule matched",
            weight: 0.3
          },
          {
            keyword: "topology information missing",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Platform sees many raw events (events_in_window={events_in_window}) but few clusters (raw_events_clustered={raw_events_clustered}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "correlation_missing"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce12"
    },
    id: "platform.metric_gaps",
    intent: "platform",
    domain: "Platform",
    function: "Data Quality",
    description: "Significant gaps in metric ingestion for monitored resource",
    keywords: [
      "data gap",
      "missing metrics",
      "telemetry loss"
    ],
    signals: [
      {
        metric: "missing_points_percent",
        op: ">",
        value: 20,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_AGENT_OR_EXPORTER_DOWN",
        description: "Metric agent or exporter stopped sending data",
        signals: [
          {
            metric: "missing_points_percent",
            op: ">",
            value: 20,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "exporter timeout",
            weight: 0.3
          },
          {
            keyword: "scrape failed",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Metrics for {device} show data gaps (missing={missing_points_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "metric_gaps"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce13"
    },
    id: "platform.synthetic_probe_loss",
    intent: "platform",
    domain: "Platform",
    function: "Synthetic",
    description: "Synthetic transaction probes failing on a monitored path",
    keywords: [
      "synthetic failure",
      "probe fail",
      "transaction monitoring"
    ],
    signals: [
      {
        metric: "probe_success_rate",
        op: "<",
        value: 90,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_APP_OR_PATH_DEGRADED",
        description: "Application or path degradation detected via synthetic checks",
        signals: [
          {
            metric: "probe_success_rate",
            op: "<",
            value: 90,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "probe timeout",
            weight: 0.3
          },
          {
            keyword: "transaction failed",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Synthetic probes to {endpoint} are failing (success_rate={probe_success_rate}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "synthetic_probe_loss"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce14"
    },
    id: "thermal.chassis_hot",
    intent: "thermal",
    domain: "Facility",
    function: "Device Thermal",
    description: "Device chassis temperature above safe operating range",
    keywords: [
      "chassis hot",
      "overheat",
      "thermal alarm"
    ],
    signals: [
      {
        metric: "temp_c",
        op: ">",
        value: 70,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_AIRFLOW_BLOCKED",
        description: "Front or rear airflow blocked causing heat buildup",
        signals: [
          {
            metric: "temp_c",
            op: ">",
            value: 70,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "temperature alarm",
            weight: 0.3
          },
          {
            keyword: "over temperature",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Device {device} chassis temperature is high (temp_c={temp_c}°C). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "chassis_hot"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce15"
    },
    id: "thermal.room_hot",
    intent: "thermal",
    domain: "Facility",
    function: "Environmental Heat",
    description: "Room or rack inlet temperature above recommended levels",
    keywords: [
      "room hot",
      "rack hotspot",
      "environment heat"
    ],
    signals: [
      {
        metric: "inlet_temp_c",
        op: ">",
        value: 30,
        weight: 0.7
      }
    ],
    hypotheses: [
      {
        id: "H_HOTSPOT_IN_RACK",
        description: "Local hotspot in rack causing elevated inlet temperature",
        signals: [
          {
            metric: "inlet_temp_c",
            op: ">",
            value: 30,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "rack temperature high",
            weight: 0.3
          },
          {
            keyword: "hot aisle alarm",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Room or rack inlet temperature near {device} is high (inlet_temp_c={inlet_temp_c}°C). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "room_hot"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce16"
    },
    id: "cooling.crac_fault",
    intent: "cooling",
    domain: "Facility",
    function: "Cooling",
    description: "Cooling unit or CRAC reporting a fault condition",
    keywords: [
      "crac fault",
      "cooling failure",
      "hvac"
    ],
    signals: [
      {
        metric: "crac_status",
        op: "==",
        value: "fault",
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_CRAC_FAILED",
        description: "Cooling unit malfunction reducing cold air supply",
        signals: [
          {
            metric: "crac_status",
            op: "==",
            value: "fault",
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "CRAC fault",
            weight: 0.3
          },
          {
            keyword: "cooling failure",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Cooling system near {room} reports a fault (crac_status={crac_status}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "crac_fault"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce17"
    },
    id: "power.redundancy_lost",
    intent: "power",
    domain: "Facility",
    function: "Power",
    description: "Device is running on single power feed due to failure",
    keywords: [
      "power redundancy",
      "single supply",
      "psu failed"
    ],
    signals: [
      {
        metric: "psu_redundant",
        op: "==",
        value: 0,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_SINGLE_PSU_REMAINING",
        description: "One PSU or power feed has failed; device on single supply",
        signals: [
          {
            metric: "psu_redundant",
            op: "==",
            value: 0,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "power supply failed",
            weight: 0.3
          },
          {
            keyword: "running on single PSU",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Device {device} has lost power redundancy (psu_redundant={psu_redundant}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "redundancy_lost"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce18"
    },
    id: "storage.disk_iops_degraded",
    intent: "storage",
    domain: "Storage",
    function: "Disk Health",
    description: "Disk or LUN IOPS capability degraded",
    keywords: [
      "iops",
      "disk slow",
      "storage performance"
    ],
    signals: [
      {
        metric: "disk_iops",
        op: "<",
        value: 500,
        weight: 0.7
      },
      {
        metric: "disk_queue_depth",
        op: ">",
        value: 20,
        weight: 0.3
      }
    ],
    hypotheses: [
      {
        id: "H_BACKEND_CONTENTION",
        description: "Backend disk contention or failing disk slowing I/O",
        signals: [
          {
            metric: "disk_iops",
            op: "<",
            value: 500,
            weight: 0.7
          },
          {
            metric: "disk_queue_depth",
            op: ">",
            value: 20,
            weight: 0.3
          }
        ],
        logPatterns: [
          {
            keyword: "disk latency high",
            weight: 0.3
          },
          {
            keyword: "backend busy",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Storage for {volume} on {device} shows degraded IOPS (disk_iops={disk_iops}, qdepth={disk_queue_depth}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "disk_iops_degraded"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce19"
    },
    id: "storage.volume_near_full",
    intent: "storage",
    domain: "Storage",
    function: "Capacity",
    description: "Storage volume usage nearing full capacity",
    keywords: [
      "volume full",
      "low free space",
      "capacity"
    ],
    signals: [
      {
        metric: "volume_used_percent",
        op: ">",
        value: 90,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_LOG_OR_BACKUP_GROWTH",
        description: "Logs, backups or data growth filling the volume",
        signals: [
          {
            metric: "volume_used_percent",
            op: ">",
            value: 90,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "no space left",
            weight: 0.3
          },
          {
            keyword: "disk quota exceeded",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Volume {volume} on {device} is nearly full (used={volume_used_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "volume_near_full"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce1a"
    },
    id: "storage.snapshot_failures",
    intent: "storage",
    domain: "Storage",
    function: "Snapshot",
    description: "Repeated failures in taking storage snapshots",
    keywords: [
      "snapshot failed",
      "backup snapshot"
    ],
    signals: [
      {
        metric: "snapshot_failures",
        op: ">",
        value: 1,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_SNAPSHOT_CONFIG_OR_SPACE",
        description: "Snapshot misconfiguration or insufficient space",
        signals: [
          {
            metric: "snapshot_failures",
            op: ">",
            value: 1,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "snapshot failed",
            weight: 0.3
          },
          {
            keyword: "insufficient space",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Snapshot operations for {volume} on {device} are failing (snapshot_failures={snapshot_failures}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "snapshot_failures"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce1b"
    },
    id: "storage.latency_spike",
    intent: "storage",
    domain: "Storage",
    function: "IO Latency",
    description: "Spikes in storage I/O latency",
    keywords: [
      "io latency",
      "slow disk",
      "storage delay"
    ],
    signals: [
      {
        metric: "io_latency_ms",
        op: ">",
        value: 20,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_BACKEND_BUSY",
        description: "Backend array under heavy load causing latency",
        signals: [
          {
            metric: "io_latency_ms",
            op: ">",
            value: 20,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "I/O latency warning",
            weight: 0.3
          },
          {
            keyword: "backend busy",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "I/O latency for {volume} on {device} is high (io_latency_ms={io_latency_ms}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "latency_spike"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce1c"
    },
    id: "storage.replication_lag",
    intent: "storage",
    domain: "Storage",
    function: "Replication",
    description: "Storage replication lag exceeding threshold",
    keywords: [
      "replication delay",
      "async mirror",
      "lag"
    ],
    signals: [
      {
        metric: "replication_lag_sec",
        op: ">",
        value: 300,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_LINK_OR_TARGET_SLOW",
        description: "Replication link or target array is slow causing lag",
        signals: [
          {
            metric: "replication_lag_sec",
            op: ">",
            value: 300,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "replication behind",
            weight: 0.3
          },
          {
            keyword: "mirror out of sync",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Replication for {volume} is lagging (replication_lag_sec={replication_lag_sec}s). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "replication_lag"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce1d"
    },
    id: "db.down",
    intent: "db",
    domain: "Database",
    function: "Availability",
    description: "Database instance not reachable",
    keywords: [
      "database down",
      "connection refused"
    ],
    signals: [
      {
        metric: "db_up",
        op: "==",
        value: 0,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_DB_PROCESS_STOPPED",
        description: "Database process stopped or host unreachable",
        signals: [
          {
            metric: "db_up",
            op: "==",
            value: 0,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "could not connect",
            weight: 0.3
          },
          {
            keyword: "connection refused",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Database {db_name} on {device} is not reachable (db_up={db_up}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "down"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce1e"
    },
    id: "db.slow_queries",
    intent: "db",
    domain: "Database",
    function: "Query Performance",
    description: "Slow query rate above normal",
    keywords: [
      "slow query",
      "long running",
      "performance"
    ],
    signals: [
      {
        metric: "slow_queries_per_min",
        op: ">",
        value: 20,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_MISSING_INDEX_OR_PLAN",
        description: "Missing indexes or bad execution plan causing slow queries",
        signals: [
          {
            metric: "slow_queries_per_min",
            op: ">",
            value: 20,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "slow query",
            weight: 0.3
          },
          {
            keyword: "full table scan",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Database {db_name} shows high slow query rate (slow_queries_per_min={slow_queries_per_min}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "slow_queries"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce1f"
    },
    id: "db.replication_delay",
    intent: "db",
    domain: "Database",
    function: "Replication",
    description: "Database replication delay above threshold",
    keywords: [
      "replica lag",
      "replication delay"
    ],
    signals: [
      {
        metric: "db_replication_delay_sec",
        op: ">",
        value: 120,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_REPLICA_UNDERPOWERED",
        description: "Replica instance not able to keep up with primary write rate",
        signals: [
          {
            metric: "db_replication_delay_sec",
            op: ">",
            value: 120,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "replication delay",
            weight: 0.3
          },
          {
            keyword: "seconds behind master",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Database replication for {db_name} is delayed (db_replication_delay_sec={db_replication_delay_sec}s). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "replication_delay"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce20"
    },
    id: "db.tablespace_full",
    intent: "db",
    domain: "Database",
    function: "Capacity",
    description: "Database tablespace nearing full utilization",
    keywords: [
      "tablespace full",
      "db space",
      "segment growth"
    ],
    signals: [
      {
        metric: "tablespace_used_percent",
        op: ">",
        value: 90,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_TABLE_OR_INDEX_GROWTH",
        description: "Table or index growth filling tablespace",
        signals: [
          {
            metric: "tablespace_used_percent",
            op: ">",
            value: 90,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "unable to extend",
            weight: 0.3
          },
          {
            keyword: "no space left in tablespace",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Tablespace for {db_name} is nearly full (used={tablespace_used_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "tablespace_full"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce21"
    },
    id: "db.backup_failed",
    intent: "db",
    domain: "Database",
    function: "Backup",
    description: "Database backup job failure detected",
    keywords: [
      "backup failed",
      "db backup",
      "job error"
    ],
    signals: [
      {
        metric: "db_backup_success",
        op: "==",
        value: 0,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_BACKUP_JOB_OR_STORAGE_ISSUE",
        description: "Backup job misconfigured or target storage unavailable",
        signals: [
          {
            metric: "db_backup_success",
            op: "==",
            value: 0,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "backup job failed",
            weight: 0.3
          },
          {
            keyword: "cannot write backup",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Database backup for {db_name} failed (db_backup_success={db_backup_success}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "backup_failed"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce22"
    },
    id: "mq.queue_depth_high",
    intent: "mq",
    domain: "Middleware",
    function: "Queue Health",
    description: "Message queue depth above threshold",
    keywords: [
      "queue depth",
      "message backlog",
      "mq delay"
    ],
    signals: [
      {
        metric: "queue_depth",
        op: ">",
        value: 1000,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_CONSUMERS_SLOW_OR_DOWN",
        description: "Consumers not processing messages fast enough",
        signals: [
          {
            metric: "queue_depth",
            op: ">",
            value: 1000,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "consumer lagging",
            weight: 0.3
          },
          {
            keyword: "queue depth high",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Queue {queue} on {device} has high depth (queue_depth={queue_depth}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "queue_depth_high"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce23"
    },
    id: "mq.broker_unreachable",
    intent: "mq",
    domain: "Middleware",
    function: "Broker Health",
    description: "Message broker not reachable from clients",
    keywords: [
      "broker down",
      "mq unavailable"
    ],
    signals: [
      {
        metric: "broker_up",
        op: "==",
        value: 0,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_BROKER_PROCESS_OR_NETWORK",
        description: "Broker process down or network connectivity problem",
        signals: [
          {
            metric: "broker_up",
            op: "==",
            value: 0,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "connection refused",
            weight: 0.3
          },
          {
            keyword: "broker not responding",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Message broker {broker} is unreachable (broker_up={broker_up}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "broker_unreachable"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce24"
    },
    id: "txn.failure_rate_high",
    intent: "txn",
    domain: "Middleware",
    function: "Transaction Health",
    description: "Application transaction failure rate above normal",
    keywords: [
      "transaction failure",
      "error rate",
      "api errors"
    ],
    signals: [
      {
        metric: "txn_error_rate_percent",
        op: ">",
        value: 5,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_DOWNSTREAM_DEPENDENCY",
        description: "Downstream dependency or service causing transaction errors",
        signals: [
          {
            metric: "txn_error_rate_percent",
            op: ">",
            value: 5,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "500 Internal Server Error",
            weight: 0.3
          },
          {
            keyword: "timeout while calling",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Transaction failure rate for {service} is elevated (txn_error_rate_percent={txn_error_rate_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "failure_rate_high"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce25"
    },
    id: "lb.vip_down",
    intent: "lb",
    domain: "Load Balancer",
    function: "VIP Availability",
    description: "Virtual IP (VIP) not reachable",
    keywords: [
      "vip down",
      "virtual service down"
    ],
    signals: [
      {
        metric: "vip_up",
        op: "==",
        value: 0,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_ALL_POOL_MEMBERS_DOWN",
        description: "All backend pool members for this VIP are down",
        signals: [
          {
            metric: "vip_up",
            op: "==",
            value: 0,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "no available pool members",
            weight: 0.3
          },
          {
            keyword: "virtual server disabled",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Load balancer VIP {vip} on {device} is down (vip_up={vip_up}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "vip_down"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce26"
    },
    id: "lb.pool_members_down",
    intent: "lb",
    domain: "Load Balancer",
    function: "Pool Health",
    description: "Significant portion of pool members are down",
    keywords: [
      "pool member down",
      "health check failed"
    ],
    signals: [
      {
        metric: "pool_down_members_percent",
        op: ">",
        value: 50,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_BACKEND_SERVICE_OUTAGE",
        description: "Backend service failure affecting many pool members",
        signals: [
          {
            metric: "pool_down_members_percent",
            op: ">",
            value: 50,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "health check failed",
            weight: 0.3
          },
          {
            keyword: "pool member marked down",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Pool {pool} on {device} has many members down (pool_down_members_percent={pool_down_members_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "pool_members_down"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce27"
    },
    id: "lb.session_drop",
    intent: "lb",
    domain: "Load Balancer",
    function: "Session Quality",
    description: "Client sessions being dropped or reset unexpectedly",
    keywords: [
      "session reset",
      "connection reset",
      "lb drops"
    ],
    signals: [
      {
        metric: "session_resets_per_min",
        op: ">",
        value: 50,
        weight: 0.7
      }
    ],
    hypotheses: [
      {
        id: "H_IDLE_OR_TIMEOUT_MISCONFIG",
        description: "Session idle timeout or TCP settings causing resets",
        signals: [
          {
            metric: "session_resets_per_min",
            op: ">",
            value: 50,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "connection reset",
            weight: 0.3
          },
          {
            keyword: "idle timeout",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Load balancer {device} is resetting many sessions (session_resets_per_min={session_resets_per_min}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "session_drop"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce28"
    },
    id: "lb.ssl_error_rate",
    intent: "lb",
    domain: "Load Balancer",
    function: "SSL Health",
    description: "High rate of SSL/TLS handshake errors",
    keywords: [
      "ssl error",
      "tls handshake",
      "certificate"
    ],
    signals: [
      {
        metric: "ssl_handshake_errors_per_min",
        op: ">",
        value: 20,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_CERT_OR_CIPHER_MISMATCH",
        description: "Certificate issue or cipher mismatch causing handshake failures",
        signals: [
          {
            metric: "ssl_handshake_errors_per_min",
            op: ">",
            value: 20,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "handshake failure",
            weight: 0.3
          },
          {
            keyword: "unsupported protocol",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "SSL/TLS errors on {device} are elevated (ssl_handshake_errors_per_min={ssl_handshake_errors_per_min}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "ssl_error_rate"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce29"
    },
    id: "lb.misrouting",
    intent: "lb",
    domain: "Load Balancer",
    function: "Routing",
    description: "Traffic being routed to unexpected or wrong backend",
    keywords: [
      "wrong backend",
      "misrouting",
      "policy mismatch"
    ],
    signals: [
      {
        metric: "policy_mismatch_hits",
        op: ">",
        value: 10,
        weight: 0.7
      }
    ],
    hypotheses: [
      {
        id: "H_L7_RULE_MISCONFIG",
        description: "Incorrect L7 routing rule causing misrouted requests",
        signals: [
          {
            metric: "policy_mismatch_hits",
            op: ">",
            value: 10,
            weight: 0.7
          }
        ],
        logPatterns: [
          {
            keyword: "no matching policy",
            weight: 0.3
          },
          {
            keyword: "default pool used",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Load balancer {device} is misrouting some requests (policy_mismatch_hits={policy_mismatch_hits}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "misrouting"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce2a"
    },
    id: "sdwan.transport_degraded",
    intent: "sdwan",
    domain: "SD-WAN",
    function: "Transport Health",
    description: "Underlay transport showing high loss or latency",
    keywords: [
      "underlay loss",
      "transport degraded"
    ],
    signals: [
      {
        metric: "transport_latency_ms",
        op: ">",
        value: 100,
        weight: 0.6
      },
      {
        metric: "transport_loss_percent",
        op: ">",
        value: 2,
        weight: 0.4
      }
    ],
    hypotheses: [
      {
        id: "H_ISP_ISSUE",
        description: "ISP or underlay provider experiencing degradation",
        signals: [
          {
            metric: "transport_latency_ms",
            op: ">",
            value: 100,
            weight: 0.6
          },
          {
            metric: "transport_loss_percent",
            op: ">",
            value: 2,
            weight: 0.4
          }
        ],
        logPatterns: [
          {
            keyword: "underlay degraded",
            weight: 0.3
          },
          {
            keyword: "transport path issue",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "SD-WAN transport path for {site} is degraded (latency={transport_latency_ms} ms, loss={transport_loss_percent}%). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "transport_degraded"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce2b"
    },
    id: "sdwan.tunnel_flap",
    intent: "sdwan",
    domain: "SD-WAN",
    function: "Overlay Health",
    description: "SD-WAN overlay tunnel flapping between peers",
    keywords: [
      "tunnel down",
      "overlay flap"
    ],
    signals: [
      {
        metric: "tunnel_state_changes",
        op: ">",
        value: 3,
        weight: 0.8
      }
    ],
    hypotheses: [
      {
        id: "H_UNDERLAY_UNSTABLE",
        description: "Underlying transport instability causing tunnel flaps",
        signals: [
          {
            metric: "tunnel_state_changes",
            op: ">",
            value: 3,
            weight: 0.8
          }
        ],
        logPatterns: [
          {
            keyword: "tunnel down",
            weight: 0.3
          },
          {
            keyword: "keepalive failure",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "SD-WAN tunnel between {site} and {peer_site} is flapping (tunnel_state_changes={tunnel_state_changes}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "tunnel_flap"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce2c"
    },
    id: "sdwan.controller_unreachable",
    intent: "sdwan",
    domain: "SD-WAN",
    function: "Control Plane",
    description: "Edge device unable to reach SD-WAN controller",
    keywords: [
      "controller down",
      "orchestrator unreachable"
    ],
    signals: [
      {
        metric: "controller_up",
        op: "==",
        value: 0,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_CONTROLLER_OR_CONTROL_LINK",
        description: "Controller outage or control path connectivity issue",
        signals: [
          {
            metric: "controller_up",
            op: "==",
            value: 0,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "controller not reachable",
            weight: 0.3
          },
          {
            keyword: "control connection lost",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "SD-WAN edge {device} cannot reach controller (controller_up={controller_up}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "controller_unreachable"
  },
  {
    _id: {
      $oid: "693811d3a4cd14665b75ce2d"
    },
    id: "sdwan.branch_down",
    intent: "sdwan",
    domain: "SD-WAN",
    function: "Branch Connectivity",
    description: "Branch site unreachable over SD-WAN fabric",
    keywords: [
      "branch down",
      "site unreachable"
    ],
    signals: [
      {
        metric: "branch_reachable",
        op: "==",
        value: 0,
        weight: 0.9
      }
    ],
    hypotheses: [
      {
        id: "H_EDGE_DEVICE_OR_ACCESS_CIRCUIT",
        description: "Branch edge device down or access circuit failure",
        signals: [
          {
            metric: "branch_reachable",
            op: "==",
            value: 0,
            weight: 0.9
          }
        ],
        logPatterns: [
          {
            keyword: "site down",
            weight: 0.3
          },
          {
            keyword: "branch offline",
            weight: 0.3
          }
        ]
      }
    ],
    situationDesc: "Branch {site} is unreachable via SD-WAN (branch_reachable={branch_reachable}). Top hypothesis: {top_hypothesis} (score={prior}).",
    subIntent: "branch_down"
  }
];

// KB Categories for navigation
export const mockKBCategories = [
  {
    "id": "network",
    "name": "Network",
    "subcategories": [
      "Link Layer",
      "Routing",
      "Switching",
      "Performance",
      "WAN",
      "Wireless",
      "VPN",
      "Services",
      "MPLS",
      "Connectivity",
      "SD-WAN",
      "Load Balancer"
    ],
    "articleCount": 35
  },
  {
    "id": "compute",
    "name": "Compute",
    "subcategories": [
      "System",
      "Container",
      "Kubernetes",
      "Device Health",
      "Infrastructure",
      "Lifecycle",
      "Virtualization"
    ],
    "articleCount": 15
  },
  {
    "id": "application",
    "name": "Application",
    "subcategories": [
      "HTTP Errors",
      "Latency",
      "Resource Context",
      "Availability",
      "Throughput",
      "Job Processing",
      "User Experience",
      "Concurrency"
    ],
    "articleCount": 12
  },
  {
    "id": "database",
    "name": "Database",
    "subcategories": [
      "Availability",
      "Query Performance",
      "Replication",
      "Connection Pool",
      "Storage",
      "Locking",
      "Performance"
    ],
    "articleCount": 10
  },
  {
    "id": "storage",
    "name": "Storage",
    "subcategories": [
      "Disk Health",
      "Capacity",
      "Snapshots",
      "IO Latency",
      "Replication"
    ],
    "articleCount": 5
  },
  {
    "id": "security",
    "name": "Security",
    "subcategories": [
      "Threat Detection",
      "Policy",
      "IAM",
      "Authentication",
      "Network Security"
    ],
    "articleCount": 8
  },
  {
    "id": "platform",
    "name": "Platform",
    "subcategories": [
      "Observability Status",
      "Intent Quality",
      "Correlation",
      "Data Quality",
      "Dashboards",
      "Alerting"
    ],
    "articleCount": 10
  },
  {
    "id": "middleware",
    "name": "Middleware",
    "subcategories": [
      "Queue Health",
      "Broker Health",
      "Transaction Health",
      "Job Processing"
    ],
    "articleCount": 5
  },
  {
    "id": "facility",
    "name": "Facility",
    "subcategories": [
      "Thermal",
      "Power",
      "Cooling"
    ],
    "articleCount": 4
  }
];

export const mockKBArticlesEnhanced: KBArticle[] = [
  {
    "id": "kb-link-001",
    "title": "Why is an interface showing operationally down while administratively up?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": "### Overview\nWhy is an interface showing operationally down while administratively up?\n\n### Likely Causes\n- Physical cable disconnected or pulled\n- Optical SFP/QSFP module failed or absent\n- Loss of Signal (LOS) on fiber\n- Remote end shutdown or failed\n- Patch panel or cross-connect break\n\n### Observability Signals\n- oper_status == down, admin_status == up\n- DDM/DOM optical Rx power below threshold\n- LOS/LOF alarms on interface\n- SNMP ifOperStatus trap\n- Syslog: 'line protocol is down'\n\n### Recommended CLI Commands\nshow interface <int>\nshow interface <int> transceiver\nshow logging | inc down|LOS\nddm interface <int>\nshow inventory | inc <int>\n\n### Step-by-Step RCA\n1) Confirm admin_status=up, oper_status=down — rules out admin shutdown\n2) Check DDM optical Rx power — below -20 dBm indicates fiber/SFP fault\n3) Inspect cable and patch panel connection physically\n4) Swap SFP transceiver with known-good unit\n5) Test with alternate fiber strand or patch cable\n6) Check remote end interface for reciprocal down state\n\n### Related Tools\nDDM/DOM, SNMP traps, Syslog, OTDR",
    "problem": "Physical cable disconnected or pulled",
    "area": "Link Layer",
    "remedyItems": [
      "Replace faulty SFP/cable",
      "reconnect physical cable",
      "restore remote end interface",
      "repair fiber strand.",
      "Use certified optics",
      "maintain spare SFPs",
      "enable DDM threshold alerts",
      "deploy UDLD for fiber pair detection."
    ],
    "tags": [
      "link-down",
      "sfp",
      "los",
      "fiber",
      "cable",
      "oper-status"
    ],
    "linkedIntents": [
      "link.down"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-link-002",
    "title": "Why does an interface keep cycling up and down (flapping)?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": "### Overview\nWhy does an interface keep cycling up and down (flapping)?\n\n### Likely Causes\n- Loose or damaged patch cable causing intermittent contact\n- Auto-negotiation failing due to NIC or switch incompatibility\n- Speed/duplex mismatch between peers\n- Faulty SFP with marginal optical power\n- PoE brownout causing device reboot loop\n- Remote device restarting or rebooting\n\n### Observability Signals\n- flap_count > 3 in monitoring window\n- oper_changes_per_min > 1\n- Syslog repeated 'changed state to up/down'\n- Interface error counters incrementing each flap cycle\n- SNMP linkUp/linkDown trap storms\n\n### Recommended CLI Commands\nshow interface <int> | inc flap|change\nshow logging | inc 'changed state'\nshow interface <int> counters\nshow power inline <int>\nshow interface <int> transceiver\n\n### Step-by-Step RCA\n1) Count flap events and note interval pattern — periodic = likely power/PoE; random = cable/SFP\n2) Check syslog timestamp correlation with power events\n3) Inspect and reseat cable at both ends\n4) Test with known-good cable\n5) Check auto-negotiation: lock speed/duplex manually and observe\n6) If PoE device: check PoE budget and power draw per port\n\n### Related Tools\nSyslog, SNMP traps, PoE monitoring",
    "problem": "Loose or damaged patch cable causing intermittent contact",
    "area": "Link Layer",
    "remedyItems": [
      "Replace cable",
      "lock speed/duplex",
      "replace marginal SFP",
      "adjust PoE allocation",
      "update NIC firmware/driver.",
      "Enable carrier-delay timer to dampen flaps",
      "set link debounce",
      "use err-disable recovery with dampening."
    ],
    "tags": [
      "flap",
      "bouncing",
      "negotiation",
      "duplex",
      "poe",
      "cable"
    ],
    "linkedIntents": [
      "link.flap"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 90
  },
  {
    "id": "kb-link-003",
    "title": "CRC and input errors are increasing on an interface — what is causing this?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": "### Overview\nCRC and input errors are increasing on an interface — what is causing this?\n\n### Likely Causes\n- Defective patch cable or SFP transceiver\n- Duplex mismatch causing late collisions interpreted as CRC\n- EMI on unshielded copper cable\n- Marginal optical signal below Rx sensitivity\n- Egress queue overflow causing output discards\n- Oversubscribed uplink causing tail-drop\n\n### Observability Signals\n- in_errors > 100 per polling interval\n- out_discards > 100\n- CRC counter incrementing (show interface)\n- DDM Rx power below threshold\n- Late collisions > 0\n\n### Recommended CLI Commands\nshow interface <int> counters errors\nshow interface <int> | inc CRC|error|discard\nddm interface <int>\nshow platform hardware qfp drops\nshow policy-map interface <int>\n\n### Step-by-Step RCA\n1) Identify error type: CRC (physical), discards (congestion), late collisions (duplex)\n2) CRC errors: check DDM optical level; swap cable and SFP\n3) Late collisions: check duplex config on both ends\n4) Output discards: check interface utilization and QoS queue drops\n5) Correlate error timestamps with traffic bursts (NetFlow)\n6) Test on alternate port/path to isolate hardware vs path\n\n### Related Tools\nSNMP, NetFlow, DDM, Wireshark",
    "problem": "Defective patch cable or SFP transceiver",
    "area": "Link Layer",
    "remedyItems": [
      "Replace cable/SFP for CRC",
      "fix duplex mismatch",
      "tune QoS or add bandwidth for discards.",
      "Set SNMP threshold alerts on error counters",
      "use error-baseline alerts",
      "deploy certified optics."
    ],
    "tags": [
      "crc",
      "input-errors",
      "output-discards",
      "duplex",
      "sfp",
      "qos"
    ],
    "linkedIntents": [
      "link.high_errors"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 93
  },
  {
    "id": "kb-link-004",
    "title": "Interface shows high Rx errors but zero Tx errors — is this a unidirectional link?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": "### Overview\nInterface shows high Rx errors but zero Tx errors — is this a unidirectional link?\n\n### Likely Causes\n- One fiber strand in a pair broken or mispatched (Tx/Rx crossed)\n- Dirty or damaged fiber connector on receive strand only\n- Remote Tx SFP failed while local Tx is healthy\n- Fiber splice degraded on receive path\n- UDLD not configured to detect and shutdown the unidirectional port\n\n### Observability Signals\n- rx_errors > 100, tx_errors == 0\n- DDM Rx power critically low; Tx power normal\n- UDLD neighbor missing or unidirectional state\n- Remote device shows opposite error pattern\n- STP may be seeing topology changes due to one-way BPDUs\n\n### Recommended CLI Commands\nshow interface <int> | inc rx|tx|error\nshow interface <int> transceiver\nshow udld <int>\nshow udld neighbors\nping <remote_ip> — check if response returns\n\n### Step-by-Step RCA\n1) Confirm asymmetric error pattern: high rx_errors, zero tx_errors\n2) Check DDM Rx power on local interface — critically low confirms fiber strand issue\n3) Check remote device DDM Tx power — normal confirms remote Tx is healthy, local Rx fiber broken\n4) Inspect and clean fiber connector on Rx strand\n5) Test with alternate fiber patch; OTDR test on suspect strand\n6) Enable UDLD aggressive mode to auto-detect and shutdown unidirectional ports\n\n### Related Tools\nUDLD, DDM, OTDR, Syslog",
    "problem": "One fiber strand in a pair broken or mispatched (Tx/Rx crossed)",
    "area": "Link Layer",
    "remedyItems": [
      "Replace broken fiber strand",
      "clean Rx connector",
      "enable UDLD",
      "correct any Tx/Rx crossover in patch panel.",
      "Deploy UDLD globally on all fiber links",
      "monitor DDM Rx power per interface",
      "use OTDR after any fiber work."
    ],
    "tags": [
      "unidirectional",
      "fiber",
      "udld",
      "rx-errors",
      "los",
      "ddm"
    ],
    "linkedIntents": [
      "link.unidirectional"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-link-005",
    "title": "Interface shows late collisions and performance issues — could this be a duplex mismatch?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": "### Overview\nInterface shows late collisions and performance issues — could this be a duplex mismatch?\n\n### Likely Causes\n- Auto-negotiation failure between switch and NIC\n- One end hard-coded to full-duplex; other in half-duplex after autoneg\n- Older NIC not supporting 1G autoneg correctly\n- Speed mismatch: one end 100M, other 1G\n- Third-party SFP incompatibility causing negotiation failure\n\n### Observability Signals\n- collisions > 10 on interface\n- speed_mismatch_flag == 1\n- Late collisions incrementing (not early)\n- CRC errors on one side, no errors on other\n- Interface throughput far below rated capacity\n\n### Recommended CLI Commands\nshow interface <int> | inc duplex|speed|collision\nshow run interface <int> | inc duplex|speed\nshow interface <int> capabilities\nshow cdp neighbors <int> detail | inc duplex|Platform\n\n### Step-by-Step RCA\n1) Check duplex config: 'show interface' — look for half/full mismatch\n2) Compare both ends: CDP/LLDP shows peer duplex setting\n3) Look for late collisions (not early) — definitive duplex mismatch indicator\n4) Set both ends to explicit speed and duplex (no autoneg) temporarily\n5) If NIC-related: update NIC driver; force to full-duplex in OS NIC settings\n6) Replace SFP if third-party autoneg incompatibility suspected\n\n### Related Tools\nCDP, LLDP, SNMP, Syslog",
    "problem": "Auto-negotiation failure between switch and NIC",
    "area": "Link Layer",
    "remedyItems": [
      "Explicitly set speed and duplex on both ends",
      "update NIC driver",
      "replace incompatible SFP with vendor-certified module.",
      "Standardize on autoneg for all copper Ethernet",
      "explicitly set for known problem NIC models",
      "use CDP/LLDP to audit duplex mismatches."
    ],
    "tags": [
      "duplex-mismatch",
      "autoneg",
      "collisions",
      "speed",
      "nic",
      "sfp"
    ],
    "linkedIntents": [
      "link.duplex_mismatch"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-perf-001",
    "title": "Interface utilization is above 90% and queue drops are occurring — how to diagnose and resolve?",
    "category": "Network",
    "subcategory": "Performance",
    "content": "### Overview\nInterface utilization is above 90% and queue drops are occurring — how to diagnose and resolve?\n\n### Likely Causes\n- Traffic volume exceeding interface capacity\n- Backup or bulk transfer jobs flooding the link\n- QoS not prioritizing critical traffic — all in same queue\n- Incorrect shaping rate set below actual link capacity\n- Microbursts exceeding buffer depth causing tail-drop\n- Lack of WRED causing synchronized TCP backoff\n\n### Observability Signals\n- utilization_percent > 90\n- out_discards > 0\n- Queue depth at or near maximum\n- WRED drop statistics incrementing\n- NetFlow showing bulk/backup traffic consuming bandwidth\n\n### Recommended CLI Commands\nshow interface <int> | inc rate|utilization\nshow policy-map interface <int>\nshow queue <int>\nip nbar protocol-discovery interface <int>\nshow ip flow top-talkers\n\n### Step-by-Step RCA\n1) Identify top talker via NetFlow — is it backup, rsync, or unexpected flow?\n2) Check QoS policy: is critical traffic in LLQ/priority queue?\n3) Inspect queue depth and WRED discard statistics per class\n4) Verify interface shaping rate matches provisioned CIR\n5) Determine if issue is sustained (capacity) vs burst (buffering)\n6) For sustained: plan bandwidth upgrade or traffic engineering\n\n### Related Tools\nNetFlow, NBAR, SNMP, IPSLA",
    "problem": "Traffic volume exceeding interface capacity",
    "area": "Performance",
    "remedyItems": [
      "Implement QoS classification and priority queuing",
      "rate-limit bulk flows",
      "upgrade link capacity",
      "add WRED for TCP fairness.",
      "Set utilization alerts at 70%/85%",
      "deploy QoS before congestion occurs",
      "schedule backups during off-peak hours."
    ],
    "tags": [
      "congestion",
      "utilization",
      "queue-drops",
      "qos",
      "wred",
      "tail-drop",
      "backup"
    ],
    "linkedIntents": [
      "performance.congestion"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 90
  },
  {
    "id": "kb-perf-002",
    "title": "High jitter is impacting VoIP/RTP quality — what are the causes and remediation steps?",
    "category": "Network",
    "subcategory": "Performance",
    "content": "### Overview\nHigh jitter is impacting VoIP/RTP quality — what are the causes and remediation steps?\n\n### Likely Causes\n- Microbursts on shared WAN link causing transient queue delay\n- Missing or incorrect DSCP marking on RTP traffic\n- QoS LLQ bandwidth insufficient for voice load\n- WAN shaping Tc interval too long causing burst delay\n- Serialization delay on low-speed links\n- ISP upstream jitter on last-mile\n\n### Observability Signals\n- jitter_ms > 30 on IPSLA probes\n- packet_loss_percent > 1 on voice path\n- MOS score below 3.5\n- Voice queue showing drops\n- DSCP EF traffic not in priority queue\n\n### Recommended CLI Commands\nshow ip sla statistics\nshow policy-map interface <wan-int>\nshow ip sla summary\niperf3 -u -b 1M --dscp 46\nshow interface <int> | inc rate\n\n### Step-by-Step RCA\n1) Confirm jitter via IPSLA MOS probe — baseline vs current\n2) Check DSCP marking of RTP: 'show policy-map interface' — is EF in LLQ?\n3) Inspect LLQ bandwidth allocation vs active voice calls\n4) Check WAN utilization for microbursts using 30-sec polling intervals\n5) Test path with iperf3 UDP to measure jitter independently\n6) If WAN: check shaping Tc interval; reduce to 10ms for voice\n\n### Related Tools\nIPSLA/TWAMP, NetFlow, Wireshark, iperf3",
    "problem": "Microbursts on shared WAN link causing transient queue delay",
    "area": "Performance",
    "remedyItems": [
      "Enforce DSCP EF marking at voice edge",
      "increase LLQ bandwidth",
      "reduce shaping Tc interval",
      "engage ISP for last-mile SLA.",
      "Deploy IPSLA MOS probes for continuous voice quality monitoring",
      "set jitter alert at 20ms",
      "validate QoS post-change."
    ],
    "tags": [
      "jitter",
      "voip",
      "rtp",
      "mos",
      "qos",
      "dscp",
      "llq",
      "microburst"
    ],
    "linkedIntents": [
      "performance.jitter_high"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-routing-001",
    "title": "BGP session to a neighbor has gone down — what is the triage and recovery process?",
    "category": "Network",
    "subcategory": "Routing",
    "content": "### Overview\nBGP session to a neighbor has gone down — what is the triage and recovery process?\n\n### Likely Causes\n- Physical link failure on BGP peering interface\n- TCP session dropped due to MTU/MSS issue\n- Hold timer expired — CPU overload delayed keepalives\n- MD5 authentication key mismatch\n- Max-prefix limit reached causing notification and teardown\n- Remote peer restarted or reconfigured\n- ACL blocking BGP TCP port 179\n\n### Observability Signals\n- bgp_session_state == down\n- Syslog: BGP-5-ADJCHANGE neighbor down\n- BGP notification message type in logs\n- Prefix count near max-prefix threshold before teardown\n- Interface flap coinciding with BGP down event\n\n### Recommended CLI Commands\nshow bgp summary\nshow ip bgp neighbors <peer>\nshow logging | inc BGP|ADJCHANGE\nshow interface <peer-int> counters\nshow access-list | inc 179\nping <peer-ip> source <local-ip>\n\n### Step-by-Step RCA\n1) Check BGP notification type in syslog — HOLD_TIMER, CEASE, AUTH, MAX_PREFIX\n2) Verify TCP 179 reachability: 'telnet <peer> 179'\n3) Check interface errors for physical-layer cause\n4) Validate MD5 key matches on both sides\n5) Check prefix count vs max-prefix threshold\n6) Confirm CPU not overloaded — delayed keepalives cause hold timer expiry\n7) Check MTU: BGP OPEN packets must not be fragmented\n\n### Related Tools\nBGP logs, Syslog, BFD, SNMP, Packet capture",
    "problem": "Physical link failure on BGP peering interface",
    "area": "Routing",
    "remedyItems": [
      "Restore physical link",
      "fix MD5 key",
      "raise or reset max-prefix",
      "reduce CPU load",
      "fix MTU/MSS",
      "open TCP 179 in ACL.",
      "Set BFD for fast BGP failure detection",
      "configure max-prefix with restart-timer",
      "alert on BGP adj-change syslog."
    ],
    "tags": [
      "bgp-down",
      "neighbor-lost",
      "hold-timer",
      "md5",
      "max-prefix",
      "tcp-179"
    ],
    "linkedIntents": [
      "routing.bgp_down"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 90
  },
  {
    "id": "kb-routing-002",
    "title": "OSPF adjacency is repeatedly dropping and re-forming — what should I investigate?",
    "category": "Network",
    "subcategory": "Routing",
    "content": "### Overview\nOSPF adjacency is repeatedly dropping and re-forming — what should I investigate?\n\n### Likely Causes\n- Hello packets being dropped due to link congestion or loss\n- CPU overload causing OSPF process to miss hello transmission\n- Dead timer expired — hello interval too long vs dead timer\n- MTU mismatch causing DBD exchange failure after each reset\n- Authentication key rotation causing brief mismatch\n- BFD aggressiveness triggering spurious OSPF reset\n\n### Observability Signals\n- ospf_adj_changes > 3 in monitoring window\n- Syslog: LOST_ADJACENCY, Dead timer expired\n- Route instability (prefix flapping in routing table)\n- OSPF SPF re-runs increasing\n- CPU spikes coinciding with adjacency drops\n\n### Recommended CLI Commands\nshow ip ospf neighbor\nshow ip ospf statistics\nshow logging | inc OSPF|ADJCHANGE|Dead\nshow processes cpu | inc OSPF\nshow ip ospf interface <int>\n\n### Step-by-Step RCA\n1) Check syslog for LOST_ADJACENCY reason — dead timer vs auth vs MTU\n2) Review OSPF hello/dead timers: must match on both ends\n3) Correlate adj drops with CPU spikes — OSPF starved?\n4) Check interface error rates at time of flap — packet loss causing hello miss\n5) If BFD associated: check BFD timers vs link quality\n6) Verify MTU matches after each reset (EXSTARTÃ¢â€ â€™DOWN cycles = MTU issue)\n\n### Related Tools\nOSPF logs, Syslog, SNMP, BFD",
    "problem": "Hello packets being dropped due to link congestion or loss",
    "area": "Routing",
    "remedyItems": [
      "Align hello/dead timers",
      "reduce OSPF SPF throttle",
      "fix CPU overload",
      "resolve link loss",
      "set 'ip ospf mtu-ignore' as workaround for MTU.",
      "Set OSPF logging adjacency changes",
      "monitor adj-change count via SNMP",
      "use OSPF graceful restart (NSF)."
    ],
    "tags": [
      "ospf-flap",
      "adjacency",
      "hello-miss",
      "dead-timer",
      "cpu",
      "bfd"
    ],
    "linkedIntents": [
      "routing.ospf_flap"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-wan-001",
    "title": "Large packets are being fragmented or dropped on the WAN path — how to diagnose MTU mismatch?",
    "category": "Network",
    "subcategory": "WAN",
    "content": "### Overview\nLarge packets are being fragmented or dropped on the WAN path — how to diagnose MTU mismatch?\n\n### Likely Causes\n- WAN link MTU smaller than LAN MTU (e.g., PPPoE overhead reduces to 1492)\n- DF-bit set on large packets causing ICMP 'fragmentation needed' to be generated\n- ICMP type 3 code 4 being blocked by firewall — PMTUD black-hole\n- IPsec or GRE tunnel overhead reducing effective MTU\n- Provider enforcing lower MTU without notifying customer\n- Jumbo frames enabled on LAN side but not on WAN\n\n### Observability Signals\n- fragmented_packets > 100\n- icmp_frag_needed > 0 at WAN interface\n- Large transfers fail; small transfers succeed (classic PMTUD black-hole)\n- Ping with DF-bit and large size fails at specific size\n- TCP sessions establish but hang or terminate unexpectedly\n\n### Recommended CLI Commands\nping <dst> df-bit size 1472\nping <dst> df-bit size 1400\nshow interface <wan-int> | inc MTU\nshow ip tcp adjust-mss\ntraceroute <dst> (check for ICMP unreachable hops)\nshow ip traffic | inc frag\n\n### Step-by-Step RCA\n1) Test with 'ping df-bit size 1472' — if fails, find max working size by binary search\n2) Identify which hop drops the large packet via traceroute MTU discovery\n3) Check if ICMP type 3 code 4 is being blocked (firewall rule)\n4) Calculate correct MTU: WAN MTU minus tunnel overhead (GRE=24B, IPsec=50-70B)\n5) Apply TCP MSS clamping: 'ip tcp adjust-mss 1452' on WAN interface\n6) Set interface MTU to match WAN provider-enforced MTU\n\n### Related Tools\nPing (DF-bit), Traceroute, Wireshark, SNMP",
    "problem": "WAN link MTU smaller than LAN MTU (e.g., PPPoE overhead reduces to 1492)",
    "area": "WAN",
    "remedyItems": [
      "Set correct MTU on WAN interface",
      "apply TCP MSS clamping",
      "allow ICMP type 3 code 4 through firewall",
      "set tunnel interface MTU.",
      "Test PMTUD with DF-bit ping after any WAN change",
      "deploy MSS clamping as standard on all WAN interfaces."
    ],
    "tags": [
      "mtu",
      "fragmentation",
      "pmtud",
      "df-bit",
      "mss",
      "ipsec-overhead",
      "pppoe"
    ],
    "linkedIntents": [
      "wan.mtu_mismatch"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 89
  },
  {
    "id": "kb-wireless-001",
    "title": "Multiple wireless clients failing to authenticate to the SSID — how to diagnose?",
    "category": "Network",
    "subcategory": "Wireless",
    "content": "### Overview\nMultiple wireless clients failing to authenticate to the SSID — how to diagnose?\n\n### Likely Causes\n- RADIUS server unreachable from WLC/AP\n- EAP supplicant misconfiguration on client\n- Certificate expired on RADIUS or client\n- Shared secret mismatch between WLC and RADIUS\n- RADIUS server overloaded or out of licenses\n- 802.1X VLAN assignment attribute missing or incorrect\n- Client NIC driver issue with EAP method\n\n### Observability Signals\n- wifi_auth_failures > 20 on SSID\n- RADIUS Access-Reject rate increasing\n- EAP failure messages in WLC logs\n- RADIUS server not responding from WLC perspective\n- Specific EAP type failures (PEAP, EAP-TLS)\n\n### Recommended CLI Commands\nshow wireless client summary\nshow aaa servers\nshow radius statistics\nshow logging | inc EAP|RADIUS|auth\ntest aaa group <radius-group> <user> <pw>\nping <radius-ip> source <wlc-mgmt-ip>\n\n### Step-by-Step RCA\n1) Check RADIUS reachability: ping from WLC management IP to RADIUS server IP\n2) Review RADIUS statistics: Access-Request vs Accept vs Reject ratio\n3) Test AAA authentication: 'test aaa group' command\n4) Inspect WLC logs for specific EAP failure type\n5) Check RADIUS server logs for reject reason (wrong password, expired cert, no matching policy)\n6) Verify shared secret matches on WLC and RADIUS\n7) Check certificate expiry if EAP-TLS in use\n\n### Related Tools\nWLC logs, RADIUS logs, Syslog, Packet capture",
    "problem": "RADIUS server unreachable from WLC/AP",
    "area": "Wireless",
    "remedyItems": [
      "Restore RADIUS reachability",
      "fix shared secret",
      "renew expired certificate",
      "correct RADIUS policy",
      "add MAB fallback.",
      "Deploy redundant RADIUS",
      "monitor auth success rate",
      "set cert expiry alerts 60 days out",
      "test auth monthly."
    ],
    "tags": [
      "wireless",
      "802.1x",
      "eap",
      "radius",
      "auth-failure",
      "certificate",
      "wlc"
    ],
    "linkedIntents": [
      "wireless.client_auth_failure"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 92
  },
  {
    "id": "kb-system-001",
    "title": "Device CPU is sustained above 80% — what are the causes and how to remediate?",
    "category": "Compute",
    "subcategory": "CPU",
    "content": "### Overview\nDevice CPU is sustained above 80% — what are the causes and how to remediate?\n\n### Likely Causes\n- Runaway process or software bug consuming CPU\n- Control plane traffic flood (DDoS, misconfigured keep-alive)\n- Excessive SNMP polling rate\n- Routing protocol instability causing constant SPF/DUAL recalculation\n- Antivirus or security scan consuming CPU\n- Insufficient hardware for current load\n\n### Observability Signals\n- cpu_percent > 80 sustained for > 5 minutes\n- Top process consuming > 50% CPU\n- SNMP response latency increasing\n- CoPP drops indicating control-plane overload\n- System responsiveness degraded (SSH slow)\n\n### Recommended CLI Commands\nshow processes cpu sorted\nshow processes cpu history\nshow control-plane statistics\nshow logging | inc CPU|high\ntop (Linux host)\nps aux --sort=-%cpu (Linux host)\n\n### Step-by-Step RCA\n1) Identify top CPU-consuming process — is it expected?\n2) Check process trend: sudden spike or gradual growth?\n3) For network device: check CoPP drops — control-plane attack?\n4) For server: correlate with scheduled jobs, scans, or deployments\n5) Check routing protocol stability — OSPF/BGP reconvergence consuming CPU\n6) Review SNMP poll frequency — reduce if excessive\n\n### Related Tools\nSNMP, Syslog, top/ps, CoPP stats",
    "problem": "Runaway process or software bug consuming CPU",
    "area": "CPU",
    "remedyItems": [
      "Kill/restart runaway process",
      "enable CoPP",
      "reduce SNMP poll rate",
      "upgrade hardware",
      "fix routing instability.",
      "Set CPU alert at 70%",
      "enable CoPP on all network devices",
      "stagger SNMP polling",
      "monitor process CPU trend."
    ],
    "tags": [
      "cpu-high",
      "process",
      "copp",
      "control-plane",
      "snmp",
      "routing"
    ],
    "linkedIntents": [
      "system.cpu_high"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 87
  },
  {
    "id": "kb-system-002",
    "title": "Host shows short-duration CPU spikes — how to identify and manage transient CPU bursts?",
    "category": "Compute",
    "subcategory": "CPU",
    "content": "### Overview\nHost shows short-duration CPU spikes — how to identify and manage transient CPU bursts?\n\n### Likely Causes\n- Scheduled cron job or batch task running at peak\n- Backup agent starting a job\n- Log rotation or database maintenance task\n- Garbage collection in JVM/runtime\n- Compilation or software update running\n- Sudden burst of user requests hitting the host\n\n### Observability Signals\n- cpu_percent > 90 for < 2 minutes, then recovering\n- cpu_load_1min > 4 during spike\n- Correlation with cron schedule time\n- Application latency spike coinciding with CPU burst\n- No sustained high CPU between spikes\n\n### Recommended CLI Commands\ntop -b -n 1 (Linux)\nps aux --sort=-%cpu | head -10\ncrontab -l; cat /etc/cron.d/*\nsar -u 1 60 (Linux sar)\njstat -gcutil <pid> (JVM GC check)\nshow processes cpu history (network device)\n\n### Step-by-Step RCA\n1) Capture process list during spike: 'top -b' or 'ps aux'\n2) Correlate spike timestamp with cron schedule\n3) Check for JVM GC: frequent full GC causes CPU spikes\n4) Review backup agent logs for job start times\n5) If user-driven: analyze request rate at spike time\n6) Determine if spike causes application SLA breach\n\n### Related Tools\nsar, top, cron logs, APM, JVM metrics",
    "problem": "Scheduled cron job or batch task running at peak",
    "area": "CPU",
    "remedyItems": [
      "Reschedule batch jobs to off-peak",
      "tune JVM GC settings",
      "increase instance size",
      "implement autoscaling for burst.",
      "Stagger scheduled jobs",
      "monitor with 1-min CPU polling",
      "set spike alert with minimum duration (avoid noise)."
    ],
    "tags": [
      "cpu-spike",
      "cron",
      "batch-job",
      "jvm-gc",
      "burst",
      "load"
    ],
    "linkedIntents": [
      "system.cpu_spike"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 90
  },
  {
    "id": "kb-system-003",
    "title": "Host memory utilization is above 80% — what to investigate?",
    "category": "Compute",
    "subcategory": "Memory",
    "content": "### Overview\nHost memory utilization is above 80% — what to investigate?\n\n### Likely Causes\n- Too many processes running in parallel exceeding RAM\n- Application not releasing memory (early-stage leak)\n- OS page cache consuming memory (often benign)\n- Large dataset loaded into memory by application\n- Container/VM not resource-bounded\n- Memory over-provisioning on hypervisor\n\n### Observability Signals\n- mem_percent > 80 sustained\n- Swap utilization increasing\n- OOM killer events in kernel logs\n- Application latency increasing with memory pressure\n- High page-fault rate\n\n### Recommended CLI Commands\nfree -m (Linux)\ncat /proc/meminfo\nps aux --sort=-%mem | head -10\nvmstat 1 10\nkill -0 <pid> (check OOM events)\njournalctl -k | grep -i 'oom\\|killed'\n\n### Step-by-Step RCA\n1) Check if OS page cache is inflating memory — 'free -m' available column\n2) Identify top memory consumers: 'ps aux --sort=-%mem'\n3) Check swap usage and page-in/out rate (vmstat)\n4) Look for OOM killer events in kernel log\n5) Check if memory is growing over time (leak) or stable at high level\n6) Correlate with application load — is this expected for current user count?\n\n### Related Tools\nvmstat, free, journalctl, SNMP",
    "problem": "Too many processes running in parallel exceeding RAM",
    "area": "Memory",
    "remedyItems": [
      "Increase RAM",
      "reduce concurrent processes",
      "tune application memory limits",
      "expand swap as temporary measure",
      "restart leaking process."
    ],
    "tags": [
      "memory-high",
      "oom",
      "swap",
      "page-fault",
      "ram",
      "pressure"
    ],
    "linkedIntents": [
      "system.memory_high"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 98
  },
  {
    "id": "kb-system-004",
    "title": "Memory usage is steadily growing over time — how to confirm and address a memory leak?",
    "category": "Compute",
    "subcategory": "Memory",
    "content": "### Overview\nMemory usage is steadily growing over time — how to confirm and address a memory leak?\n\n### Likely Causes\n- Application not freeing heap memory after use\n- Native library (C/C++) leaking without JVM visibility\n- Connection pool or thread pool growing without bounds\n- Cache growing without eviction policy\n- File descriptors or sockets not closed properly\n- Third-party library bug\n\n### Observability Signals\n- mem_percent > 85 and growing\n- mem_trend_1h > 10% per hour\n- Process RSS memory growing monotonically\n- OutOfMemoryError in application logs\n- Process requires periodic restart to recover memory\n\n### Recommended CLI Commands\nps -o pid,rss,vsz,comm -p <pid>\ncat /proc/<pid>/status | grep VmRSS\nvalgrind --leak-check=full <binary> (C/C++)\njmap -heap <pid> (JVM)\njstack <pid> (JVM thread dump)\npmap -d <pid> (memory map)\n\n### Step-by-Step RCA\n1) Confirm leak: plot RSS memory over 24h — linear growth = leak\n2) Compare mem_trend_1h with load — growing even when load is flat = leak\n3) For JVM: use 'jmap -heap' and heap dump for analysis\n4) For native: use Valgrind or AddressSanitizer\n5) Correlate leak rate with specific code paths (connection open, request handling)\n6) Identify last code change before leak started\n\n### Related Tools\njmap, Valgrind, pmap, APM heap profiler",
    "problem": "Application not freeing heap memory after use",
    "area": "Memory",
    "remedyItems": [
      "Apply code fix or vendor patch",
      "implement periodic restart as emergency",
      "add heap dump trigger on OOM",
      "rollback to previous version."
    ],
    "tags": [
      "memory-leak",
      "heap",
      "rss",
      "oom",
      "jvm",
      "valgrind",
      "cache"
    ],
    "linkedIntents": [
      "system.memory_leak_suspected"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-system-005",
    "title": "A system service has crashed or stopped unexpectedly — how to recover and prevent recurrence?",
    "category": "Compute",
    "subcategory": "OS Services",
    "content": "### Overview\nA system service has crashed or stopped unexpectedly — how to recover and prevent recurrence?\n\n### Likely Causes\n- Service process crashed due to unhandled exception\n- Service stopped by administrator manually\n- OOM killer terminated the service process\n- Dependency service failure causing cascading stop\n- System reboot without service enabled at boot\n- Resource limit (file descriptors, threads) reached\n\n### Observability Signals\n- service_up == 0\n- Systemd unit state: 'failed' or 'inactive'\n- Kernel logs: 'oom-kill' for service process\n- Missing heartbeats in monitoring system\n- Application error: 'connection refused' to service port\n\n### Recommended CLI Commands\nsystemctl status <service>\njournalctl -u <service> -n 100\nsystemctl list-units --failed\ndmesg | grep -i 'oom\\|killed'\nls /var/crash/\ncat /proc/sys/fs/file-nr (check system file descriptors)\n\n### Step-by-Step RCA\n1) Check service status: 'systemctl status <service>'\n2) Review service logs: 'journalctl -u <service>' — look for exit code and error\n3) Check for OOM kill: 'dmesg' or 'journalctl -k'\n4) Inspect crash dump if available in /var/crash/\n5) Check dependencies: 'systemctl list-dependencies <service>'\n6) Verify auto-restart policy: 'Restart=always' in systemd unit file\n\n### Related Tools\nsystemd, journalctl, dmesg, uptime",
    "problem": "Service process crashed due to unhandled exception",
    "area": "OS Services",
    "remedyItems": [
      "Restart service",
      "fix config error",
      "increase resource limits",
      "set systemd auto-restart",
      "restore dependency service.",
      "Monitor service status continuously",
      "configure systemd 'Restart=always' with delay",
      "alert on 'unit failed' state."
    ],
    "tags": [
      "service-crash",
      "systemd",
      "failed-unit",
      "oom-kill",
      "process-down",
      "availability"
    ],
    "linkedIntents": [
      "system.service_down"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 96
  },
  {
    "id": "kb-system-006",
    "title": "A container is stuck in a restart loop (CrashLoopBackOff) — how to diagnose the cause?",
    "category": "Compute",
    "subcategory": "Containers",
    "content": "### Overview\nA container is stuck in a restart loop (CrashLoopBackOff) — how to diagnose the cause?\n\n### Likely Causes\n- Application crashing on startup (config error, missing DB)\n- Liveness probe failing and killing the container\n- OOM kill due to insufficient memory limit in Pod spec\n- Permission denied on volume mount\n- Environment variable missing or incorrect\n- Entrypoint script error or missing file\n\n### Observability Signals\n- pod_restarts > 5 in 10 minutes\n- Pod state: CrashLoopBackOff\n- Last state: Terminated with Exit Code != 0\n- Container logs showing error and then stopping\n- K8s events: 'Back-off restarting failed container'\n\n### Recommended CLI Commands\nkubectl get pods\nkubectl describe pod <pod>\nkubectl logs <pod> --previous\nkubectl get events --sort-by=.metadata.creationTimestamp\nkubectl top pod <pod>\n\n### Step-by-Step RCA\n1) Identify pod status: 'kubectl get pods' — look for restarts count\n2) Check last exit code: 'kubectl describe pod' — exit code 137 (OOM), 1 (App error), 127 (File not found)\n3) Read previous logs: 'kubectl logs <pod> --previous' to see why it crashed\n4) Check events: 'kubectl get events' for liveness probe failures or volume issues\n5) Compare resource limits vs actual usage during startup\n6) Validate environment variables and secrets are correctly mapped\n\n### Related Tools\nkubectl, Prometheus, K8s events, container logs",
    "problem": "Application crashing on startup (config error, missing DB)",
    "area": "Containers",
    "remedyItems": [
      "Fix application config",
      "increase memory limit",
      "fix liveness probe",
      "fix volume permissions",
      "update image tag.",
      "Set alert on pod restart rate",
      "use 'kubectl logs --previous' in CI/CD pipeline tests",
      "monitor OOM events per namespace."
    ],
    "tags": [
      "crashloop",
      "kubernetes",
      "container-restart",
      "oom-kill",
      "exit-code-137",
      "liveness-probe"
    ],
    "linkedIntents": [
      "system.container_restart_loop"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 92
  },
  {
    "id": "kb-system-007",
    "title": "Disk I/O wait is high on a host — how to identify the process causing disk contention?",
    "category": "Compute",
    "subcategory": "OS Services",
    "content": "### Overview\nDisk I/O wait is high on a host — how to identify the process causing disk contention?\n\n### Likely Causes\n- High volume of log writing from an application\n- Database performing a full table scan or heavy checkpoint\n- Backup or virus scan running on local disk\n- Failing disk causing multiple retries and slow I/O\n- Swapping due to memory pressure\n- Parallel downloads or large file copies\n\n### Observability Signals\n- iowait_percent > 20\n- disk_util_percent > 80 (from iostat)\n- System load high but CPU idle percent also high (blocked on I/O)\n- Application latency increasing for disk-bound operations\n- dmesg showing disk I/O errors or timeouts\n\n### Recommended CLI Commands\niostat -xz 1 10\niotop -o (Linux: see which process is doing I/O)\nps aux | awk '{if ($8==\"D\") print $0}' (process in Uninterruptible Sleep)\nvmstat 1 10 (check bi and bo columns)\nsar -d 1 10\nlsof -p <pid> (see what files a process has open)\n\n### Step-by-Step RCA\n1) Confirm I/O wait: 'top' or 'vmstat' — look for 'wa' or 'b' column\n2) Identify top I/O process: 'iotop -o' (sorted by current I/O)\n3) Identify processes in 'D' state (waiting for I/O): 'ps aux | grep \" D \"'\n4) Check disk health if wait is high but utilization is low — 'smartctl' or 'dmesg'\n5) Correlate with concurrent tasks: backups, scans, DB cron\n6) If swapping: resolve memory pressure first to stop swap I/O\n\n### Related Tools\niostat, iotop, vmstat, sar, smartctl",
    "problem": "High volume of log writing from an application",
    "area": "OS Services",
    "remedyItems": [
      "Reduce logging level",
      "optimize DB query",
      "reschedule backup",
      "replace failing disk",
      "increase RAM to stop swapping.",
      "Alert on iowait > 15%",
      "use SSD for high-I/O app data",
      "monitor iotop metrics via exporter."
    ],
    "tags": [
      "iowait",
      "disk-contention",
      "iotop",
      "swapping",
      "io-limit",
      "disk-utilization"
    ],
    "linkedIntents": [
      "system.disk_iowait_high"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-security-001",
    "title": "A high-severity firewall block event has been detected — is this a true positive or misconfiguration?",
    "category": "Security",
    "subcategory": "Policy",
    "content": "### Overview\nA high-severity firewall block event has been detected — is this a true positive or misconfiguration?\n\n### Likely Causes\n- External reconnaissance or exploit attempt (True Positive)\n- Recent application change using new port not in ACL\n- DNS/NTP traffic being blocked due to missing rule\n- Malicious internal host scanning the network\n- Load balancer health check blocked by firewall\n\n### Observability Signals\n- security_events_count > 10 in 1 minute\n- Firewall logs showing 'Deny' or 'Block' for critical service\n- Application failing to connect to specific destination\n- Destination IP matches known malicious list (threat intel)\n- Source IP is internal but performing unusual port scanning\n\n### Recommended CLI Commands\nshow logging | inc Deny|Block\nshow access-list | inc <ip>\ntest tail-f /var/log/firewall.log | grep <source_ip>\ncheck threat intel API for source IP reputation\ncurl -v telnet://<dst_ip>:<port> (test connectivity)\n\n### Step-by-Step RCA\n1) Identify source/destination IP and port from firewall logs\n2) Check threat intel: is source IP known malicious? If yes: security incident\n3) If source is internal: was there a recent app deployment or change?\n4) Verify ACL: does a rule explicitly allow this port? If no: config issue\n5) Look for scanning pattern: many blocks from one source to many destinations\n6) Check load balancer/proxy nodes — are their probes being blocked?\n\n### Related Tools\nFirewall logs, SIEM, threat intelligence, Nmap",
    "problem": "External reconnaissance or exploit attempt (True Positive)",
    "area": "Policy",
    "remedyItems": [
      "Block malicious source IP at edge",
      "update firewall ACL for legitimate app",
      "isolate internal infected host",
      "fix load balancer probe rule.",
      "Enable 'log' on all deny rules",
      "alert on high-rate deny from single IP",
      "automated threat-intel feed integration."
    ],
    "tags": [
      "firewall-block",
      "access-denied",
      "security-policy",
      "reconnaissance",
      "threat-intel",
      "acl"
    ],
    "linkedIntents": [
      "security.policy_block"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 96
  },
  {
    "id": "kb-security-002",
    "title": "An internal host is generating excessive port scans — how to isolate and remediate?",
    "category": "Security",
    "subcategory": "Threat",
    "content": "### Overview\nAn internal host is generating excessive port scans — how to isolate and remediate?\n\n### Likely Causes\n- Malware infection on host performing lateral movement\n- Compromised user account running scanner\n- Vulnerability scanner (authorized) not scheduled correctly\n- Misconfigured application probing multiple ports on a server\n- Attacker controlled machine on internal network\n\n### Observability Signals\n- scan_events_count > 100 per minute from single source\n- Firewall logs showing many 'Deny' to various ports\n- SIEM alert for 'Port Scanning behavior detected'\n- Source host CPU utilization high (running scanner)\n- Unusual outbound connections from host\n\n### Recommended CLI Commands\nshow access-list | inc <source_ip>\ntcpdump -i <int> src <source_ip>\nps aux (on source host if accessible)\nnetstat -ant (on source host)\ncheck corporate security dashboard for host alerts\n\n### Step-by-Step RCA\n1) Confirm if host isauthorized scanner (Qualys, Nessus, Rapid7)\n2) If not authorized: isolate host from network (quarantine VLAN or port shut)\n3) Scan isolated host for malware and persistence\n4) Review host logs for recent login events or service changes\n5) Identify initial infection vector (phishing, exploit, USB)\n6) Clean host or re-image before restoring access\n\n### Related Tools\nSIEM, EDR, IDS/IPS, Nmap, firewall logs",
    "problem": "Malware infection on host performing lateral movement",
    "area": "Threat",
    "remedyItems": [
      "Isolate host from network",
      "kill malicious process",
      "re-image host",
      "revoke compromised credentials.",
      "Deploy internal firewall (Microsegmentation)",
      "enable port-security on switches",
      "limit authorized scanners to specific times."
    ],
    "tags": [
      "port-scan",
      "malware",
      "security-threat",
      "lateral-movement",
      "quarantine",
      "ids"
    ],
    "linkedIntents": [
      "security.internal_scan"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-security-003",
    "title": "Infrastructure was accessed from an unusual geographic location — is this a compromised account?",
    "category": "Security",
    "subcategory": "Authentication",
    "content": "### Overview\nInfrastructure was accessed from an unusual geographic location — is this a compromised account?\n\n### Likely Causes\n- User account credentials compromised and used by remote attacker (Geo-hop)\n- Legitimate user traveling or using a VPN\n- Service account key leaked and used from unexpected location\n- Shared credentials being used by offshore contractors\n- Botnet attempt to use stolen session cookies\n\n### Observability Signals\n- login_geo_mismatch == 1\n- Distance between two logins > speed of travel (impossible travel)\n- IP address belongs to unexpected country or anonymous proxy/exit node\n- Login time is atypical for the user\n- Successful login followed by unusual privilege escalation attempt\n\n### Recommended CLI Commands\nlast -n 20 (Linux: last login list)\ncheck audit log: search for 'Successful login' and 'source_ip'\ngeoip lookup for source IP\ncheck user traveling status (HR/Calendar)\nreview recent API token or password changes for the user\n\n### Step-by-Step RCA\n1) Identify user and geographic location of the alert\n2) Check user travel status — is this a legitimate trip/VPN usage?\n3) Compare current login with history — is this a new country/IP for this user?\n4) Check for 'impossible travel' alerts (e.g. login from NYC then London 1h later)\n5) Conduct user verification (OOB contact) to confirm they performed login\n6) If unauthorized: revoke session, reset password/MFA, and begin IR process\n\n### Related Tools\nSIEM, Identity provider logs, GeoIP database, CASB",
    "problem": "User account credentials compromised and used by remote attacker (Geo-hop)",
    "area": "Authentication",
    "remedyItems": [
      "Disable account",
      "revoke active sessions",
      "reset password",
      "enforce MFA",
      "block IP in firewall.",
      "Enforce MFA for all logins",
      "implement geo-fencing in IDP",
      "alert on impossible travel patterns."
    ],
    "tags": [
      "geo-location",
      "account-compromise",
      "login-security",
      "impossible-travel",
      "mfa",
      "authentication"
    ],
    "linkedIntents": [
      "security.geo_anomaly"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-security-004",
    "title": "High volume of failed login attempts detected — brute-force attack triage process?",
    "category": "Security",
    "subcategory": "Authentication",
    "content": "### Overview\nHigh volume of failed login attempts detected — brute-force attack triage process?\n\n### Likely Causes\n- External attacker attempting brute-force or credential stuffing\n- Internal automated script with expired or wrong password\n- User password expired but not updated on all devices (mobile/desktop sync)\n- Service account password changed but not updated in config/code\n- Misconfigured application repeatedly trying to authenticate with old creds\n\n### Observability Signals\n- auth_failures_per_min > 50 from single source\n- Target account(s) being locked out automatically\n- Syslog: 'Failed password for <user> from <ip>'\n- Multiple different usernames tried from same IP (credential stuffing)\n- High latency in authentication service due to load\n\n### Recommended CLI Commands\nlastb | head -20 (Linux: see failed logins)\ngrep 'Failed password' /var/log/auth.log | awk '{print $NF}' | sort | uniq -c | sort -nr\nshow logging | inc 'Auth fail'\ncheck account lock status on local system or IDP\ncheck source IP in firewall logs\n\n### Step-by-Step RCA\n1) Identify if source IP is external or internal\n2) Check usernames being targeted: single user (brute-force) or many users (stuffing)?\n3) Correlate with recent password change events — is it a service account or user?\n4) Check if source IP is on a known malicious list (Tor, proxy, scanner)\n5) If internal: trace IP to specific host and check for running scripts/apps\n6) If external: block IP address and consider global account lockout threshold tuning\n\n### Related Tools\nSIEM, auth logs, fail2ban, firewall, IDP console",
    "problem": "External attacker attempting brute-force or credential stuffing",
    "area": "Authentication",
    "remedyItems": [
      "Block source IP",
      "lock targeted accounts",
      "force password reset",
      "deploy/update fail2ban",
      "enable MFA",
      "alert security team.",
      "Deploy MFA",
      "set account lockout after 5 failures",
      "enable geo-blocking",
      "use SIEM for brute-force detection rules."
    ],
    "tags": [
      "bruteforce",
      "credential-stuffing",
      "password-spray",
      "auth-failure",
      "mfa",
      "lockout",
      "siem"
    ],
    "linkedIntents": [
      "security.login_bruteforce"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-security-005",
    "title": "Endpoint or network IDS has raised a malware detection alert — what is the response process?",
    "category": "Security",
    "subcategory": "Detection",
    "content": "### Overview\nEndpoint or network IDS has raised a malware detection alert — what is the response process?\n\n### Likely Causes\n- Malicious file executed from email attachment or download\n- Drive-by web exploit delivering payload\n- Lateral movement from already-compromised host\n- USB/removable media infection\n- Supply chain compromise (malicious software update)\n- Living-off-the-land attack using legitimate OS tools\n\n### Observability Signals\n- malware_alerts > 1 from endpoint AV or IDS/IPS\n- Quarantined file detected\n- Unusual outbound C2 connections\n- Lateral movement indicators (unusual SMB, RDP, WMI activity)\n- Registry or scheduled task creation by unknown process\n\n### Recommended CLI Commands\nGet-MpThreatDetection (Windows Defender)\nclamscan -r /home --bell (Linux ClamAV)\nnetstat -anb (check C2 connections)\nps aux | grep -v grep (unusual processes)\nautoruns.exe (Windows startup persistence)\nwireshark (capture C2 traffic pattern)\n\n### Step-by-Step RCA\n1) Isolate affected host from network immediately — contain blast radius\n2) Preserve memory and disk image before remediation\n3) Identify malware family from AV signature or hash (VirusTotal)\n4) Check for persistence: scheduled tasks, registry run keys, cron\n5) Hunt for lateral movement: check logs on nearby hosts\n6) Identify initial infection vector (email, download, USB, supply chain)\n7) Escalate to incident response team\n\n### Related Tools\nEDR, AV, SIEM, VirusTotal, Wireshark, forensic tools",
    "problem": "Malicious file executed from email attachment or download",
    "area": "Detection",
    "remedyItems": [
      "Isolate host",
      "collect forensic image",
      "wipe and reimage",
      "restore from clean backup",
      "revoke credentials used by compromised host.",
      "Deploy EDR",
      "enable application whitelisting",
      "block USB",
      "enforce email sandboxing",
      "train users on phishing."
    ],
    "tags": [
      "malware",
      "endpoint",
      "quarantine",
      "c2",
      "lateral-movement",
      "edr",
      "incident-response"
    ],
    "linkedIntents": [
      "security.malware_detected"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 96
  },
  {
    "id": "kb-platform-001",
    "title": "The RCA engine is returning low-confidence intent matches — how to resolve ambiguous intent mapping?",
    "category": "Platform",
    "subcategory": "Intent Quality",
    "content": "### Overview\nThe RCA engine is returning low-confidence intent matches — how to resolve ambiguous intent mapping?\n\n### Likely Causes\n- Two or more intents modeled with overlapping signals and keywords\n- Insufficient signal diversity to distinguish between similar failure types\n- Missing telemetry data leaving key discriminating metrics empty\n- Intent trained on insufficient or unbalanced examples\n- Signal weights not differentiated enough between competing intents\n\n### Observability Signals\n- top_intent_score < 0.6\n- intent_score_gap < 0.1 between top-2 intents\n- Multiple candidate intents in result\n- High volume of 'unknown.low_confidence' fallbacks\n- Operator overriding engine classification frequently\n\n### Recommended CLI Commands\nReview intent signal definitions in adminData.ts\nCheck keyword overlap between competing intents\nRun test case against classification engine\nReview false-positive rate per intent\nAnalyze operator feedback and manual overrides\n\n### Step-by-Step RCA\n1) Identify which intent pair is conflicting from ambiguity logs\n2) Compare signal definitions — do they share the same metrics with similar thresholds?\n3) Add discriminating signals unique to each intent\n4) Increase weight difference for key discriminating signals\n5) Add negative examples to training if ML-based\n6) Add intent-specific keywords that don't overlap\n\n### Related Tools\nIntent engine logs, KB admin console, classification test harness",
    "problem": "Two or more intents modeled with overlapping signals and keywords",
    "area": "Intent Quality",
    "remedyItems": [
      "Refine intent signal thresholds",
      "add discriminating metrics",
      "increase weight separation",
      "remove overlapping keywords",
      "retrain or retest.",
      "Run intent collision test suite after each KB update",
      "monitor intent_score_gap distribution",
      "set alert when ambiguity rate exceeds 5%."
    ],
    "tags": [
      "intent-ambiguous",
      "low-confidence",
      "intent-overlap",
      "signal-weights",
      "classification"
    ],
    "linkedIntents": [
      "platform.intent_ambiguous"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-platform-002",
    "title": "Many raw alarms are firing but the correlator is not grouping them into situations — why?",
    "category": "Platform",
    "subcategory": "Correlation",
    "content": "### Overview\nMany raw alarms are firing but the correlator is not grouping them into situations — why?\n\n### Likely Causes\n- Topology metadata missing or stale — correlator cannot link events to common parent\n- Correlation rules not covering new device types or link types\n- Time synchronization issue causing events outside correlation window\n- Events from different domains not sharing common entity reference\n- Correlator rule thresholds set too conservatively\n\n### Observability Signals\n- raw_events_clustered < 2 in correlation window\n- events_in_window > 20 uncorrelated\n- Situation count far below expected during known outage\n- Operator creating manual situations frequently\n- Topology discovery jobs failing silently\n\n### Recommended CLI Commands\nCheck topology discovery job logs\nVerify device inventory in CMDB\nReview correlation rule definitions\nCompare event entity IDs against topology DB\nCheck NTP sync across event sources\n\n### Step-by-Step RCA\n1) Check topology DB: are all affected devices present with correct relationships?\n2) Run topology discovery — is it completing successfully?\n3) Check correlation rule coverage: does a rule exist for this event type combination?\n4) Verify event timestamps are synchronized (NTP)\n5) Check entity ID consistency — do events reference same device ID format?\n6) Widen correlation time window as test\n\n### Related Tools\nCMDB, Topology engine, NTP, Event correlation platform",
    "problem": "Topology metadata missing or stale — correlator cannot link events to common parent",
    "area": "Correlation",
    "remedyItems": [
      "Trigger topology rediscovery",
      "fix CMDB data",
      "create new correlation rule",
      "fix NTP",
      "normalize entity IDs across event sources.",
      "Schedule daily topology discovery",
      "monitor correlation ratio (situations per N events)",
      "alert on topology job failures."
    ],
    "tags": [
      "correlation",
      "topology",
      "cmdb",
      "event-grouping",
      "situation",
      "ntp-sync"
    ],
    "linkedIntents": [
      "platform.correlation_missing"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-platform-003",
    "title": "Significant gaps in metric data for a monitored resource — what causes telemetry loss?",
    "category": "Platform",
    "subcategory": "Data Quality",
    "content": "### Overview\nSignificant gaps in metric data for a monitored resource — what causes telemetry loss?\n\n### Likely Causes\n- Metric agent (Prometheus exporter, SNMP agent) stopped on host\n- Network path from agent to collector blocked (ACL, firewall)\n- Collector capacity exceeded — drops under high ingest load\n- Agent configuration changed and no longer scraping target\n- Host rebooted without agent auto-restart configured\n- SNMP community string changed without updating collector\n\n### Observability Signals\n- missing_points_percent > 20 over time window\n- Scrape failed errors in collector logs\n- Exporter process not running on host\n- SNMP timeout from collector\n- Grafana showing 'No Data' for specific host\n\n### Recommended CLI Commands\ncurl http://<host>:9100/metrics (Prometheus node_exporter check)\nsnmpwalk -v2c -c <community> <host> 1.3.6.1.2.1.1 (SNMP test)\nps aux | grep exporter\nsystemctl status node_exporter\ntelnet <host> 9100 (port reachability)\ncheck collector logs: journalctl -u prometheus\n\n### Step-by-Step RCA\n1) Test agent endpoint directly: 'curl http://<host>:<port>/metrics'\n2) Check agent process: 'systemctl status <exporter>'\n3) Verify network path: telnet to agent port from collector\n4) Check collector logs for scrape error messages\n5) Validate credentials: SNMP community, API token, certificate\n6) Check collector resource utilization — is it overloaded?\n\n### Related Tools\nPrometheus, SNMP, Grafana, systemd, node_exporter",
    "problem": "Metric agent (Prometheus exporter, SNMP agent) stopped on host",
    "area": "Data Quality",
    "remedyItems": [
      "Restart agent",
      "fix firewall ACL",
      "update credentials",
      "scale collector",
      "configure agent to auto-start on boot.",
      "Monitor agent health as a meta-metric",
      "alert on 'exporter down'",
      "configure systemd restart policy for all agents."
    ],
    "tags": [
      "metric-gap",
      "exporter-down",
      "snmp-timeout",
      "telemetry-loss",
      "prometheus",
      "data-quality"
    ],
    "linkedIntents": [
      "platform.metric_gaps"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 96
  },
  {
    "id": "kb-platform-004",
    "title": "Synthetic transaction probes are failing — how to determine if it is a real outage or probe issue?",
    "category": "Platform",
    "subcategory": "Synthetic",
    "content": "### Overview\nSynthetic transaction probes are failing — how to determine if it is a real outage or probe issue?\n\n### Likely Causes\n- Real application or path degradation detected by probe\n- Probe agent itself misconfigured or failing\n- Test credentials expired or changed\n- Probe timing out due to latency increase (not full failure)\n- SSL certificate change breaking probe validation\n- Geographic routing change sending probe to degraded POP\n\n### Observability Signals\n- probe_success_rate < 90% over measurement window\n- probe_timeout events in monitoring logs\n- Transaction failed with specific HTTP/DNS/TLS error code\n- Only specific probe agents failing (agent issue vs real outage)\n- Real user traffic showing correlated errors\n\n### Recommended CLI Commands\ncurl -o /dev/null -s -w '%{http_code}\\n%{time_total}\\n' https://<endpoint>\nnslookup <endpoint>\nopenssl s_client -connect <host>:443\ntraceroute <endpoint>\ncheck probe agent logs\n\n### Step-by-Step RCA\n1) Correlate probe failure with real user impact — is it just the probe or real traffic affected?\n2) Run manual curl/ping from probe agent host to target\n3) Check if multiple probe agents from different locations are failing — widespread = real outage\n4) Check probe configuration: correct URL, port, expected response, timeout value?\n5) Validate test credentials still valid\n6) Check SSL cert on target — has it changed?\n\n### Related Tools\nSynthetic monitoring platform, curl, traceroute, APM",
    "problem": "Real application or path degradation detected by probe",
    "area": "Synthetic",
    "remedyItems": [
      "Fix real outage if confirmed",
      "update probe configuration",
      "renew probe credentials",
      "fix SSL cert",
      "adjust probe timeout.",
      "Deploy probes from multiple geographic locations",
      "correlate synthetic with real-user monitoring",
      "test probe config after any application change."
    ],
    "tags": [
      "synthetic-probe",
      "probe-failure",
      "uptime-monitoring",
      "transaction-monitoring",
      "ssl",
      "timeout"
    ],
    "linkedIntents": [
      "platform.synthetic_probe_loss"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-thermal-001",
    "title": "Device chassis temperature is above safe limits — what are the causes and immediate actions?",
    "category": "Facility",
    "subcategory": "Device Thermal",
    "content": "### Overview\nDevice chassis temperature is above safe limits — what are the causes and immediate actions?\n\n### Likely Causes\n- Airflow blocked by cables, blanking panels missing, or rack obstructions\n- Fan failure — one or more chassis fans stopped\n- CRAC unit not delivering adequate cold air to this rack\n- Device placed in wrong airflow orientation (front-to-back vs rear-to-front)\n- Ambient room temperature too high\n- Chassis air filter clogged\n\n### Observability Signals\n- temp_c > 70 on chassis sensor\n- Fan RPM sensor showing reduced speed or failed fan\n- SNMP thermal alarm trap\n- Syslog: 'temperature alarm', 'over temperature'\n- System throttling CPU to reduce heat output\n\n### Recommended CLI Commands\nshow environment temperature (network device)\nshow environment fans\nipmitool sdr type Temperature\nipmitool sdr type Fan\nshow platform hardware chassis detail\n\n### Step-by-Step RCA\n1) Check current temperature reading and trend — acute (spike) or chronic (gradual rise)?\n2) Inspect all chassis fans: 'show environment fans' or IPMI — any stopped?\n3) Check for physical airflow blockage: cables, missing blanking panels, wrong rack orientation\n4) Verify CRAC is delivering cold air to this rack zone (inlet temp sensor)\n5) Check if neighboring device failure changed airflow patterns\n6) Immediate action if > 80°C: consider graceful shutdown before thermal shutdown\n\n### Related Tools\nIPMI, SNMP environmental MIBs, DCIM, Syslog",
    "problem": "Airflow blocked by cables, blanking panels missing, or rack obstructions",
    "area": "Device Thermal",
    "remedyItems": [
      "Replace failed fan",
      "clear airflow blockage",
      "install blanking panels",
      "fix CRAC unit",
      "reduce device load to lower heat output.",
      "Monitor all fan sensors",
      "set alert at 65°C",
      "ensure blanking panels in all unused rack slots",
      "clean air filters quarterly."
    ],
    "tags": [
      "chassis-hot",
      "overheat",
      "fan-failure",
      "airflow",
      "thermal-alarm",
      "temperature"
    ],
    "linkedIntents": [
      "thermal.chassis_hot"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 97
  },
  {
    "id": "kb-thermal-002",
    "title": "Rack inlet temperature is elevated — how to identify and resolve a hot-spot in the data centre?",
    "category": "Facility",
    "subcategory": "Environmental Heat",
    "content": "### Overview\nRack inlet temperature is elevated — how to identify and resolve a hot-spot in the data centre?\n\n### Likely Causes\n- CRAC unit failure reducing cold air supply to the aisle\n- Hot aisle / cold aisle containment breach (blanking panels missing)\n- Hotspot in rack due to high-density compute cluster\n- Raised floor tiles missing under high-load racks\n- HVAC system not keeping up with increased power density\n- New high-power equipment added without cooling capacity review\n\n### Observability Signals\n- inlet_temp_c > 30 at rack temperature sensor\n- Nearby device chassis temperatures also rising\n- CRAC discharge temperature higher than normal\n- Airflow pattern showing recirculation (hot exhaust mixing with cold inlet)\n- Power draw increase in this rack\n\n### Recommended CLI Commands\nipmitool sdr type Temperature (multiple devices in rack)\ncheck DCIM rack power/temperature dashboard\ncheck CRAC unit telemetry\nmeasure inlet temp physically with calibrated probe\n\n### Step-by-Step RCA\n1) Identify which rack(s) are affected using per-rack inlet sensors\n2) Check CRAC unit status serving the affected zone\n3) Physical inspection: missing blanking panels? cables blocking airflow?\n4) Check containment integrity: hot aisle containment doors sealed?\n5) Review recent power additions to the rack — new high-power equipment?\n6) Measure CRAC discharge temperature — is it delivering cold air?\n\n### Related Tools\nDCIM, CRAC telemetry, rack temperature sensors, IPMI",
    "problem": "CRAC unit failure reducing cold air supply to the aisle",
    "area": "Environmental Heat",
    "remedyItems": [
      "Restore CRAC operation",
      "install missing blanking panels",
      "seal containment",
      "redistribute high-density equipment",
      "add supplemental cooling.",
      "Regular airflow audits",
      "capacity review before adding high-power equipment",
      "deploy per-rack temperature monitoring."
    ],
    "tags": [
      "rack-hotspot",
      "inlet-temp",
      "crac",
      "hot-aisle",
      "containment",
      "hvac",
      "cooling"
    ],
    "linkedIntents": [
      "thermal.room_hot"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 91
  },
  {
    "id": "kb-cooling-001",
    "title": "CRAC/CRAH unit is reporting a fault — what is the response and remediation process?",
    "category": "Facility",
    "subcategory": "Cooling",
    "content": "### Overview\nCRAC/CRAH unit is reporting a fault — what is the response and remediation process?\n\n### Likely Causes\n- Compressor failure in CRAC unit\n- Refrigerant leak reducing cooling capacity\n- CRAC fan motor failure\n- Water leak or condensate drain blockage\n- Loss of power to CRAC unit\n- Control board fault or firmware issue\n- Filter clogged reducing airflow through CRAC\n\n### Observability Signals\n- crac_status == fault\n- CRAC alarm on BMS (Building Management System)\n- Rising inlet temperatures in affected zone\n- CRAC discharge air temperature increasing\n- Audible alarm from CRAC unit\n\n### Recommended CLI Commands\nCheck BMS/DCIM for CRAC alarm detail\nInspect CRAC local panel for error code\nCheck facility power feed to CRAC\nReview CRAC vendor management interface\nCheck temperature trend since CRAC fault time\n\n### Step-by-Step RCA\n1) Identify fault type from CRAC local panel or BMS error code\n2) Check power feed to CRAC — is it receiving power?\n3) Inspect physical unit: water leak? ice buildup? fan running?\n4) Assess impact: how many racks served by this CRAC? what is current inlet temp trend?\n5) Activate emergency cooling (portable units, open containment) to buy time\n6) Engage CRAC vendor for emergency field service\n\n### Related Tools\nBMS, DCIM, CRAC vendor portal, SNMP environmental MIBs",
    "problem": "Compressor failure in CRAC unit",
    "area": "Cooling",
    "remedyItems": [
      "Emergency portable cooling",
      "engage vendor for CRAC repair",
      "evacuate high-density equipment if temperature continues rising",
      "activate backup CRAC if available.",
      "N+1 CRAC redundancy",
      "quarterly CRAC maintenance",
      "deploy per-unit monitoring",
      "test backup CRAC activation annually."
    ],
    "tags": [
      "crac-fault",
      "cooling-failure",
      "hvac",
      "compressor",
      "datacenter",
      "bms",
      "refrigerant"
    ],
    "linkedIntents": [
      "cooling.crac_fault"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 88
  },
  {
    "id": "kb-power-001",
    "title": "Device is running on a single power feed after losing PSU redundancy — what are the risks and actions?",
    "category": "Facility",
    "subcategory": "Power",
    "content": "### Overview\nDevice is running on a single power feed after losing PSU redundancy — what are the risks and actions?\n\n### Likely Causes\n- One PSU in dual-PSU device has failed\n- A-feed or B-feed power strip (PDU) tripped or failed\n- Facility breaker tripped on one power feed\n- Power cable disconnected from PSU accidentally\n- UPS failure on one power feed path\n\n### Observability Signals\n- psu_redundant == 0 (redundancy lost)\n- IPMI sensor showing one PSU failed\n- SNMP PSU redundancy alarm\n- Physical amber LED on failed PSU\n- BMS showing PDU circuit fault\n\n### Recommended CLI Commands\nshow environment power (Cisco)\nipmitool sdr type 'Power Supply'\nipmitool sel list | grep -i 'power\\|psu'\ncheck PDU outlet status (via PDU SNMP/REST)\nshow platform power chassis (vendor-specific)\n\n### Step-by-Step RCA\n1) Identify which PSU has failed from IPMI or chassis LEDs\n2) Trace power path: PSU Ã¢â€ â€™ power cable Ã¢â€ â€™ PDU outlet Ã¢â€ â€™ facility breaker Ã¢â€ â€™ UPS\n3) Check PDU outlet: is it providing power? (PDU SNMP/REST API)\n4) Check facility breaker panel for tripped breaker on that feed\n5) If PSU hardware failed: plan emergency replacement (hot-swap if supported)\n6) Assess risk window: how long can device run single-feed before next action?\n\n### Related Tools\nIPMI, PDU SNMP, DCIM, BMS, SNMP environmental MIBs",
    "problem": "One PSU in dual-PSU device has failed",
    "area": "Power",
    "remedyItems": [
      "Replace failed PSU (hot-swap)",
      "restore tripped PDU/breaker",
      "reconnect power cable",
      "order RMA if PSU hardware fault.",
      "Monitor PSU redundancy via SNMP",
      "test A/B feed failover quarterly",
      "ensure A and B feeds from independent PDUs and UPS paths."
    ],
    "tags": [
      "power-redundancy",
      "psu",
      "pdu",
      "single-feed",
      "ups",
      "breaker",
      "rma"
    ],
    "linkedIntents": [
      "power.redundancy_lost"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-storage-001",
    "title": "Disk IOPS are far below expected capacity and queue depth is high — what is causing storage performance degradation?",
    "category": "Storage",
    "subcategory": "Disk Health",
    "content": "### Overview\nDisk IOPS are far below expected capacity and queue depth is high — what is causing storage performance degradation?\n\n### Likely Causes\n- Failing disk causing retries and slow I/O\n- RAID rebuild consuming I/O bandwidth (degraded array)\n- Backend SAN/NAS array under heavy contention from other hosts\n- Storage network (FC/iSCSI) congestion\n- LUN not on SSD tier — migrated to slower tier\n- Snapshot overhead consuming IOPS\n- Host-side I/O scheduler or driver misconfiguration\n\n### Observability Signals\n- disk_iops < 500 when expected > 5000\n- disk_queue_depth > 20 (I/O requests queuing)\n- High await time in iostat\n- Storage controller showing busy/overloaded\n\n### Recommended CLI Commands\niostat -xz 1 10 (Linux)\ iostat -d -x <device> (per-disk)\nsar -d 1 30\nfio --filename=<dev> --rw=randread --bs=4k --runtime=10 (synthetic test)\nvmstat 1 10 (wa column)\ncheck array management console for disk/RAID status\n\n### Step-by-Step RCA\n1) Run iostat: identify device with high await and low IOPS\n2) Check if RAID is degraded: array console or 'cat /proc/mdstat'\n3) Check disk health: 'smartctl -a /dev/sdX' for reallocated sectors\n4) Test isolated disk IOPS with fio to confirm degradation\n5) Check array management for other hosts consuming same storage pool\n6) Review snapshot schedule — is a snapshot running during peak?\n\n### Related Tools\niostat, smartctl, fio, Array management console, SNMP",
    "problem": "Failing disk causing retries and slow I/O",
    "area": "Disk Health",
    "remedyItems": [
      "Replace failing disk",
      "complete RAID rebuild on new disk",
      "balance storage load across pools",
      "move LUN to SSD tier",
      "defer snapshots to off-peak.",
      "Monitor SMART attributes daily",
      "set IOPS and latency alert thresholds",
      "stagger RAID rebuilds",
      "review snapshot schedules."
    ],
    "tags": [
      "disk-iops",
      "storage-performance",
      "raid-degraded",
      "smartctl",
      "await",
      "san-contention"
    ],
    "linkedIntents": [
      "storage.disk_iops_degraded"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 90
  },
  {
    "id": "kb-storage-002",
    "title": "A storage volume is above 90% utilization — what is consuming space and how to recover?",
    "category": "Storage",
    "subcategory": "Capacity",
    "content": "### Overview\nA storage volume is above 90% utilization — what is consuming space and how to recover?\n\n### Likely Causes\n- Log files growing without rotation or retention policy\n- Database data or temp files growing unexpectedly\n- Backup files accumulating past retention period\n- Core dumps filling /var/crash or similar\n- Container or VM disk image growth\n- Snapshot reserve space consumed\n\n### Observability Signals\n- volume_used_percent > 90\n- Filesystem at 100% causing write failures\n- Application errors: 'no space left on device'\n- Log rotation failing (cannot write new log)\n- Database unable to grow data file\n\n### Recommended CLI Commands\ndf -h (filesystem usage)\ndu -sh /* | sort -rh | head -20 (top consumers)\nfind / -name 'core' -size +100M (core dumps)\nfind /var/log -name '*.log' -size +1G\ndu -sh /var/log/* | sort -rh\ncrontab -l | grep logrotate\n\n### Step-by-Step RCA\n1) Identify top space consumer: 'du -sh /* | sort -rh'\n2) Check /var/log for uncleaned logs\n3) Check backup directory for files past retention period\n4) Look for core dumps: 'find / -name core'\n5) Check database temp/data file growth\n6) Immediate emergency space: delete old rotated logs, expired backups, core dumps\n\n### Related Tools\ndf, du, logrotate, SNMP, DCIM capacity management",
    "problem": "Log files growing without rotation or retention policy",
    "area": "Capacity",
    "remedyItems": [
      "Free space immediately (delete logs/cores/expired backups)",
      "fix log rotation",
      "expand volume",
      "add storage",
      "enforce retention policies.",
      "Set alert at 75%/85%",
      "enforce log rotation with logrotate",
      "set backup retention limits",
      "capacity trend reporting."
    ],
    "tags": [
      "volume-full",
      "disk-space",
      "log-growth",
      "backup-retention",
      "capacity",
      "no-space-left"
    ],
    "linkedIntents": [
      "storage.volume_near_full"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 88
  },
  {
    "id": "kb-storage-003",
    "title": "Storage snapshot jobs are failing repeatedly — what are the common causes and fixes?",
    "category": "Storage",
    "subcategory": "Snapshot",
    "content": "### Overview\nStorage snapshot jobs are failing repeatedly — what are the common causes and fixes?\n\n### Likely Causes\n- Insufficient snapshot reserve space on volume\n- Snapshot schedule overlapping — previous snapshot not yet complete\n- Volume locked by application during snapshot quiesce\n- Snapshot target storage exhausted\n- Permissions issue — snapshot agent lacks necessary privilege\n- Array firmware bug in snapshot subsystem\n\n### Observability Signals\n- snapshot_failures > 1 in monitoring window\n- Snapshot job error in storage management console\n- Backup SLA missed due to snapshot failure\n- Volume snapshot reserve percentage high\n- 'Insufficient space' or 'lock timeout' in snapshot logs\n\n### Recommended CLI Commands\nCheck array snapshot management console\ndf -h (check snapshot reserve on volume)\nvgdisplay / lvdisplay (LVM snapshot space)\ncheck backup application logs\ncheck snapshot schedule for overlaps\narray CLI: snap list / snap status (vendor-specific)\n\n### Step-by-Step RCA\n1) Check snapshot error message for specific failure type (space, lock, timeout)\n2) Check snapshot reserve: it is fully consumed by existing snapshots?\n3) Delete expired snapshots to free reserve space\n4) Check if application quiesce script is timing out — app too slow to quiesce?\n5) Verify snapshot schedule does not overlap (previous not finished when next starts)\n6) Check snapshot agent credentials and privileges\n\n### Related Tools\nStorage array management console, backup agent logs, SNMP",
    "problem": "Insufficient snapshot reserve space on volume",
    "area": "Snapshot",
    "remedyItems": [
      "Expand snapshot reserve",
      "delete expired snapshots",
      "stagger schedule",
      "fix quiesce script",
      "grant correct permissions",
      "vendor firmware patch.",
      "Alert when snapshot reserve > 70%",
      "test snapshot schedule in maintenance window",
      "monitor quiesce success rate."
    ],
    "tags": [
      "snapshot-failure",
      "snapshot-reserve",
      "backup-snapshot",
      "quiesce",
      "insufficient-space"
    ],
    "linkedIntents": [
      "storage.snapshot_failures"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-storage-004",
    "title": "Storage I/O latency has spiked — how to identify the source of the delay?",
    "category": "Storage",
    "subcategory": "IO Latency",
    "content": "### Overview\nStorage I/O latency has spiked — how to identify the source of the delay?\n\n### Likely Causes\n- Backend storage array under heavy concurrent load from multiple hosts\n- SAN fabric congestion causing frame drops\n- Storage controller cache flushing (write-back cache full)\n- Failing disk causing retries adding latency\n- Snapshot or replication activity competing for array resources\n- QoS policy on array throttling specific LUN\n\n### Observability Signals\n- io_latency_ms > 20 for database or critical application LUN\n- High await in iostat on host\n- Array controller showing queue depth high\n- SAN fabric showing congestion or credit starvation\n- Other hosts on same array also showing latency\n\n### Recommended CLI Commands\niostat -x 1 10 (host-side latency: await column)\nsar -d 1 60\nfio --rw=randread --bs=4k --runtime=30 (test latency directly)\ncheck SAN switch: show fcns database, show interface counters\ncheck array queue depth and latency from array console\nnetstat -s | grep retransmit (if iSCSI)\n\n### Step-by-Step RCA\n1) Measure host-side latency: iostat await on the LUN device\n2) Compare latency on array: is it array-side or host/HBA side?\n3) Check SAN fabric: FC credit starvation? congestion? (show interface counters on FC switch)\n4) Identify other hosts using same storage pool — is it shared contention?\n5) Check for snapshot or replication running during latency spike\n6) Review array QoS — is LUN throttled?\n\n### Related Tools\niostat, sar, fio, SAN management console, array management",
    "problem": "Backend storage array under heavy concurrent load from multiple hosts",
    "area": "IO Latency",
    "remedyItems": [
      "Balance workloads across storage pools",
      "defer snapshots",
      "expand SAN bandwidth",
      "upgrade array cache",
      "disable array QoS throttle.",
      "Set latency alert at 10ms",
      "monitor array queue depth",
      "isolate OLTP LUNs from batch workloads",
      "size SAN fabric for peak concurrent I/O."
    ],
    "tags": [
      "io-latency",
      "storage-latency",
      "san-congestion",
      "array-busy",
      "await",
      "fc-credits"
    ],
    "linkedIntents": [
      "storage.latency_spike"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 88
  },
  {
    "id": "kb-storage-005",
    "title": "Storage replication is lagging — what is causing the replication delay and how to catch up?",
    "category": "Storage",
    "subcategory": "Replication",
    "content": "### Overview\nStorage replication is lagging — what is causing the replication delay and how to catch up?\n\n### Likely Causes\n- Insufficient bandwidth on replication link for write rate\n- Target array too slow to ingest replicated I/O\n- Replication link experiencing high latency or packet loss\n- High write rate on source exceeding replication throughput\n- Replication paused and resuming with large backlog\n- QoS throttle on replication traffic\n\n### Observability Signals\n- replication_lag_sec > 300 (5 minutes behind)\n- Replication link utilization near 100%\n- Target array write latency high\n- Syslog: 'replication behind', 'mirror out of sync'\n- RPO SLA breach alert\n\n### Recommended CLI Commands\nCheck array replication status: show replication (vendor-specific)\niperf3 -c <replication-target-ip> (test replication link bandwidth)\nping <replication-target> (check latency)\nCheck replication link interface utilization\nCheck target array write latency\nCheck replication QoS policy on array\n\n### Step-by-Step RCA\n1) Determine current lag size and trend — is it growing or stable?\n2) Check replication link utilization — is it saturated?\n3) Test raw link bandwidth with iperf3 vs expected write rate\n4) Check target array ingest rate — is target array the bottleneck?\n5) Review source write rate — has a bulk load or backup increased write rate?\n6) Check if replication was paused and is recovering backlog\n\n### Related Tools\nArray management console, iperf3, SNMP, replication monitoring",
    "problem": "Insufficient bandwidth on replication link for write rate",
    "area": "Replication",
    "remedyItems": [
      "Increase replication link bandwidth",
      "throttle source workload temporarily",
      "scale target array",
      "increase replication thread count",
      "upgrade replication link.",
      "Size replication link to 120% of peak write rate",
      "set RPO alert before breach",
      "test replication recovery time quarterly."
    ],
    "tags": [
      "replication-lag",
      "storage-replication",
      "rpo",
      "replication-link",
      "target-array",
      "sync"
    ],
    "linkedIntents": [
      "storage.replication_lag"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 96
  },
  {
    "id": "kb-db-001",
    "title": "Database is not reachable — how to determine if it is the process, host, or network?",
    "category": "Database",
    "subcategory": "Availability",
    "content": "### Overview\nDatabase is not reachable — how to determine if it is the process, host, or network?\n\n### Likely Causes\n- Database process crashed or OOM killed\n- Host running the DB is down or unreachable\n- Database listener not started after maintenance\n- Database port blocked by firewall or ACL change\n- Disk full preventing DB from writing (crash on write failure)\n- Corrupt control file or redo log causing startup failure\n\n### Observability Signals\n- db_up == 0\n- Connection refused or timeout to DB port\n- Host ICMP unreachable\n- DB process not in process list\n- OOM kill event in kernel log coinciding with DB crash\n\n### Recommended CLI Commands\nping <db_host>\ntelnet <db_host> <db_port> (e.g. 5432, 3306, 1521)\nps aux | grep postgres|mysql|oracle\nsystemctl status postgresql|mysql\ntail -100 /var/log/postgresql/postgresql*.log\ndf -h (check disk space)\njournalctl -u postgresql -n 200\n\n### Step-by-Step RCA\n1) Is host reachable? Ping — if no: escalate to infrastructure/host team\n2) Is DB port listening? Telnet to port — if no: process down\n3) Check DB process: 'systemctl status' and 'ps aux | grep db'\n4) Check DB error log for crash reason: OOM? disk full? corrupt files?\n5) Check disk space: 'df -h' — full disk causes DB write failure and crash\n6) Attempt DB startup and capture error output\n\n### Related Tools\nPrometheus DB exporter, pg_stat_activity, MySQL status, SNMP, journalctl",
    "problem": "Database process crashed or OOM killed",
    "area": "Availability",
    "remedyItems": [
      "Restart DB process",
      "free disk space",
      "repair corrupt files",
      "restore from backup if corruption is severe",
      "fix network/firewall if connectivity issue.",
      "Set DB availability probe",
      "alert on disk > 85%",
      "enable DB crash dump analysis",
      "configure DB auto-restart via systemd."
    ],
    "tags": [
      "db-down",
      "database-unavailable",
      "connection-refused",
      "oom-kill",
      "disk-full",
      "process-crash"
    ],
    "linkedIntents": [
      "db.down"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 89
  },
  {
    "id": "kb-db-002",
    "title": "High rate of slow queries detected — what are the common causes and tuning approach?",
    "category": "Database",
    "subcategory": "Query Performance",
    "content": "### Overview\nHigh rate of slow queries detected — what are the common causes and tuning approach?\n\n### Likely Causes\n- Missing index on frequently queried column (full table scan)\n- Stale statistics causing optimizer to choose wrong plan\n- N+1 query pattern in application (ORM issue)\n- Lock contention causing queries to wait\n- Insufficient DB server memory causing cache eviction\n- Long-running transactions blocking newer queries\n\n### Observability Signals\n- slow_queries_per_min > 20\n- Query execution time > threshold (e.g., > 1s)\n- Full table scan indicator in query plan\n- Lock wait time increasing\n- DB buffer cache hit ratio decreasing\n\n### Recommended CLI Commands\nSHOW FULL PROCESSLIST; (MySQL)\nSELECT query, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10; (PostgreSQL)\nEXPLAIN ANALYZE <slow_query>;\nSELECT * FROM sys.dm_exec_query_stats (SQL Server)\nSHOW STATUS LIKE 'Slow_queries'; (MySQL)\nSHOW ENGINE INNODB STATUS; (MySQL locks)\n\n### Step-by-Step RCA\n1) Identify slowest queries from slow query log or pg_stat_statements\n2) Run EXPLAIN ANALYZE on top slow query — look for seq scan, hash join on large table\n3) Check for missing index: pg_stat_user_tables seq_scan high\n4) Look for lock contention: long-running transactions blocking others\n5) Check DB memory: buffer cache hit ratio < 95% indicates insufficient RAM\n6) Check if statistics are stale: ANALYZE/UPDATE STATISTICS\n\n### Related Tools\npg_stat_statements, MySQL slow query log, EXPLAIN, APM, DB monitoring",
    "problem": "Missing index on frequently queried column (full table scan)",
    "area": "Query Performance",
    "remedyItems": [
      "Add missing index",
      "update statistics",
      "kill long-running locks",
      "add DB server RAM",
      "fix N+1 in application",
      "optimize query.",
      "Enable slow query log",
      "monitor pg_stat_statements weekly",
      "index coverage review after schema changes",
      "load test before deployment."
    ],
    "tags": [
      "slow-query",
      "missing-index",
      "full-table-scan",
      "lock-contention",
      "optimizer",
      "pg_stat_statements"
    ],
    "linkedIntents": [
      "db.slow_queries"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-db-003",
    "title": "Database replica is lagging behind primary — what causes replica lag and how to resolve?",
    "category": "Database",
    "subcategory": "Replication",
    "content": "### Overview\nDatabase replica is lagging behind primary — what causes replica lag and how to resolve?\n\n### Likely Causes\n- Replica hardware weaker than primary — cannot keep up with write rate\n- Long-running read queries on replica blocking replication thread\n- Network latency between primary and replica\n- Parallel replication not enabled — single-threaded apply\n- Large transactions on primary creating huge binlog events\n- Replica I/O thread paused or errored\n\n### Observability Signals\n- db_replication_delay_sec > 120\n- Replica 'Seconds_Behind_Master' > 120 (MySQL)\n- pg_stat_replication replay_lag > 120s (PostgreSQL)\n- Replica I/O thread: Waiting for master to send event\n- Replica SQL thread: applying events slowly\n\n### Recommended CLI Commands\nSHOW SLAVE STATUS\\G; (MySQL)\nSELECT * FROM pg_stat_replication; (PostgreSQL)\nSHOW REPLICA STATUS\\G; (MySQL 8+)\nCheck replica server iostat and CPU\nSELECT pid, query, state FROM pg_stat_activity WHERE state != 'idle'; (blocking queries on replica)\n\n### Step-by-Step RCA\n1) Check replica lag: 'SHOW SLAVE STATUS' — Seconds_Behind_Master value\n2) Check if I/O or SQL thread is the bottleneck\n3) Is replica I/O bound? Check iostat on replica during replication\n4) Enable parallel replication (MySQL: slave_parallel_workers=4)\n5) Check for long-running queries on replica blocking SQL thread\n6) Verify network bandwidth between primary and replica\n\n### Related Tools\nMySQL SHOW SLAVE STATUS, pg_stat_replication, Prometheus DB exporter",
    "problem": "Replica hardware weaker than primary — cannot keep up with write rate",
    "area": "Replication",
    "remedyItems": [
      "Enable parallel replication",
      "upgrade replica hardware",
      "kill blocking queries on replica",
      "compress replication stream",
      "dedicate replica CPU to replication.",
      "Monitor replica lag continuously",
      "set alert at 60s lag",
      "load test replica before promoting",
      "use async replication for analytics replicas."
    ],
    "tags": [
      "replication-lag",
      "replica-delay",
      "binlog",
      "pg_stat_replication",
      "parallel-replication",
      "seconds-behind-master"
    ],
    "linkedIntents": [
      "db.replication_delay"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 96
  },
  {
    "id": "kb-db-004",
    "title": "Database connection pool is exhausted — what is causing the leak or spike in connections?",
    "category": "Database",
    "subcategory": "Connection Pool",
    "content": "### Overview\nDatabase connection pool is exhausted — what is causing the leak or spike in connections?\n\n### Likely Causes\n- Application connection leak — connections not closed in code\n- Unexpected spike in user traffic exceeding pool capacity\n- Slow queries holding connections open for too long\n- Deadlocks preventing connections from being released\n- Database server max_connections limit reached\n- Network issue causing 'zombie' connections to hang\n\n### Observability Signals\n- db_pool_utilization > 95%\n- Application error: 'Could not get JDBC Connection', 'Pool exhausted'\n- High latency in obtaining connection from pool\n- Number of active connections on DB server near 'max_connections'\n- High rate of connection creation/destruction\n\n### Recommended CLI Commands\nSHOW STATUS LIKE 'Threads_connected'; (MySQL)\nSELECT count(*) FROM pg_stat_activity; (PostgreSQL)\nSELECT * FROM pg_stat_activity WHERE state != 'idle';\ncheck application logs for 'connection leak' warnings\ncheck netstat for many ESTABLISHED connections to DB port\n\n### Step-by-Step RCA\n1) Identify where connections are coming from: 'SELECT client_addr, count(*) FROM pg_stat_activity GROUP BY 1;'\n2) Check for slow queries or locks holding connections: 'SELECT * FROM pg_stat_activity WHERE state != \"idle\"'\n3) Inspect application logs for connection pool exhaustion errors\n4) Search code for missing .close() or try-with-resources on DB connections\n5) Increase pool size temporarily if it is a legitimate traffic spike\n6) Check DB server 'max_connections' setting and increase if hardware allows\n\n### Related Tools\nHikariCP logs, pg_stat_activity, MySQL SHOW PROCESSLIST, APM",
    "problem": "Application connection leak — connections not closed in code",
    "area": "Connection Pool",
    "remedyItems": [
      "Fix application connection leak",
      "increase pool size",
      "increase DB max_connections",
      "kill idle/zombie connections",
      "optimize slow queries.",
      "Enable pool leak detection",
      "alert on pool utilization > 80%",
      "use try-with-resources in all DB code",
      "regularly review max_connections vs hardware."
    ],
    "tags": [
      "connection-pool",
      "db-connections",
      "jdbc-error",
      "max_connections",
      "zombie-connections",
      "leak-detection"
    ],
    "linkedIntents": [
      "db.pool_exhausted"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 87
  },
  {
    "id": "kb-db-005",
    "title": "A database deadlock has occurred — how to identify the conflicting transactions and resolve?",
    "category": "Database",
    "subcategory": "Concurrency",
    "content": "### Overview\nA database deadlock has occurred — how to identify the conflicting transactions and resolve?\n\n### Likely Causes\n- Two transactions updating rows in opposite order\n- Long-running transaction holding locks while waiting for user input or remote API\n- Missing index causing table scans and excessive locking\n- Higher isolation level (SERIALIZABLE) than necessary\n- Large batch updates overlapping with OLTP transactions\n\n### Observability Signals\n- db_deadlock_count > 0 in metrics\n- Application error: 'Deadlock found when trying to get lock', 'trans. aborted'\n- Database error log showing deadlock details and backtraces\n- Sudden spike in query latency and waiting threads\n\n### Recommended CLI Commands\nSHOW ENGINE INNODB STATUS\\G; (MySQL: look for LATEST DETECTED DEADLOCK)\nSELECT * FROM pg_locks; (PostgreSQL)\nSELECT * FROM sys.dm_tran_locks; (SQL Server)\ncheck DB error log for deadlock graphs\n\n### Step-by-Step RCA\n1) Identify the two conflicting queries from the deadlock report/log\n2) Analyze the lock types and resources (rows/pages) involved\n3) Trace queries back to application code — check execution order\n4) Check for missing indexes that might cause broader locking than needed\n5) Review isolation levels — can the operation use READ COMMITTED instead of REPEATABLE READ?\n6) Optimize transactions to be as short as possible\n\n### Related Tools\nInnoDB Status, pg_locks, DB error logs, APM transaction tracing",
    "problem": "Two transactions updating rows in opposite order",
    "area": "Concurrency",
    "remedyItems": [
      "Fix query order in application",
      "add index to reduce lock scope",
      "shorten transaction duration",
      "lower isolation level if safe",
      "implement retry logic in app.",
      "Monitor deadlock rate",
      "log all deadlocks to SIEM",
      "use consistent update patterns across all services."
    ],
    "tags": [
      "deadlock",
      "lock-waiting",
      "innodb-status",
      "transaction-conflict",
      "database-concurrency",
      "pg_locks"
    ],
    "linkedIntents": [
      "db.deadlock_detected"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 92
  },
  {
    "id": "kb-db-006",
    "title": "Database transaction log (Redo/WAL) is full or growing too fast — what are the risks and fixes?",
    "category": "Database",
    "subcategory": "Storage",
    "content": "### Overview\nDatabase transaction log (Redo/WAL) is full or growing too fast — what are the risks and fixes?\n\n### Likely Causes\n- Large bulk data load or delete operation\n- Long-running transaction preventing log truncation or reuse\n- Reaching disk capacity on the log volume\n- Backup failure preventing log truncation (SQL Server / Oracle)\n- High write volume matching peak workload\n- Replication issue preventing WAL recycling (PostgreSQL)\n\n### Observability Signals\n- db_log_utilization > 90%\n- Application error: 'The transaction log for database X is full', 'disk full on WAL'\n- DB performance slowing down significantly (waiting for log space)\n- Replication lag increasing (cannot ship logs)\n\n### Recommended CLI Commands\ndf -h (check log volume space)\nSELECT * FROM pg_stat_replication; (check for stalled slots in Postgres)\nDBCC SQLPERF(LOGSPACE); (SQL Server)\nSELECT group#, status, member FROM v$log; (Oracle)\ncheck for long-running transactions: SELECT * FROM pg_stat_activity WHERE xact_start < now() - interval '1 hour';\n\n### Step-by-Step RCA\n1) Check disk space for the transaction log volume\n2) Identify if a bulk operation is currently running\n3) Check for long-running open transactions that are pinning the log\n4) In PostgreSQL: check for abandoned replication slots ('pg_replication_slots')\n5) Confirm log backups are running successfully (if required for truncation)\n6) Temporary fix: add space to volume or move logs if possible\n\n### Related Tools\ndf, pg_stat_activity, DBCC, Oracle V$ views, backup manager",
    "problem": "Large bulk data load or delete operation",
    "area": "Storage",
    "remedyItems": [
      "Kill long-running pinned transaction",
      "expand log volume",
      "run log backup (truncation)",
      "remove abandoned replication slots",
      "optimize bulk load (use UNLOGGED if safe).",
      "Monitor log disk space carefully",
      "set alert at 70% log usage",
      "schedule bulk operations in chunks",
      "automate removal of old replication slots."
    ],
    "tags": [
      "transaction-log",
      "wal-full",
      "redo-log",
      "log-truncation",
      "bulk-load",
      "replication-slot"
    ],
    "linkedIntents": [
      "db.log_full"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-app-001",
    "title": "Application is returning HTTP 500 errors — how to trace the root cause?",
    "category": "Application",
    "subcategory": "HTTP Errors",
    "content": "### Overview\nApplication is returning HTTP 500 errors — how to trace the root cause?\n\n### Likely Causes\n- Unhandled exception in application code\n- Backend dependency failure (DB down, API timeout)\n- Missing configuration or environment variable\n- Insufficient file permissions for app process\n- Code bug introduced in recent deployment\n- Disk full preventing temporary file creation\n\n### Observability Signals\n- http_5xx_rate > 1% of traffic\n- Application logs showing 'Internal Server Error' or stack traces\n- APM dashboard showing spike in error rate per endpoint\n- Downstream service latency high coinciding with 500s\n\n### Recommended CLI Commands\ntail -f /var/log/app/error.log\njournalctl -u my-app-service -n 100\ncurl -v http://localhost:8080/health (check local health check)\ngrep -i \"exception\\|error\" /var/log/app/current.log\n\n### Step-by-Step RCA\n1) Inspect app error logs for stack traces and exception messages\n2) Identify if errors occur on specific endpoints or all requests\n3) Check backend health: can the app connect to its DB and cache?\n4) Correlate error spike with the most recent deployment — rollback if confirmed\n5) Check system resources: memory, disk space, and open file limits\n6) Use APM distributed tracing to see if an upstream service is the cause\n\n### Related Tools\nELK/Splunk, APM (Elastic, New Relic), journalctl, curl",
    "problem": "Unhandled exception in application code",
    "area": "HTTP Errors",
    "remedyItems": [
      "Fix code bug",
      "rollback deployment",
      "restore backend service",
      "fix config/env vars",
      "increase system limits.",
      "Implement robust error handling",
      "set alerts for 5xx rate > 0.5%",
      "use APM for every transaction",
      "ensure health check endpoint covers all dependencies."
    ],
    "tags": [
      "http-500",
      "internal-server-error",
      "stacktrace",
      "app-failure",
      "exception",
      "apm"
    ],
    "linkedIntents": [
      "app.error_500"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 92
  },
  {
    "id": "kb-app-002",
    "title": "High volume of HTTP 403 Forbidden errors — is it an attack or credential issue?",
    "category": "Application",
    "subcategory": "HTTP Errors",
    "content": "### Overview\nHigh volume of HTTP 403 Forbidden errors — is it an attack or credential issue?\n\n### Likely Causes\n- Expired or invalid API keys / OAuth tokens\n- IP blocking by WAF or firewall due to suspicious behavior\n- Change in application ACL or RBAC policy\n- Incorrect file/folder permissions on the web server\n- Bot/Attacker attempting to access restricted paths\n- Missing 'referer' or 'user-agent' headers required by policy\n\n### Observability Signals\n- http_403_rate > 5% of traffic\n- WAF logs showing 'Block' events with 403 response\n- Logs: 'Access denied for user X', 'Permission denied'\n- Spike in requests to hidden or admin paths (e.g. /wp-admin, /.env)\n\n### Recommended CLI Commands\ntail -f /var/log/nginx/access.log | grep \" 403 \"\ngrep \"Permission denied\" /var/log/app/error.log\nls -l /var/www/html (check web root permissions)\ncheck WAF console for active blocks on source IPs\ncurl -v -H \"Authorization: Bearer <token>\" http://api/resource\n\n### Step-by-Step RCA\n1) Identify which resource/URL is returning 403\n2) Check request logs: what is the source IP and User-Agent? Is it a bot pattern?\n3) Validate credentials: try the request manually with a known good token\n4) Check server-side permissions: does the app user have read/execute on the path?\n5) Review recent security policy or RBAC changes\n6) Check WAF/Security groups for IP-based blocking rules\n\n### Related Tools\nWAF logs, Nginx/Apache logs, curl, IAM/RBAC console",
    "problem": "Expired or invalid API keys / OAuth tokens",
    "area": "HTTP Errors",
    "remedyItems": [
      "Renew API keys/tokens",
      "fix file permissions",
      "update RBAC policy",
      "block malicious IPs",
      "update WAF whitelist.",
      "Monitor 403 rate by path",
      "automate token renewal",
      "regularly audit RBAC permissions",
      "enable WAF rate limiting."
    ],
    "tags": [
      "http-403",
      "forbidden",
      "access-denied",
      "rbac",
      "permission-denied",
      "waf-block",
      "auth-key"
    ],
    "linkedIntents": [
      "app.error_403"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-app-003",
    "title": "Application heap memory is peaking — how to identify a JVM or Node.js memory leak?",
    "category": "Application",
    "subcategory": "Resource Context",
    "content": "### Overview\nApplication heap memory is peaking — how to identify a JVM or Node.js memory leak?\n\n### Likely Causes\n- Memory leak in code (e.g. uncleared collections, listener leaks)\n- Cache size growing without limit (unbounded cache)\n- Sudden traffic spike requiring more memory per request\n- Heavy processing of large files in memory\n- Incorrect heap size configuration (Xmx/Max-Old-Generation too low)\n- High garbage collection overhead (Stop-the-world pauses)\n\n### Observability Signals\n- heap_utilization_percent > 90% (after GC)\n- Frequent 'Full GC' events in logs\n- Application latency increasing (GC pressure)\n- Pod or process reaching 'OOM' and restarting\n- APM showing upward tread in 'Old Gen' memory\n\n### Recommended CLI Commands\njmap -heap <pid> (JVM)\njstat -gcutil <pid> 1000 (JVM GC stats)\nnode --inspect app.js (Node.js memory profiling)\nheapdump (generate dump for analysis)\ncat /sys/fs/cgroup/memory/memory.usage_in_bytes (container memory)\n\n### Step-by-Step RCA\n1) Confirm if memory is reclaimed after Full GC — if not: it is a leak\n2) Generate a heap dump during the peak usage\n3) Use memory profile tools (Eclipse MAT, VisualVM, Chrome DevTools) to find 'leak suspects'\n4) Identify which objects are consuming the most space and their GC root paths\n5) Review code for static collections or long-lived caches that are never cleared\n6) Check if the leak is related to a specific endpoint or user action\n\n### Related Tools\nVisualVM, Eclipse MAT, Chrome DevTools (Node.js), jmap, Prometheus metrics",
    "problem": "Memory leak in code (e.g. uncleared collections, listener leaks)",
    "area": "Resource Context",
    "remedyItems": [
      "Fix code memory leak",
      "limit cache size",
      "increase heap size (Xmx)",
      "optimize GC settings",
      "use streaming for large files.",
      "Set heap alert at 80%",
      "include heap dumps in CI/CD load tests",
      "monitor GC pause time duration."
    ],
    "tags": [
      "memory-leak",
      "heap-space",
      "jvm-oom",
      "full-gc",
      "heap-dump",
      "resource-pressure",
      "node-memory"
    ],
    "linkedIntents": [
      "app.memory_leak"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-app-004",
    "title": "Application health check is failing — how to determine if the app is truly down?",
    "category": "Application",
    "subcategory": "Availability",
    "content": "### Overview\nApplication health check is failing — how to determine if the app is truly down?\n\n### Likely Causes\n- Application process crashed or unresponsive\n- Dependent service (DB, Cache) down causing health check to fail\n- Network issue between Load Balancer and App container/VM\n- Health check endpoint misconfigured (wrong path, port, or timeout)\n- App stuck in long-running GC or startup phase\n- Resource exhaustion (ports, file descriptors) preventing health check calls\n\n### Observability Signals\n- health_check_status == failing\n- Load balancer has marked the instance as 'OUT OF SERVICE'\n- 'Connection refused' or 'Timeout' in health check logs\n- App logs showing 'shutting down' or 'startup failure'\n- Target response time for health check > 5s\n\n### Recommended CLI Commands\ncurl -iv http://localhost:8080/health\nps aux | grep <app_process>\nnetstat -an | grep 8080\ntail -f /var/log/app/health_check.log\nkubectl describe pod <pod_name> (check Liveness/Readiness probes)\n\n### Step-by-Step RCA\n1) Try to reach the health check URL manually from the local host\n2) Check the app process status and resource usage (CPU/Memory)\n3) Read the app logs to see if it is reporting a dependency failure (e.g. 'DB unavailable')\n4) Check the network: can the Load Balancer reach the app port? (Check Security Groups/Firewall)\n5) Verify health check configuration: does it have a long enough timeout for cold starts?\n6) Look for 'Liveness probe failed' events if running in Kubernetes\n\n### Related Tools\ncurl, kubectl, LB health logs, systemctl, APM",
    "problem": "Application process crashed or unresponsive",
    "area": "Availability",
    "remedyItems": [
      "Restart app process",
      "restore dependent service",
      "fix health check config",
      "update firewall rules",
      "increase health check timeout.",
      "Monitor dependent service health separately",
      "alert on 'unhealthy instance' count",
      "implement circuit breakers for dependencies."
    ],
    "tags": [
      "health-check-failure",
      "app-down",
      "liveness-probe",
      "readiness-probe",
      "unresponsive",
      "restart-loop"
    ],
    "linkedIntents": [
      "app.health_failure"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 96
  },
  {
    "id": "kb-app-005",
    "title": "App transaction latency has spiked — how to isolate the bottleneck?",
    "category": "Application",
    "subcategory": "Latency",
    "content": "### Overview\nApp transaction latency has spiked — how to isolate the bottleneck?\n\n### Likely Causes\n- Downstream external API responding slowly\n- Database query performance degradation (slow query)\n- High CPU utilization on the app host (context switching)\n- Lock contention in multi-threaded code\n- GC pauses or memory pressure causing execution delays\n- Network congestion or high packet loss\n\n### Observability Signals\n- transaction_latency_ms > 2x normal baseline\n- APM showing long spans for external calls or DB queries\n- CPU load average high coinciding with latency spike\n- 'Stop the world' GC events in logs\n- SLA breach alerts for p95/p99 latency\n\n### Recommended CLI Commands\ntop -n 1 -b\niostat -xz 1 10\ncurl -o /dev/null -s -w 'Total time: %{time_total}\\n' http://app/endpoint\njstack <pid> (capture thread dump to find lock contention)\nvmstat 1 10\n\n### Step-by-Step RCA\n1) View APM transaction trace: which component (DB, Remote call, App logic) takes the most time?\n2) Compare latency of the app with its dependencies to find the correlation\n3) Check host resources: is the CPU saturated? Is there high I/O wait?\n4) Collect a thread dump: are many threads blocked on the same resource/lock?\n5) Review recent code changes for new loops, non-async calls, or synchronized blocks\n6) Check garbage collection logs for long pause times\n\n### Related Tools\nAPM (Datadog, Dynatrace), jstack/gstack, top, curl, browser dev tools",
    "problem": "Downstream external API responding slowly",
    "area": "Latency",
    "remedyItems": [
      "Optimize slow queries",
      "implement caching",
      "increase concurrent threads",
      "fix downstream API",
      "scale app horizontally.",
      "Monitor p99 latency by endpoint",
      "implement circuit breakers",
      "set timeouts for all remote calls",
      "perform regular load testing."
    ],
    "tags": [
      "latency-spike",
      "slow-transaction",
      "p99-latency",
      "bottleneck",
      "external-call",
      "gc-pause"
    ],
    "linkedIntents": [
      "app.latency_spike"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-app-006",
    "title": "Application has stopped logging — how to debug logging pipeline issues?",
    "category": "Application",
    "subcategory": "Observability Status",
    "content": "### Overview\nApplication has stopped logging — how to debug logging pipeline issues?\n\n### Likely Causes\n- Disk space full on the logging volume\n- Permission denied for the app to write to log directory\n- Log rotation issue — log file held by another process or deleted\n- Logging level changed to 'OFF' in configuration\n- Logging agent (Fluentd, Logstash) crashed or stopped\n- Syslog or network logging endpoint unreachable\n\n### Observability Signals\n- log_volume_ingested == 0\n- 'No logs found' in ELK/Splunk for the app\n- App logs folder showing old timestamps on files\n- Errors in app console: 'Failed to write to log', 'Disk full'\n- Logging agent daemon (e.g., fluentd) not running\n\n### Recommended CLI Commands\ndf -h (check disk space)\nls -ld /var/log/my-app (check directory permissions)\nlsof | grep my-app.log (see which process has the file open)\ntail -f /var/log/syslog (check for system-level logging errors)\nsystemctl status fluentd|logstash\n\n### Step-by-Step RCA\n1) Check the local log file timestamp: is the app actually writing anything?\n2) Check disk space: a full disk is the #1 cause of stopped logs\n3) Verify directory permissions: can the app user write to the log path?\n4) Check the logging agent: is it running and consuming the logs?\n5) Validate the app configuration: was the log level changed recently?\n6) Check connectivity to the centralized logging server (e.g. check ELK port 5044)\n\n### Related Tools\ndf, tail, lsof, systemctl, netstat",
    "problem": "Disk space full on the logging volume",
    "area": "Observability Status",
    "remedyItems": [
      "Free disk space",
      "fix directory permissions",
      "restart logging agent",
      "restore log rotation config",
      "fix log-levels in config.",
      "Monitor log disk space",
      "alert on 'missing logs' for active apps",
      "use non-blocking logging async appenders."
    ],
    "tags": [
      "missing-logs",
      "disk-full",
      "logging-failure",
      "log-rotation",
      "fluentd",
      "permission-denied"
    ],
    "linkedIntents": [
      "app.logging_stopped"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-app-007",
    "title": "High CPU usage on application host — identifying the specific thread or process?",
    "category": "Application",
    "subcategory": "Resource Context",
    "content": "### Overview\nHigh CPU usage on application host — identifying the specific thread or process?\n\n### Likely Causes\n- Application performing heavy computation or encryption\n- Infinite loop in code\n- High volume of concurrent requests exceeding CPU capacity\n- Context switching due to too many active threads\n- Garbage collection (GC) activity using CPU cycles\n- Malware or unauthorized process (miner) running on host\n\n### Observability Signals\n- host_cpu_utilization > 85%\n- CPU Load average > number of cores\n- App latency increasing (CPU throttling)\n- metrics for 'context switches' spiking\n- Top process in 'top' showing > 100% CPU usage\n\n### Recommended CLI Commands\ntop -H -p <pid> (Identify high-CPU threads within a process)\nhtop (Visual process monitor)\npidstat -u 5 (Monitor CPU per PID over time)\njstack <pid> (Capture thread dump to see what high-CPU threads are doing)\nps -mo pid,tid,%cpu,command -p <pid>\n\n### Step-by-Step RCA\n1) Use 'top' or 'htop' to identify the top CPU-consuming process\n2) If it is the app: use 'top -H' or 'ps -mo' to find the specific thread ID (TID) consuming CPU\n3) Capture a thread dump (jstack for JVM, gstack for C++) and match the TID (hex) to the dump\n4) Identify the stack trace of the offending thread: what code is it running?\n5) Check logs for high-frequency patterns or error loops coinciding with CPU spike\n6) Isolate the host to see if usage drops without incoming traffic\n\n### Related Tools\ntop, htop, jstack, pidstat, perf",
    "problem": "Application performing heavy computation or encryption",
    "area": "Resource Context",
    "remedyItems": [
      "Optimize offending code loop",
      "scale CPU resources (Vertical/Horizontal)",
      "limit request rate (Throttling)",
      "fix infinite loop",
      "tune GC settings.",
      "Set CPU alert at 75%",
      "perform profiling in dev for new features",
      "use rate limiting at the gateway."
    ],
    "tags": [
      "high-cpu",
      "cpu-spike",
      "thread-dump",
      "context-switch",
      "infinite-loop",
      "cpu-bottleneck"
    ],
    "linkedIntents": [
      "app.cpu_spike"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 90
  },
  {
    "id": "kb-app-008",
    "title": "Spike in application queue depth — how to handle scaling delays?",
    "category": "Application",
    "subcategory": "Throughput",
    "content": "### Overview\nSpike in application queue depth — how to handle scaling delays?\n\n### Likely Causes\n- Incoming request rate higher than processing capacity\n- Downstream bottleneck causing workers to wait and tasks to queue\n- Slow worker process due to resource exhaustion\n- Scaling action (Auto-scaling) taking too long to provision new instances\n- Queue consumer (e.g. Celery, RabbitMQ consumer) crashed\n\n### Observability Signals\n- queue_depth > threshold (e.g. > 1000 items)\n- message_age_ms increasing (latency for queued tasks)\n- Rate of ingestion > rate of processing\n- 'Queue full' errors in application logs\n- Auto-scaling metric showing 'Pending' state for many minutes\n\n### Recommended CLI Commands\nrabbitmqctl list_queues (RabbitMQ)\nredis-cli llen my-queue (Redis/Celery)\nkubectl get hpa (Check Kubernetes Auto-scaling status)\ntop (Check if consumers are CPU bound)\njournalctl -u celery-worker -f\n\n### Step-by-Step RCA\n1) Check the queue depth and age: is it a temporary spike or sustained growth?\n2) Identify if consumers are running: 'ps aux | grep worker' or check agent heartbeats\n3) Check consumer efficiency: are they processing messages slower than usual? (Check their own logs/latency)\n4) Verify auto-scaling: has a scaling event triggered? Is it stuck in 'Provisioning'?\n5) Check downstream dependencies: are workers blocked waiting for a DB or external API?\n6) Emergency action: Drain the queue by adding more manual workers or purging non-critical messages\n\n### Related Tools\nRabbitMQ Management, Redis-cli, HPA (K8s), Prometheus queue metrics",
    "problem": "Incoming request rate higher than processing capacity",
    "area": "Throughput",
    "remedyItems": [
      "Scale up consumers",
      "optimize worker code",
      "purge non-critical queue items",
      "fix downstream bottleneck",
      "tune auto-scaling thresholds.",
      "Monitor p99 queue age",
      "set lower scaling thresholds",
      "implement DLQ (Dead Letter Queue) for failing tasks."
    ],
    "tags": [
      "queue-depth",
      "message-backlog",
      "worker-lag",
      "auto-scaling-delay",
      "throughput-bottleneck",
      "rabbitmq",
      "celery"
    ],
    "linkedIntents": [
      "app.queue_spike"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 88
  },
  {
    "id": "kb-app-009",
    "title": "App background jobs are failing — what is causing the worker processing errors?",
    "category": "Application",
    "subcategory": "Job Processing",
    "content": "### Overview\nApp background jobs are failing — what is causing the worker processing errors?\n\n### Likely Causes\n- Code bug in the background task logic\n- Data inconsistency in the input message/job payload\n- Task timeout reached before completion\n- Worker process lost connectivity to the DB/Cache\n- Missing dependencies or libraries on the worker host\n- Concurrency issues (Race conditions) in distributed workers\n\n### Observability Signals\n- job_failure_rate > 2%\n- Worker logs showing 'Task failed', 'TimeoutException', or stack traces\n- Many items in Dead Letter Queue (DLQ)\n- Job retries count peaking\n- UI showing 'Processing failed' for async actions\n\n### Recommended CLI Commands\ntail -f /var/log/app/worker.log\ncelery -A proj inspect scheduled (Check Celery status)\nkubectl logs <worker_pod>\nredis-cli hgetall <task_id> (Check job metadata in Redis)\ngrep \"Error\" /var/log/app/worker-error.log\n\n### Step-by-Step RCA\n1) Identify the specific error from worker logs or the failure tracking system (e.g. Sentry)\n2) Inspect the job payload: is the input data valid? Are there missing fields?\n3) Check task duration: is it hitting a hard timeout (e.g. 30s) set in the configuration?\n4) Verify connectivity: can the worker reach the database and other services it needs?\n5) Check for recent code deployments to worker nodes\n6) Analyze the Dead Letter Queue: are all failed jobs of the same type?\n\n### Related Tools\nSentry, Celery, RabbitMQ management, Flower (Celery monitor), Splunk",
    "problem": "Code bug in the background task logic",
    "area": "Job Processing",
    "remedyItems": [
      "Fix background task code",
      "increase task timeout",
      "clean up invalid job data",
      "restore worker connectivity",
      "re-process failed jobs from DLQ.",
      "Implement idempotent tasks",
      "set alerts for DLQ size",
      "use detailed logging for job payloads",
      "separate worker pools by task priority."
    ],
    "tags": [
      "background-job",
      "worker-failure",
      "dlq",
      "task-timeout",
      "job-retry",
      "data-inconsistency",
      "celery-error"
    ],
    "linkedIntents": [
      "app.job_failure"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-app-010",
    "title": "Application startup is extremely slow — identifying initialization bottlenecks?",
    "category": "Application",
    "subcategory": "Lifecycle",
    "content": "### Overview\nApplication startup is extremely slow — identifying initialization bottlenecks?\n\n### Likely Causes\n- Large number of dependencies being loaded/scanned at startup\n- Synchronous connection establishment to multiple backends\n- Heavy database migration or schema check on boot\n- Initial cache warming / pre-loading large data sets\n- Slow DNS resolution during initialization\n- Resource constraints (CPU/Disk) during the peak startup period\n\n### Observability Signals\n- startup_duration_sec > p95 target (e.g. > 60s)\n- K8s Readiness probe failing for several minutes before passing\n- Logs showing large gaps between 'Starting' and 'Ready' markers\n- CPU utilization at 100% during the first 2 minutes of process life\n- App timeout errors during the initial boot phase\n\n### Recommended CLI Commands\nsystemd-analyze blame (If running as a systemd service)\nkubectl describe pod (Check probe timing and container events)\nstrace -f -e trace=network,file -p <booting_pid> (Trace startup calls)\ntime my-app-start-command\njcheck (JVM startup analysis)\n\n### Step-by-Step RCA\n1) Analyze logs with timestamps to see which phase takes the longest (e.g. Bean init, DB migrator)\n2) Profile the startup: use a profiler to find the longest-running constructors or init methods\n3) Check external dependencies: is the app waiting for a slow DB connection or DNS lookup?\n4) Audit startup logic: are there tasks that can be moved to background or lazy-loaded?\n5) Review resource limits: is the process throttled on CPU during boot? (Check K8s CPU limits)\n6) Evaluate DB migrations: does every startup need to check 1000+ migration files?\n\n### Related Tools\nstrace, prometheus metrics, application logs, profilers (JProfiler, YourKit)",
    "problem": "Large number of dependencies being loaded/scanned at startup",
    "area": "Lifecycle",
    "remedyItems": [
      "Move init tasks to background",
      "implement lazy loading",
      "optimize DB migrations",
      "increase startup CPU allotment",
      "fix DNS resolution.",
      "Measure and alert on startup time",
      "use snapshots for data pre-loading",
      "disable unnecessary component scanning."
    ],
    "tags": [
      "slow-startup",
      "boot-time",
      "initialization",
      "readiness-delay",
      "dependency-scan",
      "warmup"
    ],
    "linkedIntents": [
      "app.startup_slow"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 86
  },
  {
    "id": "kb-app-011",
    "title": "Sudden drop in application requests — is it a network, gateway, or client-side issue?",
    "category": "Application",
    "subcategory": "Throughput",
    "content": "### Overview\nSudden drop in application requests — is it a network, gateway, or client-side issue?\n\n### Likely Causes\n- Upstream Load Balancer or API Gateway failing\n- DNS resolution failure for the application domain\n- Global network outage (ISP or Cloud Region issue)\n- Client-side application bug preventings requests\n- SSL certificate expired causing handshake failures\n- Accidental rollout of a 'block all' firewall rule or WAF policy\n\n### Observability Signals\n- request_rate < 50% of historical baseline\n- Gateway logs showing 502/504 errors or 0 requests reaching the app\n- DNS monitoring showing resolution errors\n- SSL expiry alerts\n- Global traffic dashboard showing drop from all regions\n\n### Recommended CLI Commands\ndig +short application.com (Check DNS resolution)\ncurl -Iv https://application.com (Check SSL and Gateway response)\ncheck Cloud status pages (AWS, GCP, Azure)\ncheck WAF/Load Balancer logs for dropped packets\ntail -f /var/log/nginx/access.log (Check if any traffic is hitting the web server)\n\n### Step-by-Step RCA\n1) Verify if the drop is real: check different observability sources (Logs, Metrics, External Probes)\n2) Test the path from outside the network: can you reach the homepage from a mobile network/home?\n3) Check DNS: is the record pointing to the correct Load Balancer IP?\n4) Inspect the Gateway/LB logs: are requests being blocked there? Look for 4xx/5xx errors from the LB itself\n5) Check SSL certificates: use 'openssl s_client' to verify the cert isn't expired\n6) Correlate with recent infrastructure changes: was a firewall rule or WAF policy updated?\n\n### Related Tools\ndig, curl, openssl, Cloud Console (CloudWatch, GCP Monitoring), Pingdom/UptimeRobot",
    "problem": "Upstream Load Balancer or API Gateway failing",
    "area": "Throughput",
    "remedyItems": [
      "Fix Gateway/LB config",
      "renew SSL certificate",
      "restore DNS records",
      "revert firewall/WAF rule",
      "escalate to ISP/Cloud provider.",
      "Implement multi-region redundancy",
      "set alerts for sudden traffic drops",
      "automate SSL renewals with cert-manager."
    ],
    "tags": [
      "traffic-drop",
      "throughput-low",
      "dns-failure",
      "ssl-expiry",
      "gateway-error",
      "network-outage",
      "black-hole"
    ],
    "linkedIntents": [
      "app.traffic_drop"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 94
  },
  {
    "id": "kb-app-012",
    "title": "Application session loss / logout issues — identifying session persistence failures?",
    "category": "Application",
    "subcategory": "User Experience",
    "content": "### Overview\nApplication session loss / logout issues — identifying session persistence failures?\n\n### Likely Causes\n- Session store (Redis/Memcached) down or unresponsive\n- Load balancer 'sticky sessions' misconfigured\n- Session cookie domain or security settings (Secure, HttpOnly, SameSite) incorrect\n- Clock skew between app servers in a cluster\n- Session timeout set too low in configuration\n- Cache eviction on session store due to memory pressure\n\n### Observability Signals\n- session_error_rate peaking\n- UI logs showing 'User session expired' or 'unauthorized' redirects\n- Redis/Session store latency high\n- Requests from same user bouncing between different backend servers without persistence\n- Cookies missing in client-side browser dev tools\n\n### Recommended CLI Commands\nredis-cli ping (Check Redis health)\nredis-cli info memory (Check for eviction/memory pressure)\ncurl -I http://app (Check 'Set-Cookie' header details)\ncheck App logs for 'Session store exception' or 'decryption failure'\ncompare 'date' output on multiple cluster nodes (check clock skew)\n\n### Step-by-Step RCA\n1) Verify if the issue is global or per-user: can you reproduce it on your own machine?\n2) Check the session store health: is Redis running? Is it evicting keys due to full memory?\n3) Inspect the cookie in browser dev tools: is it sent? Is it being rejected due to SameSite/Secure flags?\n4) Check the Load Balancer: is it correctly routing the same user to the same session context? (Sticky sessions)\n5) Check for 'Clock Skew': different servers having different times can invalidate session timestamps\n6) Correlate with recent config changes to session duration or cookie settings\n\n### Related Tools\nredis-cli, browser dev tools, curl, ntpstat, tail logs",
    "problem": "Session store (Redis/Memcached) down or unresponsive",
    "area": "User Experience",
    "remedyItems": [
      "Restore session store",
      "fix session config",
      "synchronize cluster clocks",
      "update cookie settings",
      "increase session timeout.",
      "Monitor session store memory usage",
      "implement persistent session storage",
      "use NTP for all servers",
      "audit session settings before deployment."
    ],
    "tags": [
      "session-loss",
      "logout-issue",
      "sticky-session",
      "cookie-error",
      "redis-session",
      "clock-skew",
      "persistence-failure"
    ],
    "linkedIntents": [
      "app.session_failure"
    ],
    "lastUpdated": "2026-03-24T00:00:00Z",
    "effectiveness": 89
  }
  ,
  {
    "id": "kb-link-006",
    "title": "Optical interface Rx power is degrading — causing intermittent errors. What are the causes?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": `### Overview
Optical interface Rx power is degrading — causing intermittent errors. What are the causes?

### Likely Causes
- Dirty or contaminated fiber connector (most common cause)
- Fiber bend radius violation causing signal attenuation
- Aging SFP transceiver with declining Tx power
- Fiber splice degradation or water ingress in outdoor plant
- Incorrect fiber type (single-mode SFP on multi-mode fiber)
- Long cable run exceeding SFP Rx sensitivity budget

### Observability Signals
- optical_rx_power_dbm dropping below -20 dBm
- DDM Rx power alarms (low warning, low alarm thresholds)
- CRC errors increasing as Rx power degrades
- Intermittent link flaps near Rx power sensitivity limit
- DDM Tx power normal (isolates to fiber/connector, not SFP Tx)

### Recommended CLI Commands
show interface <int> transceiver
ddm interface <int>
show interface <int> counters errors
show environment (optical alarms)
otdr test interface <int> (where supported)

### Step-by-Step RCA
1) Pull DDM Rx power: compare to SFP minimum Rx sensitivity (-18 to -22 dBm typical)
2) If Rx power marginal but Tx normal: fiber/connector is suspect, not SFP Tx
3) Clean fiber connector with approved cleaning kit and re-seat
4) Test with known-good short patch to isolate plant fiber vs connector
5) If long-haul: run OTDR to identify splice loss or fiber bend
6) Check fiber type compatibility: SMF vs MMF SFP mismatch

### Related Tools
DDM/DOM, OTDR, fiber inspection scope, SNMP`,
    "problem": "Dirty or contaminated fiber connector (most common cause)",
    "area": "Link Layer",
    "remedyItems": [
      "Clean fiber connectors; replace damaged patch cable; correct fiber type mismatch; replace aging SFP; repair splice.",
      "Schedule quarterly fiber connector cleaning; baseline DDM Rx power per link at commissioning; alert when Rx drops 3 dB from baseline."
    ],
    "tags": [
      "optical",
      "rx-power",
      "ddm",
      "fiber",
      "sfp",
      "connector",
      "otdr"
    ],
    "linkedIntents": [
      "link.optical_degraded"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-link-007",
    "title": "Interface is in err-disable state — what triggered it and how to recover?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": `### Overview
Interface is in err-disable state — what triggered it and how to recover?

### Likely Causes
- BPDU Guard violation: STP BPDU received on PortFast-enabled access port
- UDLD aggressive mode detecting unidirectional link
- Port-security MAC address violation
- Loop detection (UDLD, loop-guard, or vendor loop-detect)
- PoE overload causing err-disable
- Storm control threshold exceeded
- DHCP snooping rate exceeded

### Observability Signals
- interface_oper_status == errdisable
- Syslog: 'err-disabled' with reason code
- show errdisable recovery showing reason
- Interface in down state with errdisable reason
- Port-security violation counter incrementing

### Recommended CLI Commands
show interfaces status err-disabled
show errdisable recovery
show errdisable detect
show logging | inc err-disable|BPDU|UDLD|violation
show port-security interface <int>
show spanning-tree interface <int>

### Step-by-Step RCA
1) Identify err-disable reason: 'show interfaces status err-disabled'
2) BPDU guard: unauthorized switch connected to access port?
3) UDLD: unidirectional fiber issue? Enable UDLD neighbor check
4) Port-security: MAC violation — unknown device or MAC spoofing?
5) Loop-detect: physical loop in wiring closet?
6) Resolve root cause before re-enabling port

### Related Tools
Syslog, SNMP, port-security, UDLD, STP logs`,
    "problem": "BPDU Guard violation: STP BPDU received on PortFast-enabled access port",
    "area": "Link Layer",
    "remedyItems": [
      "Remove offending device or loop; fix fiber (UDLD); re-enable port after fix: 'shutdown/no shutdown' or configure err-disable recovery timer.",
      "Configure err-disable recovery with appropriate timer per reason; alert on err-disable events; document allowed devices per port."
    ],
    "tags": [
      "errdisable",
      "bpdu-guard",
      "udld",
      "port-security",
      "loop-detect",
      "storm-control"
    ],
    "linkedIntents": [
      "link.errdisable"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-routing-003",
    "title": "IS-IS adjacency is not forming or has dropped — what should I check?",
    "category": "Network",
    "subcategory": "Routing",
    "content": `### Overview
IS-IS adjacency is not forming or has dropped — what should I check?

### Likely Causes
- IS-IS area ID mismatch between peers (Level-1 vs Level-2 boundary)
- Authentication type or key mismatch
- MTU mismatch causing LSP fragmentation
- Duplicate System ID in the domain
- Interface not enabled for IS-IS
- Hello padding causing oversized frames on some media types
- IP address missing on IS-IS enabled interface

### Observability Signals
- isis_neighbor_state != UP
- ISIS adjacency change events in syslog
- IS-IS hello PDU received but adjacency not forming
- Syslog: 'IS-IS authentication failed', 'area mismatch'
- isis_adj_changes > 3 in monitoring window

### Recommended CLI Commands
show isis neighbors
show isis database
show clns interface
show run | sec router isis
show logging | inc ISIS|IS-IS
debug isis adj-packets (brief window)

### Step-by-Step RCA
1) Check neighbor state: 'show isis neighbors' — Init vs Full
2) Verify area ID matches on both ends (Level-1 must share area)
3) Validate auth type and key match (MD5 / plaintext)
4) Check MTU: IS-IS hellos include padding by default to test MTU
5) Confirm no duplicate System IDs: 'show isis database'
6) Ensure interface has IP address and 'ip router isis' applied

### Related Tools
IS-IS logs, Syslog, SNMP`,
    "problem": "IS-IS area ID mismatch between peers (Level-1 vs Level-2 boundary)",
    "area": "Routing",
    "remedyItems": [
      "Align area IDs; match auth keys; set 'no isis hello padding' if MTU limited; fix duplicate SID; assign IP to interface.",
      "Pre-validate IS-IS config with template comparison before deploy; monitor adjacency count per device; unique SID assignment process."
    ],
    "tags": [
      "isis",
      "adjacency",
      "area-id",
      "authentication",
      "mtu",
      "system-id"
    ],
    "linkedIntents": [
      "routing.isis_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-routing-004",
    "title": "EIGRP route is stuck in Active state — what causes SIA and how to recover?",
    "category": "Network",
    "subcategory": "Routing",
    "content": `### Overview
EIGRP route is stuck in Active state — what causes SIA and how to recover?

### Likely Causes
- Stuck-In-Active (SIA): query not replied by distant neighbor within active timer
- Flapping link causing repeated DUAL reconvergence
- Passive interface configured on link that should be active
- EIGRP query scope too wide — query propagating across entire domain
- Neighbor not responding to query due to CPU overload
- Route summarization missing — queries leaking across domain boundary

### Observability Signals
- eigrp_sia_count > 0 in logs
- Route stuck in Active state in topology table
- Neighbor dropped after active timer expiry
- Syslog: 'DUAL-3-SIA: Route stuck in active state'
- Repeated route flaps in routing table

### Recommended CLI Commands
show ip eigrp topology active
show ip eigrp neighbors
show logging | inc DUAL|SIA|EIGRP
show ip eigrp topology all-links
show ip eigrp interfaces
show ip eigrp traffic

### Step-by-Step RCA
1) Check for SIA routes: 'show ip eigrp topology active'
2) Identify which neighbor failed to reply to query
3) Check link quality to that neighbor — lossy link?
4) Review EIGRP query scope: implement summarization to limit query propagation
5) Check passive interface config — is a needed link passive?
6) Check CPU on neighbor that went SIA — was it overwhelmed?

### Related Tools
EIGRP logs, Syslog, SNMP`,
    "problem": "Stuck-In-Active (SIA): query not replied by distant neighbor within active timer",
    "area": "Routing",
    "remedyItems": [
      "Fix underlying link issue; implement EIGRP summarization at distribution/core; increase SIA timer if needed; add stub routing at edges.",
      "Use EIGRP stub on spoke/leaf routers to limit queries; implement summarization; monitor SIA count via SNMP."
    ],
    "tags": [
      "eigrp",
      "stuck-in-active",
      "sia",
      "dual",
      "query",
      "summarization",
      "stub"
    ],
    "linkedIntents": [
      "routing.eigrp_stuck"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-routing-005",
    "title": "Routes are leaking between routing domains or VRFs — how to detect and contain a route leak?",
    "category": "Network",
    "subcategory": "Routing",
    "content": `### Overview
Routes are leaking between routing domains or VRFs — how to detect and contain a route leak?

### Likely Causes
- Missing or incorrect prefix-list/route-map on redistribution point
- BGP community no-export not set on routes that should stay internal
- Default route accidentally redistributed into IGP
- VRF route-target import/export misconfiguration leaking routes across VPNs
- Static route redistributed without tag-based loop prevention
- Summarization suppressing specific routes but redistributing summary incorrectly

### Observability Signals
- Unexpected prefixes appearing in routing table
- BGP peers receiving routes they should not see
- Traffic taking unexpected path (traceroute anomaly)
- Route metric/source incorrect (e.g., OSPF route in BGP domain)
- Duplicate routes with different sources in RIB

### Recommended CLI Commands
show ip route <leaked-prefix>
show bgp neighbors <peer> advertised-routes | inc <prefix>
show ip bgp <prefix> (check communities)
show route-map <n>
show ip prefix-list
show ip ospf database | inc <leaked-prefix>

### Step-by-Step RCA
1) Identify leaked prefix: where is it originating and where is it appearing?
2) Trace the redistribution path — which device is injecting it?
3) Check route-map on redistribution: is prefix-list applied inbound and outbound?
4) For BGP: check community tags — is no-export missing?
5) For VRF: check RT import policy — is it too broad?
6) Apply deny rule for leaked prefix immediately, then fix root cause

### Related Tools
BGP logs, routing table, Syslog, looking glass`,
    "problem": "Missing or incorrect prefix-list/route-map on redistribution point",
    "area": "Routing",
    "remedyItems": [
      "Apply prefix-list deny on redistribution; add BGP no-export community; fix RT import policy; add route tags for loop prevention.",
      "Always use explicit permit prefix-lists on all redistribution points; peer review redistribution configs; lab test before production."
    ],
    "tags": [
      "route-leak",
      "redistribution",
      "bgp-community",
      "prefix-list",
      "vrf",
      "no-export"
    ],
    "linkedIntents": [
      "routing.route_leak"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-001",
    "title": "A Layer 2 loop is suspected — broadcast storm and MAC flapping occurring. How to detect and break it?",
    "category": "Network",
    "subcategory": "Switching",
    "content": `### Overview
A Layer 2 loop is suspected — broadcast storm and MAC flapping occurring. How to detect and break it?

### Likely Causes
- PortFast missing on access ports — TCN floods on every endpoint connect/disconnect
- bpdu-filter applied incorrectly disabling STP on a port (loop undetected)
- Unmanaged switch inserted creating loop with no BPDU awareness
- STP accidentally disabled (no spanning-tree) on a VLAN
- Incorrect cable creating physical loop in wiring closet
- MST region boundary misconfiguration creating L2 loop

### Observability Signals
- broadcast_rate_pps spiking to wire rate
- MAC address flapping (same MAC seen on multiple ports)
- CPU at 100% on switch processing broadcasts
- Interface utilization at 100% in both directions
- Syslog: 'MAC_MOVE', 'topology change flood'

### Recommended CLI Commands
show spanning-tree detail | inc ieee|occur|from
show mac address-table | inc <mac>
show interfaces counters (look for wire-rate utilization)
show logging | inc LOOP|MAC_MOVE|topology
show spanning-tree vlan <id>
show storm-control

### Step-by-Step RCA
1) Confirm loop: MAC address seen on 2+ ports simultaneously
2) Identify affected VLAN via broadcast storm on specific VLAN
3) Disconnect suspect links one at a time until storm stops
4) Check for bpdu-filter on any port — if present, likely cause
5) Check all access ports for PortFast + BPDU guard
6) After storm cleared: enable storm-control as immediate protection

### Related Tools
STP logs, Syslog, MAC address table, SNMP`,
    "problem": "PortFast missing on access ports — TCN floods on every endpoint connect/disconnect",
    "area": "Switching",
    "remedyItems": [
      "Disconnect looping cable; enable BPDU guard on access ports; remove bpdu-filter misuse; re-enable STP on affected VLAN.",
      "Enable BPDU guard on all access ports; deploy loop-guard on uplinks; enable storm control on all access ports; audit unmanaged switches."
    ],
    "tags": [
      "stp-loop",
      "broadcast-storm",
      "mac-flap",
      "bpdu-filter",
      "portfast",
      "loop-guard"
    ],
    "linkedIntents": [
      "switching.stp_loop"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-002",
    "title": "Traffic not passing across trunk correctly — VLAN mismatch suspected. What should I check?",
    "category": "Network",
    "subcategory": "Switching",
    "content": `### Overview
Traffic not passing across trunk correctly — VLAN mismatch suspected. What should I check?

### Likely Causes
- Native VLAN mismatch on 802.1Q trunk (CDP warning visible)
- VLAN not in allowed list on trunk interface
- Access port assigned to wrong VLAN
- VTP domain mismatch causing VLAN database inconsistency
- Voice VLAN not configured on access port for IP phone
- VLAN pruning removing needed VLAN from trunk

### Observability Signals
- Hosts in VLAN cannot reach each other across trunk
- CDP/LLDP showing native VLAN mismatch warning
- ARP requests not reaching hosts across trunk
- Syslog: 'native VLAN mismatch'
- show interfaces trunk shows VLAN not in 'VLANs allowed and active'

### Recommended CLI Commands
show interfaces trunk
show vlan brief
show interfaces <int> switchport
show cdp neighbors <int> detail | inc VLAN
show run interface <int> | inc vlan
show vtp status

### Step-by-Step RCA
1) 'show interfaces trunk' — check 'VLANs allowed and active in management domain'
2) Check native VLAN both ends match: 'show interfaces trunk'
3) Verify VLAN is in allowed list on trunk: add if missing
4) For access port: 'show interfaces <int> switchport' — correct access VLAN?
5) Check VTP: if VTP, VLAN must exist in VTP database
6) Confirm VLAN is active: 'show vlan brief' — is it active or suspended?

### Related Tools
Syslog, CDP/LLDP, SNMP, VTP logs`,
    "problem": "Native VLAN mismatch on 802.1Q trunk (CDP warning visible)",
    "area": "Switching",
    "remedyItems": [
      "Add VLAN to trunk allowed list; align native VLAN both ends; correct access VLAN assignment; fix VTP domain; activate VLAN.",
      "Always explicitly define allowed VLANs on trunks; disable VTP (use VTP transparent or off); alert on native VLAN mismatch."
    ],
    "tags": [
      "vlan-mismatch",
      "native-vlan",
      "trunk",
      "vtp",
      "vlan-allowed",
      "access-vlan"
    ],
    "linkedIntents": [
      "switching.vlan_mismatch"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-003",
    "title": "MAC address table overflow causing traffic flooding — how to diagnose and mitigate?",
    "category": "Network",
    "subcategory": "Switching",
    "content": `### Overview
MAC address table overflow causing traffic flooding — how to diagnose and mitigate?

### Likely Causes
- Malicious CAM table overflow attack (MAC flooding tool)
- VM live migration causing MAC moves across physical hosts
- MAC aging timer too short causing repeated relearning and flooding
- MAC table exhausted — switch capacity reached
- Spanning tree topology change resetting MAC aging to 15 seconds
- High-density environment exceeding switch MAC table capacity

### Observability Signals
- mac_table_utilization_percent near 100%
- High unicast flooding rate on all ports
- MAC entries seen on multiple ports (MAC moves)
- Syslog: 'MAC_MOVE', 'mac-address-table full'
- Traffic visible on ports that should not receive unicast

### Recommended CLI Commands
show mac address-table count
show mac address-table aging-time
show mac address-table | count
show logging | inc MAC_MOVE
show spanning-tree detail | inc topology
show port-security (if deployed)

### Step-by-Step RCA
1) Check MAC table utilization: 'show mac address-table count'
2) Check for MAC flood attack: many random MACs from single port?
3) Check for STP topology change resetting aging: 'show spanning-tree'
4) For VM migration: is flooding expected during vMotion events?
5) Check aging timer: if very short, relearning constantly
6) Use port-security max MACs to limit CAM entries per port

### Related Tools
Syslog, SNMP, port-security, STP logs`,
    "problem": "Malicious CAM table overflow attack (MAC flooding tool)",
    "area": "Switching",
    "remedyItems": [
      "Enable port-security to limit MACs per port; filter MAC flood source; increase MAC table; tune aging timer; fix STP topology changes.",
      "Enable port-security on access ports with max-mac limit; monitor MAC table utilization; alert on MAC move rate spikes."
    ],
    "tags": [
      "mac-flood",
      "cam-overflow",
      "mac-table",
      "port-security",
      "vm-migration",
      "unicast-flooding"
    ],
    "linkedIntents": [
      "switching.mac_flood"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-004",
    "title": "LACP port-channel has gone down or lost all members — how to restore?",
    "category": "Network",
    "subcategory": "Switching",
    "content": `### Overview
LACP port-channel has gone down or lost all members — how to restore?

### Likely Causes
- All physical member links failed simultaneously (upstream switch failure)
- LACP partner system ID changed (switch replaced without config)
- Min-links threshold not met — bundle went down when members fell below minimum
- Member links failing due to physical/optical issues
- LACP PDU exchange stopped — remote switch rebooting
- Incorrect bundling — members distributed across different switches in stack

### Observability Signals
- portchannel_state == down
- portchannel_active_members == 0
- All member interfaces in down/err-disable state
- LACP PDU counters stopped
- Syslog: 'LINEPROTO-5-UPDOWN Port-channel down'
- min-links threshold events in log

### Recommended CLI Commands
show etherchannel summary
show interfaces port-channel <n>
show lacp neighbor
show lacp counters
show logging | inc Port-channel|LACP
show interfaces <member-int> status

### Step-by-Step RCA
1) Check member link states: 'show etherchannel summary' — any member in I (individual) or D (down)?
2) Check physical links: all members down simultaneously suggests upstream device failure
3) Verify LACP partner system MAC: 'show lacp neighbor' — did peer change?
4) Check min-links config: how many members required?
5) Restore member links or fix upstream device
6) If partner changed (device replaced): reconfigure LACP on new device

### Related Tools
SNMP, Syslog, LACP PDU counters`,
    "problem": "All physical member links failed simultaneously (upstream switch failure)",
    "area": "Switching",
    "remedyItems": [
      "Restore physical member links; fix upstream switch; reconfigure LACP partner; adjust min-links threshold; reseat cables.",
      "Set min-links below number of uplinks for graceful degradation; monitor member count; alert on member count reduction."
    ],
    "tags": [
      "lacp-down",
      "port-channel",
      "etherchannel",
      "min-links",
      "member-down",
      "bundle"
    ],
    "linkedIntents": [
      "switching.lacp_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-005",
    "title": "Private VLAN hosts cannot reach gateway or each other as expected — how to diagnose?",
    "category": "Network",
    "subcategory": "Switching",
    "content": `### Overview
Private VLAN hosts cannot reach gateway or each other as expected — how to diagnose?

### Likely Causes
- Gateway/router port not configured as promiscuous
- Secondary VLAN not mapped to primary VLAN
- Primary VLAN not allowed on uplink trunk
- Community VLAN members cannot reach each other (isolated VLAN misassigned)
- SVI not configured as PVLAN promiscuous for L3 routing
- VTP propagation issue with PVLAN configuration

### Observability Signals
- Hosts in isolated PVLAN cannot reach gateway
- Community VLAN hosts cannot communicate
- ARP for gateway not resolving
- show vlan private-vlan shows mapping missing
- Trunk not carrying primary VLAN

### Recommended CLI Commands
show vlan private-vlan
show interfaces switchport
show run interface <gateway-int>
show vlan brief
show interfaces trunk | inc <primary-vlan>

### Step-by-Step RCA
1) Check PVLAN config: 'show vlan private-vlan' — primary-secondary mapping correct?
2) Verify gateway port is promiscuous: 'show interfaces <port> switchport'
3) Confirm primary VLAN on uplink trunk
4) Check SVI: 'ip address' and 'private-vlan mapping' configured?
5) Test ARP from isolated host to gateway IP
6) Verify community vs isolated assignment matches intended policy

### Related Tools
Syslog, Packet capture, SNMP`,
    "problem": "Gateway/router port not configured as promiscuous",
    "area": "Switching",
    "remedyItems": [
      "Set gateway port to promiscuous; map secondary to primary VLAN; add primary to trunk; configure SVI PVLAN mapping.",
      "Document PVLAN design; test all port types at deployment; avoid VTP for PVLAN (manual config preferred)."
    ],
    "tags": [
      "pvlan",
      "private-vlan",
      "promiscuous",
      "isolated",
      "community",
      "svi"
    ],
    "linkedIntents": [
      "switching.pvlan_issue"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-perf-003",
    "title": "End-to-end latency has spiked for specific flows — how to isolate the latency injection point?",
    "category": "Network",
    "subcategory": "Performance",
    "content": `### Overview
End-to-end latency has spiked for specific flows — how to isolate the latency injection point?

### Likely Causes
- Routing change adding hops (BGP path change, IGP reconvergence)
- Serialization delay on low-bandwidth links with large frames
- Device processing delay (high CPU, software switching instead of hardware)
- ISP BGP routing table change increasing path length
- Asymmetric routing through distant POP
- Queuing delay from congestion on transit link

### Observability Signals
- latency_ms > baseline by > 20%
- Traceroute showing new hops or increased RTT at specific hop
- Routing table change coinciding with latency spike
- IPSLA RTT probe elevated
- Specific destination affected (not all-destinations = local issue)

### Recommended CLI Commands
traceroute <dst> source <src>
mtr <dst> (continuous traceroute)
show ip route <dst>
ping <dst> repeat 100 size 1400
ip sla statistics
show ip bgp <dst-prefix> (check path changes)

### Step-by-Step RCA
1) Run traceroute: identify which hop added latency
2) Is hop inside your network or ISP network?
3) Check routing table: did path change recently? When?
4) Compare BGP path before and after latency increase
5) If internal device: check CPU — is it software-switching?
6) Check for serialization: packet_size / link_bps = serialization_delay

### Related Tools
IPSLA, traceroute, MTR, BGP logs, SNMP`,
    "problem": "Routing change adding hops (BGP path change, IGP reconvergence)",
    "area": "Performance",
    "remedyItems": [
      "Restore optimal routing path; fix BGP preference; upgrade low-bandwidth link; fix software-switching to hardware CEF; engage ISP.",
      "Deploy continuous IPSLA RTT probes; alert on latency > 2x baseline; maintain routing change log."
    ],
    "tags": [
      "latency",
      "traceroute",
      "routing-change",
      "bgp-path",
      "serialization",
      "ipsla"
    ],
    "linkedIntents": [
      "performance.high_latency"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-perf-004",
    "title": "Stateful firewall dropping established sessions — could asymmetric routing be the cause?",
    "category": "Network",
    "subcategory": "Performance",
    "content": `### Overview
Stateful firewall dropping established sessions — could asymmetric routing be the cause?

### Likely Causes
- Forward and return traffic traversing different stateful devices
- ECMP load balancing sending flows through different firewall instances
- HA failover changing active firewall without state sync
- PBR applied only one direction
- Multi-homed host with different source IPs per interface
- Route change causing return path to bypass firewall state table

### Observability Signals
- Established TCP sessions dropping mid-flow
- Firewall showing half-open or asymmetric flow logs
- Traceroute from source and destination showing different paths
- Session table showing one-sided entries (SYN but no SYN-ACK)
- Drops specifically on return traffic (outbound fine, inbound dropped)

### Recommended CLI Commands
traceroute <dst> source <src>
traceroute <src> source <dst> (reverse path)
show conn detail (ASA/FTD)
show ip cef <prefix> detail (ECMP paths)
show ip route <src-prefix> (from fw perspective)
show failover (HA state sync check)

### Step-by-Step RCA
1) Traceroute both directions: do paths differ?
2) Do both forward and return pass same firewall? Check ECMP hashing
3) If ECMP: disable and force single path as test
4) Check HA state sync: is state table synchronized between active/standby?
5) Review PBR: is it applied on both inbound and return interfaces?
6) Enable 'ip nat outside' / asymmetric routing compensation if supported

### Related Tools
Firewall logs, Traceroute, NetFlow, ECMP analysis`,
    "problem": "Forward and return traffic traversing different stateful devices",
    "area": "Performance",
    "remedyItems": [
      "Force symmetric routing via static routes or PBR; enable firewall state sync; use active/standby HA; tune ECMP per-flow hashing.",
      "Audit routing symmetry before deploying stateful devices; test HA failover with live sessions; review ECMP paths after routing changes."
    ],
    "tags": [
      "asymmetric-routing",
      "stateful-firewall",
      "ecmp",
      "ha-failover",
      "session-drop",
      "pbr"
    ],
    "linkedIntents": [
      "performance.asymmetric_routing"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-wan-002",
    "title": "WAN circuit is completely down — how to isolate CPE fault vs carrier fault vs local loop?",
    "category": "Network",
    "subcategory": "WAN",
    "content": `### Overview
WAN circuit is completely down — how to isolate CPE fault vs carrier fault vs local loop?

### Likely Causes
- CPE hardware failure (router interface, SFP, WAN card)
- Local loop fault between CPE and carrier demarc (cable, ONT, DSLAM)
- Carrier backbone or aggregation network failure
- Scheduled maintenance not communicated
- Physical damage to outside plant (fiber cut, cable theft)
- AC power failure at carrier POP

### Observability Signals
- WAN interface oper_status == down
- LOS/LOF alarms on WAN interface
- No keepalives from CE router to PE
- BGP/routing protocol down on WAN link
- Carrier NMS showing circuit alarm

### Recommended CLI Commands
show interface <wan-int>
show interface <wan-int> | inc alarm|LOS|LOF
show controllers serial <int> (T1/E1)
ping <carrier-pe-ip> (loopback test)
show logging | inc LINK|down
check carrier status portal

### Step-by-Step RCA
1) Check physical layer alarms: LOS, LOF, AIS — confirms carrier-side issue
2) Test CPE: swap cable from CPE to demarc; test with different CPE port
3) Request loopback test from carrier at demarc — if loopback passes = local loop OK
4) Check carrier NOC/portal for active incidents on circuit
5) Check power at both ends: CPE and carrier POP
6) Escalate to carrier with MTTR SLA enforcement

### Related Tools
SNMP, Syslog, carrier portal, loopback test`,
    "problem": "CPE hardware failure (router interface, SFP, WAN card)",
    "area": "WAN",
    "remedyItems": [
      "Replace CPE hardware if at fault; carrier dispatches tech for local loop repair; carrier restores backbone; activate backup circuit.",
      "Dual-carrier or backup circuit (LTE/SD-WAN); monitor circuit LOS/LOF alarms; carrier SLA with 4-hour MTTR."
    ],
    "tags": [
      "wan-circuit-down",
      "los",
      "carrier-fault",
      "local-loop",
      "cpe-failure",
      "fiber-cut"
    ],
    "linkedIntents": [
      "wan.circuit_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-wan-003",
    "title": "Primary WAN failed but backup did not take over — WAN failover is stuck. What to check?",
    "category": "Network",
    "subcategory": "WAN",
    "content": `### Overview
Primary WAN failed but backup did not take over — WAN failover is stuck. What to check?

### Likely Causes
- IP SLA probe target unreachable even on backup path (probe testing wrong target)
- Track object not linked to static route or routing process
- Backup interface (LTE/DSL) not dialing up or authenticating
- Floating static route AD not higher than primary dynamic route
- Both primary and backup circuits failed simultaneously
- IP SLA probe itself failing due to firewall blocking probe packets

### Observability Signals
- Primary WAN down; backup WAN interface not active
- IP SLA probe state showing down on both paths
- Track object state not changing despite primary failure
- Routing table still showing primary route (backup not installed)
- Backup interface (dialer/cellular) in down/idle state

### Recommended CLI Commands
show ip sla statistics
show track
show ip route
show interface dialer <n>
show interface cellular <n>
show logging | inc TRACK|IPSLA|route

### Step-by-Step RCA
1) 'show track' — is track object detecting primary failure?
2) 'show ip sla statistics' — is probe succeeding or failing?
3) Test probe target: can you reach the probe target from backup path?
4) Check routing table: is floating static installed?
5) Check backup interface: 'show interface cellular/dialer' — is it negotiating?
6) Check cellular signal strength / DSL sync for backup circuit health

### Related Tools
IPSLA, Syslog, SNMP, carrier portal`,
    "problem": "IP SLA probe target unreachable even on backup path (probe testing wrong target)",
    "area": "WAN",
    "remedyItems": [
      "Fix IP SLA probe target; link track object to route; fix backup interface auth/PPP; correct floating static AD; restore backup circuit.",
      "Test failover quarterly with controlled primary outage; monitor backup circuit health proactively; use dual probe targets."
    ],
    "tags": [
      "wan-failover",
      "ipsla",
      "track-object",
      "floating-static",
      "lte-backup",
      "dialer",
      "failover-stuck"
    ],
    "linkedIntents": [
      "wan.failover_stuck"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-001",
    "title": "IPsec tunnel is completely down — IKE/ISAKMP negotiation failing. How to diagnose?",
    "category": "Network",
    "subcategory": "VPN",
    "content": `### Overview
IPsec tunnel is completely down — IKE/ISAKMP negotiation failing. How to diagnose?

### Likely Causes
- IKE Phase 1 policy mismatch (encryption, hash, DH group, lifetime)
- Pre-shared key mismatch
- NAT-T not enabled when peers are behind NAT
- Dead Peer Detection (DPD) timeout causing tunnel teardown
- Certificate authentication failure (cert expired or CA not trusted)
- Access control blocking IKE UDP 500/4500
- Peer IP address changed (dynamic IP site)

### Observability Signals
- ipsec_tunnel_state == down
- IKE SA not established (show crypto isakmp sa = blank)
- Syslog: 'ISAKMP: no proposal chosen', 'MM_NO_STATE'
- UDP 500/4500 not reaching peer
- DPD R-U-THERE timeouts in log

### Recommended CLI Commands
show crypto isakmp sa
show crypto ipsec sa
show logging | inc ISAKMP|IKE|IPsec
debug crypto isakmp (brief window)
ping <peer-ip> (underlay reachability)
telnet <peer-ip> 500 (UDP 500 reachability test — won't connect but tests ACL)

### Step-by-Step RCA
1) Check IKE SA: 'show crypto isakmp sa' — any SA in MM_NO_STATE or AM_ACTIVE?
2) Check ISAKMP policy: match encryption, hash, DH group, auth method, lifetime on both peers
3) Verify PSK matches exactly (case-sensitive)
4) Check NAT-T: if behind NAT, ensure NAT-T enabled and UDP 4500 permitted
5) Check ACL: UDP 500 and 4500 (NAT-T) must reach peer
6) For cert auth: check cert expiry and CA chain on both peers

### Related Tools
VPN logs, Packet capture, Syslog, certificate monitoring`,
    "problem": "IKE Phase 1 policy mismatch (encryption, hash, DH group, lifetime)",
    "area": "VPN",
    "remedyItems": [
      "Align IKE policy; fix PSK; enable NAT-T; open UDP 500/4500; renew certificate; update peer IP for dynamic sites.",
      "Document IKE policy on both peers; test tunnel with 'clear crypto sa' after changes; monitor tunnel uptime."
    ],
    "tags": [
      "ipsec-down",
      "ike-phase1",
      "isakmp",
      "psk",
      "nat-t",
      "dpd",
      "certificate",
      "udp-500"
    ],
    "linkedIntents": [
      "vpn.ipsec_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-002",
    "title": "Remote users cannot connect to SSL VPN gateway — how to diagnose?",
    "category": "Network",
    "subcategory": "VPN",
    "content": `### Overview
Remote users cannot connect to SSL VPN gateway — how to diagnose?

### Likely Causes
- SSL VPN gateway process crashed or not listening on HTTPS
- Certificate on VPN gateway expired — clients rejecting TLS
- VPN gateway IP/FQDN unreachable (firewall, routing)
- IP address pool exhausted — no addresses to assign
- MFA/RADIUS backend unreachable causing auth failure
- Split-tunnel routing not configured — DNS not resolving after connect

### Observability Signals
- ssl_vpn_gateway_reachable == 0
- TLS connection to gateway port 443/10443 refused or timing out
- Certificate error in client browser/VPN client
- Session table showing zero active SSL VPN sessions
- RADIUS auth timeout events in VPN gateway logs

### Recommended CLI Commands
curl -vI https://<vpn-gateway>:443
openssl s_client -connect <vpn-gateway>:443
show vpn-sessiondb summary
show ip local pool
show aaa servers
ping <vpn-gateway> from external host

### Step-by-Step RCA
1) Test gateway reachability: curl HTTPS, check TLS cert
2) Check VPN service process on gateway: is it running?
3) Check certificate expiry: 'openssl s_client' shows cert details
4) Check IP pool: 'show ip local pool' — any addresses remaining?
5) Test RADIUS: 'test aaa group radius' from gateway
6) Check firewall: is inbound HTTPS to VPN gateway permitted?

### Related Tools
openssl, curl, VPN logs, RADIUS logs, SNMP`,
    "problem": "SSL VPN gateway process crashed or not listening on HTTPS",
    "area": "VPN",
    "remedyItems": [
      "Restart VPN service; renew certificate; expand IP pool; restore RADIUS connectivity; fix firewall rule; update DNS for gateway FQDN.",
      "Monitor gateway availability via synthetic HTTPS probe; cert expiry alert 30 days; pool utilization alert at 80%."
    ],
    "tags": [
      "ssl-vpn",
      "remote-access",
      "certificate",
      "ip-pool",
      "radius",
      "anyconnect",
      "gateway-down"
    ],
    "linkedIntents": [
      "vpn.ssl_vpn_unreachable"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-003",
    "title": "DMVPN spoke cannot register with hub — how to troubleshoot NHRP and IKE for DMVPN?",
    "category": "Network",
    "subcategory": "VPN",
    "content": `### Overview
DMVPN spoke cannot register with hub — how to troubleshoot NHRP and IKE for DMVPN?

### Likely Causes
- NHRP network ID mismatch between hub and spoke
- IKE policy mismatch preventing spoke-hub tunnel establishment
- NHS (hub) IP address unreachable from spoke underlay
- CGNAT or carrier-side NAT changing spoke source IP
- mGRE tunnel interface misconfiguration (wrong tunnel source)
- NHRP authentication mismatch

### Observability Signals
- DMVPN spoke state: NHRP registration not in hub cache
- IKE SA not established from spoke to hub
- mGRE tunnel interface down on spoke
- 'show dmvpn' showing spoke as DOWN at hub
- Spoke cannot ping hub tunnel IP

### Recommended CLI Commands
show dmvpn
show ip nhrp
show crypto isakmp sa
show interface tunnel <n>
show ip nhrp nhs
debug nhrp registration (brief window)
ping <hub-tunnel-ip> source tunnel <n>

### Step-by-Step RCA
1) Check hub NHRP cache: 'show ip nhrp' — is spoke registered?
2) Check spoke tunnel interface: up/up? Tunnel source/destination correct?
3) Test underlay: can spoke reach hub NBMA IP?
4) Check IKE: is Phase 1 SA established spoke to hub?
5) Verify NHRP network ID matches hub config
6) Check if CGNAT is changing spoke source IP (NHRP maps wrong IP)

### Related Tools
NHRP logs, IKE logs, DMVPN controller logs, Syslog`,
    "problem": "NHRP network ID mismatch between hub and spoke",
    "area": "VPN",
    "remedyItems": [
      "Fix NHRP network ID; align IKE policy; restore underlay reachability; configure NAT-T for CGNAT; correct tunnel source.",
      "Monitor DMVPN spoke count at hub; alert on registration drops; test spoke failover on WAN redundancy."
    ],
    "tags": [
      "dmvpn",
      "nhrp",
      "spoke-down",
      "mGRE",
      "nhs",
      "cgnat",
      "ike"
    ],
    "linkedIntents": [
      "vpn.dmvpn_spoke_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-004",
    "title": "GRE tunnel interface is down or traffic is not forwarding — what are the root causes?",
    "category": "Network",
    "subcategory": "VPN",
    "content": `### Overview
GRE tunnel interface is down or traffic is not forwarding — what are the root causes?

### Likely Causes
- Recursive routing: tunnel destination routed via tunnel itself
- IP Protocol 47 (GRE) blocked by ACL or firewall
- GRE keepalives failing (if configured) causing tunnel down
- Tunnel source or destination IP unreachable
- MTU mismatch causing large packets to be dropped inside GRE
- IP address not configured on tunnel interface

### Observability Signals
- tunnel_oper_status == down
- Recursive routing error in syslog
- GRE traffic not seen at far end (capture shows GRE packets dropped)
- Tunnel down with 'no keepalive responses' reason
- Large pings fail through tunnel; small pings succeed

### Recommended CLI Commands
show interface tunnel <n>
show ip route <tunnel-destination>
ping <far-end-tunnel-ip> source tunnel <n>
ping <far-end-tunnel-ip> df-bit size 1400
show ip traffic | inc GRE
traceroute <dst> source tunnel <n>

### Step-by-Step RCA
1) Check tunnel interface: 'show interface tunnel' — line protocol down or up?
2) For recursive routing: 'show ip route <tunnel-dest>' — is it via the tunnel itself?
3) If recursive: add static route for tunnel destination via physical interface
4) Test proto 47: packet capture on underlay — are GRE packets visible?
5) Check MTU: 'ping df-bit size 1452' — does it pass through tunnel?
6) Verify keepalive configuration if used — disable and test

### Related Tools
Packet capture, Syslog, SNMP, Ping/traceroute`,
    "problem": "Recursive routing: tunnel destination routed via tunnel itself",
    "area": "VPN",
    "remedyItems": [
      "Fix recursive routing with static route; permit proto 47 in ACL; set tunnel MTU minus 24 bytes; disable or fix keepalives.",
      "Always use static route for tunnel destination to prevent recursive routing; document GRE MTU requirements."
    ],
    "tags": [
      "gre",
      "tunnel-down",
      "recursive-routing",
      "proto-47",
      "keepalive",
      "mtu",
      "blackhole"
    ],
    "linkedIntents": [
      "vpn.gre_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-services-001",
    "title": "NXDOMAIN response rate spiked — clients getting 'name not found' errors. What is causing this?",
    "category": "Network",
    "subcategory": "Services",
    "content": `### Overview
NXDOMAIN response rate spiked — clients getting 'name not found' errors. What is causing this?

### Likely Causes
- DNS zone data missing or zone transfer failure
- DNS delegation broken — parent zone not pointing to authoritative server
- Wrong search domain suffix causing FQDN resolution failure
- DNS server cache poisoned with invalid NXDOMAIN responses
- Recent DNS record deletion or TTL expiry
- Split-horizon DNS serving wrong zone to clients

### Observability Signals
- nxdomain_rate > baseline by > 3x
- Specific domain or subdomain generating NXDOMAIN
- DNS zone transfer failures in authoritative server logs
- Clients reporting specific application FQDNs not resolving
- Recent DNS record changes correlating with spike

### Recommended CLI Commands
dig <failing-fqdn> +trace
nslookup <fqdn> <dns-server>
dig @<auth-server> <zone> AXFR (zone transfer test)
dig <fqdn> SOA (check zone authority)
check DNS server logs for NXDOMAIN volume
tail -f /var/log/named/default (BIND)

### Step-by-Step RCA
1) Identify which FQDN(s) generating NXDOMAIN
2) 'dig +trace' to follow delegation from root
3) Is authoritative server responding? Is zone loaded?
4) Check zone transfer: is secondary in sync with primary?
5) Check for recent record deletions in DNS change log
6) For split-horizon: is the correct view serving the client network?

### Related Tools
dig, nslookup, DNS logs, DNSSEC validator`,
    "problem": "DNS zone data missing or zone transfer failure",
    "area": "Services",
    "remedyItems": [
      "Restore deleted record; fix zone transfer; correct delegation; fix search domain; flush poisoned cache; correct split-horizon view.",
      "Monitor zone transfer success rate; DNSSEC for cache poisoning protection; change control for DNS record deletions."
    ],
    "tags": [
      "dns-nxdomain",
      "zone-transfer",
      "delegation",
      "search-domain",
      "split-horizon",
      "cache-poisoning"
    ],
    "linkedIntents": [
      "services.dns_nxdomain_spike"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-services-002",
    "title": "DHCP pool is exhausted — clients not getting IP addresses. How to recover and prevent recurrence?",
    "category": "Network",
    "subcategory": "Services",
    "content": `### Overview
DHCP pool is exhausted — clients not getting IP addresses. How to recover and prevent recurrence?

### Likely Causes
- DHCP starvation attack: attacker flooding DISCOVER with random MACs
- Lease time too long — stale leases from departed devices
- Scope undersized for current device count
- Rogue DHCP server consuming part of pool
- Ghost leases from improperly decommissioned devices
- Rapid device turnover (hot-desking, guest access) exhausting leases

### Observability Signals
- dhcp_pool_utilization_percent == 100
- DHCP DISCOVER with no OFFER in capture
- New devices getting APIPA (169.254.x.x) addresses
- DHCP server log: 'no free leases'
- Unusually high number of active leases vs connected devices

### Recommended CLI Commands
show ip dhcp binding | count
show ip dhcp pool
show ip dhcp conflict
show ip dhcp statistics
tcpdump -i <int> port 67 or port 68
clear ip dhcp binding * (emergency — use with caution)

### Step-by-Step RCA
1) Check utilization: 'show ip dhcp pool' — leased vs total
2) Compare lease count vs known-connected device count (via ARP/MAC table)
3) Look for starvation: many leases to sequential/random MACs from same port?
4) Check lease time: if 8 days, old leases from gone devices still held
5) For starvation attack: identify source port, enable DHCP snooping
6) Emergency recovery: reduce lease time to reclaim expired leases faster

### Related Tools
DHCP logs, SNMP, IPAM, DHCP snooping`,
    "problem": "DHCP starvation attack: attacker flooding DISCOVER with random MACs",
    "area": "Services",
    "remedyItems": [
      "Reduce lease time; clear stale bindings; expand pool; enable DHCP snooping; block starvation source; add exclusion ranges.",
      "Alert at 80% pool utilization; enable DHCP snooping; IPAM for pool capacity planning; use short lease times for guest/WiFi."
    ],
    "tags": [
      "dhcp-exhausted",
      "pool-full",
      "stale-leases",
      "dhcp-starvation",
      "snooping",
      "lease-time"
    ],
    "linkedIntents": [
      "services.dhcp_exhausted"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-services-003",
    "title": "Device showing high NTP stratum (16 = unsynchronized) — how to restore time sync?",
    "category": "Network",
    "subcategory": "Services",
    "content": `### Overview
Device showing high NTP stratum (16 = unsynchronized) — how to restore time sync?

### Likely Causes
- Upstream NTP server unreachable (ACL, routing, NTP server down)
- NTP authentication key mismatch
- All configured NTP peers stratum 16 (upstream hierarchy broken)
- Clock drift too large for NTP to step-correct (requires ntpdate force)
- VRF not specified for NTP source interface
- Firewall blocking UDP 123 between device and NTP server

### Observability Signals
- ntp_stratum == 16 (unsynchronized)
- 'show ntp associations' showing no synced peer (*)
- Time offset between device and NTP server > 1000ms
- Syslog timestamps misaligned with actual events
- Multiple correlation/forensic issues due to clock skew

### Recommended CLI Commands
show ntp associations detail
show ntp status
show clock detail
ntpdate -q <ntp-server> (test sync)
telnet <ntp-server> (ACL test — NTP is UDP so use ping)
ping <ntp-server> vrf <mgmt>

### Step-by-Step RCA
1) 'show ntp associations' — is any server in synced state (*)?
2) Test NTP server reachability from correct VRF: 'ping <ntp-ip> vrf mgmt'
3) Check NTP auth: key configured on both device and server?
4) Check offset: if > 128ms, ntp may need manual step-sync
5) Trace NTP hierarchy upward — is upstream NTP server itself synchronized?
6) Force sync: 'ntp update-calendar' or 'clock set' then 'ntp sync'

### Related Tools
NTP logs, Syslog, SNMP, ntpdate`,
    "problem": "Upstream NTP server unreachable (ACL, routing, NTP server down)",
    "area": "Services",
    "remedyItems": [
      "Fix routing/ACL to NTP server; correct auth key; force time step if offset > 128ms; fix upstream NTP hierarchy; specify VRF.",
      "Configure 3+ NTP sources; monitor stratum and offset continuously; alert on offset > 100ms; use internal NTP hierarchy."
    ],
    "tags": [
      "ntp",
      "stratum-16",
      "time-sync",
      "clock-drift",
      "udp-123",
      "vrf",
      "ntp-auth"
    ],
    "linkedIntents": [
      "services.ntp_stratum_high"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-001",
    "title": "Kubernetes node is in NotReady state — pods being evicted or not scheduled. How to diagnose?",
    "category": "Platform",
    "subcategory": "Node Health",
    "content": `### Overview
Kubernetes node is in NotReady state — pods being evicted or not scheduled. How to diagnose?

### Likely Causes
- kubelet process crashed or OOM killed
- Disk pressure: node disk full (/var/lib/docker or /var/lib/kubelet)
- Memory pressure: node memory exhausted causing kubelet issues
- CNI plugin failure (Calico, Flannel, Cilium) preventing pod networking
- API server unreachable — kubelet cannot report status
- containerd/docker daemon crashed
- Clock skew causing TLS certificate validation failure

### Observability Signals
- node_ready_status == False
- node_conditions showing DiskPressure, MemoryPressure, PIDPressure
- Pods in Terminating or Evicted state on node
- kubelet logs showing errors
- API server showing node as not reporting

### Recommended CLI Commands
kubectl get nodes -o wide
kubectl describe node <node>
kubectl get events --field-selector involvedObject.name=<node>
ssh <node> systemctl status kubelet
ssh <node> journalctl -u kubelet -n 100
ssh <node> df -h
ssh <node> free -m

### Step-by-Step RCA
1) 'kubectl describe node <node>' — check conditions: DiskPressure, MemoryPressure
2) SSH to node: is kubelet running? 'systemctl status kubelet'
3) Check kubelet logs: 'journalctl -u kubelet -n 200'
4) Check disk: 'df -h /var/lib/kubelet' and '/var/lib/containerd'
5) Check memory: is kubelet OOM killed? 'dmesg | grep OOM'
6) Check CNI: are pod network interfaces being created?

### Related Tools
kubectl, Prometheus node-exporter, journalctl, k8s events`,
    "problem": "kubelet process crashed or OOM killed",
    "area": "Node Health",
    "remedyItems": [
      "Restart kubelet; free disk space; increase node resources; reinstall CNI; fix API server reachability; sync clock.",
      "Set eviction thresholds before NotReady; monitor node conditions via Prometheus; set disk alert at 80% for kubelet paths."
    ],
    "tags": [
      "k8s",
      "node-not-ready",
      "kubelet",
      "disk-pressure",
      "memory-pressure",
      "cni",
      "eviction"
    ],
    "linkedIntents": [
      "k8s.node_not_ready"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-002",
    "title": "Kubernetes pod is stuck in Pending state — it is not being scheduled. What are the causes?",
    "category": "Platform",
    "subcategory": "Pod Scheduling",
    "content": `### Overview
Kubernetes pod is stuck in Pending state — it is not being scheduled. What are the causes?

### Likely Causes
- Insufficient CPU or memory resources across all nodes
- Node selector or affinity rules with no matching node
- Node taint with no matching toleration in pod spec
- PVC not bound — pod waiting for persistent volume
- Image pull failure (ImagePullBackOff before Pending)
- Resource quota exceeded in namespace
- Pod disruption budget preventing scheduling

### Observability Signals
- pod_status == Pending for > 5 minutes
- kubectl events showing 'Insufficient cpu/memory'
- 'FailedScheduling' event with specific reason
- No nodes match node selector or affinity
- PVC in Pending state (no available PV)

### Recommended CLI Commands
kubectl describe pod <pod> -n <ns>
kubectl get events -n <ns> | grep FailedScheduling
kubectl describe nodes | grep -A 5 'Allocated resources'
kubectl get pvc -n <ns>
kubectl get resourcequota -n <ns>
kubectl get nodes -o json | jq '.items[].spec.taints'

### Step-by-Step RCA
1) 'kubectl describe pod' — check Events section at bottom for scheduling reason
2) 'Insufficient cpu/memory': check node capacity vs requested resources
3) 'No nodes match selector': check nodeSelector/affinity vs node labels
4) 'Taints': add toleration or remove taint from target node
5) PVC Pending: check StorageClass and available PVs
6) Quota: 'kubectl describe resourcequota' — which resource is over limit?

### Related Tools
kubectl, Prometheus, k8s events, vertical pod autoscaler`,
    "problem": "Insufficient CPU or memory resources across all nodes",
    "area": "Pod Scheduling",
    "remedyItems": [
      "Add nodes or reduce resource requests; fix node labels/affinity; add toleration; bind PV; increase quota; adjust pod disruption budget.",
      "Capacity planning for resource requests; limit ranges to prevent over-requesting; monitor scheduling failure events."
    ],
    "tags": [
      "k8s",
      "pod-pending",
      "scheduling",
      "resources",
      "affinity",
      "taint",
      "pvc",
      "quota"
    ],
    "linkedIntents": [
      "k8s.pod_pending"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-003",
    "title": "PersistentVolumeClaim is stuck in Pending state — pods cannot start. How to resolve?",
    "category": "Platform",
    "subcategory": "Storage",
    "content": `### Overview
PersistentVolumeClaim is stuck in Pending state — pods cannot start. How to resolve?

### Likely Causes
- No PersistentVolume matches the PVC request (size, access mode, StorageClass)
- StorageClass dynamic provisioner (CSI driver) not running
- Storage backend quota exhausted
- Availability zone mismatch between PVC topology and available nodes
- PVC requesting access mode not supported by StorageClass (ReadWriteMany on block storage)
- Binding mode 'WaitForFirstConsumer' — PVC waits for pod to schedule first

### Observability Signals
- pvc_status == Pending
- Events: 'no persistent volumes available' or 'storageclass not found'
- CSI provisioner pod in CrashLoopBackOff or not running
- Storage quota exceeded event
- PV available but wrong StorageClass or access mode

### Recommended CLI Commands
kubectl describe pvc <pvc-name> -n <ns>
kubectl get pv (check available PVs)
kubectl get storageclass
kubectl get pods -n kube-system | grep csi
kubectl describe storageclass <class>
kubectl get events -n <ns> | grep ProvisioningFailed

### Step-by-Step RCA
1) 'kubectl describe pvc' — Events show exact failure reason
2) Check StorageClass: does it exist and is provisioner running?
3) CSI driver: is provisioner pod healthy in kube-system?
4) Check existing PVs: any available matching size and access mode?
5) For WaitForFirstConsumer: PVC binds when pod is scheduled — is pod pending too?
6) Check storage backend: quota, connectivity, CSI driver logs

### Related Tools
kubectl, CSI driver logs, Prometheus, storage backend console`,
    "problem": "No PersistentVolume matches the PVC request (size, access mode, StorageClass)",
    "area": "Storage",
    "remedyItems": [
      "Create matching PV manually; restart CSI provisioner; expand storage backend quota; change StorageClass; fix zone topology.",
      "Monitor CSI provisioner health; set storage quota alerts; test dynamic provisioning in staging; document StorageClass capabilities."
    ],
    "tags": [
      "k8s",
      "pvc-pending",
      "storageclass",
      "csi",
      "persistent-volume",
      "provisioner",
      "quota"
    ],
    "linkedIntents": [
      "k8s.pvc_unbound"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-004",
    "title": "Kubernetes Ingress is not routing traffic — HTTP 502/503 or connection refused. How to debug?",
    "category": "Platform",
    "subcategory": "Ingress",
    "content": `### Overview
Kubernetes Ingress is not routing traffic — HTTP 502/503 or connection refused. How to debug?

### Likely Causes
- Ingress controller pod not running (nginx, traefik, etc.)
- Backend service not found or endpoint not ready
- TLS secret missing or certificate expired
- Incorrect Ingress annotation causing misrouting
- Service selector not matching pod labels
- IngressClass not matching controller
- Upstream pod not passing readiness probe

### Observability Signals
- HTTP 502 (bad gateway) or 503 (service unavailable) from ingress
- Ingress controller pod in CrashLoopBackOff
- 'No endpoints available' in ingress controller logs
- TLS secret not found event
- Service endpoints count == 0

### Recommended CLI Commands
kubectl get ingress -n <ns>
kubectl describe ingress <name> -n <ns>
kubectl get pods -n ingress-nginx (or traefik ns)
kubectl get endpoints <service> -n <ns>
kubectl get secret <tls-secret> -n <ns>
kubectl logs -n ingress-nginx <controller-pod> | grep error

### Step-by-Step RCA
1) Check ingress controller pod: running and healthy?
2) 'kubectl describe ingress' — any warning events?
3) Check backend service: 'kubectl get endpoints <svc>' — any IPs listed?
4) If endpoints empty: check service selector vs pod labels
5) Check TLS secret: present in correct namespace? Cert valid?
6) Review ingress annotations — any typo or incorrect value?

### Related Tools
kubectl, ingress controller logs, Prometheus, cert-manager`,
    "problem": "Ingress controller pod not running (nginx, traefik, etc.)",
    "area": "Ingress",
    "remedyItems": [
      "Restart ingress controller; fix service selector; create TLS secret; correct annotations; fix readiness probe on upstream pods.",
      "Monitor ingress controller health; synthetic HTTP probe per ingress; cert expiry monitoring for TLS secrets."
    ],
    "tags": [
      "k8s",
      "ingress",
      "nginx",
      "traefik",
      "tls-secret",
      "endpoints",
      "502",
      "503"
    ],
    "linkedIntents": [
      "k8s.ingress_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-005",
    "title": "etcd cluster is unhealthy — Kubernetes control plane is degraded. What to check?",
    "category": "Platform",
    "subcategory": "Control Plane",
    "content": `### Overview
etcd cluster is unhealthy — Kubernetes control plane is degraded. What to check?

### Likely Causes
- etcd disk I/O too slow causing raft election timeouts
- etcd quorum lost (majority of members down)
- etcd database too large — compaction and defragmentation needed
- etcd peer certificates expired
- Network partition between etcd members
- Memory pressure causing etcd OOM

### Observability Signals
- etcd_server_health_failures > 0
- etcd request latency > 100ms (p99)
- etcd quorum alerts
- kubectl commands timing out or failing
- etcd database size growing without compaction

### Recommended CLI Commands
etcdctl endpoint health --cluster
etcdctl endpoint status --cluster --write-out=table
etcdctl alarm list
etcdctl defrag --cluster
iostat -x 1 (on etcd nodes)
etcdctl snapshot status <snapshot>

### Step-by-Step RCA
1) Check cluster health: 'etcdctl endpoint health --cluster'
2) Check member list: quorum requires majority (3-node = 2 needed)
3) Check disk I/O latency on etcd nodes — etcd needs < 10ms latency
4) Check DB size: if > 6GB, compact and defrag needed
5) Check certificate expiry: 'etcdctl endpoint status'
6) Review etcd logs for leader election churn or network partition

### Related Tools
etcdctl, Prometheus etcd metrics, iostat, journalctl`,
    "problem": "etcd disk I/O too slow causing raft election timeouts",
    "area": "Control Plane",
    "remedyItems": [
      "Restore failed etcd member; compact/defrag database; move etcd to faster disk (NVMe); renew certificates; fix network partition.",
      "Dedicated fast SSD for etcd; monitor etcd latency and DB size; automated compaction; certificate rotation automation."
    ],
    "tags": [
      "k8s",
      "etcd",
      "quorum",
      "disk-latency",
      "compaction",
      "certificate",
      "control-plane"
    ],
    "linkedIntents": [
      "k8s.etcd_unhealthy"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-006",
    "title": "Kubernetes API server is down or unreachable — all cluster operations failing. How to recover?",
    "category": "Platform",
    "subcategory": "Control Plane",
    "content": `### Overview
Kubernetes API server is down or unreachable — all cluster operations failing. How to recover?

### Likely Causes
- API server OOM killed (large cluster with many objects)
- etcd unreachable from API server
- API server TLS certificates expired
- API server overwhelmed by too many requests (e.g., controller storm)
- kube-apiserver pod evicted from master node
- Node hosting API server has failed

### Observability Signals
- kubectl commands fail with 'connection refused' or timeout
- kube-apiserver pod not running or CrashLoopBackOff
- etcd showing high error rate
- API server audit logs not updating
- Control plane node CPU/memory critically high

### Recommended CLI Commands
kubectl cluster-info
crictl ps | grep apiserver (on control plane node)
systemctl status kube-apiserver (kubeadm)
journalctl -u kube-apiserver -n 200
kubectl get --raw /healthz (if partially reachable)
curl https://<apiserver>:6443/healthz (from within cluster)

### Step-by-Step RCA
1) Test API reachability: 'kubectl cluster-info' or 'curl https://<apiserver>:6443/healthz'
2) SSH to control plane: is kube-apiserver container/process running?
3) Check API server logs for crash reason
4) Check certificate expiry: kubeadm certs check-expiration
5) Check etcd health — API server cannot function without etcd
6) Check control plane node resources: memory, disk

### Related Tools
kubectl, crictl, journalctl, kubeadm, Prometheus`,
    "problem": "API server OOM killed (large cluster with many objects)",
    "area": "Control Plane",
    "remedyItems": [
      "Restart kube-apiserver; renew certificates (kubeadm certs renew); restore etcd; free control plane node resources; scale control plane.",
      "HA control plane (3 masters); cert expiry monitoring; API server request rate limits; dedicated control plane nodes."
    ],
    "tags": [
      "k8s",
      "apiserver",
      "control-plane",
      "certificate-expired",
      "etcd",
      "oom",
      "kubeadm"
    ],
    "linkedIntents": [
      "k8s.apiserver_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-001",
    "title": "Cloud VM/instance is not reachable — how to diagnose connectivity in cloud environments?",
    "category": "Platform",
    "subcategory": "Compute",
    "content": `### Overview
Cloud VM/instance is not reachable — how to diagnose connectivity in cloud environments?

### Likely Causes
- Instance stopped or terminated (check state)
- Security group blocking inbound traffic on required port
- Route table missing route or incorrect default gateway
- Instance status checks failing (hardware issue at cloud level)
- SSH key pair mismatch — cannot authenticate
- Public IP not associated or Elastic IP detached
- VPC network ACL (stateless) blocking traffic

### Observability Signals
- instance_reachability_check == failed
- EC2/GCE instance status check failed
- Security group showing no inbound rule for management port
- Route table missing 0.0.0.0/0 to Internet Gateway
- Instance in stopped/terminated state

### Recommended CLI Commands
aws ec2 describe-instances --instance-ids <id>
aws ec2 describe-instance-status --instance-ids <id>
aws ec2 describe-security-groups --group-ids <sg-id>
aws ec2 describe-route-tables
aws ec2 get-console-output --instance-id <id>
VPC Flow Logs: filter for REJECT on instance ENI

### Step-by-Step RCA
1) Check instance state: running, stopped, or terminated?
2) Check system/instance status checks in cloud console
3) Check security group: inbound rules for SSH (22) / RDP (3389) from your IP?
4) Check VPC routing: subnet route table has IGW or NAT route?
5) Check VPC Network ACL: stateless, must have inbound AND outbound rules
6) Use 'Get Console Output' for boot/crash logs without SSH

### Related Tools
AWS Console, AWS CLI, VPC Flow Logs, CloudWatch`,
    "problem": "Instance stopped or terminated (check state)",
    "area": "Compute",
    "remedyItems": [
      "Start stopped instance; fix security group rule; add route to route table; associate Elastic IP; fix network ACL; restore from snapshot if status check fails.",
      "Baseline security group rules; monitor instance status checks; use AWS Systems Manager Session Manager for keyless access."
    ],
    "tags": [
      "cloud",
      "ec2",
      "instance-unreachable",
      "security-group",
      "route-table",
      "vpc",
      "status-check"
    ],
    "linkedIntents": [
      "cloud.instance_unreachable"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-002",
    "title": "Cloud security group is blocking application traffic — how to identify and fix the missing rule?",
    "category": "Platform",
    "subcategory": "Security",
    "content": `### Overview
Cloud security group is blocking application traffic — how to identify and fix the missing rule?

### Likely Causes
- Missing inbound rule for required port or protocol
- Port range too narrow (e.g., 8080 specified but app uses 8081)
- Source CIDR too restrictive (specific IP but client has different IP)
- Protocol wrong (TCP specified but app uses UDP)
- Security group applied to wrong resource (ENI, instance, or load balancer)
- Stateless NACL overriding security group (NACL denying return traffic)

### Observability Signals
- VPC Flow Logs showing REJECT on destination port
- Connection timeout from client to application
- Application reachable from within VPC but not from specific source
- AWS Security Hub showing overly restrictive group
- Cloud-native firewall audit showing drop

### Recommended CLI Commands
aws ec2 describe-security-groups --group-ids <sg-id>
VPC Flow Logs: filter srcaddr, dstaddr, dstport, action=REJECT
aws ec2 describe-network-acls (check stateless NACLs)
aws ec2 describe-instances (check which SG is attached)
telnet <instance-ip> <port> (from source host)
curl -v http://<instance-ip>:<port>

### Step-by-Step RCA
1) Enable VPC Flow Logs and filter for REJECT on target ENI
2) Identify rejected destination port and source IP
3) Check security group: is there an inbound rule matching that port and source?
4) Check if NACL is also involved — stateless, needs both inbound and outbound
5) Verify security group is actually attached to the correct instance/ENI
6) Add missing rule with least-privilege (specific port and source CIDR)

### Related Tools
VPC Flow Logs, AWS Config, AWS Security Hub, CloudTrail`,
    "problem": "Missing inbound rule for required port or protocol",
    "area": "Security",
    "remedyItems": [
      "Add precise inbound rule; fix port range; correct source CIDR; check NACL outbound rules; attach correct security group.",
      "Use Infrastructure-as-Code for security groups; enforce change approval; VPC Flow Logs always enabled; security group drift detection."
    ],
    "tags": [
      "cloud",
      "security-group",
      "vpc-flow-logs",
      "nacl",
      "inbound-rule",
      "port-block",
      "aws"
    ],
    "linkedIntents": [
      "cloud.security_group_block"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-003",
    "title": "Private subnet instances cannot reach the internet — NAT gateway suspected. How to diagnose?",
    "category": "Platform",
    "subcategory": "Networking",
    "content": `### Overview
Private subnet instances cannot reach the internet — NAT gateway suspected. How to diagnose?

### Likely Causes
- Route table in private subnet not pointing to NAT gateway
- NAT gateway Elastic IP (EIP) not associated or detached
- NAT gateway in wrong availability zone (instances in different AZ)
- NAT gateway connections quota exhausted (55,000 simultaneous)
- NAT gateway in failed state (cloud provider issue)
- Outbound security group blocking egress traffic from instances

### Observability Signals
- private_subnet_outbound_reachability == 0
- NAT gateway status != available in cloud console
- CloudWatch: NAT gateway error count > 0
- VPC Flow Logs showing traffic leaving instance but not returning
- Route table for private subnet missing 0.0.0.0/0 Ã¢â€ â€™ NAT GW

### Recommended CLI Commands
aws ec2 describe-nat-gateways
aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=<private-subnet>
aws cloudwatch get-metric-data (NatGatewayErrorPortAllocation)
curl http://169.254.169.254 (instance metadata test)
curl https://checkip.amazonaws.com (outbound test from instance)

### Step-by-Step RCA
1) Check NAT GW state: 'aws ec2 describe-nat-gateways' — available or failed?
2) Check route table: private subnet Ã¢â€ â€™ 0.0.0.0/0 Ã¢â€ â€™ NAT GW ID correct?
3) Check NAT GW in correct AZ (each AZ should have own NAT GW for HA)
4) Check CloudWatch: ErrorPortAllocation = connections quota hit?
5) Test from instance: 'curl https://checkip.amazonaws.com'
6) Check security group on instance: outbound rule to 0.0.0.0/0 exists?

### Related Tools
AWS Console, AWS CLI, VPC Flow Logs, CloudWatch`,
    "problem": "Route table in private subnet not pointing to NAT gateway",
    "area": "Networking",
    "remedyItems": [
      "Fix route table; create NAT GW per AZ for HA; increase connection reuse to reduce port exhaustion; fix EIP association.",
      "NAT GW per AZ; monitor ErrorPortAllocation CloudWatch metric; alert on NAT GW state change; IaC for route table management."
    ],
    "tags": [
      "cloud",
      "nat-gateway",
      "private-subnet",
      "route-table",
      "eip",
      "az-failure",
      "aws"
    ],
    "linkedIntents": [
      "cloud.nat_gateway_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-004",
    "title": "Cloud ELB/ALB showing all targets as unhealthy — traffic not being forwarded. What to investigate?",
    "category": "Platform",
    "subcategory": "Load Balancer",
    "content": `### Overview
Cloud ELB/ALB showing all targets as unhealthy — traffic not being forwarded. What to investigate?

### Likely Causes
- Health check port or path configured incorrectly
- Security group blocking health check traffic from LB to targets
- Target group instances have wrong port open
- Application returning non-200 on health check path
- Instance in wrong state (stopped, terminated)
- Target group protocol mismatch (HTTP health check on HTTPS endpoint)
- IP target type — IPs removed from target group after deployment

### Observability Signals
- elb_healthy_host_count == 0
- ALB access logs showing 502 Bad Gateway
- Health check logs showing timeouts or connection refused
- CloudWatch: UnHealthyHostCount == total targets
- VPC Flow Logs: REJECT on health check port from LB CIDR

### Recommended CLI Commands
aws elbv2 describe-target-health --target-group-arn <arn>
aws elbv2 describe-target-groups --target-group-arns <arn>
aws elbv2 describe-load-balancers
curl http://<target-ip>:<port>/<health-check-path> (test directly)
VPC Flow Logs: filter for LB source CIDR to target port

### Step-by-Step RCA
1) 'describe-target-health' — get specific reason per target (timeout, unhealthy, unused)
2) Test health check manually: curl from LB subnet or same AZ instance
3) Check health check config: correct port, protocol (HTTP vs HTTPS), path, success codes
4) Check target security group: does it allow traffic from LB security group?
5) Check if application returns 200 on health check path
6) For NLB: check target security group AND network ACL

### Related Tools
AWS Console, AWS CLI, ALB access logs, CloudWatch, VPC Flow Logs`,
    "problem": "Health check port or path configured incorrectly",
    "area": "Load Balancer",
    "remedyItems": [
      "Fix health check path/port/protocol; update target security group; fix application health check endpoint; re-register targets.",
      "Test health check configuration at deploy time; monitor UnHealthyHostCount; alert on > 50% targets unhealthy."
    ],
    "tags": [
      "cloud",
      "elb",
      "alb",
      "target-unhealthy",
      "health-check",
      "security-group",
      "502"
    ],
    "linkedIntents": [
      "cloud.elb_unhealthy"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-005",
    "title": "S3 access denied errors occurring — application cannot read/write objects. How to resolve?",
    "category": "Platform",
    "subcategory": "Storage",
    "content": `### Overview
S3 access denied errors occurring — application cannot read/write objects. How to resolve?

### Likely Causes
- IAM role/user policy missing s3:GetObject or s3:PutObject permission
- S3 bucket policy explicitly denying access
- S3 Block Public Access settings blocking access to public bucket
- Cross-account: bucket policy not granting access to external account
- KMS key policy not allowing IAM role to use encryption key
- S3 VPC endpoint policy restrictive — blocking from specific instances
- Incorrect bucket region — SDK not configured for correct region

### Observability Signals
- HTTP 403 AccessDenied from S3 API
- CloudTrail: s3:GetObject showing AccessDenied for specific principal
- Application error logs: 'AccessDeniedException'
- AWS Config showing S3 block public access enabled on bucket
- STS GetCallerIdentity returns different principal than expected

### Recommended CLI Commands
aws s3 ls s3://<bucket>/ (test access)
aws s3api get-bucket-policy --bucket <name>
aws s3api get-bucket-acl --bucket <name>
aws iam simulate-principal-policy (test permissions)
aws sts get-caller-identity (confirm which principal is acting)
CloudTrail: filter for ErrorCode=AccessDenied and eventSource=s3.amazonaws.com

### Step-by-Step RCA
1) Confirm which principal is getting 403: 'aws sts get-caller-identity'
2) Simulate policy: 'aws iam simulate-principal-policy' for that principal
3) Check bucket policy: any explicit Deny?
4) Check S3 Block Public Access: enabled at account or bucket level?
5) For KMS encrypted bucket: check KMS key policy allows principal
6) Check VPC endpoint policy if accessing via VPC endpoint

### Related Tools
AWS IAM Policy Simulator, CloudTrail, AWS Config, AWS CLI`,
    "problem": "IAM role/user policy missing s3:GetObject or s3:PutObject permission",
    "area": "Storage",
    "remedyItems": [
      "Add required S3 permissions to IAM policy; remove explicit Deny from bucket policy; fix KMS key policy; update VPC endpoint policy.",
      "Least-privilege IAM policy testing before deploy; use AWS IAM Policy Simulator; CloudTrail alerting on S3 AccessDenied."
    ],
    "tags": [
      "cloud",
      "s3",
      "access-denied",
      "iam-policy",
      "bucket-policy",
      "kms",
      "cross-account",
      "403"
    ],
    "linkedIntents": [
      "cloud.s3_access_denied"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-006",
    "title": "Cloud IAM denying actions despite policy appearing correct — how to debug permission issues?",
    "category": "Platform",
    "subcategory": "IAM",
    "content": `### Overview
Cloud IAM denying actions despite policy appearing correct — how to debug permission issues?

### Likely Causes
- Explicit Deny in IAM policy overriding any Allow (Deny always wins)
- Service Control Policy (SCP) at AWS Organization level blocking action
- IAM Permission Boundary restricting effective permissions
- Role not being assumed correctly — using wrong credentials
- Condition in policy not being met (e.g., IP condition, MFA condition)
- Resource ARN in policy not matching actual resource ARN
- Session policy (assumed role) more restrictive than role policy

### Observability Signals
- HTTP 403 AccessDenied from AWS API
- CloudTrail: errorCode=AccessDenied with requestParameters
- IAM Policy Simulator showing Denied
- AWS CLI: 'An error occurred (AccessDenied)'
- SCP evaluation showing block at org level

### Recommended CLI Commands
aws sts get-caller-identity
aws iam simulate-principal-policy --policy-source-arn <role-arn> --action-names <action>
CloudTrail: filter errorCode=AccessDenied
aws organizations list-policies-for-target (check SCPs)
aws iam get-role --role-name <name> | jq .Role.PermissionsBoundary

### Step-by-Step RCA
1) 'sts get-caller-identity' — is application using correct role/identity?
2) CloudTrail: what exact action, resource ARN, and condition was evaluated?
3) IAM Policy Simulator: test specific action on specific resource
4) Check for explicit Deny in any attached policy
5) Check SCP: is org-level policy blocking this action in this account?
6) Check Permission Boundary: is it set on role and restricting action?

### Related Tools
CloudTrail, IAM Policy Simulator, AWS Organizations, AWS Config`,
    "problem": "Explicit Deny in IAM policy overriding any Allow (Deny always wins)",
    "area": "IAM",
    "remedyItems": [
      "Remove explicit Deny; update SCP (requires org admin); remove or expand Permission Boundary; fix role ARN; meet policy conditions.",
      "Policy-as-code with automated testing; CloudTrail alerting on AccessDenied; regular IAM access reviews; least-privilege enforcement."
    ],
    "tags": [
      "cloud",
      "iam",
      "access-denied",
      "scp",
      "permission-boundary",
      "explicit-deny",
      "cloudtrail",
      "403"
    ],
    "linkedIntents": [
      "cloud.iam_deny"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-001",
    "title": "Thousands of alerts firing in minutes — alert storm overwhelming the team. How to triage and suppress?",
    "category": "Platform",
    "subcategory": "Alerting",
    "content": `### Overview
Thousands of alerts firing in minutes — alert storm overwhelming the team. How to triage and suppress?

### Likely Causes
- Single root cause generating hundreds of symptom alerts (no deduplication)
- Alert threshold too sensitive (transient spike triggering alert)
- No alert dampening or evaluation period
- Flapping event source generating repeated state changes
- Monitoring system not suppressing child alerts when parent is alerting
- Mass device event (power outage, network split) generating flood

### Observability Signals
- alert_rate_per_minute > 100
- Multiple alerts with same root cause device or component
- Alert IDs all within same short time window
- Repeated FIRING Ã¢â€ â€™ RESOLVED Ã¢â€ â€™ FIRING cycling (flap)
- On-call team unable to identify the root cause alert

### Recommended CLI Commands
Check alertmanager silence rules (Prometheus)
Check alert correlation / grouping rules
Review alert history for top firing alert names
Check root cause device for primary alarm
Check alert inhibition rules

### Step-by-Step RCA
1) Identify single highest-priority alert that could be root cause
2) Group by source device/component — is one device generating most alerts?
3) Silence downstream symptom alerts while investigating root cause
4) Fix underlying issue first, then clear symptom alerts
5) Post-incident: add inhibition rules to suppress child alerts
6) Add dampening (evaluate for period before firing) for flapping alerts

### Related Tools
Alertmanager, PagerDuty, OpsGenie, alert correlation engine`,
    "problem": "Single root cause generating hundreds of symptom alerts (no deduplication)",
    "area": "Alerting",
    "remedyItems": [
      "Silence symptom alerts; fix root cause device; add alert inhibition rules; increase evaluation period for sensitive thresholds; implement alert correlation.",
      "Alert hierarchy with inhibition; parent/child alert relationships; dampening/evaluation periods on all threshold alerts; test alert volume in staging."
    ],
    "tags": [
      "alert-storm",
      "alert-flood",
      "inhibition",
      "dampening",
      "deduplication",
      "correlation",
      "flapping-alert"
    ],
    "linkedIntents": [
      "obs.alert_storm"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-002",
    "title": "Logs not appearing in centralized logging system — log pipeline has broken. How to diagnose?",
    "category": "Platform",
    "subcategory": "Logging",
    "content": `### Overview
Logs not appearing in centralized logging system — log pipeline has broken. How to diagnose?

### Likely Causes
- Log shipper (Fluentd, Logstash, Vector, Filebeat) crashed or stopped
- Elasticsearch/OpenSearch disk full — refusing new documents
- Log pipeline backpressure causing log drop
- Parse error in pipeline: log format change breaking parser
- Network path from log shipper to aggregator blocked
- Log index rotation/ILM policy failing causing full index

### Observability Signals
- log_ingestion_rate drops to zero
- Log shipper process not running
- Elasticsearch cluster status RED or disk full
- Pipeline error rate in Logstash/Vector metrics
- Logs visible on source host but not in Kibana/Grafana Loki

### Recommended CLI Commands
systemctl status filebeat|fluentd|vector
journalctl -u filebeat -n 100
curl http://<elasticsearch>:9200/_cluster/health
curl http://<elasticsearch>:9200/_cat/indices?v (check index status)
check log shipper metrics endpoint (Prometheus scrape)
tail -f /var/log/filebeat/filebeat (shipper own logs)

### Step-by-Step RCA
1) Check log shipper process on source hosts
2) Check shipper own logs for errors (parse errors, connection refused)
3) Test network: can shipper reach aggregator port (5044, 9200)?
4) Check Elasticsearch cluster health and disk usage
5) Check parse pipeline: did log format change recently?
6) Check ILM policy: is old index blocking new writes?

### Related Tools
Filebeat, Fluentd, Logstash, Elasticsearch, Kibana, Prometheus`,
    "problem": "Log shipper (Fluentd, Logstash, Vector, Filebeat) crashed or stopped",
    "area": "Logging",
    "remedyItems": [
      "Restart log shipper; free Elasticsearch disk (ILM policy, delete old indices); fix parse error; restore network path; fix index policy.",
      "Monitor log shipper health as meta-metric; Elasticsearch disk alert at 80%; test pipeline after log format changes."
    ],
    "tags": [
      "log-pipeline",
      "log-shipper",
      "elasticsearch-full",
      "fluentd",
      "filebeat",
      "parse-error",
      "ilm"
    ],
    "linkedIntents": [
      "obs.log_pipeline_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-003",
    "title": "Distributed traces are incomplete or missing spans — how to diagnose trace coverage gaps?",
    "category": "Platform",
    "subcategory": "Tracing",
    "content": `### Overview
Distributed traces are incomplete or missing spans — how to diagnose trace coverage gaps?

### Likely Causes
- Trace sampler set too low (e.g., 0.01%) losing most traces
- Service not instrumented with tracing library
- Trace context headers not propagated between services (broken trace chain)
- Trace exporter (OTLP, Jaeger, Zipkin) connectivity failing
- New service deployment without adding tracing agent
- W3C TraceContext vs B3 header format mismatch between services

### Observability Signals
- trace_completeness_percent < 90
- Missing spans in traces (gaps in service call chain)
- Specific service always showing as external (not instrumented)
- Trace exporter error count > 0
- New deployments not appearing in service map

### Recommended CLI Commands
check OTLP exporter metrics (otelcol: grpc_exporter_sent_spans)
curl http://<service>:8080/actuator/metrics | grep trace (Spring)
check trace sampling config: OTEL_TRACES_SAMPLER env var
check W3C trace context header: 'traceparent' in HTTP requests
check Jaeger/Zipkin UI for missing service
check service mesh sidecar (Istio/Envoy) tracing config

### Step-by-Step RCA
1) Identify missing service in trace waterfall
2) Is that service instrumented? Check for OTEL agent/SDK in deployment
3) Check trace context propagation: is traceparent header forwarded in HTTP calls?
4) Check sampling rate: is it too low to capture this trace?
5) Check exporter connectivity: OTLP endpoint reachable from service?
6) For service mesh: is Envoy sidecar trace propagation enabled?

### Related Tools
Jaeger, Zipkin, Tempo, OpenTelemetry Collector, service mesh`,
    "problem": "Trace sampler set too low (e.g., 0.01%) losing most traces",
    "area": "Tracing",
    "remedyItems": [
      "Add tracing instrumentation; fix context propagation; increase sampling rate; fix exporter connectivity; align header formats.",
      "Require tracing in service deployment checklist; validate trace coverage in staging; set sampling to 100% for errors and slow traces."
    ],
    "tags": [
      "tracing",
      "opentelemetry",
      "spans",
      "sampling",
      "trace-context",
      "jaeger",
      "otlp",
      "instrumentation"
    ],
    "linkedIntents": [
      "obs.trace_gap"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-004",
    "title": "Grafana/monitoring dashboard showing 'No Data' — how to find the cause?",
    "category": "Platform",
    "subcategory": "Dashboards",
    "content": `### Overview
Grafana/monitoring dashboard showing 'No Data' — how to find the cause?

### Likely Causes
- Datasource connection broken (Prometheus URL changed, credentials expired)
- Metric name changed after application update (breaking dashboard query)
- Time range too long causing query timeout on data source
- Metric cardinality explosion causing Prometheus OOM Ã¢â€ â€™ no metrics
- Data source query returning empty result set (wrong label filter)
- Clock skew between dashboard host and data source

### Observability Signals
- dashboard panels showing 'No Data'
- Grafana data source connection test failing
- Prometheus queries returning empty set
- Prometheus target showing as DOWN
- Grafana error: 'datasource timeout' or 'connection refused'

### Recommended CLI Commands
curl http://<prometheus>:9090/api/v1/query?query=up
curl http://<prometheus>:9090/-/ready
check Grafana data source settings: connection test
run PromQL directly in Prometheus UI
check label names and values changed: 'label_values()'
check Prometheus target health: /targets page

### Step-by-Step RCA
1) Test data source connection in Grafana settings
2) Run query directly in Prometheus/data source UI
3) Is metric name exactly correct? Check for underscores vs dots changes
4) Check label filters in query: do label values still exist?
5) Reduce time range — is it a timeout issue on long queries?
6) Check Prometheus health: is it up and ingesting targets correctly?

### Related Tools
Grafana, Prometheus, Loki, InfluxDB, dashboard-as-code`,
    "problem": "Datasource connection broken (Prometheus URL changed, credentials expired)",
    "area": "Dashboards",
    "remedyItems": [
      "Fix data source connection; update query for new metric name; fix label filters; add recording rule for expensive queries; fix Prometheus health.",
      "Version control dashboard JSON; test queries after metric changes; alert on Prometheus target DOWN; data source health checks."
    ],
    "tags": [
      "dashboard",
      "no-data",
      "grafana",
      "prometheus",
      "datasource",
      "metric-name-change",
      "query-timeout"
    ],
    "linkedIntents": [
      "obs.dashboard_no_data"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-005",
    "title": "Alert is firing but there is no real problem — false positive alert eroding team trust. How to tune?",
    "category": "Platform",
    "subcategory": "Alerting",
    "content": `### Overview
Alert is firing but there is no real problem — false positive alert eroding team trust. How to tune?

### Likely Causes
- Alert threshold set without considering normal traffic patterns
- Seasonal or daily traffic variation exceeding static threshold
- Very short evaluation window capturing transient spikes
- Wrong aggregation function (max vs avg on bursty metric)
- Alert based on single data point, not sustained condition
- Metric cardinality issue giving misleading aggregate value

### Observability Signals
- Alert firing frequently with no user-visible impact
- Alert resolves within minutes without any action
- Alert fires at same time daily (cron, business hours)
- Alert ack rate very high — team suppressing without investigating
- On-call burnout from low signal-to-noise ratio

### Recommended CLI Commands
Query Prometheus for historical trend: query_range for 7 days
Check alert evaluation period: for duration
Check aggregation function in alert expression
Review alert firing history in Alertmanager
Compare alert firing pattern with traffic pattern

### Step-by-Step RCA
1) Plot metric over 7 days — is threshold exceeded regularly without incidents?
2) Check evaluation period: is 'for' clause too short?
3) Identify if metric is bursty: use avg or p95 instead of max
4) Check for daily pattern: does it fire at 9am every day (business hours)?
5) Consider dynamic threshold based on time-of-day or day-of-week
6) Raise threshold or extend evaluation window as immediate fix

### Related Tools
Prometheus, Alertmanager, Grafana, SLO platform`,
    "problem": "Alert threshold set without considering normal traffic patterns",
    "area": "Alerting",
    "remedyItems": [
      "Increase threshold or 'for' duration; switch to percentile-based threshold; implement dynamic/seasonal thresholds; add business-hours filter.",
      "Alert on SLO burn rate (more robust than threshold); test alerts with historical data before deploying; review false positive rate monthly."
    ],
    "tags": [
      "false-positive",
      "alert-tuning",
      "threshold",
      "seasonality",
      "evaluation-window",
      "slo",
      "signal-to-noise"
    ],
    "linkedIntents": [
      "obs.false_positive_alert"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mpls-001",
    "title": "LDP session is down — MPLS label distribution has stopped. How to restore?",
    "category": "Network",
    "subcategory": "MPLS",
    "content": `### Overview
LDP session is down — MPLS label distribution has stopped. How to restore?

### Likely Causes
- TCP session failure between LDP peers (transport connectivity)
- LDP MD5 authentication mismatch
- LDP hellos not reaching peer (multicast 224.0.0.2 blocked)
- LDP router-ID not reachable (loopback not advertised in IGP)
- Interface not LDP-enabled
- Access list blocking TCP 646 (LDP)

### Observability Signals
- ldp_session_state != OPERATIONAL
- LDP bindings missing for expected prefixes
- MPLS forwarding table gaps
- Syslog: 'LDP session DOWN', 'MPLS-LDP-5-NBRCHANGE'
- Traffic black-holing on MPLS paths

### Recommended CLI Commands
show mpls ldp neighbor
show mpls ldp bindings
show mpls forwarding-table
show logging | inc LDP|MPLS
show run | inc mpls ldp
telnet <peer-loopback> 646

### Step-by-Step RCA
1) Check LDP neighbor state: 'show mpls ldp neighbor'
2) Test TCP 646 to peer loopback: 'telnet <peer-loopback> 646'
3) Is peer loopback reachable (IGP route exists)?
4) Check LDP interface: 'show mpls ldp interface' — all P-PE interfaces LDP-enabled?
5) Check auth: 'show mpls ldp neighbor detail' shows auth info
6) Check multicast: can LDP hello (multicast) reach all neighbors?

### Related Tools
MPLS logs, Syslog, SNMP`,
    "problem": "TCP session failure between LDP peers (transport connectivity)",
    "area": "MPLS",
    "remedyItems": [
      "Fix TCP 646 ACL; restore loopback reachability; enable LDP on interface; fix MD5 auth; restore multicast reachability for hellos.",
      "Monitor LDP session count via SNMP; alert on session drops; enable LDP session protection to survive brief link failures."
    ],
    "tags": [
      "mpls",
      "ldp",
      "label-distribution",
      "tcp-646",
      "mpls-forwarding",
      "authentication"
    ],
    "linkedIntents": [
      "mpls.ldp_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mpls-002",
    "title": "MPLS LSP (Label Switched Path) is broken — traffic not following the engineered path. How to diagnose?",
    "category": "Network",
    "subcategory": "MPLS",
    "content": `### Overview
MPLS LSP (Label Switched Path) is broken — traffic not following the engineered path. How to diagnose?

### Likely Causes
- Physical link failure along LSP path
- RSVP session timeout due to missed refresh messages
- TE bandwidth constraint no longer satisfiable (link used by higher priority)
- Midpoint router dropping packets due to label mismatch
- LSP head-end not re-signaling after failure (make-before-break not working)
- CSPF computation failure due to stale TE topology database

### Observability Signals
- mpls_lsp_state != UP
- RSVP session not established along path
- Traffic falling back to IP path (no longer MPLS)
- Traceroute showing IP hops instead of MPLS labels
- TE tunnel state down in NMS

### Recommended CLI Commands
show mpls traffic-eng tunnels
show rsvp session
show mpls traffic-eng tunnels detail
traceroute mpls ip <lsp-endpoint>
show mpls traffic-eng topology
show ip rsvp interface

### Step-by-Step RCA
1) Check tunnel state: 'show mpls traffic-eng tunnels' — is it up or down?
2) Check RSVP session along path: 'show rsvp session'
3) Identify failure point: traceroute MPLS — where do MPLS labels stop?
4) Check if bandwidth constraint can be satisfied: reduce BW constraint temporarily
5) Check CSPF topology: is TE database current?
6) Force re-signal: 'clear mpls traffic-eng tunnel' (use during maintenance)

### Related Tools
RSVP logs, MPLS-TE logs, SNMP, network topology tools`,
    "problem": "Physical link failure along LSP path",
    "area": "MPLS",
    "remedyItems": [
      "Fix broken link in path; reduce TE BW constraint; re-signal LSP; update CSPF topology; configure FRR (Fast Reroute) for protection.",
      "Configure MPLS-TE FRR backup paths; monitor LSP state; CSPF topology consistency check; BW reservation monitoring."
    ],
    "tags": [
      "mpls-te",
      "lsp",
      "rsvp",
      "traffic-engineering",
      "cspf",
      "frr",
      "label-switched-path"
    ],
    "linkedIntents": [
      "mpls.lsp_broken"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mpls-003",
    "title": "MPLS L3VPN routes are missing at PE — VRF routing table incomplete. How to diagnose?",
    "category": "Network",
    "subcategory": "MPLS",
    "content": `### Overview
MPLS L3VPN routes are missing at PE — VRF routing table incomplete. How to diagnose?

### Likely Causes
- MP-BGP VPNv4 session not activated between PE routers
- Route Target (RT) import/export mismatch — routes not imported to correct VRF
- VRF not assigned to CE-facing interface
- Route Distinguisher (RD) collision between different VPNs
- CE not redistributing routes into VRF BGP/OSPF
- Route reflector not propagating VPNv4 routes

### Observability Signals
- VRF routing table missing expected prefixes
- MP-BGP VPNv4 table not showing CE routes
- show bgp vpnv4 unicast all shows no routes from specific PE
- CE cannot ping PE VRF interface
- Traffic between sites black-holing

### Recommended CLI Commands
show ip vrf
show bgp vpnv4 unicast all summary
show bgp vpnv4 unicast all neighbors <pe-peer> routes
show ip route vrf <name>
show ip vrf interfaces
show run | sec vrf

### Step-by-Step RCA
1) Check VRF exists and CE interface assigned: 'show ip vrf interfaces'
2) Check CE is advertising routes into VRF: 'show ip route vrf <name>'
3) Check MP-BGP: VPNv4 AFI active? 'show bgp vpnv4 unicast all summary'
4) Check RT: does RT export on advertising PE match RT import on receiving PE?
5) Check RR: is it propagating VPNv4 routes to all PEs?
6) Check RD uniqueness: 'show bgp vpnv4 unicast all' for duplicate RDs

### Related Tools
BGP logs, MPLS logs, SNMP, NMS VPN monitoring`,
    "problem": "MP-BGP VPNv4 session not activated between PE routers",
    "area": "MPLS",
    "remedyItems": [
      "Activate VPNv4 AFI; align RT import/export; assign VRF to interface; fix CE redistribution; correct RD; fix RR propagation.",
      "Document RT design; automate RT consistency checks; RD registry to prevent collisions; test VPN reachability post-provision."
    ],
    "tags": [
      "mpls-l3vpn",
      "vrf",
      "mp-bgp",
      "vpnv4",
      "route-target",
      "route-distinguisher",
      "route-reflector"
    ],
    "linkedIntents": [
      "mpls.vpn_route_missing"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-db-007",
    "title": "Deadlock frequency has spiked — transactions being rolled back frequently. How to diagnose and prevent?",
    "category": "Database",
    "subcategory": "Locking",
    "content": `### Overview
Deadlock frequency has spiked — transactions being rolled back frequently. How to diagnose and prevent?

### Likely Causes
- Two transactions acquiring locks in different orders creating circular dependency
- Long-running transaction holding locks and blocking newer transactions
- Missing index causing full table scan acquiring too many row locks
- Bulk insert/update locking entire table instead of row-level
- Application retry logic not implementing backoff after deadlock
- ORM generating lock-prone query patterns

### Observability Signals
- deadlock_count > 5 per minute
- Application errors: 'Deadlock found when trying to get lock'
- Transaction rollback rate increasing
- Long-running transaction blocking others in pg_stat_activity
- Lock wait timeout events in DB logs

### Recommended CLI Commands
SHOW ENGINE INNODB STATUS\\G (MySQL — shows last deadlock)
SELECT * FROM pg_locks l JOIN pg_stat_activity a ON l.pid = a.pid; (PG blocking)
SELECT * FROM information_schema.INNODB_TRX; (MySQL active transactions)
check application logs for deadlock errors and transaction retry
ENABLE DEADLOCK LOGGING: log_lock_waits = on (PostgreSQL)

### Step-by-Step RCA
1) Extract deadlock details: MySQL InnoDB status or pg_locks
2) Identify the two transactions and what locks they hold vs need
3) Determine if lock ordering is inconsistent (Transaction A: row1 then row2; Transaction B: row2 then row1)
4) Identify if missing index causing table-level locks
5) Implement consistent lock ordering in application code
6) Add retry with exponential backoff for deadlock errors

### Related Tools
MySQL InnoDB status, pg_locks, pg_stat_activity, APM, slow query log`,
    "problem": "Two transactions acquiring locks in different orders creating circular dependency",
    "area": "Locking",
    "remedyItems": [
      "Fix lock ordering; add missing index; break up bulk operations; implement retry with backoff; use SELECT FOR UPDATE SKIP LOCKED.",
      "Review transaction isolation level; add indexes before bulk operations; test for deadlocks in load testing; set lock timeout."
    ],
    "tags": [
      "deadlock",
      "locking",
      "mysql",
      "postgresql",
      "transaction",
      "lock-order",
      "innodb",
      "retry"
    ],
    "linkedIntents": [
      "db.deadlock_spike"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-db-008",
    "title": "Database indexes are bloated — queries becoming slow despite indexes existing. How to detect and remediate?",
    "category": "Network",
    "subcategory": "Performance",
    "content": `### Overview
Database indexes are bloated — queries becoming slow despite indexes existing. How to detect and remediate?

### Likely Causes
- High DELETE or UPDATE rate creating dead tuples (PostgreSQL) or fragmented pages
- VACUUM/AUTOVACUUM not keeping up with dead tuple accumulation
- Autovacuum scale factor too conservative for high-churn tables
- MySQL InnoDB table fragmentation after large deletes
- Index rebuild never scheduled on high-churn tables
- Transaction ID wraparound forcing emergency VACUUM

### Observability Signals
- index_bloat_ratio > 50% on key indexes
- Query performance degrading despite correct index usage
- pg_stat_user_tables showing high n_dead_tup count
- Table file size growing despite row count stable
- Autovacuum running constantly but never catching up

### Recommended CLI Commands
SELECT schemaname, tablename, n_live_tup, n_dead_tup, last_autovacuum FROM pg_stat_user_tables ORDER BY n_dead_tup DESC; (PG)
SELECT pg_size_pretty(pg_relation_size('<table>')); (PG)
SELECT * FROM pgstattuple('<table>'); (pg_contrib)
ANALYZE VERBOSE <table>; (PG)
OPTIMIZE TABLE <table>; (MySQL — rebuilds and defragments)
SELECT * FROM information_schema.TABLES WHERE table_schema='<db>' ORDER BY data_free DESC;

### Step-by-Step RCA
1) Identify bloated tables: 'pg_stat_user_tables' — high n_dead_tup
2) Check autovacuum: is it running on the table? When did it last run?
3) Compare autovacuum_scale_factor to actual delete rate
4) Run manual VACUUM ANALYZE as immediate relief
5) Rebuild fragmented indexes: REINDEX CONCURRENTLY (PG) or OPTIMIZE TABLE (MySQL)
6) For MySQL: check information_schema.TABLES.data_free for fragmented tables

### Related Tools
pg_stat_user_tables, pgstattuple, MySQL information_schema, Prometheus DB exporter`,
    "problem": "High DELETE or UPDATE rate creating dead tuples (PostgreSQL) or fragmented pages",
    "area": "Performance",
    "remedyItems": [
      "Run VACUUM ANALYZE; REINDEX CONCURRENTLY; tune autovacuum per-table; OPTIMIZE TABLE (MySQL); schedule regular maintenance windows.",
      "Monitor n_dead_tup per table; tune autovacuum for high-churn tables; scheduled REINDEX for write-heavy indexes."
    ],
    "tags": [
      "index-bloat",
      "vacuum",
      "autovacuum",
      "dead-tuples",
      "postgresql",
      "mysql",
      "fragmentation",
      "reindex"
    ],
    "linkedIntents": [
      "db.index_bloat"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mq-003",
    "title": "Kafka partition(s) are offline or under-replicated — producers and consumers failing. How to recover?",
    "category": "Middleware",
    "subcategory": "Queue Health",
    "content": `### Overview
Kafka partition(s) are offline or under-replicated — producers and consumers failing. How to recover?

### Likely Causes
- Broker hosting partition leader has crashed or is offline
- Insufficient ISR (In-Sync Replicas) — min.insync.replicas not met
- Unclean leader election required but disabled
- Broker JVM OOM causing partition leader loss
- Zookeeper/KRaft session expiry causing controller failover
- Replication lag causing follower to fall out of ISR

### Observability Signals
- kafka_offline_partitions_count > 0
- kafka_under_replicated_partitions > 0
- Producer getting NotLeaderForPartition or NotEnoughReplicas errors
- Consumer getting UNKNOWN_TOPIC_OR_PARTITION errors
- Broker logs showing 'Partition is offline'

### Recommended CLI Commands
kafka-topics.sh --describe --topic <topic> --bootstrap-server <broker>
kafka-topics.sh --describe --unavailable-partitions --bootstrap-server <broker>
kafka-reassign-partitions.sh (for rebalancing)
kafka-leader-election.sh --election-type preferred
check broker logs: journalctl -u kafka
check ZooKeeper/KRaft logs

### Step-by-Step RCA
1) Identify offline partitions: 'kafka-topics.sh --describe --unavailable-partitions'
2) Is the broker hosting the offline partition leader down?
3) If broker down: restart it and wait for partition to re-elect leader
4) Check ISR: is ISR count >= min.insync.replicas?
5) If ISR too small: restore offline broker to increase ISR
6) Trigger preferred leader election after broker restored

### Related Tools
Kafka CLI tools, Kafka Manager, Prometheus JMX exporter, Confluent Control Center`,
    "problem": "Broker hosting partition leader has crashed or is offline",
    "area": "Queue Health",
    "remedyItems": [
      "Restart offline broker; reassign partitions to healthy brokers; trigger leader election; restore replication; adjust min.insync.replicas.",
      "Replication factor >= 3; monitor under-replicated partitions; alert on offline partitions; balanced partition distribution across brokers."
    ],
    "tags": [
      "kafka",
      "partition-offline",
      "under-replicated",
      "isr",
      "broker-down",
      "leader-election",
      "min-insync"
    ],
    "linkedIntents": [
      "mq.partition_offline"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mq-004",
    "title": "Kafka consumer group lag is growing — messages accumulating in topic. How to reduce lag?",
    "category": "Middleware",
    "subcategory": "Queue Health",
    "content": `### Overview
Kafka consumer group lag is growing — messages accumulating in topic. How to reduce lag?

### Likely Causes
- Consumer processing logic too slow for message production rate
- Consumer group stuck in rebalancing loop (too many joins/leaves)
- Producer surge generating messages faster than consumers can process
- Consumer fetch timeout too short causing excessive rebalancing
- Insufficient consumer instances for partition count
- Consumer blocked on downstream dependency (DB, API call)

### Observability Signals
- consumer_group_lag > threshold and growing
- Kafka consumer group in REBALANCING state frequently
- Consumer lag not decreasing even with consumers healthy
- Consumer poll interval exceeding max.poll.interval.ms
- Consumer CPU and throughput normal (not a processing bottleneck)

### Recommended CLI Commands
kafka-consumer-groups.sh --describe --group <group> --bootstrap-server <broker>
kafka-consumer-groups.sh --describe --group <group> --bootstrap-server <broker> --verbose
check consumer application metrics: messages_processed_per_sec
check consumer logs for rebalancing events
kafka-topics.sh --describe --topic <topic> (check partition count vs consumer count)

### Step-by-Step RCA
1) Check lag per partition: 'kafka-consumer-groups.sh --describe' — which partitions lagging most?
2) Is consumer in REBALANCING? Indicates consumer joins/leaves frequently
3) Compare consumer throughput vs producer throughput
4) Is consumer downstream slow? Check DB or API latency
5) Is consumer count < partition count? Scale consumers to match partitions
6) Check max.poll.interval.ms vs actual processing time

### Related Tools
kafka-consumer-groups.sh, Prometheus JMX exporter, Burrow (lag monitor), Confluent Control Center`,
    "problem": "Consumer processing logic too slow for message production rate",
    "area": "Queue Health",
    "remedyItems": [
      "Scale consumer instances (max = partition count); optimize processing; fix downstream dependency; increase max.poll.interval.ms; fix rebalancing.",
      "Lag alerting at acceptable threshold; consumer count >= partition count; load test consumer throughput vs expected producer rate."
    ],
    "tags": [
      "kafka",
      "consumer-lag",
      "consumer-group",
      "rebalancing",
      "lag",
      "throughput",
      "max-poll-interval"
    ],
    "linkedIntents": [
      "mq.consumer_group_lag"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mq-005",
    "title": "Dead letter queue (DLQ) is accumulating messages — what is causing messages to be dead-lettered?",
    "category": "Middleware",
    "subcategory": "Queue Health",
    "content": `### Overview
Dead letter queue (DLQ) is accumulating messages — what is causing messages to be dead-lettered?

### Likely Causes
- Poison message: malformed or unexpected payload crashing consumer
- Schema change breaking consumer deserialization
- Consumer bug throwing exception for valid messages
- Max retry count exceeded — consumer repeatedly failing on message
- Message TTL expired before consumer processed it
- Authorization failure — consumer cannot access required resource

### Observability Signals
- dlq_message_count > threshold and growing
- Consumer showing high rejection/nack rate
- Consumer processing errors in application logs
- Messages in DLQ with specific error type concentrated
- Same consumer version started rejecting messages after deployment

### Recommended CLI Commands
rabbitmqctl list_queues name messages (check DLQ depth — RabbitMQ)
kafka-console-consumer.sh --topic <dlq-topic> --from-beginning (sample DLQ messages)
aws sqs receive-message --queue-url <dlq-url> (AWS SQS DLQ)
check consumer application error logs
compare DLQ message schema vs current consumer schema
check message timestamps in DLQ (when were they sent?)

### Step-by-Step RCA
1) Sample DLQ messages: what is the payload? Any pattern?
2) Check consumer error logs: what exception is thrown?
3) Schema mismatch: is DLQ message in old format vs current consumer schema?
4) Poison message: does one specific message format crash all consumers?
5) Correlate DLQ accumulation start with deployments
6) Move non-poison messages from DLQ to original queue after fix

### Related Tools
RabbitMQ management, Kafka CLI, AWS SQS, schema registry, consumer logs`,
    "problem": "Poison message: malformed or unexpected payload crashing consumer",
    "area": "Queue Health",
    "remedyItems": [
      "Fix consumer to handle message format; fix schema compatibility; fix consumer bug; replay DLQ messages after fix; purge true poison messages.",
      "Alert on DLQ depth > 0; schema registry with compatibility checks; test consumer with all historical message formats; DLQ message sampling."
    ],
    "tags": [
      "dlq",
      "dead-letter-queue",
      "poison-message",
      "schema-mismatch",
      "consumer-error",
      "retry",
      "deserialization"
    ],
    "linkedIntents": [
      "mq.dead_letter_full"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-gen-connectivity-reachability-0",
    "title": "Why is a device showing 'Host Down' in NMS?",
    "category": "Network",
    "subcategory": "Reachability",
    "content": "### Overview\nWhy is a device showing 'Host Down' in NMS?\n\n### Likely Causes\n- SNMP or ICMP blocked\n- Device/Interface down\n- ACL/Firewall drop\n- Routing not present\n- VRF mismatch\n- Power/Hardware issue\n\n### Observability Signals\n- Ping/ICMP status\n- SNMP poll result & sysUpTime\n- Interface status (admin/oper)\n- ARP/ND entries\n- Routing table path to device\n\n### Recommended CLI Commands\nping <ip>\ntraceroute <ip>\nshow ip route <ip>\nshow interface status\nshow access-lists | include <src/dst>\n\n### Step-by-Step RCA\n1) Verify management IP & VRF\n2) ICMP/SNMP reachability from poller\n3) Check link/neighbor state\n4) Validate routing path/ACLs\n5) Hardware/power checks\n\n### Resolution\nRestore upstream route/ACL; enable ICMP/SNMP to poller; bring up interface; replace faulty hardware/PSU.\n\n### Preventive Actions\nStandardize management VRF; allow-lists for NMS; dual power; path redundancy.\n\n### Related Tools\nPing, Traceroute, SNMP, Syslog",
    "problem": "SNMP or ICMP blocked",
    "area": "Reachability",
    "remedyItems": [
      "Restore upstream route/ACL",
      "enable ICMP/SNMP to poller",
      "bring up interface",
      "replace faulty hardware/PSU.",
      "Standardize management VRF",
      "allow-lists for NMS"
    ],
    "tags": [
      "host-down",
      "snmp",
      "icmp",
      "vrf"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-connectivity-packet-loss-1",
    "title": "Users report intermittent packet loss to a site—what should I check?",
    "category": "Network",
    "subcategory": "Packet Loss",
    "content": "### Overview\nUsers report intermittent packet loss to a site—what should I check?\n\n### Likely Causes\n- Link errors (CRC, drops)\n- Duplex/Speed mismatch\n- Congestion/Queue drops\n- RF interference (Wi—˜Fi)\n- ISP/WAN degradation\n\n### Observability Signals\n- Interface error counters\n- QoS queue drops\n- Latency/Jitter trends\n- NetFlow/sFlow loss indicators\n\n### Recommended CLI Commands\nshow interface counters errors\nshow platform hardware qfp drops\nshow policy-map interface\nmtr <dst>\n\n### Step-by-Step RCA\n1) Baseline ping/mtr\n2) Inspect interface errors\n3) Check QoS & queue depths\n4) Validate duplex/speed\n5) Engage ISP if WAN\n\n### Resolution\nFix cabling/SFP; correct duplex/speed; tune QoS; open ISP ticket with evidence (latency/loss graphs).\n\n### Preventive Actions\nUse error-threshold alerting; pre—˜mark critical traffic; SLA probes on WAN.\n\n### Related Tools\nNetFlow/sFlow, IPSLA/TWAMP, SNMP, Wireshark",
    "problem": "Link errors (CRC, drops)",
    "area": "Packet Loss",
    "remedyItems": [
      "Fix cabling/SFP",
      "correct duplex/speed",
      "tune QoS",
      "open ISP ticket with evidence (latency/loss graphs).",
      "Use error-threshold alerting",
      "pre—˜mark critical traffic"
    ],
    "tags": [
      "packet-loss",
      "qos",
      "wan",
      "crc"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-services-dns-2",
    "title": "Clients see 'DNS server not responding'—how to triage?",
    "category": "Network",
    "subcategory": "DNS",
    "content": "### Overview\nClients see 'DNS server not responding'—how to triage?\n\n### Likely Causes\n- DNS server down/restart\n- Firewall blocks 53/UDP\n- Anycast health failover\n- Split-horizon misconfig\n\n### Observability Signals\n- UDP 53 reachability\n- Server CPU/mem\n- Query success rate, NXDOMAIN spikes\n\n### Recommended CLI Commands\nnslookup <name> <dns>\ndig +trace <name>\ntelnet <dns> 53\nshow access-lists | inc 53\n\n### Step-by-Step RCA\n1) Check DNS reachability\n2) Validate server health\n3) Confirm views/split-horizon\n4) Inspect recent changes\n\n### Resolution\nRestore service; open 53/UDP; correct view/zone data; rollback bad changes.\n\n### Preventive Actions\nHealth probes for Anycast; change control; capacity headroom.\n\n### Related Tools\nDNS logs, Packet capture, Syslog",
    "problem": "DNS server down/restart",
    "area": "DNS",
    "remedyItems": [
      "Restore service",
      "open 53/UDP",
      "correct view/zone data",
      "rollback bad changes.",
      "Health probes for Anycast",
      "change control"
    ],
    "tags": [
      "dns",
      "anycast",
      "firewall"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-services-dhcp-3",
    "title": "Why are clients failing to obtain IPs (DHCP timeouts)?",
    "category": "Network",
    "subcategory": "DHCP",
    "content": "### Overview\nWhy are clients failing to obtain IPs (DHCP timeouts)?\n\n### Likely Causes\n- Scope exhaustion\n- Relay (ip helper) broken\n- VLAN trunk issue\n- ACL blocking UDP 67/68\n\n### Observability Signals\n- Pool utilization\n- Relay counters/logs\n- VLAN STP/Trunk state\n\n### Recommended CLI Commands\nshow ip dhcp binding\nshow ip dhcp pool\nshow ip helper\nshow vlan / show interfaces trunk\n\n### Step-by-Step RCA\n1) Verify VLAN reaches relay\n2) Check scope utilization\n3) Inspect ACLs\n4) Confirm server status\n\n### Resolution\nExpand scope; fix relay; correct VLAN tags; open ports 67/68.\n\n### Preventive Actions\nCapacity planning; IPAM alerts for pool thresholds.\n\n### Related Tools\nDHCP logs, NMS traps",
    "problem": "Scope exhaustion",
    "area": "DHCP",
    "remedyItems": [
      "Expand scope",
      "fix relay",
      "correct VLAN tags",
      "open ports 67/68.",
      "Capacity planning",
      "IPAM alerts for pool thresholds."
    ],
    "tags": [
      "dhcp",
      "ip-helper",
      "vlan"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-routing-bgp-4",
    "title": "BGP session flapping with ISP—what causes and fixes?",
    "category": "Network",
    "subcategory": "BGP",
    "content": "### Overview\nBGP session flapping with ISP—what causes and fixes?\n\n### Likely Causes\n- Physical link issues\n- Mismatched timers/MD5\n- Route churn/Max-prefix hit\n- MTU mismatch causing TCP resets\n\n### Observability Signals\n- BGP neighbor log\n- Hold/timer counters\n- Max-prefix alarms\n- Interface errors\n\n### Recommended CLI Commands\nshow bgp summary\nshow ip bgp neighbors\nshow interface counters\nshow logging | inc BGP\n\n### Step-by-Step RCA\n1) Confirm physical stability\n2) Validate auth/timers/MTU\n3) Check max—˜prefix & route leaks\n4) Coordinate with ISP\n\n### Resolution\nFix optics/cable; align timers/MD5; increase max—˜prefix with safeguards; correct MTU.\n\n### Preventive Actions\nBFD for fast detection; route-policy sanity; prefix-limit alerting.\n\n### Related Tools\nBGP logs, BFD, NetFlow",
    "problem": "Physical link issues",
    "area": "BGP",
    "remedyItems": [
      "Fix optics/cable",
      "align timers/MD5",
      "increase max—˜prefix with safeguards",
      "correct MTU.",
      "BFD for fast detection",
      "route-policy sanity"
    ],
    "tags": [
      "bgp",
      "max-prefix",
      "mtu",
      "md5"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-routing-ospf-5",
    "title": "OSPF neighbor stuck in EXSTART/EXCHANGE—what to check?",
    "category": "Network",
    "subcategory": "OSPF",
    "content": "### Overview\nOSPF neighbor stuck in EXSTART/EXCHANGE—what to check?\n\n### Likely Causes\n- MTU mismatch\n- Duplicate router IDs\n- Network type mismatch\n- ACL blocking multicast\n\n### Observability Signals\n- OSPF neighbor state timeline\n- Interface MTU\n- RID uniqueness\n\n### Recommended CLI Commands\nshow ip ospf neighbor\nshow interface | inc MTU\nshow ip ospf interface\n\n### Step-by-Step RCA\n1) Verify MTU & adjust or set ip ospf mtu-ignore\n2) Ensure unique RIDs\n3) Check network type & multicast reachability\n\n### Resolution\nAlign MTU; fix RID; correct network type/ACLs.\n\n### Preventive Actions\nPre—˜deploy templates; health checks.\n\n### Related Tools\nOSPF logs",
    "problem": "MTU mismatch",
    "area": "OSPF",
    "remedyItems": [
      "Align MTU",
      "fix RID",
      "correct network type/ACLs.",
      "Pre—˜deploy templates",
      "health checks."
    ],
    "tags": [
      "ospf",
      "mtu",
      "rid"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-switching-stp-6",
    "title": "Random access outages—could this be STP?",
    "category": "Network",
    "subcategory": "STP",
    "content": "### Overview\nRandom access outages—could this be STP?\n\n### Likely Causes\n- Root bridge change\n- Portfast missing Ã¢â€ â€™ TCN floods\n- Loop due to cabling\n- BPDU guard shutdown\n\n### Observability Signals\n- STP topology change count\n- Root bridge identity\n- BPDU guard logs\n\n### Recommended CLI Commands\nshow spanning-tree detail\nshow spanning-tree root\nshow log | inc STP|BPDU\n\n### Step-by-Step RCA\n1) Verify root placement\n2) Check TCN spikes\n3) Inspect access loops & err—˜disable\n4) Enable loop guard/BPDU guard\n\n### Resolution\nSet deterministic roots; enable Portfast+BPDU guard; fix loops.\n\n### Preventive Actions\nDesign standards; LLDP audits.\n\n### Related Tools\nSTP logs, LLDP",
    "problem": "Root bridge change",
    "area": "STP",
    "remedyItems": [
      "Set deterministic roots",
      "enable Portfast+BPDU guard",
      "fix loops.",
      "Design standards",
      "LLDP audits."
    ],
    "tags": [
      "stp",
      "tcn",
      "loop-guard",
      "bpdu"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-switching-vlan-trunk-7",
    "title": "Hosts in VLAN cannot reach gateway—why?",
    "category": "Network",
    "subcategory": "VLAN/Trunk",
    "content": "### Overview\nHosts in VLAN cannot reach gateway—why?\n\n### Likely Causes\n- Trunk missing VLAN tag\n- SVI down/admin down\n- HSRP/VRRP failover issue\n\n### Observability Signals\n- Trunk allowed list\n- SVI line-protocol\n- ARP table for gateway\n\n### Recommended CLI Commands\nshow interfaces trunk\nshow vlan brief\nshow standby / show vrrp\n\n### Step-by-Step RCA\n1) Validate VLAN allowed on trunks\n2) Confirm SVI up\n3) Verify HSRP/VRRP state & ARP\n\n### Resolution\nPermit VLAN on trunks; bring up SVI; fix FHRP priorities/preempt.\n\n### Preventive Actions\nChange control on trunk changes; monitoring for SVI down.\n\n### Related Tools\nSyslog, SNMP, ARP",
    "problem": "Trunk missing VLAN tag",
    "area": "VLAN/Trunk",
    "remedyItems": [
      "Permit VLAN on trunks",
      "bring up SVI",
      "fix FHRP priorities/preempt.",
      "Change control on trunk changes",
      "monitoring for SVI down."
    ],
    "tags": [
      "vlan",
      "trunk",
      "svi",
      "hsrp"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-interfaces-errors-8",
    "title": "CRC errors increasing on uplink—what now?",
    "category": "Network",
    "subcategory": "Errors",
    "content": "### Overview\nCRC errors increasing on uplink—what now?\n\n### Likely Causes\n- Bad cable/SFP\n- Duplex/speed mismatch\n- EMI interference\n\n### Observability Signals\n- CRC/giants/drops counters\n- Autoneg status\n- Optical levels\n\n### Recommended CLI Commands\nshow interface counters errors\nddm interface <port>\n\n### Step-by-Step RCA\n1) Swap patch/SFP\n2) Lock duplex/speed appropriately\n3) Test on alternate path/port\n\n### Resolution\nReplace faulty components; correct autoneg; reroute temporarily.\n\n### Preventive Actions\nUse certified optics/cables; keep spares.\n\n### Related Tools\nSNMP interface stats",
    "problem": "Bad cable/SFP",
    "area": "Errors",
    "remedyItems": [
      "Replace faulty components",
      "correct autoneg",
      "reroute temporarily.",
      "Use certified optics/cables",
      "keep spares."
    ],
    "tags": [
      "crc",
      "autoneg",
      "sfp"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-interfaces-flaps-9",
    "title": "Why does an access port keep going up/down frequently?",
    "category": "Network",
    "subcategory": "Flaps",
    "content": "### Overview\nWhy does an access port keep going up/down frequently?\n\n### Likely Causes\n- Loose cable\n- Power-saving NIC\n- Loop detection\n- PoE power issues\n\n### Observability Signals\n- Link up/down logs\n- PoE power draw\n- Errdisable reasons\n\n### Recommended CLI Commands\nshow log | inc link\nshow power inline <port>\n\n### Step-by-Step RCA\n1) Inspect cabling & NIC power settings\n2) Check PoE budget & negotiate\n3) Review errdisable recovery\n\n### Resolution\nReplace cable/NIC; adjust PoE allocation; disable aggressive power-save.\n\n### Preventive Actions\nCable management; NIC driver updates.\n\n### Related Tools\nSyslog, SNMP traps",
    "problem": "Loose cable",
    "area": "Flaps",
    "remedyItems": [
      "Replace cable/NIC",
      "adjust PoE allocation",
      "disable aggressive power-save.",
      "Cable management",
      "NIC driver updates."
    ],
    "tags": [
      "flap",
      "poe",
      "errdisable"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-performance-latency-jitter-10",
    "title": "What causes high jitter on VoIP?",
    "category": "Network",
    "subcategory": "Latency/Jitter",
    "content": "### Overview\nWhat causes high jitter on VoIP?\n\n### Likely Causes\n- Queue congestion\n- Wrong DSCP marking\n- WAN shaping mismatch\n- Clocking issues\n\n### Observability Signals\n- IPSLA MOS & jitter\n- Queue depth & drops\n- DSCP stats\n\n### Recommended CLI Commands\nshow policy-map interface\nip sla statistics\niperf3 -u -b ...\n\n### Step-by-Step RCA\n1) Verify end-to-end QoS trust/marking\n2) Ensure bandwidth/shape alignment\n3) Prioritize EF in queues\n\n### Resolution\nFix policy, adjust shaping/bandwidth, enable LLQ.\n\n### Preventive Actions\nBaseline QoS verification; synthetic probes.\n\n### Related Tools\nIPSLA/TWAMP, NetFlow",
    "problem": "Queue congestion",
    "area": "Latency/Jitter",
    "remedyItems": [
      "Fix policy, adjust shaping/bandwidth, enable LLQ.",
      "Baseline QoS verification",
      "synthetic probes."
    ],
    "tags": [
      "qos",
      "voip",
      "jitter"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-security-acl-firewall-11",
    "title": "Application reachable over Internet but API calls fail—why?",
    "category": "Security",
    "subcategory": "ACL/Firewall",
    "content": "### Overview\nApplication reachable over Internet but API calls fail—why?\n\n### Likely Causes\n- ACL missing ephemeral return path\n- NAT misconfig\n- TLS inspection break\n\n### Observability Signals\n- Firewall deny logs\n- NAT table utilization\n- TLS handshake errors\n\n### Recommended CLI Commands\nshow access-group\nshow conn | i <src>\nshow xlate | i <ip>\n\n### Step-by-Step RCA\n1) Reproduce and capture\n2) Check NAT & ACL symmetry\n3) Bypass inspection to validate\n\n### Resolution\nAdd return rules; fix NAT; adjust inspection policy.\n\n### Preventive Actions\nChange review for firewall pushes; preflight tests.\n\n### Related Tools\nFirewall logs, PCAP",
    "problem": "ACL missing ephemeral return path",
    "area": "ACL/Firewall",
    "remedyItems": [
      "Add return rules",
      "fix NAT",
      "adjust inspection policy.",
      "Change review for firewall pushes",
      "preflight tests."
    ],
    "tags": [
      "acl",
      "nat",
      "tls"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-vpn-ipsec-12",
    "title": "Why does IPsec tunnel come up but traffic drops?",
    "category": "Network",
    "subcategory": "IPsec",
    "content": "### Overview\nWhy does IPsec tunnel come up but traffic drops?\n\n### Likely Causes\n- Proxy-ID/Interesting traffic mismatch\n- MTU/MSS issues\n- Phase 2 lifetime mismatch\n\n### Observability Signals\n- SPI counters & rekeys\n- Drop/deny logs\n- Path MTU discovery\n\n### Recommended CLI Commands\nshow crypto isakmp/ikev2 sa\nshow crypto ipsec sa\nping df-bit size <n>\n\n### Step-by-Step RCA\n1) Validate proxy ACLs both sides\n2) Adjust MSS/MTU\n3) Align lifetimes and ciphers\n\n### Resolution\nCorrect selectors; set TCP MSS clamp; coordinate timers/ciphers.\n\n### Preventive Actions\nPredefined templates; PMTU testing.\n\n### Related Tools\nFirewall/VPN logs",
    "problem": "Proxy-ID/Interesting traffic mismatch",
    "area": "IPsec",
    "remedyItems": [
      "Correct selectors",
      "set TCP MSS clamp",
      "coordinate timers/ciphers.",
      "Predefined templates",
      "PMTU testing."
    ],
    "tags": [
      "ipsec",
      "mtu",
      "proxy-id"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-monitoring-snmp-13",
    "title": "SNMP polling failing intermittently—how to debug?",
    "category": "Platform",
    "subcategory": "SNMP",
    "content": "### Overview\nSNMP polling failing intermittently—how to debug?\n\n### Likely Causes\n- EngineID changes (v3)\n- ACL/CoPP rate limit\n- Device CPU high\n- VRF/path flap\n\n### Observability Signals\n- Ping vs SNMP success ratio\n- SNMP error codes/timeouts\n- Device CPU/mem spikes\n\n### Recommended CLI Commands\nsnmpwalk -v2c -c <c> <ip> 1.3.6.1.2.1.1\nshow snmp engineid\nshow control-plane statistics\n\n### Step-by-Step RCA\n1) Compare ICMP vs SNMP reachability\n2) Check CoPP/ACLs to poller\n3) Validate creds/EngineID after RMA\n\n### Resolution\nFix CoPP policy; update creds/EngineID; reduce poll frequency on busy devices.\n\n### Preventive Actions\nSNMP allow-lists; staggered polling; distributed pollers.\n\n### Related Tools\nNMS logs, Syslog",
    "problem": "EngineID changes (v3)",
    "area": "SNMP",
    "remedyItems": [
      "Fix CoPP policy",
      "update creds/EngineID",
      "reduce poll frequency on busy devices.",
      "SNMP allow-lists",
      "staggered polling",
      "distributed pollers."
    ],
    "tags": [
      "snmp",
      "copp",
      "v3"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-monitoring-trap-alert-storm-14",
    "title": "We received thousands of traps in minutes—what should we do?",
    "category": "Platform",
    "subcategory": "Trap/Alert Storm",
    "content": "### Overview\nWe received thousands of traps in minutes—what should we do?\n\n### Likely Causes\n- Flapping event source\n- Misconfigured trap destination\n- Firmware bug\n- Broadcast/loop events\n\n### Observability Signals\n- Trap volume rate/min\n- Top talkers by source\n- Recent change logs\n\n### Recommended CLI Commands\ntcpdump udp port 162\nshow logging last 100\nshow spanning-tree detail\n\n### Step-by-Step RCA\n1) Identify noisy source\n2) Quarantine via ACL/Rate-limit\n3) Fix root cause (loop, flaps)\n4) Patch firmware\n\n### Resolution\nApply trap dampening; correct configs; vendor bugfix.\n\n### Preventive Actions\nPre-prod trap tests; enable storm control.\n\n### Related Tools\nSyslog, Packet capture",
    "problem": "Flapping event source",
    "area": "Trap/Alert Storm",
    "remedyItems": [
      "Apply trap dampening",
      "correct configs",
      "vendor bugfix.",
      "Pre-prod trap tests",
      "enable storm control."
    ],
    "tags": [
      "trap-storm",
      "loop",
      "bug"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-monitoring-clock-ntp-15",
    "title": "Graphs misaligned and logs out of order—time skew suspected. Next steps?",
    "category": "Platform",
    "subcategory": "Clock/NTP",
    "content": "### Overview\nGraphs misaligned and logs out of order—time skew suspected. Next steps?\n\n### Likely Causes\n- NTP peer down\n- Wrong timezone/DST\n- Virtualization clock drift\n\n### Observability Signals\n- NTP sync state & offset\n- Device clock vs NMS\n- Log timestamps consistency\n\n### Recommended CLI Commands\nshow ntp associations\nshow clock detail\nntpq -p\n\n### Step-by-Step RCA\n1) Verify upstream NTP\n2) Fix ACLs to NTP servers\n3) Force sync and monitor offset\n\n### Resolution\nRestore NTP; standardize TZ; enable HA NTP.\n\n### Preventive Actions\nMultiple NTP sources; alerts on offset>100ms.\n\n### Related Tools\nNTP logs",
    "problem": "NTP peer down",
    "area": "Clock/NTP",
    "remedyItems": [
      "Restore NTP",
      "standardize TZ",
      "enable HA NTP.",
      "Multiple NTP sources",
      "alerts on offset>100ms."
    ],
    "tags": [
      "ntp",
      "time-skew"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-wireless-wlan-16",
    "title": "Why do clients get frequent Wi—˜Fi disconnects?",
    "category": "Network",
    "subcategory": "WLAN",
    "content": "### Overview\nWhy do clients get frequent Wi—˜Fi disconnects?\n\n### Likely Causes\n- Low SNR/Channel overlap\n- 2.4GHz congestion\n- Sticky clients/roaming issues\n- AP power imbalance\n\n### Observability Signals\n- SNR/RSSI heatmaps\n- Channel utilization\n- Client roam events\n\n### Recommended CLI Commands\nshow wlan client detail\nshow ap auto-rf\niw dev wlan0 link\n\n### Step-by-Step RCA\n1) Survey RF; set proper channels\n2) Enable band-steering & 802.11k/v/r\n3) Tune power and RRM\n\n### Resolution\nReassign channels; enable fast roam; adjust AP power.\n\n### Preventive Actions\nRegular RF surveys; capacity planning.\n\n### Related Tools\nWLC logs, RF tools",
    "problem": "Low SNR/Channel overlap",
    "area": "WLAN",
    "remedyItems": [
      "Reassign channels",
      "enable fast roam",
      "adjust AP power.",
      "Regular RF surveys",
      "capacity planning."
    ],
    "tags": [
      "wifi",
      "rf",
      "roaming"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-wan-sd-wan-17",
    "title": "App performance poor on one path only—how to isolate?",
    "category": "Network",
    "subcategory": "SD-WAN",
    "content": "### Overview\nApp performance poor on one path only—how to isolate?\n\n### Likely Causes\n- SLA violation on underlay\n- DPI misclassification\n- Asymmetric routing\n\n### Observability Signals\n- Per-path loss/latency\n- App-ID mapping\n- Path health events\n\n### Recommended CLI Commands\nshow app-route stats\nshow sla-class\ntraceroute --as-path-lookups\n\n### Step-by-Step RCA\n1) Compare path KPIs\n2) Validate App-ID and policy\n3) Force pin to good path and observe\n\n### Resolution\nFix underlay with ISP; correct DPI signatures; adjust policy.\n\n### Preventive Actions\nContinuous path probes; anomaly alerts.\n\n### Related Tools\nController logs, NetFlow",
    "problem": "SLA violation on underlay",
    "area": "SD-WAN",
    "remedyItems": [
      "Fix underlay with ISP",
      "correct DPI signatures",
      "adjust policy.",
      "Continuous path probes",
      "anomaly alerts."
    ],
    "tags": [
      "sd-wan",
      "sla",
      "dpi"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-device-cpu-memory-18",
    "title": "NMS shows high CPU on core switch—what to check?",
    "category": "Compute",
    "subcategory": "CPU/Memory",
    "content": "### Overview\nNMS shows high CPU on core switch—what to check?\n\n### Likely Causes\n- Control-plane attack or burst\n- Process leak/bug\n- Netflow/sFlow export overload\n\n### Observability Signals\n- CPU per process timeline\n- CoPP drops\n- SNMP poll rate\n\n### Recommended CLI Commands\nshow processes cpu sorted\nshow control-plane host open-ports\nshow flow exporter statistics\n\n### Step-by-Step RCA\n1) Identify top processes\n2) Rate-limit offenders/enable CoPP\n3) Patch or reload during window\n\n### Resolution\nMitigate traffic; upgrade firmware; tune telemetry rates.\n\n### Preventive Actions\nCapacity tests post-upgrade; monitor trendline.\n\n### Related Tools\nSyslog, SNMP, NetFlow",
    "problem": "Control-plane attack or burst",
    "area": "CPU/Memory",
    "remedyItems": [
      "Mitigate traffic",
      "upgrade firmware",
      "tune telemetry rates.",
      "Capacity tests post-upgrade",
      "monitor trendline."
    ],
    "tags": [
      "cpu",
      "copp"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-performance-internet-saas-19",
    "title": "Latency spike to SaaS (Teams/Zoom)—what checks isolate the issue?",
    "category": "Network",
    "subcategory": "Internet/SaaS",
    "content": "### Overview\nLatency spike to SaaS (Teams/Zoom)—what checks isolate the issue?\n\n### Likely Causes\n- Peering congestion\n- Middlebox inspection\n- Wrong DNS egress\n\n### Observability Signals\n- Loss/Latency to SaaS POP\n- TLS handshake times\n- DNS egress IP vs geo\n\n### Recommended CLI Commands\nUse standard ping/traceroute; device interface counters; NetFlow to SaaS prefixes.\n\n### Step-by-Step RCA\n1) Compare multiple egress paths\n2) Check middleboxes/inspection\n3) Validate DNS egress mapping\n\n### Resolution\nCompare loss/latency by egress; bypass inspection; test alternate DNS/egress.\n\n### Preventive Actions\nSet direct egress for SaaS; split—˜tunnel VPN; monitor SaaS status.\n\n### Related Tools\nIPSLA/TWAMP, NetFlow, Packet capture",
    "problem": "Peering congestion",
    "area": "Internet/SaaS",
    "remedyItems": [
      "Compare loss/latency by egress",
      "bypass inspection",
      "test alternate DNS/egress.",
      "Set direct egress for SaaS",
      "split—˜tunnel VPN",
      "monitor SaaS status."
    ],
    "tags": [
      "saas",
      "latency",
      "vpn"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-interfaces-uplink-20",
    "title": "Interface down on access switch uplink—what checks isolate the issue?",
    "category": "Network",
    "subcategory": "Uplink",
    "content": "### Overview\nInterface down on access switch uplink—what checks isolate the issue?\n\n### Likely Causes\n- Bad SFP/patch\n- Errdisable from BPDU guard/UDLD\n- Power loss upstream\n\n### Observability Signals\n- Link state logs\n- UDLD status\n- Optics light levels\n\n### Recommended CLI Commands\nUse standard ping/traceroute; device interface counters; NetFlow to SaaS prefixes.\n\n### Step-by-Step RCA\n1) Compare multiple egress paths\n2) Check middleboxes/inspection\n3) Validate DNS egress mapping\n\n### Resolution\nReplace SFP/cable; clear errdisable; restore power/UPLink.\n\n### Preventive Actions\nSpare optics; BPDU guard with intent.\n\n### Related Tools\nIPSLA/TWAMP, NetFlow, Packet capture",
    "problem": "Bad SFP/patch",
    "area": "Uplink",
    "remedyItems": [
      "Replace SFP/cable",
      "clear errdisable",
      "restore power/UPLink.",
      "Spare optics",
      "BPDU guard with intent."
    ],
    "tags": [
      "uplink",
      "errdisable",
      "udld"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-connectivity-arp-v1-21",
    "title": "ARP table shows incomplete/failed entries—Hosts can't reach gateway. (Case #1)",
    "category": "Network",
    "subcategory": "ARP v1",
    "content": "### Overview\nARP table shows incomplete/failed entries—Hosts can't reach gateway. (Case #1)\n\n### Likely Causes\n- ARP suppression/Proxy ARP issue\n- Duplicate IP/MAC conflict\n- VLAN mismatch\n\n### Observability Signals\n- ARP cache entries & age\n- Gratuitous ARP events\n\n### Recommended CLI Commands\narp -a\nshow ip arp\nshow mac address-table\n\n### Step-by-Step RCA\n1) Confirm VLAN & gateway reachability\n2) Check IP conflicts\n3) Validate ARP suppression/Proxy\n\n### Resolution\nResolve IP conflict; fix VLAN; disable faulty features.\n\n### Preventive Actions\nIPAM governance; DHCP reservations.\n\n### Related Tools\nPacket capture, ARP logs",
    "problem": "ARP suppression/Proxy ARP issue",
    "area": "ARP v1",
    "remedyItems": [
      "Resolve IP conflict",
      "fix VLAN",
      "disable faulty features.",
      "IPAM governance",
      "DHCP reservations."
    ],
    "tags": [
      "arp",
      "ip-conflict",
      "vlan"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-security-acl-v1-22",
    "title": "New app blocked after change window—how to quickly verify? (Case #1)",
    "category": "Security",
    "subcategory": "ACL v1",
    "content": "### Overview\nNew app blocked after change window—how to quickly verify? (Case #1)\n\n### Likely Causes\n- Missing rule or wrong order\n- Object-group not updated\n- Zone mismatch\n\n### Observability Signals\n- Hit counters per rule\n- Deny logs with 5—˜tuple\n\n### Recommended CLI Commands\nshow access-list | i <app>\nshow run object-group\npacket-tracer\n\n### Step-by-Step RCA\n1) Reproduce and capture denies\n2) Adjust rule order/object-group\n3) Change control review\n\n### Resolution\nInsert/modify rule carefully; rollback if needed.\n\n### Preventive Actions\nStaged pushes; shadow policies.\n\n### Related Tools\nFirewall logs",
    "problem": "Missing rule or wrong order",
    "area": "ACL v1",
    "remedyItems": [
      "Insert/modify rule carefully",
      "rollback if needed.",
      "Staged pushes",
      "shadow policies."
    ],
    "tags": [
      "acl",
      "change"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-performance-high-latency-29",
    "title": "Users experience high latency between sites or applications—what could be the reason?",
    "category": "Network",
    "subcategory": "High Latency",
    "content": "### Overview\nUsers experience high latency between sites or applications—what could be the reason?\n\n### Likely Causes\n- Congested WAN/ISP path\n- Queuing delay due to QoS misclassification\n- Routing suboptimal path or asymmetric routing\n- Interface errors or retransmissions\n- Middlebox (firewall, proxy) inspection delay\n\n### Observability Signals\n- Ping RTT and jitter\n- NetFlow latency percentile\n- QoS queue utilization\n- Traceroute hop latency distribution\n\n### Recommended CLI Commands\nping <dst> repeat 100\ntraceroute <dst>\nshow policy-map interface\nshow interface counters\nshow ip route <dst>\n\n### Step-by-Step RCA\n1) Baseline latency across multiple hops\n2) Identify the congested or lossy hop\n3) Check QoS classification and queues\n4) Compare ISP/WAN paths and verify routing symmetry\n\n### Resolution\nOptimize routing path; adjust QoS marking; request ISP reroute; disable deep inspection on latency-sensitive traffic.\n\n### Preventive Actions\nDeploy IPSLA probes; enable QoS monitoring dashboards; use multiple ISPs or SD-WAN dynamic path selection.\n\n### Related Tools\nIPSLA, TWAMP, NetFlow, Ping, Traceroute",
    "problem": "Congested WAN/ISP path",
    "area": "High Latency",
    "remedyItems": [
      "Optimize routing path",
      "adjust QoS marking",
      "request ISP reroute",
      "disable deep inspection on latency-sensitive traffic.",
      "Deploy IPSLA probes",
      "enable QoS monitoring dashboards"
    ],
    "tags": [
      "latency",
      "qos",
      "wan",
      "routing"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-configuration-config-drift-30",
    "title": "Configuration drift detected between production and baseline—why does this occur?",
    "category": "Configuration",
    "subcategory": "Config Drift",
    "content": "### Overview\nConfiguration drift detected between production and baseline—why does this occur?\n\n### Likely Causes\n- Manual CLI changes without change control\n- Failed or partial automation job\n- Rollback not applied post-maintenance\n- Unauthorized access or miscommit\n\n### Observability Signals\n- Baseline vs running config diff\n- GitOps or NCCM version mismatch\n- Recent user login history\n- Device config checksum alert\n\n### Recommended CLI Commands\nshow running-config | diff saved-config\nshow archive config differences\nshow users\ngit diff <branch>\n\n### Step-by-Step RCA\n1) Compare current config with golden baseline\n2) Identify unauthorized or untracked changes\n3) Validate automation pipeline logs\n4) Rollback to last known good configuration\n\n### Resolution\nRevert to baseline; restore via NCCM; correct automation pipeline; enforce config locks.\n\n### Preventive Actions\nImplement config compliance checks; enable GitOps workflow; automated drift detection with approval gate.\n\n### Related Tools\nNCCM, Git, Syslog, TACACS",
    "problem": "Manual CLI changes without change control",
    "area": "Config Drift",
    "remedyItems": [
      "Revert to baseline",
      "restore via NCCM",
      "correct automation pipeline",
      "enforce config locks.",
      "Implement config compliance checks",
      "enable GitOps workflow"
    ],
    "tags": [
      "config-drift",
      "nccm",
      "gitops",
      "baseline"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-performance-memory-leak-31",
    "title": "Router or application showing gradual memory increase leading to crash or reload.",
    "category": "Network",
    "subcategory": "Memory Leak",
    "content": "### Overview\nRouter or application showing gradual memory increase leading to crash or reload.\n\n### Likely Causes\n- Firmware or software memory leak bug\n- Logging/debug buffer overflow\n- High SNMP/telemetry polling rate\n- Unreleased session/connection handles\n\n### Observability Signals\n- Memory usage trendline (increasing over time)\n- Process-level memory stats\n- System logs with malloc failures\n- Frequent restarts/reboots\n\n### Recommended CLI Commands\nshow processes memory sorted\nshow system resources\ndir crashinfo:\nshow logging | inc memory\n\n### Step-by-Step RCA\n1) Identify top memory-consuming process\n2) Check for firmware bugs or patches\n3) Reduce SNMP/telemetry frequency\n4) Reboot device during maintenance window if exhausted\n\n### Resolution\nUpgrade to fixed firmware; clean up debug/log settings; adjust polling intervals; apply vendor bug patch.\n\n### Preventive Actions\nMonitor memory trendlines; enable auto-restart policies; maintain software currency.\n\n### Related Tools\nSNMP, Syslog, Crashinfo, Telemetry",
    "problem": "Firmware or software memory leak bug",
    "area": "Memory Leak",
    "remedyItems": [
      "Upgrade to fixed firmware",
      "clean up debug/log settings",
      "adjust polling intervals",
      "apply vendor bug patch.",
      "Monitor memory trendlines",
      "enable auto-restart policies"
    ],
    "tags": [
      "memory-leak",
      "firmware",
      "telemetry",
      "snmp"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-services-dns-failure-32",
    "title": "Applications failing due to DNS lookup errors or high response time.",
    "category": "Network",
    "subcategory": "DNS Failure",
    "content": "### Overview\nApplications failing due to DNS lookup errors or high response time.\n\n### Likely Causes\n- Primary DNS unreachable\n- Misconfigured resolver or search domain\n- Recursive query timeout\n- Firewall or inspection blocking UDP 53\n- Anycast DNS health degradation\n\n### Observability Signals\n- DNS response time metrics\n- NXDOMAIN and SERVFAIL rates\n- Resolver logs showing timeout/errors\n- Packet capture showing dropped UDP/53\n\n### Recommended CLI Commands\nnslookup <fqdn>\ndig +trace <fqdn>\ntcpdump -n udp port 53\nshow access-lists | inc 53\n\n### Step-by-Step RCA\n1) Test DNS from alternate resolver\n2) Validate forwarder and cache settings\n3) Check packet flow for DNS traffic\n4) Review firewall ACLs or inspection policy\n\n### Resolution\nRestore DNS reachability; correct DNS configuration; disable faulty inspection; failover to secondary resolver.\n\n### Preventive Actions\nDeploy redundant DNS servers; enable DNS SLA probes; automate Anycast health checks.\n\n### Related Tools\nDNS logs, Packet capture, Syslog, IPSLA",
    "problem": "Primary DNS unreachable",
    "area": "DNS Failure",
    "remedyItems": [
      "Restore DNS reachability",
      "correct DNS configuration",
      "disable faulty inspection",
      "failover to secondary resolver.",
      "Deploy redundant DNS servers",
      "enable DNS SLA probes"
    ],
    "tags": [
      "dns-failure",
      "anycast",
      "resolver",
      "udp53"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-routing-bgp-flag-33",
    "title": "BGP neighbor shows 'Idle', 'Active', or 'Connect' state with route instability.",
    "category": "Network",
    "subcategory": "BGP Flag",
    "content": "### Overview\nBGP neighbor shows 'Idle', 'Active', or 'Connect' state with route instability.\n\n### Likely Causes\n- Incorrect neighbor IP or VRF mismatch\n- Authentication (MD5) mismatch\n- TCP port 179 blocked by firewall\n- Route reflector loop or dampening\n- Flapping link causing session reset\n\n### Observability Signals\n- BGP neighbor state transitions\n- BGP error code messages (FSM log)\n- TCP 179 connection failure\n- Interface flap logs\n\n### Recommended CLI Commands\nshow bgp summary\nshow ip bgp neighbors\nshow tcp brief | inc 179\nshow log | inc BGP\n\n### Step-by-Step RCA\n1) Check BGP neighbor configuration\n2) Validate MD5 authentication keys\n3) Verify reachability of TCP 179\n4) Check link and route stability\n\n### Resolution\nFix neighbor IP/VRF; correct MD5; open TCP 179; stabilize link; coordinate with ISP.\n\n### Preventive Actions\nEnable BFD for fast detection; periodic session stability checks; alert on BGP FSM changes.\n\n### Related Tools\nBGP logs, Syslog, BFD, NetFlow",
    "problem": "Incorrect neighbor IP or VRF mismatch",
    "area": "BGP Flag",
    "remedyItems": [
      "Fix neighbor IP/VRF",
      "correct MD5",
      "open TCP 179",
      "stabilize link",
      "coordinate with ISP.",
      "Enable BFD for fast detection"
    ],
    "tags": [
      "bgp-flag",
      "fsm",
      "tcp179",
      "vrf"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-infrastructure-cpu-process-spike-34",
    "title": "Device CPU spiked to 100%, affecting control-plane responsiveness.",
    "category": "Compute",
    "subcategory": "CPU/Process Spike",
    "content": "### Overview\nDevice CPU spiked to 100%, affecting control-plane responsiveness.\n\n### Likely Causes\n- Control-plane attack (ICMP/ARP flood)\n- Bug causing runaway process\n- Telemetry or SNMP overload\n- High NetFlow export rate\n\n### Observability Signals\n- CPU per process\n- CoPP drop counters\n- NetFlow export rate\n- Process restart frequency\n\n### Recommended CLI Commands\nshow processes cpu sorted\nshow control-plane statistics\nshow flow exporter statistics\nshow log | inc CPU\n\n### Step-by-Step RCA\n1) Identify top CPU-consuming process\n2) Check for attack or burst traffic\n3) Reduce telemetry/export rates\n4) Upgrade or patch firmware\n\n### Resolution\nRate-limit control-plane; disable unnecessary processes; reboot during maintenance; apply firmware patch.\n\n### Preventive Actions\nEnable CoPP policies; monitor CPU trends; load test before upgrades.\n\n### Related Tools\nSNMP, Syslog, CoPP, Telemetry",
    "problem": "Control-plane attack (ICMP/ARP flood)",
    "area": "CPU/Process Spike",
    "remedyItems": [
      "Rate-limit control-plane",
      "disable unnecessary processes",
      "reboot during maintenance",
      "apply firmware patch.",
      "Enable CoPP policies",
      "monitor CPU trends"
    ],
    "tags": [
      "cpu",
      "process",
      "copp",
      "telemetry"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-gen-uncategorized-general-35",
    "title": "link loss",
    "category": "Uncategorized",
    "subcategory": "General",
    "content": "### Overview\nlink loss\n\n### Likely Causes\n- physical disconnection\n- packet loss\n- use of low-quality materials\n\n### Observability Signals\n- link is not active more than some time\n- sudden disconnection\n\n### Recommended CLI Commands\nping<ip>\n\n### Step-by-Step RCA\n1) test for speed test\n2) tape or cover exposed part\n3) exchange for new\n\n### Resolution\ntest for speed test, tape or cover exposed part, exchange for new\n\n### Preventive Actions\nfrequent check of physical cables, and regular speed check\n\n### Related Tools\nping",
    "problem": "physical disconnection",
    "area": "General",
    "remedyItems": [
      "test for speed test, tape or cover exposed part, exchange for new",
      "frequent check of physical cables, and regular speed check"
    ],
    "tags": [
      "link"
    ],
    "linkedIntents": [],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 80
  },
  {
    "id": "kb-link-006",
    "title": "Optical interface Rx power is degrading — causing intermittent errors. What are the causes?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": "### Overview\nOptical interface Rx power is degrading — causing intermittent errors. What are the causes?\n\n### Likely Causes\n- Dirty or contaminated fiber connector (most common cause)\n- Fiber bend radius violation causing signal attenuation\n- Aging SFP transceiver with declining Tx power\n- Fiber splice degradation or water ingress in outdoor plant\n- Incorrect fiber type (single-mode SFP on multi-mode fiber)\n- Long cable run exceeding SFP Rx sensitivity budget\n\n### Observability Signals\n- optical_rx_power_dbm dropping below -20 dBm\n- DDM Rx power alarms (low warning, low alarm thresholds)\n- CRC errors increasing as Rx power degrades\n- Intermittent link flaps near Rx power sensitivity limit\n- DDM Tx power normal (isolates to fiber/connector, not SFP Tx)\n\n### Recommended CLI Commands\nshow interface <int> transceiver\nddm interface <int>\nshow interface <int> counters errors\nshow environment (optical alarms)\notdr test interface <int> (where supported)\n\n### Step-by-Step RCA\n1) Pull DDM Rx power: compare to SFP minimum Rx sensitivity (-18 to -22 dBm typical)\n2) If Rx power marginal but Tx normal: fiber/connector is suspect, not SFP Tx\n3) Clean fiber connector with approved cleaning kit and re-seat\n4) Test with known-good short patch to isolate plant fiber vs connector\n5) If long-haul: run OTDR to identify splice loss or fiber bend\n6) Check fiber type compatibility: SMF vs MMF SFP mismatch\n\n### Resolution\nClean fiber connectors; replace damaged patch cable; correct fiber type mismatch; replace aging SFP; repair splice.\n\n### Preventive Actions\nSchedule quarterly fiber connector cleaning; baseline DDM Rx power per link at commissioning; alert when Rx drops 3 dB from baseline.\n\n### Related Tools\nDDM/DOM, OTDR, fiber inspection scope, SNMP",
    "problem": "Dirty or contaminated fiber connector (most common cause)",
    "area": "Link Layer",
    "remedyItems": [
      "Clean fiber connectors",
      "replace damaged patch cable",
      "correct fiber type mismatch",
      "replace aging SFP",
      "repair splice.",
      "Schedule quarterly fiber connector cleaning"
    ],
    "tags": [
      "optical",
      "rx-power",
      "ddm",
      "fiber",
      "sfp",
      "connector",
      "otdr"
    ],
    "linkedIntents": [
      "link.optical_degraded"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-link-007",
    "title": "Interface is in err-disable state — what triggered it and how to recover?",
    "category": "Network",
    "subcategory": "Link Layer",
    "content": "### Overview\nInterface is in err-disable state — what triggered it and how to recover?\n\n### Likely Causes\n- BPDU Guard violation: STP BPDU received on PortFast-enabled access port\n- UDLD aggressive mode detecting unidirectional link\n- Port-security MAC address violation\n- Loop detection (UDLD, loop-guard, or vendor loop-detect)\n- PoE overload causing err-disable\n- Storm control threshold exceeded\n- DHCP snooping rate exceeded\n\n### Observability Signals\n- interface_oper_status == errdisable\n- Syslog: 'err-disabled' with reason code\n- show errdisable recovery showing reason\n- Interface in down state with errdisable reason\n- Port-security violation counter incrementing\n\n### Recommended CLI Commands\nshow interfaces status err-disabled\nshow errdisable recovery\nshow errdisable detect\nshow logging | inc err-disable|BPDU|UDLD|violation\nshow port-security interface <int>\nshow spanning-tree interface <int>\n\n### Step-by-Step RCA\n1) Identify err-disable reason: 'show interfaces status err-disabled'\n2) BPDU guard: unauthorized switch connected to access port?\n3) UDLD: unidirectional fiber issue? Enable UDLD neighbor check\n4) Port-security: MAC violation — unknown device or MAC spoofing?\n5) Loop-detect: physical loop in wiring closet?\n6) Resolve root cause before re-enabling port\n\n### Resolution\nRemove offending device or loop; fix fiber (UDLD); re-enable port after fix: 'shutdown/no shutdown' or configure err-disable recovery timer.\n\n### Preventive Actions\nConfigure err-disable recovery with appropriate timer per reason; alert on err-disable events; document allowed devices per port.\n\n### Related Tools\nSyslog, SNMP, port-security, UDLD, STP logs",
    "problem": "BPDU Guard violation: STP BPDU received on PortFast-enabled access port",
    "area": "Link Layer",
    "remedyItems": [
      "Remove offending device or loop",
      "fix fiber (UDLD)",
      "re-enable port after fix: 'shutdown/no shutdown' or configure err-disable recovery timer.",
      "Configure err-disable recovery with appropriate timer per reason",
      "alert on err-disable events",
      "document allowed devices per port."
    ],
    "tags": [
      "errdisable",
      "bpdu-guard",
      "udld",
      "port-security",
      "loop-detect",
      "storm-control"
    ],
    "linkedIntents": [
      "link.errdisable"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-routing-003",
    "title": "IS-IS adjacency is not forming or has dropped — what should I check?",
    "category": "Network",
    "subcategory": "Routing",
    "content": "### Overview\nIS-IS adjacency is not forming or has dropped — what should I check?\n\n### Likely Causes\n- IS-IS area ID mismatch between peers (Level-1 vs Level-2 boundary)\n- Authentication type or key mismatch\n- MTU mismatch causing LSP fragmentation\n- Duplicate System ID in the domain\n- Interface not enabled for IS-IS\n- Hello padding causing oversized frames on some media types\n- IP address missing on IS-IS enabled interface\n\n### Observability Signals\n- isis_neighbor_state != UP\n- ISIS adjacency change events in syslog\n- IS-IS hello PDU received but adjacency not forming\n- Syslog: 'IS-IS authentication failed', 'area mismatch'\n- isis_adj_changes > 3 in monitoring window\n\n### Recommended CLI Commands\nshow isis neighbors\nshow isis database\nshow clns interface\nshow run | sec router isis\nshow logging | inc ISIS|IS-IS\ndebug isis adj-packets (brief window)\n\n### Step-by-Step RCA\n1) Check neighbor state: 'show isis neighbors' — Init vs Full\n2) Verify area ID matches on both ends (Level-1 must share area)\n3) Validate auth type and key match (MD5 / plaintext)\n4) Check MTU: IS-IS hellos include padding by default to test MTU\n5) Confirm no duplicate System IDs: 'show isis database'\n6) Ensure interface has IP address and 'ip router isis' applied\n\n### Resolution\nAlign area IDs; match auth keys; set 'no isis hello padding' if MTU limited; fix duplicate SID; assign IP to interface.\n\n### Preventive Actions\nPre-validate IS-IS config with template comparison before deploy; monitor adjacency count per device; unique SID assignment process.\n\n### Related Tools\nIS-IS logs, Syslog, SNMP",
    "problem": "IS-IS area ID mismatch between peers (Level-1 vs Level-2 boundary)",
    "area": "Routing",
    "remedyItems": [
      "Align area IDs",
      "match auth keys",
      "set 'no isis hello padding' if MTU limited",
      "fix duplicate SID",
      "assign IP to interface.",
      "Pre-validate IS-IS config with template comparison before deploy"
    ],
    "tags": [
      "isis",
      "adjacency",
      "area-id",
      "authentication",
      "mtu",
      "system-id"
    ],
    "linkedIntents": [
      "routing.isis_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-routing-004",
    "title": "EIGRP route is stuck in Active state — what causes SIA and how to recover?",
    "category": "Network",
    "subcategory": "Routing",
    "content": "### Overview\nEIGRP route is stuck in Active state — what causes SIA and how to recover?\n\n### Likely Causes\n- Stuck-In-Active (SIA): query not replied by distant neighbor within active timer\n- Flapping link causing repeated DUAL reconvergence\n- Passive interface configured on link that should be active\n- EIGRP query scope too wide — query propagating across entire domain\n- Neighbor not responding to query due to CPU overload\n- Route summarization missing — queries leaking across domain boundary\n\n### Observability Signals\n- eigrp_sia_count > 0 in logs\n- Route stuck in Active state in topology table\n- Neighbor dropped after active timer expiry\n- Syslog: 'DUAL-3-SIA: Route stuck in active state'\n- Repeated route flaps in routing table\n\n### Recommended CLI Commands\nshow ip eigrp topology active\nshow ip eigrp neighbors\nshow logging | inc DUAL|SIA|EIGRP\nshow ip eigrp topology all-links\nshow ip eigrp interfaces\nshow ip eigrp traffic\n\n### Step-by-Step RCA\n1) Check for SIA routes: 'show ip eigrp topology active'\n2) Identify which neighbor failed to reply to query\n3) Check link quality to that neighbor — lossy link?\n4) Review EIGRP query scope: implement summarization to limit query propagation\n5) Check passive interface config — is a needed link passive?\n6) Check CPU on neighbor that went SIA — was it overwhelmed?\n\n### Resolution\nFix underlying link issue; implement EIGRP summarization at distribution/core; increase SIA timer if needed; add stub routing at edges.\n\n### Preventive Actions\nUse EIGRP stub on spoke/leaf routers to limit queries; implement summarization; monitor SIA count via SNMP.\n\n### Related Tools\nEIGRP logs, Syslog, SNMP",
    "problem": "Stuck-In-Active (SIA): query not replied by distant neighbor within active timer",
    "area": "Routing",
    "remedyItems": [
      "Fix underlying link issue",
      "implement EIGRP summarization at distribution/core",
      "increase SIA timer if needed",
      "add stub routing at edges.",
      "Use EIGRP stub on spoke/leaf routers to limit queries",
      "implement summarization"
    ],
    "tags": [
      "eigrp",
      "stuck-in-active",
      "sia",
      "dual",
      "query",
      "summarization",
      "stub"
    ],
    "linkedIntents": [
      "routing.eigrp_stuck"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-routing-005",
    "title": "Routes are leaking between routing domains or VRFs — how to detect and contain a route leak?",
    "category": "Network",
    "subcategory": "Routing",
    "content": "### Overview\nRoutes are leaking between routing domains or VRFs — how to detect and contain a route leak?\n\n### Likely Causes\n- Missing or incorrect prefix-list/route-map on redistribution point\n- BGP community no-export not set on routes that should stay internal\n- Default route accidentally redistributed into IGP\n- VRF route-target import/export misconfiguration leaking routes across VPNs\n- Static route redistributed without tag-based loop prevention\n- Summarization suppressing specific routes but redistributing summary incorrectly\n\n### Observability Signals\n- Unexpected prefixes appearing in routing table\n- BGP peers receiving routes they should not see\n- Traffic taking unexpected path (traceroute anomaly)\n- Route metric/source incorrect (e.g., OSPF route in BGP domain)\n- Duplicate routes with different sources in RIB\n\n### Recommended CLI Commands\nshow ip route <leaked-prefix>\nshow bgp neighbors <peer> advertised-routes | inc <prefix>\nshow ip bgp <prefix> (check communities)\nshow route-map <n>\nshow ip prefix-list\nshow ip ospf database | inc <leaked-prefix>\n\n### Step-by-Step RCA\n1) Identify leaked prefix: where is it originating and where is it appearing?\n2) Trace the redistribution path — which device is injecting it?\n3) Check route-map on redistribution: is prefix-list applied inbound and outbound?\n4) For BGP: check community tags — is no-export missing?\n5) For VRF: check RT import policy — is it too broad?\n6) Apply deny rule for leaked prefix immediately, then fix root cause\n\n### Resolution\nApply prefix-list deny on redistribution; add BGP no-export community; fix RT import policy; add route tags for loop prevention.\n\n### Preventive Actions\nAlways use explicit permit prefix-lists on all redistribution points; peer review redistribution configs; lab test before production.\n\n### Related Tools\nBGP logs, routing table, Syslog, looking glass",
    "problem": "Missing or incorrect prefix-list/route-map on redistribution point",
    "area": "Routing",
    "remedyItems": [
      "Apply prefix-list deny on redistribution",
      "add BGP no-export community",
      "fix RT import policy",
      "add route tags for loop prevention.",
      "Always use explicit permit prefix-lists on all redistribution points",
      "peer review redistribution configs"
    ],
    "tags": [
      "route-leak",
      "redistribution",
      "bgp-community",
      "prefix-list",
      "vrf",
      "no-export"
    ],
    "linkedIntents": [
      "routing.route_leak"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-001",
    "title": "A Layer 2 loop is suspected — broadcast storm and MAC flapping occurring. How to detect and break it?",
    "category": "Network",
    "subcategory": "Switching",
    "content": "### Overview\nA Layer 2 loop is suspected — broadcast storm and MAC flapping occurring. How to detect and break it?\n\n### Likely Causes\n- PortFast missing on access ports — TCN floods on every endpoint connect/disconnect\n- bpdu-filter applied incorrectly disabling STP on a port (loop undetected)\n- Unmanaged switch inserted creating loop with no BPDU awareness\n- STP accidentally disabled (no spanning-tree) on a VLAN\n- Incorrect cable creating physical loop in wiring closet\n- MST region boundary misconfiguration creating L2 loop\n\n### Observability Signals\n- broadcast_rate_pps spiking to wire rate\n- MAC address flapping (same MAC seen on multiple ports)\n- CPU at 100% on switch processing broadcasts\n- Interface utilization at 100% in both directions\n- Syslog: 'MAC_MOVE', 'topology change flood'\n\n### Recommended CLI Commands\nshow spanning-tree detail | inc ieee|occur|from\nshow mac address-table | inc <mac>\nshow interfaces counters (look for wire-rate utilization)\nshow logging | inc LOOP|MAC_MOVE|topology\nshow spanning-tree vlan <id>\nshow storm-control\n\n### Step-by-Step RCA\n1) Confirm loop: MAC address seen on 2+ ports simultaneously\n2) Identify affected VLAN via broadcast storm on specific VLAN\n3) Disconnect suspect links one at a time until storm stops\n4) Check for bpdu-filter on any port — if present, likely cause\n5) Check all access ports for PortFast + BPDU guard\n6) After storm cleared: enable storm-control as immediate protection\n\n### Resolution\nDisconnect looping cable; enable BPDU guard on access ports; remove bpdu-filter misuse; re-enable STP on affected VLAN.\n\n### Preventive Actions\nEnable BPDU guard on all access ports; deploy loop-guard on uplinks; enable storm control on all access ports; audit unmanaged switches.\n\n### Related Tools\nSTP logs, Syslog, MAC address table, SNMP",
    "problem": "PortFast missing on access ports — TCN floods on every endpoint connect/disconnect",
    "area": "Switching",
    "remedyItems": [
      "Disconnect looping cable",
      "enable BPDU guard on access ports",
      "remove bpdu-filter misuse",
      "re-enable STP on affected VLAN.",
      "Enable BPDU guard on all access ports",
      "deploy loop-guard on uplinks"
    ],
    "tags": [
      "stp-loop",
      "broadcast-storm",
      "mac-flap",
      "bpdu-filter",
      "portfast",
      "loop-guard"
    ],
    "linkedIntents": [
      "switching.stp_loop"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-002",
    "title": "Traffic not passing across trunk correctly — VLAN mismatch suspected. What should I check?",
    "category": "Network",
    "subcategory": "Switching",
    "content": "### Overview\nTraffic not passing across trunk correctly — VLAN mismatch suspected. What should I check?\n\n### Likely Causes\n- Native VLAN mismatch on 802.1Q trunk (CDP warning visible)\n- VLAN not in allowed list on trunk interface\n- Access port assigned to wrong VLAN\n- VTP domain mismatch causing VLAN database inconsistency\n- Voice VLAN not configured on access port for IP phone\n- VLAN pruning removing needed VLAN from trunk\n\n### Observability Signals\n- Hosts in VLAN cannot reach each other across trunk\n- CDP/LLDP showing native VLAN mismatch warning\n- ARP requests not reaching hosts across trunk\n- Syslog: 'native VLAN mismatch'\n- show interfaces trunk shows VLAN not in 'VLANs allowed and active'\n\n### Recommended CLI Commands\nshow interfaces trunk\nshow vlan brief\nshow interfaces <int> switchport\nshow cdp neighbors <int> detail | inc VLAN\nshow run interface <int> | inc vlan\nshow vtp status\n\n### Step-by-Step RCA\n1) 'show interfaces trunk' — check 'VLANs allowed and active in management domain'\n2) Check native VLAN both ends match: 'show interfaces trunk'\n3) Verify VLAN is in allowed list on trunk: add if missing\n4) For access port: 'show interfaces <int> switchport' — correct access VLAN?\n5) Check VTP: if VTP, VLAN must exist in VTP database\n6) Confirm VLAN is active: 'show vlan brief' — is it active or suspended?\n\n### Resolution\nAdd VLAN to trunk allowed list; align native VLAN both ends; correct access VLAN assignment; fix VTP domain; activate VLAN.\n\n### Preventive Actions\nAlways explicitly define allowed VLANs on trunks; disable VTP (use VTP transparent or off); alert on native VLAN mismatch.\n\n### Related Tools\nSyslog, CDP/LLDP, SNMP, VTP logs",
    "problem": "Native VLAN mismatch on 802.1Q trunk (CDP warning visible)",
    "area": "Switching",
    "remedyItems": [
      "Add VLAN to trunk allowed list",
      "align native VLAN both ends",
      "correct access VLAN assignment",
      "fix VTP domain",
      "activate VLAN.",
      "Always explicitly define allowed VLANs on trunks"
    ],
    "tags": [
      "vlan-mismatch",
      "native-vlan",
      "trunk",
      "vtp",
      "vlan-allowed",
      "access-vlan"
    ],
    "linkedIntents": [
      "switching.vlan_mismatch"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-003",
    "title": "MAC address table overflow causing traffic flooding — how to diagnose and mitigate?",
    "category": "Network",
    "subcategory": "Switching",
    "content": "### Overview\nMAC address table overflow causing traffic flooding — how to diagnose and mitigate?\n\n### Likely Causes\n- Malicious CAM table overflow attack (MAC flooding tool)\n- VM live migration causing MAC moves across physical hosts\n- MAC aging timer too short causing repeated relearning and flooding\n- MAC table exhausted — switch capacity reached\n- Spanning tree topology change resetting MAC aging to 15 seconds\n- High-density environment exceeding switch MAC table capacity\n\n### Observability Signals\n- mac_table_utilization_percent near 100%\n- High unicast flooding rate on all ports\n- MAC entries seen on multiple ports (MAC moves)\n- Syslog: 'MAC_MOVE', 'mac-address-table full'\n- Traffic visible on ports that should not receive unicast\n\n### Recommended CLI Commands\nshow mac address-table count\nshow mac address-table aging-time\nshow mac address-table | count\nshow logging | inc MAC_MOVE\nshow spanning-tree detail | inc topology\nshow port-security (if deployed)\n\n### Step-by-Step RCA\n1) Check MAC table utilization: 'show mac address-table count'\n2) Check for MAC flood attack: many random MACs from single port?\n3) Check for STP topology change resetting aging: 'show spanning-tree'\n4) For VM migration: is flooding expected during vMotion events?\n5) Check aging timer: if very short, relearning constantly\n6) Use port-security max MACs to limit CAM entries per port\n\n### Resolution\nEnable port-security to limit MACs per port; filter MAC flood source; increase MAC table; tune aging timer; fix STP topology changes.\n\n### Preventive Actions\nEnable port-security on access ports with max-mac limit; monitor MAC table utilization; alert on MAC move rate spikes.\n\n### Related Tools\nSyslog, SNMP, port-security, STP logs",
    "problem": "Malicious CAM table overflow attack (MAC flooding tool)",
    "area": "Switching",
    "remedyItems": [
      "Enable port-security to limit MACs per port",
      "filter MAC flood source",
      "increase MAC table",
      "tune aging timer",
      "fix STP topology changes.",
      "Enable port-security on access ports with max-mac limit"
    ],
    "tags": [
      "mac-flood",
      "cam-overflow",
      "mac-table",
      "port-security",
      "vm-migration",
      "unicast-flooding"
    ],
    "linkedIntents": [
      "switching.mac_flood"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-004",
    "title": "LACP port-channel has gone down or lost all members — how to restore?",
    "category": "Network",
    "subcategory": "Switching",
    "content": "### Overview\nLACP port-channel has gone down or lost all members — how to restore?\n\n### Likely Causes\n- All physical member links failed simultaneously (upstream switch failure)\n- LACP partner system ID changed (switch replaced without config)\n- Min-links threshold not met — bundle went down when members fell below minimum\n- Member links failing due to physical/optical issues\n- LACP PDU exchange stopped — remote switch rebooting\n- Incorrect bundling — members distributed across different switches in stack\n\n### Observability Signals\n- portchannel_state == down\n- portchannel_active_members == 0\n- All member interfaces in down/err-disable state\n- LACP PDU counters stopped\n- Syslog: 'LINEPROTO-5-UPDOWN Port-channel down'\n- min-links threshold events in log\n\n### Recommended CLI Commands\nshow etherchannel summary\nshow interfaces port-channel <n>\nshow lacp neighbor\nshow lacp counters\nshow logging | inc Port-channel|LACP\nshow interfaces <member-int> status\n\n### Step-by-Step RCA\n1) Check member link states: 'show etherchannel summary' — any member in I (individual) or D (down)?\n2) Check physical links: all members down simultaneously suggests upstream device failure\n3) Verify LACP partner system MAC: 'show lacp neighbor' — did peer change?\n4) Check min-links config: how many members required?\n5) Restore member links or fix upstream device\n6) If partner changed (device replaced): reconfigure LACP on new device\n\n### Resolution\nRestore physical member links; fix upstream switch; reconfigure LACP partner; adjust min-links threshold; reseat cables.\n\n### Preventive Actions\nSet min-links below number of uplinks for graceful degradation; monitor member count; alert on member count reduction.\n\n### Related Tools\nSNMP, Syslog, LACP PDU counters",
    "problem": "All physical member links failed simultaneously (upstream switch failure)",
    "area": "Switching",
    "remedyItems": [
      "Restore physical member links",
      "fix upstream switch",
      "reconfigure LACP partner",
      "adjust min-links threshold",
      "reseat cables.",
      "Set min-links below number of uplinks for graceful degradation"
    ],
    "tags": [
      "lacp-down",
      "port-channel",
      "etherchannel",
      "min-links",
      "member-down",
      "bundle"
    ],
    "linkedIntents": [
      "switching.lacp_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-switching-005",
    "title": "Private VLAN hosts cannot reach gateway or each other as expected — how to diagnose?",
    "category": "Network",
    "subcategory": "Switching",
    "content": "### Overview\nPrivate VLAN hosts cannot reach gateway or each other as expected — how to diagnose?\n\n### Likely Causes\n- Gateway/router port not configured as promiscuous\n- Secondary VLAN not mapped to primary VLAN\n- Primary VLAN not allowed on uplink trunk\n- Community VLAN members cannot reach each other (isolated VLAN misassigned)\n- SVI not configured as PVLAN promiscuous for L3 routing\n- VTP propagation issue with PVLAN configuration\n\n### Observability Signals\n- Hosts in isolated PVLAN cannot reach gateway\n- Community VLAN hosts cannot communicate\n- ARP for gateway not resolving\n- show vlan private-vlan shows mapping missing\n- Trunk not carrying primary VLAN\n\n### Recommended CLI Commands\nshow vlan private-vlan\nshow interfaces switchport\nshow run interface <gateway-int>\nshow vlan brief\nshow interfaces trunk | inc <primary-vlan>\n\n### Step-by-Step RCA\n1) Check PVLAN config: 'show vlan private-vlan' — primary-secondary mapping correct?\n2) Verify gateway port is promiscuous: 'show interfaces <port> switchport'\n3) Confirm primary VLAN on uplink trunk\n4) Check SVI: 'ip address' and 'private-vlan mapping' configured?\n5) Test ARP from isolated host to gateway IP\n6) Verify community vs isolated assignment matches intended policy\n\n### Resolution\nSet gateway port to promiscuous; map secondary to primary VLAN; add primary to trunk; configure SVI PVLAN mapping.\n\n### Preventive Actions\nDocument PVLAN design; test all port types at deployment; avoid VTP for PVLAN (manual config preferred).\n\n### Related Tools\nSyslog, Packet capture, SNMP",
    "problem": "Gateway/router port not configured as promiscuous",
    "area": "Switching",
    "remedyItems": [
      "Set gateway port to promiscuous",
      "map secondary to primary VLAN",
      "add primary to trunk",
      "configure SVI PVLAN mapping.",
      "Document PVLAN design",
      "test all port types at deployment"
    ],
    "tags": [
      "pvlan",
      "private-vlan",
      "promiscuous",
      "isolated",
      "community",
      "svi"
    ],
    "linkedIntents": [
      "switching.pvlan_issue"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-perf-003",
    "title": "End-to-end latency has spiked for specific flows — how to isolate the latency injection point?",
    "category": "Network",
    "subcategory": "Performance",
    "content": "### Overview\nEnd-to-end latency has spiked for specific flows — how to isolate the latency injection point?\n\n### Likely Causes\n- Routing change adding hops (BGP path change, IGP reconvergence)\n- Serialization delay on low-bandwidth links with large frames\n- Device processing delay (high CPU, software switching instead of hardware)\n- ISP BGP routing table change increasing path length\n- Asymmetric routing through distant POP\n- Queuing delay from congestion on transit link\n\n### Observability Signals\n- latency_ms > baseline by > 20%\n- Traceroute showing new hops or increased RTT at specific hop\n- Routing table change coinciding with latency spike\n- IPSLA RTT probe elevated\n- Specific destination affected (not all-destinations = local issue)\n\n### Recommended CLI Commands\ntraceroute <dst> source <src>\nmtr <dst> (continuous traceroute)\nshow ip route <dst>\nping <dst> repeat 100 size 1400\nip sla statistics\nshow ip bgp <dst-prefix> (check path changes)\n\n### Step-by-Step RCA\n1) Run traceroute: identify which hop added latency\n2) Is hop inside your network or ISP network?\n3) Check routing table: did path change recently? When?\n4) Compare BGP path before and after latency increase\n5) If internal device: check CPU — is it software-switching?\n6) Check for serialization: packet_size / link_bps = serialization_delay\n\n### Resolution\nRestore optimal routing path; fix BGP preference; upgrade low-bandwidth link; fix software-switching to hardware CEF; engage ISP.\n\n### Preventive Actions\nDeploy continuous IPSLA RTT probes; alert on latency > 2x baseline; maintain routing change log.\n\n### Related Tools\nIPSLA, traceroute, MTR, BGP logs, SNMP",
    "problem": "Routing change adding hops (BGP path change, IGP reconvergence)",
    "area": "Performance",
    "remedyItems": [
      "Restore optimal routing path",
      "fix BGP preference",
      "upgrade low-bandwidth link",
      "fix software-switching to hardware CEF",
      "engage ISP.",
      "Deploy continuous IPSLA RTT probes"
    ],
    "tags": [
      "latency",
      "traceroute",
      "routing-change",
      "bgp-path",
      "serialization",
      "ipsla"
    ],
    "linkedIntents": [
      "performance.high_latency"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-perf-004",
    "title": "Stateful firewall dropping established sessions — could asymmetric routing be the cause?",
    "category": "Network",
    "subcategory": "Performance",
    "content": "### Overview\nStateful firewall dropping established sessions — could asymmetric routing be the cause?\n\n### Likely Causes\n- Forward and return traffic traversing different stateful devices\n- ECMP load balancing sending flows through different firewall instances\n- HA failover changing active firewall without state sync\n- PBR applied only one direction\n- Multi-homed host with different source IPs per interface\n- Route change causing return path to bypass firewall state table\n\n### Observability Signals\n- Established TCP sessions dropping mid-flow\n- Firewall showing half-open or asymmetric flow logs\n- Traceroute from source and destination showing different paths\n- Session table showing one-sided entries (SYN but no SYN-ACK)\n- Drops specifically on return traffic (outbound fine, inbound dropped)\n\n### Recommended CLI Commands\ntraceroute <dst> source <src>\ntraceroute <src> source <dst> (reverse path)\nshow conn detail (ASA/FTD)\nshow ip cef <prefix> detail (ECMP paths)\nshow ip route <src-prefix> (from fw perspective)\nshow failover (HA state sync check)\n\n### Step-by-Step RCA\n1) Traceroute both directions: do paths differ?\n2) Do both forward and return pass same firewall? Check ECMP hashing\n3) If ECMP: disable and force single path as test\n4) Check HA state sync: is state table synchronized between active/standby?\n5) Review PBR: is it applied on both inbound and return interfaces?\n6) Enable 'ip nat outside' / asymmetric routing compensation if supported\n\n### Resolution\nForce symmetric routing via static routes or PBR; enable firewall state sync; use active/standby HA; tune ECMP per-flow hashing.\n\n### Preventive Actions\nAudit routing symmetry before deploying stateful devices; test HA failover with live sessions; review ECMP paths after routing changes.\n\n### Related Tools\nFirewall logs, Traceroute, NetFlow, ECMP analysis",
    "problem": "Forward and return traffic traversing different stateful devices",
    "area": "Performance",
    "remedyItems": [
      "Force symmetric routing via static routes or PBR",
      "enable firewall state sync",
      "use active/standby HA",
      "tune ECMP per-flow hashing.",
      "Audit routing symmetry before deploying stateful devices",
      "test HA failover with live sessions"
    ],
    "tags": [
      "asymmetric-routing",
      "stateful-firewall",
      "ecmp",
      "ha-failover",
      "session-drop",
      "pbr"
    ],
    "linkedIntents": [
      "performance.asymmetric_routing"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-wan-002",
    "title": "WAN circuit is completely down — how to isolate CPE fault vs carrier fault vs local loop?",
    "category": "Network",
    "subcategory": "WAN",
    "content": "### Overview\nWAN circuit is completely down — how to isolate CPE fault vs carrier fault vs local loop?\n\n### Likely Causes\n- CPE hardware failure (router interface, SFP, WAN card)\n- Local loop fault between CPE and carrier demarc (cable, ONT, DSLAM)\n- Carrier backbone or aggregation network failure\n- Scheduled maintenance not communicated\n- Physical damage to outside plant (fiber cut, cable theft)\n- AC power failure at carrier POP\n\n### Observability Signals\n- WAN interface oper_status == down\n- LOS/LOF alarms on WAN interface\n- No keepalives from CE router to PE\n- BGP/routing protocol down on WAN link\n- Carrier NMS showing circuit alarm\n\n### Recommended CLI Commands\nshow interface <wan-int>\nshow interface <wan-int> | inc alarm|LOS|LOF\nshow controllers serial <int> (T1/E1)\nping <carrier-pe-ip> (loopback test)\nshow logging | inc LINK|down\ncheck carrier status portal\n\n### Step-by-Step RCA\n1) Check physical layer alarms: LOS, LOF, AIS — confirms carrier-side issue\n2) Test CPE: swap cable from CPE to demarc; test with different CPE port\n3) Request loopback test from carrier at demarc — if loopback passes = local loop OK\n4) Check carrier NOC/portal for active incidents on circuit\n5) Check power at both ends: CPE and carrier POP\n6) Escalate to carrier with MTTR SLA enforcement\n\n### Resolution\nReplace CPE hardware if at fault; carrier dispatches tech for local loop repair; carrier restores backbone; activate backup circuit.\n\n### Preventive Actions\nDual-carrier or backup circuit (LTE/SD-WAN); monitor circuit LOS/LOF alarms; carrier SLA with 4-hour MTTR.\n\n### Related Tools\nSNMP, Syslog, carrier portal, loopback test",
    "problem": "CPE hardware failure (router interface, SFP, WAN card)",
    "area": "WAN",
    "remedyItems": [
      "Replace CPE hardware if at fault",
      "carrier dispatches tech for local loop repair",
      "carrier restores backbone",
      "activate backup circuit.",
      "Dual-carrier or backup circuit (LTE/SD-WAN)",
      "monitor circuit LOS/LOF alarms"
    ],
    "tags": [
      "wan-circuit-down",
      "los",
      "carrier-fault",
      "local-loop",
      "cpe-failure",
      "fiber-cut"
    ],
    "linkedIntents": [
      "wan.circuit_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-wan-003",
    "title": "Primary WAN failed but backup did not take over — WAN failover is stuck. What to check?",
    "category": "Network",
    "subcategory": "WAN",
    "content": "### Overview\nPrimary WAN failed but backup did not take over — WAN failover is stuck. What to check?\n\n### Likely Causes\n- IP SLA probe target unreachable even on backup path (probe testing wrong target)\n- Track object not linked to static route or routing process\n- Backup interface (LTE/DSL) not dialing up or authenticating\n- Floating static route AD not higher than primary dynamic route\n- Both primary and backup circuits failed simultaneously\n- IP SLA probe itself failing due to firewall blocking probe packets\n\n### Observability Signals\n- Primary WAN down; backup WAN interface not active\n- IP SLA probe state showing down on both paths\n- Track object state not changing despite primary failure\n- Routing table still showing primary route (backup not installed)\n- Backup interface (dialer/cellular) in down/idle state\n\n### Recommended CLI Commands\nshow ip sla statistics\nshow track\nshow ip route\nshow interface dialer <n>\nshow interface cellular <n>\nshow logging | inc TRACK|IPSLA|route\n\n### Step-by-Step RCA\n1) 'show track' — is track object detecting primary failure?\n2) 'show ip sla statistics' — is probe succeeding or failing?\n3) Test probe target: can you reach the probe target from backup path?\n4) Check routing table: is floating static installed?\n5) Check backup interface: 'show interface cellular/dialer' — is it negotiating?\n6) Check cellular signal strength / DSL sync for backup circuit health\n\n### Resolution\nFix IP SLA probe target; link track object to route; fix backup interface auth/PPP; correct floating static AD; restore backup circuit.\n\n### Preventive Actions\nTest failover quarterly with controlled primary outage; monitor backup circuit health proactively; use dual probe targets.\n\n### Related Tools\nIPSLA, Syslog, SNMP, carrier portal",
    "problem": "IP SLA probe target unreachable even on backup path (probe testing wrong target)",
    "area": "WAN",
    "remedyItems": [
      "Fix IP SLA probe target",
      "link track object to route",
      "fix backup interface auth/PPP",
      "correct floating static AD",
      "restore backup circuit.",
      "Test failover quarterly with controlled primary outage"
    ],
    "tags": [
      "wan-failover",
      "ipsla",
      "track-object",
      "floating-static",
      "lte-backup",
      "dialer",
      "failover-stuck"
    ],
    "linkedIntents": [
      "wan.failover_stuck"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-001",
    "title": "IPsec tunnel is completely down — IKE/ISAKMP negotiation failing. How to diagnose?",
    "category": "Network",
    "subcategory": "VPN",
    "content": "### Overview\nIPsec tunnel is completely down — IKE/ISAKMP negotiation failing. How to diagnose?\n\n### Likely Causes\n- IKE Phase 1 policy mismatch (encryption, hash, DH group, lifetime)\n- Pre-shared key mismatch\n- NAT-T not enabled when peers are behind NAT\n- Dead Peer Detection (DPD) timeout causing tunnel teardown\n- Certificate authentication failure (cert expired or CA not trusted)\n- Access control blocking IKE UDP 500/4500\n- Peer IP address changed (dynamic IP site)\n\n### Observability Signals\n- ipsec_tunnel_state == down\n- IKE SA not established (show crypto isakmp sa = blank)\n- Syslog: 'ISAKMP: no proposal chosen', 'MM_NO_STATE'\n- UDP 500/4500 not reaching peer\n- DPD R-U-THERE timeouts in log\n\n### Recommended CLI Commands\nshow crypto isakmp sa\nshow crypto ipsec sa\nshow logging | inc ISAKMP|IKE|IPsec\ndebug crypto isakmp (brief window)\nping <peer-ip> (underlay reachability)\ntelnet <peer-ip> 500 (UDP 500 reachability test — won't connect but tests ACL)\n\n### Step-by-Step RCA\n1) Check IKE SA: 'show crypto isakmp sa' — any SA in MM_NO_STATE or AM_ACTIVE?\n2) Check ISAKMP policy: match encryption, hash, DH group, auth method, lifetime on both peers\n3) Verify PSK matches exactly (case-sensitive)\n4) Check NAT-T: if behind NAT, ensure NAT-T enabled and UDP 4500 permitted\n5) Check ACL: UDP 500 and 4500 (NAT-T) must reach peer\n6) For cert auth: check cert expiry and CA chain on both peers\n\n### Resolution\nAlign IKE policy; fix PSK; enable NAT-T; open UDP 500/4500; renew certificate; update peer IP for dynamic sites.\n\n### Preventive Actions\nDocument IKE policy on both peers; test tunnel with 'clear crypto sa' after changes; monitor tunnel uptime.\n\n### Related Tools\nVPN logs, Packet capture, Syslog, certificate monitoring",
    "problem": "IKE Phase 1 policy mismatch (encryption, hash, DH group, lifetime)",
    "area": "VPN",
    "remedyItems": [
      "Align IKE policy",
      "fix PSK",
      "enable NAT-T",
      "open UDP 500/4500",
      "renew certificate",
      "update peer IP for dynamic sites."
    ],
    "tags": [
      "ipsec-down",
      "ike-phase1",
      "isakmp",
      "psk",
      "nat-t",
      "dpd",
      "certificate",
      "udp-500"
    ],
    "linkedIntents": [
      "vpn.ipsec_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-002",
    "title": "Remote users cannot connect to SSL VPN gateway — how to diagnose?",
    "category": "Network",
    "subcategory": "VPN",
    "content": "### Overview\nRemote users cannot connect to SSL VPN gateway — how to diagnose?\n\n### Likely Causes\n- SSL VPN gateway process crashed or not listening on HTTPS\n- Certificate on VPN gateway expired — clients rejecting TLS\n- VPN gateway IP/FQDN unreachable (firewall, routing)\n- IP address pool exhausted — no addresses to assign\n- MFA/RADIUS backend unreachable causing auth failure\n- Split-tunnel routing not configured — DNS not resolving after connect\n\n### Observability Signals\n- ssl_vpn_gateway_reachable == 0\n- TLS connection to gateway port 443/10443 refused or timing out\n- Certificate error in client browser/VPN client\n- Session table showing zero active SSL VPN sessions\n- RADIUS auth timeout events in VPN gateway logs\n\n### Recommended CLI Commands\ncurl -vI https://<vpn-gateway>:443\nopenssl s_client -connect <vpn-gateway>:443\nshow vpn-sessiondb summary\nshow ip local pool\nshow aaa servers\nping <vpn-gateway> from external host\n\n### Step-by-Step RCA\n1) Test gateway reachability: curl HTTPS, check TLS cert\n2) Check VPN service process on gateway: is it running?\n3) Check certificate expiry: 'openssl s_client' shows cert details\n4) Check IP pool: 'show ip local pool' — any addresses remaining?\n5) Test RADIUS: 'test aaa group radius' from gateway\n6) Check firewall: is inbound HTTPS to VPN gateway permitted?\n\n### Resolution\nRestart VPN service; renew certificate; expand IP pool; restore RADIUS connectivity; fix firewall rule; update DNS for gateway FQDN.\n\n### Preventive Actions\nMonitor gateway availability via synthetic HTTPS probe; cert expiry alert 30 days; pool utilization alert at 80%.\n\n### Related Tools\nopenssl, curl, VPN logs, RADIUS logs, SNMP",
    "problem": "SSL VPN gateway process crashed or not listening on HTTPS",
    "area": "VPN",
    "remedyItems": [
      "Restart VPN service",
      "renew certificate",
      "expand IP pool",
      "restore RADIUS connectivity",
      "fix firewall rule",
      "update DNS for gateway FQDN."
    ],
    "tags": [
      "ssl-vpn",
      "remote-access",
      "certificate",
      "ip-pool",
      "radius",
      "anyconnect",
      "gateway-down"
    ],
    "linkedIntents": [
      "vpn.ssl_vpn_unreachable"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-003",
    "title": "DMVPN spoke cannot register with hub — how to troubleshoot NHRP and IKE for DMVPN?",
    "category": "Network",
    "subcategory": "VPN",
    "content": "### Overview\nDMVPN spoke cannot register with hub — how to troubleshoot NHRP and IKE for DMVPN?\n\n### Likely Causes\n- NHRP network ID mismatch between hub and spoke\n- IKE policy mismatch preventing spoke-hub tunnel establishment\n- NHS (hub) IP address unreachable from spoke underlay\n- CGNAT or carrier-side NAT changing spoke source IP\n- mGRE tunnel interface misconfiguration (wrong tunnel source)\n- NHRP authentication mismatch\n\n### Observability Signals\n- DMVPN spoke state: NHRP registration not in hub cache\n- IKE SA not established from spoke to hub\n- mGRE tunnel interface down on spoke\n- 'show dmvpn' showing spoke as DOWN at hub\n- Spoke cannot ping hub tunnel IP\n\n### Recommended CLI Commands\nshow dmvpn\nshow ip nhrp\nshow crypto isakmp sa\nshow interface tunnel <n>\nshow ip nhrp nhs\ndebug nhrp registration (brief window)\nping <hub-tunnel-ip> source tunnel <n>\n\n### Step-by-Step RCA\n1) Check hub NHRP cache: 'show ip nhrp' — is spoke registered?\n2) Check spoke tunnel interface: up/up? Tunnel source/destination correct?\n3) Test underlay: can spoke reach hub NBMA IP?\n4) Check IKE: is Phase 1 SA established spoke to hub?\n5) Verify NHRP network ID matches hub config\n6) Check if CGNAT is changing spoke source IP (NHRP maps wrong IP)\n\n### Resolution\nFix NHRP network ID; align IKE policy; restore underlay reachability; configure NAT-T for CGNAT; correct tunnel source.\n\n### Preventive Actions\nMonitor DMVPN spoke count at hub; alert on registration drops; test spoke failover on WAN redundancy.\n\n### Related Tools\nNHRP logs, IKE logs, DMVPN controller logs, Syslog",
    "problem": "NHRP network ID mismatch between hub and spoke",
    "area": "VPN",
    "remedyItems": [
      "Fix NHRP network ID",
      "align IKE policy",
      "restore underlay reachability",
      "configure NAT-T for CGNAT",
      "correct tunnel source.",
      "Monitor DMVPN spoke count at hub"
    ],
    "tags": [
      "dmvpn",
      "nhrp",
      "spoke-down",
      "mGRE",
      "nhs",
      "cgnat",
      "ike"
    ],
    "linkedIntents": [
      "vpn.dmvpn_spoke_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-vpn-004",
    "title": "GRE tunnel interface is down or traffic is not forwarding — what are the root causes?",
    "category": "Network",
    "subcategory": "VPN",
    "content": "### Overview\nGRE tunnel interface is down or traffic is not forwarding — what are the root causes?\n\n### Likely Causes\n- Recursive routing: tunnel destination routed via tunnel itself\n- IP Protocol 47 (GRE) blocked by ACL or firewall\n- GRE keepalives failing (if configured) causing tunnel down\n- Tunnel source or destination IP unreachable\n- MTU mismatch causing large packets to be dropped inside GRE\n- IP address not configured on tunnel interface\n\n### Observability Signals\n- tunnel_oper_status == down\n- Recursive routing error in syslog\n- GRE traffic not seen at far end (capture shows GRE packets dropped)\n- Tunnel down with 'no keepalive responses' reason\n- Large pings fail through tunnel; small pings succeed\n\n### Recommended CLI Commands\nshow interface tunnel <n>\nshow ip route <tunnel-destination>\nping <far-end-tunnel-ip> source tunnel <n>\nping <far-end-tunnel-ip> df-bit size 1400\nshow ip traffic | inc GRE\ntraceroute <dst> source tunnel <n>\n\n### Step-by-Step RCA\n1) Check tunnel interface: 'show interface tunnel' — line protocol down or up?\n2) For recursive routing: 'show ip route <tunnel-dest>' — is it via the tunnel itself?\n3) If recursive: add static route for tunnel destination via physical interface\n4) Test proto 47: packet capture on underlay — are GRE packets visible?\n5) Check MTU: 'ping df-bit size 1452' — does it pass through tunnel?\n6) Verify keepalive configuration if used — disable and test\n\n### Resolution\nFix recursive routing with static route; permit proto 47 in ACL; set tunnel MTU minus 24 bytes; disable or fix keepalives.\n\n### Preventive Actions\nAlways use static route for tunnel destination to prevent recursive routing; document GRE MTU requirements.\n\n### Related Tools\nPacket capture, Syslog, SNMP, Ping/traceroute",
    "problem": "Recursive routing: tunnel destination routed via tunnel itself",
    "area": "VPN",
    "remedyItems": [
      "Fix recursive routing with static route",
      "permit proto 47 in ACL",
      "set tunnel MTU minus 24 bytes",
      "disable or fix keepalives.",
      "Always use static route for tunnel destination to prevent recursive routing",
      "document GRE MTU requirements."
    ],
    "tags": [
      "gre",
      "tunnel-down",
      "recursive-routing",
      "proto-47",
      "keepalive",
      "mtu",
      "blackhole"
    ],
    "linkedIntents": [
      "vpn.gre_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-services-001",
    "title": "NXDOMAIN response rate spiked — clients getting 'name not found' errors. What is causing this?",
    "category": "Network",
    "subcategory": "Services",
    "content": "### Overview\nNXDOMAIN response rate spiked — clients getting 'name not found' errors. What is causing this?\n\n### Likely Causes\n- DNS zone data missing or zone transfer failure\n- DNS delegation broken — parent zone not pointing to authoritative server\n- Wrong search domain suffix causing FQDN resolution failure\n- DNS server cache poisoned with invalid NXDOMAIN responses\n- Recent DNS record deletion or TTL expiry\n- Split-horizon DNS serving wrong zone to clients\n\n### Observability Signals\n- nxdomain_rate > baseline by > 3x\n- Specific domain or subdomain generating NXDOMAIN\n- DNS zone transfer failures in authoritative server logs\n- Clients reporting specific application FQDNs not resolving\n- Recent DNS record changes correlating with spike\n\n### Recommended CLI Commands\ndig <failing-fqdn> +trace\nnslookup <fqdn> <dns-server>\ndig @<auth-server> <zone> AXFR (zone transfer test)\ndig <fqdn> SOA (check zone authority)\ncheck DNS server logs for NXDOMAIN volume\ntail -f /var/log/named/default (BIND)\n\n### Step-by-Step RCA\n1) Identify which FQDN(s) generating NXDOMAIN\n2) 'dig +trace' to follow delegation from root\n3) Is authoritative server responding? Is zone loaded?\n4) Check zone transfer: is secondary in sync with primary?\n5) Check for recent record deletions in DNS change log\n6) For split-horizon: is the correct view serving the client network?\n\n### Resolution\nRestore deleted record; fix zone transfer; correct delegation; fix search domain; flush poisoned cache; correct split-horizon view.\n\n### Preventive Actions\nMonitor zone transfer success rate; DNSSEC for cache poisoning protection; change control for DNS record deletions.\n\n### Related Tools\ndig, nslookup, DNS logs, DNSSEC validator",
    "problem": "DNS zone data missing or zone transfer failure",
    "area": "Services",
    "remedyItems": [
      "Restore deleted record",
      "fix zone transfer",
      "correct delegation",
      "fix search domain",
      "flush poisoned cache",
      "correct split-horizon view."
    ],
    "tags": [
      "dns-nxdomain",
      "zone-transfer",
      "delegation",
      "search-domain",
      "split-horizon",
      "cache-poisoning"
    ],
    "linkedIntents": [
      "services.dns_nxdomain_spike"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-services-002",
    "title": "DHCP pool is exhausted — clients not getting IP addresses. How to recover and prevent recurrence?",
    "category": "Network",
    "subcategory": "Services",
    "content": "### Overview\nDHCP pool is exhausted — clients not getting IP addresses. How to recover and prevent recurrence?\n\n### Likely Causes\n- DHCP starvation attack: attacker flooding DISCOVER with random MACs\n- Lease time too long — stale leases from departed devices\n- Scope undersized for current device count\n- Rogue DHCP server consuming part of pool\n- Ghost leases from improperly decommissioned devices\n- Rapid device turnover (hot-desking, guest access) exhausting leases\n\n### Observability Signals\n- dhcp_pool_utilization_percent == 100\n- DHCP DISCOVER with no OFFER in capture\n- New devices getting APIPA (169.254.x.x) addresses\n- DHCP server log: 'no free leases'\n- Unusually high number of active leases vs connected devices\n\n### Recommended CLI Commands\nshow ip dhcp binding | count\nshow ip dhcp pool\nshow ip dhcp conflict\nshow ip dhcp statistics\ntcpdump -i <int> port 67 or port 68\nclear ip dhcp binding * (emergency — use with caution)\n\n### Step-by-Step RCA\n1) Check utilization: 'show ip dhcp pool' — leased vs total\n2) Compare lease count vs known-connected device count (via ARP/MAC table)\n3) Look for starvation: many leases to sequential/random MACs from same port?\n4) Check lease time: if 8 days, old leases from gone devices still held\n5) For starvation attack: identify source port, enable DHCP snooping\n6) Emergency recovery: reduce lease time to reclaim expired leases faster\n\n### Resolution\nReduce lease time; clear stale bindings; expand pool; enable DHCP snooping; block starvation source; add exclusion ranges.\n\n### Preventive Actions\nAlert at 80% pool utilization; enable DHCP snooping; IPAM for pool capacity planning; use short lease times for guest/WiFi.\n\n### Related Tools\nDHCP logs, SNMP, IPAM, DHCP snooping",
    "problem": "DHCP starvation attack: attacker flooding DISCOVER with random MACs",
    "area": "Services",
    "remedyItems": [
      "Reduce lease time",
      "clear stale bindings",
      "expand pool",
      "enable DHCP snooping",
      "block starvation source",
      "add exclusion ranges."
    ],
    "tags": [
      "dhcp-exhausted",
      "pool-full",
      "stale-leases",
      "dhcp-starvation",
      "snooping",
      "lease-time"
    ],
    "linkedIntents": [
      "services.dhcp_exhausted"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-services-003",
    "title": "Device showing high NTP stratum (16 = unsynchronized) — how to restore time sync?",
    "category": "Network",
    "subcategory": "Services",
    "content": "### Overview\nDevice showing high NTP stratum (16 = unsynchronized) — how to restore time sync?\n\n### Likely Causes\n- Upstream NTP server unreachable (ACL, routing, NTP server down)\n- NTP authentication key mismatch\n- All configured NTP peers stratum 16 (upstream hierarchy broken)\n- Clock drift too large for NTP to step-correct (requires ntpdate force)\n- VRF not specified for NTP source interface\n- Firewall blocking UDP 123 between device and NTP server\n\n### Observability Signals\n- ntp_stratum == 16 (unsynchronized)\n- 'show ntp associations' showing no synced peer (*)\n- Time offset between device and NTP server > 1000ms\n- Syslog timestamps misaligned with actual events\n- Multiple correlation/forensic issues due to clock skew\n\n### Recommended CLI Commands\nshow ntp associations detail\nshow ntp status\nshow clock detail\nntpdate -q <ntp-server> (test sync)\ntelnet <ntp-server> (ACL test — NTP is UDP so use ping)\nping <ntp-server> vrf <mgmt>\n\n### Step-by-Step RCA\n1) 'show ntp associations' — is any server in synced state (*)?\n2) Test NTP server reachability from correct VRF: 'ping <ntp-ip> vrf mgmt'\n3) Check NTP auth: key configured on both device and server?\n4) Check offset: if > 128ms, ntp may need manual step-sync\n5) Trace NTP hierarchy upward — is upstream NTP server itself synchronized?\n6) Force sync: 'ntp update-calendar' or 'clock set' then 'ntp sync'\n\n### Resolution\nFix routing/ACL to NTP server; correct auth key; force time step if offset > 128ms; fix upstream NTP hierarchy; specify VRF.\n\n### Preventive Actions\nConfigure 3+ NTP sources; monitor stratum and offset continuously; alert on offset > 100ms; use internal NTP hierarchy.\n\n### Related Tools\nNTP logs, Syslog, SNMP, ntpdate",
    "problem": "Upstream NTP server unreachable (ACL, routing, NTP server down)",
    "area": "Services",
    "remedyItems": [
      "Fix routing/ACL to NTP server",
      "correct auth key",
      "force time step if offset > 128ms",
      "fix upstream NTP hierarchy",
      "specify VRF.",
      "Configure 3+ NTP sources"
    ],
    "tags": [
      "ntp",
      "stratum-16",
      "time-sync",
      "clock-drift",
      "udp-123",
      "vrf",
      "ntp-auth"
    ],
    "linkedIntents": [
      "services.ntp_stratum_high"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-001",
    "title": "Kubernetes node is in NotReady state — pods being evicted or not scheduled. How to diagnose?",
    "category": "Compute",
    "subcategory": "Node Health",
    "content": "### Overview\nKubernetes node is in NotReady state — pods being evicted or not scheduled. How to diagnose?\n\n### Likely Causes\n- kubelet process crashed or OOM killed\n- Disk pressure: node disk full (/var/lib/docker or /var/lib/kubelet)\n- Memory pressure: node memory exhausted causing kubelet issues\n- CNI plugin failure (Calico, Flannel, Cilium) preventing pod networking\n- API server unreachable — kubelet cannot report status\n- containerd/docker daemon crashed\n- Clock skew causing TLS certificate validation failure\n\n### Observability Signals\n- node_ready_status == False\n- node_conditions showing DiskPressure, MemoryPressure, PIDPressure\n- Pods in Terminating or Evicted state on node\n- kubelet logs showing errors\n- API server showing node as not reporting\n\n### Recommended CLI Commands\nkubectl get nodes -o wide\nkubectl describe node <node>\nkubectl get events --field-selector involvedObject.name=<node>\nssh <node> systemctl status kubelet\nssh <node> journalctl -u kubelet -n 100\nssh <node> df -h\nssh <node> free -m\n\n### Step-by-Step RCA\n1) 'kubectl describe node <node>' — check conditions: DiskPressure, MemoryPressure\n2) SSH to node: is kubelet running? 'systemctl status kubelet'\n3) Check kubelet logs: 'journalctl -u kubelet -n 200'\n4) Check disk: 'df -h /var/lib/kubelet' and '/var/lib/containerd'\n5) Check memory: is kubelet OOM killed? 'dmesg | grep OOM'\n6) Check CNI: are pod network interfaces being created?\n\n### Resolution\nRestart kubelet; free disk space; increase node resources; reinstall CNI; fix API server reachability; sync clock.\n\n### Preventive Actions\nSet eviction thresholds before NotReady; monitor node conditions via Prometheus; set disk alert at 80% for kubelet paths.\n\n### Related Tools\nkubectl, Prometheus node-exporter, journalctl, k8s events",
    "problem": "kubelet process crashed or OOM killed",
    "area": "Node Health",
    "remedyItems": [
      "Restart kubelet",
      "free disk space",
      "increase node resources",
      "reinstall CNI",
      "fix API server reachability",
      "sync clock."
    ],
    "tags": [
      "k8s",
      "node-not-ready",
      "kubelet",
      "disk-pressure",
      "memory-pressure",
      "cni",
      "eviction"
    ],
    "linkedIntents": [
      "k8s.node_not_ready"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-002",
    "title": "Kubernetes pod is stuck in Pending state — it is not being scheduled. What are the causes?",
    "category": "Compute",
    "subcategory": "Pod Scheduling",
    "content": "### Overview\nKubernetes pod is stuck in Pending state — it is not being scheduled. What are the causes?\n\n### Likely Causes\n- Insufficient CPU or memory resources across all nodes\n- Node selector or affinity rules with no matching node\n- Node taint with no matching toleration in pod spec\n- PVC not bound — pod waiting for persistent volume\n- Image pull failure (ImagePullBackOff before Pending)\n- Resource quota exceeded in namespace\n- Pod disruption budget preventing scheduling\n\n### Observability Signals\n- pod_status == Pending for > 5 minutes\n- kubectl events showing 'Insufficient cpu/memory'\n- 'FailedScheduling' event with specific reason\n- No nodes match node selector or affinity\n- PVC in Pending state (no available PV)\n\n### Recommended CLI Commands\nkubectl describe pod <pod> -n <ns>\nkubectl get events -n <ns> | grep FailedScheduling\nkubectl describe nodes | grep -A 5 'Allocated resources'\nkubectl get pvc -n <ns>\nkubectl get resourcequota -n <ns>\nkubectl get nodes -o json | jq '.items[].spec.taints'\n\n### Step-by-Step RCA\n1) 'kubectl describe pod' — check Events section at bottom for scheduling reason\n2) 'Insufficient cpu/memory': check node capacity vs requested resources\n3) 'No nodes match selector': check nodeSelector/affinity vs node labels\n4) 'Taints': add toleration or remove taint from target node\n5) PVC Pending: check StorageClass and available PVs\n6) Quota: 'kubectl describe resourcequota' — which resource is over limit?\n\n### Resolution\nAdd nodes or reduce resource requests; fix node labels/affinity; add toleration; bind PV; increase quota; adjust pod disruption budget.\n\n### Preventive Actions\nCapacity planning for resource requests; limit ranges to prevent over-requesting; monitor scheduling failure events.\n\n### Related Tools\nkubectl, Prometheus, k8s events, vertical pod autoscaler",
    "problem": "Insufficient CPU or memory resources across all nodes",
    "area": "Pod Scheduling",
    "remedyItems": [
      "Add nodes or reduce resource requests",
      "fix node labels/affinity",
      "add toleration",
      "bind PV",
      "increase quota",
      "adjust pod disruption budget."
    ],
    "tags": [
      "k8s",
      "pod-pending",
      "scheduling",
      "resources",
      "affinity",
      "taint",
      "pvc",
      "quota"
    ],
    "linkedIntents": [
      "k8s.pod_pending"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-003",
    "title": "PersistentVolumeClaim is stuck in Pending state — pods cannot start. How to resolve?",
    "category": "Compute",
    "subcategory": "Storage",
    "content": "### Overview\nPersistentVolumeClaim is stuck in Pending state — pods cannot start. How to resolve?\n\n### Likely Causes\n- No PersistentVolume matches the PVC request (size, access mode, StorageClass)\n- StorageClass dynamic provisioner (CSI driver) not running\n- Storage backend quota exhausted\n- Availability zone mismatch between PVC topology and available nodes\n- PVC requesting access mode not supported by StorageClass (ReadWriteMany on block storage)\n- Binding mode 'WaitForFirstConsumer' — PVC waits for pod to schedule first\n\n### Observability Signals\n- pvc_status == Pending\n- Events: 'no persistent volumes available' or 'storageclass not found'\n- CSI provisioner pod in CrashLoopBackOff or not running\n- Storage quota exceeded event\n- PV available but wrong StorageClass or access mode\n\n### Recommended CLI Commands\nkubectl describe pvc <pvc-name> -n <ns>\nkubectl get pv (check available PVs)\nkubectl get storageclass\nkubectl get pods -n kube-system | grep csi\nkubectl describe storageclass <class>\nkubectl get events -n <ns> | grep ProvisioningFailed\n\n### Step-by-Step RCA\n1) 'kubectl describe pvc' — Events show exact failure reason\n2) Check StorageClass: does it exist and is provisioner running?\n3) CSI driver: is provisioner pod healthy in kube-system?\n4) Check existing PVs: any available matching size and access mode?\n5) For WaitForFirstConsumer: PVC binds when pod is scheduled — is pod pending too?\n6) Check storage backend: quota, connectivity, CSI driver logs\n\n### Resolution\nCreate matching PV manually; restart CSI provisioner; expand storage backend quota; change StorageClass; fix zone topology.\n\n### Preventive Actions\nMonitor CSI provisioner health; set storage quota alerts; test dynamic provisioning in staging; document StorageClass capabilities.\n\n### Related Tools\nkubectl, CSI driver logs, Prometheus, storage backend console",
    "problem": "No PersistentVolume matches the PVC request (size, access mode, StorageClass)",
    "area": "Storage",
    "remedyItems": [
      "Create matching PV manually",
      "restart CSI provisioner",
      "expand storage backend quota",
      "change StorageClass",
      "fix zone topology.",
      "Monitor CSI provisioner health"
    ],
    "tags": [
      "k8s",
      "pvc-pending",
      "storageclass",
      "csi",
      "persistent-volume",
      "provisioner",
      "quota"
    ],
    "linkedIntents": [
      "k8s.pvc_unbound"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-004",
    "title": "Kubernetes Ingress is not routing traffic — HTTP 502/503 or connection refused. How to debug?",
    "category": "Compute",
    "subcategory": "Ingress",
    "content": "### Overview\nKubernetes Ingress is not routing traffic — HTTP 502/503 or connection refused. How to debug?\n\n### Likely Causes\n- Ingress controller pod not running (nginx, traefik, etc.)\n- Backend service not found or endpoint not ready\n- TLS secret missing or certificate expired\n- Incorrect Ingress annotation causing misrouting\n- Service selector not matching pod labels\n- IngressClass not matching controller\n- Upstream pod not passing readiness probe\n\n### Observability Signals\n- HTTP 502 (bad gateway) or 503 (service unavailable) from ingress\n- Ingress controller pod in CrashLoopBackOff\n- 'No endpoints available' in ingress controller logs\n- TLS secret not found event\n- Service endpoints count == 0\n\n### Recommended CLI Commands\nkubectl get ingress -n <ns>\nkubectl describe ingress <name> -n <ns>\nkubectl get pods -n ingress-nginx (or traefik ns)\nkubectl get endpoints <service> -n <ns>\nkubectl get secret <tls-secret> -n <ns>\nkubectl logs -n ingress-nginx <controller-pod> | grep error\n\n### Step-by-Step RCA\n1) Check ingress controller pod: running and healthy?\n2) 'kubectl describe ingress' — any warning events?\n3) Check backend service: 'kubectl get endpoints <svc>' — any IPs listed?\n4) If endpoints empty: check service selector vs pod labels\n5) Check TLS secret: present in correct namespace? Cert valid?\n6) Review ingress annotations — any typo or incorrect value?\n\n### Resolution\nRestart ingress controller; fix service selector; create TLS secret; correct annotations; fix readiness probe on upstream pods.\n\n### Preventive Actions\nMonitor ingress controller health; synthetic HTTP probe per ingress; cert expiry monitoring for TLS secrets.\n\n### Related Tools\nkubectl, ingress controller logs, Prometheus, cert-manager",
    "problem": "Ingress controller pod not running (nginx, traefik, etc.)",
    "area": "Ingress",
    "remedyItems": [
      "Restart ingress controller",
      "fix service selector",
      "create TLS secret",
      "correct annotations",
      "fix readiness probe on upstream pods.",
      "Monitor ingress controller health"
    ],
    "tags": [
      "k8s",
      "ingress",
      "nginx",
      "traefik",
      "tls-secret",
      "endpoints",
      "502",
      "503"
    ],
    "linkedIntents": [
      "k8s.ingress_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-005",
    "title": "etcd cluster is unhealthy — Kubernetes control plane is degraded. What to check?",
    "category": "Compute",
    "subcategory": "Control Plane",
    "content": "### Overview\netcd cluster is unhealthy — Kubernetes control plane is degraded. What to check?\n\n### Likely Causes\n- etcd disk I/O too slow causing raft election timeouts\n- etcd quorum lost (majority of members down)\n- etcd database too large — compaction and defragmentation needed\n- etcd peer certificates expired\n- Network partition between etcd members\n- Memory pressure causing etcd OOM\n\n### Observability Signals\n- etcd_server_health_failures > 0\n- etcd request latency > 100ms (p99)\n- etcd quorum alerts\n- kubectl commands timing out or failing\n- etcd database size growing without compaction\n\n### Recommended CLI Commands\netcdctl endpoint health --cluster\netcdctl endpoint status --cluster --write-out=table\netcdctl alarm list\netcdctl defrag --cluster\niostat -x 1 (on etcd nodes)\netcdctl snapshot status <snapshot>\n\n### Step-by-Step RCA\n1) Check cluster health: 'etcdctl endpoint health --cluster'\n2) Check member list: quorum requires majority (3-node = 2 needed)\n3) Check disk I/O latency on etcd nodes — etcd needs < 10ms latency\n4) Check DB size: if > 6GB, compact and defrag needed\n5) Check certificate expiry: 'etcdctl endpoint status'\n6) Review etcd logs for leader election churn or network partition\n\n### Resolution\nRestore failed etcd member; compact/defrag database; move etcd to faster disk (NVMe); renew certificates; fix network partition.\n\n### Preventive Actions\nDedicated fast SSD for etcd; monitor etcd latency and DB size; automated compaction; certificate rotation automation.\n\n### Related Tools\netcdctl, Prometheus etcd metrics, iostat, journalctl",
    "problem": "etcd disk I/O too slow causing raft election timeouts",
    "area": "Control Plane",
    "remedyItems": [
      "Restore failed etcd member",
      "compact/defrag database",
      "move etcd to faster disk (NVMe)",
      "renew certificates",
      "fix network partition.",
      "Dedicated fast SSD for etcd"
    ],
    "tags": [
      "k8s",
      "etcd",
      "quorum",
      "disk-latency",
      "compaction",
      "certificate",
      "control-plane"
    ],
    "linkedIntents": [
      "k8s.etcd_unhealthy"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-k8s-006",
    "title": "Kubernetes API server is down or unreachable — all cluster operations failing. How to recover?",
    "category": "Compute",
    "subcategory": "Control Plane",
    "content": "### Overview\nKubernetes API server is down or unreachable — all cluster operations failing. How to recover?\n\n### Likely Causes\n- API server OOM killed (large cluster with many objects)\n- etcd unreachable from API server\n- API server TLS certificates expired\n- API server overwhelmed by too many requests (e.g., controller storm)\n- kube-apiserver pod evicted from master node\n- Node hosting API server has failed\n\n### Observability Signals\n- kubectl commands fail with 'connection refused' or timeout\n- kube-apiserver pod not running or CrashLoopBackOff\n- etcd showing high error rate\n- API server audit logs not updating\n- Control plane node CPU/memory critically high\n\n### Recommended CLI Commands\nkubectl cluster-info\ncrictl ps | grep apiserver (on control plane node)\nsystemctl status kube-apiserver (kubeadm)\njournalctl -u kube-apiserver -n 200\nkubectl get --raw /healthz (if partially reachable)\ncurl https://<apiserver>:6443/healthz (from within cluster)\n\n### Step-by-Step RCA\n1) Test API reachability: 'kubectl cluster-info' or 'curl https://<apiserver>:6443/healthz'\n2) SSH to control plane: is kube-apiserver container/process running?\n3) Check API server logs for crash reason\n4) Check certificate expiry: kubeadm certs check-expiration\n5) Check etcd health — API server cannot function without etcd\n6) Check control plane node resources: memory, disk\n\n### Resolution\nRestart kube-apiserver; renew certificates (kubeadm certs renew); restore etcd; free control plane node resources; scale control plane.\n\n### Preventive Actions\nHA control plane (3 masters); cert expiry monitoring; API server request rate limits; dedicated control plane nodes.\n\n### Related Tools\nkubectl, crictl, journalctl, kubeadm, Prometheus",
    "problem": "API server OOM killed (large cluster with many objects)",
    "area": "Control Plane",
    "remedyItems": [
      "Restart kube-apiserver",
      "renew certificates (kubeadm certs renew)",
      "restore etcd",
      "free control plane node resources",
      "scale control plane.",
      "HA control plane (3 masters)"
    ],
    "tags": [
      "k8s",
      "apiserver",
      "control-plane",
      "certificate-expired",
      "etcd",
      "oom",
      "kubeadm"
    ],
    "linkedIntents": [
      "k8s.apiserver_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-001",
    "title": "Cloud VM/instance is not reachable — how to diagnose connectivity in cloud environments?",
    "category": "Compute",
    "subcategory": "Compute",
    "content": "### Overview\nCloud VM/instance is not reachable — how to diagnose connectivity in cloud environments?\n\n### Likely Causes\n- Instance stopped or terminated (check state)\n- Security group blocking inbound traffic on required port\n- Route table missing route or incorrect default gateway\n- Instance status checks failing (hardware issue at cloud level)\n- SSH key pair mismatch — cannot authenticate\n- Public IP not associated or Elastic IP detached\n- VPC network ACL (stateless) blocking traffic\n\n### Observability Signals\n- instance_reachability_check == failed\n- EC2/GCE instance status check failed\n- Security group showing no inbound rule for management port\n- Route table missing 0.0.0.0/0 to Internet Gateway\n- Instance in stopped/terminated state\n\n### Recommended CLI Commands\naws ec2 describe-instances --instance-ids <id>\naws ec2 describe-instance-status --instance-ids <id>\naws ec2 describe-security-groups --group-ids <sg-id>\naws ec2 describe-route-tables\naws ec2 get-console-output --instance-id <id>\nVPC Flow Logs: filter for REJECT on instance ENI\n\n### Step-by-Step RCA\n1) Check instance state: running, stopped, or terminated?\n2) Check system/instance status checks in cloud console\n3) Check security group: inbound rules for SSH (22) / RDP (3389) from your IP?\n4) Check VPC routing: subnet route table has IGW or NAT route?\n5) Check VPC Network ACL: stateless, must have inbound AND outbound rules\n6) Use 'Get Console Output' for boot/crash logs without SSH\n\n### Resolution\nStart stopped instance; fix security group rule; add route to route table; associate Elastic IP; fix network ACL; restore from snapshot if status check fails.\n\n### Preventive Actions\nBaseline security group rules; monitor instance status checks; use AWS Systems Manager Session Manager for keyless access.\n\n### Related Tools\nAWS Console, AWS CLI, VPC Flow Logs, CloudWatch",
    "problem": "Instance stopped or terminated (check state)",
    "area": "Compute",
    "remedyItems": [
      "Start stopped instance",
      "fix security group rule",
      "add route to route table",
      "associate Elastic IP",
      "fix network ACL",
      "restore from snapshot if status check fails."
    ],
    "tags": [
      "cloud",
      "ec2",
      "instance-unreachable",
      "security-group",
      "route-table",
      "vpc",
      "status-check"
    ],
    "linkedIntents": [
      "cloud.instance_unreachable"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-002",
    "title": "Cloud security group is blocking application traffic — how to identify and fix the missing rule?",
    "category": "Compute",
    "subcategory": "Security",
    "content": "### Overview\nCloud security group is blocking application traffic — how to identify and fix the missing rule?\n\n### Likely Causes\n- Missing inbound rule for required port or protocol\n- Port range too narrow (e.g., 8080 specified but app uses 8081)\n- Source CIDR too restrictive (specific IP but client has different IP)\n- Protocol wrong (TCP specified but app uses UDP)\n- Security group applied to wrong resource (ENI, instance, or load balancer)\n- Stateless NACL overriding security group (NACL denying return traffic)\n\n### Observability Signals\n- VPC Flow Logs showing REJECT on destination port\n- Connection timeout from client to application\n- Application reachable from within VPC but not from specific source\n- AWS Security Hub showing overly restrictive group\n- Cloud-native firewall audit showing drop\n\n### Recommended CLI Commands\naws ec2 describe-security-groups --group-ids <sg-id>\nVPC Flow Logs: filter srcaddr, dstaddr, dstport, action=REJECT\naws ec2 describe-network-acls (check stateless NACLs)\naws ec2 describe-instances (check which SG is attached)\ntelnet <instance-ip> <port> (from source host)\ncurl -v http://<instance-ip>:<port>\n\n### Step-by-Step RCA\n1) Enable VPC Flow Logs and filter for REJECT on target ENI\n2) Identify rejected destination port and source IP\n3) Check security group: is there an inbound rule matching that port and source?\n4) Check if NACL is also involved — stateless, needs both inbound and outbound\n5) Verify security group is actually attached to the correct instance/ENI\n6) Add missing rule with least-privilege (specific port and source CIDR)\n\n### Resolution\nAdd precise inbound rule; fix port range; correct source CIDR; check NACL outbound rules; attach correct security group.\n\n### Preventive Actions\nUse Infrastructure-as-Code for security groups; enforce change approval; VPC Flow Logs always enabled; security group drift detection.\n\n### Related Tools\nVPC Flow Logs, AWS Config, AWS Security Hub, CloudTrail",
    "problem": "Missing inbound rule for required port or protocol",
    "area": "Security",
    "remedyItems": [
      "Add precise inbound rule",
      "fix port range",
      "correct source CIDR",
      "check NACL outbound rules",
      "attach correct security group.",
      "Use Infrastructure-as-Code for security groups"
    ],
    "tags": [
      "cloud",
      "security-group",
      "vpc-flow-logs",
      "nacl",
      "inbound-rule",
      "port-block",
      "aws"
    ],
    "linkedIntents": [
      "cloud.security_group_block"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-003",
    "title": "Private subnet instances cannot reach the internet — NAT gateway suspected. How to diagnose?",
    "category": "Compute",
    "subcategory": "Networking",
    "content": "### Overview\nPrivate subnet instances cannot reach the internet — NAT gateway suspected. How to diagnose?\n\n### Likely Causes\n- Route table in private subnet not pointing to NAT gateway\n- NAT gateway Elastic IP (EIP) not associated or detached\n- NAT gateway in wrong availability zone (instances in different AZ)\n- NAT gateway connections quota exhausted (55,000 simultaneous)\n- NAT gateway in failed state (cloud provider issue)\n- Outbound security group blocking egress traffic from instances\n\n### Observability Signals\n- private_subnet_outbound_reachability == 0\n- NAT gateway status != available in cloud console\n- CloudWatch: NAT gateway error count > 0\n- VPC Flow Logs showing traffic leaving instance but not returning\n- Route table for private subnet missing 0.0.0.0/0 Ã¢â€ â€™ NAT GW\n\n### Recommended CLI Commands\naws ec2 describe-nat-gateways\naws ec2 describe-route-tables --filters Name=association.subnet-id,Values=<private-subnet>\naws cloudwatch get-metric-data (NatGatewayErrorPortAllocation)\ncurl http://169.254.169.254 (instance metadata test)\ncurl https://checkip.amazonaws.com (outbound test from instance)\n\n### Step-by-Step RCA\n1) Check NAT GW state: 'aws ec2 describe-nat-gateways' — available or failed?\n2) Check route table: private subnet Ã¢â€ â€™ 0.0.0.0/0 Ã¢â€ â€™ NAT GW ID correct?\n3) Check NAT GW in correct AZ (each AZ should have own NAT GW for HA)\n4) Check CloudWatch: ErrorPortAllocation = connections quota hit?\n5) Test from instance: 'curl https://checkip.amazonaws.com'\n6) Check security group on instance: outbound rule to 0.0.0.0/0 exists?\n\n### Resolution\nFix route table; create NAT GW per AZ for HA; increase connection reuse to reduce port exhaustion; fix EIP association.\n\n### Preventive Actions\nNAT GW per AZ; monitor ErrorPortAllocation CloudWatch metric; alert on NAT GW state change; IaC for route table management.\n\n### Related Tools\nAWS Console, AWS CLI, VPC Flow Logs, CloudWatch",
    "problem": "Route table in private subnet not pointing to NAT gateway",
    "area": "Networking",
    "remedyItems": [
      "Fix route table",
      "create NAT GW per AZ for HA",
      "increase connection reuse to reduce port exhaustion",
      "fix EIP association.",
      "NAT GW per AZ",
      "monitor ErrorPortAllocation CloudWatch metric"
    ],
    "tags": [
      "cloud",
      "nat-gateway",
      "private-subnet",
      "route-table",
      "eip",
      "az-failure",
      "aws"
    ],
    "linkedIntents": [
      "cloud.nat_gateway_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-004",
    "title": "Cloud ELB/ALB showing all targets as unhealthy — traffic not being forwarded. What to investigate?",
    "category": "Compute",
    "subcategory": "Load Balancer",
    "content": "### Overview\nCloud ELB/ALB showing all targets as unhealthy — traffic not being forwarded. What to investigate?\n\n### Likely Causes\n- Health check port or path configured incorrectly\n- Security group blocking health check traffic from LB to targets\n- Target group instances have wrong port open\n- Application returning non-200 on health check path\n- Instance in wrong state (stopped, terminated)\n- Target group protocol mismatch (HTTP health check on HTTPS endpoint)\n- IP target type — IPs removed from target group after deployment\n\n### Observability Signals\n- elb_healthy_host_count == 0\n- ALB access logs showing 502 Bad Gateway\n- Health check logs showing timeouts or connection refused\n- CloudWatch: UnHealthyHostCount == total targets\n- VPC Flow Logs: REJECT on health check port from LB CIDR\n\n### Recommended CLI Commands\naws elbv2 describe-target-health --target-group-arn <arn>\naws elbv2 describe-target-groups --target-group-arns <arn>\naws elbv2 describe-load-balancers\ncurl http://<target-ip>:<port>/<health-check-path> (test directly)\nVPC Flow Logs: filter for LB source CIDR to target port\n\n### Step-by-Step RCA\n1) 'describe-target-health' — get specific reason per target (timeout, unhealthy, unused)\n2) Test health check manually: curl from LB subnet or same AZ instance\n3) Check health check config: correct port, protocol (HTTP vs HTTPS), path, success codes\n4) Check target security group: does it allow traffic from LB security group?\n5) Check if application returns 200 on health check path\n6) For NLB: check target security group AND network ACL\n\n### Resolution\nFix health check path/port/protocol; update target security group; fix application health check endpoint; re-register targets.\n\n### Preventive Actions\nTest health check configuration at deploy time; monitor UnHealthyHostCount; alert on > 50% targets unhealthy.\n\n### Related Tools\nAWS Console, AWS CLI, ALB access logs, CloudWatch, VPC Flow Logs",
    "problem": "Health check port or path configured incorrectly",
    "area": "Load Balancer",
    "remedyItems": [
      "Fix health check path/port/protocol",
      "update target security group",
      "fix application health check endpoint",
      "re-register targets.",
      "Test health check configuration at deploy time",
      "monitor UnHealthyHostCount"
    ],
    "tags": [
      "cloud",
      "elb",
      "alb",
      "target-unhealthy",
      "health-check",
      "security-group",
      "502"
    ],
    "linkedIntents": [
      "cloud.elb_unhealthy"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-005",
    "title": "S3 access denied errors occurring — application cannot read/write objects. How to resolve?",
    "category": "Compute",
    "subcategory": "Storage",
    "content": "### Overview\nS3 access denied errors occurring — application cannot read/write objects. How to resolve?\n\n### Likely Causes\n- IAM role/user policy missing s3:GetObject or s3:PutObject permission\n- S3 bucket policy explicitly denying access\n- S3 Block Public Access settings blocking access to public bucket\n- Cross-account: bucket policy not granting access to external account\n- KMS key policy not allowing IAM role to use encryption key\n- S3 VPC endpoint policy restrictive — blocking from specific instances\n- Incorrect bucket region — SDK not configured for correct region\n\n### Observability Signals\n- HTTP 403 AccessDenied from S3 API\n- CloudTrail: s3:GetObject showing AccessDenied for specific principal\n- Application error logs: 'AccessDeniedException'\n- AWS Config showing S3 block public access enabled on bucket\n- STS GetCallerIdentity returns different principal than expected\n\n### Recommended CLI Commands\naws s3 ls s3://<bucket>/ (test access)\naws s3api get-bucket-policy --bucket <name>\naws s3api get-bucket-acl --bucket <name>\naws iam simulate-principal-policy (test permissions)\naws sts get-caller-identity (confirm which principal is acting)\nCloudTrail: filter for ErrorCode=AccessDenied and eventSource=s3.amazonaws.com\n\n### Step-by-Step RCA\n1) Confirm which principal is getting 403: 'aws sts get-caller-identity'\n2) Simulate policy: 'aws iam simulate-principal-policy' for that principal\n3) Check bucket policy: any explicit Deny?\n4) Check S3 Block Public Access: enabled at account or bucket level?\n5) For KMS encrypted bucket: check KMS key policy allows principal\n6) Check VPC endpoint policy if accessing via VPC endpoint\n\n### Resolution\nAdd required S3 permissions to IAM policy; remove explicit Deny from bucket policy; fix KMS key policy; update VPC endpoint policy.\n\n### Preventive Actions\nLeast-privilege IAM policy testing before deploy; use AWS IAM Policy Simulator; CloudTrail alerting on S3 AccessDenied.\n\n### Related Tools\nAWS IAM Policy Simulator, CloudTrail, AWS Config, AWS CLI",
    "problem": "IAM role/user policy missing s3:GetObject or s3:PutObject permission",
    "area": "Storage",
    "remedyItems": [
      "Add required S3 permissions to IAM policy",
      "remove explicit Deny from bucket policy",
      "fix KMS key policy",
      "update VPC endpoint policy.",
      "Least-privilege IAM policy testing before deploy",
      "use AWS IAM Policy Simulator"
    ],
    "tags": [
      "cloud",
      "s3",
      "access-denied",
      "iam-policy",
      "bucket-policy",
      "kms",
      "cross-account",
      "403"
    ],
    "linkedIntents": [
      "cloud.s3_access_denied"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-cloud-006",
    "title": "Cloud IAM denying actions despite policy appearing correct — how to debug permission issues?",
    "category": "Compute",
    "subcategory": "IAM",
    "content": "### Overview\nCloud IAM denying actions despite policy appearing correct — how to debug permission issues?\n\n### Likely Causes\n- Explicit Deny in IAM policy overriding any Allow (Deny always wins)\n- Service Control Policy (SCP) at AWS Organization level blocking action\n- IAM Permission Boundary restricting effective permissions\n- Role not being assumed correctly — using wrong credentials\n- Condition in policy not being met (e.g., IP condition, MFA condition)\n- Resource ARN in policy not matching actual resource ARN\n- Session policy (assumed role) more restrictive than role policy\n\n### Observability Signals\n- HTTP 403 AccessDenied from AWS API\n- CloudTrail: errorCode=AccessDenied with requestParameters\n- IAM Policy Simulator showing Denied\n- AWS CLI: 'An error occurred (AccessDenied)'\n- SCP evaluation showing block at org level\n\n### Recommended CLI Commands\naws sts get-caller-identity\naws iam simulate-principal-policy --policy-source-arn <role-arn> --action-names <action>\nCloudTrail: filter errorCode=AccessDenied\naws organizations list-policies-for-target (check SCPs)\naws iam get-role --role-name <name> | jq .Role.PermissionsBoundary\n\n### Step-by-Step RCA\n1) 'sts get-caller-identity' — is application using correct role/identity?\n2) CloudTrail: what exact action, resource ARN, and condition was evaluated?\n3) IAM Policy Simulator: test specific action on specific resource\n4) Check for explicit Deny in any attached policy\n5) Check SCP: is org-level policy blocking this action in this account?\n6) Check Permission Boundary: is it set on role and restricting action?\n\n### Resolution\nRemove explicit Deny; update SCP (requires org admin); remove or expand Permission Boundary; fix role ARN; meet policy conditions.\n\n### Preventive Actions\nPolicy-as-code with automated testing; CloudTrail alerting on AccessDenied; regular IAM access reviews; least-privilege enforcement.\n\n### Related Tools\nCloudTrail, IAM Policy Simulator, AWS Organizations, AWS Config",
    "problem": "Explicit Deny in IAM policy overriding any Allow (Deny always wins)",
    "area": "IAM",
    "remedyItems": [
      "Remove explicit Deny",
      "update SCP (requires org admin)",
      "remove or expand Permission Boundary",
      "fix role ARN",
      "meet policy conditions.",
      "Policy-as-code with automated testing"
    ],
    "tags": [
      "cloud",
      "iam",
      "access-denied",
      "scp",
      "permission-boundary",
      "explicit-deny",
      "cloudtrail",
      "403"
    ],
    "linkedIntents": [
      "cloud.iam_deny"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-app-001",
    "title": "Application error rate is elevated — how to determine root cause and recover quickly?",
    "category": "Application",
    "subcategory": "Error Rate",
    "content": "### Overview\nApplication error rate is elevated — how to determine root cause and recover quickly?\n\n### Likely Causes\n- Recent code deployment with bug in new code path\n- Downstream dependency (DB, cache, third-party API) returning errors\n- Resource exhaustion (memory, connections, threads)\n- Bad data in request causing unhandled exception\n- Configuration change causing misconfigured application behavior\n- Traffic spike exceeding application capacity\n\n### Observability Signals\n- error_rate_percent > 5 for HTTP 5xx\n- Specific error type dominant: 500 (app), 503 (capacity), 504 (timeout)\n- Error rate correlated with deployment event\n- Downstream dependency latency or error rate also elevated\n- Thread pool or connection pool saturation metrics\n\n### Recommended CLI Commands\ngrep -c 'ERROR\\|Exception' app.log\ntail -f app.log | grep -v INFO\ncurl -o /dev/null -s -w '%{http_code}' https://<endpoint>/health\ncheck deployment history (git log / CI/CD)\ncheck APM transaction traces for error span\ncheck dependency health endpoints\n\n### Step-by-Step RCA\n1) Check deployment history — did error rate increase after deploy?\n2) If yes: rollback immediately, then investigate\n3) Identify error type: 500 vs 503 vs 504 — different root causes\n4) Check APM trace for failing span: which service call is throwing error?\n5) Check downstream dependencies: DB, cache, queue error rates\n6) Check resource utilization: thread pool, connection pool, memory\n\n### Resolution\nRollback bad deployment; fix dependency; scale application; fix error handling for bad input; apply hot-fix.\n\n### Preventive Actions\nCanary deployments; error rate SLO with burn rate alerts; circuit breakers; chaos engineering testing.\n\n### Related Tools\nAPM, error tracking (Sentry), CI/CD platform, Prometheus, logs",
    "problem": "Recent code deployment with bug in new code path",
    "area": "Error Rate",
    "remedyItems": [
      "Rollback bad deployment",
      "fix dependency",
      "scale application",
      "fix error handling for bad input",
      "apply hot-fix.",
      "Canary deployments"
    ],
    "tags": [
      "app-errors",
      "5xx",
      "deployment-rollback",
      "dependency-failure",
      "error-rate",
      "canary"
    ],
    "linkedIntents": [
      "app.high_error_rate"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-app-002",
    "title": "Application process is being OOM-killed by the OS or container runtime — how to diagnose and prevent?",
    "category": "Application",
    "subcategory": "Memory",
    "content": "### Overview\nApplication process is being OOM-killed by the OS or container runtime — how to diagnose and prevent?\n\n### Likely Causes\n- JVM heap limit too low for workload (Java -Xmx too small)\n- Memory leak triggered by specific request pattern\n- Large file or payload loaded entirely into memory\n- Unbounded in-memory cache growing without eviction\n- Concurrent request spike exhausting memory pool\n- Container memory limit too restrictive for application\n\n### Observability Signals\n- OOMKilled container exit code 137\n- Kernel OOM killer log in dmesg\n- Heap memory usage at 100% before crash\n- GC pressure very high (> 20% time in GC)\n- Process RSS growing monotonically until crash\n\n### Recommended CLI Commands\ndmesg | grep -i oom\nkubectl describe pod <pod> | grep -i oom\njournalctl -k | grep OOM\njstat -gcutil <pid> 1000 (JVM GC stats)\njmap -histo <pid> (JVM heap histogram)\ncat /sys/fs/cgroup/memory/docker/<id>/memory.oom_control\n\n### Step-by-Step RCA\n1) Confirm OOM: dmesg or kubectl events showing OOMKilled\n2) Check what triggered OOM: specific request pattern? Traffic spike?\n3) JVM: run heap dump before next OOM (add -XX:+HeapDumpOnOutOfMemoryError)\n4) Analyze heap dump: which objects consuming most memory?\n5) Check for unbounded cache: add eviction policy\n6) For containers: is memory limit too low vs actual need?\n\n### Resolution\nIncrease JVM heap or container memory limit; fix memory leak; add cache eviction; paginate large payloads; reduce concurrency limit.\n\n### Preventive Actions\nSet memory alerts at 80% heap; load test with production-like payloads; automatic heap dump on OOM; right-size container limits.\n\n### Related Tools\nJVM profiler, heapdump analyzer (Eclipse MAT), dmesg, Prometheus",
    "problem": "JVM heap limit too low for workload (Java -Xmx too small)",
    "area": "Memory",
    "remedyItems": [
      "Increase JVM heap or container memory limit",
      "fix memory leak",
      "add cache eviction",
      "paginate large payloads",
      "reduce concurrency limit.",
      "Set memory alerts at 80% heap"
    ],
    "tags": [
      "oom",
      "memory",
      "heap",
      "jvm",
      "container-limit",
      "oomkilled",
      "gc",
      "cache"
    ],
    "linkedIntents": [
      "app.memory_oom"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-app-003",
    "title": "Application thread pool is exhausted — requests queuing or being rejected. How to resolve?",
    "category": "Application",
    "subcategory": "Concurrency",
    "content": "### Overview\nApplication thread pool is exhausted — requests queuing or being rejected. How to resolve?\n\n### Likely Causes\n- Slow downstream dependency blocking threads (synchronous I/O waiting)\n- Thread leak — threads not returned to pool after use\n- Thread pool size too small for concurrency requirements\n- Deadlock causing threads to wait indefinitely\n- Long-running transactions holding threads\n- Synchronization bottleneck causing thread contention\n\n### Observability Signals\n- active_threads == max_pool_size sustained\n- Request queue depth growing\n- HTTP 503 Service Unavailable (thread pool rejection)\n- Thread pool wait time increasing in APM\n- JVM thread dump showing all threads WAITING or BLOCKED\n\n### Recommended CLI Commands\njstack <pid> > threaddump.txt (JVM thread dump)\nkill -3 <pid> (JVM thread dump to stdout)\ncat /proc/<pid>/status | grep Threads\nnetstat -an | grep ESTABLISHED | wc -l\ncheck APM: thread pool metrics (active, queued, rejected)\nkubectl exec <pod> -- jstack 1\n\n### Step-by-Step RCA\n1) Capture thread dump: 'jstack <pid>' — what are most threads waiting on?\n2) If all threads WAITING on DB/HTTP call: downstream is the bottleneck\n3) Check for deadlock: jstack output shows 'deadlock' section\n4) Check downstream response times — are they much slower than normal?\n5) Count active threads vs pool size — is pool truly exhausted or misconfigured?\n6) Set timeout on all downstream calls — threads must not wait indefinitely\n\n### Resolution\nSet timeouts on downstream calls; increase pool size (with caution); fix deadlock; implement async I/O; use circuit breaker for slow dependency.\n\n### Preventive Actions\nAlways set timeouts on network calls; monitor thread pool utilization; configure circuit breakers; load test with upstream dependencies slow.\n\n### Related Tools\njstack, APM, Prometheus JVM metrics, thread dump analyzer",
    "problem": "Slow downstream dependency blocking threads (synchronous I/O waiting)",
    "area": "Concurrency",
    "remedyItems": [
      "Set timeouts on downstream calls",
      "increase pool size (with caution)",
      "fix deadlock",
      "implement async I/O",
      "use circuit breaker for slow dependency.",
      "Always set timeouts on network calls"
    ],
    "tags": [
      "thread-pool",
      "exhausted",
      "503",
      "deadlock",
      "blocking-io",
      "jvm",
      "timeout",
      "circuit-breaker"
    ],
    "linkedIntents": [
      "app.thread_pool_exhausted"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-app-004",
    "title": "Database or service connection pool is exhausted — new requests failing to acquire connections. How to fix?",
    "category": "Application",
    "subcategory": "Concurrency",
    "content": "### Overview\nDatabase or service connection pool is exhausted — new requests failing to acquire connections. How to fix?\n\n### Likely Causes\n- Slow database queries holding connections for extended periods\n- Connection leak — connections not returned to pool after use\n- Pool size too small for concurrent request rate\n- Long-running transactions blocking connection release\n- Database restarted — pool holding stale closed connections\n- Thundering herd on startup exhausting pool before warmup\n\n### Observability Signals\n- connection_pool_active == connection_pool_max sustained\n- 'Cannot get connection from pool' errors in app logs\n- Connection pool wait time increasing in APM\n- DB showing max_connections near limit\n- Requests timing out waiting for connection (not from query)\n\n### Recommended CLI Commands\nSHOW STATUS LIKE 'Threads_connected'; (MySQL)\nSELECT count(*) FROM pg_stat_activity; (PostgreSQL)\nSELECT * FROM pg_stat_activity WHERE wait_event_type='Lock'; (blocking queries)\ncheck connection pool library metrics (HikariCP, c3p0)\ncheck APM pool dashboard\nnetstat -an | grep :5432 | wc -l (active DB connections)\n\n### Step-by-Step RCA\n1) Check pool utilization: active vs max from pool library metrics (HikariCP JMX)\n2) Check DB: active connections vs max_connections allowed\n3) Look for long-running transactions: 'pg_stat_activity' or MySQL processlist\n4) Kill long-running idle connections: set pool idle timeout\n5) Check for connection leaks: pool grow without release pattern\n6) Enable pool timeout with exception to find code paths not returning connections\n\n### Resolution\nKill long transactions; increase pool size (with DB capacity check); fix connection leak; set connection max lifetime; fix slow queries.\n\n### Preventive Actions\nSet pool connection timeout and max lifetime; use connection pool leak detection; monitor pool utilization via APM.\n\n### Related Tools\nHikariCP metrics, pg_stat_activity, MySQL processlist, APM, Prometheus",
    "problem": "Slow database queries holding connections for extended periods",
    "area": "Concurrency",
    "remedyItems": [
      "Kill long transactions",
      "increase pool size (with DB capacity check)",
      "fix connection leak",
      "set connection max lifetime",
      "fix slow queries.",
      "Set pool connection timeout and max lifetime"
    ],
    "tags": [
      "connection-pool",
      "exhausted",
      "db-pool",
      "connection-leak",
      "long-transaction",
      "hikaricp",
      "max-connections"
    ],
    "linkedIntents": [
      "app.connection_pool_exhausted"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-app-005",
    "title": "Application TLS certificate has expired or is about to expire — causing SSL errors for clients. How to renew?",
    "category": "Application",
    "subcategory": "Security",
    "content": "### Overview\nApplication TLS certificate has expired or is about to expire — causing SSL errors for clients. How to renew?\n\n### Likely Causes\n- Leaf certificate expired (most common — renewal process failed)\n- Intermediate CA certificate expired (affects all leaf certs under it)\n- Auto-renewal (ACME/Let's Encrypt) failed silently\n- Certificate chain incomplete — intermediate not bundled\n- Wildcard certificate not covering the specific subdomain\n- Certificate deployed to wrong server/load balancer instance\n\n### Observability Signals\n- SSL handshake errors increasing\n- Browser showing certificate expired or invalid warning\n- Monitoring alert for cert expiry < 14 days\n- openssl showing 'Verify return code: 10 (certificate has expired)'\n- Synthetic HTTPS probe failing with SSL error\n\n### Recommended CLI Commands\nopenssl s_client -connect <host>:443 -servername <hostname>\necho | openssl s_client -connect <host>:443 2>/dev/null | openssl x509 -noout -dates\ncurl -vI https://<host> 2>&1 | grep -i expire\ncertbot renew --dry-run (Let's Encrypt)\ncheck certificate management platform (cert-manager, Venafi, DigiCert)\n\n### Step-by-Step RCA\n1) Confirm expiry: 'openssl x509 -noout -dates' — is notAfter in the past?\n2) Check chain: is intermediate CA certificate included and valid?\n3) Check auto-renewal: did ACME challenge succeed? Check certbot/cert-manager logs\n4) Verify certificate deployed to all serving endpoints (multiple LB instances)\n5) Test with new cert before cutover: 'openssl verify'\n6) For wildcard: does *.domain.com cover the failing subdomain?\n\n### Resolution\nRenew certificate immediately; fix ACME renewal process; deploy to all endpoints; add intermediate to chain; expand wildcard or issue SAN cert.\n\n### Preventive Actions\nAutomated renewal (ACME); alerts at 30/14/7 days before expiry; certificate inventory in CMDB; synthetic SSL probe monitoring.\n\n### Related Tools\nopenssl, certbot, cert-manager, certificate monitoring platform, Prometheus",
    "problem": "Leaf certificate expired (most common — renewal process failed)",
    "area": "Security",
    "remedyItems": [
      "Renew certificate immediately",
      "fix ACME renewal process",
      "deploy to all endpoints",
      "add intermediate to chain",
      "expand wildcard or issue SAN cert.",
      "Automated renewal (ACME)"
    ],
    "tags": [
      "certificate",
      "tls",
      "ssl-expiry",
      "acme",
      "lets-encrypt",
      "intermediate-ca",
      "wildcard",
      "renewal"
    ],
    "linkedIntents": [
      "app.cert_expiry"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-app-006",
    "title": "Application behaviour changed without code deployment — configuration drift suspected. How to detect and recover?",
    "category": "Application",
    "subcategory": "Configuration",
    "content": "### Overview\nApplication behaviour changed without code deployment — configuration drift suspected. How to detect and recover?\n\n### Likely Causes\n- Environment variable changed in deployment platform (K8s ConfigMap, ECS env)\n- Config file overwritten by automation or manual change\n- Secret rotated in vault but application not updated with new value\n- Feature flag toggled accidentally in feature flag platform\n- A/B test configuration changed affecting production percentage\n- Infrastructure config change (instance type, memory) changing runtime behavior\n\n### Observability Signals\n- Application behavior change without code deployment\n- Specific feature suddenly broken or enabled unexpectedly\n- Authentication failures after secret rotation\n- Configuration-sensitive metric (cache TTL, timeout) changed\n- Audit log showing config change event\n\n### Recommended CLI Commands\nkubectl describe configmap <name> -n <ns>\nkubectl get secret <name> -n <ns> -o yaml\ngit diff HEAD~1 <config-file> (if git-managed)\ncheck feature flag platform audit log\ncheck secret manager version history (Vault, AWS Secrets Manager)\nenv (from inside running container)\n\n### Step-by-Step RCA\n1) Compare current config with last known-good config: what changed?\n2) Check change audit logs: who changed what and when?\n3) For secrets: has secret been rotated? Is app using old cached value?\n4) For feature flags: check flag platform for recent toggles\n5) Roll back config change to known-good state\n6) Understand why drift occurred — manual change? Automation?\n\n### Resolution\nRevert config to known-good state; update application with new secret; restore feature flag; fix automation causing drift.\n\n### Preventive Actions\nGitOps for all config (config-as-code); audit logging on all config changes; configuration drift detection tools; immutable ConfigMaps.\n\n### Related Tools\nGitOps (ArgoCD/Flux), AWS Config, Vault audit logs, feature flag audit, kubectl",
    "problem": "Environment variable changed in deployment platform (K8s ConfigMap, ECS env)",
    "area": "Configuration",
    "remedyItems": [
      "Revert config to known-good state",
      "update application with new secret",
      "restore feature flag",
      "fix automation causing drift.",
      "GitOps for all config (config-as-code)",
      "audit logging on all config changes"
    ],
    "tags": [
      "config-drift",
      "configmap",
      "secret-rotation",
      "feature-flag",
      "environment-variable",
      "gitops"
    ],
    "linkedIntents": [
      "app.config_drift"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-001",
    "title": "Thousands of alerts firing in minutes — alert storm overwhelming the team. How to triage and suppress?",
    "category": "Platform",
    "subcategory": "Alerting",
    "content": "### Overview\nThousands of alerts firing in minutes — alert storm overwhelming the team. How to triage and suppress?\n\n### Likely Causes\n- Single root cause generating hundreds of symptom alerts (no deduplication)\n- Alert threshold too sensitive (transient spike triggering alert)\n- No alert dampening or evaluation period\n- Flapping event source generating repeated state changes\n- Monitoring system not suppressing child alerts when parent is alerting\n- Mass device event (power outage, network split) generating flood\n\n### Observability Signals\n- alert_rate_per_minute > 100\n- Multiple alerts with same root cause device or component\n- Alert IDs all within same short time window\n- Repeated FIRING Ã¢â€ â€™ RESOLVED Ã¢â€ â€™ FIRING cycling (flap)\n- On-call team unable to identify the root cause alert\n\n### Recommended CLI Commands\nCheck alertmanager silence rules (Prometheus)\nCheck alert correlation / grouping rules\nReview alert history for top firing alert names\nCheck root cause device for primary alarm\nCheck alert inhibition rules\n\n### Step-by-Step RCA\n1) Identify single highest-priority alert that could be root cause\n2) Group by source device/component — is one device generating most alerts?\n3) Silence downstream symptom alerts while investigating root cause\n4) Fix underlying issue first, then clear symptom alerts\n5) Post-incident: add inhibition rules to suppress child alerts\n6) Add dampening (evaluate for period before firing) for flapping alerts\n\n### Resolution\nSilence symptom alerts; fix root cause device; add alert inhibition rules; increase evaluation period for sensitive thresholds; implement alert correlation.\n\n### Preventive Actions\nAlert hierarchy with inhibition; parent/child alert relationships; dampening/evaluation periods on all threshold alerts; test alert volume in staging.\n\n### Related Tools\nAlertmanager, PagerDuty, OpsGenie, alert correlation engine",
    "problem": "Single root cause generating hundreds of symptom alerts (no deduplication)",
    "area": "Alerting",
    "remedyItems": [
      "Silence symptom alerts",
      "fix root cause device",
      "add alert inhibition rules",
      "increase evaluation period for sensitive thresholds",
      "implement alert correlation.",
      "Alert hierarchy with inhibition"
    ],
    "tags": [
      "alert-storm",
      "alert-flood",
      "inhibition",
      "dampening",
      "deduplication",
      "correlation",
      "flapping-alert"
    ],
    "linkedIntents": [
      "obs.alert_storm"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-002",
    "title": "Logs not appearing in centralized logging system — log pipeline has broken. How to diagnose?",
    "category": "Platform",
    "subcategory": "Logging",
    "content": "### Overview\nLogs not appearing in centralized logging system — log pipeline has broken. How to diagnose?\n\n### Likely Causes\n- Log shipper (Fluentd, Logstash, Vector, Filebeat) crashed or stopped\n- Elasticsearch/OpenSearch disk full — refusing new documents\n- Log pipeline backpressure causing log drop\n- Parse error in pipeline: log format change breaking parser\n- Network path from log shipper to aggregator blocked\n- Log index rotation/ILM policy failing causing full index\n\n### Observability Signals\n- log_ingestion_rate drops to zero\n- Log shipper process not running\n- Elasticsearch cluster status RED or disk full\n- Pipeline error rate in Logstash/Vector metrics\n- Logs visible on source host but not in Kibana/Grafana Loki\n\n### Recommended CLI Commands\nsystemctl status filebeat|fluentd|vector\njournalctl -u filebeat -n 100\ncurl http://<elasticsearch>:9200/_cluster/health\ncurl http://<elasticsearch>:9200/_cat/indices?v (check index status)\ncheck log shipper metrics endpoint (Prometheus scrape)\ntail -f /var/log/filebeat/filebeat (shipper own logs)\n\n### Step-by-Step RCA\n1) Check log shipper process on source hosts\n2) Check shipper own logs for errors (parse errors, connection refused)\n3) Test network: can shipper reach aggregator port (5044, 9200)?\n4) Check Elasticsearch cluster health and disk usage\n5) Check parse pipeline: did log format change recently?\n6) Check ILM policy: is old index blocking new writes?\n\n### Resolution\nRestart log shipper; free Elasticsearch disk (ILM policy, delete old indices); fix parse error; restore network path; fix index policy.\n\n### Preventive Actions\nMonitor log shipper health as meta-metric; Elasticsearch disk alert at 80%; test pipeline after log format changes.\n\n### Related Tools\nFilebeat, Fluentd, Logstash, Elasticsearch, Kibana, Prometheus",
    "problem": "Log shipper (Fluentd, Logstash, Vector, Filebeat) crashed or stopped",
    "area": "Logging",
    "remedyItems": [
      "Restart log shipper",
      "free Elasticsearch disk (ILM policy, delete old indices)",
      "fix parse error",
      "restore network path",
      "fix index policy.",
      "Monitor log shipper health as meta-metric"
    ],
    "tags": [
      "log-pipeline",
      "log-shipper",
      "elasticsearch-full",
      "fluentd",
      "filebeat",
      "parse-error",
      "ilm"
    ],
    "linkedIntents": [
      "obs.log_pipeline_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-003",
    "title": "Distributed traces are incomplete or missing spans — how to diagnose trace coverage gaps?",
    "category": "Platform",
    "subcategory": "Tracing",
    "content": "### Overview\nDistributed traces are incomplete or missing spans — how to diagnose trace coverage gaps?\n\n### Likely Causes\n- Trace sampler set too low (e.g., 0.01%) losing most traces\n- Service not instrumented with tracing library\n- Trace context headers not propagated between services (broken trace chain)\n- Trace exporter (OTLP, Jaeger, Zipkin) connectivity failing\n- New service deployment without adding tracing agent\n- W3C TraceContext vs B3 header format mismatch between services\n\n### Observability Signals\n- trace_completeness_percent < 90\n- Missing spans in traces (gaps in service call chain)\n- Specific service always showing as external (not instrumented)\n- Trace exporter error count > 0\n- New deployments not appearing in service map\n\n### Recommended CLI Commands\ncheck OTLP exporter metrics (otelcol: grpc_exporter_sent_spans)\ncurl http://<service>:8080/actuator/metrics | grep trace (Spring)\ncheck trace sampling config: OTEL_TRACES_SAMPLER env var\ncheck W3C trace context header: 'traceparent' in HTTP requests\ncheck Jaeger/Zipkin UI for missing service\ncheck service mesh sidecar (Istio/Envoy) tracing config\n\n### Step-by-Step RCA\n1) Identify missing service in trace waterfall\n2) Is that service instrumented? Check for OTEL agent/SDK in deployment\n3) Check trace context propagation: is traceparent header forwarded in HTTP calls?\n4) Check sampling rate: is it too low to capture this trace?\n5) Check exporter connectivity: OTLP endpoint reachable from service?\n6) For service mesh: is Envoy sidecar trace propagation enabled?\n\n### Resolution\nAdd tracing instrumentation; fix context propagation; increase sampling rate; fix exporter connectivity; align header formats.\n\n### Preventive Actions\nRequire tracing in service deployment checklist; validate trace coverage in staging; set sampling to 100% for errors and slow traces.\n\n### Related Tools\nJaeger, Zipkin, Tempo, OpenTelemetry Collector, service mesh",
    "problem": "Trace sampler set too low (e.g., 0.01%) losing most traces",
    "area": "Tracing",
    "remedyItems": [
      "Add tracing instrumentation",
      "fix context propagation",
      "increase sampling rate",
      "fix exporter connectivity",
      "align header formats.",
      "Require tracing in service deployment checklist"
    ],
    "tags": [
      "tracing",
      "opentelemetry",
      "spans",
      "sampling",
      "trace-context",
      "jaeger",
      "otlp",
      "instrumentation"
    ],
    "linkedIntents": [
      "obs.trace_gap"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-004",
    "title": "Grafana/monitoring dashboard showing 'No Data' — how to find the cause?",
    "category": "Platform",
    "subcategory": "Dashboards",
    "content": "### Overview\nGrafana/monitoring dashboard showing 'No Data' — how to find the cause?\n\n### Likely Causes\n- Datasource connection broken (Prometheus URL changed, credentials expired)\n- Metric name changed after application update (breaking dashboard query)\n- Time range too long causing query timeout on data source\n- Metric cardinality explosion causing Prometheus OOM Ã¢â€ â€™ no metrics\n- Data source query returning empty result set (wrong label filter)\n- Clock skew between dashboard host and data source\n\n### Observability Signals\n- dashboard panels showing 'No Data'\n- Grafana data source connection test failing\n- Prometheus queries returning empty set\n- Prometheus target showing as DOWN\n- Grafana error: 'datasource timeout' or 'connection refused'\n\n### Recommended CLI Commands\ncurl http://<prometheus>:9090/api/v1/query?query=up\ncurl http://<prometheus>:9090/-/ready\ncheck Grafana data source settings: connection test\nrun PromQL directly in Prometheus UI\ncheck label names and values changed: 'label_values()'\ncheck Prometheus target health: /targets page\n\n### Step-by-Step RCA\n1) Test data source connection in Grafana settings\n2) Run query directly in Prometheus/data source UI\n3) Is metric name exactly correct? Check for underscores vs dots changes\n4) Check label filters in query: do label values still exist?\n5) Reduce time range — is it a timeout issue on long queries?\n6) Check Prometheus health: is it up and ingesting targets correctly?\n\n### Resolution\nFix data source connection; update query for new metric name; fix label filters; add recording rule for expensive queries; fix Prometheus health.\n\n### Preventive Actions\nVersion control dashboard JSON; test queries after metric changes; alert on Prometheus target DOWN; data source health checks.\n\n### Related Tools\nGrafana, Prometheus, Loki, InfluxDB, dashboard-as-code",
    "problem": "Datasource connection broken (Prometheus URL changed, credentials expired)",
    "area": "Dashboards",
    "remedyItems": [
      "Fix data source connection",
      "update query for new metric name",
      "fix label filters",
      "add recording rule for expensive queries",
      "fix Prometheus health.",
      "Version control dashboard JSON"
    ],
    "tags": [
      "dashboard",
      "no-data",
      "grafana",
      "prometheus",
      "datasource",
      "metric-name-change",
      "query-timeout"
    ],
    "linkedIntents": [
      "obs.dashboard_no_data"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-obs-005",
    "title": "Alert is firing but there is no real problem — false positive alert eroding team trust. How to tune?",
    "category": "Platform",
    "subcategory": "Alerting",
    "content": "### Overview\nAlert is firing but there is no real problem — false positive alert eroding team trust. How to tune?\n\n### Likely Causes\n- Alert threshold set without considering normal traffic patterns\n- Seasonal or daily traffic variation exceeding static threshold\n- Very short evaluation window capturing transient spikes\n- Wrong aggregation function (max vs avg on bursty metric)\n- Alert based on single data point, not sustained condition\n- Metric cardinality issue giving misleading aggregate value\n\n### Observability Signals\n- Alert firing frequently with no user-visible impact\n- Alert resolves within minutes without any action\n- Alert fires at same time daily (cron, business hours)\n- Alert ack rate very high — team suppressing without investigating\n- On-call burnout from low signal-to-noise ratio\n\n### Recommended CLI Commands\nQuery Prometheus for historical trend: query_range for 7 days\nCheck alert evaluation period: for duration\nCheck aggregation function in alert expression\nReview alert firing history in Alertmanager\nCompare alert firing pattern with traffic pattern\n\n### Step-by-Step RCA\n1) Plot metric over 7 days — is threshold exceeded regularly without incidents?\n2) Check evaluation period: is 'for' clause too short?\n3) Identify if metric is bursty: use avg or p95 instead of max\n4) Check for daily pattern: does it fire at 9am every day (business hours)?\n5) Consider dynamic threshold based on time-of-day or day-of-week\n6) Raise threshold or extend evaluation window as immediate fix\n\n### Resolution\nIncrease threshold or 'for' duration; switch to percentile-based threshold; implement dynamic/seasonal thresholds; add business-hours filter.\n\n### Preventive Actions\nAlert on SLO burn rate (more robust than threshold); test alerts with historical data before deploying; review false positive rate monthly.\n\n### Related Tools\nPrometheus, Alertmanager, Grafana, SLO platform",
    "problem": "Alert threshold set without considering normal traffic patterns",
    "area": "Alerting",
    "remedyItems": [
      "Increase threshold or 'for' duration",
      "switch to percentile-based threshold",
      "implement dynamic/seasonal thresholds",
      "add business-hours filter.",
      "Alert on SLO burn rate (more robust than threshold)",
      "test alerts with historical data before deploying"
    ],
    "tags": [
      "false-positive",
      "alert-tuning",
      "threshold",
      "seasonality",
      "evaluation-window",
      "slo",
      "signal-to-noise"
    ],
    "linkedIntents": [
      "obs.false_positive_alert"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mpls-001",
    "title": "LDP session is down — MPLS label distribution has stopped. How to restore?",
    "category": "Network",
    "subcategory": "MPLS",
    "content": "### Overview\nLDP session is down — MPLS label distribution has stopped. How to restore?\n\n### Likely Causes\n- TCP session failure between LDP peers (transport connectivity)\n- LDP MD5 authentication mismatch\n- LDP hellos not reaching peer (multicast 224.0.0.2 blocked)\n- LDP router-ID not reachable (loopback not advertised in IGP)\n- Interface not LDP-enabled\n- Access list blocking TCP 646 (LDP)\n\n### Observability Signals\n- ldp_session_state != OPERATIONAL\n- LDP bindings missing for expected prefixes\n- MPLS forwarding table gaps\n- Syslog: 'LDP session DOWN', 'MPLS-LDP-5-NBRCHANGE'\n- Traffic black-holing on MPLS paths\n\n### Recommended CLI Commands\nshow mpls ldp neighbor\nshow mpls ldp bindings\nshow mpls forwarding-table\nshow logging | inc LDP|MPLS\nshow run | inc mpls ldp\ntelnet <peer-loopback> 646\n\n### Step-by-Step RCA\n1) Check LDP neighbor state: 'show mpls ldp neighbor'\n2) Test TCP 646 to peer loopback: 'telnet <peer-loopback> 646'\n3) Is peer loopback reachable (IGP route exists)?\n4) Check LDP interface: 'show mpls ldp interface' — all P-PE interfaces LDP-enabled?\n5) Check auth: 'show mpls ldp neighbor detail' shows auth info\n6) Check multicast: can LDP hello (multicast) reach all neighbors?\n\n### Resolution\nFix TCP 646 ACL; restore loopback reachability; enable LDP on interface; fix MD5 auth; restore multicast reachability for hellos.\n\n### Preventive Actions\nMonitor LDP session count via SNMP; alert on session drops; enable LDP session protection to survive brief link failures.\n\n### Related Tools\nMPLS logs, Syslog, SNMP",
    "problem": "TCP session failure between LDP peers (transport connectivity)",
    "area": "MPLS",
    "remedyItems": [
      "Fix TCP 646 ACL",
      "restore loopback reachability",
      "enable LDP on interface",
      "fix MD5 auth",
      "restore multicast reachability for hellos.",
      "Monitor LDP session count via SNMP"
    ],
    "tags": [
      "mpls",
      "ldp",
      "label-distribution",
      "tcp-646",
      "mpls-forwarding",
      "authentication"
    ],
    "linkedIntents": [
      "mpls.ldp_down"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mpls-002",
    "title": "MPLS LSP (Label Switched Path) is broken — traffic not following the engineered path. How to diagnose?",
    "category": "Network",
    "subcategory": "MPLS",
    "content": "### Overview\nMPLS LSP (Label Switched Path) is broken — traffic not following the engineered path. How to diagnose?\n\n### Likely Causes\n- Physical link failure along LSP path\n- RSVP session timeout due to missed refresh messages\n- TE bandwidth constraint no longer satisfiable (link used by higher priority)\n- Midpoint router dropping packets due to label mismatch\n- LSP head-end not re-signaling after failure (make-before-break not working)\n- CSPF computation failure due to stale TE topology database\n\n### Observability Signals\n- mpls_lsp_state != UP\n- RSVP session not established along path\n- Traffic falling back to IP path (no longer MPLS)\n- Traceroute showing IP hops instead of MPLS labels\n- TE tunnel state down in NMS\n\n### Recommended CLI Commands\nshow mpls traffic-eng tunnels\nshow rsvp session\nshow mpls traffic-eng tunnels detail\ntraceroute mpls ip <lsp-endpoint>\nshow mpls traffic-eng topology\nshow ip rsvp interface\n\n### Step-by-Step RCA\n1) Check tunnel state: 'show mpls traffic-eng tunnels' — is it up or down?\n2) Check RSVP session along path: 'show rsvp session'\n3) Identify failure point: traceroute MPLS — where do MPLS labels stop?\n4) Check if bandwidth constraint can be satisfied: reduce BW constraint temporarily\n5) Check CSPF topology: is TE database current?\n6) Force re-signal: 'clear mpls traffic-eng tunnel' (use during maintenance)\n\n### Resolution\nFix broken link in path; reduce TE BW constraint; re-signal LSP; update CSPF topology; configure FRR (Fast Reroute) for protection.\n\n### Preventive Actions\nConfigure MPLS-TE FRR backup paths; monitor LSP state; CSPF topology consistency check; BW reservation monitoring.\n\n### Related Tools\nRSVP logs, MPLS-TE logs, SNMP, network topology tools",
    "problem": "Physical link failure along LSP path",
    "area": "MPLS",
    "remedyItems": [
      "Fix broken link in path",
      "reduce TE BW constraint",
      "re-signal LSP",
      "update CSPF topology",
      "configure FRR (Fast Reroute) for protection.",
      "Configure MPLS-TE FRR backup paths"
    ],
    "tags": [
      "mpls-te",
      "lsp",
      "rsvp",
      "traffic-engineering",
      "cspf",
      "frr",
      "label-switched-path"
    ],
    "linkedIntents": [
      "mpls.lsp_broken"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mpls-003",
    "title": "MPLS L3VPN routes are missing at PE — VRF routing table incomplete. How to diagnose?",
    "category": "Network",
    "subcategory": "MPLS",
    "content": "### Overview\nMPLS L3VPN routes are missing at PE — VRF routing table incomplete. How to diagnose?\n\n### Likely Causes\n- MP-BGP VPNv4 session not activated between PE routers\n- Route Target (RT) import/export mismatch — routes not imported to correct VRF\n- VRF not assigned to CE-facing interface\n- Route Distinguisher (RD) collision between different VPNs\n- CE not redistributing routes into VRF BGP/OSPF\n- Route reflector not propagating VPNv4 routes\n\n### Observability Signals\n- VRF routing table missing expected prefixes\n- MP-BGP VPNv4 table not showing CE routes\n- show bgp vpnv4 unicast all shows no routes from specific PE\n- CE cannot ping PE VRF interface\n- Traffic between sites black-holing\n\n### Recommended CLI Commands\nshow ip vrf\nshow bgp vpnv4 unicast all summary\nshow bgp vpnv4 unicast all neighbors <pe-peer> routes\nshow ip route vrf <name>\nshow ip vrf interfaces\nshow run | sec vrf\n\n### Step-by-Step RCA\n1) Check VRF exists and CE interface assigned: 'show ip vrf interfaces'\n2) Check CE is advertising routes into VRF: 'show ip route vrf <name>'\n3) Check MP-BGP: VPNv4 AFI active? 'show bgp vpnv4 unicast all summary'\n4) Check RT: does RT export on advertising PE match RT import on receiving PE?\n5) Check RR: is it propagating VPNv4 routes to all PEs?\n6) Check RD uniqueness: 'show bgp vpnv4 unicast all' for duplicate RDs\n\n### Resolution\nActivate VPNv4 AFI; align RT import/export; assign VRF to interface; fix CE redistribution; correct RD; fix RR propagation.\n\n### Preventive Actions\nDocument RT design; automate RT consistency checks; RD registry to prevent collisions; test VPN reachability post-provision.\n\n### Related Tools\nBGP logs, MPLS logs, SNMP, NMS VPN monitoring",
    "problem": "MP-BGP VPNv4 session not activated between PE routers",
    "area": "MPLS",
    "remedyItems": [
      "Activate VPNv4 AFI",
      "align RT import/export",
      "assign VRF to interface",
      "fix CE redistribution",
      "correct RD",
      "fix RR propagation."
    ],
    "tags": [
      "mpls-l3vpn",
      "vrf",
      "mp-bgp",
      "vpnv4",
      "route-target",
      "route-distinguisher",
      "route-reflector"
    ],
    "linkedIntents": [
      "mpls.vpn_route_missing"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-db-006",
    "title": "Database is refusing new connections — max connection limit reached. How to manage?",
    "category": "Database",
    "subcategory": "Connection Pool",
    "content": "### Overview\nDatabase is refusing new connections — max connection limit reached. How to manage?\n\n### Likely Causes\n- Application not using connection pooler (PgBouncer, ProxySQL)\n- Connections not being closed — application connection leak\n- Connection storm on application restart — all instances connecting simultaneously\n- max_connections too low for number of application instances\n- Long idle connections consuming slots without work\n- Prepared statement cache holding extra connections\n\n### Observability Signals\n- db_connections_count == db_max_connections\n- 'FATAL: sorry, too many clients already' (PostgreSQL)\n- 'Too many connections' (MySQL)\n- Application errors when acquiring new DB connection\n- Many idle connections in pg_stat_activity\n\n### Recommended CLI Commands\nSELECT count(*), state FROM pg_stat_activity GROUP BY state; (PG)\nSHOW STATUS LIKE 'Threads_connected'; (MySQL)\nSELECT application_name, count(*) FROM pg_stat_activity GROUP BY 1; (PG)\nSELECT * FROM pg_stat_activity WHERE state='idle' ORDER BY state_change;\ncheck PgBouncer status: psql -p 6432 pgbouncer -c 'show pools'\n\n### Step-by-Step RCA\n1) Count connections by state: idle vs active vs idle in transaction\n2) High idle connections: configure pool idle timeout; kill idle > 10min\n3) High 'idle in transaction': find long-running uncommitted transactions and kill\n4) Is PgBouncer/ProxySQL in use? If not: implement immediately\n5) Connection storm on restart: stagger application instance restarts\n6) Increase max_connections as emergency (requires restart for PostgreSQL)\n\n### Resolution\nDeploy PgBouncer in transaction mode; kill idle connections; fix connection leak; stagger app restarts; increase max_connections.\n\n### Preventive Actions\nAlways use connection pooler at scale; monitor connection count vs max; alert at 80%; implement connection timeouts.\n\n### Related Tools\nPgBouncer, ProxySQL, pg_stat_activity, MySQL processlist, Prometheus",
    "problem": "Application not using connection pooler (PgBouncer, ProxySQL)",
    "area": "Connection Pool",
    "remedyItems": [
      "Deploy PgBouncer in transaction mode",
      "kill idle connections",
      "fix connection leak",
      "stagger app restarts",
      "increase max_connections.",
      "Always use connection pooler at scale"
    ],
    "tags": [
      "db-connections",
      "max-connections",
      "pgbouncer",
      "connection-storm",
      "idle-connections",
      "postgresql",
      "mysql"
    ],
    "linkedIntents": [
      "db.connection_pool_exhausted"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-db-007",
    "title": "Deadlock frequency has spiked — transactions being rolled back frequently. How to diagnose and prevent?",
    "category": "Database",
    "subcategory": "Locking",
    "content": "### Overview\nDeadlock frequency has spiked — transactions being rolled back frequently. How to diagnose and prevent?\n\n### Likely Causes\n- Two transactions acquiring locks in different orders creating circular dependency\n- Long-running transaction holding locks and blocking newer transactions\n- Missing index causing full table scan acquiring too many row locks\n- Bulk insert/update locking entire table instead of row-level\n- Application retry logic not implementing backoff after deadlock\n- ORM generating lock-prone query patterns\n\n### Observability Signals\n- deadlock_count > 5 per minute\n- Application errors: 'Deadlock found when trying to get lock'\n- Transaction rollback rate increasing\n- Long-running transaction blocking others in pg_stat_activity\n- Lock wait timeout events in DB logs\n\n### Recommended CLI Commands\nSHOW ENGINE INNODB STATUS\\G (MySQL — shows last deadlock)\nSELECT * FROM pg_locks l JOIN pg_stat_activity a ON l.pid = a.pid; (PG blocking)\nSELECT * FROM information_schema.INNODB_TRX; (MySQL active transactions)\ncheck application logs for deadlock errors and transaction retry\nENABLE DEADLOCK LOGGING: log_lock_waits = on (PostgreSQL)\n\n### Step-by-Step RCA\n1) Extract deadlock details: MySQL InnoDB status or pg_locks\n2) Identify the two transactions and what locks they hold vs need\n3) Determine if lock ordering is inconsistent (Transaction A: row1 then row2; Transaction B: row2 then row1)\n4) Identify if missing index causing table-level locks\n5) Implement consistent lock ordering in application code\n6) Add retry with exponential backoff for deadlock errors\n\n### Resolution\nFix lock ordering; add missing index; break up bulk operations; implement retry with backoff; use SELECT FOR UPDATE SKIP LOCKED.\n\n### Preventive Actions\nReview transaction isolation level; add indexes before bulk operations; test for deadlocks in load testing; set lock timeout.\n\n### Related Tools\nMySQL InnoDB status, pg_locks, pg_stat_activity, APM, slow query log",
    "problem": "Two transactions acquiring locks in different orders creating circular dependency",
    "area": "Locking",
    "remedyItems": [
      "Fix lock ordering",
      "add missing index",
      "break up bulk operations",
      "implement retry with backoff",
      "use SELECT FOR UPDATE SKIP LOCKED.",
      "Review transaction isolation level"
    ],
    "tags": [
      "deadlock",
      "locking",
      "mysql",
      "postgresql",
      "transaction",
      "lock-order",
      "innodb",
      "retry"
    ],
    "linkedIntents": [
      "db.deadlock_spike"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-db-008",
    "title": "Database indexes are bloated — queries becoming slow despite indexes existing. How to detect and remediate?",
    "category": "Database",
    "subcategory": "Performance",
    "content": "### Overview\nDatabase indexes are bloated — queries becoming slow despite indexes existing. How to detect and remediate?\n\n### Likely Causes\n- High DELETE or UPDATE rate creating dead tuples (PostgreSQL) or fragmented pages\n- VACUUM/AUTOVACUUM not keeping up with dead tuple accumulation\n- Autovacuum scale factor too conservative for high-churn tables\n- MySQL InnoDB table fragmentation after large deletes\n- Index rebuild never scheduled on high-churn tables\n- Transaction ID wraparound forcing emergency VACUUM\n\n### Observability Signals\n- index_bloat_ratio > 50% on key indexes\n- Query performance degrading despite correct index usage\n- pg_stat_user_tables showing high n_dead_tup count\n- Table file size growing despite row count stable\n- Autovacuum running constantly but never catching up\n\n### Recommended CLI Commands\nSELECT schemaname, tablename, n_live_tup, n_dead_tup, last_autovacuum FROM pg_stat_user_tables ORDER BY n_dead_tup DESC; (PG)\nSELECT pg_size_pretty(pg_relation_size('<table>')); (PG)\nSELECT * FROM pgstattuple('<table>'); (pg_contrib)\nANALYZE VERBOSE <table>; (PG)\nOPTIMIZE TABLE <table>; (MySQL — rebuilds and defragments)\nSELECT * FROM information_schema.TABLES WHERE table_schema='<db>' ORDER BY data_free DESC;\n\n### Step-by-Step RCA\n1) Identify bloated tables: 'pg_stat_user_tables' — high n_dead_tup\n2) Check autovacuum: is it running on the table? When did it last run?\n3) Compare autovacuum_scale_factor to actual delete rate\n4) Run manual VACUUM ANALYZE as immediate relief\n5) Rebuild fragmented indexes: REINDEX CONCURRENTLY (PG) or OPTIMIZE TABLE (MySQL)\n6) For MySQL: check information_schema.TABLES.data_free for fragmented tables\n\n### Resolution\nRun VACUUM ANALYZE; REINDEX CONCURRENTLY; tune autovacuum per-table; OPTIMIZE TABLE (MySQL); schedule regular maintenance windows.\n\n### Preventive Actions\nMonitor n_dead_tup per table; tune autovacuum for high-churn tables; scheduled REINDEX for write-heavy indexes.\n\n### Related Tools\npg_stat_user_tables, pgstattuple, MySQL information_schema, Prometheus DB exporter",
    "problem": "High DELETE or UPDATE rate creating dead tuples (PostgreSQL) or fragmented pages",
    "area": "Performance",
    "remedyItems": [
      "Run VACUUM ANALYZE",
      "REINDEX CONCURRENTLY",
      "tune autovacuum per-table",
      "OPTIMIZE TABLE (MySQL)",
      "schedule regular maintenance windows.",
      "Monitor n_dead_tup per table"
    ],
    "tags": [
      "index-bloat",
      "vacuum",
      "autovacuum",
      "dead-tuples",
      "postgresql",
      "mysql",
      "fragmentation",
      "reindex"
    ],
    "linkedIntents": [
      "db.index_bloat"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mq-003",
    "title": "Kafka partition(s) are offline or under-replicated — producers and consumers failing. How to recover?",
    "category": "Middleware",
    "subcategory": "Queue Health",
    "content": "### Overview\nKafka partition(s) are offline or under-replicated — producers and consumers failing. How to recover?\n\n### Likely Causes\n- Broker hosting partition leader has crashed or is offline\n- Insufficient ISR (In-Sync Replicas) — min.insync.replicas not met\n- Unclean leader election required but disabled\n- Broker JVM OOM causing partition leader loss\n- Zookeeper/KRaft session expiry causing controller failover\n- Replication lag causing follower to fall out of ISR\n\n### Observability Signals\n- kafka_offline_partitions_count > 0\n- kafka_under_replicated_partitions > 0\n- Producer getting NotLeaderForPartition or NotEnoughReplicas errors\n- Consumer getting UNKNOWN_TOPIC_OR_PARTITION errors\n- Broker logs showing 'Partition is offline'\n\n### Recommended CLI Commands\nkafka-topics.sh --describe --topic <topic> --bootstrap-server <broker>\nkafka-topics.sh --describe --unavailable-partitions --bootstrap-server <broker>\nkafka-reassign-partitions.sh (for rebalancing)\nkafka-leader-election.sh --election-type preferred\ncheck broker logs: journalctl -u kafka\ncheck ZooKeeper/KRaft logs\n\n### Step-by-Step RCA\n1) Identify offline partitions: 'kafka-topics.sh --describe --unavailable-partitions'\n2) Is the broker hosting the offline partition leader down?\n3) If broker down: restart it and wait for partition to re-elect leader\n4) Check ISR: is ISR count >= min.insync.replicas?\n5) If ISR too small: restore offline broker to increase ISR\n6) Trigger preferred leader election after broker restored\n\n### Resolution\nRestart offline broker; reassign partitions to healthy brokers; trigger leader election; restore replication; adjust min.insync.replicas.\n\n### Preventive Actions\nReplication factor >= 3; monitor under-replicated partitions; alert on offline partitions; balanced partition distribution across brokers.\n\n### Related Tools\nKafka CLI tools, Kafka Manager, Prometheus JMX exporter, Confluent Control Center",
    "problem": "Broker hosting partition leader has crashed or is offline",
    "area": "Queue Health",
    "remedyItems": [
      "Restart offline broker",
      "reassign partitions to healthy brokers",
      "trigger leader election",
      "restore replication",
      "adjust min.insync.replicas.",
      "Replication factor >= 3"
    ],
    "tags": [
      "kafka",
      "partition-offline",
      "under-replicated",
      "isr",
      "broker-down",
      "leader-election",
      "min-insync"
    ],
    "linkedIntents": [
      "mq.partition_offline"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mq-004",
    "title": "Kafka consumer group lag is growing — messages accumulating in topic. How to reduce lag?",
    "category": "Middleware",
    "subcategory": "Queue Health",
    "content": "### Overview\nKafka consumer group lag is growing — messages accumulating in topic. How to reduce lag?\n\n### Likely Causes\n- Consumer processing logic too slow for message production rate\n- Consumer group stuck in rebalancing loop (too many joins/leaves)\n- Producer surge generating messages faster than consumers can process\n- Consumer fetch timeout too short causing excessive rebalancing\n- Insufficient consumer instances for partition count\n- Consumer blocked on downstream dependency (DB, API call)\n\n### Observability Signals\n- consumer_group_lag > threshold and growing\n- Kafka consumer group in REBALANCING state frequently\n- Consumer lag not decreasing even with consumers healthy\n- Consumer poll interval exceeding max.poll.interval.ms\n- Consumer CPU and throughput normal (not a processing bottleneck)\n\n### Recommended CLI Commands\nkafka-consumer-groups.sh --describe --group <group> --bootstrap-server <broker>\nkafka-consumer-groups.sh --describe --group <group> --bootstrap-server <broker> --verbose\ncheck consumer application metrics: messages_processed_per_sec\ncheck consumer logs for rebalancing events\nkafka-topics.sh --describe --topic <topic> (check partition count vs consumer count)\n\n### Step-by-Step RCA\n1) Check lag per partition: 'kafka-consumer-groups.sh --describe' — which partitions lagging most?\n2) Is consumer in REBALANCING? Indicates consumer joins/leaves frequently\n3) Compare consumer throughput vs producer throughput\n4) Is consumer downstream slow? Check DB or API latency\n5) Is consumer count < partition count? Scale consumers to match partitions\n6) Check max.poll.interval.ms vs actual processing time\n\n### Resolution\nScale consumer instances (max = partition count); optimize processing; fix downstream dependency; increase max.poll.interval.ms; fix rebalancing.\n\n### Preventive Actions\nLag alerting at acceptable threshold; consumer count >= partition count; load test consumer throughput vs expected producer rate.\n\n### Related Tools\nkafka-consumer-groups.sh, Prometheus JMX exporter, Burrow (lag monitor), Confluent Control Center",
    "problem": "Consumer processing logic too slow for message production rate",
    "area": "Queue Health",
    "remedyItems": [
      "Scale consumer instances (max = partition count)",
      "optimize processing",
      "fix downstream dependency",
      "increase max.poll.interval.ms",
      "fix rebalancing.",
      "Lag alerting at acceptable threshold"
    ],
    "tags": [
      "kafka",
      "consumer-lag",
      "consumer-group",
      "rebalancing",
      "lag",
      "throughput",
      "max-poll-interval"
    ],
    "linkedIntents": [
      "mq.consumer_group_lag"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  },
  {
    "id": "kb-mq-005",
    "title": "Dead letter queue (DLQ) is accumulating messages — what is causing messages to be dead-lettered?",
    "category": "Middleware",
    "subcategory": "Queue Health",
    "content": "### Overview\nDead letter queue (DLQ) is accumulating messages — what is causing messages to be dead-lettered?\n\n### Likely Causes\n- Poison message: malformed or unexpected payload crashing consumer\n- Schema change breaking consumer deserialization\n- Consumer bug throwing exception for valid messages\n- Max retry count exceeded — consumer repeatedly failing on message\n- Message TTL expired before consumer processed it\n- Authorization failure — consumer cannot access required resource\n\n### Observability Signals\n- dlq_message_count > threshold and growing\n- Consumer showing high rejection/nack rate\n- Consumer processing errors in application logs\n- Messages in DLQ with specific error type concentrated\n- Same consumer version started rejecting messages after deployment\n\n### Recommended CLI Commands\nrabbitmqctl list_queues name messages (check DLQ depth — RabbitMQ)\nkafka-console-consumer.sh --topic <dlq-topic> --from-beginning (sample DLQ messages)\naws sqs receive-message --queue-url <dlq-url> (AWS SQS DLQ)\ncheck consumer application error logs\ncompare DLQ message schema vs current consumer schema\ncheck message timestamps in DLQ (when were they sent?)\n\n### Step-by-Step RCA\n1) Sample DLQ messages: what is the payload? Any pattern?\n2) Check consumer error logs: what exception is thrown?\n3) Schema mismatch: is DLQ message in old format vs current consumer schema?\n4) Poison message: does one specific message format crash all consumers?\n5) Correlate DLQ accumulation start with deployments\n6) Move non-poison messages from DLQ to original queue after fix\n\n### Resolution\nFix consumer to handle message format; fix schema compatibility; fix consumer bug; replay DLQ messages after fix; purge true poison messages.\n\n### Preventive Actions\nAlert on DLQ depth > 0; schema registry with compatibility checks; test consumer with all historical message formats; DLQ message sampling.\n\n### Related Tools\nRabbitMQ management, Kafka CLI, AWS SQS, schema registry, consumer logs",
    "problem": "Poison message: malformed or unexpected payload crashing consumer",
    "area": "Queue Health",
    "remedyItems": [
      "Fix consumer to handle message format",
      "fix schema compatibility",
      "fix consumer bug",
      "replay DLQ messages after fix",
      "purge true poison messages.",
      "Alert on DLQ depth > 0"
    ],
    "tags": [
      "dlq",
      "dead-letter-queue",
      "poison-message",
      "schema-mismatch",
      "consumer-error",
      "retry",
      "deserialization"
    ],
    "linkedIntents": [
      "mq.dead_letter_full"
    ],
    "lastUpdated": "2026-03-25T00:00:00Z",
    "effectiveness": 85
  }
];

// Auto Remediation Permissions
export const mockRemediationPermissions: RemediationPermission[] = [
  {
    id: 'perm-001',
    name: 'Auto Restart Failed Services',
    description: 'Allow automatic restart of failed services after detection',
    category: 'Service Management',
    riskLevel: 'low',
    approved: true,
    approvedBy: 'admin@company.com',
    approvedAt: '2026-01-01T10:00:00Z'
  },
  {
    id: 'perm-002',
    name: 'Clear Connection Pools',
    description: 'Automatically clear and reset database connection pools when exhausted',
    category: 'Database',
    riskLevel: 'medium',
    approved: true,
    approvedBy: 'dba@company.com',
    approvedAt: '2025-12-28T14:30:00Z'
  },
  {
    id: 'perm-003',
    name: 'Failover To Secondary',
    description: 'Trigger automatic failover to secondary systems during primary outages',
    category: 'High Availability',
    riskLevel: 'high',
    approved: false
  },
  {
    id: 'perm-004',
    name: 'Scale Up Resources',
    description: 'Automatically scale compute resources during high load',
    category: 'Auto Scaling',
    riskLevel: 'medium',
    approved: true,
    approvedBy: 'ops@company.com',
    approvedAt: '2025-12-20T09:00:00Z'
  },
  {
    id: 'perm-005',
    name: 'Execute Playbooks',
    description: 'Allow execution of pre-defined remediation playbooks',
    category: 'Automation',
    riskLevel: 'medium',
    approved: false
  },
  {
    id: 'perm-006',
    name: 'Network Failover',
    description: 'Trigger network path failover during connectivity issues',
    category: 'Network',
    riskLevel: 'high',
    approved: false
  },
  {
    id: 'perm-007',
    name: 'Kill Runaway Processes',
    description: 'Automatically terminate processes consuming excessive resources',
    category: 'Process Management',
    riskLevel: 'medium',
    approved: true,
    approvedBy: 'ops@company.com',
    approvedAt: '2026-01-05T11:00:00Z'
  },
  {
    id: 'perm-008',
    name: 'Rollback Deployments',
    description: 'Automatically rollback to previous deployment on failure detection',
    category: 'Deployment',
    riskLevel: 'high',
    approved: false
  }
];
