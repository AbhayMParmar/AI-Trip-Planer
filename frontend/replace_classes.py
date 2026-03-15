import os

target_dir = r"d:\Advances AI Trip Planer\frontend\src"
class_replacements = {
    "text-[#F5B999]": "text-olive-500",
    "bg-[#F5B999]": "bg-olive-500",
    "border-[#F5B999]": "border-olive-500",
    "ring-[#F5B999]": "ring-olive-500",
    "text-[#848D35]": "text-olive-500",
    "bg-[#848D35]": "bg-olive-500",
    "border-[#848D35]": "border-olive-500",
    "from-[#F5B999]": "from-olive-500",
    "to-[#F5B999]": "to-olive-500",
    "via-[#F5B999]": "via-olive-500",
    "from-orange-500": "from-olive-500",
    "to-orange-500": "to-olive-500",
    "text-orange-600": "text-olive-600",
    "bg-orange-600": "bg-olive-600",
    "bg-orange-50": "bg-olive-50",
    "text-orange-500": "text-olive-500",
    "text-orange-400": "text-olive-400",
    "border-orange-100": "border-olive-100",
    "bg-orange-100": "bg-olive-100"
}

def replace_classes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in class_replacements.items():
        new_content = new_content.replace(old, new)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated classes in: {file_path}")

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css')):
            replace_classes(os.path.join(root, file))
