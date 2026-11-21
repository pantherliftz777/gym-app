import os
import numpy as np
from PIL import Image

src_path = r"E:\generated-composite-preview.png"
if not os.path.exists(src_path):
    src_path = r"C:\Users\harsh\.gemini\antigravity\brain\0305ca67-13ca-4c12-89d6-28dd966c99ee\.user_uploaded\media_1793986146980_4b86c6bc.png"

img = Image.open(src_path).convert("RGBA")
W, H = img.size
print(f"Loaded {src_path}: {W}x{H}")

out_dir = r"C:\Users\harsh\OneDrive\Downloads\demo for incubation\New folder\gym-app\public\images\cutouts"
os.makedirs(out_dir, exist_ok=True)

# Function to remove white background cleanly
def make_transparent(crop_img, threshold=240):
    data = np.array(crop_img)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    # Mask where pixel is very light (white background)
    mask = (r > threshold) & (g > threshold) & (b > threshold)
    data[:,:,3][mask] = 0
    # Soft edge feathering for near-white
    edge_mask = (r > threshold - 20) & (g > threshold - 20) & (b > threshold - 20) & (~mask)
    # Lower opacity for edge
    # Keep crisp
    return Image.fromarray(data, "RGBA")

# Let's crop key items:
# Row 1 (Athletes): Y from ~0 to ~240 in 1024 height (or ~0.24 * H)
# There are 6 athletes:
# 1: Male standing front (X: 0 to 0.17 * W)
# 2: Male standing side (X: 0.17 to 0.33 * W)
# 3: Male double biceps (X: 0.33 to 0.50 * W)
# 4: Female athletic pose (X: 0.50 to 0.67 * W)
# 5: Female shaker (X: 0.67 to 0.82 * W)
# 6: Male with lime accents (X: 0.82 to 1.0 * W)

crops = {
    # Main Hero Athletes
    "hero_athlete_front": (int(0.05 * W), int(0.01 * H), int(0.18 * W), int(0.35 * H)),
    "hero_athlete_lime": (int(0.81 * W), int(0.01 * H), int(0.95 * W), int(0.35 * H)),
    "hero_athlete_biceps": (int(0.34 * W), int(0.01 * H), int(0.49 * W), int(0.35 * H)),
    "female_athlete_pose": (int(0.50 * W), int(0.01 * H), int(0.65 * W), int(0.35 * H)),
    "female_athlete_shaker": (int(0.66 * W), int(0.01 * H), int(0.79 * W), int(0.35 * H)),

    # Exercises (Row 2)
    "exercise_squat": (int(0.00 * W), int(0.36 * H), int(0.12 * W), int(0.56 * H)),
    "exercise_squat_female": (int(0.12 * W), int(0.36 * H), int(0.22 * W), int(0.56 * H)),
    "exercise_deadlift": (int(0.21 * W), int(0.36 * H), int(0.35 * W), int(0.56 * H)),
    "exercise_bench": (int(0.35 * W), int(0.37 * H), int(0.52 * W), int(0.56 * H)),
    "exercise_overhead_press": (int(0.51 * W), int(0.36 * H), int(0.66 * W), int(0.56 * H)),
    "exercise_pullup": (int(0.66 * W), int(0.36 * H), int(0.83 * W), int(0.56 * H)),
    "exercise_kettlebell": (int(0.83 * W), int(0.36 * H), int(0.99 * W), int(0.56 * H)),

    # Activities & Roles (Row 3)
    "activity_boxing": (int(0.02 * W), int(0.57 * H), int(0.13 * W), int(0.79 * H)),
    "activity_sprint": (int(0.13 * W), int(0.60 * H), int(0.25 * W), int(0.79 * H)),
    "activity_yoga": (int(0.25 * W), int(0.57 * H), int(0.41 * W), int(0.79 * H)),
    "activity_bike": (int(0.40 * W), int(0.57 * H), int(0.54 * W), int(0.79 * H)),
    "role_coach_tablet": (int(0.54 * W), int(0.57 * H), int(0.67 * W), int(0.79 * H)),
    "role_facility_turnstile": (int(0.67 * W), int(0.57 * H), int(0.81 * W), int(0.79 * H)),
    "lifter_resting_phone": (int(0.81 * W), int(0.57 * H), int(0.97 * W), int(0.79 * H)),

    # Nutrition & Gear (Row 4)
    "meal_prep_container": (int(0.00 * W), int(0.82 * H), int(0.16 * W), int(0.99 * H)),
    "athlete_hydration": (int(0.15 * W), int(0.81 * H), int(0.28 * W), int(0.99 * H)),
    "female_athlete_towel": (int(0.27 * W), int(0.81 * H), int(0.38 * W), int(0.99 * H)),
    "athlete_tying_shoes": (int(0.38 * W), int(0.81 * H), int(0.48 * W), int(0.99 * H)),
    "gear_barbell": (int(0.47 * W), int(0.83 * H), int(0.62 * W), int(0.99 * H)),
    "gear_dumbbells": (int(0.61 * W), int(0.83 * H), int(0.72 * W), int(0.99 * H)),
    "gear_kettlebell": (int(0.71 * W), int(0.83 * H), int(0.79 * W), int(0.99 * H)),
    "gear_shaker": (int(0.79 * W), int(0.83 * H), int(0.85 * W), int(0.99 * H)),
    "gear_smartphone": (int(0.85 * W), int(0.83 * H), int(0.91 * W), int(0.99 * H)),
    "gear_smartwatch": (int(0.91 * W), int(0.83 * H), int(0.99 * W), int(0.99 * H)),
}

for name, bbox in crops.items():
    cropped = img.crop(bbox)
    # Trim excessive white borders
    trans = make_transparent(cropped, threshold=242)
    # Get bounding box of non-zero alpha
    bbox_alpha = trans.getbbox()
    if bbox_alpha:
        trans = trans.crop(bbox_alpha)
    save_path = os.path.join(out_dir, f"{name}.png")
    trans.save(save_path, "PNG")
    print(f"Saved: {save_path} ({trans.size})")

print("All cutouts successfully extracted!")
