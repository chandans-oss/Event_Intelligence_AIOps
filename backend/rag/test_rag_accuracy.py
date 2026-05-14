import os
import sys
import json
from pathlib import Path

# Add the RAG directory to path
RAG_DIR = Path(os.getcwd())
sys.path.append(str(RAG_DIR))

try:
    from ierag5_refactored import run_full_pipeline
except ImportError as e:
    print(f"Error importing pipeline: {e}")
    sys.exit(1)

def test_rag_accuracy():
    print("="*60)
    print("RAG ACCURACY TEST - TERMINAL VALIDATION")
    print("="*60)

    # 1. Prepare Synthetic Input (Core-Router-01 Degradation Scenario)
    root_event = {
        "managed_object_name": "Core-Router-01",
        "alarm_msg": "Device Not Reachable",
        "probable_cause": "Performance Threshold Breach",
        "additional_text": "Critical infrastructure router became unreachable after prolonged CPU, memory, thermal and fan degradation.",
        "severity": 5,
        "vendor": "Cisco"
    }

    metrics_payload = {
        "cpu_util": {"Core-Router-01": [72, 78, 85, 91, 94, 96, 97, 95]},
        "memory_util": {"Core-Router-01": [68, 75, 81, 86, 89, 92, 94]},
        "temp_c": {"RP0": [65, 72, 78, 82, 85, 88, 89]},
        "fan_speed_rpm": {"Tray1": [4800, 4500, 3900, 3200, 2800, 2400]},
        "availability": {"Core-Router-01": [100, 100, 99, 98, 95, 85, 45, 0]}
    }

    raw_logs = [
        "2026-05-07T14:13:15.456Z Core-Router-01 %CPU-5-UTIL: CPU utilization 78%",
        "2026-05-07T14:14:22.789Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 6800ms",
        "2026-05-07T14:16:05.678Z Core-Router-01 %SYS-2-MEMORY: Memory usage 82% - high pressure",
        "2026-05-07T14:17:40.345Z Core-Router-01 %ENV-4-TEMP: Temperature threshold exceeded on RP0 (CPU temp 82C)",
        "2026-05-07T14:18:20.901Z Core-Router-01 %FAN-3-FANFAIL: Fan tray 1 speed below normal",
        "2026-05-07T14:19:50.234Z Core-Router-01 %SYS-2-MEMORY: Critical memory usage - 89% utilized",
        "2026-05-07T14:22:50.789Z Core-Router-01 %SYS-3-CPUHOG: CPU hog detected - process 'BGP Scanner' took 14500ms",
        "2026-05-07T14:27:50.456Z Core-Router-01 Critical: Device unreachable from monitoring system"
    ]

    topology = {}

    # 2. Run Pipeline
    print(f"\n[1/2] Running pipeline with {len(raw_logs)} logs and {len(metrics_payload)} metrics...")
    try:
        output = run_full_pipeline(raw_logs, root_event, metrics_payload, topology)
    except Exception as e:
        print(f"Pipeline crashed: {e}")
        import traceback
        traceback.print_exc()
        return

    # 3. Validate Results
    results = output.get('results', [])
    query = output.get('query', {})

    print("\n[2/2] Analysis Complete. Reviewing Results:")
    print(f"\nConstructed Semantic Query:\n{query.get('semantic_text', 'N/A')}")
    
    print("\n" + "-"*40)
    print(f"RANKED RCA RESULTS (Top {len(results[:3])}):")
    print("-"*40)
    
    for i, res in enumerate(results[:3]):
        doc = res.get('doc', {})
        if isinstance(doc, dict) and 'raw' in doc:
            doc = doc['raw']
        
        title = doc.get('title', 'N/A')
        score = res.get('final_score', 0)
        cross_score = res.get('cross_encoder_score', 0)
        
        print(f"\n#{i+1} [{title}]")
        print(f"    Final Score: {score:.4f} | Cross-Encoder: {cross_score:.4f}")
        print(f"    RCA ID: {doc.get('rca_id', 'N/A')}")
        
        log_ev = res.get('relevant_logs', []) or res.get('log_features', [])
        if log_ev:
            print(f"    Matched Logs: {len(log_ev)}")
            for log in log_ev[:2]:
                template = log.get('template', '') or log.get('clean', 'N/A')
                print(f"      - {template[:80]}...")

    # 4. Summary Verdict
    top_title = ""
    if results:
        top_doc = results[0].get('doc', {})
        if isinstance(top_doc, dict) and 'raw' in top_doc:
            top_title = top_doc['raw'].get('title', '')
        else:
            top_title = top_doc.get('title', '')

    print("\n" + "="*60)
    if "CPU" in top_title or "Management" in top_title or "Reachable" in top_title or "Performance" in top_title:
        print("SUCCESS: Top result aligns with input symptoms.")
    else:
        print("WARNING: Top result might not be the most accurate match.")
    print("="*60)

if __name__ == "__main__":
    test_rag_accuracy()
