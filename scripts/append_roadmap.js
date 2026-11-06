const fs = require('fs');

const roadmapText = `

---

## 7. Product Decisions & Commercial Roadmap (from /grill-me Alignment)

Following our interactive architectural alignment, the platform direction is structured as follows:

\`\`\`mermaid
flowchart TD
    User([User Sign-In / Demo Access]) --> RBAC{Unified RBAC Check}
    RBAC -->|Lifter Role| LifterPortal[Lifter Portal: Workouts, Macros, AI Coach]
    RBAC -->|Trainer Role| TrainerPortal[Trainer Portal: Client Rosters and Video Reviews]
    RBAC -->|Facility Admin| AdminPortal[Facility Portal: Turnstile QR, Crowd Heatmap, Issues]

    LifterPortal --> Billing[Stripe Checkout and Customer Portal]
    Billing -->|Free Tier| Core[Free Workout and Macro Logging]
    Billing -->|Pro Tier \\$9.99/mo| Pro[AI Coach, 3D Scans, Form Checker, AI Meal Scanner]
    Billing -->|Trainer Tier \\$29.99/mo| TrainerPro[Up to 15 Clients and Compliance Dashboard]
    Billing -->|Facility Tier \\$99+/mo| FacilityPro[Turnstile QR Engine and Live Crowd Heatmaps]

    Pro --> GeminiVision[Gemini 2.0 Flash Vision: Meal Photo Scanner]
    GeminiVision --> FoodLog[1-Click Food Log Sync with P/C/F/Kcal]
\`\`\`

### 1. Hybrid B2C & B2B Operating Model
- **Unified Account Hierarchy:** A single login allows users to transition between Lifter mode, Trainer client management, and Facility management based on their purchased tier.

### 2. Tiered Monetization Matrix
- **Core Free:** Full workout logging, 120+ exercise library, manual macro logging, hydration tracking.
- **Pro Lifter (\\$9.99/mo):** AI Coach interactive chat, 3D body composition mesh, MediaPipe camera posture feedback, and the new **Gemini 2.0 Flash Meal Photo Scanner**.
- **Coach / Trainer (\\$29.99/mo):** Manage up to 15 client profiles, asynchronous video form reviews, and nutrition compliance heatmaps.
- **Commercial Facility (\\$99+/mo):** Turnstile QR code verification gateway, live floor crowd density heatmap, and equipment issue ticketing.

### 3. AI Meal Photo Scanner Architecture
- **Endpoint:** \`POST /api/ai/analyze-meal\`
- **Flow:** User captures or uploads a meal photo via camera; client compresses image to WebP; server forwards to **Gemini 2.0 Flash Vision** with a strict JSON schema:
\`\`\`json
{
  "meal_name": "Grilled Chicken Breast with Jasmine Rice & Broccoli",
  "total_calories": 520,
  "protein_g": 48,
  "carbs_g": 55,
  "fat_g": 8,
  "confidence": 0.94,
  "items": [
    { "item": "Chicken Breast", "estimated_weight_g": 180, "calories": 297, "protein": 45, "carbs": 0, "fat": 6 },
    { "item": "Jasmine Rice", "estimated_weight_g": 150, "calories": 195, "protein": 4, "carbs": 43, "fat": 0.5 },
    { "item": "Steamed Broccoli", "estimated_weight_g": 85, "calories": 28, "protein": 2.5, "carbs": 5.5, "fat": 0.3 }
  ]
}
\`\`\`
- **Action:** User reviews the breakdown and commits it to their food log with a single tap.
`;

const p1 = 'gym-app/FITFUEL_COMPREHENSIVE_GUIDE.md';
const p2 = 'FITFUEL_COMPREHENSIVE_GUIDE.md';

fs.appendFileSync(p1, roadmapText, 'utf8');
fs.appendFileSync(p2, roadmapText, 'utf8');
console.log('Appended roadmap successfully!');
