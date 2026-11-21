# 05b — Feature Spec: Nutrition & Macronutrient Engine

> **Status:** LIVE  
> **Source Files & Citations:**  
> - Algorithms: `gym-app/public/algo.js` (Lines 1–65)  
> - UI View: `gym-app/public/dashboard.html` (`#view-food-log`, Lines 430–740)  
> - Frontend Logic: `gym-app/public/fitfuel.js` (Lines 1420–2100)  
> - Barcode Module: `gym-app/public/modules/barcode-scanner.js` (Lines 1–95)  
> - Server Endpoints: `server.js` (Lines 735–745)  

---

## 1. Scientific Energy & Macro Algorithms (`algo.js`)

FitFuel replaces generic calorie counters with peer-reviewed sports nutrition formulas:

### A. Mifflin-St Jeor BMR Equation (`algo.js:1–18`)
$$\text{BMR}_{\text{male}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{yr}}) + 5$$
$$\text{BMR}_{\text{female}} = (10 \times \text{weight}_{\text{kg}}) + (6.25 \times \text{height}_{\text{cm}}) - (5 \times \text{age}_{\text{yr}}) - 161$$

### B. Total Daily Energy Expenditure (TDEE) Multipliers (`algo.js:20–32`)
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$

| Activity Level | Multiplier | Description in Code |
|:---|:---:|:---|
| **Sedentary** | `1.200` | Little or no exercise, desk job |
| **Lightly Active** | `1.375` | 1–3 days/week light training |
| **Moderately Active** | `1.550` | 3–5 days/week moderate lifting/cardio |
| **Very Active** | `1.725` | 6–7 days/week hard training |
| **Extremely Active** | `1.900` | Twice daily training or heavy manual labor |

### C. Goal-Adaptive Macronutrient Splits (`algo.js:34–65`)
Calories and gram targets are assigned based on the user's primary body composition goal:

1. **Hypertrophy (Lean Bulk):**
   - Calorie Target: $\text{TDEE} + 300\text{ kcal}$
   - Protein: $2.0\text{g} \times \text{weight}_{\text{kg}}$ ($4\text{ kcal/g}$)
   - Fat: $25\%$ of total daily calories ($9\text{ kcal/g}$)
   - Carbohydrates: Remaining caloric budget ($4\text{ kcal/g}$)
2. **Fat Loss (Aggressive Cut):**
   - Calorie Target: $\text{TDEE} - 500\text{ kcal}$
   - Protein: $2.2\text{g} \times \text{weight}_{\text{kg}}$ (elevated to safeguard skeletal muscle mass in a deficit)
   - Fat: $20\%$ of daily calories
   - Carbohydrates: Remaining calories
3. **Recomposition:**
   - Calorie Target: Iso-caloric ($\text{TDEE} \pm 0$)
   - Protein: $2.2\text{g} \times \text{weight}_{\text{kg}}$

---

## 2. Interactive SVG Macro Rings (`fitfuel.js:1420–1510`)

The dashboard features 4 synchronized SVG circular stroke gauges:
- **Calories Donut:** Central large gauge tracking consumed calories vs daily ceiling. Outer glow transitions from Lime (`#CEFF1A`) to Amber (`#F59E0B`) if within $100\text{ kcal}$, or Coral (`#EF4444`) if over budget.
- **Protein Ring:** Blue-green gradient stroke with gram countdown.
- **Carbs Ring:** Gold-amber gradient stroke.
- **Fat Ring:** Rose-red gradient stroke.

---

## 3. Meal Slots & Food Database

The food diary splits entries into 5 distinct meal partitions:
1. **Breakfast**
2. **Lunch**
3. **Dinner**
4. **Snacks**
5. **Pre / Post-Workout Nutrition**

Each logged entry records: `id`, `name`, `brand`, `serving_g`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`, and `logged_at_timestamp`.

---

## 4. Hardware Barcode Scanner (`barcode-scanner.js`)

- **Technology:** Uses the browser native `BarcodeDetector` API when supported (Chromium / Android), falling back to a client-side WebAssembly video scanner.
- **Supported Formats:** `qr_code`, `ean_13`, `ean_8`, `upc_a`, `upc_e`, `code_128`.
- **Latency & Feedback:** Scans in $< 200\text{ms}$ at 30fps; vibrates device (`navigator.vibrate(80)`) and plays an audible confirmation beep on valid capture.
- **Data Lookup:** Barcodes are resolved against the Open Food Facts API and FitFuel's verified athletic nutritional cache.
