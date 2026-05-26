# -*- coding: utf-8 -*-

import math
import re
import json
import time
import logging
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple, Any
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

import numpy as np
import torch
import psycopg2
from pgvector.psycopg2 import register_vector

try:
    from langchain_community.vectorstores import PGVector
except ImportError:
    from langchain.vectorstores import PGVector

from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
from sentence_transformers import SentenceTransformer, CrossEncoder
from rank_bm25 import BM25Okapi


# ========================= SETTINGS =========================
class _Settings:
    PGVECTOR_DRIVER   = "psycopg2"
    AI_POSTGRES_HOST  = "10.0.5.177"
    AI_POSTGRES_PORT  = 5432
    AI_POSTGRES_DB    = "infraon_db_aiops"
    AI_POSTGRES_USER  = "infraondns"
    AI_POSTGRES_PASSWORD = "InfraonPostgres321"

settings = _Settings()

CONNECTION_STRING = PGVector.connection_string_from_db_params(
    driver=settings.PGVECTOR_DRIVER,
    host=settings.AI_POSTGRES_HOST,
    port=settings.AI_POSTGRES_PORT,
    database=settings.AI_POSTGRES_DB,
    user=settings.AI_POSTGRES_USER,
    password=settings.AI_POSTGRES_PASSWORD,
)


# ========================= CONFIGURATION =========================
class Config:
    KB_PATH = Path(r"C:\Users\Pranay\Desktop\IE\network_rca_v5_hierarchy.json")

    RUN_RERANK_SEARCH        = True
    RUN_NORMAL_HYBRID_SEARCH = False

    EMBEDDING_MODEL = r"C:\Users\Pranay\Desktop\IE\model\bge-base-en-v1.5"
    RERANKER_MODEL  = r"C:\Users\Pranay\Desktop\IE\model\cross-encoder\bge-reranker-base"

    RETRIEVE_K = 30
    RERANK_K   = 15
    TOP_K      = 3

    RCA_CONFIDENCE_THRESHOLD = 0.35

    PG_TABLE = "rca_kb_embeddings"

    USE_ENHANCED_QUERY_BUILDER = False   # True → _build_query_enhanced; False → _build_query
    USE_LLM_QUERY_BUILDER      = False   # True → _build_query_with_llm (overrides enhanced)

    # Ollama Configuration
    OLLAMA_URL      = "http://localhost:11434/api/generate"
    OLLAMA_MODEL    = "llama3.2:1b"   # Change to "llama3.2", "gemma2:2b", etc. as needed
    LLM_TEMPERATURE = 0.0
    LLM_MAX_TOKENS  = 500
    LLM_TIMEOUT     = 60


# ──────────────────────────── HELPERS ────────────────────────────────────────

def _steps_to_text(steps) -> str:
    if not isinstance(steps, list):
        return str(steps) if steps else ""
    parts = []
    for s in steps:
        if isinstance(s, dict):
            parts.append(s.get("action", ""))
            parts.append(s.get("cli", ""))
        else:
            parts.append(str(s))
    return " ".join(filter(None, parts))


def _log_patterns_to_text(log_patterns) -> str:
    if not isinstance(log_patterns, list):
        return ""
    parts = []
    for lp in log_patterns:
        if isinstance(lp, dict):
            parts.append(lp.get("keyword", ""))
        else:
            parts.append(str(lp))
    return " ".join(filter(None, parts))


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


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


_RE_IFACE = re.compile(
    r'\b(?:GigabitEthernet|TenGigabitEthernet|TenGig|GigE|FastEthernet|'
    r'Serial|Tunnel|Loopback|Vlan|Te|Gi|Fa)\d+(?:[/:.]\d+){0,3}\b',
    re.IGNORECASE,
)
_RE_IP = re.compile(
    r'\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b'
)
_RE_ALARM   = re.compile(r'%([A-Z][A-Z0-9_-]{1,15}-\d-[A-Z0-9_]{2,20})')
_RE_BGP     = re.compile(r'(?:neighbor|peer)\s+(\S+)', re.IGNORECASE)
_RE_FAC     = re.compile(r'%([A-Z][A-Z0-9_]{2,15})-\d-[A-Z0-9_]{2,20}:?')
_RE_TS      = re.compile(
    r'\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b|'
    r'\b[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\b'
)
_RE_SEVERITY = re.compile(r'\b(critical|error|warning|fail|down)\b', re.IGNORECASE)

