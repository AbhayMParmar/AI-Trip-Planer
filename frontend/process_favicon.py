import os
import glob
from PIL import Image

def process_latest_premium_logo():
    # Use glob to find the new premium logo
    session_dir = "C:\\Users\\DELL\\.gemini\\antigravity\\brain\\11c86595-56ce-4073-a5cb-deb07ba8d288"
    search_pattern = os.path.join(session_dir, "tripnova_new_logo_option1*.png")
    
    files = glob.glob(search_pattern)
    if not files:
        print("Premium logo not found in session artifacts.")
        return
    
    latest_file = max(files, key=os.path.getmtime)
    output_path = "d:/Advances AI Trip Planer/frontend/public/favicon.png"
    
    print(f"Processing: {latest_file}")
    
    img = Image.open(latest_file).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    # Key out black or dark pixels with a slightly higher threshold
    for item in data:
        sum_rgb = item[0] + item[1] + item[2]
        if sum_rgb < 90: # If it's very dark (black background)
            new_data.append((0, 0, 0, 0)) # Fully transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Auto-crop the transparent area
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Success! Premium Favicon saved to: {output_path}")

if __name__ == "__main__":
    process_latest_premium_logo()
