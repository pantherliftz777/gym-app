export type FeatureStatus = "available" | "beta" | "coming-soon";

export interface FeatureDefinition {
  id: string;
  name: string;
  tagline: string;
  category: "workout" | "nutrition" | "membership" | "hardware" | "community";
  description: string;
  status: FeatureStatus;
  badgeVariant: "available" | "beta" | "coming-soon";
  technicalReason?: string;
  estimatedArrival?: string;
  actionRoute?: string;
}

export const GYM_FEATURES: Record<string, FeatureDefinition> = {
  // --- LIVE PRODUCTION FEATURES ---
  workoutTracking: {
    id: "workoutTracking",
    name: "Live Workout Tracker",
    tagline: "Log sets, reps, and RPE with automated rest timers",
    category: "workout",
    description: "Real-time exercise logging with progressive overload metrics, PR tracking, and custom workout routines.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/workout",
  },
  classBooking: {
    id: "classBooking",
    name: "Class Schedule & Booking",
    tagline: "Reserve spots in Spin, HIIT, Yoga, and CrossFit sessions",
    category: "membership",
    description: "Browse calendar schedules, view instructor bios, and reserve your spot with instant calendar sync.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/classes",
  },
  qrEntry: {
    id: "qrEntry",
    name: "Contactless QR Turnstile Entry",
    tagline: "Touchless gate access via your phone screen",
    category: "membership",
    description: "Dynamic cryptographic time-based QR code for instant, badge-free gym check-in at front desk turnstiles.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/pass",
  },
  macroCalculator: {
    id: "macroCalculator",
    name: "Macro & Calorie Engine",
    tagline: "Tailored TDEE and macro splits for bulking or cutting",
    category: "nutrition",
    description: "Scientifically calibrated macronutrient and caloric target generator based on Mifflin-St Jeor equations.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/nutrition",
  },

  // --- BETA FEATURES ---
  formCorrectionAi: {
    id: "formCorrectionAi",
    name: "AI Camera Form Checker",
    tagline: "Computer vision feedback on Squats, Deadlifts & Bench",
    category: "workout",
    description: "Pose estimation engine running locally on device to track bar path, hip depth, and back rounding.",
    status: "beta",
    badgeVariant: "beta",
    actionRoute: "/app/form-checker",
    technicalReason: "Currently calibrated for Squats and Deadlifts. Bench press angle calibration is in public beta.",
  },
  trainerChat: {
    id: "trainerChat",
    name: "Coach 1-on-1 Messaging",
    tagline: "Direct encrypted chat with your assigned personal trainer",
    category: "community",
    description: "Direct messaging, video form check submissions, and weekly check-in feedback from certified trainers.",
    status: "beta",
    badgeVariant: "beta",
    actionRoute: "/app/messages",
  },

  // --- UPCOMING (COMING SOON) FEATURES WITH INTERACTIVE SANDBOXES ---
  wearableSync: {
    id: "wearableSync",
    name: "Apple Watch & Whoop Sync",
    tagline: "Real-time heart rate zone broadcast on gym cardio screens",
    category: "hardware",
    description: "Direct Bluetooth Low Energy (BLE) and HealthKit integration to stream live heart rate and recovery metrics.",
    status: "coming-soon",
    badgeVariant: "coming-soon",
    technicalReason: "Apple HealthKit & Whoop API developer verification is currently in staging review.",
    estimatedArrival: "Q2 2026",
  },
  mealPlanAi: {
    id: "mealPlanAi",
    name: "AI Grocery & Meal Prep Generator",
    tagline: "Instant high-protein grocery lists matched to your macros",
    category: "nutrition",
    description: "Generates weekly meal prep recipes matching exact gram targets with 1-click Instacart grocery export.",
    status: "coming-soon",
    badgeVariant: "coming-soon",
    technicalReason: "Local dietary constraint recommendation model undergoing accuracy verification.",
    estimatedArrival: "Q3 2026",
  },
  bodyScan3D: {
    id: "bodyScan3D",
    name: "3D Body Composition Mesh",
    tagline: "Mobile LiDAR scan for visceral fat & muscle circumference",
    category: "workout",
    description: "Transforms a 10-second turntable video into a millimeter-accurate 3D body avatar with tape measurement comparisons.",
    status: "coming-soon",
    badgeVariant: "coming-soon",
    technicalReason: "Requires WebGPU NeRF avatar reconstruction engine currently in development.",
    estimatedArrival: "Q3 2026",
  },
  gymCrowdMeter: {
    id: "gymCrowdMeter",
    name: "Live Gym Occupancy & Wait Meter",
    tagline: "See how busy free weights and squat racks are in real time",
    category: "membership",
    description: "Privacy-preserving BLE beacon heatmaps showing current gym floor traffic and equipment availability.",
    status: "coming-soon",
    badgeVariant: "coming-soon",
    technicalReason: "Hardware optical turnstile sensors are being deployed at gym locations.",
    estimatedArrival: "Q2 2026",
  },
};

/**
 * Honest runtime capability checker
 */
export function canUseGymFeature(featureId: string): { ok: boolean; reason?: string } {
  const feat = GYM_FEATURES[featureId];
  if (!feat) return { ok: false, reason: "Unknown feature." };
  if (feat.status === "coming-soon") {
    return { ok: false, reason: feat.technicalReason ?? "This capability is currently in active development." };
  }
  return { ok: true };
}
