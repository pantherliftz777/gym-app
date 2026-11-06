import os
from PIL import Image

src_path = r"C:\Users\harsh\.gemini\antigravity\brain\0305ca67-13ca-4c12-89d6-28dd966c99ee\.user_uploaded\media_1793986146980_4b86c6bc.png"
img = Image.open(src_path)
print("Image size:", img.size, img.mode)
