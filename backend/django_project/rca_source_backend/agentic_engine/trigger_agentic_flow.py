import yaml
import json
import datetime
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sentence_transformers import SentenceTransformer
from settings import *
import requests, os, re, psycopg2
import pandas as pd
from pprint import pprint

GREEN = '\033[92m'
RESET = '\033[0m'

import os
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv(usecwd=True))

# Load environment variables
try:
    from django.conf import settings
    POSTGRES_HOST = getattr(settings, 'POSTGRES_HOST', os.environ.get("POSTGRES_HOST", "10.0.4.89"))
    POSTGRES_PORT = getattr(settings, 'POSTGRES_PORT', os.environ.get("POSTGRES_PORT", "5432"))
    POSTGRES_DB = getattr(settings, 'POSTGRES_DB', os.environ.get("POSTGRES_DB", "infraondb"))
    POSTGRES_USER = getattr(settings, 'POSTGRES_USER', os.environ.get("POSTGRES_USER", "postgres"))
    POSTGRES_PASSWORD = getattr(settings, 'POSTGRES_PASSWORD', os.environ.get("POSTGRES_PASSWORD", ""))
    EMBEDING_MODEL = getattr(settings, 'EMBEDING_MODEL', os.environ.get("EMBEDING_MODEL", "intfloat/e5-base-v2"))
