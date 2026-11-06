/**
 * FitFuel Scientific Calculation Engine
 * Implements Mifflin-St Jeor BMR/TDEE, Goal-based Macro Split, Epley e1RM,
 * U.S. Navy Hodgdon-Beckett Body Fat formula, and Ramanujan Elliptical geometry.
 */

export interface MacroTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'extra';
export type FitnessGoal = 'loss' | 'maintenance' | 'gain' | 'hypertrophy';
export type BiologicalSex = 'male' | 'female';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

/**
 * 1. Mifflin-St Jeor BMR Equation
 * Men:   BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Women: BMR = 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function bmrMifflinStJeor(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: BiologicalSex
): number {
  const w = Number(weightKg) || 0;
  const h = Number(heightCm) || 0;
  const a = Number(ageYears) || 0;
  const base = 10 * w + 6.25 * h - 5 * a + 5;
  const result = sex === 'female' ? base - 161 : base;
  return Math.round(result);
}

/**
 * Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel = 'moderate'): number {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(Math.max(1, bmr) * mult);
}

/**
 * 2. Goal-Based Macronutrient Split
 * Calculates target calories and gram breakdown for Protein (4 kcal/g), Carbs (4 kcal/g), and Fat (9 kcal/g).
 */
export function calculateMacros(
  targetCalories: number,
  goal: FitnessGoal,
  weightKg: number
): MacroTarget {
  const kcal = Math.max(1000, Number(targetCalories) || 2000);
  const w = Math.max(40, Number(weightKg) || 70);

  let pRatio = 0.30;
  let cRatio = 0.40;
  let fRatio = 0.30;

  if (goal === 'loss') {
    pRatio = 0.40;
    cRatio = 0.35;
    fRatio = 0.25;
  } else if (goal === 'gain' || goal === 'hypertrophy') {
    pRatio = 0.28;
    cRatio = 0.48;
    fRatio = 0.24;
  }

  // Protein anchored to at least 1.8g - 2.2g per kg bodyweight for lifters
  const minProteinGrams = Math.round(w * 2.0);
  let protein = Math.max(minProteinGrams, Math.round((kcal * pRatio) / 4));
  let carbs = Math.round((kcal * cRatio) / 4);
  let fat = Math.round((kcal * fRatio) / 9);

  // Re-adjust carbs if protein was anchored higher
  const remainingKcal = kcal - (protein * 4 + fat * 9);
  if (remainingKcal > 0) {
    carbs = Math.round(remainingKcal / 4);
  }

  return {
    calories: kcal,
    protein,
    carbs,
    fat,
  };
}

/**
 * 3. Epley Estimated 1-Rep Max (e1RM) Equation
 * e1RM = weight * (1 + reps / 30)
 * Applicable for reps >= 1 and reps <= 15
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  const w = Number(weightKg) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  const e1rm = w * (1 + r / 30);
  return Math.round(e1rm * 10) / 10;
}

/**
 * 4. U.S. Navy Hodgdon-Beckett Body Fat Formula
 * Men:   %BF = 86.010 * log10(waist - neck) - 70.041 * log10(height) + 36.76
 * Women: %BF = 163.205 * log10(waist + hips - neck) - 97.684 * log10(height) - 78.387
 * Parameters in centimeters.
 */
export function calculateNavyBodyFat(params: {
  gender: BiologicalSex;
  heightCm: number;
  waistCm: number;
  neckCm: number;
  hipsCm?: number;
}): number {
  const { gender, heightCm, waistCm, neckCm, hipsCm } = params;
  const h = Math.max(60, Math.min(260, Number(heightCm) || 178));
  const w = Math.max(30, Math.min(250, Number(waistCm) || 82));
  const n = Math.max(15, Math.min(80, Number(neckCm) || 38));
  const hip = Math.max(30, Math.min(250, Number(hipsCm) || (w * 1.15)));

  // Convert cm to inches for standard Hodgdon-Beckett coefficients
  const CM_TO_INCH = 1 / 2.54;
  const hIn = h * CM_TO_INCH;
  const wIn = w * CM_TO_INCH;
  const nIn = n * CM_TO_INCH;
  const hipIn = hip * CM_TO_INCH;

  let bfp = 0;
  if (gender === 'male') {
    const diff = Math.max(0.5, wIn - nIn);
    bfp = 86.010 * Math.log10(diff) - 70.041 * Math.log10(hIn) + 36.76;
    bfp = Math.max(3.0, Math.min(50.0, bfp));
  } else {
    const diff = Math.max(0.5, wIn + hipIn - nIn);
    bfp = 163.205 * Math.log10(diff) - 97.684 * Math.log10(hIn) - 78.387;
    bfp = Math.max(8.0, Math.min(55.0, bfp));
  }

  return Math.round(bfp * 10) / 10;
}

