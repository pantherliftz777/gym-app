// Universal runtime module for GYM_FEATURES
const GYM_FEATURES = {
  // --- PRE-EXISTING PRODUCTION FEATURES (ALL AVAILABLE) ---
  workoutTracking: {
    id: "workoutTracking",
    name: "Live Workout Tracker & Logging",
    tagline: "Log sets, reps, and RPE with automated rest timers & progressive overload",
    category: "workout",
    description: "Real-time exercise logging with progressive overload metrics, PR tracking, and custom workout routines.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/workout",
    icon: "dumbbell"
  },
  exerciseLibrary: {
    id: "exerciseLibrary",
    name: "Exercise Library & Demonstrations",
    tagline: "1,300+ animated exercise movement guides with muscle & equipment filters",
    category: "workout",
    description: "Comprehensive exercise directory featuring high-definition demonstration animations, primary/secondary muscle targets, and equipment alternatives.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/exercises",
    icon: "book-open"
  },
  startingLoad: {
    id: "startingLoad",
    name: "Starting Load & 1RM Calculator",
    tagline: "Scientific 1RM estimation & warm-up pyramid sets using Brzycki & Epley equations",
    category: "workout",
    description: "Calculates precise starting weights and ramp-up sets for Barbell Squat, Bench Press, Deadlift, and Overhead Press.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/starting-load",
    icon: "calculator"
  },
  gymChallenges: {
    id: "gymChallenges",
    name: "Gym Challenges & Streaks",
    tagline: "30-day streak challenges and progressive consistency milestones",
    category: "workout",
    description: "Gamified workout consistency engine with milestone badges, weekly habit streaks, and goal-oriented programs.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/challenge",
    icon: "award"
  },
  foodLogging: {
    id: "foodLogging",
    name: "Daily Nutrition & Calorie Tracking",
    tagline: "Log meals, micronutrients, water intake, and daily macro targets",
    category: "nutrition",
    description: "Complete daily nutrition log tracking breakfast, lunch, dinner, snacks, and water balance with instant macro feedback.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/nutrition",
    icon: "utensils"
  },
  macroCalculator: {
    id: "macroCalculator",
    name: "Macro & Calorie Engine",
    tagline: "Tailored TDEE and macro splits for bulking, cutting, or maintenance",
    category: "nutrition",
    description: "Scientifically calibrated macronutrient and caloric target generator based on Mifflin-St Jeor equations.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/nutrition",
    icon: "pie-chart"
  },
  customFoods: {
    id: "customFoods",
    name: "Custom Foods & Recipe Database",
    tagline: "Create custom nutritional recipes and grocery barcode entries",
    category: "nutrition",
    description: "Save custom recipes, ingredients, and nutritional profiles directly into your local offline-first food database.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/my-foods",
    icon: "plus-circle"
  },
  aiCoach: {
    id: "aiCoach",
    name: "FitFuel AI Coach & Assistant",
    tagline: "Interactive 24/7 fitness advice, workout generation, and form tips",
    category: "workout",
    description: "Intelligent coaching assistant powered by sports medicine models for workout modifications, plateau busting, and recovery tips.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/ai-coach",
    icon: "bot"
  },
  progressTracking: {
    id: "progressTracking",
    name: "Body Weight & Progress Analytics",
    tagline: "Visual volume progression, weigh-in charts, and PR badges",
    category: "workout",
    description: "Interactive time-series charts displaying body weight trends, weekly training volume, and personal record milestones.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/tracking",
    icon: "trending-up"
  },
  bodyAnalysis: {
    id: "bodyAnalysis",
    name: "3D Anthropometric Body Scan",
    tagline: "Navy tape circumferences, body fat %, and lean mass analysis",
    category: "workout",
    description: "ISO 8559-1 anatomical circumferences, Ramanujan elliptical tape model, and U.S. Navy Hodgdon-Beckett body composition calculations.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/body-analysis",
    icon: "user-check"
  },
  gpsActivity: {
    id: "gpsActivity",
    name: "Outdoor GPS Activity Tracker",
    tagline: "Live run/walk mapping, split pace HUD, and elevation telemetry",
    category: "workout",
    description: "Real-time outdoor GPS route mapping, live pace telemetry, and calorie expenditure calculation for runs and walks.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/activity",
    icon: "map-pin"
  },
  memberPlans: {
    id: "memberPlans",
    name: "Gym Membership & Plans",
    tagline: "Personal, Pro, and Elite gym membership tier management",
    category: "membership",
    description: "Manage your gym membership subscription, billing preferences, and facility access permissions.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/profile",
    icon: "credit-card"
  },
  attendanceTracking: {
    id: "attendanceTracking",
    name: "Gym Attendance & Check-in History",
    tagline: "Track gym visit consistency, check-in history, and weekly streaks",
    category: "membership",
    description: "Automated turnstile check-in logs, monthly gym attendance records, and streak consistency analytics.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/profile",
    icon: "calendar-check"
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
    icon: "qrcode"
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
    icon: "calendar"
  },
  adminPortal: {
    id: "adminPortal",
    name: "Admin Operations & Member Resolution",
    tagline: "Front-desk turnstile monitor, user complaints, and beta approvals",
    category: "membership",
    description: "Dedicated operations dashboard for staff to manage facility turnstiles, resolve complaints, and review beta applications.",
    status: "available",
    badgeVariant: "available",
    actionRoute: "/app/admin",
    icon: "shield"
  },

  // --- CLOSED BETA FEATURES ---
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
    icon: "camera"
  },
  trainerChat: {
    id: "trainerChat",
    name: "Coach 1-on-1 Messaging & Booking",
    tagline: "Direct encrypted chat and private session bookings with personal trainers",
    category: "community",
    description: "Direct messaging, video form check submissions, and weekly check-in feedback from certified trainers.",
    status: "beta",
    badgeVariant: "beta",
    actionRoute: "/app/messages",
    icon: "message-square"
  },
  wearableSync: {
    id: "wearableSync",
    name: "Apple Watch & Whoop Sync",
    tagline: "Real-time heart rate zone broadcast on gym cardio screens",
    category: "hardware",
    description: "Direct Bluetooth Low Energy (BLE) and HealthKit integration to stream live heart rate and recovery metrics.",
    status: "coming-soon",
    badgeVariant: "coming-soon",
    actionRoute: "/app/wearables",
    technicalReason: "Apple HealthKit & Whoop API developer verification is currently in staging review.",
    estimatedArrival: "Q2 2026",
    icon: "watch"
  },
  mealPlanAi: {
    id: "mealPlanAi",
    name: "AI Grocery & Meal Prep Generator",
    tagline: "Instant high-protein grocery lists matched to your macros",
    category: "nutrition",
    description: "Generates weekly meal prep recipes matching exact gram targets with 1-click Instacart grocery export.",
    status: "coming-soon",
    badgeVariant: "coming-soon",
    actionRoute: "/app/meal-prep",
    technicalReason: "Local dietary constraint recommendation model undergoing accuracy verification.",
    estimatedArrival: "Q3 2026",
    icon: "shopping-bag"
  },

  // --- UPCOMING (COMING SOON) FEATURES WITH INTERACTIVE SANDBOXES ---
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
    actionRoute: "/app/body-scan",
    icon: "box"
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
    actionRoute: "/app/crowd-meter",
    icon: "users"
  }
};