except (ImportError, Exception):
    POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "10.0.4.89")
    POSTGRES_PORT = os.environ.get("POSTGRES_PORT", "5432")
    POSTGRES_DB = os.environ.get("POSTGRES_DB", "infraondb")
    POSTGRES_USER = os.environ.get("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "")
    EMBEDING_MODEL = os.environ.get("EMBEDING_MODEL", "intfloat/e5-base-v2")

# ----------------------- Load Intents -----------------------
def load_intents(file_path):
    with open(file_path, 'r') as f:
        data = yaml.safe_load(f)
        return data.get('intents', data)

# ----------------------- Load Situations -----------------------
def load_situation(file_path):
    with open(file_path, 'r') as f:
        data = yaml.safe_load(f)
        return data.get('situation_template', data)
    
# ----------------------- Rule-Based Intent Detection -----------------------
def rule_based_intent_detection(incident, intents):
    print("incident input to rule based intent detection:", incident)
    best_match = ("unknown", 0.0, None)
    rule_scores = []
    matched_key_and_logs = {}

    for intent in intents:
        score = 0
        matched_key_and_logs[intent['id']] = {'signals':[], 'keyword':[]}

        for kw in intent.get("keywords", []):
            if any(kw.lower() in log.lower() for log in incident.get("logs", [])):
                score += 0.2
                matched_key_and_logs[intent['id']]['keyword'].append(kw)

        for sig in intent.get("signals", []):
            metric = sig["metric"]
            for dev in incident["signals"]:
                if metric in incident["signals"][dev]:
                    value = incident["signals"][dev][metric]
                    try:
                        if eval(f"{value} {sig['op']} {sig['value']}"):
                            score += sig["weight"]
                            matched_key_and_logs[intent['id']]['signals'].append(f"{metric} {sig['op']} {sig['value']} ({sig['weight']})")
                    except Exception:
                        pass

        rule_scores.append((intent["id"], round(score,2)))
        if score > best_match[1]:
            best_match = (intent["id"], round(score,2), intent["template_id"])
    return best_match, rule_scores, matched_key_and_logs

# --------------------------------------
# Step 3: ML-Based Intent Prediction
# --------------------------------------
# Mock ML model for demo purpose

class MockIntentModel:
    def predict_proba(self, X):
        return [[0.09, 0.91]]  # {"unknown":0.09, "backup_congestion":0.91}

    def predict(self, X):
        return ["performance.backup_induced_congestion"]

ml_model = MockIntentModel()

def ml_intent_prediction(incident):
    features = np.array([
        incident["signals"]["utilization"], 
        incident["signals"]["queue_drops"], 
        incident["signals"]["traffic_dscp0_percent"],
        incident["signals"]["traffic_tcp_445_percent"]
    ]).reshape(1, -1)

    intent = ml_model.predict(features)[0]
    confidence = ml_model.predict_proba(features)[0][1]
    return intent, confidence

# --------------------------------------
# Step 4: Combine Scores + Produce Output
# --------------------------------------
def compute_final_confidence(rule_score, ml_conf):
    return round(0.5 * rule_score + 0.5 * ml_conf, 2)

def generate_incident_output(incident, rule_result, ml_result):
    rule_intent, rule_score = rule_result
    ml_intent, ml_conf = ml_result

    final_intent = rule_intent if rule_score >= 0.5 else ml_intent
    final_confidence = compute_final_confidence(rule_score, ml_conf)

    incident_output = {
        "incident_id": f"INC-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "device": incident["device"],
        "interface": incident["interface"],
        "detected_intent": final_intent,
        "rule_confidence": rule_score,
        "ml_confidence": ml_conf,
        "final_confidence_score": final_confidence,
        "timestamp": incident["timestamp"],
        "metrics_used": incident["signals"],
        "logs_used": incident["logs"]
    }
    return incident_output

# -----------------------  Hypothesis Scoring -----------------------
def score_signals(signal_rules, incident_metrics):
    score = 0
    for rule in signal_rules:
        metric = rule["metric"]
        for dev in incident_metrics:
            if metric in incident_metrics[dev]:
                try:
                    if eval(f"{incident_metrics[dev][metric]} {rule['op']} {rule['value']}"):
                        score += rule["weight"]
                except:
                    pass
    return score

def score_logs(log_rules, logs):
    score = 0
    matched_logs = set()
    if not logs: 
        return 0,[]
    for kw in log_rules:
        if isinstance(kw, str):
            # Keyword only
            if any(kw.lower() in log.lower() for log in logs):
                score += 0.25
        else:
            # YAML log pattern object
            keyword = kw.get("keyword", "").lower()
            weight = kw.get("weight", 0.2)
            if any(keyword in log.lower() for log in logs):
                score += weight
                for i,log in enumerate(logs):
                    if keyword in log.lower():
                        matched_logs.add(i)
    return score, matched_logs

def hypothesis_scorer_best_intent(incident, intents, best_intent_id, threshold=0.3):
    """
    ✅ Score hypotheses only for the best-matching intent.
    """
    # Find the best intent object
    best_intent = next((i for i in intents if i["id"] == best_intent_id), None)
    if not best_intent:
        return {"intent_id": "unknown", "intent_score": 0, "hypotheses": [], "top_hypothesis": {}, "prior": 0}

    # Step 1 – Score the intent (optional but useful)
    sig_score = score_signals(best_intent.get("signals", []), incident.get("signals", {}))
    log_score, _ = score_logs(best_intent.get("keywords", []), incident.get("logs", []))
    intent_score = round(sig_score + log_score, 2)

    
    # Step 2 – Score only its hypotheses
    hypothesis_scores = []
    
    for hyp in best_intent.get("hypotheses", []):
        hs = score_signals(hyp.get("signals", []), incident.get("signals", {}))
        hl, matched_logs_indx = score_logs(hyp.get("log_patterns", []), incident.get("logs", []))
        total = round(hs + hl, 2)

        hypothesis_scores.append({
            "hypothesis_id": hyp["id"],
            "description": hyp.get("description", ""),
            "signal_score": round(hs, 2),
            "log_score": round(hl, 2),
            "total_score": total,
            "matched_logs" : [incident.get("logs", [])[i] for i in matched_logs_indx]
        })

    hypothesis_scores = sorted(hypothesis_scores, key=lambda x: x["total_score"], reverse=True)

    return {
        "intent_id": best_intent["id"],
        "intent_score": intent_score,
        "hypotheses": hypothesis_scores,
        "top_hypothesis": hypothesis_scores[0] if hypothesis_scores else {},
        "prior": hypothesis_scores[0]["total_score"] if hypothesis_scores else 0
    }

def get_db_connection():
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD
    )


def remove_think_tags(text):
    # Remove <think>...</think> including content (non-greedy, supports multi-line)
    cleaned = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
    return cleaned

def call_ollama_api(prompt, model=OLLAMA_MODEL):
    payload = {"model": model, "prompt": prompt, "stream": False}
    try:
        res = requests.post(OLLAMA_API_URL, json=payload)
        res.raise_for_status()
        response_text = res.json().get("response", "")
        if response_text:
            cleaned_text = remove_think_tags(response_text)
            return cleaned_text.strip()
        return res.json().get("response", "").strip()
    except Exception as e:
        return f"[WARNING] Ollama API call failed: {e}"
    

