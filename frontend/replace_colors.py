import os
import re

target_dir = r"d:\Advances AI Trip Planer\frontend\src"
replacements = {
    r"#F5B999": "#556B2F",
    r"#f5b999": "#556B2F",
    r"#848D35": "#556B2F",
    r"#848d35": "#556B2F",
    r"245, 185, 153": "85, 107, 47",
    r"132, 141, 53": "85, 107, 47"
}

def replace_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = re.sub(old, new, new_content, flags=re.IGNORECASE)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {file_path}")

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css', '.html')):
            replace_in_file(os.path.join(root, file))
