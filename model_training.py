!pip install transformers datasets torch scikit-learn pandas


import numpy as np
import pandas as pd
import random
import re
"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — DATASET GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We need a realistic telecom alarm dataset covering:

1. LINK_DOWN  — alarms indicating a link, port, or interface went down
2. LINK_UP    — alarms indicating a link, port, or interface came back up
3. UNKNOWN    — unrelated alarms (CPU, power, BGP, hardware, SFP, etc.)

Why 1000+ samples?
   Neural networks learn GENERALIZATIONS from data.
   The more varied the training data, the better the model generalizes.
   We cover Cisco, Juniper, Huawei, Nokia, Ericsson, syslog, SNMP styles.
"""

# ── Interface name generators ──────────────────────────────────────────────

def rand_cisco_intf():
    types = ["GigabitEthernet", "FastEthernet", "TenGigE", "HundredGigE",
             "Gig", "Fa", "Te", "Hu", "Eth"]
    t = random.choice(types)
    a, b = random.randint(0, 5), random.randint(0, 47)
    return f"{t}{a}/{b}"

def rand_juniper_intf():
    types = ["ge", "xe", "et", "fe"]
    t = random.choice(types)
    return f"{t}-{random.randint(0,3)}/{random.randint(0,1)}/{random.randint(0,47)}"

def rand_huawei_intf():
    types = ["GE", "XGE", "100GE", "Eth-Trunk", "LoopBack"]
    t = random.choice(types)
    if "Trunk" in t:
        return f"{t}{random.randint(0,63)}"
    return f"{t}{random.randint(0,3)}/{random.randint(0,1)}/{random.randint(0,47)}"

def rand_ip():
    return f"{random.randint(10,192)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

def rand_intf():
    return random.choice([rand_cisco_intf, rand_juniper_intf, rand_huawei_intf])()

def rand_hostname():
    prefixes = ["RTR", "SW", "PE", "CE", "BNG", "AGG", "CORE", "DIST", "ACC"]
    cities   = ["MUM", "DEL", "BLR", "HYD", "CHN", "KOL", "AHM", "PUN"]
    return f"{random.choice(prefixes)}-{random.choice(cities)}-{random.randint(1,99):02d}"

# ── LINK_DOWN templates ────────────────────────────────────────────────────

LINK_DOWN_TEMPLATES = [
    # Cisco IOS / IOS-XE / IOS-XR
    lambda: f"%LINEPROTO-5-UPDOWN: Line protocol on Interface {rand_cisco_intf()}, changed state to down",
    lambda: f"%LINK-3-UPDOWN: Interface {rand_cisco_intf()}, changed state to down",
    lambda: f"Interface {rand_cisco_intf()} is down, line protocol is down",
    lambda: f"{rand_cisco_intf()} went down, last change: {random.randint(0,23):02d}:{random.randint(0,59):02d}:{random.randint(0,59):02d}",
    lambda: f"Link Down on interface {rand_cisco_intf()}",
    lambda: f"Port {rand_cisco_intf()} transitioned to down state",
    lambda: f"Interface {rand_cisco_intf()} link is down",
    lambda: f"OSPF neighbor lost on {rand_cisco_intf()} - interface went down",
    lambda: f"Carrier lost on interface {rand_cisco_intf()}",
    lambda: f"Physical layer down detected on {rand_cisco_intf()}",
    lambda: f"ifOperStatus changed to down for {rand_cisco_intf()}",
    lambda: f"Interface {rand_cisco_intf()} is administratively down",
    lambda: f"NIC link state changed: {rand_cisco_intf()} -> DOWN",
    lambda: f"No carrier signal on {rand_cisco_intf()}",
    lambda: f"Loss of signal detected on {rand_cisco_intf()}",
    lambda: f"Layer 1 failure on interface {rand_cisco_intf()}",
    lambda: f"Interface {rand_cisco_intf()} down due to LACP timeout",
    lambda: f"BFD session down on interface {rand_cisco_intf()}",
    lambda: f"SNMP Trap: linkDown OID=1.3.6.1.6.3.1.1.5.3 ifIndex={random.randint(1,128)} {rand_cisco_intf()}",
    # Juniper
    lambda: f"RPD_OSPF_NBRDOWN: OSPF neighbor {rand_ip()} (realm ospf-v2) on {rand_juniper_intf()} went down",
    lambda: f"SNMP_TRAP_LINK_DOWN: ifIndex {random.randint(1,512)} interface {rand_juniper_intf()} DOWN",
    lambda: f"Interface {rand_juniper_intf()} link is Down",
    lambda: f"Link failure detected on {rand_juniper_intf()}",
    lambda: f"Physical link down on {rand_juniper_intf()}: Loss of signal",
    lambda: f"{rand_juniper_intf()} transitioned to down state at {random.randint(0,23):02d}:{random.randint(0,59):02d}",
    lambda: f"fxp0: link DOWN, media: Ethernet, full-duplex",
    lambda: f"IFD_DOWN: Interface {rand_juniper_intf()} state changed: up -> down",
    # Huawei / Nokia / Ericsson
    lambda: f"Port {rand_huawei_intf()} Link Down",
    lambda: f"hwIfOperStatus: {rand_huawei_intf()} changed to down",
    lambda: f"Interface {rand_huawei_intf()} port link status is DOWN",
    lambda: f"Link state DOWN on port {rand_huawei_intf()}",
    lambda: f"ALM_PORTDOWN: Port:{rand_huawei_intf()} physic-layer down",
    lambda: f"NokiaTrap: interfaceOperStatusDown - port {rand_huawei_intf()} at {rand_hostname()}",
    lambda: f"Ericsson ENM: Interface down alarm, {rand_huawei_intf()}, Severity: Critical",
    # Generic syslog variations
    lambda: f"[{rand_hostname()}] Interface state change: {rand_intf()} DOWN",
    lambda: f"ALERT: Loss of carrier on port {rand_intf()} (IP: {rand_ip()})",
    lambda: f"Syslog: eth{random.randint(0,8)} link down, speed was {random.choice(['1G','10G','100G'])}",
    lambda: f"Port {random.randint(1,48)} went operationally down on {rand_hostname()}",
    lambda: f"Interface {rand_intf()} oper-status: DOWN (prev: UP)",
    lambda: f"Link down event: intf={rand_intf()}, host={rand_hostname()}, ip={rand_ip()}",
    # Abbreviated / noisy
    lambda: f"INTF {rand_cisco_intf()} STA CHG -> DWN",
    lambda: f"lnk dwn {rand_juniper_intf()} @{rand_ip()}",
    lambda: f"if-down {rand_intf()}",
    lambda: f"Physical link FAILURE - {rand_cisco_intf()}",
    lambda: f"Lost carrier detected on interface {rand_intf()}",
    lambda: f"Interface state changed to down: {rand_intf()}",
    lambda: f"No light received on {rand_intf()}, declaring link down",
    lambda: f"Port {rand_intf()} has lost its optical signal — link down",
]

# ── LINK_UP templates ──────────────────────────────────────────────────────

LINK_UP_TEMPLATES = [
    # Cisco
    lambda: f"%LINEPROTO-5-UPDOWN: Line protocol on Interface {rand_cisco_intf()}, changed state to up",
    lambda: f"%LINK-3-UPDOWN: Interface {rand_cisco_intf()}, changed state to up",
    lambda: f"Interface {rand_cisco_intf()} is up, line protocol is up",
    lambda: f"Interface {rand_cisco_intf()} link is up",
    lambda: f"Port {rand_cisco_intf()} transitioned to up state",
    lambda: f"Physical link restored on {rand_cisco_intf()}",
    lambda: f"Carrier signal detected on {rand_cisco_intf()} - link is up",
    lambda: f"Interface {rand_cisco_intf()} oper-status: UP",
    lambda: f"ifOperStatus changed to up for {rand_cisco_intf()}",
    lambda: f"NIC link state changed: {rand_cisco_intf()} -> UP",
    lambda: f"Interface {rand_cisco_intf()} is now administratively up",
    lambda: f"SNMP Trap: linkUp OID=1.3.6.1.6.3.1.1.5.4 ifIndex={random.randint(1,128)} {rand_cisco_intf()}",
    lambda: f"BFD session up on interface {rand_cisco_intf()}",
    lambda: f"Interface {rand_cisco_intf()} came back up after LACP convergence",
    lambda: f"Port {rand_cisco_intf()} is operationally UP",
    # Juniper
    lambda: f"SNMP_TRAP_LINK_UP: ifIndex {random.randint(1,512)} interface {rand_juniper_intf()} UP",
    lambda: f"Interface {rand_juniper_intf()} link is Up",
    lambda: f"Physical link restored on {rand_juniper_intf()}",
    lambda: f"IFD_UP: Interface {rand_juniper_intf()} state changed: down -> up",
    lambda: f"{rand_juniper_intf()} transitioned to up state at {random.randint(0,23):02d}:{random.randint(0,59):02d}",
    lambda: f"Link restored on {rand_juniper_intf()}: signal detected",
    # Huawei / Nokia / Ericsson
    lambda: f"Port {rand_huawei_intf()} Link Up",
    lambda: f"hwIfOperStatus: {rand_huawei_intf()} changed to up",
    lambda: f"Interface {rand_huawei_intf()} port link status is UP",
    lambda: f"ALM_PORTUP: Port:{rand_huawei_intf()} physic-layer up",
    lambda: f"NokiaTrap: interfaceOperStatusUp - port {rand_huawei_intf()} at {rand_hostname()}",
    lambda: f"Ericsson ENM: Interface up clear, {rand_huawei_intf()}, Severity: Cleared",
    # Generic
    lambda: f"[{rand_hostname()}] Interface state change: {rand_intf()} UP",
    lambda: f"Syslog: eth{random.randint(0,8)} link up, speed: {random.choice(['1G','10G','100G'])}",
    lambda: f"Port {random.randint(1,48)} came operationally up on {rand_hostname()}",
    lambda: f"Interface {rand_intf()} oper-status: UP (prev: DOWN)",
    lambda: f"Link up event: intf={rand_intf()}, host={rand_hostname()}, ip={rand_ip()}",
    lambda: f"Link restoration event on {rand_intf()} at {rand_hostname()}",
    # Abbreviated
    lambda: f"INTF {rand_cisco_intf()} STA CHG -> UP",
    lambda: f"lnk up {rand_juniper_intf()} @{rand_ip()}",
    lambda: f"if-up {rand_intf()}",
    lambda: f"Port operationally UP: {rand_intf()}",
    lambda: f"Interface state changed to UP: {rand_intf()}",
    lambda: f"Physical link restored on {rand_intf()}",
    lambda: f"Optical signal restored on {rand_intf()}, link up",
]

# ── UNKNOWN templates ──────────────────────────────────────────────────────

UNKNOWN_TEMPLATES = [
    # CPU / Memory
    lambda: f"CPU utilization exceeded {random.randint(80,99)}% threshold on {rand_hostname()}",
    lambda: f"High CPU interrupt: {random.randint(70,100)}% on process cisco_ios",
    lambda: f"Memory exhaustion alert: {random.randint(80,99)}% heap used on {rand_hostname()}",
    lambda: f"Kernel: OOM killer invoked, free memory: {random.randint(100,500)}MB",
    lambda: f"SNMP: sysUpTime exceeded 497 days, counter wrap on {rand_hostname()}",
    # BGP / Routing
    lambda: f"BGP Neighbor {rand_ip()} went down: Hold timer expired",
    lambda: f"BGP session to {rand_ip()} (AS {random.randint(1000,65535)}) IDLE",
    lambda: f"OSPF neighbor {rand_ip()} adjacency lost on {rand_intf()}",
    lambda: f"ISIS adjacency down: neighbor {rand_ip()} unreachable",
    lambda: f"MPLS LDP session to {rand_ip()} terminated",
    lambda: f"Route flap detected: {rand_ip()}/{random.randint(16,32)} withdrawn",
    # Power / Environmental
    lambda: f"Power supply {random.randint(1,2)} failed on {rand_hostname()}",
    lambda: f"UPS battery low: {random.randint(5,20)}% remaining on {rand_hostname()}",
    lambda: f"Fan tray {random.randint(1,4)} failure detected",
    lambda: f"Temperature threshold exceeded: {random.randint(70,90)}°C on {rand_hostname()}",
    lambda: f"Chassis temperature critical: {random.randint(85,100)}°C",
    lambda: f"Power module {random.randint(0,3)} removed from slot",
    # SFP / Optics
    lambda: f"SFP removed from interface {rand_intf()}",
    lambda: f"Optical module not present in {rand_intf()}",
    lambda: f"SFP DDM alarm: Tx power low on {rand_intf()}: {random.uniform(-10,-5):.1f}dBm",
    lambda: f"SFP DDM alarm: Temperature high {rand_intf()}: {random.randint(75,90)}°C",
    lambda: f"Unsupported SFP detected in {rand_intf()}",
    lambda: f"Optic transceiver failure on {rand_intf()}",
    # Hardware
    lambda: f"Linecard {random.randint(0,7)} OIR: removed from slot {random.randint(0,15)}",
    lambda: f"DRAM parity error on module {random.randint(0,3)}",
    lambda: f"FIB hardware error: TCAM full on {rand_hostname()}",
    lambda: f"Fabric card failure detected in slot {random.randint(1,4)}",
    lambda: f"Hardware watchdog timer expired on {rand_hostname()}",
    lambda: f"NMI received — hardware fault on {rand_hostname()}",
    # Security
    lambda: f"ACL violation: {random.randint(100,9999)} packets dropped from {rand_ip()}",
    lambda: f"Port security violation on {rand_cisco_intf()}: {random.randint(1,100)} mac flaps",
    lambda: f"SSH brute force detected: {random.randint(10,500)} attempts from {rand_ip()}",
    lambda: f"RADIUS authentication failure for user admin from {rand_ip()}",
    lambda: f"AAA accounting failure: {rand_hostname()} cannot reach server {rand_ip()}",
    # Spanning Tree / L2
    lambda: f"STP topology change detected on {rand_cisco_intf()}",
    lambda: f"BPDU guard triggered: port {rand_cisco_intf()} in err-disabled state",
    lambda: f"MAC address table full on {rand_hostname()}",
    lambda: f"VLAN {random.randint(1,4094)} added to trunk {rand_cisco_intf()}",
    # NTP / Time
    lambda: f"NTP server {rand_ip()} unreachable, clock drift: {random.randint(100,999)}ms",
    lambda: f"PTP clock out of sync: offset {random.randint(100,5000)}ns on {rand_hostname()}",
    # System
    lambda: f"System reboot initiated: scheduled maintenance on {rand_hostname()}",
    lambda: f"Configuration rollback triggered on {rand_hostname()}",
    lambda: f"Syslog server {rand_ip()} unreachable, buffering locally",
    lambda: f"SNMP community string mismatch from {rand_ip()}",
    lambda: f"License expiry warning: {random.randint(1,30)} days remaining on {rand_hostname()}",
    lambda: f"Process {random.choice(['bgpd','ospfd','ldpd','isisd'])} crashed and restarted",
    lambda: f"Core dump generated: {random.choice(['kernel','ios'])} on {rand_hostname()}",
    lambda: f"Packet loss detected: {random.randint(5,30)}% loss to {rand_ip()}",
    lambda: f"ICMP unreachable from {rand_ip()} for destination {rand_ip()}",
    lambda: f"QoS queue drops: {random.randint(100,10000)} packets dropped in class {random.choice(['voice','video','data'])}",
]


def generate_dataset(n_per_class=400):
    """
    Generate a balanced dataset with n_per_class samples per category.
    Total = n_per_class * 3 (LINK_DOWN, LINK_UP, UNKNOWN)
    """
    data = []

    for _ in range(n_per_class):
        data.append({
            "raw_text": random.choice(LINK_DOWN_TEMPLATES)(),
            "label": "LINK_DOWN",
            "label_id": 0
        })

    for _ in range(n_per_class):
        data.append({
            "raw_text": random.choice(LINK_UP_TEMPLATES)(),
            "label": "LINK_UP",
            "label_id": 1
        })

    for _ in range(n_per_class):
        data.append({
            "raw_text": random.choice(UNKNOWN_TEMPLATES)(),
            "label": "UNKNOWN",
            "label_id": 2
        })

    random.shuffle(data)
    return pd.DataFrame(data)


df = generate_dataset(n_per_class=800)
print(f"✅ Dataset generated: {len(df)} total samples")
print(df["label"].value_counts())
print("\nSample LINK_DOWN:", df[df.label=="LINK_DOWN"]["raw_text"].iloc[0])
print("Sample LINK_UP  :", df[df.label=="LINK_UP"]["raw_text"].iloc[0])
print("Sample UNKNOWN  :", df[df.label=="UNKNOWN"]["raw_text"].iloc[0])



"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — PREPROCESSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHY PREPROCESS?

Transformer models are powerful, but they work best when:
  1. Dynamic "noise" tokens (IPs, interface names, hostnames) are NORMALIZED.
     These add variance without adding semantic meaning.
     "Gig0/1 is down" and "Gig3/47 is down" mean the SAME THING.
  2. The vocabulary is consistent across logs from different vendors.

We replace specific tokens with semantic PLACEHOLDERS:
    <IP>    — any IP address
    <INTF>  — any interface name
    <HOST>  — any hostname pattern
    <NUM>   — any standalone number
    <TEMP>  — temperature values
    <PCT>   — percentage values

This dramatically reduces embedding variance for semantically identical alarms.
"""