def generate_goal_llm(metrics, logs, device, resource_name, resource_type):
    prompt = f"""
You are an intelligent network assistant.

Your task is to generate a short and clear troubleshooting goal by looking at:
1. The current metrics (values or trends)
2. The log messages or events observed
3. The device and resource involved

### What to do:
- Identify any abnormal behavior or change in metrics (e.g., high usage, errors, drops, latency, failures).
- See if any log message can explain or is related to these abnormal metrics.
- Correlate both to form a meaningful problem statement.
- If logs do not match metrics, still mention the most important symptom from metrics.
- do not assume vendor-specific features.
- Output only **one sentence**, starting with “Investigate …”.

### Input:
Device: {device}
{f'Resource: {resource_name} ({resource_type})' if resource_name else ''}
Metrics: {metrics}
Logs: {logs}

### Output format (only one sentence):
"Investigate <key issue> on <device/resource> possibly related to <cause based on metrics or logs>."
"""
    # print(prompt)
    response = call_ollama_api(prompt)
    return response.strip()

def create_situation_card(incident, hypotheses, situations):
    matched_situation = (next((situation for situation in situations if situation["template_id"] == incident["template_id"]), None))
    filled_stats = {}
    if matched_situation:
        situation_text = matched_situation["situation_text"]
        # Fill placeholders
        all_replacer_keys = re.findall(r'\{(.*?)\}', situation_text)
        for key in all_replacer_keys:
            key = key.strip()
            if key == "top_hypothesis":
                value = hypotheses["top_hypothesis"]["description"] if hypotheses["top_hypothesis"] else "N/A"
            else:
                value = str(incident.get(key, None))
                device = incident.get('device','')
                if value == "None" or value is None:
                    signal_val = incident.get("signals", {}).get(device, {})
                    if isinstance(signal_val, dict):
                        value = str(signal_val.get(key,"N/A"))
                    else:
                        value = "N/A"
            situation_text = situation_text.replace(f"{{{key}}}", value)
        return True, situation_text, filled_stats
    return False, "No matching situation template found.", {}