_KNOWN_PROTOS    = {"BGP", "OSPF", "ISIS", "MPLS", "BFD", "LDP", "RSVP", "LACP", "STP"}
_IMPACT_MNEMONICS = {"ADJCHANGE", "NEIGHBOR", "NOTIFICATION", "PEER", "SESSION"}
_ALARM_RE    = re.compile(r'%([A-Z][A-Z0-9_-]{1,15})-(\d)-([A-Z0-9_]{2,20}):?')
_WILDCARD_RE = re.compile(r'<*>|(\d+)')
_STOPWORDS   = {
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
        self.config   = config or Config()
        self.model    = None
        self.reranker = None
        self.conn     = None
        self.docs     = []
        self.metadata = []
        self.bm25     = None
        self.raw_logs = None

        self._connect_db()
        self._load_or_build_index()

    # ── DB helpers ────────────────────────────────────────────────────────────

    def _connect_db(self):
        self.conn = psycopg2.connect(
            host=settings.AI_POSTGRES_HOST,
            port=settings.AI_POSTGRES_PORT,
            dbname=settings.AI_POSTGRES_DB,
            user=settings.AI_POSTGRES_USER,
            password=settings.AI_POSTGRES_PASSWORD,
        )
        register_vector(self.conn)

    def _ensure_table(self, dim: int):
        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {table} (
                    id             SERIAL PRIMARY KEY,
                    doc_index      INTEGER NOT NULL,
                    retrieval_text TEXT,
                    reranker_text  TEXT,
                    doc_json       JSONB,
                    embedding      vector({dim})
                )
            """)
            cur.execute(f"""
                CREATE INDEX IF NOT EXISTS {table}_hnsw_idx
                ON {table} USING hnsw (embedding vector_cosine_ops)
            """)
        self.conn.commit()

    # ── index load / build ────────────────────────────────────────────────────

    def _load_or_build_index(self):
        self.model    = SentenceTransformer(self.config.EMBEDDING_MODEL, local_files_only=True)
        self.reranker = CrossEncoder(self.config.RERANKER_MODEL, max_length=512)
        dim = self.model.get_sentence_embedding_dimension()
        self._ensure_table(dim)

        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]

        if count > 0:
            logger.info("Loading existing pgvector RCA index (%d rows)...", count)
            self._load_index()
        else:
            logger.info("Building new pgvector RCA index from KB...")
            self._build_index()

    def _load_index(self):
        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            cur.execute(
                f"SELECT doc_index, doc_json FROM {table} ORDER BY doc_index"
            )
            rows = cur.fetchall()

        self.docs     = [None] * len(rows)
        self.metadata = [None] * len(rows)

        for doc_index, doc_json in rows:
            doc = doc_json if isinstance(doc_json, dict) else json.loads(doc_json)
            self.docs[doc_index]     = doc
            self.metadata[doc_index] = doc.get("raw", {}).get("metadata", {})

        tokenized_docs = [
            (d["text"] + " " + d["keywords"]).lower().split() for d in self.docs
        ]
        self.bm25 = BM25Okapi(tokenized_docs)
        logger.info("Loaded %d RCA docs from pgvector.", len(self.docs))

    def _build_index(self):
        try:
            with open(self.config.KB_PATH, encoding="utf-8") as f:
                kb = json.load(f)
        except Exception as e:
            logger.error(f"Failed to load KB: {e}")
            raise

        docs_list     = []
        metadata_list = []

        for item in kb:
            item      = self._enrich_document(item)
            situation = item.get("situation", {})

            doc_text = " ".join(filter(None, [
                item.get("title"),
                item.get("description"),
                item.get("root_cause_analysis"),
            ]))

            reranker_text = item.get("reranker_text") or doc_text

            docs_list.append({
                "text":            doc_text.strip(),
                "reranker_text":   reranker_text.strip(),
                "render_template": item.get("render_template", ""),
                "retrieval_text":  item.get("retrieval_text", ""),
                "situation":       situation,
                "keywords":        " ".join(item.get("keywords", [])),
                "raw":             item,
            })
            metadata_list.append(item.get("metadata", {}))

        embeddings = self.model.encode([d["retrieval_text"] for d in docs_list])
        embeddings = np.array(embeddings, dtype="float32")
        norms      = np.linalg.norm(embeddings, axis=1, keepdims=True)
        embeddings = embeddings / np.where(norms == 0, 1, norms)

        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            for i, (doc, emb) in enumerate(zip(docs_list, embeddings)):
                cur.execute(
                    f"""
                    INSERT INTO {table} (doc_index, retrieval_text, reranker_text, doc_json, embedding)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        i,
                        doc["retrieval_text"],
                        doc["reranker_text"],
                        json.dumps(doc),
                        emb,
                    ),
                )
        self.conn.commit()

        tokenized  = [(d["text"] + " " + d["keywords"]).lower().split() for d in docs_list]
        self.bm25  = BM25Okapi(tokenized)
        self.docs  = docs_list
        self.metadata = metadata_list
        logger.info("pgvector RCA index built and stored (%d docs).", len(docs_list))

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
            " ".join(item.get("keywords", [])),
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
        item["reranker_text"]  = reranker_text.strip()
        return item

    # ====================== CORE FUNCTIONS ======================
    def _build_drain3(self) -> TemplateMiner:
        cfg = TemplateMinerConfig()
        cfg.profiling_enabled        = False
        cfg.parametrize_numeric_tokens = True
        cfg.drain_sim_th             = 0.4
        cfg.drain_depth              = 4
        cfg.drain_max_children       = 100
        cfg.drain_max_clusters       = 1000
        return TemplateMiner(config=cfg)

    def _run_drain3(self, miner: TemplateMiner, log_lines: list[str]) -> list[dict]:
        counts  = defaultdict(int)
        tmpls   = {}
        samples = {}
        for line in log_lines:
            r   = miner.add_log_message(line.strip())
            cid = str(r["cluster_id"])
            counts[cid] += 1
            tmpls[cid]   = r["template_mined"]
            if cid not in samples:
                samples[cid] = line.strip()

        return sorted(
            [{"cluster_id": c, "template": tmpls[c], "count": counts[c], "sample": samples[c]}
             for c in counts],
            key=lambda x: x["count"], reverse=True,
        )

    def _filter_logs(self, log_lines, severity_only=False):
        filtered = []
        for line in log_lines:
            line_str = str(line).strip()
            if not line_str:
                continue
            
            # 1. Strip ISO-8601 or Syslog timestamps
            clean_line = _RE_TS.sub("", line_str).strip(" ,:-")
            # 2. Strip leading vendor prefixes like [INFO], [WARN], <14>
            clean_line = re.sub(r'^(?:\[.*?\]|<.*?>)\s*', '', clean_line).strip(" ,:-")
            
            if not severity_only:
                filtered.append(clean_line)
            else:
                if _RE_SEVERITY.search(clean_line):
                    filtered.append(clean_line)
        return filtered

    def _run_anomaly_detect(self, payload):
        results = []
        for metric_name, ents in payload.items():
            for entity_name, values in ents.items():
                fact = self._detect_anomaly(metric_name, entity_name, values)
                if fact.is_anomaly:
                    results.append(fact)
        return results

    def _detect_anomaly(self, metric, entity, values, recent_window=5, z_threshold=2.5):
        arr = np.array(values, dtype=float)
        if len(arr) == 0:
            return MetricFact(metric, entity, 0.0, 0.0, 0.0, 0.0, False, "normal")

        current_value = float(arr[-1])
        series_mean   = float(arr.mean())

        threshold_rules = {
            "memory_util": 80.0, "mem_util": 80.0, "memory_percent": 80.0,
            "mempercent": 80.0, "memory_usage": 80.0,
            "cpu_util": 90.0, "cpupercent": 90.0,
            "temperature": 70.0, "tempc": 70.0,
        }

        metric_key      = metric.lower().strip()
        threshold_value = threshold_rules.get(metric_key)
        if threshold_value is None:
            for k, v in threshold_rules.items():
                if k in metric_key:
                    threshold_value = v
                    break

        if threshold_value is not None and current_value >= threshold_value:
            pct = ((current_value - series_mean) / (abs(series_mean) + 1e-9)) * 100
            return MetricFact(
                metric=metric, entity=entity,
                baseline=round(series_mean, 3), current=round(current_value, 3),
                change_pct=round(pct, 1), z_score=0.0, is_anomaly=True, direction="spike",
            )

        effective_window = min(recent_window, max(2, len(arr) // 2))
        if len(arr) < effective_window + 1:
            return MetricFact(metric, entity, round(series_mean, 3), round(current_value, 3), 0.0, 0.0, False, "normal")

        b_arr, c_arr = arr[:-effective_window], arr[-effective_window:]
        if len(b_arr) == 0:
            return MetricFact(metric, entity, round(series_mean, 3), round(current_value, 3), 0.0, 0.0, False, "normal")

        bm  = float(b_arr.mean())
        cm  = float(c_arr.mean())
        std = float(b_arr.std()) + 1e-9
        z   = (cm - bm) / std
        pct = ((cm - bm) / (abs(bm) + 1e-9)) * 100
        ok  = abs(z) > z_threshold
        d   = ("spike" if z > 0 else "drop") if ok else "normal"

        return MetricFact(
            metric=metric, entity=entity,
            baseline=round(bm, 3), current=round(cm, 3),
            change_pct=round(pct, 1), z_score=round(z, 2),
            is_anomaly=ok, direction=d,
        )

    def _run_ner(self, log_lines):
        ifaces, ips, alarms, bgp, protos = set(), set(), set(), set(), set()
        log_lines = self._filter_logs(log_lines, severity_only=False)

        for line in log_lines:
            line = _RE_TS.sub("", str(line)).strip(" ,:-")
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
            with open(self.config.KB_PATH, encoding="utf-8") as f:
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
            r'(?:\w{3}\s+\d{1,2}\s+(?:\d{2}:\d{2}:\d{2}|<*>))'
            r'|'
            r'(?:\d{4}-\d{2}-\d{2}T?\d{2}:\d{2}:\d{2})'
            r')'
            r'\s+\S+\s+'
        )
        return _SYSLOG_HEADER.sub("", line).strip()

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
        t      = clean.lower()
        _cause  = {"crc", "error", "drop", "flap", "input", "output", "fault", "failure"}
        _impact = {"bgp", "ospf", "neighbor", "session", "peer", "routing"}
        if any(w in t for w in _impact): return "impact"
        if any(w in t for w in _cause):  return "probable_cause"
        return "unknown"

    def _score(self, count, zone):
        return count * {"probable_cause": 4.0, "impact": 0.5, "unknown": 0.1, "noise": 0.0}.get(zone, 0.2)

    def _tokens(self, raw_tmpl, device_name):
        clean = self._strip_header(raw_tmpl)
        clean = _WILDCARD_RE.sub(" ", clean)
        out   = []
        for tok in re.findall(r'[A-Za-z0-9][A-Za-z0-9_\-/:.]*', clean):
            if tok.lower() in _STOPWORDS or len(tok) < 3: continue
            if re.fullmatch(r'\d+', tok): continue
            if device_name and tok.lower() == device_name.lower(): continue
            out.append(tok.rstrip(":,"))
        return [t for t in out if t]

    def _root_alarm_terms(self, ev):
        alarm = (
            ev.get("alarm_code") or ev.get("alarm")
            or ev.get("alarm_msg") or ev.get("probable_cause") or ""
        )
        if not alarm:
            return []

        alarm_norm   = str(alarm).strip().lower()
        alarm_spaced = re.sub(r'[_\-]+', ' ', alarm_norm)
        parts        = [p for p in re.split(r'[_\-\s]+', alarm_norm) if p and p not in _STOPWORDS]

        terms = [alarm_norm, alarm_spaced]
        terms.extend(parts)
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

        parts    = [p for p in m.split('_') if p]
        variants = {m, m.replace('_', ' ')}
        for p in parts:
            variants.add(p)
        for i in range(len(parts) - 1):
            variants.add(parts[i] + "_" + parts[i + 1])
            variants.add(parts[i] + " " + parts[i + 1])
        return variants

    def _root_message_terms(self, ev, device_name):
        msg = (
            ev.get("message") or ev.get("alarm_message")
            or ev.get("additional_text") or ev.get("probable_cause") or ""
        )
        if not msg:
            return []

        raw_tokens = re.findall(r'[A-Za-z0-9][A-Za-z0-9_\-/:.]*', str(msg).lower())
        tokens     = []
        for tok in raw_tokens:
            if tok in _STOPWORDS or len(tok) < 3:
                continue
            if device_name and tok == device_name.lower():
                continue
            tokens.append(tok.rstrip(":,"))

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
            scores["link"] = scores.get("link", 0.0) + 3.0

        root_alarm  = str(
            root_event.get("alarm_code") or root_event.get("alarm")
            or root_event.get("alarm_msg") or ""
        ).lower()
        alarm_parts = [p for p in re.split(r'[_\-\s]+', root_alarm) if p]
        for part in alarm_parts:
            for frag, dom in _METRIC_TO_DOMAIN.items():
                if frag in part:
                    scores[dom] = scores.get(dom, 0.0) + 1.0

        print("sorted scores", sorted(scores, key=lambda d: -scores[d]) or ["unknown"])
        return sorted(scores, key=lambda d: -scores[d]) or ["unknown"]

    def _build_query(self, root_event, templates, entities, anomalies, topology=None, kb_vocab=None):
        t0       = time.monotonic()
        topology = topology or {}
        kb_vocab = kb_vocab or {}
        ev       = root_event

        device = (
            (ev.get("device") or {}).get("name")
            if isinstance(ev.get("device"), dict)
            else ev.get("device_name") or ev.get("managed_object_name") or ev.get("device") or ""
        )
        severity   = ev.get("severity")
        event_type = ev.get("event_type", "unknown")
        domains    = self._infer_domains(entities, anomalies, ev)
        primary    = domains[0] if domains else "unknown"

        root_alarm_terms   = self._root_alarm_terms(ev)
        root_message_terms = self._root_message_terms(ev, device_name=device)
        metric_terms       = self._metric_evidence_terms(anomalies)
        entity_terms       = []
        template_terms     = []
        kb_hint_terms      = self._limited_kb_hints(domains, kb_vocab, per_domain=2)

        seen   = set()
        scored = []
        for tmpl in templates:
            clean = self._strip_header(tmpl["template"])
            if clean in seen: continue
            seen.add(clean)
            z = self._zone(clean)
            scored.append({**tmpl, "clean": clean, "zone": z, "score": self._score(tmpl["count"], z)})
        scored.sort(key=lambda x: (x["zone"] != "probable_cause", -x["score"]))

        cause_list  = [t for t in scored if t["zone"] == "probable_cause"]
        impact_list = [t for t in scored if t["zone"] == "impact"]
        signal_list = [t for t in scored if t["zone"] != "noise"]

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

        for t in cause_list[:3]:
            template_terms.extend(tok.lower() for tok in self._tokens(t["template"], device))

        parts = [f"Category: {' '.join(domains[:2])}"]

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
        err_f = [a for a in anomalies if any(w in a.metric.lower() for w in ("error", "crc", "drop"))]
        if err_f:
            sit.append("with " + ", ".join(f"{a.metric} {a.direction} {a.change_pct:+.0f}%" for a in err_f[:3]))
        if entities.bgp_neighbors:
            sit.append(f"BGP neighbor {', '.join(entities.bgp_neighbors[:2])} impacted")
        if topology.get("downstream_count"):
            sit.append(f"{topology['downstream_count']} downstream devices affected")
        if topology.get("redundancy_state"):
            sit.append(f"redundancy {topology['redundancy_state']}")
        if sit: parts.append("Situation: " + ". ".join(sit) + ".")

        if cause_list:
            parts.append("Log evidence: " +
                "; ".join(f"{t['clean']} (x{t['count']})" for t in cause_list[:5]) + ".")

        if kb_hint_terms:
            parts.append("Keywords: " + ", ".join(kb_hint_terms) + ".")

        semantic_text = "  ".join(parts)

        kw = []
        kw.extend(root_alarm_terms)
        kw.extend(root_message_terms)
        kw.extend(metric_terms)
        kw.extend(entity_terms)
        kw.extend(template_terms)

        if isinstance(ev.get("status"), dict):
            for k, v in ev["status"].items():
                if v is not None:
                    kw.append(f"{k}_{str(v).lower()}")
        if ev.get("event_type"):
            kw.append(str(ev["event_type"]).lower())

        keyword_string = " ".join(
            dict.fromkeys(term.strip() for term in kw if term and term.strip())
        )

        metadata_filters = {}

        log_features = [
            {
                "template": t["clean"],
                "count":    t["count"],
                "zone":     t["zone"],
                "score":    round(t["score"], 2),
                "sample":   t["sample"],
            }
            for t in signal_list
        ]

        metric_facts = [
            {
                "metric":     a.metric,
                "entity":     a.entity,
                "baseline":   a.baseline,
                "current":    a.current,
                "change_pct": a.change_pct,
                "z_score":    a.z_score,
                "direction":  a.direction,
            }
            for a in anomalies
        ]

        return {
            "semantic_text":    semantic_text,
            "keyword_string":   keyword_string,
            "metadata_filters": metadata_filters,
            "log_features":     log_features,
            "metric_facts":     metric_facts,
            "inferred_domains": domains,
            "entities": {
                "interfaces":    entities.interfaces,
                "ips":           entities.ips,
                "alarm_codes":   entities.alarm_codes,
                "bgp_neighbors": entities.bgp_neighbors,
                "protocols":     entities.protocols,
            },
            "topology":  topology,
            "build_ms":  round((time.monotonic() - t0) * 1000, 2),
        }

    # ------------------------------------------------------------------
    # LLM (Ollama) query builder
    # ------------------------------------------------------------------

    def _call_ollama(self, prompt: str, timeout: int = None) -> str:
        """Call Ollama API and return generated text, or empty string on failure."""
        import requests
        timeout = timeout or self.config.LLM_TIMEOUT
        try:
            response = requests.post(
                self.config.OLLAMA_URL,
                json={
                    "model":  self.config.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature":    self.config.LLM_TEMPERATURE,
                        "top_p":          0.9,
                        "repeat_penalty": 1.1,
                        "num_predict":    self.config.LLM_MAX_TOKENS,
                    },
                },
                timeout=timeout,
            )
            if response.status_code == 200:
                return response.json().get("response", "").strip()
            print(f"[Ollama] Error {response.status_code}: {response.text[:200]}")
            return ""
        except Exception as e:
            print(f"[Ollama] Request failed: {e}")
            return ""

    def _build_query_with_llm(self, root_event, templates, entities, anomalies, topology=None, kb_vocab=None):
        """
        LLM-powered query construction via Ollama.
        Returns the same output structure as _build_query() for full compatibility.
        Falls back to _build_query_enhanced() if the LLM returns a poor result.
        """
        t0 = time.monotonic()

        device = (
            (root_event.get("device") or {}).get("name")
            if isinstance(root_event.get("device"), dict)
            else (root_event.get("device_name")
                  or root_event.get("managed_object_name")
                  or root_event.get("device")
                  or "Unknown")
        )

        log_summary    = "\n".join(f"• {t.get('template', '')[:120]}" for t in templates[:8])
        metric_summary = "\n".join(
            f"• {a.metric} {a.direction} by {a.change_pct:+.1f}%" for a in anomalies[:6]
        )

        prompt = f"""You are a senior Network Operations expert specializing in Root Cause Analysis.

**Incident Summary:**
- Device: {device}
- Severity: {root_event.get('severity', 'Unknown')}
- Primary Alarm: {root_event.get('alarm_msg') or root_event.get('probable_cause') or 'Unknown'}
- Key Log Messages:
{log_summary}
- Metric Anomalies:
{metric_summary}
- Affected Interfaces: {', '.join(entities.interfaces[:5]) if entities.interfaces else 'None'}

Write a **highly effective, natural language search query** to find the most relevant RCA document in the knowledge base.

Rules:
- Be specific and technical
- Include symptoms, impact, and likely root causes
- Keep total length under 80 words
- Do not add explanations, only return the query text.

Query:"""

        llm_query = self._call_ollama(prompt)

        if not llm_query or len(llm_query) < 30:
            print("[LLM Query] LLM returned poor result, falling back to enhanced rule-based")
            return self._build_query_enhanced(root_event, templates, entities, anomalies, topology, kb_vocab)

        semantic_text  = llm_query.strip()
        keyword_string = " ".join(dict.fromkeys(
            tok.strip().lower() for tok in semantic_text.split() if len(tok) > 2
        ))
        domains = self._infer_domains(entities, anomalies, root_event)

        return {
            "semantic_text":    semantic_text,
            "keyword_string":   keyword_string,
            "metadata_filters": {},
            "log_features": [
                {"template": t.get("template", ""), "count": t.get("count", 1)}
                for t in templates[:8]
            ],
            "metric_facts": [
                a.__dict__ if hasattr(a, "__dict__") else a
                for a in anomalies
            ],
            "inferred_domains": domains,
            "entities": {
                "interfaces":    entities.interfaces,
                "ips":           entities.ips,
                "alarm_codes":   entities.alarm_codes,
                "bgp_neighbors": entities.bgp_neighbors,
                "protocols":     entities.protocols,
            },
            "topology":     topology,
            "build_ms":     round((time.monotonic() - t0) * 1000, 2),
            "query_source": "llm_ollama",
        }
    # ------------------------------------------------------------------
    # Enhanced query builder helpers
    # ------------------------------------------------------------------

    def _interpret_incident(self, templates, entities, anomalies) -> str:
        """Classify the dominant incident type from available signals."""
        log_texts    = " ".join(t.get("template", "") for t in templates).lower()
        metric_names = [a.metric if hasattr(a, "metric") else a.get("metric", "") for a in anomalies]

        has_optical   = any(k in log_texts for k in ("rx power", "tx power", "sfp", "transceiver", "optical"))
        has_link      = any(k in log_texts for k in ("link down", "line protocol", "carrier", "flap", "down"))
        has_bgp       = any(k in log_texts for k in ("bgp", "peer", "neighbor", "hold time", "session"))
        has_ospf      = any(k in log_texts for k in ("ospf", "adjacency", "dead interval", "hello"))
        has_interface = bool(entities.interfaces)
        has_cpu_mem   = any(m in ("cpu_usage", "memory_usage") for m in metric_names)

        if has_optical:
            return "optical_transceiver_failure"
        if has_bgp:
            return "routing_adjacency_instability_bgp"
        if has_ospf:
            return "routing_adjacency_instability_ospf"
        if has_link and has_interface:
            return "physical_link_degradation"
        if has_cpu_mem:
            return "resource_exhaustion"
        return "general_network_fault"

    def _build_intent_phrase(self, incident_type: str) -> str:
        """Map incident type to a natural-language intent phrase for the semantic query."""
        mapping = {
            "optical_transceiver_failure":        "diagnose optical transceiver failure causing signal degradation",
            "routing_adjacency_instability_bgp":  "troubleshoot BGP session drops and routing adjacency instability",
            "routing_adjacency_instability_ospf": "troubleshoot OSPF adjacency loss and routing convergence failure",
            "physical_link_degradation":          "identify root cause of physical link degradation and interface flap",
            "resource_exhaustion":                "investigate CPU or memory exhaustion impacting network stability",
            "general_network_fault":              "diagnose general network fault with service impact",
        }
        return mapping.get(incident_type, "diagnose network fault and identify root cause")

    def _get_strong_log_evidence(self, templates) -> list:
        """Return the highest-frequency or most specific log templates as key evidence."""
        if not templates:
            return []
        sorted_t = sorted(templates, key=lambda t: t.get("count", 1), reverse=True)
        return [t.get("template", "") for t in sorted_t[:4] if t.get("template")]

    def _build_metric_context(self, anomalies) -> str:
        """Summarise anomalous metrics as a concise context string."""
        if not anomalies:
            return ""
        parts = []
        for a in anomalies:
            if hasattr(a, "metric"):
                metric  = a.metric
                current = str(round(a.current, 2)) if hasattr(a, "current") else ""
                parts.append(f"{metric}={current} ({a.direction})" if current else metric)
            else:
                metric = a.get("metric", "")
                if metric:
                    parts.append(metric)
        return ", ".join(parts)

    def _build_situation_summary(self, root_event, incident_type: str, strong_logs: list,
                                  metric_ctx: str, entities) -> str:
        """Compose a dense situation summary paragraph for semantic retrieval."""
        event_desc = root_event.get("description", "") if isinstance(root_event, dict) else str(root_event)
        lines = [f"Incident type: {incident_type.replace('_', ' ')}."]
        if event_desc:
            lines.append(f"Triggering event: {event_desc}.")
        if strong_logs:
            lines.append("Key log evidence: " + "; ".join(strong_logs[:3]) + ".")
        if metric_ctx:
            lines.append(f"Anomalous metrics: {metric_ctx}.")
        ifaces = entities.interfaces[:3] if entities.interfaces else []
        if ifaces:
            lines.append(f"Affected interfaces: {', '.join(ifaces)}.")
        neighbors = entities.bgp_neighbors[:2] if entities.bgp_neighbors else []
        if neighbors:
            lines.append(f"BGP neighbors involved: {', '.join(neighbors)}.")
        return " ".join(lines)

    def _build_query_enhanced(self, root_event, templates, entities, anomalies, topology, kb_vocab):
        """
        Enhanced query builder — same signature and return structure as _build_query.
        Produces a richer semantic_text and keyword_string by explicitly classifying
        the incident type and composing a situation summary.
        Activated when Config.USE_ENHANCED_QUERY_BUILDER = True.
        """
        t0 = time.monotonic()

        incident_type = self._interpret_incident(templates, entities, anomalies)
        intent_phrase = self._build_intent_phrase(incident_type)
        strong_logs   = self._get_strong_log_evidence(templates)
        metric_ctx    = self._build_metric_context(anomalies)
        situation     = self._build_situation_summary(root_event, incident_type, strong_logs,
                                                       metric_ctx, entities)

        # --- semantic_text ---
        semantic_parts = [intent_phrase, situation]
        if topology:
            topo_str = topology if isinstance(topology, str) else str(topology)
            if topo_str:
                semantic_parts.append(f"Topology context: {topo_str[:300]}.")
        semantic_text = " ".join(semantic_parts)

        # --- keyword_string (mirrors _build_query logic + incident type tokens) ---
        kw_parts = list(incident_type.replace("_", " ").split())
        kw_parts += entities.interfaces[:5]
        kw_parts += entities.ips[:3]
        kw_parts += entities.alarm_codes[:3]
        kw_parts += entities.bgp_neighbors[:3]
        kw_parts += entities.protocols[:3]
        for t in strong_logs:
            for tok in t.split():
                if len(tok) > 3 and tok.lower() not in kw_parts:
                    kw_parts.append(tok.lower())
        # include KB vocabulary boosting (same as _build_query)
        vocab_hits = [w for w in kb_vocab if w in semantic_text.lower()]
        kw_parts += vocab_hits[:10]
        keyword_string = " ".join(dict.fromkeys(kw_parts))  # deduplicated, order-preserved

        # --- metadata_filters (same derivation as _build_query) ---
        domains = []
        if incident_type.startswith("routing"):
            domains.append("routing")
        if incident_type == "optical_transceiver_failure":
            domains.append("hardware")
        if incident_type == "physical_link_degradation":
            domains.extend(["hardware", "interface"])
        if incident_type == "resource_exhaustion":
            domains.append("performance")
        if not domains:
            domains.append("network")

        metadata_filters = {"domains": domains, "incident_type": incident_type}

        # --- log_features and metric_facts (compact form) ---
        log_features = [{"template": t.get("template", ""), "count": t.get("count", 1)}
                        for t in templates[:8]]
        metric_facts = [
            {"metric": a.metric, "value": round(a.current, 4), "z_score": round(a.z_score, 4)}
            if hasattr(a, "metric")
            else {"metric": a.get("metric", ""), "value": a.get("value", ""), "threshold": a.get("threshold", "")}
            for a in anomalies[:6]
        ]

        return {
            "semantic_text":    semantic_text,
            "keyword_string":   keyword_string,
            "metadata_filters": metadata_filters,
            "log_features":     log_features,
            "metric_facts":     metric_facts,
            "inferred_domains": domains,
            "entities": {
                "interfaces":    entities.interfaces,
                "ips":           entities.ips,
                "alarm_codes":   entities.alarm_codes,
                "bgp_neighbors": entities.bgp_neighbors,
                "protocols":     entities.protocols,
            },
            "topology":  topology,
            "build_ms":  round((time.monotonic() - t0) * 1000, 2),
        }

    def run(self, raw_logs, root_event, metrics_payload, topology=None, device_details=None):
        logger.info("Starting RCA Pipeline...")

        # Apply the clean_msg builder logic right at the entry point
        cleaned_logs = self._filter_logs(raw_logs, severity_only=False)
        self.raw_logs = cleaned_logs

        miner     = self._build_drain3()
        templates = self._run_drain3(miner, cleaned_logs)

        anomalies = self._run_anomaly_detect(metrics_payload)
        entities  = self._run_ner(cleaned_logs)

        kb_vocab = self._load_kb_vocabulary()
        if self.config.USE_LLM_QUERY_BUILDER:
            query_json = self._build_query_with_llm(root_event, templates, entities, anomalies, topology, kb_vocab)
        elif self.config.USE_ENHANCED_QUERY_BUILDER:
            query_json = self._build_query_enhanced(root_event, templates, entities, anomalies, topology, kb_vocab)
        else:
            query_json = self._build_query(root_event, templates, entities, anomalies, topology, kb_vocab)

        self.format_drain3_results(templates)
        self.format_anomaly_results(anomalies)
        self.format_ner_results(entities)
        self.format_query_results(query_json)

        rca_results = []
        if self.config.RUN_RERANK_SEARCH:
            rca_results = self.hybrid_search_with_rerank(
                query_json,
                top_k=self.config.TOP_K,
                retrieve_k=self.config.RETRIEVE_K,
                rerank_k=self.config.RERANK_K,
            )
            self.format_search_results(rca_results, "rerank")
        elif self.config.RUN_NORMAL_HYBRID_SEARCH:
            rca_results = self.hybrid_search_from_json(query_json)
            self.format_search_results(rca_results, "normal")

        logger.info("RCA Pipeline completed.")
        return {
            "rca_results":    rca_results,
            "remedy_results": None,
            "templates":      templates,
            "entities":       entities.__dict__ if hasattr(entities, "__dict__") else entities,
            "anomalies":      [a.__dict__ if hasattr(a, "__dict__") else a for a in anomalies],
            "query":          query_json,
        }

    def apply_filters(self, results, filters):
        filtered = []
        for idx in results:
            meta = self.metadata[idx]
            match_all_applicable_filters = True
            for k, v in filters.items():
                if k not in meta:
                    continue
                meta_value = meta[k]
                if k == "severity":
                    if isinstance(meta_value, str):
                        meta_value = meta_value.lower()
                        v_str = str(v).lower()
                        if v_str not in meta_value and meta_value not in v_str:
                            match_all_applicable_filters = False
                            break
                    elif meta_value != v:
                        match_all_applicable_filters = False
                        break
                if isinstance(meta_value, list):
                    if v not in meta_value:
                        match_all_applicable_filters = False
                        break
                else:
                    if meta_value != v:
                        match_all_applicable_filters = False
                        break
            if match_all_applicable_filters:
                filtered.append(idx)
        return filtered

    def signal_boost(self, doc, query_json):
        score = 0.0

        query_metrics  = set()
        for mf in query_json.get("metric_facts", []):
            metric = mf.get("metric", "")
            query_metrics.update(self._metric_variants(metric))

        keyword_string = (query_json.get("keyword_string", "") or "").lower()
        raw_doc        = doc["raw"]
        situation      = raw_doc.get("situation", {})

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

        symptoms = situation.get("symptoms", [])
        for symptom in symptoms:
            if isinstance(symptom, str):
                symptom_lower = symptom.lower()
                symptom_terms = [t for t in symptom_lower.split() if len(t) > 3]
                if any(term in keyword_string for term in symptom_terms):
                    score += 0.4

        root_alarm = str(query_json.get("semantic_text", "")).lower()
        rca_text   = str(raw_doc.get("root_cause_analysis", "")).lower()
        if any(word in root_alarm for word in ["cpu", "memory", "fan", "temp", "thermal", "unreachable"]):
            if any(word in rca_text for word in ["cpu", "memory", "fan", "temp", "thermal", "unreachable"]):
                score += 0.45

        return score

    def log_boost(self, doc, query_keywords):
        score = 0.0
        q     = query_keywords.lower()
        raw   = doc["raw"]
        situation = raw.get("situation", {})

        for lp in situation.get("log_patterns", []):
            keyword = lp.get("keyword") if isinstance(lp, dict) else str(lp)
            if keyword and str(keyword).lower() in q:
                score += 0.55

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
        filters        = query_json.get("metadata_filters", {})

        # ----- Semantic Search (pgvector) -----
        query_text = f"query: {query_semantic}"
        q_emb      = self.model.encode([query_text])
        q_vec      = np.array(q_emb[0], dtype="float32")
        norm       = np.linalg.norm(q_vec)
        if norm > 0:
            q_vec = q_vec / norm

        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            cur.execute(
                f"SELECT doc_index FROM {table} ORDER BY embedding <=> %s LIMIT %s",
                (q_vec, 20),
            )
            semantic_indices = [row[0] for row in cur.fetchall()]

        # ----- Keyword Search -----
        tokenized_query = query_keywords.lower().split()
        bm25_scores     = self.bm25.get_scores(tokenized_query)

        # ----- RRF Fusion -----
        scores = {}
        for rank, idx in enumerate(semantic_indices):
            scores[idx] = scores.get(idx, 0) + 1 / (58 + rank)

        sorted_bm25 = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
        for rank, idx in enumerate(sorted_bm25[:20]):
            scores[idx] = scores.get(idx, 0) + 1 / (50 + rank)

        # ----- Final Scoring -----
        final_scores = []
        for idx, base_score in scores.items():
            doc          = self.docs[idx]
            log_score    = 0
            signal_score = self.signal_boost(doc, query_json)
            total_score  = base_score + log_score + signal_score
            final_scores.append((idx, total_score))

        ranked = sorted(final_scores, key=lambda x: x[1], reverse=True)

        if filters:
            ranked = [(idx, score) for idx, score in ranked if idx in self.apply_filters([idx], filters)]

        return [
            {"doc": self.docs[idx]["raw"], "score": score}
            for idx, score in ranked[:top_k]
        ]

    def hybrid_search_with_rerank(self, query_json, top_k=5, retrieve_k=30, rerank_k=15):
        query_semantic = query_json["semantic_text"]
        query_keywords = query_json["keyword_string"]
        filters        = query_json.get("metadata_filters", {})

        # ====================== 1. RETRIEVAL ======================
        q_emb = self.model.encode([query_semantic])
        q_vec = np.array(q_emb[0], dtype="float32")
        norm  = np.linalg.norm(q_vec)
        if norm > 0:
            q_vec = q_vec / norm

        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            cur.execute(
                f"SELECT doc_index FROM {table} ORDER BY embedding <=> %s LIMIT %s",
                (q_vec, retrieve_k),
            )
            semantic_indices = [row[0] for row in cur.fetchall()]

        # ----- Keyword Search -----
        tokenized_query = query_keywords.lower().split()
        bm25_scores     = self.bm25.get_scores(tokenized_query)

        # ----- RRF Fusion -----
        scores = {}
        for rank, idx in enumerate(semantic_indices):
            scores[idx] = scores.get(idx, 0) + 1 / (58 + rank)

        sorted_bm25 = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
        for rank, idx in enumerate(sorted_bm25[:retrieve_k]):
            scores[idx] = scores.get(idx, 0) + 1 / (50 + rank)

        # ----- Pre-rerank scoring (RRF + Boosts) -----
        pre_ranked = []
        for idx, base_score in scores.items():
            doc          = self.docs[idx]
            log_score    = self.log_boost(doc, query_keywords)
            signal_score = self.signal_boost(doc, query_json)
            total_score  = base_score + log_score + signal_score
            pre_ranked.append((idx, total_score))

        pre_ranked = sorted(pre_ranked, key=lambda x: x[1], reverse=True)

        if filters:
            valid_ids  = set(self.apply_filters([idx for idx, _ in pre_ranked], filters))
            pre_ranked = [(idx, score) for idx, score in pre_ranked if idx in valid_ids]

        candidate_count = len(pre_ranked)
        logger.info(f"[Reranker Gate] Candidates after RRF+Boost: {candidate_count}")

        # ====================== 2. CONDITIONAL GATE ======================
        if candidate_count <= 10:
            # === NO → Skip Cross-Encoder (as per architecture diagram) ===
            logger.info("→ Skipping Cross-Encoder reranker (≤10 candidates)")
            final_results = []
            for idx, pre_score in pre_ranked[:top_k]:
                confidence = _sigmoid(pre_score)
                if confidence < self.config.RCA_CONFIDENCE_THRESHOLD:
                    continue
                final_results.append({
                    "doc":                 self.docs[idx],
                    "final_score":         pre_score,
                    "confidence":          round(confidence, 4),
                    "cross_encoder_score": None,
                    "prerank_score":       pre_score,
                    "query_metrics":       query_json.get("metric_facts", []),
                    "log_features":        query_json.get("log_features", []),
                    "reranker_used":       False
                })
            return final_results

        else:
            logger.info(f"→ Running Cross-Encoder reranker on top {rerank_k} candidates")

            candidates = pre_ranked[:rerank_k]
            if not candidates:
                return []

            candidate_ids   = [idx for idx, _ in candidates]
            candidate_texts = [
                self.docs[idx]["reranker_text"] + "\nKeywords: " + self.docs[idx].get("keywords", "")
                for idx in candidate_ids
            ]

            # Cross-encoder
            pairs     = [(query_semantic, doc_text) for doc_text in candidate_texts]
            ce_scores = self.reranker.predict(pairs, batch_size=16, show_progress_bar=False)

            # Final scoring with all components
            reranked = []
            for (idx, pre_score), ce_score in zip(candidates, ce_scores):
                final_score = (0.35 * pre_score + 
                             0.55 * float(ce_score) + 
                             0.10 * self.signal_boost(self.docs[idx], query_json))
                reranked.append((idx, final_score, float(ce_score), pre_score))

            reranked = sorted(reranked, key=lambda x: x[1], reverse=True)

            # Confidence gate
            results = []
            for idx, final_score, ce_score, pre_score in reranked[:top_k]:
                confidence = _sigmoid(final_score)
                if confidence < self.config.RCA_CONFIDENCE_THRESHOLD:
                    logger.info(
                        "RCA result '%s' dropped — confidence %.3f < threshold %.3f",
                        self.docs[idx].get("raw", {}).get("rca_id", idx),
                        confidence,
                        self.config.RCA_CONFIDENCE_THRESHOLD,
                    )
                    continue

                results.append({
                    "doc":                 self.docs[idx],
                    "final_score":         final_score,
                    "confidence":          round(confidence, 4),
                    "cross_encoder_score": ce_score,
                    "prerank_score":       pre_score,
                    "query_metrics":       query_json.get("metric_facts", []),
                    "log_features":        query_json.get("log_features", []),
                    "reranker_used":       True
                })

            if not results:
                logger.warning(
                    "All RCA candidates dropped by confidence gate (threshold=%.3f).",
                    self.config.RCA_CONFIDENCE_THRESHOLD
                )

            return results

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
                doc   = r["doc"]
                score = r["score"]
                print("------")
                print("RCA ID :", doc["rca_id"])
                print("Title :", doc.get("title", doc.get("description", "")))
                print("Description :", doc.get("description", ""))
                rca = doc.get("root_cause_analysis", "")
                if rca:
                    print("RCA :", rca[:120])
                print("Score :", round(score, 3))

        elif search_type == "rerank":
            if not results:
                print("No results returned from reranker.")
                return

            print(f"\n Top RCA Recommendations (Top {len(results)})\n")

            ui_results = []

            for rank, r in enumerate(results[:3]):
                if isinstance(r.get("doc"), dict) and "raw" in r["doc"]:
                    doc = r["doc"]["raw"]
                else:
                    doc = r.get("doc", r)

                final_score    = r.get("final_score", 0)
                confidence_pct = round(
                    r.get("confidence", _sigmoid(final_score)) * 100, 1
                )

                top_logs       = self.get_top_relevant_logs(r, doc, top_k=3)
                formatted_logs = [
                    {"template": log["template"], "score": round(log["score"], 3)}
                    for log in top_logs
                ]

                result_item = {
                    "rank":                rank + 1,
                    "title":               doc.get("title", doc.get("description", "N/A")),
                    "rca_id":              doc.get("rca_id", "N/A"),
                    "confidence":          confidence_pct,
                    "relevant_logs":       formatted_logs,
                    "root_cause_analysis": doc.get("root_cause_analysis", ""),
                }
                ui_results.append(result_item)

            response = {"total_results": len(ui_results), "results": ui_results}
            print(json.dumps(response, indent=2))

    def format_remedy_results(self, remedy_result):
        if not remedy_result or not remedy_result.get("remedies"):
            print("\n Remedy Retrieval")
            print("   No remedies found for this RCA")
            return

        print("\n Remedy Recommendations")
        print(f"   Vendor(s): {', '.join(remedy_result.get('target_vendors', []))}")
        print(f"   Total candidates: {remedy_result.get('total_candidates', 0)}")
        print(f"   Overall confidence: {remedy_result.get('confidence', 0):.1%}")
        print()

        for rank, remedy in enumerate(remedy_result.get("remedies", [])[:3], 1):
            print(f"{rank}. {remedy.get('title', 'N/A')}")
            print(f"   ID: {remedy.get('remedy_id', 'N/A')}")
            print(f"   Severity: {remedy.get('raw', {}).get('severity', 'N/A').upper()}")
            print(f"   Confidence: {remedy.get('confidence', 0):.1%}")
            print(f"   Time Estimate: {remedy.get('raw', {}).get('estimated_time_minutes', 'N/A')} minutes")
            print(f"   Description: {remedy.get('description', 'N/A')[:100]}...")

            steps = remedy.get("steps", [])
            if steps:
                print(f"   Key Steps ({len(steps)} total):")
                for step_idx, step in enumerate(steps, 1):
                    print(f"{step_idx}. {str(step)}")
            print()

    def build_response(self, pipeline_output: dict, root_event: dict):
        rca_results    = pipeline_output.get("rca_results", [])
        remedy_result  = pipeline_output.get("remedy_results") or {}
        rca_remedy_map = remedy_result.get("rca_remedy_map", [])

        remedy_by_rank = {entry["rca_rank"]: entry for entry in rca_remedy_map}

        diagnoses = []
        for rank, r in enumerate(rca_results, 1):
            doc_field      = r.get("doc", {})
            doc            = doc_field.get("raw", doc_field) if isinstance(doc_field, dict) else {}
            final_score    = r.get("final_score", 0)
            confidence_pct = round(r.get("confidence", _sigmoid(final_score)) * 100, 1)
            relevant_logs  = self.get_top_relevant_logs(r, doc, top_k=3)
            remedy_entry   = remedy_by_rank.get(rank, {})
            raw_remedies   = remedy_entry.get("remedies", [])

            clean_remedies = []
            for r_rank, remedy in enumerate(raw_remedies, 1):
                raw = remedy.get("raw", {})
                clean_remedies.append({
                    "rank":                   r_rank,
                    "remedy_id":              remedy.get("remedy_id", ""),
                    "title":                  remedy.get("title", ""),
                    "risk_level":             remedy.get("risk_level", ""),
                    "confidence":             round(remedy.get("confidence", 0) * 100, 1),
                    "estimated_time_minutes": raw.get("estimated_time_minutes"),
                    "severity":               raw.get("severity", ""),
                    "description":            remedy.get("description", ""),
                    "steps":                  remedy.get("steps", []),
                    "escalation":             remedy.get("escalation", ""),
                    "doc_links":              remedy.get("doc_links", []),
                    "vendor":                 remedy.get("vendor", ""),
                    "os_flavor":              raw.get("os_flavor", ""),
                })

            diagnoses.append({
                "rank":                rank,
                "rca_id":              doc.get("rca_id", ""),
                "title":               doc.get("title", ""),
                "confidence":          confidence_pct,
                "root_cause_analysis": doc.get("root_cause_analysis", ""),
                "relevant_logs":       relevant_logs,
                "remedies":            clean_remedies,
                "no_remedy_message":   remedy_entry.get("message", "") if not clean_remedies else "",
            })

        incident_summary = {
            "device_name":    (
                root_event.get("managed_object_name")
                or root_event.get("device_name")
                or str(root_event.get("device", ""))
            ),
            "ip_address":     root_event.get("ip_address", ""),
            "probable_cause": root_event.get("probable_cause", ""),
            "severity":       root_event.get("severity", ""),
            "event_type":     root_event.get("event_type", ""),
        }

        return {
            "incident_summary": incident_summary,
            "total_rca_count":  len(rca_results),
            "target_vendors":   remedy_result.get("target_vendors", []),
            "diagnoses":        diagnoses,
        }

    def get_top_relevant_logs(self, result_item, kb_doc, top_k=3):
        log_features = result_item.get("log_features", [])
        if not log_features:
            return []

        if self.model is None:
            return []

        kb_text = " ".join(filter(None, [
            kb_doc.get("title", ""),
            kb_doc.get("description", ""),
            kb_doc.get("root_cause_analysis", ""),
        ]))

        if not kb_text.strip():
            return []

        kb_embedding  = self.model.encode([kb_text], convert_to_tensor=True)
        scored_logs   = []

        for log in log_features:
            template = log.get("template", "")
            if not template:
                continue

            log_embedding = self.model.encode([template], convert_to_tensor=True)
            similarity    = torch.nn.functional.cosine_similarity(
                kb_embedding, log_embedding, dim=1
            ).item()

            scored_logs.append({
                "template": template,
                "score":    round(similarity, 4),
                "count":    log.get("count", 1),
            })

        scored_logs.sort(key=lambda x: x["score"], reverse=True)
        return scored_logs[:top_k]


