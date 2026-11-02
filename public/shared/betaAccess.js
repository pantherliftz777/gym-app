/**
 * FitFuel Closed Beta Access Control & Admin Approval - CommonJS / Universal Module
 */

const TOP_BETA_FEATURES = [
  "formCorrectionAi",
  "wearableSync",
  "mealPlanAi"
];

const BETA_FEATURE_CONFIG = {
  formCorrectionAi: {
    name: "AI Camera Form Checker",
    tagline: "Computer vision feedback on Squats, Deadlifts & Bench",
    description: "Pose estimation engine running locally on device to track bar path, hip depth, and back rounding.",
    maxSlots: 20,
    icon: "👁️",
    category: "Motion Biomechanics"
  },
  wearableSync: {
    name: "Apple Watch & Whoop Sync",
    tagline: "Real-time heart rate zone broadcast on gym cardio screens",
    description: "Direct Bluetooth Low Energy (BLE) and HealthKit integration to stream live heart rate and recovery metrics.",
    maxSlots: 20,
    icon: "⌚",
    category: "Sensors & BLE"
  },
  mealPlanAi: {
    name: "AI Grocery & Meal Prep Generator",
    tagline: "Instant high-protein grocery lists matched to your macros",
    description: "Generates weekly meal prep recipes matching exact gram targets with 1-click Instacart grocery export.",
    maxSlots: 20,
    icon: "🍲",
    category: "Macro Engine"
  }
};

function canAccessBetaFeature(status, isAdmin = false) {
  if (isAdmin) return true;
  return status === "approved";
}

const betaAccessModule = {
  TOP_BETA_FEATURES,
  BETA_FEATURE_CONFIG,
  canAccessBetaFeature
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = betaAccessModule;
}

if (typeof window !== 'undefined') {
  window.BETA_ACCESS = betaAccessModule;
}
