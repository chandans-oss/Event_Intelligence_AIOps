import streamlit as st
import time, openpyxl
import html as ht
import pandas as pd
import yaml, os, operator, json
from datetime import datetime
from copy import deepcopy
from streamlit.components.v1 import html
from settings import REQUIRED_SHEETS, UPLOAD_FOLDER_PATH, STEPS, KPI_MAP
from utils.trigger_agentic_flow import trigger_agentic_flow


# ---------- 1. PAGE CONFIG ----------
st.set_page_config(page_title="AIOps Flow", layout="wide")

# ---------- 2. CSS ----------
st.markdown("""
<style>
    .main {background:#f9fafc;}

    /* TIMELINE BAR */
    .tl {
        display:flex; align-items:center; overflow-x:auto; padding:20px 24px;
        background:#ffffff; border-radius:16px;
        box-shadow:0 4px 15px rgba(15,23,42,.08);
        margin-bottom:30px; gap:12px; flex-wrap:nowrap;
    }
    .tl-box {
        background:#ffffff;
        border:2px solid #94a3b8;
        border-radius:12px;
        padding:10px 16px;
        min-width:170px;
        text-align:center;
        font-weight:600;
        color:#1e293b;
        animation:popIn .4s ease;
        white-space:normal;
        word-wrap:break-word;
        box-shadow:0 2px 6px rgba(15,23,42,.06);
    }
    .tl-box small {
        font-weight:400;
        font-size:0.78rem;
        color:#64748b;
        display:block;
        margin-top:4px;
    }
    .tl-box.done {
        border-color:#10b981;
        color:#065f46;
        background:linear-gradient(135deg,#ecfdf5,#d1fae5);
    }
    .tl-box.current {
        border-color:#3b82f6;
        box-shadow:0 0 0 3px rgba(59,130,246,.25);
    }

    .tl-line {
        width:40px;
        height:2px;
        background:#94a3b8;
        border-radius:999px;
    }
    .tl-line.done {
        background:#10b981;
    }

    /* MAIN CARD */
    .card {
        background:linear-gradient(135deg,#ffffff,#f5f8ff);
        border-left:6px solid #4361ee;
        border-radius:18px;
        padding:24px 26px;
        box-shadow:0 10px 30px rgba(15,23,42,.12);
        animation:fadeInUp .5s ease forwards;
        margin-bottom:14px;
        opacity:0; transform:translateY(10px);
    }
    .card.final {
        border-left-color:#22c55e;
    }
    .card.loading {
        background:#fffbeb;
        border-left-color:#f59e0b;
        color:#92400e;
    }

    .step-title {
        font-size:1.25rem;
        font-weight:700;
        color:#0f172a;
        display:flex;
        align-items:center;
        gap:10px;
        margin-bottom:12px;
    }
    .step-badge {
        font-size:0.80rem;
        padding:3px 8px;
        border-radius:999px;
        background:#e0f2fe;
        color:#0369a1;
        font-weight:600;
    }
    .step-sub {
        font-size:0.88rem;
        color:#64748b;
        margin-bottom:16px;
    }

    /* GRID DATA */
    .grid {
        display:grid;
        grid-template-columns:max-content 1fr;
        gap:8px 14px;
        font-size:.95rem;
    }
    .k {
        color:#475569;
        font-weight:600;
        min-width:170px;
    }
    .v {
        color:#0f172a;
        font-family:'Courier New',monospace;
        background:#eef2ff;
        padding:4px 9px;
        border-radius:6px;
        font-weight:500;
        word-wrap:break-word;
    }

    /* MINI COMPLETION CARD */
    .mini {
        background:linear-gradient(135deg,#ecfdf5,#d1fae5);
        border-left:5px solid #10b981;
        border-radius:12px;
        padding:10px 14px;
        font-size:.94rem;
        font-weight:500;
        color:#065f46;
        display:flex;
        align-items:center;
        gap:8px;
        animation:slideIn .4s ease;
        box-shadow:0 4px 12px rgba(16,185,129,.12);
        margin-bottom:6px;
    }

    /* MATCHED CONDITIONS (rule heat) */
    .rule-pill {
        font-size:0.78rem;
        padding:3px 6px;
        border-radius:999px;
        display:inline-block;
        margin:1px 4px 1px 0;
    }
    .rule-hit {
        background:#dcfce7;
        color:#166534;
        border:1px solid #22c55e;
    }
    .rule-miss {
        background:#f1f5f9;
        color:#64748b;
        border:1px dashed #cbd5f5;
    }

    @keyframes popIn {from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
    @keyframes fadeInUp{to{opacity:1;transform:translateY(0)}}
    @keyframes slideIn {from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}

    html { scroll-behavior: smooth; }
</style>
""", unsafe_allow_html=True)

