import os
import json
import re
import tempfile
import pandas as pd
import copy
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.permissions import AllowAny
import sys

from pathlib import Path

# Precise absolute path resolution
CURRENT_FILE = Path(__file__).resolve()
BACKEND_ROOT = CURRENT_FILE.parents[2]  # Goes up to: .../backend/
RAG_DIR = BACKEND_ROOT / 'rag'
RAG_KB_PATH = RAG_DIR / 'rca_json.json'
RCA_BASE = BACKEND_ROOT / 'django_project' / 'rca_source_backend'

# Force inject paths at top priority
sys.path.insert(0, str(RAG_DIR))
sys.path.insert(0, str(RCA_BASE))
sys.path.insert(0, str(RCA_BASE / 'agentic_engine'))
sys.path.insert(0, str(RCA_BASE / 'config'))

try:
    # pyrefly: ignore [missing-import]
    from ierag5_refactored import run_full_pipeline
except ImportError:
    try:
        # pyrefly: ignore [missing-import]
        from ierag2_refactored import run_full_pipeline
    except ImportError:
        run_full_pipeline = None

try:
    # pyrefly: ignore [missing-import]
    from trigger_agentic_flow import trigger_agentic_flow
except ImportError:
    try:
        # pyrefly: ignore [missing-import]
        from rca_source_backend.agentic_engine.trigger_agentic_flow import trigger_agentic_flow
    except ImportError:
        trigger_agentic_flow = None