def planner_call(incident):
    
    device = incident["device"]
    res_name = incident.get("resoure_name","")
    top_hypo = incident.get('top_hypothesis') or {}
    print(top_hypo)
    if 'crc' in top_hypo.get("description", "").lower():
        dummy_response = {
            "plan_id": "PLAN-CRC-20491",
            "steps": [
                {
                "id": 1,
                "tool": "tsdb_query",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "query": [
                    "interface_input_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "interface_output_discards_total{device='%s',iface='%s'}" % (device, res_name),
                    "crc_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "input_signal_strength_dbm{device='%s',iface='%s'}" % (device, res_name)
                    ]
                },
                "why": "Check sustained spikes in CRC errors, input errors, discards, and signal degradation"
                },
                {
                "id": 2,
                "tool": "snmp_query",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "oids": [
                    "IF-MIB::ifInErrors.%s" % (res_name),
                    "IF-MIB::ifOutDiscards.%s" % (res_name),
                    "CISCO-ENTITY-SENSOR-MIB::entSensorValue.%s" % (res_name)
                    ],
                    "device": "%s" % (device)
                },
                "why": "Validate physical port health and optical/electrical signal via SNMP"
                },
                {
                "id": 3,
                "tool": "log_query",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "device": "%s" % (device),
                    "search": [
                    "CRC",
                    "input error",
                    "link flap",
                    "PHY error",
                    "transceiver fault",
                    "optical power low"
                    ]
                },
                "why": "Look for system logs indicating CRC bursts, link flaps, or transceiver faults"
                },
                {
                "id": 4,
                "tool": "config_check",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "device": "%s" % (device),
                    "checks": [
                    "speed/duplex mismatch on %s" % (res_name),
                    "verify transceiver type & DOM support",
                    "auto-negotiation status on %s" % (res_name)
                    ]
                },
                "why": "Detect configuration issues that commonly cause CRC and physical errors"
                },
                {
                "id": 5,
                "tool": "phy_test",
                "hypothesis": "H_CRC_PHYSICAL_CORRUPTION",
                "params": {
                    "device": "%s" % (device),
                    "interface": "%s" % (res_name),
                    "tests": ["cable_diagnostics", "optic_dom_check"]
                },
                "why": "Run cable/optic diagnostics to confirm hardware-level corruption"
                }
            ],
            "stop_when": "CRC/root-cause indicators confirmed OR score ≥ 0.85"
            }

    elif 'congestion' in top_hypo.get("description", "").lower():
        dummy_response = { "plan_id":"PLAN-10342", "steps":[ { "id":1, "tool":"tsdb_query", "hypothesis": "H_QOS_CONGESTION","params":{"query":["rate(ifHCOutOctets{device='%s',iface='%s'}[5m])*8"%(device, res_name),"qos_queue_tail_drops_total{device='%s',iface='%s'}"%(device,res_name)]}, "why":"Check sustained near line-rate and queue drops"}, { "id":2, "hypothesis": "H_QOS_CONGESTION","tool":"flow_query","params":{"filters":{"device":"%s"%(device)},"group_by":["application","dscp"]}, "why":"Check DSCP remarking"}, { "id":3, "hypothesis": "H_QOS_CONGESTION", "tool":"config_check","params":{"device":"%s"%(device),"checks":["service-policy output on %s"%(res_name)]}, "why":"Detect missing QoS policy"} ], "stop_when":"QoS triad confirmed OR conf≥0.8" } 
    else:
        dummy_response = {
            "plan_id": "PLAN-PHYSICAL-LAYER-GENERIC",
            "steps": [
                {
                "id": 1,
                "tool": "tsdb_query",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "query": [
                    "interface_input_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "interface_output_discards_total{device='%s',iface='%s'}" % (device, res_name),
                    "crc_errors_total{device='%s',iface='%s'}" % (device, res_name),
                    "input_signal_strength_dbm{device='%s',iface='%s'}" % (device, res_name),
                    "link_flaps_total{device='%s',iface='%s'}" % (device, res_name)
                    ]
                },
                "why": "Retrieve interface counters to confirm error trends, CRC spikes, and signal issues"
                },

                {
                "id": 2,
                "tool": "snmp_query",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "device": "%s" % (device),
                    "oids": [
                    "IF-MIB::ifInErrors.%s" % (res_name),
                    "IF-MIB::ifOutDiscards.%s" % (res_name),
                    "IF-MIB::ifInCRC.%s" % (res_name),
                    "CISCO-ENTITY-SENSOR-MIB::entSensorValue.%s" % (res_name)
                    ]
                },
                "why": "Validate error counters and physical transceiver/PHY status from SNMP"
                },

                {
                "id": 3,
                "tool": "log_query",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "device": "%s" % (device),
                    "search": [
                    "CRC",
                    "PHY error",
                    "link flap",
                    "LOS",
                    "LOF",
                    "input error",
                    "optic fault",
                    "transceiver warning"
                    ]
                },
                "why": "Check logs for link instability, CRC bursts, and optical/electrical faults"
                },

                {
                "id": 4,
                "tool": "config_check",
                "hypothesis": incident.get('top_hypothesis',""),
                "params": {
                    "device": "%s" % (device),
                    "checks": [
                    "verify speed and duplex settings on %s" % (res_name),
                    "check auto-negotiation status",
                    "validate transceiver type compatibility",
                    "check for MTU mismatch",
                    "confirm interface is not oversubscribed"
                    ]
                },
                "why": "Identify misconfigurations that commonly cause CRC errors or packet discards"
                }
            ],
            "stop_when": "Physical-layer fault indicators confirmed OR confidence ≥ 0.85"
            }

    return dummy_response

def call_correlator_api(incident):
    dummy_response = { "enriched_metrics": { "util_5m":0.98, "p95_util_1h":0.97, "queue_drops_total":820000, "dscp0_share":0.40 }, "hypotheses_updated": [ {"id":"H_QOS_CONGESTION","posterior":0.90}, {"id":"H_PEAK_TRAFFIC","posterior":0.55} ], "correlation_summary": "Sustained 96% utilization and 500k drops indicate QoS congestion likely.", "vector_embedding": "vec_789012" } 

    return dummy_response

