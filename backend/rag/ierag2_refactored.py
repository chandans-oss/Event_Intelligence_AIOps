# -*- coding: utf-8 -*-
"""
IERAG2 - Root Cause Analysis Pipeline
Standalone Python script for end-to-end RCA workflow.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ════════════════════════════════════════════════════════════════════════════════
# IMPORTS
# ════════════════════════════════════════════════════════════════════════════════
import re
import json
import time
import torch
import numpy as np
import pickle
import os
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from typing import Optional, List
from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
from sentence_transformers import SentenceTransformer, CrossEncoder
import faiss
from rank_bm25 import BM25Okapi

# ════════════════════════════════════════════════════════════════════════════════
# GLOBAL CONSTANTS / CONFIGURATION / FILE PATHS / MODEL PATHS / RUNTIME FLAGS
# ════════════════════════════════════════════════════════════════════════════════
KB_PATH = "network_rca_v2.json" 
index_path = "data/kb.index"
meta_path = "data/kb_metadata.pkl"
 # Adjust path as needed
RUN_RERANK_SEARCH = True      # Set to True to run reranked search, False for normal hybrid search
RUN_NORMAL_HYBRID_SEARCH = False  # Set to True to run normal hybrid search

# Global variables for models and data
docs = None
metadata = None
model = None
index = None
bm25 = None
reranker = None

# ════════════════════════════════════════════════════════════════════════════════
# INPUT PAYLOAD SECTION
# ════════════════════════════════════════════════════════════════════════════════
# Default test data
DEFAULT_RAW_LOGS = []
DEFAULT_ROOT_EVENT = {}
DEFAULT_METRICS_PAYLOAD = {}
DEFAULT_TOPOLOGY = {}


# raw_logs = [
#         "2026-03-12T10:01:15.221Z Core-Switch-A %QUEUE-4-CONGESTION: tail drop active on Interface Te1/0/1 - queue full, 1240 packets dropped",
#         "2026-03-12T10:03:28.445Z Core-Switch-A %QOS-3-TXQUEUE: buffer full on Te1/0/1 - egress buffer utilization 94%",
#         "2026-03-12T10:05:10.789Z Core-Switch-A %QOS-2-POLICERDROP: queue full condition persisting on Te1/0/1 - policer discarding 4870 excess packets",
#         "2026-03-12T10:07:44.102Z Core-Switch-A %BW-4-THRESHOLD: Interface Te1/0/1 bandwidth utilization exceeded 90% threshold (current: 93%)",
#         "2026-03-12T10:09:55.334Z Core-Switch-A %QUEUE-3-TAILDROPTX: tail drop sustained >180s on Te1/0/1 - congestion unresolved",
#         "2026-03-12T10:11:20.567Z Core-Switch-A info: SNMP polling to 10.0.7.22 delayed - response latency 1800ms",   # noise
#         "2026-03-12T10:13:05.890Z Core-Switch-A %PROC-5-HIGHLOAD: process 'CEF Worker' minor CPU spike - congestion burst side-effect"  # noise
#     ]
# root_event = {
#         "_id": {"$oid": "71234bcdf390b24cde018471"},
#         "organization": "131135018821674340352",
#         "agent_id": "CF914BB415CE5DACBG6F263FB6C5106E",
#         "last_update_time": {"$date": "2026-03-12T10:14:10.321Z"},
#         "datetime": "2026-03-12 10:09:00.000000",
#         "is_cleared": 0,
#         "is_deleted": False,
#         "last_down_at": {"$date": "2026-03-12T10:07:44.031Z"},
#         "ci_id": "148820304475318571623",
#         "parent_ci_id": "148820304475318571560",
#         "probable_cause": "QoS Congestion",
#         "ip_address": "10.0.7.22",
#         "event_type": "Performance Threshold Breach",
#         "parameter_name": "Interface Bandwidth Utilization",
#         "parameter_value": 93,                         # triggers utilization_percent > 90
#         "parameter_unit": "%",
#         "alarm_msg": "Interface Queue Full - Tail Drop Active",
#         "device_type": "Network Switch",
#         "managed_object_name": "Te1/0/1",
#         "managed_object_class": "Interface",
#         "managed_object_type": "Port",
#         "severity": 3,
#         "priority": 1,
#         "alarm_category": "Performance",
#         "vendor": "Cisco",
#         "event_count": 9,
#         "stat_dn": "bw_util",
#         "impacted_services": ["VoIP-VLAN100", "Video-Stream-VLAN100"],
#         "is_root": 1,
#         "is_correlated": 1,
#         "termination_status": False,
#         "creation_time": {"$date": "2026-03-12T09:55:00.111Z"},
#         "first_event": {"$date": "2026-03-12T09:55:00.000Z"},
#         "terminated_time": None
#     }
# metrics_payload = {
#         # ── Firing signals ──
#         "utilization_percent": {"Te1/0/1": [55, 63, 72, 81, 89, 93]},   # op > 90 → fires at t5
#         "out_discards":        {"Te1/0/1": [0, 45, 210, 680, 1240, 4870]}, # op > 0 → fires from t2

#         # ── Corroborating ──
#         "queue_depth_pct":     {"Te1/0/1": [12, 28, 47, 71, 89, 94]},   # physical buffer evidence
#         "tx_errors":           {"Te1/0/1": [0, 0, 3, 9, 18, 31]},       # downstream overflow

#         # ── Negative clue validators ──
#         "crc_errors":          {"Te1/0/1": [0, 0, 0, 1, 2, 1]},         # near-zero → not physical fault
#         "interface_flaps":     {"Te1/0/1": [0, 0, 0, 0, 0, 0]},         # zero → not link flap
#         "traffic_dscp0_percent":{"Te1/0/1": [18, 21, 24, 27, 29, 31]},  # low → not backup traffic

#         # ── Noise ──
#         "cpu_util_pct":        {"Core-Switch-A": [28, 31, 36, 42, 51, 58]},
#         "latency_ms":          {"SNMP-10.0.7.22": [45, 120, 380, 920, 1800, 2200]}
#     }

# topology= {
#         "Core-Switch-A": {
#             "ip": "10.0.7.22",
#             "role": "Core Distribution Switch",
#             "congested_interface": "Te1/0/1",
#             "interface_capacity_gbps": 10,
#             "affected_vlans": [100, 300]
#         },
#         "Backup-Server-1": {
#             "ip": "10.0.7.45",                         # source identified in logs
#             "role": "Backup and Replication Server",
#             "connected_via": "Access-Switch-2",
#             "scheduled_backup_window": "02:00-04:00 UTC",  # aligns with event timestamps
#             "backup_target": "10.0.8.91",
#             "backup_tool": "rsync",
#             "dscp_marking": "DSCP0"                    # unclassified — root of the problem
#         },
#         "Backup-Target-1": {
#             "ip": "10.0.8.91",
#             "role": "DR Backup Target",
#             "connected_via": "Access-Switch-3"
#         }
#     }

# ════════════════════════════════════════════════════════════════════════════════
# DATA CLASSES / SCHEMAS / REGEX PATTERNS / LOOKUP DICTIONARIES
# ════════════════════════════════════════════════════════════════════════════════
@dataclass
class MetricFact:
    metric: str
    entity: str
    baseline: float
    current: float
    change_pct: float
    z_score: float
    is_anomaly: bool
    direction: str

@dataclass
class ExtractedEntities:
    interfaces: List[str] = field(default_factory=list)
    ips: List[str] = field(default_factory=list)
    alarm_codes: List[str] = field(default_factory=list)
    bgp_neighbors: List[str] = field(default_factory=list)
    protocols: List[str] = field(default_factory=list)
    macs: List[str] = field(default_factory=list)
    ssids: List[str] = field(default_factory=list)

_RE_IFACE = re.compile(
    r'\b(?:GigabitEthernet|TenGigabitEthernet|TenGig|GigE|FastEthernet|'
    r'Serial|Tunnel|Loopback|Vlan|Te|Gi|Fa)\d+(?:[/:.]\d+){0,3}\b',
    re.IGNORECASE,
)
_RE_IP = re.compile(
    r'\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b'
)
_RE_MAC = re.compile(r'\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b|\b(?:[0-9A-Fa-f]{4}\.){2}[0-9A-Fa-f]{4}\b')
_RE_SSID = re.compile(r'SSID\s+["\']?([^"\'\s,;]+)["\']?', re.IGNORECASE)
_RE_ALARM = re.compile(r'%([A-Z][A-Z0-9_-]{1,15}-\d-[A-Z0-9_]{2,20})')
_RE_BGP = re.compile(r'(?:neighbor|peer)\s+(\S+)', re.IGNORECASE)
_RE_FAC = re.compile(r'%([A-Z][A-Z0-9_]{2,15})-\d-[A-Z0-9_]{2,20}:?')

# Timestamp regex for ISO-8601 and syslog-style timestamps
_RE_TS = re.compile(
    r'\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\b|'
    r'\b[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b'
)

# Optional severity matcher used only by log filtering
_RE_SEVERITY = re.compile(r'\b(critical|error|warning|fail|down)\b', re.IGNORECASE)

_KNOWN_PROTOS = {"BGP", "OSPF", "ISIS", "MPLS", "BFD", "LDP", "RSVP", "LACP", "STP"}

_FACILITY_TO_DOMAIN = {
    "LINK": "link", "LINEPROTO": "link", "IF": "link", "IFMGR": "link",
    "ETHER": "link", "PHY": "link", "CRC": "link", "SFP": "link",
    "OPTICS": "link", "TRANSCEIVER": "link", "LACP": "link", "STP": "link",
    "MSTP": "link", "RSTP": "link", "BPDU": "link", "DOT1Q": "link",
    "VLAN": "link", "TRUNK": "link", "LAG": "link", "PORT": "link",
    "BGP": "routing", "OSPF": "routing", "ISIS": "routing", "LDP": "routing",
    "RSVP": "routing", "MPLS": "routing", "BFD": "routing", "VRRP": "routing",
    "HSRP": "routing", "GLBP": "routing", "EIGRP": "routing", "PIM": "routing",
    "SYS": "system", "CPUHOG": "system", "MEMORY": "system", "FACILITY": "system",
    "THERMAL": "thermal", "ENVM": "thermal", "FAN": "thermal",
    "SEC": "security", "ACL": "security",
    "BW": "performance", "QUEUE": "performance", "QOS": "performance",
    "OSPF": "routing", "EIGRP": "routing", "IPROUTING": "routing", "ADJ": "routing",
    "WLAN": "wireless", "DOT11": "wireless", "RADIO": "wireless", "AP": "wireless", "SSID": "wireless",
}

_METRIC_TO_DOMAIN = {
    "crc": "link", "input_drop": "link", "output_drop": "link",
    "flap": "link", "in_error": "link", "out_error": "link",
    "bgp": "routing", "ospf": "routing", "eigrp": "routing", "route": "routing", "neighbor": "routing",
    "cpu": "system", "mem": "system", "load": "system",
    "util": "performance", "latency": "performance", "queue": "performance",
    "congestion": "performance", "bandwidth": "performance",
    "temp": "thermal", "fan": "thermal",
    "pps": "security", "attack": "security", "flood": "security",
    "rssi": "wireless", "noise": "wireless", "snr": "wireless", "retry": "wireless", "assoc": "wireless", "auth": "wireless",
}

_IMPACT_MNEMONICS = {"ADJCHANGE", "NEIGHBOR", "NOTIFICATION", "PEER", "SESSION"}
_ALARM_RE = re.compile(r'%([A-Z][A-Z0-9_-]{1,15})-(\d)-([A-Z0-9_]{2,20}):?')
_WILDCARD_RE = re.compile(r'<*>|(\d+)')
_STOPWORDS = {
    "the", "for", "from", "with", "into", "onto", "that", "this", "and", "not",
    "but", "are", "was", "been", "has", "have", "on", "in", "to", "at", "by", "of",
    "is", "it", "or", "more", "than", "last", "due", "sent", "high", "low",
    "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
}

# ════════════════════════════════════════════════════════════════════════════════
# HELPER / UTILITY FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════════
def _strip_header(line: str) -> str:
    _SYSLOG_HEADER = re.compile(
        r'^(?:'
        r'(?:\w{3}\s+\d{1,2}\s+(?:\d{2}:\d{2}:\d{2}|<*>))'  # Cisco: "Apr 20 14:15:22" or wildcarded
        r'|'
        r'(?:\d{4}-\d{2}-\d{2}T?\d{2}:\d{2}:\d{2})'         # ISO 8601
        r')'
        r'\s+\S+\s+'  # hostname token
    )
    return _SYSLOG_HEADER.sub('', line).strip()

def _zone(clean: str) -> str:
    m = _ALARM_RE.search(clean)
    if m:
        fac, sev, mnem = m.group(1).upper(), int(m.group(2)), m.group(3).upper()
        if any(tok in mnem for tok in _IMPACT_MNEMONICS): return "impact"
        dom = _FACILITY_TO_DOMAIN.get(fac)
        if dom in ("link", "performance", "thermal", "security"): return "probable_cause"
        if dom == "routing": return "impact" if sev >= 4 else "probable_cause"
        if dom == "system": return "probable_cause" if sev <= 4 else "noise"
        if fac in {"CLOCKUPDATE", "NTP", "LOGGINGHOST", "RELOAD", "RESTART"}: return "noise"
        return "probable_cause" if sev <= 4 else "noise"
    t = clean.lower()
    _cause = {"crc", "error", "drop", "flap", "input", "output", "fault", "failure", "congestion", "bandwidth", "queue", "tail"}
    _impact = {"bgp", "ospf", "neighbor", "session", "peer", "routing"}
    if any(w in t for w in _impact): return "impact"
    if any(w in t for w in _cause): return "probable_cause"
    return "unknown"

def _score(count: int, zone: str) -> float:
    return count * {"probable_cause": 1.0, "impact": 0.5, "unknown": 0.2, "noise": 0.0}.get(zone, 0.2)

def _tokens(raw_tmpl: str, device_name: str = "") -> list[str]:
    clean = _strip_header(raw_tmpl)
    clean = _WILDCARD_RE.sub(' ', clean)
    out = []
    for tok in re.findall(r'[A-Za-z0-9][A-Za-z0-9_\-/:.]*', clean):
        if tok.lower() in _STOPWORDS or len(tok) < 3: continue
        if re.fullmatch(r'\d+', tok): continue
        if device_name and tok.lower() == device_name.lower(): continue
        out.append(tok.rstrip(':,'))
    return [t for t in out if t]

def _root_alarm_terms(ev: dict) -> list[str]:
    alarm = (
        ev.get("alarm_code")
        or ev.get("alarm")
        or ev.get("alarm_msg")
        or ev.get("probable_cause")
        or ""
    )
    if not alarm:
        return []

    alarm_norm = str(alarm).strip().lower()
    alarm_spaced = re.sub(r'[_\-]+', ' ', alarm_norm)
    parts = [p for p in re.split(r'[_\-\s]+', alarm_norm) if p and p not in _STOPWORDS]

    terms = []

    # Highest-priority exact structured label
    terms.append(alarm_norm)      # e.g. crc_errors_high
    terms.append(alarm_spaced)     # e.g. crc errors high

    # Then component tokens
    terms.extend(parts)

    # Add adjacent n-grams dynamically so phrase intent is preserved
    for i in range(len(parts) - 1):
        terms.append(parts[i] + " " + parts[i + 1])

    for i in range(len(parts) - 2):
        terms.append(parts[i] + " " + parts[i + 1] + " " + parts[i + 2])

    return list(dict.fromkeys([t.strip() for t in terms if t.strip()]))

def _root_message_terms(ev: dict, device_name: str = "") -> list[str]:
    msg = (
        ev.get("message")
        or ev.get("alarm_message")
        or ev.get("additional_text")
        or ev.get("probable_cause")
        or ""
    )
    if not msg:
        return []

    raw_tokens = re.findall(r'[A-Za-z0-9][A-Za-z0-9_\-/:.]*', str(msg).lower())
    tokens = []
    for tok in raw_tokens:
        if tok in _STOPWORDS or len(tok) < 3:
            continue
        if device_name and tok == device_name.lower():
            continue
        tokens.append(tok)

    phrases = []
    for i in range(len(tokens) - 1):
        phrases.append(tokens[i] + " " + tokens[i + 1])

    return list(dict.fromkeys(phrases + tokens))

def _metric_evidence_terms(anomalies: List[MetricFact]) -> list[str]:
    terms = []
    for a in anomalies:
        metric = a.metric.lower().strip()
        if metric:
            terms.append(metric)

            metric_parts = [p for p in re.split(r'[_\-\s]+', metric) if p and p not in _STOPWORDS]
            terms.extend(metric_parts)

            for i in range(len(metric_parts) - 1):
                terms.append(metric_parts[i] + " " + metric_parts[i + 1])

        if getattr(a, "direction", None):
            terms.append(str(a.direction).lower())

    return list(dict.fromkeys([t.strip() for t in terms if t.strip()]))

def _limited_kb_hints(domains: list[str], kb_vocab: dict, per_domain: int = 2) -> list[str]:
    hints = []
    for dom in domains[:2]:
        hints.extend(kb_vocab.get(dom, [])[:per_domain])
    return list(dict.fromkeys([h.strip().lower() for h in hints if h and h.strip()]))

def _norm_metric(text: str) -> str:
    text = (text or "").lower().strip()
    text = re.sub(r'[^a-z0-9]+', '_', text)
    text = re.sub(r'_+', '_', text).strip('_')
    return text

def _metric_variants(metric: str) -> set[str]:
    m = _norm_metric(metric)
    if not m:
        return set()

    parts = [p for p in m.split('_') if p]
    variants = {m, m.replace('_', ' ')}

    for p in parts:
        variants.add(p)

    for i in range(len(parts) - 1):
        variants.add(parts[i] + "_" + parts[i + 1])
        variants.add(parts[i] + " " + parts[i + 1])

    return variants

# ════════════════════════════════════════════════════════════════════════════════
# CORE PROCESSING FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════════
def build_drain3() -> TemplateMiner:
    cfg = TemplateMinerConfig()
    cfg.profiling_enabled = False
    cfg.parametrize_numeric_tokens = True
    cfg.drain_sim_th = 0.4
    cfg.drain_depth = 4
    cfg.drain_max_children = 100
    cfg.drain_max_clusters = 1000
    return TemplateMiner(config=cfg)

def run_drain3(miner: TemplateMiner, log_lines: list[str]) -> list[dict]:
    counts: dict[str, int] = defaultdict(int)
    tmpls: dict[str, str] = {}
    samples: dict[str, str] = {}
    for line in log_lines:
        r = miner.add_log_message(line.strip())
        cid = str(r["cluster_id"])
        counts[cid] += 1
        tmpls[cid] = r["template_mined"]
        if cid not in samples:
            samples[cid] = line.strip()
    return sorted(
        [{"cluster_id": c, "template": tmpls[c], "count": counts[c], "sample": samples[c]}
         for c in counts],
        key=lambda x: x["count"], reverse=True,
    )

def detect_anomaly(metric, entity, values, recent_window=5, z_threshold=2.5):
    # Normalize input values into a numeric numpy array
    arr = np.array(values, dtype=float)

    # Protect against empty metric series
    if len(arr) == 0:
        return MetricFact(metric, entity, 0.0, 0.0, 0.0, 0.0, False, "normal")

    # Capture the latest point and overall mean for reporting
    current_value = float(arr[-1])
    series_mean = float(arr.mean())

    # Define metric-specific static thresholds for slow-moving or bounded metrics
    # These are checked first before statistical anomaly logic
    threshold_rules = {
        "memory_util": 80.0,
        "mem_util": 80.0,
        "memory_percent": 80.0,
        "mempercent": 80.0,
        "memory_usage": 80.0,
        "cpu_util": 90.0,
        "cpupercent": 90.0,
        "temperature": 70.0,
        "tempc": 70.0,
    }

    # Match threshold rule using exact key first, then substring fallback
    metric_key = metric.lower().strip()
    threshold_value = threshold_rules.get(metric_key)

    if threshold_value is None:
        for k, v in threshold_rules.items():
            if k in metric_key:
                threshold_value = v
                break

    # If a metric has a meaningful operational threshold and the latest value crosses it,
    # mark it as anomalous immediately without depending on z-score
    if threshold_value is not None and current_value >= threshold_value:
        pct = ((current_value - series_mean) / (abs(series_mean) + 1e-9)) * 100
        return MetricFact(
            metric=metric,
            entity=entity,
            baseline=round(series_mean, 3),
            current=round(current_value, 3),
            change_pct=round(pct, 1),
            z_score=0.0,
            is_anomaly=True,
            direction="spike"
        )

    # For short series, avoid silently dropping metric intelligence
    # Use a smaller effective recent window so short telemetry windows can still be evaluated
    effective_window = min(recent_window, max(2, len(arr) // 2))

    # If there are still too few samples for a meaningful baseline/recent split,
    # return a normal result rather than forcing unreliable statistics
    if len(arr) < effective_window + 1:
        return MetricFact(metric, entity, round(series_mean, 3), round(current_value, 3), 0.0, 0.0, False, "normal")

    # Split the series into baseline and recent comparison windows
    b_arr, c_arr = arr[:-effective_window], arr[-effective_window:]

    # If baseline becomes empty after splitting, use a conservative fallback
    if len(b_arr) == 0:
        return MetricFact(metric, entity, round(series_mean, 3), round(current_value, 3), 0.0, 0.0, False, "normal")

    # Compute baseline and current means
    bm = float(b_arr.mean())
    cm = float(c_arr.mean())

    # Compute a protected standard deviation to avoid divide-by-zero
    std = float(b_arr.std()) + 1e-9

    # Compute z-score and percent change between recent window and baseline window
    z = (cm - bm) / std
    pct = ((cm - bm) / (abs(bm) + 1e-9)) * 100

    # Cap extreme z-scores caused by near-zero baselines (e.g., crc_errors going 0→1)
    # These create misleadingly huge scores that pollute domain inference.
    # A z_score > 50 is capped and treated as low-confidence.
    LOW_BASELINE_CAP = 50.0
    if abs(bm) < 0.5 and abs(z) > LOW_BASELINE_CAP:
        z = LOW_BASELINE_CAP * (1 if z > 0 else -1)

    # Mark anomaly if deviation exceeds the configured z-score threshold
    ok = abs(z) > z_threshold
    d = ("spike" if z > 0 else "drop") if ok else "normal"

    # Return the same MetricFact shape expected by the rest of the pipeline
    return MetricFact(metric, entity, round(bm, 3), round(cm, 3), round(pct, 1), round(z, 2), ok, d)

def run_anomaly_detect(payload: dict) -> List[MetricFact]:
    """Detect anomalies from all metrics. Evaluates the peak of the recent window,
    not just the last value, so that already-recovered bursts are still captured."""
    results = []
    for metric_name, ents in payload.items():
        for entity_name, values in ents.items():
            # Skip if the values are strings or booleans that can't be converted to float
            try:
                arr = np.array(values, dtype=float)
            except (ValueError, TypeError):
                continue
            
            if len(arr) == 0:
                continue
            # Evaluate at the peak of the series, not just the last point.
            # This ensures a burst that has already recovered is still reported.
            peak_idx = int(np.argmax(arr)) if arr.max() > 0 else int(np.argmin(arr))
            fact_at_peak = detect_anomaly(metric_name, entity_name, list(arr[:peak_idx + 1]))
            fact_at_end  = detect_anomaly(metric_name, entity_name, values)
            # Use the peak-based result if it detected an anomaly; fall back to end-based
            fact = fact_at_peak if fact_at_peak.is_anomaly else fact_at_end
            if fact.is_anomaly:
                results.append(fact)
    return results

def filter_logs(log_lines: list[str], severity_only: bool = False) -> list[str]:
    # Preserve full context by default so NER remains deterministic and reproducible
    if not severity_only:
        return [line for line in log_lines if str(line).strip()]

    filtered = []
    for line in log_lines:
        # Skip blank or null-like entries
        if not str(line).strip():
            continue

        # Remove timestamps before evaluating severity so filtering is based on message text
        clean_line = _RE_TS.sub('', str(line)).strip(" ,:-")

        # Keep only logs containing severity-like signal terms when aggressive filtering is enabled
        if _RE_SEVERITY.search(clean_line):
            filtered.append(str(line))

    return filtered

def run_ner(log_lines: list[str]) -> ExtractedEntities:
    ifaces, ips, alarms, bgp, protos = set(), set(), set(), set(), set()

    # Apply optional preprocessing through a dedicated helper.
    # Default is False to preserve the existing behavior and avoid flow breakage.
    log_lines = filter_logs(log_lines, severity_only=False)

    macs, ssids = set(), set()
    
    for line in log_lines:
        # Remove timestamps to normalize the message before entity extraction
        line = _RE_TS.sub('', str(line))
        line = line.strip(" ,:-")

        # Skip empty lines after cleanup
        if not line:
            continue

        # Extract common networking entities from the normalized log line
        ifaces.update(_RE_IFACE.findall(line))
        ips.update(_RE_IP.findall(line))
        alarms.update(_RE_ALARM.findall(line))
        bgp.update(_RE_BGP.findall(line))
        macs.update(_RE_MAC.findall(line))
        
        ssid_matches = _RE_SSID.findall(line)
        if ssid_matches:
            ssids.update(ssid_matches)

        # Detect known protocol facilities from syslog-style alarm headers
        for m in _RE_FAC.finditer(line):
            if m.group(1).upper() in _KNOWN_PROTOS:
                protos.add(m.group(1).upper())

    return ExtractedEntities(
        interfaces=sorted(ifaces),
        ips=sorted(ips),
        alarm_codes=sorted(alarms),
        bgp_neighbors=sorted(bgp),
        protocols=sorted(protos),
        macs=sorted(macs),
        ssids=sorted(ssids),
    )

def load_kb_vocabulary(path: str) -> dict[str, list[str]]:
    try:
        with open(path) as f:
            kb = json.load(f)
        vocab: dict[str, list[str]] = {}
        for doc in kb:
            domain = doc.get("metadata", {}).get("domain", "unknown")
            if domain not in vocab:
                vocab[domain] = []
            vocab[domain].extend(doc.get("keywords", []))
            for h in doc.get("hypotheses", []):
                for lp in h.get("log_patterns", []):
                    kw = lp.get("keyword", "")
                    if kw:
                        vocab[domain].append(kw)
        return {d: list(dict.fromkeys(kws)) for d, kws in vocab.items()}
    except Exception as e:
        print(f"Warning: KB load failed: {e}")
        return {}

def _infer_domains(entities: ExtractedEntities, anomalies: List[MetricFact], root_event: dict = None) -> list[str]:
    root_event = root_event or {}
    scores: dict[str, float] = {}
    def _add(d, w): scores[d] = scores.get(d, 0.0) + w

    for code in entities.alarm_codes:
        fac = code.split('-')[0].upper()
        dom = _FACILITY_TO_DOMAIN.get(fac)
        if dom: _add(dom, 1.0 if dom in ("link", "routing") else 0.5)

    for proto in entities.protocols:
        dom = _FACILITY_TO_DOMAIN.get(proto.upper())
        if dom: _add(dom, 0.8)

    for a in anomalies:
        for frag, dom in _METRIC_TO_DOMAIN.items():
            if frag in a.metric.lower():
                _add(dom, min(a.z_score / 5.0, 1.0))
                break

    if entities.interfaces:
        scores["link"] = scores.get("link", 0.0) + 1.0  # Reduced from 3.0 to prevent overwhelming other domains

    # Root alarm remains authoritative for domain routing, but without incident-type hardcoding
    root_alarm = str(
        root_event.get("alarm_code")
        or root_event.get("alarm")
        or root_event.get("alarm_msg")
        or ""
    ).lower()
    alarm_parts = [p for p in re.split(r'[_\-\s]+', root_alarm) if p]
    for part in alarm_parts:
        for frag, dom in _METRIC_TO_DOMAIN.items():
            if frag in part:
                scores[dom] = scores.get(dom, 0.0) + 1.0  # Fixed typo: scores[dom] instead of scores["dom"]

    print("sorted scores", sorted(scores, key=lambda d: -scores[d]) or ["unknown"])
    return sorted(scores, key=lambda d: -scores[d]) or ["unknown"]

def build_query(
    root_event: dict,
    templates: list[dict],
    entities: ExtractedEntities,
    anomalies: List[MetricFact],    
    metrics_payload: dict = None,
    topology: Optional[dict] = None,
    kb_vocabulary: Optional[dict] = None,
    top_n_cause: int = 5,
    top_n_impact: int = 3,
) -> dict:
    metrics_payload = metrics_payload or {}
    t0 = time.monotonic()
    topology = topology or {}
    kb_vocab = kb_vocabulary or {}
    ev = root_event

    # Product schema first; legacy fallback keeps migration safe.
    device = (
        ev.get("device_name") or 
        (ev.get("device") if isinstance(ev.get("device"), str) else (ev.get("device") or {}).get("name")) or
        (ev.get("managed_object_name") if ev.get("managed_object_type") in ["Node", "Device", "System"] else "") or
        ev.get("managed_object_name") or
        "Unknown-Device"
    )
    severity = ev.get("severity")
    event_type = ev.get("event_type", "unknown")
    domains = _infer_domains(entities, anomalies, root_event=ev)
    primary = domains[0] if domains else "unknown"

    # Ordered evidence sources by your requested weighting priority
    root_alarm_terms = _root_alarm_terms(ev)
    root_message_terms = _root_message_terms(ev, device_name=device)
    metric_terms = _metric_evidence_terms(anomalies)
    entity_terms = []
    template_terms = []
    kb_hint_terms = _limited_kb_hints(domains, kb_vocab, per_domain=2)

    # Tag + deduplicate templates
    seen: set[str] = set()
    scored = []
    for tmpl in templates:
        clean = _strip_header(tmpl["template"])
        if clean in seen: continue
        seen.add(clean)
        z = _zone(clean)
        scored.append({**tmpl, "clean": clean, "zone": z, "score": _score(tmpl["count"], z)})
    scored.sort(key=lambda x: (x["zone"] != "probable_cause", -x["score"]))

    cause_list = [t for t in scored if t["zone"] == "probable_cause"]
    impact_list = [t for t in scored if t["zone"] == "impact"]
    signal_list = [t for t in scored if t["zone"] != "noise"]

    # Build interface/device identifiers after stronger RCA evidence
    for iface in entities.interfaces:
        entity_terms.append(iface.lower())
    if device:
        entity_terms.append(str(device).lower())
    for ip in entities.bgp_neighbors:
        entity_terms.append(ip.lower())
    for proto in entities.protocols:
        entity_terms.append(proto.lower())
    for code in entities.alarm_codes:
        entity_terms.append(code.lower())

    # Add metric names from anomalies to keywords to help retrieval
    for a in anomalies:
        metric_terms.append(a.metric.replace("_", " "))

    # Product schema enrichment
    if isinstance(ev.get("device"), dict):
        for k in ("id", "type", "vendor", "role"):
            v = ev["device"].get(k)
            if v:
                entity_terms.append(str(v).lower())
    metric_block = ev.get("metric") or {}
    if isinstance(metric_block, dict):
        for k in ("name", "unit"):
            v = metric_block.get(k)
            if v:
                entity_terms.append(str(v).lower())

    # Template-derived tokens are useful, but lower priority than root and metric evidence
    for t in cause_list[:top_n_cause]:
        template_terms.extend(tok.lower() for tok in _tokens(t["template"], device))

    # ── semantic_text: mirrors KB embedding_text structure ───────────────────
    parts = [f"Category: {' '.join(domains[:2])}"]

    # Keep root alarm first so semantic retrieval is anchored to the incident label
    if root_alarm_terms:
        parts.append(
            f"Intent: {severity if severity is not None else ''} "
            f"{root_alarm_terms[1] if len(root_alarm_terms) > 1 else root_alarm_terms[0]} on {device}"
        )
    else:
        parts.append(
            f"Intent: {severity if severity is not None else ''}"
            f" {str(ev.get('alarm_code') or ev.get('alarm') or '').replace('_',' ').lower()} on {device}"
        )

    sit = []
    if root_message_terms:
        sit.append(f"Root message indicates {' '.join(root_message_terms[:6])}")
    if entities.interfaces:
        sit.append(f"Interface {', '.join(entities.interfaces[:2])} on device {device}")
    flap_f = next((a for a in anomalies if "flap" in a.metric.lower()), None)
    if flap_f: sit.append(f"is flapping ({flap_f.current:.0f} flaps)")
    err_f = [a for a in anomalies if any(w in a.metric.lower() for w in ("error","crc","drop"))]
    if err_f:
        sit.append("with " + ", ".join(f"{a.metric} {a.direction} {a.change_pct:+.0f}%" for a in err_f[:3]))
    if entities.bgp_neighbors:
        sit.append(f"BGP neighbor {', '.join(entities.bgp_neighbors[:2])} impacted")
    if entities.macs:
        sit.append(f"Client MAC {', '.join(entities.macs[:2])} involved")
    if entities.ssids:
        sit.append(f"SSID {', '.join(entities.ssids[:2])} affected")
    if topology.get("downstream_count"):
        sit.append(f"{topology['downstream_count']} downstream devices affected")
    if topology.get("redundancy_state"):
        sit.append(f"redundancy {topology['redundancy_state']}")
    if sit: parts.append("Situation: " + ". ".join(sit) + ".")

    if cause_list:
        parts.append("Log evidence: " +
            "; ".join(f"{t['clean']} (x{t['count']})" for t in cause_list[:top_n_cause]) + ".")
    if impact_list:
        parts.append("Impact events: " +
            "; ".join(f"{t['clean']} (x{t['count']})" for t in impact_list[:top_n_impact]) + ".")
    if anomalies:
        parts.append("Metric anomalies: " +
            ", ".join(f"{a.metric} {a.direction} ({a.change_pct:+.0f}%, z={a.z_score:.1f})"
                      for a in anomalies) + ".")

    # Keep KB hints small and last so broad vocab does not overpower root intent
    if kb_hint_terms:
        parts.append("Keywords: " + ", ".join(kb_hint_terms) + ".")

    semantic_text = "  ".join(parts)

    # ── keyword_string: assembled strictly by requested priority ─────────────
    kw: list[str] = []

    # 1. Root alarm tokens
    kw.extend(root_alarm_terms)

    # 2. Root message tokens
    kw.extend(root_message_terms)

    # 3. Metric-derived RCA evidence
    kw.extend(metric_terms)

    # 4. Interface/device identifiers
    kw.extend(entity_terms)

    # 5. Template tokens
    kw.extend(template_terms)

    # 6. KB vocabulary hints
    kw.extend(kb_hint_terms)

    # Extra product-schema evidence for recall without changing priority logic.
    # This improves matching for production events while preserving the same ordered assembly.
    if isinstance(ev.get("status"), dict):
        for k, v in ev["status"].items():
            if v is not None:
                kw.append(f"{k}_{str(v).lower()}")
    if ev.get("event_type"):
        kw.append(str(ev["event_type"]).lower())

    # 7. ALL metric names from payload (not just anomalies) — ensures signal_boost
    #    can match KB signals for metrics that recovered before the last point.
    for metric_name in metrics_payload.keys():
        kw.append(metric_name.replace("_", " "))

    # Deduplicate while preserving order
    keyword_string = " ".join(
        dict.fromkeys(term.strip() for term in kw if term and term.strip())
    )

    # ── metadata_filters: KB field names only ────────────────────────────────
    # metadata_filters = {}
    metadata_filters = {"domain": primary} #TODO
    if severity is not None:
        metadata_filters["severity"] = severity
    if event_type:
        metadata_filters["event_type"] = event_type

    # ── log_features: clean, zone-tagged, for LLM context ───────────────────
    log_features = [
        {
            "template": t["clean"],
            "count": t["count"],
            "zone": t["zone"],
            "score": round(t["score"], 2),
            "sample": t["sample"],
        }
        for t in signal_list
    ]

    # ── metric_facts: serialisable ───────────────────────────────────────────
    metric_facts = [
        {
            "metric": a.metric,
            "entity": a.entity,
            "baseline": a.baseline,
            "current": a.current,
            "change_pct": a.change_pct,
            "z_score": a.z_score,
            "direction": a.direction,
        }
        for a in anomalies
    ]

    # ── final JSON-ready dict ────────────────────────────────────────────────
    return {
        "semantic_text": semantic_text,
        "keyword_string": keyword_string,
        "metadata_filters": metadata_filters,
        "log_features": log_features,
        "metric_facts": metric_facts,
        "inferred_domains": domains,
        "entities": {
            "interfaces": entities.interfaces,
            "ips": entities.ips,
            "alarm_codes": entities.alarm_codes,
            "bgp_neighbors": entities.bgp_neighbors,
            "protocols": entities.protocols,
            "macs": entities.macs,
            "ssids": entities.ssids,
        },
        "topology": topology,
        "build_ms": round((time.monotonic() - t0) * 1000, 2),
    }

# ════════════════════════════════════════════════════════════════════════════════
# SEARCH AND RERANK FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════════
def apply_filters(results, filters):
    filtered = []

    for idx in results:
        meta = metadata[idx]

        match_all_applicable_filters = True
        for k, v in filters.items():
            # If the filter key is not in the document's metadata, this filter is not applicable
            # to this document. We don't consider it a mismatch.
            if k not in meta:
                continue # Skip this filter for this document

            # If the filter key IS in the document's metadata, then check for a match
            meta_value = meta[k]
            if isinstance(meta_value, list):
                if v not in meta_value:
                    match_all_applicable_filters = False
                    break # Mismatch found, no need to check further filters for this document
            else:
                if meta_value != v:
                    match_all_applicable_filters = False
                    break # Mismatch found, no need to check further filters for this document

        if match_all_applicable_filters:
            filtered.append(idx)

    return filtered

def signal_boost(doc, query_json):
    score = 0.0

    # Build a unified set of all metric names present in the payload
    # (both anomalies AND all metrics the user provided, regardless of anomaly status)
    query_metrics = set()
    for mf in query_json.get("metric_facts", []):
        query_metrics.update(_metric_variants(mf.get("metric", "")))
    # Also include all metrics from the raw payload via the keyword string
    keyword_string = (query_json.get("keyword_string", "") or "").lower()

    for s in doc["raw"].get("signals", []):
        metric = s.get("metric", "")
        weight = s.get("weight", 0.3)

        doc_metric_variants = _metric_variants(metric)

        # Strong boost: exact/normalized structured metric match
        if query_metrics & doc_metric_variants:
            score += weight
            continue

        # Weak fallback: keyword_string overlap
        if any(v in keyword_string for v in doc_metric_variants if len(v) > 2):
            score += weight * 0.4

    return score

def log_boost(doc, query_keywords):
    score = 0
    q = query_keywords.lower()

    for h in doc["raw"].get("hypotheses", []):
        for lp in h.get("log_patterns", []):
            if lp["keyword"].lower() in q:
                score += lp.get("weight", 0.3)

    return score

def hybrid_search_from_json(query_json, top_k=5):

    query_semantic = query_json["semantic_text"]
    query_keywords = query_json["keyword_string"]
    filters = query_json.get("metadata_filters", {})

    # ----- Semantic Search -----
    q_emb = model.encode([query_semantic])
    D, I = index.search(np.array(q_emb), 20)

    # ----- Keyword Search -----
    tokenized_query = query_keywords.lower().split()
    bm25_scores = bm25.get_scores(tokenized_query)

    # ----- RRF Fusion -----
    scores = {}

    for rank, idx in enumerate(I[0]):
        scores[idx] = scores.get(idx, 0) + 1 / (58 + rank)

    sorted_bm25 = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
    for rank, idx in enumerate(sorted_bm25[:20]):
        scores[idx] = scores.get(idx, 0) + 1 / (50 + rank)

    # ----- FINAL SCORING -----
    final_scores = []

    for idx, base_score in scores.items():
        doc = docs[idx]

        log_score = 0 #log_boost(doc, query_keywords)
        signal_score = signal_boost(doc, query_json) #should be added as the last verification

        total_score = base_score + log_score + signal_score
        final_scores.append((idx, total_score))

    # ----- Sort -----
    ranked = sorted(final_scores, key=lambda x: x[1], reverse=True)

    # ----- Apply Filters -----
    if filters:
        ranked = [(idx, score) for idx, score in ranked if idx in apply_filters([idx], filters)]

    # ----- Return WITH SCORES -----
    return [
        {
            "doc": docs[idx]["raw"],
            "score": score
        }
        for idx, score in ranked[:top_k]
    ]

def hybrid_search_with_rerank(query_json, top_k=5, retrieve_k=30, rerank_k=15):
    query_semantic = query_json["semantic_text"]
    query_keywords = query_json["keyword_string"]
    filters = query_json.get("metadata_filters", {})

    # ----- Semantic Search -----
    q_emb = model.encode([query_semantic])
    D, I = index.search(np.array(q_emb), retrieve_k)

    # ----- Keyword Search -----
    tokenized_query = query_keywords.lower().split()
    bm25_scores = bm25.get_scores(tokenized_query)

    # ----- RRF Fusion -----
    scores = {}

    for rank, idx in enumerate(I[0]):
        if idx == -1:
            continue
        scores[idx] = scores.get(idx, 0) + 1 / (50 + rank)

    sorted_bm25 = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
    for rank, idx in enumerate(sorted_bm25[:retrieve_k]):
        scores[idx] = scores.get(idx, 0) + 1 / (40 + rank)

    # ----- Pre-rerank scoring -----
    pre_ranked = []
    for idx, base_score in scores.items():
        doc = docs[idx]
        log_score = log_boost(doc, query_keywords)
        signal_score = 0  # keep your current logic
        total_score = base_score + log_score + signal_score
        pre_ranked.append((idx, total_score))

    pre_ranked = sorted(pre_ranked, key=lambda x: x[1], reverse=True)

    # ----- Apply filters once, efficiently -----
    if filters:
        valid_ids = set(apply_filters([idx for idx, _ in pre_ranked], filters))
        pre_ranked = [(idx, score) for idx, score in pre_ranked if idx in valid_ids]

    # ----- Candidate pool for reranking -----
    candidates = pre_ranked[:rerank_k]
    if not candidates:
        return []

    candidate_ids = [idx for idx, _ in candidates]
    candidate_texts = [
        docs[idx]["text"] + "\nKeywords: " + docs[idx]["keywords"]
        for idx in candidate_ids
    ]

    # ----- Cross-encoder reranking -----
    pairs = [(query_semantic, doc_text) for doc_text in candidate_texts]
    ce_scores = reranker.predict(pairs, batch_size=16, show_progress_bar=False)

    # Combine pre-rank score + CE score
    # CE is stronger, so give it more weight
    reranked = []
    for idx, pre_score, ce_score in zip(candidate_ids, [s for _, s in candidates], ce_scores):
        # Weighted combination of scores
        raw_final = (0.25 * pre_score) + (0.75 * float(ce_score))
        # Sigmoid normalization to get a value between 0 and 1
        import math
        final_score = 1 / (1 + math.exp(-raw_final))
        reranked.append((idx, final_score, float(ce_score), pre_score))

    reranked = sorted(reranked, key=lambda x: x[1], reverse=True)

    return [
        {
            "doc": docs[idx],
            "final_score": final_score,
            "cross_encoder_score": ce_score,
            "prerank_score": pre_score
        }
        for idx, final_score, ce_score, pre_score in reranked[:top_k]
    ]

# ════════════════════════════════════════════════════════════════════════════════
# RESULT FORMATTING / REPORTING FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════════
def format_anomaly_results(anomalies):
    print("\n✅ Anomaly detection")
    print(f"   {'METRIC':22} {'ENTITY':28} {'DIR':6} {'CHANGE':>10}  Z-SCORE")
    print(f"   {'─'*22} {'─'*28} {'─'*6} {'─'*10}  {'─'*7}")
    for a in anomalies:
        print(f"   {a.metric:22} {a.entity:28} {a.direction:6} {a.change_pct:>+9.1f}%  {a.z_score:>7.2f}")

def format_ner_results(entities):
    print("\n✅ NER entities")
    print(f"   interfaces    : {entities.interfaces}")
    print(f"   alarm_codes   : {entities.alarm_codes}")
    print(f"   bgp_neighbors : {entities.bgp_neighbors}")
    print(f"   protocols     : {entities.protocols}")

def format_drain3_results(templates, total_logs=0):
    print("\n✅ Drain3 templates")
    print(f"   {len(templates)} clusters from {total_logs} log lines")
    for t in templates[:6]:
        print(f"   [{t['count']:>3}x] {t['template'][:70]}")

def format_query_results(query_json):
    print("\n✅ Query Builder output (pure JSON)")
    print(json.dumps(query_json, indent=2))

def format_search_results(results, search_type):
    if search_type == "normal":
        for r in results:
            doc = r["doc"]
            score = r["score"]
            print("------")
            print("Intent ID   :", doc["intent_id"])
            print("Description :", doc["description"])
            print("render_template", doc.get("render_template", doc.get("situation_text", "")))
            print("Score       :", round(score, 3))
    elif search_type == "rerank":
        for r in results:
            doc = r["doc"]["raw"]
            print("------")
            print("Intent ID           :", doc["intent_id"])
            print("Description         :", doc.get("description"))
            print("Pre-rank score      :", round(r["prerank_score"], 4))
            print("Cross-encoder score :", round(r["cross_encoder_score"], 4))
            print("Final score         :", round(r["final_score"], 4))


def save_kb_index(index, metadata, index_path="kb.index", meta_path="kb_metadata.pkl"):
    """Saves the index and metadata for future reuse."""
    faiss.write_index(index, index_path)
    with open(meta_path, "wb") as f:
        pickle.dump(metadata, f)
    print(f"KB persisted: {index_path}, {meta_path}")

def load_kb_index(index_path="kb.index", meta_path="kb_metadata.pkl"):
    """Loads the index and metadata from disk."""
    if not os.path.exists(index_path):
        return None, None
    index = faiss.read_index(index_path)
    with open(meta_path, "rb") as f:
        metadata = pickle.load(f)
    print(f"KB loaded from disk: {index_path}")
    return index, metadata
# ════════════════════════════════════════════════════════════════════════════════
# RESOURCE INITIALIZATION
# ════════════════════════════════════════════════════════════════════════════════
def initialize_resources():
    """Initializes and loads all required models and indices."""
    global docs, metadata, model, index, bm25, reranker

    if model is not None:
        return

    print("Initializing pipeline resources...")
    if os.path.exists(index_path) and os.path.exists(meta_path):
        index, meta_data = load_kb_index(index_path, meta_path)
        docs = meta_data["docs"]
        metadata = meta_data["metadata"]
        tokenized_docs = meta_data["tokenized_docs"]
        bm25 = BM25Okapi(tokenized_docs)
        model = SentenceTransformer('all-MiniLM-L6-v2')
        reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)
    else:
        try:
            with open(KB_PATH, 'r') as f:
                kb = json.load(f)
        except Exception as e:
            print(f"Error loading KB file: {e}")
            raise Exception("Knowledge Base file not found.")

        docs = []
        metadata = []
        for item in kb:
            keywords = list(item.get("keywords", []))
            for h in item.get("hypotheses", []):
                for lp in h.get("log_patterns", []):
                    keywords.append(lp.get("keyword", ""))

            docs.append({
                "text": item.get("retrieval_text", item.get("embedding_text", "")),
                "reranker_text": item.get("reranker_text", ""),
                "render_template": item.get("render_template", item.get("situation_text", "")),
                "metric_family": item.get("metric_family", ""),
                "distinguishing_clues": item.get("distinguishing_clues", []),
                "negative_clues": item.get("negative_clues", []),
                "keywords": " ".join(keywords),
                "raw": item
            })
            metadata.append(item.get("metadata", {}))

        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode([d["text"] for d in docs])
        index = faiss.IndexFlatL2(384)
        index.add(np.array(embeddings, dtype="float32"))

        tokenized_docs = [(d["text"] + " " + d["keywords"]).lower().split() for d in docs]
        bm25 = BM25Okapi(tokenized_docs)
        reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)

        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        faiss.write_index(index, index_path)
        with open(meta_path, "wb") as f:
            pickle.dump({
                "docs": docs,
                "metadata": metadata,
                "tokenized_docs": tokenized_docs
            }, f)

def run_full_pipeline(logs, event, metrics, topo=None):
    """Execution wrapper for API/external calls."""
    # LIVE EXECUTION PROOF: This prints to your terminal every time you click the button
    from datetime import datetime
    print(f"\n[🚀 PIPELINE START] {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
    print(f"   Analyzing: {len(logs)} Logs, {len(metrics.get('metrics', {}))} Metrics")
    
    initialize_resources()
    topo = topo or {}
    
    # Step 1: Log template mining
    miner = build_drain3()
    templates = run_drain3(miner, logs)
    
    # Step 2: Anomaly detection
    anomalies = run_anomaly_detect(metrics)
    
    # Step 3: Entity extraction
    entities = run_ner(logs)
    
    # Step 4: Load KB and build query
    kb_vocab = load_kb_vocabulary(KB_PATH)
    query_json = build_query(
        root_event=event,
        templates=templates,
        entities=entities,
        anomalies=anomalies,
        metrics_payload=metrics,
        topology=topo,
        kb_vocabulary=kb_vocab,
    )
    
    # Step 5: Hybrid Search
    results = hybrid_search_with_rerank(query_json)
    
    return {
        "query": query_json,
        "anomalies": [asdict(a) for a in anomalies],
        "entities": asdict(entities),
        "templates": templates,
        "results": results
    }

def main(logs=None, event=None, metrics=None, topo=None):
    print("Starting RCA Pipeline...")
    
    # Load configurations or resources
    initialize_resources()
    
    # Pre-process inputs
    logs = logs or DEFAULT_RAW_LOGS
    event = event or DEFAULT_ROOT_EVENT
    metrics = metrics or DEFAULT_METRICS_PAYLOAD
    topo = topo or DEFAULT_TOPOLOGY

    # ── Log Mining ───────────────────────────────────────────────────────────
    miner = build_drain3()
    templates = run_drain3(miner, logs)
    format_drain3_results(templates, total_logs=len(logs))

    anomalies = run_anomaly_detect(metrics)
    format_anomaly_results(anomalies)

    entities = run_ner(logs)
    format_ner_results(entities)

    kb_vocab = load_kb_vocabulary(KB_PATH)
    query_json = build_query(
        root_event=event,
        templates=templates,
        entities=entities,
        anomalies=anomalies,
        metrics_payload=metrics,
        topology=topo,
        kb_vocabulary=kb_vocab,
    )
    format_query_results(query_json)

    global docs, metadata, model, index, bm25, reranker

    if os.path.exists(index_path) and os.path.exists(meta_path):
        index = faiss.read_index(index_path)
        with open(meta_path, "rb") as f:
            saved = pickle.load(f)

        docs = saved["docs"]
        metadata = saved["metadata"]
        tokenized_docs = saved["tokenized_docs"]

        bm25 = BM25Okapi(tokenized_docs)
        model = SentenceTransformer('all-MiniLM-L6-v2')
        reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)
    else:
        try:
            with open(KB_PATH, 'r') as f:
                kb = json.load(f)
        except Exception as e:
            print(f"Error loading KB file: {e}")
            print("KB file not found, skipping search")
            return

        docs = []
        metadata = []

        for item in kb:
            keywords = list(item.get("keywords", []))
            for h in item.get("hypotheses", []):
                for lp in h.get("log_patterns", []):
                    keywords.append(lp.get("keyword", ""))

            doc_text = item.get("retrieval_text", item.get("embedding_text", ""))
            reranker_text = item.get("reranker_text", "")
            render_template = item.get("render_template", item.get("situation_text", ""))
            metric_family = item.get("metric_family", "")
            distinguishing_clues = item.get("distinguishing_clues", [])
            negative_clues = item.get("negative_clues", [])

            docs.append({
                "text": doc_text,
                "reranker_text": reranker_text,
                "render_template": render_template,
                "metric_family": metric_family,
                "distinguishing_clues": distinguishing_clues,
                "negative_clues": negative_clues,
                "keywords": " ".join(keywords),
                "raw": item
            })

            metadata.append(item.get("metadata", {}))

        model = SentenceTransformer('all-MiniLM-L6-v2')
        embeddings = model.encode([d["text"] for d in docs])
        index = faiss.IndexFlatL2(384)
        index.add(np.array(embeddings, dtype="float32"))

        tokenized_docs = [
            (d["text"] + " " + d["keywords"]).lower().split()
            for d in docs
        ]
        bm25 = BM25Okapi(tokenized_docs)

        reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=512)

        os.makedirs(os.path.dirname(index_path), exist_ok=True)
        faiss.write_index(index, index_path)
        with open(meta_path, "wb") as f:
            pickle.dump({
                "docs": docs,
                "metadata": metadata,
                "tokenized_docs": tokenized_docs
            }, f)    # Step 6: Run searches

    if RUN_NORMAL_HYBRID_SEARCH:
        print("\n--- Normal Hybrid Search Results ---")
        results_normal = hybrid_search_from_json(query_json)
        format_search_results(results_normal, "normal")

    if RUN_RERANK_SEARCH:
        print("\n--- Reranked Search Results ---")
        t0 = time.time()
        results_rerank = hybrid_search_with_rerank(
            query_json,
            top_k=5,
            retrieve_k=30,
            rerank_k=15
        )
        elapsed_ms = (time.time() - t0) * 1000
        print(f"Reranked search time: {elapsed_ms:.2f} ms")
        print("log_features", query_json['log_features'])
        print("metric_facts", query_json['metric_facts'])
        format_search_results(results_rerank, "rerank")

    print("RCA Pipeline completed.")

# ════════════════════════════════════════════════════════════════════════════════
# if __name__ == "__main__": main()
# ════════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    main()



# numpy
# drain3
# rank-bm25
# sentence-transformers
# faiss-cpu