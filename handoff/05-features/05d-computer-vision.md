# 05d — Feature Spec: Computer Vision & Form Analysis

> **Status:** LIVE (Public Beta)  
> **Source Files & Citations:**  
> - Vision Module: `gym-app/public/modules/mediapipe-posture.js` (Lines 1–170)  
> - UI View: `gym-app/public/dashboard.html` (`#view-posture`, Lines 2790–3050)  
> - Server Endpoints: `server.js` (`POST /api/posture/session`, Lines 826–855)  
> - Beta Gate: `gym-app/public/shared/betaAccess.js` (`formCorrectionAi`, Lines 15–40)  

---

## 1. On-Device Privacy Architecture

Unlike cloud-based AI vision tools that stream sensitive camera feeds to remote data centers, FitFuel executes 100% of its pose estimation locally in the user's browser:

```mermaid
graph LR
    Camera["Device Camera (Webcam / Mobile Lens)"] --> WebGL["WebGL / WebAssembly Pipeline"]
    WebGL --> MediaPipe["MediaPipe Pose Engine (33 Landmarks)"]
    MediaPipe --> Angles["Kinematic Vector Math (Hip, Knee, Spine)"]
    Angles --> Feedback["Real-Time Audio & UI Feedback"]
    Feedback --> DataOnly["Numeric Coordinate Metrics Only<br/>(Zero Raw Video Uploaded)"]
    DataOnly --> Turso["POST /api/posture/session"]
```

> **Privacy Guarantee:** No raw camera frames or biometric video clips ever leave the client device. Only aggregated numerical joint degree metrics and rep timestamps are saved to the Turso cloud database.

---

## 2. Landmark Detection & Geometric Math

MediaPipe tracks 33 3D skeletal landmarks. FitFuel extracts key anatomical vectors:
- **Left/Right Hip:** Landmarks 23 & 24
- **Left/Right Knee:** Landmarks 25 & 26
- **Left/Right Ankle:** Landmarks 27 & 28
- **Shoulders & Sternum:** Landmarks 11 & 12

### Biomechanical Angle Formulas
Given three 2D/3D points $A(\text{hip})$, $B(\text{knee})$, $C(\text{ankle})$:
$$\vec{BA} = (A_x - B_x, A_y - B_y)$$
$$\vec{BC} = (C_x - B_x, C_y - B_y)$$
$$\theta = \arccos\left(\frac{\vec{BA} \cdot \vec{BC}}{\|\vec{BA}\| \|\vec{BC}\|}\right) \times \frac{180}{\pi}$$

---

## 3. Real-Time Squat & Deadlift Form Auditing

### A. Squat Depth Evaluation
- **Parallel Threshold:** Knee-to-hip angle must drop below $90^\circ$ relative to horizontal plane.
- **Visual Cue:** If the lifter reverses the movement too early ($> 100^\circ$), an amber pill illuminates: *"Descend deeper — hip crease must break knee parallel"*.
- **Green Confirmation:** When valid depth is reached, the UI pulses neon lime, and a subtle haptic pulse triggers on mobile.

### B. Spinal Alignment & Butt Wink Detection
- **Lumbo-Pelvic Flexion:** Measures the angular variance between the thoracic spine vector and the sacral lumbar vector.
- **Injury Threshold:** If lumbar rounding exceeds $15^\circ$ at the bottom of the squat, the system emits an audio warning: *"Butt wink detected — maintain neutral spine and brace core"*.

### C. Rep Counting & Eccentric / Concentric Tempo
- Measures the duration of the lowering phase (eccentric, target $2.0–3.0\text{s}$) versus the lifting phase (concentric, explosive $< 1.5\text{s}$).
- Automatically increments repetition count when the lifter returns to full hip lockout at the top of the stroke.
