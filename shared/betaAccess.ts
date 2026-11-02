/**
 * FitFuel Closed Beta Access Control & Admin Approval Types & Schemas
 */

export type BetaAccessStatus = "none" | "pending" | "approved" | "rejected";

export interface BetaApplication {
  id: string;
  userId: string;
  featureId: string;
  status: BetaAccessStatus;
  reason: string;
  device: string;
  appliedAt: string;
  approvedAt: string | null;
}

export interface BetaStats {
  totalApplicants: number;
  approvedTesters: number;
  remainingSlots: number;
  maxSlots: number;
}

export interface BetaStatusResponse {
  ok: boolean;
  status: BetaAccessStatus;
  userId: string;
  featureId: string;
  application: BetaApplication | null;
  canAccess: boolean;
  featureName?: string;
  error?: string;
}

export interface BetaApplyPayload {
  userId: string;
  featureId: string;
  device: string;
  reason: string;
}

export interface BetaAdminActionPayload {
  id: string;
  action: "approve" | "decline" | "revoke";
}

export const TOP_BETA_FEATURES = [
  "formCorrectionAi",
  "wearableSync",
  "mealPlanAi"
] as const;

export type TopBetaFeatureId = typeof TOP_BETA_FEATURES[number];

export const BETA_FEATURE_CONFIG: Record<
  TopBetaFeatureId,
  {
    name: string;
    tagline: string;
    description: string;
    maxSlots: number;
    icon: string;
    category: string;
  }
> = {
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

/**
 * Check if user has permission to access a beta feature
 */
export function canAccessBetaFeature(
  status: BetaAccessStatus | undefined | null,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) return true;
  return status === "approved";
}
