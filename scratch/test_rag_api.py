import requests
import json

url = "http://localhost:8001/api/rag/analyze"
payload = {
    "intent_id": "link.down",
    "description": "Realistic vendor data simulation",
    "payload": {
        "raw_logs": [
            "2026-04-28T10:31:39.238170Z Dist-Switch %QOS-4-CONGEST: Interface Te1/0/1 buffer full - Interface congestion occurring.",
            "2026-04-28T10:32:39.238170Z Dist-Switch %QOS-4-CONGEST: Interface Te1/0/1 tail drop - Interface congestion occurring."
        ],
        "root_event": {
            "device_type": "Network Device",
            "managed_object_name": "Te1/0/1",
            "severity": 4,
            "priority": 1,
            "alarm_category": "Performance"
        },
        "metrics_payload": {
            "utilization_percent": {"Te1/0/1": [45, 47.25, 42.75, 45, 45, 97.2, 108]},
            "out_discards": {"Te1/0/1": [0, 0, 0, 0, 0, 0]}
        },
        "topology": {}
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
