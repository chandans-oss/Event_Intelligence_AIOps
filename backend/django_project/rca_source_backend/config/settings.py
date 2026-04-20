from pathlib import Path

# Configuration
REQUIRED_SHEETS = {
    "Metrics": True,
    "Events": True,
    "Syslog": True,
    "SNMP_Traps": False,
    "Config_Changes": False,
    "Inventory": False,
    "Netflow": False,
    "NMS_Trigger_Events": True
}

OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "hf.co/unsloth/Qwen3-0.6B-GGUF:Q6_K"

# Resolve paths relative to the current script location (or project root)
BASE_DIR = Path(__file__).resolve().parent.parent 

INTENT_YAML_PATH = BASE_DIR / "templates" / "intents.yml"
SITUATION_YAML_PATH = BASE_DIR / "templates" / "situation_template.yml"
UPLOAD_FOLDER_PATH = BASE_DIR / "uploads"

STEPS = [
            # STEP 0 – Incident Detection & Goal Formation
            {
                "title": "Step 0: Event Pre-processing / Correlation",
                "icon": "🚨",
                "sub":"• Event Deduplication / Suppression / Normalization.  <br>• Event Correlation.",
                "data": {

                },
                "tl_title": "Event Pre-processing / Correlation",
                "tl_desc": "",
                "mini": "Event Pre-processing / Correlation process completed.",
            },

            # STEP 1 – Telemetry Correlation & KPI Summary
            {
                "title": "Step 1: Orchestration",
                "icon": "📊",
                "sub": "• Incident Creation. <br> • Goal Creation.",
                "data": {
                    "Incident ID": "",
                    "Device": "",
                    "Interface": "",
                    "Correlation Window": "",
                    "Trigger Event": "",
                    "Logs and Trap": "",
                    "Initial Severity": "",
                    "Goal": "",
                    "KPIs": {},
                },
                "tl_title": "Orchestration",
                "tl_desc": "Incident & Goal created",
                "mini": "Orchestration process completed.",
            },

            # STEP 2 – Intent Routing & Template Selection
            {
                "title": "Step 2: Intent Routing",
                "icon": "🎯",
                "sub": "• Identify Intent.",
                "data": {
                    "Selected Intent": "",
                    "Intent Status": "",
                    "Intent Score": "",
                    "Top 3 Intents": "",
                    #"Rule Match Heat": "", As mentioned to keep it single line
                    "Key Matches": "",
                },
                "tl_title": "Intent Routing",
                "tl_desc": "",
                "mini": "Intent Router process completed.",
            },

            # STEP 3 – Hypothesis Prior Scoring
            {
                "title": "Step 3: Hypothesis Scoring",
                "icon": "🔍",
                "sub": "• Identify possible hypothesis.",
                "data": {
                    "Slected Intent": "",
                    "Top Hypothesis": "",
                    "Hypothesis Scores": "",
                    "Log Evidence": "",
                },
                "tl_title": "Hypotheses Scorer",
                "tl_desc": "",
                "mini": "Hypothesis Scorer process completed.",
            },

            # STEP 4 – Situation Card Generation
            {
                "title": "Step 4: Situation Card Generation",
                "icon": "📋",
                "sub": "• Create Situation Card <br>• Dump to current vector DB.",
                "data": {
                    "Situation ID": "",
                    "Summary": "",
                    "Tags": "",
                    "Input Data": "",
                    "Embedding": "Vector representation stored for similarity search",
                },
                "tl_title": "Situation Builder",
                "tl_desc": "",
                "mini": "Situation Builder process completed.",
            },

            # STEP 5 – Diagnostic Planner LLM
            {
                "title": "Step 5: Planner LLM",
                "icon": "🧠",
                "sub": "• Plans Tools for execution.",
                "data": {
                    "Plan ID": "",
                    "Tools": "",
                    "Plan Steps": {},
                    "Stop Condition": "",
                },
                "tl_title": "Planner LLM",
                "tl_desc": "",
                "mini": "Planner LLM process completed",
            },

            # STEP 6 – Historical Similarity Retrieval
            {
                "title": "Step 6: Data Correlation Engine",
                "icon": "📚",
                "sub": " • Fetches Data from system (Base on PlannerLLM reccomendations). <br>• Updates latest values in current vector DB. <br>• And Retrives similar historical cases from vector DB.",
                "data": {
                    "Query": "",
                    "Top Match": "",
                    "Retrieved Cases": "",
                    "Confidence Boost": "",
                },
                "tl_title": "Data Correlation Engine",
                "tl_desc": "",
                "mini": "Data Correlation Engine process completed.",
            },

            # STEP 7 – Correlator LLM (RCA Generation)
            {
                "title": "Step 7: RCA Correlator LLM",
                "icon": "🔗",
                "sub": "• Final RCA. <br>• Remedy.",
                "data": {
                    "Final RCA": "",
                    "RCA Confidence": "",
                    "Key Evidence": [],
                    "Proposed Remedy": "",
                },
                "tl_title": "RCA Correlator Engine",
                "tl_desc": "",
                "mini": "RCA Correlator Engine process completed.",
            },

            # # STEP 8 – Validator & Remediation Outcome
            # {
            #     "title": "Step 8: Remediation & Validation",
            #     "icon": "✅",
            #     "sub": "",
            #     "data": {
            #         "Action Taken": "",
            #         "Validation KPIs": "",
            #         "Remediation Status": "",
            #     },
            #     "tl_title": "Remediation",
            #     "tl_desc": "",
            #     "mini": "",
            # },

            # # STEP 9 – Reflector / Memory Agent
            # {
            #     "title": "Step 9: Knowledge Update",
            #     "icon": "💾",
            #     "sub": "Case stored in historical knowledge base for future pattern matching.",
            #     "data": {
            #         "Stored Case ID": "",
            #         "Learning Confidence": "",
            #         "Knowledge Captured": "",
            #         "Future Impact": "",
            #         "Vector Update": "",
            #     },
            #     "tl_title": "Knowledge",
            #     "tl_desc": "",
            #     "mini": "Case stored in knowledge base with high confidence for future reuse.",
            #     "final": True,
            # },
        
        ]
KPI_MAP = {"utilization_percent": ("Bandwidth Utilization","%"), 
            "cpu_percent": ("CPU Utilization","%"),
            "mem_percent": ("Memory Utilization","%"),
            "temp_c": ("Device Temperature"," ℃"),
            "latency_ms": ("Latency"," ms"),
            "packet_loss_percent": ("Packet Loss","%"),
            "traffic_dscp0_percent": ("DSCP0 Traffic","%"),
			"in_errors": ("Input Errors", " pkts"),
			"out_discards": ("Output Errors", " pkts"),
            "fan_speed": ("Fan Speed", " rpm"),
            "power_watt": ("Power Supply"," watt")}