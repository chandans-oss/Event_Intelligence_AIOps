import requests
import json

url = 'http://localhost:8000/api/rag/analyze'
payload = {
    "payload": {
        "raw_logs": ["test log"],
        "root_event": {"managed_object_name": "test"},
        "metrics_payload": {}
    }
}

try:
    print(f"Connecting to {url}...")
    r = requests.post(url, json=payload, timeout=10)
    print(f"Status: {r.status_code}")
    try:
        print(f"Response: {json.dumps(r.json(), indent=2)}")
    except:
        print(f"Response Body: {r.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
