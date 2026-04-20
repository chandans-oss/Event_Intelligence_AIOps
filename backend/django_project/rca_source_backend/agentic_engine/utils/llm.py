import requests
import re
import yaml
import json
import datetime
from config.settings import *

def remove_think_tags(text):
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
    response = call_ollama_api(prompt)
    return response.strip()
