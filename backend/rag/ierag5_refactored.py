# -*- coding: utf-8 -*-
"""
IERAG4 - Root Cause Analysis Pipeline (Refactored)
Clean, maintainable, and more production-ready RCA workflow.
"""

import re
import json
import time
import logging
import pickle
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, List, Dict
from collections import defaultdict

import numpy as np
import torch
import faiss

from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
from sentence_transformers import SentenceTransformer, CrossEncoder
from rank_bm25 import BM25Okapi


# ========================= CONFIGURATION =========================
class Config:
    # Paths — relative to this file so they work on any machine
    _HERE = Path(__file__).resolve().parent
    KB_PATH = _HERE / "rca_json.json"
    INDEX_PATH = _HERE / "data" / "kb.index"
    META_PATH = _HERE / "data" / "kb_metadata.pkl"

    # Runtime flags
    RUN_RERANK_SEARCH = True
    RUN_NORMAL_HYBRID_SEARCH = False

    # Models
    EMBEDDING_MODEL = "all-MiniLM-L6-v2"
    RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"

    # Search params
    RETRIEVE_K = 30
    RERANK_K = 15
    TOP_K = 5


# ========================= LOGGING =========================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s'
)
logger = logging.getLogger(__name__)


# ========================= DATA CLASSES =========================
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


# Regex patterns
_RE_IFACE = re.compile(
    r'\b(?:GigabitEthernet|TenGigabitEthernet|TenGig|GigE|FastEthernet|'
    r'Serial|Tunnel|Loopback|Vlan|Te|Gi|Fa)\d+(?:[/:.]\d+){0,3}\b',
    re.IGNORECASE,
)
_RE_IP = re.compile(
    r'\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b'
)
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

_IMPACT_MNEMONICS = {"ADJCHANGE", "NEIGHBOR", "NOTIFICATION", "PEER", "SESSION"}
_ALARM_RE = re.compile(r'%([A-Z][A-Z0-9_-]{1,15})-(\d)-([A-Z0-9_]{2,20}):?')
_WILDCARD_RE = re.compile(r'<*>|(\d+)')
_STOPWORDS = {
    "the", "for", "from", "with", "into", "onto", "that", "this", "and", "not",
    "but", "are", "was", "been", "has", "have", "on", "in", "to", "at", "by", "of",
    "is", "it", "or", "more", "than", "last", "due", "sent", "high", "low",
    "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
}

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
}

_METRIC_TO_DOMAIN = {
    "crc": "link", "input_drop": "link", "output_drop": "link",
    "flap": "link", "in_error": "link", "out_error": "link",
    "bgp": "routing", "ospf": "routing", "route": "routing",
    "cpu": "system", "mem": "system", "load": "system",
    "util": "performance", "latency": "performance", "queue": "performance",
    "temp": "thermal", "fan": "thermal",
    "pps": "security",
}


