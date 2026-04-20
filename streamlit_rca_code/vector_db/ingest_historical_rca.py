import os
import psycopg2
from psycopg2.extras import RealDictCursor
from sentence_transformers import SentenceTransformer
import uuid
from datetime import datetime, timedelta

from dotenv import load_dotenv, find_dotenv

# Load environment variables from .env file
load_dotenv(find_dotenv(usecwd=True))

POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "10.0.4.89")
POSTGRES_PORT = os.environ.get("POSTGRES_PORT", "5432")
POSTGRES_DB = os.environ.get("POSTGRES_DB", "infraondb")
POSTGRES_USER = os.environ.get("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "")
EMBEDING_MODEL = os.environ.get("EMBEDING_MODEL", "intfloat/e5-base-v2")

# Initialize 768-dim open-source embedding model
print(f"Loading 768-dim embedding model {EMBEDING_MODEL}...")
model = SentenceTransformer(EMBEDING_MODEL)
print("✅ Model loaded.")

# Sample RCA cases (realistic network incidents)
SAMPLE_CASES = [
    {
        "incident_id": "NET-2025-001",
        "device": "core-router-dc1",
        "interface": "Gi0/1/0",
        "situation_summary": "Interface Gi0/1/0 shows 96% utilization and 500 output queue drops during nightly backup window.",
        "root_cause_prediction": "Unthrottled backup traffic saturated the link due to missing QoS policy, causing tail drops and increased CPU.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Applied QoS shaping to limit backup traffic to 70% of interface capacity; scheduled backups during off-peak hours.",
        "confidence_score": 0.94
    },
    {
        "incident_id": "NET-2025-002",
        "device": "firewall-east",
        "interface": "eth1",
        "situation_summary": "High CPU (92%) and packet drops on firewall during traffic spike resembling DDoS pattern.",
        "root_cause_prediction": "Stateful inspection engine overwhelmed by high connection rate; conntrack table exhausted.",
        "intent": "performance",
        "subintent": "resource_exhaustion",
        "remediation": "Increased conntrack table size, enabled SYN flood protection, and added rate-limiting ACL.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-003",
        "device": "leaf-switch-05",
        "interface": "Te1/0/1",
        "situation_summary": "Intermittent CRC errors and interface flapping on Te1/0/1 after recent fiber patch.",
        "root_cause_prediction": "Faulty fiber patch cable causing signal degradation and physical layer errors.",
        "intent": "connectivity",
        "subintent": "physical_layer",
        "remediation": "Replaced fiber patch cable and cleaned SFP connectors; errors ceased immediately.",
        "confidence_score": 0.97
    },
    {
        "incident_id": "NET-2025-004",
        "device": "core-router-dc1",
        "interface": "Gi0/1/0",
        "situation_summary": "Sustained 85% utilization and rising latency on Gi0/1/0; correlated with new video streaming service rollout.",
        "root_cause_prediction": "Unexpected traffic pattern from new application overwhelmed link capacity; no traffic shaping applied.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Added application-aware QoS policy to prioritize critical services; upgraded link to 10G.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-301",
        "device": "core-router-dc1",
        "interface": "Te0/1/0",
        "situation_summary": "Interface operational status down; admin status up. No optical signal detected.",
        "root_cause_prediction": "Loss of signal (LOS) indicated by oper_status=down and admin_status=up; consistent with optical path failure.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Replaced fiber patch cable; verified RX power > -10 dBm and stable link.",
        "confidence_score": 0.96
    },
    {
        "incident_id": "NET-2025-302",
        "device": "access-switch-07",
        "interface": "Gi1/0/15",
        "situation_summary": "Interface down with no link pulses; switch logs show 'interface Gi1/0/15 changed state to down'.",
        "root_cause_prediction": "Physical disconnection or transceiver failure, evidenced by oper_status=down and absence of physical layer signal.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Re-seated SFP; link restored. Monitored for 24h with zero flaps.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-303",
        "device": "edge-router-b2b",
        "interface": "Gi0/0/3",
        "situation_summary": "WAN interface down; transceiver diagnostics show Rx power = -Inf dBm.",
        "root_cause_prediction": "Optical signal loss due to fiber break or remote transmitter failure, confirmed by oper_status=down and null RX power.",
        "intent": "link",
        "subintent": "down",
        "remediation": "ISP confirmed fiber cut; restored via alternate path. Validated with ping and BFD.",
        "confidence_score": 0.95
    },
    {
        "incident_id": "NET-2025-304",
        "device": "firewall-central",
        "interface": "eth4",
        "situation_summary": "Interface down; logs indicate 'link state down' with no carrier detect.",
        "root_cause_prediction": "Layer 1 failure evidenced by oper_status=down despite admin_status=up; no L1 keepalives received.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Swapped interface cable and tested with loopback; replaced faulty SFP.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-305",
        "device": "leaf-switch-11",
        "interface": "Te2/0/8",
        "situation_summary": "Interface down; system logs show 'LOS' and 'transceiver not functional'.",
        "root_cause_prediction": "SFP module failure confirmed by log keyword 'transceiver' and oper_status=down with admin_status=up.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Replaced SFP with vendor-qualified module; interface stabilized.",
        "confidence_score": 0.94
    },
    {
        "incident_id": "NET-2025-306",
        "device": "dist-switch-09",
        "interface": "Gi3/0/5",
        "situation_summary": "Interface flapping 4 times in 10 minutes; logs show 'changed state to down/up' repeatedly.",
        "root_cause_prediction": "Loose physical connection or marginal optical signal, supported by flap_count > 3 and log pattern 'changed state to down'.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Re-terminated fiber connector; flaps ceased. Confirmed with interface stability test.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-307",
        "device": "router-isp-peer",
        "interface": "Gi0/1/1",
        "situation_summary": "Interface flapping during traffic bursts; logs show duplex-related errors.",
        "root_cause_prediction": "Speed/duplex negotiation mismatch, indicated by oper_changes_per_min > 1 and log keyword 'duplex'.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Hard-coded speed/duplex to 1000/full on both ends; flapping stopped.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-308",
        "device": "core-switch-dc2",
        "interface": "Te1/1/12",
        "situation_summary": "Uplink flapping; transceiver RX power fluctuating between -12 dBm and -18 dBm.",
        "root_cause_prediction": "Marginal optical budget causing intermittent link loss, evidenced by repeated state changes and RX power near threshold.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Cleaned connectors and replaced patch cable; RX power stabilized at -8 dBm.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-309",
        "device": "access-switch-12",
        "interface": "Gi1/0/20",
        "situation_summary": "Flapping every 2–3 minutes; logs show no errors but repeated link transitions.",
        "root_cause_prediction": "Control-plane overload or spanning-tree instability triggering interface resets.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Optimized STP timers and increased control-plane policing; flaps reduced to zero.",
        "confidence_score": 0.85
    },
    {
        "incident_id": "NET-2025-310",
        "device": "leaf-switch-14",
        "interface": "Po24",
        "situation_summary": "Port flapping with log entries 'bpduguard detected on Gi1/0/24'; interface err-disabled.",
        "root_cause_prediction": "Unexpected BPDUs received on access port, triggering BPDU guard shutdown.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Enabled portfast and verified no switch misconnected; cleared error-disabled state.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-311",
        "device": "wan-router-hq",
        "interface": "Gi0/0/2",
        "situation_summary": "DSL interface flapping; line logs show SNR margin < 5 dB during events.",
        "root_cause_prediction": "Line noise degrading physical layer stability, evidenced by repeated flaps and low SNR margin.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "ISP reprofiled line for noise tolerance; migrated to fiber within SLA window.",
        "confidence_score": 0.86
    },
    {
        "incident_id": "NET-2025-312",
        "device": "core-router-dc1",
        "interface": "Te0/2/1",
        "situation_summary": "CRC errors exceeding 200/hour; no link flaps. RX optical power stable.",
        "root_cause_prediction": "Frame corruption due to EMI or timing issues, supported by in_errors > 100 and log keyword 'crc error'.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Replaced with shielded fiber and validated signal integrity; errors dropped to zero.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-313",
        "device": "dist-switch-05",
        "interface": "Gi2/0/18",
        "situation_summary": "Output discards increasing under load; logs show 'queue full' during peak traffic.",
        "root_cause_prediction": "Egress congestion causing buffer overflow, indicated by out_discards > 100 and log pattern 'queue full'.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Increased egress queue depth and enabled QoS shaping; discards eliminated.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-314",
        "device": "leaf-switch-09",
        "interface": "Te1/0/6",
        "situation_summary": "Input errors spiking; correlated with server-side TCP retransmits.",
        "root_cause_prediction": "Asymmetric routing or NIC offload misbehavior causing malformed frames, evidenced by rising in_errors.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Disabled TSO/GRO on server; errors normalized. Verified with packet capture.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-315",
        "device": "firewall-east",
        "interface": "eth2",
        "situation_summary": "High input errors during DDoS mitigation; logs show 'packet dropped: invalid checksum'.",
        "root_cause_prediction": "Malformed attack packets overwhelming input validation, causing checksum errors.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Enhanced early-drop policies in ingress ACL; reduced malformed traffic upstream.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-316",
        "device": "router-pe-02",
        "interface": "Gi0/3/0",
        "situation_summary": "Frame errors increasing with multicast traffic volume.",
        "root_cause_prediction": "Insufficient buffer allocation for multicast replication, leading to frame truncation and errors.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Increased multicast replication buffer pool; errors resolved under load test.",
        "confidence_score": 0.84
    },
    {
        "incident_id": "NET-2025-317",
        "device": "core-switch-dc3",
        "interface": "Hu1/0/4",
        "situation_summary": "CRC errors observed only during 40G→10G breakout operation.",
        "root_cause_prediction": "Breakout cable or port-group misconfiguration causing signal integrity issues on sub-lanes.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Replaced breakout cable with certified model; validated per-lane BER < 1e-12.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-318",
        "device": "wan-router-hq",
        "interface": "Gi0/1/0",
        "situation_summary": "Utilization at 95%; output discards > 500/min during business hours.",
        "root_cause_prediction": "Link oversubscription without QoS, evidenced by utilization_percent > 90 and out_discards > 0 with log 'tail drop'.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Applied hierarchical QoS to prioritize voice and video; scheduled bulk syncs off-peak.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-319",
        "device": "core-router-dc2",
        "interface": "Te0/0/3",
        "situation_summary": "Sustained 92% utilization; latency spikes to 180ms. NetFlow shows unclassified bulk traffic.",
        "root_cause_prediction": "Unshaped application traffic saturating link, supported by high utilization and absence of DSCP marking.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Deployed application-aware QoS and DSCP classification; upgraded to 25G link.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-320",
        "device": "dist-switch-11",
        "interface": "Po1",
        "situation_summary": "Uplink congestion during video conferencing peak; output queue drops logged.",
        "root_cause_prediction": "Insufficient egress capacity for real-time traffic burst, indicated by utilization > 90% and 'buffer full' logs.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Enabled CoS-based queuing and increased uplink bandwidth via LACP.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-321",
        "device": "edge-router-cloud",
        "interface": "Gi0/2/1",
        "situation_summary": "Utilization spikes to 98% every night at 2 AM; discards correlate with backup jobs.",
        "root_cause_prediction": "Scheduled backup traffic overwhelming link without rate control, supported by periodic congestion pattern.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Throttled backup streams to 70% of link capacity using traffic shaping.",
        "confidence_score": 0.94
    },
    {
        "incident_id": "NET-2025-322",
        "device": "firewall-central",
        "interface": "eth3",
        "situation_summary": "High output discards during file transfer window; logs show 'queue full' in slow-path engine.",
        "root_cause_prediction": "Firewall inspection pipeline bottleneck causing egress congestion, evidenced by discards despite moderate link utilization.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Optimized session timeout and enabled fast-path for trusted flows; discards reduced by 98%.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-323",
        "device": "leaf-switch-20",
        "interface": "Te2/0/1",
        "situation_summary": "Inter-leaf link at 94% utilization; microbursts causing transient packet loss.",
        "root_cause_prediction": "East-west traffic burstiness exceeding buffer capacity, supported by utilization > 90% and intermittent drops.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Enabled larger ingress buffers and ECN marking; validated with iPerf3 burst tests.",
        "confidence_score": 0.86
    },
    {
        "incident_id": "NET-2025-324",
        "device": "router-branch-05",
        "interface": "Gi0/0/1",
        "situation_summary": "Link saturated by SaaS traffic; no QoS applied. Output discards logged hourly.",
        "root_cause_prediction": "Lack of traffic classification leading to best-effort congestion, indicated by out_discards > 0 and log 'tail drop'.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Implemented class-based shaping for SaaS vs. critical apps; validated with synthetic traffic.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-325",
        "device": "core-router-dc1",
        "interface": "Hu1/1/0",
        "situation_summary": "100G link hitting 96% utilization during database replication; latency-sensitive apps impacted.",
        "root_cause_prediction": "Replication traffic not rate-limited, causing congestion for latency-sensitive flows.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Applied MQC policy to cap replication at 80G; prioritized OLTP traffic.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-326",
        "device": "border-router-isp1",
        "interface": "Gi0/0/0",
        "situation_summary": "BGP session down with peer 198.51.100.2; keepalives not received.",
        "root_cause_prediction": "BGP peer unreachable or transport failure, confirmed by bgp_session_state=down and log 'BGP-5-ADJCHANGE: neighbor down'.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Restored underlying IGP reachability; BGP session re-established automatically.",
        "confidence_score": 0.95
    },
    {
        "incident_id": "NET-2025-327",
        "device": "core-router-dc2",
        "interface": "Loopback0",
        "situation_summary": "iBGP session flapping; TCP connection reset every 90 seconds.",
        "root_cause_prediction": "MTU mismatch causing BGP UPDATE fragmentation and TCP drops, evidenced by session instability and PMTUD failure logs.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Aligned MTU across loopback and physical interfaces; enabled 'bgp transport path-mtu-discovery'.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-328",
        "device": "pe-router-mpls",
        "interface": "Gi0/1/2",
        "situation_summary": "eBGP session down after config deploy; logs show 'invalid MD5 digest'.",
        "root_cause_prediction": "BGP authentication key mismatch, confirmed by log keyword 'neighbor down' and auth failure.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Synchronized BGP key with peer; session restored.",
        "confidence_score": 0.96
    },
    {
        "incident_id": "NET-2025-329",
        "device": "edge-router-cloud",
        "interface": "Gi0/3/1",
        "situation_summary": "BGP session to AWS Direct Connect down; health check failed.",
        "root_cause_prediction": "Underlying Layer 2 path failure causing BGP transport loss, supported by bgp_session_state=down.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Failover to secondary DX connection; primary path restored by AWS.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-330",
        "device": "route-reflector-01",
        "interface": "Loopback0",
        "situation_summary": "Multiple client sessions dropped simultaneously; CPU spike observed.",
        "root_cause_prediction": "Control-plane overload causing BGP session timeouts, evidenced by bgp_session_state=down and high CPU logs.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Optimized BGP update groups and reduced route churn; sessions stabilized.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-331",
        "device": "firewall-central",
        "interface": "N/A",
        "situation_summary": "CPU at 92%; UI unresponsive. Logs show 'high cpu utilization by inspect process'.",
        "root_cause_prediction": "Deep packet inspection on unfiltered traffic overwhelming CPU, confirmed by cpu_percent > 80 and log 'high cpu'.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Excluded trusted zones from full inspection; CPU stabilized at 45%.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-332",
        "device": "router-core-01",
        "interface": "N/A",
        "situation_summary": "CPU sustained at 88%; BGP updates delayed. Process list shows 'ipv4_rib' at 60%.",
        "root_cause_prediction": "Routing table churn causing RIB process overload, supported by cpu_percent > 80 and process logs.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Implemented route summarization and dampening; CPU reduced to 30%.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-333",
        "device": "sdwan-edge-10",
        "interface": "N/A",
        "situation_summary": "CPU spikes to 95% during policy lookup; application-aware routing enabled.",
        "root_cause_prediction": "Excessive DPI and policy complexity overloading control plane, evidenced by cpu_percent > 80.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Simplified application policies and disabled unused features; CPU normalized.",
        "confidence_score": 0.86
    },
    {
        "incident_id": "NET-2025-334",
        "device": "switch-n9k-05",
        "interface": "N/A",
        "situation_summary": "CPU at 83%; SNMP polling timeouts. Logs indicate 'process snmpd consuming 40% CPU'.",
        "root_cause_prediction": "Excessive SNMP polling interval causing daemon overload, confirmed by high CPU and process logs.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Increased polling interval from 10s to 60s; CPU dropped to 25%.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-335",
        "device": "wireless-controller",
        "interface": "N/A",
        "situation_summary": "CPU at 87% during client roam events; APs report delayed responses.",
        "root_cause_prediction": "High client mobility overwhelming mobility protocol processing, supported by cpu_percent > 80 during roam spikes.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Distributed client load across controllers; optimized mobility group settings.",
        "confidence_score": 0.85
    },
    {
        "incident_id": "NET-2025-336",
        "device": "firewall-east",
        "interface": "N/A",
        "situation_summary": "Memory at 89%; conntrack table near capacity. Logs show 'memory usage high'.",
        "root_cause_prediction": "Connection tracking table growth exhausting available memory, confirmed by mem_percent > 80 and log 'memory'.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Increased conntrack table size and tuned TCP timeouts; memory stabilized at 60%.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-337",
        "device": "router-pe-04",
        "interface": "N/A",
        "situation_summary": "Memory usage at 85%; BGP RIB holds 1.2M routes. Logs indicate 'route memory allocation high'.",
        "root_cause_prediction": "Full internet routing table consuming memory beyond provisioned capacity.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Deployed route summarization and filtered full-table from non-core peers; memory reduced to 65%.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-338",
        "device": "sdwan-edge-08",
        "interface": "N/A",
        "situation_summary": "Memory at 83%; OOM killer terminated logging process.",
        "root_cause_prediction": "Memory leak in telemetry agent after software upgrade, evidenced by steady memory growth and 'oom' logs.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Applied vendor patch for known memory leak; memory usage flatlined post-fix.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-339",
        "device": "switch-leaf-25",
        "interface": "N/A",
        "situation_summary": "Memory at 81%; TCAM utilization at 95%. FIB incomplete.",
        "root_cause_prediction": "Excessive ACL and VLAN scale exhausting data-plane memory, confirmed by mem_percent > 80.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Optimized ACLs and reduced VLAN count; freed TCAM and memory.",
        "confidence_score": 0.86
    },
    {
        "incident_id": "NET-2025-340",
        "device": "controller-apic",
        "interface": "N/A",
        "situation_summary": "Memory usage at 87%; REST API responses delayed. Logs show 'high memory in policy engine'.",
        "root_cause_prediction": "Policy scale exceeding controller memory allocation, supported by mem_percent > 80 and service degradation.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Scaled out controller cluster; redistributed policy load.",
        "confidence_score": 0.84
    },
    {
        "incident_id": "NET-2025-341",
        "device": "core-switch-dc1",
        "interface": "N/A",
        "situation_summary": "Chassis temperature at 74°C; fans at 100%. Logs show 'temperature alarm: critical'.",
        "root_cause_prediction": "Inadequate airflow due to blocked intake, confirmed by temp_c > 70 and log 'temperature alarm'.",
        "intent": "system",
        "subintent": "device_overheat",
        "remediation": "Cleared front-panel obstruction and validated airflow; temperature normalized to 42°C.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-342",
        "device": "router-isp-edge",
        "interface": "N/A",
        "situation_summary": "CPU die temperature at 78°C; thermal throttling active. Logs: 'fan failure on PSU2'.",
        "root_cause_prediction": "Fan module failure reducing cooling capacity, evidenced by temp_c > 70 and log 'fan failure'.",
        "intent": "system",
        "subintent": "device_overheat",
        "remediation": "Replaced faulty PSU/fan unit; temperature dropped to 55°C.",
        "confidence_score": 0.95
    },
    {
        "incident_id": "NET-2025-343",
        "device": "firewall-west",
        "interface": "N/A",
        "situation_summary": "System temperature at 72°C; packet forwarding rate degraded. No fan fault logged.",
        "root_cause_prediction": "Ambient temperature exceedance in rack environment causing thermal stress.",
        "intent": "system",
        "subintent": "device_overheat",
        "remediation": "Worked with DC team to improve hot/cold aisle containment; temperature stabilized.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-344",
        "device": "ddos-mitigation-fw",
        "interface": "eth0",
        "situation_summary": "Inbound PPS at 1.4M; CPU at 95%. Logs: 'detected SYN flood attack'.",
        "root_cause_prediction": "High-volume SYN flood overwhelming connection table, confirmed by pps_rate > 1M and log 'flood'.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Activated SYN cookie and rate-limiting ACL; traffic scrubbed via cloud provider.",
        "confidence_score": 0.97
    },
    {
        "incident_id": "NET-2025-345",
        "device": "border-router-isp1",
        "interface": "Gi0/0/1",
        "situation_summary": "Traffic volume 10x baseline; NetFlow shows NTP amplification pattern.",
        "root_cause_prediction": "Reflected amplification attack targeting public NTP server, evidenced by PPS spike and log 'attack'.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Blackholed victim IP at edge; disabled open NTP reflector.",
        "confidence_score": 0.94
    },
    {
        "incident_id": "NET-2025-346",
        "device": "firewall-central",
        "interface": "eth1",
        "situation_summary": "Connection rate at 50K/s; conntrack table exhausted. Logs: 'possible DDoS'.",
        "root_cause_prediction": "Connection exhaustion attack overwhelming stateful engine, supported by high PPS and 'attack' log pattern.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Enabled connection rate limiting and SYN proxy; mitigated impact.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-347",
        "device": "cloud-edge-router",
        "interface": "Gi0/2/0",
        "situation_summary": "Sustained 80 Gbps flood from spoofed IPs; upstream ISP notified.",
        "root_cause_prediction": "Volumetric UDP flood targeting web service, confirmed by pps_rate > 1M and traffic pattern.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Diverted traffic to cloud scrubbing center; clean traffic reinjected.",
        "confidence_score": 0.96
    },
    {
        "incident_id": "NET-2025-348",
        "device": "waf-appliance",
        "interface": "eth0",
        "situation_summary": "HTTP request rate at 200K RPS; legitimate users blocked. Logs: 'layer 7 attack detected'.",
        "root_cause_prediction": "Application-layer DDoS using HTTP floods, evidenced by high RPS and 'attack' logs.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Deployed JS challenge and rate-based WAF rules; legitimate traffic restored.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-349",
        "device": "mystery-router-alpha",
        "interface": "Gi0/1/0",
        "situation_summary": "Intermittent 100ms latency spikes; no correlation with CPU, memory, or interface metrics.",
        "root_cause_prediction": "Insufficient telemetry coverage; possible hypervisor or NIC driver issue not captured by current signals.",
        "intent": "unknown",
        "subintent": "low_confidence",
        "remediation": "Enabled extended NetFlow, CPU profiling, and NIC counters for deeper analysis.",
        "confidence_score": 0.55
    },
    {
        "incident_id": "NET-2025-350",
        "device": "switch-legacy-03",
        "interface": "Gi1/0/5",
        "situation_summary": "Random packet drops observed; all counters normal. No log patterns match known hypotheses.",
        "root_cause_prediction": "Firmware bug or hardware defect with no observable signal correlation; combined_score below threshold.",
        "intent": "unknown",
        "subintent": "low_confidence",
        "remediation": "Scheduled hardware diagnostics and firmware upgrade during maintenance window.",
        "confidence_score": 0.52
    },
    {
        "incident_id": "NET-2025-401",
        "device": "spine-switch-02",
        "interface": "Te1/0/16",
        "situation_summary": "Interface operational status down; admin status up. Transceiver reports 'Rx power: invalid'.",
        "root_cause_prediction": "Optical receiver failure or disconnected fiber, evidenced by oper_status=down, admin_status=up, and log keyword 'LOS'.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Replaced SFP+ module and validated optical power; link restored.",
        "confidence_score": 0.95
    },
    {
        "incident_id": "NET-2025-402",
        "device": "router-pe-07",
        "interface": "Gi0/3/2",
        "situation_summary": "WAN interface down; no carrier detected. Remote end unreachable via L2 ping.",
        "root_cause_prediction": "Layer 1 path failure confirmed by oper_status=down with admin_status=up and absence of physical signal.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Coordinated with carrier; fiber cut repaired at manhole 45B.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-403",
        "device": "firewall-dmz",
        "interface": "eth5",
        "situation_summary": "Interface down; system logs show 'interface eth5: link state down'. No error counters.",
        "root_cause_prediction": "Peer device interface disabled or misconfigured, causing unidirectional link failure.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Enabled interface on peer and verified LACP; link synchronized.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-404",
        "device": "access-switch-18",
        "interface": "Gi1/0/8",
        "situation_summary": "Interface down; SFP diagnostics indicate 'temperature out of range' and 'bias current fault'.",
        "root_cause_prediction": "Transceiver hardware fault, supported by oper_status=down and log pattern 'module failure'.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Swapped SFP with qualified spare; interface stabilized.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-405",
        "device": "core-router-dc4",
        "interface": "Hu2/1/0",
        "situation_summary": "100G interface down; both ends report 'no light'. OTDR shows break at 12.3 km.",
        "root_cause_prediction": "Fiber cut in backbone segment, confirmed by LOS on both ends and OTDR trace.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Spliced fiber at fault location; RX power restored to -4.1 dBm.",
        "confidence_score": 0.97
    },
    {
        "incident_id": "NET-2025-406",
        "device": "leaf-switch-31",
        "interface": "Te2/0/9",
        "situation_summary": "Interface flapping every 45–90 seconds; logs show 'Gi2/0/9 changed state to down'.",
        "root_cause_prediction": "Marginal optical signal causing intermittent link loss, supported by flap_count > 3 and log keyword 'changed state to down'.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Cleaned connectors and replaced patch cable; monitored 48h with no flaps.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-407",
        "device": "dist-switch-14",
        "interface": "Gi3/0/11",
        "situation_summary": "Flapping with log entries 'duplex mismatch' and speed negotiation toggling.",
        "root_cause_prediction": "Auto-negotiation instability due to non-compliant NIC, evidenced by oper_changes_per_min > 1 and log 'duplex'.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Hard-coded speed/duplex to 1000/full; flapping ceased.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-408",
        "device": "router-branch-12",
        "interface": "Gi0/0/1",
        "situation_summary": "DSL interface flapping; line logs show frequent 'retrain' events and low SNR.",
        "root_cause_prediction": "Copper line interference causing physical layer instability, supported by repeated state changes.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "ISP installed noise filter; migrated to LTE backup until fiber available.",
        "confidence_score": 0.85
    },
    {
        "incident_id": "NET-2025-409",
        "device": "core-switch-dc1",
        "interface": "Po12",
        "situation_summary": "Port-channel member flapping; LACP PDUs missed during high CPU periods.",
        "root_cause_prediction": "Control-plane overload causing LACP timeout, evidenced by flap events during CPU spikes.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Optimized CoPP to protect LACP traffic; flaps eliminated.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-410",
        "device": "wireless-ap-67",
        "interface": "eth0",
        "situation_summary": "AP uplink flapping; switch logs show 'bpduguard: Gi1/0/22 err-disabled'.",
        "root_cause_prediction": "Unexpected BPDUs from misconnected switch triggering protection shutdown.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Enabled portfast on access port; cleared error-disabled state.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-411",
        "device": "edge-router-cloud",
        "interface": "Gi0/2/3",
        "situation_summary": "Interface flapping during AWS Direct Connect health check failures.",
        "root_cause_prediction": "Underlying virtual circuit instability in cloud provider infrastructure.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "AWS identified and resolved VIF misconfiguration; link stabilized.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-412",
        "device": "core-router-dc2",
        "interface": "Te0/1/5",
        "situation_summary": "CRC errors exceeding 300/hour; RX power stable at -6 dBm.",
        "root_cause_prediction": "Electromagnetic interference on fiber path or timing skew, supported by in_errors > 100 and log 'crc error'.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Re-routed fiber away from power conduits; errors dropped to zero.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-413",
        "device": "firewall-east",
        "interface": "eth3",
        "situation_summary": "Output discards rising linearly with throughput; logs show 'queue full' during peak.",
        "root_cause_prediction": "Egress congestion causing buffer exhaustion, evidenced by out_discards > 100 and log 'queue full'.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Increased egress queue depth and enabled QoS shaping.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-414",
        "device": "leaf-switch-28",
        "interface": "Te1/0/7",
        "situation_summary": "Input errors spiking during large file transfers; server NIC using TSO.",
        "root_cause_prediction": "NIC offload feature generating oversized frames exceeding MTU, causing truncation.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Disabled TSO on server; errors normalized under load test.",
        "confidence_score": 0.86
    },
    {
        "incident_id": "NET-2025-415",
        "device": "router-pe-09",
        "interface": "Gi0/1/4",
        "situation_summary": "Frame errors increasing with multicast replication load.",
        "root_cause_prediction": "Insufficient buffer allocation for replication engine, leading to frame corruption.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Increased multicast buffer pool; validated with 10G multicast stream.",
        "confidence_score": 0.84
    },
    {
        "incident_id": "NET-2025-416",
        "device": "dist-switch-17",
        "interface": "Gi2/0/19",
        "situation_summary": "CRC errors only during 5G wireless backhaul bursts.",
        "root_cause_prediction": "Microburst traffic exceeding switch ingress buffer, causing frame corruption.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Enabled larger ingress buffers and ECN marking; errors resolved.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-417",
        "device": "core-switch-dc3",
        "interface": "Hu1/0/2",
        "situation_summary": "Errors observed on breakout interface Gi1/0/2:1; other lanes clean.",
        "root_cause_prediction": "Faulty breakout cable lane or port-group misconfiguration.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Replaced breakout cable with certified model; per-lane errors eliminated.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-418",
        "device": "wan-router-hq",
        "interface": "Gi0/1/1",
        "situation_summary": "Utilization at 96%; output discards > 800/min. Logs: 'tail drop on Gi0/1/1'.",
        "root_cause_prediction": "Link oversubscription without traffic shaping, supported by utilization_percent > 90 and log 'tail drop'.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Applied hierarchical QoS with priority queuing for voice/video.",
        "confidence_score": 0.94
    },
    {
        "incident_id": "NET-2025-419",
        "device": "core-router-dc1",
        "interface": "Te0/0/4",
        "situation_summary": "Latency spikes to 200ms during nightly ETL; NetFlow shows unclassified bulk traffic.",
        "root_cause_prediction": "Unmanaged ETL traffic saturating link, evidenced by sustained high utilization and lack of DSCP marking.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Throttled ETL jobs to 70% of link capacity using traffic policer.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-420",
        "device": "leaf-switch-35",
        "interface": "Te2/0/5",
        "situation_summary": "Inter-leaf link at 93% utilization; microbursts causing packet loss.",
        "root_cause_prediction": "East-west traffic burstiness exceeding buffer capacity, supported by utilization > 90% and intermittent drops.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Enabled larger buffers and PFC for lossless fabric; validated with RDMA traffic.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-421",
        "device": "firewall-central",
        "interface": "eth2",
        "situation_summary": "High output discards during SaaS sync; logs show 'slow-path queue full'.",
        "root_cause_prediction": "Firewall inspection pipeline bottleneck causing egress congestion.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Optimized session table and enabled fast-path for trusted SaaS IPs.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-422",
        "device": "router-branch-09",
        "interface": "Gi0/0/2",
        "situation_summary": "Link saturated by cloud backup; no QoS applied. Discards logged hourly.",
        "root_cause_prediction": "Lack of traffic classification leading to congestion, evidenced by out_discards > 0 and log 'tail drop'.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Implemented class-based shaping for backup vs. real-time traffic.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-423",
        "device": "dist-switch-20",
        "interface": "Po1",
        "situation_summary": "Uplink congestion during Zoom peak; output queue drops logged.",
        "root_cause_prediction": "Insufficient egress capacity for real-time burst, supported by 'buffer full' logs and high utilization.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Enabled CoS-based queuing and increased uplink bandwidth via LACP.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-424",
        "device": "edge-router-cloud",
        "interface": "Gi0/3/0",
        "situation_summary": "Utilization spikes to 97% during database replication to cloud.",
        "root_cause_prediction": "Replication traffic not rate-limited, causing congestion for critical apps.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Applied MQC policy to cap replication at 8 Gbps; prioritized OLTP.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-425",
        "device": "core-router-dc2",
        "interface": "Hu1/2/1",
        "situation_summary": "100G link at 95% utilization; latency-sensitive apps impacted during ML training sync.",
        "root_cause_prediction": "Unshaped distributed training traffic overwhelming link capacity.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Deployed application-aware QoS with DSCP marking for training jobs.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-426",
        "device": "border-router-isp2",
        "interface": "Gi0/0/1",
        "situation_summary": "BGP session down with peer 203.0.113.25; TCP connection reset.",
        "root_cause_prediction": "Transport layer failure or peer reboot, confirmed by bgp_session_state=down and log 'BGP-5-ADJCHANGE: neighbor down'.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Peer recovered automatically; session re-established after 90s hold timer.",
        "confidence_score": 0.95
    },
    {
        "incident_id": "NET-2025-427",
        "device": "route-reflector-02",
        "interface": "Loopback0",
        "situation_summary": "Multiple iBGP sessions dropped; logs show 'BGP hold timer expired'.",
        "root_cause_prediction": "Control-plane overload delaying keepalive processing, evidenced by bgp_session_state=down during CPU spike.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Optimized BGP update groups; reduced route churn from edge peers.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-428",
        "device": "pe-router-mpls",
        "interface": "Gi0/2/0",
        "situation_summary": "eBGP session down after config push; logs: 'BGP authentication failure'.",
        "root_cause_prediction": "MD5 key mismatch with peer, confirmed by log 'neighbor down' and auth error.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Synchronized BGP password with peer; session restored.",
        "confidence_score": 0.96
    },
    {
        "incident_id": "NET-2025-429",
        "device": "core-router-dc3",
        "interface": "Loopback0",
        "situation_summary": "BGP session to route server down; IGP route to peer missing.",
        "root_cause_prediction": "Underlying IGP convergence failure causing BGP transport loss.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Fixed OSPF adjacency; BGP session re-established automatically.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-430",
        "device": "edge-router-azure",
        "interface": "Gi0/1/3",
        "situation_summary": "BGP session to Azure ExpressRoute down; health probe failed.",
        "root_cause_prediction": "Cloud provider virtual circuit misconfiguration causing BGP transport failure.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Azure support corrected VRF association; session restored.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-431",
        "device": "firewall-west",
        "interface": "N/A",
        "situation_summary": "CPU at 94%; logs show 'high cpu utilization by ips_engine'.",
        "root_cause_prediction": "Intrusion prevention system scanning all traffic without exclusions, confirmed by cpu_percent > 80 and log 'high cpu'.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Excluded trusted subnets from deep inspection; CPU stabilized at 50%.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-432",
        "device": "router-core-03",
        "interface": "N/A",
        "situation_summary": "CPU at 89%; RIB process consuming 65%. Logs: 'route update storm'.",
        "root_cause_prediction": "BGP flapping from peer causing excessive RIB processing, supported by high CPU and process logs.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Applied BGP dampening; CPU reduced to 35%.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-433",
        "device": "sdwan-edge-15",
        "interface": "N/A",
        "situation_summary": "CPU spikes to 91% during policy lookup for SaaS traffic.",
        "root_cause_prediction": "Excessive DPI and application classification overloading data plane.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Simplified policy and cached SaaS FQDNs; CPU normalized.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-434",
        "device": "switch-n9k-12",
        "interface": "N/A",
        "situation_summary": "CPU at 85%; SNMP polling every 5s from 20 collectors.",
        "root_cause_prediction": "Excessive management-plane polling causing daemon overload, evidenced by 'process snmpd' logs.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Reduced polling frequency and consolidated collectors; CPU dropped to 28%.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-435",
        "device": "wireless-controller",
        "interface": "N/A",
        "situation_summary": "CPU at 86% during client onboarding surge; logs: 'high cpu in aaa process'.",
        "root_cause_prediction": "Authentication server latency causing AAA process backlog.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Scaled RADIUS servers and enabled local auth cache; CPU stabilized.",
        "confidence_score": 0.85
    },
    {
        "incident_id": "NET-2025-436",
        "device": "firewall-east",
        "interface": "N/A",
        "situation_summary": "Memory at 91%; conntrack table at 98% capacity. Logs: 'memory usage high'.",
        "root_cause_prediction": "Connection tracking table exhaustion due to DDoS, confirmed by mem_percent > 80 and log 'memory'.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Increased conntrack max and tuned TCP timeouts; memory reduced to 65%.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-437",
        "device": "router-pe-11",
        "interface": "N/A",
        "situation_summary": "Memory at 88%; holding full Internet table (950K routes).",
        "root_cause_prediction": "Routing table scale exceeding memory allocation for RIB/FIB.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Filtered full-table from non-transit peers; memory stabilized at 70%.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-438",
        "device": "sdwan-edge-18",
        "interface": "N/A",
        "situation_summary": "Memory at 84%; steady leak observed over 72 hours. Logs: 'oom killer invoked'.",
        "root_cause_prediction": "Memory leak in telemetry agent post-upgrade, supported by 'oom' logs and steady growth.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Applied vendor patch for known leak; memory usage flatlined.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-439",
        "device": "switch-leaf-40",
        "interface": "N/A",
        "situation_summary": "Memory at 82%; TCAM for ACLs at 96% utilization.",
        "root_cause_prediction": "Excessive security policy scale exhausting data-plane memory.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Consolidated ACLs and removed unused entries; freed 15% memory.",
        "confidence_score": 0.86
    },
    {
        "incident_id": "NET-2025-440",
        "device": "apic-controller",
        "interface": "N/A",
        "situation_summary": "Memory at 89%; policy compiler process consuming 50%. Logs: 'high memory in policy engine'.",
        "root_cause_prediction": "Large tenant policy count exceeding controller memory capacity.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Scaled controller cluster; redistributed tenants.",
        "confidence_score": 0.84
    },
    {
        "incident_id": "NET-2025-441",
        "device": "core-switch-dc2",
        "interface": "N/A",
        "situation_summary": "Chassis temp at 76°C; fans at max. Logs: 'temperature alarm: critical'.",
        "root_cause_prediction": "Blocked rear exhaust in high-density rack, confirmed by temp_c > 70 and log 'temperature alarm'.",
        "intent": "system",
        "subintent": "device_overheat",
        "remediation": "Reorganized rack airflow and added blanking panels; temp normalized to 44°C.",
        "confidence_score": 0.94
    },
    {
        "incident_id": "NET-2025-442",
        "device": "router-isp-edge",
        "interface": "N/A",
        "situation_summary": "CPU die temp at 80°C; logs: 'fan module 3 failed'.",
        "root_cause_prediction": "Fan failure reducing cooling capacity, evidenced by temp_c > 70 and log 'fan failure'.",
        "intent": "system",
        "subintent": "device_overheat",
        "remediation": "Replaced faulty fan tray; temperature dropped to 58°C.",
        "confidence_score": 0.96
    },
    {
        "incident_id": "NET-2025-443",
        "device": "firewall-central",
        "interface": "N/A",
        "situation_summary": "System temp at 73°C during DDoS mitigation; no fan fault logged.",
        "root_cause_prediction": "Sustained high CPU load increasing thermal output beyond cooling capacity.",
        "intent": "system",
        "subintent": "device_overheat",
        "remediation": "Enabled aggressive fan curve and reduced inspection depth during attack.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-444",
        "device": "ddos-gateway",
        "interface": "eth0",
        "situation_summary": "PPS at 1.6M; SYN flood pattern detected. Logs: 'attack: SYN flood'.",
        "root_cause_prediction": "High-volume SYN flood exhausting connection table, confirmed by pps_rate > 1M and log 'flood'.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Activated SYN cookies and upstream blackhole; traffic scrubbed.",
        "confidence_score": 0.97
    },
    {
        "incident_id": "NET-2025-445",
        "device": "border-router-isp1",
        "interface": "Gi0/0/2",
        "situation_summary": "Traffic volume 12x baseline; NetFlow shows DNS amplification pattern.",
        "root_cause_prediction": "Reflected DNS amplification attack, evidenced by PPS spike and log 'attack'.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Disabled open DNS resolver; blackholed victim IP at edge.",
        "confidence_score": 0.95
    },
    {
        "incident_id": "NET-2025-446",
        "device": "firewall-dmz",
        "interface": "eth1",
        "situation_summary": "Connection rate at 60K/s; conntrack full. Logs: 'possible DDoS: conntrack exhausted'.",
        "root_cause_prediction": "Connection exhaustion attack overwhelming stateful engine.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Enabled connection rate limiting per source IP; mitigated impact.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-447",
        "device": "cloud-router",
        "interface": "Gi0/1/0",
        "situation_summary": "Sustained 100 Gbps UDP flood from spoofed IPs.",
        "root_cause_prediction": "Volumetric attack targeting web service, confirmed by pps_rate > 1M.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Diverted to cloud scrubbing center; clean traffic reinjected.",
        "confidence_score": 0.96
    },
    {
        "incident_id": "NET-2025-448",
        "device": "waf-system",
        "interface": "eth0",
        "situation_summary": "HTTP request rate at 250K RPS; logs: 'layer 7 attack: HTTP flood'.",
        "root_cause_prediction": "Application-layer DDoS using HTTP floods, supported by 'attack' logs.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Deployed CAPTCHA challenge and rate-based WAF rules; restored service.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-449",
        "device": "legacy-router-05",
        "interface": "Gi0/1/1",
        "situation_summary": "Random 50–150ms latency spikes; no correlation with CPU, memory, or interface stats.",
        "root_cause_prediction": "Insufficient telemetry; possible NIC ring buffer or driver issue not captured by current signals.",
        "intent": "unknown",
        "subintent": "low_confidence",
        "remediation": "Enabled eBPF-based latency tracing and NIC diagnostic counters.",
        "confidence_score": 0.54
    },
    {
        "incident_id": "NET-2025-450",
        "device": "switch-old-07",
        "interface": "Gi1/0/10",
        "situation_summary": "Intermittent packet loss; all interface counters normal. No matching log patterns.",
        "root_cause_prediction": "Hardware defect or firmware bug with no observable signal correlation; combined_score < 0.6.",
        "intent": "unknown",
        "subintent": "low_confidence",
        "remediation": "Scheduled hardware replacement and firmware upgrade.",
        "confidence_score": 0.51
    },
    {
        "incident_id": "NET-2025-563",
        "device": "edge-router-delhi-01",
        "interface": "Gi0/0/9",
        "situation_summary": "Sustained utilization above 92% with queue depth spikes and 750+ output drops during peak hours.",
        "root_cause_prediction": "Interface congestion due to bursty traffic and lack of proper queue shaping, indicated by high utilization_percent and increasing out_discards with queue-limit warnings.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Enabled traffic shaping and configured priority queue for real-time applications; advised shifting non-critical backups to off-hours.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-574",
        "device": "branch-router-mum-03",
        "interface": "Gi0/2/0",
        "situation_summary": "Interface reached 94% utilization with 600+ output drops and buffer miss alerts.",
        "root_cause_prediction": "High-volume data sync during office hours causing queue saturation, evidenced by utilization_percent > 90 and buffer_fail counters.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Applied outbound shaping to cap data sync throughput; configured WFQ for critical business traffic.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-582",
        "device": "dc-core-router-1",
        "interface": "Te0/3/1",
        "situation_summary": "95–97% throughput with ECN marks and tail-drop events during database replication.",
        "root_cause_prediction": "Oversubscribed uplink during heavy east-west traffic, confirmed by high utilization and ecn_mark counters.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Distributed replication traffic across secondary links and enabled RED to reduce tail-drops.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-593",
        "device": "metro-edge-router-blr-09",
        "interface": "Gi0/1/3",
        "situation_summary": "Output queue hitting 100% limit with microbursts causing 800+ discards per minute.",
        "root_cause_prediction": "Traffic microbursts from multiple upstream switches causing instantaneous congestion, highlighted by queue-full events and out_discards.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Enabled microburst protection and increased buffer size; recommended enabling load-balancing on upstream links.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-604",
        "device": "wan-pe-router-che-02",
        "interface": "Gi0/0/1",
        "situation_summary": "Link utilization peaks at 93% with QoS class-default drops during video conferencing.",
        "root_cause_prediction": "Real-time traffic competing with bulk traffic in class-default, causing congestion and drops in default queue.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Introduced LLQ for real-time traffic and reduced burst size on bulk-transfer ACLs.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-617",
        "device": "branch-router-pune-07",
        "interface": "Gi0/0/5",
        "situation_summary": "Sustained outbound utilization at 91% with retransmissions observed on the transport layer.",
        "root_cause_prediction": "Network congestion leading to packet delay and retransmissions, supported by high utilization and increase in out_discards and tcp_retransmits.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Activated per-flow policing for heavy apps and enabled adaptive shaping to smooth traffic surges.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-901",
        "device": "edge-switch-blr-22",
        "interface": "Gi0/1",
        "situation_summary": "Interface went down while admin status remained up; LOS logs detected.",
        "root_cause_prediction": "Physical cable disconnected or optical LOS observed, supported by oper_status=down and 'loss of signal' logs.",
        "intent": "link",
        "subintent": "down",
        "remediation": "Reconnected the fiber patch, cleaned the connectors, and validated transceiver health.",
        "confidence_score": 0.92
    },
    {
        "incident_id": "NET-2025-902",
        "device": "distribution-switch-mum-11",
        "interface": "Gi1/0/23",
        "situation_summary": "Interface flapped 7 times within 15 minutes; speed/duplex negotiation messages observed.",
        "root_cause_prediction": "Likely loose connection or negotiation mismatch, indicated by flap_count>3 and duplex mismatch logs.",
        "intent": "link",
        "subintent": "flap",
        "remediation": "Replaced the patch cable and manually enforced speed/duplex to prevent future flaps.",
        "confidence_score": 0.88
    },
    {
        "incident_id": "NET-2025-903",
        "device": "access-switch-delhi-05",
        "interface": "Gi0/0/47",
        "situation_summary": "Input CRC errors exceeded 120; multiple tail drop logs observed.",
        "root_cause_prediction": "Physical layer corruption resulting in CRC errors, supported by in_errors>100 and crc error logs.",
        "intent": "link",
        "subintent": "high_errors",
        "remediation": "Re-terminated cable, replaced SFP, and verified clean signal with error counters reset.",
        "confidence_score": 0.91
    },
    {
        "incident_id": "NET-2025-904",
        "device": "wan-router-hq-03",
        "interface": "Gi0/0/2",
        "situation_summary": "Utilization reached 94% and output discards spiked during backup window.",
        "root_cause_prediction": "Interface congestion caused by peak backup traffic, confirmed by utilization>90 and 'buffer full' logs.",
        "intent": "performance",
        "subintent": "congestion",
        "remediation": "Applied QoS policy for backup traffic and shifted sync jobs to off-peak hours.",
        "confidence_score": 0.93
    },
    {
        "incident_id": "NET-2025-905",
        "device": "edge-router-chennai-07",
        "interface": "Te0/2/0",
        "situation_summary": "BGP neighbor session went down; received 'BGP-5-ADJCHANGE neighbor down' message.",
        "root_cause_prediction": "Upstream peer or link failure leading to BGP adjacency loss, supported by bgp_session_state=down and log patterns.",
        "intent": "routing",
        "subintent": "bgp_down",
        "remediation": "Restarted BGP session, validated peer reachability, and escalated to provider for link investigation.",
        "confidence_score": 0.95
    },
    {
        "incident_id": "NET-2025-906",
        "device": "firewall-mum-02",
        "interface": "N/A",
        "situation_summary": "CPU usage sustained at 92% for over 10 minutes during traffic spikes.",
        "root_cause_prediction": "A burst of flows caused CPU overload; correlated with 'high cpu' log entries.",
        "intent": "system",
        "subintent": "cpu_high",
        "remediation": "Cleared stale sessions, tuned process limits, and optimized firewall inspection rules.",
        "confidence_score": 0.90
    },
    {
        "incident_id": "NET-2025-907",
        "device": "core-router-blr-09",
        "interface": "N/A",
        "situation_summary": "Memory usage reached 89%; OOM patterns detected in system logs.",
        "root_cause_prediction": "Device is experiencing memory pressure, supported by mem_percent>80 and OOM warnings.",
        "intent": "system",
        "subintent": "memory_high",
        "remediation": "Cleared cache buffers, restarted high-memory processes, and scheduled memory cleanup.",
        "confidence_score": 0.87
    },
    {
        "incident_id": "NET-2025-908",
        "device": "edge-switch-noida-04",
        "interface": "N/A",
        "situation_summary": "Device temperature reached 78°C; fan failure alerts triggered.",
        "root_cause_prediction": "Airflow restriction or fan malfunction causing overheating, validated by temp_c>70 and fan failure logs.",
        "intent": "system",
        "subintent": "device_overheat",
        "remediation": "Replaced faulty fan tray and improved rack airflow; reset temperature alarms.",
        "confidence_score": 0.89
    },
    {
        "incident_id": "NET-2025-909",
        "device": "internet-fw-edge-delhi-01",
        "interface": "Te0/0/1",
        "situation_summary": "PPS exceeded 1.3M; multiple 'flood' alerts from IDS.",
        "root_cause_prediction": "High-volume packet flood consistent with DDOS behavior, supported by pps_rate>1M and attack logs.",
        "intent": "security",
        "subintent": "ddos",
        "remediation": "Enabled rate-limiting, blocked offending IP ranges, and engaged ISP scrubbing service.",
        "confidence_score": 0.94
    },
    {
        "incident_id": "NET-2025-910",
        "device": "access-switch-hyd-13",
        "interface": "Gi0/0/6",
        "situation_summary": "Signals did not meet thresholds for any known category; no matching patterns in logs.",
        "root_cause_prediction": "Evidence insufficient for root-cause classification; manual analysis required.",
        "intent": "unknown",
        "subintent": "low_confidence",
        "remediation": "Requested manual investigation and deeper log/packet review.",
        "confidence_score": 0.41
    },
    {
      "incident_id": "NET-2025-301",
      "device": "router--R123",
      "interface": "N/A",
      "situation_summary": "Router temperature crossed 62°C while fan RPM increased sharply, indicating cooling degradation.",
      "root_cause_prediction": "Cooling efficiency decreased due to reduced airflow; supported by temp_c>45 and high fan_speed beyond 3500 RPM.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_COOLING_DEGRADED",
      "remediation": "Inspect rack airflow, verify CRAC airflow output, clear dust filters, and stabilize fan RPM.",
      "confidence_score": 0.86
    },
    {
      "incident_id": "NET-2025-302",
      "device": "Switch-1234-G1",
      "interface": "N/A",
      "situation_summary": "Device temperature spiked above 50°C after a sudden drop in cooling airflow from CRAC unit.",
      "root_cause_prediction": "CRAC cooling unit failure leading to environmental heat buildup; matches temp_c>50 and thermal alarms.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_CRAC_FAILURE",
      "remediation": "Inspect CRAC unit CU-3, verify compressor cycle, restore airflow, and reset environmental alarms.",
      "confidence_score": 0.91
    },
    {
      "incident_id": "NET-2025-303",
      "device": "Firewal-mega121",
      "interface": "N/A",
      "situation_summary": "Router temperature reached 53°C with CPU load exceeding 52%, causing intermittent performance issues.",
      "root_cause_prediction": "Device overheating due to internal thermal imbalance; validated by temp_c>50 and cpu_percent>52.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROUTER_OVERHEAT",
      "remediation": "Reduce workload, check internal airflow paths, clean vents, and monitor thermal thresholds.",
      "confidence_score": 0.88
    },
    {
      "incident_id": "NET-2025-304",
      "device": "zoneC-FAN-1",
      "interface": "N/A",
      "situation_summary": "Zone-C temperature trending upward; fan speeds continuously rising to maintain cooling load.",
      "root_cause_prediction": "Room temperature increase due to cooling inefficiency; supported by temp_c>47 and fan_speed climbing above normal.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROOM_TEMP_RISE",
      "remediation": "Inspect zone cooling, verify CRAC discharge temperature, and restore adequate environmental cooling.",
      "confidence_score": 0.83
    },
    {
      "incident_id": "NET-2025-305",
      "device": "router-zoneC-R1",
      "interface": "N/A",
      "situation_summary": "Increasing latency and packet loss observed as router temperature rose above 49°C.",
      "root_cause_prediction": "Overheating-induced downstream impact, confirmed by latency_ms>15 and packet_loss_percent>2.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_DOWNSTREAM_IMPACT",
      "remediation": "Stabilize router temperature, improve airflow, reduce sustained high workloads, and flush congested queues.",
      "confidence_score": 0.79
    },
    {
      "incident_id": "NET-2025-410",
      "device": "spine-sw-hyd-11",
      "interface": "N/A",
      "situation_summary": "Spine switch temperature reached 51°C; fan RPM above 4200 indicating airflow restriction.",
      "root_cause_prediction": "Cooling efficiency reduced due to blocked airflow, supported by temp_c>45 and high fan_speed readings.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_COOLING_DEGRADED",
      "remediation": "Clear front/rear air intake, realign rack airflow panels, and stabilize fan tray operation.",
      "confidence_score": 0.84
    },
    {
      "incident_id": "NET-2025-401",
      "device": "tor-switch-hyd-12",
      "interface": "N/A",
      "situation_summary": "Top-of-rack switch temperature increased to 51°C while local rack fans indicated reduced airflow.",
      "root_cause_prediction": "Cooling efficiency degradation from impaired airflow; supported by temp_c>45 and abnormal fan RPM.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_COOLING_DEGRADED",
      "remediation": "Clear airflow path, clean dust filters, verify rack front-to-back cooling alignment.",
      "confidence_score": 0.84
    },
    {
      "incident_id": "NET-2025-411",
      "device": "agg-router-blr-a07",
      "interface": "N/A",
      "situation_summary": "Temperature spiked from 42°C to 55°C within 10 minutes after CRAC-A3 airflow halted.",
      "root_cause_prediction": "CRAC-A3 failure caused sudden ambient temperature spike; temp_c>50 strongly matches.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_CRAC_FAILURE",
      "remediation": "Restore CRAC-A3 compressor cycle, verify discharge temperature, and re-enable chilled airflow.",
      "confidence_score": 0.92
    },
    {
      "incident_id": "NET-2025-402",
      "device": "agg-switch-delhi-02",
      "interface": "N/A",
      "situation_summary": "Aggregation switch temperature surged to 55°C following CRAC unit CU-7 compressor shutdown.",
      "root_cause_prediction": "CRAC failure led to ambient temperature spike; aligns with temp_c>50 and CRAC-related alerts.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_CRAC_FAILURE",
      "remediation": "Restart CU-7 compressor, restore chilled air supply, validate environmental sensors.",
      "confidence_score": 0.93
    },
    {
      "incident_id": "NET-2025-412",
      "device": "agg-sw-mum-22",
      "interface": "N/A",
      "situation_summary": "Aggregation switch CPU reached 57% and temperature crossed 53°C, causing routing instability.",
      "root_cause_prediction": "Device overheating triggered by simultaneous CPU load and thermal imbalance—temp_c>50 and cpu_percent>52.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROUTER_OVERHEAT",
      "remediation": "Reduce background processes, validate internal airflow ducts, and stabilize thermal profile.",
      "confidence_score": 0.87
    },
    {
      "incident_id": "NET-2025-403",
      "device": "core-router-blr-01",
      "interface": "N/A",
      "situation_summary": "Router temperature reached 57°C accompanied by CPU load crossing 60%, triggering throttling warnings.",
      "root_cause_prediction": "Device overheating with internal load imbalance; validated by temp_c>50 and cpu_percent>52.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROUTER_OVERHEAT",
      "remediation": "Reduce routing table recalculation frequency, inspect internal vents, verify thermal paste integrity.",
      "confidence_score": 0.89
    },
    {
      "incident_id": "NET-2025-413",
      "device": "core-fw-blr-b02",
      "interface": "N/A",
      "situation_summary": "Zone-B thermal readings show slow but steady rise; fan speeds elevated to compensate.",
      "root_cause_prediction": "Room temperature rise driven by insufficient CRAC airflow; temp_c>47 and fan_speed elevated.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROOM_TEMP_RISE",
      "remediation": "Balance airflow distribution in Zone-B, verify CRAC-B2 setpoints, and restore cooling output.",
      "confidence_score": 0.80
    },
    {
      "incident_id": "NET-2025-404",
      "device": "leaf-switch-mum-09",
      "interface": "N/A",
      "situation_summary": "Rising hall temperature observed as multiple devices in Rack R17 reported temperature above 48°C.",
      "root_cause_prediction": "Room temperature rise due to degraded cooling in nearby CRAC aisle; matches temp_c>47 trends.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROOM_TEMP_RISE",
      "remediation": "Check CRAC airflow distribution, correct hot-aisle/cold-aisle mixing, validate return air vents.",
      "confidence_score": 0.81
    },
    {
      "incident_id": "NET-2025-414",
      "device": "tor-sw-noida-r12",
      "interface": "N/A",
      "situation_summary": "Latency jumped from 8ms to 32ms and packet loss reached 3% as switch temperature approached 50°C.",
      "root_cause_prediction": "Thermal stress caused downstream performance degradation; latency_ms>15 and packet_loss>2 confirmed.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_DOWNSTREAM_IMPACT",
      "remediation": "Reduce forwarding load, restore cooling, and clear excessive queue buildup.",
      "confidence_score": 0.82
    },
    {
      "incident_id": "NET-2025-405",
      "device": "agg-router-chennai-03",
      "interface": "N/A",
      "situation_summary": "Latency and packet loss increased as router temperature exceeded 50°C, impacting downstream QoS.",
      "root_cause_prediction": "Thermal-induced downstream impact; confirmed by latency_ms>15 and packet_loss_percent>2.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_DOWNSTREAM_IMPACT",
      "remediation": "Restore cooling airflow, rebalance traffic distribution, clear congested forwarding queues.",
      "confidence_score": 0.78
    },
    {
      "incident_id": "NET-2025-415",
      "device": "edge-router-delhi-09",
      "interface": "N/A",
      "situation_summary": "Fan speeds fluctuated between 300 RPM and 4800 RPM; system temperature reached 48.5°C.",
      "root_cause_prediction": "Cooling efficiency degraded due to unstable fan subsystem; matching fan_speed<500 and temp rise.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_COOLING_DEGRADED",
      "remediation": "Replace faulty fan module and recalibrate thermal control firmware.",
      "confidence_score": 0.89
    },
    {
      "incident_id": "NET-2025-406",
      "device": "spine-switch-mum-17",
      "interface": "N/A",
      "situation_summary": "Spine switch temperature climbed from 44°C to 50°C as fan RPM surged beyond 4200.",
      "root_cause_prediction": "Airflow degradation due to partial blockage; matches fan_speed>3500 and temp_c>45.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_COOLING_DEGRADED",
      "remediation": "Clean intake paths, adjust rack positioning, re-balance cold aisle airflow.",
      "confidence_score": 0.82
    },
    {
      "incident_id": "NET-2025-416",
      "device": "core-router-chn-5a",
      "interface": "N/A",
      "situation_summary": "CRAC-C5 alarm triggered; device temperature crossed 54°C within 5 minutes.",
      "root_cause_prediction": "Environmental temperature surge due to CRAC-C5 compressor malfunction; temp_c>50 matches hypothesis.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_CRAC_FAILURE",
      "remediation": "Restore CRAC compressor, ensure chilled water supply, and re-enable full cooling throughput.",
      "confidence_score": 0.93
    },
    {
      "incident_id": "NET-2025-407",
      "device": "dc-firewall-pune-05",
      "interface": "N/A",
      "situation_summary": "Firewall temperature spiked to 58°C after CRAC CU-2 reported discharge temperature rising.",
      "root_cause_prediction": "Cooling unit malfunction leading to temperature surge; validated by temp_c>50 readings.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_CRAC_FAILURE",
      "remediation": "Repair CU-2 discharge path, verify compressor cycle, stabilize room temperature.",
      "confidence_score": 0.92
    },
    {
      "incident_id": "NET-2025-417",
      "device": "dist-sw-pune-48",
      "interface": "N/A",
      "situation_summary": "CPU load spiked to 63% and thermal throttling warnings appeared as temperature hit 49°C.",
      "root_cause_prediction": "CPU thermal throttle triggered by insufficient cooling; aligns with cpu_percent>50 and related logs.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_CPU_THROTTLE",
      "remediation": "Reduce workload bursts, improve fan control curve, and clean internal heat sinks.",
      "confidence_score": 0.78
    },
    {
      "incident_id": "NET-2025-408",
      "device": "edge-router-kolkata-10",
      "interface": "N/A",
      "situation_summary": "Edge router showed rising temperature (55°C) and CPU load (55%), leading to intermittent latency spikes.",
      "root_cause_prediction": "Internal overheating causing performance instability; matches temp_c>50 and cpu_percent>52.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROUTER_OVERHEAT",
      "remediation": "Inspect internal cooling fans, reduce routing load, ensure adequate cold aisle coverage.",
      "confidence_score": 0.87
    },
    {
      "incident_id": "NET-2025-418",
      "device": "dist-router-hyd-14",
      "interface": "N/A",
      "situation_summary": "Forwarding performance degraded as temperature rose above 48°C; packet retries increased.",
      "root_cause_prediction": "Thermal stress causing downstream packet drop and queue buildup, matching latency and loss patterns.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_DOWNSTREAM_IMPACT",
      "remediation": "Improve rack cooling, reduce burst traffic load, and flush congested output queues.",
      "confidence_score": 0.81
    },
    {
      "incident_id": "NET-2025-409",
      "device": "tor-switch-pune-07",
      "interface": "N/A",
      "situation_summary": "Switch temperature rose steadily to 48°C due to warm-air backflow from adjacent racks.",
      "root_cause_prediction": "Room temperature rise linked to hot-aisle mixing; consistent with temp_c>47 symptoms.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_ROOM_TEMP_RISE",
      "remediation": "Re-align airflow baffles, isolate hot aisle, monitor CRAC return paths.",
      "confidence_score": 0.80
    },
    {
      "incident_id": "NET-2025-419",
      "device": "access-sw-kochi-21",
      "interface": "N/A",
      "situation_summary": "Device temperature reached 47.8°C with fan RPM climbing continuously; inlet filters found partially blocked.",
      "root_cause_prediction": "Cooling degradation as airflow reduced; supported by temp_c>45 and rising fan RPM.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_COOLING_DEGRADED",
      "remediation": "Replace clogged air filters, clean intake vents, and reset thermal alarms.",
      "confidence_score": 0.85
    },
    {
      "incident_id": "NET-2025-410",
      "device": "core-switch-ahmedabad-11",
      "interface": "N/A",
      "situation_summary": "Temperature exceeded 53°C causing downstream packet loss and jitter across connected racks.",
      "root_cause_prediction": "Thermal overload affecting forwarding stability; validated by packet_loss_percent>2 and latency>15ms.",
      "intent": "thermal.cooling_failure",
      "subintent": "H_DOWNSTREAM_IMPACT",
      "remediation": "Stabilize switch thermal profile, re-route high-load flows, restore cooling efficiency.",
      "confidence_score": 0.76
    }
]
def get_db_connection():
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD
    )

