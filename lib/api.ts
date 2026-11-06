/**
 * FitFuel Mock API Client & Offline-First State Engine
 * Complies with the REST API Contract specified in the prompt appendix.
 * Supports offline queuing (`ff_offline_queue_v1`) and optimistic local updates.
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'coach' | 'admin';
  age: number;
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: 'hypertrophy' | 'loss' | 'maintenance' | 'gain';
  split: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  prs: Record<string, number>;
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  grams: number;
  time?: string;
}

export interface MealSlot {
  name: string;
  items: MealItem[];
}

export interface FoodLogState {
  breakfast: MealSlot;
  lunch: MealSlot;
  dinner: MealSlot;
  snacks: MealSlot;
  prePostWorkout: MealSlot;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  type: 'warmup' | 'normal' | 'drop' | 'failure';
  weight: number;
  reps: number;
  rpe: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  muscle: string;
  targetSets: number;
  targetReps: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  title: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
  completed: boolean;
}

export interface StateData {
  profile: UserProfile;
  waterIntakeMl: number;
  waterGoalMl: number;
  foodLog: FoodLogState;
  activeWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  weightHistory: { date: string; weight: number }[];
  betaAccess: Record<string, boolean>;
  settings: {
    theme: 'dark' | 'light';
    accentColor: string;
    unit: 'kg' | 'lb';
    soundEnabled: boolean;
  };
}

// Demo Persona Seed: Jordan Davis
export const SEED_JORDAN_DAVIS: StateData = {
  profile: {
    id: 'user_jordan_davis',
    name: 'Jordan Davis',
    email: 'jordan.davis@fitfuel.vip',
    role: 'member',
    age: 28,
    gender: 'male',
    heightCm: 182,
    weightKg: 78.5,
    targetWeightKg: 82.0,
    goal: 'hypertrophy',
    split: 'Push / Pull / Legs (PPL)',
    bmr: 1792,
    tdee: 2778,
    targetCalories: 3078,
    macros: {
      protein: 157,
      carbs: 423,
      fat: 85,
    },
    prs: {
      'Barbell Bench Press': 110,
      'Barbell Back Squat': 145,
      'Conventional Deadlift': 180,
      'Overhead Press': 72.5,
    },
  },
  waterIntakeMl: 2250,
  waterGoalMl: 3500,
  foodLog: {
    breakfast: {
      name: 'Breakfast',
      items: [
        { id: 'm1', name: 'Steel Cut Oats & Whey Isolate', calories: 520, protein: 42, carbs: 68, fat: 8, grams: 350, time: '08:15 AM' },
        { id: 'm2', name: 'Blueberries & Honey', calories: 120, protein: 1, carbs: 28, fat: 0, grams: 120, time: '08:20 AM' },
      ],
    },
    lunch: {
      name: 'Lunch',
      items: [
        { id: 'm3', name: 'Grilled Chicken Breast Bowl with Jasmine Rice', calories: 680, protein: 55, carbs: 82, fat: 12, grams: 450, time: '01:00 PM' },
        { id: 'm4', name: 'Steamed Broccoli & Olive Oil', calories: 95, protein: 4, carbs: 8, fat: 5, grams: 150, time: '01:10 PM' },
      ],
    },
    dinner: {
      name: 'Dinner',
      items: [
        { id: 'm5', name: 'Wild Atlantic Salmon Fillet', calories: 540, protein: 46, carbs: 0, fat: 28, grams: 280, time: '07:30 PM' },
        { id: 'm6', name: 'Roasted Sweet Potato Wedges', calories: 310, protein: 4, carbs: 65, fat: 4, grams: 260, time: '07:35 PM' },
      ],
    },
    snacks: {
      name: 'Snacks',
      items: [
        { id: 'm7', name: 'Greek Yogurt 0% with Crushed Almonds', calories: 290, protein: 26, carbs: 14, fat: 14, grams: 220, time: '04:15 PM' },
      ],
    },
    prePostWorkout: {
      name: 'Pre/Post-Workout',
      items: [
        { id: 'm8', name: 'Pre-Workout Fuel Banana & Rice Cakes', calories: 220, protein: 3, carbs: 48, fat: 1, grams: 180, time: '05:30 PM' },
      ],
    },
  },
  activeWorkout: {
    id: 'wo_active_today',
    date: new Date().toISOString(),
    title: 'Push Hypertrophy A (Chest, Delts, Triceps)',
    durationMinutes: 48,
    completed: false,
    exercises: [
      {
        id: 'ex1',
        name: 'Barbell Bench Press',
        muscle: 'Chest',
        targetSets: 4,
        targetReps: '6 - 8',
        sets: [
          { id: 's1', setNumber: 1, type: 'warmup', weight: 60, reps: 10, rpe: 6, completed: true },
          { id: 's2', setNumber: 2, type: 'normal', weight: 95, reps: 8, rpe: 8, completed: true },
          { id: 's3', setNumber: 3, type: 'normal', weight: 102.5, reps: 6, rpe: 9, completed: true },
          { id: 's4', setNumber: 4, type: 'failure', weight: 112.5, reps: 5, rpe: 10, completed: false },
        ],
      },
      {
        id: 'ex2',
        name: 'Incline Dumbbell Press',
        muscle: 'Upper Chest',
        targetSets: 3,
        targetReps: '8 - 10',
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', weight: 36, reps: 10, rpe: 8, completed: true },
          { id: 's6', setNumber: 2, type: 'normal', weight: 38, reps: 8, rpe: 8.5, completed: false },
          { id: 's7', setNumber: 3, type: 'normal', weight: 38, reps: 8, rpe: 9, completed: false },
        ],
      },
      {
        id: 'ex3',
        name: 'Cable Lateral Raise',
        muscle: 'Side Delts',
        targetSets: 4,
        targetReps: '12 - 15',
        sets: [
          { id: 's8', setNumber: 1, type: 'normal', weight: 12.5, reps: 15, rpe: 8, completed: true },
          { id: 's9', setNumber: 2, type: 'normal', weight: 15, reps: 13, rpe: 8.5, completed: false },
          { id: 's10', setNumber: 3, type: 'normal', weight: 15, reps: 12, rpe: 9, completed: false },
          { id: 's11', setNumber: 4, type: 'drop', weight: 10, reps: 15, rpe: 10, completed: false },
        ],
      },
    ],
  },
  workoutHistory: [
    {
      id: 'wo_hist_1',
      date: 'Yesterday',
      title: 'Pull Heavy & Biceps Density',
      durationMinutes: 62,
      completed: true,
      exercises: [],
    },
    {
      id: 'wo_hist_2',
      date: '3 Days Ago',
      title: 'Legs & Posterior Chain Power',
      durationMinutes: 70,
      completed: true,
      exercises: [],
    },
  ],
  weightHistory: [
    { date: 'Nov 01', weight: 77.8 },
    { date: 'Nov 02', weight: 78.0 },
    { date: 'Nov 03', weight: 78.1 },
    { date: 'Nov 04', weight: 78.4 },
    { date: 'Nov 05', weight: 78.3 },
    { date: 'Nov 06', weight: 78.5 },
  ],
  betaAccess: {
    form_check: true,
    body_composition: true,
  },
  settings: {
    theme: 'dark',
    accentColor: 'lime',
    unit: 'kg',
    soundEnabled: true,
  },
};

const STORAGE_KEY_AUTH = 'fitfuel_auth';
const STORAGE_KEY_STATE = 'fitfuel_state_v2';
const STORAGE_KEY_OFFLINE_QUEUE = 'ff_offline_queue_v1';

class FitFuelApi {
  private state: StateData;
  private token: string | null = null;
  private syncDotListeners: ((synced: boolean) => void)[] = [];
  private saveTimeout: any = null;

  constructor() {
    // Load persisted state or fallback to Jordan Davis
    this.token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_AUTH) : null;
    let localData: StateData | null = null;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_STATE) : null;
      if (raw) localData = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse cached state', e);
    }
    this.state = localData || JSON.parse(JSON.stringify(SEED_JORDAN_DAVIS));

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.flushOfflineQueue());
    }
  }

  // Subscribe to sync dot status
  onSyncStatus(callback: (synced: boolean) => void) {
    this.syncDotListeners.push(callback);
    callback(true);
    return () => {
      this.syncDotListeners = this.syncDotListeners.filter(cb => cb !== callback);
    };
  }

  private notifySync(synced: boolean) {
    this.syncDotListeners.forEach(cb => cb(synced));
  }

  // Auto-save with 500ms debounce
  private scheduleAutoSave() {
    this.notifySync(false);
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(this.state));
        } catch (e) {
          console.error('Storage write error', e);
        }
      }
      this.notifySync(true);
    }, 500);
  }

  // Offline queue operations
  private queueOfflineAction(action: { endpoint: string; payload: any }) {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE) || '[]';
      const queue = JSON.parse(raw);
      queue.push({ ...action, timestamp: Date.now() });
      localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to queue offline action', e);
    }
  }

  flushOfflineQueue(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
      if (!raw) return false;
      const queue = JSON.parse(raw);
      if (queue.length > 0) {
        localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
        return true;
      }
    } catch (e) {
      console.error('Failed to flush offline queue', e);
    }
    return false;
  }

  // --- Auth Endpoints ---
  async login(email: string, password?: string): Promise<{ token: string; user: UserProfile }> {
    await new Promise(r => setTimeout(r, 400));
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    const token = 'ff_token_' + Math.random().toString(36).substring(2);
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTH, token);
    }
    return { token, user: this.state.profile };
  }

  async loginDemoLifter(): Promise<{ token: string; user: UserProfile }> {
    this.state = JSON.parse(JSON.stringify(SEED_JORDAN_DAVIS));
    this.scheduleAutoSave();
    return this.login('jordan.davis@fitfuel.vip', 'instant_demo');
  }

  async register(name: string, email: string): Promise<{ token: string; user: UserProfile }> {
    await new Promise(r => setTimeout(r, 450));
    if (!name.trim()) throw new Error('Name is required.');
    if (!email.includes('@')) throw new Error('Invalid email address.');
    this.state.profile.name = name;
    this.state.profile.email = email;
    return this.login(email);
  }

  async logout(): Promise<void> {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }

  getMe(): UserProfile | null {
    return this.token ? this.state.profile : null;
  }

  isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  // --- State Endpoints ---
  getState(): StateData {
    return this.state;
  }

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    this.state.profile = { ...this.state.profile, ...updates };
    this.scheduleAutoSave();
    return this.state.profile;
  }

  addWater(amountMl: number): number {
    this.state.waterIntakeMl = Math.max(0, this.state.waterIntakeMl + amountMl);
    this.scheduleAutoSave();
    return this.state.waterIntakeMl;
  }

  addMealItem(slotKey: keyof FoodLogState, item: Omit<MealItem, 'id'>): MealItem {
    const newItem: MealItem = {
      ...item,
      id: 'meal_' + Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    this.state.foodLog[slotKey].items.push(newItem);
    this.scheduleAutoSave();
    return newItem;
  }

  removeMealItem(slotKey: keyof FoodLogState, itemId: string) {
    this.state.foodLog[slotKey].items = this.state.foodLog[slotKey].items.filter(
      item => item.id !== itemId
    );
    this.scheduleAutoSave();
  }

  logWorkoutSet(exerciseId: string, set: Omit<WorkoutSet, 'id'>): { set: WorkoutSet; prBroken?: { exercise: string; weight: number } } {
    if (!this.state.activeWorkout) throw new Error('No active workout session.');
    const ex = this.state.activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!ex) throw new Error('Exercise not found in current workout.');

    const newSet: WorkoutSet = {
      ...set,
      id: 'set_' + Math.random().toString(36).substring(2, 9),
    };
    ex.sets.push(newSet);

    let prBroken: { exercise: string; weight: number } | undefined;
    const currentPR = this.state.profile.prs[ex.name] || 0;
    if (newSet.completed && newSet.weight > currentPR) {
      this.state.profile.prs[ex.name] = newSet.weight;
      prBroken = { exercise: ex.name, weight: newSet.weight };
    }

    this.scheduleAutoSave();
    return { set: newSet, prBroken };
  }

  toggleSetComplete(exerciseId: string, setId: string): { completed: boolean; prBroken?: { exercise: string; weight: number } } {
    if (!this.state.activeWorkout) return { completed: false };
    const ex = this.state.activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!ex) return { completed: false };
    const targetSet = ex.sets.find(s => s.id === setId);
    if (!targetSet) return { completed: false };

    targetSet.completed = !targetSet.completed;
    let prBroken: { exercise: string; weight: number } | undefined;
    if (targetSet.completed) {
      const currentPR = this.state.profile.prs[ex.name] || 0;
      if (targetSet.weight > currentPR) {
        this.state.profile.prs[ex.name] = targetSet.weight;
        prBroken = { exercise: ex.name, weight: targetSet.weight };
      }
    }
    this.scheduleAutoSave();
    return { completed: targetSet.completed, prBroken };
  }

  finishWorkout(): WorkoutSession {
    if (!this.state.activeWorkout) throw new Error('No active workout');
    const finished = { ...this.state.activeWorkout, completed: true };
    this.state.workoutHistory.unshift(finished);
    this.state.activeWorkout = null;
    this.scheduleAutoSave();
    return finished;
  }

  logWeight(weight: number): { date: string; weight: number }[] {
    const entry = {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight,
    };
    this.state.profile.weightKg = weight;
    this.state.weightHistory.push(entry);
    this.scheduleAutoSave();
    return this.state.weightHistory;
  }

  // --- AI Coach Chat ---
  async sendAICoachMessage(prompt: string): Promise<string> {
    await new Promise(r => setTimeout(r, 650));
    const p = prompt.toLowerCase();
    if (p.includes('split') || p.includes('4-day')) {
      return `### Optimal 4-Day Upper/Lower Strength & Hypertrophy Split

**Day 1: Upper Power**
- Barbell Bench Press — 3 sets × 5 reps (RPE 8)
- Barbell Bent-Over Row — 3 sets × 6 reps
- Standing Overhead Press — 3 sets × 6–8 reps
- Weighted Pull-ups — 3 sets × 6–8 reps

**Day 2: Lower Power**
- Barbell Back Squat — 3 sets × 5 reps (RPE 8)
- Romanian Deadlift (RDL) — 3 sets × 8 reps
- Bulgarian Split Squats — 2 sets × 10 reps/leg
- Standing Calf Raises — 4 sets × 12 reps

**Day 3: Rest & Active Recovery** (30 min zone 2 walk + mobility)

**Day 4: Upper Hypertrophy**
- Incline Dumbbell Press — 4 sets × 8–10 reps
- Neutral Grip Lat Pulldown — 3 sets × 10–12 reps
- Cable Lateral Raises — 4 sets × 15 reps
- Incline Dumbbell Curls & Overhead Tricep Extensions Superset

**Day 5: Lower Hypertrophy**
- Leg Press — 4 sets × 10–12 reps
- Hamstring Curls — 3 sets × 12–15 reps
- Walking Lunges — 3 sets × 12 steps/leg
- Hanging Leg Raises — 3 sets × 15 reps`;
    }

    if (p.includes('protein') || p.includes('snack')) {
      return `### Top High-Protein, Low-Carb Performance Snacks:

1. **Non-Fat Greek Yogurt Crunch** (250g)
   - **Protein:** 25g | **Carbs:** 8g | **Fat:** 0g | **Calories:** 135 kcal
   - *Tip:* Mix in cinnamon and a dash of stevia.

2. **Liquid Egg White Omelet with Smoked Turkey**
   - **Protein:** 32g | **Carbs:** 2g | **Fat:** 2g | **Calories:** 160 kcal

3. **Cottage Cheese & Crushed Walnut Bowl** (200g)
   - **Protein:** 24g | **Carbs:** 6g | **Fat:** 7g | **Calories:** 185 kcal

4. **FitFuel Whey Isolate Shake in Unsweetened Almond Milk**
   - **Protein:** 27g | **Carbs:** 1g | **Fat:** 1.5g | **Calories:** 130 kcal`;
    }

    return `Based on your biometrics (${this.state.profile.weightKg}kg, goal ${this.state.profile.goal}), your current metabolic target of **${this.state.profile.targetCalories} kcal** is dialed in for progressive overload.

Keep prioritizing recovery, hit your **${this.state.profile.macros.protein}g protein** floor daily, and monitor your RPE so fatigue remains manageable across compound lifts.`;
  }

  // --- Beta Gate & Waitlist Endpoints ---
  async applyBetaAccess(featureId: string, device: string, reason: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 400));
    this.state.betaAccess[featureId] = true;
    this.scheduleAutoSave();
    return true;
  }

  async joinHardwareWaitlist(email: string, hardware: string): Promise<{ position: number }> {
    await new Promise(r => setTimeout(r, 350));
    return { position: 412 };
  }

  resetAllData() {
    this.state = JSON.parse(JSON.stringify(SEED_JORDAN_DAVIS));
    this.scheduleAutoSave();
  }
}

export const api = new FitFuelApi();