# ========================= PIPELINE CLASS =========================
class RCAPipeline:
    def __init__(self, config=None):
        self.config = config or Config()
        self.model = None
        self.reranker = None
        self.index = None
        self.docs = []
        self.metadata = []
        self.bm25 = None
        self.raw_logs = None

        self._ensure_dirs()
        self._load_or_build_index()

    def _ensure_dirs(self):
        self.config.INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
        self.config.META_PATH.parent.mkdir(parents=True, exist_ok=True)

    def _load_or_build_index(self):
        """Load index if exists, otherwise build from KB"""
        if self.config.INDEX_PATH.exists() and self.config.META_PATH.exists():
            logger.info("Loading existing FAISS index...")
            self._load_index()
        else:
            logger.info("Building new FAISS + BM25 index from KB...")
            self._build_index()

    def _load_index(self):
        self.index = faiss.read_index(str(self.config.INDEX_PATH))
        with open(self.config.META_PATH, "rb") as f:
            saved = pickle.load(f)

        self.docs = saved["docs"]
        self.metadata = saved["metadata"]
        tokenized_docs = saved["tokenized_docs"]

        self.bm25 = BM25Okapi(tokenized_docs)
        self.model = SentenceTransformer(self.config.EMBEDDING_MODEL)
        self.reranker = CrossEncoder(self.config.RERANKER_MODEL, max_length=512)

    def _build_index(self):
        try:
            with open(self.config.KB_PATH, encoding='utf-8') as f:
                kb = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load KB: {e}")
            raise

        self.model = SentenceTransformer(self.config.EMBEDDING_MODEL)
        self.reranker = CrossEncoder(self.config.RERANKER_MODEL, max_length=512)

        docs_list = []
        metadata_list = []

        for item in kb:
            item = self._enrich_document(item)
            situation = item.get("situation", {})

            doc_text = " ".join(filter(None, [
                item.get("title"),
                item.get("description"),
                item.get("root_cause_analysis")
            ]))

            reranker_text = item.get("reranker_text") or doc_text

            docs_list.append({
                "text": doc_text.strip(),
                "retrieval_text": item.get("retrieval_text", doc_text).strip(),
                "reranker_text": reranker_text.strip(),
                "render_template": item.get("render_template", ""),
                "situation": situation,
                "keywords": " ".join(item.get("keywords", [])),
                "raw": item
            })

            metadata_list.append(item.get("metadata", {}))

        # FAISS Index
        embeddings = self.model.encode([d["retrieval_text"] for d in docs_list])
        faiss.normalize_L2(embeddings)
        self.index = faiss.IndexFlatIP(embeddings.shape[1])
        # self.index.add(np.array(embeddings, dtype="float32"))
        self.index.add(embeddings)

        # BM25
        tokenized = [(d["text"] + " " + d["keywords"]).lower().split() for d in docs_list]
        self.bm25 = BM25Okapi(tokenized)

        self.docs = docs_list
        self.metadata = metadata_list

        self._save_index()

    def _enrich_document(self, item: dict) -> dict:
        situation = item.get("situation", {})

        retrieval_parts = [
            f"Category: {item.get('category_hierarchy', {}).get('category', '')}",
            f"Subcategory: {item.get('category_hierarchy', {}).get('subcategory', '')}",
            f"Intent: {item.get('title', '')}",
            f"Symptoms: {' '.join(situation.get('symptoms', []))}",
            f"Metrics: {', '.join(m.get('metric', '') for m in situation.get('metrics', []))}",
            f"Logs: {' '.join(situation.get('log_patterns', []))}",
            item.get("root_cause_analysis", ""),
            " ".join(item.get("keywords", []))
        ]

        reranker_text = f"""
        Intent: {item.get('rca_id')}
        Title: {item.get('title')}
        Summary: {item.get('description')}
        Symptoms: {'. '.join(situation.get('symptoms', []))}
        Negative: {'. '.join(situation.get('negative_indicators', []))}
        Hypotheses: {[h.get('description', '') for h in item.get('hypotheses', [])]}
        """

        item["retrieval_text"] = " ".join(filter(None, retrieval_parts)).strip()
        item["reranker_text"] = reranker_text.strip()
        return item

    def _save_index(self):
        faiss.write_index(self.index, str(self.config.INDEX_PATH))
        with open(self.config.META_PATH, "wb") as f:
            pickle.dump({
                "docs": self.docs,
                "metadata": self.metadata,
                "tokenized_docs": [(d["text"] + " " + d["keywords"]).lower().split() for d in self.docs]
            }, f)
        logger.info(f"Index saved successfully.")

    # ====================== CORE FUNCTIONS ======================
    def _build_drain3(self) -> TemplateMiner:
        cfg = TemplateMinerConfig()
        cfg.profiling_enabled = False
        cfg.parametrize_numeric_tokens = True
        cfg.drain_sim_th = 0.4
        cfg.drain_depth = 4
        cfg.drain_max_children = 100
        cfg.drain_max_clusters = 1000
        return TemplateMiner(config=cfg)

    def _run_drain3(self, miner: TemplateMiner, log_lines: list[str]) -> list[dict]:
        counts = defaultdict(int)
        tmpls = {}
        samples = {}
        for line in log_lines:
            line = str(line).strip()
            if not line: continue
            
            # Mask timestamps for better clustering
            masked_line = _RE_TS.sub('<TS>', line)
            # Mask common noisy IDs
            masked_line = _RE_IFACE.sub('<IF>', masked_line)
            masked_line = _RE_IP.sub('<IP>', masked_line)
            
            r = miner.add_log_message(masked_line)
            cid = str(r["cluster_id"])
            counts[cid] += 1
            tmpls[cid] = r["template_mined"]
            if cid not in samples:
                samples[cid] = line

        return sorted(
            [{"cluster_id": c, "template": tmpls[c], "count": counts[c], "sample": samples[c]}
             for c in counts],
            key=lambda x: x["count"], reverse=True
        )

    def _filter_logs(self, log_lines, severity_only=False):
        if not severity_only:
            return [line for line in log_lines if str(line).strip()]

        filtered = []
        for line in log_lines:
            if not str(line).strip():
                continue
            clean_line = _RE_TS.sub('', str(line)).strip(" ,:-")
            if _RE_SEVERITY.search(clean_line):
                filtered.append(str(line))
        return filtered

    def _run_anomaly_detect(self, payload):
        results = []
        for metric_name, ents in payload.items():
            for entity_name, values in ents.items():
                try:
                    fact = self._detect_anomaly(metric_name, entity_name, values)
                    if fact.is_anomaly:
                        results.append(fact)
                except (ValueError, TypeError):
                    # Skip non-numeric metrics (e.g. BGP state 'Established', oper status 'up/down')
                    logger.debug(f"Skipping non-numeric metric: {metric_name}.{entity_name}")
        return results

    def _detect_anomaly(self, metric, entity, values, recent_window=5, z_threshold=2.5):
        arr = np.array(values, dtype=float)
        if len(arr) == 0:
            return MetricFact(metric, entity, 0.0, 0.0, 0.0, 0.0, False, "normal")

        current_value = float(arr[-1])
        series_mean = float(arr.mean())

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

        metric_key = metric.lower().strip()
        threshold_value = threshold_rules.get(metric_key)
        if threshold_value is None:
            for k, v in threshold_rules.items():
                if k in metric_key:
                    threshold_value = v
                    break

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
                direction="spike",
            )

        effective_window = min(recent_window, max(2, len(arr) // 2))
        if len(arr) < effective_window + 1:
            return MetricFact(metric, entity, round(series_mean, 3), round(current_value, 3), 0.0, 0.0, False, "normal")

        b_arr, c_arr = arr[:-effective_window], arr[-effective_window:]
        if len(b_arr) == 0:
            return MetricFact(metric, entity, round(series_mean, 3), round(current_value, 3), 0.0, 0.0, False, "normal")

        bm = float(b_arr.mean())
        cm = float(c_arr.mean())
        std = float(b_arr.std()) + 1e-9
        z = (cm - bm) / std
        pct = ((cm - bm) / (abs(bm) + 1e-9)) * 100
        ok = abs(z) > z_threshold
        d = ("spike" if z > 0 else "drop") if ok else "normal"

        return MetricFact(
            metric=metric,
            entity=entity,
            baseline=round(bm, 3),
            current=round(cm, 3),
            change_pct=round(pct, 1),
            z_score=round(z, 2),
            is_anomaly=ok,
            direction=d,
        )

    def _run_ner(self, log_lines):
        ifaces, ips, alarms, bgp, protos = set(), set(), set(), set(), set()
        log_lines = self._filter_logs(log_lines, severity_only=False)

        for line in log_lines:
            line = _RE_TS.sub('', str(line)).strip(" ,:-")
            if not line:
                continue
            ifaces.update(_RE_IFACE.findall(line))
            ips.update(_RE_IP.findall(line))
            alarms.update(_RE_ALARM.findall(line))
            bgp.update(_RE_BGP.findall(line))
            for m in _RE_FAC.finditer(line):
                if m.group(1).upper() in _KNOWN_PROTOS:
                    protos.add(m.group(1).upper())

        return ExtractedEntities(
            interfaces=sorted(ifaces),
            ips=sorted(ips),
            alarm_codes=sorted(alarms),
            bgp_neighbors=sorted(bgp),
            protocols=sorted(protos),
        )

    def _load_kb_vocabulary(self):
        try:
            with open(self.config.KB_PATH, encoding='utf-8') as f:
                kb = json.load(f)
            vocab = {}
            for doc in kb:
                domain = doc.get("metadata", {}).get("domain", "unknown")
                if domain not in vocab:
                    vocab[domain] = []
                vocab[domain].extend(doc.get("keywords", []))
                for lp_str in doc.get("situation", {}).get("log_patterns", []):
                    if isinstance(lp_str, str) and lp_str.strip():
                        vocab[domain].append(lp_str.strip())
            return {d: list(dict.fromkeys(kws)) for d, kws in vocab.items()}
        except Exception as e:
            print(f"Warning: KB load failed: {e}")
            return {}

    def _strip_header(self, line):
        _SYSLOG_HEADER = re.compile(
            r'^(?:'
            r'(?:\w{3}\s+\d{1,2}\s+(?:\d{2}:\d{2}:\d{2}|<*>))'  # Cisco: "Apr 20 14:15:22" or wildcarded
            r'|'
            r'(?:\d{4}-\d{2}-\d{2}T?\d{2}:\d{2}:\d{2})'         # ISO 8601
            r')'
            r'\s+\S+\s+'  # hostname token
        )
        return _SYSLOG_HEADER.sub('', line).strip()

    def _zone(self, clean):
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
        _cause = {"crc", "error", "drop", "flap", "input", "output", "fault", "failure"}
        _impact = {"bgp", "ospf", "neighbor", "session", "peer", "routing"}
        if any(w in t for w in _impact): return "impact"
        if any(w in t for w in _cause): return "probable_cause"
        return "unknown"

    def _score(self, count, zone):
        return count * {"probable_cause": 4.0, "impact": 0.5, "unknown": 0.1, "noise": 0.0}.get(zone, 0.2)

    def _tokens(self, raw_tmpl, device_name):
        clean = self._strip_header(raw_tmpl)
        clean = _WILDCARD_RE.sub(' ', clean)
        out = []
        for tok in re.findall(r'[A-Za-z0-9][A-Za-z0-9_\-/:.]*', clean):
            if tok.lower() in _STOPWORDS or len(tok) < 3: continue
            if re.fullmatch(r'\d+', tok): continue
            if device_name and tok.lower() == device_name.lower(): continue
            out.append(tok.rstrip(':,'))
        return [t for t in out if t]

    def _root_alarm_terms(self, ev):
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


    def _norm_metric(self, text):
        text = (text or "").lower().strip()
        text = re.sub(r'[^a-z0-9]+', '_', text)
        text = re.sub(r'_+', '_', text).strip('_')
        return text

    def _metric_variants(self, metric):
        m = self._norm_metric(metric)
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

    def _root_message_terms(self, ev, device_name):
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
            tokens.append(tok.rstrip(':,'))

        phrases = []
        for i in range(len(tokens) - 1):
            phrases.append(tokens[i] + " " + tokens[i + 1])

        return list(dict.fromkeys(phrases + tokens))

    def _metric_evidence_terms(self, anomalies):
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

    def _limited_kb_hints(self, domains, kb_vocab, per_domain):
        hints = []
        for dom in domains[:2]:
            hints.extend(kb_vocab.get(dom, [])[:per_domain])
        return list(dict.fromkeys([h.strip().lower() for h in hints if h and h.strip()]))

    def _infer_domains(self, entities, anomalies, root_event):
        scores = {}
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
                    _add(dom, min(abs(a.z_score) / 5.0, 1.0))
                    break

        if entities.interfaces:
            scores["link"] = scores.get("link", 0.0) + 3.0  # Gi0/1 → +3.0

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

    def _build_query(self, root_event, templates, entities, anomalies, topology=None, kb_vocab=None):
        t0 = time.monotonic()
        topology = topology or {}
        kb_vocab = kb_vocab or {}
        ev = root_event

        # Product schema first; legacy fallback keeps migration safe.
        device = (
            (ev.get("device") or {}).get("name")
            if isinstance(ev.get("device"), dict)
            else ev.get("device_name")
            or ev.get("managed_object_name")
            or ev.get("device")
            or ""
        )
        severity = ev.get("severity")
        event_type = ev.get("event_type", "unknown")
        domains = self._infer_domains(entities, anomalies, ev)
        primary = domains[0] if domains else "unknown"

        # Ordered evidence sources by your requested weighting priority
        root_alarm_terms = self._root_alarm_terms(ev)
        root_message_terms = self._root_message_terms(ev, device_name=device)
        metric_terms = self._metric_evidence_terms(anomalies)
        entity_terms = []
        template_terms = []
        kb_hint_terms = self._limited_kb_hints(domains, kb_vocab, per_domain=2)

        # Tag + deduplicate templates
        seen = set()
        scored = []
        for tmpl in templates:
            clean = self._strip_header(tmpl["template"])
            if clean in seen: continue
            seen.add(clean)
            z = self._zone(clean)
            scored.append({**tmpl, "clean": clean, "zone": z, "score": self._score(tmpl["count"], z)})
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
        for t in cause_list[:3]:
            template_terms.extend(tok.lower() for tok in self._tokens(t["template"], device))

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
        
        # Add all anomalies to the situation text for better semantic matching
        if anomalies:
            anom_desc = []
            for a in anomalies:
                # Group by domain/type for cleaner summary
                anom_desc.append(f"{a.metric} {a.direction} ({a.change_pct:+.0f}%)")
            sit.append("Metric anomalies: " + ", ".join(anom_desc[:6]))

        if entities.interfaces:
            sit.append(f"Interface {', '.join(entities.interfaces[:2])} on device {device}")
        
        if entities.bgp_neighbors:
            sit.append(f"BGP neighbor {', '.join(entities.bgp_neighbors[:2])} impacted")
        
        if topology.get("downstream_count"):
            sit.append(f"{topology['downstream_count']} downstream devices affected")
            
        if sit: parts.append("Situation: " + ". ".join(sit) + ".")

        if cause_list:
            parts.append("Log evidence: " +
                "; ".join(f"{t['clean']} (x{t['count']})" for t in cause_list[:5]) + ".")
        # if impact_list:
        #     parts.append("Impact events: " +
        #         "; ".join(f"{t['clean']} (x{t['count']})" for t in impact_list[:3]) + ".")
        # if anomalies:
        #     parts.append("Metric anomalies: " +
        #         ", ".join(f"{a.metric} {a.direction} ({a.change_pct:+.0f}%, z={a.z_score:.1f})"
        #                   for a in anomalies) + ".")

        # Keep KB hints small and last so broad vocab does not overpower root intent
        if kb_hint_terms:
            parts.append("Keywords: " + ", ".join(kb_hint_terms) + ".")

        semantic_text = "  ".join(parts)

        # ── keyword_string: assembled strictly by requested priority ─────────────
        kw = []

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
        # kw.extend(kb_hint_terms)

        # Extra product-schema evidence for recall without changing priority logic.
        # This improves matching for production events while preserving the same ordered assembly.
        if isinstance(ev.get("status"), dict):
            for k, v in ev["status"].items():
                if v is not None:
                    kw.append(f"{k}_{str(v).lower()}")
        if ev.get("event_type"):
            kw.append(str(ev["event_type"]).lower())

        # Deduplicate while preserving order
        keyword_string = " ".join(
            dict.fromkeys(term.strip() for term in kw if term and term.strip())
        )

        # ── metadata_filters: KB field names only ────────────────────────────────
        metadata_filters = {}#{"domain": domains[:3]}
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
            },
            "topology": topology,
            "build_ms": round((time.monotonic() - t0) * 1000, 2),
        }

    def run(self, raw_logs, root_event, metrics_payload, topology=None):
        self.raw_logs = raw_logs
        logger.info("Starting RCA Pipeline...")

        miner = self._build_drain3()
        templates = self._run_drain3(miner, raw_logs)

        anomalies = self._run_anomaly_detect(metrics_payload)
        entities = self._run_ner(raw_logs)

        kb_vocab = self._load_kb_vocabulary()
        query_json = self._build_query(root_event, templates, entities, anomalies, topology, kb_vocab)

        self.format_drain3_results(templates)
        self.format_anomaly_results(anomalies)
        self.format_ner_results(entities)
        self.format_query_results(query_json)

        if self.config.RUN_RERANK_SEARCH:
            results = self.hybrid_search_with_rerank(query_json, top_k=self.config.TOP_K,
                                                    retrieve_k=self.config.RETRIEVE_K,
                                                    rerank_k=self.config.RERANK_K)
            self.format_search_results(results, "rerank")
        elif self.config.RUN_NORMAL_HYBRID_SEARCH:
            results = self.hybrid_search_from_json(query_json)
            self.format_search_results(results, "normal")

        logger.info("RCA Pipeline completed.")

    def apply_filters(self, results, filters):
        filtered = []

        for idx in results:
            meta = self.metadata[idx]

            match_all_applicable_filters = True
            for k, v in filters.items():
                # If the filter key is not in the document's metadata, this filter is not applicable
                # to this document. We don't consider it a mismatch.
                if k not in meta:
                    continue # Skip this filter for this document

                # If the filter key IS in the document's metadata, then check for a match
                meta_value = meta[k]
                if k == "severity":
                    if isinstance(meta_value, str):
                        meta_value = meta_value.lower()
                        v_str = str(v).lower()
                        if v_str not in meta_value and meta_value not in v_str:
                            match = False
                            break
                    elif meta_value != v:
                        match = False
                        break
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
    def signal_boost(self, doc, query_json):
        """
        Enhanced signal_boost for v3 KB structure.
        Prioritizes situation.metrics, falls back gracefully to old 'signals'.
        """
        score = 0.0

        # Structured query-side metrics
        query_metrics = set()
        for mf in query_json.get("metric_facts", []):
            metric = mf.get("metric", "")
            query_metrics.update(self._metric_variants(metric))

        keyword_string = (query_json.get("keyword_string", "") or "").lower()
        raw_doc = doc["raw"]
        situation = raw_doc.get("situation", {})

        # === Stronger Metric Matching ===
        for s in situation.get("metrics", []):
            metric = s.get("metric", "")
            weight = s.get("weight", 0.3)
            if not metric:
                continue

            doc_metric_variants = self._metric_variants(metric)

            if query_metrics & doc_metric_variants:
                score += weight * 1.0
                continue
            if any(v in keyword_string for v in doc_metric_variants if len(v) > 2):
                score += weight * 0.6

        # === Boost based on Symptoms (Very Important) ===
        symptoms = situation.get("symptoms", [])
        for symptom in symptoms:
            if isinstance(symptom, str):
                symptom_lower = symptom.lower()
                symptom_terms = [t for t in symptom_lower.split() if len(t) > 3]
                if any(term in keyword_string for term in symptom_terms):
                    score += 0.4

        # === Bonus for root alarm / probable_cause match ===
        root_alarm = str(query_json.get("semantic_text", "")).lower()
        rca_text = str(raw_doc.get("root_cause_analysis", "")).lower()
        if any(word in root_alarm for word in ["cpu", "memory", "fan", "temp", "thermal", "unreachable"]):
            if any(word in rca_text for word in ["cpu", "memory", "fan", "temp", "thermal", "unreachable"]):
                score += 0.45

        return score


    def log_boost(self, doc, query_keywords):
        """Improved log boost with higher weights"""
        score = 0.0
        q = query_keywords.lower()

        raw = doc["raw"]
        situation = raw.get("situation", {})

        # Stronger weight for situation.log_patterns
        for lp in situation.get("log_patterns", []):
            keyword = lp.get("keyword") if isinstance(lp, dict) else str(lp)
            if keyword and str(keyword).lower() in q:
                score += 0.55   # Increased from 0.35

        # Hypotheses log patterns
        for h in raw.get("hypotheses", []):
            for lp in h.get("log_patterns", []):
                keyword = lp.get("keyword") if isinstance(lp, dict) else str(lp)
                if keyword and str(keyword).lower() in q:
                    weight = lp.get("weight", 0.4) if isinstance(lp, dict) else 0.4
                    score += weight

        return score
    def hybrid_search_from_json(self, query_json, top_k=5):

        query_semantic = query_json["semantic_text"]
        query_keywords = query_json["keyword_string"]
        filters = query_json.get("metadata_filters", {})

        # ----- Semantic Search -----
        query_text = f"query: {query_semantic}"
        q_emb = self.model.encode([query_text])
        q_emb_np = np.array(q_emb, dtype="float32")
        faiss.normalize_L2(q_emb_np)
        D, I = self.index.search(q_emb_np, 20)

        # ----- Keyword Search -----
        tokenized_query = query_keywords.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)

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
            doc = self.docs[idx]

            log_score = 0 #self.log_boost(doc, query_keywords)
            signal_score = self.signal_boost(doc, query_json) #should be added as the last verification

            total_score = base_score + log_score + signal_score
            final_scores.append((idx, total_score))

        # ----- Sort -----
        ranked = sorted(final_scores, key=lambda x: x[1], reverse=True)

        # ----- Apply Filters -----
        if filters:
            ranked = [(idx, score) for idx, score in ranked if idx in self.apply_filters([idx], filters)]

        # ----- Return WITH SCORES -----
        return [
            {
                "doc": self.docs[idx]["raw"],
                "score": score
            }
            for idx, score in ranked[:top_k]
        ]

    def hybrid_search_with_rerank(self, query_json, top_k=5, retrieve_k=30, rerank_k=15):
        query_semantic = query_json["semantic_text"]
        query_keywords = query_json["keyword_string"]
        filters = query_json.get("metadata_filters", {})

        # ----- Semantic Search -----
        q_emb = self.model.encode([query_semantic])
        q_emb_np = np.array(q_emb, dtype="float32")
        faiss.normalize_L2(q_emb_np)
        D, I = self.index.search(q_emb_np, retrieve_k)

        # ----- Keyword Search -----
        tokenized_query = query_keywords.lower().split()
        bm25_scores = self.bm25.get_scores(tokenized_query)

        # ----- RRF Fusion -----
        scores = {}

        for rank, idx in enumerate(I[0]):
            if idx == -1:
                continue
            scores[idx] = scores.get(idx, 0) + 1 / (58 + rank)

        sorted_bm25 = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
        for rank, idx in enumerate(sorted_bm25[:retrieve_k]):
            scores[idx] = scores.get(idx, 0) + 1 / (50 + rank)

        # ----- Pre-rerank scoring -----
        pre_ranked = []
        for idx, base_score in scores.items():
            doc = self.docs[idx]
            log_score = self.log_boost(doc, query_keywords)
            signal_score = self.signal_boost(self.docs[idx], query_json)
            total_score = base_score + log_score + signal_score
            pre_ranked.append((idx, total_score))

        pre_ranked = sorted(pre_ranked, key=lambda x: x[1], reverse=True)

        # ----- Apply filters once, efficiently -----
        if filters:
            valid_ids = set(self.apply_filters([idx for idx, _ in pre_ranked], filters))
            pre_ranked = [(idx, score) for idx, score in pre_ranked if idx in valid_ids]

        # ----- Candidate pool for reranking -----
        candidates = pre_ranked[:rerank_k]
        if not candidates:
            return []

        candidate_ids = [idx for idx, _ in candidates]
        candidate_texts = [
            self.docs[idx]["reranker_text"] + "\nKeywords: " + self.docs[idx]["keywords"]
            for idx in candidate_ids
        ]

        # ----- Cross-encoder reranking -----
        pairs = [(query_semantic, doc_text) for doc_text in candidate_texts]
        ce_scores = self.reranker.predict(pairs, batch_size=16, show_progress_bar=False)

        # Combine pre-rank score + CE score
        # CE is stronger, so give it more weight
        reranked = []
        for idx, pre_score, ce_score in zip(candidate_ids, [s for _, s in candidates], ce_scores):
            final_score = (0.35 * pre_score) + (0.55 * float(ce_score)) + (0.1 * signal_score)
            reranked.append((idx, final_score, float(ce_score), pre_score))

        reranked = sorted(reranked, key=lambda x: x[1], reverse=True)

        return [
            {
                "doc": self.docs[idx],
                "final_score": final_score,
                "cross_encoder_score": ce_score,
                "prerank_score": pre_score,
                "query_metrics": query_json.get("metric_facts", []),
                "log_features": query_json.get("log_features", [])
            }
            for idx, final_score, ce_score, pre_score in reranked[:top_k]
        ]

    def format_anomaly_results(self, anomalies):
        print("\nAnomaly detection")
        print(f"   {'METRIC':22} {'ENTITY':28} {'DIR':6} {'CHANGE':>10}  Z-SCORE")
        print(f"   {'-'*22} {'-'*28} {'-'*6} {'-'*10}  {'-'*7}")
        for a in anomalies:
            print(f"   {a.metric:22} {a.entity:28} {a.direction:6} {a.change_pct:>+9.1f}%  {a.z_score:>7.2f}")

    def format_ner_results(self, entities):
        print("\n NER entities")
        print(f"   interfaces    : {entities.interfaces}")
        print(f"   alarm_codes   : {entities.alarm_codes}")
        print(f"   bgp_neighbors : {entities.bgp_neighbors}")
        print(f"   protocols     : {entities.protocols}")

    def format_drain3_results(self, templates):
        print("\n Drain3 templates")
        print(f"   {len(templates)} clusters from {len(self.raw_logs)} log lines")
        for t in templates[:6]:
            print(f"   [{t['count']:>3}x] {t['template'][:70]}")

    def format_query_results(self, query_json):
        print("\n Query Builder output (pure JSON)")
        print(json.dumps(query_json, indent=2))

    def format_search_results(self, results, search_type):
        if search_type == "normal":
            for r in results:
                doc = r["doc"]
                score = r["score"]
                print("------")
                print("RCA ID :", doc["rca_id"])
                print("Title :", doc.get("title", doc.get("description", "")))
                print("Description :", doc.get("description", ""))
                rca = doc.get("root_cause_analysis", "")
                if rca:
                    print("RCA :", rca[:120])
                # print("render_template", doc.get("render_template", doc.get("situation_text", "")))
                print("Score :", round(score, 3))

        elif search_type == "rerank":
            if not results:
                print("No results returned from reranker.")
                return

            print(f"\n Top RCA Recommendations (Top 3)\n")

            # Normalize confidence scores
            scores = [r.get("final_score", 0) for r in results]
            max_score = max(scores) if scores else 0
            min_score = min(scores) if scores else 0
            score_range = max(0.01, max_score - min_score)

            ui_results = []

            for rank, r in enumerate(results[:3]):

                if isinstance(r.get("doc"), dict) and "raw" in r["doc"]:
                    doc = r["doc"]["raw"]
                else:
                    doc = r.get("doc", r)

                final_score = r.get("final_score", 0)
                confidence_pct = min(
                    95.0,
                    round((final_score - min_score) / score_range * 100, 1)
                )

                # === Top Relevant Logs ===
                top_logs = self.get_top_relevant_logs(r, doc, top_k=3)

                formatted_logs = []

                for log in top_logs:
                    formatted_logs.append({
                        "template": log["template"],
                        "score": round(log["score"], 3)
                    })

                # === Build JSON object ===
                result_item = {
                    "rank": rank + 1,
                    "title": doc.get("title", doc.get("description", "N/A")),
                    "rca_id": doc.get("rca_id", "N/A"),
                    "confidence": confidence_pct,
                    "relevant_logs": formatted_logs,
                    "root_cause_analysis": doc.get("root_cause_analysis", "")
                }

                ui_results.append(result_item)

            # Final JSON Response
            response = {
                "total_results": len(ui_results),
                "results": ui_results
            }

            print(json.dumps(response, indent=2))

    def get_top_relevant_logs(self, result_item, kb_doc, top_k=3):
        """
        Returns top K most relevant logs for a specific RCA using cosine similarity.
        Efficient version using SentenceTransformer embeddings.
        """
        log_features = result_item.get("log_features", [])
        if not log_features:
            return []

        # Use the same model that was used for indexing
        if self.model is None:
            return []  # Fallback if model not loaded

        # Prepare KB document text for comparison
        kb_text = " ".join(filter(None, [
            kb_doc.get("title", ""),
            kb_doc.get("description", ""),
            kb_doc.get("root_cause_analysis", ""),
            # kb_doc.get("retrieval_text", "")
        ]))

        if not kb_text.strip():
            return []

        # Encode KB text once
        kb_embedding = self.model.encode([kb_text], convert_to_tensor=True)

        scored_logs = []
        for log in log_features:
            template = log.get("template", "")
            if not template:
                continue
                
            log_embedding = self.model.encode([template], convert_to_tensor=True)
            
            # Cosine similarity
            similarity = torch.nn.functional.cosine_similarity(
                kb_embedding, log_embedding, dim=1
            ).item()

            scored_logs.append({
                "template": template,
                "score": round(similarity, 4),
                "count": log.get("count", 1)
            })

        # Sort by similarity score descending
        scored_logs.sort(key=lambda x: x["score"], reverse=True)
        
        return scored_logs[:top_k]

