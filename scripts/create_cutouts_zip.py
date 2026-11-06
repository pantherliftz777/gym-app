import os
import zipfile
from pathlib import Path

cutouts_dir = Path(r"C:\Users\harsh\OneDrive\Downloads\demo for incubation\New folder\gym-app\public\images\cutouts")
out_zips = [
    Path(r"C:\Users\harsh\OneDrive\Downloads\demo for incubation\New folder\fitusion-cutouts.zip"),
    Path(r"E:\fitusion-cutouts.zip")
]

for out_zip in out_zips:
    try:
        with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for f in cutouts_dir.glob("*.png"):
                zf.write(f, f.name)
        print(f"Created zip archive: {out_zip} ({os.path.getsize(out_zip)} bytes)")
    except Exception as e:
        print(f"Could not write to {out_zip}: {e}")
