# 06 — Data Model & Storage Specifications

> **Source Code & Schema Citations:**  
> - Server Database Gateway: `gym-app/server.js` (Lines 43–260, 735–1110)  
> - Client Storage: `gym-app/public/fitfuel.js` (Lines 110–140), `pwa-sync.js` (Lines 5–30)  

---

## 1. Master Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : "authenticates via"
    USERS ||--o| PROFILE : "owns"
    USERS ||--o| PLANS : "owns"
    USERS ||--o| SETTINGS : "configures"
    USERS ||--o{ WATER : "logs daily"
    USERS ||--o{ LOG_ENTRIES : "records meals"
    USERS ||--o{ CUSTOM_FOODS : "creates"
    USERS ||--o{ WEIGHTS : "weighs in"
    USERS ||--o{ WORKOUTS_DONE : "completes"
    USERS ||--o{ ACTIVITY_SESSIONS : "performs cardio"
    USERS ||--o{ POSTURE_SESSIONS : "records form"
    USERS ||--o{ BODY_ASSESSMENTS : "tracks composition"
    USERS ||--o{ COMPLAINTS : "submits tickets"
    USERS ||--o{ BETA_APPLICATIONS : "applies for"

    USERS {
        text id PK
        text name
        text email UK
        text contact
        text pass_hash
        text salt
        integer is_admin
        integer is_beta_tester
        text created_at
        text last_login
    }

    SESSIONS {
        text token PK
        text user_id FK
        integer created
    }

    PROFILE {
        text user_id PK_FK
        text data
        integer updated
    }

    PLANS {
        text user_id PK_FK
        text data
        integer updated
    }

    SETTINGS {
        text user_id PK_FK
        text data
        integer updated
    }

    WATER {
        text user_id PK_FK
        text date PK
        integer ml
    }

    LOG_ENTRIES {
        integer id PK
        text user_id FK
        text date
        text meal
        text entry
    }

    CUSTOM_FOODS {
        text id PK
        text user_id FK
        text data
        integer created
    }

    WEIGHTS {
        text user_id PK_FK
        text date PK
        real w_kg
    }

    WORKOUTS_DONE {
        text user_id PK_FK
        text date PK
        text name
    }

    ACTIVITY_SESSIONS {
        integer id PK
        text user_id FK
        text type
        integer duration_min
        real calories
        real distance_km
        text timestamp
    }

    POSTURE_SESSIONS {
        integer id PK
        text user_id FK
        text exercise
        real score
        text joint_angles
        text issues_detected
        text timestamp
    }

    BODY_ASSESSMENTS {
        integer id PK
        text user_id FK
        real body_fat_pct
        real waist_cm
        real neck_cm
        real hip_cm
        text timestamp
    }

    COMPLAINTS {
        integer id PK
        text user_id FK
        text title
        text category
        text description
        text status
        text created_at
    }

    BETA_APPLICATIONS {
        text id PK
        text userId FK
        text featureId
        text status
        text reason
        text device
        text appliedAt
        text approvedAt
    }
```

---

## 2. Turso Cloud SQLite Table Definitions

| Table Name | Primary Key | Description & Foreign Keys | Source in `server.js` |
|:---|:---|:---|:---|
| `users` | `id TEXT` | Core member account registry; stores scrypt password hash, salt, admin and beta flags. | `Line 142` |
| `sessions` | `token TEXT` | Active cryptographic login tokens mapped to `user_id`. | `Line 142` |
| `profile` | `user_id TEXT` | JSON blob storing athlete biometric attributes: age, sex, height, weight, activity, goals, PRs. | `Line 158` |
| `plans` | `user_id TEXT` | JSON blob storing current active routine, custom splits, days, exercises, sets. | `Line 164` |
| `settings` | `user_id TEXT` | JSON blob for UI preferences: units (`kg`/`lbs`), dark/light theme, notification sounds. | `Line 170` |
| `water` | `(user_id, date)` | Daily milliliter hydration log. | `Line 178` |
| `log_entries` | `id INTEGER AUTO` | Categorized food entries (JSON blob per food row with calories, macros, gram weights). | `Line 189` |
| `custom_foods` | `id TEXT` | Custom user-created foods and recipes. | `Line 200` |
| `weights` | `(user_id, date)` | Historical morning scale weight entries ($w_{\text{kg}}$). | `Line 216` |
| `workouts_done`| `(user_id, date)` | Historical completed training sessions (name and volume). | `Line 217` |
| `activity_sessions` | `id INTEGER AUTO` | Cardio/conditioning sessions (running, cycling, MET calories). | `Line 797` |
| `posture_sessions` | `id INTEGER AUTO` | MediaPipe computer vision assessment logs (joint angles, symmetry score). | `Line 835` |
| `body_assessments` | `id INTEGER AUTO` | U.S. Navy and Ramanujan circumference scan logs. | `Line 883` |
| `complaints` | `id INTEGER AUTO` | Facility equipment defect reports and maintenance status tickets. | `Line 972` |
| `beta_applications` | `id TEXT` | Applications for experimental features (`formCorrectionAi`, `wearableSync`). | `Line 244` |
| `feature_waitlist` | `id INTEGER AUTO` | Member waitlist signups for upcoming hardware features. | `Line 589` |

---

## 3. Client-Side Browser Storage Model

### A. LocalStorage Keys (`fitfuel.js`, `pwa-sync.js`, `app.js`)

| Key Name | Type / Values | Description |
|:---|:---|:---|
| `fitfuel_theme` | `'dark' \| 'light'` | Theme preference; applied synchronously before DOM load to avoid flicker. |
| `fitfuel_auth` | `string (token)` | Bearer authentication token for REST API calls. |
| `fitfuel_user_email` | `string` | Cached email for user session display. |
| `fitfuel_demo_user` | `'true' \| 'false'` | Flags whether active session is running under Instant Demo Lifter bypass. |
| `fitfuel_steps` | `number` | Daily physical activity pedometer count. |
| `fitfuel_accent_color` | `string (hex)` | Custom user accent color override. |
| `ff_offline_queue_v1` | `Array<ActionObject>` | Array of pending mutation operations queued while offline. |
| `ff_sidebar_collapsed`| `'true' \| 'false'` | Tracks whether the dashboard sidebar is in compact icon mode. |
| `fitfuel_beta_demo_admin`| `'true' \| 'false'` | Grants local administrative preview privileges. |

### B. In-Memory State Model (`window.FF.state`)
The active single-page app maintains an atomic in-memory reactive state object:
```javascript
window.FF.state = {
  profile: { name, age, sex, heightCm, weightKg, goal, activityLevel, prs: {} },
  plan: { splitName, days: [ { name, exercises: [] } ] },
  settings: { unit: 'kg', theme: 'dark', audioEnabled: true },
  water: { date: '2026-11-07', ml: 2250 },
  log: { '2026-11-07': [ /* meal entries */ ] },
  custom: [ /* custom foods */ ],
  weights: [ /* 90-day history */ ],
  workouts: [ /* completed history */ ]
};
```
