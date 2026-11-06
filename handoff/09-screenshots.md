# 09 — Visual Asset & Screenshot Index

> **Storage Location:** All verified screenshots are saved in `gym-app/test_screenshots/` and the conversation artifacts directory.

---

## 1. Verified Screenshot Inventory Matrix

| Screen / View Name | Viewport | Theme | Key Visual Assertions Captured | File Reference Link |
|:---|:---:|:---:|:---|:---|
| **FiTusion Landing Hero** | Desktop (1440×900) | Dark | Syne 800 display headline, volumetric cone bloom behind athlete cutout, floating metric pills. | [home_hero_1440x900_dark.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/home_hero_1440x900_dark.png) |
| **FiTusion Landing Hero** | Desktop (1440×900) | Light | Morning sunbeam warm diffusion, crisp dark forest headings, emerald accents. | [home_hero_1440x900_light.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/home_hero_1440x900_light.png) |
| **Landing Full Experience** | Desktop (1440×900) | Dark | Complete vertical scroll: Hero, Sponsor Marquee, Inspired Grid, Category Tabs, Course Cards. | [home_page_full_dark.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/home_page_full_dark.png) |
| **Landing Mobile** | Mobile (390×844) | Dark | Clean mobile stacking, zero horizontal overflow, touch-target navigation bar. | [home_mobile_390x844_dark.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/home_mobile_390x844_dark.png) |
| **VIP Auth & Demo Modal** | Desktop (1440×900) | Dark | Frosted backdrop blur, Instant Demo Lifter bypass button, scrypt login form. | [landing_auth_modal.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/landing_auth_modal.png) |
| **Dashboard Command Center**| Desktop (1440×900) | Dark | SVG Macro Rings, animated Hydration wave gauge, Today's workout preview card, Sidebar nav. | [after_dashboard_1440x900_dark.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/after_dashboard_1440x900_dark.png) |
| **Dashboard Command Center**| Desktop (1440×900) | Light | Crisp porcelain cards, emerald donut strokes, dark forest typography. | [after_dashboard_1440x900_light.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/after_dashboard_1440x900_light.png) |
| **Dashboard Tablet** | Tablet (768×1024) | Dark | Responsive sidebar collapse, 2-column metric layout, touch-friendly set buttons. | [after_dashboard_768x1024_dark.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/after_dashboard_768x1024_dark.png) |
| **Dashboard Tablet** | Tablet (768×1024) | Light | High-contrast readability, clean tablet layout. | [after_dashboard_768x1024_light.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/after_dashboard_768x1024_light.png) |
| **Dashboard Mobile** | Mobile (390×844) | Dark | Mobile bottom navigation tabs, stacked macro widgets, quick-add water drawer. | [after_dashboard_390x844_dark.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/after_dashboard_390x844_dark.png) |
| **Dashboard Mobile** | Mobile (390×844) | Light | Light theme mobile rendering. | [after_dashboard_390x844_light.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/after_dashboard_390x844_light.png) |
| **Offline PWA Banner** | Desktop (1440×900) | Dark | Amber offline status indicator: "Operating Offline — Cached State Active". | [after_dashboard_offline.png](file:///C:/Users/harsh/.gemini/antigravity/brain/0305ca67-13ca-4c12-89d6-28dd966c99ee/after_dashboard_offline.png) |
| **#view-food-log** | Desktop & Mobile | Dark | Categorized meal slots, calorie breakdown bars, barcode button. | [view_food-log_full.png](file:///c:/Users/harsh/OneDrive/Downloads/demo%20for%20incubation/New%20folder/gym-app/test_screenshots/view_food-log_full.png) |
| **#view-exercise-library** | Desktop & Mobile | Dark | Muscle filter chips, 120+ exercise cards, equipment badges. | [view_exercise-library_full.png](file:///c:/Users/harsh/OneDrive/Downloads/demo%20for%20incubation/New%20folder/gym-app/test_screenshots/view_exercise-library_full.png) |
| **#view-tracking** | Desktop & Mobile | Dark | Live set logging table, RPE selector, dynamic 1RM PR alerts. | [view_tracking_full.png](file:///c:/Users/harsh/OneDrive/Downloads/demo%20for%20incubation/New%20folder/gym-app/test_screenshots/view_tracking_full.png) |
| **#view-ai-coach** | Desktop & Mobile | Dark | Conversational chat interface, suggestion chips, AI response bubbles. | [view_ai-coach_full.png](file:///c:/Users/harsh/OneDrive/Downloads/demo%20for%20incubation/New%20folder/gym-app/test_screenshots/view_ai-coach_full.png) |
| **#view-posture** | Desktop & Mobile | Dark | MediaPipe camera feed viewport, skeletal landmark overlay canvas. | [view_posture_full.png](file:///c:/Users/harsh/OneDrive/Downloads/demo%20for%20incubation/New%20folder/gym-app/test_screenshots/view_posture_full.png) |
| **#view-body-analysis** | Desktop & Mobile | Dark | 3D body silhouette, Navy formula inputs, WHR health risk meter. | [view_body-analysis_full.png](file:///c:/Users/harsh/OneDrive/Downloads/demo%20for%20incubation/New%20folder/gym-app/test_screenshots/view_body-analysis_full.png) |

---

## 2. Directory Structure of Assets

```
gym-app/
├── public/images/
│   ├── fitusion_exact/
│   │   ├── athlete_hero.png (High-res cutout for landing hero)
│   │   ├── athlete_inspire.png (Secondary hero athlete)
│   │   ├── avatars_proof.png (Social proof stack)
│   │   ├── course_barbell.jpg
│   │   ├── course_kettlebell.jpg
│   │   └── course_cardio.jpg
│   └── fitfuel-ai-logo.svg
└── test_screenshots/ (Full test suite audit visual logs)
```