# ---------- 3. TITLE ----------
st.markdown("### AI-Driven Root Cause Analysis")
st.markdown("<div id='top-of-page'></div>", unsafe_allow_html=True)

# ---------- 4. SESSION SAFE INDEX ----------
if "active_step_index" not in st.session_state:
    st.session_state.active_step_index = 0

# ---------- SIDEBAR ----------
with st.sidebar:
    st.header("Controls")
    uploaded_excel = st.file_uploader("Upload Event Details.", type=["xlsx"],help="Select an Excel file in .xlsx format")

    if st.button("Restart Flow", use_container_width=True, type="secondary"):
        for k in list(st.session_state.keys()):
            if k not in ["uploaded_excel"]:
                del st.session_state[k]
        st.rerun()

    if uploaded_excel is not None:
        os.makedirs("uploads", exist_ok=True)
        dest_path = os.path.join("uploads", uploaded_excel.name)
        total = uploaded_excel.size  
        written = 0
        progress = st.progress(0)
        status = st.empty()
        with open(dest_path, "wb") as f:
            while True:
                chunk = uploaded_excel.read(4096)
                if not chunk:
                    break
                f.write(chunk)
                written += len(chunk)
                pct = int(written / total * 100)
                progress.progress(pct)
                status.text(f"{written}/{total} bytes ({pct}%)")
        st.toast(f"✅ File Saved Successfully")

INTENT_MIN_NORM_SCORE = 0.4  # thresholding

def dict_to_html_table(d):
    rows = "".join(
        f"<tr><td>{k}</td><td>{v}</td></tr>"
        for k, v in d.items()
    )
    return f"""
    <table border="1" style="border-collapse:collapse;">
        <tr><th>Metric</th><th>Value</th></tr>
        {rows}
    </table>
    """

def dict_of_dicts_to_html(data):
    """
    Converts a dictionary of dictionaries (device: metrics) into a series 
    of HTML tables, one for each device.
    
    Args:
        data (dict): A dictionary where keys are device names (str) 
                     and values are metric dictionaries (dict).
                     
    Returns:
        str: A single string containing all generated HTML tables.
    """
    
    table_html = []
    for device_name, metrics_dict in data.items():
        # 1. Create the rows for the inner metrics table
        rows = "".join(f"<tr><td>{KPI_MAP.get(k, (k,''))[0]}</td><td>{v}{KPI_MAP.get(k, (k,''))[1]}</td></tr>" for k, v in metrics_dict.items())
        
        # 2. Assemble the full table for the current device
        table_html.append(f'<h5>Device: {device_name}</h5><table border="1" style="border-collapse:collapse; width: 50%;"><tr><th style="background-color:#f2f2f2;">Metric</th><th style="background-color:#f2f2f2;">Value</th></tr>{rows}</table><br/>')
    final_html = f'<div class="metrics-container">{"".join(table_html)}</div>'
    return final_html


