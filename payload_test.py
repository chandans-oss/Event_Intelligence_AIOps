import requests
import json
import time
import pandas as pd
import warnings
import glob
import os

warnings.filterwarnings('ignore')

# -------------------------------------------------
#  CONFIG
# -------------------------------------------------
API_URL     = "http://10.0.4.161:8000/rca"
DATASET_DIR = r"D:\RAG_str\RAG_optional_LLM\test_dataset"
OUTPUT_CSV  = "rag_test_results.csv"

# -------------------------------------------------
#  SCENARIOS  (18 total)
# -------------------------------------------------
query_builder_states = [
    (True,  False),   # Enhanced
    (False, True),    # LLM
    (False, False),   # Normal
]
reranker_states = [
    (True,  False),   # Cross-encoder
    (False, True),    # LLM Reranker
    (False, False),   # None
]
syslog_states = [False, True]

scenarios = []
for qb in query_builder_states:
    for rr in reranker_states:
        for syslog in syslog_states:
            # (RUN_RERANK_SEARCH, USE_LLM_RERANKER, USE_ENHANCED_QB, USE_LLM_QB, without_syslog)
            scenarios.append((rr[0], rr[1], qb[0], qb[1], syslog))

# -------------------------------------------------
#  HELPERS
# -------------------------------------------------
def load_payload(filepath, without_syslog=False):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"  [ERROR] Could not read {filepath}: {e}")
        return {}

    # Sanitize metrics_payload -- keep only entity -> [numbers] arrays
    if "metrics_payload" in data and isinstance(data["metrics_payload"], dict):
        sanitized = {}
        for group, ents in data["metrics_payload"].items():
            if not isinstance(ents, dict):
                continue
            good = {k: v for k, v in ents.items()
                    if isinstance(v, list) and all(isinstance(x, (int, float)) for x in v)}
            if good:
                sanitized[group] = good
        data["metrics_payload"] = sanitized

    if without_syslog:
        data["raw_logs"] = []

    return data


def get_rank_info(result):
    """Return (title, rca_text, relevant_logs_str, confidence_pct) for one ranked result.
    Handles both:
      - Processed format (results[]): has 'confidence' (already %), flat 'title', 'relevant_logs' list
      - Raw pipeline format (rca_results[]): has 'doc.raw.title', 'final_score' 0-1 scale
    """
    if not result:
        return "N/A", "", "", None

    # -- Detect format using 'confidence' key (only in processed results) -----
    is_processed = "confidence" in result

    if is_processed:
        title    = result.get("title", "Unknown")
        rca_text = result.get("root_cause_analysis", "")
        conf_raw = result.get("confidence", 0)
        conf_pct = round(float(conf_raw), 1) if conf_raw else None
        rel_logs = "; ".join(
            log.get("template", log.get("sample", ""))
            for log in result.get("relevant_logs", [])
            if log.get("template") or log.get("sample")
        )
    else:
        # raw format: doc is nested as {doc: {raw: {...}}}
        doc_field = result.get("doc", {})
        raw_doc   = doc_field.get("raw", doc_field) if isinstance(doc_field, dict) else {}
        title     = raw_doc.get("title", raw_doc.get("rca_id", "Unknown"))
        rca_text  = raw_doc.get("root_cause_analysis", "")
        # raw format uses final_score (0.0 - 1.0); multiply to get %
        score     = result.get("final_score", result.get("cross_encoder_score", result.get("prerank_score", 0)))
        conf_pct  = round(float(score) * 100, 1) if score else None
        rel_logs  = ""

    return title, rca_text, rel_logs, conf_pct


def format_metric_anomalies(metric_facts):
    """Convert the metric_facts list to a readable string."""
    if not metric_facts:
        return ""
    parts = []
    for mf in metric_facts:
        metric = mf.get("metric", "")
        entity = mf.get("entity", "")
        direction = mf.get("direction", "")
        change   = mf.get("change_pct", 0)
        parts.append(f"{metric}.{entity} {direction} {change:+.1f}%")
    return "; ".join(parts)


