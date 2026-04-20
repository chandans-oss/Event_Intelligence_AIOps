import os

file_path = "d:/Rnd files/event-analytics-main/src/data/trainingReports.ts"
if os.path.exists(file_path):
    with open(file_path, "rb") as f:
        content = f.read()
    
    # Try to decode as UTF-8
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        # If it fails, try Latin-1
        text = content.decode("latin-1")
    
    # Replace the mangled box-drawing characters
    # These are common patterns from Latin-1 vs UTF-8 mismatches
    replacements = {
        "â”": "-",
        "â€”": "--",
        "â†“": "v",
        "â†‘": "^",
        "â†’": "->",
        "â–ˆ": "#",
        "â–„": "=",
        "Â·": ".",
        "â—": "o",
        "SECTION 1 â€”": "SECTION 1 ---",
        "SECTION 2 â€”": "SECTION 2 ---",
        "SECTION 3 â€”": "SECTION 3 ---",
        # Add more if needed
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
        
    # Write back as UTF-8 without BOM
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Cleaned up {file_path}")
else:
    print(f"File not found: {file_path}")