def validate_data_format(workbook):
    try:
        sheet_headers_validations = {
            "Metrics": ["timestamp", "device","res_type", "res_name", "cpu_percent", "mem_percent", "temp_c", "avail_percent", "utilization_percent", "in_errors", "out_discards", "latency_ms", "packet_loss_percent","traffic_dscp0_percent", "fan_speed", "power_watt"],
            "Events": ["timestamp","device","resource_name","resource_type","event_type","severity","event_msg"],
            "Syslog": ["timestamp", "device", "res_name", "severity","message"],
            "SNMP_Traps": ["timestamp","device","res_name","trap_type","severity","description"],
            # "Netflow": ["timestamp","src_ip","dst_ip","bytes","packets","application"],
        }

        for sheet, required in REQUIRED_SHEETS.items():
            if required:
                df = pd.DataFrame(workbook[sheet].values)
                df.columns = df.iloc[0]
                df = df[1:]
                missing_cols = [col for col in sheet_headers_validations.get(sheet, []) if col not in df.columns]
                if missing_cols:
                    raise ValueError(f"Sheet '{sheet}' is missing required columns: {', '.join(missing_cols)}")
        
        st.toast("✅ File format validated successfully.")
    except Exception as e:
        st.error(f"Encountered error while validating columns in sheet | error {e}")

def validate_required_sheets(uploaded_excel):
    try:
        wb = openpyxl.load_workbook(uploaded_excel, data_only=True)
        sheet_names = wb.sheetnames
        missing_required_sheets = [s for s, req in REQUIRED_SHEETS.items() if req and s not in sheet_names]
        if missing_required_sheets:
            st.error(f"❌ Missing required sheets: {', '.join(missing_required_sheets)}")
            return False, None
        return True, wb
    except Exception as e:
        st.error(f"Encountered error while execution | error : {e}")
        return False, None


# ---------- 8. SESSION STATE DEFAULTS ----------
if "current_steps" not in st.session_state:
    st.session_state.current_steps = []
if "current_meta" not in st.session_state:
    st.session_state.current_meta = {}
if "flow_completed" not in st.session_state:
    st.session_state.flow_completed = False