raw_logs = [
    "2026-05-07T14:12:05.123Z Core-Router-01 %SYS-5-CONFIG_I: Configured from console by automation",
    "2026-05-07T14:13:15.456Z Core-Router-01 %CPU-5-UTIL: CPU utilization 78%",
    "2026-05-07T14:14:22.789Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 6800ms",
    "2026-05-07T14:15:10.234Z Core-Router-01 %CPU-5-UTIL: CPU utilization 85%",
    "2026-05-07T14:16:05.678Z Core-Router-01 %SYS-2-MEMORY: Memory usage 82% - high pressure",
    "2026-05-07T14:16:55.111Z Core-Router-01 %CPU-5-UTIL: CPU utilization 91%",
    "2026-05-07T14:17:40.345Z Core-Router-01 %ENV-4-TEMP: Temperature threshold exceeded on RP0 (CPU temp 82C)",
    "2026-05-07T14:18:20.901Z Core-Router-01 %FAN-3-FANFAIL: Fan tray 1 speed below normal",
    "2026-05-07T14:19:05.567Z Core-Router-01 %CPU-5-UTIL: CPU utilization 94%",
    "2026-05-07T14:19:50.234Z Core-Router-01 %SYS-2-MEMORY: Critical memory usage - 89% utilized",
    "2026-05-07T14:20:35.890Z Core-Router-01 %ENV-3-TEMP: Chassis temperature rising rapidly (88C)",
    "2026-05-07T14:21:15.123Z Core-Router-01 %LINEPROTO-5-UPDOWN: Line protocol on Interface Te0/0/0 changed state to down",
    "2026-05-07T14:22:05.456Z Core-Router-01 %CPU-5-UTIL: CPU utilization 96% - sustained high",
    "2026-05-07T14:22:50.789Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 14500ms",
    "2026-05-07T14:23:30.234Z Core-Router-01 %FAN-3-FANFAIL: Multiple fan trays operating at reduced speed",
    "2026-05-07T14:24:10.567Z Core-Router-01 %SNMP-5-SNMP_AUTH_FAIL: SNMP polling failure from NMS",
    "2026-05-07T14:25:05.901Z Core-Router-01 %SYS-5-RESTART: System restarted due to high CPU",
    "2026-05-07T14:25:55.345Z Core-Router-01 %LINEPROTO-5-UPDOWN: Line protocol on Interface Te0/0/1 changed state to down",
    "2026-05-07T14:26:40.678Z Core-Router-01 info: Device not responding to ICMP echo requests",
    "2026-05-07T14:27:15.123Z Core-Router-01 %SYS-2-INTSCHED: Internal scheduler stalled for 4500ms",
    "2026-05-07T14:27:50.456Z Core-Router-01 Critical: Device unreachable from monitoring system"
]