def preprocess(text: str) -> str:
    """
    Normalize a raw alarm/syslog message for embedding.

    Steps:
      1. Lowercase
      2. Replace IP addresses → <IP>
      3. Replace temperature values → <TEMP>
      4. Replace percentage values → <PCT>
      5. Normalize interface names → <INTF>
      6. Normalize hostnames → <HOST>
      7. Remove timestamps and Cisco log prefixes
      8. Replace standalone numbers → <NUM>
      9. Strip punctuation noise / collapse whitespace
    """
    t = text.lower()

    # Step 1 — Remove Cisco syslog prefix  e.g.  %LINEPROTO-5-UPDOWN:
    t = re.sub(r'%[A-Z_\-\d]+-\d+-[A-Z_]+:\s*', '', t)

    # Step 2 — Replace IPv4 addresses
    t = re.sub(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', '<IP>', t)

    # Step 3 — Temperature  e.g.  85°C, 85 C
    t = re.sub(r'\d+[\s]?°?\s?c\b', '<TEMP>', t)

    # Step 4 — Percentage  e.g.  95%, 95 %
    t = re.sub(r'\d+[\s]?%', '<PCT>', t)

    # Step 5 — Normalize interface names
    intf_patterns = [
        r'\bge-\d+/\d+/\d+\b',          # Juniper GE
        r'\bxe-\d+/\d+/\d+\b',          # Juniper XE
        r'\bet-\d+/\d+/\d+\b',          # Juniper ET
        r'\bfe-\d+/\d+/\d+\b',          # Juniper FE
        r'\bgigabitethernet\d+/\d+\b',  # Cisco long
        r'\bfastethernet\d+/\d+\b',
        r'\btengige\d+/\d+\b',
        r'\bhundredgige\d+/\d+\b',
        r'\bgig\d+/\d+\b',
        r'\bfa\d+/\d+\b',
        r'\bte\d+/\d+\b',
        r'\bhu\d+/\d+\b',
        r'\beth\d+/\d+\b',
        r'\b(ge|xe|100ge|xge|eth-trunk|loopback)\d+(/\d+)*/?\d*\b',  # Huawei
        r'\beth\d+\b',                  # Linux style
        r'\bport\s+\d+\b',             # Generic "port 3"
        r'\bslot\s+\d+\b',
    ]
    for pat in intf_patterns:
        t = re.sub(pat, '<INTF>', t, flags=re.IGNORECASE)

    # Step 6 — Normalize hostnames (RTR-MUM-01 style, or fxp0)
    t = re.sub(r'\b(rtr|sw|pe|ce|bng|agg|core|dist|acc)-[a-z]{2,4}-\d+\b', '<HOST>', t, flags=re.IGNORECASE)
    t = re.sub(r'\bfxp\d+\b', '<INTF>', t)

    # Step 7 — Remove OIDs, ifIndex, log timestamps
    t = re.sub(r'\boid=[\d.]+\b', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\bifindex\s*=?\s*\d+\b', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\b\d{1,2}:\d{2}:\d{2}\b', '', t)  # timestamps HH:MM:SS

    # Step 8 — Remove AS numbers, ifIndex residues
    t = re.sub(r'\bas\s+\d+\b', '', t, flags=re.IGNORECASE)

    # Step 9 — Replace remaining standalone numbers with <NUM>
    t = re.sub(r'\b\d+\b', '<NUM>', t)

    # Step 10 — Remove or collapse noise punctuation
    t = re.sub(r'[=<>(){}\[\]|@#$\\]', ' ', t)
    t = re.sub(r'[_\-]+', ' ', t)       # underscores/dashes → space
    t = re.sub(r'\s+', ' ', t).strip()  # collapse multiple spaces

    return t


# Apply preprocessing
df["processed_text"] = df["raw_text"].apply(preprocess)

print("✅ Preprocessing complete.\n")
print("Before:", df["raw_text"].iloc[0])
print("After :", df["processed_text"].iloc[0])
print()
print("Before:", df["raw_text"].iloc[400])
print("After :", df["processed_text"].iloc[400])
print()
print("Before:", df["raw_text"].iloc[800])
print("After :", df["processed_text"].iloc[800])



#df.head(10)
from sklearn.model_selection import train_test_split

train_df, test_df = train_test_split(
    df,
    test_size = 0.2,
    random_state= 42,
    stratify=df['label_id']
)
print(len(train_df))
print(len(test_df))

print(train_df.value_counts())
print(test_df.value_counts())



from transformers import DistilBertTokenizerFast

tokenizier = DistilBertTokenizerFast.from_pretrained(
    'distilbert-base-uncased'
)

### Now to generate train and test encodings'
train_encodings = tokenizier(
    train_df['processed_text'].tolist(), ## tokenzier only accepts list not pandas series
    truncation = True, ## Terminate long messages only consider max what is given
    padding = True, ## makes sure the items in the list are equal lenght
    max_length = 64 ## maximum number of tokens per list
)
test_encodings = tokenizier(
    test_df['processed_text'].tolist(),
    truncation = True,
    padding = True,
    max_length = 64
)



### Need to create the PyTorch Data Set Class ###

import torch

class AlarmDataSet(torch.utils.data.Dataset):

  def __init__(self, encodings, labels):
    self.encodings = encodings
    self.labels = labels

  def __getitem__(self, index):
      items = {
          key : torch.tensor(value[index])
          for key, value in self.encodings.items()
      }
      items['labels'] = torch.tensor(self.labels[index])
      return items

  def __len__(self):
    return len(self.labels)

train_dataset = AlarmDataSet(
    train_encodings,
    train_df['label_id'].tolist()
)
test_dataset = AlarmDataSet(
    test_encodings,
    test_df['label_id'].tolist()
)
print("Train Dataset", train_dataset[0])
print("Test Dataset", test_dataset[0])



from transformers import DistilBertForSequenceClassification
model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels = 3
)