# ========================= TEST DATA =========================

raw_logs = [
    "2026-05-13T14:05:12Z DIST-SW-01 %LINK-3-UPDOWN: Interface GigabitEthernet1/0/10, changed state to down",
    "2026-05-13T14:05:13Z DIST-SW-01 %LINEPROTO-5-UPDOWN: Line protocol on Interface Gi1/0/10, changed state to down",
    "2026-05-13T14:05:15Z DIST-SW-01 %OPTICAL-3-ALARM: LOS on interface Gi1/0/10",
    "2026-05-13T14:05:20Z DIST-SW-01 %TRANSCEIVER-6-REMOVED: Transceiver removed from Gi1/0/10"
]

root_event = {
  "_id": {
    "$oid": "698dd731a46f273cc6c4b19f"
  },
  "organization": "131135018821674340352",
  "agent_id": "BD738AA304BF4CFBAF5E152EA5B4095D",
  "last_update_time": {
    "$date": "2026-02-12T13:36:39.203Z"
  },
  "datetime": "2026-02-12 13:36:00.000000",
  "is_cleared": 1,
  "is_deleted": True,
  "last_down_at": {
    "$date": "2026-02-12T13:35:45.295Z"
  },
  "ci_id": "131087806111547396098",
  "parent_ci_id": "131087806111547396096",
  "probable_cause": "Device is not reachable via PING",
  "additional_text": "Ping Failed",
  "ip_address": "192.168.50.4",
  "event_type": "State Change",
  "parameter_name": "Availability",
  "parameter_value": 100,
  "parameter_unit": "%",
  "threshold_type": "1",
  "event_suppression": -1,
  "last_event": {
    "$date": "2026-02-12T13:36:00.000Z"
  },
  "event_count": 2,
  "stat_dn": "avail",
  "last_alarm_id": "26043773431",
  "severity": 5,
  "alarm_msg": "Device Not Reachable",
  "device_type": "Switch",
  "managed_object_name": "Switch04",
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
    "$date": "2026-02-12T13:35:45.295Z"
  },
  "first_event": {
    "$date": "2026-02-12T13:35:00.000Z"
  },
  "event_ids": [
    "136805136622351814665",
    "136805136622351814709"
  ],
  "trackid": "141665419190256799753",
  "impacted_services": [],
  "termination_status": True,
  "parent_alarms": [],
  "is_root": 1,
  "is_dependent": 0,
  "is_correlated": 1,
  "underlying_alarms": [
    "141635560014705856539",
    "143700535789392760859",
    "141665419190256799791",
    "143874775337185316865",
    "143700535789392760857",
    "141635560014705856541",
    "141665419190256799745",
    "141665419190256799789",
    "143700535789392760855",
    "140513239868346732579",
    "141665419190256799787",
    "140513239868346732577",
    "143571368315062325249",
    "141635560014705856513"
  ],
  "clear_msg": "Device Reachable",
  "terminated_by": "System",
  "terminated_time": {
    "$date": "2026-02-16T13:00:15.009Z"
  }
}