root_event = {
    "_id": {
        "$oid": "69876eaeb278a13bebf27960"
    },
    "organization": "131135018821674340352",
    "agent_id": "BD738AA304BF4CFBAF5E152EA5B4095D",
    "last_update_time": {
        "$date": "2026-05-07T14:27:35.951Z"
    },
    "datetime": "2026-05-07 14:27:00.000000",
    "is_cleared": 1,
    "is_deleted": True,
    "last_down_at": {
        "$date": "2026-05-07T14:26:15.031Z"
    },
    "ci_id": "138706292364207460512",
    "parent_ci_id": "138706292364207460458",
    "probable_cause": "Performance Threshold Breach",
    "additional_text": "",
    "ip_address": "10.0.4.14",
    "event_type": "State Change",
    "parameter_name": "Availability",
    "parameter_value": 100,
    "parameter_unit": "%",
    "threshold_type": "1",
    "event_suppression": -1,
    "last_event": {
        "$date": "2026-05-07T14:27:00.000Z"
    },
    "event_count": 6,
    "stat_dn": "avail",
    "last_alarm_id": "26038771592",
    "severity": 5,
    "alarm_msg": "Device Not Reachable",
    "device_type": "Router",
    "managed_object_name": "Core-Router-01",
    "managed_object_class": "Device",
    "managed_object_type": "Node",
    "system_dn": None,
    "alarm_category": "",
    "alarm_profile_id": "",
    "priority": 2,
    "remediation_procedure": "",
    "audible_tone": "",
    "thresid": "141249995196148486144",
    "vendor": "",
    "managed_ems_ip": "",
    "managed_ems_name": "",
    "tracking_indicator": "",
    "creation_time": {
        "$date": "2026-05-07T14:12:14.418Z"
    },
    "first_event": {
        "$date": "2026-05-07T14:12:00.000Z"
    },
    "event_ids": [
        "143002795400926072862",
    ],
    "trackid": "142153051274325528602",
    "impacted_services": [],
    "termination_status": True,
    "parent_alarms": [],
    "is_root": 1,
    "is_dependent": 0,
    "is_correlated": 1,
    "underlying_alarms": [
        "139165560427345088547"
    ],
    "clear_msg": "Device Reachable",
    "terminated_by": "System",
    "terminated_time": {
        "$date": "2026-05-07T14:28:00.000Z"
    }
}