def update_steps_details(steps, cur, data):
    try:
        
        if cur == 0:
            # update incident details and goal
            steps[cur]["data"] = {
                                }
            #steps[cur]["tl_desc"] = data.get("incident_id","")
            # commented as first step would be of correlating multiple events into structured alarm
        elif cur == 1:
            # update KPI's
            signals =  data.get("signals",{})
            steps[cur]["data"] = {
                                "Incident ID": data.get("incident_id",""),
                                "Device": data.get("device","N/A"),
                                "Interface": data.get("resource_name","N/A"),
                                "Correlation Window": f"Last 15 min from {data.get('timestamp')}",
                                "Trigger Event": data.get("logs")[0] if data.get("logs") else "",
                                "Logs and Trap" : "Logs and traps found in system during last 15 minutes" + ("<br>• " + "<br>• ".join(data["logs"][1:]) if len(data.get('logs',[])) > 0 else "No extra details found in system"),
                                "Initial Severity": "Critical",
                                "Goal": data.get("goal"),
                                # "KPI Window": f"Lastest within last 15 min from {data.get('timestamp')}",
                                "KPIs": dict_of_dicts_to_html(signals)
                            }
        elif cur == 2:
            best_intent, rest_all, matching_rules = data.get('intent_output')
            rest_all = sorted(rest_all, key=lambda x: x[1], reverse=True)

            intent_score = best_intent[1]
            # intent_score_pct = round(intent_score * 100, 2)
            intent_score_pct = intent_score
            best_intent_id = best_intent[0]

            steps[cur]["data"] = {
                "Selected Intent": best_intent_id,
                "Intent Status": (
                    f"Score: {intent_score_pct} 🟢 Strong match"
                    if intent_score > 0.85 else
                    f"Score: {intent_score_pct} 🟡 Medium match"
                    if intent_score > 0.65 else
                    f"Score: {intent_score_pct} 🔴 Weak match"
                ),
                # Top 3 as percentages
                "Top 3 Intents": ', '.join([
                    # f"{i[0]} ({round(min(max(i[1], 0), 1) * 100, 2)}%)"
                    f"{i[0]} ({min(max(i[1], 0), 1)})"
                    for i in rest_all[:3]
                ]),
                "Key Matches": (
                    "Signal Matches:<br>" +
                    " ".join([
                        f"<span class='rule-pill rule-hit'>{i}</span>"
                        for i in matching_rules.get(best_intent_id, {}).get("signals", [])
                    ]) +
                    "<br>Log Matches:<br>" +
                    ", ".join(matching_rules.get(best_intent_id, {}).get("keyword", []))
                )
            }

            steps[cur]["tl_desc"] = best_intent_id
            # steps[cur]['mini'] = f'Detected {best_intent_id} as best matching intent'
            steps[cur]['mini'] = "Intent Routing completed."

        elif cur == 3:
            top_hypothesis = data.get('top_hypothesis', {})
            hypotheses_list = data.get("hypotheses", [])

            # Normalize → percentage
            raw_top = top_hypothesis.get("total_score", 0)
            top_norm = min(max(raw_top, 0), 1)
            top_score_pct = round(top_norm * 100, 2)

            # All hypothesis scores
            all_hypothesis = {}
            for hyp in hypotheses_list:
                raw = hyp.get("total_score", 0)

                # --- Old percentage logic (kept for reference) ---
                # norm = min(max(raw, 0), 1)
                # pct = round(norm * 100, 2)
                # all_hypothesis[hyp.get("hypothesis_id")] = f"{pct}%"
                # -----------------------------------------------

                # Now store RAW score only
                all_hypothesis[hyp.get("hypothesis_id")] = raw


            # Log evidence formatting
            log_evidence = ""
            for hyp in hypotheses_list:
                if hyp.get("matched_logs"):
                    log_evidence += (
                        f"{hyp.get('hypothesis_id')}<br>• "
                        + "<br>• ".join(hyp.get("matched_logs"))
                        + "<br>"
                    )

            # Update UI step
            steps[cur]['data'] = {
                "Selected Intent": f"{data.get('intent','N/A')}",
                "Top Hypothesis": f"{top_hypothesis.get('description','')} (score: {top_score_pct}%)",
                "Hypothesis Scores": all_hypothesis,
                "Log Evidence": log_evidence,
            }

            steps[cur]["tl_desc"] = top_hypothesis.get("hypothesis_id")
            # steps[cur]['mini'] = f"{top_hypothesis.get('hypothesis_id')} is identified as primary hypothesis with high confidence."
            steps[cur]['mini'] = "Hypothesis scoring completed."
        elif cur == 4:
            situation_card = data.get("situation_card",{})
            metadata = situation_card.get("metadata")
            metadata.update({'logs':data.get('logs')})
            metadata = json.dumps(metadata,indent=2)
            steps[cur]['data'] = {
                    "Situation ID": situation_card.get('situation_id','N/A'),
                    "Summary": situation_card.get('situation_text','N/A'),
                    "Tags": "N/A",
                    "Input Data" : f'<pre><code id="{cur}" style="font-family: monospace; white-space: pre;">{ht.escape(metadata)}</code></pre>',
                    "Action Taken": "Situation dumped into Vector DB",
                } 
            steps[cur]["tl_desc"] = situation_card.get('situation_id','N/A')
        
            planner_output = data.get('plan',{})
            tools_used = [step.get('tool') for step in planner_output.get('steps')]
            steps[cur+1]['data'] = {
                                "Plan ID": planner_output.get('plan_id',"N/A"),
                                "Tools": ", ".join(tools_used),
                                "Plan Steps": f'<pre><code id="{cur}" style="font-family: monospace; white-space: pre;">{ht.escape(json.dumps(planner_output.get("steps",[]), indent=2))}</code></pre>',
                                "Stop Condition": planner_output.get("stop_when","N/A"),
                            }
            steps[cur+1]["tl_desc"] = "Planner LLM process completed"
        elif cur == 6:
            matched_historical_cases = data.get('historical', {}).get('retrieved_cases', [])

            retrieved_cases_list = []
            for case in matched_historical_cases:
                raw = case.get('sim_score', 0)
                norm = min(max(raw, 0), 1)           # normalize to 0–1
                pct = round(norm * 100, 2)           # convert to %

                retrieved_cases_list.append(
                    f"<b>Case ID:</b> {case.get('case_id')}<br>"
                    f"<b>Situation Summary:</b> {case.get('sit_summary')}<br>"
                    f"<b>Predicted RCA:</b> {case.get('rca')}<br>"
                    f"<b>Remedy:</b> {case.get('remedy')}<br>"
                    f"<b>Matching Score:</b> {pct}%"
                )

            steps[cur]['data'] = {
                "Query": data.get("situation_card", {}).get('situation_text', 'N/A'),
                "Top Match": matched_historical_cases[0].get('case_id', "N/A") if matched_historical_cases else 'N/A',
                "Retrieved Cases": "<hr>".join(retrieved_cases_list),
                "Confidence Boost": "+0.15"
            }

            steps[cur]['tl_desc'] = (
                "Few matching case found" if matched_historical_cases 
                else "No matching case found"
            )

            # steps[cur]['tl_desc'] = "Few matching case found" if matched_historical_cases else "No matching case found"
            steps[cur]['tl_desc'] = "Data Correlation Engine completed"
        elif cur == 7:
            correlator_llm_output = data.get('correlator_llm_output',{})
            steps[cur]['data'] = {
                                "Final RCA": correlator_llm_output.get('rca','No Prediction'),
                                "RCA Confidence": correlator_llm_output.get('confidence','N/A'),
                                "Key Evidence": [f"metric : {evidence.get('metric')} -> value : {evidence.get('value')}" for evidence in correlator_llm_output.get('evidence_used',[])],
                                "Proposed Remedy": [remedy.replace(';',"<br>• ") for remedy in correlator_llm_output.get('remedy',[])],
                                "Explanation" : correlator_llm_output.get('explanation')
                            }
            steps[cur]['tl_desc'] = "Correlator LLM process completed"
            steps[cur]['mini'] = "RCA Generated"
    except Exception as err:
        print(err)