def generate_evidence_text(incident):
    signals = incident.get('signals',{})
    output_lines = "Here is the metrics of device under inevstigation"
    for device, metrics in signals.items():
        if not metrics:
            continue

        output_lines += (f"\nDevice: {device}")
        metric_string = ", ".join(f"{metric}={value}" for metric, value in metrics.items())
        output_lines += metric_string   
        output_lines += "\n" 

    if incident.get("logs"):
        output_lines += f"\n Here is the logs supporting metrics anomaly \n {incident['logs']}"
    return output_lines 


def historical_retriever(incident, k=1):
    """ Fetch similar historical events from historical DB
    """
    try:
        current_situation = incident["situation_card"]['situation_text']
        model = SentenceTransformer(EMBEDING_MODEL)  
        query_embedding = model.encode(current_situation).tolist()
        query_embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
        conn = get_db_connection()
    
        with conn.cursor() as cur:
            # Cosine similarity: 1 - (embedding <=> query) gives similarity (higher = more similar)
            cur.execute("""
                SELECT 
                    incident_id,
                    situation_summary,
                    intent,
                    root_cause_prediction,
                    confidence_score,
                    remediation,
                    1 - (embedding <=> %s::vector) AS similarity_score
                FROM historical_rca_cases
                where intent = %s and subintent = %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s;
            """, (query_embedding_str, incident['intent'], incident['subintent'], query_embedding_str, k))

            results = cur.fetchall()
            ret_cases = []
            for i, row in enumerate(results, 1):
                incident_id, sit_summary, intent, rca, conf, rem, sim_score = row
                ret_cases.append({'case_id': incident_id, "intent":intent, "rca":rca, "sim_score":sim_score,"remedy":rem, "sit_summary":sit_summary})

    except Exception as e:
        print("Historical DB failed, falling back to dummy response: ", e)
        ret_cases = []

    if not ret_cases:
        dummy_response = { "retrieved_cases":[ { "case_id":"INFRAON-ALARM-3467", "intent":"performance", "rca":"QoS misclassification", "sim_score":0.86, "remedy":"apply WAN-QoS policy", "sit_summary": "High utilization on Core router." }, { "case_id":"INFRAON-ALARM-092", "intent":"performance", "rca":"Link capacity exhaustion", "sim_score":0.63, "remedy":"Upgrade link capacity", "sit_summary": "Sustained port limits hit." } ], "top_case":"INFRAON-ALARM-3467", "average_similarity":0.78 }
        return dummy_response

    response = {"retrieved_cases":ret_cases, "top_case":ret_cases[0].get("case_id") if ret_cases else "", "average_similarity": sum([item["sim_score"] for item in ret_cases])/len(ret_cases) if ret_cases else 0}
    print("Historical Retrieval Response: ",response)
    return response

def correlator_llm(incident, historical_output=None):
    prompt = f"""
You are a network RCA expert. who is good at correlating data from different sources.

Evidence: {generate_evidence_text(incident) }

Top hypothesis (highest priority):
{incident['top_hypothesis'].get('hypothesis_id', 'Unknown')} - {incident['top_hypothesis'].get('description', 'None')} (score={incident['prior']})

Similar case: {historical_output}

Situation: {incident['situation_card']['situation_text']}

Task:
Generate the Root Cause Analysis (RCA), confidence score, remedies, evidence used, and a short explanation.

Output Requirements:
- Output STRICTLY in JSON format.
- Keys required: rca, confidence, remedy, evidence_used, explanation.
- confidence must be a 2 decimal float between 0 and 1.
- remedy must be a list of strings.
- generate minimum 4 remedy or suggestions
- evidence_used must be a LIST OF DICTS.
- Each evidence dict must contain EXACTLY these keys:
    - "id": unique identifier string
    - "metric": metric name
    - "value": metric value
- Explanation must be short and concise.
- Prioritize the top hypothesis when generating the RCA.
- Do NOT output anything outside the JSON.

Sample output:
{{
  "rca": "<root cause>",
  "confidence": <confidence_score>,
  "remedy": ["<step1>", "<step2>"],
  "evidence_used": [
    {{"id": "<evidence_id_1>", "metric": "<metric_name_1>", "value": "<metric_value_1>"}},
    {{"id": "<evidence_id_2>", "metric": "<metric_name_2>", "value": "<metric_value_2>"}}
  ],
  "explanation": "<short explanation>"
}}
"""
    response = call_ollama_api(prompt)
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {
          "rca": f"Failed to generate RCA. LLM output: {response}",
          "confidence": 0.0,
          "remedy": ["Check Ollama API connection or model response style"],
          "evidence_used": [],
          "explanation": "The Correlator LLM failed to return a valid JSON structure."
        }

