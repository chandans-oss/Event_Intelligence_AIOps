import pandas as pd
import re

def generate_evidence_text(incident):
    signals = incident.get('signals',{})
    output_lines = "Here is the metrics of device under inevstigation"
    for device, metrics in signals.items():
        if not metrics:
            continue

        output_lines += f"\nDevice: {device}"
        metric_string = ", ".join(f"{metric}={value}" for metric, value in metrics.items())
        output_lines += metric_string   
        output_lines += "\n" 

    if incident.get("logs"):
        output_lines += f"\n Here is the logs supporting metrics anomaly \n {incident['logs']}"
    return output_lines 

def extract_latest_metrics(metrics, device, resource_name, start_time, end_time):
    res_type_col = metrics["res_type"].fillna("").astype(str).str.lower()
    
    filtered_df = metrics[
        (pd.to_datetime(metrics["timestamp"], utc=True) >= start_time) &
        (pd.to_datetime(metrics["timestamp"], utc=True) <= end_time) &
        ((res_type_col == "device") | (res_type_col == "fan") | (metrics["res_name"].fillna("").astype(str) == str(resource_name))) &
        (metrics["device"].astype(str) == str(device).strip())
    ]

    if filtered_df.empty:
        return {}, ""

    latest_values = filtered_df.apply(
        lambda col: col.dropna().iloc[-1] if not col.dropna().empty else pd.NA
    ).to_dict()

    latest_values = {
        k: v for k, v in latest_values.items() 
        if pd.notna(v)  
    }
    
    for col in ["timestamp", "res_name", "res_type", "device"]:
        latest_values.pop(col, None)

    metrics_string = ", ".join([f"{k}={v}" for k, v in latest_values.items()])
    metrics_string = f"For device {device} latest stats are \n {metrics_string}\n"

    return latest_values, metrics_string

def extract_syslog_entries(syslog, device, resource_name, start_time, end_time, incident):
    filtered_syslog = syslog[
        (pd.to_datetime(syslog["timestamp"], utc=True) >= start_time) &
        (pd.to_datetime(syslog["timestamp"], utc=True) <= end_time) &
        ((syslog["res_name"].fillna("").astype(str) == str(resource_name)) | (syslog["device"].astype(str) == str(device)))
    ]

    if not filtered_syslog.empty:
        ts_formatted = pd.to_datetime(filtered_syslog["timestamp"], utc=True).dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        msg_with_ts = (
                        "Device: " + device + 
                        " | Timestamp: " + ts_formatted + 
                        " | Message: " + filtered_syslog["message"].astype(str)
                    ).tolist()
        incident.setdefault("logs", []).extend(msg_with_ts)

    logs_string = ";".join(incident.get("logs", []))
    logs_string = f"For device {device} logs are \n {logs_string}\n"

    return logs_string