def ingest_rca_data():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            for i, case in enumerate(SAMPLE_CASES):
                # Generate embedding from situation_summary (768-dim)
                embedding = model.encode(case["situation_summary"]).tolist()
                embedding_str = "[" + ",".join(map(str, embedding)) + "]"

                
                resolved_at = datetime.utcnow() + timedelta(days=1)

                # Insert into table
                cur.execute("""
                    INSERT INTO historical_rca_cases (
                        id, created_at, incident_id, device, interface,
                        situation_summary, root_cause_prediction, embedding,
                        intent, subintent, remediation, confidence_score, resolved_at
                    ) VALUES (
                        %s, %s, %s, %s, %s,
                        %s, %s, %s::vector,
                        %s, %s, %s, %s, %s
                    )
                """, (
                    str(uuid.uuid4()),
                    datetime.utcnow(),
                    case["incident_id"],
                    case["device"],
                    case["interface"],
                    case["situation_summary"],
                    case["root_cause_prediction"],
                    embedding_str,  
                    case["intent"],
                    case["subintent"],
                    case["remediation"],
                    case["confidence_score"],
                    resolved_at
                ))
                print(f"✅ Inserted: {case['incident_id']}")

            conn.commit()
            print("\n🎉 All RCA cases ingested successfully!")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    # Ensure table exists (optional safety check)
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM historical_rca_cases LIMIT 1")
    conn.close()

    ingest_rca_data()