def extract_latest_metrics(metrics, device, resource_name, start_time, end_time):
    """
    Extract latest metric values for a given device/resource within a time window.
    
    Returns:
        latest_values (dict)
        metrics_string (str)
    """
    
    # Filter based on time, device, and resource type/name
    
    res_type_col = metrics["res_type"].fillna("").astype(str).str.lower()
    
    filtered_df = metrics[
        (pd.to_datetime(metrics["timestamp"], utc=True) >= start_time) &
        (pd.to_datetime(metrics["timestamp"], utc=True) <= end_time) &
        ((res_type_col == "device") | (res_type_col == "fan") | (metrics["res_name"].fillna("").astype(str) == str(resource_name))) &
        (metrics["device"].astype(str) == str(device).strip())
    ]

    if filtered_df.empty:
        return {}, ""

    # Get the latest non-null value for each column
    latest_values = filtered_df.apply(
        lambda col: col.dropna().iloc[-1] if not col.dropna().empty else pd.NA
    ).to_dict()

    # Drop the entries where the value is pd.NA, None, or NaN
    latest_values = {
        k: v for k, v in latest_values.items() 
        if pd.notna(v)  
    }
    
    # Remove unwanted fields
    for col in ["timestamp", "res_name", "res_type", "device"]:
        latest_values.pop(col, None)

    # Convert dict → string
    metrics_string = ", ".join([f"{k}={v}" for k, v in latest_values.items()])
    metrics_string = f"For device {device} latest stats are \n {metrics_string}\n"

    return latest_values, metrics_string

def extract_syslog_entries(syslog, device, resource_name, start_time, end_time, incident):
    """
    Filter syslog logs based on device, resource_name, and time window.
    Appends formatted logs into incident["logs"] and returns logs_string.
    """

    # Filter syslog by time, device, and resource
    filtered_syslog = syslog[
        (pd.to_datetime(syslog["timestamp"], utc=True) >= start_time) &
        (pd.to_datetime(syslog["timestamp"], utc=True) <= end_time) &
        ((syslog["res_name"].fillna("").astype(str) == str(resource_name)) | (syslog["device"].astype(str) == str(device)))
    ]

    # If logs found, format and append
    if not filtered_syslog.empty:
        ts_formatted = pd.to_datetime(filtered_syslog["timestamp"], utc=True).dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        msg_with_ts = (
                        "Device: " + device + 
                        " | Timestamp: " + ts_formatted + 
                        " | Message: " + filtered_syslog["message"].astype(str)
                    ).tolist()
        incident.setdefault("logs", []).extend(msg_with_ts)

    # Format logs to string output
    logs_string = ";".join(incident.get("logs", []))
    logs_string = f"For device {device} logs are \n {logs_string}\n"

    return logs_string