# -------------------------------------------------
#  MAIN
# -------------------------------------------------
def main():
    dataset_files = sorted(glob.glob(os.path.join(DATASET_DIR, "*.json")))

    if not dataset_files:
        print(f"No JSON files found in {DATASET_DIR}")
        return

    print(f"Found {len(dataset_files)} dataset file(s). Running {len(scenarios)} scenarios each.")
    print(f"Total API calls: {len(dataset_files) * len(scenarios)}\n")

    rows = []

    for filepath in dataset_files:
        filename = os.path.basename(filepath)
        print(f"\n{'='*60}")
        print(f"  Dataset: {filename}")
        print(f"{'='*60}")

        # Load the raw JSON once so we can store input fields
        raw_data = load_payload(filepath, without_syslog=False)
        if not raw_data:
            print(f"  [SKIP] Empty payload -- skipping {filename}")
            continue

        root_event      = raw_data.get("root_event", {})
        raw_logs_all    = raw_data.get("raw_logs", [])
        metrics_payload = raw_data.get("metrics_payload", {})

        # Serialize inputs for CSV (compact JSON strings)
        input_root_event    = json.dumps(root_event, ensure_ascii=False)
        input_raw_logs      = json.dumps(raw_logs_all, ensure_ascii=False)
        input_metrics       = json.dumps(metrics_payload, ensure_ascii=False)
        root_event_message  = root_event.get("alarm_msg", root_event.get("event_msg", ""))

        for s in scenarios:
            run_rerank, use_llm_reranker, use_enhanced, use_llm_query, without_syslog = s

            payload = load_payload(filepath, without_syslog)
            if not payload:
                continue

            request_data = {
                **payload,
                "run_config": {
                    "use_llm_rca":              use_llm_query,
                    "use_enhanced":             use_enhanced,
                    "run_rerank_search":        run_rerank,
                    "use_llm_reranker":         use_llm_reranker,
                    "retrieve_k":               20,
                    "rerank_k":                 5,
                    "top_k":                    3,
                    "rca_confidence_threshold": 60,
                    "llm_temperature":          0.1,
                    "llm_max_tokens":           150,
                }
            }

            cfg_label = (
                f"Rerank={run_rerank} LLM_Rerank={use_llm_reranker} "
                f"Enhanced={use_enhanced} LLM_QB={use_llm_query} NoSyslog={without_syslog}"
            )
            print(f"  -- {cfg_label}")

            start_time = time.time()
            try:
                resp = requests.post(API_URL, json=request_data, timeout=120)
                resp.raise_for_status()
                resp_json = resp.json()
                elapsed = round(time.time() - start_time, 2)

                # -- Results ------------------------------------------
                rca_results = resp_json.get("results") or resp_json.get("rca_results") or []

                r1_title, r1_rca, r1_logs, r1_conf = get_rank_info(rca_results[0] if len(rca_results) > 0 else None)
                r2_title, r2_rca, r2_logs, r2_conf = get_rank_info(rca_results[1] if len(rca_results) > 1 else None)
                r3_title, r3_rca, r3_logs, r3_conf = get_rank_info(rca_results[2] if len(rca_results) > 2 else None)

                # -- Query info ---------------------------------------
                # V6 endpoint puts query inside "rag_query" or "query"
                rag_query    = resp_json.get("rag_query") or resp_json.get("query") or {}
                semantic_txt = rag_query.get("semantic_text", "")
                keyword_txt  = rag_query.get("keyword_string", "")
                metric_facts = rag_query.get("metric_facts", resp_json.get("metric_facts", []))
                metric_anomalies = format_metric_anomalies(metric_facts)
                # build_ms is the query-builder-only time reported by the backend
                build_ms = rag_query.get("build_ms", resp_json.get("build_ms", None))

                # -- NER entities -------------------------------------
                entities = resp_json.get("entities", {})
                ner_interfaces  = ", ".join(entities.get("interfaces", []))
                ner_ips         = ", ".join(entities.get("ips", []))
                ner_alarm_codes = ", ".join(entities.get("alarm_codes", []))
                ner_bgp         = ", ".join(entities.get("bgp_neighbors", []))
                ner_protocols   = ", ".join(entities.get("protocols", []))

                rows.append({
                    # -- Input ----------------------------------------
                    "Dataset File":         filename,
                    "Root Event Message":   root_event_message,
                    "Input Root Event":     input_root_event,
                    "Input Raw Logs":       input_raw_logs,
                    "Input Metrics":        input_metrics,
                    # -- Config ---------------------------------------
                    "RUN_RERANK_SEARCH":          str(run_rerank).upper(),
                    "USE_LLM_RERANKER":           str(use_llm_reranker).upper(),
                    "USE_ENHANCED_QUERY_BUILDER": str(use_enhanced).upper(),
                    "USE_LLM_QUERY_BUILDER":      str(use_llm_query).upper(),
                    "without_syslog":             str(without_syslog).upper(),
                    # -- Rank 1 ---------------------------------------
                    "Rank 1 Doc":           r1_title,
                    "Rank 1 Confidence (%)":r1_conf,
                    "Rank 1 RCA Text":      r1_rca,
                    "Rank 1 Relevant Logs": r1_logs,
                    # -- Rank 2 ---------------------------------------
                    "Rank 2 Doc":           r2_title,
                    "Rank 2 Confidence (%)":r2_conf,
                    "Rank 2 RCA Text":      r2_rca,
                    "Rank 2 Relevant Logs": r2_logs,
                    # -- Rank 3 ---------------------------------------
                    "Rank 3 Doc":           r3_title,
                    "Rank 3 Confidence (%)":r3_conf,
                    "Rank 3 RCA Text":      r3_rca,
                    "Rank 3 Relevant Logs": r3_logs,
                    # -- Query ----------------------------------------
                    "Semantic Query":           semantic_txt,
                    "Keyword Query":            keyword_txt,
                    "Metric Anomalies":         metric_anomalies,
                    # -- NER Entities ---------------------------------
                    "NER Interfaces":    ner_interfaces,
                    "NER IPs":           ner_ips,
                    "NER Alarm Codes":   ner_alarm_codes,
                    "NER BGP Neighbors": ner_bgp,
                    "NER Protocols":     ner_protocols,
                    # -- Timing ---------------------------------------
                    # Total RCA Time: full round-trip (client-side), covers entire pipeline
                    "Total RCA Time (s)":    elapsed,
                    # Query Build Time: only the query-builder step, reported by backend
                    "Query Build Time (ms)": round(build_ms, 2) if build_ms is not None else None,
                })

            except requests.exceptions.RequestException as e:
                elapsed = round(time.time() - start_time, 2)
                print(f"    [API ERROR] {e}")
                rows.append({
                    "Dataset File":               filename,
                    "Root Event Message":          root_event_message,
                    "Input Root Event":            input_root_event,
                    "Input Raw Logs":              input_raw_logs,
                    "Input Metrics":               input_metrics,
                    "RUN_RERANK_SEARCH":           str(run_rerank).upper(),
                    "USE_LLM_RERANKER":            str(use_llm_reranker).upper(),
                    "USE_ENHANCED_QUERY_BUILDER":  str(use_enhanced).upper(),
                    "USE_LLM_QUERY_BUILDER":       str(use_llm_query).upper(),
                    "without_syslog":              str(without_syslog).upper(),
                    "Rank 1 Doc":           "ERROR",
                    "Rank 1 Confidence (%)": None,
                    "Rank 1 RCA Text":      str(e),
                    "Rank 1 Relevant Logs": "",
                    "Rank 2 Doc":           None, "Rank 2 Confidence (%)": None,
                    "Rank 2 RCA Text":      None, "Rank 2 Relevant Logs":  None,
                    "Rank 3 Doc":           None, "Rank 3 Confidence (%)": None,
                    "Rank 3 RCA Text":      None, "Rank 3 Relevant Logs":  None,
                    "Semantic Query":       None,
                    "Keyword Query":        None,
                    "Metric Anomalies":     None,
                    "NER Interfaces":       "",
                    "NER IPs":              "",
                    "NER Alarm Codes":      "",
                    "NER BGP Neighbors":    "",
                    "NER Protocols":        "",
                    "Total RCA Time (s)":   elapsed,
                    "Query Build Time (ms)": None,
                })

    # ---------------------------------------------
    # =============================================
    #  Save
    # =============================================
    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8-sig')
    print(f"\n{'='*60}")
    print(f"  Saved {len(df)} rows -- {OUTPUT_CSV}")
    print(f"{'='*60}")
    print(df[["Dataset File", "Root Event Message",
              "RUN_RERANK_SEARCH", "USE_LLM_RERANKER",
              "USE_ENHANCED_QUERY_BUILDER", "USE_LLM_QUERY_BUILDER",
              "without_syslog", "Rank 1 Doc", "Rank 1 Confidence (%)",
              "Rank 2 Doc", "Rank 2 Confidence (%)",
              "Rank 3 Doc", "Rank 3 Confidence (%)", "Total RCA Time (s)"]].to_string(index=False))


if __name__ == "__main__":
    main()