metrics_payload = {
    "oper_status":          {"Gi1/0/10": [1, 1, 2]},
    "optical_rx_power_dbm": {"Gi1/0/10": [-8, -12, -38]},
}

topology = {}


# ========================= REMEDY CONFIGURATION =========================

class RemedyConfig:
    REMEDY_BASE          = Path("kb/remedy")
    PG_TABLE             = "remedie_kb_embeddings"
    EMBEDDING_MODEL      = r"C:\Users\Pranay\Desktop\IE\model\bge-base-en-v1.5"
    RERANKER_MODEL       = r"C:\Users\Pranay\Desktop\IE\model\cross-encoder\bge-reranker-base"
    RETRIEVE_K           = 20
    RERANK_K             = 10
    TOP_K                = 3
    CONFIDENCE_THRESHOLD = 0.60
    RISK_LEVEL_ORDER     = {"low": 0, "medium": 1, "high": 2, "": 1}

    USE_LLM_QUERY_REMEDY_BUILDER = True   # True → _build_remedy_query_with_llm

    # Ollama Configuration
    OLLAMA_URL      = "http://localhost:11434/api/generate"
    OLLAMA_MODEL    = "llama3.2:1b"
    LLM_TEMPERATURE = 0.0
    LLM_MAX_TOKENS  = 500
    LLM_TIMEOUT     = 60


