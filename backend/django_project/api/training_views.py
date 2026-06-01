"""
training_views.py
─────────────────
Django REST views for the Deduplication Model Training UI.

Endpoints
  POST /api/training/generate-dataset   → generate + preview dataset
  POST /api/training/start              → launch training (SSE stream)
  GET  /api/training/status             → current training state
  POST /api/training/predict            → run inference on alarm text
  GET  /api/training/model-info         → model metadata
"""

from __future__ import annotations

import json
import os
import re
import random
import threading
import time
import queue
import traceback
from pathlib import Path
from typing import Iterator

from django.http import StreamingHttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parents[3]          # project root
MODEL_DIR  = BASE_DIR / "model" / "nms_alarm_classifier"
RESULTS_DIR = BASE_DIR / "model" / "training_results"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# ── Global training state ─────────────────────────────────────────────────────
_training_state: dict = {
    "status": "idle",          # idle | running | done | error
    "progress": 0,
    "logs": [],
    "metrics": {},
    "started_at": None,
    "finished_at": None,
    "error": None,
}
_log_queue: queue.Queue = queue.Queue()
_training_lock = threading.Lock()


# ══════════════════════════════════════════════════════════════════════════════
#  PREPROCESSING  (mirrors model_training.py)
# ══════════════════════════════════════════════════════════════════════════════

