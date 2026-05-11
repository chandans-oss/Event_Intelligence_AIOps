import os
import json
from pathlib import Path

# Simulate views.py path logic
CURRENT_FILE = Path(os.path.abspath('backend/django_project/api/views.py'))
BACKEND_ROOT = CURRENT_FILE.parents[2]
RAG_DIR = BACKEND_ROOT / 'rag'
RAG_KB_PATH = RAG_DIR / 'rca_json.json'

print(f"Checking path: {RAG_KB_PATH}")
if os.path.exists(RAG_KB_PATH):
    print("File exists")
    try:
        with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"Successfully loaded {len(data)} entries")
    except Exception as e:
        print(f"Error loading JSON: {e}")
else:
    print("File does NOT exist")
