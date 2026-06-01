import os
import json
import re
import tempfile
import pandas as pd
import copy
from django.http import JsonResponse
from adrf.views import APIView
from asgiref.sync import sync_to_async
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
RAG_KB_PATH = Path(r"D:\new_event_AIOps\Event_Intelligence_AIOps\network_rca_v5_hierarchy 2.json")
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

    async def post(self, request, *args, **kwargs):
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

        def read_excel_file():
            try:
                df = pd.read_excel(temp_file_path, "NMS_Trigger_Events")
            except ValueError:
                df = pd.read_excel(temp_file_path, "Events")
            return df

        try:
            # Extract trigger event from the "NMS_Trigger_Events" sheet
            events_df = await sync_to_async(read_excel_file, thread_sensitive=False)()

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
            generator = await sync_to_async(trigger_agentic_flow, thread_sensitive=False)(trigger_event, file_path=temp_file_path, dashboard_call=1)
            
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
    async def post(self, request, *args, **kwargs):
        try:
            data = request.data
            payload = data.get('payload', {})
            raw_logs = payload.get('raw_logs', [])
            root_event = payload.get('root_event', {})
            metrics_payload = payload.get('metrics_payload', {})
            topology = payload.get('topology', {})

            if not run_full_pipeline:
                return Response({"error": "RAG Pipeline module not found."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            def run_pipeline():
                old_cwd = os.getcwd()
                os.chdir(RAG_DIR)
                try:
                    return run_full_pipeline(raw_logs, root_event, metrics_payload, topology)
                finally:
                    os.chdir(old_cwd)

            raw_output = await sync_to_async(run_pipeline, thread_sensitive=False)()

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
    
    async def get(self, request):
        try:
            def read_kb():
                if not os.path.exists(RAG_KB_PATH):
                    return []
                with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
                    return json.load(f)
            data = await sync_to_async(read_kb, thread_sensitive=False)()
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    async def post(self, request):
        new_entry = request.data
        def read_kb():
            if not os.path.exists(RAG_KB_PATH):
                return []
            with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        data = await sync_to_async(read_kb, thread_sensitive=False)()
        
        doc_id = new_entry.get('_id') or new_entry.get('doc_id')
        if any(e.get('_id') == doc_id or e.get('doc_id') == doc_id for e in data):
            return Response({"error": "Entry with this ID already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
        data.append(new_entry)
        def write_kb(dt):
            with open(RAG_KB_PATH, 'w', encoding='utf-8') as f:
                json.dump(dt, f, indent=4)
        await sync_to_async(write_kb, thread_sensitive=False)(data)
        return Response(new_entry, status=status.HTTP_201_CREATED)

    async def put(self, request):
        updated_entry = request.data
        doc_id = updated_entry.get('_id') or updated_entry.get('doc_id')
        if not doc_id:
            return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)

        def read_kb():
            with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        data = await sync_to_async(read_kb, thread_sensitive=False)()

        found = False
        for i, entry in enumerate(data):
            if entry.get('_id') == doc_id or entry.get('doc_id') == doc_id:
                data[i] = updated_entry
                found = True
                break
        
        if not found:
            return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

        def write_kb(dt):
            with open(RAG_KB_PATH, 'w', encoding='utf-8') as f:
                json.dump(dt, f, indent=4)
        await sync_to_async(write_kb, thread_sensitive=False)(data)
        return Response(updated_entry, status=status.HTTP_200_OK)

    async def delete(self, request):
        doc_id = request.query_params.get('id')
        if not doc_id:
            return Response({"error": "No ID provided"}, status=status.HTTP_400_BAD_REQUEST)

        def read_kb():
            with open(RAG_KB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        data = await sync_to_async(read_kb, thread_sensitive=False)()

        new_data = [e for e in data if e.get('_id') != doc_id and e.get('doc_id') != doc_id]
        
        if len(new_data) == len(data):
            return Response({"error": "Entry not found"}, status=status.HTTP_404_NOT_FOUND)

        def write_kb(dt):
            with open(RAG_KB_PATH, 'w', encoding='utf-8') as f:
                json.dump(dt, f, indent=4)
        await sync_to_async(write_kb, thread_sensitive=False)(new_data)
        return Response({"status": "deleted"}, status=status.HTTP_200_OK)


# --- RAG v6 Pipeline ---

# The models are stored in HuggingFace cache format under backend/rag/models
# Set HF_HOME before importing sentence-transformers so it finds the local cache
LOCAL_MODEL_CACHE = str(BACKEND_ROOT / "rag" / "models")
os.environ.setdefault("HF_HOME", LOCAL_MODEL_CACHE)
os.environ.setdefault("TRANSFORMERS_CACHE", LOCAL_MODEL_CACHE)
os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", LOCAL_MODEL_CACHE)

# Inject root directory for ierag6_rca_pgvector
ROOT_DIR = BACKEND_ROOT.parent
sys.path.insert(0, str(ROOT_DIR))

try:
    # Attempt to load the v6 script
    import ierag6_rca_pgvector
    
    def _patch_config():
        assert ierag6_rca_pgvector is not None, "ierag6_rca_pgvector must be loaded"
        from pathlib import Path
        cfg  = ierag6_rca_pgvector.Config()
        rcfg = ierag6_rca_pgvector.RemedyConfig()
        
        # Override KB path to the user's provided KB
        cfg.KB_PATH  = Path(r"D:\new_event_AIOps\Event_Intelligence_AIOps\network_rca_v5_hierarchy 2.json")
        rcfg.REMEDY_BASE = Path(r"D:\new_event_AIOps\Event_Intelligence_AIOps\src\data\remedy")
        
        # Models are stored as HF cache — use the HF repo IDs.
        # HF_HOME is already pointed at backend/rag/models so no download occurs.
        cfg.EMBEDDING_MODEL  = "BAAI/bge-base-en-v1.5"
        rcfg.EMBEDDING_MODEL = "BAAI/bge-base-en-v1.5"
        cfg.RERANKER_MODEL   = "BAAI/bge-reranker-base"
        rcfg.RERANKER_MODEL  = "BAAI/bge-reranker-base"

        return cfg, rcfg

    # Lazy-loaded singletons
    _pipeline        = None
    _remedy_pipeline = None

    def get_v6_pipelines():
        global _pipeline, _remedy_pipeline
        assert ierag6_rca_pgvector is not None, "ierag6_rca_pgvector must be loaded"
        if _pipeline is None:
            cfg, rcfg    = _patch_config()
            try:
                _pipeline        = ierag6_rca_pgvector.RCAPipeline(config=cfg)
                _remedy_pipeline = ierag6_rca_pgvector.RemedyPipeline(config=rcfg)
            except Exception as db_err:
                # Reset so next request retries rather than reusing a broken singleton
                _pipeline        = None
                _remedy_pipeline = None
                raise db_err
        return _pipeline, _remedy_pipeline

except ImportError as e:
    ierag6_rca_pgvector = None
    print(f"Failed to import ierag6_rca_pgvector: {e}")


class RunRAGV6AnalysisView(APIView):
    async def post(self, request, *args, **kwargs):
        if not ierag6_rca_pgvector:
            return Response({"error": "ierag6_rca_pgvector module not found or failed to load."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            data        = request.data
            payload     = data.get('payload', {})
            run_config  = data.get('run_config', {})   # ← per-request config flags from UI

            raw_logs        = payload.get('raw_logs', [])
            root_event      = payload.get('root_event', {})
            metrics_payload = payload.get('metrics_payload', {})
            topology        = payload.get('topology', {})

            def run_v6_pipeline():
                old_cwd = os.getcwd()
                os.chdir(ROOT_DIR)
                try:
                    try:
                        pipeline, remedy_pipeline = get_v6_pipelines()
                    except Exception as db_err:
                        err_msg = str(db_err)
                        # Detect common DB unavailability patterns
                        recovery_hints = [
                            'recovery mode',
                            'connection refused',
                            'could not connect',
                            'OperationalError',
                            'timeout expired',
                            'server closed the connection',
                        ]
                        if any(hint.lower() in err_msg.lower() for hint in recovery_hints):
                            raise RuntimeError(
                                f"DATABASE_UNAVAILABLE: Cannot connect to PostgreSQL at "
                                f"{db_err.__class__.__name__}: {err_msg}"
                            )
                        raise

                    # Apply per-request config overrides on the shared pipeline config
                    # (safe because the actual model/db objects are reused; only flags change)
                    cfg = pipeline.config
                    cfg.USE_LLM_QUERY_BUILDER = bool(run_config.get('use_llm_rca', False))
                    cfg.USE_ENHANCED_QUERY_BUILDER = bool(run_config.get('use_enhanced', False))
                    cfg.RETRIEVE_K = int(run_config.get('retrieve_k', cfg.RETRIEVE_K))
                    cfg.RERANK_K   = int(run_config.get('rerank_k',   cfg.RERANK_K))
                    cfg.TOP_K      = int(run_config.get('top_k',      cfg.TOP_K))
                    cfg.RCA_CONFIDENCE_THRESHOLD = float(run_config.get('rca_confidence_threshold', cfg.RCA_CONFIDENCE_THRESHOLD))
                    cfg.RUN_RERANK_SEARCH = bool(run_config.get('run_rerank_search', cfg.RUN_RERANK_SEARCH))
                    cfg.RUN_NORMAL_HYBRID_SEARCH = bool(run_config.get('run_normal_hybrid_search', cfg.RUN_NORMAL_HYBRID_SEARCH))
                    cfg.LLM_TEMPERATURE = float(run_config.get('llm_temperature', cfg.LLM_TEMPERATURE))
                    cfg.LLM_MAX_TOKENS = int(run_config.get('llm_max_tokens', cfg.LLM_MAX_TOKENS))
                    cfg.CUSTOM_PROMPT = run_config.get('llm_custom_prompt', cfg.CUSTOM_PROMPT)
                    
                    # Also apply the LLM toggle to the remedy pipeline so it doesn't take 300+ seconds
                    remedy_pipeline.config.USE_LLM_QUERY_REMEDY_BUILDER = bool(run_config.get('use_llm_remedy', True))
                    remedy_pipeline.config.LLM_TEMPERATURE = float(run_config.get('llm_temperature', remedy_pipeline.config.LLM_TEMPERATURE))
                    remedy_pipeline.config.LLM_MAX_TOKENS = int(run_config.get('llm_max_tokens', remedy_pipeline.config.LLM_MAX_TOKENS))
                    remedy_pipeline.config.CUSTOM_PROMPT = run_config.get('llm_remedy_custom_prompt', remedy_pipeline.config.CUSTOM_PROMPT)

                    # Run RCA pipeline
                    pipeline_output = pipeline.run(raw_logs, root_event, metrics_payload, topology)

                    # Run remedy pipeline if we have RCA results
                    if pipeline_output and pipeline_output.get("rca_results"):
                        entities_obj = pipeline._run_ner(raw_logs)
                        remedy_result = remedy_pipeline.find(
                            pipeline_output["rca_results"],
                            root_event,
                            entities_obj.__dict__,
                            device_details=None,
                        )
                        pipeline_output["remedy_results"] = remedy_result

                    # Build final structured response
                    ui_response: dict = pipeline.build_response(pipeline_output, root_event) if pipeline_output else {"error": "Pipeline returned empty"}

                    if pipeline_output and "error" not in ui_response:
                        query_data = pipeline_output.get("query")
                        if not isinstance(query_data, dict):
                            query_data = {}
                            
                        entities_data = pipeline_output.get("entities", {})
                        import dataclasses
                        if dataclasses.is_dataclass(entities_data) and not isinstance(entities_data, type):
                            entities_data = dataclasses.asdict(entities_data)
                        elif hasattr(entities_data, "__dict__"):
                            entities_data = entities_data.__dict__

                        rca_list = pipeline_output.get("rca_results", [])
                        if not isinstance(rca_list, list):
                            rca_list = []
                            
                        ui_response.update({
                            "query": query_data,
                            "anomalies": pipeline_output.get("anomalies", []),
                            "templates": pipeline_output.get("templates", []),
                            "entities": entities_data,
                            "log_features": query_data.get("log_features", []),
                            "metric_facts": query_data.get("metric_facts", []),
                            "build_ms": query_data.get("build_ms", 0),
                            "llm_usage": query_data.get("llm_usage", {}),
                            
                            # Add raw search_results for the Hybrid Retrieval UI
                            "search_results": [
                                {
                                    "doc": r.get("doc"),
                                    "hybrid_score": round(r.get("prerank_score", 0), 4),
                                    "cross_encoder_score": round(r.get("cross_encoder_score", 0), 4) if r.get("cross_encoder_score") is not None else 0,
                                    "final_score": round(r.get("final_score", 0), 4),
                                    "title": r.get("doc", {}).get("raw", {}).get("title", "N/A") if isinstance(r.get("doc"), dict) else r.get("doc", {}).get("title", "N/A") if isinstance(r.get("doc"), dict) else "N/A",
                                    "rca_id": r.get("doc", {}).get("raw", {}).get("rca_id", "N/A") if isinstance(r.get("doc"), dict) else r.get("doc", {}).get("rca_id", "N/A") if isinstance(r.get("doc"), dict) else "N/A",
                                }
                                for r in rca_list if isinstance(r, dict)
                            ]
                        })
                    return ui_response
                finally:
                    os.chdir(old_cwd)
                    
            ui_response = await sync_to_async(run_v6_pipeline, thread_sensitive=False)()

            return Response(ui_response, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            err_str = str(e)
            # Surface DB unavailability as 503 Service Unavailable
            if 'DATABASE_UNAVAILABLE' in err_str or 'recovery mode' in err_str.lower():
                db_detail = err_str.replace('DATABASE_UNAVAILABLE: ', '')
                return Response(
                    {
                        "error": "Database is currently unavailable.",
                        "detail": db_detail,
                        "hint": (
                            "The PostgreSQL server is in recovery/standby mode. "
                            "This typically means the primary DB has failed or the "
                            "replica has not finished syncing. Please wait and retry, "
                            "or contact your DB administrator."
                        )
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            return Response({"error": f"Error running RAG v6 analysis: {err_str}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


