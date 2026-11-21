# 05e — Feature Spec: 3D Body Composition & Anthropometrics

> **Status:** LIVE (Public Beta)  
> **Source Files & Citations:**  
> - Calculation Engine: `gym-app/public/algo.js` (Lines 220–310)  
> - UI View: `gym-app/public/dashboard.html` (`#view-body-analysis`, Lines 3100–3500)  
> - Frontend Logic: `gym-app/public/fitfuel.js` (Lines 4200–4450)  
> - Server Endpoints: `server.js` (Lines 858–950)  

---

## 1. Anthropometric Assessment Mathematical Foundation

FitFuel computes clinical body composition without requiring expensive DEXA or hydrostatic weighing tanks:

### A. U.S. Navy Circumference Body Fat Formula (`algo.js:280–305`)
Using standardized tape circumference measurements ($\text{cm}$) and standing height:

- **For Men:**
  $$\%\text{BF} = 86.010 \times \log_{10}(\text{waist} - \text{neck}) - 70.041 \times \log_{10}(\text{height}) + 36.76$$

- **For Women:**
  $$\%\text{BF} = 163.205 \times \log_{10}(\text{waist} + \text{hip} - \text{neck}) - 97.684 \times \log_{10}(\text{height}) - 78.387$$

---

## 2. Ramanujan Elliptical Geometry for Limb Cross-Sections

Because human limbs are anatomical ellipses rather than pure circles, calculating cross-sectional area and lean muscle volume requires Ramanujan's second approximation for the perimeter of an ellipse with semi-axes $a$ (anterior-posterior depth) and $b$ (medial-lateral width):

$$h = \frac{(a - b)^2}{(a + b)^2}$$
$$C \approx \pi (a + b) \left( 1 + \frac{3h}{10 + \sqrt{4 - 3h}} \right)$$

This allows FitFuel to generate proportional 3D body mesh visualizations that accurately reflect hypertrophy gains in quadriceps, biceps, and chest circumferences over time.

---

## 3. Clinical Cardiometabolic Health Risk Indicators

Beyond aesthetic metrics, the dashboard computes verified medical risk indices:

| Metric | Formula | Normal Threshold | Elevated Risk Threshold | High Risk Threshold |
|:---|:---:|:---:|:---:|:---:|
| **Waist-to-Hip Ratio (WHR)** | $\frac{\text{waist}_{\text{cm}}}{\text{hip}_{\text{cm}}}$ | Men $< 0.90$<br/>Women $< 0.80$ | Men $0.90–0.99$<br/>Women $0.80–0.84$ | Men $\ge 1.00$<br/>Women $\ge 0.85$ |
| **Waist-to-Height Ratio (WHtR)** | $\frac{\text{waist}_{\text{cm}}}{\text{height}_{\text{cm}}}$ | $< 0.50$ ("Keep waist to less than half your height") | $0.50–0.59$ | $\ge 0.60$ |

---

## 4. UI Visualization & Historical Progression

- **Dual Silhouette Rendering:** An interactive SVG figure highlights body fat changes with color heat mapping:
  - Green / Teal: Healthy lean tissue ($10\%–15\%$ for men, $18\%–23\%$ for women).
  - Amber: Moderate adiposity ($16\%–24\%$ men).
  - Coral / Red: High adiposity ($> 25\%$ men, $> 32\%$ women).
- **Fat-Free Mass Index (FFMI):**
  $$\text{FFMI} = \frac{\text{Lean Mass (kg)}}{(\text{Height (m)})^2}$$
  Flags natural genetic muscular potential baseline ($22–25\text{ kg/m}^2$).
- **Historical Comparison Slider:** Lifters can drag a timeline scrubber to see their silhouette morph across recorded assessment scans.