/**
 * 5. Clinical Ratios: WHR (Waist-to-Hip) & WHtR (Waist-to-Height)
 */
export function calculateClinicalRatios(params: {
  heightCm: number;
  weightKg: number;
  waistCm: number;
  hipsCm: number;
  gender: BiologicalSex;
  bodyFatPct?: number;
}) {
  const { heightCm, weightKg, waistCm, hipsCm, gender, bodyFatPct = 15 } = params;
  const h = Math.max(60, Number(heightCm) || 178);
  const w = Math.max(30, Number(weightKg) || 75);
  const waist = Math.max(30, Number(waistCm) || 82);
  const hips = Math.max(30, Number(hipsCm) || 98);

  const whr = Math.round((waist / Math.max(10, hips)) * 100) / 100;
  let whrStatus = 'Healthy / Low Risk';
  if (gender === 'male') {
    if (whr >= 1.00) whrStatus = 'Elevated Risk';
    else if (whr >= 0.90) whrStatus = 'Moderate Risk';
  } else {
    if (whr >= 0.90) whrStatus = 'Elevated Risk';
    else if (whr >= 0.85) whrStatus = 'Moderate Risk';
  }

  const whtr = Math.round((waist / h) * 100) / 100;
  let whtrStatus = 'Healthy / Optimal';
  if (whtr > 0.60) whtrStatus = 'Elevated Risk';
  else if (whtr > 0.50) whtrStatus = 'Moderate Risk';
  else if (whtr < 0.40) whtrStatus = 'Slender / Lean';

  const bmi = Math.round((w / Math.pow(h / 100, 2)) * 10) / 10;
  const fatMassKg = Math.round(w * (bodyFatPct / 100) * 10) / 10;
  const leanMassKg = Math.round((w - fatMassKg) * 10) / 10;

  return {
    whr,
    whrStatus,
    whtr,
    whtrStatus,
    bmi,
    fatMassKg,
    leanMassKg,
  };
}

/**
 * 6. Starting Load Proposer & Recalibration Engine
 */
export const BEGINNER_STANDARDS: Record<BiologicalSex, Record<string, number>> = {
  male: { squat: 0.75, bench: 0.50, deadlift: 1.00, press: 0.35, row: 0.55 },
  female: { squat: 0.50, bench: 0.30, deadlift: 0.75, press: 0.22, row: 0.35 },
};

export const LEVEL_MULTIPLIERS = {
  beginner: 1.0,
  novice: 1.25,
  intermediate: 1.55,
  advanced: 1.95,
};

export function startingLoadCeiling(
  bodyweightKg: number,
  sex: BiologicalSex,
  lift: string,
  level: keyof typeof LEVEL_MULTIPLIERS = 'beginner'
): { min: number; max: number } {
  const bw = Number(bodyweightKg) || 75;
  const key = lift.toLowerCase();
  const table = BEGINNER_STANDARDS[sex] || BEGINNER_STANDARDS.male;
  const std = table[key] !== undefined ? table[key] : 0.5;
  const mult = LEVEL_MULTIPLIERS[level] || 1.0;
  const minStd = bw * std * 0.40 * mult;
  const maxStd = bw * std * 0.65 * mult;
  return {
    min: Math.round(minStd * 2) / 2,
    max: Math.round(maxStd * 2) / 2,
  };
}

export function startingLoadPropose(
  bodyweightKg: number,
  sex: BiologicalSex,
  lift: string,
  priorExperience: boolean,
  level: keyof typeof LEVEL_MULTIPLIERS = 'beginner'
): number {
  const { min, max } = startingLoadCeiling(bodyweightKg, sex, lift, level);
  let load = priorExperience ? (min + max) / 2 : (min > 20 ? min : 20);
  load = Math.max(load, min);
  load = Math.min(load, max);
  return Math.round(load / 2.5) * 2.5;
}

export function recalibrateLoad(
  currentLoad: number,
  repsCompleted: number,
  prescribedReps: number,
  rpeEstimate: number
): number {
  const done = Number(repsCompleted) || 0;
  const target = Number(prescribedReps) || 8;
  const rpe = Number(rpeEstimate) || 7;
  let adj = 0;
  if (done < target) adj = -0.10;
  else if (rpe <= 6) adj = +0.10;
  else if (rpe >= 9.5) adj = -0.05;
  return Math.max(2.5, Math.round((currentLoad * (1 + adj)) / 2.5) * 2.5);
}

/**
 * 7. Ramanujan Elliptical Perimeter
 */
export function ramanujanEllipticalCircumference(widthCm: number, depthCm: number): number {
  const w = Number(widthCm) || 0;
  const d = Number(depthCm) || 0;
  if (w <= 0 || d <= 0) return 0;
  const a = w / 2;
  const b = d / 2;
  const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
  const c = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(Math.max(0, 4 - 3 * h))));
  return Math.round(c * 10) / 10;
}