class RunRCAFlowView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No Excel file provided. Please upload a file."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate excel file
        if not file_obj.name.endswith(('.xls', '.xlsx')):
            return Response({"error": "Invalid file type. Please upload an Excel document."}, status=status.HTTP_400_BAD_REQUEST)

        # Save to temp file since backend expects a file path
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
            for chunk in file_obj.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        try:
            # Extract trigger event from the "NMS_Trigger_Events" sheet
            try:
                events_df = pd.read_excel(temp_file_path, "NMS_Trigger_Events")
            except ValueError:
                events_df = pd.read_excel(temp_file_path, "Events")

            if events_df.empty:
                return Response({"error": "No events found."}, status=status.HTTP_400_BAD_REQUEST)

            # Use the latest event listed
            first_row = events_df.iloc[-1]
            
            trigger_event = {
                "device": first_row.get("device", ""),
                "alaram_id": first_row.get("alaram_id", first_row.get("alarm_id", "UNKNOWN")),
                "resource_name": first_row.get("resource_name", ""),
                "resource_type": first_row.get("resource_type", ""),
                "timestamp": str(first_row.get("timestamp", "")),
                "alert_msg": [str(first_row.get("alert_msg", first_row.get("event_msg", "")))]
            }

            if trigger_agentic_flow is None:
                return Response({"error": "RCA Engine (trigger_agentic_flow) could not be loaded. Please check backend logs for import errors."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Call the agentic flow generator
            generator = trigger_agentic_flow(trigger_event, file_path=temp_file_path, dashboard_call=1)
            
            steps = []
            
            def get_title(data, index):
                titles = [
                    "Event Pre-processing",
                    "Incident Orchestration",
                    "Intent Routing",
                    "Hypothesis Scoring",
                    "Situation Verification",
                    "Data Correlation Engine",
                    "Final RCA & Remedy"
                ]
                if index < len(titles):
                    return titles[index]
                return "Workflow Step"

            for idx, step_data in enumerate(generator):
                if isinstance(step_data, str):
                    try:
                        step_data = json.loads(step_data)
                    except json.JSONDecodeError:
                        step_data = {"raw_output": step_data}

                import copy
                steps.append({
                    "step": idx,
                    "title": get_title(step_data, idx),
                    "data": copy.deepcopy(step_data) if isinstance(step_data, dict) else step_data
                })

            if not steps:
                return Response({"error": "RCA Pipeline executed but returned no steps. This happens if the Excel data doesn't match the device or is missing sheets."}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                "message": "RCA Pipeline executed successfully.",
                "steps": steps
            }, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Error running RCA flow: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            try:
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
            except Exception:
                pass


class RunRAGAnalysisView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            payload = data.get('payload', {})
            raw_logs = payload.get('raw_logs', [])
            root_event = payload.get('root_event', {})
            metrics_payload = payload.get('metrics_payload', {})
            topology = payload.get('topology', {})

            if not run_full_pipeline:
                return Response({"error": "RAG Pipeline module not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Change CWD to RAG_DIR so it can find KB file
            old_cwd = os.getcwd()
            os.chdir(RAG_DIR)
            
            try:
                raw_output = run_full_pipeline(raw_logs, root_event, metrics_payload, topology)
            finally:
                os.chdir(old_cwd)

            # --- Normalize results to match the terminal formatted output ---
            raw_results = raw_output.get('results', [])
            scores = [r.get('final_score', 0) for r in raw_results]
            max_score = max(scores) if scores else 0
            min_score = min(scores) if scores else 0
            score_range = max(0.01, max_score - min_score)

            ui_results = []
            for rank, r in enumerate(raw_results[:3]):
                # Unpack doc — reranker wraps it in {doc: {raw: ...}}
                if isinstance(r.get('doc'), dict) and 'raw' in r['doc']:
                    doc = r['doc']['raw']
                else:
                    doc = r.get('doc', {})

                final_score = r.get('final_score', 0)
                confidence_pct = min(
                    95.0,
                    round((final_score - min_score) / score_range * 100, 1)
                )

                # Build relevant logs using log_features from the result
                log_features = r.get('log_features', [])
                kb_title = doc.get('title', '')
                kb_desc = doc.get('description', '')
                kb_rca = doc.get('root_cause_analysis', '')
                kb_text = ' '.join(filter(None, [kb_title, kb_desc, kb_rca]))

                formatted_logs = []
                if log_features and kb_text.strip():
                    # Score each log template against the KB doc using simple keyword overlap
                    kb_words = set(kb_text.lower().split())
                    for log in log_features:
                        template = log.get('template', '') or log.get('sample', '')
                        sample = log.get('sample', template)
                        if not template:
                            continue
                        log_words = set(template.lower().split())
                        overlap = len(kb_words & log_words)
                        score = round(overlap / max(len(log_words), 1) * 0.6 + log.get('score', 0) * 0.4, 3)
                        formatted_logs.append({
                            'template': template,
                            'sample': sample,
                            'score': score
                        })
                    formatted_logs.sort(key=lambda x: x['score'], reverse=True)
                    formatted_logs = formatted_logs[:3]

                ui_results.append({
                    'rank': rank + 1,
                    'title': doc.get('title', doc.get('description', 'N/A')),
                    'rca_id': doc.get('rca_id', 'N/A'),
                    'confidence': confidence_pct,
                    'relevant_logs': formatted_logs,
                    'root_cause_analysis': doc.get('root_cause_analysis', ''),
                })

            response = {
                'total_results': len(ui_results),
                'results': ui_results,
                # Raw search results for Retrieval + Reranking stage visualizations
                'search_results': [
                    {
                        'doc': r.get('doc'),  # keeps nested {raw: ...} for UI to read doc.raw.title
                        'hybrid_score': round(r.get('prerank_score', 0), 4),
                        'cross_encoder_score': round(r.get('cross_encoder_score', 0), 4),
                        'final_score': round(r.get('final_score', 0), 4),
                        'title': r.get('doc', {}).get('raw', {}).get('title', 'N/A') if isinstance(r.get('doc'), dict) else 'N/A',
                        'rca_id': r.get('doc', {}).get('raw', {}).get('rca_id', 'N/A') if isinstance(r.get('doc'), dict) else 'N/A',
                    }
                    for r in raw_results
                ],
                # Pass through intermediate stage data for the UI walkthrough
                'query': raw_output.get('query', {}),
                'anomalies': raw_output.get('anomalies', []),
                'metric_facts': raw_output.get('query', {}).get('metric_facts', []),
                'templates': raw_output.get('templates', []),
                'log_features': raw_output.get('query', {}).get('log_features', []),
                'entities': raw_output.get('entities', {}),
                'build_ms': raw_output.get('query', {}).get('build_ms', 0),
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": f"Error running RAG analysis: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RAGKBView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        try:
            if not os.path.exists(RAG_KB_PATH):
                return Response([], status=status.HTTP_200_OK)
            with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        new_entry = request.data
        if not os.path.exists(RAG_KB_PATH):
            data = []
        else:
            with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
        
        doc_id = new_entry.get('_id') or new_entry.get('doc_id')
        if any(e.get('_id') == doc_id or e.get('doc_id') == doc_id for e in data):
            return Response({"error": "Entry with this ID already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        data.append(new_entry)
        with open(RAG_KB_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        return Response(new_entry, status=status.HTTP_201_CREATED)

    def put(self, request):
        updated_entry = request.data
        doc_id = updated_entry.get('_id') or updated_entry.get('doc_id')
        if not doc_id:
            return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)

        with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        found = False
        for i, entry in enumerate(data):
            if entry.get('_id') == doc_id or entry.get('doc_id') == doc_id:
                data[i] = updated_entry
                found = True
                break
        
        if not found:
            return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

        with open(RAG_KB_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        return Response(updated_entry, status=status.HTTP_200_OK)

    def delete(self, request):
        doc_id = request.query_params.get('id')
        if not doc_id:
            return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)

        with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        new_data = [e for e in data if e.get('_id') != doc_id and e.get('doc_id') != doc_id]
        
        if len(new_data) == len(data):
            return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

        with open(RAG_KB_PATH, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, indent=4)
        return Response({"status": "deleted"}, status=status.HTTP_200_OK)