# ---------- 9. RENDER HELPERS ----------
def render_timeline(current_idx: int, steps: list, done_indices: list):
    """Render top horizontal timeline with done/current/pending styles."""
    dr_html = "<div class='tl' id='timeline-container'>"
    for i, s in enumerate(steps):
        if i > 0:
            line_class = "tl-line done" if i <= len(done_indices) else "tl-line"
            dr_html += f"<div class='{line_class}'></div>"

        if i < len(done_indices):
            box = "tl-box done"
            desc = s["tl_desc"]
            box_id = f"tl-step-{i}"
        elif i == current_idx:
            box = "tl-box current"
            desc = s["tl_desc"]
            box_id = f"tl-current-{i}"
        else:
            box = "tl-box"
            box_id = f"tl-step-{i}"
            desc = "Pending..."

        dr_html += f"<div id='{box_id}' class='{box}'><div>{s['tl_title']}</div><small>{desc}</small></div>"
    dr_html += "</div>"
    st.markdown(dr_html, unsafe_allow_html=True)

    scroll_js = f"""
    <script>
    function scrollTimeline() {{
        const active = parent.document.getElementById("tl-current-{current_idx}");
        const container = parent.document.getElementById("timeline-container");

        if (!active || !container) {{
            setTimeout(scrollTimeline, 30);
            return;
        }}

        // Scroll so the active timeline box is centered
        const offsetLeft = active.offsetLeft - container.clientWidth / 2 + active.clientWidth / 2;
        container.scrollTo({{
            left: offsetLeft,
            behavior: "smooth"
        }});
    }}

    setTimeout(scrollTimeline, 60);
    </script>
    """
    html(scroll_js, height=0)

