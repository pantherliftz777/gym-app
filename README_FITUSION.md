# FiTusion — Customization & Architecture Guide

> **Front-Facing Brand of FitFuel Platform**  
> **Brand Aesthetic:** High-end editorial sports brand with cinematic volumetric lighting, Syne & Outfit typography, and anti-slop design standards.

---

## 1. How to Swap the Athlete Cutout Image

The athlete visual cutout is cleanly decoupled from the background light cone and can be hot-swapped anytime.

### Current Cutouts Available in `/images/cutouts/`:
- `hero_athlete_lime.png` (Default: athletic male with neon lime piping)
- `hero_athlete_front.png` (Standing front pose)
- `hero_athlete_biceps.png` (Double biceps bodybuilding pose)
- `female_athlete_pose.png` (Female athletic stance)
- `female_athlete_shaker.png` (Female athlete holding shaker bottle)

### Steps to Swap:
1. **Prepare your image:**
   - Save your athlete photo with a **transparent background** (PNG or WebP).
   - Recommended dimensions: ~600px to 1000px height.
2. **Place in the images directory:**
   - Copy your file to: `gym-app/public/images/cutouts/your_new_athlete.png`
3. **Update the image `src` in `index.html`:**
   ```html
   <!-- Inside <section class="hero-section light-stage"> -->
   <div class="hero-athlete-wrap">
     <img src="/images/cutouts/your_new_athlete.png" alt="FiTusion Athlete" id="heroAthleteImg">
   </div>
   ```
4. **Parallax & Scaling:**
   - The athlete image automatically inherits the 3D parallax deflection (2px to 6px) managed by `app.js`.
   - To adjust the maximum width of the athlete, tweak `.hero-athlete-wrap` in `styles.css`:
     ```css
     .hero-athlete-wrap {
       width: 400px; /* Adjust scale */
       max-width: 85vw;
     }
     ```

---

## 2. List of CSS Variables for Tweaking the Cinematic Light Cone

All volumetric lighting properties are controlled via CSS custom properties on `:root` and `html[data-theme="light"]` in [`styles.css`](file:///c:/Users/harsh/OneDrive/Downloads/demo%20for%20incubation/New%20folder/gym-app/public/styles.css):

| CSS Variable | Default (Dark) | Default (Light) | Purpose & Tweak Effect |
|:---|:---|:---|:---|
| `--cone-size` | `780px` | `780px` | Diameter of the volumetric cone spotlight. Increase for a wider room-filling floodlight; decrease for a tighter focused spotlight. |
| `--cone-color-core` | `rgba(255, 255, 255, 0.95)` | `rgba(255, 252, 235, 0.90)` | Center brightness of the cone. In dark mode, pure crisp white; in light mode, warm golden morning sun. |
| `--cone-color-halo` | `rgba(255, 255, 255, 0.18)` | `rgba(255, 243, 196, 0.35)` | Outer falloff halo of the beam. |
| `--cone-color-accent`| `rgba(206, 255, 26, 0.15)` | `rgba(14, 159, 110, 0.18)` | Ambient edge aura: neon lime `#CEFF1A` in dark mode; emerald `#0E9F6E` in light mode. |
| `--cone-blur` | `45px` | `50px` | Gaussian blur filter. Lower (e.g. `20px`) for a sharper laser beam; higher (e.g. `65px`) for soft diffuse atmospheric haze. |
| `--cone-opacity` | `0.92` | `0.85` | Master opacity of the volumetric layer. |
| `--cone-blend` | `screen` | `multiply` | Blending mode with page background (`screen` illuminates black backdrops; `multiply` / `soft-light` integrates with porcelain). |
| `--cone-speed` | `0.08` | `0.08` | Lerp smoothing factor in `app.js` (0.01 = sluggish cinematic lag; 0.20 = ultra-snappy reactive cursor tracking). |

---

## 3. Light System Across Sections

Any HTML element can become a cinematic light stage by adding the `.light-stage` class:
```html
<div class="my-section light-stage">
  <div class="volumetric-cone" aria-hidden="true">
    <div class="cone-core"></div>
    <div class="cone-ambient"></div>
  </div>
  <!-- Your Content -->
</div>
```

Cards inside use `.spotlight-card` to gain interactive cursor border glow:
```html
<div class="spotlight-card">
  <!-- Content with cursor-following border glow -->
</div>
```

---

## 4. Anti-Flicker Theme System

Themes are persisted in `localStorage` under `fitfuel_theme`. To prevent Flash of Unstyled Content (FOUC), the head contains an inline pre-paint initializer:
```html
<script>
  (function() {
    const saved = localStorage.getItem('fitfuel_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  })();
</script>
```

When switching themes, `app.js` briefly adds the `.theme-transitioning` class to apply a smooth 150ms color fade before removing it to keep all other animations performing at 60fps.
