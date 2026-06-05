import urllib.request
import json

url = "http://localhost:8001/api/training/semantic-check"
payload = {
    "sentence_a": "Network latency is high",
    "sentence_b": "High delay in network",
    "model_name": "BAAI/bge-base-en-v1.5",
    "pooling_strategy": "Mean Pooling"
}

headers = {
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("Success! Keys in response:")
        print(list(result.keys()))
        print("\nselected_similarity:", result["selected_similarity"])
        print("\nvector_shape:", result["vector_shape"])
        print("\ncalculation_details:", result["calculation_details"])
        print("\npca_points count:", len(result["pca_points"]))
except Exception as e:
    print("Error calling API:", e)