metrics_payload = {
    "cpu_util": {"Core-Router-01": [72, 78, 85, 91, 94, 96, 97, 95]},
    "memory_util": {"Core-Router-01": [68, 75, 81, 86, 89, 92, 94]},
    "temp_c": {"RP0": [65, 72, 78, 82, 85, 88, 89]},
    "fan_speed_rpm": {"Tray1": [4800, 4500, 3900, 3200, 2800, 2400]},
    "availability": {"Core-Router-01": [100, 100, 99, 98, 95, 85, 45, 0]},
    "icmp_response_ms": {"NMS": [15, 18, 22, 45, 120, 450, 1200, 0]}
}


topology = {}  # Empty for now, can be populated if needed

# ========================= API WRAPPER =========================
# Singleton pipeline instance — loaded once per process, reused for all requests.
_pipeline_instance: RCAPipeline | None = None


def _get_pipeline() -> RCAPipeline:
    global _pipeline_instance
    if _pipeline_instance is None:
        logger.info("Initialising RCAPipeline singleton...")
        _pipeline_instance = RCAPipeline()
    return _pipeline_instance


def run_full_pipeline(logs, event, metrics, topo=None):
    """Drop-in replacement for ierag2_refactored.run_full_pipeline.

    Accepts the same arguments and returns the same JSON-serialisable dict
    so that api/views.py can switch between pipeline versions transparently.
    """
    from datetime import datetime
    from dataclasses import asdict

    print(f"\n[PIPELINE START - ierag5] {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")
    print(f"   Analysing: {len(logs)} logs, {len(metrics)} metrics")

    pipeline = _get_pipeline()
    topo = topo or {}

    # --- Stage 1: Log template mining ---
    miner = pipeline._build_drain3()
    templates = pipeline._run_drain3(miner, logs)

    # --- Stage 2: Anomaly detection ---
    anomalies = pipeline._run_anomaly_detect(metrics)

    # --- Stage 3: NER ---
    entities = pipeline._run_ner(logs)

    # --- Stage 4: Query construction ---
    kb_vocab = pipeline._load_kb_vocabulary()
    query_json = pipeline._build_query(
        root_event=event,
        templates=templates,
        entities=entities,
        anomalies=anomalies,
        topology=topo,
        kb_vocab=kb_vocab,
    )

    # --- Stage 5: Hybrid search with reranking ---
    results = pipeline.hybrid_search_with_rerank(
        query_json,
        top_k=pipeline.config.TOP_K,
        retrieve_k=pipeline.config.RETRIEVE_K,
        rerank_k=pipeline.config.RERANK_K,
    )

    return {
        "query": query_json,
        "anomalies": [asdict(a) for a in anomalies],
        "entities": {
            "interfaces": entities.interfaces,
            "ips": entities.ips,
            "alarm_codes": entities.alarm_codes,
            "bgp_neighbors": entities.bgp_neighbors,
            "protocols": entities.protocols,
        },
        "templates": templates,
        "results": results,
    }


if __name__ == "__main__":
    pipeline = RCAPipeline()
    pipeline.run(raw_logs, root_event, metrics_payload)



'''
Right now your query builder is:

evidence collector

But not:

incident interpreter
text = " ".join(t["template"].lower() for t in templates)

if (
    "temp" in text and
    "fanfail" in text and
    any("cpu" in a.metric.lower() for a in anomalies)
):
    return "thermal induced control plane failure"

if (
    "crc" in text and
    "updown" in text
):
    return "physical link degradation"

if (
    "bgp" in text and
    "neighbor" in text
):
    return "routing adjacency instability"

return ""
'''