def trigger_agentic_flow(trigger_event, file_path='', dashboard_call=0):

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    # Collect last 15–30 mins of metrics, logs from Excel
    # assuming sheet contains above time-series data
    xls = pd.ExcelFile(file_path)
    metrics = pd.read_excel(xls, "Metrics")
    events = pd.read_excel(xls, "Events")
    syslog = pd.read_excel(xls, "Syslog")
    inventory_location_details = pd.read_excel(xls, "Inventory_location_details")
    

    device = trigger_event.get("device")
    resource_name = trigger_event.get("resource_name","")
    resource_type = trigger_event.get("resource_type","")

    # Build Base incident object
    incident = {
        "device": device,
        "incident_id" : trigger_event["alaram_id"],
        "resoure_name": resource_name,
        "resource_type": resource_type,
        "signals": {},
        "logs": trigger_event["alert_msg"],
        "timestamp": trigger_event["timestamp"]
    }

    # --------- fetch metrics of time of incident for all stats -> part of correlation ---------
    end_time = pd.to_datetime(incident["timestamp"], utc=True)
    start_time = end_time - pd.Timedelta(minutes=15)

    latest_values, metrics_string =  extract_latest_metrics(metrics, device, resource_name, start_time, end_time)
    incident["signals"][device] = latest_values
    # -----------------------------------------------------------------------------------------

    # ----- logs Enrichment -> part of correlation -----
    logs_string = extract_syslog_entries(syslog, device, resource_name, start_time, end_time, incident)
    
    # --------------------------------------------------

    # --------- step : preprocessing ---> check location based correlation ----------------
    if len(inventory_location_details):
        site_record = inventory_location_details[inventory_location_details["device"] == device]

        if not site_record.empty:
            site_value = site_record["site"].iloc[0]

            all_same_site_devices = inventory_location_details[
                                    (inventory_location_details["site"] == site_value) & 
                                    (inventory_location_details["device"] != device)
                                ]["device"].tolist()
            for new_dev in all_same_site_devices:
                new_latest_values, new_metrics_string = extract_latest_metrics(metrics, new_dev, "", start_time, end_time)
                metrics_string += new_metrics_string
                incident["signals"][new_dev] = new_latest_values
                new_logs_string = extract_syslog_entries(syslog, new_dev, "", start_time, end_time, incident)
                logs_string += new_logs_string

    # -------------------------------------------------------------------------------------

    # Yield Step 0: Pre-processing Correlation (signals/logs populated)
    if dashboard_call == 1:
        yield incident

    # --------- Step : Orchestration -> Generate Goal ----------------
    incident["goal"] = generate_goal_llm(metrics_string, logs_string, device, resource_name, resource_type)
    if dashboard_call==1:
        yield incident
    else:
        print("\n🎯 Generated Goal | ", incident["goal"])
    # ----------------------------------------------------------------

    # --------- Load Intents and Situations from yaml files -----------
    intents = load_intents(INTENT_YAML_PATH)
    situations = load_situation(SITUATION_YAML_PATH)
    # -----------------------------------------------------------------

    # -------- step : Intent Routing -> Generate Score for Intents --------
    rule_best, rest, match_keys_rules = rule_based_intent_detection(incident, intents)
    incident["intent"] = rule_best[0].split(".")[0] if "." in rule_best[0] else rule_best[0]
    incident["subintent"] = rule_best[0].split(".")[1] if "." in rule_best[0] else "unknown"
    incident["confidence"] = rule_best[1]
    incident["template_id"] = rule_best[2]
    incident['intent_output'] = (rule_best, rest, match_keys_rules) 
    if dashboard_call==1:
        yield incident
        # print(json.dumps(incident, default=str))
        # print("",rule_best[0])
    else:
        print("\n📌 Intent Detected (Best Match) | ", {k:v for k,v in incident.items() if k in ["intent", "subintent", "template_id", "confidence"]})
    # ----------------------------------------------------------------------

    # ------- step : Hypothesis Scorer -> Generate Score for each hypothesis -------
    hypotheses = hypothesis_scorer_best_intent(incident, intents, rule_best[0])
    incident["top_hypothesis"] = hypotheses["top_hypothesis"]
    incident["prior"] = hypotheses["prior"]
    incident["hypotheses"] = hypotheses['hypotheses']
    # print("Hypo Output: ",hypotheses)
    if dashboard_call==1:
        yield incident
    else:   
        print("\n🧠 Ranked Hypotheses | ", hypotheses["hypotheses"])
    # ------------------------------------------------------------------------------

    # ------- step : Situation Builder -> Generate Situation card -----------------
    _, situation_text, filled_stats = create_situation_card(incident, hypotheses, situations)
    incident["situation_card"] = {"situation_id":f"INFRAON-{incident['incident_id']}", "situation_text":situation_text, "metadata":{"device": device,"resource_name": resource_name,"resource_type": resource_type,'filled_stats': filled_stats}}
    
    if dashboard_call==1:
        yield incident 
        # print("Situation Card: ",incident["situation_card"])
        # print("data for situation: ",_, situation_text, filled_stats) 
    else:
        print("\n🃏 Situation Card | ", incident["situation_card"])
    # -----------------------------------------------------------------------------

    # ------- step : Calling planner llm -> Genrate plan for given scenario --------
    if dashboard_call==1:
        plan_output = planner_call(incident)
        incident['plan'] = plan_output
        # yield incident # Skipped Planner LLM in UI
    else:
        plan_output = planner_call(incident)
        print("\n","-"*20, "planner_call", "-"*20)
        print("\n 🔄 Request sent to planner: ", f"\n {GREEN} Ranked hypotheses {RESET}-> {hypotheses['hypotheses']},\n {GREEN}Situation card {RESET}-> {incident['situation_card']},\n {GREEN}planner_template_id{RESET} -> {incident['template_id']}")
        print("\n🗺️  Planner Output >> ")
        pprint(plan_output)
    # ------------------------------------------------------------------------------

    # ------- step : Data correlation Engine -> Execute planner llm steps --------
    if dashboard_call==1:
        correlator_output =  call_correlator_api(incident)
        incident['correlator_api'] = correlator_output
        
        # Combine correlation and historical into step 6
        try: 
            historical_output = historical_retriever(incident, 6)
            incident['historical'] = historical_output
        except: 
            incident['historical'] = []
            historical_output = []
            
        yield incident
    else:
        correlator_output =  call_correlator_api(incident)
        print("\n","-"*20, "call_correlator_api", "-"*20)
        print("\n 🔄 Request sent to correlator: ", f"\n{GREEN}plan_output{RESET} -> {plan_output},\n {GREEN}situation_card{RESET} -> {incident['situation_card']}, \n{GREEN}top_hypothesis{RESET} -> {incident['top_hypothesis']}")
        print(f"\n🔍 correlator Output >> " )
        pprint(correlator_output)
        
        # historical part for console
        print("\n","-"*20, "Historical data Retriever", "-"*20)
        historical_output = historical_retriever(incident, 3)
        print(f"\n⚙️  Historical Case Retrieval Output >> ")
        print(historical_output)
    # -----------------------------------------------------------------------

    # ------- step : RCA correlator engine -> Generate possible rca and remedies -------
    if dashboard_call==1:
        correlator_llm_output = correlator_llm(incident, historical_output)
        incident['correlator_llm_output'] =  correlator_llm_output
        yield incident
    else:
        correlator_llm_output = correlator_llm(incident, historical_output)        
        evidence_list = [f"{e['metric']}={e['value']}" for e in correlator_llm_output['evidence_used']]

        print("\n🧩 Final RCA and Remedy Generated",f"\n\t\\__ RCA : {correlator_llm_output['rca']}",f"\n\t\\__ Confidence : {correlator_llm_output['confidence']} ",f" (Evidence Used : {', '.join(evidence_list)})",f"\n\t\\__ Remedy : {', '.join(correlator_llm_output['remedy'])}",f"\n\t\\__ Explanation : {correlator_llm_output['explanation']}")
    # -----------------------------------------------------------------------------------

    if dashboard_call==1:
        return

