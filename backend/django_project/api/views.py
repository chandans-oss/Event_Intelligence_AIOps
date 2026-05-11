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
    from ierag5_refactored import run_full_pipeline
except ImportError:
    try:
        from ierag2_refactored import run_full_pipeline
    except ImportError:
        run_full_pipeline = None

try:
    # After adding __init__.py, this direct search should be more reliable
    from trigger_agentic_flow import trigger_agentic_flow
except ImportError:
    try:
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
            
            # Prepare and Run Analysis
            try:
                # The pipeline resources will be initialized once on the first call
                # Execute the pipeline with user-provided payload
                results = run_full_pipeline(raw_logs, root_event, metrics_payload, topology)
            finally:
                os.chdir(old_cwd)

            return Response(results, status=status.HTTP_200_OK)

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

