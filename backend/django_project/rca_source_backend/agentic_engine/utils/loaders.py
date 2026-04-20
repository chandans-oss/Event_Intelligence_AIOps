import yaml

def load_intents(file_path):
    with open(file_path, 'r') as f:
        data = yaml.safe_load(f)
        return data.get('intents', data)

def load_situation(file_path):
    with open(file_path, 'r') as f:
        data = yaml.safe_load(f)
        return data.get('situation_template', data)
