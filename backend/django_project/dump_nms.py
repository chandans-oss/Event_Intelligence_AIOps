import json
import pandas as pd
df = pd.read_excel(r'd:\Rnd files\event-analytics-main\backend\django_project\rca_source_backend\data\Network_Congestion.xlsx', 'NMS_Trigger_Events')
print(json.dumps(df.to_dict('records'), indent=2))
