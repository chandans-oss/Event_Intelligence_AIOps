def score_signals(signal_rules, incident_metrics):
    score = 0
    for rule in signal_rules:
        metric = rule["metric"]
        for dev in incident_metrics:
            if metric in incident_metrics[dev]:
                try:
                    if eval(f"{incident_metrics[dev][metric]} {rule['op']} {rule['value']}"):
                        score += rule["weight"]
                except:
                    pass
    return score

def score_logs(log_rules, logs):
    score = 0
    matched_logs = set()
    if not logs: 
        return 0,[]
    for kw in log_rules:
        if isinstance(kw, str):
            if any(kw.lower() in log.lower() for log in logs):
                score += 0.25
        else:
            keyword = kw.get("keyword", "").lower()
            weight = kw.get("weight", 0.2)
            if any(keyword in log.lower() for log in logs):
                score += weight
                for i,log in enumerate(logs):
                    if keyword in log.lower():
                        matched_logs.add(i)
    return score, matched_logs

def hypothesis_scorer_best_intent(incident, intents, best_intent_id, threshold=0.3):
    best_intent = next((i for i in intents if i["id"] == best_intent_id), None)
    if not best_intent:
        return {"intent_id": "unknown", "intent_score": 0, "hypotheses": [], "top_hypothesis": {}, "prior": 0}

    sig_score = score_signals(best_intent.get("signals", []), incident.get("signals", {}))
    log_score, _ = score_logs(best_intent.get("keywords", []), incident.get("logs", []))
    intent_score = round(sig_score + log_score, 2)
    
    hypothesis_scores = []
    
    for hyp in best_intent.get("hypotheses", []):
        hs = score_signals(hyp.get("signals", []), incident.get("signals", {}))
        hl, matched_logs_indx = score_logs(hyp.get("log_patterns", []), incident.get("logs", []))
        total = round(hs + hl, 2)

        hypothesis_scores.append({
            "hypothesis_id": hyp["id"],
            "description": hyp.get("description", ""),
            "signal_score": round(hs, 2),
            "log_score": round(hl, 2),
            "total_score": total,
            "matched_logs" : [incident.get("logs", [])[i] for i in matched_logs_indx]
        })

    hypothesis_scores = sorted(hypothesis_scores, key=lambda x: x["total_score"], reverse=True)

    return {
        "intent_id": best_intent["id"],
        "intent_score": intent_score,
        "hypotheses": hypothesis_scores,
        "top_hypothesis": hypothesis_scores[0] if hypothesis_scores else {},
        "prior": hypothesis_scores[0]["total_score"] if hypothesis_scores else 0
    }