from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir= './results', ## Output Directory as of now,
    num_train_epochs= 5, ### The model will see the data set only 5 times
    per_device_train_batch_size= 16, ### Trains 16 alarms at once not one by one
    per_device_eval_batch_size= 16,
    learning_rate=2e-5,
    eval_strategy= "epoch",
    save_strategy= "epoch",
    logging_steps= 10,
    weight_decay= 0.01
)


from transformers import Trainer
trainer = Trainer(
    model = model,
    args = training_args,
    train_dataset = train_dataset,
    eval_dataset = test_dataset
)
trainer.train()



from transformers import pipeline

# classifier = pipeline(
#     "text-classification",
#     model = model,
#     tokenizer = tokenizier
# )
classifier = pipeline(
    "text-classification",
    model=model,
    tokenizer=tokenizier,
    return_all_scores=True
)


test_alarm = "Physical interface ge-0/0/1 lost carrier"
processed = preprocess(test_alarm)
print(processed)
result = classifier(processed)
print(result)



id_to_label = {

    0: "LINK_DOWN",

    1: "LINK_UP",

    2: "UNKNOWN"
}
tests = [

    "uplink went dead on xe-0/0/1",

    "bgp peer lost due to interface failure",

    "ethernet carrier restored",

    "temperature critical on linecard",

    "random daemon crashed unexpectedly",

    "port flapping detected",

    "fiber rx loss detected",

    "interface recovered from down state"
]

