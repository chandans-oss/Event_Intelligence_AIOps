import re

def create_situation_card(incident, hypotheses, situations):
    matched_situation = (next((situation for situation in situations if situation["template_id"] == incident["template_id"]), None))
    filled_stats = {}
    if matched_situation:
        situation_text = matched_situation["situation_text"]
        all_replacer_keys = re.findall(r'\{(.*?)\}', situation_text)
        for key in all_replacer_keys:
            key = key.strip()
            if key == "top_hypothesis":
                value = hypotheses["top_hypothesis"]["description"] if hypotheses["top_hypothesis"] else "N/A"
            else:
                value = str(incident.get(key, None))
                device = incident.get('device','')
                if value == "None" or value is None:
                    signal_val = incident.get("signals", {}).get(device, {})
                    if isinstance(signal_val, dict):
                        value = str(signal_val.get(key,"N/A"))
                    else:
                        value = "N/A"
            situation_text = situation_text.replace(f"{{{key}}}", value)
        return True, situation_text, filled_stats
    return False, "No matching situation template found.", {}