def render_card(step: dict, idx: int, is_latest=True):
    anchor_id = f"card-{idx}"

    # Add anchor BEFORE card
    st.markdown(f"<div id='{anchor_id}'></div>", unsafe_allow_html=True)

    st.markdown(
        f"<div class='card'>"
        f"<div class='step-title'>{step['icon']} {step['title']}</div>"
        f"<div class='step-sub'>{step.get('sub','')}</div>",
        unsafe_allow_html=True,
    )

    # Key/Value grid
    st.markdown("<div class='grid'>", unsafe_allow_html=True)
    for k, v in step["data"].items():
        if isinstance(v, list):
            v = "<br>• " + "<br>• ".join(v)
        st.markdown(f"<div class='k'>{k}</div><div class='v'>{v}</div>", unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # Show mini-card only for latest processed step
    if is_latest:
        st.markdown(f"<div class='mini'>✔ {step['mini']}</div>", unsafe_allow_html=True)

    st.markdown("</div>", unsafe_allow_html=True)


def run_animated_flow(steps: list, fetcher_obj):
    if not steps:
        st.warning("No steps to run.")
        return

    tl_placeholder = st.empty()
    card_holder = st.empty()
    done_indices = []

    loading_msgs = [
        "Event PreProcessing and Correlating…",
        "Orchestrator: Orchestrating and forming incident and goal… (Using LLM)",
        "Intent Router: Routing to possible intent…",
        "Hypothesis Scorer: Scoring hypotheses using metrics and logs…",
        "Situation Builder: Building semantic situation card…",
        "Planner LLM: Planning diagnostic steps for backup analysis… (Using LLM)",
        "Data Correlation Engine: Executes Plans, Dump to current, Fetch from history",
        "RCA Correlator Engine: Finalizing RCA (Using LLM)",
        "Applying QoS policy and validating…",
        "Storing resolved case in knowledge base…",
    ]

    # Create tabs for all steps
    tab_labels = [f"{steps[i]['tl_title']}" for i in range(len(steps))]
    tabs = st.tabs(tab_labels)

    for cur in range(len(steps)):
        # Update the timeline
        with tl_placeholder.container():
            render_timeline(cur, steps, done_indices)

        # Switch to active tab via JS
        switch_tab_js = f"""
        <script>
        const tabs = parent.document.querySelectorAll('button[data-baseweb="tab"]');
        if (tabs && tabs[{cur}]) {{
            tabs[{cur}].click();
            tabs[{cur}].scrollIntoView({{behavior:'smooth', block:'center'}});
        }}
        </script>
        """
        html(switch_tab_js, height=0)

        # Show yellow loading card
        lm_idx = min(cur, len(loading_msgs) - 1)
        with card_holder.container():
            st.markdown(
                f"<div class='card loading'>{loading_msgs[lm_idx]}</div>",
                unsafe_allow_html=True,
            )
        time.sleep(1)

        # Render card in the active tab
        with tabs[cur]:
            with st.spinner("Loading..."):
                data = next(fetcher_obj)
                time.sleep(0.7)
                if cur not in [5]:
                    update_steps_details(steps, cur, data)
                render_card(steps[cur], idx=cur)
                

        st.session_state.active_step_index += 1
        done_indices.append(cur)
        time.sleep(1)

        # if cur == 3:
        #     st.stop()

    # Final timeline
    with tl_placeholder.container():
        render_timeline(-1, steps, done_indices)

    card_holder.empty()
    st.session_state.flow_completed = True

# AUTO-START FLOW WHEN EXCEL IS UPLOADED & STEPS ARE READY
if uploaded_excel is not None and not st.session_state.get("flow_completed", False):
    # perform reuired sheet validation over uploaded excel
    status, wb = validate_required_sheets(uploaded_excel)
    if status == False: st.stop()

    # validate required columns in each sheet
    validate_data_format(wb)
    if wb:
        # trigger alert Event
        nms_event_df = pd.DataFrame(wb["NMS_Trigger_Events"].values)
        columns = nms_event_df.iloc[0].to_numpy()
        event_data = nms_event_df.iloc[1].to_numpy()
        trigger_event_dict = {key:event_data[indx] for indx,key in enumerate(columns)}
        trigger_event_dict['alert_msg'] = json.loads((trigger_event_dict['alert_msg']))

        file_path = UPLOAD_FOLDER_PATH / uploaded_excel.name
        fetcher_generator = trigger_agentic_flow(trigger_event_dict, file_path, 1)
        # print(trigger_event_dict)
        st.session_state.current_steps = deepcopy(STEPS)
        run_animated_flow(st.session_state.current_steps, fetcher_generator)

if not uploaded_excel:
    st.info("📂 Upload the Event details file to begin the AIOps Event flow analysis.")
elif not st.session_state.get("current_steps"):
    st.warning("Processing incident data… once ready, start the flow from the sidebar.")
else:
    pass
