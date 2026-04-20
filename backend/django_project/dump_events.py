import json
import pandas as pd
df = pd.read_excel(r'd:\Rnd files\event-analytics-main\backend\django_project\rca_source_backend\data\Network_Congestion.xlsx', 'Events')
events = df.to_dict('records')
with open(r'd:\Rnd files\event-analytics-main\backend\django_project\dumped_events2.json', 'w') as f:
    json.dump(events, f, indent=2)
