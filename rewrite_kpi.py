import re
import os

filepath = 'src/features/analytics/pages/KpiDashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove 'uppercase' as class or textTransform
content = re.sub(r'\buppercase\b\s*', '', content)
content = re.sub(r'textTransform:\s*[\'"]uppercase[\'"],?', '', content)

# Specific strings replacements
reps = {
    "'EVENTS PROCESSED'": "'Events Processed'",
    "'NOISE REDUCED'": "'Noise Reduced'",
    "'ACTIVE INCIDENTS'": "'Active Incidents'",
    "'MTTR'": "'Mttr'",
    "'AUTO-REMEDIATED'": "'Auto-Remediated'",
    "'SLA COMPLIANCE'": "'Sla Compliance'",
    "'INGEST'": "'Ingest'",
    "'NORMALIZE'": "'Normalize'",
    "'DEDUPLICATE'": "'Deduplicate'",
    "'SUPPRESS'": "'Suppress'",
    "'CORRELATE'": "'Correlate'",
    "'RCA'": "'Rca'",
    "'IMPACT'": "'Impact'",
    "'REMEDIATE'": "'Remediate'",
    "KPI Dashboard": "Kpi Dashboard",
    "LIVE •": "Live •",
}

for k, v in reps.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement complete.")
