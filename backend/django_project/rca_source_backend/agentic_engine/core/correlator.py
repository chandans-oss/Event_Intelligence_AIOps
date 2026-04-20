import json
from utils.llm import call_ollama_api
from utils.data_extraction import generate_evidence_text

def call_correlator_api(incident):
    dummy_response = { "enriched_metrics": { "util_5m":0.98, "p95_util_1h":0.97, "queue_drops_total":820000, "dscp0_share":0.40 }, "hypotheses_updated": [ {"id":"H_QOS_CONGESTION","posterior":0.90}, {"id":"H_PEAK_TRAFFIC","posterior":0.55} ], "correlation_summary": "Sustained 96% utilization and 500k drops indicate QoS congestion likely.", "vector_embedding": "vec_789012" } 

    return dummy_response

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