# -----------------------
# ✅ RUN EVERYTHING
# -----------------------
if __name__ == "__main__":

    # --------------- use case 1 --------------
    sample_trigger_incident_input = {
        "device": "core-router-dc1",
        "alaram_id": "ALARM-12345",
        "resource_name": "Gi0/1/0",
        "resource_type": "interface",
        "timestamp": "2025-10-28T14:30:00Z",
        "alert_msg": ["High interface utilization detected on Gi0/1/0"]
    }

    data = trigger_agentic_flow(sample_trigger_incident_input, r"uploads/Network_Anomaly_Backup_Congestion.xlsx", 0)
    for d in data:
        print(d)

    # --------------- use case 2 --------------
    # sample_trigger_incident_input = {"timestamp":"2025-11-11T10:05:00Z",
    #                                  "device": "Switch-A",
    #                                 "alaram_id":"ALARM-3456",
    #                                 "resource_name":"Gi0/1",
    #                                 "resource_type":"interface",
    #                                 "alert_msg":["High crc error detected on Gi0/1"]}
    # data = trigger_agentic_flow(sample_trigger_incident_input, r"uploads/Network_Anomaly_Link_Flap.xlsx",0)
    # for d in data:
    #     print(d)


    # data = trigger_agentic_flow(sample_trigger_incident_input, r"uploads\Network_Anomaly_Backup_Congestion.xlsx",0)
    # trigger_agentic_flow(incident_input, intents, r"uploads/Network_Anomaly_Backup_Congestion.xlsx")