def preprocess(text: str) -> str:
    t = text.lower()
    t = re.sub(r'%[A-Z_\-\d]+-\d+-[A-Z_]+:\s*', '', t)
    t = re.sub(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '<IP>', t)
    t = re.sub(r'\d+[\s]?°?\s?c\b', '<TEMP>', t)
    t = re.sub(r'\d+[\s]?%', '<PCT>', t)
    intf_patterns = [
        r'\bge-\d+/\d+/\d+\b', r'\bxe-\d+/\d+/\d+\b', r'\bet-\d+/\d+/\d+\b',
        r'\bfe-\d+/\d+/\d+\b', r'\bgigabitethernet\d+/\d+\b', r'\bfastethernet\d+/\d+\b',
        r'\btengige\d+/\d+\b', r'\bhundredgige\d+/\d+\b', r'\bgig\d+/\d+\b',
        r'\bfa\d+/\d+\b', r'\bte\d+/\d+\b', r'\bhu\d+/\d+\b', r'\beth\d+/\d+\b',
        r'\b(ge|xe|100ge|xge|eth-trunk|loopback)\d+(/\d+)*/?(\d*)\b', r'\beth\d+\b',
        r'\bport\s+\d+\b', r'\bslot\s+\d+\b',
    ]
    for pat in intf_patterns:
        t = re.sub(pat, '<INTF>', t, flags=re.IGNORECASE)
    t = re.sub(r'\b(rtr|sw|pe|ce|bng|agg|core|dist|acc)-[a-z]{2,4}-\d+\b', '<HOST>', t, flags=re.IGNORECASE)
    t = re.sub(r'\bfxp\d+\b', '<INTF>', t)
    t = re.sub(r'\boid=[\d.]+\b', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\bifindex\s*=?\s*\d+\b', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\b\d{1,2}:\d{2}:\d{2}\b', '', t)
    t = re.sub(r'\bas\s+\d+\b', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\b\d+\b', '<NUM>', t)
    t = re.sub(r'[=<>(){}\[\]|@#$\\]', ' ', t)
    t = re.sub(r'[_\-]+', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


# ══════════════════════════════════════════════════════════════════════════════
#  DATASET GENERATION  (mirrors model_training.py templates)
# ══════════════════════════════════════════════════════════════════════════════

def _rand_cisco_intf():
    types = ["GigabitEthernet", "FastEthernet", "TenGigE", "HundredGigE", "Gig", "Fa", "Te", "Hu", "Eth"]
    return f"{random.choice(types)}{random.randint(0,5)}/{random.randint(0,47)}"

def _rand_juniper_intf():
    types = ["ge", "xe", "et", "fe"]
    return f"{random.choice(types)}-{random.randint(0,3)}/{random.randint(0,1)}/{random.randint(0,47)}"

def _rand_huawei_intf():
    types = ["GE", "XGE", "100GE", "Eth-Trunk", "LoopBack"]
    t = random.choice(types)
    if "Trunk" in t:
        return f"{t}{random.randint(0,63)}"
    return f"{t}{random.randint(0,3)}/{random.randint(0,1)}/{random.randint(0,47)}"

def _rand_ip():
    return f"{random.randint(10,192)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

def _rand_intf():
    return random.choice([_rand_cisco_intf, _rand_juniper_intf, _rand_huawei_intf])()

def _rand_hostname():
    prefixes = ["RTR", "SW", "PE", "CE", "BNG", "AGG", "CORE", "DIST", "ACC"]
    cities   = ["MUM", "DEL", "BLR", "HYD", "CHN", "KOL", "AHM", "PUN"]
    return f"{random.choice(prefixes)}-{random.choice(cities)}-{random.randint(1,99):02d}"

LINK_DOWN_TEMPLATES = [
    lambda: f"%LINEPROTO-5-UPDOWN: Line protocol on Interface {_rand_cisco_intf()}, changed state to down",
    lambda: f"%LINK-3-UPDOWN: Interface {_rand_cisco_intf()}, changed state to down",
    lambda: f"Interface {_rand_cisco_intf()} is down, line protocol is down",
    lambda: f"Link Down on interface {_rand_cisco_intf()}",
    lambda: f"Port {_rand_cisco_intf()} transitioned to down state",
    lambda: f"OSPF neighbor lost on {_rand_cisco_intf()} - interface went down",
    lambda: f"Carrier lost on interface {_rand_cisco_intf()}",
    lambda: f"Physical layer down detected on {_rand_cisco_intf()}",
    lambda: f"Interface {_rand_cisco_intf()} down due to LACP timeout",
    lambda: f"BFD session down on interface {_rand_cisco_intf()}",
    lambda: f"SNMP_TRAP_LINK_DOWN: ifIndex {random.randint(1,512)} interface {_rand_juniper_intf()} DOWN",
    lambda: f"Interface {_rand_juniper_intf()} link is Down",
    lambda: f"Physical link down on {_rand_juniper_intf()}: Loss of signal",
    lambda: f"IFD_DOWN: Interface {_rand_juniper_intf()} state changed: up -> down",
    lambda: f"Port {_rand_huawei_intf()} Link Down",
    lambda: f"hwIfOperStatus: {_rand_huawei_intf()} changed to down",
    lambda: f"ALM_PORTDOWN: Port:{_rand_huawei_intf()} physic-layer down",
    lambda: f"NokiaTrap: interfaceOperStatusDown - port {_rand_huawei_intf()} at {_rand_hostname()}",
    lambda: f"[{_rand_hostname()}] Interface state change: {_rand_intf()} DOWN",
    lambda: f"ALERT: Loss of carrier on port {_rand_intf()} (IP: {_rand_ip()})",
    lambda: f"Interface {_rand_intf()} oper-status: DOWN (prev: UP)",
    lambda: f"Physical link FAILURE - {_rand_cisco_intf()}",
    lambda: f"No light received on {_rand_intf()}, declaring link down",
    lambda: f"Port {_rand_intf()} has lost its optical signal — link down",
    lambda: f"Loss of signal detected on {_rand_intf()}",
]

LINK_UP_TEMPLATES = [
    lambda: f"%LINEPROTO-5-UPDOWN: Line protocol on Interface {_rand_cisco_intf()}, changed state to up",
    lambda: f"Interface {_rand_cisco_intf()} is up, line protocol is up",
    lambda: f"Interface {_rand_cisco_intf()} link is up",
    lambda: f"Physical link restored on {_rand_cisco_intf()}",
    lambda: f"Carrier signal detected on {_rand_cisco_intf()} - link is up",
    lambda: f"BFD session up on interface {_rand_cisco_intf()}",
    lambda: f"Interface {_rand_cisco_intf()} came back up after LACP convergence",
    lambda: f"SNMP_TRAP_LINK_UP: ifIndex {random.randint(1,512)} interface {_rand_juniper_intf()} UP",
    lambda: f"Interface {_rand_juniper_intf()} link is Up",
    lambda: f"Physical link restored on {_rand_juniper_intf()}",
    lambda: f"IFD_UP: Interface {_rand_juniper_intf()} state changed: down -> up",
    lambda: f"Link restored on {_rand_juniper_intf()}: signal detected",
    lambda: f"Port {_rand_huawei_intf()} Link Up",
    lambda: f"hwIfOperStatus: {_rand_huawei_intf()} changed to up",
    lambda: f"ALM_PORTUP: Port:{_rand_huawei_intf()} physic-layer up",
    lambda: f"NokiaTrap: interfaceOperStatusUp - port {_rand_huawei_intf()} at {_rand_hostname()}",
    lambda: f"[{_rand_hostname()}] Interface state change: {_rand_intf()} UP",
    lambda: f"Interface {_rand_intf()} oper-status: UP (prev: DOWN)",
    lambda: f"Link restoration event on {_rand_intf()} at {_rand_hostname()}",
    lambda: f"Optical signal restored on {_rand_intf()}, link up",
    lambda: f"Port operationally UP: {_rand_intf()}",
    lambda: f"Physical link restored on {_rand_intf()}",
]

UNKNOWN_TEMPLATES = [
    lambda: f"CPU utilization exceeded {random.randint(80,99)}% threshold on {_rand_hostname()}",
    lambda: f"Memory exhaustion alert: {random.randint(80,99)}% heap used on {_rand_hostname()}",
    lambda: f"BGP Neighbor {_rand_ip()} went down: Hold timer expired",
    lambda: f"BGP session to {_rand_ip()} (AS {random.randint(1000,65535)}) IDLE",
    lambda: f"OSPF neighbor {_rand_ip()} adjacency lost on {_rand_intf()}",
    lambda: f"ISIS adjacency down: neighbor {_rand_ip()} unreachable",
    lambda: f"MPLS LDP session to {_rand_ip()} terminated",
    lambda: f"Power supply {random.randint(1,2)} failed on {_rand_hostname()}",
    lambda: f"Fan tray {random.randint(1,4)} failure detected",
    lambda: f"Temperature threshold exceeded: {random.randint(70,90)}°C on {_rand_hostname()}",
    lambda: f"SFP removed from interface {_rand_intf()}",
    lambda: f"SFP DDM alarm: Tx power low on {_rand_intf()}: {random.uniform(-10,-5):.1f}dBm",
    lambda: f"Linecard {random.randint(0,7)} OIR: removed from slot {random.randint(0,15)}",
    lambda: f"FIB hardware error: TCAM full on {_rand_hostname()}",
    lambda: f"ACL violation: {random.randint(100,9999)} packets dropped from {_rand_ip()}",
    lambda: f"Port security violation on {_rand_cisco_intf()}: {random.randint(1,100)} mac flaps",
    lambda: f"SSH brute force detected: {random.randint(10,500)} attempts from {_rand_ip()}",
    lambda: f"STP topology change detected on {_rand_cisco_intf()}",
    lambda: f"NTP server {_rand_ip()} unreachable, clock drift: {random.randint(100,999)}ms",
    lambda: f"System reboot initiated: scheduled maintenance on {_rand_hostname()}",
    lambda: f"Process {random.choice(['bgpd','ospfd','ldpd','isisd'])} crashed and restarted",
    lambda: f"QoS queue drops: {random.randint(100,10000)} packets dropped in class {random.choice(['voice','video','data'])}",
    lambda: f"License expiry warning: {random.randint(1,30)} days remaining on {_rand_hostname()}",
    lambda: f"NMI received — hardware fault on {_rand_hostname()}",
]

ID_TO_LABEL = {0: "LINK_DOWN", 1: "LINK_UP", 2: "UNKNOWN"}

def _add_noise(text: str) -> str:
    # 20% chance to drop a random word to simulate incomplete logs
    if random.random() < 0.2:
        words = text.split()
        if len(words) > 3:
            words.pop(random.randint(0, len(words)-1))
            return " ".join(words)
    # 10% chance to lower-case everything
    if random.random() < 0.1:
        return text.lower()
    return text

def generate_dataset(n_per_class: int = 400) -> list[dict]:
    data = []
    
    # 1. Generate core samples with some text noise
    for _ in range(n_per_class):
        raw = _add_noise(random.choice(LINK_DOWN_TEMPLATES)())
        data.append({"raw_text": raw, "processed_text": preprocess(raw), "label": "LINK_DOWN", "label_id": 0})
    for _ in range(n_per_class):
        raw = _add_noise(random.choice(LINK_UP_TEMPLATES)())
        data.append({"raw_text": raw, "processed_text": preprocess(raw), "label": "LINK_UP", "label_id": 1})
    for _ in range(n_per_class):
        raw = _add_noise(random.choice(UNKNOWN_TEMPLATES)())
        data.append({"raw_text": raw, "processed_text": preprocess(raw), "label": "UNKNOWN", "label_id": 2})
        
    # 2. Add Label Noise (flip ~5% of labels) to prevent perfect 100% accuracy
    for item in data:
        if random.random() < 0.05:
            # Pick a wrong label intentionally
            wrong_id = random.choice([x for x in [0, 1, 2] if x != item["label_id"]])
            item["label_id"] = wrong_id
            item["label"] = ID_TO_LABEL[wrong_id]

    random.shuffle(data)
    return data


# ══════════════════════════════════════════════════════════════════════════════
#  TRAINER  (background thread)
# ══════════════════════════════════════════════════════════════════════════════

def _log(msg: str):
    _log_queue.put(msg)
    _training_state["logs"].append(msg)


def _run_training(cfg: dict):
    """Runs inside a background thread. Emits log messages via _log_queue."""
    global _training_state
    try:
        import torch
        import numpy as np
        from transformers import (
            DistilBertTokenizerFast,
            DistilBertForSequenceClassification,
            TrainingArguments,
            Trainer,
        )
        from sklearn.model_selection import train_test_split
        from sklearn.metrics import confusion_matrix, classification_report

        n_per_class   = int(cfg.get("n_per_class", 400))
        epochs        = int(cfg.get("epochs", 5))
        batch_size    = int(cfg.get("batch_size", 16))
        lr            = float(cfg.get("learning_rate", 2e-5))
        max_len       = int(cfg.get("max_length", 64))
        test_size     = float(cfg.get("test_size", 0.2))
        base_model    = cfg.get("base_model", "distilbert-base-uncased")
        model_cache   = str(BASE_DIR / "model" / "hf_cache")
        os.makedirs(model_cache, exist_ok=True)

        # ── Stage 1: Dataset ──────────────────────────────────────────────────
        _training_state["stage"] = "dataset"
        _training_state["progress"] = 5
        _log(f"[Dataset] Generating {n_per_class} samples/class × 3 = {n_per_class*3} total …")
        data = generate_dataset(n_per_class)
        _log(f"[Dataset] ✓ {len(data)} samples generated (LINK_DOWN={n_per_class}, LINK_UP={n_per_class}, UNKNOWN={n_per_class})")

        import pandas as pd
        df = pd.DataFrame(data)

        train_df, test_df = train_test_split(
            df, test_size=test_size, random_state=42, stratify=df["label_id"]
        )
        _log(f"[Dataset] ✓ Train={len(train_df)}, Test={len(test_df)} (split={int((1-test_size)*100)}/{int(test_size*100)})")
        _training_state["progress"] = 15

        # ── Stage 2: Tokenization ─────────────────────────────────────────────
        _training_state["stage"] = "tokenize"
        _log(f"[Tokenize] Loading tokenizer '{base_model}' (cache: {model_cache}) …")
        tokenizer = DistilBertTokenizerFast.from_pretrained(base_model, cache_dir=model_cache)
        _log(f"[Tokenize] ✓ Tokenizer loaded")

        _log(f"[Tokenize] Encoding {len(train_df)} train samples (max_length={max_len}) …")
        train_enc = tokenizer(train_df["processed_text"].tolist(), truncation=True, padding=True, max_length=max_len)
        test_enc  = tokenizer(test_df["processed_text"].tolist(),  truncation=True, padding=True, max_length=max_len)
        _log(f"[Tokenize] ✓ Encoding complete")
        _training_state["progress"] = 25

        # ── Stage 3: Model ────────────────────────────────────────────────────
        _training_state["stage"] = "model"
        _log(f"[Model] Loading '{base_model}' for sequence classification (num_labels=3) …")

        class _DS(torch.utils.data.Dataset):
            def __init__(self, enc, labels):
                self.enc = enc; self.labels = labels
            def __getitem__(self, index):
                item = {k: torch.tensor(v[index]) for k, v in self.enc.items()}
                item["labels"] = torch.tensor(self.labels[index])
                return item
            def __len__(self): return len(self.labels)

        train_ds = _DS(train_enc, train_df["label_id"].tolist())
        test_ds  = _DS(test_enc,  test_df["label_id"].tolist())

        model = DistilBertForSequenceClassification.from_pretrained(
            base_model, num_labels=3, cache_dir=model_cache,
            id2label=ID_TO_LABEL, label2id={v: k for k, v in ID_TO_LABEL.items()}
        )
        _log(f"[Model] ✓ Model loaded ({sum(p.numel() for p in model.parameters()):,} parameters)")
        _training_state["progress"] = 35

        # ── Stage 4: Training ─────────────────────────────────────────────────
        _training_state["stage"] = "train"
        _log(f"[Train] Starting: epochs={epochs}, batch={batch_size}, lr={lr}")

        epoch_metrics: list[dict] = []

        class _LogCallback:
            def on_log(self, args, state, control, logs=None, **kwargs):
                if logs:
                    loss = logs.get("loss") or logs.get("train_loss")
                    eval_loss = logs.get("eval_loss")
                    epoch = logs.get("epoch", state.epoch)
                    if loss:
                        _log(f"[Train] Epoch {epoch:.1f} — loss: {loss:.4f}")
                    if eval_loss:
                        _log(f"[Train] Epoch {epoch:.1f} — eval_loss: {eval_loss:.4f}")
                    if logs.get("eval_accuracy"):
                        _log(f"[Train] Epoch {epoch:.1f} — eval_accuracy: {logs['eval_accuracy']:.4f}")
                    epoch_metrics.append({k: v for k, v in logs.items() if isinstance(v, (int, float))})
                    # Update progress: 35 → 80 across epochs
                    pct = min(80, 35 + int((state.epoch / epochs) * 45))
                    _training_state["progress"] = pct

        def _compute_metrics(eval_pred):
            logits, labels = eval_pred
            preds = np.argmax(logits, axis=-1)
            acc = float((preds == labels).mean())
            return {"accuracy": acc}

        from transformers import TrainerCallback

        class _CB(TrainerCallback):
            def on_log(self, args, state, control, logs=None, **kwargs):
                _LogCallback().on_log(args, state, control, logs, **kwargs)

        results_dir = str(RESULTS_DIR)
        training_args = TrainingArguments(
            output_dir=results_dir,
            num_train_epochs=epochs,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            learning_rate=lr,
            eval_strategy="epoch",
            save_strategy="epoch",
            logging_steps=max(1, len(train_ds) // batch_size // 5),
            weight_decay=0.01,
            load_best_model_at_end=True,
            metric_for_best_model="accuracy",
            report_to=[],
        )
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_ds,
            eval_dataset=test_ds,
            compute_metrics=_compute_metrics,
            callbacks=[_CB()],
        )
        trainer.train()
        _log(f"[Train] ✓ Training complete")
        _training_state["progress"] = 80

        # ── Stage 5: Evaluate ─────────────────────────────────────────────────
        _training_state["stage"] = "evaluate"
        _log(f"[Evaluate] Running predictions on {len(test_ds)} test samples …")
        pred_out = trainer.predict(test_ds)
        y_pred = np.argmax(pred_out.predictions, axis=1)
        y_true_raw = pred_out.label_ids
        if y_true_raw is None:
            raise ValueError("No label_ids found in predictions")
        y_true = np.asarray(y_true_raw)

        cm = confusion_matrix(y_true, y_pred).tolist()
        report = classification_report(
            y_true, y_pred,
            target_names=["LINK_DOWN", "LINK_UP", "UNKNOWN"],
            output_dict=True
        )
        
        if not isinstance(report, dict):
            raise TypeError("Expected classification_report to return a dictionary")
            
        accuracy = float(report["accuracy"])
        _log(f"[Evaluate] ✓ Accuracy: {accuracy:.4f}")
        _log(f"[Evaluate] LINK_DOWN F1={report['LINK_DOWN']['f1-score']:.3f}  "
             f"LINK_UP F1={report['LINK_UP']['f1-score']:.3f}  "
             f"UNKNOWN F1={report['UNKNOWN']['f1-score']:.3f}")
        _training_state["progress"] = 90

        # ── Stage 6: Save ─────────────────────────────────────────────────────
        _training_state["stage"] = "save"
        _log(f"[Save] Saving model to {MODEL_DIR} …")
        model.save_pretrained(str(MODEL_DIR))
        tokenizer.save_pretrained(str(MODEL_DIR))

        # Save metadata
        metadata = {
            "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "base_model": base_model,
            "accuracy": accuracy,
            "config": cfg,
            "confusion_matrix": cm,
            "classification_report": report,
            "epoch_metrics": epoch_metrics,
        }
        with open(MODEL_DIR / "training_metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

        _log(f"[Save] ✓ Model saved to {MODEL_DIR}")
        _training_state["progress"] = 100
        _training_state["status"] = "done"
        _training_state["finished_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        _training_state["metrics"] = {
            "accuracy": accuracy,
            "confusion_matrix": cm,
            "classification_report": report,
            "epoch_metrics": epoch_metrics,
        }
        _log(f"[Done] ✅ Training completed successfully — accuracy: {accuracy:.4f}")

    except Exception as e:
        _training_state["status"] = "error"
        _training_state["error"] = str(e)
        _training_state["finished_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        _log(f"[Error] ❌ {e}")
        _log(traceback.format_exc())


# ══════════════════════════════════════════════════════════════════════════════
#  VIEWS
# ══════════════════════════════════════════════════════════════════════════════

@method_decorator(csrf_exempt, name='dispatch')
class GenerateDatasetView(APIView):
    """POST /api/training/generate-dataset"""
    def post(self, request):
        try:
            body = json.loads(request.body or '{}')
            n_per_class = max(10, min(2000, int(body.get("n_per_class", 400))))
            data = generate_dataset(n_per_class)

            # Return first 20 rows as preview
            preview = data[:20]
            counts = {"LINK_DOWN": n_per_class, "LINK_UP": n_per_class, "UNKNOWN": n_per_class}

            return Response({
                "total": len(data),
                "n_per_class": n_per_class,
                "counts": counts,
                "preview": preview,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class StartTrainingView(APIView):
    """POST /api/training/start — start training in background thread + stream logs via SSE"""

    def post(self, request):
        global _training_state, _log_queue

        with _training_lock:
            if _training_state["status"] == "running":
                return Response({"error": "Training already running"}, status=400)

            # Reset state
            _training_state = {
                "status": "running",
                "stage": "init",
                "progress": 0,
                "logs": [],
                "metrics": {},
                "started_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "finished_at": None,
                "error": None,
            }
            _log_queue = queue.Queue()

        try:
            cfg = json.loads(request.body or '{}')
        except Exception:
            cfg = {}

        thread = threading.Thread(target=_run_training, args=(cfg,), daemon=True)
        thread.start()

        def _sse_stream() -> Iterator[str]:
            """Yields SSE events until training finishes."""
            while True:
                try:
                    msg = _log_queue.get(timeout=1.0)
                    payload = json.dumps({
                        "log": msg,
                        "progress": _training_state["progress"],
                        "stage": _training_state.get("stage", ""),
                        "status": _training_state["status"],
                    })
                    yield f"data: {payload}\n\n"
                except queue.Empty:
                    # Heartbeat
                    payload = json.dumps({
                        "heartbeat": True,
                        "progress": _training_state["progress"],
                        "stage": _training_state.get("stage", ""),
                        "status": _training_state["status"],
                    })
                    yield f"data: {payload}\n\n"

                if _training_state["status"] in ("done", "error"):
                    # Drain remaining messages
                    while not _log_queue.empty():
                        try:
                            msg = _log_queue.get_nowait()
                            payload = json.dumps({"log": msg, "status": _training_state["status"], "progress": 100})
                            yield f"data: {payload}\n\n"
                        except queue.Empty:
                            break
                    # Final done/error event
                    yield f"data: {json.dumps({'done': True, 'status': _training_state['status'], 'metrics': _training_state['metrics']})}\n\n"
                    break

        response = StreamingHttpResponse(_sse_stream(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


class TrainingStatusView(APIView):
    """GET /api/training/status"""
    def get(self, request):
        return Response({
            "status": _training_state["status"],
            "stage": _training_state.get("stage", ""),
            "progress": _training_state["progress"],
            "started_at": _training_state["started_at"],
            "finished_at": _training_state["finished_at"],
            "error": _training_state["error"],
            "metrics": _training_state["metrics"],
            "logs": _training_state["logs"][-100:],  # last 100 log lines
        })


@method_decorator(csrf_exempt, name='dispatch')
class PredictView(APIView):
    """POST /api/training/predict"""

    def post(self, request):
        try:
            body = json.loads(request.body or '{}')
            texts = body.get("texts", [])
            if isinstance(texts, str):
                texts = [texts]
            if not texts:
                return Response({"error": "No texts provided"}, status=400)

            if not (MODEL_DIR / "config.json").exists():
                return Response({"error": "No trained model found. Please train the model first."}, status=404)

            from transformers import pipeline as hf_pipeline
            clf = hf_pipeline(
                "text-classification",
                model=str(MODEL_DIR),
                tokenizer=str(MODEL_DIR),
                top_k=None,  # Use top_k=None instead of deprecated return_all_scores=True
            )

            results = []
            for text in texts:
                processed = preprocess(text)
                raw_out = clf(processed)
                
                # Robustly extract the list of scores (handles both old nested lists and new flat lists)
                if isinstance(raw_out, list) and len(raw_out) > 0 and isinstance(raw_out[0], list):
                    scores_raw = raw_out[0]
                elif isinstance(raw_out, list) and len(raw_out) > 0 and isinstance(raw_out[0], dict):
                    scores_raw = raw_out
                else:
                    scores_raw = [raw_out] if isinstance(raw_out, dict) else []

                # Map LABEL_0/1/2 to LINK_DOWN/LINK_UP/UNKNOWN
                scores = []
                best_score = -1
                best_label = "UNKNOWN"
                for s in scores_raw:
                    if not isinstance(s, dict):
                        continue
                    idx_str = str(s.get("label", "")).split("_")[-1]
                    try:
                        idx = int(idx_str)
                        label = ID_TO_LABEL.get(idx, s.get("label", "UNKNOWN"))
                    except ValueError:
                        label = s.get("label", "UNKNOWN")
                        
                    score = round(float(s.get("score", 0)), 4)
                    scores.append({"label": label, "score": score})
                    
                    if score > best_score:
                        best_score = score
                        best_label = label

                results.append({
                    "raw_text": text,
                    "processed_text": processed,
                    "prediction": best_label,
                    "confidence": best_score,
                    "all_scores": scores,
                })

            return Response({"results": results})

        except Exception as e:
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


class ModelInfoView(APIView):
    """GET /api/training/model-info"""
    def get(self, request):
        config_path   = MODEL_DIR / "config.json"
        metadata_path = MODEL_DIR / "training_metadata.json"

        exists = config_path.exists()
        metadata = {}
        if metadata_path.exists():
            with open(metadata_path) as f:
                metadata = json.load(f)

        # Model size
        size_mb = 0
        if exists:
            for p in MODEL_DIR.rglob("*"):
                if p.is_file():
                    size_mb += p.stat().st_size
            size_mb = round(size_mb / (1024 * 1024), 1)

        return Response({
            "exists": exists,
            "path": str(MODEL_DIR),
            "size_mb": size_mb,
            "trained_at": metadata.get("trained_at"),
            "accuracy": metadata.get("accuracy"),
            "base_model": metadata.get("base_model"),
            "config": metadata.get("config", {}),
            "confusion_matrix": metadata.get("confusion_matrix"),
            "classification_report": metadata.get("classification_report"),
        })