# ========================= REMEDY PIPELINE =========================

class RemedyPipeline:
    """
    Vendor-partitioned remedy retrieval using pgvector/PostgreSQL.

    Directory layout expected:
        kb/remedy/
            cisco_iosxe.json      ← one JSON array per vendor/flavour
            juniper_junos.json
            ...

    The vendor key used in all dicts is the JSON file stem
    (e.g. "cisco_iosxe"), NOT the "vendor" field inside the JSON.
    _infer_vendor() maps root_event hints → file stem.
    """

    def __init__(self, config: RemedyConfig = None):
        self.config = config or RemedyConfig()
        self.conn   = None

        self.vendor_docs:     Dict[str, List[dict]] = {}
        self.vendor_metadata: Dict[str, List[dict]] = {}
        self.vendor_bm25:     Dict[str, BM25Okapi]  = {}

        self.model    = None
        self.reranker = None

        # ///intillegent event integration/////
        # Fallback SOP disabled for Phase 2 — re-enable in Phase 3 (feedback loop)
        # self.fallback_kb: Dict[str, dict] = {}

        self._connect_db()
        self._load_models()
        self._load_or_build_indices()
        # self._load_fallback_kb()  # Phase 3

    # ── setup ─────────────────────────────────────────────────────────────────

    def _connect_db(self):
        self.conn = psycopg2.connect(
            host=settings.AI_POSTGRES_HOST,
            port=settings.AI_POSTGRES_PORT,
            dbname=settings.AI_POSTGRES_DB,
            user=settings.AI_POSTGRES_USER,
            password=settings.AI_POSTGRES_PASSWORD,
        )
        register_vector(self.conn)

    def _ensure_table(self, dim: int):
        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {table} (
                    id             SERIAL PRIMARY KEY,
                    vendor         TEXT NOT NULL,
                    doc_index      INTEGER NOT NULL,
                    retrieval_text TEXT,
                    reranker_text  TEXT,
                    keywords       TEXT,
                    doc_json       JSONB,
                    embedding      vector({dim})
                )
            """)
            cur.execute(f"""
                CREATE INDEX IF NOT EXISTS {table}_hnsw_idx
                ON {table} USING hnsw (embedding vector_cosine_ops)
            """)
        self.conn.commit()

    def _load_models(self):
        logger.info("Loading embedding model: %s", self.config.EMBEDDING_MODEL)
        self.model = SentenceTransformer(self.config.EMBEDDING_MODEL)
        logger.info("Loading reranker model: %s", self.config.RERANKER_MODEL)
        self.reranker = CrossEncoder(self.config.RERANKER_MODEL, max_length=512)

    def _load_or_build_indices(self):
        dim = self.model.get_sentence_embedding_dimension()
        self._ensure_table(dim)

        remedy_kbs = sorted(p for p in self.config.REMEDY_BASE.glob("*.json"))
        if not remedy_kbs:
            logger.warning(
                "No remedy KB files found in %s. "
                "Add one JSON array file per vendor (e.g. cisco_iosxe.json).",
                self.config.REMEDY_BASE,
            )
            return

        table = self.config.PG_TABLE
        for kb_path in remedy_kbs:
            vendor = kb_path.stem
            with self.conn.cursor() as cur:
                cur.execute(f"SELECT COUNT(*) FROM {table} WHERE vendor = %s", (vendor,))
                count = cur.fetchone()[0]

            if count > 0:
                logger.info("Loading existing remedy index for '%s'…", vendor)
                self._load_vendor_index(vendor)
            else:
                logger.info("Building new remedy index for '%s'…", vendor)
                self._build_vendor_index(vendor, kb_path)

    # ── index load / build ────────────────────────────────────────────────────

    def _load_vendor_index(self, vendor: str):
        table = self.config.PG_TABLE
        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    f"SELECT doc_index, doc_json FROM {table} WHERE vendor = %s ORDER BY doc_index",
                    (vendor,),
                )
                rows = cur.fetchall()

            docs_list     = [row[1] for row in rows]
            metadata_list = [
                {
                    "remedy_id": d["raw"].get("remedy_id", ""),
                    "rca_id":    d["raw"].get("rca_id", ""),
                    "vendor":    d["raw"].get("vendor", vendor),
                    "os_flavor": d["raw"].get("os_flavor", ""),
                }
                for d in docs_list
            ]
            tokenized = [
                (d["retrieval_text"] + " " + d["keywords"]).lower().split()
                for d in docs_list
            ]

            self.vendor_docs[vendor]     = docs_list
            self.vendor_metadata[vendor] = metadata_list
            self.vendor_bm25[vendor]     = BM25Okapi(tokenized)
            logger.info("Loaded %d remedies for vendor '%s'.", len(docs_list), vendor)
        except Exception as exc:
            logger.error("Failed to load remedy index for '%s': %s", vendor, exc)

    def _build_vendor_index(self, vendor: str, kb_path: Path):
        try:
            with open(kb_path, encoding="utf-8") as f:
                kb = json.load(f)
        except Exception as exc:
            logger.error("Failed to read remedy KB %s: %s", kb_path, exc)
            return

        if not isinstance(kb, list):
            logger.error(
                "Remedy KB %s must be a JSON array, got %s.", kb_path, type(kb).__name__
            )
            return

        docs_list:     List[dict] = []
        metadata_list: List[dict] = []

        for item in kb:
            steps_text = _steps_to_text(item.get("steps", []))

            retrieval_text = item.get("retrieval_text") or " ".join(filter(None, [
                item.get("vendor", ""),
                item.get("os_flavor", ""),
                item.get("rca_id", ""),
                item.get("title", ""),
                item.get("description", ""),
                steps_text,
                " ".join(item.get("keywords", [])),
            ]))

            reranker_text = " ".join(filter(None, [
                f"Remedy: {item.get('title', '')}",
                f"For RCA: {item.get('rca_id', '')}",
                f"Description: {item.get('description', '')}",
                f"Steps: {steps_text[:400]}",
            ]))

            docs_list.append({
                "retrieval_text": retrieval_text.strip(),
                "reranker_text":  reranker_text.strip(),
                "keywords":       " ".join(item.get("keywords", [])),
                "raw":            item,
            })
            metadata_list.append({
                "remedy_id": item.get("remedy_id", ""),
                "rca_id":    item.get("rca_id", ""),
                "vendor":    item.get("vendor", vendor),
                "os_flavor": item.get("os_flavor", ""),
            })

        if not docs_list:
            logger.warning("No remedies parsed from %s", kb_path)
            return

        logger.info("Encoding %d remedies for vendor '%s'…", len(docs_list), vendor)
        embeddings = self.model.encode(
            [d["retrieval_text"] for d in docs_list], show_progress_bar=False
        )
        embeddings = np.array(embeddings, dtype="float32")
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        embeddings = embeddings / norms

        tokenized = [
            (d["retrieval_text"] + " " + d["keywords"]).lower().split()
            for d in docs_list
        ]
        bm25 = BM25Okapi(tokenized)

        table = self.config.PG_TABLE
        try:
            with self.conn.cursor() as cur:
                for i, (doc, emb) in enumerate(zip(docs_list, embeddings)):
                    cur.execute(
                        f"INSERT INTO {table} "
                        "(vendor, doc_index, retrieval_text, reranker_text, keywords, doc_json, embedding) "
                        "VALUES (%s, %s, %s, %s, %s, %s, %s)",
                        (
                            vendor, i,
                            doc["retrieval_text"],
                            doc["reranker_text"],
                            doc["keywords"],
                            json.dumps(doc),
                            emb,
                        ),
                    )
            self.conn.commit()
            logger.info("Inserted %d remedy embeddings for vendor '%s'.", len(docs_list), vendor)
        except Exception as exc:
            self.conn.rollback()
            logger.error("Failed to insert remedy embeddings for '%s': %s", vendor, exc)
            return

        self.vendor_docs[vendor]     = docs_list
        self.vendor_metadata[vendor] = metadata_list
        self.vendor_bm25[vendor]     = bm25

    # ── public API ────────────────────────────────────────────────────────────

    def find(self, rca_results: List[Dict], root_event: Dict, entities: Dict, device_details: Dict = None) -> Dict:
        """
        Phase 2 — 1:1 per-RCA remedy mapping.

        For each RCA result a separate remedy search is run so operators receive
        a ranked action plan:  if cause #1 is correct → do remedy #1, etc.

        Within each RCA's remedy list the order is:
            primary  : confidence DESC  (higher score first)
            secondary: risk_level ASC   (low → medium → high for equal confidence)

        Returns:
            {
                "rca_remedy_map": [
                    {
                        "rca_rank":       int,
                        "rca_confidence": float,
                        "rca_id":         str,
                        "remedies":       [...],   # up to TOP_K, empty when none found
                        "message":        str,     # non-empty only when remedies is empty
                    },
                    ...
                ],
                "target_vendors":  [str],
                "total_rca_count": int,
            }
        """
        if not self.vendor_docs:
            logger.warning("No remedy indices loaded — returning empty result.")
            return {
                "rca_remedy_map": [],
                "target_vendors": [],
                "total_rca_count": 0,
                "reason": "No remedy KB available",
            }

        target_vendors = self._infer_vendor(root_event, device_details=device_details)
        logger.info("Target vendors for remedy lookup: %s", target_vendors)

        risk_order     = self.config.RISK_LEVEL_ORDER
        rca_remedy_map = [None] * len(rca_results)

        def process_rca(rca_rank, rca_result, index):
            doc_field = rca_result.get("doc", {})
            raw_doc   = doc_field.get("raw", doc_field) if isinstance(doc_field, dict) else {}
            rca_id    = raw_doc.get("rca_id", "")
            rca_conf  = rca_result.get("confidence", 0.0)

            rca_remedies: List[Dict] = []
            for vendor in target_vendors:
                if vendor not in self.vendor_docs:
                    logger.warning("No remedy index for vendor '%s' — skipping.", vendor)
                    continue
                vendor_remedies = self._search_vendor(vendor, rca_result, entities)
                rca_remedies.extend(vendor_remedies)

            rca_remedies.sort(
                key=lambda x: (
                    -x["confidence"],
                    risk_order.get(x.get("risk_level", ""), 1),
                )
            )
            top = rca_remedies[: self.config.TOP_K]

            if not top:
                # No remedy passed 0.60 for this RCA — return support message
                logger.warning(
                    "No remedy found for RCA '%s' (rank %d, confidence %.3f).",
                    rca_id, rca_rank, rca_conf,
                )
                return {
                    "rca_rank":       rca_rank,
                    "rca_confidence": round(rca_conf, 4),
                    "rca_id":         rca_id,
                    "remedies":       [],
                    "message":        "No remedy found for this root cause. Please reach out to the support team.",
                }
            else:
                return {
                    "rca_rank":       rca_rank,
                    "rca_confidence": round(rca_conf, 4),
                    "rca_id":         rca_id,
                    "remedies":       top,
                    "message":        "",
                }

        with ThreadPoolExecutor(max_workers=min(8, len(rca_results))) as executor:
            futures = [
                executor.submit(process_rca, rca_rank, rca_result, idx)
                for idx, (rca_rank, rca_result) in enumerate(zip(range(1, len(rca_results) + 1), rca_results))
            ]
            for idx, future in enumerate(futures):
                rca_remedy_map[idx] = future.result()

        return {
            "rca_remedy_map":  rca_remedy_map,
            "target_vendors":  target_vendors,
            "total_rca_count": len(rca_results),
        }

    # ── vendor inference ──────────────────────────────────────────────────────

    def _extract_device_context(self, device_details: dict):
        if not device_details:
            return {}

        hw = device_details.get("hardware", {})
        ai = device_details.get("asset_info", {})

        def _first(*pairs):
            for d, k in pairs:
                v = (d.get(k) or "").strip()
                if v:
                    return v
            return ""

        return {
            "vendor":        _first((hw, "vendor"),        (ai, "vendor"),
                                     (hw, "make"),          (ai, "make")),
            "os_name":       _first((hw, "os_name"),       (ai, "os_name")),
            "os_version":    _first((hw, "os_version"),    (ai, "os_version")),
            "model":         _first((hw, "model"),         (ai, "model")),
            "series":        _first((hw, "series"),        (ai, "series")),
            "product":       _first((hw, "product"),       (ai, "product")),
            "network_layer": _first((hw, "network_layer"), (ai, "network_layer")),
            "switch_type":   _first((hw, "switch_type"),   (ai, "switch_type")),
            "serial_number": _first((hw, "serial_number"), (ai, "serial_number")),
            "device_type":   (device_details.get("device_type") or "").strip(),
            "hostname":      (device_details.get("hostname")
                              or device_details.get("ci_name") or "").strip(),
            "ip_address":    (device_details.get("ip_address") or "").strip(),
        }

    def _infer_vendor(self, root_event: Dict, device_details: dict = None) -> List[str]:
        """
        Determine which remedy KB index stems to search.

        Resolution priority (highest → lowest):
          1. device_details.hardware  — most authoritative: vendor, os_name, model
          2. root_event fields        — vendor, os_flavor, device_type
          3. Fallback                 — search all loaded vendor docs
        """
        VENDOR_MAP = {
            ("cisco",    "ios"):    "cisco_ios",
            ("cisco",    "iosxe"):  "cisco_iosxe",
            ("cisco",    "nxos"):   "cisco_nxos",
            ("juniper",  "junos"):  "juniper_junos",
            ("arista",   "eos"):    "arista_eos",
            ("huawei",   "vrp"):    "huawei_vrp",
            ("paloalto", "pan-os"): "paloalto_panos",
        }

        def _match_stem(hint: str) -> str:
            for (v_tok, os_tok), stem in VENDOR_MAP.items():
                print(f"Matching stem '{stem}' against hint: '{hint}' (vendor token: '{v_tok}', os token: '{os_tok}')")
                if v_tok in hint and os_tok in hint:
                    if stem in self.vendor_docs:
                        return stem
            return ""

        if device_details:
            dev_ctx = self._extract_device_context(device_details)
            logger.info(
                "Device context extracted — vendor: %s, os: %s, model: %s",
                dev_ctx.get("vendor"), dev_ctx.get("os_name"), dev_ctx.get("model"),
            )
            hw_hint = " ".join(filter(None, [
                dev_ctx.get("vendor", "").lower(),
                dev_ctx.get("os_name", "").lower(),
            ]))
            stem = _match_stem(hw_hint)
            if stem:
                logger.info("Vendor resolved from device_details.hardware → '%s'", stem)
                return [stem]

        vendor_val  = (root_event.get("vendor")    or "").strip().lower()
        os_flavor   = (root_event.get("os_flavor") or "").strip().lower()
        device_type = (
            root_event.get("device_type")
            or root_event.get("appliance_type")
            or ""
        ).strip().lower()
        ev_hint = " ".join(filter(None, [vendor_val, os_flavor, device_type]))
        if ev_hint:
            stem = _match_stem(ev_hint)
            if stem:
                logger.info("Vendor resolved from root_event → '%s'", stem)
                return [stem]

        logger.info(
            "No vendor hint matched — searching all %d loaded indices.", len(self.vendor_docs)
        )
        return list(self.vendor_docs.keys())

    # ── per-vendor search ─────────────────────────────────────────────────────

    def _extract_rca_context(self, rca_result: Dict) -> Dict:
        if not rca_result:
            return {}

        doc_field = rca_result.get("doc", {})

        if isinstance(doc_field, dict) and "raw" in doc_field:
            raw = doc_field["raw"]
        elif isinstance(doc_field, dict):
            raw = doc_field
        else:
            raw = {}

        situation = raw.get("situation", {})
        return {
            "rca_id":       raw.get("rca_id", ""),
            "title":        raw.get("title", ""),
            "description":  raw.get("description", ""),
            "symptoms":     situation.get("symptoms", []),
            "log_patterns": situation.get("log_patterns", []),
            "keywords":     raw.get("keywords", []),
        }

    def _build_remedy_query(self, rca_ctx: Dict, entities: Dict) -> str:
        log_text = _log_patterns_to_text(rca_ctx.get("log_patterns", []))
        parts = [
            rca_ctx.get("rca_id", ""),
            rca_ctx.get("title", ""),
            " ".join(rca_ctx.get("symptoms", [])),
            log_text,
            " ".join(rca_ctx.get("keywords", [])[:10]),
            " ".join((entities.get("interfaces") or [])[:3]),
            " ".join((entities.get("alarm_codes") or [])[:5]),
        ]
        return " ".join(filter(None, parts)).strip()

    def _call_ollama(self, prompt: str, timeout: int = None) -> str:
        """Call Ollama API and return generated text, or empty string on failure."""
        import requests
        timeout = timeout or self.config.LLM_TIMEOUT
        try:
            response = requests.post(
                self.config.OLLAMA_URL,
                json={
                    "model":  self.config.OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature":    self.config.LLM_TEMPERATURE,
                        "top_p":          0.9,
                        "repeat_penalty": 1.1,
                        "num_predict":    self.config.LLM_MAX_TOKENS,
                    },
                },
                timeout=timeout,
            )
            if response.status_code == 200:
                return response.json().get("response", "").strip()
            print(f"[Remedy Ollama] Error {response.status_code}: {response.text[:200]}")
            return ""
        except Exception as e:
            print(f"[Remedy Ollama] Request failed: {e}")
            return ""

    def _build_remedy_query_with_llm(self, rca_ctx: Dict, entities: Dict) -> str:
        """
        LLM-powered remedy query construction.
        Returns a plain string — same return type as _build_remedy_query().
        Falls back to _build_remedy_query() if the LLM returns a poor result.
        """
        prompt = f"""You are a senior Network Operations expert.

