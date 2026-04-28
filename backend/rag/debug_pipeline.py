import sys
import os
import json

# Add backend/rag to path
sys.path.append(r"D:\new_event_AIOps\Event_Intelligence_AIOps\backend\rag")

try:
    from ierag2_refactored import run_full_pipeline
    
    logs = [
        "2026-04-28T10:31:39.238170Z Dist-Switch %QOS-4-CONGEST: Interface Te1/0/1 buffer full - Interface congestion occurring.",
        "2026-04-28T10:32:39.238170Z Dist-Switch %QOS-4-CONGEST: Interface Te1/0/1 tail drop - Interface congestion occurring."
    ]
    event = {
        "device_type": "Network Device",
        "managed_object_name": "Te1/0/1",
        "severity": 4,
        "priority": 1,
        "alarm_category": "Performance"
    }
    metrics = {
        "utilization_percent": {"Te1/0/1": [45, 47.25, 42.75, 45, 45, 97.2, 108]},
        "out_discards": {"Te1/0/1": [0, 0, 0, 0, 0, 0]}
    }
    
    # Change CWD to rag dir
    os.chdir(r"D:\new_event_AIOps\Event_Intelligence_AIOps\backend\rag")
    
    results = run_full_pipeline(logs, event, metrics)
    print("SUCCESS")
    print(json.dumps(results, indent=2)[:500])
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"FAILED: {e}")
