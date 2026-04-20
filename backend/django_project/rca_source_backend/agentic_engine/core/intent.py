import numpy as np
import datetime

def rule_based_intent_detection(incident, intents):
    print("incident input to rule based intent detection:", incident)
    best_match = ("unknown", 0.0, None)
    rule_scores = []
    matched_key_and_logs = {}

    for intent in intents:
        score = 0
        matched_key_and_logs[intent['id']] = {'signals':[], 'keyword':[]}

        for kw in intent.get("keywords", []):
            if any(kw.lower() in log.lower() for log in incident.get("logs", [])):
                score += 0.2
                matched_key_and_logs[intent['id']]['keyword'].append(kw)

        for sig in intent.get("signals", []):
            metric = sig["metric"]
            for dev in incident["signals"]:
                if metric in incident["signals"][dev]:
                    value = incident["signals"][dev][metric]
                    try:
                        if eval(f"{value} {sig['op']} {sig['value']}"):
                            score += sig["weight"]
                            matched_key_and_logs[intent['id']]['signals'].append(f"{metric} {sig['op']} {sig['value']} ({sig['weight']})")
                    except Exception:
                        pass

        rule_scores.append((intent["id"], round(score,2)))
        if score > best_match[1]:
            best_match = (intent["id"], round(score,2), intent["template_id"])
    return best_match, rule_scores, matched_key_and_logs

class MockIntentModel:
    def predict_proba(self, X):
        return [[0.09, 0.91]]

    def predict(self, X):
        return ["performance.backup_induced_congestion"]

ml_model = MockIntentModel()

def ml_intent_prediction(incident):
    features = np.array([
        incident["signals"]["utilization"], 
        incident["signals"]["queue_drops"], 
        incident["signals"]["traffic_dscp0_percent"],
        incident["signals"]["traffic_tcp_445_percent"]
    ]).reshape(1, -1)

    intent = ml_model.predict(features)[0]
    confidence = ml_model.predict_proba(features)[0][1]
    return intent, confidence

def compute_final_confidence(rule_score, ml_conf):
    return round(0.5 * rule_score + 0.5 * ml_conf, 2)

def generate_incident_output(incident, rule_result, ml_result):
    rule_intent, rule_score = rule_result
    ml_intent, ml_conf = ml_result

    final_intent = rule_intent if rule_score >= 0.5 else ml_intent
    final_confidence = compute_final_confidence(rule_score, ml_conf)

    incident_output = {
        "incident_id": f"INC-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "device": incident["device"],
        "interface": incident["interface"],
        "detected_intent": final_intent,
        "rule_confidence": rule_score,
        "ml_confidence": ml_conf,
        "final_confidence_score": final_confidence,
        "timestamp": incident["timestamp"],
        "metrics_used": incident["signals"],
        "logs_used": incident["logs"]
    }
    return incident_output
