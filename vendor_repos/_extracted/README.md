# FitFuel Vendor Integration Survey

This folder holds data, algorithms, and prompts extracted from 15 upstream fitness/repos
(cloned into `D:\gym app\vendor_repos`) and integrated into FitFuel (the gym app at
`D:\gym app`). Nothing in the FitFuel UI mentions these repos by name — integrations
appear as native features.

## What was cloned (vendor_repos/)

| Folder | Source | What it contributed |
|---|---|---|
| exercises-dataset | hasaneyldrm/exercises-dataset | 1,324 exercises with 180x180 GIFs + instructions (10 langs). Converted -> `public/data/exercises.json` (1,318 deduped) |
| diet-workout-plan | rishabhrawat35/... | Indian food macro DB, home/gym movement-pattern exercises, MET activity table |
| claude-gym-coach | nikitavovch/claude-gym-coach | 1RM-free starting-load calibration, exercise technique knowledge, coaching skill prompts |
| SparkyFitness | CodeWithCJ/SparkyFitness | Family food/fitness/water/health tracking patterns |
| My-Workouts | chathushkaimasara/My-Workouts | Onboarding visuals, progress-page UI patterns |
| ashwinr93-workout | ashwinr93/workout | Workout plan structure, program JS, audio cues |
| gym-mentor-ai | soham-1801/gym-mentor-ai | AI coaching pipeline structure |
| arvo-mcp | khaoss85/arvo-mcp | MCP-style tool schemas |
| perpetio-fitness | perpetio/fitness | Flutter fitness app screen/layout patterns |
| Stayfit | rahulmaddineni/Stayfit | Daily calorie count, friend-invite flow |
| RunFlutterRun | BenjaminCanape/RunFlutterRun | Run/walk/cycle tracking patterns |
| shapy | muelea/shapy | Anthropometry / body-measurement concepts |
| SMPL-Anthropometry | DavidBoja/SMPL-Anthropometry | Body landmark/measurement definitions |
| hevy-mcp | chrisdoc/hevy-mcp | Workout API/tooling patterns |
| skulpt | skulptapp/skulpt | (Python-in-browser, not directly used) |

## Extracted assets

### vendor_repos/_extracted/data/
- `foods-india-egg-dairy.json` — Indian foods (roti, rice, dal, sabji, paneer, egg bhurji, curd, etc.) with macros per unit, role, cuisine, tags, `made_of` notes. ~35 entries.
- `exercises-home-gym.json` — Home/gym exercises keyed by movement pattern (horizontal_push, knee_extension, hip_hinge, etc.) with equipment and load class.
- `activities.json` — MET values for 17 activities (walking, swimming, cricket, badminton, yoga, etc.) from the Compendium of Physical Activities.

### vendor_repos/_extracted/algorithms.js
Pure, dependency-free JS functions ported/inspired from the repos above:
- `bmrMifflinStJeor` / `tdee` — daily energy targets
- `macros` — protein/carb/fat split by goal (loss/maintenance/gain)
- `MET` table + `metCalories` — activity calorie pricing
- `startingLoadCeiling` / `startingLoadPropose` / `recalibrateLoad` — 1RM-free starting-load ramp (claude-gym-coach)
- `classifyMovement` / `MOVEMENT_PATTERNS` — movement-pattern classifier

### vendor_repos/_extracted/prompts.json
Coaching system prompts ported from claude-gym-coach skills: coach-init, coach-plan, coach-log, coach-phase, coach-review, exercise-substitute.

### vendor_repos/_extracted/claude-gym-coach-{exercises,starting-loads,safety}.md
Raw knowledge-base markdown (exercise technique table, 1RM calibration protocol, safety guidance).

## How it was integrated into FitFuel

1. **Data layer** (`public/data.js`): Indian food entries merged into `FOODS`; movement-pattern exercise records added to the exercise library; MET activity table exposed for calorie tracking.
2. **Algorithms** (`public/fitfuel.js`): BMR/TDEE/macro targets, MET calorie burn, 1RM-free starting-load calibration, movement-pattern filtering wired into the exercise library and workout views.
3. **UI** (`public/index.html` + `public/styles.css`): New filter chips for movement patterns, starting-load suggestion UI in the workout planner, MET activity calorie cards, expanded food library with Indian items.
4. **No repo attribution in UI**: All integrations surface as native FitFuel features; the upstream sources are documented here only.

## Why these were chosen
- **Indian food DB** matches FitFuel's Indian-user audience (roti/dal/paneer queries already common in the nutrition bot).
- **1RM-free starting load** removes the need for max-testing, fitting beginners.
- **MET table** extends calorie tracking beyond gym workouts to daily life (cricket, badminton, walking).
- **Movement patterns** let the exercise library filter by biomechanical pattern, not just muscle.
