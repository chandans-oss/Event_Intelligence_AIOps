import os
import json
import tempfile
import pandas as pd
import copy
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import sys

# Ensure the parent directory is in the path to import from rca_source_backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RCA_BACKEND_DIR = os.path.join(BASE_DIR, 'rca_source_backend')
sys.path.append(RCA_BACKEND_DIR)
sys.path.append(os.path.join(RCA_BACKEND_DIR, 'agentic_engine'))
sys.path.append(os.path.join(RCA_BACKEND_DIR, 'config'))

try:
    from rca_source_backend.agentic_engine.trigger_agentic_flow import trigger_agentic_flow
except ImportError:
    try:
        from trigger_agentic_flow import trigger_agentic_flow
    except ImportError:
        pass  # Will handle in view if missing


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

            # Call the agentic flow generator
            generator = trigger_agentic_flow(trigger_event, file_path=temp_file_path, dashboard_call=1)
            
            steps = []
            step_count = 1
            
            def get_title(data, index):
                titles = [
                    "Event Pre-processing",
                    "Incident Orchestration",
                    "Intent Routing",
                    "Hypothesis Scoring",
                    "Situation Verification",
                    # "Planner Execution",
                    "Data Correlation Engine",
                    "Final RCA & Remedy"
                ]
                if index < len(titles):
                    return titles[index]
                return "Workflow Step"

            for idx, step_data in enumerate(generator):
                # Ensure step_data is a dict (Unified in trigger_agentic_flow)
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