Given the following root cause analysis result, generate a concise search query
to find the most relevant remediation procedure, fix steps, and CLI commands.

Root Cause:
- RCA ID   : {rca_ctx.get("rca_id", "")}
- Title    : {rca_ctx.get("title", "")}
- Symptoms : {"; ".join(rca_ctx.get("symptoms", [])[:4])}
- Keywords : {", ".join(rca_ctx.get("keywords", [])[:8])}
- Interfaces: {", ".join((entities.get("interfaces") or [])[:3]) or "None"}
- Alarm codes: {", ".join((entities.get("alarm_codes") or [])[:4]) or "None"}

Rules:
- Output ONLY the query text, no explanation
- Be specific and technical
- Focus on fix actions, CLI commands, and recovery steps
- Maximum 30 words

Query:"""

        llm_query = self._call_ollama(prompt)

        if not llm_query or len(llm_query) < 20:
            print("[Remedy LLM] Falling back to rule-based remedy query")
            return self._build_remedy_query(rca_ctx, entities)

        return llm_query.strip()

    def _search_vendor(self, vendor: str, rca_result: Dict, entities: Dict) -> List[Dict]:
        """
        Run hybrid retrieval + CrossEncoder rerank for a single vendor index.
        Phase 2 — accepts a single rca_result (not a list); called once per RCA.
        """
        rca_ctx = self._extract_rca_context(rca_result)
        if self.config.USE_LLM_QUERY_REMEDY_BUILDER:
            query_text = self._build_remedy_query_with_llm(rca_ctx, entities)
        else:
            query_text = self._build_remedy_query(rca_ctx, entities)

        if not query_text:
            logger.warning("Empty remedy query for vendor '%s' — skipping.", vendor)
            return []

        # ── Semantic retrieval (pgvector) ─────────────────────────────────────
        q_emb = self.model.encode([query_text], show_progress_bar=False)
        q_vec = np.array(q_emb[0], dtype="float32")
        norm  = np.linalg.norm(q_vec)
        if norm > 0:
            q_vec = q_vec / norm

        table = self.config.PG_TABLE
        with self.conn.cursor() as cur:
            cur.execute(
                f"SELECT doc_index, 1 - (embedding <=> %s) AS sim "
                f"FROM {table} WHERE vendor = %s "
                f"ORDER BY embedding <=> %s LIMIT %s",
                (q_vec, vendor, q_vec, self.config.RETRIEVE_K),
            )
            semantic_rows = cur.fetchall()

        # ── BM25 retrieval ────────────────────────────────────────────────────
        tokenized_query = query_text.lower().split()
        bm25_scores     = self.vendor_bm25[vendor].get_scores(tokenized_query)

        # ── Pre-rank: weighted fusion + keyword boost ─────────────────────────
        candidates: List[Dict] = []

        for row in semantic_rows:
            idx            = int(row[0])
            semantic_score = float(row[1])
            bm25_score     = float(bm25_scores[idx])

            norm_bm25 = bm25_score / (1.0 + bm25_score)
            pre_score = 0.6 * semantic_score + 0.4 * norm_bm25

            doc        = self.vendor_docs[vendor][idx]
            doc_rca_id = doc["raw"].get("rca_id", "").lower()
            query_rca  = rca_ctx.get("rca_id", "").lower()
            if query_rca and doc_rca_id == query_rca:
                pre_score *= 1.25
            elif query_rca and query_rca.split(".")[0] in doc_rca_id:
                pre_score *= 1.10

            candidates.append({
                "idx":       idx,
                "doc":       doc,
                "pre_score": pre_score,
            })

        if not candidates:
            return []

        # ── Cross-encoder reranking ───────────────────────────────────────────
        candidates.sort(key=lambda x: x["pre_score"], reverse=True)
        rerank_pool = candidates[: self.config.RERANK_K]

        rerank_texts = [
            c["doc"]["reranker_text"] + "\nKeywords: " + c["doc"]["keywords"]
            for c in rerank_pool
        ]
        pairs     = [(query_text, t) for t in rerank_texts]
        ce_logits = self.reranker.predict(pairs, batch_size=16, show_progress_bar=False)

        # ── Final scoring ─────────────────────────────────────────────────────
        results: List[Dict] = []

        for cand, ce_logit in zip(rerank_pool, ce_logits):
            ce_prob     = _sigmoid(float(ce_logit))
            final_score = 0.3 * cand["pre_score"] + 0.7 * ce_prob

            if final_score < self.config.CONFIDENCE_THRESHOLD:
                continue

            raw = cand["doc"]["raw"]
            results.append({
                "remedy_id":          raw.get("remedy_id", ""),
                "title":              raw.get("title", ""),
                "description":        raw.get("description", ""),
                "steps":              raw.get("steps", []),
                "cli_commands":       raw.get("cli_commands", []),
                "variable_map":       raw.get("variable_map", {}),
                "escalation":         raw.get("escalation", ""),
                "doc_links":          raw.get("doc_links", []),
                "risk_level":         raw.get("risk_level", ""),
                "confidence":         round(final_score, 4),
                "cross_encoder_prob": round(ce_prob, 4),
                "pre_score":          round(cand["pre_score"], 4),
                "vendor":             vendor,
                "raw":                raw,
            })

        return results

    # ── formatting ────────────────────────────────────────────────────────────

    def format_results(self, remedy_result: Dict) -> None:
        """
        Phase 2 — prints the rca_remedy_map: one section per RCA, each with its
        ranked remedy ladder (confidence DESC, risk_level ASC).
        """
        if not remedy_result or not remedy_result.get("rca_remedy_map"):
            print("\n Remedy Retrieval")
            print("   No remedy results available.")
            return

        print("\n Remedy Recommendations  (Phase 2 — per-RCA ladder)")
        print(f"   Vendor(s)   : {', '.join(remedy_result.get('target_vendors', []))}")
        print(f"   RCA count   : {remedy_result.get('total_rca_count', 0)}")
        print()

        for entry in remedy_result.get("rca_remedy_map", []):
            rca_rank = entry.get("rca_rank", "?")
            rca_id   = entry.get("rca_id", "N/A")
            rca_conf = entry.get("rca_confidence", 0.0)

            print(f"  {'═'*60}")
            print(f"  RCA #{rca_rank}  [{rca_id}]  (confidence {rca_conf:.1%})")
            print(f"  {'═'*60}")

            if not entry.get("remedies"):
                print(f"   {entry.get('message', 'No remedy found.')}")
                print()
                continue

            for rank, remedy in enumerate(entry["remedies"], 1):
                raw        = remedy.get("raw", {})
                risk_label = remedy.get("risk_level", "").upper() or "—"
                print(f"  {'─'*60}")
                print(f"  Remedy {rank}. {remedy.get('title', 'N/A')}  [risk: {risk_label}]")
                print(f"     ID         : {remedy.get('remedy_id', 'N/A')}")
                print(f"     Vendor     : {raw.get('vendor','?')} / {raw.get('os_flavor','?')}")
                print(f"     Confidence : {remedy.get('confidence', 0):.1%}  "
                      f"(CE prob {remedy.get('cross_encoder_prob', 0):.3f})")
                print(f"     Est. time  : {raw.get('estimated_time_minutes', 'N/A')} min")
                print(f"     Description: {remedy.get('description', '')[:120]}")

                steps = remedy.get("steps", [])
                if steps:
                    print(f"     Steps ({len(steps)} total):")
                    for step in steps[:3]:
                        action = step.get("action", "") if isinstance(step, dict) else str(step)
                        cli    = step.get("cli", "")    if isinstance(step, dict) else ""
                        order  = step.get("order", "?") if isinstance(step, dict) else "?"
                        print(f"       {order}. {action[:80]}")
                        if cli:
                            print(f"          CLI: {cli.split(chr(10))[0]}")

                escalation = raw.get("escalation", "")
                if escalation:
                    print(f"     Escalation : {escalation[:100]}")
                print()


if __name__ == "__main__":
    device_details = None
    pipeline        = RCAPipeline()
    remedy_pipeline = RemedyPipeline()
    print("Running RCA Pipeline with test data...", time.time())
    result = pipeline.run(raw_logs, root_event, metrics_payload, topology)

    if result and result.get("rca_results"):
        entities_obj  = pipeline._run_ner(raw_logs)
        remedy_result = remedy_pipeline.find(
            result["rca_results"],
            root_event,
            entities_obj.__dict__,
            device_details=device_details,
        )
        remedy_pipeline.format_results(remedy_result)
        result["remedy_results"] = remedy_result

    if result:
        ui_response = pipeline.build_response(result, root_event)
        print("\n" + "=" * 80)
        print("UI RESPONSE JSON")
        print("=" * 80)
        print(json.dumps(ui_response, indent=2))