for t in tests:

    processed = preprocess(t)

    result = classifier(processed)

    predicted_index = int(
        result[0]["label"].split("_")[-1]
    )

    print()

    print("RAW:", t)

    print("PROCESSED:", processed)

    print("PREDICTED:",id_to_label[predicted_index])

    print(
        "CONFIDENCE:",
        result[0]["score"]
    )



    # from sklearn.metrics import confusion_matrix
# cm =
import numpy as np

y_pred = np.argmax(
    predictions.predictions,
    axis=1
)

y_true = predictions.label_ids


from sklearn.metrics import confusion_matrix

cm = confusion_matrix(
    y_true,
    y_pred
)

print(cm)



from sklearn.metrics import classification_report

print(
    classification_report(
        y_true,
        y_pred,
        target_names=[
            "LINK_DOWN",
            "LINK_UP",
            "UNKNOWN"
        ]
    )
)



CONFIDENCE_THRESHOLD = 0.90

def predict_alarm(text):

    processed = preprocess(text)

    scores = classifier(processed)

    best = max(
        scores,
        key=lambda x: x["score"]
    )

    predicted_index = int(
        best["label"].split("_")[-1]
    )

    predicted_label = id_to_label[predicted_index]

    confidence = best["score"]

    if confidence < CONFIDENCE_THRESHOLD:

        predicted_label = "UNKNOWN"

    return {
        "raw_text": text,
        "processed_text": processed,
        "prediction": predicted_label,
        "confidence": confidence,
        "all_scores": scores
    }


    tests = [
    "banana ethernet quantum toaster",
    "uplink restored successfully",
    "carrier lost on xe-0/0/1",
    "random bgp process instability",
    "signal resumed on interface",
    "unrecognized hardware anomaly",
    "port recovered after outage"
]

for t in tests:
    result = predict_alarm(t)
    print()
    print(result)


    def test_alarm(alarm_text):

    processed = preprocess(alarm_text)
    results = classifier(processed)
    best = max(
        results,
        key=lambda x: x["score"]
    )
    predicted_index = int(
        best["label"].split("_")[-1]
    )
    predicted_label = id_to_label[predicted_index]
    confidence = best["score"]
    print("\n==============================")
    print("RAW TEXT:")
    print(alarm_text)
    print("\nPROCESSED:")
    print(processed)
    print("\nPREDICTION:")
    print(predicted_label)
    print("\nCONFIDENCE:")
    print(round(confidence, 4))
    print("\nALL SCORES:")
    print(results)
    print("==============================")


test_alarm(
    "Link Down"
)


model.save_pretrained("./nms_alarm_classifier")
tokenizier.save_pretrained("./nms_alarm_classifier")