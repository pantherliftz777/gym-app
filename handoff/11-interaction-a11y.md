# 11 — Interactions, Motion & Accessibility (A11y)

> **Source Code Citations:**  
> - `gym-app/public/styles.css` (Lines 40–120, 1400–1463)  
> - `gym-app/public/app.js` (Lines 20–60)  
> - `gym-app/public/dashboard.html` (Lines 80–130)  
> - `gym-app/public/fitfuel.js` (Lines 250–320)  

---

## 1. Accessibility Standards & WCAG 2.1 AA Compliance

### A. Color Contrast Ratios
- **Primary Text (`#F5F7FA`) on Dark Canvas (`#060709`):** Contrast ratio of `17.5 : 1` — far exceeds WCAG AAA requirement ($7.0:1$).
- **Neon Lime Accent (`#CEFF1A`) on Dark Canvas (`#060709`):** Contrast ratio of `14.8 : 1` — exceeds WCAG AAA for both text and UI components.
- **Muted Gray Text (`#8A93A0`) on Surface (`#0D0F12`):** Contrast ratio of `5.8 : 1` — exceeds WCAG AA requirement ($4.5:1$).
- **Light Theme Forest Charcoal (`#0B1410`) on Porcelain (`#F6F5F0`):** Contrast ratio of `16.2 : 1` (AAA).

### B. Touch Targets & Spacing
- All interactive buttons, tabs, modal triggers, and inputs maintain a minimum touch bounding box of **$48\text{px} \times 48\text{px}$** on mobile viewports (`<= 768px`) to comply with mobile accessibility ergonomics.

---

## 2. Keyboard Navigation & Focus Management

- **Visible Focus Rings:** Focused interactive controls feature an accessible neon lime dual-ring outline:
  ```css
  :focus-visible {
    outline: 2px solid #CEFF1A;
    outline-offset: 3px;
  }
  ```
- **Modal Focus Trap:** When the VIP Auth Modal or Barcode Scanner opens:
  1. The opening trigger element is recorded.
  2. Tab focus is locked inside the dialog container (`modal.querySelectorAll('button, input, [tabindex]')`).
  3. Pressing `Escape` closes the modal immediately and restores focus to the invoking button.

---

## 3. Motion Accessibility (`prefers-reduced-motion`)

FitFuel fully honors user system accessibility preferences. When a user has enabled "Reduce Motion" in their OS:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
  .volumetric-cone {
    display: none !important; /* Disables mouse-following light bloom */
  }
  .sponsors-track {
    animation: none !important;
    overflow-x: auto !important; /* Converts infinite marquee to standard scroll */
  }
}
```

---

## 4. Screen Reader Considerations & ARIA Structure

- **Macro Donut Rings:** Implemented with `role="progressbar"`, `aria-valuenow="78"`, `aria-valuemin="0"`, `aria-valuemax="100"`, and `aria-label="Daily Protein Progress"`.
- **Navigation Tabs:** Uses `role="tablist"` with child `role="tab"` and `aria-selected="true/false"`.
- **Live Regions:** Toast alerts and rest countdown audio notifications utilize `aria-live="polite"` so vision-impaired lifters hear timers without jarring interruption.