const GYM_SHOWCASE_KEYS = [
  "workoutTracking",
  "classBooking",
  "qrEntry",
  "macroCalculator",
  "formCorrectionAi",
  "trainerChat",
  "wearableSync",
  "mealPlanAi",
  "bodyScan3D",
  "gymCrowdMeter"
];

const GYM_SHOWCASE_FEATURES = Object.fromEntries(
  GYM_SHOWCASE_KEYS.map(k => [k, GYM_FEATURES[k]])
);

function canUseGymFeature(featureId) {
  const feat = GYM_FEATURES[featureId];
  if (!feat) return { ok: false, reason: "Unknown feature." };
  if (feat.status === "coming-soon") {
    return { ok: false, reason: feat.technicalReason || "This capability is currently in active development." };
  }
  return { ok: true };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GYM_FEATURES,
    GYM_SHOWCASE_KEYS,
    GYM_SHOWCASE_FEATURES,
    canUseGymFeature
  };
}

if (typeof window !== 'undefined') {
  window.GYM_FEATURES = GYM_FEATURES;
  window.GYM_SHOWCASE_KEYS = GYM_SHOWCASE_KEYS;
  window.GYM_SHOWCASE_FEATURES = GYM_SHOWCASE_FEATURES;
  window.canUseGymFeature = canUseGymFeature;
}
